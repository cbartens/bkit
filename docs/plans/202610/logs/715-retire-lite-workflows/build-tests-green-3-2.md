Enforced: true
Verdict: null
Gaps: 11
Test order only: true

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/715-retire-lite-workflows-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 6 | `.bkit/core/engine/install/modules/core.integration.test.ts` "seeds build.publish on install" | recorded 2026-10-28T21:14:21Z | unknown | passed |
| 6 | `.bkit/core/engine/install/modules/core.integration.test.ts` "keeps an existing publish.local false on upgrade" | recorded 2026-10-28T21:14:23Z | unknown | passed |
| 6 | `.bkit/core/engine/install/modules/core.integration.test.ts` "seeds publish without dropping the ask blocks" | recorded 2026-10-28T21:14:24Z | yes | passed |
| 6 | `.bkit/core/engine/install/modules/core.integration.test.ts` "seeds publish when the bkit block has no build" | recorded 2026-10-28T21:14:33Z | yes | passed |
| 7 | `.bkit/core/engine/install/modules/core.integration.test.ts` "strips the managed block and keeps consumer lines" | recorded 2026-10-28T21:15:28Z | added lines only | passed |
| 7 | `.bkit/core/engine/install/modules/core.integration.test.ts` "deletes .bkit/lite.md when it holds only the seeded heading" | recorded 2026-10-28T21:15:30Z | added lines only | passed |
| 7 | `.bkit/core/engine/install/modules/core.integration.test.ts` "merges .agents/shortcuts.md consumer lines into the stub" | recorded 2026-10-28T21:15:32Z | added lines only | passed |
| 7 | `.bkit/core/engine/install/modules/core.integration.test.ts` "creates the stub when the shortcuts merge finds no lite.md" | recorded 2026-10-28T21:15:33Z | added lines only | passed |
| 7 | `.bkit/core/engine/install/modules/core.integration.test.ts` "leaves a blockless or two-block lite.md untouched and logs" | recorded 2026-10-28T21:15:35Z | added lines only | passed |
| 7 | `.bkit/core/engine/install/modules/core.integration.test.ts` "logs no fix and writes nothing on a second install over its own stub" | recorded 2026-10-28T21:16:25Z | no | passed |
| 7 | `.bkit/core/engine/install/modules/core.integration.test.ts` "is idempotent across a second install" | recorded 2026-10-28T21:16:27Z | no | passed |
| 7 | `.bkit/core/engine/install/modules/core.integration.test.ts` "records the same write set in a dry run" | recorded 2026-10-28T21:16:29Z | no | passed |
| 7 | `.bkit/core/engine/install/modules/core.integration.test.ts` "installs no lite.md and still mirrors every other canonical doc" | recorded 2026-10-28T21:15:43Z | added lines only | passed |
| 7 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade from a 5.2.4 lite.md keeps the consumer section" | recorded 2026-10-28T21:16:11Z | yes | passed |

## Gaps

- Task 6 `red-evidence-missing` — the red's test snapshot docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-3-6-2.snapshot is missing — Fixable: false — log: TASK 6: `.bkit/core/engine/install/modules/core.integration.test.ts` `seeds build.publish on install` — red-evidence-missing — Fixable: false
- Task 6 `red-evidence-missing` — the red's test snapshot docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-3-6-3.snapshot is missing — Fixable: false — log: TASK 6: `.bkit/core/engine/install/modules/core.integration.test.ts` `keeps an existing publish.local false on upgrade` — red-evidence-missing — Fixable: false
- Task 6 `test-changed` — `.bkit/core/engine/install/modules/core.integration.test.ts` differs from its red snapshot for "seeds publish without dropping the ask blocks" (diff below) — Fixable: null — log: TASK 6: `.bkit/core/engine/install/modules/core.integration.test.ts` `seeds publish without dropping the ask blocks` — test-changed — Fixable: null
- Task 6 `test-changed` — `.bkit/core/engine/install/modules/core.integration.test.ts` differs from its red snapshot for "seeds publish when the bkit block has no build" (diff below) — Fixable: null — log: TASK 6: `.bkit/core/engine/install/modules/core.integration.test.ts` `seeds publish when the bkit block has no build` — test-changed — Fixable: null
- Task 7 `test-changed` — `.bkit/core/engine/install/modules/core.integration.test.ts` gained lines since its red snapshot for "strips the managed block and keeps consumer lines" (diff below) — Fixable: null — log: TASK 7: `.bkit/core/engine/install/modules/core.integration.test.ts` `strips the managed block and keeps consumer lines` — test-changed — Fixable: null
- Task 7 `test-changed` — `.bkit/core/engine/install/modules/core.integration.test.ts` gained lines since its red snapshot for "deletes .bkit/lite.md when it holds only the seeded heading" (diff below) — Fixable: null — log: TASK 7: `.bkit/core/engine/install/modules/core.integration.test.ts` `deletes .bkit/lite.md when it holds only the seeded heading` — test-changed — Fixable: null
- Task 7 `test-changed` — `.bkit/core/engine/install/modules/core.integration.test.ts` gained lines since its red snapshot for "merges .agents/shortcuts.md consumer lines into the stub" (diff below) — Fixable: null — log: TASK 7: `.bkit/core/engine/install/modules/core.integration.test.ts` `merges .agents/shortcuts.md consumer lines into the stub` — test-changed — Fixable: null
- Task 7 `test-changed` — `.bkit/core/engine/install/modules/core.integration.test.ts` gained lines since its red snapshot for "creates the stub when the shortcuts merge finds no lite.md" (diff below) — Fixable: null — log: TASK 7: `.bkit/core/engine/install/modules/core.integration.test.ts` `creates the stub when the shortcuts merge finds no lite.md` — test-changed — Fixable: null
- Task 7 `test-changed` — `.bkit/core/engine/install/modules/core.integration.test.ts` gained lines since its red snapshot for "leaves a blockless or two-block lite.md untouched and logs" (diff below) — Fixable: null — log: TASK 7: `.bkit/core/engine/install/modules/core.integration.test.ts` `leaves a blockless or two-block lite.md untouched and logs` — test-changed — Fixable: null
- Task 7 `test-changed` — `.bkit/core/engine/install/modules/core.integration.test.ts` gained lines since its red snapshot for "installs no lite.md and still mirrors every other canonical doc" (diff below) — Fixable: null — log: TASK 7: `.bkit/core/engine/install/modules/core.integration.test.ts` `installs no lite.md and still mirrors every other canonical doc` — test-changed — Fixable: null
- Task 7 `test-changed` — `.bkit/core/engine/commands/install/upgrade.integration.test.ts` differs from its red snapshot for "upgrade from a 5.2.4 lite.md keeps the consumer section" (diff below) — Fixable: null — log: TASK 7: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade from a 5.2.4 lite.md keeps the consumer section` — test-changed — Fixable: null

## Diff since red — Task 6 `.bkit/core/engine/install/modules/core.integration.test.ts`

````diff
diff --git a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-3-6-4.snapshot b/.bkit/core/engine/install/modules/core.integration.test.ts
index cf4924fa0..1f246ad78 100644
--- a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-3-6-4.snapshot
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
@@ -1160,21 +1160,41 @@ describe("migrateLedgerSchema (via runBkitDocs)", () => {
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
@@ -1182,51 +1202,105 @@ describe("migrateShortcutsToLite (via runBkitDocs)", () => {
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
````

## Diff since red — Task 6 `.bkit/core/engine/install/modules/core.integration.test.ts`

````diff
diff --git a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-3-6-4.snapshot b/.bkit/core/engine/install/modules/core.integration.test.ts
index cf4924fa0..1f246ad78 100644
--- a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-3-6-4.snapshot
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
@@ -1160,21 +1160,41 @@ describe("migrateLedgerSchema (via runBkitDocs)", () => {
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
@@ -1182,51 +1202,105 @@ describe("migrateShortcutsToLite (via runBkitDocs)", () => {
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
````

## Diff since red — Task 7 `.bkit/core/engine/install/modules/core.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-3-7-1.snapshot b/.bkit/core/engine/install/modules/core.integration.test.ts
index 3a72217bb..1f246ad78 100644
--- a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-3-7-1.snapshot
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -1259,6 +1259,7 @@ describe("migrateRetiredLite (via runBkitDocs)", () => {
     put(LITE, `${BLOCK}\n## Project Lite Workflows\n\n${OWN}\n`);
     run();
     const stub = fs.readFileSync(LITE, "utf-8");
+    expect(stub.split("\n")[0]).toBe(SENTINEL);
     const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
     const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
     const again = run();
@@ -1273,6 +1274,7 @@ describe("migrateRetiredLite (via runBkitDocs)", () => {
     put(OLD, `${SHORTCUTS_BLOCK}\n## Project Shortcuts\n\n${OWN_OLD}\n`);
     run();
     const after = fs.readFileSync(LITE, "utf-8");
+    expect(after.split("\n")[0]).toBe(SENTINEL);
     const again = run();
     expect(fs.readFileSync(LITE, "utf-8")).toBe(after);
     expect(paths(again)).not.toContain(OLD);
@@ -1288,6 +1290,7 @@ describe("migrateRetiredLite (via runBkitDocs)", () => {
     expect(fs.existsSync(OLD)).toBe(true);
     expect(paths(dry).filter((p) => [LITE, OLD].includes(p))).not.toHaveLength(0);
     const real = run();
+    expect(fs.readFileSync(LITE, "utf-8").split("\n")[0]).toBe(SENTINEL);
     expect(paths(dry)).toEqual(paths(real));
   });
```

## Diff since red — Task 7 `.bkit/core/engine/install/modules/core.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-3-7-2.snapshot b/.bkit/core/engine/install/modules/core.integration.test.ts
index 3a72217bb..1f246ad78 100644
--- a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-3-7-2.snapshot
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -1259,6 +1259,7 @@ describe("migrateRetiredLite (via runBkitDocs)", () => {
     put(LITE, `${BLOCK}\n## Project Lite Workflows\n\n${OWN}\n`);
     run();
     const stub = fs.readFileSync(LITE, "utf-8");
+    expect(stub.split("\n")[0]).toBe(SENTINEL);
     const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
     const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
     const again = run();
@@ -1273,6 +1274,7 @@ describe("migrateRetiredLite (via runBkitDocs)", () => {
     put(OLD, `${SHORTCUTS_BLOCK}\n## Project Shortcuts\n\n${OWN_OLD}\n`);
     run();
     const after = fs.readFileSync(LITE, "utf-8");
+    expect(after.split("\n")[0]).toBe(SENTINEL);
     const again = run();
     expect(fs.readFileSync(LITE, "utf-8")).toBe(after);
     expect(paths(again)).not.toContain(OLD);
@@ -1288,6 +1290,7 @@ describe("migrateRetiredLite (via runBkitDocs)", () => {
     expect(fs.existsSync(OLD)).toBe(true);
     expect(paths(dry).filter((p) => [LITE, OLD].includes(p))).not.toHaveLength(0);
     const real = run();
+    expect(fs.readFileSync(LITE, "utf-8").split("\n")[0]).toBe(SENTINEL);
     expect(paths(dry)).toEqual(paths(real));
   });
```

## Diff since red — Task 7 `.bkit/core/engine/install/modules/core.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-3-7-3.snapshot b/.bkit/core/engine/install/modules/core.integration.test.ts
index 3a72217bb..1f246ad78 100644
--- a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-3-7-3.snapshot
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -1259,6 +1259,7 @@ describe("migrateRetiredLite (via runBkitDocs)", () => {
     put(LITE, `${BLOCK}\n## Project Lite Workflows\n\n${OWN}\n`);
     run();
     const stub = fs.readFileSync(LITE, "utf-8");
+    expect(stub.split("\n")[0]).toBe(SENTINEL);
     const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
     const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
     const again = run();
@@ -1273,6 +1274,7 @@ describe("migrateRetiredLite (via runBkitDocs)", () => {
     put(OLD, `${SHORTCUTS_BLOCK}\n## Project Shortcuts\n\n${OWN_OLD}\n`);
     run();
     const after = fs.readFileSync(LITE, "utf-8");
+    expect(after.split("\n")[0]).toBe(SENTINEL);
     const again = run();
     expect(fs.readFileSync(LITE, "utf-8")).toBe(after);
     expect(paths(again)).not.toContain(OLD);
@@ -1288,6 +1290,7 @@ describe("migrateRetiredLite (via runBkitDocs)", () => {
     expect(fs.existsSync(OLD)).toBe(true);
     expect(paths(dry).filter((p) => [LITE, OLD].includes(p))).not.toHaveLength(0);
     const real = run();
+    expect(fs.readFileSync(LITE, "utf-8").split("\n")[0]).toBe(SENTINEL);
     expect(paths(dry)).toEqual(paths(real));
   });
```

## Diff since red — Task 7 `.bkit/core/engine/install/modules/core.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-3-7-4.snapshot b/.bkit/core/engine/install/modules/core.integration.test.ts
index 3a72217bb..1f246ad78 100644
--- a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-3-7-4.snapshot
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -1259,6 +1259,7 @@ describe("migrateRetiredLite (via runBkitDocs)", () => {
     put(LITE, `${BLOCK}\n## Project Lite Workflows\n\n${OWN}\n`);
     run();
     const stub = fs.readFileSync(LITE, "utf-8");
+    expect(stub.split("\n")[0]).toBe(SENTINEL);
     const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
     const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
     const again = run();
@@ -1273,6 +1274,7 @@ describe("migrateRetiredLite (via runBkitDocs)", () => {
     put(OLD, `${SHORTCUTS_BLOCK}\n## Project Shortcuts\n\n${OWN_OLD}\n`);
     run();
     const after = fs.readFileSync(LITE, "utf-8");
+    expect(after.split("\n")[0]).toBe(SENTINEL);
     const again = run();
     expect(fs.readFileSync(LITE, "utf-8")).toBe(after);
     expect(paths(again)).not.toContain(OLD);
@@ -1288,6 +1290,7 @@ describe("migrateRetiredLite (via runBkitDocs)", () => {
     expect(fs.existsSync(OLD)).toBe(true);
     expect(paths(dry).filter((p) => [LITE, OLD].includes(p))).not.toHaveLength(0);
     const real = run();
+    expect(fs.readFileSync(LITE, "utf-8").split("\n")[0]).toBe(SENTINEL);
     expect(paths(dry)).toEqual(paths(real));
   });
```

## Diff since red — Task 7 `.bkit/core/engine/install/modules/core.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-3-7-5.snapshot b/.bkit/core/engine/install/modules/core.integration.test.ts
index 3a72217bb..1f246ad78 100644
--- a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-3-7-5.snapshot
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -1259,6 +1259,7 @@ describe("migrateRetiredLite (via runBkitDocs)", () => {
     put(LITE, `${BLOCK}\n## Project Lite Workflows\n\n${OWN}\n`);
     run();
     const stub = fs.readFileSync(LITE, "utf-8");
+    expect(stub.split("\n")[0]).toBe(SENTINEL);
     const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
     const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
     const again = run();
@@ -1273,6 +1274,7 @@ describe("migrateRetiredLite (via runBkitDocs)", () => {
     put(OLD, `${SHORTCUTS_BLOCK}\n## Project Shortcuts\n\n${OWN_OLD}\n`);
     run();
     const after = fs.readFileSync(LITE, "utf-8");
+    expect(after.split("\n")[0]).toBe(SENTINEL);
     const again = run();
     expect(fs.readFileSync(LITE, "utf-8")).toBe(after);
     expect(paths(again)).not.toContain(OLD);
@@ -1288,6 +1290,7 @@ describe("migrateRetiredLite (via runBkitDocs)", () => {
     expect(fs.existsSync(OLD)).toBe(true);
     expect(paths(dry).filter((p) => [LITE, OLD].includes(p))).not.toHaveLength(0);
     const real = run();
+    expect(fs.readFileSync(LITE, "utf-8").split("\n")[0]).toBe(SENTINEL);
     expect(paths(dry)).toEqual(paths(real));
   });
```

## Diff since red — Task 7 `.bkit/core/engine/install/modules/core.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-3-7-9.snapshot b/.bkit/core/engine/install/modules/core.integration.test.ts
index 3a72217bb..1f246ad78 100644
--- a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-3-7-9.snapshot
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -1259,6 +1259,7 @@ describe("migrateRetiredLite (via runBkitDocs)", () => {
     put(LITE, `${BLOCK}\n## Project Lite Workflows\n\n${OWN}\n`);
     run();
     const stub = fs.readFileSync(LITE, "utf-8");
+    expect(stub.split("\n")[0]).toBe(SENTINEL);
     const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
     const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
     const again = run();
@@ -1273,6 +1274,7 @@ describe("migrateRetiredLite (via runBkitDocs)", () => {
     put(OLD, `${SHORTCUTS_BLOCK}\n## Project Shortcuts\n\n${OWN_OLD}\n`);
     run();
     const after = fs.readFileSync(LITE, "utf-8");
+    expect(after.split("\n")[0]).toBe(SENTINEL);
     const again = run();
     expect(fs.readFileSync(LITE, "utf-8")).toBe(after);
     expect(paths(again)).not.toContain(OLD);
@@ -1288,6 +1290,7 @@ describe("migrateRetiredLite (via runBkitDocs)", () => {
     expect(fs.existsSync(OLD)).toBe(true);
     expect(paths(dry).filter((p) => [LITE, OLD].includes(p))).not.toHaveLength(0);
     const real = run();
+    expect(fs.readFileSync(LITE, "utf-8").split("\n")[0]).toBe(SENTINEL);
     expect(paths(dry)).toEqual(paths(real));
   });
```

## Diff since red — Task 7 `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-3-7-10.snapshot b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
index e3c046f5c..fb90538b7 100644
--- a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-3-7-10.snapshot
+++ b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
@@ -2016,13 +2016,18 @@ describe("#715 — upgrade retires a 5.2.4 .bkit/lite.md", () => {
     return spawnSync(requireTsx(), [bkitInstallPath, ...args], {
       cwd: tmpDir,
       encoding: "utf-8",
-      env: { ...process.env, NODE_NO_WARNINGS: "1" },
+      env: {
+        ...process.env,
+        NODE_NO_WARNINGS: "1",
+        GIT_DIR: path.join(tmpDir, ".git"),
+        GIT_WORK_TREE: tmpDir,
+      },
       timeout: 90_000,
     });
   }
 
   it("upgrade from a 5.2.4 lite.md keeps the consumer section", () => {
-    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
+    expect(spawnSync("git", ["init", "-q"], { cwd: tmpDir }).status).toBe(0);
     fs.writeFileSync(
       path.join(tmpDir, "package.json"),
       JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
```
