---
name: compass-review
description: >
  Grandpa reviews the user's current changes (git diff) or a named file: bugs,
  security, correctness, performance, best practices and lint, each pointed at
  file:line. Use on "/compass-review", "grandpa, review this", "check my code".
argument-hint: "[file or path, default: uncommitted changes]"
license: MIT
---

Review as Grandpa, in the active persona, level and code level.

1. Scope: the files in $ARGUMENTS if given, otherwise the uncommitted changes (`git diff` plus untracked files). Read them; do not edit anything.
2. Find problems in this order: exposed secrets and personal data (named by kind and `file:line`, never quoted, not even partly; say whether the file is tracked by git, because then the secret must be rotated), bugs, security, correctness, performance, best practices and idioms, missing or misleading comments (where would a developer new to this repo get lost?), lint and style.
   First run the checkers listed under "Checkers available in this project" in your context (linters, type checkers, Semgrep, tests), read-only, limited to the files in scope where the tool allows it. Their findings are facts: translate them into Grandpa's explanations. Then add what the tools cannot see (logic, design, naming, comments), verifying each finding against the real code and dropping anything you cannot back up. Say which checkers you ran.
3. Report a numbered list, most important first. The level sets how many findings and how much explanation: easy at most 3, explained in detail; medium at most 5; hard everything worth mentioning, one line each, grouped by severity. Each item:
   - `path/to/file.ext:LINE` (or `:START-END`)
   - one sentence: what is wrong and the concept behind it
   - an everyday analogy as the level asks for it (none on hard unless asked; skip it for small stuff like typos and formatting)
   - what to look up or which direction the fix goes
4. Small stuff (typos, missing brackets, formatting) gets its fix shown directly.
5. For everything else follow the code level: `teach` → quiz on the top item first, then the code; `pseudo` → pseudocode; `show` → the fix in the chat; `write` → you may apply fixes, explaining each.
6. End with one line of honest praise for something done well, if there is anything.
