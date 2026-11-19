Enforced: true
Verdict: null
Gaps: 4
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/958-agents-orchestrator-write-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 9 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > decisionItems reads the loop question and progress from the engine file" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > the engine file's Decision line wins for one question" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > decisionItems reads an old single-file layout like parseDecisionItems" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > openDecision reads Gate and Source changed from the engine file's header" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > a pause whose loop answer is Try again reads DECIDED" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "gateRerun > re-runs a red-gate pause laid out in two files" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "skipProblem > reads Source changed and the loop answer from the engine file" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/status.test.ts` "bkit status resume gate re-run > re-runs the gate of a red-gate pause laid out in two files" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows summary > counts an assumed item in an engine file once" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a question without lettered options, naming it" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses Q1 when the engine file holds the loop question" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > accepts questions numbered from Q1 when the pause has no engine file" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > writes the attempt line, progress, base check and loop question into the engine file only" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > recommends Decide when the last round changed no source" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > recommends Try again when the last round made progress" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > engine file recommends Stop when the base check is all and no questions are counted" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > engine file recommends Decide when the base check is all and questions are counted" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > writes Source changed and Gate into the engine file for a verify pause with no loop" | red | passed |
| 12 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged" | red | passed |
| 12 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" | red | passed |
| 12 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1" | red | passed |
| 13 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "engine calls > no workflow names decision-items.json or decisions compose" | red | passed |

## Gaps

- Task 13 `delete-still-referenced` — DELETE `compose` in `.bkit/core/engine/commands/workflow/decisions.ts` is still referenced: `.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md:67`, `.agents/plugins/bkit/agents/bkit-build-plan-tasks.md:73`, `.agents/plugins/bkit/agents/bkit-build-plan-tests.md:57`, `.agents/rules.md:136`, `.bkit/cloud.md:662`, and 446 more — Fixable: null — log: TASK 13: delete-still-referenced — Fixable: null
- Task 13 `delete-still-referenced` — DELETE `composeItems` in `.bkit/core/engine/commands/workflow/decisions.ts` is still referenced: `docs/audits/202611/deferrals-20261116T065554Z.md:310`, `docs/plans/202610/logs/703-standardise-question-option/build-diff-1-1.md:212`, `docs/plans/202610/logs/703-standardise-question-option/build-diff-1-1.md:304` — Fixable: null — log: TASK 13: delete-still-referenced — Fixable: null
- Task 13 `delete-still-referenced` — DELETE `itemLines` in `.bkit/core/engine/commands/workflow/decisions.ts` is still referenced: `.bkit/core/engine/shared/text.ts:245`, `.bkit/core/engine/shared/text.ts:254`, `.bkit/core/engine/shared/text.ts:259`, `dist/shared/text.js:223`, `dist/shared/text.js:231`, and 21 more — Fixable: null — log: TASK 13: delete-still-referenced — Fixable: null
- Task 13 `delete-still-referenced` — DELETE `.bkit/core/engine/commands/workflow/decisions.test.ts`: the file still exists — Fixable: null — log: TASK 13: delete-still-referenced — Fixable: null
