Enforced: true
Verdict: null
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/912-debug-loop-question-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > --loop on an unknown trend recommends Try again without claiming progress" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > --loop on an unknown trend says the limit is used up" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > --loop states the engine's trendLine in Q1" | red | passed |
| 8 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "debug Loop Question states the engine's trend line, never a fixed claim" | red | passed |
| 8 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "debug Loop Question at the used-up soak limit states the trend line" | red | passed |

## Gaps

- Task 7 `delete-still-referenced` — DELETE `trendLine` in `.bkit/core/engine/commands/workflow/decisions.ts` is still referenced: `.agents/plugins/bkit/skills/bkit-debug/SKILL.md:117`, `.agents/skills/bkit-debug/SKILL.md:117`, `.bkit/core/.bkit/workflows.md:1033`, `.bkit/core/engine/audits/workflows/workflow-shape.test.ts:2039`, `.bkit/core/engine/commands/workflow/counters.test.ts:1010`, and 48 more — Fixable: null — log: TASK 7: delete-still-referenced — Fixable: null
