<h1 align="center">Old Compass</h1>

<p align="center">
  <em>It won't walk the path for you. It shows you the way.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.0.7-111111?style=flat-square" alt="Version 0.0.7">
  <img src="https://img.shields.io/badge/Claude%20Code-plugin-111111?style=flat-square" alt="Claude Code plugin">
  <img src="https://img.shields.io/badge/Codex-plugin-111111?style=flat-square" alt="Codex plugin">
  <img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT license">
</p>

---

AI agents are great at writing code. That's the problem when you're trying to learn: you ask, it writes, you paste, and a week later you couldn't write it again yourself.

An old compass doesn't carry you anywhere. It points, and you walk. **Old Compass** turns your AI agent into exactly that: a wise old programmer named **Grandpa** who finds the bug, points at the exact line, explains it with something from real life, asks you a question or two, and then lets *you* type the fix.

And for the brave: his other side, after a few drinks.

## What it does

- **Points at it.** Every finding names the place as `src/cart.js:4`, clickable in your terminal and editor.
- **Explains it like a person.** One short analogy from everyday life, never more jargon.
- **Quizzes before it tells.** 1–3 short questions, your answers graded, then the finished code. You type it in yourself.
- **Keeps its hands off your code and your git.** Hooks block code edits (unless you allow `write`) and `git commit`, `push` and `pull` (always). Grandpa suggests the commit message, makes you run the tests first, and teaches you the commands.
- **Checks itself before it speaks.** Reads the real file, runs your linters and tests read-only, never invents APIs.
- **Never repeats your secrets.** Keys, passwords and personal data are pointed at, never written out.
- **Plans with you, not for you.** Questions, options and trade-offs first, then one small task at a time.

Two personas: **Grandpa** (warm, patient) and, opt-in and for the brave, **drunk Grandpa** (a drill sergeant after a few drinks). Three levels of help: `easy`, `medium`, `hard`.

## Install

**Claude Code** (two separate prompts):

```
/plugin marketplace add Khroxx/old_compass
```
```
/plugin install old-compass@old-compass
```

Start a new session. Old Compass is on by default (Grandpa, `teach`).

**Codex:**

```bash
codex plugin marketplace add Khroxx/old_compass
codex plugin add old-compass@old-compass
```

Then open `/hooks`, review and trust Old Compass's hooks, and start a new thread.

Cursor, Windsurf, Cline, Copilot or any agent that reads `AGENTS.md`: rules only, no hooks. See [docs/install.md](docs/install.md), which also covers updating and uninstalling.

## Quick start

1. Ask about something that's broken: *"Why does `total()` crash?"*
2. Answer Grandpa's questions. Wrong answers are fine, you get the code either way.
3. Type the fix in yourself, run your tests, then `/compass-review`.
4. Ready to commit? Grandpa suggests the message and the commands. You type them.

Short on time? Say "skip". New to programming? `/compass easy`. Been at it for years? `/compass hard`.

## Commands

| Command | What it does |
|---|---|
| `/compass` | Turn Old Compass on for this project, or back on after `off`. |
| `/compass drunk` / `sober` | Switch persona. |
| `/compass teach` \| `pseudo` \| `show` \| `write` | How much code you get. |
| `/compass easy` \| `medium` \| `hard` | How much help you get. |
| `/compass drunk hard show` | Combine them. Add `global` to change the default for all projects. |
| `/compass off` | Turn it off for this project. |
| `/compass tested` | Optional: tell Grandpa your tests passed. Normally he notices from the chat. |
| `/compass-review [file]` | Review your changes, most important finding first. |
| `/compass-plan <goal>` | Plan together, optionally saved as Markdown. |
| `/compass-next [plan.md]` | Coach you through the next open task of a plan. |
| `/compass-help` | Quick reference. |

In Codex the skills are namespaced: `$old-compass:compass drunk`. `/old-compass:compass` works in Claude Code too.

## More

- [Modes and levels](docs/modes.md): personas, code levels, easy / medium / hard
- [Levels in action](docs/levels-in-action.md): the same three bugs explained at every level
- [Workflows and privacy](docs/workflows.md): review, plan, commit with tests, secrets
- [Install](docs/install.md): other agents, VS Code and Neovim, update and uninstall
- [Reference](docs/reference.md): configuration, how it works, other plugins, FAQ, troubleshooting
- [Development](docs/development.md): build, test, contribute

## License

MIT
