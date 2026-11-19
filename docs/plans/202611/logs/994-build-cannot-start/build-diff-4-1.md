diff --git a/.bkit/core/engine/commands/workflow/branches.test.ts b/.bkit/core/engine/commands/workflow/branches.test.ts
index 7758f8950..8d6f22742 100644
--- a/.bkit/core/engine/commands/workflow/branches.test.ts
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -1162,7 +1162,30 @@ describe(
       expect(read(dir, PC_LOG)).toBe("dev copy\n");
       const named = /the branch's differing copy is kept at (\S+)/.exec(r.err);
       expect(named).not.toBeNull();
-      expect(fs.statSync(named![1]!).size).toBe(Buffer.byteLength(big));
+      expect(fs.statSync(path.resolve(dir, named![1]!)).size).toBe(Buffer.byteLength(big));
+    });
+
+    it("names the kept branch copy in the rebase log by an outbox-relative path, never an absolute one", async () => {
+      const logFile = `docs/plans/202611/logs/${PC_FID}/rebase-resolve-log.md`;
+      const dir = planClosed("pc-rel", `feat/${PC_FID}`, [{ [PC_LOG]: "branch copy\n" }], {
+        [PC_LOG]: "dev copy\n",
+      });
+      const r = await run(dir, ["rebase", `--log-file=${logFile}`]);
+      expect(r.code).toBe(0);
+      const line = read(dir, logFile)
+        .split("\n")
+        .find((l) => l.includes(`RESOLVED ${PC_LOG}`));
+      expect(line).toBeDefined();
+      const named = /the branch's differing copy is kept at (\S+)/.exec(line!);
+      expect(named).not.toBeNull();
+      expect(path.isAbsolute(named![1]!)).toBe(false);
+      expect(named![1]!).toMatch(
+        new RegExp(
+          `^\\.git/bkit-outbox/${PC_FID}/dropped-logs/.+/${PC_LOG.replace(/[.]/g, "\\.")}$`,
+        ),
+      );
+      expect(fs.readFileSync(path.resolve(dir, named![1]!), "utf-8")).toBe("branch copy\n");
+      expect(read(dir, logFile)).not.toContain(dir);
     });
 
     it("gives a branch not named feat/{fid} no plan-log rule", async () => {
diff --git a/.bkit/core/engine/commands/workflow/branches.ts b/.bkit/core/engine/commands/workflow/branches.ts
index a7305633b..7a98fd2dd 100644
--- a/.bkit/core/engine/commands/workflow/branches.ts
+++ b/.bkit/core/engine/commands/workflow/branches.ts
@@ -35,6 +35,7 @@ import {
   git,
   isSharedBranch,
   OUTPUT_LIMIT,
+  outboxRel,
   parseJson,
   repoRoot,
   runGh,
@@ -634,7 +635,7 @@ export function resolveRebase(
           }
           result.resolved.push({ path: f, how: "dev" });
           log(
-            `RESOLVED ${f} — ${REBASE_HOW.dev}${kept === null ? "" : `; the branch's differing copy is kept at ${kept}`}`,
+            `RESOLVED ${f} — ${REBASE_HOW.dev}${kept === null ? "" : `; the branch's differing copy is kept at ${outboxRel(top, kept)}`}`,
           );
           continue;
         }
diff --git a/dist/commands/workflow/branches.js b/dist/commands/workflow/branches.js
index 936128eeb..f804ce2be 100644
--- a/dist/commands/workflow/branches.js
+++ b/dist/commands/workflow/branches.js
@@ -18,7 +18,7 @@ import * as os from "node:os";
 import * as path from "node:path";
 import { gitEnv } from "../../ledgers/telemetry.js";
 import { actionHash, actionKey, alreadyDone, recordAction, withTargetLock, } from "../../ledgers/status.js";
-import { bodySkipToken, CommandError, DEV, EXIT, ghUnavailable, git, isSharedBranch, OUTPUT_LIMIT, parseJson, repoRoot, runGh, runGit, SKIP_CI_TOKEN, wholeNumber, } from "../lib.js";
+import { bodySkipToken, CommandError, DEV, EXIT, ghUnavailable, git, isSharedBranch, OUTPUT_LIMIT, outboxRel, parseJson, repoRoot, runGh, runGit, SKIP_CI_TOKEN, wholeNumber, } from "../lib.js";
 import { bkitVersionStatus } from "../../shared/bkit-latest.js";
 import { parseBkitVersion, serializeBkitVersion, } from "../../install/version-file.js";
 import { DEV_REFSPEC, fetchDev, landBackoffMs, landDir, pushToDev, sleep } from "../land.js";
@@ -483,7 +483,7 @@ export function resolveRebase(top, onLog = () => undefined) {
                         return refuse(`REFUSE ${f} — resolution failed`, f, "resolution failed");
                     }
                     result.resolved.push({ path: f, how: "dev" });
-                    log(`RESOLVED ${f} — ${REBASE_HOW.dev}${kept === null ? "" : `; the branch's differing copy is kept at ${kept}`}`);
+                    log(`RESOLVED ${f} — ${REBASE_HOW.dev}${kept === null ? "" : `; the branch's differing copy is kept at ${outboxRel(top, kept)}`}`);
                     continue;
                 }
                 const settled = kind === "register"
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index f66459763..093ab6a53 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -538,3 +538,5 @@
 {"schema":3,"ts":1795090093637,"firstTs":1795090093637,"updates":1,"kind":"deferral","key":"994-build-cannot-start-challenge-low-bkit-core-engine-commands-workflow-branches-ts-646","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["994-build-cannot-start"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"When a plan file is settled on the target's copy and that empties the commit, the rebase log says the commit's changes \"were already on the target\", although the branch's differing version was thrown away","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/branches.ts:646: When a plan file is settled on the target's copy and that empties the commit, the rebase log says the commit's changes \"were already on the target\", although the branch's differing version was thrown away. Done when: Take a round where a `planlog` resolution replaced a branch side that differed from the target (stage 3 present and different from stage 2). When that round's commit then empties and is skipped, the skip line names those paths and says the branch's version was replaced by the rebase target's copy, for example `SKIPPED a commit emptied by taking the rebase target's copy of {paths}`. The line `SKIPPED an empty commit (its changes were already on the target)` stays only for a skip that no plan-file replacement caused. The existing union-emptied skip cases in `branches.test.ts` still pass.","source":".bkit/core/engine/commands/workflow/branches.ts:646","status":"OPEN"}
 {"schema":3,"ts":1795090093638,"firstTs":1795090093638,"updates":1,"kind":"deferral","key":"994-build-cannot-start-challenge-low-bkit-core-engine-commands-workflow-branches-ts-553","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["994-build-cannot-start"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A plan log named with a glob character (`n*.md`) that dev deleted makes `bkit branches rebase` run `git rm` on it as a pattern, silently deleting the feature's other tracked logs (`notes.md`, `next-steps.md`, and with `*` also `status.jsonl`) while reporting `resolved` for that one path and exit 0","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/branches.ts:553: A plan log named with a glob character (`n*.md`) that dev deleted makes `bkit branches rebase` run `git rm` on it as a pattern, silently deleting the feature's other tracked logs (`notes.md`, `next-steps.md`, and with `*` also `status.jsonl`) while reporting `resolved` for that one path and exit 0. Done when: `takeDevSide` passes the conflicted path to `git checkout`, `git add` and `git rm` as a literal file name (`--literal-pathspecs`, as `cleanupRead` in `.bkit/core/engine/commands/workflow/worktrees.ts:822` does), so a planlog resolution in `resolveRebase` and the `docs` policy in `resolvePath` stage or remove only the one conflicted path; every tracked file the conflict does not name keeps its content","source":".bkit/core/engine/commands/workflow/branches.ts:553","status":"OPEN"}
 {"schema":3,"ts":1795090093639,"firstTs":1795090093639,"updates":1,"kind":"deferral","key":"994-build-cannot-start-challenge-low-bkit-core-engine-commands-workflow-branches-ts-907","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["994-build-cannot-start"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A branch named `feat/logs/995-y/x` or `feat/archive/{stamp}-{other-fid}` makes `rebasedFid` return a feature id holding `/`, so `bkit branches rebase` auto-resolves a file inside another feature's folder (`docs/plans/202611/logs/995-y/x-plan.md`) or another feature's archived plan (`docs/plans/202611/archive/{stamp}-{other-fid}-plan.md`) instead of refusing it","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/branches.ts:907: A branch named `feat/logs/995-y/x` or `feat/archive/{stamp}-{other-fid}` makes `rebasedFid` return a feature id holding `/`, so `bkit branches rebase` auto-resolves a file inside another feature's folder (`docs/plans/202611/logs/995-y/x-plan.md`) or another feature's archived plan (`docs/plans/202611/archive/{stamp}-{other-fid}-plan.md`) instead of refusing it. Done when: `rebasedFid` returns null unless the `feat/` suffix passes the slug every recovered FID must pass (`FID_PATTERNS.none` in `.bkit/core/engine/commands/workflow/fids.ts:51`, which rejects `/`), so a rebase on a branch whose suffix is not a FID slug gets no plan-log rule and refuses with the reason naming the rule, as `docs/security.md` § CI Auto-Route Trust (FID slug allowlist) requires","source":".bkit/core/engine/commands/workflow/branches.ts:907","status":"OPEN"}
+{"schema":3,"ts":1795095893420,"firstTs":1795095893420,"updates":1,"kind":"deferral","key":"994-build-cannot-start-challenge-low-bkit-core-engine-commands-workflow-branches-ts-565","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["994-build-cannot-start"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A full disk or a blocked outbox folder makes keeping the branch's plan-log copy throw, so `bkit branches rebase` crashes with exit 1 and leaves the rebase in progress and half resolved, with no abort, no sentinel and no JSON, instead of refusing","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/branches.ts:565: A full disk or a blocked outbox folder makes keeping the branch's plan-log copy throw, so `bkit branches rebase` crashes with exit 1 and leaves the rebase in progress and half resolved, with no abort, no sentinel and no JSON, instead of refusing. Done when: `keptBranchCopy` in `.bkit/core/engine/commands/workflow/branches.ts` returns null when `droppedLogsDir` or `keepAside` throws, as it already does when `git cat-file` fails, so `resolveRebase` takes its existing `the branch's differing copy could not be kept aside` refusal. `bkit branches rebase` then exits 3, aborts the rebase, writes the `--sentinel` file, appends the log to `--log-file` and emits JSON with `outcome: refused` and `refused` naming the plan-log path.","source":".bkit/core/engine/commands/workflow/branches.ts:565","status":"OPEN"}
+{"schema":3,"ts":1795095893422,"firstTs":1795095893422,"updates":1,"kind":"deferral","key":"994-build-cannot-start-challenge-low-bkit-core-engine-commands-workflow-branches-test-ts-1091","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["994-build-cannot-start"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"The test for a branch that ends on the target's exact plan-log bytes builds its commits with `commit()`, which appends, so the branch ends on `v1\\ndev copy\\n`, the test repeats the differing two-round case, and the byte-identical case that empties its commit is never run","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/branches.test.ts:1091: The test for a branch that ends on the target's exact plan-log bytes builds its commits with `commit()`, which appends, so the branch ends on `v1\\ndev copy\\n`, the test repeats the differing two-round case, and the byte-identical case that empties its commit is never run. Done when: The second branch commit in `completes the rebase when the branch ends on the same plan-log bytes as the target, emptying its commit` replaces the plan log's content instead of appending to it. Before the rebase, the test asserts that the branch tip's copy equals `main`'s. After it, the test asserts one round (`rounds: 1`), a completed rebase and `dev copy\\n` in the worktree. The Derived Test Matrix row \"including a byte-identical copy that empties its commit\" is then covered.","source":".bkit/core/engine/commands/workflow/branches.test.ts:1091","status":"OPEN"}
