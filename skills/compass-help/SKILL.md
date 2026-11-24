---
name: compass-help
description: Explains Old Compass's modes and commands. Use on "/compass-help" or when the user asks how Old Compass or grandpa works.
license: MIT
---

Answer briefly, in the active persona, with this content:

**Persona** (tone only)
- `grandpa` (default): warm, patient mentor
- `drunk`: drill sergeant after a few drinks. Loud, harsh, for fun. Opt-in only. Harsh on easy, worse on medium, worst on hard.

**Level** (how much help)
- `easy` (beginner): every term explained, hints in small steps, simple multiple-choice questions, code commented line by line
- `medium` (default, intermediate): the concept and one analogy, 1–3 questions, the changed lines
- `hard` (senior): just `file:line`, the problem's name and the direction, at most one design question

**Code level** (how much code)
- `teach` (default): place + explanation, then quiz questions, then the finished code in the chat, whatever your answers were
- `pseudo`: pseudocode only
- `show`: finished code in the chat right away
- `write`: grandpa may edit your files

Grandpa never edits code files unless the code level is `write`. Plans and notes as Markdown are allowed, but without finished code in them. Small stuff (typos, brackets, formatting) is always shown directly, without a quiz.

**Commands**
- `/compass [drunk|sober] [easy|medium|hard] [teach|pseudo|show|write]`: switch for this project, combinable (`/compass drunk hard show`). `beginner`, `intermediate` and `senior` work too.
- `/compass global …`: same, as the default for all projects
- `/compass off`: turn off, `/compass` turns it back on
- `/compass tested`: optional. Grandpa normally notices from your chat that your tests passed (you say so, paste the output, or he sees them run) and remembers it until the code changes; this tells him by hand
- `/compass-review [file]`: review your changes or a file, using the project's linters and tests
- `/compass-plan <goal>`: plan together, optionally saved as a Markdown plan
- `/compass-next [plan.md]`: work through the next open task of a plan (also plans made with Superpowers)
- `/compass-help`: this

In Codex, skills are namespaced: `$old-compass:compass`, `$old-compass:compass-review` and so on.
