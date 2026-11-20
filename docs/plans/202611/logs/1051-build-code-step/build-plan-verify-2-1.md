Verdict: PASS
Failures: 0
Fixable: false
Tasks: 3, 4
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode `Group`, group 2, judged against `build-diff-2-1.md` (commits `d89ce96a7` tests and `b771d80fd` code). The brief's `Deviations` section was applied: no frozen file (`tasks.ts`, `summary.ts`, `workflows.ts`, `branches.ts`, `prs.ts`, `land.ts`, `.bkit/instructions.md`, `.bkit/core/prompts/`, `.husky/*`, `.github/workflows/*`) is in the diff, and no workflow or prompt text changed.
- TASK 3 satisfied: `steps.ts` `finish` no longer returns on a failing `bkit:generate`; it logs the command, exit and last 20 lines, calls the new `recordGenerateFriction` (same shape as `recordTestLockFriction`, through `appendFrictionRow`), logs `generate: failed`, sets `generate = "failed"` and continues to the lock, the `bkit.workflows` check, the row and the commit. `EXIT_GENERATE_FAILED`, its `exitCodes` row and the exit-16 `generate` help are gone from `steps.ts` and `dist/commands/workflow/steps.js`. The `Callers` bullet in `.bkit/core/.bkit/workflows.md` and the rendered `.bkit/workflows.md` and the `docs/testing.md` `steps.test.ts` row are rewritten. `.bkit/core/.bkit/cli.md` and `.bkit/cli.md` never carried the exit-16 text (cli:sync renders no `exitCodes` rows); `pnpm exec tsx .bkit/core/engine/tools/cli-doc.ts` reports no drift. The remaining `exit 16` strings in the workflows docs and `branches.ts` belong to `bkit branches sync-dev`, a different command.
- TASK 4 satisfied: `finish` reads `bkit.workflows` from the working tree before it runs `bkit:generate` (`workflowsBefore`), refuses a HEAD-vs-before difference as the step's own edit (exit 13, message says `own edit`), and for a before-vs-after difference lets only all-added keys ride the commit when `isBkitOwnRepo(wfTop)` holds (logged, emitted and on the row as `generatedWorkflows`), else exits 13 naming `bkit:generate` and the keys. `isBkitOwnRepo(cwd, pkgRoot = getPkgRoot())` in `.bkit/core/engine/shared/package-roots.ts` uses `git rev-parse --path-format=absolute --git-common-dir`; the three inline `path.resolve(cwd) === getPkgRoot()` copies in `payload-links.ts` and `template-copies.ts` call it; no config key, env var, flag or `name` decides it. The doc sources stating the exit-13 refusal (`.bkit/core/.bkit/workflows.md`, rendered `.bkit/workflows.md`, `docs/testing.md`, the `exitCodes` row) all say this; no other doc source states it.
- The Task 4 tests name the scratch root by mocking `node:url` `fileURLToPath` for `package-roots`, not through the helper's `pkgRoot` parameter; `isBkitOwnRepo` itself runs unmocked, so this is not a mock of the unit under test. The parameter exists as DONE WHEN asks.
- Tests run: `steps.test.ts`, `package-roots.test.ts`, `payload-links.test.ts`, `payload-links.integration.test.ts`, `template-copies.test.ts`, `template-copies.integration.test.ts`: 6 files, 253 tests passed, none skipped. All eight `TEST FIRST` tests of the group are in `steps.test.ts` and pass.
- Test-first audit (`build-tests-green-2-1.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`, all eight tests red then green.
- Taken over: Task 3 `.bkit/core/engine/commands/workflow/steps.test.ts` `a failing bkit:generate exits 16 with nothing written and nothing committed` (from Task 1). Judged as a new Task 3 test: it now asserts exit 0, a new commit, the step row and one friction row, which matches Task 3's `DONE WHEN` and its matrix row. No gap. Its name still says `exits 16`, kept because the plan's `TEST FIRST` line and matrix row name it so.
- Derived Test Matrix: every Task 3 and Task 4 row has its test in that task's `TEST FIRST`.
- Decision record `build-decision-1-1.md` answers both challenge findings `B` (Fix now); Tasks 3 and 4 are those fixes, and the code follows the owner's rulings (a failing generate never refuses finish; added keys ride only in bkit's own repo). The record accepts no gap.
- Not run here, left to the group gate and later steps: a full typecheck, lint, the full suite and the plan's dogfood and text-ceiling checks.

## Identified Gaps Log

None

