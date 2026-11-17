diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index 506b19aa4..715bbf428 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -340,7 +340,7 @@ pnpm add -D prettier@^3.5.3
 
 ## lint-staged — `.lintstagedrc.json`
 
-Copy `.bkit/templates/lintstagedrc.example.json` to `.lintstagedrc.json`. The samples under `.bkit/templates/` carry non-dotfile names so prettier and lint-staged do not read them as live config; `bkit upgrade` removes the old dotfile-named samples (`.lintstagedrc.json`, `.prettierignore`) from `.bkit/templates/`.
+Copy `.bkit/templates/lintstagedrc.example.json` to `.lintstagedrc.json`. The samples under `.bkit/templates/` carry non-dotfile names so prettier and lint-staged do not read them as live config; `bkit upgrade` removes the old dotfile-named samples (`.lintstagedrc.json`, `.prettierignore`) from `.bkit/templates/`. bkit writes no lint-staged config into your repo: when `bkit:gate:format` runs `lint-staged` without a `--config` path, lint-staged is a dependency and no config exists, install and upgrade print `bkit upgrade: no root lint-staged config — commits will fail. Fix: cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json`.
 
 It runs prettier over staged files. `bkit:gate:format` (the pre-commit hook) calls it. Reference: https://github.com/lint-staged/lint-staged.
 
diff --git a/.bkit/core/engine/checks/tips/detect.test.ts b/.bkit/core/engine/checks/tips/detect.test.ts
index c52d6ad06..f29f73ef0 100644
--- a/.bkit/core/engine/checks/tips/detect.test.ts
+++ b/.bkit/core/engine/checks/tips/detect.test.ts
@@ -128,6 +128,33 @@ describe("hasLintStagedConfig", () => {
     write(".lintstagedrc.json", "{}");
     expect(hasLintStagedConfig(cwd)).toBe(true);
   });
+
+  it("hasLintStagedConfig is true for every config name lint-staged 17 reads", () => {
+    const files = [
+      "lint-staged.config.ts",
+      ".lintstagedrc.ts",
+      ".lintstagedrc.mts",
+      ".lintstagedrc.cts",
+      "lint-staged.config.mts",
+      "lint-staged.config.cts",
+    ];
+    for (const file of files) {
+      fs.rmSync(cwd, { recursive: true, force: true });
+      fs.mkdirSync(cwd, { recursive: true });
+      write(file, "export default {};\n");
+      expect(hasLintStagedConfig(cwd), file).toBe(true);
+    }
+    for (const file of ["package.yaml", "package.yml"]) {
+      fs.rmSync(cwd, { recursive: true, force: true });
+      fs.mkdirSync(cwd, { recursive: true });
+      write(file, "name: x\nlint-staged:\n  '*': prettier -w\n");
+      expect(hasLintStagedConfig(cwd), file).toBe(true);
+    }
+    fs.rmSync(cwd, { recursive: true, force: true });
+    fs.mkdirSync(cwd, { recursive: true });
+    write("package.yaml", "name: x\n");
+    expect(hasLintStagedConfig(cwd)).toBe(false);
+  });
 });
 
 describe("hasJsTestRunner", () => {
diff --git a/.bkit/core/engine/checks/tips/detect.ts b/.bkit/core/engine/checks/tips/detect.ts
index 05f6eaedd..a5b600415 100644
--- a/.bkit/core/engine/checks/tips/detect.ts
+++ b/.bkit/core/engine/checks/tips/detect.ts
@@ -132,11 +132,17 @@ const LINT_STAGED_CONFIGS = [
   ".lintstagedrc.yaml",
   ".lintstagedrc.yml",
   ".lintstagedrc.mjs",
-  ".lintstagedrc.cjs",
+  ".lintstagedrc.mts",
   ".lintstagedrc.js",
+  ".lintstagedrc.ts",
+  ".lintstagedrc.cjs",
+  ".lintstagedrc.cts",
   "lint-staged.config.mjs",
-  "lint-staged.config.cjs",
+  "lint-staged.config.mts",
   "lint-staged.config.js",
+  "lint-staged.config.ts",
+  "lint-staged.config.cjs",
+  "lint-staged.config.cts",
 ];
 
 /** True when any `.github/workflows/*.yml` / `*.yaml` contains `needle`. */
@@ -149,9 +155,11 @@ export function anyWorkflowMentions(cwd: string, needle: string): boolean {
     .some((f) => readText(cwd, path.join(".github", "workflows", f)).includes(needle));
 }
 
-/** True when lint-staged is configured: any of its config files, or `package.json` `lint-staged`. */
+/** True when lint-staged is configured: any of its config files, `package.json` or `package.yaml` / `package.yml` `lint-staged` key. */
 export function hasLintStagedConfig(cwd: string): boolean {
   if (LINT_STAGED_CONFIGS.some((rel) => exists(cwd, rel))) return true;
+  if (["package.yaml", "package.yml"].some((rel) => /^lint-staged\s*:/m.test(readText(cwd, rel))))
+    return true;
   const pkg = readPackageJson(cwd);
   return pkg.ok && pkg.pkg["lint-staged"] !== undefined;
 }
diff --git a/.bkit/core/engine/commands/install/upgrade.integration.test.ts b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
index 1b1b288d6..88787fa8b 100644
--- a/.bkit/core/engine/commands/install/upgrade.integration.test.ts
+++ b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
@@ -2393,8 +2393,9 @@ describe("#892 — upgrade replaces the old sample config names", () => {
   });
 });
 
-describe("#892 — upgrade copies the lint-staged sample to the root", () => {
+describe("#892 — upgrade warns about a missing root lint-staged config instead of writing one", () => {
   const cli = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../cli.ts");
+  const COPY_LINE = "cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json";
   function runCli(args: string[]) {
     return spawnSync(requireTsx(), [cli, ...args], {
       cwd: tmpDir,
@@ -2409,8 +2410,14 @@ describe("#892 — upgrade copies the lint-staged sample to the root", () => {
     });
   }
 
-  /** A consumer holding the old sample, gating format on lint-staged, with no root lint-staged config. */
-  function seedOldLintStagedConsumer(): void {
+  /** A consumer holding the old sample, gating format on lint-staged, with lint-staged installed and no root config. */
+  function seedNestedSampleConsumer(
+    opts: {
+      gate?: string;
+      devDependencies?: Record<string, string>;
+      rootFile?: [string, string];
+    } = {},
+  ): void {
     expect(spawnSync("git", ["init", "-q"], { cwd: tmpDir }).status).toBe(0);
     fs.writeFileSync(
       path.join(tmpDir, "package.json"),
@@ -2425,7 +2432,8 @@ describe("#892 — upgrade copies the lint-staged sample to the root", () => {
         {
           name: "consumer",
           version: "0.0.0",
-          scripts: { "bkit:gate:format": "pnpm lint-staged" },
+          scripts: { "bkit:gate:format": opts.gate ?? "pnpm lint-staged" },
+          devDependencies: opts.devDependencies ?? { "lint-staged": "^17.0.0" },
         },
         null,
         2,
@@ -2436,34 +2444,70 @@ describe("#892 — upgrade copies the lint-staged sample to the root", () => {
     fs.writeFileSync(path.join(templates, ".lintstagedrc.json"), "{}\n", "utf-8");
     fs.rmSync(path.join(templates, "lintstagedrc.example.json"), { force: true });
     fs.rmSync(path.join(tmpDir, ".lintstagedrc.json"), { force: true });
+    if (opts.rootFile)
+      fs.writeFileSync(path.join(tmpDir, opts.rootFile[0]), opts.rootFile[1], "utf-8");
   }
 
-  it("upgrade copies the lint-staged sample to the root when the format gate runs lint-staged with no root config", () => {
-    seedOldLintStagedConsumer();
+  it("upgrade writes no root lint-staged config for a consumer that relied on the nested sample", () => {
+    seedNestedSampleConsumer();
 
     const up = runCli(["upgrade", "--auto-apply"]);
     expect(up.status, combinedOutput(up)).toBe(0);
 
-    const rootConfig = path.join(tmpDir, ".lintstagedrc.json");
-    expect(fs.existsSync(rootConfig)).toBe(true);
-    const shipped = path.join(tmpDir, ".bkit", "templates", "lintstagedrc.example.json");
-    expect(fs.readFileSync(rootConfig, "utf-8")).toBe(fs.readFileSync(shipped, "utf-8"));
-    expect(combinedOutput(up)).toMatch(/(?<![\w./-])\.lintstagedrc\.json/);
+    expect(fs.existsSync(path.join(tmpDir, ".lintstagedrc.json"))).toBe(false);
   });
 
-  it("upgrade dry run reports the lint-staged config copy without writing it", () => {
-    seedOldLintStagedConsumer();
+  it("upgrade names the missing root lint-staged config with the copy command", () => {
+    seedNestedSampleConsumer();
 
-    const dry = runCli(["upgrade", "--dry-run"]);
-    expect(dry.status, combinedOutput(dry)).toBe(0);
+    const up = runCli(["upgrade", "--auto-apply"]);
+    expect(up.status, combinedOutput(up)).toBe(0);
 
-    // A root-level name only: the pruned `.bkit/templates/.lintstagedrc.json` line must not satisfy it.
-    expect(combinedOutput(dry)).toMatch(/(?<![\w./-])\.lintstagedrc\.json/);
-    // The copy is a dry-run write line of its own, naming the root file: a `removed:` or `added:`
-    // template line, or any line that only mentions the file, does not count.
-    expect(combinedOutput(dry)).toMatch(
-      /\[dry-run\][^\n]*(?<![\w./-])\.lintstagedrc\.json[ \t]*(?:\n|$)/,
+    expect(combinedOutput(up)).toContain(
+      `bkit upgrade: no root lint-staged config — commits will fail. Fix: ${COPY_LINE}`,
     );
+    expect(combinedOutput(up).split(COPY_LINE).length - 1).toBe(1);
+  });
+
+  it("upgrade --dry-run names the missing root lint-staged config once and writes none", () => {
+    seedNestedSampleConsumer();
+
+    const up = runCli(["upgrade", "--dry-run"]);
+    expect(up.status, combinedOutput(up)).toBe(0);
+
+    expect(combinedOutput(up).split(COPY_LINE).length - 1).toBe(1);
+    expect(fs.existsSync(path.join(tmpDir, ".lintstagedrc.json"))).toBe(false);
+  });
+
+  it("upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts", () => {
+    seedNestedSampleConsumer({
+      rootFile: ["lint-staged.config.ts", "export default { '*': 'prettier -w' };\n"],
+    });
+
+    const up = runCli(["upgrade", "--auto-apply"]);
+    expect(up.status, combinedOutput(up)).toBe(0);
+
+    expect(fs.existsSync(path.join(tmpDir, ".lintstagedrc.json"))).toBe(false);
+    expect(combinedOutput(up)).not.toContain(COPY_LINE);
+  });
+
+  it("upgrade prints no missing lint-staged config line when lint-staged is not a dependency", () => {
+    seedNestedSampleConsumer({ devDependencies: {} });
+
+    const up = runCli(["upgrade", "--auto-apply"]);
+    expect(up.status, combinedOutput(up)).toBe(0);
+
+    expect(fs.existsSync(path.join(tmpDir, ".lintstagedrc.json"))).toBe(false);
+    expect(combinedOutput(up)).not.toContain(COPY_LINE);
+  });
+
+  it("upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path", () => {
+    seedNestedSampleConsumer({ gate: "pnpm lint-staged --config tools/lint-staged.json" });
+
+    const up = runCli(["upgrade", "--auto-apply"]);
+    expect(up.status, combinedOutput(up)).toBe(0);
+
     expect(fs.existsSync(path.join(tmpDir, ".lintstagedrc.json"))).toBe(false);
+    expect(combinedOutput(up)).not.toContain(COPY_LINE);
   });
 });
diff --git a/.bkit/core/engine/commands/install/upgrade.ts b/.bkit/core/engine/commands/install/upgrade.ts
index 2b23ec12c..046cff28a 100644
--- a/.bkit/core/engine/commands/install/upgrade.ts
+++ b/.bkit/core/engine/commands/install/upgrade.ts
@@ -71,9 +71,9 @@ import {
   writeCursorCliPermissionsArtifact,
 } from "../../install/cloud-env.js";
 import {
-  migrateLintStagedSample,
   syncTemplateCopies,
   formatTemplateChanges,
+  warnMissingLintStagedConfig,
 } from "../../install/template-copies.js";
 import { formatPayloadLinkChanges, syncPayloadLinks } from "../../install/payload-links.js";
 import { renderOpencodeJson, reconcileOpencodeJson } from "../../install/modules/opencode.js";
@@ -811,11 +811,6 @@ export async function runUpgradeCommand(upgradeFlags: UpgradeFlags): Promise<voi
   // Refresh the consumer's `.bkit/templates/` copies and name what changed. The
   // list is computed before overwriting, so it is exactly the package's template
   // diff. The copies carry no hash, so nothing here feeds `.bkit/version`.
-  migrateLintStagedSample(process.cwd(), {
-    dryRun: upgradeFlags.dryRun,
-    ws: { writes: [] },
-    logPrefix: LOG_PREFIX,
-  });
   const templateChanges = syncTemplateCopies(process.cwd(), {
     dryRun: upgradeFlags.dryRun,
     ws: { writes: [] },
@@ -1068,6 +1063,8 @@ export async function runUpgradeCommand(upgradeFlags: UpgradeFlags): Promise<voi
   );
 
   // `.bkit/advisories.md` describes the upgraded repo, not the last install or check.
+  // A real upgrade prints the missing-lint-staged line through the advisories; a dry run prints it here.
+  if (upgradeFlags.dryRun) warnMissingLintStagedConfig(process.cwd());
   if (!upgradeFlags.dryRun) await runUpgradeAdvisories();
 
   // Non-interactive mode: exit non-zero on conflicts
diff --git a/.bkit/core/engine/install/modules/core.ts b/.bkit/core/engine/install/modules/core.ts
index 848e03eab..7a0678fa2 100644
--- a/.bkit/core/engine/install/modules/core.ts
+++ b/.bkit/core/engine/install/modules/core.ts
@@ -21,7 +21,7 @@ import {
 import type { TokenMap } from "../placeholders.js";
 import {
   listFilesRecursive,
-  migrateLintStagedSample,
+  warnMissingLintStagedConfig,
   syncTemplateCopies,
 } from "../template-copies.js";
 import { PAYLOAD_LINK_RELPATHS, syncPayloadLinks } from "../payload-links.js";
@@ -1891,13 +1891,13 @@ export function runCoreModule(ctx: ModuleContext): void {
   // 3b2. Template copies — the whole templates root into the consumer's
   // `.bkit/templates/` (never applied to the repo; no-op in dogfood).
   console.log(`${logPrefix} ${tag}Running template copies pass`);
-  migrateLintStagedSample(cwd, { dryRun, ws, logPrefix });
   const templateChanges = syncTemplateCopies(cwd, { dryRun, ws });
   for (const [verb, paths] of Object.entries(templateChanges)) {
     for (const p of paths) {
       console.log(`${logPrefix} ${tag}template ${verb}: ${path.join(TEMPLATE_COPIES_DIR, p)}`);
     }
   }
+  warnMissingLintStagedConfig(cwd);
 
   // 3b3. Payload view links — `.bkit/core` + `.bkit/shared` symlinks into the
   // installed package (browse-only, gitignored; no-op in dogfood). A real
diff --git a/.bkit/core/engine/install/template-copies.ts b/.bkit/core/engine/install/template-copies.ts
index d4e547ce4..908d5a743 100644
--- a/.bkit/core/engine/install/template-copies.ts
+++ b/.bkit/core/engine/install/template-copies.ts
@@ -10,7 +10,7 @@ import {
   TEMPLATE_COPIES_DIR,
 } from "../shared/package-roots.js";
 import { hasLintStagedConfig } from "../checks/tips/detect.js";
-import { readPackageJson } from "../shared/package-json.js";
+import { readDependencyNames, readPackageJson } from "../shared/package-json.js";
 import type { WriteSet } from "./write.js";
 
 export function listFilesRecursive(dir: string): string[] {
@@ -138,33 +138,27 @@ export function formatTemplateChanges(changes: TemplateCopyChanges): string {
   ].join("\n");
 }
 
-const OLD_LINT_STAGED_SAMPLE = ".lintstagedrc.json";
-const LINT_STAGED_SAMPLE = "lintstagedrc.example.json";
+/** The one line install and upgrade print when a gating lint-staged has no config to read. */
+export const MISSING_LINT_STAGED_CONFIG_LINE =
+  "bkit upgrade: no root lint-staged config — commits will fail. Fix: cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json";
 
-// Migration (installs up to 6.1.x, `docs/migrations.md`): until the sample rename, lint-staged
-// found `.bkit/templates/.lintstagedrc.json` as its config in a repo with none at the root. The
-// sync prunes that file, so a consumer holding it, gating format on `lint-staged` and with no
-// lint-staged config of its own gets the shipped sample copied to `.lintstagedrc.json` first.
-// Idempotent (a root config, once written, ends the trigger); dry-run pushes the same write
-// without touching disk. Returns true when it copied. Call before `syncTemplateCopies`.
-export function migrateLintStagedSample(
-  cwd: string,
-  opts: { dryRun: boolean; ws: WriteSet; logPrefix: string },
-): boolean {
-  if (path.resolve(cwd) === getPkgRoot()) return false;
-  if (!fs.existsSync(path.join(cwd, TEMPLATE_COPIES_DIR, OLD_LINT_STAGED_SAMPLE))) return false;
-  const src = path.join(getTemplatesRoot(), LINT_STAGED_SAMPLE);
-  if (!fs.existsSync(src)) return false;
+// True when `bkit:gate:format` runs `lint-staged` without a `--config` / `-c` path.
+function formatGateRunsBareLintStaged(cwd: string): boolean {
   const pkg = readPackageJson(cwd);
-  const gate = pkg.ok ? (pkg.pkg.scripts as Record<string, unknown> | undefined) : undefined;
-  const format = gate?.["bkit:gate:format"];
+  const scripts = pkg.ok ? (pkg.pkg.scripts as Record<string, unknown> | undefined) : undefined;
+  const format = scripts?.["bkit:gate:format"];
   if (typeof format !== "string" || !/\blint-staged\b/.test(format)) return false;
+  return !/(?:^|\s)(?:--config(?:[=\s]|$)|-c(?:[=\s]|$))/.test(format);
+}
+
+// bkit writes no lint-staged config into a consumer repo. When the format gate runs lint-staged
+// bare, lint-staged is installed and no config exists, the commit hook fails: print the one-line
+// fix. Prints in a dry run too; writes nothing. Returns true when it printed. No-op in dogfood.
+export function warnMissingLintStagedConfig(cwd: string): boolean {
+  if (path.resolve(cwd) === getPkgRoot()) return false;
+  if (!formatGateRunsBareLintStaged(cwd)) return false;
+  if (!readDependencyNames(cwd).includes("lint-staged")) return false;
   if (hasLintStagedConfig(cwd)) return false;
-  const tag = opts.dryRun ? "[dry-run] " : "";
-  if (!opts.dryRun) fs.copyFileSync(src, path.join(cwd, ".lintstagedrc.json"));
-  opts.ws.writes.push({ path: ".lintstagedrc.json", action: "write" });
-  console.log(
-    `${opts.logPrefix} ${tag}lint-staged config copied from the sample: .lintstagedrc.json`,
-  );
+  console.log(MISSING_LINT_STAGED_CONFIG_LINE);
   return true;
 }
diff --git a/.bkit/templates.md b/.bkit/templates.md
index 6641c85f2..020177da7 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -340,7 +340,7 @@ pnpm add -D prettier@^3.5.3
 
 ## lint-staged — `.lintstagedrc.json`
 
-Copy `.bkit/templates/lintstagedrc.example.json` to `.lintstagedrc.json`. The samples under `.bkit/templates/` carry non-dotfile names so prettier and lint-staged do not read them as live config; `bkit upgrade` removes the old dotfile-named samples (`.lintstagedrc.json`, `.prettierignore`) from `.bkit/templates/`.
+Copy `.bkit/templates/lintstagedrc.example.json` to `.lintstagedrc.json`. The samples under `.bkit/templates/` carry non-dotfile names so prettier and lint-staged do not read them as live config; `bkit upgrade` removes the old dotfile-named samples (`.lintstagedrc.json`, `.prettierignore`) from `.bkit/templates/`. bkit writes no lint-staged config into your repo: when `bkit:gate:format` runs `lint-staged` without a `--config` path, lint-staged is a dependency and no config exists, install and upgrade print `bkit upgrade: no root lint-staged config — commits will fail. Fix: cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json`.
 
 It runs prettier over staged files. `bkit:gate:format` (the pre-commit hook) calls it. Reference: https://github.com/lint-staged/lint-staged.
 
diff --git a/.bkit/version b/.bkit/version
index f5fd1b54c..706c237ce 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -215,7 +215,7 @@
     ".cursor/agents/bkit-utility-update-roadmap.md": "55509636caed7293659d97f6939af8bb4e36a35bd4c82b9f79e7613f887ffccc",
     "docs/templates/bkit-audit-agents.md": "19cbbfd8479e5279bfb8ff1dae9beb5c6a790d68f95bb512318e38ce2da391f4",
     "docs/templates/bkit-audit-prompts.md": "74f1b59249dc4278506a0b6c9d21f8cef6fa8cb403ea8fbc558995357fc360da",
-    ".bkit/templates.md": "81a7f59e9ae5781da5a912ecef424323169860c3d1201eb549cd6509fd507a26",
+    ".bkit/templates.md": "75af722a8fddf311ef9bdb15c174a67f729013ee856346e9fe2c5f1bfbd69f2c",
     "docs/templates/bkit-audit-adoption.md": "a3f28a15f89cf733d5458d3d5710d4a1bd322fd6e1cea1a0aa4f47b44d525b96",
     ".bkit/cloud.md": "ee7de5713685d27a89276cbb5a437cbeca6b5d2829d513ef4b21df891f9da426",
     ".bkit/comparison.md": "48845a4c08abe236dcb5af4947db755a10aad06996a87c5d5b1bed07528514de",
diff --git a/DETAILS.md b/DETAILS.md
index 6f9a17295..4341a6e1b 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -348,7 +348,7 @@ flowchart LR
     n_bkit_core_engine_checks["checks<br/>252 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
     n_bkit_core_engine_commands["commands<br/>1714 symbols · 51 files"]
-    n_bkit_core_engine_install["install<br/>308 symbols · 20 files"]
+    n_bkit_core_engine_install["install<br/>311 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>184 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>150 symbols · 13 files<br/>1 open finding"]
@@ -357,7 +357,7 @@ flowchart LR
   n_bkit_core_engine_commands -->|388| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|379| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|205| n_bkit_core_engine_install
-  n_bkit_core_engine_install -->|170| n_bkit_core_engine_shared
+  n_bkit_core_engine_install -->|176| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|132| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|83| n_bkit_core_engine_checks
   n_bkit_core_engine_install -->|61| n_bkit_core_engine_render
@@ -365,10 +365,10 @@ flowchart LR
   n_bkit_core_engine_commands -->|42| n_bkit_core_engine_render
   n_bkit_core_engine_cli -->|34| n_bkit_core_engine_commands
   n_bkit_core_engine_checks -->|18| n_bkit_core_engine_commands
+  n_bkit_core_engine_install -->|17| n_bkit_core_engine_checks
   n_bkit_core_engine_ledgers -->|17| n_bkit_core_engine_shared
   n_bkit_core_engine_shared -->|15| n_bkit_core_engine_install
   n_bkit_core_engine_commands -->|15| n_bkit_core_engine_cli
-  n_bkit_core_engine_install -->|14| n_bkit_core_engine_checks
   nscripts_harvest -->|14| n_bkit_core_engine_ledgers
   n_bkit_core_engine_checks -->|12| n_bkit_core_engine_cli
   n_bkit_core_engine_render -->|12| n_bkit_core_engine_shared
diff --git a/dist/checks/tips/detect.js b/dist/checks/tips/detect.js
index f043a294d..6ec3b84c4 100644
--- a/dist/checks/tips/detect.js
+++ b/dist/checks/tips/detect.js
@@ -118,11 +118,17 @@ const LINT_STAGED_CONFIGS = [
     ".lintstagedrc.yaml",
     ".lintstagedrc.yml",
     ".lintstagedrc.mjs",
-    ".lintstagedrc.cjs",
+    ".lintstagedrc.mts",
     ".lintstagedrc.js",
+    ".lintstagedrc.ts",
+    ".lintstagedrc.cjs",
+    ".lintstagedrc.cts",
     "lint-staged.config.mjs",
-    "lint-staged.config.cjs",
+    "lint-staged.config.mts",
     "lint-staged.config.js",
+    "lint-staged.config.ts",
+    "lint-staged.config.cjs",
+    "lint-staged.config.cts",
 ];
 /** True when any `.github/workflows/*.yml` / `*.yaml` contains `needle`. */
 export function anyWorkflowMentions(cwd, needle) {
@@ -134,10 +140,12 @@ export function anyWorkflowMentions(cwd, needle) {
         .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
         .some((f) => readText(cwd, path.join(".github", "workflows", f)).includes(needle));
 }
-/** True when lint-staged is configured: any of its config files, or `package.json` `lint-staged`. */
+/** True when lint-staged is configured: any of its config files, `package.json` or `package.yaml` / `package.yml` `lint-staged` key. */
 export function hasLintStagedConfig(cwd) {
     if (LINT_STAGED_CONFIGS.some((rel) => exists(cwd, rel)))
         return true;
+    if (["package.yaml", "package.yml"].some((rel) => /^lint-staged\s*:/m.test(readText(cwd, rel))))
+        return true;
     const pkg = readPackageJson(cwd);
     return pkg.ok && pkg.pkg["lint-staged"] !== undefined;
 }
diff --git a/dist/commands/install/upgrade.js b/dist/commands/install/upgrade.js
index f662751d9..aed284ef7 100644
--- a/dist/commands/install/upgrade.js
+++ b/dist/commands/install/upgrade.js
@@ -38,7 +38,7 @@ import { detectInstalledHostModules } from "../../install/hosts.js";
 import { detectInstalledModules } from "./check.js";
 import { remapTemplateDest } from "../../install/template-copies.js";
 import { CLAUDE_CLOUD_RELPATH, CODEX_CLOUD_RELPATH, CURSOR_CLOUD_RELPATH, writeClaudeCloudDoc, writeCodexCloudDoc, writeCursorCloudDoc, writeCursorCliPermissionsArtifact, } from "../../install/cloud-env.js";
-import { migrateLintStagedSample, syncTemplateCopies, formatTemplateChanges, } from "../../install/template-copies.js";
+import { syncTemplateCopies, formatTemplateChanges, warnMissingLintStagedConfig, } from "../../install/template-copies.js";
 import { formatPayloadLinkChanges, syncPayloadLinks } from "../../install/payload-links.js";
 import { renderOpencodeJson, reconcileOpencodeJson } from "../../install/modules/opencode.js";
 import { renderManagedOutputs } from "../../install/modules/index.js";
@@ -576,11 +576,6 @@ export async function runUpgradeCommand(upgradeFlags) {
     // Refresh the consumer's `.bkit/templates/` copies and name what changed. The
     // list is computed before overwriting, so it is exactly the package's template
     // diff. The copies carry no hash, so nothing here feeds `.bkit/version`.
-    migrateLintStagedSample(process.cwd(), {
-        dryRun: upgradeFlags.dryRun,
-        ws: { writes: [] },
-        logPrefix: LOG_PREFIX,
-    });
     const templateChanges = syncTemplateCopies(process.cwd(), {
         dryRun: upgradeFlags.dryRun,
         ws: { writes: [] },
@@ -798,6 +793,9 @@ export async function runUpgradeCommand(upgradeFlags) {
     }
     console.log(`${LOG_PREFIX} Done. updated: ${result.updated.length}, skipped: ${result.skipped.length}, conflicts: ${result.conflicts.length}, re-rendered: ${rendered.length}`);
     // `.bkit/advisories.md` describes the upgraded repo, not the last install or check.
+    // A real upgrade prints the missing-lint-staged line through the advisories; a dry run prints it here.
+    if (upgradeFlags.dryRun)
+        warnMissingLintStagedConfig(process.cwd());
     if (!upgradeFlags.dryRun)
         await runUpgradeAdvisories();
     // Non-interactive mode: exit non-zero on conflicts
diff --git a/dist/install/modules/core.js b/dist/install/modules/core.js
index 8773afc31..7732a9dd8 100644
--- a/dist/install/modules/core.js
+++ b/dist/install/modules/core.js
@@ -6,7 +6,7 @@ import * as path from "node:path";
 import { writeTier1, writeTier2, ensurePackageJsonScripts } from "../write.js";
 import { readBkitVersion, writeBkitVersion, hashFile, mergeCanonicalHashes, sha256, } from "../version-file.js";
 import { extractManagedBlock, findLineAnchoredMarkers, selectMarkers, stripManagedBlock, } from "../managed-block.js";
-import { listFilesRecursive, migrateLintStagedSample, syncTemplateCopies, } from "../template-copies.js";
+import { listFilesRecursive, warnMissingLintStagedConfig, syncTemplateCopies, } from "../template-copies.js";
 import { PAYLOAD_LINK_RELPATHS, syncPayloadLinks } from "../payload-links.js";
 import { writeNetworkAllowlist } from "../network-allowlist.js";
 import { migrateContextCiWorkflow } from "../context-ci-workflow.js";
@@ -1696,13 +1696,13 @@ export function runCoreModule(ctx) {
     // 3b2. Template copies — the whole templates root into the consumer's
     // `.bkit/templates/` (never applied to the repo; no-op in dogfood).
     console.log(`${logPrefix} ${tag}Running template copies pass`);
-    migrateLintStagedSample(cwd, { dryRun, ws, logPrefix });
     const templateChanges = syncTemplateCopies(cwd, { dryRun, ws });
     for (const [verb, paths] of Object.entries(templateChanges)) {
         for (const p of paths) {
             console.log(`${logPrefix} ${tag}template ${verb}: ${path.join(TEMPLATE_COPIES_DIR, p)}`);
         }
     }
+    warnMissingLintStagedConfig(cwd);
     // 3b3. Payload view links — `.bkit/core` + `.bkit/shared` symlinks into the
     // installed package (browse-only, gitignored; no-op in dogfood). A real
     // directory or file at either path is never clobbered (advisory); a platform
diff --git a/dist/install/template-copies.js b/dist/install/template-copies.js
index 1167b42c6..a51b761ec 100644
--- a/dist/install/template-copies.js
+++ b/dist/install/template-copies.js
@@ -4,7 +4,7 @@ import * as fs from "node:fs";
 import * as path from "node:path";
 import { NPM_STRIP_REMAP, getPkgRoot, getTemplatesRoot, TEMPLATE_COPIES_DIR, } from "../shared/package-roots.js";
 import { hasLintStagedConfig } from "../checks/tips/detect.js";
-import { readPackageJson } from "../shared/package-json.js";
+import { readDependencyNames, readPackageJson } from "../shared/package-json.js";
 export function listFilesRecursive(dir) {
     if (!fs.existsSync(dir))
         return [];
@@ -121,33 +121,29 @@ export function formatTemplateChanges(changes) {
         TEMPLATES_POINTER,
     ].join("\n");
 }
-const OLD_LINT_STAGED_SAMPLE = ".lintstagedrc.json";
-const LINT_STAGED_SAMPLE = "lintstagedrc.example.json";
-// Migration (installs up to 6.1.x, `docs/migrations.md`): until the sample rename, lint-staged
-// found `.bkit/templates/.lintstagedrc.json` as its config in a repo with none at the root. The
-// sync prunes that file, so a consumer holding it, gating format on `lint-staged` and with no
-// lint-staged config of its own gets the shipped sample copied to `.lintstagedrc.json` first.
-// Idempotent (a root config, once written, ends the trigger); dry-run pushes the same write
-// without touching disk. Returns true when it copied. Call before `syncTemplateCopies`.
-export function migrateLintStagedSample(cwd, opts) {
-    if (path.resolve(cwd) === getPkgRoot())
+/** The one line install and upgrade print when a gating lint-staged has no config to read. */
+export const MISSING_LINT_STAGED_CONFIG_LINE = "bkit upgrade: no root lint-staged config — commits will fail. Fix: cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json";
+// True when `bkit:gate:format` runs `lint-staged` without a `--config` / `-c` path.
+function formatGateRunsBareLintStaged(cwd) {
+    const pkg = readPackageJson(cwd);
+    const scripts = pkg.ok ? pkg.pkg.scripts : undefined;
+    const format = scripts?.["bkit:gate:format"];
+    if (typeof format !== "string" || !/\blint-staged\b/.test(format))
         return false;
-    if (!fs.existsSync(path.join(cwd, TEMPLATE_COPIES_DIR, OLD_LINT_STAGED_SAMPLE)))
+    return !/(?:^|\s)(?:--config(?:[=\s]|$)|-c(?:[=\s]|$))/.test(format);
+}
+// bkit writes no lint-staged config into a consumer repo. When the format gate runs lint-staged
+// bare, lint-staged is installed and no config exists, the commit hook fails: print the one-line
+// fix. Prints in a dry run too; writes nothing. Returns true when it printed. No-op in dogfood.
+export function warnMissingLintStagedConfig(cwd) {
+    if (path.resolve(cwd) === getPkgRoot())
         return false;
-    const src = path.join(getTemplatesRoot(), LINT_STAGED_SAMPLE);
-    if (!fs.existsSync(src))
+    if (!formatGateRunsBareLintStaged(cwd))
         return false;
-    const pkg = readPackageJson(cwd);
-    const gate = pkg.ok ? pkg.pkg.scripts : undefined;
-    const format = gate?.["bkit:gate:format"];
-    if (typeof format !== "string" || !/\blint-staged\b/.test(format))
+    if (!readDependencyNames(cwd).includes("lint-staged"))
         return false;
     if (hasLintStagedConfig(cwd))
         return false;
-    const tag = opts.dryRun ? "[dry-run] " : "";
-    if (!opts.dryRun)
-        fs.copyFileSync(src, path.join(cwd, ".lintstagedrc.json"));
-    opts.ws.writes.push({ path: ".lintstagedrc.json", action: "write" });
-    console.log(`${opts.logPrefix} ${tag}lint-staged config copied from the sample: .lintstagedrc.json`);
+    console.log(MISSING_LINT_STAGED_CONFIG_LINE);
     return true;
 }
diff --git a/docs/capabilities.md b/docs/capabilities.md
index ee2fdbaa8..8d6927d8d 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -84,7 +84,7 @@ Not scanned; run the rollup with `--reachability`.
 <!-- prettier-ignore -->
 | File | Evaluates at import | Downstream files | of which tests |
 | --- | --- | --- | --- |
-| `.bkit/core/engine/shared/text.ts` | `Symbol` | 199 | 119 |
+| `.bkit/core/engine/shared/text.ts` | `Symbol` | 203 | 122 |
 | `.bkit/core/engine/checks/after/ci-yml.ts` | `CI_SCRIPT_UNITS.flat` | 187 | 112 |
 | `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 187 | 112 |
 | `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 187 | 112 |
@@ -165,7 +165,7 @@ flowchart LR
     n_bkit_core_engine_checks["checks<br/>252 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
     n_bkit_core_engine_commands["commands<br/>1714 symbols · 51 files"]
-    n_bkit_core_engine_install["install<br/>308 symbols · 20 files"]
+    n_bkit_core_engine_install["install<br/>311 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>184 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>150 symbols · 13 files<br/>1 open finding"]
@@ -174,7 +174,7 @@ flowchart LR
   n_bkit_core_engine_commands -->|388| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|379| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|205| n_bkit_core_engine_install
-  n_bkit_core_engine_install -->|170| n_bkit_core_engine_shared
+  n_bkit_core_engine_install -->|176| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|132| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|83| n_bkit_core_engine_checks
   n_bkit_core_engine_install -->|61| n_bkit_core_engine_render
@@ -182,10 +182,10 @@ flowchart LR
   n_bkit_core_engine_commands -->|42| n_bkit_core_engine_render
   n_bkit_core_engine_cli -->|34| n_bkit_core_engine_commands
   n_bkit_core_engine_checks -->|18| n_bkit_core_engine_commands
+  n_bkit_core_engine_install -->|17| n_bkit_core_engine_checks
   n_bkit_core_engine_ledgers -->|17| n_bkit_core_engine_shared
   n_bkit_core_engine_shared -->|15| n_bkit_core_engine_install
   n_bkit_core_engine_commands -->|15| n_bkit_core_engine_cli
-  n_bkit_core_engine_install -->|14| n_bkit_core_engine_checks
   nscripts_harvest -->|14| n_bkit_core_engine_ledgers
   n_bkit_core_engine_checks -->|12| n_bkit_core_engine_cli
   n_bkit_core_engine_render -->|12| n_bkit_core_engine_shared
@@ -349,7 +349,7 @@ flowchart LR
         n_bkit_core_engine_install_modules_cursor["cursor<br/>3 symbols · 1 files"]
         n_bkit_core_engine_install_modules_opencode["opencode<br/>10 symbols · 1 files"]
       end
-      n_bkit_core_engine_install_template_copies["template-copies<br/>10 symbols · 1 files"]
+      n_bkit_core_engine_install_template_copies["template-copies<br/>13 symbols · 1 files"]
     end
     subgraph gn_bkit_core_engine_ledgers[".bkit/core/engine/ledgers"]
       n_bkit_core_engine_ledgers_compact["compact<br/>8 symbols · 1 files"]
@@ -510,6 +510,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_workflows -->|8| n_bkit_core_engine_commands_workflow_worktrees
   n_bkit_core_engine_install_modules_antigravity -->|8| n_bkit_core_engine_install_write
   n_bkit_core_engine_install_modules_codex -->|8| n_bkit_core_engine_install_write
+  n_bkit_core_engine_install_template_copies -->|8| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_checks_after_github -->|7| n_bkit_core_engine_shared_settings
   n_bkit_core_engine_checks_after_github -->|7| n_bkit_core_engine_shared_json
   n_bkit_core_engine_checks_after_index -->|7| n_bkit_core_engine_checks_tips_index
@@ -544,10 +545,10 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_ledgers_journal
   n_bkit_core_engine_commands_workflow_tests -->|7| n_bkit_core_engine_shared_package_manager
   n_bkit_core_engine_commands_workflow_workflows -->|7| n_bkit_core_engine_commands_workflow_summary
+  n_bkit_core_engine_install_modules_core -->|7| n_bkit_core_engine_install_template_copies
   n_bkit_core_engine_install_modules_cursor -->|7| n_bkit_core_engine_install_write
   n_bkit_core_engine_install_modules_cursor -->|7| n_bkit_core_engine_render_hosts
   n_bkit_core_engine_install_modules_opencode -->|7| n_bkit_core_engine_install_cloud_env
-  n_bkit_core_engine_install_template_copies -->|7| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_commands_workflow_completeness -->|7| n_bkit_core_engine_checks_status_holes
   n_bkit_core_engine_commands_workflow_runtime -->|7| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_checks_before_files -->|6| n_bkit_core_engine_shared_package_roots
@@ -751,16 +752,16 @@ flowchart LR
   linkStyle 65 stroke:#59636e,stroke-width:6px
   linkStyle 66 stroke:#59636e,stroke-width:6px
   linkStyle 67 stroke:#59636e,stroke-width:6px
-  linkStyle 68 stroke:#59636eb3,stroke-width:3px
-  linkStyle 69 stroke:#59636eb3,stroke-width:3px
-  linkStyle 70 stroke:#59636eb3,stroke-width:3px
-  linkStyle 71 stroke:#59636eb3,stroke-width:3px
-  linkStyle 72 stroke:#59636eb3,stroke-width:3px
-  linkStyle 73 stroke:#59636eb3,stroke-width:3px
-  linkStyle 74 stroke:#59636eb3,stroke-width:3px
-  linkStyle 75 stroke:#59636eb3,stroke-width:3px
-  linkStyle 76 stroke:#59636eb3,stroke-width:3px
-  linkStyle 77 stroke:#59636eb3,stroke-width:3px
+  linkStyle 68 stroke:#59636e,stroke-width:6px
+  linkStyle 69 stroke:#59636e,stroke-width:6px
+  linkStyle 70 stroke:#59636e,stroke-width:6px
+  linkStyle 71 stroke:#59636e,stroke-width:6px
+  linkStyle 72 stroke:#59636e,stroke-width:6px
+  linkStyle 73 stroke:#59636e,stroke-width:6px
+  linkStyle 74 stroke:#59636e,stroke-width:6px
+  linkStyle 75 stroke:#59636e,stroke-width:6px
+  linkStyle 76 stroke:#59636e,stroke-width:6px
+  linkStyle 77 stroke:#59636e,stroke-width:6px
   linkStyle 78 stroke:#59636eb3,stroke-width:3px
   linkStyle 79 stroke:#59636eb3,stroke-width:3px
   linkStyle 80 stroke:#59636eb3,stroke-width:3px
@@ -820,7 +821,7 @@ flowchart LR
   linkStyle 134 stroke:#59636eb3,stroke-width:3px
   linkStyle 135 stroke:#59636eb3,stroke-width:3px
   linkStyle 136 stroke:#59636eb3,stroke-width:3px
-  linkStyle 137 stroke:#59636e80,stroke-width:2px
+  linkStyle 137 stroke:#59636eb3,stroke-width:3px
   linkStyle 138 stroke:#59636e80,stroke-width:2px
   linkStyle 139 stroke:#59636e80,stroke-width:2px
   linkStyle 140 stroke:#59636e80,stroke-width:2px
@@ -887,4 +888,5 @@ flowchart LR
   linkStyle 201 stroke:#59636e80,stroke-width:2px
   linkStyle 202 stroke:#59636e80,stroke-width:2px
   linkStyle 203 stroke:#59636e80,stroke-width:2px
+  linkStyle 204 stroke:#59636e80,stroke-width:2px
 ```
diff --git a/docs/decisions.jsonl b/docs/decisions.jsonl
index 9779d356f..8f9007870 100644
--- a/docs/decisions.jsonl
+++ b/docs/decisions.jsonl
@@ -666,3 +666,4 @@
 {"schema":3,"ts":1794046532487,"firstTs":1794045618703,"updates":2,"kind":"decision","key":"864-project-doc-warning-aggregation","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-apply-review","subagent":"bkit-plan-update","model":"gpt-6.1-sol"},"references":["864",".bkit/core/engine/checks/after/index.ts",".bkit/core/engine/commands/workflow/summary.ts"],"summary":"Mechanical adoption advisories and semantic project documentation findings use existing outputs","description":"Install, upgrade, check and doctor use local file-state evidence. Task-specific agents record warnings as one JSON object per line under Documentation Warnings in their existing report. Each record carries topic, gap, recommendedPath, alternativeEvidence and action. Phase summaries select attributed current-run artifacts and aggregate their valid records by topic and gap without changing workflow verdicts.","rationale":"Local detectors can identify missing and starter-only content, while relevant coverage depends on the task. JSON string escaping gives producers and readers the same record contract, and existing artifacts preserve evidence and support resumed runs without a second status store.","alternatives":"Use a generic project-doc completeness gate, or add a separate warning ledger.","status":"ACTIVE"}
 {"schema":3,"ts":1794171244090,"firstTs":1794171244090,"updates":1,"kind":"decision","key":"892-template-copies-bkit-changed-format-symlink","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-decision"},"references":["892","890","scripts/gate/bkit-gate-changed.mjs",".claude/skills/vitest"],"summary":"892-template-copies-bkit step 10 holistic gap accepted: the changed-files format check fails on the .claude/skills/vitest symlink","description":"bkit tests changed --base=origin/dev passes the symlink .claude/skills/vitest to prettier --check, which exits 2, so the format stage fails. Every other stage passes. The fix (3b341024d, #890) is on local dev but not yet on origin/dev, which this branch was cut from.","rationale":"accepted by owner: A) Accept (no further reason given)","alternatives":"Fix now: repeat the #890 gate-script fix on this branch or drop the symlink. Stop: hand the run over.","status":"ACTIVE"}
 {"schema":3,"ts":1794205008521,"firstTs":1794205008521,"updates":1,"kind":"decision","key":"892-template-copies-bkit-lintstaged-root-migration","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-decision"},"references":["892",".bkit/core/engine/install/template-copies.ts","docs/migrations.md"],"summary":"892-template-copies-bkit: a migration copies the lint-staged sample to the root instead of accepting the break","description":"Owner chose a migration for consumers whose only lint-staged config was .bkit/templates/.lintstagedrc.json. On install or upgrade, when that file exists, bkit:gate:format runs lint-staged and no lint-staged config exists, lintstagedrc.example.json is copied to .lintstagedrc.json before the sync prunes the old sample.","rationale":"owner chose Fix now — B, migration (build-decision-1-2.md): an upgrade must not block every commit for a consumer whose commit check relied on the nested sample","alternatives":"Accept the break and rely on the lint-staged tip; or a warning in bkit upgrade and bkit check that names the missing root config.","status":"ACTIVE"}
+{"schema":3,"ts":1794207353681,"firstTs":1794207353681,"updates":1,"kind":"decision","key":"892-template-copies-bkit-lint-staged-missing-config-warning","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-decision"},"references":["892",".bkit/core/engine/install/template-copies.ts",".bkit/templates.md","892-template-copies-bkit-lintstaged-root-migration"],"summary":"892-template-copies-bkit: a one-line warning replaces the migration that copied the lint-staged sample to the root","description":"bkit writes no lint-staged config into a consumer repo. Install and upgrade print one line naming the cp command when bkit:gate:format runs lint-staged without a --config path, lint-staged is a dependency and no lint-staged config exists. Supersedes 892-template-copies-bkit-lintstaged-root-migration.","rationale":"The migration wrote a root config that could shadow the consumer's own config, claimed every staged file and ran for consumers who never adopted lint-staged (owner decision, build-decision-1-3.md).","alternatives":"Keep the migration and widen its checks.","status":"ACTIVE"}
diff --git a/docs/migrations.md b/docs/migrations.md
index ebcffd11b..0029bb608 100644
--- a/docs/migrations.md
+++ b/docs/migrations.md
@@ -38,7 +38,6 @@
 | Branded check names | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedCheckNames`, called by `runBkitDocs`) | Exact shipped old `name:` lines in `.github/workflows/bkit-cloud.yml` (`context`, `claude`, `opencode` jobs), `bkit-renovate.yml` (`Renovate`) and `bkit-trivy.yml` (`Trivy`) → `bkit-*`; a job `name:` is inserted under `renovate:` / `trivy:` when the workflow name was rewritten and the job has none (comment lines at job-key indent do not end the job block; a result with two job `name:` lines is not written and logs a warning naming the manual rename); the old `bkit-stub:health` block in the `bkit.testing.ciWorkflow` file → the current block. A customised line stays. One log line per renamed check names old and new and says to update branch protection. Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 | Vale style `House` → `Bkit` | `.bkit/core/engine/install/modules/core.ts` (`migrateValeHouseStyle`, `SHIPPED_HOUSE_RULE_HASHES`, called by `runBkitDocs`) | `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml` matching a shipped release move to `.vale/styles/Bkit/` when absent; an edited rule, a taken target or a symlinked rule stays with a warning naming the manual move; a symlinked `.vale`, `.vale/styles`, `House` or `Bkit` directory leaves the rules unmoved with a warning. `.vale.ini` `House.<moved>` → `Bkit.<moved>`; `BasedOnStyles` swaps `House` for `Bkit` once `House/` is empty (directory removed), else appends `Bkit`. Own rules stay, including an own entry named like a moved rule without `.yml` (a `Filler/` folder). Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 | Slop plugin ignores inert skip text | `.bkit/core/engine/install/modules/core.ts` (`migrateSlopTypeSuppression`, `RETIRED_SLOP_PLUGIN_HASH`, called by `runBkitDocs`) | `scripts/slop/bkit-slop-type-suppression.mjs` byte-identical to the shipped v6.0.0 template → replaced with the current template. An edited copy, a non-file or a symlinked path stays with a warning to merge `.bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs` by hand. An absent or current copy stays untouched. Dry run records the same update without writing; `unhashed` keeps the copy consumer-owned. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` (fixture `tests/fixtures/slop-6.0.0/`) |
-| Lint-staged sample copied to the root | `.bkit/core/engine/install/template-copies.ts` (`migrateLintStagedSample`, called by `runCoreModule` pass 3b2 and `bkit upgrade` before `syncTemplateCopies`) | `.bkit/templates/.lintstagedrc.json` present (the config lint-staged found until the sample was renamed), `package.json` `scripts["bkit:gate:format"]` runs `lint-staged` and `hasLintStagedConfig` false → `.lintstagedrc.json` written at the repo root with the bytes of `lintstagedrc.example.json`, so the sync pruning the old sample leaves lint-staged a config. Prints one line; dry run reports it without writing. A repo with any lint-staged config, or whose format gate does not run lint-staged, is untouched. | up to 6.1.x | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 
 ## Detect-only guards
 
