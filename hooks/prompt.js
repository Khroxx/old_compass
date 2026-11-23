#!/usr/bin/env node
// old-compass — UserPromptSubmit: switches modes on /compass commands and keeps
// the active mode in front of the model every turn.
//
//   /compass drunk show       persona + code level for this project
//   /compass easy             level: easy | medium | hard
//   /compass global sober     same, but as the default for all projects
//   /compass off | stop compass
const { readState, writeState, readStdin, addContext, emit, projectDir } = require('./lib');
const { forMode, reminder, CODE_LEVELS, LEVELS } = require('./instructions');

const PERSONA_ALIASES = { drunk: 'drunk', sober: 'grandpa', nice: 'grandpa', grandpa: 'grandpa' };
const LEVEL_ALIASES = { beginner: 'easy', intermediate: 'medium', senior: 'hard' };

// Every word /compass understands, for typo hints.
const KNOWN_WORDS = ['on', 'off', 'stop', 'global', 'code', ...Object.keys(PERSONA_ALIASES), ...CODE_LEVELS, ...LEVELS, ...Object.keys(LEVEL_ALIASES)];

// Returns { state, global, unknown } for a mode command, or null for a
// normal prompt. `unknown` lists words that aren't options (typos); the
// caller then changes nothing, so a typo never half-applies a switch.
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
  const unknown = [];
  for (const word of m[1].split(/\s+/).filter(Boolean)) {
    if (word === 'off' || word === 'stop') next.enabled = false;
    else if (word === 'on') next.enabled = true;
    else if (word === 'global') global = true;
    else if (PERSONA_ALIASES[word]) next.persona = PERSONA_ALIASES[word];
    else if (word === 'code') continue; // "/compass code show" reads naturally
    else if (CODE_LEVELS.includes(word)) next.code = word;
    else if (LEVELS.includes(word)) next.level = word;
    else if (LEVEL_ALIASES[word]) next.level = LEVEL_ALIASES[word];
    else unknown.push(word);
  }
  return { state: next, global, unknown };
}

// Edit distance between two short words (how many letters to change).
function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const keep = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = keep;
    }
  }
  return row[b.length];
}

// The note handed to the agent when /compass got words it doesn't know,
// with a "did you mean" for words that are one or two letters off.
function describeUnknown(words) {
  const parts = words.map((w) => {
    const best = KNOWN_WORDS.reduce((a, k) => (distance(w, k) < distance(w, a) ? k : a));
    return distance(w, best) <= 2 ? `\`${w}\` (did you mean \`${best}\`?)` : `\`${w}\``;
  });
  return [
    `OLD COMPASS: /compass did not understand ${parts.join(', ')}. Nothing was changed.`,
    'Valid words: drunk, sober, teach, pseudo, show, write, easy, medium, hard, global, on, off.',
    'Tell the user this in one short line, then continue in the current mode.',
  ].join('\n');
}

// Entry point. hooks.json calls main() explicitly: it loads this file with
// `node -e "require(...)"`, where require.main is not this module.
function main() {
  return readStdin().then((input) => {
    const dir = projectDir(input);
    const state = readState(dir);
    const cmd = parse(input.prompt || '', state);
    if (cmd && cmd.unknown.length) {
      // Fail loud: keep the mode as it was and let the agent say why.
      return addContext('UserPromptSubmit', [describeUnknown(cmd.unknown), state.enabled ? reminder(state) : ''].filter(Boolean).join('\n\n'));
    }
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

module.exports = { parse, describeUnknown, main };
