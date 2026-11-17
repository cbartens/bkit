Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/992-ledger-commands-six-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 5 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a replayed operation whose rows a rebase moved is still reported as recorded" | red | failure: expected 4 to be +0 // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a replayed operation whose rows are gone says it was recorded and must not be retried under a new id" | red | failure: expected '[bkit-ledgers] operation op-gone has …' to contain 'recorded earlier' |

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

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts (116 tests | 2 failed) 9100ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (25)
     ✓ modified ledger under the FID logdir is staged and committed 137ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 115ms
     ✓ brand-new untracked ledger is staged and committed 105ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 105ms
     ✓ path containing a space is staged and committed 101ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 96ms
     ✓ staging failure: exit 4 and no commit is created, no false success 86ms
     ✓ a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit 120ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 89ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 77ms
     ✓ --mode=stage stages the sweep but creates no commit 98ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 281ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 150ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 133ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 76ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 77ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 75ms
     ✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 23ms
     ✓ usage error ["--scope=core","--mode=push","--message=m"] exits 2 23ms
     ✓ usage error ["--scope=core","--mode=commit"] exits 2 32ms
     ✓ root that is not a directory or not a repo exits 3 6ms
     ✓ --root defaults to the working directory 85ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 137ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 132ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 122ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 118ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 82ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 48ms
     ✓ a path outside the checkout exits 6 with nothing committed 70ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 90ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 56ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 202ms
     ✓ --path records its commit on the run's record, like every other commit mode 177ms
     ✓ a recorded ledger commits only the rows the run appended 262ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 324ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 269ms
     ✓ commitBookkeeping refuses when a recorded path changed 152ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 188ms
     ✓ under --mode=commit counts the squashed paths as something to commit 185ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 122ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 79ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 115ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 83ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 65ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 55ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 56ms
     ✓ carries untracked ledgers too 54ms
     ✓ keeps rows on separate lines when the destination has no final newline 61ms
     ✓ src that is not a git repo exits 3 6ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 121ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 160ms
     ✓ a source file in the range: exit 7, path listed 127ms
     ✓ another FID's plan file in the range: exit 7 116ms
     ✓ from not an ancestor of to: exit 7 101ms
     ✓ unknown commit exits 3; a missing flag exits 2 69ms
   ✓ bookPathspecs (2)
     ✓ grows core -> full -> pr 0ms
     ✓ appends the repo's extra bookkeeping paths as :(glob) pathspecs under pr only 0ms
   ✓ bookPathspecs — frozen bookkeeping allow-list (1)
     ✓ scope=pr reaches every frozen entry, the FID log dir, and the docs/*.jsonl ledger glob 0ms
   ✓ bkit ledgers append (20)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 44ms
     ✓ append keeps a row's own repo 40ms
     ✓ append refuses a supplied ts 30ms
     ✓ append refuses a supplied schema or bkit 39ms
     ✓ append refuses a flat top-level field the top section moved into by 34ms
     ✓ append writes nothing when one row is invalid 34ms
     ✓ append refuses a row whose kind is not the ledger's 28ms
     ✓ append --ledger=stats takes compliance, counter and outcome rows 44ms
     ✓ append --ledger=stats refuses another kind, a non-closing writer, and a total that does not match its parts 55ms
     ✓ append bumps a round-second mint 42ms
     ✓ append refuses an empty rows file 23ms
     ✓ append refuses an unknown or issues ledger 22ms
     ✓ append refuses a writer not listed for the kind 65ms
     ✓ append starts a new line when the ledger lacks its final newline 41ms
     ✓ append creates the ledger and its directory 41ms
     ✓ append stamps a keyed row's first write firstTs = ts, updates = 1 41ms
     ✓ append carries firstTs forward and counts updates, across calls and within one batch 59ms
     ✓ append replaces a supplied firstTs / updates with the computed values 42ms
     ✓ append continues the count from a compacted winner 39ms
     ✓ append leaves rows outside the five keyed-ledger kinds without firstTs / updates 40ms
   ✓ bkit ledgers compact (5)
     ✓ compacts every keyed ledger by default and reports per-ledger counts 28ms
     ✓ --ledger narrows the run to one ledger 7ms
     ✓ --dry-run counts without writing 6ms
     ✓ a second run changes nothing 12ms
     ✓ refuses an unknown --ledger with a usage error 0ms
   ✓ bkit ledgers check (4)
     ✓ passes when every key on the Ledger rows line has a decision or deferral row 1ms
     ✓ names the keys no row carries and exits EXIT_ROWS_MISSING 1ms
     ✓ passes on None 1ms
     ✓ refuses a plan with no Ledger rows line or an unfilled one 1ms
   ✓ bkit ledgers triage (11)
     ✓ triage keeps a low-severity deferral exempt 49ms
     ✓ triage keeps an own-cycle deferral exempt 47ms
     ✓ triage marks an unjustified deferral lazy 74ms
     ✓ triage writes an unjustified row with a minted ts 63ms
     ✓ triage writes no row for a closed deferral 48ms
     ✓ triage reports an adjudicated unjustified row outside exempt 48ms
     ✓ triage ignores another feature's deferral rows 67ms
     ✓ triage writes nothing when the FID has no deferral row 49ms
     ✓ triage refuses a plan with no task blocks 76ms
     ✓ triage refuses a plan whose task blocks do not parse 69ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 62ms
   ✓ bkit ledgers append --invocation (6)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 206ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 127ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 154ms
     ✓ lands a standalone corrected candidate and reports the spend 98ms
     ✓ the correction-events file has mode 0600 94ms
     ✓ issues the same operation for rows whose keys are reordered 97ms
   ✓ bkit ledgers query (3)
     ✓ pages canonical winners with diagnostics and rejects stale cursors 24ms
     ✓ a negative --cursor offset is refused 22ms
     ✓ marks a page with a next cursor as not clean 22ms
   ❯ bkit ledgers append --operation (6)
     ✓ returns durable append receipt and permits a deliberate same-key update 71ms
     ✓ a replayed operation whose rows are gone is not reported as recorded 48ms
     × a replayed operation whose rows a rebase moved is still reported as recorded 50ms
     × a replayed operation whose rows are gone says it was recorded and must not be retried under a new id 48ms
     ✓ keeps ledger operation intents and receipts out of committed book paths 148ms
     ✓ refuses --issue-operation without an invocation or beside --operation, writing nothing 35ms
   ✓ parked run commits (3)
     ✓ round-trips the record's start, commits and pushed list for its workflow 75ms
     ✓ reads null for a missing file, another workflow, an unreadable file and a bad fid 86ms
     ✓ is invisible to the record listing and removes by fid 90ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers append --operation > a replayed operation whose rows a rebase moved is still reported as recorded
AssertionError: expected 4 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 4

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:2390:25
    2388|
    2389|     const replay = await appendOp(r, [failure()], "op-1");
    2390|     expect(replay.code).toBe(0);
       |                         ^
    2391|     expect(replay.json.receipt).toMatchObject({ operation: "op-1", rep…
    2392|     expect(replay.json.appended).toBe(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers append --operation > a replayed operation whose rows are gone says it was recorded and must not be retried under a new id
AssertionError: expected '[bkit-ledgers] operation op-gone has …' to contain 'recorded earlier'

- Expected
+ Received

- recorded earlier
+ [bkit-ledgers] operation op-gone has a receipt, but docs/failures.jsonl no longer holds its rows; nothing recorded
+

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:2406:24
    2404|     expect(replay.code).not.toBe(0);
    2405|     expect(replay.err).toContain("op-gone");
    2406|     expect(replay.err).toContain("recorded earlier");
       |                        ^
    2407|     expect(replay.err).toContain("new operation id");
    2408|     expect(replay.err).not.toContain("nothing recorded");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 114 passed (116)
   Start at  06:27:38
   Duration  9.30s (tests 98%, import 1%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-OvRlVG/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
