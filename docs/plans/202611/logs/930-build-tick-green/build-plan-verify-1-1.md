Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1
Loosened: none
Fingerprint: 617451b21721026645fc6e49cd4b66de14816d96f4a289358bc734d88c831726
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

- TASK 1 satisfied. `gappedTasks` in `.bkit/core/engine/commands/workflow/tasks.ts:100-115` now runs `REPORT_GAP` only over the text between the `## Gaps` heading and the next `## ` heading; the `--json` branch is unchanged. `dist/commands/workflow/tasks.js` carries the same change.
- The heading the slice keys on matches the writer: `bkit tests green` emits `## Gaps` exactly (`.bkit/core/engine/commands/workflow/tests.ts:1449`, `:1494`) and `## Already landed` after it (`:1507`).
- Both `Derived Test Matrix` rows are covered by the task's `TEST FIRST` tests: `ticks a task listed only under Updated tests` and `ticks a task listed only under Already landed and skips a Gaps task` in `.bkit/core/engine/commands/workflow/tasks.test.ts`. `pnpm exec vitest run .bkit/core/engine/commands/workflow/tasks.test.ts` passed 22 of 22, so no existing tick test broke.
- The tests file is unchanged between the tests commit `c60cfe472` and HEAD; the code step touched only `tasks.ts` and `dist/`.
- Test-first audit `build-tests-green-1-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`; both tests red then green. No `Updated tests` or `Already landed` section, so nothing to decide.
- Unit tier fits `docs/testing.md` § Which tier does a behaviour need? (pure parser, no I/O boundary). No logging change, so `docs/observability.md` adds no requirement. The plan has no `Documentation Updates` section, and no doc describes the old whole-report match.
- No decision records, prior verify reports or remediation logs exist for this group.

## Identified Gaps Log

None
