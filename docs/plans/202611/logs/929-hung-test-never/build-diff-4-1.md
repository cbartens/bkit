diff --git a/.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts b/.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts
index e7ac24b64..20397fc77 100644
--- a/.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts
+++ b/.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts
@@ -118,3 +118,28 @@ it("counts the body's child limit from when the body starts, not from its first
   expect(run.status).not.toBe(0);
   expect(output).toContain("did not finish within");
 });
+
+it("keeps the body's child limit on the real clock when the test sets a future system time", () => {
+  const { run, output } = nestedRun(
+    "futureclock",
+    `import { spawnSync } from "node:child_process";\nimport { vi } from "vitest";\nit("sets a future time then runs a child", () => {\n  vi.useFakeTimers({ toFake: ["Date"] });\n  vi.setSystemTime(Date.now() + 3_600_000);\n  expect(spawnSync("true").status).toBe(0);\n});\n`,
+    5000,
+    10000,
+  );
+  expect(run.error, output).toBeUndefined();
+  expect(output).not.toContain("did not finish within");
+  expect(run.status, output).toBe(0);
+});
+
+it("stops a hung child at the test's timeout when the test sets a past system time", () => {
+  const started = Date.now();
+  const { run, output } = nestedRun(
+    "pastclock",
+    `import { spawnSync } from "node:child_process";\nimport { vi } from "vitest";\nit("sets a past time then hangs on a child", () => {\n  vi.useFakeTimers({ toFake: ["Date"] });\n  vi.setSystemTime(new Date("2026-10-31T23:30:00-05:00"));\n  spawnSync("sleep", ["12"]);\n});\n`,
+    5000,
+    10000,
+  );
+  expect(run.error, output).toBeUndefined();
+  expect(Date.now() - started).toBeLessThan(5000 + 3000);
+  expect(run.status).not.toBe(0);
+});
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index d622facfc..7821e06ca 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -310,3 +310,4 @@
 {"schema":3,"ts":1794560264036,"firstTs":1794560264036,"updates":1,"kind":"deferral","key":"929-hung-test-never-challenge-low-vitest-child-deadline-ts-39","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["929-hung-test-never"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A test declared with `{ timeout: Infinity }` (a Vitest-supported value) makes every child call it runs throw `ERR_OUT_OF_RANGE` (\"must be an unsigned integer. Received Infinity\") instead of running","description":"LOW build challenge finding at vitest.child-deadline.ts:39: A test declared with `{ timeout: Infinity }` (a Vitest-supported value) makes every child call it runs throw `ERR_OUT_OF_RANGE` (\"must be an unsigned integer. Received Infinity\") instead of running. Done when: a non-finite remaining time (or one above the largest value `spawnSync` accepts) is clamped to a valid unsigned integer, or no `timeout` is injected for it, so a child call under an unbounded test runs to completion; no repo test sets `timeout: Infinity` today.","source":"vitest.child-deadline.ts:39"}
 {"schema":3,"ts":1794560264037,"firstTs":1794560264037,"updates":1,"kind":"deferral","key":"929-hung-test-never-challenge-low-tests-shell-setup-suite-bash-22","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["929-hung-test-never"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A developer shell that exports `CI=false` or `CI=0` gets the strict 30s bats limit from `tests/shell/setup_suite.bash`, while `vitest.timeout-budget.ts` (`env.CI === \"true\" || env.CI === \"1\"`) treats the same shell as local and scales the other runners, so bats tests under load fail on `timeout after` alone","description":"LOW build challenge finding at tests/shell/setup_suite.bash:22: A developer shell that exports `CI=false` or `CI=0` gets the strict 30s bats limit from `tests/shell/setup_suite.bash`, while `vitest.timeout-budget.ts` (`env.CI === \"true\" || env.CI === \"1\"`) treats the same shell as local and scales the other runners, so bats tests under load fail on `timeout after` alone. Done when: `setup_suite()` picks the 30s limit only for `CI=true` or `CI=1`, the same values `loadFactor` reads as CI, and 180s for any other value or none.","source":"tests/shell/setup_suite.bash:22"}
 {"schema":3,"ts":1794560264038,"firstTs":1794560264038,"updates":1,"kind":"deferral","key":"929-hung-test-never-challenge-low-skills-lock-json-35","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["929-hung-test-never"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"The skill lock drops its integrity hash for find-skills, so a changed or tampered upstream copy of that agent-read skill can no longer be detected, and the next setup check re-fetches it from an unpinned upstream","description":"LOW build challenge finding at skills-lock.json:35: The skill lock drops its integrity hash for find-skills, so a changed or tampered upstream copy of that agent-read skill can no longer be detected, and the next setup check re-fetches it from an unpinned upstream. Done when: every entry in skills-lock.json, including find-skills, carries a nonempty 64-hex computedHash produced by the skills installer (re-run `npx skills add vercel-labs/skills@find-skills -y` and keep the installer output), as .agents/skills.md § Install / Update step 2 requires","source":"skills-lock.json:35"}
+{"schema":3,"ts":1794570993610,"firstTs":1794570993610,"updates":1,"kind":"deferral","key":"929-hung-test-never-challenge-low-vitest-setup-ts-152","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["929-hung-test-never"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A `beforeAll(fn, 60_000)` (or any hook given its own longer timeout) whose setup child takes longer than the file's default hook timeout has that child killed at the default, so the hook fails and every test in the file is skipped, with an error that blames \"the running test's remaining time\" when no test is running","description":"LOW build challenge finding at vitest.setup.ts:152: A `beforeAll(fn, 60_000)` (or any hook given its own longer timeout) whose setup child takes longer than the file's default hook timeout has that child killed at the default, so the hook fails and every test in the file is skipped, with an error that blames \"the running test's remaining time\" when no test is running. Done when: a child call with no `timeout` inside a hook that was given its own timeout argument gets no less than that hook's timeout, or `docs/testing.md` § Time limits states that a hook that sets a longer timeout must pass `timeout` to its own child calls; the limit error names where the limit came from (test body, each-hook or hook) instead of always saying \"the running test's remaining time\". Every long-timeout hook in the repo today passes its own `timeout` (for example `.bkit/core/engine/commands/install/check.integration.test.ts:394` through `runBkit`), so nothing hits this yet.","source":"vitest.setup.ts:152"}
diff --git a/vitest.setup.ts b/vitest.setup.ts
index 8c903cd1c..09c20a71f 100644
--- a/vitest.setup.ts
+++ b/vitest.setup.ts
@@ -113,13 +113,15 @@ const { hookTimeout } = tierTimeouts(testPath.endsWith(".integration.test.ts"));
 //     the `beforeEach` hooks "pass"), so time spent in `beforeEach` hooks is not taken off the body and
 //     time spent in the body before the call is (Vitest's own test timeout starts at the body);
 //   - outside a test (file-level code): the hook timeout.
+// Clock taken when the setup file loads, before a test can mock `Date`: the child limit counts real time.
+const realNow = Date.now.bind(Date);
 let currentTask: Task | undefined;
 let testDeadline: number | undefined;
 let bodyStart: number | undefined;
 beforeEach((ctx) => {
   currentTask = ctx.task;
   const limit = ctx.task.timeout;
-  testDeadline = Date.now() + (limit > 0 ? limit : hookTimeout);
+  testDeadline = realNow() + (limit > 0 ? limit : hookTimeout);
   bodyStart = undefined;
   // Vitest sets `hooks.beforeEach = "pass"` right before it runs the test body. Observe that write
   // with an accessor on the hook-state object, so the body's start is known without a child call.
@@ -133,7 +135,7 @@ beforeEach((ctx) => {
     get: () => state,
     set: (next: typeof state) => {
       state = next;
-      if (next === "pass") bodyStart = Date.now();
+      if (next === "pass") bodyStart = realNow();
     },
   });
   result.hooks = hooks;
@@ -150,10 +152,10 @@ function inEachHook(): boolean {
 }
 withChildDeadline(childProcess, () => {
   if (currentTask === undefined || testDeadline === undefined) return hookTimeout;
-  if (inEachHook()) return Math.max(hookTimeout, testDeadline - Date.now());
+  if (inEachHook()) return Math.max(hookTimeout, testDeadline - realNow());
   const limit = currentTask.timeout > 0 ? currentTask.timeout : hookTimeout;
-  bodyStart ??= Date.now();
-  return bodyStart + limit - Date.now();
+  bodyStart ??= realNow();
+  return bodyStart + limit - realNow();
 });
 syncBuiltinESMExports();
 
