# Build Skills Installed

## Technologies Identified

- Bash/shell scripting (`.bkit/scripts/bkit-runtime.sh`, `bkit_wait_ci`, close-guard helpers)
- Bats shell testing (`tests/*.bats` audits, per Sub-Plan 1/2/3)
- GitHub Actions (CI-dispatch gate, workflow-run polling, branch protection)
- Vitest/TypeScript (`.bkit/src/*.test.ts`)
- GitHub CLI (`gh`) + GitHub MCP server
- Git worktrees, NDJSON status ledger (`status.jsonl`)

## Already Installed

- `using-git-worktrees` (git worktree workflow — covers worktree-model tasks)
- `writing-plans`, `executing-plans`, `verification-before-completion`, `test-driven-development`, `systematic-debugging`, `subagent-driven-development`, `dispatching-parallel-agents` (general agent process, already cover TS/vitest TDD loop)
- `finishing-a-development-branch`, `requesting-code-review`, `receiving-code-review`, `brainstorming`, `using-superpowers`, `writing-skills`, `find-skills`

## Newly Installed

- `wshobson/agents@bats-testing-patterns` → `.agents/skills/bats-testing-patterns` (bats shell-test authoring, needed for `tests/*.bats` audits)
- `wshobson/agents@shellcheck-configuration` → `.agents/skills/shellcheck-configuration` (shell-script lint/quality, needed for `bkit-runtime.sh` shim + workflow header bash blocks)
- `wshobson/agents@github-actions-templates` → `.agents/skills/github-actions-templates` (GitHub Actions workflow patterns, needed for CI-dispatch/`bkit_wait_ci` and `.mcp.json`/`actions` toolset work)

## Not Found

None — all identified technology gaps matched an installable skill.
