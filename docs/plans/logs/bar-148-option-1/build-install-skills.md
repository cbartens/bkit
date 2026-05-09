# Build Skills Installed

## Technologies Identified

- TypeScript (`.agents/scripts/*.ts` — CLI modules, installer, test files)
- Node.js / ESM (runtime for all CLI scripts)
- Vitest (unit `*.test.ts` + integration `*.integration.test.ts` test runner)
- GitHub Actions / GHA YAML (new workflow files: `.github/workflows/bkit-ci-router.yml`, template, `workflow_run` trigger, `claude-code-action@v1`)
- pnpm (package management, `pnpm install --frozen-lockfile`, `pnpm bkit install`)
- Linear (MCP-native `mcp__linear__*` tools — no standalone skill needed)
- YAML parsing (in-process via existing JS library — no standalone skill needed)
- GitHub CLI (`gh` — stale-run guard, PR queries, label checks)

## Already Installed

- `brainstorming`
- `dispatching-parallel-agents`
- `executing-plans`
- `finishing-a-development-branch`
- `github-actions-docs`
- `receiving-code-review`
- `requesting-code-review`
- `subagent-driven-development`
- `systematic-debugging`
- `test-driven-development`
- `using-git-worktrees`
- `using-superpowers`
- `verification-before-completion`
- `vitest`
- `writing-plans`
- `writing-skills`

## Newly Installed

- `.agents/skills/typescript-advanced-types` — `wshobson/agents@typescript-advanced-types` (39.4K installs). Covers advanced TypeScript type patterns used across Phase B installer module changes (`bkit-modules.ts`, `bkit-cli.ts`) and Phase C test authoring.

## Not Found

- pnpm (package manager, not a skill gap)
- Linear (MCP-native integration — no skill registry match relevant to `mcp__linear__*` tool usage)
- YAML (in-process parsing via existing `js-yaml` library — no actionable skill gap)
- GitHub CLI (`gh`) (no dedicated gh-CLI skill found; usage is standard shell invocations covered by existing superpowers)
