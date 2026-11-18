Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-plan-gaps-remediate-holistic CONCERNS

Plan tasks: 4 of 4 ticked in `docs/plans/202611/1030-later-scope-passing-plan.md`.

Publish: held

Docs: not synced (ship syncs on landing)

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 2 | - |
| build-worktree-setup | - | - | 2 | `docs/plans/202611/logs/1030-later-scope-passing/build-input-1.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | `docs/plans/202611/1030-later-scope-passing-plan.md`, `docs/plans/202611/logs/1030-later-scope-passing/build-plan-check.md` |
| build-plan-current | - | - | 1 | - |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tests (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | - | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-verify-1-1.md` |
| build-plan-verify-holistic | PASS | 0 | 4 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-verify-holistic-1-4.md` |
| build-holistic-gate | PASS | - | 5 | `docs/plans/202611/logs/1030-later-scope-passing/build-holistic-gate-1-4.md` |
| build-plan-gaps-remediate-holistic | CONCERNS | - | 3 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-gaps-remediate-holistic-1-2-log.md` |
| build-decision | - | - | 4 | `docs/plans/202611/logs/1030-later-scope-passing/build-decision-1-4.md` |
| build-challenge | CONCERNS | 1 | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-challenge-2.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tests (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | - | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-verify-2-1.md` |
| build-challenge | CONCERNS | 1 | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-challenge-2.md` |
| build-group-start (group 3) | - | - | 1 | - |
| build-plan-tests (group 3) | PASS | - | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | - | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-tests-red-3-1.md` |
| build-plan-tasks (group 3) | PASS | - | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 0 | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-verify-3-1.md` |
| build-run-tests | PASS | 0 | 1 | `docs/plans/202611/logs/1030-later-scope-passing/run-tests-1.md` |

## Resolved Findings

- build-challenge round 1: MEDIUM .bkit/core/engine/commands/workflow/summary.ts:84, resolved by build-plan-verify (group 2, task 3)
- build-challenge round 2: MEDIUM .bkit/core/engine/commands/workflow/summary.ts:85, resolved by build-plan-verify (group 3, task 4)

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/1030-later-scope-passing/build-input-1.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | `docs/plans/202611/1030-later-scope-passing-plan.md`, `docs/plans/202611/logs/1030-later-scope-passing/build-plan-check.md` |
| build-plan-current | - | 1 | - |
| build-install-skills | - | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tests (group 1) | PASS | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-verify-1-1.md` |
| build-plan-verify-holistic | PASS | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-verify-holistic-1-1.md` |
| build-holistic-gate | FAIL | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-holistic-gate-1-1.md` |
| build-plan-gaps-remediate-holistic | PASS | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-gaps-remediate-holistic-1-1-log.md` |
| build-plan-verify-holistic | PASS | 2 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-verify-holistic-1-2.md` |
| build-holistic-gate | FAIL | 2 | `docs/plans/202611/logs/1030-later-scope-passing/build-holistic-gate-1-2.md` |
| build-plan-gaps-remediate-holistic | CONCERNS | 2 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-gaps-remediate-holistic-1-2-log.md` |
| build-decision | - | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-decision-1-1.md` |
| build-plan-gaps-remediate-holistic | CONCERNS | 2 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-gaps-remediate-holistic-1-2-log.md` |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/1030-later-scope-passing/build-input-1.md` |
| build-decision | - | 2 | `docs/plans/202611/logs/1030-later-scope-passing/build-decision-1-2.md` |
| build-holistic-gate | PASS | 2 | `docs/plans/202611/logs/1030-later-scope-passing/build-holistic-gate-1-2.md` |
| build-challenge | CONCERNS | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-challenge-2.md` |
| build-decision | - | 3 | `docs/plans/202611/logs/1030-later-scope-passing/build-decision-1-3.md` |
| build-group-start (group 2) | - | - | - |
| build-plan-tests (group 2) | PASS | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-verify-2-1.md` |
| build-plan-verify-holistic | PASS | 3 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-verify-holistic-1-3.md` |
| build-holistic-gate | PASS | 3 | `docs/plans/202611/logs/1030-later-scope-passing/build-holistic-gate-1-3.md` |
| build-challenge | CONCERNS | 2 | `docs/plans/202611/logs/1030-later-scope-passing/build-challenge-2.md` |
| build-decision | - | 4 | `docs/plans/202611/logs/1030-later-scope-passing/build-decision-1-4.md` |
| build-group-start (group 3) | - | - | - |
| build-plan-tests (group 3) | PASS | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-tests-red-3-1.md` |
| build-plan-tasks (group 3) | PASS | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 1 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-verify-3-1.md` |
| build-plan-verify-holistic | PASS | 4 | `docs/plans/202611/logs/1030-later-scope-passing/build-plan-verify-holistic-1-4.md` |
| build-holistic-gate | PASS | 4 | `docs/plans/202611/logs/1030-later-scope-passing/build-holistic-gate-1-4.md` |
| build-run-tests | PASS | 1 | `docs/plans/202611/logs/1030-later-scope-passing/run-tests-1.md` |

## Challenge

- challenge-1 skipped: small change (154 lines, 9 files)
- Task 3 — MEDIUM — ticked (`docs/plans/202611/1030-later-scope-passing-plan.md`)
- Task 4 — MEDIUM — ticked (`docs/plans/202611/1030-later-scope-passing-plan.md`)

## Tests

- Attempt 1: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Tests that changed hands

- TASK 1 → TASK 3: `a build-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical` recorded failing
- TASK 1 → TASK 3: `a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical` recorded failing
- TASK 3 → TASK 4: `a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical` recorded failing

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-ship #1030
```
