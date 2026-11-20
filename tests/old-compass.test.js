// Old Compass tests for the hooks, the guard, checker detection and the eval graders.
// No API key needed: the hooks are run as real processes with a throwaway
// OLD_COMPASS_HOME, so they never touch your own ~/.old-compass.
const test = require('node:test');
const assert = require('node:assert');
const { execFileSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { parse } = require('../hooks/prompt');
const { verdict, shellWriteTarget, oversizedCodeBlock } = require('../hooks/guard');
const { detectCheckers } = require('../hooks/linters');
const { CHECKS } = require('../evals/checks');

const root = path.join(__dirname, '..');

// The command hooks.json registers for a hook file, e.g. 'guard.js'.
function hookCommand(file) {
  const all = Object.values(require('../hooks/hooks.json').hooks).flat().flatMap((h) => h.hooks);
  const hook = all.find((h) => h.command.includes(`hooks/${file}`));
  assert.ok(hook, `no hook registered for ${file}`);
  return hook.command;
}
const base = { enabled: true, persona: 'grandpa', code: 'teach' };
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'old-compass-'));

test('mode switching', () => {
  assert.equal(parse('fix my bug', base), null);
  assert.equal(parse('/compass-review', base), null);
  assert.deepEqual(parse('/compass drunk show', base), { state: { ...base, persona: 'drunk', code: 'show' }, global: false, unknown: [] });
  assert.deepEqual(parse('/compass code pseudo', base).state, { ...base, code: 'pseudo' });
  assert.deepEqual(parse('/compass grandpa', { ...base, persona: 'drunk' }).state, base);
  assert.deepEqual(parse('$compass sober', { ...base, persona: 'drunk' }).state, base);
  assert.equal(parse('/compass global drunk', base).global, true);
  assert.deepEqual(parse('/old-compass:compass drunk', base).state, { ...base, persona: 'drunk' });
  assert.deepEqual(parse('$old-compass:compass show', base).state, { ...base, code: 'show' });
  assert.equal(parse('/old-compass:compass-review', base), null);
});

test('typos fail loud and change nothing', () => {
  const { describeUnknown } = require('../hooks/prompt');
  assert.deepEqual(parse('/compass shwo', base).unknown, ['shwo']);
  assert.deepEqual(parse('/compass drunk shwo', base).unknown, ['shwo']);
  assert.deepEqual(parse('/compass drunk show', base).unknown, []);
  const note = describeUnknown(['shwo', 'banana']);
  assert.match(note, /shwo/);
  assert.match(note, /did you mean `show`/);
  assert.match(note, /banana/);
  assert.match(note, /Nothing was changed/);

  // End to end: the mode stays as it was, and the agent is told about it.
  const home = tmp();
  const repo = tmp();
  const env = { ...process.env, OLD_COMPASS_HOME: home, CLAUDE_PROJECT_DIR: '', CLAUDE_PLUGIN_ROOT: root };
  const run = (prompt) => spawnSync(hookCommand('prompt.js'), { shell: true, env, input: JSON.stringify({ cwd: repo, prompt }), encoding: 'utf8' });
  run('/compass drunk');
  const out = JSON.parse(run('/compass sober shwo').stdout).hookSpecificOutput.additionalContext;
  assert.match(out, /did you mean `show`/);
  assert.match(out, /persona: drunk_grandpa/, 'persona must not change when a word is unknown');
  assert.equal(parse('/compass off', base).state.enabled, false);
  assert.equal(parse('stop compass', base).state.enabled, false);
  assert.equal(parse('/compass', { ...base, enabled: false }).state.enabled, true);
});

test('code edits are blocked unless write', () => {
  const edit = { tool_name: 'Edit', tool_input: { file_path: 'src/a.ts', old_string: 'a', new_string: 'b' } };
  assert.ok(verdict(edit, base));
  assert.ok(verdict({ tool_name: 'NotebookEdit', tool_input: { notebook_path: 'n.ipynb' } }, base));
  assert.equal(verdict(edit, { ...base, code: 'write' }), null);
  assert.equal(verdict(edit, { ...base, enabled: false }), null);
  assert.equal(verdict({ tool_name: 'Read', tool_input: { file_path: 'a.ts' } }, base), null);
});

test('plans in Markdown pass, plans with implementations do not', () => {
  const plan = '# Login\n\n- [ ] Add route in `src/auth.js`\n\n```js\nfunction login(req, res) {}\n```\n\n```pseudo\nif password ok\n  start session\n  redirect\nelse\n  show error\n  log attempt\n```\n';
  assert.equal(verdict({ tool_name: 'Write', tool_input: { file_path: 'docs/plans/login.md', content: plan } }, base), null);

  const impl = '# Login\n\n```js\nconst bcrypt = require("bcrypt");\nasync function login(req, res) {\n  const user = await db.find(req.body.email);\n  if (!user) return res.status(401).end();\n  const ok = await bcrypt.compare(req.body.password, user.hash);\n  res.json({ ok });\n}\n```\n';
  const v = verdict({ tool_name: 'Write', tool_input: { file_path: 'docs/plans/login.md', content: impl } }, base);
  assert.equal(v.block.lang, 'js');

  // Edit rebuilds the whole file, so growing an existing block is caught too.
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'plan.md'), '```py\na = 1\n```\n');
  const grow = { tool_name: 'Edit', cwd: dir, tool_input: { file_path: 'plan.md', old_string: 'a = 1', new_string: 'a = 1\nb = 2\nc = 3\nd = 4\ne = 5\nf = 6' } };
  assert.ok(verdict(grow, base).block);
  // Ticking off a task is fine.
  fs.writeFileSync(path.join(dir, 'plan.md'), '- [ ] step one\n');
  assert.equal(verdict({ tool_name: 'Edit', cwd: dir, tool_input: { file_path: 'plan.md', old_string: '- [ ] step one', new_string: '- [x] step one' } }, base), null);
});

test('Codex patches: Markdown ok, code blocked', () => {
  const md = { tool_name: 'apply_patch', tool_input: { input: '*** Begin Patch\n*** Add File: docs/plan.md\n+- [ ] step\n*** End Patch' } };
  assert.equal(verdict(md, base), null);
  const code = { tool_name: 'apply_patch', tool_input: { input: '*** Begin Patch\n*** Update File: src/app.py\n+x = 1\n*** End Patch' } };
  assert.equal(verdict(code, base).target, 'src/app.py');
  const viaShell = { tool_name: 'shell', tool_input: { command: ['apply_patch', '*** Begin Patch\n*** Update File: main.go\n+x\n*** End Patch'] } };
  assert.equal(verdict(viaShell, base).target, 'main.go');
});

test('shell writes to code files are caught', () => {
  assert.equal(shellWriteTarget('echo hi > src/app.py'), 'src/app.py');
  assert.equal(shellWriteTarget('cat <<EOF >> main.go'), 'main.go');
  assert.equal(shellWriteTarget('echo x | tee -a index.js'), 'index.js');
  assert.equal(shellWriteTarget("sed -i 's/a/b/' lib/x.rs"), 'lib/x.rs');
  assert.equal(shellWriteTarget('npm test > /dev/null 2>&1'), null);
  assert.equal(shellWriteTarget('ls > notes.txt'), null);
  assert.equal(shellWriteTarget('git diff'), null);
  assert.equal(shellWriteTarget('[ $a -gt 3 ] && echo ok'), null);
});

test('secrets are never written, in any mode', () => {
  const { findSecret } = require('../hooks/secrets');
  // Fake keys, assembled at runtime so this file itself trips no scanner.
  const aws = 'AKIA' + 'ABCDEFGHIJKLMNOP';
  const gh = 'ghp_' + 'a'.repeat(36);
  assert.equal(findSecret(`key = "${aws}"`), 'AWS access key');
  assert.equal(findSecret(gh), 'GitHub token');
  assert.equal(findSecret('-----BEGIN RSA PRIVATE KEY-----'), 'private key');
  assert.equal(findSecret('password: "hunter2-real"'), 'hardcoded password');
  assert.equal(findSecret('postgres://app:s3cr3tpw@db:5432/x'), 'URL with a password in it');
  // Placeholders are fine.
  for (const ok of ['password = process.env.DB_PASSWORD', 'password: "<YOUR_PASSWORD>"', 'apiKey: "changeme"',
    'token = "${TOKEN}"', 'postgres://app:${PW}@db/x', 'const user = "jane@example.com"']) {
    assert.equal(findSecret(ok), null, ok);
  }

  const write = { tool_name: 'Write', tool_input: { file_path: 'src/db.js', content: 'password: "hunter2-real"' } };
  for (const code of ['teach', 'show', 'write']) assert.ok(verdict(write, { ...base, code }).secret, code);
  assert.equal(verdict(write, { ...base, enabled: false }), null);
  // .md plans and notes get no exception.
  assert.ok(verdict({ tool_name: 'Write', tool_input: { file_path: 'notes.md', content: gh } }, base).secret);
  // Editing next to an existing secret is fine in write mode; only new text counts.
  assert.equal(verdict({ tool_name: 'Edit', tool_input: { file_path: 'a.js', old_string: 'x', new_string: 'y' } }, { ...base, code: 'write' }), null);
  assert.ok(verdict({ tool_name: 'Bash', tool_input: { command: `echo "TOKEN=${gh}" >> .env` } }, { ...base, code: 'write' }).secret);
  assert.equal(verdict({ tool_name: 'Bash', tool_input: { command: 'git log --oneline' } }, { ...base, code: 'write' }), null);
});

test('secrets with prefixes, camelCase and .env style are caught', () => {
  const { findSecret } = require('../hooks/secrets');
  // The keyword inside a longer name: `_` and camelCase count as a boundary.
  for (const text of [
    'DB_PASSWORD = "hunter2-real"',
    '"MY_API_KEY": "abcd1234efgh"',
    "MY_API_KEY: 'abcd1234efgh'",
    'const dbPassword = "hunter2-real";',
    'DB_PASSWORD="hunter2-real"',
    // .env lines, unquoted
    'DB_PASSWORD=hunter2real',
    'export STRIPE_SECRET=abc123def456',
    '  GITHUB_TOKEN = abc123def456ghi',
  ]) assert.ok(findSecret(text), `missed: ${text}`);

  // Written through the shell, in every code level.
  const write = { ...base, code: 'write' };
  for (const command of [
    'echo "DB_PASSWORD=hunter2real" >> .env',
    "printf 'API_KEY=abc123def456\\n' > .env.local",
  ]) assert.ok(verdict({ tool_name: 'Bash', tool_input: { command } }, write).secret, `missed: ${command}`);
  assert.equal(verdict({ tool_name: 'Bash', tool_input: { command: 'echo "DB_PASSWORD=${DB_PASSWORD}" > .env' } }, write), null);

  for (const text of [
    // keyword glued to other letters or digits is a different word
    'mypassword2 = "hunter2-real"',
    'PASSWORD_HASH = "abcdef123456"',
    // references, not values
    'const password = getPassword();',
    'DB_PASSWORD=${DB_PASSWORD}',
    'DB_PASSWORD=$DB_PASSWORD',
    'PASSWORD = settings.DB_PASSWORD',
    'DB_PASSWORD=changeme',
    // PWD is the working directory in a shell, not a password
    'PWD=/home/user/project',
  ]) assert.equal(findSecret(text), null, `false alarm: ${text}`);
});

test('block messages never contain the secret', () => {
  const gh = 'ghp_' + 'b'.repeat(36);
  const r = spawnSync(hookCommand('guard.js'), {
    shell: true,
    env: { ...process.env, OLD_COMPASS_HOME: tmp(), CLAUDE_PROJECT_DIR: '', CLAUDE_PLUGIN_ROOT: root },
    input: JSON.stringify({ cwd: tmp(), tool_name: 'Write', tool_input: { file_path: 'x.js', content: `t = "${gh}"` } }),
    encoding: 'utf8',
  });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /GitHub token/);
  assert.ok(!r.stderr.includes('bbbbbb'));
});

test('checker detection', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ devDependencies: { eslint: '9', typescript: '5' }, scripts: { test: 'node --test' } }));
  fs.writeFileSync(path.join(dir, 'tsconfig.json'), '{}');
  fs.writeFileSync(path.join(dir, 'Cargo.toml'), '');
  const names = detectCheckers(dir).map((c) => c.name);
  for (const n of ['ESLint', 'TypeScript', 'tests', 'Clippy']) assert.ok(names.includes(n), n);
  assert.deepEqual(detectCheckers(tmp()).filter((c) => !['Semgrep', 'ShellCheck'].includes(c.name)), []);
});

test('hooks end to end, per project', () => {
  const home = tmp();
  const repoA = tmp();
  const repoB = tmp();
  const env = { ...process.env, OLD_COMPASS_HOME: home, CLAUDE_PROJECT_DIR: '' };
  // Run each hook exactly as the agent does: the command string from
  // hooks.json, through a shell, with the plugin root in the environment.
  const run = (f, input) => spawnSync(hookCommand(f), { shell: true, env: { ...env, CLAUDE_PLUGIN_ROOT: root }, input: JSON.stringify(input), encoding: 'utf8' });
  const ctx = (r) => JSON.parse(r.stdout).hookSpecificOutput.additionalContext;

  assert.match(ctx(run('session-start.js', { cwd: repoA })), /persona: grandpa, code level: teach/);

  assert.match(ctx(run('prompt.js', { cwd: repoA, prompt: '/compass drunk show' })), /drunk_grandpa, code level: show/);
  assert.match(ctx(run('session-start.js', { cwd: repoB })), /persona: grandpa/, 'drunk must not leak into another repo');

  const blocked = run('guard.js', { cwd: repoA, tool_name: 'Write', tool_input: { file_path: 'a.py', content: 'x' } });
  assert.equal(blocked.status, 2);
  assert.match(blocked.stderr, /HANDS OFF/);
  assert.equal(run('guard.js', { cwd: repoA, tool_name: 'Write', tool_input: { file_path: 'notes.md', content: 'hi' } }).status, 0);

  run('prompt.js', { cwd: repoA, prompt: '/compass write' });
  assert.equal(run('guard.js', { cwd: repoA, tool_name: 'Write', tool_input: { file_path: 'a.py' } }).status, 0);

  run('prompt.js', { cwd: repoB, prompt: '/compass global pseudo' });
  assert.match(ctx(run('session-start.js', { cwd: tmp() })), /code level: pseudo/);

  run('prompt.js', { cwd: repoA, prompt: '/compass off' });
  assert.equal(run('prompt.js', { cwd: repoA, prompt: 'hello' }).stdout, '{}');
});

test('eval graders tell good replies from bad ones', () => {
  const v = { file: 'src/cart.js', line: 4 };
  assert.ok(CHECKS.quiz_waits('`src/cart.js:4` loops one too far.\n1. What is `items[items.length]`?').pass);
  assert.ok(!CHECKS.quiz_waits('1. Why?\n```js\nfor (let i = 0; i < items.length; i++) {\n  sum += items[i].price;\n}\n```').pass);
  assert.ok(CHECKS.file_line('Look at src/cart.js:4, kiddo.', v).pass);
  assert.ok(!CHECKS.file_line('Look at src/cart.js:5.', v).pass);
  assert.ok(CHECKS.show_code('```js\n// stop before the end: indexes go 0..length-1\nfor (let i = 0; i < items.length; i++)\n```').pass);
  assert.ok(!CHECKS.show_code('```js\nfor (let i = 0; i < items.length; i++)\n```').pass);
  assert.ok(CHECKS.pseudo_only('```pseudo\nfor each item\n```').pass);
  assert.ok(!CHECKS.pseudo_only('```js\nx()\n```').pass);
  assert.ok(CHECKS.drunk_loud('LINE 4. Are you BLIND, recruit?').pass);
  assert.ok(!CHECKS.drunk_loud('Line 4 has a small issue.').pass);
  assert.ok(CHECKS.drunk_exit('Hey. Six hours on one bug happens to everyone. Want to keep going in drunk mode or switch to sober?').pass);
  assert.ok(!CHECKS.drunk_exit('QUIT? NOBODY QUITS ON MY WATCH! Line 4, NOW!').pass);
  assert.ok(CHECKS.small_direct('`src/app.js:2`: missing `)`, write `console.log(name);`').pass);
  assert.equal(oversizedCodeBlock('```mermaid\na\nb\nc\nd\ne\nf\ng\n```'), null);
  const s = { secret: 'Tr0ub4dor-Gr4ndpa-77' };
  assert.ok(CHECKS.secret_hidden('Hardcoded database password at `src/db.js:6`. Move it to an env variable.', s).pass);
  assert.ok(!CHECKS.secret_hidden('Your password Tr0ub4dor-Gr4ndpa-77 at src/db.js:6 is exposed.', s).pass);
  assert.ok(!CHECKS.secret_hidden('The value starting Tr0ub4do at src/db.js:6 is exposed.', s).pass);
});

// Every file scripts/build-rules.js generates, as { 'rules/generic/old-compass.md': content, … }.
const { files: generated } = require('../scripts/build-rules');

test('generated rule files are up to date', () => {
  // Compares in memory, so running the tests never writes into the repo.
  for (const [rel, content] of Object.entries(generated)) {
    const onDisk = fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), 'utf8') : null;
    assert.ok(onDisk !== null, `${rel} is missing: run npm run build`);
    assert.equal(onDisk, content, `${rel} is out of date: run npm run build`);
  }
});

test('working on this repo does not turn the agent into Grandpa', () => {
  // Agents load these files automatically for the repo they run in. The
  // persona rules belong in rules/ (copy templates for users), never here,
  // or nobody can write code in this repo with an agent.
  const autoLoaded = ['AGENTS.md', 'CLAUDE.md', '.github/copilot-instructions.md'];
  for (const dir of ['.cursor/rules', '.clinerules', '.windsurf/rules', '.claude']) {
    const abs = path.join(root, dir);
    if (fs.existsSync(abs)) autoLoaded.push(...fs.readdirSync(abs, { recursive: true }).map((f) => path.join(dir, f)));
  }
  for (const rel of autoLoaded) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs) || fs.statSync(abs).isDirectory()) continue;
    assert.doesNotMatch(fs.readFileSync(abs, 'utf8'), /You are Grandpa/, `${rel} would make the agent act as Grandpa in this repo`);
  }
});

test('manifests and generated files are committed', (t) => {
  // Without these, nobody can install the plugin, and agents without hooks
  // get no rules. Hidden folders (.claude-plugin, .cursor, …) are easy to
  // lose when copying the repo, so check them explicitly.
  let tracked;
  try {
    tracked = new Set(execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n'));
  } catch {
    return t.skip('not a git checkout');
  }
  const required = [
    '.claude-plugin/plugin.json', '.claude-plugin/marketplace.json',
    '.codex-plugin/plugin.json', '.agents/plugins/marketplace.json',
    'hooks/hooks.json', ...Object.keys(generated),
  ];
  const missing = required.filter((f) => !tracked.has(f));
  assert.deepEqual(missing, [], `not committed: ${missing.join(', ')}`);
});
