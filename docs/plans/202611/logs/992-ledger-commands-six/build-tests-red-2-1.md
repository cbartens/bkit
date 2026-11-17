Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/992-ledger-commands-six-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 3 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "the correction-events file has mode 0600" | red | failure: expected 420 to be 384 // Object.is equality |
| 4 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit" | red | failure: expected 'docs/plans/202608/logs/446l/status.js…' not to contain 'status.jsonl.bkit-lock' |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/ledgers.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/992-ledger-commands-six
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/ledgers.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/ledgers.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/992-ledger-commands-six
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/ledgers.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/992-ledger-commands-six

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts (114 tests | 2 failed) 8990ms
   ❯ bkit ledgers commit (tests/book-commit.bats) (25)
     ✓ modified ledger under the FID logdir is staged and committed 136ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 117ms
     ✓ brand-new untracked ledger is staged and committed 108ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 105ms
     ✓ path containing a space is staged and committed 105ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 95ms
     ✓ staging failure: exit 4 and no commit is created, no false success 88ms
     × a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit 118ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 93ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 79ms
     ✓ --mode=stage stages the sweep but creates no commit 94ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 281ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 149ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 134ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 76ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 77ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 79ms
     ✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 22ms
     ✓ usage error ["--scope=core","--mode=push","--message=m"] exits 2 23ms
     ✓ usage error ["--scope=core","--mode=commit"] exits 2 23ms
     ✓ root that is not a directory or not a repo exits 3 6ms
     ✓ --root defaults to the working directory 86ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 138ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 132ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 125ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 117ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 81ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 46ms
     ✓ a path outside the checkout exits 6 with nothing committed 63ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 90ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 56ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 186ms
     ✓ --path records its commit on the run's record, like every other commit mode 174ms
     ✓ a recorded ledger commits only the rows the run appended 265ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 316ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 267ms
     ✓ commitBookkeeping refuses when a recorded path changed 152ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 190ms
     ✓ under --mode=commit counts the squashed paths as something to commit 183ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 121ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 80ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 117ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 86ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 67ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 55ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 57ms
     ✓ carries untracked ledgers too 57ms
     ✓ keeps rows on separate lines when the destination has no final newline 63ms
     ✓ src that is not a git repo exits 3 6ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 119ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 157ms
     ✓ a source file in the range: exit 7, path listed 115ms
     ✓ another FID's plan file in the range: exit 7 121ms
     ✓ from not an ancestor of to: exit 7 102ms
     ✓ unknown commit exits 3; a missing flag exits 2 70ms
   ✓ bookPathspecs (2)
     ✓ grows core -> full -> pr 0ms
     ✓ appends the repo's extra bookkeeping paths as :(glob) pathspecs under pr only 0ms
   ✓ bookPathspecs — frozen bookkeeping allow-list (1)
     ✓ scope=pr reaches every frozen entry, the FID log dir, and the docs/*.jsonl ledger glob 0ms
   ✓ bkit ledgers append (20)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 50ms
     ✓ append keeps a row's own repo 39ms
     ✓ append refuses a supplied ts 29ms
     ✓ append refuses a supplied schema or bkit 40ms
     ✓ append refuses a flat top-level field the top section moved into by 34ms
     ✓ append writes nothing when one row is invalid 35ms
     ✓ append refuses a row whose kind is not the ledger's 29ms
     ✓ append --ledger=stats takes compliance, counter and outcome rows 44ms
     ✓ append --ledger=stats refuses another kind, a non-closing writer, and a total that does not match its parts 51ms
     ✓ append bumps a round-second mint 39ms
     ✓ append refuses an empty rows file 23ms
     ✓ append refuses an unknown or issues ledger 22ms
     ✓ append refuses a writer not listed for the kind 67ms
     ✓ append starts a new line when the ledger lacks its final newline 41ms
     ✓ append creates the ledger and its directory 41ms
     ✓ append stamps a keyed row's first write firstTs = ts, updates = 1 41ms
     ✓ append carries firstTs forward and counts updates, across calls and within one batch 55ms
     ✓ append replaces a supplied firstTs / updates with the computed values 40ms
     ✓ append continues the count from a compacted winner 38ms
     ✓ append leaves rows outside the five keyed-ledger kinds without firstTs / updates 40ms
   ✓ bkit ledgers compact (5)
     ✓ compacts every keyed ledger by default and reports per-ledger counts 28ms
     ✓ --ledger narrows the run to one ledger 6ms
     ✓ --dry-run counts without writing 6ms
     ✓ a second run changes nothing 11ms
     ✓ refuses an unknown --ledger with a usage error 0ms
   ✓ bkit ledgers check (4)
     ✓ passes when every key on the Ledger rows line has a decision or deferral row 1ms
     ✓ names the keys no row carries and exits EXIT_ROWS_MISSING 1ms
     ✓ passes on None 1ms
     ✓ refuses a plan with no Ledger rows line or an unfilled one 1ms
   ✓ bkit ledgers triage (11)
     ✓ triage keeps a low-severity deferral exempt 51ms
     ✓ triage keeps an own-cycle deferral exempt 52ms
     ✓ triage marks an unjustified deferral lazy 67ms
     ✓ triage writes an unjustified row with a minted ts 64ms
     ✓ triage writes no row for a closed deferral 49ms
     ✓ triage reports an adjudicated unjustified row outside exempt 48ms
     ✓ triage ignores another feature's deferral rows 63ms
     ✓ triage writes nothing when the FID has no deferral row 49ms
     ✓ triage refuses a plan with no task blocks 72ms
     ✓ triage refuses a plan whose task blocks do not parse 71ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 67ms
   ❯ bkit ledgers append --invocation (6)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 204ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 128ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 155ms
     ✓ lands a standalone corrected candidate and reports the spend 97ms
     × the correction-events file has mode 0600 99ms
     ✓ issues the same operation for rows whose keys are reordered 98ms
   ✓ bkit ledgers query (3)
     ✓ pages canonical winners with diagnostics and rejects stale cursors 24ms
     ✓ a negative --cursor offset is refused 23ms
     ✓ marks a page with a next cursor as not clean 23ms
   ✓ bkit ledgers append --operation (4)
     ✓ returns durable append receipt and permits a deliberate same-key update 73ms
     ✓ a replayed operation whose rows are gone is not reported as recorded 48ms
     ✓ keeps ledger operation intents and receipts out of committed book paths 153ms
     ✓ refuses --issue-operation without an invocation or beside --operation, writing nothing 35ms
   ✓ parked run commits (3)
     ✓ round-trips the record's start, commits and pushed list for its workflow 77ms
     ✓ reads null for a missing file, another workflow, an unreadable file and a bad fid 87ms
     ✓ is invisible to the record listing and removes by fid 92ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers commit (tests/book-commit.bats) > a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit
AssertionError: expected 'docs/plans/202608/logs/446l/status.js…' not to contain 'status.jsonl.bkit-lock'

- Expected
+ Received

- status.jsonl.bkit-lock
+ docs/plans/202608/logs/446l/status.jsonl
+ docs/plans/202608/logs/446l/status.jsonl.bkit-lock

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:253:23
    251|     const files = git(r, "show", "--name-only", "--format=", "HEAD");
    252|     expect(files).toContain("status.jsonl");
    253|     expect(files).not.toContain("status.jsonl.bkit-lock");
       |                       ^
    254|     expect(git(r, "ls-files", "--", "*.bkit-lock")).toBe("");
    255|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers append --invocation > the correction-events file has mode 0600
AssertionError: expected 420 to be 384 // Object.is equality

- Expected
+ Received

- 384
+ 420

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:2139:46
    2137|     const events = path.join(r, ".git/bkit-outbox/invocation-context",…
    2138|     expect(fs.existsSync(events)).toBe(true);
    2139|     expect(fs.statSync(events).mode & 0o777).toBe(0o600);
       |                                              ^
    2140|   });
    2141|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 112 passed (114)
   Start at  23:02:18
   Duration  9.17s (tests 99%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-fouiDx/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
