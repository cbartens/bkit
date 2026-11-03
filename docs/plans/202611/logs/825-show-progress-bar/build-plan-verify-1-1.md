Verdict: CONCERNS
Failures: 3
Fixable: true
Tasks: 1
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1, attempt 1. Tasks 1 and 2 were checked against the supplied group diff and the current worktree.

## Groups Verified

None.

## Integration Gaps

None. This is a group verification, not the holistic review.

## Previously Attempted

None.

## Notes

Task 1 is satisfied. The pure calculation uses the canonical step table, distinct numbered positions, current group order, the planned build formula, ten bar cells and the nonfinal 99% cap. Task 2 implements the shared completion output, current plan reads, validated numeric positions and wrapper metadata, but the three gaps below keep it open.

The focused Unit and Integration command `BKIT_TEST_REPORT=tmp/verify-progress-tests.xml pnpm bkit:test:file .bkit/core/engine/commands/workflow/step-table.test.ts .bkit/core/engine/commands/workflow/steps.test.ts .bkit/core/engine/commands/workflow/progress.integration.test.ts` ran 159 tests: 158 passed and one failed. The Unit files passed 40 and 113 tests; Integration passed five of six. The only planned-test failure is the supplied audit's `not-green` gap. No test was loosened, and the audit lists no unproven tests. The full suite is not claimed green. The implementation log also records the same failure in changed-file checks, successful generation, and a built-CLI scratch-consumer check.

The failing malformed-status fixture sets `expectedJournals` to zero at `progress.integration.test.ts:173`, then checks it at line 560. Existing `commands/lib.ts:369-379` skips malformed lines when locating the active run, and lines 478-486 append its ordinary `engine-call` row before command validation. The plan explicitly requires preserving that journal evidence. The completion row and commit remain unchanged in the failing case. The audit's non-null `Fixable: true` is retained as the verifier contract requires; changing journaling to satisfy this assertion would contradict the plan, while changing this planned test is outside the implementation agent's permission. The caller must resolve that test-contract conflict without weakening normal journaling. The failed assertion also stops that integration case before its unreadable-status and refused-commit sections.

Built-CLI probes in `tmp/verify-progress-Qexv6E` confirmed the two additional gaps below. No source, test, or plan was changed. Generated CLI flags and source/dist implementations are present. The remaining workflow narration and documentation work belongs to Group 2 and is not a missing deliverable of this group.

## Identified Gaps Log

TASK 2: `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress excludes noncompletions` — not-green — Fixable: true

TASK 2: `.bkit/core/engine/commands/workflow/steps.ts` `stepProgress` and `.bkit/core/engine/commands/workflow/counters.ts` `savedPointLimit` — Debug soak progress uses the ordinary per-run `attempt` instead of the workflow's cross-run `soakAttempt`, and savedPointLimit always counts grants in the current run. The real debug Step 8 writes `soakAttempt` with `--count-field=soakAttempt=debug-failure-soak:next:all`, and its loop route/grant uses `--all-runs`. A built-CLI completion with `attempt=1`, `soakAttempt=4`, a frozen allowance of 3 and one grant in the previous debug run printed `Progress: ███████░░░ 73% · Step 8/11 Failure Remediate Soak`, omitting the fourth attempt and its six-attempt allowance. Use the existing soak counter identity and grant scope for this progress context; preserve ordinary per-run attempt behavior elsewhere — Fixable: true

TASK 2: `.bkit/core/engine/commands/workflow/steps.ts` `steps gate` — Explicit numeric rendering fabricates completion when the command has no status or feature context. Running `node dist/cli.js steps gate --workflow=build --step=unrecognized-bookkeeping --progress-number=16 --json` in a scratch repo returned exit 0, `checks: []` and `Progress: ██████████ 100% · Step 16/16 Close Workflow & Create PR`. The fallback constructs a status path from empty month/FID values, and stepProgress accepts the number without evidence of a recognized completed step. Require sufficient target-run/completion context before emitting, while retaining the supported Step 1 lock/FID/month path and rowless ship positions 3 and 9; do not add domain rows — Fixable: true
