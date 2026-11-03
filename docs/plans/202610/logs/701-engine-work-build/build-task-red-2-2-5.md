
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/tasks.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts (9 tests | 9 failed) 8ms
   ❯ bkit tasks tick (9)
     × tick marks only the named tasks 2ms
     × tick refuses a task in another group 2ms
     × tick refuses a plan with no task blocks 1ms
     × tick narrows the group's gap-free tasks by --tasks 1ms
     × tick is idempotent on an already-ticked task 0ms
     × tick refuses a --tasks value that is not a task number 0ms
     × tick refuses a --plan that is no file 0ms
     × tick leaves every other plan line byte-identical 1ms
     × tick refuses a call with no --group or with neither selector 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 9 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks tick > tick marks only the named tasks
TypeError: Cannot read properties of undefined (reading 'ticked')
 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:90:19
     88|     const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tas…
     89|     expect(r.code).toBe(0);
     90|     expect(r.json.ticked).toEqual([2]);
       |                   ^
     91|     expect([tickOf(read(plan), 1), tickOf(read(plan), 2), tickOf(read(…
     92|       " ",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/9]⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks tick > tick refuses a task in another group
AssertionError: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:102:20
    100|     const plan = write("other-group.md", text);
    101|     const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tas…
    102|     expect(r.code).toBe(2);
       |                    ^
    103|     expect(r.err).toContain("TASK 2");
    104|     expect(r.err).toContain("group 2");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/9]⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks tick > tick refuses a plan with no task blocks
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:111:20
    109|     const plan = write("no-blocks.md", "# Plan\n\nNo task blocks here.…
    110|     const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tas…
    111|     expect(r.code).toBe(1);
       |                    ^
    112|     expect(r.err).toMatch(/no task markers/);
    113|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/9]⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks tick > tick narrows the group's gap-free tasks by --tasks
TypeError: Cannot read properties of undefined (reading 'ticked')
 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:134:19
    132|     const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tas…
    133|     expect(r.code).toBe(0);
    134|     expect(r.json.ticked).toEqual([1]);
       |                   ^
    135|     expect(tickOf(read(plan), 2)).toBe(" ");
    136|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/9]⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks tick > tick is idempotent on an already-ticked task
TypeError: Cannot read properties of undefined (reading 'ticked')
 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:145:24
    143|     const second = await run(["tick", `--plan=${plan}`, "--group=1", "…
    144|     expect(second.code).toBe(0);
    145|     expect(second.json.ticked).toEqual([]);
       |                        ^
    146|     expect(read(plan)).toBe(once);
    147|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/9]⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks tick > tick refuses a --tasks value that is not a task number
AssertionError: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:153:20
    151|     const plan = write("bad-number.md", text);
    152|     const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tas…
    153|     expect(r.code).toBe(2);
       |                    ^
    154|     expect(r.err).toContain("--tasks");
    155|     expect(read(plan)).toBe(text);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/9]⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks tick > tick refuses a --plan that is no file
AssertionError: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:161:20
    159|     if (cwd === "") cwd = tmp();
    160|     const r = await run(["tick", "--plan=no-such-plan.md", "--group=1"…
    161|     expect(r.code).toBe(2);
       |                    ^
    162|     expect(r.err).toContain("no-such-plan.md");
    163|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/9]⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks tick > tick leaves every other plan line byte-identical
AssertionError: expected [] to deeply equal [ '- [x] **TASK 2:** Task 2 title.' ]

- Expected
+ Received

- [
-   "- [x] **TASK 2:** Task 2 title.",
- ]
+ []

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:173:53
    171|     const before = text.split("\n");
    172|     expect(after).toHaveLength(before.length);
    173|     expect(after.filter((l, i) => l !== before[i])).toEqual([
       |                                                     ^
    174|       "- [x] **TASK 2:** Task 2 title.",
    175|     ]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/9]⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks tick > tick refuses a call with no --group or with neither selector
AssertionError: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:185:29
    183|     expect(noGroup.err).toContain("--group");
    184|     const noSelector = await run(["tick", `--plan=${plan}`, "--group=1…
    185|     expect(noSelector.code).toBe(2);
       |                             ^
    186|     expect(noSelector.err).toMatch(/--tasks|--green/);
    187|     expect(read(plan)).toBe(text);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/9]⎯


 Test Files  1 failed (1)
      Tests  9 failed (9)
   Start at  21:47:01
   Duration  115ms (transform 72%, tests 12%, import 8%, setup 6%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-tWJhXC/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
