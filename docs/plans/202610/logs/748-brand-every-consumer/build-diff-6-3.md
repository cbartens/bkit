diff --git a/.bkit/core/engine/install/modules/core.integration.test.ts b/.bkit/core/engine/install/modules/core.integration.test.ts
index f0b1db293..d423c3d9c 100644
--- a/.bkit/core/engine/install/modules/core.integration.test.ts
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -7,6 +7,7 @@ import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
 import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
+import { parse as parseYaml } from "yaml";
 import type { WriteSet } from "../write";
 import { extractManagedBlock } from "../managed-block";
 import type { PreflightFinding } from "../../checks/before/index";
@@ -1741,6 +1742,29 @@ describe("migrateBrandedFileTokens (via runBkitDocs)", () => {
       vi.restoreAllMocks();
     }
   });
+
+  it("warns on an old script name in a workflow it does not rewrite", () => {
+    fs.writeFileSync(
+      "package.json",
+      JSON.stringify({ name: "x", scripts: { "lint:prose": "bkit ci prose" } }, null, 2) + "\n",
+      "utf-8",
+    );
+    put(
+      ".github/workflows/ci.yml",
+      "name: CI\njobs:\n  a:\n    steps:\n      - run: pnpm lint:prose\n",
+    );
+    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
+    vi.spyOn(console, "log").mockImplementation(() => undefined);
+    try {
+      run();
+      const out = warn.mock.calls.map((c) => String(c[0]));
+      const lines = out.filter((l) => l.includes(".github/workflows/ci.yml")).join("\n");
+      expect(lines).toContain("lint:prose");
+      expect(fs.readFileSync(".github/workflows/ci.yml", "utf-8")).toContain("pnpm lint:prose");
+    } finally {
+      vi.restoreAllMocks();
+    }
+  });
 });
 
 describe("migrateBrandedTemplateFiles (via runBkitDocs)", () => {
@@ -1840,6 +1864,68 @@ describe("migrateBrandedTemplateFiles (via runBkitDocs)", () => {
     expect(out).toContain("check-capstone");
     expect(out).toContain("check-dependency-audit");
   });
+
+  it("leaves a unit whose old path a workflow outside the path pass still names", () => {
+    put(path.join(CI_DIR, "check-dependency-audit.mjs"), shippedOld("check-dependency-audit.mjs"));
+    put(
+      path.join(CI_DIR, "check-dependency-audit.test.mjs"),
+      shippedOld("check-dependency-audit.test.mjs"),
+    );
+    put(
+      ".github/workflows/security.yml",
+      "name: security\njobs:\n  audit:\n    steps:\n      - if: hashFiles('scripts/ci/check-dependency-audit.mjs') != ''\n        run: node scripts/ci/check-dependency-audit.mjs\n",
+    );
+    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
+    run();
+
+    expect(fs.existsSync(path.join(CI_DIR, "check-dependency-audit.mjs"))).toBe(true);
+    expect(fs.existsSync(path.join(CI_DIR, "bkit-check-dependency-audit.mjs"))).toBe(false);
+    const out = warn.mock.calls.map((c) => String(c[0])).join("\n");
+    expect(out).toContain(".github/workflows/security.yml");
+    expect(out).toContain("check-dependency-audit");
+  });
+
+  it("does not write through a dangling bkit- target symlink", () => {
+    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-outside-"));
+    try {
+      const payloadTarget = path.join(outside, "planted.json");
+      put(path.join(CI_DIR, "accepted-advisories.json"), ADVISORIES);
+      fs.symlinkSync(payloadTarget, path.join(CI_DIR, "bkit-accepted-advisories.json"));
+      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
+      run();
+
+      expect(fs.existsSync(payloadTarget)).toBe(false);
+      expect(
+        fs.lstatSync(path.join(CI_DIR, "bkit-accepted-advisories.json")).isSymbolicLink(),
+      ).toBe(true);
+      const out = warn.mock.calls.map((c) => String(c[0])).join("\n");
+      expect(out).toContain("bkit-accepted-advisories.json");
+    } finally {
+      fs.rmSync(outside, { recursive: true, force: true });
+    }
+  });
+
+  it("leaves a symlinked old data file in place", () => {
+    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-outside-"));
+    try {
+      const secret = path.join(outside, "secret.txt");
+      fs.writeFileSync(secret, "TOP-SECRET-BYTES\n", "utf-8");
+      fs.mkdirSync(CI_DIR, { recursive: true });
+      fs.symlinkSync(secret, path.join(CI_DIR, "accepted-advisories.json"));
+      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
+      run();
+
+      expect(fs.readdirSync(CI_DIR)).not.toContain("bkit-accepted-advisories.json");
+      expect(fs.lstatSync(path.join(CI_DIR, "accepted-advisories.json")).isSymbolicLink()).toBe(
+        true,
+      );
+      const out = warn.mock.calls.map((c) => String(c[0])).join("\n");
+      expect(out).toContain("accepted-advisories.json");
+      expect(out).not.toContain("TOP-SECRET-BYTES");
+    } finally {
+      fs.rmSync(outside, { recursive: true, force: true });
+    }
+  });
 });
 
 /** The shipped pre-#748 content of a template file, read from the v6.0.0 release tag. */
@@ -1970,6 +2056,21 @@ describe("migrateBrandedCheckNames (via runBkitDocs)", () => {
     expect(after).toContain("# tail\n");
     expect(fs.existsSync(path.join(WF, "bkit-ci.yml"))).toBe(false);
   });
+  it("inserts no job name when the job sets name below another key", () => {
+    const old = shippedAtV6(".github/workflows/bkit-trivy.yml");
+    const custom = old.replace(
+      "    runs-on: ubuntu-latest # Edit this label in your copy.\n",
+      "    runs-on: ubuntu-latest # Edit this label in your copy.\n    name: our trivy\n",
+    );
+    expect(custom).toContain("    name: our trivy\n");
+    put(path.join(WF, "bkit-trivy.yml"), custom);
+    run();
+
+    const after = fs.readFileSync(path.join(WF, "bkit-trivy.yml"), "utf-8");
+    const parsed = parseYaml(after) as { jobs: { trivy: { name?: string } } };
+    expect(parsed.jobs.trivy.name).toBe("our trivy");
+    expect(after.match(/^ {4}name:/gm)).toHaveLength(1);
+  });
 });
 
 describe("migrateValeHouseStyle (via runBkitDocs)", () => {
@@ -2070,4 +2171,21 @@ describe("migrateValeHouseStyle (via runBkitDocs)", () => {
     expect(ctx.ws.writes.map((w) => w.path)).not.toContain(".vale.ini");
     expect(ctx.ws.writes.some((w) => w.path.endsWith(".vale.ini"))).toBe(false);
   });
+
+  it("does not move rules into a symlinked Bkit directory", () => {
+    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-outside-"));
+    try {
+      seed(RULES);
+      fs.mkdirSync(path.dirname(BKIT), { recursive: true });
+      fs.symlinkSync(outside, BKIT);
+      run();
+
+      expect(fs.readdirSync(outside)).toEqual([]);
+      expect(fs.lstatSync(BKIT).isSymbolicLink()).toBe(true);
+      expect(fs.existsSync(path.join(HOUSE, "Filler.yml"))).toBe(true);
+      expect(captured.join("\n")).toContain("Bkit");
+    } finally {
+      fs.rmSync(outside, { recursive: true, force: true });
+    }
+  });
 });
diff --git a/.bkit/core/engine/install/modules/core.test.ts b/.bkit/core/engine/install/modules/core.test.ts
index e91e4b6f3..22b2bfcd1 100644
--- a/.bkit/core/engine/install/modules/core.test.ts
+++ b/.bkit/core/engine/install/modules/core.test.ts
@@ -284,4 +284,18 @@ describe("renameScriptTokens", () => {
       "pnpm --reporter=silent run -s bkit:lint:prose",
     );
   });
+
+  it("renameScriptTokens leaves package-selecting flag forms alone", () => {
+    for (const call of [
+      "pnpm --filter=web lint:prose",
+      "pnpm -Fweb lint:prose",
+      "pnpm --dir=pkg lint:prose",
+      "pnpm -Cpkg lint:prose",
+      "pnpm --prefix=pkg lint:prose",
+      "pnpm --filter web lint:prose",
+    ]) {
+      expect(renameScriptTokens(call, renames)).toBe(call);
+    }
+    expect(renameScriptTokens("pnpm lint:prose", renames)).toBe("pnpm bkit:lint:prose");
+  });
 });
diff --git a/.bkit/core/engine/install/modules/core.ts b/.bkit/core/engine/install/modules/core.ts
index 6c937e37e..92c1a96b5 100644
--- a/.bkit/core/engine/install/modules/core.ts
+++ b/.bkit/core/engine/install/modules/core.ts
@@ -765,13 +765,39 @@ function activeScriptRenames(
   return { active, bothPresent };
 }
 
+function isLink(p: string): boolean {
+  return fs.lstatSync(p, { throwIfNoEntry: false })?.isSymbolicLink() === true;
+}
+
+// True when `p` or any directory above it (within the relative path) is a symlink.
+function linkedPath(p: string): boolean {
+  const parts = path.normalize(p).split(path.sep);
+  for (let i = 1; i <= parts.length; i++) {
+    if (isLink(parts.slice(0, i).join(path.sep))) return true;
+  }
+  return false;
+}
+
+// Every `.github/workflows/*.yml` / `*.yaml` regular file outside `skip`.
+function otherWorkflows(skip: readonly string[]): string[] {
+  const dir = path.join(".github", "workflows");
+  if (!fs.lstatSync(dir, { throwIfNoEntry: false })?.isDirectory()) return [];
+  const skipped = new Set(skip.map((f) => path.normalize(f)));
+  return fs
+    .readdirSync(dir)
+    .filter((f) => /\.ya?ml$/.test(f))
+    .map((f) => path.join(dir, f))
+    .filter((f) => !skipped.has(f) && fs.lstatSync(f).isFile());
+}
+
 function escapeRegExp(text: string): string {
   return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
 }
 
 /**
  * Rewrites `pnpm [flags] [run] [flags] <old>` to the new name, keeping the flags and `run`.
- * Each flag is a value-less `-x` / `--x[=v]` token; `<old>` ends at a character outside
+ * Each flag is a value-less `-x` / `--x[=v]` token, except the package selectors (`-F`, `-C`,
+ * `--filter`, `--dir`, `--prefix`), which leave the call alone; `<old>` ends at a character outside
  * `[\w:-]` or at the end of the text. Anything else (`npm run`, `echo`, `--filter web`) stays.
  */
 export function renameScriptTokens(
@@ -781,7 +807,7 @@ export function renameScriptTokens(
   const names = Object.keys(renames).sort((a, b) => b.length - a.length);
   if (names.length === 0) return text;
   const re = new RegExp(
-    `\\bpnpm((?:\\s+(?:run|-{1,2}[\\w-]+(?:=\\S*)?))*)(\\s+)(${names.map(escapeRegExp).join("|")})(?![\\w:-])`,
+    `\\bpnpm((?:\\s+(?:run|(?!-(?:F|C|-filter|-dir|-prefix))-{1,2}[\\w-]+(?:=\\S*)?))*)(\\s+)(${names.map(escapeRegExp).join("|")})(?![\\w:-])`,
     "g",
   );
   return text.replace(
@@ -928,6 +954,13 @@ export function migrateBrandedFileTokens(
     ws.writes.push({ path: file, action: "update", unhashed: true });
     console.log(`${logPrefix} ${tag}core: ${file} — branded script and path names rewritten`);
   }
+  for (const file of otherWorkflows(files)) {
+    for (const { name, line } of findOldScriptNames(fs.readFileSync(file, "utf-8"), active)) {
+      console.warn(
+        `${logPrefix} ${tag}core: ${file}:${line} still runs the old script name "${name}"; rename it to "${active[name]}" by hand`,
+      );
+    }
+  }
   if (pkg === undefined || pkgRaw === undefined || pathRenames.length === 0) return;
   let changed = false;
   const nextScripts: Record<string, unknown> = {};
@@ -996,16 +1029,48 @@ export function migrateBrandedTemplateFiles(
   const renames: PathRename[] = [];
   const templates = getTemplatesRoot();
   for (const unit of CI_SCRIPT_UNITS) {
-    const present = unit.filter(([from]) => fs.existsSync(from));
-    const done = unit.filter(([from, to]) => !fs.existsSync(from) && fs.existsSync(to));
+    const exists = (p: string): boolean => fs.lstatSync(p, { throwIfNoEntry: false }) !== undefined;
+    const present = unit.filter(([from]) => exists(from));
+    const done = unit.filter(([from, to]) => !exists(from) && exists(to));
     for (const [from, to] of done) renames.push({ from, to });
     if (present.length === 0) continue;
+    const linkedTargets = present.map(([, to]) => to).filter((to) => linkedPath(to));
+    const linkedAll = [
+      ...new Set([...present.map(([from]) => from).filter((f) => linkedPath(f)), ...linkedTargets]),
+    ];
+    if (linkedAll.length > 0) {
+      console.warn(
+        `${logPrefix} ${tag}core: ${linkedAll.join(", ")} is a symlink (or sits under one); ${present.map(([from]) => from).join(", ")} not moved to the bkit- names; move them by hand and update every reference`,
+      );
+      continue;
+    }
+    const referenced = otherWorkflows([
+      ciWorkflowPath("."),
+      path.join(".github", "workflows", "bkit-trivy.yml"),
+    ]).flatMap((file) => {
+      const lines = fs.readFileSync(file, "utf-8").split("\n");
+      return present.flatMap(([from]) =>
+        lines.flatMap((l, i) =>
+          new RegExp(`${escapeRegExp(from)}(?![\\w.-])`).test(l)
+            ? [{ file, line: i + 1, from }]
+            : [],
+        ),
+      );
+    });
+    if (referenced.length > 0) {
+      for (const { file, line, from } of referenced) {
+        console.warn(
+          `${logPrefix} ${tag}core: ${file}:${line} still names ${from}; the unit was not moved to the bkit- names — move the files by hand and update that reference`,
+        );
+      }
+      continue;
+    }
     const edited = present.filter(
       ([from]) =>
         from.endsWith(".mjs") &&
         !SHIPPED_CI_SCRIPT_HASHES[from]?.includes(sha256(fs.readFileSync(from))),
     );
-    const taken = present.filter(([, to]) => fs.existsSync(to));
+    const taken = present.filter(([, to]) => exists(to));
     const noTemplate = present.filter(
       ([, to]) => to.endsWith(".mjs") && !fs.existsSync(path.join(templates, to)),
     );
@@ -1105,10 +1170,16 @@ export function migrateBrandedCheckNames(
     const nameLine = new RegExp(`^name: ${escapeRegExp(oldName)}$`, "m");
     if (!nameLine.test(text)) continue;
     let next = text.replace(nameLine, `name: ${newName}`);
-    next = next.replace(
-      new RegExp(`^( {2}${escapeRegExp(job)}:\\n)(?! {4}name:)`, "m"),
-      `$1    name: ${newName}\n`,
-    );
+    const jobStart = new RegExp(`^ {2}${escapeRegExp(job)}:[ \\t]*\\n`, "m").exec(next);
+    if (jobStart !== null) {
+      const bodyStart = jobStart.index + jobStart[0].length;
+      const rest = next.slice(bodyStart);
+      const end = rest.search(/^(?: {2}\S|\S)/m);
+      const body = end === -1 ? rest : rest.slice(0, end);
+      if (!/^ {4}name:/m.test(body)) {
+        next = `${next.slice(0, bodyStart)}    name: ${newName}\n${next.slice(bodyStart)}`;
+      }
+    }
     finish(target, text, next, [`${oldName} / ${job} -> ${newName} / ${newName}`]);
   }
 
@@ -1171,15 +1242,34 @@ export function migrateValeHouseStyle(dryRun: boolean, ws: WriteSet, logPrefix:
   const stylesDir = path.join(".vale", "styles");
   const houseDir = path.join(stylesDir, "House");
   const bkitDir = path.join(stylesDir, "Bkit");
+  const linkedVale = [".vale", stylesDir, houseDir, bkitDir].find((p) => isLink(p));
+  if (linkedVale === houseDir || linkedVale === ".vale" || linkedVale === stylesDir) {
+    console.warn(
+      `${logPrefix} ${tag}core: ${linkedVale} is a symlink; the House rules were not moved to the Bkit style — move them by hand: mv .vale/styles/House/<rule>.yml .vale/styles/Bkit/ and rename the House.<rule> toggles in .vale.ini to Bkit.<rule>`,
+    );
+    return;
+  }
   if (!fs.lstatSync(houseDir, { throwIfNoEntry: false })?.isDirectory()) return;
+  if (linkedVale !== undefined) {
+    console.warn(
+      `${logPrefix} ${tag}core: ${linkedVale} is a symlink; the House rules were not moved to the Bkit style — move them by hand: mv .vale/styles/House/<rule>.yml .vale/styles/Bkit/ and rename the House.<rule> toggles in .vale.ini to Bkit.<rule>`,
+    );
+    return;
+  }
   const moved: string[] = [];
   for (const [rule, hashes] of Object.entries(SHIPPED_HOUSE_RULE_HASHES)) {
     const from = path.join(houseDir, `${rule}.yml`);
+    if (isLink(from)) {
+      console.warn(
+        `${logPrefix} ${tag}core: ${from} is a symlink and was not moved to the Bkit style; move it by hand: mv .vale/styles/House/${rule}.yml .vale/styles/Bkit/ and rename the House.${rule} toggle in .vale.ini to Bkit.${rule}`,
+      );
+      continue;
+    }
     if (!fs.lstatSync(from, { throwIfNoEntry: false })?.isFile()) continue;
     const to = path.join(bkitDir, `${rule}.yml`);
     const stays = !hashes.includes(sha256(fs.readFileSync(from)))
       ? "differs from every shipped release"
-      : fs.existsSync(to)
+      : fs.lstatSync(to, { throwIfNoEntry: false }) !== undefined
         ? `${to} already exists`
         : undefined;
     if (stays !== undefined) {
diff --git a/dist/install/modules/core.js b/dist/install/modules/core.js
index 298b6d77e..744e4279e 100644
--- a/dist/install/modules/core.js
+++ b/dist/install/modules/core.js
@@ -647,19 +647,44 @@ function activeScriptRenames(scripts, renames) {
     }
     return { active, bothPresent };
 }
+function isLink(p) {
+    return fs.lstatSync(p, { throwIfNoEntry: false })?.isSymbolicLink() === true;
+}
+// True when `p` or any directory above it (within the relative path) is a symlink.
+function linkedPath(p) {
+    const parts = path.normalize(p).split(path.sep);
+    for (let i = 1; i <= parts.length; i++) {
+        if (isLink(parts.slice(0, i).join(path.sep)))
+            return true;
+    }
+    return false;
+}
+// Every `.github/workflows/*.yml` / `*.yaml` regular file outside `skip`.
+function otherWorkflows(skip) {
+    const dir = path.join(".github", "workflows");
+    if (!fs.lstatSync(dir, { throwIfNoEntry: false })?.isDirectory())
+        return [];
+    const skipped = new Set(skip.map((f) => path.normalize(f)));
+    return fs
+        .readdirSync(dir)
+        .filter((f) => /\.ya?ml$/.test(f))
+        .map((f) => path.join(dir, f))
+        .filter((f) => !skipped.has(f) && fs.lstatSync(f).isFile());
+}
 function escapeRegExp(text) {
     return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
 }
 /**
  * Rewrites `pnpm [flags] [run] [flags] <old>` to the new name, keeping the flags and `run`.
- * Each flag is a value-less `-x` / `--x[=v]` token; `<old>` ends at a character outside
+ * Each flag is a value-less `-x` / `--x[=v]` token, except the package selectors (`-F`, `-C`,
+ * `--filter`, `--dir`, `--prefix`), which leave the call alone; `<old>` ends at a character outside
  * `[\w:-]` or at the end of the text. Anything else (`npm run`, `echo`, `--filter web`) stays.
  */
 export function renameScriptTokens(text, renames) {
     const names = Object.keys(renames).sort((a, b) => b.length - a.length);
     if (names.length === 0)
         return text;
-    const re = new RegExp(`\\bpnpm((?:\\s+(?:run|-{1,2}[\\w-]+(?:=\\S*)?))*)(\\s+)(${names.map(escapeRegExp).join("|")})(?![\\w:-])`, "g");
+    const re = new RegExp(`\\bpnpm((?:\\s+(?:run|(?!-(?:F|C|-filter|-dir|-prefix))-{1,2}[\\w-]+(?:=\\S*)?))*)(\\s+)(${names.map(escapeRegExp).join("|")})(?![\\w:-])`, "g");
     return text.replace(re, (_m, flags, gap, old) => `pnpm${flags}${gap}${renames[old]}`);
 }
 /** Each old script name still in `text`, with its 1-based line. */
@@ -776,6 +801,11 @@ export function migrateBrandedFileTokens(dryRun, ws, logPrefix, pathRenames = []
         ws.writes.push({ path: file, action: "update", unhashed: true });
         console.log(`${logPrefix} ${tag}core: ${file} — branded script and path names rewritten`);
     }
+    for (const file of otherWorkflows(files)) {
+        for (const { name, line } of findOldScriptNames(fs.readFileSync(file, "utf-8"), active)) {
+            console.warn(`${logPrefix} ${tag}core: ${file}:${line} still runs the old script name "${name}"; rename it to "${active[name]}" by hand`);
+        }
+    }
     if (pkg === undefined || pkgRaw === undefined || pathRenames.length === 0)
         return;
     let changed = false;
@@ -842,15 +872,39 @@ export function migrateBrandedTemplateFiles(dryRun, ws, logPrefix) {
     const renames = [];
     const templates = getTemplatesRoot();
     for (const unit of CI_SCRIPT_UNITS) {
-        const present = unit.filter(([from]) => fs.existsSync(from));
-        const done = unit.filter(([from, to]) => !fs.existsSync(from) && fs.existsSync(to));
+        const exists = (p) => fs.lstatSync(p, { throwIfNoEntry: false }) !== undefined;
+        const present = unit.filter(([from]) => exists(from));
+        const done = unit.filter(([from, to]) => !exists(from) && exists(to));
         for (const [from, to] of done)
             renames.push({ from, to });
         if (present.length === 0)
             continue;
+        const linkedTargets = present.map(([, to]) => to).filter((to) => linkedPath(to));
+        const linkedAll = [
+            ...new Set([...present.map(([from]) => from).filter((f) => linkedPath(f)), ...linkedTargets]),
+        ];
+        if (linkedAll.length > 0) {
+            console.warn(`${logPrefix} ${tag}core: ${linkedAll.join(", ")} is a symlink (or sits under one); ${present.map(([from]) => from).join(", ")} not moved to the bkit- names; move them by hand and update every reference`);
+            continue;
+        }
+        const referenced = otherWorkflows([
+            ciWorkflowPath("."),
+            path.join(".github", "workflows", "bkit-trivy.yml"),
+        ]).flatMap((file) => {
+            const lines = fs.readFileSync(file, "utf-8").split("\n");
+            return present.flatMap(([from]) => lines.flatMap((l, i) => new RegExp(`${escapeRegExp(from)}(?![\\w.-])`).test(l)
+                ? [{ file, line: i + 1, from }]
+                : []));
+        });
+        if (referenced.length > 0) {
+            for (const { file, line, from } of referenced) {
+                console.warn(`${logPrefix} ${tag}core: ${file}:${line} still names ${from}; the unit was not moved to the bkit- names — move the files by hand and update that reference`);
+            }
+            continue;
+        }
         const edited = present.filter(([from]) => from.endsWith(".mjs") &&
             !SHIPPED_CI_SCRIPT_HASHES[from]?.includes(sha256(fs.readFileSync(from))));
-        const taken = present.filter(([, to]) => fs.existsSync(to));
+        const taken = present.filter(([, to]) => exists(to));
         const noTemplate = present.filter(([, to]) => to.endsWith(".mjs") && !fs.existsSync(path.join(templates, to)));
         if (edited.length > 0 || taken.length > 0 || noTemplate.length > 0) {
             const why = edited.length > 0
@@ -936,7 +990,16 @@ export function migrateBrandedCheckNames(dryRun, ws, logPrefix, defaultBranch =
         if (!nameLine.test(text))
             continue;
         let next = text.replace(nameLine, `name: ${newName}`);
-        next = next.replace(new RegExp(`^( {2}${escapeRegExp(job)}:\\n)(?! {4}name:)`, "m"), `$1    name: ${newName}\n`);
+        const jobStart = new RegExp(`^ {2}${escapeRegExp(job)}:[ \\t]*\\n`, "m").exec(next);
+        if (jobStart !== null) {
+            const bodyStart = jobStart.index + jobStart[0].length;
+            const rest = next.slice(bodyStart);
+            const end = rest.search(/^(?: {2}\S|\S)/m);
+            const body = end === -1 ? rest : rest.slice(0, end);
+            if (!/^ {4}name:/m.test(body)) {
+                next = `${next.slice(0, bodyStart)}    name: ${newName}\n${next.slice(bodyStart)}`;
+            }
+        }
         finish(target, text, next, [`${oldName} / ${job} -> ${newName} / ${newName}`]);
     }
     const ci = ciWorkflowPath(".");
@@ -991,17 +1054,30 @@ export function migrateValeHouseStyle(dryRun, ws, logPrefix) {
     const stylesDir = path.join(".vale", "styles");
     const houseDir = path.join(stylesDir, "House");
     const bkitDir = path.join(stylesDir, "Bkit");
+    const linkedVale = [".vale", stylesDir, houseDir, bkitDir].find((p) => isLink(p));
+    if (linkedVale === houseDir || linkedVale === ".vale" || linkedVale === stylesDir) {
+        console.warn(`${logPrefix} ${tag}core: ${linkedVale} is a symlink; the House rules were not moved to the Bkit style — move them by hand: mv .vale/styles/House/<rule>.yml .vale/styles/Bkit/ and rename the House.<rule> toggles in .vale.ini to Bkit.<rule>`);
+        return;
+    }
     if (!fs.lstatSync(houseDir, { throwIfNoEntry: false })?.isDirectory())
         return;
+    if (linkedVale !== undefined) {
+        console.warn(`${logPrefix} ${tag}core: ${linkedVale} is a symlink; the House rules were not moved to the Bkit style — move them by hand: mv .vale/styles/House/<rule>.yml .vale/styles/Bkit/ and rename the House.<rule> toggles in .vale.ini to Bkit.<rule>`);
+        return;
+    }
     const moved = [];
     for (const [rule, hashes] of Object.entries(SHIPPED_HOUSE_RULE_HASHES)) {
         const from = path.join(houseDir, `${rule}.yml`);
+        if (isLink(from)) {
+            console.warn(`${logPrefix} ${tag}core: ${from} is a symlink and was not moved to the Bkit style; move it by hand: mv .vale/styles/House/${rule}.yml .vale/styles/Bkit/ and rename the House.${rule} toggle in .vale.ini to Bkit.${rule}`);
+            continue;
+        }
         if (!fs.lstatSync(from, { throwIfNoEntry: false })?.isFile())
             continue;
         const to = path.join(bkitDir, `${rule}.yml`);
         const stays = !hashes.includes(sha256(fs.readFileSync(from)))
             ? "differs from every shipped release"
-            : fs.existsSync(to)
+            : fs.lstatSync(to, { throwIfNoEntry: false }) !== undefined
                 ? `${to} already exists`
                 : undefined;
         if (stays !== undefined) {
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index b62f99754..fc3481aaf 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -191,3 +191,8 @@
 {"schema":3,"ts":1793583541553,"firstTs":1792985807437,"updates":2,"kind":"deferral","key":"700-first-action-deny-gate","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["#700","docs/plans/202610/700-session-start-nudge-plan.md § Out of Scope","docs/plans/202610/logs/700-session-start-nudge/build-input-1.md § Out of Scope"],"type":"feature","category":"agentic","severity":"LOW","reason":"scope-declared","status":"OPEN","summary":"First-action deny gate: deny Edit / Write / Bash until a read of `.agents/rules.md` is observed","description":"Idea 2 from #700. A hard guarantee across hosts, built on the GateGuard before-hook plus ReadGuard's per-session read log (`.bkit/core/hooks/gateguard-engine.js`, `.bkit/core/hooks/readguard-engine.js`). Blocked by Claude Code `SessionStart` being unable to block and by the absence of a shared gate across every host.","remediation":"Needs a cross-host gate primitive and a per-session read log of `.agents/rules.md`; design as its own feature."}
 {"schema":3,"ts":1793583541554,"firstTs":1792985807438,"updates":2,"kind":"deferral","key":"700-rules-content-hash-acknowledgement","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["#700","docs/plans/202610/700-session-start-nudge-plan.md § Out of Scope","docs/plans/202610/logs/700-session-start-nudge/build-input-1.md § Out of Scope"],"type":"feature","category":"agentic","severity":"LOW","reason":"scope-declared","status":"OPEN","summary":"Content-hash acknowledgement: stamp the `.agents/rules.md` hash at read time and force a re-read when it changes","description":"Idea 3 from #700. Records the read's hash so a changed rules file invalidates the acknowledgement. Pairs with the first-action deny gate (`700-first-action-deny-gate`) and needs the same per-session read log.","remediation":"Depends on the deny-gate's per-session read log; design together with that feature."}
 {"schema":3,"ts":1793583541555,"firstTs":1792985807439,"updates":2,"kind":"deferral","key":"700-provider-auto-load-rules","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["#700","docs/plans/202610/700-session-start-nudge-plan.md § Out of Scope","docs/plans/202610/logs/700-session-start-nudge/build-input-1.md § Out of Scope"],"type":"feature","category":"agentic","severity":"LOW","reason":"scope-declared","status":"OPEN","summary":"Provider auto-load: include `.agents/rules.md` as context via host config (opencode `instructions`, `CLAUDE.md` `@` import)","description":"Idea 4 from #700. The most reliable 'read' but spends context budget on every session, on top of the advisory this plan adds.","remediation":"Measure the per-session context cost on each host before adopting; design as its own feature."}
+{"schema":3,"ts":1793598815779,"firstTs":1793598815779,"updates":1,"kind":"deferral","key":"748-brand-every-consumer-challenge-low-bkit-core-engine-install-modules-core-ts-896","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["748-brand-every-consumer"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"With a `package.json` that does not parse (a merge-conflict marker, say), `migrateBrandedScriptNames` keeps the old keys, but `migrateBrandedFileTokens` treats every pair as active and rewrites `.husky/pre-push` to `pnpm bkit:slop:delta`. Once the JSON is fixed, the hook calls a script that does not exist, and a foreign `graph` script's `pnpm graph` call is rebranded for good","description":"LOW build challenge finding at .bkit/core/engine/install/modules/core.ts:896: With a `package.json` that does not parse (a merge-conflict marker, say), `migrateBrandedScriptNames` keeps the old keys, but `migrateBrandedFileTokens` treats every pair as active and rewrites `.husky/pre-push` to `pnpm bkit:slop:delta`. Once the JSON is fixed, the hook calls a script that does not exist, and a foreign `graph` script's `pnpm graph` call is rebranded for good. Done when: `migrateBrandedFileTokens` skips the script-token pass when `package.json` exists but `parseJson` fails or `scripts` is not an object, and logs a warning naming the skip. The path-rename pass may still run. The hooks and the CI file keep names that match the unrenamed keys","source":".bkit/core/engine/install/modules/core.ts:896"}
+{"schema":3,"ts":1793598815780,"firstTs":1793598815780,"updates":1,"kind":"deferral","key":"748-brand-every-consumer-challenge-low-bkit-core-engine-install-modules-core-ts-1201","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["748-brand-every-consumer"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A consumer entry in `.vale/styles/House/` named like a moved rule without `.yml` (a `Filler/` folder, a `Verbose` file) is filtered out of `remaining`. `House/` then counts as empty, and `fs.rmSync(houseDir, { recursive: true })` deletes that consumer content","description":"LOW build challenge finding at .bkit/core/engine/install/modules/core.ts:1201: A consumer entry in `.vale/styles/House/` named like a moved rule without `.yml` (a `Filler/` folder, a `Verbose` file) is filtered out of `remaining`. `House/` then counts as empty, and `fs.rmSync(houseDir, { recursive: true })` deletes that consumer content. Done when: `remaining` excludes only the exact `${rule}.yml` names in `moved`, so any other entry keeps `House/` and its `BasedOnStyles` entry in place","source":".bkit/core/engine/install/modules/core.ts:1201"}
+{"schema":3,"ts":1793598815781,"firstTs":1793598815781,"updates":1,"kind":"deferral","key":"748-brand-every-consumer-challenge-low-bkit-core-engine-install-modules-core-ts-1112","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["748-brand-every-consumer"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"When the `  trivy:` / `  renovate:` line carries a trailing comment or a CRLF ending, the workflow `name:` is rebranded but no job `name:` is inserted. The log still says the check is now `bkit-trivy / bkit-trivy`, so a maintainer who follows it sets a required check that never reports, and PRs wait forever","description":"LOW build challenge finding at .bkit/core/engine/install/modules/core.ts:1112: When the `  trivy:` / `  renovate:` line carries a trailing comment or a CRLF ending, the workflow `name:` is rebranded but no job `name:` is inserted. The log still says the check is now `bkit-trivy / bkit-trivy`, so a maintainer who follows it sets a required check that never reports, and PRs wait forever. Done when: `migrateBrandedCheckNames` builds the logged new check name from what it wrote (job `name:` inserted, already present, or not inserted), so the log names the job's real display name. The insert tolerates `\\r\\n` and a trailing `# comment` on the job line","source":".bkit/core/engine/install/modules/core.ts:1112"}
+{"schema":3,"ts":1793598815782,"firstTs":1793598815782,"updates":1,"kind":"deferral","key":"748-brand-every-consumer-challenge-low-bkit-core-engine-install-modules-core-ts-884","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["748-brand-every-consumer"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A monorepo CI workflow's nested `packages/<x>/scripts/ci/check-dependency-audit.mjs` path is rewritten to a file that does not exist, so its `hashFiles` guard skips the dependency audit and CI stays green","description":"LOW build challenge finding at .bkit/core/engine/install/modules/core.ts:884: A monorepo CI workflow's nested `packages/<x>/scripts/ci/check-dependency-audit.mjs` path is rewritten to a file that does not exist, so its `hashFiles` guard skips the dependency audit and CI stays green. Done when: `renamePathTokens` rewrites a `scripts/ci/<old>` token only when no path character comes before it: start of text, or a character outside `[\\w./-]`, with an optional leading `./` kept. A path like `packages/api/scripts/ci/check-dependency-audit.mjs` or `vendor/scripts/ci/accepted-advisories.json` stays byte-identical. Today the regex anchors only the right side (`(?![\\w.-])`). Once the root unit moves, or is already moved, every nested copy's path in the CI workflow, `.husky/*`, `bkit-trivy.yml` and package.json values is rewritten to a `bkit-` file the migration never created. The `ci-yml.ts` doc comment names the effect: a `hashFiles(...)`-guarded audit step silently skips. Cross-ref `docs/security.md` § Supply-Chain (GitHub Actions): the dependency-audit and scanner steps are security controls, and a silent skip removes one without a red check.","source":".bkit/core/engine/install/modules/core.ts:884"}
+{"schema":3,"ts":1793598815783,"firstTs":1793598815783,"updates":1,"kind":"deferral","key":"748-brand-every-consumer-challenge-low-bkit-core-engine-install-modules-core-ts-911","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["748-brand-every-consumer"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A `bkit.testing.ciWorkflow` value such as `../../../x.yml` makes `bkit upgrade` rewrite a file outside `.github/workflows/`, even outside the repo","description":"LOW build challenge finding at .bkit/core/engine/install/modules/core.ts:911: A `bkit.testing.ciWorkflow` value such as `../../../x.yml` makes `bkit upgrade` rewrite a file outside `.github/workflows/`, even outside the repo. Done when: The brand migrations write the CI workflow only when `bkit.testing.ciWorkflow` is a bare file name: no `/`, no `\\`, no `..`, ending `.yml` or `.yaml`. Any other value logs one `console.warn` and gets no write. The check can sit in the resolver (`.bkit/core/engine/shared/settings.ts:364`, which today accepts any non-empty string) or at the two write sites (`core.ts:911` in `migrateBrandedFileTokens`, `core.ts:1115` in `migrateBrandedCheckNames`). Before this diff every `ciWorkflowPath` caller only read the file. This diff makes it a write target, and `lstatSync(...).isFile()` checks only the last path segment, so `.github/workflows/../../../x.yml` resolves outside the checkout. The write is limited to `pnpm` token, `scripts/ci/` path and health-stub rewrites, hence LOW. Cross-ref `docs/security.md` § CI Auto-Route Trust: path-bearing values from collaborator-editable files get an allowlist before path construction (\"rejecting `/`, `.`, `..`\").","source":".bkit/core/engine/install/modules/core.ts:911"}
diff --git a/docs/migrations.md b/docs/migrations.md
index 968d902a9..fdccc72e0 100644
--- a/docs/migrations.md
+++ b/docs/migrations.md
@@ -32,10 +32,10 @@
 | Template note moved inside the managed block | `.bkit/core/engine/install/template-notes.ts` (`migrateTemplateNotes`, `RETIRED_TEMPLATE_NOTE_HASHES`, called by `runBkitDocs`) | `docs/templates/bkit-*.md` with a `<!-- Note: … -->` line above `<!-- bkit:start -->` whose sha256 matches a note wording a bkit template carried there → that line removed, with the blank line after it, because the note now opens the managed block, where upgrade refreshes it. When nothing else is left above the block, every blank line there goes too. Every other line above the block stays, and a leading byte-order mark stays. A note that matches no shipped wording is kept; when it names `docs/audits/{YYYYMM}`, `docs/plans/{YYYYMM}` or `@bkit-`, install, upgrade and `bkit check` each print one line naming the file. A file with CRLF line endings throughout is left as it is. Recorded in ws, so `bkit check` fails until upgrade runs. | 5.0.0-6.0.x | `.bkit/core/engine/install/template-notes.test.ts`; `.bkit/core/engine/install/modules/core.integration.test.ts` |
 | Agent and step renamed to `bkit-build-plan-tasks` | `.bkit/core/engine/install/modules/core.ts` (`migrateModelOverrideAgentNames`, `RENAMED_AGENTS`, called by `runBkitDocs`); `.bkit/core/engine/commands/workflow/status.ts` (`RENAMED_STEPS`, applied by `readStatusRows` / `readStatusRowsAt`); `.bkit/core/engine/commands/workflow/context.ts` (`TASKS_LOG`) | `.bkit/prompts.md` `## Model Overrides` rows below `bkit:end` naming `bkit-build-plan-execute` → `bkit-build-plan-tasks`, provider and model kept, recorded as an update (the canonical hash covers the managed block only); a row already naming the new agent leaves the old row for the unknown-override report. Read-side only, nothing rewritten: a `status.jsonl` row with `step: build-plan-execute` is read as `build-plan-tasks`, and a `build-plan-execute-{GROUP}-log.md` still marks its tasks done, so a build in flight across the rename resumes; the rows and logs on disk keep the old name. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`, `.bkit/core/engine/commands/workflow/status.test.ts`, `.bkit/core/engine/commands/workflow/context.test.ts` |
 | Branded script names | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedScriptNames`, `BKIT_SCRIPT_RENAMES`, called by `seedCorePackageJsonScripts` before `ensurePackageJsonScripts`) | `package.json` scripts `lint:prose`, `slop:delta`, `graph` and `graph:{check,clean,graphml,refresh,rollup,scoped,tree,update}` → `bkit:` + the same name; the old key is deleted and the old token in other script values and default gate chains is rewritten. A pair whose old and new keys both exist is left as it is with a warning; a `graph*` script whose value is not bkit's (`scripts/graphify/bkit-`) is the consumer's own and stays. Original indent kept. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
-| Branded script tokens in hooks and CI | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedFileTokens`, called by `runBkitDocs`) | `pnpm lint:prose`, `pnpm slop:delta` and `pnpm graph*` tokens in `.husky/pre-commit`, `.husky/pre-push` and the `bkit.testing.ciWorkflow` file → the `bkit:` names, for the pairs the package.json migration acts on. A name it cannot reach (e.g. `pnpm --filter web lint:prose`) is warned with file and line. Files are rewritten in place and recorded as `unhashed` writes, so `canonicalHashes` never holds them. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
-| Branded CI script files | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedTemplateFiles`, `SHIPPED_CI_SCRIPT_HASHES`, called by `runBkitDocs` before `migrateBrandedFileTokens`) | A unit under `scripts/ci/` (`check-capstone`, `check-dependency-audit` + `accepted-advisories.json`, `check-accepted-divergences` + `accepted-divergences.json`, `lanes/resolve-push-base`, with their `.test.mjs`) whose `.mjs` files all match a shipped release and whose `bkit-` targets are absent moves to the `bkit-` names; every `scripts/ci/<old>` path in the hooks, the CI workflow, `bkit-trivy.yml` and package.json scripts is rewritten. An edited unit or an existing target is left with a warning naming the manual move. Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
+| Branded script tokens in hooks and CI | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedFileTokens`, called by `runBkitDocs`) | `pnpm lint:prose`, `pnpm slop:delta` and `pnpm graph*` tokens in `.husky/pre-commit`, `.husky/pre-push` and the `bkit.testing.ciWorkflow` file → the `bkit:` names, for the pairs the package.json migration acts on. A name it cannot reach (e.g. `pnpm --filter web lint:prose`) is warned with file and line. Every other `.github/workflows/*.yml` / `*.yaml` file is scanned for an old name and warned with file and line, never written. Files are rewritten in place and recorded as `unhashed` writes, so `canonicalHashes` never holds them. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
+| Branded CI script files | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedTemplateFiles`, `SHIPPED_CI_SCRIPT_HASHES`, called by `runBkitDocs` before `migrateBrandedFileTokens`) | A unit under `scripts/ci/` (`check-capstone`, `check-dependency-audit` + `accepted-advisories.json`, `check-accepted-divergences` + `accepted-divergences.json`, `lanes/resolve-push-base`, with their `.test.mjs`) whose `.mjs` files all match a shipped release and whose `bkit-` targets are absent moves to the `bkit-` names; every `scripts/ci/<old>` path in the hooks, the CI workflow, `bkit-trivy.yml` and package.json scripts is rewritten. An edited unit, an existing target, a unit whose old path a workflow outside the path pass still names, or a source, target or directory that is a symlink is left with a warning naming the manual move. Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 | Branded check names | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedCheckNames`, called by `runBkitDocs`) | Exact shipped old `name:` lines in `.github/workflows/bkit-cloud.yml` (`context`, `claude`, `opencode` jobs), `bkit-renovate.yml` (`Renovate`) and `bkit-trivy.yml` (`Trivy`) → `bkit-*`; a job `name:` is inserted under `renovate:` / `trivy:` when the workflow name was rewritten and the job has none; the old `bkit-stub:health` block in the `bkit.testing.ciWorkflow` file → the current block. A customised line stays. One log line per renamed check names old and new and says to update branch protection. Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
-| Vale style `House` → `Bkit` | `.bkit/core/engine/install/modules/core.ts` (`migrateValeHouseStyle`, `SHIPPED_HOUSE_RULE_HASHES`, called by `runBkitDocs`) | `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml` matching a shipped release move to `.vale/styles/Bkit/` when absent; an edited rule or a taken target stays with a warning naming the manual move. `.vale.ini` `House.<moved>` → `Bkit.<moved>`; `BasedOnStyles` swaps `House` for `Bkit` once `House/` is empty (directory removed), else appends `Bkit`. Own rules stay. Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
+| Vale style `House` → `Bkit` | `.bkit/core/engine/install/modules/core.ts` (`migrateValeHouseStyle`, `SHIPPED_HOUSE_RULE_HASHES`, called by `runBkitDocs`) | `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml` matching a shipped release move to `.vale/styles/Bkit/` when absent; an edited rule, a taken target or a symlinked rule stays with a warning naming the manual move; a symlinked `.vale`, `.vale/styles`, `House` or `Bkit` directory leaves the rules unmoved with a warning. `.vale.ini` `House.<moved>` → `Bkit.<moved>`; `BasedOnStyles` swaps `House` for `Bkit` once `House/` is empty (directory removed), else appends `Bkit`. Own rules stay. Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 
 ## Detect-only guards
 
