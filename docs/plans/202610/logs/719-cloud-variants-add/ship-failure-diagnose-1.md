Verdict: CONCERNS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

NORMAL: the conflict is localised to two union-merged ledgers (`.bkit/issues.jsonl`, `docs/roadmap.md`) and reproduced locally; a local merge of `origin/dev` is the concrete fix.

## CI Run

[Run #42483986784](https://github.com/cbartens/bkit/actions/runs/42483986784) — `bkit-ci`, `workflow_dispatch`, head `d773afab362f8801079ad42740dd5a5836cb19db`, `conclusion: success`. It tested the branch head, not a merge with `dev`, so it says nothing about mergeability.

## Prior Attempts Reviewed

None (`Strategy` = `STANDARD`, merge attempt 1). The first dispatch of this diagnosis returned `FAIL` without investigating because its context carried no `Strategy`; that was a dispatch defect, not a diagnosis attempt (see Rot Signals, docs-drift).

## Prior Knowledge

capability-register-pr-gate-checks-the-merge-ref: a check on the PR head greens a PR that is behind its base; the tree that lands is the merge ref — applied as the reason the green head CI run does not prove the PR can merge.
380-full-regenerate-projection-sidesteps-kn-42-duplicate-class: `docs/roadmap.md` is a projection regenerated from `.bkit/issues.jsonl` — applied as the reason the duplicate `_(refreshed …)_` line a union leaves is harmless.
kn-21-workflow-status-json-on-dev-for-all-five-workflows-single-t: status reaches `dev` only via squash-merge — applied as confirmation that the fix belongs on the feature branch, never a push to `dev`.
Reverted commits on `.bkit/core/workflows/bkit-ship.md`, `branches.ts`, `prs.ts`, `runs.ts`, `.gitattributes`: two `revert` grep hits (`df4f13746`, `43bbe7be6`), neither about merging or mergeability — no scar tissue applies.
External pointer: https://github.com/orgs/community/discussions/9288 — opening post (2021-12-24): "It would be helpful if GitHub supported this attribute natively, so manual rebases were not required."; reply quoting GitHub Support: "GitHub doesn't consider user-defined .gitattributes files". Corroborates `.bkit/core/workflows/bkit-ship.md:412` ("GitHub ignores `merge=union`") and #799; not used as proof.

## Related Issues

- #788 — Build and debug PRs conflict on GitHub over union-merged ledgers (CLOSED)
- #799 — Ship Step 4 cannot integrate dev into a Path B PR (CLOSED)
- #842 — Ship fails when the local feature branch differs from GitHub's (OPEN; different cause, the head matches here)

## Failures

One failure. Ship Step 10 (`ship-merge-pr`, attempt 1, `status.jsonl` row at 2026-11-08T13:21:02Z) ran `bkit prs merge --number=893 --match-head=d773afab362f8801079ad42740dd5a5836cb19db` and GitHub refused: "Pull request cbartens/bkit#893 is not mergeable: the merge commit cannot be cleanly created."

Live PR state (`gh pr view 893`): `"mergeable":"CONFLICTING"`, `"mergeStateStatus":"DIRTY"`, `"headRefOid":"d773afab362f8801079ad42740dd5a5836cb19db"` (equals the gated head, so `--match-head` was not the refusal), `"baseRefOid":"53f80ca33a108b4d0a72376f2a915a35ce1402bc"` (the PR's recorded base is the old `dev` tip; `origin/dev` is now `e452f69938559dff0e8f614e1d68908f12f5196f`).

Timeline (commit dates, UTC): `36ac474f4` merge dev 12:25:51 → `d773afab3` ship bookkeeping 12:52:54 → `e452f6993` lands on `dev` 13:07:27 → CI dispatched 13:14:15, green → merge attempt 13:20:53.

## Root Cause

**Proximate cause.** `dev` moved after Step 4 (Integrate) with `e452f6993`, which appended a row at the end of `.bkit/issues.jsonl` and rewrote the `_(refreshed …)_` stamp in `docs/roadmap.md`. The branch's ship bookkeeping commit `d773afab3` changed the same two spots: a new `719-cloud-variants-add` row at the same end of `.bkit/issues.jsonl` (after old line 97), and its own `_(refreshed 2026-11-08T12:52:29Z)_` stamp. Locally both files carry `merge=union` (`.gitattributes`), so `git merge-tree` is clean. GitHub's merge ignores `.gitattributes`, so it sees two overlapping edits in each file and reports CONFLICTING. Reproduced by turning attributes off: `git --attr-source=<empty tree> merge-tree --write-tree HEAD origin/dev` prints `CONFLICT (content): Merge conflict in .bkit/issues.jsonl` and `CONFLICT (content): Merge conflict in docs/roadmap.md`. The same command against the old base `53f80ca33` is clean.

**GitHub's flag is not stale.** CONFLICTING matches what an attribute-less merge with the current `origin/dev` produces. The PR's base is behind: `merge-base HEAD origin/dev` = `53f80ca33`, and `dev` is one commit ahead.

**Design fragility.** Ship integrates `dev` once (Step 4), then commits bookkeeping that appends to the union ledgers (Step 8), then waits for CI (Step 9), then merges (Step 10). Step 10's gate (`runs gate`) checks CI at the head but not whether `dev` moved since Step 4. Any `dev` commit in that window that touches a union ledger (every workflow close does) makes the PR unmergeable on GitHub, even though a local merge is clean. The window here was 12:25 → 13:20 UTC.

**Contributing factors.** Parallel bkit runs on one repo (891's plan closed onto `dev` during this ship); the CI run was a `workflow_dispatch` at the head, so a green run never exercised the merge.

## Rot Signals

reliability, docs-drift

- reliability: Step 10's merge gate (`.bkit/core/workflows/bkit-ship.md:603-616`) has no base-movement or mergeability check, so a ledger-only `dev` commit landing after Step 4 makes the merge fail and routes to diagnose/remediate instead of back to Step 3/4.
- docs-drift: Step 11's diagnose context (`.bkit/core/workflows/bkit-ship.md:743`) omits `Strategy`, while `@bkit-debug-failure-diagnose` Process step 5 requires it and returns `FAIL` without it; only Step 12's remediate context (`:773`) carries `Strategy`: `{STRATEGY}`. This caused the first dispatch of this diagnosis to fail.

## Recommended Remediation

The failure is in Ship bookkeeping, not in any #719 work-target file; the fix is a branch operation, with no source edit.

1. In `/Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add`, merge `origin/dev` into `feat/719-cloud-variants-add` locally with ship's own integrate block (Step 4 sub-step 1, `.bkit/core/workflows/bkit-ship.md:412-414`). It commits uncommitted run work first (the modified `status.jsonl`), lets union settle both ledgers, and creates a real merge commit GitHub can fast-forward over:
   `"{BKIT}" branches sync --merge --fid="719-cloud-variants-add" --file="docs/plans/202610/logs/719-cloud-variants-add/status.jsonl" --sentinel="docs/plans/202610/logs/719-cloud-variants-add/.rebase-failed"`
   Expect exit 0 with `outcome: merged`. Only `.bkit/issues.jsonl` and `docs/roadmap.md` overlap, and both are in `LEDGERS` (`.bkit/core/engine/commands/workflow/branches.ts:169-179`), so exit 24 (conflicts left) is not expected; if it happens, stop and hand over, as these are the only overlapping paths.
   - Do NOT use `bkit prs update-branch` or GitHub's "Update branch": GitHub's server-side merge ignores `merge=union` and will hit the same conflict (#799).
   - Do NOT rebase or force-push; the merge adds commits on top, so the push is plain.
2. Push plainly through Step 12's commit-and-push block (`ledgers commit --scope=full ...` then `branches push --mode=plain`), then return to Step 9 so CI re-validates at the merge head before Step 10 merges.
3. Just before Step 10 merges, confirm `dev` has not moved again (`git fetch origin dev && git merge-base --is-ancestor origin/dev HEAD`). If it moved, repeat step 1; a docs-only `dev` commit needs no fresh code CI, but the gate decides that.

## Out-of-Scope Recommendations

- `.bkit/core/workflows/bkit-ship.md` (Step 10, `:603-616`): after `runs gate` passes, check `git merge-base --is-ancestor origin/dev <head>` (or the PR's `mergeable` field) and route to Step 3 → Step 4 when `dev` moved, instead of letting `prs merge` fail into diagnose/remediate.
- `.bkit/core/engine/commands/workflow/prs.ts` (`mergePr`): when GitHub returns "not mergeable" and the only overlapping paths are `LEDGERS`, exit with a distinct code that means "integrate again", so the workflow can route without a debug round.
- `.bkit/core/workflows/bkit-ship.md:743` (Step 11 Context): add `` `Strategy`: `{STRATEGY}` `` (derived like Step 12's `status route`), so the diagnose agent's required input is present; otherwise every first Ship Debug dispatch returns `FAIL`.
- `.bkit/shared/.gitattributes` / `.bkit/core/engine/ledgers/status.ts` ("union auto-concatenates both branches' appended lines server-side", rendered to `.gitattributes:29-30`): GitHub's server-side merge ignores `merge=union`; the comment should say union applies to local merges only.

## Blast Radius

- Branch tree: the merge commit brings `e452f6993`'s files (891 plan docs and ledger rows) into the branch. They are already on `dev`, so the squash merge adds no net change for them — compatible.
- `.bkit/issues.jsonl`: union keeps both appended rows; readers fold last-wins by `ts` per key — compatible.
- `docs/roadmap.md`: union leaves two `_(refreshed …)_` lines (`_(refreshed 2026-11-08T12:52:29Z)_` and `_(refreshed 2026-11-08T13:07:27Z)_`, seen in the local merge-tree result). The next fold rewrites the marker blocks wholesale (`branches.ts:164-167`) — cosmetic, compatible.
- `branches sync --merge` runs the declared `bkit:generate` (`pnpm build && ... && pnpm bkit upgrade && ... graph:refresh`). `dev`'s new commit touches no engine source, so `dist/` and the mirrors should stay unchanged; any change it makes is committed by the block and re-validated by Step 9 — compatible.
- CI: the new head needs a re-validation run (Step 9); the merge carries no code change from `dev` — compatible.

## Suggested Tests

- `branches.test.ts` (out of scope): `syncVerb --merge` where both sides appended a different row at the end of `.bkit/issues.jsonl` and both rewrote the `_(refreshed …)_` line in `docs/roadmap.md` → `outcome: merged`, exit 0, and an attribute-less `merge-tree` of the result against `origin/dev` reports no conflict.
- Ship Step 10 routing (out of scope): with `dev` one ledger-only commit ahead of the gated head, the workflow routes to Step 3/4 rather than calling `prs merge`.

## Verification Commands

```bash
cd /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
git fetch origin dev
git merge-base --is-ancestor origin/dev HEAD && echo "dev contained"
# GitHub-equivalent check: merge with .gitattributes turned off must report no CONFLICT lines
git --attr-source=4b825dc642cb6eb9a060e54bf8d69288fbee4904 merge-tree --write-tree --name-only HEAD origin/dev
git rev-parse HEAD origin/feat/719-cloud-variants-add   # equal after the plain push
gh pr view 893 --repo cbartens/bkit --json mergeable,mergeStateStatus,headRefOid   # expect MERGEABLE (UNKNOWN for a few seconds after the push)
```

## Hypotheses

### Hypothesis 1: GitHub's mergeable flag is stale and a recompute would show the PR mergeable

#### Reason

Local `git merge-tree --write-tree HEAD origin/dev` exits 0, and `dev` gained only one docs-only commit.

#### Act

`gh pr view 893 --json mergeable,mergeStateStatus,baseRefOid,headRefOid`; re-ran the merge with `.gitattributes` turned off (`git --attr-source=4b825dc642cb6eb9a060e54bf8d69288fbee4904 merge-tree --write-tree --name-only`) against `origin/dev` and against the old base `53f80ca33`.

#### Observe

`"mergeStateStatus":"DIRTY","mergeable":"CONFLICTING"`. Against `origin/dev`: `CONFLICT (content): Merge conflict in .bkit/issues.jsonl` / `CONFLICT (content): Merge conflict in docs/roadmap.md`. Against `53f80ca33`: tree `a7b6940d1fd03d62d86f9f5dcf36ef2e8f9c1c01`, no CONFLICT lines.

#### Result

REFUTED — CONFLICTING matches an attribute-less merge with the current `dev`; the flag is current, not stale.

### Hypothesis 2: The PR base is behind, and dev's new commit overlaps the branch only in union-merged ledgers, which GitHub's merge ignores

#### Reason

`e452f6993` is a workflow close (`plan DONE`), and every close appends to `.bkit/issues.jsonl` and refreshes `docs/roadmap.md`; ship's Step 8 bookkeeping did the same on the branch after Step 4 integrated `dev`.

#### Act

`git diff 53f80ca33 e452f6993 -- .bkit/issues.jsonl docs/roadmap.md` and `git diff 53f80ca33 HEAD -- ...`; `git merge-base HEAD origin/dev`; commit dates; `.bkit/core/workflows/bkit-ship.md:412`; issue #799; one web search plus one fetch.

#### Observe

`merge-base=53f80ca33a108b4d0a72376f2a915a35ce1402bc`. Both sides: `@@ -95,3 +95,4 @@` in `.bkit/issues.jsonl`, adding `"key":"891-build-gate-stuck"` (dev) vs `"key":"719-cloud-variants-add"` ... `"step":"ship-update-docs"` (branch); both rewrite `-_(refreshed 2026-11-08T10:57:52Z)_` to `+_(refreshed 2026-11-08T13:07:27Z)_` (dev) vs `+_(refreshed 2026-11-08T12:52:29Z)_` (branch). `bkit-ship.md:412`: "GitHub ignores `merge=union`". Discussion 9288 reply: "GitHub doesn't consider user-defined .gitattributes files". Dates: `36ac474f4` 22:25:51+10:00, `d773afab3` 22:52:54+10:00, `e452f6993` 23:07:27+10:00.

#### Result

CONFIRMED — dev moved after Step 4 with overlapping edits in two `merge=union` files; a local merge resolves them, while GitHub's merge cannot.

### Hypothesis 3: A real source-code conflict blocks the merge

#### Reason

"the merge commit cannot be cleanly created" is also GitHub's message for code conflicts.

#### Act

Listed the conflicting paths from the attribute-less merge-tree and the files `e452f6993` touches outside `docs/plans/`.

#### Observe

Conflicts: `.bkit/issues.jsonl`, `docs/roadmap.md` only. `e452f6993` outside plans: `.bkit/issues.jsonl`, `.bkit/stats.jsonl`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`, `docs/roadmap.md`.

#### Result

REFUTED — no source file conflicts; both conflicting paths are in `LEDGERS` (`branches.ts:169-179`).

### Hypothesis 4: The refusal is a `--match-head` mismatch because the head moved after the gate

#### Reason

`prs merge` passes `--match-head`, and GitHub refuses when the head moved.

#### Act

Compared `headRefOid` with the gated head and the local/remote branch tips.

#### Observe

`"headRefOid":"d773afab362f8801079ad42740dd5a5836cb19db"`; `git rev-parse HEAD origin/feat/719-cloud-variants-add` → `d773afab362f8801079ad42740dd5a5836cb19db` twice.

#### Result

REFUTED — the head matches; the error text names the merge commit, not the head.
