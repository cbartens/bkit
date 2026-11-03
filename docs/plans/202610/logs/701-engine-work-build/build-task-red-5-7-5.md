
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/ledgers.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts (79 tests | 6 failed) 4862ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (23)
     ✓ modified ledger under the FID logdir is staged and committed 105ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 95ms
     ✓ brand-new untracked ledger is staged and committed 83ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 82ms
     ✓ path containing a space is staged and committed 80ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 70ms
     ✓ staging failure: exit 4 and no commit is created, no false success 64ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 66ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 58ms
     ✓ --mode=stage stages the sweep but creates no commit 71ms
     ✓ top-level docs/*.md is committed under scope=pr, not under scope=core or scope=full 197ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 107ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 58ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 60ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 57ms
     ✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 18ms
     ✓ usage error ["--scope=core","--mode=push","--message=m"] exits 2 17ms
     ✓ usage error ["--scope=core","--mode=commit"] exits 2 22ms
     ✓ root that is not a directory or not a repo exits 3 4ms
     ✓ --root defaults to the working directory 64ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 101ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 101ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 92ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 90ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 60ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 37ms
     ✓ a path outside the checkout exits 6 with nothing committed 49ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 69ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 42ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 141ms
     ✓ --path records its commit on the run's record, like every other commit mode 137ms
     ✓ a recorded ledger commits only the rows the run appended 193ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 236ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 194ms
     ✓ commitBookkeeping refuses when a recorded path changed 111ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 147ms
     ✓ under --mode=commit counts the squashed paths as something to commit 161ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 95ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 60ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 92ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 64ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 47ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 42ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 44ms
     ✓ carries untracked ledgers too 43ms
     ✓ keeps rows on separate lines when the destination has no final newline 45ms
     ✓ src that is not a git repo exits 3 4ms
   ✓ bkit ledgers only-bookkeeping (5)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 104ms
     ✓ a source file in the range: exit 7, path listed 91ms
     ✓ another FID's plan file in the range: exit 7 89ms
     ✓ from not an ancestor of to: exit 7 77ms
     ✓ unknown commit exits 3; a missing flag exits 2 52ms
   ✓ bookPathspecs (1)
     ✓ grows core -> full -> pr 0ms
   ✓ bookPathspecs — frozen bookkeeping allow-list (1)
     ✓ scope=pr reaches every frozen entry, the FID log dir, and the docs/*.jsonl ledger glob 0ms
   ✓ bkit ledgers append (15)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 22ms
     ✓ append keeps a row's own repo 22ms
     ✓ append refuses a supplied ts 18ms
     ✓ append refuses a supplied schema or bkit 22ms
     ✓ append refuses a flat top-level field the top section moved into by 21ms
     ✓ append writes nothing when one row is invalid 22ms
     ✓ append refuses a row whose kind is not the ledger's 17ms
     ✓ append --ledger=stats takes compliance, counter and outcome rows 23ms
     ✓ append --ledger=stats refuses another kind, a non-closing writer, and a total that does not match its parts 26ms
     ✓ append bumps a round-second mint 23ms
     ✓ append refuses an empty rows file 17ms
     ✓ append refuses an unknown or issues ledger 17ms
     ✓ append refuses a writer not listed for the kind 32ms
     ✓ append starts a new line when the ledger lacks its final newline 22ms
     ✓ append creates the ledger and its directory 22ms
   ✓ bkit ledgers check (4)
     ✓ passes when every key on the Ledger rows line has a decision or deferral row 1ms
     ✓ names the keys no row carries and exits EXIT_ROWS_MISSING 1ms
     ✓ passes on None 1ms
     ✓ refuses a plan with no Ledger rows line or an unfilled one 1ms
   ❯ bkit ledgers triage (6)
     × triage keeps a low-severity deferral exempt 43ms
     × triage marks an unjustified deferral lazy 41ms
     × triage writes an unjustified row with a minted ts 40ms
     × triage ignores another feature's deferral rows 40ms
     × triage writes nothing when the FID has no deferral row 38ms
     × triage marks a scope-declared row whose only declaration is itself lazy 39ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers triage > triage keeps a low-severity deferral exempt
AssertionError: expected [ [ '701-low-finding', 'Lazy' ] ] to deeply equal [ [ '701-low-finding', 'Exempt' ] ]

- Expected
+ Received

  [
    [
      "701-low-finding",
-     "Exempt",
+     "Lazy",
    ],
  ]

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:1387:90
    1385|     const res = await triage(r);
    1386|     expect(res.code).toBe(0);
    1387|     expect(res.json.rows.map((x: { key: string; bucket: string }) => […
       |                                                                                          ^
    1388|       ["701-low-finding", "Exempt"],
    1389|     ]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers triage > triage marks an unjustified deferral lazy
AssertionError: expected { fid: '701-engine-work-build', …(4) } to match object { total: 1, written: 1 }
(3 matching properties omitted from actual)

- Expected
+ Received

  {
    "total": 1,
-   "written": 1,
+   "written": 0,
  }

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:1397:22
    1395|     const res = await triage(r);
    1396|     expect(res.code).toBe(0);
    1397|     expect(res.json).toMatchObject({ total: 1, written: 1 });
       |                      ^
    1398|     expect(res.json.rows).toHaveLength(1);
    1399|     expect(res.json.rows[0]).toMatchObject({ key: "701-deferred-guard"…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers triage > triage writes an unjustified row with a minted ts
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:1411:30
    1409|     const r = triageRepo([deferral()]);
    1410|     const res = await triage(r);
    1411|     expect(res.json.written).toBe(1);
       |                              ^
    1412|     const wrote = lines(r);
    1413|     expect(wrote).toHaveLength(2);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers triage > triage ignores another feature's deferral rows
AssertionError: expected [ '701-deferred-guard', …(1) ] to deeply equal [ '701-deferred-guard' ]

- Expected
+ Received

  [
    "701-deferred-guard",
+   "702-other-guard",
  ]

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:1433:62
    1431|     ]);
    1432|     const res = await triage(r);
    1433|     expect(res.json.rows.map((x: { key: string }) => x.key)).toEqual([…
       |                                                              ^
    1434|     expect(lines(r).map((x) => x["key"])).toEqual([
    1435|       "701-deferred-guard",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers triage > triage writes nothing when the FID has no deferral row
AssertionError: expected { fid: '701-engine-work-build', …(4) } to match object { rows: [], total: +0, written: +0 }
(2 matching properties omitted from actual)

- Expected
+ Received

  {
-   "rows": [],
-   "total": 0,
+   "rows": [
+     {
+       "bucket": "Lazy",
+       "key": "702-other-guard",
+       "tests": [],
+       "written": false,
+     },
+   ],
+   "total": 1,
    "written": 0,
  }

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:1445:22
    1443|     const res = await triage(r);
    1444|     expect(res.code).toBe(0);
    1445|     expect(res.json).toMatchObject({ rows: [], total: 0, written: 0 });
       |                      ^
    1446|     expect(lines(r)).toHaveLength(1);
    1447|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers triage > triage marks a scope-declared row whose only declaration is itself lazy
AssertionError: expected [ …(2) ] to deeply equal [ …(2) ]

- Expected
+ Received

@@ -3,8 +3,8 @@
      "701-own-declaration",
      "Lazy",
    ],
    [
      "701-declared",
-     "Exempt",
+     "Lazy",
    ],
  ]

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:1455:90
    1453|     ]);
    1454|     const res = await triage(r);
    1455|     expect(res.json.rows.map((x: { key: string; bucket: string }) => […
       |                                                                                          ^
    1456|       ["701-own-declaration", "Lazy"],
    1457|       ["701-declared", "Exempt"],

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/6]⎯


 Test Files  1 failed (1)
      Tests  6 failed | 73 passed (79)
   Start at  23:46:52
   Duration  5.03s (tests 98%, transform 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-445Mti/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
