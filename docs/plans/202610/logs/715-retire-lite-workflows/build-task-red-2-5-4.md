
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/summary.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows

 ❯ .bkit/core/engine/commands/workflow/summary.test.ts (23 tests | 4 failed) 10ms
   ✓ refOf (3)
     ✓ gives #N for a numeric issue segment 1ms
     ✓ gives the uppercase key for a prefixed issue segment 0ms
     ✓ gives no ref for a FID with no issue segment, or under no tracker 0ms
   ❯ buildSummary (20)
     ✓ writes the header every reader expects, and the next step with the ref 1ms
     × writes Publish: held when publish is false 2ms
     × writes Publish: pr by default 0ms
     × writes Docs: not synced on a held summary 2ms
     × keeps the verdict and next step unchanged by publish 1ms
     ✓ a plan step's FAIL review answered by its apply step is CONCERNS, not FAIL 0ms
     ✓ a build challenge FAIL answered by its fix tasks or a decision is CONCERNS; unanswered is FAIL 0ms
     ✓ a group's execute FAIL answered by that group's later non-FAIL verify is CONCERNS; else FAIL 0ms
     ✓ the Challenge section says when challenge-1 was skipped for a small change 0ms
     ✓ debug with Reproduced: NO recommends a repro re-run, not FAIL 0ms
     ✓ ship PASS says no further command; FAIL goes back to /bkit-ship 0ms
     ✓ design with two workstreams files them before /bkit-plan 0ms
     ✓ copies the organised design's Risks & Open Questions under ## Open Questions 0ms
     ✓ a design with no organised design says None under ## Open Questions 0ms
     ✓ copies the plan's Acceptance Scenario and Open Questions word for word 0ms
     ✓ a build with no plan file fails, even when every step passed 0ms
     ✓ a missing plan file fails only the build summary 0ms
     ✓ a build's last unanswered verify FAIL fails it 0ms
     ✓ lists open BLOCKED lines, accepted gaps, undecided pauses and TEST EXCEPTION fields 0ms
     ✓ counts a lettered Accept decision as accepted at the Decision Pause 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > writes Publish: held when publish is false
AssertionError: expected 'Verdict: PASS\nFailures: 0\n<!-- verd…' to match /^Publish: held$/m

- Expected:
/^Publish: held$/m

+ Received:
"Verdict: PASS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

PASS

- No failing step, open task, accepted item or new deferral.

Plan tasks: 1 of 1 ticked in `docs/plans/p-plan.md`.

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |

## Challenge

None

## Tests

None recorded.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-ship #682
```
"

 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:68:24
     66|   it("writes Publish: held when publish is false", () => {
     67|     const s = buildSummary(input({ publish: false }));
     68|     expect(s.markdown).toMatch(/^Publish: held$/m);
       |                        ^
     69|     expect(s.markdown).not.toMatch(/^Publish: pr$/m);
     70|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > writes Publish: pr by default
AssertionError: expected 'Verdict: PASS\nFailures: 0\n<!-- verd…' to match /^Publish: pr$/m

- Expected:
/^Publish: pr$/m

+ Received:
"Verdict: PASS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

PASS

- No failing step, open task, accepted item or new deferral.

Plan tasks: 1 of 1 ticked in `docs/plans/p-plan.md`.

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |

## Challenge

None

## Tests

None recorded.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-ship #682
```
"

 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:75:26
     73|     for (const publish of [undefined, true]) {
     74|       const s = buildSummary(input({ publish }));
     75|       expect(s.markdown).toMatch(/^Publish: pr$/m);
       |                          ^
     76|       expect(s.markdown).not.toContain("Publish: held");
     77|     }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > writes Docs: not synced on a held summary
AssertionError: expected 'Verdict: PASS\nFailures: 0\n<!-- verd…' to contain 'Docs: not synced (ship syncs on landi…'

- Expected
+ Received

- Docs: not synced (ship syncs on landing)
+ Verdict: PASS
+ Failures: 0
+ <!-- verdict:end -->
+
+ # Build Summary
+
+ ## Verdict
+
+ PASS
+
+ - No failing step, open task, accepted item or new deferral.
+
+ Plan tasks: 1 of 1 ticked in `docs/plans/p-plan.md`.
+
+ ## Steps
+
+ | Step | Verdict | Failures | Attempts | Artifact |
+ | --- | --- | --- | --- | --- |
+
+ ## Challenge
+
+ None
+
+ ## Tests
+
+ None recorded.
+
+ ## Risks and Action Items
+
+ None
+
+ ## Recommended Next Step
+
+ ```text
+ /bkit-ship #682
+ ```
+

 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:82:27
     80|   it("writes Docs: not synced on a held summary", () => {
     81|     const held = buildSummary(input({ publish: false }));
     82|     expect(held.markdown).toContain("Docs: not synced (ship syncs on l…
       |                           ^
     83|     expect(buildSummary(input({ publish: true })).markdown).not.toCont…
     84|     expect(buildSummary(input({})).markdown).not.toContain("Docs:");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > keeps the verdict and next step unchanged by publish
AssertionError: expected 'Verdict: PASS\nFailures: 0\n<!-- verd…' to contain 'Publish: held'

- Expected
+ Received

- Publish: held
+ Verdict: PASS
+ Failures: 0
+ <!-- verdict:end -->
+
+ # Build Summary
+
+ ## Verdict
+
+ PASS
+
+ - No failing step, open task, accepted item or new deferral.
+
+ Plan tasks: 1 of 1 ticked in `docs/plans/p-plan.md`.
+
+ ## Steps
+
+ | Step | Verdict | Failures | Attempts | Artifact |
+ | --- | --- | --- | --- | --- |
+
+ ## Challenge
+
+ None
+
+ ## Tests
+
+ None recorded.
+
+ ## Risks and Action Items
+
+ None
+
+ ## Recommended Next Step
+
+ ```text
+ /bkit-ship #682
+ ```
+

 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:90:27
     88|     const held = buildSummary(input({ publish: false }));
     89|     const pr = buildSummary(input({ publish: true }));
     90|     expect(held.markdown).toContain("Publish: held");
       |                           ^
     91|     expect(pr.markdown).toContain("Publish: pr");
     92|     expect(held.verdict).toBe(pr.verdict);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 19 passed (23)
   Start at  07:06:21
   Duration  239ms (transform 73%, import 11%, setup 10%, tests 5%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-pl7u1J/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
