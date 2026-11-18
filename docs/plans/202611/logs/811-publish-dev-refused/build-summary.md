Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-challenge round 1: MEDIUM .bkit/core/engine/commands/workflow/workflows.ts:1495, accepted limitation
- build-challenge round 1: LOW .bkit/core/engine/commands/workflow/workflows.ts:1509
- build-challenge round 1: LOW .bkit/core/engine/commands/workflow/workflows.ts:830
- 2 item(s) accepted at the Decision Pause
- 2 deferral(s) from this run remain open

Plan tasks: 5 of 5 ticked in `docs/plans/202611/811-publish-dev-refused-plan.md`.

Publish: held

Docs: not synced (ship syncs on landing)

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-input-1.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | `docs/plans/202611/811-publish-dev-refused-plan.md`, `docs/plans/202611/logs/811-publish-dev-refused/build-plan-check.md` |
| build-plan-current | - | - | 1 | - |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tests (group 1) | PASS | - | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | - | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | - | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-plan-verify-1-1.md` |
| build-group-gate (group 1) | PASS | - | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-group-gate-1-1.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tasks (group 2) | PASS | - | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-plan-verify-2-1.md` |
| build-plan-verify-holistic | PASS | 0 | 3 | `docs/plans/202611/logs/811-publish-dev-refused/build-plan-verify-holistic-1-3.md` |
| build-holistic-gate | PASS | - | 3 | `docs/plans/202611/logs/811-publish-dev-refused/build-holistic-gate-1-3.md` |
| build-plan-gaps-remediate-holistic | PASS | - | 2 | `docs/plans/202611/logs/811-publish-dev-refused/build-plan-gaps-remediate-holistic-1-2-log.md` |
| build-challenge | CONCERNS | 3 | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-challenge-1.md`, `docs/plans/202611/logs/811-publish-dev-refused/build-challenge-2.md` |
| build-decision | - | - | 2 | `docs/plans/202611/logs/811-publish-dev-refused/build-decision-1-2.md` |
| build-run-tests | PASS | 0 | 1 | `docs/plans/202611/logs/811-publish-dev-refused/run-tests-1.md` |

## Resolved Findings

None

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/811-publish-dev-refused/build-input-1.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | `docs/plans/202611/811-publish-dev-refused-plan.md`, `docs/plans/202611/logs/811-publish-dev-refused/build-plan-check.md` |
| build-plan-current | - | 1 | - |
| build-install-skills | - | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tests (group 1) | PASS | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-plan-verify-1-1.md` |
| build-group-gate (group 1) | PASS | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-group-gate-1-1.md` |
| build-group-start (group 2) | - | - | - |
| build-plan-tasks (group 2) | PASS | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-plan-verify-2-1.md` |
| build-plan-verify-holistic | PASS | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-plan-verify-holistic-1-1.md` |
| build-holistic-gate | FAIL | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-holistic-gate-1-1.md` |
| build-plan-gaps-remediate-holistic | PASS | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-plan-gaps-remediate-holistic-1-1-log.md` |
| build-plan-verify-holistic | CONCERNS | 2 | `docs/plans/202611/logs/811-publish-dev-refused/build-plan-verify-holistic-1-2.md` |
| build-holistic-gate | PASS | 2 | `docs/plans/202611/logs/811-publish-dev-refused/build-holistic-gate-1-2.md` |
| build-plan-gaps-remediate-holistic | PASS | 2 | `docs/plans/202611/logs/811-publish-dev-refused/build-plan-gaps-remediate-holistic-1-2-log.md` |
| build-plan-verify-holistic | PASS | 3 | `docs/plans/202611/logs/811-publish-dev-refused/build-plan-verify-holistic-1-3.md` |
| build-holistic-gate | PASS | 3 | `docs/plans/202611/logs/811-publish-dev-refused/build-holistic-gate-1-3.md` |
| build-challenge | CONCERNS | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-challenge-1.md`, `docs/plans/202611/logs/811-publish-dev-refused/build-challenge-2.md` |
| build-decision | - | 1 | `docs/plans/202611/logs/811-publish-dev-refused/build-decision-1-1.md` |
| build-run-tests | PASS | 1 | `docs/plans/202611/logs/811-publish-dev-refused/run-tests-1.md` |
| build-decision | - | 2 | `docs/plans/202611/logs/811-publish-dev-refused/build-decision-1-2.md` |

## Challenge

- Task 5 — MEDIUM — ticked (`docs/plans/202611/811-publish-dev-refused-plan.md`)
- LOW, deferred: 811-publish-dev-refused-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-1509 — LOW build challenge finding at .bkit/core/engine/commands/workflow/workflows.ts:1509: When `gh pr create` fails after the branch push, the flush says the record is only in the book, though origin already holds it on a `ship-failed/{FID}` branch that no line names. Done when: A `gh pr create` failure after a successful branch push names the pushed `ship-failed/{FID}` branch in its failure reason, so the exit-10 log says the record is on that branch with no PR.
- LOW, deferred: 811-publish-dev-refused-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-830 — LOW build challenge finding at .bkit/core/engine/commands/workflow/workflows.ts:830: A flush whose `ship-failed/{FID}` PR opened but did not merge links the tracker comment at that branch, and the link dies once the owner merges the PR and GitHub deletes the head branch. Done when: A flush whose PR opened but did not merge posts a handover link that still opens after the owner merges that PR and GitHub deletes `ship-failed/{FID}`: the link targets `dev`, as in the merged case.

## Tests

- Attempt 1: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Risks and Action Items

- Accepted: docs/plans/202611/logs/811-publish-dev-refused/build-decision-1-1.md: Decision: Accept — the orchestrator's answer, assumed on the owner's behalf (2026-11-18), which the owner can overturn: the issue's edge table already gives this case's outcome (branch push or `gh pr create` fails, record kept in the book, exit 10, both reasons logged); the success close's `ship-close/{FID}` push through the same `closePr` has the same limit; a force push is forbidden and a branch per attempt departs from the issue's fixed name; one follow-up issue covers the leftover branch for both `ship-close/{FID}` and `ship-failed/{FID}`.
- Accepted: docs/plans/202611/logs/811-publish-dev-refused/build-decision-1-2.md: Decision: Accept — the recommended option, taken under the orchestrator's standing rule to take a recommendation when one exists (2026-11-18); task 5 was accepted at decision 1 with no fix built, so its planned test has no code to prove.
- TEST EXCEPTION, task 5: `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev twice for one FID publishes the second record through a PR` fails on the second flush's `HEAD:refs/heads/ship-failed/12-export-csv` push being rejected as non-fast-forward (the first commit is not on `dev`), so it exits 10 with `close branch push failed for ship-failed/12-export-csv` — the task was accepted as a known limit at decision 1 with no fix built, so the test has no code to prove; the orchestrator's follow-up issue owns it (the brief's recommended Accept, taken on the owner's behalf) (owner, 2026-11-18) (`docs/plans/202611/811-publish-dev-refused-plan.md`)

## Recommended Next Step

```text
/bkit-ship #811
```
