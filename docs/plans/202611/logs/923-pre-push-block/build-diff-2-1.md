diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index 0c61e59fc..5d8064a50 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -325,6 +325,8 @@ chmod +x .husky/pre-commit .husky/pre-push
   - A fast check, run before `bkit check` and the gate. One `gh pr list --head <branch> --state open` lookup (every branch but `dev` / `main`) gives the PR number and its base; the `[skip ci]` guard reads the number from it.
   - **If** the branch has an open PR → the hook fetches the base from `origin`, then runs `git merge-tree --write-tree --name-only` on `origin/<base>` and the pushed commit. Conflicts → the push is blocked, naming the files and the fix. This holds for a min push too, because a conflicting PR never starts CI.
   - **If** `gh` is missing or fails, the base fetch fails, or `git merge-tree` fails for another reason → the hook warns that the check was skipped, and the push goes on. No open PR → no fetch and no message.
+  - The lookup keeps only same-repo PRs, so a fork PR with the same head branch name is ignored. The base is fetched with an explicit refspec, and the trial merge ignores the work tree's `.gitattributes`, as GitHub does, so a `merge=union` ledger conflict blocks.
+  - `BKIT_PR_CONFLICT_CHECK=false` skips the whole check with one stderr line. `/bkit-ship` sets it on its pushes before Step 4 `Integrate`, because the conflict is what Step 4 merges away, and never on later pushes, so the merged head is checked.
   - A repo whose hook copy lacks this gets the `pre-push-pr-conflict` tip.
 - Slop base:
   - **If** the push is to `dev` **and** `scripts/ci/lanes/bkit-resolve-push-base.mjs` is copied → the hook runs it with `--local --branch=dev --head=<pushed sha>`, and exports `SLOP_BASE_REF` as CI's push base. That base is the head of the last green CI push run on `dev`, else `origin/dev`. The hook prints the base and its source.
diff --git a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
index 552fadc2c..f07802ae4 100644
--- a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
@@ -1684,7 +1684,10 @@ describe(".husky/pre-push PR conflict", () => {
     return `${path.join(tmp, "bin")}:${dir}`;
   };
 
-  const push = (hook: string, opts: { branch?: string; pathEnv?: string } = {}) => {
+  const push = (
+    hook: string,
+    opts: { branch?: string; pathEnv?: string; env?: Record<string, string> } = {},
+  ) => {
     const branch = opts.branch ?? "feat/1-x";
     fs.rmSync(path.join(tmp, "pnpm.log"), { force: true });
     fs.rmSync(path.join(tmp, "git.log"), { force: true });
@@ -1694,6 +1697,7 @@ describe(".husky/pre-push PR conflict", () => {
       ...process.env,
       BKIT_PRE_PUSH_LOGGED: "1",
       PATH: opts.pathEnv ?? `${path.join(tmp, "bin")}:${process.env.PATH}`,
+      ...opts.env,
     };
     for (const key of Object.keys(env)) if (key.startsWith("GIT_")) delete env[key];
     const r = spawnSync("sh", [path.join(REPO, hook)], {
@@ -1832,4 +1836,88 @@ describe(".husky/pre-push PR conflict", () => {
       expect(r.gated, hook).toBe(false);
     }
   });
+
+  it("BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run", () => {
+    setup(true);
+    installPnpm(false);
+    installGh("7 dev");
+    for (const hook of HOOKS) {
+      const r = push(hook, { env: { BKIT_PR_CONFLICT_CHECK: "false" } });
+      expect(r.status, hook).toBe(0);
+      expect(r.stderr, hook).toContain(
+        "[pre-push] PR conflict check off (BKIT_PR_CONFLICT_CHECK=false).",
+      );
+      expect(r.stderr, hook).not.toContain("BLOCKED");
+      expect(
+        r.git.filter((c) => /^(fetch|merge-tree)/.test(c)),
+        hook,
+      ).toEqual([]);
+      expect(r.gated, hook).toBe(true);
+    }
+  });
+
+  it("open PR whose only conflict is a merge=union ledger → blocked", () => {
+    setup(false);
+    installPnpm(false);
+    installGh("7 dev");
+    // Base and branch both append to a.jsonl; `*.jsonl merge=union` hides that from merge-tree
+    // unless the hook ignores the work tree's attributes, as GitHub does.
+    gitIn("checkout", "-q", "dev");
+    fs.writeFileSync(path.join(work, ".gitattributes"), "*.jsonl merge=union\n");
+    commitFile("a.jsonl", "start\n", "ledger");
+    gitIn("push", "-q", "origin", "dev");
+    gitIn("checkout", "-q", "feat/1-x");
+    gitIn("merge", "-q", "--no-edit", "dev");
+    commitFile("a.jsonl", "start\nbranch\n", "branch appends");
+    gitIn("checkout", "-q", "dev");
+    commitFile("a.jsonl", "start\nbase\n", "base appends");
+    gitIn("push", "-q", "origin", "dev");
+    gitIn("update-ref", "refs/remotes/origin/dev", gitIn("rev-parse", "HEAD~1"));
+    gitIn("checkout", "-q", "feat/1-x");
+    for (const hook of HOOKS) {
+      const r = push(hook);
+      expect(r.status, hook).toBe(1);
+      expect(r.stderr, hook).toContain("BLOCKED");
+      expect(r.stderr, hook).toContain("a.jsonl");
+      expect(r.gated, hook).toBe(false);
+    }
+  });
+
+  it("single-branch fetch refspec → checks the fetched base, no false block", () => {
+    setup(false);
+    installPnpm(false);
+    installGh("7 dev");
+    gitIn("config", "remote.origin.fetch", "+refs/heads/feat/1-x:refs/remotes/origin/feat/1-x");
+    gitIn("update-ref", "-d", "refs/remotes/origin/dev");
+    for (const hook of HOOKS) {
+      gitIn("update-ref", "-d", "refs/remotes/origin/dev");
+      const r = push(hook);
+      expect(r.status, hook).toBe(0);
+      expect(r.stderr, hook).not.toContain("BLOCKED");
+      expect(r.gated, hook).toBe(true);
+    }
+  });
+
+  it("fork PR with the same head branch name → ignored, gates run", () => {
+    setup(true);
+    installPnpm(false);
+    // Stub gh applies the hook's own --jq filter with real jq to a fork PR.
+    fs.writeFileSync(
+      path.join(tmp, "bin", "gh"),
+      [
+        "#!/bin/sh",
+        `echo "$*" >> "${tmp}/gh.log"`,
+        'while [ $# -gt 0 ]; do case "$1" in --jq) shift; F="$1" ;; esac; shift; done',
+        `echo '[{"number":8,"baseRefName":"dev","isCrossRepository":true}]' | jq -r "$F"`,
+        "",
+      ].join("\n"),
+      { mode: 0o755 },
+    );
+    for (const hook of HOOKS) {
+      const r = push(hook);
+      expect(r.status, hook).toBe(0);
+      expect(r.stderr, hook).not.toContain("BLOCKED");
+      expect(r.gated, hook).toBe(true);
+    }
+  });
 });
diff --git a/.bkit/core/engine/audits/workflows/ship-invariants.test.ts b/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
index 00a1b3c98..1afbe5014 100644
--- a/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
+++ b/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
@@ -1080,3 +1080,19 @@ describe("bkit-ship.md — red CI names /bkit-debug", () => {
     expect(step1).toMatch(/without `?--next-step/);
   });
 });
+
+describe("ship PR conflict check switch", () => {
+  it("ship switches the PR conflict check off for its pushes before Step 4, and only those", () => {
+    const ship = readShip();
+    const step4 = ship.indexOf("## 🧠 Step 4 — Integrate");
+    expect(step4).toBeGreaterThan(0);
+    const pushLines = (text: string) =>
+      text.split("\n").filter((line) => line.includes("branches push"));
+    const before = pushLines(ship.slice(0, step4));
+    const after = pushLines(ship.slice(step4));
+    expect(before.length).toBeGreaterThanOrEqual(3);
+    for (const line of before) expect(line).toContain("BKIT_PR_CONFLICT_CHECK=false");
+    expect(after.length).toBeGreaterThan(0);
+    for (const line of after) expect(line).not.toContain("BKIT_PR_CONFLICT_CHECK");
+  });
+});
diff --git a/.bkit/core/engine/checks/tips/catalogue.test.ts b/.bkit/core/engine/checks/tips/catalogue.test.ts
index 418854b4d..4e36f3837 100644
--- a/.bkit/core/engine/checks/tips/catalogue.test.ts
+++ b/.bkit/core/engine/checks/tips/catalogue.test.ts
@@ -475,7 +475,20 @@ describe("SETUP_TIPS — detection", () => {
     expect(tip("pre-push-pr-conflict").fires(cwd)).toBe(false);
     write(".husky/pre-push", "pnpm -s bkit ci push-gate\n");
     expect(tip("pre-push-pr-conflict").fires(cwd)).toBe(true);
+    write(
+      ".husky/pre-push",
+      'PUSH_BRANCH_SHA="$l"\ngit merge-tree --write-tree --name-only "$BASE" "$SHA"\n',
+    );
+    expect(tip("pre-push-pr-conflict").fires(cwd)).toBe(false);
+  });
+
+  it("pre-push-pr-conflict fires for a hook with merge-tree but no PUSH_BRANCH_SHA", () => {
     write(".husky/pre-push", 'git merge-tree --write-tree --name-only "$BASE" "$SHA"\n');
+    expect(tip("pre-push-pr-conflict").fires(cwd)).toBe(true);
+    write(
+      ".husky/pre-push",
+      'PUSH_BRANCH_SHA="$local_sha"\ngit merge-tree --write-tree --name-only "$BASE" "$PUSH_BRANCH_SHA"\n',
+    );
     expect(tip("pre-push-pr-conflict").fires(cwd)).toBe(false);
   });
 
diff --git a/.bkit/core/engine/checks/tips/catalogue.ts b/.bkit/core/engine/checks/tips/catalogue.ts
index ab89722f0..80210f3a5 100644
--- a/.bkit/core/engine/checks/tips/catalogue.ts
+++ b/.bkit/core/engine/checks/tips/catalogue.ts
@@ -474,11 +474,12 @@ export const SETUP_TIPS: readonly SetupTip[] = [
     title: "Stop a push whose PR no longer merges",
     line: "Your pre-push hook runs the whole gate even when the branch's open PR conflicts with its base, and CI never starts.",
     why: "The newer hook looks up the open PR once, fetches its base and trial-merges the pushed commit. A conflict stops the push in seconds and names the files; a lookup or fetch that cannot answer only warns.",
-    ask: "Paste the `Open-PR lookup` block (above the CI-suppressor guard, which now reads the PR number from it) and the `PR conflict` block (before `pnpm bkit check`) of .bkit/templates/.husky/pre-push into .husky/pre-push.",
+    ask: "Paste the `Open-PR lookup` block (above the CI-suppressor guard, which now reads the PR number from it) and the `PR conflict` block (before `pnpm bkit check`) of .bkit/templates/.husky/pre-push into .husky/pre-push, and add the `PUSH_BRANCH_SHA` line of its stdin loop: without it the check never runs.",
     steps: "`.bkit/templates.md` § Git hooks.",
     fires: (cwd) => {
       if (!exists(cwd, ".husky/pre-push")) return false;
-      return !fs.readFileSync(path.join(cwd, ".husky/pre-push"), "utf-8").includes("merge-tree");
+      const hook = fs.readFileSync(path.join(cwd, ".husky/pre-push"), "utf-8");
+      return !hook.includes("merge-tree") || !hook.includes("PUSH_BRANCH_SHA=");
     },
   },
   {
diff --git a/.bkit/core/workflows/bkit-ship.md b/.bkit/core/workflows/bkit-ship.md
index cb144d1d8..cc145028b 100644
--- a/.bkit/core/workflows/bkit-ship.md
+++ b/.bkit/core/workflows/bkit-ship.md
@@ -279,7 +279,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 2 → Step 4 sub-step 2.
    - **If** exit 0 → hold `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD` → publish the resulting local head before sweep/docs bookkeeping.
      ```bash
-     "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+     BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
      ```
      Route:
      **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
@@ -303,7 +303,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
 
      ```bash
-     "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
+     BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
      OPEN_EXIT=0
      "{BKIT}" prs open --fid="{FID}" --title="feat({FID}): {summary}" --issue="{ISSUE_ID}" --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --file="{STATUS}" --workflow=ship --note="⚠️ PR opened by /bkit-ship — no PR existed for this branch." || OPEN_EXIT=$?
      case "$OPEN_EXIT" in 0 | 80) "{BKIT}" status meta --file="{STATUS}" --workflow=ship --opened-pr >/dev/null || exit 1 ;; esac
@@ -429,7 +429,7 @@ description: "Ship Feature — Autonomous merge and archive"
    ```
    Hold `basePath` as `BASE_PATH`, `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD`. **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 3 → Step 4 sub-step 2. **If** another non-zero exit → **Failure Path**.
    ```bash
-   "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
    ```
    Route:
    **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
diff --git a/.bkit/templates.md b/.bkit/templates.md
index d0adcfda1..5d8064a50 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -1,6 +1,6 @@
 # Templates — copy and own
 
-<!-- bkit:managed v6.1.1 — do not edit; run `bkit upgrade` to refresh -->
+{{BKIT_MANAGED_MARKER}}
 
 > [!CAUTION]
 > **Purpose:** Every template bkit ships but never installs: what each one does, where to copy it, and how to install the tool behind it.
@@ -325,6 +325,8 @@ chmod +x .husky/pre-commit .husky/pre-push
   - A fast check, run before `bkit check` and the gate. One `gh pr list --head <branch> --state open` lookup (every branch but `dev` / `main`) gives the PR number and its base; the `[skip ci]` guard reads the number from it.
   - **If** the branch has an open PR → the hook fetches the base from `origin`, then runs `git merge-tree --write-tree --name-only` on `origin/<base>` and the pushed commit. Conflicts → the push is blocked, naming the files and the fix. This holds for a min push too, because a conflicting PR never starts CI.
   - **If** `gh` is missing or fails, the base fetch fails, or `git merge-tree` fails for another reason → the hook warns that the check was skipped, and the push goes on. No open PR → no fetch and no message.
+  - The lookup keeps only same-repo PRs, so a fork PR with the same head branch name is ignored. The base is fetched with an explicit refspec, and the trial merge ignores the work tree's `.gitattributes`, as GitHub does, so a `merge=union` ledger conflict blocks.
+  - `BKIT_PR_CONFLICT_CHECK=false` skips the whole check with one stderr line. `/bkit-ship` sets it on its pushes before Step 4 `Integrate`, because the conflict is what Step 4 merges away, and never on later pushes, so the merged head is checked.
   - A repo whose hook copy lacks this gets the `pre-push-pr-conflict` tip.
 - Slop base:
   - **If** the push is to `dev` **and** `scripts/ci/lanes/bkit-resolve-push-base.mjs` is copied → the hook runs it with `--local --branch=dev --head=<pushed sha>`, and exports `SLOP_BASE_REF` as CI's push base. That base is the head of the last green CI push run on `dev`, else `origin/dev`. The hook prints the base and its source.
diff --git a/.bkit/templates/.husky/pre-push b/.bkit/templates/.husky/pre-push
index 50edb2553..fb2169c73 100755
--- a/.bkit/templates/.husky/pre-push
+++ b/.bkit/templates/.husky/pre-push
@@ -144,7 +144,7 @@ case "$BRANCH" in
   *)
     if command -v gh >/dev/null 2>&1; then
       # strip hook-injected GIT_DIR/GIT_WORK_TREE so gh resolves the repo from cwd (worktree-safe)
-      if PR_INFO=$(env -u GIT_DIR -u GIT_WORK_TREE gh pr list --head "$BRANCH" --state open --json number,baseRefName --jq '.[0] | select(. != null) | "\(.number) \(.baseRefName)"' < /dev/null 2>/dev/null); then
+      if PR_INFO=$(env -u GIT_DIR -u GIT_WORK_TREE gh pr list --head "$BRANCH" --state open --json number,baseRefName,isCrossRepository --jq 'map(select(.isCrossRepository | not)) | .[0] | select(. != null) | "\(.number) \(.baseRefName)"' < /dev/null 2>/dev/null); then
         PR_LOOKUP=ok
         OPEN_PR=${PR_INFO%% *}
         case "$PR_INFO" in *" "*) PR_BASE=${PR_INFO#* } ;; esac
@@ -230,9 +230,18 @@ case "$BRANCH" in
     if [ "$PR_LOOKUP" != "ok" ]; then
       [ -z "$PR_LOOKUP" ] || echo "[pre-push] WARN: PR conflict check skipped — $PR_LOOKUP, so whether '$BRANCH' has an open PR that conflicts is unknown." >&2
     elif [ -n "$OPEN_PR" ] && [ -n "$PR_BASE" ] && [ -n "$PUSH_BRANCH_SHA" ]; then
-      if git fetch --quiet origin "$PR_BASE" < /dev/null > /dev/null 2>&1; then
+      if [ "${BKIT_PR_CONFLICT_CHECK:-}" = "false" ]; then
+        echo "[pre-push] PR conflict check off (BKIT_PR_CONFLICT_CHECK=false)." >&2
+      # explicit refspec: a single-branch clone's `git fetch origin <base>` would leave no origin/<base>
+      elif git fetch --quiet origin "+refs/heads/$PR_BASE:refs/remotes/origin/$PR_BASE" < /dev/null > /dev/null 2>&1; then
         PR_MERGE_RC=0
-        PR_MERGE_OUT=$(git merge-tree --write-tree --name-only "refs/remotes/origin/$PR_BASE" "$PUSH_BRANCH_SHA" < /dev/null 2>/dev/null) || PR_MERGE_RC=$?
+        # empty attribute source: GitHub applies no merge=union driver, so neither does this trial merge
+        PR_MERGE_OUT=$(git --attr-source="$(git hash-object -t tree /dev/null)" merge-tree --write-tree --name-only "refs/remotes/origin/$PR_BASE" "$PUSH_BRANCH_SHA" < /dev/null 2>/dev/null) || PR_MERGE_RC=$?
+        # exit 1 is a conflict only when the first output line is the result tree's OID
+        case "$PR_MERGE_OUT" in
+          [0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]*) ;;
+          *) [ "$PR_MERGE_RC" != "1" ] || PR_MERGE_RC=2 ;;
+        esac
         if [ "$PR_MERGE_RC" = "1" ]; then
           echo "[pre-push] BLOCKED: PR #$OPEN_PR does not merge into '$PR_BASE', so CI would not start. Conflicting files:" >&2
           echo "$PR_MERGE_OUT" | sed '1d;/^$/,$d;s/^/[pre-push]   /' >&2
diff --git a/.husky/pre-push b/.husky/pre-push
index 843b1f92b..0c99ab35d 100755
--- a/.husky/pre-push
+++ b/.husky/pre-push
@@ -201,7 +201,7 @@ case "$BRANCH" in
   *)
     if command -v gh >/dev/null 2>&1; then
       # strip hook-injected GIT_DIR/GIT_WORK_TREE so gh resolves the repo from cwd (worktree-safe)
-      if PR_INFO=$(env -u GIT_DIR -u GIT_WORK_TREE gh pr list --head "$BRANCH" --state open --json number,baseRefName --jq '.[0] | select(. != null) | "\(.number) \(.baseRefName)"' < /dev/null 2>/dev/null); then
+      if PR_INFO=$(env -u GIT_DIR -u GIT_WORK_TREE gh pr list --head "$BRANCH" --state open --json number,baseRefName,isCrossRepository --jq 'map(select(.isCrossRepository | not)) | .[0] | select(. != null) | "\(.number) \(.baseRefName)"' < /dev/null 2>/dev/null); then
         PR_LOOKUP=ok
         OPEN_PR=${PR_INFO%% *}
         case "$PR_INFO" in *" "*) PR_BASE=${PR_INFO#* } ;; esac
@@ -287,9 +287,18 @@ case "$BRANCH" in
     if [ "$PR_LOOKUP" != "ok" ]; then
       [ -z "$PR_LOOKUP" ] || echo "[pre-push] WARN: PR conflict check skipped — $PR_LOOKUP, so whether '$BRANCH' has an open PR that conflicts is unknown." >&2
     elif [ -n "$OPEN_PR" ] && [ -n "$PR_BASE" ] && [ -n "$PUSH_BRANCH_SHA" ]; then
-      if git fetch --quiet origin "$PR_BASE" < /dev/null > /dev/null 2>&1; then
+      if [ "${BKIT_PR_CONFLICT_CHECK:-}" = "false" ]; then
+        echo "[pre-push] PR conflict check off (BKIT_PR_CONFLICT_CHECK=false)." >&2
+      # explicit refspec: a single-branch clone's `git fetch origin <base>` would leave no origin/<base>
+      elif git fetch --quiet origin "+refs/heads/$PR_BASE:refs/remotes/origin/$PR_BASE" < /dev/null > /dev/null 2>&1; then
         PR_MERGE_RC=0
-        PR_MERGE_OUT=$(git merge-tree --write-tree --name-only "refs/remotes/origin/$PR_BASE" "$PUSH_BRANCH_SHA" < /dev/null 2>/dev/null) || PR_MERGE_RC=$?
+        # empty attribute source: GitHub applies no merge=union driver, so neither does this trial merge
+        PR_MERGE_OUT=$(git --attr-source="$(git hash-object -t tree /dev/null)" merge-tree --write-tree --name-only "refs/remotes/origin/$PR_BASE" "$PUSH_BRANCH_SHA" < /dev/null 2>/dev/null) || PR_MERGE_RC=$?
+        # exit 1 is a conflict only when the first output line is the result tree's OID
+        case "$PR_MERGE_OUT" in
+          [0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]*) ;;
+          *) [ "$PR_MERGE_RC" != "1" ] || PR_MERGE_RC=2 ;;
+        esac
         if [ "$PR_MERGE_RC" = "1" ]; then
           echo "[pre-push] BLOCKED: PR #$OPEN_PR does not merge into '$PR_BASE', so CI would not start. Conflicting files:" >&2
           echo "$PR_MERGE_OUT" | sed '1d;/^$/,$d;s/^/[pre-push]   /' >&2
diff --git a/dist/checks/tips/catalogue.js b/dist/checks/tips/catalogue.js
index c7594d4f7..012838a9b 100644
--- a/dist/checks/tips/catalogue.js
+++ b/dist/checks/tips/catalogue.js
@@ -395,12 +395,13 @@ export const SETUP_TIPS = [
         title: "Stop a push whose PR no longer merges",
         line: "Your pre-push hook runs the whole gate even when the branch's open PR conflicts with its base, and CI never starts.",
         why: "The newer hook looks up the open PR once, fetches its base and trial-merges the pushed commit. A conflict stops the push in seconds and names the files; a lookup or fetch that cannot answer only warns.",
-        ask: "Paste the `Open-PR lookup` block (above the CI-suppressor guard, which now reads the PR number from it) and the `PR conflict` block (before `pnpm bkit check`) of .bkit/templates/.husky/pre-push into .husky/pre-push.",
+        ask: "Paste the `Open-PR lookup` block (above the CI-suppressor guard, which now reads the PR number from it) and the `PR conflict` block (before `pnpm bkit check`) of .bkit/templates/.husky/pre-push into .husky/pre-push, and add the `PUSH_BRANCH_SHA` line of its stdin loop: without it the check never runs.",
         steps: "`.bkit/templates.md` § Git hooks.",
         fires: (cwd) => {
             if (!exists(cwd, ".husky/pre-push"))
                 return false;
-            return !fs.readFileSync(path.join(cwd, ".husky/pre-push"), "utf-8").includes("merge-tree");
+            const hook = fs.readFileSync(path.join(cwd, ".husky/pre-push"), "utf-8");
+            return !hook.includes("merge-tree") || !hook.includes("PUSH_BRANCH_SHA=");
         },
     },
     {
