diff --git a/.bkit/core/engine/commands/workflow/branches.test.ts b/.bkit/core/engine/commands/workflow/branches.test.ts
index b01d419c8..b88c69050 100644
--- a/.bkit/core/engine/commands/workflow/branches.test.ts
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -1162,6 +1162,38 @@ describe(
       expect(r.json?.reason).toContain(PC_RULE);
       expect(inRebase(dir)).toBe(false);
     });
+
+    it("does not silently drop a later branch edit to the plan file when dev changed an adjacent line", async () => {
+      const gap = Array.from({ length: 8 }, (_, i) => `filler ${i}\n`).join("");
+      const base = `- [ ] TASK 1\n  detail one\n${gap}- [ ] TASK 3\n  detail three\n`;
+      const dir = makeRepo("pc-adjacent");
+      commit(dir, { [PC_PLAN]: base }, "plan close base");
+      git(dir, "checkout", "-q", "-b", `feat/${PC_FID}`);
+      write(dir, PC_PLAN, `- [x] TASK 1\n  detail one\n${gap}- [x] TASK 3\n  detail three\n`);
+      git(dir, "add", "-A");
+      git(dir, "commit", "-q", "-m", "build ticks");
+      git(dir, "checkout", "-q", "main");
+      write(
+        dir,
+        PC_PLAN,
+        `- [ ] TASK 1\n  detail one edited on dev\n${gap}- [ ] TASK 3\n  detail three\n`,
+      );
+      git(dir, "add", "-A");
+      git(dir, "commit", "-q", "-m", "dev edit");
+      git(dir, "checkout", "-q", `feat/${PC_FID}`);
+      git(dir, "rebase", "main");
+      const r = await run(dir, ["rebase"]);
+      const tick = "[x] TASK 3";
+      const keptPaths = Array.from(r.err.matchAll(/\S*dropped-logs\S*/g), (m) =>
+        path.resolve(dir, m[0].replace(/^[`'"(]+|[`'",.)]+$/g, "")),
+      )
+        .filter((t) => fs.existsSync(t))
+        .filter((t) => fs.statSync(t).isFile());
+      const planKept = read(dir, PC_PLAN).includes(tick);
+      const copyKept = keptPaths.some((t) => fs.readFileSync(t, "utf-8").includes(tick));
+      // Refused (code 3), or the tick survives in the plan file or in a kept copy that r.err names.
+      expect([r.code === 3, planKept, copyKept]).toContain(true);
+    });
   },
 );
 
diff --git a/.bkit/core/engine/commands/workflow/branches.ts b/.bkit/core/engine/commands/workflow/branches.ts
index 44ecb1e60..27ef56d67 100644
--- a/.bkit/core/engine/commands/workflow/branches.ts
+++ b/.bkit/core/engine/commands/workflow/branches.ts
@@ -75,6 +75,7 @@ import {
 import { AUTO_LABEL, AUTO_ROUTE_SUFFIX } from "./issues.js";
 import { appendFeature } from "./roadmap.js";
 import { detect } from "./runtime.js";
+import { droppedLogsDir, keepAside } from "./worktrees.js";
 import { defaultRange } from "./feature-base.js";
 import { stepBase } from "./step-base.js";
 import { readRuns, readStatusRows, readStatusRowsAt } from "./status.js";
@@ -554,6 +555,12 @@ function takeDevSide(top: string, file: string, dev: "ours" | "theirs"): boolean
     : runGit(top, ["rm", "-q", "--", file]).ok;
 }
 
+/** Keep the branch's blob of a conflicted plan file under the feature's `dropped-logs/`; its path, or null if unreadable. */
+function keptBranchCopy(top: string, fid: string, file: string, blob: string): string | null {
+  const content = spawnSync("git", ["cat-file", "blob", blob], { cwd: top, env: gitEnv() });
+  return content.status === 0 ? keepAside(droppedLogsDir(top, fid), file, content.stdout) : null;
+}
+
 /**
  * Drive an in-progress rebase to completion, auto-resolving each stop. Loops
  * because `--continue` replays the next commit, which can conflict in turn; the
@@ -603,11 +610,22 @@ export function resolveRebase(
       for (const f of conflicts) {
         const kind = classifyConflict(f, embeds, fid);
         if (kind === "planlog") {
+          // The commit being replayed (stage 3) may hold build edits the target's
+          // copy lacks: keep a differing copy aside before the target's copy wins.
+          const branchBlob = git(top, ["rev-parse", `:3:${f}`]);
+          const kept =
+            branchBlob !== null &&
+            branchBlob !== "" &&
+            branchBlob !== git(top, ["rev-parse", `:2:${f}`])
+              ? keptBranchCopy(top, fid!, f, branchBlob)
+              : null;
           if (!takeDevSide(top, f, "ours")) {
             return refuse(`REFUSE ${f} — resolution failed`, f, "resolution failed");
           }
           result.resolved.push({ path: f, how: "dev" });
-          log(`RESOLVED ${f} — ${REBASE_HOW.dev}`);
+          log(
+            `RESOLVED ${f} — ${REBASE_HOW.dev}${kept === null ? "" : `; the branch's differing copy is kept at ${kept}`}`,
+          );
           continue;
         }
         const settled =
diff --git a/.bkit/core/engine/commands/workflow/worktrees.ts b/.bkit/core/engine/commands/workflow/worktrees.ts
index 1c3cd330b..ca3637840 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.ts
@@ -609,6 +609,23 @@ function putJournalRowsBack(wt: string, journal: Map<string, Appended>): string
   return "";
 }
 
+/** The feature's outbox folder for a log copy that loses to the integration target's: `dropped-logs/{time}/`. */
+export function droppedLogsDir(root: string, fid: string): string {
+  return path.join(
+    path.dirname(ownershipMarker(root, fid)),
+    "dropped-logs",
+    new Date().toISOString().replace(/[:.]/g, "-"),
+  );
+}
+
+/** Write `content` to `{keepDir}/{rel}`, never deleted by bkit; returns the kept path. */
+export function keepAside(keepDir: string, rel: string, content: Buffer): string {
+  const kept = path.join(keepDir, rel);
+  fs.mkdirSync(path.dirname(kept), { recursive: true });
+  fs.writeFileSync(kept, content);
+  return kept;
+}
+
 /**
  * Commit what an earlier run left uncommitted in a resumed worktree, so the
  * resume rebase can start: a failed ship's flush lands its record on dev and
@@ -630,17 +647,11 @@ function carryLeftovers(
   const dropped = (git(wt, ["ls-files", "--others", "--exclude-standard"]) ?? "")
     .split("\n")
     .filter((f) => logs.test(f) && runGit(wt, ["cat-file", "-e", `${o.onto}:${f}`]).ok);
-  const keepDir = path.join(
-    path.dirname(ownershipMarker(wt, o.fid)),
-    "dropped-logs",
-    new Date().toISOString().replace(/[:.]/g, "-"),
-  );
+  const keepDir = droppedLogsDir(wt, o.fid);
   for (const f of dropped) {
     const file = path.join(wt, f);
     if (git(wt, ["hash-object", "--", f]) !== git(wt, ["rev-parse", `${o.onto}:${f}`])) {
-      const kept = path.join(keepDir, f);
-      fs.mkdirSync(path.dirname(kept), { recursive: true });
-      fs.cpSync(file, kept);
+      const kept = keepAside(keepDir, f, fs.readFileSync(file));
       log(`moved ${f} to ${kept}: it differs from ${o.onto}'s copy, which wins in the worktree`);
     }
     fs.rmSync(file);
diff --git a/dist/commands/workflow/branches.js b/dist/commands/workflow/branches.js
index 22e8563e3..c4274edb7 100644
--- a/dist/commands/workflow/branches.js
+++ b/dist/commands/workflow/branches.js
@@ -30,6 +30,7 @@ import { EXIT_BASE_NOT_DEV, FORCE_BUILD, closeTransportRow, crossCheckRows, merg
 import { AUTO_LABEL, AUTO_ROUTE_SUFFIX } from "./issues.js";
 import { appendFeature } from "./roadmap.js";
 import { detect } from "./runtime.js";
+import { droppedLogsDir, keepAside } from "./worktrees.js";
 import { defaultRange } from "./feature-base.js";
 import { stepBase } from "./step-base.js";
 import { readRuns, readStatusRows, readStatusRowsAt } from "./status.js";
@@ -418,6 +419,11 @@ function takeDevSide(top, file, dev) {
         ? runGit(top, ["checkout", `--${dev}`, "--", file]).ok && runGit(top, ["add", "--", file]).ok
         : runGit(top, ["rm", "-q", "--", file]).ok;
 }
+/** Keep the branch's blob of a conflicted plan file under the feature's `dropped-logs/`; its path, or null if unreadable. */
+function keptBranchCopy(top, fid, file, blob) {
+    const content = spawnSync("git", ["cat-file", "blob", blob], { cwd: top, env: gitEnv() });
+    return content.status === 0 ? keepAside(droppedLogsDir(top, fid), file, content.stdout) : null;
+}
 /**
  * Drive an in-progress rebase to completion, auto-resolving each stop. Loops
  * because `--continue` replays the next commit, which can conflict in turn; the
@@ -459,11 +465,19 @@ export function resolveRebase(top, onLog = () => undefined) {
             for (const f of conflicts) {
                 const kind = classifyConflict(f, embeds, fid);
                 if (kind === "planlog") {
+                    // The commit being replayed (stage 3) may hold build edits the target's
+                    // copy lacks: keep a differing copy aside before the target's copy wins.
+                    const branchBlob = git(top, ["rev-parse", `:3:${f}`]);
+                    const kept = branchBlob !== null &&
+                        branchBlob !== "" &&
+                        branchBlob !== git(top, ["rev-parse", `:2:${f}`])
+                        ? keptBranchCopy(top, fid, f, branchBlob)
+                        : null;
                     if (!takeDevSide(top, f, "ours")) {
                         return refuse(`REFUSE ${f} — resolution failed`, f, "resolution failed");
                     }
                     result.resolved.push({ path: f, how: "dev" });
-                    log(`RESOLVED ${f} — ${REBASE_HOW.dev}`);
+                    log(`RESOLVED ${f} — ${REBASE_HOW.dev}${kept === null ? "" : `; the branch's differing copy is kept at ${kept}`}`);
                     continue;
                 }
                 const settled = kind === "register"
diff --git a/dist/commands/workflow/worktrees.js b/dist/commands/workflow/worktrees.js
index b03a436d6..3f5856ea7 100644
--- a/dist/commands/workflow/worktrees.js
+++ b/dist/commands/workflow/worktrees.js
@@ -486,6 +486,17 @@ function putJournalRowsBack(wt, journal) {
     }
     return "";
 }
+/** The feature's outbox folder for a log copy that loses to the integration target's: `dropped-logs/{time}/`. */
+export function droppedLogsDir(root, fid) {
+    return path.join(path.dirname(ownershipMarker(root, fid)), "dropped-logs", new Date().toISOString().replace(/[:.]/g, "-"));
+}
+/** Write `content` to `{keepDir}/{rel}`, never deleted by bkit; returns the kept path. */
+export function keepAside(keepDir, rel, content) {
+    const kept = path.join(keepDir, rel);
+    fs.mkdirSync(path.dirname(kept), { recursive: true });
+    fs.writeFileSync(kept, content);
+    return kept;
+}
 /**
  * Commit what an earlier run left uncommitted in a resumed worktree, so the
  * resume rebase can start: a failed ship's flush lands its record on dev and
@@ -504,13 +515,11 @@ function carryLeftovers(wt, o, log) {
     const dropped = (git(wt, ["ls-files", "--others", "--exclude-standard"]) ?? "")
         .split("\n")
         .filter((f) => logs.test(f) && runGit(wt, ["cat-file", "-e", `${o.onto}:${f}`]).ok);
-    const keepDir = path.join(path.dirname(ownershipMarker(wt, o.fid)), "dropped-logs", new Date().toISOString().replace(/[:.]/g, "-"));
+    const keepDir = droppedLogsDir(wt, o.fid);
     for (const f of dropped) {
         const file = path.join(wt, f);
         if (git(wt, ["hash-object", "--", f]) !== git(wt, ["rev-parse", `${o.onto}:${f}`])) {
-            const kept = path.join(keepDir, f);
-            fs.mkdirSync(path.dirname(kept), { recursive: true });
-            fs.cpSync(file, kept);
+            const kept = keepAside(keepDir, f, fs.readFileSync(file));
             log(`moved ${f} to ${kept}: it differs from ${o.onto}'s copy, which wins in the worktree`);
         }
         fs.rmSync(file);
