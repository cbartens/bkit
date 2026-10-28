
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/ledgers.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts (82 tests | 2 failed) 5302ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (23)
     ✓ modified ledger under the FID logdir is staged and committed 108ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 104ms
     ✓ brand-new untracked ledger is staged and committed 87ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 90ms
     ✓ path containing a space is staged and committed 91ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 76ms
     ✓ staging failure: exit 4 and no commit is created, no false success 69ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 72ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 60ms
     ✓ --mode=stage stages the sweep but creates no commit 77ms
     ✓ top-level docs/*.md is committed under scope=pr, not under scope=core or scope=full 211ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 109ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 63ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 72ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 62ms
     ✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 19ms
     ✓ usage error ["--scope=core","--mode=push","--message=m"] exits 2 18ms
     ✓ usage error ["--scope=core","--mode=commit"] exits 2 17ms
     ✓ root that is not a directory or not a repo exits 3 5ms
     ✓ --root defaults to the working directory 67ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 108ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 110ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 99ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 95ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 66ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 38ms
     ✓ a path outside the checkout exits 6 with nothing committed 55ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 71ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 46ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 151ms
     ✓ --path records its commit on the run's record, like every other commit mode 140ms
     ✓ a recorded ledger commits only the rows the run appended 203ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 247ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 208ms
     ✓ commitBookkeeping refuses when a recorded path changed 126ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 156ms
     ✓ under --mode=commit counts the squashed paths as something to commit 149ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 97ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 63ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 91ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 65ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 49ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 46ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 47ms
     ✓ carries untracked ledgers too 46ms
     ✓ keeps rows on separate lines when the destination has no final newline 47ms
     ✓ src that is not a git repo exits 3 5ms
   ✓ bkit ledgers only-bookkeeping (5)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 98ms
     ✓ a source file in the range: exit 7, path listed 94ms
     ✓ another FID's plan file in the range: exit 7 96ms
     ✓ from not an ancestor of to: exit 7 81ms
     ✓ unknown commit exits 3; a missing flag exits 2 55ms
   ✓ bookPathspecs (1)
     ✓ grows core -> full -> pr 0ms
   ✓ bookPathspecs — frozen bookkeeping allow-list (1)
     ✓ scope=pr reaches every frozen entry, the FID log dir, and the docs/*.jsonl ledger glob 0ms
   ✓ bkit ledgers append (15)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 25ms
     ✓ append keeps a row's own repo 24ms
     ✓ append refuses a supplied ts 19ms
     ✓ append refuses a supplied schema or bkit 24ms
     ✓ append refuses a flat top-level field the top section moved into by 24ms
     ✓ append writes nothing when one row is invalid 25ms
     ✓ append refuses a row whose kind is not the ledger's 20ms
     ✓ append --ledger=stats takes compliance, counter and outcome rows 23ms
     ✓ append --ledger=stats refuses another kind, a non-closing writer, and a total that does not match its parts 29ms
     ✓ append bumps a round-second mint 24ms
     ✓ append refuses an empty rows file 19ms
     ✓ append refuses an unknown or issues ledger 18ms
     ✓ append refuses a writer not listed for the kind 33ms
     ✓ append starts a new line when the ledger lacks its final newline 25ms
     ✓ append creates the ledger and its directory 25ms
   ✓ bkit ledgers check (4)
     ✓ passes when every key on the Ledger rows line has a decision or deferral row 1ms
     ✓ names the keys no row carries and exits EXIT_ROWS_MISSING 1ms
     ✓ passes on None 1ms
     ✓ refuses a plan with no Ledger rows line or an unfilled one 1ms
   ❯ bkit ledgers triage (9)
     ✓ triage keeps a low-severity deferral exempt 43ms
     ✓ triage keeps an own-cycle deferral exempt 42ms
     ✓ triage marks an unjustified deferral lazy 46ms
     ✓ triage writes an unjustified row with a minted ts 46ms
     × triage writes no row for a closed deferral 49ms
     × triage reports an adjudicated unjustified row outside exempt 42ms
     ✓ triage ignores another feature's deferral rows 47ms
     ✓ triage writes nothing when the FID has no deferral row 42ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 57ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers triage > triage writes no row for a closed deferral
AssertionError: expected [ [ '701-deferred-guard', 'Lazy' ] ] to deeply equal [ [ '701-deferred-guard', 'Exempt' ] ]

- Expected
+ Received

  [
    [
      "701-deferred-guard",
-     "Exempt",
+     "Lazy",
    ],
  ]

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:1448:90
    1446|     const res = await triage(r);
    1447|     expect(res.code).toBe(0);
    1448|     expect(res.json.rows.map((x: { key: string; bucket: string }) => […
       |                                                                                          ^
    1449|       ["701-deferred-guard", "Exempt"],
    1450|     ]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers triage > triage reports an adjudicated unjustified row outside exempt
AssertionError: expected [ [ '701-deferred-guard', 'Exempt' ] ] to deeply equal [ [ '701-deferred-guard', 'Lazy' ] ]

- Expected
+ Received

  [
    [
      "701-deferred-guard",
-     "Lazy",
+     "Exempt",
    ],
  ]

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:1462:92
    1460|     const second = await triage(r);
    1461|     expect([first.code, second.code]).toEqual([0, 0]);
    1462|     expect(first.json.rows.map((x: { key: string; bucket: string }) =>…
       |                                                                                            ^
    1463|       ["701-deferred-guard", "Lazy"],
    1464|     ]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 80 passed (82)
   Start at  10:13:50
   Duration  5.48s (tests 98%, transform 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-h6s3Vh/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
