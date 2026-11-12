# Brief: group 3 — Challenge round 2 findings

Plan: Pin the Derived Test Matrix header Implementation Plan

## Why and what

### Context & Goals

`bkit challenge merge` writes matrix rows as `Test description | Type | Target file | Task`, but the plan check accepts any header with a `Task` column, so merge exits 23 on other shapes. Pin the one header in the plan check and in the two plan-writing prompts; leave `challenge.ts` unchanged.

## Where it fits

- Group 1: Pin the matrix header — done
  - TASK 1: Make the plan check refuse any `Derived Test Matrix` header other than the template's — done
  - TASK 2: Name the exact matrix header in the plan-writing prompts and the issue shape — done
- Group 2: Challenge round 1 findings — done
  - TASK 3: A plan whose matrix header omits the closing pipe (`| Test description | Type | Target file | Task`) passes plan-check with every matrix check switched off, so a row naming an undefined task (or no row for a test-bearing task) is no longer refused — done
- Group 3: Challenge round 2 findings — this group
  - TASK 4: A plan refused only for its matrix header gets a header-only fix ("Fix only what ... names; edit only those lines"), its rows keep the old cell order, and plan-check then reads a backticked target file such as `t1.test.ts` as `TASK 1`, so the misaligned matrix passes mapped to the wrong tasks, or fails a second time and sends the plan workflow to the Failure Path — open

## The work

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** A plan refused only for its matrix header gets a header-only fix ("Fix only what ... names; edit only those lines"), its rows keep the old cell order, and plan-check then reads a backticked target file such as `t1.test.ts` as `TASK 1`, so the misaligned matrix passes mapped to the wrong tasks, or fails a second time and sends the plan workflow to the Failure Path
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests.ts:908` · **Round:** 2
  - **DONE WHEN:** `checkPlanText` refuses, with one `matrix` problem on the row's line, every `Derived Test Matrix` row whose cell count is not 4 and every row whose `Task` cell holds anything other than task numbers (bare `N`, `TASK N`, separated by `,` or `and`), so a header fixed on its own while the rows keep the old order (an extra leading `#` cell, or `Task` before `Target file`) is refused on each row in the same report as before, never accepted. Cause: the new header problem is the only problem reported for the `#`-column and `Task`-not-last shapes (the diff's own tests assert exactly one `matrix` problem), the plan workflow (`bkit-plan.md` Steps 3, 6 and the owner-answers round) and build Step 4 tell the fixer to edit only the named lines, and `derivedTestMatrix` (`plan-blocks.ts:225`) takes every `\d+` run in the `Task` cell, with no check that the row has the header's cell count. Before this diff those shapes were accepted whole, so their rows always matched their own header; the header refusal is what makes a header-only rewrite the expected fix. The existing tests `plan-check refuses a matrix row mapped to two tasks` (`1, 2`) and the challenge-merge rows (`| name | tier | file | N |`) still pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses rows left in the old column order under the template header` fails on the plan check exiting 0 with no `matrix` problem when `matrix(MATRIX, ["case a", "Unit", "2", "`t1.test.ts`"], ["case b", "Unit", "1", "`t2.test.ts`"])` and `groupBlock(1, okTask(1), okTask(2))` map each row to a task through the digit in its target file (expect code 1 and a `matrix` problem at `lineOf("plan.md", "| case a")` and at `lineOf("plan.md", "| case b")`)
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses rows with an extra cell under the template header` fails on the plan check exiting 0 with no `matrix` problem when `matrix(MATRIX, ["1", "case a", "Unit", "`t1.test.ts`", "1"], ["2", "case b", "Unit", "`t2.test.ts`", "2"])` and `groupBlock(1, okTask(1), okTask(2))` are read with the target-file cell as the `Task` cell (expect code 1 and a `matrix` problem at `lineOf("plan.md", "| 1 | case a")` and at `lineOf("plan.md", "| 2 | case b")`)
<!-- bkit:task 4 end -->
