Enforced: true
Red: 3
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/992-ledger-commands-six-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a negative --cursor offset is refused" | red | failure: expected +0 to be 2 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a replayed operation whose rows are gone is not reported as recorded" | red | failure: expected +0 not to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/ledgers/status.test.ts` "the row block is stored once per operation" | red | failure: expected 2 to be 1 // Object.is equality |

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

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts (112 tests | 2 failed) 18537ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 283ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 287ms
     ✓ brand-new untracked ledger is staged and committed 204ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 190ms
     ✓ path containing a space is staged and committed 185ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 145ms
     ✓ staging failure: exit 4 and no commit is created, no false success 123ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 138ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 120ms
     ✓ --mode=stage stages the sweep but creates no commit 130ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 600ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 302ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 272ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 158ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 145ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 154ms
     ✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 53ms
     ✓ usage error ["--scope=core","--mode=push","--message=m"] exits 2 57ms
     ✓ usage error ["--scope=core","--mode=commit"] exits 2 60ms
     ✓ root that is not a directory or not a repo exits 3 19ms
     ✓ --root defaults to the working directory 171ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 237ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 228ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 223ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 227ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 180ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 158ms
     ✓ a path outside the checkout exits 6 with nothing committed 214ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 193ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 122ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 663ms
     ✓ --path records its commit on the run's record, like every other commit mode 460ms
     ✓ a recorded ledger commits only the rows the run appended 597ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 642ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 546ms
     ✓ commitBookkeeping refuses when a recorded path changed 313ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 322ms
     ✓ under --mode=commit counts the squashed paths as something to commit 512ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 246ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 140ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 220ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 166ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 135ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 106ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 109ms
     ✓ carries untracked ledgers too 108ms
     ✓ keeps rows on separate lines when the destination has no final newline 112ms
     ✓ src that is not a git repo exits 3 12ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 217ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 303ms
     ✓ a source file in the range: exit 7, path listed 268ms
     ✓ another FID's plan file in the range: exit 7 266ms
     ✓ from not an ancestor of to: exit 7 237ms
     ✓ unknown commit exits 3; a missing flag exits 2 166ms
   ✓ bookPathspecs (2)
     ✓ grows core -> full -> pr 0ms
     ✓ appends the repo's extra bookkeeping paths as :(glob) pathspecs under pr only 0ms
   ✓ bookPathspecs — frozen bookkeeping allow-list (1)
     ✓ scope=pr reaches every frozen entry, the FID log dir, and the docs/*.jsonl ledger glob 0ms
   ✓ bkit ledgers append (20)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 101ms
     ✓ append keeps a row's own repo 136ms
     ✓ append refuses a supplied ts 77ms
     ✓ append refuses a supplied schema or bkit 91ms
     ✓ append refuses a flat top-level field the top section moved into by 127ms
     ✓ append writes nothing when one row is invalid 273ms
     ✓ append refuses a row whose kind is not the ledger's 70ms
     ✓ append --ledger=stats takes compliance, counter and outcome rows 90ms
     ✓ append --ledger=stats refuses another kind, a non-closing writer, and a total that does not match its parts 127ms
     ✓ append bumps a round-second mint 77ms
     ✓ append refuses an empty rows file 45ms
     ✓ append refuses an unknown or issues ledger 43ms
     ✓ append refuses a writer not listed for the kind 121ms
     ✓ append starts a new line when the ledger lacks its final newline 76ms
     ✓ append creates the ledger and its directory 75ms
     ✓ append stamps a keyed row's first write firstTs = ts, updates = 1 66ms
     ✓ append carries firstTs forward and counts updates, across calls and within one batch 101ms
     ✓ append replaces a supplied firstTs / updates with the computed values 68ms
     ✓ append continues the count from a compacted winner 60ms
     ✓ append leaves rows outside the five keyed-ledger kinds without firstTs / updates 64ms
   ✓ bkit ledgers compact (5)
     ✓ compacts every keyed ledger by default and reports per-ledger counts 50ms
     ✓ --ledger narrows the run to one ledger 10ms
     ✓ --dry-run counts without writing 9ms
     ✓ a second run changes nothing 18ms
     ✓ refuses an unknown --ledger with a usage error 0ms
   ✓ bkit ledgers check (4)
     ✓ passes when every key on the Ledger rows line has a decision or deferral row 1ms
     ✓ names the keys no row carries and exits EXIT_ROWS_MISSING 1ms
     ✓ passes on None 1ms
     ✓ refuses a plan with no Ledger rows line or an unfilled one 1ms
   ✓ bkit ledgers triage (11)
     ✓ triage keeps a low-severity deferral exempt 77ms
     ✓ triage keeps an own-cycle deferral exempt 83ms
     ✓ triage marks an unjustified deferral lazy 113ms
     ✓ triage writes an unjustified row with a minted ts 118ms
     ✓ triage writes no row for a closed deferral 87ms
     ✓ triage reports an adjudicated unjustified row outside exempt 100ms
     ✓ triage ignores another feature's deferral rows 130ms
     ✓ triage writes nothing when the FID has no deferral row 89ms
     ✓ triage refuses a plan with no task blocks 146ms
     ✓ triage refuses a plan whose task blocks do not parse 133ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 120ms
   ✓ bkit ledgers append --invocation (5)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 379ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 235ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 317ms
     ✓ lands a standalone corrected candidate and reports the spend 422ms
     ✓ issues the same operation for rows whose keys are reordered 196ms
   ❯ bkit ledgers query (3)
     ✓ pages canonical winners with diagnostics and rejects stale cursors 45ms
     × a negative --cursor offset is refused 46ms
     ✓ marks a page with a next cursor as not clean 44ms
   ❯ bkit ledgers append --operation (4)
     ✓ returns durable append receipt and permits a deliberate same-key update 134ms
     × a replayed operation whose rows are gone is not reported as recorded 112ms
     ✓ keeps ledger operation intents and receipts out of committed book paths 278ms
     ✓ refuses --issue-operation without an invocation or beside --operation, writing nothing 57ms
   ✓ parked run commits (3)
     ✓ round-trips the record's start, commits and pushed list for its workflow 153ms
     ✓ reads null for a missing file, another workflow, an unreadable file and a bad fid 209ms
     ✓ is invisible to the record listing and removes by fid 290ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers query > a negative --cursor offset is refused
AssertionError: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:2187:26
    2185|
    2186|     const refused = await q(r, "--status=ACTIVE", "--limit=2", `--curs…
    2187|     expect(refused.code).toBe(2);
       |                          ^
    2188|     expect(refused.err).toMatch(/cursor/i);
    2189|     expect(refused.json).toBeUndefined();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers append --operation > a replayed operation whose rows are gone is not reported as recorded
AssertionError: expected +0 not to be +0 // Object.is equality
 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:2307:29
    2305|
    2306|     const replay = await appendOp(r, [failure()], "op-gone");
    2307|     expect(replay.code).not.toBe(0);
       |                             ^
    2308|     expect(replay.err).toContain("op-gone");
    2309|     expect(replay.json).toBeUndefined();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 110 passed (112)
   Start at  22:04:02
   Duration  18.96s (tests 98%, import 1%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-P1QzKo/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/ledgers/status.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/992-ledger-commands-six
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/ledgers/status.test.ts

```

## Runner output — `.bkit/core/engine/ledgers/status.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/992-ledger-commands-six
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/ledgers/status.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/992-ledger-commands-six

 ❯ .bkit/core/engine/ledgers/status.test.ts (20 tests | 1 failed) 140ms
   ✓ CI evidence selection contract (3)
     ✓ validates atomic CI and local selections with stable evidence identities 11ms
     ✓ validates failedJobCount as a positive whole number outside the identity 6ms
     ✓ validates failedJobs as an array of job names outside the identity 1ms
   ✓ testRunProblem (2)
     ✓ testRunProblem rejects a tested value that is not a full commit sha 1ms
     ✓ testRunProblem rejects a failedTests that is not an array of strings 0ms
   ✓ fold — event log → run array (7)
     ✓ folds a single run, step-done appends to the open run 1ms
     ✓ preserves multiple phase runs in one log (design → plan → build) 0ms
     ✓ attaches step-done to the latest run of its workflow across two runs of the same phase 0ms
     ✓ de-dupes identical lines (union duplication) — keeps one 0ms
     ✓ orders interleaved (union-shuffled) lines by `at` 0ms
     ✓ fold reads an old subPlan row as its group 0ms
     ✓ merges workflow-meta onto the run (debugAttempt) 0ms
   ✓ appendLine (1)
     ✓ serializes one event as a newline-terminated JSON line 0ms
   ✓ engine-action rows (4)
     ✓ key joins its parts with /, an absent part as -; hash is sha256 hex 0ms
     ✓ records a row and finds it only by the same key and hash 3ms
     ✓ skips malformed lines 1ms
     ✓ the fold ignores them 1ms
   ✓ ledger operation receipts (1)
     ✓ preserves tracker changed-hash actions while rejecting ledger operation collisions 4ms
   ❯ ledger operation effect (1)
     × the row block is stored once per operation 96ms
   ✓ CI handoff events (1)
     ✓ preserves handoff events across status folding and rejects stale CI selection 3ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/ledgers/status.test.ts > ledger operation effect > the row block is stored once per operation
AssertionError: expected 2 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 2

 ❯ .bkit/core/engine/ledgers/status.test.ts:464:58
    462|     const text = fs.readFileSync(ops as string, "utf-8");
    463|     // The block appears in exactly one row of the operations file: th…
    464|     expect(text.split(JSON.stringify(block)).length - 1).toBe(1);
       |                                                          ^
    465|     expect(ledgerEffect(ops as string, "op-once")).toEqual({
    466|       offset: 0,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 19 passed (20)
   Start at  22:04:23
   Duration  610ms (transform 44%, tests 30%, import 17%, setup 8%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-AVAyvN/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
