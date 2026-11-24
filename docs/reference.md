# Reference

## Works with other plugins

**Superpowers** (or any planning workflow): plan big with it, implement with Old Compass. Superpowers may write its design and plan as Markdown. The guard rejects plans with implementation code in them (fenced code over 5 lines in a real language), so the agent rewrites them as steps, signatures and pseudocode. Superpowers' own execution phase is blocked like any other code edit. Then run `/compass-next` and do the tasks yourself.

**Claude Code's built-in Learning style**: a similar idea with a lighter touch. It writes most of the code and leaves `TODO(human)` gaps. Old Compass replaces it: the plugin forces its own output style while it's installed. `/compass off` makes Claude ignore it; uninstall the plugin to get your previous style back.

**Semgrep**: if `semgrep` is on your PATH, reviews run it and explain its findings. Semgrep Guardian scans what the agent writes; Old Compass reviews what you write. They don't clash.

## Configuration

There's nothing to configure to get started. Modes are saved automatically:

- Claude Code: `~/.old-compass/state.json`
- Codex: the plugin's data directory
- Override the location with the `OLD_COMPASS_HOME` environment variable.

The file holds a global default and one entry per project:

```json
{
  "default":  { "enabled": true, "persona": "grandpa", "code": "teach", "level": "medium" },
  "projects": { "/home/you/hobby-repo": { "enabled": true, "persona": "drunk", "code": "show", "level": "easy" } }
}
```

A project's own entry wins over the global default. To reset everything, delete the file.

## How it works

| File | Job |
|---|---|
| `hooks/instructions.js` | Every rule text, the single source of truth. `npm run build` copies it into the skill, the output style and the rule templates in `rules/`. |
| `output-styles/old-compass.md` | Claude Code: a forced output style, so the rules are part of the system prompt on every request. |
| `hooks/session-start.js` | At session start and after compaction: injects the rules for this project's mode plus the checkers the project has. |
| `hooks/prompt.js` | Handles `/compass …` switches and reminds the agent of the mode every turn. |
| `hooks/guard.js` | Before every tool call: blocks code edits and obvious shell writes (`>`, `tee`, `sed -i`) unless the level is `write`; blocks `git commit`, `git push` and `git pull` in every level; lets Markdown plans through when their code blocks stay short; blocks secrets always. |
| `hooks/secrets.js` | Recognises common key and token formats, private keys, `password = "…"` style assignments (also `DB_PASSWORD`, `MY_API_KEY`, `dbPassword`), unquoted `.env` lines and URLs with credentials. Lets placeholders through. Reports the kind, never the value. |
| `hooks/linters.js` | Detects the project's checkers from config files and PATH. Installs nothing. |
| `skills/` | `compass`, `compass-review`, `compass-plan`, `compass-next`, `compass-help`. |

## FAQ

**Will it ever write my code?**
Only if you say `/compass write`. In every other level it shows the code in the chat and you type it in. That's the point.

**Do I always have to answer a quiz?**
Only in `teach`, and only for real concept problems. On `hard` there's at most one question, and often none. Typos and lint are fixed directly. Say "skip" to get the code right away, or switch to `show`.

**Does drunk mode actually insult me?**
It roasts your code, loudly. It never goes after you as a person, and it drops the act when you're genuinely down. If that's still not your thing, just don't switch it on: it's off by default.

**Which language does it answer in?**
The one you write in. The persona comes along.

**Does it work with a local model?**
It works with whatever model your agent runs. The rules are plain text; how well a model follows them varies, and smaller models slip more often. The edit guard and the secret guard are hooks, so they hold regardless of the model.

**Can the agent get around the edit guard?**
The guard blocks file-editing tools and the obvious shell routes. A determined agent could find another way; the rules tell it not to try. Old Compass is a learning tool, not a sandbox.

**Why "Old Compass"?**
A compass doesn't walk the path for you. An old one has seen a lot of paths.

## Troubleshooting

**`/compass drunk` doesn't stick, or the agent still edits files.**
The hooks aren't running. In Claude Code, check that the plugin is installed and enabled in `/plugin`, then start a new session. In Codex, open `/hooks` and trust Old Compass's hooks, then start a new thread.

**It's on in a project where I don't want it.**
`/compass off` in that project. It stays off there and on everywhere else.

**I want my old output style back.**
`/compass off` makes Claude ignore the Old Compass style for that project. To remove it completely, uninstall the plugin.

**A mode seems stuck.**
Delete `~/.old-compass/state.json` (or the file at `OLD_COMPASS_HOME`) and start a new session.
