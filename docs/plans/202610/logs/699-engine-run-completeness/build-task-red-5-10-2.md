
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/completeness.test.ts

[test-timeout-budget] load average 23.5 on 10 cores: unit limits 11726ms per test, 23452ms per hook (x2.35)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/commands/workflow/completeness.test.ts (3 tests | 3 failed) 13ms
   ❯ bkit completeness check (3)
     × always exits 0 on a holey run 8ms
     × infers each run's workflow when --workflow is absent 2ms
     × exits 0 with no verdict when the file or the workflow markdown is unreadable 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/completeness.test.ts > bkit completeness check > always exits 0 on a holey run
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/commands/workflow/completeness.test.ts:58:20
     56|   it("always exits 0 on a holey run", async () => {
     57|     const r = await run(["completeness", "check", `--file=${holeyFile(…
     58|     expect(r.code).toBe(0);
       |                    ^
     59|     expect(r.json.verdicts[0]).toMatchObject({ workflow: "build", verd…
     60|     expect(r.json.verdicts[0].stepHoles.length).toBeGreaterThan(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/completeness.test.ts > bkit completeness check > infers each run's workflow when --workflow is absent
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/commands/workflow/completeness.test.ts:65:20
     63|   it("infers each run's workflow when --workflow is absent", async () …
     64|     const r = await run(["completeness", "check", `--file=${holeyFile(…
     65|     expect(r.code).toBe(0);
       |                    ^
     66|     expect(r.json.verdicts.map((v: { workflow: string }) => v.workflow…
     67|     expect(r.json.report).toContain("debug");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/completeness.test.ts > bkit completeness check > exits 0 with no verdict when the file or the workflow markdown is unreadable
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/commands/workflow/completeness.test.ts:77:26
     75|       "--workflow=build",
     76|     ]);
     77|     expect(missing.code).toBe(0);
       |                          ^
     78|     expect(missing.json.verdicts).toEqual([]);
     79|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed (3)
   Start at  12:45:00
   Duration  453ms (transform 68%, setup 16%, import 10%, tests 4%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-As1FxB/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
