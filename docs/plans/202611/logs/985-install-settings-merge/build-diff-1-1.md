diff --git a/.bkit/core/engine/commands/install/upgrade.integration.test.ts b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
index 685b07bee..6d1c5d066 100644
--- a/.bkit/core/engine/commands/install/upgrade.integration.test.ts
+++ b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
@@ -2862,3 +2862,59 @@ describe("#803 — upgrade over legacy OpenCode substring fetch grants", () => {
     expect(substringKeys.sort()).toEqual(["curl *github.com*", "wget *github.com*"]);
   });
 });
+
+describe("#985 — upgrade takes back a retired settings grant", () => {
+  const cliPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../cli.ts");
+  function runCli(args: string[]) {
+    return spawnSync(requireTsx(), [cliPath, ...args], {
+      cwd: tmpDir,
+      encoding: "utf-8",
+      env: { ...process.env, NODE_NO_WARNINGS: "1" },
+      timeout: 90_000,
+    });
+  }
+  const RETIRED = "mcp__claude_ai_Linear__*";
+  const SETTINGS = path.join(".claude", "settings.json");
+
+  /** An installed consumer whose settings still hold the retired grant and one of its own. */
+  function seedOldShapeSettings(): string {
+    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
+    fs.writeFileSync(
+      path.join(tmpDir, "package.json"),
+      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
+      "utf-8",
+    );
+    expect(runCli(["install", "--claude", "--tracker=github"]).status).toBe(0);
+    const file = path.join(tmpDir, SETTINGS);
+    const doc = JSON.parse(fs.readFileSync(file, "utf-8")) as {
+      permissions: { allow: string[] };
+    };
+    doc.permissions.allow.push(RETIRED, "mcp__person__*");
+    fs.writeFileSync(file, JSON.stringify(doc, null, 2) + "\n", "utf-8");
+    return file;
+  }
+
+  it("upgrade over a seeded old-shape settings file removes the retired grant and keeps the person's", () => {
+    const file = seedOldShapeSettings();
+    const upgrade = runCli(["upgrade", "--auto-apply"]);
+    expect(upgrade.status, combinedOutput(upgrade)).toBe(0);
+    const allow = (
+      JSON.parse(fs.readFileSync(file, "utf-8")) as { permissions: { allow: string[] } }
+    ).permissions.allow;
+    expect(allow).not.toContain(RETIRED);
+    expect(allow).toContain("mcp__person__*");
+    const second = runCli(["upgrade", "--auto-apply"]);
+    expect(second.status, combinedOutput(second)).toBe(0);
+    expect(runCli(["check"]).stdout).toContain("0 write(s) would occur");
+  });
+
+  it("upgrade dry run lists the settings update and leaves the retired grant", () => {
+    const file = seedOldShapeSettings();
+    const before = fs.readFileSync(file, "utf-8");
+    const dry = runCli(["upgrade", "--dry-run"]);
+    expect(dry.status, combinedOutput(dry)).toBe(0);
+    expect(combinedOutput(dry)).toContain(".claude/settings.json");
+    expect(fs.readFileSync(file, "utf-8")).toBe(before);
+    expect(before).toContain(RETIRED);
+  });
+});
diff --git a/.bkit/core/engine/install/write.test.ts b/.bkit/core/engine/install/write.test.ts
index 1e41d1840..a2dd66c2b 100644
--- a/.bkit/core/engine/install/write.test.ts
+++ b/.bkit/core/engine/install/write.test.ts
@@ -5,6 +5,9 @@ import * as path from "node:path";
 import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
 import {
   RETIRED_DRIVER_HASHES,
+  RETIRED_SETTINGS_ENTRIES,
+  findRetiredSettingsEntries,
+  pruneRetiredSettingsEntries,
   driverText,
   writeTier1,
   writeTier2,
@@ -901,6 +904,150 @@ describe("writeTier2JsonContained", () => {
   });
 });
 
+// ---------------------------------------------------------------------------
+// Retired settings entries (#985) — a fixed list of exact entries a release dropped
+// ---------------------------------------------------------------------------
+
+const RETIRED_LINEAR = "mcp__claude_ai_Linear__*";
+const CODEX_LIST = [
+  { file: ".codex/hooks.json", path: "permissions.allow", value: "retired-codex-entry" },
+];
+
+function allowOf(doc: unknown): string[] {
+  return (doc as { permissions: { allow: string[] } }).permissions.allow;
+}
+
+describe("retired settings entries — find and prune", () => {
+  it("shipped list holds mcp__claude_ai_Linear__* for .claude/settings.json permissions.allow", () => {
+    expect(RETIRED_SETTINGS_ENTRIES).toBeDefined();
+    const text = JSON.stringify(RETIRED_SETTINGS_ENTRIES);
+    expect(text).toContain(".claude/settings.json");
+    expect(text).toContain("permissions.allow");
+    expect(text).toContain(RETIRED_LINEAR);
+    expect(RETIRED_SETTINGS_ENTRIES).toHaveLength(1);
+  });
+
+  it("removes a retired entry and keeps the person's entries beside it", () => {
+    const doc = {
+      permissions: { allow: ["Bash(*)", RETIRED_LINEAR, "mcp__mine__*"], deny: ["Bash(rm -rf ~)"] },
+      env: { A: "1" },
+    };
+    const out = pruneRetiredSettingsEntries(".claude/settings.json", doc as JsonValue);
+    expect(allowOf(out)).toEqual(["Bash(*)", "mcp__mine__*"]);
+    expect((out as typeof doc).permissions.deny).toEqual(["Bash(rm -rf ~)"]);
+    expect((out as typeof doc).env).toEqual({ A: "1" });
+  });
+
+  it("returns a document without the retired entry unchanged and a second prune changes nothing", () => {
+    const clean = { permissions: { allow: ["Bash(*)", "mcp__mine__*"] } };
+    const once = pruneRetiredSettingsEntries(".claude/settings.json", clean as JsonValue);
+    expect(once).toEqual(clean);
+    const dirty = { permissions: { allow: [RETIRED_LINEAR, "mcp__mine__*"] } };
+    const first = pruneRetiredSettingsEntries(".claude/settings.json", dirty as JsonValue);
+    const second = pruneRetiredSettingsEntries(".claude/settings.json", first);
+    expect(second).toEqual(first);
+    expect(allowOf(first)).toEqual(["mcp__mine__*"]);
+  });
+
+  it("reports an edited variant as edited and never removes it", () => {
+    const edited = "mcp__claude_ai_Linear__get_issue";
+    const doc = { permissions: { allow: [edited, "mcp__mine__*"] } };
+    const found = findRetiredSettingsEntries(".claude/settings.json", doc as JsonValue);
+    expect(found.retired).toHaveLength(0);
+    expect(found.edited.length).toBeGreaterThan(0);
+    expect(JSON.stringify(found.edited)).toContain(edited);
+    const out = pruneRetiredSettingsEntries(".claude/settings.json", doc as JsonValue);
+    expect(allowOf(out)).toEqual([edited, "mcp__mine__*"]);
+  });
+
+  it("does not report an entry the template ships as edited", () => {
+    const shipped = "mcp__claude_ai_Linear__get_issue";
+    const doc = { permissions: { allow: [shipped] } };
+    const template = { permissions: { allow: [shipped] } };
+    const found = findRetiredSettingsEntries(
+      ".claude/settings.json",
+      doc as JsonValue,
+      template as JsonValue,
+    );
+    expect(found.edited).toHaveLength(0);
+    expect(found.retired).toHaveLength(0);
+  });
+
+  it("matches the file by repo-relative path whether the destination is relative or absolute", () => {
+    const doc = { permissions: { allow: [RETIRED_LINEAR, "mine"] } };
+    const abs = path.join(tmpDir, ".claude", "settings.json");
+    for (const rel of [".claude/settings.json", abs]) {
+      const out = pruneRetiredSettingsEntries(rel, doc as JsonValue);
+      expect(allowOf(out)).toEqual(["mine"]);
+      expect(findRetiredSettingsEntries(rel, doc as JsonValue).retired.length).toBeGreaterThan(0);
+    }
+    const other = pruneRetiredSettingsEntries(path.join(tmpDir, "other.json"), doc as JsonValue);
+    expect(allowOf(other)).toContain(RETIRED_LINEAR);
+  });
+
+  it("prunes a retired entry in any host file the list names", () => {
+    const doc = { permissions: { allow: ["retired-codex-entry", "keep"] } };
+    const out = pruneRetiredSettingsEntries(".codex/hooks.json", doc as JsonValue, CODEX_LIST);
+    expect(allowOf(out)).toEqual(["keep"]);
+  });
+});
+
+describe("writeTier2JsonContained — retired settings entries", () => {
+  function seed(allow: string[]): { src: string; dst: string } {
+    const src = path.join(tmpDir, "template.json");
+    const dst = path.join(tmpDir, ".claude", "settings.json");
+    fs.mkdirSync(path.dirname(dst), { recursive: true });
+    fs.writeFileSync(src, JSON.stringify({ permissions: { allow: ["Bash(*)"] } }) + "\n", "utf-8");
+    fs.writeFileSync(dst, JSON.stringify({ permissions: { allow } }, null, 2) + "\n", "utf-8");
+    return { src, dst };
+  }
+
+  it("drops a retired entry even when the template is otherwise contained", () => {
+    const { src, dst } = seed(["Bash(*)", RETIRED_LINEAR, "mcp__mine__*"]);
+    const ws = makeWriteSet();
+    writeTier2JsonContained(src, dst, false, ws);
+    const after = JSON.parse(fs.readFileSync(dst, "utf-8"));
+    expect(after.permissions.allow).toEqual(["Bash(*)", "mcp__mine__*"]);
+    expect(ws.writes).toEqual([{ path: dst, action: "update" }]);
+  });
+
+  it("dry run records the same write and leaves the file untouched", () => {
+    const { src, dst } = seed(["Bash(*)", RETIRED_LINEAR]);
+    const before = fs.readFileSync(dst, "utf-8");
+    const real = makeWriteSet();
+    writeTier2JsonContained(src, dst, true, real);
+    expect(fs.readFileSync(dst, "utf-8")).toBe(before);
+    expect(real.writes).toEqual([{ path: dst, action: "update" }]);
+  });
+
+  it("a second run after pruning writes nothing", () => {
+    const { src, dst } = seed(["Bash(*)", RETIRED_LINEAR]);
+    const first = makeWriteSet();
+    writeTier2JsonContained(src, dst, false, first);
+    expect(first.writes).toEqual([{ path: dst, action: "update" }]);
+    const second = makeWriteSet();
+    writeTier2JsonContained(src, dst, false, second);
+    expect(second.writes).toHaveLength(0);
+  });
+
+  it("keeps an edited variant and warns with the file and the entry", () => {
+    const edited = "mcp__claude_ai_Linear__get_issue";
+    const { src, dst } = seed(["Bash(*)", edited]);
+    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
+    try {
+      writeTier2JsonContained(src, dst, false, makeWriteSet());
+      const after = JSON.parse(fs.readFileSync(dst, "utf-8"));
+      expect(after.permissions.allow).toContain(edited);
+      expect(warn).toHaveBeenCalled();
+      const text = warn.mock.calls.map((c) => c.join(" ")).join("\n");
+      expect(text).toContain(".claude/settings.json");
+      expect(text).toContain(edited);
+    } finally {
+      warn.mockRestore();
+    }
+  });
+});
+
 // ---------------------------------------------------------------------------
 // install/write.ts doc-block terminology check
 // ---------------------------------------------------------------------------
diff --git a/.bkit/core/engine/install/write.ts b/.bkit/core/engine/install/write.ts
index dd099cc8a..fcb8b616c 100644
--- a/.bkit/core/engine/install/write.ts
+++ b/.bkit/core/engine/install/write.ts
@@ -346,6 +346,98 @@ export function trackerEntryInSync(existing: JsonValue | undefined, owned: JsonV
   return deepContains(mergeTrackerEntry(existing, owned), existing).ok;
 }
 
+// ---------------------------------------------------------------------------
+// Retired settings entries (#985) — exact plain values a release shipped and a later one
+// dropped. Register: docs/migrations.md. Add one line here plus one migration row per entry.
+// ---------------------------------------------------------------------------
+
+export interface RetiredSettingsEntry {
+  /** Repo-relative path of the JSON file. */
+  file: string;
+  /** Dotted path to the array that held the entry. */
+  path: string;
+  /** The exact string the release shipped. */
+  value: string;
+}
+
+export const RETIRED_SETTINGS_ENTRIES: readonly RetiredSettingsEntry[] = [
+  // v3.0.0-v5.4.0, dropped in v5.5.0.
+  { file: ".claude/settings.json", path: "permissions.allow", value: "mcp__claude_ai_Linear__*" },
+];
+
+function matchesRetiredFile(rel: string, file: string): boolean {
+  const norm = rel.replace(/\\/g, "/");
+  return norm === file || norm.endsWith("/" + file);
+}
+
+function arrayAt(doc: JsonValue | undefined, dotted: string): JsonValue[] | undefined {
+  let cur: JsonValue | undefined = doc;
+  for (const key of dotted.split(".")) {
+    if (cur === null || typeof cur !== "object" || Array.isArray(cur)) return undefined;
+    cur = (cur as { [k: string]: JsonValue })[key];
+  }
+  return Array.isArray(cur) ? cur : undefined;
+}
+
+export interface RetiredSettingsFinding {
+  file: string;
+  path: string;
+  value: string;
+  retired: string;
+}
+
+/** Retired entries still present, and edited variants of them (kept, warned about). */
+export function findRetiredSettingsEntries(
+  rel: string,
+  doc: JsonValue,
+  template?: JsonValue,
+  list: readonly RetiredSettingsEntry[] = RETIRED_SETTINGS_ENTRIES,
+): { retired: RetiredSettingsFinding[]; edited: RetiredSettingsFinding[] } {
+  const retired: RetiredSettingsFinding[] = [];
+  const edited: RetiredSettingsFinding[] = [];
+  for (const entry of list) {
+    if (!matchesRetiredFile(rel, entry.file)) continue;
+    const held = arrayAt(doc, entry.path);
+    if (!held) continue;
+    const shipped = template === undefined ? [] : (arrayAt(template, entry.path) ?? []);
+    const stem = entry.value.replace(/\*$/, "");
+    for (const item of held) {
+      if (typeof item !== "string") continue;
+      const finding = { file: entry.file, path: entry.path, value: item, retired: entry.value };
+      if (item === entry.value) retired.push(finding);
+      else if (item.startsWith(stem) && !shipped.includes(item)) edited.push(finding);
+    }
+  }
+  return { retired, edited };
+}
+
+/** The document without the exact retired strings; a document holding none comes back as is. */
+export function pruneRetiredSettingsEntries(
+  rel: string,
+  doc: JsonValue,
+  list: readonly RetiredSettingsEntry[] = RETIRED_SETTINGS_ENTRIES,
+): JsonValue {
+  let out = doc;
+  for (const entry of list) {
+    if (!matchesRetiredFile(rel, entry.file)) continue;
+    const keys = entry.path.split(".");
+    const walk = (node: JsonValue, i: number): JsonValue => {
+      if (node === null || typeof node !== "object" || Array.isArray(node)) return node;
+      const obj = node as { [k: string]: JsonValue };
+      const child = obj[keys[i]!];
+      if (child === undefined) return node;
+      if (i === keys.length - 1) {
+        if (!Array.isArray(child) || !child.includes(entry.value)) return node;
+        return { ...obj, [keys[i]!]: child.filter((x) => x !== entry.value) };
+      }
+      const next = walk(child, i + 1);
+      return next === child ? node : { ...obj, [keys[i]!]: next };
+    };
+    out = walk(out, 0);
+  }
+  return out;
+}
+
 // ---------------------------------------------------------------------------
 // writeTier2JsonContained — deep-containment JSON helper (BAR-167 Phase 1)
 //
@@ -394,14 +486,24 @@ export function writeTier2JsonContained(
   }
   const existing = existingRead.value as Record<string, JsonValue>;
 
+  // Take back entries a release retired, and warn about edited variants that stay.
+  const pruned = pruneRetiredSettingsEntries(dstPath, existing as JsonValue);
+  const prunedChanged = JSON.stringify(pruned) !== JSON.stringify(existing);
+  for (const e of findRetiredSettingsEntries(dstPath, existing as JsonValue, template as JsonValue)
+    .edited) {
+    console.warn(
+      `[bkit] ${e.file}: ${e.path} holds "${e.value}", an edited copy of an entry bkit retired ("${e.retired}"); bkit keeps it. Delete that line from ${e.file} if you no longer want it.`,
+    );
+  }
+
   // Check if existing already contains the template
-  const containsResult = deepContains(template as JsonValue, existing as JsonValue);
-  if (containsResult.ok) {
+  const containsResult = deepContains(template as JsonValue, pruned);
+  if (containsResult.ok && !prunedChanged) {
     return; // idempotent — no change needed
   }
 
   // Deep-merge: existing base, template override (template wins on conflicts)
-  const merged = mergeManagedJson(existing as JsonValue, template as JsonValue);
+  const merged = mergeManagedJson(pruned, template as JsonValue);
   const mergedStr = JSON.stringify(merged, null, 2) + "\n";
   if (mergedStr === dstRaw) return; // idempotent guard
 
diff --git a/dist/install/write.js b/dist/install/write.js
index be1626445..c250a3e01 100644
--- a/dist/install/write.js
+++ b/dist/install/write.js
@@ -273,6 +273,73 @@ export function trackerEntryInSync(existing, owned) {
         return false;
     return deepContains(mergeTrackerEntry(existing, owned), existing).ok;
 }
+export const RETIRED_SETTINGS_ENTRIES = [
+    // v3.0.0-v5.4.0, dropped in v5.5.0.
+    { file: ".claude/settings.json", path: "permissions.allow", value: "mcp__claude_ai_Linear__*" },
+];
+function matchesRetiredFile(rel, file) {
+    const norm = rel.replace(/\\/g, "/");
+    return norm === file || norm.endsWith("/" + file);
+}
+function arrayAt(doc, dotted) {
+    let cur = doc;
+    for (const key of dotted.split(".")) {
+        if (cur === null || typeof cur !== "object" || Array.isArray(cur))
+            return undefined;
+        cur = cur[key];
+    }
+    return Array.isArray(cur) ? cur : undefined;
+}
+/** Retired entries still present, and edited variants of them (kept, warned about). */
+export function findRetiredSettingsEntries(rel, doc, template, list = RETIRED_SETTINGS_ENTRIES) {
+    const retired = [];
+    const edited = [];
+    for (const entry of list) {
+        if (!matchesRetiredFile(rel, entry.file))
+            continue;
+        const held = arrayAt(doc, entry.path);
+        if (!held)
+            continue;
+        const shipped = template === undefined ? [] : (arrayAt(template, entry.path) ?? []);
+        const stem = entry.value.replace(/\*$/, "");
+        for (const item of held) {
+            if (typeof item !== "string")
+                continue;
+            const finding = { file: entry.file, path: entry.path, value: item, retired: entry.value };
+            if (item === entry.value)
+                retired.push(finding);
+            else if (item.startsWith(stem) && !shipped.includes(item))
+                edited.push(finding);
+        }
+    }
+    return { retired, edited };
+}
+/** The document without the exact retired strings; a document holding none comes back as is. */
+export function pruneRetiredSettingsEntries(rel, doc, list = RETIRED_SETTINGS_ENTRIES) {
+    let out = doc;
+    for (const entry of list) {
+        if (!matchesRetiredFile(rel, entry.file))
+            continue;
+        const keys = entry.path.split(".");
+        const walk = (node, i) => {
+            if (node === null || typeof node !== "object" || Array.isArray(node))
+                return node;
+            const obj = node;
+            const child = obj[keys[i]];
+            if (child === undefined)
+                return node;
+            if (i === keys.length - 1) {
+                if (!Array.isArray(child) || !child.includes(entry.value))
+                    return node;
+                return { ...obj, [keys[i]]: child.filter((x) => x !== entry.value) };
+            }
+            const next = walk(child, i + 1);
+            return next === child ? node : { ...obj, [keys[i]]: next };
+        };
+        out = walk(out, 0);
+    }
+    return out;
+}
 // ---------------------------------------------------------------------------
 // writeTier2JsonContained — deep-containment JSON helper (BAR-167 Phase 1)
 //
@@ -310,13 +377,20 @@ export function writeTier2JsonContained(srcPath, dstPath, dryRun, ws) {
         throw new Error(`[bkit] ${dstPath} is malformed JSON — fix manually before running bkit install`);
     }
     const existing = existingRead.value;
+    // Take back entries a release retired, and warn about edited variants that stay.
+    const pruned = pruneRetiredSettingsEntries(dstPath, existing);
+    const prunedChanged = JSON.stringify(pruned) !== JSON.stringify(existing);
+    for (const e of findRetiredSettingsEntries(dstPath, existing, template)
+        .edited) {
+        console.warn(`[bkit] ${e.file}: ${e.path} holds "${e.value}", an edited copy of an entry bkit retired ("${e.retired}"); bkit keeps it. Delete that line from ${e.file} if you no longer want it.`);
+    }
     // Check if existing already contains the template
-    const containsResult = deepContains(template, existing);
-    if (containsResult.ok) {
+    const containsResult = deepContains(template, pruned);
+    if (containsResult.ok && !prunedChanged) {
         return; // idempotent — no change needed
     }
     // Deep-merge: existing base, template override (template wins on conflicts)
-    const merged = mergeManagedJson(existing, template);
+    const merged = mergeManagedJson(pruned, template);
     const mergedStr = JSON.stringify(merged, null, 2) + "\n";
     if (mergedStr === dstRaw)
         return; // idempotent guard
