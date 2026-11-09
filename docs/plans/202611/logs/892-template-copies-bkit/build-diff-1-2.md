diff --git a/.bkit/README.md b/.bkit/README.md
index 3730ca7d1..6b5950db5 100644
--- a/.bkit/README.md
+++ b/.bkit/README.md
@@ -266,7 +266,7 @@ bkit owns some files outright, owns one part of others, and ships the rest as te
 | **Shared JSON** | bkit owns the keys its template sets; every other key is yours. `.mcp.json` / `.cursor/mcp.json`: bkit owns exactly one entry, `mcpServers.<tracker>`, and resets it to the template on every install and upgrade. | `.claude/settings.json`, `.cursor/hooks.json`, `.opencode/opencode.json`, `.mcp.json`, `.cursor/mcp.json` |
 | **Seeded package.json scripts** | Every install and upgrade adds a missing name with bkit's default; a name already present is never touched, whatever its value. `bkit check` reports a missing name. Uninstall leaves them. | `scripts.bkit:gate:format` / `bkit:gate:static` / `bkit:gate:static-unit` / `bkit:gate:install-static-unit-build` / `bkit:deps:outdated` / `bkit:deps:audit` |
 | **Seeded bkit settings** | Every install and upgrade writes every `bkit` setting, so each one is visible where you look for it. A missing key gets its default; a choice not made yet (tracker, cloud agents, board, OpenCode provider) gets `""` or `[]`, which reads the same as absent. A key already present is never touched, whatever its value; nested blocks get their missing keys. `bkit check` reports a missing key. | every key under `bkit`: `SEEDED_BKIT_DEFAULTS` in `.bkit/core/engine/install/modules/core.ts` |
-| **Templates** | Never written into your repo. Install and upgrade copy them, raw, into `.bkit/templates/`; you copy what you want and own it. Catalog: `.bkit/templates.md`. | `.github/workflows/bkit-ci.yml`, `.github/workflows/bkit-cloud.yml`, `.husky/*`, `.vale.ini`, `.vale/styles/Bkit/*`, `.lintstagedrc.json`, `slop-scan.config.json`, `.oxlintrc.json`, `.prettierignore`, `.envrc`, `.cursor/{settings.json,environment.json,Dockerfile}`, dependency-updater examples, `.github/workflows/bkit-trivy.yml`, the per-provider context-fetch blocks (`context/bkit-*.md`), `scripts/slop/bkit-slop-type-suppression.mjs`. Also the tool `package.json` scripts (`typecheck`, `lint`, `format:check`, `bkit:lint:prose`, `lint:slop`, `bkit:slop:delta`, `prepare`) and devDeps (prettier, slop-scan, lint-staged, husky): `.bkit/templates.md` lists them, install never adds them. |
+| **Templates** | Never written into your repo. Install and upgrade copy them, raw, into `.bkit/templates/`; you copy what you want and own it. Catalog: `.bkit/templates.md`. | `.github/workflows/bkit-ci.yml`, `.github/workflows/bkit-cloud.yml`, `.husky/*`, `.vale.ini`, `.vale/styles/Bkit/*`, `lintstagedrc.example.json`, `slop-scan.config.json`, `.oxlintrc.json`, `prettierignore.example`, `.envrc`, `.cursor/{settings.json,environment.json,Dockerfile}`, dependency-updater examples, `.github/workflows/bkit-trivy.yml`, the per-provider context-fetch blocks (`context/bkit-*.md`), `scripts/slop/bkit-slop-type-suppression.mjs`. Also the tool `package.json` scripts (`typecheck`, `lint`, `format:check`, `bkit:lint:prose`, `lint:slop`, `bkit:slop:delta`, `prepare`) and devDeps (prettier, slop-scan, lint-staged, husky): `.bkit/templates.md` lists them, install never adds them. |
 
 **Marker syntax** depends on the file format:
 
diff --git a/.bkit/core/.bkit/README.md b/.bkit/core/.bkit/README.md
index 40aa93064..8cd9eab59 100644
--- a/.bkit/core/.bkit/README.md
+++ b/.bkit/core/.bkit/README.md
@@ -266,7 +266,7 @@ bkit owns some files outright, owns one part of others, and ships the rest as te
 | **Shared JSON** | bkit owns the keys its template sets; every other key is yours. `.mcp.json` / `.cursor/mcp.json`: bkit owns exactly one entry, `mcpServers.<tracker>`, and resets it to the template on every install and upgrade. | `.claude/settings.json`, `.cursor/hooks.json`, `.opencode/opencode.json`, `.mcp.json`, `.cursor/mcp.json` |
 | **Seeded package.json scripts** | Every install and upgrade adds a missing name with bkit's default; a name already present is never touched, whatever its value. `bkit check` reports a missing name. Uninstall leaves them. | `scripts.bkit:gate:format` / `bkit:gate:static` / `bkit:gate:static-unit` / `bkit:gate:install-static-unit-build` / `bkit:deps:outdated` / `bkit:deps:audit` |
 | **Seeded bkit settings** | Every install and upgrade writes every `bkit` setting, so each one is visible where you look for it. A missing key gets its default; a choice not made yet (tracker, cloud agents, board, OpenCode provider) gets `""` or `[]`, which reads the same as absent. A key already present is never touched, whatever its value; nested blocks get their missing keys. `bkit check` reports a missing key. | every key under `bkit`: `SEEDED_BKIT_DEFAULTS` in `.bkit/core/engine/install/modules/core.ts` |
-| **Templates** | Never written into your repo. Install and upgrade copy them, raw, into `.bkit/templates/`; you copy what you want and own it. Catalog: `.bkit/templates.md`. | `.github/workflows/bkit-ci.yml`, `.github/workflows/bkit-cloud.yml`, `.husky/*`, `.vale.ini`, `.vale/styles/Bkit/*`, `.lintstagedrc.json`, `slop-scan.config.json`, `.oxlintrc.json`, `.prettierignore`, `.envrc`, `.cursor/{settings.json,environment.json,Dockerfile}`, dependency-updater examples, `.github/workflows/bkit-trivy.yml`, the per-provider context-fetch blocks (`context/bkit-*.md`), `scripts/slop/bkit-slop-type-suppression.mjs`. Also the tool `package.json` scripts (`typecheck`, `lint`, `format:check`, `bkit:lint:prose`, `lint:slop`, `bkit:slop:delta`, `prepare`) and devDeps (prettier, slop-scan, lint-staged, husky): `.bkit/templates.md` lists them, install never adds them. |
+| **Templates** | Never written into your repo. Install and upgrade copy them, raw, into `.bkit/templates/`; you copy what you want and own it. Catalog: `.bkit/templates.md`. | `.github/workflows/bkit-ci.yml`, `.github/workflows/bkit-cloud.yml`, `.husky/*`, `.vale.ini`, `.vale/styles/Bkit/*`, `lintstagedrc.example.json`, `slop-scan.config.json`, `.oxlintrc.json`, `prettierignore.example`, `.envrc`, `.cursor/{settings.json,environment.json,Dockerfile}`, dependency-updater examples, `.github/workflows/bkit-trivy.yml`, the per-provider context-fetch blocks (`context/bkit-*.md`), `scripts/slop/bkit-slop-type-suppression.mjs`. Also the tool `package.json` scripts (`typecheck`, `lint`, `format:check`, `bkit:lint:prose`, `lint:slop`, `bkit:slop:delta`, `prepare`) and devDeps (prettier, slop-scan, lint-staged, husky): `.bkit/templates.md` lists them, install never adds them. |
 
 **Marker syntax** depends on the file format:
 
diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index 5c98bb5c6..506b19aa4 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -52,8 +52,8 @@ The adoption order is the `bkit tips` order. The machine lock has no tip, so ado
 | Health check | `.bkit/templates/.github/workflows/bkit-health.yml` | `.github/workflows/bkit-health.yml` | that file |
 | Cloud-agent workflow | `.bkit/templates/.github/workflows/bkit-cloud.yml` | `.github/workflows/bkit-cloud.yml` | that file |
 | Git hooks (Husky) | `.bkit/templates/.husky/pre-commit`, `.bkit/templates/.husky/pre-push` | `.husky/pre-commit`, `.husky/pre-push` | both files |
-| Prettier ignore list | `.bkit/templates/.prettierignore` | `.prettierignore` | that file |
-| lint-staged | `.bkit/templates/.lintstagedrc.json` | `.lintstagedrc.json` | that file |
+| Prettier ignore list | `.bkit/templates/prettierignore.example` | `.prettierignore` | that file |
+| lint-staged | `.bkit/templates/lintstagedrc.example.json` | `.lintstagedrc.json` | that file |
 | Vale | `.bkit/templates/.vale.ini`, `.bkit/templates/.vale/styles/Bkit/` | `.vale.ini`, `.vale/styles/Bkit/` | `.vale.ini` + the four Bkit styles |
 | slop-scan | `.bkit/templates/slop-scan.config.json`, `.bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs` | `slop-scan.config.json`, `scripts/slop/bkit-slop-type-suppression.mjs` | both files |
 | Oxlint | `.bkit/templates/.oxlintrc.json` | `.oxlintrc.json` | that file |
@@ -332,7 +332,7 @@ chmod +x .husky/pre-commit .husky/pre-push
 pnpm add -D prettier@^3.5.3
 ```
 
-1. Copy `.prettierignore` before the first `prettier --write`. bkit writes `.claude/`, `.cursor/`, `.opencode/`, `.mcp.json`, `.bkit/.env.example` and `docs/roadmap.md` in its own layout, so prettier reformatting them fights the next `bkit install` (`bkit check` drift).
+1. Copy `.bkit/templates/prettierignore.example` to `.prettierignore` before the first `prettier --write`. bkit writes `.claude/`, `.cursor/`, `.opencode/`, `.mcp.json`, `.bkit/.env.example` and `docs/roadmap.md` in its own layout, so prettier reformatting them fights the next `bkit install` (`bkit check` drift).
 2. Add `format:check` (§ Gate tool scripts). Reference: https://prettier.io/docs/install.
 
 - Keep the `.bkit/templates/` line.
@@ -340,6 +340,8 @@ pnpm add -D prettier@^3.5.3
 
 ## lint-staged — `.lintstagedrc.json`
 
+Copy `.bkit/templates/lintstagedrc.example.json` to `.lintstagedrc.json`. The samples under `.bkit/templates/` carry non-dotfile names so prettier and lint-staged do not read them as live config; `bkit upgrade` removes the old dotfile-named samples (`.lintstagedrc.json`, `.prettierignore`) from `.bkit/templates/`.
+
 It runs prettier over staged files. `bkit:gate:format` (the pre-commit hook) calls it. Reference: https://github.com/lint-staged/lint-staged.
 
 ```bash
@@ -391,6 +393,8 @@ cp .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs scripts/slop/
 
 It fails `lint` on a test that cannot fail. Oxlint (a fast linter) runs five rules on test files only, with all other checks off. It fits JS / TS repos with Vitest or Jest. Reference: https://oxc.rs/docs/guide/usage/linter.html.
 
+- The `.bkit/templates/.oxlintrc.json` sample keeps its dotfile name: oxlint run from a consumer root as `oxlint -c .oxlintrc.json` reports a violating test file at the root and reports nothing for the same file under `.bkit/templates/`, so the sample does not act as live config.
+
 ```bash
 pnpm add -D oxlint@^1.87.0 oxlint-tsgolint@^7.0.2004
 cp .bkit/templates/.oxlintrc.json .oxlintrc.json
diff --git a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
index a6f2f2982..44f556787 100644
--- a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
+++ b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
@@ -34,7 +34,7 @@ type Op =
 type Edit = Op & { kind: Kind; what: string };
 
 type Entry =
-  | { status: "adopted"; edits: Edit[] }
+  | { status: "adopted"; edits: Edit[]; copyAs?: string }
   | { status: "not-adopted"; what: string }
   | { status: "generated"; what: string }
   /** The repo root has its own file under the same name; it is not an adopted copy. */
@@ -302,8 +302,9 @@ const ADOPTED: Record<string, Entry> = {
       },
     ],
   },
-  ".prettierignore": {
+  "prettierignore.example": {
     status: "adopted",
+    copyAs: ".prettierignore",
     edits: [
       {
         kind: "bkit-only",
@@ -318,7 +319,7 @@ const ADOPTED: Record<string, Entry> = {
       },
     ],
   },
-  ".lintstagedrc.json": identical,
+  "lintstagedrc.example.json": { status: "adopted", copyAs: ".lintstagedrc.json", edits: [] },
   ".oxlintrc.json": {
     status: "adopted",
     edits: [
@@ -756,7 +757,10 @@ describe("this repo adopts its own templates", () => {
     expect(Object.keys(ADOPTED).sort()).toEqual(templatePaths());
   });
 
-  const copyPathOf = (rel: string) => path.join(repo, rel);
+  const copyPathOf = (rel: string) => {
+    const entry = ADOPTED[rel];
+    return path.join(repo, entry?.status === "adopted" ? (entry.copyAs ?? rel) : rel);
+  };
 
   it.each(entriesWith("not-adopted"))("%s", (rel, entry) => {
     expect(fs.existsSync(copyPathOf(rel)), `${rel}: ${entry.what}`).toBe(false);
diff --git a/.bkit/core/engine/audits/templates/template-path-refs.test.ts b/.bkit/core/engine/audits/templates/template-path-refs.test.ts
index a955bfa8b..6526c651a 100644
--- a/.bkit/core/engine/audits/templates/template-path-refs.test.ts
+++ b/.bkit/core/engine/audits/templates/template-path-refs.test.ts
@@ -124,7 +124,8 @@ describe("no workflow or prompt names a template path", () => {
     expect(templates.length).toBeGreaterThan(0);
     for (const rel of templates) expect(names, rel).toContain(rel);
     for (const rel of [
-      ".prettierignore",
+      "prettierignore.example",
+      "lintstagedrc.example.json",
       ".cursor/Dockerfile",
       ".serena/project.yml",
       ".graphifyignore",
diff --git a/.bkit/core/engine/audits/templates/templates-content.test.ts b/.bkit/core/engine/audits/templates/templates-content.test.ts
index cb5d106ef..7c0cdf191 100644
--- a/.bkit/core/engine/audits/templates/templates-content.test.ts
+++ b/.bkit/core/engine/audits/templates/templates-content.test.ts
@@ -13,7 +13,7 @@ import { BKIT_GATE_SCRIPTS } from "../../install/manifest";
 import { getBkitDocsRoot } from "../../shared/package-roots";
 
 const CONSUMER_CI_TEMPLATE = path.resolve(".bkit/templates/.github/workflows/bkit-ci.yml");
-const CONSUMER_PRETTIERIGNORE_TEMPLATE = path.resolve(".bkit/templates/.prettierignore");
+const CONSUMER_PRETTIERIGNORE_TEMPLATE = path.resolve(".bkit/templates/prettierignore.example");
 const CONSUMER_RENOVATE_TEMPLATE = path.resolve(".bkit/templates/.github/renovate.json5");
 const OXLINT_TEMPLATE = path.resolve(".bkit/templates/.oxlintrc.json");
 
@@ -668,7 +668,7 @@ describe(".bkit/.env.example keys are BKIT_-prefixed (direnv isolation)", () =>
   });
 });
 
-describe("consumer .prettierignore template (.bkit/templates/.prettierignore)", () => {
+describe("consumer .prettierignore template (.bkit/templates/prettierignore.example)", () => {
   const content = fs.readFileSync(CONSUMER_PRETTIERIGNORE_TEMPLATE, "utf-8");
 
   it("template file exists", () => {
diff --git a/.bkit/core/engine/checks/tips/catalogue.ts b/.bkit/core/engine/checks/tips/catalogue.ts
index 18db71fd1..b7a2744c9 100644
--- a/.bkit/core/engine/checks/tips/catalogue.ts
+++ b/.bkit/core/engine/checks/tips/catalogue.ts
@@ -207,7 +207,7 @@ export const SETUP_TIPS: readonly SetupTip[] = [
     title: "Consistent formatting",
     line: "There's no shared formatting setup, so reviews fill up with spacing changes that hide the real ones. Add Prettier with bkit's ignore file.",
     why: "Prettier (a code formatter) makes every file follow the same layout. bkit's ignore file stops it reformatting bkit's own files, which would otherwise show up as false changes every time bkit updates.",
-    ask: 'Copy .bkit/templates/.prettierignore to .prettierignore first, then run `pnpm add -D prettier` and add `"format:check": "prettier --check ."` to the package.json scripts.',
+    ask: 'Copy .bkit/templates/prettierignore.example to .prettierignore first, then run `pnpm add -D prettier` and add `"format:check": "prettier --check ."` to the package.json scripts.',
     steps: "`.bkit/templates.md` § Prettier.",
     fires: (cwd) => !exists(cwd, ".prettierignore"),
   },
@@ -247,7 +247,7 @@ export const SETUP_TIPS: readonly SetupTip[] = [
     title: "Quick tidy-up on commit",
     line: "The commit check has nothing to run. Add lint-staged so it tidies just the files you're committing.",
     why: "It formats only the handful of files in each change, in about a second. Without it the commit check either does nothing or is slow enough that people start skipping it.",
-    ask: "Run `pnpm add -D lint-staged prettier` and copy .bkit/templates/.lintstagedrc.json to .lintstagedrc.json.",
+    ask: "Run `pnpm add -D lint-staged prettier` and copy .bkit/templates/lintstagedrc.example.json to .lintstagedrc.json.",
     steps: "`.bkit/templates.md` § lint-staged.",
     fires: (cwd) => !hasLintStagedConfig(cwd),
   },
diff --git a/.bkit/core/engine/commands/install/upgrade.integration.test.ts b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
index c122da53b..7e4b623b7 100644
--- a/.bkit/core/engine/commands/install/upgrade.integration.test.ts
+++ b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
@@ -2351,3 +2351,44 @@ describe("#715 — upgrade retires a 5.2.4 .bkit/lite.md", () => {
     expect(runCli(["check"]).status).toBe(0);
   });
 });
+
+describe("#892 — upgrade replaces the old sample config names", () => {
+  const cli = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../cli.ts");
+  function runCli(args: string[]) {
+    return spawnSync(requireTsx(), [cli, ...args], {
+      cwd: tmpDir,
+      encoding: "utf-8",
+      env: {
+        ...process.env,
+        NODE_NO_WARNINGS: "1",
+        GIT_DIR: path.join(tmpDir, ".git"),
+        GIT_WORK_TREE: tmpDir,
+      },
+      timeout: 90_000,
+    });
+  }
+
+  it("upgrade replaces the old sample config names", () => {
+    expect(spawnSync("git", ["init", "-q"], { cwd: tmpDir }).status).toBe(0);
+    fs.writeFileSync(
+      path.join(tmpDir, "package.json"),
+      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
+      "utf-8",
+    );
+    expect(runCli(["install", "--claude", "--tracker=github"]).status).toBe(0);
+
+    const templates = path.join(tmpDir, ".bkit", "templates");
+    fs.writeFileSync(path.join(templates, ".lintstagedrc.json"), "{}\n", "utf-8");
+    fs.writeFileSync(path.join(templates, ".prettierignore"), "node_modules/\n", "utf-8");
+    fs.rmSync(path.join(templates, "lintstagedrc.example.json"), { force: true });
+    fs.rmSync(path.join(templates, "prettierignore.example"), { force: true });
+
+    expect(runCli(["upgrade", "--auto-apply"]).status).toBe(0);
+
+    expect(fs.existsSync(path.join(templates, ".lintstagedrc.json"))).toBe(false);
+    expect(fs.existsSync(path.join(templates, ".prettierignore"))).toBe(false);
+    expect(fs.existsSync(path.join(templates, "lintstagedrc.example.json"))).toBe(true);
+    expect(fs.existsSync(path.join(templates, "prettierignore.example"))).toBe(true);
+    expect(runCli(["check"]).status).toBe(0);
+  });
+});
diff --git a/.bkit/core/engine/install/template-copies.integration.test.ts b/.bkit/core/engine/install/template-copies.integration.test.ts
index 24ae8266c..4669c3947 100644
--- a/.bkit/core/engine/install/template-copies.integration.test.ts
+++ b/.bkit/core/engine/install/template-copies.integration.test.ts
@@ -7,6 +7,7 @@
 import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
+import { spawnSync } from "node:child_process";
 import { afterEach, beforeEach, describe, expect, it } from "vitest";
 import { dispatchModules, type ModuleContext } from "./modules/index";
 import { formatTemplateChanges, syncTemplateCopies } from "./template-copies";
@@ -84,7 +85,7 @@ describe("the templates root is the copy-and-own set", () => {
       ".husky/pre-push",
       ".vale.ini",
       ".vale/styles/Bkit/LLMSlop.yml",
-      ".prettierignore",
+      "prettierignore.example",
       ".oxlintrc.json",
       ".envrc",
       ".cursor/Dockerfile",
@@ -218,3 +219,71 @@ describe("uninstall", () => {
     expect(fs.existsSync(path.join(tmpDir, COPIES))).toBe(false);
   });
 });
+
+describe("the sample configs do not act as live configs in a consumer", () => {
+  it("ships the sample configs under non-discoverable names", () => {
+    runCore();
+    const copies = copiedTemplates();
+    expect(copies).toContain("lintstagedrc.example.json");
+    expect(copies).toContain("prettierignore.example");
+    expect(copies).not.toContain(".lintstagedrc.json");
+    expect(copies).not.toContain(".prettierignore");
+
+    const stale = path.join(tmpDir, COPIES, ".lintstagedrc.json");
+    fs.writeFileSync(stale, "{}\n", "utf-8");
+    const live = syncTemplateCopies(tmpDir, { dryRun: false, ws: { writes: [] } });
+    expect(live.removed).toContain(".lintstagedrc.json");
+    expect(fs.existsSync(stale)).toBe(false);
+  });
+
+  it("leaves a staged template copy unchanged under plain lint-staged", () => {
+    runCore();
+    const repoRoot = path.resolve(getPkgRoot());
+    fs.symlinkSync(path.join(repoRoot, "node_modules"), path.join(tmpDir, "node_modules"));
+    fs.writeFileSync(
+      path.join(tmpDir, "package.json"),
+      JSON.stringify({ name: "c", private: true }),
+      "utf-8",
+    );
+    fs.writeFileSync(
+      path.join(tmpDir, ".lintstagedrc.json"),
+      JSON.stringify({ "*": "prettier --write --ignore-unknown" }),
+      "utf-8",
+    );
+    fs.writeFileSync(path.join(tmpDir, ".prettierignore"), ".bkit/templates/\n", "utf-8");
+
+    const git = (...args: string[]) =>
+      spawnSync(
+        "git",
+        [
+          "-c",
+          "user.name=t",
+          "-c",
+          "user.email=t@example.com",
+          "-c",
+          "commit.gpgsign=false",
+          ...args,
+        ],
+        { cwd: tmpDir, encoding: "utf-8" },
+      );
+    expect(git("init", "-q").status).toBe(0);
+    expect(git("add", "package.json", ".lintstagedrc.json", ".prettierignore").status).toBe(0);
+    expect(git("commit", "-q", "-m", "init").status).toBe(0);
+
+    const rel = path.join(COPIES, "scripts", "unformatted-copy.mjs");
+    const abs = path.join(tmpDir, rel);
+    const bytes = "const   a  =   { b:1,\n c:2 }\n";
+    fs.mkdirSync(path.dirname(abs), { recursive: true });
+    fs.writeFileSync(abs, bytes, "utf-8");
+    expect(git("add", "-f", rel).status).toBe(0);
+
+    const run = spawnSync("pnpm", ["lint-staged"], {
+      cwd: tmpDir,
+      encoding: "utf-8",
+      timeout: 90_000,
+      env: { ...process.env, GIT_DIR: undefined, GIT_WORK_TREE: undefined },
+    });
+    expect(run.status, `${run.stdout}\n${run.stderr}`).toBe(0);
+    expect(fs.readFileSync(abs, "utf-8")).toBe(bytes);
+  });
+});
diff --git a/.bkit/templates.md b/.bkit/templates.md
index d3f0dee29..6641c85f2 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -52,8 +52,8 @@ The adoption order is the `bkit tips` order. The machine lock has no tip, so ado
 | Health check | `.bkit/templates/.github/workflows/bkit-health.yml` | `.github/workflows/bkit-health.yml` | that file |
 | Cloud-agent workflow | `.bkit/templates/.github/workflows/bkit-cloud.yml` | `.github/workflows/bkit-cloud.yml` | that file |
 | Git hooks (Husky) | `.bkit/templates/.husky/pre-commit`, `.bkit/templates/.husky/pre-push` | `.husky/pre-commit`, `.husky/pre-push` | both files |
-| Prettier ignore list | `.bkit/templates/.prettierignore` | `.prettierignore` | that file |
-| lint-staged | `.bkit/templates/.lintstagedrc.json` | `.lintstagedrc.json` | that file |
+| Prettier ignore list | `.bkit/templates/prettierignore.example` | `.prettierignore` | that file |
+| lint-staged | `.bkit/templates/lintstagedrc.example.json` | `.lintstagedrc.json` | that file |
 | Vale | `.bkit/templates/.vale.ini`, `.bkit/templates/.vale/styles/Bkit/` | `.vale.ini`, `.vale/styles/Bkit/` | `.vale.ini` + the four Bkit styles |
 | slop-scan | `.bkit/templates/slop-scan.config.json`, `.bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs` | `slop-scan.config.json`, `scripts/slop/bkit-slop-type-suppression.mjs` | both files |
 | Oxlint | `.bkit/templates/.oxlintrc.json` | `.oxlintrc.json` | that file |
@@ -332,7 +332,7 @@ chmod +x .husky/pre-commit .husky/pre-push
 pnpm add -D prettier@^3.5.3
 ```
 
-1. Copy `.prettierignore` before the first `prettier --write`. bkit writes `.claude/`, `.cursor/`, `.opencode/`, `.mcp.json`, `.bkit/.env.example` and `docs/roadmap.md` in its own layout, so prettier reformatting them fights the next `bkit install` (`bkit check` drift).
+1. Copy `.bkit/templates/prettierignore.example` to `.prettierignore` before the first `prettier --write`. bkit writes `.claude/`, `.cursor/`, `.opencode/`, `.mcp.json`, `.bkit/.env.example` and `docs/roadmap.md` in its own layout, so prettier reformatting them fights the next `bkit install` (`bkit check` drift).
 2. Add `format:check` (§ Gate tool scripts). Reference: https://prettier.io/docs/install.
 
 - Keep the `.bkit/templates/` line.
@@ -340,6 +340,8 @@ pnpm add -D prettier@^3.5.3
 
 ## lint-staged — `.lintstagedrc.json`
 
+Copy `.bkit/templates/lintstagedrc.example.json` to `.lintstagedrc.json`. The samples under `.bkit/templates/` carry non-dotfile names so prettier and lint-staged do not read them as live config; `bkit upgrade` removes the old dotfile-named samples (`.lintstagedrc.json`, `.prettierignore`) from `.bkit/templates/`.
+
 It runs prettier over staged files. `bkit:gate:format` (the pre-commit hook) calls it. Reference: https://github.com/lint-staged/lint-staged.
 
 ```bash
@@ -391,6 +393,8 @@ cp .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs scripts/slop/
 
 It fails `lint` on a test that cannot fail. Oxlint (a fast linter) runs five rules on test files only, with all other checks off. It fits JS / TS repos with Vitest or Jest. Reference: https://oxc.rs/docs/guide/usage/linter.html.
 
+- The `.bkit/templates/.oxlintrc.json` sample keeps its dotfile name: oxlint run from a consumer root as `oxlint -c .oxlintrc.json` reports a violating test file at the root and reports nothing for the same file under `.bkit/templates/`, so the sample does not act as live config.
+
 ```bash
 pnpm add -D oxlint@^1.87.0 oxlint-tsgolint@^7.0.2004
 cp .bkit/templates/.oxlintrc.json .oxlintrc.json
diff --git a/.bkit/templates/.lintstagedrc.json b/.bkit/templates/lintstagedrc.example.json
similarity index 100%
rename from .bkit/templates/.lintstagedrc.json
rename to .bkit/templates/lintstagedrc.example.json
diff --git a/.bkit/templates/.prettierignore b/.bkit/templates/prettierignore.example
similarity index 100%
rename from .bkit/templates/.prettierignore
rename to .bkit/templates/prettierignore.example
diff --git a/.bkit/version b/.bkit/version
index f74c33fe5..f5fd1b54c 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -3,7 +3,7 @@
   "canonicalHashes": {
     ".cursor/mcp.json": "355e01cadabed3b924ebe339dc07ecbf7179397ebc9accf8618d5d7d6af6c438",
     "docs/deployments.md": "f618c8d0f207e811d4b179f2827480751fadc2058f29712657b48055d94501b6",
-    "docs/testing.md": "da17b9f316fe9dcf0b2bee590b0a42e2f4bff1d49c196240ea033ba02d8e0db0",
+    "docs/testing.md": "7e457aef3fcb8bf06ca14a1cb338660f367dcb8b6a5b0e353fe020c5ba7b0124",
     ".claude/settings.json": "34cfc63ef7bfb248ce3f27116ad3f6f89fd75678c599d2cd8e702c43f6958587",
     ".agents/context.md": "5cf54b91ffaa5d9372415a24dd1acfe0910c7def1f4434e25ccf110e3eaed013",
     ".agents/docs.md": "bfbddbf98bc4238c6a01dbd68fbe515ba01db2371c440d868fe12a8db6c96df0",
@@ -225,7 +225,7 @@
     ".bkit/prompts.md": "5c584b31cb1349e80e073b44ee9ab497fbc316ed75ffbca4a58dac787e34b49b",
     ".bkit/trackers.md": "c3b91b7ffcf75333bc2d09af7c9d887397850539b87b964441025e8978f41803",
     ".bkit/workflows.md": "e112c9aed4c10cabdc2a09d78222b8a5d3029ca57263bb76fc5bb08e3eb625de",
-    ".bkit/README.md": "30c3136159e0a5e8a1fa49c88de861147db7c63914fd319c52e1e7ea87437b25",
+    ".bkit/README.md": "433211fdfa856092d135678fe33cf1de1d772aca5f53b690fab0dca157a47782",
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "804315c40da562f88628d751ca75bdc27707f295a9346fed1c0db7d4ddb56d84",
     ".claude/hooks/bkit-guardrails.cjs": "5cdf3dc7a58a15280d70b9241b02b07eccd346063589ebebf235ebc74c5222ad",
diff --git a/dist/checks/tips/catalogue.js b/dist/checks/tips/catalogue.js
index 57fdf0537..fd2dd513f 100644
--- a/dist/checks/tips/catalogue.js
+++ b/dist/checks/tips/catalogue.js
@@ -148,7 +148,7 @@ export const SETUP_TIPS = [
         title: "Consistent formatting",
         line: "There's no shared formatting setup, so reviews fill up with spacing changes that hide the real ones. Add Prettier with bkit's ignore file.",
         why: "Prettier (a code formatter) makes every file follow the same layout. bkit's ignore file stops it reformatting bkit's own files, which would otherwise show up as false changes every time bkit updates.",
-        ask: 'Copy .bkit/templates/.prettierignore to .prettierignore first, then run `pnpm add -D prettier` and add `"format:check": "prettier --check ."` to the package.json scripts.',
+        ask: 'Copy .bkit/templates/prettierignore.example to .prettierignore first, then run `pnpm add -D prettier` and add `"format:check": "prettier --check ."` to the package.json scripts.',
         steps: "`.bkit/templates.md` § Prettier.",
         fires: (cwd) => !exists(cwd, ".prettierignore"),
     },
@@ -188,7 +188,7 @@ export const SETUP_TIPS = [
         title: "Quick tidy-up on commit",
         line: "The commit check has nothing to run. Add lint-staged so it tidies just the files you're committing.",
         why: "It formats only the handful of files in each change, in about a second. Without it the commit check either does nothing or is slow enough that people start skipping it.",
-        ask: "Run `pnpm add -D lint-staged prettier` and copy .bkit/templates/.lintstagedrc.json to .lintstagedrc.json.",
+        ask: "Run `pnpm add -D lint-staged prettier` and copy .bkit/templates/lintstagedrc.example.json to .lintstagedrc.json.",
         steps: "`.bkit/templates.md` § lint-staged.",
         fires: (cwd) => !hasLintStagedConfig(cwd),
     },
diff --git a/docs/testing.md b/docs/testing.md
index 4315adbf8..52353a78c 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -782,7 +782,7 @@ The machine-lock integration tests in `audits/templates/machine-lock.integration
 | `.bkit/templates/scripts/ci/bkit-check-capstone.test.mjs` | Standalone `node` (also `scripts/ci/`) | The capstone verdict, one environment per case: a lane that failed / skipped / was cancelled, a lane that ran under `run_level=none`, a lane that succeeded with 0 tests or a non-numeric count (`0`, `00`, `abc`, `-3`), a plan that is not JSON / not an object / has no `run_level`, a failed scope job, no `LANES`; exemptions (`EMPTY_COUNT=warn`, `run_level=none` with every lane skipped); exit code and `::error::` lines through the command line. |
 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` | Unit | Runs each copy-and-own `.test.mjs` (`bkit-check-capstone`, `bkit-check-dependency-audit`, `bkit-check-accepted-divergences`, `lanes/bkit-resolve-push-base`) as a child process; dependency-audit gate unit cases; both workflows' capstone steps call `bkit-check-capstone.mjs` with every lane in `needs` wired in, behind an ungated `actions/checkout`; the template step run in a temp dir reds with no script, passes with it, reds on a 0-test lane. |
 | `.bkit/core/engine/audits/templates/templates-content.test.ts` | Unit | Template `bkit-ci.yml` content guards (no private-repo auth, `[verbose ci]` knob, promotion-lag step, injection-safe PR title) and the parsed capstone `if: ${{ !cancelled() }}` and the concurrency group / default-branch queueing. No whole-file snapshot. |
-| `.bkit/core/engine/audits/templates/template-path-refs.test.ts` | Unit | No workflow, prompt or `.bkit/instructions.md` clause text names a template path. The forbidden names come from `.bkit/templates/` itself (its CI workflow files, `scripts/` folders) plus `.husky/`, `.vale*`, `.lintstagedrc.json`, `slop-scan.config.json` and `.envrc`, so a new template is covered without editing the test. |
+| `.bkit/core/engine/audits/templates/template-path-refs.test.ts` | Unit | No workflow, prompt or `.bkit/instructions.md` clause text names a template path. The forbidden names come from `.bkit/templates/` itself (its CI workflow files, `scripts/` folders) plus `.husky/`, `.vale*`, `lintstagedrc.example.json`, `prettierignore.example`, `slop-scan.config.json` and `.envrc`, so a new template is covered without editing the test. |
 | `.bkit/core/engine/audits/templates/template-shape.test.ts` | Unit | Every doc template opens with `<!-- bkit:start -->`, the managed marker, then its `<!-- Note: … -->`; the plan template holds no agent instruction (no `CRITICAL`, `**Agent:**`, `**Rules:**` or standing `NEVER` / `ALWAYS` / `MUST` / `ONLY` outside that note) and keeps its headings in order plus the lines `ledgers.ts` and `tests.ts` parse; no audit template keeps a rule `bkit-audit-generate` now carries, and each keeps `Step 1 — Previous Run` with its `Done when`; only `bkit-build-plan-tasks` says not to stop for permission at gates; no plan prompt defers a rule to the template. |
 | `.bkit/core/engine/tools/cli-doc.test.ts` | Unit | `.bkit/core/.bkit/cli.md` generated region equal to a fresh render of `CLASSIC_VERB_HELP` and `commands/registry.ts` (run `pnpm cli:sync`); every `CLASSIC_VERBS` verb listed once; a row with its `use` per command verb; `—` in empty cells; pipes escaped in cells; only line-anchored markers bound the region; missing markers throw. |
 | `.bkit/core/engine/tools/grammar-density.test.ts` | Unit | `pnpm grammar:density` counting (`a` / `an` / `the` per 1,000 words, fence marker lines dropped, `text` block lines per section, added lines of a zero-context diff) and the floor on canonical shared text: `clauses` >= 20, `rules` >= 16. |
