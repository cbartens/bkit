diff --git a/.bkit/core/.bkit/lite.md b/.bkit/core/.bkit/lite.md
deleted file mode 100644
index 3436f5164..000000000
--- a/.bkit/core/.bkit/lite.md
+++ /dev/null
@@ -1,73 +0,0 @@
-<!-- bkit:start -->
-
-{{BKIT_MANAGED_MARKER}}
-
-# Lite Workflows
-
-> [!CAUTION]
-> **Purpose:** Opt-in prompts that run a phase's steps and subagents without the full workflow's ceremony. The full workflow is the default.
->
-> **Rules:**
->
-> - All `.agents/rules.md` rules still apply. Fewer steps, never fewer rules.
-> - The named reference is **inspiration, not a command file**: read it for its steps and subagents, take what fits, drop the rest.
-> - Assume the right repo and branch are already checked out; do not re-detect them.
-> - Local project lite workflows → `Project Lite Workflows` below the bkit-managed block.
-
-## When to use
-
-Full workflow when in doubt; a lite workflow only when it is clearly enough. These are opt-in at your own judgement — they skip the gates, worktree isolation, PR, CI and audit trail, so they suit users who know what they are trading away. Add whichever full-phase step or subagent the work needs; go full when the cost of being wrong is high — irreversible changes (releases, data), blast radius past one small change, security / secrets / PII.
-
-NEVER a lite workflow for: schema / migrations, public API, dependencies, secrets / config, auth / security, large multi-file refactors.
-
-## Contract
-
-Read `.agents/rules.md`. Work on the current branch; commit as you go; push only when shipping or when asked. Tracker-wired: issue → the `package.json` `bkit.tracker.<tracker>.progress` state (default github `In progress`, linear `started`, jira `In Progress`) + `bkit:<phase>` label at start (drops other `bkit:*` workflow labels, `next:*`, `bkit:failed` per `.agents/rules.md` § Tracker workflow labels), the `bkit.tracker.<tracker>.review` state (default `In review` on github, `In Review` on linear and jira) at end, one short comment per step. No tracker, or no issue named: skip the tracker lines.
-
-## Paste
-
-Start the session on the phase's model from `.bkit/prompts.md` § Orchestrators. Copy one block — its heading is the lite workflow's name — then insert the issue or instructions at the bracketed line.
-
-### design:lite
-
-```text
-Handle the issue below as a design. Read `.bkit/workflows.md` § Per-Phase Workflows and `.bkit/prompts.md` as inspiration only — keep the steps that fit, skip the rest. Dispatch each kept subagent step to its `bkit-*` subagent on the model `.bkit/prompts.md` § Models pins for it; NEVER do subagent work inline. No subagent tool → run its prompt file in-session. Follow `.bkit/lite.md` § Contract.
-
-[INSERT ISSUE ID / INSTRUCTIONS]
-```
-
-### plan:lite
-
-```text
-Handle the issue below as a plan. Read `.bkit/workflows.md` § Per-Phase Workflows and `.bkit/prompts.md` as inspiration only — keep the steps that fit, skip the rest. Dispatch each kept subagent step to its `bkit-*` subagent on the model `.bkit/prompts.md` § Models pins for it; NEVER do subagent work inline. No subagent tool → run its prompt file in-session. Follow `.bkit/lite.md` § Contract.
-
-[INSERT ISSUE ID / INSTRUCTIONS]
-```
-
-### build:lite
-
-```text
-Handle the issue below as a build. Read `.bkit/workflows.md` § Per-Phase Workflows and `.bkit/prompts.md` as inspiration only — keep the steps that fit, skip the rest. Dispatch each kept subagent step to its `bkit-*` subagent on the model `.bkit/prompts.md` § Models pins for it; NEVER do subagent work inline. No subagent tool → run its prompt file in-session. Follow `.bkit/lite.md` § Contract.
-
-[INSERT ISSUE ID / INSTRUCTIONS]
-```
-
-### debug:lite
-
-```text
-Handle the issue below as a debug. Read `.bkit/workflows.md` § Per-Phase Workflows and `.bkit/prompts.md` as inspiration only — keep the steps that fit, skip the rest. Dispatch each kept subagent step to its `bkit-*` subagent on the model `.bkit/prompts.md` § Models pins for it; NEVER do subagent work inline. No subagent tool → run its prompt file in-session. Follow `.bkit/lite.md` § Contract.
-
-[INSERT ISSUE ID / INSTRUCTIONS]
-```
-
-### ship:lite
-
-```text
-Handle the issue below as a ship. Read `.bkit/workflows.md` § Per-Phase Workflows and `.bkit/prompts.md` as inspiration only — keep the steps that fit, skip the rest. Dispatch each kept subagent step to its `bkit-*` subagent on the model `.bkit/prompts.md` § Models pins for it; NEVER do subagent work inline. No subagent tool → run its prompt file in-session. Follow `.bkit/lite.md` § Contract.
-
-[INSERT ISSUE ID / INSTRUCTIONS]
-```
-
-<!-- bkit:end -->
-
-## Project Lite Workflows
diff --git a/.bkit/core/engine/audits/templates/templates.test.ts b/.bkit/core/engine/audits/templates/templates.test.ts
index 8ef01c3a7..d0361fdd6 100644
--- a/.bkit/core/engine/audits/templates/templates.test.ts
+++ b/.bkit/core/engine/audits/templates/templates.test.ts
@@ -148,7 +148,6 @@ const GROUP_A_MD_FILES: Array<[root: string, rel: string]> = [
   [CORE_ROOT, ".agents/rules.md"],
   [CORE_ROOT, ".agents/docs.md"],
   [CORE_ROOT, ".agents/skills.md"],
-  [CORE_ROOT, ".bkit/lite.md"],
   [CORE_ROOT, "docs/templates/bkit-plan.md"],
   ...listAuditTemplates().map((rel): [string, string] => [CORE_ROOT, rel]),
 ];
diff --git a/.bkit/core/engine/commands/install/upgrade.integration.test.ts b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
index cc3a75fef..fb90538b7 100644
--- a/.bkit/core/engine/commands/install/upgrade.integration.test.ts
+++ b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
@@ -2006,3 +2006,50 @@ describe("Scenario: bkit upgrade --to self-bump dry-run (#1)", () => {
     expect(result.status).toBe(1);
   });
 });
+
+describe("#715 — upgrade retires a 5.2.4 .bkit/lite.md", () => {
+  const bkitInstallPath = path.resolve(
+    path.dirname(new URL(import.meta.url).pathname),
+    "../../cli.ts",
+  );
+  function runCli(args: string[]) {
+    return spawnSync(requireTsx(), [bkitInstallPath, ...args], {
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
+  it("upgrade from a 5.2.4 lite.md keeps the consumer section", () => {
+    expect(spawnSync("git", ["init", "-q"], { cwd: tmpDir }).status).toBe(0);
+    fs.writeFileSync(
+      path.join(tmpDir, "package.json"),
+      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
+      "utf-8",
+    );
+    expect(runCli(["install", "--claude", "--tracker=github"]).status).toBe(0);
+    const own = "### hotfix\n\n```text\nShip the hotfix below.\n```";
+    const lite = path.join(tmpDir, ".bkit", "lite.md");
+    fs.writeFileSync(
+      lite,
+      "<!-- bkit:start -->\n\n<!-- bkit:managed v5.2.4 — do not edit; run `bkit upgrade` to refresh -->\n\n# Lite Workflows\n\nbody\n\n<!-- bkit:end -->\n\n## Project Lite Workflows\n\n" +
+        own +
+        "\n",
+      "utf-8",
+    );
+
+    expect(runCli(["upgrade", "--auto-apply"]).status).toBe(0);
+
+    const after = fs.readFileSync(lite, "utf-8");
+    expect(after).toContain(own);
+    expect(after).not.toContain("bkit:start");
+    expect(after.split("\n")[0]).toBe("<!-- bkit:retired-lite-stub -->");
+    expect(runCli(["check"]).status).toBe(0);
+  });
+});
diff --git a/.bkit/core/engine/install/manifest.test.ts b/.bkit/core/engine/install/manifest.test.ts
index 3c099d97c..7fa35e486 100644
--- a/.bkit/core/engine/install/manifest.test.ts
+++ b/.bkit/core/engine/install/manifest.test.ts
@@ -208,9 +208,16 @@ describe("getInstallManifest", () => {
     const promptsEntry = entries.find((e) => e.path === ".bkit/prompts.md");
     expect(promptsEntry, "core manifest must list .bkit/prompts.md").toBeDefined();
     expect(promptsEntry!.format).toBe("markered-text");
-    const liteEntry = entries.find((e) => e.path === ".bkit/lite.md");
-    expect(liteEntry, "core manifest must list .bkit/lite.md").toBeDefined();
-    expect(liteEntry!.format).toBe("markered-text");
+  });
+
+  it("core manifest lists no lite doc and prompts.md is the only markered-text core doc", () => {
+    const entries = getInstallManifest(["core"]);
+    expect(entries.find((e) => e.path === ".bkit/lite.md")).toBeUndefined();
+    const markered = entries
+      .filter((e) => e.format === "markered-text")
+      .map((e) => e.path)
+      .filter((p) => p.startsWith(".bkit/"));
+    expect(markered).toEqual([".bkit/prompts.md"]);
   });
 
   it("cloud owns no manifest entry (bkit-cloud-bootstrap.sh is a copy-and-own template)", () => {
diff --git a/.bkit/core/engine/install/manifest.ts b/.bkit/core/engine/install/manifest.ts
index 353934009..0acc090f4 100644
--- a/.bkit/core/engine/install/manifest.ts
+++ b/.bkit/core/engine/install/manifest.ts
@@ -137,7 +137,7 @@ const CORE_MANIFEST: ManifestEntry[] = [
   // `.bkit/core/.bkit/` and are read from there at runtime (getBkitDocsRoot); these
   // consumer copies are force-overwritten mirrors (writeTier1) so a consumer can read
   // them in-repo. Whole file is bkit-owned → byte-equal-text (refreshed every install);
-  // prompts.md and lite.md are markered-text, keeping the consumer section below `bkit:end`.
+  // prompts.md is markered-text, keeping the consumer section below `bkit:end`.
   { path: ".bkit/authoring.md", format: "byte-equal-text", module: "core" },
   { path: ".bkit/cloud.md", format: "byte-equal-text", module: "core" },
   { path: ".bkit/comparison.md", format: "byte-equal-text", module: "core" },
@@ -146,7 +146,6 @@ const CORE_MANIFEST: ManifestEntry[] = [
   // The MIT notice that travels with the files bkit writes: the full text and copyright
   // notice. Sourced from `.bkit/core/.bkit/LICENSE.md`.
   { path: ".bkit/LICENSE.md", format: "byte-equal-text", module: "core" },
-  { path: ".bkit/lite.md", format: "markered-text", module: "core" },
   { path: ".bkit/pipeline.md", format: "byte-equal-text", module: "core" },
   { path: ".bkit/providers.md", format: "byte-equal-text", module: "core" },
   { path: ".bkit/prompts.md", format: "markered-text", module: "core" },
diff --git a/.bkit/core/engine/install/modules/core.integration.test.ts b/.bkit/core/engine/install/modules/core.integration.test.ts
index 83007e1ce..1f246ad78 100644
--- a/.bkit/core/engine/install/modules/core.integration.test.ts
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -2,6 +2,7 @@
 // gate scripts and advisories, the first-install advisory, `.bkit/version`, and the managed blocks
 // of the shared `.agents/` files.
 
+import { spawnSync } from "node:child_process";
 import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
@@ -99,7 +100,6 @@ describe("bkit canonical docs pass (runBkitDocs, #218)", () => {
     "install.md",
     "jsonl.md",
     "LICENSE.md",
-    "lite.md",
     "pipeline.md",
     "providers.md",
     "prompts.md",
@@ -595,7 +595,7 @@ describe.each([
 });
 
 // ---------------------------------------------------------------------------
-// Migration: .agents/shortcuts.md (5.1.0 – 5.2.4) → .bkit/lite.md
+// Migration: .agents/shortcuts.md (5.1.0 – 5.2.4) and .bkit/lite.md → consumer-owned stub
 // ---------------------------------------------------------------------------
 
 describe("migrateLinearTeamKey (via seedCorePackageJsonScripts)", () => {
@@ -765,6 +765,37 @@ describe("seedBkitDefaults (via seedCorePackageJsonScripts)", () => {
     });
   });
 
+  it("seeds build.publish on install", () => {
+    seed({});
+    run();
+    expect(JSON.parse(read()).bkit.workflows.build.publish).toEqual({ remote: true, local: true });
+  });
+
+  it("keeps an existing publish.local false on upgrade", () => {
+    seed({ bkit: { workflows: { build: { publish: { local: false } } } } });
+    run();
+    expect(JSON.parse(read()).bkit.workflows.build.publish).toEqual({ remote: true, local: false });
+  });
+
+  it("seeds publish without dropping the ask blocks", () => {
+    seed({});
+    run();
+    expect(JSON.parse(read()).bkit.workflows.build).toEqual({
+      verify: { ask: true, maxAttempts: 2 },
+      challenge: { ask: true, maxAttempts: 2 },
+      tests: { ask: true, maxAttempts: 2 },
+      publish: { remote: true, local: true },
+    });
+  });
+
+  it("seeds publish when the bkit block has no build", () => {
+    seed({ bkit: { workflows: { minFreeGb: 10 } } });
+    run();
+    const build = JSON.parse(read()).bkit.workflows.build;
+    expect(build.publish).toEqual({ remote: true, local: true });
+    expect(build.verify).toEqual({ ask: true, maxAttempts: 2 });
+  });
+
   it("leaves a non-object nested block alone", () => {
     seed({ bkit: { tracker: { github: "x" } } });
     run();
@@ -1129,21 +1160,41 @@ describe("migrateLedgerSchema (via runBkitDocs)", () => {
   });
 });
 
-describe("migrateShortcutsToLite (via runBkitDocs)", () => {
-  const FIXTURE = path.join(getPkgRoot(), "tests/fixtures/shortcuts-5.2.4/shortcuts.md.txt");
+describe("migrateRetiredLite (via runBkitDocs)", () => {
   const OLD = path.join(".agents", "shortcuts.md");
   const LITE = path.join(".bkit", "lite.md");
+  const SENTINEL = "<!-- bkit:retired-lite-stub -->";
   const OWN = "### hotfix\n\n```text\nShip the hotfix below.\n```";
-
-  const seedOld = (extra = ""): void => {
-    fs.mkdirSync(".agents", { recursive: true });
-    fs.writeFileSync(OLD, fs.readFileSync(FIXTURE, "utf-8") + extra, "utf-8");
+  const OWN_OLD = "### nightly\n\n```text\nRun the nightly.\n```";
+  const BLOCK =
+    "<!-- bkit:start -->\n\n<!-- bkit:managed v5.2.4 — do not edit; run `bkit upgrade` to refresh -->\n\n# Lite Workflows\n\nbody\n\n<!-- bkit:end -->\n";
+  const SHORTCUTS_BLOCK = BLOCK.replace("# Lite Workflows", "# Shortcuts");
+
+  let savedGitDir: string | undefined;
+  let savedWorkTree: string | undefined;
+
+  beforeEach(() => {
+    savedGitDir = process.env.GIT_DIR;
+    savedWorkTree = process.env.GIT_WORK_TREE;
+    delete process.env.GIT_DIR;
+    delete process.env.GIT_WORK_TREE;
+    spawnSync("git", ["init", "-q"], { cwd: tmpDir });
+    process.env.GIT_DIR = path.join(tmpDir, ".git");
+    process.env.GIT_WORK_TREE = tmpDir;
+  });
+
+  afterEach(() => {
+    if (savedGitDir === undefined) delete process.env.GIT_DIR;
+    else process.env.GIT_DIR = savedGitDir;
+    if (savedWorkTree === undefined) delete process.env.GIT_WORK_TREE;
+    else process.env.GIT_WORK_TREE = savedWorkTree;
+    vi.restoreAllMocks();
+  });
+
+  const put = (file: string, text: string): void => {
+    fs.mkdirSync(path.dirname(file), { recursive: true });
+    fs.writeFileSync(file, text, "utf-8");
   };
-  const renderedLite = (): string =>
-    applyTokens(
-      fs.readFileSync(path.join(getBkitDocsRoot(), "lite.md"), "utf-8"),
-      makeCtx().tokens,
-    );
   const run = (dryRun = false): ModuleContext => {
     const ctx = makeCtx({ dryRun });
     runBkitDocs(ctx.dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
@@ -1151,51 +1202,105 @@ describe("migrateShortcutsToLite (via runBkitDocs)", () => {
   };
   const paths = (ctx: ModuleContext): string[] => ctx.ws.writes.map((w) => path.normalize(w.path));
 
-  it("deletes a pristine 5.2.4 copy and leaves .bkit/lite.md as rendered", () => {
-    seedOld();
+  it("strips the managed block and keeps consumer lines", () => {
+    put(LITE, `${BLOCK}\n## Project Lite Workflows\n\n${OWN}\n`);
+    run();
+    const lite = fs.readFileSync(LITE, "utf-8");
+    expect(lite.split("\n")[0]).toBe(SENTINEL);
+    expect(lite).toContain(OWN);
+    expect(lite).not.toContain("bkit:start");
+    expect(lite).not.toContain("bkit:managed");
+    expect(lite).not.toContain("## Project Lite Workflows");
+  });
+
+  it("deletes .bkit/lite.md when it holds only the seeded heading", () => {
+    put(LITE, `${BLOCK}\n## Project Lite Workflows\n`);
     const ctx = run();
-    expect(fs.existsSync(OLD)).toBe(false);
-    expect(fs.readFileSync(LITE, "utf-8")).toBe(renderedLite());
-    expect(paths(ctx)).toContain(OLD);
+    expect(fs.existsSync(LITE)).toBe(false);
+    expect(paths(ctx)).toContain(LITE);
   });
 
-  it("moves the consumer's own lines under ## Project Lite Workflows, without the old heading", () => {
-    seedOld(`\n${OWN}\n`);
-    run();
+  it("merges .agents/shortcuts.md consumer lines into the stub", () => {
+    put(LITE, `${BLOCK}\n## Project Lite Workflows\n\n${OWN}\n`);
+    put(OLD, `${SHORTCUTS_BLOCK}\n## Project Shortcuts\n\n${OWN_OLD}\n`);
+    const ctx = run();
     expect(fs.existsSync(OLD)).toBe(false);
     const lite = fs.readFileSync(LITE, "utf-8");
-    expect(lite).toBe(`${renderedLite().replace(/\n*$/, "\n\n")}${OWN}\n`);
+    expect(lite.split("\n")[0]).toBe(SENTINEL);
+    expect(lite).toContain(OWN);
+    expect(lite).toContain(OWN_OLD);
     expect(lite).not.toContain("## Project Shortcuts");
-    expect(extractManagedBlock(lite, "html-comment")).not.toBeNull();
+    expect(paths(ctx)).toContain(OLD);
   });
 
-  it("is idempotent: a second run changes nothing", () => {
-    seedOld(`\n${OWN}\n`);
+  it("creates the stub when the shortcuts merge finds no lite.md", () => {
+    put(OLD, `${SHORTCUTS_BLOCK}\n## Project Shortcuts\n\n${OWN_OLD}\n`);
+    expect(fs.existsSync(LITE)).toBe(false);
     run();
     expect(fs.existsSync(OLD)).toBe(false);
+    expect(fs.readFileSync(LITE, "utf-8")).toBe(`${SENTINEL}\n\n${OWN_OLD}\n`);
+  });
+
+  it("leaves a blockless or two-block lite.md untouched and logs", () => {
+    for (const text of [`# my notes\n\n${OWN}\n`, `${BLOCK}\n${BLOCK}\n${OWN}\n`]) {
+      put(LITE, text);
+      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
+      const ctx = run();
+      expect(fs.readFileSync(LITE, "utf-8")).toBe(text);
+      expect(paths(ctx)).not.toContain(LITE);
+      const logged = warn.mock.calls.map((c) => String(c[0])).join("\n");
+      expect(logged).toContain(LITE);
+      expect(logged).not.toContain("<!-- bkit:end -->");
+      warn.mockRestore();
+    }
+  });
+
+  it("logs no fix and writes nothing on a second install over its own stub", () => {
+    put(LITE, `${BLOCK}\n## Project Lite Workflows\n\n${OWN}\n`);
+    run();
+    const stub = fs.readFileSync(LITE, "utf-8");
+    expect(stub.split("\n")[0]).toBe(SENTINEL);
+    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
+    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
+    const again = run();
+    expect(warn).not.toHaveBeenCalled();
+    expect(log.mock.calls.map((c) => String(c[0])).join("\n")).not.toContain("lite");
+    expect(paths(again)).not.toContain(LITE);
+    expect(fs.readFileSync(LITE, "utf-8")).toBe(stub);
+  });
+
+  it("is idempotent across a second install", () => {
+    put(LITE, `${BLOCK}\n## Project Lite Workflows\n\n${OWN}\n`);
+    put(OLD, `${SHORTCUTS_BLOCK}\n## Project Shortcuts\n\n${OWN_OLD}\n`);
+    run();
     const after = fs.readFileSync(LITE, "utf-8");
+    expect(after.split("\n")[0]).toBe(SENTINEL);
     const again = run();
     expect(fs.readFileSync(LITE, "utf-8")).toBe(after);
     expect(paths(again)).not.toContain(OLD);
     expect(paths(again)).not.toContain(LITE);
   });
 
-  it("dry-run touches nothing and records the same writes as the real run", () => {
-    seedOld(`\n${OWN}\n`);
+  it("records the same write set in a dry run", () => {
+    put(LITE, `${BLOCK}\n## Project Lite Workflows\n\n${OWN}\n`);
+    put(OLD, `${SHORTCUTS_BLOCK}\n## Project Shortcuts\n\n${OWN_OLD}\n`);
+    const before = fs.readFileSync(LITE, "utf-8");
     const dry = run(true);
-    expect(fs.readFileSync(OLD, "utf-8")).toContain(OWN);
-    expect(fs.existsSync(LITE)).toBe(false);
-    expect(paths(dry).filter((p) => [LITE, OLD].includes(p))).toEqual([LITE, LITE, OLD]);
+    expect(fs.readFileSync(LITE, "utf-8")).toBe(before);
+    expect(fs.existsSync(OLD)).toBe(true);
+    expect(paths(dry).filter((p) => [LITE, OLD].includes(p))).not.toHaveLength(0);
     const real = run();
+    expect(fs.readFileSync(LITE, "utf-8").split("\n")[0]).toBe(SENTINEL);
     expect(paths(dry)).toEqual(paths(real));
   });
 
-  it("leaves an old copy without a managed block in place", () => {
-    fs.mkdirSync(".agents", { recursive: true });
-    fs.writeFileSync(OLD, `# Shortcuts\n\n${OWN}\n`, "utf-8");
-    const ctx = run();
-    expect(fs.readFileSync(OLD, "utf-8")).toContain(OWN);
-    expect(fs.readFileSync(LITE, "utf-8")).toBe(renderedLite());
-    expect(paths(ctx)).not.toContain(OLD);
+  it("installs no lite.md and still mirrors every other canonical doc", () => {
+    const ctx = makeCtx();
+    runCoreModule(ctx);
+    flushPostDispatch(ctx);
+    expect(fs.existsSync(LITE)).toBe(false);
+    for (const name of ["workflows.md", "prompts.md", "templates.md", "README.md"]) {
+      expect(fs.existsSync(path.join(".bkit", name)), name).toBe(true);
+    }
   });
 });
diff --git a/.bkit/core/engine/install/modules/core.ts b/.bkit/core/engine/install/modules/core.ts
index b1bf557b8..23e3c5d77 100644
--- a/.bkit/core/engine/install/modules/core.ts
+++ b/.bkit/core/engine/install/modules/core.ts
@@ -260,7 +260,6 @@ export const BKIT_CANONICAL_DOCS = [
   "install.md",
   "jsonl.md",
   "LICENSE.md",
-  "lite.md",
   "pipeline.md",
   "providers.md",
   "prompts.md",
@@ -303,7 +302,7 @@ export function runBkitDocs(
       console.log(`${logPrefix} ${tag}core: ${dstPath}`);
     }
   }
-  migrateShortcutsToLite(dryRun, ws, logPrefix);
+  migrateRetiredLite(dryRun, ws, logPrefix);
   migrateRetiredDevLock(dryRun, ws, logPrefix);
   migrateLedgerSchema(dryRun, ws, logPrefix);
   migrateJiraKeyName(dryRun, logPrefix);
@@ -329,41 +328,86 @@ export function migrateJiraKeyName(dryRun: boolean, logPrefix: string): void {
   );
 }
 
-// Migration (5.1.0 – 5.2.4 installs, `docs/migrations.md`): the lite workflows lived at
-// `.agents/shortcuts.md`. The consumer's own lines below `bkit:end` (minus the seeded
-// heading) move under `.bkit/lite.md`'s consumer section; the old file is deleted. Runs
-// after the docs loop, so `.bkit/lite.md` is already written. The delete is recorded in
-// ws (as orphan-mirror deletes are) so `bkit check` fails until upgrade runs.
+// Migration (5.1.0 – 6.0.x installs, `docs/migrations.md`): the lite workflows are retired.
+// The managed block of `.bkit/lite.md` (and of its 5.1.0 – 5.2.4 predecessor
+// `.agents/shortcuts.md`) is stripped; the consumer's own lines (minus the seeded headings)
+// land in `.bkit/lite.md` under a sentinel first line, or the file is deleted when none
+// remain. A file holding the sentinel and no managed block is the already-retired stub:
+// silent, no write. A blockless or multi-block `.bkit/lite.md` is left byte-for-byte with
+// a logged fix. Writes are recorded in ws (dry-run parity; `bkit check` fails until upgrade).
+export const RETIRED_LITE_STUB_SENTINEL = "<!-- bkit:retired-lite-stub -->";
 const RETIRED_SHORTCUTS = path.join(".agents", "shortcuts.md");
 const RETIRED_SHORTCUTS_HEADING = "## Project Shortcuts";
+const RETIRED_LITE = path.join(".bkit", "lite.md");
+const RETIRED_LITE_HEADING = "## Project Lite Workflows";
+
+/** The consumer lines left once the managed block and the given seeded heading are removed. */
+function consumerLines(text: string, heading: string): string {
+  const lines = stripManagedBlock(text, "html-comment").split("\n");
+  return lines
+    .filter((line) => line.trim() !== heading)
+    .join("\n")
+    .trim();
+}
 
-export function migrateShortcutsToLite(dryRun: boolean, ws: WriteSet, logPrefix: string): void {
-  if (!fs.existsSync(RETIRED_SHORTCUTS)) return;
-  if (!fs.existsSync(path.join(getBkitDocsRoot(), "lite.md"))) return;
+export function migrateRetiredLite(dryRun: boolean, ws: WriteSet, logPrefix: string): void {
+  const hasShortcuts = fs.existsSync(RETIRED_SHORTCUTS);
+  const hasLite = fs.existsSync(RETIRED_LITE);
+  if (!hasShortcuts && !hasLite) return;
   const tag = dryRun ? "[dry-run] " : "";
-  const dst = path.join(".bkit", "lite.md");
-  const old = fs.readFileSync(RETIRED_SHORTCUTS, "utf-8");
-  if (extractManagedBlock(old, "html-comment") === null) {
-    console.warn(
-      `${logPrefix} ${RETIRED_SHORTCUTS} has no single bkit managed block — left in place. Move your own lines into ${dst} below \`<!-- bkit:end -->\`, then delete it.`,
-    );
-    return;
+
+  let liteOwn = "";
+  let liteIsManaged = false;
+  if (hasLite) {
+    const lite = fs.readFileSync(RETIRED_LITE, "utf-8");
+    if (extractManagedBlock(lite, "html-comment") !== null) {
+      liteIsManaged = true;
+      liteOwn = consumerLines(lite, RETIRED_LITE_HEADING);
+    } else if (lite.split("\n")[0]?.trim() === RETIRED_LITE_STUB_SENTINEL) {
+      liteOwn = lite.slice(lite.indexOf("\n") + 1).trim();
+    } else {
+      console.warn(
+        `${logPrefix} ${RETIRED_LITE} has no single bkit managed block — left in place. The lite workflows are retired: keep your own lines in it (or in your own docs) and delete any leftover bkit-managed text.`,
+      );
+      return;
+    }
   }
-  const own = stripManagedBlock(old, "html-comment")
-    .split("\n")
-    .filter((line) => line.trim() !== RETIRED_SHORTCUTS_HEADING)
-    .join("\n")
-    .trim();
-  if (own.length > 0) {
-    if (!dryRun) {
-      const current = fs.readFileSync(dst, "utf-8");
-      fs.writeFileSync(dst, `${current.replace(/\n*$/, "\n\n")}${own}\n`, "utf-8");
+
+  let shortcutsOwn = "";
+  let shortcutsMovable = false;
+  if (hasShortcuts) {
+    const old = fs.readFileSync(RETIRED_SHORTCUTS, "utf-8");
+    if (extractManagedBlock(old, "html-comment") === null) {
+      console.warn(
+        `${logPrefix} ${RETIRED_SHORTCUTS} has no single bkit managed block — left in place. Move your own lines into ${RETIRED_LITE}, then delete it.`,
+      );
+    } else {
+      shortcutsMovable = true;
+      shortcutsOwn = consumerLines(old, RETIRED_SHORTCUTS_HEADING);
+    }
+  }
+
+  const own = [liteOwn, shortcutsOwn].filter((part) => part.length > 0).join("\n\n");
+  const stubText = `${RETIRED_LITE_STUB_SENTINEL}\n\n${own}\n`;
+  const liteChanges = liteIsManaged || (own.length > 0 && shortcutsOwn.length > 0);
+  if (liteChanges) {
+    if (own.length > 0) {
+      if (!dryRun) {
+        fs.mkdirSync(path.dirname(RETIRED_LITE), { recursive: true });
+        fs.writeFileSync(RETIRED_LITE, stubText, "utf-8");
+      }
+      ws.writes.push({ path: RETIRED_LITE, action: hasLite ? "update" : "write" });
+    } else if (hasLite) {
+      if (!dryRun) fs.rmSync(RETIRED_LITE);
+      ws.writes.push({ path: RETIRED_LITE, action: "write" });
     }
-    ws.writes.push({ path: dst, action: "update" });
+    console.log(`${logPrefix} ${tag}core: retired ${RETIRED_LITE}`);
+  }
+  if (shortcutsMovable) {
+    if (!dryRun) fs.rmSync(RETIRED_SHORTCUTS);
+    ws.writes.push({ path: RETIRED_SHORTCUTS, action: "write" });
+    console.log(`${logPrefix} ${tag}core: retired ${RETIRED_SHORTCUTS}`);
   }
-  if (!dryRun) fs.rmSync(RETIRED_SHORTCUTS);
-  ws.writes.push({ path: RETIRED_SHORTCUTS, action: "write" });
-  console.log(`${logPrefix} ${tag}core: moved ${RETIRED_SHORTCUTS} → ${dst}`);
 }
 
 // Migration (installs up to 5.3.x, `docs/migrations.md`): `.bkit/.dev.lock` was the
@@ -486,7 +530,7 @@ export const SEEDED_BKIT_DEFAULTS: Readonly<Record<string, unknown>> = {
     minFreeGb: CONFIG_DEFAULTS.diskMinFreeGb,
     worktree: { copy: [...CONFIG_DEFAULTS.worktreeCopy], install: CONFIG_DEFAULTS.worktreeInstall },
     tasks: { ...CONFIG_DEFAULTS.tasks },
-    ...askBlocks(),
+    ...withBuildPublish(askBlocks()),
   },
   // bkit-utility-update-roadmap list length; the prompt falls back to 25 too.
   prompts: { roadmapNext: 25 },
@@ -505,6 +549,13 @@ function askBlocks(): Record<string, Record<string, Record<string, unknown>>> {
   return out;
 }
 
+/** Merge the `build.publish` choice beside the build ask blocks. */
+function withBuildPublish(
+  blocks: Record<string, Record<string, Record<string, unknown>>>,
+): Record<string, Record<string, unknown>> {
+  return { ...blocks, build: { ...blocks.build, publish: { remote: true, local: true } } };
+}
+
 const plainObject = (v: unknown): v is Record<string, unknown> =>
   v !== null && typeof v === "object" && !Array.isArray(v);
 
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 045f36650..e5782a9fe 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -5700,7 +5700,7 @@ record the date read
 
 - doc: where-used
 - tags: format
-- carriers: doc `architecture`, `context`, `data-schema`, `deployments`, `design`, `docs`, `noise`, `observability`, `prompts`, `security`, `setup`, `skills`, `technology`, `testing`; rules
+- carriers: doc all except `CLAUDE`, `GEMINI`, `bkit-rules`; rules
 
 ```text
 Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
@@ -5738,7 +5738,7 @@ Notation: one job per mark — `.bkit/authoring.md` § `Notation`.
 ### doc-local-section
 
 - doc: where-used
-- carriers: doc `docs`, `lite`, `skills`
+- carriers: doc `docs`, `skills`
 
 ```text
 Local project {{what}} → `Project {{section}}` below the bkit-managed block.
diff --git a/dist/install/manifest.js b/dist/install/manifest.js
index 6ac4df490..8904ca4a3 100644
--- a/dist/install/manifest.js
+++ b/dist/install/manifest.js
@@ -89,7 +89,7 @@ const CORE_MANIFEST = [
     // `.bkit/core/.bkit/` and are read from there at runtime (getBkitDocsRoot); these
     // consumer copies are force-overwritten mirrors (writeTier1) so a consumer can read
     // them in-repo. Whole file is bkit-owned → byte-equal-text (refreshed every install);
-    // prompts.md and lite.md are markered-text, keeping the consumer section below `bkit:end`.
+    // prompts.md is markered-text, keeping the consumer section below `bkit:end`.
     { path: ".bkit/authoring.md", format: "byte-equal-text", module: "core" },
     { path: ".bkit/cloud.md", format: "byte-equal-text", module: "core" },
     { path: ".bkit/comparison.md", format: "byte-equal-text", module: "core" },
@@ -98,7 +98,6 @@ const CORE_MANIFEST = [
     // The MIT notice that travels with the files bkit writes: the full text and copyright
     // notice. Sourced from `.bkit/core/.bkit/LICENSE.md`.
     { path: ".bkit/LICENSE.md", format: "byte-equal-text", module: "core" },
-    { path: ".bkit/lite.md", format: "markered-text", module: "core" },
     { path: ".bkit/pipeline.md", format: "byte-equal-text", module: "core" },
     { path: ".bkit/providers.md", format: "byte-equal-text", module: "core" },
     { path: ".bkit/prompts.md", format: "markered-text", module: "core" },
diff --git a/dist/install/modules/core.js b/dist/install/modules/core.js
index 3962630cf..4b8e34295 100644
--- a/dist/install/modules/core.js
+++ b/dist/install/modules/core.js
@@ -195,7 +195,6 @@ export const BKIT_CANONICAL_DOCS = [
     "install.md",
     "jsonl.md",
     "LICENSE.md",
-    "lite.md",
     "pipeline.md",
     "providers.md",
     "prompts.md",
@@ -234,7 +233,7 @@ export function runBkitDocs(dryRun, tokens, ws, logPrefix) {
             console.log(`${logPrefix} ${tag}core: ${dstPath}`);
         }
     }
-    migrateShortcutsToLite(dryRun, ws, logPrefix);
+    migrateRetiredLite(dryRun, ws, logPrefix);
     migrateRetiredDevLock(dryRun, ws, logPrefix);
     migrateLedgerSchema(dryRun, ws, logPrefix);
     migrateJiraKeyName(dryRun, logPrefix);
@@ -258,41 +257,84 @@ export function migrateJiraKeyName(dryRun, logPrefix) {
         fs.writeFileSync(ENV_FILE, text.split(OLD_JIRA_KEY).join(NEW_JIRA_KEY), "utf-8");
     console.log(`${logPrefix} ${dryRun ? "[dry-run] " : ""}core: ${ENV_FILE} — ${OLD_JIRA_KEY} renamed to ${NEW_JIRA_KEY}`);
 }
-// Migration (5.1.0 – 5.2.4 installs, `docs/migrations.md`): the lite workflows lived at
-// `.agents/shortcuts.md`. The consumer's own lines below `bkit:end` (minus the seeded
-// heading) move under `.bkit/lite.md`'s consumer section; the old file is deleted. Runs
-// after the docs loop, so `.bkit/lite.md` is already written. The delete is recorded in
-// ws (as orphan-mirror deletes are) so `bkit check` fails until upgrade runs.
+// Migration (5.1.0 – 6.0.x installs, `docs/migrations.md`): the lite workflows are retired.
+// The managed block of `.bkit/lite.md` (and of its 5.1.0 – 5.2.4 predecessor
+// `.agents/shortcuts.md`) is stripped; the consumer's own lines (minus the seeded headings)
+// land in `.bkit/lite.md` under a sentinel first line, or the file is deleted when none
+// remain. A file holding the sentinel and no managed block is the already-retired stub:
+// silent, no write. A blockless or multi-block `.bkit/lite.md` is left byte-for-byte with
+// a logged fix. Writes are recorded in ws (dry-run parity; `bkit check` fails until upgrade).
+export const RETIRED_LITE_STUB_SENTINEL = "<!-- bkit:retired-lite-stub -->";
 const RETIRED_SHORTCUTS = path.join(".agents", "shortcuts.md");
 const RETIRED_SHORTCUTS_HEADING = "## Project Shortcuts";
-export function migrateShortcutsToLite(dryRun, ws, logPrefix) {
-    if (!fs.existsSync(RETIRED_SHORTCUTS))
-        return;
-    if (!fs.existsSync(path.join(getBkitDocsRoot(), "lite.md")))
+const RETIRED_LITE = path.join(".bkit", "lite.md");
+const RETIRED_LITE_HEADING = "## Project Lite Workflows";
+/** The consumer lines left once the managed block and the given seeded heading are removed. */
+function consumerLines(text, heading) {
+    const lines = stripManagedBlock(text, "html-comment").split("\n");
+    return lines
+        .filter((line) => line.trim() !== heading)
+        .join("\n")
+        .trim();
+}
+export function migrateRetiredLite(dryRun, ws, logPrefix) {
+    const hasShortcuts = fs.existsSync(RETIRED_SHORTCUTS);
+    const hasLite = fs.existsSync(RETIRED_LITE);
+    if (!hasShortcuts && !hasLite)
         return;
     const tag = dryRun ? "[dry-run] " : "";
-    const dst = path.join(".bkit", "lite.md");
-    const old = fs.readFileSync(RETIRED_SHORTCUTS, "utf-8");
-    if (extractManagedBlock(old, "html-comment") === null) {
-        console.warn(`${logPrefix} ${RETIRED_SHORTCUTS} has no single bkit managed block — left in place. Move your own lines into ${dst} below \`<!-- bkit:end -->\`, then delete it.`);
-        return;
+    let liteOwn = "";
+    let liteIsManaged = false;
+    if (hasLite) {
+        const lite = fs.readFileSync(RETIRED_LITE, "utf-8");
+        if (extractManagedBlock(lite, "html-comment") !== null) {
+            liteIsManaged = true;
+            liteOwn = consumerLines(lite, RETIRED_LITE_HEADING);
+        }
+        else if (lite.split("\n")[0]?.trim() === RETIRED_LITE_STUB_SENTINEL) {
+            liteOwn = lite.slice(lite.indexOf("\n") + 1).trim();
+        }
+        else {
+            console.warn(`${logPrefix} ${RETIRED_LITE} has no single bkit managed block — left in place. The lite workflows are retired: keep your own lines in it (or in your own docs) and delete any leftover bkit-managed text.`);
+            return;
+        }
     }
-    const own = stripManagedBlock(old, "html-comment")
-        .split("\n")
-        .filter((line) => line.trim() !== RETIRED_SHORTCUTS_HEADING)
-        .join("\n")
-        .trim();
-    if (own.length > 0) {
-        if (!dryRun) {
-            const current = fs.readFileSync(dst, "utf-8");
-            fs.writeFileSync(dst, `${current.replace(/\n*$/, "\n\n")}${own}\n`, "utf-8");
+    let shortcutsOwn = "";
+    let shortcutsMovable = false;
+    if (hasShortcuts) {
+        const old = fs.readFileSync(RETIRED_SHORTCUTS, "utf-8");
+        if (extractManagedBlock(old, "html-comment") === null) {
+            console.warn(`${logPrefix} ${RETIRED_SHORTCUTS} has no single bkit managed block — left in place. Move your own lines into ${RETIRED_LITE}, then delete it.`);
+        }
+        else {
+            shortcutsMovable = true;
+            shortcutsOwn = consumerLines(old, RETIRED_SHORTCUTS_HEADING);
         }
-        ws.writes.push({ path: dst, action: "update" });
     }
-    if (!dryRun)
-        fs.rmSync(RETIRED_SHORTCUTS);
-    ws.writes.push({ path: RETIRED_SHORTCUTS, action: "write" });
-    console.log(`${logPrefix} ${tag}core: moved ${RETIRED_SHORTCUTS} → ${dst}`);
+    const own = [liteOwn, shortcutsOwn].filter((part) => part.length > 0).join("\n\n");
+    const stubText = `${RETIRED_LITE_STUB_SENTINEL}\n\n${own}\n`;
+    const liteChanges = liteIsManaged || (own.length > 0 && shortcutsOwn.length > 0);
+    if (liteChanges) {
+        if (own.length > 0) {
+            if (!dryRun) {
+                fs.mkdirSync(path.dirname(RETIRED_LITE), { recursive: true });
+                fs.writeFileSync(RETIRED_LITE, stubText, "utf-8");
+            }
+            ws.writes.push({ path: RETIRED_LITE, action: hasLite ? "update" : "write" });
+        }
+        else if (hasLite) {
+            if (!dryRun)
+                fs.rmSync(RETIRED_LITE);
+            ws.writes.push({ path: RETIRED_LITE, action: "write" });
+        }
+        console.log(`${logPrefix} ${tag}core: retired ${RETIRED_LITE}`);
+    }
+    if (shortcutsMovable) {
+        if (!dryRun)
+            fs.rmSync(RETIRED_SHORTCUTS);
+        ws.writes.push({ path: RETIRED_SHORTCUTS, action: "write" });
+        console.log(`${logPrefix} ${tag}core: retired ${RETIRED_SHORTCUTS}`);
+    }
 }
 // Migration (installs up to 5.3.x, `docs/migrations.md`): `.bkit/.dev.lock` was the
 // repo-wide dev lock. Nothing reads it now, so one a crashed run left behind is deleted.
@@ -403,7 +445,7 @@ export const SEEDED_BKIT_DEFAULTS = {
         minFreeGb: CONFIG_DEFAULTS.diskMinFreeGb,
         worktree: { copy: [...CONFIG_DEFAULTS.worktreeCopy], install: CONFIG_DEFAULTS.worktreeInstall },
         tasks: { ...CONFIG_DEFAULTS.tasks },
-        ...askBlocks(),
+        ...withBuildPublish(askBlocks()),
     },
     // bkit-utility-update-roadmap list length; the prompt falls back to 25 too.
     prompts: { roadmapNext: 25 },
@@ -420,6 +462,10 @@ function askBlocks() {
     }
     return out;
 }
+/** Merge the `build.publish` choice beside the build ask blocks. */
+function withBuildPublish(blocks) {
+    return { ...blocks, build: { ...blocks.build, publish: { remote: true, local: true } } };
+}
 const plainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
 // Copy each `defaults` key missing from `target`, descending into blocks both sides hold.
 // A present key keeps its value, whatever it is. Pushes each added key's dotted path.
diff --git a/docs/migrations.md b/docs/migrations.md
index 2ca8f51c6..dbf75b640 100644
--- a/docs/migrations.md
+++ b/docs/migrations.md
@@ -18,7 +18,7 @@

<!-- prettier-ignore -->
 | Migration | Where | What it rewrites | Releases | Test |
 | --- | --- | --- | --- | --- |
 | Retired Antigravity hook drivers | `.bkit/core/engine/install/write.ts` (`RETIRED_DRIVER_HASHES`, `writeTier2`) | `.agents/plugins/bkit/hooks/bkit-gateguard.cjs` / `bkit-guardrails.cjs` whose driver (text outside `// bkit:start` / `// bkit:end`) is byte-identical to 5.1.0's Claude-shaped `hookSpecificOutput` driver → whole file replaced with the current template (`{ decision, reason }` driver). An edited driver is kept; install / upgrade prints the fix. | 5.1.0 | `.bkit/core/engine/install/write.test.ts` (fixtures `tests/fixtures/antigravity-5.1.0/`) |
-| Lite workflows moved to `.bkit/lite.md` | `.bkit/core/engine/install/modules/core.ts` (`migrateShortcutsToLite`, called by `runBkitDocs`); `.bkit/core/engine/commands/install/uninstall.ts` (`CORE_TEMPLATE_DOCTRINE`) | `.agents/shortcuts.md` → consumer lines below `<!-- bkit:end -->` (minus the seeded `## Project Shortcuts` heading) appended to `.bkit/lite.md`; old file deleted. No single managed block → left in place; install / upgrade prints the fix. Uninstall strips the old file like any managed doc. | 5.1.0-5.2.4 | `.bkit/core/engine/install/modules/core.integration.test.ts` (fixture `tests/fixtures/shortcuts-5.2.4/`) |
+| Lite workflows retired | `.bkit/core/engine/install/modules/core.ts` (`migrateRetiredLite`, called by `runBkitDocs`); `.bkit/core/engine/commands/install/uninstall.ts` (`CORE_TEMPLATE_DOCTRINE`) | Managed block stripped from `.bkit/lite.md` and `.agents/shortcuts.md`; consumer lines below `<!-- bkit:end -->` (minus the seeded `## Project Lite Workflows` / `## Project Shortcuts` headings) merge into `.bkit/lite.md` under the first line `<!-- bkit:retired-lite-stub -->`; the file is deleted when no lines remain; `.agents/shortcuts.md` deleted. A file with the sentinel and no managed block is the retired stub: silent, no write. No single managed block and no sentinel → left in place; install / upgrade prints the fix. Uninstall strips `.agents/shortcuts.md` like any managed doc and never touches the stub. | 5.1.0-6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 | Network allowlist moved to `.bkit/allowlist.json` | `.bkit/core/engine/install/network-allowlist.ts` (`writeNetworkAllowlist`, called by `runCoreModule` and `renderManagedOutputs`) | `.cursor/allowlist.json` whose path `.bkit/version` `canonicalHashes` records → deleted (bkit owned it whole; `.bkit/allowlist.json` replaces it); the hash prunes on the same run. An unrecorded file is left alone. | up to 5.2.4 | `.bkit/core/engine/install/network-allowlist.test.ts`; `.bkit/core/engine/install/modules/index.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 | Retired dev lock deleted | `.bkit/core/engine/install/modules/core.ts` (`migrateRetiredDevLock`, called by `runBkitDocs`) | `.bkit/.dev.lock` (a file; the repo-wide dev lock nothing reads any more) → deleted. A directory at that path is left alone. | up to 5.3.x | `.bkit/core/engine/install/modules/core.integration.test.ts` |
 | Linear team key moved to `bkit.linear.team` | `.bkit/core/engine/install/modules/core.ts` (`migrateLinearTeamKey`, called by `seedCorePackageJsonScripts`) | `package.json` `bkit.linearTeam` → `bkit.linear.team`, beside `project` / `progress` / `review`; old key deleted. An existing `bkit.linear.team` wins; a blank old value is dropped. Original indent kept. | up to 5.4.x | `.bkit/core/engine/install/modules/core.integration.test.ts` |
