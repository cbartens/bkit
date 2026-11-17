Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

WROTE — TASK 1: `.bkit/core/engine/commands/workflow/decisions.test.ts` `parseDecisionItems reads one option per line and drops each effect`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/decisions.test.ts` `parseDecisionItems reads Recommended: none as a hard blocker`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/decisions.test.ts` `a lettered decision in a per-line file reads as the option its letter labels`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/decisions.test.ts` `apply --by=headless leaves a Recommended: none item for the owner`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/decisions.test.ts` `a per-line option whose text holds a slash or a middle dot stays one option`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/decisions.test.ts` `a file mixing both layouts parses each item in its own layout`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/decisions.test.ts` `apply --by=owner --confirm confirms an assumed item in a per-line file`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/summary.test.ts` `buildSummary reads a lettered decision in a per-line file as Accept`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/challenge.test.ts` `acceptedLocations reads a lettered decision in a per-line file as Accept`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose writes each option on its own line with its effect`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose refuses an option without an effect`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose writes the default effect for a bare fixed option name`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose refuses an option name that contains a spaced dash`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose writes a Default if unanswered line for each question`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose writes Recommended: none for a hard blocker`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose ends with the shared reply line`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose offers one by one from three questions on, not for two`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/decisions.test.ts` `--loop writes an effect for each loop option`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/decisions.test.ts` `round-trips an item with effects through parseDecisionItems`
SOURCE — TASK 1: option/Recommended line shapes from .bkit/core/engine/commands/workflow/decisions.ts:103-132
SOURCE — TASK 2: default effects and fixture shapes from build-brief-tests-1-1.md TASK 2 TEST FIRST lines (decisions.ts has no effect text yet)
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/decisions.test.ts` `apply --by=owner --confirm confirms an assumed item in a per-line file`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose refuses an option name that contains a spaced dash`
