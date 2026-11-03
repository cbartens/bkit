Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-plan-tasks (group 3) FAIL, answered by build-plan-verify
- build-plan-gaps-remediate (group 3) CONCERNS
- build-plan-verify-holistic CONCERNS
- build-failure-remediate CONCERNS

Plan tasks: 14 of 14 ticked in `docs/plans/202610/724-machine-wide-test-plan.md`.

Publish: pr

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 3 | - |
| build-worktree-setup | - | - | 3 | `docs/plans/202610/logs/724-machine-wide-test/build-input-3.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | - |
| build-plan-current | PASS | - | 1 | `docs/plans/202610/logs/724-machine-wide-test/build-plan-current.md` |
| build-install-skills | - | - | 1 | `docs/plans/202610/logs/724-machine-wide-test/build-install-skills.md` |
| build-group-start (group 3) | - | - | 1 | - |
| build-plan-tests (group 3) | PASS | - | 1 | `docs/plans/202610/logs/724-machine-wide-test/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | - | 1 | `docs/plans/202610/logs/724-machine-wide-test/build-tests-red-3-1.md` |
| build-plan-tasks (group 3) | FAIL | - | 1 | `docs/plans/202610/logs/724-machine-wide-test/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 0 | 2 | `docs/plans/202610/logs/724-machine-wide-test/build-plan-verify-3-2.md` |
| build-group-gate (group 3) | PASS | - | 2 | `docs/plans/202610/logs/724-machine-wide-test/build-group-gate-3-2.md` |
| build-plan-gaps-remediate (group 3) | CONCERNS | - | 1 | `docs/plans/202610/logs/724-machine-wide-test/build-plan-gaps-remediate-3-1-log.md` |
| build-group-start (group 4) | - | - | 1 | - |
| build-plan-tests (group 4) | PASS | - | 3 | `docs/plans/202610/logs/724-machine-wide-test/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | - | 3 | `docs/plans/202610/logs/724-machine-wide-test/build-tests-red-4-3.md` |
| build-plan-tasks (group 4) | PASS | - | 2 | `docs/plans/202610/logs/724-machine-wide-test/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | PASS | 0 | 1 | `docs/plans/202610/logs/724-machine-wide-test/build-plan-verify-4-1.md` |
| build-group-gate (group 4) | PASS | - | 1 | `docs/plans/202610/logs/724-machine-wide-test/build-group-gate-4-1.md` |
| build-group-start (group 5) | - | - | 1 | - |
| build-plan-tests (group 5) | PASS | - | 1 | `docs/plans/202610/logs/724-machine-wide-test/build-plan-tests-5-log.md` |
| build-tests-red (group 5) | - | - | 1 | `docs/plans/202610/logs/724-machine-wide-test/build-tests-red-5-1.md` |
| build-plan-tasks (group 5) | PASS | - | 1 | `docs/plans/202610/logs/724-machine-wide-test/build-plan-tasks-5-log.md` |
| build-plan-verify (group 5) | PASS | 0 | 1 | `docs/plans/202610/logs/724-machine-wide-test/build-plan-verify-5-1.md` |
| build-plan-verify-holistic | CONCERNS | 1 | 1 | `docs/plans/202610/logs/724-machine-wide-test/build-plan-verify-holistic.md` |
| build-challenge | PASS | 0 | 2 | `docs/plans/202610/logs/724-machine-wide-test/build-challenge-1.md`, `docs/plans/202610/logs/724-machine-wide-test/build-challenge-2.md` |
| build-group-start (group 6) | - | - | 1 | - |
| build-plan-tests (group 6) | PASS | - | 1 | `docs/plans/202610/logs/724-machine-wide-test/build-plan-tests-6-log.md` |
| build-tests-red (group 6) | - | - | 1 | `docs/plans/202610/logs/724-machine-wide-test/build-tests-red-6-1.md` |
| build-plan-tasks (group 6) | PASS | - | 1 | `docs/plans/202610/logs/724-machine-wide-test/build-plan-tasks-6-log.md` |
| build-plan-verify (group 6) | PASS | 0 | 1 | `docs/plans/202610/logs/724-machine-wide-test/build-plan-verify-6-1.md` |
| build-run-tests | PASS | 0 | 3 | `docs/plans/202610/logs/724-machine-wide-test/run-tests-3.md` |
| build-failure-diagnose | PASS | - | 1 | `docs/plans/202610/logs/724-machine-wide-test/build-failure-diagnose-1.md` |
| build-failure-remediate | CONCERNS | - | 1 | `docs/plans/202610/logs/724-machine-wide-test/build-failure-remediate-1-log.md` |
| build-decision | - | - | 1 | `docs/plans/202610/logs/724-machine-wide-test/build-decision-3-1.md` |

## Challenge

- Task 13 — HIGH — ticked (`docs/plans/202610/724-machine-wide-test-plan.md`)
- Task 14 — MEDIUM — ticked (`docs/plans/202610/724-machine-wide-test-plan.md`)

## Tests

- Attempt 1: FAIL, failures -, ran `pnpm bkit:gate:static-unit-integration`
- Attempt 2: FAIL, failures 12, ran `pnpm bkit:gate:static-unit-integration`
- Attempt 3: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Risks and Action Items

- BLOCKED — TASK 10: required changed gate — first run failed: related 3596 pass/2 fail/2 skip; named 6972 pass/3 fail/2 skip. Missing Tests lock audit reference and two credential-dependent unplanned post tests; lint, format and typechecks passed (tmp/724-group3-changed.log). (`docs/plans/202610/logs/724-machine-wide-test/build-plan-tasks-3-log.md`)
- BLOCKED — bkit:generate: sandbox tsx IPC listen EPERM; escalated retry then found missing updated audit instruction entry (tmp/724-group3-generate-gate-fix.log, tmp/724-group3-generate-gate-fix-retry.log). (`docs/plans/202610/logs/724-machine-wide-test/build-plan-tasks-3-log.md`)
- BLOCKED — TASK 10: required changed gate — final run exits 1: related 3594 passed/4 runs.test.ts 5000ms timeouts/2 existing skips; named 7109 passed/2 existing skips. Node tests, Bats, lint, format and both typechecks passed; lockHolder null. Broad failure preserved for downstream verification (tmp/724-group3-changed-final.log). (`docs/plans/202610/logs/724-machine-wide-test/build-plan-tasks-3-log.md`)
- BLOCKED — Group gate: exact supplied command exited 1 again with four 5000ms timeouts: bkit-latest invalid-version, runs PR-head/auth, runs CI-refusal and runs issue-less marker. It passed 6966 cases with two existing skips; branch coverage was 82.71%, above the unchanged 78% floor. The six skills cases, CI-script case and runs ref/labels case recovered without changes. No deterministic fix is established (/Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/724-machine-wide-test/build-plan-gaps-remediate-3-1-gate.log). (`docs/plans/202610/logs/724-machine-wide-test/build-plan-gaps-remediate-3-1-log.md`)
- BLOCKED — TASK 11: test `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `every branches push call site routes exit 81 to a re-run of its block` — its scoped 13 routes pass, but its final global count expects 13 although existing design and plan workflows add two fences (actual 15); frozen body left unchanged. (`docs/plans/202610/logs/724-machine-wide-test/build-plan-tasks-4-log.md`)
- BLOCKED — TASK 11: push lock propagation and retry routes — implemented all three hook-running direct push sites and 13 assigned workflow fences; real-Git planned integration cases pass. Final targeted suite passes 689 tests, help lists lockHolder and81, and fresh built CLI proves wait81/no push, refusal4, own gate75 remains8, explicit/default budgets and invalid-env usage. Frozen guard remains impossible until its global15-versus13 scope is corrected (tmp/724-group4-current-targeted.log, tmp/724-group4-task11-focused.log, tmp/724-group4-built-cli-dogfood-final.log). (`docs/plans/202610/logs/724-machine-wide-test/build-plan-tasks-4-log.md`)
- BLOCKED — TASK 6: final no-holder full and package-file gate checks — initial runs received package.json and had no lock wait, but failed only the five future route/push reds (full unit6971 pass/3fail/2skip; package changed8711 pass/5fail/2skip). Final combined reruns remain unrun while the frozen Task11 guard expects13 despite15 canonical push sites; orchestrator will correct plan/tests before rerunning (tmp/724-group4-task6-full-gate.log, tmp/724-group4-task6-changed-package.log). (`docs/plans/202610/logs/724-machine-wide-test/build-plan-tasks-4-log.md`)
- BLOCKED — TASK 11: required changed-file gate — not rerun after final code because the known frozen global push-site count cannot pass; preserved as blocked rather than claiming a pass, per orchestrator instruction. Current static checks pass; broad gate must run after plan/test correction. (`docs/plans/202610/logs/724-machine-wide-test/build-plan-tasks-4-log.md`)
- BLOCKED — changed gate: historical run failed only types with four TS18047 nullable stdout/stderr diagnostics; related 8726 pass/2 existing skips in 218.25s, named 6613 pass in 243.41s, bats16 pass, formatting pass; both wait notes are expected 5s-budget integration fixtures, no 60s wait markers (tmp/724-group5-changed.log). (`docs/plans/202610/logs/724-machine-wide-test/build-plan-tasks-5-log.md`)

## Recommended Next Step

```text
/bkit-ship #724
```
