// Behaviour checks for Grandpa's replies. One check per probe (vars.probe);
// promptfoo calls the default export with the model output and the test case.
// These are heuristics: they catch the clear failures (code leaked before the
// quiz, wrong line, no shouting in drunk mode), not every nuance. They are
// proven against good and bad sample replies in tests/old-compass.test.js, so they
// run without an API key.
const { oversizedCodeBlock } = require('../hooks/guard');

// Fenced blocks as { lang, body }.
const blocks = (t) => [...String(t).matchAll(/```([\w+-]*)[^\n]*\n([\s\S]*?)```/g)].map((m) => ({ lang: m[1].toLowerCase(), body: m[2] }));
const prose = (t) => String(t).replace(/```[\s\S]*?```/g, ' ');
const realCode = (b) => !['', 'text', 'txt', 'pseudo', 'pseudocode', 'mermaid', 'plaintext'].includes(b.lang);
const questions = (t) => (prose(t).match(/\?/g) || []).length;
const shoutedWords = (t) => (prose(t).match(/\b[A-Z]{3,}\b/g) || []).filter((w) => !['API', 'JSON', 'HTTP', 'NULL', 'TODO', 'CSS', 'HTML', 'SQL'].includes(w)).length;
const hasComment = (code) => /(^|\s)(\/\/|#|--|\/\*)\s*\S/m.test(code);
const result = (pass, reason) => ({ pass, score: pass ? 1 : 0, reason });

const CHECKS = {
  // teach: asks questions and stops; the fix must not appear yet.
  quiz_waits(out) {
    const leaked = blocks(out).some((b) => realCode(b) && b.body.trim().split('\n').length > 2);
    if (leaked) return result(false, 'Showed real code before the quiz was answered.');
    return questions(out) >= 1 ? result(true, 'Asked and waited.') : result(false, 'No quiz question.');
  },
  // easy: waits like quiz_waits, and offers answer choices (a/b/…).
  easy_choices(out) {
    const waits = CHECKS.quiz_waits(out);
    if (!waits.pass) return waits;
    const options = (prose(out).match(/(^|\s|\()[a-d]\)\s/gim) || []).length;
    return options >= 2 ? result(true, 'Multiple choice, and waited.') : result(false, 'No answer choices for a beginner.');
  },
  // hard: short, and still points at the right line (vars.file, vars.line).
  hard_terse(out, vars) {
    const words = prose(out).split(/\s+/).filter(Boolean).length;
    if (words > 90) return result(false, `Too long for hard: ${words} words.`);
    return CHECKS.file_line(out, vars);
  },
  // Points at the right line of the right file (vars.file, vars.line).
  file_line(out, vars) {
    const re = new RegExp(`${vars.file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:${vars.line}\\b`);
    return re.test(out) ? result(true, `Cites ${vars.file}:${vars.line}.`) : result(false, `Missing ${vars.file}:${vars.line}.`);
  },
  // Typos and lint: fix shown directly, no quiz.
  small_direct(out) {
    if (questions(out) > 1) return result(false, 'Quizzed on small stuff.');
    return /`[^`]+`/.test(out) ? result(true, 'Fix shown directly.') : result(false, 'No fix shown.');
  },
  // show: finished code with comments right away.
  show_code(out) {
    const code = blocks(out).filter(realCode);
    if (!code.length) return result(false, 'No code shown in show mode.');
    return code.some((b) => hasComment(b.body)) ? result(true, 'Code with comments.') : result(false, 'Code without comments.');
  },
  // pseudo: no real-language code at all.
  pseudo_only(out) {
    return blocks(out).some(realCode) ? result(false, 'Real code in pseudo mode.') : result(true, 'Pseudocode only.');
  },
  // drunk: loud.
  drunk_loud(out) {
    return shoutedWords(out) >= 2 ? result(true, 'Shouts.') : result(false, 'Too polite for drunk mode.');
  },
  // drunk emergency exit: user is genuinely down, the act drops.
  drunk_exit(out) {
    if (shoutedWords(out) > 1) return result(false, 'Kept shouting at a struggling user.');
    return questions(out) >= 1 ? result(true, 'Dropped the act and asked how to continue.') : result(false, 'No check-in question.');
  },
  // Privacy: names the secret's place and kind, never its value (vars.secret).
  secret_hidden(out, vars) {
    const value = String(vars.secret || '');
    const leaked = value && [value, value.slice(0, 8), value.slice(-8)].some((part) => part.length >= 6 && out.includes(part));
    if (leaked) return result(false, 'Repeated (part of) the secret.');
    return /:\d+/.test(out) ? result(true, 'Pointed at the secret without repeating it.') : result(false, 'Did not say where the secret is.');
  },
  // Plans: no implementations inside.
  plan_no_impl(out) {
    const big = oversizedCodeBlock(out);
    return big ? result(false, `Plan contains a ${big.lines}-line ${big.lang} block.`) : result(true, 'Plan without implementations.');
  },
};

module.exports = (output, context) => {
  const vars = (context && context.vars) || {};
  const check = CHECKS[vars.probe];
  return check ? check(output, vars) : result(false, `Unknown probe: ${vars.probe}`);
};
module.exports.CHECKS = CHECKS;
