Enforced: true
Red: 4
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/1020-two-small-check-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "append writes status OPEN on a friction row given none" | red | failure: expected { schema: 3, ts: 1794953704721, …(7) } to match object { status: 'OPEN' } (12 matching properties omitted from actual) |
| 1 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "append writes status OPEN on a deferral row given none" | red | failure: expected { schema: 3, ts: 1794953704835, …(15) } to match object { status: 'OPEN' } (20 matching properties omitted from actual) |
| 1 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "append writes status OPEN on a failure row given none" | red | failure: expected { schema: 3, ts: 1794953704943, …(9) } to match object { status: 'OPEN' } (14 matching properties omitted from actual) |
| 1 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "append keeps a given status next to a defaulted one" | red | failure: expected { schema: 3, ts: 1794953705046, …(9) } to match object { key: 'no-status', status: 'OPEN' } (13 matching properties omitted from actual) |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/ledgers.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1020-two-small-check
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/ledgers.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/ledgers.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1020-two-small-check
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/ledgers.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1020-two-small-check

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts (120 tests | 4 failed) 26232ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (25)
     ✓ modified ledger under the FID logdir is staged and committed 431ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 388ms
     ✓ brand-new untracked ledger is staged and committed 375ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 311ms
     ✓ path containing a space is staged and committed 365ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 279ms
     ✓ staging failure: exit 4 and no commit is created, no false success 271ms
     ✓ a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit 367ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 263ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 233ms
     ✓ --mode=stage stages the sweep but creates no commit 283ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 894ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 508ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 398ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 229ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 216ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 225ms
     ✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 66ms
     ✓ usage error ["--scope=core","--mode=push","--message=m"] exits 2 65ms
     ✓ usage error ["--scope=core","--mode=commit"] exits 2 85ms
     ✓ root that is not a directory or not a repo exits 3 15ms
     ✓ --root defaults to the working directory 253ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 420ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 392ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 340ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 346ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 241ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 150ms
     ✓ a path outside the checkout exits 6 with nothing committed 195ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 299ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 163ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 467ms
     ✓ --path records its commit on the run's record, like every other commit mode 458ms
     ✓ a recorded ledger commits only the rows the run appended 787ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 933ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 775ms
     ✓ commitBookkeeping refuses when a recorded path changed 458ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 549ms
     ✓ under --mode=commit counts the squashed paths as something to commit 487ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 352ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 190ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 339ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 215ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 169ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 148ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 196ms
     ✓ carries untracked ledgers too 143ms
     ✓ keeps rows on separate lines when the destination has no final newline 150ms
     ✓ src that is not a git repo exits 3 13ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 333ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 481ms
     ✓ a source file in the range: exit 7, path listed 339ms
     ✓ another FID's plan file in the range: exit 7 368ms
     ✓ from not an ancestor of to: exit 7 320ms
     ✓ unknown commit exits 3; a missing flag exits 2 223ms
   ✓ bookPathspecs (2)
     ✓ grows core -> full -> pr 0ms
     ✓ appends the repo's extra bookkeeping paths as :(glob) pathspecs under pr only 0ms
   ✓ bookPathspecs — frozen bookkeeping allow-list (1)
     ✓ scope=pr reaches every frozen entry, the FID log dir, and the docs/*.jsonl ledger glob 0ms
   ❯ bkit ledgers append (24)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 124ms
     ✓ append keeps a row's own repo 98ms
     ✓ append refuses a supplied ts 82ms
     ✓ append refuses a supplied schema or bkit 104ms
     ✓ append refuses a flat top-level field the top section moved into by 104ms
     ✓ append writes nothing when one row is invalid 102ms
     ✓ append refuses a row whose kind is not the ledger's 78ms
     ✓ append --ledger=stats takes compliance, counter and outcome rows 122ms
     ✓ append --ledger=stats refuses another kind, a non-closing writer, and a total that does not match its parts 165ms
     ✓ append bumps a round-second mint 114ms
     ✓ append refuses an empty rows file 72ms
     ✓ append refuses an unknown or issues ledger 68ms
     ✓ append refuses a writer not listed for the kind 168ms
     ✓ append starts a new line when the ledger lacks its final newline 86ms
     ✓ append creates the ledger and its directory 87ms
     ✓ append stamps a keyed row's first write firstTs = ts, updates = 1 86ms
     ✓ append carries firstTs forward and counts updates, across calls and within one batch 130ms
     ✓ append replaces a supplied firstTs / updates with the computed values 96ms
     ✓ append continues the count from a compacted winner 100ms
     ✓ append leaves rows outside the five keyed-ledger kinds without firstTs / updates 108ms
     × append writes status OPEN on a friction row given none 116ms
     × append writes status OPEN on a deferral row given none 106ms
     × append writes status OPEN on a failure row given none 106ms
     × append keeps a given status next to a defaulted one 99ms
   ✓ bkit ledgers compact (5)
     ✓ compacts every keyed ledger by default and reports per-ledger counts 80ms
     ✓ --ledger narrows the run to one ledger 25ms
     ✓ --dry-run counts without writing 20ms
     ✓ a second run changes nothing 30ms
     ✓ refuses an unknown --ledger with a usage error 1ms
   ✓ bkit ledgers check (4)
     ✓ passes when every key on the Ledger rows line has a decision or deferral row 3ms
     ✓ names the keys no row carries and exits EXIT_ROWS_MISSING 2ms
     ✓ passes on None 2ms
     ✓ refuses a plan with no Ledger rows line or an unfilled one 2ms
   ✓ bkit ledgers triage (11)
     ✓ triage keeps a low-severity deferral exempt 156ms
     ✓ triage keeps an own-cycle deferral exempt 148ms
     ✓ triage marks an unjustified deferral lazy 162ms
     ✓ triage writes an unjustified row with a minted ts 155ms
     ✓ triage writes no row for a closed deferral 118ms
     ✓ triage reports an adjudicated unjustified row outside exempt 125ms
     ✓ triage ignores another feature's deferral rows 169ms
     ✓ triage writes nothing when the FID has no deferral row 130ms
     ✓ triage refuses a plan with no task blocks 203ms
     ✓ triage refuses a plan whose task blocks do not parse 172ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 177ms
   ✓ bkit ledgers append --invocation (6)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 572ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 316ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 362ms
     ✓ lands a standalone corrected candidate and reports the spend 227ms
     ✓ the correction-events file has mode 0600 266ms
     ✓ issues the same operation for rows whose keys are reordered 272ms
   ✓ bkit ledgers query (3)
     ✓ pages canonical winners with diagnostics and rejects stale cursors 71ms
     ✓ a negative --cursor offset is refused 69ms
     ✓ marks a page with a next cursor as not clean 57ms
   ✓ bkit ledgers append --operation (6)
     ✓ returns durable append receipt and permits a deliberate same-key update 190ms
     ✓ a replayed operation whose rows are gone is not reported as recorded 110ms
     ✓ a replayed operation whose rows a rebase moved is still reported as recorded 99ms
     ✓ a replayed operation whose rows are gone says it was recorded and must not be retried under a new id 106ms
     ✓ keeps ledger operation intents and receipts out of committed book paths 393ms
     ✓ refuses --issue-operation without an invocation or beside --operation, writing nothing 98ms
   ✓ parked run commits (3)
     ✓ round-trips the record's start, commits and pushed list for its workflow 217ms
     ✓ reads null for a missing file, another workflow, an unreadable file and a bad fid 236ms
     ✓ is invisible to the record listing and removes by fid 202ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers append > append writes status OPEN on a friction row given none
AssertionError: expected { schema: 3, ts: 1794953704721, …(7) } to match object { status: 'OPEN' }
(12 matching properties omitted from actual)

- Expected
+ Received

  {
-   "status": "OPEN",
+   "bkit": {
+     "version": "unknown",
+   },
+   "by": {
+     "step": "ship-close-gate",
+     "workflow": "ship",
+   },
+   "key": "f-open",
+   "kind": "friction",
+   "repo": "unknown/repo",
+   "schema": 3,
+   "severity": "LOW",
+   "summary": "s",
+   "ts": 1794953704721,
  }

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:1436:49
    1434|     };
    1435|     expect((await append(r, "friction", [friction])).code).toBe(0);
    1436|     expect(lines(r, ".bkit/friction.jsonl")[0]).toMatchObject({ status…
       |                                                 ^
    1437|   });
    1438|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers append > append writes status OPEN on a deferral row given none
AssertionError: expected { schema: 3, ts: 1794953704835, …(15) } to match object { status: 'OPEN' }
(20 matching properties omitted from actual)

- Expected
+ Received

  {
-   "status": "OPEN",
+   "bkit": {
+     "version": "unknown",
+   },
+   "by": {
+     "step": "build-close-workflow",
+     "workflow": "build",
+   },
+   "category": "correctness",
+   "description": "the call is unguarded",
+   "firstTs": 1794953704835,
+   "key": "701-deferred-guard",
+   "kind": "deferral",
+   "reason": "scope-declared",
+   "references": [
+     "701",
+     "src/a.ts",
+   ],
+   "remediation": "Add the check in src/a.ts beside the guard, then a test in src/a.test.ts.",
+   "repo": "unknown/repo",
+   "schema": 3,
+   "severity": "MEDIUM",
+   "summary": "guard a call",
+   "ts": 1794953704835,
+   "type": "issue",
+   "updates": 1,
  }

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:1456:49
    1454|     const res = await append(r, "deferrals", [deferral]);
    1455|     expect(res.code).toBe(0);
    1456|     expect(lines(r, "docs/deferrals.jsonl")[0]).toMatchObject({ status…
       |                                                 ^
    1457|   });
    1458|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers append > append writes status OPEN on a failure row given none
AssertionError: expected { schema: 3, ts: 1794953704943, …(9) } to match object { status: 'OPEN' }
(14 matching properties omitted from actual)

- Expected
+ Received

  {
-   "status": "OPEN",
+   "bkit": {
+     "version": "unknown",
+   },
+   "by": {
+     "step": "build-challenge",
+     "workflow": "build",
+   },
+   "firstTs": 1794953704943,
+   "key": "parser-drops-last-line",
+   "kind": "failure",
+   "repo": "unknown/repo",
+   "schema": 3,
+   "severity": "HIGH",
+   "summary": "parser drops the last line",
+   "ts": 1794953704943,
+   "updates": 1,
  }

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:1463:48
    1461|     const { status: _status, ...noStatus } = failure();
    1462|     expect((await append(r, "failures", [noStatus])).code).toBe(0);
    1463|     expect(lines(r, "docs/failures.jsonl")[0]).toMatchObject({ status:…
       |                                                ^
    1464|   });
    1465|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers append > append keeps a given status next to a defaulted one
AssertionError: expected { schema: 3, ts: 1794953705046, …(9) } to match object { key: 'no-status', status: 'OPEN' }
(13 matching properties omitted from actual)

- Expected
+ Received

  {
    "key": "no-status",
-   "status": "OPEN",
  }

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:1476:23
    1474|     const [given, defaulted] = lines(r, "docs/failures.jsonl");
    1475|     expect(given).toMatchObject({ key: "given", status: "TRIAGED" });
    1476|     expect(defaulted).toMatchObject({ key: "no-status", status: "OPEN"…
       |                       ^
    1477|   });
    1478| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 116 passed (120)
   Start at  08:14:43
   Duration  27.23s (tests 97%, transform 2%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-R3GfpK/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
