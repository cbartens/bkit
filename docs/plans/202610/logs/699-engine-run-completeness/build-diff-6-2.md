diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 07963b63e..cde20f107 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -28,8 +28,29 @@ vi.mock("./worktrees", async (importOriginal) => {
     },
   };
 });
+/** Makes the completeness checker throw when a test sets a flag; otherwise the real one. */
+const holes = vi.hoisted(() => ({ throwCheck: false, throwRead: false, unserialisable: false }));
+vi.mock("../../checks/status-holes", async (importOriginal) => {
+  const actual = await importOriginal<typeof import("../../checks/status-holes")>();
+  return {
+    ...actual,
+    check: (...args: Parameters<typeof actual.check>) => {
+      if (holes.throwCheck) throw new Error("forced checker failure");
+      // A verdict the row write cannot serialise: the write throws, the check does not.
+      if (holes.unserialisable) return { ...actual.check(...args), extra: 1n };
+      return actual.check(...args);
+    },
+    readCompleteness: (...args: Parameters<typeof actual.readCompleteness>) => {
+      if (holes.throwRead) throw new Error("forced checker failure");
+      return actual.readCompleteness(...args);
+    },
+  };
+});
 afterEach(() => {
   removing.onEnter = null;
+  holes.throwCheck = false;
+  holes.throwRead = false;
+  holes.unserialisable = false;
 });
 
 const dirs: string[] = [];
@@ -145,6 +166,74 @@ function linearCommentServer(): string[] {
 // ---------------------------------------------------------------------------
 
 describe("bkit workflows start", () => {
+  /** A closed build run that recorded only its close step: a step hole on every other required step. */
+  const holeyBuild = [
+    { type: "workflow-started", workflow: "build", at: "2020-01-01T00:00:00Z" },
+    {
+      type: "step-done",
+      workflow: "build",
+      step: "build-close-workflow",
+      status: "DONE",
+      at: "2020-01-01T00:59:00Z",
+      parentSha: "x",
+      artifacts: [],
+    },
+    { type: "workflow-done", workflow: "build", at: "2020-01-01T01:00:00Z" },
+  ];
+  const warnings = (err: string) =>
+    err.split("\n").filter((l) => l.includes("[bkit-workflows]") && l.includes("previous run"));
+
+  it("warns when the previous run for this fid was holey", async () => {
+    const cwd = repo();
+    write(cwd, `${REL}/status.jsonl`, jsonl(holeyBuild));
+    const r = await run(cwd, wf("start", "design"));
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ resumed: false, run: 1 });
+    const lines = warnings(r.err);
+    expect(lines).toHaveLength(1);
+    expect(lines[0]).toContain("build");
+    expect(lines[0]).toContain("run 1");
+    expect(lines[0]).toContain("2020-01-01T01:00:00Z");
+    expect(lines[0]).toContain("bkit completeness check");
+  });
+
+  it("prints nothing when the previous run is clean, absent, or unreadable", async () => {
+    // Positive control: the same fixture warns while the checker works.
+    const control = repo();
+    write(control, `${REL}/status.jsonl`, jsonl(holeyBuild));
+    expect(warnings((await run(control, wf("start", "design"))).err)).toHaveLength(1);
+
+    // Absent: the first run of a feature has no previous run.
+    const first = await run(repo(), wf("start", "design"));
+    expect(first.code).toBe(0);
+    expect(warnings(first.err)).toHaveLength(0);
+
+    // Clean: a stored CLEAN verdict.
+    const clean = repo();
+    write(
+      clean,
+      `${REL}/status.jsonl`,
+      jsonl([
+        ...holeyBuild.slice(0, 2),
+        { type: "completeness", workflow: "build", at: "2020-01-01T01:00:00Z", verdict: "CLEAN" },
+        holeyBuild[2]!,
+      ]),
+    );
+    const c = await run(clean, wf("start", "design"));
+    expect(c.code).toBe(0);
+    expect(warnings(c.err)).toHaveLength(0);
+
+    // Unreadable: the checker throws at start.
+    holes.throwRead = true;
+    const broken = repo();
+    write(broken, `${REL}/status.jsonl`, jsonl(holeyBuild));
+    const b = await run(broken, wf("start", "design"));
+    expect(b.code).toBe(0);
+    expect(b.err).not.toMatch(/forced checker failure|error/i);
+    expect(warnings(b.err)).toHaveLength(0);
+    expect(b.json).toMatchObject({ resumed: false, run: 1 });
+  });
+
   it("takes the lock and opens run 1 with a workflow-started row carrying HEAD", async () => {
     const cwd = repo();
     const r = await run(cwd, wf("start", "build"));
@@ -964,6 +1053,59 @@ describe("bkit workflows close", () => {
     expect(r.json.counterRow).toBeNull();
   });
 
+  it("appends the completeness row before the workflow-done row", async () => {
+    const cwd = closable("build");
+    const r = await run(cwd, wf("close", "build", "--record-step"));
+    expect(r.code).toBe(0);
+    const all = rows(statusOf(cwd));
+    const at = all.findIndex((x) => x.type === "completeness");
+    expect(at).toBeGreaterThan(-1);
+    expect(all[at]).toMatchObject({ workflow: "build", journalSuspect: true });
+    expect(["CLEAN", "HOLEY"]).toContain(all[at]!.verdict);
+    expect(all[at - 1]).toMatchObject({ type: "step-done", step: "build-close-workflow" });
+    expect(all[at + 1]).toMatchObject({ type: "workflow-done", workflow: "build" });
+  });
+
+  it("writes one completeness row per close", async () => {
+    const cwd = closable("build");
+    expect((await run(cwd, wf("close", "build"))).code).toBe(0);
+    expect((await run(cwd, wf("close", "build"))).code).toBe(0);
+    const all = rows(statusOf(cwd));
+    expect(all.filter((x) => x.type === "completeness")).toHaveLength(2);
+    expect(all.filter((x) => x.type === "workflow-done")).toHaveLength(2);
+    expect(all.map((x) => x.type).slice(-4)).toEqual([
+      "completeness",
+      "workflow-done",
+      "completeness",
+      "workflow-done",
+    ]);
+  });
+
+  it("still closes when the completeness check throws", async () => {
+    const cwd = closable("build");
+    holes.throwCheck = true;
+    const r = await run(cwd, wf("close", "build"));
+    expect(r.code).toBe(0);
+    const all = rows(statusOf(cwd));
+    expect(all.at(-1)).toMatchObject({ type: "workflow-done", workflow: "build" });
+    expect(all.some((x) => x.type === "completeness")).toBe(false);
+    const lines = r.err.split("\n").filter((l) => l.includes("completeness row not written"));
+    expect(lines).toHaveLength(1);
+    expect(lines[0]).toContain("forced checker failure");
+  });
+
+  it("still closes when the completeness row write throws", async () => {
+    const cwd = closable("build");
+    holes.unserialisable = true;
+    const r = await run(cwd, wf("close", "build"));
+    expect(r.code).toBe(0);
+    const all = rows(statusOf(cwd));
+    expect(all.at(-1)).toMatchObject({ type: "workflow-done", workflow: "build" });
+    expect(all.some((x) => x.type === "completeness")).toBe(false);
+    const lines = r.err.split("\n").filter((l) => l.includes("completeness row not written"));
+    expect(lines).toHaveLength(1);
+  });
+
   it("refuses without status.jsonl and writes nothing", async () => {
     const cwd = repo();
     const r = await run(cwd, wf("close", "build"));
@@ -1146,7 +1288,11 @@ describe("bkit workflows close — commit, outbox, comment", () => {
     const cwd = started("design");
     await run(cwd, wf("close", "design", "--record-step"));
     const kinds = rows(statusOf(cwd)).map((x) => [x.type, x.step].join(":"));
-    expect(kinds.slice(-2)).toEqual(["step-done:design-close-workflow", "workflow-done:"]);
+    expect(kinds.slice(-3)).toEqual([
+      "step-done:design-close-workflow",
+      "completeness:",
+      "workflow-done:",
+    ]);
   });
 
   it("--outbox writes the artifact links and telemetry, and --number prints the close comment", async () => {
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index 8d8084e5b..128b96c7a 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -32,6 +32,7 @@ import {
   runOrStepField,
   statusTimestamp,
   type StatusEvent,
+  type StatusRow,
 } from "../../ledgers/status.js";
 import {
   foldFrom,
@@ -41,6 +42,14 @@ import {
   type CoverageStats,
   type OutcomePayload,
 } from "../../ledgers/telemetry.js";
+import {
+  check as checkCompleteness,
+  deriveContract,
+  parseRows,
+  readCompleteness,
+  type StatusRow as HoleRow,
+} from "../../checks/status-holes.js";
+import { getWorkflowsRoot } from "../../shared/package-roots.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { gradeCompliance } from "../comply.js";
 import { fetchDev, landDir, pushToDev, type DevPush } from "../land.js";
@@ -1034,6 +1043,78 @@ function appendStats(tree: string, rows: Array<Record<string, unknown>>, log: (m
   }
 }
 
+/** `workflow`'s rows of `file` from `startAt` (run start) on, in time order; unreadable lines skipped. */
+function runRowsOf(file: string, workflow: string, startAt?: string, before?: string): HoleRow[] {
+  const at = (r: HoleRow) => (typeof r["at"] === "string" ? r["at"] : "");
+  return parseRows(fs.readFileSync(file, "utf-8"))
+    .filter(
+      (r) =>
+        r.workflow === workflow &&
+        (startAt === undefined || at(r) >= startAt) &&
+        (before === undefined || at(r) < before),
+    )
+    .sort((a, b) => (at(a) < at(b) ? -1 : at(a) > at(b) ? 1 : 0));
+}
+
+/** The contract of `workflow`, derived from its shipped markdown. */
+const contractOf = (workflow: string) =>
+  deriveContract(
+    fs.readFileSync(path.join(getWorkflowsRoot(), `bkit-${workflow}.md`), "utf-8"),
+    workflow,
+  );
+
+/**
+ * Appends the close's `completeness` row for the run that started at `startAt`. Advisory:
+ * a failure of the check or of the write is logged in one line and never fails the close.
+ * `journalSuspect` is set here only: the closing engine journals itself.
+ */
+function writeCompletenessRow(
+  file: string,
+  workflow: string,
+  startAt: string | undefined,
+  parentSha: string,
+  log: (m: string) => void,
+): void {
+  try {
+    const verdict = checkCompleteness(runRowsOf(file, workflow, startAt), contractOf(workflow), {
+      journalSuspect: true,
+    });
+    const row: StatusRow = { type: "completeness", ...verdict, at: statusTimestamp(), parentSha };
+    fs.appendFileSync(file, appendLine(row));
+  } catch (err) {
+    // The check is advisory: report the failure and close without the row.
+    log(`[bkit-telemetry] completeness row not written: ${(err as Error).message}`);
+  }
+}
+
+/**
+ * The warning line for the run before the one being started (or resumed) when that run
+ * was holey; `null` when it is clean, absent or unreadable. Never throws.
+ */
+function previousRunWarning(file: string, resumed: boolean): string | null {
+  try {
+    const events = readStatusEvents(file);
+    const runs = fold(events);
+    const at = runs.length - (resumed ? 2 : 1);
+    const prev = runs[at];
+    if (prev === undefined) return null;
+    const next = runs.slice(at + 1).find((r) => r.workflow === prev.workflow);
+    const own = runRowsOf(file, prev.workflow, prev.startedAt, next?.startedAt);
+    const { verdict } = readCompleteness(own, contractOf(prev.workflow));
+    if (!verdict.holey) return null;
+    const number = runs.slice(0, at + 1).filter((r) => r.workflow === prev.workflow).length;
+    const closed = own.filter((e) => e.type === "workflow-done").at(-1)?.["at"] ?? "never";
+    return (
+      `[bkit-workflows] previous run (${prev.workflow} run ${number}, closed ${closed}) was incomplete: ` +
+      `${verdict.evidenceHoles.length} evidence hole(s), ${verdict.stepHoles.length} step hole(s); ` +
+      `see: bkit completeness check --workflow=${prev.workflow} --file=${path.relative(process.cwd(), file) || file}`
+    );
+  } catch {
+    // Advisory: an unreadable run or checker failure degrades to no warning.
+    return null;
+  }
+}
+
 /** Markdown link per feature doc and per log of this workflow, as on `ref`. */
 export function artifactLinks(
   root: string,
@@ -1142,6 +1223,13 @@ export function closeWorkflow(
       log,
     );
   }
+  writeCompletenessRow(
+    where.status,
+    workflow,
+    lastOfType(readStatusEvents(where.status), "workflow-started", workflow)?.at,
+    parentSha,
+    log,
+  );
   const endAt = statusTimestamp();
   const row = { type: "workflow-done" as const, workflow, at: endAt, parentSha };
   fs.appendFileSync(where.status, appendLine(row));
@@ -1991,6 +2079,8 @@ export const workflowsCommand: CommandSpec = {
 
         const latest = fold(readStatusEvents(file)).at(-1);
         const resumed = latest?.workflow === workflow && latest.status === "IN_PROGRESS";
+        const holeyWarning = previousRunWarning(file, resumed);
+        if (holeyWarning !== null) ctx.log(holeyWarning);
         let row: Record<string, unknown> | null = null;
         if (!resumed) {
           row = {
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index c07d1396b..422931a77 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -24,6 +24,8 @@ import * as os from "node:os";
 import * as path from "node:path";
 import { appendLine, fold, lastRun, runNumber, runOrStepField, statusTimestamp, } from "../../ledgers/status.js";
 import { foldFrom, normalize, resolveRepoSlug, workflowTelemetry, } from "../../ledgers/telemetry.js";
+import { check as checkCompleteness, deriveContract, parseRows, readCompleteness, } from "../../checks/status-holes.js";
+import { getWorkflowsRoot } from "../../shared/package-roots.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { gradeCompliance } from "../comply.js";
 import { fetchDev, landDir, pushToDev } from "../land.js";
@@ -818,6 +820,63 @@ function appendStats(tree, rows, log) {
         return false;
     }
 }
+/** `workflow`'s rows of `file` from `startAt` (run start) on, in time order; unreadable lines skipped. */
+function runRowsOf(file, workflow, startAt, before) {
+    const at = (r) => (typeof r["at"] === "string" ? r["at"] : "");
+    return parseRows(fs.readFileSync(file, "utf-8"))
+        .filter((r) => r.workflow === workflow &&
+        (startAt === undefined || at(r) >= startAt) &&
+        (before === undefined || at(r) < before))
+        .sort((a, b) => (at(a) < at(b) ? -1 : at(a) > at(b) ? 1 : 0));
+}
+/** The contract of `workflow`, derived from its shipped markdown. */
+const contractOf = (workflow) => deriveContract(fs.readFileSync(path.join(getWorkflowsRoot(), `bkit-${workflow}.md`), "utf-8"), workflow);
+/**
+ * Appends the close's `completeness` row for the run that started at `startAt`. Advisory:
+ * a failure of the check or of the write is logged in one line and never fails the close.
+ * `journalSuspect` is set here only: the closing engine journals itself.
+ */
+function writeCompletenessRow(file, workflow, startAt, parentSha, log) {
+    try {
+        const verdict = checkCompleteness(runRowsOf(file, workflow, startAt), contractOf(workflow), {
+            journalSuspect: true,
+        });
+        const row = { type: "completeness", ...verdict, at: statusTimestamp(), parentSha };
+        fs.appendFileSync(file, appendLine(row));
+    }
+    catch (err) {
+        // The check is advisory: report the failure and close without the row.
+        log(`[bkit-telemetry] completeness row not written: ${err.message}`);
+    }
+}
+/**
+ * The warning line for the run before the one being started (or resumed) when that run
+ * was holey; `null` when it is clean, absent or unreadable. Never throws.
+ */
+function previousRunWarning(file, resumed) {
+    try {
+        const events = readStatusEvents(file);
+        const runs = fold(events);
+        const at = runs.length - (resumed ? 2 : 1);
+        const prev = runs[at];
+        if (prev === undefined)
+            return null;
+        const next = runs.slice(at + 1).find((r) => r.workflow === prev.workflow);
+        const own = runRowsOf(file, prev.workflow, prev.startedAt, next?.startedAt);
+        const { verdict } = readCompleteness(own, contractOf(prev.workflow));
+        if (!verdict.holey)
+            return null;
+        const number = runs.slice(0, at + 1).filter((r) => r.workflow === prev.workflow).length;
+        const closed = own.filter((e) => e.type === "workflow-done").at(-1)?.["at"] ?? "never";
+        return (`[bkit-workflows] previous run (${prev.workflow} run ${number}, closed ${closed}) was incomplete: ` +
+            `${verdict.evidenceHoles.length} evidence hole(s), ${verdict.stepHoles.length} step hole(s); ` +
+            `see: bkit completeness check --workflow=${prev.workflow} --file=${path.relative(process.cwd(), file) || file}`);
+    }
+    catch {
+        // Advisory: an unreadable run or checker failure degrades to no warning.
+        return null;
+    }
+}
 /** Markdown link per feature doc and per log of this workflow, as on `ref`. */
 export function artifactLinks(root, ref, month, fid, workflow, ownerRepo) {
     const list = (dir) => (git(root, ["ls-tree", "-r", "--name-only", ref, "--", dir]) ?? "").split("\n").filter(Boolean);
@@ -876,6 +935,7 @@ export function closeWorkflow(cwd, o, log) {
     if (o.recordStep === true) {
         writeStepRow(where.tree, { file: where.status, workflow, step, artifacts: [], commit: "none" }, log);
     }
+    writeCompletenessRow(where.status, workflow, lastOfType(readStatusEvents(where.status), "workflow-started", workflow)?.at, parentSha, log);
     const endAt = statusTimestamp();
     const row = { type: "workflow-done", workflow, at: endAt, parentSha };
     fs.appendFileSync(where.status, appendLine(row));
@@ -1631,6 +1691,9 @@ export const workflowsCommand = {
                 }
                 const latest = fold(readStatusEvents(file)).at(-1);
                 const resumed = latest?.workflow === workflow && latest.status === "IN_PROGRESS";
+                const holeyWarning = previousRunWarning(file, resumed);
+                if (holeyWarning !== null)
+                    ctx.log(holeyWarning);
                 let row = null;
                 if (!resumed) {
                     row = {
