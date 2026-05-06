# Build Skills Installed

## Technologies Identified

- TypeScript (`.agents/scripts/` TypeScript-only scripting)
- Node.js (runtime — `process.exit`, `os.tmpdir`, `spawnSync`, `fs`)
- Vitest (unit + integration test runner)
- tsx (TypeScript script executor used in integration tests)
- picomatch (glob matching for `.bkitignore` parser — P2 dependency)
- pnpm (package manager — `pnpm bkit install/check/uninstall`)

## Already Installed

- brainstorming
- dispatching-parallel-agents
- executing-plans
- finishing-a-development-branch
- receiving-code-review
- requesting-code-review
- subagent-driven-development
- systematic-debugging
- test-driven-development
- using-git-worktrees
- using-superpowers
- verification-before-completion
- writing-plans
- writing-skills

## Newly Installed

- `vitest` — `antfu/skills@vitest` (16.8K installs; best match for Vitest 2 test runner)
- `typescript-advanced-types` — `wshobson/agents@typescript-advanced-types` (38.8K installs; best match for TypeScript-only scripting work)
- `nodejs-backend-patterns` — `wshobson/agents@nodejs-backend-patterns` (30.8K installs; best match for Node.js filesystem/process/spawn patterns)

## Not Found

- tsx (no dedicated skill; covered by Node.js + TypeScript skills)
- picomatch (no dedicated skill; library usage is straightforward, no skill needed)
- pnpm (no dedicated skill found matching this use case; pnpm usage is CLI invocation only)
