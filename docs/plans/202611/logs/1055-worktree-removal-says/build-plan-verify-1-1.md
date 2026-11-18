Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2
Loosened: none
Fingerprint: 09b9b411b3f18520679e0abe56dd0503993c50684b87c408cce537721acb42c9
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 1: `devHeldEntry` sits beside `notOnDev` in `.bkit/core/engine/commands/workflow/worktrees.ts:805`, runs `git rev-list --full-history {base}..origin/dev -- {file}` through `cleanupRead`, compares each commit's entry with `treeEntry`, and throws on a failed `rev-list` into the existing catch, so the branch is preserved. It runs before the `.jsonl` line check. `notOnDev` stays the only landed comparison; `branches.ts` and the two `removeWorktree` calls (now lines 1046 and 1058) are unchanged in the group diff. `dist/commands/workflow/worktrees.js` was rebuilt to match.
- TASK 1 tests: `vitest run branches.test.ts -t "shared landed comparison"` gave 5 passed (the 3 new cases plus the existing executable-bit and symlink cases); `vitest run worktrees.test.ts -t "later dev commit"` gave 2 passed. `names only the file whose branch version never reached dev` shows that `notOnDev` still names a file no `origin/dev` commit holds.
- TASK 2: `docs/testing.md:964` and `:966` name the new cases, and `docs/observability.md:221` states the new rule; `grep -n "later"` hits all three lines.
- Test-first audit `build-tests-green-1-1.md`: Enforced true, 0 gaps, no Taken over, Unproven, Changed by a code step, Updated tests or Already landed sections.
- No decision records and no earlier verify reports for group 1. The brief has no Documentation Updates table; TASK 2 covers the doc rows. The `.bkit/friction.jsonl` row in the diff is the orchestrator's, outside the tasks.
- Errors follow `docs/observability.md`: the new failure path surfaces as the existing `carries work origin/dev does not — preserved` diagnostic with the thrown message.

## Identified Gaps Log

None
