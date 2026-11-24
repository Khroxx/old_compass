# Development

Working on Old Compass itself with an agent? The repo's own [`AGENTS.md`](../AGENTS.md) and `CLAUDE.md` are a contributor guide: they tell the agent it's building the plugin, so it codes normally here. The Grandpa rules only ship as templates in `rules/`, where no agent loads them for this repo. If you have the plugin installed, run `/compass off` (or `/compass write`) in this repo.

```bash
npm run build   # regenerate the skill, output style and the rule templates in rules/
npm test        # hooks (run exactly as hooks.json calls them), guard, secrets, checkers, eval graders
npx promptfoo@latest eval -c evals/promptfooconfig.yaml   # behaviour evals, needs ANTHROPIC_API_KEY
```

Edit rule texts only in `hooks/instructions.js`, then run `npm run build`. A test fails if the generated files are out of date.

The evals check what rules alone can't guarantee: that Grandpa waits after the quiz, cites the right line, keeps code out of `pseudo` mode and plans, comments his snippets, never repeats a secret, shouts in drunk mode and drops the act when you're genuinely down.

Requires Node 18+.
