diff --git a/.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts b/.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts
new file mode 100644
index 000000000..dc6d9e375
--- /dev/null
+++ b/.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts
@@ -0,0 +1,44 @@
+// audits/repo/vitest-child-deadline.integration.test.ts — a Vitest worker stops a hung
+// synchronous child at the running test's own timeout.
+//
+// A nested `vitest run` loads the repo's real vitest.setup.ts and runs one test that blocks on
+// a `sleep 30` child with a 2s test timeout. Without the setup's child limit the nested run
+// sits in the call for 30s.
+
+import { spawnSync } from "node:child_process";
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+import { afterEach, expect, it } from "vitest";
+
+const ROOT = process.cwd();
+const temps: string[] = [];
+
+afterEach(() => {
+  for (const dir of temps.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
+});
+
+it("fails a test whose spawnSync child hangs within the test's own timeout", () => {
+  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-child-deadline-"));
+  temps.push(dir);
+  fs.writeFileSync(
+    path.join(dir, "vitest.config.mjs"),
+    `export default { test: { globals: true, include: ["hang.test.mjs"], testTimeout: 2000, hookTimeout: 5000, setupFiles: [${JSON.stringify(path.join(ROOT, "vitest.setup.ts"))}] } };\n`,
+  );
+  fs.writeFileSync(
+    path.join(dir, "hang.test.mjs"),
+    `import { spawnSync } from "node:child_process";\nit("hangs on a child", () => {\n  spawnSync("sleep", ["30"]);\n});\n`,
+  );
+  const started = Date.now();
+  const run = spawnSync(
+    path.join(ROOT, "node_modules/.bin/vitest"),
+    ["run", "--root", dir, "--config", path.join(dir, "vitest.config.mjs")],
+    { cwd: ROOT, encoding: "utf-8", timeout: 25_000, env: { ...process.env, CI: "1" } },
+  );
+  const output = `${run.stdout}${run.stderr}`;
+  expect(run.error, output).toBeUndefined();
+  expect(Date.now() - started).toBeLessThan(20_000);
+  expect(run.status).not.toBe(0);
+  expect(output).toContain("sleep");
+  expect(output).toMatch(/30/);
+});
diff --git a/.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts b/.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts
new file mode 100644
index 000000000..90cd1485b
--- /dev/null
+++ b/.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts
@@ -0,0 +1,66 @@
+// audits/repo/vitest-child-deadline.test.ts — `withChildDeadline` (vitest.child-deadline.ts)
+// gives a synchronous child call the running test's remaining time when the caller set none.
+//
+// Each probe wraps a copy of the real `node:child_process` functions and runs a real
+// `sleep 30` child, so a missing limit shows as the call blocking, not as a mocked value.
+
+import * as childProcess from "node:child_process";
+import { describe, expect, it } from "vitest";
+import { withChildDeadline } from "../../../../../vitest.child-deadline.ts";
+
+function wrapped(remainingMs: () => number) {
+  const target = {
+    spawnSync: childProcess.spawnSync,
+    execSync: childProcess.execSync,
+    execFileSync: childProcess.execFileSync,
+  };
+  withChildDeadline(target as unknown as typeof childProcess, remainingMs);
+  return target;
+}
+
+describe("withChildDeadline", () => {
+  it("stops a spawnSync with no timeout at the remaining time and names it", () => {
+    const cp = wrapped(() => 300);
+    const started = Date.now();
+    let message = "";
+    try {
+      cp.spawnSync("sleep", ["30"]);
+    } catch (error) {
+      message = (error as Error).message;
+    }
+    expect(Date.now() - started).toBeLessThan(10_000);
+    expect(message).toContain("sleep");
+    expect(message).toContain("30");
+    expect(message).toMatch(/\b300\s*ms/);
+  });
+
+  it("leaves an explicit timeout as the caller set it", () => {
+    const cp = wrapped(() => 60_000);
+    const started = Date.now();
+    const result = cp.spawnSync("sleep", ["30"], { timeout: 200 });
+    expect(Date.now() - started).toBeLessThan(10_000);
+    expect(result.error).toBeDefined();
+    expect((result.error as NodeJS.ErrnoException).code).toBe("ETIMEDOUT");
+  });
+
+  it("limits execSync and execFileSync the same way", () => {
+    const cp = wrapped(() => 300);
+    const started = Date.now();
+    expect(() => cp.execSync("sleep 30")).toThrow(/sleep 30/);
+    expect(() => cp.execFileSync("sleep", ["30"])).toThrow(/sleep/);
+    expect(Date.now() - started).toBeLessThan(10_000);
+  });
+
+  it("uses at least 1ms when the limit has already passed", () => {
+    const cp = wrapped(() => -50);
+    const started = Date.now();
+    let message = "";
+    try {
+      cp.spawnSync("sleep", ["30"]);
+    } catch (error) {
+      message = (error as Error).message;
+    }
+    expect(Date.now() - started).toBeLessThan(10_000);
+    expect(message).toMatch(/\b1\s*ms/);
+  });
+});
diff --git a/vitest.child-deadline.ts b/vitest.child-deadline.ts
new file mode 100644
index 000000000..690d8d78d
--- /dev/null
+++ b/vitest.child-deadline.ts
@@ -0,0 +1,68 @@
+// vitest.child-deadline.ts — gives a synchronous child call the running test's remaining time.
+//
+// bkit-only (not shipped). `spawnSync`, `execSync` and `execFileSync` block the worker's event
+// loop, so Vitest's own test timeout cannot fire while a child hangs. When the caller passes no
+// `timeout`, the wrapper sets one to the time the running test has left; if that limit ends the
+// child, the call throws an Error naming the command, its arguments and the limit. A `timeout`
+// the caller set is passed through untouched. No dependency on vitest: `vitest.setup.ts`
+// supplies the remaining-time function.
+import type * as ChildProcess from "node:child_process";
+
+type Fn = (...args: unknown[]) => unknown;
+type Options = { timeout?: number } & Record<string, unknown>;
+
+function isOptions(value: unknown): value is Options {
+  return typeof value === "object" && value !== null && !Array.isArray(value);
+}
+
+function describeCall(command: unknown, args: unknown, limitMs: number): string {
+  const argList = Array.isArray(args) ? ` ${args.map(String).join(" ")}` : "";
+  return `${String(command)}${argList} did not finish within ${limitMs} ms (the running test's remaining time)`;
+}
+
+/** Wrap the three synchronous child functions on `childProcess` in place. */
+export function withChildDeadline(
+  childProcess: typeof ChildProcess,
+  remainingMs: () => number,
+): void {
+  const target = childProcess as unknown as Record<string, Fn>;
+
+  function wrap(name: "spawnSync" | "execSync" | "execFileSync", hasArgs: boolean): void {
+    const original = target[name];
+    if (typeof original !== "function") return;
+    target[name] = function (this: unknown, ...callArgs: unknown[]): unknown {
+      // Options sit last: after the command (execSync) or the argument list (the others).
+      const optIndex = callArgs.findIndex((value, index) => index > 0 && isOptions(value));
+      const existing = optIndex >= 0 ? (callArgs[optIndex] as Options) : undefined;
+      if (existing && existing.timeout !== undefined) return original.apply(this, callArgs);
+      const limitMs = Math.max(1, Math.floor(remainingMs()));
+      const next = [...callArgs];
+      if (existing) {
+        next[optIndex] = { ...existing, timeout: limitMs };
+      } else {
+        // Without options the slot after the command (and its arg list) is free.
+        const slot = hasArgs && Array.isArray(callArgs[1]) ? 2 : 1;
+        next[slot] = { timeout: limitMs };
+      }
+      const args = hasArgs ? callArgs[1] : undefined;
+      let result: unknown;
+      try {
+        result = original.apply(this, next);
+      } catch (error) {
+        if ((error as NodeJS.ErrnoException | undefined)?.code === "ETIMEDOUT") {
+          throw new Error(describeCall(callArgs[0], args, limitMs), { cause: error });
+        }
+        throw error;
+      }
+      const err = (result as { error?: NodeJS.ErrnoException } | undefined)?.error;
+      if (name === "spawnSync" && err?.code === "ETIMEDOUT") {
+        throw new Error(describeCall(callArgs[0], args, limitMs), { cause: err });
+      }
+      return result;
+    };
+  }
+
+  wrap("spawnSync", true);
+  wrap("execSync", false);
+  wrap("execFileSync", true);
+}
diff --git a/vitest.setup.ts b/vitest.setup.ts
index da4feabcf..6af9a85c0 100644
--- a/vitest.setup.ts
+++ b/vitest.setup.ts
@@ -1,15 +1,20 @@
 // vitest.setup.ts — runs in every test worker before its test files load.
 //
-// Four jobs: strip inherited git environment variables (below), fail any test that
+// Five jobs: strip inherited git environment variables (below), fail any test that
 // changes the git identity or core.bare of the repo the suite runs from, point the bkit
 // config and cache folders at an empty temp folder, and re-read the load-scaled test
-// budget as each test file starts (bottom, via vitest.timeout-budget.ts).
+// budget as each test file starts (bottom, via vitest.timeout-budget.ts), and give every
+// synchronous child call that sets no `timeout` the running test's remaining time, so a hung
+// child fails the test instead of blocking the worker (vitest.child-deadline.ts).
 //
 // `globals` is not enabled in vitest.config.ts, so these are imported, not free.
+import childProcess from "node:child_process";
+import { syncBuiltinESMExports } from "node:module";
 import * as os from "node:os";
 import * as path from "node:path";
-import { afterAll, afterEach, expect, vi } from "vitest";
+import { afterAll, afterEach, beforeEach, expect, vi } from "vitest";
 
+import { withChildDeadline } from "./vitest.child-deadline.ts";
 import { guardRepoConfig, repoConfigFile } from "./vitest.repo-config-guard.ts";
 import { tierTimeouts } from "./vitest.timeout-budget.ts";
 
@@ -95,7 +100,24 @@ process.env.XDG_CACHE_HOME = path.join(xdg, "cache");
 // re-read lands as each file starts. The config's own `...unitTimeouts()` sampled
 // the same budget once at load; this overrides it per file. CI pins the factor to 1
 // (in `loadFactor`), so the gate stays strict there.
-vi.setConfig(tierTimeouts(testPath.endsWith(".integration.test.ts")));
+const budget = tierTimeouts(testPath.endsWith(".integration.test.ts"));
+vi.setConfig(budget);
+
+// Child limit: a synchronous child call blocks the worker, so Vitest's test timeout cannot fire
+// during it. Each call without its own `timeout` gets the running test's remaining time; outside
+// a test (file-level code, hooks) it gets the file's hook timeout.
+let testDeadline: number | undefined;
+beforeEach((ctx) => {
+  const limit = ctx.task.timeout;
+  testDeadline = Date.now() + (limit > 0 ? limit : budget.hookTimeout);
+});
+afterEach(() => {
+  testDeadline = undefined;
+});
+withChildDeadline(childProcess, () =>
+  testDeadline === undefined ? budget.hookTimeout : testDeadline - Date.now(),
+);
+syncBuiltinESMExports();
 
 // Every test runs as on a laptop: GitHub Actions sets `GITHUB_ACTIONS` and `CI`, and the
 // engine reads those (and the cloud markers) as "headless, nobody to ask"
