# Brief: group 2 — Challenge round 1 findings (tests)

Plan: Pin the Derived Test Matrix header Implementation Plan

## Why and what

### Context & Goals

`bkit challenge merge` writes matrix rows as `Test description | Type | Target file | Task`, but the plan check accepts any header with a `Task` column, so merge exits 23 on other shapes. Pin the one header in the plan check and in the two plan-writing prompts; leave `challenge.ts` unchanged.

## Where it fits

- Group 1: Pin the matrix header — done
  - TASK 1: Make the plan check refuse any `Derived Test Matrix` header other than the template's — done
  - TASK 2: Name the exact matrix header in the plan-writing prompts and the issue shape — done
- Group 2: Challenge round 1 findings — this group
  - TASK 3: A plan whose matrix header omits the closing pipe (`| Test description | Type | Target file | Task`) passes plan-check with every matrix check switched off, so a row naming an undefined task (or no row for a test-bearing task) is no longer refused — open

## The work

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** A plan whose matrix header omits the closing pipe (`| Test description | Type | Target file | Task`) passes plan-check with every matrix check switched off, so a row naming an undefined task (or no row for a test-bearing task) is no longer refused
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests.ts:899` · **Round:** 1
  - **DONE WHEN:** `checkPlanText` compares the header cells as `tableCells` in `.bkit/core/engine/commands/workflow/plan-blocks.ts` reads them (`split("|").slice(1, -1)`, trimmed), or refuses a header whose own cell parse differs from `matrix.head`'s `tableCells` parse, so a header with no closing pipe gets one `matrix` problem naming `Test description | Type | Target file | Task`; the template header with closing pipes still passes. Verified by running `node dist/cli.js tests plan-check` on a scratch plan: with the header `| Test description | Type | Target file | Task` and a row `| case a | Unit | \`t0.test.ts\` | 7 |`, the problems list holds no `matrix` entry at all, while the same plan with the closing pipe reports "row maps to TASK 7, which the plan does not define". Cause: the new normaliser strips the edge pipes with `/^\||\|$/g` and keeps the last cell (`Task`), so the header compares equal, while `derivedTestMatrix` uses `tableCells`, which drops the last cell, so `taskColumn` is null and the `if (matrix.taskColumn !== null)` row and unmapped-task checks never run. Before this diff the same header was refused with "has no `Task` column".
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses a matrix header with no closing pipe` fails on the plan check exiting 0 with no `matrix` problem for the header `| Test description | Type | Target file | Task` (write the `matrix(MATRIX, ...)` output with the header line's trailing ` |` removed, `okTask(1)`, `okTask(2)`, expect code 1 and one `matrix` problem at `lineOf("plan.md", "| Test description")` whose message contains `EXPECTED_MATRIX_HEADER`)
<!-- bkit:task 3 end -->
