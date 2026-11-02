diff --git a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
index baff5a969..21eee3293 100644
--- a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
+++ b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
@@ -11,6 +11,7 @@
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { describe, expect, it } from "vitest";
+import { parse as parseYamlText } from "yaml";
 import { listFilesRecursive, remapTemplateDest } from "../../install/template-copies";
 import { getPkgRoot, getTemplatesRoot } from "../../shared/package-roots";
 
@@ -752,6 +753,27 @@ describe("this repo adopts its own templates", () => {
   ];
   const UNPREFIXED_GRAPH = /pnpm graph(?!ify)/;
 
+  /** Adopted workflows whose copy is also pinned to carry `bkit-` workflow and job display names (#748). */
+  const BRANDED_WORKFLOWS = [
+    ".github/workflows/bkit-cloud.yml",
+    ".github/workflows/bkit-renovate.yml",
+    ".github/workflows/bkit-trivy.yml",
+  ];
+
+  /** Workflow and job display names (`name`, else the job id) in a workflow text that lack `bkit-`. */
+  function unprefixedDisplayNames(text: string): string[] {
+    const doc = parseYamlText(text) as { name?: unknown; jobs?: Record<string, unknown> };
+    const bad: string[] = [];
+    if (typeof doc.name !== "string" || !doc.name.startsWith("bkit-"))
+      bad.push(`name: ${doc.name}`);
+    for (const [id, job] of Object.entries(doc.jobs ?? {})) {
+      const named = (job as { name?: unknown }).name;
+      const display = typeof named === "string" ? named : id;
+      if (!display.startsWith("bkit-")) bad.push(`job ${id}: ${display}`);
+    }
+    return bad;
+  }
+
   function expectCopyMatchesTemplate(rel: string, entry: Extract<Entry, { status: "adopted" }>) {
     const copyPath = copyPathOf(rel);
     expect(fs.existsSync(copyPath), rel).toBe(true);
@@ -763,13 +785,11 @@ describe("this repo adopts its own templates", () => {
     return { template, copy };
   }
 
-  it.each(entriesWith("adopted").filter(([rel]) => !GRAPHIFY_BRANDED.includes(rel)))(
-    "%s",
-    (rel, entry) => {
-      const { copy } = expectCopyMatchesTemplate(rel, entry);
-      expect(copy.length).toBeGreaterThan(0);
-    },
-  );
+  const OWN_TESTS = new Set([...GRAPHIFY_BRANDED, ...BRANDED_WORKFLOWS]);
+  it.each(entriesWith("adopted").filter(([rel]) => !OWN_TESTS.has(rel)))("%s", (rel, entry) => {
+    const { copy } = expectCopyMatchesTemplate(rel, entry);
+    expect(copy.length).toBeGreaterThan(0);
+  });
 
   it("scripts/graphify/bkit-graphify.sh", () => {
     const entry = ADOPTED["scripts/graphify/bkit-graphify.sh"] as Extract<
@@ -798,4 +818,31 @@ describe("this repo adopts its own templates", () => {
     expect(copy).not.toMatch(UNPREFIXED_GRAPH);
     expect(copy).toContain("pnpm bkit:graph:refresh");
   });
+
+  it(".github/workflows/bkit-cloud.yml", () => {
+    const rel = ".github/workflows/bkit-cloud.yml";
+    const entry = ADOPTED[rel] as Extract<Entry, { status: "adopted" }>;
+    const { template, copy } = expectCopyMatchesTemplate(rel, entry);
+    expect(copy.length).toBeGreaterThan(0);
+    expect(unprefixedDisplayNames(template)).toEqual([]);
+    expect(unprefixedDisplayNames(copy)).toEqual([]);
+  });
+
+  it(".github/workflows/bkit-renovate.yml", () => {
+    const rel = ".github/workflows/bkit-renovate.yml";
+    const entry = ADOPTED[rel] as Extract<Entry, { status: "adopted" }>;
+    const { template, copy } = expectCopyMatchesTemplate(rel, entry);
+    expect(copy.length).toBeGreaterThan(0);
+    expect(unprefixedDisplayNames(template)).toEqual([]);
+    expect(unprefixedDisplayNames(copy)).toEqual([]);
+  });
+
+  it(".github/workflows/bkit-trivy.yml", () => {
+    const rel = ".github/workflows/bkit-trivy.yml";
+    const entry = ADOPTED[rel] as Extract<Entry, { status: "adopted" }>;
+    const { template, copy } = expectCopyMatchesTemplate(rel, entry);
+    expect(copy.length).toBeGreaterThan(0);
+    expect(unprefixedDisplayNames(template)).toEqual([]);
+    expect(unprefixedDisplayNames(copy)).toEqual([]);
+  });
 });
diff --git a/.bkit/core/engine/audits/templates/branding.test.ts b/.bkit/core/engine/audits/templates/branding.test.ts
index dbbd7a858..9dcd22cb5 100644
--- a/.bkit/core/engine/audits/templates/branding.test.ts
+++ b/.bkit/core/engine/audits/templates/branding.test.ts
@@ -5,6 +5,7 @@
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { describe, expect, it } from "vitest";
+import { parse as parseYamlText } from "yaml";
 import { listFilesRecursive } from "../../install/template-copies";
 import { getBkitDocsRoot } from "../../shared/package-roots";
 
@@ -46,6 +47,23 @@ function unprefixedFileNames(relPaths: string[]): string[] {
   return relPaths.filter((rel) => !path.basename(rel).startsWith(PREFIX));
 }
 
+/**
+ * Workflow and job display names (a job's display name is its `name`, else its id) in a workflow
+ * file's text that lack `bkit-`. Each is `<workflow>:<name>` or `<workflow>:<job id>:<name>`.
+ */
+function unprefixedWorkflowNames(file: string, text: string): string[] {
+  const doc = parseYamlText(text) as { name?: unknown; jobs?: Record<string, unknown> } | null;
+  const bad: string[] = [];
+  const workflowName = typeof doc?.name === "string" ? doc.name : "";
+  if (!workflowName.startsWith(PREFIX)) bad.push(`${file}:${workflowName}`);
+  for (const [id, job] of Object.entries(doc?.jobs ?? {})) {
+    const named = (job as { name?: unknown } | null)?.name;
+    const display = typeof named === "string" ? named : id;
+    if (!display.startsWith(PREFIX)) bad.push(`${file}:${id}:${display}`);
+  }
+  return bad;
+}
+
 describe("consumer-facing names carry the bkit prefix", () => {
   const doc = fs.readFileSync(path.join(getBkitDocsRoot(), "templates.md"), "utf-8");
   const templatesRoot = path.resolve(".bkit/templates");
@@ -76,4 +94,24 @@ describe("consumer-facing names carry the bkit prefix", () => {
     expect(unprefixedFileNames(rels)).toEqual([]);
     expect(unprefixedFileNames([...rels, "scripts/foo.sh"])).toEqual(["scripts/foo.sh"]);
   });
+
+  it("workflow and job display names", () => {
+    const dir = path.join(templatesRoot, ".github/workflows");
+    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".yml"));
+    expect(files.length).toBeGreaterThan(0);
+    const bad = files.flatMap((f) =>
+      unprefixedWorkflowNames(f, fs.readFileSync(path.join(dir, f), "utf-8")),
+    );
+    expect(bad).toEqual([]);
+  });
+
+  it("flags a seeded job whose display name lacks bkit-", () => {
+    const named = "name: bkit-x\njobs:\n  lint:\n    name: lint\n    runs-on: ubuntu-latest\n";
+    expect(unprefixedWorkflowNames("x.yml", named)).toEqual(["x.yml:lint:lint"]);
+    const idOnly = "name: bkit-x\njobs:\n  lint:\n    runs-on: ubuntu-latest\n";
+    expect(unprefixedWorkflowNames("x.yml", idOnly)).toEqual(["x.yml:lint:lint"]);
+    const fine =
+      "name: bkit-x\njobs:\n  lint:\n    name: bkit-lint\n  bkit-b:\n    runs-on: ubuntu-latest\n";
+    expect(unprefixedWorkflowNames("x.yml", fine)).toEqual([]);
+  });
 });
diff --git a/.bkit/core/engine/commands/install/upgrade.integration.test.ts b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
index fb90538b7..73f8ad603 100644
--- a/.bkit/core/engine/commands/install/upgrade.integration.test.ts
+++ b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
@@ -958,12 +958,51 @@ describe("#255 — upgrade does not force-create uninstalled host/tooling module
     expect(scripts["bkit:gate:static-unit"]).toBe("pnpm bkit:gate:static && pnpm test");
     expect(scripts["bkit:deps:audit"]).toBe("pnpm audit");
     expect(scripts["slop:delta"]).toBeUndefined();
+    expect(scripts["bkit:slop:delta"]).toBeUndefined();
     expect(scripts.typecheck).toBeUndefined();
 
     const check = runCli(["check"]);
     expect(check.status, `${check.stdout}\n${check.stderr}`).toBe(0);
     expect(check.stdout).toContain("0 write(s) would occur");
   });
+
+  it("branded script migration is idempotent and dry-run writes nothing", () => {
+    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
+    const pkgPath = path.join(tmpDir, "package.json");
+    const write = (scripts: Record<string, string>): void =>
+      fs.writeFileSync(
+        pkgPath,
+        JSON.stringify({ name: "consumer", version: "0.0.0", scripts }, null, 2) + "\n",
+        "utf-8",
+      );
+    write({});
+    expect(runCli(["install", "--claude"]).status).toBe(0);
+    write({
+      "lint:prose": "custom-prose-linter",
+      "slop:delta": "bash scripts/slop/bkit-slop-delta.sh",
+      "graph:check": "bash scripts/graphify/bkit-graphify.sh --check",
+    });
+    const oldShape = fs.readFileSync(pkgPath, "utf-8");
+
+    const dry = runCli(["upgrade", "--dry-run"]);
+    expect(dry.status, `${dry.stdout}\n${dry.stderr}`).toBe(0);
+    expect(fs.readFileSync(pkgPath, "utf-8")).toBe(oldShape);
+
+    const upgrade = runCli(["upgrade", "--auto-apply"]);
+    expect(upgrade.status, `${upgrade.stdout}\n${upgrade.stderr}`).toBe(0);
+    const after = fs.readFileSync(pkgPath, "utf-8");
+    const scripts = (JSON.parse(after) as { scripts: Record<string, string> }).scripts;
+    expect(scripts["bkit:lint:prose"]).toBe("custom-prose-linter");
+    expect(scripts["bkit:slop:delta"]).toBe("bash scripts/slop/bkit-slop-delta.sh");
+    expect(scripts["bkit:graph:check"]).toBe("bash scripts/graphify/bkit-graphify.sh --check");
+    expect(scripts["lint:prose"]).toBeUndefined();
+
+    const second = runCli(["upgrade", "--auto-apply"]);
+    expect(second.status, `${second.stdout}\n${second.stderr}`).toBe(0);
+    expect(fs.readFileSync(pkgPath, "utf-8")).toBe(after);
+    const check = runCli(["check"]);
+    expect(check.stdout).toContain("0 write(s) would occur");
+  });
 });
 
 // ---------------------------------------------------------------------------
diff --git a/.bkit/core/engine/install/manifest.test.ts b/.bkit/core/engine/install/manifest.test.ts
index 89a6057ca..961e436a0 100644
--- a/.bkit/core/engine/install/manifest.test.ts
+++ b/.bkit/core/engine/install/manifest.test.ts
@@ -395,7 +395,7 @@ describe("KN-19-for-opencode — writeTier2JsonContained throws on malformed .op
 });
 
 // ---------------------------------------------------------------------------
-// lint:prose — shipped prose-gate contract
+// bkit:lint:prose — shipped prose-gate contract
 //
 // The value `.bkit/templates.md` § Gate tool scripts hands consumers; it runs in their
 // pre-push hooks. The behaviour (unavailable vale, write-good restore, vale exit) lives in
diff --git a/.bkit/core/engine/install/modules/core.integration.test.ts b/.bkit/core/engine/install/modules/core.integration.test.ts
index 3d02b3e98..feba1be9e 100644
--- a/.bkit/core/engine/install/modules/core.integration.test.ts
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -21,6 +21,7 @@ import {
   migrateLinearTeamKey,
   migrateGithubProjectKey,
   migrateBkitLayout,
+  migrateBrandedScriptNames,
   pruneMinPushPaths,
   seedBkitDefaults,
   SEEDED_BKIT_DEFAULTS,
@@ -246,16 +247,128 @@ describe("core package.json scripts — bkit:gate:* names, add-if-missing", () =
     expect(ws.writes.some((w) => w.path === "package.json")).toBe(true);
     expect(readPkg().scripts).toBeUndefined();
   });
+});
 
-  it("leaves a superseded bkit slop:delta value in place (add-if-missing; no migration code)", () => {
-    // bkit seeds a gate name only when it is missing (#489 removed migration code),
-    // so a declared value — even a retired one — is the consumer's and is never rewritten.
-    writePkg({ scripts: { "slop:delta": "bash scripts/slop/bkit-slop-delta.sh" } });
+describe("migrateBrandedScriptNames (via seedCorePackageJsonScripts)", () => {
+  const OLD_STATIC =
+    "pnpm typecheck && pnpm lint && pnpm format:check && pnpm lint:prose && pnpm slop:delta";
+  const seed = (scripts: Record<string, string>): void =>
+    fs.writeFileSync(
+      "package.json",
+      JSON.stringify({ name: "x", version: "1.0.0", scripts }, null, 2) + "\n",
+      "utf-8",
+    );
+  const readScripts = (): Record<string, string> =>
+    JSON.parse(fs.readFileSync("package.json", "utf-8")).scripts;
+  const run = (dryRun = false): ModuleContext => {
+    const ctx = makeCtx({ dryRun });
+    migrateBrandedScriptNames(ctx.dryRun, ctx.ws, ctx.logPrefix);
+    return ctx;
+  };
+
+  it("renames old bkit script keys and keeps custom values", () => {
+    seed({
+      "lint:prose": "custom-prose-linter",
+      "slop:delta": "bash scripts/slop/bkit-slop-delta.sh",
+      graph: "bash scripts/graphify/bkit-graphify.sh",
+      "graph:check": "bash scripts/graphify/bkit-graphify.sh --check",
+      "graph:rollup": "python3 scripts/graphify/bkit-graphify-rollup.py",
+      typecheck: "tsc --noEmit",
+    });
     dispatchModules(new Set(["core"]), makeCtx({}));
     const scripts = readScripts();
-    expect(scripts["slop:delta"]).toBe("bash scripts/slop/bkit-slop-delta.sh");
-    expect(scripts.typecheck).toBeUndefined();
+    expect(scripts["bkit:lint:prose"]).toBe("custom-prose-linter");
+    expect(scripts["bkit:slop:delta"]).toBe("bash scripts/slop/bkit-slop-delta.sh");
+    expect(scripts["bkit:graph"]).toBe("bash scripts/graphify/bkit-graphify.sh");
+    expect(scripts["bkit:graph:check"]).toBe("bash scripts/graphify/bkit-graphify.sh --check");
+    expect(scripts["bkit:graph:rollup"]).toBe("python3 scripts/graphify/bkit-graphify-rollup.py");
     expect(scripts["lint:prose"]).toBeUndefined();
+    expect(scripts["slop:delta"]).toBeUndefined();
+    expect(scripts.graph).toBeUndefined();
+    expect(scripts["graph:check"]).toBeUndefined();
+    expect(scripts["graph:rollup"]).toBeUndefined();
+    expect(scripts.typecheck).toBe("tsc --noEmit");
+  });
+
+  it("rewrites old script tokens in values and default gate chains", () => {
+    seed({
+      "bkit:gate:static": OLD_STATIC,
+      "bkit:gate:min": "pnpm format:check && pnpm lint:prose && pnpm slop:delta",
+      ci: "pnpm -s lint:prose && pnpm run slop:delta",
+      wrapped: "bash scripts/ci/bkit-machine-lock.sh run --lock tests -- pnpm lint:prose",
+    });
+    dispatchModules(new Set(["core"]), makeCtx({}));
+    const scripts = readScripts();
+    expect(scripts["bkit:gate:static"]).toBe(BKIT_GATE_SCRIPTS["bkit:gate:static"]);
+    expect(scripts["bkit:gate:static"]).not.toMatch(/pnpm (lint:prose|slop:delta)/);
+    expect(scripts["bkit:gate:min"]).toBe(BKIT_GATE_SCRIPTS["bkit:gate:min"]);
+    expect(scripts.ci).toBe("pnpm -s bkit:lint:prose && pnpm run bkit:slop:delta");
+    expect(scripts.wrapped).toBe(
+      "bash scripts/ci/bkit-machine-lock.sh run --lock tests -- pnpm bkit:lint:prose",
+    );
+  });
+
+  it("leaves the old key when the new key exists", () => {
+    seed({ "lint:prose": "old-linter", "bkit:lint:prose": "new-linter" });
+    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
+    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
+    try {
+      const ctx = run();
+      const scripts = readScripts();
+      expect(scripts["lint:prose"]).toBe("old-linter");
+      expect(scripts["bkit:lint:prose"]).toBe("new-linter");
+      expect(warnSpy).toHaveBeenCalledTimes(1);
+      const lines = logSpy.mock.calls.map((c) => String(c[0]));
+      expect(lines.filter((l) => l.includes("lint:prose")).length).toBeLessThanOrEqual(1);
+      expect(ctx.ws.writes.filter((w) => w.path === "package.json")).toEqual([]);
+    } finally {
+      logSpy.mockRestore();
+      warnSpy.mockRestore();
+    }
+  });
+
+  it("leaves a foreign graph script under its own name", () => {
+    seed({ graph: "nx graph", dev: "pnpm graph && pnpm lint:prose" });
+    dispatchModules(new Set(["core"]), makeCtx({}));
+    const scripts = readScripts();
+    expect(scripts.graph).toBe("nx graph");
+    expect(scripts["bkit:graph"]).toBeUndefined();
+    expect(scripts.dev).toBe("pnpm graph && pnpm bkit:lint:prose");
+  });
+
+  it("warns on an old script name the rewrite cannot reach", () => {
+    seed({ "lint:prose": "x", docs: "pnpm --filter web lint:prose" });
+    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
+    try {
+      run();
+      const out = warnSpy.mock.calls.map((c) => String(c[0])).join("\n");
+      expect(out).toContain("package.json");
+      expect(out).toContain("docs");
+      expect(out).toContain("lint:prose");
+    } finally {
+      warnSpy.mockRestore();
+    }
+  });
+
+  it("leaves package.json untouched when it is not valid JSON", () => {
+    const broken = '{ "name": "x", "scripts": { "lint:prose": "x", ';
+    fs.writeFileSync("package.json", broken, "utf-8");
+    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
+    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
+    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
+    try {
+      const ctx = run();
+      expect(fs.readFileSync("package.json", "utf-8")).toBe(broken);
+      expect(ctx.ws.writes.filter((w) => w.path === "package.json")).toEqual([]);
+      const out = [errSpy, logSpy, warnSpy]
+        .flatMap((s) => s.mock.calls.map((c) => String(c[0])))
+        .join("\n");
+      expect(out).toMatch(/package\.json/);
+    } finally {
+      errSpy.mockRestore();
+      logSpy.mockRestore();
+      warnSpy.mockRestore();
+    }
   });
 });
 
diff --git a/.bkit/core/engine/install/modules/core.test.ts b/.bkit/core/engine/install/modules/core.test.ts
index 14b77bf63..e91e4b6f3 100644
--- a/.bkit/core/engine/install/modules/core.test.ts
+++ b/.bkit/core/engine/install/modules/core.test.ts
@@ -4,7 +4,7 @@ import * as fs from "node:fs";
 import * as path from "node:path";
 import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
 import * as os from "node:os";
-import { guardCoreRoot, listMdFiles, removeOrphans } from "./core";
+import { guardCoreRoot, listMdFiles, removeOrphans, renameScriptTokens } from "./core";
 import { CODEX_SKILLS_DIR } from "./codex";
 import { ANTIGRAVITY_AGENTS_DIR, ANTIGRAVITY_SKILLS_DIR } from "./antigravity";
 
@@ -256,3 +256,32 @@ describe("removeOrphans — prune stale bkit mirror files, allowlisted dirs only
     expect(fs.existsSync(".codex/agents/bkit-stale.toml")).toBe(true);
   });
 });
+
+describe("renameScriptTokens", () => {
+  const renames = {
+    "lint:prose": "bkit:lint:prose",
+    "slop:delta": "bkit:slop:delta",
+    "graph:update": "bkit:graph:update",
+  };
+
+  it("renameScriptTokens rewrites whole pnpm tokens only", () => {
+    expect(renameScriptTokens("pnpm lint:prose", renames)).toBe("pnpm bkit:lint:prose");
+    expect(renameScriptTokens("pnpm run slop:delta && pnpm graph:update", renames)).toBe(
+      "pnpm run bkit:slop:delta && pnpm bkit:graph:update",
+    );
+    expect(renameScriptTokens("pnpm graph:update-all", renames)).toBe("pnpm graph:update-all");
+    expect(renameScriptTokens("pnpm lint:prose:fix", renames)).toBe("pnpm lint:prose:fix");
+    expect(renameScriptTokens("npm run lint:prose", renames)).toBe("npm run lint:prose");
+    expect(renameScriptTokens("echo lint:prose", renames)).toBe("echo lint:prose");
+  });
+
+  it("renameScriptTokens rewrites tokens after pnpm flags", () => {
+    expect(renameScriptTokens("pnpm -s lint:prose", renames)).toBe("pnpm -s bkit:lint:prose");
+    expect(renameScriptTokens("pnpm run --silent slop:delta", renames)).toBe(
+      "pnpm run --silent bkit:slop:delta",
+    );
+    expect(renameScriptTokens("pnpm --reporter=silent run -s lint:prose", renames)).toBe(
+      "pnpm --reporter=silent run -s bkit:lint:prose",
+    );
+  });
+});
diff --git a/.bkit/core/engine/install/modules/core.ts b/.bkit/core/engine/install/modules/core.ts
index 0ebb2f43f..bd478c5ad 100644
--- a/.bkit/core/engine/install/modules/core.ts
+++ b/.bkit/core/engine/install/modules/core.ts
@@ -544,9 +544,10 @@ export function seedCorePackageJsonScripts(
   const tag = dryRun ? "[dry-run] " : "";
   const written: string[] = [];
 
+  if (migrateBrandedScriptNames(dryRun, ws, logPrefix)) written.push("package.json");
   const gates = ensurePackageJsonScripts({ ...BKIT_GATE_SCRIPTS }, dryRun, ws);
   if (gates.added.length > 0) {
-    written.push("package.json");
+    if (!written.includes("package.json")) written.push("package.json");
     console.log(
       `${logPrefix} ${tag}core: package.json scripts added [${gates.added.join(", ")}] — what a gate may run: .bkit/workflows.md § Local gate scripts`,
     );
@@ -712,6 +713,152 @@ function writePackageJsonLike(raw: string, pkg: unknown): void {
   fs.writeFileSync("package.json", JSON.stringify(pkg, null, indent) + trailingNewline, "utf-8");
 }
 
+// Migration (up to 6.0.x installs, `docs/migrations.md`): the package.json scripts bkit runs
+// carry the `bkit:` prefix. Old name -> new name. A `graph*` key moves only when its value
+// runs bkit's graph scripts; any other `graph*` script is the consumer's own.
+export const BKIT_SCRIPT_RENAMES: Readonly<Record<string, string>> = {
+  "lint:prose": "bkit:lint:prose",
+  "slop:delta": "bkit:slop:delta",
+  graph: "bkit:graph",
+  ...Object.fromEntries(
+    ["check", "clean", "graphml", "refresh", "rollup", "scoped", "tree", "update"].map((verb) => [
+      `graph:${verb}`,
+      `bkit:graph:${verb}`,
+    ]),
+  ),
+};
+
+const GRAPH_VALUE_GUARD = "scripts/graphify/bkit-";
+
+// The pairs a migration acts on. A pair is inactive when `package.json` holds both keys, or
+// when the old key is a `graph*` script whose value is not bkit's; a pair with neither key
+// is active, so its tokens in other values and in default gate chains are rewritten.
+function activeScriptRenames(
+  scripts: Record<string, unknown>,
+  renames: Readonly<Record<string, string>>,
+): { active: Record<string, string>; bothPresent: string[] } {
+  const has = (k: string): boolean => Object.prototype.hasOwnProperty.call(scripts, k);
+  const active: Record<string, string> = {};
+  const bothPresent: string[] = [];
+  for (const [oldName, newName] of Object.entries(renames)) {
+    if (has(oldName) && has(newName)) {
+      bothPresent.push(oldName);
+      continue;
+    }
+    const value = scripts[oldName];
+    if (
+      has(oldName) &&
+      oldName.startsWith("graph") &&
+      !(typeof value === "string" && value.includes(GRAPH_VALUE_GUARD))
+    ) {
+      continue;
+    }
+    active[oldName] = newName;
+  }
+  return { active, bothPresent };
+}
+
+function escapeRegExp(text: string): string {
+  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
+}
+
+/**
+ * Rewrites `pnpm [flags] [run] [flags] <old>` to the new name, keeping the flags and `run`.
+ * Each flag is a value-less `-x` / `--x[=v]` token; `<old>` ends at a character outside
+ * `[\w:-]` or at the end of the text. Anything else (`npm run`, `echo`, `--filter web`) stays.
+ */
+export function renameScriptTokens(
+  text: string,
+  renames: Readonly<Record<string, string>>,
+): string {
+  const names = Object.keys(renames).sort((a, b) => b.length - a.length);
+  if (names.length === 0) return text;
+  const re = new RegExp(
+    `\\bpnpm((?:\\s+(?:run|-{1,2}[\\w-]+(?:=\\S*)?))*)(\\s+)(${names.map(escapeRegExp).join("|")})(?![\\w:-])`,
+    "g",
+  );
+  return text.replace(
+    re,
+    (_m, flags: string, gap: string, old: string) => `pnpm${flags}${gap}${renames[old]}`,
+  );
+}
+
+/** Each old script name still in `text`, with its 1-based line. */
+export function findOldScriptNames(
+  text: string,
+  renames: Readonly<Record<string, string>>,
+): { line: number; name: string }[] {
+  const found: { line: number; name: string }[] = [];
+  const lines = text.split("\n");
+  for (const name of Object.keys(renames)) {
+    const re = new RegExp(`(?<![\\w:./-])${escapeRegExp(name)}(?![\\w:-])`);
+    lines.forEach((l, i) => {
+      if (re.test(l)) found.push({ line: i + 1, name });
+    });
+  }
+  return found;
+}
+
+// Renames the old script keys in place (values kept), rewrites old `pnpm` tokens in every
+// script value, and warns on an old name it cannot reach. Returns true when package.json
+// changed.
+export function migrateBrandedScriptNames(
+  dryRun: boolean,
+  ws: WriteSet,
+  logPrefix: string,
+): boolean {
+  const pkgPath = "package.json";
+  if (!fs.existsSync(pkgPath)) return false;
+  const raw = fs.readFileSync(pkgPath, "utf-8");
+  const parsed = parseJson(raw);
+  if (!parsed.ok) {
+    console.warn(`${logPrefix} core: package.json is not valid JSON; script names not migrated`);
+    return false;
+  }
+  const pkg = parsed.value as Record<string, unknown>;
+  if (!plainObject(pkg.scripts)) return false;
+  const scripts = pkg.scripts;
+  const { active, bothPresent } = activeScriptRenames(scripts, BKIT_SCRIPT_RENAMES);
+  const tag = dryRun ? "[dry-run] " : "";
+  for (const oldName of bothPresent) {
+    console.warn(
+      `${logPrefix} ${tag}core: package.json scripts hold both "${oldName}" and "${BKIT_SCRIPT_RENAMES[oldName]}"; left "${oldName}" in place — remove it once nothing uses it`,
+    );
+  }
+  const next: Record<string, unknown> = {};
+  const renamed: string[] = [];
+  let changed = false;
+  for (const [key, value] of Object.entries(scripts)) {
+    const newKey = active[key];
+    if (newKey !== undefined) {
+      renamed.push(key);
+      changed = true;
+    }
+    let newValue = value;
+    if (typeof value === "string") {
+      newValue = renameScriptTokens(value, active);
+      if (newValue !== value) changed = true;
+    }
+    next[newKey ?? key] = newValue;
+  }
+  if (!changed) return false;
+  for (const [key, value] of Object.entries(next)) {
+    if (typeof value !== "string") continue;
+    for (const { name } of findOldScriptNames(value, active)) {
+      console.warn(
+        `${logPrefix} ${tag}core: package.json script "${key}" still runs the old name "${name}"; rename it to "${active[name]}" by hand`,
+      );
+    }
+  }
+  pkg.scripts = next;
+  ws.writes.push({ path: pkgPath, action: "update" });
+  if (!dryRun) writePackageJsonLike(raw, pkg);
+  console.log(
+    `${logPrefix} ${tag}core: package.json script names branded${renamed.length > 0 ? ` [${renamed.join(", ")}]` : ""}`,
+  );
+  return true;
+}
+
 // Status option ids of GitHub's Kanban and Team planning board templates; every board
 // made from one carries the same ids.
 const TEMPLATE_STATUS_OPTIONS: Readonly<Record<string, string>> = {
diff --git a/.bkit/templates/.github/workflows/bkit-cloud.yml b/.bkit/templates/.github/workflows/bkit-cloud.yml
index d859fc9d2..8751e298a 100644
--- a/.bkit/templates/.github/workflows/bkit-cloud.yml
+++ b/.bkit/templates/.github/workflows/bkit-cloud.yml
@@ -93,7 +93,7 @@ jobs:
   # this job is skipped, both runner jobs are skipped with it.
   # ---------------------------------------------------------------------------
   context:
-    name: context (${{ github.event_name }})
+    name: bkit-cloud-context (${{ github.event_name }})
     if: >-
       github.event_name == 'workflow_dispatch'
       || (
@@ -469,7 +469,7 @@ jobs:
   # `/install-github-app` in the consumer repo.
   # ---------------------------------------------------------------------------
   run:
-    name: claude (${{ github.event_name }})
+    name: bkit-cloud-claude (${{ github.event_name }})
     needs: context
     if: needs.context.outputs.claude == 'true' && needs.context.outputs.skip != 'true'
     runs-on: {{CLOUD_RUNNER}}
@@ -544,7 +544,7 @@ jobs:
   # opencode.json ${VAR} reference resolves regardless of which provider is installed.
   # ---------------------------------------------------------------------------
   opencode:
-    name: opencode (${{ github.event_name }})
+    name: bkit-cloud-opencode (${{ github.event_name }})
     needs: context
     if: needs.context.outputs.opencode == 'true' && needs.context.outputs.skip != 'true'
     runs-on: {{CLOUD_RUNNER}}
diff --git a/.bkit/templates/.github/workflows/bkit-renovate.yml b/.bkit/templates/.github/workflows/bkit-renovate.yml
index 801889104..dd40817ab 100644
--- a/.bkit/templates/.github/workflows/bkit-renovate.yml
+++ b/.bkit/templates/.github/workflows/bkit-renovate.yml
@@ -13,7 +13,7 @@
 #
 # SHA-pin the action. This file is yours, so Renovate may bump the pin. Do NOT add
 # this path to renovate.json5 `ignorePaths`.
-name: Renovate
+name: bkit-renovate
 
 on:
   workflow_dispatch:
@@ -49,6 +49,7 @@ concurrency:
 
 jobs:
   renovate:
+    name: bkit-renovate
     runs-on: ubuntu-latest # ~16 GB. Edit this label in your copy.
     timeout-minutes: 30
     steps:
diff --git a/.bkit/templates/.github/workflows/bkit-trivy.yml b/.bkit/templates/.github/workflows/bkit-trivy.yml
index ce48ef749..67857a383 100644
--- a/.bkit/templates/.github/workflows/bkit-trivy.yml
+++ b/.bkit/templates/.github/workflows/bkit-trivy.yml
@@ -11,7 +11,7 @@
 # `aquasecurity/trivy-action` or `setup-trivy` by tag: in March 2026 their tags were
 # re-pointed at a credential stealer. This file is yours, so Renovate bumps the tag and
 # digest together. Do NOT add this path to renovate.json5 `ignorePaths`.
-name: Trivy
+name: bkit-trivy
 
 on:
   workflow_dispatch:
@@ -33,6 +33,7 @@ concurrency:
 
 jobs:
   trivy:
+    name: bkit-trivy
     runs-on: ubuntu-latest # Edit this label in your copy.
     timeout-minutes: 15
     steps:
diff --git a/.github/workflows/bkit-cloud.yml b/.github/workflows/bkit-cloud.yml
index b5e417904..f3b8a1aaa 100644
--- a/.github/workflows/bkit-cloud.yml
+++ b/.github/workflows/bkit-cloud.yml
@@ -93,7 +93,7 @@ jobs:
   # this job is skipped, both runner jobs are skipped with it.
   # ---------------------------------------------------------------------------
   context:
-    name: context (${{ github.event_name }})
+    name: bkit-cloud-context (${{ github.event_name }})
     if: >-
       github.event_name == 'workflow_dispatch'
       || (
@@ -469,7 +469,7 @@ jobs:
   # `/install-github-app` in the consumer repo.
   # ---------------------------------------------------------------------------
   run:
-    name: claude (${{ github.event_name }})
+    name: bkit-cloud-claude (${{ github.event_name }})
     needs: context
     if: needs.context.outputs.claude == 'true' && needs.context.outputs.skip != 'true'
     runs-on: ubuntu-latest
@@ -544,7 +544,7 @@ jobs:
   # opencode.json ${VAR} reference resolves regardless of which provider is installed.
   # ---------------------------------------------------------------------------
   opencode:
-    name: opencode (${{ github.event_name }})
+    name: bkit-cloud-opencode (${{ github.event_name }})
     needs: context
     if: needs.context.outputs.opencode == 'true' && needs.context.outputs.skip != 'true'
     runs-on: ubuntu-latest
diff --git a/.github/workflows/bkit-renovate.yml b/.github/workflows/bkit-renovate.yml
index 801889104..dd40817ab 100644
--- a/.github/workflows/bkit-renovate.yml
+++ b/.github/workflows/bkit-renovate.yml
@@ -13,7 +13,7 @@
 #
 # SHA-pin the action. This file is yours, so Renovate may bump the pin. Do NOT add
 # this path to renovate.json5 `ignorePaths`.
-name: Renovate
+name: bkit-renovate
 
 on:
   workflow_dispatch:
@@ -49,6 +49,7 @@ concurrency:
 
 jobs:
   renovate:
+    name: bkit-renovate
     runs-on: ubuntu-latest # ~16 GB. Edit this label in your copy.
     timeout-minutes: 30
     steps:
diff --git a/.github/workflows/bkit-trivy.yml b/.github/workflows/bkit-trivy.yml
index 9e97c7d36..ada21c1c9 100644
--- a/.github/workflows/bkit-trivy.yml
+++ b/.github/workflows/bkit-trivy.yml
@@ -11,7 +11,7 @@
 # `aquasecurity/trivy-action` or `setup-trivy` by tag: in March 2026 their tags were
 # re-pointed at a credential stealer. This file is yours, so Renovate bumps the tag and
 # digest together. Do NOT add this path to renovate.json5 `ignorePaths`.
-name: Trivy
+name: bkit-trivy
 
 on:
   workflow_dispatch:
@@ -33,6 +33,7 @@ concurrency:
 
 jobs:
   trivy:
+    name: bkit-trivy
     runs-on: ubuntu-latest # Edit this label in your copy.
     timeout-minutes: 15
     steps:
diff --git a/dist/install/modules/core.js b/dist/install/modules/core.js
index 092f92007..51092bf8a 100644
--- a/dist/install/modules/core.js
+++ b/dist/install/modules/core.js
@@ -449,9 +449,12 @@ export function seedCorePackageJsonScripts(ctx) {
     const { dryRun, ws, logPrefix } = ctx;
     const tag = dryRun ? "[dry-run] " : "";
     const written = [];
+    if (migrateBrandedScriptNames(dryRun, ws, logPrefix))
+        written.push("package.json");
     const gates = ensurePackageJsonScripts({ ...BKIT_GATE_SCRIPTS }, dryRun, ws);
     if (gates.added.length > 0) {
-        written.push("package.json");
+        if (!written.includes("package.json"))
+            written.push("package.json");
         console.log(`${logPrefix} ${tag}core: package.json scripts added [${gates.added.join(", ")}] — what a gate may run: .bkit/workflows.md § Local gate scripts`);
     }
     if (migrateLinearTeamKey(dryRun, ws, logPrefix) && !written.includes("package.json")) {
@@ -604,6 +607,124 @@ function writePackageJsonLike(raw, pkg) {
     const trailingNewline = raw.endsWith("\n") ? "\n" : "";
     fs.writeFileSync("package.json", JSON.stringify(pkg, null, indent) + trailingNewline, "utf-8");
 }
+// Migration (up to 6.0.x installs, `docs/migrations.md`): the package.json scripts bkit runs
+// carry the `bkit:` prefix. Old name -> new name. A `graph*` key moves only when its value
+// runs bkit's graph scripts; any other `graph*` script is the consumer's own.
+export const BKIT_SCRIPT_RENAMES = {
+    "lint:prose": "bkit:lint:prose",
+    "slop:delta": "bkit:slop:delta",
+    graph: "bkit:graph",
+    ...Object.fromEntries(["check", "clean", "graphml", "refresh", "rollup", "scoped", "tree", "update"].map((verb) => [
+        `graph:${verb}`,
+        `bkit:graph:${verb}`,
+    ])),
+};
+const GRAPH_VALUE_GUARD = "scripts/graphify/bkit-";
+// The pairs a migration acts on. A pair is inactive when `package.json` holds both keys, or
+// when the old key is a `graph*` script whose value is not bkit's; a pair with neither key
+// is active, so its tokens in other values and in default gate chains are rewritten.
+function activeScriptRenames(scripts, renames) {
+    const has = (k) => Object.prototype.hasOwnProperty.call(scripts, k);
+    const active = {};
+    const bothPresent = [];
+    for (const [oldName, newName] of Object.entries(renames)) {
+        if (has(oldName) && has(newName)) {
+            bothPresent.push(oldName);
+            continue;
+        }
+        const value = scripts[oldName];
+        if (has(oldName) &&
+            oldName.startsWith("graph") &&
+            !(typeof value === "string" && value.includes(GRAPH_VALUE_GUARD))) {
+            continue;
+        }
+        active[oldName] = newName;
+    }
+    return { active, bothPresent };
+}
+function escapeRegExp(text) {
+    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
+}
+/**
+ * Rewrites `pnpm [flags] [run] [flags] <old>` to the new name, keeping the flags and `run`.
+ * Each flag is a value-less `-x` / `--x[=v]` token; `<old>` ends at a character outside
+ * `[\w:-]` or at the end of the text. Anything else (`npm run`, `echo`, `--filter web`) stays.
+ */
+export function renameScriptTokens(text, renames) {
+    const names = Object.keys(renames).sort((a, b) => b.length - a.length);
+    if (names.length === 0)
+        return text;
+    const re = new RegExp(`\\bpnpm((?:\\s+(?:run|-{1,2}[\\w-]+(?:=\\S*)?))*)(\\s+)(${names.map(escapeRegExp).join("|")})(?![\\w:-])`, "g");
+    return text.replace(re, (_m, flags, gap, old) => `pnpm${flags}${gap}${renames[old]}`);
+}
+/** Each old script name still in `text`, with its 1-based line. */
+export function findOldScriptNames(text, renames) {
+    const found = [];
+    const lines = text.split("\n");
+    for (const name of Object.keys(renames)) {
+        const re = new RegExp(`(?<![\\w:./-])${escapeRegExp(name)}(?![\\w:-])`);
+        lines.forEach((l, i) => {
+            if (re.test(l))
+                found.push({ line: i + 1, name });
+        });
+    }
+    return found;
+}
+// Renames the old script keys in place (values kept), rewrites old `pnpm` tokens in every
+// script value, and warns on an old name it cannot reach. Returns true when package.json
+// changed.
+export function migrateBrandedScriptNames(dryRun, ws, logPrefix) {
+    const pkgPath = "package.json";
+    if (!fs.existsSync(pkgPath))
+        return false;
+    const raw = fs.readFileSync(pkgPath, "utf-8");
+    const parsed = parseJson(raw);
+    if (!parsed.ok) {
+        console.warn(`${logPrefix} core: package.json is not valid JSON; script names not migrated`);
+        return false;
+    }
+    const pkg = parsed.value;
+    if (!plainObject(pkg.scripts))
+        return false;
+    const scripts = pkg.scripts;
+    const { active, bothPresent } = activeScriptRenames(scripts, BKIT_SCRIPT_RENAMES);
+    const tag = dryRun ? "[dry-run] " : "";
+    for (const oldName of bothPresent) {
+        console.warn(`${logPrefix} ${tag}core: package.json scripts hold both "${oldName}" and "${BKIT_SCRIPT_RENAMES[oldName]}"; left "${oldName}" in place — remove it once nothing uses it`);
+    }
+    const next = {};
+    const renamed = [];
+    let changed = false;
+    for (const [key, value] of Object.entries(scripts)) {
+        const newKey = active[key];
+        if (newKey !== undefined) {
+            renamed.push(key);
+            changed = true;
+        }
+        let newValue = value;
+        if (typeof value === "string") {
+            newValue = renameScriptTokens(value, active);
+            if (newValue !== value)
+                changed = true;
+        }
+        next[newKey ?? key] = newValue;
+    }
+    if (!changed)
+        return false;
+    for (const [key, value] of Object.entries(next)) {
+        if (typeof value !== "string")
+            continue;
+        for (const { name } of findOldScriptNames(value, active)) {
+            console.warn(`${logPrefix} ${tag}core: package.json script "${key}" still runs the old name "${name}"; rename it to "${active[name]}" by hand`);
+        }
+    }
+    pkg.scripts = next;
+    ws.writes.push({ path: pkgPath, action: "update" });
+    if (!dryRun)
+        writePackageJsonLike(raw, pkg);
+    console.log(`${logPrefix} ${tag}core: package.json script names branded${renamed.length > 0 ? ` [${renamed.join(", ")}]` : ""}`);
+    return true;
+}
 // Status option ids of GitHub's Kanban and Team planning board templates; every board
 // made from one carries the same ids.
 const TEMPLATE_STATUS_OPTIONS = {
