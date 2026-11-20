Verdict: PASS
Failures: 0
Fixable: false
Tasks: 4, 5, 6, 7, 8
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-2-1.md`: `CONCERNS`, 1 gap (TASK 4: `closePr`'s not-a-regular-file check failed open when `git diff --raw` failed).
- `build-plan-gaps-remediate-2-1-log.md`: `PASS`, fixed 1. Confirmed in `build-diff-2-2.md` and at `.bkit/core/engine/commands/workflow/workflows.ts:1713`: a failed read now returns `{ failed: "cannot diff origin's {branch} at {tip}: ..." }`. `dist/commands/workflow/workflows.js:1360` carries the same check.

## Notes

- Mode `Group`, judged against `build-diff-2-2.md`. Brief `build-brief-2-1.md` holds tasks 4-8. Its `Deviations` section was followed: only allowed files changed (`workflows.ts`, `workflows.test.ts`, `branches.ts`, `branches.test.ts`, `prs.ts`, `ledgers.ts` export, `dist/`, plus graph-generated `DETAILS.md` / `docs/capabilities.md` and challenge deferral rows). No `build-decision-*.md` exists.
- All seven `TEST FIRST` tests of tasks 4-8, plus the group 1 test `--flush refused by dev does not merge a leftover tip that changes code`, pass here (`vitest run` on `workflows.test.ts` and `branches.test.ts` filtered by name: 8 passed).
- Test-first audit `build-tests-green-2-2.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`, no `Taken over`, `Updated tests` or `Already landed` sections. `Changed by a code step`: Task 1 `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that changes code", reason: the test never wrote the ship FAILED record into `wt`. The added lines only write that record (setup), and the assertions are unchanged, so it is no gap. The owner answers it at the end of the build.
- TASK 4: `closePr` refuses a tip whose `mergeBase..tip` raw diff has mode `120000` or `160000`, and now also refuses when that read fails. `restoreBranchRows` `lstat`s each target, skips anything that is not a regular file, and checks that a missing target's real parent is inside `dir`.
- TASK 5: `probePr` with `state: "open"` skips `isCrossRepository: true` PRs, and `closePr` reuses a PR only when its `headRefName` is `branch`.
- TASK 6: the merge commit is written with `commit -m subject`, so the pushed head keeps `[skip ci]`.
- TASK 7: the reuse path re-reads the PR by number up to 20 times, 500 ms apart, before `mergePr`. A head that never arrives still reaches `mergePr`, which fails and ends at `close-pr-open`.
- TASK 8: the leftover-tip check uses `changedOutside` with `docs/plans/*/logs/{fid}/*` and the exported `UNION_PATHSPECS` (including `:(exclude).bkit/issues.jsonl`); `minPushOutside` / `minPushPathspecs` are no longer imported. The `.bkit/issues.jsonl` test asserts the remote branch stays at the leftover tip and `dev` lacks the planted row, rather than the `TEST FIRST` wording's "`ship-failed/{FID}` lacks the row". That wording cannot hold, because the leftover tip itself carries the row. The test checks what `DONE WHEN` asks (exit 10, branch unchanged), so it is no gap.
- `Documentation Updates` rows belong to group 1 (TASK 3), outside this group. Failure reasons reach stderr through the existing `ctx.log` / `{ failed }` path, which follows `docs/observability.md`.

## Identified Gaps Log

None
