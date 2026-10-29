
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/conventions.test.ts

[test-timeout-budget] load average 21.7 on 10 cores: unit limits 10868ms per test, 21736ms per hook (x2.17)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/commands/conventions.test.ts (16 tests | 1 failed) 502ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 431ms
     ✓ have unique nouns 1ms
     ✓ are reachable: bkit <noun> <verb> --help routes to the command 9ms
   ❯ command sources (4)
     × each export a command, and every exported command is in COMMANDS (reachable) 31ms
     ✓ each have a test file next to them 1ms
     ✓ the engine's shared/ helpers each have a test file next to them 1ms
     ✓ write only through ctx.log / ctx.emit, so stderr is always tagged [bkit-<noun>] 7ms
   ✓ the convention checker rejects what it should (9)
     ✓ accepts a conforming command 1ms
     ✓ rejects a camelCase flag 1ms
     ✓ rejects a snake_case output key 0ms
     ✓ rejects no output keys 0ms
     ✓ rejects a shared-range exit code 0ms
     ✓ rejects an uppercase noun 0ms
     ✓ rejects a command whose source can exit with a code no --help lists 0ms
     ✓ reads the exit codes a help text actually lists, so the help check can fail 0ms
     ✓ finds the own exit codes a real source can return, through constants and exit-code maps 14ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/conventions.test.ts > command sources > each export a command, and every exported command is in COMMANDS (reachable)
AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "commands/workflow/completeness.ts: bkit completeness is not in COMMANDS",
+ ]

 ❯ .bkit/core/engine/commands/conventions.test.ts:224:22
    222|     const problems: string[] = [];
    223|     for (const rel of sources) problems.push(...(await exportProblems(…
    224|     expect(problems).toEqual([]);
       |                      ^
    225|   });
    226|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 15 passed (16)
   Start at  12:45:07
   Duration  2.91s (transform 66%, tests 18%, import 13%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-t2ZdKH/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
