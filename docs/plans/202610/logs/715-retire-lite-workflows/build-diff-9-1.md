diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 947de4d88..077dae74a 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -310,7 +310,9 @@ describe("Failure Path", () => {
     "%s always keeps its record through one `workflows handover --push` in the run's worktree",
     (name) => {
       const failure = section(workflow(name), /Failure Path/);
-      const calls = commandLines(failure, "workflows handover").map((l) => l.trim());
+      const calls = commandLines(failure, "workflows handover")
+        .map((l) => l.trim())
+        .filter((l) => l.includes("--push"));
       expect(calls, name).toEqual([
         `"{BKIT}" workflows handover --post --workflow=${name} --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"`,
       ]);
@@ -320,6 +322,21 @@ describe("Failure Path", () => {
     },
   );
 
+  it("bkit-build.md: a held run's Failure Path and Decision Pause never push the feature branch", () => {
+    const build = workflow("build");
+    for (const part of [section(build, /Failure Path/), section(build, /Decision Pause/)]) {
+      const calls = commandLines(part, "workflows handover").map((l) => l.trim());
+      const pushing = calls.filter((l) => l.includes("--push"));
+      const local = calls.filter((l) => !l.includes("--push"));
+      expect(pushing).toHaveLength(1);
+      expect(local).toHaveLength(1);
+      const at = part.indexOf(pushing[0]!);
+      const before = part.slice(0, at);
+      expect(before).toMatch(/`PUBLISH` = false[^\n]*NEVER pass `--push`/);
+      expect(part.indexOf(local[0]!)).toBeLessThan(at);
+    }
+  });
+
   it.each(["design", "plan", "build", "debug"])(
     "%s removes only files the run created by mistake, never other agents' changes",
     (name) => {
@@ -1871,9 +1888,13 @@ describe("build publish ending", () => {
 
   it("re-derives publish on resume", () => {
     // Steps 1-2 run again on every resume, so the only place `PUBLISH` is set is Step 2,
-    // after `runtime row`, and nothing reads it before.
-    const first = build.search(/`\{?PUBLISH\}?`|=\{PUBLISH\}/);
-    expect(first).toBeGreaterThan(build.indexOf("## 🤖 Step 2 — Worktree Setup"));
+    // after `runtime row`, and nothing reads it before except the Failure Path and Decision
+    // Pause, which treat an unset value as publish true.
+    const reads = build
+      .replace(section(build, /Failure Path/), "")
+      .replace(section(build, /Decision Pause/), "");
+    const first = reads.search(/`\{?PUBLISH\}?`|=\{PUBLISH\}/);
+    expect(first).toBeGreaterThan(reads.indexOf("## 🤖 Step 2 — Worktree Setup"));
     const text = step2();
     expect(text.indexOf("status route --workflow=build")).toBeGreaterThan(
       text.indexOf("runtime row"),
diff --git a/.bkit/core/engine/commands/workflow/disk.test.ts b/.bkit/core/engine/commands/workflow/disk.test.ts
index 375ddcaf0..cd77be999 100644
--- a/.bkit/core/engine/commands/workflow/disk.test.ts
+++ b/.bkit/core/engine/commands/workflow/disk.test.ts
@@ -296,6 +296,20 @@ describe("bkit disk prune — lock", () => {
     expect(order(cwd)).toEqual(["a"]);
   });
 
+  it("worktree setup's low-disk sweep stops waiting after maxWaitMs while a live sweep holds the lock", async () => {
+    holdLock(process.pid);
+    const cwd = repo(marks(["a", "max"]));
+    const why = await ensureDiskSpace({
+      cwd,
+      minFreeGb: 1e9,
+      pollMs: 10,
+      maxWaitMs: 100,
+      log: () => {},
+    });
+    expect(why).toContain("another sweep");
+    expect(order(cwd)).toEqual([]);
+  }, 5_000);
+
   it("refuses --wait with --auto", async () => {
     const r = await prune(repo(), "--mode=min", "--auto", "--wait");
     expect(r.code).toBe(2);
diff --git a/.bkit/core/engine/commands/workflow/disk.ts b/.bkit/core/engine/commands/workflow/disk.ts
index a8b35e95d..43ceb156e 100644
--- a/.bkit/core/engine/commands/workflow/disk.ts
+++ b/.bkit/core/engine/commands/workflow/disk.ts
@@ -31,6 +31,7 @@ import { pathToFileURL } from "node:url";
 import { isCloudOrCi } from "../../checks/before/env.js";
 import { readJsonFile } from "../../shared/json.js";
 import { readBkitConfig } from "../../shared/settings.js";
+import { TIMEOUTS } from "../../shared/timeouts.js";
 import { CommandError, EXIT, git, type CommandSpec } from "../lib.js";
 import { tryCreate } from "./locks.js";
 
@@ -235,12 +236,17 @@ function takeLock(): boolean {
 
 /**
  * Take the sweep lock, waiting while another sweep holds it. False only when it is still held
- * after `LOCK_STALE_MS`, which `takeLock` would by then have replaced unless it keeps renewing.
+ * after `maxWaitMs` (default `LOCK_STALE_MS`, after which `takeLock` would have replaced the
+ * lock unless it keeps renewing).
  */
-async function waitForLock(pollMs: number, log: (m: string) => void): Promise<boolean> {
+async function waitForLock(
+  pollMs: number,
+  log: (m: string) => void,
+  maxWaitMs: number = LOCK_STALE_MS + pollMs,
+): Promise<boolean> {
   if (takeLock()) return true;
   log(`another sweep is running (${lockPath()}) — waiting for it to end`);
-  const deadline = Date.now() + LOCK_STALE_MS + pollMs;
+  const deadline = Date.now() + maxWaitMs;
   while (Date.now() < deadline) {
     await new Promise((resolve) => setTimeout(resolve, pollMs));
     if (takeLock()) return true;
@@ -331,6 +337,8 @@ export async function sweep(opts: {
   wait?: boolean;
   /** How often a waiting sweep tries the lock again; tests shorten it. */
   pollMs?: number;
+  /** Longest wait for the lock with `wait`; default a full stale lock age. */
+  maxWaitMs?: number;
   log: (m: string) => void;
 }): Promise<SweepResult> {
   const result: SweepResult = {
@@ -375,7 +383,7 @@ export async function sweep(opts: {
     return result;
   }
   const locked = opts.wait
-    ? !(await waitForLock(opts.pollMs ?? LOCK_POLL_MS, opts.log))
+    ? !(await waitForLock(opts.pollMs ?? LOCK_POLL_MS, opts.log, opts.maxWaitMs))
     : !takeLock();
   if (locked) {
     opts.log(`another sweep is running (${lockPath()})`);
@@ -537,6 +545,8 @@ export async function ensureDiskSpace(opts: {
   log: (m: string) => void;
   /** How often to try the sweep lock again while another sweep runs; tests shorten it. */
   pollMs?: number;
+  /** Longest wait for a running sweep; default `TIMEOUTS.DISK_SETUP_SWEEP_WAIT_S`. */
+  maxWaitMs?: number;
 }): Promise<string | null> {
   const files = isCloudOrCi() ? [] : stepFilePaths(opts.cwd);
   if (files.length === 0) return null;
@@ -553,6 +563,7 @@ export async function ensureDiskSpace(opts: {
     dryRun: false,
     wait: true,
     pollMs: opts.pollMs,
+    maxWaitMs: opts.maxWaitMs ?? TIMEOUTS.DISK_SETUP_SWEEP_WAIT_S * 1000,
     log: opts.log,
   });
   const after = freeBytes(opts.cwd);
@@ -560,9 +571,7 @@ export async function ensureDiskSpace(opts: {
   opts.log("what your max steps still cover:");
   await sweep({ cwd: opts.cwd, mode: "max", dryRun: true, log: opts.log });
   const locked =
-    ran.reason === "locked"
-      ? " (another sweep held the lock for over an hour — re-run once it ends)"
-      : "";
+    ran.reason === "locked" ? " (another sweep still holds the lock — re-run once it ends)" : "";
   return `${gb(after)} free after your max cleanup steps, still under ${SETTING} (${opts.minFreeGb} GB)${locked} — free space by hand or add steps (.bkit/templates.md § Disk prune), then re-run`;
 }
 
diff --git a/.bkit/core/engine/shared/timeouts.ts b/.bkit/core/engine/shared/timeouts.ts
index ed253534a..a0de8014d 100644
--- a/.bkit/core/engine/shared/timeouts.ts
+++ b/.bkit/core/engine/shared/timeouts.ts
@@ -24,4 +24,6 @@ export const TIMEOUTS = {
   BKIT_LATEST_RETRY_S: 3600,
   /** Seconds the registry lookup may take before it counts as failed. */
   BKIT_LATEST_LOOKUP_TIMEOUT_S: 5,
+  /** Seconds `worktrees setup` waits for a running disk sweep before refusing; under one agent shell call. */
+  DISK_SETUP_SWEEP_WAIT_S: 60,
 } as const;
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index b75962c41..7301c6237 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -87,10 +87,15 @@ description: "Build Feature — Autonomous implementation"
    Context: You are a subagent in the Build Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-*.md`, `tmp/bkit-diff-{FID}.md` (the run's diff, if present).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md`.
-5. `bkit workflows handover --list-stray` (`--workflow` / `--fid` / `--month` / `--worktree` as below) → on a feature branch remove only the `modified` / `untracked` files this run created by mistake, NEVER other agents' changes; on `dev` / `main` (`shared` = true) remove nothing (only the run's own record lands, through a throwaway checkout). Then commit and push the run's record — NEVER onto a branch with an open PR; **Skip if** `{WORKTREE_PATH}` is not set:
-   ```bash
-   "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
-   ```
+5. `bkit workflows handover --list-stray` (`--workflow` / `--fid` / `--month` / `--worktree` as below) → on a feature branch remove only the `modified` / `untracked` files this run created by mistake, NEVER other agents' changes; on `dev` / `main` (`shared` = true) remove nothing (only the run's own record lands, through a throwaway checkout). Then keep the run's record; **Skip if** `{WORKTREE_PATH}` is not set:
+   - **If** `PUBLISH` = false → the record stays in the kept worktree and NEVER pass `--push`, so a held run pushes nothing; link it by branch with `--ref`:
+     ```bash
+     "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
+     ```
+   - **Else** (`PUBLISH` = true **or** not yet resolved) → commit and push the record — NEVER onto a branch with an open PR:
+     ```bash
+     "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
+     ```
    Route:
    - **If** exit 80 → open PR on `{BRANCH}` via `list_pull_requests` → re-run with `--open-pr={number}` or `--open-pr=none`.
    - **Else** → **If** `tracker.done` = false → post `comment` via the tracker MCP per the header's fallback section → step 6.
@@ -225,10 +230,15 @@ description: "Build Feature — Autonomous implementation"
    - **If** `DECISION_ROUTE` = `retry` → Step 13.
    - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
    - **Else** → Step 12.
-8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then push the record — NEVER onto a branch with an open PR:
-   ```bash
-   "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
-   ```
+8. Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
+   - **If** `PUBLISH` = false → the record stays in the kept worktree and NEVER pass `--push`:
+     ```bash
+     "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --ref="{BRANCH}" --worktree="{WORKTREE_PATH}"
+     ```
+   - **Else** → push the record — NEVER onto a branch with an open PR:
+     ```bash
+     "{BKIT}" workflows handover --post --workflow=build --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
+     ```
    Route as **Failure Path** step 5 does, but go on to step 9 where it goes to its step 6.
 9. Release the lock. NEVER run `workflows fail`:
    ```bash
diff --git a/dist/commands/workflow/disk.js b/dist/commands/workflow/disk.js
index b5d67a295..5429479f0 100644
--- a/dist/commands/workflow/disk.js
+++ b/dist/commands/workflow/disk.js
@@ -29,6 +29,7 @@ import { pathToFileURL } from "node:url";
 import { isCloudOrCi } from "../../checks/before/env.js";
 import { readJsonFile } from "../../shared/json.js";
 import { readBkitConfig } from "../../shared/settings.js";
+import { TIMEOUTS } from "../../shared/timeouts.js";
 import { CommandError, EXIT, git } from "../lib.js";
 import { tryCreate } from "./locks.js";
 const MODES = ["min", "max"];
@@ -182,13 +183,14 @@ function takeLock() {
 }
 /**
  * Take the sweep lock, waiting while another sweep holds it. False only when it is still held
- * after `LOCK_STALE_MS`, which `takeLock` would by then have replaced unless it keeps renewing.
+ * after `maxWaitMs` (default `LOCK_STALE_MS`, after which `takeLock` would have replaced the
+ * lock unless it keeps renewing).
  */
-async function waitForLock(pollMs, log) {
+async function waitForLock(pollMs, log, maxWaitMs = LOCK_STALE_MS + pollMs) {
     if (takeLock())
         return true;
     log(`another sweep is running (${lockPath()}) — waiting for it to end`);
-    const deadline = Date.now() + LOCK_STALE_MS + pollMs;
+    const deadline = Date.now() + maxWaitMs;
     while (Date.now() < deadline) {
         await new Promise((resolve) => setTimeout(resolve, pollMs));
         if (takeLock())
@@ -287,7 +289,7 @@ export async function sweep(opts) {
         return result;
     }
     const locked = opts.wait
-        ? !(await waitForLock(opts.pollMs ?? LOCK_POLL_MS, opts.log))
+        ? !(await waitForLock(opts.pollMs ?? LOCK_POLL_MS, opts.log, opts.maxWaitMs))
         : !takeLock();
     if (locked) {
         opts.log(`another sweep is running (${lockPath()})`);
@@ -433,6 +435,7 @@ export async function ensureDiskSpace(opts) {
         dryRun: false,
         wait: true,
         pollMs: opts.pollMs,
+        maxWaitMs: opts.maxWaitMs ?? TIMEOUTS.DISK_SETUP_SWEEP_WAIT_S * 1000,
         log: opts.log,
     });
     const after = freeBytes(opts.cwd);
@@ -440,9 +443,7 @@ export async function ensureDiskSpace(opts) {
         return null;
     opts.log("what your max steps still cover:");
     await sweep({ cwd: opts.cwd, mode: "max", dryRun: true, log: opts.log });
-    const locked = ran.reason === "locked"
-        ? " (another sweep held the lock for over an hour — re-run once it ends)"
-        : "";
+    const locked = ran.reason === "locked" ? " (another sweep still holds the lock — re-run once it ends)" : "";
     return `${gb(after)} free after your max cleanup steps, still under ${SETTING} (${opts.minFreeGb} GB)${locked} — free space by hand or add steps (.bkit/templates.md § Disk prune), then re-run`;
 }
 // ---------------------------------------------------------------------------
diff --git a/dist/shared/timeouts.js b/dist/shared/timeouts.js
index cfcc7846d..5c4f37fef 100644
--- a/dist/shared/timeouts.js
+++ b/dist/shared/timeouts.js
@@ -23,4 +23,6 @@ export const TIMEOUTS = {
     BKIT_LATEST_RETRY_S: 3600,
     /** Seconds the registry lookup may take before it counts as failed. */
     BKIT_LATEST_LOOKUP_TIMEOUT_S: 5,
+    /** Seconds `worktrees setup` waits for a running disk sweep before refusing; under one agent shell call. */
+    DISK_SETUP_SWEEP_WAIT_S: 60,
 };
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 20a701526..f22d8b2d2 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -159,3 +159,5 @@
 {"schema":3,"ts":1793320996470,"firstTs":1793320996470,"updates":1,"kind":"deferral","key":"748-names-outside-the-branding-rule","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-generate","subagent":"bkit-plan-generate","model":"claude-opus-5-5"},"references":["748","docs/plans/202610/logs/748-brand-every-consumer/plan-input-1.md § Out of Scope","748-consumer-facing-names-carry-bkit-prefix"],"type":"issue","category":"tooling","severity":"LOW","reason":"scope-declared","summary":"Names the #748 branding rule leaves unprefixed: generic stack script slots, tool-fixed file names, engine-internal names, job ids","description":"Generic stack scripts (`typecheck`, `lint`, `format:check`, `test`, `build`, `lint:slop`, `prepare`) are consumer-owned slots with a stack-agnostic contract; file names a third-party tool fixes (`.oxlintrc.json`, `dependabot.yml`, `.vale.ini`, `.lintstagedrc.json`, `.serena/project.yml`, `slop-scan.config.json`, `.husky/*`) cannot carry the prefix; engine-internal names (`.bkit/core/engine/shared/bkit-latest.ts`) are not consumer-facing; workflow job ids stay so `needs:` and consumer edits keep working.","source":"phase","status":"OPEN"}
 {"schema":3,"ts":1793320996471,"firstTs":1793320996471,"updates":1,"kind":"deferral","key":"748-rename-unprefixed-template-script-files","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-generate","subagent":"bkit-plan-generate","model":"claude-opus-5-5"},"references":["748","docs/plans/202610/logs/748-brand-every-consumer/plan-v1-draft.md § Open Questions & Assumptions",".bkit/templates/scripts/ci/",".bkit/templates/scripts/launchd/"],"type":"issue","category":"tooling","severity":"LOW","reason":"needs-decision","summary":"Twelve copy-and-own template files under `.bkit/templates/scripts/` lack the `bkit-` prefix the branding rule asks for","description":"Decision needed: rename them or exempt them. Files: `scripts/ci/check-capstone.mjs`, `check-capstone.test.mjs`, `check-dependency-audit.mjs`, `check-dependency-audit.test.mjs`, `check-accepted-divergences.mjs`, `check-accepted-divergences.test.mjs`, `accepted-advisories.json`, `accepted-divergences.json`, `lanes/resolve-push-base.mjs`, `lanes/resolve-push-base.test.mjs`, `scripts/launchd/ai.bkit.launchd.plist`, `scripts/launchd/launchd.env.example`. Options: A) rename all with an upgrade migration that moves adopted copies and rewrites path references in the consumer's CI workflow (the capstone script backs the required `bkit-tests-check`); B) keep them as named per-file exceptions in the branding guard. #748's plan ships B as the guard's default; renaming needs its own plan because it touches the required check's script path in every consumer CI workflow.","remediation":"Rename each file to `bkit-<name>`, update `.bkit/templates/.github/workflows/bkit-ci.yml`, `.bkit/core/.bkit/templates.md`, bkit's own copies and the tests that load them, add an upgrade migration for adopted copies, and drop the guard's exception list.","source":"phase","status":"OPEN"}
 {"schema":3,"ts":1793324364224,"firstTs":1793320996471,"updates":2,"kind":"deferral","key":"748-rename-unprefixed-template-script-files","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-update","subagent":"bkit-plan-update","model":"claude-opus-5-5"},"references":["748","docs/plans/202610/logs/748-brand-every-consumer/plan-v1-draft.md § Open Questions & Assumptions","docs/plans/202610/logs/748-brand-every-consumer/plan-v2-reviewed.md § Agent Execution Runbook TASK 2","docs/plans/202610/logs/748-brand-every-consumer/plan-v2-reviewed.md § Agent Execution Runbook TASK 8","docs/plans/202610/logs/748-brand-every-consumer/plan-v2-reviewed.md § Open Questions & Assumptions",".bkit/templates/scripts/ci/",".bkit/templates/scripts/launchd/"],"type":"issue","category":"tooling","severity":"LOW","reason":"needs-decision","summary":"Twelve copy-and-own template files under `.bkit/templates/scripts/` lack the `bkit-` prefix the branding rule asks for","description":"Triaged into #748 plan-v2: Task 2 renames the twelve files (`scripts/ci/check-capstone.mjs`, `check-capstone.test.mjs`, `check-dependency-audit.mjs`, `check-dependency-audit.test.mjs`, `check-accepted-divergences.mjs`, `check-accepted-divergences.test.mjs`, `accepted-advisories.json`, `accepted-divergences.json`, `lanes/resolve-push-base.mjs`, `lanes/resolve-push-base.test.mjs` → `bkit-<name>`; `scripts/launchd/ai.bkit.launchd.plist` → `bkit-launchd.plist`, `scripts/launchd/launchd.env.example` → `bkit-launchd.env.example`) with bkit's own copies, and Task 8 adds the upgrade migration that moves shipped-content consumer copies and rewrites their `scripts/ci/` paths; the branding guard keeps no exception list. Pending the owner on plan-v2 Open Question 2 (Recommended A, default A); answer B (owner narrows the Narrative) restores the per-file guard exceptions.","remediation":"Rename each file to `bkit-<name>`, update `.bkit/templates/.github/workflows/bkit-ci.yml`, `.bkit/core/.bkit/templates.md`, bkit's own copies and the tests that load them, add an upgrade migration for adopted copies, and drop the guard's exception list.","source":"phase","status":"TRIAGED"}
+{"schema":3,"ts":1793501859358,"firstTs":1793501859358,"updates":1,"kind":"deferral","key":"715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-disk-ts-232","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["715-retire-lite-workflows"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"Two `--wait` sweeps polling every 5s that both find a dead or hour-old holder can each `rmSync` the other's fresh lock in `takeLock` (stat → read → rm → create is not atomic), so two sweeps run the same irreversible delete steps at once","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/disk.ts:232: Two `--wait` sweeps polling every 5s that both find a dead or hour-old holder can each `rmSync` the other's fresh lock in `takeLock` (stat → read → rm → create is not atomic), so two sweeps run the same irreversible delete steps at once. Done when: `takeLock` replaces a stale lock atomically (e.g. `renameSync` the stale file to a unique name and verify it still holds the stale holder line before `tryCreate`, or re-read the holder immediately before removal and abort when it changed), so a lock another process created after this one's `statSync` is never removed; the existing \"replaces a lock whose process is gone, or that is an hour old\" case still passes.","source":".bkit/core/engine/commands/workflow/disk.ts:232"}
+{"schema":3,"ts":1793501859359,"firstTs":1793501859359,"updates":1,"kind":"deferral","key":"715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-status-ts-269","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["715-retire-lite-workflows"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A `publish=true` substring anywhere in the verbatim session prompt (pasted issue text, a log excerpt, or a negation such as \"do not use publish=true\") overrides a durable `bkit.workflows.build.publish.local: false`, so untrusted pasted text flips a held local build into a push and an open PR","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/status.ts:269: A `publish=true` substring anywhere in the verbatim session prompt (pasted issue text, a log excerpt, or a negation such as \"do not use publish=true\") overrides a durable `bkit.workflows.build.publish.local: false`, so untrusted pasted text flips a held local build into a push and an open PR. Done when: The owner decides whether prompt text may raise a configured hold to a publish. No agent can settle it, because the confirmed plan (Breaking Changes, \"Session token (new)\" row, and Edge Cases \"Token and config disagree\") makes the substring token win over config, and docs/security.md § Untrusted Content & Prompt Injection treats pasted content as untrusted. The decision to make: either a token may only lower `publish` (a `publish=true` token cannot override `publish.local: false`), or the token must stand alone (its own line or the bracket form) so text embedded in pasted content does not match; `publishRoute` then follows that rule.","source":".bkit/core/engine/commands/workflow/status.ts:269"}
