Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 2
Loosened: none
Fingerprint: 71e6de56a934b6e9d7ba3c93d97229df02862ea52cd775bd9a0a2ec2907ed355
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

- TASK 1 is not satisfied. The script change matches every UPDATE line: `_local_stack_lock_cores` holds the moved probe, `_local_stack_lock_slots` defaults to 2 at 8 or more cores, `_local_stack_lock_workers` reuses `_lsl_cores`, `_lsl_cores` is `local` in `_local_stack_lock`, the header comment is updated and `envFor` pins a fake 4-core `getconf`. `cmp scripts/ci/bkit-machine-lock.sh .bkit/templates/scripts/ci/bkit-machine-lock.sh` succeeds. The DONE WHEN test file fails 1 of 74 (`build-tests-green-1-1.md`).
- The failing test is a fixture defect, not a script defect. `a set BKIT_TEST_SLOTS overrides the core-count default both ways` starts the `override one` holder (slots 1, `slotHolder` sleeps 30 s and is never stopped), then starts three holders at `BKIT_TEST_SLOTS=3`. Slot 0 is still taken, so only `three a` and `three b` get a slot and `three c` waits (`machine-lock.integration.test.ts:376-377`). The fix is to stop the `override one` holder before the slots-3 half, or to expect `three c` to wait. That fix edits a planned TEST FIRST test, so it belongs to the tests step.
- TASK 2 is satisfied. `tests-lock.integration.test.ts` (18/18) and `branches-lock.integration.test.ts` (2/2) pass with `pnpm bkit:test:file` on this machine (10 cores). `git grep -l "take_local_stack_lock" -- '*.test.ts'` lists only those two files and `machine-lock.integration.test.ts`, whose `envFor` pins 4 cores. The other tests that name the lock script (`dogfood-templates.test.ts`, `package-json.test.ts`, `core.integration.test.ts`) expect no second run to wait. `vitest-test-lock.integration.test.ts` already pins one slot.
- Every Derived Test Matrix row (all TASK 1) has its test named in TASK 1's TEST FIRST.
- The new note goes to stderr with the `[machine-lock]` prefix, like the existing lock messages. `docs/observability.md` raises no gap here.
- Test-first audit: the two tests under `Already landed` passed at red, and the tests step gave the same reason for both, "the current default is already 1 slot, so it holds before the change". They are `with slots unset on 7 cores, a second run waits behind the first` and `with no working core probe, slots unset gives one slot`. Neither is a gap. Unproven: 0. No `Updated tests` section, so no test is loosened.
- The brief's Deviations section, which cut the branch from local dev, does not affect either task's judgment.
- No decision records were supplied.

## Identified Gaps Log

1 gap.

TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a set BKIT_TEST_SLOTS overrides the core-count default both ways` — not-green — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 1: `a set BKIT_TEST_SLOTS overrides the core-count default both ways` not green: the `override one` holder keeps slot 0, so `three c` waits
  **Severity:** HIGH · **Class:** not-green · **Fixable:** true · **Location:** `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts:377` · **Round:** 1
  - **DONE WHEN:** `pnpm bkit:test:file .bkit/core/engine/audits/templates/machine-lock.integration.test.ts` passes
  - **TEST FIRST:**
    - .bkit/core/engine/audits/templates/machine-lock.integration.test.ts a set BKIT_TEST_SLOTS overrides the core-count default both ways
<!-- bkit:task 1 end -->
