Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 5
Loosened: none
Fingerprint: 9bc15156e589d2256b60d79a6d3652c89c25086e210c9c5dc1454744aaec30e2
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `docs/plans/202611/logs/921-tests-lock-default/build-plan-verify-1-1.md`: CONCERNS, 1 gap. TASK 1's override test failed because the `override one` holder kept slot 0 during the three-slot half.
- `docs/plans/202611/logs/921-tests-lock-default/build-plan-gaps-remediate-1-1-log.md`: BLOCKED, because only the tests step may edit a planned test.
- `docs/plans/202611/logs/921-tests-lock-default/build-decision-1-1.md`: the owner chose `Fix now`, which created TASK 5.

## Notes

- TASK 1 is satisfied. `cmp scripts/ci/bkit-machine-lock.sh .bkit/templates/scripts/ci/bkit-machine-lock.sh` succeeds. `pnpm bkit:test:file .bkit/core/engine/audits/templates/machine-lock.integration.test.ts` passes 74 of 74 on this 10-core machine. The script diff matches every UPDATE line: `_local_stack_lock_cores` holds the moved probe, `_local_stack_lock_slots` defaults to 2 at 8 or more cores and prints `using N slot(s)`, `_local_stack_lock_workers` reuses `_lsl_cores`, `_local_stack_lock` declares `_lsl_cores` local and calls cores, slots and workers in that order, the header comment is updated, and `envFor` pins a fake 4-core `getconf`.
- TASK 5 is satisfied. The override test now kills the `override one` holder and waits for it to exit before the `BKIT_TEST_SLOTS=3` half starts. The test keeps its name, and the same file passes. The plain `child.kill("SIGKILL")` mid-test matches the file's other kill-and-wait tests, and `afterEach` still stops every process group through `stopGroup`.
- TASK 2 is satisfied. `tests-lock.integration.test.ts` passes 18 of 18 and `branches-lock.integration.test.ts` passes 2 of 2 on this 10-core machine. `git grep -l "take_local_stack_lock" -- '*.test.ts'` lists only those two files and `machine-lock.integration.test.ts`, whose `envFor` pins 4 cores.
- Every Derived Test Matrix row has its test named in TASK 1's or TASK 5's TEST FIRST, and all of those tests pass.
- The new invalid-slots note goes to stderr with the `[machine-lock]` prefix, like the other lock messages, so `docs/observability.md` raises no gap.
- `docs/testing.md:325` still says the slots default to 1. That line belongs to TASK 3 in group 2, so it is not a group 1 gap.
- Test-first audit (`build-tests-green-1-2.md`): Enforced true, Verdict PASS, 0 gaps, 0 unproven, and no `Updated tests` section, so no test is loosened. The `Already landed` section lists these tests, which passed at red and which the tests step accepted:
  - TASK 1 `with slots unset on 7 cores, a second run waits behind the first`: the default is already 1 slot, so it holds before the change and guards the threshold.
  - TASK 1 `a set BKIT_TEST_SLOTS overrides the core-count default both ways`: TASK 5 rewrote it in place after the script change landed.
  - TASK 1 `with no working core probe, slots unset gives one slot`: the default is already 1 slot, so it holds before the change.
  - TASK 5 `a set BKIT_TEST_SLOTS overrides the core-count default both ways`: the script override already exists, and the test now stops the first holder before the three-slot half.
- The decision record `build-decision-1-1.md` is `Fix now`, not an accept, so it closes no gap by itself. TASK 5 closes it.
- The brief's Deviations section, which cut the branch from local dev, does not affect any task's judgment.

## Identified Gaps Log

None
