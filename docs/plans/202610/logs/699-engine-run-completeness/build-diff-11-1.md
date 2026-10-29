diff --git a/.bkit/core/engine/commands/workflow/completeness.test.ts b/.bkit/core/engine/commands/workflow/completeness.test.ts
index 57a08feed..c9f6bdb78 100644
--- a/.bkit/core/engine/commands/workflow/completeness.test.ts
+++ b/.bkit/core/engine/commands/workflow/completeness.test.ts
@@ -86,4 +86,39 @@ describe("bkit completeness check", () => {
     expect(noMd.code).toBe(0);
     expect(noMd.json.verdicts).toEqual([]);
   });
+
+  it("a file holding two runs of one workflow is checked per run", async () => {
+    const step = (step: string) => ({
+      type: "step-done",
+      workflow: "build",
+      step,
+      status: "DONE",
+      at: AT,
+      parentSha: SHA,
+      artifacts: [],
+    });
+    const rows = [
+      { type: "workflow-started", workflow: "build", at: "2026-10-29T00:00:00.000Z" },
+      { ...step("build-worktree-setup"), at: "2026-10-29T00:00:01.000Z" },
+      { type: "workflow-started", workflow: "build", at: "2026-10-29T01:00:00.000Z" },
+      {
+        type: "engine-call",
+        workflow: "build",
+        noun: "status",
+        verb: "path",
+        at: "2026-10-29T01:00:01.000Z",
+      },
+      { ...step("build-close-workflow"), at: "2026-10-29T01:00:02.000Z" },
+    ];
+    const file = path.join(tmp(), "status.jsonl");
+    fs.writeFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
+    const r = await run(["completeness", "check", `--file=${file}`, "--workflow=build"]);
+    expect(r.json.verdicts).toHaveLength(2);
+    expect(r.json.verdicts[0].preJournal).toBe(true);
+    expect(r.json.verdicts[0].evidenceHoles).toEqual([]);
+    expect(r.json.verdicts[1].preJournal).toBe(false);
+    expect(r.json.verdicts[1].evidenceHoles.map((h: { step: string }) => h.step)).not.toContain(
+      "build-worktree-setup",
+    );
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/completeness.ts b/.bkit/core/engine/commands/workflow/completeness.ts
index b95ff28a7..7efed9ad1 100644
--- a/.bkit/core/engine/commands/workflow/completeness.ts
+++ b/.bkit/core/engine/commands/workflow/completeness.ts
@@ -9,6 +9,7 @@ import {
   parseRows,
   readCompleteness,
   type CompletenessVerdict,
+  type StatusRow,
 } from "../../checks/status-holes.js";
 import { getWorkflowsRoot } from "../../shared/package-roots.js";
 import { EXIT, type CommandSpec } from "../lib.js";
@@ -26,6 +27,21 @@ const readText = (file: string, log: (message: string) => void): string | null =
   }
 };
 
+/** `workflow`'s rows split into runs: each `workflow-started` opens a run that ends at the next one; rows before the first start form their own run. */
+function runsOf(rows: StatusRow[], workflow: string): StatusRow[][] {
+  const at = (r: StatusRow) => (typeof r["at"] === "string" ? r["at"] : "");
+  const own = rows
+    .filter((r) => r.workflow === workflow)
+    .sort((a, b) => (at(a) < at(b) ? -1 : at(a) > at(b) ? 1 : 0));
+  const runs: StatusRow[][] = [];
+  for (const row of own) {
+    const current = runs.at(-1);
+    if (current === undefined || row.type === "workflow-started") runs.push([row]);
+    else current.push(row);
+  }
+  return runs;
+}
+
 function reportLines(v: CompletenessVerdict): string[] {
   const calls = (list: Array<{ noun: string; verb: string }>) =>
     list.map((c) => `${c.noun} ${c.verb}`).join(", ");
@@ -82,9 +98,12 @@ export const completenessCommand: CommandSpec = {
             continue;
           }
           try {
-            const { verdict } = readCompleteness(rows, deriveContract(md, workflow, tracker));
-            verdicts.push(verdict);
-            lines.push(...reportLines(verdict));
+            const contract = deriveContract(md, workflow, tracker);
+            for (const run of runsOf(rows, workflow)) {
+              const { verdict } = readCompleteness(run, contract);
+              verdicts.push(verdict);
+              lines.push(...reportLines(verdict));
+            }
           } catch (err) {
             ctx.log(
               `${TAG} ${workflow}: ${err instanceof Error ? err.message : String(err)} — no verdict (advisory)`,
diff --git a/dist/commands/workflow/completeness.js b/dist/commands/workflow/completeness.js
index d9868c385..aa63f667c 100644
--- a/dist/commands/workflow/completeness.js
+++ b/dist/commands/workflow/completeness.js
@@ -16,6 +16,22 @@ const readText = (file, log) => {
         return null;
     }
 };
+/** `workflow`'s rows split into runs: each `workflow-started` opens a run that ends at the next one; rows before the first start form their own run. */
+function runsOf(rows, workflow) {
+    const at = (r) => (typeof r["at"] === "string" ? r["at"] : "");
+    const own = rows
+        .filter((r) => r.workflow === workflow)
+        .sort((a, b) => (at(a) < at(b) ? -1 : at(a) > at(b) ? 1 : 0));
+    const runs = [];
+    for (const row of own) {
+        const current = runs.at(-1);
+        if (current === undefined || row.type === "workflow-started")
+            runs.push([row]);
+        else
+            current.push(row);
+    }
+    return runs;
+}
 function reportLines(v) {
     const calls = (list) => list.map((c) => `${c.noun} ${c.verb}`).join(", ");
     const lines = [
@@ -71,9 +87,12 @@ export const completenessCommand = {
                         continue;
                     }
                     try {
-                        const { verdict } = readCompleteness(rows, deriveContract(md, workflow, tracker));
-                        verdicts.push(verdict);
-                        lines.push(...reportLines(verdict));
+                        const contract = deriveContract(md, workflow, tracker);
+                        for (const run of runsOf(rows, workflow)) {
+                            const { verdict } = readCompleteness(run, contract);
+                            verdicts.push(verdict);
+                            lines.push(...reportLines(verdict));
+                        }
                     }
                     catch (err) {
                         ctx.log(`${TAG} ${workflow}: ${err instanceof Error ? err.message : String(err)} — no verdict (advisory)`);
