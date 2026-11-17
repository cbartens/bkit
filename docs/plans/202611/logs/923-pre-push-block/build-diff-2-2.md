diff --git a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
index 5596ae75c..f2762ffec 100644
--- a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
@@ -235,7 +235,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 2 → Step 4 sub-step 2.
    - **If** exit 0 → hold `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD` → publish the resulting local head before sweep/docs bookkeeping.
      ```bash
-     "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+     BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
      ```
      Route:
      **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
@@ -259,7 +259,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
 
      ```bash
-     "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
+     BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
      OPEN_EXIT=0
      "{BKIT}" prs open --fid="{FID}" --title="feat({FID}): {summary}" --issue="{ISSUE_ID}" --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --file="{STATUS}" --workflow=ship --note="⚠️ PR opened by /bkit-ship — no PR existed for this branch." || OPEN_EXIT=$?
      case "$OPEN_EXIT" in 0 | 80) "{BKIT}" status meta --file="{STATUS}" --workflow=ship --opened-pr >/dev/null || exit 1 ;; esac
@@ -385,7 +385,7 @@ description: "Ship Feature — Autonomous merge and archive"
    ```
    Hold `basePath` as `BASE_PATH`, `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD`. **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 3 → Step 4 sub-step 2. **If** another non-zero exit → **Failure Path**.
    ```bash
-   "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
    ```
    Route:
    **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
diff --git a/.agents/skills/bkit-ship/SKILL.md b/.agents/skills/bkit-ship/SKILL.md
index d1cdc0a8d..bd9c4c40c 100644
--- a/.agents/skills/bkit-ship/SKILL.md
+++ b/.agents/skills/bkit-ship/SKILL.md
@@ -235,7 +235,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 2 → Step 4 sub-step 2.
    - **If** exit 0 → hold `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD` → publish the resulting local head before sweep/docs bookkeeping.
      ```bash
-     "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+     BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
      ```
      Route:
      **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
@@ -259,7 +259,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
 
      ```bash
-     "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
+     BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
      OPEN_EXIT=0
      "{BKIT}" prs open --fid="{FID}" --title="feat({FID}): {summary}" --issue="{ISSUE_ID}" --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --file="{STATUS}" --workflow=ship --note="⚠️ PR opened by /bkit-ship — no PR existed for this branch." || OPEN_EXIT=$?
      case "$OPEN_EXIT" in 0 | 80) "{BKIT}" status meta --file="{STATUS}" --workflow=ship --opened-pr >/dev/null || exit 1 ;; esac
@@ -385,7 +385,7 @@ description: "Ship Feature — Autonomous merge and archive"
    ```
    Hold `basePath` as `BASE_PATH`, `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD`. **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 3 → Step 4 sub-step 2. **If** another non-zero exit → **Failure Path**.
    ```bash
-   "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
    ```
    Route:
    **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
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
index d0adcfda1..5ce3a11b8 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
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
diff --git a/.bkit/version b/.bkit/version
index d4f957856..27d78f9f9 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -19,7 +19,7 @@
     ".claude/commands/bkit-debug.md": "d90b236a686546f2206d6c24e4d8cb6b2cf4b2c0393b510139a214c9e4ecab0d",
     ".claude/commands/bkit-design.md": "19fc3688e1f0063c2ff02b61921c6c3153f5d3892eb08c812643507539f8790a",
     ".claude/commands/bkit-plan.md": "21e65d37fb3fede54a1edbb0d6a71e589178a0d6991b007b24770aedf818afde",
-    ".claude/commands/bkit-ship.md": "2078cd392c35e66ff23ef8f5325e5351c72f1d03985fcfa1f0f655a1e6461388",
+    ".claude/commands/bkit-ship.md": "d02428233bc88b6c845d52de7f8635cf5f46ee3107d14976d9dd2c943485cfe8",
     ".claude/agents/bkit-build-challenge-1.md": "20ff6fcaf48d5a6418c696c88e796101c34083326b8353bf6ec766422c4c734f",
     ".claude/agents/bkit-build-challenge-2.md": "0ef8a829af9b89602a75ac257a093e4a47169ca9c2a4c216d6f11937e2e9c48f",
     ".claude/agents/bkit-build-install-skills.md": "0249b5fe6550c45afe95972d1d3f4a65f7e159a74038ce9179ca1fceb29e1d12",
@@ -51,7 +51,7 @@
     ".cursor/commands/bkit-debug.md": "e9744cc9f7a0143d42d91c34dd057e65489632548177ae66df1e6519ffe2d738",
     ".cursor/commands/bkit-design.md": "50503d506d3be97b176612647f202e4428e43446a3e29c9f63c931ebdc32f2c1",
     ".cursor/commands/bkit-plan.md": "3ce05ec47616b860b785c128c5a80e3e81dda9951d84744a8f8c93063c3a91ed",
-    ".cursor/commands/bkit-ship.md": "91f593d9afb0dd0180ac9196bc6a8379f99b34bb30b840ee4cdbd1412ca7236e",
+    ".cursor/commands/bkit-ship.md": "99672527a5dbfad8293cac484234a4590dabc2c54c06fbfd32cb780e553af38f",
     ".cursor/agents/bkit-build-challenge-1.md": "91f6446c505416d377dcbabcc49030e704384980f3ed232694069108504c2dab",
     ".cursor/agents/bkit-build-challenge-2.md": "6399d8b34ff1be2a63b77b911fd8321f80bd0bf64550103f809cdf5194820c24",
     ".cursor/agents/bkit-build-install-skills.md": "9f77d5ce2bc7e5d1c60d8860b5a06d81091f9194522607151a76838fc895da6d",
@@ -109,7 +109,7 @@
     ".opencode/commands/bkit-debug.md": "3f3c872889c0e09a744fc8c6c41af1d63ac1a7ee53a2ce9619edce7161aedead",
     ".opencode/commands/bkit-design.md": "43ef687878db97f39336b4e91ffe1adb845048999b5b686864898b4cc58a09a7",
     ".opencode/commands/bkit-plan.md": "afd4b5bb5a1c7d14ec9d4257ebe2f415e57c2e6ad625ec8c993c429acc886a42",
-    ".opencode/commands/bkit-ship.md": "3ae9fc272d67c83a67b2a4980556a412e95a407d7c8c48e8c25758d014af4735",
+    ".opencode/commands/bkit-ship.md": "00697a0c6f314b49c3470230bbb8875ca94b9940ec5cad92414a8853cebea263",
     ".claude/agents/bkit-design-spike.md": "334a96f4f3fdb0a190c8d4cca32c38bee577138fd4acf51036302b325964e889",
     ".cursor/agents/bkit-design-spike.md": "06729e7a0ffa9f98b109433b56dcfc1e3d0afad12c55250a28eee91549ea45a3",
     ".opencode/agents/bkit-design-spike.md": "28e5d35f911887fe7b08a74983a48fc131cd5693b7546af8623e9bc75f8e54f4",
@@ -205,7 +205,7 @@
     ".cursor/agents/bkit-utility-update-roadmap.md": "d71b5fb0d3b1224e22c6de4944021d8571fdd8c003f1d6c2be9dd77334b13b10",
     "docs/templates/bkit-audit-agents.md": "b274136511b07082dc5f33bcbad7f95e36d3ce84b747e211b2cde3f183a375b9",
     "docs/templates/bkit-audit-prompts.md": "591c1a4a79bcfaabb7712d6c28cf88220d2186e77055db936d8a69287ec7d9ef",
-    ".bkit/templates.md": "163cbc1c932eba882ddedfd8f4c0077772270b9237ba3f09217fe7ab44afb224",
+    ".bkit/templates.md": "91f101901e0c20cb8ccf4697cd8d65f56d52f70a0203b83c79586391aa44fd97",
     "docs/templates/bkit-audit-adoption.md": "a0b56a7659e5d8a407c5b1c36201045d6a23e0a6f1b3353aa5e5f7d38c31fd9b",
     ".bkit/cloud.md": "4b3fbcae7dcfdf991aa78774f4c487d3aff343b90fc27bbdf3f4aa492320dd4c",
     ".bkit/comparison.md": "48845a4c08abe236dcb5af4947db755a10aad06996a87c5d5b1bed07528514de",
diff --git a/.claude/commands/bkit-ship.md b/.claude/commands/bkit-ship.md
index d142079b4..02cb2c948 100644
--- a/.claude/commands/bkit-ship.md
+++ b/.claude/commands/bkit-ship.md
@@ -234,7 +234,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 2 → Step 4 sub-step 2.
    - **If** exit 0 → hold `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD` → publish the resulting local head before sweep/docs bookkeeping.
      ```bash
-     "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+     BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
      ```
      Route:
      **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
@@ -258,7 +258,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
 
      ```bash
-     "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
+     BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
      OPEN_EXIT=0
      "{BKIT}" prs open --fid="{FID}" --title="feat({FID}): {summary}" --issue="{ISSUE_ID}" --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --file="{STATUS}" --workflow=ship --note="⚠️ PR opened by /bkit-ship — no PR existed for this branch." || OPEN_EXIT=$?
      case "$OPEN_EXIT" in 0 | 80) "{BKIT}" status meta --file="{STATUS}" --workflow=ship --opened-pr >/dev/null || exit 1 ;; esac
@@ -384,7 +384,7 @@ description: "Ship Feature — Autonomous merge and archive"
    ```
    Hold `basePath` as `BASE_PATH`, `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD`. **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 3 → Step 4 sub-step 2. **If** another non-zero exit → **Failure Path**.
    ```bash
-   "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
    ```
    Route:
    **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
diff --git a/.cursor/commands/bkit-ship.md b/.cursor/commands/bkit-ship.md
index 910b8b28d..c58fa8b13 100644
--- a/.cursor/commands/bkit-ship.md
+++ b/.cursor/commands/bkit-ship.md
@@ -233,7 +233,7 @@ Ship Feature — Autonomous merge and archive
    - **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 2 → Step 4 sub-step 2.
    - **If** exit 0 → hold `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD` → publish the resulting local head before sweep/docs bookkeeping.
      ```bash
-     "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+     BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
      ```
      Route:
      **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
@@ -257,7 +257,7 @@ Ship Feature — Autonomous merge and archive
    - **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
 
      ```bash
-     "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
+     BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
      OPEN_EXIT=0
      "{BKIT}" prs open --fid="{FID}" --title="feat({FID}): {summary}" --issue="{ISSUE_ID}" --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --file="{STATUS}" --workflow=ship --note="⚠️ PR opened by /bkit-ship — no PR existed for this branch." || OPEN_EXIT=$?
      case "$OPEN_EXIT" in 0 | 80) "{BKIT}" status meta --file="{STATUS}" --workflow=ship --opened-pr >/dev/null || exit 1 ;; esac
@@ -383,7 +383,7 @@ Ship Feature — Autonomous merge and archive
    ```
    Hold `basePath` as `BASE_PATH`, `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD`. **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 3 → Step 4 sub-step 2. **If** another non-zero exit → **Failure Path**.
    ```bash
-   "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
    ```
    Route:
    **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
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
diff --git a/.opencode/commands/bkit-ship.md b/.opencode/commands/bkit-ship.md
index d6a611040..2e7b45ee7 100644
--- a/.opencode/commands/bkit-ship.md
+++ b/.opencode/commands/bkit-ship.md
@@ -237,7 +237,7 @@ $ARGUMENTS
    - **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 2 → Step 4 sub-step 2.
    - **If** exit 0 → hold `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD` → publish the resulting local head before sweep/docs bookkeeping.
      ```bash
-     "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+     BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
      ```
      Route:
      **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
@@ -261,7 +261,7 @@ $ARGUMENTS
    - **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
 
      ```bash
-     "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
+     BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
      OPEN_EXIT=0
      "{BKIT}" prs open --fid="{FID}" --title="feat({FID}): {summary}" --issue="{ISSUE_ID}" --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --file="{STATUS}" --workflow=ship --note="⚠️ PR opened by /bkit-ship — no PR existed for this branch." || OPEN_EXIT=$?
      case "$OPEN_EXIT" in 0 | 80) "{BKIT}" status meta --file="{STATUS}" --workflow=ship --opened-pr >/dev/null || exit 1 ;; esac
@@ -387,7 +387,7 @@ $ARGUMENTS
    ```
    Hold `basePath` as `BASE_PATH`, `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD`. **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 3 → Step 4 sub-step 2. **If** another non-zero exit → **Failure Path**.
    ```bash
-   "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
    ```
    Route:
    **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
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
