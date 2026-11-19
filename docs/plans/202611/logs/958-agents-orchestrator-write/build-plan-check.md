Problems: 0
Existence: 0

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202611/958-agents-orchestrator-write-plan.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | Reports are checked, not rendered | 4 | 17 | 17.4 |
| 2 | The audit agent writes its findings once | 4 | 10 | 14.8 |
| 3 | Decision files — the orchestrator writes, the engine counts | 5 | 22 | 16.3 |
| 4 | The Failure Path file and the contract docs | 3 | 3 | 10.0 |
| 5 | Challenge round 1 findings | 5 | 10 | 6.7 |
| 6 | Challenge round 1 findings | 3 | 4 | 3.6 |
| 7 | Challenge round 2 findings | 2 | 3 | 3.4 |
| 8 | The engine's pause facts are status.jsonl rows, and one reader folds them | 5 | 24 | 15.9 |
| 9 | Every answer is a decision-answer row, and decisions check reads the counts row | 4 | 16 | 9.3 |
| 10 | The workflows record answers through the engine, the fixers ask the engine, and the docs name the rows | 2 | 2 | 8.0 |
| 11 | Planned tests the build took over | 5 | 5 | 3.8 |
| 12 | Planned tests the build took over | 2 | 2 | 1.7 |
| 13 | Holistic fixes | 2 | 0 | 2.1 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 4 | 2 |
| 2 | 1 | 9 | 1 |
| 3 | 1 | 2 | 2 |
| 4 | 1 | 2 | 1 |
| 5 | 2 | 3 | 1 |
| 6 | 2 | 3 | 2 |
| 7 | 2 | 2 | 2 |
| 8 | 2 | 2 | 1 |
| 9 | 3 | 9 | 3 |
| 10 | 3 | 3 | 1 |
| 11 | 3 | 6 | 1 |
| 12 | 3 | 3 | 1 |
| 13 | 3 | 1 | 1 |
| 14 | 4 | 2 | 1 |
| 15 | 4 | 1 | 1 |
| 16 | 4 | 0 | 0 |
| 17 | 5 | 2 | 1 |
| 18 | 5 | 3 | 2 |
| 19 | 5 | 1 | 1 |
| 20 | 5 | 2 | 1 |
| 21 | 5 | 2 | 1 |
| 22 | 6 | 1 | 1 |
| 23 | 6 | 1 | 1 |
| 24 | 6 | 2 | 2 |
| 25 | 7 | 1 | 1 |
| 26 | 7 | 2 | 1 |
| 27 | 8 | 1 | 1 |
| 28 | 8 | 7 | 1 |
| 29 | 8 | 10 | 1 |
| 30 | 8 | 3 | 3 |
| 31 | 8 | 3 | 3 |
| 32 | 9 | 4 | 1 |
| 33 | 9 | 6 | 1 |
| 34 | 9 | 4 | 1 |
| 35 | 9 | 2 | 1 |
| 36 | 10 | 2 | 1 |
| 37 | 10 | 0 | 0 |
| 38 | 11 | 1 | 1 |
| 39 | 11 | 1 | 1 |
| 40 | 11 | 1 | 1 |
| 41 | 11 | 1 | 1 |
| 42 | 11 | 1 | 1 |
| 43 | 12 | 1 | 1 |
| 44 | 12 | 1 | 1 |
| 45 | 13 | 0 | 0 |
| 46 | 13 | 0 | 0 |

## Problems

None.

## Existence (reported only)

None.

## Tests that change hands (reported only)

- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1283` TASK 28 takes over "bkit decisions counts > writes the attempt line, progress, base check and loop question into the engine file only" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 11 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1284` TASK 28 takes over "bkit decisions counts > recommends Decide when the last round changed no source" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 11 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1285` TASK 28 takes over "bkit decisions counts > recommends Try again when the last round made progress" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 11 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1286` TASK 28 takes over "bkit decisions counts > engine file recommends Stop when the base check is all and no questions are counted" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 11 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1287` TASK 28 takes over "bkit decisions counts > engine file recommends Decide when the base check is all and questions are counted" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 11 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1288` TASK 28 takes over "bkit decisions counts > writes Source changed and Gate into the engine file for a verify pause with no loop" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 11 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1309` TASK 29 takes over "decision file readers > decisionItems reads the loop question and progress from the engine file" in `.bkit/core/engine/commands/workflow/open-decision.test.ts` from TASK 9 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1310` TASK 29 takes over "decision file readers > the engine file's Decision line wins for one question" in `.bkit/core/engine/commands/workflow/open-decision.test.ts` from TASK 9 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1311` TASK 29 takes over "decision file readers > openDecision reads Gate and Source changed from the engine file's header" in `.bkit/core/engine/commands/workflow/open-decision.test.ts` from TASK 9 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1312` TASK 29 takes over "decision file readers > a pause whose loop answer is Try again reads DECIDED" in `.bkit/core/engine/commands/workflow/open-decision.test.ts` from TASK 9 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1313` TASK 29 takes over "gateRerun > re-runs a red-gate pause laid out in two files" in `.bkit/core/engine/commands/workflow/open-decision.test.ts` from TASK 9 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1314` TASK 29 takes over "skipProblem > reads Source changed and the loop answer from the engine file" in `.bkit/core/engine/commands/workflow/open-decision.test.ts` from TASK 9 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1315` TASK 29 takes over "decision file readers > an owner's Fix now in the decision file wins over an engine Accept (assumed)" in `.bkit/core/engine/commands/workflow/open-decision.test.ts` from TASK 18 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1316` TASK 29 takes over "decision file readers > an owner's answer in the decision file wins over an engine line applied without asking" in `.bkit/core/engine/commands/workflow/open-decision.test.ts` from TASK 18 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1333` TASK 30 takes over "bkit status resume gate re-run > re-runs the gate of a red-gate pause laid out in two files" in `.bkit/core/engine/commands/workflow/status.test.ts` from TASK 9 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1334` TASK 30 takes over "bkit workflows summary > counts an assumed item in an engine file once" in `.bkit/core/engine/commands/workflow/workflows.test.ts` from TASK 9 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1335` TASK 30 takes over "bkit decisions skip > keeps the re-run when the owner's Fix now beats an engine Accept (assumed)" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 18 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1371` TASK 32 takes over "bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 12 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1372` TASK 32 takes over "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 12 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1386` TASK 33 takes over "bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 12 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1387` TASK 33 takes over "bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 24 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1402` TASK 34 takes over "bkit decisions check > refuses Q1 when the engine file holds the loop question" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 10 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1403` TASK 34 takes over "bkit decisions check > accepts questions numbered from Q1 when the pause has no engine file" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 10 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1404` TASK 34 takes over "bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 25 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1477` TASK 38 takes over "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 32 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1486` TASK 39 takes over "bkit decisions check > refuses Q1 when the engine file holds the loop question" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 34 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1495` TASK 40 takes over "bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 32 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1504` TASK 41 takes over "bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 33 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1513` TASK 42 takes over "bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 33 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1528` TASK 43 takes over "bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 34 — the build records it failing again
- `docs/plans/202611/958-agents-orchestrator-write-plan.md:1537` TASK 44 takes over "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" in `.bkit/core/engine/commands/workflow/decisions.test.ts` from TASK 38 — the build records it failing again
