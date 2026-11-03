
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/tasks.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts (18 tests | 1 failed) 438ms
   ❯ bkit tasks tick (10)
     ✓ tick marks only the named tasks 3ms
     ✓ tick refuses a task in another group 1ms
     ✓ tick refuses a plan with no task blocks 0ms
     ✓ tick narrows the group's gap-free tasks by --tasks 1ms
     ✓ tick is idempotent on an already-ticked task 1ms
     ✓ tick refuses a --tasks value that is not a task number 0ms
     ✓ tick refuses a --plan that is no file 0ms
     × tick treats the header's none as nothing to tick 3ms
     ✓ tick leaves every other plan line byte-identical 1ms
     ✓ tick refuses a call with no --group or with neither selector 0ms
   ✓ bkit tasks open (3)
     ✓ open lists tasks with no done line 1ms
     ✓ open sets handover only when a task is open 1ms
     ✓ open refuses a plan with no task blocks 0ms
   ✓ bkit tasks currency (5)
     ✓ currency matches a task on a moved symbol 94ms
     ✓ currency emits no hunk outside the matched set 92ms
     ✓ currency refuses a plan with no task blocks 32ms
     ✓ currency exits 0 with no hunks when no task matches 82ms
     ✓ currency judges base...against (origin/dev), not base...HEAD 126ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks tick > tick treats the header's none as nothing to tick
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:217:20
    215|     const plan = write("none.md", text);
    216|     const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tas…
    217|     expect(r.code).toBe(0);
       |                    ^
    218|     expect(r.json.ticked).toEqual([]);
    219|     expect(read(plan)).toBe(text);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 17 passed (18)
   Start at  10:13:39
   Duration  762ms (tests 61%, transform 33%, import 5%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-AOXxO4/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
