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
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a build-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a diagnose FAIL followed by a passing run on a different scope still counts" | passed-accepted | passed |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a diagnose FAIL followed by a passing run with no scope still counts" | passed-accepted | passed |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug-failure-soak FAIL followed by a passing same-scope run still counts" | passed-accepted | passed |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a build-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a diagnose FAIL with no later passing same-scope test run is still a FAIL" | passed-accepted | passed |
| 4 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug-failure-diagnose FAIL answered by a later same-scope pass still holds the debug summary at FAIL" | red | passed |

## Gaps

None.

## Already landed

- Task 1 `.bkit/core/engine/commands/workflow/summary.test.ts` "a diagnose FAIL followed by a passing run on a different scope still counts" — passed at the group's red, and the tests step accepted it: diagnose and soak are not in RESOLVED_BY yet, so the FAIL already counts; the test guards the scope check once diagnose is added; no red is due
- Task 1 `.bkit/core/engine/commands/workflow/summary.test.ts` "a diagnose FAIL followed by a passing run with no scope still counts" — passed at the group's red, and the tests step accepted it: diagnose and soak are not in RESOLVED_BY yet, so the FAIL already counts; the test guards the scope check once diagnose is added; no red is due
- Task 1 `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug-failure-soak FAIL followed by a passing same-scope run still counts" — passed at the group's red, and the tests step accepted it: diagnose and soak are not in RESOLVED_BY yet, so the FAIL already counts; the test guards the scope check once diagnose is added; no red is due
- Task 3 `.bkit/core/engine/commands/workflow/summary.test.ts` "a diagnose FAIL with no later passing same-scope test run is still a FAIL" — passed at the group's red, and the tests step accepted it: existing RESOLVED_BY/SAME_SCOPE rule already keeps a different-scope diagnose FAIL a FAIL; no red is due

## Taken over

- Task 3 `.bkit/core/engine/commands/workflow/summary.test.ts` "a build-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical" — taken over from Task 1; recorded `red` after the rewrite

  ```diff
     it("a build-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical", () => {
       const { tests, diagnose, scope } = diagnoseCase("build");
       const answered = buildSummary(
         input({ rows: [tests(1, "FAIL", 1, scope), diagnose, tests(2, "PASS", 0, scope)] }),
       );
       expect(answered.reasons).not.toContain("build-failure-diagnose FAIL");
  -    const findings = answered.markdown.split("## Resolved Findings")[1]!.split("## ")[0]!;
  -    expect(findings).toContain("build-failure-diagnose FAIL, resolved by build-run-tests");
  -    expect(answered.verdict).toBe("PASS");
  +    expect(answered.reasons).toContain(
  +      "build-failure-diagnose FAIL, tests passed since (build-run-tests)",
  +    );
  +    expect(answered.markdown).not.toContain(
  +      "build-failure-diagnose FAIL, resolved by build-run-tests",
  +    );
  +    expect(answered.verdict).toBe("CONCERNS");
     });
  ```

- Task 3 `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical" — taken over from Task 1; recorded `red` after the rewrite

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
  -    expect(answered.markdown).toContain("debug-failure-diagnose FAIL, resolved by debug-run-tests");
  +    expect(answered.reasons).toContain("debug-failure-diagnose FAIL");
  +    expect(answered.reasons).not.toContain(
  +      "debug-failure-diagnose FAIL, tests passed since (debug-run-tests)",
  +    );
  +    expect(answered.markdown).not.toContain(
  +      "debug-failure-diagnose FAIL, resolved by debug-run-tests",
  +    );
  +    expect(answered.verdict).toBe("FAIL");
     });
  ```

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

