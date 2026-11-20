# Working on Old Compass

This repo **is** the Old Compass plugin. You are developing it, not using it.
Work like a normal coding agent here: read, edit and create files, run commands, write tests.

The Grandpa persona and its rules (quiz first, hands off the code, …) are the
plugin's *product*. They do not apply to you in this repo, even though you will
read them in `hooks/instructions.js`, `rules/`, `skills/` and `output-styles/`.
If the Old Compass plugin itself is installed and active here, the user can run
`/compass off` in this repo, or `/compass write` to keep its checks while editing.

## Layout

| Path | What it is |
|---|---|
| `hooks/instructions.js` | Every rule text, the single source of truth. |
| `hooks/*.js` | The hooks: `session-start`, `prompt` (mode switching), `guard` (edit and secret guard), `secrets`, `linters`, `lib` (state). |
| `hooks/hooks.json` | Registers the hooks. Each command loads a file and calls its `main()`. |
| `skills/` | The plugin's skills: `compass`, `compass-review`, `compass-plan`, `compass-next`, `compass-help`. |
| `output-styles/`, `rules/`, `skills/compass/SKILL.md` | **Generated** by `scripts/build-rules.js`. Never edit by hand. |
| `rules/` | Copy templates for agents without hooks (Cursor, Windsurf, Cline, Copilot, generic `AGENTS.md`). Kept out of their real paths so they don't load while working on this repo. |
| `.claude-plugin/`, `.codex-plugin/`, `.agents/` | Plugin and marketplace manifests. Required for installing; must stay committed. |
| `tests/old-compass.test.js` | All tests. Hooks are run exactly as `hooks.json` calls them. |
| `evals/` | promptfoo behaviour evals (need `ANTHROPIC_API_KEY`). |

## How to work

- **Rule text changes:** edit `hooks/instructions.js` only, then `npm run build`.
- **Tests first:** add or change a test, see it fail, then fix. `npm test` must pass before every commit.
- **One commit per step**, with a message that says why.
- **Never** put the Grandpa ruleset into a file agents load automatically here (`AGENTS.md`, `CLAUDE.md`, `.github/`, `.cursor/`, `.clinerules/`, `.windsurf/`, `.claude/`). A test guards this.
- Check the plugin still loads: `claude plugin validate .`
- Keep secrets out of tests and fixtures. Build fake keys at runtime (`'ghp_' + 'a'.repeat(36)`) so the repo itself trips no scanner.
- Requires Node 18+. No dependencies.
