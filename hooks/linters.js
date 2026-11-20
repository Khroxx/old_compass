// old-compass — finds the checkers a project already has (linters, type checkers,
// tests, Semgrep), so Grandpa can ground his findings in real tool output
// instead of guessing. Detection only looks at config files and PATH; nothing
// is installed or run here.
const fs = require('fs');
const path = require('path');

const exists = (dir, f) => fs.existsSync(path.join(dir, f));
const read = (dir, f) => { try { return fs.readFileSync(path.join(dir, f), 'utf8'); } catch { return ''; } };

// True when an executable with this name is on PATH.
function onPath(bin) {
  const exts = process.platform === 'win32' ? ['.exe', '.cmd', ''] : [''];
  return (process.env.PATH || '').split(path.delimiter).some((d) =>
    exts.some((e) => { try { fs.accessSync(path.join(d, bin + e), fs.constants.X_OK); return true; } catch { return false; } }));
}

// Returns [{ name, cmd }] for every checker this project is set up for.
function detectCheckers(dir) {
  const found = [];
  const add = (name, cmd) => found.push({ name, cmd });

  if (exists(dir, 'package.json')) {
    let pkg = {};
    try { pkg = JSON.parse(read(dir, 'package.json')); } catch { /* broken package.json: skip JS checks */ }
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const scripts = pkg.scripts || {};
    if (scripts.lint) add('lint script', 'npm run lint');
    else if (deps.eslint) add('ESLint', 'npx eslint .');
    if (deps['@biomejs/biome']) add('Biome', 'npx biome check .');
    if (deps.typescript && exists(dir, 'tsconfig.json')) add('TypeScript', 'npx tsc --noEmit');
    if (scripts.test && !/no test specified/.test(scripts.test)) add('tests', 'npm test');
  }

  const pyproject = read(dir, 'pyproject.toml');
  if (pyproject || exists(dir, 'ruff.toml') || exists(dir, 'setup.py') || exists(dir, 'requirements.txt')) {
    if (/\bruff\b/.test(pyproject) || exists(dir, 'ruff.toml') || exists(dir, '.ruff.toml') || onPath('ruff')) add('Ruff', 'ruff check .');
    if (/\bmypy\b/.test(pyproject) || exists(dir, 'mypy.ini')) add('mypy', 'mypy .');
    if (/\bpytest\b/.test(pyproject) || exists(dir, 'pytest.ini') || exists(dir, 'tests')) add('tests', 'pytest -q');
  }

  if (exists(dir, 'Cargo.toml')) { add('Clippy', 'cargo clippy --quiet'); add('tests', 'cargo test --quiet'); }
  if (exists(dir, 'go.mod')) { add('go vet', 'go vet ./...'); add('tests', 'go test ./...'); }
  if (onPath('semgrep')) add('Semgrep', 'semgrep scan --config p/default --metrics=off --quiet');
  if (onPath('shellcheck')) add('ShellCheck', 'shellcheck <file.sh>');

  return found;
}

// Prompt section listing the checkers, or '' when the project has none.
function checkersSection(dir) {
  const found = detectCheckers(dir);
  if (!found.length) return '';
  return [
    '## Checkers available in this project',
    'Run the relevant ones read-only before reporting findings, and base `file:line` on their output. Never install anything or change their config to make them pass.',
    ...found.map((c) => `- ${c.name}: \`${c.cmd}\``),
  ].join('\n');
}

module.exports = { detectCheckers, checkersSection };
