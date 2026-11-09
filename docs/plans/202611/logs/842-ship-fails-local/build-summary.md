Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-plan-verify-holistic CONCERNS
- build-failure-diagnose CONCERNS

Plan tasks: 10 of 10 ticked in `docs/plans/202611/842-ship-fails-local-plan.md`.

Publish: pr

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-input-2.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | - |
| build-plan-current | PASS | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-current.md` |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tasks (group 1) | FAIL | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 2 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-verify-1-2.md` |
| build-plan-gaps-remediate (group 1) | FAIL | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-gaps-remediate-1-1-log.md` |
| build-group-gate (group 1) | PASS | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-group-gate-1-2.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tests (group 2) | PASS | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | - | 2 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 2 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-verify-2-2.md` |
| build-plan-gaps-remediate (group 2) | PASS | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-gaps-remediate-2-1-log.md` |
| build-plan-verify-holistic | CONCERNS | 1 | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-verify-holistic.md` |
| build-challenge | CONCERNS | 0 | 2 | `docs/plans/202611/logs/842-ship-fails-local/build-challenge-1.md`, `docs/plans/202611/logs/842-ship-fails-local/build-challenge-2.md` |
| build-group-start (group 3) | - | - | 1 | - |
| build-plan-tests (group 3) | PASS | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-tests-red-3-1.md` |
| build-plan-tasks (group 3) | PASS | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 0 | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-verify-3-1.md` |
| build-challenge | PASS | 0 | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-challenge-1.md`, `docs/plans/202611/logs/842-ship-fails-local/build-challenge-2.md` |
| build-run-tests | PASS | 0 | 2 | `docs/plans/202611/logs/842-ship-fails-local/run-tests-2.md` |
| build-failure-diagnose | CONCERNS | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-failure-diagnose-1.md` |
| build-failure-remediate | PASS | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-failure-remediate-1-log.md` |

## Resolved Findings

- build-plan-tasks (group 1) FAIL, resolved by build-plan-verify
- build-plan-gaps-remediate (group 1) FAIL, resolved by build-plan-verify
- build-challenge round 1: HIGH .bkit/core/workflows/bkit-ship.md:645, resolved by build-plan-verify (group 3, task 9)
- build-challenge round 1: HIGH .bkit/core/engine/commands/workflow/runs.ts:2027, resolved by build-plan-verify (group 3, task 10)

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/842-ship-fails-local/build-input-2.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | - |
| build-plan-current | PASS | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-current.md` |
| build-install-skills | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tasks (group 1) | FAIL | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | CONCERNS | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-verify-1-1.md` |
| build-plan-gaps-remediate (group 1) | FAIL | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-gaps-remediate-1-1-log.md` |
| build-plan-verify (group 1) | PASS | 2 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-verify-1-2.md` |
| build-group-gate (group 1) | PASS | 2 | `docs/plans/202611/logs/842-ship-fails-local/build-group-gate-1-2.md` |
| build-group-start (group 2) | - | - | - |
| build-plan-tests (group 2) | PASS | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | FAIL | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-tasks-2-log.md` |
| build-plan-tasks (group 2) | PASS | 2 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | CONCERNS | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-verify-2-1.md` |
| build-plan-gaps-remediate (group 2) | PASS | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-gaps-remediate-2-1-log.md` |
| build-plan-verify (group 2) | PASS | 2 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-verify-2-2.md` |
| build-plan-verify-holistic | CONCERNS | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-verify-holistic.md` |
| build-challenge | CONCERNS | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-challenge-1.md`, `docs/plans/202611/logs/842-ship-fails-local/build-challenge-2.md` |
| build-challenge | CONCERNS | 2 | `docs/plans/202611/logs/842-ship-fails-local/build-challenge-1.md`, `docs/plans/202611/logs/842-ship-fails-local/build-challenge-2.md` |
| build-group-start (group 3) | - | - | - |
| build-plan-tests (group 3) | PASS | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-tests-red-3-1.md` |
| build-plan-tasks (group 3) | PASS | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-plan-verify-3-1.md` |
| build-challenge | PASS | 3 | `docs/plans/202611/logs/842-ship-fails-local/build-challenge-1.md`, `docs/plans/202611/logs/842-ship-fails-local/build-challenge-2.md` |
| build-run-tests | FAIL | 1 | `docs/plans/202611/logs/842-ship-fails-local/run-tests-1.md` |
| build-failure-diagnose | CONCERNS | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-failure-diagnose-1.md` |
| build-failure-remediate | PASS | 1 | `docs/plans/202611/logs/842-ship-fails-local/build-failure-remediate-1-log.md` |
| build-run-tests | PASS | 2 | `docs/plans/202611/logs/842-ship-fails-local/run-tests-2.md` |

## Challenge

- Task 9 — HIGH — ticked (`docs/plans/202611/842-ship-fails-local-plan.md`)
- Task 10 — HIGH — ticked (`docs/plans/202611/842-ship-fails-local-plan.md`)

## Tests

- Attempt 1: FAIL, failures 1, ran `pnpm bkit:gate:static-unit-integration`
- Attempt 2: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Risks and Action Items

- BLOCKED — bkit:generate: instructions:sync rejected changed workflow-resume/workflow-exit-0 template shapes and missing local instruction registry entries; build and cli:sync passed, upgrade and renderer regeneration did not run. (`docs/plans/202611/logs/842-ship-fails-local/build-plan-tasks-2-log.md`)

## Recommended Next Step

```text
/bkit-ship #842
```
