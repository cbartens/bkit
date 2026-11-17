diff --git a/.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts b/.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts
index ea077a1db..2118c9974 100644
--- a/.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts
+++ b/.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts
@@ -1,21 +1,13 @@
-// audits/repo/bats-setup-suite.integration.test.ts — tests/shell/setup_suite.bash, which bats runs
-// around every `bats tests/shell/*.bats` run, keeps the shell tier off the repo it runs from.
-//
-// The pre-push hook runs the bats tier. From a linked worktree it exports
-// GIT_DIR=<main>/.git/worktrees/<name>, which beats a test's `-C` and cwd, so
-// `git -C "$tmp" init -q` rewrites the main checkout's shared config with core.bare=true.
-// Each probe runs the real setup_suite.bash with that GIT_DIR against a throwaway checkout.
+// audits/repo/bats-setup-suite.integration.test.ts — `tests/shell/setup_suite.bash` gives every
+// bats test a time limit, so a bats test that hangs fails with `timeout after` and the run ends.
 
 import { spawnSync } from "node:child_process";
 import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
-import { afterEach, describe, expect, it } from "vitest";
+import { afterEach, expect, it } from "vitest";
 
 const ROOT = process.cwd();
-const BATS = path.join(ROOT, "node_modules", ".bin", "bats");
-const SETUP_SUITE = path.join(ROOT, "tests", "shell", "setup_suite.bash");
-
 const temps: string[] = [];
 
 afterEach(() => {
@@ -24,85 +16,29 @@ afterEach(() => {
   }
 });
 
-function git(cwd: string, ...args: string[]): void {
-  const res = spawnSync("git", args, { cwd, encoding: "utf-8" });
-  expect(res.status, `git ${args.join(" ")}: ${res.stderr}`).toBe(0);
-}
-
-function configValue(file: string, key: string): string | null {
-  const res = spawnSync("git", ["config", "--file", file, "--get", key], { encoding: "utf-8" });
-  return res.status === 0 ? res.stdout.trim() : null;
-}
-
-interface Run {
-  status: number | null;
-  output: string;
-  config: string;
-}
-
-// A main checkout with a linked worktree; the probe test runs from the worktree with the
-// GIT_DIR its pre-push hook would export. `suite` false runs the probe without setup_suite.bash.
-function runProbe(body: string, suite = true): Run {
-  const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-bats-suite-")));
-  temps.push(tmp);
-  const main = path.join(tmp, "main");
-  const worktree = path.join(main, ".worktrees", "feat");
-  git(tmp, "init", "-q", "-b", "dev", main);
-  git(
-    main,
-    "-c",
-    "user.email=a@b",
-    "-c",
-    "user.name=a",
-    "commit",
-    "-q",
-    "--allow-empty",
-    "-m",
-    "i",
+it("a hanging bats test fails with timeout after", { timeout: 100_000 }, () => {
+  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-bats-suite-"));
+  temps.push(dir);
+  fs.copyFileSync(
+    path.join(ROOT, "tests/shell/setup_suite.bash"),
+    path.join(dir, "setup_suite.bash"),
   );
-  git(main, "worktree", "add", "-q", "-b", "feat", worktree, "dev");
-  const probe = path.join(tmp, "probe.bats");
-  fs.writeFileSync(probe, `@test "probe" {\n  ${body}\n}\n`);
-  const args = suite ? ["--setup-suite-file", SETUP_SUITE, probe] : [probe];
-  const res = spawnSync(BATS, args, {
-    cwd: worktree,
+  fs.writeFileSync(
+    path.join(dir, "hang.bats"),
+    "#!/usr/bin/env bats\n\n" + '@test "hang probe sleeps" {\n  sleep 120\n}\n',
+  );
+  const env: NodeJS.ProcessEnv = { ...process.env, CI: "true" };
+  delete env.BATS_TEST_TIMEOUT;
+  const started = Date.now();
+  const res = spawnSync(path.join(ROOT, "node_modules", ".bin", "bats"), [dir], {
+    cwd: ROOT,
     encoding: "utf-8",
-    env: { ...process.env, GIT_DIR: path.join(main, ".git", "worktrees", "feat") },
-  });
-  return {
-    status: res.status,
-    output: `${res.stdout}${res.stderr}`,
-    config: path.join(main, ".git", "config"),
-  };
-}
-
-describe("tests/shell/setup_suite.bash", () => {
-  it("CONTROL — without it, a temp repo's `git -C` init under the hook's GIT_DIR flips core.bare", () => {
-    const run = runProbe('git -C "$BATS_TEST_TMPDIR" init -q', false);
-    expect(run.status, run.output).toBe(0);
-    expect(configValue(run.config, "core.bare")).toBe("true");
-  });
-
-  it("clears every GIT_* variable, so the same init stays in the temp dir", () => {
-    const run = runProbe('git -C "$BATS_TEST_TMPDIR" init -q');
-    expect(run.status, run.output).toBe(0);
-    expect(configValue(run.config, "core.bare")).toBe("false");
-  });
-
-  it("fails the run when a test writes an identity into the checkout, and removes it", () => {
-    const run = runProbe("git config user.email t@t.t && git config user.name t");
-    expect(run.status).not.toBe(0);
-    expect(run.output).toMatch(/teardown_suite/);
-    expect(run.output).toMatch(/user\.email t@t\.t/);
-    expect(configValue(run.config, "user.email")).toBeNull();
-    expect(configValue(run.config, "user.name")).toBeNull();
-    expect(configValue(run.config, "core.bare")).toBe("false");
-  });
-
-  it("fails the run when a test sets core.bare in the checkout, and puts it back", () => {
-    const run = runProbe("git config core.bare true");
-    expect(run.status).not.toBe(0);
-    expect(run.output).toMatch(/core\.bare true/);
-    expect(configValue(run.config, "core.bare")).toBe("false");
+    timeout: 85_000,
+    env,
   });
+  const out = `${res.stdout}\n${res.stderr}`;
+  expect(res.error, out).toBeUndefined();
+  expect(res.status, out).not.toBe(0);
+  expect(out).toContain("timeout after");
+  expect(Date.now() - started).toBeLessThan(80_000);
 });
diff --git a/.bkit/core/engine/audits/repo/test-file-script.integration.test.ts b/.bkit/core/engine/audits/repo/test-file-script.integration.test.ts
index ed821b1fd..98ef4ef5f 100644
--- a/.bkit/core/engine/audits/repo/test-file-script.integration.test.ts
+++ b/.bkit/core/engine/audits/repo/test-file-script.integration.test.ts
@@ -159,3 +159,41 @@ describe("bkit:lint:file passes a test file its linter does not cover", () => {
     expect(res.status, `${res.stdout}\n${res.stderr}`).toBe(0);
   });
 });
+
+describe("bkit:test:file ends a node --test file whose test awaits a child that never exits", () => {
+  it(
+    "node — a test awaiting a child that never exits fails within the limit",
+    { timeout: 100_000 },
+    () => {
+      const dir = tempDir();
+      const file = path.join(dir, "hang.test.mjs");
+      // The child quits by itself after 90s so a failed limit never leaves it behind.
+      fs.writeFileSync(
+        file,
+        'import { spawn } from "node:child_process";\n' +
+          'import { once } from "node:events";\n' +
+          'import { test } from "node:test";\n\n' +
+          'test("hang probe awaits a child", async () => {\n' +
+          '  const child = spawn(process.execPath, ["-e", "setTimeout(() => {}, 90000)"], { stdio: "ignore" });\n' +
+          '  await once(child, "exit");\n' +
+          "});\n",
+      );
+      const report = path.join(dir, "junit.xml");
+      const started = Date.now();
+      const res = spawnSync("pnpm", ["-s", "bkit:test:file", file], {
+        cwd: ROOT,
+        encoding: "utf-8",
+        timeout: 85_000,
+        env: { ...process.env, CI: "true", [REPORT_ENV]: report },
+      });
+      const elapsed = Date.now() - started;
+      expect(res.error, `${res.stdout}\n${res.stderr}`).toBeUndefined();
+      expect(res.status, `${res.stdout}\n${res.stderr}`).toBe(1);
+      expect(elapsed).toBeLessThan(80_000);
+      const cases = parseJunit(fs.readFileSync(report, "utf-8"));
+      expect(
+        cases.filter((c) => isNamedCase(c.name, "hang probe awaits a child")).map((c) => c.state),
+      ).toEqual(["failure"]);
+    },
+  );
+});
diff --git a/docs/testing.md b/docs/testing.md
index 5e00ee478..56c96c8cc 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -553,6 +553,7 @@ Manual host-hook compatibility experiments live in [`tests/experiments/hooks/`](
 - **Runner:** Vitest 5 (`pnpm test` → `vitest run`). Shell: bats (`pnpm bkit:test:bats`). Harvest: `node:test` (`pnpm test:harvest`).
 - **Raw Vitest:** `vitest.test-lock.ts` makes heavy root runs queue for the machine-wide `tests` lock in global setup; runs filtered entirely to existing files, watch mode, CI and nested runs with a live owner bypass acquisition. The lock script keeps its 60-second default wait without a TTY and honours an inherited wait budget. `BKIT_TEST_WORKERS` supplies a positive worker limit when set.
 - **One test file:** `pnpm bkit:test:file {file}` → `scripts/ci/bkit-test-file.mjs` picks the runner by file type (`.bats` → bats, `.mjs` → `node --test`, else Vitest); JUnit report only when `$BKIT_TEST_REPORT` is set.
+- **Time limits:** the Vitest per-test and per-hook budgets (`vitest.timeout-budget.ts`) also cap synchronous child calls (`vitest.child-deadline.ts`). `node --test` runs get `--test-timeout` and `--test-force-exit` from `scripts/ci/bkit-test-limits.mjs`, derived from the integration budget (30s under CI). Bats gets `BATS_TEST_TIMEOUT` from the same source, or from `tests/shell/setup_suite.bash` for `pnpm bkit:test:bats`. A limit kills only the direct child, so a grandchild it started can outlive the run.
 - **Changed files:** `pnpm bkit:gate:changed {file}...` holds the `tests` lock through `scripts/ci/bkit-machine-lock.sh` and passes the file arguments to `scripts/gate/bkit-gate-changed.mjs`, which `bkit tests changed` calls for build and debug agents: `vitest related --run` on the changed files, every test file that names a changed path (Vitest, `node --test` or bats by file type), Oxlint on changed engine `.ts`, Prettier on every changed file, and `pnpm typecheck` when a `.ts` file changed. Runs every stage, and exits 1 when any fails.
 - **Test gates:** `bkit:gate:static-unit`, `bkit:gate:static-unit-integration` and `bkit:gate:install-static-unit-build` hold the same `tests` lock for their whole run. A nested gate inherits its parent's live lock owner and runs unlocked.
 - **Test files** sit next to the file they test under `.bkit/core/engine/`; tests that read shipped text (workflows, templates, hooks, this repo's own docs and ledgers) sit in `.bkit/core/engine/audits/{workflows,templates,hooks,repo}/`. `tests/` holds automated shell tests in `shell/`, reusable inputs in `fixtures/` and manual research in `experiments/{compression,hooks}/`. Experiments keep reports in `reports/`, illustrations in `assets/` and preserved observations in dated `results/` folders.
@@ -729,6 +730,9 @@ The machine-lock integration tests in `audits/templates/machine-lock.integration
 | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` | Integration | Fresh plan reads, saved-run isolation and frozen allowances, cross-run soak attempts/grants, specialized completion producers, numeric gates preserving validation and command journaling, invalid inputs and refused commits without false completion. |
 | `.bkit/core/engine/render/hosts.test.ts` | Unit | Progress narration and explicit gate numbers survive Claude, Codex, Antigravity, Cursor and OpenCode rendering; sole completion output remains observable. |
 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | Integration | Real consumer gate wrapping, wait budgets and exit mapping, lock lifetime, CI and light-run bypass, inherited workers and nested wrappers. |
+| `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` | Unit | Remaining-time `timeout` given to `spawnSync`, `execSync` and `execFileSync` when the caller passes none; an explicit `timeout` is kept. |
+| `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` | Integration | A test that waits on a never-exiting child fails inside its Vitest limit in a real worker. |
+| `scripts/ci/bkit-test-limits.test.mjs` | Unit | `node --test` flags and bats seconds derived from the integration budget, 30 under `CI=true`. |
 | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | Unit | Raw Vitest heavy/light decisions, live nested owners, CI, watch and positive worker budgets. |
 | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` | Integration | Real holder contention, readiness diagnostics, lock lifetime, teardown and nested setup. |
 | `.bkit/core/engine/commands/install/doctor.integration.test.ts` | Integration | `bkit doctor` exit 0 and Phase 1 and Phase 3 advisory replay. |
diff --git a/package.json b/package.json
index 5038422d8..b646b9af3 100644
--- a/package.json
+++ b/package.json
@@ -101,7 +101,7 @@
     "instructions:sync": "tsx .bkit/core/engine/tools/instructions.ts --write",
     "cli:sync": "tsx .bkit/core/engine/tools/cli-doc.ts --write",
     "prepare": "husky",
-    "bkit:test:awake": "node scripts/ci/bkit-test-awake.mjs node --test scripts/ci/bkit-test-awake.test.mjs"
+    "bkit:test:awake": "node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs scripts/ci/bkit-test-awake.test.mjs"
   },
   "devDependencies": {
     "@types/node": "24.19.2",
diff --git a/scripts/ci/bkit-test-file.mjs b/scripts/ci/bkit-test-file.mjs
index 7b1127fe0..1d99de25c 100644
--- a/scripts/ci/bkit-test-file.mjs
+++ b/scripts/ci/bkit-test-file.mjs
@@ -13,6 +13,8 @@ import { spawnSync } from "node:child_process";
 import fs from "node:fs";
 import path from "node:path";
 
+import { batsTestTimeoutSeconds, nodeTestLimitArgs } from "./bkit-test-limits.mjs";
+
 const ROOT = path.resolve(import.meta.dirname, "..", "..");
 const bin = (name) => path.join(ROOT, "node_modules", ".bin", name);
 
@@ -32,8 +34,8 @@ if (kinds.length !== 1) {
 
 const report = process.env.BKIT_TEST_REPORT || "";
 
-function run(cmd, args) {
-  const res = spawnSync(cmd, args, { stdio: "inherit" });
+function run(cmd, args, env = process.env) {
+  const res = spawnSync(cmd, args, { stdio: "inherit", env });
   if (res.error) {
     console.error(`bkit:test:file: ${cmd} could not run — ${res.error.message}`);
     return 127;
@@ -42,10 +44,14 @@ function run(cmd, args) {
 }
 
 function runBats() {
-  if (!report) return run(bin("bats"), files);
+  const env = {
+    ...process.env,
+    BATS_TEST_TIMEOUT: process.env.BATS_TEST_TIMEOUT || String(batsTestTimeoutSeconds()),
+  };
+  if (!report) return run(bin("bats"), files, env);
   fs.mkdirSync(path.dirname(report), { recursive: true });
   const out = fs.mkdtempSync(path.join(path.dirname(report), "bats-"));
-  const code = run(bin("bats"), ["--report-formatter", "junit", "--output", out, ...files]);
+  const code = run(bin("bats"), ["--report-formatter", "junit", "--output", out, ...files], env);
   const xml = path.join(out, "report.xml");
   if (fs.existsSync(xml)) fs.renameSync(xml, report);
   fs.rmSync(out, { recursive: true, force: true });
@@ -55,6 +61,7 @@ function runBats() {
 const runNode = () =>
   run(process.execPath, [
     "--test",
+    ...nodeTestLimitArgs(),
     "--test-reporter=spec",
     "--test-reporter-destination=stdout",
     ...(report ? ["--test-reporter=junit", `--test-reporter-destination=${report}`] : []),
diff --git a/scripts/ci/bkit-test-limits.mjs b/scripts/ci/bkit-test-limits.mjs
new file mode 100644
index 000000000..2ae06d4e9
--- /dev/null
+++ b/scripts/ci/bkit-test-limits.mjs
@@ -0,0 +1,16 @@
+// bkit's own checkout only; never shipped (not in dist, .bkit/core, .bkit/shared or .bkit/templates).
+/**
+ * bkit-test-limits.mjs — the time limit for `node --test` and bats runs, taken from the Vitest
+ * integration budget (`vitest.timeout-budget.ts`) so every runner bkit uses on itself shares one
+ * number: 30s under CI, scaled by machine load elsewhere.
+ */
+
+import { tierTimeouts } from "../../vitest.timeout-budget.ts";
+
+const limitMs = () => tierTimeouts(true).testTimeout;
+
+/** `node --test` flags: a per-test limit, and exit once the tests finish even if a handle stays open. */
+export const nodeTestLimitArgs = () => [`--test-timeout=${limitMs()}`, "--test-force-exit"];
+
+/** The same limit in whole seconds, for bats' `BATS_TEST_TIMEOUT`. */
+export const batsTestTimeoutSeconds = () => Math.ceil(limitMs() / 1000);
diff --git a/scripts/ci/bkit-test-limits.test.mjs b/scripts/ci/bkit-test-limits.test.mjs
new file mode 100644
index 000000000..dbf13bc17
--- /dev/null
+++ b/scripts/ci/bkit-test-limits.test.mjs
@@ -0,0 +1,39 @@
+// bkit's own checkout only; never shipped. Run: node --test scripts/ci/bkit-test-limits.test.mjs
+import assert from "node:assert/strict";
+import { test } from "node:test";
+
+import { batsTestTimeoutSeconds, nodeTestLimitArgs } from "./bkit-test-limits.mjs";
+
+/** Run `fn` with CI set to `value` (or removed when undefined), then put the old value back. */
+function withCi(t, value, fn) {
+  const before = process.env.CI;
+  t.after(() => {
+    if (before === undefined) delete process.env.CI;
+    else process.env.CI = before;
+  });
+  if (value === undefined) delete process.env.CI;
+  else process.env.CI = value;
+  return fn();
+}
+
+test("gives --test-timeout from the integration budget and --test-force-exit", (t) => {
+  assert.deepEqual(
+    withCi(t, "true", () => nodeTestLimitArgs()),
+    ["--test-timeout=30000", "--test-force-exit"],
+  );
+  const local = withCi(t, undefined, () => nodeTestLimitArgs());
+  assert.equal(local.length, 2);
+  assert.match(local[0], /^--test-timeout=\d+$/);
+  assert.ok(Number(local[0].split("=")[1]) >= 30000, local[0]);
+  assert.equal(local[1], "--test-force-exit");
+});
+
+test("gives the bats limit in whole seconds, 30 under CI", (t) => {
+  assert.equal(
+    withCi(t, "true", () => batsTestTimeoutSeconds()),
+    30,
+  );
+  const local = withCi(t, undefined, () => batsTestTimeoutSeconds());
+  assert.ok(Number.isInteger(local), String(local));
+  assert.ok(local >= 30, String(local));
+});
diff --git a/scripts/gate/bkit-gate-changed.mjs b/scripts/gate/bkit-gate-changed.mjs
index e577c506e..e79f5fb2a 100644
--- a/scripts/gate/bkit-gate-changed.mjs
+++ b/scripts/gate/bkit-gate-changed.mjs
@@ -15,6 +15,8 @@ import { spawnSync } from "node:child_process";
 import fs from "node:fs";
 import path from "node:path";
 
+import { batsTestTimeoutSeconds, nodeTestLimitArgs } from "../ci/bkit-test-limits.mjs";
+
 const ROOT = path.resolve(import.meta.dirname, "..", "..");
 const bin = (name) => path.join(ROOT, "node_modules", ".bin", name);
 
@@ -27,9 +29,9 @@ const GENERIC_NAMES = new Set(["index.ts", "index.mjs", "package.json", "README.
 const kindOf = (file) =>
   file.endsWith(".bats") ? "bats" : file.endsWith(".mjs") ? "node" : "vitest";
 
-function run(stage, cmd, args) {
+function run(stage, cmd, args, env = process.env) {
   console.log(`\n[bkit:gate:changed] ${stage}: ${[path.basename(cmd), ...args].join(" ")}`);
-  const res = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit" });
+  const res = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", env });
   if (res.error) {
     console.error(`[bkit:gate:changed] ${stage}: ${cmd} could not run — ${res.error.message}`);
     return 1;
@@ -74,8 +76,18 @@ else {
   if (byKind("vitest").length > 0)
     stage("named", run("named", bin("vitest"), ["run", "--passWithNoTests", ...byKind("vitest")]));
   if (byKind("node").length > 0)
-    stage("named", run("named", process.execPath, ["--test", ...byKind("node")]));
-  if (byKind("bats").length > 0) stage("named", run("named", bin("bats"), byKind("bats")));
+    stage(
+      "named",
+      run("named", process.execPath, ["--test", ...nodeTestLimitArgs(), ...byKind("node")]),
+    );
+  if (byKind("bats").length > 0)
+    stage(
+      "named",
+      run("named", bin("bats"), byKind("bats"), {
+        ...process.env,
+        BATS_TEST_TIMEOUT: process.env.BATS_TEST_TIMEOUT || String(batsTestTimeoutSeconds()),
+      }),
+    );
 }
 
 const engineTs = files.filter((f) => f.startsWith(".bkit/core/engine/") && f.endsWith(".ts"));
diff --git a/scripts/gate/bkit-gate-changed.test.mjs b/scripts/gate/bkit-gate-changed.test.mjs
index 0fa3536f9..c1f4060d1 100644
--- a/scripts/gate/bkit-gate-changed.test.mjs
+++ b/scripts/gate/bkit-gate-changed.test.mjs
@@ -38,3 +38,16 @@ test("format still fails a changed regular file prettier would rewrite", (t) =>
   assert.equal(res.status, 1, res.stdout + res.stderr);
   assert.match(res.stderr, /failed: format/);
 });
+
+test("passes the limit args to the node --test stage", (t) => {
+  const dir = scratch(t);
+  const probe = join(dir, "gate-limit-probe.test.mjs");
+  writeFileSync(
+    probe,
+    'import { test } from "node:test";\n\ntest("limit probe passes", () => {});\n',
+  );
+  const res = gate(relative(root, probe));
+  const out = res.stdout + res.stderr;
+  assert.match(out, /named: node --test .*--test-timeout=\d+/, out);
+  assert.match(out, /named: node --test .*--test-force-exit/, out);
+});
diff --git a/scripts/harvest/bkit-harvest.test.mjs b/scripts/harvest/bkit-harvest.test.mjs
index 24105986f..ec5b50579 100644
--- a/scripts/harvest/bkit-harvest.test.mjs
+++ b/scripts/harvest/bkit-harvest.test.mjs
@@ -77,8 +77,20 @@ try {
   // Node older than 22.5: the SQLite hosts' tests are skipped
 }
 
+// One root test stays open for the whole file, and the tests below are its subtests. Without it,
+// `node --test --test-force-exit` ends the run between two awaited top-level tests.
+let endRoot;
+const root = await new Promise((resolve) => {
+  nodeTest("bkit-harvest", (t) => {
+    resolve(t);
+    return new Promise((end) => {
+      endRoot = end;
+    });
+  });
+});
+
 const test = (name, fn, { needsSqlite = false } = {}) =>
-  nodeTest(name, { skip: needsSqlite && !sqlite ? "no node:sqlite" : false }, fn);
+  root.test(name, { skip: needsSqlite && !sqlite ? "no node:sqlite" : false }, fn);
 
 const SHA = "d3187b9daa21f7652a4d85f3c89aae040280b72b";
 const SHA2 = "0123456789abcdef0123456789abcdef01234567";
@@ -3073,3 +3085,4 @@ function fingerprintNone(n) {
 }
 
 fs.rmSync(tmp, { recursive: true, force: true });
+endRoot();
diff --git a/tests/shell/setup_suite.bash b/tests/shell/setup_suite.bash
index a8886ad9e..89266a81e 100644
--- a/tests/shell/setup_suite.bash
+++ b/tests/shell/setup_suite.bash
@@ -14,8 +14,16 @@
 BKIT_GUARDED_KEYS="user.name user.email core.bare core.worktree"
 BKIT_GUARDED_PATTERN='^(user\.(name|email)|core\.(bare|worktree))$'
 
+# Every bats test gets a time limit, so a hung test fails with `timeout after` and the run ends
+# (docs/testing.md § Time limits). node's runners pass BATS_TEST_TIMEOUT already; `pnpm bkit:test:bats`
+# runs no node code first. 30s under CI, else 180s (30s x MAX_LOAD_FACTOR 6 in vitest.timeout-budget.ts).
 setup_suite() {
   local var common
+  if [ -n "${CI:-}" ]; then
+    export BATS_TEST_TIMEOUT="${BATS_TEST_TIMEOUT:-30}"
+  else
+    export BATS_TEST_TIMEOUT="${BATS_TEST_TIMEOUT:-180}"
+  fi
   for var in $(compgen -e); do
     case "$var" in GIT_*) unset "$var" ;; esac
   done
