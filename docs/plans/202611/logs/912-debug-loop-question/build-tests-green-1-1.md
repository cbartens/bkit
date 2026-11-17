Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/912-debug-loop-question-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/counters.test.ts` "loopTrend > a missing count is unknown, not stuck" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > a round with no count reports unknown and no recommendation" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > --loop=verify with an uncounted group gate reads unknown" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > does not compare a CI round with a local gate round" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > compares the last round with the earliest round of the same scope" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > reports each round's scope" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > judges codeChanged between the compared same-scope rounds" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > trendLine names an unknown count instead of claiming no fewer failures" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > trendLine says the rounds ran different tests" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > trendLine for a fall without a code change says no source code changed" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > trendLine for the same count states both counts" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > trendLine prefers different scopes over a missing count" | red | passed |

## Gaps

None.
