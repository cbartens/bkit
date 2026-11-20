Problems: 0
Existence: 0

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202611/1051-build-code-step-plan.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | A code step's finish makes the generated output current | 2 | 8 | 6.9 |
| 2 | Challenge round 1 findings | 2 | 8 | 6.8 |
| 3 | Challenge round 2 findings | 3 | 8 | 11.4 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 8 | 1 |
| 2 | 1 | 0 | 0 |
| 3 | 2 | 4 | 1 |
| 4 | 2 | 4 | 1 |
| 5 | 3 | 6 | 1 |
| 6 | 3 | 1 | 1 |
| 7 | 3 | 1 | 1 |

## Problems

None.

## Existence (reported only)

None.

## Planned test names already in use (reported only)

- `docs/plans/202611/1051-build-code-step-plan.md:179` TASK 5: `.bkit/core/engine/commands/workflow/steps.test.ts` already holds a test named "in bkit's own repo a key the code agent's own bkit:generate run added rides the step commit" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/1051-build-code-step-plan.md:179` TASK 5: `.bkit/core/engine/commands/workflow/steps.test.ts` already holds a test named "in bkit's own repo a generated added key left by a finish the hook refused rides the re-run" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/1051-build-code-step-plan.md:179` TASK 5: `.bkit/core/engine/commands/workflow/steps.test.ts` already holds a test named "in bkit's own repo a hand-added bkit.workflows key that bkit:generate does not produce exits 13 and leaves package.json as the step wrote it" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/1051-build-code-step-plan.md:179` TASK 5: `.bkit/core/engine/commands/workflow/steps.test.ts` already holds a test named "in bkit's own repo a seeded bkit.workflows key with a hand-changed value exits 13 and keeps the hand value" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/1051-build-code-step-plan.md:179` TASK 5: `.bkit/core/engine/commands/workflow/steps.test.ts` already holds a test named "outside bkit's own repo a bkit.workflows difference before bkit:generate exits 13 and finish never rewrites package.json" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/1051-build-code-step-plan.md:179` TASK 5: `.bkit/core/engine/commands/workflow/steps.test.ts` already holds a test named "in bkit's own repo a bkit:generate that fails after a bkit.workflows difference restores the step's package.json and exits 13" — name the update to it in TEST FIRST, or give the new test a new name

## Tests that change hands (reported only)

- `docs/plans/202611/1051-build-code-step-plan.md:149` TASK 3 takes over "a failing bkit:generate exits 16 with nothing written and nothing committed" in `.bkit/core/engine/commands/workflow/steps.test.ts` from TASK 1 — the build records it failing again
