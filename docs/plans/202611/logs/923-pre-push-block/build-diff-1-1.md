diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index 63db1b022..0c61e59fc 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -321,6 +321,11 @@ chmod +x .husky/pre-commit .husky/pre-push
   - With a PR open, `bkit ci bookkeeping-push --from=<remote head>` lets the push through when every file changed since the head the remote holds is on ship's `--scope=pr` allow-list. Such a push adds nothing that CI has not tested at that head.
   - A rewritten head or a code file still blocks.
   - On `dev` / `main`, the skip-CI check uses the complete branch diff, independently of local gate receipts. Code cannot skip CI merely because its local gate passed.
+- PR conflict check:
+  - A fast check, run before `bkit check` and the gate. One `gh pr list --head <branch> --state open` lookup (every branch but `dev` / `main`) gives the PR number and its base; the `[skip ci]` guard reads the number from it.
+  - **If** the branch has an open PR → the hook fetches the base from `origin`, then runs `git merge-tree --write-tree --name-only` on `origin/<base>` and the pushed commit. Conflicts → the push is blocked, naming the files and the fix. This holds for a min push too, because a conflicting PR never starts CI.
+  - **If** `gh` is missing or fails, the base fetch fails, or `git merge-tree` fails for another reason → the hook warns that the check was skipped, and the push goes on. No open PR → no fetch and no message.
+  - A repo whose hook copy lacks this gets the `pre-push-pr-conflict` tip.
 - Slop base:
   - **If** the push is to `dev` **and** `scripts/ci/lanes/bkit-resolve-push-base.mjs` is copied → the hook runs it with `--local --branch=dev --head=<pushed sha>`, and exports `SLOP_BASE_REF` as CI's push base. That base is the head of the last green CI push run on `dev`, else `origin/dev`. The hook prints the base and its source.
   - Pre-push and CI slop then share a base, so a finding that an earlier red push landed fails locally too.
diff --git a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
index 691b9823e..50ca20ade 100644
--- a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
@@ -1567,3 +1567,251 @@ describe("the gate's vitest run", () => {
     expect(result.status).toBe(0);
   }, 150_000);
 });
+
+// ---------------------------------------------------------------------------
+// .husky/pre-push PR conflict — a feature-branch push whose open PR no longer merges into its
+// base stops before `bkit check` and the gate. A real repo and bare origin carry the base and
+// the branch; stub `gh` answers "<number> <base>", stub `pnpm` records every call, and a `git`
+// wrapper records each call before running the real git.
+// ---------------------------------------------------------------------------
+
+describe(".husky/pre-push PR conflict", () => {
+  const REPO = process.cwd();
+  const ZERO = "0".repeat(40);
+  const HOOKS = [".bkit/templates/.husky/pre-push", ".husky/pre-push"];
+  let tmp: string;
+  let work: string;
+  let realGit: string;
+
+  const gitIn = (...args: string[]) => {
+    const env: NodeJS.ProcessEnv = { ...process.env };
+    for (const key of Object.keys(env)) if (key.startsWith("GIT_")) delete env[key];
+    return spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
+      cwd: work,
+      encoding: "utf-8",
+      env,
+    }).stdout.trim();
+  };
+  const commitFile = (rel: string, body: string, message: string) => {
+    fs.writeFileSync(path.join(work, rel), body);
+    gitIn("add", "-A");
+    gitIn("commit", "-q", "-m", message);
+    return gitIn("rev-parse", "HEAD");
+  };
+  const readLog = (name: string) => {
+    const log = path.join(tmp, name);
+    return fs.existsSync(log)
+      ? fs.readFileSync(log, "utf-8").trim().split("\n").filter(Boolean)
+      : [];
+  };
+
+  /** Build origin + work repo. `conflict` = the base edits the line the branch edits. Leaves the
+   * checkout on `startBranch`. */
+  const setup = (conflict: boolean, startBranch = "feat/1-x") => {
+    fs.mkdirSync(path.join(tmp, "bin"));
+    fs.mkdirSync(work);
+    fs.mkdirSync(path.join(tmp, "origin.git"));
+    gitIn("init", "-q", "--bare", "-b", "dev", path.join(tmp, "origin.git"));
+    gitIn("init", "-q", "-b", "dev");
+    fs.writeFileSync(path.join(work, ".gitignore"), "tmp/\n");
+    commitFile("f.txt", "one\ntwo\nthree\n", "base");
+    gitIn("remote", "add", "origin", path.join(tmp, "origin.git"));
+    gitIn("push", "-q", "origin", "dev");
+    gitIn("checkout", "-q", "-b", "feat/1-x");
+    commitFile("f.txt", "one\nbranch\nthree\n", "feat: branch edit");
+    gitIn("checkout", "-q", "dev");
+    if (conflict) commitFile("f.txt", "one\nbase\nthree\n", "base edit");
+    else commitFile("g.txt", "other\n", "base adds a file");
+    gitIn("push", "-q", "origin", "dev");
+    // The local tracking ref is stale on purpose: the hook must fetch the base itself.
+    gitIn("update-ref", "refs/remotes/origin/dev", gitIn("rev-parse", "HEAD~1"));
+    gitIn("checkout", "-q", startBranch);
+    realGit = spawnSync("sh", ["-c", "command -v git"], { encoding: "utf-8" }).stdout.trim();
+    fs.writeFileSync(
+      path.join(tmp, "bin", "git"),
+      `#!/bin/sh\necho "$*" >> "${tmp}/git.log"\nexec ${realGit} "$@"\n`,
+      { mode: 0o755 },
+    );
+  };
+
+  const installPnpm = (minPush: boolean) =>
+    fs.writeFileSync(
+      path.join(tmp, "bin", "pnpm"),
+      [
+        "#!/bin/sh",
+        `echo "$*" >> "${tmp}/pnpm.log"`,
+        'case "$*" in *skip-token*) exit 1 ;; esac',
+        `case "$*" in *"ci min-push"*) exit ${minPush ? 0 : 1} ;; esac`,
+        "exit 0",
+        "",
+      ].join("\n"),
+      { mode: 0o755 },
+    );
+  const installGh = (reply: string) =>
+    fs.writeFileSync(
+      path.join(tmp, "bin", "gh"),
+      `#!/bin/sh\necho "$*" >> "${tmp}/gh.log"\necho "${reply}"\n`,
+      { mode: 0o755 },
+    );
+  /** A PATH with the stubs and only the system tools the hook calls — no gh. */
+  const pathWithoutGh = () => {
+    const dir = path.join(tmp, "sysbin");
+    fs.mkdirSync(dir);
+    for (const tool of [
+      "sh",
+      "bash",
+      "env",
+      "sed",
+      "head",
+      "tr",
+      "wc",
+      "cat",
+      "grep",
+      "rm",
+      "mkdir",
+      "tee",
+      "mktemp",
+      "dirname",
+      "basename",
+    ]) {
+      const found = ["/usr/bin", "/bin"]
+        .map((d) => path.join(d, tool))
+        .find((p) => fs.existsSync(p));
+      if (found !== undefined) fs.symlinkSync(found, path.join(dir, tool));
+    }
+    return `${path.join(tmp, "bin")}:${dir}`;
+  };
+
+  const push = (hook: string, opts: { branch?: string; pathEnv?: string } = {}) => {
+    const branch = opts.branch ?? "feat/1-x";
+    fs.rmSync(path.join(tmp, "pnpm.log"), { force: true });
+    fs.rmSync(path.join(tmp, "git.log"), { force: true });
+    fs.rmSync(path.join(tmp, "gh.log"), { force: true });
+    const sha = gitIn("rev-parse", "HEAD");
+    const env: NodeJS.ProcessEnv = {
+      ...process.env,
+      BKIT_PRE_PUSH_LOGGED: "1",
+      PATH: opts.pathEnv ?? `${path.join(tmp, "bin")}:${process.env.PATH}`,
+    };
+    for (const key of Object.keys(env)) if (key.startsWith("GIT_")) delete env[key];
+    const r = spawnSync("sh", [path.join(REPO, hook)], {
+      cwd: work,
+      input: `refs/heads/${branch} ${sha} refs/heads/${branch} ${ZERO}\n`,
+      encoding: "utf-8",
+      timeout: 30_000,
+      env,
+    });
+    const pnpm = readLog("pnpm.log");
+    return {
+      status: r.status,
+      stderr: r.stderr,
+      pnpm,
+      git: readLog("git.log"),
+      gh: readLog("gh.log"),
+      gated: pnpm.some((c) => c.includes("push-gate")),
+      checked: pnpm.some((c) => c === "bkit check" || c.endsWith(" bkit check")),
+    };
+  };
+
+  beforeEach(() => {
+    tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-prepush-conflict-")));
+    work = path.join(tmp, "work");
+  });
+  afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));
+
+  it("open PR whose base conflicts → blocked before bkit check, names the file", () => {
+    setup(true);
+    installPnpm(false);
+    installGh("7 dev");
+    for (const hook of HOOKS) {
+      const r = push(hook);
+      expect(r.status, hook).toBe(1);
+      expect(r.stderr, hook).toContain("BLOCKED");
+      expect(r.stderr, hook).toContain("f.txt");
+      expect(r.checked, hook).toBe(false);
+      expect(r.gated, hook).toBe(false);
+    }
+  });
+
+  it("open PR that merges cleanly → gates run, no message", () => {
+    setup(false);
+    installPnpm(false);
+    installGh("7 dev");
+    for (const hook of HOOKS) {
+      const r = push(hook);
+      expect(r.status, hook).toBe(0);
+      expect(r.checked, hook).toBe(true);
+      expect(r.gated, hook).toBe(true);
+      expect(r.stderr, hook).not.toContain("BLOCKED");
+      expect(r.stderr, hook).not.toContain("WARN");
+    }
+  });
+
+  it("no open PR → no fetch, gates run", () => {
+    setup(true);
+    installPnpm(false);
+    installGh("");
+    for (const hook of HOOKS) {
+      const r = push(hook);
+      expect(r.status, hook).toBe(0);
+      expect(
+        r.git.filter((c) => c.startsWith("fetch")),
+        hook,
+      ).toEqual([]);
+      expect(r.gated, hook).toBe(true);
+      expect(r.stderr, hook).not.toContain("WARN");
+      expect(r.stderr, hook).not.toContain("BLOCKED");
+    }
+  });
+
+  it("gh not on PATH → warns, gates run", () => {
+    setup(true);
+    installPnpm(false);
+    for (const hook of HOOKS) {
+      const r = push(hook, { pathEnv: pathWithoutGh() });
+      expect(r.status, hook).toBe(0);
+      expect(r.stderr, hook).toMatch(/WARN[^\n]*conflict/i);
+      expect(r.stderr, hook).not.toContain("BLOCKED");
+      expect(r.gated, hook).toBe(true);
+    }
+  });
+
+  it("base fetch fails → warns, gates run", () => {
+    setup(true);
+    installPnpm(false);
+    installGh("7 dev");
+    gitIn("remote", "set-url", "origin", path.join(tmp, "missing.git"));
+    for (const hook of HOOKS) {
+      const r = push(hook);
+      expect(r.status, hook).toBe(0);
+      expect(r.stderr, hook).toMatch(/WARN[^\n]*conflict/i);
+      expect(r.stderr, hook).not.toContain("BLOCKED");
+      expect(r.gated, hook).toBe(true);
+    }
+  });
+
+  it("dev push → no PR lookup", () => {
+    setup(false, "dev");
+    installPnpm(false);
+    installGh("7 dev");
+    for (const hook of HOOKS) {
+      const r = push(hook, { branch: "dev" });
+      expect(r.status, hook).toBe(0);
+      expect(r.gh, hook).toEqual([]);
+      expect(r.gated, hook).toBe(true);
+    }
+  });
+
+  it("min push of a conflicting PR → blocked", () => {
+    setup(true);
+    installPnpm(true);
+    installGh("7 dev");
+    for (const hook of HOOKS) {
+      const r = push(hook);
+      expect(r.status, hook).toBe(1);
+      expect(r.stderr, hook).toContain("f.txt");
+      expect(r.pnpm.join("\n"), hook).not.toContain("bkit:gate:min");
+      expect(r.gated, hook).toBe(false);
+    }
+  });
+});
diff --git a/.bkit/core/engine/checks/tips/catalogue.test.ts b/.bkit/core/engine/checks/tips/catalogue.test.ts
index 953a75308..418854b4d 100644
--- a/.bkit/core/engine/checks/tips/catalogue.test.ts
+++ b/.bkit/core/engine/checks/tips/catalogue.test.ts
@@ -471,6 +471,14 @@ describe("SETUP_TIPS — detection", () => {
     expect(tip("min-push").fires(cwd)).toBe(false);
   });
 
+  it("pre-push-pr-conflict fires only for a hook without merge-tree", () => {
+    expect(tip("pre-push-pr-conflict").fires(cwd)).toBe(false);
+    write(".husky/pre-push", "pnpm -s bkit ci push-gate\n");
+    expect(tip("pre-push-pr-conflict").fires(cwd)).toBe(true);
+    write(".husky/pre-push", 'git merge-tree --write-tree --name-only "$BASE" "$SHA"\n');
+    expect(tip("pre-push-pr-conflict").fires(cwd)).toBe(false);
+  });
+
   it("pre-push-direnv fires only for a hook without direnv exec in a repo with .envrc", () => {
     expect(tip("pre-push-direnv").fires(cwd)).toBe(false);
     write(".husky/pre-push", "pnpm -s bkit ci push-gate\n");
diff --git a/.bkit/core/engine/checks/tips/catalogue.ts b/.bkit/core/engine/checks/tips/catalogue.ts
index 7bb343554..ab89722f0 100644
--- a/.bkit/core/engine/checks/tips/catalogue.ts
+++ b/.bkit/core/engine/checks/tips/catalogue.ts
@@ -468,6 +468,19 @@ export const SETUP_TIPS: readonly SetupTip[] = [
       );
     },
   },
+  {
+    id: "pre-push-pr-conflict",
+    workflows: ["plan", "ship"],
+    title: "Stop a push whose PR no longer merges",
+    line: "Your pre-push hook runs the whole gate even when the branch's open PR conflicts with its base, and CI never starts.",
+    why: "The newer hook looks up the open PR once, fetches its base and trial-merges the pushed commit. A conflict stops the push in seconds and names the files; a lookup or fetch that cannot answer only warns.",
+    ask: "Paste the `Open-PR lookup` block (above the CI-suppressor guard, which now reads the PR number from it) and the `PR conflict` block (before `pnpm bkit check`) of .bkit/templates/.husky/pre-push into .husky/pre-push.",
+    steps: "`.bkit/templates.md` § Git hooks.",
+    fires: (cwd) => {
+      if (!exists(cwd, ".husky/pre-push")) return false;
+      return !fs.readFileSync(path.join(cwd, ".husky/pre-push"), "utf-8").includes("merge-tree");
+    },
+  },
   {
     id: "pre-push-direnv",
     workflows: ["plan", "ship"],
diff --git a/.bkit/templates.md b/.bkit/templates.md
index 0fffcfead..d0adcfda1 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -321,6 +321,11 @@ chmod +x .husky/pre-commit .husky/pre-push
   - With a PR open, `bkit ci bookkeeping-push --from=<remote head>` lets the push through when every file changed since the head the remote holds is on ship's `--scope=pr` allow-list. Such a push adds nothing that CI has not tested at that head.
   - A rewritten head or a code file still blocks.
   - On `dev` / `main`, the skip-CI check uses the complete branch diff, independently of local gate receipts. Code cannot skip CI merely because its local gate passed.
+- PR conflict check:
+  - A fast check, run before `bkit check` and the gate. One `gh pr list --head <branch> --state open` lookup (every branch but `dev` / `main`) gives the PR number and its base; the `[skip ci]` guard reads the number from it.
+  - **If** the branch has an open PR → the hook fetches the base from `origin`, then runs `git merge-tree --write-tree --name-only` on `origin/<base>` and the pushed commit. Conflicts → the push is blocked, naming the files and the fix. This holds for a min push too, because a conflicting PR never starts CI.
+  - **If** `gh` is missing or fails, the base fetch fails, or `git merge-tree` fails for another reason → the hook warns that the check was skipped, and the push goes on. No open PR → no fetch and no message.
+  - A repo whose hook copy lacks this gets the `pre-push-pr-conflict` tip.
 - Slop base:
   - **If** the push is to `dev` **and** `scripts/ci/lanes/bkit-resolve-push-base.mjs` is copied → the hook runs it with `--local --branch=dev --head=<pushed sha>`, and exports `SLOP_BASE_REF` as CI's push base. That base is the head of the last green CI push run on `dev`, else `origin/dev`. The hook prints the base and its source.
   - Pre-push and CI slop then share a base, so a finding that an earlier red push landed fails locally too.
diff --git a/.bkit/templates/.husky/pre-push b/.bkit/templates/.husky/pre-push
index 1b8e8c3db..50edb2553 100755
--- a/.bkit/templates/.husky/pre-push
+++ b/.bkit/templates/.husky/pre-push
@@ -133,6 +133,30 @@ case "$HEAD_SUBJECT" in
   'Revert "'*) IS_REVERT=1 ;;
 esac
 
+# Open-PR lookup: one `gh pr list` for every branch except dev / main, shared by the
+# CI-suppressor guard (the number) and the PR conflict check (the number and its base).
+# gh absent or failing leaves PR_LOOKUP naming why; the check that needs an answer warns.
+OPEN_PR=""
+PR_BASE=""
+PR_LOOKUP=""
+case "$BRANCH" in
+  dev|main|"") ;;
+  *)
+    if command -v gh >/dev/null 2>&1; then
+      # strip hook-injected GIT_DIR/GIT_WORK_TREE so gh resolves the repo from cwd (worktree-safe)
+      if PR_INFO=$(env -u GIT_DIR -u GIT_WORK_TREE gh pr list --head "$BRANCH" --state open --json number,baseRefName --jq '.[0] | select(. != null) | "\(.number) \(.baseRefName)"' < /dev/null 2>/dev/null); then
+        PR_LOOKUP=ok
+        OPEN_PR=${PR_INFO%% *}
+        case "$PR_INFO" in *" "*) PR_BASE=${PR_INFO#* } ;; esac
+      else
+        PR_LOOKUP="gh pr list failed (offline, or gh not signed in)"
+      fi
+    else
+      PR_LOOKUP="gh is not installed"
+    fi
+    ;;
+esac
+
 # CI-suppressor HEAD guard: blocks a push whose HEAD commit carries a [skip ci]-class
 # token while the branch has an OPEN PR (that token silences GitHub's pull_request
 # trigger). Covers manual pushes (rebase + force-push, post-close commits). No open PR
@@ -149,9 +173,7 @@ case "$BRANCH" in
   dev|main) ;;
   *)
     if pnpm -s bkit ci skip-token < /dev/null > /dev/null; then
-      if command -v gh >/dev/null 2>&1; then
-        # strip hook-injected GIT_DIR/GIT_WORK_TREE so gh resolves the repo from cwd (worktree-safe)
-        OPEN_PR=$(env -u GIT_DIR -u GIT_WORK_TREE gh pr list --head "$BRANCH" --state open --json number --jq '.[0].number' 2>/dev/null || echo "")
+      if [ "$PR_LOOKUP" != "gh is not installed" ]; then
         if [ -n "$OPEN_PR" ]; then
           if [ -n "$PUSH_BRANCH_REMOTE_SHA" ] &&
             pnpm -s bkit ci bookkeeping-push --from="$PUSH_BRANCH_REMOTE_SHA" < /dev/null > /dev/null; then
@@ -198,6 +220,34 @@ done
 # block (seconds to ~30s, needing nothing the gates build) here too. Slow extras go below
 # the gates.
 #
+# PR conflict: a feature branch whose open PR no longer merges into its base never starts CI,
+# so the push stops here, before the gates. Fetches the base, then a trial merge of the pushed
+# commit (`git merge-tree` exit 1 = conflicts; the work tree is untouched). A lookup, fetch or
+# merge-tree that cannot answer warns and goes on: CI reports the conflict itself.
+case "$BRANCH" in
+  dev|main|"") ;;
+  *)
+    if [ "$PR_LOOKUP" != "ok" ]; then
+      [ -z "$PR_LOOKUP" ] || echo "[pre-push] WARN: PR conflict check skipped — $PR_LOOKUP, so whether '$BRANCH' has an open PR that conflicts is unknown." >&2
+    elif [ -n "$OPEN_PR" ] && [ -n "$PR_BASE" ] && [ -n "$PUSH_BRANCH_SHA" ]; then
+      if git fetch --quiet origin "$PR_BASE" < /dev/null > /dev/null 2>&1; then
+        PR_MERGE_RC=0
+        PR_MERGE_OUT=$(git merge-tree --write-tree --name-only "refs/remotes/origin/$PR_BASE" "$PUSH_BRANCH_SHA" < /dev/null 2>/dev/null) || PR_MERGE_RC=$?
+        if [ "$PR_MERGE_RC" = "1" ]; then
+          echo "[pre-push] BLOCKED: PR #$OPEN_PR does not merge into '$PR_BASE', so CI would not start. Conflicting files:" >&2
+          echo "$PR_MERGE_OUT" | sed '1d;/^$/,$d;s/^/[pre-push]   /' >&2
+          echo "[pre-push] Fix: git fetch origin $PR_BASE && git merge origin/$PR_BASE (or rebase), resolve, commit, push again." >&2
+          exit 1
+        elif [ "$PR_MERGE_RC" != "0" ]; then
+          echo "[pre-push] WARN: PR conflict check skipped — git merge-tree failed (exit $PR_MERGE_RC)." >&2
+        fi
+      else
+        echo "[pre-push] WARN: PR conflict check skipped — could not fetch '$PR_BASE' from origin." >&2
+      fi
+    fi
+    ;;
+esac
+
 # bkit mirror-drift gate — fails if `.agents/*` was edited without `bkit install`
 # regenerating the `.claude/*`/`.cursor/*` mirrors (same check CI runs).
 # Outside the gate scripts: it validates the bkit install, not your source.
diff --git a/.husky/pre-push b/.husky/pre-push
index 847c42253..843b1f92b 100755
--- a/.husky/pre-push
+++ b/.husky/pre-push
@@ -190,6 +190,30 @@ case "$HEAD_SUBJECT" in
   'Revert "'*) IS_REVERT=1 ;;
 esac
 
+# Open-PR lookup: one `gh pr list` for every branch except dev / main, shared by the
+# CI-suppressor guard (the number) and the PR conflict check (the number and its base).
+# gh absent or failing leaves PR_LOOKUP naming why; the check that needs an answer warns.
+OPEN_PR=""
+PR_BASE=""
+PR_LOOKUP=""
+case "$BRANCH" in
+  dev|main|"") ;;
+  *)
+    if command -v gh >/dev/null 2>&1; then
+      # strip hook-injected GIT_DIR/GIT_WORK_TREE so gh resolves the repo from cwd (worktree-safe)
+      if PR_INFO=$(env -u GIT_DIR -u GIT_WORK_TREE gh pr list --head "$BRANCH" --state open --json number,baseRefName --jq '.[0] | select(. != null) | "\(.number) \(.baseRefName)"' < /dev/null 2>/dev/null); then
+        PR_LOOKUP=ok
+        OPEN_PR=${PR_INFO%% *}
+        case "$PR_INFO" in *" "*) PR_BASE=${PR_INFO#* } ;; esac
+      else
+        PR_LOOKUP="gh pr list failed (offline, or gh not signed in)"
+      fi
+    else
+      PR_LOOKUP="gh is not installed"
+    fi
+    ;;
+esac
+
 # CI-suppressor HEAD guard: blocks a push whose HEAD commit carries a [skip ci]-class
 # token while the branch has an OPEN PR (that token silences GitHub's pull_request
 # trigger). Covers manual pushes (rebase + force-push, post-close commits). No open PR
@@ -206,9 +230,7 @@ case "$BRANCH" in
   dev|main) ;;
   *)
     if pnpm -s bkit ci skip-token < /dev/null > /dev/null; then
-      if command -v gh >/dev/null 2>&1; then
-        # strip hook-injected GIT_DIR/GIT_WORK_TREE so gh resolves the repo from cwd (worktree-safe)
-        OPEN_PR=$(env -u GIT_DIR -u GIT_WORK_TREE gh pr list --head "$BRANCH" --state open --json number --jq '.[0].number' 2>/dev/null || echo "")
+      if [ "$PR_LOOKUP" != "gh is not installed" ]; then
         if [ -n "$OPEN_PR" ]; then
           if [ -n "$PUSH_BRANCH_REMOTE_SHA" ] &&
             pnpm -s bkit ci bookkeeping-push --from="$PUSH_BRANCH_REMOTE_SHA" < /dev/null > /dev/null; then
@@ -255,6 +277,34 @@ done
 # block (seconds to ~30s, needing nothing the gates build) here too. Slow extras go below
 # the gates.
 #
+# PR conflict: a feature branch whose open PR no longer merges into its base never starts CI,
+# so the push stops here, before the gates. Fetches the base, then a trial merge of the pushed
+# commit (`git merge-tree` exit 1 = conflicts; the work tree is untouched). A lookup, fetch or
+# merge-tree that cannot answer warns and goes on: CI reports the conflict itself.
+case "$BRANCH" in
+  dev|main|"") ;;
+  *)
+    if [ "$PR_LOOKUP" != "ok" ]; then
+      [ -z "$PR_LOOKUP" ] || echo "[pre-push] WARN: PR conflict check skipped — $PR_LOOKUP, so whether '$BRANCH' has an open PR that conflicts is unknown." >&2
+    elif [ -n "$OPEN_PR" ] && [ -n "$PR_BASE" ] && [ -n "$PUSH_BRANCH_SHA" ]; then
+      if git fetch --quiet origin "$PR_BASE" < /dev/null > /dev/null 2>&1; then
+        PR_MERGE_RC=0
+        PR_MERGE_OUT=$(git merge-tree --write-tree --name-only "refs/remotes/origin/$PR_BASE" "$PUSH_BRANCH_SHA" < /dev/null 2>/dev/null) || PR_MERGE_RC=$?
+        if [ "$PR_MERGE_RC" = "1" ]; then
+          echo "[pre-push] BLOCKED: PR #$OPEN_PR does not merge into '$PR_BASE', so CI would not start. Conflicting files:" >&2
+          echo "$PR_MERGE_OUT" | sed '1d;/^$/,$d;s/^/[pre-push]   /' >&2
+          echo "[pre-push] Fix: git fetch origin $PR_BASE && git merge origin/$PR_BASE (or rebase), resolve, commit, push again." >&2
+          exit 1
+        elif [ "$PR_MERGE_RC" != "0" ]; then
+          echo "[pre-push] WARN: PR conflict check skipped — git merge-tree failed (exit $PR_MERGE_RC)." >&2
+        fi
+      else
+        echo "[pre-push] WARN: PR conflict check skipped — could not fetch '$PR_BASE' from origin." >&2
+      fi
+    fi
+    ;;
+esac
+
 # bkit mirror-drift gate — fails if `.agents/*` was edited without `bkit install`
 # regenerating the `.claude/*`/`.cursor/*` mirrors (same check CI runs).
 # Outside the gate scripts: it validates the bkit install, not your source.
diff --git a/dist/checks/tips/catalogue.js b/dist/checks/tips/catalogue.js
index 7c5df7f9f..c7594d4f7 100644
--- a/dist/checks/tips/catalogue.js
+++ b/dist/checks/tips/catalogue.js
@@ -389,6 +389,20 @@ export const SETUP_TIPS = [
             return ["bkit ci min-push", "--update=", "bkit ci push-gate"].some((part) => !hook.includes(part));
         },
     },
+    {
+        id: "pre-push-pr-conflict",
+        workflows: ["plan", "ship"],
+        title: "Stop a push whose PR no longer merges",
+        line: "Your pre-push hook runs the whole gate even when the branch's open PR conflicts with its base, and CI never starts.",
+        why: "The newer hook looks up the open PR once, fetches its base and trial-merges the pushed commit. A conflict stops the push in seconds and names the files; a lookup or fetch that cannot answer only warns.",
+        ask: "Paste the `Open-PR lookup` block (above the CI-suppressor guard, which now reads the PR number from it) and the `PR conflict` block (before `pnpm bkit check`) of .bkit/templates/.husky/pre-push into .husky/pre-push.",
+        steps: "`.bkit/templates.md` § Git hooks.",
+        fires: (cwd) => {
+            if (!exists(cwd, ".husky/pre-push"))
+                return false;
+            return !fs.readFileSync(path.join(cwd, ".husky/pre-push"), "utf-8").includes("merge-tree");
+        },
+    },
     {
         id: "pre-push-direnv",
         workflows: ["plan", "ship"],
