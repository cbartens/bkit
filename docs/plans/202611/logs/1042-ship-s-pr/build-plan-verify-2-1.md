Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 5, 6, 7, 8
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

None

## Notes

- Mode `Group`, judged against `build-diff-2-1.md`. The plan's group 2 task blocks match the brief word for word. No `build-decision-*.md`, earlier verify report or remediation log exists for group 2.
- All seven `TEST FIRST` tests of tasks 4-8, plus the group 1 test `--flush refused by dev does not merge a leftover tip that changes code`, pass when run here (`vitest run` on `workflows.test.ts` and `branches.test.ts`: 8 passed). Each `Derived Test Matrix` row for tasks 4-8 is named in its task's `TEST FIRST`.
- Test-first audit `build-tests-green-2-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`. `Changed by a code step`: Task 1 `workflows.test.ts` "--flush refused by dev does not merge a leftover tip that changes code". The added lines only write the new FAILED record into `wt` (setup); its assertions are unchanged, so no gap. The owner answers it at the end of the build.
- TASK 4: `restoreBranchRows` skips any target that is not a regular file and, for a missing target, checks that the parent's real path is inside `dir`. An existing regular file gets no real-path check. That case cannot be reached from a git checkout, because git does not check out a tracked file under a symlinked directory, so it is not logged. The one gap is that `closePr`'s mode check passes when its `git diff --raw` read fails.
- TASK 5: the `isCrossRepository` filter is in `probePr`, so the other `head`-list callers (`branches.ts:1909`, `prs.ts:416`) now skip fork PRs too. That fits `docs/security.md` § CI Auto-Route Trust and is not a gap.
- TASK 7: the reuse path re-reads the PR by number up to 20 times, 500 ms apart (about 10 s), before calling `mergePr`. A head that never arrives still ends at the existing `close-pr-open` path.
- TASK 8: the leftover-tip check now uses `changedOutside` with `docs/plans/*/logs/{fid}/*` and the exported `UNION_PATHSPECS` (which has `:(exclude).bkit/issues.jsonl`). `minPushOutside` / `minPushPathspecs` are no longer imported. `dist/` is rebuilt in the same diff.
- `Documentation Updates` rows belong to group 1 (TASK 3), so they are outside this group's scope. Failure reasons reach stderr through the existing `ctx.log` / `{ failed }` path, which follows `docs/observability.md`.

## Identified Gaps Log

TASK 4: `.bkit/core/engine/commands/workflow/workflows.ts` `closePr` — the not-a-regular-file check fails open: `git(dir, ["diff", "--raw", "--no-renames", "--diff-filter=AMT", mergeBase, tip]) ?? ""` turns a failed read into "no symlinks or gitlinks", so the leftover tip is merged and pushed unchecked instead of refused; return `{ failed: "cannot diff origin's {branch} at {tip}: ..." }` when the read fails, as the `changedOutside` check just above does — Fixable: true
