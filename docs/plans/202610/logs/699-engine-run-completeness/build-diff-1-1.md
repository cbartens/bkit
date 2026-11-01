diff --git a/.bkit/core/engine/commands/workflow/run-facts.test.ts b/.bkit/core/engine/commands/workflow/run-facts.test.ts
index 74072025d..ccc93b98d 100644
--- a/.bkit/core/engine/commands/workflow/run-facts.test.ts
+++ b/.bkit/core/engine/commands/workflow/run-facts.test.ts
@@ -221,6 +221,18 @@ describe("runStatusRows / stepsBlock / ciList", () => {
     expect(totalsProblem({ steps })).toBeUndefined();
   });
 
+  it("leaves a run's step minutes unchanged when journal rows land between step rows", () => {
+    const plain = [started(0), step(1, "build-a"), step(4, "build-b")];
+    const journaled = [
+      started(0),
+      step(1, "build-a"),
+      { type: "engine-call", workflow: "build", at: at(2), noun: "steps", verb: "finish" } as Row,
+      { type: "completeness", workflow: "build", at: at(3), verdict: "complete" } as Row,
+      step(4, "build-b"),
+    ];
+    expect(stepsBlock(journaled)).toEqual(stepsBlock(plain));
+  });
+
   it("is empty when the run has only its start row", () => {
     expect(stepsBlock([started(0)])).toEqual({ total: { n: 0, totalMinutes: 0 }, byStep: {} });
   });
diff --git a/.bkit/core/engine/commands/workflow/run-facts.ts b/.bkit/core/engine/commands/workflow/run-facts.ts
index c40e75ddf..12b7848fd 100644
--- a/.bkit/core/engine/commands/workflow/run-facts.ts
+++ b/.bkit/core/engine/commands/workflow/run-facts.ts
@@ -351,7 +351,13 @@ export const chatFingerprint = (platform: string, id: string) =>
   `fp:${createHash("sha256").update(`${platform}:${id}`).digest("hex").slice(0, 12)}`;
 
 /** Status rows that mark a moment rather than the end of a piece of work: step minutes skip them. */
-export const MARK_ROWS: ReadonlySet<string> = new Set(["session", "owner-pause", "owner-answer"]);
+export const MARK_ROWS: ReadonlySet<string> = new Set([
+  "session",
+  "owner-pause",
+  "owner-answer",
+  "engine-call",
+  "completeness",
+]);
 
 /** The `session` fingerprints on the run's status rows, in row order, each once. */
 export function runChats(rows: Row[]): string[] {
diff --git a/.bkit/core/engine/commands/workflow/status.test.ts b/.bkit/core/engine/commands/workflow/status.test.ts
index 8e8cf6699..5c7bea148 100644
--- a/.bkit/core/engine/commands/workflow/status.test.ts
+++ b/.bkit/core/engine/commands/workflow/status.test.ts
@@ -7,7 +7,8 @@ import { afterEach, describe, expect, it } from "vitest";
 
 import { CommandError, runCommand } from "../lib";
 import { COMMANDS } from "../registry";
-import { readRuns } from "./status";
+import { runStatusRows, stepsBlock } from "./run-facts";
+import { readRuns, readStatusEvents, readStatusRows } from "./status";
 
 const dirs: string[] = [];
 afterEach(() => {
@@ -85,6 +86,39 @@ describe("the status fold", () => {
     expect(runs[0]!.steps.map((s) => s.step)).toEqual(["build-plan-verify"]);
   });
 
+  it("ignores a row type it does not know", () => {
+    const rows = [
+      started("build", "2026-10-01T00:00:00Z"),
+      done("build", "build-a", "2026-10-01T00:01:00Z"),
+      {
+        type: "engine-call",
+        workflow: "build",
+        at: "2026-10-01T00:02:00Z",
+        noun: "steps",
+        verb: "finish",
+        flags: [],
+      },
+      { type: "completeness", workflow: "build", at: "2026-10-01T00:03:00Z", verdict: "complete" },
+      { type: "future-row", workflow: "build", at: "2026-10-01T00:04:00Z" },
+      done("build", "build-b", "2026-10-01T00:05:00Z"),
+    ];
+    const file = log(rows);
+    expect(readStatusRows(file)).toHaveLength(rows.length);
+    const runs = readRuns(file);
+    expect(runs).toHaveLength(1);
+    expect(runs[0]!.steps.map((s) => s.step)).toEqual(["build-a", "build-b"]);
+    const kept = runStatusRows(readStatusEvents(file), "build", "2026-10-01T00:00:00Z");
+    expect(kept.map((r) => r.type)).toEqual([
+      "workflow-started",
+      "step-done",
+      "engine-call",
+      "completeness",
+      "future-row",
+      "step-done",
+    ]);
+    expect(stepsBlock(kept).total.n).toBe(2);
+  });
+
   it("refuses a line that is not JSON rather than folding around it (exit 3)", () => {
     const file = log([started("build", "2026-10-01T00:00:00Z")]);
     fs.appendFileSync(file, "{not json\n");
diff --git a/dist/commands/workflow/run-facts.js b/dist/commands/workflow/run-facts.js
index b9bf94c77..714ec9595 100644
--- a/dist/commands/workflow/run-facts.js
+++ b/dist/commands/workflow/run-facts.js
@@ -283,7 +283,13 @@ export function hostChat(env) {
  */
 export const chatFingerprint = (platform, id) => `fp:${createHash("sha256").update(`${platform}:${id}`).digest("hex").slice(0, 12)}`;
 /** Status rows that mark a moment rather than the end of a piece of work: step minutes skip them. */
-export const MARK_ROWS = new Set(["session", "owner-pause", "owner-answer"]);
+export const MARK_ROWS = new Set([
+    "session",
+    "owner-pause",
+    "owner-answer",
+    "engine-call",
+    "completeness",
+]);
 /** The `session` fingerprints on the run's status rows, in row order, each once. */
 export function runChats(rows) {
     const out = [];
diff --git a/scripts/harvest/bkit-harvest.mjs b/scripts/harvest/bkit-harvest.mjs
index 78a0ea255..b8c50f31b 100644
--- a/scripts/harvest/bkit-harvest.mjs
+++ b/scripts/harvest/bkit-harvest.mjs
@@ -1475,7 +1475,13 @@ export function endingOf(run, dir, ordinal) {
  * it that is not one of these. A copy of the engine's `MARK_ROWS`
  * (`.bkit/core/engine/commands/workflow/run-facts.ts`); a test holds the two equal.
  */
-export const MARK_ROWS = new Set(["session", "owner-pause", "owner-answer"]);
+export const MARK_ROWS = new Set([
+  "session",
+  "owner-pause",
+  "owner-answer",
+  "engine-call",
+  "completeness",
+]);
 
 /** A run row's key: `<fid fp>:<workflow>:<start>`. */
 const runKey = (slug, fid, workflow, start) =>
diff --git a/scripts/harvest/bkit-harvest.test.mjs b/scripts/harvest/bkit-harvest.test.mjs
index 44fe3f7ff..b7e67dc9e 100644
--- a/scripts/harvest/bkit-harvest.test.mjs
+++ b/scripts/harvest/bkit-harvest.test.mjs
@@ -2940,7 +2940,8 @@ await test("MARK_ROWS is the engine's", () => {
     "utf8",
   );
   const list = facts.match(/export const MARK_ROWS[^=]*= new Set\((\[[^\]]*\])\)/)?.[1];
-  assert.deepEqual([...MARK_ROWS], JSON.parse(list));
+  assert.deepEqual([...MARK_ROWS], JSON.parse(list.replace(/,\s*\]$/, "]")));
+  for (const t of ["engine-call", "completeness"]) assert.ok(MARK_ROWS.has(t), `${t} is a mark row`);
 });
 
 await test("report shows per-run tokens and owner waits", () => {
