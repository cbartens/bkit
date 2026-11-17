Enforced: true
Red: 16
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/914-build-planned-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses the execute step when it changes another group's planned test, exit 11" | red | failure: expected +0 to be 11 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses the gaps-remediate step when it changes another group's planned test, exit 11" | red | failure: expected +0 to be 11 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/tests.test.ts` "blockedTests > reads the file, name and reason from a TASK or Gap BLOCKED test line" | red | failure: blockedTests is not a function |
| 2 | `.bkit/core/engine/commands/workflow/tests.test.ts` "blockedTests > ignores a BLOCKED line that names no test" | red | failure: blockedTests is not a function |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row" | red | failure: expected 11 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "lets a code step through when its BLOCKED line names the changed test by the last segment of its name" | red | failure: expected 11 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test" | red | failure: expected 11 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "records only the changed test when a BLOCKED line also names an unchanged one" | red | failure: expected 11 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses only the changed planned tests no BLOCKED line of the log names" | red | failure: expected [ …(2) ] to deeply equal [ { test: 'src/a.test.ts', …(1) } ] |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "the refusal names the BLOCKED line the engine reads" | red | failure: expected '`src/a.test.ts` "adds a row" differs …' to match /BLOCKED —…/a\.test\.ts` `adds a row` — |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "the exit 11 help names the BLOCKED line that lets a change through" | red | failure: expected 'build plan-execute / plan-gaps-remedi…' to match /BLOCKED — [^`]*test `/ |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "passes a later code step that leaves a BLOCKED change as it is" | red | failure: expected 11 to be +0 // Object.is equality |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses a later code step that changes a BLOCKED change again" | red | failure: expected 11 to be +0 // Object.is equality |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line" | red | failure: expected 11 to be +0 // Object.is equality |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "uses a red the tests step recorded after a code step's change as the baseline" | red | failure: expected 11 to be +0 // Object.is equality |
| 3 | `.bkit/core/engine/commands/workflow/tests.test.ts` "red keeps a test standing whose lines match a code step's recorded change" | red | failure: expected { enforced: true, attempt: 2, …(5) } to match object { attempt: 2, skipped: 1, gaps: [] } (15 matching properties omitted from actual) |

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

[test-timeout-budget] load average 25.6 on 10 cores: unit limits 17300ms per test, 34600ms per hook (x3.46)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts (144 tests | 13 failed) 52349ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 689ms
     ✓ finishes a CI round only with its own failed job count 724ms
     ✓ preserves local clamp enforcement when completing test rounds 204ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 200ms
     ✓ done prints progressLine 224ms
     ✓ progress output metadata 1ms
     ✓ gate progress number validation 143ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 795ms
     ✓ done --group writes group on the row 820ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 905ms
     ✓ --commit=none writes the row and leaves it uncommitted 212ms
     ✓ build-group-start records parentSha and group 220ms
     ✓ carries extra fields, parsed as JSON when they are JSON 419ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 193ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 140ms
     ✓ refuses an empty artifact 185ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 153ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 212ms
     ✓ rejects ["--verdict=MAYBE"] 242ms
     ✓ rejects ["--strategy=YOLO"] 174ms
     ✓ rejects ["--failures=-1"] 252ms
     ✓ rejects ["--field=verdict=PASS"] 280ms
     ✓ rejects ["--status=SKIPPED"] 208ms
     ✓ needs a message unless --commit=none 223ms
     ✓ reports a failed commit with exit 8 without writing the row 740ms
     ✓ a failed commit leaves no row staged in the index 826ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 835ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 793ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1101ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 732ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1188ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 183ms
     ✓ a missing artifact exits 4 143ms
     ✓ empty artifact exits 0 157ms
     ✓ pending artifact exits 1 151ms
     ✓ no marker artifact exits 2 168ms
     ✓ disallowed artifact exits 3 173ms
     ✓ bad failures artifact exits 4 207ms
     ✓ a required field that is absent is invalid (re-prompt) 177ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 223ms
     ✓ only reads above the marker 202ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 467ms
     ✓ fails when no row was written for the step 216ms
     ✓ --ref reads the status file as committed on that ref, not from disk 598ms
     ✓ --ref exits 3 when the ref does not carry the status file 665ms
     ✓ fails on a placeholder left in the artifact 425ms
     ✓ fails when the row's verdict differs from the artifact's 689ms
     ✓ fails when the row does not list the artifact, or carries another attempt 515ms
     ✓ fails on a missing artifact 619ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 585ms
     ✓ refuses a negative or non-integer attempt (2) 197ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 198ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 190ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 214ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 218ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 200ms
     ✓ fails a diagnose row missing its strategy, passes with it 373ms
     ✓ fails a run-tests row missing its scope, and an empty scope 587ms
     ✓ names every missing field at once 191ms
     ✓ asks nothing of a step that writes none of them 219ms
     ✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 23ms
   ✓ ledger writer references (1)
     ✓ every configured writer has a prompt file 1ms
   ✓ placeholderLines (1)
     ✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 2ms
   ✓ bkit steps finish (16)
     ✓ preserves challenge findings in the event when a later round overwrites the report 372ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 747ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 204ms
     ✓ re-asks (exit 6) when a field the prompt declares is missing 140ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 156ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 270ms
     ✓ a true | false header field is true when any agent sets it true 236ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 282ms
     ✓ records the header's Strategy on the row 236ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 237ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 594ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 212ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 348ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 764ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 863ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 692ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 724ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 973ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 644ms
     ✓ --post needs --number; without --post there is no tracker key 195ms
   ✓ bkit steps stub (3)
     ✓ copies the prior version under a PENDING header 122ms
     ✓ --strip-header drops the prior version's own header 128ms
     ✓ exits 4 when the prior version is missing or empty 120ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 132ms
     ✓ checks the FID's shape for the wired tracker 161ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 274ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 121ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 628ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 507ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 332ms
       ✓ gate --issue without --fid is a usage error 109ms
       ✓ gate --issue="" under none keeps today's check 160ms
     ✓ --attempt-of checks the row carries the derived counter 346ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 817ms
     ✓ writeStepRow refuses when a recorded path changed 871ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 527ms
     ✓ writeStepRow appends its commit sha to the record 779ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1058ms
   ❯ bkit steps finish — the tests step touches only tests, the code steps never touch a test (25)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 317ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 583ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 509ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 543ms
     ✓ finds the run's plan beside its status file 0ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 368ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 900ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 655ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 493ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 337ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 900ms
     × refuses the execute step when it changes another group's planned test, exit 11 513ms
     × refuses the gaps-remediate step when it changes another group's planned test, exit 11 452ms
     × lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row 294ms
     × lets a code step through when its BLOCKED line names the changed test by the last segment of its name 278ms
     × lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test 276ms
     × records only the changed test when a BLOCKED line also names an unchanged one 287ms
     × refuses only the changed planned tests no BLOCKED line of the log names 302ms
     × the refusal names the BLOCKED line the engine reads 322ms
     × the exit 11 help names the BLOCKED line that lets a change through 1ms
     × passes a later code step that leaves a BLOCKED change as it is 265ms
     × refuses a later code step that changes a BLOCKED change again 307ms
     × records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 248ms
     × uses a red the tests step recorded after a code step's change as the baseline 257ms
     ✓ exit codes list 11 as planned tests touched and 15 as source touched in the tests step 1ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 149ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 276ms
     ✓ does not count an artifact the run found committed when it started 389ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 336ms
     ✓ commits a package.json change outside bkit.workflows 380ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 729ms
   ✓ bkit steps stub --result-file (12)
     ✓ derives supported header fields and rejects stale bodies without false PASS 198ms
     ✓ registers every named header kind 22ms
     ✓ renders and verifies the header of every prompt that declares one 143ms
     ✓ renders no PASS from a result that omits its evidence 129ms
     ✓ refuses line breaks in header-bound result values 113ms
     ✓ retains special verdict judgments and legacy stub behavior 120ms
     ✓ derives audit IDs totals ledger payloads and coverage from one result 116ms
     ✓ derives a fresh audit key when the ledger already holds it 110ms
     ✓ keeps the audit key when the same finding is rendered again after its append 94ms
     ✓ reads held audit keys from the linked worktree's own ledger 144ms
     ✓ refuses a result file left from an earlier round 91ms
     ✓ audit result render keeps an existing anchored report intact 105ms

⎯⎯⎯⎯⎯⎯ Failed Tests 13 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > refuses the execute step when it changes another group's planned test, exit 11
AssertionError: expected +0 to be 11 // Object.is equality

- Expected
+ Received

- 11
+ 0

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2126:20
    2124|     const head = git(cwd, "rev-parse", "HEAD");
    2125|     const r = await run(cwd, inGroup2(EXECUTE));
    2126|     expect(r.code).toBe(11);
       |                    ^
    2127|     expect(r.json.touched).toEqual([TEST.file]);
    2128|     expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > refuses the gaps-remediate step when it changes another group's planned test, exit 11
AssertionError: expected +0 to be 11 // Object.is equality

- Expected
+ Received

- 11
+ 0

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2136:20
    2134|     const head = git(cwd, "rev-parse", "HEAD");
    2135|     const r = await run(cwd, inGroup2(REMEDIATE));
    2136|     expect(r.code).toBe(11);
       |                    ^
    2137|     expect(r.json.touched).toEqual([TEST.file]);
    2138|     expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row
AssertionError: expected 11 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 11

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2171:20
    2169|     appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST…
    2170|     const r = await run(cwd, EXECUTE);
    2171|     expect(r.code).toBe(0);
       |                    ^
    2172|     const [row] = stepRows(cwd, "build-plan-tasks");
    2173|     expect(row!.changedTests).toEqual([

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > lets a code step through when its BLOCKED line names the changed test by the last segment of its name
AssertionError: expected 11 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 11

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2196:20
    2194|     appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST…
    2195|     const r = await run(cwd, EXECUTE);
    2196|     expect(r.code).toBe(0);
       |                    ^
    2197|     const [row] = stepRows(cwd, "build-plan-tasks");
    2198|     expect(row!.changedTests).toEqual([

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test
AssertionError: expected 11 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 11

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2208:20
    2206|     appendTo(cwd, "logs/remediate-1-log.md", blockedLine("Gap", 1, TES…
    2207|     const r = await run(cwd, REMEDIATE);
    2208|     expect(r.code).toBe(0);
       |                    ^
    2209|     const [row] = stepRows(cwd, "build-plan-gaps-remediate");
    2210|     expect(row!.changedTests).toEqual([

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > records only the changed test when a BLOCKED line also names an unchanged one
AssertionError: expected 11 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 11

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2249:20
    2247|     );
    2248|     const r = await run(cwd, EXECUTE);
    2249|     expect(r.code).toBe(0);
       |                    ^
    2250|     const [row] = stepRows(cwd, "build-plan-tasks");
    2251|     expect(row!.changedTests).toEqual([expect.objectContaining({ testN…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > refuses only the changed planned tests no BLOCKED line of the log names
AssertionError: expected [ …(2) ] to deeply equal [ { test: 'src/a.test.ts', …(1) } ]

- Expected
+ Received

  [
    {
      "name": "adds a row",
      "test": "src/a.test.ts",
    },
+   {
+     "name": "counts rows",
+     "test": "src/a.test.ts",
+   },
  ]

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2260:26
    2258|     const r = await run(cwd, EXECUTE);
    2259|     expect(r.code).toBe(11);
    2260|     expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }…
       |                          ^
    2261|   });
    2262|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > the refusal names the BLOCKED line the engine reads
AssertionError: expected '`src/a.test.ts` "adds a row" differs …' to match /BLOCKED —…/a\.test\.ts` `adds a row` — 

- Expected:
/BLOCKED — TASK [^:]+: test `src\/a\.test\.ts` `adds a row` — /

+ Received:
"`src/a.test.ts` \"adds a row\" differs from what the group's tests step recorded at its red: a code step never edits a planned test case — put that test back as the tests step left it (other edits to the file stay), or log the task BLOCKED naming the test and what it gets wrong (nothing written)"

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2268:28
    2266|     const r = await run(cwd, EXECUTE);
    2267|     expect(r.code).toBe(11);
    2268|     expect(r.json.problem).toMatch(/BLOCKED — TASK [^:]+: test `src\/a…
       |                            ^
    2269|   });
    2270|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > the exit 11 help names the BLOCKED line that lets a change through
AssertionError: expected 'build plan-execute / plan-gaps-remedi…' to match /BLOCKED — [^`]*test `/

- Expected:
/BLOCKED — [^`]*test `/

+ Received:
"build plan-execute / plan-gaps-remediate: a planned test case of the group differs from the lines its tests step recorded in status.jsonl (`tests`: [{test, name}]; `touched`: their files) — re-ask `reask.agent` to put that test back or log the task BLOCKED; other edits to the file stay (nothing written; an agent-rework friction row is appended)"

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2273:23
    2271|   it("the exit 11 help names the BLOCKED line that lets a change throu…
    2272|     const codes = stepsCommand.verbs.finish!.exitCodes as Record<numbe…
    2273|     expect(codes[11]).toMatch(/BLOCKED — [^`]*test `/);
       |                       ^
    2274|   });
    2275|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > passes a later code step that leaves a BLOCKED change as it is
AssertionError: expected 11 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 11

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2280:44
    2278|     write(cwd, TEST.file, body("2", "0"));
    2279|     appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST…
    2280|     expect((await run(cwd, EXECUTE)).code).toBe(0);
       |                                            ^
    2281|     expect(stepRows(cwd, "build-plan-tasks")[0]!.changedTests).toHaveL…
    2282|     write(cwd, "src/b.ts", "export const b = 2;\n");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > refuses a later code step that changes a BLOCKED change again
AssertionError: expected 11 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 11

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2291:44
    2289|     write(cwd, TEST.file, body("2", "0"));
    2290|     appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST…
    2291|     expect((await run(cwd, EXECUTE)).code).toBe(0);
       |                                            ^
    2292|     expect(stepRows(cwd, "build-plan-tasks")[0]!.changedTests).toEqual…
    2293|       expect.objectContaining({ testName: TEST.name }),

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line
AssertionError: expected 11 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 11

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2306:44
    2304|     write(cwd, TEST.file, body("2", "0"));
    2305|     appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST…
    2306|     expect((await run(cwd, EXECUTE)).code).toBe(0);
       |                                            ^
    2307|     write(cwd, TEST.file, body("3", "0"));
    2308|     copyLog(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > uses a red the tests step recorded after a code step's change as the baseline
AssertionError: expected 11 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 11

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2330:44
    2328|     write(cwd, TEST.file, body("2", "0"));
    2329|     appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST…
    2330|     expect((await run(cwd, EXECUTE)).code).toBe(0);
       |                                            ^
    2331|     expect(stepRows(cwd, "build-plan-tasks")[0]!.changedTests).toEqual…
    2332|       expect.objectContaining({ testName: TEST.name }),

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/13]⎯


 Test Files  1 failed (1)
      Tests  13 failed | 131 passed (144)
   Start at  18:51:02
   Duration  53.90s (tests 98%, transform 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-FB0GSc/junit.xml
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

[test-timeout-budget] load average 16.8 on 10 cores: unit limits 12900ms per test, 25800ms per hook (x2.58)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts (157 tests | 3 failed) 27291ms
   ✓ CI evidence test rounds (4)
     ✓ records a CI evidence round without executing a local gate 45ms
     ✓ records the selected run's failed job count 30ms
     ✓ runs local gates only after current-generation remediation or soak 625ms
     ✓ rejects CI rounds without active matching debug selection 30ms
   ✓ resolveGate (6)
     ✓ picks the deepest declared candidate, not the first declared in package.json 24ms
     ✓ falls back to a shallower candidate when the deeper one is undeclared 51ms
     ✓ an empty script is not declared: it would run nothing and exit 0 (fix) 44ms
     ✓ no package.json, no scripts, or unparseable -> null 108ms
     ✓ debug's live-first chain stops at the deepest declared tier 58ms
     ✓ with no e2e gate, debug runs the integration gate build runs 48ms
   ✓ bkit tests run (16)
     ✓ a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run 25ms
     ✓ a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81 22ms
     ✓ a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4 22ms
     ✓ tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate 25ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 304ms
     ✓ a 73 exit with a refusal line for another lock is the gate's own FAIL, never exit 4 22ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 306ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 333ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 275ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 281ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 103ms
     ✓ no candidate declared: exit 3, nothing run, and the hint names bkit:gate:* — not an install flag (fix) 59ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 100ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 289ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 353ms
     ✓ --gate and --log are required 23ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 600ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 275ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 248ms
     ✓ PASS is 0 failures with or without reports 342ms
     ✓ clears a previous attempt's reports before the gate runs 263ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 260ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 313ms
     ✓ a log under the outbox is named main-checkout relative in the record 296ms
     ✓ a log small enough is copied whole: not clamped, raw null 262ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 250ms
     ✓ --artifact needs --fid and --step 20ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 383ms
     ✓ numbers runs within the workflow's active run and per step 385ms
     ✓ without --file no row is written and the output carries row null 408ms
     ✓ --file needs --workflow and --step, and an existing status.jsonl, before the gate runs 22ms
   ✓ parseJunit (5)
     ✓ reads names, outcomes and failure messages, decoding entities 20ms
     ✓ keeps a failure's text as detail, CDATA as written and tags stripped 20ms
     ✓ survives a raw > inside an attribute and a closing tag inside CDATA 20ms
     ✓ keeps each case's classname and file attribute 19ms
     ✓ no testcase elements -> empty 20ms
   ✓ reportFailures (1)
     ✓ returns the failing and erroring cases of every report, or null with none 23ms
   ✓ judgeRed / judgeGreen — the named test, never the exit code alone (9)
     ✓ a red is the named test failing or erroring 21ms
     ✓ state: no report (misspelled path) 21ms
     ✓ state: load error named after the file 24ms
     ✓ state: zero tests 24ms
     ✓ state: the named test passed (code written first) 21ms
     ✓ state: the named test skipped (filter matched nothing) 21ms
     ✓ state: other tests only 25ms
     ✓ a name only matches whole trailing segments 42ms
     ✓ green needs every case of the named test to pass 23ms
   ✓ readTestFirst (5)
     ✓ reads test, n/a, missing and malformed entries per task 23ms
     ✓ reads several tests per task, one per sub-bullet; a name may hold a `;` 20ms
     ✓ reads a task's TEST EXCEPTION field apart from its TEST FIRST tests, with its plan lines 21ms
     ✓ narrows to one group's tasks 21ms
     ✓ reads no task from old-format task lines 19ms
   ✓ taskSizes (1)
     ✓ counts tests and distinct test files per task; n/a, missing and malformed count 0 20ms
   ✓ checkPlanText (4)
     ✓ sizes each group and task, and lists each problem with its line 20ms
     ✓ refuses a task that depends on itself 20ms
     ✓ an unclosed code fence is reported as such, not as missing task markers 21ms
     ✓ reads a CRLF plan's Reuse Inventory 21ms
   ✓ shipped task examples (9)
     ✓ the shipped plan template's example parses 22ms
     ✓ the change-shape example in trackers.md parses 21ms
     ✓ change issue form example passes plan-check 29ms
     ✓ trackers.md change example shows every task field 22ms
     ✓ the shipped change form shows every plan cap with its settings default 20ms
     ✓ this repo's change form shows every plan cap with its settings default 19ms
     ✓ trackers.md shows each plan cap it names with its settings default 20ms
     ✓ README.md shows each plan cap it names with its settings default 22ms
     ✓ this repo's change form shows the caps this repo's package.json sets 21ms
   ✓ bkit tests plan-check (35)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 87ms
     ✓ states the caps the template and workflows doc name 25ms
     ✓ every prompt that sizes a task or group takes the caps from its Context 43ms
     ✓ plan-check refuses a task without DONE WHEN 76ms
     ✓ plan-check refuses DEPENDS ON a later group 126ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 178ms
     ✓ plan-check matches a Markdown heading symbol 125ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 110ms
     ✓ plan-check walks a dotted key through indented JSON, YAML and TOML 117ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 81ms
     ✓ plan-check skips existence on ticked tasks 78ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 127ms
     ✓ plan-check refuses an unmapped matrix row 115ms
     ✓ plan-check refuses a delete with no supersession row 332ms
     ✓ plan-check refuses a matrix row mapped to two tasks 102ms
     ✓ plan-check refuses rows left in the old column order under the template header 131ms
     ✓ plan-check refuses rows with an extra cell under the template header 74ms
     ✓ plan-check refuses a task no matrix row maps to 68ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 127ms
     ✓ plan-check refuses a matrix header with no Task column, naming the column to add 56ms
     ✓ plan-check refuses a matrix header with an extra leading # column 52ms
     ✓ plan-check refuses a matrix header with Task not last 55ms
     ✓ plan-check refuses synonym matrix column names 61ms
     ✓ plan-check refuses a matrix header with no closing pipe 66ms
     ✓ plan-check accepts the template matrix header in any letter case 58ms
     ✓ plan-check refuses a Task cell naming an undefined task 57ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 118ms
     ✓ plan-check refuses a group with 6 tasks 74ms
     ✓ plan-check refuses a group with 26 planned tests 52ms
     ✓ plan-check accepts 5 tasks and 25 tests in one group 80ms
     ✓ plan-check report lists groups, not a verdict 79ms
     ✓ plan-check refuses a task over the per-task caps, naming the task and the cap 56ms
     ✓ plan-check follows bkit.workflows.tasks 84ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 94ms
     ✓ a missing plan file is a usage error 24ms
   ✓ testBlock — a planned test's own lines, by name and indentation (12)
     ✓ takes the named test's opening line, its deeper lines and its closer, and nothing of its neighbours 22ms
     ✓ an edit to a neighbour leaves the hash alone; an edit to the test's own lines changes it 24ms
     ✓ testSpan gives the 1-based first and last line of the block, and lineDiff counts the lines removed and added 24ms
     ✓ finds a test planned by its suite path (`suite > test`) through its last segment 22ms
     ✓ starts at the call when the name sits on its own line under an open paren 23ms
     ✓ is stack-agnostic: pytest 23ms
     ✓ is stack-agnostic: go 23ms
     ✓ is stack-agnostic: rspec 22ms
     ✓ passes over a comment that quotes the name: the test, not the comment, is locked 24ms
     ✓ passes over a suite titled like the test, so its neighbours stay free to change 25ms
     ✓ falls back to a suite line when nothing else carries the name 24ms
     ✓ is null when the name is not in the file, or there is no file 30ms
   ❯ blockedTests (2)
     × reads the file, name and reason from a TASK or Gap BLOCKED test line 37ms
     × ignores a BLOCKED line that names no test 24ms
   ❯ bkit tests red / green (33)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 516ms
     ✓ a planned test that passes is a vacuous gap, exit 1 370ms
     ✓ a planned test absent from a loaded report is a missing gap 391ms
     ✓ a file that fails to load is a red of kind red-not-loaded 462ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 552ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 173ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 660ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 352ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 389ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 126ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 783ms
     × red keeps a test standing whose lines match a code step's recorded change 420ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 472ms
       ✓ a later unproven result never replaces a proven red of the same lines 66ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 572ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 476ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 750ms
     ✓ green: a passed-accepted test is already landed, not a gap 429ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 629ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 100ms
     ✓ green refuses a plan with no task markers 93ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1021ms
     ✓ green: --group audits only that group's tasks 504ms
     ✓ green: --group naming a group with no tasks is refused 88ms
     ✓ green: a code fence never closed is the reason, not missing task markers 102ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 637ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 928ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 491ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 643ms
     ✓ green: lists each gap kind, with the runner output 504ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 854ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 292ms
       ✓ green clears an exception-only task from a human commit 217ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > blockedTests > reads the file, name and reason from a TASK or Gap BLOCKED test line
TypeError: blockedTests is not a function
 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:2132:12
    2130|       "BLOCKED - TASK 4: test `src/c.test.ts` `plain hyphen` — x",
    2131|     ].join("\n");
    2132|     expect(blockedTests(log)).toEqual([
       |            ^
    2133|       { test: "src/a.test.ts", name: "adds a row", reason: "new setup …
    2134|       { test: "src/b.test.ts", name: "suite > counts", reason: "fixtur…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > blockedTests > ignores a BLOCKED line that names no test
TypeError: blockedTests is not a function
 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:2144:12
    2142|       "BLOCKED — TASK 2: test `src/a.test.ts` `adds a row`",
    2143|     ].join("\n");
    2144|     expect(blockedTests(log)).toEqual([]);
       |            ^
    2145|   });
    2146| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests red / green > red keeps a test standing whose lines match a code step's recorded change
AssertionError: expected { enforced: true, attempt: 2, …(5) } to match object { attempt: 2, skipped: 1, gaps: [] }
(15 matching properties omitted from actual)

- Expected
+ Received

  {
    "attempt": 2,
    "gaps": [],
-   "skipped": 1,
+   "skipped": 0,
  }

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:2502:25
    2500|     const second = await red([], "logs/build-tests-red-1-2.md");
    2501|     expect(second.code).toBe(0);
    2502|     expect(second.json).toMatchObject({ attempt: 2, skipped: 1, gaps: …
       |                         ^
    2503|     expect(second.json.tests).toEqual([]);
    2504|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 154 passed (157)
   Start at  18:51:57
   Duration  28.02s (tests 98%, transform 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-mhZpvB/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
