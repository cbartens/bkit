Enforced: true
Verdict: CONCERNS
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 7 | `.bkit/core/engine/commands/workflow/runs.test.ts` "derives handoff decisions from persisted poll observations and target identity" | red | passed |
| 7 | `.bkit/core/engine/ledgers/status.test.ts` "preserves handoff events across status folding and rejects stale CI selection" | red | passed |
| 7 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "resumes nonwaiting CI polls without resetting attempts or duplicating retrigger" | red | passed |
| 8 | `.bkit/core/engine/commands/lib.test.ts` "exposes no-write correction eligibility only for declared pre-effect validation" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/counters.test.ts` "shares correction budget across candidate operations and honors specific limits" | red | passed |
| 8 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "resumes corrected substep and blocks exhausted unauthorized or uncertain effects" | red | passed |
| 9 | `.bkit/core/engine/tools/instructions.test.ts` "renders one recovery precedence contract for all hosts and tracker adapters" | red | not passed |
| 9 | `.bkit/core/engine/install/modules/core.integration.test.ts` "installs and upgrades fresh consumers with deterministic bookkeeping contracts" | red | passed |

## Gaps

- Task 9 `not-green` — "renders one recovery precedence contract for all hosts and tracker adapters" failure: Test timed out in 6600ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout". — Fixable: true — log: TASK 9: `.bkit/core/engine/tools/instructions.test.ts` `renders one recovery precedence contract for all hosts and tracker adapters` — not-green — Fixable: true

## Runner output — `.bkit/core/engine/tools/instructions.test.ts`

```
     ✓ rewrites retired wording continued with ; and keeps the ; 0ms
     ✓ rewrites a near-copy continued with ; and keeps the ; 0ms
     ✓ is idempotent and leaves fenced examples alone 0ms
   ✓ issue-less workflow clauses (7)
     ✓ workflow-issue-id-missing leads into the branch recovery without a STOP 0ms
     ✓ the fids parse routes: hit, no issue, non-slug STOP 0ms
     ✓ Step 1 reads the issue and FID from the prompt file, and resolves FID in the engine 0ms
     ✓ changed issue clauses keep their old text in retired 0ms
     ✓ the issue-less gate clauses read as the issue-less behaviour 0ms
     ✓ the warning, the final-message line and the skip line are clauses 0ms
     ✓ the diff reaches each reader as a file written just before its step, not a guard rule 0ms
   ✓ the Template Instructions tables match the prompts (2)
     ✓ every row's bullet is byte-identical across its carriers 57ms
     ✓ every label's rows list exactly the prompts that carry it 52ms
   ❯ the recovery precedence contract (1)
     × renders one recovery precedence contract for all hosts and tracker adapters 9421ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/tools/instructions.test.ts > the recovery precedence contract > renders one recovery precedence contract for all hosts and tracker adapters
Error: Test timed out in 6600ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/tools/instructions.test.ts:1281:3
    1279|   const failuresLine = (text: string) => /\*\*Failures:\*\*[^\n]*/.exe…
    1280|
    1281|   it("renders one recovery precedence contract for all hosts and track…
       |   ^
    1282|     expect(workflows.length).toBeGreaterThanOrEqual(5);
    1283|     for (const file of workflows) {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 101 passed (102)
   Start at  18:08:11
   Duration  29.58s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-3fpndt/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
