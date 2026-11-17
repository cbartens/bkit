diff --git a/.bkit/core/engine/commands/lib.ts b/.bkit/core/engine/commands/lib.ts
index 340d5fe6e..4967304b4 100644
--- a/.bkit/core/engine/commands/lib.ts
+++ b/.bkit/core/engine/commands/lib.ts
@@ -641,6 +641,27 @@ export function worktreeFingerprint(top: string): string {
   return createHash("sha256").update(top).digest("hex").slice(0, 16);
 }
 
+/**
+ * Whether `file` resolves, symlinks included, to a path inside the checkout `top` and not in
+ * a worktree nested under it. A file that does not exist yet resolves through its parent.
+ */
+function resolvesInside(top: string, file: string): boolean {
+  try {
+    const realTop = fs.realpathSync(top);
+    let real: string;
+    if (fs.existsSync(file) || fs.lstatSync(file, { throwIfNoEntry: false }) !== undefined) {
+      real = fs.realpathSync(file);
+    } else {
+      real = path.join(fs.realpathSync(path.dirname(file)), path.basename(file));
+    }
+    if (real !== realTop && !real.startsWith(realTop + path.sep)) return false;
+    const owner = git(path.dirname(real), ["rev-parse", "--show-toplevel"]);
+    return owner === null || fs.realpathSync(owner) === realTop;
+  } catch {
+    return false;
+  }
+}
+
 /**
  * Rebuild the outbox receipt of run-scoped invocation `id` from its `invocation` event in a
  * `status.jsonl` under this checkout. Reads only this checkout's books, so another
@@ -655,6 +676,8 @@ function rebuildInvocation(cwd: string, id: string): boolean {
       if (++read > ACTIVE_RUN_SCAN_CAP) return false;
       const statusPath = path.join(top, statusRelPath(month, fid));
       if (!fs.existsSync(statusPath)) continue;
+      // A status file symlinked out of the checkout is not this checkout's book.
+      if (!resolvesInside(top, statusPath)) continue;
       for (const line of fs.readFileSync(statusPath, "utf-8").split("\n")) {
         if (!line.includes(id)) continue;
         const row = parseJson(line);
@@ -732,6 +755,8 @@ export function resolveInvocation(
     if (inv.statusPath === null || inv.workflow === null || inv.run === null)
       return refuse("run receipt lacks its status file");
     if (!fs.existsSync(inv.statusPath)) return refuse(`stale: ${inv.statusPath} is gone`);
+    if (!resolvesInside(top, inv.statusPath))
+      return refuse(`${inv.statusPath} resolves outside this checkout`);
     const events: StatusEvent[] = [];
     for (const line of fs.readFileSync(inv.statusPath, "utf-8").split("\n")) {
       const row = line.trim() === "" ? null : parseJson(line);
diff --git a/.bkit/core/engine/commands/workflow/issues.ts b/.bkit/core/engine/commands/workflow/issues.ts
index 1c5abebb9..8e6685740 100644
--- a/.bkit/core/engine/commands/workflow/issues.ts
+++ b/.bkit/core/engine/commands/workflow/issues.ts
@@ -718,12 +718,25 @@ const kebab = (text: string) =>
 export interface AuditEntry extends AuditFinding {
   /** Report-local, stable under reordering: `<slug>-<n>` over the severity/location/title order. */
   id: string;
-  /** The ledger key: the judged prior key, else derived from the slug and title. */
+  /** The ledger key: the judged prior key, else derived from the slug and title and unique in the ledger. */
   key: string;
 }
 
-/** The findings in their one deterministic order, each with its ID and ledger key. */
-export function auditEntries(result: AuditResult): AuditEntry[] {
+/** A ledger row already holding a key: what finding it records, so a re-render can recognise it. */
+export interface HeldRow {
+  summary: string;
+  locations: readonly string[];
+}
+
+/**
+ * The findings in their one deterministic order, each with its ID and ledger key. A held key whose
+ * row has the same summary and `file:line` is the same finding and is reused; a held key of a
+ * different finding is a collision and gets a suffix.
+ */
+export function auditEntries(
+  result: AuditResult,
+  held: ReadonlyMap<string, HeldRow> = new Map(),
+): AuditEntry[] {
   const rank = (s: AuditSeverity) => AUDIT_SEVERITIES.indexOf(s);
   const ordered = [...result.findings].sort(
     (a, b) =>
@@ -738,7 +751,11 @@ export function auditEntries(result: AuditResult): AuditEntry[] {
     if (key === undefined) {
       const base = `audit-${result.slug}-${kebab(f.title) || "finding"}`;
       key = base;
-      for (let n = 2; used.has(key); n += 1) key = `${base}-${n}`;
+      const same = (k: string) => {
+        const row = held.get(k);
+        return row !== undefined && row.summary === f.title && row.locations.includes(f.location);
+      };
+      for (let n = 2; used.has(key) || (held.has(key) && !same(key)); n += 1) key = `${base}-${n}`;
       used.add(key);
     }
     return { ...f, id: `${result.slug}-${i + 1}`, key };
@@ -746,8 +763,11 @@ export function auditEntries(result: AuditResult): AuditEntry[] {
 }
 
 /** One `failure` ledger payload per finding, ready for `bkit ledgers append`. */
-export function auditLedgerRows(result: AuditResult): Array<Record<string, unknown>> {
-  return auditEntries(result).map((e) => ({
+export function auditLedgerRows(
+  result: AuditResult,
+  held: ReadonlyMap<string, HeldRow> = new Map(),
+): Array<Record<string, unknown>> {
+  return auditEntries(result, held).map((e) => ({
     kind: "failure",
     key: e.key,
     summary: e.title,
diff --git a/.bkit/core/engine/commands/workflow/status.test.ts b/.bkit/core/engine/commands/workflow/status.test.ts
index 15a1a6d2c..b5f907cb8 100644
--- a/.bkit/core/engine/commands/workflow/status.test.ts
+++ b/.bkit/core/engine/commands/workflow/status.test.ts
@@ -1266,6 +1266,23 @@ describe("bkit status invocation", () => {
     expect(fs.readFileSync(otherFile, "utf-8")).toBe(before);
   });
 
+  it("refuses to issue an invocation through a status file symlinked out of the checkout", async () => {
+    const mine = tmp();
+    spawnSync("git", ["init", "-q", "-b", "dev"], { cwd: mine });
+    const other = runRepo();
+    const otherFile = path.join(other, REL);
+    const before = fs.readFileSync(otherFile, "utf-8");
+    fs.mkdirSync(path.dirname(path.join(mine, REL)), { recursive: true });
+    fs.symlinkSync(otherFile, path.join(mine, REL));
+    const r = await run(
+      ["status", "invocation", "--workflow=build", "--step=build-branch-sync", `--file=${REL}`],
+      mine,
+    );
+    expect(r.code).not.toBe(0);
+    expect(fs.readFileSync(otherFile, "utf-8")).toBe(before);
+    expect(fs.readFileSync(otherFile, "utf-8")).not.toContain('"invocation"');
+  });
+
   it("writes no absolute checkout path into the run's committed invocation event", async () => {
     const root = runRepo();
     const statusFile = path.join(root, REL);
diff --git a/.bkit/core/engine/commands/workflow/status.ts b/.bkit/core/engine/commands/workflow/status.ts
index b7d6b458c..6ed882bea 100644
--- a/.bkit/core/engine/commands/workflow/status.ts
+++ b/.bkit/core/engine/commands/workflow/status.ts
@@ -689,6 +689,13 @@ export const statusCommand: CommandSpec = {
             return path.join(fs.realpathSync(dir), ...tail);
           })();
           const realTop = fs.realpathSync(top);
+          // A status file that is itself a symlink resolves wherever it points; the parent
+          // directory alone says nothing about where appends land.
+          if (fs.lstatSync(statusPath, { throwIfNoEntry: false })?.isSymbolicLink() === true)
+            throw new CommandError(
+              EXIT.USAGE,
+              `--file ${file} is a symbolic link; issue the invocation for the status file itself`,
+            );
           // The checkout that owns the file: a worktree nested under this one has its own top
           // folder, so a plain path-prefix test would accept it.
           let ownerDir = path.dirname(realFile);
diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index f84ac82ab..7c8096d6a 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -2555,6 +2555,87 @@ describe("bkit steps stub --result-file", () => {
     expect(fs.existsSync(path.join(cwd, "logs/c.md"))).toBe(false);
   });
 
+  it("derives a fresh audit key when the ledger already holds it", async () => {
+    const cwd = repo();
+    fs.mkdirSync(path.join(cwd, "docs"), { recursive: true });
+    const old = {
+      schema: 3,
+      ts: 1794028322438,
+      firstTs: 1794028322438,
+      updates: 1,
+      kind: "failure",
+      key: "audit-security-token-logged",
+      repo: "cbartens/bkit",
+      bkit: { version: "6.1.1" },
+      by: { workflow: "audit", step: "audit:security" },
+      references: ["src/old.ts:9"],
+      severity: "HIGH",
+      summary: "Token logged",
+      description: "Token logged (src/old.ts:9); audit security finding security-1",
+      status: "OPEN",
+    };
+    write(cwd, "docs/failures.jsonl", JSON.stringify(old) + "\n");
+    write(
+      cwd,
+      "logs/a.json",
+      JSON.stringify({
+        slug: "security",
+        status: "COMPLETE",
+        report: "docs/audits/202611/security.md",
+        findings: [{ severity: "HIGH", title: "Token logged", location: "src/new.ts:42" }],
+        notChecked: [],
+      }),
+    );
+    const res = await run(cwd, [
+      "steps",
+      "stub",
+      "--agent=bkit-audit-generate",
+      "--result-file=logs/a.json",
+      "--to=logs/a.md",
+    ]);
+    expect(res.code).toBe(0);
+    const rows = res.json.ledgerRows as Array<Record<string, unknown>>;
+    expect(rows).toHaveLength(1);
+    // The old, still-open row keeps its key; the new problem gets a suffixed one.
+    expect(rows[0]!["key"]).not.toBe("audit-security-token-logged");
+    expect(rows[0]!["key"]).toBe("audit-security-token-logged-2");
+  });
+
+  // Added test (not a planned Task 30 test): the key is stable across a re-render after the append.
+  it("keeps the audit key when the same finding is rendered again after its append", async () => {
+    const cwd = repo();
+    fs.mkdirSync(path.join(cwd, "docs"), { recursive: true });
+    write(
+      cwd,
+      "logs/a.json",
+      JSON.stringify({
+        slug: "security",
+        status: "COMPLETE",
+        report: "docs/audits/202611/security.md",
+        findings: [{ severity: "HIGH", title: "Token logged", location: "src/new.ts:42" }],
+        notChecked: [],
+      }),
+    );
+    const args = [
+      "steps",
+      "stub",
+      "--agent=bkit-audit-generate",
+      "--result-file=logs/a.json",
+      "--to=logs/a.md",
+    ];
+    const first = await run(cwd, args);
+    expect(first.code).toBe(0);
+    const row = (first.json.ledgerRows as Array<Record<string, unknown>>)[0]!;
+    expect(row["key"]).toBe("audit-security-token-logged");
+    // The audit's own append lands in the ledger.
+    write(cwd, "docs/failures.jsonl", JSON.stringify({ schema: 3, ...row }) + "\n");
+    const again = await run(cwd, args);
+    expect(again.code).toBe(0);
+    expect((again.json.ledgerRows as Array<Record<string, unknown>>)[0]!["key"]).toBe(
+      "audit-security-token-logged",
+    );
+  });
+
   it("refuses a result file left from an earlier round", async () => {
     const cwd = repo();
     const agent = "bkit-build-challenge-1";
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index fcc25cc08..b9b8a2666 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -27,7 +27,7 @@ import {
 } from "../../ledgers/status.js";
 import { clampLogPath, readRecords } from "../../ledgers/clamp-log.js";
 import { appendFrictionRow, frictionRow, journalEnabled } from "../../ledgers/journal.js";
-import { resolveRepoSlug } from "../../ledgers/telemetry.js";
+import { queryLedger, resolveRepoSlug } from "../../ledgers/telemetry.js";
 import { getPromptsRoot } from "../../shared/package-roots.js";
 import { readTextFile } from "../../shared/json.js";
 import {
@@ -63,6 +63,7 @@ import {
   buildComment,
   parseAuditResult,
   type AuditResult,
+  type HeldRow,
 } from "./issues.js";
 import {
   EXIT_FOREIGN_PATH,
@@ -1558,8 +1559,34 @@ const withFingerprint = (head: string[], body: string): Rendered["text"] => {
 const fingerprintOf = (text: string): string =>
   artifactFingerprint(text.split("\n"), text.split("\n").indexOf(VERDICT_END));
 
-function renderAudit(result: AuditResult): Rendered {
-  const entries = auditEntries(result);
+/**
+ * Every key the failures ledger (found from the repository root) already holds, with the finding
+ * each row records, so a derived audit key never lands on a different finding's row.
+ */
+function ledgerKeys(cwd: string): Map<string, HeldRow> {
+  const file = path.join(repoRoot(cwd), "docs", "failures.jsonl");
+  const held = new Map<string, HeldRow>();
+  if (!fs.existsSync(file)) return held;
+  for (const row of queryLedger(fs.readFileSync(file, "utf8")).rows) {
+    const r: Record<string, unknown> = { ...row };
+    if (typeof r["key"] !== "string") continue;
+    const locations = Array.isArray(r["references"])
+      ? r["references"].filter((x): x is string => typeof x === "string")
+      : [];
+    const text = typeof r["description"] === "string" ? r["description"] : "";
+    const fromText = /\((\S+:\d+)\);/.exec(text);
+    if (fromText?.[1] !== undefined) locations.push(fromText[1]);
+    held.set(r["key"], {
+      summary: typeof r["summary"] === "string" ? r["summary"] : "",
+      locations,
+    });
+  }
+  return held;
+}
+
+function renderAudit(cwd: string, result: AuditResult): Rendered {
+  const held = ledgerKeys(cwd);
+  const entries = auditEntries(result, held);
   const totals = auditTotals(result.findings);
   const head = [
     `Status: ${result.status}`,
@@ -1610,7 +1637,7 @@ function renderAudit(result: AuditResult): Rendered {
     extra: {
       ids: entries.map((e) => e.id),
       totals,
-      ledgerRows: auditLedgerRows(result),
+      ledgerRows: auditLedgerRows(result, held),
     },
   };
 }
@@ -1625,7 +1652,7 @@ export function renderResult(cwd: string, agent: string, raw: unknown): Rendered
   const bad = (why: string) => new CommandError(EXIT_INVALID, `result: ${why}`);
   if (agent === AUDIT_AGENT) {
     try {
-      return renderAudit(parseAuditResult(raw));
+      return renderAudit(cwd, parseAuditResult(raw));
     } catch (err) {
       throw err instanceof CommandError ? bad(err.message) : err;
     }
diff --git a/dist/commands/lib.js b/dist/commands/lib.js
index d8ab17e04..9f35f1e7a 100644
--- a/dist/commands/lib.js
+++ b/dist/commands/lib.js
@@ -423,6 +423,29 @@ export function writeInvocation(cwd, inv) {
 export function worktreeFingerprint(top) {
     return createHash("sha256").update(top).digest("hex").slice(0, 16);
 }
+/**
+ * Whether `file` resolves, symlinks included, to a path inside the checkout `top` and not in
+ * a worktree nested under it. A file that does not exist yet resolves through its parent.
+ */
+function resolvesInside(top, file) {
+    try {
+        const realTop = fs.realpathSync(top);
+        let real;
+        if (fs.existsSync(file) || fs.lstatSync(file, { throwIfNoEntry: false }) !== undefined) {
+            real = fs.realpathSync(file);
+        }
+        else {
+            real = path.join(fs.realpathSync(path.dirname(file)), path.basename(file));
+        }
+        if (real !== realTop && !real.startsWith(realTop + path.sep))
+            return false;
+        const owner = git(path.dirname(real), ["rev-parse", "--show-toplevel"]);
+        return owner === null || fs.realpathSync(owner) === realTop;
+    }
+    catch {
+        return false;
+    }
+}
 /**
  * Rebuild the outbox receipt of run-scoped invocation `id` from its `invocation` event in a
  * `status.jsonl` under this checkout. Reads only this checkout's books, so another
@@ -440,6 +463,9 @@ function rebuildInvocation(cwd, id) {
             const statusPath = path.join(top, statusRelPath(month, fid));
             if (!fs.existsSync(statusPath))
                 continue;
+            // A status file symlinked out of the checkout is not this checkout's book.
+            if (!resolvesInside(top, statusPath))
+                continue;
             for (const line of fs.readFileSync(statusPath, "utf-8").split("\n")) {
                 if (!line.includes(id))
                     continue;
@@ -518,6 +544,8 @@ export function resolveInvocation(cwd, id, flags) {
             return refuse("run receipt lacks its status file");
         if (!fs.existsSync(inv.statusPath))
             return refuse(`stale: ${inv.statusPath} is gone`);
+        if (!resolvesInside(top, inv.statusPath))
+            return refuse(`${inv.statusPath} resolves outside this checkout`);
         const events = [];
         for (const line of fs.readFileSync(inv.statusPath, "utf-8").split("\n")) {
             const row = line.trim() === "" ? null : parseJson(line);
diff --git a/dist/commands/workflow/issues.js b/dist/commands/workflow/issues.js
index 02f47a502..7467d7ec0 100644
--- a/dist/commands/workflow/issues.js
+++ b/dist/commands/workflow/issues.js
@@ -562,8 +562,12 @@ const kebab = (text) => text
     .replace(/[^a-z0-9]+/g, "-")
     .replace(/^-+|-+$/g, "")
     .slice(0, 48);
-/** The findings in their one deterministic order, each with its ID and ledger key. */
-export function auditEntries(result) {
+/**
+ * The findings in their one deterministic order, each with its ID and ledger key. A held key whose
+ * row has the same summary and `file:line` is the same finding and is reused; a held key of a
+ * different finding is a collision and gets a suffix.
+ */
+export function auditEntries(result, held = new Map()) {
     const rank = (s) => AUDIT_SEVERITIES.indexOf(s);
     const ordered = [...result.findings].sort((a, b) => rank(a.severity) - rank(b.severity) ||
         a.location.localeCompare(b.location) ||
@@ -575,7 +579,11 @@ export function auditEntries(result) {
         if (key === undefined) {
             const base = `audit-${result.slug}-${kebab(f.title) || "finding"}`;
             key = base;
-            for (let n = 2; used.has(key); n += 1)
+            const same = (k) => {
+                const row = held.get(k);
+                return row !== undefined && row.summary === f.title && row.locations.includes(f.location);
+            };
+            for (let n = 2; used.has(key) || (held.has(key) && !same(key)); n += 1)
                 key = `${base}-${n}`;
             used.add(key);
         }
@@ -583,8 +591,8 @@ export function auditEntries(result) {
     });
 }
 /** One `failure` ledger payload per finding, ready for `bkit ledgers append`. */
-export function auditLedgerRows(result) {
-    return auditEntries(result).map((e) => ({
+export function auditLedgerRows(result, held = new Map()) {
+    return auditEntries(result, held).map((e) => ({
         kind: "failure",
         key: e.key,
         summary: e.title,
diff --git a/dist/commands/workflow/status.js b/dist/commands/workflow/status.js
index db8e1b620..1eb1fae90 100644
--- a/dist/commands/workflow/status.js
+++ b/dist/commands/workflow/status.js
@@ -586,6 +586,10 @@ export const statusCommand = {
                         return path.join(fs.realpathSync(dir), ...tail);
                     })();
                     const realTop = fs.realpathSync(top);
+                    // A status file that is itself a symlink resolves wherever it points; the parent
+                    // directory alone says nothing about where appends land.
+                    if (fs.lstatSync(statusPath, { throwIfNoEntry: false })?.isSymbolicLink() === true)
+                        throw new CommandError(EXIT.USAGE, `--file ${file} is a symbolic link; issue the invocation for the status file itself`);
                     // The checkout that owns the file: a worktree nested under this one has its own top
                     // folder, so a plain path-prefix test would accept it.
                     let ownerDir = path.dirname(realFile);
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index 71f1fed8b..038c43c63 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -15,7 +15,7 @@ import * as path from "node:path";
 import { actionKey, activeDoneSteps, allRunsDoneSteps, appendLine, ciRoundMatches, runNumber, runOrStepField, statusTimestamp, } from "../../ledgers/status.js";
 import { clampLogPath, readRecords } from "../../ledgers/clamp-log.js";
 import { appendFrictionRow, frictionRow, journalEnabled } from "../../ledgers/journal.js";
-import { resolveRepoSlug } from "../../ledgers/telemetry.js";
+import { queryLedger, resolveRepoSlug } from "../../ledgers/telemetry.js";
 import { getPromptsRoot } from "../../shared/package-roots.js";
 import { readTextFile } from "../../shared/json.js";
 import { CommandError, EXIT, git, isSharedBranch, parseJson, repoRoot, runGit, } from "../lib.js";
@@ -1253,8 +1253,36 @@ const withFingerprint = (head, body) => {
     return `${head.join("\n")}\n${FINGERPRINT}: ${fingerprint}\n${VERDICT_END}\n\n${body}`;
 };
 const fingerprintOf = (text) => artifactFingerprint(text.split("\n"), text.split("\n").indexOf(VERDICT_END));
-function renderAudit(result) {
-    const entries = auditEntries(result);
+/**
+ * Every key the failures ledger (found from the repository root) already holds, with the finding
+ * each row records, so a derived audit key never lands on a different finding's row.
+ */
+function ledgerKeys(cwd) {
+    const file = path.join(repoRoot(cwd), "docs", "failures.jsonl");
+    const held = new Map();
+    if (!fs.existsSync(file))
+        return held;
+    for (const row of queryLedger(fs.readFileSync(file, "utf8")).rows) {
+        const r = { ...row };
+        if (typeof r["key"] !== "string")
+            continue;
+        const locations = Array.isArray(r["references"])
+            ? r["references"].filter((x) => typeof x === "string")
+            : [];
+        const text = typeof r["description"] === "string" ? r["description"] : "";
+        const fromText = /\((\S+:\d+)\);/.exec(text);
+        if (fromText?.[1] !== undefined)
+            locations.push(fromText[1]);
+        held.set(r["key"], {
+            summary: typeof r["summary"] === "string" ? r["summary"] : "",
+            locations,
+        });
+    }
+    return held;
+}
+function renderAudit(cwd, result) {
+    const held = ledgerKeys(cwd);
+    const entries = auditEntries(result, held);
     const totals = auditTotals(result.findings);
     const head = [
         `Status: ${result.status}`,
@@ -1302,7 +1330,7 @@ function renderAudit(result) {
         extra: {
             ids: entries.map((e) => e.id),
             totals,
-            ledgerRows: auditLedgerRows(result),
+            ledgerRows: auditLedgerRows(result, held),
         },
     };
 }
@@ -1316,7 +1344,7 @@ export function renderResult(cwd, agent, raw) {
     const bad = (why) => new CommandError(EXIT_INVALID, `result: ${why}`);
     if (agent === AUDIT_AGENT) {
         try {
-            return renderAudit(parseAuditResult(raw));
+            return renderAudit(cwd, parseAuditResult(raw));
         }
         catch (err) {
             throw err instanceof CommandError ? bad(err.message) : err;
