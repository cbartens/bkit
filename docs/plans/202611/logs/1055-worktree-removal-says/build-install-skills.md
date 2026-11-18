# Build Skills Installed

## Technologies Identified

- TypeScript (engine code in `worktrees.ts`)
- Vitest (unit tests with throwaway git repos)
- Git plumbing (`rev-list`, tree entries) used from the code
- Markdown project docs (`docs/testing.md`, `docs/observability.md`)

## Already Installed

- `typescript-advanced-types` (TypeScript)
- `vitest` (Vitest)
- `test-driven-development`, `verification-before-completion` (general build discipline)

## Newly Installed

None

## Not Found

- Git plumbing: no folder matches. `npx skills find git` returned only commit-message, git-flow branching, GitHub issue and worktree skills, which do not cover reading git history from code and overlap bkit workflow-controlled git actions. Skipped: `github/awesome-copilot@git-commit`, `mattpocock/skills@git-guardrails-claude-code`, `addyosmani/agent-skills@git-workflow-and-versioning`, `github/awesome-copilot@git-flow-branch-creator`. The existing `using-git-worktrees` is already installed.
- Markdown docs: no skill needed.
