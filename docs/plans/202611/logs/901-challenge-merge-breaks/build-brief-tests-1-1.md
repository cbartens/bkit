# Brief: group 1 — Pin the matrix header (tests)

Plan: Pin the Derived Test Matrix header Implementation Plan

## Why and what

### Context & Goals

`bkit challenge merge` writes matrix rows as `Test description | Type | Target file | Task`, but the plan check accepts any header with a `Task` column, so merge exits 23 on other shapes. Pin the one header in the plan check and in the two plan-writing prompts; leave `challenge.ts` unchanged.

## Where it fits

- Group 1: Pin the matrix header — this group
  - TASK 1: Make the plan check refuse any `Derived Test Matrix` header other than the template's — open
  - TASK 2: Name the exact matrix header in the plan-writing prompts and the issue shape — done

## The work

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

### Planned tests that already exist

- TASK 1 `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses a matrix header with no Task column, naming the column to add` — exists at `.bkit/core/engine/commands/workflow/tests.test.ts:1602`; update that test in place: add expectations, never remove or loosen one
