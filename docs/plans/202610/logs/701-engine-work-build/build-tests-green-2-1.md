Enforced: true
Gaps: 12
Test order only: true

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/701-engine-work-build-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 2 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "tick marks only the named tasks" | recorded 2026-10-27T11:46:57Z | yes | passed |
| 2 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "tick refuses a task in another group" | recorded 2026-10-27T11:47:00Z | yes | passed |
| 2 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "tick refuses a plan with no task blocks" | recorded 2026-10-27T11:47:00Z | yes | passed |
| 2 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "tick narrows the group's gap-free tasks by --tasks" | recorded 2026-10-27T11:47:01Z | yes | passed |
| 2 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "tick is idempotent on an already-ticked task" | recorded 2026-10-27T11:47:02Z | yes | passed |
| 2 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "tick refuses a --tasks value that is not a task number" | recorded 2026-10-27T11:47:02Z | yes | passed |
| 2 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "tick refuses a --plan that is no file" | recorded 2026-10-27T11:47:03Z | yes | passed |
| 2 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "tick leaves every other plan line byte-identical" | recorded 2026-10-27T11:47:03Z | yes | passed |
| 2 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "tick refuses a call with no --group or with neither selector" | recorded 2026-10-27T11:47:04Z | yes | passed |
| 2 | `.bkit/core/engine/commands/conventions.test.ts` "each export a command, and every exported command is in COMMANDS (reachable)" | recorded 2026-10-27T11:47:07Z | no | passed |
| 3 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "open lists tasks with no done line" | recorded 2026-10-27T11:49:25Z | yes | passed |
| 3 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "open sets handover only when a task is open" | recorded 2026-10-27T11:49:26Z | yes | passed |
| 3 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "open refuses a plan with no task blocks" | recorded 2026-10-27T11:49:27Z | yes | passed |

## Gaps

- Task 2 `test-changed` — `.bkit/core/engine/commands/workflow/tasks.test.ts` differs from its red snapshot for "tick marks only the named tasks" (diff below)
- Task 2 `test-changed` — `.bkit/core/engine/commands/workflow/tasks.test.ts` differs from its red snapshot for "tick refuses a task in another group" (diff below)
- Task 2 `test-changed` — `.bkit/core/engine/commands/workflow/tasks.test.ts` differs from its red snapshot for "tick refuses a plan with no task blocks" (diff below)
- Task 2 `test-changed` — `.bkit/core/engine/commands/workflow/tasks.test.ts` differs from its red snapshot for "tick narrows the group's gap-free tasks by --tasks" (diff below)
- Task 2 `test-changed` — `.bkit/core/engine/commands/workflow/tasks.test.ts` differs from its red snapshot for "tick is idempotent on an already-ticked task" (diff below)
- Task 2 `test-changed` — `.bkit/core/engine/commands/workflow/tasks.test.ts` differs from its red snapshot for "tick refuses a --tasks value that is not a task number" (diff below)
- Task 2 `test-changed` — `.bkit/core/engine/commands/workflow/tasks.test.ts` differs from its red snapshot for "tick refuses a --plan that is no file" (diff below)
- Task 2 `test-changed` — `.bkit/core/engine/commands/workflow/tasks.test.ts` differs from its red snapshot for "tick leaves every other plan line byte-identical" (diff below)
- Task 2 `test-changed` — `.bkit/core/engine/commands/workflow/tasks.test.ts` differs from its red snapshot for "tick refuses a call with no --group or with neither selector" (diff below)
- Task 3 `test-changed` — `.bkit/core/engine/commands/workflow/tasks.test.ts` differs from its red snapshot for "open lists tasks with no done line" (diff below)
- Task 3 `test-changed` — `.bkit/core/engine/commands/workflow/tasks.test.ts` differs from its red snapshot for "open sets handover only when a task is open" (diff below)
- Task 3 `test-changed` — `.bkit/core/engine/commands/workflow/tasks.test.ts` differs from its red snapshot for "open refuses a plan with no task blocks" (diff below)

## Diff since red — Task 2 `.bkit/core/engine/commands/workflow/tasks.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-2-1.snapshot b/.bkit/core/engine/commands/workflow/tasks.test.ts
index c1dbc502c..9bd6ae0ab 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-2-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -57,9 +57,13 @@ const planText = (...groups: string[][]) =>
   ].join("\n");
 
 let cwd = "";
-const write = (name: string, text: string) => {
+/** The test's temp folder, created on first use. */
+const dir = () => {
   if (cwd === "") cwd = tmp();
-  const file = path.join(cwd, name);
+  return cwd;
+};
+const write = (name: string, text: string) => {
+  const file = path.join(dir(), name);
   fs.mkdirSync(path.dirname(file), { recursive: true });
   fs.writeFileSync(file, text);
   return file;
@@ -156,7 +160,7 @@ describe("bkit tasks tick", () => {
   });
 
   it("tick refuses a --plan that is no file", async () => {
-    if (cwd === "") cwd = tmp();
+    dir();
     const r = await run(["tick", "--plan=no-such-plan.md", "--group=1", "--tasks=1"]);
     expect(r.code).toBe(2);
     expect(r.err).toContain("no-such-plan.md");
@@ -170,9 +174,7 @@ describe("bkit tasks tick", () => {
     const after = read(plan).split("\n");
     const before = text.split("\n");
     expect(after).toHaveLength(before.length);
-    expect(after.filter((l, i) => l !== before[i])).toEqual([
-      "- [x] **TASK 2:** Task 2 title.",
-    ]);
+    expect(after.filter((l, i) => l !== before[i])).toEqual(["- [x] **TASK 2:** Task 2 title."]);
   });
 
   it("tick refuses a call with no --group or with neither selector", async () => {
@@ -187,3 +189,45 @@ describe("bkit tasks tick", () => {
     expect(read(plan)).toBe(text);
   });
 });
+
+describe("bkit tasks open", () => {
+  it("open lists tasks with no done line", async () => {
+    const plan = write("open.md", planText(group(1, task(1), task(2), task(3))));
+    const log = write(
+      "open-log.md",
+      [
+        "DONE — TASK 1: First — implemented (a.ts)",
+        "BLOCKED — TASK 2: Second — the migration is missing",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([3]);
+    expect(r.json.handover).toBe(true);
+  });
+
+  it("open sets handover only when a task is open", async () => {
+    const plan = write("open-all.md", planText(group(1, task(1), task(2))));
+    const log = write(
+      "open-all-log.md",
+      [
+        "DONE — TASK 1: First — implemented (a.ts)",
+        "BLOCKED — TASK 2: Second — the migration is missing",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([]);
+    expect(r.json.handover).toBe(false);
+  });
+
+  it("open refuses a plan with no task blocks", async () => {
+    const plan = write("open-plain.md", "# Plan\n\nNo task blocks here.\n");
+    const log = write("open-plain-log.md", "");
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(1);
+    expect(r.err).toMatch(/no task markers/);
+  });
+});
```

## Diff since red — Task 2 `.bkit/core/engine/commands/workflow/tasks.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-2-2.snapshot b/.bkit/core/engine/commands/workflow/tasks.test.ts
index c1dbc502c..9bd6ae0ab 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-2-2.snapshot
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -57,9 +57,13 @@ const planText = (...groups: string[][]) =>
   ].join("\n");
 
 let cwd = "";
-const write = (name: string, text: string) => {
+/** The test's temp folder, created on first use. */
+const dir = () => {
   if (cwd === "") cwd = tmp();
-  const file = path.join(cwd, name);
+  return cwd;
+};
+const write = (name: string, text: string) => {
+  const file = path.join(dir(), name);
   fs.mkdirSync(path.dirname(file), { recursive: true });
   fs.writeFileSync(file, text);
   return file;
@@ -156,7 +160,7 @@ describe("bkit tasks tick", () => {
   });
 
   it("tick refuses a --plan that is no file", async () => {
-    if (cwd === "") cwd = tmp();
+    dir();
     const r = await run(["tick", "--plan=no-such-plan.md", "--group=1", "--tasks=1"]);
     expect(r.code).toBe(2);
     expect(r.err).toContain("no-such-plan.md");
@@ -170,9 +174,7 @@ describe("bkit tasks tick", () => {
     const after = read(plan).split("\n");
     const before = text.split("\n");
     expect(after).toHaveLength(before.length);
-    expect(after.filter((l, i) => l !== before[i])).toEqual([
-      "- [x] **TASK 2:** Task 2 title.",
-    ]);
+    expect(after.filter((l, i) => l !== before[i])).toEqual(["- [x] **TASK 2:** Task 2 title."]);
   });
 
   it("tick refuses a call with no --group or with neither selector", async () => {
@@ -187,3 +189,45 @@ describe("bkit tasks tick", () => {
     expect(read(plan)).toBe(text);
   });
 });
+
+describe("bkit tasks open", () => {
+  it("open lists tasks with no done line", async () => {
+    const plan = write("open.md", planText(group(1, task(1), task(2), task(3))));
+    const log = write(
+      "open-log.md",
+      [
+        "DONE — TASK 1: First — implemented (a.ts)",
+        "BLOCKED — TASK 2: Second — the migration is missing",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([3]);
+    expect(r.json.handover).toBe(true);
+  });
+
+  it("open sets handover only when a task is open", async () => {
+    const plan = write("open-all.md", planText(group(1, task(1), task(2))));
+    const log = write(
+      "open-all-log.md",
+      [
+        "DONE — TASK 1: First — implemented (a.ts)",
+        "BLOCKED — TASK 2: Second — the migration is missing",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([]);
+    expect(r.json.handover).toBe(false);
+  });
+
+  it("open refuses a plan with no task blocks", async () => {
+    const plan = write("open-plain.md", "# Plan\n\nNo task blocks here.\n");
+    const log = write("open-plain-log.md", "");
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(1);
+    expect(r.err).toMatch(/no task markers/);
+  });
+});
```

## Diff since red — Task 2 `.bkit/core/engine/commands/workflow/tasks.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-2-3.snapshot b/.bkit/core/engine/commands/workflow/tasks.test.ts
index c1dbc502c..9bd6ae0ab 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-2-3.snapshot
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -57,9 +57,13 @@ const planText = (...groups: string[][]) =>
   ].join("\n");
 
 let cwd = "";
-const write = (name: string, text: string) => {
+/** The test's temp folder, created on first use. */
+const dir = () => {
   if (cwd === "") cwd = tmp();
-  const file = path.join(cwd, name);
+  return cwd;
+};
+const write = (name: string, text: string) => {
+  const file = path.join(dir(), name);
   fs.mkdirSync(path.dirname(file), { recursive: true });
   fs.writeFileSync(file, text);
   return file;
@@ -156,7 +160,7 @@ describe("bkit tasks tick", () => {
   });
 
   it("tick refuses a --plan that is no file", async () => {
-    if (cwd === "") cwd = tmp();
+    dir();
     const r = await run(["tick", "--plan=no-such-plan.md", "--group=1", "--tasks=1"]);
     expect(r.code).toBe(2);
     expect(r.err).toContain("no-such-plan.md");
@@ -170,9 +174,7 @@ describe("bkit tasks tick", () => {
     const after = read(plan).split("\n");
     const before = text.split("\n");
     expect(after).toHaveLength(before.length);
-    expect(after.filter((l, i) => l !== before[i])).toEqual([
-      "- [x] **TASK 2:** Task 2 title.",
-    ]);
+    expect(after.filter((l, i) => l !== before[i])).toEqual(["- [x] **TASK 2:** Task 2 title."]);
   });
 
   it("tick refuses a call with no --group or with neither selector", async () => {
@@ -187,3 +189,45 @@ describe("bkit tasks tick", () => {
     expect(read(plan)).toBe(text);
   });
 });
+
+describe("bkit tasks open", () => {
+  it("open lists tasks with no done line", async () => {
+    const plan = write("open.md", planText(group(1, task(1), task(2), task(3))));
+    const log = write(
+      "open-log.md",
+      [
+        "DONE — TASK 1: First — implemented (a.ts)",
+        "BLOCKED — TASK 2: Second — the migration is missing",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([3]);
+    expect(r.json.handover).toBe(true);
+  });
+
+  it("open sets handover only when a task is open", async () => {
+    const plan = write("open-all.md", planText(group(1, task(1), task(2))));
+    const log = write(
+      "open-all-log.md",
+      [
+        "DONE — TASK 1: First — implemented (a.ts)",
+        "BLOCKED — TASK 2: Second — the migration is missing",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([]);
+    expect(r.json.handover).toBe(false);
+  });
+
+  it("open refuses a plan with no task blocks", async () => {
+    const plan = write("open-plain.md", "# Plan\n\nNo task blocks here.\n");
+    const log = write("open-plain-log.md", "");
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(1);
+    expect(r.err).toMatch(/no task markers/);
+  });
+});
```

## Diff since red — Task 2 `.bkit/core/engine/commands/workflow/tasks.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-2-4.snapshot b/.bkit/core/engine/commands/workflow/tasks.test.ts
index c1dbc502c..9bd6ae0ab 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-2-4.snapshot
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -57,9 +57,13 @@ const planText = (...groups: string[][]) =>
   ].join("\n");
 
 let cwd = "";
-const write = (name: string, text: string) => {
+/** The test's temp folder, created on first use. */
+const dir = () => {
   if (cwd === "") cwd = tmp();
-  const file = path.join(cwd, name);
+  return cwd;
+};
+const write = (name: string, text: string) => {
+  const file = path.join(dir(), name);
   fs.mkdirSync(path.dirname(file), { recursive: true });
   fs.writeFileSync(file, text);
   return file;
@@ -156,7 +160,7 @@ describe("bkit tasks tick", () => {
   });
 
   it("tick refuses a --plan that is no file", async () => {
-    if (cwd === "") cwd = tmp();
+    dir();
     const r = await run(["tick", "--plan=no-such-plan.md", "--group=1", "--tasks=1"]);
     expect(r.code).toBe(2);
     expect(r.err).toContain("no-such-plan.md");
@@ -170,9 +174,7 @@ describe("bkit tasks tick", () => {
     const after = read(plan).split("\n");
     const before = text.split("\n");
     expect(after).toHaveLength(before.length);
-    expect(after.filter((l, i) => l !== before[i])).toEqual([
-      "- [x] **TASK 2:** Task 2 title.",
-    ]);
+    expect(after.filter((l, i) => l !== before[i])).toEqual(["- [x] **TASK 2:** Task 2 title."]);
   });
 
   it("tick refuses a call with no --group or with neither selector", async () => {
@@ -187,3 +189,45 @@ describe("bkit tasks tick", () => {
     expect(read(plan)).toBe(text);
   });
 });
+
+describe("bkit tasks open", () => {
+  it("open lists tasks with no done line", async () => {
+    const plan = write("open.md", planText(group(1, task(1), task(2), task(3))));
+    const log = write(
+      "open-log.md",
+      [
+        "DONE — TASK 1: First — implemented (a.ts)",
+        "BLOCKED — TASK 2: Second — the migration is missing",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([3]);
+    expect(r.json.handover).toBe(true);
+  });
+
+  it("open sets handover only when a task is open", async () => {
+    const plan = write("open-all.md", planText(group(1, task(1), task(2))));
+    const log = write(
+      "open-all-log.md",
+      [
+        "DONE — TASK 1: First — implemented (a.ts)",
+        "BLOCKED — TASK 2: Second — the migration is missing",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([]);
+    expect(r.json.handover).toBe(false);
+  });
+
+  it("open refuses a plan with no task blocks", async () => {
+    const plan = write("open-plain.md", "# Plan\n\nNo task blocks here.\n");
+    const log = write("open-plain-log.md", "");
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(1);
+    expect(r.err).toMatch(/no task markers/);
+  });
+});
```

## Diff since red — Task 2 `.bkit/core/engine/commands/workflow/tasks.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-2-5.snapshot b/.bkit/core/engine/commands/workflow/tasks.test.ts
index c1dbc502c..9bd6ae0ab 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-2-5.snapshot
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -57,9 +57,13 @@ const planText = (...groups: string[][]) =>
   ].join("\n");
 
 let cwd = "";
-const write = (name: string, text: string) => {
+/** The test's temp folder, created on first use. */
+const dir = () => {
   if (cwd === "") cwd = tmp();
-  const file = path.join(cwd, name);
+  return cwd;
+};
+const write = (name: string, text: string) => {
+  const file = path.join(dir(), name);
   fs.mkdirSync(path.dirname(file), { recursive: true });
   fs.writeFileSync(file, text);
   return file;
@@ -156,7 +160,7 @@ describe("bkit tasks tick", () => {
   });
 
   it("tick refuses a --plan that is no file", async () => {
-    if (cwd === "") cwd = tmp();
+    dir();
     const r = await run(["tick", "--plan=no-such-plan.md", "--group=1", "--tasks=1"]);
     expect(r.code).toBe(2);
     expect(r.err).toContain("no-such-plan.md");
@@ -170,9 +174,7 @@ describe("bkit tasks tick", () => {
     const after = read(plan).split("\n");
     const before = text.split("\n");
     expect(after).toHaveLength(before.length);
-    expect(after.filter((l, i) => l !== before[i])).toEqual([
-      "- [x] **TASK 2:** Task 2 title.",
-    ]);
+    expect(after.filter((l, i) => l !== before[i])).toEqual(["- [x] **TASK 2:** Task 2 title."]);
   });
 
   it("tick refuses a call with no --group or with neither selector", async () => {
@@ -187,3 +189,45 @@ describe("bkit tasks tick", () => {
     expect(read(plan)).toBe(text);
   });
 });
+
+describe("bkit tasks open", () => {
+  it("open lists tasks with no done line", async () => {
+    const plan = write("open.md", planText(group(1, task(1), task(2), task(3))));
+    const log = write(
+      "open-log.md",
+      [
+        "DONE — TASK 1: First — implemented (a.ts)",
+        "BLOCKED — TASK 2: Second — the migration is missing",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([3]);
+    expect(r.json.handover).toBe(true);
+  });
+
+  it("open sets handover only when a task is open", async () => {
+    const plan = write("open-all.md", planText(group(1, task(1), task(2))));
+    const log = write(
+      "open-all-log.md",
+      [
+        "DONE — TASK 1: First — implemented (a.ts)",
+        "BLOCKED — TASK 2: Second — the migration is missing",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([]);
+    expect(r.json.handover).toBe(false);
+  });
+
+  it("open refuses a plan with no task blocks", async () => {
+    const plan = write("open-plain.md", "# Plan\n\nNo task blocks here.\n");
+    const log = write("open-plain-log.md", "");
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(1);
+    expect(r.err).toMatch(/no task markers/);
+  });
+});
```

## Diff since red — Task 2 `.bkit/core/engine/commands/workflow/tasks.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-2-6.snapshot b/.bkit/core/engine/commands/workflow/tasks.test.ts
index c1dbc502c..9bd6ae0ab 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-2-6.snapshot
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -57,9 +57,13 @@ const planText = (...groups: string[][]) =>
   ].join("\n");
 
 let cwd = "";
-const write = (name: string, text: string) => {
+/** The test's temp folder, created on first use. */
+const dir = () => {
   if (cwd === "") cwd = tmp();
-  const file = path.join(cwd, name);
+  return cwd;
+};
+const write = (name: string, text: string) => {
+  const file = path.join(dir(), name);
   fs.mkdirSync(path.dirname(file), { recursive: true });
   fs.writeFileSync(file, text);
   return file;
@@ -156,7 +160,7 @@ describe("bkit tasks tick", () => {
   });
 
   it("tick refuses a --plan that is no file", async () => {
-    if (cwd === "") cwd = tmp();
+    dir();
     const r = await run(["tick", "--plan=no-such-plan.md", "--group=1", "--tasks=1"]);
     expect(r.code).toBe(2);
     expect(r.err).toContain("no-such-plan.md");
@@ -170,9 +174,7 @@ describe("bkit tasks tick", () => {
     const after = read(plan).split("\n");
     const before = text.split("\n");
     expect(after).toHaveLength(before.length);
-    expect(after.filter((l, i) => l !== before[i])).toEqual([
-      "- [x] **TASK 2:** Task 2 title.",
-    ]);
+    expect(after.filter((l, i) => l !== before[i])).toEqual(["- [x] **TASK 2:** Task 2 title."]);
   });
 
   it("tick refuses a call with no --group or with neither selector", async () => {
@@ -187,3 +189,45 @@ describe("bkit tasks tick", () => {
     expect(read(plan)).toBe(text);
   });
 });
+
+describe("bkit tasks open", () => {
+  it("open lists tasks with no done line", async () => {
+    const plan = write("open.md", planText(group(1, task(1), task(2), task(3))));
+    const log = write(
+      "open-log.md",
+      [
+        "DONE — TASK 1: First — implemented (a.ts)",
+        "BLOCKED — TASK 2: Second — the migration is missing",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([3]);
+    expect(r.json.handover).toBe(true);
+  });
+
+  it("open sets handover only when a task is open", async () => {
+    const plan = write("open-all.md", planText(group(1, task(1), task(2))));
+    const log = write(
+      "open-all-log.md",
+      [
+        "DONE — TASK 1: First — implemented (a.ts)",
+        "BLOCKED — TASK 2: Second — the migration is missing",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([]);
+    expect(r.json.handover).toBe(false);
+  });
+
+  it("open refuses a plan with no task blocks", async () => {
+    const plan = write("open-plain.md", "# Plan\n\nNo task blocks here.\n");
+    const log = write("open-plain-log.md", "");
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(1);
+    expect(r.err).toMatch(/no task markers/);
+  });
+});
```

## Diff since red — Task 2 `.bkit/core/engine/commands/workflow/tasks.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-2-7.snapshot b/.bkit/core/engine/commands/workflow/tasks.test.ts
index c1dbc502c..9bd6ae0ab 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-2-7.snapshot
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -57,9 +57,13 @@ const planText = (...groups: string[][]) =>
   ].join("\n");
 
 let cwd = "";
-const write = (name: string, text: string) => {
+/** The test's temp folder, created on first use. */
+const dir = () => {
   if (cwd === "") cwd = tmp();
-  const file = path.join(cwd, name);
+  return cwd;
+};
+const write = (name: string, text: string) => {
+  const file = path.join(dir(), name);
   fs.mkdirSync(path.dirname(file), { recursive: true });
   fs.writeFileSync(file, text);
   return file;
@@ -156,7 +160,7 @@ describe("bkit tasks tick", () => {
   });
 
   it("tick refuses a --plan that is no file", async () => {
-    if (cwd === "") cwd = tmp();
+    dir();
     const r = await run(["tick", "--plan=no-such-plan.md", "--group=1", "--tasks=1"]);
     expect(r.code).toBe(2);
     expect(r.err).toContain("no-such-plan.md");
@@ -170,9 +174,7 @@ describe("bkit tasks tick", () => {
     const after = read(plan).split("\n");
     const before = text.split("\n");
     expect(after).toHaveLength(before.length);
-    expect(after.filter((l, i) => l !== before[i])).toEqual([
-      "- [x] **TASK 2:** Task 2 title.",
-    ]);
+    expect(after.filter((l, i) => l !== before[i])).toEqual(["- [x] **TASK 2:** Task 2 title."]);
   });
 
   it("tick refuses a call with no --group or with neither selector", async () => {
@@ -187,3 +189,45 @@ describe("bkit tasks tick", () => {
     expect(read(plan)).toBe(text);
   });
 });
+
+describe("bkit tasks open", () => {
+  it("open lists tasks with no done line", async () => {
+    const plan = write("open.md", planText(group(1, task(1), task(2), task(3))));
+    const log = write(
+      "open-log.md",
+      [
+        "DONE — TASK 1: First — implemented (a.ts)",
+        "BLOCKED — TASK 2: Second — the migration is missing",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([3]);
+    expect(r.json.handover).toBe(true);
+  });
+
+  it("open sets handover only when a task is open", async () => {
+    const plan = write("open-all.md", planText(group(1, task(1), task(2))));
+    const log = write(
+      "open-all-log.md",
+      [
+        "DONE — TASK 1: First — implemented (a.ts)",
+        "BLOCKED — TASK 2: Second — the migration is missing",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([]);
+    expect(r.json.handover).toBe(false);
+  });
+
+  it("open refuses a plan with no task blocks", async () => {
+    const plan = write("open-plain.md", "# Plan\n\nNo task blocks here.\n");
+    const log = write("open-plain-log.md", "");
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(1);
+    expect(r.err).toMatch(/no task markers/);
+  });
+});
```

## Diff since red — Task 2 `.bkit/core/engine/commands/workflow/tasks.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-2-8.snapshot b/.bkit/core/engine/commands/workflow/tasks.test.ts
index c1dbc502c..9bd6ae0ab 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-2-8.snapshot
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -57,9 +57,13 @@ const planText = (...groups: string[][]) =>
   ].join("\n");
 
 let cwd = "";
-const write = (name: string, text: string) => {
+/** The test's temp folder, created on first use. */
+const dir = () => {
   if (cwd === "") cwd = tmp();
-  const file = path.join(cwd, name);
+  return cwd;
+};
+const write = (name: string, text: string) => {
+  const file = path.join(dir(), name);
   fs.mkdirSync(path.dirname(file), { recursive: true });
   fs.writeFileSync(file, text);
   return file;
@@ -156,7 +160,7 @@ describe("bkit tasks tick", () => {
   });
 
   it("tick refuses a --plan that is no file", async () => {
-    if (cwd === "") cwd = tmp();
+    dir();
     const r = await run(["tick", "--plan=no-such-plan.md", "--group=1", "--tasks=1"]);
     expect(r.code).toBe(2);
     expect(r.err).toContain("no-such-plan.md");
@@ -170,9 +174,7 @@ describe("bkit tasks tick", () => {
     const after = read(plan).split("\n");
     const before = text.split("\n");
     expect(after).toHaveLength(before.length);
-    expect(after.filter((l, i) => l !== before[i])).toEqual([
-      "- [x] **TASK 2:** Task 2 title.",
-    ]);
+    expect(after.filter((l, i) => l !== before[i])).toEqual(["- [x] **TASK 2:** Task 2 title."]);
   });
 
   it("tick refuses a call with no --group or with neither selector", async () => {
@@ -187,3 +189,45 @@ describe("bkit tasks tick", () => {
     expect(read(plan)).toBe(text);
   });
 });
+
+describe("bkit tasks open", () => {
+  it("open lists tasks with no done line", async () => {
+    const plan = write("open.md", planText(group(1, task(1), task(2), task(3))));
+    const log = write(
+      "open-log.md",
+      [
+        "DONE — TASK 1: First — implemented (a.ts)",
+        "BLOCKED — TASK 2: Second — the migration is missing",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([3]);
+    expect(r.json.handover).toBe(true);
+  });
+
+  it("open sets handover only when a task is open", async () => {
+    const plan = write("open-all.md", planText(group(1, task(1), task(2))));
+    const log = write(
+      "open-all-log.md",
+      [
+        "DONE — TASK 1: First — implemented (a.ts)",
+        "BLOCKED — TASK 2: Second — the migration is missing",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([]);
+    expect(r.json.handover).toBe(false);
+  });
+
+  it("open refuses a plan with no task blocks", async () => {
+    const plan = write("open-plain.md", "# Plan\n\nNo task blocks here.\n");
+    const log = write("open-plain-log.md", "");
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(1);
+    expect(r.err).toMatch(/no task markers/);
+  });
+});
```

## Diff since red — Task 2 `.bkit/core/engine/commands/workflow/tasks.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-2-9.snapshot b/.bkit/core/engine/commands/workflow/tasks.test.ts
index c1dbc502c..9bd6ae0ab 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-2-9.snapshot
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -57,9 +57,13 @@ const planText = (...groups: string[][]) =>
   ].join("\n");
 
 let cwd = "";
-const write = (name: string, text: string) => {
+/** The test's temp folder, created on first use. */
+const dir = () => {
   if (cwd === "") cwd = tmp();
-  const file = path.join(cwd, name);
+  return cwd;
+};
+const write = (name: string, text: string) => {
+  const file = path.join(dir(), name);
   fs.mkdirSync(path.dirname(file), { recursive: true });
   fs.writeFileSync(file, text);
   return file;
@@ -156,7 +160,7 @@ describe("bkit tasks tick", () => {
   });
 
   it("tick refuses a --plan that is no file", async () => {
-    if (cwd === "") cwd = tmp();
+    dir();
     const r = await run(["tick", "--plan=no-such-plan.md", "--group=1", "--tasks=1"]);
     expect(r.code).toBe(2);
     expect(r.err).toContain("no-such-plan.md");
@@ -170,9 +174,7 @@ describe("bkit tasks tick", () => {
     const after = read(plan).split("\n");
     const before = text.split("\n");
     expect(after).toHaveLength(before.length);
-    expect(after.filter((l, i) => l !== before[i])).toEqual([
-      "- [x] **TASK 2:** Task 2 title.",
-    ]);
+    expect(after.filter((l, i) => l !== before[i])).toEqual(["- [x] **TASK 2:** Task 2 title."]);
   });
 
   it("tick refuses a call with no --group or with neither selector", async () => {
@@ -187,3 +189,45 @@ describe("bkit tasks tick", () => {
     expect(read(plan)).toBe(text);
   });
 });
+
+describe("bkit tasks open", () => {
+  it("open lists tasks with no done line", async () => {
+    const plan = write("open.md", planText(group(1, task(1), task(2), task(3))));
+    const log = write(
+      "open-log.md",
+      [
+        "DONE — TASK 1: First — implemented (a.ts)",
+        "BLOCKED — TASK 2: Second — the migration is missing",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([3]);
+    expect(r.json.handover).toBe(true);
+  });
+
+  it("open sets handover only when a task is open", async () => {
+    const plan = write("open-all.md", planText(group(1, task(1), task(2))));
+    const log = write(
+      "open-all-log.md",
+      [
+        "DONE — TASK 1: First — implemented (a.ts)",
+        "BLOCKED — TASK 2: Second — the migration is missing",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([]);
+    expect(r.json.handover).toBe(false);
+  });
+
+  it("open refuses a plan with no task blocks", async () => {
+    const plan = write("open-plain.md", "# Plan\n\nNo task blocks here.\n");
+    const log = write("open-plain-log.md", "");
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(1);
+    expect(r.err).toMatch(/no task markers/);
+  });
+});
```

## Diff since red — Task 3 `.bkit/core/engine/commands/workflow/tasks.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-3-1.snapshot b/.bkit/core/engine/commands/workflow/tasks.test.ts
index e61682292..9bd6ae0ab 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-3-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -57,9 +57,13 @@ const planText = (...groups: string[][]) =>
   ].join("\n");
 
 let cwd = "";
-const write = (name: string, text: string) => {
+/** The test's temp folder, created on first use. */
+const dir = () => {
   if (cwd === "") cwd = tmp();
-  const file = path.join(cwd, name);
+  return cwd;
+};
+const write = (name: string, text: string) => {
+  const file = path.join(dir(), name);
   fs.mkdirSync(path.dirname(file), { recursive: true });
   fs.writeFileSync(file, text);
   return file;
@@ -156,7 +160,7 @@ describe("bkit tasks tick", () => {
   });
 
   it("tick refuses a --plan that is no file", async () => {
-    if (cwd === "") cwd = tmp();
+    dir();
     const r = await run(["tick", "--plan=no-such-plan.md", "--group=1", "--tasks=1"]);
     expect(r.code).toBe(2);
     expect(r.err).toContain("no-such-plan.md");
@@ -170,9 +174,7 @@ describe("bkit tasks tick", () => {
     const after = read(plan).split("\n");
     const before = text.split("\n");
     expect(after).toHaveLength(before.length);
-    expect(after.filter((l, i) => l !== before[i])).toEqual([
-      "- [x] **TASK 2:** Task 2 title.",
-    ]);
+    expect(after.filter((l, i) => l !== before[i])).toEqual(["- [x] **TASK 2:** Task 2 title."]);
   });
 
   it("tick refuses a call with no --group or with neither selector", async () => {
```

## Diff since red — Task 3 `.bkit/core/engine/commands/workflow/tasks.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-3-2.snapshot b/.bkit/core/engine/commands/workflow/tasks.test.ts
index e61682292..9bd6ae0ab 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-3-2.snapshot
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -57,9 +57,13 @@ const planText = (...groups: string[][]) =>
   ].join("\n");
 
 let cwd = "";
-const write = (name: string, text: string) => {
+/** The test's temp folder, created on first use. */
+const dir = () => {
   if (cwd === "") cwd = tmp();
-  const file = path.join(cwd, name);
+  return cwd;
+};
+const write = (name: string, text: string) => {
+  const file = path.join(dir(), name);
   fs.mkdirSync(path.dirname(file), { recursive: true });
   fs.writeFileSync(file, text);
   return file;
@@ -156,7 +160,7 @@ describe("bkit tasks tick", () => {
   });
 
   it("tick refuses a --plan that is no file", async () => {
-    if (cwd === "") cwd = tmp();
+    dir();
     const r = await run(["tick", "--plan=no-such-plan.md", "--group=1", "--tasks=1"]);
     expect(r.code).toBe(2);
     expect(r.err).toContain("no-such-plan.md");
@@ -170,9 +174,7 @@ describe("bkit tasks tick", () => {
     const after = read(plan).split("\n");
     const before = text.split("\n");
     expect(after).toHaveLength(before.length);
-    expect(after.filter((l, i) => l !== before[i])).toEqual([
-      "- [x] **TASK 2:** Task 2 title.",
-    ]);
+    expect(after.filter((l, i) => l !== before[i])).toEqual(["- [x] **TASK 2:** Task 2 title."]);
   });
 
   it("tick refuses a call with no --group or with neither selector", async () => {
```

## Diff since red — Task 3 `.bkit/core/engine/commands/workflow/tasks.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-3-3.snapshot b/.bkit/core/engine/commands/workflow/tasks.test.ts
index e61682292..9bd6ae0ab 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-2-3-3.snapshot
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -57,9 +57,13 @@ const planText = (...groups: string[][]) =>
   ].join("\n");
 
 let cwd = "";
-const write = (name: string, text: string) => {
+/** The test's temp folder, created on first use. */
+const dir = () => {
   if (cwd === "") cwd = tmp();
-  const file = path.join(cwd, name);
+  return cwd;
+};
+const write = (name: string, text: string) => {
+  const file = path.join(dir(), name);
   fs.mkdirSync(path.dirname(file), { recursive: true });
   fs.writeFileSync(file, text);
   return file;
@@ -156,7 +160,7 @@ describe("bkit tasks tick", () => {
   });
 
   it("tick refuses a --plan that is no file", async () => {
-    if (cwd === "") cwd = tmp();
+    dir();
     const r = await run(["tick", "--plan=no-such-plan.md", "--group=1", "--tasks=1"]);
     expect(r.code).toBe(2);
     expect(r.err).toContain("no-such-plan.md");
@@ -170,9 +174,7 @@ describe("bkit tasks tick", () => {
     const after = read(plan).split("\n");
     const before = text.split("\n");
     expect(after).toHaveLength(before.length);
-    expect(after.filter((l, i) => l !== before[i])).toEqual([
-      "- [x] **TASK 2:** Task 2 title.",
-    ]);
+    expect(after.filter((l, i) => l !== before[i])).toEqual(["- [x] **TASK 2:** Task 2 title."]);
   });
 
   it("tick refuses a call with no --group or with neither selector", async () => {
```
