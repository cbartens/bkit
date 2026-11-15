Verdict: PASS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

PASS

- No unresolved finding, failing check, open task, accepted limitation or open deferral.

Plan tasks: 7 of 7 ticked in `docs/plans/202611/921-tests-lock-default-plan.md`.

Publish: held

Docs: not synced (ship syncs on landing)

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-input-1.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | `docs/plans/202611/921-tests-lock-default-plan.md`, `docs/plans/202611/logs/921-tests-lock-default/build-plan-check.md` |
| build-plan-current | - | - | 1 | - |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tests (group 1) | PASS | - | 3 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | - | 3 | `docs/plans/202611/logs/921-tests-lock-default/build-tests-red-1-3.md` |
| build-plan-tasks (group 1) | PASS | - | 2 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 2 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-verify-1-2.md` |
| build-plan-gaps-remediate (group 1) | FAIL | - | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-gaps-remediate-1-1-log.md` |
| build-decision | - | - | 2 | `docs/plans/202611/logs/921-tests-lock-default/build-decision-1-2.md` |
| build-group-gate (group 1) | PASS | - | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-group-gate-1-2.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tasks (group 2) | PASS | - | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-verify-2-1.md` |
| build-plan-verify-holistic | PASS | 0 | 3 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-verify-holistic-3.md` |
| build-challenge | CONCERNS | 1 | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-challenge-1.md`, `docs/plans/202611/logs/921-tests-lock-default/build-challenge-2.md` |
| build-group-start (group 3) | - | - | 1 | - |
| build-plan-tasks (group 3) | PASS | - | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 0 | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-verify-3-1.md` |
| build-challenge | CONCERNS | 1 | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-challenge-1.md`, `docs/plans/202611/logs/921-tests-lock-default/build-challenge-2.md` |
| build-group-start (group 4) | - | - | 1 | - |
| build-plan-tests (group 4) | PASS | - | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | - | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-tests-red-4-1.md` |
| build-plan-tasks (group 4) | PASS | - | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | PASS | 0 | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-verify-4-1.md` |
| build-run-tests | PASS | 0 | 1 | `docs/plans/202611/logs/921-tests-lock-default/run-tests-1.md` |

## Resolved Findings

- build-plan-tasks (group 1) FAIL, resolved by the Decision Pause (`docs/plans/202611/logs/921-tests-lock-default/build-decision-1-1.md`), task 5 verified
- build-plan-gaps-remediate (group 1) FAIL, resolved by the Decision Pause (`docs/plans/202611/logs/921-tests-lock-default/build-decision-1-1.md`), task 5 verified
- build-challenge round 1: MEDIUM .bkit/templates/scripts/ci/bkit-machine-lock.sh:107, resolved by build-plan-verify (group 3, task 6)
- build-challenge round 2: MEDIUM vitest.test-lock.ts:71, resolved by build-plan-verify (group 4, task 7)

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/921-tests-lock-default/build-input-1.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | `docs/plans/202611/921-tests-lock-default-plan.md`, `docs/plans/202611/logs/921-tests-lock-default/build-plan-check.md` |
| build-plan-current | - | 1 | - |
| build-install-skills | - | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tests (group 1) | PASS | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | FAIL | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | CONCERNS | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-verify-1-1.md` |
| build-plan-gaps-remediate (group 1) | FAIL | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-gaps-remediate-1-1-log.md` |
| build-decision | - | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-decision-1-1.md` |
| build-plan-tests (group 1) | PASS | 2 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 2 | `docs/plans/202611/logs/921-tests-lock-default/build-tests-red-1-2.md` |
| build-plan-tests (group 1) | PASS | 3 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 3 | `docs/plans/202611/logs/921-tests-lock-default/build-tests-red-1-3.md` |
| build-plan-tasks (group 1) | PASS | 2 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 2 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-verify-1-2.md` |
| build-group-gate (group 1) | PASS | 2 | `docs/plans/202611/logs/921-tests-lock-default/build-group-gate-1-2.md` |
| build-group-start (group 2) | - | - | - |
| build-plan-tasks (group 2) | PASS | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-verify-2-1.md` |
| build-plan-verify-holistic | PASS | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-verify-holistic-1.md` |
| build-challenge | CONCERNS | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-challenge-1.md`, `docs/plans/202611/logs/921-tests-lock-default/build-challenge-2.md` |
| build-decision | - | 2 | `docs/plans/202611/logs/921-tests-lock-default/build-decision-1-2.md` |
| build-group-start (group 3) | - | - | - |
| build-plan-tasks (group 3) | PASS | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-verify-3-1.md` |
| build-plan-verify-holistic | PASS | 2 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-verify-holistic-2.md` |
| build-challenge | CONCERNS | 2 | `docs/plans/202611/logs/921-tests-lock-default/build-challenge-1.md`, `docs/plans/202611/logs/921-tests-lock-default/build-challenge-2.md` |
| build-group-start (group 4) | - | - | - |
| build-plan-tests (group 4) | PASS | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-tests-red-4-1.md` |
| build-plan-tasks (group 4) | PASS | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | PASS | 1 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-verify-4-1.md` |
| build-plan-verify-holistic | PASS | 3 | `docs/plans/202611/logs/921-tests-lock-default/build-plan-verify-holistic-3.md` |
| build-run-tests | PASS | 1 | `docs/plans/202611/logs/921-tests-lock-default/run-tests-1.md` |

## Challenge

- Task 6 — MEDIUM — ticked (`docs/plans/202611/921-tests-lock-default-plan.md`)
- Task 7 — MEDIUM — ticked (`docs/plans/202611/921-tests-lock-default-plan.md`)

## Tests

- Attempt 1: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Risks and Action Items

- BLOCKED — Gap 1: machine-lock.integration.test.ts 'a set BKIT_TEST_SLOTS overrides the core-count default both ways' — fixture defect in a planned TEST FIRST test (the 'override one' holder keeps slot 0, so 'three c' waits); the script matches the plan, and only the tests step may edit a planned test (`docs/plans/202611/logs/921-tests-lock-default/build-plan-gaps-remediate-1-1-log.md`)

## Recommended Next Step

```text
/bkit-ship #921
```
