# Build Skills Installed

## Technologies Identified

- TypeScript (`.agents/scripts/*.ts` — CLI modules, test files)
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
- `receiving-code-review`
- `requesting-code-review`
- `subagent-driven-development`
- `systematic-debugging`
- `test-driven-development`
- `using-git-worktrees`
- `using-superpowers`
- `verification-before-completion`
- `writing-plans`
- `writing-skills`

## Newly Installed

- `.agents/skills/vitest` — `antfu/skills@vitest` (17.2K installs). Covers Vitest 2 unit and integration test authoring patterns used across all Phase C tasks (C1a–C9g).
- `.agents/skills/github-actions-docs` — `xixu-me/skills@github-actions-docs` (114K installs). Covers GHA workflow authoring, `workflow_run` trigger semantics, `concurrency` / `cancel-in-progress`, `permissions:` hardening, and `claude-code-action@v1` step wiring used in Phase A tasks (A1, A2).

## Not Found

- TypeScript (no install-module-focused TypeScript skill matched; general TS authoring is covered by `test-driven-development` + `executing-plans` superpowers)
- pnpm (package manager, not a skill gap)
- Linear (MCP-native integration — no skill registry match relevant to `mcp__linear__*` tool usage)
- YAML (in-process parsing via existing `js-yaml` library — no actionable skill gap)
- GitHub CLI (`gh`) (no dedicated gh-CLI skill found; usage is standard shell invocations covered by existing superpowers)
