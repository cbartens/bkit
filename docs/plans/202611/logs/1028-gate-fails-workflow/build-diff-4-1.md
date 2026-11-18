diff --git a/.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts b/.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts
index 29ffd4ef9..89ff8a3c3 100644
--- a/.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts
+++ b/.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts
@@ -182,10 +182,11 @@ describe("bkit-text-ceiling lower and raise", () => {
       const r = spawnSync(
         "node",
         [SCRIPT, "raise", "--reason", "x", ...v.extra, "--root", fx.root, "--record", fx.record],
-        { encoding: "utf-8", cwd: fx.root, env: { ...process.env, ...v.env }, input: "yes\n" },
+        { encoding: "utf-8", cwd: fx.root, env: { ...process.env, ...v.env }, input: "RAISE\n" },
       );
       expect(r.status).not.toBe(0);
       expect(r.status).not.toBeNull();
+      expect(r.stdout + r.stderr).toMatch(/runs only at a terminal/);
       expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
     }
   });
diff --git a/docs/testing.md b/docs/testing.md
index 0b0052ab7..9057e67e2 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -569,9 +569,9 @@ Manual host-hook compatibility experiments live in [`tests/experiments/hooks/`](
 - **Raw Vitest:** `vitest.test-lock.ts` makes heavy root runs queue for the machine-wide `tests` lock in global setup; runs filtered entirely to existing files, watch mode, CI and nested runs with a live owner bypass acquisition. The lock script keeps its 60-second default wait without a TTY and honours an inherited wait budget. When the config loads, `testWorkers` sets `maxWorkers` from an inherited `BKIT_TEST_WORKERS`, else no limit under `CI=true` / `CI=1`, else the `workers` value of `bash scripts/ci/bkit-machine-lock.sh slots`, so the script is the only place that holds the slot rule (for example 4 workers on 10 local cores). The global setup then asks the lock for the same slot count and takes whichever slot is free, so a raw run and a gate hold both slots at once; it waits only while every slot is held. `BKIT_TEST_SLOTS=1` gives one slot at full width.
 - **One test file:** `pnpm bkit:test:file {file}` → `scripts/ci/bkit-test-file.mjs` picks the runner by file type (`.bats` → bats, `.mjs` → `node --test`, else Vitest); JUnit report only when `$BKIT_TEST_REPORT` is set.
 - **Time limits:** under `CI` the Vitest per-test and per-hook budgets (`vitest.timeout-budget.ts`) are strict (5s / 10s unit, 30s integration); off CI each is a fixed 6 times that (30s / 60s / 180s), a hang limit with no load reading. A limit a test file sets itself goes through `localLimit(ms)`, including one held in a named constant, so it stays as written under `CI` and is 6 times that off CI; `vitest.setup.ts` records the factor in `BKIT_LIMIT_FACTOR` before it clears `CI`, so a test file still reads the CI factor. The budgets also cap synchronous child calls (`vitest.child-deadline.ts`): a call with no `timeout` gets, from a test body, the test's timeout counted from when the body starts (`beforeEach` time is not taken off it; time the body spent before the call is), and, from a file's own `beforeEach` / `afterEach` hook (read from the hook state Vitest records on the running test, so it holds across an `await`), the test's remaining time but never less than the hook timeout so cleanup is not cut short, and is ended with SIGKILL (unless the caller sets `killSignal`) so a child that ignores SIGTERM cannot outlast it. From a `beforeAll` / `afterAll` hook, the call gets the hook timeout. No child limit reads a hook's own timeout, so a hook given a longer limit of its own, such as `beforeAll(fn, localLimit(120_000))`, passes `timeout` to the child processes it starts. `node --test` runs get `--test-timeout` and `--test-force-exit` from `scripts/ci/bkit-test-limits.mjs`, derived from the integration budget (30s under CI); `pnpm bkit:test:awake` runs its test file through `scripts/ci/bkit-test-file.mjs`, so it gets them too. Bats gets `BATS_TEST_TIMEOUT` from the same source, or from `tests/shell/setup_suite.bash` for `pnpm bkit:test:bats`. A limit kills only the direct child, so a grandchild it started can outlive the run. `patches/bats@1.13.0.patch` fixes two bats 1.13.0 defects: `bats-exec-test` declared the watchdog pid with `declare -r` inside a function, so a failing test could not stop its watchdog and waited out the whole limit; `bin/bats` ran `env` on a path that pnpm's patched-package directory name makes look like an assignment.
-- **Changed files:** `pnpm bkit:gate:changed {file}...` holds the `tests` lock through `scripts/ci/bkit-machine-lock.sh` and passes the file arguments to `scripts/gate/bkit-gate-changed.mjs`, which `bkit tests changed` calls for build and debug agents and `bkit tests run --changed-since=<sha>` calls for the build group gate: `vitest related --run` on the changed files, every test file that names a changed path (Vitest, `node --test` or bats by file type), Oxlint on changed engine `.ts`, Prettier on every changed file, and `pnpm typecheck` when a `.ts` file changed. Runs every stage, and exits 1 when any fails.
+- **Changed files:** `pnpm bkit:gate:changed {file}...` holds the `tests` lock through `scripts/ci/bkit-machine-lock.sh` and passes the file arguments to `scripts/gate/bkit-gate-changed.mjs`, which `bkit tests changed` calls for build and debug agents and `bkit tests run --changed-since=<sha>` calls for the build group gate: `vitest related --run` on the changed files, every test file that names a changed path (Vitest, `node --test` or bats by file type) plus the text ceiling test when a changed path is under `.bkit/core/workflows/` or `.bkit/core/prompts/` or is `scripts/gate/bkit-text-ceiling.json`, Oxlint on changed engine `.ts`, Prettier on every changed file, and `pnpm typecheck` when a `.ts` file changed. Runs every stage, and exits 1 when any fails.
 - **Test gates:** `bkit:gate:static-unit`, `bkit:gate:static-unit-integration` and `bkit:gate:install-static-unit-build` hold the same `tests` lock for their whole run. A nested gate inherits its parent's live lock owner and runs unlocked.
-- **Text ceiling:** the unit tier fails when the word total of `.bkit/core/workflows/*.md` or `.bkit/core/prompts/*.md` differs from `scripts/gate/bkit-text-ceiling.json`. `pnpm bkit:text:ceiling lower` shrinks the record and needs no reason; `pnpm bkit:text:ceiling raise --reason "<why>"` is run by the owner only and is never called by a workflow, hook or agent: it refuses unless stdin and stdout are a terminal, shows each folder's old and new ceiling, and writes the record only after the owner types the confirmation it asks for.
+- **Text ceiling:** the unit tier and the changed-file gate (`bkit:gate:changed`) run its test, which fails when the word total of `.bkit/core/workflows/*.md` or `.bkit/core/prompts/*.md` differs from `scripts/gate/bkit-text-ceiling.json`. `pnpm bkit:text:ceiling lower` shrinks the record and needs no reason; `pnpm bkit:text:ceiling raise --reason "<why>"` is run by the owner only and is never called by a workflow, hook or agent: it refuses unless stdin and stdout are a terminal, shows each folder's old and new ceiling, and writes the record only after the owner types the confirmation it asks for.
 - **Test files** sit next to the file they test under `.bkit/core/engine/`; tests that read shipped text (workflows, templates, hooks, this repo's own docs and ledgers) sit in `.bkit/core/engine/audits/{workflows,templates,hooks,repo}/`. `tests/` holds automated shell tests in `shell/`, reusable inputs in `fixtures/` and manual research in `experiments/{compression,hooks}/`. Experiments keep reports in `reports/`, illustrations in `assets/` and preserved observations in dated `results/` folders.
 - **Shell names and runner:** Authored shell tests use `bkit-<subject>-<behaviour>.bats`. Keep the runner-required `setup_suite.bash` name and fixture names required by the software they imitate, such as `gh` and `package.json`. Local gates and CI both call `pnpm bkit:test:bats`, which selects `tests/shell/*.bats` and loads the adjacent suite setup. Manual experiments remain outside that selection.
 - **Real-repo guard:** both tiers run from `.husky/pre-push`, whose git exports `GIT_DIR` (from a linked worktree `<main>/.git/worktrees/<name>`, which beats a child's cwd and `-C`). `vitest.setup.ts` and `tests/shell/setup_suite.bash` clear every `GIT_*` variable before any test runs, then read `user.name` / `user.email` / `core.bare` / `core.worktree` of the repo the run starts from; a change fails the test (vitest, after each test, `vitest.repo-config-guard.ts`) or the run (bats `teardown_suite`) and puts the old values back. Pinned by `.bkit/core/engine/audits/repo/vitest-repo-config-guard.test.ts` and `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts`.
diff --git a/scripts/gate/bkit-gate-changed.mjs b/scripts/gate/bkit-gate-changed.mjs
index e79f5fb2a..94c8b703d 100644
--- a/scripts/gate/bkit-gate-changed.mjs
+++ b/scripts/gate/bkit-gate-changed.mjs
@@ -4,7 +4,8 @@
  * bkit-gate-changed.mjs — bkit's own `bkit:gate:changed`: checks only the files named as
  * arguments (repo-relative, from `bkit tests changed`). Every stage runs, failing or not:
  *   related  → vitest related --run: the Vitest tests that import a changed file
- *   named    → each test file that names a changed path, by runner (vitest / node --test / bats)
+ *   named    → each test file that names a changed path, by runner (vitest / node --test / bats);
+ *              also the text ceiling test when a changed path is under .bkit/core/workflows/ or .bkit/core/prompts/, or is the ceiling record
  *   lint     → oxlint on the changed engine .ts files (the `lint` script's scope)
  *   format   → prettier --check on every changed file it knows, symlinks excluded
  *   types    → pnpm typecheck when a .ts file changed (tsc checks whole projects only)
@@ -67,11 +68,18 @@ stage(
   run("related", bin("vitest"), ["related", "--run", "--passWithNoTests", ...files]),
 );
 
+const CEILING_TEST = ".bkit/core/engine/audits/repo/agent-text-ceiling.test.ts";
+const touchesCeiling = (f) =>
+  f.startsWith(".bkit/core/workflows/") ||
+  f.startsWith(".bkit/core/prompts/") ||
+  f === "scripts/gate/bkit-text-ceiling.json";
+
 const isTest = (f) => TEST_GLOBS.some((g) => f.endsWith(g.slice(1)));
 const named = testsNaming(files);
 if (named === null) stage("named", 1);
 else {
-  const tests = [...new Set([...named, ...files.filter(isTest)])].sort();
+  const ceiling = files.some(touchesCeiling) ? [CEILING_TEST] : [];
+  const tests = [...new Set([...named, ...files.filter(isTest), ...ceiling])].sort();
   const byKind = (k) => tests.filter((f) => kindOf(f) === k);
   if (byKind("vitest").length > 0)
     stage("named", run("named", bin("vitest"), ["run", "--passWithNoTests", ...byKind("vitest")]));
diff --git a/scripts/gate/bkit-gate-changed.test.mjs b/scripts/gate/bkit-gate-changed.test.mjs
index c1f4060d1..70cbc758d 100644
--- a/scripts/gate/bkit-gate-changed.test.mjs
+++ b/scripts/gate/bkit-gate-changed.test.mjs
@@ -1,7 +1,7 @@
 // bkit's own checkout only; never shipped. Run: node --test scripts/gate/bkit-gate-changed.test.mjs
 import assert from "node:assert/strict";
 import { spawnSync } from "node:child_process";
-import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
+import { mkdtempSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
 import { join, relative, resolve } from "node:path";
 import { test } from "node:test";
 import { fileURLToPath } from "node:url";
@@ -51,3 +51,12 @@ test("passes the limit args to the node --test stage", (t) => {
   assert.match(out, /named: node --test .*--test-timeout=\d+/, out);
   assert.match(out, /named: node --test .*--test-force-exit/, out);
 });
+
+test("a changed workflow or prompt file runs the text ceiling test", () => {
+  for (const dir of [".bkit/core/workflows", ".bkit/core/prompts"]) {
+    const file = readdirSync(join(root, dir)).find((f) => f.endsWith(".md"));
+    const res = gate(`${dir}/${file}`);
+    const out = res.stdout + res.stderr;
+    assert.match(out, /named: vitest run .*agent-text-ceiling\.test\.ts/, out);
+  }
+});
