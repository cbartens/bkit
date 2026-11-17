Enforced: true
Red: 5
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 8, attempt 1

Plan: `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 25 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "prepares afresh when nothing landed and a foreign row followed" | red | failure: operation op-nothing-landed: docs/failures.jsonl holds 27 of 286 prepared bytes at the recorded offset; the effect is uncertain, nothing was truncated or retried |
| 26 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "does not push a second re-trigger copy after a lost push response on a shared branch" | red | failure: expected 2 to be 1 // Object.is equality |
| 27 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses a result file left from an earlier round" | red | failure: expected 2 to be 6 // Object.is equality |
| 28 | `.bkit/core/engine/commands/workflow/counters.test.ts` "refuses a reused correction candidate id with different rows" | red | failure: expected 2 to be +0 // Object.is equality |
| 29 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "marks a page with a next cursor as not clean" | red | failure: expected true to be false // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/ledgers/journal.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/ledgers/journal.integration.test.ts

```

## Runner output — `.bkit/core/engine/ledgers/journal.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/ledgers/journal.integration.test.ts

[test-timeout-budget] load average 24.9 on 10 cores: unit limits 16950ms per test, 33900ms per hook (x3.39)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts (22 tests | 2 failed) 40011ms
   ✓ the dispatch seam on a real worktree (7)
     ✓ writes friction to the run's own book root 336ms
     ✓ writes no friction row for a declared routing exit 237ms
     ✓ skips a call made outside the run's worktree 324ms
     ✓ writes nothing when no run is active in the cwd 326ms
     ✓ a call launched from a git hook writes no engine-call row 1520ms
     ✓ branches rebase finishes a rebase paused on a commit that carries the run's status file 1322ms
     ✓ branches anchor-read with a plan --file journals into the active run 287ms
   ✓ explicit invocation on real worktrees (3)
     ✓ resumes explicit invocation across two real worktrees without identity leakage 761ms
     ✓ keeps invocation events and engine-call rows inside the issuing worktree after receipt loss 700ms
     ✓ completes missing subagent attribution before a real append 595ms
   ✓ canonical ledger reads on real files (1)
     ✓ distinguishes unreadable missing malformed and clean ledger coverage without writing 411ms
   ❯ replay-safe ledger appends on real files (7)
     ✓ reconciles lost append response at each durable checkpoint without duplicate rows 612ms
     ✓ serializes concurrent append operations and blocks partial uncertain ledger writes 2677ms
     ✓ keeps rendered audit report appended rows and tracker draft counts identical 949ms
     ✓ resolves a pending ledger intent after its invocation is stale 903ms
     ✓ appends the printed audit ledgerRows verbatim under the standalone invocation 673ms
     ✓ refuses to re-append a partly landed block after a foreign writer appended 664ms
     × prepares afresh when nothing landed and a foreign row followed 479ms
   ❯ persistent CI handoff on a real local remote (3)
     ✓ resumes nonwaiting CI polls without resetting attempts or duplicating retrigger 17301ms
     ✓ blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it 2230ms
     × does not push a second re-trigger copy after a lost push response on a shared branch 4176ms
   ✓ bounded correction on real ledgers (1)
     ✓ resumes corrected substep and blocks exhausted unauthorized or uncertain effects 2524ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/ledgers/journal.integration.test.ts > replay-safe ledger appends on real files > prepares afresh when nothing landed and a foreign row followed
Error: operation op-nothing-landed: docs/failures.jsonl holds 27 of 286 prepared bytes at the recorded offset; the effect is uncertain, nothing was truncated or retried
 ❯ .bkit/core/engine/commands/workflow/ledgers.ts:1761:19
    1759|             landedBytes++;
    1760|           if (landedBytes > 0 || (seg.length > 0 && have.length === in…
    1761|             throw new UncertainEffect(
       |                   ^
    1762|               EXIT_STAGE,
    1763|               `operation ${operation}: ${file} holds ${landedBytes} of…
 ❯ withTargetLock .bkit/core/engine/ledgers/status.ts:883:12
 ❯ .bkit/core/engine/commands/workflow/ledgers.ts:1707:14
 ❯ withTargetLock .bkit/core/engine/ledgers/status.ts:883:12
 ❯ appendLedgerRows .bkit/core/engine/commands/workflow/ledgers.ts:1695:12
 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts:1023:20

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/ledgers/journal.integration.test.ts > persistent CI handoff on a real local remote > does not push a second re-trigger copy after a lost push response on a shared branch
AssertionError: expected 2 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 2

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts:1353:33
    1351|     expect(resumed.ciDispatch).toMatchObject({ outcome: "self-healed",…
    1352|     // No second copy was pushed; the remote still ends at the one cop…
    1353|     expect(shared.retriggers()).toBe(1);
       |                                 ^
    1354|     expect(shared.tip()).toBe(copy);
    1355|     const remoteSha = (handoffRows(shared).at(-1)!["retrigger"] as { r…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 20 passed (22)
   Start at  13:01:59
   Duration  41.21s (tests 98%, transform 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Xbr1Ac/junit.xml
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

[test-timeout-budget] load average 31.6 on 10 cores: unit limits 20300ms per test, 40600ms per hook (x4.06)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts (125 tests | 1 failed) 53970ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 969ms
     ✓ preserves local clamp enforcement when completing test rounds 303ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 202ms
     ✓ done prints progressLine 323ms
     ✓ progress output metadata 1ms
     ✓ gate progress number validation 266ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 635ms
     ✓ done --group writes group on the row 587ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 1223ms
     ✓ --commit=none writes the row and leaves it uncommitted 244ms
     ✓ build-group-start records parentSha and group 244ms
     ✓ carries extra fields, parsed as JSON when they are JSON 428ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 139ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 135ms
     ✓ refuses an empty artifact 136ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 144ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 186ms
     ✓ rejects ["--verdict=MAYBE"] 160ms
     ✓ rejects ["--strategy=YOLO"] 148ms
     ✓ rejects ["--failures=-1"] 157ms
     ✓ rejects ["--field=verdict=PASS"] 178ms
     ✓ rejects ["--status=SKIPPED"] 157ms
     ✓ needs a message unless --commit=none 187ms
     ✓ reports a failed commit with exit 8 without writing the row 586ms
     ✓ a failed commit leaves no row staged in the index 638ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 861ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 898ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 732ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 663ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 760ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 155ms
     ✓ a missing artifact exits 4 147ms
     ✓ empty artifact exits 0 142ms
     ✓ pending artifact exits 1 133ms
     ✓ no marker artifact exits 2 147ms
     ✓ disallowed artifact exits 3 159ms
     ✓ bad failures artifact exits 4 142ms
     ✓ a required field that is absent is invalid (re-prompt) 161ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 230ms
     ✓ only reads above the marker 145ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 431ms
     ✓ fails when no row was written for the step 180ms
     ✓ --ref reads the status file as committed on that ref, not from disk 520ms
     ✓ --ref exits 3 when the ref does not carry the status file 460ms
     ✓ fails on a placeholder left in the artifact 413ms
     ✓ fails when the row's verdict differs from the artifact's 382ms
     ✓ fails when the row does not list the artifact, or carries another attempt 499ms
     ✓ fails on a missing artifact 382ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 501ms
     ✓ refuses a negative or non-integer attempt (2) 231ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 181ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 215ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 135ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 183ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 185ms
     ✓ fails a diagnose row missing its strategy, passes with it 350ms
     ✓ fails a run-tests row missing its scope, and an empty scope 500ms
     ✓ names every missing field at once 187ms
     ✓ asks nothing of a step that writes none of them 198ms
     ✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 21ms
   ✓ ledger writer references (1)
     ✓ every configured writer has a prompt file 1ms
   ✓ placeholderLines (1)
     ✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 1ms
   ✓ bkit steps finish (16)
     ✓ preserves challenge findings in the event when a later round overwrites the report 173ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 640ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 143ms
     ✓ re-asks (exit 6) when a field the prompt declares is missing 141ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 162ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 572ms
     ✓ a true | false header field is true when any agent sets it true 221ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 242ms
     ✓ records the header's Strategy on the row 306ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 203ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 511ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 137ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 343ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 663ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 930ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 674ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 792ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1304ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 827ms
     ✓ --post needs --number; without --post there is no tracker key 327ms
   ✓ bkit steps stub (3)
     ✓ copies the prior version under a PENDING header 172ms
     ✓ --strip-header drops the prior version's own header 147ms
     ✓ exits 4 when the prior version is missing or empty 151ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 135ms
     ✓ checks the FID's shape for the wired tracker 196ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 417ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 192ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 919ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 636ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 448ms
       ✓ gate --issue without --fid is a usage error 170ms
       ✓ gate --issue="" under none keeps today's check 184ms
     ✓ --attempt-of checks the row carries the derived counter 449ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1355ms
     ✓ writeStepRow refuses when a recorded path changed 2176ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 581ms
     ✓ writeStepRow appends its commit sha to the record 1079ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1466ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 479ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 927ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 757ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 531ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1692ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 1216ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 770ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 593ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1356ms
     ✓ exit codes list 11 as planned tests touched and 15 as source touched in the tests step 0ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 241ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 548ms
     ✓ does not count an artifact the run found committed when it started 692ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 564ms
     ✓ commits a package.json change outside bkit.workflows 804ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1249ms
   ❯ bkit steps stub --result-file (9)
     ✓ derives supported header fields and rejects stale bodies without false PASS 153ms
     ✓ registers every named header kind 18ms
     ✓ renders and verifies the header of every prompt that declares one 234ms
     ✓ renders no PASS from a result that omits its evidence 194ms
     ✓ refuses line breaks in header-bound result values 145ms
     ✓ retains special verdict judgments and legacy stub behavior 156ms
     ✓ derives audit IDs totals ledger payloads and coverage from one result 171ms
     × refuses a result file left from an earlier round 146ms
     ✓ audit result render keeps an existing anchored report intact 132ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps stub --result-file > refuses a result file left from an earlier round
AssertionError: expected 2 to be 6 // Object.is equality

- Expected
+ Received

- 6
+ 2

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2571:22
    2569|       "--invocation=inv-round-2",
    2570|     ]);
    2571|     expect(res.code).toBe(6);
       |                      ^
    2572|     expect(res.err).toMatch(/invocation|round|earlier|stale/i);
    2573|     expect(fs.existsSync(path.join(cwd, "logs/challenge-2.md"))).toBe(…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 124 passed (125)
   Start at  13:02:44
   Duration  55.83s (tests 97%, transform 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Yp0rKd/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/counters.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/counters.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/counters.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/counters.test.ts

[test-timeout-budget] load average 34.9 on 10 cores: unit limits 21950ms per test, 43900ms per hook (x4.39)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/commands/workflow/counters.test.ts (64 tests | 1 failed) 2663ms
   ✓ bkit counters derive (12)
     ✓ next = count + 1, current = count, count = count 6ms
     ✓ current refuses 0 (the step's own row is missing); count allows it 3ms
     ✓ counts only the active run: a fresh run starts at attempt 1 2ms
     ✓ counters isolate by group 2ms
     ✓ rejects an empty or non-integer --group instead of silently counting every group 2ms
     ✓ a decision row never resets the count, and --since is refused 2ms
     ✓ de-dupes: distinct parentSha = two attempts, byte-identical replay = one 3ms
     ✓ treats a step name with shell metacharacters as data 1ms
     ✓ exits 3 on a missing file and 2 on an unknown position 1ms
     ✓ counts only DONE rows: a FAILED row is not an attempt 2ms
     ✓ a build resumed after an interleaved finished debug run keeps its run and its budget 2ms
     ✓ a paused run keeps counting after another workflow's run interleaves 1ms
   ✓ bkit counters run (6)
     ✓ is 1 before any run, and stays the same across the run's own start row 3ms
     ✓ is n+1 after a finished run, and a resume keeps its number 3ms
     ✓ an interleaved debug run leaves the paused build run in progress 2ms
     ✓ is n+1 after a FAILED run too 1ms
     ✓ counts only this workflow's runs; a union-merge duplicate is one run 1ms
     ✓ exits 3 on a missing file 0ms
   ✓ bkit counters route (10)
     ✓ continues at the cap and below 1ms
     ✓ exits 1 one over the cap, naming the counter on stderr 0ms
     ✓ a max of 0 lets value 0 through and stops value 1 0ms
     ✓ refuses value "" (exit 2, nothing on stdout) 0ms
     ✓ refuses value "abc" (exit 2, nothing on stdout) 0ms
     ✓ refuses value "1.5" (exit 2, nothing on stdout) 0ms
     ✓ refuses value "-1" (exit 2, nothing on stdout) 0ms
     ✓ refuses an empty or non-integer max with nothing on stdout 0ms
     ✓ takes the max from an ask point with --point 29ms
     ✓ needs exactly one of --max and --point 0ms
   ✓ bkit counters route --of (6)
     ✓ derives the value from the active run's DONE rows of the step 3ms
     ✓ counts one group's rows with --group 3ms
     ✓ exits 4 when :current finds the step's own row missing 2ms
     ✓ sums the DONE rows of several steps with <step>,<step>:count 2ms
     ✓ refuses a step list off :count, a repeated step, or an empty list entry 4ms
     ✓ needs exactly one of --value and --of, and --file with --workflow for --of 1ms
   ✓ bkit counters route --point (7)
     ✓ takes each point's default limit and asks when nothing is set 694ms
     ✓ reads ask and the limit from bkit.workflows 66ms
     ✓ an invalid limit or ask takes its default 47ms
     ✓ takes the limit the run froze at its start, not package.json's live value 3ms
     ✓ reads package.json when the run froze no limit for the point 107ms
     ✓ max --point takes the run's frozen limit with --file and --workflow, else package.json 37ms
     ✓ a headless run never asks 48ms
   ✓ bkit counters grant (4)
     ✓ grants one more full allowance at the used-up limit, and route counts it 209ms
     ✓ grants nothing below the limit, and nothing when nobody can agree 105ms
     ✓ a grant raises only the loop it was given for 104ms
     ✓ counts grants of the active run only, unless --all-runs 122ms
   ✓ bkit counters route --since-clean (4)
     ✓ counts only the rounds after the step's last clean round 101ms
     ✓ a CONCERNS round with 0 failures is clean, one with failures is not 101ms
     ✓ counts only the grants after the last clean round, and only those without a group 170ms
     ✓ refuses --since-clean without one --of step, or with --all-runs 28ms
   ✓ bkit counters progress (5)
     ✓ reports a falling count as closing and recommends another round 28ms
     ✓ reports the same count as stuck and a rising count as worse 51ms
     ✓ leaves codeChanged null when git cannot compare the rounds 26ms
     ✓ judges codeChanged on source only, from the rounds' parent commits 427ms
     ✓ exits 3 on a missing file 0ms
   ✓ loopTrend (1)
     ✓ a fall without a code change is stuck, not closing 1ms
   ✓ bkit counters max (2)
     ✓ returns one point's limit and ask setting, or every point as set 81ms
     ✓ refuses an unknown point 1ms
   ✓ bkit counters rows (5)
     ✓ counts rows of the type since the active run's workflow-started row 2ms
     ✓ an engine-action row between counted rows is not counted 1ms
     ✓ a resumed run does not inherit a crashed run's rows (no workflow-finished between) 1ms
     ✓ route --rows derives the value from typed rows of the active run 2ms
     ✓ starts at 1 on a fresh run, and refuses a bad position or a missing log 1ms
   ❯ bkit counters correction (2)
     ✓ shares correction budget across candidate operations and honors specific limits 4ms
     × refuses a reused correction candidate id with different rows 9ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/counters.test.ts > bkit counters correction > refuses a reused correction candidate id with different rows
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/counters.test.ts:1170:24
    1168|     // The first candidate under op-b is spent once.
    1169|     const first = await withRows("op-b", "hash-1");
    1170|     expect(first.code).toBe(0);
       |                        ^
    1171|     expect(first.json).toMatchObject({ allowed: true, used: 1, limit: …
    1172|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 63 passed (64)
   Start at  13:03:42
   Duration  3.44s (tests 82%, transform 8%, import 8%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-n6FFNj/junit.xml
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

[test-timeout-budget] load average 33.1 on 10 cores: unit limits 21050ms per test, 42100ms per hook (x4.21)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts (107 tests | 1 failed) 37860ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 630ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 563ms
     ✓ brand-new untracked ledger is staged and committed 536ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 463ms
     ✓ path containing a space is staged and committed 458ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 386ms
     ✓ staging failure: exit 4 and no commit is created, no false success 341ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 362ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 375ms
     ✓ --mode=stage stages the sweep but creates no commit 462ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 1063ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 613ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 565ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 346ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 271ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 281ms
     ✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 104ms
     ✓ usage error ["--scope=core","--mode=push","--message=m"] exits 2 79ms
     ✓ usage error ["--scope=core","--mode=commit"] exits 2 87ms
     ✓ root that is not a directory or not a repo exits 3 23ms
     ✓ --root defaults to the working directory 430ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 642ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 665ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 579ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 547ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 336ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 167ms
     ✓ a path outside the checkout exits 6 with nothing committed 304ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 441ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 266ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 767ms
     ✓ --path records its commit on the run's record, like every other commit mode 716ms
     ✓ a recorded ledger commits only the rows the run appended 1102ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 1468ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 1196ms
     ✓ commitBookkeeping refuses when a recorded path changed 744ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 872ms
     ✓ under --mode=commit counts the squashed paths as something to commit 839ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 521ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 374ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 502ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 410ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 328ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 223ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 345ms
     ✓ carries untracked ledgers too 291ms
     ✓ keeps rows on separate lines when the destination has no final newline 310ms
     ✓ src that is not a git repo exits 3 71ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 582ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 702ms
     ✓ a source file in the range: exit 7, path listed 648ms
     ✓ another FID's plan file in the range: exit 7 597ms
     ✓ from not an ancestor of to: exit 7 470ms
     ✓ unknown commit exits 3; a missing flag exits 2 289ms
   ✓ bookPathspecs (2)
     ✓ grows core -> full -> pr 0ms
     ✓ appends the repo's extra bookkeeping paths as :(glob) pathspecs under pr only 0ms
   ✓ bookPathspecs — frozen bookkeeping allow-list (1)
     ✓ scope=pr reaches every frozen entry, the FID log dir, and the docs/*.jsonl ledger glob 0ms
   ✓ bkit ledgers append (20)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 178ms
     ✓ append keeps a row's own repo 184ms
     ✓ append refuses a supplied ts 152ms
     ✓ append refuses a supplied schema or bkit 198ms
     ✓ append refuses a flat top-level field the top section moved into by 174ms
     ✓ append writes nothing when one row is invalid 173ms
     ✓ append refuses a row whose kind is not the ledger's 128ms
     ✓ append --ledger=stats takes compliance, counter and outcome rows 187ms
     ✓ append --ledger=stats refuses another kind, a non-closing writer, and a total that does not match its parts 259ms
     ✓ append bumps a round-second mint 184ms
     ✓ append refuses an empty rows file 118ms
     ✓ append refuses an unknown or issues ledger 104ms
     ✓ append refuses a writer not listed for the kind 249ms
     ✓ append starts a new line when the ledger lacks its final newline 184ms
     ✓ append creates the ledger and its directory 173ms
     ✓ append stamps a keyed row's first write firstTs = ts, updates = 1 166ms
     ✓ append carries firstTs forward and counts updates, across calls and within one batch 245ms
     ✓ append replaces a supplied firstTs / updates with the computed values 147ms
     ✓ append continues the count from a compacted winner 173ms
     ✓ append leaves rows outside the five keyed-ledger kinds without firstTs / updates 165ms
   ✓ bkit ledgers compact (5)
     ✓ compacts every keyed ledger by default and reports per-ledger counts 112ms
     ✓ --ledger narrows the run to one ledger 27ms
     ✓ --dry-run counts without writing 26ms
     ✓ a second run changes nothing 56ms
     ✓ refuses an unknown --ledger with a usage error 1ms
   ✓ bkit ledgers check (4)
     ✓ passes when every key on the Ledger rows line has a decision or deferral row 4ms
     ✓ names the keys no row carries and exits EXIT_ROWS_MISSING 4ms
     ✓ passes on None 2ms
     ✓ refuses a plan with no Ledger rows line or an unfilled one 2ms
   ✓ bkit ledgers triage (11)
     ✓ triage keeps a low-severity deferral exempt 189ms
     ✓ triage keeps an own-cycle deferral exempt 191ms
     ✓ triage marks an unjustified deferral lazy 253ms
     ✓ triage writes an unjustified row with a minted ts 259ms
     ✓ triage writes no row for a closed deferral 207ms
     ✓ triage reports an adjudicated unjustified row outside exempt 202ms
     ✓ triage ignores another feature's deferral rows 254ms
     ✓ triage writes nothing when the FID has no deferral row 195ms
     ✓ triage refuses a plan with no task blocks 297ms
     ✓ triage refuses a plan whose task blocks do not parse 293ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 290ms
   ✓ bkit ledgers append --invocation (5)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 778ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 539ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 728ms
     ✓ lands a standalone corrected candidate and reports the spend 460ms
     ✓ issues the same operation for rows whose keys are reordered 429ms
   ❯ bkit ledgers query (2)
     ✓ pages canonical winners with diagnostics and rejects stale cursors 114ms
     × marks a page with a next cursor as not clean 141ms
   ✓ bkit ledgers append --operation (3)
     ✓ returns durable append receipt and permits a deliberate same-key update 292ms
     ✓ keeps ledger operation intents and receipts out of committed book paths 676ms
     ✓ refuses --issue-operation without an invocation or beside --operation, writing nothing 542ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers query > marks a page with a next cursor as not clean
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:2181:41
    2179|     expect(partial.json.rows).toHaveLength(1);
    2180|     expect(partial.json.nextCursor).not.toBeNull();
    2181|     expect(partial.json.coverage.clean).toBe(false);
       |                                         ^
    2182|     expect(partial.json.coverage.status).not.toBe("clean");
    2183|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 106 passed (107)
   Start at  13:03:48
   Duration  38.63s (tests 99%, transform 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-AIuvUA/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
