diff --git a/.bkit/core/engine/install/modules/core.integration.test.ts b/.bkit/core/engine/install/modules/core.integration.test.ts
index 0ea53dfc9..d6eee37aa 100644
--- a/.bkit/core/engine/install/modules/core.integration.test.ts
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -182,6 +182,71 @@ describe("slop plugin migration", () => {
   });
 });
 
+describe("machine-lock copy migration", () => {
+  const lock = "scripts/ci/bkit-machine-lock.sh";
+  const template = ".bkit/templates/scripts/ci/bkit-machine-lock.sh";
+  const shipped = fs.readFileSync(
+    path.join(getPkgRoot(), "tests/fixtures/machine-lock/machine-lock-6.1.1.sh"),
+  );
+  const currentLock = fs.readFileSync(
+    path.join(getTemplatesRoot(), "scripts/ci/bkit-machine-lock.sh"),
+  );
+
+  function seed(content: string | Buffer = shipped): void {
+    fs.mkdirSync(path.dirname(lock), { recursive: true });
+    fs.writeFileSync(lock, content);
+  }
+
+  function migrate(dryRun = false): WriteSet {
+    const ctx = makeCtx({ dryRun });
+    runBkitDocs(dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
+    return { writes: ctx.ws.writes.filter((w) => w.path === lock) };
+  }
+
+  it("replaces a shipped 6.1.1 machine-lock copy and records the same unhashed write in dry run", () => {
+    seed();
+    const dry = migrate(true);
+    expect(fs.readFileSync(lock)).toEqual(shipped);
+    expect(dry.writes).toEqual([{ path: lock, action: "update", unhashed: true }]);
+    expect(migrate()).toEqual(dry);
+    expect(fs.readFileSync(lock)).toEqual(currentLock);
+    expect(migrate().writes).toEqual([]);
+  });
+
+  it("preserves an edited machine-lock copy without the queue and reports the template to merge by hand", () => {
+    const custom = Buffer.concat([shipped, Buffer.from("\n# consumer customization\n")]);
+    seed(custom);
+    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
+    try {
+      expect(migrate().writes).toEqual([]);
+      expect(fs.readFileSync(lock)).toEqual(custom);
+      expect(warn).toHaveBeenCalledWith(expect.stringContaining(template));
+      expect(warn).toHaveBeenCalledWith(expect.stringContaining("by hand"));
+      expect(warn).toHaveBeenCalledWith(expect.stringContaining("out of arrival order"));
+    } finally {
+      warn.mockRestore();
+    }
+  });
+
+  it("leaves a symlinked machine-lock copy unchanged and reports the template to merge by hand", () => {
+    fs.mkdirSync("owned", { recursive: true });
+    const target = path.resolve("owned/bkit-machine-lock.sh");
+    fs.writeFileSync(target, shipped);
+    fs.mkdirSync("scripts/ci", { recursive: true });
+    fs.symlinkSync(target, lock);
+    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
+    try {
+      expect(migrate().writes).toEqual([]);
+      expect(fs.readFileSync(target)).toEqual(shipped);
+      expect(fs.lstatSync(lock).isSymbolicLink()).toBe(true);
+      expect(warn).toHaveBeenCalledWith(expect.stringContaining(template));
+      expect(warn).toHaveBeenCalledWith(expect.stringContaining("by hand"));
+    } finally {
+      warn.mockRestore();
+    }
+  });
+});
+
 describe("bkit canonical docs pass (runBkitDocs, #218)", () => {
   // The package's canonical docs source (getBkitDocsRoot) — what runBkitDocs copies from.
   const PKG_DOCS_ROOT = getBkitDocsRoot();
diff --git a/.bkit/core/engine/install/modules/core.ts b/.bkit/core/engine/install/modules/core.ts
index 8a78479c4..833d6c755 100644
--- a/.bkit/core/engine/install/modules/core.ts
+++ b/.bkit/core/engine/install/modules/core.ts
@@ -342,6 +342,7 @@ export function runBkitDocs(
   migrateTemplateNotes(dryRun, ws, logPrefix);
   migrateContextCiWorkflow(dryRun, ws, logPrefix);
   migrateSlopTypeSuppression(dryRun, ws, logPrefix);
+  migrateMachineLockCopy(dryRun, ws, logPrefix);
   const renames = migrateBrandedTemplateFiles(dryRun, ws, logPrefix);
   migrateBrandedFileTokens(dryRun, ws, logPrefix, renames);
   migrateBrandedCheckNames(dryRun, ws, logPrefix, tokens.DEFAULT_BRANCH);
@@ -816,6 +817,45 @@ function migrateSlopTypeSuppression(dryRun: boolean, ws: WriteSet, logPrefix: st
   console.log(`${logPrefix} ${tag}core: ${file} — slop plugin updated`);
 }
 
+// sha256 of every released scripts/ci/bkit-machine-lock.sh text without the arrival-order queue (6.1.0, 6.1.1).
+const SHIPPED_MACHINE_LOCK_HASHES: readonly string[] = [
+  "63ee5873795fd06b60e1f13c238c9e3c44d9f6dc76a50fe271793de6ad284e87",
+];
+
+// Migration (6.1.0-6.1.x installs, docs/migrations.md): replace an unedited adopted machine-lock
+// copy with the queued template; warn about an edited copy that still lacks the queue.
+function migrateMachineLockCopy(dryRun: boolean, ws: WriteSet, logPrefix: string): void {
+  const file = path.join("scripts", "ci", "bkit-machine-lock.sh");
+  const stat = fs.lstatSync(file, { throwIfNoEntry: false });
+  if (!stat) return;
+  const tag = dryRun ? "[dry-run] " : "";
+  const templatePath = ".bkit/templates/scripts/ci/bkit-machine-lock.sh";
+  const manual = (reason: string): void => {
+    console.warn(
+      `${logPrefix} ${tag}core: ${file} left unchanged (${reason}); merge ${templatePath} by hand, until then waiting runs take the lock out of arrival order`,
+    );
+  };
+  if (linkedPath(file) || !stat.isFile()) {
+    manual("the path is not a regular file or sits under a symlink");
+    return;
+  }
+  const current = fs.readFileSync(file);
+  const template = fs.readFileSync(
+    path.join(getTemplatesRoot(), "scripts", "ci", "bkit-machine-lock.sh"),
+  );
+  if (current.equals(template)) return;
+  if (SHIPPED_MACHINE_LOCK_HASHES.includes(sha256(current))) {
+    if (!dryRun) fs.writeFileSync(file, template);
+    ws.writes.push({ path: file, action: "update", unhashed: true });
+    console.log(
+      `${logPrefix} ${tag}core: ${file} — machine lock now serves waiting runs in arrival order`,
+    );
+    return;
+  }
+  if (!current.toString("utf8").includes(".queue"))
+    manual("the copy differs from the shipped version");
+}
+
 // Every `.github/workflows/*.yml` / `*.yaml` regular file outside `skip`.
 function otherWorkflows(skip: readonly string[]): string[] {
   const dir = path.join(".github", "workflows");
diff --git a/dist/install/modules/core.js b/dist/install/modules/core.js
index 8daf586d3..b71692cd0 100644
--- a/dist/install/modules/core.js
+++ b/dist/install/modules/core.js
@@ -259,6 +259,7 @@ export function runBkitDocs(dryRun, tokens, ws, logPrefix) {
     migrateTemplateNotes(dryRun, ws, logPrefix);
     migrateContextCiWorkflow(dryRun, ws, logPrefix);
     migrateSlopTypeSuppression(dryRun, ws, logPrefix);
+    migrateMachineLockCopy(dryRun, ws, logPrefix);
     const renames = migrateBrandedTemplateFiles(dryRun, ws, logPrefix);
     migrateBrandedFileTokens(dryRun, ws, logPrefix, renames);
     migrateBrandedCheckNames(dryRun, ws, logPrefix, tokens.DEFAULT_BRANCH);
@@ -692,6 +693,40 @@ function migrateSlopTypeSuppression(dryRun, ws, logPrefix) {
     ws.writes.push({ path: file, action: "update", unhashed: true });
     console.log(`${logPrefix} ${tag}core: ${file} — slop plugin updated`);
 }
+// sha256 of every released scripts/ci/bkit-machine-lock.sh text without the arrival-order queue (6.1.0, 6.1.1).
+const SHIPPED_MACHINE_LOCK_HASHES = [
+    "63ee5873795fd06b60e1f13c238c9e3c44d9f6dc76a50fe271793de6ad284e87",
+];
+// Migration (6.1.0-6.1.x installs, docs/migrations.md): replace an unedited adopted machine-lock
+// copy with the queued template; warn about an edited copy that still lacks the queue.
+function migrateMachineLockCopy(dryRun, ws, logPrefix) {
+    const file = path.join("scripts", "ci", "bkit-machine-lock.sh");
+    const stat = fs.lstatSync(file, { throwIfNoEntry: false });
+    if (!stat)
+        return;
+    const tag = dryRun ? "[dry-run] " : "";
+    const templatePath = ".bkit/templates/scripts/ci/bkit-machine-lock.sh";
+    const manual = (reason) => {
+        console.warn(`${logPrefix} ${tag}core: ${file} left unchanged (${reason}); merge ${templatePath} by hand, until then waiting runs take the lock out of arrival order`);
+    };
+    if (linkedPath(file) || !stat.isFile()) {
+        manual("the path is not a regular file or sits under a symlink");
+        return;
+    }
+    const current = fs.readFileSync(file);
+    const template = fs.readFileSync(path.join(getTemplatesRoot(), "scripts", "ci", "bkit-machine-lock.sh"));
+    if (current.equals(template))
+        return;
+    if (SHIPPED_MACHINE_LOCK_HASHES.includes(sha256(current))) {
+        if (!dryRun)
+            fs.writeFileSync(file, template);
+        ws.writes.push({ path: file, action: "update", unhashed: true });
+        console.log(`${logPrefix} ${tag}core: ${file} — machine lock now serves waiting runs in arrival order`);
+        return;
+    }
+    if (!current.toString("utf8").includes(".queue"))
+        manual("the copy differs from the shipped version");
+}
 // Every `.github/workflows/*.yml` / `*.yaml` regular file outside `skip`.
 function otherWorkflows(skip) {
     const dir = path.join(".github", "workflows");
diff --git a/docs/migrations.md b/docs/migrations.md
index 7e914d132..1e41221aa 100644
--- a/docs/migrations.md
+++ b/docs/migrations.md
@@ -35,6 +35,7 @@
 | Branded script names | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedScriptNames`, `BKIT_SCRIPT_RENAMES`, called by `seedCorePackageJsonScripts` before `ensurePackageJsonScripts`) | `package.json` scripts `lint:prose`, `slop:delta`, `graph` and `graph:{check,clean,graphml,refresh,rollup,scoped,tree,update}` → `bkit:` + the same name; the old key is deleted and the old token in other script values and default gate chains is rewritten. A pair whose old and new keys both exist is left as it is with a warning; a `graph*` script whose value is not bkit's (`scripts/graphify/bkit-`) is the consumer's own and stays. Original indent kept. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 | Branded script tokens in hooks and CI | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedFileTokens`, called by `runBkitDocs`) | `pnpm lint:prose`, `pnpm slop:delta` and `pnpm graph*` tokens in `.husky/pre-commit`, `.husky/pre-push` and the `bkit.testing.ciWorkflow` file → the `bkit:` names, for the pairs the package.json migration acts on. A name it cannot reach (e.g. `pnpm --filter web lint:prose`) is warned with file and line. Every other `.github/workflows/*.yml` / `*.yaml` file is scanned for an old name and warned with file and line, never written. Diagnostics recognize package-manager invocations, including quoted YAML run scalars and `npm run-script`, while excluding prose and shell comments. Files are rewritten in place and recorded as `unhashed` writes, so `canonicalHashes` never holds them. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 | Branded CI script files | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedTemplateFiles`, `SHIPPED_CI_SCRIPT_HASHES`, called by `runBkitDocs` before `migrateBrandedFileTokens`) | A unit under `scripts/ci/` (`check-capstone`, `check-dependency-audit` + `accepted-advisories.json`, `check-accepted-divergences` + `accepted-divergences.json`, `lanes/resolve-push-base`, with their `.test.mjs`) whose `.mjs` files all match a shipped release and whose `bkit-` targets are absent moves to the `bkit-` names; every `scripts/ci/<old>` path in the hooks, the CI workflow, `bkit-trivy.yml` and package.json scripts is rewritten. An edited unit, an existing target, a unit whose old path a workflow outside the path pass or a composite action (`.github/actions/**/action.yml`) still names, or a source, target or directory that is a symlink is left with a warning naming the manual move. Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
+| Machine-lock copies without the queue | `.bkit/core/engine/install/modules/core.ts` (`migrateMachineLockCopy`, `SHIPPED_MACHINE_LOCK_HASHES`, called by `runBkitDocs`) | `scripts/ci/bkit-machine-lock.sh`: absent or equal to the template is silent; not a regular file or under a symlink is left with a warning naming `.bkit/templates/scripts/ci/bkit-machine-lock.sh` to merge by hand; a copy byte-identical to a shipped release without the queue is replaced with the template (unhashed write, one `core:` line); any other copy whose text has no `.queue` is left with a warning that waiting runs take the lock out of arrival order until merged by hand. | 6.1.0-6.1.x | `.bkit/core/engine/install/modules/core.integration.test.ts` |
 | Branded check names | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedCheckNames`, called by `runBkitDocs`) | Exact shipped old `name:` lines in `.github/workflows/bkit-cloud.yml` (`context`, `claude`, `opencode` jobs), `bkit-renovate.yml` (`Renovate`) and `bkit-trivy.yml` (`Trivy`) → `bkit-*`; a job `name:` is inserted under `renovate:` / `trivy:` when the workflow name was rewritten and the job has none (comment lines at job-key indent do not end the job block; a result with two job `name:` lines is not written and logs a warning naming the manual rename); the old `bkit-stub:health` block in the `bkit.testing.ciWorkflow` file → the current block. A customised line stays. One log line per renamed check names old and new and says to update branch protection. Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 | Vale style `House` → `Bkit` | `.bkit/core/engine/install/modules/core.ts` (`migrateValeHouseStyle`, `SHIPPED_HOUSE_RULE_HASHES`, called by `runBkitDocs`) | `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml` matching a shipped release move to `.vale/styles/Bkit/` when absent; an edited rule, a taken target or a symlinked rule stays with a warning naming the manual move; a symlinked `.vale`, `.vale/styles`, `House` or `Bkit` directory leaves the rules unmoved with a warning. `.vale.ini` `House.<moved>` → `Bkit.<moved>`; `BasedOnStyles` swaps `House` for `Bkit` once `House/` is empty (directory removed), else appends `Bkit`. Own rules stay, including an own entry named like a moved rule without `.yml` (a `Filler/` folder). Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 | Slop plugin ignores inert skip text | `.bkit/core/engine/install/modules/core.ts` (`migrateSlopTypeSuppression`, `RETIRED_SLOP_PLUGIN_HASH`, called by `runBkitDocs`) | `scripts/slop/bkit-slop-type-suppression.mjs` byte-identical to the shipped v6.0.0 template → replaced with the current template. An edited copy, a non-file or a symlinked path stays with a warning to merge `.bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs` by hand. An absent or current copy stays untouched. Dry run records the same update without writing; `unhashed` keeps the copy consumer-owned. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` (fixture `tests/fixtures/slop-6.0.0/`) |
