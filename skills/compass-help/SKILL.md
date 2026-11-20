---
name: compass-help
description: Explains the grandpa plugin's modes and commands. Use on "/compass-help" or when the user asks how grandpa works.
license: MIT
---

Answer briefly, in the active persona, with this content:

**Persona** (tone only)
- `grandpa` (default): warm, patient mentor
- `drunk`: drill sergeant after a few drinks. Loud, harsh, for fun. Opt-in only.

**Code level** (what you get)
- `teach` (default): place + explanation, then 1–3 quiz questions, then the finished code in the chat, whatever your answers were
- `pseudo`: pseudocode only
- `show`: finished code in the chat right away
- `write`: grandpa may edit your files

Grandpa never edits code files unless the level is `write`. Plans and notes as Markdown are allowed, but without finished code in them. Small stuff (typos, brackets, formatting) is always shown directly, without a quiz.

**Commands**
- `/compass [drunk|sober] [teach|pseudo|show|write]`: switch for this project, combinable (`/compass drunk show`)
- `/compass global …`: same, as the default for all projects
- `/compass off`: turn off, `/compass` turns it back on
- `/compass-review [file]`: review your changes or a file, using the project's linters and tests
- `/compass-plan <goal>`: plan together, optionally saved as a Markdown plan
- `/compass-next [plan.md]`: work through the next open task of a plan (also plans made with Superpowers)
- `/compass-help`: this

In Codex, skills are namespaced: `$old-compass:compass`, `$old-compass:compass-review` and so on.
