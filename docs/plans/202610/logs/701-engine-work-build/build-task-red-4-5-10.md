
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/plan-blocks.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

 ❯ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (26 tests | 1 failed) 7ms
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
   × derivedTestMatrix returns a null column index when the header has no Task column 2ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/plan-blocks.test.ts > derivedTestMatrix returns a null column index when the header has no Task column
AssertionError: expected undefined to be null

- Expected:
null

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/plan-blocks.test.ts:392:30
    390|   ].join("\n");
    391|   const matrix = derivedTestMatrix(text);
    392|   expect(matrix?.taskColumn).toBeNull();
       |                              ^
    393|   expect(matrix?.line).toBe(5);
    394|   expect(matrix?.rows.map((r) => r.cells)).toEqual([["case a", "Unit",…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 25 passed (26)
   Start at  22:50:09
   Duration  119ms (transform 63%, tests 16%, setup 9%, import 7%, worker 5%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Uk60Hs/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
