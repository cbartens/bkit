Enforced: true
Red: 5
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/1035-ledger-commit-outbox-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a --fid that climbs out of the log folder is refused and commits nothing" | red | failure: expected +0 to be 2 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a --month that is not six digits is refused and commits nothing" | red | failure: expected '[bkit-ledgers] --message is required …' to contain '--month' |
| 1 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "only-bookkeeping refuses a wildcard or climbing --fid instead of passing a source change" | red | failure: expected +0 to be 2 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "pending refuses a --fid that climbs out of the log folder and reads and writes nothing" | red | failure: expected +0 to be 2 // Object.is equality |
| 3 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a tracked *.bkit-lock that was removed is committed as a deletion by the bookkeeping commit" | red | failure: expected 'M\tdocs/plans/202608/logs/446l/status…' to match /^D\s+docs\/plans\/202608\/logs\…/plans\ |

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

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts (125 tests | 4 failed) 17681ms
   ❯ bkit ledgers commit (tests/book-commit.bats) (28)
     ✓ modified ledger under the FID logdir is staged and committed 219ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 189ms
     ✓ brand-new untracked ledger is staged and committed 175ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 156ms
     ✓ path containing a space is staged and committed 158ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 132ms
     ✓ staging failure: exit 4 and no commit is created, no false success 120ms
     ✓ a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit 168ms
     × a --fid that climbs out of the log folder is refused and commits nothing 152ms
     × a --month that is not six digits is refused and commits nothing 76ms
     × a tracked *.bkit-lock that was removed is committed as a deletion by the bookkeeping commit 162ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 124ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 116ms
     ✓ --mode=stage stages the sweep but creates no commit 134ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 403ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 205ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 190ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 118ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 110ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 113ms
     ✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 35ms
     ✓ usage error ["--scope=core","--mode=push","--message=m"] exits 2 31ms
     ✓ usage error ["--scope=core","--mode=commit"] exits 2 33ms
     ✓ root that is not a directory or not a repo exits 3 8ms
     ✓ --root defaults to the working directory 124ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 239ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 220ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 200ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 194ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 129ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 70ms
     ✓ a path outside the checkout exits 6 with nothing committed 102ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 133ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 91ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 279ms
     ✓ --path records its commit on the run's record, like every other commit mode 287ms
     ✓ a recorded ledger commits only the rows the run appended 439ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 518ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 425ms
     ✓ commitBookkeeping refuses when a recorded path changed 230ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 408ms
     ✓ under --mode=commit counts the squashed paths as something to commit 311ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 198ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 128ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 192ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 155ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 115ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 113ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 129ms
     ✓ carries untracked ledgers too 124ms
     ✓ keeps rows on separate lines when the destination has no final newline 189ms
     ✓ src that is not a git repo exits 3 17ms
   ❯ bkit ledgers only-bookkeeping (7)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 296ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 415ms
     ✓ a source file in the range: exit 7, path listed 262ms
     × only-bookkeeping refuses a wildcard or climbing --fid instead of passing a source change 287ms
     ✓ another FID's plan file in the range: exit 7 365ms
     ✓ from not an ancestor of to: exit 7 327ms
     ✓ unknown commit exits 3; a missing flag exits 2 160ms
   ✓ bookPathspecs (2)
     ✓ grows core -> full -> pr 0ms
     ✓ appends the repo's extra bookkeeping paths as :(glob) pathspecs under pr only 0ms
   ✓ bookPathspecs — frozen bookkeeping allow-list (1)
     ✓ scope=pr reaches every frozen entry, the FID log dir, and the docs/*.jsonl ledger glob 0ms
   ✓ bkit ledgers append (24)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 94ms
     ✓ append keeps a row's own repo 77ms
     ✓ append refuses a supplied ts 53ms
     ✓ append refuses a supplied schema or bkit 74ms
     ✓ append refuses a flat top-level field the top section moved into by 64ms
     ✓ append writes nothing when one row is invalid 61ms
     ✓ append refuses a row whose kind is not the ledger's 49ms
     ✓ append --ledger=stats takes compliance, counter and outcome rows 66ms
     ✓ append --ledger=stats refuses another kind, a non-closing writer, and a total that does not match its parts 87ms
     ✓ append bumps a round-second mint 66ms
     ✓ append refuses an empty rows file 38ms
     ✓ append refuses an unknown or issues ledger 38ms
     ✓ append refuses a writer not listed for the kind 99ms
     ✓ append starts a new line when the ledger lacks its final newline 68ms
     ✓ append creates the ledger and its directory 60ms
     ✓ append stamps a keyed row's first write firstTs = ts, updates = 1 64ms
     ✓ append carries firstTs forward and counts updates, across calls and within one batch 84ms
     ✓ append replaces a supplied firstTs / updates with the computed values 66ms
     ✓ append continues the count from a compacted winner 61ms
     ✓ append leaves rows outside the five keyed-ledger kinds without firstTs / updates 60ms
     ✓ append writes status OPEN on a friction row given none 59ms
     ✓ append writes status OPEN on a deferral row given none 57ms
     ✓ append writes status OPEN on a failure row given none 55ms
     ✓ append keeps a given status next to a defaulted one 55ms
   ✓ bkit ledgers compact (5)
     ✓ compacts every keyed ledger by default and reports per-ledger counts 41ms
     ✓ --ledger narrows the run to one ledger 10ms
     ✓ --dry-run counts without writing 8ms
     ✓ a second run changes nothing 17ms
     ✓ refuses an unknown --ledger with a usage error 1ms
   ✓ bkit ledgers check (4)
     ✓ passes when every key on the Ledger rows line has a decision or deferral row 2ms
     ✓ names the keys no row carries and exits EXIT_ROWS_MISSING 1ms
     ✓ passes on None 1ms
     ✓ refuses a plan with no Ledger rows line or an unfilled one 1ms
   ✓ bkit ledgers triage (11)
     ✓ triage keeps a low-severity deferral exempt 72ms
     ✓ triage keeps an own-cycle deferral exempt 71ms
     ✓ triage marks an unjustified deferral lazy 99ms
     ✓ triage writes an unjustified row with a minted ts 89ms
     ✓ triage writes no row for a closed deferral 72ms
     ✓ triage reports an adjudicated unjustified row outside exempt 70ms
     ✓ triage ignores another feature's deferral rows 96ms
     ✓ triage writes nothing when the FID has no deferral row 71ms
     ✓ triage refuses a plan with no task blocks 105ms
     ✓ triage refuses a plan whose task blocks do not parse 112ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 97ms
   ✓ bkit ledgers append --invocation (6)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 316ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 190ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 312ms
     ✓ lands a standalone corrected candidate and reports the spend 435ms
     ✓ the correction-events file has mode 0600 221ms
     ✓ issues the same operation for rows whose keys are reordered 239ms
   ✓ bkit ledgers query (4)
     ✓ pages canonical winners with diagnostics and rejects stale cursors 56ms
     ✓ query --status=OPEN returns a deferral winner that has no status, printed as stored 52ms
     ✓ a negative --cursor offset is refused 53ms
     ✓ marks a page with a next cursor as not clean 53ms
   ✓ bkit ledgers append --operation (6)
     ✓ returns durable append receipt and permits a deliberate same-key update 167ms
     ✓ a replayed operation whose rows are gone is not reported as recorded 126ms
     ✓ a replayed operation whose rows a rebase moved is still reported as recorded 145ms
     ✓ a replayed operation whose rows are gone says it was recorded and must not be retried under a new id 125ms
     ✓ keeps ledger operation intents and receipts out of committed book paths 390ms
     ✓ refuses --issue-operation without an invocation or beside --operation, writing nothing 75ms
   ✓ parked run commits (3)
     ✓ round-trips the record's start, commits and pushed list for its workflow 170ms
     ✓ reads null for a missing file, another workflow, an unreadable file and a bad fid 348ms
     ✓ is invisible to the record listing and removes by fid 413ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers commit (tests/book-commit.bats) > a --fid that climbs out of the log folder is refused and commits nothing
AssertionError: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:274:22
    272|       ),
    273|     );
    274|     expect(res.code).toBe(2);
       |                      ^
    275|     expect(res.err).toContain("--fid");
    276|     expect(head(r)).toBe(before);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers commit (tests/book-commit.bats) > a --month that is not six digits is refused and commits nothing
AssertionError: expected '[bkit-ledgers] --message is required …' to contain '--month'

- Expected
+ Received

- --month
+ [bkit-ledgers] --message is required for --mode=commit
+

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:291:21
    289|     );
    290|     expect(res.code).toBe(2);
    291|     expect(res.err).toContain("--month");
       |                     ^
    292|     expect(head(r)).toBe(before);
    293|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers commit (tests/book-commit.bats) > a tracked *.bkit-lock that was removed is committed as a deletion by the bookkeeping commit
AssertionError: expected 'M\tdocs/plans/202608/logs/446l/status…' to match /^D\s+docs\/plans\/202608\/logs\…/plans\

- Expected:
/^D\s+docs\/plans\/202608\/logs\/446l\/status\.jsonl\.bkit-lock$/m

+ Received:
"M	docs/plans/202608/logs/446l/status.jsonl"

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:315:19
    313|     expect(res.code).toBe(0);
    314|     const files = git(r, "show", "--name-status", "--format=", "HEAD");
    315|     expect(files).toMatch(/^D\s+docs\/plans\/202608\/logs\/446l\/statu…
       |                   ^
    316|     expect(git(r, "ls-files", "--", "*.bkit-lock")).toBe("");
    317|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers only-bookkeeping > only-bookkeeping refuses a wildcard or climbing --fid instead of passing a source change
AssertionError: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:1102:22
    1100|       `--to=${head(r)}`,
    1101|     ]);
    1102|     expect(res.code).toBe(2);
       |                      ^
    1103|     expect(res.err).toContain("--fid");
    1104|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 121 passed (125)
   Start at  16:57:44
   Duration  18.09s (tests 98%, import 1%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-QIVFW5/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/decisions.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1035-ledger-commit-outbox
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/decisions.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/decisions.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1035-ledger-commit-outbox
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/decisions.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1035-ledger-commit-outbox

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts (78 tests | 1 failed) 3002ms
   ✓ bkit decisions compose (40)
     ✓ writes the header, one item per question and the reply line 30ms
     ✓ compose letters every option and the recommended one 23ms
     ✓ composeItems still folds line breaks to one space 25ms
     ✓ refuses an item whose recommendation is not one of its options 26ms
     ✓ refuses an item with more options than letters 24ms
     ✓ round-trips the last lettered option through parseDecisionItems 26ms
     ✓ compose writes each option on its own line with its effect 25ms
     ✓ compose refuses an option without an effect 45ms
     ✓ compose writes the default effect for a bare fixed option name 24ms
     ✓ compose refuses an option name that contains a spaced dash 21ms
     ✓ compose writes a Default if unanswered line for each question 23ms
     ✓ compose writes Recommended: none for a hard blocker 22ms
     ✓ compose ends with the shared reply line 23ms
     ✓ compose offers one by one from three questions on, not for two 23ms
     ✓ --loop writes an effect for each loop option 22ms
     ✓ round-trips an item with effects through parseDecisionItems 21ms
     ✓ --loop adds the attempt line, the progress block and the loop question as Q1 23ms
     ✓ --loop letters the loop question's options and recommendation 22ms
     ✓ --loop=holistic counts only the rounds since the whole-feature check was last clean 24ms
     ✓ --loop=holistic names build holistic in the attempt line 22ms
     ✓ holistic limit pause prints the rounds run, never above max 23ms
     ✓ prints the holistic gate's failing tests per round for the holistic loop 23ms
     ✓ prints the group gate's failing tests per round for the verify loop 20ms
     ✓ --loop=verify with an uncounted group gate reads unknown 19ms
     ✓ --loop on an unknown trend recommends Try again without claiming progress 28ms
     ✓ --loop on an unknown trend says the limit is used up 27ms
     ✓ --loop=verify on an unknown trend below the limit does not say the limit is used up 19ms
     ✓ --loop states the engine's trendLine in Q1 20ms
     ✓ base check all with no items recommends Stop 22ms
     ✓ base check all with items recommends Decide 21ms
     ✓ base check all says a gate still red after resume comes from this branch 22ms
     ✓ base check all in adopt mode adds the merge sentence 45ms
     ✓ base check some names the split 21ms
     ✓ base check some with undetermined cases counts only the branch's as fixable 22ms
     ✓ base check none keeps the trend and names the branch 21ms
     ✓ base check unknown keeps the trend and says why 19ms
     ✓ Try again is offered for every base verdict 162ms
     ✓ base check prints how many failing tests are also red on base 41ms
     ✓ a missing or malformed base check is a usage error that names the problem 38ms
     ✓ --loop needs --file 23ms
   ✓ bkit decisions apply --by=rerun (5)
     ✓ records the re-run under Q1 and closes the file 26ms
     ✓ refuses a file without Gate: FAIL or not OPEN 25ms
     ✓ refuses a Gate: FAIL file whose Q1 is an item, not the loop question 33ms
     ✓ refuses a loop file with an undecided item question 27ms
     ✓ refuses a file whose only Gate: FAIL line is in an item body 26ms
   ✓ bkit decisions skip (7)
     ✓ decisions skip exits 0 when all five conditions hold 27ms
     ✓ decisions skip exits 1 and names the fact for a Gate: FAIL header 26ms
     ✓ decisions skip exits 1 when the Source changed header is missing 27ms
     ✓ decisions skip exits 1 when an item is not Accept 32ms
     ✓ decisions skip exits 1 when the loop question is not Decide 25ms
     ✓ decisions skip exits 1 for a pause that is not from verify or holistic 33ms
     ✓ decisions skip exits 2 for a missing file 38ms
   ✓ bkit decisions apply --by=headless (4)
     ✓ takes each recommendation: an Accept is assumed, Fix now is written as such 45ms
     ✓ leaves hard blockers for the owner and exits with the hard-blocker code 50ms
     ✓ apply --by=headless leaves a Recommended: none item for the owner 54ms
     ✓ labels the runtime from the main checkout's Cursor marker when run in a build worktree 164ms
   ✓ parseDecisionItems (11)
     ✓ parseDecisionItems keeps the bare option name, dropping the letter 1ms
     ✓ a decision file written before the letters still parses 0ms
     ✓ parseDecisionItems reads a lettered decision as the option its letter labels 1ms
     ✓ parseDecisionItems reads one option per line and drops each effect 0ms
     ✓ parseDecisionItems reads Recommended: none as a hard blocker 0ms
     ✓ a lettered decision in a per-line file reads as the option its letter labels 0ms
     ✓ a per-line option whose text holds a slash or a middle dot stays one option 0ms
     ✓ a file mixing both layouts parses each item in its own layout 0ms
     ✓ reads the task a Fix now item names on its Fix task line 0ms
     ✓ decisionHeader reads the header block only 1ms
     ✓ a lettered assumed Accept decision still reads as assumed 0ms
   ✓ applyRecommendations (3)
     ✓ a Try again loop answer settles the loop alone; the items wait for the next round 0ms
     ✓ a lettered recommendation still settles its item by name 0ms
     ✓ applyRecommendations reads a lettered Try again decision as the loop answer 1ms
   ❯ bkit decisions apply --by=owner and pending (8)
     ✓ pending lists each assumed Accept nobody confirmed 80ms
     ✓ --confirm writes the owner's decision row and the real Accept; --reject marks it rejected 204ms
     ✓ apply --by=owner --confirm confirms an assumed item in a per-line file 131ms
     ✓ refuses an item that is not an assumed Accept, or a call without one of --confirm / --reject 73ms
     ✓ --defer writes one needs-decision deferral per listed item, then lists none 438ms
     ✓ --defer letters the options in the deferral row 133ms
     × pending refuses a --fid that climbs out of the log folder and reads and writes nothing 80ms
     ✓ refuses a malformed --month 65ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=owner and pending > pending refuses a --fid that climbs out of the log folder and reads and writes nothing
AssertionError: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1701:20
    1699|       root,
    1700|     );
    1701|     expect(r.code).toBe(2);
       |                    ^
    1702|     expect(r.err).toContain("--fid");
    1703|     expect(r.json?.items).toBeUndefined();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 77 passed (78)
   Start at  16:58:04
   Duration  3.45s (tests 91%, import 5%, transform 4%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-V1mai1/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
