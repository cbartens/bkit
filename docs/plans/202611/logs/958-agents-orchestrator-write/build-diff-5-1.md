diff --git a/.bkit/core/engine/commands/workflow/audit-report.test.ts b/.bkit/core/engine/commands/workflow/audit-report.test.ts
index c6a84e2bc..e560a7780 100644
--- a/.bkit/core/engine/commands/workflow/audit-report.test.ts
+++ b/.bkit/core/engine/commands/workflow/audit-report.test.ts
@@ -76,4 +76,18 @@ describe("parseAuditReport", () => {
     expect(() => parseAuditReport(text, "security")).toThrow(/security-2/);
     expect(() => parseAuditReport(text, "security")).toThrow(/empty Severity/);
   });
+
+  it("reads a row whose Evidence cell holds a backslash", () => {
+    const text = report(
+      "| security-1 | HIGH | Token logged | src/a.ts:10 | regex `\\d+` and a\\_b | fix | new |",
+    );
+    const parsed = parseAuditReport(text, "security");
+    expect(parsed.findings).toHaveLength(1);
+    expect(parsed.findings[0]).toMatchObject({ id: "security-1", severity: "HIGH" });
+  });
+
+  it("reads a lone short None row as no finding", () => {
+    const text = report("| None |");
+    expect(parseAuditReport(text, "security").findings).toEqual([]);
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/audit-report.ts b/.bkit/core/engine/commands/workflow/audit-report.ts
index e459c8fc4..16355f9cb 100644
--- a/.bkit/core/engine/commands/workflow/audit-report.ts
+++ b/.bkit/core/engine/commands/workflow/audit-report.ts
@@ -6,7 +6,6 @@ import * as fs from "node:fs";
 import * as path from "node:path";
 
 import { queryLedger } from "../../ledgers/telemetry.js";
-import { parseMarkdownTable } from "../../shared/text.js";
 import { CommandError, EXIT } from "../lib.js";
 
 // ---------------------------------------------------------------------------
@@ -138,6 +137,35 @@ function tablesIn(text: string): string[] {
   return tables;
 }
 
+/** A table row's cells: the outer pipes dropped, `\\|` kept inside its cell. */
+function cellsOf(line: string): string[] {
+  const inner = line
+    .trim()
+    .replace(/^\|/, "")
+    .replace(/(?<!\\)\|$/, "");
+  return inner.split(/(?<!\\)\|/).map((c) => c.replace(/\\\|/g, "|").trim());
+}
+
+/**
+ * An agent-written pipe table read leniently: backslashes stay in a cell, an alignment
+ * separator (`:---`) is skipped, and a lone `None` / `N/A` row is no row. A row with the wrong
+ * cell count is refused by its first cell; the result is that refusal's text then.
+ */
+function readTable(text: string): { head: string[]; rows: Record<string, string>[] } | string {
+  const lines = text.split("\n");
+  const head = cellsOf(lines[0] ?? "");
+  const rows: Record<string, string>[] = [];
+  for (const line of lines.slice(1)) {
+    const cells = cellsOf(line);
+    if (cells.every((c) => /^:?-{1,}:?$/.test(c))) continue;
+    if (cells.length === 1 && /^(None|N\/A)\.?$/.test(bare(cells[0]))) continue;
+    if (cells.length !== head.length)
+      return `row "${cells[0] ?? ""}" has ${cells.length} cells where the header has ${head.length}; escape a pipe in a cell as \\|`;
+    rows.push(Object.fromEntries(head.map((h, i) => [h, cells[i] ?? ""])));
+  }
+  return { head, rows };
+}
+
 /**
  * The findings the report's `## Findings` table holds. Each row needs an `ID`, a known `Severity`,
  * a `Title`, a `Location` and a `Key` that is `new` or an `audit-<slug>-` key; a refusal names the
@@ -150,11 +178,12 @@ export function parseAuditReport(text: string, slug: string): AuditReport {
   const rest = text.slice(from).replace(/^## Findings\s*$/m, "");
   const next = rest.search(/^## /m);
   const section = next < 0 ? rest : rest.slice(0, next);
-  const tables = tablesIn(section).map((t) => parseMarkdownTable(t));
-  if (tables.some((t) => t === null)) throw bad("a Findings table is not a well-formed table");
-  const table = tables.find((t) => t !== null && t.head.includes("ID"));
-  if (table === undefined || table === null)
-    throw bad("the Findings section has no table with an `ID` column");
+  const tables = tablesIn(section).map((t) => readTable(t));
+  const broken = tables.find((t) => typeof t === "string");
+  if (typeof broken === "string") throw bad(broken);
+  const table = tables.find((t) => typeof t !== "string" && t.head.includes("ID")) as
+    { head: string[]; rows: Record<string, string>[] } | undefined;
+  if (table === undefined) throw bad("the Findings section has no table with an `ID` column");
   for (const name of FINDINGS_HEADS)
     if (!table.head.includes(name)) throw bad(`the Findings table has no \`${name}\` column`);
   const findings: AuditFinding[] = [];
diff --git a/.bkit/core/engine/commands/workflow/challenge.ts b/.bkit/core/engine/commands/workflow/challenge.ts
index 82e2627f8..8aa81eb22 100644
--- a/.bkit/core/engine/commands/workflow/challenge.ts
+++ b/.bkit/core/engine/commands/workflow/challenge.ts
@@ -134,12 +134,36 @@ export function normalizeLocation(raw: string, cwd: string): string | null {
 const headerValue = (text: string, name: string) =>
   new RegExp(`^${name}:\\s*(\\S+)`, "m").exec(text.split("<!-- verdict:end -->")[0]!)?.[1];
 
-/** The section of a report under `heading` (`## Name`) and its first line's number (1-based); "" when none. */
+/** For each line, whether it sits inside a code fence (the fence lines themselves count as inside). */
+function fencedLines(lines: string[]): boolean[] {
+  let open = false;
+  return lines.map((l) => {
+    const fence = /^\s*(```|~~~)/.test(l);
+    if (fence && open) {
+      open = false;
+      return true;
+    }
+    if (fence) open = true;
+    return open;
+  });
+}
+
+/** `text`'s lines that sit outside code fences. */
+export const unfencedLines = (text: string): string[] => {
+  const lines = text.split("\n");
+  const fenced = fencedLines(lines);
+  return lines.filter((_, i) => !fenced[i]);
+};
+
+/** The section of a report under `heading` (`## Name`) and its first line's number (1-based); "" when none. A fenced `## ` line neither starts nor ends a section. */
 export function reportSection(text: string, heading: string): { body: string; line: number } {
   const lines = text.split("\n");
-  const start = lines.findIndex((l) => l === heading || l.startsWith(`${heading} `));
+  const fenced = fencedLines(lines);
+  const start = lines.findIndex(
+    (l, i) => !fenced[i] && (l === heading || l.startsWith(`${heading} `)),
+  );
   if (start < 0) return { body: "", line: 0 };
-  const end = lines.findIndex((l, i) => i > start && /^## /.test(l));
+  const end = lines.findIndex((l, i) => i > start && !fenced[i] && /^## /.test(l));
   return { body: lines.slice(start + 1, end < 0 ? undefined : end).join("\n"), line: start + 2 };
 }
 
diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index a2ae7c85e..056655c34 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -369,6 +369,48 @@ describe("bkit decisions skip", () => {
     expect(r.json.problem).toContain("From");
   });
 
+  it("keeps the re-run when the owner's Fix now beats an engine Accept (assumed)", async () => {
+    const { root, logs } = checkout();
+    const file = path.join(logs, "build-decision-1-1.md");
+    fs.writeFileSync(
+      file,
+      [
+        "Question: CHALLENGE",
+        "From: verify",
+        "Group: 1",
+        "",
+        "**Q2 \u2014 Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
+        "A) Accept \u2014 the item is recorded as accepted",
+        "B) Fix now \u2014 a fix task is added to the plan",
+        "Recommended: A) Accept \u2014 the caller already caps it",
+        "Decision: Fix now \u2014 the owner wants it fixed",
+        "",
+      ].join("\n"),
+    );
+    fs.writeFileSync(
+      engineOf(file),
+      [
+        "Source changed: false",
+        "",
+        "## Progress",
+        "",
+        "**Q1 \u2014 Verify loop:** decide the items below instead of another round?",
+        "A) Try again \u2014 another fix round runs",
+        "B) Decide \u2014 the questions below are asked instead of another round",
+        "Recommended: B) Decide \u2014 another round is unlikely to help",
+        "Decision: Decide",
+        "",
+        "**Q2 \u2014 Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
+        "Decision: Accept (assumed) \u2014 the caller caps it (no owner, LOCAL, 2026-11-17)",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["decisions", "skip", `--file=${file}`], root);
+    expect(r.code).toBe(1);
+    expect(r.json.route).toBeNull();
+    expect(r.json.problem).toContain("Fix now");
+  });
+
   it("decisions skip exits 2 for a missing file", async () => {
     const { root, logs } = checkout();
     const r = await run(
@@ -928,6 +970,37 @@ describe("bkit decisions check", () => {
     expect(`${JSON.stringify(r.json)}${r.err}`).toContain("Q1");
   });
 
+  it("refuses a question line written with an en dash, naming the line", async () => {
+    const { root, logs } = checkout();
+    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1);
+    fs.writeFileSync(file, fs.readFileSync(file, "utf-8").replace("**Q1 \u2014 ", "**Q1 \u2013 "));
+    const r = await run(["decisions", "check", `--file=${file}`], root);
+    expect(r.code).toBe(6);
+    expect(`${JSON.stringify(r.json)}${r.err}`).toContain("Q1 \u2013");
+  });
+
+  it("refuses a file with no question when the engine file holds no loop question", async () => {
+    const { root, logs } = checkout();
+    const file = path.join(logs, "build-decision-1-1.md");
+    fs.writeFileSync(file, ["Question: CHALLENGE", "From: verify", "Group: 1", ""].join("\n"));
+    const r = await run(["decisions", "check", `--file=${file}`], root);
+    expect(r.code).toBe(6);
+  });
+
+  it("refuses a Status, Source changed or Gate line in the orchestrator's header", async () => {
+    for (const line of ["Status: OPEN", "Source changed: false", "Gate: FAIL"]) {
+      const { root, logs } = checkout();
+      const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1);
+      fs.writeFileSync(
+        file,
+        fs.readFileSync(file, "utf-8").replace("From: verify\n", `From: verify\n${line}\n`),
+      );
+      const r = await run(["decisions", "check", `--file=${file}`], root);
+      expect(r.code, line).toBe(6);
+      expect(`${JSON.stringify(r.json)}${r.err}`, line).toContain(line.split(":")[0]);
+    }
+  });
+
   it("accepts questions numbered from Q1 when the pause has no engine file", async () => {
     const { root, logs } = checkout();
     const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
diff --git a/.bkit/core/engine/commands/workflow/decisions.ts b/.bkit/core/engine/commands/workflow/decisions.ts
index 3502a3287..360d58bdf 100644
--- a/.bkit/core/engine/commands/workflow/decisions.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.ts
@@ -42,6 +42,7 @@ import {
   engineSibling,
   isEngineFile,
   ITEM_SPLIT,
+  decisionHeader,
   letterAt,
   mergeItems,
   pauseStatus,
@@ -167,6 +168,15 @@ const readIf = (file: string): string | null =>
 export function itemProblem(text: string, engineText: string | null): string | null {
   const seen = new Set<number>();
   const engineHasLoop = engineText !== null && /^## Progress$/m.test(engineText);
+  for (const name of ["Status", "Source changed", "Gate"]) {
+    if (name in decisionHeader(text))
+      return `the header holds a "${name}:" line; the engine writes it in the -engine.md file, so delete it`;
+  }
+  const stray = /^(?:\*\*Q\d+(?! — )|#+[ \t]*Q\d+\b).*$/m.exec(text);
+  if (stray !== null)
+    return `"${stray[0].slice(0, 60)}" opens like a question but not as "**Q{n} — {title}:** {question}"; write an em dash (—) after the number`;
+  if (!engineHasLoop && !/^\*\*Q\d+ — /m.test(text))
+    return 'the file holds no question; write each as "**Q{n} — {title}:** {question}" (the engine file holds no loop question)';
   for (const part of text.split(ITEM_SPLIT).slice(1)) {
     const n = Number(/^\*\*Q(\d+) — /.exec(part)?.[1] ?? 0);
     const q = `Q${n}`;
diff --git a/.bkit/core/engine/commands/workflow/open-decision.test.ts b/.bkit/core/engine/commands/workflow/open-decision.test.ts
index 82b9d22b9..7345b2b5e 100644
--- a/.bkit/core/engine/commands/workflow/open-decision.test.ts
+++ b/.bkit/core/engine/commands/workflow/open-decision.test.ts
@@ -167,6 +167,24 @@ describe("decision file readers", () => {
     expect(q2.options).toEqual(["Accept", "Fix now"]);
   });
 
+  it("an owner's Fix now in the decision file wins over an engine Accept (assumed)", () => {
+    const { read, rel } = pauseDir(
+      orchestratorFile({ answer: "Fix now — the owner chose a fix" }),
+      engineFile({ q2: "Accept (assumed) — cosmetic (no owner, LOCAL, 2026-11-17)" }),
+    );
+    const q2 = decisionItems(read, rel).find((i) => i.n === 2)!;
+    expect(q2.decision).toBe("Fix now — the owner chose a fix");
+  });
+
+  it("an owner's answer in the decision file wins over an engine line applied without asking", () => {
+    const { read, rel } = pauseDir(
+      orchestratorFile({ answer: "Fix now — the owner chose a fix" }),
+      engineFile({ q2: "Accept — recommended; applied without asking (GITHUB_ACTION)" }),
+    );
+    const q2 = decisionItems(read, rel).find((i) => i.n === 2)!;
+    expect(q2.decision).toBe("Fix now — the owner chose a fix");
+  });
+
   it("decisionItems reads an old single-file layout like parseDecisionItems", () => {
     const text = pause({ headers: SETTLED, loop: "B" });
     const { read, rel } = pauseDir(text);
diff --git a/.bkit/core/engine/commands/workflow/open-decision.ts b/.bkit/core/engine/commands/workflow/open-decision.ts
index 8c90d899f..969d66b9e 100644
--- a/.bkit/core/engine/commands/workflow/open-decision.ts
+++ b/.bkit/core/engine/commands/workflow/open-decision.ts
@@ -114,9 +114,12 @@ export const engineSibling = (rel: string): string => rel.replace(/\.md$/, "-eng
 /** Whether a file name is an engine file (`…-engine.md`), which is read beside its decision file. */
 export const isEngineFile = (name: string): boolean => /-engine\.md$/.test(name);
 
+/** An engine `Decision:` line taken without asking; the owner's answer in the decision file beats it. */
+const TAKEN_UNASKED = /^Accept \(assumed\)|recommended; applied without asking/;
+
 /**
  * The items of a decision file merged with those of its engine file: items by question
- * number, the engine file's answer winning for a question both hold, a question only the
+ * number, the engine file's answer winning for a question both hold (except one taken without asking, which the decision file's own answer beats), a question only the
  * engine file holds (the loop question) kept as it is. With no engine text the result is
  * `parseDecisionItems(text)`.
  */
@@ -131,10 +134,11 @@ export function mergeItems(text: string, engineText: string | null | undefined):
       merged.push(e);
       continue;
     }
+    const ownWins = base.decision !== null && e.decision !== null && TAKEN_UNASKED.test(e.decision);
     merged[i] = {
       ...base,
-      decision: e.decision ?? base.decision,
-      assumed: e.decision === null ? base.assumed : e.assumed,
+      decision: ownWins ? base.decision : (e.decision ?? base.decision),
+      assumed: ownWins || e.decision === null ? base.assumed : e.assumed,
       fixTask: e.fixTask ?? base.fixTask,
       rejected: base.rejected || e.rejected,
       deferred: base.deferred || e.deferred,
diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index f68692213..5751f78e7 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -3374,4 +3374,58 @@ describe("bkit steps finish", () => {
     expect(r.code).toBe(6);
     expect(r.json.problem).toContain("bkit-build-challenge-1");
   });
+
+  it("does not count a fenced line under ## CRITICAL as an item", async () => {
+    const cwd = repo();
+    write(
+      cwd,
+      "logs/review.md",
+      [
+        "Verdict: FAIL",
+        "Failures: 1",
+        "Redesign: false",
+        "<!-- verdict:end -->",
+        "## CRITICAL",
+        "- The plan quotes a task block it never defines.",
+        "",
+        "```markdown",
+        "- [ ] **TASK 3:** quoted from the plan",
+        "```",
+        "## OPTIONAL",
+        "None",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(cwd, REVIEW);
+    expect(r.code).toBe(0);
+    expect(r.json.problem).toBeUndefined();
+  });
+
+  it("a fenced ## line under ## CRITICAL does not end the section", async () => {
+    const cwd = repo();
+    write(
+      cwd,
+      "logs/review.md",
+      [
+        "Verdict: FAIL",
+        "Failures: 2",
+        "Redesign: false",
+        "<!-- verdict:end -->",
+        "## CRITICAL",
+        "- The first problem.",
+        "",
+        "```markdown",
+        "## Example heading quoted from the plan",
+        "```",
+        "",
+        "- The second problem.",
+        "## OPTIONAL",
+        "None",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(cwd, REVIEW);
+    expect(r.code).toBe(0);
+    expect(r.json.problem).toBeUndefined();
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index dface2bc6..cc817ae2b 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -47,7 +47,7 @@ import type { AskPoint } from "../../shared/settings.js";
 import { isResumable, runProgress, WORKFLOW_STEPS } from "./step-table.js";
 import { planFiles } from "./run-facts.js";
 import { engineSibling, skipProblem } from "./open-decision.js";
-import { mergeFindings, parseFindings, reportSection } from "./challenge.js";
+import { mergeFindings, parseFindings, reportSection, unfencedLines } from "./challenge.js";
 import { fidProblem, normaliseFid, readIssueTracker } from "./fids.js";
 import { buildComment } from "./issues.js";
 import {
@@ -1146,9 +1146,9 @@ function bodyProblem(
     const value = Number(header[d.name]);
     let counted: number;
     if (d.count.rule === "items") {
-      counted = reportSection(text, d.count.heading)
-        .body.split("\n")
-        .filter((l) => /^[-*]\s/.test(l) && !/^[-*]\s+None\.?\s*$/.test(l)).length;
+      counted = unfencedLines(reportSection(text, d.count.heading).body).filter(
+        (l) => /^[-*]\s/.test(l) && !/^[-*]\s+None\.?\s*$/.test(l),
+      ).length;
     } else if (d.count.rule === "fixable-lines") {
       const lines = fixableLines(text);
       counted = lines.length;
@@ -1168,7 +1168,7 @@ function bodyProblem(
         return `${at}: CONCERNS allows HIGH or lower, got ${counted} CRITICAL task block(s)`;
     }
     if (counted !== value)
-      return `${at}: ${d.name} is ${value} but ${d.count.heading} counted ${counted}`;
+      return `${at}: ${d.name} is ${value} but ${d.count.heading} counted ${counted}${d.count.rule === "items" ? ' (the rule: top-level "- " lines outside code fences, not "- None")' : ""}`;
   }
   return undefined;
 }
diff --git a/dist/commands/workflow/audit-report.js b/dist/commands/workflow/audit-report.js
index e7196db15..f211b2de7 100644
--- a/dist/commands/workflow/audit-report.js
+++ b/dist/commands/workflow/audit-report.js
@@ -4,7 +4,6 @@
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { queryLedger } from "../../ledgers/telemetry.js";
-import { parseMarkdownTable } from "../../shared/text.js";
 import { CommandError, EXIT } from "../lib.js";
 // ---------------------------------------------------------------------------
 // Audit report — the findings the report's table holds. The agent writes the table; the
@@ -83,6 +82,35 @@ function tablesIn(text) {
     }
     return tables;
 }
+/** A table row's cells: the outer pipes dropped, `\\|` kept inside its cell. */
+function cellsOf(line) {
+    const inner = line
+        .trim()
+        .replace(/^\|/, "")
+        .replace(/(?<!\\)\|$/, "");
+    return inner.split(/(?<!\\)\|/).map((c) => c.replace(/\\\|/g, "|").trim());
+}
+/**
+ * An agent-written pipe table read leniently: backslashes stay in a cell, an alignment
+ * separator (`:---`) is skipped, and a lone `None` / `N/A` row is no row. A row with the wrong
+ * cell count is refused by its first cell; the result is that refusal's text then.
+ */
+function readTable(text) {
+    const lines = text.split("\n");
+    const head = cellsOf(lines[0] ?? "");
+    const rows = [];
+    for (const line of lines.slice(1)) {
+        const cells = cellsOf(line);
+        if (cells.every((c) => /^:?-{1,}:?$/.test(c)))
+            continue;
+        if (cells.length === 1 && /^(None|N\/A)\.?$/.test(bare(cells[0])))
+            continue;
+        if (cells.length !== head.length)
+            return `row "${cells[0] ?? ""}" has ${cells.length} cells where the header has ${head.length}; escape a pipe in a cell as \\|`;
+        rows.push(Object.fromEntries(head.map((h, i) => [h, cells[i] ?? ""])));
+    }
+    return { head, rows };
+}
 /**
  * The findings the report's `## Findings` table holds. Each row needs an `ID`, a known `Severity`,
  * a `Title`, a `Location` and a `Key` that is `new` or an `audit-<slug>-` key; a refusal names the
@@ -96,11 +124,12 @@ export function parseAuditReport(text, slug) {
     const rest = text.slice(from).replace(/^## Findings\s*$/m, "");
     const next = rest.search(/^## /m);
     const section = next < 0 ? rest : rest.slice(0, next);
-    const tables = tablesIn(section).map((t) => parseMarkdownTable(t));
-    if (tables.some((t) => t === null))
-        throw bad("a Findings table is not a well-formed table");
-    const table = tables.find((t) => t !== null && t.head.includes("ID"));
-    if (table === undefined || table === null)
+    const tables = tablesIn(section).map((t) => readTable(t));
+    const broken = tables.find((t) => typeof t === "string");
+    if (typeof broken === "string")
+        throw bad(broken);
+    const table = tables.find((t) => typeof t !== "string" && t.head.includes("ID"));
+    if (table === undefined)
         throw bad("the Findings section has no table with an `ID` column");
     for (const name of FINDINGS_HEADS)
         if (!table.head.includes(name))
diff --git a/dist/commands/workflow/challenge.js b/dist/commands/workflow/challenge.js
index 4a24f7385..8bb757608 100644
--- a/dist/commands/workflow/challenge.js
+++ b/dist/commands/workflow/challenge.js
@@ -97,13 +97,34 @@ export function normalizeLocation(raw, cwd) {
 }
 /** The header line `{name}: value` above `<!-- verdict:end -->`, or undefined. */
 const headerValue = (text, name) => new RegExp(`^${name}:\\s*(\\S+)`, "m").exec(text.split("<!-- verdict:end -->")[0])?.[1];
-/** The section of a report under `heading` (`## Name`) and its first line's number (1-based); "" when none. */
+/** For each line, whether it sits inside a code fence (the fence lines themselves count as inside). */
+function fencedLines(lines) {
+    let open = false;
+    return lines.map((l) => {
+        const fence = /^\s*(```|~~~)/.test(l);
+        if (fence && open) {
+            open = false;
+            return true;
+        }
+        if (fence)
+            open = true;
+        return open;
+    });
+}
+/** `text`'s lines that sit outside code fences. */
+export const unfencedLines = (text) => {
+    const lines = text.split("\n");
+    const fenced = fencedLines(lines);
+    return lines.filter((_, i) => !fenced[i]);
+};
+/** The section of a report under `heading` (`## Name`) and its first line's number (1-based); "" when none. A fenced `## ` line neither starts nor ends a section. */
 export function reportSection(text, heading) {
     const lines = text.split("\n");
-    const start = lines.findIndex((l) => l === heading || l.startsWith(`${heading} `));
+    const fenced = fencedLines(lines);
+    const start = lines.findIndex((l, i) => !fenced[i] && (l === heading || l.startsWith(`${heading} `)));
     if (start < 0)
         return { body: "", line: 0 };
-    const end = lines.findIndex((l, i) => i > start && /^## /.test(l));
+    const end = lines.findIndex((l, i) => i > start && !fenced[i] && /^## /.test(l));
     return { body: lines.slice(start + 1, end < 0 ? undefined : end).join("\n"), line: start + 2 };
 }
 /** The group wrapper a Findings Log gets when the reviewer wrote task blocks only. */
diff --git a/dist/commands/workflow/decisions.js b/dist/commands/workflow/decisions.js
index 9886521bd..17fa419b7 100644
--- a/dist/commands/workflow/decisions.js
+++ b/dist/commands/workflow/decisions.js
@@ -34,7 +34,7 @@ import { CommandError, EXIT, git } from "../lib.js";
 import { loopProgress } from "./counters.js";
 import { appendLedgerRows, monthAndFid } from "./ledgers.js";
 import { LOOPS, loopGateStep } from "./loops.js";
-import { decisionFileHeader, decisionItems, engineSibling, isEngineFile, ITEM_SPLIT, letterAt, mergeItems, pauseStatus, parseDecisionItems, skipProblem, undecidedBesidesLoop, } from "./open-decision.js";
+import { decisionFileHeader, decisionItems, engineSibling, isEngineFile, ITEM_SPLIT, decisionHeader, letterAt, mergeItems, pauseStatus, parseDecisionItems, skipProblem, undecidedBesidesLoop, } from "./open-decision.js";
 import { classifyAt } from "./runtime.js";
 import { positiveInt, str } from "./status.js";
 /** Exit code: `apply --by=headless` left hard blockers (no recommendation) for the owner. */
@@ -130,6 +130,15 @@ const readIf = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf-8") :
 export function itemProblem(text, engineText) {
     const seen = new Set();
     const engineHasLoop = engineText !== null && /^## Progress$/m.test(engineText);
+    for (const name of ["Status", "Source changed", "Gate"]) {
+        if (name in decisionHeader(text))
+            return `the header holds a "${name}:" line; the engine writes it in the -engine.md file, so delete it`;
+    }
+    const stray = /^(?:\*\*Q\d+(?! — )|#+[ \t]*Q\d+\b).*$/m.exec(text);
+    if (stray !== null)
+        return `"${stray[0].slice(0, 60)}" opens like a question but not as "**Q{n} — {title}:** {question}"; write an em dash (—) after the number`;
+    if (!engineHasLoop && !/^\*\*Q\d+ — /m.test(text))
+        return 'the file holds no question; write each as "**Q{n} — {title}:** {question}" (the engine file holds no loop question)';
     for (const part of text.split(ITEM_SPLIT).slice(1)) {
         const n = Number(/^\*\*Q(\d+) — /.exec(part)?.[1] ?? 0);
         const q = `Q${n}`;
diff --git a/dist/commands/workflow/open-decision.js b/dist/commands/workflow/open-decision.js
index d5dd5df1a..d4314c504 100644
--- a/dist/commands/workflow/open-decision.js
+++ b/dist/commands/workflow/open-decision.js
@@ -86,9 +86,11 @@ export function parseDecisionItems(text) {
 export const engineSibling = (rel) => rel.replace(/\.md$/, "-engine.md");
 /** Whether a file name is an engine file (`…-engine.md`), which is read beside its decision file. */
 export const isEngineFile = (name) => /-engine\.md$/.test(name);
+/** An engine `Decision:` line taken without asking; the owner's answer in the decision file beats it. */
+const TAKEN_UNASKED = /^Accept \(assumed\)|recommended; applied without asking/;
 /**
  * The items of a decision file merged with those of its engine file: items by question
- * number, the engine file's answer winning for a question both hold, a question only the
+ * number, the engine file's answer winning for a question both hold (except one taken without asking, which the decision file's own answer beats), a question only the
  * engine file holds (the loop question) kept as it is. With no engine text the result is
  * `parseDecisionItems(text)`.
  */
@@ -104,10 +106,11 @@ export function mergeItems(text, engineText) {
             merged.push(e);
             continue;
         }
+        const ownWins = base.decision !== null && e.decision !== null && TAKEN_UNASKED.test(e.decision);
         merged[i] = {
             ...base,
-            decision: e.decision ?? base.decision,
-            assumed: e.decision === null ? base.assumed : e.assumed,
+            decision: ownWins ? base.decision : (e.decision ?? base.decision),
+            assumed: ownWins || e.decision === null ? base.assumed : e.assumed,
             fixTask: e.fixTask ?? base.fixTask,
             rejected: base.rejected || e.rejected,
             deferred: base.deferred || e.deferred,
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index 94f287d26..b33d6d452 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -22,7 +22,7 @@ import { activeRunStart, savedPointLimit } from "./counters.js";
 import { isResumable, runProgress, WORKFLOW_STEPS } from "./step-table.js";
 import { planFiles } from "./run-facts.js";
 import { engineSibling, skipProblem } from "./open-decision.js";
-import { mergeFindings, parseFindings, reportSection } from "./challenge.js";
+import { mergeFindings, parseFindings, reportSection, unfencedLines } from "./challenge.js";
 import { fidProblem, normaliseFid, readIssueTracker } from "./fids.js";
 import { buildComment } from "./issues.js";
 import { EXIT_FOREIGN_PATH, activeRecord, ownPathCommit, ownSet, } from "./ledgers.js";
@@ -900,9 +900,7 @@ function bodyProblem(ctx, agent, artifact, declared, header, verdict) {
         const value = Number(header[d.name]);
         let counted;
         if (d.count.rule === "items") {
-            counted = reportSection(text, d.count.heading)
-                .body.split("\n")
-                .filter((l) => /^[-*]\s/.test(l) && !/^[-*]\s+None\.?\s*$/.test(l)).length;
+            counted = unfencedLines(reportSection(text, d.count.heading).body).filter((l) => /^[-*]\s/.test(l) && !/^[-*]\s+None\.?\s*$/.test(l)).length;
         }
         else if (d.count.rule === "fixable-lines") {
             const lines = fixableLines(text);
@@ -925,7 +923,7 @@ function bodyProblem(ctx, agent, artifact, declared, header, verdict) {
                 return `${at}: CONCERNS allows HIGH or lower, got ${counted} CRITICAL task block(s)`;
         }
         if (counted !== value)
-            return `${at}: ${d.name} is ${value} but ${d.count.heading} counted ${counted}`;
+            return `${at}: ${d.name} is ${value} but ${d.count.heading} counted ${counted}${d.count.rule === "items" ? ' (the rule: top-level "- " lines outside code fences, not "- None")' : ""}`;
     }
     return undefined;
 }
