Verdict: PASS
Failures: 0
Fixable: false
Tasks: 45, 46
Loosened: none
Fingerprint: ba6971bfcc68e5f6b6453b8db1357b85931173150ac7a85d9698cfadfb86acf7
<!-- verdict:end -->

# Plan Verification

## Scope

Group 13

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Both tasks of group 13 are satisfied, judged against `build-diff-13-1.md` (commit `8390afd4e`).
- TASK 45: `.bkit/core/workflows/bkit-ship.md:95` now says to drop `--error-file` and `--stderr-file` while `{WORKTREE_PATH}` is not held, keeps the `;` separators and the rule to drop `--pr` when `{PR_NUMBER}` is empty. The snapshot `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt` and the five rendered copies carry the same line. `.bkit/instructions.md` is unchanged, and that is correct: the `workflow-error-file` clause (line 5714) lists `carriers: workflow all except bkit-auto, bkit-ship`, so ship's line is not a carrier and no clause edit is needed to keep them in step. `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0 and reports no change, so `pnpm instructions:sync` has nothing to write (not run here because it writes files). `instructions-coverage.test.ts`, `instructions.test.ts` and `render/trackers.test.ts` pass (3 files, 244 tests). `pnpm bkit:text:ceiling check` prints `ok — prompts 83837, workflows 57977`; the group commit touches no ceiling file.
- TASK 46: `.bkit/version` was re-recorded with the new hashes of the 15 rendered workflow copies. `pnpm tsx .bkit/core/engine/cli.ts check` exits 0 with `0 write(s) would occur` (no drift). `upgrade` was not re-run here because it writes files.
- Decision record `build-decision-2-4.md` Q2 and Q3 (Fix now) created Tasks 45 and 46; those answers were taken under the owner's away rule, not the owner's own words.
- Test-first audit `build-tests-green-13-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`. Both tasks are `TEST FIRST: n/a` (wording and a regenerated install record, no behaviour change).

## Identified Gaps Log

None
