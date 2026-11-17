diff --git a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
index 104ecd73f..5f29fc494 100644
--- a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
@@ -1216,6 +1216,35 @@ describe(".husky/pre-push min push", () => {
       expect(r.calls).toContain("bkit:gate:min");
     });
 
+    it(`${hook}: audit report to dev under a [skip ci] head → allowed, light gate`, () => {
+      const head = commitFiles(
+        { "docs/audits/202611/security.md": "# Report\n" },
+        "docs(1): audit report bkit [skip ci]",
+      );
+      const r = push(hook, head, "refs/heads/dev");
+      expect(r.status).toBe(0);
+      expect(r.stderr).not.toContain("CI-suppressing token");
+      expect(r.calls).toContain("bkit:gate:min");
+      expect(r.calls).not.toContain("bkit:gate:static-unit");
+    });
+
+    it(`${hook}: audit-template project section to dev under a [skip ci] head → allowed, light gate`, () => {
+      const template = (project: string) =>
+        `<!-- bkit:start -->\n<!-- managed-version: 1 -->\nblock\n<!-- bkit:end -->\n\n## Project Instructions\n${project}\n`;
+      const file = "docs/templates/bkit-audit-x.md";
+      const remote = commitFiles({ [file]: template("old") }, "docs(1): add template");
+      gitIn("update-ref", "refs/remotes/origin/dev", remote);
+      const head = commitFiles(
+        { [file]: template("new project text") },
+        "docs(1): audit project section bkit [skip ci]",
+      );
+      const r = push(hook, head, "refs/heads/dev", remote);
+      expect(r.status).toBe(0);
+      expect(r.stderr).not.toContain("CI-suppressing token");
+      expect(r.calls).toContain("bkit:gate:min");
+      expect(r.calls).not.toContain("bkit:gate:static-unit");
+    });
+
     it(`${hook}: code to dev with a clean head → not blocked, full gate`, () => {
       const r = push(hook, commitFiles({ "src/a.ts": "b\n" }, "feat(1): a"), "refs/heads/dev");
       expect(r.status).toBe(0);
diff --git a/.bkit/core/engine/commands/ci/ci.test.ts b/.bkit/core/engine/commands/ci/ci.test.ts
index 82f612bf0..28407eeb2 100644
--- a/.bkit/core/engine/commands/ci/ci.test.ts
+++ b/.bkit/core/engine/commands/ci/ci.test.ts
@@ -1071,4 +1071,171 @@ describe("bkit ci min-push", () => {
     expect(noBase.code).toBe(7);
     expect(noBase.err).toContain("neither origin/dev nor origin/main");
   });
+
+  it("exits 0 when every changed file is an audit report under docs/audits", async () => {
+    const { cwd, head } = pushed({
+      "docs/audits/202611/security.md": "# Report\n",
+      "docs/audits/202611/deep/nested/slug.md": "# Report\n",
+    });
+    const r = await run(cwd, [`--ref=${head}`], "min-push");
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ minPush: true, reason: null, changed: 2, outside: [] });
+    expect(r.json.paths).toContain(":(glob)docs/audits/**");
+  });
+
+  /** An installed audit template: managed block with a version stamp, then the project section. */
+  const auditTemplate = (block: string, project: string, end = "<!-- bkit:end -->") =>
+    `<!-- bkit:start -->\n<!-- managed-version: 1 -->\n${block}\n${end}\n\n## Project Instructions\n${project}\n`;
+  const T1 = "docs/templates/bkit-audit-one.md";
+  const T2 = "docs/templates/bkit-audit-two.md";
+
+  /** A repo whose `origin/dev` commit holds `before`, then a head commit applying `after` (null deletes). */
+  function pushedFrom(
+    before: Record<string, string>,
+    after: Record<string, string | null>,
+    pkg?: unknown,
+  ) {
+    const cwd = mkdir("bkit-ci-tpl-");
+    git(cwd, "init", "-q", "-b", "feat/1-x");
+    write(cwd, "src/a.ts", "export {};\n");
+    if (pkg !== undefined) write(cwd, "package.json", JSON.stringify(pkg));
+    for (const [rel, body] of Object.entries(before)) write(cwd, rel, body);
+    const base = commit(cwd, "base");
+    git(cwd, "update-ref", "refs/remotes/origin/dev", base);
+    for (const [rel, body] of Object.entries(after)) {
+      if (body === null) fs.rmSync(path.join(cwd, rel));
+      else write(cwd, rel, body);
+    }
+    const head = commit(cwd, "docs(1): audit bkit [skip ci]");
+    return { cwd, base, head };
+  }
+
+  const belowOnly = {
+    before: { [T1]: auditTemplate("block", "old") },
+    after: { [T1]: auditTemplate("block", "new project text") },
+  };
+
+  /** Pushes `after` over `before` with the below-only `T1` beside it. */
+  async function pushBeside(before: Record<string, string>, after: Record<string, string | null>) {
+    const { cwd, head } = pushedFrom(
+      { ...belowOnly.before, ...before },
+      { ...belowOnly.after, ...after },
+    );
+    return run(cwd, [`--ref=${head}`], "min-push");
+  }
+
+  it("exits 0 when an audit template changes only below its bkit:end, and says why", async () => {
+    const { cwd, head } = pushedFrom(belowOnly.before, belowOnly.after);
+    const r = await run(cwd, [`--ref=${head}`], "min-push");
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ minPush: true, reason: null, changed: 1, outside: [] });
+    expect(r.err).toContain(`${T1}: only its project section below <!-- bkit:end --> changed`);
+  });
+
+  it("refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end", async () => {
+    const r = await pushBeside(
+      { [T2]: auditTemplate("block", "p") },
+      { [T2]: auditTemplate("changed block", "p") },
+    );
+    expect(r.code).toBe(1);
+    expect(r.json).toMatchObject({ minPush: false, reason: "outside" });
+    expect(r.json.outside).toEqual([T2]);
+  });
+
+  it("refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end", async () => {
+    const r = await pushBeside(
+      { [T2]: auditTemplate("block", "p") },
+      { [T2]: auditTemplate("changed block", "p2") },
+    );
+    expect(r.code).toBe(1);
+    expect(r.json).toMatchObject({ minPush: false, reason: "outside" });
+    expect(r.json.outside).toEqual([T2]);
+  });
+
+  it("refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end", async () => {
+    const r = await pushBeside(
+      { [T2]: auditTemplate("block", "p") },
+      { [T2]: auditTemplate("block", "p", "<!-- bkit:end -->  ") },
+    );
+    expect(r.code).toBe(1);
+    expect(r.json).toMatchObject({ minPush: false, reason: "outside" });
+    expect(r.json.outside).toEqual([T2]);
+  });
+
+  it("refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end", async () => {
+    const r = await pushBeside({}, { [T2]: auditTemplate("block", "p") });
+    expect(r.code).toBe(1);
+    expect(r.json).toMatchObject({ minPush: false, reason: "outside" });
+    expect(r.json.outside).toEqual([T2]);
+  });
+
+  it("refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end", async () => {
+    const r = await pushBeside({ [T2]: auditTemplate("block", "p") }, { [T2]: null });
+    expect(r.code).toBe(1);
+    expect(r.json).toMatchObject({ minPush: false, reason: "outside" });
+    expect(r.json.outside).toEqual([T2]);
+  });
+
+  it("refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end", async () => {
+    const renamed = "docs/templates/bkit-audit-renamed.md";
+    const r = await pushBeside(
+      { [T2]: auditTemplate("block", "p") },
+      { [T2]: null, [renamed]: auditTemplate("block", "p") },
+    );
+    expect(r.code).toBe(1);
+    expect(r.json).toMatchObject({ minPush: false, reason: "outside" });
+    expect(r.json.outside).toEqual([renamed, T2]);
+  });
+
+  it("refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end", async () => {
+    const r = await pushBeside(
+      { [T2]: auditTemplate("block", "p") },
+      { [T2]: auditTemplate("block", "p\n<!-- bkit:end -->\nmore") },
+    );
+    expect(r.code).toBe(1);
+    expect(r.json).toMatchObject({ minPush: false, reason: "outside" });
+    expect(r.json.outside).toEqual([T2]);
+  });
+
+  it("refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below", async () => {
+    const plan = "docs/templates/bkit-plan.md";
+    const r = await pushBeside(
+      { [plan]: auditTemplate("block", "p") },
+      { [plan]: auditTemplate("block", "p changed") },
+    );
+    expect(r.code).toBe(1);
+    expect(r.json).toMatchObject({ minPush: false, reason: "outside" });
+    expect(r.json.outside).toEqual([plan]);
+  });
+
+  it("refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below", async () => {
+    const nested = "docs/templates/sub/bkit-audit-x.md";
+    const r = await pushBeside(
+      { [nested]: auditTemplate("block", "p") },
+      { [nested]: auditTemplate("block", "p changed") },
+    );
+    expect(r.code).toBe(1);
+    expect(r.json).toMatchObject({ minPush: false, reason: "outside" });
+    expect(r.json.outside).toEqual([nested]);
+  });
+
+  it("--update exits 0 when the update changes only an audit template's project section, and logs the template once", async () => {
+    const { cwd, base, head } = pushedFrom(belowOnly.before, belowOnly.after);
+    const r = await run(cwd, [`--update=${base}:${head}`], "min-push");
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ minPush: true, reason: null, outside: [] });
+    const line = `${T1}: only its project section below <!-- bkit:end --> changed`;
+    expect(r.err.split(line).length - 1).toBe(1);
+  });
+
+  it("--update exits 1 and lists only the code file when a project-section edit ships beside a code file", async () => {
+    const { cwd, base, head } = pushedFrom(belowOnly.before, {
+      ...belowOnly.after,
+      "src/a.ts": "export const a = 1;\n",
+    });
+    const r = await run(cwd, [`--update=${base}:${head}`], "min-push");
+    expect(r.code).toBe(1);
+    expect(r.json).toMatchObject({ minPush: false, reason: "outside" });
+    expect(r.json.outside).toEqual(["src/a.ts"]);
+  });
 });
diff --git a/.bkit/core/engine/commands/ci/ci.ts b/.bkit/core/engine/commands/ci/ci.ts
index 100b299c4..e20e21ce6 100644
--- a/.bkit/core/engine/commands/ci/ci.ts
+++ b/.bkit/core/engine/commands/ci/ci.ts
@@ -17,7 +17,7 @@
 // (`SKIP_CI_TOKEN`), for the `.husky/pre-push` CI-suppressor guard.
 //
 // `min-push` — whether every file a push changes is one bkit's workflows write (ship's bookkeeping
-// allow-list, the plans tree) or one `bkit.testing.minPushPaths` / `ciSkipPaths` adds, so
+// allow-list, the plans tree, the audit reports) or one `bkit.testing.minPushPaths` / `ciSkipPaths` adds, so
 // `.husky/pre-push` runs `bkit:gate:min`. Files decide, never `[skip ci]` (a typed label
 // GitHub reads off the last commit only).
 //
@@ -53,8 +53,10 @@ import {
   bookPathspecs,
   changedOutside,
   checkOnlyBookkeeping,
+  gitRaw,
   globPathspecs,
 } from "../workflow/ledgers.js";
+import { managedHead } from "../../install/managed-block.js";
 import { pins } from "./pins.js";
 import { hasVerifiedIncrement, runPushGate } from "./push-gate.js";
 
@@ -602,14 +604,14 @@ function skipToken(ctx: RunContext): number {
 /**
  * The min-push pathspecs: ship's `pr` bookkeeping allow-list for every month and feature
  * (the same list `bkit ci bookkeeping-push` and the ship gate accept untested, including
- * `bkit.testing.ciSkipPaths`), the plans tree bkit's workflows write, and whatever the repo
+ * `bkit.testing.ciSkipPaths`), the plans tree and audit reports bkit's workflows write, and whatever the repo
  * adds in `bkit.testing.minPushPaths` (`:(glob)` unless an entry carries its own magic).
  * The engine hardcodes no consumer file: the floor is what bkit itself writes.
  */
 export function minPushPathspecs(cfg: Pick<BkitConfig, "minPushPaths" | "ciSkipPaths">): string[] {
   return [
     ...bookPathspecs("*", "*", "pr", cfg.ciSkipPaths),
-    ...globPathspecs(["docs/plans/**", ...cfg.minPushPaths]),
+    ...globPathspecs(["docs/plans/**", "docs/audits/**", ...cfg.minPushPaths]),
   ];
 }
 
@@ -623,6 +625,48 @@ export function pushBase(cwd: string, sha: string): string | null {
   return null;
 }
 
+/** An audit template the project owns below its managed block; no other template qualifies. */
+const AUDIT_TEMPLATE_RE = /^docs\/templates\/bkit-audit-[^/]+\.md$/;
+
+export type MinPushOutside =
+  | { ok: true; changed: string[]; outside: string[]; sections: string[] }
+  | { ok: false; stderr: string };
+
+/**
+ * `changedOutside` plus the audit-template exception: a top-level `docs/templates/bkit-audit-*.md`
+ * present at both commits whose text through the `bkit:end` line is identical at both (so only
+ * the project section below it changed) is moved from `outside` to `sections`.
+ */
+export function minPushOutside(
+  root: string,
+  from: string,
+  to: string,
+  paths: readonly string[],
+): MinPushOutside {
+  const diff = changedOutside(root, from, to, paths);
+  if (!diff.ok) return diff;
+  const sections: string[] = [];
+  const outside: string[] = [];
+  const head = (sha: string, file: string): string | null => {
+    const res = gitRaw(root, ["cat-file", "blob", `${sha}:${file}`]);
+    return res.status === 0 ? managedHead(res.stdout) : null;
+  };
+  for (const file of diff.outside) {
+    if (AUDIT_TEMPLATE_RE.test(file)) {
+      const before = head(from, file);
+      if (before !== null && before === head(to, file)) {
+        sections.push(file);
+        continue;
+      }
+    }
+    outside.push(file);
+  }
+  return { ok: true, changed: diff.changed, outside, sections };
+}
+
+const sectionNote = (file: string) =>
+  `${file}: only its project section below <!-- bkit:end --> changed`;
+
 function minPush(ctx: RunContext): number {
   const top = runGit(ctx.cwd, ["rev-parse", "--show-toplevel"]);
   if (!top.ok) throw new CommandError(EXIT.USAGE, `not inside a git repository: ${ctx.cwd}`);
@@ -640,10 +684,11 @@ function minPush(ctx: RunContext): number {
 
   const changed = new Set<string>();
   const outside = new Set<string>();
+  const sections = new Set<string>();
   for (const ref of refs) {
     const sha = git(ctx.cwd, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
     const base = sha ? (baseFlag ?? pushBase(ctx.cwd, sha)) : null;
-    const diff = sha && base ? changedOutside(top.stdout, base, sha, paths) : null;
+    const diff = sha && base ? minPushOutside(top.stdout, base, sha, paths) : null;
     if (!diff?.ok) {
       const why = !sha
         ? `cannot read commit '${ref}'`
@@ -656,7 +701,9 @@ function minPush(ctx: RunContext): number {
     }
     for (const p of diff.changed) changed.add(p);
     for (const p of diff.outside) outside.add(p);
+    for (const p of diff.sections) sections.add(p);
   }
+  for (const p of [...sections].sort()) ctx.log(sectionNote(p));
 
   const result = (reason: string | null, code: number, message: string) => {
     ctx.log(message);
@@ -686,6 +733,7 @@ function minPush(ctx: RunContext): number {
 function minPushUpdates(ctx: RunContext, cwd: string, updates: string[], paths: string[]): number {
   const changed = new Set<string>();
   const outside = new Set<string>();
+  const sections = new Set<string>();
   let unknown = false;
   let failed = false;
   for (const update of updates) {
@@ -699,17 +747,19 @@ function minPushUpdates(ctx: RunContext, cwd: string, updates: string[], paths:
       unknown = true;
       continue;
     }
-    const increment = isNew ? null : changedOutside(cwd, oldSha, newSha, paths);
+    const increment = isNew ? null : minPushOutside(cwd, oldSha, newSha, paths);
     const base = pushBase(cwd, newSha);
-    const whole = base ? changedOutside(cwd, base, newSha, paths) : null;
-    if (hasVerifiedIncrement(cwd, oldSha, newSha, paths)) {
+    const whole = base ? minPushOutside(cwd, base, newSha, paths) : null;
+    if (hasVerifiedIncrement(cwd, oldSha, newSha, (a, b) => minPushOutside(cwd, a, b, paths))) {
       if (increment?.ok) for (const file of increment.changed) changed.add(file);
+      if (increment?.ok) for (const file of increment.sections) sections.add(file);
       ctx.log(`${oldSha}..${newSha}: covered by a successful full push gate`);
       continue;
     }
     if (whole?.ok) {
       for (const file of whole.changed) changed.add(file);
       for (const file of whole.outside) outside.add(file);
+      for (const file of whole.sections) sections.add(file);
       if (
         whole.changed.length > 0 &&
         whole.outside.length === 0 &&
@@ -719,6 +769,7 @@ function minPushUpdates(ctx: RunContext, cwd: string, updates: string[], paths:
     } else unknown = true;
     failed = true;
   }
+  for (const file of [...sections].sort()) ctx.log(sectionNote(file));
   const reason = !failed ? null : unknown ? "unknown" : outside.size ? "outside" : "no-changes";
   ctx.emit({
     minPush: !failed,
@@ -890,12 +941,14 @@ export const ciCommand: CommandSpec = {
         },
       ],
       output: {
-        minPush: "true when every changed file matches a min-push path",
+        minPush:
+          "true when every changed file matches a min-push path, or is a docs/templates/bkit-audit-*.md changed only below its <!-- bkit:end -->",
         reason: "null when a min push; else no-changes | outside | unknown",
         changed: "files the push changes, across every ref",
-        outside: "the changed files no min-push path matches",
+        outside:
+          "the changed files no min-push path matches (an audit template changed only below its <!-- bkit:end --> is not listed)",
         paths:
-          "the min-push pathspecs in force: ship's pr bookkeeping allow-list (with bkit.testing.ciSkipPaths), docs/plans/**, bkit.testing.minPushPaths",
+          "the min-push pathspecs in force: ship's pr bookkeeping allow-list (with bkit.testing.ciSkipPaths), docs/plans/**, docs/audits/**, bkit.testing.minPushPaths",
       },
       exitCodes: {
         [EXIT_RANGE_UNKNOWN]: "a pushed commit, its base, or its git diff could not be read",
diff --git a/.bkit/core/engine/commands/ci/push-gate.test.ts b/.bkit/core/engine/commands/ci/push-gate.test.ts
index de81d7cce..cb62b3d27 100644
--- a/.bkit/core/engine/commands/ci/push-gate.test.ts
+++ b/.bkit/core/engine/commands/ci/push-gate.test.ts
@@ -200,6 +200,21 @@ describe("verified incremental push gates", () => {
     expect((await min(cwd, bookkeeping, empty)).status).toBe(0);
     expect((await run(cwd, "min-push", `--ref=${empty}`)).status).toBe(1);
   });
+  it("a full-gate receipt carries an audit template's project-section increment to the minimum gate", async () => {
+    const file = "docs/templates/bkit-audit-x.md";
+    const template = (project: string) =>
+      `<!-- bkit:start -->\n<!-- managed-version: 1 -->\nblock\n<!-- bkit:end -->\n\n## Project Instructions\n${project}\n`;
+    const { cwd } = fixture();
+    write(cwd, file, template("old"));
+    const checked = commit(cwd, "add audit template");
+    expect((await gate(cwd)).status).toBe(0);
+    write(cwd, file, template("new project text"));
+    const edited = commit(cwd, "edit project section");
+    expect((await min(cwd, checked, edited)).status).toBe(0);
+    write(cwd, file, template("new project text").replace("block", "changed block"));
+    const above = commit(cwd, "edit managed block");
+    expect((await min(cwd, edited, above)).status).toBe(1);
+  });
   it("requires proof even when the pushed increment changes no files", async () => {
     const { cwd, code } = fixture();
     expect((await min(cwd, code, commit(cwd, "trigger"))).status).toBe(1);
diff --git a/.bkit/core/engine/commands/ci/push-gate.ts b/.bkit/core/engine/commands/ci/push-gate.ts
index 1c7c0490f..3f75735f7 100644
--- a/.bkit/core/engine/commands/ci/push-gate.ts
+++ b/.bkit/core/engine/commands/ci/push-gate.ts
@@ -9,7 +9,6 @@ import { parseJson, readJsonFile } from "../../shared/json.js";
 import { readPackageJson } from "../../shared/package-json.js";
 import { scriptCommand, testCommand } from "../../shared/package-manager.js";
 import { EXIT, git, outboxRoot, runGit } from "../lib.js";
-import { changedOutside } from "../workflow/ledgers.js";
 
 const UNIT = "bkit:gate:static-unit";
 const INTEGRATION = "bkit:gate:static-unit-integration";
@@ -189,7 +188,7 @@ export function hasVerifiedIncrement(
   cwd: string,
   oldSha: string,
   newSha: string,
-  paths: string[],
+  outsideOf: (from: string, to: string) => { ok: true; outside: string[] } | { ok: false },
 ): boolean {
   if (
     !SHA.test(oldSha) ||
@@ -215,7 +214,7 @@ export function hasVerifiedIncrement(
   for (const sha of ancestors.split("\n")) {
     const file = path.join(dir, `${sha}.json`);
     if (!validReceipt(cwd, file, sha, definition)) continue;
-    const diff = changedOutside(cwd, sha, newSha, paths);
+    const diff = outsideOf(sha, newSha);
     if (diff.ok && diff.outside.length === 0 && noLaterFailure(cwd, dir, sha, newSha, definition))
       return true;
   }
diff --git a/.bkit/core/engine/commands/land.test.ts b/.bkit/core/engine/commands/land.test.ts
index d4fd593a9..ce608d8f0 100644
--- a/.bkit/core/engine/commands/land.test.ts
+++ b/.bkit/core/engine/commands/land.test.ts
@@ -225,6 +225,44 @@ describe("pushToDev", () => {
     },
   );
 
+  it("runs docs/audits/202611/logs.md through its declared gate in the built checkout", async () => {
+    const file = "docs/audits/202611/logs.md";
+    const { root, dir } = fixture({
+      script: `if (!fs.existsSync(${JSON.stringify(file)})) process.exit(9);`,
+    });
+    const res = await pushToDev({
+      root,
+      dir,
+      build: (d) => {
+        fs.mkdirSync(path.dirname(path.join(d, file)), { recursive: true });
+        commitIn(d, file, "# Report\n");
+      },
+      log: () => {},
+    });
+    expect(res.kind).toBe("landed");
+    expect(fs.readFileSync(path.join(root, ".git", "gate-runs"), "utf8")).toBe("min\n");
+  });
+
+  it("runs an audit template's project-section change through bkit:gate:min", async () => {
+    const file = "docs/templates/bkit-audit-x.md";
+    const template = (project: string) =>
+      `<!-- bkit:start -->\n<!-- managed-version: 1 -->\nblock\n<!-- bkit:end -->\n\n## Project Instructions\n${project}\n`;
+    const { root, dir } = fixture();
+    fs.mkdirSync(path.join(root, "docs", "templates"), { recursive: true });
+    fs.writeFileSync(path.join(root, file), template("old"));
+    git(root, "add", "-A");
+    git(root, "commit", "-qm", "add audit template");
+    git(root, "push", "-q", "origin", "dev");
+    const res = await pushToDev({
+      root,
+      dir,
+      build: (d) => commitIn(d, file, template("new project text")),
+      log: () => {},
+    });
+    expect(res.kind).toBe("landed");
+    expect(fs.readFileSync(path.join(root, ".git", "gate-runs"), "utf8")).toBe("min\n");
+  });
+
   it.each([
     { script: "process.exit(7);" },
     { script: "fs.writeFileSync('notes.txt', 'gate mutation');" },
diff --git a/.bkit/core/engine/commands/land.ts b/.bkit/core/engine/commands/land.ts
index 0039e247c..25e2178c7 100644
--- a/.bkit/core/engine/commands/land.ts
+++ b/.bkit/core/engine/commands/land.ts
@@ -17,9 +17,8 @@ import { gitEnv } from "../ledgers/telemetry.js";
 import { readBkitConfig } from "../shared/settings.js";
 import { readPackageJson } from "../shared/package-json.js";
 import { installCommand } from "../shared/package-manager.js";
-import { minPushPathspecs } from "./ci/ci.js";
+import { minPushOutside, minPushPathspecs } from "./ci/ci.js";
 import { requiredPushGate, runPushGate } from "./ci/push-gate.js";
-import { changedOutside } from "./workflow/ledgers.js";
 
 const REMOTE = "origin";
 const UPSTREAM = `${REMOTE}/${DEV}`;
@@ -195,7 +194,7 @@ function checkLanding(root: string, dir: string, base: string, log: (line: strin
     throw new CommandError(EXIT.NO, "landing checkout is not clean — nothing pushed");
   if (!readPackageJson(dir).ok)
     throw new CommandError(EXIT.NO, "landing package.json is unreadable — nothing pushed");
-  const diff = changedOutside(dir, base, head!, minPushPathspecs(readBkitConfig(dir)));
+  const diff = minPushOutside(dir, base, head!, minPushPathspecs(readBkitConfig(dir)));
   if (!diff.ok) throw new CommandError(EXIT.NO, `cannot classify landing: ${diff.stderr}`);
   const gate = diff.outside.length === 0 ? "bkit:gate:min" : requiredPushGate(dir);
   if (!gate) throw new CommandError(EXIT.NO, "landing has no declared full gate — nothing pushed");
diff --git a/.bkit/core/engine/commands/workflow/ledgers.ts b/.bkit/core/engine/commands/workflow/ledgers.ts
index df92b5754..f513bce2c 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.ts
@@ -166,7 +166,7 @@ interface GitResult {
 }
 
 /** `git <args>` in `cwd`, never throwing and never trimming (NUL-delimited output). */
-function gitRaw(
+export function gitRaw(
   cwd: string,
   args: string[],
   env: NodeJS.ProcessEnv = {},
diff --git a/.bkit/core/engine/install/managed-block.test.ts b/.bkit/core/engine/install/managed-block.test.ts
index d41d109cc..32d713c17 100644
--- a/.bkit/core/engine/install/managed-block.test.ts
+++ b/.bkit/core/engine/install/managed-block.test.ts
@@ -10,6 +10,7 @@ import {
   extractManagedBlock,
   findLineAnchoredMarkers,
   findUnmarkedCopy,
+  managedHead,
   stripManagedWrapper,
 } from "./managed-block";
 
@@ -357,3 +358,34 @@ describe("stripManagedWrapper historical notices", () => {
     }
   });
 });
+
+// ---------------------------------------------------------------------------
+// managedHead
+// ---------------------------------------------------------------------------
+
+describe("managedHead", () => {
+  const head =
+    "# Title\n<!-- bkit:start -->\n<!-- managed-version: 1 -->\nBody\n<!-- bkit:end -->\n";
+  const tail = "\n## Project Instructions\nMine\n";
+
+  it("returns the text through the bkit:end line", () => {
+    expect(managedHead(head + tail)).toBe(head);
+    expect(managedHead(head + "\n## Other\n")).toBe(head);
+  });
+
+  it("returns null when the file has no markers", () => {
+    expect(managedHead("# Title\n\n## Project Instructions\n")).toBeNull();
+  });
+
+  it("returns null when the file has two bkit:end lines", () => {
+    expect(managedHead(head + "<!-- bkit:end -->\n" + tail)).toBeNull();
+  });
+
+  it("returns null when the file has a second bkit:start line below bkit:end", () => {
+    expect(managedHead(head + "<!-- bkit:start -->\n" + tail)).toBeNull();
+  });
+
+  it("returns null when bkit:end comes before bkit:start", () => {
+    expect(managedHead("<!-- bkit:end -->\nx\n<!-- bkit:start -->\ny\n" + tail)).toBeNull();
+  });
+});
diff --git a/.bkit/core/engine/install/managed-block.ts b/.bkit/core/engine/install/managed-block.ts
index 594371a53..3ab32a9ba 100644
--- a/.bkit/core/engine/install/managed-block.ts
+++ b/.bkit/core/engine/install/managed-block.ts
@@ -107,6 +107,22 @@ export function extractManagedBlock(
   return inner.replace(/^\n+/, "").replace(/\n+$/, "");
 }
 
+// The text from the first byte through the end-marker line (newline included). Null unless
+// the file has exactly one start marker and one end marker, start first. Used to tell a
+// change below the block from a change to the block or the text above it.
+export function managedHead(
+  content: string,
+  markerStyle: MarkerStyle = "html-comment",
+): string | null {
+  const [startMarker, endMarker] = selectMarkers(markerStyle);
+  const starts = findLineAnchoredMarkers(content, startMarker);
+  const ends = findLineAnchoredMarkers(content, endMarker);
+  if (starts.length !== 1 || ends.length !== 1) return null;
+  if (starts[0]! >= ends[0]!) return null;
+  const endLineEnd = content.indexOf("\n", ends[0]! + endMarker.length);
+  return endLineEnd === -1 ? content : content.slice(0, endLineEnd + 1);
+}
+
 // Extract the FULL bkit-managed block INCLUDING marker lines from a file.
 // markerStyle defaults to "html-comment".
 // Used to append a fresh block to a destination that has none. Markers may be
diff --git a/.bkit/core/engine/install/modules/core.ts b/.bkit/core/engine/install/modules/core.ts
index 32b0236da..11802bb1b 100644
--- a/.bkit/core/engine/install/modules/core.ts
+++ b/.bkit/core/engine/install/modules/core.ts
@@ -606,7 +606,7 @@ export const SEEDED_BKIT_DEFAULTS: Readonly<Record<string, unknown>> = {
   cloud: { agent: "" },
   providers: { opencode: { default: "", installed: [] } },
   testing: {
-    // What bkit writes (ship's bookkeeping allow-list, the plans tree) is always a min push;
+    // What bkit writes (ship's bookkeeping allow-list, the plans tree, docs/audits/**) is always a min push;
     // the seed adds nothing, because a project doc can be a test's input.
     minPushPaths: [...CONFIG_DEFAULTS.minPushPaths],
     ciWorkflow: CONFIG_DEFAULTS.ciWorkflow,
@@ -1517,7 +1517,7 @@ export const BKIT_LAYOUT_MOVES: readonly (readonly [string, string])[] = [
 
 // Migration (up to 6.0.x installs, `docs/migrations.md`): `bkit.testing.minPushPaths` was the
 // whole min-push list, so installs seeded and repos restated what bkit itself writes. The
-// engine now always allows that floor (ship's bookkeeping allow-list, `docs/plans/**`) and
+// engine now always allows that floor (ship's bookkeeping allow-list, `docs/plans/**`, `docs/audits/**`) and
 // `bkit.testing.ciSkipPaths`; the setting only adds. Entries the floor already covers are
 // dropped from the list. Returns true when package.json changed.
 export const MIN_PUSH_FLOOR_ENTRIES: readonly string[] = [
diff --git a/.bkit/core/engine/shared/settings.ts b/.bkit/core/engine/shared/settings.ts
index ee44695ff..6016ae0c7 100644
--- a/.bkit/core/engine/shared/settings.ts
+++ b/.bkit/core/engine/shared/settings.ts
@@ -131,7 +131,7 @@ export interface BkitConfig {
   ciRequired: string[];
   /**
    * Globs (`:(glob)` git pathspecs) for paths a push may carry, on top of what bkit's
-   * workflows write (ship's bookkeeping allow-list, `docs/plans/**`, `ciSkipPaths`), and
+   * workflows write (ship's bookkeeping allow-list, `docs/plans/**`, `docs/audits/**`, `ciSkipPaths`), and
    * still run only `bkit:gate:min` in `.husky/pre-push`; empty = that floor alone.
    */
   minPushPaths: string[];
diff --git a/DETAILS.md b/DETAILS.md
index a3b6c4743..9c916ce84 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -347,8 +347,8 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>257 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1816 symbols · 53 files"]
-    n_bkit_core_engine_install["install<br/>351 symbols · 21 files"]
+    n_bkit_core_engine_commands["commands<br/>1818 symbols · 53 files"]
+    n_bkit_core_engine_install["install<br/>352 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>237 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>150 symbols · 13 files<br/>1 open finding"]
@@ -356,7 +356,7 @@ flowchart LR
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   n_bkit_core_engine_commands -->|459| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|406| n_bkit_core_engine_shared
-  n_bkit_core_engine_commands -->|216| n_bkit_core_engine_install
+  n_bkit_core_engine_commands -->|219| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|180| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|145| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|83| n_bkit_core_engine_checks
diff --git a/dist/commands/ci/ci.js b/dist/commands/ci/ci.js
index 86511a0d9..c78d3390f 100644
--- a/dist/commands/ci/ci.js
+++ b/dist/commands/ci/ci.js
@@ -17,7 +17,7 @@
 // (`SKIP_CI_TOKEN`), for the `.husky/pre-push` CI-suppressor guard.
 //
 // `min-push` — whether every file a push changes is one bkit's workflows write (ship's bookkeeping
-// allow-list, the plans tree) or one `bkit.testing.minPushPaths` / `ciSkipPaths` adds, so
+// allow-list, the plans tree, the audit reports) or one `bkit.testing.minPushPaths` / `ciSkipPaths` adds, so
 // `.husky/pre-push` runs `bkit:gate:min`. Files decide, never `[skip ci]` (a typed label
 // GitHub reads off the last commit only).
 //
@@ -36,7 +36,8 @@ import * as path from "node:path";
 import { gitEnv } from "../../ledgers/telemetry.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { CommandError, commitMessage, EXIT, OUTPUT_LIMIT, git, parseJson, runGit, SKIP_CI_TOKEN, } from "../lib.js";
-import { bookPathspecs, changedOutside, checkOnlyBookkeeping, globPathspecs, } from "../workflow/ledgers.js";
+import { bookPathspecs, changedOutside, checkOnlyBookkeeping, gitRaw, globPathspecs, } from "../workflow/ledgers.js";
+import { managedHead } from "../../install/managed-block.js";
 import { pins } from "./pins.js";
 import { hasVerifiedIncrement, runPushGate } from "./push-gate.js";
 /** Exit code: slop-scan could not be started (not installed, not executable). */
@@ -526,14 +527,14 @@ function skipToken(ctx) {
 /**
  * The min-push pathspecs: ship's `pr` bookkeeping allow-list for every month and feature
  * (the same list `bkit ci bookkeeping-push` and the ship gate accept untested, including
- * `bkit.testing.ciSkipPaths`), the plans tree bkit's workflows write, and whatever the repo
+ * `bkit.testing.ciSkipPaths`), the plans tree and audit reports bkit's workflows write, and whatever the repo
  * adds in `bkit.testing.minPushPaths` (`:(glob)` unless an entry carries its own magic).
  * The engine hardcodes no consumer file: the floor is what bkit itself writes.
  */
 export function minPushPathspecs(cfg) {
     return [
         ...bookPathspecs("*", "*", "pr", cfg.ciSkipPaths),
-        ...globPathspecs(["docs/plans/**", ...cfg.minPushPaths]),
+        ...globPathspecs(["docs/plans/**", "docs/audits/**", ...cfg.minPushPaths]),
     ];
 }
 /** Where a pushed commit's range starts: its merge-base with origin/dev, else origin/main. */
@@ -547,6 +548,36 @@ export function pushBase(cwd, sha) {
     }
     return null;
 }
+/** An audit template the project owns below its managed block; no other template qualifies. */
+const AUDIT_TEMPLATE_RE = /^docs\/templates\/bkit-audit-[^/]+\.md$/;
+/**
+ * `changedOutside` plus the audit-template exception: a top-level `docs/templates/bkit-audit-*.md`
+ * present at both commits whose text through the `bkit:end` line is identical at both (so only
+ * the project section below it changed) is moved from `outside` to `sections`.
+ */
+export function minPushOutside(root, from, to, paths) {
+    const diff = changedOutside(root, from, to, paths);
+    if (!diff.ok)
+        return diff;
+    const sections = [];
+    const outside = [];
+    const head = (sha, file) => {
+        const res = gitRaw(root, ["cat-file", "blob", `${sha}:${file}`]);
+        return res.status === 0 ? managedHead(res.stdout) : null;
+    };
+    for (const file of diff.outside) {
+        if (AUDIT_TEMPLATE_RE.test(file)) {
+            const before = head(from, file);
+            if (before !== null && before === head(to, file)) {
+                sections.push(file);
+                continue;
+            }
+        }
+        outside.push(file);
+    }
+    return { ok: true, changed: diff.changed, outside, sections };
+}
+const sectionNote = (file) => `${file}: only its project section below <!-- bkit:end --> changed`;
 function minPush(ctx) {
     const top = runGit(ctx.cwd, ["rev-parse", "--show-toplevel"]);
     if (!top.ok)
@@ -564,10 +595,11 @@ function minPush(ctx) {
     }
     const changed = new Set();
     const outside = new Set();
+    const sections = new Set();
     for (const ref of refs) {
         const sha = git(ctx.cwd, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
         const base = sha ? (baseFlag ?? pushBase(ctx.cwd, sha)) : null;
-        const diff = sha && base ? changedOutside(top.stdout, base, sha, paths) : null;
+        const diff = sha && base ? minPushOutside(top.stdout, base, sha, paths) : null;
         if (!diff?.ok) {
             const why = !sha
                 ? `cannot read commit '${ref}'`
@@ -582,7 +614,11 @@ function minPush(ctx) {
             changed.add(p);
         for (const p of diff.outside)
             outside.add(p);
+        for (const p of diff.sections)
+            sections.add(p);
     }
+    for (const p of [...sections].sort())
+        ctx.log(sectionNote(p));
     const result = (reason, code, message) => {
         ctx.log(message);
         ctx.emit({
@@ -606,6 +642,7 @@ function minPush(ctx) {
 function minPushUpdates(ctx, cwd, updates, paths) {
     const changed = new Set();
     const outside = new Set();
+    const sections = new Set();
     let unknown = false;
     let failed = false;
     for (const update of updates) {
@@ -620,13 +657,16 @@ function minPushUpdates(ctx, cwd, updates, paths) {
             unknown = true;
             continue;
         }
-        const increment = isNew ? null : changedOutside(cwd, oldSha, newSha, paths);
+        const increment = isNew ? null : minPushOutside(cwd, oldSha, newSha, paths);
         const base = pushBase(cwd, newSha);
-        const whole = base ? changedOutside(cwd, base, newSha, paths) : null;
-        if (hasVerifiedIncrement(cwd, oldSha, newSha, paths)) {
+        const whole = base ? minPushOutside(cwd, base, newSha, paths) : null;
+        if (hasVerifiedIncrement(cwd, oldSha, newSha, (a, b) => minPushOutside(cwd, a, b, paths))) {
             if (increment?.ok)
                 for (const file of increment.changed)
                     changed.add(file);
+            if (increment?.ok)
+                for (const file of increment.sections)
+                    sections.add(file);
             ctx.log(`${oldSha}..${newSha}: covered by a successful full push gate`);
             continue;
         }
@@ -635,6 +675,8 @@ function minPushUpdates(ctx, cwd, updates, paths) {
                 changed.add(file);
             for (const file of whole.outside)
                 outside.add(file);
+            for (const file of whole.sections)
+                sections.add(file);
             if (whole.changed.length > 0 &&
                 whole.outside.length === 0 &&
                 (isNew || (increment?.ok && increment.changed.length > 0)))
@@ -644,6 +686,8 @@ function minPushUpdates(ctx, cwd, updates, paths) {
             unknown = true;
         failed = true;
     }
+    for (const file of [...sections].sort())
+        ctx.log(sectionNote(file));
     const reason = !failed ? null : unknown ? "unknown" : outside.size ? "outside" : "no-changes";
     ctx.emit({
         minPush: !failed,
@@ -783,11 +827,11 @@ export const ciCommand = {
                 },
             ],
             output: {
-                minPush: "true when every changed file matches a min-push path",
+                minPush: "true when every changed file matches a min-push path, or is a docs/templates/bkit-audit-*.md changed only below its <!-- bkit:end -->",
                 reason: "null when a min push; else no-changes | outside | unknown",
                 changed: "files the push changes, across every ref",
-                outside: "the changed files no min-push path matches",
-                paths: "the min-push pathspecs in force: ship's pr bookkeeping allow-list (with bkit.testing.ciSkipPaths), docs/plans/**, bkit.testing.minPushPaths",
+                outside: "the changed files no min-push path matches (an audit template changed only below its <!-- bkit:end --> is not listed)",
+                paths: "the min-push pathspecs in force: ship's pr bookkeeping allow-list (with bkit.testing.ciSkipPaths), docs/plans/**, docs/audits/**, bkit.testing.minPushPaths",
             },
             exitCodes: {
                 [EXIT_RANGE_UNKNOWN]: "a pushed commit, its base, or its git diff could not be read",
diff --git a/dist/commands/ci/push-gate.js b/dist/commands/ci/push-gate.js
index 895093e67..cafeca33b 100644
--- a/dist/commands/ci/push-gate.js
+++ b/dist/commands/ci/push-gate.js
@@ -9,7 +9,6 @@ import { parseJson, readJsonFile } from "../../shared/json.js";
 import { readPackageJson } from "../../shared/package-json.js";
 import { scriptCommand, testCommand } from "../../shared/package-manager.js";
 import { EXIT, git, outboxRoot, runGit } from "../lib.js";
-import { changedOutside } from "../workflow/ledgers.js";
 const UNIT = "bkit:gate:static-unit";
 const INTEGRATION = "bkit:gate:static-unit-integration";
 const SHA = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;
@@ -163,7 +162,7 @@ function noLaterFailure(cwd, dir, sha, newSha, definition) {
     return true;
 }
 /** A bounded ancestor search; absent, malformed or stale proof always requires the full gate. */
-export function hasVerifiedIncrement(cwd, oldSha, newSha, paths) {
+export function hasVerifiedIncrement(cwd, oldSha, newSha, outsideOf) {
     if (!SHA.test(oldSha) ||
         !SHA.test(newSha) ||
         /^0+$/.test(oldSha) ||
@@ -186,7 +185,7 @@ export function hasVerifiedIncrement(cwd, oldSha, newSha, paths) {
         const file = path.join(dir, `${sha}.json`);
         if (!validReceipt(cwd, file, sha, definition))
             continue;
-        const diff = changedOutside(cwd, sha, newSha, paths);
+        const diff = outsideOf(sha, newSha);
         if (diff.ok && diff.outside.length === 0 && noLaterFailure(cwd, dir, sha, newSha, definition))
             return true;
     }
diff --git a/dist/commands/land.js b/dist/commands/land.js
index 56654a62f..936da032c 100644
--- a/dist/commands/land.js
+++ b/dist/commands/land.js
@@ -16,9 +16,8 @@ import { gitEnv } from "../ledgers/telemetry.js";
 import { readBkitConfig } from "../shared/settings.js";
 import { readPackageJson } from "../shared/package-json.js";
 import { installCommand } from "../shared/package-manager.js";
-import { minPushPathspecs } from "./ci/ci.js";
+import { minPushOutside, minPushPathspecs } from "./ci/ci.js";
 import { requiredPushGate, runPushGate } from "./ci/push-gate.js";
-import { changedOutside } from "./workflow/ledgers.js";
 const REMOTE = "origin";
 const UPSTREAM = `${REMOTE}/${DEV}`;
 /** dev moved before git sent anything: git compared the remote's dev and stopped. */
@@ -169,7 +168,7 @@ function checkLanding(root, dir, base, log) {
         throw new CommandError(EXIT.NO, "landing checkout is not clean — nothing pushed");
     if (!readPackageJson(dir).ok)
         throw new CommandError(EXIT.NO, "landing package.json is unreadable — nothing pushed");
-    const diff = changedOutside(dir, base, head, minPushPathspecs(readBkitConfig(dir)));
+    const diff = minPushOutside(dir, base, head, minPushPathspecs(readBkitConfig(dir)));
     if (!diff.ok)
         throw new CommandError(EXIT.NO, `cannot classify landing: ${diff.stderr}`);
     const gate = diff.outside.length === 0 ? "bkit:gate:min" : requiredPushGate(dir);
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index 6e0b8e744..d247e45c8 100644
--- a/dist/commands/workflow/ledgers.js
+++ b/dist/commands/workflow/ledgers.js
@@ -82,7 +82,7 @@ const UNION_PATHSPECS = [
     ":(exclude).bkit/issues.jsonl",
 ];
 /** `git <args>` in `cwd`, never throwing and never trimming (NUL-delimited output). */
-function gitRaw(cwd, args, env = {}, input) {
+export function gitRaw(cwd, args, env = {}, input) {
     const res = spawnSync("git", args, {
         cwd,
         encoding: "utf-8",
diff --git a/dist/install/managed-block.js b/dist/install/managed-block.js
index fc309f065..f61003bf6 100644
--- a/dist/install/managed-block.js
+++ b/dist/install/managed-block.js
@@ -88,6 +88,20 @@ export function extractManagedBlock(content, markerStyle = "html-comment") {
     const inner = startLineEnd === -1 ? "" : content.slice(startLineEnd + 1, lineStartOf(content, ends[0]));
     return inner.replace(/^\n+/, "").replace(/\n+$/, "");
 }
+// The text from the first byte through the end-marker line (newline included). Null unless
+// the file has exactly one start marker and one end marker, start first. Used to tell a
+// change below the block from a change to the block or the text above it.
+export function managedHead(content, markerStyle = "html-comment") {
+    const [startMarker, endMarker] = selectMarkers(markerStyle);
+    const starts = findLineAnchoredMarkers(content, startMarker);
+    const ends = findLineAnchoredMarkers(content, endMarker);
+    if (starts.length !== 1 || ends.length !== 1)
+        return null;
+    if (starts[0] >= ends[0])
+        return null;
+    const endLineEnd = content.indexOf("\n", ends[0] + endMarker.length);
+    return endLineEnd === -1 ? content : content.slice(0, endLineEnd + 1);
+}
 // Extract the FULL bkit-managed block INCLUDING marker lines from a file.
 // markerStyle defaults to "html-comment".
 // Used to append a fresh block to a destination that has none. Markers may be
diff --git a/dist/install/modules/core.js b/dist/install/modules/core.js
index a57805f4c..d1ac2d310 100644
--- a/dist/install/modules/core.js
+++ b/dist/install/modules/core.js
@@ -504,7 +504,7 @@ export const SEEDED_BKIT_DEFAULTS = {
     cloud: { agent: "" },
     providers: { opencode: { default: "", installed: [] } },
     testing: {
-        // What bkit writes (ship's bookkeeping allow-list, the plans tree) is always a min push;
+        // What bkit writes (ship's bookkeeping allow-list, the plans tree, docs/audits/**) is always a min push;
         // the seed adds nothing, because a project doc can be a test's input.
         minPushPaths: [...CONFIG_DEFAULTS.minPushPaths],
         ciWorkflow: CONFIG_DEFAULTS.ciWorkflow,
@@ -1324,7 +1324,7 @@ export const BKIT_LAYOUT_MOVES = [
 ];
 // Migration (up to 6.0.x installs, `docs/migrations.md`): `bkit.testing.minPushPaths` was the
 // whole min-push list, so installs seeded and repos restated what bkit itself writes. The
-// engine now always allows that floor (ship's bookkeeping allow-list, `docs/plans/**`) and
+// engine now always allows that floor (ship's bookkeeping allow-list, `docs/plans/**`, `docs/audits/**`) and
 // `bkit.testing.ciSkipPaths`; the setting only adds. Entries the floor already covers are
 // dropped from the list. Returns true when package.json changed.
 export const MIN_PUSH_FLOOR_ENTRIES = [
diff --git a/docs/capabilities.md b/docs/capabilities.md
index e6ed84f50..b2fef7595 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -85,10 +85,10 @@ Not scanned; run the rollup with `--reachability`.

<!-- prettier-ignore -->
 | File | Evaluates at import | Downstream files | of which tests |
 | --- | --- | --- | --- |
 | `.bkit/core/engine/shared/text.ts` | `Symbol` | 210 | 127 |
-| `.bkit/core/engine/checks/after/ci-yml.ts` | `CI_SCRIPT_UNITS.flat` | 194 | 117 |
-| `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 194 | 117 |
-| `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 194 | 117 |
-| `.bkit/core/engine/commands/workflow/workflows.ts` | `Error` | 194 | 117 |
+| `.bkit/core/engine/checks/after/ci-yml.ts` | `CI_SCRIPT_UNITS.flat` | 193 | 117 |
+| `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 193 | 117 |
+| `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 193 | 117 |
+| `.bkit/core/engine/commands/workflow/workflows.ts` | `Error` | 193 | 117 |
 
 1 further file nothing imports, though an entrypoint is supposed to do work when it loads. In the JSON report only.
 
@@ -164,8 +164,8 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>257 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1816 symbols · 53 files"]
-    n_bkit_core_engine_install["install<br/>351 symbols · 21 files"]
+    n_bkit_core_engine_commands["commands<br/>1818 symbols · 53 files"]
+    n_bkit_core_engine_install["install<br/>352 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>237 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>150 symbols · 13 files<br/>1 open finding"]
@@ -173,7 +173,7 @@ flowchart LR
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   n_bkit_core_engine_commands -->|459| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|406| n_bkit_core_engine_shared
-  n_bkit_core_engine_commands -->|216| n_bkit_core_engine_install
+  n_bkit_core_engine_commands -->|219| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|180| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|145| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|83| n_bkit_core_engine_checks
@@ -298,7 +298,7 @@ flowchart LR
     end
     subgraph gn_bkit_core_engine_commands[".bkit/core/engine/commands"]
       subgraph gn_bkit_core_engine_commands_ci[".bkit/core/engine/commands/ci"]
-        n_bkit_core_engine_commands_ci_ci["ci<br/>43 symbols · 1 files"]
+        n_bkit_core_engine_commands_ci_ci["ci<br/>45 symbols · 1 files"]
         n_bkit_core_engine_commands_ci_pins["pins<br/>10 symbols · 1 files"]
         n_bkit_core_engine_commands_ci_push_gate["push-gate<br/>11 symbols · 1 files"]
       end
@@ -342,7 +342,7 @@ flowchart LR
       end
     end
     subgraph gn_bkit_core_engine_install[".bkit/core/engine/install"]
-      n_bkit_core_engine_install_managed_block["managed-block<br/>21 symbols · 1 files"]
+      n_bkit_core_engine_install_managed_block["managed-block<br/>22 symbols · 1 files"]
       subgraph gn_bkit_core_engine_install_modules[".bkit/core/engine/install/modules"]
         n_bkit_core_engine_install_modules_antigravity["antigravity<br/>7 symbols · 1 files"]
         n_bkit_core_engine_install_modules_claude["claude<br/>6 symbols · 1 files"]
@@ -461,6 +461,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_tracker -->|12| n_bkit_core_engine_shared_json
   n_bkit_core_engine_install_modules_core -->|12| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_analysis -->|11| n_bkit_core_engine_ledgers_telemetry
+  n_bkit_core_engine_commands_ci_ci -->|11| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_install_uninstall -->|11| n_bkit_core_engine_install_write
   n_bkit_core_engine_commands_workflow_locks -->|11| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_steps -->|11| n_bkit_core_engine_commands_workflow_ledgers
@@ -470,7 +471,6 @@ flowchart LR
   n_bkit_core_engine_install_modules_opencode -->|11| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_shared_settings -->|11| n_bkit_core_engine_install_manifest
   n_bkit_core_engine_checks_before_index -->|10| n_bkit_core_engine_checks_before_context_fetch
-  n_bkit_core_engine_commands_ci_ci -->|10| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_install_upgrade -->|10| n_bkit_core_engine_install_manifest
   n_bkit_core_engine_commands_workflow_branches -->|10| n_bkit_core_engine_shared_branches
   n_bkit_core_engine_commands_workflow_context -->|10| n_bkit_core_engine_commands_workflow_plan_blocks
