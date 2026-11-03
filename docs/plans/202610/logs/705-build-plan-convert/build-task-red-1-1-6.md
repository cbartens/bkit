
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/step-table.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert

 ❯ .bkit/core/engine/commands/workflow/step-table.test.ts (30 tests | 11 failed) 414ms
   ❯ bkit status resume (30)
     × a build stopped after build-challenge resumes at the challenge merge (Step 11) 10ms
     × a build that stopped after Plan Convert resumes at Plan Convert (Step 4) 5ms
     × a build that stopped after Plan Current resumes at Install Skills (Step 6) 6ms
     × a build that stopped after Plan Verify resumes at Plan Verify (Step 8) 5ms
     ✓ the challenge round comes from status.jsonl, not the plan files 32ms
     × a build-decision row's route places the resume point 5ms
     × a retry decision after build-plan-verify resumes at that loop's fix step 5ms
     × a retry decision after build-group-gate resumes at that loop's fix step 4ms
     × a retry decision after build-run-tests resumes at that loop's fix step 5ms
     ✓ a ship failure-remediate PASS row resumes at { step: 'ship-failure-remediate', …(2) } 5ms
     ✓ a ship failure-remediate FAIL row resumes at { step: 'ship-merge-pr', …(2) } 4ms
     ✓ a retry decision with no loop row before it places no resume point 4ms
     ✓ challengeDone is true once a round-2 challenge has merged 23ms
     × old reconcile, remediate or tests rows resume at Run Tests (Step 12) 6ms
     ✓ ignores plan rows for steps the plan workflow no longer has 5ms
     ✓ a plan run stopped after the old complexity steps resumes at Summary, Step 7 5ms
     × ignores rows that are not steps of the table (a red-test row, the decision) 5ms
     × a HANDOVER execute resumes at Plan Execute with the same group; PASS goes on to verify 5ms
     ✓ plan: a completed step resumes at the next one 27ms
     ✓ plan: no rows resumes at Step 1; setup rows alone at Step 3 14ms
     ✓ design: a completed step resumes at the next one 48ms
     ✓ design: no rows resumes at Step 1; setup rows alone at Step 3 15ms
     ✓ build: a completed step resumes at the next one 46ms
     ✓ build: no rows resumes at Step 1; setup rows alone at Step 3 14ms
     ✓ debug: a completed step resumes at the next one 31ms
     ✓ debug: no rows resumes at Step 1; setup rows alone at Step 3 14ms
     ✓ ship: a completed step resumes at the next one 35ms
     ✓ ship: no rows resumes at Step 1; setup rows alone at Step 3 14ms
     ✓ a finished run, or another workflow's run, resumes at Step 1 9ms
     ✓ refuses an unknown workflow, and a malformed log (exit 3) 5ms

⎯⎯⎯⎯⎯⎯ Failed Tests 11 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/step-table.test.ts > bkit status resume > a build stopped after build-challenge resumes at the challenge merge (Step 11)
AssertionError: expected { step: 'build-challenge', …(7) } to match object { step: 'build-challenge', …(4) }
(3 matching properties omitted from actual)

- Expected
+ Received

  {
    "active": true,
    "after": "build-challenge",
-   "number": 11,
+   "number": 10,
    "step": "build-challenge",
    "title": "Build Challenge",
  }

 ❯ .bkit/core/engine/commands/workflow/step-table.test.ts:69:20
     67|     const r = await resume("build", file);
     68|     expect(r.code).toBe(0);
     69|     expect(r.json).toMatchObject({
       |                    ^
     70|       step: "build-challenge",
     71|       number: 11,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/step-table.test.ts > bkit status resume > a build that stopped after Plan Convert resumes at Plan Convert (Step 4)
AssertionError: expected { step: 'build-branch-sync', …(7) } to match object { step: 'build-plan-convert', …(3) }
(4 matching properties omitted from actual)

- Expected
+ Received

  {
    "after": "build-plan-convert",
-   "number": 4,
-   "step": "build-plan-convert",
-   "title": "Plan Convert",
+   "number": 3,
+   "step": "build-branch-sync",
+   "title": "Branch Sync",
  }

 ❯ .bkit/core/engine/commands/workflow/step-table.test.ts:80:48
     78|   it("a build that stopped after Plan Convert resumes at Plan Convert …
     79|     const file = log([...setUp("build"), done("build", "build-plan-con…
     80|     expect((await resume("build", file)).json).toMatchObject({
       |                                                ^
     81|       step: "build-plan-convert",
     82|       number: 4,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/step-table.test.ts > bkit status resume > a build that stopped after Plan Current resumes at Install Skills (Step 6)
AssertionError: expected { step: 'build-install-skills', …(7) } to match object { step: 'build-install-skills', …(2) }
(5 matching properties omitted from actual)

- Expected
+ Received

  {
-   "number": 6,
+   "number": 5,
    "step": "build-install-skills",
    "title": "Install Skills",
  }

 ❯ .bkit/core/engine/commands/workflow/step-table.test.ts:90:48
     88|   it("a build that stopped after Plan Current resumes at Install Skill…
     89|     const file = log([...setUp("build"), done("build", "build-plan-cur…
     90|     expect((await resume("build", file)).json).toMatchObject({
       |                                                ^
     91|       step: "build-install-skills",
     92|       number: 6,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/step-table.test.ts > bkit status resume > a build that stopped after Plan Verify resumes at Plan Verify (Step 8)
AssertionError: expected { step: 'build-plan-verify', …(7) } to match object { step: 'build-plan-verify', …(3) }
(4 matching properties omitted from actual)

- Expected
+ Received

  {
    "group": 1,
-   "number": 8,
+   "number": 7,
    "step": "build-plan-verify",
    "title": "Plan Verify",
  }

 ❯ .bkit/core/engine/commands/workflow/step-table.test.ts:99:48
     97|   it("a build that stopped after Plan Verify resumes at Plan Verify (S…
     98|     const file = log([...setUp("build"), done("build", "build-plan-ver…
     99|     expect((await resume("build", file)).json).toMatchObject({
       |                                                ^
    100|       step: "build-plan-verify",
    101|       number: 8,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/step-table.test.ts > bkit status resume > a build-decision row's route places the resume point
AssertionError: expected { step: 'build-plan-execute', …(7) } to match object { step: 'build-plan-execute', …(3) }
(4 matching properties omitted from actual)

- Expected
+ Received

  {
    "after": "build-decision",
    "challengeRound": 2,
-   "number": 7,
+   "number": 6,
    "step": "build-plan-execute",
  }

 ❯ .bkit/core/engine/commands/workflow/step-table.test.ts:137:32
    135|       (await resume("build", log([...challenged, done("build", "build-…
    136|         .json;
    137|     expect(await after("fix")).toMatchObject({
       |                                ^
    138|       step: "build-plan-execute",
    139|       number: 7,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/step-table.test.ts > bkit status resume > a retry decision after build-plan-verify resumes at that loop's fix step
 FAIL  .bkit/core/engine/commands/workflow/step-table.test.ts > bkit status resume > a retry decision after build-group-gate resumes at that loop's fix step
AssertionError: expected { …(8) } to match object { …(4) }
(4 matching properties omitted from actual)

- Expected
+ Received

  {
    "after": "build-decision",
    "group": 2,
-   "number": 9,
+   "number": 8,
    "step": "build-plan-gaps-remediate",
  }

 ❯ .bkit/core/engine/commands/workflow/step-table.test.ts:174:48
    172|       done("build", "build-decision", { route: "retry" }),
    173|     ]);
    174|     expect((await resume("build", file)).json).toMatchObject({
       |                                                ^
    175|       ...expected,
    176|       after: "build-decision",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/step-table.test.ts > bkit status resume > a retry decision after build-run-tests resumes at that loop's fix step
AssertionError: expected { Object (step, number, ...) } to match object { Object (step, number, ...) }
(5 matching properties omitted from actual)

- Expected
+ Received

  {
    "after": "build-decision",
-   "number": 13,
+   "number": 12,
    "step": "build-failure-diagnose",
  }

 ❯ .bkit/core/engine/commands/workflow/step-table.test.ts:174:48
    172|       done("build", "build-decision", { route: "retry" }),
    173|     ]);
    174|     expect((await resume("build", file)).json).toMatchObject({
       |                                                ^
    175|       ...expected,
    176|       after: "build-decision",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/step-table.test.ts > bkit status resume > old reconcile, remediate or tests rows resume at Run Tests (Step 12)
AssertionError: build-challenge-reconcile: expected { step: 'build-run-tests', …(7) } to match object { step: 'build-run-tests', …(3) }
(4 matching properties omitted from actual)

- Expected
+ Received

  {
    "after": "build-challenge-reconcile",
-   "number": 12,
+   "number": 11,
    "step": "build-run-tests",
    "title": "Run Tests",
  }

 ❯ .bkit/core/engine/commands/workflow/step-table.test.ts:223:55
    221|     for (const old of ["reconcile", "remediate", "tests"].map((s) => `…
    222|       const file = log([...setUp("build"), done("build", "build-challe…
    223|       expect((await resume("build", file)).json, old).toMatchObject({
       |                                                       ^
    224|         step: "build-run-tests",
    225|         number: 12,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/step-table.test.ts > bkit status resume > ignores rows that are not steps of the table (a red-test row, the decision)
AssertionError: expected { step: 'build-plan-verify', …(7) } to match object { number: 8, …(2) }
(5 matching properties omitted from actual)

- Expected
+ Received

  {
    "after": "build-plan-execute",
    "group": 2,
-   "number": 8,
+   "number": 7,
  }

 ❯ .bkit/core/engine/commands/workflow/step-table.test.ts:267:48
    265|       done("build", "build-decision"),
    266|     ]);
    267|     expect((await resume("build", file)).json).toMatchObject({
       |                                                ^
    268|       number: 8,
    269|       after: "build-plan-execute",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/step-table.test.ts > bkit status resume > a HANDOVER execute resumes at Plan Execute with the same group; PASS goes on to verify
AssertionError: expected { step: 'build-plan-execute', …(7) } to match object { step: 'build-plan-execute', …(3) }
(4 matching properties omitted from actual)

- Expected
+ Received

  {
    "after": "build-plan-execute",
    "group": 2,
-   "number": 7,
+   "number": 6,
    "step": "build-plan-execute",
  }

 ❯ .bkit/core/engine/commands/workflow/step-table.test.ts:279:48
    277|       done("build", "build-plan-execute", { group: 2, verdict: "HANDOV…
    278|     ]);
    279|     expect((await resume("build", file)).json).toMatchObject({
       |                                                ^
    280|       step: "build-plan-execute",
    281|       number: 7,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/11]⎯


 Test Files  1 failed (1)
      Tests  11 failed | 19 passed (30)
   Start at  23:23:23
   Duration  866ms (tests 51%, transform 42%, import 7%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-CoEN49/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
