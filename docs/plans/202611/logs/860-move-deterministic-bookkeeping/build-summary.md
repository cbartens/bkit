Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-plan-current CONCERNS
- build-plan-gaps-remediate (group 1) CONCERNS
- build-plan-gaps-remediate (group 4) CONCERNS
- build-challenge round 1: LOW .bkit/core/engine/commands/workflow/ledgers.ts:1920
- build-challenge round 1: LOW .bkit/core/engine/commands/workflow/ledgers.ts:1709
- build-challenge round 1: LOW .bkit/core/engine/commands/workflow/ledgers.ts:1688
- build-challenge round 1: LOW .bkit/core/engine/commands/workflow/ledgers.ts:1521
- build-challenge round 2: LOW .bkit/core/engine/ledgers/status.ts:868
- build-challenge round 2: LOW .bkit/core/engine/commands/lib.ts:635
- build-challenge round 2: LOW .bkit/core/engine/commands/workflow/challenge.ts:282
- 4 item(s) accepted at the Decision Pause
- 7 deferral(s) from this run remain open

Plan tasks: 31 of 31 ticked in `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`.

Publish: pr

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-input-1.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`, `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-check.md` |
| build-plan-current | CONCERNS | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-current.md` |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tests (group 1) | PASS | - | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | - | 7 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-1-7.md` |
| build-plan-tasks (group 1) | PASS | - | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | FAIL | 1 | 8 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-8.md` |
| build-plan-gaps-remediate (group 1) | CONCERNS | - | 5 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-1-7-log.md` |
| build-decision | - | - | 6 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-decision-1-6.md` |
| build-group-gate (group 1) | FAIL | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-group-gate-1-7.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tests (group 2) | PASS | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-2-1.md` |
| build-group-gate (group 2) | PASS | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-group-gate-2-1.md` |
| build-group-start (group 3) | - | - | 1 | - |
| build-plan-tests (group 3) | PASS | - | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | - | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-3-3.md` |
| build-plan-tasks (group 3) | PASS | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 0 | 5 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-3-5.md` |
| build-plan-gaps-remediate (group 3) | PASS | - | 4 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-3-4-log.md` |
| build-group-gate (group 3) | PASS | - | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-group-gate-3-5.md` |
| build-group-start (group 4) | - | - | 1 | - |
| build-plan-tests (group 4) | PASS | - | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | - | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-4-3.md` |
| build-plan-tasks (group 4) | PASS | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | PASS | 0 | 5 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-4-5.md` |
| build-plan-gaps-remediate (group 4) | CONCERNS | - | 4 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-4-4-log.md` |
| build-plan-verify-holistic | PASS | 0 | 7 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-holistic-7.md` |
| build-plan-gaps-remediate-holistic | PASS | - | 4 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-holistic-6-log.md` |
| build-challenge | FAIL | 16 | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-challenge-1.md`, `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-challenge-2.md` |
| build-group-start (group 5) | - | - | 1 | - |
| build-plan-tests (group 5) | PASS | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-5-log.md` |
| build-tests-red (group 5) | - | - | 4 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-5-4.md` |
| build-plan-tasks (group 5) | FAIL | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tasks-5-log.md` |
| build-plan-verify (group 5) | PASS | 0 | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-5-2.md` |
| build-group-gate (group 5) | PASS | - | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-group-gate-5-2.md` |
| build-plan-gaps-remediate (group 5) | PASS | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-5-1-log.md` |
| build-group-start (group 6) | - | - | 1 | - |
| build-plan-tests (group 6) | PASS | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-6-log.md` |
| build-tests-red (group 6) | - | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-6-1.md` |
| build-plan-tasks (group 6) | PASS | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tasks-6-log.md` |
| build-plan-verify (group 6) | PASS | 0 | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-6-1.md` |
| build-group-gate (group 6) | PASS | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-group-gate-6-1.md` |
| build-group-start (group 7) | - | - | 1 | - |
| build-plan-tests (group 7) | PASS | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-7-log.md` |
| build-tests-red (group 7) | - | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-7-1.md` |
| build-plan-tasks (group 7) | PASS | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tasks-7-log.md` |
| build-plan-verify (group 7) | PASS | 0 | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-7-1.md` |
| build-challenge | CONCERNS | 10 | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-challenge-1.md`, `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-challenge-2.md` |
| build-group-start (group 8) | - | - | 1 | - |
| build-plan-tests (group 8) | PASS | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-8-log.md` |
| build-tests-red (group 8) | - | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-8-1.md` |
| build-plan-tasks (group 8) | PASS | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tasks-8-log.md` |
| build-plan-verify (group 8) | PASS | 0 | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-8-3.md` |
| build-plan-gaps-remediate (group 8) | PASS | - | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-8-2-log.md` |
| build-group-gate (group 8) | PASS | - | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-group-gate-8-3.md` |
| build-group-start (group 9) | - | - | 1 | - |
| build-plan-tests (group 9) | PASS | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-9-log.md` |
| build-tests-red (group 9) | - | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-9-1.md` |
| build-plan-tasks (group 9) | PASS | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tasks-9-log.md` |
| build-plan-verify (group 9) | PASS | 0 | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-9-2.md` |
| build-plan-gaps-remediate (group 9) | PASS | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-9-1-log.md` |
| build-run-tests | PASS | 0 | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/run-tests-1.md` |

## Resolved Findings

- build-plan-verify (group 1) FAIL, resolved by build-plan-verify-holistic
- build-group-gate (group 1) FAIL, resolved by build-run-tests
- build-plan-tasks (group 5) FAIL, resolved by build-plan-verify
- build-challenge round 1: CRITICAL .bkit/core/engine/commands/workflow/steps.ts:2328, resolved by build-plan-verify (group 5, task 13)
- build-challenge round 1: HIGH .bkit/core/engine/commands/workflow/ledgers.ts:1699, resolved by build-plan-verify (group 5, task 14)
- build-challenge round 1: HIGH .bkit/core/engine/commands/workflow/issues.ts:747, resolved by build-plan-verify (group 5, task 15)
- build-challenge round 1: HIGH .bkit/core/engine/commands/workflow/runs.ts:1103, resolved by build-plan-verify (group 5, task 16)
- build-challenge round 1: MEDIUM .bkit/core/engine/commands/workflow/ledgers.ts:1740, resolved by build-plan-verify (group 5, task 17)
- build-challenge round 1: MEDIUM .bkit/core/engine/commands/workflow/ledgers.ts:1471, resolved by build-plan-verify (group 6, task 18)
- build-challenge round 1: MEDIUM .bkit/core/engine/commands/workflow/issues.ts:734, resolved by build-plan-verify (group 6, task 19)
- build-challenge round 1: MEDIUM .bkit/core/engine/commands/workflow/steps.ts:1660, resolved by build-plan-verify (group 6, task 20)
- build-challenge round 1: MEDIUM .bkit/core/prompts/bkit-audit-generate.md:165, resolved by build-plan-verify (group 6, task 21)
- build-challenge round 1: MEDIUM .bkit/core/engine/commands/workflow/status.ts:742, resolved by build-plan-verify (group 6, task 22)
- build-challenge round 1: MEDIUM .bkit/core/engine/ledgers/status.ts:675, resolved by build-plan-verify (group 7, task 23)
- build-challenge round 1: MEDIUM .bkit/core/engine/commands/workflow/steps.ts:1566, resolved by build-plan-verify (group 7, task 24)
- build-challenge round 2: HIGH .bkit/core/engine/commands/workflow/ledgers.ts:1753, resolved by build-plan-verify (group 8, task 25)
- build-challenge round 2: HIGH .bkit/core/engine/commands/workflow/runs.ts:814, resolved by build-plan-verify (group 8, task 26)
- build-challenge round 2: HIGH .bkit/core/engine/commands/workflow/steps.ts:2327, resolved by build-plan-verify (group 8, task 27)
- build-challenge round 2: MEDIUM .bkit/core/engine/commands/workflow/counters.ts:229, resolved by build-plan-verify (group 8, task 28)
- build-challenge round 2: MEDIUM .bkit/core/engine/commands/workflow/ledgers.ts:2004, resolved by build-plan-verify (group 8, task 29)
- build-challenge round 2: MEDIUM .bkit/core/engine/commands/workflow/issues.ts:735, resolved by build-plan-verify (group 9, task 30)
- build-challenge round 2: MEDIUM .bkit/core/engine/commands/workflow/status.ts:682, resolved by build-plan-verify (group 9, task 31)

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-input-1.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`, `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-check.md` |
| build-plan-current | CONCERNS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-current.md` |
| build-install-skills | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tests (group 1) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | FAIL | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-1.md` |
| build-plan-gaps-remediate (group 1) | FAIL | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-1-1-log.md` |
| build-plan-verify (group 1) | FAIL | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-2.md` |
| build-plan-gaps-remediate (group 1) | FAIL | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-1-2-log.md` |
| build-plan-verify (group 1) | FAIL | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-3.md` |
| build-plan-gaps-remediate (group 1) | PASS | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-1-3-log.md` |
| build-plan-verify (group 1) | FAIL | 4 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-4.md` |
| build-decision | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-decision-1-1.md` |
| build-plan-tests (group 1) | PASS | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-1-2.md` |
| build-plan-tasks (group 1) | PASS | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | CONCERNS | 5 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-5.md` |
| build-decision | - | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-decision-1-2.md` |
| build-plan-tests (group 1) | PASS | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-1-3.md` |
| build-plan-tasks (group 1) | PASS | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | CONCERNS | 6 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-6.md` |
| build-plan-gaps-remediate (group 1) | PASS | 6 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-1-6-log.md` |
| build-plan-verify (group 1) | PASS | 7 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-7.md` |
| build-group-gate (group 1) | FAIL | 7 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-group-gate-1-7.md` |
| build-plan-gaps-remediate (group 1) | CONCERNS | 7 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-1-7-log.md` |
| build-plan-verify (group 1) | FAIL | 8 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-8.md` |
| build-decision | - | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-decision-1-3.md` |
| build-group-start (group 2) | - | - | - |
| build-plan-tests (group 2) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-2-1.md` |
| build-group-gate (group 2) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-group-gate-2-1.md` |
| build-group-start (group 3) | - | - | - |
| build-plan-tests (group 3) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-3-1.md` |
| build-plan-tasks (group 3) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | CONCERNS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-3-1.md` |
| build-plan-gaps-remediate (group 3) | FAIL | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-3-1-log.md` |
| build-plan-tests (group 3) | PASS | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-3-log.md` |
| build-plan-verify (group 3) | CONCERNS | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-3-2.md` |
| build-tests-red (group 3) | - | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-3-2.md` |
| build-tests-red (group 3) | - | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-3-3.md` |
| build-plan-gaps-remediate (group 3) | PASS | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-3-2-log.md` |
| build-plan-verify (group 3) | PASS | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-3-3.md` |
| build-group-gate (group 3) | FAIL | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-group-gate-3-3.md` |
| build-plan-gaps-remediate (group 3) | PASS | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-3-3-log.md` |
| build-plan-verify (group 3) | PASS | 4 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-3-4.md` |
| build-group-gate (group 3) | FAIL | 4 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-group-gate-3-4.md` |
| build-plan-gaps-remediate (group 3) | PASS | 4 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-3-4-log.md` |
| build-decision | - | 4 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-decision-1-4.md` |
| build-plan-verify (group 3) | PASS | 5 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-3-5.md` |
| build-group-gate (group 3) | PASS | 5 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-group-gate-3-5.md` |
| build-group-start (group 4) | - | - | - |
| build-plan-tests (group 4) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-4-1.md` |
| build-plan-tasks (group 4) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | CONCERNS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-4-1.md` |
| build-plan-gaps-remediate (group 4) | CONCERNS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-4-1-log.md` |
| build-plan-verify (group 4) | CONCERNS | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-4-2.md` |
| build-plan-gaps-remediate (group 4) | PASS | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-4-2-log.md` |
| build-plan-verify (group 4) | CONCERNS | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-4-3.md` |
| build-plan-gaps-remediate (group 4) | PASS | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-4-3-log.md` |
| build-plan-verify (group 4) | CONCERNS | 4 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-4-4.md` |
| build-plan-gaps-remediate (group 4) | CONCERNS | 4 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-4-4-log.md` |
| build-plan-tests (group 4) | PASS | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-4-2.md` |
| build-plan-verify (group 4) | PASS | 5 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-4-5.md` |
| build-plan-verify-holistic | CONCERNS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-holistic-1.md` |
| build-tests-red (group 1) | - | 4 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-1-4.md` |
| build-tests-red (group 1) | - | 5 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-1-5.md` |
| build-tests-red (group 1) | - | 6 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-1-6.md` |
| build-plan-gaps-remediate-holistic | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-holistic-1-log.md` |
| build-plan-verify-holistic | CONCERNS | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-holistic-2.md` |
| build-plan-gaps-remediate-holistic | PASS | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-holistic-2-log.md` |
| build-plan-verify-holistic | PASS | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-holistic-3.md` |
| build-challenge | FAIL | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-challenge-1.md`, `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-challenge-2.md` |
| build-decision | - | 5 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-decision-1-5.md` |
| build-group-start (group 5) | - | - | - |
| build-plan-tests (group 5) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-5-log.md` |
| build-tests-red (group 5) | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-5-1.md` |
| build-tests-red (group 5) | - | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-5-2.md` |
| build-plan-tasks (group 5) | FAIL | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tasks-5-log.md` |
| build-plan-verify (group 5) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-5-1.md` |
| build-group-gate (group 5) | FAIL | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-group-gate-5-1.md` |
| build-plan-gaps-remediate (group 5) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-5-1-log.md` |
| build-plan-verify (group 5) | PASS | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-5-2.md` |
| build-group-gate (group 5) | PASS | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-group-gate-5-2.md` |
| build-group-start (group 6) | - | - | - |
| build-plan-tests (group 6) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-6-log.md` |
| build-tests-red (group 6) | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-6-1.md` |
| build-plan-tasks (group 6) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tasks-6-log.md` |
| build-plan-verify (group 6) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-6-1.md` |
| build-group-gate (group 6) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-group-gate-6-1.md` |
| build-group-start (group 7) | - | - | - |
| build-plan-tests (group 7) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-7-log.md` |
| build-tests-red (group 7) | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-7-1.md` |
| build-plan-tasks (group 7) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tasks-7-log.md` |
| build-plan-verify (group 7) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-7-1.md` |
| build-plan-verify-holistic | CONCERNS | 4 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-holistic-4.md` |
| build-tests-red (group 5) | - | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-5-3.md` |
| build-tests-red (group 5) | - | 4 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-5-4.md` |
| build-plan-gaps-remediate-holistic | PASS | 4 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-holistic-4-log.md` |
| build-plan-verify-holistic | PASS | 5 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-holistic-5.md` |
| build-challenge | CONCERNS | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-challenge-1.md`, `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-challenge-2.md` |
| build-group-start (group 8) | - | - | - |
| build-plan-tests (group 8) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-8-log.md` |
| build-tests-red (group 8) | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-8-1.md` |
| build-plan-tasks (group 8) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tasks-8-log.md` |
| build-plan-verify (group 8) | CONCERNS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-8-1.md` |
| build-plan-gaps-remediate (group 8) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-8-1-log.md` |
| build-plan-verify (group 8) | PASS | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-8-2.md` |
| build-group-gate (group 8) | FAIL | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-group-gate-8-2.md` |
| build-plan-gaps-remediate (group 8) | PASS | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-8-2-log.md` |
| build-plan-verify (group 8) | PASS | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-8-3.md` |
| build-group-gate (group 8) | PASS | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-group-gate-8-3.md` |
| build-group-start (group 9) | - | - | - |
| build-plan-tests (group 9) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tests-9-log.md` |
| build-tests-red (group 9) | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-9-1.md` |
| build-plan-tasks (group 9) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-tasks-9-log.md` |
| build-plan-verify (group 9) | CONCERNS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-9-1.md` |
| build-plan-gaps-remediate (group 9) | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-9-1-log.md` |
| build-plan-verify (group 9) | PASS | 2 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-9-2.md` |
| build-plan-verify-holistic | CONCERNS | 6 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-holistic-6.md` |
| build-tests-red (group 1) | - | 7 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-1-7.md` |
| build-tests-red (group 4) | - | 3 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-tests-red-4-3.md` |
| build-plan-gaps-remediate-holistic | PASS | 6 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-holistic-6-log.md` |
| build-plan-verify-holistic | PASS | 7 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-holistic-7.md` |
| build-run-tests | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/run-tests-1.md` |
| build-decision | - | 6 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-decision-1-6.md` |

## Challenge

- Task 13 — CRITICAL — ticked (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- Task 14 — HIGH — ticked (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- Task 15 — HIGH — ticked (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- Task 16 — HIGH — ticked (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- Task 17 — MEDIUM — ticked (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- Task 18 — MEDIUM — ticked (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- Task 19 — MEDIUM — ticked (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- Task 20 — MEDIUM — ticked (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- Task 21 — MEDIUM — ticked (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- Task 22 — MEDIUM — ticked (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- Task 23 — MEDIUM — ticked (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- Task 24 — MEDIUM — ticked (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- Task 25 — HIGH — ticked (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- Task 26 — HIGH — ticked (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- Task 27 — HIGH — ticked (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- Task 28 — MEDIUM — ticked (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- Task 29 — MEDIUM — ticked (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- Task 30 — MEDIUM — ticked (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- Task 31 — MEDIUM — ticked (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- LOW, deferred: 860-move-deterministic-bookkeeping-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1920 — LOW build challenge finding at .bkit/core/engine/commands/workflow/ledgers.ts:1920: A hand-edited `--cursor` with a negative offset passes `decodeCursor` (any integer) and `rows.slice(-n, ...)` returns rows from the end of the scan as if they were the next page. Done when: `decodeCursor` accepts only a whole-number offset no greater than the filtered total, and any other cursor exits 2 as not a cursor from this command.
- LOW, deferred: 860-move-deterministic-bookkeeping-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1709 — LOW build challenge finding at .bkit/core/engine/commands/workflow/ledgers.ts:1709: Every operation-bound append writes its full row block twice into the committed `.bkit/ledger-operations.jsonl` (intent and receipt `detail`), which no compaction trims and which every later append parses whole twice. Done when: The receipt row records the offset, byte count and block digest only, and replay reads the receipted rows back from the ledger at that offset, so the store grows by a fixed size per operation rather than by the rows' size, and `docs/observability.md:38` ('None of them stores a secret, a row body or a token') holds for the receipt.
- LOW, deferred: 860-move-deterministic-bookkeeping-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1688 — LOW build challenge finding at .bkit/core/engine/commands/workflow/ledgers.ts:1688: A replayed operation returns its stored receipt (`replayed: true`, exit 0) without checking that the target ledger still holds the receipted rows. After a branch switch, rebase, revert, or a receipt carried in from another checkout, a finding the caller believes is recorded is silently missing.. Done when: Before a `replay` returns, it confirms that every receipted row line is present in the current target file. When any is absent, the call exits non-zero as an uncertain effect, writes nothing and names the operation.
- LOW, deferred: 860-move-deterministic-bookkeeping-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1521 — LOW build challenge finding at .bkit/core/engine/commands/workflow/ledgers.ts:1521: A standalone invocation's `<id>.corrections.jsonl` is created in the outbox with default permissions (typically world-readable 0644), unlike the 0600 receipt beside it. This breaks the `docs/security.md` contract that invocation files under Git-common `bkit-outbox` are private.. Done when: The corrections file is created with mode 0600 before any row is appended to it, matching `writeInvocation` in `.bkit/core/engine/commands/lib.ts`.
- LOW, deferred: 860-move-deterministic-bookkeeping-challenge-low-bkit-core-engine-ledgers-status-ts-868 — LOW build challenge finding at .bkit/core/engine/ledgers/status.ts:868: A process killed while it holds a target lock leaves `<ledger>.bkit-lock` in the working tree, and nothing ignores it: a lock beside a run's `status.jsonl` (taken by `restoreBranchRows` and `carryOwnBook`) matches the `docs/plans/<month>/logs/<fid>/*` book pathspec, so the next `ledgers commit` commits it, and every clone of that branch then waits 10 s and fails on that file because a committed lock is never reclaimed. Done when: `*.bkit-lock` files are ignored by the shipped gitignore block and excluded from every `bookPathspecs` / `UNION_PATHSPECS` entry (or the lock lives under the git common dir), so `ledgers commit` never stages a lock file.
- LOW, deferred: 860-move-deterministic-bookkeeping-challenge-low-bkit-core-engine-commands-lib-ts-635 — LOW build challenge finding at .bkit/core/engine/commands/lib.ts:635: The `worktree` fingerprint in the committed `invocation` event is an unsalted SHA-256 of the absolute checkout path, so anyone reading a public `status.jsonl` can confirm a guessed username offline: the repository and FID are public, and checkout layouts such as `/Users/<name>/Documents/GitHub/<repo>/.worktrees/<fid>` are few. This undoes the privacy goal of Task 22.. Done when: `worktreeFingerprint` is an HMAC (or salted hash) of the checkout top, keyed by a random per-clone secret that is created once with mode 0600 under `<git common dir>/bkit-outbox/`. The committed event's `worktree` value cannot be recomputed from the path alone. `rebuildInvocation` still rebuilds a receipt in the issuing clone, and still refuses an event from another checkout.
- LOW, deferred: 860-move-deterministic-bookkeeping-challenge-low-bkit-core-engine-commands-workflow-challenge-ts-282 — LOW build challenge finding at .bkit/core/engine/commands/workflow/challenge.ts:282: A structured challenge or review finding whose `title`, `doneWhen`, `cls` or `tests` entry holds a line break is rendered verbatim into its task block. A value carrying `<!-- bkit:task N end -->` or `<!-- bkit:task N start -->` lines can end the real block early (its Severity line falls outside it) or add a forged block. `challenge merge` and `steps finish` read the Findings Log with `parseFindings` and merge those blocks into the plan, while the engine-derived `Failures` and `Fingerprint` header still match the structured input. This is the same forgery Task 24 closed for header values, reached through the body. Untrusted diff text that an agent quotes into a finding is enough to trigger it.. Done when: `structuredFindings` refuses (EXIT_OLD_FORMAT, so `steps stub --result-file` exits 6 and writes nothing) any `title`, `doneWhen`, `cls` or `tests` entry that contains CR or LF. Every rendered Findings Log then parses back with `parseFindings` to exactly the structured findings given.

## Tests

- Attempt 1: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Risks and Action Items

- BLOCKED — Gap 2: boundary/type-suppression at telemetry.test.ts:2986 — the planned test "accepts verified unavailable model without confusing configured and observed models" holds the cast `as unknown as Record<string, unknown>`, which the slop check flags. Only the tests step may change a planned test, so the test is restored to its committed content and the finding stays open for the tests step. (`docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-1-7-log.md`)
- Accepted: docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-decision-1-6.md: Decision: Accept — yes (owner, takes the recommendation)
- Accepted: docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-decision-1-6.md: Decision: Accept — yes (owner, takes the recommendation)
- Accepted: docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-decision-1-6.md: Decision: Accept — yes (owner, takes the recommendation)
- Accepted: docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-decision-1-6.md: Decision: Accept — yes (owner, takes the recommendation)
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-decision-1-4.md`: no decision recorded
- TEST EXCEPTION, task 3: `.bkit/core/engine/ledgers/journal.integration.test.ts` `distinguishes unreadable missing malformed and clean ledger coverage without writing` fails on reporting a clean empty scan for unread input or altering original bytes. — accepted: the only change after it was recorded red was group 8's one-word rename of the `ledgers query` status from `complete` to `clean`; the full static/unit/integration gate passes (owner, 2026-11-12) (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- TEST EXCEPTION, task 9: `.bkit/core/engine/install/modules/core.integration.test.ts` `installs and upgrades fresh consumers with deterministic bookkeeping contracts` fails on source/rendered/compiled CLI drift or fresh consumer invocation/query/result/receipt/recovery probes producing divergent rows, limits or attribution. — accepted: same one-word `complete` to `clean` rename forced by group 8; the install and upgrade checks run in the full gate, which passes (owner, 2026-11-12) (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- TEST EXCEPTION, task 14: `.bkit/core/engine/ledgers/journal.integration.test.ts` `resolves a pending ledger intent after its invocation is stale` fails on a crash at the `prepared` checkpoint followed by a new run start leaving `ledgers union` exiting with 'replay them first' and every replay of the operation refused as a different request. — accepted: group 7 moved where ledger intents are stored, so the test was repointed and re-recorded; it still exercises the stale-invocation path and passes in the full gate (owner, 2026-11-12) (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)
- TEST EXCEPTION, task 17: `.bkit/core/engine/ledgers/journal.integration.test.ts` `refuses to re-append a partly landed block after a foreign writer appended` fails on a two-row operation whose first row and half of its second landed, followed by an `appendFrictionRow` write, being reconciled with exit 0 and the first row present twice. — accepted: group 7 moved where ledger intents are stored, so the test was repointed and re-recorded; it still exercises the foreign-writer path and passes in the full gate (owner, 2026-11-12) (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`)

## Recommended Next Step

```text
/bkit-ship #860
```
