# Debug Abort Handover

## The Short Version

Nothing was built for #803. The build stopped while updating its working copy to the latest `origin/dev`, because the plan file exists in two different versions, one on the feature branch and one on `origin/dev`, and git cannot choose between them. A person has to pick which plan stands, then re-run `/bkit-build #803`.

## What's Actually Happening

- **Symptom:** Build Step 2 (Worktree Setup), sub-step 2 ran `bkit branches rebase` onto `origin/dev`. It stopped with `CONFLICT (add/add): Merge conflict in docs/plans/202611/803-close-codex-opencode-plan.md`. The rebase tool refused to auto-resolve the file and ran `git rebase --abort`. The branch is restored (HEAD `e8b8d35b8`, ahead 9, behind 17).
- **Trigger:** The branch was last synced at merge-base `2d510c666`. `origin/dev` has since moved to `dd8b4390c`.
- **Proximate cause:** Both sides added the same plan path independently. `origin/dev` holds the plan as landed by `32b5d12e2` and `42c328f7a` ("owner answers"), with `baseSha: 1afb96fd…`. The feature branch holds its own copy, built by `80c04013a` ("generate-plan") through `1f02d2ac6`. A later commit, `e8b8d35b8`, refreshed the line references and set `baseSha: 2d510c666…`. Git sees two unrelated "add" histories for one file.
- **Root cause:** The plan was committed on two lines of history. The refusal is by design: the rebase tool only auto-resolves append-only ledgers, lockfiles, generated registers and install records. A plan is hand-written prose, so the tool will not guess.
- **Contributing factor:** git had a recorded resolution (`Resolved … using previous resolution`) for an earlier replayed commit. The conflict then hit commit 11 of 11, `8bd3c6bfe` ("merge dev").

I compared the two plan versions. `origin/dev`'s plan is identical to `42c328f7a`. The branch's plan differs from it only by `baseSha` and refreshed line references and numbers (for example `providers.md:463` became `:510`, `uninstall.ts:725-745` became `:705-725`, and `decideShell` is now cited with its current signature). The refreshed version also adds one sentence to the `guardrails-tiers.js` task. It says the Codex key-read deny must live in `decideShell`, because that file is also spliced into the Cursor and Antigravity hooks. Substance appears unchanged. Only the references are fresher.

## Rot Signals

None. No diagnose attempts ran; the failure is a merge conflict.

## Out-of-Scope Recommendations

None.

## Attempt History

<!-- prettier-ignore -->
| Strategy | What was tried | Why it failed |
| --- | --- | --- |
| STANDARD | `bkit branches rebase` onto `origin/dev` (worktree resume) | add/add conflict on the plan file. The tool refused it as not auto-resolvable and aborted the rebase. No further attempts were made, because the choice is the owner's. |

## Verified Resolutions (do not roll back)

- The rebase abort restored the branch. HEAD is `e8b8d35b8`, and there are no half-applied rebase files.
- Commit `e8b8d35b8` (refresh of plan references to current dev) is worth keeping in some form. See option A.

## Persistent Errors

- File: `docs/plans/202611/803-close-codex-opencode-plan.md`
- Error: `CONFLICT (add/add): Merge conflict in docs/plans/202611/803-close-codex-opencode-plan.md`
- Tool message: `[bkit-rebase] REFUSE … — not an append-only ledger, a recognised lockfile, a generated register, a doc embedding one or the install record; routing to Failure Path`, then `[bkit-rebase] ABORTED — git rebase --abort restored the branch`
- Sequence: commits 1 to 10 replayed cleanly. Commit 11 (`8bd3c6bfe`) conflicted. The rebase was aborted at 2026-11-14T03:26:14Z, and `workflow-failed` for build was logged at 03:26:24Z.
- Full log: `docs/plans/202611/logs/803-close-codex-opencode/rebase-resolve-log.md`

## Recommended Next Steps

1. **Keep the branch's refreshed plan, then rebase.** The owner resolves the conflict by hand in favour of the feature-branch version, for example by running the rebase manually and taking "ours" for the plan file only.
   - ✅ FIXES: keeps the current line references and the extra `decideShell` note.
   - ❌ does not FIX: any wording changes made on `origin/dev` after `42c328f7a`. I found none.
   - ⚠️ COST: low. It needs a human to run the manual rebase.
2. **Keep `origin/dev`'s plan.** Drop the branch's plan changes and take the dev version.
   - ✅ FIXES: the conflict, and keeps the version that already carries the owner's answers on dev.
   - ❌ does not FIX: the stale line numbers and `baseSha`, so the build would work from outdated references.
   - ⚠️ COST: a plan-refresh step is likely needed afterwards.
3. **Re-run `/bkit-plan` refresh after taking dev's version.** Option 2, then a refresh against the new `origin/dev`.
   - ✅ FIXES: both the conflict and the stale references.
   - ❌ does not FIX: nothing, but it is the slowest route.
   - ⚠️ COST: highest. It spends a plan run on a content-equivalent file.

## Recommended Path

Option 1. The two plans are the same apart from fresher references in the branch copy, so the branch version loses nothing and saves a refresh. After resolving, re-run `/bkit-build #803`. It will rebase cleanly if no other file conflicts. The log shows only the plan file was refused.

## Documentation Warnings

None

## Reference Docs

- `docs/plans/202611/803-close-codex-opencode-plan.md`
- `docs/plans/202611/logs/803-close-codex-opencode/rebase-resolve-log.md`
- `docs/plans/202611/logs/803-close-codex-opencode/status.jsonl` (last line: `workflow-failed`, build)
- `tmp/bkit-diff-803-close-codex-opencode.md`
- Relevant commits: `42c328f7a` and `32b5d12e2` (the plan on dev), `e8b8d35b8` (the plan refresh on the branch), `8bd3c6bfe` (the commit that conflicted)
