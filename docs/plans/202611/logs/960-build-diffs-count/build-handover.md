# Debug Abort Handover

## The Short Version

The build for #960 (a fix so the "feature's own changes" measure starts after unpushed local `dev` commits) is finished and checked, but the run cannot continue. When it resumed, git could not merge the branch onto the newer local `dev`, because another feature (#957) changed the same code in `tasks.ts`. The tool refuses to settle that kind of conflict itself, so a person has to.

## What's Actually Happening

- **Symptom:** the build stopped twice. First at step 10 (holistic verify, sub-step 9). Then, on resume, at Step 2 (worktree setup, sub-step 2).
- **Trigger (second stop):** `bkit branches rebase` replayed the branch's 31 commits onto local `dev` (`716f8f762`) and stopped at commit 9, `60526c538`. It refused `.bkit/core/engine/commands/workflow/tasks.ts` and aborted. The branch was restored untouched (HEAD `c35e73781`).
- **Proximate cause:** `716f8f762` (#957, "skip re-running checks when answers change nothing") adds a `--decision` flag and an import of `parseDecisionItems` to `tasks.ts`. Our branch removes `DIFF_BASE` from the same file. `dist/commands/workflow/tasks.js` conflicts the same way.
- **Root cause:** `bkit branches rebase` only auto-resolves append-only ledgers, lockfiles, generated registers and install records. Any real source conflict goes to a human, by design.
- **Earlier stop (23:43):** `bkit steps finish --step=build-plan-gaps-remediate-holistic` exited 11 twice. The check at `.bkit/core/engine/commands/workflow/steps.ts:1296-1319` refuses a code step that changes a planned test. The group 3 code step had changed `local-gate-audit.test.ts` ("build workflow and verify prompt name no origin/dev diff or test base") and `workflow-shape.test.ts` ("debug passes --base only when it runs in place on dev"). The owner's "Fix now" on TASK 7 (`build-decision-1-1.md`, Q1) contradicts those tests as first written. The check ignores a BLOCKED log. Commit `c35e73781` then aligned the plan and tests by hand.
- **Contributing:** local `dev` moved 3 commits (`e0325bd7c` to `716f8f762`) while the build ran. A trial merge of `dev` also conflicts in `.bkit/core/.bkit/workflows.md`, `.bkit/workflows.md`, `.bkit/instructions.md`, `.bkit/version` and `docs/testing.md`.

## Rot Signals

None

## Out-of-Scope Recommendations

None

## Attempt History

<!-- prettier-ignore -->
| Strategy | What was tried | Why it failed |
| --- | --- | --- |
| STANDARD | Build run: groups 1-3 implemented, verified per group (all PASS). Holistic verify attempt 3 gave CONCERNS (2 docs gaps). | Holistic remediate step could not finish: `steps finish` exit 11 on edited planned tests (`steps.ts:1296-1319`). Manual fix in `c35e73781`. |
| STANDARD | Resume: Step 2 rebase of the branch onto local `dev` `716f8f762`. | Content conflict in `tasks.ts` and `dist/commands/workflow/tasks.js`. The rebase was refused and aborted at commit 9 of 31. |

No diagnose attempts exist in `build-*.md` for this run; this handover is from the build logs and `status.jsonl`.

## Verified Resolutions (do not roll back)

- All three plan groups (tasks 1-9) verified: `build-plan-verify-1-2.md`, `-2-2.md`, `-3-2.md` PASS. Holistic 1-2 PASS.
- `featureBase` helper, including the TASK 8 rule (a local `dev` meeting point equal to `HEAD` falls back to the `origin/dev` meeting point).
- TASK 7: the build migration scan and debug's no-leak scan use `--base=origin/dev` (`{NOLEAK_BASE}` in debug). TASK 9: ship's two `context diff` lines use `--base=origin/dev`.
- `c35e73781` (plan, test and docs alignment) and the owner's decisions in `build-decision-1-1.md` (Q1 and Q2 both Fix now).
- Last `bkit tests changed` run PASS and `node dist/cli.js check` exit 0, both before the rebase attempt.
- Still open from holistic 1-3 (LOW, fixable): `docs/testing.md:821` and the Diff per reader row (`.bkit/core/.bkit/workflows.md:259`) are stale. Check whether `c35e73781` already covered them.

## Persistent Errors

- Step 2 sub-step 2, `bkit branches rebase`: `REFUSE .bkit/core/engine/commands/workflow/tasks.ts — not an append-only ledger, a recognised lockfile, a generated register, a doc embedding one or the install record`. Then `ABORTED — git rebase --abort restored the branch`, `outcome: refused`, exit 3. The log is at `docs/plans/202611/logs/960-build-diffs-count/rebase-resolve-log.md`.
- Step 10 sub-step 9: `differ from what the group's tests step recorded at its red: a code step never edits a planned test case`, exit 11 twice.
- Sequence: 23:15 holistic verify attempt 3 CONCERNS. 23:43 first failure (issue comment 6903359873). 00:10 rebase stops. 00:12 second failure (comment 6903733177).
- Ledger rows were added to `docs/failures.jsonl` for both: `960-build-code-step-edits-planned-tests-vs-owner-fix-now` and `960-build-rebase-onto-dev-conflict-tasks-ts`. No new deferrals; the two LOW challenge deferrals already exist.

## Recommended Next Steps

1. **Resolve the rebase by hand, then resume the build.** Rebase onto `dev`. In `tasks.ts` keep both sides: #957's `--decision` flag and `parseDecisionItems` import, plus our `DIFF_BASE` removal. Regenerate `dist/` with `pnpm build`. Resolve the docs conflicts, then run `bkit check`.
   - ✅ FIXES the blocker and keeps all 31 commits.
   - ❌ Does not fix the `steps.ts` refusal of edited planned tests.
   - ⚠️ COST: moderate. 7 conflicted files, and 31 commits to replay.
2. **Merge `dev` into the branch instead of rebasing.**
   - ✅ FIXES it with one round of conflicts, not up to 31.
   - ❌ `featureBase` then meets both meeting points. The plan's merge-tree edge case applies, so the diff base may include extra commits.
   - ⚠️ COST: lower effort, but a noisier history and diff.
3. **Ship #960 as-is, without the newer `dev`, and land the merge at ship time.**
   - ✅ FIXES nothing now.
   - ❌ Leaves the same conflict for ship, and ship refuses stale branches.
   - ⚠️ COST: lowest now, but it defers the problem.

## Recommended Path

Option 1. The conflict is small and limited to one real code overlap (`tasks.ts`). The other conflicts are docs and generated files. A rebase keeps the diff base clean, which is the point of #960. Do it by hand and rerun `pnpm build` and `bkit check`, then resume `/bkit-build 960`.

## Documentation Warnings

None

## Reference Docs

- `docs/plans/202611/960-build-diffs-count-plan.md`
- `docs/plans/202611/logs/960-build-diffs-count/build-decision-1-1.md`
- `docs/plans/202611/logs/960-build-diffs-count/build-plan-verify-holistic-1-3.md`
- `docs/plans/202611/logs/960-build-diffs-count/build-plan-gaps-remediate-holistic-1-3-log.md`
- `docs/plans/202611/logs/960-build-diffs-count/rebase-resolve-log.md`
- `docs/plans/202611/logs/960-build-diffs-count/status.jsonl`
- Issue #960 comments 6903359873 and 6903733177
- `docs/failures.jsonl`, the two `960-build-*` keys
- Comparable earlier stop: `951-build-rebase-plan-v2-reviewed-add-add-conflict` in `docs/failures.jsonl`
