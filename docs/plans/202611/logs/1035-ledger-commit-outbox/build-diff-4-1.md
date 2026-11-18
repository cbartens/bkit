diff --git a/.bkit/core/engine/commands/workflow/ledgers.test.ts b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index 8658cd42b..9c24ff9a4 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.test.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -5,12 +5,14 @@ import * as path from "node:path";
 
 import { afterEach, describe, expect, it, vi } from "vitest";
 
-import { runCommand } from "../lib";
+import { CommandError, runCommand } from "../lib";
 import {
   EXIT_ROWS_MISSING,
   EXIT_ROW_REFUSED,
   appendLedgerRows,
   bookPathspecs,
+  checkOnlyBookkeeping,
+  commitBookkeeping,
   commitOwnSet,
   ledgersCommand,
   listRecords,
@@ -792,6 +794,23 @@ describe("bkit ledgers commit — a run in place on dev that shares its checkout
     expect(res.err).toContain("src/a.txt");
     expect(head(r)).toBe(before);
   });
+
+  it("a recorded tracked lock deleted during an in-place run does not refuse the bookkeeping commit", async () => {
+    const r = repo();
+    git(r, "switch", "-q", "-c", "dev");
+    put(r, `${LOGS}/status.jsonl`, "{}\n");
+    put(r, `${LOGS}/status.jsonl.bkit-lock`, "");
+    commitAll(r);
+    fs.writeFileSync(path.join(r, `${LOGS}/status.jsonl.bkit-lock`), '{"pid":1}');
+    writeRecord(r, newRecord(r, FID, "dev"));
+    fs.rmSync(path.join(r, `${LOGS}/status.jsonl.bkit-lock`));
+    add(r, `${LOGS}/status.jsonl`, '{"more":1}\n');
+    const res = await run(r, commitArgs(r, ...base, "--mode=commit", "--message=x"));
+    expect(res.code).toBe(0);
+    const files = git(r, "show", "--name-only", "--format=", "HEAD");
+    expect(files).toContain(`${LOGS}/status.jsonl`);
+    expect(files).not.toContain("bkit-lock");
+  });
 });
 
 describe("--squash-of (tests/book-commit.bats, #493)", () => {
@@ -2715,3 +2734,55 @@ describe("parked run commits", () => {
     expect(() => removeParkedCommits(cwd, FID)).not.toThrow();
   });
 });
+
+describe("the bookkeeping sinks check month and fid for every caller", () => {
+  function refusal(fn: () => unknown): CommandError {
+    try {
+      fn();
+    } catch (e) {
+      if (e instanceof CommandError) return e;
+      throw e;
+    }
+    throw new Error("expected a CommandError, got a return value");
+  }
+
+  it("checkOnlyBookkeeping refuses a climbing fid from any caller", () => {
+    const r = repo();
+    put(r, "README.md", "x\n");
+    commitAll(r, "base");
+    const from = head(r);
+    put(r, "src/a.ts", "a\n");
+    commitAll(r, "change");
+    const to = head(r);
+    const err = refusal(() =>
+      checkOnlyBookkeeping(r, { month: "202610", fid: "../../../..", from, to }),
+    );
+    expect(err.code).toBe(2);
+    expect(err.message).toContain("../../../..");
+  });
+
+  it("commitBookkeeping refuses a climbing fid from any caller", () => {
+    const r = repo();
+    put(r, "docs/plans/202608/logs/446-book/status.jsonl", "{}\n");
+    commitAll(r);
+    put(r, "src/app.ts", "app\n");
+    const before = head(r);
+    const err = refusal(() =>
+      commitBookkeeping(
+        {
+          root: r,
+          month: "202608",
+          fid: "../../../..",
+          scope: "core",
+          mode: "commit",
+          message: "climb",
+        },
+        () => {},
+      ),
+    );
+    expect(err.code).toBe(2);
+    expect(err.message).toContain("../../../..");
+    expect(head(r)).toBe(before);
+    expect(staged(r)).toBe("");
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/ledgers.ts b/.bkit/core/engine/commands/workflow/ledgers.ts
index fb2c833b4..3bacc4a14 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.ts
@@ -222,14 +222,14 @@ const required = (ctx: RunContext, name: string): string => {
 };
 
 /**
- * `--month` and `--fid` after the shape check every bookkeeping path is built from: six digits
- * and a lowercase slug, so neither can widen a pathspec or climb out of the log folder.
- * `FID_PATTERNS` is read at call time only, because `fids.ts` imports this module through `locks.ts`.
+ * The shape check every bookkeeping path is built from: a six-digit month and a lowercase slug
+ * FID, so neither can widen a pathspec or climb out of the log folder. `commitBookkeeping` and
+ * `checkOnlyBookkeeping` run it themselves, so every caller is covered; `month` = `*` is the
+ * one exemption, for the CI hook. `FID_PATTERNS` is read at call time only, because `fids.ts`
+ * imports this module through `locks.ts`.
  */
-export const monthAndFid = (ctx: RunContext): { month: string; fid: string } => {
-  const month = required(ctx, "month");
-  const fid = required(ctx, "fid");
-  if (!/^[0-9]{6}$/.test(month)) {
+export const checkMonthFid = (month: string, fid: string, anyMonth = false): void => {
+  if (!(anyMonth && month === "*") && !/^[0-9]{6}$/.test(month)) {
     throw new CommandError(EXIT.USAGE, `--month must be six digits (YYYYMM), got '${month}'`);
   }
   if (!FID_PATTERNS.none.test(fid)) {
@@ -238,6 +238,13 @@ export const monthAndFid = (ctx: RunContext): { month: string; fid: string } =>
       `--fid must be a lowercase slug (letters, digits, hyphens), got '${fid}'`,
     );
   }
+};
+
+/** `--month` and `--fid` after `checkMonthFid`. */
+export const monthAndFid = (ctx: RunContext): { month: string; fid: string } => {
+  const month = required(ctx, "month");
+  const fid = required(ctx, "fid");
+  checkMonthFid(month, fid);
   return { month, fid };
 };
 
@@ -1207,6 +1214,7 @@ export function commitBookkeeping(
   log: (m: string) => void,
 ): BookkeepingResult {
   const { root, month, fid, scope, mode, message, squashOf } = o;
+  checkMonthFid(month, fid);
   if (o.path !== undefined) {
     if (mode === "stage" || !MODES.includes(mode)) {
       throw new CommandError(EXIT.USAGE, "--path needs --mode=commit or commit-allow-empty");
@@ -1313,16 +1321,16 @@ export function commitBookkeeping(
       `'git ls-files --deleted' failed while building the pathspec: ${removed.stderr}`,
     );
   }
-  for (const p of nulList(removed.stdout)) {
-    if (p.endsWith(".bkit-lock") && !paths.includes(p)) paths.push(p);
-  }
+  const removedLocks = nulList(removed.stdout).filter((p) => p.endsWith(".bkit-lock"));
   let ledgerRows: OwnSet["ledgers"] = [];
   if (rec !== null) {
     // Throws EXIT_FOREIGN_PATH when a recorded path in the allow-list changed.
     ledgerRows = ownSet(root, rec, paths).ledgers;
     const recorded = new Set(rec.paths.map((p) => p.path));
     paths = paths.filter((p) => !recorded.has(p));
+    removedLocks.splice(0, removedLocks.length, ...removedLocks.filter((p) => !recorded.has(p)));
   }
+  for (const p of removedLocks) if (!paths.includes(p)) paths.push(p);
   let squashPaths: string[] = [];
   if (squashOf !== undefined) {
     const diff = gitRaw(root, ["diff", "--name-only", "-z", "--no-renames", `HEAD...${squashOf}`]);
@@ -1422,7 +1430,8 @@ function commit(ctx: RunContext): number {
     ...commitBookkeeping(
       {
         root: rootOf(ctx),
-        ...monthAndFid(ctx),
+        month: required(ctx, "month"),
+        fid: required(ctx, "fid"),
         scope: String(f.scope ?? "") as Scope,
         mode: String(f.mode) as BookkeepingCommit["mode"],
         message: str(f.message),
@@ -2381,6 +2390,7 @@ export function checkOnlyBookkeeping(
   root: string,
   o: { month: string; fid: string; from: string; to: string },
 ): BookkeepingCheck {
+  checkMonthFid(o.month, o.fid, true);
   for (const ref of [o.from, o.to]) {
     if (gitRaw(root, ["cat-file", "-e", `${ref}^{commit}`]).status !== 0) {
       return { kind: "unknown-commit", ref };
@@ -2432,7 +2442,8 @@ export function changedOutside(
 }
 
 function onlyBookkeeping(ctx: RunContext): number {
-  const { month, fid } = monthAndFid(ctx);
+  const month = required(ctx, "month");
+  const fid = required(ctx, "fid");
   const from = required(ctx, "from");
   const to = required(ctx, "to");
   const root = rootOf(ctx);
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index 4a9fe8d29..d95a46859 100644
--- a/dist/commands/workflow/ledgers.js
+++ b/dist/commands/workflow/ledgers.js
@@ -120,19 +120,25 @@ const required = (ctx, name) => {
     return v;
 };
 /**
- * `--month` and `--fid` after the shape check every bookkeeping path is built from: six digits
- * and a lowercase slug, so neither can widen a pathspec or climb out of the log folder.
- * `FID_PATTERNS` is read at call time only, because `fids.ts` imports this module through `locks.ts`.
+ * The shape check every bookkeeping path is built from: a six-digit month and a lowercase slug
+ * FID, so neither can widen a pathspec or climb out of the log folder. `commitBookkeeping` and
+ * `checkOnlyBookkeeping` run it themselves, so every caller is covered; `month` = `*` is the
+ * one exemption, for the CI hook. `FID_PATTERNS` is read at call time only, because `fids.ts`
+ * imports this module through `locks.ts`.
  */
-export const monthAndFid = (ctx) => {
-    const month = required(ctx, "month");
-    const fid = required(ctx, "fid");
-    if (!/^[0-9]{6}$/.test(month)) {
+export const checkMonthFid = (month, fid, anyMonth = false) => {
+    if (!(anyMonth && month === "*") && !/^[0-9]{6}$/.test(month)) {
         throw new CommandError(EXIT.USAGE, `--month must be six digits (YYYYMM), got '${month}'`);
     }
     if (!FID_PATTERNS.none.test(fid)) {
         throw new CommandError(EXIT.USAGE, `--fid must be a lowercase slug (letters, digits, hyphens), got '${fid}'`);
     }
+};
+/** `--month` and `--fid` after `checkMonthFid`. */
+export const monthAndFid = (ctx) => {
+    const month = required(ctx, "month");
+    const fid = required(ctx, "fid");
+    checkMonthFid(month, fid);
     return { month, fid };
 };
 const rootOf = (ctx) => path.resolve(ctx.cwd, str(ctx.flags.root) ?? ".");
@@ -961,6 +967,7 @@ function commitOnePath(o, log) {
  */
 export function commitBookkeeping(o, log) {
     const { root, month, fid, scope, mode, message, squashOf } = o;
+    checkMonthFid(month, fid);
     if (o.path !== undefined) {
         if (mode === "stage" || !MODES.includes(mode)) {
             throw new CommandError(EXIT.USAGE, "--path needs --mode=commit or commit-allow-empty");
@@ -1050,17 +1057,18 @@ export function commitBookkeeping(o, log) {
     if (removed.status !== 0) {
         throw new CommandError(EXIT_ROOT, `'git ls-files --deleted' failed while building the pathspec: ${removed.stderr}`);
     }
-    for (const p of nulList(removed.stdout)) {
-        if (p.endsWith(".bkit-lock") && !paths.includes(p))
-            paths.push(p);
-    }
+    const removedLocks = nulList(removed.stdout).filter((p) => p.endsWith(".bkit-lock"));
     let ledgerRows = [];
     if (rec !== null) {
         // Throws EXIT_FOREIGN_PATH when a recorded path in the allow-list changed.
         ledgerRows = ownSet(root, rec, paths).ledgers;
         const recorded = new Set(rec.paths.map((p) => p.path));
         paths = paths.filter((p) => !recorded.has(p));
+        removedLocks.splice(0, removedLocks.length, ...removedLocks.filter((p) => !recorded.has(p)));
     }
+    for (const p of removedLocks)
+        if (!paths.includes(p))
+            paths.push(p);
     let squashPaths = [];
     if (squashOf !== undefined) {
         const diff = gitRaw(root, ["diff", "--name-only", "-z", "--no-renames", `HEAD...${squashOf}`]);
@@ -1139,7 +1147,8 @@ function commit(ctx) {
     ctx.emit({
         ...commitBookkeeping({
             root: rootOf(ctx),
-            ...monthAndFid(ctx),
+            month: required(ctx, "month"),
+            fid: required(ctx, "fid"),
             scope: String(f.scope ?? ""),
             mode: String(f.mode),
             message: str(f.message),
@@ -1927,6 +1936,7 @@ function copy(from, to) {
  * check for `ledgers only-bookkeeping` and the ship gate's carry-forward.
  */
 export function checkOnlyBookkeeping(root, o) {
+    checkMonthFid(o.month, o.fid, true);
     for (const ref of [o.from, o.to]) {
         if (gitRaw(root, ["cat-file", "-e", `${ref}^{commit}`]).status !== 0) {
             return { kind: "unknown-commit", ref };
@@ -1969,7 +1979,8 @@ export function changedOutside(root, from, to, specs) {
     return { ok: true, changed, outside: changed.filter((p) => !allowed.has(p)) };
 }
 function onlyBookkeeping(ctx) {
-    const { month, fid } = monthAndFid(ctx);
+    const month = required(ctx, "month");
+    const fid = required(ctx, "fid");
     const from = required(ctx, "from");
     const to = required(ctx, "to");
     const root = rootOf(ctx);
