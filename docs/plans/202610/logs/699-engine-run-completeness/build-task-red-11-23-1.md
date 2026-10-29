
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> bash scripts/ci/test-file.sh .bkit/core/engine/commands/workflow/completeness.test.ts

[test-timeout-budget] load average 11.5 on 10 cores: unit limits 5770ms per test, 11539ms per hook (x1.15)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/commands/workflow/completeness.test.ts (4 tests | 1 failed) 57ms
   ❯ bkit completeness check (4)
     ✓ always exits 0 on a holey run 21ms
     ✓ infers each run's workflow when --workflow is absent 13ms
     ✓ exits 0 with no verdict when the file or the workflow markdown is unreadable 7ms
     × a file holding two runs of one workflow is checked per run 16ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/completeness.test.ts > bkit completeness check > a file holding two runs of one workflow is checked per run
AssertionError: expected [ { workflow: 'build', …(12) } ] to have a length of 2 but got 1

- Expected
+ Received

- 2
+ 1

 ❯ .bkit/core/engine/commands/workflow/completeness.test.ts:116:29
    114|     fs.writeFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n…
    115|     const r = await run(["completeness", "check", `--file=${file}`, "-…
    116|     expect(r.json.verdicts).toHaveLength(2);
       |                             ^
    117|     expect(r.json.verdicts[0].preJournal).toBe(true);
    118|     expect(r.json.verdicts[0].evidenceHoles).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 3 passed (4)
   Start at  18:30:36
   Duration  297ms (transform 60%, tests 24%, import 8%, setup 8%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-b0x5Wq/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
