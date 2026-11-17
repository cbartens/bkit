# Debug Abort Handover

## The Short Version

The build for issue 912 stopped before it wrote any code. Its branch could not be lined up with the latest `origin/dev`, because the same plan file now exists on both sides with different histories. The run cannot choose between the two copies on its own, so a person needs to decide.

## What's Actually Happening

- Symptom: build Step 2 (Worktree Setup) refused the rebase of `feat/912-debug-loop-question` onto `origin/dev`. The rebase was aborted and the branch is back where it started.
- Trigger: the rebase replayed the branch's `apply-review` commit (`cd906fe85`). That commit touches `docs/plans/202611/logs/912-debug-loop-question/plan-v2-reviewed.md`.
- Proximate cause: git reported `CONFLICT (add/add)` on that file. Both the branch and `origin/dev` created it independently. The rebase helper only auto-resolves append-only ledgers, lockfiles and generated registers. A plan doc is none of these, so it routed to the failure path (`[bkit-rebase] REFUSE ... ABORTED`).
- Root cause: commit `6400d7f97` ("plan DONE", already on `origin/dev`) promoted the plan files to dev. The branch still carries its own earlier copies of the same commits. Git already dropped 4 of them as "patch contents already upstream" (worktree-setup, generate-plan, fetch-context, review-plan). The apply-review commit is the first one whose content differs in history, so it conflicts.
- Contributing factor: the plan workflow pushed and promoted the plan to dev, and the build then started from the old branch. I did not diagnose why the branch was not reset after promotion. That is not written down in the files I read.
- Observation (checked): `git diff HEAD origin/dev` over the whole `docs/plans/202611/logs/912-debug-loop-question/` directory, and over `docs/plans/202611/912-debug-loop-question-plan.md`, shows no difference. The file contents on the branch tip match dev. Only the commit history differs.

## Rot Signals

None

## Out-of-Scope Recommendations

None

## Attempt History

<!-- prettier-ignore -->
| Strategy | What was tried | Why it failed |
| --- | --- | --- |
| STANDARD | `bkit branches rebase` onto `origin/dev` (see `rebase-resolve-log.md`) | The `plan-v2-reviewed.md` add/add conflict is not an auto-resolvable ledger. The helper refused and ran `git rebase --abort`. |

No diagnose or remediate attempts were run. No `build-*.md` logs exist.

## Verified Resolutions (do not roll back)

None. No code was changed. The abort restored the branch; local changes are the modified `status.jsonl` and the new `rebase-resolve-log.md`.

## Persistent Errors

- Failed step: build Step 2, Worktree Setup (`rebase` onto `origin/dev`).
- File: `docs/plans/202611/logs/912-debug-loop-question/plan-v2-reviewed.md`
- Exact messages:
  - `CONFLICT (add/add): Merge conflict in docs/plans/202611/logs/912-debug-loop-question/plan-v2-reviewed.md`
  - `Could not apply cd906fe85... chore(912-debug-loop-question): apply-review`
  - `[bkit-rebase] REFUSE ... — not an append-only ledger, a recognised lockfile, a generated register, a doc embedding one or the install record; routing to Failure Path`
- Sequence: rebase of 9 commits; commits 1-2 applied; 3-6 dropped as already upstream; commit 7 (`cd906fe85`) conflicted; helper refused; abort. The status log ends with `workflow-failed` (build) at 2026-11-12T10:35:36Z.

## Recommended Next Steps

1. Skip the duplicate commits (`git rebase --skip` on each conflicting one, run by a person in the worktree). ✅ FIXES the conflict, because the content already equals dev. ❌ Does not explain why the branch was not reset. ⚠️ COST: low, but it needs a person to run the rebase by hand and check that the final tree equals dev for the plan paths (`git diff origin/dev -- docs/plans/202611`).
2. Make the worktree branch match dev for the plan files (for example, rebuild the branch from `origin/dev`). ✅ FIXES it cleanly. ❌ Discards the branch's own commit history, which is only plan-phase commits. ⚠️ COST: medium. The rules forbid `git reset`, so a person must do this by hand or create a new branch.
3. Fix the process so build starts from the promoted dev, not the old plan branch. ✅ FIXES recurrence. ❌ Does not unblock this run. ⚠️ COST: higher; it needs a diagnosis of the plan-promote / build-start handoff.

## Recommended Path

Option 1, then re-run the build. The final trees already match, so skipping the duplicate plan commits loses nothing. Raise option 3 separately if it happens again.

## Documentation Warnings

None

## Reference Docs

- `docs/plans/202611/logs/912-debug-loop-question/rebase-resolve-log.md` (the rebase transcript)
- `docs/plans/202611/logs/912-debug-loop-question/status.jsonl`
- `docs/plans/202611/912-debug-loop-question-plan.md`
- `origin/dev` commit `6400d7f97` (plan DONE)
- `tmp/bkit-diff-912-debug-loop-question.md` (present; not needed for this diagnosis)
