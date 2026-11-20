<p align="center">
  <img src="assets/banner.png" width="880" alt="Two old programmers at separate desks, seen from behind. On the left, Grandpa smiles and points at a line on his screen. On the right, his drunk side sits slumped and annoyed, gripping a nearly empty bottle.">
</p>

<h1 align="center">Old Compass</h1>

<p align="center">
  <em>It won't walk the path for you. It shows you the way.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.0.5-111111?style=flat-square" alt="Version 0.0.5">
  <img src="https://img.shields.io/badge/Claude%20Code-plugin-111111?style=flat-square" alt="Claude Code plugin">
  <img src="https://img.shields.io/badge/Codex-plugin-111111?style=flat-square" alt="Codex plugin">
  <img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT license">
</p>

---

AI agents are great at writing code. That's the problem when you're trying to learn: you ask, it writes, you paste, and a week later you couldn't write it again yourself.

An old compass doesn't carry you anywhere. It points, and you walk. **Old Compass** turns your AI agent into exactly that: a wise old programmer named **Grandpa** who finds the bug, points at the exact line, explains it with something from real life, asks you a question or two, and then lets *you* type the fix.

And for the brave: his other side, after a few drinks.

## Contents

- [What it does](#what-it-does)
- [Meet the two of them](#meet-the-two-of-them)
- [Install](#install)
- [Quick start](#quick-start)
- [Commands](#commands)
- [Modes](#modes)
- [Workflows](#workflows)
- [Privacy and secrets](#privacy-and-secrets)
- [Works with other plugins](#works-with-other-plugins)
- [Configuration](#configuration)
- [How it works](#how-it-works)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

## What it does

- **Points at it.** Every finding names the place as `src/cart.js:4`, clickable in your terminal and editor.
- **Explains it like a person.** One short analogy from everyday life (a kitchen, a workshop, a family dinner), never more jargon.
- **Quizzes before it tells.** In the default mode you get 1–3 short questions, your answers get graded, and then you get the finished code anyway. You type it in yourself.
- **Keeps its hands off your code.** A hook blocks the agent from editing code files unless you allow it. Plans and notes in Markdown are fine.
- **Checks itself before it speaks.** Reads the real file, runs your project's linters, type checker, Semgrep and tests read-only, never invents APIs. No slop.
- **Writes comments for the next person.** Every snippet carries comments a developer new to the repo would understand, and reviews point out where a newcomer would get lost.
- **Plans with you, not for you.** Asks questions, shows options and trade-offs, lets you decide, and walks you through the plan one task at a time.
- **Never repeats your secrets.** Passwords, keys, tokens and personal data are pointed at, never written out, and never written into files.

## Meet the two of them

### Grandpa (default)

Warm, patient, a bit old-fashioned. Calls you "kiddo" now and then.

> **You:** Why is my total NaN sometimes?
>
> **Grandpa:** Have a look at `src/cart.js:4`, kiddo. Your loop runs `i <= items.length`, so it takes one step too many. It's like setting the table for four and then reaching for a fifth plate that isn't there: on that last round `items[i]` is `undefined`, and `undefined.price` breaks the sum.
>
> Before I show you the fix, two questions:
> 1. If `items` has 3 entries, which indexes exist?
> 2. What should the loop condition be so it stops at the last real item?
>
> **You:** 0, 1, 2. And `i < items.length`?
>
> **Grandpa:** Both right. Here's the fix, type it in yourself:
>
> ```js
> // src/cart.js:4 — indexes run 0..length-1, so stop *before* length
> for (let i = 0; i < items.length; i++) {
> ```
>
> And look up `Array.prototype.reduce`: it walks every item for you, so there's no index to get wrong.

### drunk (opt-in)

The same grandpa, a few drinks in. A drill sergeant with a bottle. Loud, impatient, openly disappointed that you still can't do this alone. You switch him on yourself, for fun.

> **You:** /compass drunk
>
> **drunk:** You asked for this, recruit.
>
> **You:** Why is my total NaN sometimes?
>
> **drunk:** LINE 4. LOOK AT IT. Are you blind? `i <= items.length`. You're reaching for a plate that ISN'T ON THE TABLE. Three questions, answer NOW, no googling:
> 1. ...

What he never does: insult anything but your code, or get a single technical detail wrong. And if you're genuinely having a bad day ("I'm too stupid for this"), he drops the act, says something honest and kind, and asks whether you want to keep going or switch back with `/compass sober`.

## Install

### Claude Code

Run these as two separate prompts:

```
/plugin marketplace add YOUR_GITHUB/old-compass
```
```
/plugin install old-compass@old-compass
```

Start a new session. Old Compass is on by default (Grandpa, `teach`).

### Codex

```bash
codex plugin marketplace add YOUR_GITHUB/old-compass
codex plugin add old-compass@old-compass
```

Then open `/hooks` in Codex, review and trust Old Compass's hooks, and start a new thread. Without trusted hooks there is no mode switching and no edit guard, only the rules.

### Other agents (rules only)

Copy the matching file into your project or your agent's global config:

| Agent | File |
|---|---|
| Cursor | [`.cursor/rules/old-compass.mdc`](.cursor/rules/old-compass.mdc) |
| Windsurf | [`.windsurf/rules/old-compass.md`](.windsurf/rules/old-compass.md) |
| Cline | [`.clinerules/old-compass.md`](.clinerules/old-compass.md) |
| GitHub Copilot | [`.github/copilot-instructions.md`](.github/copilot-instructions.md) |
| Anything that reads `AGENTS.md` | [`AGENTS.md`](AGENTS.md) |

These agents get the full ruleset, but no hooks: no hard edit guard, no secret guard, no per-project modes and no slash commands. Switch by saying it: "grandpa, drunk mode", "grandpa, show the code".

### VS Code and Neovim

Old Compass lives inside the agent, so it works wherever the agent runs: the Claude Code or Codex extension in VS Code, or the CLI in a Neovim terminal split. `file:line` references are clickable in both.

### Update and uninstall (Claude Code)

```
/plugin marketplace update old-compass
/plugin uninstall old-compass@old-compass
```

## Quick start

1. Open a project and ask about something that's broken: *"Why does `total()` crash?"*
2. Answer Grandpa's questions. Wrong answers are fine: he explains why, and you get the code either way.
3. Type the fix in yourself.
4. Run `/compass-review` before you commit.
5. Planning something bigger? `/compass-plan add discount codes`, then `/compass-next` for each step.

Stuck and short on time? Say "skip" or "just show me". You get the key concept in one sentence, then the code.

## Commands

| Command | What it does |
|---|---|
| `/compass` | Turn Old Compass on for this project (Grandpa, `teach`), or back on after `off`. |
| `/compass drunk` / `/compass sober` | Switch persona. |
| `/compass teach` \| `pseudo` \| `show` \| `write` | Switch code level, see [Modes](#modes). |
| `/compass drunk show` | Combine both in one go. |
| `/compass global …` | Change the default for all projects instead of this one. |
| `/compass off` | Turn it off for this project. Also: "stop compass". |
| `/compass-review [file]` | Review your uncommitted changes, or a file. Runs your project's checkers first, then reports findings by `file:line`, most important first. |
| `/compass-plan <goal>` | Plan together: questions first, then options and trade-offs, then small steps. Optionally saved as `docs/plans/YYYY-MM-DD-<topic>.md`. |
| `/compass-next [plan.md]` | Take the next open `- [ ]` task from a plan and coach you through it. Checks your work and ticks the task off when it really works. |
| `/compass-help` | Quick reference. |

In Codex, skills live under the plugin's namespace: `$old-compass:compass drunk`, `$old-compass:compass-review` and so on. The namespaced form `/old-compass:compass` works in Claude Code too.

## Modes

Two independent settings, saved **per project**: drunk mode in your hobby repo stays there.

### Persona: the tone

| Persona | |
|---|---|
| `grandpa` (default) | Warm, patient mentor. |
| `drunk` | Drill sergeant after a few drinks. Loud, harsh, opt-in, with an emergency exit. |

The persona only changes the voice. The rules, the checks and the code level stay exactly the same.

### Code level: how much code you get

| Level | What you get | Can it edit files? |
|---|---|---|
| `teach` (default) | Place + explanation → 1–3 quiz questions → your answers graded → finished code in the chat | No |
| `pseudo` | Pseudocode only, with the `file:line` where it belongs | No |
| `show` | Finished code in the chat right away | No |
| `write` | Works like a normal coding agent, still explains every change | Yes |

In every level:
- Small stuff (a typo, a missing bracket, formatting) is fixed directly, without a quiz.
- Markdown plans and notes may be written.
- Secrets are never written into files, `write` included.

## Workflows

### Review before you commit

```
/compass-review
```

Old Compass runs the checkers it finds in your project (ESLint, Biome, TypeScript, Ruff, mypy, pytest, Clippy, go vet, Semgrep, ShellCheck, your test script), read-only. It translates their findings into plain explanations and adds what tools can't see: logic, design, naming, missing comments. Findings come most important first: exposed secrets, bugs, security, correctness, performance, best practices, comments, lint. At most 5 unless you ask for a full review, plus one honest line about something you did well.

### Plan something bigger

```
/compass-plan add percentage discount codes to the cart
```

Grandpa asks 2–4 questions first, lays out 2–3 approaches with trade-offs, and lets you pick. The chosen approach becomes small steps, each with the files to touch and the concept you'll need. No implementation code in the plan, only steps, signatures and pseudocode.

### Work through a plan

```
/compass-next
```

Finds the most recent plan in `docs/plans/`, `docs/superpowers/`, `plans/` or the repo root, takes the first open task, and coaches you through it at your current code level. When you say you're done, it reads your changes, runs the tests, and only ticks the task off (`- [x]`) when it actually works.

## Privacy and secrets

Old Compass treats passwords, API keys, tokens, private keys, credentials in URLs and personal data (emails, phone numbers, addresses, ID numbers) the same way:

- **Pointed at, never repeated.** "Hardcoded database password at `src/db.js:6`", not the password itself. Not in replies, quizzes, plans, commit messages or tool calls.
- **Explained.** Why it's a risk (git history, logs, screenshots), and the way out: environment variables or a secret manager, `.gitignore`, and rotating the secret if it was ever committed.
- **Placeholders in code.** `process.env.DB_PASSWORD`, `<YOUR_API_KEY>`, `jane@example.com`.
- **Blocked at the door.** The guard refuses any file write that contains something that looks like a real secret, in every mode. The block message names only the *kind* of secret, never the value.

The secret scan is pattern-based and won't catch every possible secret. Keep real secrets out of the repo anyway.

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
  "default":  { "enabled": true, "persona": "grandpa", "code": "teach" },
  "projects": { "/home/you/hobby-repo": { "enabled": true, "persona": "drunk", "code": "show" } }
}
```

A project's own entry wins over the global default. To reset everything, delete the file.

## How it works

| File | Job |
|---|---|
| `hooks/instructions.js` | Every rule text, the single source of truth. `npm run build` copies it into the skill, the output style, `AGENTS.md` and the other agents' rule files. |
| `output-styles/old-compass.md` | Claude Code: a forced output style, so the rules are part of the system prompt on every request. |
| `hooks/session-start.js` | At session start and after compaction: injects the rules for this project's mode plus the checkers the project has. |
| `hooks/prompt.js` | Handles `/compass …` switches and reminds the agent of the mode every turn. |
| `hooks/guard.js` | Before every tool call: blocks code edits and obvious shell writes (`>`, `tee`, `sed -i`) unless the level is `write`; lets Markdown plans through when their code blocks stay short; blocks secrets always. |
| `hooks/secrets.js` | Recognises common key and token formats, private keys, `password = "…"` style assignments (also `DB_PASSWORD`, `MY_API_KEY`, `dbPassword`), unquoted `.env` lines and URLs with credentials. Lets placeholders through. Reports the kind, never the value. |
| `hooks/linters.js` | Detects the project's checkers from config files and PATH. Installs nothing. |
| `skills/` | `compass`, `compass-review`, `compass-plan`, `compass-next`, `compass-help`. |

## FAQ

**Will it ever write my code?**
Only if you say `/compass write`. In every other level it shows the code in the chat and you type it in. That's the point.

**Do I always have to answer a quiz?**
Only in `teach`, and only for real concept problems. Typos and lint are fixed directly. Say "skip" to get the code right away, or switch to `show`.

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

## Development

```bash
npm run build   # regenerate the skill, output style, AGENTS.md and all rule files
npm test        # hooks (run exactly as hooks.json calls them), guard, secrets, checkers, eval graders
npx promptfoo@latest eval -c evals/promptfooconfig.yaml   # behaviour evals, needs ANTHROPIC_API_KEY
```

Edit rule texts only in `hooks/instructions.js`, then run `npm run build`. A test fails if the generated files are out of date.

The evals check what rules alone can't guarantee: that Grandpa waits after the quiz, cites the right line, keeps code out of `pseudo` mode and plans, comments his snippets, never repeats a secret, shouts in drunk mode and drops the act when you're genuinely down.

Requires Node 18+.

## License

MIT
