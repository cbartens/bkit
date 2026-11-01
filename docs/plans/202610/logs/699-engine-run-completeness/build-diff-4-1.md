diff --git a/.bkit/core/engine/checks/status-holes.test.ts b/.bkit/core/engine/checks/status-holes.test.ts
index 4524e241f..2e4fa9395 100644
--- a/.bkit/core/engine/checks/status-holes.test.ts
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -25,14 +25,18 @@ import {
   auditRun,
   auditStatusJsonl,
   callWords,
+  check,
   classifyRun,
   computeMandatoryForPath,
+  contractUnits,
   deriveContract,
   detectHoles,
   formatAdvisoryReport,
   main,
+  readCompleteness,
   stepSections,
 } from "./status-holes";
+import type { StatusRow } from "./status-holes";
 
 // __dirname-anchored (G4) — resolves regardless of vitest's invocation cwd.
 const REPO_ROOT = path.resolve(__dirname, "../../../..");
@@ -183,12 +187,24 @@ describe("source derivation", () => {
     const contract = deriveContract(md, "build");
     expect(contract.steps.map((s) => s.number)).toEqual([1, 2]);
     expect(contract.steps[0]!.calls).toEqual([
-      { noun: "steps", verb: "finish", flags: ["workflow", "step", "file", "number"] },
-      { noun: "status", verb: "route", flags: ["step", "require"] },
-      { noun: "prs", verb: "probe", flags: [] },
+      {
+        noun: "steps",
+        verb: "finish",
+        flags: ["workflow", "step", "file", "number"],
+        position: "pre",
+        branch: false,
+      },
+      {
+        noun: "status",
+        verb: "route",
+        flags: ["step", "require"],
+        position: "post",
+        branch: false,
+      },
+      { noun: "prs", verb: "probe", flags: [], position: "post", branch: false },
     ]);
     expect(contract.steps[1]!.calls).toEqual([
-      { noun: "branches", verb: "push", flags: ["remote"] },
+      { noun: "branches", verb: "push", flags: ["remote"], position: "pre", branch: false },
     ]);
     expect(contract.workflowCalls).toEqual([
       { noun: "runs", verb: "context", flags: ["workflow"] },
@@ -848,3 +864,412 @@ describe("CLI sweep summary", () => {
     }
   });
 });
+
+// ---------------------------------------------------------------------------
+// Completeness check — rows + contract → verdict
+// ---------------------------------------------------------------------------
+
+describe("check — hole classes", () => {
+  const AT = "2026-10-29T00:00:00Z";
+  const stepRow = (workflow: string, step: string, extra: Record<string, unknown> = {}) => ({
+    type: "step-done",
+    workflow,
+    step,
+    status: "DONE",
+    at: AT,
+    ...extra,
+  });
+  const callRow = (workflow: string, noun: string, verb: string) => ({
+    type: "engine-call",
+    workflow,
+    at: AT,
+    noun,
+    verb,
+    flags: [],
+  });
+  const fence = (...calls: string[]) => ["```bash", ...calls.map((c) => `"{BKIT}" ${c}`), "```"];
+  const FINISH = (key: string, n: number) =>
+    `steps finish --workflow=build --step=${key} --number=${n}`;
+
+  /** Calls and row of every step section of a workflow, in markdown order, each step on its first arm. */
+  const replay = (name: (typeof FLOWS)[number], withBranches: boolean): StatusRow[] => {
+    return contractUnits(deriveContract(flowMd(name), name)).flatMap((u) => {
+      const take = (position: "pre" | "post") =>
+        u.calls
+          .filter((c) => c.position === position)
+          .filter((c) => withBranches || !c.branch)
+          .map((c) => callRow(name, c.noun, c.verb) as StatusRow);
+      const own = u.keys.map((k) => stepRow(name, k) as StatusRow);
+      return [...take("pre"), ...own, ...take("post")];
+    });
+  };
+
+  it("names an evidence hole with its missing calls", () => {
+    const md = [
+      "## 🧠 Step 1 — Verify",
+      ...fence("tests run --gate=a", FINISH("build-a", 1)),
+      "## 🧠 Step 2 — Close",
+      ...fence(FINISH("build-close-workflow", 2)),
+    ].join("\n");
+    const contract = deriveContract(md, "build");
+    const holey = check(
+      [
+        callRow("build", "steps", "finish"),
+        stepRow("build", "build-a"),
+        callRow("build", "steps", "finish"),
+        stepRow("build", "build-close-workflow"),
+      ] as StatusRow[],
+      contract,
+    );
+    expect(holey.verdict).toBe("HOLEY");
+    expect(holey.evidenceHoles).toHaveLength(1);
+    expect(holey.evidenceHoles[0]).toMatchObject({ step: "build-a", number: 1 });
+    expect(holey.evidenceHoles[0]!.missing.map((c) => `${c.noun} ${c.verb}`)).toEqual([
+      "tests run",
+    ]);
+    const whole = check(
+      [
+        callRow("build", "tests", "run"),
+        callRow("build", "steps", "finish"),
+        stepRow("build", "build-a"),
+        callRow("build", "steps", "finish"),
+        stepRow("build", "build-close-workflow"),
+      ] as StatusRow[],
+      contract,
+    );
+    expect(whole.evidenceHoles).toEqual([]);
+    expect(whole.verdict).toBe("CLEAN");
+  });
+
+  it("reports a missing required step as a step hole", () => {
+    const md = [
+      "## 🧠 Step 1 — Start",
+      ...fence(FINISH("build-a", 1)),
+      "## 🧠 Step 2 — Required",
+      ...fence(FINISH("build-b", 2)),
+      "## 🧠 Step 3 — Conditional",
+      "**Skip if** nothing to do.",
+      ...fence(FINISH("build-c", 3)),
+      "## 🧠 Step 4 — Close",
+      ...fence(FINISH("build-close-workflow", 4)),
+    ].join("\n");
+    const contract = deriveContract(md, "build");
+    const closed = check(
+      [stepRow("build", "build-a"), stepRow("build", "build-close-workflow")] as StatusRow[],
+      contract,
+    );
+    expect(closed.stepHoles).toEqual(["build-b"]);
+    expect(closed.holey).toBe(true);
+    // Not closed and not failed: nothing is a hole yet.
+    const open = check([stepRow("build", "build-a")] as StatusRow[], contract);
+    expect(open.stepHoles).toEqual([]);
+    // Failed run: only steps before the last observed one count.
+    const failed = check(
+      [
+        stepRow("build", "build-a"),
+        { type: "workflow-failed", workflow: "build", at: AT } as StatusRow,
+      ],
+      contract,
+    );
+    expect(failed.stepHoles).toEqual([]);
+  });
+
+  it("reports unexercised calls without marking the run holey", () => {
+    const md = [
+      "## 🧠 Step 1 — Route",
+      "1. Probe:",
+      ...fence("prs probe"),
+      "   Route:",
+      "   - **If** red:",
+      "     ```bash",
+      '     "{BKIT}" counters route --a=1',
+      "     ```",
+      "   - **Else** → next.",
+      "## 🧠 Step 2 — Close",
+      ...fence(FINISH("build-close-workflow", 2)),
+    ].join("\n");
+    const contract = deriveContract(md, "build");
+    expect(contract.steps[0]!.calls.map((c) => [c.verb, c.branch])).toEqual([
+      ["probe", false],
+      ["route", true],
+    ]);
+    const verdict = check(
+      [
+        callRow("build", "prs", "probe"),
+        stepRow("build", "build-route"),
+        callRow("build", "steps", "finish"),
+        stepRow("build", "build-close-workflow"),
+      ] as StatusRow[],
+      deriveContract(
+        md.replace("## 🧠 Step 1 — Route", "## 🧠 Step 1 — Route\n`--step=build-route`"),
+        "build",
+      ),
+    );
+    expect(verdict.unexercised).toEqual([
+      { step: "build-route", call: { noun: "counters", verb: "route" } },
+    ]);
+    expect(verdict.holey).toBe(false);
+    expect(verdict.verdict).toBe("CLEAN");
+  });
+
+  it("charges calls below a step's finish line to that step", () => {
+    const build = deriveContract(flowMd("build"), "build");
+    const step15 = build.steps.find((s) => s.number === 15)!;
+    expect(
+      step15.calls.filter((c) => c.position === "post").map((c) => `${c.noun} ${c.verb}`),
+    ).toEqual(expect.arrayContaining(["prs probe", "branches push"]));
+    for (const name of FLOWS) {
+      const verdict = check(replay(name, false), deriveContract(flowMd(name), name));
+      expect(verdict.evidenceHoles, name).toEqual([]);
+      expect(verdict.unexpected, name).toEqual([]);
+      expect(verdict.unattributable, name).toEqual([]);
+      expect(verdict.stepHoles, name).toEqual([]);
+      expect(verdict.verdict, name).toBe("CLEAN");
+    }
+  });
+
+  it("reports an untaken route arm as unexercised", () => {
+    const build = deriveContract(flowMd("build"), "build");
+    const step12 = build.steps.find((s) => s.number === 12)!;
+    const routes = step12.calls.filter((c) => `${c.noun} ${c.verb}` === "counters route");
+    expect(routes.map((c) => c.branch)).toEqual([true]);
+    const step5 = build.steps.find((s) => s.number === 5)!;
+    const finishes = step5.calls.filter((c) => `${c.noun} ${c.verb}` === "steps finish");
+    expect(finishes.map((c) => c.branch).sort()).toEqual([false, true]);
+    const verdict = check(replay("build", false), build);
+    expect(verdict.holey).toBe(false);
+    const unit12 = contractUnits(build).find((u) => u.number === 12)!;
+    expect(verdict.unexercised).toContainEqual({
+      step: unit12.keys[0],
+      call: { noun: "counters", verb: "route" },
+    });
+    // Taking the arm as well leaves nothing unexercised for it.
+    const taken = check(replay("build", true), build);
+    expect(taken.holey).toBe(false);
+    expect(taken.unexercised).not.toContainEqual({
+      step: unit12.keys[0],
+      call: { noun: "counters", verb: "route" },
+    });
+  });
+
+  it("gives each group-loop repeat its own gaps", () => {
+    const md = [
+      "## 🧠 Step 1 — Execute",
+      ...fence("tests run --gate=a", FINISH("build-plan-execute", 1)),
+      "## 🧠 Step 2 — Close",
+      ...fence(FINISH("build-close-workflow", 2)),
+    ].join("\n");
+    const contract = deriveContract(md, "build");
+    const rows = (secondCalls: StatusRow[]) =>
+      [
+        callRow("build", "tests", "run"),
+        callRow("build", "steps", "finish"),
+        stepRow("build", "build-plan-execute", { group: 1 }),
+        ...secondCalls,
+        callRow("build", "steps", "finish"),
+        stepRow("build", "build-plan-execute", { group: 2 }),
+        callRow("build", "steps", "finish"),
+        stepRow("build", "build-close-workflow"),
+      ] as StatusRow[];
+    const whole = check(rows([callRow("build", "tests", "run") as StatusRow]), contract);
+    expect(whole.unattributable).toEqual([]);
+    expect(whole.evidenceHoles).toEqual([]);
+    const holey = check(rows([]), contract);
+    expect(holey.unattributable).toEqual([]);
+    expect(holey.evidenceHoles).toHaveLength(1);
+    expect(holey.evidenceHoles[0]).toMatchObject({
+      step: "build-plan-execute",
+      index: 2,
+      group: 2,
+    });
+  });
+
+  it("matches workflow-level calls outside any step", () => {
+    const md = [
+      '"{BKIT}" runs context --workflow=build',
+      "## 🤖 Decision Pause",
+      ...fence("status row --kind=pause"),
+      "## 🧠 Step 1 — Start",
+      ...fence(FINISH("build-start-workflow", 1)),
+      "## 🧠 Step 2 — Close",
+      ...fence(FINISH("build-close-workflow", 2)),
+    ].join("\n");
+    const contract = deriveContract(md, "build");
+    const verdict = check(
+      [
+        callRow("build", "runs", "context"),
+        callRow("build", "steps", "finish"),
+        stepRow("build", "build-start-workflow"),
+        callRow("build", "status", "row"),
+        callRow("build", "steps", "finish"),
+        stepRow("build", "build-close-workflow"),
+        callRow("build", "status", "row"),
+      ] as StatusRow[],
+      contract,
+    );
+    expect(verdict.unexpected).toEqual([]);
+    expect(verdict.unattributable).toEqual([]);
+    expect(verdict.evidenceHoles).toEqual([]);
+    expect(verdict.workflowCalls).toContainEqual({ noun: "status", verb: "row" });
+  });
+});
+
+describe("check — verdict metadata", () => {
+  const AT = "2026-10-29T00:00:00Z";
+  const stepRow = (step: string, extra: Record<string, unknown> = {}) =>
+    ({ type: "step-done", workflow: "build", step, status: "DONE", at: AT, ...extra }) as StatusRow;
+  const callRow = (noun: string, verb: string) =>
+    ({ type: "engine-call", workflow: "build", at: AT, noun, verb, flags: [] }) as StatusRow;
+  const md = [
+    "## 🧠 Step 1 — Verify",
+    "```bash",
+    '"{BKIT}" tests run --gate=a',
+    '"{BKIT}" steps finish --workflow=build --step=build-a --number=1',
+    "```",
+    "## 🧠 Step 2 — Close",
+    "```bash",
+    '"{BKIT}" steps finish --workflow=build --step=build-close-workflow --number=2',
+    "```",
+  ].join("\n");
+  const contract = deriveContract(md, "build");
+
+  it("gives a pre-journal run a steps-only verdict", () => {
+    const rows = [stepRow("build-a"), stepRow("build-close-workflow")];
+    const plain = check(rows, contract);
+    expect(plain.preJournal).toBe(true);
+    expect(plain.evidenceHoles).toEqual([]);
+    expect(plain.unexpected).toEqual([]);
+    expect(plain.verdict).toBe("CLEAN");
+    expect(plain.journalSuspect).toBe(false);
+    expect(check(rows, contract, { journalSuspect: true }).journalSuspect).toBe(true);
+    // A step hole still shows on a pre-journal run.
+    const holey = check([stepRow("build-close-workflow")], contract);
+    expect(holey.stepHoles).toEqual(["build-a"]);
+    // The heartbeat is only for a run that recorded no call.
+    const journaled = check(
+      [callRow("tests", "run"), callRow("steps", "finish"), ...rows],
+      contract,
+      { journalSuspect: true },
+    );
+    expect(journaled.preJournal).toBe(false);
+    expect(journaled.journalSuspect).toBe(false);
+  });
+
+  it("names a call no contract step owns", () => {
+    const verdict = check(
+      [
+        callRow("tests", "run"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        stepRow("build-outside-one"),
+        callRow("pr", "ghost"),
+        stepRow("build-outside-two"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+        callRow("fids", "late"),
+      ],
+      contract,
+    );
+    expect(verdict.unattributable).toEqual([
+      { noun: "pr", verb: "ghost" },
+      { noun: "fids", verb: "late" },
+    ]);
+    expect(verdict.unexpected).toEqual([
+      { step: "build-outside-one" },
+      { step: "build-outside-two" },
+    ]);
+    expect(verdict.evidenceHoles).toEqual([]);
+  });
+
+  it("excludes its own journaled call", () => {
+    const selfContract = deriveContract(
+      md.replace(
+        '"{BKIT}" tests run --gate=a',
+        '"{BKIT}" tests run --gate=a\n"{BKIT}" completeness check --workflow=build',
+      ),
+      "build",
+    );
+    const verdict = check(
+      [
+        callRow("tests", "run"),
+        callRow("completeness", "check"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        callRow("completeness", "check"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+      ],
+      selfContract,
+    );
+    expect(verdict.unexpected).toEqual([]);
+    expect(verdict.evidenceHoles).toEqual([]);
+    expect(verdict.observed.calls).toBe(3);
+    // Without the call journaled, the contract's own mention is not an expectation either.
+    const absent = check(
+      [
+        callRow("tests", "run"),
+        callRow("steps", "finish"),
+        stepRow("build-a"),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow"),
+      ],
+      selfContract,
+    );
+    expect(absent.evidenceHoles).toEqual([]);
+  });
+
+  it("takes the last completeness row and recomputes when rows follow it", () => {
+    const stored = (verdict: string, extra: Record<string, unknown> = {}) =>
+      ({
+        type: "completeness",
+        workflow: "build",
+        at: AT,
+        verdict,
+        preJournal: false,
+        journalSuspect: false,
+        observed: { steps: 1, calls: 1 },
+        evidenceHoles: [],
+        stepHoles: [],
+        unexercised: [],
+        unexpected: [],
+        unattributable: [],
+        sourceSha: "x",
+        ...extra,
+      }) as StatusRow;
+    const base = [stepRow("build-a"), stepRow("build-close-workflow")];
+    const first = readCompleteness([...base, stored("CLEAN"), stored("HOLEY")], contract);
+    expect(first.source).toBe("stored");
+    expect(first.verdict.verdict).toBe("HOLEY");
+    expect(first.verdict.holey).toBe(true);
+    const second = readCompleteness([...base, stored("HOLEY"), stored("CLEAN")], contract);
+    expect(second.verdict.verdict).toBe("CLEAN");
+    // A row after the stored one (not a completeness row) forces a recompute.
+    const later = readCompleteness(
+      [stepRow("build-close-workflow"), stored("CLEAN"), stepRow("build-a")],
+      contract,
+    );
+    expect(later.source).toBe("computed");
+    expect(later.verdict.observed.steps).toBe(2);
+    // The closing workflow-done row follows the stored row and does not force one.
+    const closing = readCompleteness(
+      [...base, stored("HOLEY"), { type: "workflow-done", workflow: "build", at: AT }],
+      contract,
+    );
+    expect(closing.source).toBe("stored");
+  });
+
+  it("reports a hole in a long-closed run with no baseline", () => {
+    const old = { at: "2019-01-01T00:00:00Z" };
+    const verdict = check(
+      [
+        callRow("steps", "finish"),
+        stepRow("build-a", old),
+        callRow("steps", "finish"),
+        stepRow("build-close-workflow", old),
+      ].map((r) => ({ ...r, ...old })),
+      contract,
+    );
+    expect(verdict.evidenceHoles.map((h) => h.step)).toEqual(["build-a"]);
+    expect(verdict.holey).toBe(true);
+  });
+});
diff --git a/.bkit/core/engine/checks/status-holes.ts b/.bkit/core/engine/checks/status-holes.ts
index 86addfd2a..c56665580 100644
--- a/.bkit/core/engine/checks/status-holes.ts
+++ b/.bkit/core/engine/checks/status-holes.ts
@@ -23,6 +23,7 @@
 //   npx tsx .bkit/core/engine/checks/status-holes.ts <status.jsonl>...
 //   # exits 0 always; prints advisory report to stdout
 
+import { createHash } from "node:crypto";
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { fileURLToPath } from "node:url";
@@ -123,7 +124,14 @@ export interface HoleReport {
 // ---------------------------------------------------------------------------
 
 /** One `"{BKIT}" noun verb --flag` call the markdown names, reduced to words (flag values dropped). */
-export interface RequiredCall {
+export interface RequiredCall extends WorkflowCall {
+  /** `post` when written below the section's last `steps finish` / `steps done --step=` line. */
+  position: "pre" | "post";
+  /** R1: under a `- **If**` / `- **Else**` bullet, or in a sub-step a route line names as its target. */
+  branch: boolean;
+}
+
+export interface WorkflowCall {
   noun: string;
   verb: string;
   flags: string[];
@@ -134,6 +142,8 @@ export interface ContractStep {
   title: string;
   /** The `--step=` / `step:"` row keys the section writes. */
   keys: string[];
+  /** The subset of `keys` the section writes: `steps finish|done --step=` and `step:"` literals. */
+  writes: string[];
   /** Every `"{BKIT}"` call in the section, in order. */
   calls: RequiredCall[];
   /** True under a column-0 `**Run only if**` / `**Skip if**` line, or a `(Path X only)` heading. */
@@ -146,7 +156,9 @@ export interface Contract {
   /** Deduped row keys across the step sections, sorted. */
   universe: string[];
   /** Calls in sections no step owns (opening lines, Failure Path, Decision Pause ...). */
-  workflowCalls: RequiredCall[];
+  workflowCalls: WorkflowCall[];
+  /** sha256 of the workflow markdown the contract was derived from. */
+  sourceSha: string;
   /** Row keys written outside every numbered step section. */
   orphanSteps: string[];
   /** Disagreements with the deduped `WORKFLOW_STEPS[workflow]` keys; reported, never fatal. */
@@ -197,7 +209,7 @@ export function stepSections(text: string): Array<{ number: number; title: strin
 }
 
 /** Each `"{BKIT}"` call in `text` as noun / verb / flag names. */
-function requiredCalls(text: string): RequiredCall[] {
+function requiredCalls(text: string): WorkflowCall[] {
   const joined = text.replace(/\\\n\s*/g, " ");
   return joined
     .split('"{BKIT}"')
@@ -212,6 +224,70 @@ function requiredCalls(text: string): RequiredCall[] {
     });
 }
 
+/** R1: per line of a step section, true when it sits on an `If` / `Else` arm. */
+function branchLines(lines: string[]): boolean[] {
+  const branch = lines.map(() => false);
+  const targets = new Set<number>();
+  let ifIndent: number | null = null;
+  lines.forEach((l, i) => {
+    if (l.trim() === "") {
+      branch[i] = ifIndent !== null;
+      return;
+    }
+    const indent = l.length - l.trimStart().length;
+    if (ifIndent !== null && indent <= ifIndent) ifIndent = null;
+    if (/^\s*- \*\*(If|Else)\*\*/.test(l)) ifIndent = indent;
+    branch[i] = ifIndent !== null;
+    if (/\*\*(If|Else)\*\*/.test(l))
+      for (const m of l.matchAll(/sub-step (\d+)/g)) targets.add(Number(m[1]));
+  });
+  let sub: number | null = null;
+  lines.forEach((l, i) => {
+    const m = /^(\d+)\. /.exec(l);
+    if (m) sub = Number(m[1]);
+    else if (l.startsWith("#")) sub = null;
+    if (sub !== null && targets.has(sub)) branch[i] = true;
+  });
+  return branch;
+}
+
+/** The `"{BKIT}"` calls of one step section, each tagged with its position (R3) and branch flag (R1). */
+function sectionCalls(body: string): RequiredCall[] {
+  const lines = body.split("\n");
+  const branch = branchLines(lines);
+  const logical: Array<{ text: string; branch: boolean }> = [];
+  for (let i = 0; i < lines.length; i++) {
+    let text = lines[i]!;
+    const start = i;
+    while (text.endsWith("\\") && i + 1 < lines.length) {
+      i += 1;
+      text = `${text.slice(0, -1)} ${lines[i]!.trimStart()}`;
+    }
+    logical.push({ text, branch: branch[start]! });
+  }
+  const perLine = logical.map((l) => requiredCalls(l.text));
+  const isFinish = (c: WorkflowCall) =>
+    c.noun === "steps" && (c.verb === "finish" || (c.verb === "done" && c.flags.includes("step")));
+  const lastFinish = perLine.reduce((last, calls, i) => (calls.some(isFinish) ? i : last), -1);
+  return perLine.flatMap((calls, i) =>
+    calls.map((c) => ({
+      ...c,
+      position: i > lastFinish && lastFinish !== -1 ? ("post" as const) : ("pre" as const),
+      branch: logical[i]!.branch,
+    })),
+  );
+}
+
+/** Row keys a section writes (not merely names in a `steps gate --step=` read). */
+function stepWrites(text: string): string[] {
+  const joined = text.replace(/\\\n\s*/g, " ");
+  const found = joined.split("\n").flatMap((line) => {
+    const viaCall = /"\{BKIT\}" steps (?:finish|done)\b/.test(line) ? stepKeys(line) : [];
+    return [...viaCall, ...[...line.matchAll(/step:"([a-z][a-z0-9-]*)"/g)].map((m) => m[1]!)];
+  });
+  return [...new Set(found)];
+}
+
 const stepKeys = (text: string): string[] => [
   ...new Set([...text.matchAll(STEP_KEY_RE)].filter((m) => !m[2]).map((m) => m[1]!)),
 ];
@@ -237,7 +313,8 @@ export function deriveContract(workflowMd: string, workflow: string): Contract {
     number: s.number,
     title: s.title,
     keys: stepKeys(s.body),
-    calls: requiredCalls(s.body),
+    writes: stepWrites(s.body),
+    calls: sectionCalls(s.body),
     conditional: isConditionalSection(s.body),
   }));
   const universe = [...new Set(steps.flatMap((s) => s.keys))].sort();
@@ -259,6 +336,7 @@ export function deriveContract(workflowMd: string, workflow: string): Contract {
     steps,
     universe,
     workflowCalls: requiredCalls(outside),
+    sourceSha: createHash("sha256").update(workflowMd).digest("hex"),
     orphanSteps: stepKeys(outside)
       .filter((k) => k.startsWith(`${workflow}-`) && !universe.includes(k))
       .sort(),
@@ -266,6 +344,337 @@ export function deriveContract(workflowMd: string, workflow: string): Contract {
   };
 }
 
+// ---------------------------------------------------------------------------
+// Completeness check — rows + contract → verdict
+// ---------------------------------------------------------------------------
+
+export interface CallRef {
+  noun: string;
+  verb: string;
+}
+
+export interface EvidenceHole {
+  step: string;
+  number: number;
+  /** 1-based occurrence among the run's rows for this step (group-loop and retry repeats). */
+  index: number;
+  group?: number;
+  missing: WorkflowCall[];
+}
+
+export interface CompletenessVerdict {
+  workflow: string;
+  verdict: "CLEAN" | "HOLEY";
+  /** True on an evidence hole or a step hole; unexercised arms never count. */
+  holey: boolean;
+  preJournal: boolean;
+  journalSuspect: boolean;
+  observed: { steps: number; calls: number };
+  evidenceHoles: EvidenceHole[];
+  stepHoles: string[];
+  unexercised: Array<{ step: string; call: CallRef }>;
+  unexpected: Array<CallRef | { step: string }>;
+  unattributable: CallRef[];
+  sourceSha: string;
+  workflowCalls: CallRef[];
+}
+
+export interface CheckOptions {
+  /** True when the closing engine itself journals (close path only). */
+  journalSuspect?: boolean;
+}
+
+/** The `completeness` verb journals itself; it is neither expected nor ever unexpected. */
+const SELF_NOUN = "completeness";
+
+const callKey = (c: CallRef): string => `${c.noun} ${c.verb}`;
+
+/**
+ * One row-owning unit of a contract. A key belongs to the last section that writes it
+ * (else the last that names it); a section owning no key folds its calls into the
+ * section owning its first key, so a step whose row another section writes is still
+ * checked as one unit (design Step 1 folds into Step 2).
+ */
+export interface Unit {
+  number: number;
+  /** Row keys this unit owns, in section order. */
+  keys: string[];
+  calls: RequiredCall[];
+  conditional: boolean;
+}
+
+export function contractUnits(contract: Contract): Unit[] {
+  const owner = new Map<string, ContractStep>();
+  for (const k of contract.universe) {
+    const writers = contract.steps.filter((s) => s.writes.includes(k));
+    const namers = contract.steps.filter((s) => s.keys.includes(k));
+    const last = (writers.length > 0 ? writers : namers).at(-1);
+    if (last) owner.set(k, last);
+  }
+  const owners = contract.steps.filter((s) => [...owner.values()].includes(s));
+  return owners.map((s) => {
+    const keys = s.keys.filter((k) => owner.get(k) === s);
+    const folded = contract.steps.filter(
+      (f) => !owners.includes(f) && f.keys[0] !== undefined && owner.get(f.keys[0]) === s,
+    );
+    const calls = [
+      ...folded.filter((f) => f.number < s.number).flatMap((f) => f.calls),
+      ...s.calls,
+      ...folded
+        .filter((f) => f.number > s.number)
+        .flatMap((f) => f.calls.map((c) => ({ ...c, position: "post" as const }))),
+    ];
+    return { number: s.number, keys, calls, conditional: s.conditional };
+  });
+}
+
+interface Visit {
+  unit: Unit;
+  /** Item indices of this visit's rows. */
+  rows: number[];
+}
+
+type Item =
+  | { kind: "call"; call: CallRef }
+  | { kind: "step"; key: string; row: StatusRow; unit: Unit | undefined };
+
+/**
+ * Classify one run's rows against its contract. Consecutive rows of one unit form a
+ * visit (a repeat of a key starts a new one, so each group-loop repeat owns its own
+ * gaps). A visit owns the calls before its first row and between its rows, and the
+ * calls after its last row that are one of its `post` calls (R3); the rest belong to
+ * the next visit. Matching is on noun + verb (R2). `holey` keys on `evidenceHoles` +
+ * `stepHoles` only. Never throws and never filters by age.
+ */
+export function check(
+  rows: StatusRow[],
+  contract: Contract,
+  options: CheckOptions = {},
+): CompletenessVerdict {
+  const workflow = contract.workflow;
+  const own = rows.filter((r) => r.workflow === workflow);
+  const units = contractUnits(contract).map((u) => ({
+    ...u,
+    calls: u.calls.filter((c) => c.noun !== SELF_NOUN),
+  }));
+  const unitOf = new Map<string, Unit>();
+  for (const u of units) for (const k of u.keys) unitOf.set(k, u);
+  const workflowCalls = contract.workflowCalls.filter((c) => c.noun !== SELF_NOUN);
+  const workflowKeys = new Set(workflowCalls.map(callKey));
+
+  const items: Item[] = own.flatMap((r): Item[] => {
+    if (r.type === "engine-call" && r["noun"] !== SELF_NOUN) {
+      return [{ kind: "call", call: { noun: String(r["noun"]), verb: String(r["verb"]) } }];
+    }
+    if (r.type === "step-done" && typeof r.step === "string") {
+      return [{ kind: "step", key: r.step, row: r, unit: unitOf.get(r.step) }];
+    }
+    return [];
+  });
+  const callCount = items.filter((i) => i.kind === "call").length;
+  const preJournal = callCount === 0;
+
+  // Visits over the step rows, in order; a row outside the contract closes the current visit.
+  const visits: Visit[] = [];
+  const visitOfRow = new Map<number, Visit>();
+  let current: Visit | undefined;
+  const keysInCurrent = new Set<string>();
+  items.forEach((item, i) => {
+    if (item.kind !== "step") return;
+    if (!item.unit) {
+      current = undefined;
+      return;
+    }
+    const sameUnit = current?.unit === item.unit && !keysInCurrent.has(item.key);
+    if (!sameUnit) {
+      current = { unit: item.unit, rows: [] };
+      keysInCurrent.clear();
+      visits.push(current);
+    }
+    current!.rows.push(i);
+    keysInCurrent.add(item.key);
+    visitOfRow.set(i, current!);
+  });
+
+  const postSlots = new Map<Visit, Map<string, number>>();
+  const freshSlots = (v: Visit): Map<string, number> => {
+    const slots = new Map<string, number>();
+    for (const c of v.unit.calls) {
+      if (c.position === "post" && !c.branch)
+        slots.set(callKey(c), (slots.get(callKey(c)) ?? 0) + 1);
+    }
+    postSlots.set(v, slots);
+    return slots;
+  };
+  const stepIdx = items.flatMap((it, i) => (it.kind === "step" ? [i] : []));
+  const owned = new Map<Visit, Set<string>>();
+  const unexpectedCalls = new Map<string, CallRef>();
+  const unattributable = new Map<string, CallRef>();
+  items.forEach((item, i) => {
+    if (item.kind !== "call") return;
+    const key = callKey(item.call);
+    const prevIdx = stepIdx.filter((x) => x < i).at(-1) ?? -1;
+    const nextIdx = stepIdx.find((x) => x > i) ?? -1;
+    const prevVisit = visitOfRow.get(prevIdx);
+    const nextVisit = visitOfRow.get(nextIdx);
+    // Each post call of a visit absorbs one journaled call: a noun + verb written both
+    // below one step's finish line and above the next step's is charged once to each.
+    const slots =
+      prevVisit === undefined ? undefined : (postSlots.get(prevVisit) ?? freshSlots(prevVisit));
+    const claimsPost =
+      prevVisit !== undefined &&
+      prevVisit.rows.at(-1) === prevIdx &&
+      slots !== undefined &&
+      ((slots.get(key) ?? 0) > 0 ||
+        (prevVisit.unit.calls.some(
+          (c) => c.position === "post" && c.branch && callKey(c) === key,
+        ) &&
+          !nextVisit?.unit.calls.some((c) => !c.branch && callKey(c) === key)));
+    if (claimsPost && slots) slots.set(key, Math.max(0, (slots.get(key) ?? 0) - 1));
+    const insideVisit = prevVisit !== undefined && prevVisit === nextVisit ? prevVisit : undefined;
+    const owner = insideVisit ?? (claimsPost ? prevVisit : nextVisit);
+    const required = owner?.unit.calls.some((c) => callKey(c) === key) === true;
+    if (owner && required) {
+      owned.set(owner, (owned.get(owner) ?? new Set<string>()).add(key));
+    } else if (workflowKeys.has(key)) {
+      // R4: a workflow-level call is never charged to a step and never unexpected.
+    } else if (owner === undefined) {
+      unattributable.set(key, item.call);
+    } else {
+      unexpectedCalls.set(key, item.call);
+    }
+  });
+
+  const evidenceHoles: EvidenceHole[] = [];
+  const occurrence = new Map<Unit, number>();
+  const exercised = new Map<Unit, Set<string>>();
+  for (const v of visits) {
+    const index = (occurrence.get(v.unit) ?? 0) + 1;
+    occurrence.set(v.unit, index);
+    const got = owned.get(v) ?? new Set<string>();
+    const pool = exercised.get(v.unit) ?? new Set<string>();
+    for (const k of got) pool.add(k);
+    exercised.set(v.unit, pool);
+    const rowsOf = v.rows.map((i) => items[i]).flatMap((x) => (x?.kind === "step" ? [x.row] : []));
+    const done = rowsOf.some((r) => r.status === undefined || r.status === "DONE");
+    if (preJournal || !done) continue;
+    const missing = new Map<string, WorkflowCall>();
+    for (const c of v.unit.calls) {
+      if (!c.branch && !got.has(callKey(c)) && !missing.has(callKey(c))) {
+        missing.set(callKey(c), { noun: c.noun, verb: c.verb, flags: c.flags });
+      }
+    }
+    if (missing.size === 0) continue;
+    const group = rowsOf.map((r) => r["group"]).find((g) => typeof g === "number");
+    evidenceHoles.push({
+      step: rowsOf[0]?.step ?? v.unit.keys[0] ?? "",
+      number: v.unit.number,
+      index,
+      ...(typeof group === "number" ? { group } : {}),
+      missing: [...missing.values()],
+    });
+  }
+
+  const unexercised: Array<{ step: string; call: CallRef }> = [];
+  if (!preJournal) {
+    for (const u of units) {
+      const pool = exercised.get(u);
+      if (pool === undefined) continue;
+      const required = new Set(u.calls.filter((c) => !c.branch).map(callKey));
+      const reported = new Set<string>();
+      for (const c of u.calls) {
+        const k = callKey(c);
+        if (c.branch && !required.has(k) && !pool.has(k) && !reported.has(k)) {
+          reported.add(k);
+          unexercised.push({ step: u.keys[0] ?? "", call: { noun: c.noun, verb: c.verb } });
+        }
+      }
+    }
+  }
+
+  const observed = new Set(items.flatMap((i) => (i.kind === "step" ? [i.key] : [])));
+  const closed = observed.has(`${workflow}-close-workflow`);
+  const failed = own.some((r) => r.type === "workflow-failed");
+  const lastNumber = Math.max(0, ...visits.map((v) => v.unit.number));
+  const stepHoles = units
+    .filter((u) => !u.conditional && !u.keys.some((k) => observed.has(k)))
+    .filter((u) => closed || (failed && u.number < lastNumber))
+    .map((u) => u.keys[0]!);
+
+  const unexpected: Array<CallRef | { step: string }> = [
+    ...[...observed]
+      .filter((k) => !unitOf.has(k))
+      .sort()
+      .map((step) => ({ step })),
+    ...(preJournal ? [] : unexpectedCalls.values()),
+  ];
+  const holey = evidenceHoles.length > 0 || stepHoles.length > 0;
+  return {
+    workflow,
+    verdict: holey ? "HOLEY" : "CLEAN",
+    holey,
+    preJournal,
+    journalSuspect: preJournal && options.journalSuspect === true,
+    observed: {
+      steps: items.filter((i) => i.kind === "step").length,
+      calls: callCount,
+    },
+    evidenceHoles,
+    stepHoles,
+    unexercised,
+    unexpected,
+    unattributable: [...unattributable.values()],
+    sourceSha: contract.sourceSha,
+    workflowCalls: workflowCalls.map((c) => ({ noun: c.noun, verb: c.verb })),
+  };
+}
+
+export interface StoredOrComputed {
+  verdict: CompletenessVerdict;
+  source: "stored" | "computed";
+}
+
+/**
+ * The verdict of a run: its last stored `completeness` row, recomputed when a
+ * `step-done` or `engine-call` row follows it (the closing `workflow-done` row and
+ * the `completeness` verb's own journal row do not).
+ */
+export function readCompleteness(
+  rows: StatusRow[],
+  contract: Contract,
+  options: CheckOptions = {},
+): StoredOrComputed {
+  const own = rows.filter((r) => r.workflow === contract.workflow);
+  const at = own.map((r) => r.type).lastIndexOf("completeness");
+  const stored = at === -1 ? undefined : own[at];
+  const followed = own
+    .slice(at + 1)
+    .some((r) => r.type === "step-done" || (r.type === "engine-call" && r["noun"] !== SELF_NOUN));
+  if (!stored || followed) return { verdict: check(rows, contract, options), source: "computed" };
+  const list = (key: string): never[] =>
+    Array.isArray(stored[key]) ? (stored[key] as never[]) : [];
+  const holey = stored["verdict"] === "HOLEY";
+  const observed = stored["observed"] as CompletenessVerdict["observed"] | undefined;
+  return {
+    source: "stored",
+    verdict: {
+      workflow: contract.workflow,
+      verdict: holey ? "HOLEY" : "CLEAN",
+      holey,
+      preJournal: stored["preJournal"] === true,
+      journalSuspect: stored["journalSuspect"] === true,
+      observed: observed ?? { steps: 0, calls: 0 },
+      evidenceHoles: list("evidenceHoles"),
+      stepHoles: list("stepHoles"),
+      unexercised: list("unexercised"),
+      unexpected: list("unexpected"),
+      unattributable: list("unattributable"),
+      sourceSha: typeof stored["sourceSha"] === "string" ? stored["sourceSha"] : "",
+      workflowCalls: list("workflowCalls"),
+    },
+  };
+}
+
 // ---------------------------------------------------------------------------
 // Run classification + path-conditional expected sets
 // ---------------------------------------------------------------------------
diff --git a/dist/checks/status-holes.js b/dist/checks/status-holes.js
index 2073edb90..5d7b33b88 100644
--- a/dist/checks/status-holes.js
+++ b/dist/checks/status-holes.js
@@ -22,6 +22,7 @@
 // Usage (advisory CI step or manual):
 //   npx tsx .bkit/core/engine/checks/status-holes.ts <status.jsonl>...
 //   # exits 0 always; prints advisory report to stdout
+import { createHash } from "node:crypto";
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { fileURLToPath } from "node:url";
@@ -139,6 +140,70 @@ function requiredCalls(text) {
         return { noun, verb: verb.startsWith("--") ? "" : verb, flags };
     });
 }
+/** R1: per line of a step section, true when it sits on an `If` / `Else` arm. */
+function branchLines(lines) {
+    const branch = lines.map(() => false);
+    const targets = new Set();
+    let ifIndent = null;
+    lines.forEach((l, i) => {
+        if (l.trim() === "") {
+            branch[i] = ifIndent !== null;
+            return;
+        }
+        const indent = l.length - l.trimStart().length;
+        if (ifIndent !== null && indent <= ifIndent)
+            ifIndent = null;
+        if (/^\s*- \*\*(If|Else)\*\*/.test(l))
+            ifIndent = indent;
+        branch[i] = ifIndent !== null;
+        if (/\*\*(If|Else)\*\*/.test(l))
+            for (const m of l.matchAll(/sub-step (\d+)/g))
+                targets.add(Number(m[1]));
+    });
+    let sub = null;
+    lines.forEach((l, i) => {
+        const m = /^(\d+)\. /.exec(l);
+        if (m)
+            sub = Number(m[1]);
+        else if (l.startsWith("#"))
+            sub = null;
+        if (sub !== null && targets.has(sub))
+            branch[i] = true;
+    });
+    return branch;
+}
+/** The `"{BKIT}"` calls of one step section, each tagged with its position (R3) and branch flag (R1). */
+function sectionCalls(body) {
+    const lines = body.split("\n");
+    const branch = branchLines(lines);
+    const logical = [];
+    for (let i = 0; i < lines.length; i++) {
+        let text = lines[i];
+        const start = i;
+        while (text.endsWith("\\") && i + 1 < lines.length) {
+            i += 1;
+            text = `${text.slice(0, -1)} ${lines[i].trimStart()}`;
+        }
+        logical.push({ text, branch: branch[start] });
+    }
+    const perLine = logical.map((l) => requiredCalls(l.text));
+    const isFinish = (c) => c.noun === "steps" && (c.verb === "finish" || (c.verb === "done" && c.flags.includes("step")));
+    const lastFinish = perLine.reduce((last, calls, i) => (calls.some(isFinish) ? i : last), -1);
+    return perLine.flatMap((calls, i) => calls.map((c) => ({
+        ...c,
+        position: i > lastFinish && lastFinish !== -1 ? "post" : "pre",
+        branch: logical[i].branch,
+    })));
+}
+/** Row keys a section writes (not merely names in a `steps gate --step=` read). */
+function stepWrites(text) {
+    const joined = text.replace(/\\\n\s*/g, " ");
+    const found = joined.split("\n").flatMap((line) => {
+        const viaCall = /"\{BKIT\}" steps (?:finish|done)\b/.test(line) ? stepKeys(line) : [];
+        return [...viaCall, ...[...line.matchAll(/step:"([a-z][a-z0-9-]*)"/g)].map((m) => m[1])];
+    });
+    return [...new Set(found)];
+}
 const stepKeys = (text) => [
     ...new Set([...text.matchAll(STEP_KEY_RE)].filter((m) => !m[2]).map((m) => m[1])),
 ];
@@ -160,7 +225,8 @@ export function deriveContract(workflowMd, workflow) {
         number: s.number,
         title: s.title,
         keys: stepKeys(s.body),
-        calls: requiredCalls(s.body),
+        writes: stepWrites(s.body),
+        calls: sectionCalls(s.body),
         conditional: isConditionalSection(s.body),
     }));
     const universe = [...new Set(steps.flatMap((s) => s.keys))].sort();
@@ -184,12 +250,262 @@ export function deriveContract(workflowMd, workflow) {
         steps,
         universe,
         workflowCalls: requiredCalls(outside),
+        sourceSha: createHash("sha256").update(workflowMd).digest("hex"),
         orphanSteps: stepKeys(outside)
             .filter((k) => k.startsWith(`${workflow}-`) && !universe.includes(k))
             .sort(),
         drift,
     };
 }
+/** The `completeness` verb journals itself; it is neither expected nor ever unexpected. */
+const SELF_NOUN = "completeness";
+const callKey = (c) => `${c.noun} ${c.verb}`;
+export function contractUnits(contract) {
+    const owner = new Map();
+    for (const k of contract.universe) {
+        const writers = contract.steps.filter((s) => s.writes.includes(k));
+        const namers = contract.steps.filter((s) => s.keys.includes(k));
+        const last = (writers.length > 0 ? writers : namers).at(-1);
+        if (last)
+            owner.set(k, last);
+    }
+    const owners = contract.steps.filter((s) => [...owner.values()].includes(s));
+    return owners.map((s) => {
+        const keys = s.keys.filter((k) => owner.get(k) === s);
+        const folded = contract.steps.filter((f) => !owners.includes(f) && f.keys[0] !== undefined && owner.get(f.keys[0]) === s);
+        const calls = [
+            ...folded.filter((f) => f.number < s.number).flatMap((f) => f.calls),
+            ...s.calls,
+            ...folded
+                .filter((f) => f.number > s.number)
+                .flatMap((f) => f.calls.map((c) => ({ ...c, position: "post" }))),
+        ];
+        return { number: s.number, keys, calls, conditional: s.conditional };
+    });
+}
+/**
+ * Classify one run's rows against its contract. Consecutive rows of one unit form a
+ * visit (a repeat of a key starts a new one, so each group-loop repeat owns its own
+ * gaps). A visit owns the calls before its first row and between its rows, and the
+ * calls after its last row that are one of its `post` calls (R3); the rest belong to
+ * the next visit. Matching is on noun + verb (R2). `holey` keys on `evidenceHoles` +
+ * `stepHoles` only. Never throws and never filters by age.
+ */
+export function check(rows, contract, options = {}) {
+    const workflow = contract.workflow;
+    const own = rows.filter((r) => r.workflow === workflow);
+    const units = contractUnits(contract).map((u) => ({
+        ...u,
+        calls: u.calls.filter((c) => c.noun !== SELF_NOUN),
+    }));
+    const unitOf = new Map();
+    for (const u of units)
+        for (const k of u.keys)
+            unitOf.set(k, u);
+    const workflowCalls = contract.workflowCalls.filter((c) => c.noun !== SELF_NOUN);
+    const workflowKeys = new Set(workflowCalls.map(callKey));
+    const items = own.flatMap((r) => {
+        if (r.type === "engine-call" && r["noun"] !== SELF_NOUN) {
+            return [{ kind: "call", call: { noun: String(r["noun"]), verb: String(r["verb"]) } }];
+        }
+        if (r.type === "step-done" && typeof r.step === "string") {
+            return [{ kind: "step", key: r.step, row: r, unit: unitOf.get(r.step) }];
+        }
+        return [];
+    });
+    const callCount = items.filter((i) => i.kind === "call").length;
+    const preJournal = callCount === 0;
+    // Visits over the step rows, in order; a row outside the contract closes the current visit.
+    const visits = [];
+    const visitOfRow = new Map();
+    let current;
+    const keysInCurrent = new Set();
+    items.forEach((item, i) => {
+        if (item.kind !== "step")
+            return;
+        if (!item.unit) {
+            current = undefined;
+            return;
+        }
+        const sameUnit = current?.unit === item.unit && !keysInCurrent.has(item.key);
+        if (!sameUnit) {
+            current = { unit: item.unit, rows: [] };
+            keysInCurrent.clear();
+            visits.push(current);
+        }
+        current.rows.push(i);
+        keysInCurrent.add(item.key);
+        visitOfRow.set(i, current);
+    });
+    const postSlots = new Map();
+    const freshSlots = (v) => {
+        const slots = new Map();
+        for (const c of v.unit.calls) {
+            if (c.position === "post" && !c.branch)
+                slots.set(callKey(c), (slots.get(callKey(c)) ?? 0) + 1);
+        }
+        postSlots.set(v, slots);
+        return slots;
+    };
+    const stepIdx = items.flatMap((it, i) => (it.kind === "step" ? [i] : []));
+    const owned = new Map();
+    const unexpectedCalls = new Map();
+    const unattributable = new Map();
+    items.forEach((item, i) => {
+        if (item.kind !== "call")
+            return;
+        const key = callKey(item.call);
+        const prevIdx = stepIdx.filter((x) => x < i).at(-1) ?? -1;
+        const nextIdx = stepIdx.find((x) => x > i) ?? -1;
+        const prevVisit = visitOfRow.get(prevIdx);
+        const nextVisit = visitOfRow.get(nextIdx);
+        // Each post call of a visit absorbs one journaled call: a noun + verb written both
+        // below one step's finish line and above the next step's is charged once to each.
+        const slots = prevVisit === undefined ? undefined : (postSlots.get(prevVisit) ?? freshSlots(prevVisit));
+        const claimsPost = prevVisit !== undefined &&
+            prevVisit.rows.at(-1) === prevIdx &&
+            slots !== undefined &&
+            ((slots.get(key) ?? 0) > 0 ||
+                (prevVisit.unit.calls.some((c) => c.position === "post" && c.branch && callKey(c) === key) &&
+                    !nextVisit?.unit.calls.some((c) => !c.branch && callKey(c) === key)));
+        if (claimsPost && slots)
+            slots.set(key, Math.max(0, (slots.get(key) ?? 0) - 1));
+        const insideVisit = prevVisit !== undefined && prevVisit === nextVisit ? prevVisit : undefined;
+        const owner = insideVisit ?? (claimsPost ? prevVisit : nextVisit);
+        const required = owner?.unit.calls.some((c) => callKey(c) === key) === true;
+        if (owner && required) {
+            owned.set(owner, (owned.get(owner) ?? new Set()).add(key));
+        }
+        else if (workflowKeys.has(key)) {
+            // R4: a workflow-level call is never charged to a step and never unexpected.
+        }
+        else if (owner === undefined) {
+            unattributable.set(key, item.call);
+        }
+        else {
+            unexpectedCalls.set(key, item.call);
+        }
+    });
+    const evidenceHoles = [];
+    const occurrence = new Map();
+    const exercised = new Map();
+    for (const v of visits) {
+        const index = (occurrence.get(v.unit) ?? 0) + 1;
+        occurrence.set(v.unit, index);
+        const got = owned.get(v) ?? new Set();
+        const pool = exercised.get(v.unit) ?? new Set();
+        for (const k of got)
+            pool.add(k);
+        exercised.set(v.unit, pool);
+        const rowsOf = v.rows.map((i) => items[i]).flatMap((x) => (x?.kind === "step" ? [x.row] : []));
+        const done = rowsOf.some((r) => r.status === undefined || r.status === "DONE");
+        if (preJournal || !done)
+            continue;
+        const missing = new Map();
+        for (const c of v.unit.calls) {
+            if (!c.branch && !got.has(callKey(c)) && !missing.has(callKey(c))) {
+                missing.set(callKey(c), { noun: c.noun, verb: c.verb, flags: c.flags });
+            }
+        }
+        if (missing.size === 0)
+            continue;
+        const group = rowsOf.map((r) => r["group"]).find((g) => typeof g === "number");
+        evidenceHoles.push({
+            step: rowsOf[0]?.step ?? v.unit.keys[0] ?? "",
+            number: v.unit.number,
+            index,
+            ...(typeof group === "number" ? { group } : {}),
+            missing: [...missing.values()],
+        });
+    }
+    const unexercised = [];
+    if (!preJournal) {
+        for (const u of units) {
+            const pool = exercised.get(u);
+            if (pool === undefined)
+                continue;
+            const required = new Set(u.calls.filter((c) => !c.branch).map(callKey));
+            const reported = new Set();
+            for (const c of u.calls) {
+                const k = callKey(c);
+                if (c.branch && !required.has(k) && !pool.has(k) && !reported.has(k)) {
+                    reported.add(k);
+                    unexercised.push({ step: u.keys[0] ?? "", call: { noun: c.noun, verb: c.verb } });
+                }
+            }
+        }
+    }
+    const observed = new Set(items.flatMap((i) => (i.kind === "step" ? [i.key] : [])));
+    const closed = observed.has(`${workflow}-close-workflow`);
+    const failed = own.some((r) => r.type === "workflow-failed");
+    const lastNumber = Math.max(0, ...visits.map((v) => v.unit.number));
+    const stepHoles = units
+        .filter((u) => !u.conditional && !u.keys.some((k) => observed.has(k)))
+        .filter((u) => closed || (failed && u.number < lastNumber))
+        .map((u) => u.keys[0]);
+    const unexpected = [
+        ...[...observed]
+            .filter((k) => !unitOf.has(k))
+            .sort()
+            .map((step) => ({ step })),
+        ...(preJournal ? [] : unexpectedCalls.values()),
+    ];
+    const holey = evidenceHoles.length > 0 || stepHoles.length > 0;
+    return {
+        workflow,
+        verdict: holey ? "HOLEY" : "CLEAN",
+        holey,
+        preJournal,
+        journalSuspect: preJournal && options.journalSuspect === true,
+        observed: {
+            steps: items.filter((i) => i.kind === "step").length,
+            calls: callCount,
+        },
+        evidenceHoles,
+        stepHoles,
+        unexercised,
+        unexpected,
+        unattributable: [...unattributable.values()],
+        sourceSha: contract.sourceSha,
+        workflowCalls: workflowCalls.map((c) => ({ noun: c.noun, verb: c.verb })),
+    };
+}
+/**
+ * The verdict of a run: its last stored `completeness` row, recomputed when a
+ * `step-done` or `engine-call` row follows it (the closing `workflow-done` row and
+ * the `completeness` verb's own journal row do not).
+ */
+export function readCompleteness(rows, contract, options = {}) {
+    const own = rows.filter((r) => r.workflow === contract.workflow);
+    const at = own.map((r) => r.type).lastIndexOf("completeness");
+    const stored = at === -1 ? undefined : own[at];
+    const followed = own
+        .slice(at + 1)
+        .some((r) => r.type === "step-done" || (r.type === "engine-call" && r["noun"] !== SELF_NOUN));
+    if (!stored || followed)
+        return { verdict: check(rows, contract, options), source: "computed" };
+    const list = (key) => Array.isArray(stored[key]) ? stored[key] : [];
+    const holey = stored["verdict"] === "HOLEY";
+    const observed = stored["observed"];
+    return {
+        source: "stored",
+        verdict: {
+            workflow: contract.workflow,
+            verdict: holey ? "HOLEY" : "CLEAN",
+            holey,
+            preJournal: stored["preJournal"] === true,
+            journalSuspect: stored["journalSuspect"] === true,
+            observed: observed ?? { steps: 0, calls: 0 },
+            evidenceHoles: list("evidenceHoles"),
+            stepHoles: list("stepHoles"),
+            unexercised: list("unexercised"),
+            unexpected: list("unexpected"),
+            unattributable: list("unattributable"),
+            sourceSha: typeof stored["sourceSha"] === "string" ? stored["sourceSha"] : "",
+            workflowCalls: list("workflowCalls"),
+        },
+    };
+}
 // ---------------------------------------------------------------------------
 // Run classification + path-conditional expected sets
 // ---------------------------------------------------------------------------
