diff --git a/.bkit/core/engine/checks/status-holes.test.ts b/.bkit/core/engine/checks/status-holes.test.ts
index 49a2b139a..ce648f8de 100644
--- a/.bkit/core/engine/checks/status-holes.test.ts
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -20,6 +20,7 @@ import * as path from "node:path";
 import { describe, expect, it } from "vitest";
 
 import { WORKFLOW_STEPS } from "../commands/workflow/step-table";
+import { substituteWorkflow } from "../render/trackers";
 import {
   SHIP_STEP_ORDER,
   auditRun,
@@ -907,6 +908,28 @@ describe("check — hole classes", () => {
     });
   };
 
+  /** Rows of a run that journals every unconditional call of the workflow rendered for `none`. */
+  const noneRows = (name: (typeof FLOWS)[number]): StatusRow[] => {
+    const rendered = substituteWorkflow(flowMd(name), "none").output;
+    return contractUnits(deriveContract(rendered, name)).flatMap((u) => {
+      const take = (position: "pre" | "post") =>
+        u.calls
+          .filter((c) => c.position === position)
+          .filter((c) => !c.branch)
+          .filter((c) => `${c.noun} ${c.verb}` !== "workflows start")
+          .map((c) => callRow(name, c.noun, c.verb) as StatusRow);
+      return [...take("pre"), ...u.keys.map((k) => stepRow(name, k) as StatusRow), ...take("post")];
+    });
+  };
+
+  it("a tracker-none run that journals every rendered call is CLEAN", () => {
+    for (const name of ["design", "plan", "debug", "ship"] as const) {
+      const verdict = check(noneRows(name), deriveContract(flowMd(name), name, "none"));
+      expect(verdict.evidenceHoles, name).toEqual([]);
+      expect(verdict.verdict, name).toBe("CLEAN");
+    }
+  });
+
   it("names an evidence hole with its missing calls", () => {
     const md = [
       "## 🧠 Step 1 — Verify",
@@ -944,6 +967,35 @@ describe("check — hole classes", () => {
     expect(whole.verdict).toBe("CLEAN");
   });
 
+  it("a run whose journal starts mid-run reports no evidence hole for steps finished before its first engine-call row", () => {
+    const md = [
+      "## 🧠 Step 1 — Setup",
+      ...fence("tests run --gate=a", FINISH("build-worktree-setup", 1)),
+      "## 🧠 Step 2 — Verify",
+      ...fence("tests run --gate=b", FINISH("build-b", 2)),
+      "## 🧠 Step 3 — Close",
+      ...fence(FINISH("build-close-workflow", 3)),
+    ].join("\n");
+    const contract = deriveContract(md, "build");
+    const midRun = check(
+      [
+        stepRow("build", "build-worktree-setup"),
+        callRow("build", "steps", "finish"),
+        stepRow("build", "build-b"),
+        callRow("build", "steps", "finish"),
+        stepRow("build", "build-close-workflow"),
+      ] as StatusRow[],
+      contract,
+    );
+    expect(midRun.preJournal).toBe(false);
+    expect(midRun.evidenceHoles.map((h) => h.step)).toEqual(["build-b"]);
+    const none = check(
+      [stepRow("build", "build-worktree-setup"), stepRow("build", "build-b")] as StatusRow[],
+      contract,
+    );
+    expect(none.preJournal).toBe(true);
+  });
+
   it("reports a missing required step as a step hole", () => {
     const md = [
       "## 🧠 Step 1 — Start",
diff --git a/.bkit/core/engine/checks/status-holes.ts b/.bkit/core/engine/checks/status-holes.ts
index 11316e26f..6d2fab71c 100644
--- a/.bkit/core/engine/checks/status-holes.ts
+++ b/.bkit/core/engine/checks/status-holes.ts
@@ -29,6 +29,8 @@ import * as path from "node:path";
 import { fileURLToPath } from "node:url";
 
 import { WORKFLOW_STEPS } from "../commands/workflow/step-table.js";
+import type { IssueTracker } from "../install/manifest.js";
+import { substituteWorkflow } from "../render/trackers.js";
 import { parseJson } from "../shared/json.js";
 import { getWorkflowsRoot } from "../shared/package-roots.js";
 
@@ -306,9 +308,16 @@ export function isConditionalSection(body: string): boolean {
  * Derive the contract of one workflow from its markdown: the step sections, the
  * row keys and `"{BKIT}"` calls each holds, and the calls no step owns. The
  * universe is cross-checked against the deduped `WORKFLOW_STEPS[workflow]`; a
- * disagreement is reported as drift, never thrown.
+ * disagreement is reported as drift, never thrown. With a `tracker`, the markdown is
+ * first rendered for it, so a consumer is held to the calls its installed workflow names.
  */
-export function deriveContract(workflowMd: string, workflow: string): Contract {
+export function deriveContract(
+  sourceMd: string,
+  workflow: string,
+  tracker?: IssueTracker,
+): Contract {
+  const workflowMd =
+    tracker === undefined ? sourceMd : substituteWorkflow(sourceMd, tracker).output;
   const sections = stepSections(workflowMd);
   // The journal window runs from the first `workflows start` call to the `workflows close`
   // call: a call written above or below it is matched when journaled, never required.
@@ -499,6 +508,9 @@ export function check(
   });
   const callCount = items.filter((i) => i.kind === "call").length;
   const preJournal = callCount === 0;
+  // A journal that starts mid-run (an engine upgrade, the kill switch lifted) leaves the
+  // visits that finished before its first `engine-call` row with no evidence to judge.
+  const firstCall = items.findIndex((i) => i.kind === "call");
 
   // Visits over the step rows, in order; a row outside the contract closes the current visit.
   const visits: Visit[] = [];
@@ -577,6 +589,8 @@ export function check(
   for (const v of visits) {
     const index = (occurrence.get(v.unit) ?? 0) + 1;
     occurrence.set(v.unit, index);
+    const beforeJournal = firstCall !== -1 && v.rows.every((r) => r < firstCall);
+    if (beforeJournal) continue;
     const got = owned.get(v) ?? new Set<string>();
     const pool = exercised.get(v.unit) ?? new Set<string>();
     for (const k of got) pool.add(k);
diff --git a/.bkit/core/engine/commands/lib.test.ts b/.bkit/core/engine/commands/lib.test.ts
index 7745b0d5f..f10cfc78c 100644
--- a/.bkit/core/engine/commands/lib.test.ts
+++ b/.bkit/core/engine/commands/lib.test.ts
@@ -13,6 +13,7 @@ import {
   ghUnavailable,
   parseFlags,
   repoRoot,
+  resolveActiveRun,
   runCommand,
   runGit,
   runTool,
@@ -746,3 +747,35 @@ describe("runGit / runTool output limit", () => {
     });
   });
 });
+
+describe("resolveActiveRun", () => {
+  const dirs: string[] = [];
+  afterEach(() => {
+    for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
+  });
+
+  function treeWithOneRun(): { cwd: string; status: string } {
+    const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-active-run-")));
+    dirs.push(cwd);
+    spawnSync("git", ["init", "-q"], { cwd });
+    const status = path.join(cwd, "docs/plans/202610/logs/901-x/status.jsonl");
+    fs.mkdirSync(path.dirname(status), { recursive: true });
+    fs.writeFileSync(
+      status,
+      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-29T10:00:00Z" })}\n`,
+    );
+    return { cwd, status };
+  }
+
+  it("resolveActiveRun falls back to the cwd scan when --file names a non-status file", () => {
+    const { cwd, status } = treeWithOneRun();
+    const run = resolveActiveRun({ cwd, file: "docs/plans/202610/x-plan.md" });
+    expect(run).toEqual({ workflow: "build", file: status, bookRoot: cwd });
+  });
+
+  it("still takes a status.jsonl --file as the run itself", () => {
+    const { cwd, status } = treeWithOneRun();
+    const run = resolveActiveRun({ cwd, file: path.relative(cwd, status) });
+    expect(run).toEqual({ workflow: "build", file: status, bookRoot: cwd });
+  });
+});
diff --git a/.bkit/core/engine/commands/lib.ts b/.bkit/core/engine/commands/lib.ts
index 63fc340a7..720ccc183 100644
--- a/.bkit/core/engine/commands/lib.ts
+++ b/.bkit/core/engine/commands/lib.ts
@@ -404,13 +404,14 @@ export function resolveActiveRun(opts: {
   month?: string;
   workflow?: string;
 }): ActiveRun | undefined {
-  if (opts.file !== undefined) {
+  // A `--file` that is a run's `status.jsonl` names that run; any other file (a plan or
+  // design doc) says nothing about the run and falls through to `--fid` and the scan.
+  if (opts.file !== undefined && path.basename(opts.file) === "status.jsonl") {
     const file = path.resolve(opts.cwd, opts.file);
     const workflow = inProgressWorkflow(file);
     const logs = path.dirname(path.dirname(file));
     if (
       workflow === undefined ||
-      path.basename(file) !== "status.jsonl" ||
       path.basename(logs) !== "logs" ||
       path.basename(path.dirname(path.dirname(logs))) !== "plans"
     ) {
diff --git a/.bkit/core/engine/commands/workflow/completeness.ts b/.bkit/core/engine/commands/workflow/completeness.ts
index c9614ec3f..b95ff28a7 100644
--- a/.bkit/core/engine/commands/workflow/completeness.ts
+++ b/.bkit/core/engine/commands/workflow/completeness.ts
@@ -12,6 +12,7 @@ import {
 } from "../../checks/status-holes.js";
 import { getWorkflowsRoot } from "../../shared/package-roots.js";
 import { EXIT, type CommandSpec } from "../lib.js";
+import { readIssueTracker } from "./fids.js";
 import { FILE_FLAG, WORKFLOW_FLAG, statusFile } from "./status.js";
 
 const TAG = "[bkit-status-holes]";
@@ -71,6 +72,7 @@ export const completenessCommand: CommandSpec = {
         const rows = parseRows(text);
         const given = typeof ctx.flags.workflow === "string" ? ctx.flags.workflow : undefined;
         const workflows = given === undefined ? inferWorkflows(rows) : [given];
+        const tracker = readIssueTracker(ctx.cwd);
         const verdicts: CompletenessVerdict[] = [];
         const lines: string[] = [];
         for (const workflow of workflows) {
@@ -80,7 +82,7 @@ export const completenessCommand: CommandSpec = {
             continue;
           }
           try {
-            const { verdict } = readCompleteness(rows, deriveContract(md, workflow));
+            const { verdict } = readCompleteness(rows, deriveContract(md, workflow, tracker));
             verdicts.push(verdict);
             lines.push(...reportLines(verdict));
           } catch (err) {
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 8865a9dbc..dc961047d 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -5,7 +5,9 @@ import * as path from "node:path";
 
 import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
 
+import { contractUnits, deriveContract } from "../../checks/status-holes";
 import { validate } from "../../ledgers/telemetry";
+import { substituteWorkflow } from "../../render/trackers";
 import { runCommand } from "../lib";
 import { tipsText } from "../tips";
 import { newRecord, writeRecord } from "./ledgers";
@@ -53,6 +55,8 @@ afterEach(() => {
   holes.unserialisable = false;
 });
 
+const WORKFLOWS_DIR = path.resolve(__dirname, "../../../workflows");
+
 const dirs: string[] = [];
 afterEach(() => {
   for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
@@ -1066,6 +1070,40 @@ describe("bkit workflows close", () => {
     expect(all[at + 1]).toMatchObject({ type: "workflow-done", workflow: "build" });
   });
 
+  it("close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run", async () => {
+    const cwd = closable("ship");
+    const workflow = "ship";
+    const AT = "2020-01-02T00:00:00Z";
+    const rendered = substituteWorkflow(
+      fs.readFileSync(path.join(WORKFLOWS_DIR, "bkit-ship.md"), "utf-8"),
+      "none",
+    ).output;
+    const replay = contractUnits(deriveContract(rendered, workflow)).flatMap((u) => {
+      const take = (position: "pre" | "post") =>
+        u.calls
+          .filter((c) => c.position === position)
+          .filter((c) => !c.branch)
+          .filter((c) => `${c.noun} ${c.verb}` !== "workflows start")
+          .map((c) => ({
+            type: "engine-call",
+            workflow,
+            at: AT,
+            noun: c.noun,
+            verb: c.verb,
+            flags: [],
+          }));
+      return [
+        ...take("pre"),
+        ...u.keys.map((k) => ({ type: "step-done", workflow, step: k, status: "DONE", at: AT })),
+        ...take("post"),
+      ];
+    });
+    fs.appendFileSync(statusOf(cwd), jsonl(replay));
+    expect((await run(cwd, wf("close", workflow))).code).toBe(0);
+    const stored = rows(statusOf(cwd)).find((x) => x.type === "completeness");
+    expect(stored).toMatchObject({ workflow, holey: false, verdict: "CLEAN" });
+  });
+
   it("prints one telemetry line on stderr when the journal looks dead at close", async () => {
     const cwd = closable("build");
     const r = await run(cwd, wf("close", "build"));
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index 242c0a7f0..34410f885 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -1056,11 +1056,12 @@ function runRowsOf(file: string, workflow: string, startAt?: string, before?: st
     .sort((a, b) => (at(a) < at(b) ? -1 : at(a) > at(b) ? 1 : 0));
 }
 
-/** The contract of `workflow`, derived from its shipped markdown. */
-const contractOf = (workflow: string) =>
+/** The contract of `workflow`, derived from its shipped markdown rendered for the tracker `cwd` is configured with. */
+const contractOf = (workflow: string, cwd: string) =>
   deriveContract(
     fs.readFileSync(path.join(getWorkflowsRoot(), `bkit-${workflow}.md`), "utf-8"),
     workflow,
+    readIssueTracker(cwd),
   );
 
 /**
@@ -1076,9 +1077,13 @@ function writeCompletenessRow(
   log: (m: string) => void,
 ): void {
   try {
-    const verdict = checkCompleteness(runRowsOf(file, workflow, startAt), contractOf(workflow), {
-      journalSuspect: true,
-    });
+    const verdict = checkCompleteness(
+      runRowsOf(file, workflow, startAt),
+      contractOf(workflow, path.dirname(file)),
+      {
+        journalSuspect: true,
+      },
+    );
     const row: StatusRow = { type: "completeness", ...verdict, at: statusTimestamp(), parentSha };
     fs.appendFileSync(file, appendLine(row));
     if (verdict.journalSuspect) {
@@ -1105,7 +1110,7 @@ function previousRunWarning(file: string, resumed: boolean): string | null {
     if (prev === undefined) return null;
     const next = runs.slice(at + 1).find((r) => r.workflow === prev.workflow);
     const own = runRowsOf(file, prev.workflow, prev.startedAt, next?.startedAt);
-    const { verdict } = readCompleteness(own, contractOf(prev.workflow));
+    const { verdict } = readCompleteness(own, contractOf(prev.workflow, path.dirname(file)));
     if (!verdict.holey) return null;
     const number = runs.slice(0, at + 1).filter((r) => r.workflow === prev.workflow).length;
     const closed = own.filter((e) => e.type === "workflow-done").at(-1)?.["at"] ?? "never";
diff --git a/.bkit/core/engine/ledgers/journal.integration.test.ts b/.bkit/core/engine/ledgers/journal.integration.test.ts
index 28458cdda..4e6f7987d 100644
--- a/.bkit/core/engine/ledgers/journal.integration.test.ts
+++ b/.bkit/core/engine/ledgers/journal.integration.test.ts
@@ -14,6 +14,7 @@ import * as path from "node:path";
 import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
 
 import { runCommand, type CommandSpec } from "../commands/lib";
+import { branchesCommand } from "../commands/workflow/branches";
 
 const FID = "901-journal";
 const STATUS_REL = path.join("docs", "plans", "202610", "logs", FID, "status.jsonl");
@@ -156,4 +157,18 @@ describe("the dispatch seam on a real worktree", () => {
     await run(worktree, ["widgets", "odd"]);
     expect(rows(status).filter((r) => r["type"] === "engine-call")).toHaveLength(1);
   });
+
+  it("branches anchor-read with a plan --file journals into the active run", async () => {
+    const plan = path.join(worktree, "docs", "plans", "202610", `${FID}-plan.md`);
+    fs.mkdirSync(path.dirname(plan), { recursive: true });
+    fs.writeFileSync(plan, "# Plan\n");
+    await runCommand(
+      ["branches", "anchor-read", `--file=${path.relative(worktree, plan)}`],
+      [branchesCommand],
+      { classicVerbs: new Set(), cwd: worktree, io: { stdout: () => {}, stderr: () => {} } },
+    );
+    const calls = rows(path.join(worktree, STATUS_REL)).filter((r) => r["type"] === "engine-call");
+    expect(calls).toHaveLength(1);
+    expect(calls[0]).toMatchObject({ workflow: "build", noun: "branches", verb: "anchor-read" });
+  });
 });
diff --git a/dist/checks/status-holes.js b/dist/checks/status-holes.js
index 746dafbb9..4a9494d13 100644
--- a/dist/checks/status-holes.js
+++ b/dist/checks/status-holes.js
@@ -27,6 +27,7 @@ import * as fs from "node:fs";
 import * as path from "node:path";
 import { fileURLToPath } from "node:url";
 import { WORKFLOW_STEPS } from "../commands/workflow/step-table.js";
+import { substituteWorkflow } from "../render/trackers.js";
 import { parseJson } from "../shared/json.js";
 import { getWorkflowsRoot } from "../shared/package-roots.js";
 // ---------------------------------------------------------------------------
@@ -218,9 +219,11 @@ export function isConditionalSection(body) {
  * Derive the contract of one workflow from its markdown: the step sections, the
  * row keys and `"{BKIT}"` calls each holds, and the calls no step owns. The
  * universe is cross-checked against the deduped `WORKFLOW_STEPS[workflow]`; a
- * disagreement is reported as drift, never thrown.
+ * disagreement is reported as drift, never thrown. With a `tracker`, the markdown is
+ * first rendered for it, so a consumer is held to the calls its installed workflow names.
  */
-export function deriveContract(workflowMd, workflow) {
+export function deriveContract(sourceMd, workflow, tracker) {
+    const workflowMd = tracker === undefined ? sourceMd : substituteWorkflow(sourceMd, tracker).output;
     const sections = stepSections(workflowMd);
     // The journal window runs from the first `workflows start` call to the `workflows close`
     // call: a call written above or below it is matched when journaled, never required.
@@ -340,6 +343,9 @@ export function check(rows, contract, options = {}) {
     });
     const callCount = items.filter((i) => i.kind === "call").length;
     const preJournal = callCount === 0;
+    // A journal that starts mid-run (an engine upgrade, the kill switch lifted) leaves the
+    // visits that finished before its first `engine-call` row with no evidence to judge.
+    const firstCall = items.findIndex((i) => i.kind === "call");
     // Visits over the step rows, in order; a row outside the contract closes the current visit.
     const visits = [];
     const visitOfRow = new Map();
@@ -417,6 +423,9 @@ export function check(rows, contract, options = {}) {
     for (const v of visits) {
         const index = (occurrence.get(v.unit) ?? 0) + 1;
         occurrence.set(v.unit, index);
+        const beforeJournal = firstCall !== -1 && v.rows.every((r) => r < firstCall);
+        if (beforeJournal)
+            continue;
         const got = owned.get(v) ?? new Set();
         const pool = exercised.get(v.unit) ?? new Set();
         for (const k of got)
diff --git a/dist/commands/lib.js b/dist/commands/lib.js
index 01f19bcb8..97626e440 100644
--- a/dist/commands/lib.js
+++ b/dist/commands/lib.js
@@ -261,12 +261,13 @@ function subdirs(dir) {
  * and folds with `ledgers/status.ts`, so it never imports a `commands/**` module.
  */
 export function resolveActiveRun(opts) {
-    if (opts.file !== undefined) {
+    // A `--file` that is a run's `status.jsonl` names that run; any other file (a plan or
+    // design doc) says nothing about the run and falls through to `--fid` and the scan.
+    if (opts.file !== undefined && path.basename(opts.file) === "status.jsonl") {
         const file = path.resolve(opts.cwd, opts.file);
         const workflow = inProgressWorkflow(file);
         const logs = path.dirname(path.dirname(file));
         if (workflow === undefined ||
-            path.basename(file) !== "status.jsonl" ||
             path.basename(logs) !== "logs" ||
             path.basename(path.dirname(path.dirname(logs))) !== "plans") {
             return undefined;
diff --git a/dist/commands/workflow/completeness.js b/dist/commands/workflow/completeness.js
index daa22aa75..d9868c385 100644
--- a/dist/commands/workflow/completeness.js
+++ b/dist/commands/workflow/completeness.js
@@ -4,6 +4,7 @@ import * as path from "node:path";
 import { deriveContract, inferWorkflows, parseRows, readCompleteness, } from "../../checks/status-holes.js";
 import { getWorkflowsRoot } from "../../shared/package-roots.js";
 import { EXIT } from "../lib.js";
+import { readIssueTracker } from "./fids.js";
 import { FILE_FLAG, WORKFLOW_FLAG, statusFile } from "./status.js";
 const TAG = "[bkit-status-holes]";
 const readText = (file, log) => {
@@ -60,6 +61,7 @@ export const completenessCommand = {
                 const rows = parseRows(text);
                 const given = typeof ctx.flags.workflow === "string" ? ctx.flags.workflow : undefined;
                 const workflows = given === undefined ? inferWorkflows(rows) : [given];
+                const tracker = readIssueTracker(ctx.cwd);
                 const verdicts = [];
                 const lines = [];
                 for (const workflow of workflows) {
@@ -69,7 +71,7 @@ export const completenessCommand = {
                         continue;
                     }
                     try {
-                        const { verdict } = readCompleteness(rows, deriveContract(md, workflow));
+                        const { verdict } = readCompleteness(rows, deriveContract(md, workflow, tracker));
                         verdicts.push(verdict);
                         lines.push(...reportLines(verdict));
                     }
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index 4b928d41a..0261b0089 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -829,8 +829,8 @@ function runRowsOf(file, workflow, startAt, before) {
         (before === undefined || at(r) < before))
         .sort((a, b) => (at(a) < at(b) ? -1 : at(a) > at(b) ? 1 : 0));
 }
-/** The contract of `workflow`, derived from its shipped markdown. */
-const contractOf = (workflow) => deriveContract(fs.readFileSync(path.join(getWorkflowsRoot(), `bkit-${workflow}.md`), "utf-8"), workflow);
+/** The contract of `workflow`, derived from its shipped markdown rendered for the tracker `cwd` is configured with. */
+const contractOf = (workflow, cwd) => deriveContract(fs.readFileSync(path.join(getWorkflowsRoot(), `bkit-${workflow}.md`), "utf-8"), workflow, readIssueTracker(cwd));
 /**
  * Appends the close's `completeness` row for the run that started at `startAt`. Advisory:
  * a failure of the check or of the write is logged in one line and never fails the close.
@@ -838,7 +838,7 @@ const contractOf = (workflow) => deriveContract(fs.readFileSync(path.join(getWor
  */
 function writeCompletenessRow(file, workflow, startAt, parentSha, log) {
     try {
-        const verdict = checkCompleteness(runRowsOf(file, workflow, startAt), contractOf(workflow), {
+        const verdict = checkCompleteness(runRowsOf(file, workflow, startAt), contractOf(workflow, path.dirname(file)), {
             journalSuspect: true,
         });
         const row = { type: "completeness", ...verdict, at: statusTimestamp(), parentSha };
@@ -866,7 +866,7 @@ function previousRunWarning(file, resumed) {
             return null;
         const next = runs.slice(at + 1).find((r) => r.workflow === prev.workflow);
         const own = runRowsOf(file, prev.workflow, prev.startedAt, next?.startedAt);
-        const { verdict } = readCompleteness(own, contractOf(prev.workflow));
+        const { verdict } = readCompleteness(own, contractOf(prev.workflow, path.dirname(file)));
         if (!verdict.holey)
             return null;
         const number = runs.slice(0, at + 1).filter((r) => r.workflow === prev.workflow).length;
