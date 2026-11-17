Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-challenge round 2: LOW .bkit/core/engine/commands/workflow/ledgers.ts:1273
- 1 deferral(s) from this run remain open

Plan tasks: 6 of 6 ticked in `docs/plans/202611/992-ledger-commands-six-plan.md`.

Publish: held

Docs: not synced (ship syncs on landing)

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-input-1.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | `docs/plans/202611/992-ledger-commands-six-plan.md`, `docs/plans/202611/logs/992-ledger-commands-six/build-plan-check.md` |
| build-plan-current | - | - | 1 | - |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tests (group 1) | PASS | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 2 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-1-2.md` |
| build-group-gate (group 1) | PASS | - | 2 | `docs/plans/202611/logs/992-ledger-commands-six/build-group-gate-1-2.md` |
| build-plan-gaps-remediate (group 1) | PASS | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-gaps-remediate-1-1-log.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tests (group 2) | PASS | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-2-1.md` |
| build-plan-verify-holistic | PASS | 0 | 3 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-holistic-1-3.md` |
| build-holistic-gate | PASS | - | 3 | `docs/plans/202611/logs/992-ledger-commands-six/build-holistic-gate-1-3.md` |
| build-challenge | CONCERNS | 2 | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-challenge-1.md`, `docs/plans/202611/logs/992-ledger-commands-six/build-challenge-2.md` |
| build-decision | - | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-decision-1-1.md` |
| build-group-start (group 3) | - | - | 1 | - |
| build-plan-tests (group 3) | PASS | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-tests-red-3-1.md` |
| build-plan-tasks (group 3) | PASS | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 0 | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-3-1.md` |
| build-challenge | CONCERNS | 2 | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-challenge-1.md`, `docs/plans/202611/logs/992-ledger-commands-six/build-challenge-2.md` |
| build-group-start (group 4) | - | - | 1 | - |
| build-plan-tests (group 4) | PASS | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-tests-red-4-1.md` |
| build-plan-tasks (group 4) | PASS | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | PASS | 0 | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-4-1.md` |
| build-run-tests | PASS | 0 | 1 | `docs/plans/202611/logs/992-ledger-commands-six/run-tests-1.md` |

## Resolved Findings

- build-challenge round 1: MEDIUM .bkit/core/engine/commands/workflow/ledgers.ts:1841, resolved by build-plan-verify (group 3, task 5)
- build-challenge round 2: MEDIUM .bkit/core/engine/commands/workflow/ledgers.ts:1865, resolved by build-plan-verify (group 4, task 6)

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/992-ledger-commands-six/build-input-1.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | `docs/plans/202611/992-ledger-commands-six-plan.md`, `docs/plans/202611/logs/992-ledger-commands-six/build-plan-check.md` |
| build-plan-current | - | 1 | - |
| build-install-skills | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tests (group 1) | PASS | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-1-1.md` |
| build-group-gate (group 1) | FAIL | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-group-gate-1-1.md` |
| build-plan-gaps-remediate (group 1) | PASS | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-gaps-remediate-1-1-log.md` |
| build-plan-verify (group 1) | PASS | 2 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-1-2.md` |
| build-group-gate (group 1) | PASS | 2 | `docs/plans/202611/logs/992-ledger-commands-six/build-group-gate-1-2.md` |
| build-group-start (group 2) | - | - | - |
| build-plan-tests (group 2) | PASS | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-2-1.md` |
| build-plan-verify-holistic | PASS | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-holistic-1-1.md` |
| build-holistic-gate | PASS | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-holistic-gate-1-1.md` |
| build-challenge | CONCERNS | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-challenge-1.md`, `docs/plans/202611/logs/992-ledger-commands-six/build-challenge-2.md` |
| build-decision | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-decision-1-1.md` |
| build-group-start (group 3) | - | - | - |
| build-plan-tests (group 3) | PASS | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-tests-red-3-1.md` |
| build-plan-tasks (group 3) | PASS | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-3-1.md` |
| build-plan-verify-holistic | PASS | 2 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-holistic-1-2.md` |
| build-holistic-gate | PASS | 2 | `docs/plans/202611/logs/992-ledger-commands-six/build-holistic-gate-1-2.md` |
| build-challenge | CONCERNS | 2 | `docs/plans/202611/logs/992-ledger-commands-six/build-challenge-1.md`, `docs/plans/202611/logs/992-ledger-commands-six/build-challenge-2.md` |
| build-group-start (group 4) | - | - | - |
| build-plan-tests (group 4) | PASS | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-tests-red-4-1.md` |
| build-plan-tasks (group 4) | PASS | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | PASS | 1 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-4-1.md` |
| build-plan-verify-holistic | PASS | 3 | `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-holistic-1-3.md` |
| build-holistic-gate | PASS | 3 | `docs/plans/202611/logs/992-ledger-commands-six/build-holistic-gate-1-3.md` |
| build-run-tests | PASS | 1 | `docs/plans/202611/logs/992-ledger-commands-six/run-tests-1.md` |

## Challenge

- Task 5 — MEDIUM — ticked (`docs/plans/202611/992-ledger-commands-six-plan.md`)
- Task 6 — MEDIUM — ticked (`docs/plans/202611/992-ledger-commands-six-plan.md`)
- LOW, deferred: 992-ledger-commands-six-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1273 — LOW build challenge finding at .bkit/core/engine/commands/workflow/ledgers.ts:1273: A lock file that an older bkit already committed, and that the owner then deletes, never has its deletion committed: the new exclude also drops the `--cached` entry, so every fresh checkout brings the stale lock back and blocks appends to that target. Done when: `commitBookkeeping` still never stages an untracked `*.bkit-lock` file or a change to a tracked one, but it does stage and commit the deletion of a tracked `*.bkit-lock` under the book pathspecs that is gone from the worktree (for example, a separate `git ls-files --deleted` listing of lock paths, joined to `paths`); the existing test "a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit" still passes

## Tests

- Attempt 1: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-ship #992
```
