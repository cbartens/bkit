diff --git a/.bkit/core/engine/commands/workflow/worktrees.test.ts b/.bkit/core/engine/commands/workflow/worktrees.test.ts
index 71aa193e3..e53d66161 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.test.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -291,6 +291,28 @@ describe("bkit worktrees setup — adopt the checkout the session is already on"
     expect(none.json.hooksMissing).toBeUndefined();
   });
 
+  it("does not report a ~ hooks directory that exists", async () => {
+    const home = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-wt-home-")));
+    dirs.push(home);
+    fs.mkdirSync(path.join(home, ".githooks"));
+    const cwd = repo("dev");
+    const wt = hostWorktree(cwd);
+    git(cwd, "config", "core.hooksPath", "~/.githooks");
+    vi.stubEnv("HOME", home);
+    try {
+      const present = await setup(wt, "plan", "--worktrees");
+      expect(present.code).toBe(0);
+      expect(present.json.hooksMissing).toBeUndefined();
+      expect(present.err).not.toContain("~/.githooks");
+
+      fs.rmSync(path.join(home, ".githooks"), { recursive: true });
+      const missing = await setup(wt, "plan", "--worktrees");
+      expect(missing.json.hooksMissing).toBeDefined();
+    } finally {
+      vi.unstubAllEnvs();
+    }
+  });
+
   it("a plan session on another branch still mints .worktrees/{fid}", async () => {
     const cwd = repo("dev");
     const origin = path.join(path.dirname(cwd), `${path.basename(cwd)}-origin.git`);
diff --git a/.bkit/core/engine/commands/workflow/worktrees.ts b/.bkit/core/engine/commands/workflow/worktrees.ts
index 2de8a4f0f..a62ec0f5b 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.ts
@@ -345,12 +345,14 @@ function inheritedDevCommits(root: string, branch: string): string[] {
 
 /**
  * The hooks directory git is told to use (`core.hooksPath`) when it is missing in
- * `checkout`; a relative path resolves against the checkout. Null when unset or present.
+ * `checkout`; a `~/` path expands as git does and a relative path resolves against the checkout. Null when unset or present.
  */
 function missingHooksDir(checkout: string): string | null {
   const configured = git(checkout, ["config", "--get", "core.hooksPath"]);
   if (configured === null || configured === "") return null;
-  const dir = path.isAbsolute(configured) ? configured : path.join(checkout, configured);
+  const expanded =
+    git(checkout, ["config", "--type=path", "--get", "core.hooksPath"]) ?? configured;
+  const dir = path.isAbsolute(expanded) ? expanded : path.join(checkout, expanded);
   return fs.existsSync(dir) ? null : configured;
 }
 
diff --git a/dist/commands/workflow/worktrees.js b/dist/commands/workflow/worktrees.js
index 89c468641..475223f09 100644
--- a/dist/commands/workflow/worktrees.js
+++ b/dist/commands/workflow/worktrees.js
@@ -269,13 +269,14 @@ function inheritedDevCommits(root, branch) {
 }
 /**
  * The hooks directory git is told to use (`core.hooksPath`) when it is missing in
- * `checkout`; a relative path resolves against the checkout. Null when unset or present.
+ * `checkout`; a `~/` path expands as git does and a relative path resolves against the checkout. Null when unset or present.
  */
 function missingHooksDir(checkout) {
     const configured = git(checkout, ["config", "--get", "core.hooksPath"]);
     if (configured === null || configured === "")
         return null;
-    const dir = path.isAbsolute(configured) ? configured : path.join(checkout, configured);
+    const expanded = git(checkout, ["config", "--type=path", "--get", "core.hooksPath"]) ?? configured;
+    const dir = path.isAbsolute(expanded) ? expanded : path.join(checkout, expanded);
     return fs.existsSync(dir) ? null : configured;
 }
 /** Refuse a publication candidate that imports unpublished local dev ancestry. */
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index d9ea63fb6..8d8191ee2 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -526,3 +526,6 @@
 {"schema":3,"ts":1795005854792,"firstTs":1795005854792,"updates":1,"kind":"deferral","key":"1055-worktree-removal-says-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-805","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1055-worktree-removal-says"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A branch whose only work is a file under a directory named `:` (for example `:/src.txt`) is judged landed and deleted with that file lost, because `rev-list` and `ls-tree` read the path as top-of-repo pathspec magic for `src.txt` and a later `dev` commit held the branch's `src.txt`","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/worktrees.ts:805: A branch whose only work is a file under a directory named `:` (for example `:/src.txt`) is judged landed and deleted with that file lost, because `rev-list` and `ls-tree` read the path as top-of-repo pathspec magic for `src.txt` and a later `dev` commit held the branch's `src.txt`. Done when: every path that `git diff --name-only -z` returns is read as a literal path by both the `ls-tree` in `treeEntry` and the `rev-list` in `devHeldEntry` (for example `GIT_LITERAL_PATHSPECS=1` in the `cleanupRead` environment, or `--literal-pathspecs` before the subcommand), so `notOnDev` names a branch file whose path starts with `:` unless `origin/dev` holds that exact path.","source":".bkit/core/engine/commands/workflow/worktrees.ts:805","status":"OPEN"}
 {"schema":3,"ts":1795059081290,"firstTs":1795005854792,"updates":2,"kind":"deferral","key":"1055-worktree-removal-says-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-805","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-tasks"},"references":["1055-worktree-removal-says","1058-cleanup-check-reads"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A branch whose only work is a file under a directory named `:` (for example `:/src.txt`) is judged landed and deleted with that file lost, because `rev-list` and `ls-tree` read the path as top-of-repo pathspec magic for `src.txt` and a later `dev` commit held the branch's `src.txt`","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/worktrees.ts:805: A branch whose only work is a file under a directory named `:` (for example `:/src.txt`) is judged landed and deleted with that file lost, because `rev-list` and `ls-tree` read the path as top-of-repo pathspec magic for `src.txt` and a later `dev` commit held the branch's `src.txt`. Done when: every path that `git diff --name-only -z` returns is read as a literal path by both the `ls-tree` in `treeEntry` and the `rev-list` in `devHeldEntry` (for example `GIT_LITERAL_PATHSPECS=1` in the `cleanupRead` environment, or `--literal-pathspecs` before the subcommand), so `notOnDev` names a branch file whose path starts with `:` unless `origin/dev` holds that exact path.","source":".bkit/core/engine/commands/workflow/worktrees.ts:805","status":"CLOSED"}
 {"schema":3,"ts":1795071082209,"firstTs":1794996842922,"updates":2,"kind":"deferral","key":"919-worktree-setup-tries-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-1258","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["919-worktree-setup-tries"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"Closed by #1050: design, plan and build setup now exit 7 in any main checkout, a git submodule's included","description":"Fixed in #1050 (host-made worktrees, row 1): the main-checkout refusal compares the git dir with the common git dir, so a submodule's main checkout is refused.","source":".bkit/core/engine/commands/workflow/worktrees.ts:1258","status":"CLOSED"}
+{"schema":3,"ts":1795075659069,"firstTs":1795075659069,"updates":1,"kind":"deferral","key":"1050-host-made-worktrees-challenge-low-bkit-core-engine-commands-workflow-locks-ts-533","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1050-host-made-worktrees"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"After debug in place on dev from a linked worktree closes and releases its lock, its shared-checkout record stays under .git/worktrees/{name}/bkit/shared-checkout/{fid}.json, so a later bkit branches push --mode=dev from that worktree with no --fid picks the stale record and exits 0 with \"nothing to push\" instead of refusing with no record","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/locks.ts:533: After debug in place on dev from a linked worktree closes and releases its lock, its shared-checkout record stays under .git/worktrees/{name}/bkit/shared-checkout/{fid}.json, so a later bkit branches push --mode=dev from that worktree with no --fid picks the stale record and exits 0 with \"nothing to push\" instead of refusing with no record. Done when: `locks release --kind=workflow` removes the FID's shared-checkout record from the session's own checkout (`sessionCheckout(ctx.cwd)`) as well as from the main checkout, so the record `openSharedRecord(root, checkout, ...)` now writes under a linked worktree's git dir is gone once its lock is released, as `.bkit/core/.bkit/cli.md` line 241 states (\"and the feature's shared-checkout record\"); the existing \"locks release removes the FID shared-checkout record\" test still passes and another FID's record is still left in place. The diff moved where the record is written (`worktrees.ts:251` `writeRecord(checkout, rebuilt)`) but left this remover on `repoRoot(ctx.cwd)`, the main checkout.","source":".bkit/core/engine/commands/workflow/locks.ts:533","status":"OPEN"}
+{"schema":3,"ts":1795075659071,"firstTs":1795075659071,"updates":1,"kind":"deferral","key":"1050-host-made-worktrees-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-341","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1050-host-made-worktrees"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"Plan or design adopted on a branch whose name is also a top-level path (for example docs or scripts), while local dev is ahead of origin/dev, exits 7 with \"cannot inspect unpublished dev work for docs: fatal: ambiguous argument 'docs': both revision and filename\" even when the branch carries none of those commits","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/worktrees.ts:341: Plan or design adopted on a branch whose name is also a top-level path (for example docs or scripts), while local dev is ahead of origin/dev, exits 7 with \"cannot inspect unpublished dev work for docs: fatal: ambiguous argument 'docs': both revision and filename\" even when the branch carries none of those commits. Done when: `inheritedDevCommits` reads `branch` only as a revision (`rev-list {branch} --not origin/dev --`, or `refs/heads/{branch}` from the adopted call at `worktrees.ts:1414`), so adopted design / plan on a branch named like a top-level path adopts when the branch carries no unpushed `dev` commit and refuses with the \"commit(s) of unpushed dev\" message when it does. The diff made this reachable: adopted mode now passes the checked-out branch (any name) where the resume path only ever passed `feat/{fid}`. Verified on git 2.56: `git rev-list docs --not dev` exits 128 with that message beside a `docs/` directory, and both disambiguated forms exit 0.","source":".bkit/core/engine/commands/workflow/worktrees.ts:341","status":"OPEN"}
+{"schema":3,"ts":1795075659072,"firstTs":1795075659072,"updates":1,"kind":"deferral","key":"1050-host-made-worktrees-challenge-low-bkit-core-engine-commands-lib-ts-1238","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1050-host-made-worktrees"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"From a linked worktree that does not hold the run, statusLocation returns that worktree's committed copy of the FID's log directory (status logs are tracked and land on dev, so any branch cut after an earlier phase landed carries it) instead of the main checkout's live run, so failState appends workflow-failed to the stale copy and resolveActiveRun --fid misses the live run","description":"LOW build challenge finding at .bkit/core/engine/commands/lib.ts:1238: From a linked worktree that does not hold the run, statusLocation returns that worktree's committed copy of the FID's log directory (status logs are tracked and land on dev, so any branch cut after an earlier phase landed carries it) instead of the main checkout's live run, so failState appends workflow-failed to the stale copy and resolveActiveRun --fid misses the live run. Done when: The owner decides what proves that the session's linked worktree holds the run, because the plan's evidence (the log directory exists) is also true for every checkout whose branch carries a landed earlier phase, and no single predicate covers every adoption: the session's branch matching the run's branch covers `feat/{fid}` and debug on `dev`, but `statusLocation` is not told debug's `--branch`; an `IN_PROGRESS` row needs the file and misses the window before `workflows start`; a marker written by setup adds a new artifact. Reachable when setup adopts the main checkout from a linked worktree on another branch (no `--worktrees`, `session !== target`, so `adoptRoot` is the main checkout at `worktrees.ts:1343`). Before the diff this case resolved to the main checkout; the plan's edge-case table covers only an unrelated worktree whose log directory is absent. Once decided, the end state is that `statusLocation` from a linked worktree that is not the run's adopted checkout resolves to the main checkout even when that worktree carries a landed copy of the log directory.","source":".bkit/core/engine/commands/lib.ts:1238","status":"OPEN"}
