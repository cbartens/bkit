diff --git a/.bkit/core/engine/commands/workflow/branches.test.ts b/.bkit/core/engine/commands/workflow/branches.test.ts
index a7226790c..548e6bec1 100644
--- a/.bkit/core/engine/commands/workflow/branches.test.ts
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -3666,6 +3666,31 @@ describe("shared landed comparison", { timeout: GIT_TIMEOUT }, () => {
     const comparison = await import("./worktrees");
     expect(comparison.notOnDev(clone, "feat/1-x")).toEqual([]);
   });
+
+  it("names a path under a directory named : when dev deleted, re-added and later edited the top-level file", async () => {
+    const { origin, clone } = withOrigin("land-colon-readded");
+    git(clone, "switch", "-q", "-c", "feat/1-x");
+    commit(clone, { ":/src.txt": "branch colon file\n" }, "feat: add file under colon dir");
+    const other = tmp("other-colon-del");
+    git(other, "clone", "-q", "-b", "dev", origin, ".");
+    expect(git(other, "rm", "-q", "src.txt").ok).toBe(true);
+    expect(git(other, "commit", "-qm", "dev deletes src").ok).toBe(true);
+    expect(git(other, "push", "-q", "origin", "dev").ok).toBe(true);
+    landOnDev(origin, { "src.txt": "code v0\n" }, "dev re-adds src with its original content");
+    landOnDev(origin, { "src.txt": "later dev edit\n" }, "later dev edit of src");
+    expect(git(clone, "fetch", "-q", "origin").ok).toBe(true);
+    const comparison = await import("./worktrees");
+    expect(comparison.notOnDev(clone, "feat/1-x")).toEqual([":/src.txt"]);
+  });
+
+  it("a path under a directory named : that dev never touched is not reported landed", async () => {
+    const { clone } = withOrigin("land-colon-untouched");
+    git(clone, "switch", "-q", "-c", "feat/1-x");
+    commit(clone, { ":/src.txt": "branch colon file\n" }, "feat: add file under colon dir");
+    expect(git(clone, "fetch", "-q", "origin").ok).toBe(true);
+    const comparison = await import("./worktrees");
+    expect(comparison.notOnDev(clone, "feat/1-x")).toEqual([":/src.txt"]);
+  });
 });
 
 describe("branches land", { timeout: GIT_TIMEOUT }, () => {
diff --git a/.bkit/core/engine/commands/workflow/worktrees.ts b/.bkit/core/engine/commands/workflow/worktrees.ts
index 95682216c..788bfba0b 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.ts
@@ -773,9 +773,12 @@ export function install(
 // Branch cleanup
 // ---------------------------------------------------------------------------
 
-/** Preserve NUL-delimited paths and the status columns that runGit trims. */
-function cleanupRead(root: string, args: string[]): ReturnType<typeof runGit> {
-  const result = spawnSync("git", args, {
+/**
+ * Preserve NUL-delimited paths and the status columns that runGit trims.
+ * `literal` reads every pathspec as a file name, so a path starting with `:` is not pattern magic.
+ */
+function cleanupRead(root: string, args: string[], literal = false): ReturnType<typeof runGit> {
+  const result = spawnSync("git", literal ? ["--literal-pathspecs", ...args] : args, {
     cwd: root,
     encoding: "utf-8",
     env: gitEnv(),
@@ -789,7 +792,7 @@ function cleanupRead(root: string, args: string[]): ReturnType<typeof runGit> {
 }
 
 function treeEntry(root: string, rev: string, file: string): string | null {
-  const result = cleanupRead(root, ["ls-tree", "-z", rev, "--", file]);
+  const result = cleanupRead(root, ["ls-tree", "-z", rev, "--", file], true);
   if (!result.ok) throw new Error(`cannot inspect ${rev}:${file}: ${result.stderr}`);
   return result.stdout === "" ? null : result.stdout.slice(0, result.stdout.indexOf("\t"));
 }
@@ -803,13 +806,11 @@ function committedLines(root: string, rev: string, file: string): string[] {
 
 /** True when some origin/dev commit since the merge base holds the branch's tree entry for the file. */
 function devHeldEntry(root: string, base: string, file: string, entry: string | null): boolean {
-  const log = cleanupRead(root, [
-    "rev-list",
-    "--full-history",
-    `${base}..${ORIGIN_DEV}`,
-    "--",
-    file,
-  ]);
+  const log = cleanupRead(
+    root,
+    ["rev-list", "--full-history", `${base}..${ORIGIN_DEV}`, "--", file],
+    true,
+  );
   if (!log.ok) throw new Error(`cannot inspect ${base}..${ORIGIN_DEV} for ${file}: ${log.stderr}`);
   return log.stdout
     .split("\n")
@@ -880,7 +881,7 @@ function dirtyWork(root: string, wt: string, landed: boolean): string[] {
     try {
       if (
         staged.has(file) &&
-        !cleanupRead(wt, ["diff", "--cached", "--quiet", ORIGIN_DEV, "--", file]).ok
+        !cleanupRead(wt, ["diff", "--cached", "--quiet", ORIGIN_DEV, "--", file], true).ok
       )
         return true;
       const entry = treeEntry(root, ORIGIN_DEV, file);
diff --git a/dist/commands/workflow/worktrees.js b/dist/commands/workflow/worktrees.js
index 05893dded..3838d0bcb 100644
--- a/dist/commands/workflow/worktrees.js
+++ b/dist/commands/workflow/worktrees.js
@@ -631,9 +631,12 @@ export function install(wt, log, opts = {}) {
 // ---------------------------------------------------------------------------
 // Branch cleanup
 // ---------------------------------------------------------------------------
-/** Preserve NUL-delimited paths and the status columns that runGit trims. */
-function cleanupRead(root, args) {
-    const result = spawnSync("git", args, {
+/**
+ * Preserve NUL-delimited paths and the status columns that runGit trims.
+ * `literal` reads every pathspec as a file name, so a path starting with `:` is not pattern magic.
+ */
+function cleanupRead(root, args, literal = false) {
+    const result = spawnSync("git", literal ? ["--literal-pathspecs", ...args] : args, {
         cwd: root,
         encoding: "utf-8",
         env: gitEnv(),
@@ -646,7 +649,7 @@ function cleanupRead(root, args) {
     };
 }
 function treeEntry(root, rev, file) {
-    const result = cleanupRead(root, ["ls-tree", "-z", rev, "--", file]);
+    const result = cleanupRead(root, ["ls-tree", "-z", rev, "--", file], true);
     if (!result.ok)
         throw new Error(`cannot inspect ${rev}:${file}: ${result.stderr}`);
     return result.stdout === "" ? null : result.stdout.slice(0, result.stdout.indexOf("\t"));
@@ -661,13 +664,7 @@ function committedLines(root, rev, file) {
 }
 /** True when some origin/dev commit since the merge base holds the branch's tree entry for the file. */
 function devHeldEntry(root, base, file, entry) {
-    const log = cleanupRead(root, [
-        "rev-list",
-        "--full-history",
-        `${base}..${ORIGIN_DEV}`,
-        "--",
-        file,
-    ]);
+    const log = cleanupRead(root, ["rev-list", "--full-history", `${base}..${ORIGIN_DEV}`, "--", file], true);
     if (!log.ok)
         throw new Error(`cannot inspect ${base}..${ORIGIN_DEV} for ${file}: ${log.stderr}`);
     return log.stdout
@@ -741,7 +738,7 @@ function dirtyWork(root, wt, landed) {
     return paths.filter((file) => {
         try {
             if (staged.has(file) &&
-                !cleanupRead(wt, ["diff", "--cached", "--quiet", ORIGIN_DEV, "--", file]).ok)
+                !cleanupRead(wt, ["diff", "--cached", "--quiet", ORIGIN_DEV, "--", file], true).ok)
                 return true;
             const entry = treeEntry(root, ORIGIN_DEV, file);
             const full = path.join(wt, file);
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 15e198c9d..5fb09b705 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -524,3 +524,4 @@
 {"schema":3,"ts":1795011322095,"firstTs":1795011322095,"updates":1,"kind":"deferral","key":"1053-upgrade-leaves-stale-challenge-low-bkit-core-engine-install-modules-core-ts-2123","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1053-upgrade-leaves-stale"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A re-run of `bkit install` after a version bump (or a `bkit check` over a hand-edited mirror) prints \"stale .bkit/version entries re-recorded\" for every rendered file the run writes or would write, so the owner is told the install record was wrong when it was right","description":"LOW build challenge finding at .bkit/core/engine/install/modules/core.ts:2123: A re-run of `bkit install` after a version bump (or a `bkit check` over a hand-edited mirror) prints \"stale .bkit/version entries re-recorded\" for every rendered file the run writes or would write, so the owner is told the install record was wrong when it was right. Done when: The rendered-output loop in the `.bkit/version` `postDispatch` counts a path as stale only when this run neither wrote nor would write it (its path is not in `ws.writes`); a real run that rewrites a rendered file and a dry run that would rewrite one print no \"stale .bkit/version entries\" line for that file, while an untouched file with a wrong entry still prints it and still fails `bkit check`.","source":".bkit/core/engine/install/modules/core.ts:2123","status":"OPEN"}
 {"schema":3,"ts":1795011322096,"firstTs":1795011322096,"updates":1,"kind":"deferral","key":"1053-upgrade-leaves-stale-challenge-low-bkit-core-engine-install-modules-index-ts-202","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1053-upgrade-leaves-stale"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A committed symlink `.cursor/commands/bkit-leak.md -> ../../.claude/bkit-cloud.md` (or any file outside the repo) in a mirror dir whose host is not rendered this run gets followed, hashed and its sha256 recorded in the committed, public `.bkit/version`","description":"LOW build challenge finding at .bkit/core/engine/install/modules/index.ts:202: A committed symlink `.cursor/commands/bkit-leak.md -> ../../.claude/bkit-cloud.md` (or any file outside the repo) in a mirror dir whose host is not rendered this run gets followed, hashed and its sha256 recorded in the committed, public `.bkit/version`. Done when: `listRenderedOutputs` lists only regular files: a mirror entry whose own path is a symlink or not a regular file (`fs.lstatSync(abs).isFile()` false) is left out, while a regular file inside a symlinked host folder (the supported dotfiles `.codex` setup) is still listed; neither the install `postDispatch` (`core.ts:2119`) nor `updateCanonicalHashesAfterUpgrade` (via `upgrade.ts:1050`) reads or records a hash for such a path, so the docs/security.md § Secrets rule that machine-local secret files stay out of `canonicalHashes` holds. Today `listRenderedMirrors` takes every `bkit-*` name in every `RENDERED_MIRRORS` dir on disk, and orphan removal runs only for detected hosts (`hosts.ts` detects by `<host>/agents`), so a `.cursor/commands/` or `.opencode/commands/` entry with no `agents/` sibling survives the run, and `hashFile` / `readFileSync` follow the link.","source":".bkit/core/engine/install/modules/index.ts:202","status":"OPEN"}
 {"schema":3,"ts":1795005854792,"firstTs":1795005854792,"updates":1,"kind":"deferral","key":"1055-worktree-removal-says-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-805","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1055-worktree-removal-says"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A branch whose only work is a file under a directory named `:` (for example `:/src.txt`) is judged landed and deleted with that file lost, because `rev-list` and `ls-tree` read the path as top-of-repo pathspec magic for `src.txt` and a later `dev` commit held the branch's `src.txt`","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/worktrees.ts:805: A branch whose only work is a file under a directory named `:` (for example `:/src.txt`) is judged landed and deleted with that file lost, because `rev-list` and `ls-tree` read the path as top-of-repo pathspec magic for `src.txt` and a later `dev` commit held the branch's `src.txt`. Done when: every path that `git diff --name-only -z` returns is read as a literal path by both the `ls-tree` in `treeEntry` and the `rev-list` in `devHeldEntry` (for example `GIT_LITERAL_PATHSPECS=1` in the `cleanupRead` environment, or `--literal-pathspecs` before the subcommand), so `notOnDev` names a branch file whose path starts with `:` unless `origin/dev` holds that exact path.","source":".bkit/core/engine/commands/workflow/worktrees.ts:805","status":"OPEN"}
+{"schema":3,"ts":1795059081290,"firstTs":1795005854792,"updates":2,"kind":"deferral","key":"1055-worktree-removal-says-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-805","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-tasks"},"references":["1055-worktree-removal-says","1058-cleanup-check-reads"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A branch whose only work is a file under a directory named `:` (for example `:/src.txt`) is judged landed and deleted with that file lost, because `rev-list` and `ls-tree` read the path as top-of-repo pathspec magic for `src.txt` and a later `dev` commit held the branch's `src.txt`","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/worktrees.ts:805: A branch whose only work is a file under a directory named `:` (for example `:/src.txt`) is judged landed and deleted with that file lost, because `rev-list` and `ls-tree` read the path as top-of-repo pathspec magic for `src.txt` and a later `dev` commit held the branch's `src.txt`. Done when: every path that `git diff --name-only -z` returns is read as a literal path by both the `ls-tree` in `treeEntry` and the `rev-list` in `devHeldEntry` (for example `GIT_LITERAL_PATHSPECS=1` in the `cleanupRead` environment, or `--literal-pathspecs` before the subcommand), so `notOnDev` names a branch file whose path starts with `:` unless `origin/dev` holds that exact path.","source":".bkit/core/engine/commands/workflow/worktrees.ts:805","status":"CLOSED"}
