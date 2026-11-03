diff --git a/.bkit/core/engine/checks/status-holes.ts b/.bkit/core/engine/checks/status-holes.ts
index c56665580..b41292674 100644
--- a/.bkit/core/engine/checks/status-holes.ts
+++ b/.bkit/core/engine/checks/status-holes.ts
@@ -814,7 +814,7 @@ export function detectHoles(
 // Full audit — parse status.jsonl + workflow md, classify, detect, report
 // ---------------------------------------------------------------------------
 
-function parseRows(statusJsonl: string): StatusRow[] {
+export function parseRows(statusJsonl: string): StatusRow[] {
   const rows: StatusRow[] = [];
   for (const line of statusJsonl.split("\n")) {
     const trimmed = line.trim();
diff --git a/.bkit/core/engine/commands/registry.ts b/.bkit/core/engine/commands/registry.ts
index 4d61c0e49..ce521a052 100644
--- a/.bkit/core/engine/commands/registry.ts
+++ b/.bkit/core/engine/commands/registry.ts
@@ -10,6 +10,7 @@ import type { CommandSpec } from "./lib.js";
 import { setupCommand } from "./setup/setup.js";
 import { branchesCommand } from "./workflow/branches.js";
 import { challengeCommand } from "./workflow/challenge.js";
+import { completenessCommand } from "./workflow/completeness.js";
 import { contextCommand } from "./workflow/context.js";
 import { countersCommand } from "./workflow/counters.js";
 import { decisionsCommand } from "./workflow/decisions.js";
@@ -56,6 +57,7 @@ export const COMMANDS: readonly CommandSpec[] = [
   contextCommand,
   roadmapCommand,
   plansCommand,
+  completenessCommand,
   ciCommand,
   setupCommand,
 ];
diff --git a/.bkit/core/engine/commands/workflow/completeness.test.ts b/.bkit/core/engine/commands/workflow/completeness.test.ts
new file mode 100644
index 000000000..57a08feed
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/completeness.test.ts
@@ -0,0 +1,89 @@
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+
+import { afterEach, describe, expect, it } from "vitest";
+
+import { runCommand } from "../lib";
+import { completenessCommand } from "./completeness";
+
+const dirs: string[] = [];
+afterEach(() => {
+  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
+});
+
+function tmp() {
+  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-completeness-cmd-")));
+  dirs.push(d);
+  return d;
+}
+
+async function run(argv: string[]) {
+  const out: string[] = [];
+  const err: string[] = [];
+  const code = await runCommand([...argv, "--json"], [completenessCommand], {
+    classicVerbs: new Set(),
+    cwd: process.cwd(),
+    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
+  });
+  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
+}
+
+const AT = "2026-10-29T00:00:00.000Z";
+const SHA = "a".repeat(40);
+
+/** A closed build run that journaled one call and recorded only its closing step. */
+function holeyFile(workflow = "build") {
+  const rows = [
+    { type: "workflow-started", workflow, at: AT },
+    { type: "engine-call", workflow, noun: "status", verb: "path", at: AT },
+    {
+      type: "step-done",
+      workflow,
+      step: `${workflow}-close-workflow`,
+      status: "DONE",
+      at: AT,
+      parentSha: SHA,
+      artifacts: [],
+    },
+  ];
+  const file = path.join(tmp(), "status.jsonl");
+  fs.writeFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
+  return file;
+}
+
+describe("bkit completeness check", () => {
+  it("always exits 0 on a holey run", async () => {
+    const r = await run(["completeness", "check", `--file=${holeyFile()}`, "--workflow=build"]);
+    expect(r.code).toBe(0);
+    expect(r.json.verdicts[0]).toMatchObject({ workflow: "build", verdict: "HOLEY", holey: true });
+    expect(r.json.verdicts[0].stepHoles.length).toBeGreaterThan(0);
+  });
+
+  it("infers each run's workflow when --workflow is absent", async () => {
+    const r = await run(["completeness", "check", `--file=${holeyFile("debug")}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.verdicts.map((v: { workflow: string }) => v.workflow)).toEqual(["debug"]);
+    expect(r.json.report).toContain("debug");
+  });
+
+  it("exits 0 with no verdict when the file or the workflow markdown is unreadable", async () => {
+    const missing = await run([
+      "completeness",
+      "check",
+      `--file=${path.join(tmp(), "nope.jsonl")}`,
+      "--workflow=build",
+    ]);
+    expect(missing.code).toBe(0);
+    expect(missing.json.verdicts).toEqual([]);
+
+    const noMd = await run([
+      "completeness",
+      "check",
+      `--file=${holeyFile()}`,
+      "--workflow=not-a-workflow",
+    ]);
+    expect(noMd.code).toBe(0);
+    expect(noMd.json.verdicts).toEqual([]);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/completeness.ts b/.bkit/core/engine/commands/workflow/completeness.ts
new file mode 100644
index 000000000..5f6f49dec
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/completeness.ts
@@ -0,0 +1,101 @@
+// bkit completeness check — report whether a run recorded every step and journaled every command its workflow requires.
+
+import * as fs from "node:fs";
+import * as path from "node:path";
+
+import {
+  deriveContract,
+  inferWorkflows,
+  parseRows,
+  readCompleteness,
+  type CompletenessVerdict,
+} from "../../checks/status-holes.js";
+import { getWorkflowsRoot } from "../../shared/package-roots.js";
+import { EXIT, type CommandSpec } from "../lib.js";
+import { FILE_FLAG, WORKFLOW_FLAG, statusFile } from "./status.js";
+
+const TAG = "[bkit-status-holes]";
+
+const readText = (file: string, log: (message: string) => void): string | null => {
+  try {
+    return fs.readFileSync(file, "utf-8");
+  } catch (err) {
+    log(`${TAG} ${file} not readable: ${err instanceof Error ? err.message : String(err)}`);
+    return null;
+  }
+};
+
+function reportLines(v: CompletenessVerdict): string[] {
+  const calls = (list: Array<{ noun: string; verb: string }>) =>
+    list.map((c) => `${c.noun} ${c.verb}`).join(", ");
+  const lines = [
+    `${TAG} ADVISORY — ${v.workflow}: ${v.verdict} (${v.observed.steps} step(s), ${v.observed.calls} call(s) observed)`,
+  ];
+  if (v.preJournal) lines.push("  pre-journal run: command evidence not available");
+  if (v.stepHoles.length > 0) lines.push(`  step holes: ${v.stepHoles.join(", ")}`);
+  for (const h of v.evidenceHoles)
+    lines.push(`  evidence hole: ${h.step} lacks ${calls(h.missing)}`);
+  if (v.unexercised.length > 0)
+    lines.push(`  unexercised arms: ${v.unexercised.length} (not holes)`);
+  return lines;
+}
+
+export const completenessCommand: CommandSpec = {
+  noun: "completeness",
+  summary: "Check a run for missing steps and missing bkit commands.",
+  verbs: {
+    check: {
+      summary:
+        "Report the steps and bkit commands a run is missing, from its status.jsonl and the workflow markdown; advisory, always exits 0.",
+      flags: [
+        FILE_FLAG,
+        {
+          ...WORKFLOW_FLAG,
+          required: false,
+          help: "workflow name: design, plan, build, debug, ship; absent = each workflow the file holds rows of",
+        },
+      ],
+      output: {
+        report: "the human-readable report",
+        holey: "true when any checked run has an evidence hole or a step hole",
+        verdicts: "one completeness verdict per checked workflow; empty when nothing could be read",
+      },
+      run: (ctx) => {
+        const file = statusFile(ctx);
+        const text = readText(file, ctx.log);
+        if (text === null) {
+          ctx.emit({ report: `${TAG} no status.jsonl to check`, holey: false, verdicts: [] });
+          return EXIT.OK;
+        }
+        const rows = parseRows(text);
+        const given = typeof ctx.flags.workflow === "string" ? ctx.flags.workflow : undefined;
+        const workflows = given === undefined ? inferWorkflows(rows) : [given];
+        const verdicts: CompletenessVerdict[] = [];
+        const lines: string[] = [];
+        for (const workflow of workflows) {
+          const md = readText(path.join(getWorkflowsRoot(), `bkit-${workflow}.md`), ctx.log);
+          if (md === null) {
+            ctx.log(`${TAG} bkit-${workflow}.md not readable — skipping ${workflow} (advisory)`);
+            continue;
+          }
+          try {
+            const { verdict } = readCompleteness(rows, deriveContract(md, workflow));
+            verdicts.push(verdict);
+            lines.push(...reportLines(verdict));
+          } catch (err) {
+            ctx.log(
+              `${TAG} ${workflow}: ${err instanceof Error ? err.message : String(err)} — no verdict (advisory)`,
+            );
+          }
+        }
+        if (lines.length === 0) lines.push(`${TAG} no verdict`);
+        ctx.emit({
+          report: lines.join("\n"),
+          holey: verdicts.some((v) => v.holey),
+          verdicts,
+        });
+        return EXIT.OK;
+      },
+    },
+  },
+};
diff --git a/dist/checks/status-holes.js b/dist/checks/status-holes.js
index 5d7b33b88..bd3b614c7 100644
--- a/dist/checks/status-holes.js
+++ b/dist/checks/status-holes.js
@@ -621,7 +621,7 @@ export function detectHoles(observed, sourceUniverse, path) {
 // ---------------------------------------------------------------------------
 // Full audit — parse status.jsonl + workflow md, classify, detect, report
 // ---------------------------------------------------------------------------
-function parseRows(statusJsonl) {
+export function parseRows(statusJsonl) {
     const rows = [];
     for (const line of statusJsonl.split("\n")) {
         const trimmed = line.trim();
diff --git a/dist/commands/registry.js b/dist/commands/registry.js
index 191f5156f..94f618a91 100644
--- a/dist/commands/registry.js
+++ b/dist/commands/registry.js
@@ -8,6 +8,7 @@ import { ciCommand } from "./ci/ci.js";
 import { setupCommand } from "./setup/setup.js";
 import { branchesCommand } from "./workflow/branches.js";
 import { challengeCommand } from "./workflow/challenge.js";
+import { completenessCommand } from "./workflow/completeness.js";
 import { contextCommand } from "./workflow/context.js";
 import { countersCommand } from "./workflow/counters.js";
 import { decisionsCommand } from "./workflow/decisions.js";
@@ -53,6 +54,7 @@ export const COMMANDS = [
     contextCommand,
     roadmapCommand,
     plansCommand,
+    completenessCommand,
     ciCommand,
     setupCommand,
 ];
diff --git a/dist/commands/workflow/completeness.js b/dist/commands/workflow/completeness.js
new file mode 100644
index 000000000..7a0fa4070
--- /dev/null
+++ b/dist/commands/workflow/completeness.js
@@ -0,0 +1,90 @@
+// bkit completeness check — report whether a run recorded every step and journaled every command its workflow requires.
+import * as fs from "node:fs";
+import * as path from "node:path";
+import { deriveContract, inferWorkflows, parseRows, readCompleteness, } from "../../checks/status-holes.js";
+import { getWorkflowsRoot } from "../../shared/package-roots.js";
+import { EXIT } from "../lib.js";
+import { FILE_FLAG, WORKFLOW_FLAG, statusFile } from "./status.js";
+const TAG = "[bkit-status-holes]";
+const readText = (file, log) => {
+    try {
+        return fs.readFileSync(file, "utf-8");
+    }
+    catch (err) {
+        log(`${TAG} ${file} not readable: ${err instanceof Error ? err.message : String(err)}`);
+        return null;
+    }
+};
+function reportLines(v) {
+    const calls = (list) => list.map((c) => `${c.noun} ${c.verb}`).join(", ");
+    const lines = [
+        `${TAG} ADVISORY — ${v.workflow}: ${v.verdict} (${v.observed.steps} step(s), ${v.observed.calls} call(s) observed)`,
+    ];
+    if (v.preJournal)
+        lines.push("  pre-journal run: command evidence not available");
+    if (v.stepHoles.length > 0)
+        lines.push(`  step holes: ${v.stepHoles.join(", ")}`);
+    for (const h of v.evidenceHoles)
+        lines.push(`  evidence hole: ${h.step} lacks ${calls(h.missing)}`);
+    if (v.unexercised.length > 0)
+        lines.push(`  unexercised arms: ${v.unexercised.length} (not holes)`);
+    return lines;
+}
+export const completenessCommand = {
+    noun: "completeness",
+    summary: "Check a run for missing steps and missing bkit commands.",
+    verbs: {
+        check: {
+            summary: "Report the steps and bkit commands a run is missing, from its status.jsonl and the workflow markdown; advisory, always exits 0.",
+            flags: [
+                FILE_FLAG,
+                {
+                    ...WORKFLOW_FLAG,
+                    required: false,
+                    help: "workflow name: design, plan, build, debug, ship; absent = each workflow the file holds rows of",
+                },
+            ],
+            output: {
+                report: "the human-readable report",
+                holey: "true when any checked run has an evidence hole or a step hole",
+                verdicts: "one completeness verdict per checked workflow; empty when nothing could be read",
+            },
+            run: (ctx) => {
+                const file = statusFile(ctx);
+                const text = readText(file, ctx.log);
+                if (text === null) {
+                    ctx.emit({ report: `${TAG} no status.jsonl to check`, holey: false, verdicts: [] });
+                    return EXIT.OK;
+                }
+                const rows = parseRows(text);
+                const given = typeof ctx.flags.workflow === "string" ? ctx.flags.workflow : undefined;
+                const workflows = given === undefined ? inferWorkflows(rows) : [given];
+                const verdicts = [];
+                const lines = [];
+                for (const workflow of workflows) {
+                    const md = readText(path.join(getWorkflowsRoot(), `bkit-${workflow}.md`), ctx.log);
+                    if (md === null) {
+                        ctx.log(`${TAG} bkit-${workflow}.md not readable — skipping ${workflow} (advisory)`);
+                        continue;
+                    }
+                    try {
+                        const { verdict } = readCompleteness(rows, deriveContract(md, workflow));
+                        verdicts.push(verdict);
+                        lines.push(...reportLines(verdict));
+                    }
+                    catch (err) {
+                        ctx.log(`${TAG} ${workflow}: ${err instanceof Error ? err.message : String(err)} — no verdict (advisory)`);
+                    }
+                }
+                if (lines.length === 0)
+                    lines.push(`${TAG} no verdict`);
+                ctx.emit({
+                    report: lines.join("\n"),
+                    holey: verdicts.some((v) => v.holey),
+                    verdicts,
+                });
+                return EXIT.OK;
+            },
+        },
+    },
+};
