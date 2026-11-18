Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2
Loosened: none
Fingerprint: 3d4517f1c6274cd36cdd9cb3ef774559ea2555e5251bda0211edc78f9c2d54a9
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

1 of 1 (the plan has 1 group).

## Integration Gaps

0. The plan has one group. TASK 2's doc wording (`docs/testing.md:964`, `:966`, `docs/observability.md:221`) describes the behaviour TASK 1 built in `devHeldEntry` and the tests it added. Both callers of `notOnDev` (`removeWorktree` in `worktrees.ts` and `branches land` in `branches.ts`) are unchanged and get the new rule through the shared helper; `branches.ts` has no diff since the merge base.

## Previously Attempted

`docs/plans/202611/logs/1055-worktree-removal-says/build-plan-verify-1-1.md` (Group 1, attempt 1): PASS, tasks 1 and 2.

## Notes

- TASK 1: `devHeldEntry` (`.bkit/core/engine/commands/workflow/worktrees.ts:805`) runs `git rev-list --full-history {base}..origin/dev -- {file}` through `cleanupRead` and compares each commit's entry with `treeEntry`; a deletion matches a commit where the entry is absent (`null`). It runs before the `.jsonl` line check, and a failed `rev-list` throws into the existing catch in `notOnDev`, so the branch is preserved. `notOnDev` remains the only landed comparison. `dist/commands/workflow/worktrees.js` carries the same change.
- TASK 1 tests, re-run in this step: `vitest run branches.test.ts -t "shared landed comparison"` gave 5 passed (the 3 new cases plus the existing executable-bit and symlink cases); `vitest run worktrees.test.ts -t "later dev commit"` gave 2 passed. `names only the file whose branch version never reached dev` shows that `notOnDev` still names a file no `origin/dev` commit holds.
- TASK 2: `grep -n "later"` hits `docs/testing.md:964`, `:966` and `docs/observability.md:221` with the new wording.
- Derived Test Matrix: all 5 rows map to TASK 1's TEST FIRST and DONE WHEN, and all 5 tests exist and pass.
- Test-first audit `build-tests-green-1-1.md`: Enforced true, Verdict PASS, 0 gaps, 0 unproven; no Taken over, Changed by a code step, Updated tests or Already landed entries.
- No decision records and no gaps-remediate logs exist for this run. The plan has no Documentation Updates table; TASK 2 covers the doc rows from Documentation Consultation.
- Errors follow `docs/observability.md`: the new failure path surfaces through the existing `carries work origin/dev does not — preserved` diagnostic with the thrown message.
- The two `.bkit/friction.jsonl` rows in the diff are the orchestrator's, outside the tasks. The full suite was not run here, per this run's limits; the holistic gate covers it.

## Identified Gaps Log

None
