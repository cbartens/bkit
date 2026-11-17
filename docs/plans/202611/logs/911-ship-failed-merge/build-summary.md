Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-challenge round 1: LOW .bkit/core/workflows/bkit-ship.md:345
- build-challenge round 1: LOW .bkit/core/engine/commands/workflow/workflows.ts:408
- 2 deferral(s) from this run remain open

Plan tasks: 8 of 8 ticked in `docs/plans/202611/911-ship-failed-merge-plan.md`.

Publish: held

Docs: not synced (ship syncs on landing)

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-input-1.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | `docs/plans/202611/911-ship-failed-merge-plan.md`, `docs/plans/202611/logs/911-ship-failed-merge/build-plan-check.md` |
| build-plan-current | CONCERNS | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-current.md` |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tests (group 1) | PASS | - | 2 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | - | 2 | `docs/plans/202611/logs/911-ship-failed-merge/build-tests-red-1-2.md` |
| build-plan-tasks (group 1) | PASS | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 2 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-verify-1-2.md` |
| build-group-gate (group 1) | PASS | - | 2 | `docs/plans/202611/logs/911-ship-failed-merge/build-group-gate-1-2.md` |
| build-plan-gaps-remediate (group 1) | FAIL | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-gaps-remediate-1-1-log.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tests (group 2) | PASS | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-verify-2-1.md` |
| build-group-gate (group 2) | PASS | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-group-gate-2-1.md` |
| build-group-start (group 3) | - | - | 1 | - |
| build-plan-tasks (group 3) | PASS | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 0 | 2 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-verify-3-2.md` |
| build-plan-gaps-remediate (group 3) | PASS | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-gaps-remediate-3-1-log.md` |
| build-plan-verify-holistic | PASS | 0 | 3 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-verify-holistic-3.md` |
| build-challenge | CONCERNS | 3 | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-challenge-1.md`, `docs/plans/202611/logs/911-ship-failed-merge/build-challenge-2.md` |
| build-group-start (group 4) | - | - | 1 | - |
| build-tests-red (group 4) | - | - | 3 | `docs/plans/202611/logs/911-ship-failed-merge/build-tests-red-4-3.md` |
| build-plan-tests (group 4) | PASS | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-tests-4-log.md` |
| build-plan-tasks (group 4) | PASS | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | PASS | 0 | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-verify-4-1.md` |
| build-challenge | CONCERNS | 1 | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-challenge-1.md`, `docs/plans/202611/logs/911-ship-failed-merge/build-challenge-2.md` |
| build-group-start (group 5) | - | - | 1 | - |
| build-plan-tests (group 5) | PASS | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-tests-5-log.md` |
| build-tests-red (group 5) | - | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-tests-red-5-1.md` |
| build-plan-tasks (group 5) | PASS | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-tasks-5-log.md` |
| build-plan-verify (group 5) | PASS | 0 | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-verify-5-1.md` |
| build-run-tests | PASS | 0 | 1 | `docs/plans/202611/logs/911-ship-failed-merge/run-tests-1.md` |

## Resolved Findings

- build-plan-current CONCERNS, resolved by build-plan-verify
- build-plan-gaps-remediate (group 1) FAIL, resolved by build-plan-verify
- build-challenge round 1: MEDIUM .bkit/core/workflows/bkit-ship.md:101, resolved by build-plan-verify (group 4, task 7)
- build-challenge round 2: MEDIUM .bkit/core/workflows/bkit-ship.md:101, resolved by build-plan-verify (group 5, task 8)

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/911-ship-failed-merge/build-input-1.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | `docs/plans/202611/911-ship-failed-merge-plan.md`, `docs/plans/202611/logs/911-ship-failed-merge/build-plan-check.md` |
| build-plan-current | CONCERNS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-current.md` |
| build-install-skills | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tests (group 1) | PASS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-tests-red-1-1.md` |
| build-plan-tests (group 1) | PASS | 2 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 2 | `docs/plans/202611/logs/911-ship-failed-merge/build-tests-red-1-2.md` |
| build-plan-tasks (group 1) | PASS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-verify-1-1.md` |
| build-group-gate (group 1) | FAIL | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-group-gate-1-1.md` |
| build-plan-gaps-remediate (group 1) | FAIL | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-gaps-remediate-1-1-log.md` |
| build-plan-verify (group 1) | PASS | 2 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-verify-1-2.md` |
| build-group-gate (group 1) | PASS | 2 | `docs/plans/202611/logs/911-ship-failed-merge/build-group-gate-1-2.md` |
| build-group-start (group 2) | - | - | - |
| build-plan-tests (group 2) | PASS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-verify-2-1.md` |
| build-group-gate (group 2) | PASS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-group-gate-2-1.md` |
| build-group-start (group 3) | - | - | - |
| build-plan-tasks (group 3) | PASS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | CONCERNS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-verify-3-1.md` |
| build-plan-gaps-remediate (group 3) | PASS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-gaps-remediate-3-1-log.md` |
| build-plan-verify (group 3) | PASS | 2 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-verify-3-2.md` |
| build-plan-verify-holistic | PASS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-verify-holistic-1.md` |
| build-challenge | CONCERNS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-challenge-1.md`, `docs/plans/202611/logs/911-ship-failed-merge/build-challenge-2.md` |
| build-group-start (group 4) | - | - | - |
| build-tests-red (group 4) | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-tests-red-4-1.md` |
| build-tests-red (group 4) | - | 2 | `docs/plans/202611/logs/911-ship-failed-merge/build-tests-red-4-2.md` |
| build-plan-tests (group 4) | PASS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | 3 | `docs/plans/202611/logs/911-ship-failed-merge/build-tests-red-4-3.md` |
| build-plan-tasks (group 4) | PASS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | PASS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-verify-4-1.md` |
| build-plan-verify-holistic | PASS | 2 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-verify-holistic-2.md` |
| build-challenge | CONCERNS | 2 | `docs/plans/202611/logs/911-ship-failed-merge/build-challenge-1.md`, `docs/plans/202611/logs/911-ship-failed-merge/build-challenge-2.md` |
| build-group-start (group 5) | - | - | - |
| build-plan-tests (group 5) | PASS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-tests-5-log.md` |
| build-tests-red (group 5) | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-tests-red-5-1.md` |
| build-plan-tasks (group 5) | PASS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-tasks-5-log.md` |
| build-plan-verify (group 5) | PASS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-verify-5-1.md` |
| build-plan-verify-holistic | PASS | 3 | `docs/plans/202611/logs/911-ship-failed-merge/build-plan-verify-holistic-3.md` |
| build-run-tests | PASS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/run-tests-1.md` |

## Challenge

- Task 7 — MEDIUM — ticked (`docs/plans/202611/911-ship-failed-merge-plan.md`)
- Task 8 — MEDIUM — ticked (`docs/plans/202611/911-ship-failed-merge-plan.md`)
- LOW, deferred: 911-ship-failed-merge-challenge-low-bkit-core-workflows-bkit-ship-md-345 — LOW build challenge finding at .bkit/core/workflows/bkit-ship.md:345: A cancelled (or action-required / stale) check in the Step 2 CI wait counts as failed, so ship names /bkit-debug {FID} for a CI run that never went red, while the Step 10 gate sends a cancelled run (exit 15) to the Failure Path with no next step. Done when: prs checks (checksFor, .bkit/core/engine/commands/workflow/prs.ts:845) reports cancelled checks apart from failed (or the Step 2 route keys on a count of real failures), and the Step 2 arm holds NEXT_STEP only when a check concluded red, matching the Step 10 split where exit 15 holds none.
- LOW, deferred: 911-ship-failed-merge-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-408 — LOW build challenge finding at .bkit/core/engine/commands/workflow/workflows.ts:408: A --next-step value holding a backtick breaks out of its code span and posts live markdown (links, images, @ mentions, HTML) in the failure comment under bkit's tracker token. Done when: failVerb accepts --next-step only when it matches one strict command shape (a /bkit- command name of [a-z0-9-] and optional space-separated arguments of [#A-Za-z0-9._-]), so a backtick, <, [, (, @, ! or a Unicode line separator (U+2028, U+2029, U+0085) exits 2 with "--next-step must be one /bkit-* command line" before any write, and /bkit-debug 911-ship-failed-merge and /bkit-debug #682 are still accepted

## Tests

- Attempt 1: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-ship #911
```
