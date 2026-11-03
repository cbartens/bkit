
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/ledgers.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts (84 tests | 2 failed) 5898ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (23)
     ✓ modified ledger under the FID logdir is staged and committed 119ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 101ms
     ✓ brand-new untracked ledger is staged and committed 94ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 139ms
     ✓ path containing a space is staged and committed 87ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 78ms
     ✓ staging failure: exit 4 and no commit is created, no false success 73ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 77ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 66ms
     ✓ --mode=stage stages the sweep but creates no commit 78ms
     ✓ top-level docs/*.md is committed under scope=pr, not under scope=core or scope=full 222ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 119ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 67ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 64ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 66ms
     ✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 20ms
     ✓ usage error ["--scope=core","--mode=push","--message=m"] exits 2 20ms
     ✓ usage error ["--scope=core","--mode=commit"] exits 2 19ms
     ✓ root that is not a directory or not a repo exits 3 5ms
     ✓ --root defaults to the working directory 73ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 114ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 117ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 106ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 142ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 69ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 42ms
     ✓ a path outside the checkout exits 6 with nothing committed 51ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 76ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 48ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 156ms
     ✓ --path records its commit on the run's record, like every other commit mode 151ms
     ✓ a recorded ledger commits only the rows the run appended 220ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 255ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 223ms
     ✓ commitBookkeeping refuses when a recorded path changed 158ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 166ms
     ✓ under --mode=commit counts the squashed paths as something to commit 160ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 103ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 69ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 99ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 72ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 51ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 49ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 51ms
     ✓ carries untracked ledgers too 51ms
     ✓ keeps rows on separate lines when the destination has no final newline 51ms
     ✓ src that is not a git repo exits 3 5ms
   ✓ bkit ledgers only-bookkeeping (5)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 111ms
     ✓ a source file in the range: exit 7, path listed 102ms
     ✓ another FID's plan file in the range: exit 7 127ms
     ✓ from not an ancestor of to: exit 7 87ms
     ✓ unknown commit exits 3; a missing flag exits 2 61ms
   ✓ bookPathspecs (1)
     ✓ grows core -> full -> pr 0ms
   ✓ bookPathspecs — frozen bookkeeping allow-list (1)
     ✓ scope=pr reaches every frozen entry, the FID log dir, and the docs/*.jsonl ledger glob 0ms
   ✓ bkit ledgers append (15)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 27ms
     ✓ append keeps a row's own repo 27ms
     ✓ append refuses a supplied ts 23ms
     ✓ append refuses a supplied schema or bkit 27ms
     ✓ append refuses a flat top-level field the top section moved into by 61ms
     ✓ append writes nothing when one row is invalid 23ms
     ✓ append refuses a row whose kind is not the ledger's 18ms
     ✓ append --ledger=stats takes compliance, counter and outcome rows 22ms
     ✓ append --ledger=stats refuses another kind, a non-closing writer, and a total that does not match its parts 28ms
     ✓ append bumps a round-second mint 25ms
     ✓ append refuses an empty rows file 20ms
     ✓ append refuses an unknown or issues ledger 19ms
     ✓ append refuses a writer not listed for the kind 35ms
     ✓ append starts a new line when the ledger lacks its final newline 25ms
     ✓ append creates the ledger and its directory 25ms
   ✓ bkit ledgers check (4)
     ✓ passes when every key on the Ledger rows line has a decision or deferral row 1ms
     ✓ names the keys no row carries and exits EXIT_ROWS_MISSING 1ms
     ✓ passes on None 1ms
     ✓ refuses a plan with no Ledger rows line or an unfilled one 1ms
   ❯ bkit ledgers triage (11)
     ✓ triage keeps a low-severity deferral exempt 44ms
     ✓ triage keeps an own-cycle deferral exempt 42ms
     ✓ triage marks an unjustified deferral lazy 46ms
     ✓ triage writes an unjustified row with a minted ts 52ms
     ✓ triage writes no row for a closed deferral 45ms
     ✓ triage reports an adjudicated unjustified row outside exempt 44ms
     ✓ triage ignores another feature's deferral rows 50ms
     ✓ triage writes nothing when the FID has no deferral row 43ms
     × triage refuses a plan with no task blocks 67ms
     × triage refuses a plan whose task blocks do not parse 69ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 51ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers triage > triage refuses a plan with no task blocks
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:1512:22
    1510|     const before = lines(r);
    1511|     const res = await triage(r);
    1512|     expect(res.code).toBe(1);
       |                      ^
    1513|     expect(res.err).toContain(NO_MARKERS_REASON);
    1514|     expect(lines(r)).toEqual(before);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers triage > triage refuses a plan whose task blocks do not parse
AssertionError: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:1547:22
    1545|     const before = lines(r);
    1546|     const res = await triage(r);
    1547|     expect(res.code).toBe(2);
       |                      ^
    1548|     expect(res.err).toContain(`${PLAN_FILE}:13:`);
    1549|     expect(res.err).toContain("TASK 1 comes after TASK 2");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 82 passed (84)
   Start at  10:35:39
   Duration  6.20s (tests 96%, transform 3%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-byjRtG/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
