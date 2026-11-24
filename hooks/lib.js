// old-compass — shared state and hook I/O for Claude Code and Codex.
//
// State file (one per machine, ~/.old-compass/state.json by default):
//   {
//     "default":  { "enabled": true, "persona": "grandpa", "code": "teach", "level": "medium" },
//     "projects": { "/abs/path/to/repo": { "persona": "drunk" } },
//     "tested":   { "/abs/path/to/repo": { "at": 1700000000000, "fingerprint": "<sha1>" } }
//   }
// A project's entry overrides the default, so drunk mode in a hobby repo does
// not leak into work repos. `/compass global …` edits the default instead.
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Codex sets PLUGIN_DATA for plugin hooks; Claude Code does not.
const isCodex = Boolean(process.env.PLUGIN_DATA);
const stateDir = process.env.OLD_COMPASS_HOME
  || (isCodex ? process.env.PLUGIN_DATA : path.join(os.homedir(), '.old-compass'));
const statePath = path.join(stateDir, 'state.json');

const DEFAULTS = { enabled: true, persona: 'grandpa', code: 'teach', level: 'medium' };

// The repo the agent works in. Claude Code exports CLAUDE_PROJECT_DIR to hooks;
// every host passes cwd in the hook input.
function projectDir(input = {}) {
  return path.resolve(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd());
}

function readFile() {
  try {
    const raw = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    // v0.0.1 stored a flat { enabled, persona, code }: treat it as the default.
    if (!raw.default && !raw.projects) return { default: raw, projects: {}, tested: {} };
    return { default: raw.default || {}, projects: raw.projects || {}, tested: raw.tested || {} };
  } catch {
    return { default: {}, projects: {}, tested: {} };
  }
}

// Effective mode for one project: built-in defaults < global default < project.
function readState(dir) {
  const file = readFile();
  return { ...DEFAULTS, ...file.default, ...(dir ? file.projects[dir] : {}) };
}

// Saves a mode either for one project or, with dir = null, as the global default.
function writeState(dir, state) {
  const file = readFile();
  const { enabled, persona, code, level } = state;
  if (dir) file.projects[dir] = { enabled, persona, code, level };
  else file.default = { enabled, persona, code, level };
  save(file);
}

function save(file) {
  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(file, null, 2));
}

// A hash of the project's code as it is right now: tracked changes plus the
// content of untracked files. Two equal fingerprints mean "same code". Returns
// null outside a git repo. Staging does not change it; editing a file does.
function fingerprint(dir) {
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
  try {
    const hash = crypto.createHash('sha1');
    try { hash.update(git('diff', 'HEAD')); } catch { /* repo without commits yet */ }
    for (const f of git('ls-files', '--others', '--exclude-standard', '-z').split('\0').filter(Boolean)) {
      hash.update(f);
      try { hash.update(fs.readFileSync(path.join(dir, f))); } catch { /* vanished or unreadable */ }
    }
    return hash.digest('hex');
  } catch {
    return null;
  }
}

// "The user said the tests passed": when, and on which code.
function readTested(dir) {
  return readFile().tested[dir] || null;
}

function writeTested(dir) {
  const file = readFile();
  file.tested[dir] = { at: Date.now(), fingerprint: fingerprint(dir) };
  save(file);
}

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    if (process.stdin.isTTY) return resolve({});
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => { data += c; });
    process.stdin.on('end', () => {
      // Some shells prepend a UTF-8 BOM when piping, which breaks JSON.parse.
      try { resolve(JSON.parse(data.replace(/^﻿/, '') || '{}')); } catch { resolve({}); }
    });
  });
}

function emit(obj) {
  process.stdout.write(JSON.stringify(obj));
}

// Hands text to the model as hidden context for this hook event.
function addContext(event, text) {
  if (!text) return emit({});
  emit({ hookSpecificOutput: { hookEventName: event, additionalContext: text } });
}

module.exports = { readState, writeState, readTested, writeTested, fingerprint, readStdin, emit, addContext, projectDir, statePath, isCodex };
