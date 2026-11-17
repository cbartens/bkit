diff --git a/.bkit/core/engine/commands/workflow/summary.test.ts b/.bkit/core/engine/commands/workflow/summary.test.ts
index a785edc95..7909ea057 100644
--- a/.bkit/core/engine/commands/workflow/summary.test.ts
+++ b/.bkit/core/engine/commands/workflow/summary.test.ts
@@ -629,12 +629,19 @@ describe("buildSummary", () => {
   });
 
   it("a later passing test run resolves a failed test-failure fix", () => {
-    const remediate = { type: "step-done", step: "build-failure-remediate", verdict: "FAIL" };
+    const remediate = {
+      type: "step-done",
+      step: "build-failure-remediate",
+      verdict: "FAIL",
+      attempt: 1,
+    };
     const tests = (verdict: string, failures: number) => ({
       type: "step-done",
       step: "build-run-tests",
+      attempt: 1,
       verdict,
       failures,
+      scope: "src/a.test.ts",
     });
     const answered = buildSummary(input({ rows: [tests("FAIL", 1), remediate, tests("PASS", 0)] }));
     expect(answered.markdown).toContain(
@@ -650,6 +657,111 @@ describe("buildSummary", () => {
       expect(buildSummary(input({ rows })).reasons).toContain("build-failure-remediate FAIL");
   });
 
+  const scopedRun = (
+    step: string,
+    attempt: number,
+    verdict: string,
+    failures: number,
+    scope?: string,
+  ) => ({ type: "step-done", step, attempt, verdict, failures, scope });
+
+  it("a test-fix FAIL resolved by a later passing test run on the same scope is historical", () => {
+    const tests = (attempt: number, verdict: string, failures: number, scope?: string) =>
+      scopedRun("build-run-tests", attempt, verdict, failures, scope);
+    const remediate = {
+      type: "step-done",
+      step: "build-failure-remediate",
+      verdict: "FAIL",
+      attempt: 1,
+    };
+    const scope = "src/a.test.ts";
+    const answered = buildSummary(
+      input({
+        rows: [
+          tests(1, "FAIL", 1, scope),
+          remediate,
+          { type: "test-run", attempt: 1, scope: "other", verdict: "FAIL" },
+          tests(2, "PASS", 0, scope),
+        ],
+      }),
+    );
+    expect(answered.reasons).not.toContain("build-failure-remediate FAIL");
+    const findings = answered.markdown.split("## Resolved Findings")[1]!.split("## ")[0]!;
+    expect(findings).toContain("build-failure-remediate FAIL, resolved by build-run-tests");
+    const testsSection = answered.markdown.split("## Tests")[1]!;
+    expect(testsSection).toContain(`Attempt 1: FAIL, failures 1, ran \`${scope}\``);
+    expect(answered.verdict).toBe("PASS");
+
+    for (const rows of [
+      [tests(1, "FAIL", 1, scope), remediate, tests(2, "PASS", 0, "other/scope")],
+      [tests(1, "FAIL", 1, scope), remediate, tests(2, "PASS", 0)],
+      [tests(1, "FAIL", 1, scope), remediate],
+      [tests(1, "FAIL", 1, scope), remediate, tests(2, "FAIL", 1, scope)],
+    ])
+      expect(buildSummary(input({ rows })).reasons).toContain("build-failure-remediate FAIL");
+  });
+
+  it("a debug fix FAIL resolved by a later passing debug test run is historical", () => {
+    const tests = (attempt: number, verdict: string, failures: number, scope?: string) =>
+      scopedRun("debug-run-tests", attempt, verdict, failures, scope);
+    const remediate = {
+      type: "step-done",
+      step: "debug-failure-remediate",
+      verdict: "FAIL",
+      attempt: 1,
+    };
+    const scope = "src/a.test.ts";
+    const answered = buildSummary(
+      input({
+        workflow: "debug",
+        rows: [tests(1, "FAIL", 1, scope), remediate, tests(2, "PASS", 0, scope)],
+      }),
+    );
+    expect(answered.reasons).not.toContain("debug-failure-remediate FAIL");
+    expect(answered.markdown).toContain(
+      "debug-failure-remediate FAIL, resolved by debug-run-tests",
+    );
+
+    for (const rows of [
+      [tests(1, "FAIL", 1, scope), remediate],
+      [tests(1, "FAIL", 1, scope), remediate, tests(2, "FAIL", 1, scope)],
+      [tests(1, "FAIL", 1, scope), remediate, tests(2, "PASS", 0, "other/scope")],
+    ])
+      expect(buildSummary(input({ workflow: "debug", rows })).reasons).toContain(
+        "debug-failure-remediate FAIL",
+      );
+  });
+
+  it("a debug fix FAIL after a CI-sourced round is not resolved by a local pass", () => {
+    const tests = (attempt: number, verdict: string, failures: number, scope: string) =>
+      scopedRun("debug-run-tests", attempt, verdict, failures, scope);
+    const remediate = {
+      type: "step-done",
+      step: "debug-failure-remediate",
+      verdict: "FAIL",
+      attempt: 1,
+    };
+    const control = buildSummary(
+      input({
+        workflow: "debug",
+        rows: [
+          tests(1, "FAIL", 1, "src/a.test.ts"),
+          remediate,
+          tests(2, "PASS", 0, "src/a.test.ts"),
+        ],
+      }),
+    );
+    expect(control.reasons).not.toContain("debug-failure-remediate FAIL");
+
+    const ci = buildSummary(
+      input({
+        workflow: "debug",
+        rows: [tests(1, "FAIL", 1, "ci:12345"), remediate, tests(2, "PASS", 0, "src/a.test.ts")],
+      }),
+    );
+    expect(ci.reasons).toContain("debug-failure-remediate FAIL");
+  });
+
   it("the Challenge section says when challenge-1 was skipped for a small change", () => {
     const gate = (linesChanged: number, filesChanged: number, size: string, skipped: boolean) => ({
       type: "challenge-gate",
diff --git a/.bkit/core/engine/commands/workflow/summary.ts b/.bkit/core/engine/commands/workflow/summary.ts
index 91d98b7e9..c83c45451 100644
--- a/.bkit/core/engine/commands/workflow/summary.ts
+++ b/.bkit/core/engine/commands/workflow/summary.ts
@@ -72,8 +72,12 @@ const RESOLVED_BY: Readonly<Record<string, readonly string[]>> = {
   "build/build-plan-gaps-remediate": ["build-plan-verify", "build-plan-verify-holistic"],
   "build/build-plan-gaps-remediate-holistic": ["build-plan-verify-holistic"],
   "build/build-failure-remediate": ["build-run-tests"],
+  "debug/debug-failure-remediate": ["debug-run-tests"],
 };
 
+/** Test-fix steps whose resolving run must have run the scope of the run the fix followed. */
+const SAME_SCOPE = new Set(["build/build-failure-remediate", "debug/debug-failure-remediate"]);
+
 /** Steps that check the whole run, so they answer a failure in any task group. */
 const WHOLE_RUN = new Set(["build-plan-verify-holistic", "build-run-tests"]);
 
@@ -393,6 +397,16 @@ export function buildSummary(input: SummaryInput): Summary {
     const runAnswers =
       row.verdict === "FAIL" ? (RESOLVED_BY_RUN[`${workflow}/${g.step}`] ?? []) : [];
     const sub = taskGroupOf(row);
+    const needsScope = SAME_SCOPE.has(`${workflow}/${g.step}`);
+    const fixScope = needsScope
+      ? input.rows.find(
+          (r) =>
+            r.type === "step-done" &&
+            RUN_TESTS.has(String(r.step)) &&
+            r.attempt === row.attempt &&
+            typeof r.scope === "string",
+        )?.scope
+      : undefined;
     const answer = groups
       .map(lastOf)
       .find(
@@ -402,7 +416,8 @@ export function buildSummary(input: SummaryInput): Summary {
           (r.verdict === "PASS" || (review && r.verdict === "CONCERNS")) &&
           (r.failures === undefined || r.failures === 0) &&
           (WHOLE_RUN.has(String(r.step)) || taskGroupOf(r) === sub) &&
-          (!review || r.attempt === row.attempt),
+          (!review || r.attempt === row.attempt) &&
+          (!needsScope || (fixScope !== undefined && r.scope === fixScope)),
       );
     if (answer !== undefined && spike) {
       const reports = artifactsOf(row).map((p) => read(p));
diff --git a/dist/commands/workflow/summary.js b/dist/commands/workflow/summary.js
index 40adc83a5..44cc8eb62 100644
--- a/dist/commands/workflow/summary.js
+++ b/dist/commands/workflow/summary.js
@@ -59,7 +59,10 @@ const RESOLVED_BY = {
     "build/build-plan-gaps-remediate": ["build-plan-verify", "build-plan-verify-holistic"],
     "build/build-plan-gaps-remediate-holistic": ["build-plan-verify-holistic"],
     "build/build-failure-remediate": ["build-run-tests"],
+    "debug/debug-failure-remediate": ["debug-run-tests"],
 };
+/** Test-fix steps whose resolving run must have run the scope of the run the fix followed. */
+const SAME_SCOPE = new Set(["build/build-failure-remediate", "debug/debug-failure-remediate"]);
 /** Steps that check the whole run, so they answer a failure in any task group. */
 const WHOLE_RUN = new Set(["build-plan-verify-holistic", "build-run-tests"]);
 /**
@@ -323,6 +326,13 @@ export function buildSummary(input) {
                 : [];
         const runAnswers = row.verdict === "FAIL" ? (RESOLVED_BY_RUN[`${workflow}/${g.step}`] ?? []) : [];
         const sub = taskGroupOf(row);
+        const needsScope = SAME_SCOPE.has(`${workflow}/${g.step}`);
+        const fixScope = needsScope
+            ? input.rows.find((r) => r.type === "step-done" &&
+                RUN_TESTS.has(String(r.step)) &&
+                r.attempt === row.attempt &&
+                typeof r.scope === "string")?.scope
+            : undefined;
         const answer = groups
             .map(lastOf)
             .find(({ row: r, index: i }) => i > index &&
@@ -330,7 +340,8 @@ export function buildSummary(input) {
             (r.verdict === "PASS" || (review && r.verdict === "CONCERNS")) &&
             (r.failures === undefined || r.failures === 0) &&
             (WHOLE_RUN.has(String(r.step)) || taskGroupOf(r) === sub) &&
-            (!review || r.attempt === row.attempt));
+            (!review || r.attempt === row.attempt) &&
+            (!needsScope || (fixScope !== undefined && r.scope === fixScope)));
         if (answer !== undefined && spike) {
             const reports = artifactsOf(row).map((p) => read(p));
             const unsettled = reports.map((report) => report === null ? undefined : planSection(report, /^## Unsettled\s*$/));
