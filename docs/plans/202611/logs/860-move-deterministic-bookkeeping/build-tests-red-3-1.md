Enforced: true
Red: 10
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/ledgers/status.test.ts` "preserves tracker changed-hash actions while rejecting ledger operation collisions" | red | failure: ledgerOperation is not a function |
| 4 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "returns durable append receipt and permits a deliberate same-key update" | red | failure: expected 2 to be +0 // Object.is equality |
| 4 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "reconciles lost append response at each durable checkpoint without duplicate rows" | red | failure: expected [Function] to throw an error |
| 4 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "serializes concurrent append operations and blocks partial uncertain ledger writes" | red | failure: expected false to be true // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "derives supported header fields and rejects stale bodies without false PASS" | red | failure: expected 2 to be +0 // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "retains special verdict judgments and legacy stub behavior" | red | failure: expected 2 to be +0 // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/challenge.test.ts` "reuses structured challenge findings without losing semantic inputs" | red | failure: structuredFindings is not a function |
| 6 | `.bkit/core/engine/commands/workflow/steps.test.ts` "derives audit IDs totals ledger payloads and coverage from one result" | red | failure: expected 2 to be +0 // Object.is equality |
| 6 | `.bkit/core/engine/commands/workflow/issues.test.ts` "renders audit comments from validated result and preserves tracker adapters" | red | failure: expected 2 to be +0 // Object.is equality |
| 6 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "keeps rendered audit report appended rows and tracker draft counts identical" | red | failure: expected 2 to be +0 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/ledgers/status.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/ledgers/status.test.ts

```

## Runner output — `.bkit/core/engine/ledgers/status.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/ledgers/status.test.ts

[test-timeout-budget] load average 19.9 on 10 cores: unit limits 14450ms per test, 28900ms per hook (x2.89)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/ledgers/status.test.ts (14 tests | 1 failed) 24ms
   ✓ CI evidence selection contract (1)
     ✓ validates atomic CI and local selections with stable evidence identities 4ms
   ✓ fold — event log → run array (7)
     ✓ folds a single run, step-done appends to the open run 2ms
     ✓ preserves multiple phase runs in one log (design → plan → build) 0ms
     ✓ attaches step-done to the latest run of its workflow across two runs of the same phase 1ms
     ✓ de-dupes identical lines (union duplication) — keeps one 0ms
     ✓ orders interleaved (union-shuffled) lines by `at` 0ms
     ✓ fold reads an old subPlan row as its group 1ms
     ✓ merges workflow-meta onto the run (debugAttempt) 0ms
   ✓ appendLine (1)
     ✓ serializes one event as a newline-terminated JSON line 0ms
   ✓ engine-action rows (4)
     ✓ key joins its parts with /, an absent part as -; hash is sha256 hex 1ms
     ✓ records a row and finds it only by the same key and hash 3ms
     ✓ skips malformed lines 1ms
     ✓ the fold ignores them 1ms
   ❯ ledger operation receipts (1)
     × preserves tracker changed-hash actions while rejecting ledger operation collisions 6ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/ledgers/status.test.ts > ledger operation receipts > preserves tracker changed-hash actions while rejecting ledger operation collisions
TypeError: ledgerOperation is not a function
 ❯ .bkit/core/engine/ledgers/status.test.ts:313:12
    311|     const h1 = actionHash("request-1");
    312|     const h2 = actionHash("request-2");
    313|     expect(ledgerOperation(file, "op-1", h1)).toEqual({ state: "new" }…
       |            ^
    314|     const receipt = recordLedgerOperation(file, {
    315|       operation: "op-1",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 13 passed (14)
   Start at  12:25:10
   Duration  561ms (setup 33%, transform 32%, import 20%, tests 12%, worker 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-SOIXzI/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/ledgers.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/ledgers.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/ledgers.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/ledgers.test.ts

[test-timeout-budget] load average 19.9 on 10 cores: unit limits 14450ms per test, 28900ms per hook (x2.89)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts (101 tests | 1 failed) 30105ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 526ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 440ms
     ✓ brand-new untracked ledger is staged and committed 395ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 374ms
     ✓ path containing a space is staged and committed 389ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 367ms
     ✓ staging failure: exit 4 and no commit is created, no false success 360ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 412ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 371ms
     ✓ --mode=stage stages the sweep but creates no commit 367ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 1182ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 702ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 576ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 342ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 295ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 273ms
     ✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 67ms
     ✓ usage error ["--scope=core","--mode=push","--message=m"] exits 2 122ms
     ✓ usage error ["--scope=core","--mode=commit"] exits 2 93ms
     ✓ root that is not a directory or not a repo exits 3 49ms
     ✓ --root defaults to the working directory 334ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 567ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 462ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 536ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 479ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 345ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 203ms
     ✓ a path outside the checkout exits 6 with nothing committed 244ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 325ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 304ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 794ms
     ✓ --path records its commit on the run's record, like every other commit mode 743ms
     ✓ a recorded ledger commits only the rows the run appended 1143ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 1133ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 1008ms
     ✓ commitBookkeeping refuses when a recorded path changed 559ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 805ms
     ✓ under --mode=commit counts the squashed paths as something to commit 820ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 474ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 337ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 439ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 350ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 268ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 278ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 186ms
     ✓ carries untracked ledgers too 201ms
     ✓ keeps rows on separate lines when the destination has no final newline 262ms
     ✓ src that is not a git repo exits 3 23ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 564ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 543ms
     ✓ a source file in the range: exit 7, path listed 397ms
     ✓ another FID's plan file in the range: exit 7 472ms
     ✓ from not an ancestor of to: exit 7 490ms
     ✓ unknown commit exits 3; a missing flag exits 2 311ms
   ✓ bookPathspecs (2)
     ✓ grows core -> full -> pr 0ms
     ✓ appends the repo's extra bookkeeping paths as :(glob) pathspecs under pr only 0ms
   ✓ bookPathspecs — frozen bookkeeping allow-list (1)
     ✓ scope=pr reaches every frozen entry, the FID log dir, and the docs/*.jsonl ledger glob 1ms
   ✓ bkit ledgers append (20)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 127ms
     ✓ append keeps a row's own repo 108ms
     ✓ append refuses a supplied ts 82ms
     ✓ append refuses a supplied schema or bkit 122ms
     ✓ append refuses a flat top-level field the top section moved into by 134ms
     ✓ append writes nothing when one row is invalid 115ms
     ✓ append refuses a row whose kind is not the ledger's 82ms
     ✓ append --ledger=stats takes compliance, counter and outcome rows 109ms
     ✓ append --ledger=stats refuses another kind, a non-closing writer, and a total that does not match its parts 127ms
     ✓ append bumps a round-second mint 124ms
     ✓ append refuses an empty rows file 113ms
     ✓ append refuses an unknown or issues ledger 83ms
     ✓ append refuses a writer not listed for the kind 148ms
     ✓ append starts a new line when the ledger lacks its final newline 99ms
     ✓ append creates the ledger and its directory 111ms
     ✓ append stamps a keyed row's first write firstTs = ts, updates = 1 105ms
     ✓ append carries firstTs forward and counts updates, across calls and within one batch 135ms
     ✓ append replaces a supplied firstTs / updates with the computed values 108ms
     ✓ append continues the count from a compacted winner 117ms
     ✓ append leaves rows outside the five keyed-ledger kinds without firstTs / updates 115ms
   ✓ bkit ledgers compact (5)
     ✓ compacts every keyed ledger by default and reports per-ledger counts 4ms
     ✓ --ledger narrows the run to one ledger 2ms
     ✓ --dry-run counts without writing 1ms
     ✓ a second run changes nothing 2ms
     ✓ refuses an unknown --ledger with a usage error 1ms
   ✓ bkit ledgers check (4)
     ✓ passes when every key on the Ledger rows line has a decision or deferral row 2ms
     ✓ names the keys no row carries and exits EXIT_ROWS_MISSING 4ms
     ✓ passes on None 2ms
     ✓ refuses a plan with no Ledger rows line or an unfilled one 2ms
   ✓ bkit ledgers triage (11)
     ✓ triage keeps a low-severity deferral exempt 201ms
     ✓ triage keeps an own-cycle deferral exempt 197ms
     ✓ triage marks an unjustified deferral lazy 298ms
     ✓ triage writes an unjustified row with a minted ts 242ms
     ✓ triage writes no row for a closed deferral 175ms
     ✓ triage reports an adjudicated unjustified row outside exempt 211ms
     ✓ triage ignores another feature's deferral rows 201ms
     ✓ triage writes nothing when the FID has no deferral row 189ms
     ✓ triage refuses a plan with no task blocks 289ms
     ✓ triage refuses a plan whose task blocks do not parse 284ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 227ms
   ✓ bkit ledgers append --invocation (2)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 593ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 382ms
   ✓ bkit ledgers query (1)
     ✓ pages canonical winners with diagnostics and rejects stale cursors 91ms
   ❯ bkit ledgers append --operation (1)
     × returns durable append receipt and permits a deliberate same-key update 118ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers append --operation > returns durable append receipt and permits a deliberate same-key update
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:2067:24
    2065|
    2066|     const first = await appendOp(r, [failure()], "op-1");
    2067|     expect(first.code).toBe(0);
       |                        ^
    2068|     expect(first.json.receipt).toMatchObject({
    2069|       operation: "op-1",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 100 passed (101)
   Start at  12:25:13
   Duration  30.90s (tests 98%, transform 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-IGKUjp/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/ledgers/journal.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/ledgers/journal.integration.test.ts

```

## Runner output — `.bkit/core/engine/ledgers/journal.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/ledgers/journal.integration.test.ts

[test-timeout-budget] load average 21.6 on 10 cores: unit limits 15300ms per test, 30600ms per hook (x3.06)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts (14 tests | 3 failed) 28002ms
   ✓ the dispatch seam on a real worktree (7)
     ✓ writes friction to the run's own book root 288ms
     ✓ writes no friction row for a declared routing exit 217ms
     ✓ skips a call made outside the run's worktree 284ms
     ✓ writes nothing when no run is active in the cwd 308ms
     ✓ a call launched from a git hook writes no engine-call row 1263ms
     ✓ branches rebase finishes a rebase paused on a commit that carries the run's status file 1107ms
     ✓ branches anchor-read with a plan --file journals into the active run 250ms
   ✓ explicit invocation on real worktrees (3)
     ✓ resumes explicit invocation across two real worktrees without identity leakage 590ms
     ✓ keeps invocation events and engine-call rows inside the issuing worktree after receipt loss 631ms
     ✓ completes missing subagent attribution before a real append 501ms
   ✓ canonical ledger reads on real files (1)
     ✓ distinguishes unreadable missing malformed and clean ledger coverage without writing 353ms
   ❯ replay-safe ledger appends on real files (3)
     × reconciles lost append response at each durable checkpoint without duplicate rows 284ms
     × serializes concurrent append operations and blocks partial uncertain ledger writes 21455ms
     × keeps rendered audit report appended rows and tracker draft counts identical 468ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/ledgers/journal.integration.test.ts > replay-safe ledger appends on real files > reconciles lost append response at each durable checkpoint without duplicate rows
AssertionError: expected [Function] to throw an error
 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts:579:9
    577|           checkpoint: failAt(checkpoint),
    578|         }),
    579|       ).toThrow();
       |         ^
    580|
    581|       // The same operation again reconciles to the one effect and nev…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/ledgers/journal.integration.test.ts > replay-safe ledger appends on real files > serializes concurrent append operations and blocks partial uncertain ledger writes
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ until .bkit/core/engine/ledgers/journal.integration.test.ts:648:33
    646|     for (let i = 0; i < 1000 && !fs.existsSync(file); i += 1)
    647|       await new Promise((r) => setTimeout(r, 20));
    648|     expect(fs.existsSync(file)).toBe(true);
       |                                 ^
    649|   };
    650|
 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts:662:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/ledgers/journal.integration.test.ts > replay-safe ledger appends on real files > keeps rendered audit report appended rows and tracker draft counts identical
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts:795:23
    793|       "--to=docs/audits/202611/security-summary.md",
    794|     ]);
    795|     expect(stub.code).toBe(0);
       |                       ^
    796|     const summary = fs.readFileSync(
    797|       path.join(repo, "docs/audits/202611/security-summary.md"),

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 11 passed (14)
   Start at  12:25:46
   Duration  28.73s (tests 98%, transform 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-wbK2kh/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/steps.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/steps.test.ts

[test-timeout-budget] load average 24.6 on 10 cores: unit limits 16800ms per test, 33600ms per hook (x3.36)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts (119 tests | 3 failed) 46331ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 656ms
     ✓ preserves local clamp enforcement when completing test rounds 196ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 181ms
     ✓ done prints progressLine 227ms
     ✓ progress output metadata 1ms
     ✓ gate progress number validation 193ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 544ms
     ✓ done --group writes group on the row 412ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 607ms
     ✓ --commit=none writes the row and leaves it uncommitted 177ms
     ✓ build-group-start records parentSha and group 171ms
     ✓ carries extra fields, parsed as JSON when they are JSON 408ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 162ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 156ms
     ✓ refuses an empty artifact 157ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 151ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 131ms
     ✓ rejects ["--verdict=MAYBE"] 129ms
     ✓ rejects ["--strategy=YOLO"] 136ms
     ✓ rejects ["--failures=-1"] 140ms
     ✓ rejects ["--field=verdict=PASS"] 151ms
     ✓ rejects ["--status=SKIPPED"] 144ms
     ✓ needs a message unless --commit=none 194ms
     ✓ reports a failed commit with exit 8 without writing the row 1011ms
     ✓ a failed commit leaves no row staged in the index 701ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 949ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 732ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 784ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 650ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 979ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 143ms
     ✓ a missing artifact exits 4 125ms
     ✓ empty artifact exits 0 161ms
     ✓ pending artifact exits 1 154ms
     ✓ no marker artifact exits 2 127ms
     ✓ disallowed artifact exits 3 129ms
     ✓ bad failures artifact exits 4 115ms
     ✓ a required field that is absent is invalid (re-prompt) 111ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 129ms
     ✓ only reads above the marker 178ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 413ms
     ✓ fails when no row was written for the step 180ms
     ✓ --ref reads the status file as committed on that ref, not from disk 471ms
     ✓ --ref exits 3 when the ref does not carry the status file 475ms
     ✓ fails on a placeholder left in the artifact 372ms
     ✓ fails when the row's verdict differs from the artifact's 355ms
     ✓ fails when the row does not list the artifact, or carries another attempt 378ms
     ✓ fails on a missing artifact 451ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 369ms
     ✓ refuses a negative or non-integer attempt (2) 126ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 135ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 126ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 108ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 119ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 136ms
     ✓ fails a diagnose row missing its strategy, passes with it 271ms
     ✓ fails a run-tests row missing its scope, and an empty scope 422ms
     ✓ names every missing field at once 169ms
     ✓ asks nothing of a step that writes none of them 145ms
     ✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 23ms
   ✓ ledger writer references (1)
     ✓ every configured writer has a prompt file 0ms
   ✓ placeholderLines (1)
     ✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 1ms
   ✓ bkit steps finish (16)
     ✓ preserves challenge findings in the event when a later round overwrites the report 182ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 557ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 145ms
     ✓ re-asks (exit 6) when a field the prompt declares is missing 126ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 129ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 194ms
     ✓ a true | false header field is true when any agent sets it true 162ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 172ms
     ✓ records the header's Strategy on the row 198ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 230ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 423ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 131ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 357ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 606ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 843ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 648ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 726ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 982ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 631ms
     ✓ --post needs --number; without --post there is no tracker key 236ms
   ✓ bkit steps stub (3)
     ✓ copies the prior version under a PENDING header 160ms
     ✓ --strip-header drops the prior version's own header 146ms
     ✓ exits 4 when the prior version is missing or empty 120ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 182ms
     ✓ checks the FID's shape for the wired tracker 192ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 323ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 152ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 633ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 507ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 387ms
       ✓ gate --issue without --fid is a usage error 146ms
       ✓ gate --issue="" under none keeps today's check 175ms
     ✓ --attempt-of checks the row carries the derived counter 365ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1055ms
     ✓ writeStepRow refuses when a recorded path changed 1261ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 661ms
     ✓ writeStepRow appends its commit sha to the record 1249ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1906ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 361ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 1004ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 663ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 470ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1334ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 887ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 717ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 487ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1171ms
     ✓ exit codes list 11 as planned tests touched and 15 as source touched in the tests step 1ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 215ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 618ms
     ✓ does not count an artifact the run found committed when it started 593ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 366ms
     ✓ commits a package.json change outside bkit.workflows 684ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1082ms
   ❯ bkit steps stub --result-file (3)
     × derives supported header fields and rejects stale bodies without false PASS 164ms
     × retains special verdict judgments and legacy stub behavior 168ms
     × derives audit IDs totals ledger payloads and coverage from one result 188ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps stub --result-file > derives supported header fields and rejects stale bodies without false PASS
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2221:24
    2219|       });
    2220|       const res = await run(cwd, stubArgs(agent, "logs/r.json", `logs/…
    2221|       expect(res.code).toBe(0);
       |                        ^
    2222|       const fields = headerFields(header(cwd, `logs/${agent}.md`));
    2223|       expect(fields).toMatchObject(expected);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps stub --result-file > retains special verdict judgments and legacy stub behavior
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2281:7
    2279|     expect(
    2280|       (await run(cwd, stubArgs("bkit-build-plan-tests", "logs/h.json",…
    2281|     ).toBe(0);
       |       ^
    2282|     expect(header(cwd, "logs/h.md")).toContain("Verdict: HANDOVER");
    2283|     const read = await run(cwd, [

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps stub --result-file > derives audit IDs totals ledger payloads and coverage from one result
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2358:20
    2356|     const a = await run(cwd, args("logs/a.json", "logs/a.md"));
    2357|     const b = await run(cwd, args("logs/b.json", "logs/b.md"));
    2358|     expect(a.code).toBe(0);
       |                    ^
    2359|
    2360|     // Totals come from the findings, in the report header; no hand-wr…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 116 passed (119)
   Start at  12:26:18
   Duration  47.34s (tests 98%, import 1%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-EqlmE8/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/challenge.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/challenge.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/challenge.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/challenge.test.ts

[test-timeout-budget] load average 24.1 on 10 cores: unit limits 16550ms per test, 33100ms per hook (x3.31)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/commands/workflow/challenge.test.ts (38 tests | 1 failed) 5035ms
   ✓ bkit challenge merge (32)
     ✓ merges one report 97ms
     ✓ keeps the worse severity 70ms
     ✓ drops an accepted finding 57ms
     ✓ numbers after the last task 57ms
     ✓ writes findings as new last groups of at most 3 tasks, each a block that passes plan-check 54ms
     ✓ appends findings as TASK GROUP headings 51ms
     ✓ challenge merge writes a matrix row for each appended finding task 60ms
     ✓ challenge merge refuses a matrix row a pipe in the test name would break 68ms
     ✓ leaves the plan unchanged when plan-check fails 71ms
     ✓ routes unfixable HIGH to pause 54ms
     ✓ routes unfixable MEDIUM to pause 53ms
     ✓ routes a fixable task in the last round to fix 57ms
     ✓ routes an unfixable task in the last round to pause 46ms
     ✓ refuses a round over the limit, and takes it once the owner granted one more allowance 75ms
     ✓ refuses an old-format report with findings 29ms
     ✓ refuses a report in task-line form 26ms
     ✓ refuses a finding block with no Location 32ms
     ✓ refuses a missing report 23ms
     ✓ a second run with the same reports appends nothing 121ms
     ✓ a finding reported again in round 2 reruns its open round-1 task instead of a twin 126ms
     ✓ a finding whose round-1 task is ticked done but comes back in round 2 gets a new task 219ms
     ✓ a reopened task that is ticked done after round 2 is not appended again on a re-run 157ms
     ✓ drops a finding at an accepted extensionless path 71ms
     ✓ acceptedLocations counts a lettered Decision: A) Accept line 4ms
     ✓ deferred counts the rows written 130ms
     ✓ 7 findings give three new groups of 3, 3 and 1 46ms
     ✓ challenge merge splits groups at the configured maxPerGroup 52ms
     ✓ refuses a finding with 16 planned tests 47ms
     ✓ routes more findings than one round may add to pause and writes nothing 96ms
     ✓ LOW finding becomes a deferral row 129ms
     ✓ a failed LOW deferral append leaves the plan unchanged; the re-run writes both 175ms
     ✓ writes LOW deferrals at the checkout root when run from a subfolder 127ms
   ❯ structured challenge findings (1)
     × reuses structured challenge findings without losing semantic inputs 8ms
   ✓ bkit challenge gate (5)
     ✓ challenge-1 skipped below threshold 1ms
     ✓ challenge gate writes a challenge-gate row 617ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1280ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 460ms
     ✓ challenge gate exits 5 when --base names no commit 188ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/challenge.test.ts > structured challenge findings > reuses structured challenge findings without losing semantic inputs
TypeError: structuredFindings is not a function
 ❯ .bkit/core/engine/commands/workflow/challenge.test.ts:762:19
    760|
    761|   it("reuses structured challenge findings without losing semantic inp…
    762|     const found = structuredFindings(
       |                   ^
    763|       input.map((f) => ({ ...f, location: f.location.replace(/^\//, `$…
    764|       cwd,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 37 passed (38)
   Start at  12:27:08
   Duration  5.66s (tests 92%, import 4%, transform 3%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Vo9LgG/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/issues.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/issues.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/issues.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/issues.test.ts

[test-timeout-budget] load average 24.3 on 10 cores: unit limits 16650ms per test, 33300ms per hook (x3.33)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/commands/workflow/issues.test.ts (92 tests | 1 failed) 9797ms
   ✓ bkit issues text (9)
     ✓ drops comments whose first line is the generated marker, keeps human ones 3ms
     ✓ a comment that only MENTIONS the marker later on is human input 0ms
     ✓ keeps only what follows the LAST whole-line cut marker, marker dropped 0ms
     ✓ a stamped marker and Jira's HTML <h6> markers count; HTML prose does not 1ms
     ✓ an inline mention of the cut token does not cut 0ms
     ✓ drops generated comments BEFORE cutting, so a marker inside bkit's own comment never cuts 0ms
     ✓ sorts oldest first when every comment has a timestamp, else keeps the given order 0ms
     ✓ reads files: GitHub created_at array and Linear {comments} wrapper; cut honours sort order 42ms
     ✓ exits 3 on a missing or malformed file and 2 with no input at all 44ms
   ✓ bkit issues labels (25)
     ✓ a new phase drops the old phase, next:* and bkit:failed, keeps bkit:auto and foreign labels 50ms
     ✓ drops every other phase label, however many there are 0ms
     ✓ debug is a phase: it replaces the phase it debugs and clears bkit:failed 47ms
     ✓ a Failure Path keeps the phase label and next:* is left alone without a phase 0ms
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 237ms
     ✓ merged drops every phase label and bkit:failed; refuses --failed=on with it 119ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 218ms
     ✓ refuses an unknown phase or on/off value 120ms
     ✓ builds the two board payloads from bkit.tracker.github.project 105ms
     ✓ board is null with a reason for {"tracker":{"default":"github","github":{"project":false}}} 60ms
     ✓ board is null with a reason for {"tracker":{"default":"github"}} 82ms
     ✓ board is null with a reason for {"tracker":{"default":"github","github":{"review":"QA"}}} 71ms
     ✓ board is null with a reason for {"tracker":{"default":"github","github":{"project":"https://github.com/acme/app"}}} 114ms
     ✓ board is null with a reason for {"tracker":{"default":"linear","github":{"project":"https://github.com/orgs/acme/projects/3/views/1"}}} 75ms
     ✓ board is null with a reason for {"tracker":{"default":"jira","github":{"project":"https://github.com/orgs/acme/projects/3/views/1"}}} 72ms
     ✓ board is null with a reason for {} 79ms
     ✓ trackerState for {"tracker":{"default":"linear"}}: phase start "started", hand-off "In Review" 169ms
     ✓ trackerState for {"tracker":{"default":"linear","linear":{"review":"Code Review"}}}: phase start "started", hand-off "Code Review" 180ms
     ✓ trackerState for {"tracker":{"default":"jira"}}: phase start "In Progress", hand-off "In Review" 173ms
     ✓ trackerState for {"tracker":{"default":"jira","jira":{"review":"Code Review"}}}: phase start "In Progress", hand-off "Code Review" 206ms
     ✓ trackerState for {"tracker":{"default":"jira","jira":{"progress":"Doing","review":"QA"}}}: phase start "Doing", hand-off "QA" 176ms
     ✓ trackerState for {"tracker":{"default":"github"}}: phase start null, hand-off null 268ms
     ✓ trackerState for {}: phase start null, hand-off null 263ms
     ✓ targets a personal board as owner_type user, with the Status option names overridden 216ms
     ✓ --board on a configured board needs --issue and --owner-repo 153ms
   ✓ bkit issues comment (33)
     ✓ Step 1 with the workflow heading and the tree link 126ms
     ✓ progress header reads Group: x/y 77ms
     ✓ renders header fields in the order the flags were given 419ms
     ✓ summary: artifact link at --ref, then the artifact verbatim 70ms
     ✓ artifact path#Heading links that section of the rendered doc 90ms
     ✓ headingAnchor("Overview") is GitHub's "overview" 0ms
     ✓ headingAnchor("Step 2 — Worktree Setup") is GitHub's "step-2--worktree-setup" 1ms
     ✓ headingAnchor("`bkit issues comment` (v4.9)") is GitHub's "bkit-issues-comment-v49" 0ms
     ✓ headingAnchor("snake_case and-hyphen") is GitHub's "snake_case-and-hyphen" 0ms
     ✓ headingAnchor("Ünïcode Überschrift") is GitHub's "ünïcode-überschrift" 0ms
     ✓ close: tree, PR and run links, then Artifacts and Telemetry sections 98ms
     ✓ raw lines follow the links (Fetch Context's not-configured line) 66ms
     ✓ failure: step, sub-step, error, and the last 20 stderr lines fenced 84ms
     ✓ failure: --error-file carries the error text, trailing newlines dropped; a missing file exits 3 59ms
     ✓ a stderr capture holding backticks cannot close its fence 65ms
     ✓ handover: link and handover content 73ms
     ✓ audit: slug heading, header fields, and the summary 67ms
     ✓ defuses a whole-line cut marker copied in from an artifact 74ms
     ✓ every body opens with the generated marker, so the next run's text drops it 68ms
     ✓ refuses ["--step-title=X"] (exit 2) 53ms
     ✓ refuses ["--step-number=1"] (exit 2) 79ms
     ✓ refuses ["--step-number=x1","--step-title=X"] (exit 2) 65ms
     ✓ refuses ["--kind=failure","--step-number=1","--step-title=X"] (exit 2) 45ms
     ✓ refuses ["--kind=other"] (exit 2) 41ms
     ✓ refuses ["--step-number=1","--step-title=X","--tree=dev"] (exit 2) 36ms
     ✓ refuses ["--step-number=1","--step-title=X","--owner-repo=o/r","--artifact=a.md"] (exit 2) 51ms
     ✓ refuses ["--step-number=1","--step-title=X","--owner-repo=o/r","--ref=dev","--artifact=a.md#"] (exit 2) 38ms
     ✓ refuses ["--step-number=1","--step-title=X","--field=novalue"] (exit 2) 93ms
     ✓ refuses ["--step-number=1","--step-title=X","--group-count=2"] (exit 2) 65ms
     ✓ refuses ["--step-number=1","--step-title=X","--workflow-heading"] (exit 2) 40ms
     ✓ refuses ["--kind=audit"] (exit 2) 36ms
     ✓ refuses ["--kind=audit","--audit-slug=Bad Slug"] (exit 2) 36ms
     ✓ exits 3 when a body, section or stderr file is missing 101ms
   ✓ issues reaches the tracker only through tracker.ts (1)
     ✓ never shells out or fetches itself 1ms
   ❯ bkit issues comment --post (7)
     ✓ without --post prints no tracker key and calls nothing 64ms
     ✓ skips tracker none and an issue-less FID 200ms
     ✓ posts the printed body; an identical recent comment is not posted twice 176ms
     × renders audit comments from validated result and preserves tracker adapters 46ms
     ✓ a failed post exits 0 with done false and the reason 178ms
     ✓ prints commentFile: the multi-line comment byte-for-byte, for the MCP fallback 95ms
     ✓ --file: an engine-action row per run dedups a re-run without reading the issue 168ms
   ✓ bkit issues fetch (5)
     ✓ writes the description raw, comments oldest first and the facts; prints facts, never the body 72ms
     ✓ fetch prints terminal in its facts and in issue-facts.json 88ms
     ✓ needs --session-dir or --outbox; skips tracker none and an issue-less run 177ms
     ✓ exits 80 with the reason on a network failure and writes nothing 65ms
     ✓ exits 80 with reason auth when the key is unset, never printing a key 53ms
   ✓ bkit issues blocked-by (3)
     ✓ prints each blocker's state and how many are still open 60ms
     ✓ skips with tracker none 66ms
     ✓ exits 80 with the reason when the tracker read fails 101ms
   ✓ bkit issues related (4)
     ✓ fetches each hit in rank order, up to --top, and writes the related-issues layout 122ms
     ✓ GitHub headings carry #N; no hits writes None. 120ms
     ✓ a hit that cannot be fetched exits 80 and writes nothing 74ms
     ✓ a hits file that is not a list of ids exits 3 79ms
   ✓ bkit issues labels --write (5)
     ✓ reads the labels itself, writes the transition and the state, prints tracker done 106ms
     ✓ a failed read prints done false and the transition of the given --label set 88ms
     ✓ skips tracker none and a run with no issue 92ms
     ✓ a malformed board target is refused before any label is written 108ms
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 1832ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/issues.test.ts > bkit issues comment --post > renders audit comments from validated result and preserves tracker adapters
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/issues.test.ts:873:26
    871|     ]);
    872|     const derived = await run(cwd, [...AUDIT, "--result-file=r.json", …
    873|     expect(derived.code).toBe(0);
       |                          ^
    874|     expect(derived.json.comment).toBe(manual.json.comment);
    875|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 91 passed (92)
   Start at  12:27:16
   Duration  10.17s (tests 98%, import 1%, setup 1%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-tRt2Lq/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
