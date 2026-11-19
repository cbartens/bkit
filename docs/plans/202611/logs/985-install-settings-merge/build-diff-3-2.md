diff --git a/.bkit/core/.bkit/install.md b/.bkit/core/.bkit/install.md
index 9fc3fcaeb..962fb2f15 100644
--- a/.bkit/core/.bkit/install.md
+++ b/.bkit/core/.bkit/install.md
@@ -221,7 +221,7 @@ In this example, `hooks.SessionStart` is bkit-declared scope (from the template)
 
 - Consumer keys outside the template tree survive every `bkit install` byte-identically.
 - `bkit install` uses `deepContains(template, consumer)`, which checks that every template leaf is present. On drift, it deep-merges with the template winning, and consumer-only siblings are preserved.
-- Lists merge too. A list of plain values (such as `permissions.allow`) keeps the template's entries in template order, then appends consumer-only entries. Before the merge, bkit removes each exact entry on its retired list (`RETIRED_SETTINGS_ENTRIES`, registered in `docs/migrations.md`); an edited copy no longer matches, so it is kept and the output warns. A list of objects (hook groups) replaces a consumer group that holds a hook `command` the template group also holds, and keeps every other consumer group after the template's groups. A second install is a no-op.
+- Lists merge too. A list of plain values (such as `permissions.allow`) keeps the template's entries in template order, then appends consumer-only entries. Before the merge, bkit removes each exact entry on its retired list (`RETIRED_SETTINGS_ENTRIES`, registered in `docs/migrations.md`); an edited copy no longer matches, so it is kept and the output warns. A retired value that the `mcp-servers` block derives is kept and not reported. Only `permissions.allow` entries may be listed; any other path throws. A list of objects (hook groups) replaces a consumer group that holds a hook `command` the template group also holds, and keeps every other consumer group after the template's groups. A second install is a no-op.
 - `bkit check` surfaces the `tier2-json-drift` advisory when `deepContains` fails, and exits 1 (CI drift gate). It writes nothing. The consumer reviews and re-runs `bkit install` to reconverge.
 - `.cursor/hooks.json` uses Cursor v1 keyed-object schema: `{"version": 1, "hooks": {"sessionStart": [...], "sessionStop": [...]}}`.
 
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
diff --git a/.bkit/install.md b/.bkit/install.md
index be665a306..e08030224 100644
--- a/.bkit/install.md
+++ b/.bkit/install.md
@@ -221,7 +221,7 @@ In this example, `hooks.SessionStart` is bkit-declared scope (from the template)
 
 - Consumer keys outside the template tree survive every `bkit install` byte-identically.
 - `bkit install` uses `deepContains(template, consumer)`, which checks that every template leaf is present. On drift, it deep-merges with the template winning, and consumer-only siblings are preserved.
-- Lists merge too. A list of plain values (such as `permissions.allow`) keeps the template's entries in template order, then appends consumer-only entries. Before the merge, bkit removes each exact entry on its retired list (`RETIRED_SETTINGS_ENTRIES`, registered in `docs/migrations.md`); an edited copy no longer matches, so it is kept and the output warns. A list of objects (hook groups) replaces a consumer group that holds a hook `command` the template group also holds, and keeps every other consumer group after the template's groups. A second install is a no-op.
+- Lists merge too. A list of plain values (such as `permissions.allow`) keeps the template's entries in template order, then appends consumer-only entries. Before the merge, bkit removes each exact entry on its retired list (`RETIRED_SETTINGS_ENTRIES`, registered in `docs/migrations.md`); an edited copy no longer matches, so it is kept and the output warns. A retired value that the `mcp-servers` block derives is kept and not reported. Only `permissions.allow` entries may be listed; any other path throws. A list of objects (hook groups) replaces a consumer group that holds a hook `command` the template group also holds, and keeps every other consumer group after the template's groups. A second install is a no-op.
 - `bkit check` surfaces the `tier2-json-drift` advisory when `deepContains` fails, and exits 1 (CI drift gate). It writes nothing. The consumer reviews and re-runs `bkit install` to reconverge.
 - `.cursor/hooks.json` uses Cursor v1 keyed-object schema: `{"version": 1, "hooks": {"sessionStart": [...], "sessionStop": [...]}}`.
 
diff --git a/.bkit/version b/.bkit/version
index 325aa4c39..a2e8077d6 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -206,7 +206,7 @@
     "docs/templates/bkit-audit-adoption.md": "e5c51a0e1b815044a83c405af7ce1e51e5690c99b937a61a7e3fcc2fddc8fe7f",
     ".bkit/cloud.md": "945c4abe584a15aeca979d5e13b2ea5f8915c5198dc8dd9226b1d020118c4c7d",
     ".bkit/comparison.md": "8d62c438ca6293483e6c752e9864d8123a0fa642906dfb15bc08b09a3b224b92",
-    ".bkit/install.md": "ec098854b8abbe42c3e71c6ab864ebb3d3e0f339ee2a9844fab7910a885f030a",
+    ".bkit/install.md": "3e48e176049a69fb81c08d34ab58326fb576683d1ee32d9b37ade23fae1f9cb1",
     ".bkit/jsonl.md": "2ee43214c4fa16717bfe932463f3a311a22caa40569f24f71e6bd23b6942459c",
     ".bkit/providers.md": "cd84350a719e69837d96a698fe5597f98c79785d3e4079cb1867fbcf4901430e",
     ".bkit/prompts.md": "2ac9bdc011d81372cbebcdb914815f02140c91d82dfb79a1bdbb72875d48d852",
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
diff --git a/docs/migrations.md b/docs/migrations.md
index 6c780871a..b9db7c914 100644
--- a/docs/migrations.md
+++ b/docs/migrations.md
@@ -44,7 +44,7 @@
 | Vale style `House` → `Bkit` | `.bkit/core/engine/install/modules/core.ts` (`migrateValeHouseStyle`, `SHIPPED_HOUSE_RULE_HASHES`, called by `runBkitDocs`) | `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml` matching a shipped release move to `.vale/styles/Bkit/` when absent; an edited rule, a taken target or a symlinked rule stays with a warning naming the manual move; a symlinked `.vale`, `.vale/styles`, `House` or `Bkit` directory leaves the rules unmoved with a warning. `.vale.ini` `House.<moved>` → `Bkit.<moved>`; `BasedOnStyles` swaps `House` for `Bkit` once `House/` is empty (directory removed), else appends `Bkit`. Own rules stay, including an own entry named like a moved rule without `.yml` (a `Filler/` folder). Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 | Slop plugin ignores inert skip text | `.bkit/core/engine/install/modules/core.ts` (`migrateSlopTypeSuppression`, `RETIRED_SLOP_PLUGIN_HASH`, called by `runBkitDocs`) | `scripts/slop/bkit-slop-type-suppression.mjs` byte-identical to the shipped v6.0.0 template → replaced with the current template. An edited copy, a non-file or a symlinked path stays with a warning to merge `.bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs` by hand. An absent or current copy stays untouched. Dry run records the same update without writing; `unhashed` keeps the copy consumer-owned. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` (fixture `tests/fixtures/slop-6.0.0/`) |
 | Project docs moved out of managed ownership | `.bkit/core/engine/install/project-docs.ts` (`syncProjectDocs`, `LEGACY_STARTER_DIGEST_HISTORY`), `.bkit/core/engine/install/managed-block.ts` (`stripManagedWrapper`); called by `runInstall` and `runUpgradeCommand` | `docs/{architecture,technology,security,data-schema,testing,deployments,observability,design,noise,setup}.md` carrying the `<!-- bkit:start -->` / `<!-- bkit:end -->` lines and the `bkit:managed` notice → those lines (and one padding blank line each) removed, every other byte kept, CRLF included. Ambiguous wrappers (missing partner, inverted, repeated, inside a code fence) and symlinked or non-file paths are kept and reported. Then `.agents/docs.md` `## Project Documents` gains a row per present default doc whose indexed equivalent row is absent, out of tree or unsafe (an equivalent is the same basename or a Scope naming "Equivalent to docs/x.md"; skipped equivalents are printed); an unreadable index is left byte-for-byte with a warning. Dry run reports the same writeset. | 5.0.0-6.1.x (every released starter, branch-agnostic normalization) | `.bkit/core/engine/install/project-docs.test.ts`; `.bkit/core/engine/install/managed-block.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
-| Retired settings entries removed | `.bkit/core/engine/install/write.ts` (`RETIRED_SETTINGS_ENTRIES`, `findRetiredSettingsEntries`, `pruneRetiredSettingsEntries`, called by `writeTier2JsonContained`) | `mcp__claude_ai_Linear__*` in `permissions.allow` of `.claude/settings.json` → removed before the list merge; shipped `v3.0.0` through `v5.4.0`, dropped in `v5.5.0` (`f57bc5942`). An edited copy (for example `mcp__claude_ai_Linear__get_issue`) no longer matches, so it is kept and install / upgrade warns; `bkit check` names a retired or edited entry (`retired-settings-entry`). Add one list line and one row here per later retired entry. | up to 5.4.x | `.bkit/core/engine/install/write.test.ts` (`mergeManagedJson`, `writeTier2JsonContained`, list-versus-migrations test); `.bkit/core/engine/install/modules/claude.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
+| Retired settings entries removed | `.bkit/core/engine/install/write.ts` (`RETIRED_SETTINGS_ENTRIES`, `findRetiredSettingsEntries`, `pruneRetiredSettingsEntries`, called by `writeTier2JsonContained`) | `mcp__claude_ai_Linear__*` in `permissions.allow` of `.claude/settings.json` → removed before the list merge; shipped `v3.0.0` through `v5.4.0`, dropped in `v5.5.0` (`f57bc5942`). An edited copy (for example `mcp__claude_ai_Linear__get_issue`) no longer matches, so it is kept and install / upgrade warns; `bkit check` names a retired or edited entry (`retired-settings-entry`). A value that `resolveClaudeDerivedAllows` derives (a `Linear` row in the `mcp-servers` block) is kept and not reported. Only `permissions.allow` entries may be listed; any other path throws, naming the value and its path. Add one list line and one row here per later retired entry. | up to 5.4.x | `.bkit/core/engine/install/write.test.ts` (`mergeManagedJson`, `writeTier2JsonContained`, list-versus-migrations test); `.bkit/core/engine/install/modules/claude.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 
 ## Detect-only guards
 
diff --git a/docs/testing.md b/docs/testing.md
index 6b4dff1d6..5aed04a9d 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -903,8 +903,8 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `.bkit/core/engine/commands/install/uninstall.integration.test.ts` | Integration | Round-trip byte-identity vs `tests/fixtures/heavy-customised-consumer/`; OpenCode uninstall zero-footprint (P4.T7); a real install, reinstall and uninstall keep a hand-added grant equal to a derived one and remove the grants bkit added. |
 | `.bkit/core/engine/install/manifest.test.ts` | Unit | Per-module install-write manifest assertions. |
 | `.bkit/core/engine/install/write.integration.test.ts` | Integration | Consumer key survival through `writeTier2JsonContained` (inline consumer settings, cursor v1 schema); OpenCode reconverge. |
-| `.bkit/core/engine/install/write.test.ts` (`mergeManagedJson`) | Unit | List merge in a drifted managed JSON file: plain-value lists keep the template's entries in template order then consumer-only entries; hook-group lists replace a consumer group that holds a hook `command` the template group holds and keep every other consumer group; a consumer hook inside a bkit group survives; a second merge is a no-op. Retired settings entries (`RETIRED_SETTINGS_ENTRIES`): the exact entry is removed with the person's entries untouched, an edited copy is kept with a warning, and every list entry has a `docs/migrations.md` row naming its source tags. |
-| `.bkit/core/engine/install/modules/claude.integration.test.ts` (retired settings entries) | Integration | A dry run over a `.claude/settings.json` holding a retired grant records the file as drift and pushes one `retired-settings-entry` advisory naming it; a clean file records neither; an edited copy is named as kept. |
+| `.bkit/core/engine/install/write.test.ts` (`mergeManagedJson`) | Unit | List merge in a drifted managed JSON file: plain-value lists keep the template's entries in template order then consumer-only entries; hook-group lists replace a consumer group that holds a hook `command` the template group holds and keep every other consumer group; a consumer hook inside a bkit group survives; a second merge is a no-op. Retired settings entries (`RETIRED_SETTINGS_ENTRIES`): the exact entry is removed with the person's entries untouched, an edited copy is kept with a warning, and every list entry has a `docs/migrations.md` row naming its source tags; a deny rule named by an injected retired list is not removed and throws (`does not remove a deny rule named by an injected retired list`). |
+| `.bkit/core/engine/install/modules/claude.integration.test.ts` (retired settings entries) | Integration | A dry run over a `.claude/settings.json` holding a retired grant records the file as drift and pushes one `retired-settings-entry` advisory naming it; a clean file records neither; an edited copy is named as kept; a retired value the `mcp-servers` block derives is kept and records no drift on the next dry run (`keeps a retired value the mcp-servers block derives and records no drift on the next dry run`). |
 | `.bkit/core/engine/commands/install/upgrade.test.ts` and `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | Unit and Integration | Diff engine, drift detection, `--auto-apply` semantics. Managed-version marker guard: every non-JSON, non-template file a real full install writes carries the marker and equals `listStampedFiles`; a version bump restamps every marker with no conflict and `bkit check` is then clean. A 5.1.0 Antigravity `hooks.json` (fixture `tests/fixtures/antigravity-5.1.0/hooks.json`) upgrades onto the shipped matchers (guardrails on `view_file\|run_command`). The self-bump starts `PACKAGE_RUNNER` (stub on `PATH`) for `add -D` and the re-exec. An upgrade from a 5.2.4 `.bkit/lite.md` retires the managed block and keeps the consumer section. An upgrade over a settings file holding a retired grant removes it and keeps the person's entries. |
 | `.bkit/core/engine/install/network-allowlist.test.ts` | Unit | `writeNetworkAllowlist`: writes `.bkit/allowlist.json` from the egress registry plus consumer `allowed-domains`, idempotent, dry-run records the same writeset, regenerates a hand edit whole; removes a `.cursor/allowlist.json` only when `.bkit/version` records it. |
 | `.bkit/core/engine/install/template-notes.test.ts` | Unit | `migrateTemplateNotes`: removes bkit's old `<!-- Note: … -->` line above `<!-- bkit:start -->` in installed `docs/templates/bkit-*.md` only when its text matches one of the 7 shipped wordings, table-driven over the exact wordings from history, and the hash set must equal `RETIRED_TEMPLATE_NOTE_HASHES`. Also covers CRLF on the lines above the block only, a leading byte-order mark kept, and a file with CRLF throughout, two start markers, or the note below the block left unchanged. Keeps the consumer's own lines and own note silently; keeps an edited bkit note and prints one line naming the file, once across a dry run and a real run, with `…` only when the line is cut. Skips a symlinked template, leaves a migrated file and the consumer's own templates untouched, ignores a missing folder, idempotent, dry-run records the same writeset. |
