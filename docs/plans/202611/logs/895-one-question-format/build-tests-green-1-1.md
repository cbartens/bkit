Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/895-one-question-format-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "parseDecisionItems reads one option per line and drops each effect" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "parseDecisionItems reads Recommended: none as a hard blocker" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "a lettered decision in a per-line file reads as the option its letter labels" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "apply --by=headless leaves a Recommended: none item for the owner" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "a per-line option whose text holds a slash or a middle dot stays one option" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "a file mixing both layouts parses each item in its own layout" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "apply --by=owner --confirm confirms an assumed item in a per-line file" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "buildSummary reads a lettered decision in a per-line file as Accept" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/challenge.test.ts` "acceptedLocations reads a lettered decision in a per-line file as Accept" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "compose writes each option on its own line with its effect" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "compose refuses an option without an effect" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "compose writes the default effect for a bare fixed option name" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "compose refuses an option name that contains a spaced dash" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "compose writes a Default if unanswered line for each question" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "compose writes Recommended: none for a hard blocker" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "compose ends with the shared reply line" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "compose offers one by one from three questions on, not for two" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "--loop writes an effect for each loop option" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "round-trips an item with effects through parseDecisionItems" | red | passed |

## Gaps

None.
