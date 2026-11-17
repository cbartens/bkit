diff --git a/.bkit/core/engine/audits/hooks/antigravity-hook-commands.integration.test.ts b/.bkit/core/engine/audits/hooks/antigravity-hook-commands.integration.test.ts
index 076750080..44bbdd889 100644
--- a/.bkit/core/engine/audits/hooks/antigravity-hook-commands.integration.test.ts
+++ b/.bkit/core/engine/audits/hooks/antigravity-hook-commands.integration.test.ts
@@ -11,6 +11,7 @@ import * as path from "node:path";
 import { spawnSync } from "node:child_process";
 import { afterAll, beforeAll, describe, expect, it } from "vitest";
 import { requireTsx } from "../../../../../vitest.tsx-bin";
+import { localLimit } from "../../../../../vitest.timeout-budget";
 
 const CLI = path.resolve(".bkit/core/engine/cli.ts");
 
@@ -65,7 +66,7 @@ beforeAll(() => {
   control = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ag-cmd-control-"));
   fs.cpSync(path.join(consumer, ".agents"), path.join(control, ".agents"), { recursive: true });
   fs.rmSync(path.join(control, PLUGIN_REL, "hooks"), { recursive: true, force: true });
-}, 120_000);
+}, localLimit(120_000));
 
 afterAll(() => {
   for (const dir of [consumer, control]) {
diff --git a/.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts b/.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts
index 7a6447fdf..4432fa9ce 100644
--- a/.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts
+++ b/.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts
@@ -18,6 +18,7 @@ import * as os from "node:os";
 import * as path from "node:path";
 import { afterAll, describe, expect, it } from "vitest";
 import { readTemplate } from "../../render/parts";
+import { localLimit } from "../../../../../vitest.timeout-budget";
 
 const HOOK_SOURCES = path.join(__dirname, "..", "..", "..", "..", "core");
 const GENERATED = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-preflight-"));
@@ -425,24 +426,28 @@ describe("preflight-tracker.sh — Jira and session issue sources", () => {
     expect(context).toMatch(/missing|absent|not (?:found|installed|available)/i);
   });
 
-  it("jira fetch %s stops the session naming the tracker and the reason", () => {
-    for (const [reason, message] of [
-      ["auth", /auth/i],
-      ["timeout", /timeout|timed out/i],
-    ] as const) {
-      const fixture = jiraFixture(false, ["bkit:auto"], reason);
-      const result = runPreflight(CURSOR_HOOK, fixture.env, BACKGROUND, {
-        cwd: fixture.cwd,
-        timeout: 25_000,
-      });
-      expect(result.status, reason).toBe(1);
-      const context = onlyDocument(result.stdout);
-      expect(context, reason).toContain("HARD STOP");
-      expect(context, reason).toMatch(/Jira/i);
-      expect(context, reason).toMatch(message);
-      expect(fs.existsSync(fixture.calls), reason).toBe(true);
-    }
-  }, 30_000);
+  it(
+    "jira fetch %s stops the session naming the tracker and the reason",
+    () => {
+      for (const [reason, message] of [
+        ["auth", /auth/i],
+        ["timeout", /timeout|timed out/i],
+      ] as const) {
+        const fixture = jiraFixture(false, ["bkit:auto"], reason);
+        const result = runPreflight(CURSOR_HOOK, fixture.env, BACKGROUND, {
+          cwd: fixture.cwd,
+          timeout: 25_000,
+        });
+        expect(result.status, reason).toBe(1);
+        const context = onlyDocument(result.stdout);
+        expect(context, reason).toContain("HARD STOP");
+        expect(context, reason).toMatch(/Jira/i);
+        expect(context, reason).toMatch(message);
+        expect(fs.existsSync(fixture.calls), reason).toBe(true);
+      }
+    },
+    localLimit(30_000),
+  );
 
   it("%s session with no issue id records bkit:auto not verified and exits 0", () => {
     for (const tracker of ["github", "jira"]) {
diff --git a/.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts b/.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts
index 20b5069e9..7e03a0f65 100644
--- a/.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts
+++ b/.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts
@@ -11,6 +11,7 @@ import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
 import { afterEach, describe, expect, it } from "vitest";
+import { localLimit } from "../../../../../vitest.timeout-budget";
 
 const ROOT = process.cwd();
 const BATS = path.join(ROOT, "node_modules", ".bin", "bats");
@@ -108,7 +109,7 @@ describe("tests/shell/setup_suite.bash", () => {
 });
 
 describe("a bats test's time limit", () => {
-  it("a hanging bats test fails with timeout after", { timeout: 100_000 }, () => {
+  it("a hanging bats test fails with timeout after", { timeout: localLimit(100_000) }, () => {
     const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-bats-suite-"));
     temps.push(dir);
     fs.copyFileSync(SETUP_SUITE, path.join(dir, "setup_suite.bash"));
diff --git a/.bkit/core/engine/audits/repo/json-parse-owner.test.ts b/.bkit/core/engine/audits/repo/json-parse-owner.test.ts
index 3990f7c42..bccaa9d6e 100644
--- a/.bkit/core/engine/audits/repo/json-parse-owner.test.ts
+++ b/.bkit/core/engine/audits/repo/json-parse-owner.test.ts
@@ -12,6 +12,7 @@ import * as path from "node:path";
 import { format, type Plugin } from "prettier";
 import * as typescriptPlugin from "prettier/plugins/typescript";
 import { describe, expect, it } from "vitest";
+import { localLimit } from "../../../../../vitest.timeout-budget";
 
 const ROOT = process.cwd();
 const ENGINE = path.join(ROOT, ".bkit", "core", "engine");
@@ -89,17 +90,21 @@ function engineSources(): string[] {
 }
 
 describe("JSON.parse inside a try statement belongs to shared/json.ts", () => {
-  it("no engine source parses JSON inside its own try", { timeout: 60_000 }, async () => {
-    const sources = engineSources();
-    expect(sources.length).toBeGreaterThan(50);
-    const findings: string[] = [];
-    for (const file of sources) {
-      for (const line of await jsonParseInTry(fs.readFileSync(file, "utf-8"), file)) {
-        findings.push(`${path.relative(ROOT, file)}:${line}`);
+  it(
+    "no engine source parses JSON inside its own try",
+    { timeout: localLimit(60_000) },
+    async () => {
+      const sources = engineSources();
+      expect(sources.length).toBeGreaterThan(50);
+      const findings: string[] = [];
+      for (const file of sources) {
+        for (const line of await jsonParseInTry(fs.readFileSync(file, "utf-8"), file)) {
+          findings.push(`${path.relative(ROOT, file)}:${line}`);
+        }
       }
-    }
-    expect(findings).toEqual([]);
-  });
+      expect(findings).toEqual([]);
+    },
+  );
 
   it("CONTROL — the owner's own parse is found, so the scan is not vacuous", async () => {
     const lines = await jsonParseInTry(fs.readFileSync(OWNER, "utf-8"), OWNER);
diff --git a/.bkit/core/engine/audits/repo/test-file-script.integration.test.ts b/.bkit/core/engine/audits/repo/test-file-script.integration.test.ts
index 98ef4ef5f..a78176d90 100644
--- a/.bkit/core/engine/audits/repo/test-file-script.integration.test.ts
+++ b/.bkit/core/engine/audits/repo/test-file-script.integration.test.ts
@@ -12,6 +12,7 @@ import * as path from "node:path";
 import { afterEach, describe, expect, it } from "vitest";
 import { isNamedCase, judgeGreen, judgeRed } from "../../commands/workflow/tests.js";
 import { parseJunit, REPORT_ENV } from "../../commands/workflow/junit.js";
+import { localLimit } from "../../../../../vitest.timeout-budget";
 
 const ROOT = process.cwd();
 
@@ -77,7 +78,7 @@ const FILES = [
 describe("bkit:test:file runs every test file kind into a JUnit report", () => {
   it.each(FILES)(
     "$kind — $file reports its named test passed",
-    { timeout: 120_000 },
+    { timeout: localLimit(120_000) },
     ({ file, test }) => {
       const report = path.join(tempDir(), "junit.xml");
       const res = pnpm({ [REPORT_ENV]: report }, "bkit:test:file", file);
@@ -88,7 +89,7 @@ describe("bkit:test:file runs every test file kind into a JUnit report", () => {
 
   it.each(FILES)(
     "$kind — with no report path the test file is left as it was",
-    { timeout: 120_000 },
+    { timeout: localLimit(120_000) },
     ({ file }) => {
       const before = fs.readFileSync(path.join(ROOT, file), "utf-8");
       const res = pnpm({ [REPORT_ENV]: "" }, "bkit:test:file", file);
@@ -136,7 +137,7 @@ const FAILING = [
 describe("bkit:test:file reports a failing test file kind as a red", () => {
   it.each(FAILING)(
     "$kind — a failing $name exits non-zero with a <failure> for its named test",
-    { timeout: 120_000 },
+    { timeout: localLimit(120_000) },
     ({ name, test, body }) => {
       const dir = tempDir();
       const file = path.join(dir, name);
@@ -154,7 +155,7 @@ describe("bkit:test:file reports a failing test file kind as a red", () => {
 });
 
 describe("bkit:lint:file passes a test file its linter does not cover", () => {
-  it.each(FILES)("$kind — $file lints clean", { timeout: 120_000 }, ({ file }) => {
+  it.each(FILES)("$kind — $file lints clean", { timeout: localLimit(120_000) }, ({ file }) => {
     const res = pnpm({}, "bkit:lint:file", file);
     expect(res.status, `${res.stdout}\n${res.stderr}`).toBe(0);
   });
@@ -163,7 +164,7 @@ describe("bkit:lint:file passes a test file its linter does not cover", () => {
 describe("bkit:test:file ends a node --test file whose test awaits a child that never exits", () => {
   it(
     "node — a test awaiting a child that never exits fails within the limit",
-    { timeout: 100_000 },
+    { timeout: localLimit(100_000) },
     () => {
       const dir = tempDir();
       const file = path.join(dir, "hang.test.mjs");
diff --git a/.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts b/.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts
index 59d6447c9..28aac8344 100644
--- a/.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts
+++ b/.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts
@@ -7,6 +7,7 @@
 import * as childProcess from "node:child_process";
 import { describe, expect, it } from "vitest";
 import { withChildDeadline } from "../../../../../vitest.child-deadline";
+import { localLimit } from "../../../../../vitest.timeout-budget";
 
 function wrapped(remainingMs: () => number) {
   const target = {
@@ -37,7 +38,7 @@ describe("withChildDeadline", () => {
   it("leaves an explicit timeout as the caller set it", () => {
     const cp = wrapped(() => 60_000);
     const started = Date.now();
-    const result = cp.spawnSync("sleep", ["30"], { timeout: 200 });
+    const result = cp.spawnSync("sleep", ["30"], { timeout: localLimit(200) });
     expect(Date.now() - started).toBeLessThan(10_000);
     expect(result.error).toBeDefined();
     expect((result.error as NodeJS.ErrnoException).code).toBe("ETIMEDOUT");
diff --git a/.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts b/.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts
index 720991cc6..76234defe 100644
--- a/.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts
+++ b/.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts
@@ -1,5 +1,5 @@
-// audits/repo/vitest-timeout-budget.test.ts — the repo's test budget is load-scaled, capped,
-// and re-read per test file, and every runner that carries it stays wired.
+// audits/repo/vitest-timeout-budget.test.ts — the repo's test budget is CI-strict, a fixed
+// multiple locally, and re-read per test file, and every runner that carries it stays wired.
 //
 // Mirror of a consumer's test-timeout-budget wiring test:
 // fail-closed on the wiring, so a config or setup that silently drops the re-read is caught
@@ -9,7 +9,13 @@ import * as fs from "node:fs";
 import * as path from "node:path";
 import { describe, expect, it } from "vitest";
 
-import { loadFactor, planUnitLoad, plannedLoadPerCore } from "../../../../../vitest.timeout-budget";
+import {
+  INTEGRATION_TEST_TIMEOUT_MS,
+  LOCAL_HANG_FACTOR,
+  limitFactor,
+  localLimit,
+  tierTimeouts,
+} from "../../../../../vitest.timeout-budget";
 
 const ROOT = process.cwd();
 const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf-8");
@@ -20,59 +26,101 @@ const code = (rel: string) =>
     .replace(/\/\*[\s\S]*?\*\//g, "")
     .replace(/^\s*\/\/.*$/gm, "");
 
-describe("the test budget is load-scaled, capped, and CI-pinned", () => {
+describe("the test budget is CI-strict and a fixed multiple locally", () => {
   const budget = code("vitest.timeout-budget.ts");
 
-  it("pins the factor to 1 under CI", () => {
-    expect(budget).toMatch(/env\.CI === "true" \|\| env\.CI === "1"/);
+  it("limitFactor returns 1 under CI", () => {
+    expect(limitFactor({ CI: "true" })).toBe(1);
+    expect(limitFactor({ CI: "1" })).toBe(1);
   });
 
-  it("never exceeds the cap", () => {
-    expect(budget).toMatch(/Math\.min\(\s*MAX_LOAD_FACTOR,\s*Math\.max\(1,/);
+  it("limitFactor returns LOCAL_HANG_FACTOR off CI", () => {
+    expect(LOCAL_HANG_FACTOR).toBe(6);
+    expect(limitFactor({})).toBe(LOCAL_HANG_FACTOR);
+    expect(limitFactor({ CI: "" })).toBe(LOCAL_HANG_FACTOR);
+    expect(limitFactor({ CI: "false" })).toBe(LOCAL_HANG_FACTOR);
   });
 
-  it("keeps the 5s unit and 30s integration bases", () => {
-    expect(budget).toMatch(/UNIT_TEST_TIMEOUT_MS = 5_000/);
-    expect(budget).toMatch(/INTEGRATION_TEST_TIMEOUT_MS = 30_000/);
+  it("tierTimeouts gives the strict bases under CI", () => {
+    const factor = limitFactor({ CI: "true" });
+    expect(tierTimeouts(false, factor)).toEqual({ testTimeout: 5_000, hookTimeout: 10_000 });
+    expect(tierTimeouts(true, factor)).toEqual({ testTimeout: 30_000, hookTimeout: 30_000 });
   });
-});
 
-describe("the run declares the load it is about to add", () => {
-  it("projects the load now plus one core per worker, over the cores", () => {
-    expect(plannedLoadPerCore(9, 3, 10)).toBeCloseTo(1.2);
-    expect(plannedLoadPerCore(9, 25, 10)).toBeCloseTo(3.4);
+  it("tierTimeouts gives 6x the bases locally", () => {
+    const factor = limitFactor({});
+    expect(tierTimeouts(false, factor)).toEqual({ testTimeout: 30_000, hookTimeout: 60_000 });
+    expect(tierTimeouts(true, factor)).toEqual({ testTimeout: 180_000, hookTimeout: 180_000 });
   });
 
-  it("raises the factor above a quiet reading", () => {
-    expect(loadFactor(3, 10, { UNIT_PLANNED_LOAD_PER_CORE: "3.40" })).toBeCloseTo(3.4);
+  it("localLimit scales a file's own limit locally only", () => {
+    expect(localLimit(60_000, limitFactor({ CI: "true" }))).toBe(60_000);
+    expect(localLimit(60_000, limitFactor({}))).toBe(360_000);
   });
 
-  it("sets the planned load from vitest's default of a worker per core but one", () => {
-    const env: NodeJS.ProcessEnv = {};
-    expect(planUnitLoad(env, 25, 10)).toBe("3.40");
-    expect(env.UNIT_PLANNED_LOAD_PER_CORE).toBe("3.40");
+  it("keeps the 5s unit and 30s integration bases", () => {
+    expect(budget).toMatch(/UNIT_TEST_TIMEOUT_MS = 5_000/);
+    expect(budget).toMatch(/INTEGRATION_TEST_TIMEOUT_MS = 30_000/);
   });
 
-  it("keeps a planned load a caller already set", () => {
-    const env: NodeJS.ProcessEnv = { UNIT_PLANNED_LOAD_PER_CORE: "2.00" };
-    expect(planUnitLoad(env, 25, 10)).toBe("2.00");
-    expect(env.UNIT_PLANNED_LOAD_PER_CORE).toBe("2.00");
+  it("the budget reads no load", () => {
+    const readsLoad = (src: string) => /loadavg|availableParallelism|PLANNED_LOAD/.test(src);
+    expect(readsLoad(budget)).toBe(false);
+    // CONTROL: a source that calls os.loadavg() is caught
+    expect(readsLoad("const l = os.loadavg()[0];")).toBe(true);
   });
+});
 
-  it("vitest.config.ts plans the load before it reads the budget", () => {
+describe("the configs read the fixed budget", () => {
+  it("vitest.config.ts spreads unitTimeouts and plans no load", () => {
     const config = code("vitest.config.ts");
-    expect(config).toMatch(/planUnitLoad\(\);/);
-    expect(config.indexOf("planUnitLoad();")).toBeLessThan(config.indexOf("...unitTimeouts()"));
+    expect(config).toMatch(/\.\.\.unitTimeouts\(\)/);
+    expect(config).not.toMatch(/planUnitLoad/);
+    // CONTROL: a config that still plans the load is caught
+    expect(/planUnitLoad/.test("planUnitLoad();\n...unitTimeouts()")).toBe(true);
+    expect(code("vitest.setup.ts")).toMatch(/vi\.setConfig\(tierTimeouts\(/);
+  });
+
+  it("the bats local default matches the integration hang limit", () => {
+    const localDefault = (src: string) =>
+      /else\s+export BATS_TEST_TIMEOUT="\$\{BATS_TEST_TIMEOUT:-(\d+)\}"/.exec(src)?.[1];
+    const expected = String((INTEGRATION_TEST_TIMEOUT_MS * LOCAL_HANG_FACTOR) / 1000);
+    expect(localDefault(read("tests/shell/setup_suite.bash"))).toBe(expected);
+    // CONTROL: a mismatched value is caught
+    const bad = 'else\n    export BATS_TEST_TIMEOUT="${BATS_TEST_TIMEOUT:-90}"\n';
+    expect(localDefault(bad)).not.toBe(expected);
+  });
+});
+
+describe("no test file sets a bare limit", () => {
+  const BARE = /\{ ?timeout: ?[0-9][0-9_]* ?\}|\}, ?[0-9][0-9_]{3,}\);/;
+  const SELF = ".bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts";
+  const walk = (dir: string): string[] =>
+    fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) => {
+      const rel = path.posix.join(dir, e.name);
+      if (e.isDirectory()) return e.name === "node_modules" ? [] : walk(rel);
+      return e.name.endsWith(".test.ts") ? [rel] : [];
+    });
+
+  it("no test file sets a bare numeric test or hook limit", () => {
+    const files = [...walk(".bkit/core/engine"), ...walk("scripts/harvest")].filter(
+      (f) => f !== SELF,
+    );
+    const offenders = files.filter((f) => BARE.test(read(f)));
+    expect(offenders).toEqual([]);
   });
 
-  it("CONTROL — a config that never plans the load is caught", () => {
-    const bad = `import { defineConfig } from "vitest/config";\nexport default defineConfig({ test: { ...unitTimeouts() } });\n`;
-    expect(/planUnitLoad\(\);/.test(bad)).toBe(false);
+  it("CONTROL — a bare numeric test limit is caught", () => {
+    expect(BARE.test('it("x", { timeout: 30_000 }, fn)')).toBe(true);
+    expect(BARE.test("it('x', () => {\n}, 30_000);")).toBe(true);
+    expect(BARE.test('it("x", { timeout: localLimit(30_000) }, fn)')).toBe(false);
+    // the wrapped form the guard accepts really is scaled by the fixed local factor
+    expect(localLimit(30_000, limitFactor({}))).toBe(30_000 * LOCAL_HANG_FACTOR);
   });
 });
 
 describe("the runners re-read the budget per test file", () => {
-  it("vitest.config.ts spreads the load-scaled unit budget", () => {
+  it("vitest.config.ts spreads the unit budget", () => {
     const config = code("vitest.config.ts");
     expect(config).toMatch(
       /import \{[^}]*\bunitTimeouts\b[^}]*\} from "\.\/vitest\.timeout-budget\.ts"/,
diff --git a/.bkit/core/engine/audits/templates/ci-scripts.test.ts b/.bkit/core/engine/audits/templates/ci-scripts.test.ts
index 084045fd9..dc7a19530 100644
--- a/.bkit/core/engine/audits/templates/ci-scripts.test.ts
+++ b/.bkit/core/engine/audits/templates/ci-scripts.test.ts
@@ -11,6 +11,7 @@ import * as path from "node:path";
 import { pathToFileURL } from "node:url";
 import { afterEach, describe, expect, it } from "vitest";
 import { parse as parseYamlText } from "yaml";
+import { localLimit } from "../../../../../vitest.timeout-budget";
 
 const tmpDirs: string[] = [];
 afterEach(() => {
@@ -127,12 +128,16 @@ describe("shipped copy-and-own test files", () => {
     expect(SHIPPED_TEST_FILES.length).toBeGreaterThan(0);
   });
 
-  it.each(SHIPPED_TEST_FILES)("%s passes when run on its own", { timeout: 30_000 }, (file) => {
-    const res = spawnSync(process.execPath, [path.join(SHIPPED_SCRIPTS_DIR, file)], {
-      encoding: "utf-8",
-    });
-    expect(res.status, res.stdout + res.stderr).toBe(0);
-  });
+  it.each(SHIPPED_TEST_FILES)(
+    "%s passes when run on its own",
+    { timeout: localLimit(30_000) },
+    (file) => {
+      const res = spawnSync(process.execPath, [path.join(SHIPPED_SCRIPTS_DIR, file)], {
+        encoding: "utf-8",
+      });
+      expect(res.status, res.stdout + res.stderr).toBe(0);
+    },
+  );
 });
 
 const CAPSTONE_SCRIPT = path.resolve(".bkit/templates/scripts/ci/bkit-check-capstone.mjs");
diff --git a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
index ae1d56d06..27cf12e69 100644
--- a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
@@ -5,6 +5,7 @@ import * as os from "node:os";
 import * as path from "node:path";
 import { spawnSync } from "node:child_process";
 import { afterEach, beforeEach, describe, expect, it } from "vitest";
+import { localLimit } from "../../../../../vitest.timeout-budget";
 
 // Gate-order fixtures stand in for package execution; the min-push suite runs the real CLI.
 const UNWRAP_PUSH_GATE =
@@ -1545,27 +1546,31 @@ describe(".husky/pre-push direnv", () => {
 });
 
 describe("the gate's vitest run", () => {
-  it("the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED", () => {
-    const env: NodeJS.ProcessEnv = { ...process.env, BKIT_PRE_PUSH_LOGGED: "1" };
-    delete env.CI;
-    delete env.GITHUB_ACTIONS;
-    const result = spawnSync(
-      "pnpm",
-      [
-        "exec",
-        "vitest",
-        "run",
-        "-c",
-        "vitest.unit.config.ts",
-        ".bkit/core/engine/checks/tips/catalogue.test.ts",
-        "-t",
-        "inside the pre-push hook",
-      ],
-      { cwd: process.cwd(), encoding: "utf-8", timeout: 120_000, env },
-    );
-    expect(`${result.stdout}\n${result.stderr}`, "vitest output").toContain("1 passed");
-    expect(result.status).toBe(0);
-  }, 150_000);
+  it(
+    "the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED",
+    () => {
+      const env: NodeJS.ProcessEnv = { ...process.env, BKIT_PRE_PUSH_LOGGED: "1" };
+      delete env.CI;
+      delete env.GITHUB_ACTIONS;
+      const result = spawnSync(
+        "pnpm",
+        [
+          "exec",
+          "vitest",
+          "run",
+          "-c",
+          "vitest.unit.config.ts",
+          ".bkit/core/engine/checks/tips/catalogue.test.ts",
+          "-t",
+          "inside the pre-push hook",
+        ],
+        { cwd: process.cwd(), encoding: "utf-8", timeout: 120_000, env },
+      );
+      expect(`${result.stdout}\n${result.stderr}`, "vitest output").toContain("1 passed");
+      expect(result.status).toBe(0);
+    },
+    localLimit(150_000),
+  );
 });
 
 // ---------------------------------------------------------------------------
diff --git a/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts b/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
index e40e90e15..192bc2938 100644
--- a/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
@@ -18,6 +18,7 @@ import { setTimeout as delay } from "node:timers/promises";
 import { afterEach, beforeEach, describe, expect, it } from "vitest";
 
 import { tierTimeouts } from "../../../../../vitest.timeout-budget";
+import { localLimit } from "../../../../../vitest.timeout-budget";
 
 const OLD_SCRIPT = path.resolve("tests/fixtures/machine-lock/stack-lock-6.0.0.sh");
 const OLD_LOCK_SCRIPT = path.resolve("tests/fixtures/machine-lock/machine-lock-6.1.1.sh");
@@ -1591,38 +1592,42 @@ describe("machine lock waiting order", { timeout: BUDGET.testTimeout }, () => {
     expect(readLines(order)).toEqual(["x", "z", "y"]);
   });
 
-  it("concurrent first takes on a fresh cache exit 0 with no cannot-create refusal", async () => {
-    const rounds = 50;
-    const takes = 16;
-    const results: { round: number; i: number; status: string; err: string }[] = [];
-    for (let round = 0; round < rounds; round++) {
-      const env = envFor({
-        LOCAL_STACK_LOCK_WAIT_S: "60",
-        XDG_CACHE_HOME: path.join(tmp, "race-cache-" + round),
-      });
-      // One shell forks every taker back to back, so they reach the queue folder together.
-      const burst = spawnSync(
-        "bash",
-        [
-          "-c",
-          `for i in $(seq ${takes}); do ( bash "${SCRIPT}" run race$i --lock tests -- true 2>"$XDG_CACHE_HOME.err$i"; echo $? >"$XDG_CACHE_HOME.st$i" ) & done; wait`,
-        ],
-        { env, cwd: process.cwd(), encoding: "utf8" },
-      );
-      expect(burst.error).toBeUndefined();
-      for (let i = 1; i <= takes; i++) {
-        const base = path.join(tmp, "race-cache-" + round);
-        const status = fs.readFileSync(`${base}.st${i}`, "utf8").trim();
-        const err = fs.readFileSync(`${base}.err${i}`, "utf8").trim();
-        // The "in line" waiting note is normal; only a non-zero exit or a queue-folder refusal counts.
-        results.push({ round, i, status, err });
+  it(
+    "concurrent first takes on a fresh cache exit 0 with no cannot-create refusal",
+    async () => {
+      const rounds = 50;
+      const takes = 16;
+      const results: { round: number; i: number; status: string; err: string }[] = [];
+      for (let round = 0; round < rounds; round++) {
+        const env = envFor({
+          LOCAL_STACK_LOCK_WAIT_S: "60",
+          XDG_CACHE_HOME: path.join(tmp, "race-cache-" + round),
+        });
+        // One shell forks every taker back to back, so they reach the queue folder together.
+        const burst = spawnSync(
+          "bash",
+          [
+            "-c",
+            `for i in $(seq ${takes}); do ( bash "${SCRIPT}" run race$i --lock tests -- true 2>"$XDG_CACHE_HOME.err$i"; echo $? >"$XDG_CACHE_HOME.st$i" ) & done; wait`,
+          ],
+          { env, cwd: process.cwd(), encoding: "utf8" },
+        );
+        expect(burst.error).toBeUndefined();
+        for (let i = 1; i <= takes; i++) {
+          const base = path.join(tmp, "race-cache-" + round);
+          const status = fs.readFileSync(`${base}.st${i}`, "utf8").trim();
+          const err = fs.readFileSync(`${base}.err${i}`, "utf8").trim();
+          // The "in line" waiting note is normal; only a non-zero exit or a queue-folder refusal counts.
+          results.push({ round, i, status, err });
+        }
       }
-    }
-    const refused = results
-      .filter((r) => /^exit=(?!0\n)|cannot create|File exists/.test(`exit=${r.status}\n${r.err}`))
-      .map((r) => `round ${r.round} take ${r.i} exit ${r.status}: ${r.err}`);
-    expect(refused).toEqual([]);
-  }, 600_000);
+      const refused = results
+        .filter((r) => /^exit=(?!0\n)|cannot create|File exists/.test(`exit=${r.status}\n${r.err}`))
+        .map((r) => `round ${r.round} take ${r.i} exit ${r.status}: ${r.err}`);
+      expect(refused).toEqual([]);
+    },
+    localLimit(600_000),
+  );
 
   it("a waiter whose caller ignores SIGHUP keeps its place when its helper gets SIGHUP", async () => {
     const env = waitEnv();
diff --git a/.bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts b/.bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts
index fb26a4397..3f396a739 100644
--- a/.bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts
@@ -12,6 +12,7 @@ import * as path from "node:path";
 import { afterAll, describe, expect, it } from "vitest";
 
 import { substituteWorkflow } from "../../render/trackers";
+import { localLimit } from "../../../../../vitest.timeout-budget";
 
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 const WORKFLOWS = path.join(REPO_ROOT, ".bkit", "core", "workflows");
@@ -107,13 +108,17 @@ describe("workflow shell fences", () => {
     expect(fence).toEqual({ file: "x.md", line: 2, body: 'echo "DUMMY"\n' });
   });
 
-  it("every fence parses under bash -n", { timeout: 60_000 }, () => {
+  it("every fence parses under bash -n", { timeout: localLimit(60_000) }, () => {
     expect(syntaxErrors("bash")).toEqual([]);
   });
 
-  it.skipIf(!hasShell("zsh"))("every fence parses under zsh -n", { timeout: 60_000 }, () => {
-    expect(syntaxErrors("zsh")).toEqual([]);
-  });
+  it.skipIf(!hasShell("zsh"))(
+    "every fence parses under zsh -n",
+    { timeout: localLimit(60_000) },
+    () => {
+      expect(syntaxErrors("zsh")).toEqual([]);
+    },
+  );
 });
 
 // Git, GitHub and file I/O belong to `bkit` verbs: a workflow fence never calls `git` or
diff --git a/.bkit/core/engine/commands/ci/ci.test.ts b/.bkit/core/engine/commands/ci/ci.test.ts
index 28407eeb2..d764faaf1 100644
--- a/.bkit/core/engine/commands/ci/ci.test.ts
+++ b/.bkit/core/engine/commands/ci/ci.test.ts
@@ -19,6 +19,7 @@ import {
   resolveBaseRef,
   slopScanArgv,
 } from "./ci";
+import { localLimit } from "../../../../../vitest.timeout-budget";
 
 const REPO = path.resolve(__dirname, "../../../../..");
 const REPO_BIN = path.join(REPO, "node_modules", ".bin");
@@ -504,76 +505,96 @@ describe("bkit ci slop — real slop-scan", () => {
     return { cwd, base };
   };
 
-  it("a genuinely new finding fails the gate", async () => {
-    const { cwd, base } = realRepo({ "x.ts": CLEAN });
-    write(cwd, "y.ts", EMPTY_CATCH);
-    const r = await run(cwd, [`--base=${base}`]);
-    expect(r.code).toBe(1);
-    expect(r.json.netFindingCount).toBeGreaterThan(0);
-    expect(r.json.findings).toContainEqual(
-      expect.objectContaining({ status: "added", path: "y.ts", line: expect.any(Number) }),
-    );
-    expect(r.err).toMatch(/added {5}y\.ts:\d+ {2}\S+/);
-    expectCleaned(cwd);
-  }, 30_000);
+  it(
+    "a genuinely new finding fails the gate",
+    async () => {
+      const { cwd, base } = realRepo({ "x.ts": CLEAN });
+      write(cwd, "y.ts", EMPTY_CATCH);
+      const r = await run(cwd, [`--base=${base}`]);
+      expect(r.code).toBe(1);
+      expect(r.json.netFindingCount).toBeGreaterThan(0);
+      expect(r.json.findings).toContainEqual(
+        expect.objectContaining({ status: "added", path: "y.ts", line: expect.any(Number) }),
+      );
+      expect(r.err).toMatch(/added {5}y\.ts:\d+ {2}\S+/);
+      expectCleaned(cwd);
+    },
+    localLimit(30_000),
+  );
 
-  it("names the file and rule when a per-file finding's count grows (score rise, flat count)", async () => {
-    const { cwd, base } = realRepo({ "y.ts": EMPTY_CATCH });
-    write(cwd, "y.ts", "// shifted\n" + EMPTY_CATCH + EMPTY_CATCH.replace("risky", "risky2"));
-    const r = await run(cwd, [`--base=${base}`]);
-    expect(r.code).toBe(1);
-    expect(r.json.netFindingCount).toBe(0);
-    expect(
-      r.json.findings.map((f: { path: string; line: number }) => `${f.path}:${f.line}`),
-    ).toEqual(["y.ts:3", "y.ts:8"]);
-    expect(r.err).toContain("y.ts:8  defensive.empty-catch  Found 2 empty catch blocks");
-  }, 30_000);
+  it(
+    "names the file and rule when a per-file finding's count grows (score rise, flat count)",
+    async () => {
+      const { cwd, base } = realRepo({ "y.ts": EMPTY_CATCH });
+      write(cwd, "y.ts", "// shifted\n" + EMPTY_CATCH + EMPTY_CATCH.replace("risky", "risky2"));
+      const r = await run(cwd, [`--base=${base}`]);
+      expect(r.code).toBe(1);
+      expect(r.json.netFindingCount).toBe(0);
+      expect(
+        r.json.findings.map((f: { path: string; line: number }) => `${f.path}:${f.line}`),
+      ).toEqual(["y.ts:3", "y.ts:8"]);
+      expect(r.err).toContain("y.ts:8  defensive.empty-catch  Found 2 empty catch blocks");
+    },
+    localLimit(30_000),
+  );
 
-  it("an unchanged tree nets to zero and passes — and every gated summary field is present", async () => {
-    const { cwd, base } = realRepo({ "x.ts": CLEAN });
-    const r = await run(cwd, [`--base=${base}`]);
-    expect(r.code).toBe(0);
-    expect(r.json).toMatchObject({ passed: true, netFindingCount: 0 });
-  }, 30_000);
+  it(
+    "an unchanged tree nets to zero and passes — and every gated summary field is present",
+    async () => {
+      const { cwd, base } = realRepo({ "x.ts": CLEAN });
+      const r = await run(cwd, [`--base=${base}`]);
+      expect(r.code).toBe(0);
+      expect(r.json).toMatchObject({ passed: true, netFindingCount: 0 });
+    },
+    localLimit(30_000),
+  );
 
-  it("a pre-existing finding that merely moves nets to zero and passes (#226)", async () => {
-    const { cwd, base } = realRepo({ "y.ts": EMPTY_CATCH });
-    write(cwd, "y.ts", "// new line one\n// new line two\n" + EMPTY_CATCH);
-    const r = await run(cwd, [`--base=${base}`]);
-    expect(r.code).toBe(0);
-    expect(r.json.netFindingCount).toBe(0);
-  }, 30_000);
+  it(
+    "a pre-existing finding that merely moves nets to zero and passes (#226)",
+    async () => {
+      const { cwd, base } = realRepo({ "y.ts": EMPTY_CATCH });
+      write(cwd, "y.ts", "// new line one\n// new line two\n" + EMPTY_CATCH);
+      const r = await run(cwd, [`--base=${base}`]);
+      expect(r.code).toBe(0);
+      expect(r.json.netFindingCount).toBe(0);
+    },
+    localLimit(30_000),
+  );
 });
 
 describe("bkit ci slop — interrupted", () => {
-  it("removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal", () => {
-    const { cwd, base } = repo();
-    // The fake signals its parent (the command's process) while the scan blocks.
-    const bin = mkdir("bkit-ci-sig-");
-    fs.writeFileSync(
-      path.join(bin, "slop-scan"),
-      `#!/bin/sh\nkill -TERM $PPID\nsleep 0.2\necho '${JSON.stringify({ summary: summary() })}'\n`,
-      { mode: 0o755 },
-    );
-    const driver = path.join(bin, "driver.mts");
-    fs.writeFileSync(
-      driver,
-      [
-        `import { runCommand } from ${JSON.stringify(path.join(__dirname, "..", "lib.ts"))};`,
-        `import { ciCommand } from ${JSON.stringify(path.join(__dirname, "ci.ts"))};`,
-        `const code = await runCommand(["ci", "slop", "--base=${base}"], [ciCommand], { classicVerbs: new Set(), cwd: ${JSON.stringify(cwd)} });`,
-        `process.stdout.write("returned " + code);`,
-      ].join("\n"),
-    );
-    const res = spawnSync(requireTsx(), [driver], {
-      cwd: REPO,
-      encoding: "utf-8",
-      env: { ...process.env, PATH: pathWith(bin) },
-    });
-    expect(res.stdout).not.toContain("returned");
-    expect(diedOfSigterm(res)).toBe(true);
-    expectCleaned(cwd);
-  }, 30_000);
+  it(
+    "removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal",
+    () => {
+      const { cwd, base } = repo();
+      // The fake signals its parent (the command's process) while the scan blocks.
+      const bin = mkdir("bkit-ci-sig-");
+      fs.writeFileSync(
+        path.join(bin, "slop-scan"),
+        `#!/bin/sh\nkill -TERM $PPID\nsleep 0.2\necho '${JSON.stringify({ summary: summary() })}'\n`,
+        { mode: 0o755 },
+      );
+      const driver = path.join(bin, "driver.mts");
+      fs.writeFileSync(
+        driver,
+        [
+          `import { runCommand } from ${JSON.stringify(path.join(__dirname, "..", "lib.ts"))};`,
+          `import { ciCommand } from ${JSON.stringify(path.join(__dirname, "ci.ts"))};`,
+          `const code = await runCommand(["ci", "slop", "--base=${base}"], [ciCommand], { classicVerbs: new Set(), cwd: ${JSON.stringify(cwd)} });`,
+          `process.stdout.write("returned " + code);`,
+        ].join("\n"),
+      );
+      const res = spawnSync(requireTsx(), [driver], {
+        cwd: REPO,
+        encoding: "utf-8",
+        env: { ...process.env, PATH: pathWith(bin) },
+      });
+      expect(res.stdout).not.toContain("returned");
+      expect(diedOfSigterm(res)).toBe(true);
+      expectCleaned(cwd);
+    },
+    localLimit(30_000),
+  );
 });
 
 // ---------------------------------------------------------------------------
diff --git a/.bkit/core/engine/commands/install/check.integration.test.ts b/.bkit/core/engine/commands/install/check.integration.test.ts
index b473c89f7..d855433cb 100644
--- a/.bkit/core/engine/commands/install/check.integration.test.ts
+++ b/.bkit/core/engine/commands/install/check.integration.test.ts
@@ -25,6 +25,7 @@ import { parseModelLookup, buildOpencodeModelLookup, parseEffortMap } from "../.
 import type { WriteSet } from "../../install/write";
 import { getBkitDocsRoot } from "../../shared/package-roots";
 import { requireTsx } from "../../../../../vitest.tsx-bin";
+import { localLimit } from "../../../../../vitest.timeout-budget";
 
 let tmpDir: string;
 let originalCwd: string;
@@ -242,35 +243,39 @@ describe("#255 #8 — bkit check gates opencode drift (no false positives)", ()
 describe("bkit check — antigravity detected from any plugin file", () => {
   const plugin = (rel: string) => path.join(tmpDir, ".agents", "plugins", "bkit", rel);
 
-  it("deleted plugin.json + neutered guardrails command + deleted guardrails hook → check exits 1 naming each", () => {
-    expect(runBkit(["install", "--antigravity"]).status).toBe(0);
-    expect(runBkit(["check"]).status).toBe(0);
-
-    fs.rmSync(plugin("plugin.json"));
-    const manifestOnly = runBkit(["check"]);
-    expect(manifestOnly.status).toBe(1);
-    expect(manifestOnly.stdout).toContain(".agents/plugins/bkit/plugin.json");
-    const status = runBkit(["status"]);
-    expect(status.stdout).toMatch(/antigravity: INSTALLED/);
-
-    type HookGroup = { hooks: { command: string }[] };
-    const hooksDoc = JSON.parse(fs.readFileSync(plugin("hooks.json"), "utf-8")) as {
-      hooks: { PreToolUse: HookGroup[] };
-    };
-    const rail = hooksDoc.hooks.PreToolUse.flatMap((g) => g.hooks).find((h) =>
-      h.command.includes("bkit-guardrails.cjs"),
-    );
-    expect(rail).toBeDefined();
-    rail!.command = "true";
-    fs.writeFileSync(plugin("hooks.json"), JSON.stringify(hooksDoc, null, 2) + "\n");
-    fs.rmSync(plugin("hooks/bkit-guardrails.cjs"));
-    const check = runBkit(["check"]);
-    const out = `${check.stdout}${check.stderr}`;
-    expect(check.status).toBe(1);
-    expect(out).toContain(".agents/plugins/bkit/plugin.json");
-    expect(out).toContain(".agents/plugins/bkit/hooks.json");
-    expect(out).toContain("check: .agents/plugins/bkit/hooks/bkit-guardrails.cjs is missing");
-  }, 180_000);
+  it(
+    "deleted plugin.json + neutered guardrails command + deleted guardrails hook → check exits 1 naming each",
+    () => {
+      expect(runBkit(["install", "--antigravity"]).status).toBe(0);
+      expect(runBkit(["check"]).status).toBe(0);
+
+      fs.rmSync(plugin("plugin.json"));
+      const manifestOnly = runBkit(["check"]);
+      expect(manifestOnly.status).toBe(1);
+      expect(manifestOnly.stdout).toContain(".agents/plugins/bkit/plugin.json");
+      const status = runBkit(["status"]);
+      expect(status.stdout).toMatch(/antigravity: INSTALLED/);
+
+      type HookGroup = { hooks: { command: string }[] };
+      const hooksDoc = JSON.parse(fs.readFileSync(plugin("hooks.json"), "utf-8")) as {
+        hooks: { PreToolUse: HookGroup[] };
+      };
+      const rail = hooksDoc.hooks.PreToolUse.flatMap((g) => g.hooks).find((h) =>
+        h.command.includes("bkit-guardrails.cjs"),
+      );
+      expect(rail).toBeDefined();
+      rail!.command = "true";
+      fs.writeFileSync(plugin("hooks.json"), JSON.stringify(hooksDoc, null, 2) + "\n");
+      fs.rmSync(plugin("hooks/bkit-guardrails.cjs"));
+      const check = runBkit(["check"]);
+      const out = `${check.stdout}${check.stderr}`;
+      expect(check.status).toBe(1);
+      expect(out).toContain(".agents/plugins/bkit/plugin.json");
+      expect(out).toContain(".agents/plugins/bkit/hooks.json");
+      expect(out).toContain("check: .agents/plugins/bkit/hooks/bkit-guardrails.cjs is missing");
+    },
+    localLimit(180_000),
+  );
 });
 
 // ---------------------------------------------------------------------------
@@ -403,7 +408,7 @@ describe("check-owned-hooks", () => {
         "--auto=claude",
       ]);
       expect(install.status, install.combined).toBe(0);
-    }, 120_000);
+    }, localLimit(120_000));
 
     afterAll(() => {
       fs.rmSync(dir, { recursive: true, force: true });
diff --git a/.bkit/core/engine/commands/install/install.integration.test.ts b/.bkit/core/engine/commands/install/install.integration.test.ts
index c24cee9cb..68b398303 100644
--- a/.bkit/core/engine/commands/install/install.integration.test.ts
+++ b/.bkit/core/engine/commands/install/install.integration.test.ts
@@ -19,6 +19,7 @@ import { resolveNetworkAllowlist } from "../../install/cloud-env";
 import { listFilesRecursive, remapTemplateDest } from "../../install/template-copies";
 import { getCoreRoot, getSharedRoot, getTemplatesRoot } from "../../shared/package-roots";
 import { requireTsx } from "../../../../../vitest.tsx-bin";
+import { localLimit } from "../../../../../vitest.timeout-budget";
 
 // ---------------------------------------------------------------------------
 // Helpers
@@ -589,63 +590,67 @@ describe("Scenario 7 — bkit install subprocess exits 1 on Phase 3 blocker (P2.
 // ---------------------------------------------------------------------------
 
 describe("Scenario 8 — bkit install --auto-revert reverts on Phase 3 blocker (P2.T10)", () => {
-  it("--auto-revert: exits 1, auto-revert message present, Tier-1 writes reverted", () => {
-    // Set up a Phase 3 blocker condition (same as Scenario 7): a stale bkit-managed
-    // marker on a host this run does NOT install (claude).
-    fs.writeFileSync(
-      path.join(tmpDir, "package.json"),
-      JSON.stringify({
-        name: "test-consumer",
-        version: "0.0.0",
-        devDependencies: {},
-        scripts: { test: "echo ok" },
-      }),
-    );
-    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
-    fs.mkdirSync(path.join(tmpDir, ".claude", "agents"), { recursive: true });
-    fs.writeFileSync(
-      path.join(tmpDir, ".claude", "agents", "bkit-stale.md"),
-      "<!-- bkit:managed v1.0.0 — stale — do not edit -->\n\nstale content\n",
-    );
+  it(
+    "--auto-revert: exits 1, auto-revert message present, Tier-1 writes reverted",
+    () => {
+      // Set up a Phase 3 blocker condition (same as Scenario 7): a stale bkit-managed
+      // marker on a host this run does NOT install (claude).
+      fs.writeFileSync(
+        path.join(tmpDir, "package.json"),
+        JSON.stringify({
+          name: "test-consumer",
+          version: "0.0.0",
+          devDependencies: {},
+          scripts: { test: "echo ok" },
+        }),
+      );
+      fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
+      fs.mkdirSync(path.join(tmpDir, ".claude", "agents"), { recursive: true });
+      fs.writeFileSync(
+        path.join(tmpDir, ".claude", "agents", "bkit-stale.md"),
+        "<!-- bkit:managed v1.0.0 — stale — do not edit -->\n\nstale content\n",
+      );
 
-    const bkitInstallPath = path.resolve(
-      path.dirname(new URL(import.meta.url).pathname),
-      "../../cli.ts",
-    );
+      const bkitInstallPath = path.resolve(
+        path.dirname(new URL(import.meta.url).pathname),
+        "../../cli.ts",
+      );
 
-    // Capture pre-install state: .bkit/version must not exist
-    const versionFilePath = path.join(tmpDir, ".bkit", "version");
-    expect(fs.existsSync(versionFilePath)).toBe(false);
+      // Capture pre-install state: .bkit/version must not exist
+      const versionFilePath = path.join(tmpDir, ".bkit", "version");
+      expect(fs.existsSync(versionFilePath)).toBe(false);
 
-    const result = spawnSync(
-      requireTsx(),
-      [bkitInstallPath, "install", "--cursor", "--auto-revert"],
-      {
-        cwd: tmpDir,
-        encoding: "utf-8",
-        env: {
-          ...process.env,
-          NODE_NO_WARNINGS: "1",
-          // Protected branch → the stale managed marker is a blocker.
-          GITHUB_REF_NAME: "dev",
+      const result = spawnSync(
+        requireTsx(),
+        [bkitInstallPath, "install", "--cursor", "--auto-revert"],
+        {
+          cwd: tmpDir,
+          encoding: "utf-8",
+          env: {
+            ...process.env,
+            NODE_NO_WARNINGS: "1",
+            // Protected branch → the stale managed marker is a blocker.
+            GITHUB_REF_NAME: "dev",
+          },
+          timeout: 60_000,
         },
-        timeout: 60_000,
-      },
-    );
+      );
 
-    // Exit 1 due to Phase 3 blocker
-    expect(result.status).toBe(1);
+      // Exit 1 due to Phase 3 blocker
+      expect(result.status).toBe(1);
 
-    const combined = combinedOutput(result);
+      const combined = combinedOutput(result);
 
-    // Auto-revert log messages must be present — confirms in-process revert ran
-    expect(combined).toContain("--auto-revert");
+      // Auto-revert log messages must be present — confirms in-process revert ran
+      expect(combined).toContain("--auto-revert");
 
-    // The Tier-1 .bkit/version written by --core MUST be absent after
-    // auto-revert (runUninstall deleted it as a Tier-1 file).
-    // This is the byte-identical-to-pre-install check: file was absent → now absent.
-    expect(fs.existsSync(versionFilePath)).toBe(false);
-  }, 90_000);
+      // The Tier-1 .bkit/version written by --core MUST be absent after
+      // auto-revert (runUninstall deleted it as a Tier-1 file).
+      // This is the byte-identical-to-pre-install check: file was absent → now absent.
+      expect(fs.existsSync(versionFilePath)).toBe(false);
+    },
+    localLimit(90_000),
+  );
 });
 
 // ---------------------------------------------------------------------------
@@ -1216,42 +1221,46 @@ describe("T10 — claudeAllowDerived survives a real install", () => {
     fs.writeFileSync(p, `${body}${block}`);
   };
 
-  it("records the resolved grant set, then updates it when allowed-domains shrinks", () => {
-    const { bkitInstallPath } = paths();
-    fs.writeFileSync(
-      path.join(tmpDir, "package.json"),
-      JSON.stringify({ name: "t10", version: "1.0.0", packageManager: "pnpm@10.34.3" }, null, 2),
-    );
-    // preflight requires a repo root; the other spawned-install cases seed it the same way
-    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
+  it(
+    "records the resolved grant set, then updates it when allowed-domains shrinks",
+    () => {
+      const { bkitInstallPath } = paths();
+      fs.writeFileSync(
+        path.join(tmpDir, "package.json"),
+        JSON.stringify({ name: "t10", version: "1.0.0", packageManager: "pnpm@10.34.3" }, null, 2),
+      );
+      // preflight requires a repo root; the other spawned-install cases seed it the same way
+      fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
 
-    const first = install(bkitInstallPath);
-    expect(first.status, `install crashed:\n${first.stdout}\n${first.stderr}`).toBe(0);
-
-    const recorded = readDerived();
-    expect(Array.isArray(recorded)).toBe(true);
-    expect(recorded.length).toBeGreaterThan(0);
-    // equal to what the resolver produces for this consumer, not merely non-empty
-    expect([...recorded].sort()).toEqual(
-      resolveNetworkAllowlist(tmpDir)
-        .map((d) => `WebFetch(domain:${d})`)
-        .sort(),
-    );
+      const first = install(bkitInstallPath);
+      expect(first.status, `install crashed:\n${first.stdout}\n${first.stderr}`).toBe(0);
+
+      const recorded = readDerived();
+      expect(Array.isArray(recorded)).toBe(true);
+      expect(recorded.length).toBeGreaterThan(0);
+      // equal to what the resolver produces for this consumer, not merely non-empty
+      expect([...recorded].sort()).toEqual(
+        resolveNetworkAllowlist(tmpDir)
+          .map((d) => `WebFetch(domain:${d})`)
+          .sort(),
+      );
 
-    // widen, then shrink: the record must follow the derived set both ways
-    setAllowedDomains(["shrink-probe.example"]);
-    expect(install(bkitInstallPath).status).toBe(0);
-    expect(readDerived()).toContain("WebFetch(domain:shrink-probe.example)");
-
-    setAllowedDomains([]);
-    expect(install(bkitInstallPath).status).toBe(0);
-    expect(readDerived()).not.toContain("WebFetch(domain:shrink-probe.example)");
-    // and the grant itself was withdrawn from settings, not just from the record
-    const allow = JSON.parse(
-      fs.readFileSync(path.join(tmpDir, ".claude", "settings.json"), "utf-8"),
-    ).permissions.allow;
-    expect(allow).not.toContain("WebFetch(domain:shrink-probe.example)");
-  }, 180_000);
+      // widen, then shrink: the record must follow the derived set both ways
+      setAllowedDomains(["shrink-probe.example"]);
+      expect(install(bkitInstallPath).status).toBe(0);
+      expect(readDerived()).toContain("WebFetch(domain:shrink-probe.example)");
+
+      setAllowedDomains([]);
+      expect(install(bkitInstallPath).status).toBe(0);
+      expect(readDerived()).not.toContain("WebFetch(domain:shrink-probe.example)");
+      // and the grant itself was withdrawn from settings, not just from the record
+      const allow = JSON.parse(
+        fs.readFileSync(path.join(tmpDir, ".claude", "settings.json"), "utf-8"),
+      ).permissions.allow;
+      expect(allow).not.toContain("WebFetch(domain:shrink-probe.example)");
+    },
+    localLimit(180_000),
+  );
 });
 
 // ---------------------------------------------------------------------------
@@ -1304,53 +1313,65 @@ describe("Scenario — Codex + Antigravity install side by side without conflict
     expect(check.status, `${label}: check drifted:\n${check.stdout}\n${check.stderr}`).toBe(0);
   };
 
-  it("combined `--codex --antigravity`: skills at separate paths, check green, advisory fires", () => {
-    seedConsumer();
-    const install = run(["install", "--codex", "--antigravity", "--tracker=github"]);
-    expect(install.status, `install failed:\n${install.stdout}\n${install.stderr}`).toBe(0);
-
-    // Codex keeps `.agents/skills/` with its own (Claude-spelled) vocabulary.
-    expect(exists(CODEX_SKILL)).toBe(true);
-    expect(read(CODEX_SKILL)).toContain("`Skill` tool");
-    expect(read(CODEX_SKILL)).not.toContain("`view_file`");
-
-    // Antigravity lives entirely in the plugin, with its own (view_file) vocabulary.
-    expect(exists(".agents/plugins/bkit/plugin.json")).toBe(true);
-    expect(exists(".agents/plugins/bkit/hooks.json")).toBe(true);
-    expect(exists(".agents/plugins/bkit/hooks/bkit-gateguard.cjs")).toBe(true);
-    expect(read(PLUGIN_SKILL)).toContain("`view_file`");
-    // Workflow skills that delegate to subagents point at the plugin's agents/ dir.
-    expect(read(".agents/plugins/bkit/skills/bkit-build/SKILL.md")).toContain(
-      ".agents/plugins/bkit/agents/",
-    );
+  it(
+    "combined `--codex --antigravity`: skills at separate paths, check green, advisory fires",
+    () => {
+      seedConsumer();
+      const install = run(["install", "--codex", "--antigravity", "--tracker=github"]);
+      expect(install.status, `install failed:\n${install.stdout}\n${install.stderr}`).toBe(0);
+
+      // Codex keeps `.agents/skills/` with its own (Claude-spelled) vocabulary.
+      expect(exists(CODEX_SKILL)).toBe(true);
+      expect(read(CODEX_SKILL)).toContain("`Skill` tool");
+      expect(read(CODEX_SKILL)).not.toContain("`view_file`");
+
+      // Antigravity lives entirely in the plugin, with its own (view_file) vocabulary.
+      expect(exists(".agents/plugins/bkit/plugin.json")).toBe(true);
+      expect(exists(".agents/plugins/bkit/hooks.json")).toBe(true);
+      expect(exists(".agents/plugins/bkit/hooks/bkit-gateguard.cjs")).toBe(true);
+      expect(read(PLUGIN_SKILL)).toContain("`view_file`");
+      // Workflow skills that delegate to subagents point at the plugin's agents/ dir.
+      expect(read(".agents/plugins/bkit/skills/bkit-build/SKILL.md")).toContain(
+        ".agents/plugins/bkit/agents/",
+      );
 
-    // Both installed → the overlap advisory is emitted.
-    expect(`${install.stdout}\n${install.stderr}`).toContain("antigravity-codex-skill-overlap");
+      // Both installed → the overlap advisory is emitted.
+      expect(`${install.stdout}\n${install.stderr}`).toContain("antigravity-codex-skill-overlap");
 
-    assertCleanCheck("combined");
-  }, 180_000);
+      assertCleanCheck("combined");
+    },
+    localLimit(180_000),
+  );
 
-  it("separate `--antigravity` then `--codex`: both land at their own paths, check green", () => {
-    seedConsumer();
-    expect(run(["install", "--antigravity", "--tracker=github"]).status).toBe(0);
-    expect(exists(PLUGIN_SKILL)).toBe(true);
-    // Codex not installed yet → no `.agents/skills/`.
-    expect(exists(".agents/skills")).toBe(false);
-
-    expect(run(["install", "--codex", "--tracker=github"]).status).toBe(0);
-    expect(read(CODEX_SKILL)).toContain("`Skill` tool");
-    expect(read(PLUGIN_SKILL)).toContain("`view_file`");
-    assertCleanCheck("antigravity→codex");
-  }, 180_000);
-
-  it("separate `--codex` then `--antigravity`: both land at their own paths, check green", () => {
-    seedConsumer();
-    expect(run(["install", "--codex", "--tracker=github"]).status).toBe(0);
-    expect(run(["install", "--antigravity", "--tracker=github"]).status).toBe(0);
-    expect(read(CODEX_SKILL)).toContain("`Skill` tool");
-    expect(read(PLUGIN_SKILL)).toContain("`view_file`");
-    assertCleanCheck("codex→antigravity");
-  }, 180_000);
+  it(
+    "separate `--antigravity` then `--codex`: both land at their own paths, check green",
+    () => {
+      seedConsumer();
+      expect(run(["install", "--antigravity", "--tracker=github"]).status).toBe(0);
+      expect(exists(PLUGIN_SKILL)).toBe(true);
+      // Codex not installed yet → no `.agents/skills/`.
+      expect(exists(".agents/skills")).toBe(false);
+
+      expect(run(["install", "--codex", "--tracker=github"]).status).toBe(0);
+      expect(read(CODEX_SKILL)).toContain("`Skill` tool");
+      expect(read(PLUGIN_SKILL)).toContain("`view_file`");
+      assertCleanCheck("antigravity→codex");
+    },
+    localLimit(180_000),
+  );
+
+  it(
+    "separate `--codex` then `--antigravity`: both land at their own paths, check green",
+    () => {
+      seedConsumer();
+      expect(run(["install", "--codex", "--tracker=github"]).status).toBe(0);
+      expect(run(["install", "--antigravity", "--tracker=github"]).status).toBe(0);
+      expect(read(CODEX_SKILL)).toContain("`Skill` tool");
+      expect(read(PLUGIN_SKILL)).toContain("`view_file`");
+      assertCleanCheck("codex→antigravity");
+    },
+    localLimit(180_000),
+  );
 });
 
 // A tracker switch and an active-provider uninstall leave a consumer `bkit check` passes.
@@ -1440,19 +1461,23 @@ describe("Scenario — tracker switch and active opencode provider removal leave
     240_000,
   );
 
-  it("uninstall --opencode=<active> re-renders the agents to the remaining provider", () => {
-    seedConsumer();
-    runOk(["install", "--opencode=openrouter"]);
-    runOk(["install", "--opencode=ollama"]);
-    expect(agentModels().every((m) => m.startsWith("ollama/"))).toBe(true);
-
-    const out = runOk(["uninstall", "--opencode=ollama"]);
-    expect(out).toContain('active provider switched to "openrouter"');
-    const models = agentModels();
-    expect(models.length).toBeGreaterThan(0);
-    expect(models.filter((m) => !m.startsWith("openrouter/"))).toEqual([]);
-    runOk(["check"]);
-  }, 240_000);
+  it(
+    "uninstall --opencode=<active> re-renders the agents to the remaining provider",
+    () => {
+      seedConsumer();
+      runOk(["install", "--opencode=openrouter"]);
+      runOk(["install", "--opencode=ollama"]);
+      expect(agentModels().every((m) => m.startsWith("ollama/"))).toBe(true);
+
+      const out = runOk(["uninstall", "--opencode=ollama"]);
+      expect(out).toContain('active provider switched to "openrouter"');
+      const models = agentModels();
+      expect(models.length).toBeGreaterThan(0);
+      expect(models.filter((m) => !m.startsWith("openrouter/"))).toEqual([]);
+      runOk(["check"]);
+    },
+    localLimit(240_000),
+  );
 });
 
 describe("5.x package.json layout — the tracker survives the first re-render", () => {
diff --git a/.bkit/core/engine/commands/install/upgrade.integration.test.ts b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
index ac326fc39..e9c2cc6fb 100644
--- a/.bkit/core/engine/commands/install/upgrade.integration.test.ts
+++ b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
@@ -24,6 +24,7 @@ import {
   type BkitVersion,
 } from "../../install/version-file";
 import { requireTsx } from "../../../../../vitest.tsx-bin";
+import { localLimit } from "../../../../../vitest.timeout-budget";
 
 let tmpDir: string;
 let originalCwd: string;
@@ -1832,99 +1833,108 @@ describe("upgrade-render", () => {
   });
 
   describe("#251 — bkit upgrade re-renders agents/commands + .bkit docs", () => {
-    it("restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides", () => {
-      // --- Install: core + claude + opencode host (gives .claude/agents, .opencode/agents,
-      //     .claude/commands, .opencode/commands, and the .bkit/*.md docs). ---
-      const install = runBkit(["install", "--claude", "--opencode=openrouter"]);
-      const installCombined = `${install.stdout}\n${install.stderr}`;
-      // Sanity: install reached dispatch and produced the rendered outputs.
-      expect(installCombined).toMatch(/\[bkit-install\]/);
-
-      const claudeAgentsDir = path.join(tmpDir, ".claude", "agents");
-      const opencodeAgentsDir = path.join(tmpDir, ".opencode", "agents");
-      const promptsPath = path.join(tmpDir, ".bkit", "prompts.md");
-      expect(
-        fs.existsSync(claudeAgentsDir),
-        `install must render ${claudeAgentsDir}\n${installCombined}`,
-      ).toBe(true);
-      expect(fs.existsSync(opencodeAgentsDir)).toBe(true);
-      expect(fs.existsSync(promptsPath)).toBe(true);
-
-      const claudeAgentFile = firstBkitMarkdown(claudeAgentsDir);
-      const opencodeAgentFile = firstBkitMarkdown(opencodeAgentsDir);
-      expect(claudeAgentFile, "expected a bkit-* agent in .claude/agents").toBeTruthy();
-      expect(opencodeAgentFile, "expected a bkit-* agent in .opencode/agents").toBeTruthy();
-
-      const claudeAgentPath = path.join(claudeAgentsDir, claudeAgentFile!);
-      const opencodeAgentPath = path.join(opencodeAgentsDir, opencodeAgentFile!);
-      const claudeOriginal = fs.readFileSync(claudeAgentPath, "utf-8");
-      const opencodeOriginal = fs.readFileSync(opencodeAgentPath, "utf-8");
-
-      const promptsOriginal = fs.readFileSync(promptsPath, "utf-8");
-      expect(promptsOriginal).toContain("bkit:start");
-      expect(promptsOriginal).toContain("bkit:end");
-
-      // --- Tamper: rendered agents, the prompts.md managed block, and add a consumer override row. ---
-      const AGENT_SENTINEL = "STALE-TAMPERED-AGENT-DO-NOT-KEEP";
-      const MANAGED_SENTINEL = "STALE-TAMPERED-MANAGED-BLOCK";
-      const OVERRIDE_ROW = "CONSUMER-OVERRIDE-ROW-MUST-SURVIVE";
-
-      fs.writeFileSync(claudeAgentPath, `${AGENT_SENTINEL}\n${claudeOriginal}`, "utf-8");
-      fs.writeFileSync(opencodeAgentPath, `${AGENT_SENTINEL}\n${opencodeOriginal}`, "utf-8");
-
-      // Inject a sentinel INSIDE the managed block (right after the start marker) and append a
-      // consumer override row AFTER the file's content (below bkit:end).
-      const tamperedPrompts =
-        promptsOriginal.replace(/(<!--\s*bkit:start\s*-->)/, `$1\n${MANAGED_SENTINEL}`).trimEnd() +
-        `\n\n${OVERRIDE_ROW}\n`;
-      expect(tamperedPrompts).toContain(MANAGED_SENTINEL); // replace actually landed
-      fs.writeFileSync(promptsPath, tamperedPrompts, "utf-8");
-
-      // --- Upgrade: must re-render everything install does. ---
-      const upgrade = runBkit(["upgrade", "--auto-apply"]);
-      const upgradeCombined = `${upgrade.stdout}\n${upgrade.stderr}`;
-      expect(upgradeCombined).toMatch(/\[bkit-upgrade\]/);
-      // Summary surfaces the re-render pass.
-      expect(upgradeCombined).toMatch(/re-rendered:/);
-
-      // Agents fully restored to their rendered form (tamper gone, byte-identical).
-      const claudeAfter = fs.readFileSync(claudeAgentPath, "utf-8");
-      const opencodeAfter = fs.readFileSync(opencodeAgentPath, "utf-8");
-      expect(claudeAfter).not.toContain(AGENT_SENTINEL);
-      expect(claudeAfter).toBe(claudeOriginal);
-      expect(opencodeAfter).not.toContain(AGENT_SENTINEL);
-      expect(opencodeAfter).toBe(opencodeOriginal);
-
-      // prompts.md: managed block refreshed (sentinel gone) AND consumer override preserved.
-      const promptsAfter = fs.readFileSync(promptsPath, "utf-8");
-      expect(promptsAfter).not.toContain(MANAGED_SENTINEL);
-      expect(promptsAfter).toContain(OVERRIDE_ROW);
-    }, 180_000);
-
-    it("dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0", () => {
-      const install = runBkit(["install", "--claude"]);
-      expect(`${install.stdout}\n${install.stderr}`).toMatch(/\[bkit-install\]/);
-      const promptsPath = path.join(tmpDir, ".bkit", "prompts.md");
-      const dead = `bkit-retired-${"agent"}`;
-      const prompts = fs.readFileSync(promptsPath, "utf-8");
-      // Line-anchored, as the engine reads it: the managed block quotes the marker inside a
-      // table cell, and indexOf would land there and insert into a preset table instead.
-      const end = prompts.search(/^<!-- bkit:end -->$/m);
-      const sep = prompts.indexOf("| --- | --- | --- |\n", end);
-      expect(sep, "installed prompts.md carries an empty Model Overrides table").toBeGreaterThan(
-        end,
-      );
-      const at = sep + "| --- | --- | --- |\n".length;
-      fs.writeFileSync(
-        promptsPath,
-        `${prompts.slice(0, at)}| ${dead} | cursor | some-model |\n${prompts.slice(at)}`,
-        "utf-8",
-      );
-      const upgrade = runBkit(["upgrade", "--auto-apply"]);
-      const combined = `${upgrade.stdout}\n${upgrade.stderr}`;
-      expect(upgrade.status, combined).toBe(0);
-      expect(combined).toContain(dead);
-    }, 180_000);
+    it(
+      "restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides",
+      () => {
+        // --- Install: core + claude + opencode host (gives .claude/agents, .opencode/agents,
+        //     .claude/commands, .opencode/commands, and the .bkit/*.md docs). ---
+        const install = runBkit(["install", "--claude", "--opencode=openrouter"]);
+        const installCombined = `${install.stdout}\n${install.stderr}`;
+        // Sanity: install reached dispatch and produced the rendered outputs.
+        expect(installCombined).toMatch(/\[bkit-install\]/);
+
+        const claudeAgentsDir = path.join(tmpDir, ".claude", "agents");
+        const opencodeAgentsDir = path.join(tmpDir, ".opencode", "agents");
+        const promptsPath = path.join(tmpDir, ".bkit", "prompts.md");
+        expect(
+          fs.existsSync(claudeAgentsDir),
+          `install must render ${claudeAgentsDir}\n${installCombined}`,
+        ).toBe(true);
+        expect(fs.existsSync(opencodeAgentsDir)).toBe(true);
+        expect(fs.existsSync(promptsPath)).toBe(true);
+
+        const claudeAgentFile = firstBkitMarkdown(claudeAgentsDir);
+        const opencodeAgentFile = firstBkitMarkdown(opencodeAgentsDir);
+        expect(claudeAgentFile, "expected a bkit-* agent in .claude/agents").toBeTruthy();
+        expect(opencodeAgentFile, "expected a bkit-* agent in .opencode/agents").toBeTruthy();
+
+        const claudeAgentPath = path.join(claudeAgentsDir, claudeAgentFile!);
+        const opencodeAgentPath = path.join(opencodeAgentsDir, opencodeAgentFile!);
+        const claudeOriginal = fs.readFileSync(claudeAgentPath, "utf-8");
+        const opencodeOriginal = fs.readFileSync(opencodeAgentPath, "utf-8");
+
+        const promptsOriginal = fs.readFileSync(promptsPath, "utf-8");
+        expect(promptsOriginal).toContain("bkit:start");
+        expect(promptsOriginal).toContain("bkit:end");
+
+        // --- Tamper: rendered agents, the prompts.md managed block, and add a consumer override row. ---
+        const AGENT_SENTINEL = "STALE-TAMPERED-AGENT-DO-NOT-KEEP";
+        const MANAGED_SENTINEL = "STALE-TAMPERED-MANAGED-BLOCK";
+        const OVERRIDE_ROW = "CONSUMER-OVERRIDE-ROW-MUST-SURVIVE";
+
+        fs.writeFileSync(claudeAgentPath, `${AGENT_SENTINEL}\n${claudeOriginal}`, "utf-8");
+        fs.writeFileSync(opencodeAgentPath, `${AGENT_SENTINEL}\n${opencodeOriginal}`, "utf-8");
+
+        // Inject a sentinel INSIDE the managed block (right after the start marker) and append a
+        // consumer override row AFTER the file's content (below bkit:end).
+        const tamperedPrompts =
+          promptsOriginal
+            .replace(/(<!--\s*bkit:start\s*-->)/, `$1\n${MANAGED_SENTINEL}`)
+            .trimEnd() + `\n\n${OVERRIDE_ROW}\n`;
+        expect(tamperedPrompts).toContain(MANAGED_SENTINEL); // replace actually landed
+        fs.writeFileSync(promptsPath, tamperedPrompts, "utf-8");
+
+        // --- Upgrade: must re-render everything install does. ---
+        const upgrade = runBkit(["upgrade", "--auto-apply"]);
+        const upgradeCombined = `${upgrade.stdout}\n${upgrade.stderr}`;
+        expect(upgradeCombined).toMatch(/\[bkit-upgrade\]/);
+        // Summary surfaces the re-render pass.
+        expect(upgradeCombined).toMatch(/re-rendered:/);
+
+        // Agents fully restored to their rendered form (tamper gone, byte-identical).
+        const claudeAfter = fs.readFileSync(claudeAgentPath, "utf-8");
+        const opencodeAfter = fs.readFileSync(opencodeAgentPath, "utf-8");
+        expect(claudeAfter).not.toContain(AGENT_SENTINEL);
+        expect(claudeAfter).toBe(claudeOriginal);
+        expect(opencodeAfter).not.toContain(AGENT_SENTINEL);
+        expect(opencodeAfter).toBe(opencodeOriginal);
+
+        // prompts.md: managed block refreshed (sentinel gone) AND consumer override preserved.
+        const promptsAfter = fs.readFileSync(promptsPath, "utf-8");
+        expect(promptsAfter).not.toContain(MANAGED_SENTINEL);
+        expect(promptsAfter).toContain(OVERRIDE_ROW);
+      },
+      localLimit(180_000),
+    );
+
+    it(
+      "dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0",
+      () => {
+        const install = runBkit(["install", "--claude"]);
+        expect(`${install.stdout}\n${install.stderr}`).toMatch(/\[bkit-install\]/);
+        const promptsPath = path.join(tmpDir, ".bkit", "prompts.md");
+        const dead = `bkit-retired-${"agent"}`;
+        const prompts = fs.readFileSync(promptsPath, "utf-8");
+        // Line-anchored, as the engine reads it: the managed block quotes the marker inside a
+        // table cell, and indexOf would land there and insert into a preset table instead.
+        const end = prompts.search(/^<!-- bkit:end -->$/m);
+        const sep = prompts.indexOf("| --- | --- | --- |\n", end);
+        expect(sep, "installed prompts.md carries an empty Model Overrides table").toBeGreaterThan(
+          end,
+        );
+        const at = sep + "| --- | --- | --- |\n".length;
+        fs.writeFileSync(
+          promptsPath,
+          `${prompts.slice(0, at)}| ${dead} | cursor | some-model |\n${prompts.slice(at)}`,
+          "utf-8",
+        );
+        const upgrade = runBkit(["upgrade", "--auto-apply"]);
+        const combined = `${upgrade.stdout}\n${upgrade.stderr}`;
+        expect(upgrade.status, combined).toBe(0);
+        expect(combined).toContain(dead);
+      },
+      localLimit(180_000),
+    );
 
     it.each(["github", "linear", "jira"])(
       "upgrade renders opencode.json with provider/tracker sentinels resolved for %s (no raw @@…@@ leak, #245)",
@@ -1978,168 +1988,194 @@ describe("upgrade-render", () => {
       180_000,
     );
 
-    it("opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback)", () => {
-      type OpencodeDoc = {
-        provider?: Record<string, { npm?: string; options?: Record<string, unknown> }>;
-      };
+    it(
+      "opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback)",
+      () => {
+        type OpencodeDoc = {
+          provider?: Record<string, { npm?: string; options?: Record<string, unknown> }>;
+        };
 
-      // Install the opencode host as the OpenCode Go built-in (apiKey only).
-      const install = runBkit(["install", "--opencode=opencode-go"]);
-      expect(`${install.stdout}\n${install.stderr}`).toMatch(/\[bkit-install\]/);
-
-      // (1) opencode.json has a built-in `opencode-go` block — options.apiKey only (no npm/baseURL).
-      const opencodeJsonPath = path.join(tmpDir, ".opencode", "opencode.json");
-      expect(fs.existsSync(opencodeJsonPath)).toBe(true);
-      const installed = JSON.parse(fs.readFileSync(opencodeJsonPath, "utf-8")) as OpencodeDoc;
-      expect(
-        installed.provider?.["opencode-go"],
-        "opencode-go gateway seeds an `opencode-go` provider block",
-      ).toBeDefined();
-      expect(installed.provider?.["opencode-go"]?.npm).toBeUndefined();
-      expect(installed.provider?.["opencode-go"]?.options?.baseURL).toBeUndefined();
-      expect(installed.provider?.["opencode-go"]?.options?.apiKey).toBe(
-        "{env:BKIT_OPENCODE_API_KEY}",
-      );
+        // Install the opencode host as the OpenCode Go built-in (apiKey only).
+        const install = runBkit(["install", "--opencode=opencode-go"]);
+        expect(`${install.stdout}\n${install.stderr}`).toMatch(/\[bkit-install\]/);
 
-      // (2) The provider is recorded in the manifest — the authoritative upgrade-time detection signal.
-      const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
-        bkit?: { providers?: { opencode?: { default?: string } } };
-      };
-      expect(pkg.bkit?.providers?.opencode?.default).toBe("opencode-go");
-
-      // (3) Agents seeded with the opencode-go prefix (opencode-go/…).
-      const agentsDir = path.join(tmpDir, ".opencode", "agents");
-      const anAgent = fs.readdirSync(agentsDir).find((f) => f.endsWith(".md"));
-      expect(anAgent).toBeTruthy();
-      const agentBody = fs.readFileSync(path.join(agentsDir, anAgent!), "utf-8");
-      expect(agentBody).toMatch(/model:\s*opencode-go\//);
-
-      // (4) Upgrade must re-render opencode.json from the manifest provider — keeping the
-      //     `opencode-go` block, NOT falling back to ollama.
-      const upgrade = runBkit(["upgrade", "--auto-apply"]);
-      expect(`${upgrade.stdout}\n${upgrade.stderr}`).toMatch(/\[bkit-upgrade\]/);
-      const after = JSON.parse(fs.readFileSync(opencodeJsonPath, "utf-8")) as OpencodeDoc;
-      expect(after.provider?.["opencode-go"]?.options?.apiKey).toBe("{env:BKIT_OPENCODE_API_KEY}");
-      expect(after.provider?.["opencode-go"]?.npm).toBeUndefined();
-      expect(
-        after.provider?.["ollama"],
-        "upgrade must NOT re-render opencode-go as ollama",
-      ).toBeUndefined();
-    }, 180_000);
+        // (1) opencode.json has a built-in `opencode-go` block — options.apiKey only (no npm/baseURL).
+        const opencodeJsonPath = path.join(tmpDir, ".opencode", "opencode.json");
+        expect(fs.existsSync(opencodeJsonPath)).toBe(true);
+        const installed = JSON.parse(fs.readFileSync(opencodeJsonPath, "utf-8")) as OpencodeDoc;
+        expect(
+          installed.provider?.["opencode-go"],
+          "opencode-go gateway seeds an `opencode-go` provider block",
+        ).toBeDefined();
+        expect(installed.provider?.["opencode-go"]?.npm).toBeUndefined();
+        expect(installed.provider?.["opencode-go"]?.options?.baseURL).toBeUndefined();
+        expect(installed.provider?.["opencode-go"]?.options?.apiKey).toBe(
+          "{env:BKIT_OPENCODE_API_KEY}",
+        );
+
+        // (2) The provider is recorded in the manifest — the authoritative upgrade-time detection signal.
+        const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
+          bkit?: { providers?: { opencode?: { default?: string } } };
+        };
+        expect(pkg.bkit?.providers?.opencode?.default).toBe("opencode-go");
+
+        // (3) Agents seeded with the opencode-go prefix (opencode-go/…).
+        const agentsDir = path.join(tmpDir, ".opencode", "agents");
+        const anAgent = fs.readdirSync(agentsDir).find((f) => f.endsWith(".md"));
+        expect(anAgent).toBeTruthy();
+        const agentBody = fs.readFileSync(path.join(agentsDir, anAgent!), "utf-8");
+        expect(agentBody).toMatch(/model:\s*opencode-go\//);
+
+        // (4) Upgrade must re-render opencode.json from the manifest provider — keeping the
+        //     `opencode-go` block, NOT falling back to ollama.
+        const upgrade = runBkit(["upgrade", "--auto-apply"]);
+        expect(`${upgrade.stdout}\n${upgrade.stderr}`).toMatch(/\[bkit-upgrade\]/);
+        const after = JSON.parse(fs.readFileSync(opencodeJsonPath, "utf-8")) as OpencodeDoc;
+        expect(after.provider?.["opencode-go"]?.options?.apiKey).toBe(
+          "{env:BKIT_OPENCODE_API_KEY}",
+        );
+        expect(after.provider?.["opencode-go"]?.npm).toBeUndefined();
+        expect(
+          after.provider?.["ollama"],
+          "upgrade must NOT re-render opencode-go as ollama",
+        ).toBeUndefined();
+      },
+      localLimit(180_000),
+    );
   });
 
   describe("#459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file", () => {
-    it("a no-op upgrade does not re-record a hand-edited canonical file as bkit's content", () => {
-      const install = runBkit(["install", "--claude"]);
-      expect(`${install.stdout}\n${install.stderr}`).toMatch(/\[bkit-install\]/);
-
-      // Whole-file managed (Tier 1, no markers) → drift-detected via diffFile.
-      const rel = ".bkit/.env.example";
-      const abs = path.join(tmpDir, rel);
-      const versionPath = path.join(tmpDir, ".bkit", "version");
-      const recordedHash = (): string | undefined =>
-        (
-          JSON.parse(fs.readFileSync(versionPath, "utf-8")) as {
-            canonicalHashes: Record<string, string>;
-          }
-        ).canonicalHashes[rel];
+    it(
+      "a no-op upgrade does not re-record a hand-edited canonical file as bkit's content",
+      () => {
+        const install = runBkit(["install", "--claude"]);
+        expect(`${install.stdout}\n${install.stderr}`).toMatch(/\[bkit-install\]/);
 
-      const before = recordedHash();
-      expect(before, `install must record a hash for ${rel}`).toBeTruthy();
+        // Whole-file managed (Tier 1, no markers) → drift-detected via diffFile.
+        const rel = ".bkit/.env.example";
+        const abs = path.join(tmpDir, rel);
+        const versionPath = path.join(tmpDir, ".bkit", "version");
+        const recordedHash = (): string | undefined =>
+          (
+            JSON.parse(fs.readFileSync(versionPath, "utf-8")) as {
+              canonicalHashes: Record<string, string>;
+            }
+          ).canonicalHashes[rel];
 
-      fs.appendFileSync(abs, "// consumer edit\n", "utf-8");
+        const before = recordedHash();
+        expect(before, `install must record a hash for ${rel}`).toBeTruthy();
 
-      // The CLI rebuilds the result it hands to the hash refresh — this exercises that seam.
-      const upgrade = runBkit(["upgrade"]);
-      expect(`${upgrade.stdout}\n${upgrade.stderr}`).toMatch(/\[bkit-upgrade\] Done\./);
+        fs.appendFileSync(abs, "// consumer edit\n", "utf-8");
 
-      expect(fs.readFileSync(abs, "utf-8")).toContain("// consumer edit");
-      expect(recordedHash(), "upgrade must not re-record the consumer's content").toBe(before);
-    }, 180_000);
+        // The CLI rebuilds the result it hands to the hash refresh — this exercises that seam.
+        const upgrade = runBkit(["upgrade"]);
+        expect(`${upgrade.stdout}\n${upgrade.stderr}`).toMatch(/\[bkit-upgrade\] Done\./);
 
-    it("re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it", () => {
-      // Codex: a host whose guardrails hook reads the allowlist without the cursor module.
-      expect(runBkit(["install", "--codex"]).status).toBe(0);
+        expect(fs.readFileSync(abs, "utf-8")).toContain("// consumer edit");
+        expect(recordedHash(), "upgrade must not re-record the consumer's content").toBe(before);
+      },
+      localLimit(180_000),
+    );
+
+    it(
+      "re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it",
+      () => {
+        // Codex: a host whose guardrails hook reads the allowlist without the cursor module.
+        expect(runBkit(["install", "--codex"]).status).toBe(0);
+
+        const rel = path.join(".bkit", "allowlist.json");
+        const abs = path.join(tmpDir, rel);
+        const versionPath = path.join(tmpDir, ".bkit", "version");
+        const recordedHash = (): string | undefined =>
+          (
+            JSON.parse(fs.readFileSync(versionPath, "utf-8")) as {
+              canonicalHashes: Record<string, string>;
+            }
+          ).canonicalHashes[rel];
+        expect(recordedHash()).toBe(sha256(fs.readFileSync(abs, "utf-8")));
+
+        fs.appendFileSync(
+          path.join(tmpDir, ".agents", "context.md"),
+          "\n<!-- allowed-domains:start -->\nexample.com\n<!-- allowed-domains:end -->\n",
+        );
+        expect(runBkit(["upgrade"]).status).toBe(0);
+        expect(fs.readFileSync(abs, "utf-8")).toContain("example.com");
+        expect(recordedHash()).toBe(sha256(fs.readFileSync(abs, "utf-8")));
 
-      const rel = path.join(".bkit", "allowlist.json");
-      const abs = path.join(tmpDir, rel);
-      const versionPath = path.join(tmpDir, ".bkit", "version");
-      const recordedHash = (): string | undefined =>
-        (
-          JSON.parse(fs.readFileSync(versionPath, "utf-8")) as {
-            canonicalHashes: Record<string, string>;
-          }
-        ).canonicalHashes[rel];
-      expect(recordedHash()).toBe(sha256(fs.readFileSync(abs, "utf-8")));
-
-      fs.appendFileSync(
-        path.join(tmpDir, ".agents", "context.md"),
-        "\n<!-- allowed-domains:start -->\nexample.com\n<!-- allowed-domains:end -->\n",
-      );
-      expect(runBkit(["upgrade"]).status).toBe(0);
-      expect(fs.readFileSync(abs, "utf-8")).toContain("example.com");
-      expect(recordedHash()).toBe(sha256(fs.readFileSync(abs, "utf-8")));
-
-      expect(runBkit(["uninstall"]).status).toBe(0);
-      expect(fs.existsSync(abs)).toBe(false);
-    }, 180_000);
-
-    it("upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json", () => {
-      expect(runBkit(["install", "--cursor"]).status).toBe(0);
-      // What an install up to 5.2.4 left: the cursor copy, recorded in .bkit/version.
-      const retired = path.join(".cursor", "allowlist.json");
-      const versionPath = path.join(tmpDir, ".bkit", "version");
-      fs.copyFileSync(path.join(tmpDir, ".bkit", "allowlist.json"), path.join(tmpDir, retired));
-      const version = JSON.parse(fs.readFileSync(versionPath, "utf-8")) as {
-        canonicalHashes: Record<string, string>;
-      };
-      version.canonicalHashes[retired] = sha256(
-        fs.readFileSync(path.join(tmpDir, retired), "utf-8"),
-      );
-      fs.writeFileSync(versionPath, JSON.stringify(version, null, 2) + "\n", "utf-8");
+        expect(runBkit(["uninstall"]).status).toBe(0);
+        expect(fs.existsSync(abs)).toBe(false);
+      },
+      localLimit(180_000),
+    );
+
+    it(
+      "upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json",
+      () => {
+        expect(runBkit(["install", "--cursor"]).status).toBe(0);
+        // What an install up to 5.2.4 left: the cursor copy, recorded in .bkit/version.
+        const retired = path.join(".cursor", "allowlist.json");
+        const versionPath = path.join(tmpDir, ".bkit", "version");
+        fs.copyFileSync(path.join(tmpDir, ".bkit", "allowlist.json"), path.join(tmpDir, retired));
+        const version = JSON.parse(fs.readFileSync(versionPath, "utf-8")) as {
+          canonicalHashes: Record<string, string>;
+        };
+        version.canonicalHashes[retired] = sha256(
+          fs.readFileSync(path.join(tmpDir, retired), "utf-8"),
+        );
+        fs.writeFileSync(versionPath, JSON.stringify(version, null, 2) + "\n", "utf-8");
 
-      expect(runBkit(["upgrade"]).status).toBe(0);
-      expect(fs.existsSync(path.join(tmpDir, retired))).toBe(false);
-      expect(fs.existsSync(path.join(tmpDir, ".bkit", "allowlist.json"))).toBe(true);
-      const after = JSON.parse(fs.readFileSync(versionPath, "utf-8")) as {
-        canonicalHashes: Record<string, string>;
-      };
-      expect(after.canonicalHashes[retired]).toBeUndefined();
-      expect(runBkit(["check"]).status).toBe(0);
-    }, 180_000);
+        expect(runBkit(["upgrade"]).status).toBe(0);
+        expect(fs.existsSync(path.join(tmpDir, retired))).toBe(false);
+        expect(fs.existsSync(path.join(tmpDir, ".bkit", "allowlist.json"))).toBe(true);
+        const after = JSON.parse(fs.readFileSync(versionPath, "utf-8")) as {
+          canonicalHashes: Record<string, string>;
+        };
+        expect(after.canonicalHashes[retired]).toBeUndefined();
+        expect(runBkit(["check"]).status).toBe(0);
+      },
+      localLimit(180_000),
+    );
   });
 
   describe("advisories — check and upgrade report what install reports", () => {
-    it("surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md", () => {
-      const advisoriesPath = path.join(tmpDir, ".bkit", "advisories.md");
-
-      const install = runBkit(["install", "--claude"]);
-      expect(`${install.stdout}\n${install.stderr}`).toMatch(/\[bkit-install\]/);
-      expect(fs.readFileSync(advisoriesPath, "utf-8")).toContain("test-file-script-missing");
-
-      const check = runBkit(["check"]);
-      expect(`${check.stdout}\n${check.stderr}`).toContain("test-file-script-missing");
-      expect(fs.readFileSync(advisoriesPath, "utf-8")).toContain("test-file-script-missing");
-
-      fs.writeFileSync(advisoriesPath, "STALE-ADVISORIES\n", "utf-8");
-      const upgrade = runBkit(["upgrade"]);
-      const upgradeCombined = `${upgrade.stdout}\n${upgrade.stderr}`;
-      expect(upgrade.status, upgradeCombined).toBe(0);
-      expect(upgradeCombined).toContain("test-file-script-missing");
-      const after = fs.readFileSync(advisoriesPath, "utf-8");
-      expect(after).not.toContain("STALE-ADVISORIES");
-      expect(after).toContain("_Mode: upgrade_");
-      expect(after).toContain("test-file-script-missing");
-    }, 180_000);
-
-    it("a dry-run upgrade leaves .bkit/advisories.md alone", () => {
-      const advisoriesPath = path.join(tmpDir, ".bkit", "advisories.md");
-      runBkit(["install", "--claude"]);
-      fs.writeFileSync(advisoriesPath, "STALE-ADVISORIES\n", "utf-8");
-      const upgrade = runBkit(["upgrade", "--dry-run"]);
-      expect(upgrade.status, `${upgrade.stdout}\n${upgrade.stderr}`).toBe(0);
-      expect(fs.readFileSync(advisoriesPath, "utf-8")).toBe("STALE-ADVISORIES\n");
-    }, 180_000);
+    it(
+      "surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md",
+      () => {
+        const advisoriesPath = path.join(tmpDir, ".bkit", "advisories.md");
+
+        const install = runBkit(["install", "--claude"]);
+        expect(`${install.stdout}\n${install.stderr}`).toMatch(/\[bkit-install\]/);
+        expect(fs.readFileSync(advisoriesPath, "utf-8")).toContain("test-file-script-missing");
+
+        const check = runBkit(["check"]);
+        expect(`${check.stdout}\n${check.stderr}`).toContain("test-file-script-missing");
+        expect(fs.readFileSync(advisoriesPath, "utf-8")).toContain("test-file-script-missing");
+
+        fs.writeFileSync(advisoriesPath, "STALE-ADVISORIES\n", "utf-8");
+        const upgrade = runBkit(["upgrade"]);
+        const upgradeCombined = `${upgrade.stdout}\n${upgrade.stderr}`;
+        expect(upgrade.status, upgradeCombined).toBe(0);
+        expect(upgradeCombined).toContain("test-file-script-missing");
+        const after = fs.readFileSync(advisoriesPath, "utf-8");
+        expect(after).not.toContain("STALE-ADVISORIES");
+        expect(after).toContain("_Mode: upgrade_");
+        expect(after).toContain("test-file-script-missing");
+      },
+      localLimit(180_000),
+    );
+
+    it(
+      "a dry-run upgrade leaves .bkit/advisories.md alone",
+      () => {
+        const advisoriesPath = path.join(tmpDir, ".bkit", "advisories.md");
+        runBkit(["install", "--claude"]);
+        fs.writeFileSync(advisoriesPath, "STALE-ADVISORIES\n", "utf-8");
+        const upgrade = runBkit(["upgrade", "--dry-run"]);
+        expect(upgrade.status, `${upgrade.stdout}\n${upgrade.stderr}`).toBe(0);
+        expect(fs.readFileSync(advisoriesPath, "utf-8")).toBe("STALE-ADVISORIES\n");
+      },
+      localLimit(180_000),
+    );
   });
 });
 
diff --git a/.bkit/core/engine/commands/workflow/disk.test.ts b/.bkit/core/engine/commands/workflow/disk.test.ts
index ffaf69440..4a4641f90 100644
--- a/.bkit/core/engine/commands/workflow/disk.test.ts
+++ b/.bkit/core/engine/commands/workflow/disk.test.ts
@@ -45,6 +45,7 @@ import {
   type Mode,
   type Scope,
 } from "./disk";
+import { localLimit } from "../../../../../vitest.timeout-budget";
 
 const dirs: string[] = [];
 const tmp = (prefix: string) => {
@@ -339,19 +340,23 @@ describe("bkit disk prune — lock", () => {
     expect(order(cwd)).toEqual(["a"]);
   });
 
-  it("worktree setup's low-disk sweep stops waiting after maxWaitMs while a live sweep holds the lock", async () => {
-    holdLock(process.pid);
-    const cwd = repo(marks(["a", "max"]));
-    const why = await ensureDiskSpace({
-      cwd,
-      minFreeGb: 1e9,
-      pollMs: 10,
-      maxWaitMs: 100,
-      log: () => {},
-    });
-    expect(why).toContain("another sweep");
-    expect(order(cwd)).toEqual([]);
-  }, 5_000);
+  it(
+    "worktree setup's low-disk sweep stops waiting after maxWaitMs while a live sweep holds the lock",
+    async () => {
+      holdLock(process.pid);
+      const cwd = repo(marks(["a", "max"]));
+      const why = await ensureDiskSpace({
+        cwd,
+        minFreeGb: 1e9,
+        pollMs: 10,
+        maxWaitMs: 100,
+        log: () => {},
+      });
+      expect(why).toContain("another sweep");
+      expect(order(cwd)).toEqual([]);
+    },
+    localLimit(5_000),
+  );
 
   it("refuses --wait with --auto", async () => {
     const r = await prune(repo(), "--mode=min", "--auto", "--wait");
diff --git a/.bkit/core/engine/commands/workflow/run-facts.test.ts b/.bkit/core/engine/commands/workflow/run-facts.test.ts
index 479ca8e5d..bb96227f8 100644
--- a/.bkit/core/engine/commands/workflow/run-facts.test.ts
+++ b/.bkit/core/engine/commands/workflow/run-facts.test.ts
@@ -30,9 +30,10 @@ import {
   stepsBlock,
   timeBlock,
 } from "./run-facts";
+import { localLimit } from "../../../../../vitest.timeout-budget";
 
 // Real git repos per test; a busy machine needs more than the default 5s.
-const TIMEOUT = { timeout: 30_000 };
+const TIMEOUT = { timeout: localLimit(30_000) };
 
 const dirs: string[] = [];
 afterEach(() => {
diff --git a/.bkit/core/engine/commands/workflow/runs.test.ts b/.bkit/core/engine/commands/workflow/runs.test.ts
index 8222b0df9..67c0bb6c2 100644
--- a/.bkit/core/engine/commands/workflow/runs.test.ts
+++ b/.bkit/core/engine/commands/workflow/runs.test.ts
@@ -31,6 +31,7 @@ import {
   readRecord,
   writeRecord,
 } from "./ledgers";
+import { localLimit } from "../../../../../vitest.timeout-budget";
 
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 const FIXTURES = path.join(REPO_ROOT, "tests", "fixtures", "gh");
@@ -1837,7 +1838,7 @@ describe("bkit runs gate", () => {
     });
   });
 
-  describe("--validated carry-forward (17)", { timeout: 20_000 }, () => {
+  describe("--validated carry-forward (17)", { timeout: localLimit(20_000) }, () => {
     /** Tags double as fixture SHAs: green-capstone / failed are the validated commit. */
     function carryRepo() {
       const repo = tmp();
@@ -2353,7 +2354,7 @@ describe("bkit runs wait", () => {
 // CI-Dispatch Gate: bkit runs dispatch
 // ---------------------------------------------------------------------------
 
-describe("bkit runs dispatch", { timeout: 20_000 }, () => {
+describe("bkit runs dispatch", { timeout: localLimit(20_000) }, () => {
   /** A feature branch pushed to a bare remote, its head the close-workflow commit. */
   function closeRepo(opts: { headMessage?: string; ciFile?: boolean; capstone?: string } = {}) {
     const root = tmp();
@@ -2622,173 +2623,177 @@ describe("bkit runs dispatch", { timeout: 20_000 }, () => {
   });
 });
 
-describe("bkit runs dispatch on dev (a debug run in place)", { timeout: 30_000 }, () => {
-  const FID = "1-x";
-
-  /**
-   * A clone on `dev` of a bare origin: one pushed base commit, a foreign local commit,
-   * then (with `record`) a shared-checkout record and one commit the run made.
-   */
-  function devRepo(o: { record: boolean }) {
-    const root = tmp();
-    const remote = path.join(root, "remote.git");
-    const cwd = path.join(root, "work");
-    gitIn(root, "init", "-q", "--bare", "-b", "dev", remote);
-    gitIn(root, "init", "-q", "-b", "dev", cwd);
-    gitIn(cwd, "config", "user.email", "t@t");
-    gitIn(cwd, "config", "user.name", "t");
-    fs.writeFileSync(
-      path.join(cwd, "package.json"),
-      JSON.stringify({
-        private: true,
-        scripts: {
-          "bkit:gate:min":
-            "node -e \"process.exit(process.env.BKIT_TEST_GATE_RUNNER === '1' ? 0 : 9)\"",
-        },
-        bkit: { workflows: { worktree: { install: false } } },
-      }),
-    );
-    gitIn(cwd, "add", "package.json");
-    gitIn(cwd, "commit", "-q", "--allow-empty", "-m", "base");
-    gitIn(cwd, "remote", "add", "origin", remote);
-    gitIn(cwd, "push", "-q", "-u", "origin", "dev");
-    gitIn(cwd, "commit", "-q", "--allow-empty", "-m", "foreign local commit");
-    if (o.record) writeRecord(cwd, newRecord(cwd, FID, "dev"));
-    gitIn(cwd, "commit", "-q", "--allow-empty", "-m", `chore(${FID}): run commit`);
-    if (o.record) appendRecordCommit(cwd, FID, gitIn(cwd, "rev-parse", "HEAD"));
-    const remoteTip = () => gitIn(remote, "rev-parse", "dev");
-    const remoteLog = () => gitIn(remote, "log", "--format=%s", "dev").split("\n");
-    return { root, remote, cwd, remoteTip, remoteLog };
-  }
+describe(
+  "bkit runs dispatch on dev (a debug run in place)",
+  { timeout: localLimit(30_000) },
+  () => {
+    const FID = "1-x";
 
-  const gateBase = (cwd: string) => ({
-    cwd,
-    pr: "7",
-    fid: FID,
-    autoRouteSuffix: "",
-    budgetS: 60,
-    intervalS: 10,
-    retriggered: false,
-  });
-  const quiet = { sleep: instant, log: noLog };
-  const NONE = rollup("vercel");
-  const FOUND = rollup("bkit-tests-unit");
+    /**
+     * A clone on `dev` of a bare origin: one pushed base commit, a foreign local commit,
+     * then (with `record`) a shared-checkout record and one commit the run made.
+     */
+    function devRepo(o: { record: boolean }) {
+      const root = tmp();
+      const remote = path.join(root, "remote.git");
+      const cwd = path.join(root, "work");
+      gitIn(root, "init", "-q", "--bare", "-b", "dev", remote);
+      gitIn(root, "init", "-q", "-b", "dev", cwd);
+      gitIn(cwd, "config", "user.email", "t@t");
+      gitIn(cwd, "config", "user.name", "t");
+      fs.writeFileSync(
+        path.join(cwd, "package.json"),
+        JSON.stringify({
+          private: true,
+          scripts: {
+            "bkit:gate:min":
+              "node -e \"process.exit(process.env.BKIT_TEST_GATE_RUNNER === '1' ? 0 : 9)\"",
+          },
+          bkit: { workflows: { worktree: { install: false } } },
+        }),
+      );
+      gitIn(cwd, "add", "package.json");
+      gitIn(cwd, "commit", "-q", "--allow-empty", "-m", "base");
+      gitIn(cwd, "remote", "add", "origin", remote);
+      gitIn(cwd, "push", "-q", "-u", "origin", "dev");
+      gitIn(cwd, "commit", "-q", "--allow-empty", "-m", "foreign local commit");
+      if (o.record) writeRecord(cwd, newRecord(cwd, FID, "dev"));
+      gitIn(cwd, "commit", "-q", "--allow-empty", "-m", `chore(${FID}): run commit`);
+      if (o.record) appendRecordCommit(cwd, FID, gitIn(cwd, "rev-parse", "HEAD"));
+      const remoteTip = () => gitIn(remote, "rev-parse", "dev");
+      const remoteLog = () => gitIn(remote, "log", "--format=%s", "dev").split("\n");
+      return { root, remote, cwd, remoteTip, remoteLog };
+    }
 
-  /** A gh whose `run list` is empty for `emptyFor` calls, then shows a run at origin's dev tip. */
-  const runAtRemoteTip = (remote: string, emptyFor: number): Gh => {
-    let n = 0;
-    return (args) => {
-      if (args[0] !== "run" || args[1] !== "list") return fail;
-      if (++n <= emptyFor) return ok("[]");
-      const headSha = gitIn(remote, "rev-parse", "dev");
-      return ok(JSON.stringify([{ status: "queued", conclusion: "", headSha }]));
+    const gateBase = (cwd: string) => ({
+      cwd,
+      pr: "7",
+      fid: FID,
+      autoRouteSuffix: "",
+      budgetS: 60,
+      intervalS: 10,
+      retriggered: false,
+    });
+    const quiet = { sleep: instant, log: noLog };
+    const NONE = rollup("vercel");
+    const FOUND = rollup("bkit-tests-unit");
+
+    /** A gh whose `run list` is empty for `emptyFor` calls, then shows a run at origin's dev tip. */
+    const runAtRemoteTip = (remote: string, emptyFor: number): Gh => {
+      let n = 0;
+      return (args) => {
+        if (args[0] !== "run" || args[1] !== "list") return fail;
+        if (++n <= emptyFor) return ok("[]");
+        const headSha = gitIn(remote, "rev-parse", "dev");
+        return ok(JSON.stringify([{ status: "queued", conclusion: "", headSha }]));
+      };
     };
-  };
 
-  it("dispatch on dev with a pushed sha and no pr proves the run started", async () => {
-    const { cwd, root, remote } = devRepo({ record: true });
-    // The pushed sha is a copy the push made on origin; the clone does not have it yet.
-    const other = path.join(root, "other");
-    gitIn(root, "clone", "-q", "-b", "dev", remote, other);
-    gitIn(other, "commit", "-q", "--allow-empty", "-m", `chore(${FID}): landed copy`);
-    gitIn(other, "push", "-q", "origin", "dev");
-    const sha = gitIn(other, "rev-parse", "HEAD");
-    fakeGhBin({
-      "pr-list": "[]",
-      "run-list": JSON.stringify([{ status: "queued", conclusion: "", headSha: sha }]),
-    });
-    const r = await cli(cwd, ["dispatch", `--fid=${FID}`, `--sha=${sha}`]);
-    expect(r.code).toBe(0);
-    expect(r.json).toMatchObject({
-      ciDispatch: { outcome: "dispatched", head: sha, retrigger: false },
-      phase: "done",
-      pr: null,
-      head: sha,
-      scanResult: "clean",
+    it("dispatch on dev with a pushed sha and no pr proves the run started", async () => {
+      const { cwd, root, remote } = devRepo({ record: true });
+      // The pushed sha is a copy the push made on origin; the clone does not have it yet.
+      const other = path.join(root, "other");
+      gitIn(root, "clone", "-q", "-b", "dev", remote, other);
+      gitIn(other, "commit", "-q", "--allow-empty", "-m", `chore(${FID}): landed copy`);
+      gitIn(other, "push", "-q", "origin", "dev");
+      const sha = gitIn(other, "rev-parse", "HEAD");
+      fakeGhBin({
+        "pr-list": "[]",
+        "run-list": JSON.stringify([{ status: "queued", conclusion: "", headSha: sha }]),
+      });
+      const r = await cli(cwd, ["dispatch", `--fid=${FID}`, `--sha=${sha}`]);
+      expect(r.code).toBe(0);
+      expect(r.json).toMatchObject({
+        ciDispatch: { outcome: "dispatched", head: sha, retrigger: false },
+        phase: "done",
+        pr: null,
+        head: sha,
+        scanResult: "clean",
+      });
     });
-  });
 
-  it("re-trigger on dev with a record pushes through the own-commit push", async () => {
-    const { cwd, remote, remoteTip, remoteLog } = devRepo({ record: true });
-    const r = await ciDispatchGate(gateBase(cwd), {
-      gh: sequenceGh([NONE, NONE, NONE, NONE, NONE, NONE, FOUND]).gh,
-      ...quiet,
-    });
-    // The foreign local commit never reaches origin; the run's commits do.
-    expect(remoteLog()).not.toContain("foreign local commit");
-    expect(remoteLog()).toContain(`chore(${FID}): run commit`);
-    expect(remoteLog()[0]).toBe(`chore(${FID}): re-trigger`);
-    // The gate follows the landed copy, not the local commit it was made as.
-    expect(r.ciDispatch).toMatchObject({ outcome: "self-healed", head: remoteTip() });
-    expect(r.head).toBe(remoteTip());
-    expect(gitIn(remote, "rev-list", "--count", "dev")).toBe("3");
-    expect(readRecord(cwd, FID)?.commits).toHaveLength(2);
-  });
-
-  it("re-trigger on dev with a record never commits a foreign staged path", async () => {
-    const { cwd, remoteLog } = devRepo({ record: true });
-    fs.writeFileSync(path.join(cwd, "foreign.txt"), "user work\n");
-    gitIn(cwd, "add", "foreign.txt");
-    await ciDispatchGate(gateBase(cwd), {
-      gh: sequenceGh([NONE, NONE, NONE, NONE, NONE, NONE, FOUND]).gh,
-      ...quiet,
+    it("re-trigger on dev with a record pushes through the own-commit push", async () => {
+      const { cwd, remote, remoteTip, remoteLog } = devRepo({ record: true });
+      const r = await ciDispatchGate(gateBase(cwd), {
+        gh: sequenceGh([NONE, NONE, NONE, NONE, NONE, NONE, FOUND]).gh,
+        ...quiet,
+      });
+      // The foreign local commit never reaches origin; the run's commits do.
+      expect(remoteLog()).not.toContain("foreign local commit");
+      expect(remoteLog()).toContain(`chore(${FID}): run commit`);
+      expect(remoteLog()[0]).toBe(`chore(${FID}): re-trigger`);
+      // The gate follows the landed copy, not the local commit it was made as.
+      expect(r.ciDispatch).toMatchObject({ outcome: "self-healed", head: remoteTip() });
+      expect(r.head).toBe(remoteTip());
+      expect(gitIn(remote, "rev-list", "--count", "dev")).toBe("3");
+      expect(readRecord(cwd, FID)?.commits).toHaveLength(2);
+    });
+
+    it("re-trigger on dev with a record never commits a foreign staged path", async () => {
+      const { cwd, remoteLog } = devRepo({ record: true });
+      fs.writeFileSync(path.join(cwd, "foreign.txt"), "user work\n");
+      gitIn(cwd, "add", "foreign.txt");
+      await ciDispatchGate(gateBase(cwd), {
+        gh: sequenceGh([NONE, NONE, NONE, NONE, NONE, NONE, FOUND]).gh,
+        ...quiet,
+      });
+      const retrigger = gitIn(cwd, "log", "-1", "--format=%H", "--grep=re-trigger");
+      expect(gitIn(cwd, "show", "--name-only", "--format=", retrigger)).toBe("");
+      expect(gitIn(cwd, "diff", "--cached", "--name-only")).toBe("foreign.txt");
+      expect(remoteLog()).not.toContain("foreign local commit");
     });
-    const retrigger = gitIn(cwd, "log", "-1", "--format=%H", "--grep=re-trigger");
-    expect(gitIn(cwd, "show", "--name-only", "--format=", retrigger)).toBe("");
-    expect(gitIn(cwd, "diff", "--cached", "--name-only")).toBe("foreign.txt");
-    expect(remoteLog()).not.toContain("foreign local commit");
-  });
 
-  it("dispatch on dev with no pr and a record follows the landed sha through the re-trigger", async () => {
-    const { cwd, remote, remoteTip } = devRepo({ record: true });
-    const r = await ciDispatchGate(
-      { ...gateBase(cwd), pr: null },
-      { gh: runAtRemoteTip(remote, 6), ...quiet },
-    );
-    expect(r.ciDispatch).toMatchObject({
-      outcome: "self-healed",
-      retrigger: true,
-      head: remoteTip(),
+    it("dispatch on dev with no pr and a record follows the landed sha through the re-trigger", async () => {
+      const { cwd, remote, remoteTip } = devRepo({ record: true });
+      const r = await ciDispatchGate(
+        { ...gateBase(cwd), pr: null },
+        { gh: runAtRemoteTip(remote, 6), ...quiet },
+      );
+      expect(r.ciDispatch).toMatchObject({
+        outcome: "self-healed",
+        retrigger: true,
+        head: remoteTip(),
+      });
+      expect(gitIn(remote, "log", "-1", "--format=%s", "dev")).toBe(`chore(${FID}): re-trigger`);
     });
-    expect(gitIn(remote, "log", "-1", "--format=%s", "dev")).toBe(`chore(${FID}): re-trigger`);
-  });
 
-  it("re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path", async () => {
-    const { cwd, remoteTip, remoteLog } = devRepo({ record: false });
-    const headBefore = gitIn(cwd, "rev-parse", "HEAD");
-    const tipBefore = remoteTip();
-    const r = await ciDispatchGate(gateBase(cwd), {
-      gh: sequenceGh([NONE, NONE, NONE, NONE, NONE, NONE, FOUND]).gh,
-      ...quiet,
+    it("re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path", async () => {
+      const { cwd, remoteTip, remoteLog } = devRepo({ record: false });
+      const headBefore = gitIn(cwd, "rev-parse", "HEAD");
+      const tipBefore = remoteTip();
+      const r = await ciDispatchGate(gateBase(cwd), {
+        gh: sequenceGh([NONE, NONE, NONE, NONE, NONE, NONE, FOUND]).gh,
+        ...quiet,
+      });
+      expect(r).toMatchObject({ phase: "repoll", handoff: 6 });
+      expect(r.ciDispatch).not.toMatchObject({ outcome: "self-healed" });
+      expect(gitIn(cwd, "rev-parse", "HEAD")).toBe(headBefore);
+      expect(remoteTip()).toBe(tipBefore);
+      expect(remoteLog()).not.toContain("foreign local commit");
+    });
+
+    it("re-trigger on dev only uses the record of its own FID", async () => {
+      const { cwd, remoteTip, remoteLog } = devRepo({ record: true });
+      const tipBefore = remoteTip();
+      const r = await ciDispatchGate(
+        { ...gateBase(cwd), fid: "some-other-run" },
+        { gh: sequenceGh([NONE, NONE, NONE, NONE, NONE, NONE, FOUND]).gh, ...quiet },
+      );
+      expect(r).toMatchObject({ handoff: 6 });
+      expect(remoteTip()).toBe(tipBefore);
+      expect(remoteLog()).not.toContain("some-other-run");
     });
-    expect(r).toMatchObject({ phase: "repoll", handoff: 6 });
-    expect(r.ciDispatch).not.toMatchObject({ outcome: "self-healed" });
-    expect(gitIn(cwd, "rev-parse", "HEAD")).toBe(headBefore);
-    expect(remoteTip()).toBe(tipBefore);
-    expect(remoteLog()).not.toContain("foreign local commit");
-  });
 
-  it("re-trigger on dev only uses the record of its own FID", async () => {
-    const { cwd, remoteTip, remoteLog } = devRepo({ record: true });
-    const tipBefore = remoteTip();
-    const r = await ciDispatchGate(
-      { ...gateBase(cwd), fid: "some-other-run" },
-      { gh: sequenceGh([NONE, NONE, NONE, NONE, NONE, NONE, FOUND]).gh, ...quiet },
+    it.each(["abc1234", "0123456789abcdef0123456789abcdef0123456"])(
+      "dispatch --sha=%s is refused: the CI run is matched on the full 40-hex sha",
+      async (sha) => {
+        const { cwd } = devRepo({ record: true });
+        const r = await cli(cwd, ["dispatch", `--fid=${FID}`, `--sha=${sha}`]);
+        expect(r.code).toBe(2);
+      },
     );
-    expect(r).toMatchObject({ handoff: 6 });
-    expect(remoteTip()).toBe(tipBefore);
-    expect(remoteLog()).not.toContain("some-other-run");
-  });
-
-  it.each(["abc1234", "0123456789abcdef0123456789abcdef0123456"])(
-    "dispatch --sha=%s is refused: the CI run is matched on the full 40-hex sha",
-    async (sha) => {
-      const { cwd } = devRepo({ record: true });
-      const r = await cli(cwd, ["dispatch", `--fid=${FID}`, `--sha=${sha}`]);
-      expect(r.code).toBe(2);
-    },
-  );
-});
+  },
+);
 
 const ROLLUP_FOUND = JSON.stringify({
   statusCheckRollup: [{ name: "bkit-tests-unit", status: "QUEUED" }],
@@ -3410,7 +3415,7 @@ describe("bkit runs context", () => {
 
 describe(
   "bkit runs dispatch — the verdict row and the close transport",
-  { timeout: 20_000 },
+  { timeout: localLimit(20_000) },
   () => {
     function pushedRepo() {
       const root = tmp();
@@ -3529,7 +3534,7 @@ describe(
   },
 );
 
-describe("bkit runs handoff", { timeout: 30_000 }, () => {
+describe("bkit runs handoff", { timeout: localLimit(30_000) }, () => {
   const REL = "docs/plans/202611/logs/1-x/status.jsonl";
   const HEAD = "a".repeat(40);
   const OTHER_HEAD = "c".repeat(40);
diff --git a/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts b/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
index 942238f9c..fde40c282 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
@@ -15,6 +15,7 @@ import { PACKAGE_RUNNER } from "../../shared/package-manager";
 import { branchesCommand } from "./branches";
 import { workflowsCommand } from "./workflows";
 import { ownershipMarker, rebaseNoteFile, worktreesCommand } from "./worktrees";
+import { localLimit } from "../../../../../vitest.timeout-budget";
 
 /**
  * Filesystem refusals on demand: `symlink` refuses every symlink (Windows without
@@ -165,47 +166,51 @@ const marker = (f: Fixture) => ownershipMarker(f.repo, FID);
 
 describe("ship feature reconciliation wiring", () => {
   useGateRunner();
-  it("reconciles cloud and laptop feature commits through the command boundary", async () => {
-    const f = fixture();
-    fs.rmSync(path.join(f.repo, ".env"));
-    git(f.repo, "switch", "-q", "-c", `feat/${FID}`);
-    fs.writeFileSync(path.join(f.repo, "feature.txt"), "shared\n");
-    git(f.repo, "add", "feature.txt");
-    git(f.repo, "commit", "-qm", "feat: shared work");
-    expect(g(f.repo, "push", "-q", "origin", `HEAD:feat/${FID}`).status).toBe(0);
-    git(f.seed, "fetch", "-q", "origin", `feat/${FID}`);
-    git(f.seed, "switch", "-q", "-c", `feat/${FID}`, "FETCH_HEAD");
-    fs.writeFileSync(path.join(f.seed, "cloud.txt"), "cloud contribution\n");
-    git(f.seed, "add", "cloud.txt");
-    git(f.seed, "commit", "-qm", "feat: cloud contribution");
-    const remoteTip = git(f.seed, "rev-parse", "HEAD");
-    expect(g(f.seed, "push", "-q", "origin", `HEAD:feat/${FID}`).status).toBe(0);
-    fs.writeFileSync(path.join(f.repo, "laptop.txt"), "laptop contribution\n");
-    git(f.repo, "add", "laptop.txt");
-    git(f.repo, "commit", "-qm", "feat: laptop contribution");
-    const localTip = git(f.repo, "rev-parse", "HEAD");
-    const configured = await setup(f.repo, "ship", `--branch=feat/${FID}`);
-    expect(configured.code, configured.err).toBe(0);
-    const errors: string[] = [];
-    const output: string[] = [];
-    const dispatch = (args: string[]) =>
-      runCommand(["branches", ...args, "--json"], [branchesCommand], {
-        classicVerbs: new Set(),
-        cwd: configured.json.worktreePath,
-        io: { stdout: (text) => output.push(text), stderr: (text) => errors.push(text) },
-      });
-    expect(await dispatch(["sync", "--reconcile-feature", `--fid=${FID}`]), errors.join("")).toBe(
-      0,
-    );
-    expect(await dispatch(["push", "--mode=plain"]), errors.join("")).toBe(0);
-    const published = git(f.origin, "rev-parse", `refs/heads/feat/${FID}`);
-    expect(g(f.origin, "merge-base", "--is-ancestor", localTip, published).status).toBe(0);
-    expect(g(f.origin, "merge-base", "--is-ancestor", remoteTip, published).status).toBe(0);
-    expect(git(f.origin, "show", `${published}:cloud.txt`)).toBe("cloud contribution");
-    expect(git(f.origin, "show", `${published}:laptop.txt`)).toBe("laptop contribution");
-    expect(git(f.origin, "log", "-1", "--format=%s", published)).not.toContain("[skip ci]");
-    expect(output.join("")).toContain(published);
-  }, 60_000);
+  it(
+    "reconciles cloud and laptop feature commits through the command boundary",
+    async () => {
+      const f = fixture();
+      fs.rmSync(path.join(f.repo, ".env"));
+      git(f.repo, "switch", "-q", "-c", `feat/${FID}`);
+      fs.writeFileSync(path.join(f.repo, "feature.txt"), "shared\n");
+      git(f.repo, "add", "feature.txt");
+      git(f.repo, "commit", "-qm", "feat: shared work");
+      expect(g(f.repo, "push", "-q", "origin", `HEAD:feat/${FID}`).status).toBe(0);
+      git(f.seed, "fetch", "-q", "origin", `feat/${FID}`);
+      git(f.seed, "switch", "-q", "-c", `feat/${FID}`, "FETCH_HEAD");
+      fs.writeFileSync(path.join(f.seed, "cloud.txt"), "cloud contribution\n");
+      git(f.seed, "add", "cloud.txt");
+      git(f.seed, "commit", "-qm", "feat: cloud contribution");
+      const remoteTip = git(f.seed, "rev-parse", "HEAD");
+      expect(g(f.seed, "push", "-q", "origin", `HEAD:feat/${FID}`).status).toBe(0);
+      fs.writeFileSync(path.join(f.repo, "laptop.txt"), "laptop contribution\n");
+      git(f.repo, "add", "laptop.txt");
+      git(f.repo, "commit", "-qm", "feat: laptop contribution");
+      const localTip = git(f.repo, "rev-parse", "HEAD");
+      const configured = await setup(f.repo, "ship", `--branch=feat/${FID}`);
+      expect(configured.code, configured.err).toBe(0);
+      const errors: string[] = [];
+      const output: string[] = [];
+      const dispatch = (args: string[]) =>
+        runCommand(["branches", ...args, "--json"], [branchesCommand], {
+          classicVerbs: new Set(),
+          cwd: configured.json.worktreePath,
+          io: { stdout: (text) => output.push(text), stderr: (text) => errors.push(text) },
+        });
+      expect(await dispatch(["sync", "--reconcile-feature", `--fid=${FID}`]), errors.join("")).toBe(
+        0,
+      );
+      expect(await dispatch(["push", "--mode=plain"]), errors.join("")).toBe(0);
+      const published = git(f.origin, "rev-parse", `refs/heads/feat/${FID}`);
+      expect(g(f.origin, "merge-base", "--is-ancestor", localTip, published).status).toBe(0);
+      expect(g(f.origin, "merge-base", "--is-ancestor", remoteTip, published).status).toBe(0);
+      expect(git(f.origin, "show", `${published}:cloud.txt`)).toBe("cloud contribution");
+      expect(git(f.origin, "show", `${published}:laptop.txt`)).toBe("laptop contribution");
+      expect(git(f.origin, "log", "-1", "--format=%s", published)).not.toContain("[skip ci]");
+      expect(output.join("")).toContain(published);
+    },
+    localLimit(60_000),
+  );
 
   async function closeWithRemoteChange(when: "before" | "after-proof" | "recreated") {
     const f = fixture();
@@ -314,11 +319,15 @@ describe("ship feature reconciliation wiring", () => {
     }
   }
 
-  it("keeps a newer remote feature tip while closing the landed local tip", async () => {
-    await closeWithRemoteChange("before");
-    expect(await closeWithRemoteChange("after-proof")).toBe(true);
-    expect(await closeWithRemoteChange("recreated")).toBe(true);
-  }, 60_000);
+  it(
+    "keeps a newer remote feature tip while closing the landed local tip",
+    async () => {
+      await closeWithRemoteChange("before");
+      expect(await closeWithRemoteChange("after-proof")).toBe(true);
+      expect(await closeWithRemoteChange("recreated")).toBe(true);
+    },
+    localLimit(60_000),
+  );
 });
 
 describe("bkit worktrees setup — mint (create)", () => {
diff --git a/.bkit/core/engine/commands/workflow/worktrees.test.ts b/.bkit/core/engine/commands/workflow/worktrees.test.ts
index 3e50468ee..710bd94e7 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.test.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -19,6 +19,7 @@ import {
   worktreeDir,
   worktreesCommand,
 } from "./worktrees";
+import { localLimit } from "../../../../../vitest.timeout-budget";
 
 const FID = "42-thing";
 const MONTH = "202610";
@@ -463,28 +464,32 @@ describe("bkit worktrees setup — ship branch", () => {
     expect(git(cwd, "rev-parse", `refs/remotes/origin/feat/${FID}`)).toBe(expected);
   });
 
-  it("refuses inherited unpublished dev commits in every ship mode", async () => {
-    const created = inheritedShip("created");
-    const resumed = inheritedShip("resumed");
-    const adopted = inheritedShip("adopted");
-    const a = await setup(created.cwd, "ship", ...created.flags);
-    const b = await setup(resumed.cwd, "ship", ...resumed.flags);
-    const c = await setup(adopted.cwd, "ship", ...adopted.flags);
-    expect([a.code, b.code, c.code]).toEqual([7, 7, 7]);
-    expect(a.err).toMatch(/unpublished|unpushed/);
-    expect(b.err).toMatch(/unpublished|unpushed/);
-    expect(c.err).toMatch(/unpublished|unpushed/);
-    expect(git(created.origin, "branch", "--list", `feat/${FID}`)).toBe("");
-    expect(git(resumed.cwd, "rev-parse", `feat/${FID}`)).toBe(resumed.inherited);
-    expect(git(adopted.cwd, "rev-parse", `feat/${FID}`)).toBe(adopted.inherited);
-
-    const independent = inheritedShip("adopted");
-    git(independent.cwd, "switch", "-q", "-c", "independent", "origin/dev");
-    git(independent.cwd, "commit", "-q", "--allow-empty", "-m", "feat: independent work");
-    const allowed = await setup(independent.cwd, "ship", "--branch=independent");
-    expect(allowed.code, allowed.err).toBe(0);
-    expect(allowed.json.branch).toBe("independent");
-  }, 60_000);
+  it(
+    "refuses inherited unpublished dev commits in every ship mode",
+    async () => {
+      const created = inheritedShip("created");
+      const resumed = inheritedShip("resumed");
+      const adopted = inheritedShip("adopted");
+      const a = await setup(created.cwd, "ship", ...created.flags);
+      const b = await setup(resumed.cwd, "ship", ...resumed.flags);
+      const c = await setup(adopted.cwd, "ship", ...adopted.flags);
+      expect([a.code, b.code, c.code]).toEqual([7, 7, 7]);
+      expect(a.err).toMatch(/unpublished|unpushed/);
+      expect(b.err).toMatch(/unpublished|unpushed/);
+      expect(c.err).toMatch(/unpublished|unpushed/);
+      expect(git(created.origin, "branch", "--list", `feat/${FID}`)).toBe("");
+      expect(git(resumed.cwd, "rev-parse", `feat/${FID}`)).toBe(resumed.inherited);
+      expect(git(adopted.cwd, "rev-parse", `feat/${FID}`)).toBe(adopted.inherited);
+
+      const independent = inheritedShip("adopted");
+      git(independent.cwd, "switch", "-q", "-c", "independent", "origin/dev");
+      git(independent.cwd, "commit", "-q", "--allow-empty", "-m", "feat: independent work");
+      const allowed = await setup(independent.cwd, "ship", "--branch=independent");
+      expect(allowed.code, allowed.err).toBe(0);
+      expect(allowed.json.branch).toBe("independent");
+    },
+    localLimit(60_000),
+  );
 
   it("names inherited commits and ship recovery in the refusal", async () => {
     const f = inheritedShip("adopted");
diff --git a/.bkit/core/engine/install/cloud-env.integration.test.ts b/.bkit/core/engine/install/cloud-env.integration.test.ts
index f51921342..83e9b164b 100644
--- a/.bkit/core/engine/install/cloud-env.integration.test.ts
+++ b/.bkit/core/engine/install/cloud-env.integration.test.ts
@@ -20,6 +20,7 @@ import {
 } from "./cloud-env";
 import { BKIT_EGRESS_SOURCES } from "../shared/egress";
 import { requireTsx } from "../../../../vitest.tsx-bin";
+import { localLimit } from "../../../../vitest.timeout-budget";
 
 let tmpDir: string;
 let originalCwd: string;
@@ -138,38 +139,46 @@ describe("T4 — the derived egress set reaches all five surfaces", () => {
 // Provenance leg — claudeAllowDerived creates no drift: the check write-set is IDENTICAL
 // with and without the provenance record.
 describe("T14 — the provenance field contributes no bkit check drift", () => {
-  it("check reports the same write set with and without claudeAllowDerived present", () => {
-    fs.writeFileSync(
-      path.join(tmpDir, "package.json"),
-      JSON.stringify({ name: "drift", version: "1.0.0", packageManager: "pnpm@10.34.3" }, null, 2),
-    );
-    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
+  it(
+    "check reports the same write set with and without claudeAllowDerived present",
+    () => {
+      fs.writeFileSync(
+        path.join(tmpDir, "package.json"),
+        JSON.stringify(
+          { name: "drift", version: "1.0.0", packageManager: "pnpm@10.34.3" },
+          null,
+          2,
+        ),
+      );
+      fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
 
-    const run = (args: string[]) =>
-      spawnSync(requireTsx(), [bkitInstallPath, ...args], {
-        cwd: tmpDir,
-        encoding: "utf-8",
-        env: { ...process.env, NODE_NO_WARNINGS: "1" },
-        timeout: 120_000,
-      });
+      const run = (args: string[]) =>
+        spawnSync(requireTsx(), [bkitInstallPath, ...args], {
+          cwd: tmpDir,
+          encoding: "utf-8",
+          env: { ...process.env, NODE_NO_WARNINGS: "1" },
+          timeout: 120_000,
+        });
 
-    expect(run(["install", "--claude"]).status).toBe(0);
+      expect(run(["install", "--claude"]).status).toBe(0);
 
-    const writeCount = (out: string) => /(\d+) write\(s\) would occur/.exec(out)?.[1];
+      const writeCount = (out: string) => /(\d+) write\(s\) would occur/.exec(out)?.[1];
 
-    const withField = writeCount(run(["check"]).stdout);
-    expect(withField).toBeDefined();
+      const withField = writeCount(run(["check"]).stdout);
+      expect(withField).toBeDefined();
 
-    // strip the record and re-check: the count must not move
-    const versionPath = path.join(tmpDir, ".bkit", "version");
-    const v = JSON.parse(fs.readFileSync(versionPath, "utf-8")) as Record<string, unknown>;
-    expect(Array.isArray(v.claudeAllowDerived)).toBe(true);
-    expect((v.claudeAllowDerived as string[]).length).toBeGreaterThan(0);
-    delete v.claudeAllowDerived;
-    fs.writeFileSync(versionPath, JSON.stringify(v, null, 2) + "\n");
+      // strip the record and re-check: the count must not move
+      const versionPath = path.join(tmpDir, ".bkit", "version");
+      const v = JSON.parse(fs.readFileSync(versionPath, "utf-8")) as Record<string, unknown>;
+      expect(Array.isArray(v.claudeAllowDerived)).toBe(true);
+      expect((v.claudeAllowDerived as string[]).length).toBeGreaterThan(0);
+      delete v.claudeAllowDerived;
+      fs.writeFileSync(versionPath, JSON.stringify(v, null, 2) + "\n");
 
-    expect(writeCount(run(["check"]).stdout)).toBe(withField);
-  }, 180_000);
+      expect(writeCount(run(["check"]).stdout)).toBe(withField);
+    },
+    localLimit(180_000),
+  );
 });
 
 // The generated install-script pieces, executed by a real bash — string checks alone
@@ -301,36 +310,44 @@ describe("cloud install script pieces, run by bash", () => {
       });
     };
 
-    it("runs every recipe through bkit context provision and tells the agent on stdout what failed", () => {
-      const res = runHook(
-        "<!-- bkit:end -->\n" +
-          block("fails-first", "false\necho fails-first-kept-going") +
-          block("good", "echo good-ran") +
-          block("", 'echo "local Supabase unavailable: 3 GB free" >&2\nexit 3'),
-      );
-      expect(res.status).toBe(0);
-      expect(res.stderr).toContain("good-ran");
-      // `false` stops its own recipe, even though the recipe's last command would succeed.
-      expect(res.stderr).not.toContain("fails-first-kept-going");
-      expect(res.stderr).toContain("provision 'fails-first' failed (non-blocking): exit 1");
-      expect(res.stderr).toContain(
-        "provision '#3' failed (non-blocking): local Supabase unavailable",
-      );
-      expect(res.stderr).not.toContain("'good' failed");
-      expect(res.stdout).toBe(
-        "Cloud setup could not provide these in this session (setup failed; treat them as absent, do not retry the install):\n" +
-          "fails-first: exit 1\n#3: local Supabase unavailable: 3 GB free\n",
-      );
-    }, 90_000);
+    it(
+      "runs every recipe through bkit context provision and tells the agent on stdout what failed",
+      () => {
+        const res = runHook(
+          "<!-- bkit:end -->\n" +
+            block("fails-first", "false\necho fails-first-kept-going") +
+            block("good", "echo good-ran") +
+            block("", 'echo "local Supabase unavailable: 3 GB free" >&2\nexit 3'),
+        );
+        expect(res.status).toBe(0);
+        expect(res.stderr).toContain("good-ran");
+        // `false` stops its own recipe, even though the recipe's last command would succeed.
+        expect(res.stderr).not.toContain("fails-first-kept-going");
+        expect(res.stderr).toContain("provision 'fails-first' failed (non-blocking): exit 1");
+        expect(res.stderr).toContain(
+          "provision '#3' failed (non-blocking): local Supabase unavailable",
+        );
+        expect(res.stderr).not.toContain("'good' failed");
+        expect(res.stdout).toBe(
+          "Cloud setup could not provide these in this session (setup failed; treat them as absent, do not retry the install):\n" +
+            "fails-first: exit 1\n#3: local Supabase unavailable: 3 GB free\n",
+        );
+      },
+      localLimit(90_000),
+    );
 
-    it("prints nothing to stdout when every recipe succeeds", () => {
-      writeFile(".bkit/.unavailable", "good: old\n");
-      const res = runHook("<!-- bkit:end -->\n" + block("good", "echo good-ran"));
-      expect(res.status).toBe(0);
-      expect(res.stderr).toContain("good-ran");
-      expect(res.stdout).toBe("");
-      expect(fs.existsSync(path.join(tmpDir, ".bkit/.unavailable"))).toBe(false);
-    }, 90_000);
+    it(
+      "prints nothing to stdout when every recipe succeeds",
+      () => {
+        writeFile(".bkit/.unavailable", "good: old\n");
+        const res = runHook("<!-- bkit:end -->\n" + block("good", "echo good-ran"));
+        expect(res.status).toBe(0);
+        expect(res.stderr).toContain("good-ran");
+        expect(res.stdout).toBe("");
+        expect(fs.existsSync(path.join(tmpDir, ".bkit/.unavailable"))).toBe(false);
+      },
+      localLimit(90_000),
+    );
 
     it("logs and carries on when the installed bkit has no provision verb", () => {
       const res = runHook("<!-- bkit:end -->\n" + block("good", "true"), "#!/bin/bash\nexit 2\n");
diff --git a/.bkit/core/engine/install/modules/core.integration.test.ts b/.bkit/core/engine/install/modules/core.integration.test.ts
index 9fde28483..a9c4d9a52 100644
--- a/.bkit/core/engine/install/modules/core.integration.test.ts
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -40,6 +40,7 @@ import {
   parseEffortMap,
   parseModelLookup,
 } from "../../render/models";
+import { localLimit } from "../../../../../vitest.timeout-budget";
 
 // ---------------------------------------------------------------------------
 // Helpers
@@ -2514,246 +2515,254 @@ describe("migrateValeHouseStyle (via runBkitDocs)", () => {
   });
 });
 
-describe("deterministic bookkeeping contracts in a fresh consumer", { timeout: 180_000 }, () => {
-  const promptsMd = path.join(getBkitDocsRoot(), "prompts.md");
-  const HOSTS = ["claude", "cursor", "opencode", "codex", "antigravity"] as const;
-  const TRACKERS = ["github", "linear", "jira", "none"] as const;
-  const WORKFLOW_FILES: Record<(typeof HOSTS)[number], string> = {
-    claude: ".claude/commands/bkit-build.md",
-    cursor: ".cursor/commands/bkit-build.md",
-    opencode: ".opencode/commands/bkit-build.md",
-    codex: ".agents/skills/bkit-build/SKILL.md",
-    antigravity: ".agents/plugins/bkit/skills/bkit-build/SKILL.md",
-  };
-  const extraDirs: string[] = [];
-  afterEach(() => {
-    process.chdir(originalCwd);
-    for (const d of extraDirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
-  });
-
-  const consumer = (): string => {
-    const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-consumer-")));
-    extraDirs.push(dir);
-    fs.writeFileSync(
-      path.join(dir, "package.json"),
-      JSON.stringify({ name: "test-project", packageManager: "pnpm@10.4.1" }),
-      "utf-8",
-    );
-    process.chdir(dir);
-    return dir;
-  };
-  const install = (host: (typeof HOSTS)[number], tracker: (typeof TRACKERS)[number]): WriteSet => {
-    const ws = makeWriteSet();
-    dispatchModules(
-      new Set(["core", host]),
-      makeCtx({
-        ws,
-        issueTracker: tracker,
-        modelLookup: parseModelLookup(promptsMd),
-        codexModelLookup: buildOpencodeModelLookup(promptsMd, "openai"),
-        opencodeModelLookup: buildOpencodeModelLookup(promptsMd, "openrouter"),
-        antigravityModelLookup: buildAntigravityModelLookup(promptsMd),
-        effortMap: parseEffortMap(promptsMd),
-        opencodeProvider: "openrouter",
-      }),
-    );
-    return ws;
-  };
-  const read = (dir: string, rel: string) => fs.readFileSync(path.join(dir, rel), "utf-8");
-  const correction = (text: string) =>
-    /\*\*Bounded correction:\*\*[\s\S]*?(?:\n\s*\n|$)/.exec(text)?.[0].replace(/\s+/g, " ") ?? "";
-
-  const CLI = path.join(getPkgRoot(), "dist", "cli.js");
-  const bkit = (cwd: string, ...argv: string[]) => {
-    const res = spawnSync(process.execPath, [CLI, ...argv, "--json"], {
-      cwd,
-      encoding: "utf-8",
-    });
-    return {
-      code: res.status,
-      json: res.stdout.trim() === "" ? undefined : (JSON.parse(res.stdout) as Record<string, any>),
-      err: res.stderr,
+describe(
+  "deterministic bookkeeping contracts in a fresh consumer",
+  { timeout: localLimit(180_000) },
+  () => {
+    const promptsMd = path.join(getBkitDocsRoot(), "prompts.md");
+    const HOSTS = ["claude", "cursor", "opencode", "codex", "antigravity"] as const;
+    const TRACKERS = ["github", "linear", "jira", "none"] as const;
+    const WORKFLOW_FILES: Record<(typeof HOSTS)[number], string> = {
+      claude: ".claude/commands/bkit-build.md",
+      cursor: ".cursor/commands/bkit-build.md",
+      opencode: ".opencode/commands/bkit-build.md",
+      codex: ".agents/skills/bkit-build/SKILL.md",
+      antigravity: ".agents/plugins/bkit/skills/bkit-build/SKILL.md",
     };
-  };
-  const gitIn = (cwd: string, ...args: string[]) => {
-    const res = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], {
-      cwd,
-      encoding: "utf-8",
+    const extraDirs: string[] = [];
+    afterEach(() => {
+      process.chdir(originalCwd);
+      for (const d of extraDirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
     });
-    return res.stdout.trim();
-  };
-  const jsonRows = (file: string) =>
-    fs
-      .readFileSync(file, "utf-8")
-      .split("\n")
-      .filter((l) => l !== "")
-      .map((l) => JSON.parse(l) as Record<string, any>);
-
-  it("installs and upgrades fresh consumers with deterministic bookkeeping contracts", () => {
-    const snapshots = new Map<string, Record<string, string>>();
-
-    // Fresh install: every host x tracker renders the same recovery contract and engine-owned CI re-entry.
-    for (const host of HOSTS) {
-      for (const tracker of TRACKERS) {
-        const dir = consumer();
-        install(host, tracker);
-        const workflow = read(dir, WORKFLOW_FILES[host]);
-        expect(correction(workflow), `${host}/${tracker}`).toMatch(/guaranteed no-write/i);
-        expect(correction(workflow), `${host}/${tracker}`).toMatch(/two corrected retries/i);
-        expect(workflow, `${host}/${tracker}`).toContain("bkit runs handoff");
-        expect(workflow, `${host}/${tracker}`).not.toContain("--attempts=<total>");
-        expect(workflow, `${host}/${tracker}`).not.toContain("{CI_REENTRY}");
-        snapshots.set(`${host}/${tracker}`, {
-          contract: correction(workflow),
-          cli: read(dir, ".bkit/cli.md"),
-          jsonl: read(dir, ".bkit/jsonl.md"),
-          workflows: read(dir, ".bkit/workflows.md"),
-          prompts: read(dir, ".bkit/prompts.md"),
-        });
-      }
-    }
-    // One wording and one set of docs across the matrix.
-    const contracts = new Set([...snapshots.values()].map((s) => s.contract));
-    expect(contracts.size).toBe(1);
-    const first = [...snapshots.values()][0]!;
-    for (const s of snapshots.values()) {
-      expect(s.cli).toBe(first.cli);
-      expect(s.jsonl).toBe(first.jsonl);
-    }
-    // The shipped docs state each ownership boundary, and the catalog lists the new verbs.
-    for (const verb of ["ledgers query", "runs handoff", "counters correction"]) {
-      expect(first.cli, verb).toContain(verb);
-    }
-    expect(first.cli).toContain("--correction-of");
-    expect(first.cli).toContain("--operation");
-    expect(first.jsonl).toContain("ci-handoff");
-    expect(first.jsonl).toContain("correction-rejected");
-    expect(first.jsonl).toMatch(/receipt/i);
-    expect(first.workflows).toContain("Bounded correction");
-    expect(first.prompts).toMatch(/modelSource/);
-
-    // Upgrade: stale managed files are put back to the fresh bytes, and a further install writes nothing.
-    const dir = consumer();
-    install("claude", "github");
-    const fresh = {
-      workflow: read(dir, WORKFLOW_FILES.claude),
-      cli: read(dir, ".bkit/cli.md"),
-      jsonl: read(dir, ".bkit/jsonl.md"),
+
+    const consumer = (): string => {
+      const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-consumer-")));
+      extraDirs.push(dir);
+      fs.writeFileSync(
+        path.join(dir, "package.json"),
+        JSON.stringify({ name: "test-project", packageManager: "pnpm@10.4.1" }),
+        "utf-8",
+      );
+      process.chdir(dir);
+      return dir;
     };
-    fs.writeFileSync(path.join(dir, WORKFLOW_FILES.claude), `${fresh.workflow}\nstale\n`);
-    fs.writeFileSync(
-      path.join(dir, ".bkit/cli.md"),
-      fresh.cli.replace("runs handoff", "runs wait"),
-    );
-    fs.writeFileSync(path.join(dir, ".bkit/jsonl.md"), "stale\n");
-    install("claude", "github");
-    expect(read(dir, WORKFLOW_FILES.claude)).toBe(fresh.workflow);
-    expect(read(dir, ".bkit/cli.md")).toBe(fresh.cli);
-    expect(read(dir, ".bkit/jsonl.md")).toBe(fresh.jsonl);
-    expect(install("claude", "github").writes).toEqual([]);
-
-    // The built CLI the consumer runs agrees with the installed catalog and completes the journey.
-    gitIn(dir, "init", "-q", "-b", "feat/1-x");
-    fs.writeFileSync(path.join(dir, "README.md"), "x\n");
-    gitIn(dir, "add", "-A");
-    gitIn(dir, "commit", "-q", "-m", "init");
-    const rel = "docs/plans/202611/logs/1-x/status.jsonl";
-    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
-    fs.writeFileSync(
-      path.join(dir, rel),
-      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-11-01T00:00:00Z" })}\n`,
-    );
-    for (const verb of [
-      ["ledgers", "query"],
-      ["runs", "handoff"],
-      ["counters", "correction"],
-    ]) {
-      expect(bkit(dir, ...verb, "--help").code, verb.join(" ")).toBe(0);
-    }
-    // Missing observed model: the engine fills what it can verify and leaves the rest absent.
-    const issued = bkit(
-      dir,
-      "status",
-      "invocation",
-      "--workflow=build",
-      "--step=build-plan-tests",
-      `--file=${rel}`,
-      "--host=claude",
-      "--configured-model=sonnet",
-      "--agent=bkit-build-plan-tests",
-    );
-    expect(issued.code).toBe(0);
-    const id = issued.json!["invocation"] as string;
-    const rowsFile = path.join(dir, "rows.json");
-    const append = (rows: unknown[], ...extra: string[]) => {
-      fs.writeFileSync(rowsFile, JSON.stringify(rows));
-      return bkit(
-        dir,
-        "ledgers",
-        "append",
-        `--root=${dir}`,
-        "--ledger=knowledge",
-        `--rows=${rowsFile}`,
-        `--invocation=${id}`,
-        ...extra,
+    const install = (
+      host: (typeof HOSTS)[number],
+      tracker: (typeof TRACKERS)[number],
+    ): WriteSet => {
+      const ws = makeWriteSet();
+      dispatchModules(
+        new Set(["core", host]),
+        makeCtx({
+          ws,
+          issueTracker: tracker,
+          modelLookup: parseModelLookup(promptsMd),
+          codexModelLookup: buildOpencodeModelLookup(promptsMd, "openai"),
+          opencodeModelLookup: buildOpencodeModelLookup(promptsMd, "openrouter"),
+          antigravityModelLookup: buildAntigravityModelLookup(promptsMd),
+          effortMap: parseEffortMap(promptsMd),
+          opencodeProvider: "openrouter",
+        }),
       );
+      return ws;
     };
-    const row = { kind: "knowledge", key: "gotcha", summary: "a gotcha worth keeping" };
-    // A guaranteed no-write rejection, then the corrected candidate, then a lost-response replay.
-    const rejected = append([{ ...row, status: "BOGUS" }], "--operation=op-1");
-    expect(rejected.code).toBe(8);
-    expect(rejected.json!["error"]).toMatchObject({ effects: "none", correctable: true });
-    expect(fs.existsSync(path.join(dir, "docs", "knowledge.jsonl"))).toBe(false);
-    const corrected = append([row], "--operation=op-2", "--correction-of=op-1");
-    expect(corrected.code).toBe(0);
-    expect(corrected.json!["correction"]).toMatchObject({ used: 1, limit: 2, verified: true });
-    const replayed = append([row], "--operation=op-2", "--correction-of=op-1");
-    expect(replayed.json!["receipt"]).toMatchObject({ operation: "op-2", replayed: true });
-    const stored = jsonRows(path.join(dir, "docs", "knowledge.jsonl"));
-    expect(stored).toHaveLength(1);
-    expect(stored[0]!["by"]).toMatchObject({
-      workflow: "build",
-      step: "build-plan-tests",
-      subagent: "bkit-build-plan-tests",
-      configuredModel: "sonnet",
-      host: "claude",
-    });
-    expect(stored[0]!["by"]).not.toHaveProperty("model");
-    // The canonical read agrees with the append: one winner, a complete scan.
-    const queried = bkit(dir, "ledgers", "query", `--root=${dir}`, "--ledger=knowledge");
-    expect(queried.json!["rows"]).toHaveLength(1);
-    expect(queried.json!["coverage"]).toMatchObject({ status: "clean", clean: true });
-    // Resume with a new process and a new invocation: the correction budget and CI totals carry on.
-    const scope = (corrected.json!["correction"] as { scope: string }).scope;
-    const counter = bkit(
-      dir,
-      "counters",
-      "correction",
-      `--file=${rel}`,
-      "--workflow=build",
-      `--scope=${scope}`,
-      "--operation=op-3",
-    );
-    expect(counter.json).toMatchObject({ allowed: true, used: 2, limit: 2 });
-    const poll = (result: string) =>
-      bkit(
+    const read = (dir: string, rel: string) => fs.readFileSync(path.join(dir, rel), "utf-8");
+    const correction = (text: string) =>
+      /\*\*Bounded correction:\*\*[\s\S]*?(?:\n\s*\n|$)/.exec(text)?.[0].replace(/\s+/g, " ") ?? "";
+
+    const CLI = path.join(getPkgRoot(), "dist", "cli.js");
+    const bkit = (cwd: string, ...argv: string[]) => {
+      const res = spawnSync(process.execPath, [CLI, ...argv, "--json"], {
+        cwd,
+        encoding: "utf-8",
+      });
+      return {
+        code: res.status,
+        json:
+          res.stdout.trim() === "" ? undefined : (JSON.parse(res.stdout) as Record<string, any>),
+        err: res.stderr,
+      };
+    };
+    const gitIn = (cwd: string, ...args: string[]) => {
+      const res = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], {
+        cwd,
+        encoding: "utf-8",
+      });
+      return res.stdout.trim();
+    };
+    const jsonRows = (file: string) =>
+      fs
+        .readFileSync(file, "utf-8")
+        .split("\n")
+        .filter((l) => l !== "")
+        .map((l) => JSON.parse(l) as Record<string, any>);
+
+    it("installs and upgrades fresh consumers with deterministic bookkeeping contracts", () => {
+      const snapshots = new Map<string, Record<string, string>>();
+
+      // Fresh install: every host x tracker renders the same recovery contract and engine-owned CI re-entry.
+      for (const host of HOSTS) {
+        for (const tracker of TRACKERS) {
+          const dir = consumer();
+          install(host, tracker);
+          const workflow = read(dir, WORKFLOW_FILES[host]);
+          expect(correction(workflow), `${host}/${tracker}`).toMatch(/guaranteed no-write/i);
+          expect(correction(workflow), `${host}/${tracker}`).toMatch(/two corrected retries/i);
+          expect(workflow, `${host}/${tracker}`).toContain("bkit runs handoff");
+          expect(workflow, `${host}/${tracker}`).not.toContain("--attempts=<total>");
+          expect(workflow, `${host}/${tracker}`).not.toContain("{CI_REENTRY}");
+          snapshots.set(`${host}/${tracker}`, {
+            contract: correction(workflow),
+            cli: read(dir, ".bkit/cli.md"),
+            jsonl: read(dir, ".bkit/jsonl.md"),
+            workflows: read(dir, ".bkit/workflows.md"),
+            prompts: read(dir, ".bkit/prompts.md"),
+          });
+        }
+      }
+      // One wording and one set of docs across the matrix.
+      const contracts = new Set([...snapshots.values()].map((s) => s.contract));
+      expect(contracts.size).toBe(1);
+      const first = [...snapshots.values()][0]!;
+      for (const s of snapshots.values()) {
+        expect(s.cli).toBe(first.cli);
+        expect(s.jsonl).toBe(first.jsonl);
+      }
+      // The shipped docs state each ownership boundary, and the catalog lists the new verbs.
+      for (const verb of ["ledgers query", "runs handoff", "counters correction"]) {
+        expect(first.cli, verb).toContain(verb);
+      }
+      expect(first.cli).toContain("--correction-of");
+      expect(first.cli).toContain("--operation");
+      expect(first.jsonl).toContain("ci-handoff");
+      expect(first.jsonl).toContain("correction-rejected");
+      expect(first.jsonl).toMatch(/receipt/i);
+      expect(first.workflows).toContain("Bounded correction");
+      expect(first.prompts).toMatch(/modelSource/);
+
+      // Upgrade: stale managed files are put back to the fresh bytes, and a further install writes nothing.
+      const dir = consumer();
+      install("claude", "github");
+      const fresh = {
+        workflow: read(dir, WORKFLOW_FILES.claude),
+        cli: read(dir, ".bkit/cli.md"),
+        jsonl: read(dir, ".bkit/jsonl.md"),
+      };
+      fs.writeFileSync(path.join(dir, WORKFLOW_FILES.claude), `${fresh.workflow}\nstale\n`);
+      fs.writeFileSync(
+        path.join(dir, ".bkit/cli.md"),
+        fresh.cli.replace("runs handoff", "runs wait"),
+      );
+      fs.writeFileSync(path.join(dir, ".bkit/jsonl.md"), "stale\n");
+      install("claude", "github");
+      expect(read(dir, WORKFLOW_FILES.claude)).toBe(fresh.workflow);
+      expect(read(dir, ".bkit/cli.md")).toBe(fresh.cli);
+      expect(read(dir, ".bkit/jsonl.md")).toBe(fresh.jsonl);
+      expect(install("claude", "github").writes).toEqual([]);
+
+      // The built CLI the consumer runs agrees with the installed catalog and completes the journey.
+      gitIn(dir, "init", "-q", "-b", "feat/1-x");
+      fs.writeFileSync(path.join(dir, "README.md"), "x\n");
+      gitIn(dir, "add", "-A");
+      gitIn(dir, "commit", "-q", "-m", "init");
+      const rel = "docs/plans/202611/logs/1-x/status.jsonl";
+      fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
+      fs.writeFileSync(
+        path.join(dir, rel),
+        `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-11-01T00:00:00Z" })}\n`,
+      );
+      for (const verb of [
+        ["ledgers", "query"],
+        ["runs", "handoff"],
+        ["counters", "correction"],
+      ]) {
+        expect(bkit(dir, ...verb, "--help").code, verb.join(" ")).toBe(0);
+      }
+      // Missing observed model: the engine fills what it can verify and leaves the rest absent.
+      const issued = bkit(
         dir,
-        "runs",
-        "handoff",
-        `--invocation=${id}`,
-        "--repo=acme/test-project",
-        "--pr=7",
-        `--head=${"a".repeat(40)}`,
-        "--branch=feat/1-x",
-        "--budget-s=60",
-        "--interval-s=10",
-        `--result=${result}`,
-        "--polls=3",
+        "status",
+        "invocation",
+        "--workflow=build",
+        "--step=build-plan-tests",
+        `--file=${rel}`,
+        "--host=claude",
+        "--configured-model=sonnet",
+        "--agent=bkit-build-plan-tests",
       );
-    expect(poll("none").json).toMatchObject({ attempts: 3, nextAction: "poll-again" });
-    expect(poll("none").json).toMatchObject({ attempts: 6, nextAction: "retrigger" });
-  });
-});
+      expect(issued.code).toBe(0);
+      const id = issued.json!["invocation"] as string;
+      const rowsFile = path.join(dir, "rows.json");
+      const append = (rows: unknown[], ...extra: string[]) => {
+        fs.writeFileSync(rowsFile, JSON.stringify(rows));
+        return bkit(
+          dir,
+          "ledgers",
+          "append",
+          `--root=${dir}`,
+          "--ledger=knowledge",
+          `--rows=${rowsFile}`,
+          `--invocation=${id}`,
+          ...extra,
+        );
+      };
+      const row = { kind: "knowledge", key: "gotcha", summary: "a gotcha worth keeping" };
+      // A guaranteed no-write rejection, then the corrected candidate, then a lost-response replay.
+      const rejected = append([{ ...row, status: "BOGUS" }], "--operation=op-1");
+      expect(rejected.code).toBe(8);
+      expect(rejected.json!["error"]).toMatchObject({ effects: "none", correctable: true });
+      expect(fs.existsSync(path.join(dir, "docs", "knowledge.jsonl"))).toBe(false);
+      const corrected = append([row], "--operation=op-2", "--correction-of=op-1");
+      expect(corrected.code).toBe(0);
+      expect(corrected.json!["correction"]).toMatchObject({ used: 1, limit: 2, verified: true });
+      const replayed = append([row], "--operation=op-2", "--correction-of=op-1");
+      expect(replayed.json!["receipt"]).toMatchObject({ operation: "op-2", replayed: true });
+      const stored = jsonRows(path.join(dir, "docs", "knowledge.jsonl"));
+      expect(stored).toHaveLength(1);
+      expect(stored[0]!["by"]).toMatchObject({
+        workflow: "build",
+        step: "build-plan-tests",
+        subagent: "bkit-build-plan-tests",
+        configuredModel: "sonnet",
+        host: "claude",
+      });
+      expect(stored[0]!["by"]).not.toHaveProperty("model");
+      // The canonical read agrees with the append: one winner, a complete scan.
+      const queried = bkit(dir, "ledgers", "query", `--root=${dir}`, "--ledger=knowledge");
+      expect(queried.json!["rows"]).toHaveLength(1);
+      expect(queried.json!["coverage"]).toMatchObject({ status: "clean", clean: true });
+      // Resume with a new process and a new invocation: the correction budget and CI totals carry on.
+      const scope = (corrected.json!["correction"] as { scope: string }).scope;
+      const counter = bkit(
+        dir,
+        "counters",
+        "correction",
+        `--file=${rel}`,
+        "--workflow=build",
+        `--scope=${scope}`,
+        "--operation=op-3",
+      );
+      expect(counter.json).toMatchObject({ allowed: true, used: 2, limit: 2 });
+      const poll = (result: string) =>
+        bkit(
+          dir,
+          "runs",
+          "handoff",
+          `--invocation=${id}`,
+          "--repo=acme/test-project",
+          "--pr=7",
+          `--head=${"a".repeat(40)}`,
+          "--branch=feat/1-x",
+          "--budget-s=60",
+          "--interval-s=10",
+          `--result=${result}`,
+          "--polls=3",
+        );
+      expect(poll("none").json).toMatchObject({ attempts: 3, nextAction: "poll-again" });
+      expect(poll("none").json).toMatchObject({ attempts: 6, nextAction: "retrigger" });
+    });
+  },
+);
 
 // ---------------------------------------------------------------------------
 // Fresh install and upgrade keep shared hook behaviour and consumer-owned drivers
diff --git a/.bkit/core/engine/tools/instructions-coverage.test.ts b/.bkit/core/engine/tools/instructions-coverage.test.ts
index a5c52b466..b1f49860d 100644
--- a/.bkit/core/engine/tools/instructions-coverage.test.ts
+++ b/.bkit/core/engine/tools/instructions-coverage.test.ts
@@ -21,6 +21,7 @@ import {
   syncCoverage,
   type CorpusFile,
 } from "./instructions";
+import { localLimit } from "../../../../vitest.timeout-budget";
 
 const REPO_ROOT = path.resolve(__dirname, "../../../..");
 const STORE = fs.readFileSync(path.join(REPO_ROOT, ".bkit/instructions.md"), "utf-8");
@@ -332,11 +333,11 @@ describe("open review items", () => {
 });
 
 describe("the repo", () => {
-  it("has no coverage findings", { timeout: 60_000 }, () => {
+  it("has no coverage findings", { timeout: localLimit(60_000) }, () => {
     expect(checkCoverage(STORE, CORPUS)).toEqual([]);
   });
 
-  it("has no unreviewed near-alike entries", { timeout: 60_000 }, () => {
+  it("has no unreviewed near-alike entries", { timeout: localLimit(60_000) }, () => {
     expect(similarEntries(STORE)).toEqual([]);
   });
 
@@ -344,15 +345,23 @@ describe("the repo", () => {
     expect(openFits(STORE)).toEqual([]);
   });
 
-  it("every prompt carries verbatim each rule its carry line names", { timeout: 60_000 }, () => {
-    expect(checkCarry(STORE, CORPUS).missing).toEqual([]);
-  });
-
-  it("no prompt carries a bkit rule its carry line does not name", { timeout: 60_000 }, () => {
-    expect(checkCarry(STORE, CORPUS).undeclared).toEqual([]);
-  });
-
-  it("every prompt carries at least one rule", { timeout: 60_000 }, () => {
+  it(
+    "every prompt carries verbatim each rule its carry line names",
+    { timeout: localLimit(60_000) },
+    () => {
+      expect(checkCarry(STORE, CORPUS).missing).toEqual([]);
+    },
+  );
+
+  it(
+    "no prompt carries a bkit rule its carry line does not name",
+    { timeout: localLimit(60_000) },
+    () => {
+      expect(checkCarry(STORE, CORPUS).undeclared).toEqual([]);
+    },
+  );
+
+  it("every prompt carries at least one rule", { timeout: localLimit(60_000) }, () => {
     expect(checkCarry(STORE, CORPUS).empty).toEqual([]);
   });
 
diff --git a/.bkit/core/engine/tools/instructions.test.ts b/.bkit/core/engine/tools/instructions.test.ts
index 6f3b8d930..5add75bc5 100644
--- a/.bkit/core/engine/tools/instructions.test.ts
+++ b/.bkit/core/engine/tools/instructions.test.ts
@@ -21,7 +21,7 @@ import * as path from "node:path";
 
 import { describe, expect, it } from "vitest";
 
-import { loadFactor } from "../../../../vitest.timeout-budget";
+import { localLimit } from "../../../../vitest.timeout-budget";
 import {
   NEAR_COPY,
   SHARED_MIN,
@@ -54,9 +54,9 @@ import { substituteWorkflow } from "../render/trackers";
 
 /**
  * The whole-corpus cases' time limit: a 60s base for a CPU-bound scan of every agent-read
- * file, scaled by the load factor the tier budget uses (1 on CI).
+ * file, scaled by `localLimit` (1 under CI, else LOCAL_HANG_FACTOR).
  */
-const CORPUS_CASE = { timeout: Math.ceil(60_000 * loadFactor()) };
+const CORPUS_CASE = { timeout: localLimit(60_000) };
 
 const REPO_ROOT = path.resolve(__dirname, "../../../..");
 const STORE = fs.readFileSync(path.join(REPO_ROOT, ".bkit/instructions.md"), "utf-8");
diff --git a/scripts/ci/bkit-test-limits.mjs b/scripts/ci/bkit-test-limits.mjs
index 2ae06d4e9..404edac87 100644
--- a/scripts/ci/bkit-test-limits.mjs
+++ b/scripts/ci/bkit-test-limits.mjs
@@ -2,7 +2,7 @@
 /**
  * bkit-test-limits.mjs — the time limit for `node --test` and bats runs, taken from the Vitest
  * integration budget (`vitest.timeout-budget.ts`) so every runner bkit uses on itself shares one
- * number: 30s under CI, scaled by machine load elsewhere.
+ * number: 30s under CI, else 180s.
  */
 
 import { tierTimeouts } from "../../vitest.timeout-budget.ts";
diff --git a/scripts/ci/bkit-test-limits.test.mjs b/scripts/ci/bkit-test-limits.test.mjs
index dbf13bc17..b431a8aac 100644
--- a/scripts/ci/bkit-test-limits.test.mjs
+++ b/scripts/ci/bkit-test-limits.test.mjs
@@ -25,6 +25,7 @@ test("gives --test-timeout from the integration budget and --test-force-exit", (
   assert.equal(local.length, 2);
   assert.match(local[0], /^--test-timeout=\d+$/);
   assert.ok(Number(local[0].split("=")[1]) >= 30000, local[0]);
+  assert.equal(local[0], "--test-timeout=180000");
   assert.equal(local[1], "--test-force-exit");
 });
 
@@ -36,4 +37,5 @@ test("gives the bats limit in whole seconds, 30 under CI", (t) => {
   const local = withCi(t, undefined, () => batsTestTimeoutSeconds());
   assert.ok(Number.isInteger(local), String(local));
   assert.ok(local >= 30, String(local));
+  assert.equal(local, 180);
 });
diff --git a/tests/shell/setup_suite.bash b/tests/shell/setup_suite.bash
index 89266a81e..0cb9cdd81 100644
--- a/tests/shell/setup_suite.bash
+++ b/tests/shell/setup_suite.bash
@@ -16,7 +16,7 @@ BKIT_GUARDED_PATTERN='^(user\.(name|email)|core\.(bare|worktree))$'
 
 # Every bats test gets a time limit, so a hung test fails with `timeout after` and the run ends
 # (docs/testing.md § Time limits). node's runners pass BATS_TEST_TIMEOUT already; `pnpm bkit:test:bats`
-# runs no node code first. 30s under CI, else 180s (30s x MAX_LOAD_FACTOR 6 in vitest.timeout-budget.ts).
+# runs no node code first. 30s under CI, else 180s (30s x LOCAL_HANG_FACTOR 6 in vitest.timeout-budget.ts).
 setup_suite() {
   local var common
   if [ -n "${CI:-}" ]; then
diff --git a/vitest.config.ts b/vitest.config.ts
index e25cfb944..b9615d9d9 100644
--- a/vitest.config.ts
+++ b/vitest.config.ts
@@ -2,14 +2,9 @@ import * as path from "node:path";
 
 import { defineConfig } from "vitest/config";
 
-import { planUnitLoad, unitTimeouts } from "./vitest.timeout-budget.ts";
+import { unitTimeouts } from "./vitest.timeout-budget.ts";
 import { testWorkers } from "./vitest.test-lock.ts";
 
-// The 1-minute load average lags the load this run's workers are about to make, so the first
-// test files would get a budget for a quiet machine. Declare that load before any worker
-// starts; every budget read below and in vitest.setup.ts takes it as a floor.
-planUnitLoad();
-
 // `bkit tests run` hands every gate a folder in BKIT_TEST_REPORT_DIR and counts the
 // failing test cases in the JUnit files written there. One file per vitest process,
 // so the unit and integration runs of one gate never overwrite each other.
@@ -34,9 +29,8 @@ export default defineConfig({
     setupFiles: ["./vitest.setup.ts"],
     globalSetup: ["./vitest.test-lock.ts"],
     ...testWorkers(),
-    // Unit-tier limits scaled to the machine's load when the config loads. This spread is
-    // sampled ONCE; vitest.setup.ts re-reads the same budget as each test FILE starts, so a
-    // load ramp mid-run cannot starve late files past a stale limit.
+    // Unit-tier limits: strict under CI, a fixed multiple elsewhere (vitest.timeout-budget.ts).
+    // vitest.setup.ts re-applies the tier per test file.
     ...unitTimeouts(),
     ...junit,
     // Report-only coverage — dogfoods the bkit-stub:coverage scaffold shipped to
diff --git a/vitest.setup.ts b/vitest.setup.ts
index fff3555ac..2dee060cb 100644
--- a/vitest.setup.ts
+++ b/vitest.setup.ts
@@ -100,23 +100,12 @@ if (testPath.includes(`${path.sep}audits${path.sep}hooks${path.sep}`)) {
   });
 }
 
-// Budget: re-read once per test file from `vitest.timeout-budget.ts`, scaled by how
-// contended the machine is RIGHT NOW.
+// Budget: pick the tier's limits once per test file from `vitest.timeout-budget.ts`.
 //
-// WHY: both tiers spawn real subprocesses — `git`, `tsx`, the bkit CLI, fake
-// binaries — so a budget fixed when the run starts goes stale. The box ramps under
-// the run (a parallel agent session, a build), and a file that starts late runs
-// several times slower against a number read minutes earlier. That reads as a flaky
-// product but is only ever a starved subprocess: `Error: Test timed out in 5000ms`
-// on a DIFFERENT test each run, all green in isolation. Both tiers are pre-push gates
-// (.husky/pre-push -> bkit:gate:static-unit-integration), so that starvation blocks pushes
-// on a green tree, and `--no-verify` is prohibited (.agents/rules.md). See
-// docs/failures.jsonl `subprocess-integration-tests-time-out-at-5000ms-under-high-load`.
-//
-// setupFiles run once per test FILE, so `testPath` here is that file, and the
-// re-read lands as each file starts. The config's own `...unitTimeouts()` sampled
-// the same budget once at load; this overrides it per file. CI pins the factor to 1
-// (in `loadFactor`), so the gate stays strict there.
+// setupFiles run once per test FILE, so `testPath` here is that file: integration files get the
+// integration base, every other file the unit base. The config's own `...unitTimeouts()` sets
+// the unit default; this overrides it per file. The factor is fixed (1 under CI, else
+// LOCAL_HANG_FACTOR), so no load is read.
 vi.setConfig(tierTimeouts(testPath.endsWith(".integration.test.ts")));
 const { hookTimeout } = tierTimeouts(testPath.endsWith(".integration.test.ts"));
 
diff --git a/vitest.timeout-budget.ts b/vitest.timeout-budget.ts
index 8cdc1cf56..7ac5ecad0 100644
--- a/vitest.timeout-budget.ts
+++ b/vitest.timeout-budget.ts
@@ -1,70 +1,28 @@
-// vitest.timeout-budget.ts — this repo's per-test and per-hook time limits, scaled to how
-// overloaded the machine is when the run starts.
+// vitest.timeout-budget.ts — this repo's per-test and per-hook time limits.
 //
-// Mirror of a consumer's load-scaled timeout budget. The unit tier's limits
-// are sampled once, when `vitest.config.ts` loads; `vitest.setup.ts` re-reads them as each test
-// FILE starts, so a load ramp mid-run (a second agent session, a build) cannot starve late
-// files past a stale budget. CI pins the factor to 1, so the gate stays strict there (5s unit /
-// 30s integration) and a genuinely hung test still fails fast.
+// Two settings, no load reading:
+//   - CI (`CI=true` or `CI=1`): the strict bases below (5s test / 10s hook unit, 30s integration),
+//     so a genuinely hung test still fails fast on a runner we size.
+//   - Everywhere else: a fixed LOCAL_HANG_FACTOR (6) times those bases. A test that takes longer
+//     than that is hung, not starved by a busy laptop.
 //
-// Why it exists: both tiers spawn real subprocesses — `git`, `tsx`, the bkit CLI, fake
-// binaries — so wall time is a test's CPU cost multiplied by how many runnable processes share
-// each core. On a shared laptop that reads as a flaky product: `Error: Test timed out in
-// 5000ms` on a DIFFERENT test each run, all green in isolation (docs/failures.jsonl
-// `subprocess-integration-tests-time-out-at-5000ms-under-high-load`).
-import os from "node:os";
+// Why a multiple at all: both tiers spawn real subprocesses — `git`, `tsx`, the bkit CLI, fake
+// binaries — so on a shared laptop a test can take several times its idle wall time.
+// A fixed multiple keeps the limit the same on every run and reads nothing from the machine.
 
 export const UNIT_TEST_TIMEOUT_MS = 5_000;
 export const INTEGRATION_TEST_TIMEOUT_MS = 30_000;
 export const UNIT_HOOK_TIMEOUT_MS = 10_000;
-export const MAX_LOAD_FACTOR = 6;
+export const LOCAL_HANG_FACTOR = 6;
 
-/**
- * How many times longer than on an idle machine a CPU-bound test takes now: load average per
- * core, never below 1, never above MAX_LOAD_FACTOR. 1 on CI and where the platform reports no
- * load average.
- */
-export function loadFactor(
-  loadAverage: number = os.loadavg()[0] ?? 0,
-  cores: number = os.availableParallelism(),
-  env: NodeJS.ProcessEnv = process.env,
-): number {
-  // CI keeps the strict gate: a runner is a machine we size, so a test that takes longer there
-  // is slow, not starved. Only a shared laptop's load scales the limits.
-  if (env.CI === "true" || env.CI === "1") return 1;
-  const measured =
-    !Number.isFinite(loadAverage) || !Number.isFinite(cores) || cores < 1 ? 0 : loadAverage / cores;
-  // A runner that plans its own parallel load exports the per-core figure it fits; the reading
-  // above alone sees a quiet machine before that load has built up.
-  const planned = Number(env.UNIT_PLANNED_LOAD_PER_CORE);
-  return Math.min(MAX_LOAD_FACTOR, Math.max(1, measured, Number.isFinite(planned) ? planned : 0));
-}
-
-/**
- * The load per core a run makes once its workers start: the load now plus one core per worker
- * (the cost the copied model gives a test worker, an estimate), over the cores.
- */
-export function plannedLoadPerCore(
-  workers: number,
-  loadAverage: number = os.loadavg()[0] ?? 0,
-  cores: number = os.availableParallelism(),
-): number {
-  return (loadAverage + workers) / cores;
+/** 1 under CI (`CI=true` or `CI=1`), else LOCAL_HANG_FACTOR. */
+export function limitFactor(env: NodeJS.ProcessEnv = process.env): number {
+  return env.CI === "true" || env.CI === "1" ? 1 : LOCAL_HANG_FACTOR;
 }
 
-/**
- * Export UNIT_PLANNED_LOAD_PER_CORE for this run's workers, which inherit it, unless a caller
- * already set it. `workers` defaults to vitest's own run default, a worker per core but one,
- * which is also the worker count a single-slot tests lock hands out. Returns the value in force.
- */
-export function planUnitLoad(
-  env: NodeJS.ProcessEnv = process.env,
-  loadAverage: number = os.loadavg()[0] ?? 0,
-  cores: number = os.availableParallelism(),
-  workers: number = Math.max(cores - 1, 1),
-): string {
-  env.UNIT_PLANNED_LOAD_PER_CORE ??= plannedLoadPerCore(workers, loadAverage, cores).toFixed(2);
-  return env.UNIT_PLANNED_LOAD_PER_CORE;
+/** A limit a test file sets itself, in ms: unchanged under CI, LOCAL_HANG_FACTOR times it elsewhere. */
+export function localLimit(ms: number, factor: number = limitFactor()): number {
+  return Math.ceil(ms * factor);
 }
 
 /**
@@ -73,32 +31,24 @@ export function planUnitLoad(
  */
 export function tierTimeouts(
   integration: boolean,
-  factor: number = loadFactor(),
+  factor: number = limitFactor(),
 ): { testTimeout: number; hookTimeout: number } {
   return {
-    testTimeout: Math.ceil(
-      (integration ? INTEGRATION_TEST_TIMEOUT_MS : UNIT_TEST_TIMEOUT_MS) * factor,
+    testTimeout: localLimit(
+      integration ? INTEGRATION_TEST_TIMEOUT_MS : UNIT_TEST_TIMEOUT_MS,
+      factor,
     ),
-    hookTimeout: Math.ceil(
-      (integration ? INTEGRATION_TEST_TIMEOUT_MS : UNIT_HOOK_TIMEOUT_MS) * factor,
+    hookTimeout: localLimit(
+      integration ? INTEGRATION_TEST_TIMEOUT_MS : UNIT_HOOK_TIMEOUT_MS,
+      factor,
     ),
   };
 }
 
-/**
- * The unit tier's budget for the config, scaled by `factor`. Logs one line per config load when
- * the factor is above 1, so a timeout under load can be read against the budget in force.
- */
-export function unitTimeouts(factor: number = loadFactor()): {
+/** The unit tier's budget for the config, scaled by `factor`. */
+export function unitTimeouts(factor: number = limitFactor()): {
   testTimeout: number;
   hookTimeout: number;
 } {
-  const budget = tierTimeouts(false, factor);
-  if (factor > 1) {
-    console.warn(
-      `[test-timeout-budget] load average ${os.loadavg()[0]?.toFixed(1)} on ${os.availableParallelism()} cores: ` +
-        `unit limits ${budget.testTimeout}ms per test, ${budget.hookTimeout}ms per hook (x${factor.toFixed(2)})`,
-    );
-  }
-  return budget;
+  return tierTimeouts(false, factor);
 }
