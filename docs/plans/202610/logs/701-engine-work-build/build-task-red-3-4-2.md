
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/tasks.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts (17 tests | 5 failed) 308ms
   ✓ bkit tasks tick (9)
     ✓ tick marks only the named tasks 2ms
     ✓ tick refuses a task in another group 1ms
     ✓ tick refuses a plan with no task blocks 0ms
     ✓ tick narrows the group's gap-free tasks by --tasks 1ms
     ✓ tick is idempotent on an already-ticked task 1ms
     ✓ tick refuses a --tasks value that is not a task number 0ms
     ✓ tick refuses a --plan that is no file 0ms
     ✓ tick leaves every other plan line byte-identical 1ms
     ✓ tick refuses a call with no --group or with neither selector 0ms
   ✓ bkit tasks open (3)
     ✓ open lists tasks with no done line 1ms
     ✓ open sets handover only when a task is open 0ms
     ✓ open refuses a plan with no task blocks 0ms
   ❯ bkit tasks currency (5)
     × currency matches a task on a moved symbol 61ms
     × currency emits no hunk outside the matched set 56ms
     × currency refuses a plan with no task blocks 32ms
     × currency exits 0 with no hunks when no task matches 56ms
     × currency judges base...against (origin/dev), not base...HEAD 94ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks currency > currency matches a task on a moved symbol
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:290:20
    288|     );
    289|     const r = await run(["currency", `--plan=${plan}`, `--base=${base}…
    290|     expect(r.code).toBe(0);
       |                    ^
    291|     expect(r.json.tasks.map((t: { task: number }) => t.task)).toEqual(…
    292|     expect(r.json.tasks[0].paths).toEqual(["src/money.ts"]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks currency > currency emits no hunk outside the matched set
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:311:20
    309|     );
    310|     const r = await run(["currency", `--plan=${plan}`, `--base=${base}…
    311|     expect(r.code).toBe(0);
       |                    ^
    312|     const hunks = r.json.tasks[0].hunks.join("\n");
    313|     expect(hunks).toContain("src/matched.ts");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks currency > currency refuses a plan with no task blocks
AssertionError: expected 2 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 2

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:321:20
    319|     const plan = write("currency-plain.md", "# Plan\n\nNo task blocks …
    320|     const r = await run(["currency", `--plan=${plan}`]);
    321|     expect(r.code).toBe(1);
       |                    ^
    322|     expect(r.err).toMatch(/no task markers/);
    323|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks currency > currency exits 0 with no hunks when no task matches
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:335:20
    333|     );
    334|     const r = await run(["currency", `--plan=${plan}`, `--base=${base}…
    335|     expect(r.code).toBe(0);
       |                    ^
    336|     expect(r.json.tasks).toEqual([]);
    337|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks currency > currency judges base...against (origin/dev), not base...HEAD
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:360:20
    358|     );
    359|     const r = await run(["currency", `--plan=${plan}`, `--base=${base}…
    360|     expect(r.code).toBe(0);
       |                    ^
    361|     expect(r.json.tasks[0].paths).toEqual(["src/dev-moved.ts"]);
    362|     expect(r.json.tasks[0].hunks.join("\n")).not.toContain("branch-mov…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯


 Test Files  1 failed (1)
      Tests  5 failed | 12 passed (17)
   Start at  22:26:36
   Duration  574ms (tests 58%, transform 35%, import 6%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-KLObsI/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
