diff --git a/.bkit/core/engine/audits/repo/test-file-script.integration.test.ts b/.bkit/core/engine/audits/repo/test-file-script.integration.test.ts
index c0ec0172d..ed821b1fd 100644
--- a/.bkit/core/engine/audits/repo/test-file-script.integration.test.ts
+++ b/.bkit/core/engine/audits/repo/test-file-script.integration.test.ts
@@ -10,13 +10,8 @@ import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
 import { afterEach, describe, expect, it } from "vitest";
-import {
-  isNamedCase,
-  judgeGreen,
-  judgeRed,
-  parseJunit,
-  REPORT_ENV,
-} from "../../commands/workflow/tests.js";
+import { isNamedCase, judgeGreen, judgeRed } from "../../commands/workflow/tests.js";
+import { parseJunit, REPORT_ENV } from "../../commands/workflow/junit.js";
 
 const ROOT = process.cwd();
 
diff --git a/.bkit/core/engine/commands/ci/ci.ts b/.bkit/core/engine/commands/ci/ci.ts
index 71e8adae7..100b299c4 100644
--- a/.bkit/core/engine/commands/ci/ci.ts
+++ b/.bkit/core/engine/commands/ci/ci.ts
@@ -247,7 +247,7 @@ const tail = (text: string) => text.trim().split("\n").slice(-20).join("\n");
  * the signal would. Without the listeners Node dies on the signal and leaves the base
  * worktree registered in the repo.
  */
-async function withCleanup<T>(body: () => T, cleanup: () => void): Promise<T> {
+export async function withCleanup<T>(body: () => T, cleanup: () => void): Promise<T> {
   const received: NodeJS.Signals[] = [];
   const onSignal = (sig: NodeJS.Signals) => received.push(sig);
   for (const sig of CLEANUP_SIGNALS) process.on(sig, onSignal);
diff --git a/.bkit/core/engine/commands/conventions.test.ts b/.bkit/core/engine/commands/conventions.test.ts
index ad6187293..d746914cd 100644
--- a/.bkit/core/engine/commands/conventions.test.ts
+++ b/.bkit/core/engine/commands/conventions.test.ts
@@ -172,6 +172,8 @@ const HELPER_SOURCES = new Set([
   path.join("commands", "workflow", "test-blocks.ts"),
   // The `tests changed` verb, registered on `bkit tests` in tests.ts.
   path.join("commands", "workflow", "tests-changed.ts"),
+  // The JUnit reader and one-file test runner, read by `tests` and the base-commit check.
+  path.join("commands", "workflow", "junit.ts"),
   // The pinned-checksum check behind `ci pins`.
   path.join("commands", "ci", "pins.ts"),
   // Committed-tree gate receipts used by `ci push-gate`.
diff --git a/.bkit/core/engine/commands/workflow/counters.test.ts b/.bkit/core/engine/commands/workflow/counters.test.ts
index eb2b20b70..352b2bd4c 100644
--- a/.bkit/core/engine/commands/workflow/counters.test.ts
+++ b/.bkit/core/engine/commands/workflow/counters.test.ts
@@ -8,7 +8,7 @@ import { afterEach, describe, expect, it, vi } from "vitest";
 import { runCommand } from "../lib";
 import { COMMANDS } from "../registry";
 import type { Step } from "../../ledgers/status";
-import { loopTrend } from "./counters";
+import { loopProgress, loopTrend } from "./counters";
 import { ASK_POINTS } from "../../shared/settings";
 
 const dirs: string[] = [];
@@ -924,6 +924,100 @@ describe("bkit counters progress", () => {
   });
 });
 
+describe("loopProgress with a gate", () => {
+  const verify = (at: string, attempt: number, failures: number) =>
+    done("build", "build-plan-verify", at, {
+      failures,
+      attempt,
+      group: 1,
+      parentSha: `sha${attempt}`,
+    });
+  const gate = (
+    at: string,
+    attempt: number,
+    verdict: string,
+    failures: number | null,
+    step = "build-group-gate-1",
+  ) => ({
+    type: "test-run",
+    workflow: "build",
+    at,
+    step,
+    attempt,
+    run: 1,
+    verdict,
+    exitCode: verdict === "FAIL" ? 1 : 0,
+    failures,
+    scope: "gate",
+    log: "x.log",
+  });
+  const progress = (file: string) => ({
+    code: 0,
+    json: loopProgress(
+      file,
+      path.dirname(file),
+      "build",
+      "build-plan-verify",
+      "build-plan-gaps-remediate",
+      1,
+      false,
+      "build-group-gate",
+    ),
+  });
+
+  it("adds the group gate's failing tests to each verify round", async () => {
+    const file = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      gate("2026-10-01T00:09:00Z", 1, "FAIL", 3),
+      verify("2026-10-01T00:10:00Z", 1, 0),
+      gate("2026-10-01T00:29:00Z", 2, "FAIL", 3),
+      verify("2026-10-01T00:30:00Z", 2, 0),
+    ]);
+    const r = progress(file);
+    expect(r.code).toBe(0);
+    expect(r.json.counts).toBe("3 → 3");
+    expect(r.json.gateCounts).toBe("3 → 3");
+    expect(r.json.rounds.map((x: { gateFailures: number }) => x.gateFailures)).toEqual([3, 3]);
+  });
+
+  it("a red gate row with no failure count makes the round unknown", async () => {
+    const file = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      verify("2026-10-01T00:10:00Z", 1, 2),
+      gate("2026-10-01T00:29:00Z", 2, "FAIL", null),
+      verify("2026-10-01T00:30:00Z", 2, 0),
+    ]);
+    const r = progress(file);
+    expect(r.json.counts).toBe("2 → ?");
+    expect(r.json.rounds[1].failures).toBeNull();
+    expect(r.json.trend).toBe("stuck");
+  });
+
+  it("a red gate row with 0 counted failures makes the round unknown", async () => {
+    const file = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      verify("2026-10-01T00:10:00Z", 1, 2),
+      gate("2026-10-01T00:29:00Z", 2, "FAIL", 0),
+      verify("2026-10-01T00:30:00Z", 2, 0),
+    ]);
+    const r = progress(file);
+    expect(r.json.counts).toBe("2 → ?");
+    expect(r.json.trend).toBe("stuck");
+  });
+
+  it("a verify round whose gate did not run adds no gate failures", async () => {
+    const file = log([
+      started("build", "2026-10-01T00:00:00Z"),
+      verify("2026-10-01T00:10:00Z", 1, 0),
+      gate("2026-10-01T00:29:00Z", 2, "FAIL", 3),
+      verify("2026-10-01T00:30:00Z", 2, 0),
+    ]);
+    const r = progress(file);
+    expect(r.json.gateCounts).toBe("0 → 3");
+    expect(r.json.counts).toBe("0 → 3");
+  });
+});
+
 describe("loopTrend", () => {
   const r = (failures?: number) => ({ failures }) as Step;
   it("a fall without a code change is stuck, not closing", () => {
diff --git a/.bkit/core/engine/commands/workflow/counters.ts b/.bkit/core/engine/commands/workflow/counters.ts
index 1cd7dcba7..41fbc5b6d 100644
--- a/.bkit/core/engine/commands/workflow/counters.ts
+++ b/.bkit/core/engine/commands/workflow/counters.ts
@@ -264,9 +264,49 @@ export function loopTrend(rounds: Step[], codeChanged: boolean | null): LoopTren
   return "stuck";
 }
 
+/**
+ * The failing tests of the latest `test-run` row for `step` and `attempt` in `workflow`'s
+ * active run: 0 with no row, null when unknown (no count, or red with 0 counted failures).
+ */
+function gateFailuresOf(
+  file: string,
+  workflow: string,
+  step: string,
+  attempt: number | undefined,
+): number | null {
+  const rows = readStatusRows(file);
+  let start = -1;
+  rows.forEach((r, i) => {
+    if (r.type === "workflow-started" && r.workflow === workflow) start = i;
+  });
+  const row = rows
+    .slice(start + 1)
+    .filter(
+      (r) =>
+        r.type === "test-run" &&
+        (r.workflow === undefined || r.workflow === workflow) &&
+        r.step === step &&
+        r.attempt === attempt,
+    )
+    .at(-1);
+  if (row === undefined) return 0;
+  const failures = row.failures;
+  if (typeof failures !== "number") return null;
+  if (row.verdict === "FAIL" && failures === 0) return null;
+  return failures;
+}
+
 export interface LoopProgress {
-  rounds: { attempt: number | null; failures: number | null; at: string }[];
+  rounds: {
+    attempt: number | null;
+    failures: number | null;
+    /** The group gate's failing tests for this round; null when unknown. Absent with no gate. */
+    gateFailures?: number | null;
+    at: string;
+  }[];
   counts: string;
+  /** The group gate's failing tests after each round, e.g. `3 → 3`; absent with no gate. */
+  gateCounts?: string;
   codeChanged: boolean | null;
   lastStrategy: string | null;
   nextStrategy: string;
@@ -278,7 +318,10 @@ export interface LoopProgress {
 
 /**
  * A fix loop's progress in the active run: `check` counts problems, `fix` fixes them. With
- * `sinceClean`, only the rounds after `check`'s last clean round: a loop that reopens.
+ * `sinceClean`, only the rounds after `check`'s last clean round: a loop that reopens. With
+ * `gate` (a step prefix, e.g. `build-group-gate`) and a group, each round also counts the
+ * failing tests of the latest same-attempt `{gate}-{group}` test-run row: 0 with no row, and
+ * unknown (null) when that row's count is null or the row is red with 0 counted failures.
  */
 export function loopProgress(
   file: string,
@@ -288,13 +331,25 @@ export function loopProgress(
   fix: string,
   group: number | undefined,
   sinceClean = false,
+  gate?: string,
 ): LoopProgress {
   const runs = readRuns(file);
   const done = (step: string) =>
     sinceClean
       ? activeDoneStepsSinceClean(runs, workflow, { step, group }, check)
       : activeDoneSteps(runs, workflow, { step, group });
-  const rounds = done(check);
+  const checked = done(check);
+  const gateFailures = checked.map((r) =>
+    gate === undefined || group === undefined
+      ? undefined
+      : gateFailuresOf(file, workflow, `${gate}-${group}`, r.attempt),
+  );
+  const rounds = checked.map((r, i) => {
+    const g = gateFailures[i];
+    if (g === undefined) return r;
+    const failures = g === null || r.failures === undefined ? undefined : r.failures + g;
+    return { ...r, failures };
+  });
   const fixes = done(fix);
   const first = rounds[0];
   const last = rounds.at(-1);
@@ -319,12 +374,20 @@ export function loopProgress(
       ? (Date.parse(last.at) - Date.parse(first.at)) / 60000 / (rounds.length - 1)
       : null;
   return {
-    rounds: rounds.map((r) => ({
+    rounds: rounds.map((r, i) => ({
       attempt: r.attempt ?? null,
       failures: r.failures ?? null,
+      ...(gateFailures[i] === undefined ? {} : { gateFailures: gateFailures[i] }),
       at: r.at,
     })),
     counts: rounds.map((r) => (r.failures === undefined ? "?" : String(r.failures))).join(" → "),
+    ...(gate === undefined || group === undefined
+      ? {}
+      : {
+          gateCounts: gateFailures
+            .map((g) => (g === null || g === undefined ? "?" : String(g)))
+            .join(" → "),
+        }),
     codeChanged,
     lastStrategy: fixes.at(-1)?.strategy ?? null,
     nextStrategy: nextStrategy(ladder),
@@ -647,8 +710,11 @@ export const countersCommand: CommandSpec = {
         },
       ],
       output: {
-        rounds: "the check rounds counted: attempt, failures, at",
-        counts: "problem count after each round, e.g. 5 → 2",
+        rounds: "the check rounds counted: attempt, failures, gateFailures, at",
+        counts:
+          "problem count after each round, e.g. 5 → 2 (with a gate, the gate's failing tests are added)",
+        gateCounts:
+          "the group gate's failing tests after each round, e.g. 3 → 3 (absent without a gate)",
         codeChanged:
           "source changed between the first and last check round (null when git cannot tell)",
         lastStrategy: "strategy of the last fix round (null when none ran)",
diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index f8c08742e..33a253835 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -252,6 +252,58 @@ describe("bkit decisions compose", () => {
     expect(text).toMatch(/\*\*Q1 — Holistic verify:\*\* decide the items below/);
   });
 
+  it("prints the group gate's failing tests per round for the verify loop", async () => {
+    const { root, logs } = checkout();
+    const status = path.join(logs, "status.jsonl");
+    const verifyRow = (at: string, attempt: number) => ({
+      type: "step-done",
+      workflow: "build",
+      step: "build-plan-verify",
+      status: "DONE",
+      at,
+      group: 1,
+      attempt,
+      failures: 0,
+    });
+    const gateRow = (at: string, attempt: number) => ({
+      type: "test-run",
+      workflow: "build",
+      at,
+      step: "build-group-gate-1",
+      attempt,
+      run: 1,
+      verdict: "FAIL",
+      exitCode: 1,
+      failures: 3,
+      scope: "gate",
+      log: "x.log",
+    });
+    fs.writeFileSync(
+      status,
+      [
+        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
+        gateRow("2026-10-01T00:09:00Z", 1),
+        verifyRow("2026-10-01T00:10:00Z", 1),
+        gateRow("2026-10-01T00:29:00Z", 2),
+        verifyRow("2026-10-01T00:30:00Z", 2),
+      ]
+        .map((x) => JSON.stringify(x))
+        .join("\n") + "\n",
+    );
+    const { r, out } = await compose(
+      root,
+      logs,
+      ITEMS,
+      "--loop=verify",
+      `--file=${status}`,
+      "--group=1",
+    );
+    expect(r.code).toBe(0);
+    const text = fs.readFileSync(out, "utf-8");
+    expect(text).toContain("Group gate failures after each round: 3 → 3");
+    expect(text).toContain("Problems after each round: 3 → 3");
+  });
+
   it("--loop needs --file", async () => {
     const { root, logs } = checkout();
     expect((await compose(root, logs, ITEMS, "--loop=verify")).r.code).toBe(2);
diff --git a/.bkit/core/engine/commands/workflow/decisions.ts b/.bkit/core/engine/commands/workflow/decisions.ts
index 6b2cb9d02..67e02d01c 100644
--- a/.bkit/core/engine/commands/workflow/decisions.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.ts
@@ -172,13 +172,14 @@ interface ComposeItem {
 
 const LOOPS: Record<
   string,
-  { title: string; check: string; fix: string; point: string; sinceClean?: true }
+  { title: string; check: string; fix: string; point: string; sinceClean?: true; gate?: string }
 > = {
   verify: {
     title: "Verify",
     check: "build-plan-verify",
     fix: "build-plan-gaps-remediate",
     point: "verify",
+    gate: "build-group-gate",
   },
   // The whole-feature check reopens after each clean round, so its loop starts there.
   holistic: {
@@ -388,6 +389,7 @@ export const decisionsCommand: CommandSpec = {
             loop.fix,
             positiveInt(ctx.flags.group, "group"),
             loop.sinceClean === true,
+            loop.gate,
           );
           const attempt = str(ctx.flags.attempt) ?? String(p.rounds.length);
           const max = str(ctx.flags.max) ?? "?";
@@ -405,6 +407,9 @@ export const decisionsCommand: CommandSpec = {
             "## Progress",
             "",
             `Problems after each round: ${p.counts || "none recorded"}`,
+            ...(p.gateCounts === undefined
+              ? []
+              : [`Group gate failures after each round: ${p.gateCounts}`]),
             `Code changed: ${changed}`,
             `Strategy: ${p.lastStrategy ?? "none"} → next ${p.nextStrategy}${p.finalSpent ? " (FINAL already used)" : ""}`,
             `Minutes per round: ${p.minutesPerRound ?? "unknown"}`,
diff --git a/.bkit/core/engine/commands/workflow/junit.test.ts b/.bkit/core/engine/commands/workflow/junit.test.ts
new file mode 100644
index 000000000..679401283
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/junit.test.ts
@@ -0,0 +1,48 @@
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+
+import { afterEach, describe, expect, it } from "vitest";
+
+import { countReportFailures, parseJunit, reportFailures } from "./junit";
+
+const dirs: string[] = [];
+const tmp = () => {
+  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-junit-"));
+  dirs.push(dir);
+  return dir;
+};
+
+afterEach(() => {
+  for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
+});
+
+const report = (body: string) => `<testsuite>${body}</testsuite>`;
+
+describe("parseJunit", () => {
+  it("reads classname and file as null when a case carries neither", () => {
+    expect(parseJunit(report('<testcase name="a"/>'))[0]).toMatchObject({
+      name: "a",
+      classname: null,
+      file: null,
+    });
+  });
+});
+
+describe("countReportFailures", () => {
+  it("counts failures and errors, 0 for a clean report and null with no report", () => {
+    const dir = tmp();
+    expect(countReportFailures(dir)).toBeNull();
+    fs.writeFileSync(path.join(dir, "ok.xml"), report('<testcase name="a"/>'));
+    expect(countReportFailures(dir)).toBe(0);
+    expect(reportFailures(dir)).toBeNull();
+    fs.writeFileSync(
+      path.join(dir, "bad.xml"),
+      report(
+        '<testcase name="b"><failure message="x"/></testcase><testcase name="c"><error/></testcase>',
+      ),
+    );
+    expect(countReportFailures(dir)).toBe(2);
+    expect(reportFailures(dir)?.map((c) => c.name)).toEqual(["b", "c"]);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/junit.ts b/.bkit/core/engine/commands/workflow/junit.ts
new file mode 100644
index 000000000..9cf46a023
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/junit.ts
@@ -0,0 +1,143 @@
+// JUnit reading and the one-file test runner. A leaf module: it imports none of
+// `tests.ts`, `steps.ts` or `runs.ts`, so any of them may import it.
+
+import { spawnSync } from "node:child_process";
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+
+import { BKIT_TEST_FILE_SCRIPT } from "../../install/manifest.js";
+import { scriptCommand, testCommand } from "../../shared/package-manager.js";
+
+/** The env var naming the JUnit report path `bkit:test:file` must write. */
+export const REPORT_ENV = "BKIT_TEST_REPORT";
+
+/**
+ * Run argv with stdout and stderr interleaved into `log` (like `> log 2>&1`).
+ * Exit 127 when the binary is missing; 128 + n when killed by signal n.
+ */
+export function runToLog(
+  argv: string[],
+  cwd: string,
+  log: string,
+  env?: Record<string, string>,
+): number {
+  fs.mkdirSync(path.dirname(log), { recursive: true });
+  const fd = fs.openSync(log, "w");
+  const protectedArgv = testCommand(argv);
+  const res = spawnSync(protectedArgv[0]!, protectedArgv.slice(1), {
+    cwd,
+    stdio: ["ignore", fd, fd],
+    env: env === undefined ? process.env : { ...process.env, ...env },
+  });
+  fs.closeSync(fd);
+  if (res.error) {
+    fs.appendFileSync(log, `${argv[0]}: not found on PATH (${res.error.message})\n`);
+    return 127;
+  }
+  if (res.status !== null) return res.status;
+  return 128 + ((res.signal ? os.constants.signals[res.signal] : undefined) ?? 1);
+}
+
+/** Failing plus erroring cases across every `*.xml` under `dir`; null when there is no report. */
+function failingCases(dir: string): JunitCase[] | null {
+  const xml = (fs.readdirSync(dir, { recursive: true }) as string[]).filter(
+    (f) => f.endsWith(".xml") && fs.statSync(path.join(dir, f)).isFile(),
+  );
+  if (xml.length === 0) return null;
+  return xml
+    .flatMap((f) => parseJunit(fs.readFileSync(path.join(dir, f), "utf-8")))
+    .filter((c) => c.state === "failure" || c.state === "error");
+}
+
+/** The failing plus erroring cases of every `*.xml` under `dir`; null with none. */
+export function reportFailures(dir: string): JunitCase[] | null {
+  const failing = failingCases(dir);
+  return failing === null || failing.length === 0 ? null : failing;
+}
+
+/** The number of failing plus erroring cases across every `*.xml` under `dir`; null when there is no report. */
+export function countReportFailures(dir: string): number | null {
+  return failingCases(dir)?.length ?? null;
+}
+
+export type CaseState = "passed" | "failure" | "error" | "skipped";
+export interface JunitCase {
+  name: string;
+  state: CaseState;
+  /** The case's `classname` attribute, null when absent. */
+  classname: string | null;
+  /** The case's `file` attribute, null when absent. */
+  file: string | null;
+  /** The failure element's `message` attribute: the runner's one-line summary. */
+  message: string;
+  /** The failure element's text: the assertion output, where some runners put the detail. */
+  detail: string;
+}
+
+const XML_ENTITIES: Record<string, string> = {
+  amp: "&",
+  lt: "<",
+  gt: ">",
+  quot: '"',
+  apos: "'",
+};
+
+function decodeXml(s: string): string {
+  return s.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (whole, e: string) => {
+    if (!e.startsWith("#")) return XML_ENTITIES[e.toLowerCase()] ?? whole;
+    const cp = /^#x/i.test(e) ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
+    return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : whole;
+  });
+}
+
+const ATTRS = String.raw`((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)`;
+
+function attr(attrs: string, name: string): string | undefined {
+  const m = new RegExp(String.raw`\s${name}\s*=\s*(?:"([^"]*)"|'([^']*)')`).exec(attrs);
+  return m ? decodeXml(m[1] ?? m[2] ?? "") : undefined;
+}
+
+/** CDATA text as escaped character data, so a tag inside it never ends an element early. */
+const escapeCdata = (xml: string) =>
+  xml.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_, text: string) =>
+    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
+  );
+
+/** Every `<testcase>` in a JUnit report: its name, outcome, first failure message and detail. */
+export function parseJunit(xml: string): JunitCase[] {
+  const body = escapeCdata(xml).replace(/<!--[\s\S]*?-->/g, "");
+  const cases: JunitCase[] = [];
+  const testcase = new RegExp(String.raw`<testcase${ATTRS}\s*(?:\/>|>([\s\S]*?)<\/testcase>)`, "g");
+  const outcome = new RegExp(
+    String.raw`<(failure|error|skipped)${ATTRS}\s*(?:\/>|>([\s\S]*?)<\/\1>)`,
+  );
+  for (const m of body.matchAll(testcase)) {
+    const child = outcome.exec(m[2] ?? "");
+    cases.push({
+      name: attr(m[1] ?? "", "name") ?? "",
+      classname: attr(m[1] ?? "", "classname") ?? null,
+      file: attr(m[1] ?? "", "file") ?? null,
+      state: child ? (child[1] as CaseState) : "passed",
+      message: child ? (attr(child[2] ?? "", "message") ?? "") : "",
+      detail: child ? decodeXml((child[3] ?? "").replace(/<[^>]*>/g, "")).trim() : "",
+    });
+  }
+  return cases;
+}
+
+/** Run one test file through `bkit:test:file`; the report is read and removed. */
+export function runTestFile(
+  top: string,
+  test: string,
+  log: string,
+): { exitCode: number; cases: JunitCase[] | null } {
+  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-test-report-"));
+  const report = path.join(dir, "junit.xml");
+  const exitCode = runToLog([...scriptCommand(BKIT_TEST_FILE_SCRIPT), test], top, log, {
+    [REPORT_ENV]: report,
+  });
+  const cases = fs.existsSync(report) ? parseJunit(fs.readFileSync(report, "utf-8")) : null;
+  fs.rmSync(dir, { recursive: true, force: true });
+  return { exitCode, cases };
+}
diff --git a/.bkit/core/engine/commands/workflow/runtime.ts b/.bkit/core/engine/commands/workflow/runtime.ts
index 9a124792b..cf46c22ca 100644
--- a/.bkit/core/engine/commands/workflow/runtime.ts
+++ b/.bkit/core/engine/commands/workflow/runtime.ts
@@ -295,10 +295,7 @@ export const runtimeCommand: CommandSpec = {
       run: (ctx) => {
         const workflow = str(ctx.flags.workflow);
         const events: ReadonlyArray<Record<string, unknown>> = readStatusEvents(statusFile(ctx));
-        const rows = events
-          .filter((r) => r.type === "runtime-resolved")
-          .filter((r) => workflow === undefined || r.workflow === workflow);
-        const row = rows[rows.length - 1];
+        const row = latestRuntimeRow(events, workflow);
         if (!row) {
           ctx.log(
             `no runtime-resolved row${workflow ? ` for ${workflow}` : ""} — Step 1 never recorded the runtime`,
@@ -333,3 +330,14 @@ export const runtimeCommand: CommandSpec = {
     },
   },
 };
+
+/** The latest `runtime-resolved` row, limited to `workflow` when given; undefined with none. */
+export function latestRuntimeRow(
+  events: ReadonlyArray<Record<string, unknown>>,
+  workflow?: string,
+): Record<string, unknown> | undefined {
+  const rows = events
+    .filter((r) => r.type === "runtime-resolved")
+    .filter((r) => workflow === undefined || r.workflow === workflow);
+  return rows[rows.length - 1];
+}
diff --git a/.bkit/core/engine/commands/workflow/tests.test.ts b/.bkit/core/engine/commands/workflow/tests.test.ts
index add55c0f7..41803fc48 100644
--- a/.bkit/core/engine/commands/workflow/tests.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -25,7 +25,6 @@ import {
   gateScope,
   judgeGreen,
   judgeRed,
-  parseJunit,
   readTestFirst,
   redEntries,
   resolveGate,
@@ -34,8 +33,8 @@ import {
   testBlock,
   testSpan,
   testsCommand,
-  type JunitCase,
 } from "./tests";
+import { countReportFailures, parseJunit, reportFailures, type JunitCase } from "./junit";
 
 const dirs: string[] = [];
 const tmp = (prefix: string) => {
@@ -715,15 +714,31 @@ describe("parseJunit", () => {
       ),
     );
     expect(cases).toEqual<JunitCase[]>([
-      { name: "clamp > passes", state: "passed", message: "", detail: "" },
+      {
+        name: "clamp > passes",
+        state: "passed",
+        message: "",
+        detail: "",
+        classname: "f",
+        file: null,
+      },
       {
         name: `clamp > ${NAME}`,
         state: "failure",
         message: "expected +0 to be 5 // Object.is & co",
         detail: "trace",
+        classname: "f",
+        file: null,
       },
-      { name: "boom", state: "error", message: "TypeError", detail: "" },
-      { name: "later", state: "skipped", message: "", detail: "" },
+      {
+        name: "boom",
+        state: "error",
+        message: "TypeError",
+        detail: "",
+        classname: null,
+        file: null,
+      },
+      { name: "later", state: "skipped", message: "", detail: "", classname: null, file: null },
     ]);
   });
 
@@ -735,12 +750,21 @@ describe("parseJunit", () => {
       ),
     );
     expect(cases).toEqual<JunitCase[]>([
-      { name: "t", state: "failure", message: "m", detail: "expected 12 <total> to be 0" },
+      {
+        name: "t",
+        state: "failure",
+        message: "m",
+        detail: "expected 12 <total> to be 0",
+        classname: null,
+        file: null,
+      },
       {
         name: "u",
         state: "failure",
         message: "",
         detail: "AssertionError: expected 1\n  at u.test.ts:4",
+        classname: null,
+        file: null,
       },
     ]);
   });
@@ -758,12 +782,47 @@ describe("parseJunit", () => {
     ]);
   });
 
+  it("keeps each case's classname and file attribute", () => {
+    const cases = parseJunit(
+      junit(
+        `<testcase classname="a.test.ts" file="src/a.test.ts" name="one"/>`,
+        `<testcase name="two"><failure message="m"/></testcase>`,
+      ),
+    );
+    expect(cases.map((c) => [c.name, c.classname, c.file])).toEqual([
+      ["one", "a.test.ts", "src/a.test.ts"],
+      ["two", null, null],
+    ]);
+  });
+
   it("no testcase elements -> empty", () => {
     expect(parseJunit("<testsuites/>")).toEqual([]);
     expect(parseJunit("not xml")).toEqual([]);
   });
 });
 
+describe("reportFailures", () => {
+  it("returns the failing and erroring cases of every report, or null with none", () => {
+    const dir = tmp("bkit-report-failures-");
+    expect(reportFailures(dir)).toBeNull();
+    fs.mkdirSync(path.join(dir, "sub"));
+    fs.writeFileSync(path.join(dir, "a.xml"), junit(passed("ok"), failed("bad one")));
+    fs.writeFileSync(
+      path.join(dir, "sub", "b.xml"),
+      junit(`<testcase name="boom"><error message="TypeError"/></testcase>`, skipped("later")),
+    );
+    const found = reportFailures(dir);
+    expect(found?.map((c) => [c.name, c.state]).sort()).toEqual([
+      ["bad one", "failure"],
+      ["boom", "error"],
+    ]);
+    expect(countReportFailures(dir)).toBe(2);
+    const clean = tmp("bkit-report-clean-");
+    fs.writeFileSync(path.join(clean, "c.xml"), junit(passed("ok")));
+    expect(reportFailures(clean)).toBeNull();
+  });
+});
+
 describe("judgeRed / judgeGreen — the named test, never the exit code alone", () => {
   const p = (xml: string) => parseJunit(junit(xml));
   const FILE = "src/clamp.test.ts";
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index 58b208059..84de44b3d 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -42,11 +42,7 @@ import {
 } from "../lib.js";
 import { parseJson } from "../../shared/json.js";
 import { readPackageJson } from "../../shared/package-json.js";
-import {
-  COULD_NOT_RUN_EXIT_CODES,
-  scriptCommand,
-  testCommand,
-} from "../../shared/package-manager.js";
+import { COULD_NOT_RUN_EXIT_CODES, scriptCommand } from "../../shared/package-manager.js";
 import { CONFIG_DEFAULTS, readBkitConfig, type TaskCaps } from "../../shared/settings.js";
 import {
   FILE_FLAG,
@@ -68,6 +64,7 @@ import {
   type PlanTaskBlock,
 } from "./plan-blocks.js";
 import { writeStepRow } from "./steps.js";
+import { REPORT_ENV, countReportFailures, runTestFile, runToLog, type JunitCase } from "./junit.js";
 import { appendRecord, clampFile, type ClampRecord } from "./context.js";
 import { testsChangedVerb } from "./tests-changed.js";
 
@@ -117,33 +114,6 @@ export function resolveGate(dir: string, candidates: readonly string[]): string
 /** The scope string the status rows record: the package runner plus the script name. */
 export const gateScope = (gate: string) => scriptCommand(gate).join(" ");
 
-/**
- * Run argv with stdout and stderr interleaved into `log` (like `> log 2>&1`).
- * Exit 127 when the binary is missing; 128 + n when killed by signal n.
- */
-export function runToLog(
-  argv: string[],
-  cwd: string,
-  log: string,
-  env?: Record<string, string>,
-): number {
-  fs.mkdirSync(path.dirname(log), { recursive: true });
-  const fd = fs.openSync(log, "w");
-  const protectedArgv = testCommand(argv);
-  const res = spawnSync(protectedArgv[0]!, protectedArgv.slice(1), {
-    cwd,
-    stdio: ["ignore", fd, fd],
-    env: env === undefined ? process.env : { ...process.env, ...env },
-  });
-  fs.closeSync(fd);
-  if (res.error) {
-    fs.appendFileSync(log, `${argv[0]}: not found on PATH (${res.error.message})\n`);
-    return 127;
-  }
-  if (res.status !== null) return res.status;
-  return 128 + ((res.signal ? os.constants.signals[res.signal] : undefined) ?? 1);
-}
-
 /** `{log}.reports`, emptied: a previous attempt's reports never count toward this one. */
 function freshReportDir(log: string): string {
   const dir = `${log}.reports`;
@@ -152,17 +122,6 @@ function freshReportDir(log: string): string {
   return dir;
 }
 
-/** Failing plus erroring test cases across every `*.xml` under `dir`; null when there is none. */
-export function countReportFailures(dir: string): number | null {
-  const xml = (fs.readdirSync(dir, { recursive: true }) as string[]).filter(
-    (f) => f.endsWith(".xml") && fs.statSync(path.join(dir, f)).isFile(),
-  );
-  if (xml.length === 0) return null;
-  return xml
-    .flatMap((f) => parseJunit(fs.readFileSync(path.join(dir, f), "utf-8")))
-    .filter((c) => c.state === "failure" || c.state === "error").length;
-}
-
 const tailLines = (file: string, n: number) =>
   fs
     .readFileSync(file, "utf-8")
@@ -227,8 +186,6 @@ function appendTestRun(
 // Test-first: JUnit reading, plan `Test first:` lines, red / green judgement
 // ---------------------------------------------------------------------------
 
-/** The env var naming the JUnit report path `bkit:test:file` must write. */
-export const REPORT_ENV = "BKIT_TEST_REPORT";
 /** The status row step a group's red writes: one row per `tests red` run, a state and blob per planned test. */
 export const RED_STEP = "build-tests-red";
 
@@ -539,65 +496,6 @@ const NO_TEST_FILE_HINT =
   `argument and writes a JUnit report to $${REPORT_ENV} ` +
   "(.bkit/workflows.md § Local gate scripts)";
 
-export type CaseState = "passed" | "failure" | "error" | "skipped";
-export interface JunitCase {
-  name: string;
-  state: CaseState;
-  /** The failure element's `message` attribute: the runner's one-line summary. */
-  message: string;
-  /** The failure element's text: the assertion output, where some runners put the detail. */
-  detail: string;
-}
-
-const XML_ENTITIES: Record<string, string> = {
-  amp: "&",
-  lt: "<",
-  gt: ">",
-  quot: '"',
-  apos: "'",
-};
-
-function decodeXml(s: string): string {
-  return s.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (whole, e: string) => {
-    if (!e.startsWith("#")) return XML_ENTITIES[e.toLowerCase()] ?? whole;
-    const cp = /^#x/i.test(e) ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
-    return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : whole;
-  });
-}
-
-const ATTRS = String.raw`((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)`;
-
-function attr(attrs: string, name: string): string | undefined {
-  const m = new RegExp(String.raw`\s${name}\s*=\s*(?:"([^"]*)"|'([^']*)')`).exec(attrs);
-  return m ? decodeXml(m[1] ?? m[2] ?? "") : undefined;
-}
-
-/** CDATA text as escaped character data, so a tag inside it never ends an element early. */
-const escapeCdata = (xml: string) =>
-  xml.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_, text: string) =>
-    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
-  );
-
-/** Every `<testcase>` in a JUnit report: its name, outcome, first failure message and detail. */
-export function parseJunit(xml: string): JunitCase[] {
-  const body = escapeCdata(xml).replace(/<!--[\s\S]*?-->/g, "");
-  const cases: JunitCase[] = [];
-  const testcase = new RegExp(String.raw`<testcase${ATTRS}\s*(?:\/>|>([\s\S]*?)<\/testcase>)`, "g");
-  const outcome = new RegExp(
-    String.raw`<(failure|error|skipped)${ATTRS}\s*(?:\/>|>([\s\S]*?)<\/\1>)`,
-  );
-  for (const m of body.matchAll(testcase)) {
-    const child = outcome.exec(m[2] ?? "");
-    cases.push({
-      name: attr(m[1] ?? "", "name") ?? "",
-      state: child ? (child[1] as CaseState) : "passed",
-      message: child ? (attr(child[2] ?? "", "message") ?? "") : "",
-      detail: child ? decodeXml((child[3] ?? "").replace(/<[^>]*>/g, "")).trim() : "",
-    });
-  }
-  return cases;
-}
-
 /** A report case is the named test when its name is the name, or ends with it as the last segment. */
 export const isNamedCase = (caseName: string, want: string) =>
   caseName === want || caseName.endsWith(` ${want}`);
@@ -1118,22 +1016,6 @@ export function planExistence(text: string, root: string): ExistenceFinding[] {
   return out.sort((a, b) => a.line - b.line);
 }
 
-/** Run one test file through `bkit:test:file`; the report is read and removed. */
-function runTestFile(
-  top: string,
-  test: string,
-  log: string,
-): { exitCode: number; cases: JunitCase[] | null } {
-  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-test-report-"));
-  const report = path.join(dir, "junit.xml");
-  const exitCode = runToLog([...scriptCommand(BKIT_TEST_FILE_SCRIPT), test], top, log, {
-    [REPORT_ENV]: report,
-  });
-  const cases = fs.existsSync(report) ? parseJunit(fs.readFileSync(report, "utf-8")) : null;
-  fs.rmSync(dir, { recursive: true, force: true });
-  return { exitCode, cases };
-}
-
 const couldNotRunMessage = (exitCode: number) =>
   `${gateScope(BKIT_TEST_FILE_SCRIPT)} could not run (exit ${exitCode}: ${exitCode === 126 ? "not executable" : "command not found"}) — no test executed`;
 
diff --git a/.bkit/core/engine/commands/workflow/worktrees.ts b/.bkit/core/engine/commands/workflow/worktrees.ts
index 3b19afafe..5e9f9f23b 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.ts
@@ -516,7 +516,7 @@ function carryLeftovers(
 // ---------------------------------------------------------------------------
 
 /** Copy each `worktreeCopy` entry from the main checkout; a missing one is narrated, never fatal. */
-function copyListed(root: string, wt: string, entries: string[], log: (m: string) => void) {
+export function copyListed(root: string, wt: string, entries: string[], log: (m: string) => void) {
   const copied: string[] = [];
   const copyMissing: string[] = [];
   for (const entry of entries) {
@@ -637,8 +637,12 @@ function allowDirenv(root: string, wt: string, log: (m: string) => void): boolea
 }
 
 /** Run the frozen install in `wt`; the exit status, with a spawn failure read as "could not run". */
-function install(wt: string, log: (m: string) => void): number {
-  const [cmd, ...args] = installCommand({ frozen: true });
+export function install(
+  wt: string,
+  log: (m: string) => void,
+  opts: { preferOffline?: boolean } = {},
+): number {
+  const [cmd, ...args] = installCommand({ frozen: true, preferOffline: opts.preferOffline });
   const res = spawnSync(cmd!, args, { cwd: wt, encoding: "utf-8", maxBuffer: 1 << 26 });
   const status = res.error ? 127 : (res.status ?? 1);
   if (status !== 0) {
diff --git a/.bkit/core/engine/shared/package-manager.test.ts b/.bkit/core/engine/shared/package-manager.test.ts
index 3e7292664..5bebee15d 100644
--- a/.bkit/core/engine/shared/package-manager.test.ts
+++ b/.bkit/core/engine/shared/package-manager.test.ts
@@ -29,6 +29,15 @@ describe("shared/package-manager", () => {
     expect(installCommand({ frozen: false })).toEqual(["pnpm", "install"]);
   });
 
+  it("a prefer-offline frozen install adds --prefer-offline", () => {
+    expect(installCommand({ frozen: true, preferOffline: true })).toEqual([
+      "pnpm",
+      "install",
+      "--frozen-lockfile",
+      "--prefer-offline",
+    ]);
+  });
+
   it("regenerates the pnpm lockfile without touching node_modules", () => {
     expect(LOCKFILE_REGENERATE["pnpm-lock.yaml"]).toEqual(["pnpm", "install", "--lockfile-only"]);
   });
diff --git a/.bkit/core/engine/shared/package-manager.ts b/.bkit/core/engine/shared/package-manager.ts
index 2c9e1dc0a..8a4a18c0a 100644
--- a/.bkit/core/engine/shared/package-manager.ts
+++ b/.bkit/core/engine/shared/package-manager.ts
@@ -19,9 +19,13 @@ export const PACKAGE_RUNNER = "pnpm";
 /** argv for running one `package.json` script, e.g. `bkit:gate:static-unit`. */
 export const scriptCommand = (script: string): string[] => [PACKAGE_RUNNER, script];
 
-/** argv for installing dependencies; `frozen` refuses to change the lockfile. */
-export const installCommand = (opts: { frozen: boolean }): string[] =>
-  opts.frozen ? [PACKAGE_RUNNER, "install", "--frozen-lockfile"] : [PACKAGE_RUNNER, "install"];
+/** argv for installing dependencies; `frozen` refuses to change the lockfile, `preferOffline` reads the local store first. */
+export const installCommand = (opts: { frozen: boolean; preferOffline?: boolean }): string[] => [
+  PACKAGE_RUNNER,
+  "install",
+  ...(opts.frozen ? ["--frozen-lockfile"] : []),
+  ...(opts.preferOffline ? ["--prefer-offline"] : []),
+];
 
 /**
  * argv that regenerates a lockfile from its manifest, keyed by lockfile name.
diff --git a/dist/commands/ci/ci.js b/dist/commands/ci/ci.js
index 54d26ec26..86511a0d9 100644
--- a/dist/commands/ci/ci.js
+++ b/dist/commands/ci/ci.js
@@ -198,7 +198,7 @@ const tail = (text) => text.trim().split("\n").slice(-20).join("\n");
  * the signal would. Without the listeners Node dies on the signal and leaves the base
  * worktree registered in the repo.
  */
-async function withCleanup(body, cleanup) {
+export async function withCleanup(body, cleanup) {
     const received = [];
     const onSignal = (sig) => received.push(sig);
     for (const sig of CLEANUP_SIGNALS)
diff --git a/dist/commands/workflow/counters.js b/dist/commands/workflow/counters.js
index 036dfc364..bf557df24 100644
--- a/dist/commands/workflow/counters.js
+++ b/dist/commands/workflow/counters.js
@@ -184,16 +184,56 @@ export function loopTrend(rounds, codeChanged) {
         return "closing";
     return "stuck";
 }
+/**
+ * The failing tests of the latest `test-run` row for `step` and `attempt` in `workflow`'s
+ * active run: 0 with no row, null when unknown (no count, or red with 0 counted failures).
+ */
+function gateFailuresOf(file, workflow, step, attempt) {
+    const rows = readStatusRows(file);
+    let start = -1;
+    rows.forEach((r, i) => {
+        if (r.type === "workflow-started" && r.workflow === workflow)
+            start = i;
+    });
+    const row = rows
+        .slice(start + 1)
+        .filter((r) => r.type === "test-run" &&
+        (r.workflow === undefined || r.workflow === workflow) &&
+        r.step === step &&
+        r.attempt === attempt)
+        .at(-1);
+    if (row === undefined)
+        return 0;
+    const failures = row.failures;
+    if (typeof failures !== "number")
+        return null;
+    if (row.verdict === "FAIL" && failures === 0)
+        return null;
+    return failures;
+}
 /**
  * A fix loop's progress in the active run: `check` counts problems, `fix` fixes them. With
- * `sinceClean`, only the rounds after `check`'s last clean round: a loop that reopens.
+ * `sinceClean`, only the rounds after `check`'s last clean round: a loop that reopens. With
+ * `gate` (a step prefix, e.g. `build-group-gate`) and a group, each round also counts the
+ * failing tests of the latest same-attempt `{gate}-{group}` test-run row: 0 with no row, and
+ * unknown (null) when that row's count is null or the row is red with 0 counted failures.
  */
-export function loopProgress(file, cwd, workflow, check, fix, group, sinceClean = false) {
+export function loopProgress(file, cwd, workflow, check, fix, group, sinceClean = false, gate) {
     const runs = readRuns(file);
     const done = (step) => sinceClean
         ? activeDoneStepsSinceClean(runs, workflow, { step, group }, check)
         : activeDoneSteps(runs, workflow, { step, group });
-    const rounds = done(check);
+    const checked = done(check);
+    const gateFailures = checked.map((r) => gate === undefined || group === undefined
+        ? undefined
+        : gateFailuresOf(file, workflow, `${gate}-${group}`, r.attempt));
+    const rounds = checked.map((r, i) => {
+        const g = gateFailures[i];
+        if (g === undefined)
+            return r;
+        const failures = g === null || r.failures === undefined ? undefined : r.failures + g;
+        return { ...r, failures };
+    });
     const fixes = done(fix);
     const first = rounds[0];
     const last = rounds.at(-1);
@@ -219,12 +259,20 @@ export function loopProgress(file, cwd, workflow, check, fix, group, sinceClean
         ? (Date.parse(last.at) - Date.parse(first.at)) / 60000 / (rounds.length - 1)
         : null;
     return {
-        rounds: rounds.map((r) => ({
+        rounds: rounds.map((r, i) => ({
             attempt: r.attempt ?? null,
             failures: r.failures ?? null,
+            ...(gateFailures[i] === undefined ? {} : { gateFailures: gateFailures[i] }),
             at: r.at,
         })),
         counts: rounds.map((r) => (r.failures === undefined ? "?" : String(r.failures))).join(" → "),
+        ...(gate === undefined || group === undefined
+            ? {}
+            : {
+                gateCounts: gateFailures
+                    .map((g) => (g === null || g === undefined ? "?" : String(g)))
+                    .join(" → "),
+            }),
         codeChanged,
         lastStrategy: fixes.at(-1)?.strategy ?? null,
         nextStrategy: nextStrategy(ladder),
@@ -520,8 +568,9 @@ export const countersCommand = {
                 },
             ],
             output: {
-                rounds: "the check rounds counted: attempt, failures, at",
-                counts: "problem count after each round, e.g. 5 → 2",
+                rounds: "the check rounds counted: attempt, failures, gateFailures, at",
+                counts: "problem count after each round, e.g. 5 → 2 (with a gate, the gate's failing tests are added)",
+                gateCounts: "the group gate's failing tests after each round, e.g. 3 → 3 (absent without a gate)",
                 codeChanged: "source changed between the first and last check round (null when git cannot tell)",
                 lastStrategy: "strategy of the last fix round (null when none ran)",
                 nextStrategy: "strategy the next fix round would use",
diff --git a/dist/commands/workflow/decisions.js b/dist/commands/workflow/decisions.js
index 2bf147cb6..09be98a9b 100644
--- a/dist/commands/workflow/decisions.js
+++ b/dist/commands/workflow/decisions.js
@@ -133,6 +133,7 @@ const LOOPS = {
         check: "build-plan-verify",
         fix: "build-plan-gaps-remediate",
         point: "verify",
+        gate: "build-group-gate",
     },
     // The whole-feature check reopens after each clean round, so its loop starts there.
     holistic: {
@@ -317,7 +318,7 @@ export const decisionsCommand = {
                         throw new CommandError(EXIT.USAGE, "--loop must be verify, holistic or tests");
                     if (ctx.flags.file === undefined)
                         throw new CommandError(EXIT.USAGE, "--loop needs --file");
-                    const p = loopProgress(path.resolve(ctx.cwd, String(ctx.flags.file)), ctx.cwd, "build", loop.check, loop.fix, positiveInt(ctx.flags.group, "group"), loop.sinceClean === true);
+                    const p = loopProgress(path.resolve(ctx.cwd, String(ctx.flags.file)), ctx.cwd, "build", loop.check, loop.fix, positiveInt(ctx.flags.group, "group"), loop.sinceClean === true, loop.gate);
                     const attempt = str(ctx.flags.attempt) ?? String(p.rounds.length);
                     const max = str(ctx.flags.max) ?? "?";
                     const changed = p.codeChanged === null ? "unknown" : p.codeChanged ? "yes" : "no";
@@ -328,7 +329,9 @@ export const decisionsCommand = {
                         worse: "More problems than the first round.",
                     }[p.trend];
                     loopRecommended = p.recommend === "stop" ? "Decide" : "Try again";
-                    lines.push(`build ${loop.point}: attempt ${attempt} of ${max}`, "", "## Progress", "", `Problems after each round: ${p.counts || "none recorded"}`, `Code changed: ${changed}`, `Strategy: ${p.lastStrategy ?? "none"} → next ${p.nextStrategy}${p.finalSpent ? " (FINAL already used)" : ""}`, `Minutes per round: ${p.minutesPerRound ?? "unknown"}`, `Trend: ${p.trend}`, "", ...itemLines(1, {
+                    lines.push(`build ${loop.point}: attempt ${attempt} of ${max}`, "", "## Progress", "", `Problems after each round: ${p.counts || "none recorded"}`, ...(p.gateCounts === undefined
+                        ? []
+                        : [`Group gate failures after each round: ${p.gateCounts}`]), `Code changed: ${changed}`, `Strategy: ${p.lastStrategy ?? "none"} → next ${p.nextStrategy}${p.finalSpent ? " (FINAL already used)" : ""}`, `Minutes per round: ${p.minutesPerRound ?? "unknown"}`, `Trend: ${p.trend}`, "", ...itemLines(1, {
                         title: loop.title,
                         question: loopRecommended === "Try again"
                             ? `another fix round? ${trendLine}`
diff --git a/dist/commands/workflow/junit.js b/dist/commands/workflow/junit.js
new file mode 100644
index 000000000..26b240a5e
--- /dev/null
+++ b/dist/commands/workflow/junit.js
@@ -0,0 +1,102 @@
+// JUnit reading and the one-file test runner. A leaf module: it imports none of
+// `tests.ts`, `steps.ts` or `runs.ts`, so any of them may import it.
+import { spawnSync } from "node:child_process";
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+import { BKIT_TEST_FILE_SCRIPT } from "../../install/manifest.js";
+import { scriptCommand, testCommand } from "../../shared/package-manager.js";
+/** The env var naming the JUnit report path `bkit:test:file` must write. */
+export const REPORT_ENV = "BKIT_TEST_REPORT";
+/**
+ * Run argv with stdout and stderr interleaved into `log` (like `> log 2>&1`).
+ * Exit 127 when the binary is missing; 128 + n when killed by signal n.
+ */
+export function runToLog(argv, cwd, log, env) {
+    fs.mkdirSync(path.dirname(log), { recursive: true });
+    const fd = fs.openSync(log, "w");
+    const protectedArgv = testCommand(argv);
+    const res = spawnSync(protectedArgv[0], protectedArgv.slice(1), {
+        cwd,
+        stdio: ["ignore", fd, fd],
+        env: env === undefined ? process.env : { ...process.env, ...env },
+    });
+    fs.closeSync(fd);
+    if (res.error) {
+        fs.appendFileSync(log, `${argv[0]}: not found on PATH (${res.error.message})\n`);
+        return 127;
+    }
+    if (res.status !== null)
+        return res.status;
+    return 128 + ((res.signal ? os.constants.signals[res.signal] : undefined) ?? 1);
+}
+/** Failing plus erroring cases across every `*.xml` under `dir`; null when there is no report. */
+function failingCases(dir) {
+    const xml = fs.readdirSync(dir, { recursive: true }).filter((f) => f.endsWith(".xml") && fs.statSync(path.join(dir, f)).isFile());
+    if (xml.length === 0)
+        return null;
+    return xml
+        .flatMap((f) => parseJunit(fs.readFileSync(path.join(dir, f), "utf-8")))
+        .filter((c) => c.state === "failure" || c.state === "error");
+}
+/** The failing plus erroring cases of every `*.xml` under `dir`; null with none. */
+export function reportFailures(dir) {
+    const failing = failingCases(dir);
+    return failing === null || failing.length === 0 ? null : failing;
+}
+/** The number of failing plus erroring cases across every `*.xml` under `dir`; null when there is no report. */
+export function countReportFailures(dir) {
+    return failingCases(dir)?.length ?? null;
+}
+const XML_ENTITIES = {
+    amp: "&",
+    lt: "<",
+    gt: ">",
+    quot: '"',
+    apos: "'",
+};
+function decodeXml(s) {
+    return s.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (whole, e) => {
+        if (!e.startsWith("#"))
+            return XML_ENTITIES[e.toLowerCase()] ?? whole;
+        const cp = /^#x/i.test(e) ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
+        return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : whole;
+    });
+}
+const ATTRS = String.raw `((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)`;
+function attr(attrs, name) {
+    const m = new RegExp(String.raw `\s${name}\s*=\s*(?:"([^"]*)"|'([^']*)')`).exec(attrs);
+    return m ? decodeXml(m[1] ?? m[2] ?? "") : undefined;
+}
+/** CDATA text as escaped character data, so a tag inside it never ends an element early. */
+const escapeCdata = (xml) => xml.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_, text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
+/** Every `<testcase>` in a JUnit report: its name, outcome, first failure message and detail. */
+export function parseJunit(xml) {
+    const body = escapeCdata(xml).replace(/<!--[\s\S]*?-->/g, "");
+    const cases = [];
+    const testcase = new RegExp(String.raw `<testcase${ATTRS}\s*(?:\/>|>([\s\S]*?)<\/testcase>)`, "g");
+    const outcome = new RegExp(String.raw `<(failure|error|skipped)${ATTRS}\s*(?:\/>|>([\s\S]*?)<\/\1>)`);
+    for (const m of body.matchAll(testcase)) {
+        const child = outcome.exec(m[2] ?? "");
+        cases.push({
+            name: attr(m[1] ?? "", "name") ?? "",
+            classname: attr(m[1] ?? "", "classname") ?? null,
+            file: attr(m[1] ?? "", "file") ?? null,
+            state: child ? child[1] : "passed",
+            message: child ? (attr(child[2] ?? "", "message") ?? "") : "",
+            detail: child ? decodeXml((child[3] ?? "").replace(/<[^>]*>/g, "")).trim() : "",
+        });
+    }
+    return cases;
+}
+/** Run one test file through `bkit:test:file`; the report is read and removed. */
+export function runTestFile(top, test, log) {
+    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-test-report-"));
+    const report = path.join(dir, "junit.xml");
+    const exitCode = runToLog([...scriptCommand(BKIT_TEST_FILE_SCRIPT), test], top, log, {
+        [REPORT_ENV]: report,
+    });
+    const cases = fs.existsSync(report) ? parseJunit(fs.readFileSync(report, "utf-8")) : null;
+    fs.rmSync(dir, { recursive: true, force: true });
+    return { exitCode, cases };
+}
diff --git a/dist/commands/workflow/runtime.js b/dist/commands/workflow/runtime.js
index 13c52984b..eb7e5ef47 100644
--- a/dist/commands/workflow/runtime.js
+++ b/dist/commands/workflow/runtime.js
@@ -246,10 +246,7 @@ export const runtimeCommand = {
             run: (ctx) => {
                 const workflow = str(ctx.flags.workflow);
                 const events = readStatusEvents(statusFile(ctx));
-                const rows = events
-                    .filter((r) => r.type === "runtime-resolved")
-                    .filter((r) => workflow === undefined || r.workflow === workflow);
-                const row = rows[rows.length - 1];
+                const row = latestRuntimeRow(events, workflow);
                 if (!row) {
                     ctx.log(`no runtime-resolved row${workflow ? ` for ${workflow}` : ""} — Step 1 never recorded the runtime`);
                     return EXIT_NO_RUNTIME_ROW;
@@ -278,3 +275,10 @@ export const runtimeCommand = {
         },
     },
 };
+/** The latest `runtime-resolved` row, limited to `workflow` when given; undefined with none. */
+export function latestRuntimeRow(events, workflow) {
+    const rows = events
+        .filter((r) => r.type === "runtime-resolved")
+        .filter((r) => workflow === undefined || r.workflow === workflow);
+    return rows[rows.length - 1];
+}
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index ccd38afff..c3e2f1f1d 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -26,11 +26,12 @@ import { appendLine, statusTimestamp, validateCiSelection, testRunProblem, } fro
 import { classifyLockExit, CommandError, EXIT, git, runGit, testsLockHolder, wholeNumber, } from "../lib.js";
 import { parseJson } from "../../shared/json.js";
 import { readPackageJson } from "../../shared/package-json.js";
-import { COULD_NOT_RUN_EXIT_CODES, scriptCommand, testCommand, } from "../../shared/package-manager.js";
+import { COULD_NOT_RUN_EXIT_CODES, scriptCommand } from "../../shared/package-manager.js";
 import { CONFIG_DEFAULTS, readBkitConfig } from "../../shared/settings.js";
 import { FILE_FLAG, GROUP_FLAG, WORKFLOW_FLAG, positiveInt, readStatusRows, readRuns, statusFile, str, } from "./status.js";
 import { NO_MARKERS_REASON, derivedTestMatrix, fenceNeverClosed, parsePlanBlocks, reuseInventory, supersessionInventory, } from "./plan-blocks.js";
 import { writeStepRow } from "./steps.js";
+import { REPORT_ENV, countReportFailures, runTestFile, runToLog } from "./junit.js";
 import { appendRecord, clampFile } from "./context.js";
 import { testsChangedVerb } from "./tests-changed.js";
 /** Exit code: no candidate gate is declared in package.json. */
@@ -67,28 +68,6 @@ export function resolveGate(dir, candidates) {
 }
 /** The scope string the status rows record: the package runner plus the script name. */
 export const gateScope = (gate) => scriptCommand(gate).join(" ");
-/**
- * Run argv with stdout and stderr interleaved into `log` (like `> log 2>&1`).
- * Exit 127 when the binary is missing; 128 + n when killed by signal n.
- */
-export function runToLog(argv, cwd, log, env) {
-    fs.mkdirSync(path.dirname(log), { recursive: true });
-    const fd = fs.openSync(log, "w");
-    const protectedArgv = testCommand(argv);
-    const res = spawnSync(protectedArgv[0], protectedArgv.slice(1), {
-        cwd,
-        stdio: ["ignore", fd, fd],
-        env: env === undefined ? process.env : { ...process.env, ...env },
-    });
-    fs.closeSync(fd);
-    if (res.error) {
-        fs.appendFileSync(log, `${argv[0]}: not found on PATH (${res.error.message})\n`);
-        return 127;
-    }
-    if (res.status !== null)
-        return res.status;
-    return 128 + ((res.signal ? os.constants.signals[res.signal] : undefined) ?? 1);
-}
 /** `{log}.reports`, emptied: a previous attempt's reports never count toward this one. */
 function freshReportDir(log) {
     const dir = `${log}.reports`;
@@ -96,15 +75,6 @@ function freshReportDir(log) {
     fs.mkdirSync(dir, { recursive: true });
     return dir;
 }
-/** Failing plus erroring test cases across every `*.xml` under `dir`; null when there is none. */
-export function countReportFailures(dir) {
-    const xml = fs.readdirSync(dir, { recursive: true }).filter((f) => f.endsWith(".xml") && fs.statSync(path.join(dir, f)).isFile());
-    if (xml.length === 0)
-        return null;
-    return xml
-        .flatMap((f) => parseJunit(fs.readFileSync(path.join(dir, f), "utf-8")))
-        .filter((c) => c.state === "failure" || c.state === "error").length;
-}
 const tailLines = (file, n) => fs
     .readFileSync(file, "utf-8")
     .replace(/\r?\n$/, "")
@@ -151,8 +121,6 @@ function appendTestRun(file, r) {
 // ---------------------------------------------------------------------------
 // Test-first: JUnit reading, plan `Test first:` lines, red / green judgement
 // ---------------------------------------------------------------------------
-/** The env var naming the JUnit report path `bkit:test:file` must write. */
-export const REPORT_ENV = "BKIT_TEST_REPORT";
 /** The status row step a group's red writes: one row per `tests red` run, a state and blob per planned test. */
 export const RED_STEP = "build-tests-red";
 /**
@@ -393,45 +361,6 @@ function groupStartSha(file, workflow, group) {
 const NO_TEST_FILE_HINT = `declare "${BKIT_TEST_FILE_SCRIPT}" in package.json: it runs the one test file passed as its ` +
     `argument and writes a JUnit report to $${REPORT_ENV} ` +
     "(.bkit/workflows.md § Local gate scripts)";
-const XML_ENTITIES = {
-    amp: "&",
-    lt: "<",
-    gt: ">",
-    quot: '"',
-    apos: "'",
-};
-function decodeXml(s) {
-    return s.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (whole, e) => {
-        if (!e.startsWith("#"))
-            return XML_ENTITIES[e.toLowerCase()] ?? whole;
-        const cp = /^#x/i.test(e) ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
-        return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : whole;
-    });
-}
-const ATTRS = String.raw `((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)`;
-function attr(attrs, name) {
-    const m = new RegExp(String.raw `\s${name}\s*=\s*(?:"([^"]*)"|'([^']*)')`).exec(attrs);
-    return m ? decodeXml(m[1] ?? m[2] ?? "") : undefined;
-}
-/** CDATA text as escaped character data, so a tag inside it never ends an element early. */
-const escapeCdata = (xml) => xml.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_, text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
-/** Every `<testcase>` in a JUnit report: its name, outcome, first failure message and detail. */
-export function parseJunit(xml) {
-    const body = escapeCdata(xml).replace(/<!--[\s\S]*?-->/g, "");
-    const cases = [];
-    const testcase = new RegExp(String.raw `<testcase${ATTRS}\s*(?:\/>|>([\s\S]*?)<\/testcase>)`, "g");
-    const outcome = new RegExp(String.raw `<(failure|error|skipped)${ATTRS}\s*(?:\/>|>([\s\S]*?)<\/\1>)`);
-    for (const m of body.matchAll(testcase)) {
-        const child = outcome.exec(m[2] ?? "");
-        cases.push({
-            name: attr(m[1] ?? "", "name") ?? "",
-            state: child ? child[1] : "passed",
-            message: child ? (attr(child[2] ?? "", "message") ?? "") : "",
-            detail: child ? decodeXml((child[3] ?? "").replace(/<[^>]*>/g, "")).trim() : "",
-        });
-    }
-    return cases;
-}
 /** A report case is the named test when its name is the name, or ends with it as the last segment. */
 export const isNamedCase = (caseName, want) => caseName === want || caseName.endsWith(` ${want}`);
 const caseNames = (cases) => cases.length === 0
@@ -847,17 +776,6 @@ export function planExistence(text, root) {
     }
     return out.sort((a, b) => a.line - b.line);
 }
-/** Run one test file through `bkit:test:file`; the report is read and removed. */
-function runTestFile(top, test, log) {
-    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-test-report-"));
-    const report = path.join(dir, "junit.xml");
-    const exitCode = runToLog([...scriptCommand(BKIT_TEST_FILE_SCRIPT), test], top, log, {
-        [REPORT_ENV]: report,
-    });
-    const cases = fs.existsSync(report) ? parseJunit(fs.readFileSync(report, "utf-8")) : null;
-    fs.rmSync(dir, { recursive: true, force: true });
-    return { exitCode, cases };
-}
 const couldNotRunMessage = (exitCode) => `${gateScope(BKIT_TEST_FILE_SCRIPT)} could not run (exit ${exitCode}: ${exitCode === 126 ? "not executable" : "command not found"}) — no test executed`;
 const toplevel = (cwd) => git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd;
 /** A fence longer than any backtick run in `text`. */
diff --git a/dist/commands/workflow/worktrees.js b/dist/commands/workflow/worktrees.js
index 2cde4d800..0d306f58e 100644
--- a/dist/commands/workflow/worktrees.js
+++ b/dist/commands/workflow/worktrees.js
@@ -419,7 +419,7 @@ function carryLeftovers(wt, o, log) {
 // Copy and install
 // ---------------------------------------------------------------------------
 /** Copy each `worktreeCopy` entry from the main checkout; a missing one is narrated, never fatal. */
-function copyListed(root, wt, entries, log) {
+export function copyListed(root, wt, entries, log) {
     const copied = [];
     const copyMissing = [];
     for (const entry of entries) {
@@ -526,8 +526,8 @@ function allowDirenv(root, wt, log) {
     return true;
 }
 /** Run the frozen install in `wt`; the exit status, with a spawn failure read as "could not run". */
-function install(wt, log) {
-    const [cmd, ...args] = installCommand({ frozen: true });
+export function install(wt, log, opts = {}) {
+    const [cmd, ...args] = installCommand({ frozen: true, preferOffline: opts.preferOffline });
     const res = spawnSync(cmd, args, { cwd: wt, encoding: "utf-8", maxBuffer: 1 << 26 });
     const status = res.error ? 127 : (res.status ?? 1);
     if (status !== 0) {
diff --git a/dist/shared/package-manager.js b/dist/shared/package-manager.js
index 40f3f4181..d6bd348da 100644
--- a/dist/shared/package-manager.js
+++ b/dist/shared/package-manager.js
@@ -13,8 +13,13 @@ export const testCommand = (argv, platform = process.platform) => platform === "
 export const PACKAGE_RUNNER = "pnpm";
 /** argv for running one `package.json` script, e.g. `bkit:gate:static-unit`. */
 export const scriptCommand = (script) => [PACKAGE_RUNNER, script];
-/** argv for installing dependencies; `frozen` refuses to change the lockfile. */
-export const installCommand = (opts) => opts.frozen ? [PACKAGE_RUNNER, "install", "--frozen-lockfile"] : [PACKAGE_RUNNER, "install"];
+/** argv for installing dependencies; `frozen` refuses to change the lockfile, `preferOffline` reads the local store first. */
+export const installCommand = (opts) => [
+    PACKAGE_RUNNER,
+    "install",
+    ...(opts.frozen ? ["--frozen-lockfile"] : []),
+    ...(opts.preferOffline ? ["--prefer-offline"] : []),
+];
 /**
  * argv that regenerates a lockfile from its manifest, keyed by lockfile name.
  * Covers lockfiles from other ecosystems too: a rebase conflict in `Cargo.lock` is
