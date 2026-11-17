Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/914-build-planned-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 8 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses a code step that writes a planned test whose red recorded its file missing, exit 11" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/steps.test.ts` "the refusal of a restored BLOCKED change names the recorded change as the lines to put back" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/steps.test.ts` "the refusal of a re-change says the logged reason is already recorded" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/steps.test.ts` "records the baseline blob on a BLOCKED-named change that only adds lines" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green gives each changed test the line diff of its own lines since its baseline and whether it is additive" | red | passed |
| 11 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "a changed-test item shows the test's line diff since its baseline" | red | passed |
| 11 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the code prompts say a BLOCKED line lets through only a change that adds lines" | red | passed |

## Gaps

None.
