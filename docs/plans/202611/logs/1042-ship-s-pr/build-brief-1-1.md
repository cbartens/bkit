# Brief: group 1 — Publish onto a branch an earlier attempt left

Plan: Ship's PR fallback builds on a branch an earlier attempt left Implementation Plan

## Why and what

### Context & Goals

When `dev` refuses ship's push, ship publishes its record through a PR on a fixed branch (`ship-close/{fid}` for the close, `ship-failed/{fid}` for the FAILED flush). If an earlier attempt left that branch on origin, `closePr` in `.bkit/core/engine/commands/workflow/workflows.ts` cannot push to it (a plain push is not a fast-forward) and the record does not land. The fix is to merge the leftover tip into the new record commit before the push, and to reuse an open PR for the branch instead of running `gh pr create` again. Two open LOW deferrals from build 811 in the same code are folded in: the failure reason after a failed `gh pr create` names the pushed branch (`...-1509`), and a flush whose PR opened but did not merge links the tracker comment at the pushed record commit, so the link opens before the merge and after GitHub deletes the branch (`...-830`).

**Related Issues:**

- #1042 — Ship's PR fallback builds on a branch an earlier attempt left (this issue)
- #811 — Publish a dev-refused ship FAILED flush through a ship-close PR (landed on local `dev` as `fa7b9af16`)

---

### Narrative

When `dev` refuses ship's push and origin already holds `ship-close/{fid}` or `ship-failed/{fid}` from an earlier attempt, ship merges that leftover tip into the new record, pushes as a fast-forward, reuses an open PR if there is one and lands the record. The run exits 0 instead of 10 (flush) or 11 (close).

### Success Criteria

- A refused ship FAILED flush lands its record through the `ship-failed/{fid}` PR and exits 0 when origin already holds that branch, whichever of the three ways left it.
- A refused ship close lands through the `ship-close/{fid}` PR and exits 0 when origin already holds that branch.
- An open PR for the branch is reused: no second `gh pr create`, and `mergePr` gets `--match-head-commit` set to the pushed tip.
- Every ledger row and every log file name the leftover tip held is still on the branch after the push.
- A leftover tip that changes a file outside the min-push paths is not merged: the branch on origin is unchanged, the failure reason names the branch and the outside paths, and the exit code is the same as for any other PR-path failure today (10 for the flush, 11 for the close).

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Deleting leftover branches, or pruning old ones | (a) needs no deletion; it only adds to the goal | A follow-up if branches pile up |
| Whether a bkit-owned PR branch counts as a personal branch under `.agents/rules.md` § Force push | (a) uses neither force push nor delete | An owner decision on the rule |
| Pre-flighting the `dev` review and status-check rules that make a close PR's merge fail | A separate check; it only adds to the goal | `docs/deployments.md` § Autonomous phase-close prerequisites |

## Where it fits

- Group 1: Publish onto a branch an earlier attempt left — this group
  - TASK 1: Merge a leftover branch tip into the record and reuse its open PR — open
  - TASK 2: Link an unmerged flush's handover comment at the pushed commit — open
  - TASK 3: Say that ship's PR fallback builds on a branch an earlier attempt left — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Merge a leftover branch tip into the record and reuse its open PR
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

- [ ] **TASK 2:** Link an unmerged flush's handover comment at the pushed commit
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

- [ ] **TASK 3:** Say that ship's PR fallback builds on a branch an earlier attempt left
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

Reuse Inventory rows left out: 4; Architecture entries left out: 4 — read them in docs/plans/202611/1042-ship-s-pr-plan.md § Reuse Inventory and § Architecture & Component Changes.

## Deviations

- What to build is decided in the issue: candidate (a), merge the leftover branch tip into the new record and reuse an open PR. No force push, no branch deletion, no new branch name. Do not build candidates (b) or (c).
- Every line number in the issue is stale: the builds of issues 811 and 958 both changed `.bkit/core/engine/commands/workflow/workflows.ts` since it was written. Find each place by its name (`closePr`, `shipClose`, `landFailedRecord`, `restoreBranchRows`, `pushToDev`, `probePr`, `mergePr`, `minPushOutside`, `minPushPathspecs`).
- Every test runs against temporary git repositories and a bare remote on this machine, with `gh` stubbed, as the existing tests in `workflows.test.ts` do. No test and no step of yours pushes to, or opens a pull request on, the real `origin`.
- Files you may change: `.bkit/core/engine/commands/workflow/workflows.ts`, `workflows.test.ts`, `branches.ts`, `branches.test.ts`, `prs.ts` and `prs.test.ts` only if the PR reuse needs it, the doc lines the issue's TASK 2 lists (`.bkit/core/.bkit/workflows.md` source, `docs/deployments.md`, `docs/testing.md`), the ledger rows the issue names, the built `dist/`, and the rendered copies that `pnpm tsx .bkit/core/engine/cli.ts upgrade` rewrites.
- Files you must not change: `.bkit/core/engine/commands/workflow/steps.ts`, `tests.ts`, `tasks.ts`, `summary.ts` and their tests (the build of issue 1051 and two helpers work on them now); `.bkit/core/engine/commands/land.ts` and `.bkit/core/engine/commands/ci/ci.ts` (read only, as the plan says); `.bkit/instructions.md`; every workflow and prompt file; `.husky/*`; `.github/workflows/*`. If the fix cannot be done without one of these, stop and say what you found.
- Word counts: no workflow or prompt text changes, so `pnpm bkit:text:ceiling check` must still pass at prompts 83,837 and workflows 57,977. Never `raise`.
