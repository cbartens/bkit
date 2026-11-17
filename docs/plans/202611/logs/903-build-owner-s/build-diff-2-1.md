diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index 58fbe3233..70bb1b652 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -7,7 +7,12 @@ import { afterEach, describe, expect, it } from "vitest";
 
 import { runCommand } from "../lib";
 import { COMMANDS } from "../registry";
-import { applyRecommendations, EXIT_HARD_BLOCKERS, parseDecisionItems } from "./decisions";
+import {
+  applyRecommendations,
+  decisionHeader,
+  EXIT_HARD_BLOCKERS,
+  parseDecisionItems,
+} from "./decisions";
 
 const dirs: string[] = [];
 const runtimeBefore = process.env.BKIT_RUNTIME;
@@ -763,6 +768,44 @@ describe("parseDecisionItems", () => {
     expect(decided("C — no such option")).toBe("C — no such option");
   });
 
+  it("reads the task a Fix now item names on its Fix task line", () => {
+    const item = (decision: string, fixLines: string[]) =>
+      [
+        "Status: DECIDED",
+        "",
+        "**Q1 — Gap:** accept it?",
+        "Options: A) Accept / B) Fix now",
+        "Recommended: B) Fix now — real",
+        `Decision: ${decision}`,
+        ...fixLines,
+        "",
+      ].join("\n");
+    expect(parseDecisionItems(item("Fix now", ["Fix task: 42"]))[0]!.fixTask).toBe(42);
+    expect(parseDecisionItems(item("Fix now", []))[0]!.fixTask).toBeNull();
+    expect(parseDecisionItems(item("Fix now", ["Fix task: soon"]))[0]!.fixTask).toBeNull();
+    expect(parseDecisionItems(item("Fix now", ["Fix task: 0"]))[0]!.fixTask).toBeNull();
+  });
+
+  it("decisionHeader reads the header block only", () => {
+    const text = [
+      "Status: DECIDED",
+      "Question: VERIFY_GAPS",
+      "From: verify",
+      "Group: 9",
+      "",
+      "**Q1 — Gap:** accept it?",
+      "Group: 3",
+      "From: holistic",
+      "Decision: Accept",
+      "",
+    ].join("\n");
+    const header = decisionHeader(text);
+    expect(header.From).toBe("verify");
+    expect(header.Group).toBe("9");
+    expect(header.Status).toBe("DECIDED");
+    expect(decisionHeader("**Q1 — Gap:** x\nGroup: 3\n").Group).toBeUndefined();
+  });
+
   it("a lettered assumed Accept decision still reads as assumed", () => {
     const items = parseDecisionItems(
       [
diff --git a/.bkit/core/engine/commands/workflow/decisions.ts b/.bkit/core/engine/commands/workflow/decisions.ts
index 98624c58f..d65522d7c 100644
--- a/.bkit/core/engine/commands/workflow/decisions.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.ts
@@ -7,6 +7,7 @@
 //   Options: A) {A} / B) {B}
 //   Recommended: A) {A} — {reason}       (a hard blocker: `No recommendation — {why}`)
 //   Decision: {answer} — {words}         (once decided)
+//   Fix task: {N}                        (a `Fix now` item: the plan task that carries its fix)
 //
 // `apply --by=headless` takes each recommendation when nobody can or should be asked: an
 // `Accept` is written `Accept (assumed)` and the file says `Status: ASSUMED`. It never writes a
@@ -37,6 +38,8 @@ export interface DecisionItem {
   reason: string;
   /** The `Decision:` line's text, a lettered answer read as its option (`optionAnswer`). */
   decision: string | null;
+  /** The plan task on the `Fix task:` line, else null. */
+  fixTask: number | null;
   assumed: boolean;
   rejected: boolean;
   deferred: boolean;
@@ -81,6 +84,21 @@ const letteredOptions = (options: string[]): string =>
 const letterOf = (options: string[], name: string): string | null =>
   options.includes(name) ? letterAt(options.indexOf(name)) : null;
 
+/** A `Fix task:` value as a positive integer, else null. */
+const fixTaskOf = (v: string | null): number | null =>
+  v !== null && /^[1-9][0-9]*$/.test(v) ? Number(v) : null;
+
+/** The `Key: value` lines before the file's first blank line. */
+export function decisionHeader(text: string): Record<string, string> {
+  const out: Record<string, string> = {};
+  for (const line of text.split("\n")) {
+    if (line.trim() === "" || line.startsWith("**Q")) break;
+    const m = /^([A-Za-z][\w ]*):[ \t]*(.*?)[ \t]*$/.exec(line);
+    if (m !== null && !(m[1]! in out)) out[m[1]!] = m[2]!;
+  }
+  return out;
+}
+
 /** The items of a decision file's text, in file order. */
 export function parseDecisionItems(text: string): DecisionItem[] {
   return text
@@ -105,6 +123,7 @@ export function parseDecisionItems(text: string): DecisionItem[] {
         recommended: none || rec === null ? null : bareName((option ?? "").trim()),
         reason: why.join(" — ").trim(),
         decision,
+        fixTask: fixTaskOf(lineOf(part, "Fix task")),
         assumed: decision !== null && /^Accept \(assumed\)/.test(decision),
         rejected: lineOf(part, "Rejected") !== null,
         deferred: lineOf(part, "Deferred") !== null,
diff --git a/.bkit/core/engine/commands/workflow/summary.test.ts b/.bkit/core/engine/commands/workflow/summary.test.ts
index 7909ea057..7a1b6705c 100644
--- a/.bkit/core/engine/commands/workflow/summary.test.ts
+++ b/.bkit/core/engine/commands/workflow/summary.test.ts
@@ -1417,4 +1417,349 @@ describe("buildSummary", () => {
     expect(s.markdown).not.toContain("**security** (starter-only)");
     expect(s.markdown).not.toContain("## Documentation Warnings");
   });
+
+  describe("a verify pause's group", () => {
+    const DEC = "log/build-decision-1-1.md";
+    const VERIFY = "log/build-verify-1.md";
+    const step = (name: string, group: number, verdict: string, extra: object = {}) => ({
+      type: "step-done",
+      step: name,
+      group,
+      verdict,
+      attempt: 1,
+      ...extra,
+    });
+    const tick = (ticked: boolean) => (ticked ? "x" : " ");
+    const taskBlock = (n: number, ticked: boolean) =>
+      [
+        `<!-- bkit:task ${n} start -->`,
+        `- [${tick(ticked)}] **TASK ${n}:** Do ${n}.`,
+        "  - **DONE WHEN:** d.",
+        "  - **TEST FIRST:**",
+        `    - \`a.test.ts\` \`t${n}\``,
+        `<!-- bkit:task ${n} end -->`,
+      ].join("\n");
+    /** A plan with task 41 in group 9 and each given task in its group. */
+    const planOf = (...placed: Array<{ group: number; task: number; ticked?: boolean }>) => {
+      const groups = [...new Set([9, ...placed.map((p) => p.group)])].sort((a, b) => a - b);
+      return groups
+        .map((g) =>
+          [
+            `<!-- bkit:group ${g} start -->`,
+            `### GROUP ${g}: Work`,
+            ...(g === 9 ? [taskBlock(41, true)] : []),
+            ...placed.filter((p) => p.group === g).map((p) => taskBlock(p.task, p.ticked ?? true)),
+            `<!-- bkit:group ${g} end -->`,
+          ].join("\n"),
+        )
+        .join("\n");
+    };
+    const fixPlan = planOf({ group: 10, task: 42 });
+    const failRows = () => [
+      step("build-plan-tasks", 9, "FAIL"),
+      step("build-plan-verify", 9, "FAIL"),
+      step("build-plan-gaps-remediate", 9, "FAIL"),
+    ];
+    const decisionRow = (file = DEC) => ({
+      type: "step-done",
+      step: "build-decision",
+      attempt: 1,
+      route: "verify",
+      artifacts: [file],
+    });
+    /** A fix group's execution and its passing verify; the VERIFY file names the task. */
+    const verifiedRows = (group: number) => [
+      step("build-plan-tasks", group, "PASS"),
+      step("build-plan-verify", group, "PASS", { failures: 0, artifacts: [VERIFY] }),
+    ];
+    const verifyFile = (tasks: string) => `Verdict: PASS\nTasks: ${tasks}\n<!-- verdict:end -->`;
+    /** A decision file in the layout `decisions compose` writes; gap items are Q1.. or Q2.. after a loop item. */
+    const pauseFile = (opts: {
+      from?: string;
+      group?: string;
+      loop?: string | null;
+      gaps: Array<{ decision: string | null; fixTask?: string | null }>;
+    }) => {
+      const loop = opts.loop === undefined ? "Decide — stop trying again" : opts.loop;
+      const lines = [
+        "Status: DECIDED",
+        "Question: VERIFY_GAPS",
+        `From: ${opts.from ?? "verify"}`,
+        "Pause step: 8",
+        "Plan: docs/plans/p-plan.md",
+        `Group: ${opts.group ?? "9"}`,
+        "Verify attempt: 2",
+        "",
+      ];
+      let n = 1;
+      if (loop !== null) {
+        lines.push(
+          "build verify: attempt 2 of 2",
+          "",
+          "## Progress",
+          "",
+          "Trend: flat",
+          "",
+          `**Q${n} — Verify:** decide the items below instead of another round?`,
+          "Options: A) Try again / B) Decide",
+          "Recommended: B) Decide — no round fixes it",
+          ...(loop === "" ? [] : [`Decision: ${loop}`]),
+          "",
+        );
+        n++;
+      }
+      for (const gap of opts.gaps) {
+        lines.push(
+          `**Q${n} — Gap ${n}:** accept it?`,
+          "Options: A) Accept / B) Fix now",
+          "Recommended: A) Accept — minor",
+          ...(gap.decision === null ? [] : [`Decision: ${gap.decision}`]),
+          ...(gap.fixTask == null ? [] : [`Fix task: ${gap.fixTask}`]),
+          "",
+        );
+        n++;
+      }
+      return lines.join("\n");
+    };
+    const ACCEPT = { decision: "Accept — minor" };
+    const FIX42 = { decision: "Fix now", fixTask: "42" };
+    const files = (decision: string, tasks = "42") =>
+      reader({ [DEC]: decision, [VERIFY]: verifyFile(tasks) });
+    const FAIL_REASONS = [
+      "build-plan-tasks (group 9) FAIL",
+      "build-plan-verify (group 9) FAIL",
+      "build-plan-gaps-remediate (group 9) FAIL",
+    ];
+    const rowsOf = (...extra: Array<Record<string, unknown>>) => [
+      ...failRows(),
+      decisionRow(),
+      ...verifiedRows(10),
+      ...extra,
+    ];
+    const summary = (
+      rows: Array<Record<string, unknown>>,
+      decision: string,
+      over: Partial<SummaryInput> = {},
+    ) =>
+      buildSummary(
+        input({
+          rows,
+          plans: [{ path: "docs/plans/p-plan.md", text: fixPlan }],
+          read: files(decision),
+          ...over,
+        }),
+      );
+    const expectKept = (s: ReturnType<typeof buildSummary>) => {
+      expect(s.verdict).toBe("FAIL");
+      for (const reason of FAIL_REASONS) expect(s.reasons).toContain(reason);
+    };
+
+    it("a verify pause's Fix now group is resolved once each fix task is verified", () => {
+      const decision = pauseFile({ gaps: [ACCEPT, FIX42] });
+      const s = summary(rowsOf(), decision);
+      for (const reason of FAIL_REASONS) expect(s.reasons).not.toContain(reason);
+      expect(s.verdict).toBe("CONCERNS");
+      expect(s.reasons.join("\n")).toContain("accepted at the Decision Pause");
+      const findings = s.markdown.split("## Resolved Findings")[1]!.split("## ")[0]!;
+      expect(findings).toContain(DEC);
+      expect(findings).toContain("42");
+
+      // A Fix now task inside the paused group resolves each group row once.
+      const inside = summary(
+        [
+          ...failRows(),
+          decisionRow(),
+          step("build-plan-tasks", 9, "PASS"),
+          step("build-plan-verify", 9, "PASS", { failures: 0, artifacts: [VERIFY] }),
+        ],
+        pauseFile({ gaps: [{ decision: "Fix now", fixTask: "41" }] }),
+        { read: files(pauseFile({ gaps: [{ decision: "Fix now", fixTask: "41" }] }), "41") },
+      );
+      for (const reason of FAIL_REASONS) expect(inside.reasons).not.toContain(reason);
+      const inFindings = inside.markdown.split("## Resolved Findings")[1]!.split("## ")[0]!;
+      expect(inFindings.match(/build-plan-tasks \(group 9\) FAIL, resolved by/g)).toHaveLength(1);
+    });
+
+    it("a verify pause before the round limit resolves its Fix now group the same way", () => {
+      const decision = pauseFile({ loop: null, gaps: [FIX42, ACCEPT] });
+      expect(decision).not.toContain("## Progress");
+      const s = summary(rowsOf(), decision);
+      for (const reason of FAIL_REASONS) expect(s.reasons).not.toContain(reason);
+      expect(s.verdict).toBe("CONCERNS");
+      expect(s.markdown.split("## Resolved Findings")[1]!.split("## ")[0]!).toContain(DEC);
+    });
+
+    it("a verify pause clears its group's FAIL only when every item is answered", () => {
+      // The control answers every item and clears the group.
+      const control = summary(rowsOf(), pauseFile({ gaps: [ACCEPT, FIX42] }));
+      for (const reason of FAIL_REASONS) expect(control.reasons).not.toContain(reason);
+      // An unanswered gap item, or an unanswered loop item, keeps it.
+      expectKept(summary(rowsOf(), pauseFile({ gaps: [{ decision: null }, FIX42] })));
+      expectKept(summary(rowsOf(), pauseFile({ loop: "", gaps: [ACCEPT, FIX42] })));
+    });
+
+    it("a Fix now item clears its group's FAIL only through a ticked task its own group verified after the pause", () => {
+      const decision = pauseFile({ gaps: [ACCEPT, FIX42] });
+      const control = summary(rowsOf(), decision);
+      for (const reason of FAIL_REASONS) expect(control.reasons).not.toContain(reason);
+
+      const fixed = verifiedRows(10);
+      // Unticked task.
+      expectKept(
+        summary(rowsOf(), decision, {
+          plans: [
+            {
+              path: "docs/plans/p-plan.md",
+              text: planOf({ group: 10, task: 42, ticked: false }),
+            },
+          ],
+        }),
+      );
+      // Verified before the pause, not after it.
+      expectKept(summary([...failRows(), ...fixed, decisionRow()], decision));
+      // Verify did not pass.
+      expectKept(
+        summary(
+          [
+            ...failRows(),
+            decisionRow(),
+            step("build-plan-tasks", 10, "PASS"),
+            step("build-plan-verify", 10, "FAIL", { failures: 1, artifacts: [VERIFY] }),
+          ],
+          decision,
+        ),
+      );
+      // The assessment does not name the task.
+      expectKept(summary(rowsOf(), decision, { read: files(decision, "41") }));
+      // Verified in another group than the task's own.
+      expectKept(
+        summary(
+          [
+            ...failRows(),
+            decisionRow(),
+            step("build-plan-tasks", 10, "PASS"),
+            step("build-plan-verify", 11, "PASS", { failures: 0, artifacts: [VERIFY] }),
+          ],
+          decision,
+        ),
+      );
+    });
+
+    it("a verify pause clears only the group its Group header names", () => {
+      const other = [
+        step("build-plan-tasks", 7, "FAIL"),
+        step("build-plan-verify", 7, "FAIL"),
+        step("build-plan-gaps-remediate", 7, "FAIL"),
+      ];
+      const rows = [...other, ...failRows(), decisionRow(), ...verifiedRows(10)];
+      const named = summary(rows, pauseFile({ gaps: [ACCEPT, FIX42] }));
+      for (const reason of FAIL_REASONS) expect(named.reasons).not.toContain(reason);
+      expect(named.reasons).toContain("build-plan-tasks (group 7) FAIL");
+      expect(named.reasons).toContain("build-plan-verify (group 7) FAIL");
+      // A header naming another group leaves group 9's rows.
+      const elsewhere = summary(rows, pauseFile({ group: "7", gaps: [ACCEPT, FIX42] }));
+      for (const reason of FAIL_REASONS) expect(elsewhere.reasons).toContain(reason);
+    });
+
+    it("a Fix now item without a Fix task line or naming a missing task keeps its group's FAIL", () => {
+      // The control names task 42, verified, and clears the group.
+      const control = summary(rowsOf(), pauseFile({ gaps: [ACCEPT, FIX42] }));
+      for (const reason of FAIL_REASONS) expect(control.reasons).not.toContain(reason);
+      expectKept(summary(rowsOf(), pauseFile({ gaps: [ACCEPT, { decision: "Fix now" }] })));
+      expectKept(
+        summary(rowsOf(), pauseFile({ gaps: [ACCEPT, { decision: "Fix now", fixTask: "99" }] })),
+      );
+      expectKept(
+        summary(rowsOf(), pauseFile({ gaps: [ACCEPT, { decision: "Fix now", fixTask: "x" }] })),
+      );
+    });
+
+    it("a paused group's CONCERNS rows stay concerns after its Fix now task is verified", () => {
+      const rows = [
+        step("build-plan-tasks", 9, "FAIL"),
+        step("build-plan-verify", 9, "CONCERNS"),
+        step("build-plan-gaps-remediate", 9, "CONCERNS"),
+        decisionRow(),
+        ...verifiedRows(10),
+      ];
+      const s = summary(rows, pauseFile({ gaps: [ACCEPT, FIX42] }));
+      expect(s.reasons).not.toContain("build-plan-tasks (group 9) FAIL");
+      expect(s.reasons).toContain("build-plan-verify (group 9) CONCERNS");
+      expect(s.reasons).toContain("build-plan-gaps-remediate (group 9) CONCERNS");
+      expect(s.verdict).toBe("CONCERNS");
+    });
+
+    it("a holistic or challenge decision file clears no group rows", () => {
+      // The control is a verify pause and clears the group.
+      const control = summary(rowsOf(), pauseFile({ gaps: [ACCEPT, FIX42] }));
+      for (const reason of FAIL_REASONS) expect(control.reasons).not.toContain(reason);
+      for (const from of ["holistic", "challenge"])
+        expectKept(summary(rowsOf(), pauseFile({ from, gaps: [ACCEPT, FIX42] })));
+    });
+
+    it("a group that paused more than once is settled by its latest qualifying decision", () => {
+      const DEC2 = "log/build-decision-1-2.md";
+      const first = pauseFile({ gaps: [ACCEPT, FIX42] });
+      const second = pauseFile({ gaps: [ACCEPT, { decision: "Fix now", fixTask: "43" }] });
+      const plan = planOf({ group: 10, task: 42 }, { group: 11, task: 43 });
+      const read = reader({
+        [DEC]: first,
+        [DEC2]: second,
+        [VERIFY]: verifyFile("42"),
+        "log/build-verify-2.md": verifyFile("43"),
+      });
+      const afterFirst = [
+        ...failRows().slice(0, 1),
+        decisionRow(),
+        ...verifiedRows(10),
+        // Group 9 fails again after the first pause, and pauses a second time.
+        step("build-plan-verify", 9, "FAIL", { attempt: 2 }),
+        decisionRow(DEC2),
+      ];
+      const settled = buildSummary(
+        input({
+          rows: [
+            ...afterFirst,
+            step("build-plan-tasks", 11, "PASS"),
+            step("build-plan-verify", 11, "PASS", {
+              failures: 0,
+              artifacts: ["log/build-verify-2.md"],
+            }),
+          ],
+          plans: [{ path: "docs/plans/p-plan.md", text: plan }],
+          read,
+        }),
+      );
+      expect(settled.reasons).not.toContain("build-plan-verify (group 9) FAIL");
+      expect(settled.reasons).not.toContain("build-plan-tasks (group 9) FAIL");
+      // Without the later fix verified, the first pause cannot clear the row that came after it.
+      const unsettled = buildSummary(
+        input({
+          rows: afterFirst,
+          plans: [{ path: "docs/plans/p-plan.md", text: plan }],
+          read,
+        }),
+      );
+      expect(unsettled.reasons).toContain("build-plan-verify (group 9) FAIL");
+    });
+
+    it("an Accept-only verify pause resolves its group's FAIL rows before the pause", () => {
+      const decision = pauseFile({ gaps: [ACCEPT, ACCEPT] });
+      const rows = [...failRows(), decisionRow()];
+      const s = summary(rows, decision);
+      for (const reason of FAIL_REASONS) expect(s.reasons).not.toContain(reason);
+      expect(s.verdict).toBe("CONCERNS");
+      expect(s.reasons.join("\n")).toContain("2 item(s) accepted at the Decision Pause");
+      expect(s.markdown.split("## Resolved Findings")[1]!.split("## ")[0]!).toContain(DEC);
+
+      // A gap item left unanswered keeps the FAIL rows.
+      expectKept(summary(rows, pauseFile({ gaps: [ACCEPT, { decision: null }] })));
+      // A group 9 FAIL after the pause stays.
+      const later = summary(
+        [...rows, step("build-plan-verify", 9, "FAIL", { attempt: 2 })],
+        decision,
+      );
+      expect(later.reasons).toContain("build-plan-verify (group 9) FAIL");
+    });
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/summary.ts b/.bkit/core/engine/commands/workflow/summary.ts
index c83c45451..f8371a6eb 100644
--- a/.bkit/core/engine/commands/workflow/summary.ts
+++ b/.bkit/core/engine/commands/workflow/summary.ts
@@ -5,7 +5,7 @@
 
 import { coversList, type Plan, type Workstream } from "./plans.js";
 import { issueIdOf, type FidTracker } from "./fids.js";
-import { parseDecisionItems } from "./decisions.js";
+import { decisionHeader, parseDecisionItems } from "./decisions.js";
 import { parsePlanBlocks } from "./plan-blocks.js";
 import { parseJson } from "../../shared/json.js";
 import { challengeResolution, taskVerified } from "./summary-findings.js";
@@ -296,6 +296,9 @@ function stepGroups(rows: Row[]): StepGroup[] {
 
 const lastOf = (g: StepGroup) => g.rows.at(-1)!;
 
+/** Steps of a task group that a verify pause's answer settles when they ended FAIL. */
+const PAUSE_SETTLES = ["build-plan-tasks", "build-plan-verify", "build-plan-gaps-remediate"];
+
 /** A level-2 section whose heading matches `title`, minus the template's non-content subsections. */
 function planSection(text: string, title: RegExp): string | undefined {
   const lines = text.split("\n");
@@ -360,9 +363,64 @@ export function buildSummary(input: SummaryInput): Summary {
       );
     }
 
+  // A verify pause answered in full settles its group's failed rows from before the pause:
+  // each `Fix now` item names a task verified after the pause, or every item is `Accept`.
+  const pauseSettled = new Set<string>();
+  if (workflow === "build") {
+    const latest = new Map<number, { index: number; rel: string; how: string }>();
+    input.rows.forEach((row, index) => {
+      if (row.type !== "step-done" || row.step !== "build-decision") return;
+      for (const rel of artifactsOf(row)) {
+        const text = read(rel);
+        if (text === null) continue;
+        const header = decisionHeader(text);
+        const group = /^[0-9]+$/.test(header.Group ?? "") ? Number(header.Group) : undefined;
+        if (header.From !== "verify" || group === undefined) continue;
+        const gaps = parseDecisionItems(text);
+        if (gaps.length === 0 || gaps.some((i) => i.decision === null)) continue;
+        const asks = gaps.filter((i) => i.title !== "Verify");
+        const fixes = asks.filter((i) => /^Fix now\b/.test(i.decision ?? ""));
+        if (asks.length === 0) continue;
+        if (fixes.length === 0) {
+          if (!asks.every((i) => /^Accept\b/.test(i.decision ?? ""))) continue;
+          latest.set(group, { index, rel, how: "every item accepted" });
+          continue;
+        }
+        if (!asks.every((i) => fixes.includes(i) || /^Accept\b/.test(i.decision ?? ""))) continue;
+        const fixTasks = fixes.map((i) => tasks.find((t) => t.task === i.fixTask));
+        if (fixTasks.some((t) => t === undefined || !taskVerified(input, t, index))) continue;
+        latest.set(group, {
+          index,
+          rel,
+          how: `task ${fixes.map((i) => i.fixTask).join(", ")} verified`,
+        });
+      }
+    });
+    for (const [group, pause] of latest)
+      for (const step of PAUSE_SETTLES) {
+        const rows = input.rows
+          .map((row, index) => ({ row, index }))
+          .filter(
+            ({ row, index }) =>
+              row.type === "step-done" &&
+              row.step === step &&
+              taskGroupOf(row) === group &&
+              index < pause.index,
+          );
+        if (rows.at(-1)?.row.verdict !== "FAIL") continue;
+        resolvedFindings.push(
+          `${step} (group ${group}) FAIL, resolved by the Decision Pause (\`${pause.rel}\`), ${pause.how}`,
+        );
+        const key = `${step}#${group}`;
+        const g = groups.find((x) => x.key === key);
+        if (g !== undefined && lastOf(g).index < pause.index) pauseSettled.add(key);
+      }
+  }
+
   for (const g of groups) {
     const { row, index } = lastOf(g);
     if (g.step === `${workflow}-summary`) continue;
+    if (pauseSettled.has(g.key) && row.verdict === "FAIL") continue;
     if (RUN_TESTS.has(g.step)) {
       if (row.verdict === "FAIL") fails.push(`${g.label} FAIL`);
       continue;
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index ad09bb51f..dfde5ad17 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -3243,6 +3243,85 @@ describe("bkit workflows summary", () => {
     expect(md).toContain("build-summary | FAIL");
   });
 
+  it("prints CONCERNS when a Fix now group's fix task and a test-fix FAIL are both resolved", async () => {
+    const decisionRel = `${SREL}/build-decision-1-1.md`;
+    const verifyRel = `${SREL}/build-verify-10-1.md`;
+    const block = (n: number) => task(n, true);
+    const plan = [
+      "# Plan",
+      "",
+      `<!-- bkit:group 9 start -->\n### GROUP 9: Work\n${block(41)}\n<!-- bkit:group 9 end -->`,
+      `<!-- bkit:group 10 start -->\n### GROUP 10: Fix\n${block(42)}\n<!-- bkit:group 10 end -->`,
+      "",
+    ].join("\n");
+    const scope = "src/a.test.ts";
+    const cwd = tree(
+      [
+        done("build-plan-tasks", "2020-01-01T00:01:00Z", { verdict: "FAIL", group: 9 }),
+        done("build-plan-verify", "2020-01-01T00:02:00Z", { verdict: "FAIL", group: 9 }),
+        done("build-plan-gaps-remediate", "2020-01-01T00:03:00Z", { verdict: "FAIL", group: 9 }),
+        done("build-decision", "2020-01-01T00:04:00Z", {
+          route: "verify",
+          artifacts: [decisionRel],
+        }),
+        done("build-plan-tasks", "2020-01-01T00:05:00Z", { verdict: "PASS", group: 10 }),
+        done("build-plan-verify", "2020-01-01T00:06:00Z", {
+          verdict: "PASS",
+          failures: 0,
+          group: 10,
+          artifacts: [verifyRel],
+        }),
+        done("build-run-tests", "2020-01-01T00:07:00Z", {
+          verdict: "FAIL",
+          failures: 1,
+          scope,
+        }),
+        done("build-failure-remediate", "2020-01-01T00:08:00Z", { verdict: "FAIL" }),
+        done("build-run-tests", "2020-01-01T00:09:00Z", {
+          verdict: "PASS",
+          failures: 0,
+          attempt: 2,
+          scope,
+        }),
+      ],
+      plan,
+    );
+    write(
+      cwd,
+      decisionRel,
+      [
+        "Status: DECIDED",
+        "Question: VERIFY_GAPS",
+        "From: verify",
+        "Pause step: 8",
+        "Plan: docs/plans/p-plan.md",
+        "Group: 9",
+        "Verify attempt: 2",
+        "",
+        "**Q1 — Gap one:** accept it?",
+        "Options: A) Accept / B) Fix now",
+        "Recommended: A) Accept — minor",
+        "Decision: Accept — minor",
+        "",
+        "**Q2 — Gap two:** fix it?",
+        "Options: A) Accept / B) Fix now",
+        "Recommended: B) Fix now — real",
+        "Decision: Fix now",
+        "Fix task: 42",
+        "",
+      ].join("\n"),
+    );
+    write(cwd, verifyRel, "Verdict: PASS\nTasks: 42\n<!-- verdict:end -->\n");
+    const r = await summarize(cwd);
+    expect(r.code).toBe(0);
+    expect(r.json.verdict).toBe("CONCERNS");
+    expect(r.json.failures).toBe(0);
+    const md = fs.readFileSync(path.join(cwd, SREL, "build-summary.md"), "utf-8");
+    expect(md.split("## Resolved Findings")[1]!.split("## ")[0]!).toContain(
+      "build-decision-1-1.md",
+    );
+  });
+
   it("summary recommends /bkit-debug on FAIL", async () => {
     const failed = tree(
       [done("build-run-tests", "2020-01-01T00:10:00Z", { verdict: "FAIL", failures: 2 })],
diff --git a/dist/commands/workflow/decisions.js b/dist/commands/workflow/decisions.js
index 5f1d90e71..368389659 100644
--- a/dist/commands/workflow/decisions.js
+++ b/dist/commands/workflow/decisions.js
@@ -7,6 +7,7 @@
 //   Options: A) {A} / B) {B}
 //   Recommended: A) {A} — {reason}       (a hard blocker: `No recommendation — {why}`)
 //   Decision: {answer} — {words}         (once decided)
+//   Fix task: {N}                        (a `Fix now` item: the plan task that carries its fix)
 //
 // `apply --by=headless` takes each recommendation when nobody can or should be asked: an
 // `Accept` is written `Accept (assumed)` and the file says `Status: ASSUMED`. It never writes a
@@ -58,6 +59,20 @@ export function optionAnswer(answer, options) {
 const letteredOptions = (options) => options.map((o, i) => `${letterAt(i)}) ${o}`).join(" / ");
 /** The letter `name` holds in `options`, or null when it is not one of them. */
 const letterOf = (options, name) => options.includes(name) ? letterAt(options.indexOf(name)) : null;
+/** A `Fix task:` value as a positive integer, else null. */
+const fixTaskOf = (v) => v !== null && /^[1-9][0-9]*$/.test(v) ? Number(v) : null;
+/** The `Key: value` lines before the file's first blank line. */
+export function decisionHeader(text) {
+    const out = {};
+    for (const line of text.split("\n")) {
+        if (line.trim() === "" || line.startsWith("**Q"))
+            break;
+        const m = /^([A-Za-z][\w ]*):[ \t]*(.*?)[ \t]*$/.exec(line);
+        if (m !== null && !(m[1] in out))
+            out[m[1]] = m[2];
+    }
+    return out;
+}
 /** The items of a decision file's text, in file order. */
 export function parseDecisionItems(text) {
     return text
@@ -82,6 +97,7 @@ export function parseDecisionItems(text) {
             recommended: none || rec === null ? null : bareName((option ?? "").trim()),
             reason: why.join(" — ").trim(),
             decision,
+            fixTask: fixTaskOf(lineOf(part, "Fix task")),
             assumed: decision !== null && /^Accept \(assumed\)/.test(decision),
             rejected: lineOf(part, "Rejected") !== null,
             deferred: lineOf(part, "Deferred") !== null,
diff --git a/dist/commands/workflow/summary.js b/dist/commands/workflow/summary.js
index 44cc8eb62..f5839aafa 100644
--- a/dist/commands/workflow/summary.js
+++ b/dist/commands/workflow/summary.js
@@ -4,7 +4,7 @@
 // disk and passes `read` for the log files.
 import { coversList } from "./plans.js";
 import { issueIdOf } from "./fids.js";
-import { parseDecisionItems } from "./decisions.js";
+import { decisionHeader, parseDecisionItems } from "./decisions.js";
 import { parsePlanBlocks } from "./plan-blocks.js";
 import { parseJson } from "../../shared/json.js";
 import { challengeResolution, taskVerified } from "./summary-findings.js";
@@ -226,6 +226,8 @@ function stepGroups(rows) {
     return [...groups.values()];
 }
 const lastOf = (g) => g.rows.at(-1);
+/** Steps of a task group that a verify pause's answer settles when they ended FAIL. */
+const PAUSE_SETTLES = ["build-plan-tasks", "build-plan-verify", "build-plan-gaps-remediate"];
 /** A level-2 section whose heading matches `title`, minus the template's non-content subsections. */
 function planSection(text, title) {
     const lines = text.split("\n");
@@ -288,10 +290,70 @@ export function buildSummary(input) {
             const sev = SEVERITY.exec(t.text)?.[1];
             fails.push(`Task ${t.task} not done (${t.path})${sev === undefined ? "" : ` — ${sev} challenge finding`}`);
         }
+    // A verify pause answered in full settles its group's failed rows from before the pause:
+    // each `Fix now` item names a task verified after the pause, or every item is `Accept`.
+    const pauseSettled = new Set();
+    if (workflow === "build") {
+        const latest = new Map();
+        input.rows.forEach((row, index) => {
+            if (row.type !== "step-done" || row.step !== "build-decision")
+                return;
+            for (const rel of artifactsOf(row)) {
+                const text = read(rel);
+                if (text === null)
+                    continue;
+                const header = decisionHeader(text);
+                const group = /^[0-9]+$/.test(header.Group ?? "") ? Number(header.Group) : undefined;
+                if (header.From !== "verify" || group === undefined)
+                    continue;
+                const gaps = parseDecisionItems(text);
+                if (gaps.length === 0 || gaps.some((i) => i.decision === null))
+                    continue;
+                const asks = gaps.filter((i) => i.title !== "Verify");
+                const fixes = asks.filter((i) => /^Fix now\b/.test(i.decision ?? ""));
+                if (asks.length === 0)
+                    continue;
+                if (fixes.length === 0) {
+                    if (!asks.every((i) => /^Accept\b/.test(i.decision ?? "")))
+                        continue;
+                    latest.set(group, { index, rel, how: "every item accepted" });
+                    continue;
+                }
+                if (!asks.every((i) => fixes.includes(i) || /^Accept\b/.test(i.decision ?? "")))
+                    continue;
+                const fixTasks = fixes.map((i) => tasks.find((t) => t.task === i.fixTask));
+                if (fixTasks.some((t) => t === undefined || !taskVerified(input, t, index)))
+                    continue;
+                latest.set(group, {
+                    index,
+                    rel,
+                    how: `task ${fixes.map((i) => i.fixTask).join(", ")} verified`,
+                });
+            }
+        });
+        for (const [group, pause] of latest)
+            for (const step of PAUSE_SETTLES) {
+                const rows = input.rows
+                    .map((row, index) => ({ row, index }))
+                    .filter(({ row, index }) => row.type === "step-done" &&
+                    row.step === step &&
+                    taskGroupOf(row) === group &&
+                    index < pause.index);
+                if (rows.at(-1)?.row.verdict !== "FAIL")
+                    continue;
+                resolvedFindings.push(`${step} (group ${group}) FAIL, resolved by the Decision Pause (\`${pause.rel}\`), ${pause.how}`);
+                const key = `${step}#${group}`;
+                const g = groups.find((x) => x.key === key);
+                if (g !== undefined && lastOf(g).index < pause.index)
+                    pauseSettled.add(key);
+            }
+    }
     for (const g of groups) {
         const { row, index } = lastOf(g);
         if (g.step === `${workflow}-summary`)
             continue;
+        if (pauseSettled.has(g.key) && row.verdict === "FAIL")
+            continue;
         if (RUN_TESTS.has(g.step)) {
             if (row.verdict === "FAIL")
                 fails.push(`${g.label} FAIL`);
