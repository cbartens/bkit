# Debug Abort Handover

## The Short Version

The #842 work is already built, tested and pushed. The only thing that failed is bringing the branch up to date with `origin/dev`: dev changed the same code (the branch-handling tool) that this fix changes, so git cannot merge them without a person choosing between the two versions. The automation is not allowed to hand-merge source code, so it stopped and put the branch back as it was.

## What's Actually Happening

- Symptom: build Step 2 (Worktree Setup), sub-step 2, `bkit branches rebase` replayed the branch's 40 commits onto `origin/dev` and stopped at commit 40, `19b3b1e03` ("chore(842-ship-fails-local): merge dev"). It printed `REFUSE .bkit/core/engine/commands/workflow/branches.ts`, ran `git rebase --abort`, and the lock was released.
- Trigger: a resume of an already-finished build (`workflow-done` 2026-11-05T14:09:47Z, then `workflow-failed` 2026-11-09T08:25:50Z). Since then `origin/dev` gained 29 commits. Merge base is `f80fe162a`.
- Proximate cause: real content conflicts in 7 files, confirmed with a no-touch `git merge-tree` of HEAD against origin/dev:
  - `.bkit/core/engine/commands/workflow/branches.ts` (source code)
  - `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`
  - `.bkit/instructions.md`
  - `.bkit/version`
  - `DETAILS.md`
  - `dist/commands/workflow/branches.js` (built copy of branches.ts)
  - `docs/capabilities.md`
- `.agents/plugins/bkit/skills/bkit-ship/SKILL.md` was named as conflicting mid-rebase, but a plain merge of the two tips auto-merges it. It is probably a per-commit conflict that disappears when merged once.
- Root cause: this branch rewrites `branches.ts` (+327/-66 lines vs the merge base) and the ship skill (+167). Dev touched `branches.ts` repeatedly in the meantime: `7843b02f1` (888, keep tree clean during a paused resume rebase), `7cc81ccce` (724, serialize test runs), `eb636c2f3` (825, progress bar), `ed3428188` (ship runs bkit:generate only after red CI), `28c1e4d93`, `2344b8a67` and `f1acd28ac` (branches rebase conflict-settling rules). Several of those change the very rebase code that just refused.
- Contributing: the replay is commit by commit (40 steps), so one conflict stops it midway. Generated and register files (`dist/`, `DETAILS.md`, `docs/capabilities.md`, `.bkit/version`) conflict as a side effect of the source conflict.

## Rot Signals

None. (No diagnose attempts exist for this abort; build-failure-diagnose-1 belongs to the earlier, resolved test failure.)

## Out-of-Scope Recommendations

None.

## Attempt History

<!-- prettier-ignore -->
| Strategy | What was tried | Why it failed |
| --- | --- | --- |
| STANDARD | `bkit branches rebase` onto origin/dev (resume rebase, 40 commits) | Content conflict in `branches.ts` (source); tool refuses to auto-resolve code, aborted cleanly. Log: `docs/plans/202611/logs/842-ship-fails-local/rebase-resolve-log.md` |

No PIVOT or FINAL attempt was made.

## Verified Resolutions (do not roll back)

- All 10 of 10 plan tasks are ticked in `docs/plans/202611/842-ship-fails-local-plan.md`.
- `build-run-tests` attempt 2 passed (`pnpm bkit:gate:static-unit-integration`, exit 0, 0 failures).
- The earlier failure was remediated (`build-failure-remediate-1-log.md`). Build summary verdict is CONCERNS (holistic verify, failure-diagnose), not FAIL.
- Branch tip `f5db26173` is already on `origin/feat/842-ship-fails-local` (the local branch is ahead 4 of the remote). Do not reset or rewrite it.

## Persistent Errors

- Job: build Step 2 sub-step 2 (resume rebase onto origin/dev).
- Files: the 7 above.
- Exact messages: `Could not apply 19b3b1e03... onto # chore(842-ship-fails-local): merge dev`, `[bkit-rebase] REFUSE .bkit/core/engine/commands/workflow/branches.ts — not an append-only ledger, a recognised lockfile, a generated register, a doc embedding one or the install record; routing to Failure Path`, `[bkit-rebase] ABORTED — git rebase --abort restored the branch`.
- Sequence: 39 commits replayed, commit 40 (a merge-dev commit) conflicted, abort, restore.
- Working tree now: `status.jsonl` modified and `rebase-resolve-log.md` untracked (both run records, not code).

## Recommended Next Steps

1. Merge `origin/dev` into the branch once (not a rebase) and resolve by hand.
   - ✅ FIXES: one conflict set (7 files) instead of 40 replay steps; history stays as pushed, so no force-push.
   - ❌ does not FIX: `branches.ts` still needs a human to combine dev's rebase/conflict rules with #842's changes.
   - ⚠️ COST: moderate (about an hour); after it, regenerate `dist/` and registers, then re-run the static/unit/integration gate.
2. Rebase, resolving each stop by hand.
   - ✅ FIXES: linear history.
   - ❌ does not FIX: repeats the same `branches.ts` conflict on every commit that touches it.
   - ⚠️ COST: high, and needs a force-push (needs Christian's approval).
3. Squash the branch's own changes into one commit on top of `origin/dev`.
   - ✅ FIXES: a single conflict pass.
   - ❌ does not FIX: loses per-task history and the pushed commit record; also a force-push.
   - ⚠️ COST: moderate, high risk to the run records.
4. Skip the sync and ship the PR as it is, letting the PR's merge conflict be settled at merge time.
   - ✅ FIXES: nothing now.
   - ❌ does not FIX: the conflict still exists and would block the merge.
   - ⚠️ COST: low now, defers the same work.

## Recommended Path

Option 1. In `branches.ts`, take dev's version as the base and re-apply #842's changes on top, since dev's 888 and conflict-settling commits changed the rebase code. Take dev's copy of `.bkit/version`, `DETAILS.md`, `docs/capabilities.md` and `dist/`, then rebuild them. Then run the gate and push with approval.

## Reference Docs

- Plan: `docs/plans/202611/842-ship-fails-local-plan.md`
- Build summary: `docs/plans/202611/logs/842-ship-fails-local/build-summary.md`
- Rebase log: `docs/plans/202611/logs/842-ship-fails-local/rebase-resolve-log.md`
- Tests: `run-tests-2.md`, `build-failure-diagnose-1.md`, `build-failure-remediate-1-log.md` in the same logs directory
- Issue comment on #842: `https://github.com/cbartens/bkit/issues/842#issuecomment-6735553666`
- Dev commits on `branches.ts`: `7843b02f1`, `7cc81ccce`, `eb636c2f3`, `ed3428188`, `28c1e4d93`, `2344b8a67`, `f1acd28ac`
