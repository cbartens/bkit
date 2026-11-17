diff --git a/.bkit/core/.bkit/providers.md b/.bkit/core/.bkit/providers.md
index 3e1efd2ed..0fd25062a 100644
--- a/.bkit/core/.bkit/providers.md
+++ b/.bkit/core/.bkit/providers.md
@@ -520,7 +520,7 @@ It is fail-open and never blocks. The log lives in per-user OS temp (`bkit-readg
 <!-- prettier-ignore -->
 | Host | Where the allows live | Rule per server `<s>` |
 | --- | --- | --- |
-| **Claude** | `.claude/settings.json` `permissions.allow`, recorded in `.bkit/version` `claudeAllowDerived` so a server dropped from the block is pruned | `mcp__<s>__*` (`.mcp.json` servers; claude.ai connectors in cloud sessions) + `mcp__claude_ai_<s>__*` (claude.ai connectors in the local CLI) |
+| **Claude** | `.claude/settings.json` `permissions.allow`, recorded in `.bkit/version` `claudeAllowDerived` so a server dropped from the block is pruned; `bkit uninstall` removes only the rows that record holds and lists other derived-looking rows for owner review | `mcp__<s>__*` (`.mcp.json` servers; claude.ai connectors in cloud sessions) + `mcp__claude_ai_<s>__*` (claude.ai connectors in the local CLI) |
 | **Cursor** | Generated `.cursor/cli.json` `permissions.allow` — Cursor CLI + cloud agents. The IDE agent's MCP auto-run list is user-level only | `Mcp(<s>:*)` |
 | **OpenCode** | Baked into `.opencode/opencode.json` → `permission` | `"<s>_*": "allow"` — OpenCode names MCP tools `<s>_<tool>` |
 
diff --git a/.bkit/core/engine/commands/install/uninstall.integration.test.ts b/.bkit/core/engine/commands/install/uninstall.integration.test.ts
index 78d1b5393..7c9581304 100644
--- a/.bkit/core/engine/commands/install/uninstall.integration.test.ts
+++ b/.bkit/core/engine/commands/install/uninstall.integration.test.ts
@@ -21,11 +21,12 @@ import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
 import { spawnSync } from "node:child_process";
-import { afterEach, beforeEach, describe, expect, it } from "vitest";
+import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
 import { requireTsx } from "../../../../../vitest.tsx-bin";
 import { runUninstall, type UninstallContext } from "./uninstall";
 import { serializeBkitVersion } from "../../install/version-file";
 import { BKIT_GATE_SCRIPTS } from "../../install/manifest";
+import { getSharedRoot } from "../../shared/package-roots";
 
 const FIXTURE_DIR = path.resolve(
   __dirname,
@@ -754,3 +755,174 @@ describe("#864 — full uninstall keeps project documents", () => {
     fs.rmSync(dir, { recursive: true, force: true });
   });
 });
+
+// ---------------------------------------------------------------------------
+// Uninstall cleanup by recorded evidence (deferrals-11)
+// ---------------------------------------------------------------------------
+
+describe("uninstall strips Claude grants by the claudeAllowDerived record", () => {
+  function writeVersion(claudeAllowDerived: string[]): void {
+    fs.writeFileSync(
+      path.join(tmpDir, ".bkit", "version"),
+      serializeBkitVersion({ pinnedVersion: "5.0.0", canonicalHashes: {}, claudeAllowDerived }),
+      "utf-8",
+    );
+  }
+
+  /** `.claude/settings.json` as install writes it: the template plus extra allow rows. */
+  function writeSettings(extraAllow: string[]): void {
+    const template = JSON.parse(
+      fs.readFileSync(path.join(getSharedRoot(), ".claude", "settings.json"), "utf-8"),
+    ) as { permissions: { allow: string[] } };
+    template.permissions.allow = [...template.permissions.allow, ...extraAllow];
+    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
+    fs.writeFileSync(
+      path.join(tmpDir, ".claude", "settings.json"),
+      JSON.stringify(template, null, 2) + "\n",
+      "utf-8",
+    );
+  }
+
+  function readOrEmpty(file: string): string {
+    return fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
+  }
+
+  function readAllow(): string[] {
+    const file = path.join(tmpDir, ".claude", "settings.json");
+    if (!fs.existsSync(file)) return [];
+    const doc = JSON.parse(fs.readFileSync(file, "utf-8")) as {
+      permissions?: { allow?: string[] };
+    };
+    return doc.permissions?.allow ?? [];
+  }
+
+  async function uninstallClaudeCapturingLog(): Promise<string> {
+    const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
+    try {
+      await runUninstall(["claude"], makeCtx());
+      return spy.mock.calls.map((c) => c.join(" ")).join("\n");
+    } finally {
+      spy.mockRestore();
+    }
+  }
+
+  it("removes a recorded WebFetch grant whose domain left allowed-domains", async () => {
+    const gone = "WebFetch(domain:gone.example)";
+    writeVersion([gone]);
+    writeSettings([gone]);
+
+    await uninstallClaudeCapturingLog();
+
+    expect(readAllow()).not.toContain(gone);
+    // Everything in the file was bkit's: template plus the recorded grant.
+    expect(fs.existsSync(path.join(tmpDir, ".claude", "settings.json"))).toBe(false);
+  });
+
+  it("keeps an unrecorded WebFetch grant and lists it for owner review", async () => {
+    // github.com is in today's derived set, so the old recompute would have removed it.
+    const unrecorded = "WebFetch(domain:github.com)";
+    writeVersion(["WebFetch(domain:gone.example)"]);
+    writeSettings([unrecorded, "WebFetch(domain:gone.example)"]);
+
+    const log = await uninstallClaudeCapturingLog();
+
+    expect(readAllow()).toContain(unrecorded);
+    expect(readAllow()).not.toContain("WebFetch(domain:gone.example)");
+    const review = log.split("\n").filter((l) => l.includes(unrecorded));
+    expect(review.length).toBe(1);
+    expect(review[0]).toContain("[bkit-uninstall-surgical-test]");
+  });
+
+  it("removes no WebFetch grant when .bkit/version has no claudeAllowDerived record", async () => {
+    const rows = ["WebFetch(domain:github.com)", "WebFetch(domain:gone.example)"];
+    writeVersion([]);
+    writeSettings(rows);
+
+    const log = await uninstallClaudeCapturingLog();
+
+    expect(readAllow()).toEqual(expect.arrayContaining(rows));
+    for (const row of rows) {
+      expect(log, `review line for ${row}`).toContain(row);
+    }
+  });
+
+  it("leaves legacy OpenCode substring fetch grants in place and lists them for owner review", async () => {
+    const plain = "curl *github.com*";
+    const secret = "curl *https://user:tok@host/?k=v*";
+    const opencodeJson = path.join(tmpDir, ".opencode", "opencode.json");
+    fs.mkdirSync(path.dirname(opencodeJson), { recursive: true });
+    fs.writeFileSync(
+      opencodeJson,
+      JSON.stringify(
+        { theme: "dark", permission: { bash: { [plain]: "allow", [secret]: "allow" } } },
+        null,
+        2,
+      ) + "\n",
+      "utf-8",
+    );
+
+    const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
+    let log: string;
+    try {
+      await runUninstall(["opencode"], makeCtx());
+      log = spy.mock.calls.map((c) => c.join(" ")).join("\n");
+    } finally {
+      spy.mockRestore();
+    }
+
+    const left = JSON.parse(fs.readFileSync(opencodeJson, "utf-8")) as {
+      permission?: { bash?: Record<string, string> };
+    };
+    expect(left.permission?.bash).toMatchObject({ [plain]: "allow", [secret]: "allow" });
+    expect(log).toContain(plain);
+    expect(log).toMatch(/curl \*https:\/\/[^\s]*host/);
+    expect(log).not.toContain("user:tok");
+    expect(log).not.toContain("k=v");
+  });
+
+  it("a full bkit uninstall removes a recorded WebFetch grant whose domain left allowed-domains", () => {
+    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-uninstall-recorded-"));
+    const cli = path.resolve(__dirname, "../../cli.ts");
+    const run = (...args: string[]) =>
+      spawnSync(requireTsx(), [cli, ...args], {
+        cwd: dir,
+        encoding: "utf-8",
+        env: { ...process.env, NODE_NO_WARNINGS: "1" },
+        timeout: 120_000,
+      });
+    try {
+      fs.mkdirSync(path.join(dir, ".git"), { recursive: true });
+      fs.writeFileSync(
+        path.join(dir, "package.json"),
+        JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
+        "utf-8",
+      );
+      const install = run("install", "--claude");
+      expect(install.status, `${install.stdout}\n${install.stderr}`).toBe(0);
+
+      // A grant install once wrote for a domain that has since left allowed-domains.
+      const gone = "WebFetch(domain:gone.example)";
+      const versionPath = path.join(dir, ".bkit", "version");
+      const version = JSON.parse(fs.readFileSync(versionPath, "utf-8")) as {
+        claudeAllowDerived: string[];
+      };
+      version.claudeAllowDerived = [...version.claudeAllowDerived, gone];
+      fs.writeFileSync(versionPath, JSON.stringify(version, null, 2) + "\n", "utf-8");
+      const settingsPath = path.join(dir, ".claude", "settings.json");
+      const settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8")) as {
+        permissions: { allow: string[] };
+      };
+      settings.permissions.allow = [...settings.permissions.allow, gone];
+      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n", "utf-8");
+
+      const un = run("uninstall");
+      expect(un.status, `${un.stdout}\n${un.stderr}`).toBe(0);
+
+      // The file is deleted when nothing but bkit's rows were in it; either way the
+      // recorded grant must not remain.
+      expect(readOrEmpty(settingsPath)).not.toContain("gone.example");
+    } finally {
+      fs.rmSync(dir, { recursive: true, force: true });
+    }
+  });
+});
diff --git a/.bkit/core/engine/commands/install/uninstall.test.ts b/.bkit/core/engine/commands/install/uninstall.test.ts
index 387a99c21..469d12fcb 100644
--- a/.bkit/core/engine/commands/install/uninstall.test.ts
+++ b/.bkit/core/engine/commands/install/uninstall.test.ts
@@ -1165,6 +1165,12 @@ describe("runUninstall — .claude/settings.json leaves no grants behind", () =>
       "WebFetch(domain:npmjs.com)",
     ];
     writeFile(".claude/settings.json", JSON.stringify(onDisk, null, 2) + "\n");
+    // Uninstall strips only the rows `.bkit/version` records as bkit-written.
+    writeBkitVersionFile({
+      pinnedVersion: "1.0.0",
+      canonicalHashes: {},
+      claudeAllowDerived: ["WebFetch(domain:github.com)", "WebFetch(domain:npmjs.com)"],
+    });
 
     await runUninstall(["claude"], makeCtx());
 
diff --git a/.bkit/core/engine/commands/install/uninstall.ts b/.bkit/core/engine/commands/install/uninstall.ts
index 161ac949c..71e0de685 100644
--- a/.bkit/core/engine/commands/install/uninstall.ts
+++ b/.bkit/core/engine/commands/install/uninstall.ts
@@ -66,10 +66,10 @@ import {
   CLAUDE_CLOUD_RELPATH,
   CODEX_CLOUD_RELPATH,
   CURSOR_CLOUD_RELPATH,
-  resolveClaudeDerivedAllows,
 } from "../../install/cloud-env.js";
 import type { ModuleFlag, UninstallFlags } from "../../cli.js";
 import { LOG_PREFIX, setLogPrefix } from "../../shared/log-prefix.js";
+import { isOpencodeSubstringFetchKey, redactUrlParts } from "../../checks/before/files.js";
 import { type McpServerMapKey, unusedTrackerMcpServers } from "../../checks/before/mcp.js";
 
 // ---------------------------------------------------------------------------
@@ -629,6 +629,11 @@ export async function runUninstall(
     }
   }
 
+  // The grants bkit wrote into `.claude/settings.json`, read before the loop below deletes
+  // `.bkit/version` on a full or core uninstall.
+  const claudeAllowDerived =
+    readBkitVersion(path.join(ctx.cwd, ".bkit", "version"))?.claudeAllowDerived ?? [];
+
   const table = buildDecisionTable(moduleList, ctx);
   result.decisions = table;
 
@@ -707,19 +712,18 @@ export async function runUninstall(
               // the resolved network allowlist and `mcp__…` grants per declared MCP
               // server (enrichClaudeSettingsAllows). Stripping
               // against the RAW template leaves those grants behind as if the consumer
-              // had added them. Recompute the same set — the very function that produced
-              // them — and treat it as part of the template, exactly as the opencode.json
-              // sentinel render above does.
+              // had added them. `.bkit/version` records exactly the rows install wrote
+              // (`claudeAllowDerived`); treat them as part of the template. A derived-looking
+              // row the record lacks has unknown ownership: it stays and is listed for review.
               if (summary.file === path.join(".claude", "settings.json")) {
                 const perms = templateDoc.permissions;
                 if (perms !== null && typeof perms === "object" && !Array.isArray(perms)) {
                   const permsObj = perms as Record<string, JsonValue>;
                   const allow = permsObj.allow;
                   if (Array.isArray(allow)) {
-                    const enriched = resolveClaudeDerivedAllows(ctx.cwd);
                     permsObj.allow = [
                       ...allow,
-                      ...enriched.filter((e) => !allow.includes(e)),
+                      ...claudeAllowDerived.filter((e) => !allow.includes(e)),
                     ] as JsonValue;
                   }
                 }
@@ -729,6 +733,34 @@ export async function runUninstall(
                 : isOpencodeJson
                   ? stripOpencodeJsonScope(consumerDoc, templatePath, ctx.cwd)
                   : stripTier2JsonScope(consumerDoc, templateDoc);
+              if (summary.file === path.join(".claude", "settings.json")) {
+                const remaining = (stripped.permissions as { allow?: unknown } | undefined)?.allow;
+                if (Array.isArray(remaining)) {
+                  for (const row of remaining) {
+                    if (
+                      typeof row === "string" &&
+                      /^(WebFetch\(domain:|mcp__)/.test(row) &&
+                      !claudeAllowDerived.includes(row)
+                    ) {
+                      console.log(
+                        `${ctx.logPrefix} review: ${summary.file} keeps ${row} — .bkit/version does not record it as bkit-written; remove it by hand if bkit added it`,
+                      );
+                    }
+                  }
+                }
+              }
+              if (isOpencodeJson) {
+                const bash = (stripped.permission as { bash?: unknown } | undefined)?.bash;
+                if (bash !== null && typeof bash === "object" && !Array.isArray(bash)) {
+                  for (const [key, value] of Object.entries(bash as Record<string, unknown>)) {
+                    if (value === "allow" && isOpencodeSubstringFetchKey(key)) {
+                      console.log(
+                        `${ctx.logPrefix} review: ${summary.file} keeps legacy substring grant \`${redactUrlParts(key)}\` in permission.bash — remove it by hand if you did not add it`,
+                      );
+                    }
+                  }
+                }
+              }
               const strippedJson = JSON.stringify(stripped, null, 2) + "\n";
               if (Object.keys(stripped).length === 0) {
                 // All keys were bkit-owned → delete file
diff --git a/dist/commands/install/uninstall.js b/dist/commands/install/uninstall.js
index cc3ca205c..eef55c2d5 100644
--- a/dist/commands/install/uninstall.js
+++ b/dist/commands/install/uninstall.js
@@ -36,8 +36,9 @@ import { applyModelOverrides, buildOpencodeModelLookup, parseEffortMap, } from "
 import { readInstallingVersion } from "../../shared/package-json.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { SEEDED_BKIT_DEFAULTS } from "../../install/modules/core.js";
-import { CLAUDE_CLOUD_RELPATH, CODEX_CLOUD_RELPATH, CURSOR_CLOUD_RELPATH, resolveClaudeDerivedAllows, } from "../../install/cloud-env.js";
+import { CLAUDE_CLOUD_RELPATH, CODEX_CLOUD_RELPATH, CURSOR_CLOUD_RELPATH, } from "../../install/cloud-env.js";
 import { LOG_PREFIX, setLogPrefix } from "../../shared/log-prefix.js";
+import { isOpencodeSubstringFetchKey, redactUrlParts } from "../../checks/before/files.js";
 import { unusedTrackerMcpServers } from "../../checks/before/mcp.js";
 // ---------------------------------------------------------------------------
 // stripTier2JsonScope — remove bkit-owned JSON scope from consumer doc (BAR-167 Phase 1)
@@ -476,6 +477,9 @@ export async function runUninstall(modules, ctx) {
             return result;
         }
     }
+    // The grants bkit wrote into `.claude/settings.json`, read before the loop below deletes
+    // `.bkit/version` on a full or core uninstall.
+    const claudeAllowDerived = readBkitVersion(path.join(ctx.cwd, ".bkit", "version"))?.claudeAllowDerived ?? [];
     const table = buildDecisionTable(moduleList, ctx);
     result.decisions = table;
     if (ctx.dryRun) {
@@ -548,19 +552,18 @@ export async function runUninstall(modules, ctx) {
                             // the resolved network allowlist and `mcp__…` grants per declared MCP
                             // server (enrichClaudeSettingsAllows). Stripping
                             // against the RAW template leaves those grants behind as if the consumer
-                            // had added them. Recompute the same set — the very function that produced
-                            // them — and treat it as part of the template, exactly as the opencode.json
-                            // sentinel render above does.
+                            // had added them. `.bkit/version` records exactly the rows install wrote
+                            // (`claudeAllowDerived`); treat them as part of the template. A derived-looking
+                            // row the record lacks has unknown ownership: it stays and is listed for review.
                             if (summary.file === path.join(".claude", "settings.json")) {
                                 const perms = templateDoc.permissions;
                                 if (perms !== null && typeof perms === "object" && !Array.isArray(perms)) {
                                     const permsObj = perms;
                                     const allow = permsObj.allow;
                                     if (Array.isArray(allow)) {
-                                        const enriched = resolveClaudeDerivedAllows(ctx.cwd);
                                         permsObj.allow = [
                                             ...allow,
-                                            ...enriched.filter((e) => !allow.includes(e)),
+                                            ...claudeAllowDerived.filter((e) => !allow.includes(e)),
                                         ];
                                     }
                                 }
@@ -570,6 +573,28 @@ export async function runUninstall(modules, ctx) {
                                 : isOpencodeJson
                                     ? stripOpencodeJsonScope(consumerDoc, templatePath, ctx.cwd)
                                     : stripTier2JsonScope(consumerDoc, templateDoc);
+                            if (summary.file === path.join(".claude", "settings.json")) {
+                                const remaining = stripped.permissions?.allow;
+                                if (Array.isArray(remaining)) {
+                                    for (const row of remaining) {
+                                        if (typeof row === "string" &&
+                                            /^(WebFetch\(domain:|mcp__)/.test(row) &&
+                                            !claudeAllowDerived.includes(row)) {
+                                            console.log(`${ctx.logPrefix} review: ${summary.file} keeps ${row} — .bkit/version does not record it as bkit-written; remove it by hand if bkit added it`);
+                                        }
+                                    }
+                                }
+                            }
+                            if (isOpencodeJson) {
+                                const bash = stripped.permission?.bash;
+                                if (bash !== null && typeof bash === "object" && !Array.isArray(bash)) {
+                                    for (const [key, value] of Object.entries(bash)) {
+                                        if (value === "allow" && isOpencodeSubstringFetchKey(key)) {
+                                            console.log(`${ctx.logPrefix} review: ${summary.file} keeps legacy substring grant \`${redactUrlParts(key)}\` in permission.bash — remove it by hand if you did not add it`);
+                                        }
+                                    }
+                                }
+                            }
                             const strippedJson = JSON.stringify(stripped, null, 2) + "\n";
                             if (Object.keys(stripped).length === 0) {
                                 // All keys were bkit-owned → delete file
