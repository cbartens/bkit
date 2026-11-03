
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/tests.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts (108 tests | 6 failed) 8179ms
   ✓ resolveGate (6)
     ✓ picks the deepest declared candidate, not the first declared in package.json 11ms
     ✓ falls back to a shallower candidate when the deeper one is undeclared 19ms
     ✓ an empty script is not declared: it would run nothing and exit 0 (fix) 20ms
     ✓ no package.json, no scripts, or unparseable -> null 40ms
     ✓ debug's live-first chain stops at the deepest declared tier 19ms
     ✓ with no e2e gate, debug runs the integration gate build runs 20ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 163ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 121ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 122ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 122ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 24ms
     ✓ no candidate declared: exit 3, nothing run, and the hint names bkit:gate:* — not an install flag (fix) 25ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 37ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 137ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 129ms
     ✓ --gate and --log are required 12ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 131ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 123ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 122ms
     ✓ PASS is 0 failures with or without reports 135ms
     ✓ clears a previous attempt's reports before the gate runs 121ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 124ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 151ms
     ✓ a log under the outbox is named main-checkout relative in the record 152ms
     ✓ a log small enough is copied whole: not clamped, raw null 132ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 119ms
     ✓ --artifact needs --fid and --step 13ms
   ✓ parseJunit (3)
     ✓ reads names, outcomes and failure messages, decoding entities 11ms
     ✓ survives a raw > inside an attribute and a closing tag inside CDATA 16ms
     ✓ no testcase elements -> empty 10ms
   ✓ judgeRed / judgeGreen — the named test, never the exit code alone (9)
     ✓ a red is the named test failing on a non-zero exit 10ms
     ✓ not a red: no report (misspelled path) 10ms
     ✓ not a red: load error named after the file 10ms
     ✓ not a red: zero tests 9ms
     ✓ not a red: the named test passed (code written first) 10ms
     ✓ not a red: the named test skipped (filter matched nothing) 9ms
     ✓ not a red: report and exit code disagree 9ms
     ✓ a name only matches whole trailing segments 9ms
     ✓ green needs every case of the named test to pass 9ms
   ✓ readTestFirst (5)
     ✓ reads test, n/a, missing and malformed entries per task 11ms
     ✓ reads several tests per task, one per sub-bullet; a name may hold a `;` 9ms
     ✓ reads a task's TEST EXCEPTION field apart from its TEST FIRST tests, with its plan lines 10ms
     ✓ narrows to one group's tasks 10ms
     ✓ reads no task from old-format task lines 10ms
   ✓ taskSizes (1)
     ✓ counts tests and distinct test files per task; n/a, missing and malformed count 0 10ms
   ✓ checkPlanText (4)
     ✓ sizes each group and task, and lists each problem with its line 11ms
     ✓ refuses a task that depends on itself 10ms
     ✓ an unclosed code fence is reported as such, not as missing task markers 10ms
     ✓ reads a CRLF plan's Reuse Inventory 10ms
   ✓ shipped task examples (9)
     ✓ the shipped plan template's example parses 10ms
     ✓ the change-shape example in trackers.md parses 11ms
     ✓ change issue form example passes plan-check 15ms
     ✓ trackers.md change example shows every task field 11ms
     ✓ the shipped change form shows every plan cap with its settings default 11ms
     ✓ this repo's change form shows every plan cap with its settings default 10ms
     ✓ trackers.md shows each plan cap it names with its settings default 10ms
     ✓ README.md shows each plan cap it names with its settings default 11ms
     ✓ this repo's change form shows the caps this repo's package.json sets 10ms
   ✓ bkit tests plan-check (19)
     ✓ states the caps the template and workflows doc name 10ms
     ✓ every prompt that sizes a task or group takes the caps from its Context 13ms
     ✓ plan-check refuses a task without DONE WHEN 20ms
     ✓ plan-check refuses DEPENDS ON a later group 28ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 28ms
     ✓ plan-check matches a Markdown heading symbol 28ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 19ms
     ✓ plan-check walks a dotted key through indented JSON, YAML and TOML 19ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 19ms
     ✓ plan-check skips existence on ticked tasks 19ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 28ms
     ✓ plan-check refuses a group with 4 tasks 18ms
     ✓ plan-check refuses a group with 16 planned tests 18ms
     ✓ plan-check accepts 3 tasks and 15 tests in one group 19ms
     ✓ plan-check report lists groups, not a verdict 19ms
     ✓ plan-check refuses a task over the per-task caps, naming the task and the cap 19ms
     ✓ plan-check follows bkit.workflows.tasks 29ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 28ms
     ✓ a missing plan file is a usage error 11ms
   ✓ onlyAddsLines (2)
     ✓ passes added lines and whitespace-only changes 10ms
     ✓ fails an edited or a removed line 10ms
   ❯ bkit tests red / green (29)
     ✓ records a red: the named test failed; row, log and test snapshot written, path passed whole 198ms
     ✓ refuses a run that is not a red: exit 1, reason printed, no row 151ms
     ✓ a red already recorded for the unchanged test stands on resume; a changed test runs again 187ms
     ✓ refuses a missing report, an undeclared script (exit 3), a path outside the repo (exit 2) 164ms
     ✓ a script that cannot run is exit 4, not a rejected red 161ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 48ms
     ✓ green refuses a plan with no task markers 52ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 171ms
     ✓ green: --group audits only that group's tasks 160ms
     ✓ green: --group naming a group with no tasks is refused 42ms
     ✓ green: a code fence never closed is the reason, not missing task markers 35ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 183ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 189ms
     × green with no gaps prints verdict PASS and an empty gaps 168ms
     × green prints a verdict and a fixable per gap 187ms
     × green verdict is FAIL when a gap is unfixable 149ms
     × green leaves a diff-reading kind fixable null 163ms
     × green prints verdict null when a gap needs a diff read 174ms
     ✓ green: lists each gap kind, with the diff for a test changed since its red 501ms
     ✓ green: a red recorded for a different test than the plan names is a red-mismatch 169ms
     ✓ green: a planned test that moved is a red-mismatch saying whether the recorded test passes now 166ms
     ✓ green: every test a task names needs its own red and its own pass 181ms
     ❯ test order (7)
       ✓ green finds the code commit for DONE — TASK N 327ms
       ✓ a red recorded before the task's code commit stands, across a resumed execute 317ms
       ✓ a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked 239ms
       × green emits a test-changed gap for a red whose test gained added lines only 174ms
       ✓ green reads a TEST EXCEPTION field inside the block: it clears test-order gaps only from a human-made commit, never not-green 260ms
       ✓ green refuses an exception-only task from a workflow step commit 100ms
       ✓ green clears an exception-only task from a human commit 83ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests red / green > green with no gaps prints verdict PASS and an empty gaps
AssertionError: expected { enforced: true, …(5) } to match object { enforced: true, gaps: [], …(1) }
(4 matching properties omitted from actual)

- Expected
+ Received

  {
    "enforced": true,
    "gaps": [],
-   "verdict": "PASS",
  }

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1566:20
    1564|     const r = await green();
    1565|     expect(r.code).toBe(0);
    1566|     expect(r.json).toMatchObject({ enforced: true, gaps: [], verdict: …
       |                    ^
    1567|     expect(report()).toContain("Gaps: 0");
    1568|     expect(report()).toContain("Verdict: PASS");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests red / green > green prints a verdict and a fixable per gap
AssertionError: expected undefined to be null // Object.is equality

- Expected:
null

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1598:28
    1596|     const r = await green();
    1597|     expect(r.code).toBe(1);
    1598|     expect(r.json.verdict).toBe(null);
       |                            ^
    1599|     expect(
    1600|       (r.json.gaps as Array<{ kind: string; fixable: boolean | null }>…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests red / green > green verdict is FAIL when a gap is unfixable
AssertionError: expected undefined to be 'FAIL' // Object.is equality

- Expected:
"FAIL"

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1623:28
    1621|     const r = await green();
    1622|     expect(r.code).toBe(1);
    1623|     expect(r.json.verdict).toBe("FAIL");
       |                            ^
    1624|     expect((r.json.gaps as Array<{ kind: string; fixable: boolean }>)[…
    1625|       kind: "no-red",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests red / green > green leaves a diff-reading kind fixable null
AssertionError: expected undefined to be null // Object.is equality

- Expected:
null

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1640:30
    1638|     const gaps = r.json.gaps as Array<{ kind: string; fixable: boolean…
    1639|     expect(gaps.map((g) => g.kind)).toEqual(["red-mismatch"]);
    1640|     expect(gaps[0]!.fixable).toBe(null);
       |                              ^
    1641|     expect(r.json.verdict).toBe(null);
    1642|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests red / green > green prints verdict null when a gap needs a diff read
AssertionError: expected undefined to be null // Object.is equality

- Expected:
null

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1654:28
    1652|     expect(r.code).toBe(1);
    1653|     expect((r.json.gaps as Array<{ kind: string }>).map((g) => g.kind)…
    1654|     expect(r.json.verdict).toBe(null);
       |                            ^
    1655|     expect(report()).toContain("Verdict: null");
    1656|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests red / green > test order > green emits a test-changed gap for a red whose test gained added lines only
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1864:22
    1862|       vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
    1863|       const r = await green();
    1864|       expect(r.code).toBe(1);
       |                      ^
    1865|       expect(r.json.gaps).toEqual([
    1866|         expect.objectContaining({ task: 1, kind: "test-changed", fixab…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/6]⎯


 Test Files  1 failed (1)
      Tests  6 failed | 102 passed (108)
   Start at  21:08:44
   Duration  8.50s (tests 97%, transform 3%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-nT4p0l/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
