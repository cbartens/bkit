diff --git a/.bkit/core/engine/commands/lib.test.ts b/.bkit/core/engine/commands/lib.test.ts
index 6a40e685a..0e08d44ba 100644
--- a/.bkit/core/engine/commands/lib.test.ts
+++ b/.bkit/core/engine/commands/lib.test.ts
@@ -693,6 +693,24 @@ describe("repo facts on a real repository", () => {
     expect(statusLocation(opts)).toEqual({ bookRoot: worktree, path: path.join(worktree, rel) });
   });
 
+  it("a host-made linked worktree holds the run", () => {
+    const { root } = repoWithWorktree();
+    const host = path.join(
+      fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-host-"))),
+      "wt",
+    );
+    dirs.push(path.dirname(host));
+    sh(root, "worktree", "add", "-q", "-b", "feat/7-host", host);
+    const rel = path.join("docs", "plans", "202610", "logs", "7-host", "status.jsonl");
+    const opts = { cwd: host, workflow: "build", fid: "7-host", month: "202610" };
+    // Only the log directory exists: the host worktree still holds the run.
+    fs.mkdirSync(path.dirname(path.join(host, rel)), { recursive: true });
+    expect(statusLocation(opts)).toEqual({ bookRoot: host, path: path.join(host, rel) });
+    // The status file is written: same answer.
+    touch(path.join(host, rel));
+    expect(statusLocation(opts)).toEqual({ bookRoot: host, path: path.join(host, rel) });
+  });
+
   it("ship: the tree it runs in — the worktree being shipped, or the adopted checkout", () => {
     const { root, worktree } = repoWithWorktree();
     const base = { workflow: "ship", fid: "9-x", month: "202610" };
diff --git a/.bkit/core/engine/commands/lib.ts b/.bkit/core/engine/commands/lib.ts
index 041ea7397..ec611030d 100644
--- a/.bkit/core/engine/commands/lib.ts
+++ b/.bkit/core/engine/commands/lib.ts
@@ -1160,6 +1160,26 @@ export function repoRoot(cwd: string): string {
   return root;
 }
 
+/** True when `cwd` sits in a linked worktree: its git dir differs from the shared one. A main checkout and a submodule's checkout are not linked. */
+export function inLinkedWorktree(cwd: string): boolean {
+  const own = git(cwd, ["rev-parse", "--path-format=absolute", "--absolute-git-dir"]);
+  const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
+  if (!own || !common) return false;
+  const real = (p: string) => {
+    try {
+      return fs.realpathSync(p);
+    } catch {
+      return p;
+    }
+  };
+  return real(own) !== real(common);
+}
+
+/** The top of the checkout `cwd` sits in, else the main checkout. */
+export function sessionCheckout(cwd: string): string {
+  return git(cwd, ["rev-parse", "--show-toplevel"]) ?? repoRoot(cwd);
+}
+
 /** `<git common dir>/bkit-outbox`: per-run scratch files, never committed; null outside a git repo. */
 export function outboxRoot(cwd: string): string | null {
   const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
@@ -1194,7 +1214,8 @@ export interface StatusLocation {
  * Where a workflow's `status.jsonl` lives. One rule per workflow kind:
  *
  * - design / plan / build / debug: the feature worktree's copy when it exists
- *   (`.worktrees/{fid}`), else the main checkout's.
+ *   (`.worktrees/{fid}`), else the session's own linked worktree when it holds the
+ *   run's log directory, else the main checkout's.
  * - ship: the current worktree's top — the tree ship works in (the feature
  *   worktree, or the adopted checkout), so asked from inside it.
  */
@@ -1207,12 +1228,20 @@ export function statusLocation(opts: {
   const root = repoRoot(opts.cwd);
   const rel = statusRelPath(opts.month, opts.fid);
   if (opts.workflow === "ship") {
-    const bookRoot = git(opts.cwd, ["rev-parse", "--show-toplevel"]) ?? root;
+    const bookRoot = sessionCheckout(opts.cwd);
     return { bookRoot, path: path.join(bookRoot, rel) };
   }
   const worktree = path.join(root, ".worktrees", opts.fid);
-  const bookRoot = fs.existsSync(path.join(worktree, rel)) ? worktree : root;
-  return { bookRoot, path: path.join(bookRoot, rel) };
+  if (fs.existsSync(path.join(worktree, rel))) {
+    return { bookRoot: worktree, path: path.join(worktree, rel) };
+  }
+  if (inLinkedWorktree(opts.cwd)) {
+    const own = sessionCheckout(opts.cwd);
+    if (fs.existsSync(path.dirname(path.join(own, rel)))) {
+      return { bookRoot: own, path: path.join(own, rel) };
+    }
+  }
+  return { bookRoot: root, path: path.join(root, rel) };
 }
 
 /** The tokens GitHub Actions honours to skip every workflow run for a commit. */
diff --git a/dist/commands/lib.js b/dist/commands/lib.js
index c609ebd66..02829b3b1 100644
--- a/dist/commands/lib.js
+++ b/dist/commands/lib.js
@@ -902,6 +902,26 @@ export function repoRoot(cwd) {
         throw new CommandError(EXIT.USAGE, `not inside a git repository: ${cwd}`);
     return root;
 }
+/** True when `cwd` sits in a linked worktree: its git dir differs from the shared one. A main checkout and a submodule's checkout are not linked. */
+export function inLinkedWorktree(cwd) {
+    const own = git(cwd, ["rev-parse", "--path-format=absolute", "--absolute-git-dir"]);
+    const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
+    if (!own || !common)
+        return false;
+    const real = (p) => {
+        try {
+            return fs.realpathSync(p);
+        }
+        catch {
+            return p;
+        }
+    };
+    return real(own) !== real(common);
+}
+/** The top of the checkout `cwd` sits in, else the main checkout. */
+export function sessionCheckout(cwd) {
+    return git(cwd, ["rev-parse", "--show-toplevel"]) ?? repoRoot(cwd);
+}
 /** `<git common dir>/bkit-outbox`: per-run scratch files, never committed; null outside a git repo. */
 export function outboxRoot(cwd) {
     const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
@@ -925,7 +945,8 @@ export const statusRelPath = (month, fid) => path.join("docs", "plans", month, "
  * Where a workflow's `status.jsonl` lives. One rule per workflow kind:
  *
  * - design / plan / build / debug: the feature worktree's copy when it exists
- *   (`.worktrees/{fid}`), else the main checkout's.
+ *   (`.worktrees/{fid}`), else the session's own linked worktree when it holds the
+ *   run's log directory, else the main checkout's.
  * - ship: the current worktree's top — the tree ship works in (the feature
  *   worktree, or the adopted checkout), so asked from inside it.
  */
@@ -933,12 +954,20 @@ export function statusLocation(opts) {
     const root = repoRoot(opts.cwd);
     const rel = statusRelPath(opts.month, opts.fid);
     if (opts.workflow === "ship") {
-        const bookRoot = git(opts.cwd, ["rev-parse", "--show-toplevel"]) ?? root;
+        const bookRoot = sessionCheckout(opts.cwd);
         return { bookRoot, path: path.join(bookRoot, rel) };
     }
     const worktree = path.join(root, ".worktrees", opts.fid);
-    const bookRoot = fs.existsSync(path.join(worktree, rel)) ? worktree : root;
-    return { bookRoot, path: path.join(bookRoot, rel) };
+    if (fs.existsSync(path.join(worktree, rel))) {
+        return { bookRoot: worktree, path: path.join(worktree, rel) };
+    }
+    if (inLinkedWorktree(opts.cwd)) {
+        const own = sessionCheckout(opts.cwd);
+        if (fs.existsSync(path.dirname(path.join(own, rel)))) {
+            return { bookRoot: own, path: path.join(own, rel) };
+        }
+    }
+    return { bookRoot: root, path: path.join(root, rel) };
 }
 /** The tokens GitHub Actions honours to skip every workflow run for a commit. */
 export const SKIP_CI_TOKEN = /\[(?:skip ci|ci skip|no ci|skip actions|actions skip)\]/i;
