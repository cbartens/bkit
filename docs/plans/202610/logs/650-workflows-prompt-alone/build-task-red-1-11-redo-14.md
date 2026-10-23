> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/locks.test.ts

[test-timeout-budget] load average 11.6 on 10 cores: unit limits 5796ms per test, 11592ms per hook (x1.16)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/locks.test.ts (19 tests | 1 failed) 861ms
✓ bkit locks acquire --kind=workflow — month bucket (5)
✓ takes the feature's existing bucket 46ms
✓ ignores other features' buckets, even one sharing the issue digits 45ms
✓ refuses a feature split across two buckets and takes no lock 41ms
✓ a new feature takes this UTC month, not the local one 43ms
✓ --month is used as given 46ms
✓ bkit locks acquire --kind=workflow — a lock already there (7)
✓ refuses while the holder's run stepped in the last 30 minutes 42ms
✓ reclaims an IN_PROGRESS run idle 30+ minutes 37ms
✓ reclaims a finished (DONE or FAILED) run's old lock 76ms
✓ reclaims a fresh lock over a finished run: the lock file's age is not checked 37ms
✓ reclaims a fresh lock over an IN_PROGRESS run idle 30+ minutes 35ms
✓ with no status log, a lock of any age is reclaimed as orphaned 69ms
✓ reads the feature worktree's status copy before the main checkout's 38ms
✓ bkit locks acquire --kind=workflow — ship (1)
✓ takes the lock in the main checkout, from the worktree being shipped too 57ms
✓ bkit locks acquire — kinds (1)
✓ knows only the workflow kind 27ms
❯ bkit locks release (5)
✓ removes its own lock, by token or by workflow and fid 45ms
✓ leaves another owner's lock in place: other workflow, or other token 41ms
✓ releases an old-format lock line by workflow name 31ms
✓ a missing lock is already released 31ms
× locks release removes the FID shared-checkout record 72ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/locks.test.ts > bkit locks release > locks release removes the FID shared-checkout record
AssertionError: expected true to be false // Object.is equality

- Expected

* Received

- false

* true

❯ .bkit/core/engine/commands/workflow/locks.test.ts:317:42
315| expect(r.code).toBe(0);
316| expect(r.json.released).toBe(true);
317| expect(fs.existsSync(recordAt(FID))).toBe(false);
| ^
318| expect(fs.existsSync(recordAt("69-other"))).toBe(true);
319| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

Test Files 1 failed (1)
Tests 1 failed | 18 passed (19)
Start at 15:46:09
Duration 1.04s (tests 90%, transform 8%, import 1%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-lb7luH/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
