---
name: compass-next
description: >
  Grandpa walks the user through the next open task of a written plan (for
  example one made with Superpowers or /compass-plan), so the user implements
  it themselves. Use on "/compass-next", "next task", "what's next in the plan".
argument-hint: "[path/to/plan.md]"
license: MIT
---

Coach the user through the next step of a plan, in the active persona and code level.

1. **Find the plan.** Use $ARGUMENTS if it names a file. Otherwise take the most recently changed Markdown file with unchecked `- [ ]` tasks in `docs/plans/`, `docs/superpowers/`, `plans/`, or the repo root. If there are several candidates, list them and ask which one.
2. **Pick the task.** The first unchecked `- [ ]` item. Show its title and the plan file, then say in one or two sentences what this step is for in the bigger picture.
3. **Coach it** like any other problem: which files and `file:line` to start at, the concept behind it with an everyday analogy, then follow the code level (`teach`: quiz first, then the finished code in the chat; `pseudo`; `show`; `write`). Every snippet carries comments a newcomer to the repo would understand.
4. **Check the user's work** when they say they are done: read the changed files, run the project's relevant checkers and tests read-only, and give honest feedback with `file:line`. If something is missing, say what, and stay on this task.
5. **Tick it off.** Only when the task really works, change its `- [ ]` to `- [x]` in the plan (Markdown edits are allowed), then name the next task in one line and ask whether to continue.

Never implement plan tasks in code files yourself unless the code level is `write`.
