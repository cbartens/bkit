Verdict: FAIL
Failures: 2
Fixable: false
Tasks: 1, 2, 3, 4, 5
Loosened: none
Fingerprint: b40aea6fa293ec3000e0153ea76c5c3bcbc78933ddbd632161feb02c0880077e
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 groups)

## Integration Gaps

2 gaps, both failing tests from `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` (exit 1, verdict FAIL; stages `related` and `named` failed, `lint`, `format` and `types` passed; `related`: 1 failed of 9831 tests).

- `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts` `branches push exits 81 naming the holder when the pre-push hook's gate gave up on the tests lock`: `ENOTEMPTY` from `fs.rmSync(tmp, ...)` in `afterEach` (`:91`).
- `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests jump refuses a run name two waiting runs share`: the same `ENOTEMPTY` in `afterEach` (`:155`).

Both hooks send `SIGKILL` to each direct child and delete the temp folder at once, without waiting for the children to exit; a grandchild such as `scripts/ci/bkit-machine-lock.sh` can still be writing into the folder (`docs/testing.md` § Time limits: a kill reaches only the direct child). Neither file is in this feature's diff, a different one failed in each stage, and both pass alone on two runs. No group of this plan touches them, so both are logged `Fixable: false` for the owner.

No gap between the groups themselves: the values in the group 2 docs (`docs/testing.md` 5s / 10s unit, 30s integration under CI; 30s / 60s / 180s locally) match `vitest.timeout-budget.ts`, `scripts/ci/bkit-test-limits.mjs` (180000 / 180 locally, asserted in `scripts/ci/bkit-test-limits.test.mjs`) and the bats default in `tests/shell/setup_suite.bash` (180, asserted against `INTEGRATION_TEST_TIMEOUT_MS * LOCAL_HANG_FACTOR / 1000`). The template edits name `limitFactor`, `localLimit` and `tierTimeouts`, which the budget module exports.

## Previously Attempted

- None for the holistic scope; this is attempt 1.
- Group reports: `build-plan-verify-1-1.md` (FAIL, 2 gaps), `build-plan-gaps-remediate-1-1-log.md` (fixed the `CORPUS_CASE` JSDoc gap), `build-plan-verify-1-2.md` (FAIL, 1 gap), `build-decision-1-1.md` (owner accepted the TASK 2 search gap), `build-plan-verify-1-3.md` (PASS, tasks 1, 2, 3), `build-plan-verify-2-1.md` (PASS, tasks 4, 5).

## Notes

- `tmp/bkit-diff-814-local-test-limits.md` is the diff against `origin/dev`, and it also carries four commits from other features merged by branch-sync (950, 923, 920, discovered-gotchas). This verify judged the feature's own commits (`af5042814..HEAD`, 41 files outside `docs/plans/**`).
- TASK 1 satisfied: its search on `vitest.timeout-budget.ts` prints nothing (exit 1); `pnpm typecheck` exits 0; the budget tests pass in the run. The plan still shows `- [ ] **TASK 1:**` although `build-plan-verify-1-3.md` named it on its `Tasks` line; the code meets the task, so it is named again here for the workflow to tick.
- TASK 2 satisfied under `build-decision-1-1.md` (`Decision: Accept`, the owner's answer): the search prints exactly the 5 accepted lines in `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` (:67, :69, :70, :78, :80) and no other hit. `node --test scripts/ci/bkit-test-limits.test.mjs` passes 2/2.
- TASK 3 satisfied: the plan's listing finds only the guard's CONTROL strings at `vitest-timeout-budget.test.ts:114-115`, and the guard test passes in the run.
- TASK 4 satisfied: its search prints only `vitest-timeout-budget.test.ts:78` and `:80`, lines `build-decision-1-1.md` accepted with the same cause (as `build-plan-verify-2-1.md` also judged); `node dist/cli.js check` exits 0.
- TASK 5 satisfied: `node dist/cli.js ledgers query --ledger=knowledge --status=ACTIVE` does not list `spawn-heavy-unit-suite-needs-its-own-budget-under-load`.
- Every `Derived Test Matrix` row (plan :141-:151) has its test in a task's TEST FIRST, covered by that task's DONE WHEN, and passes. The plan has no `Documentation Updates` section. `docs/testing.md` and `docs/observability.md` are present; no task adds an error path to log.
- No test-first audit report was supplied for the holistic scope, and no `Updated tests`, `Unproven` or `Already landed` entries apply.
- Out of scope, for the owner: `tests/shell/setup_suite.bash` treats any non-empty `CI` (also `CI=false`) as CI and gives bats 30s, while `limitFactor` treats only `"true"` / `"1"` as CI. This predates the feature, and the plan changes only that file's comment.
- Out of scope, carried from group reports: `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts:41` passes `{ timeout: localLimit(200) }` to `spawnSync`, a child limit rather than a test limit; `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts:20-21` imports from `vitest.timeout-budget` twice; `.bkit/core/docs/templates/bkit-audit-dependencies.md:221` still says to record the load average for a timeout under heavy load.

## Identified Gaps Log

2 gaps.

- INTEGRATION: `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts` `branches push exits 81 naming the holder when the pre-push hook's gate gave up on the tests lock` failed in the `related` stage of `bkit tests changed --base=origin/dev` with `Error: ENOTEMPTY, Directory not empty` at `:91` (`fs.rmSync(tmp, { recursive: true, force: true })` in `afterEach`, right after `child.kill("SIGKILL")`). The file is not in this feature's diff (last changed by 872abbdca on dev) and passes alone twice (20/20 with the file below). No group of this plan touches it, so closing it needs a choice the plan does not make: fix the cleanup race in an out-of-plan file here, or record it as a known flake and fix it separately — Fixable: false
- INTEGRATION: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests jump refuses a run name two waiting runs share` failed in the `named` stage of the same run with the same `ENOTEMPTY` at `:155` (`fs.rmSync` in `afterEach` after `child.kill("SIGKILL")`). Same mechanism as the gap above, the same out-of-plan file history (872abbdca) and the same clean pass when run alone; the owner chooses as above — Fixable: false

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** branches-lock afterEach deletes its temp folder while a killed child tree still writes (ENOTEMPTY)
  **Severity:** HIGH · **Class:** failing-test · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts:91` · **Round:** 1
  - **DONE WHEN:** The owner decides: fix the afterEach cleanup race in this out-of-plan file, or record it as a known flake; then `branches push exits 81 naming the holder when the pre-push hook's gate gave up on the tests lock` passes in `bkit tests changed --base=origin/dev`
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/branches-lock.integration.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** tests-lock afterEach deletes its temp folder while a killed child tree still writes (ENOTEMPTY)
  **Severity:** HIGH · **Class:** failing-test · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts:155` · **Round:** 1
  - **DONE WHEN:** The owner decides: fix the afterEach cleanup race in this out-of-plan file, or record it as a known flake; then `tests jump refuses a run name two waiting runs share` passes in `bkit tests changed --base=origin/dev`
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts
<!-- bkit:task 2 end -->
