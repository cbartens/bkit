
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/tasks.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts (12 tests | 3 failed) 11ms
   ✓ bkit tasks tick (9)
     ✓ tick marks only the named tasks 3ms
     ✓ tick refuses a task in another group 1ms
     ✓ tick refuses a plan with no task blocks 0ms
     ✓ tick narrows the group's gap-free tasks by --tasks 1ms
     ✓ tick is idempotent on an already-ticked task 1ms
     ✓ tick refuses a --tasks value that is not a task number 0ms
     ✓ tick refuses a --plan that is no file 0ms
     ✓ tick leaves every other plan line byte-identical 1ms
     ✓ tick refuses a call with no --group or with neither selector 0ms
   ❯ bkit tasks open (3)
     × open lists tasks with no done line 2ms
     × open sets handover only when a task is open 1ms
     × open refuses a plan with no task blocks 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks open > open lists tasks with no done line
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:203:20
    201|     );
    202|     const r = await run(["open", `--plan=${plan}`, "--group=1", `--log…
    203|     expect(r.code).toBe(0);
       |                    ^
    204|     expect(r.json.tasks).toEqual([3]);
    205|     expect(r.json.handover).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks open > open sets handover only when a task is open
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:219:20
    217|     );
    218|     const r = await run(["open", `--plan=${plan}`, "--group=1", `--log…
    219|     expect(r.code).toBe(0);
       |                    ^
    220|     expect(r.json.tasks).toEqual([]);
    221|     expect(r.json.handover).toBe(false);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks open > open refuses a plan with no task blocks
AssertionError: expected 2 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 2

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:228:20
    226|     const log = write("open-plain-log.md", "");
    227|     const r = await run(["open", `--plan=${plan}`, "--group=1", `--log…
    228|     expect(r.code).toBe(1);
       |                    ^
    229|     expect(r.err).toMatch(/no task markers/);
    230|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 9 passed (12)
   Start at  21:49:26
   Duration  282ms (transform 80%, import 13%, tests 5%, setup 2%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-7IA9Bp/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
