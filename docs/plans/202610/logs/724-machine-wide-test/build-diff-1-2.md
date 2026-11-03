diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index 562ceaec8..b3b04d601 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -13,7 +13,7 @@
 
 ## What each template is for
 
-The adoption order is the `bkit tips` order. The local stack lock has no tip, because nothing in a repo shows a stack that every worktree shares, so adopt it once a second worktree touches that stack. The health check has no tip either: the `bkit-stub-health` advisory raises it while your CI copy keeps that stub. The sections below give each template's install steps and traps.
+The adoption order is the `bkit tips` order. The machine lock has no tip, so adopt it when test gates or local services need to run one at a time across checkouts. The health check has no tip either: the `bkit-stub-health` advisory raises it while your CI copy keeps that stub. The sections below give each template's install steps and traps.
 
 <!-- prettier-ignore -->
 | Template | What it's for | Skip it and |
@@ -38,7 +38,7 @@ The adoption order is the `bkit tips` order. The local stack lock has no tip, be
 | Prettier tables | One edited cell = one changed row in the diff. | A one-word table edit diffs as the whole table. |
 | tmp/ prune | Each push deletes scratch files agents left in `tmp/` untouched for a week. | `tmp/` keeps growing; old logs and scratch files are never cleared. |
 | Disk prune | Your own cleanup steps (build caches, Docker, simulators) run on commit, on push, and before a worktree is made on a low disk. bkit deletes nothing itself. | Caches fill the disk until no worktree can be made; every workflow stops. |
-| Local stack lock | One run at a time on local services every worktree shares (Docker database, emulator); a second run waits and names the run holding them. | A reset or stop from one worktree wipes the stack under another worktree's test run; the failures look like real bugs. |
+| Machine lock | Named locks run one gate at a time across repositories; the unnamed lock protects local services every worktree shares. A second run waits and names the holder. | Test gates compete for CPU, or a reset stops the stack under another worktree's test run. |
 | Cursor editor + cloud agent | Format-on-save, recommended extensions, Cursor cloud-agent image. | Cursor edits miss project formatting; no Cursor cloud agent. |
 | Launchd GUI env | macOS apps opened from the Dock get the same tokens as the terminal. | Dock-launched editors start signed out. |
 
@@ -71,7 +71,7 @@ The adoption order is the `bkit tips` order. The local stack lock has no tip, be
 | Prettier tables | `.bkit/templates/scripts/prettier/bkit-insert-ignore.mjs` | `scripts/prettier/` | that file |
 | tmp/ prune | `.bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs` | `scripts/cleanup/` | that file |
 | Disk prune | `.bkit/templates/scripts/cleanup/bkit-disk-prune.mjs`, `bkit-disk-prune.machine.mjs` | `scripts/cleanup/bkit-disk-prune.mjs`, `~/.config/bkit/disk-prune.mjs` | `scripts/cleanup/bkit-disk-prune.mjs` only |
-| Local stack lock | `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` | `scripts/ci/` | that file |
+| Machine lock | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | `scripts/ci/` | that file |
 | Context-fetch blocks | `.bkit/templates/context/bkit-<provider>.md` | below `<!-- bkit:end -->` in `.agents/context.md` | the blocks you use |
 | Cloud SessionStart hook | `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` | `.claude/hooks/bkit-cloud-bootstrap.sh` | that file |
 
@@ -878,14 +878,14 @@ Every worktree of a repo uses the same local services when their names and ports
 
 ```bash
 mkdir -p scripts/ci
-cp .bkit/templates/scripts/ci/bkit-local-stack-lock.sh scripts/ci/
+cp .bkit/templates/scripts/ci/bkit-machine-lock.sh scripts/ci/
 ```
 
 <!-- prettier-ignore -->
 | Wire into | How | Holds the lock |
 | --- | --- | --- |
-| `package.json` scripts that start / reset / stop the stack | `"db:reset": "bash scripts/ci/bkit-local-stack-lock.sh run db:reset -- <reset command>"` | for the command; its exit status passes on |
-| local runners that test against the stack | `. scripts/ci/bkit-local-stack-lock.sh`, then `take_local_stack_lock "<who>"` before the first stack command; non-zero → exit | until the runner exits or calls `release_local_stack_lock` |
+| `package.json` scripts that start / reset / stop the stack | `"db:reset": "bash scripts/ci/bkit-machine-lock.sh run db:reset -- <reset command>"` | for the command; its exit status passes on |
+| local runners that test against the stack | `. scripts/ci/bkit-machine-lock.sh`, then `take_local_stack_lock "<who>"` before the first stack command; non-zero → exit | until the runner exits or calls `release_local_stack_lock` |
 
 - Functions (all safe under `set -e`):
   - `take_local_stack_lock` waits.
diff --git a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
index 84f58e214..638e68b2f 100644
--- a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
+++ b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
@@ -343,10 +343,7 @@ const ADOPTED: Record<string, Entry> = {
     status: "not-adopted",
     what: "ships with the opt-in guard",
   },
-  "scripts/ci/bkit-local-stack-lock.sh": {
-    status: "not-adopted",
-    what: "this repo starts no local service that its worktrees share",
-  },
+  "scripts/ci/bkit-machine-lock.sh": identical,
   "scripts/ci/bkit-check-capstone.mjs": identical,
   "scripts/ci/bkit-check-capstone.test.mjs": identical,
   "scripts/ci/bkit-check-dependency-audit.mjs": identical,
diff --git a/.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts b/.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts
deleted file mode 100644
index a7ab1247d..000000000
--- a/.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts
+++ /dev/null
@@ -1,264 +0,0 @@
-// audits/templates/local-stack-lock.integration.test.ts — the local stack lock bkit ships as a
-// copy-and-own template, run for real: real bash, real perl holder, real flock. Each test points
-// XDG_CACHE_HOME at its own folder, so a real run on this machine is never touched or waited on.
-
-import { type ChildProcess, spawn, spawnSync } from "node:child_process";
-import * as fs from "node:fs";
-import * as os from "node:os";
-import * as path from "node:path";
-
-import { afterEach, beforeEach, describe, expect, it } from "vitest";
-
-const SCRIPT = path.resolve(".bkit/templates/scripts/ci/bkit-local-stack-lock.sh");
-const CHECKOUT = spawnSync("git", ["-C", path.dirname(SCRIPT), "rev-parse", "--show-toplevel"], {
-  encoding: "utf-8",
-}).stdout.trim();
-
-interface Result {
-  status: number | null;
-  stdout: string;
-  stderr: string;
-  ms: number;
-}
-
-let tmp: string;
-let cache: string;
-let children: ChildProcess[];
-
-beforeEach(() => {
-  tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-stack-lock-")));
-  cache = path.join(tmp, "cache");
-  children = [];
-});
-afterEach(() => {
-  for (const child of children) child.kill("SIGKILL");
-  fs.rmSync(tmp, { recursive: true, force: true });
-});
-
-/** The test's own lock folder; CI, an inherited owner and a stack name are cleared so the lock really runs. */
-function envFor(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
-  const env: NodeJS.ProcessEnv = { ...process.env, XDG_CACHE_HOME: cache };
-  delete env.CI;
-  delete env.LOCAL_STACK_LOCK_OWNER;
-  delete env.BKIT_LOCAL_STACK;
-  return { ...env, ...extra };
-}
-
-/** Runs a bash snippet with `script` sourced. */
-function run(snippet: string, env: NodeJS.ProcessEnv, script = SCRIPT): Result {
-  const started = Date.now();
-  const r = spawnSync("bash", ["-c", `. "${script}"; ${snippet}`], {
-    env,
-    encoding: "utf-8",
-    timeout: 30_000,
-  });
-  return { status: r.status, stdout: r.stdout, stderr: r.stderr, ms: Date.now() - started };
-}
-
-/** A run that takes the lock and holds it `holdS` seconds; `locked` resolves once it holds it. */
-function hold(who: string, holdS: number, env: NodeJS.ProcessEnv, script = SCRIPT) {
-  const child = spawn(
-    "bash",
-    ["-c", `. "${script}"; take_local_stack_lock "${who}" || exit 1; echo locked; sleep ${holdS}`],
-    { env, stdio: ["ignore", "pipe", "pipe"] },
-  );
-  children.push(child);
-  const done = new Promise<void>((resolve) => child.on("exit", () => resolve()));
-  const locked = new Promise<void>((resolve, reject) => {
-    child.stdout.on("data", (d: Buffer) => {
-      if (String(d).includes("locked")) resolve();
-    });
-    child.on("exit", (code) => reject(new Error(`holder exited ${code} before taking the lock`)));
-  });
-  return { child, locked, done };
-}
-
-/** git in `cwd`, failing the test on a non-zero exit. */
-function git(cwd: string, args: string[]): void {
-  const r = spawnSync(
-    "git",
-    ["-c", "user.email=t@t", "-c", "user.name=t", "-c", "commit.gpgsign=false", ...args],
-    { cwd, encoding: "utf-8" },
-  );
-  expect(r.status, `git ${args.join(" ")}: ${r.stderr}`).toBe(0);
-}
-
-describe("bkit-local-stack-lock.sh", () => {
-  it("a second run cannot take the lock while the first holds it, and is told who holds it", async () => {
-    const env = envFor();
-    const first = hold("first run", 10, env);
-    await first.locked;
-    const second = run(`try_local_stack_lock "second run"`, env);
-    expect(second.status).toBe(1);
-    expect(second.stderr).toContain("first run");
-    expect(second.stderr).toContain(CHECKOUT);
-  });
-
-  it("a killed holder leaves no stale lock", async () => {
-    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "10" });
-    const first = hold("killed run", 60, env);
-    await first.locked;
-    first.child.kill("SIGKILL");
-    await first.done;
-    const after = run(`take_local_stack_lock "next run" && echo got-it`, env);
-    expect(after.stdout, after.stderr).toContain("got-it");
-    expect(after.status).toBe(0);
-    expect(after.ms).toBeLessThan(8_000);
-  });
-
-  it("a waiting run starts as soon as the holder finishes, having said who it waits for", async () => {
-    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "20" });
-    const first = hold("short run", 2, env);
-    await first.locked;
-    const second = run(`take_local_stack_lock "waiting run" && echo got-it`, env);
-    await first.done;
-    expect(second.stdout, second.stderr).toContain("got-it");
-    expect(second.stderr).toContain("waiting run is waiting for the local stack");
-    expect(second.stderr).toContain("in use by short run");
-    expect(second.ms).toBeGreaterThanOrEqual(1_000);
-  });
-
-  it("the wait gives up at LOCAL_STACK_LOCK_WAIT_S, naming the holder", async () => {
-    const env = envFor();
-    const first = hold("long run", 30, env);
-    await first.locked;
-    const second = run(`take_local_stack_lock "impatient run"`, {
-      ...env,
-      LOCAL_STACK_LOCK_WAIT_S: "2",
-    });
-    expect(second.status).toBe(1);
-    expect(second.stderr).toMatch(/impatient run gave up after 2s .*long run/);
-  });
-
-  it("release frees the lock before the caller exits", () => {
-    const r = run(
-      `take_local_stack_lock a || exit 1
-       release_local_stack_lock
-       bash -c '. "${SCRIPT}"; try_local_stack_lock b' || exit 9
-       echo released`,
-      envFor(),
-    );
-    expect(r.stdout, r.stderr).toContain("released");
-    expect(r.status).toBe(0);
-  });
-
-  it("a caller under `set -e` survives a refused try", async () => {
-    const env = envFor();
-    const first = hold("busy run", 30, env);
-    await first.locked;
-    const busy = run(`set -e; if try_local_stack_lock a; then :; fi; echo after-busy`, env);
-    expect(busy.stdout, busy.stderr).toContain("after-busy");
-  });
-
-  it("a caller under `set -e` survives releasing a holder that is already gone", () => {
-    const gone = run(
-      `set -e; take_local_stack_lock a; kill "$LOCAL_STACK_LOCK_PID"; sleep 0.3; release_local_stack_lock; echo after-release`,
-      envFor({ LOCAL_STACK_LOCK_WAIT_S: "10" }),
-    );
-    expect(gone.stdout, gone.stderr).toContain("after-release");
-  });
-
-  it("a runner started by the holder does not wait on its parent", () => {
-    const r = run(
-      `take_local_stack_lock parent || exit 1
-       LOCAL_STACK_LOCK_WAIT_S=2 bash -c '. "${SCRIPT}"; take_local_stack_lock child' && echo nested-ok`,
-      envFor(),
-    );
-    expect(r.stdout, r.stderr).toContain("nested-ok");
-    expect(r.stderr).not.toContain("waiting");
-  });
-
-  it("a stack named by BKIT_LOCAL_STACK never waits on the shared one", async () => {
-    const env = envFor();
-    const first = hold("shared run", 30, env);
-    await first.locked;
-    const r = run(`try_local_stack_lock throwaway && local_stack_lock_file`, {
-      ...env,
-      BKIT_LOCAL_STACK: "throwaway-test",
-    });
-    expect(r.status, r.stderr).toBe(0);
-    expect(r.stdout.trim()).toBe(
-      path.join(cache, "bkit", "local-stack-lock", "throwaway-test.lock"),
-    );
-  });
-
-  it("every worktree of one repo resolves the main checkout's lock, and waits on it", async () => {
-    const main = path.join(tmp, "app-main");
-    const worktree = path.join(tmp, "app-feature");
-    fs.mkdirSync(path.join(main, "scripts", "ci"), { recursive: true });
-    fs.copyFileSync(SCRIPT, path.join(main, "scripts", "ci", "bkit-local-stack-lock.sh"));
-    git(tmp, ["init", "-q", "-b", "dev", main]);
-    git(main, ["add", "."]);
-    git(main, ["commit", "-q", "-m", "init"]);
-    git(main, ["worktree", "add", "-q", "-b", "feat", worktree]);
-    const inMain = path.join(main, "scripts", "ci", "bkit-local-stack-lock.sh");
-    const inWorktree = path.join(worktree, "scripts", "ci", "bkit-local-stack-lock.sh");
-    const env = envFor();
-
-    const lockFile = path.join(cache, "bkit", "local-stack-lock", "app-main.lock");
-    expect(run("local_stack_lock_file", env, inMain).stdout.trim()).toBe(lockFile);
-    expect(run("local_stack_lock_file", env, inWorktree).stdout.trim()).toBe(lockFile);
-
-    const first = hold("main run", 30, env, inMain);
-    await first.locked;
-    const second = run(`try_local_stack_lock "worktree run"`, env, inWorktree);
-    expect(second.status).toBe(1);
-    expect(second.stderr).toContain(`main run — ${main}`);
-  });
-
-  it("outside a git checkout with no BKIT_LOCAL_STACK it refuses, saying why", () => {
-    const loose = path.join(tmp, "loose");
-    fs.mkdirSync(loose);
-    fs.copyFileSync(SCRIPT, path.join(loose, "bkit-local-stack-lock.sh"));
-    const r = run(
-      `take_local_stack_lock "loose run"`,
-      envFor({ GIT_CEILING_DIRECTORIES: tmp }),
-      path.join(loose, "bkit-local-stack-lock.sh"),
-    );
-    expect(r.status).toBe(1);
-    expect(r.stderr).toContain("cannot name the local stack");
-    expect(fs.existsSync(path.join(cache, "bkit"))).toBe(false);
-  });
-
-  it("a holder that stops before it answers fails the take at once instead of hanging", () => {
-    const broken = path.join(tmp, "broken-lock.sh");
-    const text = fs.readFileSync(SCRIPT, "utf-8");
-    expect(text).toContain("/usr/bin/perl -e '\n");
-    fs.writeFileSync(broken, text.replace("/usr/bin/perl -e '\n", "/usr/bin/perl -e 'exit 1;\n"));
-    const r = run(`take_local_stack_lock "doomed run"`, envFor({ BKIT_LOCAL_STACK: "x" }), broken);
-    expect(r.status).toBe(1);
-    expect(r.stderr).toContain("stopped before it answered");
-    expect(r.ms).toBeLessThan(10_000);
-  });
-
-  it.each(["true", "1"])("CI=%s is a no-op that creates no lock file", (ci) => {
-    const r = run(`take_local_stack_lock ci-run && echo ok`, envFor({ CI: ci }));
-    expect(r.stdout, r.stderr).toContain("ok");
-    expect(r.status).toBe(0);
-    expect(fs.existsSync(path.join(cache, "bkit"))).toBe(false);
-  });
-
-  it("`run` holds the lock for the command and passes its exit status on", () => {
-    const r = spawnSync(
-      "bash",
-      [
-        SCRIPT,
-        "run",
-        "pkg script",
-        "--",
-        "bash",
-        "-c",
-        'cat "$XDG_CACHE_HOME"/bkit/local-stack-lock/*.holder; exit 3',
-      ],
-      { env: envFor(), encoding: "utf-8" },
-    );
-    expect(r.status, r.stderr).toBe(3);
-    expect(r.stdout).toContain("pkg script");
-  });
-
-  it("`run` with no arguments prints usage and exits 2", () => {
-    const r = spawnSync("bash", [SCRIPT], { env: envFor(), encoding: "utf-8" });
-    expect(r.status).toBe(2);
-    expect(r.stderr).toContain("usage");
-  });
-});
diff --git a/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts b/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
new file mode 100644
index 000000000..03eaf07f5
--- /dev/null
+++ b/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
@@ -0,0 +1,570 @@
+// audits/templates/machine-lock.integration.test.ts — the local stack lock bkit ships as a
+// copy-and-own template, run for real: real bash, real perl holder, real flock. Each test points
+// XDG_CACHE_HOME at its own folder, so a real run on this machine is never touched or waited on.
+
+import { type ChildProcess, spawn, spawnSync } from "node:child_process";
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+import { setTimeout as delay } from "node:timers/promises";
+
+import { afterEach, beforeEach, describe, expect, it } from "vitest";
+
+import { tierTimeouts } from "../../../../../vitest.timeout-budget";
+
+const OLD_SCRIPT = path.resolve("tests/fixtures/machine-lock/stack-lock-6.0.0.sh");
+const BUDGET = tierTimeouts(true);
+
+const SCRIPT = path.resolve(".bkit/templates/scripts/ci/bkit-machine-lock.sh");
+const CHECKOUT = spawnSync("git", ["-C", path.dirname(SCRIPT), "rev-parse", "--show-toplevel"], {
+  encoding: "utf-8",
+}).stdout.trim();
+
+interface Result {
+  status: number | null;
+  stdout: string;
+  stderr: string;
+  ms: number;
+}
+
+let tmp: string;
+let cache: string;
+let children: ChildProcess[];
+
+beforeEach(() => {
+  tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-stack-lock-")));
+  cache = path.join(tmp, "cache");
+  children = [];
+});
+afterEach(() => {
+  for (const child of children) child.kill("SIGKILL");
+  fs.rmSync(tmp, { recursive: true, force: true });
+});
+
+/** The test's own lock folder; CI, an inherited owner and a stack name are cleared so the lock really runs. */
+function envFor(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
+  const env: NodeJS.ProcessEnv = { ...process.env, XDG_CACHE_HOME: cache };
+  delete env.CI;
+  for (const key of Object.keys(env)) {
+    if (key.startsWith("LOCAL_STACK_LOCK_OWNER") || key.startsWith("LOCAL_STACK_LOCK_PID")) {
+      delete env[key];
+    }
+  }
+  delete env.BKIT_TEST_SLOTS;
+  delete env.BKIT_LOCAL_STACK;
+  return { ...env, ...extra };
+}
+
+/** Runs a bash snippet with `script` sourced. */
+function run(snippet: string, env: NodeJS.ProcessEnv, script = SCRIPT): Result {
+  const started = Date.now();
+  const r = spawnSync("bash", ["-c", `. "${script}"; ${snippet}`], {
+    env,
+    encoding: "utf-8",
+    timeout: BUDGET.testTimeout,
+  });
+  return { status: r.status, stdout: r.stdout, stderr: r.stderr, ms: Date.now() - started };
+}
+
+/** A run that takes the lock and holds it `holdS` seconds; `locked` resolves once it holds it. */
+function hold(who: string, holdS: number, env: NodeJS.ProcessEnv, script = SCRIPT) {
+  const child = spawn(
+    "bash",
+    ["-c", `. "${script}"; take_local_stack_lock "${who}" || exit 1; echo locked; sleep ${holdS}`],
+    { env, stdio: ["ignore", "pipe", "pipe"] },
+  );
+  children.push(child);
+  const done = new Promise<void>((resolve) => child.on("exit", () => resolve()));
+  const lockFile = run("local_stack_lock_file", env, script);
+  const locked = waitForHolder(lockFile.stdout.trim() + ".holder", who, child);
+  return { child, locked, done };
+}
+
+/** git in `cwd`, failing the test on a non-zero exit. */
+function git(cwd: string, args: string[]): void {
+  const r = spawnSync(
+    "git",
+    ["-c", "user.email=t@t", "-c", "user.name=t", "-c", "commit.gpgsign=false", ...args],
+    { cwd, encoding: "utf-8" },
+  );
+  expect(r.status, `git ${args.join(" ")}: ${r.stderr}`).toBe(0);
+}
+
+async function waitForHolder(file: string, who: string, child: ChildProcess): Promise<void> {
+  const until = Date.now() + BUDGET.hookTimeout;
+  while (Date.now() < until) {
+    if (fs.existsSync(file) && fs.readFileSync(file, "utf-8").includes(who)) return;
+    if (child.exitCode !== null || child.signalCode !== null) {
+      throw new Error("holder " + who + " exited before writing " + file);
+    }
+    await delay(25);
+  }
+  throw new Error("holder " + who + " did not write " + file);
+}
+
+function holdNamed(who: string, name: string, env: NodeJS.ProcessEnv, script = SCRIPT, holdS = 30) {
+  const child = spawn(
+    "bash",
+    [
+      "-c",
+      '. "' +
+        script +
+        '"; take_local_stack_lock "' +
+        who +
+        '" "' +
+        name +
+        '" || exit 1; sleep ' +
+        holdS,
+    ],
+    { env, stdio: ["ignore", "pipe", "pipe"] },
+  );
+  children.push(child);
+  const done = new Promise<void>((resolve) => child.on("exit", () => resolve()));
+  const locked = waitForHolder(
+    path.join(cache, "bkit", "machine-lock", name + ".lock.holder"),
+    who,
+    child,
+  );
+  return { child, locked, done };
+}
+
+function checkout(name: string): { root: string; script: string } {
+  const root = path.join(tmp, name);
+  const script = path.join(root, "scripts", "ci", "bkit-machine-lock.sh");
+  fs.mkdirSync(path.dirname(script), { recursive: true });
+  fs.copyFileSync(SCRIPT, script);
+  git(tmp, ["init", "-q", "-b", "dev", root]);
+  return { root, script };
+}
+
+function commandRun(args: string[], env: NodeJS.ProcessEnv, script = SCRIPT): Result {
+  const started = Date.now();
+  const result = spawnSync("bash", [script, "run", ...args], {
+    env,
+    encoding: "utf-8",
+    timeout: BUDGET.testTimeout,
+  });
+  return {
+    status: result.status,
+    stdout: result.stdout,
+    stderr: result.stderr,
+    ms: Date.now() - started,
+  };
+}
+
+describe("bkit-machine-lock.sh", { timeout: BUDGET.testTimeout }, () => {
+  it("punctuation in distinct named locks keeps acquisition and release state separate", () => {
+    const result = run(
+      'take_local_stack_lock "hyphen holder" a-b || exit 11\n' +
+        'take_local_stack_lock "underscore holder" a_b || exit 12\n' +
+        "local_stack_lock_holder a-b\nlocal_stack_lock_holder a_b\n" +
+        "release_local_stack_lock a-b\n" +
+        'printf "remaining: "; local_stack_lock_holder a_b\n' +
+        "release_local_stack_lock a_b",
+      envFor(),
+    );
+    expect(result.status, result.stderr).toBe(0);
+    expect(result.stdout).toContain("hyphen holder");
+    expect(result.stdout).toContain("underscore holder");
+    expect(result.stdout).toContain("remaining: underscore holder");
+  });
+
+  it.each(["", "tests", "a-b"])("unset owner state is safe under bash -eu for lock %j", (name) => {
+    const result = spawnSync(
+      "bash",
+      [
+        "-eu",
+        "-c",
+        '. "$1"; take_local_stack_lock "strict caller" "$2"; local_stack_lock_holder "$2"; release_local_stack_lock "$2"; release_local_stack_lock "$2"',
+        "strict-lock",
+        SCRIPT,
+        name,
+      ],
+      {
+        env: envFor({ BKIT_LOCAL_STACK: "strict-stack" }),
+        encoding: "utf-8",
+        timeout: BUDGET.testTimeout,
+      },
+    );
+    expect(result.status, result.stderr).toBe(0);
+    expect(result.stdout).toContain("strict caller");
+    expect(result.stderr).not.toContain("unbound variable");
+  });
+
+  it("a second run cannot take the lock while the first holds it, and is told who holds it", async () => {
+    const env = envFor();
+    const first = hold("first run", 10, env);
+    await first.locked;
+    const second = run(`try_local_stack_lock "second run"`, env);
+    expect(second.status).toBe(1);
+    expect(second.stderr).toContain("first run");
+    expect(second.stderr).toContain(CHECKOUT);
+  });
+
+  it("a killed holder leaves no stale lock", async () => {
+    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "10" });
+    const first = hold("killed run", 60, env);
+    await first.locked;
+    first.child.kill("SIGKILL");
+    await first.done;
+    const after = run(`take_local_stack_lock "next run" && echo got-it`, env);
+    expect(after.stdout, after.stderr).toContain("got-it");
+    expect(after.status).toBe(0);
+    expect(after.ms).toBeLessThan(8_000);
+  });
+
+  it("a waiting run starts as soon as the holder finishes, having said who it waits for", async () => {
+    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "20" });
+    const first = hold("short run", 2, env);
+    await first.locked;
+    const second = run(`take_local_stack_lock "waiting run" && echo got-it`, env);
+    await first.done;
+    expect(second.stdout, second.stderr).toContain("got-it");
+    expect(second.stderr).toContain("waiting run is waiting for the local stack");
+    expect(second.stderr).toContain("in use by short run");
+    expect(second.ms).toBeGreaterThanOrEqual(1_000);
+  });
+
+  it("the wait gives up at LOCAL_STACK_LOCK_WAIT_S, naming the holder", async () => {
+    const env = envFor();
+    const first = hold("long run", 30, env);
+    await first.locked;
+    const second = run(`take_local_stack_lock "impatient run"`, {
+      ...env,
+      LOCAL_STACK_LOCK_WAIT_S: "2",
+    });
+    expect(second.status).toBe(1);
+    expect(second.stderr).toMatch(/impatient run gave up after 2s .*long run/);
+  });
+
+  it("release frees the lock before the caller exits", () => {
+    const r = run(
+      `take_local_stack_lock a || exit 1
+       release_local_stack_lock
+       bash -c '. "${SCRIPT}"; try_local_stack_lock b' || exit 9
+       echo released`,
+      envFor(),
+    );
+    expect(r.stdout, r.stderr).toContain("released");
+    expect(r.status).toBe(0);
+  });
+
+  it("a caller under `set -e` survives a refused try", async () => {
+    const env = envFor();
+    const first = hold("busy run", 30, env);
+    await first.locked;
+    const busy = run(`set -e; if try_local_stack_lock a; then :; fi; echo after-busy`, env);
+    expect(busy.stdout, busy.stderr).toContain("after-busy");
+  });
+
+  it("a caller under `set -e` survives releasing a holder that is already gone", () => {
+    const gone = run(
+      `set -e; take_local_stack_lock a; kill "$LOCAL_STACK_LOCK_PID"; sleep 0.3; release_local_stack_lock; echo after-release`,
+      envFor({ LOCAL_STACK_LOCK_WAIT_S: "10" }),
+    );
+    expect(gone.stdout, gone.stderr).toContain("after-release");
+  });
+
+  it("a runner started by the holder does not wait on its parent", () => {
+    const r = run(
+      `take_local_stack_lock parent || exit 1
+       LOCAL_STACK_LOCK_WAIT_S=2 bash -c '. "${SCRIPT}"; take_local_stack_lock child' && echo nested-ok`,
+      envFor(),
+    );
+    expect(r.stdout, r.stderr).toContain("nested-ok");
+    expect(r.stderr).not.toContain("waiting");
+  });
+
+  it("a stack named by BKIT_LOCAL_STACK never waits on the shared one", async () => {
+    const env = envFor();
+    const first = hold("shared run", 30, env);
+    await first.locked;
+    const r = run(`try_local_stack_lock throwaway && local_stack_lock_file`, {
+      ...env,
+      BKIT_LOCAL_STACK: "throwaway-test",
+    });
+    expect(r.status, r.stderr).toBe(0);
+    expect(r.stdout.trim()).toBe(
+      path.join(cache, "bkit", "local-stack-lock", "throwaway-test.lock"),
+    );
+  });
+
+  it("every worktree of one repo resolves the main checkout's lock, and waits on it", async () => {
+    const main = path.join(tmp, "app-main");
+    const worktree = path.join(tmp, "app-feature");
+    fs.mkdirSync(path.join(main, "scripts", "ci"), { recursive: true });
+    fs.copyFileSync(SCRIPT, path.join(main, "scripts", "ci", "bkit-machine-lock.sh"));
+    git(tmp, ["init", "-q", "-b", "dev", main]);
+    git(main, ["add", "."]);
+    git(main, ["commit", "-q", "-m", "init"]);
+    git(main, ["worktree", "add", "-q", "-b", "feat", worktree]);
+    const inMain = path.join(main, "scripts", "ci", "bkit-machine-lock.sh");
+    const inWorktree = path.join(worktree, "scripts", "ci", "bkit-machine-lock.sh");
+    const env = envFor();
+
+    const lockFile = path.join(cache, "bkit", "local-stack-lock", "app-main.lock");
+    expect(run("local_stack_lock_file", env, inMain).stdout.trim()).toBe(lockFile);
+    expect(run("local_stack_lock_file", env, inWorktree).stdout.trim()).toBe(lockFile);
+
+    const first = hold("main run", 30, env, inMain);
+    await first.locked;
+    const second = run(`try_local_stack_lock "worktree run"`, env, inWorktree);
+    expect(second.status).toBe(1);
+    expect(second.stderr).toContain(`main run — ${main}`);
+  });
+
+  it("outside a git checkout with no BKIT_LOCAL_STACK it refuses, saying why", () => {
+    const loose = path.join(tmp, "loose");
+    fs.mkdirSync(loose);
+    fs.copyFileSync(SCRIPT, path.join(loose, "bkit-machine-lock.sh"));
+    const r = run(
+      `take_local_stack_lock "loose run"`,
+      envFor({ GIT_CEILING_DIRECTORIES: tmp }),
+      path.join(loose, "bkit-machine-lock.sh"),
+    );
+    expect(r.status).toBe(1);
+    expect(r.stderr).toContain("cannot name the local stack");
+    expect(fs.existsSync(path.join(cache, "bkit"))).toBe(false);
+  });
+
+  it("a holder that stops before it answers fails the take at once instead of hanging", () => {
+    const broken = path.join(tmp, "broken-lock.sh");
+    const text = fs.readFileSync(SCRIPT, "utf-8");
+    expect(text).toContain("/usr/bin/perl -e '\n");
+    fs.writeFileSync(broken, text.replace("/usr/bin/perl -e '\n", "/usr/bin/perl -e 'exit 1;\n"));
+    const r = run(`take_local_stack_lock "doomed run"`, envFor({ BKIT_LOCAL_STACK: "x" }), broken);
+    expect(r.status).toBe(1);
+    expect(r.stderr).toContain("stopped before it answered");
+    expect(r.ms).toBeLessThan(10_000);
+  });
+
+  it.each(["true", "1"])("CI=%s is a no-op that creates no lock file", (ci) => {
+    const r = run(`take_local_stack_lock ci-run && echo ok`, envFor({ CI: ci }));
+    expect(r.stdout, r.stderr).toContain("ok");
+    expect(r.status).toBe(0);
+    expect(fs.existsSync(path.join(cache, "bkit"))).toBe(false);
+  });
+
+  it("`run` holds the lock for the command and passes its exit status on", () => {
+    const r = spawnSync(
+      "bash",
+      [
+        SCRIPT,
+        "run",
+        "pkg script",
+        "--",
+        "bash",
+        "-c",
+        'cat "$XDG_CACHE_HOME"/bkit/local-stack-lock/*.holder; exit 3',
+      ],
+      { env: envFor(), encoding: "utf-8" },
+    );
+    expect(r.status, r.stderr).toBe(3);
+    expect(r.stdout).toContain("pkg script");
+  });
+
+  it("`run` with no arguments prints usage and exits 2", () => {
+    const r = spawnSync("bash", [SCRIPT], { env: envFor(), encoding: "utf-8" });
+    expect(r.status).toBe(2);
+    expect(r.stderr).toContain("usage");
+  });
+
+  it("a named lock is machine-wide: checkouts of two different repos wait on the same named lock", async () => {
+    const firstRepo = checkout("first-repo");
+    const secondRepo = checkout("second-repo");
+    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "10" });
+    const first = holdNamed("first repo gate", "tests", env, firstRepo.script, 2);
+    await first.locked;
+    const second = run(
+      'take_local_stack_lock "second repo gate" tests && echo acquired',
+      env,
+      secondRepo.script,
+    );
+    await first.done;
+    expect(second.status, second.stderr).toBe(0);
+    expect(second.stdout).toContain("acquired");
+    expect(second.stderr).toContain("first repo gate");
+    expect(second.stderr).toContain(firstRepo.root);
+    expect(second.ms).toBeGreaterThanOrEqual(1_000);
+    expect(run("local_stack_lock_file tests", env, firstRepo.script).stdout.trim()).toBe(
+      path.join(cache, "bkit", "machine-lock", "tests.lock"),
+    );
+    expect(run("local_stack_lock_file tests", env, secondRepo.script).stdout.trim()).toBe(
+      path.join(cache, "bkit", "machine-lock", "tests.lock"),
+    );
+  });
+
+  it("one process holds a named lock and the unnamed stack lock side by side", () => {
+    const result = run(
+      'take_local_stack_lock "named run" example || exit 11\n' +
+        'take_local_stack_lock "stack run" || exit 12\n' +
+        "local_stack_lock_holder example\n" +
+        "local_stack_lock_holder\n" +
+        "release_local_stack_lock example\n" +
+        "local_stack_lock_holder\n" +
+        "release_local_stack_lock\n" +
+        "echo both-released",
+      envFor(),
+    );
+    expect(result.status, result.stderr).toBe(0);
+    expect(result.stdout.match(/named run/g)).toHaveLength(1);
+    expect(result.stdout.match(/stack run/g)).toHaveLength(2);
+    expect(result.stdout).toContain("both-released");
+  });
+
+  it("a runner started by a named-lock holder does not wait on that named lock", () => {
+    const result = run(
+      'take_local_stack_lock "parent named run" tests || exit 11\n' +
+        "LOCAL_STACK_LOCK_WAIT_S=0 bash -c '. \"" +
+        SCRIPT +
+        '"; take_local_stack_lock "child named run" tests && local_stack_lock_holder tests\'',
+      envFor(),
+    );
+    expect(result.status, result.stderr).toBe(0);
+    expect(result.stdout).toContain("parent named run");
+    expect(result.stdout).not.toContain("child named run");
+    expect(result.stderr).not.toContain("waiting");
+    expect(result.stderr).not.toContain("gave up");
+  });
+
+  it("the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other", async () => {
+    const env = envFor({ BKIT_LOCAL_STACK: "compat-stack", LOCAL_STACK_LOCK_WAIT_S: "10" });
+    const expected = path.join(cache, "bkit", "local-stack-lock", "compat-stack.lock");
+    expect(run("local_stack_lock_file", env).stdout.trim()).toBe(expected);
+    expect(run("local_stack_lock_file", env, OLD_SCRIPT).stdout.trim()).toBe(expected);
+    const older = hold("older stack run", 30, env, OLD_SCRIPT);
+    await older.locked;
+    const current = run('try_local_stack_lock "current stack run"', env);
+    expect(current.status).toBe(1);
+    expect(current.stderr).toContain("older stack run");
+    older.child.kill("SIGKILL");
+    await older.done;
+    const newer = hold("newer stack run", 30, env);
+    await newer.locked;
+    const oldWaiter = run('try_local_stack_lock "older waiter"', env, OLD_SCRIPT);
+    expect(oldWaiter.status).toBe(1);
+    expect(oldWaiter.stderr).toContain("newer stack run");
+  });
+
+  it("run --lock holds the named lock for the command and passes its exit status on", () => {
+    const result = commandRun(
+      [
+        "named package script",
+        "--lock",
+        "tests",
+        "--",
+        "bash",
+        "-c",
+        '. "' + SCRIPT + '"; local_stack_lock_holder tests; exit 7',
+      ],
+      envFor(),
+    );
+    expect(result.status, result.stderr).toBe(7);
+    expect(result.stdout).toContain("named package script");
+    expect(result.stdout).toContain(CHECKOUT);
+    expect(result.stdout).toMatch(/pid \d+/);
+  });
+
+  it("run exits 75 when the wait gives up, distinct from the command's own failure", async () => {
+    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "0" });
+    const holder = holdNamed("blocking tests gate", "tests", env);
+    await holder.locked;
+    const waiting = commandRun(
+      ["waiting tests gate", "--lock", "tests", "--", "bash", "-c", "echo should-not-run"],
+      env,
+    );
+    expect(waiting.status, waiting.stderr).toBe(75);
+    expect(waiting.stdout).not.toContain("should-not-run");
+    expect(waiting.stderr).toContain("waiting tests gate");
+    expect(waiting.stderr).toContain("tests");
+    expect(waiting.stderr).toContain("blocking tests gate");
+    const commandFailure = commandRun(
+      ["other named gate", "--lock", "another", "--", "bash", "-c", "echo command-ran; exit 75"],
+      env,
+    );
+    expect(commandFailure.status, commandFailure.stderr).toBe(75);
+    expect(commandFailure.stdout).toContain("command-ran");
+    expect(commandFailure.stderr).not.toContain("gave up");
+  });
+
+  it("run exits 73 naming the path when the lock dir cannot be written", () => {
+    const notDirectory = path.join(tmp, "cache-is-a-file");
+    fs.writeFileSync(notDirectory, "this blocks mkdir");
+    const result = commandRun(
+      ["unwritable gate", "--lock", "tests", "--", "bash", "-c", "echo should-not-run"],
+      envFor({ XDG_CACHE_HOME: notDirectory }),
+    );
+    expect(result.status).toBe(73);
+    expect(result.stdout).not.toContain("should-not-run");
+    expect(result.stderr).toContain(notDirectory);
+    expect(result.stderr).toContain("tests");
+    expect(result.stderr).toMatch(/cannot|could not|not a directory/i);
+  });
+
+  it("run exits 73 naming /usr/bin/perl when perl is missing", () => {
+    const broken = path.join(tmp, "no-perl-machine-lock.sh");
+    const missingPerl = path.join(tmp, "missing-perl");
+    const text = fs.readFileSync(SCRIPT, "utf-8");
+    expect(text).toContain("/usr/bin/perl");
+    fs.writeFileSync(broken, text.replaceAll("/usr/bin/perl", missingPerl));
+    const result = commandRun(
+      ["no perl gate", "--lock", "tests", "--", "bash", "-c", "echo should-not-run"],
+      envFor(),
+      broken,
+    );
+    expect(result.status).toBe(73);
+    expect(result.stdout).not.toContain("should-not-run");
+    expect(result.stderr).toContain(missingPerl);
+    expect(result.stderr).toContain("tests");
+    expect(result.stderr).toMatch(/not found|missing|not executable/);
+  });
+
+  it("a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy", async () => {
+    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "0", BKIT_LOCAL_STACK: "shared-stack" });
+    const stack = hold("separate stack holder", 30, env);
+    await stack.locked;
+    const current = run(
+      'take_local_stack_lock "tests parent" tests || exit 11\n' +
+        "bash -c '. \"" +
+        SCRIPT +
+        '"; take_local_stack_lock "current child" && echo stack-was-skipped\'\n' +
+        'child_status=$?; release_local_stack_lock tests; exit "$child_status"',
+      env,
+    );
+    expect(current.status).toBe(1);
+    expect(current.stdout).not.toContain("stack-was-skipped");
+    expect(current.stderr).toContain("separate stack holder");
+    const older = run(
+      'take_local_stack_lock "tests parent" tests || exit 11\n' +
+        "bash -c '. \"" +
+        OLD_SCRIPT +
+        '"; take_local_stack_lock "older child" && echo stack-was-skipped\'\n' +
+        'child_status=$?; release_local_stack_lock tests; exit "$child_status"',
+      env,
+    );
+    expect(older.status).toBe(1);
+    expect(older.stdout).not.toContain("stack-was-skipped");
+    expect(older.stderr).toContain("separate stack holder");
+  });
+
+  it("run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name", () => {
+    const command = '. "' + SCRIPT + '"; local_stack_lock_holder tests';
+    const fromEnvironment = commandRun(
+      ["--lock", "tests", "--", "bash", "-c", command],
+      envFor({
+        LOCAL_STACK_LOCK_WHO: "workflow tests run",
+        npm_lifecycle_event: "test:integration",
+      }),
+    );
+    expect(fromEnvironment.status, fromEnvironment.stderr).toBe(0);
+    expect(fromEnvironment.stdout).toContain("workflow tests run");
+    expect(fromEnvironment.stdout).not.toContain("test:integration");
+    const fromPackage = commandRun(
+      ["--lock", "tests", "--", "bash", "-c", command],
+      envFor({ LOCAL_STACK_LOCK_WHO: "", npm_lifecycle_event: "test:integration" }),
+    );
+    expect(fromPackage.status, fromPackage.stderr).toBe(0);
+    expect(fromPackage.stdout).toContain("test:integration");
+    expect(fromPackage.stdout).not.toContain("--lock");
+  });
+});
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index f6b5779c0..322605456 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -89,7 +89,7 @@ _No tracker connected, skip step._
 2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. Items:
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
      - A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
-     - Any unfixable gap (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`) → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
+     - Any unfixable gap (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, `test-loosened` logged `Fixable: false`) → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - A group-gate failure is never an item, because it is always fixed.
    - **If** `PAUSE_QUESTION` = `CHALLENGE`:
      - **If** `CHALLENGE_OVERFLOW` is set → the merge wrote nothing to the plan. Write one item per `Location` of each `CRITICAL`, `HIGH` or `MEDIUM` finding in the merged reports: `build-challenge-2.md`, plus `build-challenge-1.md` when the change is large.
@@ -579,7 +579,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --number=8 --post --title="Plan Verify" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>"
    ```
-   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`, `fields.Tasks` as `VERIFIED_TASKS`.
+   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`, `fields.Tasks` as `VERIFIED_TASKS`, `fields.Loosened` as `VERIFY_LOOSENED`.
 6. Tick the satisfied tasks in the plan. A task that the test-first report lists as a gap stays open:
    ```bash
    "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --tasks="{VERIFIED_TASKS}" --green="docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md"
@@ -654,25 +654,46 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" status route --file="{STATUS}" --workflow=build --step=build-plan-verify --group={GROUP} --require=verdict
    ```
-   Hold `verdict` as `VERIFY_VERDICT`.
+   Hold `verdict` as `VERIFY_VERDICT`. Read the `Loosened:` line of `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`'s header and hold its value as `VERIFY_LOOSENED`.
    **If** `docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` does not exist → `GATE_VERDICT` = SKIPPED.
    **Else** → read the group gate's verdict:
    ```bash
    "{BKIT}" status route --file="{STATUS}" --workflow=build --step=build-group-gate --group={GROUP} --require=verdict
    ```
    Hold `verdict` as `GATE_VERDICT`.
-2. **Subagent:** Invoke `@bkit-build-plan-gaps-remediate` using `Agent` tool:
+2. **If** `VERIFY_LOOSENED` != `none` → the tests step removed or loosened an expectation of an existing test (each `test-loosened` gap of the verify report, `Fixable: true`). The tests step restores it, because no code step may rewrite a planned test; no fixer runs this round:
+   **Subagent:** Invoke `@bkit-build-plan-tests` using `Agent` tool:
+   Context: You are a subagent in the Build phase. Restore these tests of group `{GROUP}`, which verify logged `test-loosened`: `{VERIFY_LOOSENED}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
+   Read: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md`.
+   Update: the tests named, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md`.
+   Record the restore. The command reads the group's `TEST FIRST` files from the plan and commits the diff:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-plan-tests --file="{STATUS}" --attempt-of=build-plan-tests:next --group={GROUP} --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --agent=bkit-build-plan-tests --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md --number=9 --post --title="Plan Gaps Remediate — tests restored" --message="chore({FID}): plan-tests group {GROUP} attempt <attempt>"
+   ```
+   **If** exit 15 → the diff changes a file no `TEST FIRST` line of the group names (`source`): invoke `@bkit-build-plan-tests` again with `"<problem> Undo your edits to each file in <source>: restore it to its committed content, or delete it when you created it. Write no source code."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   Record the group's red again:
+   ```bash
+   "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-tests-red --group={GROUP} --position=next
+   ```
+   Hold `value` as `RED_ATTEMPT`.
+   ```bash
+   "{BKIT}" tests red --file="{STATUS}" --workflow=build --group={GROUP} --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --log="docs/plans/{YYYYMM}/logs/{FID}/build-tests-red-{GROUP}-{RED_ATTEMPT}.md" --writer-log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md"
+   ```
+   Route — first match wins:
+   - **If** exit 0, 1 or 3 → re-run Step 8: the next verify round judges the restored diff, and a test the restore left unproven waits for Step 15 like any other.
+   - **Else** → **Failure Path**.
+3. **Subagent:** Invoke `@bkit-build-plan-gaps-remediate` using `Agent` tool:
    Context: You are a subagent in the Build phase. Group `{GROUP}`, attempt `{VERIFY_ATTEMPT}`. `Strategy`: `{STRATEGY}`. **If** `GATE_VERDICT` = FAIL → add `Group gate`: `"{BKIT}" tests run --gate=bkit:gate:static-unit --log="{OUTBOX}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-gate.log"`. **If** `VERIFY_VERDICT` = FAIL → add `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
    Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Update: Source files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`.
-3. Finish. The command records the header's `Strategy`:
+4. Finish. The command records the header's `Strategy`:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --number=9 --post --title="Plan Gaps Remediate" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>"
    ```
    **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `VERIFY_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Step 8 runs again and judges the fixes, and a later non-FAIL verify of the group answers a gaps-fix FAIL in the summary.
-4. Check that the attempt changed source files, not only logs and ledgers:
+5. Check that the attempt changed source files, not only logs and ledgers:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
    ```
diff --git a/.bkit/templates.md b/.bkit/templates.md
index a40b5ecd5..ddfa3e91d 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -13,7 +13,7 @@
 
 ## What each template is for
 
-The adoption order is the `bkit tips` order. The local stack lock has no tip, because nothing in a repo shows a stack that every worktree shares, so adopt it once a second worktree touches that stack. The health check has no tip either: the `bkit-stub-health` advisory raises it while your CI copy keeps that stub. The sections below give each template's install steps and traps.
+The adoption order is the `bkit tips` order. The machine lock has no tip, so adopt it when test gates or local services need to run one at a time across checkouts. The health check has no tip either: the `bkit-stub-health` advisory raises it while your CI copy keeps that stub. The sections below give each template's install steps and traps.
 
 <!-- prettier-ignore -->
 | Template | What it's for | Skip it and |
@@ -38,7 +38,7 @@ The adoption order is the `bkit tips` order. The local stack lock has no tip, be
 | Prettier tables | One edited cell = one changed row in the diff. | A one-word table edit diffs as the whole table. |
 | tmp/ prune | Each push deletes scratch files agents left in `tmp/` untouched for a week. | `tmp/` keeps growing; old logs and scratch files are never cleared. |
 | Disk prune | Your own cleanup steps (build caches, Docker, simulators) run on commit, on push, and before a worktree is made on a low disk. bkit deletes nothing itself. | Caches fill the disk until no worktree can be made; every workflow stops. |
-| Local stack lock | One run at a time on local services every worktree shares (Docker database, emulator); a second run waits and names the run holding them. | A reset or stop from one worktree wipes the stack under another worktree's test run; the failures look like real bugs. |
+| Machine lock | Named locks run one gate at a time across repositories; the unnamed lock protects local services every worktree shares. A second run waits and names the holder. | Test gates compete for CPU, or a reset stops the stack under another worktree's test run. |
 | Cursor editor + cloud agent | Format-on-save, recommended extensions, Cursor cloud-agent image. | Cursor edits miss project formatting; no Cursor cloud agent. |
 | Launchd GUI env | macOS apps opened from the Dock get the same tokens as the terminal. | Dock-launched editors start signed out. |
 
@@ -71,7 +71,7 @@ The adoption order is the `bkit tips` order. The local stack lock has no tip, be
 | Prettier tables | `.bkit/templates/scripts/prettier/bkit-insert-ignore.mjs` | `scripts/prettier/` | that file |
 | tmp/ prune | `.bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs` | `scripts/cleanup/` | that file |
 | Disk prune | `.bkit/templates/scripts/cleanup/bkit-disk-prune.mjs`, `bkit-disk-prune.machine.mjs` | `scripts/cleanup/bkit-disk-prune.mjs`, `~/.config/bkit/disk-prune.mjs` | `scripts/cleanup/bkit-disk-prune.mjs` only |
-| Local stack lock | `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` | `scripts/ci/` | that file |
+| Machine lock | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | `scripts/ci/` | that file |
 | Context-fetch blocks | `.bkit/templates/context/bkit-<provider>.md` | below `<!-- bkit:end -->` in `.agents/context.md` | the blocks you use |
 | Cloud SessionStart hook | `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` | `.claude/hooks/bkit-cloud-bootstrap.sh` | that file |
 
@@ -878,14 +878,14 @@ Every worktree of a repo uses the same local services when their names and ports
 
 ```bash
 mkdir -p scripts/ci
-cp .bkit/templates/scripts/ci/bkit-local-stack-lock.sh scripts/ci/
+cp .bkit/templates/scripts/ci/bkit-machine-lock.sh scripts/ci/
 ```
 
 <!-- prettier-ignore -->
 | Wire into | How | Holds the lock |
 | --- | --- | --- |
-| `package.json` scripts that start / reset / stop the stack | `"db:reset": "bash scripts/ci/bkit-local-stack-lock.sh run db:reset -- <reset command>"` | for the command; its exit status passes on |
-| local runners that test against the stack | `. scripts/ci/bkit-local-stack-lock.sh`, then `take_local_stack_lock "<who>"` before the first stack command; non-zero → exit | until the runner exits or calls `release_local_stack_lock` |
+| `package.json` scripts that start / reset / stop the stack | `"db:reset": "bash scripts/ci/bkit-machine-lock.sh run db:reset -- <reset command>"` | for the command; its exit status passes on |
+| local runners that test against the stack | `. scripts/ci/bkit-machine-lock.sh`, then `take_local_stack_lock "<who>"` before the first stack command; non-zero → exit | until the runner exits or calls `release_local_stack_lock` |
 
 - Functions (all safe under `set -e`):
   - `take_local_stack_lock` waits.
diff --git a/.bkit/templates/scripts/ci/bkit-machine-lock.sh b/.bkit/templates/scripts/ci/bkit-machine-lock.sh
new file mode 100644
index 000000000..cf85fc2be
--- /dev/null
+++ b/.bkit/templates/scripts/ci/bkit-machine-lock.sh
@@ -0,0 +1,246 @@
+#!/bin/bash
+# Example. Copy into scripts/ci/ and own it.
+# bkit install does not write this file and does not overwrite a copy.
+#
+# bkit-machine-lock.sh — machine-wide named locks and the checkout's shared stack lock.
+#
+#   . scripts/ci/bkit-machine-lock.sh
+#   take_local_stack_lock "<who>" [name]    # waits, returns 1 on refusal
+#   try_local_stack_lock "<who>" [name]     # returns 1 immediately while busy
+#   release_local_stack_lock [name]        # optional; caller exit also frees the lock
+#   local_stack_lock_holder [name]
+#   local_stack_lock_file [name]
+#
+# package.json: wrap test gates with
+#   bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <gate command> [args…]
+# run ["<who>"] [--lock <name>] -- <command> exits with the command's status:
+# 2 usage, 73 the lock could not be taken, 75 the wait gave up.
+# The run name defaults to LOCAL_STACK_LOCK_WHO, npm_lifecycle_event, then run.
+#
+# Named locks live in ${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/ with no
+# repository prefix. The unnamed stack lock keeps its local-stack-lock/ path and
+# LOCAL_STACK_LOCK_OWNER / LOCAL_STACK_LOCK_PID names, so adopted copies still work.
+# Named owners use LOCAL_STACK_LOCK_OWNER_<key> and LOCAL_STACK_LOCK_PID_<key>.
+# Each holder records its checkout, process id and start time.
+#
+# Take locks in this order: tests, other named locks, then the unnamed stack lock.
+# A child reuses only the named or unnamed lock its live parent holds.
+# CI=true / CI=1 is a no-op. LOCAL_STACK_LOCK_WAIT_S caps the wait (default 3600).
+# A Perl flock holder exits within a second of its caller; killed callers leave no stale lock.
+# Requires Bash 3.2+ and /usr/bin/perl.
+
+_LOCAL_STACK_LOCK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
+_LOCAL_STACK_LOCK_ROOT="$(git -C "$_LOCAL_STACK_LOCK_DIR" rev-parse --show-toplevel 2>/dev/null || echo "$_LOCAL_STACK_LOCK_DIR")"
+LOCAL_STACK_LOCK_PID="${LOCAL_STACK_LOCK_PID:-}"
+_LOCAL_STACK_LOCK_EXIT=73
+
+# The stack's name: BKIT_LOCAL_STACK, else the main checkout's folder name, the same from every
+# worktree. Characters outside A-Z a-z 0-9 . _ - become _.
+local_stack_lock_name() {
+  _lsl_name="${BKIT_LOCAL_STACK:-}"
+  if [ -z "$_lsl_name" ]; then
+    _lsl_common="$(git -C "$_LOCAL_STACK_LOCK_DIR" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)" || return 1
+    [ -n "$_lsl_common" ] || return 1
+    case "$(basename "$_lsl_common")" in
+      .git) _lsl_name="$(basename "$(dirname "$_lsl_common")")" ;;
+      *) _lsl_name="$(basename "$_lsl_common" .git)" ;;
+    esac
+  fi
+  printf '%s\n' "$_lsl_name" | LC_ALL=C tr -c 'A-Za-z0-9._\n-' '_'
+}
+
+# A named lock has one machine-wide path; the unnamed path remains stack-scoped.
+local_stack_lock_file() {
+  local _lsl_stack
+  if [ -n "${1:-}" ]; then
+    _lsl_stack="$(printf '%s' "$1" | LC_ALL=C tr -c 'A-Za-z0-9._-' '_')"
+    echo "${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/${_lsl_stack}.lock"
+  else
+    _lsl_stack="$(local_stack_lock_name)" || return 1
+    echo "${XDG_CACHE_HOME:-$HOME/.cache}/bkit/local-stack-lock/${_lsl_stack}.lock"
+  fi
+}
+
+# "<who> — <checkout> (pid N, since HH:MM:SS)" for the run holding the lock.
+local_stack_lock_holder() {
+  local _lsl_held
+  _lsl_held="$(local_stack_lock_file "${1:-}")" || return 0
+  cat "${_lsl_held}.holder" 2>/dev/null
+  return 0
+}
+
+_local_stack_lock_vars() {
+  local _lsl_key
+  _lsl_key="$(printf '%s' "${1:-}" | LC_ALL=C tr -c 'A-Za-z0-9._-' '_')"
+  _lsl_key="${_lsl_key//_/__}"
+  _lsl_key="${_lsl_key//-/_h}"
+  _lsl_key="${_lsl_key//./_d}"
+  _lsl_pid_var="LOCAL_STACK_LOCK_PID"
+  _lsl_owner_var="LOCAL_STACK_LOCK_OWNER"
+  if [ -n "${1:-}" ]; then
+    _lsl_pid_var="${_lsl_pid_var}_${_lsl_key}"
+    _lsl_owner_var="${_lsl_owner_var}_${_lsl_key}"
+  fi
+}
+
+_local_stack_lock() {
+  local _lsl_mode="$1" _lsl_who="$2" _lsl_name="${3:-}"
+  local _lsl_pid_var _lsl_owner_var _lsl_owner _lsl_existing
+  local _lsl_file _lsl_label _lsl_fifo _lsl_pid _lsl_reply _lsl_checkout
+  _LOCAL_STACK_LOCK_EXIT=73
+  _local_stack_lock_vars "$_lsl_name"
+  _lsl_owner="${!_lsl_owner_var:-}"
+  _lsl_existing="${!_lsl_pid_var:-}"
+  if [ "${CI:-}" = "true" ] || [ "${CI:-}" = "1" ]; then return 0; fi
+  if [ -n "$_lsl_owner" ] && kill -0 "$_lsl_owner" 2>/dev/null; then return 0; fi
+  if [ -n "$_lsl_existing" ] && kill -0 "$_lsl_existing" 2>/dev/null; then return 0; fi
+
+  if ! _lsl_file="$(local_stack_lock_file "$_lsl_name")"; then
+    echo "[machine-lock] ❌ cannot name the local stack: run inside a git checkout, or set BKIT_LOCAL_STACK" >&2
+    return 1
+  fi
+  _lsl_label="the local stack $(basename "$_lsl_file" .lock)"
+  _lsl_checkout="$_LOCAL_STACK_LOCK_ROOT"
+  if [ -n "$_lsl_name" ]; then
+    _lsl_label="$_lsl_name"
+    _lsl_checkout="$(git -C "$PWD" rev-parse --show-toplevel 2>/dev/null || printf '%s' "$PWD")"
+  fi
+  if [ ! -x /usr/bin/perl ]; then
+    echo "[machine-lock] ❌ could not take the lock for $_lsl_label: /usr/bin/perl not found" >&2
+    return 1
+  fi
+  if ! mkdir -p "$(dirname "$_lsl_file")"; then
+    echo "[machine-lock] ❌ could not take the lock for $_lsl_label: cannot create $(dirname "$_lsl_file")" >&2
+    return 1
+  fi
+  _lsl_fifo="$(mktemp -u "${TMPDIR:-/tmp}/local-stack-lock.XXXXXX")"
+  mkfifo "$_lsl_fifo" || return 1
+
+  # The holder answers on the fifo once: ok, busy <holder>, timeout <holder> or error <why>.
+  /usr/bin/perl -e '
+    use strict;
+    use Fcntl qw(:flock);
+    use POSIX qw(strftime);
+    my ($file, $owner, $who, $checkout, $fifo, $wait_s, $mode, $label) = @ARGV;
+    # The caller is the parent of this process. When it exits, this process goes to init (or a
+    # subreaper) at once, while `kill 0` would still find it until whoever started it reaps it.
+    my $parent = getppid();
+    my $caller_alive = sub { getppid() == $parent };
+    open(my $out, ">", $fifo) or exit 1;
+    $out->autoflush(1);
+    my $holder = sub { open(my $h, "<", "$file.holder") or return "another run"; my $l = <$h>; chomp $l; $l };
+    my $lock;
+    open($lock, ">>", $file) or do { print $out "error cannot open $file: $!\n"; exit 1 };
+    my $start = time;
+    my $next_note = 0;
+    until (flock($lock, LOCK_EX | LOCK_NB)) {
+      exit 0 unless $caller_alive->();
+      if ($mode eq "try") { print $out "busy " . $holder->() . "\n"; exit 0 }
+      if (time - $start >= $wait_s) { print $out "timeout " . $holder->() . "\n"; exit 0 }
+      if (time >= $next_note) {
+        my $m = int((time - $start) / 60);
+        my $so_far = $m ? " (still, $m min so far)" : "";
+        print STDERR "[machine-lock] ⏳ $who is waiting for $label$so_far: in use by " . $holder->() . "\n";
+        $next_note = time + 60;
+      }
+      sleep 1;
+    }
+    $SIG{TERM} = $SIG{INT} = $SIG{HUP} = sub { unlink "$file.holder"; exit 0 };
+    if (open(my $h, ">", "$file.holder")) {
+      print $h "$who — $checkout (pid $owner, since " . strftime("%H:%M:%S", localtime) . ")\n";
+      close $h;
+    }
+    print $out "ok\n";
+    close $out;
+    sleep 1 while $caller_alive->();
+    unlink "$file.holder";
+  ' "$_lsl_file" "$$" "$_lsl_who" "$_lsl_checkout" "$_lsl_fifo" "${LOCAL_STACK_LOCK_WAIT_S:-3600}" "$_lsl_mode" "$_lsl_label" </dev/null >/dev/null &
+  _lsl_pid=$!
+  # The fifo is opened read-write, so the read never blocks on a holder that died before it
+  # answered (a failed fork under load, a killed perl): the loop stops once it is gone.
+  _lsl_reply="$(
+    exec 3<>"$_lsl_fifo"
+    while :; do
+      if IFS= read -r -t 1 _lsl_line <&3; then
+        printf '%s' "$_lsl_line"
+        break
+      fi
+      if ! kill -0 "$_lsl_pid" 2>/dev/null; then
+        # The holder may have answered and exited between the read timing out and this check.
+        if IFS= read -r -t 1 _lsl_line <&3; then printf '%s' "$_lsl_line"; fi
+        break
+      fi
+    done
+  )" || true
+  rm -f "$_lsl_fifo"
+
+  case "$_lsl_reply" in
+    ok)
+      printf -v "$_lsl_pid_var" '%s' "$_lsl_pid"
+      printf -v "$_lsl_owner_var" '%s' "$$"
+      export "$_lsl_owner_var"
+      return 0
+      ;;
+    busy\ *)
+      _LOCAL_STACK_LOCK_EXIT=75
+      echo "[machine-lock] $_lsl_label is in use by ${_lsl_reply#busy }" >&2
+      ;;
+    timeout\ *)
+      _LOCAL_STACK_LOCK_EXIT=75
+      echo "[machine-lock] ❌ $_lsl_who gave up after ${LOCAL_STACK_LOCK_WAIT_S:-3600}s waiting for $_lsl_label, in use by ${_lsl_reply#timeout }" >&2
+      echo "[machine-lock]    Let that run finish, or stop it. LOCAL_STACK_LOCK_WAIT_S sets how long to wait." >&2
+      ;;
+    "")
+      echo "[machine-lock] ❌ could not take the lock for $_lsl_label: the perl process holding it stopped before it answered" >&2
+      ;;
+    *)
+      echo "[machine-lock] ❌ could not take the lock for $_lsl_label: ${_lsl_reply#error }" >&2
+      ;;
+  esac
+  wait "$_lsl_pid" 2>/dev/null || true
+  return 1
+}
+
+take_local_stack_lock() { _local_stack_lock wait "$1" "${2:-}"; }
+try_local_stack_lock() { _local_stack_lock try "$1" "${2:-}"; }
+
+release_local_stack_lock() {
+  local _lsl_pid_var _lsl_owner_var _lsl_release_pid
+  _local_stack_lock_vars "${1:-}"
+  _lsl_release_pid="${!_lsl_pid_var:-}"
+  [ -n "$_lsl_release_pid" ] || return 0
+  kill "$_lsl_release_pid" 2>/dev/null || true
+  wait "$_lsl_release_pid" 2>/dev/null || true
+  printf -v "$_lsl_pid_var" '%s' ""
+  unset "$_lsl_owner_var"
+  return 0
+}
+
+if [ "${BASH_SOURCE[0]}" = "$0" ]; then
+  _lsl_run_usage() {
+    echo 'usage: bash scripts/ci/bkit-machine-lock.sh run ["<who>"] [--lock <name>] -- <command> [args…]' >&2
+    exit 2
+  }
+  [ "${1:-}" = run ] || _lsl_run_usage
+  shift
+  _lsl_run_who="${LOCAL_STACK_LOCK_WHO:-${npm_lifecycle_event:-run}}"
+  _lsl_run_name=""
+  case "${1:-}" in
+    --lock|--) ;;
+    "") _lsl_run_usage ;;
+    *) _lsl_run_who="$1"; shift ;;
+  esac
+  if [ "${1:-}" = --lock ]; then
+    [ -n "${2:-}" ] && [ "$2" != -- ] || _lsl_run_usage
+    _lsl_run_name="$2"
+    shift 2
+  fi
+  [ "${1:-}" = -- ] || _lsl_run_usage
+  shift
+  [ "$#" -gt 0 ] || _lsl_run_usage
+  take_local_stack_lock "$_lsl_run_who" "$_lsl_run_name" || exit "$_LOCAL_STACK_LOCK_EXIT"
+  "$@"
+  _lsl_run_status=$?
+  release_local_stack_lock "$_lsl_run_name"
+  exit "$_lsl_run_status"
+fi
diff --git a/.bkit/version b/.bkit/version
index 5b8320c68..7741f83d6 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -3,7 +3,7 @@
   "canonicalHashes": {
     ".cursor/mcp.json": "355e01cadabed3b924ebe339dc07ecbf7179397ebc9accf8618d5d7d6af6c438",
     "docs/deployments.md": "b7a8014afb7da246d615894519d87d5def6d0c6c7be8e714fb634157cdd7580f",
-    "docs/testing.md": "04d591fb6ab9f66ad269a58d457d03a38a15b6c5c6d7e3a8af51d31feb697320",
+    "docs/testing.md": "7b60ce0e300e1438f965c06e5de4077262b73361e7dd3a46776571218e7f4793",
     ".claude/settings.json": "f6c41bd5f3d1f6a10d456543c0653a82c9432bd6f3a6a8aa1b3e9a78eb72a3b7",
     ".agents/context.md": "5cf54b91ffaa5d9372415a24dd1acfe0910c7def1f4434e25ccf110e3eaed013",
     ".agents/docs.md": "bfbddbf98bc4238c6a01dbd68fbe515ba01db2371c440d868fe12a8db6c96df0",
@@ -215,7 +215,7 @@
     ".cursor/agents/bkit-utility-update-roadmap.md": "ea7081672a0fe44a1d2eaf40958c008a7631d329345d11d6a7ca4439a156bf25",
     "docs/templates/bkit-audit-agents.md": "39f34db396db4e50742d230304ecdeb0ceb367ee99e03aaba740872ff8fdd858",
     "docs/templates/bkit-audit-prompts.md": "3323a98811ad65da0fc30d5e52f2a48cd09872dc490fcac0008adba097c37e0a",
-    ".bkit/templates.md": "7986d00edacb0facd8da603afe5540a890ca62901a19a505021ebdf378f20de8",
+    ".bkit/templates.md": "64cdeff47dcb49089bea819d720ced9355cead42ec7e34f5e17afe98d07567cf",
     "docs/templates/bkit-audit-adoption.md": "09fa8636f0529f95ab7a46f4c74727da85fde7180d43979e74cdbb3ea3557794",
     ".bkit/cloud.md": "7594f46d9003bcf77650cf57c3ff934278690187434e58bc57159ccbd1c52524",
     ".bkit/comparison.md": "1ab7924388e037438a73a87c1826f5846f7ae38a5a41479eb6bb7454ae782d07",
diff --git a/README.md b/README.md
index da886380e..0ea19387b 100644
--- a/README.md
+++ b/README.md
@@ -354,7 +354,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 6af3da0add44a098ea842cdeaa98d4623f9f7c8e — do not edit
+  %% Generated by bkit-graphify-rollup.py from 05b6f9f39f2ef74269c284f57fc7ae32148fb55f — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
diff --git a/docs/capabilities.md b/docs/capabilities.md
index df6dbcde9..ac9392667 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -30,7 +30,7 @@
 > - `budgeted` = solid amber border + a faint amber box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.
 > - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.
 > - A fetched URL is a STRING, never an edge, because the reachability scan (§ Unreachable API calls) is the only check that sees it.
-> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `6af3da0ad`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
+> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `05b6f9f39`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
 > - Detail-level module graph → `pnpm graph`. This doc is the altitude above that: capabilities, not files.
 
 ## Status Vocabulary
@@ -159,7 +159,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 6af3da0add44a098ea842cdeaa98d4623f9f7c8e — do not edit
+  %% Generated by bkit-graphify-rollup.py from 05b6f9f39f2ef74269c284f57fc7ae32148fb55f — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
@@ -248,7 +248,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 6af3da0add44a098ea842cdeaa98d4623f9f7c8e — do not edit
+  %% Generated by bkit-graphify-rollup.py from 05b6f9f39f2ef74269c284f57fc7ae32148fb55f — do not edit
   subgraph gncustom_health_checks["Health checks"]
     n_bkit_core_engine_checks_after_index[".bkit/core/engine/checks/after/index<br/>11 symbols · 1 files"]
     n_bkit_core_engine_checks_before_index[".bkit/core/engine/checks/before/index<br/>4 symbols · 1 files"]
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index 45761c0a6..caf31b9e6 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -133,3 +133,5 @@
 {"schema":3,"ts":1793523381121,"firstTs":1793004573756,"updates":2,"kind":"knowledge","key":"bkit-tests-red-snapshot-accepts-added-lines-only","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":[".bkit/core/engine/commands/workflow/tests.ts",".bkit/core/engine/audits/workflows/question-option-format.test.ts","#796"],"summary":"`bkit tests green` reads a test file as unchanged only when it keeps every snapshot line in order, so a fix to a rule after its recorded red must be pure addition","description":"- **Category:** tooling\n- **Symptom:** `bkit tests green` reports `changed: yes` and a `test-changed` gap for a test that passed its recorded red, with a `Diff since red` block, after the rule under test was corrected.\n- **Root cause:** `bkit tests red` copies the test file beside its log as `<log>.snapshot` and stores its blob; the green audit compares that snapshot with the current file through `onlyAddsLines`, which walks the snapshot's non-blank, whitespace-stripped lines as a subsequence of the current file. Inserted lines anywhere pass (`added lines only`); any modified or removed line fails. A red cannot simply be re-recorded, because `bkit tests red` refuses `passed` for a named test that now succeeds.\n- **Fix or rule:** correct a red-flagged rule by adding lines — a normalisation pass appended inside the existing function, for instance — never by editing the lines the red validated; add the new behaviour as a separate pass over the existing output and leave the old lines in order. A `TEST EXCEPTION` committed by a human is the only other way past a test-order gap.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"`onlyAddsLines` is a subsequence test over the snapshot's normalised lines, so the red evidence pins the exact byte order of the old lines: an edit breaks it, an insertion does not. `bkit tests red` will not re-record a red for a named test that now passes.","remediation":"Superseded by `steps-finish-refuses-a-code-step-whose-planned-test-file-changed` (#796): no edit to a planned test file is accepted after its red, additive or not; the code step is refused instead.","status":"SUPERSEDED"}
 {"schema":3,"ts":1793523381122,"firstTs":1793100920719,"updates":2,"kind":"knowledge","key":"prettier-write-after-a-red-breaks-the-test-first-audit","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":[".bkit/core/engine/commands/workflow/tests.ts",".bkit/core/prompts/bkit-build-plan-verify.md","#796"],"summary":"Format a test file before recording its red; a later `prettier --write` moves a line and the green audit then reports `test-changed` with `changed: yes`","description":"- **Category:** tooling\n- **Symptom:** `bkit tests green` reports one `test-changed` gap per planned test in a file whose reds were all recorded, with `Changed since red` = `yes` and a diff that removes a single line (a wrapped `expect(…)` joined into one line) and adds the task's new tests.\n- **Root cause:** `onlyAddsLines` walks the red snapshot's whitespace-stripped, non-blank lines as a subsequence of the current file, so a prettier pass that joins a wrapped call, or splits a long one, removes a line the snapshot holds and turns the row from `added lines only` into `yes`. `bkit tests red` cannot re-record the red once the named test passes.\n- **Fix or rule:** run `prettier --write` on the test file before recording its reds, and after every later test edit check the row with `bkit tests green`: an additions-only diff keeps the row at `added lines only`, whose prompt rule clears added lines outside every planned test.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"Red evidence pins the snapshot's line sequence; the formatter is the usual second writer of a test file after its red, and the red cannot be re-recorded once the test passes.","remediation":"Superseded by `steps-finish-refuses-a-code-step-whose-planned-test-file-changed` (#796): the tests step formats the file before the red; a `prettier --write` in the code step is refused by `steps finish`, not reported at green.","status":"SUPERSEDED"}
 {"schema":3,"ts":1793524772549,"firstTs":1793524772549,"updates":1,"kind":"knowledge","key":"escaped-backticks-inside-a-code-span-are-retokenised-by-prettier","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["#796",".bkit/core/prompts/bkit-build-plan-tests.md",".bkit/core/engine/audits/workflows/prompt-notation.test.ts"],"summary":"A markdown code span that escapes inner backticks (`` `PASSES — TASK {N}: \\`{file}\\`` `` style) is re-tokenised by `prettier --write`: the spaces around the words after it vanish, the line no longer matches its `.bkit/instructions.md` entry and `instructions-coverage.test.ts` fails","description":"- **Category:** tooling\n- **Symptom:** after the format gate a prompt line reads `...{why}`with Bash`echo >>`` and the coverage test reports both `no entry` and `local entry no longer in the file` for it.\n- **Cause:** prettier parses the escaped backticks as span boundaries and rewrites the line; the instructions store still holds the pre-format text.","remediation":"Write a code span that must show backticks as a double-backtick span: ``PASSES — TASK {N}: `{file}` `{name}`: {reason}``. Prettier leaves it alone and `prompt-notation.test.ts` reads it as one span.","status":"ACTIVE"}
+{"schema":3,"ts":1793609535806,"firstTs":1793609535806,"updates":1,"kind":"knowledge","key":"machine-lock-dynamic-state-must-preserve-name-identity","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/templates/scripts/ci/bkit-machine-lock.sh",".bkit/core/engine/audits/templates/machine-lock.integration.test.ts"],"summary":"Named-lock owner and PID keys must preserve the normalized lock file identity","rootCause":"Replacing hyphens and dots with underscores only in the dynamic variable key makes distinct lock files share live-owner state, so the second take falsely succeeds without acquiring its lock.","remediation":"Escape underscores before encoding hyphens and dots in owner/PID keys. Keep simple names such as tests unchanged, and verify acquisition plus release of both distinct locks with real holder files.","status":"ACTIVE"}
+{"schema":3,"ts":1793609535807,"firstTs":1793609535807,"updates":1,"kind":"knowledge","key":"machine-lock-indirect-state-needs-unset-defaults","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/templates/scripts/ci/bkit-machine-lock.sh",".bkit/core/engine/audits/templates/machine-lock.integration.test.ts"],"summary":"Bash indirect owner/PID reads require defaults for source callers using nounset","rootCause":"A sourced helper reading an unset dynamic variable through indirect expansion aborts bash -u before its normal empty-state check.","remediation":"Use unset-safe defaults on each indirect state read, including release; verify both named and unnamed take/release calls in a real bash -eu subprocess.","status":"ACTIVE"}
diff --git a/docs/testing.md b/docs/testing.md
index 1c268740d..e2904aced 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -661,6 +661,8 @@ Replay a stored verdict: each `completeness` row carries `sourceSha` (the sha256
 
 ## Key test files
 
+The machine-lock integration tests in `audits/templates/machine-lock.integration.test.ts` run real Bash and Perl holders against isolated cache folders. `tests/fixtures/machine-lock/stack-lock-6.0.0.sh` freezes the older stack-lock script for compatibility checks.
+
 <!-- prettier-ignore -->
 | File | Tier | Scope |
 | --- | --- | --- |
diff --git a/scripts/ci/bkit-machine-lock.sh b/scripts/ci/bkit-machine-lock.sh
new file mode 100644
index 000000000..cf85fc2be
--- /dev/null
+++ b/scripts/ci/bkit-machine-lock.sh
@@ -0,0 +1,246 @@
+#!/bin/bash
+# Example. Copy into scripts/ci/ and own it.
+# bkit install does not write this file and does not overwrite a copy.
+#
+# bkit-machine-lock.sh — machine-wide named locks and the checkout's shared stack lock.
+#
+#   . scripts/ci/bkit-machine-lock.sh
+#   take_local_stack_lock "<who>" [name]    # waits, returns 1 on refusal
+#   try_local_stack_lock "<who>" [name]     # returns 1 immediately while busy
+#   release_local_stack_lock [name]        # optional; caller exit also frees the lock
+#   local_stack_lock_holder [name]
+#   local_stack_lock_file [name]
+#
+# package.json: wrap test gates with
+#   bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <gate command> [args…]
+# run ["<who>"] [--lock <name>] -- <command> exits with the command's status:
+# 2 usage, 73 the lock could not be taken, 75 the wait gave up.
+# The run name defaults to LOCAL_STACK_LOCK_WHO, npm_lifecycle_event, then run.
+#
+# Named locks live in ${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/ with no
+# repository prefix. The unnamed stack lock keeps its local-stack-lock/ path and
+# LOCAL_STACK_LOCK_OWNER / LOCAL_STACK_LOCK_PID names, so adopted copies still work.
+# Named owners use LOCAL_STACK_LOCK_OWNER_<key> and LOCAL_STACK_LOCK_PID_<key>.
+# Each holder records its checkout, process id and start time.
+#
+# Take locks in this order: tests, other named locks, then the unnamed stack lock.
+# A child reuses only the named or unnamed lock its live parent holds.
+# CI=true / CI=1 is a no-op. LOCAL_STACK_LOCK_WAIT_S caps the wait (default 3600).
+# A Perl flock holder exits within a second of its caller; killed callers leave no stale lock.
+# Requires Bash 3.2+ and /usr/bin/perl.
+
+_LOCAL_STACK_LOCK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
+_LOCAL_STACK_LOCK_ROOT="$(git -C "$_LOCAL_STACK_LOCK_DIR" rev-parse --show-toplevel 2>/dev/null || echo "$_LOCAL_STACK_LOCK_DIR")"
+LOCAL_STACK_LOCK_PID="${LOCAL_STACK_LOCK_PID:-}"
+_LOCAL_STACK_LOCK_EXIT=73
+
+# The stack's name: BKIT_LOCAL_STACK, else the main checkout's folder name, the same from every
+# worktree. Characters outside A-Z a-z 0-9 . _ - become _.
+local_stack_lock_name() {
+  _lsl_name="${BKIT_LOCAL_STACK:-}"
+  if [ -z "$_lsl_name" ]; then
+    _lsl_common="$(git -C "$_LOCAL_STACK_LOCK_DIR" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)" || return 1
+    [ -n "$_lsl_common" ] || return 1
+    case "$(basename "$_lsl_common")" in
+      .git) _lsl_name="$(basename "$(dirname "$_lsl_common")")" ;;
+      *) _lsl_name="$(basename "$_lsl_common" .git)" ;;
+    esac
+  fi
+  printf '%s\n' "$_lsl_name" | LC_ALL=C tr -c 'A-Za-z0-9._\n-' '_'
+}
+
+# A named lock has one machine-wide path; the unnamed path remains stack-scoped.
+local_stack_lock_file() {
+  local _lsl_stack
+  if [ -n "${1:-}" ]; then
+    _lsl_stack="$(printf '%s' "$1" | LC_ALL=C tr -c 'A-Za-z0-9._-' '_')"
+    echo "${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/${_lsl_stack}.lock"
+  else
+    _lsl_stack="$(local_stack_lock_name)" || return 1
+    echo "${XDG_CACHE_HOME:-$HOME/.cache}/bkit/local-stack-lock/${_lsl_stack}.lock"
+  fi
+}
+
+# "<who> — <checkout> (pid N, since HH:MM:SS)" for the run holding the lock.
+local_stack_lock_holder() {
+  local _lsl_held
+  _lsl_held="$(local_stack_lock_file "${1:-}")" || return 0
+  cat "${_lsl_held}.holder" 2>/dev/null
+  return 0
+}
+
+_local_stack_lock_vars() {
+  local _lsl_key
+  _lsl_key="$(printf '%s' "${1:-}" | LC_ALL=C tr -c 'A-Za-z0-9._-' '_')"
+  _lsl_key="${_lsl_key//_/__}"
+  _lsl_key="${_lsl_key//-/_h}"
+  _lsl_key="${_lsl_key//./_d}"
+  _lsl_pid_var="LOCAL_STACK_LOCK_PID"
+  _lsl_owner_var="LOCAL_STACK_LOCK_OWNER"
+  if [ -n "${1:-}" ]; then
+    _lsl_pid_var="${_lsl_pid_var}_${_lsl_key}"
+    _lsl_owner_var="${_lsl_owner_var}_${_lsl_key}"
+  fi
+}
+
+_local_stack_lock() {
+  local _lsl_mode="$1" _lsl_who="$2" _lsl_name="${3:-}"
+  local _lsl_pid_var _lsl_owner_var _lsl_owner _lsl_existing
+  local _lsl_file _lsl_label _lsl_fifo _lsl_pid _lsl_reply _lsl_checkout
+  _LOCAL_STACK_LOCK_EXIT=73
+  _local_stack_lock_vars "$_lsl_name"
+  _lsl_owner="${!_lsl_owner_var:-}"
+  _lsl_existing="${!_lsl_pid_var:-}"
+  if [ "${CI:-}" = "true" ] || [ "${CI:-}" = "1" ]; then return 0; fi
+  if [ -n "$_lsl_owner" ] && kill -0 "$_lsl_owner" 2>/dev/null; then return 0; fi
+  if [ -n "$_lsl_existing" ] && kill -0 "$_lsl_existing" 2>/dev/null; then return 0; fi
+
+  if ! _lsl_file="$(local_stack_lock_file "$_lsl_name")"; then
+    echo "[machine-lock] ❌ cannot name the local stack: run inside a git checkout, or set BKIT_LOCAL_STACK" >&2
+    return 1
+  fi
+  _lsl_label="the local stack $(basename "$_lsl_file" .lock)"
+  _lsl_checkout="$_LOCAL_STACK_LOCK_ROOT"
+  if [ -n "$_lsl_name" ]; then
+    _lsl_label="$_lsl_name"
+    _lsl_checkout="$(git -C "$PWD" rev-parse --show-toplevel 2>/dev/null || printf '%s' "$PWD")"
+  fi
+  if [ ! -x /usr/bin/perl ]; then
+    echo "[machine-lock] ❌ could not take the lock for $_lsl_label: /usr/bin/perl not found" >&2
+    return 1
+  fi
+  if ! mkdir -p "$(dirname "$_lsl_file")"; then
+    echo "[machine-lock] ❌ could not take the lock for $_lsl_label: cannot create $(dirname "$_lsl_file")" >&2
+    return 1
+  fi
+  _lsl_fifo="$(mktemp -u "${TMPDIR:-/tmp}/local-stack-lock.XXXXXX")"
+  mkfifo "$_lsl_fifo" || return 1
+
+  # The holder answers on the fifo once: ok, busy <holder>, timeout <holder> or error <why>.
+  /usr/bin/perl -e '
+    use strict;
+    use Fcntl qw(:flock);
+    use POSIX qw(strftime);
+    my ($file, $owner, $who, $checkout, $fifo, $wait_s, $mode, $label) = @ARGV;
+    # The caller is the parent of this process. When it exits, this process goes to init (or a
+    # subreaper) at once, while `kill 0` would still find it until whoever started it reaps it.
+    my $parent = getppid();
+    my $caller_alive = sub { getppid() == $parent };
+    open(my $out, ">", $fifo) or exit 1;
+    $out->autoflush(1);
+    my $holder = sub { open(my $h, "<", "$file.holder") or return "another run"; my $l = <$h>; chomp $l; $l };
+    my $lock;
+    open($lock, ">>", $file) or do { print $out "error cannot open $file: $!\n"; exit 1 };
+    my $start = time;
+    my $next_note = 0;
+    until (flock($lock, LOCK_EX | LOCK_NB)) {
+      exit 0 unless $caller_alive->();
+      if ($mode eq "try") { print $out "busy " . $holder->() . "\n"; exit 0 }
+      if (time - $start >= $wait_s) { print $out "timeout " . $holder->() . "\n"; exit 0 }
+      if (time >= $next_note) {
+        my $m = int((time - $start) / 60);
+        my $so_far = $m ? " (still, $m min so far)" : "";
+        print STDERR "[machine-lock] ⏳ $who is waiting for $label$so_far: in use by " . $holder->() . "\n";
+        $next_note = time + 60;
+      }
+      sleep 1;
+    }
+    $SIG{TERM} = $SIG{INT} = $SIG{HUP} = sub { unlink "$file.holder"; exit 0 };
+    if (open(my $h, ">", "$file.holder")) {
+      print $h "$who — $checkout (pid $owner, since " . strftime("%H:%M:%S", localtime) . ")\n";
+      close $h;
+    }
+    print $out "ok\n";
+    close $out;
+    sleep 1 while $caller_alive->();
+    unlink "$file.holder";
+  ' "$_lsl_file" "$$" "$_lsl_who" "$_lsl_checkout" "$_lsl_fifo" "${LOCAL_STACK_LOCK_WAIT_S:-3600}" "$_lsl_mode" "$_lsl_label" </dev/null >/dev/null &
+  _lsl_pid=$!
+  # The fifo is opened read-write, so the read never blocks on a holder that died before it
+  # answered (a failed fork under load, a killed perl): the loop stops once it is gone.
+  _lsl_reply="$(
+    exec 3<>"$_lsl_fifo"
+    while :; do
+      if IFS= read -r -t 1 _lsl_line <&3; then
+        printf '%s' "$_lsl_line"
+        break
+      fi
+      if ! kill -0 "$_lsl_pid" 2>/dev/null; then
+        # The holder may have answered and exited between the read timing out and this check.
+        if IFS= read -r -t 1 _lsl_line <&3; then printf '%s' "$_lsl_line"; fi
+        break
+      fi
+    done
+  )" || true
+  rm -f "$_lsl_fifo"
+
+  case "$_lsl_reply" in
+    ok)
+      printf -v "$_lsl_pid_var" '%s' "$_lsl_pid"
+      printf -v "$_lsl_owner_var" '%s' "$$"
+      export "$_lsl_owner_var"
+      return 0
+      ;;
+    busy\ *)
+      _LOCAL_STACK_LOCK_EXIT=75
+      echo "[machine-lock] $_lsl_label is in use by ${_lsl_reply#busy }" >&2
+      ;;
+    timeout\ *)
+      _LOCAL_STACK_LOCK_EXIT=75
+      echo "[machine-lock] ❌ $_lsl_who gave up after ${LOCAL_STACK_LOCK_WAIT_S:-3600}s waiting for $_lsl_label, in use by ${_lsl_reply#timeout }" >&2
+      echo "[machine-lock]    Let that run finish, or stop it. LOCAL_STACK_LOCK_WAIT_S sets how long to wait." >&2
+      ;;
+    "")
+      echo "[machine-lock] ❌ could not take the lock for $_lsl_label: the perl process holding it stopped before it answered" >&2
+      ;;
+    *)
+      echo "[machine-lock] ❌ could not take the lock for $_lsl_label: ${_lsl_reply#error }" >&2
+      ;;
+  esac
+  wait "$_lsl_pid" 2>/dev/null || true
+  return 1
+}
+
+take_local_stack_lock() { _local_stack_lock wait "$1" "${2:-}"; }
+try_local_stack_lock() { _local_stack_lock try "$1" "${2:-}"; }
+
+release_local_stack_lock() {
+  local _lsl_pid_var _lsl_owner_var _lsl_release_pid
+  _local_stack_lock_vars "${1:-}"
+  _lsl_release_pid="${!_lsl_pid_var:-}"
+  [ -n "$_lsl_release_pid" ] || return 0
+  kill "$_lsl_release_pid" 2>/dev/null || true
+  wait "$_lsl_release_pid" 2>/dev/null || true
+  printf -v "$_lsl_pid_var" '%s' ""
+  unset "$_lsl_owner_var"
+  return 0
+}
+
+if [ "${BASH_SOURCE[0]}" = "$0" ]; then
+  _lsl_run_usage() {
+    echo 'usage: bash scripts/ci/bkit-machine-lock.sh run ["<who>"] [--lock <name>] -- <command> [args…]' >&2
+    exit 2
+  }
+  [ "${1:-}" = run ] || _lsl_run_usage
+  shift
+  _lsl_run_who="${LOCAL_STACK_LOCK_WHO:-${npm_lifecycle_event:-run}}"
+  _lsl_run_name=""
+  case "${1:-}" in
+    --lock|--) ;;
+    "") _lsl_run_usage ;;
+    *) _lsl_run_who="$1"; shift ;;
+  esac
+  if [ "${1:-}" = --lock ]; then
+    [ -n "${2:-}" ] && [ "$2" != -- ] || _lsl_run_usage
+    _lsl_run_name="$2"
+    shift 2
+  fi
+  [ "${1:-}" = -- ] || _lsl_run_usage
+  shift
+  [ "$#" -gt 0 ] || _lsl_run_usage
+  take_local_stack_lock "$_lsl_run_who" "$_lsl_run_name" || exit "$_LOCAL_STACK_LOCK_EXIT"
+  "$@"
+  _lsl_run_status=$?
+  release_local_stack_lock "$_lsl_run_name"
+  exit "$_lsl_run_status"
+fi
diff --git a/.bkit/templates/scripts/ci/bkit-local-stack-lock.sh b/tests/fixtures/machine-lock/stack-lock-6.0.0.sh
old mode 100755
new mode 100644
similarity index 97%
rename from .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
rename to tests/fixtures/machine-lock/stack-lock-6.0.0.sh
index fc8109764..ee750f6bf
--- a/.bkit/templates/scripts/ci/bkit-local-stack-lock.sh
+++ b/tests/fixtures/machine-lock/stack-lock-6.0.0.sh
@@ -140,11 +140,7 @@ _local_stack_lock() {
         printf '%s' "$_lsl_line"
         break
       fi
-      if ! kill -0 "$_lsl_pid" 2>/dev/null; then
-        # The holder may have answered and exited between the read timing out and this check.
-        if IFS= read -r -t 1 _lsl_line <&3; then printf '%s' "$_lsl_line"; fi
-        break
-      fi
+      kill -0 "$_lsl_pid" 2>/dev/null || break
     done
   )" || true
   rm -f "$_lsl_fifo"
