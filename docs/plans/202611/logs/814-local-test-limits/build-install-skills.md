# Build Skills Installed

## Technologies Identified

TypeScript, Vitest, Node built-in test runner (`node --test`), bats (shell tests), bash, Markdown docs and JSONL ledgers.

## Already Installed

- `typescript-advanced-types`
- `vitest`
- `bats-testing-patterns`
- `bash-scripting`
- `test-driven-development`

## Newly Installed

None

## Not Found

- Node built-in test runner (`node --test`): `npx skills find node:test` gave no accepted match. Skipped `paldom/node-skills@node-testing` (64 installs, unverified personal repo), `avbel/ai-skills@manual-testing-node-js` (31 installs, unverified personal repo) and `mcollina/skills@node` (a general Node skill, not about the test runner). The change to `scripts/ci/bkit-test-limits.mjs` is a constant and comment edit, so no skill is needed.
