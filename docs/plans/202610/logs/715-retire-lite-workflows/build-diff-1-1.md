diff --git a/.bkit/core/engine/checks/before/index.test.ts b/.bkit/core/engine/checks/before/index.test.ts
index 4f925b16a..1177dc329 100644
--- a/.bkit/core/engine/checks/before/index.test.ts
+++ b/.bkit/core/engine/checks/before/index.test.ts
@@ -126,6 +126,20 @@ describe("runPreflight", () => {
     expect(advisories.filter((f) => f.id === "bkit-tasks-form-stale")).toHaveLength(1);
   });
 
+  it("collects build publish advisories into advisories", () => {
+    fs.writeFileSync(
+      path.join(tmpDir, "package.json"),
+      JSON.stringify({
+        bkit: { workflows: { build: { publish: { remote: false, local: "x" } } } },
+      }),
+      "utf-8",
+    );
+    const { advisories } = runPreflight(makeModules("core"), tmpDir);
+    const ids = advisories.map((f) => f.id);
+    expect(ids).toContain("bkit-build-publish-remote");
+    expect(ids).toContain("bkit-build-publish-invalid");
+  });
+
   it("not-git-repo does NOT fire when --core is not requested", () => {
     // No package.json, no .git, but no --core either — not-git-repo should not fire
     fs.writeFileSync(path.join(tmpDir, "package.json"), '{"name":"test"}', "utf-8");
diff --git a/.bkit/core/engine/checks/before/index.ts b/.bkit/core/engine/checks/before/index.ts
index 0042ba6fa..51d6ef22d 100644
--- a/.bkit/core/engine/checks/before/index.ts
+++ b/.bkit/core/engine/checks/before/index.ts
@@ -22,6 +22,7 @@ import {
   detectNoPackageJson,
   detectNotGitRepo,
   detectInvalidAskSettings,
+  detectBuildPublish,
   detectInvalidTaskCaps,
   detectTaskCapFormStale,
   detectUnmarkedPlans,
@@ -137,6 +138,8 @@ export function runPreflight(
   const invalidTaskCaps = detectInvalidTaskCaps(cwd);
   if (invalidTaskCaps) advisories.push(invalidTaskCaps);
 
+  advisories.push(...detectBuildPublish(cwd));
+
   const taskCapFormStale = detectTaskCapFormStale(cwd);
   if (taskCapFormStale) advisories.push(taskCapFormStale);
 
diff --git a/.bkit/core/engine/checks/before/repo.test.ts b/.bkit/core/engine/checks/before/repo.test.ts
index 283061b09..0e8727a2c 100644
--- a/.bkit/core/engine/checks/before/repo.test.ts
+++ b/.bkit/core/engine/checks/before/repo.test.ts
@@ -9,6 +9,7 @@ import {
   detectMalformedPackageJson,
   detectNotGitRepo,
   detectBkitNotOnPath,
+  detectBuildPublish,
   detectInvalidTaskCaps,
   detectTaskCapFormStale,
   detectUnmarkedPlans,
@@ -203,6 +204,49 @@ describe("detectInvalidTaskCaps", () => {
   });
 });
 
+describe("detectBuildPublish", () => {
+  const pkg = (publish: unknown) =>
+    fs.writeFileSync(
+      path.join(tmpDir, "package.json"),
+      JSON.stringify({ bkit: { workflows: { build: { publish } } } }),
+      "utf-8",
+    );
+  const ids = () => detectBuildPublish(tmpDir).map((f) => f.id);
+
+  it("reports bkit-build-publish-remote for publish.remote false", () => {
+    pkg({ remote: false });
+    const found = detectBuildPublish(tmpDir);
+    expect(found.map((f) => f.id)).toEqual(["bkit-build-publish-remote"]);
+    expect(found[0]).toMatchObject({ severity: "advisory" });
+    expect(found[0]!.detect).toContain("`bkit.workflows.build.publish.remote`");
+  });
+
+  it("reports bkit-build-publish-invalid for a non-boolean publish.local", () => {
+    pkg({ local: "no" });
+    expect(ids()).toEqual(["bkit-build-publish-invalid"]);
+  });
+
+  it("reports bkit-build-publish-invalid for a non-object publish block", () => {
+    pkg(false);
+    expect(ids()).toEqual(["bkit-build-publish-invalid"]);
+  });
+
+  it("stays quiet for a valid or absent build.publish", () => {
+    expect(ids()).toEqual([]);
+    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ bkit: {} }), "utf-8");
+    expect(ids()).toEqual([]);
+    pkg({ remote: true, local: false });
+    expect(ids()).toEqual([]);
+    pkg({});
+    expect(ids()).toEqual([]);
+  });
+
+  it("reports only the remote advisory when remote is false and local is valid", () => {
+    pkg({ remote: false, local: false });
+    expect(ids()).toEqual(["bkit-build-publish-remote"]);
+  });
+});
+
 // ---------------------------------------------------------------------------
 // detectTaskCapFormStale
 // ---------------------------------------------------------------------------
diff --git a/.bkit/core/engine/checks/before/repo.ts b/.bkit/core/engine/checks/before/repo.ts
index d3a8463c5..905ba6fb3 100644
--- a/.bkit/core/engine/checks/before/repo.ts
+++ b/.bkit/core/engine/checks/before/repo.ts
@@ -11,6 +11,7 @@ import {
   ASK_POINTS,
   CONFIG_DEFAULTS,
   invalidAskSettings,
+  invalidBuildPublish,
   invalidTaskCaps,
   limitKey,
   readBkitConfig,
@@ -81,6 +82,45 @@ export function detectInvalidTaskCaps(cwd: string): PreflightFinding | null {
   };
 }
 
+/**
+ * Advisory: `package.json` `bkit.workflows.build.publish` holds a refused or invalid value.
+ * `remote: false` is refused (a cloud run always publishes); a non-object block or a
+ * non-boolean `local` falls back to its default. One finding per key.
+ */
+export function detectBuildPublish(cwd: string): PreflightFinding[] {
+  const workflows = bkitWorkflows(cwd);
+  if (workflows === null) return [];
+  const out: PreflightFinding[] = [];
+  const publish = (workflows.build as { publish?: unknown } | null | undefined)?.publish;
+  if (
+    publish !== null &&
+    typeof publish === "object" &&
+    !Array.isArray(publish) &&
+    (publish as { remote?: unknown }).remote !== undefined &&
+    (publish as { remote?: unknown }).remote !== true
+  ) {
+    out.push({
+      id: "bkit-build-publish-remote",
+      severity: "advisory",
+      detect:
+        "package.json `bkit.workflows.build.publish.remote` is not `true`, so a cloud or CI run still publishes.",
+      action:
+        "Delete `bkit.workflows.build.publish.remote` or set it to `true`; hold a local build with `bkit.workflows.build.publish.local` set to `false`.",
+    });
+  }
+  const bad = invalidBuildPublish(workflows.build);
+  if (bad.length > 0) {
+    out.push({
+      id: "bkit-build-publish-invalid",
+      severity: "advisory",
+      detect: `package.json ${bad.map((k) => `\`bkit.workflows.${k}\``).join(", ")} is not ${bad[0] === "build.publish.local" ? "a boolean" : "an object"}, so the default (publish) is used instead.`,
+      action:
+        "Set `bkit.workflows.build.publish.local` to `true` or `false`, or delete the block to keep the default (`true`).",
+    });
+  }
+  return out;
+}
+
 const TASK_CAP_KEY = /`bkit\.workflows\.tasks\.(\w+)`/g;
 
 /**
diff --git a/.bkit/core/engine/commands/workflow/repo.test.ts b/.bkit/core/engine/commands/workflow/repo.test.ts
index eb68807d6..bbd1cdf93 100644
--- a/.bkit/core/engine/commands/workflow/repo.test.ts
+++ b/.bkit/core/engine/commands/workflow/repo.test.ts
@@ -325,6 +325,20 @@ describe("bkit repo info — where the wired tracker's issues live", () => {
     expect((await run([])).json).toMatchObject({ trackerProgress: null, trackerReview: null });
   });
 
+  it("prints buildPublishRemote and buildPublishLocal", async () => {
+    pkg({ workflows: { build: { publish: { remote: false, local: false } } } });
+    const { json } = await run([]);
+    expect(json.buildPublishRemote).toBe(true);
+    expect(json.buildPublishLocal).toBe(false);
+  });
+
+  it("prints the publish defaults when package.json omits them", async () => {
+    pkg({});
+    const { json } = await run([]);
+    expect(json.buildPublishRemote).toBe(true);
+    expect(json.buildPublishLocal).toBe(true);
+  });
+
   it("prints the plan caps from bkit.workflows.tasks, defaults for a key left unset", async () => {
     pkg({ workflows: { tasks: { maxPerGroup: 4, maxTestsPerTask: 0 } } });
     expect((await run([])).json.tasks).toEqual({
diff --git a/.bkit/core/engine/commands/workflow/repo.ts b/.bkit/core/engine/commands/workflow/repo.ts
index db06d557e..401e32ec1 100644
--- a/.bkit/core/engine/commands/workflow/repo.ts
+++ b/.bkit/core/engine/commands/workflow/repo.ts
@@ -180,6 +180,10 @@ export const repoCommand: CommandSpec = {
           "the state an issue moves to when it is handed to a human: package.json bkit.tracker.<tracker>.review for the wired tracker, at its default when unset (github `In review`, linear `In Review`, jira `In Review`); null under none",
         tasks:
           "{maxPerGroup, maxTestsPerGroup, maxTestsPerTask, maxTestFilesPerTask}: the plan caps from package.json bkit.workflows.tasks, each missing or invalid key at its default",
+        buildPublishRemote:
+          "boolean: the remote build ending from package.json bkit.workflows.build.publish.remote; always true, a false value is refused",
+        buildPublishLocal:
+          "boolean: the local build ending from package.json bkit.workflows.build.publish.local; true publishes, false holds; true when unset or invalid",
       },
       exitCodes: {
         [EXIT_NO_REPO]: "neither gh nor the origin remote named an owner/repo",
@@ -237,6 +241,8 @@ export const repoCommand: CommandSpec = {
           trackerProgress: states?.progress ?? null,
           trackerReview: states?.review ?? null,
           tasks: config.tasks,
+          buildPublishRemote: config.buildPublish.remote,
+          buildPublishLocal: config.buildPublish.local,
         });
         if (branch === null && ctx.flags.allowDetached !== true) {
           ctx.log("HEAD is detached — no current branch");
diff --git a/.bkit/core/engine/shared/settings.test.ts b/.bkit/core/engine/shared/settings.test.ts
index 4d37a255d..875864302 100644
--- a/.bkit/core/engine/shared/settings.test.ts
+++ b/.bkit/core/engine/shared/settings.test.ts
@@ -8,6 +8,7 @@ import {
   ASK_POINTS,
   CONFIG_DEFAULTS,
   invalidAskSettings,
+  invalidBuildPublish,
   invalidTaskCaps,
   readBkitConfig,
 } from "./settings";
@@ -346,6 +347,43 @@ describe("readBkitConfig", () => {
     expect(invalidTaskCaps(undefined)).toEqual([]);
     expect(invalidTaskCaps(7)).toEqual(["tasks"]);
   });
+
+  it("defaults build.publish to true", () => {
+    expect(CONFIG_DEFAULTS.buildPublish).toEqual({ remote: true, local: true });
+    expect(readBkitConfig(root()).buildPublish).toEqual({ remote: true, local: true });
+    expect(readBkitConfig(root(JSON.stringify({ bkit: {} }))).buildPublish).toEqual({
+      remote: true,
+      local: true,
+    });
+  });
+
+  const publish = (value: unknown) =>
+    readBkitConfig(root(JSON.stringify({ bkit: { workflows: { build: { publish: value } } } })))
+      .buildPublish;
+
+  it("reads an explicit publish.local false", () => {
+    expect(publish({ local: false })).toEqual({ remote: true, local: false });
+    expect(publish({ local: "no" })).toEqual({ remote: true, local: true });
+  });
+
+  it("coerces publish.remote false to true", () => {
+    expect(publish({ remote: false, local: false })).toEqual({ remote: true, local: false });
+  });
+
+  it("lists every invalid build.publish key", () => {
+    expect(invalidBuildPublish({ publish: { local: "no", remote: false } })).toEqual([
+      "build.publish.local",
+    ]);
+    expect(invalidBuildPublish({ publish: { local: false, remote: true } })).toEqual([]);
+    expect(invalidBuildPublish(undefined)).toEqual([]);
+    expect(invalidBuildPublish(7)).toEqual(["build"]);
+  });
+
+  it("reports a non-object publish block", () => {
+    expect(publish(false)).toEqual({ remote: true, local: true });
+    expect(invalidBuildPublish({ publish: false })).toEqual(["build.publish"]);
+    expect(invalidBuildPublish({ publish: [1] })).toEqual(["build.publish"]);
+  });
 });
 
 describe("package manager", () => {
diff --git a/.bkit/core/engine/shared/settings.ts b/.bkit/core/engine/shared/settings.ts
index 6ca8540a1..095d969c0 100644
--- a/.bkit/core/engine/shared/settings.ts
+++ b/.bkit/core/engine/shared/settings.ts
@@ -63,6 +63,14 @@ export interface JiraConfig extends TrackerStates {
   project: string | null;
 }
 
+/** `bkit.workflows.build.publish`: whether a build ends by publishing (push, PR) or holds. */
+export interface BuildPublish {
+  /** Always `true`: a non-local runtime always publishes. */
+  remote: true;
+  /** `false` holds a local build: nothing is pushed, the worktree is kept. */
+  local: boolean;
+}
+
 /** `bkit.workflows.tasks`: the plan caps `tests plan-check` and `challenge merge` enforce. */
 export interface TaskCaps {
   /** Tasks in one plan group. */
@@ -135,6 +143,8 @@ export interface BkitConfig {
   asks: Record<AskPoint, AskSetting>;
   /** Plan caps; each key that is not an integer >= 1 takes its default. */
   tasks: TaskCaps;
+  /** Build ending; `remote` is always `true`, `local` defaults `true`. */
+  buildPublish: BuildPublish;
   /** `bkit.dependencies.updater` is `"none"`: silences the missing-dependency-updater advisory. */
   depUpdaterOptOut: boolean;
   /** `bkit.tracker.default` is set, so `none` is a choice; absent or `""` (what install seeds) = undecided. */
@@ -174,6 +184,7 @@ export const CONFIG_DEFAULTS: Readonly<BkitConfig> = {
   },
   // Plan caps, `.bkit/workflows.md` § Test-first.
   tasks: { maxPerGroup: 3, maxTestsPerGroup: 15, maxTestsPerTask: 10, maxTestFilesPerTask: 3 },
+  buildPublish: { remote: true, local: true },
   depUpdaterOptOut: false,
   issueTrackerExplicit: false,
   cloudAgentsExplicit: false,
@@ -209,6 +220,32 @@ export function invalidTaskCaps(raw: unknown): string[] {
   return TASK_CAP_KEYS.filter((k) => set[k] !== undefined && !validCap(set[k]));
 }
 
+/**
+ * The dotted keys of a `bkit.workflows.build` value that fall back to their default:
+ * `build` when set but not an object, `build.publish` when set but not an object,
+ * `build.publish.local` when set but not a boolean. `remote` is never listed: the
+ * preflight advisory `bkit-build-publish-remote` owns it.
+ */
+export function invalidBuildPublish(raw: unknown): string[] {
+  if (raw === undefined) return [];
+  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return ["build"];
+  const publish = (raw as Record<string, unknown>).publish;
+  if (publish === undefined) return [];
+  if (publish === null || typeof publish !== "object" || Array.isArray(publish))
+    return ["build.publish"];
+  const local = (publish as Record<string, unknown>).local;
+  return local !== undefined && typeof local !== "boolean" ? ["build.publish.local"] : [];
+}
+
+/** `bkit.workflows.build.publish`; `remote` always resolves `true`. */
+function buildPublish(raw: unknown): BuildPublish {
+  const { local } = record(raw);
+  return {
+    remote: true,
+    local: typeof local === "boolean" ? local : CONFIG_DEFAULTS.buildPublish.local,
+  };
+}
+
 /** `bkit.workflows.tasks` read key by key; a missing or invalid key takes its default. */
 function taskCaps(raw: unknown): TaskCaps {
   const set = record(raw);
@@ -336,6 +373,7 @@ export function readBkitConfig(root: string): BkitConfig {
     cloudAgents: parseCloudAgents(cloud.agent) ?? CONFIG_DEFAULTS.cloudAgents,
     asks: askSettings(workflows),
     tasks: taskCaps(workflows.tasks),
+    buildPublish: buildPublish(record(workflows.build).publish),
     depUpdaterOptOut: record(bkit.dependencies).updater === "none",
     issueTrackerExplicit: tracker.default !== undefined && tracker.default !== "",
     cloudAgentsExplicit: cloud.agent !== undefined && cloud.agent !== "",
diff --git a/dist/checks/before/index.js b/dist/checks/before/index.js
index 7150f28ef..37ec62320 100644
--- a/dist/checks/before/index.js
+++ b/dist/checks/before/index.js
@@ -13,7 +13,7 @@
 //   parsePlanBlocks       — from commands/workflow/plan-blocks.ts (a plan's group and task blocks)
 import { readInstallingVersion } from "../../shared/package-json.js";
 import { readBkitConfig } from "../../shared/settings.js";
-import { detectBkitNotOnPath, detectMalformedPackageJson, detectNoPackageJson, detectNotGitRepo, detectInvalidAskSettings, detectInvalidTaskCaps, detectTaskCapFormStale, detectUnmarkedPlans, } from "./repo.js";
+import { detectBkitNotOnPath, detectMalformedPackageJson, detectNoPackageJson, detectNotGitRepo, detectInvalidAskSettings, detectBuildPublish, detectInvalidTaskCaps, detectTaskCapFormStale, detectUnmarkedPlans, } from "./repo.js";
 import { MARKERED_TEXT_DRIFT_PATHS, detectGitignoreBlockDuplicates, detectPlaywrightReporterHostile, detectTier2JsonDrift, detectTier2TextDrift, } from "./files.js";
 import { detectBkitVersionMajorDowngrade, detectBkitVersionPinStale } from "./version.js";
 import { detectContextFetchContextMissing, detectContextFetchMissing, detectContextFetchProvisionMissing, detectContextFetchSourceNotEnabled, detectContextFetchUnbounded, } from "./context-fetch.js";
@@ -91,6 +91,7 @@ export function runPreflight(modules, cwd = process.cwd(), installingVersion, is
     const invalidTaskCaps = detectInvalidTaskCaps(cwd);
     if (invalidTaskCaps)
         advisories.push(invalidTaskCaps);
+    advisories.push(...detectBuildPublish(cwd));
     const taskCapFormStale = detectTaskCapFormStale(cwd);
     if (taskCapFormStale)
         advisories.push(taskCapFormStale);
diff --git a/dist/checks/before/repo.js b/dist/checks/before/repo.js
index c814e6b57..219f3c33b 100644
--- a/dist/checks/before/repo.js
+++ b/dist/checks/before/repo.js
@@ -5,7 +5,7 @@ import * as path from "node:path";
 import { spawnSync } from "node:child_process";
 import { parsePlanBlocks } from "../../commands/workflow/plan-blocks.js";
 import { parseJson, readJsonFile } from "../../shared/json.js";
-import { ASK_POINTS, CONFIG_DEFAULTS, invalidAskSettings, invalidTaskCaps, limitKey, readBkitConfig, } from "../../shared/settings.js";
+import { ASK_POINTS, CONFIG_DEFAULTS, invalidAskSettings, invalidBuildPublish, invalidTaskCaps, limitKey, readBkitConfig, } from "../../shared/settings.js";
 import { isCloudOrCi } from "./env.js";
 // ---------------------------------------------------------------------------
 // Blocker detectors
@@ -68,6 +68,40 @@ export function detectInvalidTaskCaps(cwd) {
             .join(", ")}.`,
     };
 }
+/**
+ * Advisory: `package.json` `bkit.workflows.build.publish` holds a refused or invalid value.
+ * `remote: false` is refused (a cloud run always publishes); a non-object block or a
+ * non-boolean `local` falls back to its default. One finding per key.
+ */
+export function detectBuildPublish(cwd) {
+    const workflows = bkitWorkflows(cwd);
+    if (workflows === null)
+        return [];
+    const out = [];
+    const publish = workflows.build?.publish;
+    if (publish !== null &&
+        typeof publish === "object" &&
+        !Array.isArray(publish) &&
+        publish.remote !== undefined &&
+        publish.remote !== true) {
+        out.push({
+            id: "bkit-build-publish-remote",
+            severity: "advisory",
+            detect: "package.json `bkit.workflows.build.publish.remote` is not `true`, so a cloud or CI run still publishes.",
+            action: "Delete `bkit.workflows.build.publish.remote` or set it to `true`; hold a local build with `bkit.workflows.build.publish.local` set to `false`.",
+        });
+    }
+    const bad = invalidBuildPublish(workflows.build);
+    if (bad.length > 0) {
+        out.push({
+            id: "bkit-build-publish-invalid",
+            severity: "advisory",
+            detect: `package.json ${bad.map((k) => `\`bkit.workflows.${k}\``).join(", ")} is not ${bad[0] === "build.publish.local" ? "a boolean" : "an object"}, so the default (publish) is used instead.`,
+            action: "Set `bkit.workflows.build.publish.local` to `true` or `false`, or delete the block to keep the default (`true`).",
+        });
+    }
+    return out;
+}
 const TASK_CAP_KEY = /`bkit\.workflows\.tasks\.(\w+)`/g;
 /**
  * Each `bkit.workflows.tasks.<key>` the text names with a `(default N)` after it, on the same
diff --git a/dist/commands/workflow/repo.js b/dist/commands/workflow/repo.js
index 3e8050374..d1d4621c1 100644
--- a/dist/commands/workflow/repo.js
+++ b/dist/commands/workflow/repo.js
@@ -154,6 +154,8 @@ export const repoCommand = {
                 trackerProgress: "the state an issue moves to when work starts: package.json bkit.tracker.<tracker>.progress for the wired tracker, at its default when unset (github `In progress`, linear `started`, jira `In Progress`); null under none",
                 trackerReview: "the state an issue moves to when it is handed to a human: package.json bkit.tracker.<tracker>.review for the wired tracker, at its default when unset (github `In review`, linear `In Review`, jira `In Review`); null under none",
                 tasks: "{maxPerGroup, maxTestsPerGroup, maxTestsPerTask, maxTestFilesPerTask}: the plan caps from package.json bkit.workflows.tasks, each missing or invalid key at its default",
+                buildPublishRemote: "boolean: the remote build ending from package.json bkit.workflows.build.publish.remote; always true, a false value is refused",
+                buildPublishLocal: "boolean: the local build ending from package.json bkit.workflows.build.publish.local; true publishes, false holds; true when unset or invalid",
             },
             exitCodes: {
                 [EXIT_NO_REPO]: "neither gh nor the origin remote named an owner/repo",
@@ -207,6 +209,8 @@ export const repoCommand = {
                     trackerProgress: states?.progress ?? null,
                     trackerReview: states?.review ?? null,
                     tasks: config.tasks,
+                    buildPublishRemote: config.buildPublish.remote,
+                    buildPublishLocal: config.buildPublish.local,
                 });
                 if (branch === null && ctx.flags.allowDetached !== true) {
                     ctx.log("HEAD is detached — no current branch");
diff --git a/dist/shared/settings.js b/dist/shared/settings.js
index e23512d7d..ab2cbba0a 100644
--- a/dist/shared/settings.js
+++ b/dist/shared/settings.js
@@ -56,6 +56,7 @@ export const CONFIG_DEFAULTS = {
     },
     // Plan caps, `.bkit/workflows.md` § Test-first.
     tasks: { maxPerGroup: 3, maxTestsPerGroup: 15, maxTestsPerTask: 10, maxTestFilesPerTask: 3 },
+    buildPublish: { remote: true, local: true },
     depUpdaterOptOut: false,
     issueTrackerExplicit: false,
     cloudAgentsExplicit: false,
@@ -84,6 +85,33 @@ export function invalidTaskCaps(raw) {
     const set = raw;
     return TASK_CAP_KEYS.filter((k) => set[k] !== undefined && !validCap(set[k]));
 }
+/**
+ * The dotted keys of a `bkit.workflows.build` value that fall back to their default:
+ * `build` when set but not an object, `build.publish` when set but not an object,
+ * `build.publish.local` when set but not a boolean. `remote` is never listed: the
+ * preflight advisory `bkit-build-publish-remote` owns it.
+ */
+export function invalidBuildPublish(raw) {
+    if (raw === undefined)
+        return [];
+    if (raw === null || typeof raw !== "object" || Array.isArray(raw))
+        return ["build"];
+    const publish = raw.publish;
+    if (publish === undefined)
+        return [];
+    if (publish === null || typeof publish !== "object" || Array.isArray(publish))
+        return ["build.publish"];
+    const local = publish.local;
+    return local !== undefined && typeof local !== "boolean" ? ["build.publish.local"] : [];
+}
+/** `bkit.workflows.build.publish`; `remote` always resolves `true`. */
+function buildPublish(raw) {
+    const { local } = record(raw);
+    return {
+        remote: true,
+        local: typeof local === "boolean" ? local : CONFIG_DEFAULTS.buildPublish.local,
+    };
+}
 /** `bkit.workflows.tasks` read key by key; a missing or invalid key takes its default. */
 function taskCaps(raw) {
     const set = record(raw);
@@ -205,6 +233,7 @@ export function readBkitConfig(root) {
         cloudAgents: parseCloudAgents(cloud.agent) ?? CONFIG_DEFAULTS.cloudAgents,
         asks: askSettings(workflows),
         tasks: taskCaps(workflows.tasks),
+        buildPublish: buildPublish(record(workflows.build).publish),
         depUpdaterOptOut: record(bkit.dependencies).updater === "none",
         issueTrackerExplicit: tracker.default !== undefined && tracker.default !== "",
         cloudAgentsExplicit: cloud.agent !== undefined && cloud.agent !== "",
