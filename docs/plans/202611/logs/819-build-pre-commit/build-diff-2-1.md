diff --git a/.bkit/core/engine/audits/repo/check-dist.integration.test.ts b/.bkit/core/engine/audits/repo/check-dist.integration.test.ts
index f4d1b7f20..2c97e3d77 100644
--- a/.bkit/core/engine/audits/repo/check-dist.integration.test.ts
+++ b/.bkit/core/engine/audits/repo/check-dist.integration.test.ts
@@ -127,4 +127,39 @@ describe("bkit-check-dist", () => {
     expect(readDist(dir)).toEqual(before);
     expect(scratchLeftovers(dir)).toEqual([]);
   });
+  it(
+    "refuses a staged dist file shadowed by a tab-named twin",
+    { timeout: localLimit(120_000) },
+    () => {
+      const dir = scratchRepo();
+      const built = fs.readFileSync(path.join(dir, "dist/a.js"), "utf-8");
+      write(dir, "dist/a.js", "console.log('PWNED');\n");
+      write(dir, "dist/a.js\tx", built);
+      git(dir, "add", "dist");
+      const result = check(dir);
+      expect(result.status).toBe(1);
+      expect(result.stderr + result.stdout).toContain(STALE_MESSAGE);
+    },
+  );
+
+  it(
+    "refuses a staged dist that matches the build only through a gitattributes filter",
+    { timeout: localLimit(120_000) },
+    () => {
+      const dir = scratchRepo();
+      write(dir, ".gitattributes", "tmp/**/dist/a.js working-tree-encoding=UTF-7\n");
+      write(dir, A, "// +AAo-console.log(+ACI-PWNED+ACI-)+ADs-\nexport const a: number = 1;\n");
+      build(dir);
+      const distA = path.join(dir, "dist/a.js");
+      const encoded = "// +AAo-console.log(+ACI-PWNED+ACI-)+ADs-";
+      const decoded = '// \nconsole.log("PWNED");';
+      const text = fs.readFileSync(distA, "utf-8");
+      expect(text).toContain(encoded);
+      fs.writeFileSync(distA, text.replace(encoded, decoded));
+      git(dir, "add", ".gitattributes", A, "dist");
+      const result = check(dir);
+      expect(result.status).toBe(1);
+      expect(result.stderr + result.stdout).toContain(STALE_MESSAGE);
+    },
+  );
 });
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 3d24a6534..c4cc9c1de 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -497,3 +497,4 @@
 {"schema":3,"ts":1794972433909,"firstTs":1794958143561,"updates":6,"kind":"deferral","key":"1028-gate-fails-workflow-challenge-low-scripts-gate-bkit-text-ceiling-mjs-67","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"utility","step":"manual"},"references":["1028-gate-fails-workflow"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"After a record conflict between an owner `raise` and an agent `lower`, an agent that follows the invalid-JSON message (\"Take either side\") can keep the lowered side; the merged total is then above that ceiling, so `lower` refuses and only a second owner raise clears it; the message also names `scripts/gate/bkit-text-ceiling.json` when `--record` points elsewhere","description":"Closed: no message tells the reader to take a side. A record the git index holds unmerged is a conflict whatever the file holds, and `lower` settles it from the record's index stages. Each folder may hold the smaller of ours + theirs - base and the higher of ours and theirs only when git is in a merge or a rebase (no REVERT_HEAD or CHERRY_PICK_HEAD) and the record's stage 3 has the object id of the record in that operation's own commit (MERGE_HEAD, or REBASE_HEAD with `rebase-merge/` or `rebase-apply/rebasing`), so an owner raise on one side carries through without a second raise and raises on both sides do not add up. Every other conflict (revert, cherry-pick, `git am`, `git apply -3`, stash pop, squash merge, any of these while a rebase is paused, or one git does not mark) may hold the smaller of ours and ours + theirs - base. A total at most that becomes the ceiling; above it, with a missing or invalid stage, with the record outside `--root`, or while a counted text file is unmerged, `lower` refuses and leaves the record unchanged. The invalid-JSON and merge-conflict lines name the record path the script read, including a `--record` path. Tests: .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts.","source":"scripts/gate/bkit-text-ceiling.mjs:67","status":"CLOSED"}
 {"schema":3,"ts":1794972733687,"firstTs":1794958143561,"updates":7,"kind":"deferral","key":"1028-gate-fails-workflow-challenge-low-scripts-gate-bkit-text-ceiling-mjs-67","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"utility","step":"manual"},"references":["1028-gate-fails-workflow"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"After a record conflict between an owner `raise` and an agent `lower`, an agent that follows the invalid-JSON message (\"Take either side\") can keep the lowered side; the merged total is then above that ceiling, so `lower` refuses and only a second owner raise clears it; the message also names `scripts/gate/bkit-text-ceiling.json` when `--record` points elsewhere","description":"Closed: no message tells the reader to take a side. A record the git index holds unmerged is a conflict whatever the file holds, and `lower` settles it from the record's index stages. Each folder may hold the smaller of ours + theirs - base and the higher of ours and theirs only when git is in a merge or a rebase (no REVERT_HEAD or CHERRY_PICK_HEAD) and the record's stage 3 has the object id of the record in that operation's own commit (MERGE_HEAD, or REBASE_HEAD with `rebase-merge/` or `rebase-apply/rebasing`), so an owner raise on one side carries through without a second raise and raises on both sides do not add up. Every other conflict (revert, cherry-pick, `git am`, `git apply -3`, stash pop, squash merge, any of these while a rebase is paused unless it replays the commit the rebase stopped on, which counts as the rebase's own, or one git does not mark) may hold the smaller of ours and ours + theirs - base. A total at most that becomes the ceiling; above it, with a missing or invalid stage, with the record outside `--root`, or while a counted text file is unmerged, `lower` refuses and leaves the record unchanged. Merging a branch whose owner raise already landed through a squash merge, or picking again the commit a paused rebase stopped on, counts that raise again, up to its size. The invalid-JSON and merge-conflict lines name the record path the script read, including a `--record` path. Tests: .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts.","source":"scripts/gate/bkit-text-ceiling.mjs:67","status":"CLOSED"}
 {"schema":3,"ts":1794972098203,"firstTs":1794972098203,"updates":1,"kind":"deferral","key":"1008-leftover-outbox-invocation-cache-files","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"plan","step":"plan-generate","subagent":"bkit-plan-generate","modelSource":"unavailable"},"references":["1008","docs/plans/202611/1008-plan-design-owner-plan.md § Out of Scope",".bkit/core/engine/commands/workflow/tracker.ts"],"type":"issue","category":"tooling","severity":"LOW","reason":"scope-declared","summary":"Existing clones keep their old `bkit-outbox/invocations/*.json` cache files after the engine stops reading them","description":"Issue 1008 moves a run's progress link from the private Git-common `bkit-outbox/invocations/` cache into the run's `status.jsonl`. Clones that ran an older engine keep the small cache files; nothing reads or writes them any more. They are outside committed content, hold only a hash, and cost a few hundred bytes per run.","remediation":"Remove the `invocations/` folder in a later outbox cleanup, for example next to the session-folder pruning in `repo info`.","source":"phase","status":"OPEN"}
+{"schema":3,"ts":1794982045034,"firstTs":1794982045034,"updates":1,"kind":"deferral","key":"819-build-pre-commit-challenge-low-scripts-gate-bkit-check-dist-mjs-67","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["819-build-pre-commit"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A commit that moves `outDir` (or sets `noEmit`) in `tsconfig.json` and drops `dist/` from the index passes the release gate's `Verify dist/ is fresh`, because an empty compile compared with an empty staged `dist/` counts as fresh; the old chain refused it at `chmod +x dist/cli.js`","description":"LOW build challenge finding at scripts/gate/bkit-check-dist.mjs:67: A commit that moves `outDir` (or sets `noEmit`) in `tsconfig.json` and drops `dist/` from the index passes the release gate's `Verify dist/ is fresh`, because an empty compile compared with an empty staged `dist/` counts as fresh; the old chain refused it at `chmod +x dist/cli.js`. Done when: the check exits 1 with a named reason when the scratch compile writes no file under `dist/`, so a staged `tsconfig.json` with `outDir` moved away from `dist` and no staged `dist/` is refused (reproduced in a scratch repo: the new script exits 0, the old chain prints `chmod: dist/cli.js: No such file or directory` and refuses)","source":"scripts/gate/bkit-check-dist.mjs:67","status":"OPEN"}
diff --git a/scripts/gate/bkit-check-dist.mjs b/scripts/gate/bkit-check-dist.mjs
index 9ae4e9d90..5873f9e39 100644
--- a/scripts/gate/bkit-check-dist.mjs
+++ b/scripts/gate/bkit-check-dist.mjs
@@ -70,8 +70,13 @@ function run() {
     for (const line of git(["ls-files", "-s", "-z", "--", "dist/"], { cwd: repo })
       .split("\0")
       .filter(Boolean)) {
-      const [meta, file] = line.split("\t");
-      const [mode, hash] = meta.split(" ");
+      const tab = line.indexOf("\t");
+      const file = line.slice(tab + 1);
+      const [mode, hash] = line.slice(0, tab).split(" ");
+      if (expected.has(file)) {
+        console.error(STALE);
+        return 1;
+      }
       expected.set(file, `${mode} ${hash}`);
     }
 
@@ -80,13 +85,16 @@ function run() {
     for (const rel of fs.existsSync(distRoot) ? walk(distRoot) : []) {
       const abs = path.join(distRoot, rel);
       const mode = fs.statSync(abs).mode & 0o111 ? "100755" : "100644";
-      actual.set(`dist/${rel}`, `${mode} ${git(["hash-object", abs]).trim()}`);
+      actual.set(`dist/${rel}`, `${mode} ${git(["hash-object", "--no-filters", abs]).trim()}`);
     }
 
     let stale = expected.size !== actual.size;
     for (const [file, value] of actual) {
       if (expected.get(file) !== value) stale = true;
     }
+    for (const file of expected.keys()) {
+      if (!actual.has(file)) stale = true;
+    }
     if (stale) {
       console.error(STALE);
       return 1;
