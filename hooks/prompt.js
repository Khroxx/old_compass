#!/usr/bin/env node
// old-compass — UserPromptSubmit: switches modes on /compass commands and keeps
// the active mode in front of the model every turn.
//
//   /compass drunk show       persona + code level for this project
//   /compass global sober     same, but as the default for all projects
//   /compass off | stop compass
const { readState, writeState, readStdin, addContext, emit, projectDir } = require('./lib');
const { forMode, reminder, CODE_LEVELS } = require('./instructions');

const PERSONA_ALIASES = { drunk: 'drunk', sober: 'grandpa', nice: 'grandpa', grandpa: 'grandpa' };

// Returns { state, global } for a mode command, or null for a normal prompt.
// `/compass-review` and other skills are not mode commands, hence the
// lookahead for whitespace or end of input after the name.
function parse(prompt, state) {
  const p = prompt.trim().toLowerCase();
  if (/^stop compass\b/.test(p)) return { state: { ...state, enabled: false }, global: false };
  // Plain (`/compass`) or namespaced by the plugin (`/old-compass:compass`,
  // `$old-compass:compass` in Codex).
  const m = p.match(/^[/@$](?:old-compass:)?compass(?=\s|$)(.*)$/s);
  if (!m) return null;
  const next = { ...state, enabled: true };
  let global = false;
  for (const word of m[1].split(/\s+/).filter(Boolean)) {
    if (word === 'off' || word === 'stop') next.enabled = false;
    else if (word === 'on') next.enabled = true;
    else if (word === 'global') global = true;
    else if (PERSONA_ALIASES[word]) next.persona = PERSONA_ALIASES[word];
    else if (word === 'code') continue; // "/compass code show" reads naturally
    else if (CODE_LEVELS.includes(word)) next.code = word;
  }
  return { state: next, global };
}

// Entry point. hooks.json calls main() explicitly: it loads this file with
// `node -e "require(...)"`, where require.main is not this module.
function main() {
  return readStdin().then((input) => {
    const dir = projectDir(input);
    const state = readState(dir);
    const cmd = parse(input.prompt || '', state);
    if (cmd) {
      writeState(cmd.global ? null : dir, cmd.state);
      const effective = readState(dir); // a global change may be shadowed by this project's entry
      if (!effective.enabled) return addContext('UserPromptSubmit', 'OLD COMPASS OFF. Behave as a normal coding assistant from now on and ignore the Old Compass output style.');
      return addContext('UserPromptSubmit', forMode(effective));
    }
    if (!state.enabled) return emit({});
    addContext('UserPromptSubmit', reminder(state));
  });
}

if (require.main === module) main();

module.exports = { parse, main };
