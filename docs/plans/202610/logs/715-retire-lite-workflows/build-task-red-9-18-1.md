
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/disk.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows

 ❯ .bkit/core/engine/commands/workflow/disk.test.ts (36 tests | 1 failed) 6461ms
   ✓ bkit disk prune — usage (3)
     ✓ refuses a mode other than min or max 18ms
     ✓ refuses --auto with --dry-run 13ms
     ✓ refuses a scope other than repo or machine, and --scope with --auto 24ms
   ✓ bkit disk prune — step files (10)
     ✓ with no step files runs nothing and names both templates 20ms
     ✓ min runs only min steps; max runs both 75ms
     ✓ runs repo steps from the checkout top, then machine steps from the home folder 28ms
     ✓ --scope runs only that file's steps 31ms
     ✓ a failing or throwing step is reported and the next step still runs 35ms
     ✓ a broken file is reported and the other file's steps still run 33ms
     ✓ drops an invalid step and runs the valid ones 32ms
     ✓ skips a step whose skip check says so 34ms
     ✓ --dry-run runs nothing and sizes each step's paths 25ms
     ✓ runs nothing on CI or in a cloud session 13ms
   ❯ bkit disk prune — lock (7)
     ✓ does not run while a live sweep holds the lock 21ms
     ✓ with --wait, waits for the running sweep to end, then runs 89ms
     ✓ the sweep --auto starts waits its turn, for only the due scopes 1ms
     ✓ worktree setup's low-disk sweep waits for a running sweep 115ms
     × worktree setup's low-disk sweep stops waiting after maxWaitMs while a live sweep holds the lock 5006ms
     ✓ refuses --wait with --auto 72ms
     ✓ replaces a lock whose process is gone, or that is an hour old, and releases it 81ms
   ✓ bkit disk prune --auto (8)
     ✓ starts nothing without step files 21ms
     ✓ starts a mode at most once a day; max also counts as that day's min 46ms
     ✓ each checkout's repo steps keep their own day; machine steps share one 58ms
     ✓ under the threshold, each checkout's repo steps keep their own hour 44ms
     ✓ drops a checkout's stamps once no hook has renewed them in 7 days 43ms
     ✓ starts max at most hourly while free disk is under the threshold 36ms
     ✓ starts nothing on CI 13ms
     ✓ always exits 0 and runs no step in the hook's own process 34ms
   ✓ ensureDiskSpace (3)
     ✓ checks nothing without step files 20ms
     ✓ runs no step while free disk is over the threshold 20ms
     ✓ under the threshold runs the max steps, then says why it is still too low 48ms
   ✓ bkit disk prune — notes (5)
     ✓ a sweep reports its notes and keeps them for that checkout until the next sweep 88ms
     ✓ a dry run keeps no notes 35ms
     ✓ drops notes after 7 days without a sweep 49ms
     ✓ a worktree of the checkout sees the main checkout's notes 80ms
     ✓ bkit tips prints the notes first, as a list with what to ask 60ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/disk.test.ts > bkit disk prune — lock > worktree setup's low-disk sweep stops waiting after maxWaitMs while a live sweep holds the lock
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/disk.test.ts:299:3
    297|   });
    298|
    299|   it("worktree setup's low-disk sweep stops waiting after maxWaitMs wh…
       |   ^
    300|     holdLock(process.pid);
    301|     const cwd = repo(marks(["a", "max"]));

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 35 passed (36)
   Start at  12:59:24
   Duration  6.60s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-oaR3Ew/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
