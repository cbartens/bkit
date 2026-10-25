> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/ledgers.test.ts

[test-timeout-budget] load average 25.4 on 10 cores: unit limits 12716ms per test, 25432ms per hook (x2.54)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/ledgers.test.ts (40 tests | 3 failed) 5183ms
✓ bkit ledgers commit (tests/book-commit.bats) (18)
✓ modified ledger under the FID logdir is staged and committed 215ms
✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 169ms
✓ brand-new untracked ledger is staged and committed 168ms
✓ unmatched plan-logs glob does not abort the sweep of other ledgers 164ms
✓ path containing a space is staged and committed 174ms
✓ nothing changed: exit 0, 'nothing to commit', no new commit 142ms
✓ staging failure: exit 4 and no commit is created, no false success 121ms
✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 124ms
✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 122ms
✓ --mode=stage stages the sweep but creates no commit 147ms
✓ top-level docs/_.md is committed under scope=pr, not under scope=core or scope=full 368ms
✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/\**) 191ms
✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 33ms
✓ usage error ["--scope=core","--mode=push","--message=m"] exits 2 33ms
✓ usage error ["--scope=core","--mode=commit"] exits 2 33ms
✓ root that is not a directory or not a repo exits 3 9ms
✓ --root defaults to the working directory 116ms
✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 179ms
❯ bkit ledgers commit — a run in place on dev that shares its checkout (3)
× stageTrackedUpdates skips recorded paths 141ms
× a recorded ledger commits only the rows the run appended 173ms
× commitBookkeeping refuses when a recorded path changed 179ms
✓ --squash-of (tests/book-commit.bats, #493) (3)
✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 263ms
✓ under --mode=commit counts the squashed paths as something to commit 254ms
✓ stage mode exits 2; an unknown ref exits 3 with no commit 163ms
✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
✓ does nothing when only untracked files are present 112ms
✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 146ms
✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 104ms
✓ bkit ledgers union (union-ledgers) (6)
✓ merges rows append-only without duplicating existing ones 78ms
✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 72ms
✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 76ms
✓ carries untracked ledgers too 75ms
✓ keeps rows on separate lines when the destination has no final newline 75ms
✓ src that is not a git repo exits 3 7ms
✓ bkit ledgers only-bookkeeping (5)
✓ docs, FID logs, ledgers and skill removals only: exit 0 168ms
✓ a source file in the range: exit 7, path listed 174ms
✓ another FID's plan file in the range: exit 7 171ms
✓ from not an ancestor of to: exit 7 142ms
✓ unknown commit exits 3; a missing flag exits 2 101ms
✓ bookPathspecs (1)
✓ grows core -> full -> pr 0ms
✓ bookPathspecs — frozen bookkeeping allow-list (1)
✓ scope=pr reaches every frozen entry, the FID log dir, and the docs/_.jsonl ledger glob 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers commit — a run in place on dev that shares its checkout > stageTrackedUpdates skips recorded paths
AssertionError: expected [ '.bkit/issues.jsonl', …(2) ] to not include 'src/a.txt'
❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:394:22
392| const list = staged(r).split("\n");
393| expect(list).toContain("src/own.txt");
394| expect(list).not.toContain("src/a.txt");
| ^
395| });
396|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

FAIL .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers commit — a run in place on dev that shares its checkout > a recorded ledger commits only the rows the run appended
AssertionError: expected '{"id":"base"}\n{"id":"foreign"}\n{"id…' to be '{"id":"base"}\n{"id":"run"}' // Object.is equality

- Expected

* Received

  {"id":"base"}

* {"id":"foreign"}
  {"id":"run"}

❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:402:55
400| const res = await run(r, commitArgs(r, ...base, "--mode=commit", "…
401| expect(res.code).toBe(0);
402| expect(git(r, "show", "HEAD:.bkit/issues.jsonl")).toBe(`${row("bas…
       |                                                       ^
    403|     expect(fs.readFileSync(path.join(r, ".bkit/issues.jsonl"), "utf-8"…
    404|       `${row("base")}${row("foreign")}${row("run")}`,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

FAIL .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers commit — a run in place on dev that shares its checkout > commitBookkeeping refuses when a recorded path changed
AssertionError: expected +0 to be 10 // Object.is equality

- Expected

* Received

- 10

* 0

❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:417:22
415| commitArgs(r, ...base, "--mode=commit", "--message=book", "--sta…
416| );
417| expect(res.code).toBe(10);
| ^
418| expect(res.err).toContain("src/a.txt");
419| expect(head(r)).toBe(before);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯

Test Files 1 failed (1)
Tests 3 failed | 37 passed (40)
Start at 15:45:08
Duration 5.42s (tests 97%, transform 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-4L5GXJ/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
