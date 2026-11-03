
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/plan-blocks.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

 ❯ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (28 tests | 2 failed) 8ms
   ✓ parsePlanBlocks (23)
     ✓ DEPENDS ON reads bare task numbers, as the plan template writes them 2ms
     ✓ parses groups and tasks in order 1ms
     ✓ rejects a task outside a group 0ms
     ✓ rejects mismatched start and end markers 0ms
     ✓ rejects a duplicate task number across groups 0ms
     ✓ flags task-like text outside a block 0ms
     ✓ ignores markers inside fenced code 0ms
     ✓ parses the file-only form 0ms
     ✓ splits TEST FIRST into one test per sub-bullet 0ms
     ✓ rejects groups out of file order and tasks out of order within a group 0ms
     ✓ accepts a task numbered above the plan's highest inside an earlier group 0ms
     ✓ rejects TASK 0 and GROUP 0 0ms
     ✓ rejects a repeated single-valued field and keeps the first 0ms
     ✓ rejects a second task line inside a task block 0ms
     ✓ reads a CRLF plan like an LF one 0ms
     ✓ DEPENDS ON none followed by anything is no dependency 0ms
     ✓ DEPENDS ON GROUP 1 tasks never reads a group number as a task 0ms
     ✓ DEPENDS ON GROUP 1 tasks and 2 never reads a group number as a task 0ms
     ✓ DEPENDS ON groups 1, 2 and 3 never reads a group number as a task 0ms
     ✓ DEPENDS ON TASK 2 of GROUP 1 never reads a group number as a task 0ms
     ✓ a fence line with an info string never closes an open fence 0ms
     ✓ reports a code fence that never closes 0ms
     ✓ has no file-system access 0ms
   ✓ reuseInventory (2)
     ✓ reads the table under the Reuse Inventory heading, File paths and Decision 0ms
     ✓ never reads a table from a later section 0ms
   × outOfScope returns the plan's Out of Scope rows 3ms
   × plan-blocks readers stop at the next heading of the same or a higher level 0ms
   ✓ derivedTestMatrix returns a null column index when the header has no Task column 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/plan-blocks.test.ts > outOfScope returns the plan's Out of Scope rows
AssertionError: expected [] to deeply equal [ { …(3) }, { …(3) } ]

- Expected
+ Received

- [
-   {
-     "cells": [
-       "Design reviewers",
-       "no measurements",
-       "`docs/deferrals.jsonl` key `701-design-reviewer-audit`",
-     ],
-     "line": "| Design reviewers | no measurements | `docs/deferrals.jsonl` key `701-design-reviewer-audit` |",
-     "number": 7,
-   },
-   {
-     "cells": [
-       "A second item",
-       "declared",
-       "stays in a prompt",
-     ],
-     "line": "| A second item | declared | stays in a prompt |",
-     "number": 8,
-   },
- ]
+ []

 ❯ .bkit/core/engine/commands/workflow/plan-blocks.test.ts:392:28
    390|     "| x | y | z |",
    391|   ].join("\n");
    392|   expect(outOfScope(text)).toEqual([
       |                            ^
    393|     {
    394|       line: "| Design reviewers | no measurements | `docs/deferrals.js…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/plan-blocks.test.ts > plan-blocks readers stop at the next heading of the same or a higher level
AssertionError: expected [] to be null

- Expected:
null

+ Received:
[]

 ❯ .bkit/core/engine/commands/workflow/plan-blocks.test.ts:420:29
    418|     "| a table under a later heading of the same level | x | y |",
    419|   ].join("\n");
    420|   expect(outOfScope(later)).toBeNull();
       |                             ^
    421|   const lower = [
    422|     "# Plan",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 26 passed (28)
   Start at  23:47:00
   Duration  92ms (transform 62%, tests 19%, setup 8%, import 7%, worker 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-OnP2hw/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
