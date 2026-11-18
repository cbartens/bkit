Verdict: PASS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

PASS

- No unresolved finding, failing check, open task, accepted limitation or open deferral.

Plan tasks: 4 of 4 ticked in `docs/plans/202611/1020-two-small-check-plan.md`.

Publish: held

Docs: not synced (ship syncs on landing)

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/1020-two-small-check/build-input-1.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | `docs/plans/202611/1020-two-small-check-plan.md`, `docs/plans/202611/logs/1020-two-small-check/build-plan-check.md` |
| build-plan-current | - | - | 1 | - |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/1020-two-small-check/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tests (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1020-two-small-check/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | - | 1 | `docs/plans/202611/logs/1020-two-small-check/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1020-two-small-check/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 1 | `docs/plans/202611/logs/1020-two-small-check/build-plan-verify-1-1.md` |
| build-group-gate (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1020-two-small-check/build-group-gate-1-1.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tests (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1020-two-small-check/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | - | 1 | `docs/plans/202611/logs/1020-two-small-check/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1020-two-small-check/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 1 | `docs/plans/202611/logs/1020-two-small-check/build-plan-verify-2-1.md` |
| build-plan-verify-holistic | PASS | 0 | 2 | `docs/plans/202611/logs/1020-two-small-check/build-plan-verify-holistic-1-2.md` |
| build-holistic-gate | PASS | - | 2 | `docs/plans/202611/logs/1020-two-small-check/build-holistic-gate-1-2.md` |
| build-plan-gaps-remediate-holistic | PASS | - | 1 | `docs/plans/202611/logs/1020-two-small-check/build-plan-gaps-remediate-holistic-1-1-log.md` |
| build-challenge | PASS | 0 | 1 | `docs/plans/202611/logs/1020-two-small-check/build-challenge-1.md`, `docs/plans/202611/logs/1020-two-small-check/build-challenge-2.md` |
| build-run-tests | PASS | 0 | 1 | `docs/plans/202611/logs/1020-two-small-check/run-tests-1.md` |

## Resolved Findings

None

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/1020-two-small-check/build-input-1.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | `docs/plans/202611/1020-two-small-check-plan.md`, `docs/plans/202611/logs/1020-two-small-check/build-plan-check.md` |
| build-plan-current | - | 1 | - |
| build-install-skills | - | 1 | `docs/plans/202611/logs/1020-two-small-check/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tests (group 1) | PASS | 1 | `docs/plans/202611/logs/1020-two-small-check/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 1 | `docs/plans/202611/logs/1020-two-small-check/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | 1 | `docs/plans/202611/logs/1020-two-small-check/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 1 | `docs/plans/202611/logs/1020-two-small-check/build-plan-verify-1-1.md` |
| build-group-gate (group 1) | PASS | 1 | `docs/plans/202611/logs/1020-two-small-check/build-group-gate-1-1.md` |
| build-group-start (group 2) | - | - | - |
| build-plan-tests (group 2) | PASS | 1 | `docs/plans/202611/logs/1020-two-small-check/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | 1 | `docs/plans/202611/logs/1020-two-small-check/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | 1 | `docs/plans/202611/logs/1020-two-small-check/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 1 | `docs/plans/202611/logs/1020-two-small-check/build-plan-verify-2-1.md` |
| build-plan-verify-holistic | CONCERNS | 1 | `docs/plans/202611/logs/1020-two-small-check/build-plan-verify-holistic-1-1.md` |
| build-holistic-gate | FAIL | 1 | `docs/plans/202611/logs/1020-two-small-check/build-holistic-gate-1-1.md` |
| build-plan-gaps-remediate-holistic | PASS | 1 | `docs/plans/202611/logs/1020-two-small-check/build-plan-gaps-remediate-holistic-1-1-log.md` |
| build-plan-verify-holistic | PASS | 2 | `docs/plans/202611/logs/1020-two-small-check/build-plan-verify-holistic-1-2.md` |
| build-holistic-gate | PASS | 2 | `docs/plans/202611/logs/1020-two-small-check/build-holistic-gate-1-2.md` |
| build-challenge | PASS | 1 | `docs/plans/202611/logs/1020-two-small-check/build-challenge-1.md`, `docs/plans/202611/logs/1020-two-small-check/build-challenge-2.md` |
| build-run-tests | PASS | 1 | `docs/plans/202611/logs/1020-two-small-check/run-tests-1.md` |

## Challenge

None

## Tests

- Attempt 1: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-ship #1020
```
