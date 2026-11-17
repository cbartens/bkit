diff --git a/.bkit/.env.example b/.bkit/.env.example
index dabc15a77..d4dfea112 100644
--- a/.bkit/.env.example
+++ b/.bkit/.env.example
@@ -85,6 +85,11 @@ BKIT_JIRA_API_KEY=
 # Generate at: https://console.anthropic.com/settings/keys
 BKIT_ANTHROPIC_API_KEY=
 
+# BKIT_OPENAI_API_KEY — OpenAI API key for the Codex cloud router job.
+# Add the same name as a repo Actions secret when using `bkit install --auto=codex`.
+# Generate at: https://platform.openai.com/api-keys
+BKIT_OPENAI_API_KEY=
+
 # BKIT_CURSOR_API_KEY — Cursor API key. Only needed if you dispatch Cursor cloud
 # agents from this shell (programmatic POST /v0/agents, model catalog queries
 # via `curl https://api.cursor.com/v0/models -u "$BKIT_CURSOR_API_KEY:"`). The
diff --git a/.bkit/cli.md b/.bkit/cli.md
index 5494f981d..6cdd59b6c 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -57,10 +57,10 @@ First install, upgrade and uninstall: `.bkit/install.md`. Upgrade prompt to past
 <!-- prettier-ignore -->
 | Command | Flags | What it does |
 | --- | --- | --- |
-| `bkit install` | `--claude` `--codex` `--antigravity` `--cursor` `--opencode=<provider>` `--auto=<claude\|cursor\|opencode>` `--tracker=<name>` `--auto-revert` | Install or re-sync the named modules plus the core files. |
+| `bkit install` | `--claude` `--codex` `--antigravity` `--cursor` `--opencode=<provider>` `--auto=<claude\|cursor\|opencode\|codex>` `--tracker=<name>` `--auto-revert` | Install or re-sync the named modules plus the core files. |
 | `bkit check` | — | Drift gate: exit 1 when a managed file needs re-rendering. The CI gate. |
 | `bkit upgrade` | `--to=<version>` `--latest` `--auto-apply` `--dry-run` | Re-render everything installed; --to / --latest bump @cbartens/bkit first. |
-| `bkit uninstall` | `--claude` `--codex` `--antigravity` `--cursor` `--opencode=<provider>` `--auto=<claude\|cursor\|opencode>` `--dry-run` `--force` `--nuke` `--yes` | Remove bkit-managed files and strip managed blocks; no flags = everything. |
+| `bkit uninstall` | `--claude` `--codex` `--antigravity` `--cursor` `--opencode=<provider>` `--auto=<claude\|cursor\|opencode\|codex>` `--dry-run` `--force` `--nuke` `--yes` | Remove bkit-managed files and strip managed blocks; no flags = everything. |
 | `bkit doctor` | — | Preflight and advisory replay; rewrites .bkit/advisories.md only. Exits 0. |
 | `bkit tips` | `--workflow=<name>` `--all` | What this repo has not set up yet, most useful first. Exits 0. |
 | `bkit status` | — | Current host and provider. Writes nothing. Exits 0. |
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 030adbeca..c121af924 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -57,10 +57,10 @@ First install, upgrade and uninstall: `.bkit/install.md`. Upgrade prompt to past
 <!-- prettier-ignore -->
 | Command | Flags | What it does |
 | --- | --- | --- |
-| `bkit install` | `--claude` `--codex` `--antigravity` `--cursor` `--opencode=<provider>` `--auto=<claude\|cursor\|opencode>` `--tracker=<name>` `--auto-revert` | Install or re-sync the named modules plus the core files. |
+| `bkit install` | `--claude` `--codex` `--antigravity` `--cursor` `--opencode=<provider>` `--auto=<claude\|cursor\|opencode\|codex>` `--tracker=<name>` `--auto-revert` | Install or re-sync the named modules plus the core files. |
 | `bkit check` | — | Drift gate: exit 1 when a managed file needs re-rendering. The CI gate. |
 | `bkit upgrade` | `--to=<version>` `--latest` `--auto-apply` `--dry-run` | Re-render everything installed; --to / --latest bump @cbartens/bkit first. |
-| `bkit uninstall` | `--claude` `--codex` `--antigravity` `--cursor` `--opencode=<provider>` `--auto=<claude\|cursor\|opencode>` `--dry-run` `--force` `--nuke` `--yes` | Remove bkit-managed files and strip managed blocks; no flags = everything. |
+| `bkit uninstall` | `--claude` `--codex` `--antigravity` `--cursor` `--opencode=<provider>` `--auto=<claude\|cursor\|opencode\|codex>` `--dry-run` `--force` `--nuke` `--yes` | Remove bkit-managed files and strip managed blocks; no flags = everything. |
 | `bkit doctor` | — | Preflight and advisory replay; rewrites .bkit/advisories.md only. Exits 0. |
 | `bkit tips` | `--workflow=<name>` `--all` | What this repo has not set up yet, most useful first. Exits 0. |
 | `bkit status` | — | Current host and provider. Writes nothing. Exits 0. |
diff --git a/.bkit/core/engine/audits/templates/templates-content.test.ts b/.bkit/core/engine/audits/templates/templates-content.test.ts
index cb5d106ef..c579ea9ef 100644
--- a/.bkit/core/engine/audits/templates/templates-content.test.ts
+++ b/.bkit/core/engine/audits/templates/templates-content.test.ts
@@ -653,6 +653,7 @@ describe(".bkit/.env.example keys are BKIT_-prefixed (direnv isolation)", () =>
       "BKIT_LINEAR_API_KEY",
       "BKIT_JIRA_API_KEY",
       "BKIT_ANTHROPIC_API_KEY",
+      "BKIT_OPENAI_API_KEY",
       "BKIT_CURSOR_API_KEY",
       "BKIT_OPENCODE_API_KEY",
       "BKIT_OPENROUTER_API_KEY",
@@ -664,6 +665,7 @@ describe(".bkit/.env.example keys are BKIT_-prefixed (direnv isolation)", () =>
     expect(assigned).not.toContain("LINEAR_API_KEY");
     expect(assigned).not.toContain("JIRA_API_TOKEN");
     expect(assigned).not.toContain("ANTHROPIC_API_KEY");
+    expect(assigned).not.toContain("OPENAI_API_KEY");
     expect(assigned).not.toContain("OPENCODE_API_KEY");
   });
 });
diff --git a/.bkit/core/engine/cli.test.ts b/.bkit/core/engine/cli.test.ts
index 4ddeafa3b..767022455 100644
--- a/.bkit/core/engine/cli.test.ts
+++ b/.bkit/core/engine/cli.test.ts
@@ -119,6 +119,21 @@ describe("parseArgs — module flags", () => {
     expect(result.cloudVariant).toBe("cursor");
   });
 
+  it("--auto=codex parses to the codex cloud variant", () => {
+    const result = parseArgs(["install", "--auto=codex"]);
+    expect([...result.modules].sort()).toEqual(["cloud", "core"]);
+    expect(result.cloudVariant).toBe("codex");
+    expect(result.moduleFlags.has("cloud")).toBe(true);
+  });
+
+  it("--auto=<bad> lists claude, cursor, opencode and codex", () => {
+    const msg = expectExit(() => parseArgs(["install", "--auto=banana"]));
+    expect(msg).toMatch(/Unknown cloud variant/);
+    for (const variant of ["claude", "cursor", "opencode", "codex"]) {
+      expect(msg).toContain(variant);
+    }
+  });
+
   it("bare --auto (install) → error (variant required)", () => {
     const msg = expectExit(() => parseArgs(["install", "--auto"]));
     expect(msg).toMatch(/--auto requires an explicit variant/);
diff --git a/.bkit/core/engine/cli.ts b/.bkit/core/engine/cli.ts
index efc8b9741..118830f28 100644
--- a/.bkit/core/engine/cli.ts
+++ b/.bkit/core/engine/cli.ts
@@ -24,7 +24,7 @@ export type ModuleFlag =
   "core" | "claude" | "cursor" | "opencode" | "codex" | "antigravity" | "cloud";
 
 /** Cloud-agent variant chosen via `--auto=<variant>`. */
-export const CLOUD_VARIANTS = ["claude", "cursor", "opencode"] as const;
+export const CLOUD_VARIANTS = ["claude", "cursor", "opencode", "codex"] as const;
 export type CloudVariant = (typeof CLOUD_VARIANTS)[number];
 
 /** Narrow an unknown string to `CloudVariant` or return `null` if invalid. */
@@ -589,7 +589,7 @@ export const CLASSIC_VERB_HELP: readonly ClassicVerbHelp[] = [
       "--antigravity",
       "--cursor",
       "--opencode=<provider>",
-      "--auto=<claude|cursor|opencode>",
+      "--auto=<claude|cursor|opencode|codex>",
       "--tracker=<name>",
       "--auto-revert",
     ],
@@ -645,7 +645,7 @@ export const CLASSIC_VERB_HELP: readonly ClassicVerbHelp[] = [
       "--antigravity",
       "--cursor",
       "--opencode=<provider>",
-      "--auto=<claude|cursor|opencode>",
+      "--auto=<claude|cursor|opencode|codex>",
       "--dry-run",
       "--force",
       "--nuke",
@@ -851,14 +851,14 @@ Dependency updaters (copy an example and own it):
   blocks when that value and the configs disagree.
   All templates and install steps: .bkit/templates.md
 
-  --auto=<claude|cursor|opencode>
-                  Cloud-agent (auto-dispatch) integration (opt-in). --auto=claude needs
-                  tracker=github + the ANTHROPIC_API_KEY repo secret (or the
-                  ANTHROPIC_FEDERATION_RULE_ID + ANTHROPIC_ORGANIZATION_ID repo variables
-                  for keyless federation) + the Claude GitHub App; --auto=cursor
-                  needs tracker=linear; --auto=opencode needs tracker=github + a remote
-                  opencode provider (OPENCODE_PROVIDER_KEY). Bare --auto is accepted on
-                  uninstall only.
+  --auto=<claude|cursor|opencode|codex>
+                  Cloud-agent (auto-dispatch) integration (opt-in). Every variant needs
+                  a wired tracker (github, linear or jira). Claude needs the
+                  BKIT_ANTHROPIC_API_KEY repo secret or the ANTHROPIC_FEDERATION_RULE_ID
+                  + ANTHROPIC_ORGANIZATION_ID repo variables, plus the Claude GitHub App.
+                  Codex needs --codex and BKIT_OPENAI_API_KEY. OpenCode needs --opencode
+                  and its configured provider's BKIT_ key. Cursor uses its dashboard
+                  triggers. Bare --auto is accepted on uninstall only.
 
 Cross-cutting / modifiers:
   --tracker=<name>      Wire issue tracker integration. Values: github, linear, jira, none
@@ -966,7 +966,7 @@ export function validateModuleFlagsForVerb(
 // The CLI entrypoint, run only when this file is executed and driven by real
 // argv/fs/process.exit side effects; install.integration.test.ts exercises it through
 // spawned processes. Pure decision logic lives in exported functions
-// (validateModuleFlagsForVerb above, validateCloudTrackerMatch in commands/install/install.ts)
+// (validateModuleFlagsForVerb above, validateCloudTrackerWired in commands/install/install.ts)
 // for unit coverage.
 export async function main() {
   const commandExit = await runCommand(process.argv.slice(2), COMMANDS, {
diff --git a/.bkit/core/engine/commands/install/install.integration.test.ts b/.bkit/core/engine/commands/install/install.integration.test.ts
index df9f0a4dc..917816a9c 100644
--- a/.bkit/core/engine/commands/install/install.integration.test.ts
+++ b/.bkit/core/engine/commands/install/install.integration.test.ts
@@ -829,93 +829,83 @@ describe("MCP config — fresh install and a consumer's own file", () => {
 });
 
 // ---------------------------------------------------------------------------
-// Constraint-before-write: the cloud/tracker constraint check runs BEFORE the
-// package.json write, so a hard error writes no state.
-//
-// Invariant:
-//   (a) `bkit install --tracker=github --auto=cursor` exits non-zero.
-//   (b) package.json is NOT mutated (issueTracker NOT written on mismatch).
-// Jira is local-only, so every cloud lane refuses `--tracker=jira` the same way.
+// Cloud opt-in validation runs before writes; any wired tracker is supported.
 // ---------------------------------------------------------------------------
 
-describe("Challenge Finding 3 — cloud/tracker constraint-before-write regression", () => {
+describe("cloud variants — wired trackers and host prerequisites", () => {
   const getInstallPath = () =>
     path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../cli.ts");
-  // [tracker, cloud lane, the tracker that lane requires]
-  const MISMATCHES = [
-    ["github", "cursor", "linear"],
-    ["jira", "claude", "github"],
-    ["jira", "cursor", "linear"],
-    ["jira", "opencode", "github"],
-  ] as const;
-
-  it.each(MISMATCHES)(
-    "--tracker=%s --auto=%s exits non-zero (constraint mismatch)",
-    (tracker, cloud, required) => {
-      // Finding 3 (a): the mismatch must be a hard error — exit 1 every time.
-
-      const initialPkg = { name: "constraint-test", version: "0.0.0" };
-      fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify(initialPkg), "utf-8");
-      fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
-
-      const result = spawnSync(
-        requireTsx(),
-        [getInstallPath(), "install", `--tracker=${tracker}`, `--auto=${cloud}`],
-        {
-          cwd: tmpDir,
-          encoding: "utf-8",
-          env: { ...process.env, NODE_NO_WARNINGS: "1" },
-          timeout: 30_000,
-        },
-      );
 
-      // Must exit non-zero (the constraint hard-error path).
-      expect(
-        result.status,
-        `Expected non-zero exit for tracker/cloud mismatch.\n` +
-          `stdout: ${result.stdout}\nstderr: ${result.stderr}`,
-      ).not.toBe(0);
+  function runCloudInstall(args: string[]) {
+    return spawnSync(requireTsx(), [getInstallPath(), "install", ...args], {
+      cwd: tmpDir,
+      encoding: "utf-8",
+      env: { ...process.env, NODE_NO_WARNINGS: "1" },
+      timeout: 60_000,
+    });
+  }
 
-      // Error output must mention the mismatch.
-      const combined = combinedOutput(result);
-      expect(combined).toContain(`--auto=${cloud} requires tracker=${required}`);
-    },
-  );
+  function seedConsumer() {
+    const initialPkg = JSON.stringify({ name: "cloud-test", version: "0.0.0" });
+    fs.writeFileSync(path.join(tmpDir, "package.json"), initialPkg, "utf-8");
+    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
+    return initialPkg;
+  }
 
-  it.each(MISMATCHES)(
-    "--tracker=%s --auto=%s does NOT write bkit.tracker.default to package.json (no partial write)",
-    (tracker, cloud) => {
-      // Finding 3 (b): the "no state written on hard error" invariant.
-      // The pre-remediation code wrote issueTracker BEFORE the constraint check,
-      // meaning package.json was mutated even on a failed install.
+  function installedFacts() {
+    return JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
+      bkit?: {
+        tracker?: { default?: string };
+        cloud?: { agent?: string };
+        providers?: { opencode?: { default?: string } };
+      };
+    };
+  }
 
-      const initialPkg = { name: "constraint-test", version: "0.0.0" };
-      const initialPkgJson = JSON.stringify(initialPkg);
-      fs.writeFileSync(path.join(tmpDir, "package.json"), initialPkgJson, "utf-8");
-      fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
+  it("--auto=codex without .codex/ exits 1 naming --codex and writes nothing", () => {
+    const initialPkg = seedConsumer();
+    const before = fs.readdirSync(tmpDir).sort();
+    const result = runCloudInstall(["--tracker=github", "--auto=codex"]);
+    expect(result.status, combinedOutput(result)).toBe(1);
+    expect(combinedOutput(result)).toContain("--codex");
+    expect(combinedOutput(result)).not.toContain("Unknown cloud variant");
+    expect(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")).toBe(initialPkg);
+    expect(fs.readdirSync(tmpDir).sort()).toEqual(before);
+  });
 
-      spawnSync(
-        requireTsx(),
-        [getInstallPath(), "install", `--tracker=${tracker}`, `--auto=${cloud}`],
-        {
-          cwd: tmpDir,
-          encoding: "utf-8",
-          env: { ...process.env, NODE_NO_WARNINGS: "1" },
-          timeout: 30_000,
-        },
-      );
+  it("--tracker=jira --codex --auto=codex exits 0 and records codex", () => {
+    seedConsumer();
+    const result = runCloudInstall(["--tracker=jira", "--codex", "--auto=codex"]);
+    expect(result.status, combinedOutput(result)).toBe(0);
+    const facts = installedFacts();
+    expect(facts.bkit?.tracker?.default).toBe("jira");
+    expect(facts.bkit?.cloud?.agent).toBe("codex");
+    expect(fs.existsSync(path.join(tmpDir, ".codex", "hooks.json"))).toBe(true);
+  });
 
-      // package.json must NOT have bkit.tracker.default set (no partial write).
-      const afterPkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
-        bkit?: { tracker?: { default?: string } };
-      };
+  it("--tracker=github --auto=cursor exits 0 and records cursor", () => {
+    seedConsumer();
+    const result = runCloudInstall(["--tracker=github", "--auto=cursor"]);
+    expect(result.status, combinedOutput(result)).toBe(0);
+    const facts = installedFacts();
+    expect(facts.bkit?.tracker?.default).toBe("github");
+    expect(facts.bkit?.cloud?.agent).toBe("cursor");
+  });
 
-      expect(
-        afterPkg.bkit?.tracker?.default,
-        "bkit.tracker.default must NOT be written when the install exits due to a cloud/tracker constraint mismatch",
-      ).toBeUndefined();
-    },
-  );
+  it("--tracker=github --opencode --auto=opencode in one run exits 0 and records opencode", () => {
+    seedConsumer();
+    const result = runCloudInstall([
+      "--tracker=github",
+      "--opencode=openrouter",
+      "--auto=opencode",
+    ]);
+    expect(result.status, combinedOutput(result)).toBe(0);
+    const facts = installedFacts();
+    expect(facts.bkit?.tracker?.default).toBe("github");
+    expect(facts.bkit?.cloud?.agent).toBe("opencode");
+    expect(facts.bkit?.providers?.opencode?.default).toBe("openrouter");
+    expect(fs.existsSync(path.join(tmpDir, ".opencode", "opencode.json"))).toBe(true);
+  });
 
   it("--tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair)", () => {
     // Complementary positive case: the matching pair must succeed and persist state.
diff --git a/.bkit/core/engine/commands/install/install.test.ts b/.bkit/core/engine/commands/install/install.test.ts
index 78cf75e88..09df646d8 100644
--- a/.bkit/core/engine/commands/install/install.test.ts
+++ b/.bkit/core/engine/commands/install/install.test.ts
@@ -8,11 +8,10 @@ import {
   detectOpencodeProvider,
   detectOpencodeProviders,
   modulesToCliFlags,
-  validateCloudTrackerMatch,
+  validateCloudTrackerWired,
   refreshPreflightAfterWrites,
 } from "./install";
 import type { ModuleFlag } from "../../cli";
-import type { IssueTracker } from "../../install/manifest";
 
 // ---------------------------------------------------------------------------
 // Staging scratch area
@@ -88,53 +87,33 @@ describe("modulesToCliFlags — resolved module set → recovery-hint CLI flags"
   });
 });
 
-describe("validateCloudTrackerMatch — FINAL SCOPE decision 3/4 symmetric cloud/tracker constraint", () => {
+describe("validateCloudTrackerWired — every cloud variant needs a wired tracker", () => {
   it("passes when no cloud variant is set", () => {
-    expect(validateCloudTrackerMatch(null, true, "github")).toBeNull();
+    expect(validateCloudTrackerWired(null, true, "github")).toBeNull();
   });
 
   it("passes when the cloud module isn't in the install set, even with a variant", () => {
-    expect(validateCloudTrackerMatch("claude", false, "linear")).toBeNull();
+    expect(validateCloudTrackerWired("claude", false, "linear")).toBeNull();
   });
 
-  it("passes when cloud=claude and tracker=github (matching)", () => {
-    expect(validateCloudTrackerMatch("claude", true, "github")).toBeNull();
+  it("validateCloudTrackerWired passes %s with %s", () => {
+    for (const cloud of ["claude", "cursor", "opencode", "codex"] as const) {
+      for (const tracker of ["github", "linear", "jira"] as const) {
+        expect(validateCloudTrackerWired(cloud, true, tracker), `${cloud}/${tracker}`).toBeNull();
+      }
+    }
   });
 
-  it("passes when cloud=opencode and tracker=github (matching)", () => {
-    expect(validateCloudTrackerMatch("opencode", true, "github")).toBeNull();
+  it("validateCloudTrackerWired refuses tracker none naming --tracker=", () => {
+    for (const cloud of ["claude", "cursor", "opencode", "codex"] as const) {
+      const err = validateCloudTrackerWired(cloud, true, "none");
+      expect(err).not.toBeNull();
+      expect(err).toContain(`--auto=${cloud}`);
+      expect(err).toContain("needs a wired tracker");
+      expect(err).toContain("--tracker=<github|linear|jira>");
+      expect(err).not.toContain("requires tracker=");
+    }
   });
-
-  it("passes when cloud=cursor and tracker=linear (matching)", () => {
-    expect(validateCloudTrackerMatch("cursor", true, "linear")).toBeNull();
-  });
-
-  // Jira is local-only: every cloud lane refuses it.
-  it.each([
-    ["claude", "linear", "github"],
-    ["claude", "jira", "github"],
-    ["opencode", "linear", "github"],
-    ["opencode", "jira", "github"],
-    ["cursor", "github", "linear"],
-    ["cursor", "jira", "linear"],
-  ] as const)("errors when cloud=%s and tracker=%s (requires %s)", (cloud, tracker, required) => {
-    const err = validateCloudTrackerMatch(cloud, true, tracker);
-    expect(err).not.toBeNull();
-    expect(err).toContain(`--auto=${cloud} requires tracker=${required}`);
-  });
-
-  it("suggests setting the tracker (not switching) when the tracker is still 'none' (default)", () => {
-    const err = validateCloudTrackerMatch("cursor", true, "none" as IssueTracker);
-    expect(err).toContain("Set the tracker first");
-  });
-
-  it.each(["linear", "jira"] as const)(
-    "suggests re-running with the matching tracker when %s is already set",
-    (tracker) => {
-      const err = validateCloudTrackerMatch("claude", true, tracker);
-      expect(err).toContain("tracker switching is free");
-    },
-  );
 });
 
 describe("detectOpencodeProvider — provider resolution (manifest-first)", () => {
diff --git a/.bkit/core/engine/commands/install/install.ts b/.bkit/core/engine/commands/install/install.ts
index b3f5df3ed..20ad86599 100644
--- a/.bkit/core/engine/commands/install/install.ts
+++ b/.bkit/core/engine/commands/install/install.ts
@@ -7,11 +7,7 @@ import { OPENCODE_PROVIDERS } from "../../shared/egress.js";
 import { type ModuleFlag, type CloudVariant } from "../../cli.js";
 import { readInstallingVersion } from "../../shared/package-json.js";
 import { type ModuleContext, dispatchModules } from "../../install/modules/index.js";
-import {
-  type IssueTracker,
-  DEFAULT_ISSUE_TRACKER,
-  type ModuleName,
-} from "../../install/manifest.js";
+import { type IssueTracker, type ModuleName } from "../../install/manifest.js";
 import { parseJson, readJsonFile } from "../../shared/json.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { LOG_PREFIX, setLogPrefix } from "../../shared/log-prefix.js";
@@ -113,27 +109,18 @@ export function modulesToCliFlags(
 }
 
 /**
- * Symmetric cloud/tracker constraint (FINAL SCOPE decision 3/4): cloud=claude and
- * cloud=opencode both require tracker=github (both use the bkit-cloud.yml template);
- * cloud=cursor requires tracker=linear. Mismatch is a hard error — checked BEFORE
- * any package.json write so no state is recorded on mismatch ("no files written
- * on hard error" invariant). Returns the error message to print, or `null` when
- * the tracker matches (or no cloud module/variant is in play).
+ * Cloud automation needs a wired tracker. Returns the pre-write error message,
+ * or null when a tracker is wired or no cloud module/variant is being installed.
  */
-export function validateCloudTrackerMatch(
+export function validateCloudTrackerWired(
   cloudVariant: CloudVariant | null,
   hasCloudModule: boolean,
   issueTracker: IssueTracker,
 ): string | null {
-  if (cloudVariant === null || !hasCloudModule) return null;
-  const requiredTracker: IssueTracker = cloudVariant === "cursor" ? "linear" : "github";
-  if (issueTracker === requiredTracker) return null;
+  if (cloudVariant === null || !hasCloudModule || issueTracker !== "none") return null;
   return (
-    `[bkit] --auto=${cloudVariant} requires tracker=${requiredTracker}, ` +
-    `but the resolved tracker is "${issueTracker}". ` +
-    (issueTracker === DEFAULT_ISSUE_TRACKER || issueTracker === "none"
-      ? `Set the tracker first: bkit install --tracker=${requiredTracker} --auto=${cloudVariant}`
-      : `Re-run with the matching tracker: bkit install --tracker=${requiredTracker} --auto=${cloudVariant} (tracker switching is free).`)
+    `[bkit] --auto=${cloudVariant} needs a wired tracker: ` +
+    `bkit install --tracker=<github|linear|jira> --auto=${cloudVariant}`
   );
 }
 
@@ -387,10 +374,8 @@ export async function runInstall(
 
   const postDispatch: Array<() => void> = [];
 
-  // Symmetric cloud/tracker constraint (FINAL SCOPE decision 3/4) — see
-  // validateCloudTrackerMatch for the full rationale. Checked BEFORE any
-  // package.json write so no state is recorded on mismatch.
-  const cloudTrackerError = validateCloudTrackerMatch(
+  // Reject missing tracker wiring before any package.json write.
+  const cloudTrackerError = validateCloudTrackerWired(
     cloudVariant,
     modules.has("cloud"),
     issueTracker,
@@ -402,7 +387,11 @@ export async function runInstall(
   if (cloudVariant !== null && modules.has("cloud")) {
     // auto=opencode additionally requires the local opencode host to be installed first
     // (the cloud job runs against the committed .opencode/ — no model is hard-coded in YAML).
-    if (cloudVariant === "opencode" && !fs.existsSync(path.join(process.cwd(), ".opencode"))) {
+    if (
+      cloudVariant === "opencode" &&
+      !modules.has("opencode") &&
+      !fs.existsSync(path.join(process.cwd(), ".opencode"))
+    ) {
       console.error(
         `[bkit] --auto=opencode requires the local opencode host to be installed first.\n` +
           `Run: bkit install --opencode=<provider>  (e.g. --opencode=opencode-zen)\n` +
@@ -410,6 +399,14 @@ export async function runInstall(
       );
       process.exit(1);
     }
+    if (
+      cloudVariant === "codex" &&
+      !modules.has("codex") &&
+      !fs.existsSync(path.join(process.cwd(), ".codex"))
+    ) {
+      console.error(`[bkit] --auto=codex requires the local Codex host. Run: bkit install --codex`);
+      process.exit(1);
+    }
   }
 
   // Persist bkit manifest fields to consumer package.json AFTER all hard-error gates pass.
diff --git a/.bkit/core/engine/install/manifest.test.ts b/.bkit/core/engine/install/manifest.test.ts
index 961e436a0..3c209a947 100644
--- a/.bkit/core/engine/install/manifest.test.ts
+++ b/.bkit/core/engine/install/manifest.test.ts
@@ -106,6 +106,10 @@ describe("parseCloudAgents — value space and back-compat", () => {
     expect(parseCloudAgents("opencode")).toBe("opencode");
   });
 
+  it("parseCloudAgents accepts codex", () => {
+    expect(parseCloudAgents("codex")).toBe("codex");
+  });
+
   it("parses 'none' → 'none'", () => {
     expect(parseCloudAgents("none")).toBe("none");
   });
diff --git a/.bkit/core/engine/install/manifest.ts b/.bkit/core/engine/install/manifest.ts
index fce484f44..98a6a1fd4 100644
--- a/.bkit/core/engine/install/manifest.ts
+++ b/.bkit/core/engine/install/manifest.ts
@@ -101,7 +101,7 @@ export function parseIssueTracker(value: unknown): IssueTracker | null {
  *
  * Single self-describing field (mirrors `bkit.tracker.default`).
  */
-export const CLOUD_MODES = ["claude", "cursor", "opencode", "none"] as const;
+export const CLOUD_MODES = ["claude", "cursor", "opencode", "codex", "none"] as const;
 export type CloudAgents = (typeof CLOUD_MODES)[number];
 
 /** Default when consumer manifest has no `bkit.cloud.agent` field (undecided). */
diff --git a/.bkit/core/engine/install/modules/cloud.integration.test.ts b/.bkit/core/engine/install/modules/cloud.integration.test.ts
index d5718514f..afcd8e55b 100644
--- a/.bkit/core/engine/install/modules/cloud.integration.test.ts
+++ b/.bkit/core/engine/install/modules/cloud.integration.test.ts
@@ -67,9 +67,9 @@ describe("runCloudModule — opt-in cloud agents (post-CI auto-routing)", () =>
   const dockerRel = path.join(".cursor", "Dockerfile");
   const envRel = path.join(".cursor", "environment.json");
 
-  it("cloud=claude: writes no files and points the setup advisory at the workflow template", () => {
+  it("claude variant advisory names BKIT_ANTHROPIC_API_KEY or the federation variables", () => {
     const ws = makeWriteSet();
-    const ctx = makeCtx({ ws, cloudVariant: "claude" });
+    const ctx = makeCtx({ ws, cloudVariant: "claude", issueTracker: "github" });
     runCloudModule(ctx);
 
     expect(ws.writes).toEqual([]);
@@ -81,7 +81,7 @@ describe("runCloudModule — opt-in cloud agents (post-CI auto-routing)", () =>
     const advisory = ctx.advisories.find((a) => a.id === "bkit-cloud-setup");
     expect(advisory).toBeDefined();
     expect(advisory!.action).toContain(".bkit/templates/.github/workflows/bkit-cloud.yml");
-    expect(advisory!.action).toMatch(/`ANTHROPIC_API_KEY` repo secret/);
+    expect(advisory!.action).toMatch(/`BKIT_ANTHROPIC_API_KEY` repo secret/);
     expect(advisory!.action).toMatch(
       /`ANTHROPIC_FEDERATION_RULE_ID` \+ `ANTHROPIC_ORGANIZATION_ID` repo variables/,
     );
@@ -94,20 +94,77 @@ describe("runCloudModule — opt-in cloud agents (post-CI auto-routing)", () =>
     expect(ctx.advisories.find((a) => a.id === "cloud-env-customize")).toBeDefined();
   });
 
-  it("cloud=opencode: writes no files and points the setup advisory at the workflow template", () => {
-    const ws = makeWriteSet();
-    const ctx = makeCtx({ ws, cloudVariant: "opencode", issueTracker: "github" });
-    runCloudModule(ctx);
-
-    expect(ws.writes).toEqual([]);
-    expect(fs.existsSync(path.join(tmpDir, routerRel))).toBe(false);
-    expect(fs.existsSync(path.join(tmpDir, bootstrapRel))).toBe(false);
+  it("opencode variant advisory names the configured provider's BKIT_ key", () => {
+    const providerKeys = [
+      ["openrouter", "BKIT_OPENROUTER_API_KEY"],
+      ["ollama", "BKIT_OLLAMA_API_KEY"],
+      ["opencode-zen", "BKIT_OPENCODE_API_KEY"],
+      ["opencode-go", "BKIT_OPENCODE_API_KEY"],
+    ] as const;
+    for (const [opencodeProvider, key] of providerKeys) {
+      const ws = makeWriteSet();
+      const ctx = makeCtx({
+        ws,
+        cloudVariant: "opencode",
+        issueTracker: "github",
+        opencodeProvider,
+      });
+      runCloudModule(ctx);
+
+      expect(ws.writes).toEqual([]);
+      expect(fs.existsSync(path.join(tmpDir, routerRel))).toBe(false);
+      expect(fs.existsSync(path.join(tmpDir, bootstrapRel))).toBe(false);
+
+      const advisory = ctx.advisories.find((a) => a.id === "bkit-cloud-setup");
+      expect(advisory).toBeDefined();
+      expect(advisory!.action).toContain(".bkit/templates/.github/workflows/bkit-cloud.yml");
+      expect(advisory!.action).toContain(key);
+      expect(advisory!.action).not.toContain("OPENCODE_PROVIDER_KEY");
+      expect(advisory!.action).not.toContain("BKIT_ANTHROPIC_API_KEY");
+      const otherKeys = [...new Set(providerKeys.map(([, value]) => value))].filter(
+        (value) => value !== key,
+      );
+      for (const otherKey of otherKeys) {
+        expect(advisory!.action).not.toContain(otherKey);
+      }
+    }
+  });
 
+  it("codex variant advisory names --codex, .codex/bkit-cloud.md and BKIT_OPENAI_API_KEY", () => {
+    const ctx = makeCtx({ cloudVariant: "codex", issueTracker: "github" });
+    runCloudModule(ctx);
     const advisory = ctx.advisories.find((a) => a.id === "bkit-cloud-setup");
     expect(advisory).toBeDefined();
-    expect(advisory!.action).toContain(".bkit/templates/.github/workflows/bkit-cloud.yml");
-    expect(advisory!.action).toMatch(/OPENCODE_PROVIDER_KEY/);
-    expect(advisory!.action).not.toMatch(/BKIT_ANTHROPIC_API_KEY/);
+    expect(advisory!.action).toContain("--codex");
+    expect(advisory!.action).toContain(".codex/bkit-cloud.md");
+    expect(advisory!.action).toContain("BKIT_OPENAI_API_KEY");
+    expect(ctx.ws.writes).toEqual([]);
+    expect(fs.existsSync(path.join(tmpDir, routerRel))).toBe(false);
+    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
+      bkit?: { cloud?: { agent?: string } };
+    };
+    expect(pkg.bkit?.cloud?.agent).toBe("codex");
+  });
+
+  it("%s variant under %s names only that tracker's key", () => {
+    const trackerKeys = [
+      ["github", "BKIT_GH_TOKEN"],
+      ["linear", "BKIT_LINEAR_API_KEY"],
+      ["jira", "BKIT_JIRA_API_KEY"],
+    ] as const;
+    for (const cloudVariant of ["claude", "cursor", "opencode", "codex"] as const) {
+      for (const [issueTracker, key] of trackerKeys) {
+        const ctx = makeCtx({ cloudVariant, issueTracker, opencodeProvider: "openrouter" });
+        runCloudModule(ctx);
+        expect(ctx.advisories.length, `${cloudVariant}/${issueTracker}`).toBeGreaterThan(0);
+        const text = ctx.advisories.map((a) => `${a.detect}\n${a.action}`).join("\n");
+        expect(text, `${cloudVariant}/${issueTracker}`).toContain(key);
+        const otherKeys = trackerKeys.filter(([tracker]) => tracker !== issueTracker);
+        for (const [, otherKey] of otherKeys) {
+          expect(text, `${cloudVariant}/${issueTracker}`).not.toContain(otherKey);
+        }
+      }
+    }
   });
 
   it("cloud=cursor: writes no files and points the setup advisory at the .cursor templates", () => {
diff --git a/.bkit/core/engine/install/modules/cloud.ts b/.bkit/core/engine/install/modules/cloud.ts
index 12cb82805..9df678ef4 100644
--- a/.bkit/core/engine/install/modules/cloud.ts
+++ b/.bkit/core/engine/install/modules/cloud.ts
@@ -6,7 +6,10 @@
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { parseJson } from "../../shared/json.js";
-import type { CloudAgents } from "../manifest.js";
+import type { CloudVariant } from "../../cli.js";
+import { isOpencodeProvider } from "../../render/models.js";
+import { OPENCODE_PROVIDER_DEFAULTS } from "../../shared/egress.js";
+import type { IssueTracker } from "../manifest.js";
 import type { ModuleContext } from "./index.js";
 
 // ---------------------------------------------------------------------------
@@ -52,9 +55,30 @@ function setConsumerBkitField(field: string, value: string, dryRun: boolean): vo
 }
 
 // The cloud workflow is a template (`.bkit/templates.md`). Shared first step of the
-// claude and opencode setup advisories.
+// router-backed setup advisories.
 const CLOUD_WORKFLOW_ADOPT_STEP =
-  "  - Copy `.bkit/templates/.github/workflows/bkit-cloud.yml` to `.github/workflows/bkit-cloud.yml` and own it: bkit never writes or overwrites that file after you copy it. The one exception is a brand migration: `bkit upgrade` rewrites exact shipped old names in it and leaves any edited line. Replace the `{{CLOUD_RUNNER}}` placeholder in both jobs' `runs-on` with a runner label (e.g. `ubuntu-latest`). `.bkit/templates.md` lists every placeholder; on each `bkit upgrade`, diff the refreshed template against your copy.\n";
+  "  - Copy `.bkit/templates/.github/workflows/bkit-cloud.yml` to `.github/workflows/bkit-cloud.yml` and own it: bkit never writes or overwrites that file after you copy it. The one exception is a brand migration: `bkit upgrade` rewrites exact shipped old names in it and leaves any edited line. Replace `{{CLOUD_RUNNER}}` with your runner label and `{{NODE_VERSION}}` with your Node major. `.bkit/templates.md` lists every placeholder; on each `bkit upgrade`, diff the refreshed template against your copy.\n";
+
+function trackerAdvisoryLines(tracker: IssueTracker, variant: CloudVariant): string {
+  const credentials: Record<IssueTracker, string> = {
+    github: "  - Tracker credential (GitHub): set `BKIT_GH_TOKEN` for the cloud environment.\n",
+    linear:
+      "  - Tracker credential (Linear): set `BKIT_LINEAR_API_KEY` in the cloud environment and as a repo Actions secret for the router. Generate it at https://linear.app/settings/api.\n",
+    jira: "  - Tracker credential (Jira): set `BKIT_JIRA_API_KEY` in the cloud environment and as a repo Actions secret for the router. Use an Atlassian MCP V2 scoped token; `.bkit/trackers.md` § jira lists its permissions.\n",
+    none: "  - Wire a tracker with `bkit install --tracker=<github|linear|jira>`.\n",
+  };
+  const cursorTriggers: Record<IssueTracker, string> = {
+    github: "  - Optional native launch: mention `@cursor` on a GitHub issue or pull request.\n",
+    linear: "  - Optional native launch: use Cursor's Linear integration.\n",
+    jira: "  - Launch Cursor manually or through its own GitHub triggers for a Jira issue.\n",
+    none: "",
+  };
+  return (
+    credentials[tracker] +
+    "  - Label the issue `bkit:auto` in the configured tracker before pushing the build commit.\n" +
+    (variant === "cursor" ? cursorTriggers[tracker] : "")
+  );
+}
 
 // ---------------------------------------------------------------------------
 // runCloudModule — opt-in cloud-agent integration
@@ -72,115 +96,80 @@ const CLOUD_WORKFLOW_ADOPT_STEP =
 
 export function runCloudModule(ctx: ModuleContext): void {
   const { dryRun, advisories } = ctx;
-  // Default to "claude" (the Claude/GitHub path) when cloudVariant is not set.
-  // Callers should always pass cloudVariant.
-  const variant: CloudAgents = ctx.cloudVariant ?? "claude";
-
-  if (variant === "claude") {
-    // --- cloud=claude: GitHub-tracker path ---
-
-    // Record the variant so the post-install advisory and `bkit check` stay consistent.
-    setConsumerBkitField("cloud.agent", "claude", dryRun);
-
-    // Advisory — cloud=claude setup checklist (App required; id-token: write).
-    advisories.push({
-      id: "bkit-cloud-setup",
-      severity: "advisory",
+  const variant = ctx.cloudVariant ?? "claude";
+  const trackerLines = trackerAdvisoryLines(ctx.issueTracker, variant);
+  const providerKey =
+    ctx.opencodeProvider && isOpencodeProvider(ctx.opencodeProvider)
+      ? OPENCODE_PROVIDER_DEFAULTS[ctx.opencodeProvider].envVar
+      : "your configured provider's BKIT_ key";
+  const routerSetup =
+    "Full recipe in bkit's `cloud.md` § Post-CI auto-routing.\n\n" +
+    "REQUIRED ONE-TIME SETUP:\n" +
+    CLOUD_WORKFLOW_ADOPT_STEP +
+    "  - GitHub Actions permissions — set org and repo Workflow permissions to **Read and write permissions** and tick **Allow GitHub Actions to create and approve pull requests**.\n";
+  const variants: Record<CloudVariant, { detect: string; action: string }> = {
+    claude: {
       detect:
-        "Cloud agents (claude) need the unified cloud workflow (claude + opencode jobs, runtime-gated by secret presence), which ships as a template at `.bkit/templates/.github/workflows/bkit-cloud.yml`. The Claude GitHub App is required for `claude-code-action@v1` to authenticate via OIDC.",
+        "Cloud agents (claude) use the unified cloud workflow. It selects the recorded cloud agent and requires the Claude GitHub App for OIDC authentication.",
       action:
-        "Full recipe in bkit's `cloud.md` § Post-CI auto-routing.\n\n" +
-        "REQUIRED ONE-TIME SETUP:\n" +
-        CLOUD_WORKFLOW_ADOPT_STEP +
-        "  - Run `/install-github-app` (Claude Code CLI) to install the Claude GitHub App on your repo. This is required — `claude-code-action@v1` authenticates as the App via OIDC (`id-token: write`); without the App it fails at boot with an OIDC error.\n" +
-        "  - GitHub Actions permissions — flip BOTH org AND repo: Settings → Actions → General → Workflow permissions = **Read and write permissions** + tick **Allow GitHub Actions to create and approve pull requests**.\n" +
-        "  - Give `claude-code-action@v1` ONE claude credential (Settings → Secrets and variables → Actions):\n" +
-        "    - the `ANTHROPIC_API_KEY` repo secret (job env keeps this vendor name; local `.bkit/.env` stores it as `BKIT_ANTHROPIC_API_KEY`), or\n" +
-        "    - keyless workload identity federation: Claude Console → Settings → Workload identity → Connect workload → GitHub Actions creates the issuer, service account and federation rule; then set the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables (optional `ANTHROPIC_SERVICE_ACCOUNT_ID` / `ANTHROPIC_WORKSPACE_ID`). Leave `ANTHROPIC_API_KEY` unset — a set key wins over federation.\n" +
-        "  - Label the issue `bkit:auto` before pushing the build commit — without the label the CI auto-route exits no-op.\n\n" +
-        "OPTIONAL (manual phase launch): after `/install-github-app`, comment `@claude /bkit-plan` (or any phase) on a GitHub issue/PR to launch it from the tracker UI. The App's generated `claude.yml` triggers on mention events; `bkit-cloud.yml` triggers on CI completion + `workflow_dispatch` — the two coexist.\n\n" +
-        "Both the CI-driven path and the `@claude` mention path invoke the same `/bkit-auto` orchestrator (mirrored to `.claude/commands/bkit-auto.md` on each `pnpm bkit install`).",
-    });
-
-    // Advisory — cloud env scaffolding (Claude half).
-    advisories.push({
-      id: "cloud-env-customize",
-      severity: "advisory",
+        routerSetup +
+        "  - Run `/install-github-app` (Claude Code CLI) to install the Claude GitHub App. The action needs `id-token: write` for OIDC.\n" +
+        "  - Set the `BKIT_ANTHROPIC_API_KEY` repo secret, or configure keyless workload identity federation with the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables (optional `ANTHROPIC_SERVICE_ACCOUNT_ID` / `ANTHROPIC_WORKSPACE_ID`). Leave the API key unset to use federation.\n" +
+        trackerLines +
+        "\nOPTIONAL: after installing the App, mention `@claude /bkit-plan` on a GitHub issue or pull request. Vendor-native handlers are installed separately; bkit does not install them.",
+    },
+    opencode: {
       detect:
-        "Cloud env config splits across the repo (`.claude/hooks/bkit-cloud-bootstrap.sh`, a copy-and-own template you adopt) and the Claude app dashboard (setup script + env vars + auth tokens, manual).",
+        "Cloud agents (opencode) use the unified cloud workflow and the provider configured in the committed .opencode/ host.",
       action:
-        "Two locations to touch — full recipe in bkit's `cloud.md`.\n\n" +
-        "IN REPO (copy-and-own; bkit never writes it, apart from brand migrations that rewrite exact shipped old names):\n" +
-        "  - Adopt `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` as `.claude/hooks/bkit-cloud-bootstrap.sh` and edit it freely — the baseline runs `pnpm install` / `vale sync` and the gh login on each cloud session; add your own repo-specific steps (Supabase start, turbo prebuild, etc. — examples inlined). The `.claude/settings.json` SessionStart entry runs it only when present (`test -f … || true`).\n\n" +
-        "IN CLAUDE APP (claude.ai/code → environment selector → + Add environment):\n" +
-        "  - Name: the repo name (e.g. `acme-web`) — one environment per repo, since secrets are per-repo.\n" +
-        "  - Setup script: paste from bkit's `cloud.md` § Setup script (installs Node 24 + vale + gh + jq + corepack-pinned pnpm — exact versions live in cloud.md, not duplicated here).\n" +
-        "  - Environment variables: `BKIT_GH_TOKEN` (fine-grained for one owner, classic across owners — GitHub MCP).\n" +
-        "  - Tracker env vars (GitHub): `BKIT_GH_TOKEN` above is the only tracker credential — the GitHub MCP server sends it on every call, and the bootstrap hook signs `gh` in with it.\n" +
-        "  - Network access: `Trusted` (default). One environment per repo (secrets differ per repo); the setup script + variable *names* are identical across repos, only the values change. See cloud.md § Sharing across repos → Claude.",
-    });
-  } else if (variant === "opencode") {
-    // --- cloud=opencode: GitHub-tracker path (same bkit-cloud.yml template, no OIDC) ---
-
-    // Record the variant.
-    setConsumerBkitField("cloud.agent", "opencode", dryRun);
-
-    // Advisory — cloud=opencode setup checklist.
-    advisories.push({
-      id: "bkit-cloud-setup",
-      severity: "advisory",
+        routerSetup +
+        "  - Install the local host: `bkit install --opencode=<provider>` (e.g. `--opencode=openrouter`). Commit its provider and model configuration.\n" +
+        `  - Add \`${providerKey}\` to repo Actions secrets for the configured provider.\n` +
+        trackerLines +
+        "\nThe stock `/oc` comment handler (`opencode github install`) is a separate vendor-native installation; bkit does not install it.",
+    },
+    codex: {
       detect:
-        "Cloud agents (opencode) need the unified cloud workflow (claude + opencode jobs, runtime-gated by secret presence), which ships as a template at `.bkit/templates/.github/workflows/bkit-cloud.yml`. The opencode job runs when `OPENCODE_PROVIDER_KEY` is set.",
+        "Cloud agents (codex) use the unified cloud workflow and openai/codex-action with the installed Codex host.",
       action:
-        "Full recipe in bkit's `cloud.md` § Post-CI auto-routing.\n\n" +
-        "REQUIRED ONE-TIME SETUP:\n" +
-        CLOUD_WORKFLOW_ADOPT_STEP +
-        "  - Install the local opencode host first: `bkit install --opencode=<provider>` (e.g. `--opencode=opencode`). The cloud opencode job runs against the committed `.opencode/` config — provider and model pins come from there, not from this YAML.\n" +
-        "  - Add `OPENCODE_PROVIDER_KEY` to repo secrets (Settings → Secrets and variables → Actions). Set it to your configured provider's API key. The workflow fans this one secret out to every supported provider env var name (`BKIT_OPENROUTER_API_KEY`/`BKIT_OLLAMA_API_KEY`/`BKIT_OPENCODE_API_KEY`) so the `.opencode/opencode.json` `{env:VAR}` reference resolves whichever provider you installed.\n" +
-        "  - GitHub Actions permissions — flip BOTH org AND repo: Settings → Actions → General → Workflow permissions = **Read and write permissions** + tick **Allow GitHub Actions to create and approve pull requests**.\n" +
-        "  - The opencode job does NOT use a Claude API key — it runs the opencode runner with your chosen provider key only. If you also install the claude job (separate secret), both jobs coexist on the same event.\n" +
-        "  - Label the issue `bkit:auto` before pushing the build commit — without the label the CI auto-route exits no-op.\n\n" +
-        "REACTIVE HANDLER (separate, consumer self-installed): the stock `/oc` comment handler (`opencode github install`) is NOT managed by bkit — install it once per repo independently. It mirrors the `@claude`/`claude.yml` stance. `bkit-cloud.yml` handles the CI-driven + `workflow_dispatch` path only.",
-    });
-  } else {
-    // --- cloud=cursor: Linear-tracker path ---
-
-    // Record the variant.
-    setConsumerBkitField("cloud.agent", "cursor", dryRun);
-
-    // Advisory — cloud=cursor setup checklist.
-    advisories.push({
-      id: "bkit-cloud-setup",
-      severity: "advisory",
+        routerSetup +
+        "  - Install the Codex host first: `bkit install --codex`. Copy the environment setup from `.codex/bkit-cloud.md` (gitignored).\n" +
+        "  - Add `BKIT_OPENAI_API_KEY` to repo Actions secrets. The router starts the codex job only when codex is the recorded agent and its credential is set.\n" +
+        trackerLines +
+        "\nVendor-native `@Codex` mentions and Codex for Linear are configured separately; bkit documents them and does not install them.",
+    },
+    cursor: {
       detect:
-        "Cloud agents (cursor) need the Cursor Background Agent scaffolding, which ships as templates at `.bkit/templates/.cursor/Dockerfile` and `.bkit/templates/.cursor/environment.json`. The Cursor Background Agent trigger is configured in the Cursor cloud agents dashboard — bkit cannot automate that step.",
+        "Cloud agents (cursor) use the Cursor Cloud Agents dashboard triggers and the .cursor/ scaffolding templates.",
       action:
         "Full recipe in bkit's `cloud.md` § Post-CI auto-routing.\n\n" +
         "IN CURSOR DASHBOARD:\n" +
         "  - Cursor → Cloud Agents dashboard → Triggers → + Add trigger.\n" +
         "  - Event: CI workflow completion. Branch filter: `feat/**`.\n" +
-        "  - Prompt (paste literally, no edits): `/bkit-auto $CI_STATUS $PR_NUMBER`.\n" +
-        "  - Allowed concurrency: latest-supersedes.\n" +
-        "  - Set `BKIT_LINEAR_API_KEY` as a **Runtime Secret** in the Cloud Agents dashboard (https://cursor.com/dashboard/cloud-agents) → your environment → Secrets tab.\n" +
-        "  - Label the issue `bkit:auto` in Linear before pushing the build commit.\n\n" +
-        "IN REPO (copy each template and own it; bkit never writes or overwrites these files, apart from brand migrations that rewrite exact shipped old names — see `.bkit/templates.md`):\n" +
-        "  - `.bkit/templates/.cursor/Dockerfile` → `.cursor/Dockerfile`: change Node major if `engines.node` differs from 20; add Playwright / Supabase CLI / extra apt deps.\n" +
-        "  - `.bkit/templates/.cursor/environment.json` → `.cursor/environment.json`: set `install` / `start` / `terminals[]` / `env` for your stack.",
-    });
+        "  - Prompt: `/bkit-auto $CI_STATUS $PR_NUMBER`. Allowed concurrency: latest-supersedes.\n" +
+        trackerLines +
+        "\nIN REPO (copy each template and own it):\n" +
+        "  - `.bkit/templates/.cursor/Dockerfile` → `.cursor/Dockerfile`: match your Node major and add your stack's tools.\n" +
+        "  - `.bkit/templates/.cursor/environment.json` → `.cursor/environment.json`: configure install, start and terminal commands.",
+    },
+  };
+
+  setConsumerBkitField("cloud.agent", variant, dryRun);
+  advisories.push({ id: "bkit-cloud-setup", severity: "advisory", ...variants[variant] });
 
-    // Advisory — cloud env scaffolding (Cursor half).
+  if (variant === "claude" || variant === "cursor") {
+    const environment =
+      variant === "claude"
+        ? "Adopt `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` as `.claude/hooks/bkit-cloud-bootstrap.sh`. Configure the setup script and environment in the Claude app dashboard."
+        : "Configure the copied .cursor/Dockerfile and .cursor/environment.json, then add each token as a **Runtime Secret** in the Cursor Cloud Agents dashboard.";
     advisories.push({
       id: "cloud-env-customize",
       severity: "advisory",
-      detect:
-        "Cloud env config splits across the repo (`.cursor/Dockerfile` + `.cursor/environment.json`, copied from `.bkit/templates/.cursor/`) and the Cursor Cloud Agents dashboard (secrets, manual).",
+      detect: `Cloud environment setup combines the repo templates and the ${variant} dashboard.`,
       action:
-        "Copy-paste-ready values (resolved from your `.envrc`) are written to `.cursor/bkit-cloud.md` (gitignored) on every install.\n\n" +
-        "IN THE CLOUD AGENTS DASHBOARD (https://cursor.com/dashboard/cloud-agents → your environment → Secrets tab) — add each as a **Runtime Secret** (loaded as an env var, redacted from the agent's transcript):\n" +
-        "  - `BKIT_GH_TOKEN`.\n" +
-        "  - Tracker secret (Linear): `BKIT_LINEAR_API_KEY` (generate at https://linear.app/settings/api). `LINEAR_ISSUE_ID` is injected per-session — don't hardcode.\n" +
-        "  - First session after Dockerfile changes rebuilds the image; subsequent sessions reuse cached layers.\n\n" +
-        "Full recipe in bkit's `cloud.md`; the paste-ready block is in `.cursor/bkit-cloud.md`.",
+        environment +
+        ` Copy-paste-ready values resolved from your .envrc are in .${variant}/bkit-cloud.md (gitignored).\n` +
+        trackerLines,
     });
   }
 }
diff --git a/.bkit/core/engine/tools/cli-doc.test.ts b/.bkit/core/engine/tools/cli-doc.test.ts
index d36dfddce..ab46ee20b 100644
--- a/.bkit/core/engine/tools/cli-doc.test.ts
+++ b/.bkit/core/engine/tools/cli-doc.test.ts
@@ -34,7 +34,7 @@ describe("cli-doc", () => {
   });
 
   it("escapes a pipe inside a table cell", () => {
-    expect(renderRegion()).toContain("`--auto=<claude\\|cursor\\|opencode>`");
+    expect(renderRegion()).toContain("`--auto=<claude\\|cursor\\|opencode\\|codex>`");
   });
 
   it("replaces only the region between line-anchored markers", () => {
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index d65db3a82..de61ce33e 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -77,3 +77,5 @@
 {"schema":3,"ts":1793589173762,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"90c5e692e71146c42305c59cbd12a8320c048336"},"recurrenceCount":3,"lastConfirmed":1793589173762}
 {"schema":3,"ts":1793862612535,"kind":"friction","key":"build-719-resume-rebase-manual-recovery","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-worktree-setup"},"references":["docs/plans/202610/logs/719-cloud-variants-add/status.jsonl"],"category":"agent-rework","scope":"bkit-repo","severity":"MEDIUM","summary":"Resume rebase required explicit owner-authorized conflict resolution","description":"The engine refused skills-lock.json and then providers documentation; its generated untracked recovery log also blocked abort. The failure handler succeeded after preserving the log. On explicit owner instruction to solve conflicts and continue, manual resolutions preserved current skills plus Vitest, current provider names plus the tracker guard, and current generated records and graphs. The rebase completed and worktrees setup passed.","remediation":"Preserved the failed attempt artifacts outside the worktree, completed manual rebase recovery, and restarted the build workflow.","source":"orchestrator","status":"CLOSED"}
 {"schema":3,"ts":1793863389368,"kind":"friction","key":"build-719-skills-content-mismatch-rework","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-install-skills"},"references":["docs/plans/202610/logs/719-cloud-variants-add/build-install-skills.md"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"A discovered Node.js skill required removal after content review","description":"The skills installer selected mcollina/skills nodejs-core from discovery metadata, then found its instructions focused on Node core C++ development rather than this TypeScript CLI. It removed the unsuitable installation and retained four matching skills.","remediation":"Reviewed skill content, removed the mismatch, and verified retained installs and host discovery.","source":"orchestrator","status":"CLOSED"}
+{"schema":3,"ts":1793873433042,"kind":"friction","key":"build-719-group3-capacity-recovery","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["719","docs/plans/202610/logs/719-cloud-variants-add/build-plan-tasks-3-log.md"],"category":"tool-failure","scope":"bkit-repo","severity":"LOW","status":"CLOSED","source":"orchestrator","summary":"Group 3 required resumed turns after model capacity interruptions","description":"The orchestrator reported two transient model-capacity interruptions while group 3 awaited its changed gate. The same agent recovered the existing session and buffered logs. No implementation or broad check was restarted.","remediation":"Continued from existing artifacts and session55370; captured the stalled-check evidence, cancelled only that own gate, and completed targeted CLI-doc verification."}
+{"schema":3,"ts":1793874387453,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":3,"lastConfirmed":1793874387453}
diff --git a/.bkit/shared/.bkit/.env.example b/.bkit/shared/.bkit/.env.example
index 442b44233..c78580ae2 100644
--- a/.bkit/shared/.bkit/.env.example
+++ b/.bkit/shared/.bkit/.env.example
@@ -85,6 +85,11 @@ BKIT_JIRA_API_KEY=
 # Generate at: https://console.anthropic.com/settings/keys
 BKIT_ANTHROPIC_API_KEY=
 
+# BKIT_OPENAI_API_KEY — OpenAI API key for the Codex cloud router job.
+# Add the same name as a repo Actions secret when using `bkit install --auto=codex`.
+# Generate at: https://platform.openai.com/api-keys
+BKIT_OPENAI_API_KEY=
+
 # BKIT_CURSOR_API_KEY — Cursor API key. Only needed if you dispatch Cursor cloud
 # agents from this shell (programmatic POST /v0/agents, model catalog queries
 # via `curl https://api.cursor.com/v0/models -u "$BKIT_CURSOR_API_KEY:"`). The
diff --git a/.bkit/version b/.bkit/version
index 11b7db0c6..ef5d5da3c 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -20,7 +20,7 @@
     ".mcp.json": "65b29f1bb28dd6296d1dc8ea34aca4826d9ca072d7cef9d2971a7045280505d9",
     "docs/architecture.md": "37439a080956614ce27340c3e262b45933d64313adaafc6c142d337b9767b5cb",
     "docs/technology.md": "8111c0a3262df6f8eeedb3fbe83559ec8ce23c847a593b98cc83f9e24eca128e",
-    ".bkit/.env.example": "817fa9ffb183f34a004f824a5d58416cc7ed1f336218024262dd7ada68c44641",
+    ".bkit/.env.example": "33195c635ab4b35dea8990a278bb28193f4b5f331dcbdc5c975aeb5f51743e41",
     ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
     "docs/design.md": "e012c407c66e2b8da22a9ebc9b632237c42ea84c704f61cfb06d0144edd01536",
     ".claude/commands/bkit-auto.md": "2138147c1ccc2fa2140d63dad0f0bb87a2dd029aeb7b1d3bb921efd2e4518ed9",
@@ -264,7 +264,7 @@
     ".codex/hooks/bkit-rules.cjs": "8aee2cde5448c083ae0dc07a4f1db86ce7e815a2a2eafe54b886b7f4393cab91",
     ".opencode/plugin/bkit-rules.js": "417d3ca107ebf005060953a17340620e1fcfb5bcdf491316a937e0c747b0377e",
     ".bkit/router.md": "c20d006757e350c173da94686d48500bc83e12d9f7bb6ff5911e47e332e45eab",
-    ".bkit/cli.md": "31ff612ce7d455d472add1d5810b6fc50d173fb3e4b4ffe2caeb6eab1b9b5316",
+    ".bkit/cli.md": "31736bee936529bdc7f842c47767863c61e20cd033d04565d2916d55d31a31cf",
     ".claude/agents/bkit-build-plan-tests.md": "f7b4e6be48b6950d27256c42d5d2c48b20bd23b90d66b0d1f59745a33ad251b5",
     ".cursor/agents/bkit-build-plan-tests.md": "57996d02186862b35c6e22dd150e0b1d19a243f10fddb16002feefd7d42c7838",
     ".opencode/agents/bkit-build-plan-tests.md": "896af5e894b0ae4c9911cc5ee3f54e5426efdf2e4f8ec5c758ed990b82fac6d4",
diff --git a/DETAILS.md b/DETAILS.md
index f22dac208..76fda50e9 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -346,7 +346,7 @@ flowchart LR
     n_bkit_core_engine_checks["checks<br/>252 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
     n_bkit_core_engine_commands["commands<br/>1695 symbols · 51 files"]
-    n_bkit_core_engine_install["install<br/>308 symbols · 20 files"]
+    n_bkit_core_engine_install["install<br/>309 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>184 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>150 symbols · 13 files<br/>1 open finding"]
@@ -354,11 +354,11 @@ flowchart LR
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   n_bkit_core_engine_commands -->|385| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|367| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_commands -->|205| n_bkit_core_engine_install
-  n_bkit_core_engine_install -->|170| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|204| n_bkit_core_engine_install
+  n_bkit_core_engine_install -->|172| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|132| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|83| n_bkit_core_engine_checks
-  n_bkit_core_engine_install -->|61| n_bkit_core_engine_render
+  n_bkit_core_engine_install -->|64| n_bkit_core_engine_render
   n_bkit_core_engine_checks -->|56| n_bkit_core_engine_install
   n_bkit_core_engine_commands -->|42| n_bkit_core_engine_render
   n_bkit_core_engine_cli -->|34| n_bkit_core_engine_commands
@@ -372,7 +372,7 @@ flowchart LR
   n_bkit_core_engine_render -->|12| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|11| n_bkit_core_engine_ledgers
   n_bkit_core_engine_install -->|11| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_install -->|8| n_bkit_core_engine_cli
+  n_bkit_core_engine_install -->|10| n_bkit_core_engine_cli
   n_bkit_core_engine_cli -->|7| n_bkit_core_engine_install
   n_bkit_core_engine_render -->|7| n_bkit_core_engine_install
   n_bkit_core_engine_checks -->|6| n_bkit_core_engine_render
diff --git a/dist/cli.js b/dist/cli.js
index 66259d296..b7809a36e 100755
--- a/dist/cli.js
+++ b/dist/cli.js
@@ -19,7 +19,7 @@ import { runInstall } from "./commands/install/install.js";
 import { OPTIN_MODULES } from "./install/manifest.js";
 import { OPENCODE_PROVIDERS } from "./shared/egress.js";
 /** Cloud-agent variant chosen via `--auto=<variant>`. */
-export const CLOUD_VARIANTS = ["claude", "cursor", "opencode"];
+export const CLOUD_VARIANTS = ["claude", "cursor", "opencode", "codex"];
 /** Narrow an unknown string to `CloudVariant` or return `null` if invalid. */
 export function parseCloudVariant(value) {
     return typeof value === "string" && CLOUD_VARIANTS.includes(value)
@@ -424,7 +424,7 @@ export const CLASSIC_VERB_HELP = [
             "--antigravity",
             "--cursor",
             "--opencode=<provider>",
-            "--auto=<claude|cursor|opencode>",
+            "--auto=<claude|cursor|opencode|codex>",
             "--tracker=<name>",
             "--auto-revert",
         ],
@@ -480,7 +480,7 @@ export const CLASSIC_VERB_HELP = [
             "--antigravity",
             "--cursor",
             "--opencode=<provider>",
-            "--auto=<claude|cursor|opencode>",
+            "--auto=<claude|cursor|opencode|codex>",
             "--dry-run",
             "--force",
             "--nuke",
@@ -682,14 +682,14 @@ Dependency updaters (copy an example and own it):
   blocks when that value and the configs disagree.
   All templates and install steps: .bkit/templates.md
 
-  --auto=<claude|cursor|opencode>
-                  Cloud-agent (auto-dispatch) integration (opt-in). --auto=claude needs
-                  tracker=github + the ANTHROPIC_API_KEY repo secret (or the
-                  ANTHROPIC_FEDERATION_RULE_ID + ANTHROPIC_ORGANIZATION_ID repo variables
-                  for keyless federation) + the Claude GitHub App; --auto=cursor
-                  needs tracker=linear; --auto=opencode needs tracker=github + a remote
-                  opencode provider (OPENCODE_PROVIDER_KEY). Bare --auto is accepted on
-                  uninstall only.
+  --auto=<claude|cursor|opencode|codex>
+                  Cloud-agent (auto-dispatch) integration (opt-in). Every variant needs
+                  a wired tracker (github, linear or jira). Claude needs the
+                  BKIT_ANTHROPIC_API_KEY repo secret or the ANTHROPIC_FEDERATION_RULE_ID
+                  + ANTHROPIC_ORGANIZATION_ID repo variables, plus the Claude GitHub App.
+                  Codex needs --codex and BKIT_OPENAI_API_KEY. OpenCode needs --opencode
+                  and its configured provider's BKIT_ key. Cursor uses its dashboard
+                  triggers. Bare --auto is accepted on uninstall only.
 
 Cross-cutting / modifiers:
   --tracker=<name>      Wire issue tracker integration. Values: github, linear, jira, none
@@ -786,7 +786,7 @@ export function validateModuleFlagsForVerb(verb, moduleFlags, tracker = null) {
 // The CLI entrypoint, run only when this file is executed and driven by real
 // argv/fs/process.exit side effects; install.integration.test.ts exercises it through
 // spawned processes. Pure decision logic lives in exported functions
-// (validateModuleFlagsForVerb above, validateCloudTrackerMatch in commands/install/install.ts)
+// (validateModuleFlagsForVerb above, validateCloudTrackerWired in commands/install/install.ts)
 // for unit coverage.
 export async function main() {
     const commandExit = await runCommand(process.argv.slice(2), COMMANDS, {
diff --git a/dist/commands/install/install.js b/dist/commands/install/install.js
index faed85d8a..230103c65 100644
--- a/dist/commands/install/install.js
+++ b/dist/commands/install/install.js
@@ -5,7 +5,6 @@ import * as path from "node:path";
 import { OPENCODE_PROVIDERS } from "../../shared/egress.js";
 import { readInstallingVersion } from "../../shared/package-json.js";
 import { dispatchModules } from "../../install/modules/index.js";
-import { DEFAULT_ISSUE_TRACKER, } from "../../install/manifest.js";
 import { parseJson, readJsonFile } from "../../shared/json.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { LOG_PREFIX, setLogPrefix } from "../../shared/log-prefix.js";
@@ -81,24 +80,14 @@ export function modulesToCliFlags(mods, opencodeProvider, cloudVariant) {
     return out.join(" ");
 }
 /**
- * Symmetric cloud/tracker constraint (FINAL SCOPE decision 3/4): cloud=claude and
- * cloud=opencode both require tracker=github (both use the bkit-cloud.yml template);
- * cloud=cursor requires tracker=linear. Mismatch is a hard error — checked BEFORE
- * any package.json write so no state is recorded on mismatch ("no files written
- * on hard error" invariant). Returns the error message to print, or `null` when
- * the tracker matches (or no cloud module/variant is in play).
+ * Cloud automation needs a wired tracker. Returns the pre-write error message,
+ * or null when a tracker is wired or no cloud module/variant is being installed.
  */
-export function validateCloudTrackerMatch(cloudVariant, hasCloudModule, issueTracker) {
-    if (cloudVariant === null || !hasCloudModule)
+export function validateCloudTrackerWired(cloudVariant, hasCloudModule, issueTracker) {
+    if (cloudVariant === null || !hasCloudModule || issueTracker !== "none")
         return null;
-    const requiredTracker = cloudVariant === "cursor" ? "linear" : "github";
-    if (issueTracker === requiredTracker)
-        return null;
-    return (`[bkit] --auto=${cloudVariant} requires tracker=${requiredTracker}, ` +
-        `but the resolved tracker is "${issueTracker}". ` +
-        (issueTracker === DEFAULT_ISSUE_TRACKER || issueTracker === "none"
-            ? `Set the tracker first: bkit install --tracker=${requiredTracker} --auto=${cloudVariant}`
-            : `Re-run with the matching tracker: bkit install --tracker=${requiredTracker} --auto=${cloudVariant} (tracker switching is free).`));
+    return (`[bkit] --auto=${cloudVariant} needs a wired tracker: ` +
+        `bkit install --tracker=<github|linear|jira> --auto=${cloudVariant}`);
 }
 /** `parent[key]` as an object, set to a fresh `{}` first when it is absent or not an object. */
 function section(parent, key) {
@@ -327,10 +316,8 @@ export async function runInstall(args, upgradeReport = false) {
         });
     }
     const postDispatch = [];
-    // Symmetric cloud/tracker constraint (FINAL SCOPE decision 3/4) — see
-    // validateCloudTrackerMatch for the full rationale. Checked BEFORE any
-    // package.json write so no state is recorded on mismatch.
-    const cloudTrackerError = validateCloudTrackerMatch(cloudVariant, modules.has("cloud"), issueTracker);
+    // Reject missing tracker wiring before any package.json write.
+    const cloudTrackerError = validateCloudTrackerWired(cloudVariant, modules.has("cloud"), issueTracker);
     if (cloudTrackerError) {
         console.error(cloudTrackerError);
         process.exit(1);
@@ -338,12 +325,20 @@ export async function runInstall(args, upgradeReport = false) {
     if (cloudVariant !== null && modules.has("cloud")) {
         // auto=opencode additionally requires the local opencode host to be installed first
         // (the cloud job runs against the committed .opencode/ — no model is hard-coded in YAML).
-        if (cloudVariant === "opencode" && !fs.existsSync(path.join(process.cwd(), ".opencode"))) {
+        if (cloudVariant === "opencode" &&
+            !modules.has("opencode") &&
+            !fs.existsSync(path.join(process.cwd(), ".opencode"))) {
             console.error(`[bkit] --auto=opencode requires the local opencode host to be installed first.\n` +
                 `Run: bkit install --opencode=<provider>  (e.g. --opencode=opencode-zen)\n` +
                 `The cloud opencode job runs against the committed .opencode/ config — without it there is nothing to run.`);
             process.exit(1);
         }
+        if (cloudVariant === "codex" &&
+            !modules.has("codex") &&
+            !fs.existsSync(path.join(process.cwd(), ".codex"))) {
+            console.error(`[bkit] --auto=codex requires the local Codex host. Run: bkit install --codex`);
+            process.exit(1);
+        }
     }
     // Persist bkit manifest fields to consumer package.json AFTER all hard-error gates pass.
     // This preserves the "no files written on mismatch" invariant. Two fields are recorded:
diff --git a/dist/install/manifest.js b/dist/install/manifest.js
index f4aa1ad88..f31755bd1 100644
--- a/dist/install/manifest.js
+++ b/dist/install/manifest.js
@@ -58,7 +58,7 @@ export function parseIssueTracker(value) {
  *
  * Single self-describing field (mirrors `bkit.tracker.default`).
  */
-export const CLOUD_MODES = ["claude", "cursor", "opencode", "none"];
+export const CLOUD_MODES = ["claude", "cursor", "opencode", "codex", "none"];
 /** Default when consumer manifest has no `bkit.cloud.agent` field (undecided). */
 export const DEFAULT_CLOUD_AGENTS = "none";
 /** Narrow an unknown string to `CloudAgents` or return `null` if invalid. */
diff --git a/dist/install/modules/cloud.js b/dist/install/modules/cloud.js
index d2b8b33cb..10be54633 100644
--- a/dist/install/modules/cloud.js
+++ b/dist/install/modules/cloud.js
@@ -5,6 +5,8 @@
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { parseJson } from "../../shared/json.js";
+import { isOpencodeProvider } from "../../render/models.js";
+import { OPENCODE_PROVIDER_DEFAULTS } from "../../shared/egress.js";
 // ---------------------------------------------------------------------------
 // Helpers
 // ---------------------------------------------------------------------------
@@ -52,8 +54,25 @@ function setConsumerBkitField(field, value, dryRun) {
     }
 }
 // The cloud workflow is a template (`.bkit/templates.md`). Shared first step of the
-// claude and opencode setup advisories.
-const CLOUD_WORKFLOW_ADOPT_STEP = "  - Copy `.bkit/templates/.github/workflows/bkit-cloud.yml` to `.github/workflows/bkit-cloud.yml` and own it: bkit never writes or overwrites that file after you copy it. The one exception is a brand migration: `bkit upgrade` rewrites exact shipped old names in it and leaves any edited line. Replace the `{{CLOUD_RUNNER}}` placeholder in both jobs' `runs-on` with a runner label (e.g. `ubuntu-latest`). `.bkit/templates.md` lists every placeholder; on each `bkit upgrade`, diff the refreshed template against your copy.\n";
+// router-backed setup advisories.
+const CLOUD_WORKFLOW_ADOPT_STEP = "  - Copy `.bkit/templates/.github/workflows/bkit-cloud.yml` to `.github/workflows/bkit-cloud.yml` and own it: bkit never writes or overwrites that file after you copy it. The one exception is a brand migration: `bkit upgrade` rewrites exact shipped old names in it and leaves any edited line. Replace `{{CLOUD_RUNNER}}` with your runner label and `{{NODE_VERSION}}` with your Node major. `.bkit/templates.md` lists every placeholder; on each `bkit upgrade`, diff the refreshed template against your copy.\n";
+function trackerAdvisoryLines(tracker, variant) {
+    const credentials = {
+        github: "  - Tracker credential (GitHub): set `BKIT_GH_TOKEN` for the cloud environment.\n",
+        linear: "  - Tracker credential (Linear): set `BKIT_LINEAR_API_KEY` in the cloud environment and as a repo Actions secret for the router. Generate it at https://linear.app/settings/api.\n",
+        jira: "  - Tracker credential (Jira): set `BKIT_JIRA_API_KEY` in the cloud environment and as a repo Actions secret for the router. Use an Atlassian MCP V2 scoped token; `.bkit/trackers.md` § jira lists its permissions.\n",
+        none: "  - Wire a tracker with `bkit install --tracker=<github|linear|jira>`.\n",
+    };
+    const cursorTriggers = {
+        github: "  - Optional native launch: mention `@cursor` on a GitHub issue or pull request.\n",
+        linear: "  - Optional native launch: use Cursor's Linear integration.\n",
+        jira: "  - Launch Cursor manually or through its own GitHub triggers for a Jira issue.\n",
+        none: "",
+    };
+    return (credentials[tracker] +
+        "  - Label the issue `bkit:auto` in the configured tracker before pushing the build commit.\n" +
+        (variant === "cursor" ? cursorTriggers[tracker] : ""));
+}
 // ---------------------------------------------------------------------------
 // runCloudModule — opt-in cloud-agent integration
 // ---------------------------------------------------------------------------
@@ -69,98 +88,66 @@ const CLOUD_WORKFLOW_ADOPT_STEP = "  - Copy `.bkit/templates/.github/workflows/b
 // = hard error). The context's cloudVariant carries the chosen variant.
 export function runCloudModule(ctx) {
     const { dryRun, advisories } = ctx;
-    // Default to "claude" (the Claude/GitHub path) when cloudVariant is not set.
-    // Callers should always pass cloudVariant.
     const variant = ctx.cloudVariant ?? "claude";
-    if (variant === "claude") {
-        // --- cloud=claude: GitHub-tracker path ---
-        // Record the variant so the post-install advisory and `bkit check` stay consistent.
-        setConsumerBkitField("cloud.agent", "claude", dryRun);
-        // Advisory — cloud=claude setup checklist (App required; id-token: write).
-        advisories.push({
-            id: "bkit-cloud-setup",
-            severity: "advisory",
-            detect: "Cloud agents (claude) need the unified cloud workflow (claude + opencode jobs, runtime-gated by secret presence), which ships as a template at `.bkit/templates/.github/workflows/bkit-cloud.yml`. The Claude GitHub App is required for `claude-code-action@v1` to authenticate via OIDC.",
-            action: "Full recipe in bkit's `cloud.md` § Post-CI auto-routing.\n\n" +
-                "REQUIRED ONE-TIME SETUP:\n" +
-                CLOUD_WORKFLOW_ADOPT_STEP +
-                "  - Run `/install-github-app` (Claude Code CLI) to install the Claude GitHub App on your repo. This is required — `claude-code-action@v1` authenticates as the App via OIDC (`id-token: write`); without the App it fails at boot with an OIDC error.\n" +
-                "  - GitHub Actions permissions — flip BOTH org AND repo: Settings → Actions → General → Workflow permissions = **Read and write permissions** + tick **Allow GitHub Actions to create and approve pull requests**.\n" +
-                "  - Give `claude-code-action@v1` ONE claude credential (Settings → Secrets and variables → Actions):\n" +
-                "    - the `ANTHROPIC_API_KEY` repo secret (job env keeps this vendor name; local `.bkit/.env` stores it as `BKIT_ANTHROPIC_API_KEY`), or\n" +
-                "    - keyless workload identity federation: Claude Console → Settings → Workload identity → Connect workload → GitHub Actions creates the issuer, service account and federation rule; then set the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables (optional `ANTHROPIC_SERVICE_ACCOUNT_ID` / `ANTHROPIC_WORKSPACE_ID`). Leave `ANTHROPIC_API_KEY` unset — a set key wins over federation.\n" +
-                "  - Label the issue `bkit:auto` before pushing the build commit — without the label the CI auto-route exits no-op.\n\n" +
-                "OPTIONAL (manual phase launch): after `/install-github-app`, comment `@claude /bkit-plan` (or any phase) on a GitHub issue/PR to launch it from the tracker UI. The App's generated `claude.yml` triggers on mention events; `bkit-cloud.yml` triggers on CI completion + `workflow_dispatch` — the two coexist.\n\n" +
-                "Both the CI-driven path and the `@claude` mention path invoke the same `/bkit-auto` orchestrator (mirrored to `.claude/commands/bkit-auto.md` on each `pnpm bkit install`).",
-        });
-        // Advisory — cloud env scaffolding (Claude half).
-        advisories.push({
-            id: "cloud-env-customize",
-            severity: "advisory",
-            detect: "Cloud env config splits across the repo (`.claude/hooks/bkit-cloud-bootstrap.sh`, a copy-and-own template you adopt) and the Claude app dashboard (setup script + env vars + auth tokens, manual).",
-            action: "Two locations to touch — full recipe in bkit's `cloud.md`.\n\n" +
-                "IN REPO (copy-and-own; bkit never writes it, apart from brand migrations that rewrite exact shipped old names):\n" +
-                "  - Adopt `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` as `.claude/hooks/bkit-cloud-bootstrap.sh` and edit it freely — the baseline runs `pnpm install` / `vale sync` and the gh login on each cloud session; add your own repo-specific steps (Supabase start, turbo prebuild, etc. — examples inlined). The `.claude/settings.json` SessionStart entry runs it only when present (`test -f … || true`).\n\n" +
-                "IN CLAUDE APP (claude.ai/code → environment selector → + Add environment):\n" +
-                "  - Name: the repo name (e.g. `acme-web`) — one environment per repo, since secrets are per-repo.\n" +
-                "  - Setup script: paste from bkit's `cloud.md` § Setup script (installs Node 24 + vale + gh + jq + corepack-pinned pnpm — exact versions live in cloud.md, not duplicated here).\n" +
-                "  - Environment variables: `BKIT_GH_TOKEN` (fine-grained for one owner, classic across owners — GitHub MCP).\n" +
-                "  - Tracker env vars (GitHub): `BKIT_GH_TOKEN` above is the only tracker credential — the GitHub MCP server sends it on every call, and the bootstrap hook signs `gh` in with it.\n" +
-                "  - Network access: `Trusted` (default). One environment per repo (secrets differ per repo); the setup script + variable *names* are identical across repos, only the values change. See cloud.md § Sharing across repos → Claude.",
-        });
-    }
-    else if (variant === "opencode") {
-        // --- cloud=opencode: GitHub-tracker path (same bkit-cloud.yml template, no OIDC) ---
-        // Record the variant.
-        setConsumerBkitField("cloud.agent", "opencode", dryRun);
-        // Advisory — cloud=opencode setup checklist.
-        advisories.push({
-            id: "bkit-cloud-setup",
-            severity: "advisory",
-            detect: "Cloud agents (opencode) need the unified cloud workflow (claude + opencode jobs, runtime-gated by secret presence), which ships as a template at `.bkit/templates/.github/workflows/bkit-cloud.yml`. The opencode job runs when `OPENCODE_PROVIDER_KEY` is set.",
-            action: "Full recipe in bkit's `cloud.md` § Post-CI auto-routing.\n\n" +
-                "REQUIRED ONE-TIME SETUP:\n" +
-                CLOUD_WORKFLOW_ADOPT_STEP +
-                "  - Install the local opencode host first: `bkit install --opencode=<provider>` (e.g. `--opencode=opencode`). The cloud opencode job runs against the committed `.opencode/` config — provider and model pins come from there, not from this YAML.\n" +
-                "  - Add `OPENCODE_PROVIDER_KEY` to repo secrets (Settings → Secrets and variables → Actions). Set it to your configured provider's API key. The workflow fans this one secret out to every supported provider env var name (`BKIT_OPENROUTER_API_KEY`/`BKIT_OLLAMA_API_KEY`/`BKIT_OPENCODE_API_KEY`) so the `.opencode/opencode.json` `{env:VAR}` reference resolves whichever provider you installed.\n" +
-                "  - GitHub Actions permissions — flip BOTH org AND repo: Settings → Actions → General → Workflow permissions = **Read and write permissions** + tick **Allow GitHub Actions to create and approve pull requests**.\n" +
-                "  - The opencode job does NOT use a Claude API key — it runs the opencode runner with your chosen provider key only. If you also install the claude job (separate secret), both jobs coexist on the same event.\n" +
-                "  - Label the issue `bkit:auto` before pushing the build commit — without the label the CI auto-route exits no-op.\n\n" +
-                "REACTIVE HANDLER (separate, consumer self-installed): the stock `/oc` comment handler (`opencode github install`) is NOT managed by bkit — install it once per repo independently. It mirrors the `@claude`/`claude.yml` stance. `bkit-cloud.yml` handles the CI-driven + `workflow_dispatch` path only.",
-        });
-    }
-    else {
-        // --- cloud=cursor: Linear-tracker path ---
-        // Record the variant.
-        setConsumerBkitField("cloud.agent", "cursor", dryRun);
-        // Advisory — cloud=cursor setup checklist.
-        advisories.push({
-            id: "bkit-cloud-setup",
-            severity: "advisory",
-            detect: "Cloud agents (cursor) need the Cursor Background Agent scaffolding, which ships as templates at `.bkit/templates/.cursor/Dockerfile` and `.bkit/templates/.cursor/environment.json`. The Cursor Background Agent trigger is configured in the Cursor cloud agents dashboard — bkit cannot automate that step.",
+    const trackerLines = trackerAdvisoryLines(ctx.issueTracker, variant);
+    const providerKey = ctx.opencodeProvider && isOpencodeProvider(ctx.opencodeProvider)
+        ? OPENCODE_PROVIDER_DEFAULTS[ctx.opencodeProvider].envVar
+        : "your configured provider's BKIT_ key";
+    const routerSetup = "Full recipe in bkit's `cloud.md` § Post-CI auto-routing.\n\n" +
+        "REQUIRED ONE-TIME SETUP:\n" +
+        CLOUD_WORKFLOW_ADOPT_STEP +
+        "  - GitHub Actions permissions — set org and repo Workflow permissions to **Read and write permissions** and tick **Allow GitHub Actions to create and approve pull requests**.\n";
+    const variants = {
+        claude: {
+            detect: "Cloud agents (claude) use the unified cloud workflow. It selects the recorded cloud agent and requires the Claude GitHub App for OIDC authentication.",
+            action: routerSetup +
+                "  - Run `/install-github-app` (Claude Code CLI) to install the Claude GitHub App. The action needs `id-token: write` for OIDC.\n" +
+                "  - Set the `BKIT_ANTHROPIC_API_KEY` repo secret, or configure keyless workload identity federation with the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables (optional `ANTHROPIC_SERVICE_ACCOUNT_ID` / `ANTHROPIC_WORKSPACE_ID`). Leave the API key unset to use federation.\n" +
+                trackerLines +
+                "\nOPTIONAL: after installing the App, mention `@claude /bkit-plan` on a GitHub issue or pull request. Vendor-native handlers are installed separately; bkit does not install them.",
+        },
+        opencode: {
+            detect: "Cloud agents (opencode) use the unified cloud workflow and the provider configured in the committed .opencode/ host.",
+            action: routerSetup +
+                "  - Install the local host: `bkit install --opencode=<provider>` (e.g. `--opencode=openrouter`). Commit its provider and model configuration.\n" +
+                `  - Add \`${providerKey}\` to repo Actions secrets for the configured provider.\n` +
+                trackerLines +
+                "\nThe stock `/oc` comment handler (`opencode github install`) is a separate vendor-native installation; bkit does not install it.",
+        },
+        codex: {
+            detect: "Cloud agents (codex) use the unified cloud workflow and openai/codex-action with the installed Codex host.",
+            action: routerSetup +
+                "  - Install the Codex host first: `bkit install --codex`. Copy the environment setup from `.codex/bkit-cloud.md` (gitignored).\n" +
+                "  - Add `BKIT_OPENAI_API_KEY` to repo Actions secrets. The router starts the codex job only when codex is the recorded agent and its credential is set.\n" +
+                trackerLines +
+                "\nVendor-native `@Codex` mentions and Codex for Linear are configured separately; bkit documents them and does not install them.",
+        },
+        cursor: {
+            detect: "Cloud agents (cursor) use the Cursor Cloud Agents dashboard triggers and the .cursor/ scaffolding templates.",
             action: "Full recipe in bkit's `cloud.md` § Post-CI auto-routing.\n\n" +
                 "IN CURSOR DASHBOARD:\n" +
                 "  - Cursor → Cloud Agents dashboard → Triggers → + Add trigger.\n" +
                 "  - Event: CI workflow completion. Branch filter: `feat/**`.\n" +
-                "  - Prompt (paste literally, no edits): `/bkit-auto $CI_STATUS $PR_NUMBER`.\n" +
-                "  - Allowed concurrency: latest-supersedes.\n" +
-                "  - Set `BKIT_LINEAR_API_KEY` as a **Runtime Secret** in the Cloud Agents dashboard (https://cursor.com/dashboard/cloud-agents) → your environment → Secrets tab.\n" +
-                "  - Label the issue `bkit:auto` in Linear before pushing the build commit.\n\n" +
-                "IN REPO (copy each template and own it; bkit never writes or overwrites these files, apart from brand migrations that rewrite exact shipped old names — see `.bkit/templates.md`):\n" +
-                "  - `.bkit/templates/.cursor/Dockerfile` → `.cursor/Dockerfile`: change Node major if `engines.node` differs from 20; add Playwright / Supabase CLI / extra apt deps.\n" +
-                "  - `.bkit/templates/.cursor/environment.json` → `.cursor/environment.json`: set `install` / `start` / `terminals[]` / `env` for your stack.",
-        });
-        // Advisory — cloud env scaffolding (Cursor half).
+                "  - Prompt: `/bkit-auto $CI_STATUS $PR_NUMBER`. Allowed concurrency: latest-supersedes.\n" +
+                trackerLines +
+                "\nIN REPO (copy each template and own it):\n" +
+                "  - `.bkit/templates/.cursor/Dockerfile` → `.cursor/Dockerfile`: match your Node major and add your stack's tools.\n" +
+                "  - `.bkit/templates/.cursor/environment.json` → `.cursor/environment.json`: configure install, start and terminal commands.",
+        },
+    };
+    setConsumerBkitField("cloud.agent", variant, dryRun);
+    advisories.push({ id: "bkit-cloud-setup", severity: "advisory", ...variants[variant] });
+    if (variant === "claude" || variant === "cursor") {
+        const environment = variant === "claude"
+            ? "Adopt `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` as `.claude/hooks/bkit-cloud-bootstrap.sh`. Configure the setup script and environment in the Claude app dashboard."
+            : "Configure the copied .cursor/Dockerfile and .cursor/environment.json, then add each token as a **Runtime Secret** in the Cursor Cloud Agents dashboard.";
         advisories.push({
             id: "cloud-env-customize",
             severity: "advisory",
-            detect: "Cloud env config splits across the repo (`.cursor/Dockerfile` + `.cursor/environment.json`, copied from `.bkit/templates/.cursor/`) and the Cursor Cloud Agents dashboard (secrets, manual).",
-            action: "Copy-paste-ready values (resolved from your `.envrc`) are written to `.cursor/bkit-cloud.md` (gitignored) on every install.\n\n" +
-                "IN THE CLOUD AGENTS DASHBOARD (https://cursor.com/dashboard/cloud-agents → your environment → Secrets tab) — add each as a **Runtime Secret** (loaded as an env var, redacted from the agent's transcript):\n" +
-                "  - `BKIT_GH_TOKEN`.\n" +
-                "  - Tracker secret (Linear): `BKIT_LINEAR_API_KEY` (generate at https://linear.app/settings/api). `LINEAR_ISSUE_ID` is injected per-session — don't hardcode.\n" +
-                "  - First session after Dockerfile changes rebuilds the image; subsequent sessions reuse cached layers.\n\n" +
-                "Full recipe in bkit's `cloud.md`; the paste-ready block is in `.cursor/bkit-cloud.md`.",
+            detect: `Cloud environment setup combines the repo templates and the ${variant} dashboard.`,
+            action: environment +
+                ` Copy-paste-ready values resolved from your .envrc are in .${variant}/bkit-cloud.md (gitignored).\n` +
+                trackerLines,
         });
     }
 }
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 2c89aff10..4273740f0 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -165,7 +165,7 @@ flowchart LR
     n_bkit_core_engine_checks["checks<br/>252 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
     n_bkit_core_engine_commands["commands<br/>1695 symbols · 51 files"]
-    n_bkit_core_engine_install["install<br/>308 symbols · 20 files"]
+    n_bkit_core_engine_install["install<br/>309 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>184 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>150 symbols · 13 files<br/>1 open finding"]
@@ -173,11 +173,11 @@ flowchart LR
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   n_bkit_core_engine_commands -->|385| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|367| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_commands -->|205| n_bkit_core_engine_install
-  n_bkit_core_engine_install -->|170| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|204| n_bkit_core_engine_install
+  n_bkit_core_engine_install -->|172| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|132| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|83| n_bkit_core_engine_checks
-  n_bkit_core_engine_install -->|61| n_bkit_core_engine_render
+  n_bkit_core_engine_install -->|64| n_bkit_core_engine_render
   n_bkit_core_engine_checks -->|56| n_bkit_core_engine_install
   n_bkit_core_engine_commands -->|42| n_bkit_core_engine_render
   n_bkit_core_engine_cli -->|34| n_bkit_core_engine_commands
@@ -191,7 +191,7 @@ flowchart LR
   n_bkit_core_engine_render -->|12| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|11| n_bkit_core_engine_ledgers
   n_bkit_core_engine_install -->|11| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_install -->|8| n_bkit_core_engine_cli
+  n_bkit_core_engine_install -->|10| n_bkit_core_engine_cli
   n_bkit_core_engine_cli -->|7| n_bkit_core_engine_install
   n_bkit_core_engine_render -->|7| n_bkit_core_engine_install
   n_bkit_core_engine_checks -->|6| n_bkit_core_engine_render
diff --git a/docs/failures.jsonl b/docs/failures.jsonl
index a055aa564..d91147dd0 100644
--- a/docs/failures.jsonl
+++ b/docs/failures.jsonl
@@ -264,3 +264,5 @@
 {"schema":3,"ts":1793862177351,"firstTs":1793862177351,"updates":1,"kind":"failure","key":"audit-deterministic-bookkeeping-validation-rejection-hard-stop","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"audit","step":"audit-deterministic-bookkeeping","subagent":"bkit-audit-generate","model":"gpt-6.1-sol"},"references":["docs/audits/202611/deterministic-bookkeeping.md","deterministic-bookkeeping-8","2d20c6522612e0bde8ce392a335d7d6ff9522988"],"category":"agentic","severity":"HIGH","summary":"Shared workflow recovery excludes correctable bookkeeping validation rejections","description":"Source-contract finding at .bkit/core/workflows/bkit-plan.md:16, :26 and :34, present across all six workflows: only named recovery applies before Failure Path. Ledger contract .bkit/core/.bkit/jsonl.md:65 guarantees validation exit 8 writes nothing, but generic ledger rejection has no correction route.","remediation":"Update shared clauses and six workflows: engine fills verified metadata first; after explicit recovery, correct guaranteed-no-write validation inputs with at most two retries across rewrites/tool switches/resume, verify and resume the same substep; reconcile uncertain effects and preserve authorization, semantic validation and required gates.","status":"OPEN"}
 {"schema":3,"ts":1793587536230,"firstTs":1793090478986,"updates":5,"kind":"failure","key":"instructions-corpus-store-timeout-under-full-gate","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate"},"references":["715","instructions-retired-clause-timeout-under-full-gate","814","719"],"category":"testing","summary":"instructions.test.ts \"the corpus matches the instructions store > has no findings\" timed out at 60s under the full gate, passed in isolation","severity":"LOW","description":"Seen again 2026-11-01 on feat/715-retire-lite-workflows after its rebase onto dev: `pnpm bkit:gate:static-unit-integration` (unit stage) reported `Test timed out in 60000ms` for the case after 93815ms. Run alone with cli-doc.test.ts it passed (103/103, 54.0s wall). Seen again 2026-11-02 on feat/719-cloud-variants-add at the group-1 gate (`pnpm bkit:gate:static-unit`), in three of four runs, with load average 24-33 on 10 cores: \"has no findings\" timed out (115s in the last run). Re-run alone, instructions.test.ts passed 96/96; with json-parse-owner.test.ts the pair passed 100/100 in 67s. `pnpm instructions:sync` rewrote nothing and the branch left the store and corpus unchanged.","rootCause":"the corpus-versus-store comparison walks the whole agent-read corpus and takes near its 60s budget in-repo; under a heavily loaded full parallel gate it exceeds it, while the store and corpus are unchanged and green","remediation":"give the corpus-comparison case an explicit longer per-test timeout, or reduce the corpus walk the gate performs","status":"TRIAGED"}
 {"schema":3,"ts":1793587536231,"firstTs":1793496030566,"updates":3,"kind":"failure","key":"json-parse-owner-audit-timeout-under-load","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate"},"references":["715","instructions-corpus-store-timeout-under-full-gate","814","719"],"category":"testing","summary":"json-parse-owner.test.ts \"no engine source parses JSON inside its own try\" timed out at 60s under the full gate, passed in isolation","severity":"LOW","description":"Seen 2026-11-01 on feat/715-retire-lite-workflows in `pnpm bkit:gate:static-unit-integration`, load average 28-40 on 10 cores: the case reported 60263ms and `Test timed out in 60000ms`. Run alone with disk.test.ts, both files passed 39/39 in 7.2s wall. Seen again 2026-11-02 on feat/719-cloud-variants-add in two of four group-1 gate runs (`pnpm bkit:gate:static-unit`), load average 24-33 on 10 cores: timed out at 60s. Re-run alone with instructions.test.ts the pair passed 100/100 in 67s; the branch left the audited sources unchanged.","rootCause":"the audit parses every engine source and runs near its 60s budget only when the machine is heavily loaded","remediation":"give the whole-tree audit case an explicit longer per-test timeout, or narrow the files it parses","status":"TRIAGED"}
+{"schema":3,"ts":1793869377736,"firstTs":1793869377736,"updates":1,"kind":"failure","key":"lib-output-limit-fixture-git-stdin-stall","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"code_group3","model":"gpt-6.1-sol"},"references":["719",".bkit/core/engine/commands/lib.test.ts:704","docs/plans/202610/logs/719-cloud-variants-add/build-plan-tasks-3-log.md"],"category":"correctness","severity":"MEDIUM","status":"OPEN","summary":"Changed gate stalled in synchronous Git stdin fixture for output-limit tests","description":"The single group-3 changed gate completed related tests in 332.50s (5167 passed, two failed), then stalled in named Vitest. Worker pid 14504 awaited git pid 18654, `git hash-object -w --stdin`, in bkit-lib-buf-AG7rnh for over five minutes. The child had only stdin/stdout/stderr Unix sockets open. The repoWithBlob helper at lib.test.ts:704 calls spawnSync with Buffer input and no subprocess timeout. The two candidate cases are `runGit keeps output past Node's 1MB default` (2MiB) and `runGit names ENOBUFS when output passes the limit` (64MiB plus 1024); the reporter does not identify which was active. Named-stage budgets were 8450ms/test and 16900ms/hook. Cancelled only the own gate through its session with Ctrl-C, exit130, after over 14 minutes. Static stages did not run.","rootCause":"Unconfirmed. Observed a synchronous fixture subprocess wait that exceeded test budgets; no production root cause established.","remediation":"Investigate the fixture stdin/spawnSync interaction and bounded subprocess termination separately. Preserve this as an observed incomplete check; do not mark the gate passing or repeat the broad gate to hide the stall."}
+{"schema":3,"ts":1793874232298,"firstTs":1793869377736,"updates":2,"kind":"failure","key":"lib-output-limit-fixture-git-stdin-stall","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/commands/lib.test.ts:704","docs/plans/202610/logs/719-cloud-variants-add/build-plan-gaps-remediate-3-1-log.md"],"category":"testing","severity":"MEDIUM","status":"OPEN","summary":"Changed gate stalled in synchronous Git stdin fixture for output-limit tests","description":"Prior named-stage worker waited over five minutes on git hash-object -w --stdin in repoWithBlob; exact active case was not identified. Remediation targeted all five existing runGit / runTool output-limit cases under the repository sleep-prevention wrapper and they passed in 3.35 seconds without any source or test change. The 64 excluded cases were selected out by the test-name filter, not disabled in code. This targeted success does not prove the wider interrupted gate passed or identify a production root cause.","rootCause":"Unconfirmed; the synchronous fixture stall did not reproduce in the targeted output-limit suite.","remediation":"Preserve the observed failure and investigate with bounded subprocess evidence if it recurs; do not introduce an unproven source fix or count a targeted pass as the missing wider verification."}
