diff --git a/.bkit/core/.bkit/install.md b/.bkit/core/.bkit/install.md
index c93f5c7c2..9fc3fcaeb 100644
--- a/.bkit/core/.bkit/install.md
+++ b/.bkit/core/.bkit/install.md
@@ -221,7 +221,7 @@ In this example, `hooks.SessionStart` is bkit-declared scope (from the template)
 
 - Consumer keys outside the template tree survive every `bkit install` byte-identically.
 - `bkit install` uses `deepContains(template, consumer)`, which checks that every template leaf is present. On drift, it deep-merges with the template winning, and consumer-only siblings are preserved.
-- Lists merge too. A list of plain values (such as `permissions.allow`) keeps the template's entries in template order, then appends consumer-only entries. A list of objects (hook groups) replaces a consumer group that holds a hook `command` the template group also holds, and keeps every other consumer group after the template's groups. A second install is a no-op.
+- Lists merge too. A list of plain values (such as `permissions.allow`) keeps the template's entries in template order, then appends consumer-only entries. Before the merge, bkit removes each exact entry on its retired list (`RETIRED_SETTINGS_ENTRIES`, registered in `docs/migrations.md`); an edited copy no longer matches, so it is kept and the output warns. A list of objects (hook groups) replaces a consumer group that holds a hook `command` the template group also holds, and keeps every other consumer group after the template's groups. A second install is a no-op.
 - `bkit check` surfaces the `tier2-json-drift` advisory when `deepContains` fails, and exits 1 (CI drift gate). It writes nothing. The consumer reviews and re-runs `bkit install` to reconverge.
 - `.cursor/hooks.json` uses Cursor v1 keyed-object schema: `{"version": 1, "hooks": {"sessionStart": [...], "sessionStop": [...]}}`.
 
diff --git a/.bkit/core/engine/install/modules/antigravity.ts b/.bkit/core/engine/install/modules/antigravity.ts
index 6c8b6fae7..93cc4b26b 100644
--- a/.bkit/core/engine/install/modules/antigravity.ts
+++ b/.bkit/core/engine/install/modules/antigravity.ts
@@ -168,7 +168,7 @@ export function runAntigravityModule(ctx: ModuleContext): void {
     if (fs.existsSync(jsonSrc)) {
       if (!dryRun) ensureDir(path.dirname(jsonDst));
       const prevLen = ws.writes.length;
-      writeTier2JsonContained(jsonSrc, jsonDst, dryRun, ws);
+      writeTier2JsonContained(jsonSrc, jsonDst, dryRun, ws, advisories);
       if (ws.writes.length > prevLen) console.log(`${logPrefix} ${tag}antigravity: ${jsonDst}`);
     }
   }
@@ -193,7 +193,7 @@ export function runAntigravityModule(ctx: ModuleContext): void {
     if (fs.existsSync(jsonSrc)) {
       if (!dryRun) ensureDir(path.dirname(jsonDst));
       const prevLen = ws.writes.length;
-      writeTier2JsonContained(jsonSrc, jsonDst, dryRun, ws);
+      writeTier2JsonContained(jsonSrc, jsonDst, dryRun, ws, advisories);
       if (ws.writes.length > prevLen) console.log(`${logPrefix} ${tag}antigravity: ${jsonDst}`);
     }
   }
diff --git a/.bkit/core/engine/install/modules/claude.integration.test.ts b/.bkit/core/engine/install/modules/claude.integration.test.ts
index 6e0690c9d..10a6f7e29 100644
--- a/.bkit/core/engine/install/modules/claude.integration.test.ts
+++ b/.bkit/core/engine/install/modules/claude.integration.test.ts
@@ -168,6 +168,55 @@ describe("runClaudeModule preserves consumer settings through deep-containment",
   });
 });
 
+describe("runClaudeModule dry run reports retired settings entries", () => {
+  const RETIRED = "mcp__claude_ai_Linear__*";
+
+  function seedSettings(allow: string[]): string {
+    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
+    const dst = path.join(tmpDir, ".claude", "settings.json");
+    fs.writeFileSync(dst, JSON.stringify({ permissions: { allow } }, null, 2) + "\n", "utf-8");
+    return dst;
+  }
+
+  function retiredAdvisories(ctx: ModuleContext): PreflightFinding[] {
+    return ctx.advisories.filter((a) => a.id === "retired-settings-entry");
+  }
+
+  it("dry run over a seeded old-shape settings file reports the file as drift and names the retired entry", () => {
+    const dst = seedSettings(["Bash(ls)", RETIRED, "mcp__mine__*"]);
+    const before = fs.readFileSync(dst, "utf-8");
+    const ctx = makeCtx({ dryRun: true });
+    runClaudeModule(ctx);
+    expect(fs.readFileSync(dst, "utf-8")).toBe(before);
+    expect(ctx.ws.writes.some((w) => w.path.endsWith(".claude/settings.json"))).toBe(true);
+    const found = retiredAdvisories(ctx);
+    expect(found).toHaveLength(1);
+    expect(found[0]!.severity).toBe("advisory");
+    expect(found[0]!.detect).toContain(RETIRED);
+    expect(found[0]!.detect).toContain(".claude/settings.json");
+  });
+
+  it("dry run over a clean settings file records no drift and no retired-settings-entry advisory", () => {
+    seedSettings(["Bash(ls)"]);
+    runClaudeModule(makeCtx());
+    const ctx = makeCtx({ dryRun: true });
+    runClaudeModule(ctx);
+    expect(retiredAdvisories(ctx)).toHaveLength(0);
+    expect(ctx.ws.writes.some((w) => w.path.endsWith(".claude/settings.json"))).toBe(false);
+  });
+
+  it("dry run names an edited variant as kept", () => {
+    const edited = "mcp__claude_ai_Linear__get_issue";
+    seedSettings(["Bash(ls)", edited]);
+    const ctx = makeCtx({ dryRun: true });
+    runClaudeModule(ctx);
+    const found = retiredAdvisories(ctx);
+    expect(found).toHaveLength(1);
+    expect(found[0]!.detect).toContain(edited);
+    expect(found[0]!.detect).toMatch(/kept|edited/);
+  });
+});
+
 // ---------------------------------------------------------------------------
 // reconcileOpencodeJson — provider-key ordering is stable across paths: install
 // reconciles only the ACTIVE provider, upgrade also reconciles each ADDITIONAL
diff --git a/.bkit/core/engine/install/modules/claude.ts b/.bkit/core/engine/install/modules/claude.ts
index ac678fdef..4f01f13b9 100644
--- a/.bkit/core/engine/install/modules/claude.ts
+++ b/.bkit/core/engine/install/modules/claude.ts
@@ -107,7 +107,7 @@ export function runClaudeModule(ctx: ModuleContext): void {
   const settingsDst = ".claude/settings.json";
   if (fs.existsSync(settingsSrc)) {
     const prevLen = ws.writes.length;
-    writeTier2JsonContained(settingsSrc, settingsDst, dryRun, ws);
+    writeTier2JsonContained(settingsSrc, settingsDst, dryRun, ws, advisories);
     ctx.claudeAllowRecorded = enrichClaudeSettingsAllows(
       settingsDst,
       process.cwd(),
diff --git a/.bkit/core/engine/install/modules/codex.ts b/.bkit/core/engine/install/modules/codex.ts
index 2e68b805d..57375c03e 100644
--- a/.bkit/core/engine/install/modules/codex.ts
+++ b/.bkit/core/engine/install/modules/codex.ts
@@ -171,7 +171,7 @@ export function runCodexModule(ctx: ModuleContext): void {
     if (fs.existsSync(jsonSrc)) {
       if (!dryRun) ensureDir(path.dirname(jsonDst));
       const prevLen = ws.writes.length;
-      writeTier2JsonContained(jsonSrc, jsonDst, dryRun, ws);
+      writeTier2JsonContained(jsonSrc, jsonDst, dryRun, ws, advisories);
       if (ws.writes.length > prevLen) console.log(`${logPrefix} ${tag}codex: ${jsonDst}`);
     }
   }
diff --git a/.bkit/core/engine/install/modules/cursor.ts b/.bkit/core/engine/install/modules/cursor.ts
index 9b75ffb43..69cf79bdf 100644
--- a/.bkit/core/engine/install/modules/cursor.ts
+++ b/.bkit/core/engine/install/modules/cursor.ts
@@ -103,7 +103,7 @@ export function runCursorModule(ctx: ModuleContext): void {
   const hooksDst = ".cursor/hooks.json";
   if (fs.existsSync(hooksSrc)) {
     const prevLen = ws.writes.length;
-    writeTier2JsonContained(hooksSrc, hooksDst, dryRun, ws);
+    writeTier2JsonContained(hooksSrc, hooksDst, dryRun, ws, advisories);
     if (ws.writes.length > prevLen) {
       console.log(`${logPrefix} ${tag}cursor: ${hooksDst}`);
     }
diff --git a/.bkit/core/engine/install/write.test.ts b/.bkit/core/engine/install/write.test.ts
index a2dd66c2b..2506f66ed 100644
--- a/.bkit/core/engine/install/write.test.ts
+++ b/.bkit/core/engine/install/write.test.ts
@@ -1048,6 +1048,22 @@ describe("writeTier2JsonContained — retired settings entries", () => {
   });
 });
 
+describe("retired settings list — docs/migrations.md", () => {
+  it("every entry on the retired settings list has a docs/migrations.md row naming its source tags", () => {
+    const migrations = fs.readFileSync(
+      path.join(__dirname, "..", "..", "..", "..", "docs", "migrations.md"),
+      "utf-8",
+    );
+    expect(RETIRED_SETTINGS_ENTRIES.length).toBeGreaterThan(0);
+    for (const entry of RETIRED_SETTINGS_ENTRIES) {
+      const row = migrations.split("\n").find((l) => l.includes(entry.value));
+      expect(row, `no docs/migrations.md row names ${entry.value}`).toBeDefined();
+      expect(row).toContain(entry.file);
+      expect(row).toMatch(/v\d+\.\d+\.\d+/);
+    }
+  });
+});
+
 // ---------------------------------------------------------------------------
 // install/write.ts doc-block terminology check
 // ---------------------------------------------------------------------------
diff --git a/.bkit/core/engine/install/write.ts b/.bkit/core/engine/install/write.ts
index fcb8b616c..f27068c28 100644
--- a/.bkit/core/engine/install/write.ts
+++ b/.bkit/core/engine/install/write.ts
@@ -9,6 +9,7 @@ import {
   selectMarkers,
   type MarkerStyle,
 } from "./managed-block.js";
+import type { PreflightFinding } from "../checks/before/index.js";
 import { readTemplate } from "../render/parts.js";
 import { parseJson } from "../shared/json.js";
 import { applyTokens, type TokenMap } from "./placeholders.js";
@@ -455,6 +456,7 @@ export function writeTier2JsonContained(
   dstPath: string,
   dryRun: boolean,
   ws: WriteSet,
+  advisories?: PreflightFinding[],
 ): void {
   const srcRaw = fs.readFileSync(srcPath, "utf-8");
   const templateRead = parseJson(srcRaw);
@@ -489,11 +491,34 @@ export function writeTier2JsonContained(
   // Take back entries a release retired, and warn about edited variants that stay.
   const pruned = pruneRetiredSettingsEntries(dstPath, existing as JsonValue);
   const prunedChanged = JSON.stringify(pruned) !== JSON.stringify(existing);
-  for (const e of findRetiredSettingsEntries(dstPath, existing as JsonValue, template as JsonValue)
-    .edited) {
-    console.warn(
-      `[bkit] ${e.file}: ${e.path} holds "${e.value}", an edited copy of an entry bkit retired ("${e.retired}"); bkit keeps it. Delete that line from ${e.file} if you no longer want it.`,
-    );
+  const found = findRetiredSettingsEntries(dstPath, existing as JsonValue, template as JsonValue);
+  if (advisories) {
+    if (found.retired.length > 0 || found.edited.length > 0) {
+      const parts: string[] = [];
+      if (found.retired.length > 0) {
+        parts.push(
+          `retired entries bkit removes: ${found.retired.map((e) => `"${e.value}" (${e.path})`).join(", ")}`,
+        );
+      }
+      if (found.edited.length > 0) {
+        parts.push(
+          `edited copies of a retired entry, kept: ${found.edited.map((e) => `"${e.value}" (${e.path}, edited from "${e.retired}")`).join(", ")}`,
+        );
+      }
+      advisories.push({
+        id: "retired-settings-entry",
+        severity: "advisory",
+        detect: `${dstPath}: ${parts.join("; ")}.`,
+        action:
+          "Run bkit upgrade to remove a retired entry. bkit keeps an edited copy; delete that line from the file if you no longer want it.",
+      });
+    }
+  } else {
+    for (const e of found.edited) {
+      console.warn(
+        `[bkit] ${e.file}: ${e.path} holds "${e.value}", an edited copy of an entry bkit retired ("${e.retired}"); bkit keeps it. Delete that line from ${e.file} if you no longer want it.`,
+      );
+    }
   }
 
   // Check if existing already contains the template
diff --git a/.bkit/install.md b/.bkit/install.md
index 2c477781a..be665a306 100644
--- a/.bkit/install.md
+++ b/.bkit/install.md
@@ -221,7 +221,7 @@ In this example, `hooks.SessionStart` is bkit-declared scope (from the template)
 
 - Consumer keys outside the template tree survive every `bkit install` byte-identically.
 - `bkit install` uses `deepContains(template, consumer)`, which checks that every template leaf is present. On drift, it deep-merges with the template winning, and consumer-only siblings are preserved.
-- Lists merge too. A list of plain values (such as `permissions.allow`) keeps the template's entries in template order, then appends consumer-only entries. A list of objects (hook groups) replaces a consumer group that holds a hook `command` the template group also holds, and keeps every other consumer group after the template's groups. A second install is a no-op.
+- Lists merge too. A list of plain values (such as `permissions.allow`) keeps the template's entries in template order, then appends consumer-only entries. Before the merge, bkit removes each exact entry on its retired list (`RETIRED_SETTINGS_ENTRIES`, registered in `docs/migrations.md`); an edited copy no longer matches, so it is kept and the output warns. A list of objects (hook groups) replaces a consumer group that holds a hook `command` the template group also holds, and keeps every other consumer group after the template's groups. A second install is a no-op.
 - `bkit check` surfaces the `tier2-json-drift` advisory when `deepContains` fails, and exits 1 (CI drift gate). It writes nothing. The consumer reviews and re-runs `bkit install` to reconverge.
 - `.cursor/hooks.json` uses Cursor v1 keyed-object schema: `{"version": 1, "hooks": {"sessionStart": [...], "sessionStop": [...]}}`.
 
diff --git a/.bkit/version b/.bkit/version
index 5b0337ca5..325aa4c39 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -206,7 +206,7 @@
     "docs/templates/bkit-audit-adoption.md": "e5c51a0e1b815044a83c405af7ce1e51e5690c99b937a61a7e3fcc2fddc8fe7f",
     ".bkit/cloud.md": "945c4abe584a15aeca979d5e13b2ea5f8915c5198dc8dd9226b1d020118c4c7d",
     ".bkit/comparison.md": "8d62c438ca6293483e6c752e9864d8123a0fa642906dfb15bc08b09a3b224b92",
-    ".bkit/install.md": "6c04f482ce55a80b3922ed29a738422ad1b00557844f56d57edebd5db707f195",
+    ".bkit/install.md": "ec098854b8abbe42c3e71c6ab864ebb3d3e0f339ee2a9844fab7910a885f030a",
     ".bkit/jsonl.md": "2ee43214c4fa16717bfe932463f3a311a22caa40569f24f71e6bd23b6942459c",
     ".bkit/providers.md": "cd84350a719e69837d96a698fe5597f98c79785d3e4079cb1867fbcf4901430e",
     ".bkit/prompts.md": "2ac9bdc011d81372cbebcdb914815f02140c91d82dfb79a1bdbb72875d48d852",
diff --git a/dist/install/modules/antigravity.js b/dist/install/modules/antigravity.js
index 599d78af9..c748bb8ac 100644
--- a/dist/install/modules/antigravity.js
+++ b/dist/install/modules/antigravity.js
@@ -130,7 +130,7 @@ export function runAntigravityModule(ctx) {
             if (!dryRun)
                 ensureDir(path.dirname(jsonDst));
             const prevLen = ws.writes.length;
-            writeTier2JsonContained(jsonSrc, jsonDst, dryRun, ws);
+            writeTier2JsonContained(jsonSrc, jsonDst, dryRun, ws, advisories);
             if (ws.writes.length > prevLen)
                 console.log(`${logPrefix} ${tag}antigravity: ${jsonDst}`);
         }
@@ -156,7 +156,7 @@ export function runAntigravityModule(ctx) {
             if (!dryRun)
                 ensureDir(path.dirname(jsonDst));
             const prevLen = ws.writes.length;
-            writeTier2JsonContained(jsonSrc, jsonDst, dryRun, ws);
+            writeTier2JsonContained(jsonSrc, jsonDst, dryRun, ws, advisories);
             if (ws.writes.length > prevLen)
                 console.log(`${logPrefix} ${tag}antigravity: ${jsonDst}`);
         }
diff --git a/dist/install/modules/claude.js b/dist/install/modules/claude.js
index a37aed8e5..555a3a80a 100644
--- a/dist/install/modules/claude.js
+++ b/dist/install/modules/claude.js
@@ -79,7 +79,7 @@ export function runClaudeModule(ctx) {
     const settingsDst = ".claude/settings.json";
     if (fs.existsSync(settingsSrc)) {
         const prevLen = ws.writes.length;
-        writeTier2JsonContained(settingsSrc, settingsDst, dryRun, ws);
+        writeTier2JsonContained(settingsSrc, settingsDst, dryRun, ws, advisories);
         ctx.claudeAllowRecorded = enrichClaudeSettingsAllows(settingsDst, process.cwd(), dryRun, ws, advisories);
         if (ws.writes.length > prevLen) {
             console.log(`${logPrefix} ${tag}claude: ${settingsDst}`);
diff --git a/dist/install/modules/codex.js b/dist/install/modules/codex.js
index 6cfbf8b5a..297fa3759 100644
--- a/dist/install/modules/codex.js
+++ b/dist/install/modules/codex.js
@@ -143,7 +143,7 @@ export function runCodexModule(ctx) {
             if (!dryRun)
                 ensureDir(path.dirname(jsonDst));
             const prevLen = ws.writes.length;
-            writeTier2JsonContained(jsonSrc, jsonDst, dryRun, ws);
+            writeTier2JsonContained(jsonSrc, jsonDst, dryRun, ws, advisories);
             if (ws.writes.length > prevLen)
                 console.log(`${logPrefix} ${tag}codex: ${jsonDst}`);
         }
diff --git a/dist/install/modules/cursor.js b/dist/install/modules/cursor.js
index 2ab7efa29..08afad049 100644
--- a/dist/install/modules/cursor.js
+++ b/dist/install/modules/cursor.js
@@ -79,7 +79,7 @@ export function runCursorModule(ctx) {
     const hooksDst = ".cursor/hooks.json";
     if (fs.existsSync(hooksSrc)) {
         const prevLen = ws.writes.length;
-        writeTier2JsonContained(hooksSrc, hooksDst, dryRun, ws);
+        writeTier2JsonContained(hooksSrc, hooksDst, dryRun, ws, advisories);
         if (ws.writes.length > prevLen) {
             console.log(`${logPrefix} ${tag}cursor: ${hooksDst}`);
         }
diff --git a/dist/install/write.js b/dist/install/write.js
index c250a3e01..0266b6589 100644
--- a/dist/install/write.js
+++ b/dist/install/write.js
@@ -351,7 +351,7 @@ export function pruneRetiredSettingsEntries(rel, doc, list = RETIRED_SETTINGS_EN
 //   - dest present, malformed JSON → throw; the consumer fixes it by hand
 //   - schemaFlipped: true when a path value changed type during deep-merge
 // ---------------------------------------------------------------------------
-export function writeTier2JsonContained(srcPath, dstPath, dryRun, ws) {
+export function writeTier2JsonContained(srcPath, dstPath, dryRun, ws, advisories) {
     const srcRaw = fs.readFileSync(srcPath, "utf-8");
     const templateRead = parseJson(srcRaw);
     if (!templateRead.ok) {
@@ -380,9 +380,28 @@ export function writeTier2JsonContained(srcPath, dstPath, dryRun, ws) {
     // Take back entries a release retired, and warn about edited variants that stay.
     const pruned = pruneRetiredSettingsEntries(dstPath, existing);
     const prunedChanged = JSON.stringify(pruned) !== JSON.stringify(existing);
-    for (const e of findRetiredSettingsEntries(dstPath, existing, template)
-        .edited) {
-        console.warn(`[bkit] ${e.file}: ${e.path} holds "${e.value}", an edited copy of an entry bkit retired ("${e.retired}"); bkit keeps it. Delete that line from ${e.file} if you no longer want it.`);
+    const found = findRetiredSettingsEntries(dstPath, existing, template);
+    if (advisories) {
+        if (found.retired.length > 0 || found.edited.length > 0) {
+            const parts = [];
+            if (found.retired.length > 0) {
+                parts.push(`retired entries bkit removes: ${found.retired.map((e) => `"${e.value}" (${e.path})`).join(", ")}`);
+            }
+            if (found.edited.length > 0) {
+                parts.push(`edited copies of a retired entry, kept: ${found.edited.map((e) => `"${e.value}" (${e.path}, edited from "${e.retired}")`).join(", ")}`);
+            }
+            advisories.push({
+                id: "retired-settings-entry",
+                severity: "advisory",
+                detect: `${dstPath}: ${parts.join("; ")}.`,
+                action: "Run bkit upgrade to remove a retired entry. bkit keeps an edited copy; delete that line from the file if you no longer want it.",
+            });
+        }
+    }
+    else {
+        for (const e of found.edited) {
+            console.warn(`[bkit] ${e.file}: ${e.path} holds "${e.value}", an edited copy of an entry bkit retired ("${e.retired}"); bkit keeps it. Delete that line from ${e.file} if you no longer want it.`);
+        }
     }
     // Check if existing already contains the template
     const containsResult = deepContains(template, pruned);
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 10051c16f..58a131931 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -548,3 +548,4 @@
 {"schema":3,"ts":1795082175128,"firstTs":1795080036634,"updates":2,"kind":"deferral","key":"1050-host-made-worktrees-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-1416","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["1050-host-made-worktrees"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"Closed by #1050: a branch name starting with - is passed to git rev-list as refs/heads/{branch}, so it is never read as an option and the unpushed-dev refusal still runs","description":"Fixed on feat/1050-host-made-worktrees: same qualified revision as the -341 row. Test: worktrees.integration.test.ts \"refuses plan on a branch whose name starts with a dash and leaves the file that name points at untouched\".","source":".bkit/core/engine/commands/workflow/worktrees.ts:1416","status":"CLOSED"}
 {"schema":3,"ts":1795080511913,"firstTs":1795080511913,"updates":1,"kind":"deferral","key":"260-manage-on-other-hosts","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"design","step":"design-generate","subagent":"bkit-design-generate","model":"claude-opus-5-5"},"references":["260","docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md § Decisions D15"],"type":"feature","category":"agentic","severity":"LOW","reason":"scope-declared","summary":"/bkit-manage on hosts other than the Claude desktop app (Antigravity, OpenCode, Codex, Cursor, plain Claude CLI)","description":"The design renders /bkit-manage for Claude only and the preflight refuses off the desktop app (owner answers Q3, Q9). Each other host lacks one of: starting a worker session, messaging an idle one, a wake-up, a question path. Antigravity is the closest (typeable subagents, parent messaging, /schedule); plain Claude CLI has cross-session messaging but no documented tool to start a session. Revisit when a host gains the missing piece; .bkit/providers.md records each gap with its source.","status":"OPEN"}
 {"schema":3,"ts":1795080511915,"firstTs":1795080511915,"updates":1,"kind":"deferral","key":"260-manage-rebuild-state-from-report-digest","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"design","step":"design-generate","subagent":"bkit-design-generate","model":"claude-opus-5-5"},"references":["260","docs/plans/202611/logs/260-milestone-orchestrator-autonomous/design-v1-draft.md § Approaches Considered (Ideate-2 A)"],"type":"feature","category":"agentic","severity":"LOW","reason":"scope-declared","summary":"Rebuild a /bkit-manage run's records from a state digest in its last report comment when the clone's unpushed records are lost","description":"The design keeps the run's records as manage-* rows in the parent's status.jsonl in the manager's worktree, landed with each push batch. Rows written after the last push are lost if the clone is lost; the report comments remain as a human record. A machine-readable digest in each report plus a resume-from-tracker verb would close that gap, at the cost of a parser over comment text and a machine block in a phone-read comment. Out of scope for the first version.","status":"OPEN"}
+{"schema":3,"ts":1795093707633,"firstTs":1794365934218,"updates":2,"kind":"deferral","key":"787-show-authoring-rules-challenge-low-bkit-core-engine-install-write-ts-256","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["787-show-authoring-rules","985-install-settings-merge","https://github.com/cbartens/bkit/issues/985"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A permission grant or hook group that a later bkit release retires stays in every upgraded consumer forever, because the list merge treats it as consumer-added","description":"Closed by #985: a fixed retired-entries list (RETIRED_SETTINGS_ENTRIES) in write.ts removes each exact retired entry before the list merge, with a docs/migrations.md row per entry.","status":"CLOSED"}
diff --git a/docs/migrations.md b/docs/migrations.md
index 90deb61da..6c780871a 100644
--- a/docs/migrations.md
+++ b/docs/migrations.md
@@ -44,6 +44,7 @@
 | Vale style `House` → `Bkit` | `.bkit/core/engine/install/modules/core.ts` (`migrateValeHouseStyle`, `SHIPPED_HOUSE_RULE_HASHES`, called by `runBkitDocs`) | `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml` matching a shipped release move to `.vale/styles/Bkit/` when absent; an edited rule, a taken target or a symlinked rule stays with a warning naming the manual move; a symlinked `.vale`, `.vale/styles`, `House` or `Bkit` directory leaves the rules unmoved with a warning. `.vale.ini` `House.<moved>` → `Bkit.<moved>`; `BasedOnStyles` swaps `House` for `Bkit` once `House/` is empty (directory removed), else appends `Bkit`. Own rules stay, including an own entry named like a moved rule without `.yml` (a `Filler/` folder). Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 | Slop plugin ignores inert skip text | `.bkit/core/engine/install/modules/core.ts` (`migrateSlopTypeSuppression`, `RETIRED_SLOP_PLUGIN_HASH`, called by `runBkitDocs`) | `scripts/slop/bkit-slop-type-suppression.mjs` byte-identical to the shipped v6.0.0 template → replaced with the current template. An edited copy, a non-file or a symlinked path stays with a warning to merge `.bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs` by hand. An absent or current copy stays untouched. Dry run records the same update without writing; `unhashed` keeps the copy consumer-owned. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` (fixture `tests/fixtures/slop-6.0.0/`) |
 | Project docs moved out of managed ownership | `.bkit/core/engine/install/project-docs.ts` (`syncProjectDocs`, `LEGACY_STARTER_DIGEST_HISTORY`), `.bkit/core/engine/install/managed-block.ts` (`stripManagedWrapper`); called by `runInstall` and `runUpgradeCommand` | `docs/{architecture,technology,security,data-schema,testing,deployments,observability,design,noise,setup}.md` carrying the `<!-- bkit:start -->` / `<!-- bkit:end -->` lines and the `bkit:managed` notice → those lines (and one padding blank line each) removed, every other byte kept, CRLF included. Ambiguous wrappers (missing partner, inverted, repeated, inside a code fence) and symlinked or non-file paths are kept and reported. Then `.agents/docs.md` `## Project Documents` gains a row per present default doc whose indexed equivalent row is absent, out of tree or unsafe (an equivalent is the same basename or a Scope naming "Equivalent to docs/x.md"; skipped equivalents are printed); an unreadable index is left byte-for-byte with a warning. Dry run reports the same writeset. | 5.0.0-6.1.x (every released starter, branch-agnostic normalization) | `.bkit/core/engine/install/project-docs.test.ts`; `.bkit/core/engine/install/managed-block.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
+| Retired settings entries removed | `.bkit/core/engine/install/write.ts` (`RETIRED_SETTINGS_ENTRIES`, `findRetiredSettingsEntries`, `pruneRetiredSettingsEntries`, called by `writeTier2JsonContained`) | `mcp__claude_ai_Linear__*` in `permissions.allow` of `.claude/settings.json` → removed before the list merge; shipped `v3.0.0` through `v5.4.0`, dropped in `v5.5.0` (`f57bc5942`). An edited copy (for example `mcp__claude_ai_Linear__get_issue`) no longer matches, so it is kept and install / upgrade warns; `bkit check` names a retired or edited entry (`retired-settings-entry`). Add one list line and one row here per later retired entry. | up to 5.4.x | `.bkit/core/engine/install/write.test.ts` (`mergeManagedJson`, `writeTier2JsonContained`, list-versus-migrations test); `.bkit/core/engine/install/modules/claude.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 
 ## Detect-only guards
 
diff --git a/docs/testing.md b/docs/testing.md
index b8940d970..6b4dff1d6 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -903,8 +903,9 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `.bkit/core/engine/commands/install/uninstall.integration.test.ts` | Integration | Round-trip byte-identity vs `tests/fixtures/heavy-customised-consumer/`; OpenCode uninstall zero-footprint (P4.T7); a real install, reinstall and uninstall keep a hand-added grant equal to a derived one and remove the grants bkit added. |
 | `.bkit/core/engine/install/manifest.test.ts` | Unit | Per-module install-write manifest assertions. |
 | `.bkit/core/engine/install/write.integration.test.ts` | Integration | Consumer key survival through `writeTier2JsonContained` (inline consumer settings, cursor v1 schema); OpenCode reconverge. |
-| `.bkit/core/engine/install/write.test.ts` (`mergeManagedJson`) | Unit | List merge in a drifted managed JSON file: plain-value lists keep the template's entries in template order then consumer-only entries; hook-group lists replace a consumer group that holds a hook `command` the template group holds and keep every other consumer group; a consumer hook inside a bkit group survives; a second merge is a no-op. |
-| `.bkit/core/engine/commands/install/upgrade.test.ts` and `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | Unit and Integration | Diff engine, drift detection, `--auto-apply` semantics. Managed-version marker guard: every non-JSON, non-template file a real full install writes carries the marker and equals `listStampedFiles`; a version bump restamps every marker with no conflict and `bkit check` is then clean. A 5.1.0 Antigravity `hooks.json` (fixture `tests/fixtures/antigravity-5.1.0/hooks.json`) upgrades onto the shipped matchers (guardrails on `view_file\|run_command`). The self-bump starts `PACKAGE_RUNNER` (stub on `PATH`) for `add -D` and the re-exec. An upgrade from a 5.2.4 `.bkit/lite.md` retires the managed block and keeps the consumer section. |
+| `.bkit/core/engine/install/write.test.ts` (`mergeManagedJson`) | Unit | List merge in a drifted managed JSON file: plain-value lists keep the template's entries in template order then consumer-only entries; hook-group lists replace a consumer group that holds a hook `command` the template group holds and keep every other consumer group; a consumer hook inside a bkit group survives; a second merge is a no-op. Retired settings entries (`RETIRED_SETTINGS_ENTRIES`): the exact entry is removed with the person's entries untouched, an edited copy is kept with a warning, and every list entry has a `docs/migrations.md` row naming its source tags. |
+| `.bkit/core/engine/install/modules/claude.integration.test.ts` (retired settings entries) | Integration | A dry run over a `.claude/settings.json` holding a retired grant records the file as drift and pushes one `retired-settings-entry` advisory naming it; a clean file records neither; an edited copy is named as kept. |
+| `.bkit/core/engine/commands/install/upgrade.test.ts` and `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | Unit and Integration | Diff engine, drift detection, `--auto-apply` semantics. Managed-version marker guard: every non-JSON, non-template file a real full install writes carries the marker and equals `listStampedFiles`; a version bump restamps every marker with no conflict and `bkit check` is then clean. A 5.1.0 Antigravity `hooks.json` (fixture `tests/fixtures/antigravity-5.1.0/hooks.json`) upgrades onto the shipped matchers (guardrails on `view_file\|run_command`). The self-bump starts `PACKAGE_RUNNER` (stub on `PATH`) for `add -D` and the re-exec. An upgrade from a 5.2.4 `.bkit/lite.md` retires the managed block and keeps the consumer section. An upgrade over a settings file holding a retired grant removes it and keeps the person's entries. |
 | `.bkit/core/engine/install/network-allowlist.test.ts` | Unit | `writeNetworkAllowlist`: writes `.bkit/allowlist.json` from the egress registry plus consumer `allowed-domains`, idempotent, dry-run records the same writeset, regenerates a hand edit whole; removes a `.cursor/allowlist.json` only when `.bkit/version` records it. |
 | `.bkit/core/engine/install/template-notes.test.ts` | Unit | `migrateTemplateNotes`: removes bkit's old `<!-- Note: … -->` line above `<!-- bkit:start -->` in installed `docs/templates/bkit-*.md` only when its text matches one of the 7 shipped wordings, table-driven over the exact wordings from history, and the hash set must equal `RETIRED_TEMPLATE_NOTE_HASHES`. Also covers CRLF on the lines above the block only, a leading byte-order mark kept, and a file with CRLF throughout, two start markers, or the note below the block left unchanged. Keeps the consumer's own lines and own note silently; keeps an edited bkit note and prints one line naming the file, once across a dry run and a real run, with `…` only when the line is cut. Skips a symlinked template, leaves a migrated file and the consumer's own templates untouched, ignores a missing folder, idempotent, dry-run records the same writeset. |
 | `.bkit/core/engine/install/context-ci-workflow.test.ts` | Unit | `scopeCiRunLookups`: scopes the shipped `context=ci` and `context=e2e` CI-run lookups below `<!-- bkit:end -->` to the configured workflow file, keeps CR line endings, idempotent. Leaves a lookup inside the managed block, one that already names a workflow and a file without `bkit:end` unchanged; leaves an edited lookup, or every lookup when the workflow name is not a plain file name, and lists it as unscoped. |
