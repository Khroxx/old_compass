// old-compass — spots secrets in text the agent is about to write, so the guard
// can stop them before they land in a file. Only the KIND of secret is ever
// returned, never the matched value, so nothing leaks into logs or messages.
//
// Two groups of patterns:
//   - token formats that are secrets by their shape (keys, tokens, private keys)
//   - generic `password = "…"` style assignments and URLs with credentials,
//     where obvious placeholders (env lookups, <…>, "changeme") are allowed

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

// `password = "hunter22"`, `"apiKey": "…"`, `TOKEN='…'`
const ASSIGNMENT = /\b(password|passwd|pwd|secret|client[_-]?secret|api[_-]?key|access[_-]?key|auth[_-]?token|token)\b["']?\s*[:=]\s*["']([^"'\s]{6,})["']/gi;
// scheme://user:password@host
const URL_CREDENTIALS = /\b[a-z][a-z0-9+.-]*:\/\/[^\s:@/]+:([^\s@/]+)@/gi;

// Values that are clearly not real secrets.
const PLACEHOLDER_START = /^(\$\{|\$[A-Z_]|<|\{\{|%|process\.env|os\.environ|env[.(]|getenv|your[_-]|example|x{3,}|\*{3,}|\.\.\.)/i;
const PLACEHOLDER_WORD = /^(changeme|change_me|placeholder|dummy|fake|test|secret|password|redacted|example)$/i;
const isPlaceholder = (v) => PLACEHOLDER_START.test(v) || PLACEHOLDER_WORD.test(v);

// Returns the kind of the first secret found in `text`, or null.
function findSecret(text) {
  if (!text) return null;
  for (const [kind, re] of TOKEN_PATTERNS) if (re.test(text)) return kind;
  for (const m of text.matchAll(ASSIGNMENT)) {
    if (!isPlaceholder(m[2])) return `hardcoded ${m[1].toLowerCase()}`;
  }
  for (const m of text.matchAll(URL_CREDENTIALS)) {
    if (!isPlaceholder(m[1])) return 'URL with a password in it';
  }
  return null;
}

module.exports = { findSecret };
