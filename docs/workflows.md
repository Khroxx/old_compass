# Workflows and privacy

## Review before you commit

```
/compass-review
```

Old Compass runs the checkers it finds in your project (ESLint, Biome, TypeScript, Ruff, mypy, pytest, Clippy, go vet, Semgrep, ShellCheck, your test script), read-only. It translates their findings into plain explanations and adds what tools can't see: logic, design, naming, missing comments. Findings come most important first: exposed secrets, bugs, security, correctness, performance, best practices, comments, lint. How many depends on your [level](modes.md#levels-easy-medium-hard): 3 explained in detail on easy, 5 on medium, everything worth mentioning on hard. Plus one honest line about something you did well.

## Plan something bigger

```
/compass-plan add percentage discount codes to the cart
```

Grandpa asks 2–4 questions first, lays out 2–3 approaches with trade-offs, and lets you pick. The chosen approach becomes small steps, each with the files to touch and the concept you'll need. No implementation code in the plan, only steps, signatures and pseudocode.

## Work through a plan

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

## Commit and push

Old Compass never runs `git commit`, `git push` or `git pull`, in any code level. A hook blocks them and Grandpa teaches you instead:

- **Test first.** He asks you to run the project's tests (he names the command he finds) and only goes on when they're green. A diff without a test change gets pointed out.
- **A green is remembered** for this exact code. Say or paste that the tests passed and he remembers it; edit a file afterwards and the green goes stale. `/compass tested` tells him by hand.
- **Commit:** he suggests one message (short imperative subject, a body for the why) and tells you to split a diff that mixes two things.
- **Push and pull:** he tells you what to check first (`git log origin/<branch>..HEAD`, `git fetch`) and what to do if it's rejected.

You type the commands. `/compass off` hands git back.
