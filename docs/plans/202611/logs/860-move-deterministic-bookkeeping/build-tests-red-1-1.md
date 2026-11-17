Enforced: true
Red: 9
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/status.test.ts` "issues invocation metadata from an explicit run and registered step" | red | failure: expected null to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/commands/lib.test.ts` "rejects stale cross-worktree invocation and conflicting overrides" | red | failure: expected null to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "resumes explicit invocation across two real worktrees without identity leakage" | red | failure: expected null to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/ledgers/telemetry.test.ts` "accepts verified unavailable model without confusing configured and observed models" | red | failure: expected 'subagent bkit-build-plan-tests row mi…' to be undefined |
| 2 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "rejects conflicting attribution and retains legacy writer restrictions" | red | failure: expected null to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "completes missing subagent attribution before a real append" | red | failure: expected null to be +0 // Object.is equality |
| 3 | `.bkit/core/engine/ledgers/telemetry.test.ts` "folds numeric timestamps and equal timestamp ties before filtering" | red | failure: queryLedger is not a function |
| 3 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "pages canonical winners with diagnostics and rejects stale cursors" | red | failure: expected 2 to be +0 // Object.is equality |
| 3 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "distinguishes unreadable missing malformed and clean ledger coverage without writing" | red | failure: expected 2 to be +0 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/status.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/status.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/status.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/status.test.ts

[test-timeout-budget] load average 42.9 on 10 cores: unit limits 25951ms per test, 51901ms per hook (x5.19)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/commands/workflow/status.test.ts (76 tests | 1 failed) 4834ms
   ✓ debug evidence state (5)
     ✓ persists atomic selections and preserves identical evidence generations 123ms
     ✓ resumes saved evidence and replaces it only on explicit new selection 425ms
     ✓ clears saved CI routing immediately for explicit local selection 147ms
     ✓ counts reproduction and fixes only in the active generation 243ms
     ✓ orders covering gates for red tiers and preserves live off 199ms
   ✓ bkit status path (2)
     ✓ returns the main checkout's path outside a worktree, and whether it exists 116ms
     ✓ rejects a month that is not YYYYMM 1ms
   ✓ the status fold (4)
     ✓ skips a row it does not model (no type, an unknown type) and folds the rest 4ms
     ✓ ignores a row type it does not know 6ms
     ✓ refuses a line that is not JSON rather than folding around it (exit 3) 2ms
     ✓ a command reading the log reports the malformed line with exit 3 4ms
   ✓ bkit status route (20)
     ✓ reads the last verdict and failures of a step in the active run, per group 2ms
     ✓ reads a build-plan-execute row written before the step rename as build-plan-tasks 1ms
     ✓ prints the parentSha of the step's last row in the active run, per group 2ms
     ✓ counts absent failures as 0 when a verdict is present 1ms
     ✓ reads an absent failures count on FAIL as null: the count is unknown, not 0 2ms
     ✓ does not leak a completed run's verdict into a fresh run 3ms
     ✓ reads strategy across ALL runs and gives the next rung 2ms
     ✓ starts the ladder at STANDARD when no strategy is recorded 2ms
     ✓ prefers the run-level debugMode over an older step value, and reads pushMode and debugAttempt 2ms
     ✓ fails a --require'd mode that is missing or invalid 1ms
     ✓ is a usage error to require a step field without --step 1ms
     ✓ exits 3 when status.jsonl is missing 1ms
     ✓ falls back to the last step carrying debugMode / pushMode when no workflow-meta sets it 1ms
     ✓ reports an invalid mode as null, never as a mode 1ms
     ✓ climbs the ladder: PIVOT -> FINAL 2ms
     ✓ climbs the ladder: FINAL -> FINAL 1ms
     ✓ fails a --require'd strategy outside the ladder 1ms
     ✓ fails a --require'd verdict when the last DONE row carries none 1ms
     ✓ reads strategy per group, from the step's last DONE row, within its own workflow 2ms
     ✓ a non-numeric debugAttempt reads as 0 1ms
   ✓ bkit status route --prompt-file (debug Step 1) (12)
     ✓ a fresh run: attempt 1, NORMAL, no repro, every gate 245ms
     ✓ a resumed run keeps its attempt number 130ms
     ✓ fix rounds used up across runs (debug.fix.maxAttempts) enter SOAK 89ms
     ✓ the fix limit comes from bkit.workflows.debug.fix.maxAttempts 108ms
     ✓ [soak] and [repro] in the prompt 27ms
     ✓ a resumed run that soaked continues in SOAK 70ms
     ✓ soak rows of a finished run do not force SOAK on the next run 53ms
     ✓ an escalation recorded only in workflow-meta survives a resume 55ms
     ✓ [live=off] in the prompt drops the live gate; the issue body is not read 115ms
     ✓ finds status.jsonl from --fid and --month 208ms
     ✓ refuses --prompt-file for another workflow, and a missing --file without --fid 2ms
     ✓ a missing prompt file is a usage error 2ms
   ✓ bkit status route --workflow=build publish (7)
     ✓ lets the publish token override publish.local 73ms
     ✓ reads publish.local on LOCAL without a token 75ms
     ✓ coerces publish false to true on a non-LOCAL runtime 48ms
     ✓ accepts --prompt-file with --workflow=build 105ms
     ✓ ignores publish=maybe and falls through to config 73ms
     ✓ refuses publish without a runtime-resolved row 64ms
     ✓ prints publishSource for token, local, remote and coerced 134ms
   ✓ bkit status route --expect (4)
     ✓ passes when every field holds the expected value 2ms
     ✓ exits 4 naming a field that holds another value 24ms
     ✓ an expected field is also required: missing exits 4 1ms
     ✓ checks a step field with --step, and refuses an unknown field 2ms
   ✓ bkit status meta (9)
     ✓ appends a workflow-meta row the route read then sees 14ms
     ✓ records openedPr, and refuses the removed --soak-entry and --decision 6ms
     ✓ --debug-attempt=run records the active run's number 2ms
     ✓ meta refuses --plan-source 1ms
     ✓ rejects ["--debug-mode=TURBO"] 1ms
     ✓ rejects ["--push-mode=REMOTE"] 1ms
     ✓ rejects ["--debug-attempt=0"] 2ms
     ✓ rejects [] 2ms
     ✓ never starts a log 1ms
   ✓ bkit status row (6)
     ✓ appends a typed row with fields parsed as JSON where they are JSON 3ms
     ✓ refuses ["--type=step-done"] 2ms
     ✓ refuses ["--type=Ship_Gate"] 2ms
     ✓ refuses ["--type=x","--field=at=now"] 2ms
     ✓ refuses ["--type=x","--field=Bad=1"] 2ms
     ✓ never starts a log (exit 3) 1ms
   ✓ bkit status row owner-pause friction (6)
     ✓ status row owner-pause appends one human-confirm friction row 273ms
     ✓ status row owner-pause skips the friction row when no step-done follows the last owner-pause with the same reason 324ms
     ✓ status row owner-pause with a new reason appends its own row with no step-done in between 388ms
     ✓ status row owner-pause in a later pause appends a same-key recurrence 328ms
     ✓ status row writes no friction row for other types or with BKIT_ENGINE_JOURNAL=off 84ms
     ✓ status row owner-pause keeps the status row and exits 4 when the friction row cannot be written 252ms
   ❯ bkit status invocation (1)
     × issues invocation metadata from an explicit run and registered step 132ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/status.test.ts > bkit status invocation > issues invocation metadata from an explicit run and registered step
AssertionError: expected null to be +0 // Object.is equality

- Expected:
0

+ Received:
null

 ❯ .bkit/core/engine/commands/workflow/status.test.ts:1185:20
    1183|       root,
    1184|     );
    1185|     expect(r.code).toBe(0);
       |                    ^
    1186|     // Number, title and paths come from the step table and the explic…
    1187|     expect(r.json).toMatchObject({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 75 passed (76)
   Start at  18:37:19
   Duration  7.44s (tests 72%, transform 12%, import 11%, setup 4%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-3ysDCN/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/lib.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/lib.test.ts

```

## Runner output — `.bkit/core/engine/commands/lib.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/lib.test.ts

[test-timeout-budget] load average 45.3 on 10 cores: unit limits 27150ms per test, 54300ms per hook (x5.43)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/commands/lib.test.ts (71 tests | 1 failed) 18271ms
   ✓ parseFlags (20)
     ✓ accepts --flag=value and --flag value, camelCases kebab names 3ms
     ✓ collects repeatable flags and sets booleans 1ms
     ✓ ["--fid=1","--nope=x"] is a usage error 1ms
     ✓ ["--verify-attempt=1"] is a usage error 0ms
     ✓ ["--fid=1","--fid=2"] is a usage error 0ms
     ✓ ["--fid"] is a usage error 0ms
     ✓ ["--fid","--dry-run"] is a usage error 0ms
     ✓ ["--fid=1","--dry-run=yes"] is a usage error 0ms
     ✓ ["467"] is a usage error 1ms
     ✓ ["--fid="] is a usage error 1ms
     ✓ ["--fid",""] is a usage error 0ms
     ✓ rejects an empty entry of a required repeatable flag 1ms
     ✓ keeps an empty value for an optional string flag 0ms
     ✓ fills a positional flag from one bare argument, and only once 0ms
     ✓ fills keys in argv order 0ms
     ✓ refuses a literal workflow placeholder in ["--fid={FID}"] (exit 2) 0ms
     ✓ refuses a literal workflow placeholder in ["--fid=1","--artifact=docs/plans/{YYYYMM}/x.md"] (exit 2) 0ms
     ✓ refuses a literal workflow placeholder in ["--fid","{LOCK_TOKEN}"] (exit 2) 0ms
     ✓ refuses a placeholder in a positional argument 2ms
     ✓ lets through braces that are not an upper-case placeholder 1ms
   ✓ runCommand (18)
     ✓ returns null for anything that is not a registered noun 1ms
     ✓ runs a verb: text on stdout, tagged log on stderr 2ms
     ✓ prints one JSON object with --json 0ms
     ✓ leaves a verb's textOmit keys out of text and keeps them in --json 1ms
     ✓ passes the verb's own exit code through 0ms
     ✓ maps a usage error to exit 2 with a tagged message 0ms
     ✓ maps a CommandError to its code 0ms
     ✓ passes the command's exit code through when the journal write throws 0ms
     ✓ logs one [bkit-telemetry] line when the journal throws, however many writes fail 0ms
     ✓ hands the journal the failure only for an undeclared exit 2ms
     ✓ refuses a second JSON object 0ms
     ✓ prints noun help: exit 0 for --help, exit 2 for no verb 1ms
     ✓ rejects an unknown verb 0ms
     ✓ prints verb help without running the verb 1ms
     ✓ leaves a classic verb alone unless the second word is one of the command's verbs 0ms
     ✓ still answers `--help` for a noun that is also a classic verb 0ms
     ✓ takes the global --json flag on any verb, sets ctx.json and prints JSON 1ms
     ✓ refuses --json with a value 0ms
   ✓ --json on every registered command (3)
     ✓ no verb declares its own --json flag 1ms
     ✓ every verb's flag parsing accepts --json 5ms
     ✓ every verb's text output reads back as its --json output, less its textOmit keys 290ms
   ✓ help (3)
     ✓ noun help lists every verb and the shared exit codes 1ms
     ✓ verb help lists flags with required / repeatable, output keys, and own exit codes 0ms
     ✓ verb help marks the keys text output leaves out 1ms
   ✓ ghUnavailable (2)
     ✓ hands off when gh is missing, not logged in, or answered HTTP 403 1ms
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
     ✓ repoRoot resolves the main checkout from inside a linked worktree 517ms
     ✓ repoRoot outside a repository is a usage error 70ms
     ✓ design / plan / build / debug: worktree copy when it exists, else the main checkout 305ms
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 437ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1608ms
     ✓ runGit keeps output past Node's 1MB default 182ms
     ✓ runGit names ENOBUFS when output passes the limit 6494ms
     ✓ runGit names a spawn error instead of failing silently 150ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 7168ms
     ✓ runTool still reports a missing binary as not found 20ms
   ✓ resolveActiveRun (4)
     ✓ resolveActiveRun falls back to the cwd scan when --file names a non-status file 162ms
     ✓ still takes a status.jsonl --file as the run itself 184ms
     ✓ never files a --fid call under another feature's in-progress run 225ms
     ✓ finds a --fid run that started in an earlier month through the scan 173ms
   ❯ explicit invocation context (1)
     × rejects stale cross-worktree invocation and conflicting overrides 253ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/lib.test.ts > explicit invocation context > rejects stale cross-worktree invocation and conflicting overrides
AssertionError: expected null to be +0 // Object.is equality

- Expected:
0

+ Received:
null

 ❯ .bkit/core/engine/commands/lib.test.ts:909:25
    907|       `--file=${REL}`,
    908|     ]);
    909|     expect(issued.code).toBe(0);
       |                         ^
    910|     const id = (JSON.parse(issued.out) as { invocation: string }).invo…
    911|     expect(id).not.toBe("");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 70 passed (71)
   Start at  18:37:38
   Duration  21.62s (tests 89%, transform 7%, import 3%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-iy4v1l/junit.xml
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

[test-timeout-budget] load average 50.2 on 10 cores: unit limits 29600ms per test, 59200ms per hook (x5.92)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts (10 tests | 3 failed) 6535ms
   ✓ the dispatch seam on a real worktree (7)
     ✓ writes friction to the run's own book root 739ms
     ✓ writes no friction row for a declared routing exit 359ms
     ✓ skips a call made outside the run's worktree 436ms
     ✓ writes nothing when no run is active in the cwd 510ms
     ✓ a call launched from a git hook writes no engine-call row 1267ms
     ✓ branches rebase finishes a rebase paused on a commit that carries the run's status file 1736ms
     ✓ branches anchor-read with a plan --file journals into the active run 351ms
   ❯ explicit invocation on real worktrees (2)
     × resumes explicit invocation across two real worktrees without identity leakage 437ms
     × completes missing subagent attribution before a real append 335ms
   ❯ canonical ledger reads on real files (1)
     × distinguishes unreadable missing malformed and clean ledger coverage without writing 360ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/ledgers/journal.integration.test.ts > explicit invocation on real worktrees > resumes explicit invocation across two real worktrees without identity leakage
AssertionError: expected null to be +0 // Object.is equality

- Expected:
0

+ Received:
null

 ❯ issue .bkit/core/engine/ledgers/journal.integration.test.ts:291:20
    289|     ...extra,
    290|   ]);
    291|   expect(res.code).toBe(0);
       |                    ^
    292|   return res.json!["invocation"] as string;
    293| }
 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts:307:17

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/ledgers/journal.integration.test.ts > explicit invocation on real worktrees > completes missing subagent attribution before a real append
AssertionError: expected null to be +0 // Object.is equality

- Expected:
0

+ Received:
null

 ❯ issue .bkit/core/engine/ledgers/journal.integration.test.ts:291:20
    289|     ...extra,
    290|   ]);
    291|   expect(res.code).toBe(0);
       |                    ^
    292|   return res.json!["invocation"] as string;
    293| }
 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts:346:16

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/ledgers/journal.integration.test.ts > canonical ledger reads on real files > distinguishes unreadable missing malformed and clean ledger coverage without writing
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts:439:26
    437|     // Missing: no rows, and not a clean scan.
    438|     const missing = await query();
    439|     expect(missing.code).toBe(0);
       |                          ^
    440|     expect(missing.json!["rows"]).toEqual([]);
    441|     expect(missing.json!["coverage"]).toMatchObject({ status: "missing…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 7 passed (10)
   Start at  18:38:13
   Duration  9.54s (tests 75%, transform 13%, import 9%, setup 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-sFv6GG/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/ledgers/telemetry.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/ledgers/telemetry.test.ts

```

## Runner output — `.bkit/core/engine/ledgers/telemetry.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/ledgers/telemetry.test.ts

[test-timeout-budget] load average 47.6 on 10 cores: unit limits 28300ms per test, 56600ms per hook (x5.66)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ❯ .bkit/core/engine/ledgers/telemetry.test.ts (294 tests | 2 failed) 2435ms
   ✓ test-run status row validation (1)
     ✓ accepts bounded CI evidence rows while preserving local exit validation 4ms
   ✓ identity — per-kind composite tuples (7)
     ✓ compliance: keyed by (repo, by.workflow, run.parentSha, rule.id) 1ms
     ✓ outcome: keyed by (repo, by.workflow, run.parentSha) — run.pr fallback when no parentSha 0ms
     ✓ counter: keyed by (repo, by.workflow, run.parentSha, counter.name) 0ms
     ✓ friction: keyed by (kind, repo, key) 0ms
     ✓ deferral: keyed by (kind, repo, key) 0ms
     ✓ failure: keyed by (kind, repo, key) 0ms
     ✓ composite tuple is DISTINCT from bare ts — same ts, different key → different identity 1ms
   ✓ severity — per-kind requirement + closed enum (61)
     ✓ friction carries severity 34ms
     ✓ deferral carries severity 99ms
     ✓ failure carries severity 4ms
     ✓ compliance does NOT carry severity 0ms
     ✓ outcome does NOT carry severity 0ms
     ✓ counter does NOT carry severity 0ms
     ✓ knowledge does NOT carry severity 0ms
     ✓ decision does NOT carry severity 2ms
     ✓ VALID_SEVERITIES is exactly CRITICAL|HIGH|MEDIUM|LOW 1ms
     ✓ accepts severity CRITICAL 8ms
     ✓ accepts severity HIGH 0ms
     ✓ accepts severity MEDIUM 0ms
     ✓ accepts severity LOW 0ms
     ✓ rejects a friction row with severity missing 0ms
     ✓ rejects a deferral row with severity missing 0ms
     ✓ rejects a failure row with severity missing 0ms
     ✓ rejects off-enum severity "low" 0ms
     ✓ rejects off-enum severity "normal" 0ms
     ✓ rejects off-enum severity "critical" 0ms
     ✓ rejects off-enum severity "blocker" 0ms
     ✓ rejects off-enum severity "advisory" 0ms
     ✓ rejects off-enum severity "Critical" 0ms
     ✓ rejects off-enum severity "" 1ms
     ✓ rejects severity on a kind that must not carry it 1ms
     ✓ accepts triage status "OPEN" on the severity kinds 0ms
     ✓ accepts triage status "TRIAGED" on the severity kinds 0ms
     ✓ accepts triage status "CLOSED" on the severity kinds 0ms
     ✓ rejects off-ladder status "WORKED_AROUND" on a severity kind 0ms
     ✓ rejects off-ladder status "Resolving" on a severity kind 0ms
     ✓ rejects off-ladder status "resolved" on a severity kind 0ms
     ✓ rejects off-ladder status "open" on a severity kind 0ms
     ✓ rejects off-ladder status "ACTIVE" on a severity kind 0ms
     ✓ rejects off-ladder status "" on a severity kind 0ms
     ✓ accepts decision status "ACTIVE" 0ms
     ✓ accepts decision status "SUPERSEDED" 1ms
     ✓ rejects triage status "OPEN" on a decision 0ms
     ✓ rejects triage status "CLOSED" on a decision 0ms
     ✓ rejects triage status "TRIAGED" on a decision 0ms
     ✓ accepts knowledge status "ACTIVE" 49ms
     ✓ accepts knowledge status "SUPERSEDED" 3ms
     ✓ accepts a knowledge row with status absent 0ms
     ✓ rejects triage status "OPEN" on knowledge 0ms
     ✓ rejects triage status "CLOSED" on knowledge 0ms
     ✓ rejects triage status "TRIAGED" on knowledge 0ms
     ✓ rejects status on a kind that must not carry it 0ms
     ✓ DEFERRAL_REASONS is exactly the four justifications, low-severity and the adjudicator verdict 0ms
     ✓ accepts deferral reason "scope-declared" 0ms
     ✓ accepts deferral reason "hard-blocked" 0ms
     ✓ accepts deferral reason "needs-decision" 0ms
     ✓ accepts deferral reason "own-cycle" 0ms
     ✓ accepts deferral reason "low-severity" 0ms
     ✓ accepts deferral reason "unjustified" 0ms
     ✓ rejects a deferral row with reason missing 0ms
     ✓ rejects off-enum deferral reason "blocked" 0ms
     ✓ rejects off-enum deferral reason "out of scope" 0ms
     ✓ rejects off-enum deferral reason "no time" 0ms
     ✓ rejects off-enum deferral reason "SCOPE-DECLARED" 0ms
     ✓ rejects off-enum deferral reason "" 0ms
     ✓ rejects reason on a kind that must not carry it 0ms
     ✓ parse still reads legacy free-text status rows 4ms
     ✓ parse still reads pre-severity rows 0ms
   ✓ updating a row — supersede by same-key append (4)
     ✓ a later same-key row wins the fold; the earlier one stays as history 1ms
     ✓ fold is last-wins by ts, not by file order 0ms
     ✓ fold orders ISO-string and missing ts deterministically, whatever the file order 1ms
     ✓ a reworded key forks the entry instead of updating it 0ms
   ✓ triage ladder — OPEN -> TRIAGED -> CLOSED (3)
     ✓ TRIAGE_STATUSES is exactly OPEN|TRIAGED|CLOSED 0ms
     ✓ the triaged kinds are exactly the severity-carrying kinds 1ms
     ✓ a triage sweep appends TRIAGED, and the entry stays open 0ms
   ✓ feature kind — .bkit/issues.jsonl (#380) (13)
     ✓ is a valid kind, keyed by (kind, repo, key) 0ms
     ✓ FEATURE_STATUSES is exactly the six-value phase ladder 0ms
     ✓ accepts status DESIGNED 0ms
     ✓ accepts status PLANNED 0ms
     ✓ accepts status BUILT 0ms
     ✓ accepts status DEBUGGED 0ms
     ✓ accepts status SHIPPED 0ms
     ✓ accepts status ABANDONED 0ms
     ✓ rejects a missing status — the roadmap has no phase to project without it 0ms
     ✓ rejects an off-ladder status 0ms
     ✓ does not carry severity — feature is not in SEVERITY_KINDS 0ms
     ✓ requires key, category, and description 0ms
     ✓ a same-key append folds last-wins to the latest phase 0ms
   ✓ chat kind — .bkit/stats.jsonl chat rows (5)
     ✓ is a valid kind keyed by kind + repo + key 0ms
     ✓ rejects a row without the join keys readers depend on 0ms
     ✓ carries no severity or status 0ms
     ✓ a resumed chat's new row folds over the first one 0ms
     ✓ leaves a workflow's telemetry report unchanged 1ms
   ✓ run kind — .bkit/stats.jsonl run rows (6)
     ✓ is a valid kind keyed by kind + repo + key 0ms
     ✓ rejects a row without the join keys readers depend on 0ms
     ✓ takes only the five endings 0ms
     ✓ carries no severity or status 0ms
     ✓ a grown run log's new row folds over the first one 0ms
     ✓ leaves the telemetry report of the same workflow unchanged 0ms
   ✓ jsonl.md examples — validated against the codec (6)
     ✓ every full example row is a valid event 8ms
     ✓ every example field is a Generic Field or listed in its kind's Per-Kind Fields row 6ms
     ✓ every kind has a worked example 2ms
     ✓ no example puts an agent name in by.step 2ms
     ✓ by.model appears exactly where by.subagent does — never on an orchestrator row 1ms
     ✓ the triaged kinds' examples carry severity and references 2ms
   ✓ repo slug — one resolver, from the git remote (13)
     ✓ parses "https://github.com/owner/repo.git" -> "owner/repo" 0ms
     ✓ parses "https://github.com/owner/repo" -> "owner/repo" 0ms
     ✓ parses "git@github.com:owner/repo.git" -> "owner/repo" 0ms
     ✓ parses "ssh://git@github.com/owner/repo.git" -> "owner/repo" 0ms
     ✓ parses "  https://github.com/owner/repo.git\n" -> "owner/repo" 0ms
     ✓ returns empty rather than guessing for "" 0ms
     ✓ returns empty rather than guessing for "not-a-url" 0ms
     ✓ returns empty rather than guessing for "https://github.com/" 0ms
     ✓ returns empty rather than guessing for "reponame" 0ms
     ✓ a scoped npm package name must NEVER become the slug 0ms
     ✓ resolves the slug from a repo's origin remote 307ms
     ✓ returns empty for a git repo with no origin remote 177ms
     ✓ returns empty for a directory that is not a git repo 78ms
   ✓ resolveGitSha — parentSha must be a real SHA before it reaches a row (7)
     ✓ resolves a rev to a hex SHA the grader's guard accepts 34ms
     ✓ never returns the rev it was given 29ms
     ✓ gives DIFFERENT SHAs for different revs — so identity cannot collapse runs 102ms
     ✓ returns empty for unresolvable "no-such-rev" 28ms
     ✓ returns empty for unresolvable "HEAD~99999" 38ms
     ✓ returns empty for unresolvable "" 35ms
     ✓ returns empty outside a git repo rather than throwing 34ms
   ✓ workflowTelemetry — ledger-health readout (no workflow) (5)
     ✓ names the unknown-version bucket instead of leaving it empty 4ms
     ✓ reports 0 malformed as a single 0 when nothing is malformed 76ms
     ✓ counts malformed lines by parsing, not by regex 2ms
     ✓ counts per-workflow ENTITIES, so an updated row is not counted twice 2ms
     ✓ omits the chain line when no workflow is given 1ms
   ✓ validate — A2-mandatory envelope fields (19)
     ✓ accepts a valid compliance event 0ms
     ✓ accepts a valid outcome event 0ms
     ✓ accepts an outcome event with valid per-tier ship.coverage 0ms
     ✓ rejects an outcome event with non-object ship.coverage 0ms
     ✓ rejects an outcome event with a non-numeric coverage metric 0ms
     ✓ accepts a valid counter event 0ms
     ✓ accepts a valid friction event 0ms
     ✓ accepts a valid deferral event 0ms
     ✓ accepts a valid failure event 0ms
     ✓ rejects event missing mandatory field: ts 0ms
     ✓ rejects event missing mandatory field: kind 0ms
     ✓ rejects event missing mandatory field: repo 0ms
     ✓ rejects event missing mandatory field: bkit 0ms
     ✓ rejects event missing mandatory field: by 0ms
     ✓ rejects event missing by.step 0ms
     ✓ rejects event missing bkit.version 0ms
     ✓ rejects unknown kind 0ms
     ✓ rejects non-object input 0ms
     ✓ rejects counter with invalid counter.source 0ms
   ✓ fold — composite-identity dedup (6)
     ✓ folds same-key compliance rows to latest (higher ts) 0ms
     ✓ two same-ts same-key rows (merge=union duplicate) fold to ONE via composite identity 0ms
     ✓ two same-ts DIFFERENT-key rows (same ts, different rule) → TWO entries 0ms
     ✓ folds outcome rows by (repo, run.pr) 0ms
     ✓ folds friction rows by (kind, repo, key) 0ms
     ✓ empty events → empty state 0ms
   ✓ lineage — firstTs / updates on keyed rows (14)
     ✓ AGED_KINDS names the five keyed ledger kinds 0ms
     ✓ validate accepts firstTs <= ts and a positive-integer updates on every aged kind 0ms
     ✓ validate rejects a firstTs later than ts, or not a number 0ms
     ✓ validate rejects updates that is zero, negative or fractional 0ms
     ✓ validate rejects firstTs / updates on kinds outside AGED_KINDS 0ms
     ✓ lineage counts rows and takes the earliest ts 47ms
     ✓ lineage continues a stamped row's count and keeps its firstTs 2ms
     ✓ lineage counts same-ts rows once, keeping the larger stamped count 2ms
     ✓ lineage leaves firstTs out when no row carries a numeric ts 0ms
     ✓ placeLineage puts firstTs + updates right after ts, replacing stale values 1ms
     ✓ withLineage stamps a first row firstTs = ts, updates = 1 7ms
     ✓ withLineage carries forward from same-identity prior rows only 1ms
     ✓ withLineage replaces caller-supplied firstTs / updates 1ms
     ✓ withLineage passes keyless and non-aged rows through untouched 4ms
   ✓ parse — tolerant reader (8)
     ✓ parses valid NDJSON lines 1ms
     ✓ skips blank lines, does NOT count them as malformed 0ms
     ✓ counts a malformed (truncated trailing) line via malformedLineCount, does NOT throw 0ms
     ✓ counts a malformed line in the MIDDLE of the file, does NOT throw 1ms
     ✓ parses empty string → zero events, zero malformed 1ms
     ✓ NEVER throws on any input (fuzz) 3ms
     ✓ keeps ALL well-formed rows regardless of bkitVersion (no version gating) 1ms
     ✓ parse keeps an old row with subPlans 1ms
   ✓ outcome — shape and inline-jq parity (7)
     ✓ close-gate-shaped outcome validates successfully 1ms
     ✓ validate refuses plan.source brief on write 2ms
     ✓ accepts held in outcome and run endings 1ms
     ✓ keeps publish false on the outcome row 1ms
     ✓ rejects a non-boolean publish 1ms
     ✓ folds outcome by (repo, run.pr) 1ms
     ✓ inline-jq parity: jq-shaped row parses identically under parse() 3ms
   ✓ appendLine (1)
     ✓ serializes event to JSON string parseable back to same shape 1ms
   ✓ constants (1)
     ✓ MAX_ROWS_BEFORE_ROLLUP is a concrete number (not TODO) 0ms
   ✓ foldFrom — several ledger files (5)
     ✓ reads hot file and returns rowCount 1ms
     ✓ folds two files together 2ms
     ✓ missing paths are silently skipped 1ms
     ✓ emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP 45ms
     ✓ surfaces malformedLineCount from hot file 2ms
   ✓ workflowTelemetry — per-workflow summary signals (2)
     ✓ produces lines with rowCount, malformed, and per-version counts 2ms
     ✓ emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded 595ms
   ✓ workflowTelemetry — this-run vs med·5 baseline (7)
     ✓ shows THIS run's values against med·5 of the previous same-workflow runs 13ms
     ✓ workflowTelemetry splits the baseline on converted 3ms
     ✓ shows an ending row for a held close 2ms
     ✓ prints — for the baseline until at least 3 prior runs exist 1ms
     ✓ omits absent conditional metrics but shows ledgers.friction.added even at 0 2ms
     ✓ adds a this-run compliance line matched by run.parentSha 1ms
     ✓ adds the run's *_ATTEMPT counter matched by run.parentSha 2ms
   ✓ humanizeDuration (5)
     ✓ formats 45 seconds as 45s 0ms
     ✓ formats 480 seconds as 8m 0ms
     ✓ formats 1980 seconds as 33m 0ms
     ✓ formats 3600 seconds as 1h 0ms
     ✓ formats 7860 seconds as 2h11m 0ms
   ✓ telemetry-invariant (7)
     ✓ WS3-T4: bkit-telemetry-invariant — counters.verifyAttempt == count of plan-verify rows (7)
       ✓ invariant passes when verifyAttempt count matches plan-verify step count (1 attempt) 0ms
       ✓ invariant passes when verifyAttempt count matches plan-verify step count (3 attempts) 0ms
       ✓ fold deduplicates verifyAttempt counter by (repo, by.workflow, run.parentSha, counter.name) identity 0ms
       ✓ non-verifyAttempt counter rows do not count toward the invariant 0ms
       ✓ malformed JSONL lines are tolerated; invariant still passes over valid rows 0ms
       ✓ verifyAttempt counter.source must be shell-bus post-WS3 (structural trust tier) 0ms
       ✓ invariant holds with empty log (zero attempts == zero verify steps) 0ms
   ✓ mintTs (2)
     ✓ moves a whole-second clock reading 1 ms on 2ms
     ✓ follows `after` when the clock has not passed it, never landing on a whole second 0ms
   ✓ writerProblem (14)
     ✓ admits a listed subagent and the listed orchestrator 0ms
     ✓ admits a direct chat (utility) on decision rows 0ms
     ✓ admits a direct chat (utility) on deferral rows 0ms
     ✓ admits a direct chat (utility) on knowledge rows 0ms
     ✓ accepts a knowledge row written by bkit-build-plan-tests 0ms
     ✓ admits a direct chat (utility) on friction rows 0ms
     ✓ admits a direct chat (utility) on compliance rows 0ms
     ✓ admits a direct chat (utility) on counter rows 0ms
     ✓ admits a direct chat (utility) on outcome rows 0ms
     ✓ refuses an unlisted subagent or orchestrator 0ms
     ✓ admits the auto orchestrator on friction rows 0ms
     ✓ holds model to subagent rows 0ms
     ✓ admits any author on an any-agent kind 0ms
     ✓ admits each closing workflow on the stats kinds, and refuses audit and any subagent 1ms
   ✓ writer sets in telemetry.ts match the jsonl.md table (9)
     ✓ every kind appears in exactly one ledger 0ms
     ✓ decisions / decision: the doc row names docs/decisions.jsonl and the same writers 1ms
     ✓ deferrals / deferral: the doc row names docs/deferrals.jsonl and the same writers 0ms
     ✓ failures / failure: the doc row names docs/failures.jsonl and the same writers 0ms
     ✓ knowledge / knowledge: the doc row names docs/knowledge.jsonl and the same writers 0ms
     ✓ friction / friction: the doc row names .bkit/friction.jsonl and the same writers 2ms
     ✓ stats / compliance: the doc row names .bkit/stats.jsonl, a close-step writer and no subagent 1ms
     ✓ stats / counter: the doc row names .bkit/stats.jsonl, a close-step writer and no subagent 0ms
     ✓ stats / outcome: the doc row names .bkit/stats.jsonl, a close-step writer and no subagent 0ms
   ✓ normalize — schema-1 rows to schema 2 (13)
     ✓ compliance: rule / result / evidence / parentSha move into run and rule; phase is dropped 1ms
     ✓ counter: counterName / Value / Source and parentSha move into counter and run 0ms
     ✓ outcome: run fields move into their blocks; the fields with no place are dropped 0ms
     ✓ chat: every schema-1 field lands in its block, and the totals hold 3ms
     ✓ run: every schema-1 field lands in its block, and the totals hold 1ms
     ✓ a keyed kind (deferral) moves its top fields into bkit / by and keeps its payload 0ms
     ✓ a row carrying schema passes through unchanged 0ms
     ✓ bkitVersion "none" becomes bkit.version null 0ms
     ✓ a non-object reads as an empty row 0ms
     ✓ phase is dropped, outcome redTests moves into build, any kind's parentSha into run 0ms
     ✓ chat: an opencode row's bash categories land on its lowercase bash tool 0ms
     ✓ chat: usage.total.tokens is the sum of its models, as a fresh scan writes it 0ms
     ✓ null or empty workflow / subagent / model are left out of by 0ms
   ✓ fold — schema-1 and schema-2 rows of one identity (1)
     ✓ fold the two into one entry; the newer ts wins whichever shape it has 0ms
   ✓ totals — validate refuses a total that does not match its parts (22)
     ✓ lines.total.added = code + tests + docs 1ms
     ✓ lines.total.deleted = code + tests + docs 0ms
     ✓ lines.total.files = code + tests + docs 0ms
     ✓ lines.total.changed = added + deleted 0ms
     ✓ time.totalMinutes = end - start, within 0.1 0ms
     ✓ chat time.activeMinutes = the sum of time.spans 210ms
     ✓ usage.*.tokens.read = input + cacheWrite + cacheRead 1ms
     ✓ usage.total.turns / tokens = the sum of usage.byModel 7ms
     ✓ usage.total.compactions = usage.main + every agent's usage 4ms
     ✓ usage.total.context.peak = the max of usage.main and every agent instance 6ms
     ✓ agents.total.n = the sum of byAgent 1ms
     ✓ agents.total.errors = the sum of byAgent 0ms
     ✓ agents.byAgent.*.n = the length of its instances 1ms
     ✓ tools.total.calls = the sum of byTool 1ms
     ✓ tools.total.errors = the sum of byTool 0ms
     ✓ bkit.cli.total = the sum of byVerb 1ms
     ✓ steps.total.n = the sum of byStep 1ms
     ✓ steps.total.totalMinutes = the sum of byStep, within 0.1 per part 1ms
     ✓ steps.total.activeMinutes = the sum of byStep, within 0.1 per part 0ms
     ✓ totalsProblem sums groups 0ms
     ✓ build.redTests = steps.byStep["build-tests-red"].n 0ms
     ✓ build.challenge.findings.total = the sum of the four severities 0ms
   ✓ validate — schema-2 top section (18)
     ✓ refuses a row without schema: 3 0ms
     ✓ refuses a top-level bkitVersion 0ms
     ✓ refuses a top-level workflow 0ms
     ✓ refuses a top-level step 0ms
     ✓ refuses a top-level subagent 0ms
     ✓ refuses a top-level model 0ms
     ✓ refuses by.model without by.subagent 0ms
     ✓ accepts an outcome with time: null 0ms
     ✓ accepts bkit.version null on chat and run rows 0ms
     ✓ refuses bkit.version null on a compliance row 0ms
     ✓ refuses bkit.version null on a counter row 0ms
     ✓ refuses bkit.version null on a outcome row 0ms
     ✓ refuses bkit.version null on a friction row 0ms
     ✓ refuses bkit.version null on a deferral row 0ms
     ✓ refuses bkit.version null on a failure row 0ms
     ✓ refuses bkit.version null on a knowledge row 0ms
     ✓ refuses bkit.version null on a decision row 0ms
     ✓ refuses bkit.version null on a feature row 0ms
   ❯ verified model attribution (1)
     × accepts verified unavailable model without confusing configured and observed models 16ms
   ❯ queryLedger — canonical winners before filtering (1)
     × folds numeric timestamps and equal timestamp ties before filtering 2ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/ledgers/telemetry.test.ts > verified model attribution > accepts verified unavailable model without confusing configured and observed models
AssertionError: expected 'subagent bkit-build-plan-tests row mi…' to be undefined

- Expected:
undefined

+ Received:
"subagent bkit-build-plan-tests row missing by.model (its prompt's frontmatter model:)"

 ❯ .bkit/core/engine/ledgers/telemetry.test.ts:2985:78
    2983|     });
    2984|     expect(validate(unavailable).ok).toBe(true);
    2985|     expect(writerProblem(unavailable as unknown as Record<string, unkn…
       |                                                                              ^
    2986|
    2987|     // The configured pin is never recorded as the runtime model.

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/ledgers/telemetry.test.ts > queryLedger — canonical winners before filtering > folds numeric timestamps and equal timestamp ties before filtering
TypeError: queryLedger is not a function
 ❯ .bkit/core/engine/ledgers/telemetry.test.ts:3055:20
    3053|
    3054|     // Filtering applies to the winners: no older ACTIVE row is resurr…
    3055|     const active = queryLedger(raw, { status: "ACTIVE" });
       |                    ^
    3056|     expect(active.rows.map((r) => r.key)).toEqual(["k4"]);
    3057|     const superseded = queryLedger(raw, { status: "SUPERSEDED" });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 292 passed (294)
   Start at  18:38:36
   Duration  4.75s (tests 65%, transform 25%, setup 8%, import 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-tMwaC0/junit.xml
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

[test-timeout-budget] load average 49.8 on 10 cores: unit limits 29400ms per test, 58800ms per hook (x5.88)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts (99 tests | 2 failed) 41264ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 1045ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 630ms
     ✓ brand-new untracked ledger is staged and committed 611ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 700ms
     ✓ path containing a space is staged and committed 543ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 736ms
     ✓ staging failure: exit 4 and no commit is created, no false success 446ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 522ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 455ms
     ✓ --mode=stage stages the sweep but creates no commit 536ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 1629ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 779ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 726ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 391ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 421ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 446ms
     ✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 153ms
     ✓ usage error ["--scope=core","--mode=push","--message=m"] exits 2 139ms
     ✓ usage error ["--scope=core","--mode=commit"] exits 2 118ms
     ✓ root that is not a directory or not a repo exits 3 145ms
     ✓ --root defaults to the working directory 544ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 637ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 839ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 991ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 520ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 420ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 311ms
     ✓ a path outside the checkout exits 6 with nothing committed 380ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 487ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 329ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 863ms
     ✓ --path records its commit on the run's record, like every other commit mode 1002ms
     ✓ a recorded ledger commits only the rows the run appended 1613ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 1448ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 1358ms
     ✓ commitBookkeeping refuses when a recorded path changed 776ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 1159ms
     ✓ under --mode=commit counts the squashed paths as something to commit 779ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 694ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 434ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 584ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 369ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 281ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 269ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 301ms
     ✓ carries untracked ledgers too 299ms
     ✓ keeps rows on separate lines when the destination has no final newline 280ms
     ✓ src that is not a git repo exits 3 83ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 576ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 947ms
     ✓ a source file in the range: exit 7, path listed 692ms
     ✓ another FID's plan file in the range: exit 7 577ms
     ✓ from not an ancestor of to: exit 7 727ms
     ✓ unknown commit exits 3; a missing flag exits 2 404ms
   ✓ bookPathspecs (2)
     ✓ grows core -> full -> pr 2ms
     ✓ appends the repo's extra bookkeeping paths as :(glob) pathspecs under pr only 0ms
   ✓ bookPathspecs — frozen bookkeeping allow-list (1)
     ✓ scope=pr reaches every frozen entry, the FID log dir, and the docs/*.jsonl ledger glob 2ms
   ✓ bkit ledgers append (20)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 246ms
     ✓ append keeps a row's own repo 294ms
     ✓ append refuses a supplied ts 336ms
     ✓ append refuses a supplied schema or bkit 268ms
     ✓ append refuses a flat top-level field the top section moved into by 189ms
     ✓ append writes nothing when one row is invalid 166ms
     ✓ append refuses a row whose kind is not the ledger's 115ms
     ✓ append --ledger=stats takes compliance, counter and outcome rows 154ms
     ✓ append --ledger=stats refuses another kind, a non-closing writer, and a total that does not match its parts 171ms
     ✓ append bumps a round-second mint 148ms
     ✓ append refuses an empty rows file 175ms
     ✓ append refuses an unknown or issues ledger 132ms
     ✓ append refuses a writer not listed for the kind 232ms
     ✓ append starts a new line when the ledger lacks its final newline 241ms
     ✓ append creates the ledger and its directory 218ms
     ✓ append stamps a keyed row's first write firstTs = ts, updates = 1 263ms
     ✓ append carries firstTs forward and counts updates, across calls and within one batch 256ms
     ✓ append replaces a supplied firstTs / updates with the computed values 200ms
     ✓ append continues the count from a compacted winner 234ms
     ✓ append leaves rows outside the five keyed-ledger kinds without firstTs / updates 307ms
   ✓ bkit ledgers compact (5)
     ✓ compacts every keyed ledger by default and reports per-ledger counts 6ms
     ✓ --ledger narrows the run to one ledger 36ms
     ✓ --dry-run counts without writing 3ms
     ✓ a second run changes nothing 3ms
     ✓ refuses an unknown --ledger with a usage error 1ms
   ✓ bkit ledgers check (4)
     ✓ passes when every key on the Ledger rows line has a decision or deferral row 11ms
     ✓ names the keys no row carries and exits EXIT_ROWS_MISSING 4ms
     ✓ passes on None 4ms
     ✓ refuses a plan with no Ledger rows line or an unfilled one 6ms
   ✓ bkit ledgers triage (11)
     ✓ triage keeps a low-severity deferral exempt 502ms
     ✓ triage keeps an own-cycle deferral exempt 369ms
     ✓ triage marks an unjustified deferral lazy 254ms
     ✓ triage writes an unjustified row with a minted ts 228ms
     ✓ triage writes no row for a closed deferral 210ms
     ✓ triage reports an adjudicated unjustified row outside exempt 228ms
     ✓ triage ignores another feature's deferral rows 264ms
     ✓ triage writes nothing when the FID has no deferral row 335ms
     ✓ triage refuses a plan with no task blocks 300ms
     ✓ triage refuses a plan whose task blocks do not parse 365ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 287ms
   ❯ bkit ledgers append --invocation (1)
     × rejects conflicting attribution and retains legacy writer restrictions 168ms
   ❯ bkit ledgers query (1)
     × pages canonical winners with diagnostics and rejects stale cursors 166ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers append --invocation > rejects conflicting attribution and retains legacy writer restrictions
AssertionError: expected null to be +0 // Object.is equality

- Expected:
0

+ Received:
null

 ❯ issue .bkit/core/engine/commands/workflow/ledgers.test.ts:1822:18
    1820|       },
    1821|     );
    1822|     expect(code).toBe(0);
       |                  ^
    1823|     return (JSON.parse(out.join("")) as { invocation: string }).invoca…
    1824|   }
 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:1844:16

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers query > pages canonical winners with diagnostics and rejects stale cursors
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:1939:24
    1937|
    1938|     const whole = await q(r, "--status=ACTIVE");
    1939|     expect(whole.code).toBe(0);
       |                        ^
    1940|     const expected = whole.json.rows.map((x: { key: string }) => x.key…
    1941|     // The superseded k2 winner is filtered out, and its older ACTIVE …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 97 passed (99)
   Start at  18:38:53
   Duration  45.07s (tests 94%, transform 4%, import 1%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-jqlZvC/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
