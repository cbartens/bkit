diff --git a/.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts b/.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts
index dc6d9e375..e7ac24b64 100644
--- a/.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts
+++ b/.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts
@@ -37,8 +37,84 @@ it("fails a test whose spawnSync child hangs within the test's own timeout", ()
   );
   const output = `${run.stdout}${run.stderr}`;
   expect(run.error, output).toBeUndefined();
-  expect(Date.now() - started).toBeLessThan(20_000);
+  expect(Date.now() - started).toBeLessThan(9_000);
   expect(run.status).not.toBe(0);
   expect(output).toContain("sleep");
   expect(output).toMatch(/30/);
 });
+
+it("gives a file's afterEach child call the hook timeout after a test that used most of its time", () => {
+  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-child-deadline-hook-"));
+  temps.push(dir);
+  fs.writeFileSync(
+    path.join(dir, "vitest.config.mjs"),
+    `export default { test: { globals: true, include: ["hook.test.mjs"], testTimeout: 5000, hookTimeout: 10000, setupFiles: [${JSON.stringify(path.join(ROOT, "vitest.setup.ts"))}] } };\n`,
+  );
+  fs.writeFileSync(
+    path.join(dir, "hook.test.mjs"),
+    `import { spawnSync } from "node:child_process";\nafterEach(() => {\n  spawnSync("sleep", ["2"]);\n});\nit("uses most of its time", () => {\n  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 4000);\n});\n`,
+  );
+  const run = spawnSync(
+    path.join(ROOT, "node_modules/.bin/vitest"),
+    ["run", "--root", dir, "--config", path.join(dir, "vitest.config.mjs")],
+    { cwd: ROOT, encoding: "utf-8", timeout: 40_000, env: { ...process.env, CI: "1" } },
+  );
+  const output = `${run.stdout}${run.stderr}`;
+  expect(run.error, output).toBeUndefined();
+  expect(output).not.toContain("did not finish within");
+  expect(run.status, output).toBe(0);
+});
+
+function nestedRun(name: string, body: string, testTimeout: number, hookTimeout: number) {
+  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-child-deadline-nested-"));
+  temps.push(dir);
+  fs.writeFileSync(
+    path.join(dir, "vitest.config.mjs"),
+    `export default { test: { globals: true, include: ["${name}.test.mjs"], testTimeout: ${testTimeout}, hookTimeout: ${hookTimeout}, setupFiles: [${JSON.stringify(path.join(ROOT, "vitest.setup.ts"))}] } };\n`,
+  );
+  fs.writeFileSync(path.join(dir, `${name}.test.mjs`), body);
+  const run = spawnSync(
+    path.join(ROOT, "node_modules/.bin/vitest"),
+    ["run", "--root", dir, "--config", path.join(dir, "vitest.config.mjs")],
+    { cwd: ROOT, encoding: "utf-8", timeout: 40_000, env: { ...process.env, CI: "1" } },
+  );
+  return { run, output: `${run.stdout}${run.stderr}` };
+}
+
+it("gives an async afterEach child call the hook timeout after an await", () => {
+  const { run, output } = nestedRun(
+    "asynchook",
+    `import { spawnSync } from "node:child_process";\nafterEach(async () => {\n  await new Promise((r) => setTimeout(r, 10));\n  spawnSync("sleep", ["2"]);\n});\nit("uses most of its time", () => {\n  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 4000);\n});\n`,
+    5000,
+    10000,
+  );
+  expect(run.error, output).toBeUndefined();
+  expect(output).not.toContain("did not finish within");
+  expect(run.status, output).toBe(0);
+});
+
+it("does not take a slow beforeEach off the test body's child limit", () => {
+  const { run, output } = nestedRun(
+    "slowbefore",
+    `import { spawnSync } from "node:child_process";\nbeforeEach(() => {\n  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 4000);\n});\nit("body child after a slow beforeEach", () => {\n  spawnSync("sleep", ["3"]);\n});\n`,
+    5000,
+    10000,
+  );
+  expect(run.error, output).toBeUndefined();
+  expect(output).not.toContain("did not finish within");
+  expect(run.status, output).toBe(0);
+});
+
+it("counts the body's child limit from when the body starts, not from its first child call", () => {
+  const started = Date.now();
+  const { run, output } = nestedRun(
+    "awaitthenhang",
+    `import { spawnSync } from "node:child_process";\nit("awaits then hangs on a child", async () => {\n  await new Promise((r) => setTimeout(r, 3000));\n  spawnSync("sleep", ["30"]);\n});\n`,
+    5000,
+    10000,
+  );
+  expect(run.error, output).toBeUndefined();
+  expect(Date.now() - started).toBeLessThan(5000 + 3000);
+  expect(run.status).not.toBe(0);
+  expect(output).toContain("did not finish within");
+});
diff --git a/.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts b/.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts
index 56f7ff820..59d6447c9 100644
--- a/.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts
+++ b/.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts
@@ -63,4 +63,18 @@ describe("withChildDeadline", () => {
     expect(Date.now() - started).toBeLessThan(10_000);
     expect(message).toMatch(/\b1\s*ms/);
   });
+
+  it("stops a child that ignores SIGTERM at the remaining time", () => {
+    const cp = wrapped(() => 300);
+    const started = Date.now();
+    let message = "";
+    try {
+      cp.spawnSync("sh", ["-c", "trap '' TERM; sleep 30"]);
+    } catch (error) {
+      message = (error as Error).message;
+    }
+    expect(Date.now() - started).toBeLessThan(10_000);
+    expect(message).toContain("did not finish within");
+    expect(message).toMatch(/\b300\s*ms/);
+  });
 });
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 8df000161..d622facfc 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -306,3 +306,7 @@
 {"schema":3,"ts":1794476033973,"firstTs":1794476033973,"updates":1,"kind":"deferral","key":"918-ad-hoc-agent-challenge-low-bkit-core-engine-commands-workflow-tracker-ts-2026","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["918-ad-hoc-agent"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"An ad-hoc agent passes --kind=audit --audit-slug=x/../../.. --body-file=notes.md (a file at the repo root) and the run-proof guard accepts it, because the audit proof joins an unvalidated slug into the outbox path; only buildComment's later slug check stops the body today","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/tracker.ts:2026: An ad-hoc agent passes --kind=audit --audit-slug=x/../../.. --body-file=notes.md (a file at the repo root) and the run-proof guard accepts it, because the audit proof joins an unvalidated slug into the outbox path; only buildComment's later slug check stops the body today. Done when: commentRunProof returns null unless --audit-slug matches ^[a-z0-9-]+$ before the slug is joined into <outbox>/audit-{slug}, as the plan's Architecture commentRunProof \"audit\" bullet specifies; a path-traversing slug is refused by the guard itself with the \"workflow steps only\" message, not by the later \"--kind=audit needs --audit-slug\" usage error.","source":".bkit/core/engine/commands/workflow/tracker.ts:2026"}
 {"schema":3,"ts":1794476033974,"firstTs":1794476033974,"updates":1,"kind":"deferral","key":"918-ad-hoc-agent-challenge-low-bkit-core-engine-commands-workflow-tracker-ts-2019","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["918-ad-hoc-agent"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"An ad-hoc caller passes --kind=audit --audit-slug=x/../../.. --body-file=agenda.md and the audit run proof accepts it, because the unvalidated slug walks audit-{slug} up out of the outbox to the repo root","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/tracker.ts:2019: An ad-hoc caller passes --kind=audit --audit-slug=x/../../.. --body-file=agenda.md and the audit run proof accepts it, because the unvalidated slug walks audit-{slug} up out of the outbox to the repo root. Done when: commentRunProof returns \"audit\" only when --audit-slug matches ^[a-z0-9-]+$ (the allowlist the plan's Architecture section for tracker.ts names and buildComment already applies at .bkit/core/engine/commands/workflow/issues.ts:846), so a traversal slug is refused by the guard itself with the \"workflow steps only\" message instead of relying on the later buildComment slug check to stop the comment","source":".bkit/core/engine/commands/workflow/tracker.ts:2019"}
 {"schema":3,"ts":1794476033975,"firstTs":1794476033975,"updates":1,"kind":"deferral","key":"918-ad-hoc-agent-challenge-low-docs-security-md-62","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["918-ad-hoc-agent"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"docs/security.md says an ad-hoc agent \"cannot post\" a marked comment, yet any agent passes the guard with a guessed --session-dir=.git/bkit-outbox/sessions/x (the folder need not exist) or a committed status.jsonl, so a reviewer relying on the doc treats a speed bump as a boundary","description":"LOW build challenge finding at docs/security.md:62: docs/security.md says an ad-hoc agent \"cannot post\" a marked comment, yet any agent passes the guard with a guessed --session-dir=.git/bkit-outbox/sessions/x (the folder need not exist) or a committed status.jsonl, so a reviewer relying on the doc treats a speed bump as a boundary. Done when: § Workflow comment ownership states the refusal as a misuse guard, not an authorization boundary: it says the proofs (a path under the Git-common bkit-outbox/sessions/, a run status.jsonl, an audit outbox body file) can be supplied by any local caller, and that the marker carries no provenance, matching the plan's own Assumption (\"The guard is a speed bump\")","source":"docs/security.md:62"}
+{"schema":3,"ts":1794560264035,"firstTs":1794560264035,"updates":1,"kind":"deferral","key":"929-hung-test-never-challenge-low-vitest-child-deadline-ts-54","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["929-hung-test-never"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A hung `execSync` or `spawnSync` that the wrapper stops throws a bare `Error`, so a caller or test that reads `error.stdout`, `error.stderr` or `error.status` to show what the child printed before it hung gets `undefined`","description":"LOW build challenge finding at vitest.child-deadline.ts:54: A hung `execSync` or `spawnSync` that the wrapper stops throws a bare `Error`, so a caller or test that reads `error.stdout`, `error.stderr` or `error.status` to show what the child printed before it hung gets `undefined`. Done when: the thrown limit error keeps the message naming the command and limit, and also carries the child's `stdout`, `stderr`, `status`, `signal` and `pid` (from the execSync error or the spawnSync result), so the partial output of the hung child stays readable on the error itself, not only on `cause`.","source":"vitest.child-deadline.ts:54"}
+{"schema":3,"ts":1794560264036,"firstTs":1794560264036,"updates":1,"kind":"deferral","key":"929-hung-test-never-challenge-low-vitest-child-deadline-ts-39","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["929-hung-test-never"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A test declared with `{ timeout: Infinity }` (a Vitest-supported value) makes every child call it runs throw `ERR_OUT_OF_RANGE` (\"must be an unsigned integer. Received Infinity\") instead of running","description":"LOW build challenge finding at vitest.child-deadline.ts:39: A test declared with `{ timeout: Infinity }` (a Vitest-supported value) makes every child call it runs throw `ERR_OUT_OF_RANGE` (\"must be an unsigned integer. Received Infinity\") instead of running. Done when: a non-finite remaining time (or one above the largest value `spawnSync` accepts) is clamped to a valid unsigned integer, or no `timeout` is injected for it, so a child call under an unbounded test runs to completion; no repo test sets `timeout: Infinity` today.","source":"vitest.child-deadline.ts:39"}
+{"schema":3,"ts":1794560264037,"firstTs":1794560264037,"updates":1,"kind":"deferral","key":"929-hung-test-never-challenge-low-tests-shell-setup-suite-bash-22","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["929-hung-test-never"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A developer shell that exports `CI=false` or `CI=0` gets the strict 30s bats limit from `tests/shell/setup_suite.bash`, while `vitest.timeout-budget.ts` (`env.CI === \"true\" || env.CI === \"1\"`) treats the same shell as local and scales the other runners, so bats tests under load fail on `timeout after` alone","description":"LOW build challenge finding at tests/shell/setup_suite.bash:22: A developer shell that exports `CI=false` or `CI=0` gets the strict 30s bats limit from `tests/shell/setup_suite.bash`, while `vitest.timeout-budget.ts` (`env.CI === \"true\" || env.CI === \"1\"`) treats the same shell as local and scales the other runners, so bats tests under load fail on `timeout after` alone. Done when: `setup_suite()` picks the 30s limit only for `CI=true` or `CI=1`, the same values `loadFactor` reads as CI, and 180s for any other value or none.","source":"tests/shell/setup_suite.bash:22"}
+{"schema":3,"ts":1794560264038,"firstTs":1794560264038,"updates":1,"kind":"deferral","key":"929-hung-test-never-challenge-low-skills-lock-json-35","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["929-hung-test-never"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"The skill lock drops its integrity hash for find-skills, so a changed or tampered upstream copy of that agent-read skill can no longer be detected, and the next setup check re-fetches it from an unpinned upstream","description":"LOW build challenge finding at skills-lock.json:35: The skill lock drops its integrity hash for find-skills, so a changed or tampered upstream copy of that agent-read skill can no longer be detected, and the next setup check re-fetches it from an unpinned upstream. Done when: every entry in skills-lock.json, including find-skills, carries a nonempty 64-hex computedHash produced by the skills installer (re-run `npx skills add vercel-labs/skills@find-skills -y` and keep the installer output), as .agents/skills.md § Install / Update step 2 requires","source":"skills-lock.json:35"}
diff --git a/docs/testing.md b/docs/testing.md
index 26bed1fad..16b58d0a5 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -553,7 +553,7 @@ Manual host-hook compatibility experiments live in [`tests/experiments/hooks/`](
 - **Runner:** Vitest 5 (`pnpm test` → `vitest run`). Shell: bats (`pnpm bkit:test:bats`). Harvest: `node:test` (`pnpm test:harvest`).
 - **Raw Vitest:** `vitest.test-lock.ts` makes heavy root runs queue for the machine-wide `tests` lock in global setup; runs filtered entirely to existing files, watch mode, CI and nested runs with a live owner bypass acquisition. The lock script keeps its 60-second default wait without a TTY and honours an inherited wait budget. `BKIT_TEST_WORKERS` supplies a positive worker limit when set.
 - **One test file:** `pnpm bkit:test:file {file}` → `scripts/ci/bkit-test-file.mjs` picks the runner by file type (`.bats` → bats, `.mjs` → `node --test`, else Vitest); JUnit report only when `$BKIT_TEST_REPORT` is set.
-- **Time limits:** the Vitest per-test and per-hook budgets (`vitest.timeout-budget.ts`) also cap synchronous child calls (`vitest.child-deadline.ts`). `node --test` runs get `--test-timeout` and `--test-force-exit` from `scripts/ci/bkit-test-limits.mjs`, derived from the integration budget (30s under CI). Bats gets `BATS_TEST_TIMEOUT` from the same source, or from `tests/shell/setup_suite.bash` for `pnpm bkit:test:bats`. A limit kills only the direct child, so a grandchild it started can outlive the run. `patches/bats@1.13.0.patch` fixes two bats 1.13.0 defects: `bats-exec-test` declared the watchdog pid with `declare -r` inside a function, so a failing test could not stop its watchdog and waited out the whole limit; `bin/bats` ran `env` on a path that pnpm's patched-package directory name makes look like an assignment.
+- **Time limits:** the Vitest per-test and per-hook budgets (`vitest.timeout-budget.ts`) also cap synchronous child calls (`vitest.child-deadline.ts`): a call with no `timeout` gets, from a test body, the test's timeout counted from when the body starts (`beforeEach` time is not taken off it; time the body spent before the call is), and, from a file's own `beforeEach` / `afterEach` hook (read from the hook state Vitest records on the running test, so it holds across an `await`), the test's remaining time but never less than the hook timeout so cleanup is not cut short, and is ended with SIGKILL (unless the caller sets `killSignal`) so a child that ignores SIGTERM cannot outlast it. `node --test` runs get `--test-timeout` and `--test-force-exit` from `scripts/ci/bkit-test-limits.mjs`, derived from the integration budget (30s under CI). Bats gets `BATS_TEST_TIMEOUT` from the same source, or from `tests/shell/setup_suite.bash` for `pnpm bkit:test:bats`. A limit kills only the direct child, so a grandchild it started can outlive the run. `patches/bats@1.13.0.patch` fixes two bats 1.13.0 defects: `bats-exec-test` declared the watchdog pid with `declare -r` inside a function, so a failing test could not stop its watchdog and waited out the whole limit; `bin/bats` ran `env` on a path that pnpm's patched-package directory name makes look like an assignment.
 - **Changed files:** `pnpm bkit:gate:changed {file}...` holds the `tests` lock through `scripts/ci/bkit-machine-lock.sh` and passes the file arguments to `scripts/gate/bkit-gate-changed.mjs`, which `bkit tests changed` calls for build and debug agents: `vitest related --run` on the changed files, every test file that names a changed path (Vitest, `node --test` or bats by file type), Oxlint on changed engine `.ts`, Prettier on every changed file, and `pnpm typecheck` when a `.ts` file changed. Runs every stage, and exits 1 when any fails.
 - **Test gates:** `bkit:gate:static-unit`, `bkit:gate:static-unit-integration` and `bkit:gate:install-static-unit-build` hold the same `tests` lock for their whole run. A nested gate inherits its parent's live lock owner and runs unlocked.
 - **Test files** sit next to the file they test under `.bkit/core/engine/`; tests that read shipped text (workflows, templates, hooks, this repo's own docs and ledgers) sit in `.bkit/core/engine/audits/{workflows,templates,hooks,repo}/`. `tests/` holds automated shell tests in `shell/`, reusable inputs in `fixtures/` and manual research in `experiments/{compression,hooks}/`. Experiments keep reports in `reports/`, illustrations in `assets/` and preserved observations in dated `results/` folders.
diff --git a/vitest.child-deadline.ts b/vitest.child-deadline.ts
index 6cfa292f2..e55a6fa99 100644
--- a/vitest.child-deadline.ts
+++ b/vitest.child-deadline.ts
@@ -3,7 +3,7 @@
 // bkit-only (not shipped). `spawnSync`, `execSync` and `execFileSync` block the worker's event
 // loop, so Vitest's own test timeout cannot fire while a child hangs. When the caller passes no
 // `timeout`, the wrapper sets one to the time the running test has left; if that limit ends the
-// child, the call throws an Error naming the command, its arguments and the limit. A `timeout`
+// child, SIGKILL ends it (a child that traps SIGTERM cannot outlive the limit) unless the caller set `killSignal`, and the call throws an Error naming the command, its arguments and the limit. A `timeout`
 // the caller set is passed through untouched. No dependency on vitest: `vitest.setup.ts`
 // supplies the remaining-time function.
 
@@ -15,7 +15,7 @@ export type ChildFunctions = {
   execSync(...args: unknown[]): unknown;
   execFileSync(...args: unknown[]): unknown;
 };
-type Options = { timeout?: number } & Record<string, unknown>;
+type Options = { timeout?: number; killSignal?: unknown } & Record<string, unknown>;
 
 function isOptions(value: unknown): value is Options {
   return typeof value === "object" && value !== null && !Array.isArray(value);
@@ -39,11 +39,15 @@ export function withChildDeadline(target: ChildFunctions, remainingMs: () => num
       const limitMs = Math.max(1, Math.floor(remainingMs()));
       const next = [...callArgs];
       if (existing) {
-        next[optIndex] = { ...existing, timeout: limitMs };
+        next[optIndex] = {
+          ...existing,
+          timeout: limitMs,
+          killSignal: existing.killSignal ?? "SIGKILL",
+        };
       } else {
         // Without options the slot after the command (and its arg list) is free.
         const slot = hasArgs && Array.isArray(callArgs[1]) ? 2 : 1;
-        next[slot] = { timeout: limitMs };
+        next[slot] = { timeout: limitMs, killSignal: "SIGKILL" };
       }
       const args = hasArgs ? callArgs[1] : undefined;
       let result: unknown;
diff --git a/vitest.setup.ts b/vitest.setup.ts
index 9c2d33e73..8c903cd1c 100644
--- a/vitest.setup.ts
+++ b/vitest.setup.ts
@@ -12,7 +12,7 @@ import childProcess from "node:child_process";
 import { syncBuiltinESMExports } from "node:module";
 import * as os from "node:os";
 import * as path from "node:path";
-import { afterAll, afterEach, beforeEach, expect, vi } from "vitest";
+import { afterAll, afterEach, beforeEach, expect, type Task, vi } from "vitest";
 
 import { withChildDeadline } from "./vitest.child-deadline.ts";
 import { guardRepoConfig, repoConfigFile } from "./vitest.repo-config-guard.ts";
@@ -104,19 +104,57 @@ vi.setConfig(tierTimeouts(testPath.endsWith(".integration.test.ts")));
 const { hookTimeout } = tierTimeouts(testPath.endsWith(".integration.test.ts"));
 
 // Child limit: a synchronous child call blocks the worker, so Vitest's test timeout cannot fire
-// during it. Each call without its own `timeout` gets the running test's remaining time; outside
-// a test (file-level code, hooks) it gets the file's hook timeout.
+// during it. Each call without its own `timeout` gets a limit from where it runs, read from the
+// hook state Vitest records on the running test (`task.result.hooks`, set to "run" while a
+// `beforeEach` / `afterEach` hook runs, and kept across an `await`):
+//   - in an each-hook (the file's own `beforeEach` / `afterEach`): the test's remaining time, never
+//     less than the file's hook timeout, because an `afterEach` runs after the body has used its time;
+//   - in the test body: the test's timeout counted from when the body starts (the moment Vitest marks
+//     the `beforeEach` hooks "pass"), so time spent in `beforeEach` hooks is not taken off the body and
+//     time spent in the body before the call is (Vitest's own test timeout starts at the body);
+//   - outside a test (file-level code): the hook timeout.
+let currentTask: Task | undefined;
 let testDeadline: number | undefined;
+let bodyStart: number | undefined;
 beforeEach((ctx) => {
+  currentTask = ctx.task;
   const limit = ctx.task.timeout;
   testDeadline = Date.now() + (limit > 0 ? limit : hookTimeout);
+  bodyStart = undefined;
+  // Vitest sets `hooks.beforeEach = "pass"` right before it runs the test body. Observe that write
+  // with an accessor on the hook-state object, so the body's start is known without a child call.
+  const result = ctx.task.result;
+  if (result === undefined) return;
+  let state = result.hooks?.beforeEach;
+  const hooks = { ...result.hooks };
+  Object.defineProperty(hooks, "beforeEach", {
+    enumerable: true,
+    configurable: true,
+    get: () => state,
+    set: (next: typeof state) => {
+      state = next;
+      if (next === "pass") bodyStart = Date.now();
+    },
+  });
+  result.hooks = hooks;
 });
 afterEach(() => {
+  currentTask = undefined;
   testDeadline = undefined;
+  bodyStart = undefined;
+});
+
+function inEachHook(): boolean {
+  const hooks = currentTask?.result?.hooks;
+  return hooks?.beforeEach === "run" || hooks?.afterEach === "run";
+}
+withChildDeadline(childProcess, () => {
+  if (currentTask === undefined || testDeadline === undefined) return hookTimeout;
+  if (inEachHook()) return Math.max(hookTimeout, testDeadline - Date.now());
+  const limit = currentTask.timeout > 0 ? currentTask.timeout : hookTimeout;
+  bodyStart ??= Date.now();
+  return bodyStart + limit - Date.now();
 });
-withChildDeadline(childProcess, () =>
-  testDeadline === undefined ? hookTimeout : testDeadline - Date.now(),
-);
 syncBuiltinESMExports();
 
 // Every test runs as on a laptop: GitHub Actions sets `GITHUB_ACTIONS` and `CI`, and the
