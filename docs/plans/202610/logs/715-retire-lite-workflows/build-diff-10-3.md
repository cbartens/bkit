diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index 88e2674d2..c368b7e74 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -70,11 +70,11 @@ description: "Build Feature — Autonomous implementation"
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-*.md`, `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md`.
 5. List stray files first: `bkit workflows handover --list-stray` (`--workflow` / `--fid` / `--month` / `--worktree` as below) → on a feature branch remove only the `modified` / `untracked` files this run created by mistake, NEVER other agents' changes; on `dev` / `main` (`shared` = true) remove nothing (only the run's own record lands, through a throwaway checkout). Then keep the run's record; **Skip if** `{WORKTREE_PATH}` is not set:
-   - **If** `PUBLISH` = false → the record stays in the kept worktree and NEVER pass `--push`, so a held run pushes nothing; link it by branch with `--ref`:
+   - **If** `PUBLISH` = false **or** not yet resolved → the record stays in the worktree and NEVER pass `--push`, so a held run, or a failure before `status route` resolves `publish`, pushes nothing; link it by branch with `--ref`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
      ```
-   - **Else** (`PUBLISH` = true **or** not yet resolved) → commit and push the record — NEVER onto a branch with an open PR:
+   - **Else** (`PUBLISH` = true) → commit and push the record — NEVER onto a branch with an open PR:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
      ```
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index be9512586..275ba723a 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -70,11 +70,11 @@ description: "Build Feature — Autonomous implementation"
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-*.md`, `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md`.
 5. List stray files first: `bkit workflows handover --list-stray` (`--workflow` / `--fid` / `--month` / `--worktree` as below) → on a feature branch remove only the `modified` / `untracked` files this run created by mistake, NEVER other agents' changes; on `dev` / `main` (`shared` = true) remove nothing (only the run's own record lands, through a throwaway checkout). Then keep the run's record; **Skip if** `{WORKTREE_PATH}` is not set:
-   - **If** `PUBLISH` = false → the record stays in the kept worktree and NEVER pass `--push`, so a held run pushes nothing; link it by branch with `--ref`:
+   - **If** `PUBLISH` = false **or** not yet resolved → the record stays in the worktree and NEVER pass `--push`, so a held run, or a failure before `status route` resolves `publish`, pushes nothing; link it by branch with `--ref`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
      ```
-   - **Else** (`PUBLISH` = true **or** not yet resolved) → commit and push the record — NEVER onto a branch with an open PR:
+   - **Else** (`PUBLISH` = true) → commit and push the record — NEVER onto a branch with an open PR:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
      ```
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 077dae74a..43bb6a748 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -337,6 +337,24 @@ describe("Failure Path", () => {
     }
   });
 
+  it("bkit-build.md: a Failure Path reached before publish is resolved never pushes the feature branch", () => {
+    const failure = section(workflow("build"), /Failure Path/);
+    const calls = commandLines(failure, "workflows handover").map((l) => l.trim());
+    const pushing = calls.filter((l) => l.includes("--push"));
+    expect(pushing).toHaveLength(1);
+    const before = failure.slice(0, failure.indexOf(pushing[0]!));
+    const guard = before
+      .trimEnd()
+      .split("\n")
+      .filter((l) => l.includes("**Else**"))
+      .pop()!;
+    expect(guard).not.toMatch(/not yet resolved/);
+    expect(guard).toMatch(/`PUBLISH` = true/);
+    expect(before).toMatch(
+      /`PUBLISH` = false \*\*or\*\* not yet resolved[^\n]*NEVER pass `--push`/,
+    );
+  });
+
   it.each(["design", "plan", "build", "debug"])(
     "%s removes only files the run created by mistake, never other agents' changes",
     (name) => {
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index 968f275d8..3234c18b2 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -61,11 +61,11 @@ _No tracker connected, skip step._
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-*.md`, `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md`.
 5. List stray files first: `bkit workflows handover --list-stray` (`--workflow` / `--fid` / `--month` / `--worktree` as below) → on a feature branch remove only the `modified` / `untracked` files this run created by mistake, NEVER other agents' changes; on `dev` / `main` (`shared` = true) remove nothing (only the run's own record lands, through a throwaway checkout). Then keep the run's record; **Skip if** `{WORKTREE_PATH}` is not set:
-   - **If** `PUBLISH` = false → the record stays in the kept worktree and NEVER pass `--push`, so a held run pushes nothing; link it by branch with `--ref`:
+   - **If** `PUBLISH` = false **or** not yet resolved → the record stays in the worktree and NEVER pass `--push`, so a held run, or a failure before `status route` resolves `publish`, pushes nothing; link it by branch with `--ref`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
      ```
-   - **Else** (`PUBLISH` = true **or** not yet resolved) → commit and push the record — NEVER onto a branch with an open PR:
+   - **Else** (`PUBLISH` = true) → commit and push the record — NEVER onto a branch with an open PR:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
      ```
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 5980b8264..9e6d4e1c0 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -88,11 +88,11 @@ description: "Build Feature — Autonomous implementation"
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-*.md`, `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md`.
 5. List stray files first: `bkit workflows handover --list-stray` (`--workflow` / `--fid` / `--month` / `--worktree` as below) → on a feature branch remove only the `modified` / `untracked` files this run created by mistake, NEVER other agents' changes; on `dev` / `main` (`shared` = true) remove nothing (only the run's own record lands, through a throwaway checkout). Then keep the run's record; **Skip if** `{WORKTREE_PATH}` is not set:
-   - **If** `PUBLISH` = false → the record stays in the kept worktree and NEVER pass `--push`, so a held run pushes nothing; link it by branch with `--ref`:
+   - **If** `PUBLISH` = false **or** not yet resolved → the record stays in the worktree and NEVER pass `--push`, so a held run, or a failure before `status route` resolves `publish`, pushes nothing; link it by branch with `--ref`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
      ```
-   - **Else** (`PUBLISH` = true **or** not yet resolved) → commit and push the record — NEVER onto a branch with an open PR:
+   - **Else** (`PUBLISH` = true) → commit and push the record — NEVER onto a branch with an open PR:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
      ```
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index fd62bb5d0..03b7aacb4 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -8641,8 +8641,8 @@ Route — first match wins:
 **If** `DECISION_ROUTE` = `retry` → Step 13.
 **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
 [secrets; workflow-pushes] List stray files first: `bkit workflows handover --list-stray` (`--workflow` / `--fid` / `--month` / `--worktree` as below) → on a feature branch remove only the `modified` / `untracked` files this run created by mistake, NEVER other agents' changes; on `dev` / `main` (`shared` = true) remove nothing (only the run's own record lands, through a throwaway checkout). Then keep the run's record; **Skip if** `{WORKTREE_PATH}` is not set:
-**If** `PUBLISH` = false → the record stays in the kept worktree and NEVER pass `--push`, so a held run pushes nothing; link it by branch with `--ref`:
-[workflow-pushes] **Else** (`PUBLISH` = true **or** not yet resolved) → commit and push the record — NEVER onto a branch with an open PR:
+**If** `PUBLISH` = false **or** not yet resolved → the record stays in the worktree and NEVER pass `--push`, so a held run, or a failure before `status route` resolves `publish`, pushes nothing; link it by branch with `--ref`:
+[workflow-pushes] **Else** (`PUBLISH` = true) → commit and push the record — NEVER onto a branch with an open PR:
 [workflow-pushes] **If** `PUBLISH` = false → the record stays in the kept worktree and NEVER pass `--push`:
 [workflow-pushes] **Else** → push the record — NEVER onto a branch with an open PR:
 [workflow-pushes] Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
diff --git a/.bkit/version b/.bkit/version
index d6454c78d..500c3ae28 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -24,7 +24,7 @@
     ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
     "docs/design.md": "1dc7f8c63d8252c763a8d01e09a81a715b84677e3de404416ac7f2c79a0d7644",
     ".claude/commands/bkit-auto.md": "30605afb50a2df5b5c9b90d34d15d2e4d5d6415723fb48dde6844813de580846",
-    ".claude/commands/bkit-build.md": "c1787bd36869e3f19f97450cb596cbe0991e4d2e6bd5d94213417be622d76029",
+    ".claude/commands/bkit-build.md": "82c34cfaeada44b9dfe9b6f3d4722e1bacd5c6ce57aa7c6c4291f3d10d82ebaf",
     ".claude/commands/bkit-debug.md": "e443115ee2282d72d4dca9814b2257df3dcf58f6925c8dcabf3f910364ffe7ba",
     ".claude/commands/bkit-design.md": "0c377d25c2cb283f56a9c0a56861ad66e65394a79c8b3082b7678e70aa1772ef",
     ".claude/commands/bkit-plan.md": "91f907e7dda48dd7b0be21217c3d08f905a9985364578aab7b2336bce22e9d1e",
@@ -57,7 +57,7 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "b43e14949abd2218e1407fa587ee542bd5951caf543c4bd0718b7a78eea128c7",
     ".claude/agents/bkit-utility-update-documentation.md": "0b3d4145acaf8ce46ace5328fe2e13f904d3c8aba8823aa1c2bff6a4cc5f7d3e",
     ".cursor/commands/bkit-auto.md": "a0f912da129dddeccc2f36519dd7d1c458e915babcbc01867901a8164f4549f9",
-    ".cursor/commands/bkit-build.md": "e37c26ddb5dee77f938d9a57be10fbdf15925a8c752fe4cbf31ec25c6fdeb0f2",
+    ".cursor/commands/bkit-build.md": "c568cd92eb4c3fdd7f7b16a20c3cc99658c4356733b3437c6dc91cb53c171974",
     ".cursor/commands/bkit-debug.md": "16de71ffbbc9b4d31032df07e1761cca3c34955b25ec0f0d5fb0fdefaa746de0",
     ".cursor/commands/bkit-design.md": "5bb602f4db8dd867a9ef9c925e0c2bd085cc7e0e8d377d27e7c617b89c1aa4ce",
     ".cursor/commands/bkit-plan.md": "7e36b5b479f5a1345877e3aaae40c6165ee2f55aa9971225bbb36e131e5bb714",
@@ -117,7 +117,7 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "8265357e11e5bd3d358281b2f712e09dff81cb5d278436ab7584355784b09f7f",
     ".opencode/agents/bkit-utility-update-documentation.md": "e494bd347aa52ca97786a094d9083721ad264070f1e3a0c90efeac23789dcc2a",
     ".opencode/commands/bkit-auto.md": "1733b34b41942bc50b80bd1bd85b797c3f8f628f69c7519ca647a634044e5838",
-    ".opencode/commands/bkit-build.md": "67d4c2dbc36f801a2ef8afd372fd373bd80d2c744fec0fc70d0c50b46374f45f",
+    ".opencode/commands/bkit-build.md": "63a1143020d3b661db4aec2724502332786defd7611b419178b02706626efccd",
     ".opencode/commands/bkit-debug.md": "eb72443924a79378d09d091d9e5db6582688b259fc35d775b141a3682066f93e",
     ".opencode/commands/bkit-design.md": "e07aa4a626bd7f61c2e1e06ff1b08be149fcc0113744425b845a79634125165b",
     ".opencode/commands/bkit-plan.md": "6703f192c639ff6fb8bfe84ef55692abd3f9226bd7c82682f469d60acb89a5a3",
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index b9d3810b1..7e57f46d7 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -69,11 +69,11 @@ description: "Build Feature — Autonomous implementation"
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-*.md`, `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md`.
 5. List stray files first: `bkit workflows handover --list-stray` (`--workflow` / `--fid` / `--month` / `--worktree` as below) → on a feature branch remove only the `modified` / `untracked` files this run created by mistake, NEVER other agents' changes; on `dev` / `main` (`shared` = true) remove nothing (only the run's own record lands, through a throwaway checkout). Then keep the run's record; **Skip if** `{WORKTREE_PATH}` is not set:
-   - **If** `PUBLISH` = false → the record stays in the kept worktree and NEVER pass `--push`, so a held run pushes nothing; link it by branch with `--ref`:
+   - **If** `PUBLISH` = false **or** not yet resolved → the record stays in the worktree and NEVER pass `--push`, so a held run, or a failure before `status route` resolves `publish`, pushes nothing; link it by branch with `--ref`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
      ```
-   - **Else** (`PUBLISH` = true **or** not yet resolved) → commit and push the record — NEVER onto a branch with an open PR:
+   - **Else** (`PUBLISH` = true) → commit and push the record — NEVER onto a branch with an open PR:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
      ```
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index 8155be27b..4703b2998 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -68,11 +68,11 @@ Build Feature — Autonomous implementation
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-*.md`, `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md`.
 5. List stray files first: `bkit workflows handover --list-stray` (`--workflow` / `--fid` / `--month` / `--worktree` as below) → on a feature branch remove only the `modified` / `untracked` files this run created by mistake, NEVER other agents' changes; on `dev` / `main` (`shared` = true) remove nothing (only the run's own record lands, through a throwaway checkout). Then keep the run's record; **Skip if** `{WORKTREE_PATH}` is not set:
-   - **If** `PUBLISH` = false → the record stays in the kept worktree and NEVER pass `--push`, so a held run pushes nothing; link it by branch with `--ref`:
+   - **If** `PUBLISH` = false **or** not yet resolved → the record stays in the worktree and NEVER pass `--push`, so a held run, or a failure before `status route` resolves `publish`, pushes nothing; link it by branch with `--ref`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
      ```
-   - **Else** (`PUBLISH` = true **or** not yet resolved) → commit and push the record — NEVER onto a branch with an open PR:
+   - **Else** (`PUBLISH` = true) → commit and push the record — NEVER onto a branch with an open PR:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
      ```
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index 0a090a5c4..a561cb6d1 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -72,11 +72,11 @@ $ARGUMENTS
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-*.md`, `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md`.
 5. List stray files first: `bkit workflows handover --list-stray` (`--workflow` / `--fid` / `--month` / `--worktree` as below) → on a feature branch remove only the `modified` / `untracked` files this run created by mistake, NEVER other agents' changes; on `dev` / `main` (`shared` = true) remove nothing (only the run's own record lands, through a throwaway checkout). Then keep the run's record; **Skip if** `{WORKTREE_PATH}` is not set:
-   - **If** `PUBLISH` = false → the record stays in the kept worktree and NEVER pass `--push`, so a held run pushes nothing; link it by branch with `--ref`:
+   - **If** `PUBLISH` = false **or** not yet resolved → the record stays in the worktree and NEVER pass `--push`, so a held run, or a failure before `status route` resolves `publish`, pushes nothing; link it by branch with `--ref`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
      ```
-   - **Else** (`PUBLISH` = true **or** not yet resolved) → commit and push the record — NEVER onto a branch with an open PR:
+   - **Else** (`PUBLISH` = true) → commit and push the record — NEVER onto a branch with an open PR:
      ```bash
      "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
      ```
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index f22d8b2d2..88bd47c3b 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -161,3 +161,6 @@
 {"schema":3,"ts":1793324364224,"firstTs":1793320996471,"updates":2,"kind":"deferral","key":"748-rename-unprefixed-template-script-files","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-update","subagent":"bkit-plan-update","model":"claude-opus-5-5"},"references":["748","docs/plans/202610/logs/748-brand-every-consumer/plan-v1-draft.md § Open Questions & Assumptions","docs/plans/202610/logs/748-brand-every-consumer/plan-v2-reviewed.md § Agent Execution Runbook TASK 2","docs/plans/202610/logs/748-brand-every-consumer/plan-v2-reviewed.md § Agent Execution Runbook TASK 8","docs/plans/202610/logs/748-brand-every-consumer/plan-v2-reviewed.md § Open Questions & Assumptions",".bkit/templates/scripts/ci/",".bkit/templates/scripts/launchd/"],"type":"issue","category":"tooling","severity":"LOW","reason":"needs-decision","summary":"Twelve copy-and-own template files under `.bkit/templates/scripts/` lack the `bkit-` prefix the branding rule asks for","description":"Triaged into #748 plan-v2: Task 2 renames the twelve files (`scripts/ci/check-capstone.mjs`, `check-capstone.test.mjs`, `check-dependency-audit.mjs`, `check-dependency-audit.test.mjs`, `check-accepted-divergences.mjs`, `check-accepted-divergences.test.mjs`, `accepted-advisories.json`, `accepted-divergences.json`, `lanes/resolve-push-base.mjs`, `lanes/resolve-push-base.test.mjs` → `bkit-<name>`; `scripts/launchd/ai.bkit.launchd.plist` → `bkit-launchd.plist`, `scripts/launchd/launchd.env.example` → `bkit-launchd.env.example`) with bkit's own copies, and Task 8 adds the upgrade migration that moves shipped-content consumer copies and rewrites their `scripts/ci/` paths; the branding guard keeps no exception list. Pending the owner on plan-v2 Open Question 2 (Recommended A, default A); answer B (owner narrows the Narrative) restores the per-file guard exceptions.","remediation":"Rename each file to `bkit-<name>`, update `.bkit/templates/.github/workflows/bkit-ci.yml`, `.bkit/core/.bkit/templates.md`, bkit's own copies and the tests that load them, add an upgrade migration for adopted copies, and drop the guard's exception list.","source":"phase","status":"TRIAGED"}
 {"schema":3,"ts":1793501859358,"firstTs":1793501859358,"updates":1,"kind":"deferral","key":"715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-disk-ts-232","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["715-retire-lite-workflows"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"Two `--wait` sweeps polling every 5s that both find a dead or hour-old holder can each `rmSync` the other's fresh lock in `takeLock` (stat → read → rm → create is not atomic), so two sweeps run the same irreversible delete steps at once","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/disk.ts:232: Two `--wait` sweeps polling every 5s that both find a dead or hour-old holder can each `rmSync` the other's fresh lock in `takeLock` (stat → read → rm → create is not atomic), so two sweeps run the same irreversible delete steps at once. Done when: `takeLock` replaces a stale lock atomically (e.g. `renameSync` the stale file to a unique name and verify it still holds the stale holder line before `tryCreate`, or re-read the holder immediately before removal and abort when it changed), so a lock another process created after this one's `statSync` is never removed; the existing \"replaces a lock whose process is gone, or that is an hour old\" case still passes.","source":".bkit/core/engine/commands/workflow/disk.ts:232"}
 {"schema":3,"ts":1793501859359,"firstTs":1793501859359,"updates":1,"kind":"deferral","key":"715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-status-ts-269","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["715-retire-lite-workflows"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A `publish=true` substring anywhere in the verbatim session prompt (pasted issue text, a log excerpt, or a negation such as \"do not use publish=true\") overrides a durable `bkit.workflows.build.publish.local: false`, so untrusted pasted text flips a held local build into a push and an open PR","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/status.ts:269: A `publish=true` substring anywhere in the verbatim session prompt (pasted issue text, a log excerpt, or a negation such as \"do not use publish=true\") overrides a durable `bkit.workflows.build.publish.local: false`, so untrusted pasted text flips a held local build into a push and an open PR. Done when: The owner decides whether prompt text may raise a configured hold to a publish. No agent can settle it, because the confirmed plan (Breaking Changes, \"Session token (new)\" row, and Edge Cases \"Token and config disagree\") makes the substring token win over config, and docs/security.md § Untrusted Content & Prompt Injection treats pasted content as untrusted. The decision to make: either a token may only lower `publish` (a `publish=true` token cannot override `publish.local: false`), or the token must stand alone (its own line or the bracket form) so text embedded in pasted content does not match; `publishRoute` then follows that rule.","source":".bkit/core/engine/commands/workflow/status.ts:269"}
+{"schema":3,"ts":1793505655223,"firstTs":1793505655223,"updates":1,"kind":"deferral","key":"715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-disk-ts-245","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["715-retire-lite-workflows"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A disk sweep that runs longer than `LOCK_STALE_MS` (1h) has its lock replaced by a queued `--wait` sweep, because the running sweep never renews the lock and `waitForLock` waits exactly `LOCK_STALE_MS + pollMs`, so the waiter deterministically sees an \"hour-old\" lock, deletes it and runs a second sweep alongside the first (breaks `.bkit/templates.md` § Disk prune \"One sweep runs per machine at a time\")","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/disk.ts:245: A disk sweep that runs longer than `LOCK_STALE_MS` (1h) has its lock replaced by a queued `--wait` sweep, because the running sweep never renews the lock and `waitForLock` waits exactly `LOCK_STALE_MS + pollMs`, so the waiter deterministically sees an \"hour-old\" lock, deletes it and runs a second sweep alongside the first (breaks `.bkit/templates.md` § Disk prune \"One sweep runs per machine at a time\"). Done when: while `sweep` holds the lock it refreshes the lock file's mtime on an interval well under `LOCK_STALE_MS` (a named constant, overridable by a `renewMs` option for tests) and clears the interval in the same `finally` that calls `releaseLock`, so `takeLock` only ever replaces a lock whose holder died or stopped renewing; the `waitForLock` doc comment matches the behaviour; the existing \"replaces a lock whose process is gone, or that is an hour old\" test still passes.","source":".bkit/core/engine/commands/workflow/disk.ts:245"}
+{"schema":3,"ts":1793505655224,"firstTs":1793505655224,"updates":1,"kind":"deferral","key":"715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-disk-ts-559","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["715-retire-lite-workflows"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A low-disk `bkit worktrees setup` that gives up after the 60s `DISK_SETUP_SWEEP_WAIT_S` wait has already stamped `low` / `max` / `min` for every step file, so the pre-commit / pre-push `--auto` hooks treat this checkout's (and the machine's) turn as spent for an hour (`low`) and a day (`min` / `max`) although no sweep ran for them — contradicting `.bkit/templates.md` § Disk prune \"the worktree check wait[s] for a running sweep to end, so their turn is never lost\"","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/disk.ts:559: A low-disk `bkit worktrees setup` that gives up after the 60s `DISK_SETUP_SWEEP_WAIT_S` wait has already stamped `low` / `max` / `min` for every step file, so the pre-commit / pre-push `--auto` hooks treat this checkout's (and the machine's) turn as spent for an hour (`low`) and a day (`min` / `max`) although no sweep ran for them — contradicting `.bkit/templates.md` § Disk prune \"the worktree check wait[s] for a running sweep to end, so their turn is never lost\". Done when: `ensureDiskSpace` stamps the step files only when its `max` sweep actually took the lock (`ran.reason !== \"locked\"`), so a timed-out wait leaves every `--auto` stamp untouched and the next hook still starts this checkout's low-disk `max` sweep; a sweep that ran keeps today's stamping.","source":".bkit/core/engine/commands/workflow/disk.ts:559"}
+{"schema":3,"ts":1793505655225,"firstTs":1793505655225,"updates":1,"kind":"deferral","key":"715-retire-lite-workflows-challenge-low-bkit-core-engine-audits-workflows-ship-verdict-integration-test-ts-302","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["715-retire-lite-workflows"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"The deferred-landing test's `openPr` runs only the push and `prs open` lines of ship Step 2's no-PR fence; the shipped `prs open` line ends `|| OPEN_EXIT=$?` and the dropped `case` / `exit \"$OPEN_EXIT\"` lines are what surface its exit, so a `prs open` that creates the PR and then fails its read-back (`EXIT_GH_FAILED`, `prs.ts:349-354`) still gives bash status 0 and both landing tests pass on a broken open","description":"LOW build challenge finding at .bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts:302: The deferred-landing test's `openPr` runs only the push and `prs open` lines of ship Step 2's no-PR fence; the shipped `prs open` line ends `|| OPEN_EXIT=$?` and the dropped `case` / `exit \"$OPEN_EXIT\"` lines are what surface its exit, so a `prs open` that creates the PR and then fails its read-back (`EXIT_GH_FAILED`, `prs.ts:349-354`) still gives bash status 0 and both landing tests pass on a broken open. Done when: `openPr` runs the whole Step 2 no-PR fence from `.bkit/core/workflows/bkit-ship.md` as written (push, `OPEN_EXIT=0`, `prs open … || OPEN_EXIT=$?`, the `case \"$OPEN_EXIT\"` `status meta --opened-pr` line and `exit \"$OPEN_EXIT\"`), extracted as one fence rather than line by line and not hand-prefixed, so any non-zero `prs open` exit fails the helper's `res.status` assertion.","source":".bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts:302"}
