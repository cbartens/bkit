diff --git a/.bkit/core/.bkit/README.md b/.bkit/core/.bkit/README.md
index cb1e59c40..15a2d2041 100644
--- a/.bkit/core/.bkit/README.md
+++ b/.bkit/core/.bkit/README.md
@@ -227,7 +227,7 @@ bkit owns some files outright, owns one part of others, and ships the rest as te
 | **Shared JSON** | bkit owns the keys its template sets; every other key is yours. `.mcp.json` / `.cursor/mcp.json`: bkit owns exactly one entry, `mcpServers.<tracker>`, and resets it to the template on every install and upgrade. | `.claude/settings.json`, `.cursor/hooks.json`, `.opencode/opencode.json`, `.mcp.json`, `.cursor/mcp.json` |
 | **Seeded package.json scripts** | Every install and upgrade adds a missing name with bkit's default; a name already present is never touched, whatever its value. `bkit check` reports a missing name. Uninstall leaves them. | `scripts.bkit:gate:format` / `bkit:gate:static` / `bkit:gate:static-unit` / `bkit:gate:install-static-unit-build` / `bkit:deps:outdated` / `bkit:deps:audit` |
 | **Seeded bkit settings** | Every install and upgrade writes every `bkit` setting, so each one is visible where you look for it. A missing key gets its default; a choice not made yet (tracker, cloud agents, board, opencode provider) gets `""` or `[]`, which reads the same as absent. A key already present is never touched, whatever its value; nested blocks get their missing keys. `bkit check` reports a missing key. | every key under `bkit`: `SEEDED_BKIT_DEFAULTS` in `.bkit/core/engine/install/modules/core.ts` |
-| **Templates** | Never written into your repo. Install and upgrade copy them, raw, into `.bkit/templates/`; you copy what you want and own it. Catalog: `.bkit/templates.md`. | `.github/workflows/bkit-ci.yml`, `.github/workflows/bkit-cloud.yml`, `.husky/*`, `.vale.ini`, `.vale/styles/House/*`, `.lintstagedrc.json`, `slop-scan.config.json`, `.oxlintrc.json`, `.prettierignore`, `.envrc`, `.cursor/{settings.json,environment.json,Dockerfile}`, dependency-updater examples, `.github/workflows/bkit-trivy.yml`, the per-provider context-fetch blocks (`context/bkit-*.md`), `scripts/slop/bkit-slop-type-suppression.mjs`. Also the tool `package.json` scripts (`typecheck`, `lint`, `format:check`, `lint:prose`, `lint:slop`, `slop:delta`, `prepare`) and devDeps (prettier, slop-scan, lint-staged, husky): `.bkit/templates.md` lists them, install never adds them. |
+| **Templates** | Never written into your repo. Install and upgrade copy them, raw, into `.bkit/templates/`; you copy what you want and own it. Catalog: `.bkit/templates.md`. | `.github/workflows/bkit-ci.yml`, `.github/workflows/bkit-cloud.yml`, `.husky/*`, `.vale.ini`, `.vale/styles/Bkit/*`, `.lintstagedrc.json`, `slop-scan.config.json`, `.oxlintrc.json`, `.prettierignore`, `.envrc`, `.cursor/{settings.json,environment.json,Dockerfile}`, dependency-updater examples, `.github/workflows/bkit-trivy.yml`, the per-provider context-fetch blocks (`context/bkit-*.md`), `scripts/slop/bkit-slop-type-suppression.mjs`. Also the tool `package.json` scripts (`typecheck`, `lint`, `format:check`, `lint:prose`, `lint:slop`, `slop:delta`, `prepare`) and devDeps (prettier, slop-scan, lint-staged, husky): `.bkit/templates.md` lists them, install never adds them. |
 
 **Marker syntax** depends on the file format:
 
diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index cc3b7145d..554b52208 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -8,7 +8,7 @@
 > **Rules:**
 >
 > - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
-> - `bkit install` and `bkit upgrade` never write these files and never overwrite a copy.
+> - `bkit install` and `bkit upgrade` never write these files and never overwrite a copy, with one exception: they rewrite an adopted copy where bkit's exact shipped old text matches (the brand migrations, `docs/migrations.md`), never otherwise.
 > - Adapt the app roots, the workspace package scope and the rules JSON. The examples use `apps/web`, `apps/mobile`, `packages/api` and `@scope`.
 
 ## What each template is for
@@ -54,7 +54,7 @@ The adoption order is the `bkit tips` order. The local stack lock has no tip, be
 | Git hooks (Husky) | `.bkit/templates/.husky/pre-commit`, `.bkit/templates/.husky/pre-push` | `.husky/pre-commit`, `.husky/pre-push` | both files |
 | Prettier ignore list | `.bkit/templates/.prettierignore` | `.prettierignore` | that file |
 | lint-staged | `.bkit/templates/.lintstagedrc.json` | `.lintstagedrc.json` | that file |
-| Vale | `.bkit/templates/.vale.ini`, `.bkit/templates/.vale/styles/House/` | `.vale.ini`, `.vale/styles/House/` | `.vale.ini` + the four House styles |
+| Vale | `.bkit/templates/.vale.ini`, `.bkit/templates/.vale/styles/Bkit/` | `.vale.ini`, `.vale/styles/Bkit/` | `.vale.ini` + the four Bkit styles |
 | slop-scan | `.bkit/templates/slop-scan.config.json`, `.bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs` | `slop-scan.config.json`, `scripts/slop/bkit-slop-type-suppression.mjs` | both files |
 | Oxlint | `.bkit/templates/.oxlintrc.json` | `.oxlintrc.json` | that file |
 | direnv | `.bkit/templates/.envrc` | `.envrc` | that file |
@@ -328,17 +328,17 @@ pnpm add -D lint-staged@^17.0.0 prettier@^3.5.3
 - Globs must not overlap, because lint-staged runs entries concurrently, so two entries that write one file race. The second entry negates the first.
 - Adapt: add per-glob commands (eslint `--fix`, etc.), and keep them seconds-fast.
 
-## Vale — prose lint, with House styles
+## Vale — prose lint, with Bkit styles
 
-`bkit:lint:prose` (`bkit ci prose`, in `bkit:gate:static`) runs Vale with the `write-good` package and bkit's House styles (`Filler`, `Hedging`, `LLMSlop`, `Verbose`) on `.agents/**`. Workflows reach Vale only through the gate. Reference: https://vale.sh/docs/install.
+`bkit:lint:prose` (`bkit ci prose`, in `bkit:gate:static`) runs Vale with the `write-good` package and bkit's Bkit styles (`Filler`, `Hedging`, `LLMSlop`, `Verbose`) on `.agents/**`. Workflows reach Vale only through the gate. Reference: https://vale.sh/docs/install.
 
 ```bash
 brew install vale
 vale sync
 ```
 
-- Copy `.vale.ini` and all four `.vale/styles/House/*.yml`.
-- `.gitignore`: `.vale/styles/write-good`. `vale sync` downloads it, and the House styles stay tracked.
+- Copy `.vale.ini` and all four `.vale/styles/Bkit/*.yml`.
+- `.gitignore`: `.vale/styles/write-good`. `vale sync` downloads it, and the Bkit styles stay tracked.
 - CI: the `bkit-ci.yml` template installs a pinned Vale and runs `vale sync`.
 - Cursor: the `Dockerfile` template installs it.
 - Adapt: add `[glob]` scope blocks for your own docs. Turn rules off per path, not globally.
diff --git a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
index 21eee3293..6db1e1812 100644
--- a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
+++ b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
@@ -372,10 +372,10 @@ const ADOPTED: Record<string, Entry> = {
       },
     ],
   },
-  ".vale/styles/House/Filler.yml": identical,
-  ".vale/styles/House/Hedging.yml": identical,
-  ".vale/styles/House/LLMSlop.yml": identical,
-  ".vale/styles/House/Verbose.yml": identical,
+  ".vale/styles/Bkit/Filler.yml": identical,
+  ".vale/styles/Bkit/Hedging.yml": identical,
+  ".vale/styles/Bkit/LLMSlop.yml": identical,
+  ".vale/styles/Bkit/Verbose.yml": identical,
   "slop-scan.config.json": {
     status: "adopted",
     edits: [
diff --git a/.bkit/core/engine/audits/templates/branding.test.ts b/.bkit/core/engine/audits/templates/branding.test.ts
index 9dcd22cb5..74a349b4f 100644
--- a/.bkit/core/engine/audits/templates/branding.test.ts
+++ b/.bkit/core/engine/audits/templates/branding.test.ts
@@ -105,6 +105,14 @@ describe("consumer-facing names carry the bkit prefix", () => {
     expect(bad).toEqual([]);
   });
 
+  it("the shipped Vale style", () => {
+    const styles = path.join(templatesRoot, ".vale/styles");
+    expect(fs.readdirSync(styles)).toEqual(["Bkit"]);
+    const ini = fs.readFileSync(path.join(templatesRoot, ".vale.ini"), "utf-8");
+    expect(ini).toMatch(/BasedOnStyles = .*\bBkit\b/);
+    expect(ini).not.toMatch(/\bHouse\b/);
+  });
+
   it("flags a seeded job whose display name lacks bkit-", () => {
     const named = "name: bkit-x\njobs:\n  lint:\n    name: lint\n    runs-on: ubuntu-latest\n";
     expect(unprefixedWorkflowNames("x.yml", named)).toEqual(["x.yml:lint:lint"]);
diff --git a/.bkit/core/engine/audits/templates/templates.test.ts b/.bkit/core/engine/audits/templates/templates.test.ts
index dff7d3352..6758d7ab8 100644
--- a/.bkit/core/engine/audits/templates/templates.test.ts
+++ b/.bkit/core/engine/audits/templates/templates.test.ts
@@ -291,12 +291,27 @@ describe("Group B templates — bkit-ci.yml", () => {
 });
 
 describe("Group B templates — .vale.ini", () => {
-  it(".vale.ini sets StylesPath, Packages and MinAlertLevel and enables House on .agents/**", () => {
+  it(".vale.ini sets StylesPath, Packages and MinAlertLevel and enables Bkit on .agents/**", () => {
     const content = readTemplate(".vale.ini");
     expect(content).toContain("StylesPath");
     expect(content).toContain("Packages");
     expect(content).toContain("MinAlertLevel");
-    expect(content).toMatch(/\[\.agents\/\*\*\]\nBasedOnStyles = House/);
+    expect(content).toMatch(/\[\.agents\/\*\*\]\nBasedOnStyles = Bkit/);
+  });
+
+  it("Vale template ships the Bkit style and .vale.ini names it", () => {
+    const content = readTemplate(".vale.ini");
+    expect(content).not.toMatch(/\bHouse\b/);
+    expect(content).toMatch(/\[\.agents\/\*\*\]\nBasedOnStyles = Bkit/);
+    expect(content).toMatch(/BasedOnStyles = .*\bBkit\b/);
+    const styles = path.resolve(".bkit/templates/.vale/styles");
+    expect(fs.readdirSync(styles)).toEqual(["Bkit"]);
+    expect(fs.readdirSync(path.join(styles, "Bkit")).sort()).toEqual([
+      "Filler.yml",
+      "Hedging.yml",
+      "LLMSlop.yml",
+      "Verbose.yml",
+    ]);
   });
 });
 
diff --git a/.bkit/core/engine/checks/after/ci-yml.ts b/.bkit/core/engine/checks/after/ci-yml.ts
index 069f57615..bf00a283e 100644
--- a/.bkit/core/engine/checks/after/ci-yml.ts
+++ b/.bkit/core/engine/checks/after/ci-yml.ts
@@ -651,30 +651,42 @@ export function detectGhaFloatingTags(cwd: string): PreflightFinding | null {
  * CI template copies named without the `bkit-` prefix: unprefixed path → template name, both
  * relative to the repo root.
  */
-const CI_SCRIPT_RENAMES: ReadonlyArray<readonly [string, string]> = [
-  ["scripts/ci/check-capstone.mjs", "scripts/ci/bkit-check-capstone.mjs"],
-  ["scripts/ci/check-capstone.test.mjs", "scripts/ci/bkit-check-capstone.test.mjs"],
-  ["scripts/ci/check-dependency-audit.mjs", "scripts/ci/bkit-check-dependency-audit.mjs"],
-  ["scripts/ci/check-dependency-audit.test.mjs", "scripts/ci/bkit-check-dependency-audit.test.mjs"],
-  ["scripts/ci/accepted-advisories.json", "scripts/ci/bkit-accepted-advisories.json"],
-  ["scripts/ci/check-accepted-divergences.mjs", "scripts/ci/bkit-check-accepted-divergences.mjs"],
-  [
-    "scripts/ci/check-accepted-divergences.test.mjs",
-    "scripts/ci/bkit-check-accepted-divergences.test.mjs",
-  ],
-  ["scripts/ci/accepted-divergences.json", "scripts/ci/bkit-accepted-divergences.json"],
-  ["scripts/ci/lanes/resolve-push-base.mjs", "scripts/ci/lanes/bkit-resolve-push-base.mjs"],
-  [
-    "scripts/ci/lanes/resolve-push-base.test.mjs",
-    "scripts/ci/lanes/bkit-resolve-push-base.test.mjs",
-  ],
+const CI_SCRIPT_DIR = "scripts/ci";
+const ciScriptUnit = (...files: string[]): ReadonlyArray<readonly [string, string]> =>
+  files.map((file) => {
+    const slash = file.lastIndexOf("/");
+    const dir = slash === -1 ? "" : file.slice(0, slash + 1);
+    return [`${CI_SCRIPT_DIR}/${file}`, `${CI_SCRIPT_DIR}/${dir}bkit-${file.slice(slash + 1)}`];
+  });
+
+/**
+ * The renamed files grouped into units that move together: a script, its test and the
+ * data file it reads. `bkit upgrade` moves a unit only whole.
+ */
+export const CI_SCRIPT_UNITS: ReadonlyArray<ReadonlyArray<readonly [string, string]>> = [
+  ciScriptUnit("check-capstone.mjs", "check-capstone.test.mjs"),
+  ciScriptUnit(
+    "check-dependency-audit.mjs",
+    "check-dependency-audit.test.mjs",
+    "accepted-advisories.json",
+  ),
+  ciScriptUnit(
+    "check-accepted-divergences.mjs",
+    "check-accepted-divergences.test.mjs",
+    "accepted-divergences.json",
+  ),
+  ciScriptUnit("lanes/resolve-push-base.mjs", "lanes/resolve-push-base.test.mjs"),
 ];
 
+export const CI_SCRIPT_RENAMES: ReadonlyArray<readonly [string, string]> = CI_SCRIPT_UNITS.flat();
+
 /**
  * Detect CI template copies named without the `bkit-` prefix. They keep working while every
  * reference uses the same old name; the risk is renaming a file without its references — the
  * CI dependency-audit step is guarded by `hashFiles(...)` and silently skips. The copies are the
- * consumer's, so bkit never renames them; the action inlines the rename and the reference edit.
+ * consumer's: `bkit upgrade` moves the unedited ones (`migrateBrandedTemplateFiles`), and this
+ * advisory names the ones it leaves (edited, or a `bkit-` target already present); the action
+ * inlines the rename and the reference edit.
  */
 export function detectCiScriptsOldNames(cwd: string): PreflightFinding | null {
   const found = CI_SCRIPT_RENAMES.filter(([oldPath]) => fs.existsSync(path.join(cwd, oldPath)));
diff --git a/.bkit/core/engine/checks/after/tools.ts b/.bkit/core/engine/checks/after/tools.ts
index 004726822..13d869c8b 100644
--- a/.bkit/core/engine/checks/after/tools.ts
+++ b/.bkit/core/engine/checks/after/tools.ts
@@ -64,7 +64,7 @@ export function detectValePackageNotSynced(cwd: string): PreflightFinding | null
       detect:
         "vale is on PATH but the repo has no .vale.ini and .vale/styles/write-good/ is absent — prose linting does not run.",
       action:
-        "Adopt bkit's Vale template first: copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/House/*.yml to .vale/styles/House/. Then run `vale sync` (one-time per repo) to download the write-good package the copied .vale.ini names. `vale sync` reads its package list from .vale.ini, so it cannot fetch write-good before that file exists.",
+        "Adopt bkit's Vale template first: copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/Bkit/*.yml to .vale/styles/Bkit/. Then run `vale sync` (one-time per repo) to download the write-good package the copied .vale.ini names. `vale sync` reads its package list from .vale.ini, so it cannot fetch write-good before that file exists.",
     };
   }
 
diff --git a/.bkit/core/engine/checks/tips/catalogue.ts b/.bkit/core/engine/checks/tips/catalogue.ts
index 42d3ef031..cd03c3453 100644
--- a/.bkit/core/engine/checks/tips/catalogue.ts
+++ b/.bkit/core/engine/checks/tips/catalogue.ts
@@ -217,7 +217,7 @@ export const SETUP_TIPS: readonly SetupTip[] = [
     title: "Keep written docs tight",
     line: "Nothing checks the project's written docs, so they slowly fill with vague, padded wording that agents then have to read. Add Vale.",
     why: "Agents read your docs and instructions on every run. Padded writing costs time and money every time it's read, and vague rules get followed vaguely. Vale (a writing checker) flags it.",
-    ask: "Run `brew install vale`, copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/House/ to .vale/styles/House/, then run `vale sync`.",
+    ask: "Run `brew install vale`, copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/Bkit/ to .vale/styles/Bkit/, then run `vale sync`.",
     steps: "`.bkit/templates.md` § Vale.",
     fires: (cwd) => !exists(cwd, ".vale.ini"),
   },
diff --git a/.bkit/core/engine/commands/install/upgrade.integration.test.ts b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
index 73f8ad603..da4c95dc6 100644
--- a/.bkit/core/engine/commands/install/upgrade.integration.test.ts
+++ b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
@@ -1003,6 +1003,156 @@ describe("#255 — upgrade does not force-create uninstalled host/tooling module
     const check = runCli(["check"]);
     expect(check.stdout).toContain("0 write(s) would occur");
   });
+
+  /** An old-shape consumer: installed, then hooks and CI naming the pre-#748 script names. */
+  const OLD_HOOK = "#!/bin/sh\npnpm lint:prose\npnpm slop:delta\n";
+  const OLD_CI = "name: CI\njobs:\n  lint:\n    steps:\n      - run: pnpm lint:prose\n";
+  function seedOldShapeConsumer(): void {
+    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
+    fs.writeFileSync(
+      path.join(tmpDir, "package.json"),
+      JSON.stringify({ name: "consumer", version: "0.0.0", scripts: {} }, null, 2) + "\n",
+      "utf-8",
+    );
+    expect(runCli(["install", "--claude"]).status).toBe(0);
+    fs.writeFileSync(
+      path.join(tmpDir, "package.json"),
+      JSON.stringify(
+        {
+          name: "consumer",
+          version: "0.0.0",
+          scripts: { "lint:prose": "custom-prose-linter", "slop:delta": "custom-slop" },
+        },
+        null,
+        2,
+      ) + "\n",
+      "utf-8",
+    );
+    fs.mkdirSync(path.join(tmpDir, ".husky"), { recursive: true });
+    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
+    fs.writeFileSync(path.join(tmpDir, ".husky", "pre-push"), OLD_HOOK, "utf-8");
+    fs.writeFileSync(path.join(tmpDir, ".github", "workflows", "bkit-ci.yml"), OLD_CI, "utf-8");
+  }
+  const HOOK = path.join(".husky", "pre-push");
+  const CI = path.join(".github", "workflows", "bkit-ci.yml");
+
+  it("copy-and-own migration second upgrade logs no branded line for the hook and CI file", () => {
+    seedOldShapeConsumer();
+    const upgrade = runCli(["upgrade", "--auto-apply"]);
+    expect(upgrade.status, combinedOutput(upgrade)).toBe(0);
+
+    const hook = fs.readFileSync(path.join(tmpDir, HOOK), "utf-8");
+    const ci = fs.readFileSync(path.join(tmpDir, CI), "utf-8");
+    expect(hook).toContain("pnpm bkit:lint:prose");
+    expect(hook).toContain("pnpm bkit:slop:delta");
+    expect(hook).not.toMatch(/pnpm (lint:prose|slop:delta)/);
+    expect(ci).toContain("pnpm bkit:lint:prose");
+
+    const hashes = readBkitVersion(path.join(tmpDir, ".bkit", "version"))!.canonicalHashes;
+    expect(Object.keys(hashes)).not.toContain(".husky/pre-push");
+    expect(Object.keys(hashes)).not.toContain(".github/workflows/bkit-ci.yml");
+
+    const second = runCli(["upgrade", "--auto-apply"]);
+    expect(second.status, combinedOutput(second)).toBe(0);
+    expect(fs.readFileSync(path.join(tmpDir, HOOK), "utf-8")).toBe(hook);
+    expect(fs.readFileSync(path.join(tmpDir, CI), "utf-8")).toBe(ci);
+    expect(combinedOutput(second)).not.toContain("core: .husky/pre-push — branded");
+    expect(fs.readFileSync(path.join(tmpDir, HOOK), "utf-8")).not.toMatch(
+      /pnpm (lint:prose|slop:delta)/,
+    );
+    expect(fs.readFileSync(path.join(tmpDir, CI), "utf-8")).not.toMatch(
+      /pnpm (lint:prose|slop:delta)/,
+    );
+    const hashesAfter = readBkitVersion(path.join(tmpDir, ".bkit", "version"))!.canonicalHashes;
+    expect(Object.keys(hashesAfter)).not.toContain(".husky/pre-push");
+    expect(Object.keys(hashesAfter)).not.toContain(".github/workflows/bkit-ci.yml");
+  });
+
+  it("a dry-run hook and CI token migration writes nothing", () => {
+    seedOldShapeConsumer();
+    const dry = runCli(["upgrade", "--dry-run"]);
+    expect(dry.status, combinedOutput(dry)).toBe(0);
+    expect(fs.readFileSync(path.join(tmpDir, HOOK), "utf-8")).toBe(OLD_HOOK);
+    expect(fs.readFileSync(path.join(tmpDir, CI), "utf-8")).toBe(OLD_CI);
+    const out = combinedOutput(dry);
+    expect(out).toContain(".husky/pre-push");
+    expect(out).toContain(".github/workflows/bkit-ci.yml");
+  });
+
+  /** The shipped pre-#748 content of a CI script, read from the v6.0.0 release tag. */
+  function shippedOldCiScript(file: string): string {
+    const env = { ...process.env };
+    delete env.GIT_DIR;
+    delete env.GIT_WORK_TREE;
+    const r = spawnSync("git", ["show", `v6.0.0:.bkit/templates/scripts/ci/${file}`], {
+      cwd: originalCwd,
+      encoding: "utf-8",
+      env,
+    });
+    expect(r.status, r.stderr).toBe(0);
+    return r.stdout;
+  }
+  const CI_FILES = [
+    "check-capstone.mjs",
+    "check-capstone.test.mjs",
+    "check-dependency-audit.mjs",
+    "check-dependency-audit.test.mjs",
+    "accepted-advisories.json",
+  ];
+  function seedOldCiScripts(): void {
+    seedOldShapeConsumer();
+    const dir = path.join(tmpDir, "scripts", "ci");
+    fs.mkdirSync(dir, { recursive: true });
+    for (const f of CI_FILES) {
+      fs.writeFileSync(
+        path.join(dir, f),
+        f.endsWith(".json") ? '{"advisories":[]}\n' : shippedOldCiScript(f),
+        "utf-8",
+      );
+    }
+    fs.writeFileSync(
+      path.join(tmpDir, CI),
+      "name: CI\njobs:\n  a:\n    steps:\n      - run: node scripts/ci/check-capstone.mjs\n",
+      "utf-8",
+    );
+  }
+  function snapshotTree(): Record<string, string> {
+    const out: Record<string, string> = {};
+    for (const abs of listFilesRecursive(tmpDir)) {
+      const rel = path.relative(tmpDir, abs);
+      if (rel.startsWith(".git" + path.sep)) continue;
+      if (rel === path.join(".claude", "bkit-cloud.md")) continue;
+      out[rel] = fs.readFileSync(abs, "utf-8");
+    }
+    return out;
+  }
+
+  it("a second template-file migration and a dry run leave scripts/ci and the hooks unchanged", () => {
+    seedOldCiScripts();
+    const before = snapshotTree();
+    const dry = runCli(["upgrade", "--dry-run"]);
+    expect(dry.status, combinedOutput(dry)).toBe(0);
+    expect(snapshotTree()).toEqual(before);
+
+    const upgrade = runCli(["upgrade", "--auto-apply"]);
+    expect(upgrade.status, combinedOutput(upgrade)).toBe(0);
+    const dir = path.join(tmpDir, "scripts", "ci");
+    expect(fs.existsSync(path.join(dir, "check-capstone.mjs"))).toBe(false);
+    expect(fs.existsSync(path.join(dir, "bkit-check-capstone.mjs"))).toBe(true);
+    expect(fs.existsSync(path.join(dir, "bkit-accepted-advisories.json"))).toBe(true);
+    expect(fs.readFileSync(path.join(tmpDir, CI), "utf-8")).toContain(
+      "node scripts/ci/bkit-check-capstone.mjs",
+    );
+    const hashes = Object.keys(
+      readBkitVersion(path.join(tmpDir, ".bkit", "version"))!.canonicalHashes,
+    );
+    expect(hashes.filter((h) => h.startsWith("scripts/ci/"))).toEqual([]);
+
+    const afterFirst = snapshotTree();
+    const second = runCli(["upgrade", "--auto-apply"]);
+    expect(second.status, combinedOutput(second)).toBe(0);
+    expect(snapshotTree()).toEqual(afterFirst);
+  });
 });
 
 // ---------------------------------------------------------------------------
diff --git a/.bkit/core/engine/commands/install/upgrade.ts b/.bkit/core/engine/commands/install/upgrade.ts
index cca7bed05..0149a5f2f 100644
--- a/.bkit/core/engine/commands/install/upgrade.ts
+++ b/.bkit/core/engine/commands/install/upgrade.ts
@@ -1025,12 +1025,14 @@ export async function runUpgradeCommand(upgradeFlags: UpgradeFlags): Promise<voi
   // exit), so feed those writes into canonicalHashes — keeping install/upgrade `.bkit/version`
   // parity.
   if (!upgradeFlags.dryRun) {
-    const renderedDocPaths = renderWs.writes.map((w) =>
-      path.relative(
-        process.cwd(),
-        path.isAbsolute(w.path) ? w.path : path.resolve(process.cwd(), w.path),
-      ),
-    );
+    const renderedDocPaths = renderWs.writes
+      .filter((w) => !w.unhashed)
+      .map((w) =>
+        path.relative(
+          process.cwd(),
+          path.isAbsolute(w.path) ? w.path : path.resolve(process.cwd(), w.path),
+        ),
+      );
     updateCanonicalHashesAfterUpgrade(
       {
         updated: [
diff --git a/.bkit/core/engine/install/modules/core.integration.test.ts b/.bkit/core/engine/install/modules/core.integration.test.ts
index feba1be9e..875d3395f 100644
--- a/.bkit/core/engine/install/modules/core.integration.test.ts
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -28,7 +28,7 @@ import {
 } from "./core";
 import { dispatchModules, listStampedFiles, type ModuleContext } from "./index";
 import { readInstallingVersion } from "../../shared/package-json";
-import { getBkitDocsRoot, getPkgRoot } from "../../shared/package-roots";
+import { getBkitDocsRoot, getPkgRoot, getTemplatesRoot } from "../../shared/package-roots";
 import { BKIT_GATE_CHANGED_SCRIPT, BKIT_GATE_SCRIPTS } from "../manifest";
 import { readBkitConfig } from "../../shared/settings";
 import { hashFile, readBkitVersion, readManagedVersion, writeBkitVersion } from "../version-file";
@@ -1687,3 +1687,157 @@ describe("migrateRetiredLite (via runBkitDocs)", () => {
     }
   });
 });
+
+describe("migrateBrandedFileTokens (via runBkitDocs)", () => {
+  const put = (file: string, text: string): void => {
+    fs.mkdirSync(path.dirname(file), { recursive: true });
+    fs.writeFileSync(file, text, "utf-8");
+  };
+  const run = (dryRun = false): ModuleContext => {
+    const ctx = makeCtx({ dryRun });
+    runBkitDocs(ctx.dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
+    return ctx;
+  };
+
+  it("rewrites old script tokens in husky hooks and the CI workflow", () => {
+    fs.writeFileSync(
+      "package.json",
+      JSON.stringify(
+        {
+          name: "x",
+          scripts: { "lint:prose": "custom", "slop:delta": "custom" },
+          bkit: { testing: { ciWorkflow: "ci.yml" } },
+        },
+        null,
+        2,
+      ) + "\n",
+      "utf-8",
+    );
+    put(
+      ".husky/pre-push",
+      "#!/bin/sh\npnpm lint:prose\npnpm slop:delta\npnpm --filter web lint:prose\n",
+    );
+    put(
+      ".github/workflows/ci.yml",
+      "name: CI\njobs:\n  a:\n    steps:\n      - run: pnpm lint:prose\n",
+    );
+    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
+    vi.spyOn(console, "log").mockImplementation(() => undefined);
+    try {
+      run();
+      const hook = fs.readFileSync(".husky/pre-push", "utf-8");
+      expect(hook).toContain("pnpm bkit:lint:prose\n");
+      expect(hook).toContain("pnpm bkit:slop:delta\n");
+      expect(fs.readFileSync(".github/workflows/ci.yml", "utf-8")).toContain(
+        "pnpm bkit:lint:prose",
+      );
+      expect(fs.existsSync(".husky/pre-commit")).toBe(false);
+      expect(fs.existsSync(".github/workflows/bkit-ci.yml")).toBe(false);
+      const out = warn.mock.calls.map((c) => String(c[0])).join("\n");
+      expect(out).toContain(".husky/pre-push");
+      expect(out).toMatch(/pre-push:?\s*(line\s*)?4|pre-push.*:4/);
+      expect(out).toContain("lint:prose");
+    } finally {
+      vi.restoreAllMocks();
+    }
+  });
+});
+
+describe("migrateBrandedTemplateFiles (via runBkitDocs)", () => {
+  const CI_DIR = path.join("scripts", "ci");
+  const put = (file: string, text: string): void => {
+    fs.mkdirSync(path.dirname(file), { recursive: true });
+    fs.writeFileSync(file, text, "utf-8");
+  };
+  const run = (dryRun = false): ModuleContext => {
+    const ctx = makeCtx({ dryRun });
+    runBkitDocs(ctx.dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
+    return ctx;
+  };
+  /** The shipped pre-#748 content of a CI script, read from the v6.0.0 release tag. */
+  const shippedOld = (file: string): string => {
+    const env = { ...process.env };
+    delete env.GIT_DIR;
+    delete env.GIT_WORK_TREE;
+    const r = spawnSync("git", ["show", `v6.0.0:.bkit/templates/scripts/ci/${file}`], {
+      cwd: originalCwd,
+      encoding: "utf-8",
+      env,
+    });
+    expect(r.status, r.stderr).toBe(0);
+    return r.stdout;
+  };
+  const templateFile = (file: string): string =>
+    fs.readFileSync(path.join(getTemplatesRoot(), "scripts", "ci", file), "utf-8");
+  const ADVISORIES = '{"advisories":[{"id":"GHSA-x"}]}\n';
+
+  beforeEach(() => {
+    vi.spyOn(console, "log").mockImplementation(() => undefined);
+  });
+  afterEach(() => {
+    vi.restoreAllMocks();
+  });
+
+  it("moves shipped CI script units to bkit- names and rewrites their paths", () => {
+    for (const f of [
+      "check-capstone.mjs",
+      "check-capstone.test.mjs",
+      "check-dependency-audit.mjs",
+      "check-dependency-audit.test.mjs",
+    ]) {
+      put(path.join(CI_DIR, f), shippedOld(f));
+    }
+    put(path.join(CI_DIR, "accepted-advisories.json"), ADVISORIES);
+    put(
+      ".github/workflows/bkit-ci.yml",
+      "name: bkit-ci\njobs:\n  a:\n    steps:\n      - run: node scripts/ci/check-capstone.mjs\n",
+    );
+    put(".husky/pre-push", "#!/bin/sh\nnode scripts/ci/check-dependency-audit.mjs < /dev/null\n");
+    run();
+
+    expect(fs.existsSync(path.join(CI_DIR, "check-capstone.mjs"))).toBe(false);
+    expect(fs.existsSync(path.join(CI_DIR, "check-capstone.test.mjs"))).toBe(false);
+    expect(fs.existsSync(path.join(CI_DIR, "check-dependency-audit.mjs"))).toBe(false);
+    expect(fs.existsSync(path.join(CI_DIR, "accepted-advisories.json"))).toBe(false);
+    expect(fs.readFileSync(path.join(CI_DIR, "bkit-check-capstone.mjs"), "utf-8")).toBe(
+      templateFile("bkit-check-capstone.mjs"),
+    );
+    const movedTest = fs.readFileSync(path.join(CI_DIR, "bkit-check-capstone.test.mjs"), "utf-8");
+    expect(movedTest).toContain('./bkit-check-capstone.mjs"');
+    expect(movedTest).not.toContain('"./check-capstone.mjs"');
+    expect(fs.readFileSync(path.join(CI_DIR, "bkit-accepted-advisories.json"), "utf-8")).toBe(
+      ADVISORIES,
+    );
+    expect(fs.readFileSync(path.join(CI_DIR, "bkit-check-dependency-audit.mjs"), "utf-8")).toBe(
+      templateFile("bkit-check-dependency-audit.mjs"),
+    );
+    const ci = fs.readFileSync(".github/workflows/bkit-ci.yml", "utf-8");
+    expect(ci).toContain("node scripts/ci/bkit-check-capstone.mjs");
+    expect(ci).not.toContain("node scripts/ci/check-capstone.mjs");
+    expect(fs.readFileSync(".husky/pre-push", "utf-8")).toContain(
+      "node scripts/ci/bkit-check-dependency-audit.mjs",
+    );
+  });
+
+  it("leaves an edited or already-renamed unit and logs the manual move", () => {
+    const edited = shippedOld("check-capstone.mjs") + "\n// consumer edit\n";
+    put(path.join(CI_DIR, "check-capstone.mjs"), edited);
+    put(path.join(CI_DIR, "check-capstone.test.mjs"), shippedOld("check-capstone.test.mjs"));
+    const existing = "// consumer's own bkit-check-dependency-audit\n";
+    put(path.join(CI_DIR, "check-dependency-audit.mjs"), shippedOld("check-dependency-audit.mjs"));
+    put(path.join(CI_DIR, "bkit-check-dependency-audit.mjs"), existing);
+    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
+    run();
+
+    expect(fs.readFileSync(path.join(CI_DIR, "check-capstone.mjs"), "utf-8")).toBe(edited);
+    expect(fs.existsSync(path.join(CI_DIR, "check-capstone.test.mjs"))).toBe(true);
+    expect(fs.existsSync(path.join(CI_DIR, "bkit-check-capstone.mjs"))).toBe(false);
+    expect(fs.existsSync(path.join(CI_DIR, "check-dependency-audit.mjs"))).toBe(true);
+    expect(fs.readFileSync(path.join(CI_DIR, "bkit-check-dependency-audit.mjs"), "utf-8")).toBe(
+      existing,
+    );
+    const out = warn.mock.calls.map((c) => String(c[0])).join("\n");
+    expect(out).toContain("check-capstone");
+    expect(out).toContain("check-dependency-audit");
+  });
+});
diff --git a/.bkit/core/engine/install/modules/core.ts b/.bkit/core/engine/install/modules/core.ts
index bd478c5ad..04a332a74 100644
--- a/.bkit/core/engine/install/modules/core.ts
+++ b/.bkit/core/engine/install/modules/core.ts
@@ -10,6 +10,7 @@ import {
   writeBkitVersion,
   hashFile,
   mergeCanonicalHashes,
+  sha256,
 } from "../version-file.js";
 import {
   extractManagedBlock,
@@ -27,11 +28,13 @@ import { isAdvisorySuppressed } from "../../checks/after/suppression.js";
 import { parseJson, readJsonFile } from "../../shared/json.js";
 import { readInstallingVersion } from "../../shared/package-json.js";
 import { detectDepUpdater, type DepUpdater } from "../../shared/dep-updater.js";
-import { ASK_POINTS, CONFIG_DEFAULTS, limitKey } from "../../shared/settings.js";
+import { ASK_POINTS, CONFIG_DEFAULTS, ciWorkflowPath, limitKey } from "../../shared/settings.js";
+import { CI_SCRIPT_UNITS } from "../../checks/after/ci-yml.js";
 import {
   getCoreRoot,
   getSharedRoot,
   getBkitDocsRoot,
+  getTemplatesRoot,
   TEMPLATE_COPIES_DIR,
 } from "../../shared/package-roots.js";
 import {
@@ -332,6 +335,8 @@ export function runBkitDocs(
   migrateJiraKeyName(dryRun, logPrefix);
   migrateModelOverrideAgentNames(dryRun, ws, logPrefix);
   migrateTemplateNotes(dryRun, ws, logPrefix);
+  const renames = migrateBrandedTemplateFiles(dryRun, ws, logPrefix);
+  migrateBrandedFileTokens(dryRun, ws, logPrefix, renames);
 }
 
 // Migration (installs up to 6.0.x, `docs/migrations.md`): agents renamed since. A
@@ -859,6 +864,177 @@ export function migrateBrandedScriptNames(
   return true;
 }
 
+// Migration (up to 6.0.x installs, `docs/migrations.md`): the husky hooks and the CI workflow
+// are copy-and-own files that run the old script names. `renameScriptTokens` rewrites them in
+// place, for the pairs `migrateBrandedScriptNames` acts on; a name it cannot reach is
+// warned with file and line. With `pathRenames` (`migrateBrandedTemplateFiles`) the
+// `scripts/ci/<old>` path tokens in those files, `bkit-trivy.yml` and the package.json script
+// values are rewritten too. Absent files are skipped. Writes are `unhashed`: the file stays the
+// consumer's, bkit never records a hash for it.
+export interface PathRename {
+  from: string;
+  to: string;
+}
+
+function renamePathTokens(text: string, pathRenames: readonly PathRename[]): string {
+  let out = text;
+  for (const { from, to } of pathRenames) {
+    out = out.replace(new RegExp(`${escapeRegExp(from)}(?![\\w.-])`, "g"), to);
+  }
+  return out;
+}
+
+export function migrateBrandedFileTokens(
+  dryRun: boolean,
+  ws: WriteSet,
+  logPrefix: string,
+  pathRenames: readonly PathRename[] = [],
+): void {
+  const tag = dryRun ? "[dry-run] " : "";
+  let scripts: Record<string, unknown> = {};
+  let pkgRaw: string | undefined;
+  let pkg: Record<string, unknown> | undefined;
+  if (fs.existsSync("package.json")) {
+    pkgRaw = fs.readFileSync("package.json", "utf-8");
+    const parsed = parseJson(pkgRaw);
+    if (parsed.ok && plainObject(parsed.value)) {
+      pkg = parsed.value;
+      if (plainObject(pkg.scripts)) scripts = pkg.scripts;
+    }
+  }
+  const { active } = activeScriptRenames(scripts, BKIT_SCRIPT_RENAMES);
+  const tokenFiles = [
+    path.join(".husky", "pre-commit"),
+    path.join(".husky", "pre-push"),
+    ciWorkflowPath("."),
+  ];
+  const files = [...new Set([...tokenFiles, path.join(".github", "workflows", "bkit-trivy.yml")])];
+  for (const file of files) {
+    if (!fs.lstatSync(file, { throwIfNoEntry: false })?.isFile()) continue;
+    const text = fs.readFileSync(file, "utf-8");
+    let next = tokenFiles.includes(file) ? renameScriptTokens(text, active) : text;
+    next = renamePathTokens(next, pathRenames);
+    if (tokenFiles.includes(file)) {
+      for (const { name, line } of findOldScriptNames(next, active)) {
+        console.warn(
+          `${logPrefix} ${tag}core: ${file}:${line} still runs the old script name "${name}"; rename it to "${active[name]}" by hand`,
+        );
+      }
+    }
+    if (next === text) continue;
+    if (!dryRun) fs.writeFileSync(file, next, "utf-8");
+    ws.writes.push({ path: file, action: "update", unhashed: true });
+    console.log(`${logPrefix} ${tag}core: ${file} — branded script and path names rewritten`);
+  }
+  if (pkg === undefined || pkgRaw === undefined || pathRenames.length === 0) return;
+  let changed = false;
+  const nextScripts: Record<string, unknown> = {};
+  for (const [key, value] of Object.entries(scripts)) {
+    const nextValue = typeof value === "string" ? renamePathTokens(value, pathRenames) : value;
+    if (nextValue !== value) changed = true;
+    nextScripts[key] = nextValue;
+  }
+  if (!changed) return;
+  pkg.scripts = nextScripts;
+  ws.writes.push({ path: "package.json", action: "update", unhashed: true });
+  if (!dryRun) writePackageJsonLike(pkgRaw, pkg);
+  console.log(`${logPrefix} ${tag}core: package.json — branded CI script paths rewritten`);
+}
+
+// sha256 of every distinct release content of the CI script `.mjs` files, per old path, from
+// each `v*` tag. An unedited copy matches one of them.
+export const SHIPPED_CI_SCRIPT_HASHES: Readonly<Record<string, readonly string[]>> = {
+  "scripts/ci/check-capstone.mjs": [
+    "3813d9fe3cfae79788990b0a7a4914d18350dde165a3c2fe5940e8348362cea6",
+    "45078e630f5ec9ff4e7704c99ac5f56fd37b9c2e94c052f084c03feddc86ef71",
+  ],
+  "scripts/ci/check-capstone.test.mjs": [
+    "0554d64652dcc32ea368a4791372e860a5e3314ecfb7084256627015333c7afb",
+    "ad58a0095528fdb3fe7310586b4091824f29fda261542df73c324c8dd574a0d6",
+  ],
+  "scripts/ci/check-dependency-audit.mjs": [
+    "b410ab27cdbeed8d659fdf523d1af9b519beb874901186bb59e2889646cdaa19",
+  ],
+  "scripts/ci/check-dependency-audit.test.mjs": [
+    "db3643ae6ef7ad01d628e6110aa2f7b47cdf2423ca07efc1a8bc6176eb98b6a2",
+  ],
+  "scripts/ci/check-accepted-divergences.mjs": [
+    "3b410c53535e66b7a65b54d574ba7f7e47139bfba58a883a60697b8ab44deef4",
+    "66e6f1f9ce22b52afe93454c268613b8f5b03c1c58b5817cac958435fefbe5b1",
+  ],
+  "scripts/ci/check-accepted-divergences.test.mjs": [
+    "743e623f0dcb118a96744d31611fb599e9041a8007a3202fb46c30d72a3e183e",
+    "f130f5784349c21c5ae4f02626243362d9c29f783b9ad4b9c158beeca9bf4107",
+  ],
+  "scripts/ci/lanes/resolve-push-base.mjs": [
+    "016c4dacf34ce6edffcc7c7f666027a0a34669ce299d755679c877540fc751e7",
+    "11930bf63081ca2b5201799e0262acfcfc148e15bce41e17ebead688a94fe8ce",
+    "84acc7ff1596234af0c614236608e2009e794da9549bf77a4cc9560c2784a8f8",
+  ],
+  "scripts/ci/lanes/resolve-push-base.test.mjs": [
+    "1ce7b5fdf1de756f56e6b9710952c1e272c633107b06c0d47780fce36b90d1ad",
+    "32e17be38751f2744d660acdd99c6a08e7f437cdeaeb7075bc876b1cd31f0237",
+    "6883deb2b20f99af68721b085fbf3e2ab14e4b58d17dd676afaf734c75195e96",
+  ],
+};
+
+// Migration (up to 6.0.x installs, `docs/migrations.md`): the CI script files carry the
+// `bkit-` prefix. A unit (script, test and data file, `CI_SCRIPT_UNITS`) moves whole when each
+// present `.mjs` matches a shipped release and no `bkit-` target exists: the old files go, the
+// `.mjs` targets come from the shipped templates, the data file moves byte for byte. Any
+// other unit stays, with a warning naming the manual move (the `ci-scripts-old-names`
+// advisory lists it too). Returns the renames applied plus those already applied (old absent,
+// new present), for the path-token rewrite.
+export function migrateBrandedTemplateFiles(
+  dryRun: boolean,
+  ws: WriteSet,
+  logPrefix: string,
+): PathRename[] {
+  const tag = dryRun ? "[dry-run] " : "";
+  const renames: PathRename[] = [];
+  const templates = getTemplatesRoot();
+  for (const unit of CI_SCRIPT_UNITS) {
+    const present = unit.filter(([from]) => fs.existsSync(from));
+    const done = unit.filter(([from, to]) => !fs.existsSync(from) && fs.existsSync(to));
+    for (const [from, to] of done) renames.push({ from, to });
+    if (present.length === 0) continue;
+    const edited = present.filter(
+      ([from]) =>
+        from.endsWith(".mjs") &&
+        !SHIPPED_CI_SCRIPT_HASHES[from]?.includes(sha256(fs.readFileSync(from))),
+    );
+    const taken = present.filter(([, to]) => fs.existsSync(to));
+    const noTemplate = present.filter(
+      ([, to]) => to.endsWith(".mjs") && !fs.existsSync(path.join(templates, to)),
+    );
+    if (edited.length > 0 || taken.length > 0 || noTemplate.length > 0) {
+      const why =
+        edited.length > 0
+          ? `${edited.map(([from]) => from).join(", ")} differs from every shipped release`
+          : taken.length > 0
+            ? `${taken.map(([, to]) => to).join(", ")} already exists`
+            : "the shipped template is missing";
+      console.warn(
+        `${logPrefix} ${tag}core: ${present.map(([from]) => from).join(", ")} not moved to the bkit- names (${why}); move them by hand and update every reference`,
+      );
+      continue;
+    }
+    for (const [from, to] of present) {
+      if (!dryRun) {
+        fs.mkdirSync(path.dirname(to), { recursive: true });
+        if (to.endsWith(".mjs")) fs.copyFileSync(path.join(templates, to), to);
+        else fs.copyFileSync(from, to);
+        fs.rmSync(from);
+      }
+      ws.writes.push({ path: from, action: "write", unhashed: true });
+      ws.writes.push({ path: to, action: "write", unhashed: true });
+      renames.push({ from, to });
+      console.log(`${logPrefix} ${tag}core: ${from} moved to ${to}`);
+    }
+  }
+  return renames;
+}
+
 // Status option ids of GitHub's Kanban and Team planning board templates; every board
 // made from one carries the same ids.
 const TEMPLATE_STATUS_OPTIONS: Readonly<Record<string, string>> = {
@@ -1380,6 +1556,8 @@ export function runCoreModule(ctx: ModuleContext): void {
     // Exclude .bkit/version itself and .agents/ internal files (not consumer-facing).
     const newCanonicalEntries: Record<string, string> = {};
     for (const entry of ws.writes) {
+      // Brand-migrated copy-and-own files carry no hash.
+      if (entry.unhashed) continue;
       const absPath = path.isAbsolute(entry.path) ? entry.path : path.resolve(cwd, entry.path);
       const relPath = path.relative(cwd, absPath);
       if (relPath === path.join(".bkit", "version")) continue;
diff --git a/.bkit/core/engine/install/modules/index.integration.test.ts b/.bkit/core/engine/install/modules/index.integration.test.ts
index 47c9429b8..e25577171 100644
--- a/.bkit/core/engine/install/modules/index.integration.test.ts
+++ b/.bkit/core/engine/install/modules/index.integration.test.ts
@@ -87,7 +87,7 @@ afterEach(() => {
 // Templates are the consumer's: install leaves an adopted copy alone
 // ---------------------------------------------------------------------------
 
-describe("install never writes or flags an adopted template copy", () => {
+describe("install never writes or flags an adopted template copy outside the exact-shipped-text brand migrations", () => {
   const ALL = new Set<import("../../cli").ModuleFlag>(["core", "claude", "cursor", "cloud"]);
   // The cursor module renders agents, so it needs the real model catalog.
   const promptsMd = path.join(getBkitDocsRoot(), "prompts.md");
diff --git a/.bkit/core/engine/install/template-copies.integration.test.ts b/.bkit/core/engine/install/template-copies.integration.test.ts
index 9aaff19cc..24ae8266c 100644
--- a/.bkit/core/engine/install/template-copies.integration.test.ts
+++ b/.bkit/core/engine/install/template-copies.integration.test.ts
@@ -83,7 +83,7 @@ describe("the templates root is the copy-and-own set", () => {
       ".github/workflows/bkit-trivy.yml",
       ".husky/pre-push",
       ".vale.ini",
-      ".vale/styles/House/LLMSlop.yml",
+      ".vale/styles/Bkit/LLMSlop.yml",
       ".prettierignore",
       ".oxlintrc.json",
       ".envrc",
diff --git a/.bkit/core/engine/install/version-file.test.ts b/.bkit/core/engine/install/version-file.test.ts
index 2bd78a307..2739ae8f9 100644
--- a/.bkit/core/engine/install/version-file.test.ts
+++ b/.bkit/core/engine/install/version-file.test.ts
@@ -248,7 +248,8 @@ describe("mergeCanonicalHashes — fresh overwrites, absent paths are pruned", (
 
   it("drops an entry whose path belongs to the copy-and-own template set", () => {
     // A template-set path is never bkit-owned: install copies it byte-for-byte into
-    // `.bkit/templates/` and never writes the consumer's own copy, so it must carry
+    // `.bkit/templates/` and never writes the consumer's own copy (bar the brand migrations, which rewrite it
+    // only where bkit's exact shipped old text matches), so it must carry
     // no ownership hash even when the adopted copy stays on disk.
     const rel = "scripts/serena/bkit-serena-mcp.sh";
     expect(fs.existsSync(path.join(getTemplatesRoot(), rel))).toBe(true);
diff --git a/.bkit/core/engine/install/version-file.ts b/.bkit/core/engine/install/version-file.ts
index cbc52c490..1960340fc 100644
--- a/.bkit/core/engine/install/version-file.ts
+++ b/.bkit/core/engine/install/version-file.ts
@@ -154,8 +154,9 @@ export function isConsumerModified(
  * reads the file, uninstall deletes it — so an entry for an absent path is dead
  * bookkeeping, and a file recreated at that path later would be misclassified as
  * bkit-owned. A template-set path is never a file bkit owns: install copies it
- * byte-for-byte into `.bkit/templates/` and never writes the consumer's own copy,
- * so it must carry no ownership hash. Retired and renamed managed files leave such
+ * byte-for-byte into `.bkit/templates/` and never writes the consumer's own copy
+ * (bar the brand migrations, which rewrite it only where bkit's exact shipped old text matches,
+ * `docs/migrations.md`), so it must carry no ownership hash. Retired and renamed managed files leave such
  * entries behind, and a pure merge would preserve them forever (the
  * `.bkit/scripts/…` entry a #507 move left and the `scripts/graphify/**` +
  * `scripts/serena/bkit-serena-mcp.sh` entries a #489 move left are the observed
diff --git a/.bkit/core/engine/install/write.ts b/.bkit/core/engine/install/write.ts
index 48594bc60..2d5b43dd7 100644
--- a/.bkit/core/engine/install/write.ts
+++ b/.bkit/core/engine/install/write.ts
@@ -610,6 +610,11 @@ export function ensurePackageJsonScripts(
 export interface WriteEntry {
   path: string;
   action: "write" | "update" | "append";
+  /**
+   * A copy-and-own file a brand migration rewrote (`docs/migrations.md`). It stays in the
+   * write set for dry-run parity and `bkit check`, and never gets a canonical hash.
+   */
+  unhashed?: true;
 }
 
 export interface WriteSet {
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index cb5e56295..cb4b67452 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -23,3 +23,4 @@
 {"schema":3,"ts":1793539461063,"kind":"friction","key":"ship-docs-sync-leaves-padded-table-row","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"ship","step":"ship-bookkeeping-push"},"references":["715-retire-lite-workflows"],"category":"workflow","scope":"universal","severity":"MEDIUM","status":"OPEN","summary":"ship docs sync edits a docs table row with padding, so the Step 8 bookkeeping push is refused by format:tables:check","description":"The ship update-docs agent rewrote a row of a prettier-ignore table in docs/testing.md with fixed-width padding. ledgers commit committed it, and the pre-push gate's format:tables:check refused the push (branches push exit 8). Step 8 has no route for a refused push, so the only written path is the Failure Path, which would end the run over a whitespace fix. The orchestrator ran bkit-insert-ignore.mjs on the file, committed it, and re-ran the push.","remediation":"Run the table formatter on docs the ship docs agent touched before ledgers commit, or give Step 8 a route for a hook-refused push: fix what the hook names, commit, re-run the push."}
 {"schema":3,"ts":1793584064221,"kind":"friction","key":"steps-finish/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-tasks with exit 11: `.bkit/core/engine/install/modules/core.integration.test.ts` \"detectGateAdvisories — gate advisories point at .bkit/templates.md > names the tool scripts a default gate chains that package.json lacks\", `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` \"this repo adopts its own templates > every template has an entry, and every entry is a template\", `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` \"this repo adopts its own templates > scripts/graphify/bkit-graphify.sh\", `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` \"this repo adopts its own templates > scripts/graphify/bkit-graphify-rollup.py\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"0e42f36c3e5e5786591a24bc5d88dadac27cd393"},"recurrenceCount":1}
 {"schema":3,"ts":1793584127371,"kind":"friction","key":"steps-finish/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-tasks with exit 11: `.bkit/core/engine/install/modules/core.integration.test.ts` \"detectGateAdvisories — gate advisories point at .bkit/templates.md > names the tool scripts a default gate chains that package.json lacks\", `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` \"this repo adopts its own templates > every template has an entry, and every entry is a template\", `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` \"this repo adopts its own templates > scripts/graphify/bkit-graphify.sh\", `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` \"this repo adopts its own templates > scripts/graphify/bkit-graphify-rollup.py\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"0e42f36c3e5e5786591a24bc5d88dadac27cd393"},"recurrenceCount":2,"lastConfirmed":1793584127371}
+{"schema":3,"ts":1793591735847,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"a4438cbf6517810a5f7d2d094a9404c7262fb527"},"recurrenceCount":1}
diff --git a/.bkit/templates/.vale.ini b/.bkit/templates/.vale.ini
index 8fad80ef2..5f5005f60 100644
--- a/.bkit/templates/.vale.ini
+++ b/.bkit/templates/.vale.ini
@@ -5,38 +5,38 @@ MinAlertLevel = warning
 Packages = write-good
 
 [.agents/**]
-BasedOnStyles = House
+BasedOnStyles = Bkit
 
 # Vendored skill content — third-party docs loaded under multiple paths
 # depending on harness. Each path needs its own scope block.
 [**/.agents/skills/**/*.md]
-House.LLMSlop = NO
-House.Hedging = NO
-House.Filler = NO
-House.Verbose = NO
+Bkit.LLMSlop = NO
+Bkit.Hedging = NO
+Bkit.Filler = NO
+Bkit.Verbose = NO
 
 [**/.claude/skills/**/*.md]
-House.LLMSlop = NO
-House.Hedging = NO
-House.Filler = NO
-House.Verbose = NO
+Bkit.LLMSlop = NO
+Bkit.Hedging = NO
+Bkit.Filler = NO
+Bkit.Verbose = NO
 
 [**/.cursor/skills/**/*.md]
-House.LLMSlop = NO
-House.Hedging = NO
-House.Filler = NO
-House.Verbose = NO
+Bkit.LLMSlop = NO
+Bkit.Hedging = NO
+Bkit.Filler = NO
+Bkit.Verbose = NO
 
 # Meta-prompt about prose compression: enumerates hedging/verbose phrases
-# verbatim as examples of what to strip, so House rules self-trigger.
+# verbatim as examples of what to strip, so Bkit rules self-trigger.
 [**/bkit-utility-compress-markdown.md]
-House.LLMSlop = NO
-House.Hedging = NO
-House.Filler = NO
-House.Verbose = NO
+Bkit.LLMSlop = NO
+Bkit.Hedging = NO
+Bkit.Filler = NO
+Bkit.Verbose = NO
 
 [*.md]
-BasedOnStyles = write-good, House
+BasedOnStyles = write-good, Bkit
 write-good.ThereIs = warning
 write-good.Passive = NO
 write-good.TooWordy = NO
@@ -49,19 +49,19 @@ write-good.Weasel = NO
 # disabling, so each rule must be turned off explicitly. Leading `**/` so
 # lint-staged's absolute paths also match.
 [**/docs/plans/**/*.md]
-House.LLMSlop = NO
-House.Hedging = NO
-House.Filler = NO
-House.Verbose = NO
+Bkit.LLMSlop = NO
+Bkit.Hedging = NO
+Bkit.Filler = NO
+Bkit.Verbose = NO
 write-good.ThereIs = NO
 write-good.So = NO
 
 # bkit's reference copies of its templates (.bkit/templates/) — refreshed by
 # `bkit upgrade`, not this repo's prose. Every rule off, as for docs/plans above.
 [**/.bkit/templates/**/*.md]
-House.LLMSlop = NO
-House.Hedging = NO
-House.Filler = NO
-House.Verbose = NO
+Bkit.LLMSlop = NO
+Bkit.Hedging = NO
+Bkit.Filler = NO
+Bkit.Verbose = NO
 write-good.ThereIs = NO
 write-good.So = NO
diff --git a/.bkit/templates/.vale/styles/House/Filler.yml b/.bkit/templates/.vale/styles/Bkit/Filler.yml
similarity index 100%
rename from .bkit/templates/.vale/styles/House/Filler.yml
rename to .bkit/templates/.vale/styles/Bkit/Filler.yml
diff --git a/.bkit/templates/.vale/styles/House/Hedging.yml b/.bkit/templates/.vale/styles/Bkit/Hedging.yml
similarity index 100%
rename from .bkit/templates/.vale/styles/House/Hedging.yml
rename to .bkit/templates/.vale/styles/Bkit/Hedging.yml
diff --git a/.bkit/templates/.vale/styles/House/LLMSlop.yml b/.bkit/templates/.vale/styles/Bkit/LLMSlop.yml
similarity index 100%
rename from .bkit/templates/.vale/styles/House/LLMSlop.yml
rename to .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
diff --git a/.bkit/templates/.vale/styles/House/Verbose.yml b/.bkit/templates/.vale/styles/Bkit/Verbose.yml
similarity index 100%
rename from .bkit/templates/.vale/styles/House/Verbose.yml
rename to .bkit/templates/.vale/styles/Bkit/Verbose.yml
diff --git a/.vale.ini b/.vale.ini
index 930a935cd..d8bf80c97 100644
--- a/.vale.ini
+++ b/.vale.ini
@@ -5,38 +5,38 @@ MinAlertLevel = warning
 Packages = write-good
 
 [.agents/**]
-BasedOnStyles = House
+BasedOnStyles = Bkit
 
 # Vendored skill content — third-party docs loaded under multiple paths
 # depending on harness. Each path needs its own scope block.
 [**/.agents/skills/**/*.md]
-House.LLMSlop = NO
-House.Hedging = NO
-House.Filler = NO
-House.Verbose = NO
+Bkit.LLMSlop = NO
+Bkit.Hedging = NO
+Bkit.Filler = NO
+Bkit.Verbose = NO
 
 [**/.claude/skills/**/*.md]
-House.LLMSlop = NO
-House.Hedging = NO
-House.Filler = NO
-House.Verbose = NO
+Bkit.LLMSlop = NO
+Bkit.Hedging = NO
+Bkit.Filler = NO
+Bkit.Verbose = NO
 
 [**/.cursor/skills/**/*.md]
-House.LLMSlop = NO
-House.Hedging = NO
-House.Filler = NO
-House.Verbose = NO
+Bkit.LLMSlop = NO
+Bkit.Hedging = NO
+Bkit.Filler = NO
+Bkit.Verbose = NO
 
 # Meta-prompt about prose compression: enumerates hedging/verbose phrases
-# verbatim as examples of what to strip, so House rules self-trigger.
+# verbatim as examples of what to strip, so Bkit rules self-trigger.
 [**/bkit-utility-compress-markdown.md]
-House.LLMSlop = NO
-House.Hedging = NO
-House.Filler = NO
-House.Verbose = NO
+Bkit.LLMSlop = NO
+Bkit.Hedging = NO
+Bkit.Filler = NO
+Bkit.Verbose = NO
 
 [*.md]
-BasedOnStyles = write-good, House
+BasedOnStyles = write-good, Bkit
 write-good.ThereIs = warning
 write-good.Passive = NO
 write-good.TooWordy = NO
@@ -49,9 +49,9 @@ write-good.Weasel = NO
 # disabling, so each rule must be turned off explicitly. Leading `**/` so
 # lint-staged's absolute paths also match.
 [**/docs/plans/**/*.md]
-House.LLMSlop = NO
-House.Hedging = NO
-House.Filler = NO
-House.Verbose = NO
+Bkit.LLMSlop = NO
+Bkit.Hedging = NO
+Bkit.Filler = NO
+Bkit.Verbose = NO
 write-good.ThereIs = NO
 write-good.So = NO
diff --git a/.vale/styles/House/Filler.yml b/.vale/styles/Bkit/Filler.yml
similarity index 100%
rename from .vale/styles/House/Filler.yml
rename to .vale/styles/Bkit/Filler.yml
diff --git a/.vale/styles/House/Hedging.yml b/.vale/styles/Bkit/Hedging.yml
similarity index 100%
rename from .vale/styles/House/Hedging.yml
rename to .vale/styles/Bkit/Hedging.yml
diff --git a/.vale/styles/House/LLMSlop.yml b/.vale/styles/Bkit/LLMSlop.yml
similarity index 100%
rename from .vale/styles/House/LLMSlop.yml
rename to .vale/styles/Bkit/LLMSlop.yml
diff --git a/.vale/styles/House/Verbose.yml b/.vale/styles/Bkit/Verbose.yml
similarity index 100%
rename from .vale/styles/House/Verbose.yml
rename to .vale/styles/Bkit/Verbose.yml
diff --git a/dist/checks/after/ci-yml.js b/dist/checks/after/ci-yml.js
index 4bdc642c5..735082e27 100644
--- a/dist/checks/after/ci-yml.js
+++ b/dist/checks/after/ci-yml.js
@@ -625,29 +625,30 @@ export function detectGhaFloatingTags(cwd) {
  * CI template copies named without the `bkit-` prefix: unprefixed path → template name, both
  * relative to the repo root.
  */
-const CI_SCRIPT_RENAMES = [
-    ["scripts/ci/check-capstone.mjs", "scripts/ci/bkit-check-capstone.mjs"],
-    ["scripts/ci/check-capstone.test.mjs", "scripts/ci/bkit-check-capstone.test.mjs"],
-    ["scripts/ci/check-dependency-audit.mjs", "scripts/ci/bkit-check-dependency-audit.mjs"],
-    ["scripts/ci/check-dependency-audit.test.mjs", "scripts/ci/bkit-check-dependency-audit.test.mjs"],
-    ["scripts/ci/accepted-advisories.json", "scripts/ci/bkit-accepted-advisories.json"],
-    ["scripts/ci/check-accepted-divergences.mjs", "scripts/ci/bkit-check-accepted-divergences.mjs"],
-    [
-        "scripts/ci/check-accepted-divergences.test.mjs",
-        "scripts/ci/bkit-check-accepted-divergences.test.mjs",
-    ],
-    ["scripts/ci/accepted-divergences.json", "scripts/ci/bkit-accepted-divergences.json"],
-    ["scripts/ci/lanes/resolve-push-base.mjs", "scripts/ci/lanes/bkit-resolve-push-base.mjs"],
-    [
-        "scripts/ci/lanes/resolve-push-base.test.mjs",
-        "scripts/ci/lanes/bkit-resolve-push-base.test.mjs",
-    ],
+const CI_SCRIPT_DIR = "scripts/ci";
+const ciScriptUnit = (...files) => files.map((file) => {
+    const slash = file.lastIndexOf("/");
+    const dir = slash === -1 ? "" : file.slice(0, slash + 1);
+    return [`${CI_SCRIPT_DIR}/${file}`, `${CI_SCRIPT_DIR}/${dir}bkit-${file.slice(slash + 1)}`];
+});
+/**
+ * The renamed files grouped into units that move together: a script, its test and the
+ * data file it reads. `bkit upgrade` moves a unit only whole.
+ */
+export const CI_SCRIPT_UNITS = [
+    ciScriptUnit("check-capstone.mjs", "check-capstone.test.mjs"),
+    ciScriptUnit("check-dependency-audit.mjs", "check-dependency-audit.test.mjs", "accepted-advisories.json"),
+    ciScriptUnit("check-accepted-divergences.mjs", "check-accepted-divergences.test.mjs", "accepted-divergences.json"),
+    ciScriptUnit("lanes/resolve-push-base.mjs", "lanes/resolve-push-base.test.mjs"),
 ];
+export const CI_SCRIPT_RENAMES = CI_SCRIPT_UNITS.flat();
 /**
  * Detect CI template copies named without the `bkit-` prefix. They keep working while every
  * reference uses the same old name; the risk is renaming a file without its references — the
  * CI dependency-audit step is guarded by `hashFiles(...)` and silently skips. The copies are the
- * consumer's, so bkit never renames them; the action inlines the rename and the reference edit.
+ * consumer's: `bkit upgrade` moves the unedited ones (`migrateBrandedTemplateFiles`), and this
+ * advisory names the ones it leaves (edited, or a `bkit-` target already present); the action
+ * inlines the rename and the reference edit.
  */
 export function detectCiScriptsOldNames(cwd) {
     const found = CI_SCRIPT_RENAMES.filter(([oldPath]) => fs.existsSync(path.join(cwd, oldPath)));
diff --git a/dist/checks/after/tools.js b/dist/checks/after/tools.js
index 425e4729a..9284c03cc 100644
--- a/dist/checks/after/tools.js
+++ b/dist/checks/after/tools.js
@@ -52,7 +52,7 @@ export function detectValePackageNotSynced(cwd) {
             id: "vale-package-not-synced",
             severity: "advisory",
             detect: "vale is on PATH but the repo has no .vale.ini and .vale/styles/write-good/ is absent — prose linting does not run.",
-            action: "Adopt bkit's Vale template first: copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/House/*.yml to .vale/styles/House/. Then run `vale sync` (one-time per repo) to download the write-good package the copied .vale.ini names. `vale sync` reads its package list from .vale.ini, so it cannot fetch write-good before that file exists.",
+            action: "Adopt bkit's Vale template first: copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/Bkit/*.yml to .vale/styles/Bkit/. Then run `vale sync` (one-time per repo) to download the write-good package the copied .vale.ini names. `vale sync` reads its package list from .vale.ini, so it cannot fetch write-good before that file exists.",
         };
     }
     return {
diff --git a/dist/checks/tips/catalogue.js b/dist/checks/tips/catalogue.js
index 80ec75da0..bdc849194 100644
--- a/dist/checks/tips/catalogue.js
+++ b/dist/checks/tips/catalogue.js
@@ -164,7 +164,7 @@ export const SETUP_TIPS = [
         title: "Keep written docs tight",
         line: "Nothing checks the project's written docs, so they slowly fill with vague, padded wording that agents then have to read. Add Vale.",
         why: "Agents read your docs and instructions on every run. Padded writing costs time and money every time it's read, and vague rules get followed vaguely. Vale (a writing checker) flags it.",
-        ask: "Run `brew install vale`, copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/House/ to .vale/styles/House/, then run `vale sync`.",
+        ask: "Run `brew install vale`, copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/Bkit/ to .vale/styles/Bkit/, then run `vale sync`.",
         steps: "`.bkit/templates.md` § Vale.",
         fires: (cwd) => !exists(cwd, ".vale.ini"),
     },
diff --git a/dist/commands/install/upgrade.js b/dist/commands/install/upgrade.js
index 77f578843..da1242e62 100644
--- a/dist/commands/install/upgrade.js
+++ b/dist/commands/install/upgrade.js
@@ -771,7 +771,9 @@ export async function runUpgradeCommand(upgradeFlags) {
     // exit), so feed those writes into canonicalHashes — keeping install/upgrade `.bkit/version`
     // parity.
     if (!upgradeFlags.dryRun) {
-        const renderedDocPaths = renderWs.writes.map((w) => path.relative(process.cwd(), path.isAbsolute(w.path) ? w.path : path.resolve(process.cwd(), w.path)));
+        const renderedDocPaths = renderWs.writes
+            .filter((w) => !w.unhashed)
+            .map((w) => path.relative(process.cwd(), path.isAbsolute(w.path) ? w.path : path.resolve(process.cwd(), w.path)));
         updateCanonicalHashesAfterUpgrade({
             updated: [
                 ...result.updated,
diff --git a/dist/install/modules/core.js b/dist/install/modules/core.js
index 51092bf8a..a2122bf8f 100644
--- a/dist/install/modules/core.js
+++ b/dist/install/modules/core.js
@@ -4,7 +4,7 @@
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { writeTier1, writeTier2, ensurePackageJsonScripts } from "../write.js";
-import { readBkitVersion, writeBkitVersion, hashFile, mergeCanonicalHashes, } from "../version-file.js";
+import { readBkitVersion, writeBkitVersion, hashFile, mergeCanonicalHashes, sha256, } from "../version-file.js";
 import { extractManagedBlock, findLineAnchoredMarkers, selectMarkers, stripManagedBlock, } from "../managed-block.js";
 import { listFilesRecursive, syncTemplateCopies } from "../template-copies.js";
 import { PAYLOAD_LINK_RELPATHS, syncPayloadLinks } from "../payload-links.js";
@@ -14,8 +14,9 @@ import { isAdvisorySuppressed } from "../../checks/after/suppression.js";
 import { parseJson, readJsonFile } from "../../shared/json.js";
 import { readInstallingVersion } from "../../shared/package-json.js";
 import { detectDepUpdater } from "../../shared/dep-updater.js";
-import { ASK_POINTS, CONFIG_DEFAULTS, limitKey } from "../../shared/settings.js";
-import { getCoreRoot, getSharedRoot, getBkitDocsRoot, TEMPLATE_COPIES_DIR, } from "../../shared/package-roots.js";
+import { ASK_POINTS, CONFIG_DEFAULTS, ciWorkflowPath, limitKey } from "../../shared/settings.js";
+import { CI_SCRIPT_UNITS } from "../../checks/after/ci-yml.js";
+import { getCoreRoot, getSharedRoot, getBkitDocsRoot, getTemplatesRoot, TEMPLATE_COPIES_DIR, } from "../../shared/package-roots.js";
 import { getInstallManifest, BKIT_GATE_SCRIPTS, BKIT_OPTIONAL_GATES, BKIT_PUSH_GATES, BKIT_GATE_CHANGED_SCRIPT, BKIT_LINT_FILE_SCRIPT, BKIT_TEST_FILE_SCRIPT, } from "../manifest.js";
 import { migrateLedgers } from "../../ledgers/migrate.js";
 export function listMdFiles(dir, prefix) {
@@ -255,6 +256,8 @@ export function runBkitDocs(dryRun, tokens, ws, logPrefix) {
     migrateJiraKeyName(dryRun, logPrefix);
     migrateModelOverrideAgentNames(dryRun, ws, logPrefix);
     migrateTemplateNotes(dryRun, ws, logPrefix);
+    const renames = migrateBrandedTemplateFiles(dryRun, ws, logPrefix);
+    migrateBrandedFileTokens(dryRun, ws, logPrefix, renames);
 }
 // Migration (installs up to 6.0.x, `docs/migrations.md`): agents renamed since. A
 // consumer's `## Model Overrides` row below `bkit:end` in `.bkit/prompts.md` naming an
@@ -725,6 +728,154 @@ export function migrateBrandedScriptNames(dryRun, ws, logPrefix) {
     console.log(`${logPrefix} ${tag}core: package.json script names branded${renamed.length > 0 ? ` [${renamed.join(", ")}]` : ""}`);
     return true;
 }
+function renamePathTokens(text, pathRenames) {
+    let out = text;
+    for (const { from, to } of pathRenames) {
+        out = out.replace(new RegExp(`${escapeRegExp(from)}(?![\\w.-])`, "g"), to);
+    }
+    return out;
+}
+export function migrateBrandedFileTokens(dryRun, ws, logPrefix, pathRenames = []) {
+    const tag = dryRun ? "[dry-run] " : "";
+    let scripts = {};
+    let pkgRaw;
+    let pkg;
+    if (fs.existsSync("package.json")) {
+        pkgRaw = fs.readFileSync("package.json", "utf-8");
+        const parsed = parseJson(pkgRaw);
+        if (parsed.ok && plainObject(parsed.value)) {
+            pkg = parsed.value;
+            if (plainObject(pkg.scripts))
+                scripts = pkg.scripts;
+        }
+    }
+    const { active } = activeScriptRenames(scripts, BKIT_SCRIPT_RENAMES);
+    const tokenFiles = [
+        path.join(".husky", "pre-commit"),
+        path.join(".husky", "pre-push"),
+        ciWorkflowPath("."),
+    ];
+    const files = [...new Set([...tokenFiles, path.join(".github", "workflows", "bkit-trivy.yml")])];
+    for (const file of files) {
+        if (!fs.lstatSync(file, { throwIfNoEntry: false })?.isFile())
+            continue;
+        const text = fs.readFileSync(file, "utf-8");
+        let next = tokenFiles.includes(file) ? renameScriptTokens(text, active) : text;
+        next = renamePathTokens(next, pathRenames);
+        if (tokenFiles.includes(file)) {
+            for (const { name, line } of findOldScriptNames(next, active)) {
+                console.warn(`${logPrefix} ${tag}core: ${file}:${line} still runs the old script name "${name}"; rename it to "${active[name]}" by hand`);
+            }
+        }
+        if (next === text)
+            continue;
+        if (!dryRun)
+            fs.writeFileSync(file, next, "utf-8");
+        ws.writes.push({ path: file, action: "update", unhashed: true });
+        console.log(`${logPrefix} ${tag}core: ${file} — branded script and path names rewritten`);
+    }
+    if (pkg === undefined || pkgRaw === undefined || pathRenames.length === 0)
+        return;
+    let changed = false;
+    const nextScripts = {};
+    for (const [key, value] of Object.entries(scripts)) {
+        const nextValue = typeof value === "string" ? renamePathTokens(value, pathRenames) : value;
+        if (nextValue !== value)
+            changed = true;
+        nextScripts[key] = nextValue;
+    }
+    if (!changed)
+        return;
+    pkg.scripts = nextScripts;
+    ws.writes.push({ path: "package.json", action: "update", unhashed: true });
+    if (!dryRun)
+        writePackageJsonLike(pkgRaw, pkg);
+    console.log(`${logPrefix} ${tag}core: package.json — branded CI script paths rewritten`);
+}
+// sha256 of every distinct release content of the CI script `.mjs` files, per old path, from
+// each `v*` tag. An unedited copy matches one of them.
+export const SHIPPED_CI_SCRIPT_HASHES = {
+    "scripts/ci/check-capstone.mjs": [
+        "3813d9fe3cfae79788990b0a7a4914d18350dde165a3c2fe5940e8348362cea6",
+        "45078e630f5ec9ff4e7704c99ac5f56fd37b9c2e94c052f084c03feddc86ef71",
+    ],
+    "scripts/ci/check-capstone.test.mjs": [
+        "0554d64652dcc32ea368a4791372e860a5e3314ecfb7084256627015333c7afb",
+        "ad58a0095528fdb3fe7310586b4091824f29fda261542df73c324c8dd574a0d6",
+    ],
+    "scripts/ci/check-dependency-audit.mjs": [
+        "b410ab27cdbeed8d659fdf523d1af9b519beb874901186bb59e2889646cdaa19",
+    ],
+    "scripts/ci/check-dependency-audit.test.mjs": [
+        "db3643ae6ef7ad01d628e6110aa2f7b47cdf2423ca07efc1a8bc6176eb98b6a2",
+    ],
+    "scripts/ci/check-accepted-divergences.mjs": [
+        "3b410c53535e66b7a65b54d574ba7f7e47139bfba58a883a60697b8ab44deef4",
+        "66e6f1f9ce22b52afe93454c268613b8f5b03c1c58b5817cac958435fefbe5b1",
+    ],
+    "scripts/ci/check-accepted-divergences.test.mjs": [
+        "743e623f0dcb118a96744d31611fb599e9041a8007a3202fb46c30d72a3e183e",
+        "f130f5784349c21c5ae4f02626243362d9c29f783b9ad4b9c158beeca9bf4107",
+    ],
+    "scripts/ci/lanes/resolve-push-base.mjs": [
+        "016c4dacf34ce6edffcc7c7f666027a0a34669ce299d755679c877540fc751e7",
+        "11930bf63081ca2b5201799e0262acfcfc148e15bce41e17ebead688a94fe8ce",
+        "84acc7ff1596234af0c614236608e2009e794da9549bf77a4cc9560c2784a8f8",
+    ],
+    "scripts/ci/lanes/resolve-push-base.test.mjs": [
+        "1ce7b5fdf1de756f56e6b9710952c1e272c633107b06c0d47780fce36b90d1ad",
+        "32e17be38751f2744d660acdd99c6a08e7f437cdeaeb7075bc876b1cd31f0237",
+        "6883deb2b20f99af68721b085fbf3e2ab14e4b58d17dd676afaf734c75195e96",
+    ],
+};
+// Migration (up to 6.0.x installs, `docs/migrations.md`): the CI script files carry the
+// `bkit-` prefix. A unit (script, test and data file, `CI_SCRIPT_UNITS`) moves whole when each
+// present `.mjs` matches a shipped release and no `bkit-` target exists: the old files go, the
+// `.mjs` targets come from the shipped templates, the data file moves byte for byte. Any
+// other unit stays, with a warning naming the manual move (the `ci-scripts-old-names`
+// advisory lists it too). Returns the renames applied plus those already applied (old absent,
+// new present), for the path-token rewrite.
+export function migrateBrandedTemplateFiles(dryRun, ws, logPrefix) {
+    const tag = dryRun ? "[dry-run] " : "";
+    const renames = [];
+    const templates = getTemplatesRoot();
+    for (const unit of CI_SCRIPT_UNITS) {
+        const present = unit.filter(([from]) => fs.existsSync(from));
+        const done = unit.filter(([from, to]) => !fs.existsSync(from) && fs.existsSync(to));
+        for (const [from, to] of done)
+            renames.push({ from, to });
+        if (present.length === 0)
+            continue;
+        const edited = present.filter(([from]) => from.endsWith(".mjs") &&
+            !SHIPPED_CI_SCRIPT_HASHES[from]?.includes(sha256(fs.readFileSync(from))));
+        const taken = present.filter(([, to]) => fs.existsSync(to));
+        const noTemplate = present.filter(([, to]) => to.endsWith(".mjs") && !fs.existsSync(path.join(templates, to)));
+        if (edited.length > 0 || taken.length > 0 || noTemplate.length > 0) {
+            const why = edited.length > 0
+                ? `${edited.map(([from]) => from).join(", ")} differs from every shipped release`
+                : taken.length > 0
+                    ? `${taken.map(([, to]) => to).join(", ")} already exists`
+                    : "the shipped template is missing";
+            console.warn(`${logPrefix} ${tag}core: ${present.map(([from]) => from).join(", ")} not moved to the bkit- names (${why}); move them by hand and update every reference`);
+            continue;
+        }
+        for (const [from, to] of present) {
+            if (!dryRun) {
+                fs.mkdirSync(path.dirname(to), { recursive: true });
+                if (to.endsWith(".mjs"))
+                    fs.copyFileSync(path.join(templates, to), to);
+                else
+                    fs.copyFileSync(from, to);
+                fs.rmSync(from);
+            }
+            ws.writes.push({ path: from, action: "write", unhashed: true });
+            ws.writes.push({ path: to, action: "write", unhashed: true });
+            renames.push({ from, to });
+            console.log(`${logPrefix} ${tag}core: ${from} moved to ${to}`);
+        }
+    }
+    return renames;
+}
 // Status option ids of GitHub's Kanban and Team planning board templates; every board
 // made from one carries the same ids.
 const TEMPLATE_STATUS_OPTIONS = {
@@ -1242,6 +1393,9 @@ export function runCoreModule(ctx) {
         // Exclude .bkit/version itself and .agents/ internal files (not consumer-facing).
         const newCanonicalEntries = {};
         for (const entry of ws.writes) {
+            // Brand-migrated copy-and-own files carry no hash.
+            if (entry.unhashed)
+                continue;
             const absPath = path.isAbsolute(entry.path) ? entry.path : path.resolve(cwd, entry.path);
             const relPath = path.relative(cwd, absPath);
             if (relPath === path.join(".bkit", "version"))
diff --git a/dist/install/version-file.js b/dist/install/version-file.js
index f2d142113..ce773b2d5 100644
--- a/dist/install/version-file.js
+++ b/dist/install/version-file.js
@@ -108,8 +108,9 @@ export function isConsumerModified(relPath, absolutePath, canonicalHashes) {
  * reads the file, uninstall deletes it — so an entry for an absent path is dead
  * bookkeeping, and a file recreated at that path later would be misclassified as
  * bkit-owned. A template-set path is never a file bkit owns: install copies it
- * byte-for-byte into `.bkit/templates/` and never writes the consumer's own copy,
- * so it must carry no ownership hash. Retired and renamed managed files leave such
+ * byte-for-byte into `.bkit/templates/` and never writes the consumer's own copy
+ * (bar the brand migrations, which rewrite it only where bkit's exact shipped old text matches,
+ * `docs/migrations.md`), so it must carry no ownership hash. Retired and renamed managed files leave such
  * entries behind, and a pure merge would preserve them forever (the
  * `.bkit/scripts/…` entry a #507 move left and the `scripts/graphify/**` +
  * `scripts/serena/bkit-serena-mcp.sh` entries a #489 move left are the observed
diff --git a/docs/migrations.md b/docs/migrations.md
index 9c1da62f5..a7932b2ee 100644
--- a/docs/migrations.md
+++ b/docs/migrations.md
@@ -32,6 +32,8 @@
 | Template note moved inside the managed block | `.bkit/core/engine/install/template-notes.ts` (`migrateTemplateNotes`, `RETIRED_TEMPLATE_NOTE_HASHES`, called by `runBkitDocs`) | `docs/templates/bkit-*.md` with a `<!-- Note: … -->` line above `<!-- bkit:start -->` whose sha256 matches a note wording a bkit template carried there → that line removed, with the blank line after it, because the note now opens the managed block, where upgrade refreshes it. When nothing else is left above the block, every blank line there goes too. Every other line above the block stays, and a leading byte-order mark stays. A note that matches no shipped wording is kept; when it names `docs/audits/{YYYYMM}`, `docs/plans/{YYYYMM}` or `@bkit-`, install, upgrade and `bkit check` each print one line naming the file. A file with CRLF line endings throughout is left as it is. Recorded in ws, so `bkit check` fails until upgrade runs. | 5.0.0-6.0.x | `.bkit/core/engine/install/template-notes.test.ts`; `.bkit/core/engine/install/modules/core.integration.test.ts` |
 | Agent and step renamed to `bkit-build-plan-tasks` | `.bkit/core/engine/install/modules/core.ts` (`migrateModelOverrideAgentNames`, `RENAMED_AGENTS`, called by `runBkitDocs`); `.bkit/core/engine/commands/workflow/status.ts` (`RENAMED_STEPS`, applied by `readStatusRows` / `readStatusRowsAt`); `.bkit/core/engine/commands/workflow/context.ts` (`TASKS_LOG`) | `.bkit/prompts.md` `## Model Overrides` rows below `bkit:end` naming `bkit-build-plan-execute` → `bkit-build-plan-tasks`, provider and model kept, recorded as an update (the canonical hash covers the managed block only); a row already naming the new agent leaves the old row for the unknown-override report. Read-side only, nothing rewritten: a `status.jsonl` row with `step: build-plan-execute` is read as `build-plan-tasks`, and a `build-plan-execute-{GROUP}-log.md` still marks its tasks done, so a build in flight across the rename resumes; the rows and logs on disk keep the old name. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`, `.bkit/core/engine/commands/workflow/status.test.ts`, `.bkit/core/engine/commands/workflow/context.test.ts` |
 | Branded script names | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedScriptNames`, `BKIT_SCRIPT_RENAMES`, called by `seedCorePackageJsonScripts` before `ensurePackageJsonScripts`) | `package.json` scripts `lint:prose`, `slop:delta`, `graph` and `graph:{check,clean,graphml,refresh,rollup,scoped,tree,update}` → `bkit:` + the same name; the old key is deleted and the old token in other script values and default gate chains is rewritten. A pair whose old and new keys both exist is left as it is with a warning; a `graph*` script whose value is not bkit's (`scripts/graphify/bkit-`) is the consumer's own and stays. Original indent kept. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
+| Branded script tokens in hooks and CI | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedFileTokens`, called by `runBkitDocs`) | `pnpm lint:prose`, `pnpm slop:delta` and `pnpm graph*` tokens in `.husky/pre-commit`, `.husky/pre-push` and the `bkit.testing.ciWorkflow` file → the `bkit:` names, for the pairs the package.json migration acts on. A name it cannot reach (e.g. `pnpm --filter web lint:prose`) is warned with file and line. Files are rewritten in place and recorded as `unhashed` writes, so `canonicalHashes` never holds them. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
+| Branded CI script files | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedTemplateFiles`, `SHIPPED_CI_SCRIPT_HASHES`, called by `runBkitDocs` before `migrateBrandedFileTokens`) | A unit under `scripts/ci/` (`check-capstone`, `check-dependency-audit` + `accepted-advisories.json`, `check-accepted-divergences` + `accepted-divergences.json`, `lanes/resolve-push-base`, with their `.test.mjs`) whose `.mjs` files all match a shipped release and whose `bkit-` targets are absent moves to the `bkit-` names; every `scripts/ci/<old>` path in the hooks, the CI workflow, `bkit-trivy.yml` and package.json scripts is rewritten. An edited unit or an existing target is left with a warning naming the manual move. Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 
 ## Detect-only guards
 
@@ -42,5 +44,5 @@
 | `test-file-script-missing` advisory | `.bkit/core/engine/install/modules/core.ts` (`detectGateAdvisories`) | `package.json` without `bkit:test:file`: `/bkit-build` reports test-first as not enforced. Plans predating `**Test first:**` lines get the same report from `bkit tests green`. | Declare `bkit:test:file` (runs one test file, writes JUnit to `$BKIT_TEST_REPORT`); new plans carry `Test first` lines. |
 | `lint-file-script-missing` advisory | `.bkit/core/engine/install/modules/core.ts` (`detectGateAdvisories`) | `package.json` with `bkit:test:file` but without `bkit:lint:file`: `bkit tests red` records reds unlinted. | Declare `bkit:lint:file` (lints one test file with the static gate's rules, exit 0 when clean). |
 | `plan-task-markers-missing` advisory | `.bkit/core/engine/checks/before/repo.ts` (`detectUnmarkedPlans`, called by `runPreflight`) | `docs/plans/{YYYYMM}/{FID}-plan.md` with no task blocks (`parsePlanBlocks` reads no task), skipping `archive/`, `logs/` and FIDs whose `logs/{FID}/status.jsonl` holds a ship `workflow-done` row; lists each path. | None: the FID's next `/bkit-build` Step 4 converts the plan (`@bkit-build-plan-convert`). |
-| `ci-scripts-old-names` advisory | `.bkit/core/engine/checks/after/ci-yml.ts` (`detectCiScriptsOldNames`, `CI_SCRIPT_RENAMES`, called by `runPostInstallCheck`) | A CI template copy under `scripts/ci/` without the `bkit-` prefix (`check-capstone`, `check-dependency-audit`, `check-accepted-divergences` and their `.test.mjs`, `accepted-advisories.json`, `accepted-divergences.json`, `lanes/resolve-push-base`); lists each, with a `git mv` per file or, when both names exist, the pair to merge. The `dependency-audit` tip treats either name as adopted. | Rename each file and, in the same commit, its paths in `.github/workflows/*.yml`, `.husky/pre-push`, `package.json` and `scripts/ci/`. |
+| `ci-scripts-old-names` advisory | `.bkit/core/engine/checks/after/ci-yml.ts` (`detectCiScriptsOldNames`, `CI_SCRIPT_RENAMES`, called by `runPostInstallCheck`) | A CI template copy under `scripts/ci/` without the `bkit-` prefix (`check-capstone`, `check-dependency-audit`, `check-accepted-divergences` and their `.test.mjs`, `accepted-advisories.json`, `accepted-divergences.json`, `lanes/resolve-push-base`); lists each, with a `git mv` per file or, when both names exist, the pair to merge. `bkit upgrade` moves the unedited copies (`migrateBrandedTemplateFiles`); the advisory names the ones it leaves. The `dependency-audit` tip treats either name as adopted. | Rename each file and, in the same commit, its paths in `.github/workflows/*.yml`, `.husky/pre-push`, `package.json` and `scripts/ci/`. |
 | `bkit-managed-duplicate` advisory | `.bkit/core/engine/checks/after/managed.ts` | An older bkit copy outside a managed file's `bkit:start` / `bkit:end` block. | Delete the stale copy, and move your own lines below `<!-- bkit:end -->`. |
