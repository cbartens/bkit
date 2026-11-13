Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 3: nextStep output and comment lines from .bkit/core/engine/commands/workflow/workflows.ts (failVerb) and issues.ts buildComment lines
SOURCE — TASK 4: ship step headings, Route arms and Failure Path steps from .bkit/core/workflows/bkit-ship.md:91-124,325-346,689-751,808-846,873-880
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep`
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail refuses a multi-line or non-/bkit- --next-step before any write`
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail treats an empty --next-step as absent`
WROTE — TASK 4: `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 10 holds /bkit-debug {FID} as NEXT_STEP on every red-run route to the Failure Path or the Merge Question, and on no other`
WROTE — TASK 4: `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 2 holds NEXT_STEP on a failed check in the CI wait of a PR ship opened`
WROTE — TASK 4: `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `the Merge Question's Stop arm names NEXT_STEP when held and Try again clears it`
WROTE — TASK 4: `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Close Workflow routes a red squash capstone to the Failure Path holding NEXT_STEP`
WROTE — TASK 4: `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `the Failure Path passes --next-step only when NEXT_STEP is held and ends the final message with it`
WROTE — TASK 4: `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `the Failure Path re-runs workflows fail without --next-step on exit 2`
