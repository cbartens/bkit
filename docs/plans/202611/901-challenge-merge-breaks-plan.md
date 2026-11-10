# Pin the Derived Test Matrix header Implementation Plan

## Context & Goals

`bkit challenge merge` writes matrix rows as `Test description | Type | Target file | Task`, but the plan check accepts any header with a `Task` column, so merge exits 23 on other shapes. Pin the one header in the plan check and in the two plan-writing prompts; leave `challenge.ts` unchanged.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | Searches run | Decision | File | Reason |
| --- | --- | --- | --- | --- |
| Header check for the matrix | `rg -n "matrix" tests.ts`; read `derivedTestMatrix` in `plan-blocks.ts`, which already parses `head` and `taskColumn` | EXTEND | `.bkit/core/engine/commands/workflow/tests.ts` | `checkPlanText` already emits `matrix` problems |
| Matrix shape wording in prompts | `rg -n "Matrix shape\|Derived Test Matrix" .bkit/core/prompts` | EXTEND | `.bkit/core/prompts/bkit-build-plan-convert.md` | the rule lives there |
| Same, plan generation | same search | EXTEND | `.bkit/core/prompts/bkit-plan-generate.md` | the rule lives there |
| Issue-shape matrix header | `rg -n "Derived Test Matrix" .bkit/trackers.md` | EXTEND | `.bkit/trackers.md` | line 142 names a 3-column header |

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Pin the matrix header

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Make the plan check refuse any `Derived Test Matrix` header other than the template's
  - **UPDATE:** `checkPlanText` in `.bkit/core/engine/commands/workflow/tests.ts`: report one `matrix` problem naming the expected header `Test description | Type | Target file | Task` when the header differs (case and cell-edge spaces ignored); a missing `Task` column is covered by the same single problem
  - **READ:** `derivedTestMatrix` in `.bkit/core/engine/commands/workflow/plan-blocks.ts`: `head` and `taskColumn` already parsed
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.test.ts`: change the existing no-Task-column test's expectation only if its message check needs it; add the new header tests
  - **DONE WHEN:** the template header passes; an extra leading `#` column, `Task` not last, `Behaviour | Tier` synonym names, and no `Task` column each give a `matrix` problem whose message contains the expected header; the full `tests.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses a matrix header with an extra leading # column` fails on the plan check exiting 0 instead of reporting a matrix problem
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses a matrix header with Task not last` fails on the plan check exiting 0 instead of reporting a matrix problem
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses synonym matrix column names` fails on the plan check exiting 0 instead of reporting a matrix problem
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses a matrix header with no Task column, naming the column to add` fails on the message lacking "Test description | Type | Target file | Task"
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check accepts the template matrix header in any letter case` fails on a case-different header being refused

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Name the exact matrix header in the plan-writing prompts and the issue shape
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-generate.md`: the Scenario detail bullet names the header `Test description | Type | Target file | Task`, in that order, with no extra columns
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-convert.md`: the Matrix shape bullet names the same header and bans extra columns
  - **UPDATE:** `.bkit/trackers.md`: the change-shape Derived Test Matrix line says the plan form is the four columns with `Task` last
  - **DEPENDS ON:** 1
  - **DONE WHEN:** all three files name the exact four-column header and forbid extra columns; `rg -n "Task. column beside"` no longer matches the old wording in the convert prompt
  - **TEST FIRST:** n/a — prompt and doc wording only, no behaviour change

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->
