Enforced: true
Verdict: CONCERNS
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1042-ship-s-pr-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev twice for one FID publishes the second record through a PR" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev with ship-failed left on origin and no PR opens one PR on that branch" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev with a squash-merged ship-failed tip left on origin lands the new record" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that changes code" | red | not passed |
| 1 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "a second refused close for one FID reuses the open ship-close PR" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev with gh pr create failing names the pushed ship-failed branch" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev links the handover comment at the pushed commit when the PR did not merge" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev keeps the unmerged handover link readable after the branch is deleted" | red | passed |

## Gaps

- Task 1 `not-green` — "--flush refused by dev does not merge a leftover tip that changes code" failure: expected +0 to be 10 // Object.is equality — Fixable: true — log: TASK 1: `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev does not merge a leftover tip that changes code` — not-green — Fixable: true

## Runner output — `.bkit/core/engine/commands/workflow/workflows.test.ts`

```
     ✓ prints CONCERNS when a Fix now group's fix task and a test-fix FAIL are both resolved 16ms
     ✓ summary recommends /bkit-debug on FAIL 33ms
     ✓ summary reports the last attempt 19ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 22ms
     ✓ a design summary carries the organised design's open questions 16ms
     ✓ refuses a status file with no run of the workflow, and a missing one 2ms
   ✓ bkit workflows start — the run's progress link (3)
     ✓ start with --session-dir writes the session's link as progress on the workflow-started row 221ms
     ✓ a resumed start with another session keeps the run's first link 266ms
     ✓ start with a session folder that holds no progress id writes the row without progress and records association friction 209ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --flush refused by dev does not merge a leftover tip that changes code
AssertionError: expected +0 to be 10 // Object.is equality

- Expected
+ Received

- 10
+ 0

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:2845:20
    2843|     expect(r.code).toBe(10);
    2844|     expect(r.err).toContain(`ship-failed/${FID}`);
    2845|     expect(r.err).toContain("src/app.ts");
       |                    ^
    2846|     expect(git(remote, "rev-parse", `ship-failed/${FID}`)).toBe(tip);
    2847|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 224 passed (225)
   Start at  05:29:57
   Duration  142.59s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-6rAJyv/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
