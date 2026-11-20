diff --git a/.bkit/core/engine/commands/workflow/branches.test.ts b/.bkit/core/engine/commands/workflow/branches.test.ts
index 1a8d56ff2..98e2773ee 100644
--- a/.bkit/core/engine/commands/workflow/branches.test.ts
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -21,6 +21,7 @@ import {
   embedDocs,
   readAnchor,
   replayBuild,
+  restoreBranchRows,
   stampAnchor,
 } from "./branches";
 import { appendRecordCommit, newRecord, writeRecord } from "./ledgers";
@@ -4920,3 +4921,25 @@ describe("branches scan-diff --since-step", { timeout: GIT_TIMEOUT }, () => {
     expect(r.json).toEqual({ found: true, paths: ["src/fix.ts"] });
   });
 });
+
+describe("restoreBranchRows", { timeout: GIT_TIMEOUT }, () => {
+  it("restoreBranchRows writes nothing through a symlinked ledger", () => {
+    const dir = makeRepo("restore-symlink");
+    const outside = tmp("restore-symlink-outside");
+    const planted = path.join(outside, "planted");
+    git(dir, "checkout", "-q", "-b", "feat");
+    fs.mkdirSync(path.join(dir, "docs"), { recursive: true });
+    fs.symlinkSync(planted, path.join(dir, "docs/evil.jsonl"));
+    git(dir, "add", "-A");
+    git(dir, "commit", "-q", "-m", "feat: a symlinked ledger");
+    git(dir, "checkout", "-q", "main");
+    write(dir, "src.txt", "code v1\n");
+    git(dir, "add", "-A");
+    git(dir, "commit", "-q", "-m", "main: moves on");
+    const merge = git(dir, "merge", "--no-ff", "--no-commit", "-X", "ours", "feat");
+    expect(merge.ok, merge.err).toBe(true);
+    expect(fs.lstatSync(path.join(dir, "docs/evil.jsonl")).isSymbolicLink()).toBe(true);
+    restoreBranchRows(dir, "feat");
+    expect(fs.existsSync(planted)).toBe(false);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/branches.ts b/.bkit/core/engine/commands/workflow/branches.ts
index d957bd5ed..57020b8d5 100644
--- a/.bkit/core/engine/commands/workflow/branches.ts
+++ b/.bkit/core/engine/commands/workflow/branches.ts
@@ -2934,6 +2934,16 @@ export function restoreBranchRows(dir: string, branch: string): void {
   for (const p of changed) {
     const before = new Set(revLines(dir, base, p));
     const file = path.join(dir, p);
+    // Never write through a symlink or outside `dir`.
+    const stat = fs.lstatSync(file, { throwIfNoEntry: false });
+    if (stat !== undefined && !stat.isFile()) continue;
+    if (stat === undefined) {
+      const parent = path.dirname(file);
+      if (!fs.existsSync(parent)) continue;
+      const realParent = fs.realpathSync(parent);
+      const realDir = fs.realpathSync(dir);
+      if (realParent !== realDir && !realParent.startsWith(realDir + path.sep)) continue;
+    }
     const wrote = withTargetLock(file, () => {
       const text = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
       const have = new Set(text.split("\n").map((l) => l.trim()));
diff --git a/.bkit/core/engine/commands/workflow/ledgers.ts b/.bkit/core/engine/commands/workflow/ledgers.ts
index 40ce6af51..51dd73f8b 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.ts
@@ -155,7 +155,7 @@ export function bookPathspecs(
 }
 
 /** Ledgers a worktree teardown carries into the destination checkout. */
-const UNION_PATHSPECS = [
+export const UNION_PATHSPECS = [
   "docs/plans/*/logs/*/*.jsonl",
   "docs/*.jsonl",
   ".bkit/*.jsonl",
diff --git a/.bkit/core/engine/commands/workflow/prs.ts b/.bkit/core/engine/commands/workflow/prs.ts
index ba384bcc1..95817db20 100644
--- a/.bkit/core/engine/commands/workflow/prs.ts
+++ b/.bkit/core/engine/commands/workflow/prs.ts
@@ -52,7 +52,8 @@ import { EXIT_NO_STATUS, FILE_FLAG, readRuns, readStatusRows, statusFile, str }
 // gh
 // ---------------------------------------------------------------------------
 
-const PR_FIELDS = "number,url,state,baseRefName,headRefName,headRefOid,title,mergeCommit";
+const PR_FIELDS =
+  "number,url,state,baseRefName,headRefName,headRefOid,title,mergeCommit,isCrossRepository";
 
 export interface PrInfo {
   number: number;
@@ -64,6 +65,7 @@ export interface PrInfo {
   title: string;
   mergeCommit: { oid?: string } | null;
   mergeable?: string;
+  isCrossRepository?: boolean;
 }
 
 export type Probe =
@@ -163,7 +165,7 @@ export function probePr(
   const prs = parsed.value as PrInfo[];
   const pr =
     opts.state === "open"
-      ? prs[0]
+      ? prs.find((p) => p.isCrossRepository !== true)
       : (prs.find((p) => p.state === "OPEN") ?? prs.find((p) => p.state === "MERGED"));
   return qualify(pr);
 }
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 46a95c2c6..c5b860231 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -2478,7 +2478,12 @@ function ghStub(head: string, base: "dev" | "none" = "dev", options: GhOptions =
  * A branch an earlier attempt left on the bare `remote`: one commit on `branch` from the remote's
  * `dev` carrying `files`, pushed from a scratch clone. Returns the tip.
  */
-function leftBranch(remote: string, branch: string, files: Record<string, string>) {
+function leftBranch(
+  remote: string,
+  branch: string,
+  files: Record<string, string>,
+  links: Record<string, string> = {},
+) {
   const clone = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-workflows-left-")));
   dirs.push(clone);
   git(clone, "clone", "-q", remote, ".");
@@ -2486,6 +2491,10 @@ function leftBranch(remote: string, branch: string, files: Record<string, string
   git(clone, "config", "user.name", "t");
   git(clone, "checkout", "-q", "-b", branch, "origin/dev");
   for (const [rel, body] of Object.entries(files)) write(clone, rel, body);
+  for (const [rel, target] of Object.entries(links)) {
+    fs.mkdirSync(path.dirname(path.join(clone, rel)), { recursive: true });
+    fs.symlinkSync(target, path.join(clone, rel));
+  }
   git(clone, "add", "-A");
   git(clone, "commit", "-qm", "chore: an earlier attempt's record [skip ci]");
   git(clone, "push", "-q", "origin", `HEAD:refs/heads/${branch}`);
@@ -2506,6 +2515,22 @@ async function withGhOnPath<T>(bin: string, fn: () => Promise<T>): Promise<T> {
   }
 }
 
+/** A gh on PATH running `body` (a `case "$1 $2"` arm list); records its calls in `{bin}/calls`. */
+function rawGh(body: string[]) {
+  const bin = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-workflows-gh-")));
+  dirs.push(bin);
+  fs.writeFileSync(
+    path.join(bin, "gh"),
+    ["#!/bin/sh", `echo "$*" >> "${bin}/calls"`, 'case "$1 $2" in', ...body, "esac", ""].join("\n"),
+    { mode: 0o755 },
+  );
+  const calls = () =>
+    fs.existsSync(path.join(bin, "calls"))
+      ? fs.readFileSync(path.join(bin, "calls"), "utf-8").trim().split("\n")
+      : [];
+  return { bin, calls };
+}
+
 describe("bkit workflows handover", () => {
   function withRemote() {
     const cwd = repo();
@@ -2885,6 +2910,92 @@ describe("bkit workflows handover", () => {
     expect(read.status).toBe(0);
   });
 
+  const newRecordRow = () => jsonl([{ type: "workflow-failed", workflow: "ship", note: "new" }]);
+
+  it("--flush refused by dev does not merge a leftover tip that adds a symlinked ledger", async () => {
+    const outside = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-workflows-out-")));
+    dirs.push(outside);
+    const planted = path.join(outside, "planted");
+    let tip = "";
+    const { remote, wt } = refusedAfter((rm) => {
+      tip = leftBranch(rm, `ship-failed/${FID}`, earlier, { [`${REL}/evil.jsonl`]: planted });
+    });
+    write(wt, `${REL}/status.jsonl`, newRecordRow());
+    const gh = ghStub(`ship-failed/${FID}`, "dev", { openAfterCreate: true });
+    const r = await withGhOnPath(gh.bin, () => flush(wt));
+    expect(r.code).toBe(10);
+    expect(r.err).toContain(`ship-failed/${FID}`);
+    expect(r.err).toContain("evil.jsonl");
+    expect(git(remote, "rev-parse", `ship-failed/${FID}`)).toBe(tip);
+    expect(fs.existsSync(planted)).toBe(false);
+  });
+
+  it("--flush refused by dev with a fork PR on the ship-failed branch name opens its own PR", async () => {
+    const { wt } = refusedAfter((rm) => leftBranch(rm, `ship-failed/${FID}`, earlier));
+    write(wt, `${REL}/status.jsonl`, newRecordRow());
+    const head = `ship-failed/${FID}`;
+    const pr = (n: number, cross: boolean) =>
+      `{"number":${n},"url":"https://github.com/o/r/pull/${n}","state":"OPEN","baseRefName":"dev","headRefName":"${head}","headRefOid":"${"0".repeat(40)}","isCrossRepository":${cross}}`;
+    const gh = rawGh([
+      `  "pr create") : > "$0.created"; exit 0 ;;`,
+      `  "pr list") if [ -f "$0.created" ]; then echo '[${pr(7, true)},${pr(9, false)}]'; else echo '[${pr(7, true)}]'; fi ;;`,
+      `  "pr view") if [ -f "$0.merged" ]; then echo '{"number":9,"state":"MERGED","baseRefName":"dev","mergeCommit":{"oid":"abc"}}'; else echo '${pr(9, false)}'; fi ;;`,
+      `  "pr merge") : > "$0.merged"; exit 0 ;;`,
+    ]);
+    const r = await withGhOnPath(gh.bin, () => flush(wt));
+    expect(r.code, r.err).toBe(0);
+    const create = gh.calls().filter((c) => c.startsWith("pr create"));
+    expect(create).toHaveLength(1);
+    expect(create[0]).toContain(`--head ${head}`);
+    expect(gh.calls().some((c) => c.startsWith("pr merge 7"))).toBe(false);
+  });
+
+  it("--flush refused by dev onto a leftover ship-failed branch keeps the skip token on the pushed head", async () => {
+    const { remote, wt } = refusedAfter((rm) => leftBranch(rm, `ship-failed/${FID}`, earlier));
+    write(wt, `${REL}/status.jsonl`, newRecordRow());
+    const gh = ghStub(`ship-failed/${FID}`, "dev", { mergeFails: true });
+    const r = await withGhOnPath(gh.bin, () => flush(wt));
+    expect(r.code, r.err).toBe(0);
+    expect(git(remote, "log", "-1", "--format=%s", `ship-failed/${FID}`)).toBe(
+      "chore(12-export-csv): ship FAILED bkit [skip ci]",
+    );
+  });
+
+  it("--flush refused by dev does not merge a leftover tip that adds a skill", async () => {
+    let tip = "";
+    const { remote, wt } = refusedAfter((rm) => {
+      tip = leftBranch(rm, `ship-failed/${FID}`, {
+        ...earlier,
+        ".claude/skills/probe/SKILL.md": "# probe\n",
+      });
+    });
+    write(wt, `${REL}/status.jsonl`, newRecordRow());
+    const gh = ghStub(`ship-failed/${FID}`, "dev", { openAfterCreate: true });
+    const r = await withGhOnPath(gh.bin, () => flush(wt));
+    expect(r.code).toBe(10);
+    expect(r.err).toContain(`ship-failed/${FID}`);
+    expect(r.err).toContain(".claude/skills/probe/SKILL.md");
+    expect(git(remote, "rev-parse", `ship-failed/${FID}`)).toBe(tip);
+  });
+
+  it("--flush refused by dev does not merge a leftover tip that writes .bkit/issues.jsonl", async () => {
+    let tip = "";
+    const { remote, wt } = refusedAfter((rm) => {
+      tip = leftBranch(rm, `ship-failed/${FID}`, {
+        ...earlier,
+        ".bkit/issues.jsonl": jsonl([{ type: "SHIPPED", fid: FID, note: "planted" }]),
+      });
+    });
+    write(wt, `${REL}/status.jsonl`, newRecordRow());
+    const gh = ghStub(`ship-failed/${FID}`, "dev", { openAfterCreate: true });
+    const r = await withGhOnPath(gh.bin, () => flush(wt));
+    expect(r.code).toBe(10);
+    expect(r.err).toContain(".bkit/issues.jsonl");
+    // The branch stays at the leftover tip: the new record is not merged onto it.
+    expect(git(remote, "rev-parse", `ship-failed/${FID}`)).toBe(tip);
+    expect(git(remote, "show", `dev:.bkit/issues.jsonl`)).not.toContain("planted");
+  });
+
   describe("route and message: every exit the handover reaches ends the run as a stop", () => {
     const notPushed = (tree: string) =>
       `Record not pushed: the handover commit is only in ${tree}, and the links in this run's comments open once it is pushed`;
@@ -3492,6 +3603,35 @@ describe("bkit workflows close --flush (ship)", () => {
       );
     });
 
+    it("a second refused close waits for the reused PR head to reach the pushed tip before merging", async () => {
+      const s = shipping(true);
+      fs.writeFileSync(path.join(s.remote, "hooks", "pre-receive"), DEV_ONLY_HOOK, {
+        mode: 0o755,
+      });
+      const branch = `ship-close/${FID}`;
+      const leftover = leftBranch(s.remote, branch, {
+        [`${REL}/ship-earlier.md`]: "# Earlier close\n",
+      });
+      // The first two reads (the reuse probe, then the merge's own re-read) still see the
+      // leftover tip, as GitHub does until it has moved the PR's head; later reads see the push.
+      const open = `{"number":9,"url":"https://github.com/o/r/pull/9","state":"OPEN","baseRefName":"dev","headRefName":"${branch}","headRefOid":"'"$oid"'","isCrossRepository":false}`;
+      const read = [
+        `n=$(cat "$0.reads" 2>/dev/null || echo 0); n=$((n+1)); echo $n > "$0.reads"`,
+        `if [ $n -le 2 ]; then oid=${leftover}; else oid=$(git --git-dir="${s.remote}" rev-parse refs/heads/${branch}); : > "$0.seen"; fi`,
+      ].join("; ");
+      const gh = rawGh([
+        `  "pr list") ${read}; echo '[${open}]' ;;`,
+        `  "pr view") if [ -f "$0.merged" ]; then echo '{"number":9,"state":"MERGED","baseRefName":"dev","mergeCommit":{"oid":"abc"}}'; else ${read}; echo '${open}'; fi ;;`,
+        `  "pr merge") pushed=$(git --git-dir="${s.remote}" rev-parse refs/heads/${branch}); case "$*" in *"--match-head-commit $pushed"*) if [ -f "$0.seen" ]; then : > "$0.merged"; exit 0; fi ;; esac; echo "Head branch was modified" >&2; exit 1 ;;`,
+      ]);
+      const r = await withGhOnPath(gh.bin, () => run(s.wt, s.close));
+      expect(r.code, r.err).toBe(0);
+      expect(r.json.landed).toEqual({ ref: branch, via: "close-pr" });
+      const pushed = git(s.remote, "rev-parse", branch);
+      expect(pushed).not.toBe(leftover);
+      expect(gh.calls().filter((c) => c.includes(`--match-head-commit ${pushed}`))).toHaveLength(1);
+    });
+
     it("closePr refuses when the PR base is unknown", async () => {
       const { wt, close, bin, calls } = refusedDev("none");
       const r = await withGh(bin, () => run(wt, close));
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index 7188d21b4..2f0286bfa 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -54,7 +54,7 @@ import {
 import { getWorkflowsRoot } from "../../shared/package-roots.js";
 import { ASK_POINTS, readBkitConfig } from "../../shared/settings.js";
 import { gradeCompliance } from "../comply.js";
-import { fetchDev, landDir, pushToDev, type DevPush } from "../land.js";
+import { fetchDev, landDir, pushToDev, sleep, type DevPush } from "../land.js";
 import {
   CommandError,
   DEV,
@@ -72,7 +72,6 @@ import {
   type FlagValue,
   type RunContext,
 } from "../lib.js";
-import { minPushOutside, minPushPathspecs } from "../ci/ci.js";
 import {
   anchorBkitStatus,
   pushBranch,
@@ -94,7 +93,9 @@ import {
 } from "./issues.js";
 import {
   EXIT_EMPTY,
+  UNION_PATHSPECS,
   activeRecord,
+  changedOutside,
   appendRunCommits,
   commitBookkeeping,
   ownPathCommit,
@@ -958,7 +959,8 @@ async function landFailedRecord(
             ctx.log(
               `dev refused the ${o.workflow} FAILED push — publishing it through a PR: ${stderr}`,
             );
-            pr = closePr(ctx, dir, {
+            pr = await closePr(ctx, dir, {
+              fid: o.fid,
               title: `chore(${o.fid}): ${o.workflow} FAILED`,
               branch: `ship-failed/${o.fid}`,
               subject: `chore(${o.fid}): ${o.workflow} FAILED bkit [skip ci]`,
@@ -1682,12 +1684,12 @@ export function closeWorkflow(
  * push fast-forwards, and an open PR for the branch is reused. Returns where
  * it landed and the pushed commit, or why it did not.
  */
-function closePr(
+async function closePr(
   ctx: RunContext,
   dir: string,
-  o: { title: string; branch: string; subject: string },
-): { ref: string; via: string; sha: string } | { failed: string } {
-  const { branch, title, subject } = o;
+  o: { title: string; branch: string; subject: string; fid: string },
+): Promise<{ ref: string; via: string; sha: string } | { failed: string }> {
+  const { branch, title, subject, fid } = o;
   // An empty answer is no branch; a failed read is not.
   const tipRead = runGit(dir, ["ls-remote", "origin", `refs/heads/${branch}`]);
   if (!tipRead.ok) return { failed: `cannot read origin's ${branch}: ${tipRead.stderr}` };
@@ -1697,11 +1699,26 @@ function closePr(
       return { failed: `cannot fetch origin's ${branch}` };
     const mergeBase = git(dir, ["merge-base", "HEAD", tip]);
     if (mergeBase === null) return { failed: `${branch} at ${tip} shares no history with ${DEV}` };
-    const diff = minPushOutside(dir, mergeBase, tip, minPushPathspecs(readBkitConfig(dir)));
+    // Only what a record holds: the run's log folder and the ledger globs.
+    const diff = changedOutside(dir, mergeBase, tip, [
+      `docs/plans/*/logs/${fid}/*`,
+      ...UNION_PATHSPECS,
+    ]);
     if (!diff.ok) return { failed: `cannot diff origin's ${branch} at ${tip}: ${diff.stderr}` };
     if (diff.outside.length > 0)
       return {
-        failed: `origin's ${branch} at ${tip} changes files outside the min-push paths, so it is not merged: ${diff.outside.join(", ")}`,
+        failed: `origin's ${branch} at ${tip} changes files outside the record's paths, so it is not merged: ${diff.outside.join(", ")}`,
+      };
+    const special = (
+      git(dir, ["diff", "--raw", "--no-renames", "--diff-filter=AMT", mergeBase, tip]) ?? ""
+    )
+      .split("\n")
+      .map((l) => /^:\d+ (\d+) \S+ \S+ \S+\t(.*)$/.exec(l))
+      .filter((m): m is RegExpExecArray => m !== null && (m[1] === "120000" || m[1] === "160000"))
+      .map((m) => m[2]!);
+    if (special.length > 0)
+      return {
+        failed: `origin's ${branch} at ${tip} adds or changes entries that are not regular files, so it is not merged: ${special.join(", ")}`,
       };
     const merged = runGit(dir, ["merge", "--no-ff", "--no-commit", "-X", "ours", tip]);
     if (!merged.ok) {
@@ -1709,7 +1726,7 @@ function closePr(
       return { failed: `merge of origin's ${branch} at ${tip} stopped: ${merged.stderr}` };
     }
     restoreBranchRows(dir, tip);
-    const made = runGit(dir, ["commit", "--no-edit"]);
+    const made = runGit(dir, ["commit", "-m", subject]);
     if (!made.ok) {
       runGit(dir, ["merge", "--abort"]);
       return { failed: `merge commit of origin's ${branch} at ${tip} failed: ${made.stderr}` };
@@ -1720,7 +1737,9 @@ function closePr(
     return { failed: `close branch push failed for ${branch}` };
   // Only a branch an earlier attempt left can already have a PR.
   const open = tip === null ? null : probePr(dir, { head: branch, base: DEV, state: "open" });
-  if (open?.kind !== "ok" || open.pr?.number === undefined) {
+  const reused =
+    open?.kind === "ok" && open.pr?.number !== undefined && open.pr.headRefName === branch;
+  if (!reused) {
     const created = runGh(dir, [
       "pr",
       "create",
@@ -1738,12 +1757,17 @@ function closePr(
         failed: `gh pr create failed for ${branch}, which holds the record: ${created.stderr}`,
       };
   }
-  const pr =
-    open?.kind === "ok" && open.pr?.number !== undefined
-      ? open
-      : probePr(dir, { head: branch, base: DEV, state: "open" });
+  const pr = reused ? open : probePr(dir, { head: branch, base: DEV, state: "open" });
   const number = pr.kind === "ok" ? pr.pr?.number : undefined;
   if (number === undefined) return { failed: `close PR not found for ${branch}` };
+  if (reused) {
+    // GitHub moves a PR's head to a push a moment later; merge only once it has.
+    for (let i = 0; i < 20; i++) {
+      const seen = probePr(dir, { number: String(number), state: "open" });
+      if (seen.kind === "ok" && seen.pr?.headRefOid === head) break;
+      await sleep(500);
+    }
+  }
   const merged = mergePr(
     dir,
     { number: String(number), subject, matchHead: head, deleteBranch: true },
@@ -1798,7 +1822,8 @@ async function shipClose(
       },
       refused: async (dir, stderr) => {
         ctx.log(`dev refused the close push — publishing it through a PR: ${stderr}`);
-        viaPr = closePr(ctx, dir, {
+        viaPr = await closePr(ctx, dir, {
+          fid: o.fid,
           title: `docs(${o.fid}): ship DONE`,
           branch: `ship-close/${o.fid}`,
           subject,
diff --git a/dist/commands/workflow/branches.js b/dist/commands/workflow/branches.js
index 1eed209a0..15bf21792 100644
--- a/dist/commands/workflow/branches.js
+++ b/dist/commands/workflow/branches.js
@@ -2426,6 +2426,19 @@ export function restoreBranchRows(dir, branch) {
     for (const p of changed) {
         const before = new Set(revLines(dir, base, p));
         const file = path.join(dir, p);
+        // Never write through a symlink or outside `dir`.
+        const stat = fs.lstatSync(file, { throwIfNoEntry: false });
+        if (stat !== undefined && !stat.isFile())
+            continue;
+        if (stat === undefined) {
+            const parent = path.dirname(file);
+            if (!fs.existsSync(parent))
+                continue;
+            const realParent = fs.realpathSync(parent);
+            const realDir = fs.realpathSync(dir);
+            if (realParent !== realDir && !realParent.startsWith(realDir + path.sep))
+                continue;
+        }
         const wrote = withTargetLock(file, () => {
             const text = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
             const have = new Set(text.split("\n").map((l) => l.trim()));
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index a6ed09196..caa6f8bd6 100644
--- a/dist/commands/workflow/ledgers.js
+++ b/dist/commands/workflow/ledgers.js
@@ -76,7 +76,7 @@ export function bookPathspecs(month, fid, scope, extra = []) {
     return specs;
 }
 /** Ledgers a worktree teardown carries into the destination checkout. */
-const UNION_PATHSPECS = [
+export const UNION_PATHSPECS = [
     "docs/plans/*/logs/*/*.jsonl",
     "docs/*.jsonl",
     ".bkit/*.jsonl",
diff --git a/dist/commands/workflow/prs.js b/dist/commands/workflow/prs.js
index 280d2bd68..e4b201375 100644
--- a/dist/commands/workflow/prs.js
+++ b/dist/commands/workflow/prs.js
@@ -19,7 +19,7 @@ import { EXIT_NO_STATUS, FILE_FLAG, readRuns, readStatusRows, statusFile, str }
 // ---------------------------------------------------------------------------
 // gh
 // ---------------------------------------------------------------------------
-const PR_FIELDS = "number,url,state,baseRefName,headRefName,headRefOid,title,mergeCommit";
+const PR_FIELDS = "number,url,state,baseRefName,headRefName,headRefOid,title,mergeCommit,isCrossRepository";
 /**
  * The `owner/repo` a PR URL points at, or undefined when it is not a recognizable
  * GitHub PR URL. Lets a caller compare the repo a PR resolved in against `--repo`.
@@ -99,7 +99,7 @@ export function probePr(cwd, opts) {
     }
     const prs = parsed.value;
     const pr = opts.state === "open"
-        ? prs[0]
+        ? prs.find((p) => p.isCrossRepository !== true)
         : (prs.find((p) => p.state === "OPEN") ?? prs.find((p) => p.state === "MERGED"));
     return qualify(pr);
 }
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index 1107edc7c..9396c7061 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -28,12 +28,11 @@ import { check as checkCompleteness, deriveContract, parseRows, readCompleteness
 import { getWorkflowsRoot } from "../../shared/package-roots.js";
 import { ASK_POINTS, readBkitConfig } from "../../shared/settings.js";
 import { gradeCompliance } from "../comply.js";
-import { fetchDev, landDir, pushToDev } from "../land.js";
+import { fetchDev, landDir, pushToDev, sleep } from "../land.js";
 import { CommandError, DEV, EXIT, git, isSharedBranch, parseJson, repoRoot, runGh, runGit, statusLocation, statusRelPath, } from "../lib.js";
-import { minPushOutside, minPushPathspecs } from "../ci/ci.js";
 import { anchorBkitStatus, pushBranch, readAnchor, restoreBranchRows, stampAnchor, } from "./branches.js";
 import { AUTO_LABEL, AUTO_ROUTE_SUFFIX, buildComment, issueParts, parseComments, sortOldestFirst, trackerState, transitionLabels, } from "./issues.js";
-import { EXIT_EMPTY, activeRecord, appendRunCommits, commitBookkeeping, ownPathCommit, ownSet, removeRecord, appendLedgerRows, runRows, unionLedgers, writeParkedCommits, } from "./ledgers.js";
+import { EXIT_EMPTY, UNION_PATHSPECS, activeRecord, changedOutside, appendRunCommits, commitBookkeeping, ownPathCommit, ownSet, removeRecord, appendLedgerRows, runRows, unionLedgers, writeParkedCommits, } from "./ledgers.js";
 import { readIssueTracker } from "./fids.js";
 import { agentContextBlock, buildBlock, chatFingerprint, ciList, claudeTranscripts, hostChat, planBlock, planFiles, runChats, runLines, runStatusRows, stepsBlock, timeBlock, } from "./run-facts.js";
 import { buildSummary, refOf, SUMMARY_WORKFLOWS } from "./summary.js";
@@ -731,7 +730,8 @@ async function landFailedRecord(ctx, o) {
                 ? async (dir, stderr) => {
                     refusal = stderr;
                     ctx.log(`dev refused the ${o.workflow} FAILED push — publishing it through a PR: ${stderr}`);
-                    pr = closePr(ctx, dir, {
+                    pr = await closePr(ctx, dir, {
+                        fid: o.fid,
                         title: `chore(${o.fid}): ${o.workflow} FAILED`,
                         branch: `ship-failed/${o.fid}`,
                         subject: `chore(${o.fid}): ${o.workflow} FAILED bkit [skip ci]`,
@@ -1332,8 +1332,8 @@ export function closeWorkflow(cwd, o, log) {
  * push fast-forwards, and an open PR for the branch is reused. Returns where
  * it landed and the pushed commit, or why it did not.
  */
-function closePr(ctx, dir, o) {
-    const { branch, title, subject } = o;
+async function closePr(ctx, dir, o) {
+    const { branch, title, subject, fid } = o;
     // An empty answer is no branch; a failed read is not.
     const tipRead = runGit(dir, ["ls-remote", "origin", `refs/heads/${branch}`]);
     if (!tipRead.ok)
@@ -1345,12 +1345,25 @@ function closePr(ctx, dir, o) {
         const mergeBase = git(dir, ["merge-base", "HEAD", tip]);
         if (mergeBase === null)
             return { failed: `${branch} at ${tip} shares no history with ${DEV}` };
-        const diff = minPushOutside(dir, mergeBase, tip, minPushPathspecs(readBkitConfig(dir)));
+        // Only what a record holds: the run's log folder and the ledger globs.
+        const diff = changedOutside(dir, mergeBase, tip, [
+            `docs/plans/*/logs/${fid}/*`,
+            ...UNION_PATHSPECS,
+        ]);
         if (!diff.ok)
             return { failed: `cannot diff origin's ${branch} at ${tip}: ${diff.stderr}` };
         if (diff.outside.length > 0)
             return {
-                failed: `origin's ${branch} at ${tip} changes files outside the min-push paths, so it is not merged: ${diff.outside.join(", ")}`,
+                failed: `origin's ${branch} at ${tip} changes files outside the record's paths, so it is not merged: ${diff.outside.join(", ")}`,
+            };
+        const special = (git(dir, ["diff", "--raw", "--no-renames", "--diff-filter=AMT", mergeBase, tip]) ?? "")
+            .split("\n")
+            .map((l) => /^:\d+ (\d+) \S+ \S+ \S+\t(.*)$/.exec(l))
+            .filter((m) => m !== null && (m[1] === "120000" || m[1] === "160000"))
+            .map((m) => m[2]);
+        if (special.length > 0)
+            return {
+                failed: `origin's ${branch} at ${tip} adds or changes entries that are not regular files, so it is not merged: ${special.join(", ")}`,
             };
         const merged = runGit(dir, ["merge", "--no-ff", "--no-commit", "-X", "ours", tip]);
         if (!merged.ok) {
@@ -1358,7 +1371,7 @@ function closePr(ctx, dir, o) {
             return { failed: `merge of origin's ${branch} at ${tip} stopped: ${merged.stderr}` };
         }
         restoreBranchRows(dir, tip);
-        const made = runGit(dir, ["commit", "--no-edit"]);
+        const made = runGit(dir, ["commit", "-m", subject]);
         if (!made.ok) {
             runGit(dir, ["merge", "--abort"]);
             return { failed: `merge commit of origin's ${branch} at ${tip} failed: ${made.stderr}` };
@@ -1369,7 +1382,8 @@ function closePr(ctx, dir, o) {
         return { failed: `close branch push failed for ${branch}` };
     // Only a branch an earlier attempt left can already have a PR.
     const open = tip === null ? null : probePr(dir, { head: branch, base: DEV, state: "open" });
-    if (open?.kind !== "ok" || open.pr?.number === undefined) {
+    const reused = open?.kind === "ok" && open.pr?.number !== undefined && open.pr.headRefName === branch;
+    if (!reused) {
         const created = runGh(dir, [
             "pr",
             "create",
@@ -1387,12 +1401,19 @@ function closePr(ctx, dir, o) {
                 failed: `gh pr create failed for ${branch}, which holds the record: ${created.stderr}`,
             };
     }
-    const pr = open?.kind === "ok" && open.pr?.number !== undefined
-        ? open
-        : probePr(dir, { head: branch, base: DEV, state: "open" });
+    const pr = reused ? open : probePr(dir, { head: branch, base: DEV, state: "open" });
     const number = pr.kind === "ok" ? pr.pr?.number : undefined;
     if (number === undefined)
         return { failed: `close PR not found for ${branch}` };
+    if (reused) {
+        // GitHub moves a PR's head to a push a moment later; merge only once it has.
+        for (let i = 0; i < 20; i++) {
+            const seen = probePr(dir, { number: String(number), state: "open" });
+            if (seen.kind === "ok" && seen.pr?.headRefOid === head)
+                break;
+            await sleep(500);
+        }
+    }
     const merged = mergePr(dir, { number: String(number), subject, matchHead: head, deleteBranch: true }, ctx.log);
     if (!merged.out.merged)
         ctx.log(`close PR #${number} (${branch}) opened but not merged — merge it by hand`);
@@ -1435,7 +1456,8 @@ async function shipClose(ctx, o, token) {
             },
             refused: async (dir, stderr) => {
                 ctx.log(`dev refused the close push — publishing it through a PR: ${stderr}`);
-                viaPr = closePr(ctx, dir, {
+                viaPr = await closePr(ctx, dir, {
+                    fid: o.fid,
                     title: `docs(${o.fid}): ship DONE`,
                     branch: `ship-close/${o.fid}`,
                     subject,
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 2d15d84e5..6f028e38b 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -585,3 +585,5 @@
 {"schema":3,"ts":1795105872016,"firstTs":1795096336122,"updates":2,"kind":"deferral","key":"985-install-settings-merge-challenge-low-bkit-core-engine-install-write-ts-516","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"utility","step":"manual"},"references":["985-install-settings-merge","8359be639","https://github.com/cbartens/bkit/issues/985"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"`bkit upgrade` and `bkit upgrade --dry-run` take back a permission entry while printing only `upgrade (merge): .claude/settings.json`, so the person gets no record of which grant or rule changed","description":"Closed by 8359be639: bkit upgrade prints one line per removed entry naming the file, the list and the exact value, and a dry run says it would remove it.","source":".bkit/core/engine/install/write.ts:516","status":"CLOSED"}
 {"schema":3,"ts":1795115603053,"firstTs":1794972501434,"updates":2,"kind":"deferral","key":"811-publish-dev-refused-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-1509","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-tasks"},"references":["811-publish-dev-refused","1042"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"When `gh pr create` fails after the branch push, the flush says the record is only in the book, though origin already holds it on a `ship-failed/{FID}` branch that no line names","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/workflows.ts:1509: When `gh pr create` fails after the branch push, the flush says the record is only in the book, though origin already holds it on a `ship-failed/{FID}` branch that no line names. Done when: A `gh pr create` failure after a successful branch push names the pushed `ship-failed/{FID}` branch in its failure reason, so the exit-10 log says the record is on that branch with no PR.","source":".bkit/core/engine/commands/workflow/workflows.ts:1509","status":"CLOSED"}
 {"schema":3,"ts":1795115603054,"firstTs":1794972501435,"updates":2,"kind":"deferral","key":"811-publish-dev-refused-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-830","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-tasks"},"references":["811-publish-dev-refused","1042"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A flush whose `ship-failed/{FID}` PR opened but did not merge links the tracker comment at that branch, and the link dies once the owner merges the PR and GitHub deletes the head branch","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/workflows.ts:830: A flush whose `ship-failed/{FID}` PR opened but did not merge links the tracker comment at that branch, and the link dies once the owner merges the PR and GitHub deletes the head branch. Done when: A flush whose PR opened but did not merge posts a handover link that still opens after the owner merges that PR and GitHub deletes `ship-failed/{FID}`: the link targets `dev`, as in the merged case.","source":".bkit/core/engine/commands/workflow/workflows.ts:830","status":"CLOSED"}
+{"schema":3,"ts":1795120147116,"firstTs":1795120147116,"updates":1,"kind":"deferral","key":"1042-ship-s-pr-challenge-low-bkit-core-engine-commands-workflow-branches-ts-2947","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1042-ship-s-pr"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A failed `git add` in `restoreBranchRows` is ignored, so `closePr` commits the merge without the leftover tip's put-back ledger rows and still exits 0 with `pushed: true`","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/branches.ts:2947: A failed `git add` in `restoreBranchRows` is ignored, so `closePr` commits the merge without the leftover tip's put-back ledger rows and still exits 0 with `pushed: true`. Done when: `restoreBranchRows` reports a `git add` that fails (a returned list of unstaged ledgers, or a throw naming the ledger), and `closePr` aborts the merge and returns `{ failed }` naming the branch, the tip and the ledger, so the plan's success criterion \"every ledger row the leftover tip held is still on the branch\" never ends silently false.","source":".bkit/core/engine/commands/workflow/branches.ts:2947","status":"OPEN"}
+{"schema":3,"ts":1795120147117,"firstTs":1795120147117,"updates":1,"kind":"deferral","key":"1042-ship-s-pr-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-1692","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1042-ship-s-pr"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"Anyone who can push a branch named `x/refs/heads/ship-failed/{FID}` makes `git ls-remote origin refs/heads/ship-failed/{FID}` answer with that look-alike's tip, because `ls-remote` treats the ref as a tail-matched glob; the flush then reads the wrong tip and fails with \"cannot fetch origin's ship-failed/{FID}\", or merges the look-alike's commit","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/workflows.ts:1692: Anyone who can push a branch named `x/refs/heads/ship-failed/{FID}` makes `git ls-remote origin refs/heads/ship-failed/{FID}` answer with that look-alike's tip, because `ls-remote` treats the ref as a tail-matched glob; the flush then reads the wrong tip and fails with \"cannot fetch origin's ship-failed/{FID}\", or merges the look-alike's commit. Done when: `closePr` takes the tip only from the `ls-remote` line whose ref column is exactly `refs/heads/{branch}`, and treats no such line as no branch. Verified in this challenge with a bare remote that held only `refs/heads/a/refs/heads/ship-failed/12-export-csv`: `git ls-remote origin refs/heads/ship-failed/12-export-csv` printed that ref's SHA with exit 0. `docs/security.md` § Input validation says the CLI validates its inputs.","source":".bkit/core/engine/commands/workflow/workflows.ts:1692","status":"OPEN"}
