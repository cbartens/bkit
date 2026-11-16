diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index bca5a0008..915f835ca 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -89,7 +89,7 @@ Sync, push, land and rebase branches; stamp and read a doc's base-commit anchor.
 | `regenerate` | workflow | `--fid` `--attempt` `--file` | Run a declared bkit:generate on the feature branch and commit only the paths it changed (ship Step 10's fix round). |
 | `push` | workflow | **`--mode`** `--set-upstream` `--ahead-of` `--commit` `--label` `--file` `--workflow` `--require-ci` `--open-pr` `--fid` | Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise; 81 tests lock held. |
 | `fast-forward` | workflow | **`--onto`** | Fetch a remote branch and fast-forward the checkout onto it; refuse when diverged. |
-| `scan-diff` | by hand | **`--base`** `--paths` `--marker` `--code` `--disabled-tests` `--expect-none` | Exit 0 when the branch's diff from --base matches (paths, an added marker line, a source change, or a disabled test); 1 when not — --disabled-tests turns that round: 1 when a test was disabled or lost an assertion, 0 when none was. |
+| `scan-diff` | by hand | `--base` `--paths` `--marker` `--code` `--disabled-tests` `--expect-none` | Exit 0 when the branch's diff from --base matches (paths, an added marker line, a source change, or a disabled test); 1 when not — --disabled-tests turns that round: 1 when a test was disabled or lost an assertion, 0 when none was. |
 | `force-build` | workflow | **`--fid`** **`--file`** **`--workflow`** `--label` `--open-pr` `--title-set` | Force a full CI build: put [force build] on the open PR's title, then push an empty marker commit (once per run). |
 | `rebase` | workflow | `--log-file` `--sentinel` `--file` | Drive a rebase to completion, auto-resolving ledger (union), lockfile (regenerate), generated-register (take the target's copy, rebuild after), embedded generated-block (take the target's block, merge the rest, rebuild after) and install-record (merge entry by entry, the target's value where both changed) conflicts; refuse and abort on anything else. |
 | `sync-dev` | workflow | — | After a merge, fast-forward local dev to origin/dev without checking it out or pushing; frozen install when the main checkout is on dev and moved. |
diff --git a/.bkit/core/engine/commands/conventions.test.ts b/.bkit/core/engine/commands/conventions.test.ts
index b30ca91b9..c70934d71 100644
--- a/.bkit/core/engine/commands/conventions.test.ts
+++ b/.bkit/core/engine/commands/conventions.test.ts
@@ -170,6 +170,8 @@ const HELPER_SOURCES = new Set([
   path.join("commands", "workflow", "plan-blocks.ts"),
   // Where a named test sits in its file and what it runs, read by `tests` and `branches`.
   path.join("commands", "workflow", "test-blocks.ts"),
+  // The commit a feature's work starts after and its diff range, read by `context diff`, `challenge`, `branches` and `status`.
+  path.join("commands", "workflow", "feature-base.ts"),
   // The `tests changed` verb, registered on `bkit tests` in tests.ts.
   path.join("commands", "workflow", "tests-changed.ts"),
   // The `tests jump` verb, registered on `bkit tests` in tests.ts.
diff --git a/.bkit/core/engine/commands/workflow/branches.test.ts b/.bkit/core/engine/commands/workflow/branches.test.ts
index 2d6cb0f29..46ac139e6 100644
--- a/.bkit/core/engine/commands/workflow/branches.test.ts
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -2171,6 +2171,20 @@ describe("branches scan-diff", { timeout: GIT_TIMEOUT }, () => {
     expect(r.json).toEqual({ found: true, paths: ["src/x.ts"] });
   });
 
+  it("scan-diff without --base ignores a match that only an unpushed local dev commit adds", async () => {
+    const { clone } = withOrigin("scan-nobase");
+    commit(clone, { "src/dev.ts": "log('[DEBUG-OBSERVE] dev')\n" }, "unpushed dev");
+    git(clone, "checkout", "-q", "-b", "feat/1-x");
+    commit(clone, { "a.txt": "a\n" }, "feat(1-x): work");
+    const clean = await run(clone, ["scan-diff", "--marker=[DEBUG-OBSERVE]"]);
+    expect(clean.code).toBe(1);
+    expect(clean.json).toEqual({ found: false, paths: [] });
+    commit(clone, { "src/x.ts": "log('[DEBUG-OBSERVE] x')\n" }, "probe");
+    const r = await run(clone, ["scan-diff", "--marker=[DEBUG-OBSERVE]"]);
+    expect(r.code).toBe(0);
+    expect(r.json).toEqual({ found: true, paths: ["src/x.ts"] });
+  });
+
   it("--marker reads a diff over 1 MiB", async () => {
     const { clone } = featureBranch("scan-bigdiff");
     const big = `${"x".repeat(99)}\n`.repeat(12_000);
diff --git a/.bkit/core/engine/commands/workflow/branches.ts b/.bkit/core/engine/commands/workflow/branches.ts
index 357faee30..5ab3ee321 100644
--- a/.bkit/core/engine/commands/workflow/branches.ts
+++ b/.bkit/core/engine/commands/workflow/branches.ts
@@ -76,6 +76,7 @@ import {
 import { AUTO_LABEL, AUTO_ROUTE_SUFFIX } from "./issues.js";
 import { appendFeature } from "./roadmap.js";
 import { detect } from "./runtime.js";
+import { defaultRange } from "./feature-base.js";
 import { readRuns, readStatusRows, readStatusRowsAt } from "./status.js";
 import { declaredName, testSource } from "./test-blocks.js";
 import {
@@ -1662,7 +1663,7 @@ export function disabledTestsIn(diff: string, root: string): DisabledTest[] {
 }
 
 function scanDiffVerb(ctx: RunContext): number {
-  const base = String(ctx.flags.base);
+  const explicitBase = str(ctx.flags.base);
   const pattern = str(ctx.flags.paths);
   const marker = str(ctx.flags.marker);
   const code = ctx.flags.code === true;
@@ -1688,7 +1689,9 @@ function scanDiffVerb(ctx: RunContext): number {
     }
   }
   const top = topLevel(ctx.cwd);
-  const fetched = fetchRemoteRef(top, base);
+  const fallback = explicitBase === undefined ? defaultRange(top, ctx.log) : null;
+  const base = explicitBase ?? fallback!.base;
+  const fetched = explicitBase === undefined ? null : fetchRemoteRef(top, base);
   if (fetched !== null && !fetched.ok) {
     ctx.log(`git fetch for ${base} failed: ${fetched.stderr} — diffing against the local ref`);
   }
@@ -1696,7 +1699,7 @@ function scanDiffVerb(ctx: RunContext): number {
     ctx.log(`unknown base: ${base}`);
     return EXIT_DIFF_FAILED;
   }
-  const range = `${base}...HEAD`;
+  const range = fallback?.range ?? `${base}...HEAD`;
   if (disabled) {
     const diff = quietGit(top, ["diff", "--no-renames", range, "--", ".", ":(exclude)docs/plans"]);
     if (!diff.ok) {
@@ -3705,8 +3708,7 @@ export const branchesCommand: CommandSpec = {
         {
           name: "base",
           type: "string",
-          required: true,
-          help: "diff <base>...HEAD; an origin/<branch> base is fetched first",
+          help: "diff <base>...HEAD; an origin/<branch> base is fetched first (default: the feature base, where the branch's own work starts)",
         },
         {
           name: "paths",
diff --git a/.bkit/core/engine/commands/workflow/challenge.test.ts b/.bkit/core/engine/commands/workflow/challenge.test.ts
index 867fc1ae9..5f408dae7 100644
--- a/.bkit/core/engine/commands/workflow/challenge.test.ts
+++ b/.bkit/core/engine/commands/workflow/challenge.test.ts
@@ -852,6 +852,7 @@ describe("bkit challenge gate", () => {
     write(STATUS, "");
     commitAll("base");
     g("update-ref", "refs/remotes/origin/dev", "HEAD");
+    g("checkout", "-q", "-b", "feat/1-x");
     write("src/a.ts", "a\nb\nc\n");
     write(PLAN, plan(40));
     commitAll("work");
@@ -922,6 +923,7 @@ describe("bkit challenge gate", () => {
     write(STATUS, "");
     commitAll("base");
     g("update-ref", "refs/remotes/origin/dev", "HEAD");
+    g("checkout", "-q", "-b", "feat/1-x");
     write("src/a.ts", "a\nb\n");
     commitAll("work");
     const r = await gate(`--file=${STATUS}`);
@@ -930,6 +932,29 @@ describe("bkit challenge gate", () => {
     expect(r.err).toContain("git fetch origin dev failed");
   });
 
+  it("challenge gate without --base sizes only the branch's own lines", async () => {
+    g("init", "-q", "-b", "dev");
+    write("src/a.ts", "a\n");
+    write(STATUS, "");
+    commitAll("base");
+    g("update-ref", "refs/remotes/origin/dev", "HEAD");
+    // Local dev is ahead of origin/dev by a large commit the branch is cut from.
+    write("src/big.ts", Array.from({ length: 300 }, (_, i) => `line ${i}`).join("\n") + "\n");
+    commitAll("unpushed dev work");
+    g("checkout", "-q", "-b", "feat");
+    write("src/a.ts", "a\nb\n");
+    commitAll("work");
+
+    const r = await gate(`--file=${STATUS}`);
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({
+      size: "small",
+      skipped: true,
+      linesChanged: 1,
+      filesChanged: 1,
+    });
+  });
+
   it("challenge gate exits 5 when --base names no commit", async () => {
     g("init", "-q", "-b", "dev");
     write(STATUS, "");
diff --git a/.bkit/core/engine/commands/workflow/challenge.ts b/.bkit/core/engine/commands/workflow/challenge.ts
index fe927c209..497002c86 100644
--- a/.bkit/core/engine/commands/workflow/challenge.ts
+++ b/.bkit/core/engine/commands/workflow/challenge.ts
@@ -26,7 +26,8 @@ import * as path from "node:path";
 
 import { appendLine, statusTimestamp } from "../../ledgers/status.js";
 import { CommandError, DEV, EXIT, git, runGit, type CommandSpec } from "../lib.js";
-import { DIFF_BASE, EXIT_BASE, diffNumstat, type DiffStat } from "./context.js";
+import { EXIT_BASE, diffNumstat, type DiffStat } from "./context.js";
+import { defaultRange } from "./feature-base.js";
 import { parseDecisionItems } from "./decisions.js";
 import { EXIT_ROW_REFUSED, EXIT_STAGE, appendLedgerRows } from "./ledgers.js";
 import { derivedTestMatrix, parsePlanBlocks, type PlanTaskBlock } from "./plan-blocks.js";
@@ -549,7 +550,7 @@ export const challengeCommand: CommandSpec = {
         {
           name: "base",
           type: "string",
-          help: `merge base (default ${DIFF_BASE}, fetched first; a failed fetch is logged, not fatal)`,
+          help: "merge base (default: the feature base, after fetching origin dev; a failed fetch is logged, not fatal)",
         },
       ],
       output: {
@@ -562,17 +563,19 @@ export const challengeCommand: CommandSpec = {
       },
       exitCodes: { [EXIT_BASE]: "--base does not name a commit" },
       run: (ctx) => {
-        const base = typeof ctx.flags.base === "string" ? ctx.flags.base : DIFF_BASE;
-        if (base === DIFF_BASE) {
+        const explicitBase = typeof ctx.flags.base === "string" ? ctx.flags.base : undefined;
+        if (explicitBase === undefined) {
           const res = runGit(ctx.cwd, ["fetch", "origin", DEV]);
           if (!res.ok)
             ctx.log(
               `git fetch origin dev failed — measuring against the last fetch: ${res.stderr}`,
             );
         }
+        const fallback = explicitBase === undefined ? defaultRange(ctx.cwd, ctx.log) : null;
+        const base = explicitBase ?? fallback!.base;
         if (git(ctx.cwd, ["rev-parse", "-q", "--verify", `${base}^{commit}`]) === null)
           throw new CommandError(EXIT_BASE, `--base ${base} does not name a commit (fetch origin)`);
-        const range = `${base}...HEAD`;
+        const range = fallback?.range ?? `${base}...HEAD`;
         const { stat } = diffNumstat(ctx.cwd, range);
         const gate = challengeGate(stat);
         const file = path.resolve(ctx.cwd, String(ctx.flags.file));
diff --git a/.bkit/core/engine/commands/workflow/context.test.ts b/.bkit/core/engine/commands/workflow/context.test.ts
index 25f488d0d..17460a2ae 100644
--- a/.bkit/core/engine/commands/workflow/context.test.ts
+++ b/.bkit/core/engine/commands/workflow/context.test.ts
@@ -12,6 +12,7 @@ import {
   FENCE_OPEN,
   consumerSection,
   contextCommand,
+  featureBase,
   fetchBlocks,
   humanBytes,
   keepRaw,
@@ -1374,6 +1375,7 @@ describe("bkit context diff", () => {
 
   it("writes origin/dev...HEAD without docs/plans/** and prints the numstat numbers", async () => {
     const dir = repo("whole");
+    g(dir, "checkout", "-q", "-b", "feat/1-x");
     put(dir, "src.txt", "a\nb\nc\n");
     put(dir, "new.txt", "one\ntwo\nthree\n");
     put(dir, "docs/plans/202610/1-x-plan.md", "plan v2\nmore\n");
@@ -1466,6 +1468,7 @@ describe("bkit context diff", () => {
 
   it("an empty range writes a one-line note and zero numbers", async () => {
     const dir = repo("empty");
+    g(dir, "checkout", "-q", "-b", "feat/1-x");
     put(dir, "docs/plans/202610/1-x-plan.md", "plan v2\n");
     commitAll(dir, "plan only");
     const r = await run(["diff", `--artifact=${ARTIFACT}`], dir);
@@ -1483,6 +1486,7 @@ describe("bkit context diff", () => {
 
   it("over the guard: the first line says so, then --stat, then the largest files first, each cut", async () => {
     const dir = repo("guard");
+    g(dir, "checkout", "-q", "-b", "feat/1-x");
     put(dir, "big.txt", numbered(12000, "big"));
     put(dir, "mid.txt", numbered(700, "mid"));
     put(dir, "small.txt", "s1\ns2\n");
@@ -1599,6 +1603,135 @@ describe("bkit context diff", () => {
 // brief
 // ---------------------------------------------------------------------------
 
+describe("featureBase (#960)", () => {
+  const g = (dir: string, ...args: string[]) =>
+    spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
+      cwd: dir,
+      encoding: "utf-8",
+    }).stdout.trim();
+  const put = (dir: string, file: string, content: string) => {
+    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
+    fs.writeFileSync(path.join(dir, file), content);
+  };
+  const commitAll = (dir: string, msg: string) => {
+    g(dir, "add", "-A");
+    g(dir, "commit", "-q", "-m", msg);
+    return g(dir, "rev-parse", "HEAD");
+  };
+  /** A repo on `dev` whose one base commit is also `origin/dev`. */
+  function repo(name: string): { dir: string; base: string } {
+    const dir = path.join(tmpDir, "feature-base", name);
+    fs.mkdirSync(dir, { recursive: true });
+    g(dir, "init", "-q", "-b", "dev");
+    put(dir, "src.txt", "a\nb\n");
+    const base = commitAll(dir, "base");
+    g(dir, "update-ref", "refs/remotes/origin/dev", base);
+    return { dir, base };
+  }
+  /** A commit on top of `origin/dev` that only origin/dev holds; leaves HEAD where it was. */
+  function advanceOrigin(dir: string, file: string, content: string): string {
+    const head = g(dir, "rev-parse", "HEAD");
+    g(dir, "checkout", "-q", "--detach", "origin/dev");
+    put(dir, file, content);
+    const sha = commitAll(dir, `origin ${file}`);
+    g(dir, "update-ref", "refs/remotes/origin/dev", sha);
+    g(dir, "checkout", "-q", head);
+    return sha;
+  }
+
+  it("featureBase picks the local dev meeting point when the branch was cut from a local dev ahead of origin/dev", () => {
+    const { dir } = repo("local-ahead");
+    put(dir, "unpushed.txt", "u\n");
+    const l1 = commitAll(dir, "unpushed dev");
+    g(dir, "checkout", "-q", "-b", "feat/1-x");
+    put(dir, "f.txt", "f\n");
+    commitAll(dir, "feat work");
+    expect(featureBase(dir)).toBe(l1);
+  });
+
+  it("featureBase picks the origin/dev meeting point when local dev equals origin/dev", () => {
+    const { dir, base } = repo("equal");
+    g(dir, "checkout", "-q", "-b", "feat/1-x");
+    put(dir, "f.txt", "f\n");
+    commitAll(dir, "feat work");
+    expect(featureBase(dir)).toBe(base);
+  });
+
+  it("featureBase picks the origin/dev meeting point when the branch was cut from origin/dev and local dev diverged", () => {
+    const { dir, base } = repo("diverged");
+    put(dir, "unpushed.txt", "u\n");
+    commitAll(dir, "unpushed dev");
+    g(dir, "checkout", "-q", "-b", "feat/1-x", "origin/dev");
+    put(dir, "f.txt", "f\n");
+    commitAll(dir, "feat work");
+    expect(featureBase(dir)).toBe(base);
+  });
+
+  it("featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev", () => {
+    const { dir } = repo("combine");
+    put(dir, "l.txt", "l\n");
+    const l1 = commitAll(dir, "unpushed dev");
+    g(dir, "checkout", "-q", "-b", "feat/1-x");
+    const o1 = advanceOrigin(dir, "o.txt", "o\n");
+    put(dir, "f.txt", "f\n");
+    commitAll(dir, "feat work");
+    g(dir, "merge", "-q", "--no-edit", "origin/dev");
+    const result = featureBase(dir);
+    expect(result).toMatch(/^[0-9a-f]{40}$/);
+    expect(result).not.toBe(l1);
+    expect(result).not.toBe(o1);
+    expect(g(dir, "rev-list", "--parents", "-n", "1", result).split(" ").slice(1).sort()).toEqual(
+      [l1, o1].sort(),
+    );
+    // Neither the unpushed dev commit nor origin's commit counts as the feature's.
+    expect(g(dir, "diff", "--name-only", result, "HEAD")).toBe("f.txt");
+  });
+
+  it("featureBase falls back to the origin/dev meeting point and logs when the combination conflicts", () => {
+    const { dir } = repo("conflict");
+    put(dir, "src.txt", "a\nlocal\n");
+    const l1 = commitAll(dir, "unpushed dev");
+    g(dir, "checkout", "-q", "-b", "feat/1-x");
+    const o1 = advanceOrigin(dir, "src.txt", "a\norigin\n");
+    put(dir, "f.txt", "f\n");
+    commitAll(dir, "feat work");
+    g(dir, "merge", "-q", "--no-edit", "origin/dev");
+    put(dir, "src.txt", "a\nresolved\n");
+    commitAll(dir, "resolve");
+    expect(g(dir, "merge-base", "HEAD", "dev")).toBe(l1);
+    const lines: string[] = [];
+    const result = featureBase(dir, (line) => lines.push(line));
+    expect(result).toBe(o1);
+    expect(lines).toHaveLength(1);
+  });
+
+  it("featureBase uses the origin/dev meeting point when there is no local dev", () => {
+    const { dir, base } = repo("no-dev");
+    g(dir, "checkout", "-q", "-b", "feat/1-x");
+    put(dir, "f.txt", "f\n");
+    commitAll(dir, "feat work");
+    g(dir, "branch", "-q", "-D", "dev");
+    expect(featureBase(dir)).toBe(base);
+  });
+
+  it("context diff without --base leaves out an unpushed local dev commit", async () => {
+    const { dir } = repo("diff-unpushed");
+    put(dir, "unpushed.txt", "u\n");
+    commitAll(dir, "unpushed dev");
+    g(dir, "checkout", "-q", "-b", "feat/1-x");
+    put(dir, "f.txt", "f\n");
+    commitAll(dir, "feat work");
+    const artifact = "docs/plans/202610/logs/1-x/build-diff-1.md";
+    const r = await run(["diff", `--artifact=${artifact}`], dir);
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ filesChanged: 1, linesAdded: 1 });
+    expect(r.json.base).not.toBe("origin/dev");
+    const body = read(path.join(dir, artifact));
+    expect(body).toContain("f.txt");
+    expect(body).not.toContain("unpushed.txt");
+  });
+});
+
 describe("bkit context brief", () => {
   const task = (n: number, title: string, done: boolean, extra: string[] = []) => [
     `<!-- bkit:task ${n} start -->`,
diff --git a/.bkit/core/engine/commands/workflow/context.ts b/.bkit/core/engine/commands/workflow/context.ts
index 2c78ff508..7876bc806 100644
--- a/.bkit/core/engine/commands/workflow/context.ts
+++ b/.bkit/core/engine/commands/workflow/context.ts
@@ -53,6 +53,9 @@ import {
 import { gitEnv, resolveRepoSlug } from "../../ledgers/telemetry.js";
 import { parseJson } from "../../shared/json.js";
 import { checkedTable } from "../../shared/text.js";
+import { defaultRange } from "./feature-base.js";
+
+export { defaultRange, featureBase } from "./feature-base.js";
 import { buildComment } from "./issues.js";
 import {
   derivedTestMatrix,
@@ -830,7 +833,6 @@ function asCaptured(out: Buffer): Buffer {
 /** Exit code: --base does not name a commit. */
 export const EXIT_BASE = 5;
 
-export const DIFF_BASE = "origin/dev";
 export const DIFF_EXCLUDES = ["docs/plans/**"];
 export const PARTIAL_MARK = "partial diff coverage";
 
@@ -1462,7 +1464,7 @@ export const contextCommand: CommandSpec = {
         {
           name: "base",
           type: "string",
-          help: `merge base or a group's start commit (default ${DIFF_BASE})`,
+          help: "merge base or a group's start commit (default: the feature base, where the branch's own work starts)",
         },
         ...LOG_FLAGS,
         {
@@ -1492,7 +1494,9 @@ export const contextCommand: CommandSpec = {
         [EXIT_ARTIFACT]: "the artifact could not be written",
       },
       run: (ctx) => {
-        const base = str(ctx.flags.base) ?? DIFF_BASE;
+        const explicitBase = str(ctx.flags.base);
+        const fallback = explicitBase === undefined ? defaultRange(ctx.cwd, ctx.log) : null;
+        const base = explicitBase ?? fallback!.base;
         if (git(ctx.cwd, ["rev-parse", "-q", "--verify", `${base}^{commit}`]) === null) {
           throw new CommandError(
             EXIT_BASE,
@@ -1511,7 +1515,7 @@ export const contextCommand: CommandSpec = {
           ctx.cwd,
           path.resolve(ctx.cwd, artifact),
           artifact,
-          `${base}...HEAD`,
+          fallback?.range ?? `${base}...HEAD`,
           DIFF_GUARD,
           { rawDir: rawDirFor(ctx.cwd, str(ctx.flags.fid)) },
         );
diff --git a/.bkit/core/engine/commands/workflow/feature-base.test.ts b/.bkit/core/engine/commands/workflow/feature-base.test.ts
new file mode 100644
index 000000000..7dbf2d6b9
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/feature-base.test.ts
@@ -0,0 +1,56 @@
+import { spawnSync } from "node:child_process";
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+
+import { afterEach, describe, expect, it } from "vitest";
+
+import { defaultRange, featureBase } from "./feature-base.js";
+
+const dirs: string[] = [];
+
+function g(dir: string, ...args: string[]): string {
+  const r = spawnSync("git", args, { cwd: dir, encoding: "utf-8" });
+  return r.stdout.trim();
+}
+
+function commit(dir: string, file: string, text: string): string {
+  fs.writeFileSync(path.join(dir, file), text);
+  g(dir, "add", "-A");
+  g(dir, "-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", file);
+  return g(dir, "rev-parse", "HEAD");
+}
+
+function repo(): { dir: string; base: string } {
+  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "feature-base-"));
+  dirs.push(dir);
+  g(dir, "init", "-q", "-b", "dev");
+  const base = commit(dir, "a.txt", "a");
+  g(dir, "update-ref", "refs/remotes/origin/dev", "HEAD");
+  g(dir, "checkout", "-q", "-b", "feat/1-x");
+  return { dir, base };
+}
+
+afterEach(() => {
+  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
+});
+
+describe("featureBase and defaultRange", () => {
+  it("name the origin/dev meeting point when local dev has not moved", () => {
+    const { dir, base } = repo();
+    commit(dir, "b.txt", "b");
+    expect(featureBase(dir)).toBe(base);
+    expect(defaultRange(dir)).toEqual({ base: "origin/dev", range: "origin/dev...HEAD" });
+  });
+
+  it("read from local dev's tip when the branch was cut after local dev moved ahead", () => {
+    const { dir } = repo();
+    g(dir, "checkout", "-q", "dev");
+    const ahead = commit(dir, "c.txt", "c");
+    g(dir, "checkout", "-q", "feat/1-x");
+    g(dir, "reset", "-q", "--hard", "dev");
+    commit(dir, "b.txt", "b");
+    expect(featureBase(dir)).toBe(ahead);
+    expect(defaultRange(dir)).toEqual({ base: ahead, range: `${ahead}..HEAD` });
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/feature-base.ts b/.bkit/core/engine/commands/workflow/feature-base.ts
new file mode 100644
index 000000000..71f2663a5
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/feature-base.ts
@@ -0,0 +1,64 @@
+// The commit a feature's own work starts after, and the diff range measured from it.
+// Kept apart from context.ts and status.ts so both can import it without an import cycle.
+
+import { git } from "../lib.js";
+
+const ORIGIN_DEV = "origin/dev";
+
+/**
+ * The commit the feature's own work starts after: the later of HEAD's meeting points with
+ * `origin/dev` and with local `dev`. Neither later than the other (origin/dev was merged
+ * into a branch cut from local dev) → a commit of the two merged, with both as parents;
+ * a conflict there → the `origin/dev` meeting point, logged once. No `origin/dev` meeting
+ * point → the name `origin/dev`.
+ */
+export function featureBase(cwd: string, log: (line: string) => void = () => undefined): string {
+  const o = git(cwd, ["merge-base", "HEAD", ORIGIN_DEV]);
+  if (o === null || o === "") return ORIGIN_DEV;
+  const l = git(cwd, ["merge-base", "HEAD", "refs/heads/dev"]);
+  if (l === null || l === "" || l === o) return o;
+  const isAncestor = (a: string, b: string) =>
+    git(cwd, ["merge-base", "--is-ancestor", a, b]) !== null;
+  if (isAncestor(o, l)) return l;
+  if (isAncestor(l, o)) return o;
+  const tree = git(cwd, ["merge-tree", "--write-tree", l, o])?.split("\n")[0];
+  const combined =
+    tree === undefined || tree === ""
+      ? null
+      : git(cwd, [
+          "-c",
+          "user.name=bkit",
+          "-c",
+          "user.email=bkit@localhost",
+          "commit-tree",
+          tree,
+          "-p",
+          l,
+          "-p",
+          o,
+          "-m",
+          "feature base",
+        ]);
+  if (combined === null || combined === "") {
+    log(
+      `feature base: local dev and ${ORIGIN_DEV} do not merge cleanly — measuring from the ${ORIGIN_DEV} meeting point ${o}`,
+    );
+    return o;
+  }
+  return combined;
+}
+
+/**
+ * The base and range a diff reader measures when `--base` is absent. A feature base that is
+ * the `origin/dev` meeting point is named `origin/dev` (`origin/dev...HEAD`); any other is a
+ * commit read straight to HEAD (`{sha}..HEAD`), because the combined commit is not an ancestor.
+ */
+export function defaultRange(
+  cwd: string,
+  log: (line: string) => void = () => undefined,
+): { base: string; range: string } {
+  const sha = featureBase(cwd, log);
+  if (sha === ORIGIN_DEV || sha === git(cwd, ["merge-base", "HEAD", ORIGIN_DEV]))
+    return { base: ORIGIN_DEV, range: `${ORIGIN_DEV}...HEAD` };
+  return { base: sha, range: `${sha}..HEAD` };
+}
diff --git a/.bkit/core/engine/commands/workflow/status.test.ts b/.bkit/core/engine/commands/workflow/status.test.ts
index 98421296e..201b29a57 100644
--- a/.bkit/core/engine/commands/workflow/status.test.ts
+++ b/.bkit/core/engine/commands/workflow/status.test.ts
@@ -701,6 +701,16 @@ describe("bkit status route holistic cleanBase", () => {
     expect(await cleanBase([started("build", "2026-10-01T00:00:00Z")], root)).toBe("origin/dev");
   });
 
+  it("cleanBase with no clean round returns the feature base, not origin/dev", async () => {
+    const { root, c1, c2 } = repo();
+    git(root, "update-ref", "refs/remotes/origin/dev", c1);
+    git(root, "checkout", "-q", "-b", "feat/1-x", "dev");
+    git(root, "commit", "-q", "--allow-empty", "-m", "feat work");
+    const base = await cleanBase([started("build", "2026-10-01T00:00:00Z")], root);
+    expect(base).toBe(c2);
+    expect(base).not.toBe("origin/dev");
+  });
+
   it("a clean holistic row from an earlier run does not set the base", async () => {
     const { root, c1 } = repo();
     expect(
diff --git a/.bkit/core/engine/commands/workflow/status.ts b/.bkit/core/engine/commands/workflow/status.ts
index 0333874a1..496188b27 100644
--- a/.bkit/core/engine/commands/workflow/status.ts
+++ b/.bkit/core/engine/commands/workflow/status.ts
@@ -42,6 +42,7 @@ import {
   type FlagValue,
   type RunContext,
 } from "../lib.js";
+import { featureBase } from "./feature-base.js";
 import { WORKFLOW_STEPS, isResumable, resumePoint } from "./step-table.js";
 
 // ---------------------------------------------------------------------------
@@ -204,12 +205,12 @@ export const EXIT_ROUTE_MISSING = 4;
 
 /**
  * The commit a repeat check tests from: the step's last clean round's `parentSha`, else
- * `origin/dev`, which is also the answer when that sha is not an ancestor of HEAD.
+ * the feature base, which is also the answer when that sha is not an ancestor of HEAD.
  */
 function cleanBase(cwd: string, clean: { parentSha?: unknown } | undefined): string {
   const sha = clean?.parentSha;
-  if (typeof sha !== "string" || sha === "") return "origin/dev";
-  return git(cwd, ["merge-base", "--is-ancestor", sha, "HEAD"]) === null ? "origin/dev" : sha;
+  if (typeof sha !== "string" || sha === "") return featureBase(cwd);
+  return git(cwd, ["merge-base", "--is-ancestor", sha, "HEAD"]) === null ? featureBase(cwd) : sha;
 }
 
 function route(runs: WorkflowRun[], workflow: string, step: string | undefined, group?: number) {
diff --git a/.bkit/core/engine/commands/workflow/tasks.ts b/.bkit/core/engine/commands/workflow/tasks.ts
index 116a8f8a1..edf62632a 100644
--- a/.bkit/core/engine/commands/workflow/tasks.ts
+++ b/.bkit/core/engine/commands/workflow/tasks.ts
@@ -18,7 +18,7 @@ import * as path from "node:path";
 import { parseJson } from "../../shared/json.js";
 import { CommandError, EXIT, type CommandSpec, git, runGit } from "../lib.js";
 import { EXIT_DIFF_FAILED, fetchRemoteRef } from "./branches.js";
-import { DIFF_BASE } from "./context.js";
+const DIFF_BASE = "origin/dev";
 import {
   NO_MARKERS_REASON,
   parsePlanBlocks,
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 8226fef36..41d5c3f81 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -223,3 +223,5 @@
 {"schema":3,"ts":1794740010559,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":25,"lastConfirmed":1794740010559}
 {"schema":3,"ts":1794743254631,"kind":"friction","key":"tests-plan-check/tests-plan-check","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"tests-plan-check"},"category":"tool-failure","scope":"bkit-repo","severity":"MEDIUM","summary":"bkit tests plan-check threw an unhandled error","description":"`bkit tests plan-check` threw an unhandled error at tests-plan-check; the code is not one the command declares as routing.","source":"orchestrator","status":"OPEN","run":{"parentSha":"bd43a0dafddead86b875c8ef72c883350b2e808d"},"recurrenceCount":3,"lastConfirmed":1794743254631}
 {"schema":3,"ts":1794745361027,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":26,"lastConfirmed":1794745361027}
+{"schema":3,"ts":1794774067370,"kind":"friction","key":"build-handover-all-done-skips-verify","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["960"],"category":"other","scope":"universal","severity":"MEDIUM","summary":"Step 7 HANDOVER with every task logged DONE re-briefs the next group, skipping Step 8 for the handed-over group","description":"On 960-build-diffs-count group 1 the code agent returned HANDOVER (two old tests left red after a denied edit) but logged tasks 1-3 DONE. Step 7 sub-step 9 routes any first HANDOVER back to Step 7, whose `context brief --next` then picked group 2, so group 1 would never reach Step 8 verify or its group gate. The orchestrator went to Step 8 for group 1 instead."}
+{"schema":3,"ts":1794774067371,"kind":"friction","key":"code-agent-skips-dist-build","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["960"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"Code agent edited engine .ts without `pnpm build`; steps finish exit 8 on stale dist/","description":"The bkit:check:dist pre-commit hook refused the plan-tasks commit; the orchestrator ran `pnpm build`, staged dist/ and re-ran the finish."}
diff --git a/dist/commands/workflow/branches.js b/dist/commands/workflow/branches.js
index b07cd066c..d84a8ea97 100644
--- a/dist/commands/workflow/branches.js
+++ b/dist/commands/workflow/branches.js
@@ -29,6 +29,7 @@ import { EXIT_BASE_NOT_DEV, FORCE_BUILD, closeTransportRow, crossCheckRows, merg
 import { AUTO_LABEL, AUTO_ROUTE_SUFFIX } from "./issues.js";
 import { appendFeature } from "./roadmap.js";
 import { detect } from "./runtime.js";
+import { defaultRange } from "./feature-base.js";
 import { readRuns, readStatusRows, readStatusRowsAt } from "./status.js";
 import { declaredName, testSource } from "./test-blocks.js";
 import { addAllButCopied, assertShipEligible, copyExcludes, hasLeftovers, notOnDev, rebaseNoteFile, recordRebase, removeWorktree, worktreeDir, } from "./worktrees.js";
@@ -1366,7 +1367,7 @@ export function disabledTestsIn(diff, root) {
     return out;
 }
 function scanDiffVerb(ctx) {
-    const base = String(ctx.flags.base);
+    const explicitBase = str(ctx.flags.base);
     const pattern = str(ctx.flags.paths);
     const marker = str(ctx.flags.marker);
     const code = ctx.flags.code === true;
@@ -1387,7 +1388,9 @@ function scanDiffVerb(ctx) {
         }
     }
     const top = topLevel(ctx.cwd);
-    const fetched = fetchRemoteRef(top, base);
+    const fallback = explicitBase === undefined ? defaultRange(top, ctx.log) : null;
+    const base = explicitBase ?? fallback.base;
+    const fetched = explicitBase === undefined ? null : fetchRemoteRef(top, base);
     if (fetched !== null && !fetched.ok) {
         ctx.log(`git fetch for ${base} failed: ${fetched.stderr} — diffing against the local ref`);
     }
@@ -1395,7 +1398,7 @@ function scanDiffVerb(ctx) {
         ctx.log(`unknown base: ${base}`);
         return EXIT_DIFF_FAILED;
     }
-    const range = `${base}...HEAD`;
+    const range = fallback?.range ?? `${base}...HEAD`;
     if (disabled) {
         const diff = quietGit(top, ["diff", "--no-renames", range, "--", ".", ":(exclude)docs/plans"]);
         if (!diff.ok) {
@@ -3067,8 +3070,7 @@ export const branchesCommand = {
                 {
                     name: "base",
                     type: "string",
-                    required: true,
-                    help: "diff <base>...HEAD; an origin/<branch> base is fetched first",
+                    help: "diff <base>...HEAD; an origin/<branch> base is fetched first (default: the feature base, where the branch's own work starts)",
                 },
                 {
                     name: "paths",
diff --git a/dist/commands/workflow/challenge.js b/dist/commands/workflow/challenge.js
index ec6f96e6f..bd44850c6 100644
--- a/dist/commands/workflow/challenge.js
+++ b/dist/commands/workflow/challenge.js
@@ -24,7 +24,8 @@ import * as fs from "node:fs";
 import * as path from "node:path";
 import { appendLine, statusTimestamp } from "../../ledgers/status.js";
 import { CommandError, DEV, EXIT, git, runGit } from "../lib.js";
-import { DIFF_BASE, EXIT_BASE, diffNumstat } from "./context.js";
+import { EXIT_BASE, diffNumstat } from "./context.js";
+import { defaultRange } from "./feature-base.js";
 import { parseDecisionItems } from "./decisions.js";
 import { EXIT_ROW_REFUSED, EXIT_STAGE, appendLedgerRows } from "./ledgers.js";
 import { derivedTestMatrix, parsePlanBlocks } from "./plan-blocks.js";
@@ -451,7 +452,7 @@ export const challengeCommand = {
                 {
                     name: "base",
                     type: "string",
-                    help: `merge base (default ${DIFF_BASE}, fetched first; a failed fetch is logged, not fatal)`,
+                    help: "merge base (default: the feature base, after fetching origin dev; a failed fetch is logged, not fatal)",
                 },
             ],
             output: {
@@ -464,15 +465,17 @@ export const challengeCommand = {
             },
             exitCodes: { [EXIT_BASE]: "--base does not name a commit" },
             run: (ctx) => {
-                const base = typeof ctx.flags.base === "string" ? ctx.flags.base : DIFF_BASE;
-                if (base === DIFF_BASE) {
+                const explicitBase = typeof ctx.flags.base === "string" ? ctx.flags.base : undefined;
+                if (explicitBase === undefined) {
                     const res = runGit(ctx.cwd, ["fetch", "origin", DEV]);
                     if (!res.ok)
                         ctx.log(`git fetch origin dev failed — measuring against the last fetch: ${res.stderr}`);
                 }
+                const fallback = explicitBase === undefined ? defaultRange(ctx.cwd, ctx.log) : null;
+                const base = explicitBase ?? fallback.base;
                 if (git(ctx.cwd, ["rev-parse", "-q", "--verify", `${base}^{commit}`]) === null)
                     throw new CommandError(EXIT_BASE, `--base ${base} does not name a commit (fetch origin)`);
-                const range = `${base}...HEAD`;
+                const range = fallback?.range ?? `${base}...HEAD`;
                 const { stat } = diffNumstat(ctx.cwd, range);
                 const gate = challengeGate(stat);
                 const file = path.resolve(ctx.cwd, String(ctx.flags.file));
diff --git a/dist/commands/workflow/context.js b/dist/commands/workflow/context.js
index ab904a4e0..9e282caf9 100644
--- a/dist/commands/workflow/context.js
+++ b/dist/commands/workflow/context.js
@@ -35,6 +35,8 @@ import { CommandError, EXIT, git, outboxRel, outboxRoot, } from "../lib.js";
 import { gitEnv, resolveRepoSlug } from "../../ledgers/telemetry.js";
 import { parseJson } from "../../shared/json.js";
 import { checkedTable } from "../../shared/text.js";
+import { defaultRange } from "./feature-base.js";
+export { defaultRange, featureBase } from "./feature-base.js";
 import { buildComment } from "./issues.js";
 import { derivedTestMatrix, parsePlanBlocks, reuseInventory, } from "./plan-blocks.js";
 import { COMMENT_FILE_OUTPUT, commentFileOf } from "./tracker.js";
@@ -683,7 +685,6 @@ function asCaptured(out) {
 // ---------------------------------------------------------------------------
 /** Exit code: --base does not name a commit. */
 export const EXIT_BASE = 5;
-export const DIFF_BASE = "origin/dev";
 export const DIFF_EXCLUDES = ["docs/plans/**"];
 export const PARTIAL_MARK = "partial diff coverage";
 export const DIFF_GUARD = {
@@ -1214,7 +1215,7 @@ export const contextCommand = {
                 {
                     name: "base",
                     type: "string",
-                    help: `merge base or a group's start commit (default ${DIFF_BASE})`,
+                    help: "merge base or a group's start commit (default: the feature base, where the branch's own work starts)",
                 },
                 ...LOG_FLAGS,
                 {
@@ -1242,7 +1243,9 @@ export const contextCommand = {
                 [EXIT_ARTIFACT]: "the artifact could not be written",
             },
             run: (ctx) => {
-                const base = str(ctx.flags.base) ?? DIFF_BASE;
+                const explicitBase = str(ctx.flags.base);
+                const fallback = explicitBase === undefined ? defaultRange(ctx.cwd, ctx.log) : null;
+                const base = explicitBase ?? fallback.base;
                 if (git(ctx.cwd, ["rev-parse", "-q", "--verify", `${base}^{commit}`]) === null) {
                     throw new CommandError(EXIT_BASE, `--base ${base} does not name a commit (fetch origin, or pass the group's start sha)`);
                 }
@@ -1254,7 +1257,7 @@ export const contextCommand = {
                     fs.mkdirSync(path.dirname(log), { recursive: true });
                     fs.writeFileSync(log, "");
                 }
-                const written = tryWriteDiffArtifact(ctx.cwd, path.resolve(ctx.cwd, artifact), artifact, `${base}...HEAD`, DIFF_GUARD, { rawDir: rawDirFor(ctx.cwd, str(ctx.flags.fid)) });
+                const written = tryWriteDiffArtifact(ctx.cwd, path.resolve(ctx.cwd, artifact), artifact, fallback?.range ?? `${base}...HEAD`, DIFF_GUARD, { rawDir: rawDirFor(ctx.cwd, str(ctx.flags.fid)) });
                 if (!written.ok)
                     throw new CommandError(EXIT_ARTIFACT, `${artifact}: ${written.error}`);
                 const result = written.result;
diff --git a/dist/commands/workflow/feature-base.js b/dist/commands/workflow/feature-base.js
new file mode 100644
index 000000000..0b762268e
--- /dev/null
+++ b/dist/commands/workflow/feature-base.js
@@ -0,0 +1,57 @@
+// The commit a feature's own work starts after, and the diff range measured from it.
+// Kept apart from context.ts and status.ts so both can import it without an import cycle.
+import { git } from "../lib.js";
+const ORIGIN_DEV = "origin/dev";
+/**
+ * The commit the feature's own work starts after: the later of HEAD's meeting points with
+ * `origin/dev` and with local `dev`. Neither later than the other (origin/dev was merged
+ * into a branch cut from local dev) → a commit of the two merged, with both as parents;
+ * a conflict there → the `origin/dev` meeting point, logged once. No `origin/dev` meeting
+ * point → the name `origin/dev`.
+ */
+export function featureBase(cwd, log = () => undefined) {
+    const o = git(cwd, ["merge-base", "HEAD", ORIGIN_DEV]);
+    if (o === null || o === "")
+        return ORIGIN_DEV;
+    const l = git(cwd, ["merge-base", "HEAD", "refs/heads/dev"]);
+    if (l === null || l === "" || l === o)
+        return o;
+    const isAncestor = (a, b) => git(cwd, ["merge-base", "--is-ancestor", a, b]) !== null;
+    if (isAncestor(o, l))
+        return l;
+    if (isAncestor(l, o))
+        return o;
+    const tree = git(cwd, ["merge-tree", "--write-tree", l, o])?.split("\n")[0];
+    const combined = tree === undefined || tree === ""
+        ? null
+        : git(cwd, [
+            "-c",
+            "user.name=bkit",
+            "-c",
+            "user.email=bkit@localhost",
+            "commit-tree",
+            tree,
+            "-p",
+            l,
+            "-p",
+            o,
+            "-m",
+            "feature base",
+        ]);
+    if (combined === null || combined === "") {
+        log(`feature base: local dev and ${ORIGIN_DEV} do not merge cleanly — measuring from the ${ORIGIN_DEV} meeting point ${o}`);
+        return o;
+    }
+    return combined;
+}
+/**
+ * The base and range a diff reader measures when `--base` is absent. A feature base that is
+ * the `origin/dev` meeting point is named `origin/dev` (`origin/dev...HEAD`); any other is a
+ * commit read straight to HEAD (`{sha}..HEAD`), because the combined commit is not an ancestor.
+ */
+export function defaultRange(cwd, log = () => undefined) {
+    const sha = featureBase(cwd, log);
+    if (sha === ORIGIN_DEV || sha === git(cwd, ["merge-base", "HEAD", ORIGIN_DEV]))
+        return { base: ORIGIN_DEV, range: `${ORIGIN_DEV}...HEAD` };
+    return { base: sha, range: `${sha}..HEAD` };
+}
diff --git a/dist/commands/workflow/status.js b/dist/commands/workflow/status.js
index 00be339aa..df4f21527 100644
--- a/dist/commands/workflow/status.js
+++ b/dist/commands/workflow/status.js
@@ -8,6 +8,7 @@ import { resolveGitSha } from "../../ledgers/telemetry.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { activeDoneSteps, validateCiSelection, ciSelectionIdentity, allRunsDoneSteps, appendLine, fold, lastCleanRound, lastDoneStepAllRuns, lastRun, nextStrategy, runNumber, runOrStepField, statusTimestamp, } from "../../ledgers/status.js";
 import { CommandError, EXIT, git, parseJson, resolveActiveRun, statusLocation, worktreeFingerprint, writeInvocation, } from "../lib.js";
+import { featureBase } from "./feature-base.js";
 import { WORKFLOW_STEPS, isResumable, resumePoint } from "./step-table.js";
 // ---------------------------------------------------------------------------
 // Shared with counters / steps
@@ -154,13 +155,13 @@ const ROUTE_FIELDS = [
 export const EXIT_ROUTE_MISSING = 4;
 /**
  * The commit a repeat check tests from: the step's last clean round's `parentSha`, else
- * `origin/dev`, which is also the answer when that sha is not an ancestor of HEAD.
+ * the feature base, which is also the answer when that sha is not an ancestor of HEAD.
  */
 function cleanBase(cwd, clean) {
     const sha = clean?.parentSha;
     if (typeof sha !== "string" || sha === "")
-        return "origin/dev";
-    return git(cwd, ["merge-base", "--is-ancestor", sha, "HEAD"]) === null ? "origin/dev" : sha;
+        return featureBase(cwd);
+    return git(cwd, ["merge-base", "--is-ancestor", sha, "HEAD"]) === null ? featureBase(cwd) : sha;
 }
 function route(runs, workflow, step, group) {
     const out = {
diff --git a/dist/commands/workflow/tasks.js b/dist/commands/workflow/tasks.js
index 45832adf2..d00ccc2b9 100644
--- a/dist/commands/workflow/tasks.js
+++ b/dist/commands/workflow/tasks.js
@@ -16,7 +16,7 @@ import * as path from "node:path";
 import { parseJson } from "../../shared/json.js";
 import { CommandError, EXIT, git, runGit } from "../lib.js";
 import { EXIT_DIFF_FAILED, fetchRemoteRef } from "./branches.js";
-import { DIFF_BASE } from "./context.js";
+const DIFF_BASE = "origin/dev";
 import { NO_MARKERS_REASON, parsePlanBlocks, } from "./plan-blocks.js";
 import { positiveInt, str } from "./status.js";
 import { doneTasks } from "./tests.js";
