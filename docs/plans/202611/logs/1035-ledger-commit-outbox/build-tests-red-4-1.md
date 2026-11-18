Enforced: true
Red: 3
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 1

Plan: `docs/plans/202611/1035-ledger-commit-outbox-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 7 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a recorded tracked lock deleted during an in-place run does not refuse the bookkeeping commit" | red | failure: expected 10 to be +0 // Object.is equality |
| 8 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "checkOnlyBookkeeping refuses a climbing fid from any caller" | red | failure: expected a CommandError, got a return value |
| 8 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "commitBookkeeping refuses a climbing fid from any caller" | red | failure: expected a CommandError, got a return value |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/ledgers.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1035-ledger-commit-outbox
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/ledgers.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/ledgers.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1035-ledger-commit-outbox
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/ledgers.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1035-ledger-commit-outbox

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts (129 tests | 3 failed) 23459ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (28)
     ✓ modified ledger under the FID logdir is staged and committed 429ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 381ms
     ✓ brand-new untracked ledger is staged and committed 356ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 365ms
     ✓ path containing a space is staged and committed 352ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 310ms
     ✓ staging failure: exit 4 and no commit is created, no false success 277ms
     ✓ a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit 369ms
     ✓ a --fid that climbs out of the log folder is refused and commits nothing 217ms
     ✓ a --month that is not six digits is refused and commits nothing 176ms
     ✓ a tracked *.bkit-lock that was removed is committed as a deletion by the bookkeeping commit 301ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 212ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 177ms
     ✓ --mode=stage stages the sweep but creates no commit 211ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 755ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 346ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 303ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 166ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 171ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 182ms
     ✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 50ms
     ✓ usage error ["--scope=core","--mode=push","--message=m"] exits 2 46ms
     ✓ usage error ["--scope=core","--mode=commit"] exits 2 48ms
     ✓ root that is not a directory or not a repo exits 3 12ms
     ✓ --root defaults to the working directory 200ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 319ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 305ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 278ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 270ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 180ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 103ms
     ✓ a path outside the checkout exits 6 with nothing committed 135ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 189ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 122ms
   ❯ bkit ledgers commit — a run in place on dev that shares its checkout (7)
     ✓ stageTrackedUpdates skips recorded paths 419ms
     ✓ --path records its commit on the run's record, like every other commit mode 387ms
     ✓ a recorded ledger commits only the rows the run appended 585ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 708ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 588ms
     ✓ commitBookkeeping refuses when a recorded path changed 328ms
     × a recorded tracked lock deleted during an in-place run does not refuse the bookkeeping commit 295ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 431ms
     ✓ under --mode=commit counts the squashed paths as something to commit 427ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 262ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 177ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 266ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 192ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 155ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 119ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 120ms
     ✓ carries untracked ledgers too 132ms
     ✓ keeps rows on separate lines when the destination has no final newline 144ms
     ✓ src that is not a git repo exits 3 12ms
   ✓ bkit ledgers only-bookkeeping (7)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 254ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 326ms
     ✓ a source file in the range: exit 7, path listed 237ms
     ✓ only-bookkeeping refuses a wildcard or climbing --fid instead of passing a source change 174ms
     ✓ another FID's plan file in the range: exit 7 266ms
     ✓ from not an ancestor of to: exit 7 215ms
     ✓ unknown commit exits 3; a missing flag exits 2 139ms
   ✓ bookPathspecs (2)
     ✓ grows core -> full -> pr 0ms
     ✓ appends the repo's extra bookkeeping paths as :(glob) pathspecs under pr only 0ms
   ✓ bookPathspecs — frozen bookkeeping allow-list (1)
     ✓ scope=pr reaches every frozen entry, the FID log dir, and the docs/*.jsonl ledger glob 0ms
   ✓ bkit ledgers append (24)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 105ms
     ✓ append keeps a row's own repo 83ms
     ✓ append refuses a supplied ts 62ms
     ✓ append refuses a supplied schema or bkit 82ms
     ✓ append refuses a flat top-level field the top section moved into by 73ms
     ✓ append writes nothing when one row is invalid 71ms
     ✓ append refuses a row whose kind is not the ledger's 62ms
     ✓ append --ledger=stats takes compliance, counter and outcome rows 89ms
     ✓ append --ledger=stats refuses another kind, a non-closing writer, and a total that does not match its parts 111ms
     ✓ append bumps a round-second mint 81ms
     ✓ append refuses an empty rows file 47ms
     ✓ append refuses an unknown or issues ledger 50ms
     ✓ append refuses a writer not listed for the kind 134ms
     ✓ append starts a new line when the ledger lacks its final newline 89ms
     ✓ append creates the ledger and its directory 84ms
     ✓ append stamps a keyed row's first write firstTs = ts, updates = 1 81ms
     ✓ append carries firstTs forward and counts updates, across calls and within one batch 114ms
     ✓ append replaces a supplied firstTs / updates with the computed values 81ms
     ✓ append continues the count from a compacted winner 81ms
     ✓ append leaves rows outside the five keyed-ledger kinds without firstTs / updates 84ms
     ✓ append writes status OPEN on a friction row given none 82ms
     ✓ append writes status OPEN on a deferral row given none 80ms
     ✓ append writes status OPEN on a failure row given none 79ms
     ✓ append keeps a given status next to a defaulted one 81ms
   ✓ bkit ledgers compact (5)
     ✓ compacts every keyed ledger by default and reports per-ledger counts 63ms
     ✓ --ledger narrows the run to one ledger 14ms
     ✓ --dry-run counts without writing 13ms
     ✓ a second run changes nothing 26ms
     ✓ refuses an unknown --ledger with a usage error 1ms
   ✓ bkit ledgers check (4)
     ✓ passes when every key on the Ledger rows line has a decision or deferral row 2ms
     ✓ names the keys no row carries and exits EXIT_ROWS_MISSING 2ms
     ✓ passes on None 2ms
     ✓ refuses a plan with no Ledger rows line or an unfilled one 2ms
   ✓ bkit ledgers triage (11)
     ✓ triage keeps a low-severity deferral exempt 101ms
     ✓ triage keeps an own-cycle deferral exempt 108ms
     ✓ triage marks an unjustified deferral lazy 139ms
     ✓ triage writes an unjustified row with a minted ts 141ms
     ✓ triage writes no row for a closed deferral 99ms
     ✓ triage reports an adjudicated unjustified row outside exempt 108ms
     ✓ triage ignores another feature's deferral rows 141ms
     ✓ triage writes nothing when the FID has no deferral row 101ms
     ✓ triage refuses a plan with no task blocks 152ms
     ✓ triage refuses a plan whose task blocks do not parse 156ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 144ms
   ✓ bkit ledgers append --invocation (7)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 429ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 255ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 332ms
     ✓ lands a standalone corrected candidate and reports the spend 208ms
     ✓ the correction-events file has mode 0600 211ms
     ✓ a correction-events file left at 0644 is 0600 after a corrected append 247ms
     ✓ issues the same operation for rows whose keys are reordered 241ms
   ✓ bkit ledgers query (4)
     ✓ pages canonical winners with diagnostics and rejects stale cursors 59ms
     ✓ query --status=OPEN returns a deferral winner that has no status, printed as stored 52ms
     ✓ a negative --cursor offset is refused 58ms
     ✓ marks a page with a next cursor as not clean 44ms
   ✓ bkit ledgers append --operation (6)
     ✓ returns durable append receipt and permits a deliberate same-key update 196ms
     ✓ a replayed operation whose rows are gone is not reported as recorded 111ms
     ✓ a replayed operation whose rows a rebase moved is still reported as recorded 108ms
     ✓ a replayed operation whose rows are gone says it was recorded and must not be retried under a new id 102ms
     ✓ keeps ledger operation intents and receipts out of committed book paths 360ms
     ✓ refuses --issue-operation without an invocation or beside --operation, writing nothing 90ms
   ✓ parked run commits (3)
     ✓ round-trips the record's start, commits and pushed list for its workflow 191ms
     ✓ reads null for a missing file, another workflow, an unreadable file and a bad fid 221ms
     ✓ is invisible to the record listing and removes by fid 242ms
   ❯ the bookkeeping sinks check month and fid for every caller (2)
     × checkOnlyBookkeeping refuses a climbing fid from any caller 269ms
     × commitBookkeeping refuses a climbing fid from any caller 260ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers commit — a run in place on dev that shares its checkout > a recorded tracked lock deleted during an in-place run does not refuse the bookkeeping commit
AssertionError: expected 10 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 10

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:809:22
    807|     add(r, `${LOGS}/status.jsonl`, '{"more":1}\n');
    808|     const res = await run(r, commitArgs(r, ...base, "--mode=commit", "…
    809|     expect(res.code).toBe(0);
       |                      ^
    810|     const files = git(r, "show", "--name-only", "--format=", "HEAD");
    811|     expect(files).toContain(`${LOGS}/status.jsonl`);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > the bookkeeping sinks check month and fid for every caller > checkOnlyBookkeeping refuses a climbing fid from any caller
Error: expected a CommandError, got a return value
 ❯ refusal .bkit/core/engine/commands/workflow/ledgers.test.ts:2746:11
    2744|       throw e;
    2745|     }
    2746|     throw new Error("expected a CommandError, got a return value");
       |           ^
    2747|   }
    2748|
 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:2757:17

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > the bookkeeping sinks check month and fid for every caller > commitBookkeeping refuses a climbing fid from any caller
Error: expected a CommandError, got a return value
 ❯ refusal .bkit/core/engine/commands/workflow/ledgers.test.ts:2746:11
    2744|       throw e;
    2745|     }
    2746|     throw new Error("expected a CommandError, got a return value");
       |           ^
    2747|   }
    2748|
 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:2770:17

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 126 passed (129)
   Start at  20:34:05
   Duration  24.20s (tests 98%, transform 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-tFSZIf/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
