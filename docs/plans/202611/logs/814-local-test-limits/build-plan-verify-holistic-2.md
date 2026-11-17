Verdict: FAIL
Failures: 1
Fixable: false
Tasks: 1, 2, 3, 4, 5
Loosened: none
Fingerprint: b9b68e34fdcc6b87dec8b962fb94eed3db363159106fc6994cc78204bc6561dd
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 groups)

## Integration Gaps

1 gap, a failing test from `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` (exit 1, verdict FAIL; stages `related` and `named` failed, `lint`, `format` and `types` passed; `related`: 1 failed of 9831 tests, `named`: 1 failed of 8737).

- `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `analyses dense script sources in linear time`: its own wall-clock check `expect(r.ms).toBeLessThan(1000)` (`:704`) saw 2074 ms, then 2357 ms. The run had load averages near 28-32. The file is outside this feature's diff (last changed by e4377aad7 on dev), and the test passes alone 3/3. The feature scales test and hook time limits only, never an in-test wall-clock assertion, so the feature does not cause this failure. `build-decision-1-2.md` covers only the two `ENOTEMPTY` races, so this test is logged `Fixable: false` for the owner.

The two `ENOTEMPTY` tests from attempt 1 (`branches-lock.integration.test.ts`, `tests-lock.integration.test.ts`) passed in this run. Either way, `build-decision-1-2.md` accepts them.

No gap between the groups themselves: the group 2 docs state the same values as the code (`docs/testing.md`: 5s / 10s unit and 30s integration under CI, 30s / 60s / 180s locally). The code is `vitest.timeout-budget.ts` (`limitFactor`, `localLimit`, `tierTimeouts`, `unitTimeouts`), the config (`vitest.config.ts:34` `...unitTimeouts()`), the setup (`vitest.setup.ts:109` `vi.setConfig(tierTimeouts(...))`), `scripts/ci/bkit-test-limits.mjs` (`tierTimeouts(true)`) and `tests/shell/setup_suite.bash` (30 / 180). The template edits name only exports that the module has.

## Previously Attempted

- `build-plan-verify-holistic-1.md` (FAIL, 2 gaps: the `ENOTEMPTY` cleanup races in `branches-lock.integration.test.ts` and `tests-lock.integration.test.ts`, both `Fixable: false`). `build-decision-1-2.md` (owner: Accept on both).
- Group reports: `build-plan-verify-1-1.md`, `build-plan-gaps-remediate-1-1-log.md`, `build-plan-verify-1-2.md`, `build-decision-1-1.md` (owner: Accept on the TASK 2 search hits), `build-plan-verify-1-3.md` (PASS, tasks 1, 2, 3), `build-plan-verify-2-1.md` (PASS, tasks 4, 5).

## Notes

- No code changed since attempt 1: `git diff --stat 7747cf420..HEAD` touches only `.bkit/friction.jsonl`, `docs/decisions.jsonl`, the plan's checkboxes, `build-decision-1-2.md` and `status.jsonl`. Every plan task is now `[x]`.
- `tmp/bkit-diff-814-local-test-limits.md` is the diff against `origin/dev`. It also carries commits from other features that branch-sync merged in (950, 923, 920, discovered-gotchas). This verify judged the feature's own commits (`af5042814..HEAD`).
- TASK 1 satisfied: its search on `vitest.timeout-budget.ts` prints nothing (exit 1). The `types` stage (`pnpm typecheck`) passed, and the budget tests passed in the run.
- TASK 2 satisfied under `build-decision-1-1.md` (`Decision: Accept`, the owner's answer): the search prints exactly the 5 accepted lines in `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` (:67, :69, :70, :78, :80) and nothing else. `node --test scripts/ci/bkit-test-limits.test.mjs` passes 2/2.
- TASK 3 satisfied: the plan's listing finds only the guard's CONTROL strings at `vitest-timeout-budget.test.ts:114-115`, and the guard test passed in the run.
- TASK 4 satisfied: its search prints only `vitest-timeout-budget.test.ts:78` and `:80`. `build-decision-1-1.md` accepted these lines, which fail the search for the same reason. `node dist/cli.js check` exits 0 with 0 writes and 0 blockers.
- TASK 5 satisfied: `node dist/cli.js ledgers query --ledger=knowledge --status=ACTIVE` does not list `spawn-heavy-unit-suite-needs-its-own-budget-under-load`.
- `build-decision-1-2.md` (`Decision: Accept`, the owner's answer) accepts the two `ENOTEMPTY` race gaps from attempt 1. They are not logged again.
- Every `Derived Test Matrix` row (plan :141-:151) has its test in a task's TEST FIRST, under that task's DONE WHEN, and passed in the run. The plan has no `Documentation Updates` section. `docs/testing.md` and `docs/observability.md` are present, and no task adds an error path to log.
- No test-first audit report was supplied for the holistic scope.
- Out of scope, carried from attempt 1: `tests/shell/setup_suite.bash` treats any non-empty `CI` as CI. `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts:41` passes `localLimit(200)` as a child limit. `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts:20-21` imports `vitest.timeout-budget` twice. `.bkit/core/docs/templates/bkit-audit-dependencies.md:221` still says to record the load average.
- Cloud-setup in the run reported `db` and `cli` provisioning unavailable (3 GB free disk). This did not block any stage.

## Identified Gaps Log

1 gap.

- INTEGRATION: `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `analyses dense script sources in linear time` failed in both the `related` and `named` stages of `bkit tests changed --base=origin/dev` with `AssertionError: expected 2074 to be less than 1000` (then 2357) at `:704`, the test's own wall-clock check `expect(r.ms).toBeLessThan(1000)`. The run had load averages near 28-32. The file is not in this feature's diff (last changed by e4377aad7 on dev), the feature changes no in-test wall-clock assertion, and the test passes alone 3/3. `build-decision-1-2.md` accepted only the two `ENOTEMPTY` races, not this test. No group of this plan touches the file, so closing it needs a choice the plan does not make: fix the hard-coded 1000 ms check in an out-of-plan file here, or record it as a known flake under load and fix it separately — Fixable: false

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** guardrails-cursor linear-time test fails its hard-coded 1000 ms wall-clock check under load
  **Severity:** HIGH · **Class:** failing-test · **Fixable:** false · **Location:** `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts:704` · **Round:** 1
  - **DONE WHEN:** The owner decides: fix the hard-coded 1000 ms wall-clock check in this out-of-plan file, or record it as a known flake under load; then `analyses dense script sources in linear time` passes in `bkit tests changed --base=origin/dev`
  - **TEST FIRST:**
    - .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
<!-- bkit:task 1 end -->
