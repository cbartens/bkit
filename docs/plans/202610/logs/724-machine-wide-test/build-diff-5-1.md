diff --git a/.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts b/.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts
new file mode 100644
index 000000000..7ecc6c2e8
--- /dev/null
+++ b/.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts
@@ -0,0 +1,179 @@
+import { type ChildProcess, spawn, spawnSync } from "node:child_process";
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+import { setTimeout as delay } from "node:timers/promises";
+
+import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
+
+import setup from "../../../../../vitest.test-lock";
+import { tierTimeouts } from "../../../../../vitest.timeout-budget";
+
+const BUDGET = tierTimeouts(true);
+const SCRIPT = path.resolve("scripts/ci/bkit-machine-lock.sh");
+const PROJECT = { vitest: { config: { filters: [], watch: false } } };
+let tmp: string;
+let holderFile: string;
+let children: ChildProcess[];
+let teardown: Awaited<ReturnType<typeof setup>>;
+
+beforeEach(() => {
+  tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-vitest-lock-")));
+  holderFile = path.join(tmp, "bkit", "machine-lock", "tests.lock.holder");
+  children = [];
+  teardown = undefined;
+  for (const key of Object.keys(process.env)) {
+    if (key.startsWith("LOCAL_STACK_LOCK_OWNER") || key.startsWith("LOCAL_STACK_LOCK_PID"))
+      vi.stubEnv(key, "");
+  }
+  vi.stubEnv("LOCAL_STACK_LOCK_OWNER_tests", "");
+  vi.stubEnv("XDG_CACHE_HOME", tmp);
+  vi.stubEnv("CI", "");
+  vi.stubEnv("BKIT_TEST_SLOTS", "1");
+  vi.stubEnv("BKIT_TEST_WORKERS", "");
+  vi.stubEnv("LOCAL_STACK_LOCK_WAIT_S", "5");
+});
+
+afterEach(async () => {
+  try {
+    if (typeof teardown === "function") await teardown();
+  } finally {
+    for (const child of children) stopHolder(child);
+    vi.unstubAllEnvs();
+    fs.rmSync(tmp, { recursive: true, force: true });
+  }
+});
+
+function stopHolder(child: ChildProcess): void {
+  if (child.pid === undefined) return;
+  try {
+    process.kill(-child.pid, "SIGKILL");
+  } catch (error) {
+    if (!(error instanceof Error && "code" in error && error.code === "ESRCH")) throw error;
+  }
+}
+
+async function finishSetup(): Promise<void> {
+  if (typeof teardown !== "function") throw new Error("setup returned no teardown");
+  await teardown();
+  teardown = undefined;
+}
+
+/** Independent callers must not inherit setup's owner and bypass its real flock. */
+function independentEnv(): NodeJS.ProcessEnv {
+  const env = { ...process.env };
+  for (const key of Object.keys(env)) {
+    if (key.startsWith("LOCAL_STACK_LOCK_OWNER") || key.startsWith("LOCAL_STACK_LOCK_PID"))
+      delete env[key];
+  }
+  return env;
+}
+
+async function holder() {
+  const child = spawn(
+    "bash",
+    [SCRIPT, "run", "wrapped gate holder", "--lock", "tests", "--", "sleep", "30"],
+    { env: independentEnv(), stdio: "ignore", detached: true },
+  );
+  children.push(child);
+  const done = new Promise<void>((resolve) => child.on("exit", () => resolve()));
+  const until = Date.now() + BUDGET.hookTimeout;
+  while (Date.now() < until) {
+    if (
+      fs.existsSync(holderFile) &&
+      fs.readFileSync(holderFile, "utf-8").includes("wrapped gate holder")
+    )
+      return { child, done };
+    if (child.exitCode !== null || child.signalCode !== null)
+      throw new Error("wrapped holder exited before acquiring");
+    await delay(20);
+  }
+  throw new Error("wrapped holder did not acquire the tests lock");
+}
+
+function probe() {
+  return spawnSync(
+    "bash",
+    [SCRIPT, "run", "independent probe", "--lock", "tests", "--", "printf", "probe ran"],
+    {
+      env: { ...independentEnv(), LOCAL_STACK_LOCK_WAIT_S: "0" },
+      encoding: "utf-8",
+      timeout: BUDGET.testTimeout,
+    },
+  );
+}
+
+describe("raw Vitest global setup against wrapped gates", () => {
+  it("the global setup waits for a held tests lock and takes it once the holder ends", async () => {
+    const held = await holder();
+    let settled = false;
+    const pending = Promise.resolve(setup(PROJECT)).then(
+      (value) => {
+        settled = true;
+        return { value, error: null };
+      },
+      (error: unknown) => {
+        settled = true;
+        return { value: undefined, error };
+      },
+    );
+    await delay(200);
+    const settledWhileHeld = settled;
+    const originalHolder = fs.readFileSync(holderFile, "utf-8");
+    stopHolder(held.child);
+    await held.done;
+    const acquired = await pending;
+    teardown = acquired.value;
+    expect(settledWhileHeld).toBe(false);
+    expect(originalHolder).toContain("wrapped gate holder");
+    expect(acquired.error).toBeNull();
+    expect(typeof teardown).toBe("function");
+    expect(process.env.LOCAL_STACK_LOCK_OWNER_tests).toMatch(/^[1-9][0-9]*$/);
+    expect(fs.readFileSync(holderFile, "utf-8")).toContain("vitest all");
+    expect(fs.readFileSync(holderFile, "utf-8")).toContain(
+      `pid ${process.env.LOCAL_STACK_LOCK_OWNER_tests}`,
+    );
+    expect(probe().status).toBe(75);
+  });
+
+  it("the global setup throws naming the holder when the wait gives up", async () => {
+    const held = await holder();
+    const line = fs.readFileSync(holderFile, "utf-8").trim();
+    vi.stubEnv("LOCAL_STACK_LOCK_WAIT_S", "0");
+    const result = await Promise.resolve(setup(PROJECT)).then(
+      (value) => {
+        teardown = value;
+        return null;
+      },
+      (error: unknown) => error,
+    );
+    expect(result).toBeInstanceOf(Error);
+    expect(String(result)).toContain("75");
+    expect(String(result)).toContain(line);
+    expect(held.child.exitCode).toBeNull();
+    expect(probe().status).toBe(75);
+  });
+
+  it("the global setup's teardown frees the tests lock", async () => {
+    teardown = await setup(PROJECT);
+    expect(typeof teardown).toBe("function");
+    const held = fs.readFileSync(holderFile, "utf-8");
+    expect(held).toContain("vitest all");
+    const busy = probe();
+    expect(busy.status, busy.stderr).toBe(75);
+    expect(busy.stdout).not.toContain("probe ran");
+    const nested = await setup(PROJECT);
+    expect(nested).toBeUndefined();
+    expect(fs.readFileSync(holderFile, "utf-8")).toBe(held);
+    await finishSetup();
+    const released = probe();
+    expect(released.status, released.stderr).toBe(0);
+    expect(released.stdout).toBe("probe ran");
+    const config = fs
+      .readFileSync(path.resolve("vitest.config.ts"), "utf-8")
+      .replace(/\/\*[\s\S]*?\*\//g, "")
+      .replace(/^\s*\/\/.*$/gm, "");
+    expect(config).toMatch(/globalSetup:\s*\["\.\/vitest\.test-lock\.ts"\]/);
+    expect(config).toMatch(/\.\.\.testWorkers\(\)/);
+  });
+});
diff --git a/.bkit/core/engine/audits/repo/vitest-test-lock.test.ts b/.bkit/core/engine/audits/repo/vitest-test-lock.test.ts
new file mode 100644
index 000000000..584d48f5e
--- /dev/null
+++ b/.bkit/core/engine/audits/repo/vitest-test-lock.test.ts
@@ -0,0 +1,79 @@
+import { describe, expect, it, vi } from "vitest";
+
+import { testLockDecision, testWorkers } from "../../../../../vitest.test-lock";
+
+const files = new Set(["src/a.test.ts", "src/b.integration.test.ts"]);
+const decision = (
+  overrides: {
+    filters?: string[];
+    env?: NodeJS.ProcessEnv;
+    exists?: (file: string) => boolean;
+    alive?: (pid: number) => boolean;
+    watch?: boolean;
+  } = {},
+) =>
+  testLockDecision({
+    filters: [],
+    env: {},
+    exists: (file: string) => files.has(file),
+    alive: () => false,
+    watch: false,
+    ...overrides,
+  }).take;
+
+describe("raw Vitest lock decisions", () => {
+  it("a run whose every filter is an existing test file is light and takes no lock", () => {
+    const exists = vi.fn((file: string) => files.has(file));
+    expect(decision({ filters: ["src/a.test.ts"], exists })).toBe(false);
+    expect(decision({ filters: ["src/a.test.ts:12", "src/b.integration.test.ts:2"], exists })).toBe(
+      false,
+    );
+    expect(exists).toHaveBeenCalledWith("src/a.test.ts");
+    expect(exists).toHaveBeenCalledWith("src/b.integration.test.ts");
+    expect(exists).not.toHaveBeenCalledWith("src/a.test.ts:12");
+    expect(exists).not.toHaveBeenCalledWith("src/b.integration.test.ts:2");
+  });
+
+  it("a run with no filters, or a pattern filter, is heavy and takes the tests lock", () => {
+    expect(decision()).toBe(true);
+    expect(decision({ filters: ["src/"] })).toBe(true);
+    expect(decision({ filters: ["*.test.ts"] })).toBe(true);
+    expect(decision({ filters: ["src/a.test.ts", "missing.test.ts"] })).toBe(true);
+    expect(decision({ filters: ["src/a.test.ts", "workflow"] })).toBe(true);
+  });
+
+  it("a run started under a live tests-lock owner takes no lock", () => {
+    const alive = vi.fn((pid: number) => pid === 123);
+    expect(decision({ env: { LOCAL_STACK_LOCK_OWNER_tests: "123" }, alive })).toBe(false);
+    expect(alive).toHaveBeenCalledWith(123);
+    expect(decision({ env: { LOCAL_STACK_LOCK_OWNER_tests: "456" }, alive })).toBe(true);
+    expect(alive).toHaveBeenCalledWith(456);
+    expect(decision({ env: { LOCAL_STACK_LOCK_OWNER_tests: "not-a-pid" }, alive })).toBe(true);
+    expect(decision({ env: { LOCAL_STACK_LOCK_OWNER: "123" }, alive })).toBe(true);
+  });
+
+  it("CI=true takes no lock", () => {
+    expect(decision({ env: { CI: "true" } })).toBe(false);
+    expect(decision({ env: { CI: "false" } })).toBe(true);
+  });
+
+  it("CI=1 takes no lock", () => {
+    expect(decision({ env: { CI: "1" } })).toBe(false);
+    expect(decision({ env: { CI: "0" } })).toBe(true);
+  });
+
+  it("BKIT_TEST_WORKERS sets maxWorkers when present", () => {
+    expect(testWorkers({ BKIT_TEST_WORKERS: "4" })).toEqual({ maxWorkers: 4 });
+    expect(testWorkers({ BKIT_TEST_WORKERS: "1" })).toEqual({ maxWorkers: 1 });
+    expect(testWorkers({})).toEqual({});
+    expect(testWorkers({ BKIT_TEST_WORKERS: "0" })).toEqual({});
+    expect(testWorkers({ BKIT_TEST_WORKERS: "-2" })).toEqual({});
+    expect(testWorkers({ BKIT_TEST_WORKERS: "1.5" })).toEqual({});
+    expect(testWorkers({ BKIT_TEST_WORKERS: "invalid" })).toEqual({});
+  });
+
+  it("a watch-mode run takes no lock", () => {
+    expect(decision({ watch: true })).toBe(false);
+    expect(decision({ watch: false })).toBe(true);
+  });
+});
diff --git a/.bkit/version b/.bkit/version
index d3bd53bb9..5d716221c 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -3,7 +3,7 @@
   "canonicalHashes": {
     ".cursor/mcp.json": "355e01cadabed3b924ebe339dc07ecbf7179397ebc9accf8618d5d7d6af6c438",
     "docs/deployments.md": "b7a8014afb7da246d615894519d87d5def6d0c6c7be8e714fb634157cdd7580f",
-    "docs/testing.md": "5a97bd9588e26caec1efda103d11aa3b7a605bf76e48630183604773350fd040",
+    "docs/testing.md": "f4a53e2935489843d716d597ea92255abe3cd2040d28ad253bd9a25804c6db5d",
     ".claude/settings.json": "34cfc63ef7bfb248ce3f27116ad3f6f89fd75678c599d2cd8e702c43f6958587",
     ".agents/context.md": "5cf54b91ffaa5d9372415a24dd1acfe0910c7def1f4434e25ccf110e3eaed013",
     ".agents/docs.md": "bfbddbf98bc4238c6a01dbd68fbe515ba01db2371c440d868fe12a8db6c96df0",
@@ -18,7 +18,7 @@
     ".gitignore": "9a7f418d4a8aafbddbd9995b6a9cee5b5dc54a8ec47440263a17d388652d79e3",
     "docs/security.md": "c78ac513273cbad510cf412efedf6fb62f1d84193e909cabc9c758f992f6b047",
     ".mcp.json": "65b29f1bb28dd6296d1dc8ea34aca4826d9ca072d7cef9d2971a7045280505d9",
-    "docs/architecture.md": "1b20322f960e2a2b55f77581784288dda48f14866a0cc1c096e2b3ba1411ea5d",
+    "docs/architecture.md": "29e965f2fcca4f01e296684268337a72de71b7e71eaa39fa7971b95dcf2fdcfe",
     "docs/technology.md": "69f00bc76a6546c98d6ee6a3fc21808ccbcc81909d0ee1ff9c1dd9f7b8cb2c58",
     ".bkit/.env.example": "3eae6dd3d96a33aed1745fc6b069000ae7272fbdab99617250015e9c233e6200",
     ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
diff --git a/README.md b/README.md
index 7992a5631..fd02f207e 100644
--- a/README.md
+++ b/README.md
@@ -354,7 +354,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from f83d12b72366ff2584da7b29038544915d9ec816 — do not edit
+  %% Generated by bkit-graphify-rollup.py from 6db8ee1791f7616415ebeb891f8311e28d4b9672 — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
diff --git a/docs/architecture.md b/docs/architecture.md
index 56ab034f1..faaa98d8f 100644
--- a/docs/architecture.md
+++ b/docs/architecture.md
@@ -83,6 +83,7 @@ cbartens/bkit (this repo)
 │                           #   bkit-test-file.mjs (`bkit:test:file`: runner picked by test file type)
 ├── scripts/gate/           # bkit-repo-only bkit-gate-changed.mjs (`bkit:gate:changed`: checks on
 │                           #   the changed files bkit passes it)
+├── vitest.*.ts             # Root test-runner configurations and shared test helpers
 ├── dist/                   # Compiled output (committed; published in tarball)
 ├── .bkit/core/             # Payload bkit writes and keeps current: engine/, workflows/,
 │                           #   prompts/, docs/templates/, the hooks, AGENTS.md and .agents/*.md,
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 6be262930..2bc8d70ce 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -30,7 +30,7 @@
 > - `budgeted` = solid amber border + a faint amber box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.
 > - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.
 > - A fetched URL is a STRING, never an edge, because the reachability scan (§ Unreachable API calls) is the only check that sees it.
-> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `f83d12b72`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
+> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `6db8ee179`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
 > - Detail-level module graph → `pnpm graph`. This doc is the altitude above that: capabilities, not files.
 
 ## Status Vocabulary
@@ -159,7 +159,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from f83d12b72366ff2584da7b29038544915d9ec816 — do not edit
+  %% Generated by bkit-graphify-rollup.py from 6db8ee1791f7616415ebeb891f8311e28d4b9672 — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
@@ -248,7 +248,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from f83d12b72366ff2584da7b29038544915d9ec816 — do not edit
+  %% Generated by bkit-graphify-rollup.py from 6db8ee1791f7616415ebeb891f8311e28d4b9672 — do not edit
   subgraph gncustom_health_checks["Health checks"]
     n_bkit_core_engine_checks_after_index[".bkit/core/engine/checks/after/index<br/>11 symbols · 1 files"]
     n_bkit_core_engine_checks_before_index[".bkit/core/engine/checks/before/index<br/>4 symbols · 1 files"]
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index 581afd09f..94fd75851 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -139,3 +139,4 @@
 {"schema":3,"ts":1793659952583,"firstTs":1793659952583,"updates":1,"kind":"knowledge","key":"tests-command-shared-lock-classifier-import-direction","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["724",".bkit/core/engine/commands/lib.ts",".bkit/core/engine/commands/workflow/tests.ts",".bkit/core/engine/commands/workflow/tests-changed.ts",".bkit/core/engine/commands/workflow/tests-changed.test.ts"],"summary":"Shared tests-lock helpers must not create a cycle between the test command modules","description":"Importing tests-changed.ts first exposed an undefined testsCommand.verbs.changed; all ten command cases then failed when runCommand read exitCodes. The normal CLI import order hid the problem, while the existing direct-module unit tests reproduced it.","rootCause":"tests.ts captures testsChangedVerb in its command specification during module initialization. A reciprocal static import from tests-changed.ts back to tests.ts can evaluate that capture before the exported verb constant is initialized.","remediation":"Keep the pure classifier and holder extractor in commands/lib.ts and import them directly in both command modules. tests.ts may re-export classifyLockExit for its public test API; tests-changed.ts should not depend on that re-export. Verify the direct-module tests-changed.test.ts as well as CLI integration cases.","status":"ACTIVE"}
 {"schema":3,"ts":1793660763377,"firstTs":1793660763377,"updates":1,"kind":"knowledge","key":"tracker-post-unit-tests-clear-ambient-linear-credential","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["724",".bkit/core/engine/commands/workflow/issues.test.ts",".bkit/core/engine/commands/workflow/steps.test.ts"],"summary":"Tracker post unit tests must clear ambient Linear credentials before asserting missing-auth behavior","description":"With BKIT_LINEAR_API_KEY supplied by direnv, the existing failed-post cases called Linear and received not-found instead of the expected missing-auth reason. Both failures repeated in the related and named changed-gate stages.","rootCause":"The post suites restored the original credential after each test but did not clear it before cases that require no credential.","remediation":"Delete BKIT_LINEAR_API_KEY in each post suite's beforeEach and retain its existing afterEach restoration. Successful post cases explicitly set the stub credential and fake fetch. Keep missing-auth assertions independent of network responses.","status":"ACTIVE"}
 {"schema":3,"ts":1793663239824,"firstTs":1793663239824,"updates":1,"kind":"knowledge","key":"reuse-stable-executable-for-shell-fixture-bodies","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":["tests/fixtures/gh/bin/gh","tests/gh-stub-smoke.bats","docs/testing.md"],"summary":"Reuse a stable executable when shell fixtures change their response bodies","description":"On the local host, six fresh executable shell fixtures had a 109.25ms median startup; identical interpreted bodies had a 5.45ms median, and aliases to the stable dispatcher had a 7.5ms median. Broad unit coverage amplified this startup cost into test timeouts. Executable resolution tracing confirmed the intended fake pnpm/gh paths and zero fetch calls.","rootCause":"Generating a new executable for each response repeats first-execution overhead; the response data does not require a new executable identity.","remediation":"Symlink each temporary tool name to the existing fixture dispatcher, store the body as a non-executable file, and restore its environment selector after each case. Clear the selector before interpreting the body so nested fixture fallback cannot recurse. Keep PATH lookup, real subprocesses, original assertions, timeout budgets and worker settings.","status":"ACTIVE"}
+{"schema":3,"ts":1793668591094,"firstTs":1793668591094,"updates":1,"kind":"knowledge","key":"vitest-cli-filters-live-on-runner-filename-pattern","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["vitest.test-lock.ts","docs/testing.md"],"summary":"Read actual Vitest CLI filters when deciding whether a raw run needs the tests lock","description":"Vitest 5 stores CLI file filters on vitest.filenamePattern before global setup. Its resolved config does not carry config.filters. Reading config.filters alone treats an explicit existing-file run as an unfiltered heavy run and waits unnecessarily.","rootCause":"CLI run selection and the resolved test configuration are separate runner state.","remediation":"Preserve an explicit config.filters input and fall back to vitest.filenamePattern. Verify the real bkit:test:file command completes while another worktree holds the raw-run lock.","status":"ACTIVE"}
diff --git a/docs/testing.md b/docs/testing.md
index 1a5874833..b80c9d32a 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -544,6 +544,7 @@ See `deployments.md` § Commit-message force tags for the marker mechanics. That
 ## Stack
 
 - **Runner:** Vitest 5 (`pnpm test` → `vitest run`). Shell: bats (`pnpm bkit:test:bats`). Harvest: `node:test` (`pnpm test:harvest`).
+- **Raw Vitest:** `vitest.test-lock.ts` makes heavy root runs queue for the machine-wide `tests` lock in global setup; runs filtered entirely to existing files, watch mode, CI and nested runs with a live owner bypass acquisition. The lock script keeps its 60-second default wait without a TTY and honours an inherited wait budget. `BKIT_TEST_WORKERS` supplies a positive worker limit when set.
 - **One test file:** `pnpm bkit:test:file {file}` → `scripts/ci/bkit-test-file.mjs` picks the runner by file type (`.bats` → bats, `.mjs` → `node --test`, else Vitest); JUnit report only when `$BKIT_TEST_REPORT` is set.
 - **Changed files:** `pnpm bkit:gate:changed {file}...` holds the `tests` lock through `scripts/ci/bkit-machine-lock.sh` and passes the file arguments to `scripts/gate/bkit-gate-changed.mjs`, which `bkit tests changed` calls for build and debug agents: `vitest related --run` on the changed files, every test file that names a changed path (Vitest, `node --test` or bats by file type), Oxlint on changed engine `.ts`, Prettier on every changed file, and `pnpm typecheck` when a `.ts` file changed. Runs every stage, and exits 1 when any fails.
 - **Test gates:** `bkit:gate:static-unit`, `bkit:gate:static-unit-integration` and `bkit:gate:install-static-unit-build` hold the same `tests` lock for their whole run. A nested gate inherits its parent's live lock owner and runs unlocked.
@@ -681,6 +682,8 @@ The machine-lock integration tests in `audits/templates/machine-lock.integration

<!-- prettier-ignore -->
 | File | Tier | Scope |
 | --- | --- | --- |
 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | Integration | Real consumer gate wrapping, wait budgets and exit mapping, lock lifetime, CI and light-run bypass, inherited workers and nested wrappers. |
+| `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | Unit | Raw Vitest heavy/light decisions, live nested owners, CI, watch and positive worker budgets. |
+| `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` | Integration | Real holder contention, readiness diagnostics, lock lifetime, teardown and nested setup. |
 | `.bkit/core/engine/commands/install/doctor.integration.test.ts` | Integration | `bkit doctor` exit 0 and Phase 1 and Phase 3 advisory replay. |
 | `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` | Integration | design / plan close `branches land` line run verbatim (local runtime) against a real remote + worktree: a conflict-dropped doc keeps `feat/{FID}` and leaves `dev` unmoved; another session's uncommitted edit, staged doc, local-only `dev` commit or other checked-out branch never blocks the close and is left as it was (local `dev` fast-forwards only when it can); clean close lands the branch copy, then deletes the branch. The `bkit-build.md` held close, run verbatim: origin refs unchanged, branch and worktree kept, lock released; the rows, summary and worktree-only roadmap row recorded. |
 | `.bkit/core/engine/commands/install/uninstall.test.ts` | Unit | `runUninstall` orchestrator — format-aware decision matrix (fully-managed / markered-text / byte-equal-text), dry-run, idempotency, `--nuke`; `docs/*.md` block strip (managed marker included, consumer content kept) and `docs/templates/bkit-*.md` deletion on a full uninstall only; a managed `.bkit/lite.md` block stripped with the consumer section kept. |
diff --git a/vitest.config.ts b/vitest.config.ts
index ef3a5180f..b3d13d623 100644
--- a/vitest.config.ts
+++ b/vitest.config.ts
@@ -3,6 +3,7 @@ import * as path from "node:path";
 import { defineConfig } from "vitest/config";
 
 import { unitTimeouts } from "./vitest.timeout-budget.ts";
+import { testWorkers } from "./vitest.test-lock.ts";
 
 // `bkit tests run` hands every gate a folder in BKIT_TEST_REPORT_DIR and counts the
 // failing test cases in the JUnit files written there. One file per vitest process,
@@ -26,6 +27,8 @@ export default defineConfig({
     // never hit the real repo when the suite runs from a git hook (see
     // vitest.setup.ts for the 2026-07-13 branch-hijack incident).
     setupFiles: ["./vitest.setup.ts"],
+    globalSetup: ["./vitest.test-lock.ts"],
+    ...testWorkers(),
     // Unit-tier limits scaled to the machine's load when the config loads. This spread is
     // sampled ONCE; vitest.setup.ts re-reads the same budget as each test FILE starts, so a
     // load ramp mid-run cannot starve late files past a stale limit.
diff --git a/vitest.test-lock.ts b/vitest.test-lock.ts
new file mode 100644
index 000000000..fee077d1b
--- /dev/null
+++ b/vitest.test-lock.ts
@@ -0,0 +1,135 @@
+import * as fs from "node:fs";
+import { spawn } from "node:child_process";
+import { Writable } from "node:stream";
+
+interface TestLockInput {
+  filters: readonly string[];
+  env: NodeJS.ProcessEnv;
+  exists: (file: string) => boolean;
+  alive: (pid: number) => boolean;
+  watch: boolean;
+}
+
+/** Decide whether this invocation needs a run-wide tests lock. */
+export function testLockDecision({ filters, env, exists, alive, watch }: TestLockInput): {
+  take: boolean;
+  reason: "ci" | "nested" | "watch" | "files" | "heavy";
+} {
+  if (env.CI === "true" || env.CI === "1") return { take: false, reason: "ci" };
+  const owner = env.LOCAL_STACK_LOCK_OWNER_tests ?? "";
+  const pid = Number(owner);
+  if (/^[1-9][0-9]*$/.test(owner) && Number.isSafeInteger(pid) && alive(pid))
+    return { take: false, reason: "nested" };
+  if (watch) return { take: false, reason: "watch" };
+  if (filters.length > 0 && filters.every((file) => exists(file.replace(/:\d+$/, ""))))
+    return { take: false, reason: "files" };
+  return { take: true, reason: "heavy" };
+}
+
+/** Apply the worker budget supplied by a tests-lock holder. */
+export function testWorkers(env: NodeJS.ProcessEnv = process.env): { maxWorkers?: number } {
+  const value = env.BKIT_TEST_WORKERS ?? "";
+  const workers = Number(value);
+  return /^[0-9]+$/.test(value) && Number.isSafeInteger(workers) && workers >= 1
+    ? { maxWorkers: workers }
+    : {};
+}
+
+interface LockProject {
+  vitest: {
+    config: { filters?: readonly string[]; watch?: boolean };
+    filenamePattern?: readonly string[];
+  };
+}
+
+/** Hold the machine-wide tests lock until Vitest finishes its run. */
+export default async function setup(
+  project: LockProject,
+): Promise<(() => Promise<void>) | undefined> {
+  // Vitest 5 stores CLI filters on the runner rather than its resolved config.
+  const filters = project.vitest.config.filters ?? project.vitest.filenamePattern ?? [];
+  const decision = testLockDecision({
+    filters,
+    env: process.env,
+    watch: project.vitest.config.watch === true,
+    exists: (file) => fs.statSync(file, { throwIfNoEntry: false })?.isFile() === true,
+    alive: (pid) => {
+      try {
+        process.kill(pid, 0);
+        return true;
+      } catch (error) {
+        if (error instanceof Error && "code" in error) {
+          if (error.code === "EPERM") return true;
+          if (error.code === "ESRCH") return false;
+        }
+        throw error;
+      }
+    },
+  });
+  if (!decision.take) return;
+
+  const child = spawn(
+    "bash",
+    [
+      "scripts/ci/bkit-machine-lock.sh",
+      "run",
+      `vitest ${filters.length > 0 ? filters.join(" ") : "all"}`,
+      "--lock",
+      "tests",
+      "--",
+      "sh",
+      "-c",
+      'printf "locked %s\\n" "$LOCAL_STACK_LOCK_OWNER_tests"; exec cat <&3 >/dev/null',
+    ],
+    { stdio: ["inherit", "pipe", "pipe", "pipe"] },
+  );
+  let stderr = "";
+  const exited = new Promise<{ code: number | null; signal: NodeJS.Signals | null; error?: Error }>(
+    (resolve) => {
+      child.once("error", (error) => resolve({ code: null, signal: null, error }));
+      child.once("close", (code, signal) => resolve({ code, signal }));
+    },
+  );
+  const stdout = child.stdout;
+  const stderrStream = child.stderr;
+  const keepalive = child.stdio[3];
+  if (!stdout || !stderrStream || !(keepalive instanceof Writable)) {
+    child.kill();
+    await exited;
+    throw new Error("Vitest tests lock did not open its readiness and keepalive pipes");
+  }
+  stderrStream.setEncoding("utf8");
+  stderrStream.on("data", (chunk: string) => {
+    stderr += chunk;
+    process.stderr.write(chunk);
+  });
+  const ready = new Promise<string>((resolve) => {
+    let output = "";
+    stdout.setEncoding("utf8");
+    stdout.on("data", (chunk: string) => {
+      output += chunk;
+      const match = /^locked ([1-9][0-9]*)$/m.exec(output);
+      if (match) resolve(match[1]);
+    });
+  });
+  const owner = await Promise.race([
+    ready,
+    exited.then(({ code, signal, error }) => {
+      throw new Error(
+        `Vitest tests lock exited before readiness (${code ?? signal ?? error?.message}): ${stderr}`,
+      );
+    }),
+  ]);
+  const previousOwner = process.env.LOCAL_STACK_LOCK_OWNER_tests;
+  process.env.LOCAL_STACK_LOCK_OWNER_tests = owner;
+  return async () => {
+    keepalive.end();
+    const { code, signal, error } = await exited;
+    if (process.env.LOCAL_STACK_LOCK_OWNER_tests === owner) {
+      if (previousOwner === undefined) delete process.env.LOCAL_STACK_LOCK_OWNER_tests;
+      else process.env.LOCAL_STACK_LOCK_OWNER_tests = previousOwner;
+    }
+    if (code !== 0 || error)
+      throw new Error(`Vitest tests lock exited (${code ?? signal ?? error?.message}): ${stderr}`);
+  };
+}
