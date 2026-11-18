Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-challenge round 1: LOW .bkit/core/engine/commands/workflow/ledgers.ts:1309
- build-challenge round 1: LOW .bkit/core/engine/commands/workflow/decisions.test.ts:1698
- build-challenge round 1: LOW .bkit/core/engine/commands/lib.ts:575
- build-challenge round 2: LOW .bkit/core/engine/commands/workflow/ledgers.ts:2393
- build-challenge round 2: LOW .bkit/core/engine/commands/workflow/ledgers.ts:1180
- 5 deferral(s) from this run remain open

Plan tasks: 8 of 8 ticked in `docs/plans/202611/1035-ledger-commit-outbox-plan.md`.

Publish: held

Docs: not synced (ship syncs on landing)

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-input-1.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | `docs/plans/202611/1035-ledger-commit-outbox-plan.md`, `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-check.md` |
| build-plan-current | - | - | 1 | - |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tests (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | - | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-verify-1-1.md` |
| build-group-gate (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-group-gate-1-1.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tests (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | - | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-verify-2-1.md` |
| build-group-gate (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-group-gate-2-1.md` |
| build-group-start (group 3) | - | - | 1 | - |
| build-plan-tasks (group 3) | PASS | - | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 0 | 3 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-verify-3-3.md` |
| build-plan-gaps-remediate (group 3) | PASS | - | 2 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-gaps-remediate-3-2-log.md` |
| build-decision | - | - | 2 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-decision-1-2.md` |
| build-plan-verify-holistic | PASS | 0 | 2 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-verify-holistic-1-2.md` |
| build-holistic-gate | PASS | - | 2 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-holistic-gate-1-2.md` |
| build-challenge | CONCERNS | 5 | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-challenge-1.md`, `docs/plans/202611/logs/1035-ledger-commit-outbox/build-challenge-2.md` |
| build-group-start (group 4) | - | - | 1 | - |
| build-plan-tests (group 4) | PASS | - | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | - | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-tests-red-4-1.md` |
| build-plan-tasks (group 4) | PASS | - | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | PASS | 0 | 2 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-verify-4-2.md` |
| build-plan-gaps-remediate (group 4) | PASS | - | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-gaps-remediate-4-1-log.md` |
| build-challenge | CONCERNS | 3 | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-challenge-1.md`, `docs/plans/202611/logs/1035-ledger-commit-outbox/build-challenge-2.md` |
| build-run-tests | PASS | 0 | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/run-tests-1.md` |

## Resolved Findings

- build-challenge round 1: MEDIUM .bkit/core/engine/commands/workflow/ledgers.ts:1322, resolved by build-plan-verify (group 4, task 7)
- build-challenge round 1: MEDIUM .bkit/core/engine/commands/workflow/ledgers.ts:2380, resolved by build-plan-verify (group 4, task 8)

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-input-1.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | `docs/plans/202611/1035-ledger-commit-outbox-plan.md`, `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-check.md` |
| build-plan-current | - | 1 | - |
| build-install-skills | - | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tests (group 1) | PASS | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-verify-1-1.md` |
| build-group-gate (group 1) | PASS | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-group-gate-1-1.md` |
| build-group-start (group 2) | - | - | - |
| build-plan-tests (group 2) | PASS | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-verify-2-1.md` |
| build-group-gate (group 2) | PASS | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-group-gate-2-1.md` |
| build-group-start (group 3) | - | - | - |
| build-plan-tasks (group 3) | PASS | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | CONCERNS | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-verify-3-1.md` |
| build-plan-gaps-remediate (group 3) | PASS | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-gaps-remediate-3-1-log.md` |
| build-plan-verify (group 3) | CONCERNS | 2 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-verify-3-2.md` |
| build-decision | - | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-decision-1-1.md` |
| build-plan-gaps-remediate (group 3) | PASS | 2 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-gaps-remediate-3-2-log.md` |
| build-plan-verify (group 3) | PASS | 3 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-verify-3-3.md` |
| build-plan-verify-holistic | PASS | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-verify-holistic-1-1.md` |
| build-holistic-gate | PASS | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-holistic-gate-1-1.md` |
| build-challenge | CONCERNS | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-challenge-1.md`, `docs/plans/202611/logs/1035-ledger-commit-outbox/build-challenge-2.md` |
| build-decision | - | 2 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-decision-1-2.md` |
| build-group-start (group 4) | - | - | - |
| build-plan-tests (group 4) | PASS | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-tests-red-4-1.md` |
| build-plan-tasks (group 4) | PASS | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | CONCERNS | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-verify-4-1.md` |
| build-plan-gaps-remediate (group 4) | PASS | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-gaps-remediate-4-1-log.md` |
| build-plan-verify (group 4) | PASS | 2 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-verify-4-2.md` |
| build-plan-verify-holistic | PASS | 2 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-verify-holistic-1-2.md` |
| build-holistic-gate | PASS | 2 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-holistic-gate-1-2.md` |
| build-challenge | CONCERNS | 2 | `docs/plans/202611/logs/1035-ledger-commit-outbox/build-challenge-1.md`, `docs/plans/202611/logs/1035-ledger-commit-outbox/build-challenge-2.md` |
| build-run-tests | PASS | 1 | `docs/plans/202611/logs/1035-ledger-commit-outbox/run-tests-1.md` |

## Challenge

- Task 7 — MEDIUM — ticked (`docs/plans/202611/1035-ledger-commit-outbox-plan.md`)
- Task 8 — MEDIUM — ticked (`docs/plans/202611/1035-ledger-commit-outbox-plan.md`)
- LOW, deferred: 1035-ledger-commit-outbox-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1309 — LOW build challenge finding at .bkit/core/engine/commands/workflow/ledgers.ts:1309: A writer that re-creates a tracked lock between the deleted-file listing and the commit gets its live lock body committed as a modification. Done when: The owner decides whether to accept this narrow race and say so in the `.bkit/core/.bkit/workflows.md` bullet (which now states a changed lock is never staged), or to commit lock deletions through an index-only path (a temporary index with `update-index --force-remove`). No surgical edit closes the window, because `git add --pathspec-from-file` and `git commit --pathspec-from-file` both re-read each listed path from the working tree, so no agent can choose between documenting the race and redesigning the commit path.
- LOW, deferred: 1035-ledger-commit-outbox-challenge-low-bkit-core-engine-commands-workflow-decisions-test-ts-1698 — LOW build challenge finding at .bkit/core/engine/commands/workflow/decisions.test.ts:1698: The pending climb test plants its decision file at logs/other-run while --fid=../other-run resolves to docs/plans/202610/other-run, so its no-deferral-row check passes even with the guard removed. Done when: The fixture sits where the climbing `--fid` resolves (`docs/plans/202610/other-run/build-decision-1-1.md`, or the test passes `--fid=../logs/other-run`), and a control assertion proves the resolved folder holds the planted file, so removing the guard fails the test on the listed item and the written deferral row, not only on the exit code.
- LOW, deferred: 1035-ledger-commit-outbox-challenge-low-bkit-core-engine-commands-lib-ts-575 — LOW build challenge finding at .bkit/core/engine/commands/lib.ts:575: A refused `bkit ledgers commit`, `bkit ledgers only-bookkeeping` or `bkit decisions pending` with `--fid=../../202610/logs/other-run` still appends an `engine-call` row to that other run's `status.jsonl`, because the dispatcher's journal resolves the raw `--fid` into a path before the handler's check runs. Done when: `resolveActiveRun` returns `undefined` when `--fid` fails `/^[a-z0-9][a-z0-9-]*$/`, or when `--month` is given and is not six digits. It returns no run at all in that case, and never falls through to the cwd scan, which would pick the single IN_PROGRESS run and attribute the call to it. A refused call with a climbing `--fid` then leaves every `status.jsonl` byte-identical, which makes the plan's Narrative ("before git or the file system is touched") and the `docs/testing.md` `commands/lib.test.ts` row ("`--fid` never matches another feature's run") true. The existing `resolveActiveRun` cases still pass.
- LOW, deferred: 1035-ledger-commit-outbox-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-2393 — LOW build challenge finding at .bkit/core/engine/commands/workflow/ledgers.ts:2393: A `--month=*` passed to `bkit runs gate --validated` or `bkit runs revalidate` is still accepted and widens the FID's bookkeeping allow-list to every month bucket, because `checkOnlyBookkeeping` grants the CI hook's wildcard exemption to every caller. Done when: `checkOnlyBookkeeping` accepts `month` = `*` only when its caller opts in, and only `bookkeepingPush` in `.bkit/core/engine/commands/ci/ci.ts` opts in; `bkit runs gate --validated --month=*` and `bkit runs revalidate --month=*` exit 2 naming `--month` before any CI lookup or carry-forward, `bkit ci bookkeeping-push` still checks every month, and the `checkMonthFid` comment names the one caller that opts in.
- LOW, deferred: 1035-ledger-commit-outbox-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1180 — LOW build challenge finding at .bkit/core/engine/commands/workflow/ledgers.ts:1180: `bkit ledgers commit --path='*' --mode=commit` (or `--path=':(top)'`, `--path='docs/*.md'`) sweeps every changed and untracked file in the checkout into one bookkeeping commit, because `commitOnePath` hands the `--path` value to `git add --` and `git commit --` as a pathspec pattern, not a literal path; this is the same widening the build closes for `--fid`, on the same command. Done when: `commitOnePath` passes `--path` to both `git add` and `git commit` as one literal path, for example with the `:(literal)` prefix or `--literal-pathspecs`. A `*`, `?`, `[` or `:(...)` in the value then matches only a file with that exact name. `--path='*'` in a checkout with no file named `*` commits nothing and leaves HEAD and the index unchanged, and every existing `bkit ledgers commit --path` case still passes.

## Tests

- Attempt 1: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-ship #1035
```
