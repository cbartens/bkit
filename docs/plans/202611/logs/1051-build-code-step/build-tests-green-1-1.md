Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1051-build-code-step-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a code step finish builds the declared bkit:generate output first, so a stale-output hook lets the commit through" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "the gaps-remediate and holistic steps build the output too" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a repo with no bkit:generate script runs nothing and a stale-output hook still exits 8" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "an empty bkit:generate script counts as undeclared" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a step that is not a code step never runs bkit:generate" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a failing bkit:generate exits 16 with nothing written and nothing committed" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a hook refusal about something else stays exit 8 after bkit:generate ran" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "--commit=none does not run bkit:generate" | red | passed |

## Gaps

None.
