Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4
Loosened: none
Fingerprint: 608cd9d9918aeff8c9f30eab7d2b25f9abd1521cbb5492998256a38581f228ac
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 groups).

## Integration Gaps

0. Group 1 (TASK 1-3) makes every workflow adopt the session's checkout when the session is on the target; group 2 (TASK 4) refuses design / plan / build when that checkout is the main checkout under `--worktrees` (or `--detect` resolving to worktrees). The two meet cleanly in `.bkit/core/engine/commands/workflow/worktrees.ts:1253-1264`: the refusal sits after `mint` and before any mint, log-dir or marker write, and compares `real(show-toplevel)` with `real(root)`, so a linked worktree (host-made, or bkit's own `.worktrees/{FID}`) still reaches the group 1 `adoptRoot` path, while ship and debug fall outside the refusal and keep in-place adoption of the main checkout. Debug already adopted in place on its target before this change (the `else if (workflow !== "debug" || session !== target)` guard), so dropping the ship-only term changes nothing for it. `worktreePath`, `logDir`, `branch` and `baseRef` read `wt` (= `adoptRoot` when adopted); `repoRoot`, the ownership marker and `openSharedRecord` stay on `root`; copy, install and rebase still run only for `created` / `resumed`. The `adopted` row and exit-7 list in `.bkit/core/.bkit/workflows.md` and the installed `.bkit/workflows.md` (identical over lines 1355-1380), the `EXIT_REFUSED` help text in source and `dist/`, and the `docs/testing.md` worktrees row all describe both groups' behaviour together.

## Previously Attempted

- `build-plan-verify-holistic-1-1.md`: Holistic, PASS, Tasks 1, 2, 3 (run before the challenge added group 2).
- `build-plan-verify-1-1.md`: Group 1, PASS, Tasks 1, 2, 3.
- `build-plan-verify-2-1.md`: Group 2, CONCERNS, 1 doc-drift gap; closed by `build-plan-gaps-remediate-2-1-log.md`.
- `build-plan-verify-2-2.md`: Group 2, PASS, Task 4.

## Notes

Judged against the full feature diff `tmp/bkit-diff-919-worktree-setup-tries.md` (8 files: the engine source, its two test files, `dist/`, the source and installed `workflows.md`, `.bkit/version` and `docs/testing.md`). No workflow or prompt file changed, matching the plan's footprint.

- TASK 1: `grep -c 'workflow === "ship" && session === target'` prints 0 for the source; `mint` is `worktrees && session !== target`; `adoptRoot` feeds `wt` and the four adopted-block branch reads. The four unit tests and the integration test named in its `TEST FIRST` exist; `adopts the main checkout even when called from a linked worktree` and the ship and debug cases still pass.
- TASK 2: `grep -c` prints 0 for `dist/commands/workflow/worktrees.js`, and its diff mirrors both groups' source changes, including the `EXIT_REFUSED` text. `pnpm build` was not rerun (the mandate forbids builds); the orchestrator's gates catch a rebuild diff.
- TASK 3: the `adopted` row no longer says `worktreePath` = repo root unconditionally; `.bkit/workflows.md` matches its source and its `.bkit/version` hash is updated; the `docs/testing.md` row names the new cases, including TASK 4's exit 7.
- TASK 4: `refuses design, plan and build in place in the main checkout on feat/{fid} under --worktrees` asserts exit 7, the `main checkout` message and no log directory for all three workflows. Its `DONE WHEN` names the behaviour that test checks rather than the test by name; the test is its `TEST FIRST` and the matrix row points to TASK 4, so the row is covered. The plan's Mandatory Tasks box still says "each row's test is in task 1's `DONE WHEN`"; that is plan text, not a code gap.
- Tests: ran `worktrees.test.ts` and `worktrees.integration.test.ts` with vitest in this step: 2 files, 158 tests, all passed. The full suite was not run (the orchestrator runs gates under a load guard); `build-holistic-gate-1-1.md` predates group 2.
- Test-first audit: no report was supplied to this step. The latest group report `build-tests-green-2-2.md` shows `Enforced: true`, PASS, 0 gaps, 0 unproven. Group 1's accepted test `a plan session on another branch still mints .worktrees/{fid}` guards behaviour that already existed (`build-plan-verify-1-1.md`).
- Observability: the only new error path is a `CommandError` the CLI prints with its exit code; `docs/observability.md` needs nothing.
- Both `Documentation Updates` rows are done. No decision records exist for this run.

## Identified Gaps Log

None
