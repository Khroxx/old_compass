#!/usr/bin/env node
// old-compass — SessionStart (also after /clear and compaction): hands the model
// the rules for this project's mode plus the checkers the project has.
const { readState, readStdin, addContext, emit, projectDir } = require('./lib');
const { forMode } = require('./instructions');
const { checkersSection } = require('./linters');

// Entry point, called by hooks.json (see prompt.js for why it is explicit).
function main() {
  return readStdin().then((input) => {
    const dir = projectDir(input);
    const state = readState(dir);
    if (!state.enabled) return emit({});
    addContext('SessionStart', [forMode(state), checkersSection(dir)].filter(Boolean).join('\n\n'));
  });
}

if (require.main === module) main();

module.exports = { main };
