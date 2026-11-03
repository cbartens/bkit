Enforced: true
Gaps: 2
Test order only: true

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/705-build-plan-convert-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 2 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "Plan Current posts a comment whether it runs or skips" | recorded 2026-10-27T02:59:17Z | yes | passed |
| 2 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "Plan Current's skipped comment says no plan anchor" | recorded 2026-10-27T02:59:21Z | yes | passed |
| 2 | `.bkit/core/engine/render/trackers.test.ts` "bkit-build: the none render matches its baseline byte for byte" | recorded 2026-10-27T03:00:05Z | no | passed |

## Gaps

- Task 2 `test-changed` — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` differs from its red snapshot for "Plan Current posts a comment whether it runs or skips" (diff below)
- Task 2 `test-changed` — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` differs from its red snapshot for "Plan Current's skipped comment says no plan anchor" (diff below)

## Diff since red — Task 2 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/705-build-plan-convert/build-task-red-2-2-1.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 2856cf674..366fddc10 100644
--- a/docs/plans/202610/logs/705-build-plan-convert/build-task-red-2-2-1.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -381,6 +381,16 @@ function commentNumberProblems(text: string): string[] {
   });
 }

+/** The `steps finish` lines in `text` running `step`. */
+function stepFinishLines(text: string, step: string): string[] {
+  return commandLines(text, "steps finish").filter((l) => l.includes(`--step=${step}`));
+}
+
+/** `lines` without the ones naming an agent. */
+function withNoAgent(lines: string[]): string[] {
+  return lines.filter((l) => !l.includes("--agent"));
+}
+
 describe("build", () => {
   const build = workflow("build");

@@ -581,10 +591,7 @@ describe("build", () => {
   });

   it("Plan Current posts a comment whether it runs or skips", () => {
-    const step5 = section(build, /Step 5 — Plan Current/);
-    const finish = commandLines(step5, "steps finish").filter((l) =>
-      l.includes("--step=build-plan-current"),
-    );
+    const finish = stepFinishLines(section(build, /Step 5 — Plan Current/), "build-plan-current");
     expect(finish).toHaveLength(2);
     for (const line of finish) expect(line).toContain("--number=5");
     for (const line of finish) expect(line).toContain('--post --title="Plan Current"');
@@ -592,9 +599,7 @@ describe("build", () => {

   it("Plan Current's skipped comment says no plan anchor", () => {
     const step5 = section(build, /Step 5 — Plan Current/);
-    const skip = commandLines(step5, "steps finish").filter(
-      (l) => l.includes("--step=build-plan-current") && !l.includes("--agent"),
-    );
+    const skip = withNoAgent(stepFinishLines(step5, "build-plan-current"));
     expect(skip).toHaveLength(1);
     expect(skip[0]).not.toContain("--artifact");
     expect(skip[0]).toContain('--comment-field="Status=skipped (no plan anchor)"');
```

## Diff since red — Task 2 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/705-build-plan-convert/build-task-red-2-2-2.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 2856cf674..366fddc10 100644
--- a/docs/plans/202610/logs/705-build-plan-convert/build-task-red-2-2-2.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -381,6 +381,16 @@ function commentNumberProblems(text: string): string[] {
   });
 }

+/** The `steps finish` lines in `text` running `step`. */
+function stepFinishLines(text: string, step: string): string[] {
+  return commandLines(text, "steps finish").filter((l) => l.includes(`--step=${step}`));
+}
+
+/** `lines` without the ones naming an agent. */
+function withNoAgent(lines: string[]): string[] {
+  return lines.filter((l) => !l.includes("--agent"));
+}
+
 describe("build", () => {
   const build = workflow("build");

@@ -581,10 +591,7 @@ describe("build", () => {
   });

   it("Plan Current posts a comment whether it runs or skips", () => {
-    const step5 = section(build, /Step 5 — Plan Current/);
-    const finish = commandLines(step5, "steps finish").filter((l) =>
-      l.includes("--step=build-plan-current"),
-    );
+    const finish = stepFinishLines(section(build, /Step 5 — Plan Current/), "build-plan-current");
     expect(finish).toHaveLength(2);
     for (const line of finish) expect(line).toContain("--number=5");
     for (const line of finish) expect(line).toContain('--post --title="Plan Current"');
@@ -592,9 +599,7 @@ describe("build", () => {

   it("Plan Current's skipped comment says no plan anchor", () => {
     const step5 = section(build, /Step 5 — Plan Current/);
-    const skip = commandLines(step5, "steps finish").filter(
-      (l) => l.includes("--step=build-plan-current") && !l.includes("--agent"),
-    );
+    const skip = withNoAgent(stepFinishLines(step5, "build-plan-current"));
     expect(skip).toHaveLength(1);
     expect(skip[0]).not.toContain("--artifact");
     expect(skip[0]).toContain('--comment-field="Status=skipped (no plan anchor)"');
```
