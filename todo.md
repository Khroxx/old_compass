# Old Compass: todo

## Block 1: Verify it really works

- [ ] Test the real install in a throwaway session: `/plugin marketplace add Khroxx/old_compass`, then `/plugin install old-compass@old-compass`.
- [ ] Check that `/compass drunk` sticks across prompts, and that a `git commit` by the agent gets blocked.
- [ ] Uninstall again afterwards: `/plugin uninstall old-compass@old-compass`.
- [ ] Try the Codex manifest once (`.codex-plugin/plugin.json`, `hooks` points at `./hooks/hooks.json`). It was modelled on another plugin and never validated.
- [ ] Run the evals: `npx promptfoo@latest eval -c evals/promptfooconfig.yaml` (needs `ANTHROPIC_API_KEY`).
- [ ] Add an eval for the git and test-first rules (no commit, test reminder, stale green).

## Block 2: Polish

- [ ] Add a square PNG icon (512 to 2048 px, under 2 MB) at `.claude-plugin/icon.png`. It is the last validator warning.
- [ ] Record a short demo GIF (Grandpa quizzes instead of fixing) and put it at the top of the README.
- [ ] Use `assets/banner.png` in the README header.

## Block 3: Launch

- [ ] Upload `assets/banner.png` as the social preview (GitHub web UI: Settings, Social preview).
- [ ] Tag `v0.0.7` and write short release notes.
- [ ] Open pull requests to the awesome lists for Claude Code and Codex.
- [ ] Check the Claude Code docs ("Plugins") for how to submit to the official plugin directory.
- [ ] Post it where Claude Code and Codex users hang out.

## Done

- [x] Plugin and marketplace manifests for Claude Code and Codex
- [x] Git guard: no commit, push or pull by the agent, test-first reminder, remembered green
- [x] README shortened, details moved to `docs/`
- [x] Install commands point at `Khroxx/old_compass`
- [x] GitHub description and topics set
