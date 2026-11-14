diff --git a/.agents/plugins/bkit/skills/bkit-debug/SKILL.md b/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
index 5cbbcf316..dd40a89e6 100644
--- a/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
@@ -592,7 +592,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```
 3. **Skip if** `BRANCH` = `dev` (the Step 11 close pushes). Push:
    ```bash
-   "{BKIT}" branches push --mode=feature
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature
    ```
    Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -623,7 +623,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```
    **Skip if** `BRANCH` = `dev` (the Step 11 close pushes). Push:
    ```bash
-   "{BKIT}" branches push --mode=feature
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature
    ```
 3. Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -693,7 +693,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
      ```bash
      "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
-     "{BKIT}" branches push --mode=feature --require-ci
+     BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature --require-ci
      ```
 
      Route:
@@ -733,7 +733,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 6. **If** `TRIGGER_PR` = 1 → commit and push the CI-triggering head. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when `ISSUE_ID` is empty:
 
    ```bash
-   "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
    ```
 
    Route:
diff --git a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
index f2762ffec..501ce5bf6 100644
--- a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
@@ -438,7 +438,7 @@ description: "Ship Feature — Autonomous merge and archive"
 3. Push the merged branch. The merge adds commits on top of the pushed head, so the push is plain, NEVER forced:
 
    ```bash
-   "{BKIT}" branches push --mode=plain >/dev/null
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
    ```
 
    Route:
@@ -597,7 +597,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    Hold `parentSha` as `CODE_HEAD`.
 2. **If** the printed `outcome` = committed → push, and NEVER force:
    ```bash
-   "{BKIT}" branches push --mode=plain >/dev/null
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
    ```
    Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -699,7 +699,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
        - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push the fix, and NEVER force:
 
          ```bash
-         "{BKIT}" branches push --mode=plain >/dev/null
+         BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
          ```
 
          Route:
diff --git a/.agents/skills/bkit-debug/SKILL.md b/.agents/skills/bkit-debug/SKILL.md
index 87acba36a..c5627e7c5 100644
--- a/.agents/skills/bkit-debug/SKILL.md
+++ b/.agents/skills/bkit-debug/SKILL.md
@@ -592,7 +592,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```
 3. **Skip if** `BRANCH` = `dev` (the Step 11 close pushes). Push:
    ```bash
-   "{BKIT}" branches push --mode=feature
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature
    ```
    Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -623,7 +623,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```
    **Skip if** `BRANCH` = `dev` (the Step 11 close pushes). Push:
    ```bash
-   "{BKIT}" branches push --mode=feature
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature
    ```
 3. Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -693,7 +693,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
      ```bash
      "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
-     "{BKIT}" branches push --mode=feature --require-ci
+     BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature --require-ci
      ```
 
      Route:
@@ -733,7 +733,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 6. **If** `TRIGGER_PR` = 1 → commit and push the CI-triggering head. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when `ISSUE_ID` is empty:
 
    ```bash
-   "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
    ```
 
    Route:
diff --git a/.agents/skills/bkit-ship/SKILL.md b/.agents/skills/bkit-ship/SKILL.md
index bd9c4c40c..ee1badb36 100644
--- a/.agents/skills/bkit-ship/SKILL.md
+++ b/.agents/skills/bkit-ship/SKILL.md
@@ -438,7 +438,7 @@ description: "Ship Feature — Autonomous merge and archive"
 3. Push the merged branch. The merge adds commits on top of the pushed head, so the push is plain, NEVER forced:
 
    ```bash
-   "{BKIT}" branches push --mode=plain >/dev/null
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
    ```
 
    Route:
@@ -597,7 +597,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    Hold `parentSha` as `CODE_HEAD`.
 2. **If** the printed `outcome` = committed → push, and NEVER force:
    ```bash
-   "{BKIT}" branches push --mode=plain >/dev/null
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
    ```
    Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -699,7 +699,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
        - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push the fix, and NEVER force:
 
          ```bash
-         "{BKIT}" branches push --mode=plain >/dev/null
+         BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
          ```
 
          Route:
diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index 5d8064a50..5806858b0 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -324,9 +324,9 @@ chmod +x .husky/pre-commit .husky/pre-push
 - PR conflict check:
   - A fast check, run before `bkit check` and the gate. One `gh pr list --head <branch> --state open` lookup (every branch but `dev` / `main`) gives the PR number and its base; the `[skip ci]` guard reads the number from it.
   - **If** the branch has an open PR → the hook fetches the base from `origin`, then runs `git merge-tree --write-tree --name-only` on `origin/<base>` and the pushed commit. Conflicts → the push is blocked, naming the files and the fix. This holds for a min push too, because a conflicting PR never starts CI.
-  - **If** `gh` is missing or fails, the base fetch fails, or `git merge-tree` fails for another reason → the hook warns that the check was skipped, and the push goes on. No open PR → no fetch and no message.
+  - **If** `gh` is missing or fails, the clone is shallow (fix: `git fetch --unshallow`), the base fetch fails, or `git merge-tree` fails for another reason → the hook warns that the check was skipped, and the push goes on. No open PR → no fetch and no message.
   - The lookup keeps only same-repo PRs, so a fork PR with the same head branch name is ignored. The base is fetched with an explicit refspec, and the trial merge ignores the work tree's `.gitattributes`, as GitHub does, so a `merge=union` ledger conflict blocks.
-  - `BKIT_PR_CONFLICT_CHECK=false` skips the whole check with one stderr line. `/bkit-ship` sets it on its pushes before Step 4 `Integrate`, because the conflict is what Step 4 merges away, and never on later pushes, so the merged head is checked.
+  - `BKIT_PR_CONFLICT_CHECK=false` skips the whole check with one stderr line. `/bkit-ship` sets it on every push, because the conflict is what Step 4 merges away and a `dev` that moves after Step 4 is left to the Step 10 merge gate's `--fresh-base`. `/bkit-debug` sets it on its feature-branch pushes, so fix commits always reach `origin`.
   - A repo whose hook copy lacks this gets the `pre-push-pr-conflict` tip.
 - Slop base:
   - **If** the push is to `dev` **and** `scripts/ci/lanes/bkit-resolve-push-base.mjs` is copied → the hook runs it with `--local --branch=dev --head=<pushed sha>`, and exports `SLOP_BASE_REF` as CI's push base. That base is the head of the last green CI push run on `dev`, else `origin/dev`. The hook prints the base and its source.
diff --git a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
index f07802ae4..2731f1831 100644
--- a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
@@ -1920,4 +1920,46 @@ describe(".husky/pre-push PR conflict", () => {
       expect(r.gated, hook).toBe(true);
     }
   });
+
+  it("shallow clone → no base fetch, warns, gates run", () => {
+    setup(true);
+    installPnpm(false);
+    installGh("7 dev");
+    gitIn("push", "-q", "origin", "feat/1-x");
+    const origin = path.join(tmp, "origin.git");
+    const full = path.join(tmp, "work-full");
+    fs.renameSync(work, full);
+    const env = Object.fromEntries(
+      Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
+    );
+    const cloned = spawnSync(
+      "git",
+      [
+        "clone",
+        "-q",
+        "--depth=1",
+        "--single-branch",
+        "--branch",
+        "feat/1-x",
+        `file://${origin}`,
+        work,
+      ],
+      { encoding: "utf-8", env },
+    );
+    expect(cloned.status, cloned.stderr).toBe(0);
+    expect(gitIn("rev-parse", "--is-shallow-repository")).toBe("true");
+    for (const hook of HOOKS) {
+      const r = push(hook);
+      expect(r.status, hook).toBe(0);
+      expect(
+        r.git.filter((l) => l.startsWith("fetch")),
+        hook,
+      ).toEqual([]);
+      expect(r.stderr, hook).toMatch(/shallow/i);
+      expect(r.stderr, hook).toContain("git fetch --unshallow");
+      expect(r.stderr, hook).not.toContain("git merge-tree failed");
+      expect(r.stderr, hook).not.toContain("BLOCKED");
+      expect(r.gated, hook).toBe(true);
+    }
+  });
 });
diff --git a/.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts b/.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts
index 0523af844..580bed670 100644
--- a/.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts
+++ b/.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts
@@ -613,3 +613,13 @@ describe("Debug CI evidence sequence", () => {
     expect(fs.readFileSync(path.join(wrong.cwd, "source.txt"), "utf8")).toBe("unfixed\n");
   });
 });
+
+describe("Debug PR conflict check switch", () => {
+  it("debug switches the PR conflict check off for every feature-branch push", () => {
+    const pushLines = WORKFLOW.split("\n").filter((line) =>
+      line.includes("branches push --mode=feature"),
+    );
+    expect(pushLines.length).toBeGreaterThanOrEqual(4);
+    for (const line of pushLines) expect(line).toContain("BKIT_PR_CONFLICT_CHECK=false");
+  });
+});
diff --git a/.bkit/core/engine/audits/workflows/ship-invariants.test.ts b/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
index 1afbe5014..07a4cc6bb 100644
--- a/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
+++ b/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
@@ -431,14 +431,18 @@ describe("bkit-ship.md — push-timing invariant (feature-branch pushes before m
     const pushes = fencedLinesByStep(readShip())
       .filter(isIntegratePush)
       .map((l) => l.line);
-    expect(pushes).toEqual(['"{BKIT}" branches push --mode=plain >/dev/null']);
+    expect(pushes).toEqual([
+      'BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null',
+    ]);
   });
 
   it("the pre-merge bookkeeping push is a plain push — never forced", () => {
     const pushes = fencedLinesByStep(readShip())
       .filter(isBookkeepingPush)
       .map((l) => l.line);
-    expect(pushes).toEqual(['"{BKIT}" branches push --mode=plain >/dev/null']);
+    expect(pushes).toEqual([
+      'BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null',
+    ]);
   });
 
   it("the pre-merge bookkeeping commit stages through bkit ledgers --scope=pr, after the step-done row", () => {
@@ -1082,17 +1086,11 @@ describe("bkit-ship.md — red CI names /bkit-debug", () => {
 });
 
 describe("ship PR conflict check switch", () => {
-  it("ship switches the PR conflict check off for its pushes before Step 4, and only those", () => {
-    const ship = readShip();
-    const step4 = ship.indexOf("## 🧠 Step 4 — Integrate");
-    expect(step4).toBeGreaterThan(0);
-    const pushLines = (text: string) =>
-      text.split("\n").filter((line) => line.includes("branches push"));
-    const before = pushLines(ship.slice(0, step4));
-    const after = pushLines(ship.slice(step4));
-    expect(before.length).toBeGreaterThanOrEqual(3);
-    for (const line of before) expect(line).toContain("BKIT_PR_CONFLICT_CHECK=false");
-    expect(after.length).toBeGreaterThan(0);
-    for (const line of after) expect(line).not.toContain("BKIT_PR_CONFLICT_CHECK");
+  it("ship switches the PR conflict check off for every push", () => {
+    const pushLines = readShip()
+      .split("\n")
+      .filter((line) => line.includes("branches push"));
+    expect(pushLines.length).toBeGreaterThanOrEqual(6);
+    for (const line of pushLines) expect(line).toContain("BKIT_PR_CONFLICT_CHECK=false");
   });
 });
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
index dbb5c98f8..fd6f2b7a9 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
@@ -549,7 +549,7 @@ _No tracker connected, skip step._
    ```
 3. **Skip if** `BRANCH` = `dev` (the Step 11 close pushes). Push:
    ```bash
-   "{BKIT}" branches push --mode=feature
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature
    ```
    Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -580,7 +580,7 @@ _No tracker connected, skip step._
    ```
    **Skip if** `BRANCH` = `dev` (the Step 11 close pushes). Push:
    ```bash
-   "{BKIT}" branches push --mode=feature
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature
    ```
 3. Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -641,7 +641,7 @@ _No tracker connected, skip step._
 
      ```bash
      "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
-     "{BKIT}" branches push --mode=feature --require-ci
+     BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature --require-ci
      ```
 
      Route:
@@ -681,7 +681,7 @@ _No tracker connected, skip step._
 6. **If** `TRIGGER_PR` = 1 → commit and push the CI-triggering head. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry:
 
    ```bash
-   "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
    ```
 
    Route:
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
index 5a48b2d61..10e472f87 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
@@ -402,7 +402,7 @@ _No tracker connected, skip step._
 3. Push the merged branch. The merge adds commits on top of the pushed head, so the push is plain, NEVER forced:
 
    ```bash
-   "{BKIT}" branches push --mode=plain >/dev/null
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
    ```
 
    Route:
@@ -561,7 +561,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    Hold `parentSha` as `CODE_HEAD`.
 2. **If** the printed `outcome` = committed → push, and NEVER force:
    ```bash
-   "{BKIT}" branches push --mode=plain >/dev/null
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
    ```
    Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -663,7 +663,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
        - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push the fix, and NEVER force:
 
          ```bash
-         "{BKIT}" branches push --mode=plain >/dev/null
+         BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
          ```
 
          Route:
diff --git a/.bkit/core/workflows/bkit-debug.md b/.bkit/core/workflows/bkit-debug.md
index c3bfcbcfa..031f79df6 100644
--- a/.bkit/core/workflows/bkit-debug.md
+++ b/.bkit/core/workflows/bkit-debug.md
@@ -646,7 +646,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```
 3. **Skip if** `BRANCH` = `dev` (the Step 11 close pushes). Push:
    ```bash
-   "{BKIT}" branches push --mode=feature
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature
    ```
    Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -677,7 +677,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```
    **Skip if** `BRANCH` = `dev` (the Step 11 close pushes). Push:
    ```bash
-   "{BKIT}" branches push --mode=feature
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature
    ```
 3. Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -749,7 +749,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
      ```bash
      "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
-     "{BKIT}" branches push --mode=feature --require-ci
+     BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature --require-ci
      ```
 
      Route:
@@ -789,7 +789,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 6. **If** `TRIGGER_PR` = 1 → commit and push the CI-triggering head. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry<!-- bkit:tracker true start -->, empty when `ISSUE_ID` is empty<!-- bkit:tracker true end -->:
 
    ```bash
-   "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
    ```
 
    Route:
diff --git a/.bkit/core/workflows/bkit-ship.md b/.bkit/core/workflows/bkit-ship.md
index cc145028b..ff67aaf17 100644
--- a/.bkit/core/workflows/bkit-ship.md
+++ b/.bkit/core/workflows/bkit-ship.md
@@ -482,7 +482,7 @@ description: "Ship Feature — Autonomous merge and archive"
 3. Push the merged branch. The merge adds commits on top of the pushed head, so the push is plain, NEVER forced:
 
    ```bash
-   "{BKIT}" branches push --mode=plain >/dev/null
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
    ```
 
    Route:
@@ -641,7 +641,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    Hold `parentSha` as `CODE_HEAD`.
 2. **If** the printed `outcome` = committed → push, and NEVER force:
    ```bash
-   "{BKIT}" branches push --mode=plain >/dev/null
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
    ```
    Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -743,7 +743,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
        - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push the fix, and NEVER force:
 
          ```bash
-         "{BKIT}" branches push --mode=plain >/dev/null
+         BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
          ```
 
          Route:
diff --git a/.bkit/templates.md b/.bkit/templates.md
index 5ce3a11b8..a5c362020 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -324,9 +324,9 @@ chmod +x .husky/pre-commit .husky/pre-push
 - PR conflict check:
   - A fast check, run before `bkit check` and the gate. One `gh pr list --head <branch> --state open` lookup (every branch but `dev` / `main`) gives the PR number and its base; the `[skip ci]` guard reads the number from it.
   - **If** the branch has an open PR → the hook fetches the base from `origin`, then runs `git merge-tree --write-tree --name-only` on `origin/<base>` and the pushed commit. Conflicts → the push is blocked, naming the files and the fix. This holds for a min push too, because a conflicting PR never starts CI.
-  - **If** `gh` is missing or fails, the base fetch fails, or `git merge-tree` fails for another reason → the hook warns that the check was skipped, and the push goes on. No open PR → no fetch and no message.
+  - **If** `gh` is missing or fails, the clone is shallow (fix: `git fetch --unshallow`), the base fetch fails, or `git merge-tree` fails for another reason → the hook warns that the check was skipped, and the push goes on. No open PR → no fetch and no message.
   - The lookup keeps only same-repo PRs, so a fork PR with the same head branch name is ignored. The base is fetched with an explicit refspec, and the trial merge ignores the work tree's `.gitattributes`, as GitHub does, so a `merge=union` ledger conflict blocks.
-  - `BKIT_PR_CONFLICT_CHECK=false` skips the whole check with one stderr line. `/bkit-ship` sets it on its pushes before Step 4 `Integrate`, because the conflict is what Step 4 merges away, and never on later pushes, so the merged head is checked.
+  - `BKIT_PR_CONFLICT_CHECK=false` skips the whole check with one stderr line. `/bkit-ship` sets it on every push, because the conflict is what Step 4 merges away and a `dev` that moves after Step 4 is left to the Step 10 merge gate's `--fresh-base`. `/bkit-debug` sets it on its feature-branch pushes, so fix commits always reach `origin`.
   - A repo whose hook copy lacks this gets the `pre-push-pr-conflict` tip.
 - Slop base:
   - **If** the push is to `dev` **and** `scripts/ci/lanes/bkit-resolve-push-base.mjs` is copied → the hook runs it with `--local --branch=dev --head=<pushed sha>`, and exports `SLOP_BASE_REF` as CI's push base. That base is the head of the last green CI push run on `dev`, else `origin/dev`. The hook prints the base and its source.
diff --git a/.bkit/templates/.husky/pre-push b/.bkit/templates/.husky/pre-push
index fb2169c73..59eebd9b9 100755
--- a/.bkit/templates/.husky/pre-push
+++ b/.bkit/templates/.husky/pre-push
@@ -232,6 +232,9 @@ case "$BRANCH" in
     elif [ -n "$OPEN_PR" ] && [ -n "$PR_BASE" ] && [ -n "$PUSH_BRANCH_SHA" ]; then
       if [ "${BKIT_PR_CONFLICT_CHECK:-}" = "false" ]; then
         echo "[pre-push] PR conflict check off (BKIT_PR_CONFLICT_CHECK=false)." >&2
+      # a shallow clone has no shared history with the base: the fetch would download all of it and merge-tree still refuse
+      elif [ "$(git rev-parse --is-shallow-repository 2>/dev/null)" = "true" ]; then
+        echo "[pre-push] WARN: PR conflict check skipped — shallow clone; run git fetch --unshallow to enable it." >&2
       # explicit refspec: a single-branch clone's `git fetch origin <base>` would leave no origin/<base>
       elif git fetch --quiet origin "+refs/heads/$PR_BASE:refs/remotes/origin/$PR_BASE" < /dev/null > /dev/null 2>&1; then
         PR_MERGE_RC=0
diff --git a/.bkit/version b/.bkit/version
index 6d245e2e7..311caed4f 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -16,10 +16,10 @@
     ".opencode/opencode.json": "83dbad6e236be57944702da355ea2d823db481408f14a4b9f522225d2ed27d75",
     ".claude/commands/bkit-auto.md": "2fb94062947b55466f7baed87ee27347e2626d6a43200691ff68cb7f62a0947f",
     ".claude/commands/bkit-build.md": "267cc6580715b298a476ee0935ecf5e3bc092a0ebc0c198d7f576f35ed8345f5",
-    ".claude/commands/bkit-debug.md": "d90b236a686546f2206d6c24e4d8cb6b2cf4b2c0393b510139a214c9e4ecab0d",
+    ".claude/commands/bkit-debug.md": "ecb990754629c78c1b0a7d1347f31e327fcc570b9acffe09fe7a3627396feddb",
     ".claude/commands/bkit-design.md": "19fc3688e1f0063c2ff02b61921c6c3153f5d3892eb08c812643507539f8790a",
     ".claude/commands/bkit-plan.md": "21e65d37fb3fede54a1edbb0d6a71e589178a0d6991b007b24770aedf818afde",
-    ".claude/commands/bkit-ship.md": "d02428233bc88b6c845d52de7f8635cf5f46ee3107d14976d9dd2c943485cfe8",
+    ".claude/commands/bkit-ship.md": "a32255d6c31f3db58e60eca79cee7f6002b3dabdb2f8679b7fc7071d358bc3f3",
     ".claude/agents/bkit-build-challenge-1.md": "20ff6fcaf48d5a6418c696c88e796101c34083326b8353bf6ec766422c4c734f",
     ".claude/agents/bkit-build-challenge-2.md": "0ef8a829af9b89602a75ac257a093e4a47169ca9c2a4c216d6f11937e2e9c48f",
     ".claude/agents/bkit-build-install-skills.md": "0249b5fe6550c45afe95972d1d3f4a65f7e159a74038ce9179ca1fceb29e1d12",
@@ -48,10 +48,10 @@
     ".claude/agents/bkit-utility-update-documentation.md": "58eef51a24cbbd53a16c12cf603888fc4a98963bb7dadbde0b60a7e3207eb43c",
     ".cursor/commands/bkit-auto.md": "f363b93008d334ca20e3825f5a734cd5cd0b5ad27e4287c0231985702653826a",
     ".cursor/commands/bkit-build.md": "89a2154fa7d70355dd0240e3ed23621a4586573c30e64340af51b371d0848087",
-    ".cursor/commands/bkit-debug.md": "e9744cc9f7a0143d42d91c34dd057e65489632548177ae66df1e6519ffe2d738",
+    ".cursor/commands/bkit-debug.md": "48cf0e7b38dc03d7eb1f0c50d8d053b779fccbf58c7bb2b59d09eb5e744214f6",
     ".cursor/commands/bkit-design.md": "50503d506d3be97b176612647f202e4428e43446a3e29c9f63c931ebdc32f2c1",
     ".cursor/commands/bkit-plan.md": "3ce05ec47616b860b785c128c5a80e3e81dda9951d84744a8f8c93063c3a91ed",
-    ".cursor/commands/bkit-ship.md": "99672527a5dbfad8293cac484234a4590dabc2c54c06fbfd32cb780e553af38f",
+    ".cursor/commands/bkit-ship.md": "bf4d16626934f736831b1ac8f4421124a663f4b56e08ff15f0f15bf2c6a65c69",
     ".cursor/agents/bkit-build-challenge-1.md": "91f6446c505416d377dcbabcc49030e704384980f3ed232694069108504c2dab",
     ".cursor/agents/bkit-build-challenge-2.md": "6399d8b34ff1be2a63b77b911fd8321f80bd0bf64550103f809cdf5194820c24",
     ".cursor/agents/bkit-build-install-skills.md": "9f77d5ce2bc7e5d1c60d8860b5a06d81091f9194522607151a76838fc895da6d",
@@ -106,10 +106,10 @@
     ".opencode/agents/bkit-utility-update-documentation.md": "5b274f7a0f331ee4c1ea2bcfc44a5d7855e0756e94e99dafd3d17ef942f3a032",
     ".opencode/commands/bkit-auto.md": "973d91ed58716f8b8be1009c3f2f686051cf1c8a617b14c3775814e7b356debb",
     ".opencode/commands/bkit-build.md": "ac40db75f408939d9622d8767722cfe194624161aa852906f964c5f9143b2d90",
-    ".opencode/commands/bkit-debug.md": "3f3c872889c0e09a744fc8c6c41af1d63ac1a7ee53a2ce9619edce7161aedead",
+    ".opencode/commands/bkit-debug.md": "f9e6213b515ebc41ee8f7c0484b5beb75ef85b0966efd9410e43c72970899a3b",
     ".opencode/commands/bkit-design.md": "43ef687878db97f39336b4e91ffe1adb845048999b5b686864898b4cc58a09a7",
     ".opencode/commands/bkit-plan.md": "afd4b5bb5a1c7d14ec9d4257ebe2f415e57c2e6ad625ec8c993c429acc886a42",
-    ".opencode/commands/bkit-ship.md": "00697a0c6f314b49c3470230bbb8875ca94b9940ec5cad92414a8853cebea263",
+    ".opencode/commands/bkit-ship.md": "071b35d4c6963f45687243a98ef8b3005f67089152411a0fdd261a3e8b0525d5",
     ".claude/agents/bkit-design-spike.md": "334a96f4f3fdb0a190c8d4cca32c38bee577138fd4acf51036302b325964e889",
     ".cursor/agents/bkit-design-spike.md": "06729e7a0ffa9f98b109433b56dcfc1e3d0afad12c55250a28eee91549ea45a3",
     ".opencode/agents/bkit-design-spike.md": "28e5d35f911887fe7b08a74983a48fc131cd5693b7546af8623e9bc75f8e54f4",
diff --git a/.claude/commands/bkit-debug.md b/.claude/commands/bkit-debug.md
index 5325c70f1..322a0697e 100644
--- a/.claude/commands/bkit-debug.md
+++ b/.claude/commands/bkit-debug.md
@@ -591,7 +591,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```
 3. **Skip if** `BRANCH` = `dev` (the Step 11 close pushes). Push:
    ```bash
-   "{BKIT}" branches push --mode=feature
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature
    ```
    Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -622,7 +622,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```
    **Skip if** `BRANCH` = `dev` (the Step 11 close pushes). Push:
    ```bash
-   "{BKIT}" branches push --mode=feature
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature
    ```
 3. Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -692,7 +692,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
      ```bash
      "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
-     "{BKIT}" branches push --mode=feature --require-ci
+     BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature --require-ci
      ```
 
      Route:
@@ -732,7 +732,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 6. **If** `TRIGGER_PR` = 1 → commit and push the CI-triggering head. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when `ISSUE_ID` is empty:
 
    ```bash
-   "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
    ```
 
    Route:
diff --git a/.claude/commands/bkit-ship.md b/.claude/commands/bkit-ship.md
index 02cb2c948..fed90d77d 100644
--- a/.claude/commands/bkit-ship.md
+++ b/.claude/commands/bkit-ship.md
@@ -437,7 +437,7 @@ description: "Ship Feature — Autonomous merge and archive"
 3. Push the merged branch. The merge adds commits on top of the pushed head, so the push is plain, NEVER forced:
 
    ```bash
-   "{BKIT}" branches push --mode=plain >/dev/null
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
    ```
 
    Route:
@@ -596,7 +596,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    Hold `parentSha` as `CODE_HEAD`.
 2. **If** the printed `outcome` = committed → push, and NEVER force:
    ```bash
-   "{BKIT}" branches push --mode=plain >/dev/null
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
    ```
    Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -698,7 +698,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
        - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push the fix, and NEVER force:
 
          ```bash
-         "{BKIT}" branches push --mode=plain >/dev/null
+         BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
          ```
 
          Route:
diff --git a/.cursor/commands/bkit-debug.md b/.cursor/commands/bkit-debug.md
index 4485cffa5..e7189450f 100644
--- a/.cursor/commands/bkit-debug.md
+++ b/.cursor/commands/bkit-debug.md
@@ -590,7 +590,7 @@ Debug Feature — Autonomous diagnosis and remediation
    ```
 3. **Skip if** `BRANCH` = `dev` (the Step 11 close pushes). Push:
    ```bash
-   "{BKIT}" branches push --mode=feature
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature
    ```
    Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -621,7 +621,7 @@ Debug Feature — Autonomous diagnosis and remediation
    ```
    **Skip if** `BRANCH` = `dev` (the Step 11 close pushes). Push:
    ```bash
-   "{BKIT}" branches push --mode=feature
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature
    ```
 3. Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -691,7 +691,7 @@ Debug Feature — Autonomous diagnosis and remediation
 
      ```bash
      "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
-     "{BKIT}" branches push --mode=feature --require-ci
+     BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature --require-ci
      ```
 
      Route:
@@ -731,7 +731,7 @@ Debug Feature — Autonomous diagnosis and remediation
 6. **If** `TRIGGER_PR` = 1 → commit and push the CI-triggering head. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when `ISSUE_ID` is empty:
 
    ```bash
-   "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
    ```
 
    Route:
diff --git a/.cursor/commands/bkit-ship.md b/.cursor/commands/bkit-ship.md
index c58fa8b13..1477c5c6b 100644
--- a/.cursor/commands/bkit-ship.md
+++ b/.cursor/commands/bkit-ship.md
@@ -436,7 +436,7 @@ Ship Feature — Autonomous merge and archive
 3. Push the merged branch. The merge adds commits on top of the pushed head, so the push is plain, NEVER forced:
 
    ```bash
-   "{BKIT}" branches push --mode=plain >/dev/null
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
    ```
 
    Route:
@@ -595,7 +595,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    Hold `parentSha` as `CODE_HEAD`.
 2. **If** the printed `outcome` = committed → push, and NEVER force:
    ```bash
-   "{BKIT}" branches push --mode=plain >/dev/null
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
    ```
    Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -697,7 +697,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
        - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push the fix, and NEVER force:
 
          ```bash
-         "{BKIT}" branches push --mode=plain >/dev/null
+         BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
          ```
 
          Route:
diff --git a/.husky/pre-push b/.husky/pre-push
index 0c99ab35d..66c81c2e6 100755
--- a/.husky/pre-push
+++ b/.husky/pre-push
@@ -289,6 +289,9 @@ case "$BRANCH" in
     elif [ -n "$OPEN_PR" ] && [ -n "$PR_BASE" ] && [ -n "$PUSH_BRANCH_SHA" ]; then
       if [ "${BKIT_PR_CONFLICT_CHECK:-}" = "false" ]; then
         echo "[pre-push] PR conflict check off (BKIT_PR_CONFLICT_CHECK=false)." >&2
+      # a shallow clone has no shared history with the base: the fetch would download all of it and merge-tree still refuse
+      elif [ "$(git rev-parse --is-shallow-repository 2>/dev/null)" = "true" ]; then
+        echo "[pre-push] WARN: PR conflict check skipped — shallow clone; run git fetch --unshallow to enable it." >&2
       # explicit refspec: a single-branch clone's `git fetch origin <base>` would leave no origin/<base>
       elif git fetch --quiet origin "+refs/heads/$PR_BASE:refs/remotes/origin/$PR_BASE" < /dev/null > /dev/null 2>&1; then
         PR_MERGE_RC=0
diff --git a/.opencode/commands/bkit-debug.md b/.opencode/commands/bkit-debug.md
index a7e7a5224..6f3a12cc2 100644
--- a/.opencode/commands/bkit-debug.md
+++ b/.opencode/commands/bkit-debug.md
@@ -594,7 +594,7 @@ $ARGUMENTS
    ```
 3. **Skip if** `BRANCH` = `dev` (the Step 11 close pushes). Push:
    ```bash
-   "{BKIT}" branches push --mode=feature
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature
    ```
    Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -625,7 +625,7 @@ $ARGUMENTS
    ```
    **Skip if** `BRANCH` = `dev` (the Step 11 close pushes). Push:
    ```bash
-   "{BKIT}" branches push --mode=feature
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature
    ```
 3. Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -695,7 +695,7 @@ $ARGUMENTS
 
      ```bash
      "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
-     "{BKIT}" branches push --mode=feature --require-ci
+     BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature --require-ci
      ```
 
      Route:
@@ -735,7 +735,7 @@ $ARGUMENTS
 6. **If** `TRIGGER_PR` = 1 → commit and push the CI-triggering head. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when `ISSUE_ID` is empty:
 
    ```bash
-   "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
    ```
 
    Route:
diff --git a/.opencode/commands/bkit-ship.md b/.opencode/commands/bkit-ship.md
index 2e7b45ee7..7b9f239cd 100644
--- a/.opencode/commands/bkit-ship.md
+++ b/.opencode/commands/bkit-ship.md
@@ -440,7 +440,7 @@ $ARGUMENTS
 3. Push the merged branch. The merge adds commits on top of the pushed head, so the push is plain, NEVER forced:
 
    ```bash
-   "{BKIT}" branches push --mode=plain >/dev/null
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
    ```
 
    Route:
@@ -599,7 +599,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    Hold `parentSha` as `CODE_HEAD`.
 2. **If** the printed `outcome` = committed → push, and NEVER force:
    ```bash
-   "{BKIT}" branches push --mode=plain >/dev/null
+   BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
    ```
    Route:
    - **If** exit 81 → end turn, re-run this block.
@@ -701,7 +701,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
        - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push the fix, and NEVER force:
 
          ```bash
-         "{BKIT}" branches push --mode=plain >/dev/null
+         BKIT_PR_CONFLICT_CHECK=false "{BKIT}" branches push --mode=plain >/dev/null
          ```
 
          Route:
