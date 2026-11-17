diff --git a/.bkit/core/engine/commands/install/upgrade.integration.test.ts b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
index 7e4b623b7..1b1b288d6 100644
--- a/.bkit/core/engine/commands/install/upgrade.integration.test.ts
+++ b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
@@ -2392,3 +2392,78 @@ describe("#892 — upgrade replaces the old sample config names", () => {
     expect(runCli(["check"]).status).toBe(0);
   });
 });
+
+describe("#892 — upgrade copies the lint-staged sample to the root", () => {
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
+  /** A consumer holding the old sample, gating format on lint-staged, with no root lint-staged config. */
+  function seedOldLintStagedConsumer(): void {
+    expect(spawnSync("git", ["init", "-q"], { cwd: tmpDir }).status).toBe(0);
+    fs.writeFileSync(
+      path.join(tmpDir, "package.json"),
+      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
+      "utf-8",
+    );
+    expect(runCli(["install", "--claude", "--tracker=github"]).status).toBe(0);
+
+    fs.writeFileSync(
+      path.join(tmpDir, "package.json"),
+      JSON.stringify(
+        {
+          name: "consumer",
+          version: "0.0.0",
+          scripts: { "bkit:gate:format": "pnpm lint-staged" },
+        },
+        null,
+        2,
+      ) + "\n",
+      "utf-8",
+    );
+    const templates = path.join(tmpDir, ".bkit", "templates");
+    fs.writeFileSync(path.join(templates, ".lintstagedrc.json"), "{}\n", "utf-8");
+    fs.rmSync(path.join(templates, "lintstagedrc.example.json"), { force: true });
+    fs.rmSync(path.join(tmpDir, ".lintstagedrc.json"), { force: true });
+  }
+
+  it("upgrade copies the lint-staged sample to the root when the format gate runs lint-staged with no root config", () => {
+    seedOldLintStagedConsumer();
+
+    const up = runCli(["upgrade", "--auto-apply"]);
+    expect(up.status, combinedOutput(up)).toBe(0);
+
+    const rootConfig = path.join(tmpDir, ".lintstagedrc.json");
+    expect(fs.existsSync(rootConfig)).toBe(true);
+    const shipped = path.join(tmpDir, ".bkit", "templates", "lintstagedrc.example.json");
+    expect(fs.readFileSync(rootConfig, "utf-8")).toBe(fs.readFileSync(shipped, "utf-8"));
+    expect(combinedOutput(up)).toMatch(/(?<![\w./-])\.lintstagedrc\.json/);
+  });
+
+  it("upgrade dry run reports the lint-staged config copy without writing it", () => {
+    seedOldLintStagedConsumer();
+
+    const dry = runCli(["upgrade", "--dry-run"]);
+    expect(dry.status, combinedOutput(dry)).toBe(0);
+
+    // A root-level name only: the pruned `.bkit/templates/.lintstagedrc.json` line must not satisfy it.
+    expect(combinedOutput(dry)).toMatch(/(?<![\w./-])\.lintstagedrc\.json/);
+    // The copy is a dry-run write line of its own, naming the root file: a `removed:` or `added:`
+    // template line, or any line that only mentions the file, does not count.
+    expect(combinedOutput(dry)).toMatch(
+      /\[dry-run\][^\n]*(?<![\w./-])\.lintstagedrc\.json[ \t]*(?:\n|$)/,
+    );
+    expect(fs.existsSync(path.join(tmpDir, ".lintstagedrc.json"))).toBe(false);
+  });
+});
diff --git a/.bkit/core/engine/commands/install/upgrade.ts b/.bkit/core/engine/commands/install/upgrade.ts
index 0149a5f2f..2b23ec12c 100644
--- a/.bkit/core/engine/commands/install/upgrade.ts
+++ b/.bkit/core/engine/commands/install/upgrade.ts
@@ -70,7 +70,11 @@ import {
   writeCursorCloudDoc,
   writeCursorCliPermissionsArtifact,
 } from "../../install/cloud-env.js";
-import { syncTemplateCopies, formatTemplateChanges } from "../../install/template-copies.js";
+import {
+  migrateLintStagedSample,
+  syncTemplateCopies,
+  formatTemplateChanges,
+} from "../../install/template-copies.js";
 import { formatPayloadLinkChanges, syncPayloadLinks } from "../../install/payload-links.js";
 import { renderOpencodeJson, reconcileOpencodeJson } from "../../install/modules/opencode.js";
 import { type ModuleContext, renderManagedOutputs } from "../../install/modules/index.js";
@@ -807,6 +811,11 @@ export async function runUpgradeCommand(upgradeFlags: UpgradeFlags): Promise<voi
   // Refresh the consumer's `.bkit/templates/` copies and name what changed. The
   // list is computed before overwriting, so it is exactly the package's template
   // diff. The copies carry no hash, so nothing here feeds `.bkit/version`.
+  migrateLintStagedSample(process.cwd(), {
+    dryRun: upgradeFlags.dryRun,
+    ws: { writes: [] },
+    logPrefix: LOG_PREFIX,
+  });
   const templateChanges = syncTemplateCopies(process.cwd(), {
     dryRun: upgradeFlags.dryRun,
     ws: { writes: [] },
diff --git a/.bkit/core/engine/install/modules/core.ts b/.bkit/core/engine/install/modules/core.ts
index 9bbc4bc92..848e03eab 100644
--- a/.bkit/core/engine/install/modules/core.ts
+++ b/.bkit/core/engine/install/modules/core.ts
@@ -19,7 +19,11 @@ import {
   stripManagedBlock,
 } from "../managed-block.js";
 import type { TokenMap } from "../placeholders.js";
-import { listFilesRecursive, syncTemplateCopies } from "../template-copies.js";
+import {
+  listFilesRecursive,
+  migrateLintStagedSample,
+  syncTemplateCopies,
+} from "../template-copies.js";
 import { PAYLOAD_LINK_RELPATHS, syncPayloadLinks } from "../payload-links.js";
 import { writeNetworkAllowlist } from "../network-allowlist.js";
 import { migrateContextCiWorkflow } from "../context-ci-workflow.js";
@@ -1887,6 +1891,7 @@ export function runCoreModule(ctx: ModuleContext): void {
   // 3b2. Template copies — the whole templates root into the consumer's
   // `.bkit/templates/` (never applied to the repo; no-op in dogfood).
   console.log(`${logPrefix} ${tag}Running template copies pass`);
+  migrateLintStagedSample(cwd, { dryRun, ws, logPrefix });
   const templateChanges = syncTemplateCopies(cwd, { dryRun, ws });
   for (const [verb, paths] of Object.entries(templateChanges)) {
     for (const p of paths) {
diff --git a/.bkit/core/engine/install/template-copies.ts b/.bkit/core/engine/install/template-copies.ts
index 5f4e370d8..d4e547ce4 100644
--- a/.bkit/core/engine/install/template-copies.ts
+++ b/.bkit/core/engine/install/template-copies.ts
@@ -9,6 +9,8 @@ import {
   getTemplatesRoot,
   TEMPLATE_COPIES_DIR,
 } from "../shared/package-roots.js";
+import { hasLintStagedConfig } from "../checks/tips/detect.js";
+import { readPackageJson } from "../shared/package-json.js";
 import type { WriteSet } from "./write.js";
 
 export function listFilesRecursive(dir: string): string[] {
@@ -135,3 +137,34 @@ export function formatTemplateChanges(changes: TemplateCopyChanges): string {
     TEMPLATES_POINTER,
   ].join("\n");
 }
+
+const OLD_LINT_STAGED_SAMPLE = ".lintstagedrc.json";
+const LINT_STAGED_SAMPLE = "lintstagedrc.example.json";
+
+// Migration (installs up to 6.1.x, `docs/migrations.md`): until the sample rename, lint-staged
+// found `.bkit/templates/.lintstagedrc.json` as its config in a repo with none at the root. The
+// sync prunes that file, so a consumer holding it, gating format on `lint-staged` and with no
+// lint-staged config of its own gets the shipped sample copied to `.lintstagedrc.json` first.
+// Idempotent (a root config, once written, ends the trigger); dry-run pushes the same write
+// without touching disk. Returns true when it copied. Call before `syncTemplateCopies`.
+export function migrateLintStagedSample(
+  cwd: string,
+  opts: { dryRun: boolean; ws: WriteSet; logPrefix: string },
+): boolean {
+  if (path.resolve(cwd) === getPkgRoot()) return false;
+  if (!fs.existsSync(path.join(cwd, TEMPLATE_COPIES_DIR, OLD_LINT_STAGED_SAMPLE))) return false;
+  const src = path.join(getTemplatesRoot(), LINT_STAGED_SAMPLE);
+  if (!fs.existsSync(src)) return false;
+  const pkg = readPackageJson(cwd);
+  const gate = pkg.ok ? (pkg.pkg.scripts as Record<string, unknown> | undefined) : undefined;
+  const format = gate?.["bkit:gate:format"];
+  if (typeof format !== "string" || !/\blint-staged\b/.test(format)) return false;
+  if (hasLintStagedConfig(cwd)) return false;
+  const tag = opts.dryRun ? "[dry-run] " : "";
+  if (!opts.dryRun) fs.copyFileSync(src, path.join(cwd, ".lintstagedrc.json"));
+  opts.ws.writes.push({ path: ".lintstagedrc.json", action: "write" });
+  console.log(
+    `${opts.logPrefix} ${tag}lint-staged config copied from the sample: .lintstagedrc.json`,
+  );
+  return true;
+}
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index cc1e3ce9b..4add1e09c 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -95,3 +95,4 @@
 {"schema":3,"ts":1794127027655,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":5,"lastConfirmed":1794127027655}
 {"schema":3,"ts":1794144058047,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":6,"lastConfirmed":1794144058047}
 {"schema":3,"ts":1794172129256,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":7,"lastConfirmed":1794172129256}
+{"schema":3,"ts":1794202894125,"kind":"friction","key":"build-decision/challenge-fix-now-direction-unseen","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-decision"},"category":"agent-rework","scope":"bkit-repo","severity":"MEDIUM","summary":"A Fix now answer on a challenge task never reaches the Step 7 agents","description":"Decision Pause step 5 runs a challenge task 'as it is', but neither @bkit-build-plan-tests nor @bkit-build-plan-tasks reads build-decision-*.md, and the Owner decisions rule forbids restating the answer in Context. A Fixable: false task that offers the owner several fixes therefore runs with the reviewer's default TEST FIRST. Seen on 892-template-copies-bkit: the owner chose a migration, the task's test asserted an advisory. The orchestrator rewrote task 4 at the pause, with the owner's approval.","source":"orchestrator","status":"OPEN"}
diff --git a/dist/commands/install/upgrade.js b/dist/commands/install/upgrade.js
index da1242e62..f662751d9 100644
--- a/dist/commands/install/upgrade.js
+++ b/dist/commands/install/upgrade.js
@@ -38,7 +38,7 @@ import { detectInstalledHostModules } from "../../install/hosts.js";
 import { detectInstalledModules } from "./check.js";
 import { remapTemplateDest } from "../../install/template-copies.js";
 import { CLAUDE_CLOUD_RELPATH, CODEX_CLOUD_RELPATH, CURSOR_CLOUD_RELPATH, writeClaudeCloudDoc, writeCodexCloudDoc, writeCursorCloudDoc, writeCursorCliPermissionsArtifact, } from "../../install/cloud-env.js";
-import { syncTemplateCopies, formatTemplateChanges } from "../../install/template-copies.js";
+import { migrateLintStagedSample, syncTemplateCopies, formatTemplateChanges, } from "../../install/template-copies.js";
 import { formatPayloadLinkChanges, syncPayloadLinks } from "../../install/payload-links.js";
 import { renderOpencodeJson, reconcileOpencodeJson } from "../../install/modules/opencode.js";
 import { renderManagedOutputs } from "../../install/modules/index.js";
@@ -576,6 +576,11 @@ export async function runUpgradeCommand(upgradeFlags) {
     // Refresh the consumer's `.bkit/templates/` copies and name what changed. The
     // list is computed before overwriting, so it is exactly the package's template
     // diff. The copies carry no hash, so nothing here feeds `.bkit/version`.
+    migrateLintStagedSample(process.cwd(), {
+        dryRun: upgradeFlags.dryRun,
+        ws: { writes: [] },
+        logPrefix: LOG_PREFIX,
+    });
     const templateChanges = syncTemplateCopies(process.cwd(), {
         dryRun: upgradeFlags.dryRun,
         ws: { writes: [] },
diff --git a/dist/install/modules/core.js b/dist/install/modules/core.js
index 8bb584f0e..8773afc31 100644
--- a/dist/install/modules/core.js
+++ b/dist/install/modules/core.js
@@ -6,7 +6,7 @@ import * as path from "node:path";
 import { writeTier1, writeTier2, ensurePackageJsonScripts } from "../write.js";
 import { readBkitVersion, writeBkitVersion, hashFile, mergeCanonicalHashes, sha256, } from "../version-file.js";
 import { extractManagedBlock, findLineAnchoredMarkers, selectMarkers, stripManagedBlock, } from "../managed-block.js";
-import { listFilesRecursive, syncTemplateCopies } from "../template-copies.js";
+import { listFilesRecursive, migrateLintStagedSample, syncTemplateCopies, } from "../template-copies.js";
 import { PAYLOAD_LINK_RELPATHS, syncPayloadLinks } from "../payload-links.js";
 import { writeNetworkAllowlist } from "../network-allowlist.js";
 import { migrateContextCiWorkflow } from "../context-ci-workflow.js";
@@ -1696,6 +1696,7 @@ export function runCoreModule(ctx) {
     // 3b2. Template copies — the whole templates root into the consumer's
     // `.bkit/templates/` (never applied to the repo; no-op in dogfood).
     console.log(`${logPrefix} ${tag}Running template copies pass`);
+    migrateLintStagedSample(cwd, { dryRun, ws, logPrefix });
     const templateChanges = syncTemplateCopies(cwd, { dryRun, ws });
     for (const [verb, paths] of Object.entries(templateChanges)) {
         for (const p of paths) {
diff --git a/dist/install/template-copies.js b/dist/install/template-copies.js
index 2ee128ba1..1167b42c6 100644
--- a/dist/install/template-copies.js
+++ b/dist/install/template-copies.js
@@ -3,6 +3,8 @@
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { NPM_STRIP_REMAP, getPkgRoot, getTemplatesRoot, TEMPLATE_COPIES_DIR, } from "../shared/package-roots.js";
+import { hasLintStagedConfig } from "../checks/tips/detect.js";
+import { readPackageJson } from "../shared/package-json.js";
 export function listFilesRecursive(dir) {
     if (!fs.existsSync(dir))
         return [];
@@ -119,3 +121,33 @@ export function formatTemplateChanges(changes) {
         TEMPLATES_POINTER,
     ].join("\n");
 }
+const OLD_LINT_STAGED_SAMPLE = ".lintstagedrc.json";
+const LINT_STAGED_SAMPLE = "lintstagedrc.example.json";
+// Migration (installs up to 6.1.x, `docs/migrations.md`): until the sample rename, lint-staged
+// found `.bkit/templates/.lintstagedrc.json` as its config in a repo with none at the root. The
+// sync prunes that file, so a consumer holding it, gating format on `lint-staged` and with no
+// lint-staged config of its own gets the shipped sample copied to `.lintstagedrc.json` first.
+// Idempotent (a root config, once written, ends the trigger); dry-run pushes the same write
+// without touching disk. Returns true when it copied. Call before `syncTemplateCopies`.
+export function migrateLintStagedSample(cwd, opts) {
+    if (path.resolve(cwd) === getPkgRoot())
+        return false;
+    if (!fs.existsSync(path.join(cwd, TEMPLATE_COPIES_DIR, OLD_LINT_STAGED_SAMPLE)))
+        return false;
+    const src = path.join(getTemplatesRoot(), LINT_STAGED_SAMPLE);
+    if (!fs.existsSync(src))
+        return false;
+    const pkg = readPackageJson(cwd);
+    const gate = pkg.ok ? pkg.pkg.scripts : undefined;
+    const format = gate?.["bkit:gate:format"];
+    if (typeof format !== "string" || !/\blint-staged\b/.test(format))
+        return false;
+    if (hasLintStagedConfig(cwd))
+        return false;
+    const tag = opts.dryRun ? "[dry-run] " : "";
+    if (!opts.dryRun)
+        fs.copyFileSync(src, path.join(cwd, ".lintstagedrc.json"));
+    opts.ws.writes.push({ path: ".lintstagedrc.json", action: "write" });
+    console.log(`${opts.logPrefix} ${tag}lint-staged config copied from the sample: .lintstagedrc.json`);
+    return true;
+}
diff --git a/docs/decisions.jsonl b/docs/decisions.jsonl
index c550b7caa..9779d356f 100644
--- a/docs/decisions.jsonl
+++ b/docs/decisions.jsonl
@@ -665,3 +665,4 @@
 {"schema":3,"ts":1794045618703,"firstTs":1794045618703,"updates":1,"kind":"decision","key":"864-project-doc-warning-aggregation","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-generate","subagent":"bkit-plan-generate","model":"gpt-6.1-sol"},"references":["864",".bkit/core/engine/checks/after/index.ts",".bkit/core/engine/commands/workflow/summary.ts"],"summary":"Mechanical adoption advisories and semantic project documentation findings use existing outputs","description":"Install, upgrade, check and doctor use local file-state evidence. Task-specific agents record topic, gap, source and next action. Phase summaries aggregate findings from current-run artifacts by topic and gap without changing workflow verdicts.","rationale":"Local detectors can identify missing and starter-only content, while relevant coverage depends on the task. Existing artifacts preserve evidence and support resumed runs without a second status store.","alternatives":"Use a generic project-doc completeness gate, or add a separate warning ledger.","status":"ACTIVE"}
 {"schema":3,"ts":1794046532487,"firstTs":1794045618703,"updates":2,"kind":"decision","key":"864-project-doc-warning-aggregation","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-apply-review","subagent":"bkit-plan-update","model":"gpt-6.1-sol"},"references":["864",".bkit/core/engine/checks/after/index.ts",".bkit/core/engine/commands/workflow/summary.ts"],"summary":"Mechanical adoption advisories and semantic project documentation findings use existing outputs","description":"Install, upgrade, check and doctor use local file-state evidence. Task-specific agents record warnings as one JSON object per line under Documentation Warnings in their existing report. Each record carries topic, gap, recommendedPath, alternativeEvidence and action. Phase summaries select attributed current-run artifacts and aggregate their valid records by topic and gap without changing workflow verdicts.","rationale":"Local detectors can identify missing and starter-only content, while relevant coverage depends on the task. JSON string escaping gives producers and readers the same record contract, and existing artifacts preserve evidence and support resumed runs without a second status store.","alternatives":"Use a generic project-doc completeness gate, or add a separate warning ledger.","status":"ACTIVE"}
 {"schema":3,"ts":1794171244090,"firstTs":1794171244090,"updates":1,"kind":"decision","key":"892-template-copies-bkit-changed-format-symlink","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-decision"},"references":["892","890","scripts/gate/bkit-gate-changed.mjs",".claude/skills/vitest"],"summary":"892-template-copies-bkit step 10 holistic gap accepted: the changed-files format check fails on the .claude/skills/vitest symlink","description":"bkit tests changed --base=origin/dev passes the symlink .claude/skills/vitest to prettier --check, which exits 2, so the format stage fails. Every other stage passes. The fix (3b341024d, #890) is on local dev but not yet on origin/dev, which this branch was cut from.","rationale":"accepted by owner: A) Accept (no further reason given)","alternatives":"Fix now: repeat the #890 gate-script fix on this branch or drop the symlink. Stop: hand the run over.","status":"ACTIVE"}
+{"schema":3,"ts":1794205008521,"firstTs":1794205008521,"updates":1,"kind":"decision","key":"892-template-copies-bkit-lintstaged-root-migration","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-decision"},"references":["892",".bkit/core/engine/install/template-copies.ts","docs/migrations.md"],"summary":"892-template-copies-bkit: a migration copies the lint-staged sample to the root instead of accepting the break","description":"Owner chose a migration for consumers whose only lint-staged config was .bkit/templates/.lintstagedrc.json. On install or upgrade, when that file exists, bkit:gate:format runs lint-staged and no lint-staged config exists, lintstagedrc.example.json is copied to .lintstagedrc.json before the sync prunes the old sample.","rationale":"owner chose Fix now — B, migration (build-decision-1-2.md): an upgrade must not block every commit for a consumer whose commit check relied on the nested sample","alternatives":"Accept the break and rely on the lint-staged tip; or a warning in bkit upgrade and bkit check that names the missing root config.","status":"ACTIVE"}
diff --git a/docs/migrations.md b/docs/migrations.md
index 0029bb608..ebcffd11b 100644
--- a/docs/migrations.md
+++ b/docs/migrations.md
@@ -38,6 +38,7 @@
 | Branded check names | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedCheckNames`, called by `runBkitDocs`) | Exact shipped old `name:` lines in `.github/workflows/bkit-cloud.yml` (`context`, `claude`, `opencode` jobs), `bkit-renovate.yml` (`Renovate`) and `bkit-trivy.yml` (`Trivy`) → `bkit-*`; a job `name:` is inserted under `renovate:` / `trivy:` when the workflow name was rewritten and the job has none (comment lines at job-key indent do not end the job block; a result with two job `name:` lines is not written and logs a warning naming the manual rename); the old `bkit-stub:health` block in the `bkit.testing.ciWorkflow` file → the current block. A customised line stays. One log line per renamed check names old and new and says to update branch protection. Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 | Vale style `House` → `Bkit` | `.bkit/core/engine/install/modules/core.ts` (`migrateValeHouseStyle`, `SHIPPED_HOUSE_RULE_HASHES`, called by `runBkitDocs`) | `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml` matching a shipped release move to `.vale/styles/Bkit/` when absent; an edited rule, a taken target or a symlinked rule stays with a warning naming the manual move; a symlinked `.vale`, `.vale/styles`, `House` or `Bkit` directory leaves the rules unmoved with a warning. `.vale.ini` `House.<moved>` → `Bkit.<moved>`; `BasedOnStyles` swaps `House` for `Bkit` once `House/` is empty (directory removed), else appends `Bkit`. Own rules stay, including an own entry named like a moved rule without `.yml` (a `Filler/` folder). Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 | Slop plugin ignores inert skip text | `.bkit/core/engine/install/modules/core.ts` (`migrateSlopTypeSuppression`, `RETIRED_SLOP_PLUGIN_HASH`, called by `runBkitDocs`) | `scripts/slop/bkit-slop-type-suppression.mjs` byte-identical to the shipped v6.0.0 template → replaced with the current template. An edited copy, a non-file or a symlinked path stays with a warning to merge `.bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs` by hand. An absent or current copy stays untouched. Dry run records the same update without writing; `unhashed` keeps the copy consumer-owned. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` (fixture `tests/fixtures/slop-6.0.0/`) |
+| Lint-staged sample copied to the root | `.bkit/core/engine/install/template-copies.ts` (`migrateLintStagedSample`, called by `runCoreModule` pass 3b2 and `bkit upgrade` before `syncTemplateCopies`) | `.bkit/templates/.lintstagedrc.json` present (the config lint-staged found until the sample was renamed), `package.json` `scripts["bkit:gate:format"]` runs `lint-staged` and `hasLintStagedConfig` false → `.lintstagedrc.json` written at the repo root with the bytes of `lintstagedrc.example.json`, so the sync pruning the old sample leaves lint-staged a config. Prints one line; dry run reports it without writing. A repo with any lint-staged config, or whose format gate does not run lint-staged, is untouched. | up to 6.1.x | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 
 ## Detect-only guards
 
