Verdict: FAIL
Failures: 1
Fixable: false
Tasks: 1, 3
Loosened: none
Fingerprint: 3d687f0540f69b741c7e20cdb400dd85413d4df8bad7937164ad05f5c009166e
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `docs/plans/202611/logs/814-local-test-limits/build-plan-verify-1-1.md`: FAIL, 2 gaps (TASK 2 DONE WHEN grep, Fixable: false; TASK 2 `CORPUS_CASE` JSDoc, Fixable: true).
- `docs/plans/202611/logs/814-local-test-limits/build-plan-gaps-remediate-1-1-log.md`: fixed the JSDoc gap only (commit `ba7051e33`).

## Notes

- Attempt 1's `CORPUS_CASE` JSDoc gap is closed: `.bkit/core/engine/tools/instructions.test.ts:55-58` now says the 60s base is scaled by `localLimit` (1 under CI, else LOCAL_HANG_FACTOR).
- TASK 1 satisfied: the DONE WHEN grep on `vitest.timeout-budget.ts` prints nothing (exit 1), `pnpm typecheck` passes, and `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` passes (run with `.bkit/core/engine/tools/instructions.test.ts`: 2 files, 123 tests passed).
- TASK 2 not satisfied: its DONE WHEN grep still prints 5 lines (see the gaps log). Its other fields are done, and `node --test scripts/ci/bkit-test-limits.test.mjs` passes (2/2).
- TASK 3 satisfied: the guard test passes; the 22 edited test files each passed alone in attempt 1, and since then only a comment in `.bkit/core/engine/tools/instructions.test.ts` changed, which passes.
- Test-first audit (`build-tests-green-1-2.md`): `Enforced: true`, `Unproven: 0`, all 12 TEST FIRST tests red then green. Its `delete-still-referenced` gap for TASK 1 (`planUnitLoad`) is no gap: the hits at `vitest-timeout-budget.test.ts:78` and `:80` are a regex and a CONTROL string in the planned guard test, not calls; the `docs/failures.jsonl`, `docs/plans/**` and `floorplan/*` hits are ledger rows, plan and log text, and a generated graph. No `Updated tests` or `Already landed` section.
- No decision records (`build-decision-*.md`) exist, so nothing accepts the TASK 2 DONE WHEN gap; it stays Fixable: false and needs the owner's choice.
- Derived Test Matrix rows for tasks 1-3 (plan :141-:151) each have their test in the task's TEST FIRST, and every one passes.
- `docs/testing.md` and `docs/observability.md` are present; this group adds no error paths to log.
- Out of scope, carried from attempt 1: `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts:41` now passes `{ timeout: localLimit(200) }` to `spawnSync`, a child-process limit rather than a test limit; `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts:20-21` imports from `vitest.timeout-budget` twice.

## Identified Gaps Log

1 gap.

- TASK 2: DONE WHEN not met as written — `git grep -n -E "loadavg|UNIT_PLANNED_LOAD_PER_CORE|planUnitLoad|plannedLoadPerCore|MAX_LOAD_FACTOR|loadFactor" -- vitest.config.ts vitest.setup.ts scripts tests/shell .bkit/core/engine` still exits 0 and prints 5 lines, all in `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` (:67, :69, :70, :78, :80). Every hit is a pattern or CONTROL string inside the planned TEST FIRST tests `the budget reads no load` and `vitest.config.ts spreads unitTimeouts and plans no load`, which Derived Test Matrix rows at plan :146-:147 require to name `os.loadavg()` and `planUnitLoad`. Same gap as attempt 1; no decision record resolves it. The owner must choose between narrowing the DONE WHEN pathspec to exclude the guard's own file, or rewriting the planned guard tests so they do not spell the tokens (no code step may rewrite a planned test) — Fixable: false

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 2 DONE WHEN grep prints the planned guard tests own pattern strings
  **Severity:** HIGH · **Class:** done-when-unmet · **Fixable:** false · **Location:** `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:67` · **Round:** 1
  - **DONE WHEN:** git grep -n -E "loadavg|UNIT_PLANNED_LOAD_PER_CORE|planUnitLoad|plannedLoadPerCore|MAX_LOAD_FACTOR|loadFactor" -- vitest.config.ts vitest.setup.ts scripts tests/shell .bkit/core/engine prints nothing, and the named test files pass
  - **TEST FIRST:**
    - .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts
<!-- bkit:task 1 end -->
