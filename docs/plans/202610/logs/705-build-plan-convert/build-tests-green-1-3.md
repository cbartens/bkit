Enforced: true
Gaps: 0
Test order only: false

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/705-build-plan-convert-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "Branch Sync merges docs and finishes as its own step" | recorded 2026-10-26T13:23:10Z | yes | passed |
| 1 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "Plan Convert checks the plan, converts one with no task markers, and re-checks" | recorded 2026-10-26T13:23:13Z | yes | passed |
| 1 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "Plan Convert leaves a valid plan with no newer comments alone" | recorded 2026-10-26T13:23:15Z | yes | passed |
| 1 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "build's comment numbers match the step table" | recorded 2026-10-26T13:23:18Z | yes | passed |
| 1 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the convert step posts under Plan Convert's number and title" | recorded 2026-10-26T13:23:21Z | yes | passed |
| 1 | `.bkit/core/engine/commands/workflow/step-table.test.ts` "a build that stopped after Plan Convert resumes at Plan Convert (Step 4)" | recorded 2026-10-26T13:23:24Z | no | passed |
| 1 | `.bkit/core/engine/commands/workflow/step-table.test.ts` "a build that stopped after Plan Current resumes at Install Skills (Step 6)" | recorded 2026-10-26T13:23:25Z | no | passed |
| 1 | `.bkit/core/engine/commands/workflow/step-table.test.ts` "a build that stopped after Plan Verify resumes at Plan Verify (Step 8)" | recorded 2026-10-26T13:23:27Z | no | passed |
| 1 | `.bkit/core/engine/render/trackers.test.ts` "bkit-build: the none render matches its baseline byte for byte" | recorded 2026-10-26T13:26:17Z | no | passed |

## Gaps

None.

## Test exceptions

- Task 1 — honoured; cleared `test-changed` for `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "Branch Sync merges docs and finishes as its own step", `test-changed` for `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "Plan Convert checks the plan, converts one with no task markers, and re-checks", `test-changed` for `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "Plan Convert leaves a valid plan with no newer comments alone", `test-changed` for `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "build's comment numbers match the step table", `test-changed` for `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the convert step posts under Plan Convert's number and title"

## Diff since red — Task 1 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/705-build-plan-convert/build-task-red-1-1-1.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index c047b2198..fd3eb832d 100644
--- a/docs/plans/202610/logs/705-build-plan-convert/build-task-red-1-1-1.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -343,6 +343,44 @@ describe("Failure Path", () => {
   });
 });

+/** The build step table's numbers carried by more than one step, each list sorted. */
+function sharedStepNumbers(): string[][] {
+  const byNumber = new Map<number, string[]>();
+  for (const row of WORKFLOW_STEPS.build.filter((s) => s.step !== undefined)) {
+    const steps = byNumber.get(row.number) ?? [];
+    steps.push(row.step!);
+    byNumber.set(row.number, steps);
+  }
+  return [...byNumber.values()]
+    .filter((steps) => steps.length > 1)
+    .map((steps) => steps.sort())
+    .sort((a, b) => a[0]!.localeCompare(b[0]!));
+}
+
+/** Finish lines in `text` posting a number or title the build step table's row does not carry. */
+function commentNumberProblems(text: string): string[] {
+  const rows = WORKFLOW_STEPS.build.filter((s) => s.step !== undefined);
+  const byStep = new Map(rows.map((s) => [s.step!, s]));
+  const byNumber = new Map<number, string[]>();
+  for (const row of rows)
+    byNumber.set(row.number, [...(byNumber.get(row.number) ?? []), row.step!]);
+  return commandLines(text, "steps finish").flatMap((line) => {
+    const step = /--step=([a-z0-9-]+)/.exec(line)?.[1];
+    // The Decision Pause writes its own row under the paused step's number.
+    if (step === undefined || step === "build-decision") return [];
+    const row = byStep.get(step);
+    if (row === undefined) return [`${step}: no row in the build step table`];
+    if (!line.includes(`--number=${row.number}`))
+      return [`${step}: posts a number other than ${row.number}`];
+    // A number two steps share lets each post under its own title.
+    if (byNumber.get(row.number)!.length > 1) return [];
+    const title = row.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
+    return new RegExp(`--title="?${title}"?(?=\\s)`).test(line)
+      ? []
+      : [`${step}: posts a title other than "${row.title}"`];
+  });
+}
+
 describe("build", () => {
   const build = workflow("build");

@@ -522,31 +560,14 @@ describe("build", () => {
   });

   it("build's comment numbers match the step table", () => {
-    const rows = WORKFLOW_STEPS.build.filter((s) => s.step !== undefined);
-    const byStep = new Map(rows.map((s) => [s.step!, s]));
     // One number per step; only the pairs sharing a step heading share one.
-    const byNumber = new Map<number, string[]>();
-    for (const row of rows)
-      byNumber.set(row.number, [...(byNumber.get(row.number) ?? []), row.step!]);
-    const shared = [...byNumber.values()].filter((s) => s.length > 1).map((s) => s.sort());
-    expect(shared).toEqual([
+    expect(sharedStepNumbers()).toEqual([
       ["build-close-workflow", "build-create-pr"],
       ["build-group-gate", "build-plan-verify"],
       ["build-group-start", "build-plan-execute"],
     ]);
-    for (const line of commandLines(build, "steps finish")) {
-      const step = /--step=([a-z0-9-]+)/.exec(line)?.[1];
-      // The Decision Pause writes its own row under the paused step's number.
-      if (step === "build-decision") continue;
-      const row = byStep.get(step!);
-      expect(row, step).toBeDefined();
-      expect(line, step).toContain(`--number=${row!.number}`);
-      // A number two steps share lets each post under its own title.
-      if (byNumber.get(row!.number)!.length === 1) {
-        const title = row!.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
-        expect(line, step).toMatch(new RegExp(`--title="?${title}"?(?=\\s)`));
-      }
-    }
+    // Each finish line posts the number and title of its own table row.
+    expect(commentNumberProblems(build)).toEqual([]);
   });

   it("the convert step posts under Plan Convert's number and title", () => {
```

## Diff since red — Task 1 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/705-build-plan-convert/build-task-red-1-1-2.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index c047b2198..fd3eb832d 100644
--- a/docs/plans/202610/logs/705-build-plan-convert/build-task-red-1-1-2.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -343,6 +343,44 @@ describe("Failure Path", () => {
   });
 });

+/** The build step table's numbers carried by more than one step, each list sorted. */
+function sharedStepNumbers(): string[][] {
+  const byNumber = new Map<number, string[]>();
+  for (const row of WORKFLOW_STEPS.build.filter((s) => s.step !== undefined)) {
+    const steps = byNumber.get(row.number) ?? [];
+    steps.push(row.step!);
+    byNumber.set(row.number, steps);
+  }
+  return [...byNumber.values()]
+    .filter((steps) => steps.length > 1)
+    .map((steps) => steps.sort())
+    .sort((a, b) => a[0]!.localeCompare(b[0]!));
+}
+
+/** Finish lines in `text` posting a number or title the build step table's row does not carry. */
+function commentNumberProblems(text: string): string[] {
+  const rows = WORKFLOW_STEPS.build.filter((s) => s.step !== undefined);
+  const byStep = new Map(rows.map((s) => [s.step!, s]));
+  const byNumber = new Map<number, string[]>();
+  for (const row of rows)
+    byNumber.set(row.number, [...(byNumber.get(row.number) ?? []), row.step!]);
+  return commandLines(text, "steps finish").flatMap((line) => {
+    const step = /--step=([a-z0-9-]+)/.exec(line)?.[1];
+    // The Decision Pause writes its own row under the paused step's number.
+    if (step === undefined || step === "build-decision") return [];
+    const row = byStep.get(step);
+    if (row === undefined) return [`${step}: no row in the build step table`];
+    if (!line.includes(`--number=${row.number}`))
+      return [`${step}: posts a number other than ${row.number}`];
+    // A number two steps share lets each post under its own title.
+    if (byNumber.get(row.number)!.length > 1) return [];
+    const title = row.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
+    return new RegExp(`--title="?${title}"?(?=\\s)`).test(line)
+      ? []
+      : [`${step}: posts a title other than "${row.title}"`];
+  });
+}
+
 describe("build", () => {
   const build = workflow("build");

@@ -522,31 +560,14 @@ describe("build", () => {
   });

   it("build's comment numbers match the step table", () => {
-    const rows = WORKFLOW_STEPS.build.filter((s) => s.step !== undefined);
-    const byStep = new Map(rows.map((s) => [s.step!, s]));
     // One number per step; only the pairs sharing a step heading share one.
-    const byNumber = new Map<number, string[]>();
-    for (const row of rows)
-      byNumber.set(row.number, [...(byNumber.get(row.number) ?? []), row.step!]);
-    const shared = [...byNumber.values()].filter((s) => s.length > 1).map((s) => s.sort());
-    expect(shared).toEqual([
+    expect(sharedStepNumbers()).toEqual([
       ["build-close-workflow", "build-create-pr"],
       ["build-group-gate", "build-plan-verify"],
       ["build-group-start", "build-plan-execute"],
     ]);
-    for (const line of commandLines(build, "steps finish")) {
-      const step = /--step=([a-z0-9-]+)/.exec(line)?.[1];
-      // The Decision Pause writes its own row under the paused step's number.
-      if (step === "build-decision") continue;
-      const row = byStep.get(step!);
-      expect(row, step).toBeDefined();
-      expect(line, step).toContain(`--number=${row!.number}`);
-      // A number two steps share lets each post under its own title.
-      if (byNumber.get(row!.number)!.length === 1) {
-        const title = row!.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
-        expect(line, step).toMatch(new RegExp(`--title="?${title}"?(?=\\s)`));
-      }
-    }
+    // Each finish line posts the number and title of its own table row.
+    expect(commentNumberProblems(build)).toEqual([]);
   });

   it("the convert step posts under Plan Convert's number and title", () => {
```

## Diff since red — Task 1 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/705-build-plan-convert/build-task-red-1-1-3.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index c047b2198..fd3eb832d 100644
--- a/docs/plans/202610/logs/705-build-plan-convert/build-task-red-1-1-3.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -343,6 +343,44 @@ describe("Failure Path", () => {
   });
 });

+/** The build step table's numbers carried by more than one step, each list sorted. */
+function sharedStepNumbers(): string[][] {
+  const byNumber = new Map<number, string[]>();
+  for (const row of WORKFLOW_STEPS.build.filter((s) => s.step !== undefined)) {
+    const steps = byNumber.get(row.number) ?? [];
+    steps.push(row.step!);
+    byNumber.set(row.number, steps);
+  }
+  return [...byNumber.values()]
+    .filter((steps) => steps.length > 1)
+    .map((steps) => steps.sort())
+    .sort((a, b) => a[0]!.localeCompare(b[0]!));
+}
+
+/** Finish lines in `text` posting a number or title the build step table's row does not carry. */
+function commentNumberProblems(text: string): string[] {
+  const rows = WORKFLOW_STEPS.build.filter((s) => s.step !== undefined);
+  const byStep = new Map(rows.map((s) => [s.step!, s]));
+  const byNumber = new Map<number, string[]>();
+  for (const row of rows)
+    byNumber.set(row.number, [...(byNumber.get(row.number) ?? []), row.step!]);
+  return commandLines(text, "steps finish").flatMap((line) => {
+    const step = /--step=([a-z0-9-]+)/.exec(line)?.[1];
+    // The Decision Pause writes its own row under the paused step's number.
+    if (step === undefined || step === "build-decision") return [];
+    const row = byStep.get(step);
+    if (row === undefined) return [`${step}: no row in the build step table`];
+    if (!line.includes(`--number=${row.number}`))
+      return [`${step}: posts a number other than ${row.number}`];
+    // A number two steps share lets each post under its own title.
+    if (byNumber.get(row.number)!.length > 1) return [];
+    const title = row.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
+    return new RegExp(`--title="?${title}"?(?=\\s)`).test(line)
+      ? []
+      : [`${step}: posts a title other than "${row.title}"`];
+  });
+}
+
 describe("build", () => {
   const build = workflow("build");

@@ -522,31 +560,14 @@ describe("build", () => {
   });

   it("build's comment numbers match the step table", () => {
-    const rows = WORKFLOW_STEPS.build.filter((s) => s.step !== undefined);
-    const byStep = new Map(rows.map((s) => [s.step!, s]));
     // One number per step; only the pairs sharing a step heading share one.
-    const byNumber = new Map<number, string[]>();
-    for (const row of rows)
-      byNumber.set(row.number, [...(byNumber.get(row.number) ?? []), row.step!]);
-    const shared = [...byNumber.values()].filter((s) => s.length > 1).map((s) => s.sort());
-    expect(shared).toEqual([
+    expect(sharedStepNumbers()).toEqual([
       ["build-close-workflow", "build-create-pr"],
       ["build-group-gate", "build-plan-verify"],
       ["build-group-start", "build-plan-execute"],
     ]);
-    for (const line of commandLines(build, "steps finish")) {
-      const step = /--step=([a-z0-9-]+)/.exec(line)?.[1];
-      // The Decision Pause writes its own row under the paused step's number.
-      if (step === "build-decision") continue;
-      const row = byStep.get(step!);
-      expect(row, step).toBeDefined();
-      expect(line, step).toContain(`--number=${row!.number}`);
-      // A number two steps share lets each post under its own title.
-      if (byNumber.get(row!.number)!.length === 1) {
-        const title = row!.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
-        expect(line, step).toMatch(new RegExp(`--title="?${title}"?(?=\\s)`));
-      }
-    }
+    // Each finish line posts the number and title of its own table row.
+    expect(commentNumberProblems(build)).toEqual([]);
   });

   it("the convert step posts under Plan Convert's number and title", () => {
```

## Diff since red — Task 1 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/705-build-plan-convert/build-task-red-1-1-4.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index c047b2198..fd3eb832d 100644
--- a/docs/plans/202610/logs/705-build-plan-convert/build-task-red-1-1-4.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -343,6 +343,44 @@ describe("Failure Path", () => {
   });
 });

+/** The build step table's numbers carried by more than one step, each list sorted. */
+function sharedStepNumbers(): string[][] {
+  const byNumber = new Map<number, string[]>();
+  for (const row of WORKFLOW_STEPS.build.filter((s) => s.step !== undefined)) {
+    const steps = byNumber.get(row.number) ?? [];
+    steps.push(row.step!);
+    byNumber.set(row.number, steps);
+  }
+  return [...byNumber.values()]
+    .filter((steps) => steps.length > 1)
+    .map((steps) => steps.sort())
+    .sort((a, b) => a[0]!.localeCompare(b[0]!));
+}
+
+/** Finish lines in `text` posting a number or title the build step table's row does not carry. */
+function commentNumberProblems(text: string): string[] {
+  const rows = WORKFLOW_STEPS.build.filter((s) => s.step !== undefined);
+  const byStep = new Map(rows.map((s) => [s.step!, s]));
+  const byNumber = new Map<number, string[]>();
+  for (const row of rows)
+    byNumber.set(row.number, [...(byNumber.get(row.number) ?? []), row.step!]);
+  return commandLines(text, "steps finish").flatMap((line) => {
+    const step = /--step=([a-z0-9-]+)/.exec(line)?.[1];
+    // The Decision Pause writes its own row under the paused step's number.
+    if (step === undefined || step === "build-decision") return [];
+    const row = byStep.get(step);
+    if (row === undefined) return [`${step}: no row in the build step table`];
+    if (!line.includes(`--number=${row.number}`))
+      return [`${step}: posts a number other than ${row.number}`];
+    // A number two steps share lets each post under its own title.
+    if (byNumber.get(row.number)!.length > 1) return [];
+    const title = row.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
+    return new RegExp(`--title="?${title}"?(?=\\s)`).test(line)
+      ? []
+      : [`${step}: posts a title other than "${row.title}"`];
+  });
+}
+
 describe("build", () => {
   const build = workflow("build");

@@ -522,31 +560,14 @@ describe("build", () => {
   });

   it("build's comment numbers match the step table", () => {
-    const rows = WORKFLOW_STEPS.build.filter((s) => s.step !== undefined);
-    const byStep = new Map(rows.map((s) => [s.step!, s]));
     // One number per step; only the pairs sharing a step heading share one.
-    const byNumber = new Map<number, string[]>();
-    for (const row of rows)
-      byNumber.set(row.number, [...(byNumber.get(row.number) ?? []), row.step!]);
-    const shared = [...byNumber.values()].filter((s) => s.length > 1).map((s) => s.sort());
-    expect(shared).toEqual([
+    expect(sharedStepNumbers()).toEqual([
       ["build-close-workflow", "build-create-pr"],
       ["build-group-gate", "build-plan-verify"],
       ["build-group-start", "build-plan-execute"],
     ]);
-    for (const line of commandLines(build, "steps finish")) {
-      const step = /--step=([a-z0-9-]+)/.exec(line)?.[1];
-      // The Decision Pause writes its own row under the paused step's number.
-      if (step === "build-decision") continue;
-      const row = byStep.get(step!);
-      expect(row, step).toBeDefined();
-      expect(line, step).toContain(`--number=${row!.number}`);
-      // A number two steps share lets each post under its own title.
-      if (byNumber.get(row!.number)!.length === 1) {
-        const title = row!.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
-        expect(line, step).toMatch(new RegExp(`--title="?${title}"?(?=\\s)`));
-      }
-    }
+    // Each finish line posts the number and title of its own table row.
+    expect(commentNumberProblems(build)).toEqual([]);
   });

   it("the convert step posts under Plan Convert's number and title", () => {
```

## Diff since red — Task 1 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/705-build-plan-convert/build-task-red-1-1-5.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index c047b2198..fd3eb832d 100644
--- a/docs/plans/202610/logs/705-build-plan-convert/build-task-red-1-1-5.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -343,6 +343,44 @@ describe("Failure Path", () => {
   });
 });

+/** The build step table's numbers carried by more than one step, each list sorted. */
+function sharedStepNumbers(): string[][] {
+  const byNumber = new Map<number, string[]>();
+  for (const row of WORKFLOW_STEPS.build.filter((s) => s.step !== undefined)) {
+    const steps = byNumber.get(row.number) ?? [];
+    steps.push(row.step!);
+    byNumber.set(row.number, steps);
+  }
+  return [...byNumber.values()]
+    .filter((steps) => steps.length > 1)
+    .map((steps) => steps.sort())
+    .sort((a, b) => a[0]!.localeCompare(b[0]!));
+}
+
+/** Finish lines in `text` posting a number or title the build step table's row does not carry. */
+function commentNumberProblems(text: string): string[] {
+  const rows = WORKFLOW_STEPS.build.filter((s) => s.step !== undefined);
+  const byStep = new Map(rows.map((s) => [s.step!, s]));
+  const byNumber = new Map<number, string[]>();
+  for (const row of rows)
+    byNumber.set(row.number, [...(byNumber.get(row.number) ?? []), row.step!]);
+  return commandLines(text, "steps finish").flatMap((line) => {
+    const step = /--step=([a-z0-9-]+)/.exec(line)?.[1];
+    // The Decision Pause writes its own row under the paused step's number.
+    if (step === undefined || step === "build-decision") return [];
+    const row = byStep.get(step);
+    if (row === undefined) return [`${step}: no row in the build step table`];
+    if (!line.includes(`--number=${row.number}`))
+      return [`${step}: posts a number other than ${row.number}`];
+    // A number two steps share lets each post under its own title.
+    if (byNumber.get(row.number)!.length > 1) return [];
+    const title = row.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
+    return new RegExp(`--title="?${title}"?(?=\\s)`).test(line)
+      ? []
+      : [`${step}: posts a title other than "${row.title}"`];
+  });
+}
+
 describe("build", () => {
   const build = workflow("build");

@@ -522,31 +560,14 @@ describe("build", () => {
   });

   it("build's comment numbers match the step table", () => {
-    const rows = WORKFLOW_STEPS.build.filter((s) => s.step !== undefined);
-    const byStep = new Map(rows.map((s) => [s.step!, s]));
     // One number per step; only the pairs sharing a step heading share one.
-    const byNumber = new Map<number, string[]>();
-    for (const row of rows)
-      byNumber.set(row.number, [...(byNumber.get(row.number) ?? []), row.step!]);
-    const shared = [...byNumber.values()].filter((s) => s.length > 1).map((s) => s.sort());
-    expect(shared).toEqual([
+    expect(sharedStepNumbers()).toEqual([
       ["build-close-workflow", "build-create-pr"],
       ["build-group-gate", "build-plan-verify"],
       ["build-group-start", "build-plan-execute"],
     ]);
-    for (const line of commandLines(build, "steps finish")) {
-      const step = /--step=([a-z0-9-]+)/.exec(line)?.[1];
-      // The Decision Pause writes its own row under the paused step's number.
-      if (step === "build-decision") continue;
-      const row = byStep.get(step!);
-      expect(row, step).toBeDefined();
-      expect(line, step).toContain(`--number=${row!.number}`);
-      // A number two steps share lets each post under its own title.
-      if (byNumber.get(row!.number)!.length === 1) {
-        const title = row!.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
-        expect(line, step).toMatch(new RegExp(`--title="?${title}"?(?=\\s)`));
-      }
-    }
+    // Each finish line posts the number and title of its own table row.
+    expect(commentNumberProblems(build)).toEqual([]);
   });

   it("the convert step posts under Plan Convert's number and title", () => {
```
