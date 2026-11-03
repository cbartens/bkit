
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/status.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows

 ❯ .bkit/core/engine/commands/workflow/status.test.ts (62 tests | 7 failed) 260ms
   ✓ bkit status path (2)
     ✓ returns the main checkout's path outside a worktree, and whether it exists 29ms
     ✓ rejects a month that is not YYYYMM 0ms
   ✓ the status fold (3)
     ✓ skips a row it does not model (no type, an unknown type) and folds the rest 2ms
     ✓ refuses a line that is not JSON rather than folding around it (exit 3) 1ms
     ✓ a command reading the log reports the malformed line with exit 3 1ms
   ✓ bkit status route (19)
     ✓ reads the last verdict and failures of a step in the active run, per group 1ms
     ✓ prints the parentSha of the step's last row in the active run, per group 1ms
     ✓ counts absent failures as 0 when a verdict is present 1ms
     ✓ reads an absent failures count on FAIL as null: the count is unknown, not 0 1ms
     ✓ does not leak a completed run's verdict into a fresh run 1ms
     ✓ reads strategy across ALL runs and gives the next rung 1ms
     ✓ starts the ladder at STANDARD when no strategy is recorded 0ms
     ✓ prefers the run-level debugMode over an older step value, and reads pushMode and debugAttempt 0ms
     ✓ fails a --require'd mode that is missing or invalid 0ms
     ✓ is a usage error to require a step field without --step 0ms
     ✓ exits 3 when status.jsonl is missing 0ms
     ✓ falls back to the last step carrying debugMode / pushMode when no workflow-meta sets it 1ms
     ✓ reports an invalid mode as null, never as a mode 0ms
     ✓ climbs the ladder: PIVOT -> FINAL 0ms
     ✓ climbs the ladder: FINAL -> FINAL 0ms
     ✓ fails a --require'd strategy outside the ladder 0ms
     ✓ fails a --require'd verdict when the last DONE row carries none 1ms
     ✓ reads strategy per group, from the step's last DONE row, within its own workflow 1ms
     ✓ a non-numeric debugAttempt reads as 0 1ms
   ✓ bkit status route --prompt-file (debug Step 1) (12)
     ✓ a fresh run: attempt 1, NORMAL, no repro, every gate 11ms
     ✓ a resumed run keeps its attempt number 11ms
     ✓ fix rounds used up across runs (debug.fix.maxAttempts) enter SOAK 13ms
     ✓ the fix limit comes from bkit.workflows.debug.fix.maxAttempts 20ms
     ✓ [soak] and [repro] in the prompt 13ms
     ✓ a resumed run that soaked continues in SOAK 12ms
     ✓ soak rows of a finished run do not force SOAK on the next run 10ms
     ✓ an escalation recorded only in workflow-meta survives a resume 13ms
     ✓ [live=off] in the prompt drops the live gate; the issue body is not read 21ms
     ✓ finds status.jsonl from --fid and --month 60ms
     ✓ refuses --prompt-file for another workflow, and a missing --file without --fid 1ms
     ✓ a missing prompt file is a usage error 1ms
   ❯ bkit status route --workflow=build publish (7)
     × lets the publish token override publish.local 6ms
     × reads publish.local on LOCAL without a token 2ms
     × coerces publish false to true on a non-LOCAL runtime 3ms
     × accepts --prompt-file with --workflow=build 1ms
     × ignores publish=maybe and falls through to config 1ms
     × refuses publish without a runtime-resolved row 1ms
     × prints publishSource for token, local, remote and coerced 2ms
   ✓ bkit status route --expect (4)
     ✓ passes when every field holds the expected value 1ms
     ✓ exits 4 naming a field that holds another value 1ms
     ✓ an expected field is also required: missing exits 4 0ms
     ✓ checks a step field with --step, and refuses an unknown field 1ms
   ✓ bkit status meta (9)
     ✓ appends a workflow-meta row the route read then sees 1ms
     ✓ records openedPr, and refuses the removed --soak-entry and --decision 1ms
     ✓ --debug-attempt=run records the active run's number 1ms
     ✓ meta refuses --plan-source 1ms
     ✓ rejects ["--debug-mode=TURBO"] 1ms
     ✓ rejects ["--push-mode=REMOTE"] 0ms
     ✓ rejects ["--debug-attempt=0"] 0ms
     ✓ rejects [] 0ms
     ✓ never starts a log 0ms
   ✓ bkit status row (6)
     ✓ appends a typed row with fields parsed as JSON where they are JSON 1ms
     ✓ refuses ["--type=step-done"] 0ms
     ✓ refuses ["--type=Ship_Gate"] 1ms
     ✓ refuses ["--type=x","--field=at=now"] 0ms
     ✓ refuses ["--type=x","--field=Bad=1"] 0ms
     ✓ never starts a log (exit 3) 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 7 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/status.test.ts > bkit status route --workflow=build publish > lets the publish token override publish.local
AssertionError: expected undefined to match object { publish: true, …(1) }

- Expected:
{
  "publish": true,
  "publishSource": "token",
}

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/status.test.ts:559:20
    557|   it("lets the publish token override publish.local", async () => {
    558|     const r = await route(setup(rows("LOCAL"), "/bkit-build 7 publish=…
    559|     expect(r.json).toMatchObject({ publish: true, publishSource: "toke…
       |                    ^
    560|     const h = await route(setup(rows("LOCAL"), "/bkit-build 7 publish=…
    561|     expect(h.json).toMatchObject({ publish: false, publishSource: "tok…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/status.test.ts > bkit status route --workflow=build publish > reads publish.local on LOCAL without a token
AssertionError: expected undefined to match object { publish: false, …(1) }

- Expected:
{
  "publish": false,
  "publishSource": "local",
}

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/status.test.ts:566:20
    564|   it("reads publish.local on LOCAL without a token", async () => {
    565|     const r = await route(setup(rows("LOCAL"), "/bkit-build 7", { loca…
    566|     expect(r.json).toMatchObject({ publish: false, publishSource: "loc…
       |                    ^
    567|   });
    568|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/status.test.ts > bkit status route --workflow=build publish > coerces publish false to true on a non-LOCAL runtime
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/status.test.ts:571:20
    569|   it("coerces publish false to true on a non-LOCAL runtime", async () …
    570|     const r = await route(setup(rows("CLOUD_CLAUDE"), "/bkit-build 7 p…
    571|     expect(r.code).toBe(0);
       |                    ^
    572|     expect(r.json).toMatchObject({ publish: true, publishSource: "coer…
    573|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/status.test.ts > bkit status route --workflow=build publish > accepts --prompt-file with --workflow=build
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/status.test.ts:577:20
    575|   it("accepts --prompt-file with --workflow=build", async () => {
    576|     const r = await route(setup(rows("LOCAL"), "/bkit-build 7"));
    577|     expect(r.code).toBe(0);
       |                    ^
    578|     expect(r.json.debugMode).toBeNull();
    579|     expect(r.json.gates).toBeUndefined();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/status.test.ts > bkit status route --workflow=build publish > ignores publish=maybe and falls through to config
AssertionError: expected undefined to match object { publish: false, …(1) }

- Expected:
{
  "publish": false,
  "publishSource": "local",
}

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/status.test.ts:584:20
    582|   it("ignores publish=maybe and falls through to config", async () => {
    583|     const r = await route(setup(rows("LOCAL"), "/bkit-build 7 publish=…
    584|     expect(r.json).toMatchObject({ publish: false, publishSource: "loc…
       |                    ^
    585|   });
    586|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/status.test.ts > bkit status route --workflow=build publish > refuses publish without a runtime-resolved row
AssertionError: expected 2 to be 4 // Object.is equality

- Expected
+ Received

- 4
+ 2

 ❯ .bkit/core/engine/commands/workflow/status.test.ts:589:20
    587|   it("refuses publish without a runtime-resolved row", async () => {
    588|     const r = await route(setup([started("build", "2026-10-01T00:00:00…
    589|     expect(r.code).toBe(4);
       |                    ^
    590|     expect(r.err).toContain("Step 2");
    591|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/status.test.ts > bkit status route --workflow=build publish > prints publishSource for token, local, remote and coerced
TypeError: Cannot read properties of undefined (reading 'publishSource')
 ❯ .bkit/core/engine/commands/workflow/status.test.ts:595:65
    593|   it("prints publishSource for token, local, remote and coerced", asyn…
    594|     const sources = [
    595|       (await route(setup(rows("LOCAL"), "publish=false"))).json.publis…
       |                                                                 ^
    596|       (await route(setup(rows("LOCAL"), "x"))).json.publishSource,
    597|       (await route(setup(rows("GITHUB_ACTION"), "x"))).json.publishSou…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/7]⎯


 Test Files  1 failed (1)
      Tests  7 failed | 55 passed (62)
   Start at  07:04:26
   Duration  1.11s (transform 61%, tests 26%, import 10%, setup 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-l6TpfN/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
