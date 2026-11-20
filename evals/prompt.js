// promptfoo prompt: Grandpa's real rule text for the persona and code level of
// each test case (vars.persona, vars.code) as the system prompt, the test's
// task as the user message. Same source as the hooks, so the evals test what
// users actually get.
const { forMode } = require('../hooks/instructions');

module.exports = ({ vars }) => [
  { role: 'system', content: forMode({ persona: vars.persona || 'grandpa', code: vars.code || 'teach' }) },
  { role: 'user', content: vars.task },
];
