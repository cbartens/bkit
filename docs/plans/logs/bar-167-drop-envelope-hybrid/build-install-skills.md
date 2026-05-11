# Build Skills Installed

## Technologies Identified

- TypeScript — all `.agents/scripts/*.ts` source and test files; primitives (`deepContains`, `writeTier2JsonContained`, `migrateLegacyBkitEnvelope`, `stripTier2JsonScope`), manifest schema, CLI modules
- Vitest — unit and integration test suites (`*.test.ts`, `*.integration.test.ts`) across all three sub-plans
- Node.js — `node:path`, `node:url`, `node:fs` used in `bkit-paths.ts` and throughout CLI scripts; atomic-write (temp + rename) patterns
- pnpm / Turborepo — `pnpm turbo lint typecheck format:check test` pipeline; `pnpm bkit` CLI
- JSON — deep-containment schema manipulation (`deepContains`, `deepMergeJson`, `stripTier2JsonScope`); `.bkit-version` writer narrowing
- YAML — marker insertion (`# bkit:start` / `# bkit:end`) into `.github/workflows/ci.yml`, `.vale.ini`, `.husky/pre-push`
- Markdown / MDC — marker insertion (`<!-- bkit:start -->` / `<!-- bkit:end -->`) into Group A templates (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/00-shared-rules.mdc`, `.agents/*.md`, etc.)
- Git — worktree operations, atomic commit boundaries per sub-plan, path-scoped diff verification

## Already Installed

- brainstorming
- dispatching-parallel-agents
- executing-plans
- find-skills
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

- `typescript-advanced-types` — `wshobson/agents@typescript-advanced-types` (TypeScript advanced type patterns; covers `deepContains` return-type inference, `ManifestEntry` union types, `BkitVersion` schema)
- `vitest` — `antfu/skills@vitest` (Vitest unit + integration test authoring; covers `pnpm vitest run` invocations, test block structure, fixture loading patterns)
- `nodejs-backend-patterns` — `wshobson/agents@nodejs-backend-patterns` (Node.js `node:path`/`node:fs` patterns; covers atomic-write temp+rename, `getPkgRoot()` extraction, CLI module design)

## Not Found

- None — all identified technology gaps were matched and installed.
