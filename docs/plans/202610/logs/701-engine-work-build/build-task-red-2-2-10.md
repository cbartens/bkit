
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/conventions.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

 ❯ .bkit/core/engine/commands/conventions.test.ts (16 tests | 1 failed) 67ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 51ms
     ✓ have unique nouns 0ms
     ✓ are reachable: bkit <noun> <verb> --help routes to the command 2ms
   ❯ command sources (4)
     × each export a command, and every exported command is in COMMANDS (reachable) 8ms
     ✓ each have a test file next to them 0ms
     ✓ the engine's shared/ helpers each have a test file next to them 0ms
     ✓ write only through ctx.log / ctx.emit, so stderr is always tagged [bkit-<noun>] 2ms
   ✓ the convention checker rejects what it should (9)
     ✓ accepts a conforming command 0ms
     ✓ rejects a camelCase flag 0ms
     ✓ rejects a snake_case output key 0ms
     ✓ rejects no output keys 0ms
     ✓ rejects a shared-range exit code 0ms
     ✓ rejects an uppercase noun 0ms
     ✓ rejects a command whose source can exit with a code no --help lists 0ms
     ✓ reads the exit codes a help text actually lists, so the help check can fail 0ms
     ✓ finds the own exit codes a real source can return, through constants and exit-code maps 3ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/conventions.test.ts > command sources > each export a command, and every exported command is in COMMANDS (reachable)
AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "commands/workflow/tasks.ts: bkit tasks is not in COMMANDS",
+ ]

 ❯ .bkit/core/engine/commands/conventions.test.ts:222:22
    220|     const problems: string[] = [];
    221|     for (const rel of sources) problems.push(...(await exportProblems(…
    222|     expect(problems).toEqual([]);
       |                      ^
    223|   });
    224|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 15 passed (16)
   Start at  21:47:06
   Duration  587ms (transform 73%, import 13%, tests 12%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-x3P3LP/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
