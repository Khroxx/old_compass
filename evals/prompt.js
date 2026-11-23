// promptfoo prompt: Grandpa's real rule text for the persona, code level and
// level of each test case (vars.persona, vars.code, vars.level) as the system prompt, the test's
// task as the user message. Same source as the hooks, so the evals test what
// users actually get.
const { forMode } = require('../hooks/instructions');

module.exports = ({ vars }) => [
  { role: 'system', content: forMode({ persona: vars.persona || 'grandpa', code: vars.code || 'teach', level: vars.level || 'medium' }) },
  { role: 'user', content: vars.task },
];
