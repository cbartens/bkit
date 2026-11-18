diff --git a/.bkit/core/.bkit/jsonl.md b/.bkit/core/.bkit/jsonl.md
index d077d26c4..db29d4f7c 100644
--- a/.bkit/core/.bkit/jsonl.md
+++ b/.bkit/core/.bkit/jsonl.md
@@ -21,7 +21,7 @@
 
 - **Identity:** Group by § Identity / Dedup. A bare `key` suffices only within one keyed kind and one repo.
 - **Winner:** Keep the highest numeric `ts` per identity; the later line wins a tie.
-- **Filters:** Apply status and query filters after folding, so superseded rows stay superseded. Decisions / knowledge default to `ACTIVE`; open failures / deferrals include `TRIAGED` and exclude `CLOSED` (§ Updating a Row).
+- **Filters:** Apply status and query filters after folding, so superseded rows stay superseded. A row with no `status` reads as `OPEN` on `friction` / `deferral` / `failure` and as `ACTIVE` on `decision` / `knowledge`, so `bkit ledgers query --status=` finds it; open failures / deferrals include `TRIAGED` and exclude `CLOSED` (§ Updating a Row).
 - **History:** Retain the rows needed for the requested time range instead of reducing them to current state.
 - **Workflow logs:** Read `status.jsonl` through the workflow's status commands. These are event histories with their own replay rules, outside this fold.
 
@@ -344,7 +344,7 @@ To update a row, copy the prior row, change what changed, and append it. Through
 
 **`TRIAGED` is still open work.** Open-entry counts (the audit debt lens, the age report) test `status != "CLOSED"`. Only `CLOSED` is done.
 
-`bkit ledgers append` writes `status: "OPEN"` on a `friction` / `deferral` / `failure` row that gives none; a given `status` is kept.
+`bkit ledgers append` writes `status: "OPEN"` on a `friction` / `deferral` / `failure` row that gives none; a given `status` is kept. `bkit ledgers query` reads a row of those kinds that has no `status` as `OPEN`.
 
 The ladder is not used on `knowledge` or `decision`: both use `ACTIVE` / `SUPERSEDED`. An absent `status` = `ACTIVE`.
 
diff --git a/.bkit/core/engine/checks/tips/detect.ts b/.bkit/core/engine/checks/tips/detect.ts
index 135443751..769108bdc 100644
--- a/.bkit/core/engine/checks/tips/detect.ts
+++ b/.bkit/core/engine/checks/tips/detect.ts
@@ -4,7 +4,7 @@
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { git } from "../../commands/lib.js";
-import { fold, parse } from "../../ledgers/telemetry.js";
+import { defaultStatus, fold, parse } from "../../ledgers/telemetry.js";
 import { BKIT_PACKAGE, cachedBkitOutdated } from "../../shared/bkit-latest.js";
 import { parseJson } from "../../shared/json.js";
 import { readDependencyNames, readPackageJson } from "../../shared/package-json.js";
@@ -270,7 +270,7 @@ export function hasUnsharedFriction(cwd: string): boolean {
     const r = row as Record<string, unknown>;
     return (
       r["kind"] === "friction" &&
-      (r["status"] === undefined || r["status"] === "OPEN") &&
+      (r["status"] ?? defaultStatus("friction")) === "OPEN" &&
       r["scope"] !== "consumer"
     );
   });
diff --git a/.bkit/core/engine/commands/workflow/ledgers.test.ts b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index e8db05ae7..2357720c7 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.test.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -2292,6 +2292,26 @@ describe("bkit ledgers query", () => {
     expect(fs.readFileSync(path.join(r, FILE), "utf-8")).toBe(bytes);
   });
 
+  it("query --status=OPEN returns a deferral winner that has no status, printed as stored", async () => {
+    const r = repo();
+    const stored = JSON.stringify({
+      schema: 3,
+      ts: 1001,
+      kind: "deferral",
+      key: "701-old-deferral",
+      repo: "o/r",
+      bkit: { version: "6.0.0" },
+      by: { workflow: "build", step: "build-close-workflow" },
+      summary: "an old deferral written before status existed",
+      severity: "MEDIUM",
+    });
+    put(r, "docs/deferrals.jsonl", `${stored}\n`);
+    const res = await run(r, ["query", `--root=${r}`, "--ledger=deferrals", "--status=OPEN"]);
+    expect(res.code).toBe(0);
+    expect(res.json.rows.map((x: { key: string }) => x.key)).toEqual(["701-old-deferral"]);
+    expect(res.json.rows[0]).not.toHaveProperty("status");
+  });
+
   it("a negative --cursor offset is refused", async () => {
     const r = fixture();
     const page1 = await q(r, "--status=ACTIVE", "--limit=2");
diff --git a/.bkit/core/engine/commands/workflow/ledgers.ts b/.bkit/core/engine/commands/workflow/ledgers.ts
index 84973564b..1004f739f 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.ts
@@ -26,7 +26,7 @@ import {
   queryLedger,
   mintTs,
   resolveRepoSlug,
-  SEVERITY_KINDS,
+  defaultStatus,
   validate,
   withLineage,
   writerProblem,
@@ -1795,7 +1795,7 @@ export function appendLedgerRows(
       const row: Record<string, unknown> = {};
       for (const k of TOP_ORDER) if (filled[k] !== undefined) row[k] = filled[k];
       for (const [k, v] of Object.entries(filled)) if (!(k in row)) row[k] = v;
-      if (row["status"] === undefined && SEVERITY_KINDS.has(String(row["kind"])))
+      if (row["status"] === undefined && defaultStatus(String(row["kind"])) === "OPEN")
         row["status"] = "OPEN";
       const v = validate(row);
       if (!v.ok) throw reject(v.reason ?? "invalid", i + 1);
diff --git a/.bkit/core/engine/ledgers/telemetry.test.ts b/.bkit/core/engine/ledgers/telemetry.test.ts
index 0eb2b51b9..d1aa5bd03 100644
--- a/.bkit/core/engine/ledgers/telemetry.test.ts
+++ b/.bkit/core/engine/ledgers/telemetry.test.ts
@@ -37,6 +37,7 @@ import {
   parse,
   placeLineage,
   queryLedger,
+  defaultStatus,
   totalsProblem,
   validate,
   withLineage,
@@ -3110,6 +3111,35 @@ describe("queryLedger — canonical winners before filtering", () => {
   });
 });
 
+describe("queryLedger — status default for rows with no status", () => {
+  it("a friction, deferral or failure winner with no status matches the OPEN filter", () => {
+    const row = (kind: string, key: string, extra: Row = {}) =>
+      JSON.stringify({ ...baseEnvelope(kind as TelemetryEvent["kind"]), key, ...extra });
+    const raw = [
+      row("friction", "f-old"),
+      row("deferral", "d-old"),
+      row("failure", "x-old"),
+      row("friction", "f-new", { status: "OPEN" }),
+      row("decision", "dec-old"),
+    ].join("\n");
+    const open = queryLedger(raw, { status: "OPEN" });
+    expect(open.rows.map((r) => r.key).sort()).toEqual(["d-old", "f-new", "f-old", "x-old"]);
+    // Stored as written: the read adds no status.
+    expect(open.rows.find((r) => r.key === "f-old")).not.toHaveProperty("status");
+    // A decision with no status still reads as ACTIVE, not OPEN.
+    expect(queryLedger(raw, { status: "ACTIVE" }).rows.map((r) => r.key)).toEqual(["dec-old"]);
+  });
+
+  it("defaultStatus gives OPEN for severity kinds, ACTIVE for decision and knowledge, none otherwise", () => {
+    expect(defaultStatus("friction")).toBe("OPEN");
+    expect(defaultStatus("deferral")).toBe("OPEN");
+    expect(defaultStatus("failure")).toBe("OPEN");
+    expect(defaultStatus("decision")).toBe("ACTIVE");
+    expect(defaultStatus("knowledge")).toBe("ACTIVE");
+    expect(defaultStatus("feature")).toBeUndefined();
+  });
+});
+
 describe("provenance compatibility through the ledger read paths", () => {
   const by = (extra: Row) => ({
     workflow: "build",
diff --git a/.bkit/core/engine/ledgers/telemetry.ts b/.bkit/core/engine/ledgers/telemetry.ts
index 2e10819bb..fd498f476 100644
--- a/.bkit/core/engine/ledgers/telemetry.ts
+++ b/.bkit/core/engine/ledgers/telemetry.ts
@@ -264,6 +264,13 @@ export const VALID_SEVERITIES: Set<string> = new Set(["CRITICAL", "HIGH", "MEDIU
  */
 export const SEVERITY_KINDS: Set<string> = new Set(["friction", "deferral", "failure"]);
 
+/** The status a row of `kind` has when it gives none: OPEN, ACTIVE, or undefined. */
+export function defaultStatus(kind: string): string | undefined {
+  if (SEVERITY_KINDS.has(kind)) return "OPEN";
+  if (kind === "decision" || kind === "knowledge") return "ACTIVE";
+  return undefined;
+}
+
 /**
  * The triage ladder, shared by the SEVERITY_KINDS trio (friction/deferral/failure).
  *
@@ -1985,9 +1992,6 @@ export interface LedgerQueryResult {
   readRows: number;
 }
 
-/** Statuses of the keyed lifecycle kinds: a row with no `status` is ACTIVE. */
-const DEFAULT_ACTIVE_KINDS: ReadonlySet<string> = new Set(["decision", "knowledge"]);
-
 /**
  * The canonical ledger read: parse every line (reporting each unreadable one with its line
  * number), fold with {@link fold}, and only then apply `filter` to the winners, so an older
@@ -2026,7 +2030,7 @@ export function queryLedger(raw: string, filter: LedgerQuery = {}): LedgerQueryR
     .filter((e) => {
       if (filter.key !== undefined && e.key !== filter.key) return false;
       if (filter.status === undefined) return true;
-      const status = e.status ?? (DEFAULT_ACTIVE_KINDS.has(String(e.kind)) ? "ACTIVE" : undefined);
+      const status = e.status ?? defaultStatus(String(e.kind));
       return status === filter.status;
     });
   return { rows, diagnostics, lines, readRows: events.length };
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index fd38eb879..8ffcbd016 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -293,3 +293,4 @@
 {"schema":3,"ts":1794967427067,"kind":"friction","key":"steps-stub-judgment-field-not-in-agent-header","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-failure-diagnose"},"references":["#1028","docs/plans/202611/logs/1028-gate-fails-workflow/build-failure-diagnose-2.md"],"category":"tool-failure","scope":"bkit-repo","severity":"LOW","summary":"steps stub for the diagnose step exits 6 because it names a judgment field the agent header does not have","description":"`bkit steps stub` for build-failure-diagnose exited 6 with 'judgment Strategy is not a header field of bkit-debug-failure-diagnose'. The diagnose agent wrote its own artifact, which `steps finish` accepted, so the run went on.","source":"orchestrator","status":"OPEN"}
 {"schema":3,"ts":1794967427068,"kind":"friction","key":"1028-resume-rebase-stopped-on-local-changes","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-branch-sync"},"references":["#1028","5d908d631"],"category":"repeated-tool-failure","scope":"bkit-repo","severity":"MEDIUM","summary":"a resumed build's rebase stopped on 'local changes would be overwritten' in package-json.test.ts and branches rebase aborted with exit 3","description":"On the first resume of 1028-gate-fails-workflow run 3, `bkit branches rebase` stopped because git said local changes to package-json.test.ts would be overwritten, then aborted with exit 3. The cause was not established. After the run's own files were committed and Steps 1-2 re-ran, the rebase onto 5d908d631 went through cleanly.","source":"orchestrator","status":"OPEN"}
 {"schema":3,"ts":1794973968097,"kind":"friction","key":"review-agent-turn-limit/plan-review-2","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"plan","step":"plan-review"},"references":["1008-plan-design-owner","#1008"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"@bkit-plan-review-2 stopped at its 100-turn limit with no result file, so the orchestrator resumed it to finish","description":"@bkit-plan-review-2 used all 100 turns reading code for the 1008 plan and stopped before writing its result JSON; its review file was partly written. The orchestrator sent it one message to finish from what it had found, and it wrote the result file on the resumed turn.","remediation":"Raise the review agent's turn cap or have it write its result file before its last turns, as was done for the utility agents.","source":"orchestrator","status":"OPEN"}
+{"schema":3,"ts":1794977744207,"kind":"friction","key":"plan-tasks-gate-wait/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["1039-ledger-query-status","#1039"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"Code agent handed back PASS but left its own changed-files gate running for 30 minutes under load, so it was stopped","description":"@bkit-build-plan-tasks (group 1) logged DONE for all 3 tasks and Verdict: PASS, then stayed alive waiting on a second `bkit:gate:changed` run that was still going 30 minutes after it started, with the load average at 23-34 from parallel builds. The orchestrator stopped the agent, which ended its gate processes, and finished the step from the PASS log. Same pattern as build 1030 group 3.","remediation":"Have the code agent's changed-files gate respect the machine load, or drop the agent-side gate when the workflow's own group and holistic gates re-run the same checks.","source":"orchestrator","status":"OPEN"}
diff --git a/.bkit/jsonl.md b/.bkit/jsonl.md
index 0288cf082..7eb921eac 100644
--- a/.bkit/jsonl.md
+++ b/.bkit/jsonl.md
@@ -21,7 +21,7 @@
 
 - **Identity:** Group by § Identity / Dedup. A bare `key` suffices only within one keyed kind and one repo.
 - **Winner:** Keep the highest numeric `ts` per identity; the later line wins a tie.
-- **Filters:** Apply status and query filters after folding, so superseded rows stay superseded. Decisions / knowledge default to `ACTIVE`; open failures / deferrals include `TRIAGED` and exclude `CLOSED` (§ Updating a Row).
+- **Filters:** Apply status and query filters after folding, so superseded rows stay superseded. A row with no `status` reads as `OPEN` on `friction` / `deferral` / `failure` and as `ACTIVE` on `decision` / `knowledge`, so `bkit ledgers query --status=` finds it; open failures / deferrals include `TRIAGED` and exclude `CLOSED` (§ Updating a Row).
 - **History:** Retain the rows needed for the requested time range instead of reducing them to current state.
 - **Workflow logs:** Read `status.jsonl` through the workflow's status commands. These are event histories with their own replay rules, outside this fold.
 
@@ -344,7 +344,7 @@ To update a row, copy the prior row, change what changed, and append it. Through
 
 **`TRIAGED` is still open work.** Open-entry counts (the audit debt lens, the age report) test `status != "CLOSED"`. Only `CLOSED` is done.
 
-`bkit ledgers append` writes `status: "OPEN"` on a `friction` / `deferral` / `failure` row that gives none; a given `status` is kept.
+`bkit ledgers append` writes `status: "OPEN"` on a `friction` / `deferral` / `failure` row that gives none; a given `status` is kept. `bkit ledgers query` reads a row of those kinds that has no `status` as `OPEN`.
 
 The ladder is not used on `knowledge` or `decision`: both use `ACTIVE` / `SUPERSEDED`. An absent `status` = `ACTIVE`.
 
diff --git a/.bkit/version b/.bkit/version
index 14a167edf..1533ce4a7 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -210,7 +210,7 @@
     ".bkit/cloud.md": "945c4abe584a15aeca979d5e13b2ea5f8915c5198dc8dd9226b1d020118c4c7d",
     ".bkit/comparison.md": "8d62c438ca6293483e6c752e9864d8123a0fa642906dfb15bc08b09a3b224b92",
     ".bkit/install.md": "08d1daa2edba56dc34470d8462418aa5e1d479ac1b5bc596b69debdac025be94",
-    ".bkit/jsonl.md": "8f90c4ae229846bfda05a51465ab9ec8505da8dfdf9d493bbac533b1dd8b4e00",
+    ".bkit/jsonl.md": "2ee43214c4fa16717bfe932463f3a311a22caa40569f24f71e6bd23b6942459c",
     ".bkit/providers.md": "cd84350a719e69837d96a698fe5597f98c79785d3e4079cb1867fbcf4901430e",
     ".bkit/prompts.md": "2ac9bdc011d81372cbebcdb914815f02140c91d82dfb79a1bdbb72875d48d852",
     ".bkit/trackers.md": "85913cc84a994cd14a6c0948a8f6b63611a776b1be80cf9a902e5cb994add0c2",
diff --git a/dist/checks/tips/detect.js b/dist/checks/tips/detect.js
index 7360f58fe..dda812dde 100644
--- a/dist/checks/tips/detect.js
+++ b/dist/checks/tips/detect.js
@@ -3,7 +3,7 @@
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { git } from "../../commands/lib.js";
-import { fold, parse } from "../../ledgers/telemetry.js";
+import { defaultStatus, fold, parse } from "../../ledgers/telemetry.js";
 import { BKIT_PACKAGE, cachedBkitOutdated } from "../../shared/bkit-latest.js";
 import { parseJson } from "../../shared/json.js";
 import { readDependencyNames, readPackageJson } from "../../shared/package-json.js";
@@ -249,7 +249,7 @@ export function hasUnsharedFriction(cwd) {
     return [...fold(parse(fs.readFileSync(p, "utf-8")).events).values()].some((row) => {
         const r = row;
         return (r["kind"] === "friction" &&
-            (r["status"] === undefined || r["status"] === "OPEN") &&
+            (r["status"] ?? defaultStatus("friction")) === "OPEN" &&
             r["scope"] !== "consumer");
     });
 }
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index 0f6a2b732..1e5ded447 100644
--- a/dist/commands/workflow/ledgers.js
+++ b/dist/commands/workflow/ledgers.js
@@ -15,7 +15,7 @@ import * as os from "node:os";
 import * as path from "node:path";
 import { readBkitVersion } from "../../install/version-file.js";
 import { readBkitConfig } from "../../shared/settings.js";
-import { APPEND_LEDGERS, SCHEMA, UNJUSTIFIED_REASON, gitEnv, parse, queryLedger, mintTs, resolveRepoSlug, SEVERITY_KINDS, validate, withLineage, writerProblem, } from "../../ledgers/telemetry.js";
+import { APPEND_LEDGERS, SCHEMA, UNJUSTIFIED_REASON, gitEnv, parse, queryLedger, mintTs, resolveRepoSlug, defaultStatus, validate, withLineage, writerProblem, } from "../../ledgers/telemetry.js";
 import { COMPACT_LEDGERS, compactLedgers } from "../../ledgers/compact.js";
 import { CORRECTION_REJECTED_ROW, CORRECTION_SUCCEEDED_ROW, actionHash, appendHeld, appendLine, correctionScope, ledgerEffect, ledgerIntent, ledgerOperation, ledgerOperationsFile, pendingLedgerIntentsFor, recordLedgerIntent, recordLedgerOperation, statusTimestamp, withTargetLock, writePrepared, } from "../../ledgers/status.js";
 import { CommandError, CorrectionExhausted, EXIT, INVOCATION_FLAG, invocationDir, isIgnoredPath, isSharedBranch, NoWriteRejection, parseJson, UncertainEffect, wholeNumber, } from "../lib.js";
@@ -1447,7 +1447,7 @@ export function appendLedgerRows(root, ledger, rows, invocation, options = {}) {
             for (const [k, v] of Object.entries(filled))
                 if (!(k in row))
                     row[k] = v;
-            if (row["status"] === undefined && SEVERITY_KINDS.has(String(row["kind"])))
+            if (row["status"] === undefined && defaultStatus(String(row["kind"])) === "OPEN")
                 row["status"] = "OPEN";
             const v = validate(row);
             if (!v.ok)
diff --git a/dist/ledgers/telemetry.js b/dist/ledgers/telemetry.js
index 00877b8bc..7bb87db28 100644
--- a/dist/ledgers/telemetry.js
+++ b/dist/ledgers/telemetry.js
@@ -131,6 +131,14 @@ export const VALID_SEVERITIES = new Set(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);
  * sync with the payload interfaces below.
  */
 export const SEVERITY_KINDS = new Set(["friction", "deferral", "failure"]);
+/** The status a row of `kind` has when it gives none: OPEN, ACTIVE, or undefined. */
+export function defaultStatus(kind) {
+    if (SEVERITY_KINDS.has(kind))
+        return "OPEN";
+    if (kind === "decision" || kind === "knowledge")
+        return "ACTIVE";
+    return undefined;
+}
 export const TRIAGE_STATUSES = new Set(["OPEN", "TRIAGED", "CLOSED"]);
 /** The `ACTIVE` / `SUPERSEDED` lifecycle shared by `decision` and `knowledge`. */
 export const DECISION_STATUSES = new Set(["ACTIVE", "SUPERSEDED"]);
@@ -1277,8 +1285,6 @@ export function fold(events) {
     }
     return state;
 }
-/** Statuses of the keyed lifecycle kinds: a row with no `status` is ACTIVE. */
-const DEFAULT_ACTIVE_KINDS = new Set(["decision", "knowledge"]);
 /**
  * The canonical ledger read: parse every line (reporting each unreadable one with its line
  * number), fold with {@link fold}, and only then apply `filter` to the winners, so an older
@@ -1317,7 +1323,7 @@ export function queryLedger(raw, filter = {}) {
             return false;
         if (filter.status === undefined)
             return true;
-        const status = e.status ?? (DEFAULT_ACTIVE_KINDS.has(String(e.kind)) ? "ACTIVE" : undefined);
+        const status = e.status ?? defaultStatus(String(e.kind));
         return status === filter.status;
     });
     return { rows, diagnostics, lines, readRows: events.length };
diff --git a/docs/testing.md b/docs/testing.md
index e7163aa6b..fe9e9bbb7 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -834,7 +834,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `commands/workflow/prs.test.ts` | Unit (stub `gh`) | `bkit prs open / probe / merge / verbose-ci / scan-body / cross-check / transport-row`: marker first in every body, open-PR refusal vs reuse, one retry, base read-back, 80 with the printed title / body; probe states; merge (empty body, `--match-head`, `--delete-branch`, exact-match auto-route subject, already-merged skip, `--expect-merged` 7, 80; `--base=refs/heads/main` spellings refused; a base retarget after the merge fails loudly); verbose-ci on / off / no-op / 5 / 80; body-only token scan; fallback-row cross-check; `transport-row --scan` (clean, token recorded then exit 1, unreadable 8, `--cross-check` refusal unrecorded). |
 | `commands/workflow/issues.test.ts` | Unit | `bkit issues text / labels / comment`: generated drop before the last-marker cut, oldest-first sort; phase vs additive label arithmetic, `merged` clears `bkit:failed`, board payloads from `bkit.tracker.github.project`; comment bodies, defused cut marker, fenced stderr, `--error-file`. Never shells out, because tracker writes stay on MCP. |
 | `commands/workflow/runs.test.ts` | Unit (`tests/fixtures/gh/` stub, stub `gh`) | `bkit runs gate / mirror / wait / dispatch / revalidate / context / declared` — see § Ship merge-gate. Locate: a CI selection keeps the failed job names in `failedJobs`, capstone left out. Gate `--pr` / `--squash-of` heads, title skip token (18), `--snapshot` written before deciding, `--record` refusal / `ship-merge-ci` rows (none while CI is missing or still running), unreadable PR (20); revalidate with no head move, unreadable PR (1), 80, bad `--reason`; auto context BRIEF / CI_DEV (slug refused, 9) / CI (marker, branch fallback, not open 7, no run 8, unknown phase 3, 80); dispatch `--file` / `--step` row + close transport. |
-| `commands/workflow/ledgers.test.ts` | Unit (boundary: real temp git repo) | `bkit ledgers commit / union / only-bookkeeping`: allow-list per scope, unmatched glob never aborts, empty pathspec refused (exit 6), staging failure no false success, `--squash-of`, `--only-if-dirty-tracked`; union append-only, never `.bkit/issues.jsonl`; carry-forward range check; `append` mints a non-round `ts` and fills `schema` / `repo` / `bkit.version`, fills `firstTs` / `updates` from the entry's earlier rows (across calls, within one batch, after compaction; supplied values replaced; none on other kinds), keeps a row's own `repo`, writes `status: "OPEN"` on a friction, deferral or failure row that gives none and keeps a given `status`, takes `compliance` / `counter` / `outcome` with `--ledger=stats`, refuses a supplied `ts` / `schema` / `bkit`, a flat top-level field `by` holds, a wrong kind, an invalid row, an empty rows file, an unlisted writer and the `issues` ledger, writing nothing on refusal; `check` passes when every `**Ledger rows:**` key has a `decision` / `deferral` row or the line reads `None`, and exits 11 naming keys with no row (a `knowledge` row does not count), on a missing line or an unfilled one. `triage --fid= --plan=`: a `low-severity` deferral stays `Exempt`, another feature's rows and a FID with no row print and write nothing, an unjustified row prints its `bucket` and appends one same-`key` `unjustified` / `TRIAGED` row with a minted `ts`, a row whose only declaration is itself stays `Lazy`, a `CLOSED` row stays `Exempt` with no test result and no write, an already-adjudicated `unjustified` row reports `Lazy` (never `Exempt`) and writes nothing on a re-run; a plan with no task blocks exits 1 with the no-markers reason, and a plan whose task blocks do not parse exits 2 naming the line, both writing nothing. `compact`: every keyed ledger by default with per-ledger counts, `--ledger` narrows, `--dry-run` writes nothing, a second run changes nothing, an unknown `--ledger` exits 2. |
+| `commands/workflow/ledgers.test.ts` | Unit (boundary: real temp git repo) | `bkit ledgers commit / union / only-bookkeeping`: allow-list per scope, unmatched glob never aborts, empty pathspec refused (exit 6), staging failure no false success, `--squash-of`, `--only-if-dirty-tracked`; union append-only, never `.bkit/issues.jsonl`; carry-forward range check; `append` mints a non-round `ts` and fills `schema` / `repo` / `bkit.version`, fills `firstTs` / `updates` from the entry's earlier rows (across calls, within one batch, after compaction; supplied values replaced; none on other kinds), keeps a row's own `repo`, writes `status: "OPEN"` on a friction, deferral or failure row that gives none and keeps a given `status`, `query --status=OPEN` returns a friction, deferral or failure winner that has no `status` as stored, takes `compliance` / `counter` / `outcome` with `--ledger=stats`, refuses a supplied `ts` / `schema` / `bkit`, a flat top-level field `by` holds, a wrong kind, an invalid row, an empty rows file, an unlisted writer and the `issues` ledger, writing nothing on refusal; `check` passes when every `**Ledger rows:**` key has a `decision` / `deferral` row or the line reads `None`, and exits 11 naming keys with no row (a `knowledge` row does not count), on a missing line or an unfilled one. `triage --fid= --plan=`: a `low-severity` deferral stays `Exempt`, another feature's rows and a FID with no row print and write nothing, an unjustified row prints its `bucket` and appends one same-`key` `unjustified` / `TRIAGED` row with a minted `ts`, a row whose only declaration is itself stays `Lazy`, a `CLOSED` row stays `Exempt` with no test result and no write, an already-adjudicated `unjustified` row reports `Lazy` (never `Exempt`) and writes nothing on a re-run; a plan with no task blocks exits 1 with the no-markers reason, and a plan whose task blocks do not parse exits 2 naming the line, both writing nothing. `compact`: every keyed ledger by default with per-ledger counts, `--ledger` narrows, `--dry-run` writes nothing, a second run changes nothing, an unknown `--ledger` exits 2. |
 | `commands/workflow/context.test.ts` | Unit (boundary: real `bash` for blocks, real temp git repos for `diff`) | `bkit context clamp / clamp-log / ledger-scan / diff / brief / list-blocks / run-block / finalise` (`fetch` in `context-fetch.test.ts`): both profiles read against the clamped file, in-place loss markers, ceiling; ranked ledger scan; `diff` writes `{base}...HEAD` without `docs/plans/**` with `--numstat` totals, `--base` narrows to a group's start sha (a `build-group-start` row's `parentSha` via `status route`), unknown base exits 5 and writes nothing, empty range writes a one-line note, past the 10000-line guard a `partial diff coverage` first line + `--stat` + the largest files first cut to 500 lines each, `topFiles` / `totalLines` ceiling, record in the clamp log; `brief` `--next` picks the first group with an open task (none open: nothing written, `group: null`), leaves out a task with a `DONE — TASK N` log line, carries one-line summaries of earlier `DEPENDS ON` tasks, the note file under Deviations, the reds already recorded, the Reuse Inventory rows and Architecture entries naming the open tasks' files (past the 8 KB work cap left out and counted), prints only path / size / group / tasks / `workBytes` / `workCap`, an unknown group exits 2; block parsing by ordinal; fence written byte-for-byte, clamp inside the fence; finalise verdict / contexts / records; `finalise --record` writes + commits the `context-fetch` row and prints the comment (`--file` required). |
 | `commands/workflow/roadmap.test.ts` | Unit (real fixture ledgers, real git remote for `mirror`) | `bkit roadmap fold`: ledger projection, deterministic regenerate, `ABANDONED` hidden, fail-open on malformed / absent ledger and unwritable board, consumer text preserved, notes blocks, `## Shipped` cap, marker self-heal. `feature --strict` (exit 1 when not appended); `feature` fills `firstTs` / `updates` from the same-identity rows. `mirror`: worktree row then the same row committed in a throwaway `origin/dev` checkout and pushed as `dev`, skipped only on `dev`, a refused push never fails the close. |
 | `.bkit/core/engine/ledgers/migrate.test.ts` | Unit | Ledger rows without `schema` rewritten through `normalize` (idempotent; malformed, non-object, blank and schema lines kept byte-for-byte; CRLF and missing final newline kept; an old line whose rewrite the file holds dropped, repeated old lines with none kept); `migrateLedgers` rewrites in place via temp file, dry run counts only, missing ledgers skipped; `isSchemaLedger` covers every ledger. |
