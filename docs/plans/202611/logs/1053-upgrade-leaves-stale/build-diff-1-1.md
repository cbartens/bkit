diff --git a/.bkit/core/engine/commands/install/check.integration.test.ts b/.bkit/core/engine/commands/install/check.integration.test.ts
index 34dcc0274..10740e3e8 100644
--- a/.bkit/core/engine/commands/install/check.integration.test.ts
+++ b/.bkit/core/engine/commands/install/check.integration.test.ts
@@ -24,6 +24,7 @@ import { dispatchModules, type ModuleContext } from "../../install/modules/index
 import { parseModelLookup, buildOpencodeModelLookup, parseEffortMap } from "../../render/models";
 import type { WriteSet } from "../../install/write";
 import { getBkitDocsRoot } from "../../shared/package-roots";
+import { readBkitVersion, sha256, writeBkitVersion } from "../../install/version-file";
 import { requireTsx } from "../../../../../vitest.tsx-bin";
 import { localLimit } from "../../../../../vitest.timeout-budget";
 
@@ -240,6 +241,31 @@ describe("#255 #8 — bkit check gates opencode drift (no false positives)", ()
 // lists the host.
 // ---------------------------------------------------------------------------
 
+describe("#1053 — bkit check fails on a wrong entry for a rendered output", () => {
+  it("a wrong entry for a rendered mirror fails check and names the file, a wrong package.json entry does not", () => {
+    expect(runBkit(["install", "--claude", "--tracker=github"]).status).toBe(0);
+    expect(runBkit(["check"]).status).toBe(0);
+
+    const versionFile = path.join(tmpDir, ".bkit", "version");
+    const mirror = ".claude/commands/bkit-build.md";
+
+    // Only the owner-edited package.json entry is wrong: check stays green.
+    const onlyPkg = readBkitVersion(versionFile)!;
+    onlyPkg.canonicalHashes["package.json"] = sha256("stale package.json");
+    writeBkitVersion(versionFile, onlyPkg);
+    const pkgOnly = runBkit(["check"]);
+    expect(pkgOnly.status, combinedOutput(pkgOnly)).toBe(0);
+
+    // A rendered mirror's entry is wrong while the file is current: check fails and names it.
+    const withMirror = readBkitVersion(versionFile)!;
+    withMirror.canonicalHashes[mirror] = sha256("stale mirror");
+    writeBkitVersion(versionFile, withMirror);
+    const wrong = runBkit(["check"]);
+    expect(wrong.status, combinedOutput(wrong)).toBe(1);
+    expect(combinedOutput(wrong)).toContain(mirror);
+  });
+});
+
 describe("bkit check — antigravity detected from any plugin file", () => {
   const plugin = (rel: string) => path.join(tmpDir, ".agents", "plugins", "bkit", rel);
 
diff --git a/.bkit/core/engine/commands/install/upgrade.integration.test.ts b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
index 56f25a612..685b07bee 100644
--- a/.bkit/core/engine/commands/install/upgrade.integration.test.ts
+++ b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
@@ -826,6 +826,54 @@ describe("#717 — .codex/bkit-cloud.md through install, upgrade and check", ()
   });
 });
 
+describe("#1053 — upgrade re-records the entry of every rendered output", () => {
+  const bkitInstallPath = path.resolve(
+    path.dirname(new URL(import.meta.url).pathname),
+    "../../cli.ts",
+  );
+  function runCli(args: string[]) {
+    return spawnSync(requireTsx(), [bkitInstallPath, ...args], {
+      cwd: tmpDir,
+      encoding: "utf-8",
+      env: { ...process.env, NODE_NO_WARNINGS: "1" },
+      timeout: 90_000,
+    });
+  }
+
+  it("re-records a stale entry for a rendered mirror, doc and allowlist that are already current", () => {
+    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
+    fs.writeFileSync(
+      path.join(tmpDir, "package.json"),
+      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
+      "utf-8",
+    );
+    expect(runCli(["install", "--claude", "--tracker=github"]).status).toBe(0);
+
+    const rendered = [
+      ".claude/commands/bkit-build.md",
+      ".bkit/templates.md",
+      ".bkit/allowlist.json",
+    ];
+    const versionFile = path.join(tmpDir, ".bkit", "version");
+    const recorded = readBkitVersion(versionFile)!;
+    for (const rel of rendered) recorded.canonicalHashes[rel] = sha256(`stale ${rel}`);
+    recorded.canonicalHashes["package.json"] = sha256("stale package.json");
+    writeBkitVersion(versionFile, recorded);
+
+    const onDisk = new Map(rendered.map((rel) => [rel, fs.readFileSync(path.join(tmpDir, rel))]));
+
+    expect(runCli(["upgrade", "--auto-apply"]).status).toBe(0);
+
+    const after = readBkitVersion(versionFile)!.canonicalHashes;
+    for (const rel of rendered) {
+      expect(fs.readFileSync(path.join(tmpDir, rel)).equals(onDisk.get(rel)!), rel).toBe(true);
+      expect(after[rel], rel).toBe(sha256(fs.readFileSync(path.join(tmpDir, rel))));
+    }
+    // package.json is the owner's: its entry is not a rendered output and is not rewritten.
+    expect(after["package.json"]).toBe(sha256("stale package.json"));
+  });
+});
+
 describe("#255 — upgrade does not force-create uninstalled host/tooling modules", () => {
   const bkitInstallPath = path.resolve(
     path.dirname(new URL(import.meta.url).pathname),
diff --git a/.bkit/core/engine/commands/install/upgrade.ts b/.bkit/core/engine/commands/install/upgrade.ts
index f86c8aae6..a5a193a12 100644
--- a/.bkit/core/engine/commands/install/upgrade.ts
+++ b/.bkit/core/engine/commands/install/upgrade.ts
@@ -78,7 +78,11 @@ import {
 } from "../../install/template-copies.js";
 import { formatPayloadLinkChanges, syncPayloadLinks } from "../../install/payload-links.js";
 import { renderOpencodeJson, reconcileOpencodeJson } from "../../install/modules/opencode.js";
-import { type ModuleContext, renderManagedOutputs } from "../../install/modules/index.js";
+import {
+  type ModuleContext,
+  listRenderedOutputs,
+  renderManagedOutputs,
+} from "../../install/modules/index.js";
 import { reconcileMcpJson, enrichClaudeSettingsAllows } from "../../install/modules/claude.js";
 import {
   type EffortMap,
@@ -506,12 +510,7 @@ export function updateCanonicalHashesAfterUpgrade(
 
   const fresh: Record<string, string> = {};
   for (const relPath of seedablePaths) {
-    // Exclude .agents/ internal files (docs.md, rules.md,
-    // skills.md, .env.example etc.) from canonicalHashes — they are not consumer-facing files
-    // whose hashes bkit uses for drift detection. Mirrors the same filter applied
-    // in the install path (install/modules/index.ts postDispatch). Template copies carry no
-    // hash there either.
-    if (relPath.startsWith(".agents" + path.sep)) continue;
+    // `.agents/` entries are dropped by mergeCanonicalHashes. Template copies carry no hash.
     if (relPath.startsWith(TEMPLATE_COPIES_DIR + path.sep)) continue;
     const absolutePath = path.join(cwd, relPath);
     if (!fs.existsSync(absolutePath)) continue;
@@ -1048,6 +1047,7 @@ export async function runUpgradeCommand(upgradeFlags: UpgradeFlags): Promise<voi
         updated: [
           ...result.updated,
           ...renderedDocPaths,
+          ...listRenderedOutputs(process.cwd()),
           ...mcpWs.writes.map((w) => path.relative(process.cwd(), w.path)),
           ...artifactWrites,
         ],
diff --git a/.bkit/core/engine/install/modules/core.integration.test.ts b/.bkit/core/engine/install/modules/core.integration.test.ts
index bc91c19e4..c0f0d8c36 100644
--- a/.bkit/core/engine/install/modules/core.integration.test.ts
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -3047,6 +3047,45 @@ describe(
   },
 );
 
+// ---------------------------------------------------------------------------
+// #1053 — the `.bkit/version` entry of a rendered output matches its file
+// ---------------------------------------------------------------------------
+
+describe("#1053 — a core install run re-records rendered outputs and drops .agents/ entries", () => {
+  const versionPath = (): string => path.join(tmpDir, ".bkit", "version");
+
+  it("re-records a stale entry for a rendered output whose file is already current", () => {
+    dispatchModules(new Set(["core"]), makeCtx());
+    const rel = path.join(".bkit", "templates.md");
+    const before = fs.readFileSync(path.join(tmpDir, rel));
+
+    const recorded = readBkitVersion(versionPath())!;
+    recorded.canonicalHashes[rel] = "0".repeat(64);
+    writeBkitVersion(versionPath(), recorded);
+
+    dispatchModules(new Set(["core"]), makeCtx());
+
+    expect(fs.readFileSync(path.join(tmpDir, rel)).equals(before)).toBe(true);
+    expect(readBkitVersion(versionPath())!.canonicalHashes[rel]).toBe(
+      hashFile(path.join(tmpDir, rel)),
+    );
+  });
+
+  it("a core install run drops a recorded .agents/docs.md entry", () => {
+    dispatchModules(new Set(["core"]), makeCtx());
+    const rel = path.join(".agents", "docs.md");
+    expect(fs.existsSync(path.join(tmpDir, rel))).toBe(true);
+
+    const recorded = readBkitVersion(versionPath())!;
+    recorded.canonicalHashes[rel] = "0".repeat(64);
+    writeBkitVersion(versionPath(), recorded);
+
+    dispatchModules(new Set(["core"]), makeCtx());
+
+    expect(Object.keys(readBkitVersion(versionPath())!.canonicalHashes)).not.toContain(rel);
+  });
+});
+
 // ---------------------------------------------------------------------------
 // Fresh install and upgrade keep shared hook behaviour and consumer-owned drivers
 // ---------------------------------------------------------------------------
diff --git a/.bkit/core/engine/install/modules/core.ts b/.bkit/core/engine/install/modules/core.ts
index 9e8c89641..ef0772ace 100644
--- a/.bkit/core/engine/install/modules/core.ts
+++ b/.bkit/core/engine/install/modules/core.ts
@@ -298,6 +298,16 @@ export function bkitDocTokens(tokens: TokenMap): TokenMap {
   };
 }
 
+/**
+ * How a canonical doc is written: `merge` for a markered-text manifest entry (the owner's
+ * text below `bkit:end` survives), `overwrite` for every other doc. The one definition
+ * `runBkitDocs` writes by and `listRenderedOutputs` lists by.
+ */
+export function bkitDocWriteMode(name: string): "merge" | "overwrite" {
+  const entry = getInstallManifest().find((e) => e.path === path.join(".bkit", name));
+  return entry?.format === "markered-text" ? "merge" : "overwrite";
+}
+
 // Mirror the package's canonical `.bkit/*.md` docs into the consumer's `.bkit/`.
 // Tier 1 (force-overwrite + ws-tracked for dry-run/install parity). Each source carries
 // the `{{BKIT_MANAGED_MARKER}}` token. Skipped in dogfood: the consumer destination
@@ -314,7 +324,6 @@ export function runBkitDocs(
   // Per-doc write strategy from the manifest: markered-text docs (e.g. prompts.md,
   // which carries the consumer-owned `## Model Overrides` section below `bkit:end`)
   // are block-merged so consumer content survives; the rest are force-overwritten.
-  const formatByPath = new Map(getInstallManifest().map((e) => [e.path, e.format]));
   for (const name of BKIT_CANONICAL_DOCS) {
     const srcPath = path.join(docsRoot, name);
     // A doc missing from a partial/corrupt package is skipped (writeTier1 throws on a
@@ -322,7 +331,7 @@ export function runBkitDocs(
     if (!fs.existsSync(srcPath)) continue;
     const dstPath = path.join(".bkit", name);
     const prevLen = ws.writes.length;
-    if (formatByPath.get(path.join(".bkit", name)) === "markered-text") {
+    if (bkitDocWriteMode(name) === "merge") {
       writeTier2(srcPath, dstPath, docTokens, "html-comment", dryRun, ws);
     } else {
       writeTier1(srcPath, dstPath, docTokens, dryRun, ws);
@@ -2083,7 +2092,7 @@ export function runCoreModule(ctx: ModuleContext): void {
 
     // Build new canonicalHashes entries from ws.writes (files written in this run).
     // ws.writes is fully populated by the time postDispatch runs.
-    // Exclude .bkit/version itself and .agents/ internal files (not consumer-facing).
+    // Exclude .bkit/version itself; mergeCanonicalHashes drops `.agents/` entries.
     const newCanonicalEntries: Record<string, string> = {};
     for (const entry of ws.writes) {
       // Brand-migrated copy-and-own files carry no hash.
@@ -2091,7 +2100,6 @@ export function runCoreModule(ctx: ModuleContext): void {
       const absPath = path.isAbsolute(entry.path) ? entry.path : path.resolve(cwd, entry.path);
       const relPath = path.relative(cwd, absPath);
       if (relPath === path.join(".bkit", "version")) continue;
-      if (relPath.startsWith(".agents" + path.sep)) continue;
       // Template copies carry no hash.
       if (relPath.startsWith(TEMPLATE_COPIES_DIR + path.sep)) continue;
       // Payload view links carry no hash either — a symlink's bytes are the package's.
@@ -2101,6 +2109,25 @@ export function runCoreModule(ctx: ModuleContext): void {
       if (hash) newCanonicalEntries[relPath] = hash;
     }
 
+    const wroteEntries = Object.keys(newCanonicalEntries).length;
+
+    // Every force-rendered output is re-hashed from disk, written this run or not. An
+    // existing entry that differs from the file is stale: record the file's hash and
+    // write `.bkit/version`, which `bkit check` counts as drift.
+    const staleRendered: string[] = [];
+    for (const rel of ctx.renderedOutputs ?? []) {
+      const hash = hashFile(path.resolve(cwd, rel));
+      if (!hash) continue;
+      const recorded = existingCanonical[rel];
+      if (recorded !== undefined && recorded !== hash) staleRendered.push(rel);
+      newCanonicalEntries[rel] = hash;
+    }
+    if (staleRendered.length > 0) {
+      console.log(
+        `${logPrefix} ${tag}stale .bkit/version entries re-recorded: ${staleRendered.join(", ")}`,
+      );
+    }
+
     // Merge: existing hashes preserved, new writes overwrite (hashes stay current),
     // and entries whose path is gone are pruned (mergeCanonicalHashes).
     const { canonicalHashes, pruned } = mergeCanonicalHashes(
@@ -2112,7 +2139,7 @@ export function runCoreModule(ctx: ModuleContext): void {
     // Decide whether a write is needed: version mismatch, first install, new canonical
     // entries, a pruned stale entry, or a changed claudeAllowDerived record.
     const versionChanged = !existingVersion || existingVersion.pinnedVersion !== pkgVersion;
-    const hasNewEntries = Object.keys(newCanonicalEntries).length > 0;
+    const hasNewEntries = wroteEntries > 0 || staleRendered.length > 0;
     const claudeAllowDerived = ctx.claudeAllowRecorded ?? existingVersion?.claudeAllowDerived ?? [];
     const derivedChanged =
       JSON.stringify(claudeAllowDerived) !==
diff --git a/.bkit/core/engine/install/modules/index.integration.test.ts b/.bkit/core/engine/install/modules/index.integration.test.ts
index 6a830bf07..1e0acfa9b 100644
--- a/.bkit/core/engine/install/modules/index.integration.test.ts
+++ b/.bkit/core/engine/install/modules/index.integration.test.ts
@@ -15,7 +15,7 @@ import { listFilesRecursive, remapTemplateDest } from "../template-copies";
 import { getBkitDocsRoot, getTemplatesRoot } from "../../shared/package-roots";
 import { runCoreModule } from "./core";
 import { renderOpencodeJson } from "./opencode";
-import { dispatchModules, type ModuleContext } from "./index";
+import { dispatchModules, listRenderedOutputs, type ModuleContext } from "./index";
 import { BKIT_GATE_SCRIPTS, ISSUE_TRACKERS } from "../manifest";
 import { readBkitVersion, writeBkitVersion } from "../version-file";
 import { writeCursorCliPermissionsArtifact } from "../cloud-env";
@@ -159,6 +159,37 @@ describe("module dispatch: --claude seeds only .claude/** + core", () => {
   });
 });
 
+describe("listRenderedOutputs: the files bkit force-renders", () => {
+  const rendered = (): string[] =>
+    listRenderedOutputs(tmpDir).map((p) => path.normalize(p).split(path.sep).join("/"));
+
+  it("lists the force-rendered outputs of a claude install and nothing the owner shares", () => {
+    dispatchModules(new Set(["core", "claude"]), makeCtx());
+    const list = rendered();
+
+    expect(list).toContain(".bkit/templates.md");
+    expect(list).toContain(".bkit/allowlist.json");
+    expect(list).toContain(".claude/commands/bkit-build.md");
+    expect(list.some((p) => p.startsWith(".claude/agents/"))).toBe(true);
+
+    expect(list).not.toContain("package.json");
+    expect(list).not.toContain(".mcp.json");
+    expect(list).not.toContain(".bkit/prompts.md");
+    expect(list).not.toContain(".claude/settings.json");
+    expect(list.filter((p) => p.startsWith(".agents/"))).toEqual([]);
+  });
+
+  it("names no other host's mirror for a claude-only install", () => {
+    dispatchModules(new Set(["core", "claude"]), makeCtx());
+    const list = rendered();
+
+    expect(list).toContain(".claude/commands/bkit-build.md");
+    expect(list.filter((p) => p.startsWith(".cursor/"))).toEqual([]);
+    expect(list.filter((p) => p.startsWith(".opencode/"))).toEqual([]);
+    expect(list.filter((p) => p.startsWith(".codex/"))).toEqual([]);
+  });
+});
+
 describe("module dispatch: --core alone seeds no host or tooling file", () => {
   it("core writes the core payload; nothing under Cursor/Claude/Husky/GitHub", () => {
     const ws = makeWriteSet();
diff --git a/.bkit/core/engine/install/modules/index.ts b/.bkit/core/engine/install/modules/index.ts
index c2f4d63c8..2c4a39083 100644
--- a/.bkit/core/engine/install/modules/index.ts
+++ b/.bkit/core/engine/install/modules/index.ts
@@ -14,9 +14,11 @@ import type { EffortMap } from "../../render/models.js";
 import type { PreflightFinding } from "../../checks/before/index.js";
 import { getCoreRoot, getSharedRoot } from "../../shared/package-roots.js";
 import { getInstallManifest, type IssueTracker } from "../manifest.js";
-import { writeNetworkAllowlist } from "../network-allowlist.js";
+import { NETWORK_ALLOWLIST_RELPATH, writeNetworkAllowlist } from "../network-allowlist.js";
 import {
+  BKIT_CANONICAL_DOCS,
   BKIT_PREFIX,
+  bkitDocWriteMode,
   listCoreTemplateFiles,
   listSharedTemplateFiles,
   runBkitDocs,
@@ -99,6 +101,12 @@ export interface ModuleContext {
    * install/upgrade set it explicitly.
    */
   version?: string;
+  /**
+   * Consumer-relative paths of every file bkit force-renders (`listRenderedOutputs`), set
+   * by `dispatchModules` after the modules ran and before the `postDispatch` callbacks.
+   * Absent in isolated unit tests.
+   */
+  renderedOutputs?: readonly string[];
   /**
    * The full set of host modules present for this run — the dispatched set UNION the hosts
    * already on disk. Read by the Antigravity module to warn when Codex is also installed
@@ -184,6 +192,39 @@ const RENDERED_MIRRORS: ReadonlyArray<[dir: string, ext: string]> = [
   [".agents/plugins/bkit/agents", ".md"],
 ];
 
+/** The `bkit-*` mirror files present on disk in each rendered mirror dir. */
+function listRenderedMirrors(cwd: string): string[] {
+  const out: string[] = [];
+  for (const [dir, ext] of RENDERED_MIRRORS) {
+    const abs = path.join(cwd, dir);
+    if (!fs.existsSync(abs)) continue;
+    for (const f of fs.readdirSync(abs)) {
+      if (f.startsWith(BKIT_PREFIX) && f.endsWith(ext)) out.push(path.join(dir, f));
+    }
+  }
+  return out;
+}
+
+/**
+ * Every file bkit force-renders whole into `cwd` that exists on disk: the non-markered
+ * `.bkit/*.md` docs, `.bkit/allowlist.json` and the host agent/command mirrors present.
+ * Never an `.agents/` path, `package.json`, `.mcp.json` or a block-merged doc: the owner
+ * shares those files, so their recorded hash may differ from the file. Consumer-relative.
+ */
+export function listRenderedOutputs(cwd: string): string[] {
+  const out: string[] = [];
+  for (const name of BKIT_CANONICAL_DOCS) {
+    if (bkitDocWriteMode(name) !== "overwrite") continue;
+    const rel = path.join(".bkit", name);
+    if (fs.existsSync(path.join(cwd, rel))) out.push(rel);
+  }
+  if (fs.existsSync(path.join(cwd, NETWORK_ALLOWLIST_RELPATH))) out.push(NETWORK_ALLOWLIST_RELPATH);
+  for (const p of listRenderedMirrors(cwd)) {
+    if (!p.startsWith(".agents")) out.push(p);
+  }
+  return out;
+}
+
 /**
  * Every file bkit writes into `cwd` that carries the managed-version marker: the core
  * payload (listCoreTemplateFiles), the non-JSON non-generated manifest entries of every
@@ -207,13 +248,7 @@ export function listStampedFiles(cwd: string): StampedFile[] {
     add(entry.path, entry.format === "markered-text" ? "block" : "whole");
   }
 
-  for (const [dir, ext] of RENDERED_MIRRORS) {
-    const abs = path.join(cwd, dir);
-    if (!fs.existsSync(abs)) continue;
-    for (const f of fs.readdirSync(abs)) {
-      if (f.startsWith(BKIT_PREFIX) && f.endsWith(ext)) add(path.join(dir, f), "whole");
-    }
-  }
+  for (const p of listRenderedMirrors(cwd)) add(p, "whole");
   // Codex renders workflow skills into `.agents/skills/bkit-*/SKILL.md`; Antigravity renders
   // its own into the plugin `.agents/plugins/bkit/skills/bkit-*/SKILL.md`. Both stamp a
   // managed-version marker; collect each for the stale detector.
@@ -268,6 +303,7 @@ export function dispatchModules(modules: Set<ModuleFlag>, ctx: ModuleContext): v
     if (!fn) continue;
     fn(ctx);
   }
+  ctx.renderedOutputs = listRenderedOutputs(process.cwd());
   // Run deferred finalisation callbacks (e.g. .bkit/version write) only after all modules succeed.
   for (const cb of ctx.postDispatch) {
     cb();
diff --git a/.bkit/core/engine/install/version-file.integration.test.ts b/.bkit/core/engine/install/version-file.integration.test.ts
index 956db3544..e494889df 100644
--- a/.bkit/core/engine/install/version-file.integration.test.ts
+++ b/.bkit/core/engine/install/version-file.integration.test.ts
@@ -124,3 +124,25 @@ describe("updateCanonicalHashesAfterUpgrade prunes hashes for absent paths", ()
     expect(fs.readFileSync(versionFile, "utf-8")).toBe(before);
   });
 });
+
+describe("updateCanonicalHashesAfterUpgrade drops .agents/ entries (#1053)", () => {
+  it("updateCanonicalHashesAfterUpgrade drops a recorded .agents/docs.md entry", () => {
+    fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
+    fs.writeFileSync(path.join(tmpDir, ".agents", "docs.md"), "docs", "utf-8");
+    fs.writeFileSync(path.join(tmpDir, "kept.md"), "kept", "utf-8");
+    const versionFile = path.join(tmpDir, ".bkit", "version");
+    fs.mkdirSync(path.dirname(versionFile), { recursive: true });
+    writeBkitVersion(versionFile, {
+      pinnedVersion: "4.12.0",
+      canonicalHashes: { ".agents/docs.md": sha256("old docs"), "kept.md": sha256("kept") },
+      claudeAllowDerived: [],
+    });
+
+    updateCanonicalHashesAfterUpgrade(
+      { updated: [], conflicts: [], skipped: [], skippedSeedable: [] },
+      { dryRun: false, cwd: tmpDir },
+    );
+
+    expect(readBkitVersion(versionFile)!.canonicalHashes).toEqual({ "kept.md": sha256("kept") });
+  });
+});
diff --git a/.bkit/core/engine/install/version-file.test.ts b/.bkit/core/engine/install/version-file.test.ts
index 2739ae8f9..83488ea72 100644
--- a/.bkit/core/engine/install/version-file.test.ts
+++ b/.bkit/core/engine/install/version-file.test.ts
@@ -395,3 +395,32 @@ describe("claudeAllowDerived provenance field (T16)", () => {
     expect(parseBkitVersion(serializeBkitVersion(parsed!))?.claudeAllowDerived).toEqual(rows);
   });
 });
+
+describe("mergeCanonicalHashes drops .agents/ entries (#1053)", () => {
+  const seedAgents = (): void => {
+    fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
+    fs.writeFileSync(path.join(tmpDir, ".agents", "docs.md"), "docs", "utf-8");
+    fs.writeFileSync(path.join(tmpDir, "kept.md"), "kept", "utf-8");
+  };
+
+  it("prunes an existing .agents/ entry and counts it", () => {
+    seedAgents();
+    const result = mergeCanonicalHashes(
+      tmpDir,
+      { ".agents/docs.md": sha256("docs"), "kept.md": sha256("kept") },
+      {},
+    );
+    expect(result.canonicalHashes).toEqual({ "kept.md": sha256("kept") });
+    expect(result.pruned).toBe(1);
+  });
+
+  it("drops a fresh .agents/ entry", () => {
+    seedAgents();
+    const result = mergeCanonicalHashes(
+      tmpDir,
+      {},
+      { ".agents/docs.md": sha256("docs"), "kept.md": sha256("kept") },
+    );
+    expect(result.canonicalHashes).toEqual({ "kept.md": sha256("kept") });
+  });
+});
diff --git a/.bkit/core/engine/install/version-file.ts b/.bkit/core/engine/install/version-file.ts
index 1960340fc..f60039637 100644
--- a/.bkit/core/engine/install/version-file.ts
+++ b/.bkit/core/engine/install/version-file.ts
@@ -187,7 +187,8 @@ export function mergeCanonicalHashes(
       !fs.existsSync(path.join(cwd, relPath)) ||
       isRemoving(relPath) ||
       isTemplateSetPath(relPath) ||
-      isSchemaLedger(relPath)
+      isSchemaLedger(relPath) ||
+      isAgentsPath(relPath)
     ) {
       pruned++;
       continue;
@@ -195,10 +196,18 @@ export function mergeCanonicalHashes(
     canonicalHashes[relPath] = hash;
   }
   // A ledger is append-only data a migration may rewrite, never a managed file.
-  const kept = Object.fromEntries(Object.entries(fresh).filter(([p]) => !isSchemaLedger(p)));
+  // `.agents/*` files are block-merged doctrine the owner writes below `bkit:end`; no entry is kept.
+  const kept = Object.fromEntries(
+    Object.entries(fresh).filter(([p]) => !isSchemaLedger(p) && !isAgentsPath(p)),
+  );
   return { canonicalHashes: { ...canonicalHashes, ...kept }, pruned };
 }
 
+/** True when `relPath` is under `.agents/`, whose files carry no recorded hash. */
+function isAgentsPath(relPath: string): boolean {
+  return relPath.replace(/\\/g, "/").startsWith(".agents/");
+}
+
 /** True when `dest` is a member of the package's copy-and-own template set. */
 function isTemplateSetPath(dest: string): boolean {
   return fs.existsSync(path.join(getTemplatesRoot(), templateRelPath(dest)));
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index f44aa4b3d..ca91d1972 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -300,3 +300,4 @@
 {"schema":3,"ts":1794973968097,"kind":"friction","key":"review-agent-turn-limit/plan-review-2","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"plan","step":"plan-review"},"references":["1008-plan-design-owner","#1008"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"@bkit-plan-review-2 stopped at its 100-turn limit with no result file, so the orchestrator resumed it to finish","description":"@bkit-plan-review-2 used all 100 turns reading code for the 1008 plan and stopped before writing its result JSON; its review file was partly written. The orchestrator sent it one message to finish from what it had found, and it wrote the result file on the resumed turn.","remediation":"Raise the review agent's turn cap or have it write its result file before its last turns, as was done for the utility agents.","source":"orchestrator","status":"OPEN"}
 {"schema":3,"ts":1794977744207,"kind":"friction","key":"plan-tasks-gate-wait/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["1039-ledger-query-status","#1039"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"Code agent handed back PASS but left its own changed-files gate running for 30 minutes under load, so it was stopped","description":"@bkit-build-plan-tasks (group 1) logged DONE for all 3 tasks and Verdict: PASS, then stayed alive waiting on a second `bkit:gate:changed` run that was still going 30 minutes after it started, with the load average at 23-34 from parallel builds. The orchestrator stopped the agent, which ended its gate processes, and finished the step from the PASS log. Same pattern as build 1030 group 3.","remediation":"Have the code agent's changed-files gate respect the machine load, or drop the agent-side gate when the workflow's own group and holistic gates re-run the same checks.","source":"orchestrator","status":"OPEN"}
 {"schema":3,"ts":1794997700690,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":32,"lastConfirmed":1794997700690}
+{"schema":3,"ts":1795006591834,"kind":"friction","key":"plan-tasks-pending-timeout/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["1053-upgrade-leaves-stale","#1053"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"Code agent's log still said PENDING after 20 minutes, so it was stopped and the step run again","description":"@bkit-build-plan-tasks (group 1, attempt 1) had edited 4 source files but logged no task DONE after 20 minutes; it was still waiting on an integration test run. Per the run's standing rules the orchestrator stopped it and launched the step once more, telling the new agent to review the uncommitted edits.","remediation":"Have the code agent log each task DONE as soon as its tests pass, so a fallback timer sees progress instead of PENDING.","source":"orchestrator","status":"OPEN"}
diff --git a/.bkit/version b/.bkit/version
index 9eb463b87..9d20609d5 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -3,9 +3,6 @@
   "canonicalHashes": {
     ".cursor/mcp.json": "355e01cadabed3b924ebe339dc07ecbf7179397ebc9accf8618d5d7d6af6c438",
     ".claude/settings.json": "941a9b8010dd5b9df7b8df6f7fdf169a3713a1e459946098cbdc288ef1198176",
-    ".agents/context.md": "5cf54b91ffaa5d9372415a24dd1acfe0910c7def1f4434e25ccf110e3eaed013",
-    ".agents/docs.md": "857b24f8b0b95179be374a25b5886cef857068902ba901b95e4988ddbf50a93e",
-    ".agents/skills.md": "71dc53bcab370fbe1aacc3239edc3395e3cf9ff9f507c9cda49669846cf7f14b",
     "AGENTS.md": "83bf04d6f604e3ffad44a677961b4bc62c11213c9ab3413330131a413ea01a74",
     "CLAUDE.md": "f10a4f2eef97c6db12ea336a14a062a4089f97d042d5a007259c7738e0883e8e",
     ".gitattributes": "3fdc7d0fc2655afc90d395cf52cda7f99f211b991184dfafaecd84d93c5da336",
@@ -205,7 +202,7 @@
     ".cursor/agents/bkit-utility-update-roadmap.md": "18c26161534caefd8c43c585ad868eaa5e26b4aff000afebb105d338a5f455b7",
     "docs/templates/bkit-audit-agents.md": "aebbd89d40f221122c76983f74a3320d306c863fdf621bac0d62a016370f2a7f",
     "docs/templates/bkit-audit-prompts.md": "c996e6e26d5ee7e5e19cc02b259e2f7e6356233f78eb3dab4fec160a7d1497ee",
-    ".bkit/templates.md": "1881763878ce6990fb837c3ba466e0f0700312f261f8c257d99b5f02b9144339",
+    ".bkit/templates.md": "c6362c1b0f2f7a4e182697517cc8ea8523e5648335616791f5d22664f3eac3c8",
     "docs/templates/bkit-audit-adoption.md": "e5c51a0e1b815044a83c405af7ce1e51e5690c99b937a61a7e3fcc2fddc8fe7f",
     ".bkit/cloud.md": "945c4abe584a15aeca979d5e13b2ea5f8915c5198dc8dd9226b1d020118c4c7d",
     ".bkit/comparison.md": "8d62c438ca6293483e6c752e9864d8123a0fa642906dfb15bc08b09a3b224b92",
@@ -237,7 +234,7 @@
     ".cursor/agents/bkit-debug-failure-reproduce.md": "ac195898816581e952892b7cc5fc7efd28192706d01440dafe7aed50b67025b0",
     ".opencode/agents/bkit-debug-failure-reproduce.md": "acdd95a6bfd79a25ae82ed67bf4234e80383a585518719853620a69b4399d1dd",
     ".codex/agents/bkit-debug-failure-reproduce.toml": "b7805491bbe6772805c5334eb2aa97ba12e022396dd9509ecbb9e4a619212f3b",
-    ".bkit/allowlist.json": "47f68886cd8488cd0ff0b77ac7bd985b9e33bc0484db2c4cbfca3b84c694fbce",
+    ".bkit/allowlist.json": "79268cabd25db8488d631c42fe8e9f011f06ce365cf807084aef9fa0cafb5b3c",
     ".claude/agents/bkit-utility-update-tracker.md": "2818292f67ae90a164c988beb54029cbf3bafd9c2c83ffdd2da4dd6a7e086450",
     ".cursor/agents/bkit-utility-update-tracker.md": "6bc27b2f86c7786d7ea28445533123661899f5a54c37f825a5ab3e6482b51c5c",
     ".opencode/agents/bkit-utility-update-tracker.md": "ef1bcaaaf6a8a8bebf5f214c825c4fc38c6e52a8ec875e7e5821976c7d40f87a",
diff --git a/dist/commands/install/upgrade.js b/dist/commands/install/upgrade.js
index 4789a9799..6d97d3be8 100644
--- a/dist/commands/install/upgrade.js
+++ b/dist/commands/install/upgrade.js
@@ -42,7 +42,7 @@ import { CLAUDE_CLOUD_RELPATH, CODEX_CLOUD_RELPATH, CURSOR_CLOUD_RELPATH, writeC
 import { syncTemplateCopies, formatTemplateChanges, warnMissingLintStagedConfig, } from "../../install/template-copies.js";
 import { formatPayloadLinkChanges, syncPayloadLinks } from "../../install/payload-links.js";
 import { renderOpencodeJson, reconcileOpencodeJson } from "../../install/modules/opencode.js";
-import { renderManagedOutputs } from "../../install/modules/index.js";
+import { listRenderedOutputs, renderManagedOutputs, } from "../../install/modules/index.js";
 import { reconcileMcpJson, enrichClaudeSettingsAllows } from "../../install/modules/claude.js";
 import { parseModelLookup, applyModelOverrides, buildOpencodeModelLookup, buildAntigravityModelLookup, parseEffortMap, } from "../../render/models.js";
 /** Zero-value token map — markered-text templates managed on upgrade are token-free. */
@@ -314,13 +314,7 @@ export function updateCanonicalHashesAfterUpgrade(result, options) {
     const seedablePaths = new Set([...result.updated, ...result.skippedSeedable]);
     const fresh = {};
     for (const relPath of seedablePaths) {
-        // Exclude .agents/ internal files (docs.md, rules.md,
-        // skills.md, .env.example etc.) from canonicalHashes — they are not consumer-facing files
-        // whose hashes bkit uses for drift detection. Mirrors the same filter applied
-        // in the install path (install/modules/index.ts postDispatch). Template copies carry no
-        // hash there either.
-        if (relPath.startsWith(".agents" + path.sep))
-            continue;
+        // `.agents/` entries are dropped by mergeCanonicalHashes. Template copies carry no hash.
         if (relPath.startsWith(TEMPLATE_COPIES_DIR + path.sep))
             continue;
         const absolutePath = path.join(cwd, relPath);
@@ -783,6 +777,7 @@ export async function runUpgradeCommand(upgradeFlags) {
             updated: [
                 ...result.updated,
                 ...renderedDocPaths,
+                ...listRenderedOutputs(process.cwd()),
                 ...mcpWs.writes.map((w) => path.relative(process.cwd(), w.path)),
                 ...artifactWrites,
             ],
diff --git a/dist/install/modules/core.js b/dist/install/modules/core.js
index cce5fb99d..1cabcdbce 100644
--- a/dist/install/modules/core.js
+++ b/dist/install/modules/core.js
@@ -216,6 +216,15 @@ export function bkitDocTokens(tokens) {
         REPO_SLUG: "{{REPO_SLUG}}",
     };
 }
+/**
+ * How a canonical doc is written: `merge` for a markered-text manifest entry (the owner's
+ * text below `bkit:end` survives), `overwrite` for every other doc. The one definition
+ * `runBkitDocs` writes by and `listRenderedOutputs` lists by.
+ */
+export function bkitDocWriteMode(name) {
+    const entry = getInstallManifest().find((e) => e.path === path.join(".bkit", name));
+    return entry?.format === "markered-text" ? "merge" : "overwrite";
+}
 // Mirror the package's canonical `.bkit/*.md` docs into the consumer's `.bkit/`.
 // Tier 1 (force-overwrite + ws-tracked for dry-run/install parity). Each source carries
 // the `{{BKIT_MANAGED_MARKER}}` token. Skipped in dogfood: the consumer destination
@@ -227,7 +236,6 @@ export function runBkitDocs(dryRun, tokens, ws, logPrefix) {
     // Per-doc write strategy from the manifest: markered-text docs (e.g. prompts.md,
     // which carries the consumer-owned `## Model Overrides` section below `bkit:end`)
     // are block-merged so consumer content survives; the rest are force-overwritten.
-    const formatByPath = new Map(getInstallManifest().map((e) => [e.path, e.format]));
     for (const name of BKIT_CANONICAL_DOCS) {
         const srcPath = path.join(docsRoot, name);
         // A doc missing from a partial/corrupt package is skipped (writeTier1 throws on a
@@ -236,7 +244,7 @@ export function runBkitDocs(dryRun, tokens, ws, logPrefix) {
             continue;
         const dstPath = path.join(".bkit", name);
         const prevLen = ws.writes.length;
-        if (formatByPath.get(path.join(".bkit", name)) === "markered-text") {
+        if (bkitDocWriteMode(name) === "merge") {
             writeTier2(srcPath, dstPath, docTokens, "html-comment", dryRun, ws);
         }
         else {
@@ -1870,7 +1878,7 @@ export function runCoreModule(ctx) {
         const existingCanonical = existingVersion?.canonicalHashes ?? {};
         // Build new canonicalHashes entries from ws.writes (files written in this run).
         // ws.writes is fully populated by the time postDispatch runs.
-        // Exclude .bkit/version itself and .agents/ internal files (not consumer-facing).
+        // Exclude .bkit/version itself; mergeCanonicalHashes drops `.agents/` entries.
         const newCanonicalEntries = {};
         for (const entry of ws.writes) {
             // Brand-migrated copy-and-own files carry no hash.
@@ -1880,8 +1888,6 @@ export function runCoreModule(ctx) {
             const relPath = path.relative(cwd, absPath);
             if (relPath === path.join(".bkit", "version"))
                 continue;
-            if (relPath.startsWith(".agents" + path.sep))
-                continue;
             // Template copies carry no hash.
             if (relPath.startsWith(TEMPLATE_COPIES_DIR + path.sep))
                 continue;
@@ -1894,13 +1900,30 @@ export function runCoreModule(ctx) {
             if (hash)
                 newCanonicalEntries[relPath] = hash;
         }
+        const wroteEntries = Object.keys(newCanonicalEntries).length;
+        // Every force-rendered output is re-hashed from disk, written this run or not. An
+        // existing entry that differs from the file is stale: record the file's hash and
+        // write `.bkit/version`, which `bkit check` counts as drift.
+        const staleRendered = [];
+        for (const rel of ctx.renderedOutputs ?? []) {
+            const hash = hashFile(path.resolve(cwd, rel));
+            if (!hash)
+                continue;
+            const recorded = existingCanonical[rel];
+            if (recorded !== undefined && recorded !== hash)
+                staleRendered.push(rel);
+            newCanonicalEntries[rel] = hash;
+        }
+        if (staleRendered.length > 0) {
+            console.log(`${logPrefix} ${tag}stale .bkit/version entries re-recorded: ${staleRendered.join(", ")}`);
+        }
         // Merge: existing hashes preserved, new writes overwrite (hashes stay current),
         // and entries whose path is gone are pruned (mergeCanonicalHashes).
         const { canonicalHashes, pruned } = mergeCanonicalHashes(cwd, existingCanonical, newCanonicalEntries);
         // Decide whether a write is needed: version mismatch, first install, new canonical
         // entries, a pruned stale entry, or a changed claudeAllowDerived record.
         const versionChanged = !existingVersion || existingVersion.pinnedVersion !== pkgVersion;
-        const hasNewEntries = Object.keys(newCanonicalEntries).length > 0;
+        const hasNewEntries = wroteEntries > 0 || staleRendered.length > 0;
         const claudeAllowDerived = ctx.claudeAllowRecorded ?? existingVersion?.claudeAllowDerived ?? [];
         const derivedChanged = JSON.stringify(claudeAllowDerived) !==
             JSON.stringify(existingVersion?.claudeAllowDerived ?? []);
diff --git a/dist/install/modules/index.js b/dist/install/modules/index.js
index 960f9c9d3..6b3147aab 100644
--- a/dist/install/modules/index.js
+++ b/dist/install/modules/index.js
@@ -8,8 +8,8 @@ import * as fs from "node:fs";
 import * as path from "node:path";
 import { getCoreRoot, getSharedRoot } from "../../shared/package-roots.js";
 import { getInstallManifest } from "../manifest.js";
-import { writeNetworkAllowlist } from "../network-allowlist.js";
-import { BKIT_PREFIX, listCoreTemplateFiles, listSharedTemplateFiles, runBkitDocs, runCoreModule, seedCorePackageJsonScripts, } from "./core.js";
+import { NETWORK_ALLOWLIST_RELPATH, writeNetworkAllowlist } from "../network-allowlist.js";
+import { BKIT_CANONICAL_DOCS, BKIT_PREFIX, bkitDocWriteMode, listCoreTemplateFiles, listSharedTemplateFiles, runBkitDocs, runCoreModule, seedCorePackageJsonScripts, } from "./core.js";
 import { renderClaudeAgentsCommands, runClaudeModule } from "./claude.js";
 import { renderCursorAgentsCommands, runCursorModule } from "./cursor.js";
 import { renderOpencodeAgentsCommands, runOpencodeModule } from "./opencode.js";
@@ -73,6 +73,43 @@ const RENDERED_MIRRORS = [
     [".codex/agents", ".toml"],
     [".agents/plugins/bkit/agents", ".md"],
 ];
+/** The `bkit-*` mirror files present on disk in each rendered mirror dir. */
+function listRenderedMirrors(cwd) {
+    const out = [];
+    for (const [dir, ext] of RENDERED_MIRRORS) {
+        const abs = path.join(cwd, dir);
+        if (!fs.existsSync(abs))
+            continue;
+        for (const f of fs.readdirSync(abs)) {
+            if (f.startsWith(BKIT_PREFIX) && f.endsWith(ext))
+                out.push(path.join(dir, f));
+        }
+    }
+    return out;
+}
+/**
+ * Every file bkit force-renders whole into `cwd` that exists on disk: the non-markered
+ * `.bkit/*.md` docs, `.bkit/allowlist.json` and the host agent/command mirrors present.
+ * Never an `.agents/` path, `package.json`, `.mcp.json` or a block-merged doc: the owner
+ * shares those files, so their recorded hash may differ from the file. Consumer-relative.
+ */
+export function listRenderedOutputs(cwd) {
+    const out = [];
+    for (const name of BKIT_CANONICAL_DOCS) {
+        if (bkitDocWriteMode(name) !== "overwrite")
+            continue;
+        const rel = path.join(".bkit", name);
+        if (fs.existsSync(path.join(cwd, rel)))
+            out.push(rel);
+    }
+    if (fs.existsSync(path.join(cwd, NETWORK_ALLOWLIST_RELPATH)))
+        out.push(NETWORK_ALLOWLIST_RELPATH);
+    for (const p of listRenderedMirrors(cwd)) {
+        if (!p.startsWith(".agents"))
+            out.push(p);
+    }
+    return out;
+}
 /**
  * Every file bkit writes into `cwd` that carries the managed-version marker: the core
  * payload (listCoreTemplateFiles), the non-JSON non-generated manifest entries of every
@@ -98,15 +135,8 @@ export function listStampedFiles(cwd) {
             continue;
         add(entry.path, entry.format === "markered-text" ? "block" : "whole");
     }
-    for (const [dir, ext] of RENDERED_MIRRORS) {
-        const abs = path.join(cwd, dir);
-        if (!fs.existsSync(abs))
-            continue;
-        for (const f of fs.readdirSync(abs)) {
-            if (f.startsWith(BKIT_PREFIX) && f.endsWith(ext))
-                add(path.join(dir, f), "whole");
-        }
-    }
+    for (const p of listRenderedMirrors(cwd))
+        add(p, "whole");
     // Codex renders workflow skills into `.agents/skills/bkit-*/SKILL.md`; Antigravity renders
     // its own into the plugin `.agents/plugins/bkit/skills/bkit-*/SKILL.md`. Both stamp a
     // managed-version marker; collect each for the stale detector.
@@ -161,6 +191,7 @@ export function dispatchModules(modules, ctx) {
             continue;
         fn(ctx);
     }
+    ctx.renderedOutputs = listRenderedOutputs(process.cwd());
     // Run deferred finalisation callbacks (e.g. .bkit/version write) only after all modules succeed.
     for (const cb of ctx.postDispatch) {
         cb();
diff --git a/dist/install/version-file.js b/dist/install/version-file.js
index ce773b2d5..94cf06eb0 100644
--- a/dist/install/version-file.js
+++ b/dist/install/version-file.js
@@ -134,16 +134,22 @@ export function mergeCanonicalHashes(cwd, existing, fresh, removing = []) {
         if (!fs.existsSync(path.join(cwd, relPath)) ||
             isRemoving(relPath) ||
             isTemplateSetPath(relPath) ||
-            isSchemaLedger(relPath)) {
+            isSchemaLedger(relPath) ||
+            isAgentsPath(relPath)) {
             pruned++;
             continue;
         }
         canonicalHashes[relPath] = hash;
     }
     // A ledger is append-only data a migration may rewrite, never a managed file.
-    const kept = Object.fromEntries(Object.entries(fresh).filter(([p]) => !isSchemaLedger(p)));
+    // `.agents/*` files are block-merged doctrine the owner writes below `bkit:end`; no entry is kept.
+    const kept = Object.fromEntries(Object.entries(fresh).filter(([p]) => !isSchemaLedger(p) && !isAgentsPath(p)));
     return { canonicalHashes: { ...canonicalHashes, ...kept }, pruned };
 }
+/** True when `relPath` is under `.agents/`, whose files carry no recorded hash. */
+function isAgentsPath(relPath) {
+    return relPath.replace(/\\/g, "/").startsWith(".agents/");
+}
 /** True when `dest` is a member of the package's copy-and-own template set. */
 function isTemplateSetPath(dest) {
     return fs.existsSync(path.join(getTemplatesRoot(), templateRelPath(dest)));
