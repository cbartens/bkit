diff --git a/.bkit/core/engine/checks/status-holes.test.ts b/.bkit/core/engine/checks/status-holes.test.ts
index ce648f8de..762167246 100644
--- a/.bkit/core/engine/checks/status-holes.test.ts
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -996,6 +996,40 @@ describe("check — hole classes", () => {
     expect(none.preJournal).toBe(true);
   });
 
+  it("a run whose journal saw only ambient calls reports no evidence hole for steps whose finish call was not journaled", () => {
+    const md = [
+      "## 🧠 Step 1 — Setup",
+      ...fence("tests run --gate=a", FINISH("build-worktree-setup", 1)),
+      "## 🧠 Step 2 — Verify",
+      ...fence("tests run --gate=b", FINISH("build-b", 2)),
+      "## 🧠 Step 3 — Close",
+      ...fence(FINISH("build-close-workflow", 3)),
+    ].join("\n");
+    const contract = deriveContract(md, "build");
+    const ambient = check(
+      [
+        callRow("build", "disk", "prune"),
+        stepRow("build", "build-worktree-setup"),
+        callRow("build", "disk", "prune"),
+        stepRow("build", "build-b"),
+        stepRow("build", "build-close-workflow"),
+      ] as StatusRow[],
+      contract,
+    );
+    expect(ambient.evidenceHoles).toEqual([]);
+    expect(ambient.verdict).toBe("CLEAN");
+    const journaledWriter = check(
+      [
+        callRow("build", "disk", "prune"),
+        callRow("build", "steps", "finish"),
+        stepRow("build", "build-b"),
+        stepRow("build", "build-close-workflow"),
+      ] as StatusRow[],
+      contract,
+    );
+    expect(journaledWriter.evidenceHoles.map((h) => h.step)).toEqual(["build-b"]);
+  });
+
   it("reports a missing required step as a step hole", () => {
     const md = [
       "## 🧠 Step 1 — Start",
diff --git a/.bkit/core/engine/checks/status-holes.ts b/.bkit/core/engine/checks/status-holes.ts
index 6d2fab71c..58b0ce546 100644
--- a/.bkit/core/engine/checks/status-holes.ts
+++ b/.bkit/core/engine/checks/status-holes.ts
@@ -592,6 +592,12 @@ export function check(
     const beforeJournal = firstCall !== -1 && v.rows.every((r) => r < firstCall);
     if (beforeJournal) continue;
     const got = owned.get(v) ?? new Set<string>();
+    // A visit whose own row-writing call (`steps finish` / `steps done`) left no journaled
+    // call is judged on its step row alone: the journal did not see this visit's commands.
+    const isWriter = (k: string): boolean => k === "steps finish" || k === "steps done";
+    if (v.unit.calls.some((c) => !c.branch && isWriter(callKey(c))) && ![...got].some(isWriter)) {
+      continue;
+    }
     const pool = exercised.get(v.unit) ?? new Set<string>();
     for (const k of got) pool.add(k);
     exercised.set(v.unit, pool);
diff --git a/dist/checks/status-holes.js b/dist/checks/status-holes.js
index 4a9494d13..e878a5da6 100644
--- a/dist/checks/status-holes.js
+++ b/dist/checks/status-holes.js
@@ -427,6 +427,12 @@ export function check(rows, contract, options = {}) {
         if (beforeJournal)
             continue;
         const got = owned.get(v) ?? new Set();
+        // A visit whose own row-writing call (`steps finish` / `steps done`) left no journaled
+        // call is judged on its step row alone: the journal did not see this visit's commands.
+        const isWriter = (k) => k === "steps finish" || k === "steps done";
+        if (v.unit.calls.some((c) => !c.branch && isWriter(callKey(c))) && ![...got].some(isWriter)) {
+            continue;
+        }
         const pool = exercised.get(v.unit) ?? new Set();
         for (const k of got)
             pool.add(k);
