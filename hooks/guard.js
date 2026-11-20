#!/usr/bin/env node
// old-compass — PreToolUse: keeps the agent's hands off the user's code unless the
// code level is "write".
//
// What gets through (so planning tools like Superpowers still work):
//   - documentation files (.md, .txt, …) — plans, designs, notes
//   - but only if their fenced code blocks stay short (signatures, not
//     implementations), see MAX_PLAN_CODE_LINES
// What always gets blocked, in every code level:
//   - writing anything that looks like a real secret (keys, tokens, passwords)
// What gets blocked unless the code level is "write":
//   - Write/Edit/MultiEdit/NotebookEdit/apply_patch on anything else
//   - obvious shell writes to code files (>, >>, tee, sed -i, perl -i)
//
// Exit code 2 blocks the tool call and hands stderr to the model; Claude Code
// and Codex both honour it.
const fs = require('fs');
const path = require('path');
const { readState, readStdin, projectDir } = require('./lib');
const { findSecret } = require('./secrets');

const FILE_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit', 'apply_patch']);
const SHELL_TOOLS = new Set(['Bash', 'shell', 'local_shell']);

// Longest fenced code block allowed in a plan before it counts as "finished code".
const MAX_PLAN_CODE_LINES = 5;
// Fence languages that are never real code and are therefore not limited.
const FREE_FENCES = new Set(['text', 'txt', 'plaintext', 'pseudo', 'pseudocode', 'mermaid']);

const DOC_EXT = /\.(md|mdx|markdown|txt|rst|adoc)$/i;
const CODE_EXT = /\.(c|cc|cpp|cxx|h|hpp|cs|go|rs|java|kt|kts|scala|swift|m|mm|py|pyi|rb|php|pl|lua|r|jl|dart|ex|exs|erl|hs|ml|clj|js|jsx|mjs|cjs|ts|tsx|vue|svelte|astro|html|htm|css|scss|sass|less|sql|sh|bash|zsh|fish|ps1|nim|zig|v|sol|gd|toml|ya?ml|json|xml|gradle|tf|ipynb)$/i;
const CODE_NAMES = /(^|\/)(Makefile|Dockerfile|CMakeLists\.txt|Justfile)$/;

const unquote = (p) => p.replace(/^['"]|['"]$/g, '');
const isDocFile = (p) => DOC_EXT.test(unquote(p));
const isCodeFile = (p) => CODE_EXT.test(unquote(p)) || CODE_NAMES.test(unquote(p));

// Returns the first fenced block in `text` that is real code and longer than
// the limit, as { lang, lines }, or null when the text is a clean plan.
function oversizedCodeBlock(text) {
  const fence = /^([ \t]*)(```|~~~)[ \t]*([\w+-]*)[^\n]*\n([\s\S]*?)^\1\2[ \t]*$/gm;
  for (const m of (text || '').matchAll(fence)) {
    const lang = (m[3] || '').toLowerCase();
    if (FREE_FENCES.has(lang)) continue;
    const lines = m[4].split('\n').filter((l) => l.trim()).length;
    if (lines > MAX_PLAN_CODE_LINES) return { lang: lang || 'untagged', lines };
  }
  return null;
}

// Rebuilds what a Markdown file would look like after an Edit/MultiEdit, so
// the check sees whole code blocks even when an edit only touches part of one.
function contentAfter(tool, args, cwd) {
  if (tool === 'Write') return args.content || '';
  let text = '';
  try { text = fs.readFileSync(path.resolve(cwd, args.file_path), 'utf8'); } catch { /* new file */ }
  const edits = tool === 'MultiEdit' ? args.edits || [] : [args];
  for (const e of edits) {
    if (e.old_string == null) continue;
    text = e.replace_all ? text.split(e.old_string).join(e.new_string) : text.replace(e.old_string, () => e.new_string);
  }
  return text;
}

// Codex patches: "*** Add File: x", "*** Update File: x", "*** Move to: x".
function parsePatch(patch) {
  const targets = [...patch.matchAll(/^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+)$/gm)].map((m) => m[1].trim());
  const added = patch.split('\n').filter((l) => l.startsWith('+')).map((l) => l.slice(1)).join('\n');
  return { targets, added };
}

function patchVerdict(patch) {
  const { targets, added } = parsePatch(patch);
  const forbidden = targets.find((t) => !isDocFile(t));
  if (forbidden) return { target: forbidden };
  const block = oversizedCodeBlock(added);
  return block ? { target: targets[0] || 'a plan', block } : null;
}

// Returns the code file a shell command would write to, or null. Catches the
// obvious routes; the rules in the prompt tell the agent not to dodge the rest.
function shellWriteTarget(cmd) {
  if (!cmd) return null;
  for (const m of cmd.matchAll(/(?:^|[^0-9&<>=])>{1,2}\|?\s*([^\s|;&<>()]+)/g)) {
    if (m[1] !== '/dev/null' && isCodeFile(m[1])) return m[1];
  }
  for (const m of cmd.matchAll(/\btee\s+(?:-\w+\s+)*([^\s|;&]+)/g)) {
    if (isCodeFile(m[1])) return m[1];
  }
  for (const m of cmd.matchAll(/\b(?:sed|perl)\s+[^|;&]*?-i\S*[^|;&]*?\s([^\s|;&]+)\s*(?:$|[|;&])/g)) {
    if (isCodeFile(m[1])) return m[1];
  }
  return null;
}

// The text a tool call would ADD to the disk. Only new text counts, so editing
// a file that already holds a secret (say, someone else's .env) isn't blocked
// for what was already there. Shell commands count only when they write.
function newText(tool, args) {
  if (tool === 'Write') return args.content || '';
  if (tool === 'Edit') return args.new_string || '';
  if (tool === 'MultiEdit') return (args.edits || []).map((e) => e.new_string || '').join('\n');
  const all = Object.values(args).flat().filter((v) => typeof v === 'string').join('\n');
  if (tool === 'apply_patch' || all.includes('*** Begin Patch')) return parsePatch(all).added;
  if (SHELL_TOOLS.has(tool) && /(^|[^0-9&<>=])>{1,2}[^&]|\btee\b|\bsed\s[^|;&]*-i/.test(all)) return all;
  return '';
}

// Decides one tool call. Returns null (allow) or { target, block? } (deny).
function verdict(input, state) {
  if (!state.enabled) return null;
  const tool = input.tool_name || '';
  const args = input.tool_input || {};
  const cwd = input.cwd || projectDir(input);

  // Secrets are checked first and in every code level, `write` included:
  // the agent never puts a real password or key into a file.
  const secret = findSecret(newText(tool, args));
  if (secret) return { target: args.file_path || 'a file', secret };
  if (state.code === 'write') return null;

  if (SHELL_TOOLS.has(tool)) {
    const cmd = Array.isArray(args.command) ? args.command.join(' ') : String(args.command || '');
    if (cmd.includes('*** Begin Patch')) return patchVerdict(cmd);
    const target = shellWriteTarget(cmd);
    return target ? { target } : null;
  }
  if (!FILE_TOOLS.has(tool)) return null;

  if (tool === 'apply_patch') {
    const patch = Object.values(args).flat().filter((v) => typeof v === 'string').join('\n');
    return patchVerdict(patch);
  }

  const file = args.file_path || args.notebook_path || '';
  if (tool === 'NotebookEdit' || !isDocFile(file)) return { target: file || 'a file' };
  const block = oversizedCodeBlock(contentAfter(tool, args, cwd));
  return block ? { target: file, block } : null;
}

function message(v, state) {
  const drunk = state.persona === 'drunk';
  if (v.secret) {
    // Name the kind of secret only, never its value: this text goes back to the model.
    return [
      drunk
        ? 'A SECRET IN A FILE?! Do you want it on the front page, recruit?'
        : 'Hold on, kiddo. That would write a secret into a file.',
      `Blocked by Old Compass (${v.target}): it contains a ${v.secret}. This applies in every mode, /compass write included.`,
      'Do not repeat the value anywhere. Use a placeholder such as process.env.NAME or <YOUR_KEY> instead, and tell the user where the real value belongs (environment variable, .env kept out of git, secret manager) so they put it there themselves.',
    ].join('\n');
  }
  if (v.block) {
    return [
      drunk
        ? `A PLAN, NOT A NOVEL! ${v.block.lines} lines of ${v.block.lang}? The recruit writes that code, not you.`
        : `That plan has a ${v.block.lines}-line ${v.block.lang} block in it, kiddo. Plans describe, the user implements.`,
      `Blocked by Old Compass (${v.target}): fenced code blocks in plans may have at most ${MAX_PLAN_CODE_LINES} lines.`,
      'Rewrite the plan with steps, file paths, signatures, test descriptions and pseudocode (```pseudo) instead of implementations. After the plan is written, stop: the user implements it with /compass-next.',
    ].join('\n');
  }
  const how = state.code === 'pseudo'
    ? 'Give the user pseudocode with file:line instead.'
    : 'Show the code in the chat with file:line and let the user type it in.';
  return [
    drunk ? 'HANDS OFF THE KEYBOARD! The recruit types the code, not you.' : 'Grandpa doesn\'t write your code, kiddo. You do.',
    `Blocked by Old Compass (${v.target}, code level: ${state.code}). Do not try another way to write this file. ${how}`,
    'Plans and notes as Markdown are fine. The user can allow code edits with /compass write.',
  ].join('\n');
}

// Entry point. hooks.json calls main() explicitly: it loads this file with
// `node -e "require(...)"`, where require.main is not this module.
function main() {
  return readStdin().then((input) => {
    const v = verdict(input, readState(projectDir(input)));
    if (!v) process.exit(0);
    process.stderr.write(message(v, readState(projectDir(input))));
    process.exit(2);
  });
}

if (require.main === module) main();

module.exports = { main, verdict, shellWriteTarget, oversizedCodeBlock, isCodeFile, isDocFile, MAX_PLAN_CODE_LINES };
