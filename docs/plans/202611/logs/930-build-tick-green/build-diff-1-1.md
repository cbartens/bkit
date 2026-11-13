diff --git a/.bkit/core/engine/commands/workflow/tasks.test.ts b/.bkit/core/engine/commands/workflow/tasks.test.ts
index 4418cf97e..272d111ea 100644
--- a/.bkit/core/engine/commands/workflow/tasks.test.ts
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -183,6 +183,67 @@ describe("bkit tasks tick", () => {
     expect(tickOf(read(plan), 2)).toBe(" ");
   });
 
+  it("ticks a task listed only under Updated tests", async () => {
+    const plan = write("updated-tests.md", planText(group(1, task(8), task(9))));
+    const green = write(
+      "green-updated.md",
+      [
+        "Enforced: true",
+        "Verdict: PASS",
+        "Gaps: 0",
+        "",
+        "<!-- verdict:end -->",
+        "",
+        "## Gaps",
+        "",
+        "None.",
+        "",
+        "## Updated tests",
+        "",
+        "- Task 9 `updated` — `.bkit/x.test.ts` `a` changed",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=8,9", `--green=${green}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.ticked).toEqual([8, 9]);
+    expect(tickOf(read(plan), 9)).toBe("x");
+  });
+
+  it("ticks a task listed only under Already landed and skips a Gaps task", async () => {
+    const plan = write("landed.md", planText(group(1, task(7), task(8), task(9))));
+    const green = write(
+      "green-landed.md",
+      [
+        "Enforced: true",
+        "Verdict: CONCERNS",
+        "Gaps: 1",
+        "",
+        "<!-- verdict:end -->",
+        "",
+        "## Already landed",
+        "",
+        "- Task 7 `passes` — `.bkit/x.test.ts` `a` already passes",
+        "",
+        "## Gaps",
+        "",
+        "- Task 9 `not-green` — `.bkit/x.test.ts` `b` does not exist — Fixable: true — log: TASK 9: not-green",
+        "",
+      ].join("\n"),
+    );
+    const r = await run([
+      "tick",
+      `--plan=${plan}`,
+      "--group=1",
+      "--tasks=7,8,9",
+      `--green=${green}`,
+    ]);
+    expect(r.code).toBe(0);
+    expect(r.json.ticked).toEqual([7, 8]);
+    expect(tickOf(read(plan), 7)).toBe("x");
+    expect(tickOf(read(plan), 9)).toBe(" ");
+  });
+
   it("tick is idempotent on an already-ticked task", async () => {
     const plan = write("idempotent.md", planText(group(1, task(1), task(2))));
     const first = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=1,2"]);
diff --git a/.bkit/core/engine/commands/workflow/tasks.ts b/.bkit/core/engine/commands/workflow/tasks.ts
index a69ab3e5b..116a8f8a1 100644
--- a/.bkit/core/engine/commands/workflow/tasks.ts
+++ b/.bkit/core/engine/commands/workflow/tasks.ts
@@ -106,7 +106,12 @@ export function gappedTasks(text: string): number[] {
         .map((g) => (typeof g === "object" && g !== null ? (g as { task?: unknown }).task : null))
         .filter((t): t is number => typeof t === "number");
   }
-  return [...text.matchAll(REPORT_GAP)].map((m) => Number(m[1]));
+  const start = text.search(/^## Gaps\b/m);
+  if (start < 0) return [];
+  const rest = text.slice(start).replace(/^## Gaps[^\n]*\n?/, "");
+  const end = rest.search(/^## /m);
+  const section = end < 0 ? rest : rest.slice(0, end);
+  return [...section.matchAll(REPORT_GAP)].map((m) => Number(m[1]));
 }
 
 /** `task`'s heading line inside its block: its box and number, or null when the block holds none. */
diff --git a/dist/commands/workflow/tasks.js b/dist/commands/workflow/tasks.js
index 37d871131..45832adf2 100644
--- a/dist/commands/workflow/tasks.js
+++ b/dist/commands/workflow/tasks.js
@@ -81,7 +81,13 @@ export function gappedTasks(text) {
                 .map((g) => (typeof g === "object" && g !== null ? g.task : null))
                 .filter((t) => typeof t === "number");
     }
-    return [...text.matchAll(REPORT_GAP)].map((m) => Number(m[1]));
+    const start = text.search(/^## Gaps\b/m);
+    if (start < 0)
+        return [];
+    const rest = text.slice(start).replace(/^## Gaps[^\n]*\n?/, "");
+    const end = rest.search(/^## /m);
+    const section = end < 0 ? rest : rest.slice(0, end);
+    return [...section.matchAll(REPORT_GAP)].map((m) => Number(m[1]));
 }
 /** `task`'s heading line inside its block: its box and number, or null when the block holds none. */
 function headBox(lines, task) {
