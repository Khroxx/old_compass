# Install

Claude Code and Codex are covered in the [README](../README.md#install). This page has the rest.

## Other agents (rules only)

Copy the matching template from [`rules/`](../rules/) into your project, at the path your agent reads:

| Agent | Template | Copy it to |
|---|---|---|
| Cursor | [`rules/cursor/old-compass.mdc`](../rules/cursor/old-compass.mdc) | `.cursor/rules/old-compass.mdc` |
| Windsurf | [`rules/windsurf/old-compass.md`](../rules/windsurf/old-compass.md) | `.windsurf/rules/old-compass.md` |
| Cline | [`rules/cline/old-compass.md`](../rules/cline/old-compass.md) | `.clinerules/old-compass.md` |
| GitHub Copilot | [`rules/copilot/copilot-instructions.md`](../rules/copilot/copilot-instructions.md) | `.github/copilot-instructions.md` |
| Anything that reads `AGENTS.md` | [`rules/generic/old-compass.md`](../rules/generic/old-compass.md) | `AGENTS.md` (or append it to yours) |

For example, from your project folder:

```bash
mkdir -p .cursor/rules && curl -fsSL https://raw.githubusercontent.com/YOUR_GITHUB/old-compass/main/rules/cursor/old-compass.mdc -o .cursor/rules/old-compass.mdc
```

These agents get the full ruleset, but no hooks: no hard edit guard, no secret guard, no per-project modes and no slash commands. Switch by saying it: "grandpa, drunk mode", "grandpa, show the code".

## VS Code and Neovim

Old Compass lives inside the agent, so it works wherever the agent runs: the Claude Code or Codex extension in VS Code, or the CLI in a Neovim terminal split. `file:line` references are clickable in both.

## Update and uninstall (Claude Code)

```
/plugin marketplace update old-compass
/plugin uninstall old-compass@old-compass
```
