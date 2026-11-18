diff --git a/.bkit/core/engine/commands/workflow/branches.test.ts b/.bkit/core/engine/commands/workflow/branches.test.ts
index c11031254..a7226790c 100644
--- a/.bkit/core/engine/commands/workflow/branches.test.ts
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -3626,6 +3626,46 @@ describe("shared landed comparison", { timeout: GIT_TIMEOUT }, () => {
     const comparison = await import("./worktrees");
     expect(comparison.notOnDev(clone, "feat/1-x")).toContain("src.txt");
   });
+
+  it("a later dev commit on the same file does not turn a landed branch back into unlanded", async () => {
+    const { origin, clone } = withOrigin("land-later");
+    git(clone, "switch", "-q", "-c", "feat/1-x");
+    commit(clone, { "src.txt": "code v1\n" }, "feat: change src");
+    landOnDev(origin, { "src.txt": "code v1\n" }, "dev carries the branch change");
+    landOnDev(origin, { "src.txt": "later dev edit\n" }, "later dev edit");
+    expect(git(clone, "fetch", "-q", "origin").ok).toBe(true);
+    expect(sha(clone, "HEAD:src.txt")).not.toBe(sha(clone, "origin/dev:src.txt"));
+    const comparison = await import("./worktrees");
+    expect(comparison.notOnDev(clone, "feat/1-x")).toEqual([]);
+  });
+
+  it("names only the file whose branch version never reached dev", async () => {
+    const { origin, clone } = withOrigin("land-partial");
+    git(clone, "switch", "-q", "-c", "feat/1-x");
+    commit(clone, { "a.txt": "a one\n", "src.txt": "branch only\n" }, "feat: two files");
+    landOnDev(origin, { "a.txt": "a one\n" }, "dev carries a.txt");
+    landOnDev(origin, { "a.txt": "a later\n" }, "later dev edit of a.txt");
+    expect(git(clone, "fetch", "-q", "origin").ok).toBe(true);
+    const comparison = await import("./worktrees");
+    expect(comparison.notOnDev(clone, "feat/1-x")).toEqual(["src.txt"]);
+  });
+
+  it("a deleted file that dev deleted and a later commit re-added counts as landed", async () => {
+    const { origin, clone } = withOrigin("land-deleted");
+    git(clone, "switch", "-q", "-c", "feat/1-x");
+    expect(git(clone, "rm", "-q", "src.txt").ok).toBe(true);
+    expect(git(clone, "commit", "-qm", "feat: delete src").ok).toBe(true);
+    const other = tmp("other-del");
+    git(other, "clone", "-q", "-b", "dev", origin, ".");
+    expect(git(other, "rm", "-q", "src.txt").ok).toBe(true);
+    expect(git(other, "commit", "-qm", "dev deletes src").ok).toBe(true);
+    expect(git(other, "push", "-q", "origin", "dev").ok).toBe(true);
+    landOnDev(origin, { "src.txt": "re-added\n" }, "later re-add");
+    expect(git(clone, "fetch", "-q", "origin").ok).toBe(true);
+    expect(git(clone, "ls-tree", "origin/dev", "src.txt").out).not.toBe("");
+    const comparison = await import("./worktrees");
+    expect(comparison.notOnDev(clone, "feat/1-x")).toEqual([]);
+  });
 });
 
 describe("branches land", { timeout: GIT_TIMEOUT }, () => {
diff --git a/.bkit/core/engine/commands/workflow/worktrees.test.ts b/.bkit/core/engine/commands/workflow/worktrees.test.ts
index 031c5e072..07f8d0782 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.test.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -1202,6 +1202,50 @@ describe("bkit worktrees remove", () => {
       expect(r.err).toContain(`remote origin/feat/${FID} not deleted — preserved`);
     });
 
+    /** dev carries the branch's change in one commit, then edits the same file again. */
+    function landThenEdit(cwd: string, origin: string) {
+      fs.writeFileSync(path.join(cwd, "shared.txt"), "base\n");
+      git(cwd, "add", "shared.txt");
+      git(cwd, "commit", "-qm", "base file");
+      git(cwd, "push", "-q", "origin", "dev");
+      const wt = linked(cwd, FID, true);
+      fs.writeFileSync(path.join(wt, "shared.txt"), "base\nbranch change\n");
+      git(wt, "add", "shared.txt");
+      git(wt, "commit", "-qm", "branch change");
+      git(wt, "push", "-q", "origin", `feat/${FID}`);
+      fs.writeFileSync(path.join(cwd, "shared.txt"), "base\nbranch change\n");
+      git(cwd, "commit", "-qam", "dev carries branch change");
+      fs.writeFileSync(path.join(cwd, "shared.txt"), "base\nbranch change\nlater dev edit\n");
+      git(cwd, "commit", "-qam", "later dev edit");
+      git(cwd, "push", "-q", "origin", "dev");
+      expect(origin).toBeTruthy();
+      return wt;
+    }
+
+    it("removes the worktree and local branch when a later dev commit changed the branch's file", async () => {
+      const cwd = repo();
+      const origin = withOrigin(cwd);
+      const wt = landThenEdit(cwd, origin);
+      const r = await remove(cwd, `--branch=feat/${FID}`);
+      expect(r.code).toBe(0);
+      expect(r.json).toMatchObject({ removed: true, branchDeleted: true, branchBlockedBy: null });
+      expect(r.json.reason).not.toBe("not-landed");
+      expect(fs.existsSync(wt)).toBe(false);
+      expect(git(cwd, "branch", "--list", `feat/${FID}`)).toBe("");
+    });
+
+    it("deletes the remote branch when a later dev commit changed the branch's file", async () => {
+      const cwd = repo();
+      const origin = withOrigin(cwd);
+      landThenEdit(cwd, origin);
+      expect(remoteHas(origin)).toBe(true);
+      const r = await remove(cwd, `--branch=feat/${FID}`);
+      expect(r.code).toBe(0);
+      expect(r.json.reason).not.toBe("remote-not-landed");
+      expect(r.json).toMatchObject({ removed: true, remoteDeleted: true });
+      expect(remoteHas(origin)).toBe(false);
+    });
+
     it("an unmarked worktree holding the branch blocks BOTH deletes and is named", async () => {
       const cwd = repo();
       const origin = withOrigin(cwd);
diff --git a/.bkit/core/engine/commands/workflow/worktrees.ts b/.bkit/core/engine/commands/workflow/worktrees.ts
index 58d9c297c..95682216c 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.ts
@@ -801,6 +801,22 @@ function committedLines(root: string, rev: string, file: string): string[] {
   return result.stdout.split("\n").filter(Boolean);
 }
 
+/** True when some origin/dev commit since the merge base holds the branch's tree entry for the file. */
+function devHeldEntry(root: string, base: string, file: string, entry: string | null): boolean {
+  const log = cleanupRead(root, [
+    "rev-list",
+    "--full-history",
+    `${base}..${ORIGIN_DEV}`,
+    "--",
+    file,
+  ]);
+  if (!log.ok) throw new Error(`cannot inspect ${base}..${ORIGIN_DEV} for ${file}: ${log.stderr}`);
+  return log.stdout
+    .split("\n")
+    .filter(Boolean)
+    .some((commit) => treeEntry(root, commit, file) === entry);
+}
+
 /** Branch changes absent from dev, including deletions and tree-entry mode/type. */
 export function notOnDev(root: string, branch: string): string[] {
   const base = git(root, ["merge-base", ORIGIN_DEV, branch]);
@@ -815,6 +831,7 @@ export function notOnDev(root: string, branch: string): string[] {
         const feature = treeEntry(root, branch, file);
         const dev = treeEntry(root, ORIGIN_DEV, file);
         if (feature === dev) return false;
+        if (devHeldEntry(root, base, file, feature)) return false;
         if (
           feature === null ||
           dev === null ||
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 8f8864fc2..0fc149994 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -300,3 +300,4 @@
 {"schema":3,"ts":1794973968097,"kind":"friction","key":"review-agent-turn-limit/plan-review-2","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"plan","step":"plan-review"},"references":["1008-plan-design-owner","#1008"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"@bkit-plan-review-2 stopped at its 100-turn limit with no result file, so the orchestrator resumed it to finish","description":"@bkit-plan-review-2 used all 100 turns reading code for the 1008 plan and stopped before writing its result JSON; its review file was partly written. The orchestrator sent it one message to finish from what it had found, and it wrote the result file on the resumed turn.","remediation":"Raise the review agent's turn cap or have it write its result file before its last turns, as was done for the utility agents.","source":"orchestrator","status":"OPEN"}
 {"schema":3,"ts":1794977744207,"kind":"friction","key":"plan-tasks-gate-wait/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["1039-ledger-query-status","#1039"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"Code agent handed back PASS but left its own changed-files gate running for 30 minutes under load, so it was stopped","description":"@bkit-build-plan-tasks (group 1) logged DONE for all 3 tasks and Verdict: PASS, then stayed alive waiting on a second `bkit:gate:changed` run that was still going 30 minutes after it started, with the load average at 23-34 from parallel builds. The orchestrator stopped the agent, which ended its gate processes, and finished the step from the PASS log. Same pattern as build 1030 group 3.","remediation":"Have the code agent's changed-files gate respect the machine load, or drop the agent-side gate when the workflow's own group and holistic gates re-run the same checks.","source":"orchestrator","status":"OPEN"}
 {"schema":3,"ts":1795002867122,"kind":"friction","key":"pre-worktree-commit-refused/build-worktree-setup","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-worktree-setup"},"references":["1055-worktree-removal-says","#1055"],"category":"tool-failure","scope":"bkit-repo","severity":"LOW","summary":"Permission check refused the pre-worktree commit in the main checkout; the block was skipped because the tree was clean","description":"Step 2 sub-step 1 ran `bkit ledgers commit --root=<main checkout> --only-if-dirty-tracked --scope=core --mode=commit`. The auto-mode permission classifier refused it with the reason \"Destructive or Unwanted Actions\". `git status --short` in the main checkout printed 0 lines on dev, so the block would have committed nothing. On the orchestrator's answer the block was skipped, every other Step 2 block ran as written, and nothing was retried another way.","remediation":"Let the pre-worktree commit check for tracked changes first and print a no-op without a commit command when the tree is clean, so a clean checkout never needs commit permission.","source":"orchestrator","status":"OPEN"}
+{"schema":3,"ts":1795004262872,"kind":"friction","key":"code-agent-local-check-refused/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["1055-worktree-removal-says","#1055"],"category":"tool-failure","scope":"bkit-repo","severity":"LOW","summary":"Permission check refused the code agent's local lint and typecheck and a pkill of its own stray test run; nobody retried either another way","description":"In Step 7 the `bkit-build-plan-tasks` subagent ran its local check `bkit tests changed --fallback=bkit:gate:static`. The auto-mode permission classifier refused it twice, once inside a cleanup command and once on its own. It also refused a `pkill` the agent used to stop its own extra `vitest run .bkit/core/engine/commands/workflow/branches.test.ts`, which was left to end by itself. Neither command was retried another way, by the agent or the orchestrator; on the orchestrator's answer the run went on and lint and typecheck were left to the workflow's own gates.","remediation":"Let the code agent's prompt name a local check the permission classifier allows, or drop the local static check from the code agent and rely on the group and holistic gates, so a code step never needs a refused command.","source":"orchestrator","status":"OPEN"}
diff --git a/dist/commands/workflow/worktrees.js b/dist/commands/workflow/worktrees.js
index dbe91e6ea..05893dded 100644
--- a/dist/commands/workflow/worktrees.js
+++ b/dist/commands/workflow/worktrees.js
@@ -659,6 +659,22 @@ function committedLines(root, rev, file) {
         throw new Error(`cannot read ${rev}:${file}: ${result.stderr}`);
     return result.stdout.split("\n").filter(Boolean);
 }
+/** True when some origin/dev commit since the merge base holds the branch's tree entry for the file. */
+function devHeldEntry(root, base, file, entry) {
+    const log = cleanupRead(root, [
+        "rev-list",
+        "--full-history",
+        `${base}..${ORIGIN_DEV}`,
+        "--",
+        file,
+    ]);
+    if (!log.ok)
+        throw new Error(`cannot inspect ${base}..${ORIGIN_DEV} for ${file}: ${log.stderr}`);
+    return log.stdout
+        .split("\n")
+        .filter(Boolean)
+        .some((commit) => treeEntry(root, commit, file) === entry);
+}
 /** Branch changes absent from dev, including deletions and tree-entry mode/type. */
 export function notOnDev(root, branch) {
     const base = git(root, ["merge-base", ORIGIN_DEV, branch]);
@@ -676,6 +692,8 @@ export function notOnDev(root, branch) {
             const dev = treeEntry(root, ORIGIN_DEV, file);
             if (feature === dev)
                 return false;
+            if (devHeldEntry(root, base, file, feature))
+                return false;
             if (feature === null ||
                 dev === null ||
                 !file.endsWith(".jsonl") ||
diff --git a/docs/observability.md b/docs/observability.md
index d2b6cdec4..bd9c9044f 100644
--- a/docs/observability.md
+++ b/docs/observability.md
@@ -218,7 +218,7 @@ With `--fresh-base`, ancestry is checked before the override or bookkeeping carr
 
 `bkit prs merge --ship-retry` distinguishes a moved head (exit 9, return to validation) from a new conflict (exit 10, return to integration). Other merge refusals remain terminal (exit 7). A successful head-pinned merge still has a residual race with a later base update because the merge API does not pin the base SHA.
 
-Cleanup reports preservation explicitly. `local {branch} changed after its cleanup proof — preserved` means the expected-tip delete refused; `carries work origin/dev does not — preserved` means landed-work evidence failed. `cleanup evidence unavailable — preserved` names an unreadable local or remote ref. `remote origin/{branch} not deleted — preserved` means origin refused the lease-guarded delete at the proved landed tip. Cleanup proves the index and working tree separately before removing either, and these diagnostics are independent of GitHub's repository-level automatic branch deletion setting.
+Cleanup reports preservation explicitly. `local {branch} changed after its cleanup proof — preserved` means the expected-tip delete refused; `carries work origin/dev does not — preserved` means landed-work evidence failed: no `origin/dev` commit since the merge base holds the branch's version of a named file, so a later `dev` commit on the same file does not make a landed branch unlanded. `cleanup evidence unavailable — preserved` names an unreadable local or remote ref. `remote origin/{branch} not deleted — preserved` means origin refused the lease-guarded delete at the proved landed tip. Cleanup proves the index and working tree separately before removing either, and these diagnostics are independent of GitHub's repository-level automatic branch deletion setting.
 
 The same prefix carries the CI waits (`bkit runs wait`: one `attempt N: …` line per poll) and the CI-Dispatch Gate (`bkit runs dispatch`: `re-trigger commit or push failed — no verdict; route to the Failure Path`, `landed commit … inherited a CI-suppression token in its body`).
 
diff --git a/docs/testing.md b/docs/testing.md
index bec27ee5f..9f9cecc0f 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -961,9 +961,9 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `commands/workflow/challenge.test.ts` | Unit (boundary: real temp git repo) | `bkit challenge merge`: findings appended as task blocks in new last groups within the caps (7 findings → groups of 3, 3 and 1), one `Derived Test Matrix` row per appended task, dedupe by `path:line`, an open earlier task reopened vs a done one getting a new task, `LOW` → a `low-severity` deferral row (a failed append leaves the plan unchanged), overflow → `pause` writing nothing, exit 23 for a block that fails `plan-check`; a structured finding whose `title`, `cls`, `doneWhen` or a `tests` entry holds a line break refused naming the finding and field. `bkit challenge gate`: sizes the diff, fetches `origin/dev` first, writes a `challenge-gate` row. |
 | `commands/workflow/locks.test.ts` | Unit (boundary: real temp git repo + linked worktree) | `bkit locks acquire / release`: month bucket (existing, UTC new, split refused); live vs reclaimable holder (a step in the last 30 minutes is live and refused with exit 8 and `heldBy`, a taken lock prints `heldBy` null; an idle, finished or log-less holder is reclaimed whatever the lock file's age; worktree copy first); ship's lock in the main checkout from its worktree; only the workflow kind; release by token, never another owner's; `acquire` prints `route` `go` with an empty `message` when it takes the lock, `route` `stop` with a `message` naming the holder on a live one, and nothing on stdout when the month bucket is split. |
 | `commands/workflow/workflows.test.ts` | Unit (boundary: real temp git repos + bare remote) | `bkit workflows start / fail / handover / close / promote / links`: run opened vs resumed (a run still resumes after another workflow's run), `--lock-held`, `lastDoneStep` and, as `openDecision` with its `status` and `sourceChanged` (the `Source changed` header) on a resume, the run's own `OPEN` decision or a `DECIDED` / `ASSUMED` one that no `build-decision` row names; failed row, own-lock release, rebase or merge abort only when in progress, sentinel clearing, `handoverNeeded` (incl. debug `SOAK`), nothing changed without `--token` (empty values count as absent), labels, failure comment from `--error-file`; handover `--push` (the record committed and pushed on the feature branch with or without a handover, open PR → 9 with no link, pushed → linked comment, the named worktree committed in, and from `dev` only the logs and ledgers landed through a throwaway checkout with the checkout's code untouched, then the landed copies handed back so local `dev` fast-forwards onto them while a staged ledger stays and is named, a refusal → 10 with the record kept) and ship `--flush` (one FAILED commit landed on `dev` from a throwaway checkout with the main checkout untouched, nothing-to-commit, the named worktree's logs carried, a refused flush published through a `ship-failed/{FID}` PR, exit 10 only when the PR path fails too); ship `close --flush` (one DONE commit on `dev` carrying the book, then the owned worktree and branch removed; an unowned worktree and its branch left in place); compliance rows before counter + outcome rows, one `run.parentSha` on all three, a `build-plan-convert` row → `plan.source` `converted` with groups, plan tasks counted from task headings, unwritable stats never failing the close, ship size + coverage, artifact links, `--message` commit with the exact-match auto-route marker and `--verbose-ci-local`, `--record-step`, `--outbox` + `--number` comment; promote (`--resolve`, exit 12, archive of a changed canonical, anchor from the base commit, bkit release and outdated warning in the anchor, the plan copied alone, a stray `{FID}-plan-N.md` neither copied nor archived); links (comment, branch name in URLs); `close --ending=held --publish=false` writing `ending: held` and `publish: false` on the `workflow-done` row (default `done`, an unknown ending refused) and passing `publish` into the summary; `handover` prints `route` `stop` on every exit it reaches (0, 9 with ship's push skipped on an open PR, 10, 11, `--ref`) and the not-pushed line as `message` on each non-zero one. |
-| `commands/workflow/worktrees.test.ts`, `worktrees.integration.test.ts` | Unit and Integration (real git remote) | `bkit worktrees setup / remove`: adopt in place, adopt the linked worktree a host already made on `feat/{FID}` for every workflow (no second `git worktree add`; `worktreePath` and `logDir` point into it; a session on another branch still mints; design / plan / build run in place in the main checkout on `feat/{FID}` under `--worktrees` exit 7 with no log directory), debug / ship branch rules, mint off a freshly fetched `origin/dev` — always for design / plan, and off local `dev` when it is ahead for build / debug (diverged → `origin/dev`, narrated) —, a resumed design / plan branch carrying unpushed `dev` commits refused (7) while the same worktree resumes for build, resume rebase onto the same base + sentinel, a failed ship's uncommitted leftovers committed before that rebase (logs dev already holds dropped, copied entries never committed; a refused commit → exit 9), `direnv allow` only for a `.envrc` identical to the main checkout's (direnv stubbed on PATH), `bkit.workflows.worktree.copy` list with missing entries narrated, install in every workflow (design / plan included), install failure vs could-not-run exits, `--detect` taking mint vs adopt from the runtime (exclusive with `--worktrees`), ownership marker, removal only of a marked worktree, `--branch` deleting the local and remote branch unless another worktree holds it (`branchBlockedBy`); debug in place on `dev` writes the shared-checkout record (`startSha`, `aheadAtStart`) and exits 13 when another feature's live run holds the checkout; a ship of `dev` / `main` and `main` for design / plan / build exit 7. |
+| `commands/workflow/worktrees.test.ts`, `worktrees.integration.test.ts` | Unit and Integration (real git remote) | `bkit worktrees setup / remove`: adopt in place, adopt the linked worktree a host already made on `feat/{FID}` for every workflow (no second `git worktree add`; `worktreePath` and `logDir` point into it; a session on another branch still mints; design / plan / build run in place in the main checkout on `feat/{FID}` under `--worktrees` exit 7 with no log directory), debug / ship branch rules, mint off a freshly fetched `origin/dev` — always for design / plan, and off local `dev` when it is ahead for build / debug (diverged → `origin/dev`, narrated) —, a resumed design / plan branch carrying unpushed `dev` commits refused (7) while the same worktree resumes for build, resume rebase onto the same base + sentinel, a failed ship's uncommitted leftovers committed before that rebase (logs dev already holds dropped, copied entries never committed; a refused commit → exit 9), `direnv allow` only for a `.envrc` identical to the main checkout's (direnv stubbed on PATH), `bkit.workflows.worktree.copy` list with missing entries narrated, install in every workflow (design / plan included), install failure vs could-not-run exits, `--detect` taking mint vs adopt from the runtime (exclusive with `--worktrees`), ownership marker, removal only of a marked worktree, `--branch` deleting the local and remote branch unless another worktree holds it (`branchBlockedBy`); debug in place on `dev` writes the shared-checkout record (`startSha`, `aheadAtStart`) and exits 13 when another feature's live run holds the checkout; a ship of `dev` / `main` and `main` for design / plan / build exit 7. `remove --branch` still removes the worktree and deletes the local and remote branch when a later `dev` commit changed the branch's file. |
 | `commands/workflow/shared-checkout.integration.test.ts` | Integration (real git, real bare `origin`) | A debug run in place on `dev` with foreign work in flight (a modified file, an untracked one, a staged one, a pre-existing ledger row, a local commit): the push sends only the run's commits (replayed as copies onto `origin/dev` when local `dev` is ahead or `origin/dev` moved, a plain push when level, a foreign commit never; with the run's record gone, or another run's newer record present, the push refuses with exit 20 or selects its own `--fid` record), and the run's commits, close commit and roadmap mirror row carry only its own paths and rows, leaving foreign staged, untracked and `.bkit/issues.jsonl` changes behind. |
-| `commands/workflow/branches.test.ts` | Unit (boundary: real temp git repos) | `bkit branches rebase / anchor-stamp / anchor-read / push / sync / sync-dev`: ledger union byte-identical to `merge=union`, lockfile from the rebase target then regenerated, refuse-before-mutate; idempotent anchor stamp, `--base-ref` override, `bkitVersion` / `bkitLatest` stamped and the visible outdated line written then dropped after an upgrade, the outdated stamp prettier-clean and stable on re-stamp, empty `bkitLatest` when unknown; `--against` skip exits; one `git push`, lease only off `dev`/`main`, `--require-ci`, abort guard + `--open-pr`; a `--require-ci` feature push merging `origin/dev`'s ledger rows first (`mergedDev: true`), pushing as-is when `dev` has not moved or without `--require-ci`, and exiting 11 with nothing pushed on a code conflict; docs-from-dev merge committed as `chore({FID}): merge dev` with no skip token, also when only a ledger outside `docs/` moved, a declared `bkit:generate` run and committed after it (25 when it fails); `sync --merge` (ship Step 4) merging `origin/dev` into the checked-out branch: a clean merge committed with the branch as first parent, `current` when `dev` has not moved with a stale sentinel cleared, uncommitted work carried in its own commit first, a conflicted lockfile taken from `dev`, conflicts outside the ledgers and lockfile left in progress with exit 24 until `git add` and a re-run complete the merge, a failed ledger resolution aborting the merge with the sentinel written (11), `bkit:generate` committed after the merge, `--file` writing one `engine-action` merge row, usage (2) and detached (5) refusals; `regenerate` (ship Steps 3 and 10) committing only the paths `bkit:generate` changed while the run's own uncommitted files stay uncommitted, a rewrite and a delete committed, `--attempt` giving the `fix({FID}): regenerate attempt {N}` subject, `--file` writing one `engine-action` regenerate row, `unchanged` when nothing changed, `undeclared` with no or an empty script, 25 when `bkit:generate` fails or rewrites a file that was already uncommitted, usage (2) for `--attempt=0` and on `dev`; `rebase --file` writing one `engine-action` rebase row for a completed rebase and none for a refused one; `sync-dev` fast-forwarding local `dev` without a checkout, moving the checkout and installing only when on `dev` and `dev` moved (16 on a failed install), listing local-only `dev` commits with the publish command and pushing none (10 on a failed fetch); a refused rebase whose `--abort` fails reports `aborted: false` and `ABORT FAILED`. `bkit branches land`: workflow refusal, stray main-checkout artifacts (17), squash off `origin/dev` → `design DONE` commit pushed + audited + local `dev` fast-forwarded, staged files in the main checkout left staged, local-only `dev` commits left unpushed (`localDev: skipped`), another checked-out branch kept with only the `dev` pointer moved, `dev` moving under the push rebuilt and retried (`pushAttempts: 2`) or exhausted (8, branch kept, throwaway worktree gone), non-doc files refused (17) — a branch carrying unpushed `dev` commits additionally named as such, with the unpushed count and `git push origin dev` —, refused `dev` push → PR shape handing the PR to MCP (80, stage `open`) after pushing the roadmap commit (cloud, and on a laptop from the worktree holding the branch), refused PR merge → `origin/dev` merged into the branch locally and pushed (no server-side update-branch) then merged, a CLOSED PR stopping at once (17), uncommitted files in the feature worktree keeping the worktree and branch (`worktree.reason: uncommitted`), branch work missing from `origin/dev` stopping (18) with branch and worktree kept; `landBackoffMs` schedule (2s doubling, 30s cap, jitter, 3min total); the full local close is also run from the workflow in `close-squash.integration.test.ts`. `scan-diff --since-step=<step> --file --code`: exit 0 whether the subagent committed its fix before `steps finish` or left it for the finish commit, exit 1 when the step changed only logs, and skipping a `build-takeover` row a refused finish wrote after the subagent committed. `scan-diff --disabled-tests`: added disabling markers exit 1 with each hit's `file:line` and test name; no unmatched candidates exits 0 with an empty `disabled`. Exact assertion moves consume each added occurrence once and require unchanged test context across files; rewrites pair only within the same file and test. Unchanged duplicates and unrelated additions cannot conceal removals. Removed assertions retain their original test names; deleted files use old line numbers. Comments, non-assertion deletions and quoted markers in docs or source files are excluded. |
+| `commands/workflow/branches.test.ts` | Unit (boundary: real temp git repos) | `bkit branches rebase / anchor-stamp / anchor-read / push / sync / sync-dev`: ledger union byte-identical to `merge=union`, lockfile from the rebase target then regenerated, refuse-before-mutate; idempotent anchor stamp, `--base-ref` override, `bkitVersion` / `bkitLatest` stamped and the visible outdated line written then dropped after an upgrade, the outdated stamp prettier-clean and stable on re-stamp, empty `bkitLatest` when unknown; `--against` skip exits; one `git push`, lease only off `dev`/`main`, `--require-ci`, abort guard + `--open-pr`; a `--require-ci` feature push merging `origin/dev`'s ledger rows first (`mergedDev: true`), pushing as-is when `dev` has not moved or without `--require-ci`, and exiting 11 with nothing pushed on a code conflict; docs-from-dev merge committed as `chore({FID}): merge dev` with no skip token, also when only a ledger outside `docs/` moved, a declared `bkit:generate` run and committed after it (25 when it fails); `sync --merge` (ship Step 4) merging `origin/dev` into the checked-out branch: a clean merge committed with the branch as first parent, `current` when `dev` has not moved with a stale sentinel cleared, uncommitted work carried in its own commit first, a conflicted lockfile taken from `dev`, conflicts outside the ledgers and lockfile left in progress with exit 24 until `git add` and a re-run complete the merge, a failed ledger resolution aborting the merge with the sentinel written (11), `bkit:generate` committed after the merge, `--file` writing one `engine-action` merge row, usage (2) and detached (5) refusals; `regenerate` (ship Steps 3 and 10) committing only the paths `bkit:generate` changed while the run's own uncommitted files stay uncommitted, a rewrite and a delete committed, `--attempt` giving the `fix({FID}): regenerate attempt {N}` subject, `--file` writing one `engine-action` regenerate row, `unchanged` when nothing changed, `undeclared` with no or an empty script, 25 when `bkit:generate` fails or rewrites a file that was already uncommitted, usage (2) for `--attempt=0` and on `dev`; `rebase --file` writing one `engine-action` rebase row for a completed rebase and none for a refused one; `sync-dev` fast-forwarding local `dev` without a checkout, moving the checkout and installing only when on `dev` and `dev` moved (16 on a failed install), listing local-only `dev` commits with the publish command and pushing none (10 on a failed fetch); a refused rebase whose `--abort` fails reports `aborted: false` and `ABORT FAILED`. `bkit branches land`: workflow refusal, stray main-checkout artifacts (17), squash off `origin/dev` → `design DONE` commit pushed + audited + local `dev` fast-forwarded, staged files in the main checkout left staged, local-only `dev` commits left unpushed (`localDev: skipped`), another checked-out branch kept with only the `dev` pointer moved, `dev` moving under the push rebuilt and retried (`pushAttempts: 2`) or exhausted (8, branch kept, throwaway worktree gone), non-doc files refused (17) — a branch carrying unpushed `dev` commits additionally named as such, with the unpushed count and `git push origin dev` —, refused `dev` push → PR shape handing the PR to MCP (80, stage `open`) after pushing the roadmap commit (cloud, and on a laptop from the worktree holding the branch), refused PR merge → `origin/dev` merged into the branch locally and pushed (no server-side update-branch) then merged, a CLOSED PR stopping at once (17), uncommitted files in the feature worktree keeping the worktree and branch (`worktree.reason: uncommitted`), branch work missing from `origin/dev` stopping (18) with branch and worktree kept; `landBackoffMs` schedule (2s doubling, 30s cap, jitter, 3min total); the full local close is also run from the workflow in `close-squash.integration.test.ts`. `scan-diff --since-step=<step> --file --code`: exit 0 whether the subagent committed its fix before `steps finish` or left it for the finish commit, exit 1 when the step changed only logs, and skipping a `build-takeover` row a refused finish wrote after the subagent committed. `scan-diff --disabled-tests`: added disabling markers exit 1 with each hit's `file:line` and test name; no unmatched candidates exits 0 with an empty `disabled`. Exact assertion moves consume each added occurrence once and require unchanged test context across files; rewrites pair only within the same file and test. Unchanged duplicates and unrelated additions cannot conceal removals. Removed assertions retain their original test names; deleted files use old line numbers. Comments, non-assertion deletions and quoted markers in docs or source files are excluded. `notOnDev` keeps a landed branch landed after a later `dev` commit on its file, names only the file whose branch version never reached `dev`, and counts a file the branch deleted as landed when `dev` deleted it and a later commit re-added it. |
 | `commands/land.test.ts` | Unit (boundary: real temp git repos + bare remote) | `pushToDev`, the one routine every `dev` write goes through: commit built in a throwaway `origin/dev` checkout and pushed as `dev`, the main checkout untouched, local-only `dev` commits never pushed, `dev` moving under the push rebuilt and retried or exhausted, any other refusal handed to the caller's `refused` hook with the throwaway checkout still there, fetch failure, a throwing build; the throwaway checkout gone on every path; `landBackoffMs` schedule. |
 | `commands/workflow/skills.test.ts` | Unit (stub skills CLI) | `bkit skills prune`: union of folders and lock keys, never `bkit-*`, whole-name and literal matching, skips with a warning (exit 0) without `.agents/skills.md`, CLI failure and could-not-run warned and listed in `failed` (exit 0). |
 | `commands/workflow/prs.test.ts` | Unit (stub `gh`) | `bkit prs open / probe / merge / verbose-ci / scan-body / cross-check / transport-row`: marker first in every body, open-PR refusal vs reuse, one retry, base read-back, 80 with the printed title / body; probe states; merge (empty body, `--match-head`, `--delete-branch`, exact-match auto-route subject, already-merged skip, `--expect-merged` 7, 80; `--base=refs/heads/main` spellings refused; a base retarget after the merge fails loudly); verbose-ci on / off / no-op / 5 / 80; body-only token scan; fallback-row cross-check; `transport-row --scan` (clean, token recorded then exit 1, unreadable 8, `--cross-check` refusal unrecorded). |
