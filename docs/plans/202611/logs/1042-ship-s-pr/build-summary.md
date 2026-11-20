Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-challenge round 1: LOW .bkit/core/engine/commands/workflow/branches.ts:2947
- build-challenge round 1: LOW .bkit/core/engine/commands/workflow/workflows.ts:1692
- build-plan-gaps-remediate-holistic CONCERNS
- build-challenge round 2: LOW .bkit/core/engine/commands/workflow/workflows.ts:1696
- build-challenge round 2: LOW .bkit/core/engine/commands/workflow/workflows.ts:1745
- build-challenge round 2: LOW .bkit/core/engine/commands/workflow/workflows.ts:1689
- 1 item(s) accepted without the owner (assumed; ship asks to confirm)
- 5 deferral(s) from this run remain open

Plan tasks: 11 of 11 ticked in `docs/plans/202611/1042-ship-s-pr-plan.md`.

Publish: held

Docs: not synced (ship syncs on landing)

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 3 | - |
| build-worktree-setup | - | - | 3 | `docs/plans/202611/logs/1042-ship-s-pr/build-input-1.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | `docs/plans/202611/1042-ship-s-pr-plan.md`, `docs/plans/202611/logs/1042-ship-s-pr/build-plan-check.md` |
| build-plan-current | - | - | 1 | - |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tests (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | FAIL | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 2 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-1-2.md` |
| build-plan-gaps-remediate (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-gaps-remediate-1-1-log.md` |
| build-plan-verify-holistic | PASS | 0 | 3 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-holistic-1-3.md` |
| build-holistic-gate | PASS | - | 5 | `docs/plans/202611/logs/1042-ship-s-pr/build-holistic-gate-1-3.md` |
| build-challenge | FAIL | 1 | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-challenge-1.md`, `docs/plans/202611/logs/1042-ship-s-pr/build-challenge-2.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tests (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 2 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-2-2.md` |
| build-plan-gaps-remediate (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-gaps-remediate-2-1-log.md` |
| build-group-gate (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-group-gate-2-2.md` |
| build-group-start (group 3) | - | - | 1 | - |
| build-plan-tests (group 3) | PASS | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-tests-red-3-1.md` |
| build-plan-tasks (group 3) | PASS | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 0 | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-3-1.md` |
| build-plan-gaps-remediate-holistic | CONCERNS | - | 2 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-gaps-remediate-holistic-1-2-log.md` |
| build-decision | - | - | 3 | `docs/plans/202611/logs/1042-ship-s-pr/build-decision-1-3.md` |
| build-challenge | FAIL | 1 | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-challenge-1.md`, `docs/plans/202611/logs/1042-ship-s-pr/build-challenge-2.md` |
| build-group-start (group 4) | - | - | 1 | - |
| build-plan-tests (group 4) | PASS | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-tests-red-4-1.md` |
| build-plan-tasks (group 4) | PASS | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | PASS | 0 | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-4-1.md` |
| build-run-tests | PASS | 0 | 2 | `docs/plans/202611/logs/1042-ship-s-pr/run-tests-2.md` |
| build-failure-diagnose | PASS | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-failure-diagnose-1.md` |
| build-failure-remediate | PASS | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-failure-remediate-1-log.md` |

## Resolved Findings

- build-plan-tasks (group 1) FAIL, resolved by build-plan-verify
- build-challenge round 1: MEDIUM .bkit/core/engine/commands/workflow/workflows.ts:1712, resolved by build-plan-verify (group 2, task 6)
- build-challenge round 1: MEDIUM .bkit/core/engine/commands/workflow/workflows.ts:1747, resolved by build-plan-verify (group 2, task 7)
- build-challenge round 1: CRITICAL .bkit/core/engine/commands/workflow/workflows.ts:1711, resolved by build-plan-verify (group 2, task 4)
- build-challenge round 1: HIGH .bkit/core/engine/commands/workflow/workflows.ts:1722, resolved by build-plan-verify (group 2, task 5)
- build-challenge round 1: MEDIUM .bkit/core/engine/commands/workflow/workflows.ts:1700, resolved by build-plan-verify (group 2, task 8)
- build-challenge round 1: MEDIUM .bkit/core/engine/commands/workflow/workflows.ts:1719, resolved by build-plan-verify (group 3, task 9)
- build-challenge round 2: CRITICAL .bkit/core/engine/commands/workflow/workflows.ts:1726, resolved by build-plan-verify (group 4, task 10)
- build-challenge round 2: MEDIUM .bkit/core/engine/commands/workflow/workflows.ts:1725, resolved by build-plan-verify (group 4, task 11)

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/1042-ship-s-pr/build-input-1.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | `docs/plans/202611/1042-ship-s-pr-plan.md`, `docs/plans/202611/logs/1042-ship-s-pr/build-plan-check.md` |
| build-plan-current | - | 1 | - |
| build-install-skills | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tests (group 1) | PASS | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | FAIL | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | CONCERNS | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-1-1.md` |
| build-plan-gaps-remediate (group 1) | PASS | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-gaps-remediate-1-1-log.md` |
| build-plan-verify (group 1) | PASS | 2 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-1-2.md` |
| build-plan-verify-holistic | PASS | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-holistic-1-1.md` |
| build-holistic-gate | PASS | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-holistic-gate-1-1.md` |
| build-challenge | FAIL | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-challenge-1.md`, `docs/plans/202611/logs/1042-ship-s-pr/build-challenge-2.md` |
| build-group-start (group 2) | - | - | - |
| build-plan-tests (group 2) | PASS | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | CONCERNS | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-2-1.md` |
| build-plan-gaps-remediate (group 2) | PASS | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-gaps-remediate-2-1-log.md` |
| build-plan-verify (group 2) | PASS | 2 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-2-2.md` |
| build-group-gate (group 2) | PASS | 2 | `docs/plans/202611/logs/1042-ship-s-pr/build-group-gate-2-2.md` |
| build-group-start (group 3) | - | - | - |
| build-plan-tests (group 3) | PASS | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-tests-red-3-1.md` |
| build-plan-tasks (group 3) | PASS | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-3-1.md` |
| build-plan-verify-holistic | PASS | 2 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-holistic-1-2.md` |
| build-holistic-gate | FAIL | 2 | `docs/plans/202611/logs/1042-ship-s-pr/build-holistic-gate-1-2.md` |
| build-plan-gaps-remediate-holistic | CONCERNS | 2 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-gaps-remediate-holistic-1-2-log.md` |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/1042-ship-s-pr/build-input-1.md` |
| build-decision | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-decision-1-1.md` |
| build-holistic-gate | FAIL | 2 | `docs/plans/202611/logs/1042-ship-s-pr/build-holistic-gate-1-2.md` |
| build-plan-gaps-remediate-holistic | CONCERNS | 2 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-gaps-remediate-holistic-1-2-log.md` |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/1042-ship-s-pr/build-input-1.md` |
| build-decision | - | 2 | `docs/plans/202611/logs/1042-ship-s-pr/build-decision-1-2.md` |
| build-holistic-gate | PASS | 2 | `docs/plans/202611/logs/1042-ship-s-pr/build-holistic-gate-1-2.md` |
| build-challenge | FAIL | 2 | `docs/plans/202611/logs/1042-ship-s-pr/build-challenge-1.md`, `docs/plans/202611/logs/1042-ship-s-pr/build-challenge-2.md` |
| build-group-start (group 4) | - | - | - |
| build-plan-tests (group 4) | PASS | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-tests-red-4-1.md` |
| build-plan-tasks (group 4) | PASS | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | PASS | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-4-1.md` |
| build-plan-verify-holistic | PASS | 3 | `docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-holistic-1-3.md` |
| build-holistic-gate | PASS | 3 | `docs/plans/202611/logs/1042-ship-s-pr/build-holistic-gate-1-3.md` |
| build-run-tests | FAIL | 1 | `docs/plans/202611/logs/1042-ship-s-pr/run-tests-1.md` |
| build-failure-diagnose | PASS | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-failure-diagnose-1.md` |
| build-failure-remediate | PASS | 1 | `docs/plans/202611/logs/1042-ship-s-pr/build-failure-remediate-1-log.md` |
| build-run-tests | PASS | 2 | `docs/plans/202611/logs/1042-ship-s-pr/run-tests-2.md` |
| build-decision | - | 3 | `docs/plans/202611/logs/1042-ship-s-pr/build-decision-1-3.md` |

## Challenge

- Task 4 — CRITICAL — ticked (`docs/plans/202611/1042-ship-s-pr-plan.md`)
- Task 5 — HIGH — ticked (`docs/plans/202611/1042-ship-s-pr-plan.md`)
- Task 6 — MEDIUM — ticked (`docs/plans/202611/1042-ship-s-pr-plan.md`)
- Task 7 — MEDIUM — ticked (`docs/plans/202611/1042-ship-s-pr-plan.md`)
- Task 8 — MEDIUM — ticked (`docs/plans/202611/1042-ship-s-pr-plan.md`)
- Task 9 — MEDIUM — ticked (`docs/plans/202611/1042-ship-s-pr-plan.md`)
- Task 10 — CRITICAL — ticked (`docs/plans/202611/1042-ship-s-pr-plan.md`)
- Task 11 — MEDIUM — ticked (`docs/plans/202611/1042-ship-s-pr-plan.md`)
- LOW, deferred: 1042-ship-s-pr-challenge-low-bkit-core-engine-commands-workflow-branches-ts-2947 — LOW build challenge finding at .bkit/core/engine/commands/workflow/branches.ts:2947: A failed `git add` in `restoreBranchRows` is ignored, so `closePr` commits the merge without the leftover tip's put-back ledger rows and still exits 0 with `pushed: true`. Done when: `restoreBranchRows` reports a `git add` that fails (a returned list of unstaged ledgers, or a throw naming the ledger), and `closePr` aborts the merge and returns `{ failed }` naming the branch, the tip and the ledger, so the plan's success criterion "every ledger row the leftover tip held is still on the branch" never ends silently false.
- LOW, deferred: 1042-ship-s-pr-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-1692 — LOW build challenge finding at .bkit/core/engine/commands/workflow/workflows.ts:1692: Anyone who can push a branch named `x/refs/heads/ship-failed/{FID}` makes `git ls-remote origin refs/heads/ship-failed/{FID}` answer with that look-alike's tip, because `ls-remote` treats the ref as a tail-matched glob; the flush then reads the wrong tip and fails with "cannot fetch origin's ship-failed/{FID}", or merges the look-alike's commit. Done when: `closePr` takes the tip only from the `ls-remote` line whose ref column is exactly `refs/heads/{branch}`, and treats no such line as no branch. Verified in this challenge with a bare remote that held only `refs/heads/a/refs/heads/ship-failed/12-export-csv`: `git ls-remote origin refs/heads/ship-failed/12-export-csv` printed that ref's SHA with exit 0. `docs/security.md` § Input validation says the CLI validates its inputs.
- LOW, deferred: 1042-ship-s-pr-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-1696 — LOW build challenge finding at .bkit/core/engine/commands/workflow/workflows.ts:1696: A `bkit:gate:min` that rewrites a file of the merged leftover tip and exits 0 lets `closePr` push the unrewritten merge commit, where `checkLanding` stops the same landing with "landing gate changed the checkout". Done when: `gateMerged` reads HEAD and `git status --porcelain --untracked-files=all --ignore-submodules=none` before the gate and compares both after it, as `unchanged()` in `checkLanding` (`.bkit/core/engine/commands/land.ts:189`) does. A gate that moves HEAD or leaves the tree changed returns a reason that names the branch and says the landing gate changed the checkout, nothing is pushed, and the exit code is 10 for the flush and 11 for the close. `gateMerged` passes `ctx.log` to `runPushGate` instead of `() => {}`, so the gate's own lines reach the exit log. Today `runWithReceipt` (`.bkit/core/engine/commands/ci/push-gate.ts:128`) returns a `bkit:gate:min` status without looking at the checkout, and for the deepest full gate it returns the gate's 0 when the checkout changed and only logs "full gate passed, but the checkout changed", a line `gateMerged` drops. `.bkit/core/.bkit/workflows.md:126` (§ One landing routine for every dev write) says "Missing gates, failed checks and a changed landing tree stop the push", and the diff's new `docs/security.md` paragraph says the local landing gate is the only check a `[skip ci]` landing gets.
- LOW, deferred: 1042-ship-s-pr-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-1745 — LOW build challenge finding at .bkit/core/engine/commands/workflow/workflows.ts:1745: A squash-merged `ship-failed/{FID}` or `ship-close/{FID}` branch left on origin is merged into the next record, and the merge puts back the `.bkit/friction.jsonl` rows that harvest drained from `dev` after that squash, so the new PR lands the drained rows on `dev` again. Done when: When the leftover tip's own PR is already MERGED (`probePr` with `state: "all"` finds a MERGED PR whose `headRefName` is the branch and whose `headRefOid` is the tip), `closePr` records the tip with `git merge -s ours` (the record's tree is kept exactly, and the push still fast-forwards) instead of `-X ours` plus `restoreBranchRows`, so the PR carries only the new record. Any other leftover tip is merged as today. The plan's Edge Cases row "Leftover branch whose PR was squash-merged" says "Its changes are already on dev, so the PR adds only the new record", and the `.bkit/shared/.gitattributes` header says `.bkit/friction.jsonl` "is the one ledger rows are REMOVED from (bkit's harvest drains it). Union would resurrect rows a drain deleted". The resurrection needs no conflict: the record's side has no net change to the file between the merge base and `dev`, so the 3-way merge applies the tip's added row. Verified in this challenge with a scratch repo (base row `a`; the tip adds `x`; `dev` gets the squash adding `x`, then a commit draining `x`, then the record): `git merge --no-ff --no-commit -X ours {tip}` exited 0 and left `{"key":"x"}` in `.bkit/friction.jsonl`.
- LOW, deferred: 1042-ship-s-pr-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-1689 — LOW build challenge finding at .bkit/core/engine/commands/workflow/workflows.ts:1689: `gateMerged` compares the merge with `origin/dev` as it reads after the refused push, so when another landing in the same clone has fetched a newer `dev` meanwhile, the record looks like it reverts that newer `dev` code: the flush runs the full push gate, or stops with "has no declared landing gate" when none is declared. Done when: `gateMerged` classifies the merge against the base the record was built on, `git merge-base HEAD origin/dev` (the commit `pushToDev` checked out at `worktree add`), as `checkLanding` does with the fixed `base` it receives from `.bkit/core/engine/commands/land.ts:243`. An `origin/dev` that a parallel landing moved to a newer commit then still picks `bkit:gate:min` for a record plus a leftover tip that touch only the record's paths. `refs/remotes/origin/dev` is shared by every worktree of the clone, `fetchDev` rewrites it with `+refs/heads/dev:refs/remotes/origin/dev` (`.bkit/core/.bkit/workflows.md:126`), `pushToDev`'s doc comment names "another landing in this clone updating `origin/dev`", and runs of different FIDs hold separate locks (`.bkit/core/.bkit/workflows.md` § Concurrency lock), so they can land at the same time.

## Tests

- Attempt 1: FAIL, failures -, ran `pnpm bkit:gate:static-unit-integration`
- Attempt 2: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Risks and Action Items

- Assumed, not confirmed: docs/plans/202611/logs/1042-ship-s-pr/build-decision-1-3.md: Decision: Accept (assumed) — the lines only add the setup the test needs to reach the check it names, and no assertion changed (ask:false, LOCAL, 2026-11-20)

## Recommended Next Step

```text
/bkit-ship #1042
```
