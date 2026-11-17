diff --git a/.bkit/core/engine/commands/ci/push-gate.ts b/.bkit/core/engine/commands/ci/push-gate.ts
index e04f32c29..168e1c88e 100644
--- a/.bkit/core/engine/commands/ci/push-gate.ts
+++ b/.bkit/core/engine/commands/ci/push-gate.ts
@@ -43,7 +43,13 @@ const receiptPath = (cwd: string, sha: string): string | null => {
   return outbox ? path.join(outbox, "push-gates", `${sha}.json`) : null;
 };
 
-const STATUS = ["status", "--porcelain", "--untracked-files=all", "--ignore-submodules=none"];
+const STATUS = [
+  "status",
+  "--porcelain",
+  "--no-renames",
+  "--untracked-files=all",
+  "--ignore-submodules=none",
+];
 const lineCount = (text: string | null): number =>
   text === null ? -1 : text === "" ? 0 : text.split("\n").length;
 
diff --git a/.bkit/core/engine/commands/workflow/tests.test.ts b/.bkit/core/engine/commands/workflow/tests.test.ts
index d9c926533..f66445984 100644
--- a/.bkit/core/engine/commands/workflow/tests.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -999,6 +999,23 @@ describe("bkit tests run — push-gate receipt", () => {
     timeout,
   );
 
+  it(
+    "a staged rename of code into a bookkeeping path records no receipt",
+    async () => {
+      repo();
+      write("src/a.test.ts", "export const a = 1;\n");
+      gitIn("add", "-A");
+      gitIn("commit", "-q", "-m", "code");
+      const sha = head();
+      fs.mkdirSync(path.join(cwd, "docs/plans"), { recursive: true });
+      gitIn("mv", "src/a.test.ts", "docs/plans/x.ts");
+      const r = await run(gateArgs(DEEP));
+      expect(r.code).toBe(0);
+      expect(fs.existsSync(receipt(sha))).toBe(false);
+    },
+    timeout,
+  );
+
   it(
     "only the required push gate records a receipt",
     async () => {
diff --git a/.bkit/core/engine/install/modules/core.integration.test.ts b/.bkit/core/engine/install/modules/core.integration.test.ts
index 7971fdedf..82d663b27 100644
--- a/.bkit/core/engine/install/modules/core.integration.test.ts
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -1563,6 +1563,80 @@ describe("lowerVerifyMaxAttempts (via seedCorePackageJsonScripts)", () => {
   });
 });
 
+describe("lowerVerifyMaxAttempts runs once per install", () => {
+  it("a verify limit set above 2 after this release's upgrade is kept and bkit check reports no drift", () => {
+    fs.writeFileSync(
+      "package.json",
+      JSON.stringify(
+        {
+          name: "x",
+          bkit: { workflows: { build: { verify: { ask: false, maxAttempts: 3 } } } },
+        },
+        null,
+        4,
+      ) + "\n",
+      "utf-8",
+    );
+    const versionFile = path.join(tmpDir, ".bkit", "version");
+    fs.mkdirSync(path.dirname(versionFile), { recursive: true });
+    writeBkitVersion(versionFile, {
+      pinnedVersion: readInstallingVersion(),
+      canonicalHashes: {},
+      claudeAllowDerived: [],
+    });
+    const verify = (): unknown =>
+      JSON.parse(fs.readFileSync("package.json", "utf-8")).bkit.workflows.build.verify;
+    const lines: string[] = [];
+    const spy = vi.spyOn(console, "log").mockImplementation((...a: unknown[]) => {
+      lines.push(a.join(" "));
+    });
+    try {
+      seedCorePackageJsonScripts(makeCtx());
+      expect(verify()).toEqual({ ask: false, maxAttempts: 3 });
+      const dry = makeCtx({ dryRun: true });
+      seedCorePackageJsonScripts(dry);
+      expect(dry.ws.writes.filter((w) => w.path === "package.json")).toEqual([]);
+    } finally {
+      spy.mockRestore();
+    }
+    expect(verify()).toEqual({ ask: false, maxAttempts: 3 });
+    expect(lines.filter((l) => l.includes("maxAttempts"))).toEqual([]);
+  });
+});
+
+describe("lowerVerifyMaxAttempts fixed threshold", () => {
+  it("an install recorded after 6.1.1 keeps a verify limit above 2 across a later version upgrade", () => {
+    fs.writeFileSync(
+      "package.json",
+      JSON.stringify(
+        { name: "x", bkit: { workflows: { build: { verify: { ask: false, maxAttempts: 3 } } } } },
+        null,
+        4,
+      ) + "\n",
+      "utf-8",
+    );
+    const versionFile = path.join(tmpDir, ".bkit", "version");
+    fs.mkdirSync(path.dirname(versionFile), { recursive: true });
+    writeBkitVersion(versionFile, {
+      pinnedVersion: "6.1.2",
+      canonicalHashes: {},
+      claudeAllowDerived: [],
+    });
+    const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
+    try {
+      seedCorePackageJsonScripts(makeCtx());
+    } finally {
+      spy.mockRestore();
+    }
+    expect(
+      JSON.parse(fs.readFileSync("package.json", "utf-8")).bkit.workflows.build.verify,
+    ).toEqual({
+      ask: false,
+      maxAttempts: 3,
+    });
+  });
+});
+
 describe("migrateRetiredDevLock (via runBkitDocs)", () => {
   const LOCK = path.join(".bkit", ".dev.lock");
   const HELD = '{"pid":4242,"host":"old","ts":1760000000000,"line":"ship 638-x"}\n';
diff --git a/.bkit/core/engine/install/modules/core.ts b/.bkit/core/engine/install/modules/core.ts
index c9adb7eb4..f311fa3b1 100644
--- a/.bkit/core/engine/install/modules/core.ts
+++ b/.bkit/core/engine/install/modules/core.ts
@@ -31,6 +31,7 @@ import { migrateTemplateNotes } from "../template-notes.js";
 import type { PreflightFinding } from "../../checks/before/index.js";
 import { isAdvisorySuppressed } from "../../checks/after/suppression.js";
 import { parseJson, readJsonFile } from "../../shared/json.js";
+import { compareSemver } from "../../shared/bkit-latest.js";
 import { readInstallingVersion } from "../../shared/package-json.js";
 import { detectDepUpdater, type DepUpdater } from "../../shared/dep-updater.js";
 import { ASK_POINTS, CONFIG_DEFAULTS, ciWorkflowPath, limitKey } from "../../shared/settings.js";
@@ -1593,12 +1594,22 @@ export function pruneMinPushPaths(dryRun: boolean, ws: WriteSet, logPrefix: stri
   return true;
 }
 
+const LAST_RELEASE_WITHOUT_VERIFY_CAP = "6.1.1";
+
 // Migration (up to 6.1.x installs, `docs/migrations.md`): `bkit.workflows.build.verify.maxAttempts`
 // is one non-resetting allowance per run, and every build limit is 2. A value above 2 is
-// lowered to 2; 2 or less is left alone. Returns true when package.json changed.
+// lowered to 2 once, on the upgrade from an install that predates this release (no recorded
+// version, an unreadable one, or an older one); 2 or less is left alone, and a value set after
+// that upgrade is the consumer's. Returns true when package.json changed.
 export function lowerVerifyMaxAttempts(dryRun: boolean, ws: WriteSet, logPrefix: string): boolean {
   const pkgPath = "package.json";
   if (!fs.existsSync(pkgPath)) return false;
+  const recorded = readBkitVersion(path.join(".bkit", "version"))?.pinnedVersion ?? "";
+  // Skip a re-run of the same version, and any install recorded after the last release without
+  // this migration, so a value set after the upgrade to this release is never lowered again.
+  const order = compareSemver(recorded, readInstallingVersion());
+  if (order === 0 || order === 1) return false;
+  if (compareSemver(recorded, LAST_RELEASE_WITHOUT_VERIFY_CAP) === 1) return false;
   const raw = fs.readFileSync(pkgPath, "utf-8");
   const parsed = parseJson(raw);
   if (!parsed.ok) return false;
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 13d66c93f..be97e7265 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -215,3 +215,4 @@
 {"schema":3,"ts":1794636095452,"kind":"friction","key":"steps-finish/build-plan-gaps-remediate-holistic","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate-holistic"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-gaps-remediate-holistic with exit 11: `.bkit/core/engine/checks/tips/catalogue.test.ts` \"pre-push-direnv fires only for a hook without direnv exec in a repo with .envrc\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"c3913835883052113d622d3cee77157ba547f6f6"},"recurrenceCount":4,"lastConfirmed":1794636095452}
 {"schema":3,"ts":1794644085767,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":20,"lastConfirmed":1794644085767}
 {"schema":3,"ts":1794654334458,"kind":"friction","key":"steps-finish/build-plan-gaps-remediate-holistic","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate-holistic"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-gaps-remediate-holistic with exit 11: `.bkit/core/engine/checks/tips/catalogue.test.ts` \"pre-push-direnv fires only for a hook without direnv exec in a repo with .envrc\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"c3913835883052113d622d3cee77157ba547f6f6"},"recurrenceCount":5,"lastConfirmed":1794654334458}
+{"schema":3,"ts":1794736405643,"kind":"friction","key":"steps-finish/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-tasks with exit 11: `.bkit/core/engine/commands/workflow/tracker.test.ts` \"edits by verified comment id through each existing transport\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"seals unavailable or unstable representation evidence\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"uses accepted final preflight eligibility without provider atomicity\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"refuses aggregation with an unverified provider budget\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"5834934f4a050b24979f75e161c9017d284733a2"},"recurrenceCount":5,"lastConfirmed":1794736405643}
diff --git a/DETAILS.md b/DETAILS.md
index 5c8de0ba1..9db5b0ba3 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -357,7 +357,7 @@ flowchart LR
   n_bkit_core_engine_commands -->|465| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|412| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|221| n_bkit_core_engine_install
-  n_bkit_core_engine_install -->|182| n_bkit_core_engine_shared
+  n_bkit_core_engine_install -->|186| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|145| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|84| n_bkit_core_engine_checks
   n_bkit_core_engine_checks -->|81| n_bkit_core_engine_install
diff --git a/dist/commands/ci/push-gate.js b/dist/commands/ci/push-gate.js
index a4a5bafed..8b13ceed4 100644
--- a/dist/commands/ci/push-gate.js
+++ b/dist/commands/ci/push-gate.js
@@ -41,7 +41,13 @@ const receiptPath = (cwd, sha) => {
     const outbox = outboxRoot(cwd);
     return outbox ? path.join(outbox, "push-gates", `${sha}.json`) : null;
 };
-const STATUS = ["status", "--porcelain", "--untracked-files=all", "--ignore-submodules=none"];
+const STATUS = [
+    "status",
+    "--porcelain",
+    "--no-renames",
+    "--untracked-files=all",
+    "--ignore-submodules=none",
+];
 const lineCount = (text) => text === null ? -1 : text === "" ? 0 : text.split("\n").length;
 /** HEAD when every uncommitted path lies inside `tolerated` (none given: the tree must be clean). */
 function cleanHead(cwd, tolerated = []) {
diff --git a/dist/install/modules/core.js b/dist/install/modules/core.js
index 6b114193f..731a5fd56 100644
--- a/dist/install/modules/core.js
+++ b/dist/install/modules/core.js
@@ -13,6 +13,7 @@ import { migrateContextCiWorkflow } from "../context-ci-workflow.js";
 import { migrateTemplateNotes } from "../template-notes.js";
 import { isAdvisorySuppressed } from "../../checks/after/suppression.js";
 import { parseJson, readJsonFile } from "../../shared/json.js";
+import { compareSemver } from "../../shared/bkit-latest.js";
 import { readInstallingVersion } from "../../shared/package-json.js";
 import { detectDepUpdater } from "../../shared/dep-updater.js";
 import { ASK_POINTS, CONFIG_DEFAULTS, ciWorkflowPath, limitKey } from "../../shared/settings.js";
@@ -1397,13 +1398,24 @@ export function pruneMinPushPaths(dryRun, ws, logPrefix) {
     console.log(`${logPrefix} ${dryRun ? "[dry-run] " : ""}core: dropped [${dropped.join(", ")}] from bkit.testing.minPushPaths in package.json — bkit always allows what it writes, and ciSkipPaths counts`);
     return true;
 }
+const LAST_RELEASE_WITHOUT_VERIFY_CAP = "6.1.1";
 // Migration (up to 6.1.x installs, `docs/migrations.md`): `bkit.workflows.build.verify.maxAttempts`
 // is one non-resetting allowance per run, and every build limit is 2. A value above 2 is
-// lowered to 2; 2 or less is left alone. Returns true when package.json changed.
+// lowered to 2 once, on the upgrade from an install that predates this release (no recorded
+// version, an unreadable one, or an older one); 2 or less is left alone, and a value set after
+// that upgrade is the consumer's. Returns true when package.json changed.
 export function lowerVerifyMaxAttempts(dryRun, ws, logPrefix) {
     const pkgPath = "package.json";
     if (!fs.existsSync(pkgPath))
         return false;
+    const recorded = readBkitVersion(path.join(".bkit", "version"))?.pinnedVersion ?? "";
+    // Skip a re-run of the same version, and any install recorded after the last release without
+    // this migration, so a value set after the upgrade to this release is never lowered again.
+    const order = compareSemver(recorded, readInstallingVersion());
+    if (order === 0 || order === 1)
+        return false;
+    if (compareSemver(recorded, LAST_RELEASE_WITHOUT_VERIFY_CAP) === 1)
+        return false;
     const raw = fs.readFileSync(pkgPath, "utf-8");
     const parsed = parseJson(raw);
     if (!parsed.ok)
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 2669f01cf..d4a8fb48f 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -174,7 +174,7 @@ flowchart LR
   n_bkit_core_engine_commands -->|465| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|412| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|221| n_bkit_core_engine_install
-  n_bkit_core_engine_install -->|182| n_bkit_core_engine_shared
+  n_bkit_core_engine_install -->|186| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|145| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|84| n_bkit_core_engine_checks
   n_bkit_core_engine_checks -->|81| n_bkit_core_engine_install
@@ -435,6 +435,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_roadmap -->|15| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_workflow_runs -->|15| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_steps -->|15| n_bkit_core_engine_commands_workflow_issues
+  n_bkit_core_engine_install_modules_core -->|15| n_bkit_core_engine_install_version_file
   n_bkit_core_engine_install_modules_opencode -->|15| n_bkit_core_engine_install_write
   n_bkit_core_engine_commands_workflow_tests -->|14| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_checks_after_managed -->|14| n_bkit_core_engine_install_managed_block
@@ -443,7 +444,6 @@ flowchart LR
   n_bkit_core_engine_commands_install_upgrade -->|14| n_bkit_core_engine_install_version_file
   n_bkit_core_engine_commands_workflow_branches -->|14| n_bkit_core_engine_commands_workflow_prs
   n_bkit_core_engine_commands_workflow_summary_findings -->|14| n_bkit_core_engine_commands_workflow_challenge
-  n_bkit_core_engine_install_modules_core -->|14| n_bkit_core_engine_install_version_file
   nscripts_harvest -->|14| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_checks_after_index -->|13| n_bkit_core_engine_checks_after_tools
   n_bkit_core_engine_commands_ci_ci -->|13| n_bkit_core_engine_commands_workflow_ledgers
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index ccf6757d5..762f5a7fc 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -373,3 +373,6 @@
 {"schema":3,"ts":1794715226855,"firstTs":1794715226855,"updates":1,"kind":"deferral","key":"951-holistic-mechanical-gap-regen-option-e","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-apply-review","subagent":"bkit-plan-update","model":"claude-opus-5-5"},"references":["951","https://github.com/cbartens/bkit/issues/951","docs/plans/202611/logs/951-build-repeat-whole/plan-v2-reviewed.md § Out of Scope"],"type":"feature","category":"agentic","severity":"LOW","reason":"scope-declared","summary":"Run regen commands for mechanical holistic gaps instead of a fix round (option E)","description":"#951 § Out of Scope and the plan's Out of Scope row leave option E out: the build.holistic allowance and the changed-files test scope meet the time goal without it.","remediation":"A future design issue, if mechanical gaps still cost fix rounds after #951 ships.","source":"phase","status":"OPEN"}
 {"schema":3,"ts":1794715226856,"firstTs":1794715226856,"updates":1,"kind":"deferral","key":"951-skip-holistic-between-challenge-rounds-option-d","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-apply-review","subagent":"bkit-plan-update","model":"claude-opus-5-5"},"references":["951","https://github.com/cbartens/bkit/issues/951","docs/plans/202611/logs/951-build-repeat-whole/plan-v2-reviewed.md § Out of Scope"],"type":"feature","category":"agentic","severity":"LOW","reason":"scope-declared","summary":"Skip the holistic check between Build Challenge rounds (option D)","description":"#951 § Out of Scope and the plan's Out of Scope row leave option D out: scoped holistic rounds meet the time goal while keeping the check.","remediation":"Revisit after measuring Success Criterion 5 on a 923-shaped build.","source":"phase","status":"OPEN"}
 {"schema":3,"ts":1794715226857,"firstTs":1794715226857,"updates":1,"kind":"deferral","key":"951-ship-deferred-sweep-840","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-apply-review","subagent":"bkit-plan-update","model":"claude-opus-5-5"},"references":["951","840","https://github.com/cbartens/bkit/issues/840","docs/plans/202611/logs/951-build-repeat-whole/plan-v2-reviewed.md § Out of Scope"],"type":"issue","category":"agentic","severity":"LOW","reason":"scope-declared","summary":"The ship-time completeness check (deferred sweep) after build verify","description":"Whether ship keeps, slims or drops its deferred sweep is a ship-phase decision no #951 build criterion depends on. The plan's Out of Scope row leaves it to #840.","remediation":"Decide it in #840.","source":"phase","status":"OPEN"}
+{"schema":3,"ts":1794730815880,"firstTs":1794730815880,"updates":1,"kind":"deferral","key":"951-build-repeat-whole-challenge-low-bkit-core-engine-commands-ci-push-gate-ts-108","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["951-build-repeat-whole"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"While Step 12 waits on the tests lock, another worktree's full gate fails on the same commit; the lock-wait restore then deletes that `.failed` marker (and can put back an older receipt), so a later push reuses proof across a real failure","description":"LOW build challenge finding at .bkit/core/engine/commands/ci/push-gate.ts:108: While Step 12 waits on the tests lock, another worktree's full gate fails on the same commit; the lock-wait restore then deletes that `.failed` marker (and can put back an older receipt), so a later push reuses proof across a real failure. Done when: On a lock wait, `runWithReceipt` restores the prior receipt and `.failed` marker only when the files still hold what this run itself wrote at its start (its own `fail()` marker, no receipt); a marker or receipt another run wrote during the wait is left as it is.","source":".bkit/core/engine/commands/ci/push-gate.ts:108"}
+{"schema":3,"ts":1794730815881,"firstTs":1794730815881,"updates":1,"kind":"deferral","key":"951-build-repeat-whole-challenge-low-bkit-core-workflows-bkit-build-md-165","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["951-build-repeat-whole"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"Every holistic limit pause now tells the owner \"build holistic: attempt 3 of 2\", because the pause fires only on exit 1 and passes the refused `:next` fix round as the attempt","description":"LOW build challenge finding at .bkit/core/workflows/bkit-build.md:165: Every holistic limit pause now tells the owner \"build holistic: attempt 3 of 2\", because the pause fires only on exit 1 and passes the refused `:next` fix round as the attempt. Done when: The holistic `LOOP_FLAGS` pass the number of fix rounds already run in the active run (the `:next` value minus one, or a `counters derive` count), so the first limit pause reads `build holistic: attempt 2 of 2` and a pause after one grant reads `attempt 4 of 4`; the mirrors and render snapshots are regenerated.","source":".bkit/core/workflows/bkit-build.md:165"}
+{"schema":3,"ts":1794730815882,"firstTs":1794730815882,"updates":1,"kind":"deferral","key":"951-build-repeat-whole-challenge-low-bkit-core-engine-commands-workflow-tests-ts-1795","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["951-build-repeat-whole"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"`tests run --changed-since` with no changed files returns PASS but writes no `--artifact` and no clamp log, so the Step 8 `steps finish --artifact=build-group-gate-{GROUP}-<attempt>.md` that follows refuses with \"does not exist\"","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/tests.ts:1795: `tests run --changed-since` with no changed files returns PASS but writes no `--artifact` and no clamp log, so the Step 8 `steps finish --artifact=build-group-gate-{GROUP}-<attempt>.md` that follows refuses with \"does not exist\". Done when: The zero-change branch writes its \"no files changed since {sha} — nothing to run\" line to `--log`, copies it to `--artifact` with a clamp record when `--artifact` is given, and records the artifact on its `test-run` row, the same as a run that executed.","source":".bkit/core/engine/commands/workflow/tests.ts:1795"}
diff --git a/docs/migrations.md b/docs/migrations.md
index ebb79b38e..5aa6649a0 100644
--- a/docs/migrations.md
+++ b/docs/migrations.md
@@ -27,7 +27,7 @@
 | `bkit` settings grouped into sections | `.bkit/core/engine/install/modules/core.ts` (`migrateBkitLayout`, `BKIT_LAYOUT_MOVES`, called by `seedCorePackageJsonScripts` after the Linear and GitHub key moves) | `package.json` flat `bkit` keys → their section: `issueTracker` → `tracker.default`; `github` / `linear` / `jira` → `tracker.github` / `.linear` / `.jira`; `cloudAgents` → `cloud.agent`; `opencodeProvider` / `opencodeProviders` → `providers.opencode.default` / `.installed`; `minPushPaths` / `capstoneJob` / `ciWorkflow` / `shipGateRequiredLanes` → `testing.minPushPaths` / `.ciCapstone` / `.ciWorkflow` / `.ciRequired`; `disk.minFreeGb` → `workflows.minFreeGb`; `worktree` / `tasks` → `workflows.worktree` / `.tasks`; `roadmapNext` → `prompts.roadmapNext`; `depUpdater` → `dependencies.updater`; `ignoreAdvisories` → `advisories.ignore`. `loopPause: true\|false` → `ask` on every point under `workflows.design` / `.build` / `.debug` / `.ship`; a non-boolean `loopPause` is dropped. 6.0.0's `testing.shipGate` → `testing.ciRequired`. A value already at the new path wins; two blocks merge key by key. A non-object where a section belongs leaves that old key in place. Old keys deleted. Original indent kept. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts` |
 | Dependency updater recorded | `.bkit/core/engine/install/modules/core.ts` (`fillDepUpdater`, called by `seedBkitDefaults`) | `package.json` `bkit.dependencies.updater: ""` → `"renovate"` / `"dependabot"` when exactly that updater's config is present (`shared/dep-updater.ts` `detectDepUpdater`). A set value, a non-object `dependencies`, both configs or none → left alone. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts` |
 | Min-push list pruned to what bkit does not write | `.bkit/core/engine/install/modules/core.ts` (`pruneMinPushPaths`, `MIN_PUSH_FLOOR_ENTRIES`, called by `seedCorePackageJsonScripts` after `migrateBkitLayout`) | `package.json` `bkit.testing.minPushPaths` → minus `docs/plans/**`, `docs/*.jsonl`, `.bkit/*.jsonl` and any entry also in `bkit.testing.ciSkipPaths`, because `bkit ci min-push` always allows what bkit writes (ship's `pr` bookkeeping allow-list, `docs/plans/**`) and `ciSkipPaths`. Other entries keep their order; a list the prune cannot shorten, or a missing or non-array key, is left alone. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts` |
-| Verify limit lowered to 2 | `.bkit/core/engine/install/modules/core.ts` (`lowerVerifyMaxAttempts`, called by `seedCorePackageJsonScripts` after `pruneMinPushPaths`) | `package.json` `bkit.workflows.build.verify.maxAttempts` above 2 → 2, because the holistic check now has one non-resetting allowance per run and every build limit is 2. A value of 2 or less, or a missing key, is left alone. | up to 6.1.x | `.bkit/core/engine/install/modules/core.integration.test.ts` |
+| Verify limit lowered to 2 | `.bkit/core/engine/install/modules/core.ts` (`lowerVerifyMaxAttempts`, called by `seedCorePackageJsonScripts` after `pruneMinPushPaths`) | `package.json` `bkit.workflows.build.verify.maxAttempts` above 2 → 2, once, on the upgrade from an install whose recorded `.bkit/version` is missing or older than the release that ships this (6.1.x), because the holistic check now has one non-resetting allowance per run and every build limit is 2. A value of 2 or less, or a missing key, is left alone, and a value above 2 set after that upgrade is kept. | up to 6.1.x | `.bkit/core/engine/install/modules/core.integration.test.ts` |
 | Ledger rows moved to `schema: 2` | `.bkit/core/engine/ledgers/migrate.ts` (`migrateLedgers`, `migrateLedgerText`); `.bkit/core/engine/install/modules/core.ts` (`migrateLedgerSchema`, called by `runBkitDocs`); `.bkit/core/engine/install/version-file.ts` (`isSchemaLedger` keeps ledgers out of `canonicalHashes`) | Every line without `schema` in `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `.bkit/issues.jsonl`, `docs/{decisions,deferrals,failures,knowledge}.jsonl` → rewritten in place through `normalize()` (`.bkit/jsonl.md` § Versioning: `bkitVersion` → `bkit.version`, `workflow` / `step` / `subagent` / `model` → `by.*`, `parentSha` → `run.parentSha`, stats run fields into their blocks). A `schema` line, a malformed line or a non-object line stays byte-for-byte; an old line whose rewrite the file already holds (a union merge of a pre-migration branch) is dropped; written via temp file + rename. Each rewritten ledger is a recorded write, so `bkit check` fails until upgrade runs. Readers still `normalize()`: a union merge can bring an old line back. | up to 5.5.x | `.bkit/core/engine/ledgers/migrate.test.ts`; `.bkit/core/engine/install/modules/core.integration.test.ts` |
 | Jira key renamed to `BKIT_JIRA_API_KEY` | `.bkit/core/engine/install/modules/core.ts` (`migrateJiraKeyName`, called by `runBkitDocs`) | `.bkit/.env` lines naming `BKIT_JIRA_API_TOKEN` (assignment and comments) → `BKIT_JIRA_API_KEY`, value kept. A file already assigning `BKIT_JIRA_API_KEY` is left alone. Logged only, never a recorded write: a recorded write gets a `canonicalHashes` entry, and a secrets file is never hashed, so `bkit check` does not flag the old name. The `.mcp.json` / `.cursor/mcp.json` / `opencode.json` tracker entries are bkit-owned and re-render with the new name. | up to 5.5.x | `.bkit/core/engine/install/modules/core.integration.test.ts` |
 | Template note moved inside the managed block | `.bkit/core/engine/install/template-notes.ts` (`migrateTemplateNotes`, `RETIRED_TEMPLATE_NOTE_HASHES`, called by `runBkitDocs`) | `docs/templates/bkit-*.md` with a `<!-- Note: … -->` line above `<!-- bkit:start -->` whose sha256 matches a note wording a bkit template carried there → that line removed, with the blank line after it, because the note now opens the managed block, where upgrade refreshes it. When nothing else is left above the block, every blank line there goes too. Every other line above the block stays, and a leading byte-order mark stays. A note that matches no shipped wording is kept; when it names `docs/audits/{YYYYMM}`, `docs/plans/{YYYYMM}` or `@bkit-`, install, upgrade and `bkit check` each print one line naming the file. A file with CRLF line endings throughout is left as it is. Recorded in ws, so `bkit check` fails until upgrade runs. | 5.0.0-6.0.x | `.bkit/core/engine/install/template-notes.test.ts`; `.bkit/core/engine/install/modules/core.integration.test.ts` |
