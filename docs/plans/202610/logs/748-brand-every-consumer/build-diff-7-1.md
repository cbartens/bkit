diff --git a/.bkit/core/engine/install/modules/core.integration.test.ts b/.bkit/core/engine/install/modules/core.integration.test.ts
index d423c3d9c..0cd2f4eea 100644
--- a/.bkit/core/engine/install/modules/core.integration.test.ts
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -1885,6 +1885,27 @@ describe("migrateBrandedTemplateFiles (via runBkitDocs)", () => {
     expect(out).toContain("check-dependency-audit");
   });
 
+  it("leaves a unit whose old path a composite action still names", () => {
+    put(path.join(CI_DIR, "check-dependency-audit.mjs"), shippedOld("check-dependency-audit.mjs"));
+    put(
+      path.join(CI_DIR, "check-dependency-audit.test.mjs"),
+      shippedOld("check-dependency-audit.test.mjs"),
+    );
+    put(
+      ".github/actions/audit/action.yml",
+      "runs:\n  using: composite\n  steps:\n    - if: hashFiles('scripts/ci/check-dependency-audit.mjs') != ''\n      run: node scripts/ci/check-dependency-audit.mjs\n      shell: bash\n",
+    );
+    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
+    run();
+
+    expect(fs.existsSync(path.join(CI_DIR, "check-dependency-audit.mjs"))).toBe(true);
+    expect(fs.existsSync(path.join(CI_DIR, "check-dependency-audit.test.mjs"))).toBe(true);
+    expect(fs.existsSync(path.join(CI_DIR, "bkit-check-dependency-audit.mjs"))).toBe(false);
+    const out = warn.mock.calls.map((c) => String(c[0])).join("\n");
+    expect(out).toContain(".github/actions/audit/action.yml");
+    expect(out).toContain("check-dependency-audit");
+  });
+
   it("does not write through a dangling bkit- target symlink", () => {
     const outside = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-outside-"));
     try {
@@ -2066,6 +2087,24 @@ describe("migrateBrandedCheckNames (via runBkitDocs)", () => {
     put(path.join(WF, "bkit-trivy.yml"), custom);
     run();
 
+    const after = fs.readFileSync(path.join(WF, "bkit-trivy.yml"), "utf-8");
+    const parsed = parseYaml(after) as { jobs: { trivy: { name?: string } } };
+    expect(parsed.jobs.trivy.name).toBe("our trivy");
+    expect(after.match(/^ {4}name:/gm)).toHaveLength(1);
+  });
+  it("inserts no job name when a job-indent comment sits above the job's own name", () => {
+    const old = shippedAtV6(".github/workflows/bkit-trivy.yml");
+    const custom = old
+      .replace("\n  trivy:\n", "\n  trivy:\n  # owner: security team\n")
+      .replace(
+        "    runs-on: ubuntu-latest # Edit this label in your copy.\n",
+        "    runs-on: ubuntu-latest # Edit this label in your copy.\n    name: our trivy\n",
+      );
+    expect(custom).toContain("  # owner: security team\n");
+    expect(custom).toContain("    name: our trivy\n");
+    put(path.join(WF, "bkit-trivy.yml"), custom);
+    run();
+
     const after = fs.readFileSync(path.join(WF, "bkit-trivy.yml"), "utf-8");
     const parsed = parseYaml(after) as { jobs: { trivy: { name?: string } } };
     expect(parsed.jobs.trivy.name).toBe("our trivy");
diff --git a/.bkit/core/engine/install/modules/core.test.ts b/.bkit/core/engine/install/modules/core.test.ts
index 22b2bfcd1..074f0b3f7 100644
--- a/.bkit/core/engine/install/modules/core.test.ts
+++ b/.bkit/core/engine/install/modules/core.test.ts
@@ -298,4 +298,18 @@ describe("renameScriptTokens", () => {
     }
     expect(renameScriptTokens("pnpm lint:prose", renames)).toBe("pnpm bkit:lint:prose");
   });
+
+  it("renameScriptTokens leaves recursive flag forms alone", () => {
+    for (const call of [
+      "pnpm -r lint:prose",
+      "pnpm --recursive slop:delta",
+      "pnpm -r run graph:update",
+    ]) {
+      expect(renameScriptTokens(call, renames)).toBe(call);
+    }
+    expect(renameScriptTokens("pnpm -w lint:prose", renames)).toBe("pnpm -w bkit:lint:prose");
+    expect(renameScriptTokens("pnpm --workspace-root slop:delta", renames)).toBe(
+      "pnpm --workspace-root bkit:slop:delta",
+    );
+  });
 });
diff --git a/.bkit/core/engine/install/modules/core.ts b/.bkit/core/engine/install/modules/core.ts
index 92c1a96b5..15b07c1d7 100644
--- a/.bkit/core/engine/install/modules/core.ts
+++ b/.bkit/core/engine/install/modules/core.ts
@@ -790,6 +790,20 @@ function otherWorkflows(skip: readonly string[]): string[] {
     .filter((f) => !skipped.has(f) && fs.lstatSync(f).isFile());
 }
 
+// Every regular `action.yml` / `action.yaml` file under `.github/actions/`, at any depth.
+function compositeActions(): string[] {
+  const dir = path.join(".github", "actions");
+  if (!fs.lstatSync(dir, { throwIfNoEntry: false })?.isDirectory()) return [];
+  const walk = (d: string): string[] =>
+    fs.readdirSync(d).flatMap((f) => {
+      const p = path.join(d, f);
+      const st = fs.lstatSync(p);
+      if (st.isDirectory()) return walk(p);
+      return st.isFile() && /^action\.ya?ml$/.test(f) ? [p] : [];
+    });
+  return walk(dir);
+}
+
 function escapeRegExp(text: string): string {
   return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
 }
@@ -797,7 +811,7 @@ function escapeRegExp(text: string): string {
 /**
  * Rewrites `pnpm [flags] [run] [flags] <old>` to the new name, keeping the flags and `run`.
  * Each flag is a value-less `-x` / `--x[=v]` token, except the package selectors (`-F`, `-C`,
- * `--filter`, `--dir`, `--prefix`), which leave the call alone; `<old>` ends at a character outside
+ * `-r`, `--recursive`, `--filter`, `--dir`, `--prefix`), which leave the call alone; `<old>` ends at a character outside
  * `[\w:-]` or at the end of the text. Anything else (`npm run`, `echo`, `--filter web`) stays.
  */
 export function renameScriptTokens(
@@ -807,7 +821,7 @@ export function renameScriptTokens(
   const names = Object.keys(renames).sort((a, b) => b.length - a.length);
   if (names.length === 0) return text;
   const re = new RegExp(
-    `\\bpnpm((?:\\s+(?:run|(?!-(?:F|C|-filter|-dir|-prefix))-{1,2}[\\w-]+(?:=\\S*)?))*)(\\s+)(${names.map(escapeRegExp).join("|")})(?![\\w:-])`,
+    `\\bpnpm((?:\\s+(?:run|(?!-(?:F|C|r|-filter|-dir|-prefix|-recursive))-{1,2}[\\w-]+(?:=\\S*)?))*)(\\s+)(${names.map(escapeRegExp).join("|")})(?![\\w:-])`,
     "g",
   );
   return text.replace(
@@ -1044,10 +1058,10 @@ export function migrateBrandedTemplateFiles(
       );
       continue;
     }
-    const referenced = otherWorkflows([
-      ciWorkflowPath("."),
-      path.join(".github", "workflows", "bkit-trivy.yml"),
-    ]).flatMap((file) => {
+    const referenced = [
+      ...otherWorkflows([ciWorkflowPath("."), path.join(".github", "workflows", "bkit-trivy.yml")]),
+      ...compositeActions(),
+    ].flatMap((file) => {
       const lines = fs.readFileSync(file, "utf-8").split("\n");
       return present.flatMap(([from]) =>
         lines.flatMap((l, i) =>
@@ -1174,11 +1188,21 @@ export function migrateBrandedCheckNames(
     if (jobStart !== null) {
       const bodyStart = jobStart.index + jobStart[0].length;
       const rest = next.slice(bodyStart);
-      const end = rest.search(/^(?: {2}\S|\S)/m);
+      const end = rest.search(/^(?: {2}[^\s#]|[^\s#])/m);
       const body = end === -1 ? rest : rest.slice(0, end);
       if (!/^ {4}name:/m.test(body)) {
         next = `${next.slice(0, bodyStart)}    name: ${newName}\n${next.slice(bodyStart)}`;
       }
+      const after = new RegExp(`^ {2}${escapeRegExp(job)}:[ \\t]*\\n`, "m").exec(next);
+      const afterRest = after === null ? "" : next.slice(after.index + after[0].length);
+      const afterEnd = afterRest.search(/^(?: {2}[^\s#]|[^\s#])/m);
+      const afterBody = afterEnd === -1 ? afterRest : afterRest.slice(0, afterEnd);
+      if ((afterBody.match(/^ {4}name:/gm) ?? []).length > 1) {
+        console.warn(
+          `${logPrefix} ${tag}core: ${target} not renamed (a second job name: would make the workflow invalid YAML); rename by hand: name: ${oldName} -> name: ${newName} and set the ${job} job name: to ${newName}`,
+        );
+        continue;
+      }
     }
     finish(target, text, next, [`${oldName} / ${job} -> ${newName} / ${newName}`]);
   }
diff --git a/dist/install/modules/core.js b/dist/install/modules/core.js
index 744e4279e..4d8b67420 100644
--- a/dist/install/modules/core.js
+++ b/dist/install/modules/core.js
@@ -671,20 +671,34 @@ function otherWorkflows(skip) {
         .map((f) => path.join(dir, f))
         .filter((f) => !skipped.has(f) && fs.lstatSync(f).isFile());
 }
+// Every regular `action.yml` / `action.yaml` file under `.github/actions/`, at any depth.
+function compositeActions() {
+    const dir = path.join(".github", "actions");
+    if (!fs.lstatSync(dir, { throwIfNoEntry: false })?.isDirectory())
+        return [];
+    const walk = (d) => fs.readdirSync(d).flatMap((f) => {
+        const p = path.join(d, f);
+        const st = fs.lstatSync(p);
+        if (st.isDirectory())
+            return walk(p);
+        return st.isFile() && /^action\.ya?ml$/.test(f) ? [p] : [];
+    });
+    return walk(dir);
+}
 function escapeRegExp(text) {
     return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
 }
 /**
  * Rewrites `pnpm [flags] [run] [flags] <old>` to the new name, keeping the flags and `run`.
  * Each flag is a value-less `-x` / `--x[=v]` token, except the package selectors (`-F`, `-C`,
- * `--filter`, `--dir`, `--prefix`), which leave the call alone; `<old>` ends at a character outside
+ * `-r`, `--recursive`, `--filter`, `--dir`, `--prefix`), which leave the call alone; `<old>` ends at a character outside
  * `[\w:-]` or at the end of the text. Anything else (`npm run`, `echo`, `--filter web`) stays.
  */
 export function renameScriptTokens(text, renames) {
     const names = Object.keys(renames).sort((a, b) => b.length - a.length);
     if (names.length === 0)
         return text;
-    const re = new RegExp(`\\bpnpm((?:\\s+(?:run|(?!-(?:F|C|-filter|-dir|-prefix))-{1,2}[\\w-]+(?:=\\S*)?))*)(\\s+)(${names.map(escapeRegExp).join("|")})(?![\\w:-])`, "g");
+    const re = new RegExp(`\\bpnpm((?:\\s+(?:run|(?!-(?:F|C|r|-filter|-dir|-prefix|-recursive))-{1,2}[\\w-]+(?:=\\S*)?))*)(\\s+)(${names.map(escapeRegExp).join("|")})(?![\\w:-])`, "g");
     return text.replace(re, (_m, flags, gap, old) => `pnpm${flags}${gap}${renames[old]}`);
 }
 /** Each old script name still in `text`, with its 1-based line. */
@@ -887,10 +901,10 @@ export function migrateBrandedTemplateFiles(dryRun, ws, logPrefix) {
             console.warn(`${logPrefix} ${tag}core: ${linkedAll.join(", ")} is a symlink (or sits under one); ${present.map(([from]) => from).join(", ")} not moved to the bkit- names; move them by hand and update every reference`);
             continue;
         }
-        const referenced = otherWorkflows([
-            ciWorkflowPath("."),
-            path.join(".github", "workflows", "bkit-trivy.yml"),
-        ]).flatMap((file) => {
+        const referenced = [
+            ...otherWorkflows([ciWorkflowPath("."), path.join(".github", "workflows", "bkit-trivy.yml")]),
+            ...compositeActions(),
+        ].flatMap((file) => {
             const lines = fs.readFileSync(file, "utf-8").split("\n");
             return present.flatMap(([from]) => lines.flatMap((l, i) => new RegExp(`${escapeRegExp(from)}(?![\\w.-])`).test(l)
                 ? [{ file, line: i + 1, from }]
@@ -994,11 +1008,19 @@ export function migrateBrandedCheckNames(dryRun, ws, logPrefix, defaultBranch =
         if (jobStart !== null) {
             const bodyStart = jobStart.index + jobStart[0].length;
             const rest = next.slice(bodyStart);
-            const end = rest.search(/^(?: {2}\S|\S)/m);
+            const end = rest.search(/^(?: {2}[^\s#]|[^\s#])/m);
             const body = end === -1 ? rest : rest.slice(0, end);
             if (!/^ {4}name:/m.test(body)) {
                 next = `${next.slice(0, bodyStart)}    name: ${newName}\n${next.slice(bodyStart)}`;
             }
+            const after = new RegExp(`^ {2}${escapeRegExp(job)}:[ \\t]*\\n`, "m").exec(next);
+            const afterRest = after === null ? "" : next.slice(after.index + after[0].length);
+            const afterEnd = afterRest.search(/^(?: {2}[^\s#]|[^\s#])/m);
+            const afterBody = afterEnd === -1 ? afterRest : afterRest.slice(0, afterEnd);
+            if ((afterBody.match(/^ {4}name:/gm) ?? []).length > 1) {
+                console.warn(`${logPrefix} ${tag}core: ${target} not renamed (a second job name: would make the workflow invalid YAML); rename by hand: name: ${oldName} -> name: ${newName} and set the ${job} job name: to ${newName}`);
+                continue;
+            }
         }
         finish(target, text, next, [`${oldName} / ${job} -> ${newName} / ${newName}`]);
     }
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index fc3481aaf..b421a4086 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -196,3 +196,5 @@
 {"schema":3,"ts":1793598815781,"firstTs":1793598815781,"updates":1,"kind":"deferral","key":"748-brand-every-consumer-challenge-low-bkit-core-engine-install-modules-core-ts-1112","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["748-brand-every-consumer"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"When the `  trivy:` / `  renovate:` line carries a trailing comment or a CRLF ending, the workflow `name:` is rebranded but no job `name:` is inserted. The log still says the check is now `bkit-trivy / bkit-trivy`, so a maintainer who follows it sets a required check that never reports, and PRs wait forever","description":"LOW build challenge finding at .bkit/core/engine/install/modules/core.ts:1112: When the `  trivy:` / `  renovate:` line carries a trailing comment or a CRLF ending, the workflow `name:` is rebranded but no job `name:` is inserted. The log still says the check is now `bkit-trivy / bkit-trivy`, so a maintainer who follows it sets a required check that never reports, and PRs wait forever. Done when: `migrateBrandedCheckNames` builds the logged new check name from what it wrote (job `name:` inserted, already present, or not inserted), so the log names the job's real display name. The insert tolerates `\\r\\n` and a trailing `# comment` on the job line","source":".bkit/core/engine/install/modules/core.ts:1112"}
 {"schema":3,"ts":1793598815782,"firstTs":1793598815782,"updates":1,"kind":"deferral","key":"748-brand-every-consumer-challenge-low-bkit-core-engine-install-modules-core-ts-884","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["748-brand-every-consumer"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A monorepo CI workflow's nested `packages/<x>/scripts/ci/check-dependency-audit.mjs` path is rewritten to a file that does not exist, so its `hashFiles` guard skips the dependency audit and CI stays green","description":"LOW build challenge finding at .bkit/core/engine/install/modules/core.ts:884: A monorepo CI workflow's nested `packages/<x>/scripts/ci/check-dependency-audit.mjs` path is rewritten to a file that does not exist, so its `hashFiles` guard skips the dependency audit and CI stays green. Done when: `renamePathTokens` rewrites a `scripts/ci/<old>` token only when no path character comes before it: start of text, or a character outside `[\\w./-]`, with an optional leading `./` kept. A path like `packages/api/scripts/ci/check-dependency-audit.mjs` or `vendor/scripts/ci/accepted-advisories.json` stays byte-identical. Today the regex anchors only the right side (`(?![\\w.-])`). Once the root unit moves, or is already moved, every nested copy's path in the CI workflow, `.husky/*`, `bkit-trivy.yml` and package.json values is rewritten to a `bkit-` file the migration never created. The `ci-yml.ts` doc comment names the effect: a `hashFiles(...)`-guarded audit step silently skips. Cross-ref `docs/security.md` § Supply-Chain (GitHub Actions): the dependency-audit and scanner steps are security controls, and a silent skip removes one without a red check.","source":".bkit/core/engine/install/modules/core.ts:884"}
 {"schema":3,"ts":1793598815783,"firstTs":1793598815783,"updates":1,"kind":"deferral","key":"748-brand-every-consumer-challenge-low-bkit-core-engine-install-modules-core-ts-911","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["748-brand-every-consumer"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A `bkit.testing.ciWorkflow` value such as `../../../x.yml` makes `bkit upgrade` rewrite a file outside `.github/workflows/`, even outside the repo","description":"LOW build challenge finding at .bkit/core/engine/install/modules/core.ts:911: A `bkit.testing.ciWorkflow` value such as `../../../x.yml` makes `bkit upgrade` rewrite a file outside `.github/workflows/`, even outside the repo. Done when: The brand migrations write the CI workflow only when `bkit.testing.ciWorkflow` is a bare file name: no `/`, no `\\`, no `..`, ending `.yml` or `.yaml`. Any other value logs one `console.warn` and gets no write. The check can sit in the resolver (`.bkit/core/engine/shared/settings.ts:364`, which today accepts any non-empty string) or at the two write sites (`core.ts:911` in `migrateBrandedFileTokens`, `core.ts:1115` in `migrateBrandedCheckNames`). Before this diff every `ciWorkflowPath` caller only read the file. This diff makes it a write target, and `lstatSync(...).isFile()` checks only the last path segment, so `.github/workflows/../../../x.yml` resolves outside the checkout. The write is limited to `pnpm` token, `scripts/ci/` path and health-stub rewrites, hence LOW. Cross-ref `docs/security.md` § CI Auto-Route Trust: path-bearing values from collaborator-editable files get an allowlist before path construction (\"rejecting `/`, `.`, `..`\").","source":".bkit/core/engine/install/modules/core.ts:911"}
+{"schema":3,"ts":1793600926951,"firstTs":1793600926951,"updates":1,"kind":"deferral","key":"748-brand-every-consumer-challenge-low-bkit-core-engine-install-modules-core-ts-1301","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["748-brand-every-consumer"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"With `.vale.ini` committed as a symlink, `migrateValeHouseStyle` moves the four shipped rules to `Bkit/` and removes `House/`, then returns at the `.vale.ini` check with no warning. The config still says `BasedOnStyles = House` and `House.<rule>` toggles, so Vale reports the `House` style as missing and `pnpm bkit:lint:prose` fails on every run, or (with own rules left in `House/`) loads none of the moved rules","description":"LOW build challenge finding at .bkit/core/engine/install/modules/core.ts:1301: With `.vale.ini` committed as a symlink, `migrateValeHouseStyle` moves the four shipped rules to `Bkit/` and removes `House/`, then returns at the `.vale.ini` check with no warning. The config still says `BasedOnStyles = House` and `House.<rule>` toggles, so Vale reports the `House` style as missing and `pnpm bkit:lint:prose` fails on every run, or (with own rules left in `House/`) loads none of the moved rules. Done when: `migrateValeHouseStyle` checks `.vale.ini` with `fs.lstatSync` before moving any rule; a `.vale.ini` that exists but is not a regular file leaves every rule in `House/` and logs one `console.warn` naming `.vale.ini` and the manual move, matching the Task 19 refusal for symlinked `.vale`, `.vale/styles`, `House` and `Bkit`. An absent `.vale.ini` keeps its planned behaviour (rules move, no write)","source":".bkit/core/engine/install/modules/core.ts:1301"}
+{"schema":3,"ts":1793600926952,"firstTs":1793600926952,"updates":1,"kind":"deferral","key":"748-brand-every-consumer-challenge-low-bkit-core-engine-install-modules-core-ts-941","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["748-brand-every-consumer"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A committed `.husky` or `.github` symlink (for example `.husky -> ../other-repo/.husky`) makes `bkit upgrade` rewrite files outside the repo: `migrateBrandedFileTokens` and `migrateBrandedCheckNames` check only the last path part with `fs.lstatSync(file)?.isFile()`, which follows a linked parent directory, so `.husky/pre-push`, `.github/workflows/bkit-trivy.yml`, `bkit-renovate.yml`, `bkit-cloud.yml` and the CI workflow are read and written through the link. The Task 19 fix added `linkedPath` for exactly this case but applied it only to `migrateBrandedTemplateFiles`","description":"LOW build challenge finding at .bkit/core/engine/install/modules/core.ts:941: A committed `.husky` or `.github` symlink (for example `.husky -> ../other-repo/.husky`) makes `bkit upgrade` rewrite files outside the repo: `migrateBrandedFileTokens` and `migrateBrandedCheckNames` check only the last path part with `fs.lstatSync(file)?.isFile()`, which follows a linked parent directory, so `.husky/pre-push`, `.github/workflows/bkit-trivy.yml`, `bkit-renovate.yml`, `bkit-cloud.yml` and the CI workflow are read and written through the link. The Task 19 fix added `linkedPath` for exactly this case but applied it only to `migrateBrandedTemplateFiles`. Done when: `migrateBrandedFileTokens` (`core.ts:941`) and `migrateBrandedCheckNames` (`readFile`, `core.ts:1148`) skip a file for which `linkedPath(file)` is true, with one `console.warn` naming the repo-relative path and the manual rename, so neither function writes through a symlinked `.husky`, `.github` or `.github/workflows`. The written bytes are limited to the brand renames, which keeps this LOW, but the write still lands in a file the consumer did not run the upgrade on. The `docs/migrations.md` rows \"Branded script tokens in hooks and CI\" and \"Branded check names\" then state the symlink skip, as the \"Branded CI script files\" row already does; `docs/security.md` has no symlink rule","source":".bkit/core/engine/install/modules/core.ts:941"}
diff --git a/docs/migrations.md b/docs/migrations.md
index fdccc72e0..e0b2010c6 100644
--- a/docs/migrations.md
+++ b/docs/migrations.md
@@ -33,8 +33,8 @@
 | Agent and step renamed to `bkit-build-plan-tasks` | `.bkit/core/engine/install/modules/core.ts` (`migrateModelOverrideAgentNames`, `RENAMED_AGENTS`, called by `runBkitDocs`); `.bkit/core/engine/commands/workflow/status.ts` (`RENAMED_STEPS`, applied by `readStatusRows` / `readStatusRowsAt`); `.bkit/core/engine/commands/workflow/context.ts` (`TASKS_LOG`) | `.bkit/prompts.md` `## Model Overrides` rows below `bkit:end` naming `bkit-build-plan-execute` → `bkit-build-plan-tasks`, provider and model kept, recorded as an update (the canonical hash covers the managed block only); a row already naming the new agent leaves the old row for the unknown-override report. Read-side only, nothing rewritten: a `status.jsonl` row with `step: build-plan-execute` is read as `build-plan-tasks`, and a `build-plan-execute-{GROUP}-log.md` still marks its tasks done, so a build in flight across the rename resumes; the rows and logs on disk keep the old name. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`, `.bkit/core/engine/commands/workflow/status.test.ts`, `.bkit/core/engine/commands/workflow/context.test.ts` |
 | Branded script names | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedScriptNames`, `BKIT_SCRIPT_RENAMES`, called by `seedCorePackageJsonScripts` before `ensurePackageJsonScripts`) | `package.json` scripts `lint:prose`, `slop:delta`, `graph` and `graph:{check,clean,graphml,refresh,rollup,scoped,tree,update}` → `bkit:` + the same name; the old key is deleted and the old token in other script values and default gate chains is rewritten. A pair whose old and new keys both exist is left as it is with a warning; a `graph*` script whose value is not bkit's (`scripts/graphify/bkit-`) is the consumer's own and stays. Original indent kept. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 | Branded script tokens in hooks and CI | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedFileTokens`, called by `runBkitDocs`) | `pnpm lint:prose`, `pnpm slop:delta` and `pnpm graph*` tokens in `.husky/pre-commit`, `.husky/pre-push` and the `bkit.testing.ciWorkflow` file → the `bkit:` names, for the pairs the package.json migration acts on. A name it cannot reach (e.g. `pnpm --filter web lint:prose`) is warned with file and line. Every other `.github/workflows/*.yml` / `*.yaml` file is scanned for an old name and warned with file and line, never written. Files are rewritten in place and recorded as `unhashed` writes, so `canonicalHashes` never holds them. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
-| Branded CI script files | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedTemplateFiles`, `SHIPPED_CI_SCRIPT_HASHES`, called by `runBkitDocs` before `migrateBrandedFileTokens`) | A unit under `scripts/ci/` (`check-capstone`, `check-dependency-audit` + `accepted-advisories.json`, `check-accepted-divergences` + `accepted-divergences.json`, `lanes/resolve-push-base`, with their `.test.mjs`) whose `.mjs` files all match a shipped release and whose `bkit-` targets are absent moves to the `bkit-` names; every `scripts/ci/<old>` path in the hooks, the CI workflow, `bkit-trivy.yml` and package.json scripts is rewritten. An edited unit, an existing target, a unit whose old path a workflow outside the path pass still names, or a source, target or directory that is a symlink is left with a warning naming the manual move. Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
-| Branded check names | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedCheckNames`, called by `runBkitDocs`) | Exact shipped old `name:` lines in `.github/workflows/bkit-cloud.yml` (`context`, `claude`, `opencode` jobs), `bkit-renovate.yml` (`Renovate`) and `bkit-trivy.yml` (`Trivy`) → `bkit-*`; a job `name:` is inserted under `renovate:` / `trivy:` when the workflow name was rewritten and the job has none; the old `bkit-stub:health` block in the `bkit.testing.ciWorkflow` file → the current block. A customised line stays. One log line per renamed check names old and new and says to update branch protection. Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
+| Branded CI script files | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedTemplateFiles`, `SHIPPED_CI_SCRIPT_HASHES`, called by `runBkitDocs` before `migrateBrandedFileTokens`) | A unit under `scripts/ci/` (`check-capstone`, `check-dependency-audit` + `accepted-advisories.json`, `check-accepted-divergences` + `accepted-divergences.json`, `lanes/resolve-push-base`, with their `.test.mjs`) whose `.mjs` files all match a shipped release and whose `bkit-` targets are absent moves to the `bkit-` names; every `scripts/ci/<old>` path in the hooks, the CI workflow, `bkit-trivy.yml` and package.json scripts is rewritten. An edited unit, an existing target, a unit whose old path a workflow outside the path pass or a composite action (`.github/actions/**/action.yml`) still names, or a source, target or directory that is a symlink is left with a warning naming the manual move. Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
+| Branded check names | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedCheckNames`, called by `runBkitDocs`) | Exact shipped old `name:` lines in `.github/workflows/bkit-cloud.yml` (`context`, `claude`, `opencode` jobs), `bkit-renovate.yml` (`Renovate`) and `bkit-trivy.yml` (`Trivy`) → `bkit-*`; a job `name:` is inserted under `renovate:` / `trivy:` when the workflow name was rewritten and the job has none (comment lines at job-key indent do not end the job block; a result with two job `name:` lines is not written and logs a warning naming the manual rename); the old `bkit-stub:health` block in the `bkit.testing.ciWorkflow` file → the current block. A customised line stays. One log line per renamed check names old and new and says to update branch protection. Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 | Vale style `House` → `Bkit` | `.bkit/core/engine/install/modules/core.ts` (`migrateValeHouseStyle`, `SHIPPED_HOUSE_RULE_HASHES`, called by `runBkitDocs`) | `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml` matching a shipped release move to `.vale/styles/Bkit/` when absent; an edited rule, a taken target or a symlinked rule stays with a warning naming the manual move; a symlinked `.vale`, `.vale/styles`, `House` or `Bkit` directory leaves the rules unmoved with a warning. `.vale.ini` `House.<moved>` → `Bkit.<moved>`; `BasedOnStyles` swaps `House` for `Bkit` once `House/` is empty (directory removed), else appends `Bkit`. Own rules stay. Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 
 ## Detect-only guards
