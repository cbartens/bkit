Enforced: true
Red: 8
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/914-build-planned-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 8 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses a code step that writes a planned test whose red recorded its file missing, exit 11" | red | failure: expected +0 to be 11 // Object.is equality |
| 9 | `.bkit/core/engine/commands/workflow/steps.test.ts` "the refusal of a restored BLOCKED change names the recorded change as the lines to put back" | red | failure: expected '`src/a.test.ts` "adds a row" differs …' not to contain 'as the tests step left it' |
| 10 | `.bkit/core/engine/commands/workflow/steps.test.ts` "the refusal of a re-change says the logged reason is already recorded" | red | failure: expected '`src/a.test.ts` "adds a row" differs …' to contain 'needs a 2' |
| 11 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11" | red | failure: expected +0 to be 11 // Object.is equality |
| 11 | `.bkit/core/engine/commands/workflow/steps.test.ts` "records the baseline blob on a BLOCKED-named change that only adds lines" | red | failure: expected 'undefined' to be 'string' // Object.is equality |
| 11 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green gives each changed test the line diff of its own lines since its baseline and whether it is additive" | red | failure: expected [ { task: 1, …(3) } ] to deeply equal [ ObjectContaining{…} ] |
| 11 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "a changed-test item shows the test's line diff since its baseline" | red | failure: expected ' - **If** `PAUSE_QUESTION` = `CHANG…' to match /\bdiff\b/ |
| 11 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the code prompts say a BLOCKED line lets through only a change that adds lines" | red | failure: bkit-build-plan-tasks: no add-only guidance: expected ' - **If** a correct code change f…' to match /adds? lines\|only adds\|additive/i |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/steps.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/steps.test.ts

[test-timeout-budget] load average 23.2 on 10 cores: unit limits 16101ms per test, 32201ms per hook (x3.22)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts (149 tests | 5 failed) 36916ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 335ms
     ✓ finishes a CI round only with its own failed job count 322ms
     ✓ preserves local clamp enforcement when completing test rounds 185ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 223ms
     ✓ done prints progressLine 96ms
     ✓ progress output metadata 0ms
     ✓ gate progress number validation 138ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 305ms
     ✓ done --group writes group on the row 172ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 303ms
     ✓ --commit=none writes the row and leaves it uncommitted 92ms
     ✓ build-group-start records parentSha and group 82ms
     ✓ carries extra fields, parsed as JSON when they are JSON 155ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 56ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 53ms
     ✓ refuses an empty artifact 54ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 58ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 52ms
     ✓ rejects ["--verdict=MAYBE"] 70ms
     ✓ rejects ["--strategy=YOLO"] 63ms
     ✓ rejects ["--failures=-1"] 87ms
     ✓ rejects ["--field=verdict=PASS"] 236ms
     ✓ rejects ["--status=SKIPPED"] 112ms
     ✓ needs a message unless --commit=none 75ms
     ✓ reports a failed commit with exit 8 without writing the row 376ms
     ✓ a failed commit leaves no row staged in the index 874ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 516ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 540ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 559ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 353ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 411ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 80ms
     ✓ a missing artifact exits 4 106ms
     ✓ empty artifact exits 0 143ms
     ✓ pending artifact exits 1 232ms
     ✓ no marker artifact exits 2 217ms
     ✓ disallowed artifact exits 3 247ms
     ✓ bad failures artifact exits 4 183ms
     ✓ a required field that is absent is invalid (re-prompt) 200ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 170ms
     ✓ only reads above the marker 91ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 704ms
     ✓ fails when no row was written for the step 152ms
     ✓ --ref reads the status file as committed on that ref, not from disk 410ms
     ✓ --ref exits 3 when the ref does not carry the status file 560ms
     ✓ fails on a placeholder left in the artifact 466ms
     ✓ fails when the row's verdict differs from the artifact's 270ms
     ✓ fails when the row does not list the artifact, or carries another attempt 290ms
     ✓ fails on a missing artifact 415ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 339ms
     ✓ refuses a negative or non-integer attempt (2) 205ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 98ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 119ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 79ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 81ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 79ms
     ✓ fails a diagnose row missing its strategy, passes with it 190ms
     ✓ fails a run-tests row missing its scope, and an empty scope 257ms
     ✓ names every missing field at once 81ms
     ✓ asks nothing of a step that writes none of them 87ms
     ✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 15ms
   ✓ ledger writer references (1)
     ✓ every configured writer has a prompt file 0ms
   ✓ placeholderLines (1)
     ✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 1ms
   ✓ bkit steps finish (16)
     ✓ preserves challenge findings in the event when a later round overwrites the report 90ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 319ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 69ms
     ✓ re-asks (exit 6) when a field the prompt declares is missing 71ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 79ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 93ms
     ✓ a true | false header field is true when any agent sets it true 290ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 285ms
     ✓ records the header's Strategy on the row 93ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 145ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 391ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 88ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 250ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 455ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 363ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 304ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 774ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 695ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 452ms
     ✓ --post needs --number; without --post there is no tracker key 163ms
   ✓ bkit steps stub (3)
     ✓ copies the prior version under a PENDING header 91ms
     ✓ --strip-header drops the prior version's own header 79ms
     ✓ exits 4 when the prior version is missing or empty 81ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 101ms
     ✓ checks the FID's shape for the wired tracker 238ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 190ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 101ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 692ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 402ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 184ms
       ✓ gate --issue without --fid is a usage error 77ms
       ✓ gate --issue="" under none keeps today's check 92ms
     ✓ --attempt-of checks the row carries the derived counter 213ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 488ms
     ✓ writeStepRow refuses when a recorded path changed 950ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 284ms
     ✓ writeStepRow appends its commit sha to the record 474ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 622ms
   ❯ bkit steps finish — the tests step touches only tests, the code steps never touch a test (30)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 200ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 717ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 429ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 471ms
     ✓ finds the run's plan beside its status file 0ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 298ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 478ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 612ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 452ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 254ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 618ms
     ✓ refuses the execute step when it changes another group's planned test, exit 11 174ms
     ✓ refuses the gaps-remediate step when it changes another group's planned test, exit 11 192ms
     ✓ lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row 616ms
     ✓ lets a code step through when its BLOCKED line names the changed test by the last segment of its name 308ms
     ✓ lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test 419ms
     ✓ records only the changed test when a BLOCKED line also names an unchanged one 551ms
     ✓ refuses only the changed planned tests no BLOCKED line of the log names 269ms
     ✓ the refusal names the BLOCKED line the engine reads 210ms
     ✓ the exit 11 help names the BLOCKED line that lets a change through 0ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 451ms
     ✓ refuses a later code step that changes a BLOCKED change again 267ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 457ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 450ms
     × refuses a code step that writes a planned test whose red recorded its file missing, exit 11 305ms
     × the refusal of a restored BLOCKED change names the recorded change as the lines to put back 310ms
     × the refusal of a re-change says the logged reason is already recorded 287ms
     × refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11 254ms
     × records the baseline blob on a BLOCKED-named change that only adds lines 351ms
     ✓ exit codes list 11 as planned tests touched and 15 as source touched in the tests step 1ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 108ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 163ms
     ✓ does not count an artifact the run found committed when it started 269ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 143ms
     ✓ commits a package.json change outside bkit.workflows 205ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 390ms
   ✓ bkit steps stub --result-file (12)
     ✓ derives supported header fields and rejects stale bodies without false PASS 59ms
     ✓ registers every named header kind 11ms
     ✓ renders and verifies the header of every prompt that declares one 109ms
     ✓ renders no PASS from a result that omits its evidence 96ms
     ✓ refuses line breaks in header-bound result values 103ms
     ✓ retains special verdict judgments and legacy stub behavior 87ms
     ✓ derives audit IDs totals ledger payloads and coverage from one result 80ms
     ✓ derives a fresh audit key when the ledger already holds it 71ms
     ✓ keeps the audit key when the same finding is rendered again after its append 62ms
     ✓ reads held audit keys from the linked worktree's own ledger 90ms
     ✓ refuses a result file left from an earlier round 61ms
     ✓ audit result render keeps an existing anchored report intact 55ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > refuses a code step that writes a planned test whose red recorded its file missing, exit 11
AssertionError: expected +0 to be 11 // Object.is equality

- Expected
+ Received

- 11
+ 0

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2378:20
    2376|     const head = git(cwd, "rev-parse", "HEAD");
    2377|     const r = await run(cwd, EXECUTE);
    2378|     expect(r.code).toBe(11);
       |                    ^
    2379|     expect(r.json.touched).toEqual([TEST.file]);
    2380|     expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > the refusal of a restored BLOCKED change names the recorded change as the lines to put back
AssertionError: expected '`src/a.test.ts` "adds a row" differs …' not to contain 'as the tests step left it'

Expected: "as the tests step left it"
Received: "`src/a.test.ts` "adds a row" differs from what the group's tests step recorded at its red: a code step never edits a planned test case — put that test back as the tests step left it (other edits to the file stay), or keep the edit and log one line per test in the step's log: BLOCKED — TASK {N}: test `src/a.test.ts` `adds a row` — {why} (Gap {N} in a gaps fix) (nothing written)"

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2397:32
    2395|     expect(r.code).toBe(11);
    2396|     expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }…
    2397|     expect(r.json.problem).not.toContain("as the tests step left it");
       |                                ^
    2398|     expect(r.json.problem).not.toContain("recorded at its red");
    2399|     expect(r.json.problem).toMatch(/recorded change|changedTests/);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > the refusal of a re-change says the logged reason is already recorded
AssertionError: expected '`src/a.test.ts` "adds a row" differs …' to contain 'needs a 2'

Expected: "needs a 2"
Received: "`src/a.test.ts` "adds a row" differs from what the group's tests step recorded at its red: a code step never edits a planned test case — put that test back as the tests step left it (other edits to the file stay), or keep the edit and log one line per test in the step's log: BLOCKED — TASK {N}: test `src/a.test.ts` `adds a row` — {why} (Gap {N} in a gaps fix) (nothing written)"

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2420:28
    2418|     expect(r.code).toBe(11);
    2419|     expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }…
    2420|     expect(r.json.problem).toContain("needs a 2");
       |                            ^
    2421|     expect(r.json.problem).toMatch(/already recorded/);
    2422|     expect(r.json.problem).toMatch(/new reason/);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11
AssertionError: expected +0 to be 11 // Object.is equality

- Expected
+ Received

- 11
+ 0

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2431:20
    2429|     const head = git(cwd, "rev-parse", "HEAD");
    2430|     const r = await run(cwd, EXECUTE);
    2431|     expect(r.code).toBe(11);
       |                    ^
    2432|     expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }…
    2433|     expect(r.json.problem).toMatch(/BLOCKED line cannot remove or loos…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > records the baseline blob on a BLOCKED-named change that only adds lines
AssertionError: expected 'undefined' to be 'string' // Object.is equality

Expected: "string"
Received: "undefined"

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2445:33
    2443|     const [row] = stepRows(cwd, "build-plan-tasks");
    2444|     const [record] = row!.changedTests as Array<Record<string, unknown…
    2445|     expect(typeof record!.blob).toBe("string");
       |                                 ^
    2446|     const read = spawnSync("git", ["cat-file", "-p", record!.blob as s…
    2447|       cwd,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯


 Test Files  1 failed (1)
      Tests  5 failed | 144 passed (149)
   Start at  06:45:58
   Duration  37.35s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-5tNAVJ/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/tests.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tests.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tests.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tests.test.ts

[test-timeout-budget] load average 17.6 on 10 cores: unit limits 13300ms per test, 26600ms per hook (x2.66)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts (162 tests | 1 failed) 67898ms
   ✓ CI evidence test rounds (4)
     ✓ records a CI evidence round without executing a local gate 21ms
     ✓ records the selected run's failed job count 16ms
     ✓ runs local gates only after current-generation remediation or soak 572ms
     ✓ rejects CI rounds without active matching debug selection 22ms
   ✓ resolveGate (6)
     ✓ picks the deepest declared candidate, not the first declared in package.json 17ms
     ✓ falls back to a shallower candidate when the deeper one is undeclared 32ms
     ✓ an empty script is not declared: it would run nothing and exit 0 (fix) 33ms
     ✓ no package.json, no scripts, or unparseable -> null 104ms
     ✓ debug's live-first chain stops at the deepest declared tier 83ms
     ✓ with no e2e gate, debug runs the integration gate build runs 45ms
   ✓ bkit tests run (16)
     ✓ a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run 25ms
     ✓ a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81 22ms
     ✓ a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4 18ms
     ✓ tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate 25ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 217ms
     ✓ a 73 exit with a refusal line for another lock is the gate's own FAIL, never exit 4 16ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 209ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 227ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 210ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 223ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 99ms
     ✓ no candidate declared: exit 3, nothing run, and the hint names bkit:gate:* — not an install flag (fix) 48ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 92ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 353ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 297ms
     ✓ --gate and --log are required 20ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 494ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 195ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 204ms
     ✓ PASS is 0 failures with or without reports 314ms
     ✓ clears a previous attempt's reports before the gate runs 237ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 213ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 236ms
     ✓ a log under the outbox is named main-checkout relative in the record 240ms
     ✓ a log small enough is copied whole: not clamped, raw null 202ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 236ms
     ✓ --artifact needs --fid and --step 36ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 392ms
     ✓ numbers runs within the workflow's active run and per step 346ms
     ✓ without --file no row is written and the output carries row null 221ms
     ✓ --file needs --workflow and --step, and an existing status.jsonl, before the gate runs 17ms
   ✓ parseJunit (5)
     ✓ reads names, outcomes and failure messages, decoding entities 15ms
     ✓ keeps a failure's text as detail, CDATA as written and tags stripped 18ms
     ✓ survives a raw > inside an attribute and a closing tag inside CDATA 19ms
     ✓ keeps each case's classname and file attribute 18ms
     ✓ no testcase elements -> empty 18ms
   ✓ reportFailures (1)
     ✓ returns the failing and erroring cases of every report, or null with none 18ms
   ✓ judgeRed / judgeGreen — the named test, never the exit code alone (9)
     ✓ a red is the named test failing or erroring 17ms
     ✓ state: no report (misspelled path) 17ms
     ✓ state: load error named after the file 16ms
     ✓ state: zero tests 19ms
     ✓ state: the named test passed (code written first) 20ms
     ✓ state: the named test skipped (filter matched nothing) 29ms
     ✓ state: other tests only 25ms
     ✓ a name only matches whole trailing segments 22ms
     ✓ green needs every case of the named test to pass 22ms
   ✓ readTestFirst (5)
     ✓ reads test, n/a, missing and malformed entries per task 19ms
     ✓ reads several tests per task, one per sub-bullet; a name may hold a `;` 19ms
     ✓ reads a task's TEST EXCEPTION field apart from its TEST FIRST tests, with its plan lines 20ms
     ✓ narrows to one group's tasks 18ms
     ✓ reads no task from old-format task lines 17ms
   ✓ taskSizes (1)
     ✓ counts tests and distinct test files per task; n/a, missing and malformed count 0 16ms
   ✓ checkPlanText (4)
     ✓ sizes each group and task, and lists each problem with its line 15ms
     ✓ refuses a task that depends on itself 16ms
     ✓ an unclosed code fence is reported as such, not as missing task markers 17ms
     ✓ reads a CRLF plan's Reuse Inventory 17ms
   ✓ shipped task examples (9)
     ✓ the shipped plan template's example parses 34ms
     ✓ the change-shape example in trackers.md parses 16ms
     ✓ change issue form example passes plan-check 23ms
     ✓ trackers.md change example shows every task field 16ms
     ✓ the shipped change form shows every plan cap with its settings default 16ms
     ✓ this repo's change form shows every plan cap with its settings default 15ms
     ✓ trackers.md shows each plan cap it names with its settings default 16ms
     ✓ README.md shows each plan cap it names with its settings default 18ms
     ✓ this repo's change form shows the caps this repo's package.json sets 28ms
   ✓ bkit tests plan-check (35)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 63ms
     ✓ states the caps the template and workflows doc name 16ms
     ✓ every prompt that sizes a task or group takes the caps from its Context 24ms
     ✓ plan-check refuses a task without DONE WHEN 41ms
     ✓ plan-check refuses DEPENDS ON a later group 63ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 59ms
     ✓ plan-check matches a Markdown heading symbol 292ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 162ms
     ✓ plan-check walks a dotted key through indented JSON, YAML and TOML 122ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 129ms
     ✓ plan-check skips existence on ticked tasks 130ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 201ms
     ✓ plan-check refuses an unmapped matrix row 126ms
     ✓ plan-check refuses a delete with no supersession row 303ms
     ✓ plan-check refuses a matrix row mapped to two tasks 187ms
     ✓ plan-check refuses rows left in the old column order under the template header 245ms
     ✓ plan-check refuses rows with an extra cell under the template header 359ms
     ✓ plan-check refuses a task no matrix row maps to 236ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 316ms
     ✓ plan-check refuses a matrix header with no Task column, naming the column to add 191ms
     ✓ plan-check refuses a matrix header with an extra leading # column 273ms
     ✓ plan-check refuses a matrix header with Task not last 239ms
     ✓ plan-check refuses synonym matrix column names 213ms
     ✓ plan-check refuses a matrix header with no closing pipe 204ms
     ✓ plan-check accepts the template matrix header in any letter case 191ms
     ✓ plan-check refuses a Task cell naming an undefined task 121ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 269ms
     ✓ plan-check refuses a group with 6 tasks 224ms
     ✓ plan-check refuses a group with 26 planned tests 197ms
     ✓ plan-check accepts 5 tasks and 25 tests in one group 240ms
     ✓ plan-check report lists groups, not a verdict 146ms
     ✓ plan-check refuses a task over the per-task caps, naming the task and the cap 96ms
     ✓ plan-check follows bkit.workflows.tasks 184ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 175ms
     ✓ a missing plan file is a usage error 94ms
   ✓ testBlock — a planned test's own lines, by name and indentation (12)
     ✓ takes the named test's opening line, its deeper lines and its closer, and nothing of its neighbours 74ms
     ✓ an edit to a neighbour leaves the hash alone; an edit to the test's own lines changes it 42ms
     ✓ testSpan gives the 1-based first and last line of the block, and lineDiff counts the lines removed and added 80ms
     ✓ finds a test planned by its suite path (`suite > test`) through its last segment 43ms
     ✓ starts at the call when the name sits on its own line under an open paren 43ms
     ✓ is stack-agnostic: pytest 61ms
     ✓ is stack-agnostic: go 60ms
     ✓ is stack-agnostic: rspec 86ms
     ✓ passes over a comment that quotes the name: the test, not the comment, is locked 58ms
     ✓ passes over a suite titled like the test, so its neighbours stay free to change 80ms
     ✓ falls back to a suite line when nothing else carries the name 100ms
     ✓ is null when the name is not in the file, or there is no file 40ms
   ✓ blockedTests (2)
     ✓ reads the file, name and reason from a TASK or Gap BLOCKED test line 47ms
     ✓ ignores a BLOCKED line that names no test 105ms
   ❯ bkit tests red / green (38)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 909ms
     ✓ a planned test that passes is a vacuous gap, exit 1 561ms
     ✓ a planned test absent from a loaded report is a missing gap 808ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1403ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1068ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 852ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 2313ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 2031ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 1370ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 295ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 2954ms
     ✓ red keeps a test standing whose lines match a code step's recorded change 1525ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1712ms
       ✓ a later unproven result never replaces a proven red of the same lines 687ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 3613ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1124ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 2317ms
     ✓ green: a passed-accepted test is already landed, not a gap 1111ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1290ms
     ❯ tests a code step changed (5)
       ✓ green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap 1380ms
       × green gives each changed test the line diff of its own lines since its baseline and whether it is additive 1731ms
       ✓ green leaves a changed test the plan no longer names out of changed 1926ms
       ✓ green leaves a test out of changed when a later red replaced the code step's change 1691ms
       ✓ green prints an empty changed list and no Changed by a code step section when no code step changed a test 1785ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 274ms
     ✓ green refuses a plan with no task markers 457ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1203ms
     ✓ green: --group audits only that group's tasks 1240ms
     ✓ green: --group naming a group with no tasks is refused 366ms
     ✓ green: a code fence never closed is the reason, not missing task markers 318ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1830ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1965ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1068ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 2081ms
     ✓ green: lists each gap kind, with the runner output 1244ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 3271ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 1055ms
       ✓ green clears an exception-only task from a human commit 734ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests red / green > tests a code step changed > green gives each changed test the line diff of its own lines since its baseline and whether it is additive
AssertionError: expected [ { task: 1, …(3) } ] to deeply equal [ ObjectContaining{…} ]

- Expected
+ Received

  [
    {
-     "additive": true,
      "name": "keeps a value inside the range",
+     "reason": "an added check",
+     "task": 1,
      "test": "src/clamp.test.ts",
    },
  ]

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:2801:30
    2799|       const r = await green();
    2800|       expect(r.code).toBe(0);
    2801|       expect(r.json.changed).toEqual([
       |                              ^
    2802|         expect.objectContaining({ test: TEST, name: NAME, additive: tr…
    2803|       ]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 161 passed (162)
   Start at  06:46:37
   Duration  68.44s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-LSELn9/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/workflow-shape.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/workflow-shape.test.ts

[test-timeout-budget] load average 29.5 on 10 cores: unit limits 19250ms per test, 38500ms per hook (x3.85)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (283 tests | 2 failed) 1592ms
   ✓ engine calls (8)
     ✓ auto calls only verbs and flags the CLI has 4ms
     ✓ design calls only verbs and flags the CLI has 2ms
     ✓ plan calls only verbs and flags the CLI has 1ms
     ✓ build calls only verbs and flags the CLI has 3ms
     ✓ debug calls only verbs and flags the CLI has 250ms
     ✓ ship calls only verbs and flags the CLI has 7ms
     ✓ the call check reports an unknown verb and an unknown flag 0ms
     ✓ no workflow names a removed sub-plan flag 6ms
   ✓ bkit lookup (6)
     ✓ auto resolves the binary once, in Step 1, and holds it as BKIT 2ms
     ✓ design resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ plan resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ build resolves the binary once, in Step 1, and holds it as BKIT 6ms
     ✓ debug resolves the binary once, in Step 1, and holds it as BKIT 3ms
     ✓ ship resolves the binary once, in Step 1, and holds it as BKIT 1ms
   ✓ gate logs (13)
     ✓ auto writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ design writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ plan writes every gate log to the outbox, outside the tree the gate's format check reads 1ms
     ✓ build writes every gate log to the outbox, outside the tree the gate's format check reads 1ms
     ✓ debug writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ ship writes every gate log to the outbox, outside the tree the gate's format check reads 2ms
     ✓ build writes the trimmed gate log with `tests run --artifact` 4ms
     ✓ build writes the trimmed gate log with `tests run --artifact` 1ms
     ✓ debug writes the trimmed gate log with `tests run --artifact` 1ms
     ✓ build never copies or clamps a gate log by hand 1ms
     ✓ debug never copies or clamps a gate log by hand 1ms
     ✓ build routes the test failures on the engine's count, never a count from the log 5ms
     ✓ debug routes the test failures on the engine's count, never a count from the log 0ms
   ✓ debug Step 1 start decisions (3)
     ✓ decides attempt, mode, repro and gates with one `status route --prompt-file` 5ms
     ✓ reconstructs nothing in shell or prose 0ms
     ✓ Step 3 reads `[live=off]` from the gates, never from the input file 0ms
   ✓ Step 1 FID check (10)
     ✓ design resolves the FID at Step 1 with `fids resolve`, outside every tracker block 1ms
     ✓ plan resolves the FID at Step 1 with `fids resolve`, outside every tracker block 16ms
     ✓ build resolves the FID at Step 1 with `fids resolve`, outside every tracker block 4ms
     ✓ debug resolves the FID at Step 1 with `fids resolve`, outside every tracker block 1ms
     ✓ ship resolves the FID at Step 1 with `fids resolve`, outside every tracker block 0ms
     ✓ design writes the session prompt to a file and reads it with `fids parse` 1ms
     ✓ plan writes the session prompt to a file and reads it with `fids parse` 0ms
     ✓ build writes the session prompt to a file and reads it with `fids parse` 1ms
     ✓ debug writes the session prompt to a file and reads it with `fids parse` 0ms
     ✓ ship writes the session prompt to a file and reads it with `fids parse` 1ms
   ✓ resume facts (4)
     ✓ build resumes an open decision from `openDecision`, not a file scan 1ms
     ✓ build re-runs a red gate pause instead of asking it 2ms
     ✓ Resume re-runs a red gate only when openDecision status is OPEN 1ms
     ✓ build re-runs a red gate pause only when the loop question is its only undecided question 1ms
   ✓ pre-worktree commit (3)
     ✓ design passes the repo root explicitly 1ms
     ✓ plan passes the repo root explicitly 0ms
     ✓ build passes the repo root explicitly 1ms
   ✓ Failure Path (17)
     ✓ design records the failure through one `workflows fail` call 4ms
     ✓ plan records the failure through one `workflows fail` call 2ms
     ✓ build records the failure through one `workflows fail` call 4ms
     ✓ debug records the failure through one `workflows fail` call 3ms
     ✓ ship records the failure through one `workflows fail` call 1ms
     ✓ design always keeps its record through one `workflows handover --push` in the run's worktree 1ms
     ✓ plan always keeps its record through one `workflows handover --push` in the run's worktree 3ms
     ✓ build always keeps its record through one `workflows handover --push` in the run's worktree 1ms
     ✓ debug always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ bkit-build.md: a held run's Failure Path and Decision Pause never push the feature branch 2ms
     ✓ bkit-build.md: a Failure Path reached before publish is resolved never pushes the feature branch 3ms
     ✓ design removes only files the run created by mistake, never other agents' changes 1ms
     ✓ plan removes only files the run created by mistake, never other agents' changes 0ms
     ✓ build removes only files the run created by mistake, never other agents' changes 1ms
     ✓ debug removes only files the run created by mistake, never other agents' changes 1ms
     ✓ ship flushes through `workflows handover --flush` 1ms
     ✓ build routes exit 5 (lock left in place) on, like exit 0 1ms
   ✓ build (43)
     ✓ Step 13's diagnose agent reads the committed log, not the outbox copy 0ms
     ✓ writes the challenge attempt on every row, counted from the challenge's own rows 0ms
     ✓ Step 11 merges the findings into the plan and routes on the merge 1ms
     ✓ Step 11 records its round on the challenge row and reads it back from status.jsonl 1ms
     ✓ a resumed challenge pause rebuilds CHALLENGE_TASKS from `challenge merge`, not the decision file 0ms
     ✓ the decision row records its route, which `status resume` maps 1ms
     ✓ the last allowed challenge round never runs another 1ms
     ✓ challenge merge exit 23 gets the same one retry as exit 22 1ms
     ✓ an execute cap stop is a handover, never a FAIL attempt 1ms
     ✓ build challenge runs the size gate first 1ms
     ✓ Branch Sync merges docs and finishes as its own step 1ms
     ✓ Plan Convert checks the plan, converts one with no task markers, and re-checks 1ms
     ✓ Plan Convert leaves a valid plan with no newer comments alone 1ms
     ✓ build's comment numbers match the step table 14ms
     ✓ the convert step posts under Plan Convert's number and title 1ms
     ✓ Plan Convert's finish carries the plan-check log as an optional artifact 0ms
     ✓ Plan Current posts a comment whether it runs or skips 0ms
     ✓ Plan Current's skipped comment says no plan anchor 0ms
     ✓ issue comments newer than a valid plan send the build through convert once 0ms
     ✓ only convert reads the build-input file, and nothing reads a sub-plan 41ms
     ✓ Step 7 takes the next group's brief and hands execute its path 1ms
     ✓ Step 7 writes a group's tests with their own subagent, records them red and only then invokes execute 1ms
     ✓ a re-run gate that is still red goes straight to the Decision Pause 8ms
     ✓ a green re-run gate continues without asking and clears GATE_RERUN 1ms
     ✓ Step 8 verifies a diff cut from the group's start commit 0ms
     ✓ the Decision Pause checks a red gate against the base commit before composing 1ms
     ✓ a no-progress round after a red gate pauses with the loop question 0ms
     ✓ a failing gate or suite test is never a pause item 6ms
     ✓ group-mode verify logs no gap for a test the group gate runs 4ms
     ✓ the execute prompt logs `DONE — TASK {N}`, the line the brief and the commit check read 0ms
     ✓ a Fix now edit is checked with plan-check before the loop goes on 1ms
     ✓ a Fix now challenge task is rewritten to the owner's direction in place 0ms
     ✓ a hard blocker answered Fix now with no direction is asked again 1ms
     ✓ each Fix now item records its Fix task line before the decision row is finished 1ms
     ✓ Decision Pause step 5 records each Fix now item's Fix task line before tests plan-check 0ms
     ✓ the owner decisions contract names the task block as the Fix now carrier 0ms
     ✓ Decision Pause step 5 writes no second acceptance for a reopened DECIDED or ASSUMED pause 1ms
     ✓ an Accept replaces the task's TEST EXCEPTION field with the owner's reason and date 0ms
     ✓ build writes one input file with every input in Step 2, before any plan check 1ms
     ✓ convert and plan-generate prompts (3)
       ✓ convert copies an input's TEST EXCEPTION and never writes its own 3ms
       ✓ convert names no plan format but the task-block one 0ms
       ✓ convert reads the whole input file; the newer text wins where it and the plan disagree 0ms
     ✓ records the PR URL in artifacts, not a prUrl field 1ms
   ✓ live docs (1)
     ✓ live docs name no build step the table does not carry 26ms
   ✓ resume (10)
     ✓ design: the Resume line calls `status resume` 1ms
     ✓ plan: the Resume line calls `status resume` 1ms
     ✓ build: the Resume line calls `status resume` 0ms
     ✓ debug: the Resume line calls `status resume` 0ms
     ✓ ship: the Resume line calls `status resume` 0ms
     ✓ design: the step table matches the step headings and their --step= calls 1ms
     ✓ plan: the step table matches the step headings and their --step= calls 12ms
     ✓ build: the step table matches the step headings and their --step= calls 6ms
     ✓ debug: the step table matches the step headings and their --step= calls 1ms
     ✓ ship: the step table matches the step headings and their --step= calls 1ms
   ✓ plan convert skip row (1)
     ✓ writes a build-plan-convert row on the no-conversion route 1ms
   ✓ promoted parsers (1)
     ✓ holds the workflows to the step table 13ms
   ✓ debug (1)
     ✓ records the PR URL in artifacts, not a prUrl field 1ms
   ✓ verdict headers re-ask on PENDING (exit 5) as well as invalid (exit 6) (10)
     ✓ design: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ plan: the Finish header line routes exit 5 or 6 to a re-ask 2ms
     ✓ build: the Finish header line routes exit 5 or 6 to a re-ask 1ms
     ✓ debug: the Finish header line routes exit 5 or 6 to a re-ask 3ms
     ✓ ship: the Finish header line routes exit 5 or 6 to a re-ask 9ms
     ✓ design never reads a verdict outside `steps finish` 13ms
     ✓ plan never reads a verdict outside `steps finish` 1ms
     ✓ build never reads a verdict outside `steps finish` 1ms
     ✓ debug never reads a verdict outside `steps finish` 1ms
     ✓ ship never reads a verdict outside `steps finish` 1ms
   ✓ status route --require=strategy (1)
     ✓ status route --require=strategy is used at exactly the four strategy-routing sites 136ms
   ✓ auto (2)
     ✓ resolves phase, mode and the CI context with one `runs context` call 0ms
     ✓ workflows impose no blanket runtime deadline on workflows or subagents 2ms
   ✓ diff per reader (10)
     ✓ build /Failure Path/ writes the diff right before its agents 3ms
     ✓ build /Step 10 — / writes the diff right before its agents 1ms
     ✓ build /Step 11 — Build Challenge/ writes the diff right before its agents 1ms
     ✓ debug /Failure Path/ writes the diff right before its agents 0ms
     ✓ ship /Failure Path/ writes the diff right before its agents 0ms
     ✓ ship /Step 5 — / writes the diff right before its agents 1ms
     ✓ build group verify cuts its own diff from the group's start, right before the agent 10ms
     ✓ build hands no agent a raw `git diff` 55ms
     ✓ debug hands no agent a raw `git diff` 1ms
     ✓ ship hands no agent a raw `git diff` 1ms
   ✓ ship (7)
     ✓ ship has no Failure Diagnose or Failure Remediate step and runs Steps 1-12 1ms
     ✓ post-merge check reads the capstone job alone, at the squash commit 0ms
     ✓ the close removes the worktree and deletes the branch through the command, then leaves it 0ms
     ✓ brings local dev level through `branches sync-dev`, never a checkout 0ms
     ✓ skill prune warns and carries on rather than stopping the ship 1ms
     ✓ re-validates through `runs revalidate` and merges through `prs merge --match-head` 0ms
     ✓ closes through `workflows close --flush` 2ms
   ✓ plan caps (2)
     ✓ no prompt or workflow states a literal group cap 23ms
     ✓ plan and build hold the caps `repo info` prints 1ms
   ✓ plan (3)
     ✓ plan runs one review round 1ms
     ✓ bkit-plan runs plan-check after every plan-writing step 1ms
     ✓ carries draft formatting findings through review and update, with a strict final check 1ms
   ✓ design and plan close (5)
     ✓ design lands on dev through `branches land` 2ms
     ✓ plan lands on dev through `branches land` 2ms
     ✓ design reads its related issues through one `issues related` call 1ms
     ✓ plan reads its related issues through one `issues related` call 1ms
     ✓ debug reads its related issues through one `issues related` call 2ms
   ✓ highest-version lookups (2)
     ✓ design never lists versions with an `ls` glob 1ms
     ✓ plan never lists versions with an `ls` glob 1ms
   ✓ summary step (5)
     ✓ design writes its summary with `workflows summary`, no summary subagent 2ms
     ✓ plan writes its summary with `workflows summary`, no summary subagent 3ms
     ✓ build writes its summary with `workflows summary`, no summary subagent 3ms
     ✓ debug writes its summary with `workflows summary`, no summary subagent 3ms
     ✓ ship writes its summary with `workflows summary`, no summary subagent 3ms
   ✓ locks (5)
     ✓ design's Locks header no longer waits on the lock file's age 1ms
     ✓ plan's Locks header no longer waits on the lock file's age 2ms
     ✓ build's Locks header no longer waits on the lock file's age 1ms
     ✓ debug's Locks header no longer waits on the lock file's age 1ms
     ✓ ship's Locks header no longer waits on the lock file's age 1ms
   ✓ final return at the close (10)
     ✓ design builds its final message in `workflows close` and displays it verbatim 2ms
     ✓ plan builds its final message in `workflows close` and displays it verbatim 2ms
     ✓ build builds its final message in `workflows close` and displays it verbatim 3ms
     ✓ debug builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ ship builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ design passes its summary file 1ms
     ✓ plan passes its summary file 1ms
     ✓ build passes its summary file 1ms
     ✓ debug passes its summary file 0ms
     ✓ ship passes its summary path plus the missing-summary line 1ms
   ✓ issue-less runs (68)
     ✓ design: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 13ms
     ✓ plan: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 2ms
     ✓ build: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 3ms
     ✓ debug: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 3ms
     ✓ ship: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 3ms
     ✓ design: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ plan: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ build: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ debug: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ ship: every issues labels --board fence has a Skip if ISSUE_ID empty line 2ms
     ✓ design: no wired-tracker block STOPs on a missing issue 1ms
     ✓ plan: no wired-tracker block STOPs on a missing issue 1ms
     ✓ build: no wired-tracker block STOPs on a missing issue 2ms
     ✓ debug: no wired-tracker block STOPs on a missing issue 1ms
     ✓ ship: no wired-tracker block STOPs on a missing issue 1ms
     ✓ design: fids resolve and steps gate carry --issue in every workflow 83ms
     ✓ plan: fids resolve and steps gate carry --issue in every workflow 2ms
     ✓ build: fids resolve and steps gate carry --issue in every workflow 12ms
     ✓ debug: fids resolve and steps gate carry --issue in every workflow 3ms
     ✓ ship: fids resolve and steps gate carry --issue in every workflow 4ms
     ✓ design: the No issue bullet sits in a tracker true block 1ms
     ✓ plan: the No issue bullet sits in a tracker true block 0ms
     ✓ build: the No issue bullet sits in a tracker true block 1ms
     ✓ debug: the No issue bullet sits in a tracker true block 0ms
     ✓ ship: the No issue bullet sits in a tracker true block 0ms
     ✓ design: final messages start with the no-issue warning clause 1ms
     ✓ plan: final messages start with the no-issue warning clause 1ms
     ✓ build: final messages start with the no-issue warning clause 1ms
     ✓ debug: final messages start with the no-issue warning clause 1ms
     ✓ ship: final messages start with the no-issue warning clause 2ms
     ✓ design: no wired-tracker block extracts the issue from the prompt 8ms
     ✓ plan: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ build: no wired-tracker block extracts the issue from the prompt 1ms
     ✓ debug: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ ship: no wired-tracker block extracts the issue from the prompt 1ms
     ✓ design: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ plan: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ build: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ debug: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ ship: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ ship checks the plan with `fids plans`; build checks it with `tests plan-check` 5ms
     ✓ plan reads the parent design and audit reports from `fids design` 2ms
     ✓ design: the merge MCP fallback asserts base.ref = dev before merging 2ms
     ✓ plan: the merge MCP fallback asserts base.ref = dev before merging 1ms
     ✓ ship's merge MCP fallback proves the scoped dev base through the engine before merging 2ms
     ✓ design: Placeholders rule lets ISSUE_ID be empty in every workflow 1ms
     ✓ plan: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ build: Placeholders rule lets ISSUE_ID be empty in every workflow 3ms
     ✓ debug: Placeholders rule lets ISSUE_ID be empty in every workflow 8ms
     ✓ ship: Placeholders rule lets ISSUE_ID be empty in every workflow 1ms
     ✓ design: the Jira related-issues query drops key != when ISSUE_ID is empty 6ms
     ✓ plan: the Jira related-issues query drops key != when ISSUE_ID is empty 3ms
     ✓ debug: the Jira related-issues query drops key != when ISSUE_ID is empty 1ms
     ✓ design: tracker gate items name the attempt, never its skip rule 4ms
     ✓ plan: tracker gate items name the attempt, never its skip rule 3ms
     ✓ build: tracker gate items name the attempt, never its skip rule 109ms
     ✓ debug: tracker gate items name the attempt, never its skip rule 29ms
     ✓ ship: tracker gate items name the attempt, never its skip rule 170ms
     ✓ design: every Failure Path comment post sits behind the ISSUE_ID guard 3ms
     ✓ plan: every Failure Path comment post sits behind the ISSUE_ID guard 2ms
     ✓ build: every Failure Path comment post sits behind the ISSUE_ID guard 2ms
     ✓ debug: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ ship: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ build 16.9 and debug 11.9 kill-switch checks skip when ISSUE_ID is empty 3ms
     ✓ build Step 1 blocker check skips when ISSUE_ID is empty 1ms
     ✓ design Step 11 requires an issue 1ms
     ✓ design Step 11 posts plans 1ms
     ✓ debug Step 1 never probes for a PR on dev or main 1ms
   ✓ workflow routing (5)
     ✓ AGENTS.md sends only a bkit-{command} prompt to router.md 1ms
     ✓ router.md hands back a prompt that only mentions a workflow 0ms
     ✓ router.md reads the issue through bkit verbs, never a tracker MCP tool 0ms
     ✓ router.md names an existing command file for every host and command 2ms
     ✓ phase workflows read the issue themselves, never from AGENTS.md 3ms
   ✓ debug on dev (4)
     ✓ debug diffs against DIFF_BASE on dev 1ms
     ✓ debug Steps 9 and 10 push nothing on dev 1ms
     ✓ the TRIGGER_PR commit is unreachable on dev 1ms
     ✓ debug stops and asks on a foreign path 0ms
   ✓ input files (2)
     ✓ every agent that reads a `*-input-*.md` file carries the newer-wins bullet 98ms
     ✓ a re-run reads its previous design or plan as superseded context, never as a constraint 0ms
   ✓ fix loops ask only when the last round made no progress (5)
     ✓ build takes a further test round without asking unless the trend is stuck or worse 42ms
     ✓ debug takes a further fix or soak attempt without asking unless the trend is stuck or worse 1ms
     ✓ debug Loop Question states the engine's trend line, never a fixed claim 1ms
     ✓ debug Loop Question at the used-up soak limit states the trend line 0ms
     ✓ ship asks the Merge Question only when the merge attempts are used up 1ms
   ✓ build publish ending (8)
     ✓ resolves publish through status route 1ms
     ✓ re-derives publish on resume 1ms
     ✓ warns when a non-LOCAL run resolves publish false 0ms
     ✓ skips push, PR and CI on a held close 1ms
     ✓ keeps the publish=true close path 0ms
     ✓ appends the held roadmap row without roadmap mirror 0ms
     ✓ makes Gate 15 conditional on the held path 0ms
     ✓ runs only the close gate on the held path 0ms
   ❯ planned tests a code step changed (8)
     ✓ an exit 11 re-ask offers the BLOCKED test line the engine reads 3ms
     ✓ Step 15 asks once about planned tests a code step changed, before the unproven ones 4ms
     ✓ a changed-test item offers Accept or Stop, recommended Accept 5ms
     ✓ the execute prompt's BLOCKED test line is one the engine reads 1ms
     ✓ the remediate prompt's BLOCKED test line is one the engine reads 0ms
     × a changed-test item shows the test's line diff since its baseline 42ms
     × the code prompts say a BLOCKED line lets through only a change that adds lines 3ms
     ✓ the verify prompt notes a planned test a code step changed and raises no gap 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > planned tests a code step changed > a changed-test item shows the test's line diff since its baseline
AssertionError: expected '   - **If** `PAUSE_QUESTION` = `CHANG…' to match /\bdiff\b/

- Expected:
/\bdiff\b/

+ Received:
"   - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason. Options `[\"Accept\", \"Stop\"]`, recommended `Accept`. Its question ends `Accept the change?`"

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:2387:18
    2385|     const rule = pause.split("\n").find((l) => l.includes("`PAUSE_QUES…
    2386|     expect(rule, "§ Decision Pause has no CHANGED_TESTS item rule").to…
    2387|     expect(rule).toMatch(/\bdiff\b/);
       |                  ^
    2388|     expect(rule).toMatch(/baseline/);
    2389|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > planned tests a code step changed > the code prompts say a BLOCKED line lets through only a change that adds lines
AssertionError: bkit-build-plan-tasks: no add-only guidance: expected '     - **If** a correct code change f…' to match /adds? lines|only adds|additive/i

- Expected:
/adds? lines|only adds|additive/i

+ Received:
"     - **If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. The engine lets the step through, and the owner answers the change at the end of the build.
   - Build the task in this order:
     - Edit or create the source until the task's tests pass.
     - Refactor, keeping the tests green.
     - Append the log line, and go on to the next task."

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:2394:53
    2392|     for (const name of ["bkit-build-plan-tasks", "bkit-build-plan-gaps…
    2393|       const text = keepCase(prompt(name));
    2394|       expect(text, `${name}: no add-only guidance`).toMatch(/adds? lin…
       |                                                     ^
    2395|       expect(text, `${name}: no refusal of removed lines`).toMatch(
    2396|         /(removes?|rewrites?)[^.\n]*(planned test's lines|lines)[^.\n]…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 281 passed (283)
   Start at  06:47:54
   Duration  6.13s (transform 44%, tests 31%, import 18%, setup 7%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-fisn7x/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
