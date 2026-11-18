diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index c67f8d9ab..288d44db6 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -1362,7 +1362,7 @@ All phase workflows run in `.worktrees/{FID}` (gitignored), with one worktree pe
 | --- | --- | --- |
 | `created` | `--worktrees`, no `.worktrees/{FID}` | `git worktree prune`; adds the existing local `feat/{FID}`, else tracks `origin/feat/{FID}`, else cuts `feat/{FID}` off the base: a freshly fetched `origin/dev` (explicit refspec — a clone whose fetch refspec skips `dev` still gets a current base; origin unreachable → exit 4, nothing minted), or local `dev` when it is a fast-forward of `origin/dev` — dev pushes wait for a human, so local `dev` routinely holds commits `origin/dev` lacks; push `dev` before the feature PR. Local `dev` diverged from `origin/dev` → `origin/dev`, narrated. Writes the `.worktree-owned` marker in `{OUTBOX}` |
 | `resumed` | `--worktrees`, `.worktrees/{FID}` registered | `git fetch origin dev` + `git rebase` onto the same base (ship: no fetch, no rebase). An uncommitted tree (a failed ship's flush lands its record on dev and leaves the worktree as it was) is committed first as `chore({FID}): carry … bkit` (`carriedSha`), so any workflow can start after any failed one: an untracked log of the FID that the base already holds is dropped first (dev's copy wins, `carriedDropped`; one whose content differs is moved to the outbox's `{FID}/dropped-logs/` first), and the `bkit.workflows.worktree.copy` entries (the main checkout's and the worktree's lists) are never committed and alone do not count as uncommitted; a tracked one setup copied over is set aside for the rebase (`--autostash`) once nothing else is left. `engine-call` rows appended to the end of the tracked `status.jsonl` and `friction` rows appended to the end of the tracked `.bkit/friction.jsonl` after that commit are cut from those files before the rebase and appended again after it, not stashed, so a dev that appended to the same file cannot leave conflict markers or a stash entry behind; a rebase that stops part-way keeps them out of the tree. Setup writes nothing into the tree while it leaves a rebase in progress, because `git rebase --continue` refuses while a tracked file has unstaged changes and the run's `rebase-resolve-log.md` is tracked once a run commits it: the rows and setup's stopped note go to `bkit-rebase-note.md` in the worktree's git dir, and `bkit branches rebase --log-file` writes them ahead of its own lines once the rebase finishes or aborts. Conflict → exit 3, rebase left in progress (§ Rebase Conflict Tiering); a rebase that still cannot start (that commit refused) → exit 9. A plain directory at the path → exit 10, never rebases the main checkout |
-| `adopted` | no `--worktrees` (cloud), or the session already sits on the branch | works in place on the current branch, `worktreePath` = repo root; no copy, no install |
+| `adopted` | no `--worktrees` (cloud), or the session already sits on the target `feat/{FID}` (every workflow, so a host-made linked worktree is used, never added twice) | works in place on the current branch; `worktreePath` = the session's own checkout (a linked worktree when the session runs in one, else the repo root); no copy, no install |
 
 Then, for `created` / `resumed` worktrees only:
 
diff --git a/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts b/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
index fde40c282..74e9110de 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
@@ -1147,6 +1147,30 @@ describe("bkit worktrees setup — mint (resume)", () => {
   });
 });
 
+describe("bkit worktrees setup — a host-made worktree on feat/{fid}", () => {
+  it("plan from a host-made worktree on feat/{fid} adopts it without rebasing", async () => {
+    const f = fixture();
+    const host = path.join(path.dirname(f.repo), "host-wt");
+    git(f.repo, "worktree", "add", "-q", host, "-b", `feat/${FID}`);
+    const hostReal = fs.realpathSync(host);
+    const head = git(hostReal, "rev-parse", "HEAD");
+    advanceDev(f, "moved.txt", "moved\n");
+    git(f.repo, "fetch", "-q", "origin");
+
+    const r = await setup(hostReal, "plan", "--worktrees");
+    expect(r.err).not.toContain("already used by worktree");
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({
+      mode: "adopted",
+      worktreePath: hostReal,
+      rebaseConflict: false,
+    });
+    expect(r.json.logDir).toBe(path.join(hostReal, "docs/plans", MONTH, "logs", FID));
+    expect(git(hostReal, "rev-parse", "HEAD")).toBe(head);
+    expect(fs.existsSync(wtOf(f))).toBe(false);
+  });
+});
+
 describe("bkit worktrees setup — debug adopts, never mints", () => {
   it("adopts the session branch in place when there is no worktree and no feat/{fid}", async () => {
     const f = fixture();
diff --git a/.bkit/core/engine/commands/workflow/worktrees.test.ts b/.bkit/core/engine/commands/workflow/worktrees.test.ts
index f4cfa8850..161509eac 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.test.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -181,6 +181,76 @@ describe("bkit worktrees setup — adopt in place", () => {
   });
 });
 
+/** A worktree a host made outside `.worktrees/`, already on `feat/{fid}`. */
+function hostWorktree(cwd: string, fid = FID) {
+  const dir = path.join(
+    fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-wt-host-"))),
+    fid,
+  );
+  dirs.push(path.dirname(dir));
+  git(cwd, "worktree", "add", "-q", dir, "-b", `feat/${fid}`);
+  return fs.realpathSync(dir);
+}
+
+const worktreeCount = (cwd: string) =>
+  git(cwd, "worktree", "list", "--porcelain")
+    .split("\n")
+    .filter((l) => l.startsWith("worktree ")).length;
+
+describe("bkit worktrees setup — adopt the checkout the session is already on", () => {
+  it("adopts the linked worktree already on feat/{fid} for design, plan, build and debug", async () => {
+    for (const workflow of ["design", "plan", "build", "debug"]) {
+      const cwd = repo("dev");
+      const wt = hostWorktree(cwd);
+      const r = await setup(wt, workflow, "--worktrees");
+      expect(r.err, workflow).not.toContain("already used by worktree");
+      expect(r.code, workflow).toBe(0);
+      expect(r.json, workflow).toMatchObject({
+        mode: "adopted",
+        branch: `feat/${FID}`,
+        worktreePath: wt,
+      });
+      expect(worktreeCount(cwd), workflow).toBe(2);
+      expect(fs.existsSync(path.join(cwd, ".worktrees", FID)), workflow).toBe(false);
+    }
+  });
+
+  it("ship run from a linked worktree on its target branch adopts that worktree", async () => {
+    const cwd = repo("dev");
+    const wt = hostWorktree(cwd);
+    const r = await setup(wt, "ship", "--worktrees");
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ mode: "adopted", branch: `feat/${FID}`, worktreePath: wt });
+    expect(git(cwd, "branch", "--show-current")).toBe("dev");
+    expect(worktreeCount(cwd)).toBe(2);
+  });
+
+  it("the adopted linked worktree holds the log directory", async () => {
+    const cwd = repo("dev");
+    const wt = hostWorktree(cwd);
+    const r = await setup(wt, "plan", "--worktrees");
+    expect(r.code).toBe(0);
+    expect(r.json.logDir).toBe(path.join(wt, "docs/plans", MONTH, "logs", FID));
+    expect(fs.existsSync(r.json.logDir)).toBe(true);
+    expect(fs.existsSync(path.join(cwd, "docs"))).toBe(false);
+  });
+
+  it("a plan session on another branch still mints .worktrees/{fid}", async () => {
+    const cwd = repo("dev");
+    const origin = path.join(path.dirname(cwd), `${path.basename(cwd)}-origin.git`);
+    dirs.push(origin);
+    git(path.dirname(cwd), "init", "-q", "--bare", "-b", "dev", origin);
+    git(cwd, "remote", "add", "origin", origin);
+    git(cwd, "push", "-q", "origin", "dev");
+    git(cwd, "switch", "-q", "-c", "claude/session");
+    const r = await setup(cwd, "plan", "--worktrees");
+    expect(r.err).not.toContain("already used by worktree");
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ mode: "created", worktreePath: worktreeDir(cwd, FID) });
+    expect(fs.existsSync(worktreeDir(cwd, FID))).toBe(true);
+  });
+});
+
 describe("bkit worktrees setup — debug", () => {
   it("adopts a requested debug branch without mutating conflicting worktrees", async () => {
     const cwd = repo("dev");
diff --git a/.bkit/core/engine/commands/workflow/worktrees.ts b/.bkit/core/engine/commands/workflow/worktrees.ts
index da6d42351..e183f0602 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.ts
@@ -1241,15 +1241,16 @@ export const worktreesCommand: CommandSpec = {
           );
         }
 
-        // Ship mints only when the session is not already on the branch it ships:
-        // that branch cannot be checked out in two places.
+        // Every workflow mints only when the session is not already on the target
+        // branch: that branch cannot be checked out in two places, so setup adopts
+        // the session's own checkout (a host may have made it).
         if (f.worktrees === true && f.detect === true)
           throw new CommandError(EXIT.USAGE, "give --worktrees or --detect, not both");
         const worktrees =
           f.detect === true
             ? detect(ctx.cwd, root, ctx.log).runtimeWorktrees
             : f.worktrees === true;
-        const mint = worktrees && !(workflow === "ship" && session === target);
+        const mint = worktrees && session !== target;
         const wtDir = worktreeDir(root, fid);
         let mode: "created" | "resumed" | "adopted" = "adopted";
         if (mint) {
@@ -1286,20 +1287,30 @@ export const worktreesCommand: CommandSpec = {
               mode = "created";
           }
         }
-        const wt = mode === "adopted" ? root : wtDir;
+        // Adopted on the target branch: the session's own checkout, which is a linked
+        // worktree when a host made one; otherwise the main checkout.
+        const adoptRoot =
+          mode === "adopted" && session === target
+            ? (git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? root)
+            : root;
+        const wt = mode === "adopted" ? adoptRoot : wtDir;
         const logDir = logDirOf(wt, month, fid);
         const marker = ownershipMarker(root, fid);
 
         if (mode === "adopted") {
-          if (workflow === "debug" && named && git(root, ["branch", "--show-current"]) !== target) {
+          if (
+            workflow === "debug" &&
+            named &&
+            git(adoptRoot, ["branch", "--show-current"]) !== target
+          ) {
             throw new CommandError(
               EXIT_REFUSED,
               `adopt mode: checkout does not hold requested ${target}; use its existing checkout or enable worktrees`,
             );
           }
-          if (workflow === "ship" && git(root, ["branch", "--show-current"]) !== target) {
+          if (workflow === "ship" && git(adoptRoot, ["branch", "--show-current"]) !== target) {
             const sw = runGit(
-              root,
+              adoptRoot,
               hasLocal(root, target)
                 ? ["switch", target]
                 : ["switch", "--no-track", "-c", target, `refs/remotes/origin/${target}`],
@@ -1317,7 +1328,7 @@ export const worktreesCommand: CommandSpec = {
               );
             }
           }
-          const here = git(root, ["branch", "--show-current"]) ?? "";
+          const here = git(adoptRoot, ["branch", "--show-current"]) ?? "";
           // Debug may work in place on dev (its shared-checkout path); nothing works in place on main.
           if (here === "" || here === MAIN || (here === DEV && workflow !== "debug")) {
             throw new CommandError(
@@ -1332,7 +1343,7 @@ export const worktreesCommand: CommandSpec = {
         // An in-place run on a shared branch records what was dirty before it, so its
         // commits and push take only its own work.
         const shared =
-          mode === "adopted" && isSharedBranch(git(root, ["branch", "--show-current"]) ?? "")
+          mode === "adopted" && isSharedBranch(git(adoptRoot, ["branch", "--show-current"]) ?? "")
             ? openSharedRecord(root, fid, workflow, logDir)
             : undefined;
 
diff --git a/dist/commands/workflow/worktrees.js b/dist/commands/workflow/worktrees.js
index 251335c98..b1894412d 100644
--- a/dist/commands/workflow/worktrees.js
+++ b/dist/commands/workflow/worktrees.js
@@ -1047,14 +1047,15 @@ export const worktreesCommand = {
                     !runGit(root, ["show-ref", "--verify", "--quiet", `refs/remotes/origin/${target}`]).ok) {
                     throw new CommandError(EXIT_REFUSED, `${target} does not exist — debug adopts an existing branch`);
                 }
-                // Ship mints only when the session is not already on the branch it ships:
-                // that branch cannot be checked out in two places.
+                // Every workflow mints only when the session is not already on the target
+                // branch: that branch cannot be checked out in two places, so setup adopts
+                // the session's own checkout (a host may have made it).
                 if (f.worktrees === true && f.detect === true)
                     throw new CommandError(EXIT.USAGE, "give --worktrees or --detect, not both");
                 const worktrees = f.detect === true
                     ? detect(ctx.cwd, root, ctx.log).runtimeWorktrees
                     : f.worktrees === true;
-                const mint = worktrees && !(workflow === "ship" && session === target);
+                const mint = worktrees && session !== target;
                 const wtDir = worktreeDir(root, fid);
                 let mode = "adopted";
                 if (mint) {
@@ -1085,15 +1086,22 @@ export const worktreesCommand = {
                             mode = "created";
                     }
                 }
-                const wt = mode === "adopted" ? root : wtDir;
+                // Adopted on the target branch: the session's own checkout, which is a linked
+                // worktree when a host made one; otherwise the main checkout.
+                const adoptRoot = mode === "adopted" && session === target
+                    ? (git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? root)
+                    : root;
+                const wt = mode === "adopted" ? adoptRoot : wtDir;
                 const logDir = logDirOf(wt, month, fid);
                 const marker = ownershipMarker(root, fid);
                 if (mode === "adopted") {
-                    if (workflow === "debug" && named && git(root, ["branch", "--show-current"]) !== target) {
+                    if (workflow === "debug" &&
+                        named &&
+                        git(adoptRoot, ["branch", "--show-current"]) !== target) {
                         throw new CommandError(EXIT_REFUSED, `adopt mode: checkout does not hold requested ${target}; use its existing checkout or enable worktrees`);
                     }
-                    if (workflow === "ship" && git(root, ["branch", "--show-current"]) !== target) {
-                        const sw = runGit(root, hasLocal(root, target)
+                    if (workflow === "ship" && git(adoptRoot, ["branch", "--show-current"]) !== target) {
+                        const sw = runGit(adoptRoot, hasLocal(root, target)
                             ? ["switch", target]
                             : ["switch", "--no-track", "-c", target, `refs/remotes/origin/${target}`]);
                         if (!sw.ok) {
@@ -1103,7 +1111,7 @@ export const worktreesCommand = {
                             throw new CommandError(EXIT_REFUSED, `adopt mode: cannot switch to ${target} — commit or stash local changes, then re-run (${sw.stderr})`);
                         }
                     }
-                    const here = git(root, ["branch", "--show-current"]) ?? "";
+                    const here = git(adoptRoot, ["branch", "--show-current"]) ?? "";
                     // Debug may work in place on dev (its shared-checkout path); nothing works in place on main.
                     if (here === "" || here === MAIN || (here === DEV && workflow !== "debug")) {
                         throw new CommandError(EXIT_REFUSED, here === ""
@@ -1113,7 +1121,7 @@ export const worktreesCommand = {
                 }
                 // An in-place run on a shared branch records what was dirty before it, so its
                 // commits and push take only its own work.
-                const shared = mode === "adopted" && isSharedBranch(git(root, ["branch", "--show-current"]) ?? "")
+                const shared = mode === "adopted" && isSharedBranch(git(adoptRoot, ["branch", "--show-current"]) ?? "")
                     ? openSharedRecord(root, fid, workflow, logDir)
                     : undefined;
                 let rebaseConflict = false;
diff --git a/docs/testing.md b/docs/testing.md
index ddb4e82e7..0a3e38f18 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -961,7 +961,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `commands/workflow/challenge.test.ts` | Unit (boundary: real temp git repo) | `bkit challenge merge`: findings appended as task blocks in new last groups within the caps (7 findings → groups of 3, 3 and 1), one `Derived Test Matrix` row per appended task, dedupe by `path:line`, an open earlier task reopened vs a done one getting a new task, `LOW` → a `low-severity` deferral row (a failed append leaves the plan unchanged), overflow → `pause` writing nothing, exit 23 for a block that fails `plan-check`; a structured finding whose `title`, `cls`, `doneWhen` or a `tests` entry holds a line break refused naming the finding and field. `bkit challenge gate`: sizes the diff, fetches `origin/dev` first, writes a `challenge-gate` row. |
 | `commands/workflow/locks.test.ts` | Unit (boundary: real temp git repo + linked worktree) | `bkit locks acquire / release`: month bucket (existing, UTC new, split refused); live vs reclaimable holder (a step in the last 30 minutes is live and refused with exit 8 and `heldBy`, a taken lock prints `heldBy` null; an idle, finished or log-less holder is reclaimed whatever the lock file's age; worktree copy first); ship's lock in the main checkout from its worktree; only the workflow kind; release by token, never another owner's; `acquire` prints `route` `go` with an empty `message` when it takes the lock, `route` `stop` with a `message` naming the holder on a live one, and nothing on stdout when the month bucket is split. |
 | `commands/workflow/workflows.test.ts` | Unit (boundary: real temp git repos + bare remote) | `bkit workflows start / fail / handover / close / promote / links`: run opened vs resumed (a run still resumes after another workflow's run), `--lock-held`, `lastDoneStep` and, as `openDecision` with its `status` and `sourceChanged` (the `Source changed` header) on a resume, the run's own `OPEN` decision or a `DECIDED` / `ASSUMED` one that no `build-decision` row names; failed row, own-lock release, rebase or merge abort only when in progress, sentinel clearing, `handoverNeeded` (incl. debug `SOAK`), nothing changed without `--token` (empty values count as absent), labels, failure comment from `--error-file`; handover `--push` (the record committed and pushed on the feature branch with or without a handover, open PR → 9 with no link, pushed → linked comment, the named worktree committed in, and from `dev` only the logs and ledgers landed through a throwaway checkout with the checkout's code untouched, then the landed copies handed back so local `dev` fast-forwards onto them while a staged ledger stays and is named, a refusal → 10 with the record kept) and ship `--flush` (one FAILED commit landed on `dev` from a throwaway checkout with the main checkout untouched, nothing-to-commit, the named worktree's logs carried, a refused flush published through a `ship-failed/{FID}` PR, exit 10 only when the PR path fails too); ship `close --flush` (one DONE commit on `dev` carrying the book, then the owned worktree and branch removed; an unowned worktree and its branch left in place); compliance rows before counter + outcome rows, one `run.parentSha` on all three, a `build-plan-convert` row → `plan.source` `converted` with groups, plan tasks counted from task headings, unwritable stats never failing the close, ship size + coverage, artifact links, `--message` commit with the exact-match auto-route marker and `--verbose-ci-local`, `--record-step`, `--outbox` + `--number` comment; promote (`--resolve`, exit 12, archive of a changed canonical, anchor from the base commit, bkit release and outdated warning in the anchor, the plan copied alone, a stray `{FID}-plan-N.md` neither copied nor archived); links (comment, branch name in URLs); `close --ending=held --publish=false` writing `ending: held` and `publish: false` on the `workflow-done` row (default `done`, an unknown ending refused) and passing `publish` into the summary; `handover` prints `route` `stop` on every exit it reaches (0, 9 with ship's push skipped on an open PR, 10, 11, `--ref`) and the not-pushed line as `message` on each non-zero one. |
-| `commands/workflow/worktrees.test.ts`, `worktrees.integration.test.ts` | Unit and Integration (real git remote) | `bkit worktrees setup / remove`: adopt in place, debug / ship branch rules, mint off a freshly fetched `origin/dev` — always for design / plan, and off local `dev` when it is ahead for build / debug (diverged → `origin/dev`, narrated) —, a resumed design / plan branch carrying unpushed `dev` commits refused (7) while the same worktree resumes for build, resume rebase onto the same base + sentinel, a failed ship's uncommitted leftovers committed before that rebase (logs dev already holds dropped, copied entries never committed; a refused commit → exit 9), `direnv allow` only for a `.envrc` identical to the main checkout's (direnv stubbed on PATH), `bkit.workflows.worktree.copy` list with missing entries narrated, install in every workflow (design / plan included), install failure vs could-not-run exits, `--detect` taking mint vs adopt from the runtime (exclusive with `--worktrees`), ownership marker, removal only of a marked worktree, `--branch` deleting the local and remote branch unless another worktree holds it (`branchBlockedBy`); debug in place on `dev` writes the shared-checkout record (`startSha`, `aheadAtStart`) and exits 13 when another feature's live run holds the checkout; a ship of `dev` / `main` and `main` for design / plan / build exit 7. |
+| `commands/workflow/worktrees.test.ts`, `worktrees.integration.test.ts` | Unit and Integration (real git remote) | `bkit worktrees setup / remove`: adopt in place, adopt the linked worktree a host already made on `feat/{FID}` for every workflow (no second `git worktree add`; `worktreePath` and `logDir` point into it; a session on another branch still mints), debug / ship branch rules, mint off a freshly fetched `origin/dev` — always for design / plan, and off local `dev` when it is ahead for build / debug (diverged → `origin/dev`, narrated) —, a resumed design / plan branch carrying unpushed `dev` commits refused (7) while the same worktree resumes for build, resume rebase onto the same base + sentinel, a failed ship's uncommitted leftovers committed before that rebase (logs dev already holds dropped, copied entries never committed; a refused commit → exit 9), `direnv allow` only for a `.envrc` identical to the main checkout's (direnv stubbed on PATH), `bkit.workflows.worktree.copy` list with missing entries narrated, install in every workflow (design / plan included), install failure vs could-not-run exits, `--detect` taking mint vs adopt from the runtime (exclusive with `--worktrees`), ownership marker, removal only of a marked worktree, `--branch` deleting the local and remote branch unless another worktree holds it (`branchBlockedBy`); debug in place on `dev` writes the shared-checkout record (`startSha`, `aheadAtStart`) and exits 13 when another feature's live run holds the checkout; a ship of `dev` / `main` and `main` for design / plan / build exit 7. |
 | `commands/workflow/shared-checkout.integration.test.ts` | Integration (real git, real bare `origin`) | A debug run in place on `dev` with foreign work in flight (a modified file, an untracked one, a staged one, a pre-existing ledger row, a local commit): the push sends only the run's commits (replayed as copies onto `origin/dev` when local `dev` is ahead or `origin/dev` moved, a plain push when level, a foreign commit never; with the run's record gone, or another run's newer record present, the push refuses with exit 20 or selects its own `--fid` record), and the run's commits, close commit and roadmap mirror row carry only its own paths and rows, leaving foreign staged, untracked and `.bkit/issues.jsonl` changes behind. |
 | `commands/workflow/branches.test.ts` | Unit (boundary: real temp git repos) | `bkit branches rebase / anchor-stamp / anchor-read / push / sync / sync-dev`: ledger union byte-identical to `merge=union`, lockfile from the rebase target then regenerated, refuse-before-mutate; idempotent anchor stamp, `--base-ref` override, `bkitVersion` / `bkitLatest` stamped and the visible outdated line written then dropped after an upgrade, the outdated stamp prettier-clean and stable on re-stamp, empty `bkitLatest` when unknown; `--against` skip exits; one `git push`, lease only off `dev`/`main`, `--require-ci`, abort guard + `--open-pr`; a `--require-ci` feature push merging `origin/dev`'s ledger rows first (`mergedDev: true`), pushing as-is when `dev` has not moved or without `--require-ci`, and exiting 11 with nothing pushed on a code conflict; docs-from-dev merge committed as `chore({FID}): merge dev` with no skip token, also when only a ledger outside `docs/` moved, a declared `bkit:generate` run and committed after it (25 when it fails); `sync --merge` (ship Step 4) merging `origin/dev` into the checked-out branch: a clean merge committed with the branch as first parent, `current` when `dev` has not moved with a stale sentinel cleared, uncommitted work carried in its own commit first, a conflicted lockfile taken from `dev`, conflicts outside the ledgers and lockfile left in progress with exit 24 until `git add` and a re-run complete the merge, a failed ledger resolution aborting the merge with the sentinel written (11), `bkit:generate` committed after the merge, `--file` writing one `engine-action` merge row, usage (2) and detached (5) refusals; `regenerate` (ship Steps 3 and 10) committing only the paths `bkit:generate` changed while the run's own uncommitted files stay uncommitted, a rewrite and a delete committed, `--attempt` giving the `fix({FID}): regenerate attempt {N}` subject, `--file` writing one `engine-action` regenerate row, `unchanged` when nothing changed, `undeclared` with no or an empty script, 25 when `bkit:generate` fails or rewrites a file that was already uncommitted, usage (2) for `--attempt=0` and on `dev`; `rebase --file` writing one `engine-action` rebase row for a completed rebase and none for a refused one; `sync-dev` fast-forwarding local `dev` without a checkout, moving the checkout and installing only when on `dev` and `dev` moved (16 on a failed install), listing local-only `dev` commits with the publish command and pushing none (10 on a failed fetch); a refused rebase whose `--abort` fails reports `aborted: false` and `ABORT FAILED`. `bkit branches land`: workflow refusal, stray main-checkout artifacts (17), squash off `origin/dev` → `design DONE` commit pushed + audited + local `dev` fast-forwarded, staged files in the main checkout left staged, local-only `dev` commits left unpushed (`localDev: skipped`), another checked-out branch kept with only the `dev` pointer moved, `dev` moving under the push rebuilt and retried (`pushAttempts: 2`) or exhausted (8, branch kept, throwaway worktree gone), non-doc files refused (17) — a branch carrying unpushed `dev` commits additionally named as such, with the unpushed count and `git push origin dev` —, refused `dev` push → PR shape handing the PR to MCP (80, stage `open`) after pushing the roadmap commit (cloud, and on a laptop from the worktree holding the branch), refused PR merge → `origin/dev` merged into the branch locally and pushed (no server-side update-branch) then merged, a CLOSED PR stopping at once (17), uncommitted files in the feature worktree keeping the worktree and branch (`worktree.reason: uncommitted`), branch work missing from `origin/dev` stopping (18) with branch and worktree kept; `landBackoffMs` schedule (2s doubling, 30s cap, jitter, 3min total); the full local close is also run from the workflow in `close-squash.integration.test.ts`. `scan-diff --disabled-tests`: added disabling markers exit 1 with each hit's `file:line` and test name; no unmatched candidates exits 0 with an empty `disabled`. Exact assertion moves consume each added occurrence once and require unchanged test context across files; rewrites pair only within the same file and test. Unchanged duplicates and unrelated additions cannot conceal removals. Removed assertions retain their original test names; deleted files use old line numbers. Comments, non-assertion deletions and quoted markers in docs or source files are excluded. |
 | `commands/land.test.ts` | Unit (boundary: real temp git repos + bare remote) | `pushToDev`, the one routine every `dev` write goes through: commit built in a throwaway `origin/dev` checkout and pushed as `dev`, the main checkout untouched, local-only `dev` commits never pushed, `dev` moving under the push rebuilt and retried or exhausted, any other refusal handed to the caller's `refused` hook with the throwaway checkout still there, fetch failure, a throwing build; the throwaway checkout gone on every path; `landBackoffMs` schedule. |
