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
diff --git a/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts b/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts
index 0a13c8058..e083f4634 100644
--- a/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts
@@ -211,7 +211,7 @@ describe("T2.7 — two-tier CI gate positive assertions (GAP-3)", () => {
     );
     expect(gates).toHaveLength(1);
     expect(gates[0]).toContain(containsExpr);
-    expect(rawTemplate).toMatch(/^ {2}context:\n {4}name: context[^\n]*\n {4}if: >-\n/m);
+    expect(rawTemplate).toMatch(/^ {2}context:\n {4}name: bkit-cloud-context[^\n]*\n {4}if: >-\n/m);
   });
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
diff --git a/.bkit/install.md b/.bkit/install.md
index 67d4167f4..1641a2775 100644
--- a/.bkit/install.md
+++ b/.bkit/install.md
@@ -259,10 +259,10 @@ After the writes, bkit re-runs the credential and environment checks, because so
 | `cloud-router-none` / `cloud-router` | Optional post-install decision — post-CI auto-routing (`bkit.cloud.agent`). `none` (undecided) nudges `bkit install --auto=<variant>`, except under the jira tracker (local runs only); `cloud-router` is informational once `bkit-cloud.yml` is present. See [§ Optional post-install decisions](#optional-post-install-decisions). |
 | `actions-write-permissions-missing` | `bkit-cloud.yml` present but repo Actions permissions are read-only / PR creation disabled — `actions/checkout` + `gh pr create` 403. Repo-level check; org policy can override. |
 | `opencode-setup` | opencode host installed (`--opencode=<provider>`) — names the provider key to set (e.g. `BKIT_OPENROUTER_API_KEY`; `BKIT_OPENCODE_API_KEY` for `opencode-zen` / `opencode-go`), confirms the pre-seeded base URL, and notes all four providers ship curated per-agent pins (re-pin via `.bkit/prompts.md` § Model Overrides). Verify with `bkit doctor` + `bkit status`. |
-| `vale-not-installed` | `lint:prose` runs `bkit ci prose` but vale is not on PATH, so the prose gate fails |
+| `vale-not-installed` | `bkit:lint:prose` runs `bkit ci prose` but vale is not on PATH, so the prose gate fails |
 | `vale-package-not-synced` | vale on PATH but `.vale/styles/write-good/` absent |
 | `gate-missing-called-scripts` | A `bkit:gate:*` script still at bkit's default chains a script `package.json` does not declare (e.g. `typecheck`, `format:check`, `test`). Add it (`.bkit/templates.md` lists the tool scripts and devDeps) or rewrite the gate. |
-| `gate-commit-repeats-push` | `bkit:gate:format` (pre-commit) runs a script the push gate runs again (e.g. `lint:prose`), so it runs on every commit and again on the push. Drop it from `bkit:gate:format`. |
+| `gate-commit-repeats-push` | `bkit:gate:format` (pre-commit) runs a script the push gate runs again (e.g. `bkit:lint:prose`), so it runs on every commit and again on the push. Drop it from `bkit:gate:format`. |
 | `gate-noop` | A `bkit:gate:*` script is empty or cannot fail (`true`, `:`, `exit 0`, `echo …`), so every agent run and push passes it. Warn-only, at install, `bkit check` and `bkit upgrade`, on every branch. Point it at real checks, or delete it and run `bkit upgrade` to restore bkit's default. |
 | `gate-tier-not-wired` | `package.json` declares a deeper test tier (`test:integration`, `test:e2e`, `test:live`) that no `bkit:gate:*` script runs; the advisory prints the gate line to add. |
 | `test-file-script-missing` | `package.json` does not declare `bkit:test:file`, so `/bkit-build` reports test-first as not enforced. The advisory prints the script contract and a Vitest line. |
diff --git a/.bkit/templates.md b/.bkit/templates.md
index a40b5ecd5..1041b1dc7 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -84,8 +84,8 @@ Placeholders: the copies keep them raw, so replace each one in your copy:
 | `{{PRODUCTION_URL}}` | `bkit-health.yml` (`env.PRODUCTION_URL`) | the origin production serves | `https://example.com` |
 | `{{NODE_VERSION}}` | `bkit-ci.yml` (`actions/setup-node` `node-version`, both lanes) | your Node major, or swap the line for `node-version-file: .nvmrc` | `.nvmrc`, then `engines.node`, then `22` |
 | `{{CLOUD_RUNNER}}` | `bkit-cloud.yml` (`runs-on`, all three jobs) | a runner label | `ubuntu-latest` |
-| `{{SCRIPT_PATH}}` | `ai.bkit.launchd.plist` (`ProgramArguments`) | absolute path to the loader script, outside a TCC-protected folder (see § Launchd GUI environment) | `/Users/<you>/.config/bkit/bkit-launchd-env.sh` |
-| `{{ENV_FILE}}` | `ai.bkit.launchd.plist` (`ProgramArguments`, `WatchPaths`) | absolute path to your env file | `/Users/<you>/.config/bkit/launchd.env` |
+| `{{SCRIPT_PATH}}` | `bkit-launchd.plist` (`ProgramArguments`) | absolute path to the loader script, outside a TCC-protected folder (see § Launchd GUI environment) | `/Users/<you>/.config/bkit/bkit-launchd-env.sh` |
+| `{{ENV_FILE}}` | `bkit-launchd.plist` (`ProgramArguments`, `WatchPaths`) | absolute path to your env file | `/Users/<you>/.config/bkit/launchd.env` |
 
 - `bkit install` / `bkit upgrade` refresh `.bkit/templates/` to the package's templates, unsubstituted. `bkit check` fails on a stale copy. `bkit uninstall` removes the folder, never an adopted copy.
 - **What changed on upgrade.** `bkit upgrade` lists the changed, added and removed template paths. For each one you adopted, run `diff .bkit/templates/<path> <path>`, and merge what you want. The placeholder lines differ by design. `git diff .bkit/templates` in the upgrade commit shows the package change.
@@ -161,8 +161,8 @@ bkit seeds only the `bkit:gate:*` / `bkit:deps:*` names, and adds each one only

<!-- prettier-ignore -->
 | Gate (default) | Chains | Needs |
 | --- | --- | --- |
 | `bkit:gate:format` | `pnpm lint-staged` | lint-staged devDep + `.lintstagedrc.json` + prettier |
-| `bkit:gate:min` | `format:check`, `lint:prose`, `slop:delta` | the scripts below + any test reading a min-push file |
-| `bkit:gate:static` | `typecheck`, `lint`, `format:check`, `lint:prose`, `slop:delta` | the scripts below |
+| `bkit:gate:min` | `format:check`, `bkit:lint:prose`, `bkit:slop:delta` | the scripts below + any test reading a min-push file |
+| `bkit:gate:static` | `typecheck`, `lint`, `format:check`, `bkit:lint:prose`, `bkit:slop:delta` | the scripts below |
 | `bkit:gate:static-unit` | `bkit:gate:static` + `test` | a `test` script |
 | `bkit:gate:install-static-unit-build` | `pnpm install --frozen-lockfile` + `bkit:gate:static-unit` + `build` | a `build` script |
 
@@ -171,9 +171,9 @@ bkit seeds only the `bkit:gate:*` / `bkit:deps:*` names, and adds each one only
   "typecheck": "tsc --noEmit",
   "lint": "oxlint -c .oxlintrc.json --type-aware --deny-warnings",
   "format:check": "prettier --check .",
-  "lint:prose": "bkit ci prose",
+  "bkit:lint:prose": "bkit ci prose",
   "lint:slop": "slop-scan scan .",
-  "slop:delta": "bkit ci slop",
+  "bkit:slop:delta": "bkit ci slop",
   "prepare": "husky"
 }
 ```
@@ -186,8 +186,8 @@ pnpm add -D prettier@^3.5.3 slop-scan@^0.3.0 lint-staged@^17.0.0 husky@^9.1.7
 - The value above runs the Oxlint test rules (§ Oxlint) and fails on any hit. It needs `oxlint` and `oxlint-tsgolint`, and fails loudly without them.
 - **If** you have your own linter → chain both: `<your linter> && oxlint -c .oxlintrc.json --type-aware --deny-warnings`.
 - **If** there is no `tsconfig.json` → use `"typecheck": "echo \"[bkit] typecheck: no tsconfig.json — skipping\" >&2"`.
-- `slop:delta` runs `bkit ci slop` (the bkit devDep is on `PATH` through the package script). CI passes the base sha as its one bare argument.
-- `lint:prose` runs `bkit ci prose`: Vale over every `*.md` outside `node_modules/`. Narrow it with the repeatable `--glob=<pattern>` (`*`, `**`, `?`, relative to the repo root), for example `bkit ci prose --glob='docs/*.md' --glob='.agents/*.md'`.
+- `bkit:slop:delta` runs `bkit ci slop` (the bkit devDep is on `PATH` through the package script). CI passes the base sha as its one bare argument.
+- `bkit:lint:prose` runs `bkit ci prose`: Vale over every `*.md` outside `node_modules/`. Narrow it with the repeatable `--glob=<pattern>` (`*`, `**`, `?`, relative to the repo root), for example `bkit ci prose --glob='docs/*.md' --glob='.agents/*.md'`.
 - **If** the stack is not Node → point each gate at your own commands, and keep the gate names.
 - `bkit:test:file` runs one test file and writes a JUnit report to `$BKIT_TEST_REPORT`. bkit appends the file's repo-relative path. `/bkit-build` reads the report for test-first. It is not seeded, and `test-file-script-missing` fires until it is declared.
   - Vitest: `"bkit:test:file": "vitest run --reporter=default --reporter=junit --outputFile.junit=\"$BKIT_TEST_REPORT\""`.
@@ -223,7 +223,7 @@ Setup:
   - **If** you rename the job → set `bkit.testing.ciCapstone`.
 - Adopt a scaffold lane only when its tier exists (`docs/testing.md`). Each `# bkit-stub:<id> —` header raises an install advisory until you enable or delete that stub.
 - Keep the `name: bkit-ci` line, or rename `workflows: [bkit-ci]` in `bkit-cloud.yml` and `bkit-health.yml` and set `bkit.testing.ciWorkflow` to the new file name.
-- Keep `fetch-depth: 0` on the static lane, because `slop:delta` checks the PR base out as a worktree.
+- Keep `fetch-depth: 0` on the static lane, because `bkit:slop:delta` checks the PR base out as a worktree.
 - **If** CI script copies are named without the `bkit-` prefix (`check-capstone.mjs`, `accepted-advisories.json`, …) → the `bkit check` advisory `ci-scripts-old-names` lists each rename.
   - Rename a file and its paths in `.github/workflows/*.yml`, `.husky/pre-push` and `scripts/ci/` in one commit, because the `Check Dependency Audit` step is guarded by `hashFiles` and skips silently when only the file moved.
 
@@ -330,7 +330,7 @@ pnpm add -D lint-staged@^17.0.0 prettier@^3.5.3
 
 ## Vale — prose lint, with House styles
 
-`lint:prose` (`bkit ci prose`, in `bkit:gate:static`) runs Vale with the `write-good` package and bkit's House styles (`Filler`, `Hedging`, `LLMSlop`, `Verbose`) on `.agents/**`. Workflows reach Vale only through the gate. Reference: https://vale.sh/docs/install.
+`bkit:lint:prose` (`bkit ci prose`, in `bkit:gate:static`) runs Vale with the `write-good` package and bkit's House styles (`Filler`, `Hedging`, `LLMSlop`, `Verbose`) on `.agents/**`. Workflows reach Vale only through the gate. Reference: https://vale.sh/docs/install.
 
 ```bash
 brew install vale
@@ -343,13 +343,13 @@ vale sync
 - Cursor: the `Dockerfile` template installs it.
 - Adapt: add `[glob]` scope blocks for your own docs. Turn rules off per path, not globally.
 - Traps:
-  - **If** Vale is not on `PATH` → `lint:prose` fails, so a push from a machine without Vale stops at pre-push. Install Vale there.
-  - A missing `write-good` is copied from the main worktree, else `vale sync` runs. When both fail, `lint:prose` fails.
+  - **If** Vale is not on `PATH` → `bkit:lint:prose` fails, so a push from a machine without Vale stops at pre-push. Install Vale there.
+  - A missing `write-good` is copied from the main worktree, else `vale sync` runs. When both fail, `bkit:lint:prose` fails.
   - Keep the `.bkit/templates/**` block, which turns rules off for the copies.
 
 ## slop-scan — `slop-scan.config.json`
 
-`lint:slop` reports. `slop:delta` (`bkit ci slop`, in `bkit:gate:static`) fails on net-new findings against the base. The base is `--base` / the bare argument, else `$SLOP_BASE_REF`, else the merge-base with `origin/dev` (else `origin/main`). CI passes its planner base, and pre-push on a `dev` push exports the same base as `SLOP_BASE_REF` (§ Git hooks), so both compare against the last green CI push run. On failure it logs each net-new / worsened finding (`path:line`, rule, message; line shifts dropped) and emits them as `findings`. Reference: https://github.com/benvinegar/slop-scan.
+`lint:slop` reports. `bkit:slop:delta` (`bkit ci slop`, in `bkit:gate:static`) fails on net-new findings against the base. The base is `--base` / the bare argument, else `$SLOP_BASE_REF`, else the merge-base with `origin/dev` (else `origin/main`). CI passes its planner base, and pre-push on a `dev` push exports the same base as `SLOP_BASE_REF` (§ Git hooks), so both compare against the last green CI push run. On failure it logs each net-new / worsened finding (`path:line`, rule, message; line shifts dropped) and emits them as `findings`. Reference: https://github.com/benvinegar/slop-scan.
 
 ```bash
 pnpm add -D slop-scan@^0.3.0
@@ -420,17 +420,17 @@ Dock / Spotlight launches start under `launchd`, which never runs the login shel
 | File | Copy from | To | Commit |
 | --- | --- | --- | --- |
 | Loader | `.bkit/templates/scripts/launchd/bkit-launchd-env.sh` | `scripts/launchd/bkit-launchd-env.sh` | that file |
-| LaunchAgent | `.bkit/templates/scripts/launchd/ai.bkit.launchd.plist` | `~/Library/LaunchAgents/ai.bkit.launchd.plist` | never (machine-local) |
-| Tokens | `.bkit/templates/scripts/launchd/launchd.env.example` | `~/.config/bkit/launchd.env` | never (machine-local) |
+| LaunchAgent | `.bkit/templates/scripts/launchd/bkit-launchd.plist` | `~/Library/LaunchAgents/ai.bkit.launchd.plist` | never (machine-local) |
+| Tokens | `.bkit/templates/scripts/launchd/bkit-launchd.env.example` | `~/.config/bkit/launchd.env` | never (machine-local) |
 
 ```bash
 cp .bkit/templates/scripts/launchd/bkit-launchd-env.sh scripts/launchd/
 chmod +x scripts/launchd/bkit-launchd-env.sh
 mkdir -p ~/.config/bkit
-cp .bkit/templates/scripts/launchd/launchd.env.example ~/.config/bkit/launchd.env
+cp .bkit/templates/scripts/launchd/bkit-launchd.env.example ~/.config/bkit/launchd.env
 chmod 600 ~/.config/bkit/launchd.env     # tokens stay owner-only
 # fill in the tokens, then place the agent:
-cp .bkit/templates/scripts/launchd/ai.bkit.launchd.plist ~/Library/LaunchAgents/
+cp .bkit/templates/scripts/launchd/bkit-launchd.plist ~/Library/LaunchAgents/ai.bkit.launchd.plist
 # replace {{SCRIPT_PATH}} and {{ENV_FILE}} with absolute paths in the copied plist
 launchctl bootout gui/$UID ~/Library/LaunchAgents/ai.bkit.launchd.plist 2>/dev/null || true
 launchctl bootstrap gui/$UID ~/Library/LaunchAgents/ai.bkit.launchd.plist
@@ -634,15 +634,15 @@ The PyPI name is `graphifyy`, and the CLI is `graphify`. `[sql]` adds `.sql` fil
 
 ```json
 {
-  "graph": "bash scripts/graphify/bkit-graphify.sh build",
-  "graph:check": "bash scripts/graphify/bkit-graphify.sh check",
-  "graph:clean": "bash scripts/graphify/bkit-graphify.sh clean",
-  "graph:graphml": "bash scripts/graphify/bkit-graphify.sh graphml",
-  "graph:refresh": "bash scripts/graphify/bkit-graphify.sh refresh",
-  "graph:rollup": "bash scripts/graphify/bkit-graphify.sh rollup",
-  "graph:scoped": "bash scripts/graphify/bkit-graphify.sh scoped",
-  "graph:tree": "bash scripts/graphify/bkit-graphify.sh tree",
-  "graph:update": "bash scripts/graphify/bkit-graphify.sh update"
+  "bkit:graph": "bash scripts/graphify/bkit-graphify.sh build",
+  "bkit:graph:check": "bash scripts/graphify/bkit-graphify.sh check",
+  "bkit:graph:clean": "bash scripts/graphify/bkit-graphify.sh clean",
+  "bkit:graph:graphml": "bash scripts/graphify/bkit-graphify.sh graphml",
+  "bkit:graph:refresh": "bash scripts/graphify/bkit-graphify.sh refresh",
+  "bkit:graph:rollup": "bash scripts/graphify/bkit-graphify.sh rollup",
+  "bkit:graph:scoped": "bash scripts/graphify/bkit-graphify.sh scoped",
+  "bkit:graph:tree": "bash scripts/graphify/bkit-graphify.sh tree",
+  "bkit:graph:update": "bash scripts/graphify/bkit-graphify.sh update"
 }
 ```
 
@@ -676,25 +676,25 @@ graphify-out/
 <!-- prettier-ignore -->
 | Command | Does |
 | --- | --- |
-| `pnpm graph` | Extract + cluster. Local. No API key. |
-| `pnpm graph:clean` | Same, after deleting `docs/graphify-out/`. Required after any tsconfig `paths` change. `--force` does not invalidate the module-resolution cache. |
-| `pnpm graph:update` | Re-extract changed files, then recluster. |
-| `pnpm graph:rollup` | Package and module views, plus `docs/capabilities.md`. |
-| `pnpm graph:check` | Rebuild and fail if `docs/capabilities.md` is not what this tree produces. Reads uncommitted edits. Shipped as a self-skipping CI step (every push and pull request; on a PR, GitHub's test merge into the base); enabled in bkit's own CI. |
+| `pnpm bkit:graph` | Extract + cluster. Local. No API key. |
+| `pnpm bkit:graph:clean` | Same, after deleting `docs/graphify-out/`. Required after any tsconfig `paths` change. `--force` does not invalidate the module-resolution cache. |
+| `pnpm bkit:graph:update` | Re-extract changed files, then recluster. |
+| `pnpm bkit:graph:rollup` | Package and module views, plus `docs/capabilities.md`. |
+| `pnpm bkit:graph:check` | Rebuild and fail if `docs/capabilities.md` is not what this tree produces. Reads uncommitted edits. Shipped as a self-skipping CI step (every push and pull request; on a PR, GitHub's test merge into the base); enabled in bkit's own CI. |
 | `bash scripts/graphify/bkit-graphify.sh check-at <rev>` | `check` in a throwaway checkout of `<rev>` (default HEAD); pre-push gate runs it on the commit pushed to dev. |
-| `pnpm graph:refresh` | Rebuild register in a throwaway checkout of the staged files (the index) → copy over `docs/capabilities.md`. Stage the change first, so a run before its commit builds the new state. Fixes a red gate; commit result. |
-| `pnpm graph:scoped [path]` | One subtree. Default `apps/web/src`. |
-| `pnpm graph:graphml` | Opt-in GraphML for Gephi / yEd. |
+| `pnpm bkit:graph:refresh` | Rebuild register in a throwaway checkout of the staged files (the index) → copy over `docs/capabilities.md`. Stage the change first, so a run before its commit builds the new state. Fixes a red gate; commit result. |
+| `pnpm bkit:graph:scoped [path]` | One subtree. Default `apps/web/src`. |
+| `pnpm bkit:graph:graphml` | Opt-in GraphML for Gephi / yEd. |
 
 - `docs/graphify-out/` holds the raw `graph.json`, and `docs/graphify-out/reports/` holds the derived views.
-- Copy `.bkit/templates/docs/capabilities.md` → `docs/capabilities.md` before the first rollup, because the Overrides block must exist. `pnpm graph:rollup` rewrites it after that.
+- Copy `.bkit/templates/docs/capabilities.md` → `docs/capabilities.md` before the first rollup, because the Overrides block must exist. `pnpm bkit:graph:rollup` rewrites it after that.
 - To add a capability, add a rule in `bkit-graph-drift-rules.json`: lane, owner module, one literal marker. The shipped rules JSON has one example row. Replace it.
 - The marker is a literal that only the owner should contain (a host, a header, a marker string). Never use the owner's exported function name, because every legitimate caller then reads as `bypassed`.
 
 `MMD_MIN_WEIGHT` (default 12, set in `bkit-graphify.sh`) drops light edges from the Mermaid views (`.mmd` files and the diagrams in `docs/capabilities.md`).
 
 - **If** the repo has one module per file → edges are thinner, so lower the default in your copy.
-- An env override changes `docs/capabilities.md` per shell, and fails `pnpm graph:check`.
+- An env override changes `docs/capabilities.md` per shell, and fails `pnpm bkit:graph:check`.
 
 Iterate in mermaid.live, and render the internal-architecture diagram locally:
 
@@ -703,7 +703,7 @@ npx -y @mermaid-js/mermaid-cli -i docs/graphify-out/reports/graph-packages.mmd -
 ```
 
 - `bkit-graph-repair.py` runs between extract and cluster. It restores `.js` specifiers that point at `.tsx` files, and workspace subpaths through an `exports` map.
-  - A bare `graphify update` drops that injection, and `pnpm graph:update` restores it.
+  - A bare `graphify update` drops that injection, and `pnpm bkit:graph:update` restores it.
   - `bkit-graph-eager.py` and `bkit-graphify-rollup.py` re-derive those imports from source, and warn with the count that graph.json lacks.
   - Two files that import each other keep one link after clustering, so that pair never reads as missing.
 - `bkit-graph-surface.py` is the route layer. It assumes `apps/web` / `apps/mobile` page routes, `packages/api/src/v1.ts` and the workspace scope `@scope/services/`.
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
diff --git a/.bkit/version b/.bkit/version
index 0760231de..55591d505 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -184,7 +184,7 @@
     "docs/templates/bkit-audit-database.md": "dc51ffa29f2f7ea8e290fc4f0f9919c352224616aeaa234d4675187799226b20",
     "docs/templates/bkit-audit-dead-code.md": "7c139e0febc727819e86d32bb78262b9c38877db4f94daecb8348e2198b3e513",
     "docs/templates/bkit-audit-documentation.md": "1575e555643a4c2d16eb6a41a952a603b821e07260ef5e7267711c40d942946d",
-    "docs/templates/bkit-audit-duplication.md": "175fae825a4f20498e530cd3a8bfb178d247dc830d0e13ab44c1ec48c0428359",
+    "docs/templates/bkit-audit-duplication.md": "5ef30664d08a92a15f5ca75d6deee33069b2bd901b6fe7e83587a16a4f6cc5a5",
     "docs/templates/bkit-audit-llm.md": "f8464214743d15d4c45c5d238e54dcaf5317ca7c92a8df9921be719fff72e09b",
     "docs/templates/bkit-audit-privacy.md": "43a80fc930c66d5c7994136511c9063117a9b07333545995812faa2fc1884c9b",
     "docs/templates/bkit-audit-red-team.md": "402d0bbf55fbb7c6258fb5d9dc418fe7e6cdd92d8a1bd995f954edc79df8e518",
@@ -215,16 +215,16 @@
     ".cursor/agents/bkit-utility-update-roadmap.md": "ea7081672a0fe44a1d2eaf40958c008a7631d329345d11d6a7ca4439a156bf25",
     "docs/templates/bkit-audit-agents.md": "39f34db396db4e50742d230304ecdeb0ceb367ee99e03aaba740872ff8fdd858",
     "docs/templates/bkit-audit-prompts.md": "3323a98811ad65da0fc30d5e52f2a48cd09872dc490fcac0008adba097c37e0a",
-    ".bkit/templates.md": "7986d00edacb0facd8da603afe5540a890ca62901a19a505021ebdf378f20de8",
+    ".bkit/templates.md": "b1f503d52880fd309b32f5bac364a4fcd1f2698ba0005f2687b1101ed6fb4900",
     "docs/templates/bkit-audit-adoption.md": "09fa8636f0529f95ab7a46f4c74727da85fde7180d43979e74cdbb3ea3557794",
     ".bkit/cloud.md": "7594f46d9003bcf77650cf57c3ff934278690187434e58bc57159ccbd1c52524",
     ".bkit/comparison.md": "1ab7924388e037438a73a87c1826f5846f7ae38a5a41479eb6bb7454ae782d07",
-    ".bkit/install.md": "a7b498987af7aeb1a05b019033256f81af218db1e56f3c675cb869764f5b2e2f",
+    ".bkit/install.md": "084f3e67769370a9ef56292a048a4787a3e93deea31973c347b758704dde7fce",
     ".bkit/jsonl.md": "e2f0b02be4edceb5bbd338e4f0d3fb00cb0654cb3b8df447f7b81b9de09561fb",
     ".bkit/providers.md": "953f73d978c548b28b5a036296cf826db7f375cbbe0eee46066f7b3088627f3c",
     ".bkit/prompts.md": "05bef1112ac15f6ffdb8877f132d0b85e2718ca682be4dca0a7dbebdd798ab05",
     ".bkit/trackers.md": "3a3b60d2de7e69a8a59a7567159457afa6c5787a1f066b1399f6ed7499b49d96",
-    ".bkit/workflows.md": "30a29709cfc5eccc30d47103d8a57112d93bbf3f98f8cebfce97b987b9fc292a",
+    ".bkit/workflows.md": "31b4342e019563120bd4562a4e1a0f2a7156c7f32609d3e8e3f14500f8f255ba",
     ".bkit/README.md": "6e48425f9c1cef2824d4197e54a355d6c68dde07ba20db8946b153f4ce2e82e6",
     ".cursor/rules/bkit-rules.mdc": "164c1bc7aed517d5eca01abac2f0c0e87a1102ceb1700eae02e340ef6f9ce797",
     ".claude/hooks/bkit-gateguard.cjs": "e13200a179c654f32e2a91f79be766c1755dd814d7d025bffd707ba6e91b965e",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index e4dd567ea..8db230494 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -1470,8 +1470,8 @@ Each gate is the previous gate plus its own tier, so the name and the value desc
 | Gate | Seeded default | Called by |
 | --- | --- | --- |
 | `bkit:gate:format` | `pnpm lint-staged` | `.husky/pre-commit` |
-| `bkit:gate:min` | `pnpm format:check && pnpm lint:prose && pnpm slop:delta` | `.husky/pre-push` on a min push |
-| `bkit:gate:static` | `pnpm typecheck && pnpm lint && pnpm format:check && pnpm lint:prose && pnpm slop:delta` | `@bkit-build-plan-tasks` (through `bkit tests changed`, when `bkit:gate:changed` is undeclared), `.husky/pre-push` revert path |
+| `bkit:gate:min` | `pnpm format:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta` | `.husky/pre-push` on a min push |
+| `bkit:gate:static` | `pnpm typecheck && pnpm lint && pnpm format:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta` | `@bkit-build-plan-tasks` (through `bkit tests changed`, when `bkit:gate:changed` is undeclared), `.husky/pre-push` revert path |
 | `bkit:gate:static-unit` | `pnpm bkit:gate:static && pnpm test` | build Step 8 (group gate), build Step 12 and `.husky/pre-push` (no integration gate declared); `@bkit-build-plan-gaps-remediate`, `@bkit-build-plan-verify` and `@bkit-debug-failure-remediate` (through `bkit tests changed`, when `bkit:gate:changed` is undeclared) |
 | `bkit:gate:static-unit-integration` | not seeded — `pnpm bkit:gate:static-unit && pnpm test:integration` | build Step 12, debug Step 3, `.husky/pre-push` |
 | `bkit:gate:static-unit-integration-e2e` | not seeded — chains the gate above | debug Step 3 |
@@ -1506,7 +1506,7 @@ Not seeded, because finding the tests a file affects is the stack's job; the `ga
 
 Agents and humans run the same scripts, so a green agent gate and a green `git push` mean the same thing. `bkit-ci.yml` deliberately stays off them: it needs per-step reporting, affected-package conditionals, and the heavier tiers the local gate excludes, so it calls `pnpm typecheck` / `pnpm test` / … directly.
 
-`lint:slop` is in no gate, because `slop-scan scan` is report-only and never fails; `slop:delta` (`bkit ci slop`) is the enforcing gate. `bkit check` (mirror drift) sits in `.husky/pre-push` outside the gates: it validates the bkit install, not consumer source. `lint:prose` (`bkit ci prose`) scans a whole-repo file set, so it gates at pre-push, not pre-commit.
+`lint:slop` is in no gate, because `slop-scan scan` is report-only and never fails; `bkit:slop:delta` (`bkit ci slop`) is the enforcing gate. `bkit check` (mirror drift) sits in `.husky/pre-push` outside the gates: it validates the bkit install, not consumer source. `bkit:lint:prose` (`bkit ci prose`) scans a whole-repo file set, so it gates at pre-push, not pre-commit.
 
 The three deep gates are not seeded: a seeded `pnpm test:integration` hard-fails every repo without that tier, and a gate named `…-integration-e2e` that skipped them silently is the false-green this design exists to kill. Declaring one — a single line chaining its parent — is how a consumer opts a workflow into a deeper tier.
 
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
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 8d9db1be1..1b7a8ac7e 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -27,7 +27,7 @@
 > - `budgeted` = solid border + blue box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.
 > - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.
 > - A fetched URL is a STRING, never an edge, because the reachability scan (§ Unreachable API calls) is the only check that sees it.
-> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `0fb462b53`; when that differs from HEAD ⇒ run `pnpm bkit:graph:update` first.
+> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `741d0c6ea`; when that differs from HEAD ⇒ run `pnpm bkit:graph:update` first.
 > - Detail-level module graph → `pnpm bkit:graph`. This doc is the altitude above that: capabilities, not files.
 
 ## Status Vocabulary
@@ -155,8 +155,8 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 0fb462b53807bf12005a1ad027a3ac9045527540 — do not edit
-  n_bkit_core[".bkit/core<br/>2891 symbols · 127 files<br/>Cursor API access · 1 of 2 sites skip the owner"]
+  %% Generated by bkit-graphify-rollup.py from 741d0c6eadd3c3cfdfc2a428d51a92545d9a081a — do not edit
+  n_bkit_core[".bkit/core<br/>2897 symbols · 127 files<br/>Cursor API access · 1 of 2 sites skip the owner"]
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   nscripts_harvest -->|21| n_bkit_core
   style n_bkit_core stroke:#65a30d,stroke-width:4px,stroke-dasharray:8 4,fill:#ffcc80,color:#1f2328
@@ -180,7 +180,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 0fb462b53807bf12005a1ad027a3ac9045527540 — do not edit
+  %% Generated by bkit-graphify-rollup.py from 741d0c6eadd3c3cfdfc2a428d51a92545d9a081a — do not edit
   subgraph gncustom_health_checks["Health checks"]
     n_bkit_core_engine_checks_after_index[".bkit/core/engine/checks/after/index<br/>11 symbols · 1 files"]
     n_bkit_core_engine_checks_before_index[".bkit/core/engine/checks/before/index<br/>4 symbols · 1 files"]
@@ -273,7 +273,7 @@ flowchart LR
         n_bkit_core_engine_install_modules_antigravity["antigravity<br/>7 symbols · 1 files"]
         n_bkit_core_engine_install_modules_claude["claude<br/>6 symbols · 1 files"]
         n_bkit_core_engine_install_modules_codex["codex<br/>5 symbols · 1 files"]
-        n_bkit_core_engine_install_modules_core["core<br/>56 symbols · 1 files"]
+        n_bkit_core_engine_install_modules_core["core<br/>62 symbols · 1 files"]
         n_bkit_core_engine_install_modules_cursor["cursor<br/>3 symbols · 1 files"]
         n_bkit_core_engine_install_modules_opencode["opencode<br/>10 symbols · 1 files"]
       end
@@ -376,6 +376,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_branches -->|11| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_steps -->|11| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_tracker -->|11| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_install_modules_core -->|11| n_bkit_core_engine_shared_json
   n_bkit_core_engine_install_modules_opencode -->|11| n_bkit_core_engine_render_models
   n_bkit_core_engine_install_modules_opencode -->|11| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_shared_settings -->|11| n_bkit_core_engine_install_manifest
@@ -394,7 +395,6 @@ flowchart LR
   n_bkit_core_engine_install_modules_antigravity -->|10| n_bkit_core_engine_install_modules_core
   n_bkit_core_engine_install_modules_claude -->|10| n_bkit_core_engine_install_modules_core
   n_bkit_core_engine_install_modules_codex -->|10| n_bkit_core_engine_install_modules_core
-  n_bkit_core_engine_install_modules_core -->|10| n_bkit_core_engine_shared_json
   n_bkit_core_engine_install_modules_core -->|10| n_bkit_core_engine_install_write
   n_bkit_core_engine_install_modules_cursor -->|10| n_bkit_core_engine_install_modules_core
   n_bkit_core_engine_install_modules_index -->|10| n_bkit_core_engine_install_modules_core
@@ -656,25 +656,25 @@ flowchart LR
   linkStyle 72 stroke:#b45309,stroke-width:2px
   linkStyle 73 stroke:#b45309,stroke-width:2px
   linkStyle 74 stroke:#be123c,stroke-width:2px
-  linkStyle 75 stroke:#be123c,stroke-width:2px
-  linkStyle 76 stroke:#5b8c00,stroke-width:2px
-  linkStyle 77 stroke:#b45309,stroke-width:2px
-  linkStyle 78 stroke:#0891b2,stroke-width:2px
-  linkStyle 79 stroke:#a21caf,stroke-width:2px
-  linkStyle 80 stroke:#b45309,stroke-width:2px
-  linkStyle 81 stroke:#be123c,stroke-width:2px
-  linkStyle 82 stroke:#c2410c,stroke-width:2px
-  linkStyle 83 stroke:#0891b2,stroke-width:2px
-  linkStyle 84 stroke:#9a6700,stroke-width:2px
-  linkStyle 85 stroke:#0891b2,stroke-width:2px
-  linkStyle 86 stroke:#d73a4a,stroke-width:2px
+  linkStyle 75 stroke:#d73a4a,stroke-width:2px
+  linkStyle 76 stroke:#be123c,stroke-width:2px
+  linkStyle 77 stroke:#5b8c00,stroke-width:2px
+  linkStyle 78 stroke:#b45309,stroke-width:2px
+  linkStyle 79 stroke:#0891b2,stroke-width:2px
+  linkStyle 80 stroke:#a21caf,stroke-width:2px
+  linkStyle 81 stroke:#b45309,stroke-width:2px
+  linkStyle 82 stroke:#be123c,stroke-width:2px
+  linkStyle 83 stroke:#c2410c,stroke-width:2px
+  linkStyle 84 stroke:#0891b2,stroke-width:2px
+  linkStyle 85 stroke:#9a6700,stroke-width:2px
+  linkStyle 86 stroke:#0891b2,stroke-width:2px
   linkStyle 87 stroke:#d73a4a,stroke-width:2px
-  linkStyle 88 stroke:#65a30d,stroke-width:2px
-  linkStyle 89 stroke:#b91c1c,stroke-width:2px
-  linkStyle 90 stroke:#c026d3,stroke-width:2px
+  linkStyle 88 stroke:#d73a4a,stroke-width:2px
+  linkStyle 89 stroke:#65a30d,stroke-width:2px
+  linkStyle 90 stroke:#b91c1c,stroke-width:2px
   linkStyle 91 stroke:#c026d3,stroke-width:2px
   linkStyle 92 stroke:#c026d3,stroke-width:2px
-  linkStyle 93 stroke:#d73a4a,stroke-width:2px
+  linkStyle 93 stroke:#c026d3,stroke-width:2px
   linkStyle 94 stroke:#1a7f37,stroke-width:2px
   linkStyle 95 stroke:#c026d3,stroke-width:2px
   linkStyle 96 stroke:#c026d3,stroke-width:2px
diff --git a/docs/migrations.md b/docs/migrations.md
index 27334ed96..9c1da62f5 100644
--- a/docs/migrations.md
+++ b/docs/migrations.md
@@ -31,6 +31,7 @@
 | Jira key renamed to `BKIT_JIRA_API_KEY` | `.bkit/core/engine/install/modules/core.ts` (`migrateJiraKeyName`, called by `runBkitDocs`) | `.bkit/.env` lines naming `BKIT_JIRA_API_TOKEN` (assignment and comments) → `BKIT_JIRA_API_KEY`, value kept. A file already assigning `BKIT_JIRA_API_KEY` is left alone. Logged only, never a recorded write: a recorded write gets a `canonicalHashes` entry, and a secrets file is never hashed, so `bkit check` does not flag the old name. The `.mcp.json` / `.cursor/mcp.json` / `opencode.json` tracker entries are bkit-owned and re-render with the new name. | up to 5.5.x | `.bkit/core/engine/install/modules/core.integration.test.ts` |
 | Template note moved inside the managed block | `.bkit/core/engine/install/template-notes.ts` (`migrateTemplateNotes`, `RETIRED_TEMPLATE_NOTE_HASHES`, called by `runBkitDocs`) | `docs/templates/bkit-*.md` with a `<!-- Note: … -->` line above `<!-- bkit:start -->` whose sha256 matches a note wording a bkit template carried there → that line removed, with the blank line after it, because the note now opens the managed block, where upgrade refreshes it. When nothing else is left above the block, every blank line there goes too. Every other line above the block stays, and a leading byte-order mark stays. A note that matches no shipped wording is kept; when it names `docs/audits/{YYYYMM}`, `docs/plans/{YYYYMM}` or `@bkit-`, install, upgrade and `bkit check` each print one line naming the file. A file with CRLF line endings throughout is left as it is. Recorded in ws, so `bkit check` fails until upgrade runs. | 5.0.0-6.0.x | `.bkit/core/engine/install/template-notes.test.ts`; `.bkit/core/engine/install/modules/core.integration.test.ts` |
 | Agent and step renamed to `bkit-build-plan-tasks` | `.bkit/core/engine/install/modules/core.ts` (`migrateModelOverrideAgentNames`, `RENAMED_AGENTS`, called by `runBkitDocs`); `.bkit/core/engine/commands/workflow/status.ts` (`RENAMED_STEPS`, applied by `readStatusRows` / `readStatusRowsAt`); `.bkit/core/engine/commands/workflow/context.ts` (`TASKS_LOG`) | `.bkit/prompts.md` `## Model Overrides` rows below `bkit:end` naming `bkit-build-plan-execute` → `bkit-build-plan-tasks`, provider and model kept, recorded as an update (the canonical hash covers the managed block only); a row already naming the new agent leaves the old row for the unknown-override report. Read-side only, nothing rewritten: a `status.jsonl` row with `step: build-plan-execute` is read as `build-plan-tasks`, and a `build-plan-execute-{GROUP}-log.md` still marks its tasks done, so a build in flight across the rename resumes; the rows and logs on disk keep the old name. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`, `.bkit/core/engine/commands/workflow/status.test.ts`, `.bkit/core/engine/commands/workflow/context.test.ts` |
+| Branded script names | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedScriptNames`, `BKIT_SCRIPT_RENAMES`, called by `seedCorePackageJsonScripts` before `ensurePackageJsonScripts`) | `package.json` scripts `lint:prose`, `slop:delta`, `graph` and `graph:{check,clean,graphml,refresh,rollup,scoped,tree,update}` → `bkit:` + the same name; the old key is deleted and the old token in other script values and default gate chains is rewritten. A pair whose old and new keys both exist is left as it is with a warning; a `graph*` script whose value is not bkit's (`scripts/graphify/bkit-`) is the consumer's own and stays. Original indent kept. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 
 ## Detect-only guards
 
