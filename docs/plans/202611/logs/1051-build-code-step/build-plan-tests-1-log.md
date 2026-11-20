Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 1: scriptCommand argv and exit 8 on hook refusal from .bkit/core/engine/shared/package-manager.ts:18
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/steps.test.ts` `a code step finish builds the declared bkit:generate output first, so a stale-output hook lets the commit through`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/steps.test.ts` `the gaps-remediate and holistic steps build the output too`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/steps.test.ts` `a repo with no bkit:generate script runs nothing and a stale-output hook still exits 8`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/steps.test.ts` `an empty bkit:generate script counts as undeclared`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/steps.test.ts` `a step that is not a code step never runs bkit:generate`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/steps.test.ts` `a failing bkit:generate exits 16 with nothing written and nothing committed`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/steps.test.ts` `a hook refusal about something else stays exit 8 after bkit:generate ran`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/steps.test.ts` `--commit=none does not run bkit:generate`
