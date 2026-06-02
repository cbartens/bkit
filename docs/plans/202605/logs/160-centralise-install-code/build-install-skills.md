# Build Skills Installed

## Technologies Identified

- TypeScript (source language for `.agents/scripts/*.ts` engine being refactored)
- Node.js (runtime for all CLI scripts)
- Vitest (unit + integration test runner — tests must pass at every gate)
- pnpm (package management — tarball pack/install/upgrade assertions)
- Git (git mv, worktrees — central to the physical move in WS-3)
- tsc / TypeScript compiler (compile `.agents/scripts/*.ts` → `dist/*.js`)

## Already Installed

- `brainstorming`
- `dispatching-parallel-agents`
- `executing-plans`
- `find-skills`
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

- `.agents/skills/vitest` — `antfu/skills@vitest` (Vitest testing framework)
- `.agents/skills/typescript-advanced-types` — `wshobson/agents@typescript-advanced-types` (TypeScript/tsc refactoring)
- `.agents/skills/pnpm` — `antfu/skills@pnpm` (pnpm pack/install/upgrade workflows)

## Not Found

- Node.js — no dedicated Node.js runtime skill found with strong relevance (existing `test-driven-development` + `systematic-debugging` cover the gap adequately)
