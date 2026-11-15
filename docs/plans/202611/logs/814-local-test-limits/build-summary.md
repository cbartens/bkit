Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-challenge round 1: MEDIUM .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1629, accepted limitation
- build-challenge round 1: LOW tests/shell/setup_suite.bash:22
- 5 item(s) accepted at the Decision Pause
- 1 deferral(s) from this run remain open

Plan tasks: 8 of 8 ticked in `docs/plans/202611/814-local-test-limits-plan.md`.

Publish: held

Docs: not synced (ship syncs on landing)

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/814-local-test-limits/build-input-1.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | `docs/plans/202611/814-local-test-limits-plan.md`, `docs/plans/202611/logs/814-local-test-limits/build-plan-check.md` |
| build-plan-current | - | - | 1 | - |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/814-local-test-limits/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tests (group 1) | PASS | - | 2 | `docs/plans/202611/logs/814-local-test-limits/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | - | 2 | `docs/plans/202611/logs/814-local-test-limits/build-tests-red-1-2.md` |
| build-plan-tasks (group 1) | PASS | - | 1 | `docs/plans/202611/logs/814-local-test-limits/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 3 | `docs/plans/202611/logs/814-local-test-limits/build-plan-verify-1-3.md` |
| build-plan-gaps-remediate (group 1) | PASS | - | 1 | `docs/plans/202611/logs/814-local-test-limits/build-plan-gaps-remediate-1-1-log.md` |
| build-decision | - | - | 4 | `docs/plans/202611/logs/814-local-test-limits/build-decision-1-4.md` |
| build-group-gate (group 1) | PASS | - | 1 | `docs/plans/202611/logs/814-local-test-limits/build-group-gate-1-3.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-tests-red (group 2) | - | - | 1 | `docs/plans/202611/logs/814-local-test-limits/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | - | 1 | `docs/plans/202611/logs/814-local-test-limits/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 1 | `docs/plans/202611/logs/814-local-test-limits/build-plan-verify-2-1.md` |
| build-plan-verify-holistic | PASS | 0 | 3 | `docs/plans/202611/logs/814-local-test-limits/build-plan-verify-holistic-3.md` |
| build-challenge | CONCERNS | 4 | 2 | `docs/plans/202611/logs/814-local-test-limits/build-challenge-1.md`, `docs/plans/202611/logs/814-local-test-limits/build-challenge-2.md` |
| build-group-start (group 3) | - | - | 1 | - |
| build-plan-tests (group 3) | PASS | - | 2 | `docs/plans/202611/logs/814-local-test-limits/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | - | 2 | `docs/plans/202611/logs/814-local-test-limits/build-tests-red-3-2.md` |
| build-plan-tasks (group 3) | PASS | - | 1 | `docs/plans/202611/logs/814-local-test-limits/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 0 | 1 | `docs/plans/202611/logs/814-local-test-limits/build-plan-verify-3-1.md` |
| build-run-tests | PASS | 0 | 1 | `docs/plans/202611/logs/814-local-test-limits/run-tests-1.md` |

## Resolved Findings

- build-plan-verify (group 1) FAIL, resolved by the Decision Pause (`docs/plans/202611/logs/814-local-test-limits/build-decision-1-1.md`), every item accepted
- build-challenge round 1: HIGH vitest.timeout-budget.ts:24, resolved by build-plan-verify (group 3, task 6)
- build-challenge round 1: MEDIUM .bkit/core/engine/commands/workflow/branches.test.ts:102, resolved by build-plan-verify (group 3, task 7)

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/814-local-test-limits/build-input-1.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | `docs/plans/202611/814-local-test-limits-plan.md`, `docs/plans/202611/logs/814-local-test-limits/build-plan-check.md` |
| build-plan-current | - | 1 | - |
| build-install-skills | - | 1 | `docs/plans/202611/logs/814-local-test-limits/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tests (group 1) | PASS | 1 | `docs/plans/202611/logs/814-local-test-limits/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 1 | `docs/plans/202611/logs/814-local-test-limits/build-tests-red-1-1.md` |
| build-plan-tests (group 1) | PASS | 2 | `docs/plans/202611/logs/814-local-test-limits/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 2 | `docs/plans/202611/logs/814-local-test-limits/build-tests-red-1-2.md` |
| build-plan-tasks (group 1) | PASS | 1 | `docs/plans/202611/logs/814-local-test-limits/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | FAIL | 1 | `docs/plans/202611/logs/814-local-test-limits/build-plan-verify-1-1.md` |
| build-plan-gaps-remediate (group 1) | PASS | 1 | `docs/plans/202611/logs/814-local-test-limits/build-plan-gaps-remediate-1-1-log.md` |
| build-plan-verify (group 1) | FAIL | 2 | `docs/plans/202611/logs/814-local-test-limits/build-plan-verify-1-2.md` |
| build-decision | - | 1 | `docs/plans/202611/logs/814-local-test-limits/build-decision-1-1.md` |
| build-plan-verify (group 1) | PASS | 3 | `docs/plans/202611/logs/814-local-test-limits/build-plan-verify-1-3.md` |
| build-group-gate (group 1) | PASS | 3 | `docs/plans/202611/logs/814-local-test-limits/build-group-gate-1-3.md` |
| build-group-start (group 2) | - | - | - |
| build-tests-red (group 2) | - | 1 | `docs/plans/202611/logs/814-local-test-limits/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | 1 | `docs/plans/202611/logs/814-local-test-limits/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 1 | `docs/plans/202611/logs/814-local-test-limits/build-plan-verify-2-1.md` |
| build-plan-verify-holistic | FAIL | 1 | `docs/plans/202611/logs/814-local-test-limits/build-plan-verify-holistic-1.md` |
| build-decision | - | 2 | `docs/plans/202611/logs/814-local-test-limits/build-decision-1-2.md` |
| build-plan-verify-holistic | FAIL | 2 | `docs/plans/202611/logs/814-local-test-limits/build-plan-verify-holistic-2.md` |
| build-decision | - | 3 | `docs/plans/202611/logs/814-local-test-limits/build-decision-1-3.md` |
| build-plan-verify-holistic | PASS | 3 | `docs/plans/202611/logs/814-local-test-limits/build-plan-verify-holistic-3.md` |
| build-challenge | CONCERNS | 1 | `docs/plans/202611/logs/814-local-test-limits/build-challenge-1.md`, `docs/plans/202611/logs/814-local-test-limits/build-challenge-2.md` |
| build-challenge | CONCERNS | 2 | `docs/plans/202611/logs/814-local-test-limits/build-challenge-1.md`, `docs/plans/202611/logs/814-local-test-limits/build-challenge-2.md` |
| build-decision | - | 4 | `docs/plans/202611/logs/814-local-test-limits/build-decision-1-4.md` |
| build-group-start (group 3) | - | - | - |
| build-plan-tests (group 3) | PASS | 1 | `docs/plans/202611/logs/814-local-test-limits/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | 1 | `docs/plans/202611/logs/814-local-test-limits/build-tests-red-3-1.md` |
| build-plan-tests (group 3) | PASS | 2 | `docs/plans/202611/logs/814-local-test-limits/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | 2 | `docs/plans/202611/logs/814-local-test-limits/build-tests-red-3-2.md` |
| build-plan-tasks (group 3) | PASS | 1 | `docs/plans/202611/logs/814-local-test-limits/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 1 | `docs/plans/202611/logs/814-local-test-limits/build-plan-verify-3-1.md` |
| build-run-tests | PASS | 1 | `docs/plans/202611/logs/814-local-test-limits/run-tests-1.md` |

## Challenge

- Task 6 — HIGH — ticked (`docs/plans/202611/814-local-test-limits-plan.md`)
- Task 7 — MEDIUM — ticked (`docs/plans/202611/814-local-test-limits-plan.md`)
- Task 8 — MEDIUM — ticked (`docs/plans/202611/814-local-test-limits-plan.md`)
- LOW, deferred: 814-local-test-limits-challenge-low-tests-shell-setup-suite-bash-22 — LOW build challenge finding at tests/shell/setup_suite.bash:22: With CI=false exported, bats takes the 30s CI branch ([ -n "${CI:-}" ]) while Vitest and node --test take the 180s local limit (limitFactor matches only true / 1), and the bats parity test reads only the else branch, so the split drifts unseen. Done when: setup_suite treats only CI=true or CI=1 as CI (for example case "${CI:-}" in true|1)), and the parity test in .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts asserts the bats CI test matches limitFactor's

## Tests

- Attempt 1: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Risks and Action Items

- Accepted: docs/plans/202611/logs/814-local-test-limits/build-decision-1-1.md: Decision: Accept — owner answered "A" with no reason given
- Accepted: docs/plans/202611/logs/814-local-test-limits/build-decision-1-2.md: Decision: Accept — owner answered "A" with no reason given
- Accepted: docs/plans/202611/logs/814-local-test-limits/build-decision-1-2.md: Decision: Accept — owner answered "A" with no reason given
- Accepted: docs/plans/202611/logs/814-local-test-limits/build-decision-1-3.md: Decision: Accept — owner answered "A" with no reason given
- Accepted: docs/plans/202611/logs/814-local-test-limits/build-decision-1-4.md: Decision: Accept — owner answered "A, keep plain 6x"

## Recommended Next Step

```text
/bkit-ship #814
```
