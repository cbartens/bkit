Enforced: true
Red: 3
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/1035-ledger-commit-outbox-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/commands/lib.test.ts` "writeInvocation creates invocation-context owner-only" | red | failure: expected 493 to be 448 // Object.is equality |
| 4 | `.bkit/core/engine/commands/lib.test.ts` "writeInvocation narrows an existing invocation-context to 0700" | red | failure: expected 493 to be 448 // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a correction-events file left at 0644 is 0600 after a corrected append" | red | failure: expected 420 to be 384 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/lib.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1035-ledger-commit-outbox
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/lib.test.ts

```

## Runner output — `.bkit/core/engine/commands/lib.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1035-ledger-commit-outbox
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/lib.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1035-ledger-commit-outbox

 ❯ .bkit/core/engine/commands/lib.test.ts (78 tests | 2 failed) 2875ms
   ✓ parseFlags (20)
     ✓ accepts --flag=value and --flag value, camelCases kebab names 2ms
     ✓ collects repeatable flags and sets booleans 0ms
     ✓ ["--fid=1","--nope=x"] is a usage error 0ms
     ✓ ["--verify-attempt=1"] is a usage error 0ms
     ✓ ["--fid=1","--fid=2"] is a usage error 0ms
     ✓ ["--fid"] is a usage error 0ms
     ✓ ["--fid","--dry-run"] is a usage error 0ms
     ✓ ["--fid=1","--dry-run=yes"] is a usage error 0ms
     ✓ ["467"] is a usage error 0ms
     ✓ ["--fid="] is a usage error 0ms
     ✓ ["--fid",""] is a usage error 0ms
     ✓ rejects an empty entry of a required repeatable flag 0ms
     ✓ keeps an empty value for an optional string flag 0ms
     ✓ fills a positional flag from one bare argument, and only once 0ms
     ✓ fills keys in argv order 0ms
     ✓ refuses a literal workflow placeholder in ["--fid={FID}"] (exit 2) 0ms
     ✓ refuses a literal workflow placeholder in ["--fid=1","--artifact=docs/plans/{YYYYMM}/x.md"] (exit 2) 0ms
     ✓ refuses a literal workflow placeholder in ["--fid","{LOCK_TOKEN}"] (exit 2) 0ms
     ✓ refuses a placeholder in a positional argument 0ms
     ✓ lets through braces that are not an upper-case placeholder 0ms
   ✓ runCommand (18)
     ✓ returns null for anything that is not a registered noun 0ms
     ✓ runs a verb: text on stdout, tagged log on stderr 0ms
     ✓ prints one JSON object with --json 0ms
     ✓ leaves a verb's textOmit keys out of text and keeps them in --json 0ms
     ✓ passes the verb's own exit code through 0ms
     ✓ maps a usage error to exit 2 with a tagged message 0ms
     ✓ maps a CommandError to its code 0ms
     ✓ passes the command's exit code through when the journal write throws 0ms
     ✓ logs one [bkit-telemetry] line when the journal throws, however many writes fail 0ms
     ✓ hands the journal the failure only for an undeclared exit 1ms
     ✓ refuses a second JSON object 0ms
     ✓ prints noun help: exit 0 for --help, exit 2 for no verb 0ms
     ✓ rejects an unknown verb 0ms
     ✓ prints verb help without running the verb 0ms
     ✓ leaves a classic verb alone unless the second word is one of the command's verbs 0ms
     ✓ still answers `--help` for a noun that is also a classic verb 0ms
     ✓ takes the global --json flag on any verb, sets ctx.json and prints JSON 0ms
     ✓ refuses --json with a value 0ms
   ✓ --json on every registered command (3)
     ✓ no verb declares its own --json flag 0ms
     ✓ every verb's flag parsing accepts --json 2ms
     ✓ every verb's text output reads back as its --json output, less its textOmit keys 10ms
   ✓ help (3)
     ✓ noun help lists every verb and the shared exit codes 0ms
     ✓ verb help lists flags with required / repeatable, output keys, and own exit codes 0ms
     ✓ verb help marks the keys text output leaves out 0ms
   ✓ ghUnavailable (2)
     ✓ hands off when gh is missing, not logged in, or answered HTTP 403 0ms
     ✓ keeps every other failure, and any success, with gh 0ms
   ✓ utcMonth (1)
     ✓ uses UTC, not local time, at a month boundary 0ms
   ✓ SKIP_CI_TOKEN (9)
     ✓ matches [skip ci] 0ms
     ✓ matches [ci skip] 0ms
     ✓ matches [no ci] 0ms
     ✓ matches [skip actions] 0ms
     ✓ matches [actions skip] 0ms
     ✓ matches [SKIP CI] 0ms
     ✓ does not match skip ci 0ms
     ✓ does not match [skip-ci] 0ms
     ✓ does not match [force full] 0ms
   ✓ repo facts on a real repository (4)
     ✓ repoRoot resolves the main checkout from inside a linked worktree 95ms
     ✓ repoRoot outside a repository is a usage error 9ms
     ✓ design / plan / build / debug: worktree copy when it exists, else the main checkout 89ms
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 106ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1302ms
     ✓ runGit keeps output past Node's 1MB default 48ms
     ✓ runGit names ENOBUFS when output passes the limit 393ms
     ✓ runGit names a spawn error instead of failing silently 2ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 378ms
     ✓ runTool still reports a missing binary as not found 2ms
   ✓ resolveActiveRun (4)
     ✓ resolveActiveRun falls back to the cwd scan when --file names a non-status file 26ms
     ✓ still takes a status.jsonl --file as the run itself 18ms
     ✓ never files a --fid call under another feature's in-progress run 32ms
     ✓ finds a --fid run that started in an earlier month through the scan 41ms
   ✓ explicit invocation context (2)
     ✓ rejects stale cross-worktree invocation and conflicting overrides 163ms
     ✓ writes the engine-call row for an invocation-bound command 70ms
   ✓ bounded correction eligibility (1)
     ✓ exposes no-write correction eligibility only for declared pre-effect validation 1ms
   ✓ tests-lock status file (3)
     ✓ a lock wait is read from the status file and a reworded script sentence changes nothing 1ms
     ✓ a run stopped at the hold limit reads as could-not-run, never as a gate failure 0ms
     ✓ a status file for another lock or an empty one reads as a gate result 1ms
   ❯ writeInvocation folder mode (2)
     × writeInvocation creates invocation-context owner-only 41ms
     × writeInvocation narrows an existing invocation-context to 0700 34ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/lib.test.ts > writeInvocation folder mode > writeInvocation creates invocation-context owner-only
AssertionError: expected 493 to be 448 // Object.is equality

- Expected
+ Received

- 448
+ 493

 ❯ .bkit/core/engine/commands/lib.test.ts:1196:43
    1194|     writeInvocation(r, invocation(r));
    1195|     const dir = invocationDir(r) as string;
    1196|     expect(fs.statSync(dir).mode & 0o777).toBe(0o700);
       |                                           ^
    1197|   });
    1198|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/lib.test.ts > writeInvocation folder mode > writeInvocation narrows an existing invocation-context to 0700
AssertionError: expected 493 to be 448 // Object.is equality

- Expected
+ Received

- 448
+ 493

 ❯ .bkit/core/engine/commands/lib.test.ts:1206:43
    1204|     expect(fs.statSync(dir).mode & 0o777).toBe(0o755);
    1205|     writeInvocation(r, invocation(r));
    1206|     expect(fs.statSync(dir).mode & 0o777).toBe(0o700);
       |                                           ^
    1207|   });
    1208| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 76 passed (78)
   Start at  19:04:03
   Duration  3.19s (tests 93%, import 4%, transform 3%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-w1H1Zq/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

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

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts (126 tests | 1 failed) 15900ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (28)
     ✓ modified ledger under the FID logdir is staged and committed 212ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 191ms
     ✓ brand-new untracked ledger is staged and committed 174ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 173ms
     ✓ path containing a space is staged and committed 181ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 159ms
     ✓ staging failure: exit 4 and no commit is created, no false success 177ms
     ✓ a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit 221ms
     ✓ a --fid that climbs out of the log folder is refused and commits nothing 116ms
     ✓ a --month that is not six digits is refused and commits nothing 101ms
     ✓ a tracked *.bkit-lock that was removed is committed as a deletion by the bookkeeping commit 213ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 150ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 118ms
     ✓ --mode=stage stages the sweep but creates no commit 137ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 441ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 247ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 199ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 105ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 106ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 109ms
     ✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 29ms
     ✓ usage error ["--scope=core","--mode=push","--message=m"] exits 2 30ms
     ✓ usage error ["--scope=core","--mode=commit"] exits 2 31ms
     ✓ root that is not a directory or not a repo exits 3 7ms
     ✓ --root defaults to the working directory 133ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 244ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 226ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 222ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 203ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 130ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 76ms
     ✓ a path outside the checkout exits 6 with nothing committed 106ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 141ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 96ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 313ms
     ✓ --path records its commit on the run's record, like every other commit mode 286ms
     ✓ a recorded ledger commits only the rows the run appended 466ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 562ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 472ms
     ✓ commitBookkeeping refuses when a recorded path changed 273ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 325ms
     ✓ under --mode=commit counts the squashed paths as something to commit 313ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 212ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 130ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 190ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 149ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 107ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 91ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 94ms
     ✓ carries untracked ledgers too 91ms
     ✓ keeps rows on separate lines when the destination has no final newline 103ms
     ✓ src that is not a git repo exits 3 9ms
   ✓ bkit ledgers only-bookkeeping (7)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 217ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 246ms
     ✓ a source file in the range: exit 7, path listed 204ms
     ✓ only-bookkeeping refuses a wildcard or climbing --fid instead of passing a source change 132ms
     ✓ another FID's plan file in the range: exit 7 185ms
     ✓ from not an ancestor of to: exit 7 168ms
     ✓ unknown commit exits 3; a missing flag exits 2 123ms
   ✓ bookPathspecs (2)
     ✓ grows core -> full -> pr 0ms
     ✓ appends the repo's extra bookkeeping paths as :(glob) pathspecs under pr only 0ms
   ✓ bookPathspecs — frozen bookkeeping allow-list (1)
     ✓ scope=pr reaches every frozen entry, the FID log dir, and the docs/*.jsonl ledger glob 0ms
   ✓ bkit ledgers append (24)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 72ms
     ✓ append keeps a row's own repo 66ms
     ✓ append refuses a supplied ts 43ms
     ✓ append refuses a supplied schema or bkit 66ms
     ✓ append refuses a flat top-level field the top section moved into by 58ms
     ✓ append writes nothing when one row is invalid 53ms
     ✓ append refuses a row whose kind is not the ledger's 50ms
     ✓ append --ledger=stats takes compliance, counter and outcome rows 73ms
     ✓ append --ledger=stats refuses another kind, a non-closing writer, and a total that does not match its parts 83ms
     ✓ append bumps a round-second mint 65ms
     ✓ append refuses an empty rows file 38ms
     ✓ append refuses an unknown or issues ledger 42ms
     ✓ append refuses a writer not listed for the kind 105ms
     ✓ append starts a new line when the ledger lacks its final newline 61ms
     ✓ append creates the ledger and its directory 62ms
     ✓ append stamps a keyed row's first write firstTs = ts, updates = 1 63ms
     ✓ append carries firstTs forward and counts updates, across calls and within one batch 87ms
     ✓ append replaces a supplied firstTs / updates with the computed values 58ms
     ✓ append continues the count from a compacted winner 60ms
     ✓ append leaves rows outside the five keyed-ledger kinds without firstTs / updates 65ms
     ✓ append writes status OPEN on a friction row given none 63ms
     ✓ append writes status OPEN on a deferral row given none 62ms
     ✓ append writes status OPEN on a failure row given none 62ms
     ✓ append keeps a given status next to a defaulted one 60ms
   ✓ bkit ledgers compact (5)
     ✓ compacts every keyed ledger by default and reports per-ledger counts 46ms
     ✓ --ledger narrows the run to one ledger 9ms
     ✓ --dry-run counts without writing 10ms
     ✓ a second run changes nothing 18ms
     ✓ refuses an unknown --ledger with a usage error 0ms
   ✓ bkit ledgers check (4)
     ✓ passes when every key on the Ledger rows line has a decision or deferral row 1ms
     ✓ names the keys no row carries and exits EXIT_ROWS_MISSING 1ms
     ✓ passes on None 1ms
     ✓ refuses a plan with no Ledger rows line or an unfilled one 1ms
   ✓ bkit ledgers triage (11)
     ✓ triage keeps a low-severity deferral exempt 79ms
     ✓ triage keeps an own-cycle deferral exempt 90ms
     ✓ triage marks an unjustified deferral lazy 109ms
     ✓ triage writes an unjustified row with a minted ts 111ms
     ✓ triage writes no row for a closed deferral 84ms
     ✓ triage reports an adjudicated unjustified row outside exempt 79ms
     ✓ triage ignores another feature's deferral rows 111ms
     ✓ triage writes nothing when the FID has no deferral row 82ms
     ✓ triage refuses a plan with no task blocks 120ms
     ✓ triage refuses a plan whose task blocks do not parse 117ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 116ms
   ❯ bkit ledgers append --invocation (7)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 342ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 198ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 236ms
     ✓ lands a standalone corrected candidate and reports the spend 135ms
     ✓ the correction-events file has mode 0600 148ms
     × a correction-events file left at 0644 is 0600 after a corrected append 151ms
     ✓ issues the same operation for rows whose keys are reordered 141ms
   ✓ bkit ledgers query (4)
     ✓ pages canonical winners with diagnostics and rejects stale cursors 34ms
     ✓ query --status=OPEN returns a deferral winner that has no status, printed as stored 33ms
     ✓ a negative --cursor offset is refused 33ms
     ✓ marks a page with a next cursor as not clean 33ms
   ✓ bkit ledgers append --operation (6)
     ✓ returns durable append receipt and permits a deliberate same-key update 103ms
     ✓ a replayed operation whose rows are gone is not reported as recorded 71ms
     ✓ a replayed operation whose rows a rebase moved is still reported as recorded 66ms
     ✓ a replayed operation whose rows are gone says it was recorded and must not be retried under a new id 64ms
     ✓ keeps ledger operation intents and receipts out of committed book paths 237ms
     ✓ refuses --issue-operation without an invocation or beside --operation, writing nothing 57ms
   ✓ parked run commits (3)
     ✓ round-trips the record's start, commits and pushed list for its workflow 121ms
     ✓ reads null for a missing file, another workflow, an unreadable file and a bad fid 151ms
     ✓ is invisible to the record listing and removes by fid 168ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers append --invocation > a correction-events file left at 0644 is 0600 after a corrected append
AssertionError: expected 420 to be 384 // Object.is equality

- Expected
+ Received

- 384
+ 420

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:2316:46
    2314|     expect(fixed.code).toBe(0);
    2315|     expect(fixed.json.correction).toMatchObject({ used: 1 });
    2316|     expect(fs.statSync(events).mode & 0o777).toBe(0o600);
       |                                              ^
    2317|   });
    2318|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 125 passed (126)
   Start at  19:04:08
   Duration  16.23s (tests 99%, import 1%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-wUdmGW/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
