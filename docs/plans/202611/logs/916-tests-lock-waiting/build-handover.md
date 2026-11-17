# Debug Abort Handover

## The Short Version

The build for issue #916 (making the machine lock serve waiting runs in the order they arrived) never started. Before any code was written, the step that brings this branch up to date with `dev` hit a file conflict it is not allowed to fix on its own, and stopped. No build code, tests or fixes exist yet, so there is nothing to debug and nothing to roll back.

## What's Actually Happening

- **Symptom:** `status.jsonl` ends with `{"type":"workflow-failed","workflow":"build","at":"2026-11-11T02:44:32Z"}`, straight after the plan's `workflow-done`. No `build-*.md` log files exist, and `tmp/bkit-diff-916-tests-lock-waiting.md` holds only ledger noise (`.bkit/stats.jsonl`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`), no code.
- **Trigger:** The build tried to rebase `feat/916-tests-lock-waiting` onto `origin/dev`. The branch is 7 commits ahead and 24 behind (merge base `f6914f3c9`).
- **Proximate cause:** `git rebase` stopped on an add/add conflict in `docs/plans/202611/logs/916-tests-lock-waiting/plan-v2-reviewed.md` while applying `7adf3b980` (apply-review). The auto-resolver refused it ("not an append-only ledger, a recognised lockfile, a generated register…"), routed to the Failure Path and ran `git rebase --abort`. The branch is back at its pre-rebase state (HEAD `ea18dd084`).
- **Root cause:** The plan was already published to `dev` as `efef85253` ("plan DONE"), and `dev` now holds its own copies of every file under `docs/plans/202611/logs/916-tests-lock-waiting/` plus the plan file. The feature branch still carries its own earlier commits that created the same files, so git sees the same paths added twice with different content. The resolver only knows how to merge ledgers and lockfiles, not plan logs.
- **Contributing factors:** Plan and build ran on the same branch; the plan was promoted to `dev` while the branch kept its own versions. The conflicting file differs between the two sides (the branch has the post-review text; `dev` has the promoted one). Which side is newer is not recorded in the log. Three of the branch's commits were dropped as "already upstream" during the attempt.

## Rot Signals

None

## Out-of-Scope Recommendations

None

## Attempt History

<!-- prettier-ignore -->
| Attempt | Strategy | What was tried | Why it failed |
| --- | --- | --- | --- |
| 1 | STANDARD | Rebase onto `origin/dev` at build start | add/add conflict in `plan-v2-reviewed.md`; resolver refused; rebase aborted. No build step ran. |

No diagnose attempts exist, so no strategy pivot was made.

## Verified Resolutions (do not roll back)

None. No code or test change was made. The plan itself (`docs/plans/202611/916-tests-lock-waiting-plan.md`, verdict CONCERNS) is unchanged and should be kept.

## Persistent Errors

- **Job:** build, rebase onto `origin/dev`.
- **File:** `docs/plans/202611/logs/916-tests-lock-waiting/plan-v2-reviewed.md`
- **Error:** `CONFLICT (add/add): Merge conflict in docs/plans/202611/logs/916-tests-lock-waiting/plan-v2-reviewed.md`, then `[bkit-rebase] REFUSE … routing to Failure Path`, then `[bkit-rebase] ABORTED — git rebase --abort restored the branch`.
- **Sequence:** rebase starts (9 commits) → 3 commits dropped as already upstream → `7adf3b980 apply-review` conflicts → refused → abort → `workflow-failed`.
- **Evidence:** `docs/plans/202611/logs/916-tests-lock-waiting/rebase-resolve-log.md` (untracked) and the last line of `status.jsonl` (modified, uncommitted).

## Recommended Next Steps

1. **Take the plan files from `dev`, then rebase (smallest).** Rebase while keeping `dev`'s copy of each file under `docs/plans/202611/logs/916-tests-lock-waiting/`, or skip the branch's plan-only commits. FIXES the blocker. DOES NOT FIX Open Question 1 (the plan still has no Acceptance Scenario). COST: a human must check that `dev`'s `plan-v2-reviewed.md` is the post-review text, so no review edits are lost.
2. **Start a fresh branch from `origin/dev`.** Cherry-pick nothing from the plan commits, since `dev` already has them. FIXES the conflict cleanly. DOES NOT FIX the open owner questions. COST: abandons the old branch name and its 7 commits (all plan material already upstream).
3. **Merge `dev` into the branch instead of rebasing.** FIXES the stop, with a hand-resolved merge commit. DOES NOT FIX the plan's gaps. COST: a merge commit in feature history and a manual choice for the one file.

## Recommended Path

Option 1. Every plan file is already on `dev`, so the branch's copies add nothing. Before the build restarts, the owner must also confirm the plan's three owner sections (Acceptance Scenario, Breaking Changes, Open Questions). Gate 1 in the plan requires those checkboxes ticked, and Open Question 1 has no default, so the build may stop there next. That is a plan gap, not part of this abort.

## Reference Docs

- Plan: `docs/plans/202611/916-tests-lock-waiting-plan.md` (verdict CONCERNS)
- Plan logs: `docs/plans/202611/logs/916-tests-lock-waiting/` (`status.jsonl`, `plan-summary.md`, `rebase-resolve-log.md`)
- Upstream plan commit: `efef85253` on `origin/dev`
- Issue: #916; related #724 (closed), #822
- CI runs / observability: none (the failure is local and git-only)
- Ledger row: `docs/failures.jsonl` key `916-build-rebase-add-add-conflict-plan-logs`
