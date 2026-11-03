diff --git a/.bkit/core/engine/commands/workflow/ledgers.test.ts b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index 35f6bf512..8432ae98e 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.test.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -1303,3 +1303,168 @@ describe("bkit ledgers check", () => {
     expect((await check(tmp(), "**Ledger rows:** PENDING")).code).toBe(EXIT_ROWS_MISSING);
   });
 });
+
+describe("bkit ledgers triage", () => {
+  const PLAN = [
+    "# Plan",
+    "",
+    "## Out of Scope",
+    "",
+    "| Excluded item | Why `Exempt` | Where it belongs |",
+    "| --- | --- | --- |",
+    "| Something else entirely | declared before work | `docs/elsewhere.md` |",
+    "",
+    "## Reuse Inventory",
+    "",
+    "| Capability | File | Decision |",
+    "| --- | --- | --- |",
+    "| The other guard | `src/b.ts` | EXTEND |",
+    "",
+    "<!-- bkit:group 1 start -->",
+    "### GROUP 1: The group",
+    "",
+    "<!-- bkit:task 1 start -->",
+    "- [ ] **TASK 1:** Guard the call.",
+    "  - **UPDATE:** `guard` in `src/a.ts`: add the check",
+    "  - **DONE WHEN:** the guard runs",
+    "  - **TEST FIRST:** n/a — text only",
+    "<!-- bkit:task 1 end -->",
+    "<!-- bkit:group 1 end -->",
+  ].join("\n");
+  const PLAN_FILE = "docs/plans/202610/701-engine-work-build-plan.md";
+
+  const deferral = (over: Record<string, unknown> = {}) => ({
+    schema: 3,
+    ts: 1793000000001,
+    kind: "deferral",
+    key: "701-deferred-guard",
+    repo: "o/r",
+    bkit: { version: "6.0.0" },
+    by: { workflow: "plan", step: "plan-generate" },
+    references: ["701", "src/a.ts"],
+    type: "issue",
+    category: "correctness",
+    severity: "MEDIUM",
+    reason: "scope-declared",
+    summary: "guard a call",
+    description: "the call is unguarded",
+    remediation: "Add the check in src/a.ts beside the guard, then a test in src/a.test.ts.",
+    status: "OPEN",
+    ...over,
+  });
+
+  /** A repo holding the plan, the tree paths the readers name, and the deferral rows. */
+  function triageRepo(rows: Array<Record<string, unknown>>) {
+    const r = repo();
+    put(r, PLAN_FILE, PLAN);
+    put(r, "src/a.ts", "export const guard = 1;\n");
+    put(r, "src/b.ts", "export const other = 1;\n");
+    put(r, "docs/deferrals.jsonl", rows.map((x) => `${JSON.stringify(x)}\n`).join(""));
+    commitAll(r);
+    return r;
+  }
+
+  const triage = (cwd: string) =>
+    run(cwd, ["triage", "--fid=701-engine-work-build", `--plan=${PLAN_FILE}`]);
+
+  const lines = (root: string) =>
+    fs
+      .readFileSync(path.join(root, "docs/deferrals.jsonl"), "utf-8")
+      .trim()
+      .split("\n")
+      .map((l) => JSON.parse(l) as Record<string, unknown>);
+
+  const held = (row: { tests: Array<{ test: string; held: boolean }> }) =>
+    row.tests.filter((t) => t.held).map((t) => t.test);
+
+  it("triage keeps a low-severity deferral exempt", async () => {
+    const r = triageRepo([
+      deferral({ key: "701-low-finding", reason: "low-severity", severity: "LOW" }),
+    ]);
+    const res = await triage(r);
+    expect(res.code).toBe(0);
+    expect(res.json.rows.map((x: { key: string; bucket: string }) => [x.key, x.bucket])).toEqual([
+      ["701-low-finding", "Exempt"],
+    ]);
+    expect(lines(r)).toHaveLength(1);
+  });
+
+  it("triage marks an unjustified deferral lazy", async () => {
+    const r = triageRepo([deferral()]);
+    const res = await triage(r);
+    expect(res.code).toBe(0);
+    expect(res.json).toMatchObject({ total: 1, written: 1 });
+    expect(res.json.rows).toHaveLength(1);
+    expect(res.json.rows[0]).toMatchObject({ key: "701-deferred-guard", bucket: "Lazy" });
+    expect(held(res.json.rows[0])).toEqual([
+      "bounded-remediation",
+      "in-scope-surface",
+      "no-external-blocker",
+      "own-declaration",
+    ]);
+  });
+
+  it("triage writes an unjustified row with a minted ts", async () => {
+    const r = triageRepo([deferral()]);
+    const res = await triage(r);
+    expect(res.json.written).toBe(1);
+    const wrote = lines(r);
+    expect(wrote).toHaveLength(2);
+    const [before, after] = wrote as [Record<string, unknown>, Record<string, unknown>];
+    expect(after["key"]).toBe(before["key"]);
+    expect(after["reason"]).toBe("unjustified");
+    expect(after["status"]).toBe("TRIAGED");
+    expect(after["severity"]).toBe("MEDIUM");
+    expect(after["type"]).toBe("issue");
+    expect(after["schema"]).toBe(3);
+    expect(after["ts"] as number).toBeGreaterThan(before["ts"] as number);
+    expect((after["ts"] as number) % 1000).not.toBe(0);
+    expect(String(after["description"])).toContain("bounded-remediation");
+    expect((after["by"] as Record<string, unknown>)["workflow"]).toBe("ship");
+  });
+
+  it("triage ignores another feature's deferral rows", async () => {
+    const r = triageRepo([
+      deferral(),
+      deferral({ key: "702-other-guard", references: ["#702", "src/a.ts"] }),
+    ]);
+    const res = await triage(r);
+    expect(res.json.rows.map((x: { key: string }) => x.key)).toEqual(["701-deferred-guard"]);
+    expect(lines(r).map((x) => x["key"])).toEqual([
+      "701-deferred-guard",
+      "702-other-guard",
+      "701-deferred-guard",
+    ]);
+  });
+
+  it("triage writes nothing when the FID has no deferral row", async () => {
+    const r = triageRepo([deferral({ key: "702-other-guard", references: ["#702", "src/a.ts"] })]);
+    const res = await triage(r);
+    expect(res.code).toBe(0);
+    expect(res.json).toMatchObject({ rows: [], total: 0, written: 0 });
+    expect(lines(r)).toHaveLength(1);
+  });
+
+  it("triage marks a scope-declared row whose only declaration is itself lazy", async () => {
+    const r = triageRepo([
+      deferral({ key: "701-own-declaration", references: ["701-own-declaration", "src/a.ts"] }),
+      deferral({ key: "701-declared", references: ["701", "#701 § Out of Scope", "src/a.ts"] }),
+    ]);
+    const res = await triage(r);
+    expect(res.json.rows.map((x: { key: string; bucket: string }) => [x.key, x.bucket])).toEqual([
+      ["701-own-declaration", "Lazy"],
+      ["701-declared", "Exempt"],
+    ]);
+    expect(held(res.json.rows[0])).toEqual([
+      "bounded-remediation",
+      "in-scope-surface",
+      "no-external-blocker",
+      "own-declaration",
+    ]);
+    expect(lines(r).map((x) => x["key"])).toEqual([
+      "701-own-declaration",
+      "701-declared",
+      "701-own-declaration",
+    ]);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/ledgers.ts b/.bkit/core/engine/commands/workflow/ledgers.ts
index 4010795ed..20cd1d906 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.ts
@@ -17,6 +17,7 @@ import { readBkitVersion } from "../../install/version-file.js";
 import {
   APPEND_LEDGERS,
   SCHEMA,
+  UNJUSTIFIED_REASON,
   gitEnv,
   parse,
   mintTs,
@@ -36,6 +37,7 @@ import {
   type RunContext,
 } from "../lib.js";
 import { str } from "./status.js";
+import { outOfScope, parsePlanBlocks, reuseInventory, type OutOfScopeRow } from "./plan-blocks.js";
 
 /** Root is not a directory or repo, git is too old, or a ref does not resolve. */
 export const EXIT_ROOT = 3;
@@ -788,6 +790,32 @@ export const ledgersCommand: CommandSpec = {
       },
       run: (ctx) => append(ctx),
     },
+    triage: {
+      summary:
+        "Bucket each deferral row the FID declared by the four Deferral Reason tests, and write the unjustified ones.",
+      flags: [
+        { name: "root", type: "string", help: "checkout whose deferrals to read (default: cwd)" },
+        FID_FLAG,
+        {
+          name: "plan",
+          type: "string",
+          required: true,
+          help: "plan file whose task surfaces and Out of Scope rows the four tests read",
+        },
+      ],
+      output: {
+        fid: "the feature id triaged",
+        plan: "the plan the tests were read from",
+        rows: "each matched deferral's key, bucket (Exempt | Lazy), test results and whether a row was written",
+        total: "deferral rows the FID matched",
+        written: "unjustified rows appended",
+      },
+      exitCodes: {
+        [EXIT_ROW_REFUSED]:
+          "a computed unjustified row fails validation or its writer check — nothing written",
+      },
+      run: (ctx) => triage(ctx),
+    },
     check: {
       summary:
         "Check that every decision / deferral key on a plan's `**Ledger rows:**` line is on disk.",
@@ -1460,3 +1488,272 @@ function onlyBookkeeping(ctx: RunContext): number {
       return EXIT.OK;
   }
 }
+
+// ---------------------------------------------------------------------------
+// triage — the sweep's deferral tests, computed
+// ---------------------------------------------------------------------------
+//
+// `.bkit/jsonl.md` § Deferral Reason states the four tests: each names a way a
+// deferral reads as in-scope work that should have been finished, and all four
+// holding marks the row `unjustified`. The engine decides them from the row, its
+// own `references`, the plan's task surfaces, its Reuse Inventory and its
+// Out of Scope table. The sweep keeps the judgement the four cannot reach.
+
+/** The four tests, in `.bkit/jsonl.md` order; each holds when the row reads as in-scope work. */
+export const DEFERRAL_TESTS = [
+  "bounded-remediation",
+  "in-scope-surface",
+  "no-external-blocker",
+  "own-declaration",
+] as const;
+export type DeferralTest = (typeof DEFERRAL_TESTS)[number];
+
+/** One test's verdict on a row. */
+export interface DeferralTestResult {
+  test: DeferralTest;
+  held: boolean;
+}
+
+/** One matched deferral row's bucket and the tests behind it. */
+export interface TriageRow {
+  key: string | null;
+  /** `Lazy` when every test holds: in-scope work that should have been finished. */
+  bucket: "Exempt" | "Lazy";
+  /** Empty when the row is settled before the tests are applied. */
+  tests: DeferralTestResult[];
+  /** A same-`key` `unjustified` / `TRIAGED` row was appended for it. */
+  written: boolean;
+}
+
+export interface TriageResult {
+  fid: string;
+  plan: string;
+  rows: TriageRow[];
+  total: number;
+  written: number;
+}
+
+/** The issue number a FID leads with (`701-engine-work` → `701`), else "". */
+const fidIssue = (fid: string) => /^(\d+)(?=$|[-_])/.exec(fid)?.[1] ?? "";
+
+/** A row's `references` entries, as written. */
+const rowRefs = (row: Record<string, unknown>): string[] =>
+  Array.isArray(row["references"])
+    ? row["references"].filter((x): x is string => typeof x === "string")
+    : [];
+
+/** True when `ref` names the feature: the FID, or its leading issue number as `N` / `#N`. */
+const namesFeature = (ref: string, fid: string, issue: string): boolean =>
+  ref.includes(fid) || (issue !== "" && new RegExp(`^#?${issue}(?![0-9])`).test(ref));
+
+/** Every well-formed row of a JSONL ledger, as written. */
+function readLedgerRows(file: string): Array<Record<string, unknown>> {
+  if (!fs.existsSync(file)) return [];
+  return fs
+    .readFileSync(file, "utf-8")
+    .split("\n")
+    .flatMap((line): Array<Record<string, unknown>> => {
+      if (line.trim() === "") return [];
+      const parsed = parseJson(line);
+      const v = parsed.ok ? parsed.value : null;
+      return typeof v === "object" && v !== null && !Array.isArray(v)
+        ? [v as Record<string, unknown>]
+        : [];
+    });
+}
+
+/** The deferral rows `fid` declared, same-`key` folded last-wins, in first-seen order. */
+export function featureDeferrals(
+  rows: Array<Record<string, unknown>>,
+  fid: string,
+): Array<Record<string, unknown>> {
+  const issue = fidIssue(fid);
+  const kept: Array<Record<string, unknown>> = [];
+  const at = new Map<string, number>();
+  for (const row of rows) {
+    if (row["kind"] !== "deferral") continue;
+    const key = typeof row["key"] === "string" ? row["key"] : "";
+    const named = key !== "" && namesFeature(key, fid, issue);
+    if (!named && !rowRefs(row).some((r) => namesFeature(r, fid, issue))) continue;
+    const seen = key === "" ? undefined : at.get(key);
+    if (seen !== undefined) {
+      kept[seen] = row;
+      continue;
+    }
+    if (key !== "") at.set(key, kept.length);
+    kept.push(row);
+  }
+  return kept;
+}
+
+/** A repo path a token names, with any `:line` suffix cut; null when the token is no path. */
+function pathToken(token: string): string | null {
+  const t = token
+    .trim()
+    .replace(/:\d+(?:-\d+)?$/, "")
+    .replace(/[.,;:]+$/, "")
+    .replace(/^\.\//, "");
+  if (t === "" || /\s/.test(t) || t.startsWith("#") || /^[a-z][a-z0-9+.-]*:\/\//i.test(t))
+    return null;
+  if (!t.includes("/") && !/\.[A-Za-z][A-Za-z0-9]{0,5}$/.test(t)) return null;
+  return path.posix.normalize(t);
+}
+
+/** The repo paths a row names: backticked spans and bare words of its `remediation`, plus its `references`. */
+function namedPaths(row: Record<string, unknown>): string[] {
+  const texts = [
+    ...(typeof row["remediation"] === "string" ? [row["remediation"]] : []),
+    ...rowRefs(row),
+  ];
+  const tokens = texts.flatMap((t) => [
+    ...[...t.matchAll(/`([^`]+)`/g)].map((m) => m[1]!),
+    ...t.replace(/`[^`]*`/g, " ").split(/[\s,()[\]]+/),
+  ]);
+  return [
+    ...new Set(
+      tokens.map(pathToken).filter((p): p is string => p !== null && p !== "." && p !== ".."),
+    ),
+  ];
+}
+
+/** True when one of `paths` is a file in `root`. */
+function existsIn(root: string, paths: string[]): boolean {
+  return paths.some((p) => {
+    const abs = path.resolve(root, p);
+    const rel = path.relative(root, abs);
+    return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel) && fs.existsSync(abs);
+  });
+}
+
+/** True when `a` and `b` name the same path, or one sits inside the other. */
+const within = (a: string, b: string) => a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
+
+const NORMAL = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
+
+/** The items the plan's `Out of Scope` rows declare: their excluded item and every backticked token. */
+function declaredItems(rows: OutOfScopeRow[] | null): Set<string> {
+  const out = new Set<string>();
+  for (const row of rows ?? []) {
+    const item = row.cells[0] ?? "";
+    if (item !== "") out.add(NORMAL(item));
+    for (const cell of row.cells)
+      for (const m of cell.matchAll(/`([^`]+)`/g)) if (m[1]!.trim() !== "") out.add(NORMAL(m[1]!));
+  }
+  return out;
+}
+
+/**
+ * True when a reference other than the row's own key or the bare FID names a
+ * pre-existing declaration: a plan `Out of Scope` item, or a doc section declared
+ * out of scope. A row that is its own only declaration names none.
+ */
+function declares(
+  row: Record<string, unknown>,
+  fid: string,
+  issue: string,
+  declared: Set<string>,
+): boolean {
+  const own = typeof row["key"] === "string" ? NORMAL(row["key"]) : "";
+  const self = NORMAL(fid);
+  for (const ref of rowRefs(row)) {
+    const t = ref.trim();
+    if (t === "" || NORMAL(t) === own || NORMAL(t) === self || t === `#${issue}`) continue;
+    if (t.includes("§") && /out[- ]of[- ]scope|non-?goals?/i.test(t)) return true;
+    const n = NORMAL(t);
+    if (declared.has(n)) return true;
+    for (const d of declared) if (d.length >= 8 && n.includes(d)) return true;
+  }
+  return false;
+}
+
+/** The same-`key` row triage appends: every prior field verbatim, the verdict fields replaced. */
+export function unjustifiedRow(
+  row: Record<string, unknown>,
+  fid: string,
+  held: DeferralTest[],
+): Record<string, unknown> {
+  const out: Record<string, unknown> = {};
+  for (const [k, v] of Object.entries(row)) {
+    if (k === "schema" || k === "ts" || k === "bkit" || k === "by" || k === "description") continue;
+    out[k] = v;
+  }
+  out["kind"] = "deferral";
+  out["reason"] = UNJUSTIFIED_REASON;
+  out["status"] = "TRIAGED";
+  out["description"] =
+    `Adjudicated unjustified by bkit ledgers triage for ${fid}: every deferral test holds (${held.join(", ")}).`;
+  // The ship orchestrator's sweep step is the writer, so the row clears the kind's writer check.
+  out["by"] = { workflow: "ship", step: "ship-deferred-sweep" };
+  return out;
+}
+
+/**
+ * Bucket the FID's deferral rows by the four tests and append a same-`key`
+ * `unjustified` / `TRIAGED` row for each that holds all four. Throws
+ * CommandError(USAGE) on a missing `--plan`, EXIT_ROW_REFUSED when a computed row
+ * fails validation — nothing written.
+ */
+export function triageDeferrals(root: string, fid: string, planPath: string): TriageResult {
+  const abs = path.resolve(root, planPath);
+  if (!fs.existsSync(abs)) throw new CommandError(EXIT.USAGE, `--plan not found: ${planPath}`);
+  const text = fs.readFileSync(abs, "utf-8");
+  const surfaces = new Set<string>();
+  for (const task of parsePlanBlocks(text).tasks)
+    for (const ref of [...task.create, ...task.read, ...task.update, ...task.delete])
+      surfaces.add(path.posix.normalize(ref.file));
+  for (const row of reuseInventory(text)?.rows ?? []) for (const f of row.files) surfaces.add(f);
+  const scope = [...surfaces];
+  const declared = declaredItems(outOfScope(text));
+  const issue = fidIssue(fid);
+  const rows = featureDeferrals(
+    readLedgerRows(path.join(root, APPEND_LEDGERS.deferrals.file)),
+    fid,
+  );
+  const out: TriageRow[] = [];
+  const write: Array<Record<string, unknown>> = [];
+  for (const row of rows) {
+    const key = typeof row["key"] === "string" ? row["key"] : null;
+    // A LOW challenge finding holds without the tests, and an adjudicated row is never re-adjudicated.
+    if (
+      (row["reason"] === "low-severity" && row["severity"] === "LOW") ||
+      row["reason"] === UNJUSTIFIED_REASON
+    ) {
+      out.push({ key, bucket: "Exempt", tests: [], written: false });
+      continue;
+    }
+    const paths = namedPaths(row);
+    const verdicts: Record<DeferralTest, boolean> = {
+      "bounded-remediation": existsIn(root, paths),
+      "in-scope-surface": paths.some((p) => scope.some((s) => within(p, s))),
+      "no-external-blocker": row["reason"] !== "hard-blocked" && row["reason"] !== "needs-decision",
+      "own-declaration": !declares(row, fid, issue, declared),
+    };
+    const tests = DEFERRAL_TESTS.map((test) => ({ test, held: verdicts[test] }));
+    const lazy = tests.every((t) => t.held);
+    if (lazy)
+      write.push(
+        unjustifiedRow(
+          row,
+          fid,
+          tests.map((t) => t.test),
+        ),
+      );
+    out.push({ key, bucket: lazy ? "Lazy" : "Exempt", tests, written: lazy });
+  }
+  if (write.length > 0) appendLedgerRows(root, "deferrals", write);
+  return { fid, plan: planPath, rows: out, total: out.length, written: write.length };
+}
+
+function triage(ctx: RunContext): number {
+  const r = triageDeferrals(rootOf(ctx), required(ctx, "fid"), required(ctx, "plan"));
+  for (const row of r.rows) {
+    const verdict =
+      row.tests.length === 0
+        ? "not tested"
+        : row.tests.map((t) => `${t.test} ${t.held ? "holds" : "fails"}`).join(", ");
+    ctx.log(`${row.key ?? "(no key)"} — ${row.bucket}: ${verdict}`);
+  }
+  ctx.log(`${r.total} deferral row(s) for ${r.fid}, ${r.written} written unjustified`);
+  ctx.emit({ ...r });
+  return EXIT.OK;
+}
diff --git a/.bkit/core/engine/commands/workflow/plan-blocks.test.ts b/.bkit/core/engine/commands/workflow/plan-blocks.test.ts
index 4c688a7f9..db9fd0c54 100644
--- a/.bkit/core/engine/commands/workflow/plan-blocks.test.ts
+++ b/.bkit/core/engine/commands/workflow/plan-blocks.test.ts
@@ -3,7 +3,7 @@ import * as path from "node:path";
 
 import { describe, expect, it } from "vitest";
 
-import { derivedTestMatrix, parsePlanBlocks, reuseInventory } from "./plan-blocks";
+import { derivedTestMatrix, outOfScope, parsePlanBlocks, reuseInventory } from "./plan-blocks";
 
 const task = (n: number, body: string[] = [], tick = " ") => [
   `<!-- bkit:task ${n} start -->`,
@@ -372,6 +372,72 @@ describe("reuseInventory", () => {
   });
 });
 
+it("outOfScope returns the plan's Out of Scope rows", () => {
+  const text = [
+    "# Plan",
+    "",
+    "## Out of Scope",
+    "",
+    "| Excluded item | Why `Exempt` | Where it belongs |",
+    "| --- | --- | --- |",
+    "| Design reviewers | no measurements | `docs/deferrals.jsonl` key `701-design-reviewer-audit` |",
+    "| A second item | declared | stays in a prompt |",
+    "",
+    "## Next section",
+    "",
+    "| Not | A | Table |",
+    "| --- | --- | --- |",
+    "| x | y | z |",
+  ].join("\n");
+  expect(outOfScope(text)).toEqual([
+    {
+      line: "| Design reviewers | no measurements | `docs/deferrals.jsonl` key `701-design-reviewer-audit` |",
+      number: 7,
+      cells: [
+        "Design reviewers",
+        "no measurements",
+        "`docs/deferrals.jsonl` key `701-design-reviewer-audit`",
+      ],
+    },
+    {
+      line: "| A second item | declared | stays in a prompt |",
+      number: 8,
+      cells: ["A second item", "declared", "stays in a prompt"],
+    },
+  ]);
+});
+
+it("plan-blocks readers stop at the next heading of the same or a higher level", () => {
+  const later = [
+    "# Plan",
+    "",
+    "## Out of Scope",
+    "",
+    "None.",
+    "",
+    "## Another section",
+    "",
+    "| Excluded item | Why `Exempt` | Where it belongs |",
+    "| --- | --- | --- |",
+    "| a table under a later heading of the same level | x | y |",
+  ].join("\n");
+  expect(outOfScope(later)).toBeNull();
+  const lower = [
+    "# Plan",
+    "",
+    "## Out of Scope",
+    "",
+    "### Declared early",
+    "",
+    "| Excluded item | Why `Exempt` | Where it belongs |",
+    "| --- | --- | --- |",
+    "| a table under a lower heading of the section | x | y |",
+  ].join("\n");
+  expect(outOfScope(lower)?.map((r) => r.cells[0])).toEqual([
+    "a table under a lower heading of the section",
+  ]);
+});
+
 it("derivedTestMatrix returns a null column index when the header has no Task column", () => {
   const text = [
     "# Plan",
diff --git a/.bkit/core/engine/commands/workflow/plan-blocks.ts b/.bkit/core/engine/commands/workflow/plan-blocks.ts
index 49e142ee0..17fc3af5c 100644
--- a/.bkit/core/engine/commands/workflow/plan-blocks.ts
+++ b/.bkit/core/engine/commands/workflow/plan-blocks.ts
@@ -247,6 +247,27 @@ export function supersessionInventory(text: string): SupersessionRow[] | null {
   return rows;
 }
 
+/** One `Out of Scope` row: the line as written, its 1-based line, and its cells. */
+export interface OutOfScopeRow {
+  /** The row as written. */
+  line: string;
+  /** 1-based plan line. */
+  number: number;
+  /** The row's cells, in header order. */
+  cells: string[];
+}
+
+/** The plan's `Out of Scope` rows over `tableCells`; null when the plan has no such table. */
+export function outOfScope(text: string): OutOfScopeRow[] | null {
+  const lines = text.split(/\r?\n/);
+  const table = firstTable(lines, /^#{2,4} .*Out of Scope/i);
+  if (table === null) return null;
+  const rows: OutOfScopeRow[] = [];
+  for (let i = table.head + 2; i < lines.length && /^\s*\|/.test(lines[i]!); i++)
+    rows.push({ line: lines[i]!, number: i + 1, cells: tableCells(lines[i]!) });
+  return rows;
+}
+
 /** The error for a code fence opened at `line` and never closed. */
 export const fenceNeverClosed = (line: number) =>
   `the code fence at line ${line} is never closed; nothing after it is read`;
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
index 13c34dabb..d8c589feb 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
@@ -358,26 +358,30 @@ _No tracker connected, skip step._
 
 ## 🧠 Step 6 — Update Docs & Summary
 
-1. **Subagent:** Invoke `@bkit-ship-update-docs` using `Agent` tool:
+1. Write the FID's deferral lines to the artifact the docs agent reads `Pending Items` from:
+   ```bash
+   cd "{WORKTREE_PATH}" && "{BKIT}" context ledger-scan --terms="{FID}" --source=docs/deferrals.jsonl --artifact="{OUTBOX}/ship-pending-items.md" --fid={FID} --step=ship-update-docs --reset-log >/dev/null || exit 1
+   ```
+2. **Subagent:** Invoke `@bkit-ship-update-docs` using `Agent` tool:
    Context: You are a subagent in the Ship phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
-   Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`).
+   Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`), `{OUTBOX}/ship-pending-items.md`.
    Update: Doc files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md`.
-2. Wait for the subagent to complete, then append the `SHIPPED` row to the worktree ledger and re-render the mechanical `roadmap-status` board from it (exit 1 when the row did not land), and finish the step (bookkeeping to `$BOOK_ROOT`):
+3. Wait for the subagent to complete, then append the `SHIPPED` row to the worktree ledger and re-render the mechanical `roadmap-status` board from it (exit 1 when the row did not land), and finish the step (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
    "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none >/dev/null || exit 1
    ```
-3. Write `ship-summary.md` from this run's status rows and the PR's size:
+4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
    "{BKIT}" workflows summary --workflow=ship --file="{STATUS}" --pr={PR_NUMBER}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
-4. Finish (bookkeeping to `$BOOK_ROOT`):
+5. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --commit=none --number=6 --post --title="Update Docs & Summary" --link-ref=dev --comment-body
    ```
-5. Route:
+6. Route:
    - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 7.
    - **If** `SUMMARY_VERDICT` = FAIL → display `ship-summary.md` content verbatim as final message to user → **Failure Path**.
    - **Else** → **Failure Path**.
diff --git a/.bkit/core/prompts/bkit-ship-deferred-sweep.md b/.bkit/core/prompts/bkit-ship-deferred-sweep.md
index ea3fdcb95..0f8ebb510 100644
--- a/.bkit/core/prompts/bkit-ship-deferred-sweep.md
+++ b/.bkit/core/prompts/bkit-ship-deferred-sweep.md
@@ -67,9 +67,10 @@ autoCompactWindow: 300000
    - Any `Blocked` items → move to `Blocking Deferrals` and append test details with source evidence → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
    - Any leftover `Planned` items → mark items `Lazy` → move to `Lazy Deferrals` → append deferral rows to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom); check existing entries first; set `reason` to `unjustified`, set `status` to `TRIAGED`.
 8. Scan the run's diff for disabled tests with `bkit branches scan-diff --disabled-tests --base=` the diff base your Context names — its `disabled` list holds each hit's `file:line` and test name → **If** exit 1 → record every entry under `Blocking Deferrals` with source evidence (`file:line`, test name) → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
-9. Scan `docs/deferrals.jsonl` for any plan related entries including recently appended rows → verify each `reason` holds at ship time as per `.bkit/jsonl.md` deferral reason tests; `reason` = `low-severity` with `severity` = `LOW` holds without the tests:
-   - **If** holds → record under / move to `Exempt Deferrals` → continue; append no row, `reason` is set once and carried verbatim.
-   - **Else** → record under / keep under `Lazy Deferrals` → append row to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), same `key` and prior fields verbatim, set `reason` to `unjustified`, set `status` to `TRIAGED`, `description` naming failed deferral tests.
+9. Bucket the plan-related deferral rows of the FID in your Context with `bkit ledgers triage --fid=` the FID in your Context `--plan=` the plan file. The verb applies the deferral tests and writes every `unjustified` / `TRIAGED` row itself; each of its `rows` carries the row's `key`, its `bucket` and the test result:
+   - **If** `bucket` = `Exempt` → record under / move to `Exempt Deferrals`; the row stands as written.
+   - **Else** → record under / keep under `Lazy Deferrals`, naming the tests the verb reports for it.
+   - **If** the plan file is absent → nothing to test against; record each plan-related row under `Exempt Deferrals` naming the missing plan.
 10. Update **Create** — set `Failures` via `Edit` = `Blocking Deferrals` entry count; set `Lazy` via `Edit` = `Lazy Deferrals` entry count.
 11. Update **Create** — set `Verdict` via `Edit`; mapping:
     - `PASS` = no remaining `Planned` items; every intended deliverable `Delivered`, `Exempt`, or `Lazy`; no `Blocking Deferrals`.
diff --git a/.bkit/core/prompts/bkit-ship-update-docs.md b/.bkit/core/prompts/bkit-ship-update-docs.md
index 332d2a82e..a12d65c92 100644
--- a/.bkit/core/prompts/bkit-ship-update-docs.md
+++ b/.bkit/core/prompts/bkit-ship-update-docs.md
@@ -59,7 +59,7 @@ autoCompactWindow: 300000
 4. Per doc, always follow its `Rules` headers when making edits.
 5. Per doc, four passes in order: Sync content (gaps vs implementation) → reorganize structure (dedupe, move misplaced) → compress wording (more token-efficient) → update cross-references (inline `docs/*.md` links).
 6. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory.
-7. Grep `docs/deferrals.jsonl` for `{FID}` matches → surface in output `Pending Items` for human review (do not write `docs/deferrals.jsonl`).
+7. Fill `Pending Items` from the `ship-pending-items.md` deferral scan supplied in your Read paths, one entry per line (do not write `docs/deferrals.jsonl`).
 8. Produce **Create** output.
 
 **Output format:**
@@ -77,7 +77,7 @@ autoCompactWindow: 300000
 
 ## Pending Items
 
-[`{FID}` matches in `docs/deferrals.jsonl` for human review. **If** no matches → `None`.]
+[`{FID}` matches from the `ship-pending-items.md` deferral scan, for human review. **If** no matches → `None`.]
 
 ## Blockers
 
diff --git a/.bkit/core/workflows/bkit-ship.md b/.bkit/core/workflows/bkit-ship.md
index 1b2af821f..fa45f6d81 100644
--- a/.bkit/core/workflows/bkit-ship.md
+++ b/.bkit/core/workflows/bkit-ship.md
@@ -436,26 +436,30 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🧠 Step 6 — Update Docs & Summary
 
-1. **Subagent:** Invoke `@bkit-ship-update-docs` using `Agent` tool:
+1. Write the FID's deferral lines to the artifact the docs agent reads `Pending Items` from:
+   ```bash
+   cd "{WORKTREE_PATH}" && "{BKIT}" context ledger-scan --terms="{FID}" --source=docs/deferrals.jsonl --artifact="{OUTBOX}/ship-pending-items.md" --fid={FID} --step=ship-update-docs --reset-log >/dev/null || exit 1
+   ```
+2. **Subagent:** Invoke `@bkit-ship-update-docs` using `Agent` tool:
    Context: You are a subagent in the Ship phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
-   Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`).
+   Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`), `{OUTBOX}/ship-pending-items.md`.
    Update: Doc files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md`.
-2. Wait for the subagent to complete, then append the `SHIPPED` row to the worktree ledger and re-render the mechanical `roadmap-status` board from it (exit 1 when the row did not land), and finish the step (bookkeeping to `$BOOK_ROOT`):
+3. Wait for the subagent to complete, then append the `SHIPPED` row to the worktree ledger and re-render the mechanical `roadmap-status` board from it (exit 1 when the row did not land), and finish the step (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
    "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none >/dev/null || exit 1
    ```
-3. Write `ship-summary.md` from this run's status rows and the PR's size:
+4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
    "{BKIT}" workflows summary --workflow=ship --file="{STATUS}" --pr={PR_NUMBER}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
-4. Finish (bookkeeping to `$BOOK_ROOT`):
+5. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --commit=none --number=6 --post --title="Update Docs & Summary" --link-ref=dev --comment-body
    ```
-5. Route:
+6. Route:
    - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 7.
    - **If** `SUMMARY_VERDICT` = FAIL → display `ship-summary.md` content verbatim as final message to user<!-- bkit:tracker true start -->. Line 1 of the final message = the no-issue warning, when one was emitted.<!-- bkit:tracker true end --> → **Failure Path**.
    - **Else** → **Failure Path**.
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 633b5d4bb..74ce8e545 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -1129,7 +1129,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-annotations`, `bkit-audit-ci-performance`
 - drift:
-  - `bkit-ship:516`: "probe for a run at it first, dispatch only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per .bkit/workflows.md:1007) when no run is found; R63 says pushes auto-trigger CI, NEVER manually
+  - `bkit-ship:520`: "probe for a run at it first, dispatch only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per .bkit/workflows.md:1007) when no run is found; R63 says pushes auto-trigger CI, NEVER manually
     - kept: Re-validate probes for an existing run first and dispatches only when the head has none, which happens when the head commit carries `[skip ci]` or GitHub started no run
 
 ```text
@@ -1359,7 +1359,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-ci-performance`
 - drift:
-  - `bkit-ship:516`: "probe for a run at it first, dispatch only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per .bkit/workflows.md:1007) when no run is found; R63 says pushes auto-trigger CI, NEVER manually
+  - `bkit-ship:520`: "probe for a run at it first, dispatch only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per .bkit/workflows.md:1007) when no run is found; R63 says pushes auto-trigger CI, NEVER manually
     - kept: Re-validate probes for an existing run first and dispatches only when the head has none, which happens when the head commit carries `[skip ci]` or GitHub started no run
 
 ```text
@@ -7466,6 +7466,7 @@ Fast-forward to the PR head — never onto a diverged branch:
 Plan check:
 [fit `workflow-summary-route` 0.62; keep: routes on PASS alone, not PASS or CONCERNS] **If** `verdict` = PASS → Step 6.
 Worktree fast-forwarded
+Write the FID's deferral lines to the artifact the docs agent reads `Pending Items` from:
 Wait for the subagent to complete, then append the `SHIPPED` row to the worktree ledger and re-render the mechanical `roadmap-status` board from it (exit 1 when the row did not land), and finish the step (bookkeeping to `$BOOK_ROOT`):
 Write `ship-summary.md` from this run's status rows and the PR's size:
 Ledger row appended and roadmap board re-rendered
@@ -8100,9 +8101,10 @@ Per intended deliverable item under `Planned vs Delivered` → assert codebase s
 [R12] **If** deliverable itself absent, stub only, or produces wrong observable result, shown by named files, symbols, or failing tests and never inferred from plan sentences → mark item `Blocked`.
 [R72] **If** guards removed / weakened (auth, validation, data-loss, secret handling), or paths known to be broken → mark item `Blocked`.
 **If** shipped surfaces instruct consumers to run something that fails at runtime → mark item `Blocked`.
-[R04; R41] Scan `docs/deferrals.jsonl` for any plan related entries including recently appended rows → verify each `reason` holds at ship time as per `.bkit/jsonl.md` deferral reason tests; `reason` = `low-severity` with `severity` = `LOW` holds without the tests:
-**If** holds → record under / move to `Exempt Deferrals` → continue; append no row, `reason` is set once and carried verbatim.
-[R41] **Else** → record under / keep under `Lazy Deferrals` → append row to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), same `key` and prior fields verbatim, set `reason` to `unjustified`, set `status` to `TRIAGED`, `description` naming failed deferral tests.
+[R04; R41] Bucket the plan-related deferral rows of the FID in your Context with `bkit ledgers triage --fid=` the FID in your Context `--plan=` the plan file. The verb applies the deferral tests and writes every `unjustified` / `TRIAGED` row itself; each of its `rows` carries the row's `key`, its `bucket` and the test result:
+**If** `bucket` = `Exempt` → record under / move to `Exempt Deferrals`; the row stands as written.
+[R41] **Else** → record under / keep under `Lazy Deferrals`, naming the tests the verb reports for it.
+**If** the plan file is absent → nothing to test against; record each plan-related row under `Exempt Deferrals` naming the missing plan.
 Update **Create** — set `Failures` via `Edit` = `Blocking Deferrals` entry count; set `Lazy` via `Edit` = `Lazy Deferrals` entry count.
 `PASS` = no remaining `Planned` items; every intended deliverable `Delivered`, `Exempt`, or `Lazy`; no `Blocking Deferrals`.
 `FAIL` = any intended deliverables `Blocked`; any test the run's diff disabled; any `Blocking Deferrals`.
@@ -8117,7 +8119,7 @@ Scan plan `Acceptance Scenario` sections and `DONE WHEN` lines for intended deli
 **Role:** Senior tech writer syncing project docs with state shipped this cycle.
 **Exceptions:** Do not update `docs/knowledge.jsonl`, `docs/decisions.jsonl`.
 [R68] Run `git rev-parse --is-shallow-repository`; **If** `true` → name the boundary commit in output, older history unread. Run `git log --oneline --stat origin/dev..HEAD` for shipped files this cycle.
-[R41] Grep `docs/deferrals.jsonl` for `{FID}` matches → surface in output `Pending Items` for human review (do not write `docs/deferrals.jsonl`).
+[R41] Fill `Pending Items` from the `ship-pending-items.md` deferral scan supplied in your Read paths, one entry per line (do not write `docs/deferrals.jsonl`).
 ```
 
 #### bkit-utility-compress-markdown
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index a812344c3..65931843c 100644
--- a/dist/commands/workflow/ledgers.js
+++ b/dist/commands/workflow/ledgers.js
@@ -12,9 +12,10 @@ import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
 import { readBkitVersion } from "../../install/version-file.js";
-import { APPEND_LEDGERS, SCHEMA, gitEnv, parse, mintTs, resolveRepoSlug, validate, writerProblem, } from "../../ledgers/telemetry.js";
+import { APPEND_LEDGERS, SCHEMA, UNJUSTIFIED_REASON, gitEnv, parse, mintTs, resolveRepoSlug, validate, writerProblem, } from "../../ledgers/telemetry.js";
 import { CommandError, EXIT, isIgnoredPath, isSharedBranch, parseJson, } from "../lib.js";
 import { str } from "./status.js";
+import { outOfScope, parsePlanBlocks, reuseInventory } from "./plan-blocks.js";
 /** Root is not a directory or repo, git is too old, or a ref does not resolve. */
 export const EXIT_ROOT = 3;
 /** `git add` / `git add -u` / mkdir / copy failed. */
@@ -644,6 +645,30 @@ export const ledgersCommand = {
             },
             run: (ctx) => append(ctx),
         },
+        triage: {
+            summary: "Bucket each deferral row the FID declared by the four Deferral Reason tests, and write the unjustified ones.",
+            flags: [
+                { name: "root", type: "string", help: "checkout whose deferrals to read (default: cwd)" },
+                FID_FLAG,
+                {
+                    name: "plan",
+                    type: "string",
+                    required: true,
+                    help: "plan file whose task surfaces and Out of Scope rows the four tests read",
+                },
+            ],
+            output: {
+                fid: "the feature id triaged",
+                plan: "the plan the tests were read from",
+                rows: "each matched deferral's key, bucket (Exempt | Lazy), test results and whether a row was written",
+                total: "deferral rows the FID matched",
+                written: "unjustified rows appended",
+            },
+            exitCodes: {
+                [EXIT_ROW_REFUSED]: "a computed unjustified row fails validation or its writer check — nothing written",
+            },
+            run: (ctx) => triage(ctx),
+        },
         check: {
             summary: "Check that every decision / deferral key on a plan's `**Ledger rows:**` line is on disk.",
             flags: [
@@ -1232,3 +1257,220 @@ function onlyBookkeeping(ctx) {
             return EXIT.OK;
     }
 }
+// ---------------------------------------------------------------------------
+// triage — the sweep's deferral tests, computed
+// ---------------------------------------------------------------------------
+//
+// `.bkit/jsonl.md` § Deferral Reason states the four tests: each names a way a
+// deferral reads as in-scope work that should have been finished, and all four
+// holding marks the row `unjustified`. The engine decides them from the row, its
+// own `references`, the plan's task surfaces, its Reuse Inventory and its
+// Out of Scope table. The sweep keeps the judgement the four cannot reach.
+/** The four tests, in `.bkit/jsonl.md` order; each holds when the row reads as in-scope work. */
+export const DEFERRAL_TESTS = [
+    "bounded-remediation",
+    "in-scope-surface",
+    "no-external-blocker",
+    "own-declaration",
+];
+/** The issue number a FID leads with (`701-engine-work` → `701`), else "". */
+const fidIssue = (fid) => /^(\d+)(?=$|[-_])/.exec(fid)?.[1] ?? "";
+/** A row's `references` entries, as written. */
+const rowRefs = (row) => Array.isArray(row["references"])
+    ? row["references"].filter((x) => typeof x === "string")
+    : [];
+/** True when `ref` names the feature: the FID, or its leading issue number as `N` / `#N`. */
+const namesFeature = (ref, fid, issue) => ref.includes(fid) || (issue !== "" && new RegExp(`^#?${issue}(?![0-9])`).test(ref));
+/** Every well-formed row of a JSONL ledger, as written. */
+function readLedgerRows(file) {
+    if (!fs.existsSync(file))
+        return [];
+    return fs
+        .readFileSync(file, "utf-8")
+        .split("\n")
+        .flatMap((line) => {
+        if (line.trim() === "")
+            return [];
+        const parsed = parseJson(line);
+        const v = parsed.ok ? parsed.value : null;
+        return typeof v === "object" && v !== null && !Array.isArray(v)
+            ? [v]
+            : [];
+    });
+}
+/** The deferral rows `fid` declared, same-`key` folded last-wins, in first-seen order. */
+export function featureDeferrals(rows, fid) {
+    const issue = fidIssue(fid);
+    const kept = [];
+    const at = new Map();
+    for (const row of rows) {
+        if (row["kind"] !== "deferral")
+            continue;
+        const key = typeof row["key"] === "string" ? row["key"] : "";
+        const named = key !== "" && namesFeature(key, fid, issue);
+        if (!named && !rowRefs(row).some((r) => namesFeature(r, fid, issue)))
+            continue;
+        const seen = key === "" ? undefined : at.get(key);
+        if (seen !== undefined) {
+            kept[seen] = row;
+            continue;
+        }
+        if (key !== "")
+            at.set(key, kept.length);
+        kept.push(row);
+    }
+    return kept;
+}
+/** A repo path a token names, with any `:line` suffix cut; null when the token is no path. */
+function pathToken(token) {
+    const t = token
+        .trim()
+        .replace(/:\d+(?:-\d+)?$/, "")
+        .replace(/[.,;:]+$/, "")
+        .replace(/^\.\//, "");
+    if (t === "" || /\s/.test(t) || t.startsWith("#") || /^[a-z][a-z0-9+.-]*:\/\//i.test(t))
+        return null;
+    if (!t.includes("/") && !/\.[A-Za-z][A-Za-z0-9]{0,5}$/.test(t))
+        return null;
+    return path.posix.normalize(t);
+}
+/** The repo paths a row names: backticked spans and bare words of its `remediation`, plus its `references`. */
+function namedPaths(row) {
+    const texts = [
+        ...(typeof row["remediation"] === "string" ? [row["remediation"]] : []),
+        ...rowRefs(row),
+    ];
+    const tokens = texts.flatMap((t) => [
+        ...[...t.matchAll(/`([^`]+)`/g)].map((m) => m[1]),
+        ...t.replace(/`[^`]*`/g, " ").split(/[\s,()[\]]+/),
+    ]);
+    return [
+        ...new Set(tokens.map(pathToken).filter((p) => p !== null && p !== "." && p !== "..")),
+    ];
+}
+/** True when one of `paths` is a file in `root`. */
+function existsIn(root, paths) {
+    return paths.some((p) => {
+        const abs = path.resolve(root, p);
+        const rel = path.relative(root, abs);
+        return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel) && fs.existsSync(abs);
+    });
+}
+/** True when `a` and `b` name the same path, or one sits inside the other. */
+const within = (a, b) => a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
+const NORMAL = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();
+/** The items the plan's `Out of Scope` rows declare: their excluded item and every backticked token. */
+function declaredItems(rows) {
+    const out = new Set();
+    for (const row of rows ?? []) {
+        const item = row.cells[0] ?? "";
+        if (item !== "")
+            out.add(NORMAL(item));
+        for (const cell of row.cells)
+            for (const m of cell.matchAll(/`([^`]+)`/g))
+                if (m[1].trim() !== "")
+                    out.add(NORMAL(m[1]));
+    }
+    return out;
+}
+/**
+ * True when a reference other than the row's own key or the bare FID names a
+ * pre-existing declaration: a plan `Out of Scope` item, or a doc section declared
+ * out of scope. A row that is its own only declaration names none.
+ */
+function declares(row, fid, issue, declared) {
+    const own = typeof row["key"] === "string" ? NORMAL(row["key"]) : "";
+    const self = NORMAL(fid);
+    for (const ref of rowRefs(row)) {
+        const t = ref.trim();
+        if (t === "" || NORMAL(t) === own || NORMAL(t) === self || t === `#${issue}`)
+            continue;
+        if (t.includes("§") && /out[- ]of[- ]scope|non-?goals?/i.test(t))
+            return true;
+        const n = NORMAL(t);
+        if (declared.has(n))
+            return true;
+        for (const d of declared)
+            if (d.length >= 8 && n.includes(d))
+                return true;
+    }
+    return false;
+}
+/** The same-`key` row triage appends: every prior field verbatim, the verdict fields replaced. */
+export function unjustifiedRow(row, fid, held) {
+    const out = {};
+    for (const [k, v] of Object.entries(row)) {
+        if (k === "schema" || k === "ts" || k === "bkit" || k === "by" || k === "description")
+            continue;
+        out[k] = v;
+    }
+    out["kind"] = "deferral";
+    out["reason"] = UNJUSTIFIED_REASON;
+    out["status"] = "TRIAGED";
+    out["description"] =
+        `Adjudicated unjustified by bkit ledgers triage for ${fid}: every deferral test holds (${held.join(", ")}).`;
+    // The ship orchestrator's sweep step is the writer, so the row clears the kind's writer check.
+    out["by"] = { workflow: "ship", step: "ship-deferred-sweep" };
+    return out;
+}
+/**
+ * Bucket the FID's deferral rows by the four tests and append a same-`key`
+ * `unjustified` / `TRIAGED` row for each that holds all four. Throws
+ * CommandError(USAGE) on a missing `--plan`, EXIT_ROW_REFUSED when a computed row
+ * fails validation — nothing written.
+ */
+export function triageDeferrals(root, fid, planPath) {
+    const abs = path.resolve(root, planPath);
+    if (!fs.existsSync(abs))
+        throw new CommandError(EXIT.USAGE, `--plan not found: ${planPath}`);
+    const text = fs.readFileSync(abs, "utf-8");
+    const surfaces = new Set();
+    for (const task of parsePlanBlocks(text).tasks)
+        for (const ref of [...task.create, ...task.read, ...task.update, ...task.delete])
+            surfaces.add(path.posix.normalize(ref.file));
+    for (const row of reuseInventory(text)?.rows ?? [])
+        for (const f of row.files)
+            surfaces.add(f);
+    const scope = [...surfaces];
+    const declared = declaredItems(outOfScope(text));
+    const issue = fidIssue(fid);
+    const rows = featureDeferrals(readLedgerRows(path.join(root, APPEND_LEDGERS.deferrals.file)), fid);
+    const out = [];
+    const write = [];
+    for (const row of rows) {
+        const key = typeof row["key"] === "string" ? row["key"] : null;
+        // A LOW challenge finding holds without the tests, and an adjudicated row is never re-adjudicated.
+        if ((row["reason"] === "low-severity" && row["severity"] === "LOW") ||
+            row["reason"] === UNJUSTIFIED_REASON) {
+            out.push({ key, bucket: "Exempt", tests: [], written: false });
+            continue;
+        }
+        const paths = namedPaths(row);
+        const verdicts = {
+            "bounded-remediation": existsIn(root, paths),
+            "in-scope-surface": paths.some((p) => scope.some((s) => within(p, s))),
+            "no-external-blocker": row["reason"] !== "hard-blocked" && row["reason"] !== "needs-decision",
+            "own-declaration": !declares(row, fid, issue, declared),
+        };
+        const tests = DEFERRAL_TESTS.map((test) => ({ test, held: verdicts[test] }));
+        const lazy = tests.every((t) => t.held);
+        if (lazy)
+            write.push(unjustifiedRow(row, fid, tests.map((t) => t.test)));
+        out.push({ key, bucket: lazy ? "Lazy" : "Exempt", tests, written: lazy });
+    }
+    if (write.length > 0)
+        appendLedgerRows(root, "deferrals", write);
+    return { fid, plan: planPath, rows: out, total: out.length, written: write.length };
+}
+function triage(ctx) {
+    const r = triageDeferrals(rootOf(ctx), required(ctx, "fid"), required(ctx, "plan"));
+    for (const row of r.rows) {
+        const verdict = row.tests.length === 0
+            ? "not tested"
+            : row.tests.map((t) => `${t.test} ${t.held ? "holds" : "fails"}`).join(", ");
+        ctx.log(`${row.key ?? "(no key)"} — ${row.bucket}: ${verdict}`);
+    }
+    ctx.log(`${r.total} deferral row(s) for ${r.fid}, ${r.written} written unjustified`);
+    ctx.emit({ ...r });
+    return EXIT.OK;
+}
diff --git a/dist/commands/workflow/plan-blocks.js b/dist/commands/workflow/plan-blocks.js
index 5aa32b6e9..c02fd7f8b 100644
--- a/dist/commands/workflow/plan-blocks.js
+++ b/dist/commands/workflow/plan-blocks.js
@@ -118,6 +118,17 @@ export function supersessionInventory(text) {
     }
     return rows;
 }
+/** The plan's `Out of Scope` rows over `tableCells`; null when the plan has no such table. */
+export function outOfScope(text) {
+    const lines = text.split(/\r?\n/);
+    const table = firstTable(lines, /^#{2,4} .*Out of Scope/i);
+    if (table === null)
+        return null;
+    const rows = [];
+    for (let i = table.head + 2; i < lines.length && /^\s*\|/.test(lines[i]); i++)
+        rows.push({ line: lines[i], number: i + 1, cells: tableCells(lines[i]) });
+    return rows;
+}
 /** The error for a code fence opened at `line` and never closed. */
 export const fenceNeverClosed = (line) => `the code fence at line ${line} is never closed; nothing after it is read`;
 /** The fields a task writes at most once; CREATE / READ / UPDATE / DELETE repeat, one line per ref. */
