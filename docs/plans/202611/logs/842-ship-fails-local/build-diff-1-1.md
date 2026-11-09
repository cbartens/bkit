diff --git a/.bkit/cli.md b/.bkit/cli.md
index 5494f981d..9aa794e33 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -83,7 +83,7 @@ Sync, push, land and rebase branches; stamp and read a doc's base-commit anchor.

<!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
 | `parse` | workflow | **`--prompt-file`** `--workflow` | Read an explicitly named or existing branch from the session prompt. |
-| `sync` | workflow | `--head` `--merge` `--merge-docs` `--fid` `--file` `--sentinel` | Fetch origin/dev; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ and the ledgers are behind; optionally merge it in. |
+| `sync` | workflow | `--reconcile-feature` `--head` `--merge` `--merge-docs` `--fid` `--file` `--sentinel` | Fetch origin/dev; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ and the ledgers are behind; optionally merge it in. |
 | `regenerate` | workflow | `--fid` `--attempt` `--file` | Run a declared bkit:generate on the feature branch and commit only the paths it changed (ship Step 10's fix round). |
 | `push` | workflow | **`--mode`** `--set-upstream` `--ahead-of` `--commit` `--label` `--file` `--workflow` `--require-ci` `--open-pr` `--fid` | Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise; 81 tests lock held. |
 | `fast-forward` | workflow | **`--onto`** | Fetch a remote branch and fast-forward the checkout onto it; refuse when diverged. |
@@ -253,7 +253,7 @@ Open and probe pull requests, and audit the close transport.

<!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
 | `open` | workflow | **`--fid`** **`--title`** `--issue` `--base` `--head` `--plan` `--note` `--existing` `--file` `--workflow` | Open a PR whose body carries the bkit:issue / bkit:fid marker (exit 80: use MCP). |
-| `probe` | by hand | `--head` `--base` `--state` `--number` | The open (or open-then-merged) PR for a branch, or one PR by number. |
+| `probe` | by hand | `--head` `--base` `--state` `--number` `--ship-entry` `--owner-repo` `--facts-file` | The open (or open-then-merged) PR for a branch, or one PR by number. |
 | `merge` | workflow | **`--number`** `--subject` `--match-head` `--delete-branch` `--label` `--expect-merged` | Squash-merge a PR with an empty body (skipped when already MERGED) and read its state back. |
 | `update-branch` | workflow | **`--number`** `--only-if-required` | Refresh a PR's head from its base server-side (exit 80: use update_pull_request_branch). |
 | `checks` | by hand | **`--number`** | A PR's check rollup, classified: green when present and none failed or pending (exit 80: use MCP). |
@@ -402,6 +402,6 @@ Set up and remove the per-feature worktrees under .worktrees/.

<!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
 | `setup` | workflow | **`--workflow`** **`--fid`** **`--month`** `--worktrees` `--detect` `--branch` `--issue` | Create, resume or adopt the feature's worktree (Step 2 — Worktree Setup). |
-| `remove` | workflow | **`--fid`** `--branch` | Remove .worktrees/{fid} when a workflow created it, prune stale entries, and delete the feature branch. |
+| `remove` | workflow | **`--fid`** `--branch` | Remove a workflow-owned worktree when its work is safely on dev; conditionally delete its local branch and retain the remote branch. |
 
 <!-- cli:end -->
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 030adbeca..d0d3ada18 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -83,7 +83,7 @@ Sync, push, land and rebase branches; stamp and read a doc's base-commit anchor.

<!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
 | `parse` | workflow | **`--prompt-file`** `--workflow` | Read an explicitly named or existing branch from the session prompt. |
-| `sync` | workflow | `--head` `--merge` `--merge-docs` `--fid` `--file` `--sentinel` | Fetch origin/dev; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ and the ledgers are behind; optionally merge it in. |
+| `sync` | workflow | `--reconcile-feature` `--head` `--merge` `--merge-docs` `--fid` `--file` `--sentinel` | Fetch origin/dev; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ and the ledgers are behind; optionally merge it in. |
 | `regenerate` | workflow | `--fid` `--attempt` `--file` | Run a declared bkit:generate on the feature branch and commit only the paths it changed (ship Step 10's fix round). |
 | `push` | workflow | **`--mode`** `--set-upstream` `--ahead-of` `--commit` `--label` `--file` `--workflow` `--require-ci` `--open-pr` `--fid` | Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise; 81 tests lock held. |
 | `fast-forward` | workflow | **`--onto`** | Fetch a remote branch and fast-forward the checkout onto it; refuse when diverged. |
@@ -253,7 +253,7 @@ Open and probe pull requests, and audit the close transport.

<!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
 | `open` | workflow | **`--fid`** **`--title`** `--issue` `--base` `--head` `--plan` `--note` `--existing` `--file` `--workflow` | Open a PR whose body carries the bkit:issue / bkit:fid marker (exit 80: use MCP). |
-| `probe` | by hand | `--head` `--base` `--state` `--number` | The open (or open-then-merged) PR for a branch, or one PR by number. |
+| `probe` | by hand | `--head` `--base` `--state` `--number` `--ship-entry` `--owner-repo` `--facts-file` | The open (or open-then-merged) PR for a branch, or one PR by number. |
 | `merge` | workflow | **`--number`** `--subject` `--match-head` `--delete-branch` `--label` `--expect-merged` | Squash-merge a PR with an empty body (skipped when already MERGED) and read its state back. |
 | `update-branch` | workflow | **`--number`** `--only-if-required` | Refresh a PR's head from its base server-side (exit 80: use update_pull_request_branch). |
 | `checks` | by hand | **`--number`** | A PR's check rollup, classified: green when present and none failed or pending (exit 80: use MCP). |
@@ -402,6 +402,6 @@ Set up and remove the per-feature worktrees under .worktrees/.

<!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
 | `setup` | workflow | **`--workflow`** **`--fid`** **`--month`** `--worktrees` `--detect` `--branch` `--issue` | Create, resume or adopt the feature's worktree (Step 2 — Worktree Setup). |
-| `remove` | workflow | **`--fid`** `--branch` | Remove .worktrees/{fid} when a workflow created it, prune stale entries, and delete the feature branch. |
+| `remove` | workflow | **`--fid`** `--branch` | Remove a workflow-owned worktree when its work is safely on dev; conditionally delete its local branch and retain the remote branch. |
 
 <!-- cli:end -->
diff --git a/.bkit/core/engine/commands/workflow/branches.ts b/.bkit/core/engine/commands/workflow/branches.ts
index ba015bff3..e59291b9a 100644
--- a/.bkit/core/engine/commands/workflow/branches.ts
+++ b/.bkit/core/engine/commands/workflow/branches.ts
@@ -72,8 +72,10 @@ import { readRuns, readStatusRows, readStatusRowsAt } from "./status.js";
 import { declaredName, testSource } from "./test-blocks.js";
 import {
   addAllButCopied,
+  assertShipEligible,
   copyExcludes,
   hasLeftovers,
+  notOnDev,
   recordRebase,
   removeWorktree,
   worktreeDir,
@@ -2336,7 +2338,12 @@ function recordMerge(statusFile: string, before: string | null, after: string |
   });
 }
 
-function reconcileFeature(ctx: RunContext, top: string, branch: string): number {
+function reconcileFeature(
+  ctx: RunContext,
+  top: string,
+  branch: string,
+  observed: { remoteHead: string | null },
+): number {
   if (branch === "" || isSharedBranch(branch)) {
     throw new CommandError(EXIT.USAGE, "feature reconciliation needs a checked-out feature branch");
   }
@@ -2357,7 +2364,19 @@ function reconcileFeature(ctx: RunContext, top: string, branch: string): number
       ctx.log(`git fetch ${remote} failed: ${fetched?.stderr ?? "unknown remote ref"}`);
       return EXIT_FETCH_FAILED;
     }
+    observed.remoteHead = git(top, [
+      "rev-parse",
+      "--verify",
+      "--quiet",
+      `refs/remotes/${remote}^{commit}`,
+    ]);
+    if (observed.remoteHead === null) {
+      ctx.log(`cannot read the freshly fetched feature ${remote}`);
+      return EXIT_FETCH_FAILED;
+    }
   }
+  assertShipEligible(top, "HEAD");
+  if (probe.ok) assertShipEligible(top, remote);
   const headFlag = str(ctx.flags.head);
   if (
     headFlag !== undefined &&
@@ -2380,7 +2399,7 @@ function reconcileFeature(ctx: RunContext, top: string, branch: string): number
     const file = str(ctx.flags.file);
     if (m.merged && file !== undefined) recordMerge(path.resolve(ctx.cwd, file), m.before, after);
     if (m.code !== EXIT.OK) {
-      ctx.emit({ branch, head: after, ...m, target });
+      ctx.emit({ branch, head: after, remoteHead: observed.remoteHead, ...m, target });
     }
     return m.code;
   };
@@ -2424,6 +2443,7 @@ function reconcileFeature(ctx: RunContext, top: string, branch: string): number
       if (code !== EXIT.OK) return code;
     }
   }
+  assertShipEligible(top, "HEAD");
   const unpublished = !probe.ok || commitsAhead(top, remote) > 0;
   if (unpublished && SKIP_CI_TOKEN.test(git(top, ["log", "-1", "--format=%B"]) ?? "")) {
     const trigger = quietGit(top, [
@@ -2468,8 +2488,9 @@ function syncVerb(ctx: RunContext): number {
     return EXIT_FETCH_FAILED;
   }
   const branch = currentBranch(top);
+  const observed = { remoteHead: null as string | null };
   if (reconcile) {
-    const code = reconcileFeature(ctx, top, branch);
+    const code = reconcileFeature(ctx, top, branch, observed);
     if (code !== EXIT.OK) return code;
   }
   const head = git(top, [
@@ -2497,6 +2518,7 @@ function syncVerb(ctx: RunContext): number {
   const out = {
     branch: branch === "" ? null : branch,
     head,
+    ...(reconcile ? { remoteHead: observed.remoteHead, reconciledHead: head } : {}),
     basePath: ancestor.status === 0 ? "A" : "B",
     behind,
     docsBehind,
@@ -3013,32 +3035,6 @@ function fastForwardDev(
   return "fast-forwarded";
 }
 
-/**
- * What `branch` changed that origin/dev does not hold, compared file by file
- * against the branch's fork point: a file whose dev copy differs from the
- * branch's, or (a `.jsonl` ledger, union-merged) a line the branch added that
- * dev's copy lacks. `docs/roadmap.md` is re-rendered on every close, so it is
- * not compared. The branch and its worktree are deleted only when this is empty.
- */
-function notOnDev(root: string, branch: string): string[] {
-  const base = git(root, ["merge-base", UPSTREAM, branch]);
-  if (base === null) return [`${branch}: no common history with ${UPSTREAM}`];
-  const lines = (rev: string, p: string) => revLines(root, rev, p);
-  return (git(root, ["diff", "--name-only", "--no-renames", "--diff-filter=d", base, branch]) ?? "")
-    .split("\n")
-    .filter((p) => p !== "" && p !== "docs/roadmap.md")
-    .filter((p) => {
-      if (!p.endsWith(".jsonl"))
-        return (
-          git(root, ["rev-parse", `${branch}:${p}`]) !==
-          git(root, ["rev-parse", "-q", "--verify", `${UPSTREAM}:${p}`])
-        );
-      const before = new Set(lines(base, p));
-      const onDev = new Set(lines(UPSTREAM, p));
-      return lines(branch, p).some((l) => !before.has(l) && !onDev.has(l));
-    });
-}
-
 /**
  * Those of `paths` whose content at `spec(p)` is already local `dev`'s: work the
  * branch carries because `dev` is unpushed, not work a run in this branch made.
@@ -3396,6 +3392,10 @@ export const branchesCommand: CommandSpec = {
       output: {
         branch: "current branch (null when detached)",
         head: "commit compared (after a merge: the new HEAD)",
+        remoteHead:
+          "--reconcile-feature: the freshly observed remote feature commit, or null when absent",
+        reconciledHead:
+          "--reconcile-feature: the resulting local feature commit used for base classification",
         basePath: `A when ${UPSTREAM} is an ancestor of head (nothing to integrate), else B`,
         behind: `commits on ${UPSTREAM} not in head`,
         docsBehind: `of those, commits touching docs/ or a ledger path (LEDGERS)`,
diff --git a/.bkit/core/engine/commands/workflow/prs.ts b/.bkit/core/engine/commands/workflow/prs.ts
index a786821c8..ce07e53a3 100644
--- a/.bkit/core/engine/commands/workflow/prs.ts
+++ b/.bkit/core/engine/commands/workflow/prs.ts
@@ -100,8 +100,48 @@ export function probePr(
     number?: string;
     /** Honour `--repo`: resolve the PR in this owner/repo, not the checkout's remote. */
     repo?: string;
+    shipEntry?: boolean;
+    facts?: unknown;
   },
 ): Probe {
+  const qualify = (pr: PrInfo | undefined): Probe =>
+    opts.shipEntry === true && pr?.state === "MERGED"
+      ? qualifyMergedEntry(cwd, pr, opts.head, opts.base)
+      : { kind: "ok", pr };
+  if (opts.facts !== undefined) {
+    const facts = opts.facts;
+    if (
+      opts.shipEntry !== true ||
+      opts.repo === undefined ||
+      opts.head === undefined ||
+      opts.base === undefined ||
+      typeof facts !== "object" ||
+      facts === null ||
+      !("ownerRepo" in facts) ||
+      facts.ownerRepo !== opts.repo ||
+      !("headRefName" in facts) ||
+      facts.headRefName !== opts.head ||
+      !("baseRefName" in facts) ||
+      facts.baseRefName !== opts.base ||
+      !("pr" in facts)
+    )
+      return {
+        kind: "failed",
+        message: "ship PR facts require matching ownerRepo, headRefName and baseRefName scope",
+      };
+    if (facts.pr === null) return qualify(undefined);
+    if (
+      !validPrFacts(facts.pr) ||
+      prRepoSlug(facts.pr.url) !== opts.repo ||
+      facts.pr.headRefName !== opts.head ||
+      facts.pr.baseRefName !== opts.base
+    )
+      return {
+        kind: "failed",
+        message: "ship PR facts have an unreadable or mismatched PR identity, head or base scope",
+      };
+    return qualify(facts.pr);
+  }
   if (opts.number !== undefined) {
     const args = ["pr", "view", opts.number, "--json", `${PR_FIELDS},mergeable`];
     if (opts.repo !== undefined) args.push("--repo", opts.repo);
@@ -109,7 +149,7 @@ export function probePr(
     if (!res.ok) return ghFailure(res, `gh pr view ${opts.number}`);
     const parsed = parseJson(res.stdout);
     if (!parsed.ok) return { kind: "failed", message: "gh pr view printed no JSON" };
-    return { kind: "ok", pr: parsed.value as PrInfo };
+    return qualify(parsed.value as PrInfo);
   }
   const args = ["pr", "list", "--head", opts.head!, "--state", opts.state, "--json", PR_FIELDS];
   if (opts.base !== undefined) args.push("--base", opts.base);
@@ -125,7 +165,86 @@ export function probePr(
     opts.state === "open"
       ? prs[0]
       : (prs.find((p) => p.state === "OPEN") ?? prs.find((p) => p.state === "MERGED"));
-  return { kind: "ok", pr };
+  return qualify(pr);
+}
+
+function validPrFacts(value: unknown): value is PrInfo {
+  if (typeof value !== "object" || value === null) return false;
+  return (
+    "number" in value &&
+    typeof value.number === "number" &&
+    Number.isSafeInteger(value.number) &&
+    value.number > 0 &&
+    "url" in value &&
+    typeof value.url === "string" &&
+    "state" in value &&
+    typeof value.state === "string" &&
+    ["OPEN", "MERGED", "CLOSED"].includes(value.state) &&
+    "baseRefName" in value &&
+    typeof value.baseRefName === "string" &&
+    "headRefName" in value &&
+    typeof value.headRefName === "string" &&
+    "headRefOid" in value &&
+    typeof value.headRefOid === "string" &&
+    /^[0-9a-f]{40,64}$/i.test(value.headRefOid) &&
+    "title" in value &&
+    typeof value.title === "string" &&
+    "mergeCommit" in value &&
+    (value.mergeCommit === null ||
+      (typeof value.mergeCommit === "object" &&
+        "oid" in value.mergeCommit &&
+        typeof value.mergeCommit.oid === "string"))
+  );
+}
+
+function qualifyMergedEntry(cwd: string, pr: PrInfo, head?: string, base?: string): Probe {
+  if (
+    !head ||
+    pr.headRefName !== head ||
+    pr.baseRefName !== (base ?? DEV) ||
+    !/^[0-9a-f]{40,64}$/i.test(pr.headRefOid)
+  )
+    return {
+      kind: "failed",
+      message: "merged ship entry has unreadable or mismatched feature head/base evidence",
+    };
+  const local = git(cwd, ["rev-parse", "--verify", "--quiet", `refs/heads/${head}^{commit}`]);
+  if (local === null)
+    return { kind: "failed", message: `cannot read local feature evidence for ${head}` };
+  const remote = runGit(cwd, ["ls-remote", "--heads", "origin", `refs/heads/${head}`]);
+  if (!remote.ok)
+    return {
+      kind: "failed",
+      message: `cannot read remote feature evidence for ${head}: ${remote.stderr}`,
+    };
+  let remoteHead: string | null = null;
+  if (remote.stdout.trim() !== "") {
+    const fetched = runGit(cwd, [
+      "fetch",
+      "origin",
+      `+refs/heads/${head}:refs/remotes/origin/${head}`,
+    ]);
+    if (!fetched.ok)
+      return {
+        kind: "failed",
+        message: `cannot fetch feature evidence for ${head}: ${fetched.stderr}`,
+      };
+    remoteHead = git(cwd, [
+      "rev-parse",
+      "--verify",
+      "--quiet",
+      `refs/remotes/origin/${head}^{commit}`,
+    ]);
+    if (remoteHead === null)
+      return { kind: "failed", message: `cannot read fetched feature evidence for ${head}` };
+  }
+  return {
+    kind: "ok",
+    pr:
+      local === pr.headRefOid && (remoteHead === null || remoteHead === pr.headRefOid)
+        ? pr
+        : undefined,
+  };
 }
 
 export function prOutput(pr: PrInfo | undefined) {
@@ -964,6 +1083,21 @@ export const prsCommand: CommandSpec = {
         { name: "base", type: "string", help: "only PRs into this base (default: any base)" },
         { name: "state", type: "string", help: "open (default) | all: OPEN wins, then MERGED" },
         { name: "number", type: "string", help: "read this PR instead of listing by --head" },
+        {
+          name: "ship-entry",
+          type: "boolean",
+          help: "qualify a merged PR against fresh local and remote feature tips before resuming ship",
+        },
+        {
+          name: "owner-repo",
+          type: "string",
+          help: "owner/repo scope for ship entry and MCP facts",
+        },
+        {
+          name: "facts-file",
+          type: "string",
+          help: "ship entry: scoped MCP JSON {ownerRepo, headRefName, baseRefName, pr}, used without gh",
+        },
       ],
       output: PR_OUTPUT_KEYS,
       exitCodes: { 4: "gh errored — the probe could not answer" },
@@ -976,6 +1110,13 @@ export const prsCommand: CommandSpec = {
         if (number !== undefined && !/^[1-9][0-9]*$/.test(number)) {
           throw new CommandError(EXIT.USAGE, "--number must be a PR number");
         }
+        const factsFile = str(ctx.flags.factsFile);
+        const facts =
+          factsFile === undefined
+            ? undefined
+            : parseJson(fs.readFileSync(path.resolve(ctx.cwd, factsFile), "utf-8"));
+        if (facts !== undefined && !facts.ok)
+          throw new CommandError(EXIT.USAGE, "ship PR facts file is not valid JSON");
         const res = probePr(ctx.cwd, {
           number,
           state,
@@ -986,6 +1127,9 @@ export const prsCommand: CommandSpec = {
                 ? currentBranch(ctx.cwd)
                 : refFlag(ctx.flags.head, "head"),
           base: ctx.flags.base === undefined ? undefined : refFlag(ctx.flags.base, "base"),
+          repo: str(ctx.flags.ownerRepo),
+          shipEntry: ctx.flags.shipEntry === true,
+          facts: facts?.ok === true ? facts.value : undefined,
         });
         if (res.kind !== "ok") {
           ctx.log(res.message);
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index 513d10391..27de3a7c9 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -1567,7 +1567,7 @@ async function shipClose(
         `fetch of dev after the close PR failed — origin/${DEV} is stale until the next fetch`,
       );
     try {
-      worktree = removeWorktree(root, o.fid, o.branch, ctx.log);
+      worktree = removeWorktree(root, o.fid, o.branch, ctx.log, { landed: true });
     } catch (err) {
       ctx.log(`${(err as Error).message} — remove ${book} by hand`);
     }
diff --git a/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts b/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
index 8a5900f7d..7ea004504 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
@@ -1031,15 +1031,15 @@ describe("bkit worktrees setup — ship", () => {
 });
 
 describe("bkit worktrees remove", () => {
-  it("removes a worktree setup created, uncommitted changes and all, and clears the marker", async () => {
+  it("preserves a worktree setup created when it holds uncommitted changes", async () => {
     const f = fixture();
     await setup(f.repo, "design", "--worktrees");
     fs.writeFileSync(path.join(wtOf(f), "dirty.txt"), "x\n");
     const r = await run(f.repo, ["remove", `--fid=${FID}`]);
-    expect(r.json).toMatchObject({ removed: true, reason: null, repoRoot: f.repo });
-    expect(fs.existsSync(wtOf(f))).toBe(false);
-    expect(fs.existsSync(marker(f))).toBe(false);
-    expect(git(f.repo, "worktree", "list")).not.toContain(".worktrees");
+    expect(r.json).toMatchObject({ removed: false, reason: "uncommitted", repoRoot: f.repo });
+    expect(fs.readFileSync(path.join(wtOf(f), "dirty.txt"), "utf-8")).toBe("x\n");
+    expect(fs.existsSync(marker(f))).toBe(true);
+    expect(git(f.repo, "worktree", "list")).toContain(".worktrees");
     expect(git(f.repo, "branch", "--list", `feat/${FID}`)).toContain(`feat/${FID}`);
   });
 });
diff --git a/.bkit/core/engine/commands/workflow/worktrees.test.ts b/.bkit/core/engine/commands/workflow/worktrees.test.ts
index 0b5915cd1..cb707ee94 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.test.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -716,23 +716,26 @@ describe("bkit worktrees remove", () => {
     expect(fs.existsSync(wt)).toBe(true);
   });
 
-  it("removes a marked worktree with uncommitted changes and clears the marker", async () => {
+  it("preserves a marked worktree with uncommitted changes and its marker", async () => {
     const cwd = repo();
+    fs.writeFileSync(path.join(cwd, "dirty.txt"), "base\n");
+    git(cwd, "add", "dirty.txt");
+    git(cwd, "commit", "-qm", "tracked cleanup fixture");
     const wt = linked(cwd, FID, true);
     fs.writeFileSync(path.join(wt, "dirty.txt"), "x\n");
     const r = await remove(cwd);
     expect(r.json).toEqual({
-      removed: true,
-      reason: null,
+      removed: false,
+      reason: "uncommitted",
       worktreePath: wt,
       repoRoot: cwd,
       branchDeleted: null,
       remoteDeleted: null,
       branchBlockedBy: null,
     });
-    expect(fs.existsSync(wt)).toBe(false);
-    expect(fs.existsSync(ownershipMarker(cwd, FID))).toBe(false);
-    expect(git(cwd, "worktree", "list")).not.toContain(".worktrees");
+    expect(fs.readFileSync(path.join(wt, "dirty.txt"), "utf-8")).toBe("x\n");
+    expect(fs.existsSync(ownershipMarker(cwd, FID))).toBe(true);
+    expect(git(cwd, "worktree", "list")).toContain(".worktrees");
     expect(git(cwd, "branch", "--list", `feat/${FID}`)).toContain(`feat/${FID}`);
   });
 
@@ -774,9 +777,10 @@ describe("bkit worktrees remove", () => {
     const remoteHas = (origin: string) =>
       git(origin, "branch", "--list", `feat/${FID}`).includes(`feat/${FID}`);
 
-    it("deletes the local and remote branch once the marked worktree is gone", async () => {
+    it("deletes the proved local branch and retains the remote branch conditionally", async () => {
       const cwd = repo();
       const origin = withOrigin(cwd);
+      git(cwd, "push", "-q", "origin", "dev");
       linked(cwd, FID, true);
       git(cwd, "push", "-q", "origin", `feat/${FID}`);
       expect(remoteHas(origin)).toBe(true);
@@ -785,11 +789,12 @@ describe("bkit worktrees remove", () => {
       expect(r.json).toMatchObject({
         removed: true,
         branchDeleted: true,
-        remoteDeleted: true,
+        remoteDeleted: false,
         branchBlockedBy: null,
       });
       expect(git(cwd, "branch", "--list", `feat/${FID}`)).toBe("");
-      expect(remoteHas(origin)).toBe(false);
+      expect(remoteHas(origin)).toBe(true);
+      expect(r.err).toContain("conditional deletion is unavailable");
     });
 
     it("an unmarked worktree holding the branch blocks BOTH deletes and is named", async () => {
@@ -826,12 +831,12 @@ describe("bkit worktrees remove", () => {
       expect(remoteHas(origin)).toBe(true);
     });
 
-    it("a branch already gone everywhere is reported deleted", async () => {
+    it("a branch already gone is reported as unavailable without claiming deletion", async () => {
       const cwd = repo();
       withOrigin(cwd);
       const r = await remove(cwd, `--branch=feat/${FID}`);
       expect(r.json).toMatchObject({
-        branchDeleted: true,
+        branchDeleted: false,
         remoteDeleted: false,
         branchBlockedBy: null,
       });
diff --git a/.bkit/core/engine/commands/workflow/worktrees.ts b/.bkit/core/engine/commands/workflow/worktrees.ts
index 32dd35771..3df879d82 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.ts
@@ -228,15 +228,42 @@ export function worktreeBase(cwd: string, workflow: string, log?: (m: string) =>
  * may bring docs and ledgers only, so such a branch can never land.
  */
 function inheritedDevCommits(root: string, branch: string): string[] {
+  if (!hasLocal(root, DEV)) return [];
+  const read = (args: string[]) => {
+    const result = runGit(root, args);
+    if (!result.ok)
+      throw new CommandError(
+        EXIT_REFUSED,
+        `cannot inspect unpublished ${DEV} work for ${branch}: ${result.stderr}`,
+      );
+    return result.stdout.trim();
+  };
   const unpushed = new Set(
-    (git(root, ["rev-list", `${ORIGIN_DEV}..${DEV}`]) ?? "").split("\n").filter(Boolean),
+    read(["rev-list", `${ORIGIN_DEV}..${DEV}`])
+      .split("\n")
+      .filter(Boolean),
   );
   if (unpushed.size === 0) return [];
-  return (git(root, ["rev-list", branch, "--not", ORIGIN_DEV]) ?? "")
+  return read(["rev-list", branch, "--not", ORIGIN_DEV])
     .split("\n")
     .filter((c) => unpushed.has(c));
 }
 
+/** Refuse a publication candidate that imports unpublished local dev ancestry. */
+export function assertShipEligible(root: string, candidate: string): void {
+  if (git(root, ["rev-parse", "--verify", "--quiet", `${candidate}^{commit}`]) === null)
+    throw new CommandError(EXIT_REFUSED, `cannot inspect ship candidate ${candidate}`);
+  const inherited = inheritedDevCommits(root, candidate);
+  if (inherited.length === 0) return;
+  const commits = inherited
+    .map((sha) => git(root, ["show", "-s", "--format=%h %s", sha]) ?? sha)
+    .join("; ");
+  throw new CommandError(
+    EXIT_REFUSED,
+    `${candidate} carries unpublished ${DEV} work: ${commits}. Publish ${DEV} separately (git push origin ${DEV}), then re-run ship; these commits must not be squashed into the feature.`,
+  );
+}
+
 /** Why a docs-only branch carrying unpushed `dev` cannot land, and what unblocks it. */
 function inheritedDevRefusal(
   root: string,
@@ -639,9 +666,133 @@ function install(wt: string, log: (m: string) => void): number {
 // Branch cleanup
 // ---------------------------------------------------------------------------
 
+/** Preserve NUL-delimited paths and the status columns that runGit trims. */
+function cleanupRead(root: string, args: string[]): ReturnType<typeof runGit> {
+  const result = spawnSync("git", args, {
+    cwd: root,
+    encoding: "utf-8",
+    env: gitEnv(),
+    maxBuffer: 1 << 26,
+  });
+  return {
+    ok: !result.error && result.status === 0,
+    stdout: result.stdout ?? "",
+    stderr: result.error?.message ?? result.stderr ?? "",
+  };
+}
+
+function treeEntry(root: string, rev: string, file: string): string | null {
+  const result = cleanupRead(root, ["ls-tree", "-z", rev, "--", file]);
+  if (!result.ok) throw new Error(`cannot inspect ${rev}:${file}: ${result.stderr}`);
+  return result.stdout === "" ? null : result.stdout.slice(0, result.stdout.indexOf("\t"));
+}
+
+function committedLines(root: string, rev: string, file: string): string[] {
+  if (treeEntry(root, rev, file) === null) return [];
+  const result = cleanupRead(root, ["show", `${rev}:${file}`]);
+  if (!result.ok) throw new Error(`cannot read ${rev}:${file}: ${result.stderr}`);
+  return result.stdout.split("\n").filter(Boolean);
+}
+
+/** Branch changes absent from dev, including deletions and tree-entry mode/type. */
+export function notOnDev(root: string, branch: string): string[] {
+  const base = git(root, ["merge-base", ORIGIN_DEV, branch]);
+  if (base === null) return [`${branch}: no common history with ${ORIGIN_DEV}`];
+  const changed = cleanupRead(root, ["diff", "--name-only", "-z", "--no-renames", base, branch]);
+  if (!changed.ok) return [`cannot inspect ${branch}: ${changed.stderr}`];
+  try {
+    return changed.stdout
+      .split("\0")
+      .filter((file) => file !== "" && file !== "docs/roadmap.md")
+      .filter((file) => {
+        const feature = treeEntry(root, branch, file);
+        const dev = treeEntry(root, ORIGIN_DEV, file);
+        if (feature === dev) return false;
+        if (
+          feature === null ||
+          dev === null ||
+          !file.endsWith(".jsonl") ||
+          !/^100(?:644|755) blob /.test(feature) ||
+          feature.split(" ").slice(0, 2).join(" ") !== dev.split(" ").slice(0, 2).join(" ")
+        )
+          return true;
+        const before = new Set(committedLines(root, base, file));
+        const onDev = new Set(committedLines(root, ORIGIN_DEV, file));
+        return committedLines(root, branch, file).some(
+          (line) => !before.has(line) && !onDev.has(line),
+        );
+      });
+  } catch (error) {
+    return [(error as Error).message];
+  }
+}
+
+/** Uncommitted files whose current contents are not already safely on dev. */
+function dirtyWork(root: string, wt: string, landed: boolean): string[] {
+  const status = cleanupRead(wt, [
+    "status",
+    "--porcelain=v1",
+    "-z",
+    "--untracked-files=all",
+    "--",
+    ".",
+    ...copyExcludes(wt),
+  ]);
+  if (!status.ok) return [`cannot inspect dirty work: ${status.stderr}`];
+  const entries = status.stdout.split("\0").filter(Boolean);
+  const paths: string[] = [];
+  for (let i = 0; i < entries.length; i++) {
+    const row = entries[i]!;
+    paths.push(row.slice(3));
+    if (/[RC]/.test(row.slice(0, 2))) paths.push(entries[++i]!);
+  }
+  if (!landed) return paths;
+  return paths.filter((file) => {
+    try {
+      const entry = treeEntry(root, ORIGIN_DEV, file);
+      const full = path.join(wt, file);
+      const stat = fs.lstatSync(full, { throwIfNoEntry: false });
+      if (stat === undefined) return entry !== null;
+      if (entry === null || (!stat.isFile() && !stat.isSymbolicLink())) return true;
+      const mode = stat.isSymbolicLink()
+        ? "120000"
+        : (stat.mode & 0o111) !== 0
+          ? "100755"
+          : "100644";
+      if (!entry.startsWith(`${mode} blob `)) return true;
+      const bytes = stat.isSymbolicLink()
+        ? Buffer.from(fs.readlinkSync(full))
+        : fs.readFileSync(full);
+      const hash = spawnSync("git", ["hash-object", "--stdin"], {
+        cwd: root,
+        input: bytes,
+        encoding: "utf-8",
+        env: gitEnv(),
+      });
+      if (hash.status !== 0) return true;
+      if (entry.endsWith(` ${hash.stdout.trim()}`)) return false;
+      if (!file.endsWith(".jsonl")) return true;
+      const onDev = new Set(committedLines(root, ORIGIN_DEV, file));
+      return bytes
+        .toString("utf-8")
+        .split("\n")
+        .filter(Boolean)
+        .some((line) => !onDev.has(line));
+    } catch {
+      return true;
+    }
+  });
+}
+
 /** The worktree (main checkout included) with `branch` checked out, else null. */
 export function worktreeHolding(root: string, branch: string): string | null {
-  const list = git(root, ["worktree", "list", "--porcelain"]) ?? "";
+  const result = cleanupRead(root, ["worktree", "list", "--porcelain"]);
+  if (!result.ok)
+    throw new CommandError(
+      EXIT_REMOVE,
+      `cannot inspect worktrees holding ${branch}: ${result.stderr}`,
+    );
+  const list = result.stdout;
   let current: string | null = null;
   for (const line of list.split("\n")) {
     if (line.startsWith("worktree ")) current = line.slice("worktree ".length);
@@ -651,14 +802,14 @@ export function worktreeHolding(root: string, branch: string): string | null {
 }
 
 /**
- * Delete `branch` locally and on origin. A worktree still holding it blocks
- * both deletes: the local one would fail, and the remote one would strand that
- * worktree's branch without its upstream.
+ * Delete the proved local tip atomically. A worktree still holding it blocks
+ * deletion; the remote branch is retained because its deletion cannot be conditional.
  */
 function deleteBranch(
   root: string,
   branch: string,
   log: (m: string) => void,
+  expected: string,
 ): { branchDeleted: boolean; remoteDeleted: boolean; branchBlockedBy: string | null } {
   const holder = worktreeHolding(root, branch);
   if (holder !== null) {
@@ -667,17 +818,15 @@ function deleteBranch(
     );
     return { branchDeleted: false, remoteDeleted: false, branchBlockedBy: holder };
   }
-  if (hasLocal(root, branch)) {
-    const del = runGit(root, ["branch", "-D", branch]);
-    if (!del.ok) log(`git branch -D ${branch} failed: ${del.stderr}`);
-  }
-  const remote = runGit(root, ["push", "origin", "--delete", branch]);
-  if (!remote.ok) log(`git push origin --delete ${branch} failed or it was already gone`);
-  runGit(root, ["fetch", "--prune", "origin"]);
+  const del = runGit(root, ["update-ref", "-d", `refs/heads/${branch}`, expected]);
+  if (!del.ok) log(`local ${branch} changed after its cleanup proof — preserved: ${del.stderr}`);
+  log(
+    `remote origin/${branch} retained: conditional deletion is unavailable under the no-force-push policy`,
+  );
   return {
-    branchDeleted: !hasLocal(root, branch),
-    remoteDeleted: remote.ok,
-    branchBlockedBy: null,
+    branchDeleted: del.ok,
+    remoteDeleted: false,
+    branchBlockedBy: del.ok ? null : "changed-after-proof",
   };
 }
 
@@ -693,14 +842,16 @@ export interface RemoveResult {
 
 /**
  * Remove `.worktrees/{fid}` when a workflow created it (the ownership marker),
- * prune stale entries, then delete `branch` locally and on origin unless another
- * worktree holds it. Throws EXIT_REMOVE when `git worktree remove` fails.
+ * preserve unlanded or dirty work, then delete the proved local branch tip unless
+ * another worktree holds it. Remote branches are retained. Throws EXIT_REMOVE
+ * when `git worktree remove` fails.
  */
 export function removeWorktree(
   cwd: string,
   fid: string,
   branch: string | undefined,
   log: (m: string) => void,
+  options: { landed?: boolean } = {},
 ): RemoveResult {
   if (branch !== undefined && isSharedBranch(branch)) {
     throw new CommandError(EXIT.USAGE, `refusing to delete branch ${branch}`);
@@ -708,33 +859,87 @@ export function removeWorktree(
   const root = repoRoot(cwd);
   const wt = worktreeDir(root, fid);
   const marker = ownershipMarker(root, fid);
-  const result = (removed: boolean, reason: string | null): RemoveResult => {
-    const cleanup = branch === undefined ? null : deleteBranch(root, branch, log);
+  let expected: string | null = null;
+  const result = (removed: boolean, reason: string | null, removeBranch = false): RemoveResult => {
+    const cleanup =
+      branch === undefined || !removeBranch || expected === null
+        ? null
+        : deleteBranch(root, branch, log, expected);
     return {
       removed,
       reason,
       worktreePath: wt,
       repoRoot: root,
-      branchDeleted: cleanup?.branchDeleted ?? null,
-      remoteDeleted: cleanup?.remoteDeleted ?? null,
-      branchBlockedBy: cleanup?.branchBlockedBy ?? null,
+      branchDeleted: cleanup?.branchDeleted ?? (branch === undefined ? null : false),
+      remoteDeleted: cleanup?.remoteDeleted ?? (branch === undefined ? null : false),
+      branchBlockedBy:
+        cleanup?.branchBlockedBy ?? (branch === undefined ? null : worktreeHolding(root, branch)),
     };
   };
-  if (!fs.existsSync(wt)) {
-    runGit(root, ["worktree", "prune"]);
-    return result(false, "absent");
-  }
-  if (!fs.existsSync(marker)) {
+  if (fs.existsSync(wt) && !fs.existsSync(marker)) {
     log(`${wt} exists but has no ownership marker (${marker}) — not ours, left in place`);
+    if (branch !== undefined)
+      log(
+        `${branch} is checked out in ${worktreeHolding(root, branch) ?? wt} — local and remote branch left in place`,
+      );
     return result(false, "not-owned");
   }
+  if (branch !== undefined) {
+    const holder = worktreeHolding(root, branch);
+    if (holder !== null && real(holder) !== real(wt)) {
+      log(`${branch} is checked out in ${holder} — local and remote branch left in place`);
+      return result(false, fs.existsSync(wt) ? "held-elsewhere" : "absent");
+    }
+    try {
+      fetchBranch(root, DEV);
+      expected = git(root, ["rev-parse", "--verify", "--quiet", `refs/heads/${branch}^{commit}`]);
+      if (expected === null) {
+        log(`cannot read local ${branch}; cleanup evidence unavailable — preserved`);
+        return result(false, "unavailable");
+      }
+      const missing = notOnDev(root, expected);
+      if (missing.length > 0) {
+        log(`${branch} carries work ${ORIGIN_DEV} does not — preserved: ${missing.join(", ")}`);
+        return result(false, "not-landed");
+      }
+      const remote = remoteHas(root, branch);
+      if (remote === "error") {
+        log(`cannot read remote origin/${branch}; cleanup evidence unavailable — preserved`);
+        return result(false, "unavailable");
+      }
+      if (remote === "yes") {
+        fetchBranch(root, branch);
+        const remoteMissing = notOnDev(root, `refs/remotes/origin/${branch}`);
+        if (remoteMissing.length > 0) {
+          log(
+            `remote origin/${branch} holds unlanded work — local worktree and remote branch preserved: ${remoteMissing.join(", ")}`,
+          );
+          return result(false, "remote-not-landed");
+        }
+      }
+    } catch (error) {
+      log(`cleanup evidence unavailable — preserved: ${(error as Error).message}`);
+      return result(false, "unavailable");
+    }
+  }
+  if (fs.existsSync(wt)) {
+    const dirty = dirtyWork(root, wt, options.landed === true);
+    if (dirty.length > 0) {
+      log(`${wt} holds uncommitted work — preserved: ${dirty.join(", ")}`);
+      return result(false, "uncommitted");
+    }
+  }
+  if (!fs.existsSync(wt)) {
+    runGit(root, ["worktree", "prune"]);
+    return result(false, "absent", true);
+  }
   const inside = !path.relative(real(wt), real(cwd)).startsWith("..");
   const res = runGit(root, ["worktree", "remove", "--force", wt]);
   if (!res.ok) throw new CommandError(EXIT_REMOVE, `git worktree remove failed: ${res.stderr}`);
   runGit(root, ["worktree", "prune"]);
   fs.rmSync(marker, { force: true });
   if (inside) log(`the working directory was inside ${wt} — cd to ${root}`);
-  return result(true, null);
+  return result(true, null, true);
 }
 
 // ---------------------------------------------------------------------------
@@ -875,6 +1080,20 @@ export const worktreesCommand: CommandSpec = {
               : `refusing to ship ${target} as a feature branch`,
           );
         }
+        if (workflow === "ship" && git(root, ["remote", "get-url", "origin"]) !== null) {
+          fetchBranch(root, DEV);
+          const remote = remoteHas(root, target);
+          if (remote === "error")
+            throw new CommandError(
+              EXIT_FETCH,
+              `cannot fetch origin ${target}: remote branch evidence unavailable`,
+            );
+          if (remote === "yes") {
+            fetchBranch(root, target);
+            assertShipEligible(root, `refs/remotes/origin/${target}`);
+          }
+          if (hasLocal(root, target)) assertShipEligible(root, `refs/heads/${target}`);
+        }
         if (
           workflow === "debug" &&
           named &&
@@ -944,7 +1163,12 @@ export const worktreesCommand: CommandSpec = {
             );
           }
           if (workflow === "ship" && git(root, ["branch", "--show-current"]) !== target) {
-            const sw = runGit(root, ["switch", target]);
+            const sw = runGit(
+              root,
+              hasLocal(root, target)
+                ? ["switch", target]
+                : ["switch", "--no-track", "-c", target, `refs/remotes/origin/${target}`],
+            );
             if (!sw.ok) {
               if (!hasLocal(root, target) && remoteHas(root, target) !== "yes") {
                 throw new CommandError(
@@ -1115,27 +1339,28 @@ export const worktreesCommand: CommandSpec = {
     },
     remove: {
       summary:
-        "Remove .worktrees/{fid} when a workflow created it, prune stale entries, and delete the feature branch.",
+        "Remove a workflow-owned worktree when its work is safely on dev; conditionally delete its local branch and retain the remote branch.",
       use: "workflow",
       flags: [
         FID_FLAG,
         {
           name: "branch",
           type: "string",
-          help: "feature branch to delete locally and on origin once the worktree is gone; skipped when another worktree still holds it",
+          help: "feature branch to delete locally only at its proved landed tip; preserve unlanded/uncertain work and retain the remote branch",
         },
       ],
       output: {
         removed: "the worktree was removed",
-        reason: "why it was not: absent | not-owned (no .worktree-owned marker); null when removed",
+        reason:
+          "why it was not removed: absent | not-owned | held-elsewhere | uncommitted | not-landed | remote-not-landed | unavailable; null when removed",
         worktreePath: "the worktree's path",
         repoRoot: "the main checkout — cd here if the shell was inside the removed worktree",
         branchDeleted:
-          "--branch: the local branch is gone (deleted or already absent); null without --branch",
+          "--branch: the proved local tip was atomically deleted; false when preserved or unavailable, null without --branch",
         remoteDeleted:
-          "--branch: git push origin --delete succeeded; false when it failed or was already gone; null without --branch",
+          "--branch: false because the remote branch is retained under the no-force-push policy; null without --branch",
         branchBlockedBy:
-          "--branch: the worktree still holding the branch, so neither the local nor the remote branch was deleted; null when none",
+          "--branch: the worktree still holding the branch or changed-after-proof; null when none",
       },
       exitCodes: { [EXIT_REMOVE]: "git worktree remove failed" },
       run: (ctx) => {
diff --git a/.bkit/version b/.bkit/version
index 1e22fdb11..1774a1409 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -18,7 +18,7 @@
     ".gitignore": "7b18419d0469def99a4a9c05f28e734f6258b2e60755c640a041a84b4d60275b",
     "docs/security.md": "ccf6c376c8a347972a335a43232f3d5db49acb9d0c9083f6c52c73de3013cb10",
     ".mcp.json": "65b29f1bb28dd6296d1dc8ea34aca4826d9ca072d7cef9d2971a7045280505d9",
-    "docs/architecture.md": "26fc0be395978a806ebc35fc85d3fb4e26297ebdb58115117efccb38c5b6dccb",
+    "docs/architecture.md": "23081bdef0f4186114d4971404f9ce251fe37567f9cea800095e8f6ec1ad66db",
     "docs/technology.md": "8111c0a3262df6f8eeedb3fbe83559ec8ce23c847a593b98cc83f9e24eca128e",
     ".bkit/.env.example": "817fa9ffb183f34a004f824a5d58416cc7ed1f336218024262dd7ada68c44641",
     ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
@@ -264,7 +264,7 @@
     ".codex/hooks/bkit-rules.cjs": "8aee2cde5448c083ae0dc07a4f1db86ce7e815a2a2eafe54b886b7f4393cab91",
     ".opencode/plugin/bkit-rules.js": "417d3ca107ebf005060953a17340620e1fcfb5bcdf491316a937e0c747b0377e",
     ".bkit/router.md": "c20d006757e350c173da94686d48500bc83e12d9f7bb6ff5911e47e332e45eab",
-    ".bkit/cli.md": "31ff612ce7d455d472add1d5810b6fc50d173fb3e4b4ffe2caeb6eab1b9b5316",
+    ".bkit/cli.md": "fb607fac271507a0ccdc436188f2dfae8f24aa623872892b8ea544bea437079c",
     ".claude/agents/bkit-build-plan-tests.md": "f7b4e6be48b6950d27256c42d5d2c48b20bd23b90d66b0d1f59745a33ad251b5",
     ".cursor/agents/bkit-build-plan-tests.md": "57996d02186862b35c6e22dd150e0b1d19a243f10fddb16002feefd7d42c7838",
     ".opencode/agents/bkit-build-plan-tests.md": "896af5e894b0ae4c9911cc5ee3f54e5426efdf2e4f8ec5c758ed990b82fac6d4",
diff --git a/dist/commands/workflow/branches.js b/dist/commands/workflow/branches.js
index 1ebeb270f..b54bbe08b 100644
--- a/dist/commands/workflow/branches.js
+++ b/dist/commands/workflow/branches.js
@@ -31,7 +31,7 @@ import { appendFeature } from "./roadmap.js";
 import { detect } from "./runtime.js";
 import { readRuns, readStatusRows, readStatusRowsAt } from "./status.js";
 import { declaredName, testSource } from "./test-blocks.js";
-import { addAllButCopied, copyExcludes, hasLeftovers, recordRebase, removeWorktree, worktreeDir, } from "./worktrees.js";
+import { addAllButCopied, assertShipEligible, copyExcludes, hasLeftovers, notOnDev, recordRebase, removeWorktree, worktreeDir, } from "./worktrees.js";
 import { COULD_NOT_RUN_EXIT_CODES, LOCKFILE_REGENERATE, installCommand, scriptCommand, } from "../../shared/package-manager.js";
 import { readPackageJson } from "../../shared/package-json.js";
 import { str } from "./status.js";
@@ -1913,7 +1913,7 @@ function recordMerge(statusFile, before, after) {
         ref: after,
     });
 }
-function reconcileFeature(ctx, top, branch) {
+function reconcileFeature(ctx, top, branch, observed) {
     if (branch === "" || isSharedBranch(branch)) {
         throw new CommandError(EXIT.USAGE, "feature reconciliation needs a checked-out feature branch");
     }
@@ -1934,7 +1934,20 @@ function reconcileFeature(ctx, top, branch) {
             ctx.log(`git fetch ${remote} failed: ${fetched?.stderr ?? "unknown remote ref"}`);
             return EXIT_FETCH_FAILED;
         }
+        observed.remoteHead = git(top, [
+            "rev-parse",
+            "--verify",
+            "--quiet",
+            `refs/remotes/${remote}^{commit}`,
+        ]);
+        if (observed.remoteHead === null) {
+            ctx.log(`cannot read the freshly fetched feature ${remote}`);
+            return EXIT_FETCH_FAILED;
+        }
     }
+    assertShipEligible(top, "HEAD");
+    if (probe.ok)
+        assertShipEligible(top, remote);
     const headFlag = str(ctx.flags.head);
     if (headFlag !== undefined &&
         git(top, ["rev-parse", "--verify", "--quiet", `${headFlag}^{commit}`]) === null) {
@@ -1952,7 +1965,7 @@ function reconcileFeature(ctx, top, branch) {
         if (m.merged && file !== undefined)
             recordMerge(path.resolve(ctx.cwd, file), m.before, after);
         if (m.code !== EXIT.OK) {
-            ctx.emit({ branch, head: after, ...m, target });
+            ctx.emit({ branch, head: after, remoteHead: observed.remoteHead, ...m, target });
         }
         return m.code;
     };
@@ -1995,6 +2008,7 @@ function reconcileFeature(ctx, top, branch) {
                 return code;
         }
     }
+    assertShipEligible(top, "HEAD");
     const unpublished = !probe.ok || commitsAhead(top, remote) > 0;
     if (unpublished && SKIP_CI_TOKEN.test(git(top, ["log", "-1", "--format=%B"]) ?? "")) {
         const trigger = quietGit(top, [
@@ -2033,8 +2047,9 @@ function syncVerb(ctx) {
         return EXIT_FETCH_FAILED;
     }
     const branch = currentBranch(top);
+    const observed = { remoteHead: null };
     if (reconcile) {
-        const code = reconcileFeature(ctx, top, branch);
+        const code = reconcileFeature(ctx, top, branch, observed);
         if (code !== EXIT.OK)
             return code;
     }
@@ -2059,6 +2074,7 @@ function syncVerb(ctx) {
     const out = {
         branch: branch === "" ? null : branch,
         head,
+        ...(reconcile ? { remoteHead: observed.remoteHead, reconciledHead: head } : {}),
         basePath: ancestor.status === 0 ? "A" : "B",
         behind,
         docsBehind,
@@ -2448,30 +2464,6 @@ function fastForwardDev(root, sha, log) {
     }
     return "fast-forwarded";
 }
-/**
- * What `branch` changed that origin/dev does not hold, compared file by file
- * against the branch's fork point: a file whose dev copy differs from the
- * branch's, or (a `.jsonl` ledger, union-merged) a line the branch added that
- * dev's copy lacks. `docs/roadmap.md` is re-rendered on every close, so it is
- * not compared. The branch and its worktree are deleted only when this is empty.
- */
-function notOnDev(root, branch) {
-    const base = git(root, ["merge-base", UPSTREAM, branch]);
-    if (base === null)
-        return [`${branch}: no common history with ${UPSTREAM}`];
-    const lines = (rev, p) => revLines(root, rev, p);
-    return (git(root, ["diff", "--name-only", "--no-renames", "--diff-filter=d", base, branch]) ?? "")
-        .split("\n")
-        .filter((p) => p !== "" && p !== "docs/roadmap.md")
-        .filter((p) => {
-        if (!p.endsWith(".jsonl"))
-            return (git(root, ["rev-parse", `${branch}:${p}`]) !==
-                git(root, ["rev-parse", "-q", "--verify", `${UPSTREAM}:${p}`]));
-        const before = new Set(lines(base, p));
-        const onDev = new Set(lines(UPSTREAM, p));
-        return lines(branch, p).some((l) => !before.has(l) && !onDev.has(l));
-    });
-}
 /**
  * Those of `paths` whose content at `spec(p)` is already local `dev`'s: work the
  * branch carries because `dev` is unpushed, not work a run in this branch made.
@@ -2801,6 +2793,8 @@ export const branchesCommand = {
             output: {
                 branch: "current branch (null when detached)",
                 head: "commit compared (after a merge: the new HEAD)",
+                remoteHead: "--reconcile-feature: the freshly observed remote feature commit, or null when absent",
+                reconciledHead: "--reconcile-feature: the resulting local feature commit used for base classification",
                 basePath: `A when ${UPSTREAM} is an ancestor of head (nothing to integrate), else B`,
                 behind: `commits on ${UPSTREAM} not in head`,
                 docsBehind: `of those, commits touching docs/ or a ledger path (LEDGERS)`,
diff --git a/dist/commands/workflow/prs.js b/dist/commands/workflow/prs.js
index b5bbf6159..3560e2712 100644
--- a/dist/commands/workflow/prs.js
+++ b/dist/commands/workflow/prs.js
@@ -39,6 +39,40 @@ function ghFailure(res, what) {
  * merged PR but must not adopt an abandoned one.
  */
 export function probePr(cwd, opts) {
+    const qualify = (pr) => opts.shipEntry === true && pr?.state === "MERGED"
+        ? qualifyMergedEntry(cwd, pr, opts.head, opts.base)
+        : { kind: "ok", pr };
+    if (opts.facts !== undefined) {
+        const facts = opts.facts;
+        if (opts.shipEntry !== true ||
+            opts.repo === undefined ||
+            opts.head === undefined ||
+            opts.base === undefined ||
+            typeof facts !== "object" ||
+            facts === null ||
+            !("ownerRepo" in facts) ||
+            facts.ownerRepo !== opts.repo ||
+            !("headRefName" in facts) ||
+            facts.headRefName !== opts.head ||
+            !("baseRefName" in facts) ||
+            facts.baseRefName !== opts.base ||
+            !("pr" in facts))
+            return {
+                kind: "failed",
+                message: "ship PR facts require matching ownerRepo, headRefName and baseRefName scope",
+            };
+        if (facts.pr === null)
+            return qualify(undefined);
+        if (!validPrFacts(facts.pr) ||
+            prRepoSlug(facts.pr.url) !== opts.repo ||
+            facts.pr.headRefName !== opts.head ||
+            facts.pr.baseRefName !== opts.base)
+            return {
+                kind: "failed",
+                message: "ship PR facts have an unreadable or mismatched PR identity, head or base scope",
+            };
+        return qualify(facts.pr);
+    }
     if (opts.number !== undefined) {
         const args = ["pr", "view", opts.number, "--json", `${PR_FIELDS},mergeable`];
         if (opts.repo !== undefined)
@@ -49,7 +83,7 @@ export function probePr(cwd, opts) {
         const parsed = parseJson(res.stdout);
         if (!parsed.ok)
             return { kind: "failed", message: "gh pr view printed no JSON" };
-        return { kind: "ok", pr: parsed.value };
+        return qualify(parsed.value);
     }
     const args = ["pr", "list", "--head", opts.head, "--state", opts.state, "--json", PR_FIELDS];
     if (opts.base !== undefined)
@@ -67,7 +101,80 @@ export function probePr(cwd, opts) {
     const pr = opts.state === "open"
         ? prs[0]
         : (prs.find((p) => p.state === "OPEN") ?? prs.find((p) => p.state === "MERGED"));
-    return { kind: "ok", pr };
+    return qualify(pr);
+}
+function validPrFacts(value) {
+    if (typeof value !== "object" || value === null)
+        return false;
+    return ("number" in value &&
+        typeof value.number === "number" &&
+        Number.isSafeInteger(value.number) &&
+        value.number > 0 &&
+        "url" in value &&
+        typeof value.url === "string" &&
+        "state" in value &&
+        typeof value.state === "string" &&
+        ["OPEN", "MERGED", "CLOSED"].includes(value.state) &&
+        "baseRefName" in value &&
+        typeof value.baseRefName === "string" &&
+        "headRefName" in value &&
+        typeof value.headRefName === "string" &&
+        "headRefOid" in value &&
+        typeof value.headRefOid === "string" &&
+        /^[0-9a-f]{40,64}$/i.test(value.headRefOid) &&
+        "title" in value &&
+        typeof value.title === "string" &&
+        "mergeCommit" in value &&
+        (value.mergeCommit === null ||
+            (typeof value.mergeCommit === "object" &&
+                "oid" in value.mergeCommit &&
+                typeof value.mergeCommit.oid === "string")));
+}
+function qualifyMergedEntry(cwd, pr, head, base) {
+    if (!head ||
+        pr.headRefName !== head ||
+        pr.baseRefName !== (base ?? DEV) ||
+        !/^[0-9a-f]{40,64}$/i.test(pr.headRefOid))
+        return {
+            kind: "failed",
+            message: "merged ship entry has unreadable or mismatched feature head/base evidence",
+        };
+    const local = git(cwd, ["rev-parse", "--verify", "--quiet", `refs/heads/${head}^{commit}`]);
+    if (local === null)
+        return { kind: "failed", message: `cannot read local feature evidence for ${head}` };
+    const remote = runGit(cwd, ["ls-remote", "--heads", "origin", `refs/heads/${head}`]);
+    if (!remote.ok)
+        return {
+            kind: "failed",
+            message: `cannot read remote feature evidence for ${head}: ${remote.stderr}`,
+        };
+    let remoteHead = null;
+    if (remote.stdout.trim() !== "") {
+        const fetched = runGit(cwd, [
+            "fetch",
+            "origin",
+            `+refs/heads/${head}:refs/remotes/origin/${head}`,
+        ]);
+        if (!fetched.ok)
+            return {
+                kind: "failed",
+                message: `cannot fetch feature evidence for ${head}: ${fetched.stderr}`,
+            };
+        remoteHead = git(cwd, [
+            "rev-parse",
+            "--verify",
+            "--quiet",
+            `refs/remotes/origin/${head}^{commit}`,
+        ]);
+        if (remoteHead === null)
+            return { kind: "failed", message: `cannot read fetched feature evidence for ${head}` };
+    }
+    return {
+        kind: "ok",
+        pr: local === pr.headRefOid && (remoteHead === null || remoteHead === pr.headRefOid)
+            ? pr
+            : undefined,
+    };
 }
 export function prOutput(pr) {
     return {
@@ -749,6 +856,21 @@ export const prsCommand = {
                 { name: "base", type: "string", help: "only PRs into this base (default: any base)" },
                 { name: "state", type: "string", help: "open (default) | all: OPEN wins, then MERGED" },
                 { name: "number", type: "string", help: "read this PR instead of listing by --head" },
+                {
+                    name: "ship-entry",
+                    type: "boolean",
+                    help: "qualify a merged PR against fresh local and remote feature tips before resuming ship",
+                },
+                {
+                    name: "owner-repo",
+                    type: "string",
+                    help: "owner/repo scope for ship entry and MCP facts",
+                },
+                {
+                    name: "facts-file",
+                    type: "string",
+                    help: "ship entry: scoped MCP JSON {ownerRepo, headRefName, baseRefName, pr}, used without gh",
+                },
             ],
             output: PR_OUTPUT_KEYS,
             exitCodes: { 4: "gh errored — the probe could not answer" },
@@ -761,6 +883,12 @@ export const prsCommand = {
                 if (number !== undefined && !/^[1-9][0-9]*$/.test(number)) {
                     throw new CommandError(EXIT.USAGE, "--number must be a PR number");
                 }
+                const factsFile = str(ctx.flags.factsFile);
+                const facts = factsFile === undefined
+                    ? undefined
+                    : parseJson(fs.readFileSync(path.resolve(ctx.cwd, factsFile), "utf-8"));
+                if (facts !== undefined && !facts.ok)
+                    throw new CommandError(EXIT.USAGE, "ship PR facts file is not valid JSON");
                 const res = probePr(ctx.cwd, {
                     number,
                     state,
@@ -770,6 +898,9 @@ export const prsCommand = {
                             ? currentBranch(ctx.cwd)
                             : refFlag(ctx.flags.head, "head"),
                     base: ctx.flags.base === undefined ? undefined : refFlag(ctx.flags.base, "base"),
+                    repo: str(ctx.flags.ownerRepo),
+                    shipEntry: ctx.flags.shipEntry === true,
+                    facts: facts?.ok === true ? facts.value : undefined,
                 });
                 if (res.kind !== "ok") {
                     ctx.log(res.message);
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index b5a694d46..b7c25b8ce 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -1230,7 +1230,7 @@ async function shipClose(ctx, o, token) {
         if (landed.via === "close-pr" && !fetchDev(root).ok)
             ctx.log(`fetch of dev after the close PR failed — origin/${DEV} is stale until the next fetch`);
         try {
-            worktree = removeWorktree(root, o.fid, o.branch, ctx.log);
+            worktree = removeWorktree(root, o.fid, o.branch, ctx.log, { landed: true });
         }
         catch (err) {
             ctx.log(`${err.message} — remove ${book} by hand`);
diff --git a/dist/commands/workflow/worktrees.js b/dist/commands/workflow/worktrees.js
index 5ea56290e..10d703622 100644
--- a/dist/commands/workflow/worktrees.js
+++ b/dist/commands/workflow/worktrees.js
@@ -183,13 +183,35 @@ export function worktreeBase(cwd, workflow, log) {
  * may bring docs and ledgers only, so such a branch can never land.
  */
 function inheritedDevCommits(root, branch) {
-    const unpushed = new Set((git(root, ["rev-list", `${ORIGIN_DEV}..${DEV}`]) ?? "").split("\n").filter(Boolean));
+    if (!hasLocal(root, DEV))
+        return [];
+    const read = (args) => {
+        const result = runGit(root, args);
+        if (!result.ok)
+            throw new CommandError(EXIT_REFUSED, `cannot inspect unpublished ${DEV} work for ${branch}: ${result.stderr}`);
+        return result.stdout.trim();
+    };
+    const unpushed = new Set(read(["rev-list", `${ORIGIN_DEV}..${DEV}`])
+        .split("\n")
+        .filter(Boolean));
     if (unpushed.size === 0)
         return [];
-    return (git(root, ["rev-list", branch, "--not", ORIGIN_DEV]) ?? "")
+    return read(["rev-list", branch, "--not", ORIGIN_DEV])
         .split("\n")
         .filter((c) => unpushed.has(c));
 }
+/** Refuse a publication candidate that imports unpublished local dev ancestry. */
+export function assertShipEligible(root, candidate) {
+    if (git(root, ["rev-parse", "--verify", "--quiet", `${candidate}^{commit}`]) === null)
+        throw new CommandError(EXIT_REFUSED, `cannot inspect ship candidate ${candidate}`);
+    const inherited = inheritedDevCommits(root, candidate);
+    if (inherited.length === 0)
+        return;
+    const commits = inherited
+        .map((sha) => git(root, ["show", "-s", "--format=%h %s", sha]) ?? sha)
+        .join("; ");
+    throw new CommandError(EXIT_REFUSED, `${candidate} carries unpublished ${DEV} work: ${commits}. Publish ${DEV} separately (git push origin ${DEV}), then re-run ship; these commits must not be squashed into the feature.`);
+}
 /** Why a docs-only branch carrying unpushed `dev` cannot land, and what unblocks it. */
 function inheritedDevRefusal(root, target, workflow, count) {
     const ahead = git(root, ["rev-list", "--count", `${ORIGIN_DEV}..${DEV}`]) ?? "?";
@@ -527,9 +549,138 @@ function install(wt, log) {
 // ---------------------------------------------------------------------------
 // Branch cleanup
 // ---------------------------------------------------------------------------
+/** Preserve NUL-delimited paths and the status columns that runGit trims. */
+function cleanupRead(root, args) {
+    const result = spawnSync("git", args, {
+        cwd: root,
+        encoding: "utf-8",
+        env: gitEnv(),
+        maxBuffer: 1 << 26,
+    });
+    return {
+        ok: !result.error && result.status === 0,
+        stdout: result.stdout ?? "",
+        stderr: result.error?.message ?? result.stderr ?? "",
+    };
+}
+function treeEntry(root, rev, file) {
+    const result = cleanupRead(root, ["ls-tree", "-z", rev, "--", file]);
+    if (!result.ok)
+        throw new Error(`cannot inspect ${rev}:${file}: ${result.stderr}`);
+    return result.stdout === "" ? null : result.stdout.slice(0, result.stdout.indexOf("\t"));
+}
+function committedLines(root, rev, file) {
+    if (treeEntry(root, rev, file) === null)
+        return [];
+    const result = cleanupRead(root, ["show", `${rev}:${file}`]);
+    if (!result.ok)
+        throw new Error(`cannot read ${rev}:${file}: ${result.stderr}`);
+    return result.stdout.split("\n").filter(Boolean);
+}
+/** Branch changes absent from dev, including deletions and tree-entry mode/type. */
+export function notOnDev(root, branch) {
+    const base = git(root, ["merge-base", ORIGIN_DEV, branch]);
+    if (base === null)
+        return [`${branch}: no common history with ${ORIGIN_DEV}`];
+    const changed = cleanupRead(root, ["diff", "--name-only", "-z", "--no-renames", base, branch]);
+    if (!changed.ok)
+        return [`cannot inspect ${branch}: ${changed.stderr}`];
+    try {
+        return changed.stdout
+            .split("\0")
+            .filter((file) => file !== "" && file !== "docs/roadmap.md")
+            .filter((file) => {
+            const feature = treeEntry(root, branch, file);
+            const dev = treeEntry(root, ORIGIN_DEV, file);
+            if (feature === dev)
+                return false;
+            if (feature === null ||
+                dev === null ||
+                !file.endsWith(".jsonl") ||
+                !/^100(?:644|755) blob /.test(feature) ||
+                feature.split(" ").slice(0, 2).join(" ") !== dev.split(" ").slice(0, 2).join(" "))
+                return true;
+            const before = new Set(committedLines(root, base, file));
+            const onDev = new Set(committedLines(root, ORIGIN_DEV, file));
+            return committedLines(root, branch, file).some((line) => !before.has(line) && !onDev.has(line));
+        });
+    }
+    catch (error) {
+        return [error.message];
+    }
+}
+/** Uncommitted files whose current contents are not already safely on dev. */
+function dirtyWork(root, wt, landed) {
+    const status = cleanupRead(wt, [
+        "status",
+        "--porcelain=v1",
+        "-z",
+        "--untracked-files=all",
+        "--",
+        ".",
+        ...copyExcludes(wt),
+    ]);
+    if (!status.ok)
+        return [`cannot inspect dirty work: ${status.stderr}`];
+    const entries = status.stdout.split("\0").filter(Boolean);
+    const paths = [];
+    for (let i = 0; i < entries.length; i++) {
+        const row = entries[i];
+        paths.push(row.slice(3));
+        if (/[RC]/.test(row.slice(0, 2)))
+            paths.push(entries[++i]);
+    }
+    if (!landed)
+        return paths;
+    return paths.filter((file) => {
+        try {
+            const entry = treeEntry(root, ORIGIN_DEV, file);
+            const full = path.join(wt, file);
+            const stat = fs.lstatSync(full, { throwIfNoEntry: false });
+            if (stat === undefined)
+                return entry !== null;
+            if (entry === null || (!stat.isFile() && !stat.isSymbolicLink()))
+                return true;
+            const mode = stat.isSymbolicLink()
+                ? "120000"
+                : (stat.mode & 0o111) !== 0
+                    ? "100755"
+                    : "100644";
+            if (!entry.startsWith(`${mode} blob `))
+                return true;
+            const bytes = stat.isSymbolicLink()
+                ? Buffer.from(fs.readlinkSync(full))
+                : fs.readFileSync(full);
+            const hash = spawnSync("git", ["hash-object", "--stdin"], {
+                cwd: root,
+                input: bytes,
+                encoding: "utf-8",
+                env: gitEnv(),
+            });
+            if (hash.status !== 0)
+                return true;
+            if (entry.endsWith(` ${hash.stdout.trim()}`))
+                return false;
+            if (!file.endsWith(".jsonl"))
+                return true;
+            const onDev = new Set(committedLines(root, ORIGIN_DEV, file));
+            return bytes
+                .toString("utf-8")
+                .split("\n")
+                .filter(Boolean)
+                .some((line) => !onDev.has(line));
+        }
+        catch {
+            return true;
+        }
+    });
+}
 /** The worktree (main checkout included) with `branch` checked out, else null. */
 export function worktreeHolding(root, branch) {
-    const list = git(root, ["worktree", "list", "--porcelain"]) ?? "";
+    const result = cleanupRead(root, ["worktree", "list", "--porcelain"]);
+    if (!result.ok)
+        throw new CommandError(EXIT_REMOVE, `cannot inspect worktrees holding ${branch}: ${result.stderr}`);
+    const list = result.stdout;
     let current = null;
     for (const line of list.split("\n")) {
         if (line.startsWith("worktree "))
@@ -540,63 +691,107 @@ export function worktreeHolding(root, branch) {
     return null;
 }
 /**
- * Delete `branch` locally and on origin. A worktree still holding it blocks
- * both deletes: the local one would fail, and the remote one would strand that
- * worktree's branch without its upstream.
+ * Delete the proved local tip atomically. A worktree still holding it blocks
+ * deletion; the remote branch is retained because its deletion cannot be conditional.
  */
-function deleteBranch(root, branch, log) {
+function deleteBranch(root, branch, log, expected) {
     const holder = worktreeHolding(root, branch);
     if (holder !== null) {
         log(`${branch} is checked out in ${holder} (not a workflow worktree) — local and remote branch left in place`);
         return { branchDeleted: false, remoteDeleted: false, branchBlockedBy: holder };
     }
-    if (hasLocal(root, branch)) {
-        const del = runGit(root, ["branch", "-D", branch]);
-        if (!del.ok)
-            log(`git branch -D ${branch} failed: ${del.stderr}`);
-    }
-    const remote = runGit(root, ["push", "origin", "--delete", branch]);
-    if (!remote.ok)
-        log(`git push origin --delete ${branch} failed or it was already gone`);
-    runGit(root, ["fetch", "--prune", "origin"]);
+    const del = runGit(root, ["update-ref", "-d", `refs/heads/${branch}`, expected]);
+    if (!del.ok)
+        log(`local ${branch} changed after its cleanup proof — preserved: ${del.stderr}`);
+    log(`remote origin/${branch} retained: conditional deletion is unavailable under the no-force-push policy`);
     return {
-        branchDeleted: !hasLocal(root, branch),
-        remoteDeleted: remote.ok,
-        branchBlockedBy: null,
+        branchDeleted: del.ok,
+        remoteDeleted: false,
+        branchBlockedBy: del.ok ? null : "changed-after-proof",
     };
 }
 /**
  * Remove `.worktrees/{fid}` when a workflow created it (the ownership marker),
- * prune stale entries, then delete `branch` locally and on origin unless another
- * worktree holds it. Throws EXIT_REMOVE when `git worktree remove` fails.
+ * preserve unlanded or dirty work, then delete the proved local branch tip unless
+ * another worktree holds it. Remote branches are retained. Throws EXIT_REMOVE
+ * when `git worktree remove` fails.
  */
-export function removeWorktree(cwd, fid, branch, log) {
+export function removeWorktree(cwd, fid, branch, log, options = {}) {
     if (branch !== undefined && isSharedBranch(branch)) {
         throw new CommandError(EXIT.USAGE, `refusing to delete branch ${branch}`);
     }
     const root = repoRoot(cwd);
     const wt = worktreeDir(root, fid);
     const marker = ownershipMarker(root, fid);
-    const result = (removed, reason) => {
-        const cleanup = branch === undefined ? null : deleteBranch(root, branch, log);
+    let expected = null;
+    const result = (removed, reason, removeBranch = false) => {
+        const cleanup = branch === undefined || !removeBranch || expected === null
+            ? null
+            : deleteBranch(root, branch, log, expected);
         return {
             removed,
             reason,
             worktreePath: wt,
             repoRoot: root,
-            branchDeleted: cleanup?.branchDeleted ?? null,
-            remoteDeleted: cleanup?.remoteDeleted ?? null,
-            branchBlockedBy: cleanup?.branchBlockedBy ?? null,
+            branchDeleted: cleanup?.branchDeleted ?? (branch === undefined ? null : false),
+            remoteDeleted: cleanup?.remoteDeleted ?? (branch === undefined ? null : false),
+            branchBlockedBy: cleanup?.branchBlockedBy ?? (branch === undefined ? null : worktreeHolding(root, branch)),
         };
     };
-    if (!fs.existsSync(wt)) {
-        runGit(root, ["worktree", "prune"]);
-        return result(false, "absent");
-    }
-    if (!fs.existsSync(marker)) {
+    if (fs.existsSync(wt) && !fs.existsSync(marker)) {
         log(`${wt} exists but has no ownership marker (${marker}) — not ours, left in place`);
+        if (branch !== undefined)
+            log(`${branch} is checked out in ${worktreeHolding(root, branch) ?? wt} — local and remote branch left in place`);
         return result(false, "not-owned");
     }
+    if (branch !== undefined) {
+        const holder = worktreeHolding(root, branch);
+        if (holder !== null && real(holder) !== real(wt)) {
+            log(`${branch} is checked out in ${holder} — local and remote branch left in place`);
+            return result(false, fs.existsSync(wt) ? "held-elsewhere" : "absent");
+        }
+        try {
+            fetchBranch(root, DEV);
+            expected = git(root, ["rev-parse", "--verify", "--quiet", `refs/heads/${branch}^{commit}`]);
+            if (expected === null) {
+                log(`cannot read local ${branch}; cleanup evidence unavailable — preserved`);
+                return result(false, "unavailable");
+            }
+            const missing = notOnDev(root, expected);
+            if (missing.length > 0) {
+                log(`${branch} carries work ${ORIGIN_DEV} does not — preserved: ${missing.join(", ")}`);
+                return result(false, "not-landed");
+            }
+            const remote = remoteHas(root, branch);
+            if (remote === "error") {
+                log(`cannot read remote origin/${branch}; cleanup evidence unavailable — preserved`);
+                return result(false, "unavailable");
+            }
+            if (remote === "yes") {
+                fetchBranch(root, branch);
+                const remoteMissing = notOnDev(root, `refs/remotes/origin/${branch}`);
+                if (remoteMissing.length > 0) {
+                    log(`remote origin/${branch} holds unlanded work — local worktree and remote branch preserved: ${remoteMissing.join(", ")}`);
+                    return result(false, "remote-not-landed");
+                }
+            }
+        }
+        catch (error) {
+            log(`cleanup evidence unavailable — preserved: ${error.message}`);
+            return result(false, "unavailable");
+        }
+    }
+    if (fs.existsSync(wt)) {
+        const dirty = dirtyWork(root, wt, options.landed === true);
+        if (dirty.length > 0) {
+            log(`${wt} holds uncommitted work — preserved: ${dirty.join(", ")}`);
+            return result(false, "uncommitted");
+        }
+    }
+    if (!fs.existsSync(wt)) {
+        runGit(root, ["worktree", "prune"]);
+        return result(false, "absent", true);
+    }
     const inside = !path.relative(real(wt), real(cwd)).startsWith("..");
     const res = runGit(root, ["worktree", "remove", "--force", wt]);
     if (!res.ok)
@@ -605,7 +800,7 @@ export function removeWorktree(cwd, fid, branch, log) {
     fs.rmSync(marker, { force: true });
     if (inside)
         log(`the working directory was inside ${wt} — cd to ${root}`);
-    return result(true, null);
+    return result(true, null, true);
 }
 // ---------------------------------------------------------------------------
 // Command
@@ -723,6 +918,18 @@ export const worktreesCommand = {
                         ? `refusing to ship ${target}: /bkit-ship ships a feature branch into ${DEV} only; it never opens a PR from ${DEV} into ${MAIN} or merges into ${MAIN}, releases stay manual. Name the feature branch to ship.`
                         : `refusing to ship ${target} as a feature branch`);
                 }
+                if (workflow === "ship" && git(root, ["remote", "get-url", "origin"]) !== null) {
+                    fetchBranch(root, DEV);
+                    const remote = remoteHas(root, target);
+                    if (remote === "error")
+                        throw new CommandError(EXIT_FETCH, `cannot fetch origin ${target}: remote branch evidence unavailable`);
+                    if (remote === "yes") {
+                        fetchBranch(root, target);
+                        assertShipEligible(root, `refs/remotes/origin/${target}`);
+                    }
+                    if (hasLocal(root, target))
+                        assertShipEligible(root, `refs/heads/${target}`);
+                }
                 if (workflow === "debug" &&
                     named &&
                     !hasLocal(root, target) &&
@@ -775,7 +982,9 @@ export const worktreesCommand = {
                         throw new CommandError(EXIT_REFUSED, `adopt mode: checkout does not hold requested ${target}; use its existing checkout or enable worktrees`);
                     }
                     if (workflow === "ship" && git(root, ["branch", "--show-current"]) !== target) {
-                        const sw = runGit(root, ["switch", target]);
+                        const sw = runGit(root, hasLocal(root, target)
+                            ? ["switch", target]
+                            : ["switch", "--no-track", "-c", target, `refs/remotes/origin/${target}`]);
                         if (!sw.ok) {
                             if (!hasLocal(root, target) && remoteHas(root, target) !== "yes") {
                                 throw new CommandError(EXIT_REFUSED, `${target} does not exist — name the feature branch to ship`);
@@ -919,24 +1128,24 @@ export const worktreesCommand = {
             },
         },
         remove: {
-            summary: "Remove .worktrees/{fid} when a workflow created it, prune stale entries, and delete the feature branch.",
+            summary: "Remove a workflow-owned worktree when its work is safely on dev; conditionally delete its local branch and retain the remote branch.",
             use: "workflow",
             flags: [
                 FID_FLAG,
                 {
                     name: "branch",
                     type: "string",
-                    help: "feature branch to delete locally and on origin once the worktree is gone; skipped when another worktree still holds it",
+                    help: "feature branch to delete locally only at its proved landed tip; preserve unlanded/uncertain work and retain the remote branch",
                 },
             ],
             output: {
                 removed: "the worktree was removed",
-                reason: "why it was not: absent | not-owned (no .worktree-owned marker); null when removed",
+                reason: "why it was not removed: absent | not-owned | held-elsewhere | uncommitted | not-landed | remote-not-landed | unavailable; null when removed",
                 worktreePath: "the worktree's path",
                 repoRoot: "the main checkout — cd here if the shell was inside the removed worktree",
-                branchDeleted: "--branch: the local branch is gone (deleted or already absent); null without --branch",
-                remoteDeleted: "--branch: git push origin --delete succeeded; false when it failed or was already gone; null without --branch",
-                branchBlockedBy: "--branch: the worktree still holding the branch, so neither the local nor the remote branch was deleted; null when none",
+                branchDeleted: "--branch: the proved local tip was atomically deleted; false when preserved or unavailable, null without --branch",
+                remoteDeleted: "--branch: false because the remote branch is retained under the no-force-push policy; null without --branch",
+                branchBlockedBy: "--branch: the worktree still holding the branch or changed-after-proof; null when none",
             },
             exitCodes: { [EXIT_REMOVE]: "git worktree remove failed" },
             run: (ctx) => {
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index 00faadcd0..68ff2b87c 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -151,3 +151,4 @@
 {"schema":3,"ts":1793668591094,"firstTs":1793668591094,"updates":1,"kind":"knowledge","key":"vitest-cli-filters-live-on-runner-filename-pattern","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["vitest.test-lock.ts","docs/testing.md"],"summary":"Read actual Vitest CLI filters when deciding whether a raw run needs the tests lock","description":"Vitest 5 stores CLI file filters on vitest.filenamePattern before global setup. Its resolved config does not carry config.filters. Reading config.filters alone treats an explicit existing-file run as an unfiltered heavy run and waits unnecessarily.","rootCause":"CLI run selection and the resolved test configuration are separate runner state.","remediation":"Preserve an explicit config.filters input and fall back to vitest.filenamePattern. Verify the real bkit:test:file command completes while another worktree holds the raw-run lock.","status":"ACTIVE"}
 {"schema":3,"ts":1793677148479,"firstTs":1793677148479,"updates":1,"kind":"knowledge","key":"machine-lock-wrapper-cancellation-keeps-foreground-owner-alive","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":[".bkit/templates/scripts/ci/bkit-machine-lock.sh",".bkit/core/engine/audits/templates/machine-lock.integration.test.ts"],"summary":"A lock wrapper must remain alive until its foreground gate stops","rootCause":"The Perl holder follows the wrapper owner. Terminating only that wrapper releases the lock while its foreground gate can continue running.","remediation":"Defer TERM, INT and HUP cancellation until the foreground command completes naturally; retain the lock owner until then and return the signal status after release. Verify a competing run stays excluded and preserve ordinary command statuses and inherited-owner reuse.","status":"ACTIVE"}
 {"schema":3,"ts":1793677148482,"firstTs":1793677148482,"updates":1,"kind":"knowledge","key":"workflow-push-retry-keeps-close-effects-and-original-return-once","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":[".bkit/core/workflows/bkit-build.md",".bkit/core/engine/audits/workflows/local-gate-audit.test.ts"],"summary":"Keep workflow close effects outside a retryable push block","rootCause":"Retrying a fence that closes the workflow before pushing repeats append-only status and publishing effects. Close also removes its session, so a repeated close can lose the original final-return issue facts.","remediation":"Close once, retain commentFile, tracker and finalReturn immediately, retry only the push on exit 81, and release the workflow lock after push success.","status":"ACTIVE"}
+{"schema":3,"ts":1793868900526,"firstTs":1793868900526,"updates":1,"kind":"knowledge","key":"git-status-cleanup-reads-must-preserve-raw-output","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/commands/workflow/worktrees.ts",".bkit/core/engine/commands/workflow/worktrees.test.ts"],"summary":"Git cleanup reads must preserve status columns and NUL-delimited path bytes","description":"runGit and git trim stdout. Trimming porcelain status removes its leading status column, and trimming a NUL-delimited path list can alter a leading-whitespace filename. Cleanup proofs that parse those outputs can inspect the wrong path and misclassify work as safe.","rootCause":"The general Git helpers trim stdout for scalar reads, while cleanup parses byte-sensitive status and path protocols.","remediation":"Use the worktree module's cleanupRead for raw status, ls-tree, diff path and committed-line evidence. Keep scalar ref reads on the existing helpers. The marked-worktree unit regression covers a tracked-only unstaged edit.","status":"ACTIVE"}
