Enforced: true
Red: 12
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/830-debug-diagnose-named-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 3 | `.bkit/core/engine/commands/workflow/status.test.ts` "persists atomic selections and preserves identical evidence generations" | red | failure: expected 2 to be +0 // Object.is equality |
| 3 | `.bkit/core/engine/commands/workflow/status.test.ts` "resumes saved evidence and replaces it only on explicit new selection" | red | failure: expected { Object (verdict, failures, ...) } to match object { ciRun: '123', ciGeneration: 1, …(1) } (12 matching properties omitted from actual) |
| 3 | `.bkit/core/engine/commands/workflow/status.test.ts` "clears saved CI routing immediately for explicit local selection" | red | failure: expected { Object (verdict, failures, ...) } to match object { ciRun: null, redTiers: [], …(2) } (12 matching properties omitted from actual) |
| 3 | `.bkit/core/engine/commands/workflow/status.test.ts` "counts reproduction and fixes only in the active generation" | red | failure: expected { Object (verdict, failures, ...) } to match object { ciFixDone: false, …(2) } (11 matching properties omitted from actual) |
| 3 | `.bkit/core/engine/commands/workflow/status.test.ts` "orders covering gates for red tiers and preserves live off" | red | failure: expected 'bkit:gate:static-unit-integration-e2e…' to be 'bkit:gate:static-unit' // Object.is equality |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "records a CI evidence round without executing a local gate" | red | failure: expected 2 to be 1 // Object.is equality |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "runs local gates only after current-generation remediation or soak" | red | failure: Cannot read properties of undefined (reading 'source') |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "rejects CI rounds without active matching debug selection" | red | failure: expected 2 to be 1 // Object.is equality |
| 4 | `.bkit/core/engine/ledgers/telemetry.test.ts` "accepts bounded CI evidence rows while preserving local exit validation" | red | failure: testRunProblem is not a function |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "finishes validated CI evidence rounds without local clamp records" | red | failure: expected +0 not to be +0 // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "preserves local clamp enforcement when completing test rounds" | red | failure: expected +0 not to be +0 // Object.is equality |
| 5 | `.bkit/core/engine/checks/status-holes.test.ts` "audits evidence-first debug rounds without requiring a local discovery run" | red | failure: expected 'CLEAN' to be 'HOLEY' // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/status.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/status.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/status.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/status.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named

 ❯ .bkit/core/engine/commands/workflow/status.test.ts (75 tests | 5 failed) 300ms
   ❯ debug evidence state (5)
     × persists atomic selections and preserves identical evidence generations 4ms
     × resumes saved evidence and replaces it only on explicit new selection 9ms
     × clears saved CI routing immediately for explicit local selection 6ms
     × counts reproduction and fixes only in the active generation 6ms
     × orders covering gates for red tiers and preserves live off 6ms
   ✓ bkit status path (2)
     ✓ returns the main checkout's path outside a worktree, and whether it exists 16ms
     ✓ rejects a month that is not YYYYMM 0ms
   ✓ the status fold (4)
     ✓ skips a row it does not model (no type, an unknown type) and folds the rest 1ms
     ✓ ignores a row type it does not know 1ms
     ✓ refuses a line that is not JSON rather than folding around it (exit 3) 1ms
     ✓ a command reading the log reports the malformed line with exit 3 1ms
   ✓ bkit status route (20)
     ✓ reads the last verdict and failures of a step in the active run, per group 0ms
     ✓ reads a build-plan-execute row written before the step rename as build-plan-tasks 1ms
     ✓ prints the parentSha of the step's last row in the active run, per group 0ms
     ✓ counts absent failures as 0 when a verdict is present 0ms
     ✓ reads an absent failures count on FAIL as null: the count is unknown, not 0 0ms
     ✓ does not leak a completed run's verdict into a fresh run 0ms
     ✓ reads strategy across ALL runs and gives the next rung 0ms
     ✓ starts the ladder at STANDARD when no strategy is recorded 0ms
     ✓ prefers the run-level debugMode over an older step value, and reads pushMode and debugAttempt 0ms
     ✓ fails a --require'd mode that is missing or invalid 0ms
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
     ✓ a fresh run: attempt 1, NORMAL, no repro, every gate 5ms
     ✓ a resumed run keeps its attempt number 5ms
     ✓ fix rounds used up across runs (debug.fix.maxAttempts) enter SOAK 4ms
     ✓ the fix limit comes from bkit.workflows.debug.fix.maxAttempts 8ms
     ✓ [soak] and [repro] in the prompt 4ms
     ✓ a resumed run that soaked continues in SOAK 5ms
     ✓ soak rows of a finished run do not force SOAK on the next run 4ms
     ✓ an escalation recorded only in workflow-meta survives a resume 4ms
     ✓ [live=off] in the prompt drops the live gate; the issue body is not read 9ms
     ✓ finds status.jsonl from --fid and --month 25ms
     ✓ refuses --prompt-file for another workflow, and a missing --file without --fid 1ms
     ✓ a missing prompt file is a usage error 1ms
   ✓ bkit status route --workflow=build publish (7)
     ✓ lets the publish token override publish.local 8ms
     ✓ reads publish.local on LOCAL without a token 4ms
     ✓ coerces publish false to true on a non-LOCAL runtime 4ms
     ✓ accepts --prompt-file with --workflow=build 4ms
     ✓ ignores publish=maybe and falls through to config 4ms
     ✓ refuses publish without a runtime-resolved row 4ms
     ✓ prints publishSource for token, local, remote and coerced 15ms
   ✓ bkit status route --expect (4)
     ✓ passes when every field holds the expected value 1ms
     ✓ exits 4 naming a field that holds another value 1ms
     ✓ an expected field is also required: missing exits 4 1ms
     ✓ checks a step field with --step, and refuses an unknown field 0ms
   ✓ bkit status meta (9)
     ✓ appends a workflow-meta row the route read then sees 1ms
     ✓ records openedPr, and refuses the removed --soak-entry and --decision 0ms
     ✓ --debug-attempt=run records the active run's number 1ms
     ✓ meta refuses --plan-source 0ms
     ✓ rejects ["--debug-mode=TURBO"] 0ms
     ✓ rejects ["--push-mode=REMOTE"] 0ms
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
     ✓ status row owner-pause appends one human-confirm friction row 20ms
     ✓ status row owner-pause skips the friction row when no step-done follows the last owner-pause with the same reason 17ms
     ✓ status row owner-pause with a new reason appends its own row with no step-done in between 24ms
     ✓ status row owner-pause in a later pause appends a same-key recurrence 24ms
     ✓ status row writes no friction row for other types or with BKIT_ENGINE_JOURNAL=off 10ms
     ✓ status row owner-pause keeps the status row and exits 4 when the friction row cannot be written 16ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/status.test.ts > debug evidence state > persists atomic selections and preserves identical evidence generations
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/status.test.ts:103:24
    101|     const selection = ciStateSelection();
    102|     const first = await ciStateWrite(file, selection);
    103|     expect(first.code).toBe(0);
       |                        ^
    104|     expect(first.json.row).toMatchObject({ ciSelection: selection, ciG…
    105|     const repeated = await ciStateWrite(file, { ...selection, via: "is…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

 FAIL  .bkit/core/engine/commands/workflow/status.test.ts > debug evidence state > resumes saved evidence and replaces it only on explicit new selection
AssertionError: expected { Object (verdict, failures, ...) } to match object { ciRun: '123', ciGeneration: 1, …(1) }
(12 matching properties omitted from actual)

- Expected
+ Received

  {
-   "ciGeneration": 1,
-   "ciRun": "123",
-   "redTiers": [
-     "integration",
+   "debugAttempt": 1,
+   "debugMode": "NORMAL",
+   "failures": null,
+   "gates": [
+     "bkit:gate:static-unit-integration-e2e-live",
+     "bkit:gate:static-unit-integration-e2e",
+     "bkit:gate:static-unit-integration",
+     "bkit:gate:static-unit",
    ],
+   "nextStrategy": null,
+   "parentSha": null,
+   "publish": null,
+   "publishSource": null,
+   "pushMode": null,
+   "repro": false,
+   "strategy": null,
+   "verdict": null,
  }

 ❯ .bkit/core/engine/commands/workflow/status.test.ts:126:25
    124|     const resume = await ciStateRoute(file);
    125|     expect(resume.code).toBe(0);
    126|     expect(resume.json).toMatchObject({ ciRun: "123", ciGeneration: 1,…
       |                         ^
    127|     expect((await ciStateRoute(file)).json).toMatchObject({ ciRun: "12…
    128|     expect(fs.readFileSync(file, "utf-8")).toBe(before);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

 FAIL  .bkit/core/engine/commands/workflow/status.test.ts > debug evidence state > clears saved CI routing immediately for explicit local selection
AssertionError: expected { Object (verdict, failures, ...) } to match object { ciRun: null, redTiers: [], …(2) }
(12 matching properties omitted from actual)

- Expected
+ Received

  {
-   "ciFixDone": false,
-   "ciReproduced": false,
-   "ciRun": null,
-   "redTiers": [],
+   "debugAttempt": 1,
+   "debugMode": "NORMAL",
+   "failures": null,
+   "gates": [
+     "bkit:gate:static-unit-integration-e2e-live",
+     "bkit:gate:static-unit-integration-e2e",
+     "bkit:gate:static-unit-integration",
+     "bkit:gate:static-unit",
+   ],
+   "nextStrategy": null,
+   "parentSha": null,
+   "publish": null,
+   "publishSource": null,
+   "pushMode": null,
+   "repro": false,
+   "strategy": null,
+   "verdict": null,
  }

 ❯ .bkit/core/engine/commands/workflow/status.test.ts:160:24
    158|     );
    159|     expect(route.code).toBe(0);
    160|     expect(route.json).toMatchObject({
       |                        ^
    161|       ciRun: null,
    162|       redTiers: [],

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

 FAIL  .bkit/core/engine/commands/workflow/status.test.ts > debug evidence state > counts reproduction and fixes only in the active generation
AssertionError: expected { Object (verdict, failures, ...) } to match object { ciFixDone: false, …(2) }
(11 matching properties omitted from actual)

- Expected
+ Received

  {
-   "ciFixDone": false,
-   "ciReproduced": false,
    "debugMode": "SOAK",
  }

 ❯ .bkit/core/engine/commands/workflow/status.test.ts:201:28
    199|     );
    200|     const noCurrent = await ciStateRoute(file, "/bkit-debug 7-x [repro…
    201|     expect(noCurrent.json).toMatchObject({
       |                            ^
    202|       ciFixDone: false,
    203|       ciReproduced: false,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

 FAIL  .bkit/core/engine/commands/workflow/status.test.ts > debug evidence state > orders covering gates for red tiers and preserves live off
AssertionError: expected 'bkit:gate:static-unit-integration-e2e…' to be 'bkit:gate:static-unit' // Object.is equality

Expected: "bkit:gate:static-unit"
Received: "bkit:gate:static-unit-integration-e2e-live"

 ❯ .bkit/core/engine/commands/workflow/status.test.ts:241:32
    239|     ]);
    240|     const unit = await ciStateRoute(file);
    241|     expect(unit.json.gates[0]).toBe("bkit:gate:static-unit");
       |                                ^
    242|     expect(new Set(unit.json.gates).size).toBe(unit.json.gates.length);
    243|     const integrationFile = log([started("debug", "2026-10-01T00:00:00…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯


 Test Files  1 failed (1)
      Tests  5 failed | 70 passed (75)
   Start at  22:36:25
   Duration  471ms (tests 71%, import 14%, transform 12%, setup 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-jSg5ps/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/tests.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tests.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tests.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tests.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts (138 tests | 3 failed) 8864ms
   ❯ CI evidence test rounds (3)
     × records a CI evidence round without executing a local gate 15ms
     × runs local gates only after current-generation remediation or soak 10ms
     × rejects CI rounds without active matching debug selection 18ms
   ✓ resolveGate (6)
     ✓ picks the deepest declared candidate, not the first declared in package.json 10ms
     ✓ falls back to a shallower candidate when the deeper one is undeclared 19ms
     ✓ an empty script is not declared: it would run nothing and exit 0 (fix) 18ms
     ✓ no package.json, no scripts, or unparseable -> null 37ms
     ✓ debug's live-first chain stops at the deepest declared tier 19ms
     ✓ with no e2e gate, debug runs the integration gate build runs 18ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 282ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 141ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 130ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 136ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 28ms
     ✓ no candidate declared: exit 3, nothing run, and the hint names bkit:gate:* — not an install flag (fix) 27ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 36ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 134ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 131ms
     ✓ --gate and --log are required 12ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 129ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 122ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 128ms
     ✓ PASS is 0 failures with or without reports 141ms
     ✓ clears a previous attempt's reports before the gate runs 125ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 124ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 167ms
     ✓ a log under the outbox is named main-checkout relative in the record 163ms
     ✓ a log small enough is copied whole: not clamped, raw null 131ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 121ms
     ✓ --artifact needs --fid and --step 13ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 144ms
     ✓ numbers runs within the workflow's active run and per step 143ms
     ✓ without --file no row is written and the output carries row null 123ms
     ✓ --file needs --workflow and --step, and an existing status.jsonl, before the gate runs 13ms
   ✓ parseJunit (4)
     ✓ reads names, outcomes and failure messages, decoding entities 11ms
     ✓ keeps a failure's text as detail, CDATA as written and tags stripped 12ms
     ✓ survives a raw > inside an attribute and a closing tag inside CDATA 10ms
     ✓ no testcase elements -> empty 10ms
   ✓ judgeRed / judgeGreen — the named test, never the exit code alone (9)
     ✓ a red is the named test failing or erroring 10ms
     ✓ state: no report (misspelled path) 9ms
     ✓ state: load error named after the file 9ms
     ✓ state: zero tests 10ms
     ✓ state: the named test passed (code written first) 10ms
     ✓ state: the named test skipped (filter matched nothing) 9ms
     ✓ state: other tests only 9ms
     ✓ a name only matches whole trailing segments 9ms
     ✓ green needs every case of the named test to pass 9ms
   ✓ readTestFirst (5)
     ✓ reads test, n/a, missing and malformed entries per task 11ms
     ✓ reads several tests per task, one per sub-bullet; a name may hold a `;` 9ms
     ✓ reads a task's TEST EXCEPTION field apart from its TEST FIRST tests, with its plan lines 9ms
     ✓ narrows to one group's tasks 9ms
     ✓ reads no task from old-format task lines 9ms
   ✓ taskSizes (1)
     ✓ counts tests and distinct test files per task; n/a, missing and malformed count 0 10ms
   ✓ checkPlanText (4)
     ✓ sizes each group and task, and lists each problem with its line 9ms
     ✓ refuses a task that depends on itself 9ms
     ✓ an unclosed code fence is reported as such, not as missing task markers 9ms
     ✓ reads a CRLF plan's Reuse Inventory 9ms
   ✓ shipped task examples (9)
     ✓ the shipped plan template's example parses 10ms
     ✓ the change-shape example in trackers.md parses 10ms
     ✓ change issue form example passes plan-check 14ms
     ✓ trackers.md change example shows every task field 11ms
     ✓ the shipped change form shows every plan cap with its settings default 10ms
     ✓ this repo's change form shows every plan cap with its settings default 9ms
     ✓ trackers.md shows each plan cap it names with its settings default 9ms
     ✓ README.md shows each plan cap it names with its settings default 9ms
     ✓ this repo's change form shows the caps this repo's package.json sets 9ms
   ✓ bkit tests plan-check (28)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 32ms
     ✓ states the caps the template and workflows doc name 8ms
     ✓ every prompt that sizes a task or group takes the caps from its Context 18ms
     ✓ plan-check refuses a task without DONE WHEN 23ms
     ✓ plan-check refuses DEPENDS ON a later group 31ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 33ms
     ✓ plan-check matches a Markdown heading symbol 30ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 21ms
     ✓ plan-check walks a dotted key through indented JSON, YAML and TOML 22ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 21ms
     ✓ plan-check skips existence on ticked tasks 20ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 30ms
     ✓ plan-check refuses an unmapped matrix row 20ms
     ✓ plan-check refuses a delete with no supersession row 31ms
     ✓ plan-check refuses a matrix row mapped to two tasks 21ms
     ✓ plan-check refuses a task no matrix row maps to 20ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 33ms
     ✓ plan-check refuses a matrix header with no Task column, naming the column to add 21ms
     ✓ plan-check refuses a Task cell naming an undefined task 20ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 31ms
     ✓ plan-check refuses a group with 6 tasks 20ms
     ✓ plan-check refuses a group with 26 planned tests 20ms
     ✓ plan-check accepts 5 tasks and 25 tests in one group 20ms
     ✓ plan-check report lists groups, not a verdict 21ms
     ✓ plan-check refuses a task over the per-task caps, naming the task and the cap 20ms
     ✓ plan-check follows bkit.workflows.tasks 31ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 31ms
     ✓ a missing plan file is a usage error 9ms
   ✓ testBlock — a planned test's own lines, by name and indentation (12)
     ✓ takes the named test's opening line, its deeper lines and its closer, and nothing of its neighbours 10ms
     ✓ an edit to a neighbour leaves the hash alone; an edit to the test's own lines changes it 9ms
     ✓ testSpan gives the 1-based first and last line of the block, and lineDiff counts the lines removed and added 9ms
     ✓ finds a test planned by its suite path (`suite > test`) through its last segment 9ms
     ✓ starts at the call when the name sits on its own line under an open paren 9ms
     ✓ is stack-agnostic: pytest 9ms
     ✓ is stack-agnostic: go 9ms
     ✓ is stack-agnostic: rspec 9ms
     ✓ passes over a comment that quotes the name: the test, not the comment, is locked 9ms
     ✓ passes over a suite titled like the test, so its neighbours stay free to change 9ms
     ✓ falls back to a suite line when nothing else carries the name 9ms
     ✓ is null when the name is not in the file, or there is no file 9ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 213ms
     ✓ a planned test that passes is a vacuous gap, exit 1 172ms
     ✓ a planned test absent from a loaded report is a missing gap 158ms
     ✓ a file that fails to load is a red of kind red-not-loaded 185ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 180ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 70ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 208ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 157ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 160ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 46ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 213ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 188ms
       ✓ a later unproven result never replaces a proven red of the same lines 30ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 237ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 201ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 196ms
     ✓ green: a passed-accepted test is already landed, not a gap 173ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 165ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 47ms
     ✓ green refuses a plan with no task markers 36ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 183ms
     ✓ green: --group audits only that group's tasks 152ms
     ✓ green: --group naming a group with no tasks is refused 40ms
     ✓ green: a code fence never closed is the reason, not missing task markers 33ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 207ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 183ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 163ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 176ms
     ✓ green: lists each gap kind, with the runner output 171ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 267ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 93ms
       ✓ green clears an exception-only task from a human commit 72ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > CI evidence test rounds > records a CI evidence round without executing a local gate
AssertionError: expected 2 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:169:25
    167|     const f = ciRoundFixture();
    168|     const result = await run(f.args);
    169|     expect(result.code).toBe(1);
       |                         ^
    170|     expect(result.json).toMatchObject({
    171|       source: "ci",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > CI evidence test rounds > runs local gates only after current-generation remediation or soak
TypeError: Cannot read properties of undefined (reading 'source')
 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:206:37
    204|     const f = ciRoundFixture();
    205|     f.fix(1);
    206|     expect((await run(f.args)).json.source).toBe("ci");
       |                                     ^
    207|     expect(fs.existsSync(f.marker)).toBe(false);
    208|     f.fix(2, "debug-failure-remediate", "FAILED");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > CI evidence test rounds > rejects CI rounds without active matching debug selection
AssertionError: expected 2 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:229:38
    227|   it("rejects CI rounds without active matching debug selection", asyn…
    228|     const f = ciRoundFixture();
    229|     expect((await run(f.args)).code).toBe(1);
       |                                      ^
    230|     expect((await run(f.args.filter((arg) => !arg.startsWith("--file="…
    231|     expect(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 135 passed (138)
   Start at  22:36:26
   Duration  9.01s (tests 99%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-vQaNxN/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/ledgers/telemetry.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/ledgers/telemetry.test.ts

```

## Runner output — `.bkit/core/engine/ledgers/telemetry.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/ledgers/telemetry.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ❯ .bkit/core/engine/ledgers/telemetry.test.ts (292 tests | 1 failed) 151ms
   ❯ test-run status row validation (1)
     × accepts bounded CI evidence rows while preserving local exit validation 3ms
   ✓ identity — per-kind composite tuples (7)
     ✓ compliance: keyed by (repo, by.workflow, run.parentSha, rule.id) 0ms
     ✓ outcome: keyed by (repo, by.workflow, run.parentSha) — run.pr fallback when no parentSha 0ms
     ✓ counter: keyed by (repo, by.workflow, run.parentSha, counter.name) 0ms
     ✓ friction: keyed by (kind, repo, key) 0ms
     ✓ deferral: keyed by (kind, repo, key) 0ms
     ✓ failure: keyed by (kind, repo, key) 0ms
     ✓ composite tuple is DISTINCT from bare ts — same ts, different key → different identity 0ms
   ✓ severity — per-kind requirement + closed enum (61)
     ✓ friction carries severity 0ms
     ✓ deferral carries severity 0ms
     ✓ failure carries severity 0ms
     ✓ compliance does NOT carry severity 0ms
     ✓ outcome does NOT carry severity 0ms
     ✓ counter does NOT carry severity 0ms
     ✓ knowledge does NOT carry severity 0ms
     ✓ decision does NOT carry severity 0ms
     ✓ VALID_SEVERITIES is exactly CRITICAL|HIGH|MEDIUM|LOW 0ms
     ✓ accepts severity CRITICAL 0ms
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
     ✓ rejects off-enum severity "" 0ms
     ✓ rejects severity on a kind that must not carry it 0ms
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
     ✓ accepts decision status "SUPERSEDED" 0ms
     ✓ rejects triage status "OPEN" on a decision 0ms
     ✓ rejects triage status "CLOSED" on a decision 0ms
     ✓ rejects triage status "TRIAGED" on a decision 0ms
     ✓ accepts knowledge status "ACTIVE" 0ms
     ✓ accepts knowledge status "SUPERSEDED" 0ms
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
     ✓ parse still reads legacy free-text status rows 0ms
     ✓ parse still reads pre-severity rows 0ms
   ✓ updating a row — supersede by same-key append (4)
     ✓ a later same-key row wins the fold; the earlier one stays as history 0ms
     ✓ fold is last-wins by ts, not by file order 0ms
     ✓ fold orders ISO-string and missing ts deterministically, whatever the file order 0ms
     ✓ a reworded key forks the entry instead of updating it 0ms
   ✓ triage ladder — OPEN -> TRIAGED -> CLOSED (3)
     ✓ TRIAGE_STATUSES is exactly OPEN|TRIAGED|CLOSED 0ms
     ✓ the triaged kinds are exactly the severity-carrying kinds 0ms
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
     ✓ leaves a workflow's telemetry report unchanged 0ms
   ✓ run kind — .bkit/stats.jsonl run rows (6)
     ✓ is a valid kind keyed by kind + repo + key 0ms
     ✓ rejects a row without the join keys readers depend on 0ms
     ✓ takes only the five endings 0ms
     ✓ carries no severity or status 0ms
     ✓ a grown run log's new row folds over the first one 0ms
     ✓ leaves the telemetry report of the same workflow unchanged 1ms
   ✓ jsonl.md examples — validated against the codec (6)
     ✓ every full example row is a valid event 1ms
     ✓ every example field is a Generic Field or listed in its kind's Per-Kind Fields row 1ms
     ✓ every kind has a worked example 1ms
     ✓ no example puts an agent name in by.step 0ms
     ✓ by.model appears exactly where by.subagent does — never on an orchestrator row 1ms
     ✓ the triaged kinds' examples carry severity and references 0ms
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
     ✓ resolves the slug from a repo's origin remote 18ms
     ✓ returns empty for a git repo with no origin remote 12ms
     ✓ returns empty for a directory that is not a git repo 4ms
   ✓ resolveGitSha — parentSha must be a real SHA before it reaches a row (7)
     ✓ resolves a rev to a hex SHA the grader's guard accepts 4ms
     ✓ never returns the rev it was given 4ms
     ✓ gives DIFFERENT SHAs for different revs — so identity cannot collapse runs 8ms
     ✓ returns empty for unresolvable "no-such-rev" 3ms
     ✓ returns empty for unresolvable "HEAD~99999" 4ms
     ✓ returns empty for unresolvable "" 4ms
     ✓ returns empty outside a git repo rather than throwing 4ms
   ✓ workflowTelemetry — ledger-health readout (no workflow) (5)
     ✓ names the unknown-version bucket instead of leaving it empty 1ms
     ✓ reports 0 malformed as a single 0 when nothing is malformed 0ms
     ✓ counts malformed lines by parsing, not by regex 0ms
     ✓ counts per-workflow ENTITIES, so an updated row is not counted twice 1ms
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
     ✓ lineage counts rows and takes the earliest ts 0ms
     ✓ lineage continues a stamped row's count and keeps its firstTs 0ms
     ✓ lineage counts same-ts rows once, keeping the larger stamped count 0ms
     ✓ lineage leaves firstTs out when no row carries a numeric ts 0ms
     ✓ placeLineage puts firstTs + updates right after ts, replacing stale values 0ms
     ✓ withLineage stamps a first row firstTs = ts, updates = 1 0ms
     ✓ withLineage carries forward from same-identity prior rows only 0ms
     ✓ withLineage replaces caller-supplied firstTs / updates 0ms
     ✓ withLineage passes keyless and non-aged rows through untouched 0ms
   ✓ parse — tolerant reader (8)
     ✓ parses valid NDJSON lines 0ms
     ✓ skips blank lines, does NOT count them as malformed 0ms
     ✓ counts a malformed (truncated trailing) line via malformedLineCount, does NOT throw 0ms
     ✓ counts a malformed line in the MIDDLE of the file, does NOT throw 0ms
     ✓ parses empty string → zero events, zero malformed 0ms
     ✓ NEVER throws on any input (fuzz) 0ms
     ✓ keeps ALL well-formed rows regardless of bkitVersion (no version gating) 0ms
     ✓ parse keeps an old row with subPlans 0ms
   ✓ outcome — shape and inline-jq parity (7)
     ✓ close-gate-shaped outcome validates successfully 0ms
     ✓ validate refuses plan.source brief on write 0ms
     ✓ accepts held in outcome and run endings 0ms
     ✓ keeps publish false on the outcome row 0ms
     ✓ rejects a non-boolean publish 0ms
     ✓ folds outcome by (repo, run.pr) 0ms
     ✓ inline-jq parity: jq-shaped row parses identically under parse() 0ms
   ✓ appendLine (1)
     ✓ serializes event to JSON string parseable back to same shape 0ms
   ✓ constants (1)
     ✓ MAX_ROWS_BEFORE_ROLLUP is a concrete number (not TODO) 0ms
   ✓ foldFrom — several ledger files (5)
     ✓ reads hot file and returns rowCount 1ms
     ✓ folds two files together 0ms
     ✓ missing paths are silently skipped 0ms
     ✓ emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP 13ms
     ✓ surfaces malformedLineCount from hot file 1ms
   ✓ workflowTelemetry — per-workflow summary signals (2)
     ✓ produces lines with rowCount, malformed, and per-version counts 1ms
     ✓ emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded 10ms
   ✓ workflowTelemetry — this-run vs med·5 baseline (7)
     ✓ shows THIS run's values against med·5 of the previous same-workflow runs 1ms
     ✓ workflowTelemetry splits the baseline on converted 1ms
     ✓ shows an ending row for a held close 0ms
     ✓ prints — for the baseline until at least 3 prior runs exist 0ms
     ✓ omits absent conditional metrics but shows ledgers.friction.added even at 0 0ms
     ✓ adds a this-run compliance line matched by run.parentSha 0ms
     ✓ adds the run's *_ATTEMPT counter matched by run.parentSha 0ms
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
     ✓ moves a whole-second clock reading 1 ms on 1ms
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
     ✓ admits each closing workflow on the stats kinds, and refuses audit and any subagent 0ms
   ✓ writer sets in telemetry.ts match the jsonl.md table (9)
     ✓ every kind appears in exactly one ledger 0ms
     ✓ decisions / decision: the doc row names docs/decisions.jsonl and the same writers 0ms
     ✓ deferrals / deferral: the doc row names docs/deferrals.jsonl and the same writers 0ms
     ✓ failures / failure: the doc row names docs/failures.jsonl and the same writers 0ms
     ✓ knowledge / knowledge: the doc row names docs/knowledge.jsonl and the same writers 0ms
     ✓ friction / friction: the doc row names .bkit/friction.jsonl and the same writers 0ms
     ✓ stats / compliance: the doc row names .bkit/stats.jsonl, a close-step writer and no subagent 0ms
     ✓ stats / counter: the doc row names .bkit/stats.jsonl, a close-step writer and no subagent 0ms
     ✓ stats / outcome: the doc row names .bkit/stats.jsonl, a close-step writer and no subagent 0ms
   ✓ normalize — schema-1 rows to schema 2 (13)
     ✓ compliance: rule / result / evidence / parentSha move into run and rule; phase is dropped 0ms
     ✓ counter: counterName / Value / Source and parentSha move into counter and run 0ms
     ✓ outcome: run fields move into their blocks; the fields with no place are dropped 0ms
     ✓ chat: every schema-1 field lands in its block, and the totals hold 1ms
     ✓ run: every schema-1 field lands in its block, and the totals hold 2ms
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
     ✓ lines.total.added = code + tests + docs 0ms
     ✓ lines.total.deleted = code + tests + docs 0ms
     ✓ lines.total.files = code + tests + docs 0ms
     ✓ lines.total.changed = added + deleted 0ms
     ✓ time.totalMinutes = end - start, within 0.1 0ms
     ✓ chat time.activeMinutes = the sum of time.spans 0ms
     ✓ usage.*.tokens.read = input + cacheWrite + cacheRead 0ms
     ✓ usage.total.turns / tokens = the sum of usage.byModel 0ms
     ✓ usage.total.compactions = usage.main + every agent's usage 0ms
     ✓ usage.total.context.peak = the max of usage.main and every agent instance 0ms
     ✓ agents.total.n = the sum of byAgent 0ms
     ✓ agents.total.errors = the sum of byAgent 0ms
     ✓ agents.byAgent.*.n = the length of its instances 0ms
     ✓ tools.total.calls = the sum of byTool 0ms
     ✓ tools.total.errors = the sum of byTool 0ms
     ✓ bkit.cli.total = the sum of byVerb 0ms
     ✓ steps.total.n = the sum of byStep 0ms
     ✓ steps.total.totalMinutes = the sum of byStep, within 0.1 per part 0ms
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

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/ledgers/telemetry.test.ts > test-run status row validation > accepts bounded CI evidence rows while preserving local exit validation
TypeError: testRunProblem is not a function
 ❯ .bkit/core/engine/ledgers/telemetry.test.ts:75:12
     73|       artifact: "docs/plans/202611/logs/1-x/run-tests-1.md",
     74|     };
     75|     expect(testRunProblem(ci)).toBeNull();
       |            ^
     76|     expect(testRunProblem({ ...ci, workflow: "build" })).not.toBeNull(…
     77|     expect(testRunProblem({ ...ci, exitCode: 0 })).not.toBeNull();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 291 passed (292)
   Start at  22:36:36
   Duration  235ms (tests 82%, setup 7%, import 7%, transform 4%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-RhZVVC/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/steps.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/steps.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts (111 tests | 2 failed) 8231ms
   ❯ test-round completion evidence (2)
     × finishes validated CI evidence rounds without local clamp records 98ms
     × preserves local clamp enforcement when completing test rounds 40ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 84ms
     ✓ done --group writes group on the row 71ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 141ms
     ✓ --commit=none writes the row and leaves it uncommitted 40ms
     ✓ build-group-start records parentSha and group 42ms
     ✓ carries extra fields, parsed as JSON when they are JSON 85ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 32ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 30ms
     ✓ refuses an empty artifact 30ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 29ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 31ms
     ✓ rejects ["--verdict=MAYBE"] 27ms
     ✓ rejects ["--strategy=YOLO"] 31ms
     ✓ rejects ["--failures=-1"] 28ms
     ✓ rejects ["--field=verdict=PASS"] 27ms
     ✓ rejects ["--status=SKIPPED"] 27ms
     ✓ needs a message unless --commit=none 31ms
     ✓ reports a failed commit with exit 8 without writing the row 208ms
     ✓ a failed commit leaves no row staged in the index 195ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 229ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 229ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 231ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 177ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 203ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 32ms
     ✓ a missing artifact exits 4 29ms
     ✓ empty artifact exits 0 26ms
     ✓ pending artifact exits 1 28ms
     ✓ no marker artifact exits 2 26ms
     ✓ disallowed artifact exits 3 26ms
     ✓ bad failures artifact exits 4 26ms
     ✓ a required field that is absent is invalid (re-prompt) 32ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 36ms
     ✓ only reads above the marker 27ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 70ms
     ✓ fails when no row was written for the step 28ms
     ✓ --ref reads the status file as committed on that ref, not from disk 81ms
     ✓ --ref exits 3 when the ref does not carry the status file 74ms
     ✓ fails on a placeholder left in the artifact 67ms
     ✓ fails when the row's verdict differs from the artifact's 65ms
     ✓ fails when the row does not list the artifact, or carries another attempt 69ms
     ✓ fails on a missing artifact 69ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 68ms
     ✓ refuses a negative or non-integer attempt (2) 27ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 32ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 31ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 28ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 31ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 32ms
     ✓ fails a diagnose row missing its strategy, passes with it 62ms
     ✓ fails a run-tests row missing its scope, and an empty scope 94ms
     ✓ names every missing field at once 31ms
     ✓ asks nothing of a step that writes none of them 31ms
     ✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 8ms
   ✓ the build challenge is one step (2)
     ✓ no removed challenge step in the attempt table 0ms
     ✓ no writer list names a removed agent 0ms
   ✓ placeholderLines (1)
     ✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 0ms
   ✓ bkit steps finish (15)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 92ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 27ms
     ✓ re-asks (exit 6) when a field the prompt declares is missing 28ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 28ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 32ms
     ✓ a true | false header field is true when any agent sets it true 36ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 36ms
     ✓ records the header's Strategy on the row 34ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 34ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 80ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 27ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 57ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 104ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 138ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 105ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 109ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 170ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 98ms
     ✓ --post needs --number; without --post there is no tracker key 54ms
   ✓ bkit steps stub (3)
     ✓ copies the prior version under a PENDING header 26ms
     ✓ --strip-header drops the prior version's own header 27ms
     ✓ exits 4 when the prior version is missing or empty 32ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 30ms
     ✓ checks the FID's shape for the wired tracker 36ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 77ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 30ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 129ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 94ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 77ms
       ✓ gate --issue without --fid is a usage error 29ms
       ✓ gate --issue="" under none keeps today's check 32ms
     ✓ --attempt-of checks the row carries the derived counter 76ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 180ms
     ✓ writeStepRow refuses when a recorded path changed 202ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 89ms
     ✓ writeStepRow appends its commit sha to the record 168ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 323ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (9)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 76ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 138ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 127ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 80ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 210ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 147ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 82ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 198ms
     ✓ exit codes list 11 as planned tests touched and 15 as source touched in the tests step 0ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 35ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 76ms
     ✓ does not count an artifact the run found committed when it started 98ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 61ms
     ✓ commits a package.json change outside bkit.workflows 102ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 175ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > test-round completion evidence > finishes validated CI evidence rounds without local clamp records
AssertionError: expected +0 not to be +0 // Object.is equality
 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:197:30
    195|     wrongAttempt.save();
    196|     const refused = await run(wrongAttempt.cwd, wrongAttempt.args);
    197|     expect(refused.code).not.toBe(0);
       |                              ^
    198|     expect(
    199|       fs.readFileSync(path.join(wrongAttempt.cwd, "logs/status.jsonl")…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > test-round completion evidence > preserves local clamp enforcement when completing test rounds
AssertionError: expected +0 not to be +0 // Object.is equality
 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:260:29
    258|       "--commit=none",
    259|     ]);
    260|     expect(result.code).not.toBe(0);
       |                             ^
    261|     expect(`${result.err} ${JSON.stringify(result.json)}`).toMatch(/cl…
    262|     expect(fs.readFileSync(path.join(cwd, "logs/status.jsonl"), "utf-8…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 109 passed (111)
   Start at  22:36:37
   Duration  8.40s (tests 99%, import 1%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-udCgM7/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/checks/status-holes.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/checks/status-holes.test.ts

```

## Runner output — `.bkit/core/engine/checks/status-holes.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/checks/status-holes.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named

 ❯ .bkit/core/engine/checks/status-holes.test.ts (66 tests | 1 failed) 456ms
   ✓ source derivation (6)
     ✓ derives the expected step universe for every workflow 53ms
     ✓ reports table drift without failing 0ms
     ✓ records every BKIT literal in a step as a required call 0ms
     ✓ derives a required call from each {BKIT} literal of every live step section 22ms
     ✓ parses a synthetic md with headings + literals 0ms
     ✓ flags a status write that lives outside any numbered step (orphanSteps) 0ms
   ✓ classifyRun (6)
     ✓ classifies a clean Path A run (no conflict-resolve) 0ms
     ✓ classifies a Path B run (conflict-resolve present) 0ms
     ✓ classifies a MERGED-on-entry run (Step 2 routed to Step 13 before its writes) 0ms
     ✓ does NOT read a double hole as MERGED_ON_ENTRY (regression) 0ms
     ✓ classifies an aborted run (workflow-failed, no close-workflow) 0ms
     ✓ classifies an in-progress run (no close-workflow, no workflow-failed) 0ms
   ✓ computeMandatoryForPath (5)
     ✓ Path A excludes conflict-resolve + retry-loop steps 0ms
     ✓ Path B includes conflict-resolve, excludes retry-loop steps 0ms
     ✓ MERGED-on-entry excludes the entire middle 0ms
     ✓ ABORTED returns empty mandatory set 0ms
     ✓ IN_PROGRESS returns empty mandatory set 0ms
   ✓ detectHoles (7)
     ✓ reports no holes for a clean Path A run 0ms
     ✓ reports ship-regression-guard as missing when skipped in a completed Path A run 0ms
     ✓ reports conflict-resolve as missing when skipped in a completed Path B run 0ms
     ✓ surfaces invented step names as unexpected (ship-resume-human-override) 0ms
     ✓ does NOT flag absence of failure-diagnose/remediate (retry-loop steps) 0ms
     ✓ aborted run: flags pre-abort holes but not post-abort absences 0ms
     ✓ in-progress run: no holes reported 0ms
   ✓ auditStatusJsonl (end-to-end) (10)
     ✓ Path A: no holes against real bkit-ship.md 4ms
     ✓ Path A with engine-action rows interleaved: same report 8ms
     ✓ Path B: no holes against real bkit-ship.md 4ms
     ✓ MERGED-on-entry: no holes against real bkit-ship.md 4ms
     ✓ retry-loop Path B: no holes (failure steps optional) 4ms
     ✓ holey fixture: ship-regression-guard missing surfaces in advisory report 4ms
     ✓ invented name (ship-resume-human-override) surfaces as unexpected 4ms
     ✓ aborted run with pre-abort hole detected 4ms
     ✓ empty status.jsonl → IN_PROGRESS, no holes, no crash 4ms
     ✓ unparseable lines skipped without crash 4ms
   ✓ formatAdvisoryReport (2)
     ✓ includes ADVISORY prefix + fail-open note 4ms
     ✓ includes path classification in output 4ms
   ✓ CLI main() — advisory exit 0 (4)
     ✓ exits 0 with advisory output on a known-holey fixture (no throw) 5ms
     ✓ finds bkit-ship.md from the built dist/ layout, not only from source 37ms
     ✓ main() with no args writes skip message and returns (exit 0) 0ms
     ✓ main() with missing file writes skip message and returns (exit 0) 0ms
   ✓ step conditionality (2)
     ✓ classifies a step conditional only under the column-0 marker rule 21ms
     ✓ does not report a conditional step as a step hole 0ms
   ✓ CLI sweep summary (2)
     ✓ prints a sweep summary line and exits 0 15ms
     ✓ checks each run of one workflow in a file on its own 25ms
   ❯ check — hole classes (17)
     × audits evidence-first debug rounds without requiring a local discovery run 4ms
     ✓ a tracker-none run that journals every rendered call is CLEAN 22ms
     ✓ names an evidence hole with its missing calls 0ms
     ✓ a run whose journal starts mid-run reports no evidence hole for steps finished before its first engine-call row 0ms
     ✓ a run whose journal saw only ambient calls reports no evidence hole for steps whose finish call was not journaled 0ms
     ✓ a visit whose row writer sits below workflows close is judged steps-only when the journal saw none of its calls 0ms
     ✓ reports a missing required step as a step hole 0ms
     ✓ reports unexercised calls without marking the run holey 0ms
     ✓ charges calls below a step's finish line to that step 52ms
     ✓ calls outside the journal window are matched but never required 0ms
     ✓ never requires the workflows start call, which a fresh run cannot journal 51ms
     ✓ reports an untaken route arm as unexercised 25ms
     ✓ credits a repeated route-arm call to the step that names it next 0ms
     ✓ never reports the rows build writes outside its numbered steps as unexpected 25ms
     ✓ gives each group-loop repeat its own gaps 0ms
     ✓ matches a call the Contract allows at any point 42ms
     ✓ matches workflow-level calls outside any step 0ms
   ✓ check — verdict metadata (5)
     ✓ gives a pre-journal run a steps-only verdict 0ms
     ✓ names a call no contract step owns 0ms
     ✓ excludes its own journaled call 0ms
     ✓ takes the last completeness row and recomputes when rows follow it 0ms
     ✓ reports a hole in a long-closed run with no baseline 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > check — hole classes > audits evidence-first debug rounds without requiring a local discovery run
AssertionError: expected 'CLEAN' to be 'HOLEY' // Object.is equality

Expected: "HOLEY"
Received: "CLEAN"

 ❯ .bkit/core/engine/checks/status-holes.test.ts:1032:7
    1030|         contract,
    1031|       ).verdict,
    1032|     ).toBe("HOLEY");
       |       ^
    1033|     const missingContext = rows.filter((value) => value.noun !== "cont…
    1034|     expect(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 65 passed (66)
   Start at  22:36:46
   Duration  588ms (tests 85%, import 8%, transform 5%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-U8RooE/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
