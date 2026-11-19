diff --git a/.bkit/core/engine/commands/ci/ci.test.ts b/.bkit/core/engine/commands/ci/ci.test.ts
index 1283601ff..b23ce27a3 100644
--- a/.bkit/core/engine/commands/ci/ci.test.ts
+++ b/.bkit/core/engine/commands/ci/ci.test.ts
@@ -35,6 +35,9 @@ const ENV_KEYS = [
   "FAKE_VALE_EXIT",
   "FAKE_VALE_LOG",
   "FAKE_VALE_SYNC",
+  "GIT_CONFIG_COUNT",
+  "GIT_CONFIG_KEY_0",
+  "GIT_CONFIG_VALUE_0",
 ];
 let savedEnv: Record<string, string | undefined> = {};
 let tmpRoot = "";
@@ -1354,4 +1357,61 @@ describe("bkit ci min-push", () => {
     expect(r.code).toBe(0);
     expect(r.json).toMatchObject({ minPush: true, reason: null, outside: [] });
   });
+
+  it("--target=main refuses an audit template's project section even when minPushPaths matches docs/**", async () => {
+    const { cwd, head } = pushedToMain(belowOnly.before, belowOnly.after, {
+      bkit: { testing: { minPushPaths: ["docs/**"] } },
+    });
+    const r = await run(cwd, [`--ref=${head}`, "--target=main"], "min-push");
+    expect(r.code).toBe(1);
+    expect(r.json.minPush).toBe(false);
+    expect(r.err).toContain(T1);
+  });
+
+  it("--target=main refuses a docs/audits file whose name has non-ASCII characters", async () => {
+    process.env.GIT_CONFIG_COUNT = "1";
+    process.env.GIT_CONFIG_KEY_0 = "core.quotePath";
+    process.env.GIT_CONFIG_VALUE_0 = "true";
+    const name = "docs/audits/202611/sécurité.md";
+    const { cwd, head } = pushedToMain({}, { [name]: "# Report\n" });
+    const r = await run(cwd, [`--ref=${head}`, "--target=main"], "min-push");
+    expect(r.code).toBe(1);
+    expect(r.json.minPush).toBe(false);
+    expect(r.err).toContain(name);
+  });
+
+  it("--target=main refuses an audit template project section already on origin/dev when its managed block also changed since origin/main", async () => {
+    const cwd = mkdir("bkit-ci-main-");
+    git(cwd, "init", "-q", "-b", "feat/1-x");
+    write(cwd, "src/a.ts", "export {};\n");
+    write(cwd, T1, auditTemplate("block", "old"));
+    const onMain = commit(cwd, "main");
+    git(cwd, "update-ref", "refs/remotes/origin/main", onMain);
+    write(cwd, T1, auditTemplate("block2", "new project text"));
+    const onDev = commit(cwd, "docs(1): audit bkit [skip ci]");
+    git(cwd, "update-ref", "refs/remotes/origin/dev", onDev);
+    write(cwd, "docs/plans/202611/logs/1-x/status.jsonl", "{}\n");
+    const head = commit(cwd, "docs(1): plan bkit [skip ci]");
+    const r = await run(cwd, [`--ref=${head}`, "--target=main"], "min-push");
+    expect(r.code).toBe(1);
+    expect(r.json.minPush).toBe(false);
+    expect(r.err).toContain(T1);
+  });
+
+  it("--target=main refuses an audit template new to main whose project section was edited on origin/dev", async () => {
+    const cwd = mkdir("bkit-ci-main-");
+    git(cwd, "init", "-q", "-b", "feat/1-x");
+    write(cwd, "src/a.ts", "export {};\n");
+    const onMain = commit(cwd, "main");
+    git(cwd, "update-ref", "refs/remotes/origin/main", onMain);
+    write(cwd, T1, auditTemplate("block", "new project text"));
+    const onDev = commit(cwd, "docs(1): audit bkit [skip ci]");
+    git(cwd, "update-ref", "refs/remotes/origin/dev", onDev);
+    write(cwd, "docs/plans/202611/logs/1-x/status.jsonl", "{}\n");
+    const head = commit(cwd, "docs(1): plan bkit [skip ci]");
+    const r = await run(cwd, [`--ref=${head}`, "--target=main"], "min-push");
+    expect(r.code).toBe(1);
+    expect(r.json.minPush).toBe(false);
+    expect(r.err).toContain(T1);
+  });
 });
diff --git a/.bkit/core/engine/commands/ci/ci.ts b/.bkit/core/engine/commands/ci/ci.ts
index c6a8ad7d3..cb86214fc 100644
--- a/.bkit/core/engine/commands/ci/ci.ts
+++ b/.bkit/core/engine/commands/ci/ci.ts
@@ -664,21 +664,34 @@ export function minPushOutside(
   return { ok: true, changed: diff.changed, outside, sections };
 }
 
+/** The text below an audit template's `bkit:end` line at `sha`; null when the file is absent there. */
+function projectSection(root: string, sha: string, file: string): string | null {
+  const res = gitRaw(root, ["cat-file", "blob", `${sha}:${file}`]);
+  if (res.status !== 0) return null;
+  const head = managedHead(res.stdout);
+  return head === null ? "" : res.stdout.slice(head.length);
+}
+
 /**
  * Audit files a pushed commit brings onto `main`: every changed file against its merge-base with
- * `origin/main` that sits under `docs/audits/**` or is an audit template changed only below its
- * managed block. `null` when `origin/main` does not resolve or the diff cannot be read.
+ * `origin/main` that sits under `docs/audits/**`, or is a top-level audit template whose text below
+ * its managed block differs (absent counts as empty), whether or not the block also changed. Reads
+ * no `minPushPaths`: every changed file counts. `null` when `origin/main` does not resolve or the
+ * diff cannot be read.
  */
-function mainAuditFiles(root: string, sha: string, paths: readonly string[]): string[] | null {
+function mainAuditFiles(root: string, sha: string): string[] | null {
   if (!runGit(root, ["rev-parse", "--verify", "--quiet", "origin/main"]).ok) return null;
   const mb = runGit(root, ["merge-base", sha, "origin/main"]);
   if (!mb.ok || !mb.stdout) return null;
-  const names = runGit(root, ["diff", "--name-only", mb.stdout, sha]);
-  if (!names.ok) return null;
-  const diff = minPushOutside(root, mb.stdout, sha, paths);
+  const diff = changedOutside(root, mb.stdout, sha, []);
   if (!diff.ok) return null;
-  const audits = names.stdout.split("\n").filter((f) => f.startsWith("docs/audits/"));
-  return [...new Set([...audits, ...diff.sections])];
+  const audits = diff.changed.filter((f) => f.startsWith("docs/audits/"));
+  const templates = diff.changed.filter((f) => {
+    if (!AUDIT_TEMPLATE_RE.test(f)) return false;
+    const after = projectSection(root, sha, f);
+    return after !== null && after !== (projectSection(root, mb.stdout, f) ?? "");
+  });
+  return [...new Set([...audits, ...templates])];
 }
 
 const sectionNote = (file: string) =>
@@ -728,7 +741,7 @@ function minPush(ctx: RunContext): number {
     for (const p of diff.outside) outside.add(p);
     for (const p of diff.sections) sections.add(p);
     if (target === "main") {
-      const onMain = sha ? mainAuditFiles(top.stdout, sha, paths) : null;
+      const onMain = sha ? mainAuditFiles(top.stdout, sha) : null;
       if (onMain === null) {
         ctx.log(`no origin/main base for ${ref} (or its git diff failed) — not proven a min push`);
         ctx.emit({ minPush: false, reason: "unknown", changed: 0, outside: [], paths });
diff --git a/DETAILS.md b/DETAILS.md
index 4d879f4d2..7952d1d6e 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -347,7 +347,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>265 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1962 symbols · 58 files"]
+    n_bkit_core_engine_commands["commands<br/>1964 symbols · 58 files"]
     n_bkit_core_engine_install["install<br/>370 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>241 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
@@ -356,7 +356,7 @@ flowchart LR
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   n_bkit_core_engine_commands -->|474| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|431| n_bkit_core_engine_shared
-  n_bkit_core_engine_commands -->|221| n_bkit_core_engine_install
+  n_bkit_core_engine_commands -->|222| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|187| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|147| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|89| n_bkit_core_engine_checks
diff --git a/dist/commands/ci/ci.js b/dist/commands/ci/ci.js
index 9670f050e..26f048906 100644
--- a/dist/commands/ci/ci.js
+++ b/dist/commands/ci/ci.js
@@ -577,25 +577,38 @@ export function minPushOutside(root, from, to, paths) {
     }
     return { ok: true, changed: diff.changed, outside, sections };
 }
+/** The text below an audit template's `bkit:end` line at `sha`; null when the file is absent there. */
+function projectSection(root, sha, file) {
+    const res = gitRaw(root, ["cat-file", "blob", `${sha}:${file}`]);
+    if (res.status !== 0)
+        return null;
+    const head = managedHead(res.stdout);
+    return head === null ? "" : res.stdout.slice(head.length);
+}
 /**
  * Audit files a pushed commit brings onto `main`: every changed file against its merge-base with
- * `origin/main` that sits under `docs/audits/**` or is an audit template changed only below its
- * managed block. `null` when `origin/main` does not resolve or the diff cannot be read.
+ * `origin/main` that sits under `docs/audits/**`, or is a top-level audit template whose text below
+ * its managed block differs (absent counts as empty), whether or not the block also changed. Reads
+ * no `minPushPaths`: every changed file counts. `null` when `origin/main` does not resolve or the
+ * diff cannot be read.
  */
-function mainAuditFiles(root, sha, paths) {
+function mainAuditFiles(root, sha) {
     if (!runGit(root, ["rev-parse", "--verify", "--quiet", "origin/main"]).ok)
         return null;
     const mb = runGit(root, ["merge-base", sha, "origin/main"]);
     if (!mb.ok || !mb.stdout)
         return null;
-    const names = runGit(root, ["diff", "--name-only", mb.stdout, sha]);
-    if (!names.ok)
-        return null;
-    const diff = minPushOutside(root, mb.stdout, sha, paths);
+    const diff = changedOutside(root, mb.stdout, sha, []);
     if (!diff.ok)
         return null;
-    const audits = names.stdout.split("\n").filter((f) => f.startsWith("docs/audits/"));
-    return [...new Set([...audits, ...diff.sections])];
+    const audits = diff.changed.filter((f) => f.startsWith("docs/audits/"));
+    const templates = diff.changed.filter((f) => {
+        if (!AUDIT_TEMPLATE_RE.test(f))
+            return false;
+        const after = projectSection(root, sha, f);
+        return after !== null && after !== (projectSection(root, mb.stdout, f) ?? "");
+    });
+    return [...new Set([...audits, ...templates])];
 }
 const sectionNote = (file) => `${file}: only its project section below <!-- bkit:end --> changed`;
 function minPush(ctx) {
@@ -645,7 +658,7 @@ function minPush(ctx) {
         for (const p of diff.sections)
             sections.add(p);
         if (target === "main") {
-            const onMain = sha ? mainAuditFiles(top.stdout, sha, paths) : null;
+            const onMain = sha ? mainAuditFiles(top.stdout, sha) : null;
             if (onMain === null) {
                 ctx.log(`no origin/main base for ${ref} (or its git diff failed) — not proven a min push`);
                 ctx.emit({ minPush: false, reason: "unknown", changed: 0, outside: [], paths });
diff --git a/docs/capabilities.md b/docs/capabilities.md
index c354c2092..72803fa6c 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -126,7 +126,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>265 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1962 symbols · 58 files"]
+    n_bkit_core_engine_commands["commands<br/>1964 symbols · 58 files"]
     n_bkit_core_engine_install["install<br/>370 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>241 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
@@ -135,7 +135,7 @@ flowchart LR
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   n_bkit_core_engine_commands -->|474| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|431| n_bkit_core_engine_shared
-  n_bkit_core_engine_commands -->|221| n_bkit_core_engine_install
+  n_bkit_core_engine_commands -->|222| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|187| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|147| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|89| n_bkit_core_engine_checks
@@ -260,7 +260,7 @@ flowchart LR
     end
     subgraph gn_bkit_core_engine_commands[".bkit/core/engine/commands"]
       subgraph gn_bkit_core_engine_commands_ci[".bkit/core/engine/commands/ci"]
-        n_bkit_core_engine_commands_ci_ci["ci<br/>46 symbols · 1 files"]
+        n_bkit_core_engine_commands_ci_ci["ci<br/>48 symbols · 1 files"]
         n_bkit_core_engine_commands_ci_pins["pins<br/>10 symbols · 1 files"]
         n_bkit_core_engine_commands_ci_push_gate["push-gate<br/>15 symbols · 1 files"]
       end
@@ -349,7 +349,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_worktrees -->|46| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_ledgers -->|43| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_issues -->|40| n_bkit_core_engine_commands_workflow_tracker
-  n_bkit_core_engine_commands_ci_ci -->|38| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_ci_ci -->|39| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_steps -->|37| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_issues -->|32| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_workflows -->|31| n_bkit_core_engine_commands_workflow_tracker
@@ -395,6 +395,7 @@ flowchart LR
   n_bkit_core_engine_install_write -->|16| n_bkit_core_engine_install_managed_block
   n_bkit_core_engine_ledgers_compact -->|16| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_checks_after_index -->|15| n_bkit_core_engine_checks_after_github
+  n_bkit_core_engine_commands_ci_ci -->|15| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_install_uninstall -->|15| n_bkit_core_engine_install_version_file
   n_bkit_core_engine_commands_land -->|15| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_fids -->|15| n_bkit_core_engine_commands_lib
@@ -417,7 +418,6 @@ flowchart LR
   nscripts_harvest -->|14| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_checks_after_index -->|13| n_bkit_core_engine_checks_after_tools
   n_bkit_core_engine_checks_before_index -->|13| n_bkit_core_engine_checks_before_files
-  n_bkit_core_engine_commands_ci_ci -->|13| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_ci_push_gate -->|13| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_context -->|13| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_run_facts -->|13| n_bkit_core_engine_ledgers_telemetry
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 5fb09b705..eda9406a7 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -525,3 +525,6 @@
 {"schema":3,"ts":1795011322096,"firstTs":1795011322096,"updates":1,"kind":"deferral","key":"1053-upgrade-leaves-stale-challenge-low-bkit-core-engine-install-modules-index-ts-202","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1053-upgrade-leaves-stale"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A committed symlink `.cursor/commands/bkit-leak.md -> ../../.claude/bkit-cloud.md` (or any file outside the repo) in a mirror dir whose host is not rendered this run gets followed, hashed and its sha256 recorded in the committed, public `.bkit/version`","description":"LOW build challenge finding at .bkit/core/engine/install/modules/index.ts:202: A committed symlink `.cursor/commands/bkit-leak.md -> ../../.claude/bkit-cloud.md` (or any file outside the repo) in a mirror dir whose host is not rendered this run gets followed, hashed and its sha256 recorded in the committed, public `.bkit/version`. Done when: `listRenderedOutputs` lists only regular files: a mirror entry whose own path is a symlink or not a regular file (`fs.lstatSync(abs).isFile()` false) is left out, while a regular file inside a symlinked host folder (the supported dotfiles `.codex` setup) is still listed; neither the install `postDispatch` (`core.ts:2119`) nor `updateCanonicalHashesAfterUpgrade` (via `upgrade.ts:1050`) reads or records a hash for such a path, so the docs/security.md § Secrets rule that machine-local secret files stay out of `canonicalHashes` holds. Today `listRenderedMirrors` takes every `bkit-*` name in every `RENDERED_MIRRORS` dir on disk, and orphan removal runs only for detected hosts (`hosts.ts` detects by `<host>/agents`), so a `.cursor/commands/` or `.opencode/commands/` entry with no `agents/` sibling survives the run, and `hashFile` / `readFileSync` follow the link.","source":".bkit/core/engine/install/modules/index.ts:202","status":"OPEN"}
 {"schema":3,"ts":1795005854792,"firstTs":1795005854792,"updates":1,"kind":"deferral","key":"1055-worktree-removal-says-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-805","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1055-worktree-removal-says"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A branch whose only work is a file under a directory named `:` (for example `:/src.txt`) is judged landed and deleted with that file lost, because `rev-list` and `ls-tree` read the path as top-of-repo pathspec magic for `src.txt` and a later `dev` commit held the branch's `src.txt`","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/worktrees.ts:805: A branch whose only work is a file under a directory named `:` (for example `:/src.txt`) is judged landed and deleted with that file lost, because `rev-list` and `ls-tree` read the path as top-of-repo pathspec magic for `src.txt` and a later `dev` commit held the branch's `src.txt`. Done when: every path that `git diff --name-only -z` returns is read as a literal path by both the `ls-tree` in `treeEntry` and the `rev-list` in `devHeldEntry` (for example `GIT_LITERAL_PATHSPECS=1` in the `cleanupRead` environment, or `--literal-pathspecs` before the subcommand), so `notOnDev` names a branch file whose path starts with `:` unless `origin/dev` holds that exact path.","source":".bkit/core/engine/commands/workflow/worktrees.ts:805","status":"OPEN"}
 {"schema":3,"ts":1795059081290,"firstTs":1795005854792,"updates":2,"kind":"deferral","key":"1055-worktree-removal-says-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-805","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-tasks"},"references":["1055-worktree-removal-says","1058-cleanup-check-reads"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A branch whose only work is a file under a directory named `:` (for example `:/src.txt`) is judged landed and deleted with that file lost, because `rev-list` and `ls-tree` read the path as top-of-repo pathspec magic for `src.txt` and a later `dev` commit held the branch's `src.txt`","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/worktrees.ts:805: A branch whose only work is a file under a directory named `:` (for example `:/src.txt`) is judged landed and deleted with that file lost, because `rev-list` and `ls-tree` read the path as top-of-repo pathspec magic for `src.txt` and a later `dev` commit held the branch's `src.txt`. Done when: every path that `git diff --name-only -z` returns is read as a literal path by both the `ls-tree` in `treeEntry` and the `rev-list` in `devHeldEntry` (for example `GIT_LITERAL_PATHSPECS=1` in the `cleanupRead` environment, or `--literal-pathspecs` before the subcommand), so `notOnDev` names a branch file whose path starts with `:` unless `origin/dev` holds that exact path.","source":".bkit/core/engine/commands/workflow/worktrees.ts:805","status":"CLOSED"}
+{"schema":3,"ts":1795079418704,"firstTs":1795079418704,"updates":1,"kind":"deferral","key":"1031-pre-push-refuses-challenge-low-bkit-templates-husky-pre-push-246","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1031-pre-push-refuses"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A `[skip ci]` push to `main` refused for code (`src/a.ts` outside the min-push paths), for an unresolved `origin/main` (exit 7) or for an older engine that rejects `--target` (`unknown flag --target`, exit 2) still prints \"Audit reports and audit-template project sections may skip CI on dev only ... (the files are named above)\", although no audit file was named; the hook keys the line on `push_target` being set, not on the refusal reason, and throws away the JSON `reason` on stdout","description":"LOW build challenge finding at .bkit/templates/.husky/pre-push:246: A `[skip ci]` push to `main` refused for code (`src/a.ts` outside the min-push paths), for an unresolved `origin/main` (exit 7) or for an older engine that rejects `--target` (`unknown flag --target`, exit 2) still prints \"Audit reports and audit-template project sections may skip CI on dev only ... (the files are named above)\", although no audit file was named; the hook keys the line on `push_target` being set, not on the refusal reason, and throws away the JSON `reason` on stdout. Done when: the dev-only audit sentence appears only when the refusal reason is `audit` (for example the engine logs it on its `reason: \"audit\"` path and both hook copies, `.bkit/templates/.husky/pre-push:246` and `.husky/pre-push:303`, drop the conditional echo), and a code, not-proven or usage refusal on `main` prints no claim that audit files were named","source":".bkit/templates/.husky/pre-push:246","status":"OPEN"}
+{"schema":3,"ts":1795079418709,"firstTs":1795079418709,"updates":1,"kind":"deferral","key":"1031-pre-push-refuses-challenge-low-bkit-core-engine-commands-ci-ci-ts-748","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1031-pre-push-refuses"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"On the new `reason: \"audit\"` path, `min-push --json` puts the audit files in `outside` (files that DO match a min-push path, against the spec \"the changed files no min-push path matches\"), drops the real outside files of the same push, and mixes ranges: `changed` counts the `origin/dev` range while `outside` comes from the `origin/main` range, so in the \"already on origin/dev\" case `outside` names a file that `changed` never counted","description":"LOW build challenge finding at .bkit/core/engine/commands/ci/ci.ts:748: On the new `reason: \"audit\"` path, `min-push --json` puts the audit files in `outside` (files that DO match a min-push path, against the spec \"the changed files no min-push path matches\"), drops the real outside files of the same push, and mixes ranges: `changed` counts the `origin/dev` range while `outside` comes from the `origin/main` range, so in the \"already on origin/dev\" case `outside` names a file that `changed` never counted. Done when: the audit files are emitted in their own field (for example `audit`), declared in the `min-push` output spec, `outside` keeps its declared meaning and still lists real outside files when audit files are also refused, and the outside count is still logged","source":".bkit/core/engine/commands/ci/ci.ts:748","status":"OPEN"}
+{"schema":3,"ts":1795079418710,"firstTs":1795079418710,"updates":1,"kind":"deferral","key":"1031-pre-push-refuses-challenge-low-bkit-core-engine-commands-ci-ci-ts-673","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1031-pre-push-refuses"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A `[skip ci]` push of an audit report to `main` on a remote other than `origin` (for example `git push upstream HEAD:main` while the fork's `origin/main` already holds the report) passes, because the main check measures from the local `origin/main` ref and not from the `main` SHA the pushed-to remote advertises on the hook's stdin","description":"LOW build challenge finding at .bkit/core/engine/commands/ci/ci.ts:673: A `[skip ci]` push of an audit report to `main` on a remote other than `origin` (for example `git push upstream HEAD:main` while the fork's `origin/main` already holds the report) passes, because the main check measures from the local `origin/main` ref and not from the `main` SHA the pushed-to remote advertises on the hook's stdin. Done when: The owner decides which base the `main` audit check trusts. No agent can settle it, because the plan fixed `origin/main` as the base (Open Questions, first assumption) and the alternative changes the `min-push` flag contract and both hook copies: the hook would hand the `<remote sha>` it reads for `refs/heads/main` to `bkit ci min-push --target=main`, and the check would count as not proven when that SHA is all zeroes or missing locally. Either the check moves to that SHA, or `origin/main` stays and `docs/security.md` says the check assumes the push goes to `origin`","source":".bkit/core/engine/commands/ci/ci.ts:673","status":"OPEN"}
