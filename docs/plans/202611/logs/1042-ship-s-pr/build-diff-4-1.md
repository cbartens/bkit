diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 4b1e00178..ac3f608a4 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -3026,6 +3026,77 @@ describe("bkit workflows handover", () => {
     expect(gh.calls().some((c) => c.startsWith("pr create"))).toBe(false);
   });
 
+  it("--flush refused by dev does not merge a leftover tip that adds files below a deeper logs folder", async () => {
+    let tip = "";
+    const deeper = `docs/plans/x/y/logs/${FID}`;
+    const { remote, wt } = refusedAfter((rm) => {
+      tip = leftBranch(rm, `ship-failed/${FID}`, {
+        ...earlier,
+        [`${deeper}/.prettierrc.mjs`]: "export default {};\n",
+        [`${deeper}/a.md`]: "# a\n",
+      });
+    });
+    write(wt, `${REL}/status.jsonl`, newRecordRow());
+    const gh = ghStub(`ship-failed/${FID}`, "dev", { openAfterCreate: true });
+    const r = await withGhOnPath(gh.bin, () => flush(wt));
+    expect(r.code).toBe(10);
+    expect(r.err).toContain(`ship-failed/${FID}`);
+    expect(r.err).toContain(`${deeper}/.prettierrc.mjs`);
+    expect(git(remote, "rev-parse", `ship-failed/${FID}`)).toBe(tip);
+  });
+
+  it("--flush refused by dev does not merge a leftover tip that adds a non-log file to the run's log folder", async () => {
+    let tip = "";
+    const { remote, wt } = refusedAfter((rm) => {
+      tip = leftBranch(rm, `ship-failed/${FID}`, {
+        ...earlier,
+        [`${REL}/.prettierrc.mjs`]: "export default {};\n",
+        [`${REL}/sub/x.test.ts`]: "export {};\n",
+      });
+    });
+    write(wt, `${REL}/status.jsonl`, newRecordRow());
+    const gh = ghStub(`ship-failed/${FID}`, "dev", { openAfterCreate: true });
+    const r = await withGhOnPath(gh.bin, () => flush(wt));
+    expect(r.code).toBe(10);
+    expect(r.err).toContain(`ship-failed/${FID}`);
+    expect(r.err).toContain(`${REL}/.prettierrc.mjs`);
+    expect(r.err).toContain(`${REL}/sub/x.test.ts`);
+    expect(git(remote, "rev-parse", `ship-failed/${FID}`)).toBe(tip);
+  });
+
+  it("--flush refused by dev does not merge a leftover tip that deletes ledger rows", async () => {
+    let tip = "";
+    const { remote, wt } = refusedAfter((rm) => {
+      const clone = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-workflows-del-")));
+      dirs.push(clone);
+      git(clone, "clone", "-q", rm, ".");
+      git(clone, "config", "user.email", "t@t");
+      git(clone, "config", "user.name", "t");
+      git(clone, "checkout", "-q", "dev");
+      write(clone, "docs/decisions.jsonl", jsonl([{ id: "r1" }, { id: "r2" }]));
+      write(clone, "docs/knowledge.jsonl", jsonl([{ id: "k1" }]));
+      git(clone, "add", "-A");
+      git(clone, "commit", "-qm", "chore: seed ledgers");
+      // The hook is not installed yet, so dev still takes this push.
+      git(clone, "push", "-q", "origin", "dev");
+      git(clone, "checkout", "-q", "-b", `ship-failed/${FID}`);
+      write(clone, "docs/decisions.jsonl", jsonl([{ id: "r2" }]));
+      git(clone, "rm", "-q", "docs/knowledge.jsonl");
+      git(clone, "add", "-A");
+      git(clone, "commit", "-qm", "chore: an earlier attempt's record [skip ci]");
+      git(clone, "push", "-q", "origin", `HEAD:refs/heads/ship-failed/${FID}`);
+      tip = git(clone, "rev-parse", "HEAD");
+    });
+    write(wt, `${REL}/status.jsonl`, newRecordRow());
+    const gh = ghStub(`ship-failed/${FID}`, "dev", { openAfterCreate: true });
+    const r = await withGhOnPath(gh.bin, () => flush(wt));
+    expect(r.code).toBe(10);
+    expect(r.err).toContain(`ship-failed/${FID}`);
+    expect(r.err).toContain("docs/decisions.jsonl");
+    expect(r.err).toContain("docs/knowledge.jsonl");
+    expect(git(remote, "rev-parse", `ship-failed/${FID}`)).toBe(tip);
+  });
+
   describe("route and message: every exit the handover reaches ends the run as a stop", () => {
     const notPushed = (tree: string) =>
       `Record not pushed: the handover commit is only in ${tree}, and the links in this run's comments open once it is pushed`;
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index dfd55503a..2d21e06eb 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -96,7 +96,6 @@ import {
 } from "./issues.js";
 import {
   EXIT_EMPTY,
-  UNION_PATHSPECS,
   activeRecord,
   changedOutside,
   appendRunCommits,
@@ -1721,16 +1720,44 @@ async function closePr(
       return { failed: `cannot fetch origin's ${branch}` };
     const mergeBase = git(dir, ["merge-base", "HEAD", tip]);
     if (mergeBase === null) return { failed: `${branch} at ${tip} shares no history with ${DEV}` };
-    // Only what a record holds: the run's log folder and the ledger globs.
+    // Only what a record writes: `.md` logs directly in the run's log folder (what
+    // `carryLogs` copies) and the ledger globs. `:(glob)` stops `*` at `/`.
     const diff = changedOutside(dir, mergeBase, tip, [
-      `docs/plans/*/logs/${fid}/*`,
-      ...UNION_PATHSPECS,
+      `:(glob)docs/plans/*/logs/${fid}/*.md`,
+      ":(glob)docs/plans/*/logs/*/*.jsonl",
+      ":(glob)docs/*.jsonl",
+      ":(glob).bkit/*.jsonl",
+      ":(exclude).bkit/issues.jsonl",
     ]);
     if (!diff.ok) return { failed: `cannot diff origin's ${branch} at ${tip}: ${diff.stderr}` };
     if (diff.outside.length > 0)
       return {
         failed: `origin's ${branch} at ${tip} changes files outside the record's paths, so it is not merged: ${diff.outside.join(", ")}`,
       };
+    // A record only appends ledger rows and adds or rewrites its own logs.
+    const gone = runGit(dir, [
+      "diff",
+      "--name-only",
+      "--no-renames",
+      "--diff-filter=D",
+      mergeBase,
+      tip,
+    ]);
+    const nums = runGit(dir, ["diff", "--numstat", "--no-renames", mergeBase, tip]);
+    if (!gone.ok || !nums.ok)
+      return { failed: `cannot diff origin's ${branch} at ${tip}: ${gone.stderr || nums.stderr}` };
+    const removed = [
+      ...gone.stdout.split("\n").filter((l) => l !== ""),
+      ...nums.stdout
+        .split("\n")
+        .map((l) => /^\d+\t([1-9]\d*)\t(.*\.jsonl)$/.exec(l))
+        .filter((m): m is RegExpExecArray => m !== null)
+        .map((m) => m[2]!),
+    ];
+    if (removed.length > 0)
+      return {
+        failed: `origin's ${branch} at ${tip} deletes files or ledger rows, so it is not merged: ${[...new Set(removed)].join(", ")}`,
+      };
     const raw = runGit(dir, ["diff", "--raw", "--no-renames", "--diff-filter=AMT", mergeBase, tip]);
     if (!raw.ok) return { failed: `cannot diff origin's ${branch} at ${tip}: ${raw.stderr}` };
     const special = raw.stdout
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index b4895d739..0c717f2b6 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -341,3 +341,5 @@
 {"schema":3,"ts":1795128156767,"kind":"friction","key":"tracker-comment/comment-delivery","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"comment-delivery"},"category":"tool-failure","scope":"bkit-repo","severity":"MEDIUM","summary":"Workflow comment delivery unavailable","description":"build comment reporting encountered an exhausted delivery problem; substantive workflow work continues.","source":"orchestrator","status":"OPEN","remediation":"Inspect tracker availability or local comment state; delivery may start a fresh comment.","recurrenceCount":3,"lastConfirmed":1795128156767}
 {"schema":3,"ts":1795128157158,"kind":"friction","key":"tracker-comment/comment-delivery","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"comment-delivery"},"category":"tool-failure","scope":"bkit-repo","severity":"MEDIUM","summary":"Workflow comment delivery unavailable","description":"build comment reporting encountered an exhausted delivery problem; substantive workflow work continues.","source":"orchestrator","status":"OPEN","remediation":"Inspect tracker availability or local comment state; delivery may start a fresh comment.","recurrenceCount":4,"lastConfirmed":1795128157158}
 {"schema":3,"ts":1795132090650,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":36,"lastConfirmed":1795132090650}
+{"schema":3,"ts":1795135179355,"kind":"friction","key":"tracker-comment/comment-delivery","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"comment-delivery"},"category":"tool-failure","scope":"bkit-repo","severity":"MEDIUM","summary":"Workflow comment delivery unavailable","description":"build comment reporting encountered an exhausted delivery problem; substantive workflow work continues.","source":"orchestrator","status":"OPEN","remediation":"Inspect tracker availability or local comment state; delivery may start a fresh comment.","recurrenceCount":5,"lastConfirmed":1795135179355}
+{"schema":3,"ts":1795136186911,"kind":"friction","key":"tracker-comment/comment-delivery","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"comment-delivery"},"category":"tool-failure","scope":"bkit-repo","severity":"MEDIUM","summary":"Workflow comment delivery unavailable","description":"build comment reporting encountered an exhausted delivery problem; substantive workflow work continues.","source":"orchestrator","status":"OPEN","remediation":"Inspect tracker availability or local comment state; delivery may start a fresh comment.","recurrenceCount":6,"lastConfirmed":1795136186911}
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index f5e393bfd..f4833f27d 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -35,7 +35,7 @@ import { fetchDev, landDir, pushToDev, sleep } from "../land.js";
 import { CommandError, DEV, EXIT, git, isSharedBranch, parseJson, repoRoot, runGh, runGit, statusLocation, statusRelPath, } from "../lib.js";
 import { anchorBkitStatus, pushBranch, readAnchor, restoreBranchRows, stampAnchor, } from "./branches.js";
 import { AUTO_LABEL, AUTO_ROUTE_SUFFIX, buildComment, issueParts, parseComments, sortOldestFirst, trackerState, transitionLabels, } from "./issues.js";
-import { EXIT_EMPTY, UNION_PATHSPECS, activeRecord, changedOutside, appendRunCommits, commitBookkeeping, ownPathCommit, ownSet, removeRecord, appendLedgerRows, runRows, unionLedgers, writeParkedCommits, } from "./ledgers.js";
+import { EXIT_EMPTY, activeRecord, changedOutside, appendRunCommits, commitBookkeeping, ownPathCommit, ownSet, removeRecord, appendLedgerRows, runRows, unionLedgers, writeParkedCommits, } from "./ledgers.js";
 import { readIssueTracker } from "./fids.js";
 import { agentContextBlock, buildBlock, chatFingerprint, ciList, claudeTranscripts, hostChat, planBlock, planFiles, runChats, runLines, runStatusRows, stepsBlock, timeBlock, } from "./run-facts.js";
 import { buildSummary, refOf, SUMMARY_WORKFLOWS } from "./summary.js";
@@ -1368,10 +1368,14 @@ async function closePr(ctx, dir, o) {
         const mergeBase = git(dir, ["merge-base", "HEAD", tip]);
         if (mergeBase === null)
             return { failed: `${branch} at ${tip} shares no history with ${DEV}` };
-        // Only what a record holds: the run's log folder and the ledger globs.
+        // Only what a record writes: `.md` logs directly in the run's log folder (what
+        // `carryLogs` copies) and the ledger globs. `:(glob)` stops `*` at `/`.
         const diff = changedOutside(dir, mergeBase, tip, [
-            `docs/plans/*/logs/${fid}/*`,
-            ...UNION_PATHSPECS,
+            `:(glob)docs/plans/*/logs/${fid}/*.md`,
+            ":(glob)docs/plans/*/logs/*/*.jsonl",
+            ":(glob)docs/*.jsonl",
+            ":(glob).bkit/*.jsonl",
+            ":(exclude).bkit/issues.jsonl",
         ]);
         if (!diff.ok)
             return { failed: `cannot diff origin's ${branch} at ${tip}: ${diff.stderr}` };
@@ -1379,6 +1383,30 @@ async function closePr(ctx, dir, o) {
             return {
                 failed: `origin's ${branch} at ${tip} changes files outside the record's paths, so it is not merged: ${diff.outside.join(", ")}`,
             };
+        // A record only appends ledger rows and adds or rewrites its own logs.
+        const gone = runGit(dir, [
+            "diff",
+            "--name-only",
+            "--no-renames",
+            "--diff-filter=D",
+            mergeBase,
+            tip,
+        ]);
+        const nums = runGit(dir, ["diff", "--numstat", "--no-renames", mergeBase, tip]);
+        if (!gone.ok || !nums.ok)
+            return { failed: `cannot diff origin's ${branch} at ${tip}: ${gone.stderr || nums.stderr}` };
+        const removed = [
+            ...gone.stdout.split("\n").filter((l) => l !== ""),
+            ...nums.stdout
+                .split("\n")
+                .map((l) => /^\d+\t([1-9]\d*)\t(.*\.jsonl)$/.exec(l))
+                .filter((m) => m !== null)
+                .map((m) => m[2]),
+        ];
+        if (removed.length > 0)
+            return {
+                failed: `origin's ${branch} at ${tip} deletes files or ledger rows, so it is not merged: ${[...new Set(removed)].join(", ")}`,
+            };
         const raw = runGit(dir, ["diff", "--raw", "--no-renames", "--diff-filter=AMT", mergeBase, tip]);
         if (!raw.ok)
             return { failed: `cannot diff origin's ${branch} at ${tip}: ${raw.stderr}` };
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 6f028e38b..5c352776d 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -587,3 +587,6 @@
 {"schema":3,"ts":1795115603054,"firstTs":1794972501435,"updates":2,"kind":"deferral","key":"811-publish-dev-refused-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-830","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-tasks"},"references":["811-publish-dev-refused","1042"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A flush whose `ship-failed/{FID}` PR opened but did not merge links the tracker comment at that branch, and the link dies once the owner merges the PR and GitHub deletes the head branch","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/workflows.ts:830: A flush whose `ship-failed/{FID}` PR opened but did not merge links the tracker comment at that branch, and the link dies once the owner merges the PR and GitHub deletes the head branch. Done when: A flush whose PR opened but did not merge posts a handover link that still opens after the owner merges that PR and GitHub deletes `ship-failed/{FID}`: the link targets `dev`, as in the merged case.","source":".bkit/core/engine/commands/workflow/workflows.ts:830","status":"CLOSED"}
 {"schema":3,"ts":1795120147116,"firstTs":1795120147116,"updates":1,"kind":"deferral","key":"1042-ship-s-pr-challenge-low-bkit-core-engine-commands-workflow-branches-ts-2947","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1042-ship-s-pr"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A failed `git add` in `restoreBranchRows` is ignored, so `closePr` commits the merge without the leftover tip's put-back ledger rows and still exits 0 with `pushed: true`","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/branches.ts:2947: A failed `git add` in `restoreBranchRows` is ignored, so `closePr` commits the merge without the leftover tip's put-back ledger rows and still exits 0 with `pushed: true`. Done when: `restoreBranchRows` reports a `git add` that fails (a returned list of unstaged ledgers, or a throw naming the ledger), and `closePr` aborts the merge and returns `{ failed }` naming the branch, the tip and the ledger, so the plan's success criterion \"every ledger row the leftover tip held is still on the branch\" never ends silently false.","source":".bkit/core/engine/commands/workflow/branches.ts:2947","status":"OPEN"}
 {"schema":3,"ts":1795120147117,"firstTs":1795120147117,"updates":1,"kind":"deferral","key":"1042-ship-s-pr-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-1692","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1042-ship-s-pr"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"Anyone who can push a branch named `x/refs/heads/ship-failed/{FID}` makes `git ls-remote origin refs/heads/ship-failed/{FID}` answer with that look-alike's tip, because `ls-remote` treats the ref as a tail-matched glob; the flush then reads the wrong tip and fails with \"cannot fetch origin's ship-failed/{FID}\", or merges the look-alike's commit","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/workflows.ts:1692: Anyone who can push a branch named `x/refs/heads/ship-failed/{FID}` makes `git ls-remote origin refs/heads/ship-failed/{FID}` answer with that look-alike's tip, because `ls-remote` treats the ref as a tail-matched glob; the flush then reads the wrong tip and fails with \"cannot fetch origin's ship-failed/{FID}\", or merges the look-alike's commit. Done when: `closePr` takes the tip only from the `ls-remote` line whose ref column is exactly `refs/heads/{branch}`, and treats no such line as no branch. Verified in this challenge with a bare remote that held only `refs/heads/a/refs/heads/ship-failed/12-export-csv`: `git ls-remote origin refs/heads/ship-failed/12-export-csv` printed that ref's SHA with exit 0. `docs/security.md` § Input validation says the CLI validates its inputs.","source":".bkit/core/engine/commands/workflow/workflows.ts:1692","status":"OPEN"}
+{"schema":3,"ts":1795134985798,"firstTs":1795134985798,"updates":1,"kind":"deferral","key":"1042-ship-s-pr-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-1696","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1042-ship-s-pr"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A `bkit:gate:min` that rewrites a file of the merged leftover tip and exits 0 lets `closePr` push the unrewritten merge commit, where `checkLanding` stops the same landing with \"landing gate changed the checkout\"","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/workflows.ts:1696: A `bkit:gate:min` that rewrites a file of the merged leftover tip and exits 0 lets `closePr` push the unrewritten merge commit, where `checkLanding` stops the same landing with \"landing gate changed the checkout\". Done when: `gateMerged` reads HEAD and `git status --porcelain --untracked-files=all --ignore-submodules=none` before the gate and compares both after it, as `unchanged()` in `checkLanding` (`.bkit/core/engine/commands/land.ts:189`) does. A gate that moves HEAD or leaves the tree changed returns a reason that names the branch and says the landing gate changed the checkout, nothing is pushed, and the exit code is 10 for the flush and 11 for the close. `gateMerged` passes `ctx.log` to `runPushGate` instead of `() => {}`, so the gate's own lines reach the exit log. Today `runWithReceipt` (`.bkit/core/engine/commands/ci/push-gate.ts:128`) returns a `bkit:gate:min` status without looking at the checkout, and for the deepest full gate it returns the gate's 0 when the checkout changed and only logs \"full gate passed, but the checkout changed\", a line `gateMerged` drops. `.bkit/core/.bkit/workflows.md:126` (§ One landing routine for every dev write) says \"Missing gates, failed checks and a changed landing tree stop the push\", and the diff's new `docs/security.md` paragraph says the local landing gate is the only check a `[skip ci]` landing gets.","source":".bkit/core/engine/commands/workflow/workflows.ts:1696","status":"OPEN"}
+{"schema":3,"ts":1795134985801,"firstTs":1795134985801,"updates":1,"kind":"deferral","key":"1042-ship-s-pr-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-1745","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1042-ship-s-pr"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A squash-merged `ship-failed/{FID}` or `ship-close/{FID}` branch left on origin is merged into the next record, and the merge puts back the `.bkit/friction.jsonl` rows that harvest drained from `dev` after that squash, so the new PR lands the drained rows on `dev` again","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/workflows.ts:1745: A squash-merged `ship-failed/{FID}` or `ship-close/{FID}` branch left on origin is merged into the next record, and the merge puts back the `.bkit/friction.jsonl` rows that harvest drained from `dev` after that squash, so the new PR lands the drained rows on `dev` again. Done when: When the leftover tip's own PR is already MERGED (`probePr` with `state: \"all\"` finds a MERGED PR whose `headRefName` is the branch and whose `headRefOid` is the tip), `closePr` records the tip with `git merge -s ours` (the record's tree is kept exactly, and the push still fast-forwards) instead of `-X ours` plus `restoreBranchRows`, so the PR carries only the new record. Any other leftover tip is merged as today. The plan's Edge Cases row \"Leftover branch whose PR was squash-merged\" says \"Its changes are already on dev, so the PR adds only the new record\", and the `.bkit/shared/.gitattributes` header says `.bkit/friction.jsonl` \"is the one ledger rows are REMOVED from (bkit's harvest drains it). Union would resurrect rows a drain deleted\". The resurrection needs no conflict: the record's side has no net change to the file between the merge base and `dev`, so the 3-way merge applies the tip's added row. Verified in this challenge with a scratch repo (base row `a`; the tip adds `x`; `dev` gets the squash adding `x`, then a commit draining `x`, then the record): `git merge --no-ff --no-commit -X ours {tip}` exited 0 and left `{\"key\":\"x\"}` in `.bkit/friction.jsonl`.","source":".bkit/core/engine/commands/workflow/workflows.ts:1745","status":"OPEN"}
+{"schema":3,"ts":1795134985802,"firstTs":1795134985802,"updates":1,"kind":"deferral","key":"1042-ship-s-pr-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-1689","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1042-ship-s-pr"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"`gateMerged` compares the merge with `origin/dev` as it reads after the refused push, so when another landing in the same clone has fetched a newer `dev` meanwhile, the record looks like it reverts that newer `dev` code: the flush runs the full push gate, or stops with \"has no declared landing gate\" when none is declared","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/workflows.ts:1689: `gateMerged` compares the merge with `origin/dev` as it reads after the refused push, so when another landing in the same clone has fetched a newer `dev` meanwhile, the record looks like it reverts that newer `dev` code: the flush runs the full push gate, or stops with \"has no declared landing gate\" when none is declared. Done when: `gateMerged` classifies the merge against the base the record was built on, `git merge-base HEAD origin/dev` (the commit `pushToDev` checked out at `worktree add`), as `checkLanding` does with the fixed `base` it receives from `.bkit/core/engine/commands/land.ts:243`. An `origin/dev` that a parallel landing moved to a newer commit then still picks `bkit:gate:min` for a record plus a leftover tip that touch only the record's paths. `refs/remotes/origin/dev` is shared by every worktree of the clone, `fetchDev` rewrites it with `+refs/heads/dev:refs/remotes/origin/dev` (`.bkit/core/.bkit/workflows.md:126`), `pushToDev`'s doc comment names \"another landing in this clone updating `origin/dev`\", and runs of different FIDs hold separate locks (`.bkit/core/.bkit/workflows.md` § Concurrency lock), so they can land at the same time.","source":".bkit/core/engine/commands/workflow/workflows.ts:1689","status":"OPEN"}
