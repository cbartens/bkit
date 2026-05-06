# Build Skills Installed

## Technologies Identified

- TypeScript (new `bkit-preflight.ts` and `bkit-postinstall.ts` files; structured interfaces, type narrowing, union types like `"blocker" | "advisory"`, `"present" | "missing" | "unknown"`)
- Vitest (unit tests per detector + integration tests in `bkit-install.integration.test.ts`)
- Node.js `fs` / `execSync` (file-system detection, shell-out to `gh secret list`, `vercel env ls`, `vale --version`)
- Semver comparison (version compare in `detectBkitVersionPinStale` and `detectBkitVersionMajorDowngrade`)
- GitHub Actions YAML (ci.yml parsing in `detectCiYmlMissingTokenEnv`)

## Already Installed

- `vitest` — covers Vitest unit and integration test authoring
- `test-driven-development` — covers TDD patterns (positive + negative test cases per detector)
- `github-actions-docs` — covers GitHub Actions YAML structure (ci.yml detection)
- `executing-plans` — build execution guidance
- `systematic-debugging` — debugging methodology
- `verification-before-completion` — verification gates
- `brainstorming`, `dispatching-parallel-agents`, `finishing-a-development-branch`, `receiving-code-review`, `requesting-code-review`, `subagent-driven-development`, `using-git-worktrees`, `using-superpowers`, `writing-plans`, `writing-skills`

## Newly Installed

- `typescript-advanced-types` (`wshobson/agents@typescript-advanced-types`) — TypeScript interface design, discriminated unions, type narrowing; directly applicable to `PreflightFinding` interface and the multi-phase accumulator pattern

## Not Found

- `semver` — no well-adopted semver skill found (top results had <20 installs); version comparison handled inline with string-split major extraction as specified in the plan
- Node.js `fs`/`execSync` patterns — no dedicated skill; covered by `typescript-advanced-types` and existing `test-driven-development`/`vitest` skills for mocking patterns
