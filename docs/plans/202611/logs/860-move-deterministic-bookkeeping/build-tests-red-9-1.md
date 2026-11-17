Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 9, attempt 1

Plan: `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 30 | `.bkit/core/engine/commands/workflow/steps.test.ts` "derives a fresh audit key when the ledger already holds it" | red | failure: expected 'audit-security-token-logged' not to be 'audit-security-token-logged' // Object.is equality |
| 31 | `.bkit/core/engine/commands/workflow/status.test.ts` "refuses to issue an invocation through a status file symlinked out of the checkout" | red | failure: expected +0 not to be +0 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/steps.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/steps.test.ts

[test-timeout-budget] load average 3.2 on 10 cores: unit limits 6100ms per test, 12200ms per hook (x1.22)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts (126 tests | 1 failed) 13203ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 164ms
     ✓ preserves local clamp enforcement when completing test rounds 50ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 45ms
     ✓ done prints progressLine 52ms
     ✓ progress output metadata 0ms
     ✓ gate progress number validation 46ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 128ms
     ✓ done --group writes group on the row 101ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 163ms
     ✓ --commit=none writes the row and leaves it uncommitted 50ms
     ✓ build-group-start records parentSha and group 49ms
     ✓ carries extra fields, parsed as JSON when they are JSON 102ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 39ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 42ms
     ✓ refuses an empty artifact 40ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 40ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 39ms
     ✓ rejects ["--verdict=MAYBE"] 39ms
     ✓ rejects ["--strategy=YOLO"] 40ms
     ✓ rejects ["--failures=-1"] 40ms
     ✓ rejects ["--field=verdict=PASS"] 44ms
     ✓ rejects ["--status=SKIPPED"] 47ms
     ✓ needs a message unless --commit=none 52ms
     ✓ reports a failed commit with exit 8 without writing the row 507ms
     ✓ a failed commit leaves no row staged in the index 210ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 288ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 256ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 470ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 225ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 492ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 49ms
     ✓ a missing artifact exits 4 39ms
     ✓ empty artifact exits 0 37ms
     ✓ pending artifact exits 1 37ms
     ✓ no marker artifact exits 2 38ms
     ✓ disallowed artifact exits 3 39ms
     ✓ bad failures artifact exits 4 40ms
     ✓ a required field that is absent is invalid (re-prompt) 40ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 39ms
     ✓ only reads above the marker 37ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 101ms
     ✓ fails when no row was written for the step 41ms
     ✓ --ref reads the status file as committed on that ref, not from disk 120ms
     ✓ --ref exits 3 when the ref does not carry the status file 127ms
     ✓ fails on a placeholder left in the artifact 102ms
     ✓ fails when the row's verdict differs from the artifact's 100ms
     ✓ fails when the row does not list the artifact, or carries another attempt 102ms
     ✓ fails on a missing artifact 104ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 104ms
     ✓ refuses a negative or non-integer attempt (2) 39ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 45ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 47ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 40ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 46ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 45ms
     ✓ fails a diagnose row missing its strategy, passes with it 99ms
     ✓ fails a run-tests row missing its scope, and an empty scope 137ms
     ✓ names every missing field at once 45ms
     ✓ asks nothing of a step that writes none of them 46ms
     ✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 8ms
   ✓ ledger writer references (1)
     ✓ every configured writer has a prompt file 0ms
   ✓ placeholderLines (1)
     ✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 0ms
   ✓ bkit steps finish (16)
     ✓ preserves challenge findings in the event when a later round overwrites the report 47ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 139ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 39ms
     ✓ re-asks (exit 6) when a field the prompt declares is missing 38ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 39ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 45ms
     ✓ a true | false header field is true when any agent sets it true 56ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 52ms
     ✓ records the header's Strategy on the row 54ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 51ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 123ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 39ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 89ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 158ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 210ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 157ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 194ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 293ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 186ms
     ✓ --post needs --number; without --post there is no tracker key 70ms
   ✓ bkit steps stub (3)
     ✓ copies the prior version under a PENDING header 40ms
     ✓ --strip-header drops the prior version's own header 40ms
     ✓ exits 4 when the prior version is missing or empty 39ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 39ms
     ✓ checks the FID's shape for the wired tracker 52ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 91ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 45ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 180ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 133ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 90ms
       ✓ gate --issue without --fid is a usage error 39ms
       ✓ gate --issue="" under none keeps today's check 45ms
     ✓ --attempt-of checks the row carries the derived counter 104ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 265ms
     ✓ writeStepRow refuses when a recorded path changed 304ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 146ms
     ✓ writeStepRow appends its commit sha to the record 254ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 409ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 98ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 200ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 190ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 134ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 339ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 224ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 181ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 121ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 320ms
     ✓ exit codes list 11 as planned tests touched and 15 as source touched in the tests step 0ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 53ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 119ms
     ✓ does not count an artifact the run found committed when it started 158ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 97ms
     ✓ commits a package.json change outside bkit.workflows 140ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 254ms
   ❯ bkit steps stub --result-file (10)
     ✓ derives supported header fields and rejects stale bodies without false PASS 44ms
     ✓ registers every named header kind 6ms
     ✓ renders and verifies the header of every prompt that declares one 59ms
     ✓ renders no PASS from a result that omits its evidence 43ms
     ✓ refuses line breaks in header-bound result values 42ms
     ✓ retains special verdict judgments and legacy stub behavior 45ms
     ✓ derives audit IDs totals ledger payloads and coverage from one result 50ms
     × derives a fresh audit key when the ledger already holds it 49ms
     ✓ refuses a result file left from an earlier round 42ms
     ✓ audit result render keeps an existing anchored report intact 43ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps stub --result-file > derives a fresh audit key when the ledger already holds it
AssertionError: expected 'audit-security-token-logged' not to be 'audit-security-token-logged' // Object.is equality
 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2600:33
    2598|     expect(rows).toHaveLength(1);
    2599|     // The old, still-open row keeps its key; the new problem gets a s…
    2600|     expect(rows[0]!["key"]).not.toBe("audit-security-token-logged");
       |                                 ^
    2601|     expect(rows[0]!["key"]).toBe("audit-security-token-logged-2");
    2602|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 125 passed (126)
   Start at  15:26:37
   Duration  13.38s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-cxkgwR/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/status.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/status.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/status.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/status.test.ts

[test-timeout-budget] load average 3.0 on 10 cores: unit limits 6000ms per test, 12000ms per hook (x1.20)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/commands/workflow/status.test.ts (82 tests | 1 failed) 935ms
   ✓ debug evidence state (5)
     ✓ persists atomic selections and preserves identical evidence generations 5ms
     ✓ resumes saved evidence and replaces it only on explicit new selection 30ms
     ✓ clears saved CI routing immediately for explicit local selection 14ms
     ✓ counts reproduction and fixes only in the active generation 20ms
     ✓ orders covering gates for red tiers and preserves live off 28ms
   ✓ bkit status path (2)
     ✓ returns the main checkout's path outside a worktree, and whether it exists 18ms
     ✓ rejects a month that is not YYYYMM 0ms
   ✓ the status fold (4)
     ✓ skips a row it does not model (no type, an unknown type) and folds the rest 1ms
     ✓ ignores a row type it does not know 1ms
     ✓ refuses a line that is not JSON rather than folding around it (exit 3) 0ms
     ✓ a command reading the log reports the malformed line with exit 3 0ms
   ✓ bkit status route (20)
     ✓ reads the last verdict and failures of a step in the active run, per group 0ms
     ✓ reads a build-plan-execute row written before the step rename as build-plan-tasks 1ms
     ✓ prints the parentSha of the step's last row in the active run, per group 1ms
     ✓ counts absent failures as 0 when a verdict is present 1ms
     ✓ reads an absent failures count on FAIL as null: the count is unknown, not 0 0ms
     ✓ does not leak a completed run's verdict into a fresh run 1ms
     ✓ reads strategy across ALL runs and gives the next rung 0ms
     ✓ starts the ladder at STANDARD when no strategy is recorded 0ms
     ✓ prefers the run-level debugMode over an older step value, and reads pushMode and debugAttempt 0ms
     ✓ fails a --require'd mode that is missing or invalid 1ms
     ✓ is a usage error to require a step field without --step 0ms
     ✓ exits 3 when status.jsonl is missing 0ms
     ✓ falls back to the last step carrying debugMode / pushMode when no workflow-meta sets it 0ms
     ✓ reports an invalid mode as null, never as a mode 0ms
     ✓ climbs the ladder: PIVOT -> FINAL 0ms
     ✓ climbs the ladder: FINAL -> FINAL 0ms
     ✓ fails a --require'd strategy outside the ladder 0ms
     ✓ fails a --require'd verdict when the last DONE row carries none 0ms
     ✓ reads strategy per group, from the step's last DONE row, within its own workflow 1ms
     ✓ a non-numeric debugAttempt reads as 0 0ms
   ✓ bkit status route --prompt-file (debug Step 1) (12)
     ✓ a fresh run: attempt 1, NORMAL, no repro, every gate 7ms
     ✓ a resumed run keeps its attempt number 7ms
     ✓ fix rounds used up across runs (debug.fix.maxAttempts) enter SOAK 7ms
     ✓ the fix limit comes from bkit.workflows.debug.fix.maxAttempts 13ms
     ✓ [soak] and [repro] in the prompt 6ms
     ✓ a resumed run that soaked continues in SOAK 7ms
     ✓ soak rows of a finished run do not force SOAK on the next run 6ms
     ✓ an escalation recorded only in workflow-meta survives a resume 8ms
     ✓ [live=off] in the prompt drops the live gate; the issue body is not read 14ms
     ✓ finds status.jsonl from --fid and --month 35ms
     ✓ refuses --prompt-file for another workflow, and a missing --file without --fid 1ms
     ✓ a missing prompt file is a usage error 0ms
   ✓ bkit status route --workflow=build publish (7)
     ✓ lets the publish token override publish.local 13ms
     ✓ reads publish.local on LOCAL without a token 7ms
     ✓ coerces publish false to true on a non-LOCAL runtime 7ms
     ✓ accepts --prompt-file with --workflow=build 7ms
     ✓ ignores publish=maybe and falls through to config 7ms
     ✓ refuses publish without a runtime-resolved row 6ms
     ✓ prints publishSource for token, local, remote and coerced 27ms
   ✓ bkit status route --expect (4)
     ✓ passes when every field holds the expected value 0ms
     ✓ exits 4 naming a field that holds another value 0ms
     ✓ an expected field is also required: missing exits 4 0ms
     ✓ checks a step field with --step, and refuses an unknown field 1ms
   ✓ bkit status meta (9)
     ✓ appends a workflow-meta row the route read then sees 0ms
     ✓ records openedPr, and refuses the removed --soak-entry and --decision 0ms
     ✓ --debug-attempt=run records the active run's number 0ms
     ✓ meta refuses --plan-source 0ms
     ✓ rejects ["--debug-mode=TURBO"] 0ms
     ✓ rejects ["--push-mode=REMOTE"] 1ms
     ✓ rejects ["--debug-attempt=0"] 0ms
     ✓ rejects [] 0ms
     ✓ never starts a log 0ms
   ✓ bkit status row (6)
     ✓ appends a typed row with fields parsed as JSON where they are JSON 1ms
     ✓ refuses ["--type=step-done"] 0ms
     ✓ refuses ["--type=Ship_Gate"] 0ms
     ✓ refuses ["--type=x","--field=at=now"] 0ms
     ✓ refuses ["--type=x","--field=Bad=1"] 0ms
     ✓ never starts a log (exit 3) 0ms
   ✓ bkit status row owner-pause friction (6)
     ✓ status row owner-pause appends one human-confirm friction row 36ms
     ✓ status row owner-pause skips the friction row when no step-done follows the last owner-pause with the same reason 30ms
     ✓ status row owner-pause with a new reason appends its own row with no step-done in between 46ms
     ✓ status row owner-pause in a later pause appends a same-key recurrence 46ms
     ✓ status row writes no friction row for other types or with BKIT_ENGINE_JOURNAL=off 13ms
     ✓ status row owner-pause keeps the status row and exits 4 when the friction row cannot be written 23ms
   ❯ bkit status invocation (7)
     ✓ issues invocation metadata from an explicit run and registered step 74ms
     ✓ refuses to issue an invocation into a status file outside the issuing checkout 47ms
     × refuses to issue an invocation through a status file symlinked out of the checkout 46ms
     ✓ writes no absolute checkout path into the run's committed invocation event 53ms
     ✓ records the issued invocation in the run status log and rebuilds a deleted receipt 68ms
     ✓ binds group and attempt and registers setup, remediation and ship steps 107ms
     ✓ registers the no-plan conversion step 29ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/status.test.ts > bkit status invocation > refuses to issue an invocation through a status file symlinked out of the checkout
AssertionError: expected +0 not to be +0 // Object.is equality
 ❯ .bkit/core/engine/commands/workflow/status.test.ts:1281:24
    1279|       mine,
    1280|     );
    1281|     expect(r.code).not.toBe(0);
       |                        ^
    1282|     expect(fs.readFileSync(otherFile, "utf-8")).toBe(before);
    1283|     expect(fs.readFileSync(otherFile, "utf-8")).not.toContain('"invoca…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 81 passed (82)
   Start at  15:26:51
   Duration  1.13s (tests 87%, import 6%, transform 5%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-3Jlque/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
