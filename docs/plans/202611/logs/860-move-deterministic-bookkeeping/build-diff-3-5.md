diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index eff0dc17d..4fe638441 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -208,7 +208,7 @@ Tracker payloads (issue text, label transitions, comments); --post / --write sen
 | `related` | workflow | **`--hits-file`** **`--out`** `--top` `--fid` `--issue` | Fetch each hit of the orchestrator's related-issue search and write the related-issues file. |
 | `blocked-by` | by hand | `--fid` `--issue` | The issues blocking the run's issue, with their states and the ones still open. |
 | `labels` | workflow | `--label` `--phase` `--failed` `--board` `--issue` `--owner-repo` `--write` `--fid` | Label arithmetic for a transition, the tracker state, and the board payload. |
-| `comment` | workflow | `--kind` `--purpose` `--audit-slug` `--step-number` `--step-title` `--workflow` `--workflow-heading` `--verdict` `--failures` `--scope` `--group` `--group-count` `--attempt` `--strategy` `--field` `--owner-repo` `--tree` `--pr-number` `--pr-url` `--run-id` `--artifact` `--ref` `--line` `--body-file` `--section` `--sub-step` `--error` `--error-file` `--stderr-file` `--post` `--session-dir` `--fid` `--issue` `--file` | The exact body of a ###### bkit:generated step, failure, handover, or audit comment. |
+| `comment` | workflow | `--kind` `--purpose` `--audit-slug` `--result-file` `--step-number` `--step-title` `--workflow` `--workflow-heading` `--verdict` `--failures` `--scope` `--group` `--group-count` `--attempt` `--strategy` `--field` `--owner-repo` `--tree` `--pr-number` `--pr-url` `--run-id` `--artifact` `--ref` `--line` `--body-file` `--section` `--sub-step` `--error` `--error-file` `--stderr-file` `--post` `--session-dir` `--fid` `--issue` `--file` | The exact body of a ###### bkit:generated step, failure, handover, or audit comment. |
 
 ### `ledgers`
 
@@ -220,7 +220,7 @@ Stage and commit bookkeeping by allow-list; union ledgers; check a range is book
 | `commit` | workflow | `--root` **`--month`** **`--fid`** `--scope` **`--mode`** `--stage-tracked-updates` `--path` `--squash-of` `--only-if-dirty-tracked` `--message` | Stage (and commit) the bookkeeping allow-list for one feature. |
 | `union` | workflow | **`--src`** **`--dst`** | Append a worktree's new ledger rows into another checkout (never .bkit/issues.jsonl). |
 | `only-bookkeeping` | by hand | `--root` **`--month`** **`--fid`** **`--from`** **`--to`** | Exit 0 when every path changed in from..to is on the --scope=pr allow-list. |
-| `append` | by hand | `--root` **`--ledger`** **`--rows`** `--invocation` | Append validated rows to one ledger, minting each row's ts at append time. |
+| `append` | by hand | `--root` **`--ledger`** **`--rows`** `--invocation` `--operation` `--issue-operation` | Append validated rows to one ledger, minting each row's ts at append time. |
 | `query` | by hand | `--root` **`--ledger`** `--key` `--status` `--limit` `--cursor` | Read one ledger's canonical winners (filtered after the fold), paged, with line diagnostics and coverage. Writes nothing. |
 | `triage` | workflow | `--root` **`--fid`** **`--plan`** | Bucket each deferral row the FID declared by the four Deferral Reason tests, and write the unjustified ones. |
 | `check` | by hand | `--root` **`--plan`** | Check that every decision / deferral key on a plan's `**Ledger rows:**` line is on disk. |
@@ -352,9 +352,9 @@ Write a step's status row, finish a step in one call, read a verdict header, che
 | --- | --- | --- | --- |
 | `done` | workflow | **`--file`** **`--workflow`** **`--step`** `--status` `--verdict` `--agent` `--allowed` `--failures` `--attempt` `--group` `--strategy` `--artifact` `--field` `--parent-sha` `--commit` `--message` | Append a step-done row and commit it (parentSha captured first). |
 | `finish` | workflow | **`--file`** **`--workflow`** **`--step`** `--artifact` `--optional-artifact` `--agent` `--verdict` `--allowed` `--failures` `--attempt` `--attempt-of` `--count-field` `--group` `--strategy` `--scope` `--field` `--clamp-log` `--docs-only` `--plan` `--parent-sha` `--commit` `--message` `--done-fallback` `--verbose-ci-local` `--number` `--title` `--post` `--group-count` `--link-ref` `--tree` `--owner-repo` `--comment-body` `--comment-field` | End a step: read the verdict header(s), derive the attempt, check the gate, write the row, commit, print the tracker comment. |
-| `verdict` | by hand | **`--file`** `--agent` `--allowed` `--field` | Read an artifact's header down to <!-- verdict:end -->. |
+| `verdict` | by hand | **`--file`** `--agent` `--allowed` `--field` `--result-file` | Read an artifact's header down to <!-- verdict:end -->. |
 | `gate` | workflow | `--file` `--ref` **`--workflow`** **`--step`** `--group` `--progress-number` `--attempt` `--attempt-of` `--artifact` `--verdict-required` `--agent` `--allowed` `--placeholder` `--fid` `--issue` `--month` `--token` | Mechanical gate checks for one step: placeholders, FID, lock, artifacts, verdict, status row (with its attempt / strategy / scope where the step writes them). |
-| `stub` | workflow | **`--from`** **`--to`** `--strip-header` | Seed a versioned artifact: copy the prior version, then put a PENDING verdict header on top. |
+| `stub` | workflow | `--from` **`--to`** `--agent` `--result-file` `--strip-header` | Seed a versioned artifact: copy the prior version, then put a PENDING verdict header on top. |
 
 ### `tasks`
 
diff --git a/.bkit/core/.bkit/jsonl.md b/.bkit/core/.bkit/jsonl.md
index fff86bb0d..5b2436fe5 100644
--- a/.bkit/core/.bkit/jsonl.md
+++ b/.bkit/core/.bkit/jsonl.md
@@ -59,7 +59,7 @@ for name in ["decisions", "knowledge"]:
 
 ## Write Idiom
 
-**Engine and workflow writers:** `bkit ledgers append --ledger=<decisions|deferrals|failures|knowledge|friction|stats> --rows=<file|->`. The rows are a JSON array without `schema` / `ts` / `bkit`.
+**Engine and workflow writers:** `bkit ledgers append --ledger=<decisions|deferrals|failures|knowledge|friction|stats> --rows=<file|->`. The rows are a JSON array without `schema` / `ts` / `bkit`. Add `--operation=<id>` to name the request: the same id with the same rows returns the original `receipt` (`offset`, `bytes`, each row's `key` and `ts`, `replayed: true`) and writes nothing, the same id with other rows is refused, and a new id on an existing `key` is a deliberate later update with its own lineage. A lost response is retried with the same id; an append that left a partial write exits non-zero as uncertain and truncates nothing. Every append, compact and union holds the ledger's `<file>.bkit-lock`; a lock that does not release is reported, never reclaimed.
 
 - **Fills:** `schema: 3`, a minted `ts` per row, `repo` when absent, and `bkit.version` from `.bkit/version`. On `deferral` / `failure` / `knowledge` / `decision` rows, it also fills `firstTs` and `updates` from the entry's earlier rows (§ Compaction), replacing any supplied values.
 - **Checks** every row before writing any: validation, and the author against § Ledgers & Writers. One refused row → exit 8, and nothing is written.
diff --git a/.bkit/core/engine/commands/workflow/branches.ts b/.bkit/core/engine/commands/workflow/branches.ts
index 3dfa188ee..e52f2fdfd 100644
--- a/.bkit/core/engine/commands/workflow/branches.ts
+++ b/.bkit/core/engine/commands/workflow/branches.ts
@@ -19,7 +19,13 @@ import * as os from "node:os";
 import * as path from "node:path";
 
 import { gitEnv } from "../../ledgers/telemetry.js";
-import { actionHash, actionKey, alreadyDone, recordAction } from "../../ledgers/status.js";
+import {
+  actionHash,
+  actionKey,
+  alreadyDone,
+  recordAction,
+  withTargetLock,
+} from "../../ledgers/status.js";
 import {
   bodySkipToken,
   classifyLockExit,
@@ -2563,13 +2569,16 @@ function restoreBranchRows(dir: string, branch: string): void {
   for (const p of changed) {
     const before = new Set(revLines(dir, base, p));
     const file = path.join(dir, p);
-    const text = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
-    const have = new Set(text.split("\n").map((l) => l.trim()));
-    const missing = revLines(dir, branch, p).filter((l) => !before.has(l) && !have.has(l));
-    if (missing.length === 0) continue;
-    const sep = text !== "" && !text.endsWith("\n") ? "\n" : "";
-    fs.mkdirSync(path.dirname(file), { recursive: true });
-    fs.appendFileSync(file, `${sep}${missing.join("\n")}\n`);
+    const wrote = withTargetLock(file, () => {
+      const text = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
+      const have = new Set(text.split("\n").map((l) => l.trim()));
+      const missing = revLines(dir, branch, p).filter((l) => !before.has(l) && !have.has(l));
+      if (missing.length === 0) return false;
+      const sep = text !== "" && !text.endsWith("\n") ? "\n" : "";
+      fs.appendFileSync(file, `${sep}${missing.join("\n")}\n`);
+      return true;
+    });
+    if (!wrote) continue;
     runGit(dir, ["add", "--", p]);
   }
 }
diff --git a/.bkit/core/engine/commands/workflow/challenge.test.ts b/.bkit/core/engine/commands/workflow/challenge.test.ts
index 024b0b756..867fc1ae9 100644
--- a/.bkit/core/engine/commands/workflow/challenge.test.ts
+++ b/.bkit/core/engine/commands/workflow/challenge.test.ts
@@ -6,7 +6,16 @@ import * as path from "node:path";
 import { afterEach, beforeEach, describe, expect, it } from "vitest";
 
 import { runCommand } from "../lib";
-import { acceptedLocations, CHALLENGE_SMALL, challengeCommand, challengeGate } from "./challenge";
+import {
+  acceptedLocations,
+  CHALLENGE_SMALL,
+  challengeCommand,
+  challengeGate,
+  mergeFindings,
+  parseFindings,
+  renderFindingsLog,
+  structuredFindings,
+} from "./challenge";
 import { derivedTestMatrix, parsePlanBlocks } from "./plan-blocks";
 import { checkPlanText, readTestFirst } from "./tests";
 
@@ -728,6 +737,67 @@ describe("bkit challenge merge", () => {
   });
 });
 
+describe("structured challenge findings", () => {
+  const input = [
+    {
+      severity: "HIGH",
+      cls: "architectural",
+      fixable: false,
+      location: "src/a.ts:10",
+      title: "Parser drops the last line",
+      doneWhen: "the parser keeps the last line",
+      tests: ["`src/a.test.ts` `keeps the last line` fails on a dropped final line."],
+    },
+    {
+      severity: "MEDIUM",
+      fixable: true,
+      location: `${"/"}src/b.ts:3`,
+      title: "Retry never backs off",
+      doneWhen: "retries back off",
+      tests: [],
+    },
+  ];
+
+  it("reuses structured challenge findings without losing semantic inputs", () => {
+    const found = structuredFindings(
+      input.map((f) => ({ ...f, location: f.location.replace(/^\//, `${cwd}/`) })),
+      cwd,
+    );
+    // Severity, class, fixable, evidence entries and location normalisation all survive.
+    expect(found).toEqual([
+      { ...input[0], location: "src/a.ts:10" },
+      {
+        severity: "MEDIUM",
+        fixable: true,
+        location: "src/b.ts:3",
+        title: input[1]!.title,
+        doneWhen: "retries back off",
+        tests: [],
+      },
+    ]);
+
+    // The structured path and the report parser agree on the same findings.
+    const text = `Verdict: FAIL\nFailures: 2\n\n<!-- verdict:end -->\n\n# Build Challenge\n\n${renderFindingsLog(found)}\n`;
+    expect(parseFindings(text, "r.md", cwd)).toEqual(found);
+
+    // The existing merge keeps the worse severity and ANDs fixability over structured findings.
+    const merged = mergeFindings(
+      [found, [{ ...found[1]!, severity: "HIGH", fixable: false }]],
+      new Set(),
+    );
+    expect(merged.findings.find((f) => f.location === "src/b.ts:3")).toMatchObject({
+      severity: "HIGH",
+      fixable: false,
+    });
+
+    // A missing judgment is refused rather than defaulted.
+    for (const drop of ["severity", "fixable", "location", "doneWhen"]) {
+      const broken = { ...input[0]!, [drop]: undefined };
+      expect(() => structuredFindings([broken], cwd)).toThrow(new RegExp(drop, "i"));
+    }
+  });
+});
+
 describe("bkit challenge gate", () => {
   const stat = (linesChanged: number, filesChanged: number) => ({
     linesChanged,
diff --git a/.bkit/core/engine/commands/workflow/challenge.ts b/.bkit/core/engine/commands/workflow/challenge.ts
index e090495f8..fe927c209 100644
--- a/.bkit/core/engine/commands/workflow/challenge.ts
+++ b/.bkit/core/engine/commands/workflow/challenge.ts
@@ -255,6 +255,50 @@ const taskBlock = (n: number, f: Finding, round: number) => [
   `<!-- bkit:task ${n} end -->`,
 ];
 
+/**
+ * Findings given as structured data (a step result file), checked by the rules
+ * {@link parseFindings} applies to a written report. Severity, fixable, location and
+ * done-when are the reviewer's judgments: a missing one is refused, never defaulted.
+ * Throws a CommandError (EXIT_OLD_FORMAT) naming the finding and field.
+ */
+export function structuredFindings(input: unknown, cwd: string): Finding[] {
+  if (!Array.isArray(input)) throw new CommandError(EXIT_OLD_FORMAT, "findings must be an array");
+  return input.map((raw, i) => {
+    const refuse = (why: string) => new CommandError(EXIT_OLD_FORMAT, `finding ${i + 1} ${why}`);
+    if (raw === null || typeof raw !== "object" || Array.isArray(raw))
+      throw refuse("is not an object");
+    const f = raw as Record<string, unknown>;
+    if (!SEVERITY_ORDER.includes(f["severity"] as Severity))
+      throw refuse("has no severity CRITICAL|HIGH|MEDIUM|LOW");
+    if (typeof f["fixable"] !== "boolean") throw refuse("has no fixable true|false");
+    const location = normalizeLocation(typeof f["location"] === "string" ? f["location"] : "", cwd);
+    if (location === null) throw refuse("has no location path:line");
+    if (typeof f["doneWhen"] !== "string" || f["doneWhen"].trim() === "")
+      throw refuse("has no doneWhen");
+    const tests = f["tests"] ?? [];
+    if (!Array.isArray(tests) || tests.some((t) => typeof t !== "string"))
+      throw refuse("has tests that are not an array of strings");
+    if (f["cls"] !== undefined && typeof f["cls"] !== "string") throw refuse("has a non-text cls");
+    const title = typeof f["title"] === "string" && f["title"] !== "" ? f["title"] : "";
+    return {
+      severity: f["severity"] as Severity,
+      ...(typeof f["cls"] === "string" && f["cls"] !== "" ? { cls: f["cls"] } : {}),
+      fixable: f["fixable"],
+      location,
+      title: title || `Challenge finding at ${location}`,
+      doneWhen: f["doneWhen"],
+      tests: tests as string[],
+    };
+  });
+}
+
+/** The `## Findings Log` section for `findings`, in the task-block form {@link parseFindings} reads. */
+export function renderFindingsLog(findings: Finding[], round = 1): string {
+  return ["## Findings Log", "", ...findings.flatMap((f, i) => [...taskBlock(i + 1, f, round), ""])]
+    .join("\n")
+    .replace(/\n+$/, "");
+}
+
 /** The test tier `docs/testing.md` records for a test file's name. */
 const testTier = (file: string) =>
   /\.integration\.test\./.test(file)
diff --git a/.bkit/core/engine/commands/workflow/issues.test.ts b/.bkit/core/engine/commands/workflow/issues.test.ts
index 4c8cbb940..03721d426 100644
--- a/.bkit/core/engine/commands/workflow/issues.test.ts
+++ b/.bkit/core/engine/commands/workflow/issues.test.ts
@@ -844,6 +844,82 @@ describe("bkit issues comment --post", () => {
     expect(sent).toHaveLength(1);
   });
 
+  it("renders audit comments from validated result and preserves tracker adapters", async () => {
+    const AUDIT = ["issues", "comment", "--kind=audit", "--audit-slug=security"];
+    const result = {
+      slug: "security",
+      status: "COMPLETE",
+      report: "docs/audits/202610/security.md",
+      findings: [
+        { severity: "HIGH", title: "Token logged", location: "src/a.ts:10" },
+        { severity: "LOW", title: "Verbose error", location: "src/b.ts:2" },
+        { severity: "LOW", title: "Old cipher", location: "src/c.ts:7" },
+      ],
+      notChecked: [],
+    };
+    const cwd = dir({ tracker: { default: "none" } });
+    write(cwd, "a.md", "## Overview\n\nAll clear.\n");
+    write(cwd, "r.json", JSON.stringify(result));
+
+    // The result renders the very comment the hand-written flags render: same counts, same link.
+    const manual = await run(cwd, [
+      ...AUDIT,
+      "--field=Status=COMPLETE",
+      "--field=Findings=CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 2",
+      "--line=Report: docs/audits/202610/security.md",
+      "--body-file=a.md",
+    ]);
+    const derived = await run(cwd, [...AUDIT, "--result-file=r.json", "--body-file=a.md"]);
+    expect(derived.code).toBe(0);
+    expect(derived.json.comment).toBe(manual.json.comment);
+
+    // A hand-written count beside the result could disagree with it, so it is refused.
+    const conflicting = await run(cwd, [
+      ...AUDIT,
+      "--result-file=r.json",
+      "--field=Findings=CRITICAL 9 · HIGH 9 · MEDIUM 9 · LOW 9",
+    ]);
+    expect(conflicting.code).not.toBe(0);
+    expect(conflicting.json?.comment).toBeUndefined();
+
+    // An invalid result produces no comment at all, with or without --post, and calls no tracker.
+    process.env.BKIT_LINEAR_API_KEY = "k";
+    const sent = linearCommentServer();
+    const badDir = dir({ tracker: { default: "linear" } });
+    write(
+      badDir,
+      "bad.json",
+      JSON.stringify({
+        ...result,
+        findings: [{ severity: "SEVERE", title: "x", location: "a:1" }],
+      }),
+    );
+    const invalid = await run(badDir, [
+      ...AUDIT,
+      "--result-file=bad.json",
+      "--post",
+      "--fid=eng-4-x",
+    ]);
+    expect([undefined, null]).toContain(invalid.json?.comment);
+    expect(sent).toEqual([]);
+
+    // Tracker none still skips, and Linear still posts the printed body once, deduplicated on a re-run.
+    expect(
+      (await run(cwd, [...AUDIT, "--result-file=r.json", "--post", "--fid=x"])).json.tracker,
+    ).toEqual({ skipped: "tracker-none" });
+    const linear = dir({ tracker: { default: "linear" } });
+    write(linear, "r.json", JSON.stringify(result));
+    const first = await run(linear, [...AUDIT, "--result-file=r.json", "--post", "--fid=eng-4-x"]);
+    expect(first.json.tracker).toMatchObject({ done: true, action: "comment" });
+    expect(sent).toEqual([first.json.comment]);
+    expect(first.json.comment).toContain(
+      "Audit Summary: security - Status: COMPLETE - Findings: CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 2",
+    );
+    const again = await run(linear, [...AUDIT, "--result-file=r.json", "--post", "--fid=eng-4-x"]);
+    expect(again.json.tracker).toMatchObject({ done: true, deduped: true });
+    expect(sent).toHaveLength(1);
+  });
+
   it("a failed post exits 0 with done false and the reason", async () => {
     const r = await run(dir({ tracker: { default: "linear" } }), [
       ...STEP,
diff --git a/.bkit/core/engine/commands/workflow/issues.ts b/.bkit/core/engine/commands/workflow/issues.ts
index aea828b71..5b77f7e3a 100644
--- a/.bkit/core/engine/commands/workflow/issues.ts
+++ b/.bkit/core/engine/commands/workflow/issues.ts
@@ -581,6 +581,186 @@ export function headingAnchor(heading: string): string {
     .replace(/ /g, "-");
 }
 
+// ---------------------------------------------------------------------------
+// Audit result — the one validated shape an audit's report header, ledger rows and
+// tracker comment are all derived from. The agent supplies findings and judgments
+// (status, the prior key it judged the same item, coverage gaps); the engine derives
+// the IDs, the severity totals and the ledger payloads, so none can disagree.
+// ---------------------------------------------------------------------------
+
+export const AUDIT_SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
+export type AuditSeverity = (typeof AUDIT_SEVERITIES)[number];
+
+export interface AuditFinding {
+  severity: AuditSeverity;
+  title: string;
+  /** `path:line`. */
+  location: string;
+  /** The key of an existing ledger entry the agent judged to be this same item. */
+  priorKey?: string;
+}
+
+export interface AuditResult {
+  slug: string;
+  status: "COMPLETE" | "STOPPED";
+  report: string | null;
+  findings: AuditFinding[];
+  /** Coverage the audit could not check, one entry each. */
+  notChecked: string[];
+  stopped?: string;
+  overview?: string;
+  issue?: string;
+  parent?: string;
+}
+
+const AUDIT_RESULT_KEYS = [
+  "slug",
+  "status",
+  "report",
+  "findings",
+  "notChecked",
+  "stopped",
+  "overview",
+  "issue",
+  "parent",
+];
+const AUDIT_FINDING_KEYS = ["severity", "title", "location", "priorKey"];
+
+/** The audit result held in `raw`; throws a CommandError (USAGE) naming the first problem. */
+export function parseAuditResult(raw: unknown): AuditResult {
+  const bad = (why: string) => new CommandError(EXIT.USAGE, `audit result: ${why}`);
+  if (raw === null || typeof raw !== "object" || Array.isArray(raw))
+    throw bad("must be a JSON object");
+  const r = raw as Record<string, unknown>;
+  for (const k of Object.keys(r))
+    if (!AUDIT_RESULT_KEYS.includes(k))
+      throw bad(`unknown field "${k}"; totals, counts and IDs are derived from the findings`);
+  if (typeof r["slug"] !== "string" || !/^[a-z0-9-]+$/.test(r["slug"]))
+    throw bad("slug must be the template slug (a-z, 0-9, -)");
+  if (r["status"] !== "COMPLETE" && r["status"] !== "STOPPED")
+    throw bad("status must be COMPLETE or STOPPED");
+  const report = r["report"] ?? null;
+  if (report !== null && (typeof report !== "string" || report === ""))
+    throw bad("report must be a path or null");
+  if (!Array.isArray(r["findings"])) throw bad("findings must be an array");
+  const priors = new Set<string>();
+  const findings = r["findings"].map((f: unknown, i: number): AuditFinding => {
+    const at = `finding ${i + 1}`;
+    if (f === null || typeof f !== "object" || Array.isArray(f))
+      throw bad(`${at} is not an object`);
+    const o = f as Record<string, unknown>;
+    for (const k of Object.keys(o))
+      if (!AUDIT_FINDING_KEYS.includes(k)) throw bad(`${at} has unknown field "${k}"`);
+    if (!AUDIT_SEVERITIES.includes(o["severity"] as AuditSeverity))
+      throw bad(`${at} severity must be ${AUDIT_SEVERITIES.join("|")}`);
+    if (typeof o["title"] !== "string" || o["title"].trim() === "")
+      throw bad(`${at} needs a title`);
+    if (typeof o["location"] !== "string" || !/^\S+:\d+$/.test(o["location"]))
+      throw bad(`${at} location must be path:line`);
+    if (o["priorKey"] !== undefined) {
+      if (typeof o["priorKey"] !== "string" || o["priorKey"] === "")
+        throw bad(`${at} priorKey must be a non-empty string`);
+      if (priors.has(o["priorKey"])) throw bad(`${at} repeats priorKey ${o["priorKey"]}`);
+      priors.add(o["priorKey"]);
+    }
+    return {
+      severity: o["severity"] as AuditSeverity,
+      title: o["title"].trim(),
+      location: o["location"],
+      ...(o["priorKey"] === undefined ? {} : { priorKey: o["priorKey"] }),
+    };
+  });
+  const notChecked = r["notChecked"] ?? [];
+  if (!Array.isArray(notChecked) || notChecked.some((n) => typeof n !== "string" || n === ""))
+    throw bad("notChecked must be an array of non-empty strings");
+  const text = (name: string): string | undefined => {
+    const v = r[name];
+    if (v === undefined) return undefined;
+    if (typeof v !== "string") throw bad(`${name} must be text`);
+    return v;
+  };
+  return {
+    slug: r["slug"],
+    status: r["status"],
+    report: report as string | null,
+    findings,
+    notChecked: notChecked as string[],
+    ...(text("stopped") === undefined ? {} : { stopped: text("stopped")! }),
+    ...(text("overview") === undefined ? {} : { overview: text("overview")! }),
+    ...(text("issue") === undefined ? {} : { issue: text("issue")! }),
+    ...(text("parent") === undefined ? {} : { parent: text("parent")! }),
+  };
+}
+
+/** Findings per severity. */
+export function auditTotals(findings: readonly AuditFinding[]): Record<AuditSeverity, number> {
+  return Object.fromEntries(
+    AUDIT_SEVERITIES.map((s) => [s, findings.filter((f) => f.severity === s).length]),
+  ) as Record<AuditSeverity, number>;
+}
+
+/** `CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 2`, the Findings header value. */
+export const auditFindingsLine = (totals: Record<AuditSeverity, number>): string =>
+  AUDIT_SEVERITIES.map((s) => `${s} ${totals[s]}`).join(" \u00b7 ");
+
+const kebab = (text: string) =>
+  text
+    .toLowerCase()
+    .replace(/[^a-z0-9]+/g, "-")
+    .replace(/^-+|-+$/g, "")
+    .slice(0, 48);
+
+export interface AuditEntry extends AuditFinding {
+  /** Report-local, stable under reordering: `<slug>-<n>` over the severity/location/title order. */
+  id: string;
+  /** The ledger key: the judged prior key, else derived from the slug and title. */
+  key: string;
+}
+
+/** The findings in their one deterministic order, each with its ID and ledger key. */
+export function auditEntries(result: AuditResult): AuditEntry[] {
+  const rank = (s: AuditSeverity) => AUDIT_SEVERITIES.indexOf(s);
+  const ordered = [...result.findings].sort(
+    (a, b) =>
+      rank(a.severity) - rank(b.severity) ||
+      a.location.localeCompare(b.location) ||
+      a.title.localeCompare(b.title) ||
+      (a.priorKey ?? "").localeCompare(b.priorKey ?? ""),
+  );
+  const used = new Set(ordered.flatMap((f) => (f.priorKey === undefined ? [] : [f.priorKey])));
+  return ordered.map((f, i) => {
+    let key = f.priorKey;
+    if (key === undefined) {
+      const base = `${result.slug}-${kebab(f.title) || "finding"}`;
+      key = base;
+      for (let n = 2; used.has(key); n += 1) key = `${base}-${n}`;
+      used.add(key);
+    }
+    return { ...f, id: `${result.slug}-${i + 1}`, key };
+  });
+}
+
+/** One `failure` ledger payload per finding, ready for `bkit ledgers append`. */
+export function auditLedgerRows(result: AuditResult): Array<Record<string, unknown>> {
+  return auditEntries(result).map((e) => ({
+    kind: "failure",
+    by: { workflow: "audit", step: `audit-${result.slug}` },
+    key: e.key,
+    summary: e.title,
+    severity: e.severity,
+    description: `${e.title} (${e.location}); audit ${result.slug} finding ${e.id}`,
+    status: "OPEN",
+  }));
+}
+
+/** The comment's header fields: the same Status and Findings the report header carries. */
+export function auditHeaderFields(result: AuditResult): Array<[string, string]> {
+  return [
+    ["Status", result.status],
+    ["Findings", auditFindingsLine(auditTotals(result.findings))],
+  ];
+}
+
 const KINDS = ["step", "failure", "handover", "audit"];
 
 /** The exact comment body; files (`bodyFile`, `sections`, `stderrFile`, `errorFile`) resolve against `cwd`. */
@@ -677,14 +857,38 @@ export function commentBody(ctx: RunContext): string {
   if (ctx.flags.groupCount !== undefined && ctx.flags.group === undefined) {
     throw new CommandError(EXIT.USAGE, "--group-count needs --group");
   }
+  const resultFile = str(ctx.flags.resultFile);
+  let audit: AuditResult | undefined;
+  if (resultFile !== undefined) {
+    if (kind !== "audit") throw new CommandError(EXIT.USAGE, "--result-file needs --kind=audit");
+    const parsed = parseJson(readInput(ctx.cwd, resultFile, "result-file"));
+    if (!parsed.ok) throw new CommandError(EXIT.USAGE, "--result-file is not JSON");
+    audit = parseAuditResult(parsed.value);
+    const slug = str(ctx.flags.auditSlug);
+    if (slug !== undefined && slug !== audit.slug)
+      throw new CommandError(
+        EXIT.USAGE,
+        `conflict: --audit-slug ${slug} is not the result's slug ${audit.slug}`,
+      );
+    for (const [name] of headerFields(ctx))
+      if (name === "Status" || name === "Findings")
+        throw new CommandError(
+          EXIT.USAGE,
+          `conflict: --field ${name} beside --result-file; the result derives it`,
+        );
+  }
+  const given = (ctx.flags.line as string[] | undefined) ?? [];
   return buildComment(ctx.cwd, {
     kind: kind as CommentInput["kind"],
-    auditSlug: str(ctx.flags.auditSlug),
+    auditSlug: audit?.slug ?? str(ctx.flags.auditSlug),
     workflow: str(ctx.flags.workflow),
     workflowHeading: ctx.flags.workflowHeading === true,
     stepNumber: str(ctx.flags.stepNumber),
     stepTitle: str(ctx.flags.stepTitle),
-    fields: kind === "step" || kind === "audit" ? headerFields(ctx) : [],
+    fields: [
+      ...(audit === undefined ? [] : auditHeaderFields(audit)),
+      ...(kind === "step" || kind === "audit" ? headerFields(ctx) : []),
+    ],
     subStep: str(ctx.flags.subStep),
     error: str(ctx.flags.error),
     errorFile: str(ctx.flags.errorFile),
@@ -696,7 +900,7 @@ export function commentBody(ctx: RunContext): string {
     runId: str(ctx.flags.runId),
     artifacts: (ctx.flags.artifact as string[] | undefined) ?? [],
     ref: str(ctx.flags.ref),
-    lines: (ctx.flags.line as string[] | undefined) ?? [],
+    lines: [...(audit?.report == null ? [] : [`Report: ${audit.report}`]), ...given],
     bodyFile: str(ctx.flags.bodyFile),
     sections: (ctx.flags.section as string[] | undefined) ?? [],
   });
@@ -981,6 +1185,11 @@ export const issuesCommand: CommandSpec = {
           help: "routine | attention | terminal; defaults from kind, never from PR metadata",
         },
         { name: "audit-slug", type: "string", help: "audit: template slug, e.g. security" },
+        {
+          name: "result-file",
+          type: "string",
+          help: "audit: the structured audit result JSON; derives the Status and Findings fields and the Report line, and refuses a hand-written Status or Findings field",
+        },
         { name: "step-number", type: "string", help: "step number in the heading" },
         { name: "step-title", type: "string", help: "step title in the heading, e.g. Plan Verify" },
         { name: "workflow", type: "string", help: "design | plan | build | debug | ship | auto" },
diff --git a/.bkit/core/engine/commands/workflow/ledgers.test.ts b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index cc0b8e715..9a65bc8e8 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.test.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -2029,3 +2029,92 @@ describe("bkit ledgers query", () => {
     expect(fs.readFileSync(path.join(r, FILE), "utf-8")).toBe(bytes);
   });
 });
+
+describe("bkit ledgers append --operation", () => {
+  const failure = (o: Record<string, unknown> = {}) => ({
+    kind: "failure",
+    by: { workflow: "build", step: "build-challenge" },
+    key: "parser-drops-last-line",
+    summary: "parser drops the last line",
+    severity: "HIGH",
+    status: "OPEN",
+    ...o,
+  });
+
+  async function appendOp(r: string, rows: unknown, operation: string) {
+    const file = path.join(tmp(), "rows.json");
+    fs.writeFileSync(file, JSON.stringify(rows));
+    return run(r, [
+      "append",
+      `--root=${r}`,
+      "--ledger=failures",
+      `--rows=${file}`,
+      `--operation=${operation}`,
+    ]);
+  }
+
+  it("returns durable append receipt and permits a deliberate same-key update", async () => {
+    const r = repo();
+    const ledgerFile = path.join(r, "docs/failures.jsonl");
+    const lines = () =>
+      fs
+        .readFileSync(ledgerFile, "utf-8")
+        .split("\n")
+        .filter((l) => l !== "")
+        .map((l) => JSON.parse(l) as Record<string, unknown>);
+
+    const first = await appendOp(r, [failure()], "op-1");
+    expect(first.code).toBe(0);
+    expect(first.json.receipt).toMatchObject({
+      operation: "op-1",
+      ledger: "failures",
+      file: "docs/failures.jsonl",
+      offset: 0,
+      replayed: false,
+      rows: [{ key: "parser-drops-last-line", ts: expect.any(Number) }],
+    });
+    const bytes = fs.readFileSync(ledgerFile, "utf-8");
+    expect(first.json.receipt.bytes).toBe(Buffer.byteLength(bytes));
+    expect(first.json.receipt.rows[0].ts).toBe(lines()[0]!["ts"]);
+
+    // Replay: the original receipt comes back, nothing is minted or written.
+    const replay = await appendOp(r, [failure()], "op-1");
+    expect(replay.code).toBe(0);
+    expect(replay.json.receipt).toEqual({ ...first.json.receipt, replayed: true });
+    expect(replay.json.appended).toBe(0);
+    expect(fs.readFileSync(ledgerFile, "utf-8")).toBe(bytes);
+
+    // The same operation id with a different request is a collision: refused, nothing written.
+    const conflict = await appendOp(r, [failure({ summary: "something else" })], "op-1");
+    expect(conflict.code).toBe(EXIT_ROW_REFUSED);
+    expect(conflict.err).toContain("op-1");
+    expect(fs.readFileSync(ledgerFile, "utf-8")).toBe(bytes);
+
+    // A new operation on the same key is a deliberate update: it appends and carries lineage.
+    const update = await appendOp(r, [failure({ summary: "parser drops two lines" })], "op-2");
+    expect(update.code).toBe(0);
+    expect(update.json.receipt).toMatchObject({
+      operation: "op-2",
+      offset: Buffer.byteLength(bytes),
+      replayed: false,
+    });
+    const [a, b] = lines();
+    expect(lines()).toHaveLength(2);
+    expect(b).toMatchObject({ firstTs: a!["ts"], updates: 2, summary: "parser drops two lines" });
+    expect(b!["ts"]).toBeGreaterThan(a!["ts"] as number);
+    expect(update.json.receipt.rows[0].ts).toBe(b!["ts"]);
+  });
+
+  it("refuses --issue-operation without an invocation or beside --operation, writing nothing", async () => {
+    const r = repo();
+    const file = path.join(tmp(), "rows.json");
+    fs.writeFileSync(file, JSON.stringify([failure()]));
+    const base = ["append", `--root=${r}`, "--ledger=failures", `--rows=${file}`];
+    const alone = await run(r, [...base, "--issue-operation"]);
+    expect(alone.code).toBe(2);
+    expect(alone.err).toContain("--invocation");
+    const both = await run(r, [...base, "--issue-operation", "--operation=op-1"]);
+    expect(both.code).toBe(2);
+    expect(fs.existsSync(path.join(r, "docs/failures.jsonl"))).toBe(false);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/ledgers.ts b/.bkit/core/engine/commands/workflow/ledgers.ts
index e08b13d8c..eba8076a6 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.ts
@@ -32,6 +32,19 @@ import {
   type AppendLedger,
 } from "../../ledgers/telemetry.js";
 import { COMPACT_LEDGERS, compactLedgers, type CompactLedger } from "../../ledgers/compact.js";
+import {
+  LEDGER_OPERATIONS_FILE,
+  actionHash,
+  appendHeld,
+  ledgerIntent,
+  ledgerOperation,
+  pendingLedgerIntents,
+  recordLedgerIntent,
+  recordLedgerOperation,
+  withTargetLock,
+  writePrepared,
+  type AppendCheckpoint,
+} from "../../ledgers/status.js";
 import {
   CommandError,
   EXIT,
@@ -818,15 +831,28 @@ export const ledgersCommand: CommandSpec = {
           ...INVOCATION_FLAG,
           help: `${INVOCATION_FLAG.help}; fills each row's by block (workflow, step, subagent, model, provenance) and refuses a row whose own by disagrees`,
         },
+        {
+          name: "operation",
+          type: "string",
+          help: "operation id naming this request: the same id and rows replay the original receipt without writing; the same id with other rows is refused; a new id is a deliberate later update",
+        },
+        {
+          name: "issue-operation",
+          type: "boolean",
+          help: "let the engine issue the operation id from --invocation and the request, so a retried call after a lost response replays instead of appending again; exclusive with --operation",
+        },
       ],
       output: {
         ledger: "the ledger appended to",
         file: "its path, relative to --root",
         appended: "rows written",
         keys: "each row's key, in order (null when a row has none)",
+        receipt:
+          "with --operation: {operation, ledger, file, offset, bytes, rows[{key, ts}], replayed}; replayed is true when the original effect is returned",
       },
       exitCodes: {
-        [EXIT_STAGE]: "mkdir or append failed",
+        [EXIT_STAGE]:
+          "mkdir or append failed, the ledger is locked by another writer, or a prior attempt left an uncertain partial write",
         [EXIT_ROW_REFUSED]:
           "a row carries ts, has the wrong kind, fails validation, or names a writer not listed for its kind — nothing written",
       },
@@ -1271,14 +1297,23 @@ export function unionLedgers(src: string, dst: string): string[] {
     const made = mkdirp(path.dirname(to));
     if (made) throw new CommandError(EXIT_STAGE, `mkdir failed for ${path.dirname(to)}: ${made}`);
     if (fs.existsSync(to) && fs.statSync(to).isFile()) {
-      const existing = fs.readFileSync(to, "utf-8");
-      const have = new Set(fileLines(existing));
-      const fresh = fileLines(fs.readFileSync(from, "utf-8")).filter((l) => !have.has(l));
-      const block = fresh.join("\n").replace(/\n+$/, "");
-      // A destination missing its final newline would glue the first new row
-      // onto its last one, leaving a line that is not JSON.
-      const sep = existing !== "" && !existing.endsWith("\n") ? "\n" : "";
-      if (block !== "") fs.appendFileSync(to, `${sep}${block}\n`);
+      // Under the destination's target lock, so a pending ledger operation's bytes are never reordered.
+      withTargetLock(to, () => {
+        const pending = pendingLedgerIntents(path.join(dst, LEDGER_OPERATIONS_FILE), rel);
+        if (pending.length > 0)
+          throw new CommandError(
+            EXIT_STAGE,
+            `${rel} has ledger operation(s) with bytes but no receipt (${pending.map((p) => p.operation).join(", ")}); replay them first`,
+          );
+        const existing = fs.readFileSync(to, "utf-8");
+        const have = new Set(fileLines(existing));
+        const fresh = fileLines(fs.readFileSync(from, "utf-8")).filter((l) => !have.has(l));
+        const block = fresh.join("\n").replace(/\n+$/, "");
+        // A destination missing its final newline would glue the first new row
+        // onto its last one, leaving a line that is not JSON.
+        const sep = existing !== "" && !existing.endsWith("\n") ? "\n" : "";
+        if (block !== "") fs.appendFileSync(to, `${sep}${block}\n`);
+      });
     } else {
       const copied = copy(from, to);
       if (copied) throw new CommandError(EXIT_STAGE, `copy failed for ${rel}: ${copied}`);
@@ -1302,6 +1337,8 @@ export interface AppendResult {
   file: string;
   appended: number;
   keys: Array<string | null>;
+  /** Present when the call named an `operation`. */
+  receipt?: LedgerReceipt;
 }
 
 /** The top section in its written order, then the row's own fields. */
@@ -1382,20 +1419,55 @@ function withInvocationBy(
   return { ...row, by };
 }
 
+export interface LedgerReceipt {
+  operation: string;
+  ledger: string;
+  file: string;
+  offset: number;
+  bytes: number;
+  rows: Array<{ key: string | null; ts: number }>;
+  replayed: boolean;
+}
+
+export interface AppendOptions {
+  /** Names the request: the same id and rows replay the original effect, never a second write. */
+  operation?: string;
+  /** The engine issues the operation id from the invocation and the request; exclusive with `operation`. */
+  issueOperation?: boolean;
+  /** Test seam: called at each durable checkpoint; a throw there simulates a lost response. */
+  checkpoint?: AppendCheckpoint;
+}
+
+/** The `{key, ts}` of each row in prepared `block` bytes. */
+function receiptRows(block: string): LedgerReceipt["rows"] {
+  const out: LedgerReceipt["rows"] = [];
+  for (const line of block.split("\n")) {
+    if (line.trim() === "") continue;
+    const parsed = parseJson(line);
+    if (!parsed.ok || parsed.value === null || typeof parsed.value !== "object") continue;
+    const r = parsed.value as Record<string, unknown>;
+    out.push({ key: typeof r["key"] === "string" ? r["key"] : null, ts: Number(r["ts"]) });
+  }
+  return out;
+}
+
 /**
  * Append `rows` to one ledger. Every row is checked before any is written, so a
  * refused row leaves the file byte-identical. Each row gets `schema` and a `ts`
  * minted now (never supplied), `repo` when it lacks one and `bkit.version` from
  * `.bkit/version`; an `AGED_KINDS` row also gets `firstTs` + `updates` carried
  * forward from its entry's rows already in the ledger (supplied values replaced).
- * Never rewrites existing rows. Throws a CommandError (USAGE / EXIT_ROW_REFUSED /
- * EXIT_STAGE).
+ * Never rewrites existing rows. The write runs under the ledger's target lock; with
+ * `options.operation` it also records the prepared bytes and a durable receipt, so a
+ * lost response is reconciled by inspecting the ledger, never by appending again.
+ * Throws a CommandError (USAGE / EXIT_ROW_REFUSED / EXIT_STAGE).
  */
 export function appendLedgerRows(
   root: string,
   ledger: string,
   rows: unknown,
   invocation?: Invocation,
+  options: AppendOptions = {},
 ): AppendResult {
   if (!Object.hasOwn(APPEND_LEDGERS, ledger)) {
     throw new CommandError(
@@ -1408,82 +1480,193 @@ export function appendLedgerRows(
   if (!Array.isArray(rows)) throw new CommandError(EXIT.USAGE, "--rows must hold a JSON array");
   if (rows.length === 0) throw new CommandError(EXIT.USAGE, "--rows holds no rows");
 
-  let repo: string | undefined;
-  let version: string | undefined;
-  let last: number | undefined;
   const abs = path.join(root, file);
-  const prior: unknown[] = fs.existsSync(abs) ? parse(fs.readFileSync(abs, "utf-8")).events : [];
-  const out: Array<Record<string, unknown>> = rows.map((raw, i) => {
-    const refuse = (why: string) => new CommandError(EXIT_ROW_REFUSED, `row ${i + 1}: ${why}`);
-    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
-      throw refuse("not a JSON object");
-    }
-    const r =
-      invocation === undefined
-        ? (raw as Record<string, unknown>)
-        : withInvocationBy(raw as Record<string, unknown>, invocation, refuse);
-    if (invocation === undefined && byOfRow(r)["modelSource"] === "unavailable")
-      throw refuse(
-        "by.modelSource unavailable needs a validated --invocation; the engine records it, a caller cannot assert it",
-      );
-    if (Object.hasOwn(r, "ts")) throw refuse("carries ts; ts is minted at append time");
-    if (Object.hasOwn(r, "schema")) throw refuse("carries schema; it is set at append time");
-    if (!takes.includes(String(r["kind"]))) {
-      throw refuse(
-        `kind must be ${takes.join(" | ")} in --ledger=${ledger} (got ${String(r["kind"])})`,
-      );
-    }
-    if (Object.hasOwn(r, "bkit")) throw refuse("carries bkit; bkit.version is set at append time");
-    repo ??= resolveRepoSlug(root) || "unknown/repo";
-    version ??= readBkitVersion(path.join(root, ".bkit", "version"))?.pinnedVersion || "unknown";
-    last = mintTs(last);
-    const filled = withLineage(prior, {
-      repo,
-      ...r,
-      schema: SCHEMA,
-      ts: last,
-      bkit: { version },
-    });
-    const row: Record<string, unknown> = {};
-    for (const k of TOP_ORDER) if (filled[k] !== undefined) row[k] = filled[k];
-    for (const [k, v] of Object.entries(filled)) if (!(k in row)) row[k] = v;
-    const v = validate(row);
-    if (!v.ok) throw refuse(v.reason ?? "invalid");
-    const who = writerProblem(row);
-    if (who !== undefined) throw refuse(who);
-    prior.push(row);
-    return row;
-  });
-
   const made = mkdirp(path.dirname(abs));
   if (made) throw new CommandError(EXIT_STAGE, `mkdir failed for ${path.dirname(file)}: ${made}`);
-  const block = out.map((r) => `${JSON.stringify(r)}\n`).join("");
-  // A file missing its final newline would glue the first row onto its last one.
-  const appendErr = appendText(abs, endsMidLine(abs) ? `\n${block}` : block);
-  if (appendErr) throw new CommandError(EXIT_STAGE, `append failed: ${file} — ${appendErr}`);
-  return {
-    ledger: ledger as AppendLedger,
-    file,
-    appended: out.length,
-    keys: out.map((r) => (typeof r["key"] === "string" ? r["key"] : null)),
+  const ops = path.join(root, LEDGER_OPERATIONS_FILE);
+  const hash = actionHash(JSON.stringify({ ledger, rows, invocation: invocation?.id ?? null }));
+  if (options.operation !== undefined && options.issueOperation === true)
+    throw new CommandError(
+      EXIT.USAGE,
+      "--issue-operation and --operation are exclusive: the engine issues the id, or the caller names it",
+    );
+  if (options.issueOperation === true && invocation === undefined)
+    throw new CommandError(
+      EXIT.USAGE,
+      "--issue-operation needs --invocation: the id is issued from that invocation's context",
+    );
+  // Issued from the invocation and the request hash, so retrying a lost response gets the same id.
+  const operation =
+    options.operation ??
+    (options.issueOperation === true && invocation !== undefined
+      ? `op-${invocation.id.slice(4, 16)}-${hash.slice(0, 12)}`
+      : undefined);
+
+  const result = (landed: { offset: number; bytes: number }, block: string, replayed: boolean) => {
+    const parsedRows = receiptRows(block);
+    return {
+      ledger: ledger as AppendLedger,
+      file,
+      appended: replayed ? 0 : parsedRows.length,
+      keys: parsedRows.map((r) => r.key),
+      ...(operation === undefined
+        ? {}
+        : {
+            receipt: {
+              operation,
+              ledger,
+              file,
+              offset: landed.offset,
+              bytes: landed.bytes,
+              rows: parsedRows,
+              replayed,
+            },
+          }),
+    };
   };
-}
 
-/** True when `abs` exists, is non-empty and its last byte is not a newline. */
-function endsMidLine(abs: string): boolean {
-  let fd: number | undefined;
+  const build = (text: string): string => {
+    let repo: string | undefined;
+    let version: string | undefined;
+    let last: number | undefined;
+    const prior: unknown[] = parse(text).events;
+    const out: Array<Record<string, unknown>> = rows.map((raw, i) => {
+      const refuse = (why: string) => new CommandError(EXIT_ROW_REFUSED, `row ${i + 1}: ${why}`);
+      if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
+        throw refuse("not a JSON object");
+      }
+      const r =
+        invocation === undefined
+          ? (raw as Record<string, unknown>)
+          : withInvocationBy(raw as Record<string, unknown>, invocation, refuse);
+      if (invocation === undefined && byOfRow(r)["modelSource"] === "unavailable")
+        throw refuse(
+          "by.modelSource unavailable needs a validated --invocation; the engine records it, a caller cannot assert it",
+        );
+      if (Object.hasOwn(r, "ts")) throw refuse("carries ts; ts is minted at append time");
+      if (Object.hasOwn(r, "schema")) throw refuse("carries schema; it is set at append time");
+      if (!takes.includes(String(r["kind"]))) {
+        throw refuse(
+          `kind must be ${takes.join(" | ")} in --ledger=${ledger} (got ${String(r["kind"])})`,
+        );
+      }
+      if (Object.hasOwn(r, "bkit"))
+        throw refuse("carries bkit; bkit.version is set at append time");
+      repo ??= resolveRepoSlug(root) || "unknown/repo";
+      version ??= readBkitVersion(path.join(root, ".bkit", "version"))?.pinnedVersion || "unknown";
+      last = mintTs(last);
+      const filled = withLineage(prior, {
+        repo,
+        ...r,
+        schema: SCHEMA,
+        ts: last,
+        bkit: { version },
+      });
+      const row: Record<string, unknown> = {};
+      for (const k of TOP_ORDER) if (filled[k] !== undefined) row[k] = filled[k];
+      for (const [k, v] of Object.entries(filled)) if (!(k in row)) row[k] = v;
+      const v = validate(row);
+      if (!v.ok) throw refuse(v.reason ?? "invalid");
+      const who = writerProblem(row);
+      if (who !== undefined) throw refuse(who);
+      prior.push(row);
+      return row;
+    });
+    return out.map((r) => `${JSON.stringify(r)}\n`).join("");
+  };
+
+  const stage = (err: unknown) =>
+    err instanceof CommandError
+      ? err
+      : new CommandError(EXIT_STAGE, `append failed: ${file} \u2014 ${(err as Error).message}`);
+
   try {
-    fd = fs.openSync(abs, "r");
-    const size = fs.fstatSync(fd).size;
-    if (size === 0) return false;
-    const last = Buffer.alloc(1);
-    fs.readSync(fd, last, 0, 1, size - 1);
-    return last[0] !== 0x0a;
-  } catch {
-    // No file yet: the append creates it.
-    return false;
-  } finally {
-    if (fd !== undefined) fs.closeSync(fd);
+    return withTargetLock(abs, () => {
+      if (operation === undefined) {
+        const landed = appendHeld(abs, build, { checkpoint: options.checkpoint });
+        return result(landed, landed.block, false);
+      }
+      // The operation store is serialized by its own lock, taken after the target's, so two
+      // ledgers' operations (and `union` of the store) never interleave check and record.
+      return withTargetLock(ops, () => {
+        const known = ledgerOperation(ops, operation, hash);
+        if (known.state === "conflict")
+          throw new CommandError(
+            EXIT_ROW_REFUSED,
+            `operation ${operation} was already used for a different request; nothing written`,
+          );
+        if (known.state === "replay") {
+          const d = (known.row as { detail?: { offset: number; bytes: number; block: string } })
+            .detail;
+          if (d === undefined)
+            throw new CommandError(
+              EXIT_STAGE,
+              `operation ${operation} has a receipt without its effect`,
+            );
+          return result(d, d.block, true);
+        }
+        const intent = ledgerIntent(ops, operation);
+        if (intent !== undefined && intent.hash !== hash)
+          throw new CommandError(
+            EXIT_ROW_REFUSED,
+            `operation ${operation} was already used for a different request; nothing written`,
+          );
+        const receipt = (landed: { offset: number; bytes: number; block: string }) =>
+          recordLedgerOperation(ops, {
+            operation,
+            hash,
+            ref: `${file}@${landed.offset}+${landed.bytes}`,
+            detail: { offset: landed.offset, bytes: landed.bytes, block: landed.block },
+          });
+        if (intent !== undefined) {
+          const have = fs.existsSync(abs) ? fs.readFileSync(abs) : Buffer.alloc(0);
+          const want = Buffer.from(intent.block);
+          const seg = have.subarray(intent.offset, intent.offset + want.length);
+          if (seg.equals(want)) {
+            // The bytes landed whole; confirm them durable and receipt them.
+            const fd = fs.openSync(abs, "r");
+            try {
+              fs.fsyncSync(fd);
+            } finally {
+              fs.closeSync(fd);
+            }
+            receipt(intent);
+            options.checkpoint?.("receipted");
+            return result(intent, intent.block, true);
+          }
+          if (seg.length > 0 && have.length === intent.offset + seg.length)
+            throw new CommandError(
+              EXIT_STAGE,
+              `operation ${operation}: ${file} holds ${seg.length} of ${want.length} prepared bytes; the effect is uncertain, nothing was truncated or retried`,
+            );
+          if (have.length === intent.offset) {
+            // Nothing landed: write the exact prepared bytes again.
+            writePrepared(abs, intent.block, intent.offset);
+            options.checkpoint?.("written");
+            receipt(intent);
+            options.checkpoint?.("receipted");
+            return result(intent, intent.block, false);
+          }
+          // Another writer appended after the failed attempt and none of ours landed: prepare afresh.
+        }
+        const landed = appendHeld(abs, build, {
+          checkpoint: options.checkpoint,
+          prepared: (p) =>
+            recordLedgerIntent(ops, {
+              operation,
+              hash,
+              file,
+              offset: p.offset,
+              bytes: Buffer.byteLength(p.block),
+              block: p.block,
+            }),
+          written: (p) => receipt(p),
+        });
+        return result(landed, landed.block, false);
+      });
+    });
+  } catch (err) {
+    throw stage(err);
   }
 }
 
@@ -1511,8 +1694,15 @@ function append(ctx: RunContext): number {
         `conflict: --root ${root} is outside the checkout ${ctx.invocation.worktree} that issued invocation ${ctx.invocation.id}`,
       );
   }
-  const r = appendLedgerRows(root, String(ctx.flags.ledger), parsed.value, ctx.invocation);
-  ctx.log(`appended ${r.appended} row(s) to ${r.file}`);
+  const r = appendLedgerRows(root, String(ctx.flags.ledger), parsed.value, ctx.invocation, {
+    operation: str(ctx.flags.operation),
+    issueOperation: ctx.flags.issueOperation === true,
+  });
+  ctx.log(
+    r.receipt?.replayed === true
+      ? `operation ${r.receipt.operation} already appended to ${r.file}; nothing written`
+      : `appended ${r.appended} row(s) to ${r.file}`,
+  );
   ctx.emit({ ...r });
   return EXIT.OK;
 }
@@ -1679,18 +1869,22 @@ function compactOrError(
   dryRun: boolean,
 ): ReturnType<typeof compactLedgers> | string {
   try {
-    return compactLedgers(root, ledgers, dryRun);
-  } catch (err) {
-    // Reported as the command's staging exit code, with the reason.
-    return (err as Error).message;
-  }
-}
-
-/** Append `text` to `file`; the error text, or undefined on success. */
-function appendText(file: string, text: string): string | undefined {
-  try {
-    fs.appendFileSync(file, text);
-    return undefined;
+    const targets = ledgers.map((l) => COMPACT_LEDGERS[l]).sort();
+    const locked = (i: number): ReturnType<typeof compactLedgers> => {
+      if (i === targets.length) {
+        const ops = path.join(root, LEDGER_OPERATIONS_FILE);
+        for (const t of targets) {
+          const pending = pendingLedgerIntents(ops, t);
+          if (pending.length > 0)
+            throw new Error(
+              `${t} has ${pending.length} ledger operation(s) with bytes but no receipt (${pending.map((p) => p.operation).join(", ")}); replay them before compacting`,
+            );
+        }
+        return compactLedgers(root, ledgers, dryRun);
+      }
+      return withTargetLock(path.join(root, targets[i]!), () => locked(i + 1));
+    };
+    return locked(0);
   } catch (err) {
     // Reported as the command's staging exit code, with the reason.
     return (err as Error).message;
diff --git a/.bkit/core/engine/commands/workflow/locks.ts b/.bkit/core/engine/commands/workflow/locks.ts
index 428ec761a..f20ea3f4d 100644
--- a/.bkit/core/engine/commands/workflow/locks.ts
+++ b/.bkit/core/engine/commands/workflow/locks.ts
@@ -15,6 +15,7 @@ import * as os from "node:os";
 import * as path from "node:path";
 
 import {
+  createExclusive,
   fold,
   lastRun,
   statusTimestamp,
@@ -115,21 +116,7 @@ export function readHolder(file: string): Holder | undefined {
 /** Create `file` only if absent (`set -C`); false when someone else holds it. */
 export function tryCreate(file: string, line: string): boolean {
   fs.mkdirSync(path.dirname(file), { recursive: true });
-  const fd = openExclusive(file);
-  if (fd === undefined) return false;
-  fs.writeSync(fd, `${line}\n`);
-  fs.closeSync(fd);
-  return true;
-}
-
-function openExclusive(file: string): number | undefined {
-  try {
-    return fs.openSync(file, "wx");
-  } catch (err) {
-    // EEXIST is the expected "someone holds it" answer; anything else is a real error.
-    if ((err as NodeJS.ErrnoException).code === "EEXIST") return undefined;
-    throw err;
-  }
+  return createExclusive(file, `${line}\n`);
 }
 
 const newToken = () => randomBytes(4).toString("hex");
diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index 39a32ff7b..0c94ffa81 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -20,6 +20,7 @@ import {
   readHeader,
   stepsCommand,
 } from "./steps";
+import { getPromptsRoot } from "../../shared/package-roots.js";
 import { blockHash } from "./tests";
 
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
@@ -2155,3 +2156,325 @@ describe("bkit steps finish — a step commit never changes bkit.workflows", ()
     ).toMatchObject({ build: { verify: { maxAttempts: 5 } } });
   });
 });
+
+describe("bkit steps stub --result-file", () => {
+  const finding = (n: number, o: Record<string, unknown> = {}) => ({
+    severity: "HIGH",
+    fixable: true,
+    location: `src/f${n}.ts:${n}`,
+    title: `Finding ${n}`,
+    doneWhen: `finding ${n} fixed`,
+    tests: [`\`src/f${n}.test.ts\` \`covers ${n}\` fails on finding ${n}.`],
+    ...o,
+  });
+  const resultFile = (cwd: string, rel: string, o: Record<string, unknown>) =>
+    write(
+      cwd,
+      rel,
+      JSON.stringify({
+        findings: [],
+        judgments: {},
+        body: "# Report\n\n## Scope\n\n`Group 3`\n",
+        ...o,
+      }),
+    );
+  const stubArgs = (agent: string, result: string, to: string) => [
+    "steps",
+    "stub",
+    `--agent=${agent}`,
+    `--result-file=${result}`,
+    `--to=${to}`,
+  ];
+  const headerFields = (text: string): Record<string, string> =>
+    Object.fromEntries(
+      text
+        .split("\n")
+        .map((l) => /^([A-Z][A-Za-z ]*):\s*(.*)$/.exec(l))
+        .filter((m): m is RegExpExecArray => m !== null)
+        .map((m) => [m[1]!, m[2]!]),
+    );
+  const header = (cwd: string, rel: string) =>
+    fs.readFileSync(path.join(cwd, rel), "utf-8").split("<!-- verdict:end -->")[0]!;
+
+  it("derives supported header fields and rejects stale bodies without false PASS", async () => {
+    const cwd = repo();
+
+    // Every registered header kind: counts and booleans come from the findings, judgments pass through.
+    const kinds: Array<[string, Record<string, string>, Record<string, string>]> = [
+      ["bkit-build-challenge-1", {}, { Verdict: "FAIL", Failures: "2" }],
+      [
+        "bkit-plan-review-1",
+        { Redesign: "false" },
+        { Verdict: "FAIL", Failures: "2", Redesign: "false" },
+      ],
+      [
+        "bkit-build-plan-verify",
+        { Tasks: "1, 2", Loosened: "none" },
+        { Verdict: "FAIL", Failures: "2", Fixable: "true", Tasks: "1, 2", Loosened: "none" },
+      ],
+    ];
+    for (const [agent, judgments, expected] of kinds) {
+      resultFile(cwd, "logs/r.json", {
+        findings: [finding(1), finding(2, { fixable: false })],
+        judgments,
+      });
+      const res = await run(cwd, stubArgs(agent, "logs/r.json", `logs/${agent}.md`));
+      expect(res.code).toBe(0);
+      const fields = headerFields(header(cwd, `logs/${agent}.md`));
+      expect(fields).toMatchObject(expected);
+      expect(
+        (await run(cwd, ["steps", "verdict", `--file=logs/${agent}.md`, `--agent=${agent}`])).code,
+      ).toBe(0);
+    }
+
+    // No findings and complete evidence is a PASS with zero failures.
+    resultFile(cwd, "logs/clean.json", { judgments: { Tasks: "1", Loosened: "none" } });
+    await run(cwd, stubArgs("bkit-build-plan-verify", "logs/clean.json", "logs/clean.md"));
+    expect(header(cwd, "logs/clean.md")).toContain("Verdict: PASS");
+    expect(header(cwd, "logs/clean.md")).toContain("Failures: 0");
+    expect(header(cwd, "logs/clean.md")).toContain("Fixable: false");
+
+    // Incomplete evidence never becomes PASS.
+    resultFile(cwd, "logs/partial.json", {
+      evidenceComplete: false,
+      judgments: { Tasks: "1", Loosened: "none" },
+    });
+    await run(cwd, stubArgs("bkit-build-plan-verify", "logs/partial.json", "logs/partial.md"));
+    expect(header(cwd, "logs/partial.md")).not.toContain("Verdict: PASS");
+
+    // A body edited after generation is stale: the verdict read refuses it (EXIT_INVALID).
+    const generated = fs.readFileSync(path.join(cwd, "logs/clean.md"), "utf-8");
+    write(cwd, "logs/clean.md", `${generated}\nA late edit.\n`);
+    const stale = await run(cwd, [
+      "steps",
+      "verdict",
+      "--file=logs/clean.md",
+      "--agent=bkit-build-plan-verify",
+    ]);
+    expect(stale.code).toBe(6);
+    expect(stale.err).toMatch(/stale|fingerprint/i);
+
+    // So is a header edited to disagree with its findings, and a result changed after rendering.
+    write(cwd, "logs/clean.md", generated);
+    const verdictArgs = [
+      "steps",
+      "verdict",
+      "--file=logs/clean.md",
+      "--agent=bkit-build-plan-verify",
+    ];
+    expect((await run(cwd, verdictArgs)).code).toBe(0);
+    resultFile(cwd, "logs/clean.json", {
+      findings: [finding(9)],
+      judgments: { Tasks: "1", Loosened: "none" },
+    });
+    expect((await run(cwd, [...verdictArgs, "--result-file=logs/clean.json"])).code).toBe(6);
+    write(cwd, "logs/clean.md", generated.replace("Failures: 0", "Failures: 3"));
+    expect((await run(cwd, verdictArgs)).code).toBe(6);
+  });
+
+  const headerPromptAgents = (): string[] =>
+    fs
+      .readdirSync(getPromptsRoot())
+      .filter((n) => n.endsWith(".md"))
+      .map((n) => n.slice(0, -3))
+      .filter((agent) =>
+        fs
+          .readFileSync(path.join(getPromptsRoot(), `${agent}.md`), "utf-8")
+          .split("\n")
+          .some((l) => l.startsWith("Verdict: ")),
+      )
+      .filter(
+        (agent) => promptHeader(agent).verdicts.length > 0 && agent !== "bkit-audit-generate",
+      );
+
+  const judgmentsFor = (declared: ReturnType<typeof promptHeader>): Record<string, string> => {
+    const judgments: Record<string, string> = {};
+    for (const f of declared.fields) {
+      if (f.name === "Failures" || f.name === "Fixable") continue;
+      judgments[f.name] = f.values ? f.values[0]! : f.integer ? "1" : "none";
+    }
+    return judgments;
+  };
+
+  // Asserts the derived Failures / Fixable fields only for headers that declare them.
+  const expectDerived = (
+    declared: ReturnType<typeof promptHeader>,
+    fields: Record<string, string>,
+    agent: string,
+    failures: string,
+    fixable: string,
+  ): void => {
+    const has = (name: string) => declared.fields.some((f) => f.name === name);
+    if (has("Failures")) expect(fields["Failures"], agent).toBe(failures);
+    if (has("Fixable")) expect(fields["Fixable"], agent).toBe(fixable);
+  };
+
+  it("registers every named header kind", () => {
+    // The registered header kinds named by the review: each must be in the table.
+    const agents = headerPromptAgents();
+    for (const named of [
+      "bkit-build-challenge-2",
+      "bkit-plan-review-2",
+      "bkit-plan-scope-check",
+      "bkit-build-plan-current",
+      "bkit-build-plan-gaps-remediate",
+      "bkit-build-plan-tasks",
+      "bkit-debug-failure-diagnose",
+      "bkit-debug-failure-reproduce",
+      "bkit-debug-failure-remediate",
+      "bkit-ship-deferred-sweep",
+    ])
+      expect(agents).toContain(named);
+  });
+
+  it("renders and verifies the header of every prompt that declares one", async () => {
+    const cwd = repo();
+    for (const agent of headerPromptAgents()) {
+      const declared = promptHeader(agent);
+      const judgments = judgmentsFor(declared);
+
+      // One fixable finding: FAIL with derived counts, and the read accepts what was rendered.
+      resultFile(cwd, `logs/${agent}.json`, { findings: [finding(1)], judgments });
+      const res = await run(cwd, stubArgs(agent, `logs/${agent}.json`, `logs/${agent}.md`));
+      expect(res.code, agent).toBe(0);
+      const fields = headerFields(header(cwd, `logs/${agent}.md`));
+      expect(fields["Verdict"], agent).toBe("FAIL");
+      expectDerived(declared, fields, agent, "1", "true");
+      for (const [k, v] of Object.entries(judgments)) expect(fields[k], `${agent} ${k}`).toBe(v);
+      expect(
+        (await run(cwd, ["steps", "verdict", `--file=logs/${agent}.md`, `--agent=${agent}`])).code,
+        agent,
+      ).toBe(0);
+
+      // No findings and complete evidence: PASS, with zero derived failures.
+      resultFile(cwd, `logs/${agent}-clean.json`, { judgments });
+      const clean = await run(
+        cwd,
+        stubArgs(agent, `logs/${agent}-clean.json`, `logs/${agent}-clean.md`),
+      );
+      expect(clean.code, agent).toBe(0);
+      const cleanFields = headerFields(header(cwd, `logs/${agent}-clean.md`));
+      expect(cleanFields["Verdict"], agent).toBe("PASS");
+      expectDerived(declared, cleanFields, agent, "0", "false");
+    }
+  });
+
+  it("retains special verdict judgments and legacy stub behavior", async () => {
+    const cwd = repo();
+
+    // An evidence-dependent verdict survives: no findings does not turn HANDOVER into PASS.
+    resultFile(cwd, "logs/h.json", { judgments: { Verdict: "HANDOVER" } });
+    expect(
+      (await run(cwd, stubArgs("bkit-build-plan-tests", "logs/h.json", "logs/h.md"))).code,
+    ).toBe(0);
+    expect(header(cwd, "logs/h.md")).toContain("Verdict: HANDOVER");
+    const read = await run(cwd, [
+      "steps",
+      "verdict",
+      "--file=logs/h.md",
+      "--agent=bkit-build-plan-tests",
+    ]);
+    expect(read.code).toBe(0);
+    expect(read.json.verdict).toBe("HANDOVER");
+
+    // A judged CONCERNS stays CONCERNS when the arithmetic alone would say PASS.
+    resultFile(cwd, "logs/c.json", {
+      judgments: { Verdict: "CONCERNS", Tasks: "none", Loosened: "none" },
+    });
+    await run(cwd, stubArgs("bkit-build-plan-verify", "logs/c.json", "logs/c.md"));
+    expect(header(cwd, "logs/c.md")).toContain("Verdict: CONCERNS");
+
+    // A judged PASS cannot contradict findings: refused, nothing written.
+    resultFile(cwd, "logs/p.json", {
+      findings: [finding(1)],
+      judgments: { Verdict: "PASS", Tasks: "none", Loosened: "none" },
+    });
+    const refused = await run(cwd, stubArgs("bkit-build-plan-verify", "logs/p.json", "logs/p.md"));
+    expect(refused.code).toBe(6);
+    expect(fs.existsSync(path.join(cwd, "logs/p.md"))).toBe(false);
+
+    // Legacy copy and strip-header output are byte-identical to before, with or without --agent.
+    write(cwd, "logs/v1.md", "# Design\n\nBody.\n");
+    await run(cwd, ["steps", "stub", "--from=logs/v1.md", "--to=logs/v2.md"]);
+    expect(fs.readFileSync(path.join(cwd, "logs/v2.md"), "utf-8")).toBe(
+      "Verdict: PENDING\n<!-- verdict:end -->\n\n# Design\n\nBody.\n",
+    );
+    await run(cwd, [
+      "steps",
+      "stub",
+      "--from=logs/verify-1.md",
+      "--to=logs/v3.md",
+      "--agent=bkit-build-plan-verify",
+      "--strip-header",
+    ]);
+    const stripped = fs.readFileSync(path.join(cwd, "logs/v3.md"), "utf-8");
+    expect(stripped.startsWith("Verdict: PENDING\n<!-- verdict:end -->\n\n")).toBe(true);
+    expect(stripped).not.toContain("Verdict: FAIL");
+    expect(stripped).toContain("# Verify");
+  });
+
+  it("derives audit IDs totals ledger payloads and coverage from one result", async () => {
+    const cwd = repo();
+    const audit = (n: string, severity: string, extra: Record<string, unknown> = {}) => ({
+      severity,
+      title: `Problem ${n}`,
+      location: `src/${n}.ts:${n.length}`,
+      ...extra,
+    });
+    const findings = [
+      audit("aa", "LOW"),
+      audit("b", "HIGH", { priorKey: "existing-token-leak" }),
+      audit("cccc", "LOW"),
+    ];
+    const base = {
+      slug: "security",
+      status: "COMPLETE",
+      report: "docs/audits/202611/security.md",
+      notChecked: ["Mobile client: no device available"],
+    };
+    write(cwd, "logs/a.json", JSON.stringify({ ...base, findings }));
+    write(cwd, "logs/b.json", JSON.stringify({ ...base, findings: [...findings].reverse() }));
+    const args = (result: string, to: string) => [
+      "steps",
+      "stub",
+      "--agent=bkit-audit-generate",
+      `--result-file=${result}`,
+      `--to=${to}`,
+    ];
+    const a = await run(cwd, args("logs/a.json", "logs/a.md"));
+    const b = await run(cwd, args("logs/b.json", "logs/b.md"));
+    expect(a.code).toBe(0);
+
+    // Totals come from the findings, in the report header; no hand-written count exists to disagree.
+    const text = fs.readFileSync(path.join(cwd, "logs/a.md"), "utf-8");
+    expect(text).toContain("Status: COMPLETE");
+    expect(text).toContain("Report: docs/audits/202611/security.md");
+    expect(text).toContain("Findings: CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 2");
+    expect(a.json.totals).toEqual({ CRITICAL: 0, HIGH: 1, MEDIUM: 0, LOW: 2 });
+
+    // IDs are report-local, stable and independent of the order the findings arrived in.
+    expect(a.json.ids).toHaveLength(3);
+    expect(new Set(a.json.ids)).toEqual(new Set(["security-1", "security-2", "security-3"]));
+    expect(fs.readFileSync(path.join(cwd, "logs/b.md"), "utf-8")).toBe(text);
+    expect(b.json.ids).toEqual(a.json.ids);
+
+    // Coverage is carried, not dropped.
+    expect(text).toContain("Mobile client: no device available");
+
+    // Ledger payloads: one per finding, the agent's explicit prior key is kept, the rest are distinct.
+    const ledger = a.json.ledgerRows as Array<Record<string, unknown>>;
+    expect(ledger).toHaveLength(3);
+    expect(ledger.map((r) => r["kind"])).toEqual(["failure", "failure", "failure"]);
+    expect(ledger.filter((r) => r["key"] === "existing-token-leak")).toHaveLength(1);
+    expect(ledger.find((r) => r["key"] === "existing-token-leak")).toMatchObject({
+      severity: "HIGH",
+    });
+    expect(new Set(ledger.map((r) => r["key"])).size).toBe(3);
+
+    // A hand-supplied count that could disagree is refused.
+    write(cwd, "logs/c.json", JSON.stringify({ ...base, findings, counts: { HIGH: 5 } }));
+    const bad = await run(cwd, args("logs/c.json", "logs/c.md"));
+    expect(bad.code).not.toBe(0);
+    expect(fs.existsSync(path.join(cwd, "logs/c.md"))).toBe(false);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index b30c86b7a..18f07cd87 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -10,6 +10,7 @@
 // headers, derive the attempt, check what the gate checks, write the row, commit,
 // and print the step's tracker comment.
 
+import { createHash } from "node:crypto";
 import * as fs from "node:fs";
 import * as path from "node:path";
 
@@ -46,9 +47,23 @@ import { activeRunStart, savedPointLimit } from "./counters.js";
 import type { AskPoint } from "../../shared/settings.js";
 import { isResumable, runProgress, WORKFLOW_STEPS } from "./step-table.js";
 import { planFiles } from "./run-facts.js";
-import { mergeFindings, parseFindings } from "./challenge.js";
+import {
+  mergeFindings,
+  parseFindings,
+  renderFindingsLog,
+  structuredFindings,
+  type Finding,
+} from "./challenge.js";
 import { fidProblem, normaliseFid, readIssueTracker } from "./fids.js";
-import { buildComment } from "./issues.js";
+import {
+  auditEntries,
+  auditFindingsLine,
+  auditLedgerRows,
+  auditTotals,
+  buildComment,
+  parseAuditResult,
+  type AuditResult,
+} from "./issues.js";
 import {
   EXIT_FOREIGN_PATH,
   activeRecord,
@@ -217,6 +232,8 @@ export function readHeader(
     const m = /^([A-Z][A-Za-z ]*):\s*(.*)$/.exec(line.trim());
     if (m && !(m[1]! in fields)) fields[m[1]!] = m[2]!.trim();
   }
+  const stale = fingerprintProblem(file, lines, end, fields);
+  if (stale !== null) return { ok: false, code: EXIT_INVALID, problem: stale };
   const pending = Object.entries(fields).filter(([, v]) => /\bPENDING\b/.test(v));
   if (pending.length > 0) {
     return {
@@ -265,6 +282,32 @@ export function readHeader(
   return { ok: true, verdict, fields };
 }
 
+/** Header field that fingerprints a generated artifact's header and body. */
+const FINGERPRINT = "Fingerprint";
+
+/** sha256 of an artifact's header (without its Fingerprint line) and everything below it. */
+export function artifactFingerprint(lines: readonly string[], end: number): string {
+  const head = lines.slice(0, end).filter((l) => !l.startsWith(`${FINGERPRINT}:`));
+  const body = lines.slice(end + 1);
+  return createHash("sha256")
+    .update(`${head.join("\n")}\n${VERDICT_END}\n${body.join("\n")}`)
+    .digest("hex");
+}
+
+/** Why a generated artifact no longer matches what the engine rendered, or null (hand-written ones carry no fingerprint). */
+function fingerprintProblem(
+  file: string,
+  lines: readonly string[],
+  end: number,
+  fields: Record<string, string>,
+): string | null {
+  const given = fields[FINGERPRINT];
+  if (given === undefined) return null;
+  return artifactFingerprint(lines, end) === given
+    ? null
+    : `${file}: stale; its header or body changed after the engine rendered it (Fingerprint mismatch) — regenerate it from the result file`;
+}
+
 /** Lines left as a stub placeholder: a bare `PENDING`, or a field whose whole value is `PENDING`. */
 export function placeholderLines(file: string): number[] {
   return fs
@@ -1482,6 +1525,186 @@ async function finish(ctx: RunContext): Promise<number> {
   return pass ? EXIT.OK : EXIT.NO;
 }
 
+// ---------------------------------------------------------------------------
+// stub --result-file — an artifact rendered from one structured result
+// ---------------------------------------------------------------------------
+
+/**
+ * Header fields the engine computes from the findings; every other declared field is a
+ * judgment the result must supply (the evidence-dependent ones: Tasks, Redesign, Strategy ...).
+ */
+const DERIVED_FIELDS: Record<string, (findings: Finding[]) => string> = {
+  Failures: (f) => String(f.length),
+  // `true` when any gap is fixable (the plan-verify header contract), `false` for none.
+  Fixable: (f) => String(f.some((x) => x.fixable)),
+};
+
+/** The agent whose header is the audit summary (Status / Report / Findings), not a Verdict header. */
+const AUDIT_AGENT = "bkit-audit-generate";
+
+export interface Rendered {
+  text: string;
+  fingerprint: string;
+  extra: Record<string, unknown>;
+}
+
+const withFingerprint = (head: string[], body: string): Rendered["text"] => {
+  const unsigned = `${head.join("\n")}\n${VERDICT_END}\n\n${body}`;
+  const lines = unsigned.split("\n");
+  const fingerprint = artifactFingerprint(lines, head.length);
+  return `${head.join("\n")}\n${FINGERPRINT}: ${fingerprint}\n${VERDICT_END}\n\n${body}`;
+};
+
+const fingerprintOf = (text: string): string =>
+  artifactFingerprint(text.split("\n"), text.split("\n").indexOf(VERDICT_END));
+
+function renderAudit(result: AuditResult): Rendered {
+  const entries = auditEntries(result);
+  const totals = auditTotals(result.findings);
+  const head = [
+    `Status: ${result.status}`,
+    `Report: ${result.report ?? "None"}`,
+    `Findings: ${auditFindingsLine(totals)}`,
+    `Issue: ${result.issue ?? "None"}`,
+    `Parent: ${result.parent ?? "None"}`,
+  ];
+  const cell = (t: string) => t.replace(/\|/g, "\\|");
+  const list = (items: string[]) => (items.length ? items.map((i) => `- ${i}`).join("\n") : "None");
+  const body = [
+    `# Audit Summary: ${result.slug}`,
+    "",
+    "## Stopped",
+    "",
+    result.stopped ?? "None",
+    "",
+    "## Overview",
+    "",
+    result.overview ?? "None",
+    "",
+    "## Suggested Issues",
+    "",
+    ...(entries.length
+      ? [
+          "| ID | Severity | Title | Location | Prior key |",
+          "| --- | --- | --- | --- | --- |",
+          ...entries.map(
+            (e) =>
+              `| ${e.id} | ${e.severity} | ${cell(e.title)} | \`${e.location}\` | ${e.priorKey ?? "none"} |`,
+          ),
+        ]
+      : ["None"]),
+    "",
+    "## Not Checked",
+    "",
+    list(result.notChecked),
+    "",
+    "## Ledger",
+    "",
+    list(entries.map((e) => `\`${e.key}\` ${e.severity} OPEN`)),
+    "",
+  ].join("\n");
+  const text = withFingerprint(head, body);
+  return {
+    text,
+    fingerprint: fingerprintOf(text),
+    extra: {
+      ids: entries.map((e) => e.id),
+      totals,
+      ledgerRows: auditLedgerRows(result),
+    },
+  };
+}
+
+/**
+ * The artifact for `agent` rendered from a structured result `{findings, judgments, body,
+ * evidenceComplete}`: counts and booleans derived from the findings, judged fields passed
+ * through and checked, a Fingerprint over the header and body. Throws a CommandError
+ * (EXIT_INVALID) and writes nothing on any disagreement.
+ */
+export function renderResult(cwd: string, agent: string, raw: unknown): Rendered {
+  const bad = (why: string) => new CommandError(EXIT_INVALID, `result: ${why}`);
+  if (agent === AUDIT_AGENT) {
+    try {
+      return renderAudit(parseAuditResult(raw));
+    } catch (err) {
+      throw err instanceof CommandError ? bad(err.message) : err;
+    }
+  }
+  if (raw === null || typeof raw !== "object" || Array.isArray(raw))
+    throw bad("must be a JSON object");
+  const r = raw as Record<string, unknown>;
+  for (const k of Object.keys(r))
+    if (!["findings", "judgments", "body", "evidenceComplete"].includes(k))
+      throw bad(`unknown field "${k}"`);
+  let findings: Finding[];
+  try {
+    findings = structuredFindings(r["findings"] ?? [], cwd);
+  } catch (err) {
+    throw err instanceof CommandError ? bad(err.message) : err;
+  }
+  const judgments = r["judgments"] ?? {};
+  if (judgments === null || typeof judgments !== "object" || Array.isArray(judgments))
+    throw bad("judgments must be an object");
+  const judged = new Map<string, string>();
+  for (const [k, v] of Object.entries(judgments)) {
+    if (typeof v !== "string" && typeof v !== "number" && typeof v !== "boolean")
+      throw bad(`judgment ${k} must be text, a number or a boolean`);
+    judged.set(k, String(v));
+  }
+  const declared = promptHeader(agent);
+  const names = new Set(["Verdict", ...declared.fields.map((f) => f.name)]);
+  for (const k of judged.keys()) {
+    if (!names.has(k)) throw bad(`judgment ${k} is not a header field of ${agent}`);
+    if (k in DERIVED_FIELDS) throw bad(`${k} is derived from the findings and cannot be supplied`);
+  }
+  const evidenceComplete = r["evidenceComplete"] !== false;
+  const arithmetic =
+    findings.length > 0
+      ? "FAIL"
+      : !evidenceComplete
+        ? declared.verdicts.includes("CONCERNS")
+          ? "CONCERNS"
+          : "FAIL"
+        : "PASS";
+  const verdict = judged.get("Verdict") ?? arithmetic;
+  if (!declared.verdicts.includes(verdict))
+    throw bad(`Verdict ${verdict} is not ${declared.verdicts.join("|")}`);
+  if (verdict === "PASS" && arithmetic !== "PASS")
+    throw bad(
+      findings.length > 0
+        ? `Verdict PASS contradicts ${findings.length} finding(s)`
+        : "Verdict PASS contradicts incomplete evidence",
+    );
+  const head = [`Verdict: ${verdict}`];
+  for (const f of declared.fields) {
+    const value = DERIVED_FIELDS[f.name]?.(findings) ?? judged.get(f.name);
+    if (value === undefined) throw bad(`${f.name} is a judgment the result must supply`);
+    if (f.values && !f.values.includes(value))
+      throw bad(`${f.name} ${value} is not ${f.values.join("|")}`);
+    if (f.integer && !/^[0-9]+$/.test(value))
+      throw bad(`${f.name} ${value} is not a non-negative integer`);
+    head.push(`${f.name}: ${value}`);
+  }
+  const given = r["body"] ?? "";
+  if (typeof given !== "string") throw bad("body must be text");
+  if (given.split("\n").includes(VERDICT_END)) throw bad(`body holds a ${VERDICT_END} line`);
+  const log =
+    findings.length > 0 && !/^## Findings Log\b/m.test(given)
+      ? `\n${renderFindingsLog(findings)}\n`
+      : "";
+  const body = `${given.replace(/\n+$/, "")}\n${log}`;
+  const text = withFingerprint(head, body.replace(/^\n+/, ""));
+  return { text, fingerprint: fingerprintOf(text), extra: { findings: findings.length } };
+}
+
+function readResult(cwd: string, file: string): unknown {
+  const abs = path.resolve(cwd, file);
+  if (!fs.existsSync(abs)) throw new CommandError(EXIT_INVALID, `result: ${file} does not exist`);
+  const parsed = parseJson(fs.readFileSync(abs, "utf-8"));
+  if (!parsed.ok) throw new CommandError(EXIT_INVALID, `result: ${file} is not JSON`);
+  return parsed.value;
+}
+
 // ---------------------------------------------------------------------------
 // stub
 // ---------------------------------------------------------------------------
@@ -1828,13 +2051,18 @@ export const stepsCommand: CommandSpec = {
           repeatable: true,
           help: "header field that must be present, e.g. Failures",
         },
+        {
+          name: "result-file",
+          type: "string",
+          help: "with --agent: also require the artifact to be the render of this result (a changed result is stale)",
+        },
       ],
       output: { verdict: "the Verdict value", fields: "every Key: value header field" },
       exitCodes: {
         [EXIT_EMPTY]: "artifact missing or empty",
         [EXIT_PENDING]: "a header field is still PENDING",
         [EXIT_INVALID]:
-          "no verdict:end line, Verdict outside the allowed set, or a required field missing — re-prompt the subagent",
+          "no verdict:end line, Verdict outside the allowed set, a required field missing, or a generated artifact whose Fingerprint no longer matches its header and body (stale) — re-prompt the subagent or regenerate it",
       },
       run: (ctx) => {
         const header = readHeader(
@@ -1846,6 +2074,27 @@ export const stepsCommand: CommandSpec = {
           ctx.log(header.problem);
           return header.code;
         }
+        if (ctx.flags.resultFile !== undefined) {
+          if (ctx.flags.agent === undefined)
+            throw new CommandError(EXIT.USAGE, "--result-file needs --agent");
+          try {
+            const rendered = renderResult(
+              ctx.cwd,
+              String(ctx.flags.agent),
+              readResult(ctx.cwd, String(ctx.flags.resultFile)),
+            );
+            if (header.fields[FINGERPRINT] !== rendered.fingerprint) {
+              ctx.log(
+                `${String(ctx.flags.file)}: stale; it is not the render of ${String(ctx.flags.resultFile)} (Fingerprint mismatch)`,
+              );
+              return EXIT_INVALID;
+            }
+          } catch (err) {
+            if (!(err instanceof CommandError) || err.code !== EXIT_INVALID) throw err;
+            ctx.log(err.message);
+            return EXIT_INVALID;
+          }
+        }
         ctx.emit({ verdict: header.verdict, fields: header.fields });
         return EXIT.OK;
       },
@@ -2029,17 +2278,68 @@ export const stepsCommand: CommandSpec = {
         "Seed a versioned artifact: copy the prior version, then put a PENDING verdict header on top.",
       use: "workflow",
       flags: [
-        { name: "from", type: "string", required: true, help: "the prior versioned artifact" },
+        { name: "from", type: "string", help: "the prior versioned artifact (copy mode)" },
         { name: "to", type: "string", required: true, help: "the artifact to create" },
+        {
+          name: "agent",
+          type: "string",
+          help: "with --result-file: the subagent whose header the result renders",
+        },
+        {
+          name: "result-file",
+          type: "string",
+          help: "render the artifact from this structured result JSON {findings, judgments, body, evidenceComplete} (audit: the audit result) instead of copying --from",
+        },
         {
           name: "strip-header",
           type: "boolean",
           help: "drop the prior version's own header (everything down to its <!-- verdict:end -->)",
         },
       ],
-      output: { file: "the artifact written", stripped: "the prior header was dropped" },
-      exitCodes: { [EXIT_EMPTY]: "--from is missing or empty" },
+      output: {
+        file: "the artifact written",
+        stripped: "the prior header was dropped (copy mode)",
+        fingerprint: "with --result-file: the Fingerprint header value",
+        ids: "audit result: the report-local finding IDs, in report order",
+        totals: "audit result: findings per severity",
+        ledgerRows:
+          "audit result: one failure ledger payload per finding, for `bkit ledgers append`",
+        findings: "other results: the finding count",
+      },
+      exitCodes: {
+        [EXIT_EMPTY]: "--from is missing or empty",
+        [EXIT_INVALID]:
+          "--result-file is unreadable or invalid, or a judgment contradicts the findings (nothing written)",
+      },
       run: (ctx) => {
+        if (ctx.flags.resultFile !== undefined) {
+          if (ctx.flags.from !== undefined)
+            throw new CommandError(EXIT.USAGE, "give --from or --result-file, not both");
+          if (ctx.flags.agent === undefined)
+            throw new CommandError(EXIT.USAGE, "--result-file needs --agent");
+          try {
+            const rendered = renderResult(
+              ctx.cwd,
+              String(ctx.flags.agent),
+              readResult(ctx.cwd, String(ctx.flags.resultFile)),
+            );
+            const to = path.resolve(ctx.cwd, String(ctx.flags.to));
+            fs.mkdirSync(path.dirname(to), { recursive: true });
+            fs.writeFileSync(to, rendered.text);
+            ctx.emit({
+              file: String(ctx.flags.to),
+              fingerprint: rendered.fingerprint,
+              ...rendered.extra,
+            });
+            return EXIT.OK;
+          } catch (err) {
+            if (!(err instanceof CommandError) || err.code !== EXIT_INVALID) throw err;
+            ctx.log(err.message);
+            return EXIT_INVALID;
+          }
+        }
+        if (ctx.flags.from === undefined)
+          throw new CommandError(EXIT.USAGE, "give --from (copy) or --result-file");
         const from = path.resolve(ctx.cwd, String(ctx.flags.from));
         if (!fs.existsSync(from) || fs.statSync(from).size === 0) {
           ctx.log(`${String(ctx.flags.from)} is missing or empty`);
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index eb54f83bb..c6b102736 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -33,6 +33,7 @@ import {
   statusTimestamp,
   type StatusEvent,
   type StatusRow,
+  withTargetLock,
 } from "../../ledgers/status.js";
 import {
   compareTs,
@@ -634,13 +635,17 @@ function carryOwnBook(
   const uncommitted = (file: string) => runRows(src, file, rec);
   const add = (file: string, lines: string[]) => {
     const to = path.join(dst, file);
-    const existing = fs.existsSync(to) ? fs.readFileSync(to, "utf-8") : "";
-    const have = new Set(textLines(existing).map((l) => l.trim()));
-    const fresh = lines.filter((l) => !have.has(l.trim()));
-    if (fresh.length === 0) return;
     fs.mkdirSync(path.dirname(to), { recursive: true });
-    const sep = existing !== "" && !existing.endsWith("\n") ? "\n" : "";
-    fs.appendFileSync(to, `${sep}${fresh.join("\n")}\n`);
+    const fresh = withTargetLock(to, () => {
+      const existing = fs.existsSync(to) ? fs.readFileSync(to, "utf-8") : "";
+      const have = new Set(textLines(existing).map((l) => l.trim()));
+      const missing = lines.filter((l) => !have.has(l.trim()));
+      if (missing.length === 0) return missing;
+      const sep = existing !== "" && !existing.endsWith("\n") ? "\n" : "";
+      fs.appendFileSync(to, `${sep}${missing.join("\n")}\n`);
+      return missing;
+    });
+    if (fresh.length === 0) return;
     carried.lines.set(file, fresh);
   };
   const listed = (specs: string[]) =>
diff --git a/.bkit/core/engine/commands/workflow/worktrees.ts b/.bkit/core/engine/commands/workflow/worktrees.ts
index 3b19afafe..b1d9cedd0 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.ts
@@ -19,7 +19,13 @@ import { createHash } from "node:crypto";
 import * as fs from "node:fs";
 import * as path from "node:path";
 
-import { actionHash, actionKey, lastRun, recordAction } from "../../ledgers/status.js";
+import {
+  actionHash,
+  actionKey,
+  lastRun,
+  recordAction,
+  withTargetLock,
+} from "../../ledgers/status.js";
 import { APPEND_LEDGERS, gitEnv } from "../../ledgers/telemetry.js";
 import { parseJson } from "../../shared/json.js";
 import { readBkitConfig } from "../../shared/settings.js";
@@ -448,8 +454,10 @@ function putJournalRowsBack(wt: string, journal: Map<string, Appended>): string
   }
   for (const [rel, a] of journal) {
     const file = path.join(wt, rel);
-    const text = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
-    fs.appendFileSync(file, `${text !== "" && !text.endsWith("\n") ? "\n" : ""}${a.rows}`);
+    withTargetLock(file, () => {
+      const text = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
+      fs.appendFileSync(file, `${text !== "" && !text.endsWith("\n") ? "\n" : ""}${a.rows}`);
+    });
   }
   return "";
 }
diff --git a/.bkit/core/engine/ledgers/journal.integration.test.ts b/.bkit/core/engine/ledgers/journal.integration.test.ts
index 532fb6ac9..04005dc7b 100644
--- a/.bkit/core/engine/ledgers/journal.integration.test.ts
+++ b/.bkit/core/engine/ledgers/journal.integration.test.ts
@@ -6,7 +6,7 @@
 // from a worktree resolves to the main checkout, a different inode), nothing in the main
 // checkout's, and nothing at all when no run is active in the cwd.
 
-import { spawnSync } from "node:child_process";
+import { spawn, spawnSync } from "node:child_process";
 import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
@@ -16,7 +16,7 @@ import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
 import { INVOCATION_FLAG, runCommand, type CommandSpec } from "../commands/lib";
 import { COMMANDS } from "../commands/registry";
 import { branchesCommand } from "../commands/workflow/branches";
-import { ledgersCommand } from "../commands/workflow/ledgers";
+import { appendLedgerRows, ledgersCommand } from "../commands/workflow/ledgers";
 
 const FID = "901-journal";
 const STATUS_REL = path.join("docs", "plans", "202610", "logs", FID, "status.jsonl");
@@ -538,3 +538,312 @@ describe("canonical ledger reads on real files", () => {
     expect(porcelain()).toBe(before);
   });
 });
+
+describe("replay-safe ledger appends on real files", () => {
+  const roots: string[] = [];
+  afterEach(() => {
+    for (const d of roots.splice(0)) fs.rmSync(d, { recursive: true, force: true });
+  });
+  const bookRoot = (): string => {
+    const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-op-int-")));
+    roots.push(d);
+    git(d, ["init", "-q", "-b", "dev"]);
+    return d;
+  };
+  const failureRow = (o: Record<string, unknown> = {}) => ({
+    kind: "failure",
+    by: { workflow: "build", step: "build-challenge" },
+    key: "parser-drops-last-line",
+    summary: "parser drops the last line",
+    severity: "HIGH",
+    status: "OPEN",
+    ...o,
+  });
+
+  const failAt = (point: string) => (name: string) => {
+    if (name === point) throw new Error("response lost");
+  };
+
+  it("reconciles lost append response at each durable checkpoint without duplicate rows", () => {
+    for (const checkpoint of ["prepared", "written", "receipted"] as const) {
+      const root = bookRoot();
+      const file = path.join(root, "docs", "failures.jsonl");
+      const operation = `op-${checkpoint}`;
+
+      // The response is lost at this checkpoint: the caller sees a failure, whatever is on disk.
+      expect(() =>
+        appendLedgerRows(root, "failures", [failureRow()], undefined, {
+          operation,
+          checkpoint: failAt(checkpoint),
+        }),
+      ).toThrow();
+
+      // The same operation again reconciles to the one effect and never appends a second row.
+      const replay = appendLedgerRows(root, "failures", [failureRow()], undefined, { operation });
+      const written = rows(file);
+      expect(written).toHaveLength(1);
+      expect(replay.receipt).toMatchObject({
+        operation,
+        offset: 0,
+        bytes: fs.statSync(file).size,
+        rows: [{ key: "parser-drops-last-line", ts: written[0]!["ts"] }],
+      });
+
+      // A further replay is a pure read: same receipt, same bytes.
+      const bytes = fs.readFileSync(file, "utf-8");
+      const again = appendLedgerRows(root, "failures", [failureRow()], undefined, { operation });
+      expect(again.appended).toBe(0);
+      expect(again.receipt).toMatchObject({ rows: replay.receipt!.rows, replayed: true });
+      expect(fs.readFileSync(file, "utf-8")).toBe(bytes);
+    }
+  });
+
+  // One writer process: pauses after preparing its append when `ready` is set, until `release` exists.
+  const WRITER = `
+    const j = await import(process.argv[1]);
+    const fs = await import("node:fs");
+    const [, , book, ready, release, workflow, reason] = process.argv;
+    const row = j.pauseFrictionRow({ workflow, reason, bookRoot: book });
+    const res = j.appendFrictionRow(book, row, {
+      checkpoint: (name) => {
+        if (name !== "prepared" || ready === "-") return;
+        fs.writeFileSync(ready, "1");
+        while (!fs.existsSync(release)) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20);
+      },
+    });
+    console.log(JSON.stringify(res));
+  `;
+  const JOURNAL = path.resolve(__dirname, "journal.ts");
+
+  function writer(book: string, ready: string, release: string, workflow: string, reason: string) {
+    return new Promise<{ code: number | null; result: Record<string, any> }>((resolve) => {
+      const child = spawn(
+        process.execPath,
+        [
+          "--import",
+          "tsx",
+          "--input-type=module",
+          "-e",
+          WRITER,
+          JOURNAL,
+          book,
+          ready,
+          release,
+          workflow,
+          reason,
+        ],
+        { cwd: __dirname, stdio: ["ignore", "pipe", "pipe"] },
+      );
+      let out = "";
+      child.stdout.on("data", (t) => (out += String(t)));
+      child.on("close", (code) => {
+        const last = out.trim().split("\n").at(-1) ?? "{}";
+        resolve({ code, result: JSON.parse(last) as Record<string, any> });
+      });
+    });
+  }
+  const until = async (file: string) => {
+    for (let i = 0; i < 1000 && !fs.existsSync(file); i += 1)
+      await new Promise((r) => setTimeout(r, 20));
+    expect(fs.existsSync(file)).toBe(true);
+  };
+
+  it("serializes concurrent append operations and blocks partial uncertain ledger writes", async () => {
+    // Two real processes: the first pauses after preparing its append, the second writes meanwhile.
+    for (const [second, sameKey] of [
+      [["build", "same"], true],
+      [["debug", "other"], false],
+    ] as const) {
+      const book = bookRoot();
+      const file = path.join(book, ".bkit", "friction.jsonl");
+      const ready = path.join(book, "ready");
+      const release = path.join(book, "release");
+      const first = writer(book, ready, release, "build", "same");
+      await until(ready);
+      const other = writer(book, "-", release, second[0], second[1]);
+      await new Promise((r) => setTimeout(r, 800));
+      fs.writeFileSync(release, "1");
+      const [a, b] = await Promise.all([first, other]);
+
+      // The paused writer prepared against an empty ledger, so its row is first at offset 0.
+      expect(a.result["ok"]).toBe(true);
+      const text = fs.readFileSync(file, "utf-8");
+      expect(text.endsWith("\n")).toBe(true);
+      const written = rows(file);
+      const okCount = [a, b].filter((w) => w.result["ok"] === true).length;
+      expect(written).toHaveLength(okCount);
+      // The second either serialised behind the first or visibly refused; it never tore or reordered a row.
+      const outcome = ({ true: "written", false: "refused" } as const)[
+        String(b.result["ok"] === true) as "true" | "false"
+      ];
+      expect({ written: undefined, refused: "string" }[outcome]).toBe(
+        { written: undefined, refused: typeof b.result["error"] }[outcome],
+      );
+      const sizes = text
+        .split("\n")
+        .filter((l) => l !== "")
+        .map((l) => Buffer.byteLength(`${l}\n`));
+      expect(a.result["receipt"]).toMatchObject({ offset: 0, bytes: sizes[0] });
+      expect(b.result["receipt"]?.offset).toBe({ written: sizes[0], refused: undefined }[outcome]);
+      expect(b.result["receipt"]?.bytes).toBe({ written: sizes[1], refused: undefined }[outcome]);
+      expect(written.map((r) => r["recurrenceCount"])).toEqual(
+        {
+          written: { true: [1, 2], false: [1, 1] }[String(sameKey) as "true" | "false"],
+          refused: [1],
+        }[outcome],
+      );
+      const lastRow = written.at(-1)!;
+      expect(lastRow["lastConfirmed"]).toBe(
+        {
+          written: { true: lastRow["ts"], false: undefined }[String(sameKey) as "true" | "false"],
+          refused: undefined,
+        }[outcome],
+      );
+      expect(written.map((r) => r["ts"] as number)).toEqual(
+        written.map((r) => r["ts"] as number).sort((x, y) => x - y),
+      );
+    }
+
+    // A response lost with the bytes written but not all durable is uncertain: it blocks, and truncates nothing.
+    const root = bookRoot();
+    const file = path.join(root, "docs", "failures.jsonl");
+    expect(() =>
+      appendLedgerRows(root, "failures", [failureRow()], undefined, {
+        operation: "op-torn",
+        checkpoint: failAt("written"),
+      }),
+    ).toThrow();
+    const full = fs.readFileSync(file);
+    fs.writeFileSync(file, full.subarray(0, full.length - 15));
+    const torn = fs.readFileSync(file);
+    expect(() =>
+      appendLedgerRows(root, "failures", [failureRow()], undefined, { operation: "op-torn" }),
+    ).toThrow(/uncertain/i);
+    expect(fs.readFileSync(file).equals(torn)).toBe(true);
+
+    // Compact refuses to rewrite a ledger while an operation on it has bytes without a receipt.
+    const pending = bookRoot();
+    const pendingFile = path.join(pending, "docs", "failures.jsonl");
+    expect(() =>
+      appendLedgerRows(pending, "failures", [failureRow()], undefined, {
+        operation: "op-pending",
+        checkpoint: failAt("written"),
+      }),
+    ).toThrow();
+    const before = fs.readFileSync(pendingFile, "utf-8");
+    const compacted = await call(
+      pending,
+      [ledgersCommand],
+      ["ledgers", "compact", `--root=${pending}`, "--ledger=failures"],
+    );
+    expect(compacted.code).not.toBe(0);
+    expect(fs.readFileSync(pendingFile, "utf-8")).toBe(before);
+    // Replaying the operation completes its receipt without a second row, and then compact may run.
+    const done = appendLedgerRows(pending, "failures", [failureRow()], undefined, {
+      operation: "op-pending",
+    });
+    expect(done.receipt).toMatchObject({ offset: 0, rows: [{ key: "parser-drops-last-line" }] });
+    expect(rows(pendingFile)).toHaveLength(1);
+    expect(
+      (
+        await call(
+          pending,
+          [ledgersCommand],
+          ["ledgers", "compact", `--root=${pending}`, "--ledger=failures"],
+        )
+      ).code,
+    ).toBe(0);
+  });
+
+  it("keeps rendered audit report appended rows and tracker draft counts identical", async () => {
+    // A runless audit: a fresh checkout with no status file, run or FID.
+    const repo = bookRoot();
+    fs.writeFileSync(path.join(repo, "README.md"), "x\n");
+    git(repo, ["add", "."]);
+    git(repo, ["commit", "-q", "-m", "init"]);
+    const inv = await call(repo, COMMANDS, [
+      "status",
+      "invocation",
+      "--standalone=audit",
+      "--name=security",
+    ]);
+    expect(inv.code).toBe(0);
+    const invocation = inv.json!["invocation"] as string;
+
+    const result = {
+      slug: "security",
+      status: "COMPLETE",
+      report: "docs/audits/202611/security.md",
+      findings: [
+        { severity: "HIGH", title: "Token logged", location: "src/a.ts:10" },
+        { severity: "LOW", title: "Verbose error", location: "src/b.ts:2" },
+        { severity: "LOW", title: "Old cipher", location: "src/c.ts:7" },
+      ],
+      notChecked: ["Mobile client: no device available"],
+    };
+    fs.writeFileSync(path.join(repo, "result.json"), JSON.stringify(result));
+    const totals = "CRITICAL 0 \u00b7 HIGH 1 \u00b7 MEDIUM 0 \u00b7 LOW 2";
+
+    // 1. The report header and ledger payloads come from the one result.
+    const stub = await call(repo, COMMANDS, [
+      "steps",
+      "stub",
+      "--agent=bkit-audit-generate",
+      "--result-file=result.json",
+      "--to=docs/audits/202611/security-summary.md",
+    ]);
+    expect(stub.code).toBe(0);
+    const summary = fs.readFileSync(
+      path.join(repo, "docs/audits/202611/security-summary.md"),
+      "utf-8",
+    );
+    expect(summary).toContain(`Findings: ${totals}`);
+
+    // 2. The same payloads append once under one operation, with the standalone invocation.
+    const payload = (stub.json!["ledgerRows"] as Array<Record<string, unknown>>).map(
+      ({ by: _by, ...row }) => row,
+    );
+    fs.writeFileSync(path.join(repo, "rows.json"), JSON.stringify(payload));
+    const appendArgs = [
+      "ledgers",
+      "append",
+      `--root=${repo}`,
+      "--ledger=failures",
+      `--rows=${path.join(repo, "rows.json")}`,
+      `--invocation=${invocation}`,
+      "--operation=audit-security-1",
+    ];
+    const appended = await call(repo, [ledgersCommand], appendArgs);
+    expect(appended.code).toBe(0);
+    const persisted = rows(path.join(repo, "docs", "failures.jsonl"));
+    expect(persisted).toHaveLength(3);
+
+    // 3. The tracker draft is rendered from the same result.
+    const draft = await call(repo, COMMANDS, [
+      "issues",
+      "comment",
+      "--kind=audit",
+      "--audit-slug=security",
+      "--result-file=result.json",
+    ]);
+    expect(draft.code).toBe(0);
+    expect(draft.json!["comment"]).toContain(`Findings: ${totals}`);
+
+    // The three surfaces agree: header, persisted rows and draft.
+    const bySeverity = (sev: string) => persisted.filter((r) => r["severity"] === sev).length;
+    expect(
+      `CRITICAL ${bySeverity("CRITICAL")} \u00b7 HIGH ${bySeverity("HIGH")} \u00b7 MEDIUM ${bySeverity("MEDIUM")} \u00b7 LOW ${bySeverity("LOW")}`,
+    ).toBe(totals);
+
+    // 4. Replaying the publication appends nothing and returns the original receipt.
+    const before = fs.readFileSync(path.join(repo, "docs", "failures.jsonl"), "utf-8");
+    const replay = await call(repo, [ledgersCommand], appendArgs);
+    expect(replay.code).toBe(0);
+    expect(replay.json!["receipt"]).toMatchObject({
+      replayed: true,
+      operation: "audit-security-1",
+    });
+    expect(fs.readFileSync(path.join(repo, "docs", "failures.jsonl"), "utf-8")).toBe(before);
+    expect(fs.existsSync(path.join(repo, "docs", "plans"))).toBe(false);
+  });
+});
diff --git a/.bkit/core/engine/ledgers/journal.test.ts b/.bkit/core/engine/ledgers/journal.test.ts
index 439d664b5..0e3365acf 100644
--- a/.bkit/core/engine/ledgers/journal.test.ts
+++ b/.bkit/core/engine/ledgers/journal.test.ts
@@ -99,7 +99,10 @@ describe("frictionRow", () => {
     const row = own(root, { parentSha: "" });
     expect(row).not.toHaveProperty("run");
     expect(validate(row)).toEqual({ ok: true });
-    expect(appendFrictionRow(root, row)).toEqual({ ok: true });
+    expect(appendFrictionRow(root, row)).toMatchObject({
+      ok: true,
+      receipt: { offset: expect.any(Number), bytes: expect.any(Number) },
+    });
     const line = fs.readFileSync(path.join(root, ".bkit", "friction.jsonl"), "utf-8");
     expect(JSON.parse(line)).not.toHaveProperty("run");
     expect(own(root)["run"]).toEqual({ parentSha: "a".repeat(40) });
@@ -128,7 +131,7 @@ describe("pauseFrictionRow", () => {
     });
     expect(validate(row)).toEqual({ ok: true });
     expect(writerProblem(row)).toBeUndefined();
-    expect(appendFrictionRow(root, row)).toEqual({ ok: true });
+    expect(appendFrictionRow(root, row)).toMatchObject({ ok: true });
     const line = fs.readFileSync(path.join(root, ".bkit", "friction.jsonl"), "utf-8");
     expect(JSON.parse(line)).toMatchObject({
       key: "owner-pause/build.decision",
@@ -157,11 +160,11 @@ describe("appendFrictionRow", () => {
   it("records a recurrence as an appended same-key row, and folds to the raised count", () => {
     const root = tmp();
     const first = own(root);
-    expect(appendFrictionRow(root, first)).toEqual({ ok: true });
+    expect(appendFrictionRow(root, first)).toMatchObject({ ok: true });
     const written = lines(root)[0];
-    expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });
-    expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });
-    expect(appendFrictionRow(root, own(root, { step: "build-other" }))).toEqual({ ok: true });
+    expect(appendFrictionRow(root, own(root))).toMatchObject({ ok: true });
+    expect(appendFrictionRow(root, own(root))).toMatchObject({ ok: true });
+    expect(appendFrictionRow(root, own(root, { step: "build-other" }))).toMatchObject({ ok: true });
 
     const raw = lines(root);
     expect(raw).toHaveLength(4);
@@ -186,11 +189,11 @@ describe("appendFrictionRow", () => {
     ] as const) {
       const root = tmp();
       const first = own(root);
-      expect(appendFrictionRow(root, first)).toEqual({ ok: true });
+      expect(appendFrictionRow(root, first)).toMatchObject({ ok: true });
       const winner = JSON.parse(lines(root)[0]!) as Record<string, unknown>;
       const ts = (winner["ts"] as number) + 1;
       fs.appendFileSync(ledger(root), `${JSON.stringify({ ...winner, ts, status: triaged })}\n`);
-      expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });
+      expect(appendFrictionRow(root, own(root))).toMatchObject({ ok: true });
       const last = JSON.parse(lines(root).at(-1)!) as Record<string, unknown>;
       expect(last).toMatchObject({ key: first["key"], status: reopened, recurrenceCount: 2 });
     }
@@ -204,22 +207,23 @@ describe("appendFrictionRow", () => {
       ledger(root),
       `${JSON.stringify({ ...first, recurrenceCount: 4 }, null, 1).replace(/\n\s*/g, " ")}\n`,
     );
-    expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });
+    expect(appendFrictionRow(root, own(root))).toMatchObject({ ok: true });
     expect(JSON.parse(lines(root).at(-1)!)).toMatchObject({ recurrenceCount: 5 });
   });
 
-  it("keeps a row another writer appends while a recurrence is recorded", () => {
+  it("keeps a row another writer appends while a recurrence is recorded, and reports the refusal", () => {
     const root = tmp();
-    expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });
+    expect(appendFrictionRow(root, own(root))).toMatchObject({ ok: true });
     const foreign = JSON.stringify(own(root, { step: "build-foreign" }));
     readHook.file = ledger(root);
     readHook.after = () => fs.appendFileSync(ledger(root), `${foreign}\n`);
-    expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });
+    const result = appendFrictionRow(root, own(root));
+    expect(result).toMatchObject({ ok: false });
+    expect(JSON.stringify(result)).toContain("changed since the append was prepared");
     expect(readHook.after).toBeUndefined();
     const raw = lines(root);
     expect(raw).toContain(foreign);
-    expect(raw).toHaveLength(3);
-    expect(JSON.parse(raw[2]!)).toMatchObject({ recurrenceCount: 2 });
+    expect(raw).toHaveLength(2);
   });
 
   it("returns a failed result instead of throwing when the row is refused", () => {
diff --git a/.bkit/core/engine/ledgers/journal.ts b/.bkit/core/engine/ledgers/journal.ts
index c373c1493..ef7e5cb7d 100644
--- a/.bkit/core/engine/ledgers/journal.ts
+++ b/.bkit/core/engine/ledgers/journal.ts
@@ -17,7 +17,7 @@ import * as fs from "node:fs";
 import * as path from "node:path";
 
 import { parseJson } from "../shared/json.js";
-import { appendLine, statusTimestamp } from "./status.js";
+import { appendLine, appendLocked, statusTimestamp, type AppendCheckpoint } from "./status.js";
 import {
   APPEND_LEDGERS,
   SCHEMA,
@@ -28,7 +28,8 @@ import {
   writerProblem,
 } from "./telemetry.js";
 
-export type JournalResult = { ok: true } | { ok: false; error: string };
+export type JournalResult =
+  { ok: true; receipt?: { offset: number; bytes: number } } | { ok: false; error: string };
 
 /** The kill switch: `BKIT_ENGINE_JOURNAL=off` keeps the seam from writing any row. */
 export function journalEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
@@ -225,22 +226,29 @@ export function appendJournalRow(file: string, row: EngineCallRow): JournalResul
  * `recurrenceCount` raised by one and `lastConfirmed` = that `ts`. No line is
  * ever rewritten, so a row another writer appends meanwhile is kept.
  */
-export function appendFrictionRow(bookRoot: string, row: Record<string, unknown>): JournalResult {
+export function appendFrictionRow(
+  bookRoot: string,
+  row: Record<string, unknown>,
+  options: { checkpoint?: AppendCheckpoint } = {},
+): JournalResult {
   const checked = validate(row);
   if (!checked.ok) return { ok: false, error: checked.reason ?? "invalid friction row" };
   const who = writerProblem(row);
   if (who !== undefined) return { ok: false, error: who };
   const file = path.join(bookRoot, APPEND_LEDGERS.friction.file);
   try {
-    fs.mkdirSync(path.dirname(file), { recursive: true });
-    const text = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
-    const prior = latestSameKey(text, row["key"]);
-    const next = prior === undefined ? { ...row, recurrenceCount: 1 } : recurrence(prior, row);
-    fs.appendFileSync(
+    // The recurrence is computed from the text read under the target lock, so a
+    // competing writer can never invalidate the prepared offset or count.
+    const landed = appendLocked(
       file,
-      `${text !== "" && !text.endsWith("\n") ? "\n" : ""}${JSON.stringify(next)}\n`,
+      (text) => {
+        const prior = latestSameKey(text, row["key"]);
+        const next = prior === undefined ? { ...row, recurrenceCount: 1 } : recurrence(prior, row);
+        return `${JSON.stringify(next)}\n`;
+      },
+      { checkpoint: options.checkpoint },
     );
-    return { ok: true };
+    return { ok: true, receipt: { offset: landed.offset, bytes: landed.bytes } };
   } catch (err) {
     return { ok: false, error: (err as Error).message };
   }
diff --git a/.bkit/core/engine/ledgers/migrate.test.ts b/.bkit/core/engine/ledgers/migrate.test.ts
index ce5b63afa..a60595aaa 100644
--- a/.bkit/core/engine/ledgers/migrate.test.ts
+++ b/.bkit/core/engine/ledgers/migrate.test.ts
@@ -115,6 +115,19 @@ describe("migrateLedgers", () => {
     expect(fs.readdirSync(path.join(root, ".bkit"))).toEqual(["stats.jsonl"]);
   });
 
+  it("refuses to rewrite a ledger holding a pending operation's prepared bytes", () => {
+    const file = path.join(root, "docs/deferrals.jsonl");
+    const before = `${line(OLD_DEFERRAL)}\n`;
+    fs.writeFileSync(file, before);
+    fs.writeFileSync(
+      path.join(root, ".bkit/ledger-operations.jsonl"),
+      `${JSON.stringify({ type: "ledger-intent", operation: "op-1", hash: "h", file: "docs/deferrals.jsonl", offset: 0, bytes: 1, block: "x", at: "t" })}\n`,
+    );
+    expect(() => migrateLedgers(root, false)).toThrow(/op-1/);
+    expect(fs.readFileSync(file, "utf-8")).toBe(before);
+    expect(fs.existsSync(`${file}.bkit-lock`)).toBe(false);
+  });
+
   it("dry run counts without writing", () => {
     const file = path.join(root, "docs/failures.jsonl");
     const before = `${line({ ...OLD_DEFERRAL, kind: "failure", reason: undefined })}\n`;
diff --git a/.bkit/core/engine/ledgers/migrate.ts b/.bkit/core/engine/ledgers/migrate.ts
index 9e6bdbb25..1317cb711 100644
--- a/.bkit/core/engine/ledgers/migrate.ts
+++ b/.bkit/core/engine/ledgers/migrate.ts
@@ -9,6 +9,7 @@ import * as fs from "node:fs";
 import * as path from "node:path";
 
 import { parseJson } from "../shared/json.js";
+import { LEDGER_OPERATIONS_FILE, pendingLedgerIntents, withTargetLock } from "./status.js";
 import { normalize } from "./telemetry.js";
 
 /** Every repo ledger whose rows carry the shared top section (`.bkit/jsonl.md`). */
@@ -79,14 +80,25 @@ export function migrateLedgers(
   for (const file of SCHEMA_LEDGERS) {
     const abs = path.join(root, file);
     if (!fs.lstatSync(abs, { throwIfNoEntry: false })?.isFile()) continue;
-    const { text, rewritten, dropped } = migrateLedgerText(fs.readFileSync(abs, "utf-8"));
-    if (rewritten + dropped === 0) continue;
-    if (!dryRun) {
-      const tmp = `${abs}.bkit-migrate.tmp`;
-      fs.writeFileSync(tmp, text, "utf-8");
-      fs.renameSync(tmp, abs);
-    }
-    out.push({ file, rewritten, dropped });
+    const migrate = () => {
+      const { text, rewritten, dropped } = migrateLedgerText(fs.readFileSync(abs, "utf-8"));
+      if (rewritten + dropped === 0) return undefined;
+      if (!dryRun) {
+        // A pending ledger operation holds an offset into the current bytes: refuse to move them.
+        const pending = pendingLedgerIntents(path.join(root, LEDGER_OPERATIONS_FILE), file);
+        if (pending.length > 0)
+          throw new Error(
+            `${file} has ledger operation(s) with bytes but no receipt (${pending.map((p) => p.operation).join(", ")}); replay them before migrating`,
+          );
+        const tmp = `${abs}.bkit-migrate.tmp`;
+        fs.writeFileSync(tmp, text, "utf-8");
+        fs.renameSync(tmp, abs);
+      }
+      return { file, rewritten, dropped };
+    };
+    // Read and rewrite under the target lock, so a row appended meanwhile is never dropped.
+    const done = dryRun ? migrate() : withTargetLock(abs, migrate);
+    if (done !== undefined) out.push(done);
   }
   return out;
 }
diff --git a/.bkit/core/engine/ledgers/status.test.ts b/.bkit/core/engine/ledgers/status.test.ts
index 5445c6097..443006cc9 100644
--- a/.bkit/core/engine/ledgers/status.test.ts
+++ b/.bkit/core/engine/ledgers/status.test.ts
@@ -12,7 +12,9 @@ import {
   alreadyDone,
   appendLine,
   fold,
+  ledgerOperation,
   recordAction,
+  recordLedgerOperation,
   validateCiSelection,
   ciSelectionIdentity,
 } from "./status";
@@ -278,3 +280,63 @@ describe("engine-action rows", () => {
     ]);
   });
 });
+
+describe("ledger operation receipts", () => {
+  const tmpFile = () =>
+    path.join(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ledger-op-")), "logs", "status.jsonl");
+
+  it("preserves tracker changed-hash actions while rejecting ledger operation collisions", () => {
+    const file = tmpFile();
+
+    // Tracker contract: the same key with a changed hash is a deliberate edit and acts again.
+    const key = actionKey("tracker", "comment", "run-1");
+    const v1 = recordAction(file, {
+      action: "comment",
+      key,
+      hash: actionHash("v1"),
+      ref: "https://c/1",
+    });
+    expect(alreadyDone(file, key, actionHash("v1"))).toEqual(v1);
+    expect(alreadyDone(file, key, actionHash("v2"))).toBeUndefined();
+    const v2 = recordAction(file, {
+      action: "comment",
+      key,
+      hash: actionHash("v2"),
+      ref: "https://c/2",
+    });
+    expect(alreadyDone(file, key, actionHash("v2"))).toEqual(v2);
+    expect(alreadyDone(file, key, actionHash("v1"))).toEqual(v1);
+
+    // Ledger contract: one operation id, one request hash.
+    const h1 = actionHash("request-1");
+    const h2 = actionHash("request-2");
+    expect(ledgerOperation(file, "op-1", h1)).toEqual({ state: "new" });
+    const receipt = recordLedgerOperation(file, {
+      operation: "op-1",
+      hash: h1,
+      ref: "docs/failures.jsonl@0+120",
+    });
+    expect(receipt).toMatchObject({
+      type: "engine-action",
+      hash: h1,
+      ref: "docs/failures.jsonl@0+120",
+    });
+    expect(ledgerOperation(file, "op-1", h1)).toEqual({ state: "replay", row: receipt });
+    expect(ledgerOperation(file, "op-1", h2)).toEqual({ state: "conflict", row: receipt });
+    // A new operation with the same request hash is a new effect, not a replay.
+    expect(ledgerOperation(file, "op-2", h1)).toEqual({ state: "new" });
+
+    // Recording a conflicting hash for a known operation is refused and writes nothing.
+    const before = fs.readFileSync(file, "utf-8");
+    expect(() => recordLedgerOperation(file, { operation: "op-1", hash: h2, ref: null })).toThrow();
+    expect(fs.readFileSync(file, "utf-8")).toBe(before);
+
+    // The generic action policy is untouched: the ledger row's own key still accepts a changed hash there.
+    expect(() =>
+      recordAction(file, { action: "comment", key: receipt.key, hash: h2, ref: null }),
+    ).not.toThrow();
+
+    // The fold ignores every one of these rows.
+    expect(fold(readStatusEvents(file))).toEqual([]);
+  });
+});
diff --git a/.bkit/core/engine/ledgers/status.ts b/.bkit/core/engine/ledgers/status.ts
index 697bc0a7f..041a09125 100644
--- a/.bkit/core/engine/ledgers/status.ts
+++ b/.bkit/core/engine/ledgers/status.ts
@@ -500,6 +500,239 @@ export function recordAction(
   return row;
 }
 
+// ---------------------------------------------------------------------------
+// Ledger operations — a bookkeeping write that must survive a lost response. One
+// operation id names one request (its hash): the same id and hash replays the
+// original receipt, the same id with another hash is refused, and a new id on the
+// same ledger key is a deliberate later update. This is stricter than the generic
+// action policy above, where the same key with a changed hash acts again.
+// ---------------------------------------------------------------------------
+
+/** The operations store, relative to a book root; `.bkit/*.jsonl` is allow-listed and unioned. */
+export const LEDGER_OPERATIONS_FILE = path.join(".bkit", "ledger-operations.jsonl");
+
+const ledgerOpKey = (operation: string) => actionKey("ledger-op", operation);
+
+export type LedgerOperationState =
+  { state: "new" } | { state: "replay" | "conflict"; row: EngineActionRow };
+
+/** Where `operation` stands in `file`: unseen, done with this request, or used for another. */
+export function ledgerOperation(
+  file: string,
+  operation: string,
+  hash: string,
+): LedgerOperationState {
+  const known = engineActions(file)
+    .filter((r) => r.key === ledgerOpKey(operation))
+    .at(0);
+  if (known === undefined) return { state: "new" };
+  return { state: known.hash === hash ? "replay" : "conflict", row: known };
+}
+
+/**
+ * Record the receipt of a finished ledger operation. A known operation with the same
+ * hash returns its original row unchanged; one with another hash throws and writes nothing.
+ * `detail` rides on the row so a replay can return the original effect.
+ */
+export function recordLedgerOperation(
+  file: string,
+  a: { operation: string; hash: string; ref: string | null; detail?: Record<string, unknown> },
+): EngineActionRow {
+  const known = ledgerOperation(file, a.operation, a.hash);
+  if (known.state === "conflict")
+    throw new Error(`ledger operation ${a.operation} was already used for a different request`);
+  if (known.state === "replay") return known.row;
+  const row = {
+    ...recordRow({
+      action: "ledger-append",
+      key: ledgerOpKey(a.operation),
+      hash: a.hash,
+      ref: a.ref,
+    }),
+    ...(a.detail === undefined ? {} : { detail: a.detail }),
+  };
+  fs.mkdirSync(path.dirname(file), { recursive: true });
+  fs.appendFileSync(file, appendLine(row));
+  return row;
+}
+
+const recordRow = (a: {
+  action: string;
+  key: string;
+  hash: string;
+  ref: string | null;
+}): EngineActionRow => ({ type: ENGINE_ACTION, ...a, at: statusTimestamp() });
+
+/** The exact bytes an operation prepared, written before the target is touched. */
+export type LedgerIntent = {
+  type: "ledger-intent";
+  operation: string;
+  hash: string;
+  /** Target path relative to the book root. */
+  file: string;
+  offset: number;
+  bytes: number;
+  block: string;
+  at: string;
+};
+
+function intentRows(file: string): LedgerIntent[] {
+  if (!fs.existsSync(file)) return [];
+  const out: LedgerIntent[] = [];
+  for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
+    if (line.trim() === "") continue;
+    const parsed = parseJson(line);
+    if (!parsed.ok) continue;
+    const r = parsed.value as Partial<LedgerIntent> | null;
+    if (r?.type === "ledger-intent" && typeof r.operation === "string") out.push(r as LedgerIntent);
+  }
+  return out;
+}
+
+/** Record the prepared bytes of an operation before writing them. */
+export function recordLedgerIntent(file: string, intent: Omit<LedgerIntent, "type" | "at">): void {
+  fs.mkdirSync(path.dirname(file), { recursive: true });
+  const row: LedgerIntent = { type: "ledger-intent", ...intent, at: statusTimestamp() };
+  fs.appendFileSync(file, `${JSON.stringify(row)}\n`);
+}
+
+/** The latest prepared intent of `operation`, or undefined. */
+export function ledgerIntent(file: string, operation: string): LedgerIntent | undefined {
+  return intentRows(file)
+    .filter((i) => i.operation === operation)
+    .at(-1);
+}
+
+/** Intents on `target` (relative path) whose operation has no receipt: effects not yet confirmed. */
+export function pendingLedgerIntents(file: string, target: string): LedgerIntent[] {
+  const receipted = new Set(engineActions(file).map((r) => r.key));
+  const latest = new Map<string, LedgerIntent>();
+  for (const i of intentRows(file)) latest.set(i.operation, i);
+  return [...latest.values()].filter(
+    (i) => i.file === target && !receipted.has(ledgerOpKey(i.operation)),
+  );
+}
+
+/** Create `file` holding `content` only if absent; false when it exists. Other errors throw. */
+export function createExclusive(file: string, content: string): boolean {
+  let fd: number;
+  try {
+    fd = fs.openSync(file, "wx");
+  } catch (err) {
+    // EEXIST is the expected "someone holds it" answer; anything else is a real error.
+    if ((err as NodeJS.ErrnoException).code === "EEXIST") return false;
+    throw err;
+  }
+  try {
+    fs.writeSync(fd, content);
+  } finally {
+    fs.closeSync(fd);
+  }
+  return true;
+}
+
+const sleepSync = (ms: number) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
+
+/** How long a writer waits for another writer's lock on a ledger before refusing. */
+export const TARGET_LOCK_WAIT_MS = 10_000;
+
+/**
+ * Run `fn` holding the exclusive lock on `target` (`<target>.bkit-lock`). A holder that
+ * does not release in time is never reclaimed: the call throws, naming the lock file.
+ */
+export function withTargetLock<T>(target: string, fn: () => T, waitMs = TARGET_LOCK_WAIT_MS): T {
+  const lock = `${target}.bkit-lock`;
+  const token = `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
+  fs.mkdirSync(path.dirname(lock), { recursive: true });
+  const body = JSON.stringify({ pid: process.pid, at: statusTimestamp(), token });
+  const deadline = Date.now() + waitMs;
+  while (!createExclusive(lock, body)) {
+    if (Date.now() >= deadline) {
+      const holder = fs.existsSync(lock) ? fs.readFileSync(lock, "utf-8").trim() : "unknown";
+      throw new Error(
+        `ledger target ${target} is locked by another writer (${holder}); if that process is gone, remove ${lock}`,
+      );
+    }
+    sleepSync(20);
+  }
+  try {
+    return fn();
+  } finally {
+    const held = fs.existsSync(lock) ? fs.readFileSync(lock, "utf-8") : "";
+    if (held === body) fs.rmSync(lock, { force: true });
+  }
+}
+
+/** Append `block` to `target` at exactly `offset`, flush it and read it back; throws on any mismatch. */
+export function writePrepared(target: string, block: string, offset: number): void {
+  const size = fs.existsSync(target) ? fs.statSync(target).size : 0;
+  if (size !== offset)
+    throw new Error(
+      `ledger ${target} changed since the append was prepared (${size} != ${offset})`,
+    );
+  fs.mkdirSync(path.dirname(target), { recursive: true });
+  const fd = fs.openSync(target, "a");
+  try {
+    fs.writeSync(fd, block);
+    fs.fsyncSync(fd);
+  } finally {
+    fs.closeSync(fd);
+  }
+  const bytes = Buffer.byteLength(block);
+  const back = Buffer.alloc(bytes);
+  const rd = fs.openSync(target, "r");
+  try {
+    fs.readSync(rd, back, 0, bytes, offset);
+  } finally {
+    fs.closeSync(rd);
+  }
+  if (back.toString("utf-8") !== block)
+    throw new Error(`ledger ${target} read-back disagrees with the bytes just written`);
+}
+
+export type AppendCheckpoint = (name: "prepared" | "written" | "receipted") => void;
+
+export type AppendHooks = {
+  prepared?: (p: { offset: number; block: string }) => void;
+  written?: (p: { offset: number; bytes: number; block: string }) => void;
+  checkpoint?: AppendCheckpoint;
+};
+
+/**
+ * The one lock-and-confirm append: under the target lock, read the current text, let
+ * `prepare` build the rows to add, write them (a missing final newline is closed first)
+ * and flush and read them back. Returns where the bytes landed.
+ */
+export function appendLocked(
+  target: string,
+  prepare: (current: string) => string,
+  hooks: AppendHooks = {},
+): { offset: number; bytes: number; block: string } {
+  return withTargetLock(target, () => appendHeld(target, prepare, hooks));
+}
+
+/** {@link appendLocked} for a caller that already holds the target lock. */
+export function appendHeld(
+  target: string,
+  prepare: (current: string) => string,
+  hooks: AppendHooks = {},
+): { offset: number; bytes: number; block: string } {
+  {
+    const current = fs.existsSync(target) ? fs.readFileSync(target, "utf-8") : "";
+    const body = prepare(current);
+    const block = `${current !== "" && !current.endsWith("\n") ? "\n" : ""}${body}`;
+    const offset = Buffer.byteLength(current);
+    hooks.prepared?.({ offset, block });
+    hooks.checkpoint?.("prepared");
+    writePrepared(target, block, offset);
+    const bytes = Buffer.byteLength(block);
+    hooks.checkpoint?.("written");
+    hooks.written?.({ offset, bytes, block });
+    hooks.checkpoint?.("receipted");
+    return { offset, bytes, block };
+  }
+}
+
 export type Strategy = NonNullable<Step["strategy"]>;
 
 /** Next rung: none -> STANDARD -> PIVOT -> FINAL, and FINAL stays FINAL. */
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 6842d09df..f5f78307c 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -99,3 +99,5 @@
 {"schema":3,"ts":1794268559842,"kind":"friction","key":"steps-finish/build-plan-gaps-remediate","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-gaps-remediate with exit 11: `.bkit/core/engine/ledgers/telemetry.test.ts` \"accepts verified unavailable model without confusing configured and observed models\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"67e8d5efdfc9b5b8b761e1f59efd5de49cd2bcd4"},"recurrenceCount":1}
 {"schema":3,"ts":1794268565187,"kind":"friction","key":"steps-finish/build-plan-gaps-remediate","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-gaps-remediate with exit 11: `.bkit/core/engine/ledgers/telemetry.test.ts` \"accepts verified unavailable model without confusing configured and observed models\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"67e8d5efdfc9b5b8b761e1f59efd5de49cd2bcd4"},"recurrenceCount":2,"lastConfirmed":1794268565187}
 {"schema":3,"ts":1794268840726,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":8,"lastConfirmed":1794268840726}
+{"schema":3,"ts":1794280713909,"kind":"friction","key":"steps-finish/build-plan-gaps-remediate","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-gaps-remediate with exit 11: `.bkit/core/engine/ledgers/telemetry.test.ts` \"accepts verified unavailable model without confusing configured and observed models\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"67e8d5efdfc9b5b8b761e1f59efd5de49cd2bcd4"},"recurrenceCount":3,"lastConfirmed":1794280713909}
+{"schema":3,"ts":1794280719624,"kind":"friction","key":"steps-finish/build-plan-gaps-remediate","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-gaps-remediate with exit 11: `.bkit/core/engine/ledgers/telemetry.test.ts` \"accepts verified unavailable model without confusing configured and observed models\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"67e8d5efdfc9b5b8b761e1f59efd5de49cd2bcd4"},"recurrenceCount":4,"lastConfirmed":1794280719624}
diff --git a/dist/commands/workflow/branches.js b/dist/commands/workflow/branches.js
index 4b77b1c4e..af52c4bec 100644
--- a/dist/commands/workflow/branches.js
+++ b/dist/commands/workflow/branches.js
@@ -17,7 +17,7 @@ import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
 import { gitEnv } from "../../ledgers/telemetry.js";
-import { actionHash, actionKey, alreadyDone, recordAction } from "../../ledgers/status.js";
+import { actionHash, actionKey, alreadyDone, recordAction, withTargetLock, } from "../../ledgers/status.js";
 import { bodySkipToken, classifyLockExit, CommandError, DEV, EXIT, ghUnavailable, git, isSharedBranch, OUTPUT_LIMIT, parseJson, repoRoot, runGh, runGit, SKIP_CI_TOKEN, testsLockHolder, wholeNumber, } from "../lib.js";
 import { bkitVersionStatus } from "../../shared/bkit-latest.js";
 import { parseBkitVersion, serializeBkitVersion, } from "../../install/version-file.js";
@@ -2107,14 +2107,18 @@ function restoreBranchRows(dir, branch) {
     for (const p of changed) {
         const before = new Set(revLines(dir, base, p));
         const file = path.join(dir, p);
-        const text = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
-        const have = new Set(text.split("\n").map((l) => l.trim()));
-        const missing = revLines(dir, branch, p).filter((l) => !before.has(l) && !have.has(l));
-        if (missing.length === 0)
+        const wrote = withTargetLock(file, () => {
+            const text = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
+            const have = new Set(text.split("\n").map((l) => l.trim()));
+            const missing = revLines(dir, branch, p).filter((l) => !before.has(l) && !have.has(l));
+            if (missing.length === 0)
+                return false;
+            const sep = text !== "" && !text.endsWith("\n") ? "\n" : "";
+            fs.appendFileSync(file, `${sep}${missing.join("\n")}\n`);
+            return true;
+        });
+        if (!wrote)
             continue;
-        const sep = text !== "" && !text.endsWith("\n") ? "\n" : "";
-        fs.mkdirSync(path.dirname(file), { recursive: true });
-        fs.appendFileSync(file, `${sep}${missing.join("\n")}\n`);
         runGit(dir, ["add", "--", p]);
     }
 }
diff --git a/dist/commands/workflow/challenge.js b/dist/commands/workflow/challenge.js
index 07cc68272..ec6f96e6f 100644
--- a/dist/commands/workflow/challenge.js
+++ b/dist/commands/workflow/challenge.js
@@ -211,6 +211,52 @@ const taskBlock = (n, f, round) => [
     ...f.tests.map((e) => `    - ${e}`),
     `<!-- bkit:task ${n} end -->`,
 ];
+/**
+ * Findings given as structured data (a step result file), checked by the rules
+ * {@link parseFindings} applies to a written report. Severity, fixable, location and
+ * done-when are the reviewer's judgments: a missing one is refused, never defaulted.
+ * Throws a CommandError (EXIT_OLD_FORMAT) naming the finding and field.
+ */
+export function structuredFindings(input, cwd) {
+    if (!Array.isArray(input))
+        throw new CommandError(EXIT_OLD_FORMAT, "findings must be an array");
+    return input.map((raw, i) => {
+        const refuse = (why) => new CommandError(EXIT_OLD_FORMAT, `finding ${i + 1} ${why}`);
+        if (raw === null || typeof raw !== "object" || Array.isArray(raw))
+            throw refuse("is not an object");
+        const f = raw;
+        if (!SEVERITY_ORDER.includes(f["severity"]))
+            throw refuse("has no severity CRITICAL|HIGH|MEDIUM|LOW");
+        if (typeof f["fixable"] !== "boolean")
+            throw refuse("has no fixable true|false");
+        const location = normalizeLocation(typeof f["location"] === "string" ? f["location"] : "", cwd);
+        if (location === null)
+            throw refuse("has no location path:line");
+        if (typeof f["doneWhen"] !== "string" || f["doneWhen"].trim() === "")
+            throw refuse("has no doneWhen");
+        const tests = f["tests"] ?? [];
+        if (!Array.isArray(tests) || tests.some((t) => typeof t !== "string"))
+            throw refuse("has tests that are not an array of strings");
+        if (f["cls"] !== undefined && typeof f["cls"] !== "string")
+            throw refuse("has a non-text cls");
+        const title = typeof f["title"] === "string" && f["title"] !== "" ? f["title"] : "";
+        return {
+            severity: f["severity"],
+            ...(typeof f["cls"] === "string" && f["cls"] !== "" ? { cls: f["cls"] } : {}),
+            fixable: f["fixable"],
+            location,
+            title: title || `Challenge finding at ${location}`,
+            doneWhen: f["doneWhen"],
+            tests: tests,
+        };
+    });
+}
+/** The `## Findings Log` section for `findings`, in the task-block form {@link parseFindings} reads. */
+export function renderFindingsLog(findings, round = 1) {
+    return ["## Findings Log", "", ...findings.flatMap((f, i) => [...taskBlock(i + 1, f, round), ""])]
+        .join("\n")
+        .replace(/\n+$/, "");
+}
 /** The test tier `docs/testing.md` records for a test file's name. */
 const testTier = (file) => /\.integration\.test\./.test(file)
     ? "Integration"
diff --git a/dist/commands/workflow/issues.js b/dist/commands/workflow/issues.js
index f8f1ad24e..f2754e7bf 100644
--- a/dist/commands/workflow/issues.js
+++ b/dist/commands/workflow/issues.js
@@ -457,6 +457,145 @@ export function headingAnchor(heading) {
         .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, "")
         .replace(/ /g, "-");
 }
+// ---------------------------------------------------------------------------
+// Audit result — the one validated shape an audit's report header, ledger rows and
+// tracker comment are all derived from. The agent supplies findings and judgments
+// (status, the prior key it judged the same item, coverage gaps); the engine derives
+// the IDs, the severity totals and the ledger payloads, so none can disagree.
+// ---------------------------------------------------------------------------
+export const AUDIT_SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
+const AUDIT_RESULT_KEYS = [
+    "slug",
+    "status",
+    "report",
+    "findings",
+    "notChecked",
+    "stopped",
+    "overview",
+    "issue",
+    "parent",
+];
+const AUDIT_FINDING_KEYS = ["severity", "title", "location", "priorKey"];
+/** The audit result held in `raw`; throws a CommandError (USAGE) naming the first problem. */
+export function parseAuditResult(raw) {
+    const bad = (why) => new CommandError(EXIT.USAGE, `audit result: ${why}`);
+    if (raw === null || typeof raw !== "object" || Array.isArray(raw))
+        throw bad("must be a JSON object");
+    const r = raw;
+    for (const k of Object.keys(r))
+        if (!AUDIT_RESULT_KEYS.includes(k))
+            throw bad(`unknown field "${k}"; totals, counts and IDs are derived from the findings`);
+    if (typeof r["slug"] !== "string" || !/^[a-z0-9-]+$/.test(r["slug"]))
+        throw bad("slug must be the template slug (a-z, 0-9, -)");
+    if (r["status"] !== "COMPLETE" && r["status"] !== "STOPPED")
+        throw bad("status must be COMPLETE or STOPPED");
+    const report = r["report"] ?? null;
+    if (report !== null && (typeof report !== "string" || report === ""))
+        throw bad("report must be a path or null");
+    if (!Array.isArray(r["findings"]))
+        throw bad("findings must be an array");
+    const priors = new Set();
+    const findings = r["findings"].map((f, i) => {
+        const at = `finding ${i + 1}`;
+        if (f === null || typeof f !== "object" || Array.isArray(f))
+            throw bad(`${at} is not an object`);
+        const o = f;
+        for (const k of Object.keys(o))
+            if (!AUDIT_FINDING_KEYS.includes(k))
+                throw bad(`${at} has unknown field "${k}"`);
+        if (!AUDIT_SEVERITIES.includes(o["severity"]))
+            throw bad(`${at} severity must be ${AUDIT_SEVERITIES.join("|")}`);
+        if (typeof o["title"] !== "string" || o["title"].trim() === "")
+            throw bad(`${at} needs a title`);
+        if (typeof o["location"] !== "string" || !/^\S+:\d+$/.test(o["location"]))
+            throw bad(`${at} location must be path:line`);
+        if (o["priorKey"] !== undefined) {
+            if (typeof o["priorKey"] !== "string" || o["priorKey"] === "")
+                throw bad(`${at} priorKey must be a non-empty string`);
+            if (priors.has(o["priorKey"]))
+                throw bad(`${at} repeats priorKey ${o["priorKey"]}`);
+            priors.add(o["priorKey"]);
+        }
+        return {
+            severity: o["severity"],
+            title: o["title"].trim(),
+            location: o["location"],
+            ...(o["priorKey"] === undefined ? {} : { priorKey: o["priorKey"] }),
+        };
+    });
+    const notChecked = r["notChecked"] ?? [];
+    if (!Array.isArray(notChecked) || notChecked.some((n) => typeof n !== "string" || n === ""))
+        throw bad("notChecked must be an array of non-empty strings");
+    const text = (name) => {
+        const v = r[name];
+        if (v === undefined)
+            return undefined;
+        if (typeof v !== "string")
+            throw bad(`${name} must be text`);
+        return v;
+    };
+    return {
+        slug: r["slug"],
+        status: r["status"],
+        report: report,
+        findings,
+        notChecked: notChecked,
+        ...(text("stopped") === undefined ? {} : { stopped: text("stopped") }),
+        ...(text("overview") === undefined ? {} : { overview: text("overview") }),
+        ...(text("issue") === undefined ? {} : { issue: text("issue") }),
+        ...(text("parent") === undefined ? {} : { parent: text("parent") }),
+    };
+}
+/** Findings per severity. */
+export function auditTotals(findings) {
+    return Object.fromEntries(AUDIT_SEVERITIES.map((s) => [s, findings.filter((f) => f.severity === s).length]));
+}
+/** `CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 2`, the Findings header value. */
+export const auditFindingsLine = (totals) => AUDIT_SEVERITIES.map((s) => `${s} ${totals[s]}`).join(" \u00b7 ");
+const kebab = (text) => text
+    .toLowerCase()
+    .replace(/[^a-z0-9]+/g, "-")
+    .replace(/^-+|-+$/g, "")
+    .slice(0, 48);
+/** The findings in their one deterministic order, each with its ID and ledger key. */
+export function auditEntries(result) {
+    const rank = (s) => AUDIT_SEVERITIES.indexOf(s);
+    const ordered = [...result.findings].sort((a, b) => rank(a.severity) - rank(b.severity) ||
+        a.location.localeCompare(b.location) ||
+        a.title.localeCompare(b.title) ||
+        (a.priorKey ?? "").localeCompare(b.priorKey ?? ""));
+    const used = new Set(ordered.flatMap((f) => (f.priorKey === undefined ? [] : [f.priorKey])));
+    return ordered.map((f, i) => {
+        let key = f.priorKey;
+        if (key === undefined) {
+            const base = `${result.slug}-${kebab(f.title) || "finding"}`;
+            key = base;
+            for (let n = 2; used.has(key); n += 1)
+                key = `${base}-${n}`;
+            used.add(key);
+        }
+        return { ...f, id: `${result.slug}-${i + 1}`, key };
+    });
+}
+/** One `failure` ledger payload per finding, ready for `bkit ledgers append`. */
+export function auditLedgerRows(result) {
+    return auditEntries(result).map((e) => ({
+        kind: "failure",
+        by: { workflow: "audit", step: `audit-${result.slug}` },
+        key: e.key,
+        summary: e.title,
+        severity: e.severity,
+        description: `${e.title} (${e.location}); audit ${result.slug} finding ${e.id}`,
+        status: "OPEN",
+    }));
+}
+/** The comment's header fields: the same Status and Findings the report header carries. */
+export function auditHeaderFields(result) {
+    return [
+        ["Status", result.status],
+        ["Findings", auditFindingsLine(auditTotals(result.findings))],
+    ];
+}
 const KINDS = ["step", "failure", "handover", "audit"];
 /** The exact comment body; files (`bodyFile`, `sections`, `stderrFile`, `errorFile`) resolve against `cwd`. */
 export function buildComment(cwd, o) {
@@ -534,14 +673,34 @@ export function commentBody(ctx) {
     if (ctx.flags.groupCount !== undefined && ctx.flags.group === undefined) {
         throw new CommandError(EXIT.USAGE, "--group-count needs --group");
     }
+    const resultFile = str(ctx.flags.resultFile);
+    let audit;
+    if (resultFile !== undefined) {
+        if (kind !== "audit")
+            throw new CommandError(EXIT.USAGE, "--result-file needs --kind=audit");
+        const parsed = parseJson(readInput(ctx.cwd, resultFile, "result-file"));
+        if (!parsed.ok)
+            throw new CommandError(EXIT.USAGE, "--result-file is not JSON");
+        audit = parseAuditResult(parsed.value);
+        const slug = str(ctx.flags.auditSlug);
+        if (slug !== undefined && slug !== audit.slug)
+            throw new CommandError(EXIT.USAGE, `conflict: --audit-slug ${slug} is not the result's slug ${audit.slug}`);
+        for (const [name] of headerFields(ctx))
+            if (name === "Status" || name === "Findings")
+                throw new CommandError(EXIT.USAGE, `conflict: --field ${name} beside --result-file; the result derives it`);
+    }
+    const given = ctx.flags.line ?? [];
     return buildComment(ctx.cwd, {
         kind: kind,
-        auditSlug: str(ctx.flags.auditSlug),
+        auditSlug: audit?.slug ?? str(ctx.flags.auditSlug),
         workflow: str(ctx.flags.workflow),
         workflowHeading: ctx.flags.workflowHeading === true,
         stepNumber: str(ctx.flags.stepNumber),
         stepTitle: str(ctx.flags.stepTitle),
-        fields: kind === "step" || kind === "audit" ? headerFields(ctx) : [],
+        fields: [
+            ...(audit === undefined ? [] : auditHeaderFields(audit)),
+            ...(kind === "step" || kind === "audit" ? headerFields(ctx) : []),
+        ],
         subStep: str(ctx.flags.subStep),
         error: str(ctx.flags.error),
         errorFile: str(ctx.flags.errorFile),
@@ -553,7 +712,7 @@ export function commentBody(ctx) {
         runId: str(ctx.flags.runId),
         artifacts: ctx.flags.artifact ?? [],
         ref: str(ctx.flags.ref),
-        lines: ctx.flags.line ?? [],
+        lines: [...(audit?.report == null ? [] : [`Report: ${audit.report}`]), ...given],
         bodyFile: str(ctx.flags.bodyFile),
         sections: ctx.flags.section ?? [],
     });
@@ -821,6 +980,11 @@ export const issuesCommand = {
                     help: "routine | attention | terminal; defaults from kind, never from PR metadata",
                 },
                 { name: "audit-slug", type: "string", help: "audit: template slug, e.g. security" },
+                {
+                    name: "result-file",
+                    type: "string",
+                    help: "audit: the structured audit result JSON; derives the Status and Findings fields and the Report line, and refuses a hand-written Status or Findings field",
+                },
                 { name: "step-number", type: "string", help: "step number in the heading" },
                 { name: "step-title", type: "string", help: "step title in the heading, e.g. Plan Verify" },
                 { name: "workflow", type: "string", help: "design | plan | build | debug | ship | auto" },
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index c3ff8977d..f1b8e593e 100644
--- a/dist/commands/workflow/ledgers.js
+++ b/dist/commands/workflow/ledgers.js
@@ -17,6 +17,7 @@ import { readBkitVersion } from "../../install/version-file.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { APPEND_LEDGERS, SCHEMA, UNJUSTIFIED_REASON, gitEnv, parse, queryLedger, mintTs, resolveRepoSlug, validate, withLineage, writerProblem, } from "../../ledgers/telemetry.js";
 import { COMPACT_LEDGERS, compactLedgers } from "../../ledgers/compact.js";
+import { LEDGER_OPERATIONS_FILE, actionHash, appendHeld, ledgerIntent, ledgerOperation, pendingLedgerIntents, recordLedgerIntent, recordLedgerOperation, withTargetLock, writePrepared, } from "../../ledgers/status.js";
 import { CommandError, EXIT, INVOCATION_FLAG, isIgnoredPath, isSharedBranch, parseJson, wholeNumber, } from "../lib.js";
 import { str } from "./status.js";
 import { NO_MARKERS_REASON, outOfScope, parsePlanBlocks, reuseInventory, } from "./plan-blocks.js";
@@ -654,15 +655,26 @@ export const ledgersCommand = {
                     ...INVOCATION_FLAG,
                     help: `${INVOCATION_FLAG.help}; fills each row's by block (workflow, step, subagent, model, provenance) and refuses a row whose own by disagrees`,
                 },
+                {
+                    name: "operation",
+                    type: "string",
+                    help: "operation id naming this request: the same id and rows replay the original receipt without writing; the same id with other rows is refused; a new id is a deliberate later update",
+                },
+                {
+                    name: "issue-operation",
+                    type: "boolean",
+                    help: "let the engine issue the operation id from --invocation and the request, so a retried call after a lost response replays instead of appending again; exclusive with --operation",
+                },
             ],
             output: {
                 ledger: "the ledger appended to",
                 file: "its path, relative to --root",
                 appended: "rows written",
                 keys: "each row's key, in order (null when a row has none)",
+                receipt: "with --operation: {operation, ledger, file, offset, bytes, rows[{key, ts}], replayed}; replayed is true when the original effect is returned",
             },
             exitCodes: {
-                [EXIT_STAGE]: "mkdir or append failed",
+                [EXIT_STAGE]: "mkdir or append failed, the ledger is locked by another writer, or a prior attempt left an uncertain partial write",
                 [EXIT_ROW_REFUSED]: "a row carries ts, has the wrong kind, fails validation, or names a writer not listed for its kind — nothing written",
             },
             run: (ctx) => append(ctx),
@@ -1030,15 +1042,21 @@ export function unionLedgers(src, dst) {
         if (made)
             throw new CommandError(EXIT_STAGE, `mkdir failed for ${path.dirname(to)}: ${made}`);
         if (fs.existsSync(to) && fs.statSync(to).isFile()) {
-            const existing = fs.readFileSync(to, "utf-8");
-            const have = new Set(fileLines(existing));
-            const fresh = fileLines(fs.readFileSync(from, "utf-8")).filter((l) => !have.has(l));
-            const block = fresh.join("\n").replace(/\n+$/, "");
-            // A destination missing its final newline would glue the first new row
-            // onto its last one, leaving a line that is not JSON.
-            const sep = existing !== "" && !existing.endsWith("\n") ? "\n" : "";
-            if (block !== "")
-                fs.appendFileSync(to, `${sep}${block}\n`);
+            // Under the destination's target lock, so a pending ledger operation's bytes are never reordered.
+            withTargetLock(to, () => {
+                const pending = pendingLedgerIntents(path.join(dst, LEDGER_OPERATIONS_FILE), rel);
+                if (pending.length > 0)
+                    throw new CommandError(EXIT_STAGE, `${rel} has ledger operation(s) with bytes but no receipt (${pending.map((p) => p.operation).join(", ")}); replay them first`);
+                const existing = fs.readFileSync(to, "utf-8");
+                const have = new Set(fileLines(existing));
+                const fresh = fileLines(fs.readFileSync(from, "utf-8")).filter((l) => !have.has(l));
+                const block = fresh.join("\n").replace(/\n+$/, "");
+                // A destination missing its final newline would glue the first new row
+                // onto its last one, leaving a line that is not JSON.
+                const sep = existing !== "" && !existing.endsWith("\n") ? "\n" : "";
+                if (block !== "")
+                    fs.appendFileSync(to, `${sep}${block}\n`);
+            });
         }
         else {
             const copied = copy(from, to);
@@ -1121,16 +1139,32 @@ function withInvocationBy(row, inv, refuse) {
     }
     return { ...row, by };
 }
+/** The `{key, ts}` of each row in prepared `block` bytes. */
+function receiptRows(block) {
+    const out = [];
+    for (const line of block.split("\n")) {
+        if (line.trim() === "")
+            continue;
+        const parsed = parseJson(line);
+        if (!parsed.ok || parsed.value === null || typeof parsed.value !== "object")
+            continue;
+        const r = parsed.value;
+        out.push({ key: typeof r["key"] === "string" ? r["key"] : null, ts: Number(r["ts"]) });
+    }
+    return out;
+}
 /**
  * Append `rows` to one ledger. Every row is checked before any is written, so a
  * refused row leaves the file byte-identical. Each row gets `schema` and a `ts`
  * minted now (never supplied), `repo` when it lacks one and `bkit.version` from
  * `.bkit/version`; an `AGED_KINDS` row also gets `firstTs` + `updates` carried
  * forward from its entry's rows already in the ledger (supplied values replaced).
- * Never rewrites existing rows. Throws a CommandError (USAGE / EXIT_ROW_REFUSED /
- * EXIT_STAGE).
+ * Never rewrites existing rows. The write runs under the ledger's target lock; with
+ * `options.operation` it also records the prepared bytes and a durable receipt, so a
+ * lost response is reconciled by inspecting the ledger, never by appending again.
+ * Throws a CommandError (USAGE / EXIT_ROW_REFUSED / EXIT_STAGE).
  */
-export function appendLedgerRows(root, ledger, rows, invocation) {
+export function appendLedgerRows(root, ledger, rows, invocation, options = {}) {
     if (!Object.hasOwn(APPEND_LEDGERS, ledger)) {
         throw new CommandError(EXIT.USAGE, `--ledger must be one of ${Object.keys(APPEND_LEDGERS).join(", ")} (got '${ledger}')`);
     }
@@ -1140,90 +1174,173 @@ export function appendLedgerRows(root, ledger, rows, invocation) {
         throw new CommandError(EXIT.USAGE, "--rows must hold a JSON array");
     if (rows.length === 0)
         throw new CommandError(EXIT.USAGE, "--rows holds no rows");
-    let repo;
-    let version;
-    let last;
     const abs = path.join(root, file);
-    const prior = fs.existsSync(abs) ? parse(fs.readFileSync(abs, "utf-8")).events : [];
-    const out = rows.map((raw, i) => {
-        const refuse = (why) => new CommandError(EXIT_ROW_REFUSED, `row ${i + 1}: ${why}`);
-        if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
-            throw refuse("not a JSON object");
-        }
-        const r = invocation === undefined
-            ? raw
-            : withInvocationBy(raw, invocation, refuse);
-        if (invocation === undefined && byOfRow(r)["modelSource"] === "unavailable")
-            throw refuse("by.modelSource unavailable needs a validated --invocation; the engine records it, a caller cannot assert it");
-        if (Object.hasOwn(r, "ts"))
-            throw refuse("carries ts; ts is minted at append time");
-        if (Object.hasOwn(r, "schema"))
-            throw refuse("carries schema; it is set at append time");
-        if (!takes.includes(String(r["kind"]))) {
-            throw refuse(`kind must be ${takes.join(" | ")} in --ledger=${ledger} (got ${String(r["kind"])})`);
-        }
-        if (Object.hasOwn(r, "bkit"))
-            throw refuse("carries bkit; bkit.version is set at append time");
-        repo ??= resolveRepoSlug(root) || "unknown/repo";
-        version ??= readBkitVersion(path.join(root, ".bkit", "version"))?.pinnedVersion || "unknown";
-        last = mintTs(last);
-        const filled = withLineage(prior, {
-            repo,
-            ...r,
-            schema: SCHEMA,
-            ts: last,
-            bkit: { version },
-        });
-        const row = {};
-        for (const k of TOP_ORDER)
-            if (filled[k] !== undefined)
-                row[k] = filled[k];
-        for (const [k, v] of Object.entries(filled))
-            if (!(k in row))
-                row[k] = v;
-        const v = validate(row);
-        if (!v.ok)
-            throw refuse(v.reason ?? "invalid");
-        const who = writerProblem(row);
-        if (who !== undefined)
-            throw refuse(who);
-        prior.push(row);
-        return row;
-    });
     const made = mkdirp(path.dirname(abs));
     if (made)
         throw new CommandError(EXIT_STAGE, `mkdir failed for ${path.dirname(file)}: ${made}`);
-    const block = out.map((r) => `${JSON.stringify(r)}\n`).join("");
-    // A file missing its final newline would glue the first row onto its last one.
-    const appendErr = appendText(abs, endsMidLine(abs) ? `\n${block}` : block);
-    if (appendErr)
-        throw new CommandError(EXIT_STAGE, `append failed: ${file} — ${appendErr}`);
-    return {
-        ledger: ledger,
-        file,
-        appended: out.length,
-        keys: out.map((r) => (typeof r["key"] === "string" ? r["key"] : null)),
+    const ops = path.join(root, LEDGER_OPERATIONS_FILE);
+    const hash = actionHash(JSON.stringify({ ledger, rows, invocation: invocation?.id ?? null }));
+    if (options.operation !== undefined && options.issueOperation === true)
+        throw new CommandError(EXIT.USAGE, "--issue-operation and --operation are exclusive: the engine issues the id, or the caller names it");
+    if (options.issueOperation === true && invocation === undefined)
+        throw new CommandError(EXIT.USAGE, "--issue-operation needs --invocation: the id is issued from that invocation's context");
+    // Issued from the invocation and the request hash, so retrying a lost response gets the same id.
+    const operation = options.operation ??
+        (options.issueOperation === true && invocation !== undefined
+            ? `op-${invocation.id.slice(4, 16)}-${hash.slice(0, 12)}`
+            : undefined);
+    const result = (landed, block, replayed) => {
+        const parsedRows = receiptRows(block);
+        return {
+            ledger: ledger,
+            file,
+            appended: replayed ? 0 : parsedRows.length,
+            keys: parsedRows.map((r) => r.key),
+            ...(operation === undefined
+                ? {}
+                : {
+                    receipt: {
+                        operation,
+                        ledger,
+                        file,
+                        offset: landed.offset,
+                        bytes: landed.bytes,
+                        rows: parsedRows,
+                        replayed,
+                    },
+                }),
+        };
     };
-}
-/** True when `abs` exists, is non-empty and its last byte is not a newline. */
-function endsMidLine(abs) {
-    let fd;
+    const build = (text) => {
+        let repo;
+        let version;
+        let last;
+        const prior = parse(text).events;
+        const out = rows.map((raw, i) => {
+            const refuse = (why) => new CommandError(EXIT_ROW_REFUSED, `row ${i + 1}: ${why}`);
+            if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
+                throw refuse("not a JSON object");
+            }
+            const r = invocation === undefined
+                ? raw
+                : withInvocationBy(raw, invocation, refuse);
+            if (invocation === undefined && byOfRow(r)["modelSource"] === "unavailable")
+                throw refuse("by.modelSource unavailable needs a validated --invocation; the engine records it, a caller cannot assert it");
+            if (Object.hasOwn(r, "ts"))
+                throw refuse("carries ts; ts is minted at append time");
+            if (Object.hasOwn(r, "schema"))
+                throw refuse("carries schema; it is set at append time");
+            if (!takes.includes(String(r["kind"]))) {
+                throw refuse(`kind must be ${takes.join(" | ")} in --ledger=${ledger} (got ${String(r["kind"])})`);
+            }
+            if (Object.hasOwn(r, "bkit"))
+                throw refuse("carries bkit; bkit.version is set at append time");
+            repo ??= resolveRepoSlug(root) || "unknown/repo";
+            version ??= readBkitVersion(path.join(root, ".bkit", "version"))?.pinnedVersion || "unknown";
+            last = mintTs(last);
+            const filled = withLineage(prior, {
+                repo,
+                ...r,
+                schema: SCHEMA,
+                ts: last,
+                bkit: { version },
+            });
+            const row = {};
+            for (const k of TOP_ORDER)
+                if (filled[k] !== undefined)
+                    row[k] = filled[k];
+            for (const [k, v] of Object.entries(filled))
+                if (!(k in row))
+                    row[k] = v;
+            const v = validate(row);
+            if (!v.ok)
+                throw refuse(v.reason ?? "invalid");
+            const who = writerProblem(row);
+            if (who !== undefined)
+                throw refuse(who);
+            prior.push(row);
+            return row;
+        });
+        return out.map((r) => `${JSON.stringify(r)}\n`).join("");
+    };
+    const stage = (err) => err instanceof CommandError
+        ? err
+        : new CommandError(EXIT_STAGE, `append failed: ${file} \u2014 ${err.message}`);
     try {
-        fd = fs.openSync(abs, "r");
-        const size = fs.fstatSync(fd).size;
-        if (size === 0)
-            return false;
-        const last = Buffer.alloc(1);
-        fs.readSync(fd, last, 0, 1, size - 1);
-        return last[0] !== 0x0a;
-    }
-    catch {
-        // No file yet: the append creates it.
-        return false;
+        return withTargetLock(abs, () => {
+            if (operation === undefined) {
+                const landed = appendHeld(abs, build, { checkpoint: options.checkpoint });
+                return result(landed, landed.block, false);
+            }
+            // The operation store is serialized by its own lock, taken after the target's, so two
+            // ledgers' operations (and `union` of the store) never interleave check and record.
+            return withTargetLock(ops, () => {
+                const known = ledgerOperation(ops, operation, hash);
+                if (known.state === "conflict")
+                    throw new CommandError(EXIT_ROW_REFUSED, `operation ${operation} was already used for a different request; nothing written`);
+                if (known.state === "replay") {
+                    const d = known.row
+                        .detail;
+                    if (d === undefined)
+                        throw new CommandError(EXIT_STAGE, `operation ${operation} has a receipt without its effect`);
+                    return result(d, d.block, true);
+                }
+                const intent = ledgerIntent(ops, operation);
+                if (intent !== undefined && intent.hash !== hash)
+                    throw new CommandError(EXIT_ROW_REFUSED, `operation ${operation} was already used for a different request; nothing written`);
+                const receipt = (landed) => recordLedgerOperation(ops, {
+                    operation,
+                    hash,
+                    ref: `${file}@${landed.offset}+${landed.bytes}`,
+                    detail: { offset: landed.offset, bytes: landed.bytes, block: landed.block },
+                });
+                if (intent !== undefined) {
+                    const have = fs.existsSync(abs) ? fs.readFileSync(abs) : Buffer.alloc(0);
+                    const want = Buffer.from(intent.block);
+                    const seg = have.subarray(intent.offset, intent.offset + want.length);
+                    if (seg.equals(want)) {
+                        // The bytes landed whole; confirm them durable and receipt them.
+                        const fd = fs.openSync(abs, "r");
+                        try {
+                            fs.fsyncSync(fd);
+                        }
+                        finally {
+                            fs.closeSync(fd);
+                        }
+                        receipt(intent);
+                        options.checkpoint?.("receipted");
+                        return result(intent, intent.block, true);
+                    }
+                    if (seg.length > 0 && have.length === intent.offset + seg.length)
+                        throw new CommandError(EXIT_STAGE, `operation ${operation}: ${file} holds ${seg.length} of ${want.length} prepared bytes; the effect is uncertain, nothing was truncated or retried`);
+                    if (have.length === intent.offset) {
+                        // Nothing landed: write the exact prepared bytes again.
+                        writePrepared(abs, intent.block, intent.offset);
+                        options.checkpoint?.("written");
+                        receipt(intent);
+                        options.checkpoint?.("receipted");
+                        return result(intent, intent.block, false);
+                    }
+                    // Another writer appended after the failed attempt and none of ours landed: prepare afresh.
+                }
+                const landed = appendHeld(abs, build, {
+                    checkpoint: options.checkpoint,
+                    prepared: (p) => recordLedgerIntent(ops, {
+                        operation,
+                        hash,
+                        file,
+                        offset: p.offset,
+                        bytes: Buffer.byteLength(p.block),
+                        block: p.block,
+                    }),
+                    written: (p) => receipt(p),
+                });
+                return result(landed, landed.block, false);
+            });
+        });
     }
-    finally {
-        if (fd !== undefined)
-            fs.closeSync(fd);
+    catch (err) {
+        throw stage(err);
     }
 }
 function append(ctx) {
@@ -1247,8 +1364,13 @@ function append(ctx) {
         if (rel.startsWith("..") || path.isAbsolute(rel))
             throw new CommandError(EXIT.USAGE, `conflict: --root ${root} is outside the checkout ${ctx.invocation.worktree} that issued invocation ${ctx.invocation.id}`);
     }
-    const r = appendLedgerRows(root, String(ctx.flags.ledger), parsed.value, ctx.invocation);
-    ctx.log(`appended ${r.appended} row(s) to ${r.file}`);
+    const r = appendLedgerRows(root, String(ctx.flags.ledger), parsed.value, ctx.invocation, {
+        operation: str(ctx.flags.operation),
+        issueOperation: ctx.flags.issueOperation === true,
+    });
+    ctx.log(r.receipt?.replayed === true
+        ? `operation ${r.receipt.operation} already appended to ${r.file}; nothing written`
+        : `appended ${r.appended} row(s) to ${r.file}`);
     ctx.emit({ ...r });
     return EXIT.OK;
 }
@@ -1394,18 +1516,20 @@ function mkdirp(dir) {
 /** {@link compactLedgers}; its results, or the error text. A failed temp write or rename leaves the ledger untouched. */
 function compactOrError(root, ledgers, dryRun) {
     try {
-        return compactLedgers(root, ledgers, dryRun);
-    }
-    catch (err) {
-        // Reported as the command's staging exit code, with the reason.
-        return err.message;
-    }
-}
-/** Append `text` to `file`; the error text, or undefined on success. */
-function appendText(file, text) {
-    try {
-        fs.appendFileSync(file, text);
-        return undefined;
+        const targets = ledgers.map((l) => COMPACT_LEDGERS[l]).sort();
+        const locked = (i) => {
+            if (i === targets.length) {
+                const ops = path.join(root, LEDGER_OPERATIONS_FILE);
+                for (const t of targets) {
+                    const pending = pendingLedgerIntents(ops, t);
+                    if (pending.length > 0)
+                        throw new Error(`${t} has ${pending.length} ledger operation(s) with bytes but no receipt (${pending.map((p) => p.operation).join(", ")}); replay them before compacting`);
+                }
+                return compactLedgers(root, ledgers, dryRun);
+            }
+            return withTargetLock(path.join(root, targets[i]), () => locked(i + 1));
+        };
+        return locked(0);
     }
     catch (err) {
         // Reported as the command's staging exit code, with the reason.
diff --git a/dist/commands/workflow/locks.js b/dist/commands/workflow/locks.js
index cc993ad0c..e0df3e7a8 100644
--- a/dist/commands/workflow/locks.js
+++ b/dist/commands/workflow/locks.js
@@ -12,7 +12,7 @@ import { createHash, randomBytes } from "node:crypto";
 import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
-import { fold, lastRun, statusTimestamp, } from "../../ledgers/status.js";
+import { createExclusive, fold, lastRun, statusTimestamp, } from "../../ledgers/status.js";
 import { CommandError, EXIT, git, parseJson, repoRoot, runTool, statusRelPath, utcMonth, } from "../lib.js";
 import { removeRecord } from "./ledgers.js";
 import { str } from "./status.js";
@@ -68,23 +68,7 @@ export function readHolder(file) {
 /** Create `file` only if absent (`set -C`); false when someone else holds it. */
 export function tryCreate(file, line) {
     fs.mkdirSync(path.dirname(file), { recursive: true });
-    const fd = openExclusive(file);
-    if (fd === undefined)
-        return false;
-    fs.writeSync(fd, `${line}\n`);
-    fs.closeSync(fd);
-    return true;
-}
-function openExclusive(file) {
-    try {
-        return fs.openSync(file, "wx");
-    }
-    catch (err) {
-        // EEXIST is the expected "someone holds it" answer; anything else is a real error.
-        if (err.code === "EEXIST")
-            return undefined;
-        throw err;
-    }
+    return createExclusive(file, `${line}\n`);
 }
 const newToken = () => randomBytes(4).toString("hex");
 /** The OS start identity distinguishes a live reused PID from a recorded owner. */
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index a8ec51ed7..89e222128 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -9,6 +9,7 @@
 // saying it did. `finish` is the whole step ending in one call: read the verdict
 // headers, derive the attempt, check what the gate checks, write the row, commit,
 // and print the step's tracker comment.
+import { createHash } from "node:crypto";
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { actionKey, activeDoneSteps, allRunsDoneSteps, appendLine, ciRoundMatches, runNumber, runOrStepField, statusTimestamp, } from "../../ledgers/status.js";
@@ -21,9 +22,9 @@ import { CommandError, EXIT, git, isSharedBranch, parseJson, repoRoot, runGit, }
 import { activeRunStart, savedPointLimit } from "./counters.js";
 import { isResumable, runProgress, WORKFLOW_STEPS } from "./step-table.js";
 import { planFiles } from "./run-facts.js";
-import { mergeFindings, parseFindings } from "./challenge.js";
+import { mergeFindings, parseFindings, renderFindingsLog, structuredFindings, } from "./challenge.js";
 import { fidProblem, normaliseFid, readIssueTracker } from "./fids.js";
-import { buildComment } from "./issues.js";
+import { auditEntries, auditFindingsLine, auditLedgerRows, auditTotals, buildComment, parseAuditResult, } from "./issues.js";
 import { EXIT_FOREIGN_PATH, activeRecord, ownPathCommit, ownSet, } from "./ledgers.js";
 import { readHolder, resolveMonth, workflowLockPath } from "./locks.js";
 import { EXIT_NO_STATUS, FILE_FLAG, GROUP_FLAG, STEP_FLAG, WORKFLOW_FLAG, extraField, nonNegativeInt, positiveInt, readRuns, readStatusRows, readRunsAt, statusFile, str, } from "./status.js";
@@ -141,6 +142,9 @@ export function readHeader(file, allowed, require = [], declared = []) {
         if (m && !(m[1] in fields))
             fields[m[1]] = m[2].trim();
     }
+    const stale = fingerprintProblem(file, lines, end, fields);
+    if (stale !== null)
+        return { ok: false, code: EXIT_INVALID, problem: stale };
     const pending = Object.entries(fields).filter(([, v]) => /\bPENDING\b/.test(v));
     if (pending.length > 0) {
         return {
@@ -186,6 +190,25 @@ export function readHeader(file, allowed, require = [], declared = []) {
     }
     return { ok: true, verdict, fields };
 }
+/** Header field that fingerprints a generated artifact's header and body. */
+const FINGERPRINT = "Fingerprint";
+/** sha256 of an artifact's header (without its Fingerprint line) and everything below it. */
+export function artifactFingerprint(lines, end) {
+    const head = lines.slice(0, end).filter((l) => !l.startsWith(`${FINGERPRINT}:`));
+    const body = lines.slice(end + 1);
+    return createHash("sha256")
+        .update(`${head.join("\n")}\n${VERDICT_END}\n${body.join("\n")}`)
+        .digest("hex");
+}
+/** Why a generated artifact no longer matches what the engine rendered, or null (hand-written ones carry no fingerprint). */
+function fingerprintProblem(file, lines, end, fields) {
+    const given = fields[FINGERPRINT];
+    if (given === undefined)
+        return null;
+    return artifactFingerprint(lines, end) === given
+        ? null
+        : `${file}: stale; its header or body changed after the engine rendered it (Fingerprint mismatch) — regenerate it from the result file`;
+}
 /** Lines left as a stub placeholder: a bare `PENDING`, or a field whose whole value is `PENDING`. */
 export function placeholderLines(file) {
     return fs
@@ -1210,6 +1233,173 @@ async function finish(ctx) {
     return pass ? EXIT.OK : EXIT.NO;
 }
 // ---------------------------------------------------------------------------
+// stub --result-file — an artifact rendered from one structured result
+// ---------------------------------------------------------------------------
+/**
+ * Header fields the engine computes from the findings; every other declared field is a
+ * judgment the result must supply (the evidence-dependent ones: Tasks, Redesign, Strategy ...).
+ */
+const DERIVED_FIELDS = {
+    Failures: (f) => String(f.length),
+    // `true` when any gap is fixable (the plan-verify header contract), `false` for none.
+    Fixable: (f) => String(f.some((x) => x.fixable)),
+};
+/** The agent whose header is the audit summary (Status / Report / Findings), not a Verdict header. */
+const AUDIT_AGENT = "bkit-audit-generate";
+const withFingerprint = (head, body) => {
+    const unsigned = `${head.join("\n")}\n${VERDICT_END}\n\n${body}`;
+    const lines = unsigned.split("\n");
+    const fingerprint = artifactFingerprint(lines, head.length);
+    return `${head.join("\n")}\n${FINGERPRINT}: ${fingerprint}\n${VERDICT_END}\n\n${body}`;
+};
+const fingerprintOf = (text) => artifactFingerprint(text.split("\n"), text.split("\n").indexOf(VERDICT_END));
+function renderAudit(result) {
+    const entries = auditEntries(result);
+    const totals = auditTotals(result.findings);
+    const head = [
+        `Status: ${result.status}`,
+        `Report: ${result.report ?? "None"}`,
+        `Findings: ${auditFindingsLine(totals)}`,
+        `Issue: ${result.issue ?? "None"}`,
+        `Parent: ${result.parent ?? "None"}`,
+    ];
+    const cell = (t) => t.replace(/\|/g, "\\|");
+    const list = (items) => (items.length ? items.map((i) => `- ${i}`).join("\n") : "None");
+    const body = [
+        `# Audit Summary: ${result.slug}`,
+        "",
+        "## Stopped",
+        "",
+        result.stopped ?? "None",
+        "",
+        "## Overview",
+        "",
+        result.overview ?? "None",
+        "",
+        "## Suggested Issues",
+        "",
+        ...(entries.length
+            ? [
+                "| ID | Severity | Title | Location | Prior key |",
+                "| --- | --- | --- | --- | --- |",
+                ...entries.map((e) => `| ${e.id} | ${e.severity} | ${cell(e.title)} | \`${e.location}\` | ${e.priorKey ?? "none"} |`),
+            ]
+            : ["None"]),
+        "",
+        "## Not Checked",
+        "",
+        list(result.notChecked),
+        "",
+        "## Ledger",
+        "",
+        list(entries.map((e) => `\`${e.key}\` ${e.severity} OPEN`)),
+        "",
+    ].join("\n");
+    const text = withFingerprint(head, body);
+    return {
+        text,
+        fingerprint: fingerprintOf(text),
+        extra: {
+            ids: entries.map((e) => e.id),
+            totals,
+            ledgerRows: auditLedgerRows(result),
+        },
+    };
+}
+/**
+ * The artifact for `agent` rendered from a structured result `{findings, judgments, body,
+ * evidenceComplete}`: counts and booleans derived from the findings, judged fields passed
+ * through and checked, a Fingerprint over the header and body. Throws a CommandError
+ * (EXIT_INVALID) and writes nothing on any disagreement.
+ */
+export function renderResult(cwd, agent, raw) {
+    const bad = (why) => new CommandError(EXIT_INVALID, `result: ${why}`);
+    if (agent === AUDIT_AGENT) {
+        try {
+            return renderAudit(parseAuditResult(raw));
+        }
+        catch (err) {
+            throw err instanceof CommandError ? bad(err.message) : err;
+        }
+    }
+    if (raw === null || typeof raw !== "object" || Array.isArray(raw))
+        throw bad("must be a JSON object");
+    const r = raw;
+    for (const k of Object.keys(r))
+        if (!["findings", "judgments", "body", "evidenceComplete"].includes(k))
+            throw bad(`unknown field "${k}"`);
+    let findings;
+    try {
+        findings = structuredFindings(r["findings"] ?? [], cwd);
+    }
+    catch (err) {
+        throw err instanceof CommandError ? bad(err.message) : err;
+    }
+    const judgments = r["judgments"] ?? {};
+    if (judgments === null || typeof judgments !== "object" || Array.isArray(judgments))
+        throw bad("judgments must be an object");
+    const judged = new Map();
+    for (const [k, v] of Object.entries(judgments)) {
+        if (typeof v !== "string" && typeof v !== "number" && typeof v !== "boolean")
+            throw bad(`judgment ${k} must be text, a number or a boolean`);
+        judged.set(k, String(v));
+    }
+    const declared = promptHeader(agent);
+    const names = new Set(["Verdict", ...declared.fields.map((f) => f.name)]);
+    for (const k of judged.keys()) {
+        if (!names.has(k))
+            throw bad(`judgment ${k} is not a header field of ${agent}`);
+        if (k in DERIVED_FIELDS)
+            throw bad(`${k} is derived from the findings and cannot be supplied`);
+    }
+    const evidenceComplete = r["evidenceComplete"] !== false;
+    const arithmetic = findings.length > 0
+        ? "FAIL"
+        : !evidenceComplete
+            ? declared.verdicts.includes("CONCERNS")
+                ? "CONCERNS"
+                : "FAIL"
+            : "PASS";
+    const verdict = judged.get("Verdict") ?? arithmetic;
+    if (!declared.verdicts.includes(verdict))
+        throw bad(`Verdict ${verdict} is not ${declared.verdicts.join("|")}`);
+    if (verdict === "PASS" && arithmetic !== "PASS")
+        throw bad(findings.length > 0
+            ? `Verdict PASS contradicts ${findings.length} finding(s)`
+            : "Verdict PASS contradicts incomplete evidence");
+    const head = [`Verdict: ${verdict}`];
+    for (const f of declared.fields) {
+        const value = DERIVED_FIELDS[f.name]?.(findings) ?? judged.get(f.name);
+        if (value === undefined)
+            throw bad(`${f.name} is a judgment the result must supply`);
+        if (f.values && !f.values.includes(value))
+            throw bad(`${f.name} ${value} is not ${f.values.join("|")}`);
+        if (f.integer && !/^[0-9]+$/.test(value))
+            throw bad(`${f.name} ${value} is not a non-negative integer`);
+        head.push(`${f.name}: ${value}`);
+    }
+    const given = r["body"] ?? "";
+    if (typeof given !== "string")
+        throw bad("body must be text");
+    if (given.split("\n").includes(VERDICT_END))
+        throw bad(`body holds a ${VERDICT_END} line`);
+    const log = findings.length > 0 && !/^## Findings Log\b/m.test(given)
+        ? `\n${renderFindingsLog(findings)}\n`
+        : "";
+    const body = `${given.replace(/\n+$/, "")}\n${log}`;
+    const text = withFingerprint(head, body.replace(/^\n+/, ""));
+    return { text, fingerprint: fingerprintOf(text), extra: { findings: findings.length } };
+}
+function readResult(cwd, file) {
+    const abs = path.resolve(cwd, file);
+    if (!fs.existsSync(abs))
+        throw new CommandError(EXIT_INVALID, `result: ${file} does not exist`);
+    const parsed = parseJson(fs.readFileSync(abs, "utf-8"));
+    if (!parsed.ok)
+        throw new CommandError(EXIT_INVALID, `result: ${file} is not JSON`);
+    return parsed.value;
+}
+// ---------------------------------------------------------------------------
 // stub
 // ---------------------------------------------------------------------------
 /** The header a fresh versioned artifact starts with; the subagent fills it in last. */
@@ -1522,12 +1712,17 @@ export const stepsCommand = {
                     repeatable: true,
                     help: "header field that must be present, e.g. Failures",
                 },
+                {
+                    name: "result-file",
+                    type: "string",
+                    help: "with --agent: also require the artifact to be the render of this result (a changed result is stale)",
+                },
             ],
             output: { verdict: "the Verdict value", fields: "every Key: value header field" },
             exitCodes: {
                 [EXIT_EMPTY]: "artifact missing or empty",
                 [EXIT_PENDING]: "a header field is still PENDING",
-                [EXIT_INVALID]: "no verdict:end line, Verdict outside the allowed set, or a required field missing — re-prompt the subagent",
+                [EXIT_INVALID]: "no verdict:end line, Verdict outside the allowed set, a required field missing, or a generated artifact whose Fingerprint no longer matches its header and body (stale) — re-prompt the subagent or regenerate it",
             },
             run: (ctx) => {
                 const header = readHeader(path.resolve(ctx.cwd, String(ctx.flags.file)), allowedVerdicts(ctx.flags), list(ctx.flags.field));
@@ -1535,6 +1730,23 @@ export const stepsCommand = {
                     ctx.log(header.problem);
                     return header.code;
                 }
+                if (ctx.flags.resultFile !== undefined) {
+                    if (ctx.flags.agent === undefined)
+                        throw new CommandError(EXIT.USAGE, "--result-file needs --agent");
+                    try {
+                        const rendered = renderResult(ctx.cwd, String(ctx.flags.agent), readResult(ctx.cwd, String(ctx.flags.resultFile)));
+                        if (header.fields[FINGERPRINT] !== rendered.fingerprint) {
+                            ctx.log(`${String(ctx.flags.file)}: stale; it is not the render of ${String(ctx.flags.resultFile)} (Fingerprint mismatch)`);
+                            return EXIT_INVALID;
+                        }
+                    }
+                    catch (err) {
+                        if (!(err instanceof CommandError) || err.code !== EXIT_INVALID)
+                            throw err;
+                        ctx.log(err.message);
+                        return EXIT_INVALID;
+                    }
+                }
                 ctx.emit({ verdict: header.verdict, fields: header.fields });
                 return EXIT.OK;
             },
@@ -1690,17 +1902,64 @@ export const stepsCommand = {
             summary: "Seed a versioned artifact: copy the prior version, then put a PENDING verdict header on top.",
             use: "workflow",
             flags: [
-                { name: "from", type: "string", required: true, help: "the prior versioned artifact" },
+                { name: "from", type: "string", help: "the prior versioned artifact (copy mode)" },
                 { name: "to", type: "string", required: true, help: "the artifact to create" },
+                {
+                    name: "agent",
+                    type: "string",
+                    help: "with --result-file: the subagent whose header the result renders",
+                },
+                {
+                    name: "result-file",
+                    type: "string",
+                    help: "render the artifact from this structured result JSON {findings, judgments, body, evidenceComplete} (audit: the audit result) instead of copying --from",
+                },
                 {
                     name: "strip-header",
                     type: "boolean",
                     help: "drop the prior version's own header (everything down to its <!-- verdict:end -->)",
                 },
             ],
-            output: { file: "the artifact written", stripped: "the prior header was dropped" },
-            exitCodes: { [EXIT_EMPTY]: "--from is missing or empty" },
+            output: {
+                file: "the artifact written",
+                stripped: "the prior header was dropped (copy mode)",
+                fingerprint: "with --result-file: the Fingerprint header value",
+                ids: "audit result: the report-local finding IDs, in report order",
+                totals: "audit result: findings per severity",
+                ledgerRows: "audit result: one failure ledger payload per finding, for `bkit ledgers append`",
+                findings: "other results: the finding count",
+            },
+            exitCodes: {
+                [EXIT_EMPTY]: "--from is missing or empty",
+                [EXIT_INVALID]: "--result-file is unreadable or invalid, or a judgment contradicts the findings (nothing written)",
+            },
             run: (ctx) => {
+                if (ctx.flags.resultFile !== undefined) {
+                    if (ctx.flags.from !== undefined)
+                        throw new CommandError(EXIT.USAGE, "give --from or --result-file, not both");
+                    if (ctx.flags.agent === undefined)
+                        throw new CommandError(EXIT.USAGE, "--result-file needs --agent");
+                    try {
+                        const rendered = renderResult(ctx.cwd, String(ctx.flags.agent), readResult(ctx.cwd, String(ctx.flags.resultFile)));
+                        const to = path.resolve(ctx.cwd, String(ctx.flags.to));
+                        fs.mkdirSync(path.dirname(to), { recursive: true });
+                        fs.writeFileSync(to, rendered.text);
+                        ctx.emit({
+                            file: String(ctx.flags.to),
+                            fingerprint: rendered.fingerprint,
+                            ...rendered.extra,
+                        });
+                        return EXIT.OK;
+                    }
+                    catch (err) {
+                        if (!(err instanceof CommandError) || err.code !== EXIT_INVALID)
+                            throw err;
+                        ctx.log(err.message);
+                        return EXIT_INVALID;
+                    }
+                }
+                if (ctx.flags.from === undefined)
+                    throw new CommandError(EXIT.USAGE, "give --from (copy) or --result-file");
                 const from = path.resolve(ctx.cwd, String(ctx.flags.from));
                 if (!fs.existsSync(from) || fs.statSync(from).size === 0) {
                     ctx.log(`${String(ctx.flags.from)} is missing or empty`);
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index d3a9455d9..0b31d056e 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -22,7 +22,7 @@
 import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
-import { appendLine, fold, lastRun, runNumber, runOrStepField, statusTimestamp, } from "../../ledgers/status.js";
+import { appendLine, fold, lastRun, runNumber, runOrStepField, statusTimestamp, withTargetLock, } from "../../ledgers/status.js";
 import { compareTs, foldFrom, normalize, resolveRepoSlug, workflowTelemetry, } from "../../ledgers/telemetry.js";
 import { check as checkCompleteness, deriveContract, parseRows, readCompleteness, } from "../../checks/status-holes.js";
 import { getWorkflowsRoot } from "../../shared/package-roots.js";
@@ -438,14 +438,19 @@ function carryOwnBook(src, dst, o, log) {
     const uncommitted = (file) => runRows(src, file, rec);
     const add = (file, lines) => {
         const to = path.join(dst, file);
-        const existing = fs.existsSync(to) ? fs.readFileSync(to, "utf-8") : "";
-        const have = new Set(textLines(existing).map((l) => l.trim()));
-        const fresh = lines.filter((l) => !have.has(l.trim()));
+        fs.mkdirSync(path.dirname(to), { recursive: true });
+        const fresh = withTargetLock(to, () => {
+            const existing = fs.existsSync(to) ? fs.readFileSync(to, "utf-8") : "";
+            const have = new Set(textLines(existing).map((l) => l.trim()));
+            const missing = lines.filter((l) => !have.has(l.trim()));
+            if (missing.length === 0)
+                return missing;
+            const sep = existing !== "" && !existing.endsWith("\n") ? "\n" : "";
+            fs.appendFileSync(to, `${sep}${missing.join("\n")}\n`);
+            return missing;
+        });
         if (fresh.length === 0)
             return;
-        fs.mkdirSync(path.dirname(to), { recursive: true });
-        const sep = existing !== "" && !existing.endsWith("\n") ? "\n" : "";
-        fs.appendFileSync(to, `${sep}${fresh.join("\n")}\n`);
         carried.lines.set(file, fresh);
     };
     const listed = (specs) => (git(src, ["ls-files", "--cached", "--others", "--exclude-standard", "--", ...specs]) ?? "")
diff --git a/dist/commands/workflow/worktrees.js b/dist/commands/workflow/worktrees.js
index 2cde4d800..afc28fe29 100644
--- a/dist/commands/workflow/worktrees.js
+++ b/dist/commands/workflow/worktrees.js
@@ -17,7 +17,7 @@ import { spawnSync } from "node:child_process";
 import { createHash } from "node:crypto";
 import * as fs from "node:fs";
 import * as path from "node:path";
-import { actionHash, actionKey, lastRun, recordAction } from "../../ledgers/status.js";
+import { actionHash, actionKey, lastRun, recordAction, withTargetLock, } from "../../ledgers/status.js";
 import { APPEND_LEDGERS, gitEnv } from "../../ledgers/telemetry.js";
 import { parseJson } from "../../shared/json.js";
 import { readBkitConfig } from "../../shared/settings.js";
@@ -364,8 +364,10 @@ function putJournalRowsBack(wt, journal) {
     }
     for (const [rel, a] of journal) {
         const file = path.join(wt, rel);
-        const text = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
-        fs.appendFileSync(file, `${text !== "" && !text.endsWith("\n") ? "\n" : ""}${a.rows}`);
+        withTargetLock(file, () => {
+            const text = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
+            fs.appendFileSync(file, `${text !== "" && !text.endsWith("\n") ? "\n" : ""}${a.rows}`);
+        });
     }
     return "";
 }
diff --git a/dist/ledgers/journal.js b/dist/ledgers/journal.js
index e860f1a78..4aec47ce5 100644
--- a/dist/ledgers/journal.js
+++ b/dist/ledgers/journal.js
@@ -15,7 +15,7 @@
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { parseJson } from "../shared/json.js";
-import { appendLine, statusTimestamp } from "./status.js";
+import { appendLine, appendLocked, statusTimestamp } from "./status.js";
 import { APPEND_LEDGERS, SCHEMA, compareTs, mintTs, resolveRepoSlug, validate, writerProblem, } from "./telemetry.js";
 /** The kill switch: `BKIT_ENGINE_JOURNAL=off` keeps the seam from writing any row. */
 export function journalEnabled(env = process.env) {
@@ -171,7 +171,7 @@ export function appendJournalRow(file, row) {
  * `recurrenceCount` raised by one and `lastConfirmed` = that `ts`. No line is
  * ever rewritten, so a row another writer appends meanwhile is kept.
  */
-export function appendFrictionRow(bookRoot, row) {
+export function appendFrictionRow(bookRoot, row, options = {}) {
     const checked = validate(row);
     if (!checked.ok)
         return { ok: false, error: checked.reason ?? "invalid friction row" };
@@ -180,12 +180,14 @@ export function appendFrictionRow(bookRoot, row) {
         return { ok: false, error: who };
     const file = path.join(bookRoot, APPEND_LEDGERS.friction.file);
     try {
-        fs.mkdirSync(path.dirname(file), { recursive: true });
-        const text = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
-        const prior = latestSameKey(text, row["key"]);
-        const next = prior === undefined ? { ...row, recurrenceCount: 1 } : recurrence(prior, row);
-        fs.appendFileSync(file, `${text !== "" && !text.endsWith("\n") ? "\n" : ""}${JSON.stringify(next)}\n`);
-        return { ok: true };
+        // The recurrence is computed from the text read under the target lock, so a
+        // competing writer can never invalidate the prepared offset or count.
+        const landed = appendLocked(file, (text) => {
+            const prior = latestSameKey(text, row["key"]);
+            const next = prior === undefined ? { ...row, recurrenceCount: 1 } : recurrence(prior, row);
+            return `${JSON.stringify(next)}\n`;
+        }, { checkpoint: options.checkpoint });
+        return { ok: true, receipt: { offset: landed.offset, bytes: landed.bytes } };
     }
     catch (err) {
         return { ok: false, error: err.message };
diff --git a/dist/ledgers/migrate.js b/dist/ledgers/migrate.js
index 5a4334e09..dd0085b8e 100644
--- a/dist/ledgers/migrate.js
+++ b/dist/ledgers/migrate.js
@@ -7,6 +7,7 @@
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { parseJson } from "../shared/json.js";
+import { LEDGER_OPERATIONS_FILE, pendingLedgerIntents, withTargetLock } from "./status.js";
 import { normalize } from "./telemetry.js";
 /** Every repo ledger whose rows carry the shared top section (`.bkit/jsonl.md`). */
 export const SCHEMA_LEDGERS = [
@@ -67,15 +68,25 @@ export function migrateLedgers(root, dryRun) {
         const abs = path.join(root, file);
         if (!fs.lstatSync(abs, { throwIfNoEntry: false })?.isFile())
             continue;
-        const { text, rewritten, dropped } = migrateLedgerText(fs.readFileSync(abs, "utf-8"));
-        if (rewritten + dropped === 0)
-            continue;
-        if (!dryRun) {
-            const tmp = `${abs}.bkit-migrate.tmp`;
-            fs.writeFileSync(tmp, text, "utf-8");
-            fs.renameSync(tmp, abs);
-        }
-        out.push({ file, rewritten, dropped });
+        const migrate = () => {
+            const { text, rewritten, dropped } = migrateLedgerText(fs.readFileSync(abs, "utf-8"));
+            if (rewritten + dropped === 0)
+                return undefined;
+            if (!dryRun) {
+                // A pending ledger operation holds an offset into the current bytes: refuse to move them.
+                const pending = pendingLedgerIntents(path.join(root, LEDGER_OPERATIONS_FILE), file);
+                if (pending.length > 0)
+                    throw new Error(`${file} has ledger operation(s) with bytes but no receipt (${pending.map((p) => p.operation).join(", ")}); replay them before migrating`);
+                const tmp = `${abs}.bkit-migrate.tmp`;
+                fs.writeFileSync(tmp, text, "utf-8");
+                fs.renameSync(tmp, abs);
+            }
+            return { file, rewritten, dropped };
+        };
+        // Read and rewrite under the target lock, so a row appended meanwhile is never dropped.
+        const done = dryRun ? migrate() : withTargetLock(abs, migrate);
+        if (done !== undefined)
+            out.push(done);
     }
     return out;
 }
diff --git a/dist/ledgers/status.js b/dist/ledgers/status.js
index df41a7e7d..aa9cf0272 100644
--- a/dist/ledgers/status.js
+++ b/dist/ledgers/status.js
@@ -345,6 +345,186 @@ export function recordAction(file, a) {
     fs.appendFileSync(file, appendLine(row));
     return row;
 }
+// ---------------------------------------------------------------------------
+// Ledger operations — a bookkeeping write that must survive a lost response. One
+// operation id names one request (its hash): the same id and hash replays the
+// original receipt, the same id with another hash is refused, and a new id on the
+// same ledger key is a deliberate later update. This is stricter than the generic
+// action policy above, where the same key with a changed hash acts again.
+// ---------------------------------------------------------------------------
+/** The operations store, relative to a book root; `.bkit/*.jsonl` is allow-listed and unioned. */
+export const LEDGER_OPERATIONS_FILE = path.join(".bkit", "ledger-operations.jsonl");
+const ledgerOpKey = (operation) => actionKey("ledger-op", operation);
+/** Where `operation` stands in `file`: unseen, done with this request, or used for another. */
+export function ledgerOperation(file, operation, hash) {
+    const known = engineActions(file)
+        .filter((r) => r.key === ledgerOpKey(operation))
+        .at(0);
+    if (known === undefined)
+        return { state: "new" };
+    return { state: known.hash === hash ? "replay" : "conflict", row: known };
+}
+/**
+ * Record the receipt of a finished ledger operation. A known operation with the same
+ * hash returns its original row unchanged; one with another hash throws and writes nothing.
+ * `detail` rides on the row so a replay can return the original effect.
+ */
+export function recordLedgerOperation(file, a) {
+    const known = ledgerOperation(file, a.operation, a.hash);
+    if (known.state === "conflict")
+        throw new Error(`ledger operation ${a.operation} was already used for a different request`);
+    if (known.state === "replay")
+        return known.row;
+    const row = {
+        ...recordRow({
+            action: "ledger-append",
+            key: ledgerOpKey(a.operation),
+            hash: a.hash,
+            ref: a.ref,
+        }),
+        ...(a.detail === undefined ? {} : { detail: a.detail }),
+    };
+    fs.mkdirSync(path.dirname(file), { recursive: true });
+    fs.appendFileSync(file, appendLine(row));
+    return row;
+}
+const recordRow = (a) => ({ type: ENGINE_ACTION, ...a, at: statusTimestamp() });
+function intentRows(file) {
+    if (!fs.existsSync(file))
+        return [];
+    const out = [];
+    for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
+        if (line.trim() === "")
+            continue;
+        const parsed = parseJson(line);
+        if (!parsed.ok)
+            continue;
+        const r = parsed.value;
+        if (r?.type === "ledger-intent" && typeof r.operation === "string")
+            out.push(r);
+    }
+    return out;
+}
+/** Record the prepared bytes of an operation before writing them. */
+export function recordLedgerIntent(file, intent) {
+    fs.mkdirSync(path.dirname(file), { recursive: true });
+    const row = { type: "ledger-intent", ...intent, at: statusTimestamp() };
+    fs.appendFileSync(file, `${JSON.stringify(row)}\n`);
+}
+/** The latest prepared intent of `operation`, or undefined. */
+export function ledgerIntent(file, operation) {
+    return intentRows(file)
+        .filter((i) => i.operation === operation)
+        .at(-1);
+}
+/** Intents on `target` (relative path) whose operation has no receipt: effects not yet confirmed. */
+export function pendingLedgerIntents(file, target) {
+    const receipted = new Set(engineActions(file).map((r) => r.key));
+    const latest = new Map();
+    for (const i of intentRows(file))
+        latest.set(i.operation, i);
+    return [...latest.values()].filter((i) => i.file === target && !receipted.has(ledgerOpKey(i.operation)));
+}
+/** Create `file` holding `content` only if absent; false when it exists. Other errors throw. */
+export function createExclusive(file, content) {
+    let fd;
+    try {
+        fd = fs.openSync(file, "wx");
+    }
+    catch (err) {
+        // EEXIST is the expected "someone holds it" answer; anything else is a real error.
+        if (err.code === "EEXIST")
+            return false;
+        throw err;
+    }
+    try {
+        fs.writeSync(fd, content);
+    }
+    finally {
+        fs.closeSync(fd);
+    }
+    return true;
+}
+const sleepSync = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
+/** How long a writer waits for another writer's lock on a ledger before refusing. */
+export const TARGET_LOCK_WAIT_MS = 10_000;
+/**
+ * Run `fn` holding the exclusive lock on `target` (`<target>.bkit-lock`). A holder that
+ * does not release in time is never reclaimed: the call throws, naming the lock file.
+ */
+export function withTargetLock(target, fn, waitMs = TARGET_LOCK_WAIT_MS) {
+    const lock = `${target}.bkit-lock`;
+    const token = `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
+    fs.mkdirSync(path.dirname(lock), { recursive: true });
+    const body = JSON.stringify({ pid: process.pid, at: statusTimestamp(), token });
+    const deadline = Date.now() + waitMs;
+    while (!createExclusive(lock, body)) {
+        if (Date.now() >= deadline) {
+            const holder = fs.existsSync(lock) ? fs.readFileSync(lock, "utf-8").trim() : "unknown";
+            throw new Error(`ledger target ${target} is locked by another writer (${holder}); if that process is gone, remove ${lock}`);
+        }
+        sleepSync(20);
+    }
+    try {
+        return fn();
+    }
+    finally {
+        const held = fs.existsSync(lock) ? fs.readFileSync(lock, "utf-8") : "";
+        if (held === body)
+            fs.rmSync(lock, { force: true });
+    }
+}
+/** Append `block` to `target` at exactly `offset`, flush it and read it back; throws on any mismatch. */
+export function writePrepared(target, block, offset) {
+    const size = fs.existsSync(target) ? fs.statSync(target).size : 0;
+    if (size !== offset)
+        throw new Error(`ledger ${target} changed since the append was prepared (${size} != ${offset})`);
+    fs.mkdirSync(path.dirname(target), { recursive: true });
+    const fd = fs.openSync(target, "a");
+    try {
+        fs.writeSync(fd, block);
+        fs.fsyncSync(fd);
+    }
+    finally {
+        fs.closeSync(fd);
+    }
+    const bytes = Buffer.byteLength(block);
+    const back = Buffer.alloc(bytes);
+    const rd = fs.openSync(target, "r");
+    try {
+        fs.readSync(rd, back, 0, bytes, offset);
+    }
+    finally {
+        fs.closeSync(rd);
+    }
+    if (back.toString("utf-8") !== block)
+        throw new Error(`ledger ${target} read-back disagrees with the bytes just written`);
+}
+/**
+ * The one lock-and-confirm append: under the target lock, read the current text, let
+ * `prepare` build the rows to add, write them (a missing final newline is closed first)
+ * and flush and read them back. Returns where the bytes landed.
+ */
+export function appendLocked(target, prepare, hooks = {}) {
+    return withTargetLock(target, () => appendHeld(target, prepare, hooks));
+}
+/** {@link appendLocked} for a caller that already holds the target lock. */
+export function appendHeld(target, prepare, hooks = {}) {
+    {
+        const current = fs.existsSync(target) ? fs.readFileSync(target, "utf-8") : "";
+        const body = prepare(current);
+        const block = `${current !== "" && !current.endsWith("\n") ? "\n" : ""}${body}`;
+        const offset = Buffer.byteLength(current);
+        hooks.prepared?.({ offset, block });
+        hooks.checkpoint?.("prepared");
+        writePrepared(target, block, offset);
+        const bytes = Buffer.byteLength(block);
+        hooks.checkpoint?.("written");
+        hooks.written?.({ offset, bytes, block });
+        hooks.checkpoint?.("receipted");
+        return { offset, bytes, block };
+    }
+}
 /** Next rung: none -> STANDARD -> PIVOT -> FINAL, and FINAL stays FINAL. */
 export function nextStrategy(prior) {
     if (prior === undefined)
