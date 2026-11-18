diff --git a/.bkit/core/engine/commands/workflow/ledgers.test.ts b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index 8658cd42b..f08fbaaad 100644
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
@@ -1103,6 +1122,24 @@ describe("bkit ledgers only-bookkeeping", () => {
     expect(res.err).toContain("--fid");
   });
 
+  it("only-bookkeeping refuses --month=* from the command line", async () => {
+    const r = base();
+    commitAll(r);
+    const from = head(r);
+    add(r, "src/a.ts", "b\n");
+    commitAll(r, "source");
+    const res = await run(r, [
+      "only-bookkeeping",
+      `--root=${r}`,
+      "--month=*",
+      "--fid=650-x",
+      `--from=${from}`,
+      `--to=${head(r)}`,
+    ]);
+    expect(res.code).toBe(2);
+    expect(res.err).toContain("--month");
+  });
+
   it("another FID's plan file in the range: exit 7", async () => {
     const r = base();
     commitAll(r);
@@ -2715,3 +2752,55 @@ describe("parked run commits", () => {
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
index fb2c833b4..bcb4c1e07 100644
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
diff --git a/DETAILS.md b/DETAILS.md
index b1ae187d0..a20801f8a 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -347,14 +347,14 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>265 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1956 symbols · 57 files"]
+    n_bkit_core_engine_commands["commands<br/>1958 symbols · 57 files"]
     n_bkit_core_engine_install["install<br/>366 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>241 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>157 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|476| n_bkit_core_engine_ledgers
+  n_bkit_core_engine_commands -->|478| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|431| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|219| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|187| n_bkit_core_engine_shared
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index 4a9fe8d29..5bfd4ec99 100644
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
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 8a6251743..227a2b955 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -126,14 +126,14 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>265 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1956 symbols · 57 files"]
+    n_bkit_core_engine_commands["commands<br/>1958 symbols · 57 files"]
     n_bkit_core_engine_install["install<br/>366 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>241 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>157 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|476| n_bkit_core_engine_ledgers
+  n_bkit_core_engine_commands -->|478| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|431| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|219| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|187| n_bkit_core_engine_shared
@@ -279,7 +279,7 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_fids["fids<br/>58 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_issues["issues<br/>61 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_junit["junit<br/>17 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_ledgers["ledgers<br/>126 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_ledgers["ledgers<br/>128 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_locks["locks<br/>40 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_loops["loops<br/>7 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_open_decision["open-decision<br/>17 symbols · 1 files"]
@@ -343,7 +343,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_branches -->|123| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_runs -->|76| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_workflows -->|75| n_bkit_core_engine_commands_lib
-  n_bkit_core_engine_commands_workflow_ledgers -->|52| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_ledgers -->|53| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_prs -->|51| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_worktrees -->|46| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_ledgers -->|43| n_bkit_core_engine_ledgers_status
@@ -471,6 +471,7 @@ flowchart LR
   n_bkit_core_engine_checks_after_index -->|9| n_bkit_core_engine_checks_before_env
   n_bkit_core_engine_commands_install_install -->|9| n_bkit_core_engine_checks_after_index
   n_bkit_core_engine_commands_install_uninstall -->|9| n_bkit_core_engine_shared_package_roots
+  n_bkit_core_engine_commands_lib -->|9| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_run_facts -->|9| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_workflow_runs -->|9| n_bkit_core_engine_shared_settings
   n_bkit_core_engine_commands_workflow_runs -->|9| n_bkit_core_engine_commands_workflow_repo
@@ -517,7 +518,6 @@ flowchart LR
   n_bkit_core_engine_commands_install_uninstall -->|7| n_bkit_core_engine_render_models
   n_bkit_core_engine_commands_install_upgrade -->|7| n_bkit_core_engine_install_placeholders
   n_bkit_core_engine_commands_install_upgrade -->|7| n_bkit_core_engine_commands_install_install
-  n_bkit_core_engine_commands_lib -->|7| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_stats -->|7| n_bkit_core_engine_commands_analysis
   n_bkit_core_engine_commands_workflow_branches -->|7| n_bkit_core_engine_shared_package_manager
   n_bkit_core_engine_commands_workflow_branches -->|7| n_bkit_core_engine_commands_workflow_locks
@@ -836,7 +836,7 @@ flowchart LR
   linkStyle 155 stroke:#59636eb3,stroke-width:3px
   linkStyle 156 stroke:#59636eb3,stroke-width:3px
   linkStyle 157 stroke:#59636eb3,stroke-width:3px
-  linkStyle 158 stroke:#59636e80,stroke-width:2px
+  linkStyle 158 stroke:#59636eb3,stroke-width:3px
   linkStyle 159 stroke:#59636e80,stroke-width:2px
   linkStyle 160 stroke:#59636e80,stroke-width:2px
   linkStyle 161 stroke:#59636e80,stroke-width:2px
