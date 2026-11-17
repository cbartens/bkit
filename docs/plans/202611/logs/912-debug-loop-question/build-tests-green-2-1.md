Enforced: true
Verdict: CONCERNS
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/912-debug-loop-question-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/ledgers/status.test.ts` "CI evidence selection contract > validates failedJobCount as a positive whole number outside the identity" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/runs.test.ts` "saves the failed job count without the capstone job" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/runs.test.ts` "counts the capstone job when it is the only failed job" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/runs.test.ts` "saves no failed job count when no job failed" | passed-accepted | passed |
| 4 | `.bkit/core/engine/commands/workflow/runs.test.ts` "counts fallback evidence jobs without the capstone job" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests.test.ts` "CI evidence test rounds > records the selected run's failed job count" | red | passed |
| 5 | `.bkit/core/engine/ledgers/telemetry.test.ts` "test-run status row validation > accepts a counted CI evidence round and refuses 0" | red | passed |
| 5 | `.bkit/core/engine/checks/status-holes.test.ts` "check — hole classes > a counted CI round with its step-done row raises no CI evidence hole" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/steps.test.ts` "finishes a CI round only with its own failed job count" | red | passed |
| 6 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown" | red | not passed |

## Gaps

- Task 6 `not-green` — "Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown" failure: expected { code: +0, json: { …(13) }, …(1) } to match object { code: +0, json: { …(2) } }
(36 matching properties omitted from actual) — Fixable: true — log: TASK 6: `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown` — not-green — Fixable: true

## Already landed

- Task 4 `.bkit/core/engine/commands/workflow/runs.test.ts` "saves no failed job count when no job failed" — passed at the group's red, and the tests step accepted it: current locateCi saves no failedJobCount field at all, so absence already holds; no red is due

## Runner output — `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`

```
     ✓ reloads saved fixes and recollects explicitly replaced evidence generations 3307ms
     ✓ preserves local and repro overrides across actual workflow command sequences 4911ms
     ✓ blocks missing logs and wrong-branch evidence before source edits 1823ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts > Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown
AssertionError: expected { code: +0, json: { …(13) }, …(1) } to match object { code: +0, json: { …(2) } }
(36 matching properties omitted from actual)

- Expected
+ Received

  {
    "code": 0,
    "json": {
-     "failures": null,
+     "failures": 0,
      "source": "local",
    },
  }

 ❯ .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts:391:19
    389|     f.save();
    390|     const local = f.round();
    391|     expect(local).toMatchObject({ code: 0, json: { source: "local", fa…
       |                   ^
    392|     expect(f.finishRound().code).toBe(0);
    393|     f.vars.LOOP_FIX = "debug-failure-remediate";

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 7 passed (8)
   Start at  23:38:45
   Duration  21.98s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-oquvhU/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
