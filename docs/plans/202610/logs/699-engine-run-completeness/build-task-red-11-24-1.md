
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> bash scripts/ci/test-file.sh .bkit/core/engine/commands/workflow/completeness.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/commands/workflow/completeness.test.ts (5 tests | 1 failed) 61ms
   ❯ bkit completeness check (5)
     ✓ always exits 0 on a holey run 21ms
     ✓ infers each run's workflow when --workflow is absent 14ms
     ✓ exits 0 with no verdict when the file or the workflow markdown is unreadable 8ms
     ✓ a file holding two runs of one workflow is checked per run 15ms
     × the verdicts output is described as one verdict per checked run 2ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/completeness.test.ts > bkit completeness check > the verdicts output is described as one verdict per checked run
AssertionError: expected 'one completeness verdict per checked …' to contain 'per checked run'

Expected: "per checked run"
Received: "one completeness verdict per checked workflow; empty when nothing could be read"

 ❯ .bkit/core/engine/commands/workflow/completeness.test.ts:127:18
    125|   it("the verdicts output is described as one verdict per checked run"…
    126|     const desc = completenessCommand.verbs.check.output?.verdicts;
    127|     expect(desc).toContain("per checked run");
       |                  ^
    128|     expect(desc).not.toContain("per checked workflow");
    129|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 4 passed (5)
   Start at  20:31:20
   Duration  299ms (transform 57%, tests 25%, setup 8%, import 8%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-KesswE/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
