diff --git a/.bkit/core/engine/commands/install/upgrade.ts b/.bkit/core/engine/commands/install/upgrade.ts
index a5a193a12..a73e9d5e8 100644
--- a/.bkit/core/engine/commands/install/upgrade.ts
+++ b/.bkit/core/engine/commands/install/upgrade.ts
@@ -70,6 +70,7 @@ import {
   writeCodexCloudDoc,
   writeCursorCloudDoc,
   writeCursorCliPermissionsArtifact,
+  resolveClaudeDerivedAllows,
 } from "../../install/cloud-env.js";
 import {
   syncTemplateCopies,
@@ -377,7 +378,14 @@ export function runUpgrade(candidates: UpgradeCandidate[], options: UpgradeOptio
             jsonSrc = jsonTmp;
           }
           try {
-            writeTier2JsonContained(jsonSrc, absolutePath, options.dryRun, ws);
+            writeTier2JsonContained(
+              jsonSrc,
+              absolutePath,
+              options.dryRun,
+              ws,
+              undefined,
+              resolveClaudeDerivedAllows(cwd),
+            );
           } finally {
             if (jsonTmp) {
               try {
diff --git a/.bkit/core/engine/install/modules/claude.integration.test.ts b/.bkit/core/engine/install/modules/claude.integration.test.ts
index 10a6f7e29..d6f87c4cd 100644
--- a/.bkit/core/engine/install/modules/claude.integration.test.ts
+++ b/.bkit/core/engine/install/modules/claude.integration.test.ts
@@ -215,6 +215,25 @@ describe("runClaudeModule dry run reports retired settings entries", () => {
     expect(found[0]!.detect).toContain(edited);
     expect(found[0]!.detect).toMatch(/kept|edited/);
   });
+
+  it("keeps a retired value the mcp-servers block derives and records no drift on the next dry run", () => {
+    fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
+    fs.writeFileSync(
+      path.join(tmpDir, ".agents", "context.md"),
+      "<!-- bkit:end -->\n<!-- mcp-servers:start -->\nLinear\n<!-- mcp-servers:end -->\n",
+      "utf-8",
+    );
+    const dst = seedSettings(["Bash(ls)"]);
+    runClaudeModule(makeCtx());
+    const allow = (
+      JSON.parse(fs.readFileSync(dst, "utf-8")) as { permissions: { allow: string[] } }
+    ).permissions.allow;
+    expect(allow).toContain(RETIRED);
+    const ctx = makeCtx({ dryRun: true });
+    runClaudeModule(ctx);
+    expect(ctx.ws.writes.some((w) => w.path.endsWith(".claude/settings.json"))).toBe(false);
+    expect(retiredAdvisories(ctx)).toHaveLength(0);
+  });
 });
 
 // ---------------------------------------------------------------------------
diff --git a/.bkit/core/engine/install/modules/claude.ts b/.bkit/core/engine/install/modules/claude.ts
index 4f01f13b9..a3c794107 100644
--- a/.bkit/core/engine/install/modules/claude.ts
+++ b/.bkit/core/engine/install/modules/claude.ts
@@ -107,7 +107,14 @@ export function runClaudeModule(ctx: ModuleContext): void {
   const settingsDst = ".claude/settings.json";
   if (fs.existsSync(settingsSrc)) {
     const prevLen = ws.writes.length;
-    writeTier2JsonContained(settingsSrc, settingsDst, dryRun, ws, advisories);
+    writeTier2JsonContained(
+      settingsSrc,
+      settingsDst,
+      dryRun,
+      ws,
+      advisories,
+      resolveClaudeDerivedAllows(process.cwd()),
+    );
     ctx.claudeAllowRecorded = enrichClaudeSettingsAllows(
       settingsDst,
       process.cwd(),
diff --git a/.bkit/core/engine/install/write.test.ts b/.bkit/core/engine/install/write.test.ts
index 2506f66ed..8793c9015 100644
--- a/.bkit/core/engine/install/write.test.ts
+++ b/.bkit/core/engine/install/write.test.ts
@@ -985,6 +985,17 @@ describe("retired settings entries — find and prune", () => {
     expect(allowOf(other)).toContain(RETIRED_LINEAR);
   });
 
+  it("does not remove a deny rule named by an injected retired list", () => {
+    const doc = { permissions: { deny: ["Bash(rm -rf ~/*)", "Bash(mine)"] } };
+    const list = [
+      { file: ".claude/settings.json", path: "permissions.deny", value: "Bash(rm -rf ~/*)" },
+    ];
+    expect(() =>
+      pruneRetiredSettingsEntries(".claude/settings.json", doc as JsonValue, list),
+    ).toThrow(/permissions\.deny/);
+    expect(doc.permissions.deny).toEqual(["Bash(rm -rf ~/*)", "Bash(mine)"]);
+  });
+
   it("prunes a retired entry in any host file the list names", () => {
     const doc = { permissions: { allow: ["retired-codex-entry", "keep"] } };
     const out = pruneRetiredSettingsEntries(".codex/hooks.json", doc as JsonValue, CODEX_LIST);
diff --git a/.bkit/core/engine/install/write.ts b/.bkit/core/engine/install/write.ts
index f27068c28..22454690a 100644
--- a/.bkit/core/engine/install/write.ts
+++ b/.bkit/core/engine/install/write.ts
@@ -366,6 +366,15 @@ export const RETIRED_SETTINGS_ENTRIES: readonly RetiredSettingsEntry[] = [
   { file: ".claude/settings.json", path: "permissions.allow", value: "mcp__claude_ai_Linear__*" },
 ];
 
+/** Only `permissions.allow` entries can be retired; a deny or ask rule is never taken back. */
+function assertRetirableEntry(entry: RetiredSettingsEntry): void {
+  if (entry.path !== "permissions.allow") {
+    throw new Error(
+      `[bkit] retired settings entry "${entry.value}" names ${entry.path}; only permissions.allow entries can be retired`,
+    );
+  }
+}
+
 function matchesRetiredFile(rel: string, file: string): boolean {
   const norm = rel.replace(/\\/g, "/");
   return norm === file || norm.endsWith("/" + file);
@@ -397,6 +406,7 @@ export function findRetiredSettingsEntries(
   const retired: RetiredSettingsFinding[] = [];
   const edited: RetiredSettingsFinding[] = [];
   for (const entry of list) {
+    assertRetirableEntry(entry);
     if (!matchesRetiredFile(rel, entry.file)) continue;
     const held = arrayAt(doc, entry.path);
     if (!held) continue;
@@ -420,6 +430,7 @@ export function pruneRetiredSettingsEntries(
 ): JsonValue {
   let out = doc;
   for (const entry of list) {
+    assertRetirableEntry(entry);
     if (!matchesRetiredFile(rel, entry.file)) continue;
     const keys = entry.path.split(".");
     const walk = (node: JsonValue, i: number): JsonValue => {
@@ -457,6 +468,8 @@ export function writeTier2JsonContained(
   dryRun: boolean,
   ws: WriteSet,
   advisories?: PreflightFinding[],
+  /** Values bkit derives into this file at install time; never pruned or reported as retired. */
+  derivedKeep: readonly string[] = [],
 ): void {
   const srcRaw = fs.readFileSync(srcPath, "utf-8");
   const templateRead = parseJson(srcRaw);
@@ -489,9 +502,15 @@ export function writeTier2JsonContained(
   const existing = existingRead.value as Record<string, JsonValue>;
 
   // Take back entries a release retired, and warn about edited variants that stay.
-  const pruned = pruneRetiredSettingsEntries(dstPath, existing as JsonValue);
+  const liveList = RETIRED_SETTINGS_ENTRIES.filter((e) => !derivedKeep.includes(e.value));
+  const pruned = pruneRetiredSettingsEntries(dstPath, existing as JsonValue, liveList);
   const prunedChanged = JSON.stringify(pruned) !== JSON.stringify(existing);
-  const found = findRetiredSettingsEntries(dstPath, existing as JsonValue, template as JsonValue);
+  const found = findRetiredSettingsEntries(
+    dstPath,
+    existing as JsonValue,
+    template as JsonValue,
+    liveList,
+  );
   if (advisories) {
     if (found.retired.length > 0 || found.edited.length > 0) {
       const parts: string[] = [];
diff --git a/dist/commands/install/upgrade.js b/dist/commands/install/upgrade.js
index 6d97d3be8..de060a2f1 100644
--- a/dist/commands/install/upgrade.js
+++ b/dist/commands/install/upgrade.js
@@ -38,7 +38,7 @@ import { detectInstalledHostModules } from "../../install/hosts.js";
 import { detectInstalledModules } from "./check.js";
 import { remapTemplateDest } from "../../install/template-copies.js";
 import { syncProjectDocs } from "../../install/project-docs.js";
-import { CLAUDE_CLOUD_RELPATH, CODEX_CLOUD_RELPATH, CURSOR_CLOUD_RELPATH, writeClaudeCloudDoc, writeCodexCloudDoc, writeCursorCloudDoc, writeCursorCliPermissionsArtifact, } from "../../install/cloud-env.js";
+import { CLAUDE_CLOUD_RELPATH, CODEX_CLOUD_RELPATH, CURSOR_CLOUD_RELPATH, writeClaudeCloudDoc, writeCodexCloudDoc, writeCursorCloudDoc, writeCursorCliPermissionsArtifact, resolveClaudeDerivedAllows, } from "../../install/cloud-env.js";
 import { syncTemplateCopies, formatTemplateChanges, warnMissingLintStagedConfig, } from "../../install/template-copies.js";
 import { formatPayloadLinkChanges, syncPayloadLinks } from "../../install/payload-links.js";
 import { renderOpencodeJson, reconcileOpencodeJson } from "../../install/modules/opencode.js";
@@ -207,7 +207,7 @@ export function runUpgrade(candidates, options) {
                         jsonSrc = jsonTmp;
                     }
                     try {
-                        writeTier2JsonContained(jsonSrc, absolutePath, options.dryRun, ws);
+                        writeTier2JsonContained(jsonSrc, absolutePath, options.dryRun, ws, undefined, resolveClaudeDerivedAllows(cwd));
                     }
                     finally {
                         if (jsonTmp) {
diff --git a/dist/install/modules/claude.js b/dist/install/modules/claude.js
index 555a3a80a..a292f13ca 100644
--- a/dist/install/modules/claude.js
+++ b/dist/install/modules/claude.js
@@ -79,7 +79,7 @@ export function runClaudeModule(ctx) {
     const settingsDst = ".claude/settings.json";
     if (fs.existsSync(settingsSrc)) {
         const prevLen = ws.writes.length;
-        writeTier2JsonContained(settingsSrc, settingsDst, dryRun, ws, advisories);
+        writeTier2JsonContained(settingsSrc, settingsDst, dryRun, ws, advisories, resolveClaudeDerivedAllows(process.cwd()));
         ctx.claudeAllowRecorded = enrichClaudeSettingsAllows(settingsDst, process.cwd(), dryRun, ws, advisories);
         if (ws.writes.length > prevLen) {
             console.log(`${logPrefix} ${tag}claude: ${settingsDst}`);
diff --git a/dist/install/write.js b/dist/install/write.js
index 0266b6589..04e01a1d3 100644
--- a/dist/install/write.js
+++ b/dist/install/write.js
@@ -277,6 +277,12 @@ export const RETIRED_SETTINGS_ENTRIES = [
     // v3.0.0-v5.4.0, dropped in v5.5.0.
     { file: ".claude/settings.json", path: "permissions.allow", value: "mcp__claude_ai_Linear__*" },
 ];
+/** Only `permissions.allow` entries can be retired; a deny or ask rule is never taken back. */
+function assertRetirableEntry(entry) {
+    if (entry.path !== "permissions.allow") {
+        throw new Error(`[bkit] retired settings entry "${entry.value}" names ${entry.path}; only permissions.allow entries can be retired`);
+    }
+}
 function matchesRetiredFile(rel, file) {
     const norm = rel.replace(/\\/g, "/");
     return norm === file || norm.endsWith("/" + file);
@@ -295,6 +301,7 @@ export function findRetiredSettingsEntries(rel, doc, template, list = RETIRED_SE
     const retired = [];
     const edited = [];
     for (const entry of list) {
+        assertRetirableEntry(entry);
         if (!matchesRetiredFile(rel, entry.file))
             continue;
         const held = arrayAt(doc, entry.path);
@@ -318,6 +325,7 @@ export function findRetiredSettingsEntries(rel, doc, template, list = RETIRED_SE
 export function pruneRetiredSettingsEntries(rel, doc, list = RETIRED_SETTINGS_ENTRIES) {
     let out = doc;
     for (const entry of list) {
+        assertRetirableEntry(entry);
         if (!matchesRetiredFile(rel, entry.file))
             continue;
         const keys = entry.path.split(".");
@@ -351,7 +359,9 @@ export function pruneRetiredSettingsEntries(rel, doc, list = RETIRED_SETTINGS_EN
 //   - dest present, malformed JSON → throw; the consumer fixes it by hand
 //   - schemaFlipped: true when a path value changed type during deep-merge
 // ---------------------------------------------------------------------------
-export function writeTier2JsonContained(srcPath, dstPath, dryRun, ws, advisories) {
+export function writeTier2JsonContained(srcPath, dstPath, dryRun, ws, advisories, 
+/** Values bkit derives into this file at install time; never pruned or reported as retired. */
+derivedKeep = []) {
     const srcRaw = fs.readFileSync(srcPath, "utf-8");
     const templateRead = parseJson(srcRaw);
     if (!templateRead.ok) {
@@ -378,9 +388,10 @@ export function writeTier2JsonContained(srcPath, dstPath, dryRun, ws, advisories
     }
     const existing = existingRead.value;
     // Take back entries a release retired, and warn about edited variants that stay.
-    const pruned = pruneRetiredSettingsEntries(dstPath, existing);
+    const liveList = RETIRED_SETTINGS_ENTRIES.filter((e) => !derivedKeep.includes(e.value));
+    const pruned = pruneRetiredSettingsEntries(dstPath, existing, liveList);
     const prunedChanged = JSON.stringify(pruned) !== JSON.stringify(existing);
-    const found = findRetiredSettingsEntries(dstPath, existing, template);
+    const found = findRetiredSettingsEntries(dstPath, existing, template, liveList);
     if (advisories) {
         if (found.retired.length > 0 || found.edited.length > 0) {
             const parts = [];
