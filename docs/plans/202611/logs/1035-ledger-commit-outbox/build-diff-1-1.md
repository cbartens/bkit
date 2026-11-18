diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index d511bc83a..2812a43ec 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -1676,6 +1676,34 @@ describe("bkit decisions apply --by=owner and pending", () => {
     expect(row.description).toContain("Options: A) Accept / B) Fix now");
   });
 
+  it("pending refuses a --fid that climbs out of the log folder and reads and writes nothing", async () => {
+    const { root } = checkout();
+    const other = path.join(root, "docs/plans/202610/logs/other-run");
+    fs.mkdirSync(other, { recursive: true });
+    fs.writeFileSync(
+      path.join(other, "build-decision-1-1.md"),
+      [
+        "Status: ASSUMED",
+        "",
+        "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
+        "A) Accept — the item is recorded as accepted",
+        "B) Fix now — a fix task is added to the plan",
+        "Recommended: A) Accept — the caller already caps it",
+        "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
+        "Decision: A) Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(
+      ["decisions", "pending", "--fid=../other-run", "--month=202610", "--defer"],
+      root,
+    );
+    expect(r.code).toBe(2);
+    expect(r.err).toContain("--fid");
+    expect(r.json?.items).toBeUndefined();
+    expect(fs.existsSync(path.join(root, "docs/deferrals.jsonl"))).toBe(false);
+  });
+
   it("refuses a malformed --month", async () => {
     const { root } = checkout();
     expect((await run(["decisions", "pending", "--fid=7-x", "--month=2026-10"], root)).code).toBe(
diff --git a/.bkit/core/engine/commands/workflow/decisions.ts b/.bkit/core/engine/commands/workflow/decisions.ts
index ffdf8437b..89b86a3f5 100644
--- a/.bkit/core/engine/commands/workflow/decisions.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.ts
@@ -29,7 +29,7 @@ import { readJsonFile, readTextFile } from "../../shared/json.js";
 import { oneLine } from "../../shared/text.js";
 import { CommandError, EXIT, git, type CommandSpec } from "../lib.js";
 import { loopProgress } from "./counters.js";
-import { appendLedgerRows } from "./ledgers.js";
+import { appendLedgerRows, monthAndFid } from "./ledgers.js";
 import { LOOPS, loopGateStep } from "./loops.js";
 import {
   ITEM_SPLIT,
@@ -684,9 +684,8 @@ export const decisionsCommand: CommandSpec = {
       },
       run: (ctx) => {
         const top = root(ctx.cwd, ctx.flags.root);
-        const month = String(ctx.flags.month);
-        if (!/^[0-9]{6}$/.test(month)) throw new CommandError(EXIT.USAGE, "--month must be YYYYMM");
-        const logDir = path.join(top, "docs", "plans", month, "logs", String(ctx.flags.fid));
+        const { month, fid } = monthAndFid(ctx);
+        const logDir = path.join(top, "docs", "plans", month, "logs", fid);
         const items: Record<string, unknown>[] = [];
         const rows: Record<string, unknown>[] = [];
         for (const abs of decisionFiles(logDir)) {
diff --git a/.bkit/core/engine/commands/workflow/ledgers.test.ts b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index 2357720c7..59a4cd728 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.test.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -167,20 +167,20 @@ describe("bkit ledgers commit (tests/book-commit.bats)", () => {
     const r = repo();
     put(r, "README.md", "x\n");
     commitAll(r);
-    put(r, "docs/plans/202608/logs/446 space/status.jsonl", '{"a":1}\n');
+    put(r, "docs/plans/202608/logs/446-space/my status.jsonl", '{"a":1}\n');
     const res = await run(
       r,
       commitArgs(
         r,
         "--month=202608",
-        "--fid=446 space",
+        "--fid=446-space",
         "--scope=core",
         "--mode=commit",
         "--message=space test",
       ),
     );
     expect(res.code).toBe(0);
-    expect(stat(r)).toContain("446 space/status.jsonl");
+    expect(stat(r)).toContain("446-space/my status.jsonl");
   });
 
   it("nothing changed: exit 0, 'nothing to commit', no new commit", async () => {
@@ -254,6 +254,68 @@ describe("bkit ledgers commit (tests/book-commit.bats)", () => {
     expect(git(r, "ls-files", "--", "*.bkit-lock")).toBe("");
   });
 
+  it("a --fid that climbs out of the log folder is refused and commits nothing", async () => {
+    const r = repo();
+    put(r, "docs/plans/202608/logs/446-book/status.jsonl", '{"a":1}\n');
+    commitAll(r);
+    put(r, "src/app.ts", "export {};\n");
+    const before = head(r);
+    const res = await run(
+      r,
+      commitArgs(
+        r,
+        "--month=202608",
+        "--fid=../../../..",
+        "--scope=core",
+        "--mode=commit",
+        "--message=climb",
+      ),
+    );
+    expect(res.code).toBe(2);
+    expect(res.err).toContain("--fid");
+    expect(head(r)).toBe(before);
+    expect(git(r, "show", "--name-only", "--format=", "HEAD")).not.toContain("src/app.ts");
+  });
+
+  it("a --month that is not six digits is refused and commits nothing", async () => {
+    const r = repo();
+    put(r, "docs/plans/202608/logs/446-book/status.jsonl", '{"a":1}\n');
+    commitAll(r);
+    add(r, "docs/plans/202608/logs/446-book/status.jsonl", '{"a":2}\n');
+    const before = head(r);
+    const res = await run(
+      r,
+      commitArgs(r, "--month=*", "--fid=446-book", "--scope=core", "--mode=commit"),
+    );
+    expect(res.code).toBe(2);
+    expect(res.err).toContain("--month");
+    expect(head(r)).toBe(before);
+  });
+
+  it("a tracked *.bkit-lock that was removed is committed as a deletion by the bookkeeping commit", async () => {
+    const r = repo();
+    put(r, "docs/plans/202608/logs/446l/status.jsonl", "{}\n");
+    put(r, "docs/plans/202608/logs/446l/status.jsonl.bkit-lock", "");
+    commitAll(r);
+    fs.rmSync(path.join(r, "docs/plans/202608/logs/446l/status.jsonl.bkit-lock"));
+    add(r, "docs/plans/202608/logs/446l/status.jsonl", '{"more":1}\n');
+    const res = await run(
+      r,
+      commitArgs(
+        r,
+        "--month=202608",
+        "--fid=446l",
+        "--scope=core",
+        "--mode=commit",
+        "--message=lock deletion",
+      ),
+    );
+    expect(res.code).toBe(0);
+    const files = git(r, "show", "--name-status", "--format=", "HEAD");
+    expect(files).toMatch(/^D\s+docs\/plans\/202608\/logs\/446l\/status\.jsonl\.bkit-lock$/m);
+    expect(git(r, "ls-files", "--", "*.bkit-lock")).toBe("");
+  });
+
   it("empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit", async () => {
     const r = repo();
     put(r, "README.md", "x\n");
@@ -1023,6 +1085,24 @@ describe("bkit ledgers only-bookkeeping", () => {
     expect(res.json.outside).toEqual(["src/a.ts"]);
   });
 
+  it("only-bookkeeping refuses a wildcard or climbing --fid instead of passing a source change", async () => {
+    const r = base();
+    commitAll(r);
+    const from = head(r);
+    add(r, "src/a.ts", "b\n");
+    commitAll(r, "source");
+    const res = await run(r, [
+      "only-bookkeeping",
+      `--root=${r}`,
+      "--month=202610",
+      "--fid=../../../..",
+      `--from=${from}`,
+      `--to=${head(r)}`,
+    ]);
+    expect(res.code).toBe(2);
+    expect(res.err).toContain("--fid");
+  });
+
   it("another FID's plan file in the range: exit 7", async () => {
     const r = base();
     commitAll(r);
diff --git a/.bkit/core/engine/commands/workflow/ledgers.ts b/.bkit/core/engine/commands/workflow/ledgers.ts
index 1004f739f..0c968883a 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.ts
@@ -70,6 +70,7 @@ import {
   type RunContext,
 } from "../lib.js";
 import { CORRECTION_LIMIT, spendCorrection, type CorrectionSpend } from "./counters.js";
+import { FID_PATTERNS } from "./fids.js";
 import { readStatusRows, str } from "./status.js";
 import {
   NO_MARKERS_REASON,
@@ -220,6 +221,26 @@ const required = (ctx: RunContext, name: string): string => {
   return v;
 };
 
+/**
+ * `--month` and `--fid` after the shape check every bookkeeping path is built from: six digits
+ * and a lowercase slug, so neither can widen a pathspec or climb out of the log folder.
+ * `FID_PATTERNS` is read at call time only, because `fids.ts` imports this module through `locks.ts`.
+ */
+export const monthAndFid = (ctx: RunContext): { month: string; fid: string } => {
+  const month = required(ctx, "month");
+  const fid = required(ctx, "fid");
+  if (!/^[0-9]{6}$/.test(month)) {
+    throw new CommandError(EXIT.USAGE, `--month must be six digits (YYYYMM), got '${month}'`);
+  }
+  if (!FID_PATTERNS.none.test(fid)) {
+    throw new CommandError(
+      EXIT.USAGE,
+      `--fid must be a lowercase slug (letters, digits, hyphens), got '${fid}'`,
+    );
+  }
+  return { month, fid };
+};
+
 const rootOf = (ctx: RunContext) => path.resolve(ctx.cwd, str(ctx.flags.root) ?? ".");
 
 const ROOT_FLAG: FlagSpec = {
@@ -231,9 +252,14 @@ const MONTH_FLAG: FlagSpec = {
   name: "month",
   type: "string",
   required: true,
-  help: "YYYYMM bucket of the feature's logs",
+  help: "YYYYMM bucket of the feature's logs (six digits)",
+};
+const FID_FLAG: FlagSpec = {
+  name: "fid",
+  type: "string",
+  required: true,
+  help: "feature id (lowercase slug)",
 };
-const FID_FLAG: FlagSpec = { name: "fid", type: "string", required: true, help: "feature id" };
 
 /** Tracked files with uncommitted changes (`git status --porcelain` minus untracked). */
 function dirtyTracked(root: string): string[] {
@@ -1280,6 +1306,16 @@ export function commitBookkeeping(
     );
   }
   let paths = nulList(listed.stdout);
+  const removed = gitRaw(root, ["ls-files", "-z", "--deleted", "--", ...specs]);
+  if (removed.status !== 0) {
+    throw new CommandError(
+      EXIT_ROOT,
+      `'git ls-files --deleted' failed while building the pathspec: ${removed.stderr}`,
+    );
+  }
+  for (const p of nulList(removed.stdout)) {
+    if (p.endsWith(".bkit-lock") && !paths.includes(p)) paths.push(p);
+  }
   let ledgerRows: OwnSet["ledgers"] = [];
   if (rec !== null) {
     // Throws EXIT_FOREIGN_PATH when a recorded path in the allow-list changed.
@@ -1386,8 +1422,7 @@ function commit(ctx: RunContext): number {
     ...commitBookkeeping(
       {
         root: rootOf(ctx),
-        month: required(ctx, "month"),
-        fid: required(ctx, "fid"),
+        ...monthAndFid(ctx),
         scope: String(f.scope ?? "") as Scope,
         mode: String(f.mode) as BookkeepingCommit["mode"],
         message: str(f.message),
@@ -2396,8 +2431,7 @@ export function changedOutside(
 }
 
 function onlyBookkeeping(ctx: RunContext): number {
-  const month = required(ctx, "month");
-  const fid = required(ctx, "fid");
+  const { month, fid } = monthAndFid(ctx);
   const from = required(ctx, "from");
   const to = required(ctx, "to");
   const root = rootOf(ctx);
diff --git a/dist/commands/workflow/decisions.js b/dist/commands/workflow/decisions.js
index 5dfd36c01..bea96de42 100644
--- a/dist/commands/workflow/decisions.js
+++ b/dist/commands/workflow/decisions.js
@@ -27,7 +27,7 @@ import { readJsonFile, readTextFile } from "../../shared/json.js";
 import { oneLine } from "../../shared/text.js";
 import { CommandError, EXIT, git } from "../lib.js";
 import { loopProgress } from "./counters.js";
-import { appendLedgerRows } from "./ledgers.js";
+import { appendLedgerRows, monthAndFid } from "./ledgers.js";
 import { LOOPS, loopGateStep } from "./loops.js";
 import { ITEM_SPLIT, letterAt, parseDecisionItems, skipProblem, undecidedBesidesLoop, } from "./open-decision.js";
 import { classifyAt } from "./runtime.js";
@@ -561,10 +561,8 @@ export const decisionsCommand = {
             },
             run: (ctx) => {
                 const top = root(ctx.cwd, ctx.flags.root);
-                const month = String(ctx.flags.month);
-                if (!/^[0-9]{6}$/.test(month))
-                    throw new CommandError(EXIT.USAGE, "--month must be YYYYMM");
-                const logDir = path.join(top, "docs", "plans", month, "logs", String(ctx.flags.fid));
+                const { month, fid } = monthAndFid(ctx);
+                const logDir = path.join(top, "docs", "plans", month, "logs", fid);
                 const items = [];
                 const rows = [];
                 for (const abs of decisionFiles(logDir)) {
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index 1e5ded447..057af9d27 100644
--- a/dist/commands/workflow/ledgers.js
+++ b/dist/commands/workflow/ledgers.js
@@ -20,6 +20,7 @@ import { COMPACT_LEDGERS, compactLedgers } from "../../ledgers/compact.js";
 import { CORRECTION_REJECTED_ROW, CORRECTION_SUCCEEDED_ROW, actionHash, appendHeld, appendLine, correctionScope, ledgerEffect, ledgerIntent, ledgerOperation, ledgerOperationsFile, pendingLedgerIntentsFor, recordLedgerIntent, recordLedgerOperation, statusTimestamp, withTargetLock, writePrepared, } from "../../ledgers/status.js";
 import { CommandError, CorrectionExhausted, EXIT, INVOCATION_FLAG, invocationDir, isIgnoredPath, isSharedBranch, NoWriteRejection, parseJson, UncertainEffect, wholeNumber, } from "../lib.js";
 import { CORRECTION_LIMIT, spendCorrection } from "./counters.js";
+import { FID_PATTERNS } from "./fids.js";
 import { readStatusRows, str } from "./status.js";
 import { NO_MARKERS_REASON, outOfScope, parsePlanBlocks, reuseInventory, } from "./plan-blocks.js";
 /** Root is not a directory or repo, git is too old, or a ref does not resolve. */
@@ -118,6 +119,22 @@ const required = (ctx, name) => {
         throw new CommandError(EXIT.USAGE, `--${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)} is required`);
     return v;
 };
+/**
+ * `--month` and `--fid` after the shape check every bookkeeping path is built from: six digits
+ * and a lowercase slug, so neither can widen a pathspec or climb out of the log folder.
+ * `FID_PATTERNS` is read at call time only, because `fids.ts` imports this module through `locks.ts`.
+ */
+export const monthAndFid = (ctx) => {
+    const month = required(ctx, "month");
+    const fid = required(ctx, "fid");
+    if (!/^[0-9]{6}$/.test(month)) {
+        throw new CommandError(EXIT.USAGE, `--month must be six digits (YYYYMM), got '${month}'`);
+    }
+    if (!FID_PATTERNS.none.test(fid)) {
+        throw new CommandError(EXIT.USAGE, `--fid must be a lowercase slug (letters, digits, hyphens), got '${fid}'`);
+    }
+    return { month, fid };
+};
 const rootOf = (ctx) => path.resolve(ctx.cwd, str(ctx.flags.root) ?? ".");
 const ROOT_FLAG = {
     name: "root",
@@ -128,9 +145,14 @@ const MONTH_FLAG = {
     name: "month",
     type: "string",
     required: true,
-    help: "YYYYMM bucket of the feature's logs",
+    help: "YYYYMM bucket of the feature's logs (six digits)",
+};
+const FID_FLAG = {
+    name: "fid",
+    type: "string",
+    required: true,
+    help: "feature id (lowercase slug)",
 };
-const FID_FLAG = { name: "fid", type: "string", required: true, help: "feature id" };
 /** Tracked files with uncommitted changes (`git status --porcelain` minus untracked). */
 function dirtyTracked(root) {
     return gitRaw(root, ["status", "--porcelain"])
@@ -1024,6 +1046,14 @@ export function commitBookkeeping(o, log) {
         throw new CommandError(EXIT_ROOT, `'git ls-files' failed while building the pathspec: ${listed.stderr}`);
     }
     let paths = nulList(listed.stdout);
+    const removed = gitRaw(root, ["ls-files", "-z", "--deleted", "--", ...specs]);
+    if (removed.status !== 0) {
+        throw new CommandError(EXIT_ROOT, `'git ls-files --deleted' failed while building the pathspec: ${removed.stderr}`);
+    }
+    for (const p of nulList(removed.stdout)) {
+        if (p.endsWith(".bkit-lock") && !paths.includes(p))
+            paths.push(p);
+    }
     let ledgerRows = [];
     if (rec !== null) {
         // Throws EXIT_FOREIGN_PATH when a recorded path in the allow-list changed.
@@ -1109,8 +1139,7 @@ function commit(ctx) {
     ctx.emit({
         ...commitBookkeeping({
             root: rootOf(ctx),
-            month: required(ctx, "month"),
-            fid: required(ctx, "fid"),
+            ...monthAndFid(ctx),
             scope: String(f.scope ?? ""),
             mode: String(f.mode),
             message: str(f.message),
@@ -1939,8 +1968,7 @@ export function changedOutside(root, from, to, specs) {
     return { ok: true, changed, outside: changed.filter((p) => !allowed.has(p)) };
 }
 function onlyBookkeeping(ctx) {
-    const month = required(ctx, "month");
-    const fid = required(ctx, "fid");
+    const { month, fid } = monthAndFid(ctx);
     const from = required(ctx, "from");
     const to = required(ctx, "to");
     const root = rootOf(ctx);
