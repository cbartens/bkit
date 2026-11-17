Verdict: FAIL
Failures: 2
Fixable: true
Tasks: 1, 3
Loosened: none
Fingerprint: ceda00d849cd51c1409a42f51af16bd898afdfa34460dd6da328a46aae9cedc2
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 1 satisfied: the DONE WHEN grep on `vitest.timeout-budget.ts` prints nothing (exit 1), `pnpm typecheck` passes, and `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` passes (run with `.bkit/core/engine/tools/instructions.test.ts`: 123 tests passed). `limitFactor`, `LOCAL_HANG_FACTOR`, `localLimit`, the `limitFactor()` defaults, the removed `console.warn` and `node:os` import, and the rewritten header all match the task fields.
- TASK 2 not satisfied: its DONE WHEN grep prints 5 lines (see the gaps log). The other fields are done: `vitest.config.ts` no longer imports or calls `planUnitLoad`; the `vitest.setup.ts` comment describes the tier pick; `CORPUS_CASE` uses `localLimit(60_000)`; `scripts/ci/bkit-test-limits.mjs` and `tests/shell/setup_suite.bash` comments are updated; `scripts/ci/bkit-test-limits.test.mjs` asserts 180000 and 180 exactly and passes under `node --test`; the old `the run declares the load it is about to add` describe block is deleted.
- TASK 3 satisfied: the plan's listing grep finds only the guard's own CONTROL strings in `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` (excluded by the guard as SELF); the guard test passes; each of the 22 edited test files passed when run alone with `pnpm exec vitest run {file}` (1-139s each, no skips). `pnpm bkit:lint:file` and `prettier --check` on the changed files are clean.
- Test-first audit gap `delete-still-referenced` for TASK 1 (`planUnitLoad`) is no gap: the hits at `vitest-timeout-budget.test.ts:78` and `:80` are a regex and a CONTROL string in the planned guard test, not calls to the function; the `docs/failures.jsonl`, `docs/plans/**` and `floorplan/*` hits are append-only ledger rows, plan and log text, and a generated graph.
- Test-first audit: `Enforced: true`, `Unproven: 0`; all 12 TEST FIRST tests went red then green. No `Updated tests` or `Already landed` section.
- No decision records, earlier verify reports or remediate logs exist for group 1.
- Derived Test Matrix rows for tasks 1-3 (plan :141-:151) each have their test named in the task's TEST FIRST, and every one passes.
- `docs/testing.md` and `docs/observability.md` are present; this group adds no error paths to log.
- Out of scope, for the owner: the task 3 listing pattern also matched a child-process option, so `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts:41` now passes `{ timeout: localLimit(200) }` to `spawnSync` (1200ms locally) in the test `leaves an explicit timeout as the caller set it`. The test still passes and still proves the explicit timeout ends `sleep 30`, but this value is a child limit, not a test limit. `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts:20-21` now imports from `vitest.timeout-budget` twice; lint accepts it.

## Identified Gaps Log

2 gaps.

- TASK 2: DONE WHEN not met as written — `git grep -n -E "loadavg|UNIT_PLANNED_LOAD_PER_CORE|planUnitLoad|plannedLoadPerCore|MAX_LOAD_FACTOR|loadFactor" -- vitest.config.ts vitest.setup.ts scripts tests/shell .bkit/core/engine` exits 0 and prints 5 lines, all in `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` (:67, :69, :70, :78, :80). Every hit is a pattern or CONTROL string inside the planned TEST FIRST tests `the budget reads no load` and `vitest.config.ts spreads unitTimeouts and plans no load`, which the Derived Test Matrix rows at plan :146-:147 require to name `os.loadavg()` and `planUnitLoad`. The plan contradicts itself: closing the gap needs the owner to choose between narrowing the DONE WHEN pathspec to exclude the guard's own file, or rewriting the planned guard tests so they do not spell the tokens (no code step may rewrite a planned test) — Fixable: false
- TASK 2: `CORPUS_CASE` in `.bkit/core/engine/tools/instructions.test.ts:55-58` — the JSDoc above the updated constant still says the 60s base is "scaled by the load factor the tier budget uses (1 on CI)"; no load factor exists after this group, so the comment should say it is scaled by `localLimit` (1 under CI, else LOCAL_HANG_FACTOR) — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 2 DONE WHEN grep prints the planned guard tests own pattern strings
  **Severity:** HIGH · **Class:** done-when-unmet · **Fixable:** false · **Location:** `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:67` · **Round:** 1
  - **DONE WHEN:** git grep -n -E "loadavg|UNIT_PLANNED_LOAD_PER_CORE|planUnitLoad|plannedLoadPerCore|MAX_LOAD_FACTOR|loadFactor" -- vitest.config.ts vitest.setup.ts scripts tests/shell .bkit/core/engine prints nothing, and the named test files pass
  - **TEST FIRST:**
    - .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 2 CORPUS_CASE JSDoc still describes a load factor
  **Severity:** LOW · **Class:** stale-comment · **Fixable:** true · **Location:** `.bkit/core/engine/tools/instructions.test.ts:55` · **Round:** 1
  - **DONE WHEN:** The JSDoc above CORPUS_CASE says the 60s base is scaled by localLimit (1 under CI, else LOCAL_HANG_FACTOR), with no mention of a load factor
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
