> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/locks.test.ts

[test-timeout-budget] load average 11.2 on 10 cores: unit limits 5585ms per test, 11170ms per hook (x1.12)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/locks.test.ts (20 tests | 2 failed) 1042ms
✓ bkit locks acquire --kind=workflow — month bucket (5)
✓ takes the feature's existing bucket 47ms
✓ ignores other features' buckets, even one sharing the issue digits 45ms
✓ refuses a feature split across two buckets and takes no lock 44ms
✓ a new feature takes this UTC month, not the local one 67ms
✓ --month is used as given 52ms
✓ bkit locks acquire --kind=workflow — a lock already there (7)
✓ refuses while the holder's run stepped in the last 30 minutes 48ms
✓ reclaims an IN_PROGRESS run idle 30+ minutes 48ms
✓ reclaims a finished (DONE or FAILED) run's old lock 89ms
✓ reclaims a fresh lock over a finished run: the lock file's age is not checked 43ms
✓ reclaims a fresh lock over an IN_PROGRESS run idle 30+ minutes 45ms
✓ with no status log, a lock of any age is reclaimed as orphaned 88ms
✓ reads the feature worktree's status copy before the main checkout's 45ms
✓ bkit locks acquire --kind=workflow — ship (1)
✓ takes the lock in the main checkout, from the worktree being shipped too 72ms
✓ bkit locks acquire — kinds (1)
✓ knows only the workflow kind 34ms
❯ bkit locks release (6)
✓ removes its own lock, by token or by workflow and fid 63ms
✓ leaves another owner's lock in place: other workflow, or other token 56ms
✓ releases an old-format lock line by workflow name 41ms
× locks release removes the FID shared-checkout record 37ms
× another owner's lock left in place keeps the record 36ms
✓ a missing lock is already released 40ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/locks.test.ts > bkit locks release > locks release removes the FID shared-checkout record
TypeError: newRecord is not a function
❯ .bkit/core/engine/commands/workflow/locks.test.ts:291:22
289| it("locks release removes the FID shared-checkout record", async () …
290| const cwd = repo();
291| writeRecord(cwd, newRecord(cwd, FID, "dev"));
| ^
292| writeRecord(cwd, newRecord(cwd, "9-other", "dev"));
293| await run(cwd, acquire("--month=202610"));

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

FAIL .bkit/core/engine/commands/workflow/locks.test.ts > bkit locks release > another owner's lock left in place keeps the record
TypeError: newRecord is not a function
❯ .bkit/core/engine/commands/workflow/locks.test.ts:302:22
300| it("another owner's lock left in place keeps the record", async () =…
301| const cwd = repo();
302| writeRecord(cwd, newRecord(cwd, FID, "dev"));
| ^
303| await run(cwd, acquire("--month=202610"));
304| expect((await run(cwd, rel("workflow", "design"))).code).toBe(4);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯

Test Files 1 failed (1)
Tests 2 failed | 18 passed (20)
Start at 14:21:49
Duration 1.25s (tests 90%, transform 8%, import 1%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-NTfPSv/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
