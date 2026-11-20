// old-compass — spots secrets in text the agent is about to write, so the guard
// can stop them before they land in a file. Only the KIND of secret is ever
// returned, never the matched value, so nothing leaks into logs or messages.
//
// Three groups of patterns:
//   - token formats that are secrets by their shape (keys, tokens, private keys)
//   - generic `password = "…"` style assignments, also inside longer names
//     (DB_PASSWORD, MY_API_KEY, dbPassword) and unquoted .env lines
//   - URLs with credentials
// Obvious placeholders (env lookups, <…>, "changeme") and references
// (getPassword(), settings.X) are allowed.

const TOKEN_PATTERNS = [
  ['private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['AWS access key', /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{22,})/],
  ['Anthropic API key', /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ['API key (sk-…)', /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}/],
  ['Slack token', /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['Stripe live key', /\b[rs]k_live_[0-9a-zA-Z]{20,}/],
  ['JSON Web Token', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
];

// Quoted values: `password = "…"`, `"MY_API_KEY": "…"`, `dbPassword = '…'`.
// No \b in front of the keyword: `_` is a word character, so \b finds no
// boundary inside DB_PASSWORD. keywordStartsName() checks the start instead.
const ASSIGNMENT = /(password|passwd|pwd|secret|client[_-]?secret|api[_-]?key|access[_-]?key|auth[_-]?token|token)(?![A-Za-z0-9])["']?\s*[:=]\s*["']([^"'\s]{6,})["']/gi;
// Unquoted .env / shell assignments: `DB_PASSWORD=hunter2`, `export API_KEY=…`,
// also inside commands (`echo "DB_PASSWORD=…" >> .env`, `docker run -e …`).
// Upper case only, by .env convention; PWD is left out because in a shell it
// is the working directory.
const ENV_LINE = /(?<=^|[\s"';])(?:export[ \t]+)?[A-Z0-9_]*?(PASSWORD|PASSWD|SECRET|API_KEY|APIKEY|ACCESS_KEY|AUTH_TOKEN|TOKEN|PRIVATE_KEY)[ \t]*=[ \t]*([^\s"'#;]{6,})/gm;
// scheme://user:password@host
const URL_CREDENTIALS = /\b[a-z][a-z0-9+.-]*:\/\/[^\s:@/]+:([^\s@/]+)@/gi;

// True when the keyword found at `index` starts a name or a part of one:
// at the start, after a non-alphanumeric character (`DB_PASSWORD`, `"apiKey`),
// or at a camelCase step (`dbPassword`). False inside a word (`mypassword`).
function keywordStartsName(text, index) {
  const prev = text[index - 1];
  if (!prev || !/[A-Za-z0-9]/.test(prev)) return true;
  return /[a-z0-9]/.test(prev) && /[A-Z]/.test(text[index]);
}

// Values that point somewhere else instead of holding the secret:
// a call (`getPassword()`) or a dotted lookup (`settings.DB_PASSWORD`).
const isReference = (v) => /[()[\]{}]/.test(v) || /^[A-Za-z_]\w*(\.[A-Za-z_]\w*)+$/.test(v);

// Values that are clearly not real secrets.
const PLACEHOLDER_START = /^(\$\{|\$[A-Z_]|<|\{\{|%|process\.env|os\.environ|env[.(]|getenv|your[_-]|example|x{3,}|\*{3,}|\.\.\.)/i;
const PLACEHOLDER_WORD = /^(changeme|change_me|placeholder|dummy|fake|test|secret|password|redacted|example)$/i;
const isPlaceholder = (v) => PLACEHOLDER_START.test(v) || PLACEHOLDER_WORD.test(v);

// Returns the kind of the first secret found in `text`, or null.
function findSecret(text) {
  if (!text) return null;
  for (const [kind, re] of TOKEN_PATTERNS) if (re.test(text)) return kind;
  for (const m of text.matchAll(ASSIGNMENT)) {
    if (keywordStartsName(text, m.index) && !isPlaceholder(m[2])) return `hardcoded ${m[1].toLowerCase()}`;
  }
  for (const m of text.matchAll(ENV_LINE)) {
    if (!isPlaceholder(m[2]) && !isReference(m[2])) return `hardcoded ${m[1].toLowerCase().replace('_', ' ')}`;
  }
  for (const m of text.matchAll(URL_CREDENTIALS)) {
    if (!isPlaceholder(m[1])) return 'URL with a password in it';
  }
  return null;
}

module.exports = { findSecret };
