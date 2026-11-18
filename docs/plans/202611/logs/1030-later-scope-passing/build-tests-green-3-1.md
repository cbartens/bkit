Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1030-later-scope-passing-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug-failure-diagnose FAIL answered by a later same-scope pass still holds the debug summary at FAIL" | red | passed |

## Gaps

None.

## Taken over

- Task 4 `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical" — taken over from Task 3; recorded `red` after the rewrite

  ```diff
     it("a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical", () => {
       const { tests, diagnose, scope } = diagnoseCase("debug");
       const answered = buildSummary(
         input({
           workflow: "debug",
           rows: [tests(1, "FAIL", 1, scope), diagnose, tests(2, "PASS", 0, scope)],
         }),
       );
  -    expect(answered.reasons).not.toContain("debug-failure-diagnose FAIL");
  -    expect(answered.reasons).toContain(
  +    expect(answered.reasons).toContain("debug-failure-diagnose FAIL");
  +    expect(answered.reasons).not.toContain(
         "debug-failure-diagnose FAIL, tests passed since (debug-run-tests)",
       );
       expect(answered.markdown).not.toContain(
         "debug-failure-diagnose FAIL, resolved by debug-run-tests",
       );
  -    expect(answered.verdict).toBe("CONCERNS");
  +    expect(answered.verdict).toBe("FAIL");
     });
  ```

