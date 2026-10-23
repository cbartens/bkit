> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/ledgers.test.ts

[test-timeout-budget] load average 29.9 on 10 cores: unit limits 14946ms per test, 29891ms per hook (x2.99)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/ledgers.test.ts (42 tests | 5 failed) 11217ms
✓ bkit ledgers commit (tests/book-commit.bats) (18)
✓ modified ledger under the FID logdir is staged and committed 429ms
✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 391ms
✓ brand-new untracked ledger is staged and committed 381ms
✓ unmatched plan-logs glob does not abort the sweep of other ledgers 278ms
✓ path containing a space is staged and committed 318ms
✓ nothing changed: exit 0, 'nothing to commit', no new commit 358ms
✓ staging failure: exit 4 and no commit is created, no false success 276ms
✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 367ms
✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 260ms
✓ --mode=stage stages the sweep but creates no commit 232ms
✓ top-level docs/_.md is committed under scope=pr, not under scope=core or scope=full 781ms
✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/\**) 425ms
✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 91ms
✓ usage error ["--scope=core","--mode=push","--message=m"] exits 2 84ms
✓ usage error ["--scope=core","--mode=commit"] exits 2 59ms
✓ root that is not a directory or not a repo exits 3 18ms
✓ --root defaults to the working directory 209ms
✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 362ms
✓ --squash-of (tests/book-commit.bats, #493) (3)
✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 655ms
✓ under --mode=commit counts the squashed paths as something to commit 626ms
✓ stage mode exits 2; an unknown ref exits 3 with no commit 345ms
✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
✓ does nothing when only untracked files are present 207ms
✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 386ms
✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 263ms
✓ bkit ledgers union (union-ledgers) (6)
✓ merges rows append-only without duplicating existing ones 215ms
✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 196ms
✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 231ms
✓ carries untracked ledgers too 171ms
✓ keeps rows on separate lines when the destination has no final newline 158ms
✓ src that is not a git repo exits 3 13ms
✓ bkit ledgers only-bookkeeping (5)
✓ docs, FID logs, ledgers and skill removals only: exit 0 355ms
✓ a source file in the range: exit 7, path listed 423ms
✓ another FID's plan file in the range: exit 7 391ms
✓ from not an ancestor of to: exit 7 340ms
✓ unknown commit exits 3; a missing flag exits 2 181ms
✓ bookPathspecs (1)
✓ grows core -> full -> pr 0ms
✓ bookPathspecs — frozen bookkeeping allow-list (1)
✓ scope=pr reaches every frozen entry, the FID log dir, and the docs/_.jsonl ledger glob 1ms
❯ bkit ledgers commit — in-place run with a shared-checkout record (5)
× stageTrackedUpdates skips recorded paths 159ms
× a recorded ledger commits only the rows the run appended 136ms
× commitBookkeeping refuses when a recorded path changed 144ms
× a commit appends its sha to the record; without a record nothing is recorded 140ms
× rowsHeadLacks lists the working-copy rows HEAD does not have 161ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers commit — in-place run with a shared-checkout record > stageTrackedUpdates skips recorded paths
TypeError: newRecord is not a function
❯ started .bkit/core/engine/commands/workflow/ledgers.test.ts:739:20
737| commitAll(r);
738| dirty(r);
739| writeRecord(r, newRecord(r, FID, "main"));
| ^
740| return r;
741| }
❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:746:15

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

FAIL .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers commit — in-place run with a shared-checkout record > a recorded ledger commits only the rows the run appended
TypeError: newRecord is not a function
❯ started .bkit/core/engine/commands/workflow/ledgers.test.ts:739:20
737| commitAll(r);
738| dirty(r);
739| writeRecord(r, newRecord(r, FID, "main"));
| ^
740| return r;
741| }
❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:754:15

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

FAIL .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers commit — in-place run with a shared-checkout record > commitBookkeeping refuses when a recorded path changed
TypeError: newRecord is not a function
❯ started .bkit/core/engine/commands/workflow/ledgers.test.ts:739:20
737| commitAll(r);
738| dirty(r);
739| writeRecord(r, newRecord(r, FID, "main"));
| ^
740| return r;
741| }
❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:770:15

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

FAIL .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers commit — in-place run with a shared-checkout record > a commit appends its sha to the record; without a record nothing is recorded
TypeError: newRecord is not a function
❯ started .bkit/core/engine/commands/workflow/ledgers.test.ts:739:20
737| commitAll(r);
738| dirty(r);
739| writeRecord(r, newRecord(r, FID, "main"));
| ^
740| return r;
741| }
❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:781:15

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

FAIL .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers commit — in-place run with a shared-checkout record > rowsHeadLacks lists the working-copy rows HEAD does not have
TypeError: newRecord is not a function
❯ started .bkit/core/engine/commands/workflow/ledgers.test.ts:739:20
737| commitAll(r);
738| dirty(r);
739| writeRecord(r, newRecord(r, FID, "main"));
| ^
740| return r;
741| }
❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:788:15

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯

Test Files 1 failed (1)
Tests 5 failed | 37 passed (42)
Start at 14:19:15
Duration 11.65s (tests 98%, transform 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-fIKROM/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
