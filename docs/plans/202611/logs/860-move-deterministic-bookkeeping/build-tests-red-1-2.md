Enforced: true
Red: 5
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 2

Plan: `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/status.test.ts` "issues invocation metadata from an explicit run and registered step" | red | failure: expected 75 to be greater than 75 |
| 1 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "resumes explicit invocation across two real worktrees without identity leakage" | red | failure: expected 0 to be greater than 0 |
| 10 | `.bkit/core/engine/commands/workflow/status.test.ts` "records the issued invocation in the run status log and rebuilds a deleted receipt" | red | failure: expected [] to have a length of 1 but got +0 |
| 10 | `.bkit/core/engine/commands/lib.test.ts` "writes the engine-call row for an invocation-bound command" | red | failure: expected [] to deeply equal [ { noun: 'probe', …(3) } ] |
| 10 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "keeps invocation events and engine-call rows inside the issuing worktree after receipt loss" | red | failure: expected [] to have a length of 1 but got +0 |

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

[test-timeout-budget] load average 13.8 on 10 cores: unit limits 11400ms per test, 22800ms per hook (x2.28)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/commands/workflow/status.test.ts (79 tests | 2 failed) 2948ms
   ✓ debug evidence state (5)
     ✓ persists atomic selections and preserves identical evidence generations 21ms
     ✓ resumes saved evidence and replaces it only on explicit new selection 102ms
     ✓ clears saved CI routing immediately for explicit local selection 54ms
     ✓ counts reproduction and fixes only in the active generation 88ms
     ✓ orders covering gates for red tiers and preserves live off 100ms
   ✓ bkit status path (2)
     ✓ returns the main checkout's path outside a worktree, and whether it exists 70ms
     ✓ rejects a month that is not YYYYMM 1ms
   ✓ the status fold (4)
     ✓ skips a row it does not model (no type, an unknown type) and folds the rest 3ms
     ✓ ignores a row type it does not know 3ms
     ✓ refuses a line that is not JSON rather than folding around it (exit 3) 5ms
     ✓ a command reading the log reports the malformed line with exit 3 1ms
   ✓ bkit status route (20)
     ✓ reads the last verdict and failures of a step in the active run, per group 4ms
     ✓ reads a build-plan-execute row written before the step rename as build-plan-tasks 1ms
     ✓ prints the parentSha of the step's last row in the active run, per group 1ms
     ✓ counts absent failures as 0 when a verdict is present 1ms
     ✓ reads an absent failures count on FAIL as null: the count is unknown, not 0 1ms
     ✓ does not leak a completed run's verdict into a fresh run 2ms
     ✓ reads strategy across ALL runs and gives the next rung 2ms
     ✓ starts the ladder at STANDARD when no strategy is recorded 1ms
     ✓ prefers the run-level debugMode over an older step value, and reads pushMode and debugAttempt 1ms
     ✓ fails a --require'd mode that is missing or invalid 3ms
     ✓ is a usage error to require a step field without --step 1ms
     ✓ exits 3 when status.jsonl is missing 1ms
     ✓ falls back to the last step carrying debugMode / pushMode when no workflow-meta sets it 2ms
     ✓ reports an invalid mode as null, never as a mode 2ms
     ✓ climbs the ladder: PIVOT -> FINAL 1ms
     ✓ climbs the ladder: FINAL -> FINAL 1ms
     ✓ fails a --require'd strategy outside the ladder 1ms
     ✓ fails a --require'd verdict when the last DONE row carries none 1ms
     ✓ reads strategy per group, from the step's last DONE row, within its own workflow 2ms
     ✓ a non-numeric debugAttempt reads as 0 4ms
   ✓ bkit status route --prompt-file (debug Step 1) (12)
     ✓ a fresh run: attempt 1, NORMAL, no repro, every gate 23ms
     ✓ a resumed run keeps its attempt number 37ms
     ✓ fix rounds used up across runs (debug.fix.maxAttempts) enter SOAK 33ms
     ✓ the fix limit comes from bkit.workflows.debug.fix.maxAttempts 61ms
     ✓ [soak] and [repro] in the prompt 29ms
     ✓ a resumed run that soaked continues in SOAK 47ms
     ✓ soak rows of a finished run do not force SOAK on the next run 37ms
     ✓ an escalation recorded only in workflow-meta survives a resume 29ms
     ✓ [live=off] in the prompt drops the live gate; the issue body is not read 73ms
     ✓ finds status.jsonl from --fid and --month 192ms
     ✓ refuses --prompt-file for another workflow, and a missing --file without --fid 2ms
     ✓ a missing prompt file is a usage error 1ms
   ✓ bkit status route --workflow=build publish (7)
     ✓ lets the publish token override publish.local 52ms
     ✓ reads publish.local on LOCAL without a token 31ms
     ✓ coerces publish false to true on a non-LOCAL runtime 28ms
     ✓ accepts --prompt-file with --workflow=build 19ms
     ✓ ignores publish=maybe and falls through to config 26ms
     ✓ refuses publish without a runtime-resolved row 20ms
     ✓ prints publishSource for token, local, remote and coerced 134ms
   ✓ bkit status route --expect (4)
     ✓ passes when every field holds the expected value 2ms
     ✓ exits 4 naming a field that holds another value 3ms
     ✓ an expected field is also required: missing exits 4 1ms
     ✓ checks a step field with --step, and refuses an unknown field 1ms
   ✓ bkit status meta (9)
     ✓ appends a workflow-meta row the route read then sees 3ms
     ✓ records openedPr, and refuses the removed --soak-entry and --decision 2ms
     ✓ --debug-attempt=run records the active run's number 1ms
     ✓ meta refuses --plan-source 1ms
     ✓ rejects ["--debug-mode=TURBO"] 2ms
     ✓ rejects ["--push-mode=REMOTE"] 1ms
     ✓ rejects ["--debug-attempt=0"] 1ms
     ✓ rejects [] 1ms
     ✓ never starts a log 1ms
   ✓ bkit status row (6)
     ✓ appends a typed row with fields parsed as JSON where they are JSON 2ms
     ✓ refuses ["--type=step-done"] 1ms
     ✓ refuses ["--type=Ship_Gate"] 2ms
     ✓ refuses ["--type=x","--field=at=now"] 1ms
     ✓ refuses ["--type=x","--field=Bad=1"] 1ms
     ✓ never starts a log (exit 3) 1ms
   ✓ bkit status row owner-pause friction (6)
     ✓ status row owner-pause appends one human-confirm friction row 129ms
     ✓ status row owner-pause skips the friction row when no step-done follows the last owner-pause with the same reason 138ms
     ✓ status row owner-pause with a new reason appends its own row with no step-done in between 177ms
     ✓ status row owner-pause in a later pause appends a same-key recurrence 131ms
     ✓ status row writes no friction row for other types or with BKIT_ENGINE_JOURNAL=off 51ms
     ✓ status row owner-pause keeps the status row and exits 4 when the friction row cannot be written 109ms
   ❯ bkit status invocation (4)
     × issues invocation metadata from an explicit run and registered step 134ms
     × records the issued invocation in the run status log and rebuilds a deleted receipt 106ms
     ✓ binds group and attempt and registers setup, remediation and ship steps 457ms
     ✓ registers the no-plan conversion step 125ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/status.test.ts > bkit status invocation > issues invocation metadata from an explicit run and registered step
AssertionError: expected 75 to be greater than 75
 ❯ .bkit/core/engine/commands/workflow/status.test.ts:1205:32
    1203|     const statusAfter = fs.readFileSync(path.join(root, REL), "utf-8");
    1204|     expect(statusAfter.startsWith(statusBefore)).toBe(true);
    1205|     expect(statusAfter.length).toBeGreaterThan(statusBefore.length);
       |                                ^
    1206|     expect(statusAfter.slice(statusBefore.length)).toContain(String(r.…
    1207|     expect(fs.existsSync(String(r.json.receipt))).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/status.test.ts > bkit status invocation > records the issued invocation in the run status log and rebuilds a deleted receipt
AssertionError: expected [] to have a length of 1 but got +0

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/status.test.ts:1263:19
    1261|       .filter((l) => l !== "")
    1262|       .map((l) => JSON.parse(l) as Record<string, unknown>);
    1263|     expect(added).toHaveLength(1);
       |                   ^
    1264|     expect(JSON.stringify(added[0])).toContain(id);
    1265|     expect(added[0]).toMatchObject({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 77 passed (79)
   Start at  22:23:21
   Duration  4.08s (tests 76%, import 12%, transform 10%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-4lUSkc/junit.xml
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

[test-timeout-budget] load average 15.7 on 10 cores: unit limits 12351ms per test, 24701ms per hook (x2.47)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts (11 tests | 2 failed) 6829ms
   ✓ the dispatch seam on a real worktree (7)
     ✓ writes friction to the run's own book root 422ms
     ✓ writes no friction row for a declared routing exit 313ms
     ✓ skips a call made outside the run's worktree 365ms
     ✓ writes nothing when no run is active in the cwd 314ms
     ✓ a call launched from a git hook writes no engine-call row 1195ms
     ✓ branches rebase finishes a rebase paused on a commit that carries the run's status file 1415ms
     ✓ branches anchor-read with a plan --file journals into the active run 430ms
   ❯ explicit invocation on real worktrees (3)
     × resumes explicit invocation across two real worktrees without identity leakage 845ms
     × keeps invocation events and engine-call rows inside the issuing worktree after receipt loss 466ms
     ✓ completes missing subagent attribution before a real append 631ms
   ✓ canonical ledger reads on real files (1)
     ✓ distinguishes unreadable missing malformed and clean ledger coverage without writing 428ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/ledgers/journal.integration.test.ts > explicit invocation on real worktrees > resumes explicit invocation across two real worktrees without identity leakage
AssertionError: expected 0 to be greater than 0
 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts:350:26
    348|       .filter((l) => l !== "")
    349|       .map((l) => JSON.parse(l) as Record<string, unknown>);
    350|     expect(grown.length).toBeGreaterThan(0);
       |                          ^
    351|     expect(grown.every((r) => r["type"] === "engine-call")).toBe(true);
    352|     expect(fs.readFileSync(otherStatus, "utf-8")).toBe(afterB);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/ledgers/journal.integration.test.ts > explicit invocation on real worktrees > keeps invocation events and engine-call rows inside the issuing worktree after receipt loss
AssertionError: expected [] to have a length of 1 but got +0

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts:379:66
    377|       .filter((l) => l !== "")
    378|       .map((l) => JSON.parse(l) as Record<string, unknown>);
    379|     expect(events.filter((r) => JSON.stringify(r).includes(id))).toHav…
       |                                                                  ^
    380|     expect(fs.readFileSync(otherStatus, "utf-8")).toBe(otherBytes);
    381|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 9 passed (11)
   Start at  22:23:27
   Duration  7.60s (tests 92%, transform 4%, import 3%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-2FG7XN/junit.xml
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

[test-timeout-budget] load average 19.5 on 10 cores: unit limits 14250ms per test, 28500ms per hook (x2.85)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/commands/lib.test.ts (72 tests | 1 failed) 7621ms
   ✓ parseFlags (20)
     ✓ accepts --flag=value and --flag value, camelCases kebab names 14ms
     ✓ collects repeatable flags and sets booleans 2ms
     ✓ ["--fid=1","--nope=x"] is a usage error 3ms
     ✓ ["--verify-attempt=1"] is a usage error 0ms
     ✓ ["--fid=1","--fid=2"] is a usage error 0ms
     ✓ ["--fid"] is a usage error 4ms
     ✓ ["--fid","--dry-run"] is a usage error 0ms
     ✓ ["--fid=1","--dry-run=yes"] is a usage error 0ms
     ✓ ["467"] is a usage error 2ms
     ✓ ["--fid="] is a usage error 1ms
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
     ✓ returns null for anything that is not a registered noun 1ms
     ✓ runs a verb: text on stdout, tagged log on stderr 1ms
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
     ✓ prints verb help without running the verb 0ms
     ✓ leaves a classic verb alone unless the second word is one of the command's verbs 0ms
     ✓ still answers `--help` for a noun that is also a classic verb 0ms
     ✓ takes the global --json flag on any verb, sets ctx.json and prints JSON 1ms
     ✓ refuses --json with a value 0ms
   ✓ --json on every registered command (3)
     ✓ no verb declares its own --json flag 0ms
     ✓ every verb's flag parsing accepts --json 5ms
     ✓ every verb's text output reads back as its --json output, less its textOmit keys 19ms
   ✓ help (3)
     ✓ noun help lists every verb and the shared exit codes 1ms
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
     ✓ repoRoot resolves the main checkout from inside a linked worktree 268ms
     ✓ repoRoot outside a repository is a usage error 18ms
     ✓ design / plan / build / debug: worktree copy when it exists, else the main checkout 286ms
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 421ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1410ms
     ✓ runGit keeps output past Node's 1MB default 145ms
     ✓ runGit names ENOBUFS when output passes the limit 2483ms
     ✓ runGit names a spawn error instead of failing silently 5ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1438ms
     ✓ runTool still reports a missing binary as not found 26ms
   ✓ resolveActiveRun (4)
     ✓ resolveActiveRun falls back to the cwd scan when --file names a non-status file 93ms
     ✓ still takes a status.jsonl --file as the run itself 64ms
     ✓ never files a --fid call under another feature's in-progress run 145ms
     ✓ finds a --fid run that started in an earlier month through the scan 269ms
   ❯ explicit invocation context (2)
     ✓ rejects stale cross-worktree invocation and conflicting overrides 320ms
     × writes the engine-call row for an invocation-bound command 160ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/lib.test.ts > explicit invocation context > writes the engine-call row for an invocation-bound command
AssertionError: expected [] to deeply equal [ { noun: 'probe', …(3) } ]

- Expected
+ Received

- [
-   {
-     "cwd": "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-lib-inv-AdS0Zy",
-     "invocation": "inv-9b592b6980c4c871182b27e24ce7b942",
-     "noun": "probe",
-     "verb": "show",
-   },
- ]
+ []

 ❯ .bkit/core/engine/commands/lib.test.ts:980:18
    978|     });
    979|     expect(bound).toBe(0);
    980|     expect(seen).toEqual([{ noun: "probe", verb: "show", cwd: a, invoc…
       |                  ^
    981|
    982|     // A refused invocation never reaches the journal.

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 71 passed (72)
   Start at  22:23:40
   Duration  9.20s (tests 85%, transform 10%, import 4%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-9P38CE/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
