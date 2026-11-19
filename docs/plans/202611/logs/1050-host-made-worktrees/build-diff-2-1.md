diff --git a/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts b/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
index 74e9110de..bfa0d56b5 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
@@ -1169,6 +1169,26 @@ describe("bkit worktrees setup — a host-made worktree on feat/{fid}", () => {
     expect(git(hostReal, "rev-parse", "HEAD")).toBe(head);
     expect(fs.existsSync(wtOf(f))).toBe(false);
   });
+
+  it("refuses plan from a host-made worktree whose branch carries unpushed dev work", async () => {
+    const f = fixture();
+    fs.writeFileSync(path.join(f.repo, "held.txt"), "unpushed\n");
+    git(f.repo, "add", "held.txt");
+    git(f.repo, "commit", "-q", "-m", "held on local dev");
+    const host = path.join(path.dirname(f.repo), "host-wt");
+    git(f.repo, "worktree", "add", "-q", host, "-b", `feat/${FID}`);
+    const hostReal = fs.realpathSync(host);
+
+    const r = await setup(hostReal, "plan", "--worktrees");
+    expect(r.code).toBe(7);
+    expect(r.err).toContain("1 commit(s) of unpushed dev");
+    expect(fs.existsSync(path.join(hostReal, "docs/plans", MONTH, "logs", FID))).toBe(false);
+
+    // The same worktree adopts for build, whose PR carries dev's work by design.
+    const build = await setup(hostReal, "build", "--worktrees");
+    expect(build.code).toBe(0);
+    expect(build.json).toMatchObject({ mode: "adopted", worktreePath: hostReal });
+  });
 });
 
 describe("bkit worktrees setup — debug adopts, never mints", () => {
diff --git a/.bkit/core/engine/commands/workflow/worktrees.test.ts b/.bkit/core/engine/commands/workflow/worktrees.test.ts
index 07f8d0782..71aa193e3 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.test.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -245,6 +245,52 @@ describe("bkit worktrees setup — adopt the checkout the session is already on"
     }
   });
 
+  it("refuses design, plan and build in place in a submodule's main checkout on feat/{fid}", async () => {
+    for (const workflow of ["design", "plan", "build"]) {
+      const sub = repo("dev");
+      const outer = repo("dev");
+      git(
+        outer,
+        "-c",
+        "protocol.file.allow=always",
+        "submodule",
+        "add",
+        "-q",
+        "-b",
+        "dev",
+        sub,
+        "mod",
+      );
+      const inner = path.join(outer, "mod");
+      git(inner, "switch", "-q", "-c", `feat/${FID}`);
+      const r = await setup(inner, workflow, "--worktrees");
+      expect(r.code, workflow).toBe(7);
+      expect(fs.existsSync(path.join(inner, "docs/plans", MONTH, "logs", FID)), workflow).toBe(
+        false,
+      );
+    }
+  });
+
+  it("says so when the adopted worktree has no hooks directory", async () => {
+    const cwd = repo("dev");
+    const wt = hostWorktree(cwd);
+    git(cwd, "config", "core.hooksPath", ".husky/_");
+    const missing = await setup(wt, "plan", "--worktrees");
+    expect(missing.code).toBe(0);
+    expect(missing.json.hooksMissing).toBe(".husky/_");
+    expect(missing.err).toContain(".husky/_");
+
+    fs.mkdirSync(path.join(wt, ".husky/_"), { recursive: true });
+    const present = await setup(wt, "plan", "--worktrees");
+    expect(present.code).toBe(0);
+    expect(present.json.hooksMissing).toBeUndefined();
+    expect(present.err).not.toContain(".husky/_");
+
+    const unset = repo("claude/session");
+    const none = await setup(unset, "build");
+    expect(none.json.hooksMissing).toBeUndefined();
+  });
+
   it("a plan session on another branch still mints .worktrees/{fid}", async () => {
     const cwd = repo("dev");
     const origin = path.join(path.dirname(cwd), `${path.basename(cwd)}-origin.git`);
@@ -417,6 +463,24 @@ describe("bkit worktrees setup — debug in place on dev shares the checkout", (
     );
   });
 
+  it("debug in place on dev from a linked worktree records its own checkout", async () => {
+    const cwd = shared();
+    git(cwd, "switch", "-q", "-c", "claude/session");
+    const wt = path.join(path.dirname(cwd), `${path.basename(cwd)}-dev-wt`);
+    dirs.push(wt);
+    git(cwd, "worktree", "add", "-q", wt, "dev");
+    const wtReal = fs.realpathSync(wt);
+    fs.writeFileSync(path.join(wtReal, "mine.md"), "linked worktree work\n");
+
+    const r = await setup(wtReal, "debug", "--branch=dev", "--worktrees");
+    expect(r.code).toBe(0);
+    expect(fs.existsSync(recordFile(wtReal))).toBe(true);
+    expect(fs.existsSync(path.join(cwd, ".git/bkit/shared-checkout", `${FID}.json`))).toBe(false);
+    expect(record(wtReal).paths).toEqual(
+      expect.arrayContaining([{ path: "mine.md", hash: hashOf(wtReal, "mine.md") }]),
+    );
+  });
+
   it("in-place debug on dev returns startSha and aheadAtStart", async () => {
     const cwd = shared();
     const r = await setup(cwd, "debug");
diff --git a/.bkit/core/engine/commands/workflow/worktrees.ts b/.bkit/core/engine/commands/workflow/worktrees.ts
index 788bfba0b..2de8a4f0f 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.ts
@@ -35,12 +35,14 @@ import {
   DEV,
   EXIT,
   git,
+  inLinkedWorktree,
   isIgnoredPath,
   isSharedBranch,
   MAIN,
   mainCheckoutRoot,
   repoRoot,
   runGit,
+  sessionCheckout,
   type CommandSpec,
 } from "../lib.js";
 import { ensureDiskSpace } from "./disk.js";
@@ -208,40 +210,46 @@ function landedRunCommits(root: string, statusFile: string, workflow: string): R
  * shows no closed run after it, which is the only one that fetches. The parked
  * copy is removed once the record is written.
  */
-function openSharedRecord(root: string, fid: string, workflow: string, logDir: string) {
+function openSharedRecord(
+  root: string,
+  checkout: string,
+  fid: string,
+  workflow: string,
+  logDir: string,
+) {
   const busy = (other: string) =>
     new CommandError(
       EXIT_SHARED_BUSY,
       `${other} is running in this checkout (workflow lock held) — wait for it to finish, then re-run`,
     );
   const guarded = withSetupGuard(root, () => {
-    for (const other of listRecords(root)) {
+    for (const other of listRecords(checkout)) {
       if (other.fid === fid) continue;
       // A closed run that has not released its lock still pushes and waits for CI.
       if (workflowLockLive(root, other.fid) || workflowLockFresh(root, other.fid)) {
         throw busy(other.fid);
       }
-      removeRecord(root, other.fid);
+      removeRecord(checkout, other.fid);
     }
-    const existing = readRecord(root, fid);
+    const existing = readRecord(checkout, fid);
     const statusFile = path.join(logDir, "status.jsonl");
     const last = fs.existsSync(statusFile) ? lastRun(readRuns(statusFile), workflow) : undefined;
     const open = last?.status === "IN_PROGRESS";
     if (existing !== null && existing.branch === DEV && open) {
-      removeParkedCommits(root, fid);
+      removeParkedCommits(checkout, fid);
       return existing;
     }
-    const fresh = newRecord(root, fid, DEV);
+    const fresh = newRecord(checkout, fid, DEV);
     // A closed run in the checkout's log ended the run every copy of the row belongs to.
     const closed = last !== undefined && !open;
-    const parked = closed ? null : readParkedCommits(root, fid, workflow);
+    const parked = closed ? null : readParkedCommits(checkout, fid, workflow);
     const row =
       parked ??
       (open ? readRunCommits(statusFile, workflow) : null) ??
-      (closed ? null : landedRunCommits(root, statusFile, workflow));
-    const rebuilt = rebuildFromRow(root, fresh, row);
-    writeRecord(root, rebuilt);
-    removeParkedCommits(root, fid);
+      (closed ? null : landedRunCommits(checkout, statusFile, workflow));
+    const rebuilt = rebuildFromRow(checkout, fresh, row);
+    writeRecord(checkout, rebuilt);
+    removeParkedCommits(checkout, fid);
     return rebuilt;
   });
   if (guarded === null) throw busy("another run");
@@ -335,6 +343,17 @@ function inheritedDevCommits(root: string, branch: string): string[] {
     .filter((c) => unpushed.has(c));
 }
 
+/**
+ * The hooks directory git is told to use (`core.hooksPath`) when it is missing in
+ * `checkout`; a relative path resolves against the checkout. Null when unset or present.
+ */
+function missingHooksDir(checkout: string): string | null {
+  const configured = git(checkout, ["config", "--get", "core.hooksPath"]);
+  if (configured === null || configured === "") return null;
+  const dir = path.isAbsolute(configured) ? configured : path.join(checkout, configured);
+  return fs.existsSync(dir) ? null : configured;
+}
+
 /** Refuse a publication candidate that imports unpublished local dev ancestry. */
 export function assertShipEligible(root: string, candidate: string): void {
   if (git(root, ["rev-parse", "--verify", "--quiet", `${candidate}^{commit}`]) === null)
@@ -1168,6 +1187,8 @@ export const worktreesCommand: CommandSpec = {
         direnvAllowed:
           "direnv allow ran on the worktree's .envrc (present and identical to the main checkout's)",
         installed: "dependencies were installed",
+        hooksMissing:
+          "adopt mode: the hooks directory core.hooksPath names (for example .husky/_) when it is missing in the checkout, so no git hook runs there; absent when set up or unset",
         startSha:
           "in place on dev (debug): HEAD when the run started, recorded in the shared-checkout record; absent otherwise",
         aheadAtStart:
@@ -1273,7 +1294,7 @@ export const worktreesCommand: CommandSpec = {
           worktrees &&
           session === target &&
           (workflow === "plan" || workflow === "design" || workflow === "build") &&
-          real(git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? root) === real(root)
+          !inLinkedWorktree(ctx.cwd)
         ) {
           throw new CommandError(
             EXIT_REFUSED,
@@ -1319,9 +1340,7 @@ export const worktreesCommand: CommandSpec = {
         // Adopted on the target branch: the session's own checkout, which is a linked
         // worktree when a host made one; otherwise the main checkout.
         const adoptRoot =
-          mode === "adopted" && session === target
-            ? (git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? root)
-            : root;
+          mode === "adopted" && session === target ? sessionCheckout(ctx.cwd) : root;
         const wt = mode === "adopted" ? adoptRoot : wtDir;
         const logDir = logDirOf(wt, month, fid);
         const marker = ownershipMarker(root, fid);
@@ -1373,7 +1392,7 @@ export const worktreesCommand: CommandSpec = {
         // commits and push take only its own work.
         const shared =
           mode === "adopted" && isSharedBranch(git(adoptRoot, ["branch", "--show-current"]) ?? "")
-            ? openSharedRecord(root, fid, workflow, logDir)
+            ? openSharedRecord(root, adoptRoot, fid, workflow, logDir)
             : undefined;
 
         let rebaseConflict = false;
@@ -1384,12 +1403,19 @@ export const worktreesCommand: CommandSpec = {
         // now, not after the whole phase. Checked before the resume rebase, which
         // replays such commits under new SHAs this commit-by-commit check no longer
         // knows; the close itself names them then.
-        if (DOCS_ONLY_WORKFLOWS.includes(workflow) && mode !== "adopted") {
-          const inherited = inheritedDevCommits(root, target);
+        if (DOCS_ONLY_WORKFLOWS.includes(workflow)) {
+          const adoptedBranch =
+            mode === "adopted" ? (git(adoptRoot, ["branch", "--show-current"]) ?? "") : target;
+          const checkable =
+            mode !== "adopted" ||
+            (adoptedBranch !== "" &&
+              git(adoptRoot, ["rev-parse", "-q", "--verify", `refs/remotes/${ORIGIN_DEV}`]) !==
+                null);
+          const inherited = checkable ? inheritedDevCommits(adoptRoot, adoptedBranch) : [];
           if (inherited.length > 0) {
             throw new CommandError(
               EXIT_REFUSED,
-              inheritedDevRefusal(root, target, workflow, inherited.length),
+              inheritedDevRefusal(adoptRoot, adoptedBranch, workflow, inherited.length),
             );
           }
         }
@@ -1478,6 +1504,12 @@ export const worktreesCommand: CommandSpec = {
             ? shipBranchWarning(branch, fid, f.issue === undefined ? undefined : String(f.issue))
             : null;
         if (branchWarning !== null) ctx.log(branchWarning);
+        const hooksMissing = mode === "adopted" ? missingHooksDir(wt) : null;
+        if (hooksMissing !== null) {
+          ctx.log(
+            `git hooks directory ${hooksMissing} is missing in ${wt}, so commit and push hooks do not run here — run the package install (for example pnpm install) in this worktree to create it`,
+          );
+        }
         ctx.emit({
           worktreePath: wt,
           repoRoot: root,
@@ -1497,6 +1529,7 @@ export const worktreesCommand: CommandSpec = {
           bkitEnv,
           direnvAllowed,
           installed: wantInstall && installStatus === 0,
+          ...(hooksMissing === null ? {} : { hooksMissing }),
           ...(shared === undefined
             ? {}
             : { startSha: shared.startSha, aheadAtStart: shared.aheadAtStart }),
diff --git a/dist/commands/workflow/worktrees.js b/dist/commands/workflow/worktrees.js
index 3838d0bcb..89c468641 100644
--- a/dist/commands/workflow/worktrees.js
+++ b/dist/commands/workflow/worktrees.js
@@ -22,7 +22,7 @@ import { APPEND_LEDGERS, gitEnv } from "../../ledgers/telemetry.js";
 import { parseJson } from "../../shared/json.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { COULD_NOT_RUN_EXIT_CODES, installCommand } from "../../shared/package-manager.js";
-import { CommandError, DEV, EXIT, git, isIgnoredPath, isSharedBranch, MAIN, mainCheckoutRoot, repoRoot, runGit, } from "../lib.js";
+import { CommandError, DEV, EXIT, git, inLinkedWorktree, isIgnoredPath, isSharedBranch, MAIN, mainCheckoutRoot, repoRoot, runGit, sessionCheckout, } from "../lib.js";
 import { ensureDiskSpace } from "./disk.js";
 import { RUN_COMMITS_ROW, listRecords, newRecord, readParkedCommits, readRecord, readRunCommits, removeParkedCommits, removeRecord, runCommitsIn, withSetupGuard, writeRecord, } from "./ledgers.js";
 import { workflowLockFresh, workflowLockLive } from "./locks.js";
@@ -156,36 +156,36 @@ function landedRunCommits(root, statusFile, workflow) {
  * shows no closed run after it, which is the only one that fetches. The parked
  * copy is removed once the record is written.
  */
-function openSharedRecord(root, fid, workflow, logDir) {
+function openSharedRecord(root, checkout, fid, workflow, logDir) {
     const busy = (other) => new CommandError(EXIT_SHARED_BUSY, `${other} is running in this checkout (workflow lock held) — wait for it to finish, then re-run`);
     const guarded = withSetupGuard(root, () => {
-        for (const other of listRecords(root)) {
+        for (const other of listRecords(checkout)) {
             if (other.fid === fid)
                 continue;
             // A closed run that has not released its lock still pushes and waits for CI.
             if (workflowLockLive(root, other.fid) || workflowLockFresh(root, other.fid)) {
                 throw busy(other.fid);
             }
-            removeRecord(root, other.fid);
+            removeRecord(checkout, other.fid);
         }
-        const existing = readRecord(root, fid);
+        const existing = readRecord(checkout, fid);
         const statusFile = path.join(logDir, "status.jsonl");
         const last = fs.existsSync(statusFile) ? lastRun(readRuns(statusFile), workflow) : undefined;
         const open = last?.status === "IN_PROGRESS";
         if (existing !== null && existing.branch === DEV && open) {
-            removeParkedCommits(root, fid);
+            removeParkedCommits(checkout, fid);
             return existing;
         }
-        const fresh = newRecord(root, fid, DEV);
+        const fresh = newRecord(checkout, fid, DEV);
         // A closed run in the checkout's log ended the run every copy of the row belongs to.
         const closed = last !== undefined && !open;
-        const parked = closed ? null : readParkedCommits(root, fid, workflow);
+        const parked = closed ? null : readParkedCommits(checkout, fid, workflow);
         const row = parked ??
             (open ? readRunCommits(statusFile, workflow) : null) ??
-            (closed ? null : landedRunCommits(root, statusFile, workflow));
-        const rebuilt = rebuildFromRow(root, fresh, row);
-        writeRecord(root, rebuilt);
-        removeParkedCommits(root, fid);
+            (closed ? null : landedRunCommits(checkout, statusFile, workflow));
+        const rebuilt = rebuildFromRow(checkout, fresh, row);
+        writeRecord(checkout, rebuilt);
+        removeParkedCommits(checkout, fid);
         return rebuilt;
     });
     if (guarded === null)
@@ -267,6 +267,17 @@ function inheritedDevCommits(root, branch) {
         .split("\n")
         .filter((c) => unpushed.has(c));
 }
+/**
+ * The hooks directory git is told to use (`core.hooksPath`) when it is missing in
+ * `checkout`; a relative path resolves against the checkout. Null when unset or present.
+ */
+function missingHooksDir(checkout) {
+    const configured = git(checkout, ["config", "--get", "core.hooksPath"]);
+    if (configured === null || configured === "")
+        return null;
+    const dir = path.isAbsolute(configured) ? configured : path.join(checkout, configured);
+    return fs.existsSync(dir) ? null : configured;
+}
 /** Refuse a publication candidate that imports unpublished local dev ancestry. */
 export function assertShipEligible(root, candidate) {
     if (git(root, ["rev-parse", "--verify", "--quiet", `${candidate}^{commit}`]) === null)
@@ -993,6 +1004,7 @@ export const worktreesCommand = {
                 bkitEnv: "bkit's own .bkit/.env: linked to the main checkout's copy, or copied where a symlink is refused (a copy bkit made is refreshed on the next setup); unchanged when already linked, differs when a differing file was left to read, none when the main checkout holds none, failed when neither the link nor the copy could be written, null in adopt mode",
                 direnvAllowed: "direnv allow ran on the worktree's .envrc (present and identical to the main checkout's)",
                 installed: "dependencies were installed",
+                hooksMissing: "adopt mode: the hooks directory core.hooksPath names (for example .husky/_) when it is missing in the checkout, so no git hook runs there; absent when set up or unset",
                 startSha: "in place on dev (debug): HEAD when the run started, recorded in the shared-checkout record; absent otherwise",
                 aheadAtStart: "in place on dev (debug): commits local dev held beyond origin/dev when the run started; absent otherwise",
             },
@@ -1074,7 +1086,7 @@ export const worktreesCommand = {
                 if (worktrees &&
                     session === target &&
                     (workflow === "plan" || workflow === "design" || workflow === "build") &&
-                    real(git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? root) === real(root)) {
+                    !inLinkedWorktree(ctx.cwd)) {
                     throw new CommandError(EXIT_REFUSED, `refusing to run ${workflow} in place in the main checkout on ${target}: its abort and pause handover commits every uncommitted file there. Switch the main checkout off ${target}, or run from the feature's worktree.`);
                 }
                 const wtDir = worktreeDir(root, fid);
@@ -1109,9 +1121,7 @@ export const worktreesCommand = {
                 }
                 // Adopted on the target branch: the session's own checkout, which is a linked
                 // worktree when a host made one; otherwise the main checkout.
-                const adoptRoot = mode === "adopted" && session === target
-                    ? (git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? root)
-                    : root;
+                const adoptRoot = mode === "adopted" && session === target ? sessionCheckout(ctx.cwd) : root;
                 const wt = mode === "adopted" ? adoptRoot : wtDir;
                 const logDir = logDirOf(wt, month, fid);
                 const marker = ownershipMarker(root, fid);
@@ -1143,7 +1153,7 @@ export const worktreesCommand = {
                 // An in-place run on a shared branch records what was dirty before it, so its
                 // commits and push take only its own work.
                 const shared = mode === "adopted" && isSharedBranch(git(adoptRoot, ["branch", "--show-current"]) ?? "")
-                    ? openSharedRecord(root, fid, workflow, logDir)
+                    ? openSharedRecord(root, adoptRoot, fid, workflow, logDir)
                     : undefined;
                 let rebaseConflict = false;
                 let sentinel = null;
@@ -1153,10 +1163,15 @@ export const worktreesCommand = {
                 // now, not after the whole phase. Checked before the resume rebase, which
                 // replays such commits under new SHAs this commit-by-commit check no longer
                 // knows; the close itself names them then.
-                if (DOCS_ONLY_WORKFLOWS.includes(workflow) && mode !== "adopted") {
-                    const inherited = inheritedDevCommits(root, target);
+                if (DOCS_ONLY_WORKFLOWS.includes(workflow)) {
+                    const adoptedBranch = mode === "adopted" ? (git(adoptRoot, ["branch", "--show-current"]) ?? "") : target;
+                    const checkable = mode !== "adopted" ||
+                        (adoptedBranch !== "" &&
+                            git(adoptRoot, ["rev-parse", "-q", "--verify", `refs/remotes/${ORIGIN_DEV}`]) !==
+                                null);
+                    const inherited = checkable ? inheritedDevCommits(adoptRoot, adoptedBranch) : [];
                     if (inherited.length > 0) {
-                        throw new CommandError(EXIT_REFUSED, inheritedDevRefusal(root, target, workflow, inherited.length));
+                        throw new CommandError(EXIT_REFUSED, inheritedDevRefusal(adoptRoot, adoptedBranch, workflow, inherited.length));
                     }
                 }
                 if (mode === "resumed" && workflow !== "ship") {
@@ -1240,6 +1255,10 @@ export const worktreesCommand = {
                     : null;
                 if (branchWarning !== null)
                     ctx.log(branchWarning);
+                const hooksMissing = mode === "adopted" ? missingHooksDir(wt) : null;
+                if (hooksMissing !== null) {
+                    ctx.log(`git hooks directory ${hooksMissing} is missing in ${wt}, so commit and push hooks do not run here — run the package install (for example pnpm install) in this worktree to create it`);
+                }
                 ctx.emit({
                     worktreePath: wt,
                     repoRoot: root,
@@ -1259,6 +1278,7 @@ export const worktreesCommand = {
                     bkitEnv,
                     direnvAllowed,
                     installed: wantInstall && installStatus === 0,
+                    ...(hooksMissing === null ? {} : { hooksMissing }),
                     ...(shared === undefined
                         ? {}
                         : { startSha: shared.startSha, aheadAtStart: shared.aheadAtStart }),
