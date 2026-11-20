diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index e5603df56..9665d176e 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -128,8 +128,8 @@ Rendering can be re-run: the source carries every wired variant, so a tracker sw
   - **If** the server refuses (any other `[remote rejected]`, `returned error: 403`, a `GH0nn` rule) → take the caller's refused route.
   - **If** the push gets no server answer (network, credentials) → return to the caller. Nothing landed, and there is no PR.
   - `bkit branches land`: design / plan close (`merge --squash -X ours {BRANCH}`, `docs({FID}): {phase} DONE bkit [skip ci]`); refused → PR merge.
-  - `bkit workflows close --flush`: ship close, book carried in (`docs({FID}): ship DONE bkit [skip ci]`); refused → `ship-close/{FID}` PR.
-  - `bkit workflows handover --flush` (ship Failure Path) / `--push` from `dev` / `main` / detached (design / plan / build / debug Failure Path): `chore({FID}): {phase} FAILED bkit [skip ci]`; `--push` refused → tree keeps it; `--flush` → `ship-failed/{FID}` PR. From a `dev` / `main` / detached checkout only the run's own record is carried (§ Failure Path), then handed back.
+  - `bkit workflows close --flush`: ship close, book carried in (`docs({FID}): ship DONE bkit [skip ci]`); refused → `ship-close/{FID}` PR (a branch left on origin by an earlier attempt is merged into the record, and its open PR reused).
+  - `bkit workflows handover --flush` (ship Failure Path) / `--push` from `dev` / `main` / detached (design / plan / build / debug Failure Path): `chore({FID}): {phase} FAILED bkit [skip ci]`; `--push` refused → tree keeps it; `--flush` → `ship-failed/{FID}` PR (a branch left on origin by an earlier attempt is merged into the record, and its open PR reused). From a `dev` / `main` / detached checkout only the run's own record is carried (§ Failure Path), then handed back.
   - `bkit roadmap mirror`: build / debug; an attempt that committed nothing never counts as mirrored.
   - `bkit branches land` reads `RUNTIME_DEVPUSHES` from the run's `runtime-resolved` row (no row → fresh detect). It picks the default `{BRANCH}` (`true` → `feat/{FID}`, `false` → the current branch) and gates only what surrounds the landing: stray-artifact check, local `dev` fast-forward, worktree + `feat/{FID}` teardown.
 - **PR-mode design / plan closes must push before `bkit prs open`:** PR creation and `gh pr merge` act on the remote, so a close commit that is only committed locally never enters the PR and never reaches `dev`. The direct push lands one commit built off `origin/dev` and is unaffected; the PR branch produces two local commits (`chore({FID}): close-workflow` carrying the `status.jsonl` rows and close telemetry, then `docs({FID}): {phase} roadmap update` carrying `.bkit/issues.jsonl` + `docs/roadmap.md`) and needs an explicit `bkit branches push --mode=feature` to publish them. The push sits after the stray guard, so nothing unvetted is published, and before `bkit prs open --existing=reuse`. The build / debug close already pushes the feature branch. Leaving the push out silently loses every design / plan close on the PR path.
@@ -147,7 +147,7 @@ Rendering can be re-run: the source carries every wired variant, so a tracker sw
 - **Host skill mirrors are in the `--scope=full` bookkeeping pathspec:** `npx skills remove` deletes `.claude/skills` / `.cursor/skills` / `.opencode/skills` alongside `.agents/skills/<name>`, so the close staging must be able to carry those deletions. `bkit ledgers commit` builds its pathspec via `git ls-files -z --cached --others --exclude-standard`, so an unmatched glob is empty output (never fatal) and `--cached` still emits a tracked-but-deleted mirror, so the deletion stages cleanly. A claude-only consumer with no `.cursor` / `.opencode` mirror sweeps zero for those globs rather than aborting. Without them the prune commit holds only `.agents/skills` + `skills-lock.json` and the mirror deletions leak into the working tree, where the next unrelated staging sweeps them into a foreign commit. A tracked `*.bkit-lock` that was deleted is staged as a deletion too, unless the run's shared-checkout record lists it, and an untracked or changed one never is.
 - **Ship Step 7 never prunes `bkit-*` skills:** they are bkit render output (Codex host workflow entry points), absent from `.agents/skills.md`. `bkit skills prune` keeps every `bkit-*` skill; without that guard every ship uninstalls them. A missing `.agents/skills.md` skips the prune with a warning (`skipped: "no-registry"`) rather than uninstall everything; a failed uninstall is warned and listed in `failed`. Both exit 0: pruning is housekeeping, so the ship carries on and still closes.
 - **Staging routes through `bkit ledgers commit`, never a shell pathspec:** a pathspec rebuilt inline per block with unquoted word-splitting and an `ls docs/plans/*/logs/*/*.jsonl docs/*.jsonl .bkit/*.jsonl` glob aborts under zsh when unmatched — silently dropping every ledger in a fresh consumer repo, and (worse) swallowing a failed `git add` into a false "nothing to commit" success, since nothing in these blocks sets `set -e`. `bkit ledgers commit` builds the pathspec with `git ls-files` — an unmatched glob is empty output, never an abort — and stages / commits it via `--pathspec-from-file --pathspec-file-nul` rather than a re-interpolated shell string. It refuses to reach `commit` when that list is empty (exit 6): `git commit --pathspec-from-file=<empty file>` does not commit nothing, it silently commits whatever is already staged in the index. Ship's markdown stages through it at the Step 8 bookkeeping commit and the Step 12 fix commit, each stopping the step on failure (`.bkit/core/engine/audits/workflows/ship-invariants.test.ts`); the Failure Path flush and the Close flush run the same code inside `bkit workflows handover --flush` / `bkit workflows close --flush`. `commands/workflow/ledgers.test.ts` covers the command itself.
-- **Failure Path never calls `bkit runtime assert`:** its non-zero route would loop into itself. `workflows fail` / `handover --push` / `--flush` behave identically in every runtime: record written in the run's tree, then pushed on the feature branch or landed via the throwaway `origin/dev` checkout; refused → `--flush` opens a `ship-failed/{FID}` PR, else it stays in the run's tree, lost in a cloud container.
+- **Failure Path never calls `bkit runtime assert`:** its non-zero route would loop into itself. `workflows fail` / `handover --push` / `--flush` behave identically in every runtime: record written in the run's tree, then pushed on the feature branch or landed via the throwaway `origin/dev` checkout; refused → `--flush` opens a `ship-failed/{FID}` PR (building on a branch an earlier attempt left, reusing its open PR), else it stays in the run's tree, lost in a cloud container.
 - **Ship's dev commits carry the book:** ship books in `{WORKTREE_PATH}` (`BOOK_ROOT`); a failed ship never merges. Close and Failure Path copy the book's `*.md` logs the throwaway checkout lacks and union ledgers line-wise (`bkit ledgers union` code; each tree holds rows the other lacks). `handover --worktree=` names the book; default = current tree.
 - **`context-fetch` blocks are selected by ordinal, not by `context` + name:** two blocks may legitimately share a pair — the context-coverage advisory tells consumers a second test lane needs its own `context=e2e` block, and naming is optional — and matching on the pair splices both bodies into one block and writes them to one artifact path. `bkit context list-blocks` numbers every block (`idx`) in one enumeration pass and `bkit context run-block --idx=` runs exactly that one, so selection is total; the artifact path only grows the ordinal when the pair actually repeats, keeping the documented `context-<context>-<name>-<attempt>.md` shape for every single-block context.
 - **Unknown `context-fetch` context is never run:** `fetch` / `run-block` report `not-run` with the bad `context=` named. Running it would make a paid API call in the `web` case and write its output under an empty prefix — a path the `context-*` glob cannot match, dropping the artifact from `artifacts` and from `FETCH_VERDICT`. The narration and the behaviour agree.
@@ -822,7 +822,7 @@ Every command has a `🤖 Failure Path` section before Step 1. Any step, tool or
 
 5. **STOP** — no downstream steps.
 
-**Ship exception:** no separate abort commit, no second push. After the optional handover subagent, `bkit workflows handover --workflow=ship --flush --worktree=` carries the book (handover, deferred-sweep, ledger rows) into a throwaway `origin/dev` checkout → one `chore({FID}): ship FAILED bkit [skip ci]` commit and one push to `dev` (`dev` moved → rebuilt and pushed again; refused → `ship-failed/{FID}` PR; else the record stays in `BOOK_ROOT`). It never touches the open PR's validated head, so the open-PR guard does not apply, and the handover survives the branch prune. The comment is posted only when `handoverNeeded`, and linked only where the flush pushed.
+**Ship exception:** no separate abort commit, no second push. After the optional handover subagent, `bkit workflows handover --workflow=ship --flush --worktree=` carries the book (handover, deferred-sweep, ledger rows) into a throwaway `origin/dev` checkout → one `chore({FID}): ship FAILED bkit [skip ci]` commit and one push to `dev` (`dev` moved → rebuilt and pushed again; refused → `ship-failed/{FID}` PR, built on a branch an earlier attempt left and reusing its open PR; else the record stays in `BOOK_ROOT`). It never touches the open PR's validated head, so the open-PR guard does not apply, and the handover survives the branch prune. The comment is posted only when `handoverNeeded`, and linked only where the flush pushed.
 
 `/bkit-design` and `/bkit-plan` run no handover subagent (no max-retry loop); they still keep the record.
 
@@ -1125,7 +1125,7 @@ The following table describes the local discovery route and shared step mechanic
 **Close Workflow records the merge-CI verdict and publishes on every runtime:**
 
 - The `ship-merge-ci` row (verdict + reason) is written before a red result routes to **Failure Path**. A red merge is recorded, never inferred from a missing close row.
-- Close commit built in a throwaway `.worktrees/_land-{FID}` off `origin/dev` (book's logs copied, ledgers via `bkit ledgers union`) → push `dev`; `dev` moved → rebuilt, pushed again; refused → `ship-close/{FID}` PR, squash subject `[skip ci]`; a PR GitHub refuses to merge stays open for a human, worktree kept.
+- Close commit built in a throwaway `.worktrees/_land-{FID}` off `origin/dev` (book's logs copied, ledgers via `bkit ledgers union`) → push `dev`; `dev` moved → rebuilt, pushed again; refused → `ship-close/{FID}` PR, squash subject `[skip ci]`, built on a `ship-close/{FID}` branch an earlier attempt left (its tip merged in, its open PR reused); a PR GitHub refuses to merge stays open for a human, worktree kept.
 - Cleanup runs only after the close record reaches `dev`. The shared landed comparison checks file content, mode and type, and cleanup separately proves index and working-tree state. Dirty, unlanded, changed or unreadable evidence preserves the worktree/ref and reports the reason; a local ref deletion is bound to the inspected tip.
 - The remote feature ref is deleted only at its proved landed tip, through a lease-guarded push, and retained when origin refuses it. This does not block close-record landing or lock release. GitHub's repository-managed automatic branch deletion is a separate setting outside this guarantee.
 - `bkit ledgers union` never carries `.bkit/issues.jsonl`: the `SHIPPED` row is pre-merge, so unioning it into `dev` after a pre-merge failure would mark an unmerged feature shipped.
@@ -1351,7 +1351,7 @@ Ship's docs sync, summaries, `SHIPPED` roadmap row and skill removals ride the P
 
 - Ship pushes it to `dev`.
 - **If** `dev` moved → ship rebuilds the commit and pushes again.
-- **If** the push is refused → ship opens a `ship-close/{FID}` PR.
+- **If** the push is refused → ship opens a `ship-close/{FID}` PR, or reuses the open one; a `ship-close/{FID}` branch already on origin is merged into the new record first.
 
 ## Worktree Model
 
diff --git a/.bkit/core/engine/commands/workflow/branches.ts b/.bkit/core/engine/commands/workflow/branches.ts
index e1868e15a..d957bd5ed 100644
--- a/.bkit/core/engine/commands/workflow/branches.ts
+++ b/.bkit/core/engine/commands/workflow/branches.ts
@@ -2919,9 +2919,11 @@ function revLines(root: string, rev: string, p: string): string[] {
  * Put back the `.jsonl` rows `branch` added that the squash dropped: `-X ours`
  * keeps dev's side of a conflicting hunk, and a ledger git does not union-merge
  * (a consumer's `.bkit/friction.jsonl`) loses the branch's rows there. Each
- * missing row is appended to the staged file.
+ * missing row is appended to the staged file. `branch` is any revision; it runs
+ * while a merge is open (`MERGE_HEAD` set), as the merge base with a merged tip
+ * is the tip itself once the merge commit exists.
  */
-function restoreBranchRows(dir: string, branch: string): void {
+export function restoreBranchRows(dir: string, branch: string): void {
   const base = git(dir, ["merge-base", "HEAD", branch]);
   if (base === null) return;
   const changed = (
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index ef79eddbf..3231ab7fd 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -2430,21 +2430,38 @@ const startedThenFailed = (workflow: string, start: number) =>
     { type: "workflow-failed", workflow, at: new Date(start + 500).toISOString() },
   ]);
 
+/** What a `ghStub` does beyond its default: an open PR throughout, `pr create` and `pr merge` succeeding. */
+type GhOptions = {
+  /** `pr list` answers `[]` until `pr create` has run. */
+  openAfterCreate?: boolean;
+  /** `pr create` exits 1. */
+  createFails?: boolean;
+  /** `pr merge` exits 1, so the PR stays open. */
+  mergeFails?: boolean;
+};
+
 /** A gh on PATH that records its calls and answers one open PR on `head`, merging on request. */
-function ghStub(head: string, base: "dev" | "none" = "dev") {
+function ghStub(head: string, base: "dev" | "none" = "dev", options: GhOptions = {}) {
   const bin = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-workflows-gh-")));
   dirs.push(bin);
   const baseField = base === "dev" ? ',"baseRefName":"dev"' : "";
+  const open = `[{"number":9,"url":"https://github.com/o/r/pull/9","state":"OPEN"${baseField},"headRefName":"${head}"}]`;
   fs.writeFileSync(
     path.join(bin, "gh"),
     [
       "#!/bin/sh",
       `echo "$*" >> "${bin}/calls"`,
       'case "$1 $2" in',
-      '  "pr create") exit 0 ;;',
-      `  "pr list") echo '[{"number":9,"url":"https://github.com/o/r/pull/9","state":"OPEN"${baseField},"headRefName":"${head}"}]' ;;`,
+      options.createFails
+        ? '  "pr create") exit 1 ;;'
+        : `  "pr create") : > "${bin}/created"; exit 0 ;;`,
+      options.openAfterCreate
+        ? `  "pr list") if [ -f "${bin}/created" ]; then echo '${open}'; else echo '[]'; fi ;;`
+        : `  "pr list") echo '${open}' ;;`,
       `  "pr view") if [ -f "${bin}/merged" ]; then echo '{"number":9,"state":"MERGED","baseRefName":"dev","mergeCommit":{"oid":"abc"}}'; else echo '{"number":9,"state":"OPEN"${baseField}}'; fi ;;`,
-      `  "pr merge") : > "${bin}/merged"; exit 0 ;;`,
+      options.mergeFails
+        ? '  "pr merge") echo "merge blocked" >&2; exit 1 ;;'
+        : `  "pr merge") : > "${bin}/merged"; exit 0 ;;`,
       "esac",
       "",
     ].join("\n"),
@@ -2457,6 +2474,28 @@ function ghStub(head: string, base: "dev" | "none" = "dev") {
   return { bin, calls };
 }
 
+/**
+ * A branch an earlier attempt left on the bare `remote`: one commit on `branch` from the remote's
+ * `dev` carrying `files`, pushed from a scratch clone. Returns the tip.
+ */
+function leftBranch(remote: string, branch: string, files: Record<string, string>) {
+  const clone = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-workflows-left-")));
+  dirs.push(clone);
+  git(clone, "clone", "-q", remote, ".");
+  git(clone, "config", "user.email", "t@t");
+  git(clone, "config", "user.name", "t");
+  git(clone, "checkout", "-q", "-b", branch, "origin/dev");
+  for (const [rel, body] of Object.entries(files)) write(clone, rel, body);
+  git(clone, "add", "-A");
+  git(clone, "commit", "-qm", "chore: an earlier attempt's record [skip ci]");
+  git(clone, "push", "-q", "origin", `HEAD:refs/heads/${branch}`);
+  return git(clone, "rev-parse", "HEAD");
+}
+
+/** A pre-receive hook that refuses only pushes to dev. */
+const DEV_ONLY_HOOK =
+  '#!/bin/sh\nwhile read o n ref; do [ "$ref" = refs/heads/dev ] && { echo "dev is protected" >&2; exit 1; }; done\nexit 0\n';
+
 async function withGhOnPath<T>(bin: string, fn: () => Promise<T>): Promise<T> {
   const saved = process.env.PATH;
   process.env.PATH = `${bin}${path.delimiter}${saved ?? ""}`;
@@ -2699,6 +2738,148 @@ describe("bkit workflows handover", () => {
     expect(create[0]).not.toContain("ship DONE");
   });
 
+  /** A remote whose dev refuses pushes, after `prepare` ran against it while dev still took them. */
+  function refusedAfter(prepare: (remote: string) => void) {
+    const s = withDevRemote();
+    prepare(s.remote);
+    fs.writeFileSync(path.join(s.remote, "hooks", "pre-receive"), DEV_ONLY_HOOK, { mode: 0o755 });
+    return s;
+  }
+  const flush = (wt: string, ...extra: string[]) =>
+    run(wt, wf("handover", "ship", `--month=${M}`, "--flush", ...extra));
+  const branchRows = (remote: string, branch: string) =>
+    git(remote, "show", `${branch}:${REL}/status.jsonl`)
+      .split("\n")
+      .filter(Boolean)
+      .map((l) => JSON.parse(l) as Record<string, unknown>);
+  const isAncestor = (remote: string, a: string, b: string) =>
+    spawnSync("git", ["merge-base", "--is-ancestor", a, b], { cwd: remote }).status === 0;
+  const earlier = {
+    [`${REL}/status.jsonl`]: jsonl([
+      { type: "workflow-failed", workflow: "ship", note: "earlier" },
+    ]),
+    [`${REL}/ship-earlier.md`]: "# Earlier record\n",
+  };
+
+  it("--flush refused by dev twice for one FID publishes the second record through a PR", async () => {
+    const { remote, wt } = devOnlyRefused();
+    const gh = ghStub(`ship-failed/${FID}`, "dev", { openAfterCreate: true, mergeFails: true });
+    const first = await withGhOnPath(gh.bin, () => flush(wt));
+    expect(first.code).toBe(0);
+    const firstTip = git(remote, "rev-parse", `ship-failed/${FID}`);
+    write(
+      wt,
+      `${REL}/status.jsonl`,
+      jsonl([{ type: "workflow-failed", workflow: "ship", note: "second" }]),
+    );
+    const second = await withGhOnPath(gh.bin, () => flush(wt));
+    expect(second.code, second.err).toBe(0);
+    expect(second.json).toMatchObject({ pushed: true, ref: `ship-failed/${FID}` });
+    const tip = git(remote, "rev-parse", `ship-failed/${FID}`);
+    expect(tip).not.toBe(firstTip);
+    expect(isAncestor(remote, firstTip, tip)).toBe(true);
+    // The first record's row (no note) and the second's both sit on the branch.
+    expect(branchRows(remote, `ship-failed/${FID}`).map((r) => r.note)).toEqual(
+      expect.arrayContaining([undefined, "second"]),
+    );
+    expect(gh.calls().filter((c) => c.startsWith("pr create"))).toHaveLength(1);
+  });
+
+  it("--flush refused by dev with ship-failed left on origin and no PR opens one PR on that branch", async () => {
+    const { remote, wt } = refusedAfter((rm) => leftBranch(rm, `ship-failed/${FID}`, earlier));
+    write(
+      wt,
+      `${REL}/status.jsonl`,
+      jsonl([{ type: "workflow-failed", workflow: "ship", note: "new" }]),
+    );
+    const gh = ghStub(`ship-failed/${FID}`, "dev", { openAfterCreate: true });
+    const r = await withGhOnPath(gh.bin, () => flush(wt));
+    expect(r.code, r.err).toBe(0);
+    const create = gh.calls().filter((c) => c.startsWith("pr create"));
+    expect(create).toHaveLength(1);
+    expect(create[0]).toContain(`--head ship-failed/${FID}`);
+    expect(git(remote, "show", `ship-failed/${FID}:${REL}/ship-earlier.md`)).toBe(
+      "# Earlier record",
+    );
+    const notes = branchRows(remote, `ship-failed/${FID}`).map((x) => x.note);
+    expect(notes).toEqual(expect.arrayContaining(["earlier", "new"]));
+  });
+
+  it("--flush refused by dev with a squash-merged ship-failed tip left on origin lands the new record", async () => {
+    const { remote, wt } = refusedAfter((rm) => {
+      leftBranch(rm, `ship-failed/${FID}`, earlier);
+      // The same change reaches dev as a separate commit, as a squash merge leaves it.
+      const clone = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-workflows-sq-")));
+      dirs.push(clone);
+      git(clone, "clone", "-q", rm, ".");
+      git(clone, "config", "user.email", "t@t");
+      git(clone, "config", "user.name", "t");
+      git(clone, "checkout", "-q", "dev");
+      for (const [rel, body] of Object.entries(earlier)) write(clone, rel, body);
+      git(clone, "add", "-A");
+      git(clone, "commit", "-qm", "chore: squash of the earlier record");
+      git(clone, "push", "-q", "origin", "dev");
+    });
+    write(
+      wt,
+      `${REL}/status.jsonl`,
+      jsonl([{ type: "workflow-failed", workflow: "ship", note: "new" }]),
+    );
+    const gh = ghStub(`ship-failed/${FID}`, "dev", { openAfterCreate: true });
+    const r = await withGhOnPath(gh.bin, () => flush(wt));
+    expect(r.code, r.err).toBe(0);
+    const diff = git(remote, "diff", "dev", `ship-failed/${FID}`, "--name-only").split("\n");
+    expect(diff).toContain(`${REL}/status.jsonl`);
+    expect(diff).not.toContain(`${REL}/ship-earlier.md`);
+  });
+
+  it("--flush refused by dev does not merge a leftover tip that changes code", async () => {
+    let tip = "";
+    const { remote, wt } = refusedAfter((rm) => {
+      tip = leftBranch(rm, `ship-failed/${FID}`, { ...earlier, "src/app.ts": "export {};\n" });
+    });
+    const gh = ghStub(`ship-failed/${FID}`, "dev", { openAfterCreate: true });
+    const r = await withGhOnPath(gh.bin, () => flush(wt));
+    expect(r.code).toBe(10);
+    expect(r.err).toContain(`ship-failed/${FID}`);
+    expect(r.err).toContain("src/app.ts");
+    expect(git(remote, "rev-parse", `ship-failed/${FID}`)).toBe(tip);
+  });
+
+  it("--flush refused by dev with gh pr create failing names the pushed ship-failed branch", async () => {
+    const { remote, wt } = devOnlyRefused();
+    const gh = ghStub(`ship-failed/${FID}`, "dev", { createFails: true });
+    const r = await withGhOnPath(gh.bin, () => flush(wt));
+    expect(r.code).toBe(10);
+    expect(git(remote, "rev-parse", "--verify", `ship-failed/${FID}`)).toMatch(/^[0-9a-f]{40}$/);
+    expect(r.err).toContain(`pr create failed for ship-failed/${FID}`);
+  });
+
+  it("--flush refused by dev links the handover comment at the pushed commit when the PR did not merge", async () => {
+    const { remote, wt } = devOnlyRefused();
+    write(wt, `${REL}/ship-handover.md`, "# Handover\n");
+    const gh = ghStub(`ship-failed/${FID}`, "dev", { mergeFails: true });
+    const r = await withGhOnPath(gh.bin, () => flush(wt, "--owner-repo=o/r"));
+    expect(r.json).toMatchObject({ pushed: true, ref: `ship-failed/${FID}` });
+    const tip = git(remote, "rev-parse", `ship-failed/${FID}`);
+    expect(r.json.comment).toContain(`/blob/${tip}/`);
+    expect(r.json.comment).not.toContain("/blob/ship-failed/");
+  });
+
+  it("--flush refused by dev keeps the unmerged handover link readable after the branch is deleted", async () => {
+    const { remote, wt } = devOnlyRefused();
+    write(wt, `${REL}/ship-handover.md`, "# Handover\n");
+    const gh = ghStub(`ship-failed/${FID}`, "dev", { mergeFails: true });
+    const r = await withGhOnPath(gh.bin, () => flush(wt, "--owner-repo=o/r"));
+    const sha = /\/blob\/([0-9a-f]{40})\//.exec(String(r.json.comment))?.[1];
+    expect(sha).toBeDefined();
+    git(remote, "update-ref", "-d", `refs/heads/ship-failed/${FID}`);
+    const read = spawnSync("git", ["cat-file", "-e", `${sha}:${REL}/ship-handover.md`], {
+      cwd: remote,
+    });
+    expect(read.status).toBe(0);
+  });
+
   describe("route and message: every exit the handover reaches ends the run as a stop", () => {
     const notPushed = (tree: string) =>
       `Record not pushed: the handover commit is only in ${tree}, and the links in this run's comments open once it is pushed`;
@@ -3290,6 +3471,22 @@ describe("bkit workflows close --flush (ship)", () => {
       );
     });
 
+    it("a second refused close for one FID reuses the open ship-close PR", async () => {
+      const { remote, wt, close, bin, calls } = refusedDev("dev");
+      leftBranch(remote, `ship-close/${FID}`, {
+        [`${REL}/ship-earlier.md`]: "# Earlier close\n",
+      });
+      const r = await withGh(bin, () => run(wt, close));
+      expect(r.code, r.err).toBe(0);
+      expect(r.json.landed).toMatchObject({ ref: `ship-close/${FID}` });
+      expect(calls().filter((c) => c.startsWith("pr create"))).toEqual([]);
+      const tip = git(remote, "rev-parse", `ship-close/${FID}`);
+      expect(calls().find((c) => c.startsWith("pr merge"))).toContain(`--match-head-commit ${tip}`);
+      expect(git(remote, "show", `ship-close/${FID}:${REL}/ship-earlier.md`)).toBe(
+        "# Earlier close",
+      );
+    });
+
     it("closePr refuses when the PR base is unknown", async () => {
       const { wt, close, bin, calls } = refusedDev("none");
       const r = await withGh(bin, () => run(wt, close));
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index 81b2fe615..7188d21b4 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -72,7 +72,14 @@ import {
   type FlagValue,
   type RunContext,
 } from "../lib.js";
-import { anchorBkitStatus, pushBranch, readAnchor, stampAnchor } from "./branches.js";
+import { minPushOutside, minPushPathspecs } from "../ci/ci.js";
+import {
+  anchorBkitStatus,
+  pushBranch,
+  readAnchor,
+  restoreBranchRows,
+  stampAnchor,
+} from "./branches.js";
 import {
   AUTO_LABEL,
   AUTO_ROUTE_SUFFIX,
@@ -916,7 +923,7 @@ async function landFailedRecord(
   code: number;
   pushed: boolean;
   ref: string | null;
-  /** Where the record can be read: `dev` once a `ship-failed/{FID}` PR merged, as the merge deletes the branch. */
+  /** Where the record can be read: `dev` once a `ship-failed/{FID}` PR merged (the merge deletes the branch), else the pushed commit's SHA. */
   linkRef?: string | null;
   skipped: string | null;
   sha?: string;
@@ -939,7 +946,7 @@ async function landFailedRecord(
   const startMs = starts.length > 0 ? Math.max(...starts) : NaN;
   let carried: Carried | undefined;
   let res: DevPush;
-  let pr: { ref: string; via: string } | { failed: string } | null = null;
+  let pr: { ref: string; via: string; sha: string } | { failed: string } | null = null;
   let refusal = "";
   try {
     res = await pushToDev({
@@ -1003,7 +1010,7 @@ async function landFailedRecord(
     case "landed":
       return { code: EXIT.OK, pushed: true, ref: DEV, skipped: null, sha: res.sha, carried };
     case "refused": {
-      const landedPr = pr as { ref: string; via: string } | { failed: string } | null;
+      const landedPr = pr as { ref: string; via: string; sha: string } | { failed: string } | null;
       if (landedPr === null) return stop(EXIT_PUSH_FAILED, `dev refused the push: ${res.stderr}`);
       if ("failed" in landedPr)
         return stop(
@@ -1014,7 +1021,7 @@ async function landFailedRecord(
         code: EXIT.OK,
         pushed: true,
         ref: landedPr.ref,
-        linkRef: landedPr.via === "close-pr" ? DEV : landedPr.ref,
+        linkRef: landedPr.via === "close-pr" ? DEV : landedPr.sha,
         skipped: null,
       };
     }
@@ -1670,31 +1677,71 @@ export function closeWorkflow(
 
 /**
  * Publish a commit dev refused through its own `branch` PR titled `title`,
- * merged with an empty body. Returns where it landed, or why it did not.
+ * merged with an empty body. Builds on a branch an earlier attempt left: its
+ * tip is merged into the record (`-X ours`, its ledger rows put back) so the
+ * push fast-forwards, and an open PR for the branch is reused. Returns where
+ * it landed and the pushed commit, or why it did not.
  */
 function closePr(
   ctx: RunContext,
   dir: string,
   o: { title: string; branch: string; subject: string },
-): { ref: string; via: string } | { failed: string } {
+): { ref: string; via: string; sha: string } | { failed: string } {
   const { branch, title, subject } = o;
+  // An empty answer is no branch; a failed read is not.
+  const tipRead = runGit(dir, ["ls-remote", "origin", `refs/heads/${branch}`]);
+  if (!tipRead.ok) return { failed: `cannot read origin's ${branch}: ${tipRead.stderr}` };
+  const tip = tipRead.stdout.split(/\s+/)[0] || null;
+  if (tip !== null && !runGit(dir, ["merge-base", "--is-ancestor", tip, "HEAD"]).ok) {
+    if (!runGit(dir, ["fetch", "origin", `refs/heads/${branch}`]).ok)
+      return { failed: `cannot fetch origin's ${branch}` };
+    const mergeBase = git(dir, ["merge-base", "HEAD", tip]);
+    if (mergeBase === null) return { failed: `${branch} at ${tip} shares no history with ${DEV}` };
+    const diff = minPushOutside(dir, mergeBase, tip, minPushPathspecs(readBkitConfig(dir)));
+    if (!diff.ok) return { failed: `cannot diff origin's ${branch} at ${tip}: ${diff.stderr}` };
+    if (diff.outside.length > 0)
+      return {
+        failed: `origin's ${branch} at ${tip} changes files outside the min-push paths, so it is not merged: ${diff.outside.join(", ")}`,
+      };
+    const merged = runGit(dir, ["merge", "--no-ff", "--no-commit", "-X", "ours", tip]);
+    if (!merged.ok) {
+      runGit(dir, ["merge", "--abort"]);
+      return { failed: `merge of origin's ${branch} at ${tip} stopped: ${merged.stderr}` };
+    }
+    restoreBranchRows(dir, tip);
+    const made = runGit(dir, ["commit", "--no-edit"]);
+    if (!made.ok) {
+      runGit(dir, ["merge", "--abort"]);
+      return { failed: `merge commit of origin's ${branch} at ${tip} failed: ${made.stderr}` };
+    }
+  }
   const head = headSha(dir);
   if (!runGit(dir, ["push", "origin", `HEAD:refs/heads/${branch}`]).ok)
     return { failed: `close branch push failed for ${branch}` };
-  const created = runGh(dir, [
-    "pr",
-    "create",
-    "--base",
-    DEV,
-    "--head",
-    branch,
-    "--title",
-    title,
-    "--body",
-    "",
-  ]);
-  if (!created.ok) return { failed: `gh pr create failed: ${created.stderr}` };
-  const pr = probePr(dir, { head: branch, base: DEV, state: "open" });
+  // Only a branch an earlier attempt left can already have a PR.
+  const open = tip === null ? null : probePr(dir, { head: branch, base: DEV, state: "open" });
+  if (open?.kind !== "ok" || open.pr?.number === undefined) {
+    const created = runGh(dir, [
+      "pr",
+      "create",
+      "--base",
+      DEV,
+      "--head",
+      branch,
+      "--title",
+      title,
+      "--body",
+      "",
+    ]);
+    if (!created.ok)
+      return {
+        failed: `gh pr create failed for ${branch}, which holds the record: ${created.stderr}`,
+      };
+  }
+  const pr =
+    open?.kind === "ok" && open.pr?.number !== undefined
+      ? open
+      : probePr(dir, { head: branch, base: DEV, state: "open" });
   const number = pr.kind === "ok" ? pr.pr?.number : undefined;
   if (number === undefined) return { failed: `close PR not found for ${branch}` };
   const merged = mergePr(
@@ -1704,7 +1751,7 @@ function closePr(
   );
   if (!merged.out.merged)
     ctx.log(`close PR #${number} (${branch}) opened but not merged — merge it by hand`);
-  return { ref: branch, via: merged.out.merged ? "close-pr" : "close-pr-open" };
+  return { ref: branch, via: merged.out.merged ? "close-pr" : "close-pr-open", sha: head };
 }
 
 /**
@@ -1729,7 +1776,7 @@ async function shipClose(
   const kept = `close bookkeeping kept in ${book}`;
   const out = closeWorkflow(book, { ...o, recordStep: true, message: undefined }, ctx.log);
 
-  let viaPr: { ref: string; via: string } | { failed: string } | null = null;
+  let viaPr: { ref: string; via: string; sha: string } | { failed: string } | null = null;
   let res: DevPush;
   try {
     res = await pushToDev({
@@ -1765,18 +1812,18 @@ async function shipClose(
   }
 
   // A close that did not land keeps the lock: the Failure Path releases it.
-  let landed: { ref: string; via: string } | null = null;
+  let landed: { ref: string; via: string; sha?: string } | null = null;
   switch (res.kind) {
     case "landed":
       landed = { ref: DEV, via: "head-push" };
       break;
     case "refused": {
-      const pr = viaPr as { ref: string; via: string } | { failed: string } | null;
+      const pr = viaPr as { ref: string; via: string; sha: string } | { failed: string } | null;
       if (pr === null || "failed" in pr) {
         ctx.log(`${pr === null ? "close PR not attempted" : pr.failed} — ${kept}`);
         return { code: EXIT_FLUSH_FAILED, out: null };
       }
-      landed = pr;
+      landed = { ref: pr.ref, via: pr.via };
       break;
     }
     case "push-failed":
diff --git a/.bkit/version b/.bkit/version
index 459f30d67..2e659cac0 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -211,7 +211,7 @@
     ".bkit/providers.md": "cd84350a719e69837d96a698fe5597f98c79785d3e4079cb1867fbcf4901430e",
     ".bkit/prompts.md": "194175488cbeed73d3d8a92bc6d2b50efa6ad2c8cda691213056fdbbdcecf4ab",
     ".bkit/trackers.md": "489175623dcfeb76714039dd334024797f1a3a22fd57be1ea2ca7c06f32f9623",
-    ".bkit/workflows.md": "b827a703769505103079c703bebea95d15ce93278f66126160d10c92e59c77c5",
+    ".bkit/workflows.md": "4b4e1bc93c5c169eed8818a5bfcfe8a4224b7aae72f7528bdf2ca2706c40a051",
     ".bkit/README.md": "76da76193945362dbf7908c9ede6ffc456f783218c110e6ad98d0e737475d98a",
     ".cursor/rules/bkit-rules.mdc": "36782c0c77a3eabb5a89b82804465d9960ecc7bc4962531fdef9f5c5be07e84d",
     ".claude/hooks/bkit-gateguard.cjs": "ae6358523d8033cf3ccdb6bb306e91f3feaa702effd8b73ecd838c1ace04fa87",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index a697a2da9..60975bac7 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -128,8 +128,8 @@ Rendering can be re-run: the source carries every wired variant, so a tracker sw
   - **If** the server refuses (any other `[remote rejected]`, `returned error: 403`, a `GH0nn` rule) → take the caller's refused route.
   - **If** the push gets no server answer (network, credentials) → return to the caller. Nothing landed, and there is no PR.
   - `bkit branches land`: design / plan close (`merge --squash -X ours {BRANCH}`, `docs({FID}): {phase} DONE bkit [skip ci]`); refused → PR merge.
-  - `bkit workflows close --flush`: ship close, book carried in (`docs({FID}): ship DONE bkit [skip ci]`); refused → `ship-close/{FID}` PR.
-  - `bkit workflows handover --flush` (ship Failure Path) / `--push` from `dev` / `main` / detached (design / plan / build / debug Failure Path): `chore({FID}): {phase} FAILED bkit [skip ci]`; `--push` refused → tree keeps it; `--flush` → `ship-failed/{FID}` PR. From a `dev` / `main` / detached checkout only the run's own record is carried (§ Failure Path), then handed back.
+  - `bkit workflows close --flush`: ship close, book carried in (`docs({FID}): ship DONE bkit [skip ci]`); refused → `ship-close/{FID}` PR (a branch left on origin by an earlier attempt is merged into the record, and its open PR reused).
+  - `bkit workflows handover --flush` (ship Failure Path) / `--push` from `dev` / `main` / detached (design / plan / build / debug Failure Path): `chore({FID}): {phase} FAILED bkit [skip ci]`; `--push` refused → tree keeps it; `--flush` → `ship-failed/{FID}` PR (a branch left on origin by an earlier attempt is merged into the record, and its open PR reused). From a `dev` / `main` / detached checkout only the run's own record is carried (§ Failure Path), then handed back.
   - `bkit roadmap mirror`: build / debug; an attempt that committed nothing never counts as mirrored.
   - `bkit branches land` reads `RUNTIME_DEVPUSHES` from the run's `runtime-resolved` row (no row → fresh detect). It picks the default `{BRANCH}` (`true` → `feat/{FID}`, `false` → the current branch) and gates only what surrounds the landing: stray-artifact check, local `dev` fast-forward, worktree + `feat/{FID}` teardown.
 - **PR-mode design / plan closes must push before `bkit prs open`:** PR creation and `gh pr merge` act on the remote, so a close commit that is only committed locally never enters the PR and never reaches `dev`. The direct push lands one commit built off `origin/dev` and is unaffected; the PR branch produces two local commits (`chore({FID}): close-workflow` carrying the `status.jsonl` rows and close telemetry, then `docs({FID}): {phase} roadmap update` carrying `.bkit/issues.jsonl` + `docs/roadmap.md`) and needs an explicit `bkit branches push --mode=feature` to publish them. The push sits after the stray guard, so nothing unvetted is published, and before `bkit prs open --existing=reuse`. The build / debug close already pushes the feature branch. Leaving the push out silently loses every design / plan close on the PR path.
@@ -147,7 +147,7 @@ Rendering can be re-run: the source carries every wired variant, so a tracker sw
 - **Host skill mirrors are in the `--scope=full` bookkeeping pathspec:** `npx skills remove` deletes `.claude/skills` / `.cursor/skills` / `.opencode/skills` alongside `.agents/skills/<name>`, so the close staging must be able to carry those deletions. `bkit ledgers commit` builds its pathspec via `git ls-files -z --cached --others --exclude-standard`, so an unmatched glob is empty output (never fatal) and `--cached` still emits a tracked-but-deleted mirror, so the deletion stages cleanly. A claude-only consumer with no `.cursor` / `.opencode` mirror sweeps zero for those globs rather than aborting. Without them the prune commit holds only `.agents/skills` + `skills-lock.json` and the mirror deletions leak into the working tree, where the next unrelated staging sweeps them into a foreign commit. A tracked `*.bkit-lock` that was deleted is staged as a deletion too, unless the run's shared-checkout record lists it, and an untracked or changed one never is.
 - **Ship Step 7 never prunes `bkit-*` skills:** they are bkit render output (Codex host workflow entry points), absent from `.agents/skills.md`. `bkit skills prune` keeps every `bkit-*` skill; without that guard every ship uninstalls them. A missing `.agents/skills.md` skips the prune with a warning (`skipped: "no-registry"`) rather than uninstall everything; a failed uninstall is warned and listed in `failed`. Both exit 0: pruning is housekeeping, so the ship carries on and still closes.
 - **Staging routes through `bkit ledgers commit`, never a shell pathspec:** a pathspec rebuilt inline per block with unquoted word-splitting and an `ls docs/plans/*/logs/*/*.jsonl docs/*.jsonl .bkit/*.jsonl` glob aborts under zsh when unmatched — silently dropping every ledger in a fresh consumer repo, and (worse) swallowing a failed `git add` into a false "nothing to commit" success, since nothing in these blocks sets `set -e`. `bkit ledgers commit` builds the pathspec with `git ls-files` — an unmatched glob is empty output, never an abort — and stages / commits it via `--pathspec-from-file --pathspec-file-nul` rather than a re-interpolated shell string. It refuses to reach `commit` when that list is empty (exit 6): `git commit --pathspec-from-file=<empty file>` does not commit nothing, it silently commits whatever is already staged in the index. Ship's markdown stages through it at the Step 8 bookkeeping commit and the Step 12 fix commit, each stopping the step on failure (`.bkit/core/engine/audits/workflows/ship-invariants.test.ts`); the Failure Path flush and the Close flush run the same code inside `bkit workflows handover --flush` / `bkit workflows close --flush`. `commands/workflow/ledgers.test.ts` covers the command itself.
-- **Failure Path never calls `bkit runtime assert`:** its non-zero route would loop into itself. `workflows fail` / `handover --push` / `--flush` behave identically in every runtime: record written in the run's tree, then pushed on the feature branch or landed via the throwaway `origin/dev` checkout; refused → `--flush` opens a `ship-failed/{FID}` PR, else it stays in the run's tree, lost in a cloud container.
+- **Failure Path never calls `bkit runtime assert`:** its non-zero route would loop into itself. `workflows fail` / `handover --push` / `--flush` behave identically in every runtime: record written in the run's tree, then pushed on the feature branch or landed via the throwaway `origin/dev` checkout; refused → `--flush` opens a `ship-failed/{FID}` PR (building on a branch an earlier attempt left, reusing its open PR), else it stays in the run's tree, lost in a cloud container.
 - **Ship's dev commits carry the book:** ship books in `{WORKTREE_PATH}` (`BOOK_ROOT`); a failed ship never merges. Close and Failure Path copy the book's `*.md` logs the throwaway checkout lacks and union ledgers line-wise (`bkit ledgers union` code; each tree holds rows the other lacks). `handover --worktree=` names the book; default = current tree.
 - **`context-fetch` blocks are selected by ordinal, not by `context` + name:** two blocks may legitimately share a pair — the context-coverage advisory tells consumers a second test lane needs its own `context=e2e` block, and naming is optional — and matching on the pair splices both bodies into one block and writes them to one artifact path. `bkit context list-blocks` numbers every block (`idx`) in one enumeration pass and `bkit context run-block --idx=` runs exactly that one, so selection is total; the artifact path only grows the ordinal when the pair actually repeats, keeping the documented `context-<context>-<name>-<attempt>.md` shape for every single-block context.
 - **Unknown `context-fetch` context is never run:** `fetch` / `run-block` report `not-run` with the bad `context=` named. Running it would make a paid API call in the `web` case and write its output under an empty prefix — a path the `context-*` glob cannot match, dropping the artifact from `artifacts` and from `FETCH_VERDICT`. The narration and the behaviour agree.
@@ -822,7 +822,7 @@ Every command has a `🤖 Failure Path` section before Step 1. Any step, tool or
 
 5. **STOP** — no downstream steps.
 
-**Ship exception:** no separate abort commit, no second push. After the optional handover subagent, `bkit workflows handover --workflow=ship --flush --worktree=` carries the book (handover, deferred-sweep, ledger rows) into a throwaway `origin/dev` checkout → one `chore({FID}): ship FAILED bkit [skip ci]` commit and one push to `dev` (`dev` moved → rebuilt and pushed again; refused → `ship-failed/{FID}` PR; else the record stays in `BOOK_ROOT`). It never touches the open PR's validated head, so the open-PR guard does not apply, and the handover survives the branch prune. The comment is posted only when `handoverNeeded`, and linked only where the flush pushed.
+**Ship exception:** no separate abort commit, no second push. After the optional handover subagent, `bkit workflows handover --workflow=ship --flush --worktree=` carries the book (handover, deferred-sweep, ledger rows) into a throwaway `origin/dev` checkout → one `chore({FID}): ship FAILED bkit [skip ci]` commit and one push to `dev` (`dev` moved → rebuilt and pushed again; refused → `ship-failed/{FID}` PR, built on a branch an earlier attempt left and reusing its open PR; else the record stays in `BOOK_ROOT`). It never touches the open PR's validated head, so the open-PR guard does not apply, and the handover survives the branch prune. The comment is posted only when `handoverNeeded`, and linked only where the flush pushed.
 
 `/bkit-design` and `/bkit-plan` run no handover subagent (no max-retry loop); they still keep the record.
 
@@ -1125,7 +1125,7 @@ The following table describes the local discovery route and shared step mechanic
 **Close Workflow records the merge-CI verdict and publishes on every runtime:**
 
 - The `ship-merge-ci` row (verdict + reason) is written before a red result routes to **Failure Path**. A red merge is recorded, never inferred from a missing close row.
-- Close commit built in a throwaway `.worktrees/_land-{FID}` off `origin/dev` (book's logs copied, ledgers via `bkit ledgers union`) → push `dev`; `dev` moved → rebuilt, pushed again; refused → `ship-close/{FID}` PR, squash subject `[skip ci]`; a PR GitHub refuses to merge stays open for a human, worktree kept.
+- Close commit built in a throwaway `.worktrees/_land-{FID}` off `origin/dev` (book's logs copied, ledgers via `bkit ledgers union`) → push `dev`; `dev` moved → rebuilt, pushed again; refused → `ship-close/{FID}` PR, squash subject `[skip ci]`, built on a `ship-close/{FID}` branch an earlier attempt left (its tip merged in, its open PR reused); a PR GitHub refuses to merge stays open for a human, worktree kept.
 - Cleanup runs only after the close record reaches `dev`. The shared landed comparison checks file content, mode and type, and cleanup separately proves index and working-tree state. Dirty, unlanded, changed or unreadable evidence preserves the worktree/ref and reports the reason; a local ref deletion is bound to the inspected tip.
 - The remote feature ref is deleted only at its proved landed tip, through a lease-guarded push, and retained when origin refuses it. This does not block close-record landing or lock release. GitHub's repository-managed automatic branch deletion is a separate setting outside this guarantee.
 - `bkit ledgers union` never carries `.bkit/issues.jsonl`: the `SHIPPED` row is pre-merge, so unioning it into `dev` after a pre-merge failure would mark an unmerged feature shipped.
@@ -1351,7 +1351,7 @@ Ship's docs sync, summaries, `SHIPPED` roadmap row and skill removals ride the P
 
 - Ship pushes it to `dev`.
 - **If** `dev` moved → ship rebuilds the commit and pushes again.
-- **If** the push is refused → ship opens a `ship-close/{FID}` PR.
+- **If** the push is refused → ship opens a `ship-close/{FID}` PR, or reuses the open one; a `ship-close/{FID}` branch already on origin is merged into the new record first.
 
 ## Worktree Model
 
diff --git a/dist/commands/workflow/branches.js b/dist/commands/workflow/branches.js
index b27cbf9d9..1eed209a0 100644
--- a/dist/commands/workflow/branches.js
+++ b/dist/commands/workflow/branches.js
@@ -2412,9 +2412,11 @@ function revLines(root, rev, p) {
  * Put back the `.jsonl` rows `branch` added that the squash dropped: `-X ours`
  * keeps dev's side of a conflicting hunk, and a ledger git does not union-merge
  * (a consumer's `.bkit/friction.jsonl`) loses the branch's rows there. Each
- * missing row is appended to the staged file.
+ * missing row is appended to the staged file. `branch` is any revision; it runs
+ * while a merge is open (`MERGE_HEAD` set), as the merge base with a merged tip
+ * is the tip itself once the merge commit exists.
  */
-function restoreBranchRows(dir, branch) {
+export function restoreBranchRows(dir, branch) {
     const base = git(dir, ["merge-base", "HEAD", branch]);
     if (base === null)
         return;
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index 1f55be0f1..1107edc7c 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -30,7 +30,8 @@ import { ASK_POINTS, readBkitConfig } from "../../shared/settings.js";
 import { gradeCompliance } from "../comply.js";
 import { fetchDev, landDir, pushToDev } from "../land.js";
 import { CommandError, DEV, EXIT, git, isSharedBranch, parseJson, repoRoot, runGh, runGit, statusLocation, statusRelPath, } from "../lib.js";
-import { anchorBkitStatus, pushBranch, readAnchor, stampAnchor } from "./branches.js";
+import { minPushOutside, minPushPathspecs } from "../ci/ci.js";
+import { anchorBkitStatus, pushBranch, readAnchor, restoreBranchRows, stampAnchor, } from "./branches.js";
 import { AUTO_LABEL, AUTO_ROUTE_SUFFIX, buildComment, issueParts, parseComments, sortOldestFirst, trackerState, transitionLabels, } from "./issues.js";
 import { EXIT_EMPTY, activeRecord, appendRunCommits, commitBookkeeping, ownPathCommit, ownSet, removeRecord, appendLedgerRows, runRows, unionLedgers, writeParkedCommits, } from "./ledgers.js";
 import { readIssueTracker } from "./fids.js";
@@ -787,7 +788,7 @@ async function landFailedRecord(ctx, o) {
                 code: EXIT.OK,
                 pushed: true,
                 ref: landedPr.ref,
-                linkRef: landedPr.via === "close-pr" ? DEV : landedPr.ref,
+                linkRef: landedPr.via === "close-pr" ? DEV : landedPr.sha,
                 skipped: null,
             };
         }
@@ -1326,35 +1327,76 @@ export function closeWorkflow(cwd, o, log) {
 }
 /**
  * Publish a commit dev refused through its own `branch` PR titled `title`,
- * merged with an empty body. Returns where it landed, or why it did not.
+ * merged with an empty body. Builds on a branch an earlier attempt left: its
+ * tip is merged into the record (`-X ours`, its ledger rows put back) so the
+ * push fast-forwards, and an open PR for the branch is reused. Returns where
+ * it landed and the pushed commit, or why it did not.
  */
 function closePr(ctx, dir, o) {
     const { branch, title, subject } = o;
+    // An empty answer is no branch; a failed read is not.
+    const tipRead = runGit(dir, ["ls-remote", "origin", `refs/heads/${branch}`]);
+    if (!tipRead.ok)
+        return { failed: `cannot read origin's ${branch}: ${tipRead.stderr}` };
+    const tip = tipRead.stdout.split(/\s+/)[0] || null;
+    if (tip !== null && !runGit(dir, ["merge-base", "--is-ancestor", tip, "HEAD"]).ok) {
+        if (!runGit(dir, ["fetch", "origin", `refs/heads/${branch}`]).ok)
+            return { failed: `cannot fetch origin's ${branch}` };
+        const mergeBase = git(dir, ["merge-base", "HEAD", tip]);
+        if (mergeBase === null)
+            return { failed: `${branch} at ${tip} shares no history with ${DEV}` };
+        const diff = minPushOutside(dir, mergeBase, tip, minPushPathspecs(readBkitConfig(dir)));
+        if (!diff.ok)
+            return { failed: `cannot diff origin's ${branch} at ${tip}: ${diff.stderr}` };
+        if (diff.outside.length > 0)
+            return {
+                failed: `origin's ${branch} at ${tip} changes files outside the min-push paths, so it is not merged: ${diff.outside.join(", ")}`,
+            };
+        const merged = runGit(dir, ["merge", "--no-ff", "--no-commit", "-X", "ours", tip]);
+        if (!merged.ok) {
+            runGit(dir, ["merge", "--abort"]);
+            return { failed: `merge of origin's ${branch} at ${tip} stopped: ${merged.stderr}` };
+        }
+        restoreBranchRows(dir, tip);
+        const made = runGit(dir, ["commit", "--no-edit"]);
+        if (!made.ok) {
+            runGit(dir, ["merge", "--abort"]);
+            return { failed: `merge commit of origin's ${branch} at ${tip} failed: ${made.stderr}` };
+        }
+    }
     const head = headSha(dir);
     if (!runGit(dir, ["push", "origin", `HEAD:refs/heads/${branch}`]).ok)
         return { failed: `close branch push failed for ${branch}` };
-    const created = runGh(dir, [
-        "pr",
-        "create",
-        "--base",
-        DEV,
-        "--head",
-        branch,
-        "--title",
-        title,
-        "--body",
-        "",
-    ]);
-    if (!created.ok)
-        return { failed: `gh pr create failed: ${created.stderr}` };
-    const pr = probePr(dir, { head: branch, base: DEV, state: "open" });
+    // Only a branch an earlier attempt left can already have a PR.
+    const open = tip === null ? null : probePr(dir, { head: branch, base: DEV, state: "open" });
+    if (open?.kind !== "ok" || open.pr?.number === undefined) {
+        const created = runGh(dir, [
+            "pr",
+            "create",
+            "--base",
+            DEV,
+            "--head",
+            branch,
+            "--title",
+            title,
+            "--body",
+            "",
+        ]);
+        if (!created.ok)
+            return {
+                failed: `gh pr create failed for ${branch}, which holds the record: ${created.stderr}`,
+            };
+    }
+    const pr = open?.kind === "ok" && open.pr?.number !== undefined
+        ? open
+        : probePr(dir, { head: branch, base: DEV, state: "open" });
     const number = pr.kind === "ok" ? pr.pr?.number : undefined;
     if (number === undefined)
         return { failed: `close PR not found for ${branch}` };
     const merged = mergePr(dir, { number: String(number), subject, matchHead: head, deleteBranch: true }, ctx.log);
     if (!merged.out.merged)
         ctx.log(`close PR #${number} (${branch}) opened but not merged — merge it by hand`);
-    return { ref: branch, via: merged.out.merged ? "close-pr" : "close-pr-open" };
+    return { ref: branch, via: merged.out.merged ? "close-pr" : "close-pr-open", sha: head };
 }
 /**
  * Ship's close, in the run's tree (the feature worktree, or the adopted
@@ -1418,7 +1460,7 @@ async function shipClose(ctx, o, token) {
                 ctx.log(`${pr === null ? "close PR not attempted" : pr.failed} — ${kept}`);
                 return { code: EXIT_FLUSH_FAILED, out: null };
             }
-            landed = pr;
+            landed = { ref: pr.ref, via: pr.via };
             break;
         }
         case "push-failed":
diff --git a/docs/decisions.jsonl b/docs/decisions.jsonl
index 6600685d3..ca4322245 100644
--- a/docs/decisions.jsonl
+++ b/docs/decisions.jsonl
@@ -989,3 +989,4 @@
 {"schema":3,"ts":1795090392250,"firstTs":1794947673228,"updates":2,"kind":"decision","key":"1028-challenge-lower-counts-working-tree","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"utility","step":"manual"},"references":["1043","https://github.com/cbartens/bkit/issues/1043","scripts/gate/bkit-text-ceiling.mjs"],"status":"SUPERSEDED","summary":"Superseded: inside a git work tree `lower` and `raise` count the staged text, not the files on disk","description":"The row `1028-word-ceiling-counted-text-for-lower-and-raise` holds the answer on which text `lower` and `raise` count. `scripts/gate/bkit-text-ceiling.mjs` counts the staged text for both commands inside a git work tree, so another agent's unstaged edit in the same checkout is left out. `check` counts the files on disk.","rationale":"The owner chose the staged count on 2026-11-19; the answer is recorded under the key `1028-word-ceiling-counted-text-for-lower-and-raise`."}
 {"schema":3,"ts":1795090392360,"firstTs":1795084421822,"updates":2,"kind":"decision","key":"1028-word-ceiling-counted-text-for-lower-and-raise","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"utility","step":"manual"},"references":["1043","https://github.com/cbartens/bkit/issues/1043","scripts/gate/bkit-text-ceiling.mjs","docs/testing.md"],"summary":"The word-ceiling commands `lower` and `raise` count the staged text; `check` counts the files on disk","description":"`scripts/gate/bkit-text-ceiling.mjs` has three commands. `lower` and `raise` rewrite the record `scripts/gate/bkit-text-ceiling.json`; `check` compares the word totals with it. Inside a git work tree `lower` and `raise` count each folder's `*.md` files as staged in the index, whatever another agent has left unstaged in the same checkout. An agent stages its own text edits before `lower`. The record passes `check` on a commit that carries every staged text change the command counted; a checkout has one index, so another agent's staged edit is counted too, and the command names the counted files with staged changes that `HEAD` does not hold. `check` counts the files on disk, so the changed-file gate sees a build's growth before it commits. Outside a git work tree all three count the files on disk.","rationale":"answered by the owner on 2026-11-19: \"Yes, count staged\" to the question \"Should the word-ceiling commands lower and raise count the staged text (issue 1043)?\". It fixes the stated failure (a record that fails `check` on the committed tree because another agent's unsaved edit was counted), keeps the record and the text in one commit, and leaves `check` and every gate as they are.","alternatives":["(a) keep counting the files on disk","(c) count `HEAD`, which needs a second commit for the record","(d) count disk but refuse while a counted file has unstaged changes"]}
 {"schema":3,"ts":1795091097953,"firstTs":1795091097953,"updates":1,"kind":"decision","key":"1037-tasks-open-counts-a-ticked-task-as-done","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"utility","step":"manual"},"references":["1037","https://github.com/cbartens/bkit/issues/1037","https://github.com/cbartens/bkit/issues/1012",".bkit/core/engine/commands/workflow/tasks.ts",".bkit/core/engine/commands/workflow/context.ts"],"summary":"`bkit tasks open` counts a ticked task as done, as `bkit context brief --next` does","description":"`bkit tasks open` lists a task only when its box is unticked and its group's plan-execute log holds neither a `DONE` nor a `BLOCKED` line for it. A ticked task is never listed, with or without a log line, so a challenge task the Decision Pause accepted and ticked no longer sets `handover: true`. The two commands still differ on a `BLOCKED` line on purpose: `tasks open` counts it as an answer, the brief counts only `DONE`. This replaces the log-only rule of commit `0aeaac161` (deferral key `701-engine-work-build-challenge-low-bkit-core-engine-commands-workflow-tasks-ts-266`).","rationale":"answered by the owner on 2026-11-19: \"As per recommendation\" and \"Yes ticked is done\" to the question \"Should bkit tasks open count a ticked task as done (issue 1037)?\". The log-only rule came from a LOW finding about the verb's summary text, not from a run that went wrong; build 1028 then hit the mismatch in group 2, where two accepted challenge tasks read as a handover and Plan Verify would have been skipped. One rule serves `One home per fact` and `Runs finish unattended`.","alternatives":["Keep the log-only rule in `tasks open` and have the Decision Pause write a `DONE` line for each accepted task"]}
+{"schema":3,"ts":1795115603871,"firstTs":1794972600494,"updates":2,"kind":"decision","key":"811-leftover-ship-failed-branch-is-an-assumed-accept","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-tasks"},"references":["811","https://github.com/cbartens/bkit/issues/811",".bkit/core/engine/commands/workflow/workflows.ts","1042"],"summary":"Assumed accept: a second refused ship FAILED flush for one FID exits 10 when an earlier flush left `ship-failed/{FID}` on origin (superseded by #1042: the second flush merges the leftover tip and lands)","description":"Build 811's challenge asked how a second refused flush for one FID publishes when the branch `ship-failed/{FID}` is still on origin (its pull request never merged, `gh pr create` failed after the push, or the merged branch was not deleted). The push is rejected, the flush exits 10 and the record stays in the run's book. The orchestrator of the v6.3 run answered Accept as an assumption while the owner had not been asked; the owner can overturn it. The issue's edge table already names this outcome for a failed branch push, and the success close has the same limit: `closePr` pushes `ship-close/{fid}` with a plain push. A follow-up issue covers the leftover branch for both names.","rationale":"the two fixes on offer were a force push with a lease, which the git rules forbid agents to add, and a branch name per attempt, which departs from the fixed name in the issue body.","alternatives":["a branch name per attempt such as `ship-failed/{FID}-{short sha}`","update the bkit-owned branch with a lease and reuse its open pull request"],"status":"SUPERSEDED"}
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 9c45b7869..2d15d84e5 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -583,3 +583,5 @@
 {"schema":3,"ts":1795105872014,"firstTs":1795096336120,"updates":2,"kind":"deferral","key":"985-install-settings-merge-challenge-low-bkit-core-engine-install-write-ts-408","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"utility","step":"manual"},"references":["985-install-settings-merge","8359be639","https://github.com/cbartens/bkit/issues/985"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A list value the current template ships again is still pruned and reported as \"retired entries bkit removes\" on every run, against the plan's edge case \"Entry equals a string the current template ships: never removed or reported\"","description":"Closed by 8359be639: write.test.ts pins that no RETIRED_SETTINGS_ENTRIES value is in the shipped .bkit/shared/.claude/settings.json at its path, so a value the template ships is never retired and removed on every run.","source":".bkit/core/engine/install/write.ts:408","status":"CLOSED"}
 {"schema":3,"ts":1795105872015,"firstTs":1795096336121,"updates":2,"kind":"deferral","key":"985-install-settings-merge-challenge-low-bkit-core-engine-install-write-ts-513","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"utility","step":"manual"},"references":["985-install-settings-merge","8359be639","https://github.com/cbartens/bkit/issues/985"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"After a real `bkit install` has already removed a retired grant, the post-install checklist still says \"retired entries bkit removes\" and \"Run bkit upgrade to remove a retired entry\", which describes nothing left to do","description":"Closed by 8359be639: a real bkit install prints that it removed the entry and adds no upgrade advisory; only a dry run (bkit check) asks to run bkit upgrade.","source":".bkit/core/engine/install/write.ts:513","status":"CLOSED"}
 {"schema":3,"ts":1795105872016,"firstTs":1795096336122,"updates":2,"kind":"deferral","key":"985-install-settings-merge-challenge-low-bkit-core-engine-install-write-ts-516","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"utility","step":"manual"},"references":["985-install-settings-merge","8359be639","https://github.com/cbartens/bkit/issues/985"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"`bkit upgrade` and `bkit upgrade --dry-run` take back a permission entry while printing only `upgrade (merge): .claude/settings.json`, so the person gets no record of which grant or rule changed","description":"Closed by 8359be639: bkit upgrade prints one line per removed entry naming the file, the list and the exact value, and a dry run says it would remove it.","source":".bkit/core/engine/install/write.ts:516","status":"CLOSED"}
+{"schema":3,"ts":1795115603053,"firstTs":1794972501434,"updates":2,"kind":"deferral","key":"811-publish-dev-refused-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-1509","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-tasks"},"references":["811-publish-dev-refused","1042"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"When `gh pr create` fails after the branch push, the flush says the record is only in the book, though origin already holds it on a `ship-failed/{FID}` branch that no line names","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/workflows.ts:1509: When `gh pr create` fails after the branch push, the flush says the record is only in the book, though origin already holds it on a `ship-failed/{FID}` branch that no line names. Done when: A `gh pr create` failure after a successful branch push names the pushed `ship-failed/{FID}` branch in its failure reason, so the exit-10 log says the record is on that branch with no PR.","source":".bkit/core/engine/commands/workflow/workflows.ts:1509","status":"CLOSED"}
+{"schema":3,"ts":1795115603054,"firstTs":1794972501435,"updates":2,"kind":"deferral","key":"811-publish-dev-refused-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-830","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-tasks"},"references":["811-publish-dev-refused","1042"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A flush whose `ship-failed/{FID}` PR opened but did not merge links the tracker comment at that branch, and the link dies once the owner merges the PR and GitHub deletes the head branch","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/workflows.ts:830: A flush whose `ship-failed/{FID}` PR opened but did not merge links the tracker comment at that branch, and the link dies once the owner merges the PR and GitHub deletes the head branch. Done when: A flush whose PR opened but did not merge posts a handover link that still opens after the owner merges that PR and GitHub deletes `ship-failed/{FID}`: the link targets `dev`, as in the merged case.","source":".bkit/core/engine/commands/workflow/workflows.ts:830","status":"CLOSED"}
diff --git a/docs/deployments.md b/docs/deployments.md
index 801cdb789..2e157ee95 100644
--- a/docs/deployments.md
+++ b/docs/deployments.md
@@ -135,7 +135,7 @@ The design and plan Close Workflow lands docs on `dev` in one of two ways. Every
 - **Branch protection on `dev` permits the autonomous merge**, because no human review is required. The PR-path merge does not wait for checks: its merge subject carries `bkit [skip ci]`, so a docs-only close dispatches no run to wait for. A rule requiring status checks to pass will block it.
 - **"Automatically delete head branches" is enabled** (repo Settings → General). The PR-path close deliberately does not pass `--delete-branch`, because `gh` would also delete the local branch. That fails when the branch is checked out in a worktree, and returns non-zero after a successful merge. Head-branch cleanup relies on the repo setting instead.
 
-A refused ship FAILED flush (`bkit workflows handover --flush`) opens and merges a `ship-failed/{FID}` PR under the same two prerequisites.
+A refused ship FAILED flush (`bkit workflows handover --flush`) opens and merges a `ship-failed/{FID}` PR under the same two prerequisites; a `ship-failed/{FID}` branch already on origin is merged into the new record, and its open PR is reused.
 
 Confirm both before running phase closes from a cloud agent session.
 
@@ -354,7 +354,7 @@ Ship's docs sync, summaries, `SHIPPED` roadmap row and skill removals ride the P
 
 - Ship pushes it to `dev`.
 - **If** `dev` moved → ship rebuilds the commit and pushes again.
-- **If** the push is refused → ship opens a `ship-close/{FID}` PR.
+- **If** the push is refused → ship opens a `ship-close/{FID}` PR, or reuses the open one; a `ship-close/{FID}` branch already on origin is merged into the new record first.
 
 ## Smoke trigger plumbing
 
diff --git a/docs/testing.md b/docs/testing.md
index 2dd357fd4..b168899be 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -962,7 +962,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `commands/workflow/plan-blocks.test.ts` | Unit (no file-system access) | `parsePlanBlocks`: group and task order, one `TEST FIRST` test per sub-bullet, `DEPENDS ON` bare numbers, CRLF plans read like LF, markers inside a fence ignored, a fence line with an info string, an unclosed fence, the file-only form, a repeated field keeping the first, task-like text outside a block, TASK 0 and GROUP 0, duplicate task numbers, mismatched markers; `reuseInventory`, `outOfScope` and `derivedTestMatrix` read the table under their own heading, never a later section's. |
 | `commands/workflow/challenge.test.ts` | Unit (boundary: real temp git repo) | `bkit challenge merge`: findings appended as task blocks in new last groups within the caps (7 findings → groups of 3, 3 and 1), one `Derived Test Matrix` row per appended task, dedupe by `path:line`, an open earlier task reopened vs a done one getting a new task, `LOW` → a `low-severity` deferral row (a failed append leaves the plan unchanged), overflow → `pause` writing nothing, exit 23 for a block that fails `plan-check`; a structured finding whose `title`, `cls`, `doneWhen` or a `tests` entry holds a line break refused naming the finding and field. `bkit challenge gate`: sizes the diff, fetches `origin/dev` first, writes a `challenge-gate` row. |
 | `commands/workflow/locks.test.ts` | Unit (boundary: real temp git repo + linked worktree) | `bkit locks acquire / release`: month bucket (existing, UTC new, split refused); live vs reclaimable holder (a step in the last 30 minutes is live and refused with exit 8 and `heldBy`, a taken lock prints `heldBy` null; an idle, finished or log-less holder is reclaimed whatever the lock file's age; worktree copy first); ship's lock in the main checkout from its worktree; only the workflow kind; release by token, never another owner's; `acquire` prints `route` `go` with an empty `message` when it takes the lock, `route` `stop` with a `message` naming the holder on a live one, and nothing on stdout when the month bucket is split. |
-| `commands/workflow/workflows.test.ts` | Unit (boundary: real temp git repos + bare remote) | `bkit workflows start / fail / handover / close / promote / links`: run opened vs resumed (a run still resumes after another workflow's run), `--lock-held`, `lastDoneStep` and, as `openDecision` with its `status` and `sourceChanged` (the `Source changed` header) on a resume, the run's own `OPEN` decision or a `DECIDED` / `ASSUMED` one that no `build-decision` row names; failed row, own-lock release, rebase or merge abort only when in progress, sentinel clearing, `handoverNeeded` (incl. debug `SOAK`), nothing changed without `--token` (empty values count as absent), labels, failure comment from `--error-file`; handover `--push` (the record committed and pushed on the feature branch with or without a handover, open PR → 9 with no link, pushed → linked comment, the named worktree committed in, and from `dev` only the logs and ledgers landed through a throwaway checkout with the checkout's code untouched, then the landed copies handed back so local `dev` fast-forwards onto them while a staged ledger stays and is named, a refusal → 10 with the record kept) and ship `--flush` (one FAILED commit landed on `dev` from a throwaway checkout with the main checkout untouched, nothing-to-commit, the named worktree's logs carried, a refused flush published through a `ship-failed/{FID}` PR, exit 10 only when the PR path fails too); ship `close --flush` (one DONE commit on `dev` carrying the book, then the owned worktree and branch removed; an unowned worktree and its branch left in place); compliance rows before counter + outcome rows, one `run.parentSha` on all three, a `build-plan-convert` row → `plan.source` `converted` with groups, plan tasks counted from task headings, unwritable stats never failing the close, ship size + coverage, artifact links, `--message` commit with the exact-match auto-route marker and `--verbose-ci-local`, `--record-step`, `--outbox` + `--number` comment; promote (`--resolve`, exit 12, archive of a changed canonical, anchor from the base commit, bkit release and outdated warning in the anchor, the plan copied alone, a stray `{FID}-plan-N.md` neither copied nor archived); links (comment, branch name in URLs); `close --ending=held --publish=false` writing `ending: held` and `publish: false` on the `workflow-done` row (default `done`, an unknown ending refused) and passing `publish` into the summary; `handover` prints `route` `stop` on every exit it reaches (0, 9 with ship's push skipped on an open PR, 10, 11, `--ref`) and the not-pushed line as `message` on each non-zero one; the run's summary counts an assumed item once; the error and stderr files a failure commits have tokens, home paths and database passwords scrubbed; an `--error-file` / `--stderr-file` that is outside the run's log folder (a symbolic link followed; a linked worktree outside the main checkout counts as the run's), another log-folder file, a directory, a FIFO, a second hard link or a file it cannot rewrite is skipped before any write, named in `refusedFiles` and on the comment's Error line with the reason, and the failure is still recorded. |
+| `commands/workflow/workflows.test.ts` | Unit (boundary: real temp git repos + bare remote) | `bkit workflows start / fail / handover / close / promote / links`: run opened vs resumed (a run still resumes after another workflow's run), `--lock-held`, `lastDoneStep` and, as `openDecision` with its `status` and `sourceChanged` (the `Source changed` header) on a resume, the run's own `OPEN` decision or a `DECIDED` / `ASSUMED` one that no `build-decision` row names; failed row, own-lock release, rebase or merge abort only when in progress, sentinel clearing, `handoverNeeded` (incl. debug `SOAK`), nothing changed without `--token` (empty values count as absent), labels, failure comment from `--error-file`; handover `--push` (the record committed and pushed on the feature branch with or without a handover, open PR → 9 with no link, pushed → linked comment, the named worktree committed in, and from `dev` only the logs and ledgers landed through a throwaway checkout with the checkout's code untouched, then the landed copies handed back so local `dev` fast-forwards onto them while a staged ledger stays and is named, a refusal → 10 with the record kept) and ship `--flush` (one FAILED commit landed on `dev` from a throwaway checkout with the main checkout untouched, nothing-to-commit, the named worktree's logs carried, a refused flush published through a `ship-failed/{FID}` PR, also when an earlier attempt left that branch (merged into the new record, its open PR reused, a leftover tip that changes code refused), an unmerged flush's handover link at the pushed commit, exit 10 only when the PR path fails too); ship `close --flush` (one DONE commit on `dev` carrying the book, a refused close published through a `ship-close/{FID}` PR that reuses an open one, then the owned worktree and branch removed; an unowned worktree and its branch left in place); compliance rows before counter + outcome rows, one `run.parentSha` on all three, a `build-plan-convert` row → `plan.source` `converted` with groups, plan tasks counted from task headings, unwritable stats never failing the close, ship size + coverage, artifact links, `--message` commit with the exact-match auto-route marker and `--verbose-ci-local`, `--record-step`, `--outbox` + `--number` comment; promote (`--resolve`, exit 12, archive of a changed canonical, anchor from the base commit, bkit release and outdated warning in the anchor, the plan copied alone, a stray `{FID}-plan-N.md` neither copied nor archived); links (comment, branch name in URLs); `close --ending=held --publish=false` writing `ending: held` and `publish: false` on the `workflow-done` row (default `done`, an unknown ending refused) and passing `publish` into the summary; `handover` prints `route` `stop` on every exit it reaches (0, 9 with ship's push skipped on an open PR, 10, 11, `--ref`) and the not-pushed line as `message` on each non-zero one; the run's summary counts an assumed item once; the error and stderr files a failure commits have tokens, home paths and database passwords scrubbed; an `--error-file` / `--stderr-file` that is outside the run's log folder (a symbolic link followed; a linked worktree outside the main checkout counts as the run's), another log-folder file, a directory, a FIFO, a second hard link or a file it cannot rewrite is skipped before any write, named in `refusedFiles` and on the comment's Error line with the reason, and the failure is still recorded. |
 | `commands/workflow/worktrees.test.ts`, `worktrees.integration.test.ts` | Unit and Integration (real git remote) | `bkit worktrees setup / remove`: adopt in place, adopt the linked worktree a host already made on `feat/{FID}` for every workflow (no second `git worktree add`; `worktreePath` and `logDir` point into it; a session on another branch still mints; design / plan / build run in place in the main checkout on `feat/{FID}` under `--worktrees` exit 7 with no log directory), debug / ship branch rules, mint off a freshly fetched `origin/dev` — always for design / plan, and off local `dev` when it is ahead for build / debug (diverged → `origin/dev`, narrated) —, a resumed design / plan branch carrying unpushed `dev` commits refused (7) while the same worktree resumes for build, resume rebase onto the same base + sentinel, a failed ship's uncommitted leftovers committed before that rebase (logs dev already holds dropped, a differing one, a dangling symlink or a symlink to a folder kept under `dropped-logs/`, a symlink as a link with its target untouched, copied entries never committed; a refused commit → exit 9), `direnv allow` only for a `.envrc` identical to the main checkout's (direnv stubbed on PATH), `bkit.workflows.worktree.copy` list with missing entries narrated, install in every workflow (design / plan included), install failure vs could-not-run exits, `--detect` taking mint vs adopt from the runtime (exclusive with `--worktrees`), ownership marker, removal only of a marked worktree, `--branch` deleting the local and remote branch unless another worktree holds it (`branchBlockedBy`); debug in place on `dev` writes the shared-checkout record (`startSha`, `aheadAtStart`) and exits 13 when another feature's live run holds the checkout; a ship of `dev` / `main` and `main` for design / plan / build exit 7. `remove --branch` still removes the worktree and deletes the local and remote branch when a later `dev` commit changed the branch's file. A plan-closed branch left on the remote: the resume rebase keeps `dev`'s copy of the feature's plan logs and the build starts, while a code conflict beside them still stops it (`worktrees.integration.test.ts`). |
 | `commands/workflow/shared-checkout.integration.test.ts` | Integration (real git, real bare `origin`) | A debug run in place on `dev` with foreign work in flight (a modified file, an untracked one, a staged one, a pre-existing ledger row, a local commit): the push sends only the run's commits (replayed as copies onto `origin/dev` when local `dev` is ahead or `origin/dev` moved, a plain push when level, a foreign commit never; with the run's record gone, or another run's newer record present, the push refuses with exit 20 or selects its own `--fid` record), and the run's commits, close commit and roadmap mirror row carry only its own paths and rows, leaving foreign staged, untracked and `.bkit/issues.jsonl` changes behind. |
 | `commands/workflow/branches.test.ts` | Unit (boundary: real temp git repos) | `bkit branches rebase / anchor-stamp / anchor-read / push / sync / sync-dev`: ledger union byte-identical to `merge=union`, lockfile from the rebase target then regenerated, the feature's own plan logs and `{FID}-plan.md` taking the rebase target's copy (each round with each round's branch copy kept, an emptied commit, beside `status.jsonl`, a branch edit kept under the outbox's `{FID}/dropped-logs/{time}/` and named on the `RESOLVED` line when `dev` changed an adjacent line, every kept copy of one rebase in one `{time}/` folder, the `SKIPPED` line naming the plan log whose target copy emptied the commit, also when the branch deleted it, a glob-named log `dev` deleted removed, or one `dev` changed taken, as a literal path with the other logs and the ledger its name matches kept, a copy that cannot be kept aside refusing with the rebase aborted, sentinel and log written) while another feature's plan log, a plan file on a branch not named `feat/{FID}` or whose `feat/` suffix is not a FID slug, and a code conflict beside them still refuse with the rule named, refuse-before-mutate; idempotent anchor stamp, `--base-ref` override, `bkitVersion` / `bkitLatest` stamped and the visible outdated line written then dropped after an upgrade, the outdated stamp prettier-clean and stable on re-stamp, empty `bkitLatest` when unknown; `--against` skip exits; one `git push`, lease only off `dev`/`main`, `--require-ci`, abort guard + `--open-pr`; a `--require-ci` feature push merging `origin/dev`'s ledger rows first (`mergedDev: true`), pushing as-is when `dev` has not moved or without `--require-ci`, and exiting 11 with nothing pushed on a code conflict; docs-from-dev merge committed as `chore({FID}): merge dev` with no skip token, also when only a ledger outside `docs/` moved, a declared `bkit:generate` run and committed after it (25 when it fails); `sync --merge` (ship Step 4) merging `origin/dev` into the checked-out branch: a clean merge committed with the branch as first parent, `current` when `dev` has not moved with a stale sentinel cleared, uncommitted work carried in its own commit first, a conflicted lockfile taken from `dev`, conflicts outside the ledgers and lockfile left in progress with exit 24 until `git add` and a re-run complete the merge, a failed ledger resolution aborting the merge with the sentinel written (11), `bkit:generate` committed after the merge, `--file` writing one `engine-action` merge row, usage (2) and detached (5) refusals; `regenerate` (ship Steps 3 and 10) committing only the paths `bkit:generate` changed while the run's own uncommitted files stay uncommitted, a rewrite and a delete committed, `--attempt` giving the `fix({FID}): regenerate attempt {N}` subject, `--file` writing one `engine-action` regenerate row, `unchanged` when nothing changed, `undeclared` with no or an empty script, 25 when `bkit:generate` fails or rewrites a file that was already uncommitted, usage (2) for `--attempt=0` and on `dev`; `rebase --file` writing one `engine-action` rebase row for a completed rebase and none for a refused one; `sync-dev` fast-forwarding local `dev` without a checkout, moving the checkout and installing only when on `dev` and `dev` moved (16 on a failed install), listing local-only `dev` commits with the publish command and pushing none (10 on a failed fetch); a refused rebase whose `--abort` fails reports `aborted: false` and `ABORT FAILED`. `bkit branches land`: workflow refusal, stray main-checkout artifacts (17), squash off `origin/dev` → `design DONE` commit pushed + audited + local `dev` fast-forwarded, staged files in the main checkout left staged, local-only `dev` commits left unpushed (`localDev: skipped`), another checked-out branch kept with only the `dev` pointer moved, `dev` moving under the push rebuilt and retried (`pushAttempts: 2`) or exhausted (8, branch kept, throwaway worktree gone), non-doc files refused (17) — a branch carrying unpushed `dev` commits additionally named as such, with the unpushed count and `git push origin dev` —, refused `dev` push → PR shape handing the PR to MCP (80, stage `open`) after pushing the roadmap commit (cloud, and on a laptop from the worktree holding the branch), refused PR merge → `origin/dev` merged into the branch locally and pushed (no server-side update-branch) then merged, a CLOSED PR stopping at once (17), uncommitted files in the feature worktree keeping the worktree and branch (`worktree.reason: uncommitted`), branch work missing from `origin/dev` stopping (18) with branch and worktree kept; `landBackoffMs` schedule (2s doubling, 30s cap, jitter, 3min total); the full local close is also run from the workflow in `close-squash.integration.test.ts`. `scan-diff --since-step=<step> --file --code`: exit 0 whether the subagent committed its fix before `steps finish` or left it for the finish commit, exit 1 when the step changed only logs, and skipping a `build-takeover` row a refused finish wrote after the subagent committed. `scan-diff --disabled-tests`: added disabling markers exit 1 with each hit's `file:line` and test name; no unmatched candidates exits 0 with an empty `disabled`. Exact assertion moves consume each added occurrence once and require unchanged test context across files; rewrites pair only within the same file and test. Unchanged duplicates and unrelated additions cannot conceal removals. Removed assertions retain their original test names; deleted files use old line numbers. Comments, non-assertion deletions and quoted markers in docs or source files are excluded. `notOnDev` keeps a landed branch landed after a later `dev` commit on its file, names only the file whose branch version never reached `dev`, and counts a file the branch deleted as landed when `dev` deleted it and a later commit re-added it. |
