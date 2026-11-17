diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index 2d2adcca9..a0f1b2603 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -290,7 +290,7 @@ A `context` job resolves the phase and argument once. Then three runner jobs fol
 
 `pre-commit` runs `bkit:gate:format`. `pre-push` runs `bkit check` first, so a drifted install fails in seconds. Then it runs `bkit:gate:static-unit-integration` when package.json declares it, else `bkit:gate:static-unit` (`bkit:gate:static` on revert branches / commits; `bkit:gate:min` on a min push). It also runs the CI-suppressing-token guards, the dependency audit (§ Dependency audit) and the `tmp/` prune (§ tmp/ prune). Each hook ends by starting the disk prune (§ Disk prune).
 
-Pre-push re-runs itself once with all its output copied to `tmp/pre-push.log`, which is rewritten on each push. It prints that path first and last, with the exit code. `--no-verify` and a checkout without husky (a linked worktree) write no log.
+Pre-push re-runs itself once with all its output copied to `tmp/pre-push.log`, which is rewritten on each push. It prints that path first and last, with the exit code. `--no-verify` and a checkout without husky (a linked worktree) write no log. When the repo has an `.envrc`, `direnv` is on `PATH` and `CI` is unset, the inner run goes through `direnv exec .`, so the gate loads `.envrc` itself. An untrusted `.envrc` blocks in seconds with the `direnv allow .` fix, before `bkit check`. A repo whose hook copy lacks this gets the `pre-push-direnv` tip.
 
 Workflows care because they commit and push without `--no-verify`, so a failing hook stops a workflow. The throwaway `.worktrees/_land-{FID}` checkout runs its selected gate explicitly before pushing, with hooks disabled (§ One landing routine in `.bkit/workflows.md`). Reference: https://typicode.github.io/husky/.
 
@@ -442,6 +442,7 @@ direnv allow
 ```
 
 - Adapt: add one `dotenv_if_exists <path>` line per extra env file.
+- The pre-push hook loads `.envrc` itself on push (§ Git hooks — Husky), so an agent's shell that never loaded it still pushes with it. Run `direnv allow .` once per folder, or the push blocks.
 - `unset` the keys that must stay out of the shell. They are dropped from the cloud env blocks too.
 
 ## Launchd GUI environment — tokens for Dock-launched apps
diff --git a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
index 104ecd73f..62979dedc 100644
--- a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
@@ -1235,3 +1235,187 @@ describe(".husky/pre-push min push", () => {
     expect(r.calls).toContain("bkit:lint:workflows");
   });
 });
+
+// ---------------------------------------------------------------------------
+// .husky/pre-push direnv — the logged inner run goes through `direnv exec .` when the repo
+// has an `.envrc`, `direnv` is on PATH and CI is unset; an untrusted `.envrc` blocks first.
+// Stub `direnv` records its argv, fails every call when `untrusted` exists, and otherwise
+// runs the command after `exec .` with GATE_VAR set; stub `pnpm` records the GATE_VAR it sees.
+// ---------------------------------------------------------------------------
+
+describe(".husky/pre-push direnv", () => {
+  const ZERO = "0".repeat(40);
+  const SHA = "d".repeat(40);
+  const REPO = process.cwd();
+  const HOOKS = [".bkit/templates/.husky/pre-push", ".husky/pre-push"];
+  const UPDATE = `refs/heads/dev ${SHA} refs/heads/dev ${ZERO}\n`;
+  const DELETE = `(delete) ${ZERO} refs/heads/a ${SHA}\n`;
+  let tmp: string;
+
+  beforeEach(() => {
+    tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-prepush-direnv-")));
+    fs.mkdirSync(path.join(tmp, "bin"));
+    fs.writeFileSync(
+      path.join(tmp, "bin", "pnpm"),
+      `#!/bin/sh\ncase "$*" in *skip-token*|*"ci min-push"*) exit 1 ;; esac\necho "pnpm: $* GATE_VAR=\${GATE_VAR:-unset}" >> "${tmp}/calls.log"\nexit 0\n`,
+      { mode: 0o755 },
+    );
+    fs.writeFileSync(
+      path.join(tmp, "bin", "direnv"),
+      `#!/bin/sh\necho "$*" >> "${tmp}/direnv.log"\nif [ -e "${tmp}/untrusted" ]; then echo "direnv: error .envrc is blocked" >&2; exit 1; fi\nshift 2\nGATE_VAR=from-envrc exec "$@"\n`,
+      { mode: 0o755 },
+    );
+  });
+  afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));
+
+  const lines = (file: string): string[] => {
+    const p = path.join(tmp, file);
+    return fs.existsSync(p) ? fs.readFileSync(p, "utf-8").trim().split("\n") : [];
+  };
+
+  /** A bin dir holding every tool on PATH except `direnv`, so the hook finds none. */
+  const pathWithoutDirenv = (): string => {
+    const dir = path.join(tmp, "nodirenv");
+    fs.mkdirSync(dir);
+    for (const d of (process.env.PATH ?? "").split(path.delimiter)) {
+      if (!d || !fs.existsSync(d)) continue;
+      for (const name of fs.readdirSync(d)) {
+        if (name === "direnv") continue;
+        try {
+          fs.symlinkSync(path.join(d, name), path.join(dir, name));
+        } catch {
+          // already linked from an earlier PATH entry
+        }
+      }
+    }
+    return `${path.join(tmp, "bin-pnpm")}:${dir}`;
+  };
+
+  const runHook = (
+    hook: string,
+    stdin: string,
+    opts: { envrc?: boolean; untrusted?: boolean; ci?: boolean; noDirenv?: boolean } = {},
+  ) => {
+    const { envrc = true, untrusted = false, ci = false, noDirenv = false } = opts;
+    if (envrc) fs.writeFileSync(path.join(tmp, ".envrc"), "export GATE_VAR=from-envrc\n");
+    if (untrusted) fs.writeFileSync(path.join(tmp, "untrusted"), "");
+    const env = { ...process.env };
+    delete env.BKIT_PRE_PUSH_LOGGED;
+    delete env.CI;
+    delete env.GATE_VAR;
+    if (ci) env.CI = "1";
+    let pathVar = `${path.join(tmp, "bin")}:${process.env.PATH}`;
+    if (noDirenv) {
+      fs.mkdirSync(path.join(tmp, "bin-pnpm"));
+      fs.copyFileSync(path.join(tmp, "bin", "pnpm"), path.join(tmp, "bin-pnpm", "pnpm"));
+      fs.chmodSync(path.join(tmp, "bin-pnpm", "pnpm"), 0o755);
+      pathVar = pathWithoutDirenv();
+    }
+    const result = spawnSync("sh", [path.join(REPO, hook)], {
+      cwd: tmp,
+      input: stdin,
+      encoding: "utf-8",
+      timeout: 20_000,
+      env: { ...env, PATH: pathVar },
+    });
+    return {
+      status: result.status,
+      stderr: result.stderr,
+      calls: lines("calls.log"),
+      direnv: lines("direnv.log"),
+    };
+  };
+
+  it("trusted .envrc → the gate sees its variables", () => {
+    for (const hook of HOOKS) {
+      fs.rmSync(path.join(tmp, "calls.log"), { force: true });
+      fs.rmSync(path.join(tmp, "direnv.log"), { force: true });
+      const r = runHook(hook, UPDATE);
+      expect(r.status, hook).toBe(0);
+      expect(
+        r.direnv.some((c) => c.startsWith("exec . sh ")),
+        hook,
+      ).toBe(true);
+      const gate = r.calls.filter((c) => c.includes("push-gate"));
+      expect(gate.length, hook).toBeGreaterThan(0);
+      for (const g of gate) expect(g, hook).toContain("GATE_VAR=from-envrc");
+    }
+  });
+
+  it("untrusted .envrc → blocked before bkit check, names direnv allow", () => {
+    for (const hook of HOOKS) {
+      fs.rmSync(path.join(tmp, "calls.log"), { force: true });
+      const r = runHook(hook, UPDATE, { untrusted: true });
+      expect(r.status, hook).toBe(1);
+      expect(r.stderr, hook).toContain("direnv allow .");
+      expect(
+        r.calls.some((c) => c.includes("bkit check")),
+        hook,
+      ).toBe(false);
+      expect(
+        r.calls.some((c) => c.includes("push-gate")),
+        hook,
+      ).toBe(false);
+    }
+  });
+
+  it("no .envrc → no direnv call", () => {
+    for (const hook of HOOKS) {
+      fs.rmSync(path.join(tmp, "calls.log"), { force: true });
+      fs.rmSync(path.join(tmp, "direnv.log"), { force: true });
+      const r = runHook(hook, UPDATE, { envrc: false });
+      expect(r.status, hook).toBe(0);
+      expect(r.direnv, hook).toEqual([]);
+      expect(
+        r.calls.some((c) => c.includes("push-gate")),
+        hook,
+      ).toBe(true);
+    }
+  });
+
+  it("direnv not on PATH → gates run, no warning", () => {
+    for (const hook of HOOKS) {
+      fs.rmSync(path.join(tmp, "calls.log"), { force: true });
+      fs.rmSync(path.join(tmp, "nodirenv"), { recursive: true, force: true });
+      fs.rmSync(path.join(tmp, "bin-pnpm"), { recursive: true, force: true });
+      const r = runHook(hook, UPDATE, { noDirenv: true });
+      expect(r.status, hook).toBe(0);
+      expect(r.direnv, hook).toEqual([]);
+      expect(
+        r.calls.some((c) => c.includes("push-gate")),
+        hook,
+      ).toBe(true);
+      expect(r.stderr.toLowerCase(), hook).not.toContain("direnv");
+      expect(r.stderr, hook).not.toContain("WARN");
+    }
+  });
+
+  it("CI set → no direnv call", () => {
+    for (const hook of HOOKS) {
+      fs.rmSync(path.join(tmp, "calls.log"), { force: true });
+      fs.rmSync(path.join(tmp, "direnv.log"), { force: true });
+      const r = runHook(hook, UPDATE, { ci: true });
+      expect(r.status, hook).toBe(0);
+      expect(r.direnv, hook).toEqual([]);
+      expect(
+        r.calls.some((c) => c.includes("push-gate")),
+        hook,
+      ).toBe(true);
+    }
+  });
+
+  it("delete-only push through direnv exec → exit 0, no gate", () => {
+    for (const hook of HOOKS) {
+      fs.rmSync(path.join(tmp, "calls.log"), { force: true });
+      fs.rmSync(path.join(tmp, "direnv.log"), { force: true });
+      const r = runHook(hook, DELETE);
+      expect(r.status, hook).toBe(0);
+      expect(
+        r.direnv.some((c) => c.startsWith("exec . sh ")),
+        hook,
+      ).toBe(true);
+      expect(r.calls, hook).toEqual([]);
+      expect(r.stderr, hook).toContain("delete-only push");
+    }
+  });
+});
diff --git a/.bkit/core/engine/checks/tips/catalogue.test.ts b/.bkit/core/engine/checks/tips/catalogue.test.ts
index e33182015..236f4026f 100644
--- a/.bkit/core/engine/checks/tips/catalogue.test.ts
+++ b/.bkit/core/engine/checks/tips/catalogue.test.ts
@@ -461,6 +461,16 @@ describe("SETUP_TIPS — detection", () => {
     expect(tip("min-push").fires(cwd)).toBe(false);
   });
 
+  it("pre-push-direnv fires only for a hook without direnv exec in a repo with .envrc", () => {
+    expect(tip("pre-push-direnv").fires(cwd)).toBe(false);
+    write(".husky/pre-push", "pnpm -s bkit ci push-gate\n");
+    expect(tip("pre-push-direnv").fires(cwd)).toBe(false);
+    write(".envrc", "export FOO=1\n");
+    expect(tip("pre-push-direnv").fires(cwd)).toBe(true);
+    write(".husky/pre-push", 'BKIT_PRE_PUSH_LOGGED=1 direnv exec . sh "$0" "$@"\n');
+    expect(tip("pre-push-direnv").fires(cwd)).toBe(false);
+  });
+
   it("disk-prune fires only once a pre-push hook exists without either step file", () => {
     expect(tip("disk-prune").fires(cwd)).toBe(false);
     write(".husky/pre-push");
diff --git a/.bkit/core/engine/checks/tips/catalogue.ts b/.bkit/core/engine/checks/tips/catalogue.ts
index 73ef09a3b..78499d973 100644
--- a/.bkit/core/engine/checks/tips/catalogue.ts
+++ b/.bkit/core/engine/checks/tips/catalogue.ts
@@ -466,6 +466,20 @@ export const SETUP_TIPS: readonly SetupTip[] = [
       );
     },
   },
+  {
+    id: "pre-push-direnv",
+    workflows: ["plan", "ship"],
+    title: "Load .envrc when the pre-push hook runs",
+    line: "Your pre-push hook runs the gate without your .envrc variables when the shell that pushed never loaded them.",
+    why: "The newer hook runs its logged inner run through `direnv exec .`, so the gate always sees the repo's variables, and an untrusted .envrc stops the push in seconds with the fix instead of failing deep in the gate.",
+    ask: "Replace the log block of .husky/pre-push (the `BKIT_PRE_PUSH_LOGGED` block) with the one in .bkit/templates/.husky/pre-push.",
+    steps: "`.bkit/templates.md` § Git hooks.",
+    fires: (cwd) => {
+      if (!exists(cwd, ".husky/pre-push") || !exists(cwd, ".envrc")) return false;
+      const hook = fs.readFileSync(path.join(cwd, ".husky/pre-push"), "utf-8");
+      return !hook.includes("direnv exec");
+    },
+  },
   {
     id: "disk-prune",
     workflows: ALL_WORKFLOWS,
diff --git a/.bkit/templates.md b/.bkit/templates.md
index bbf96a5cb..da8cb5145 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -290,7 +290,7 @@ A `context` job resolves the phase and argument once. Then three runner jobs fol
 
 `pre-commit` runs `bkit:gate:format`. `pre-push` runs `bkit check` first, so a drifted install fails in seconds. Then it runs `bkit:gate:static-unit-integration` when package.json declares it, else `bkit:gate:static-unit` (`bkit:gate:static` on revert branches / commits; `bkit:gate:min` on a min push). It also runs the CI-suppressing-token guards, the dependency audit (§ Dependency audit) and the `tmp/` prune (§ tmp/ prune). Each hook ends by starting the disk prune (§ Disk prune).
 
-Pre-push re-runs itself once with all its output copied to `tmp/pre-push.log`, which is rewritten on each push. It prints that path first and last, with the exit code. `--no-verify` and a checkout without husky (a linked worktree) write no log.
+Pre-push re-runs itself once with all its output copied to `tmp/pre-push.log`, which is rewritten on each push. It prints that path first and last, with the exit code. `--no-verify` and a checkout without husky (a linked worktree) write no log. When the repo has an `.envrc`, `direnv` is on `PATH` and `CI` is unset, the inner run goes through `direnv exec .`, so the gate loads `.envrc` itself. An untrusted `.envrc` blocks in seconds with the `direnv allow .` fix, before `bkit check`. A repo whose hook copy lacks this gets the `pre-push-direnv` tip.
 
 Workflows care because they commit and push without `--no-verify`, so a failing hook stops a workflow. The throwaway `.worktrees/_land-{FID}` checkout runs its selected gate explicitly before pushing, with hooks disabled (§ One landing routine in `.bkit/workflows.md`). Reference: https://typicode.github.io/husky/.
 
@@ -442,6 +442,7 @@ direnv allow
 ```
 
 - Adapt: add one `dotenv_if_exists <path>` line per extra env file.
+- The pre-push hook loads `.envrc` itself on push (§ Git hooks — Husky), so an agent's shell that never loaded it still pushes with it. Run `direnv allow .` once per folder, or the push blocks.
 - `unset` the keys that must stay out of the shell. They are dropped from the cloud env blocks too.
 
 ## Launchd GUI environment — tokens for Dock-launched apps
diff --git a/.bkit/templates/.husky/pre-push b/.bkit/templates/.husky/pre-push
index a8a4a03a2..fa389cb57 100755
--- a/.bkit/templates/.husky/pre-push
+++ b/.bkit/templates/.husky/pre-push
@@ -24,7 +24,9 @@ set -e
 # background, still has the whole run. The path is printed first (tail -f it while the push
 # runs) and last, with the exit code. Git's ref list on stdin reaches the inner run unchanged,
 # and the hook exits with the inner run's code. Output goes to stderr, where git sends a
-# hook's output anyway. `git push --no-verify`, and a checkout without husky installed (a
+# hook's output anyway. When the repo has an `.envrc`, `direnv` is on PATH and CI is unset, the
+# inner run goes through `direnv exec .`, so the gate sees the repo's variables whatever shell
+# pushed; an untrusted `.envrc` blocks first with the `direnv allow .` fix. `git push --no-verify`, and a checkout without husky installed (a
 # linked worktree), run no hook and write no log.
 if [ -z "${BKIT_PRE_PUSH_LOGGED:-}" ]; then
   PRE_PUSH_LOG=tmp/pre-push.log
@@ -33,7 +35,16 @@ if [ -z "${BKIT_PRE_PUSH_LOGGED:-}" ]; then
   {
     echo "[pre-push] log: $PRE_PUSH_LOG"
     pre_push_rc=0
-    BKIT_PRE_PUSH_LOGGED=1 FORCE_COLOR=1 sh "$0" "$@" 2>&1 || pre_push_rc=$?
+    if [ -f .envrc ] && [ -z "${CI:-}" ] && command -v direnv > /dev/null 2>&1; then
+      if direnv exec . true < /dev/null 2>&1; then
+        BKIT_PRE_PUSH_LOGGED=1 FORCE_COLOR=1 direnv exec . sh "$0" "$@" 2>&1 || pre_push_rc=$?
+      else
+        echo "[pre-push] .envrc is not trusted: run \`direnv allow .\` in this folder, then push again."
+        pre_push_rc=1
+      fi
+    else
+      BKIT_PRE_PUSH_LOGGED=1 FORCE_COLOR=1 sh "$0" "$@" 2>&1 || pre_push_rc=$?
+    fi
     echo "[pre-push] log: $PRE_PUSH_LOG (exit $pre_push_rc)"
     echo "$pre_push_rc" > "$PRE_PUSH_RC_FILE"
   } | tee "$PRE_PUSH_LOG" >&2
diff --git a/.husky/pre-push b/.husky/pre-push
index fb6dc3577..717afd8a3 100755
--- a/.husky/pre-push
+++ b/.husky/pre-push
@@ -24,7 +24,9 @@ set -e
 # background, still has the whole run. The path is printed first (tail -f it while the push
 # runs) and last, with the exit code. Git's ref list on stdin reaches the inner run unchanged,
 # and the hook exits with the inner run's code. Output goes to stderr, where git sends a
-# hook's output anyway. `git push --no-verify`, and a checkout without husky installed (a
+# hook's output anyway. When the repo has an `.envrc`, `direnv` is on PATH and CI is unset, the
+# inner run goes through `direnv exec .`, so the gate sees the repo's variables whatever shell
+# pushed; an untrusted `.envrc` blocks first with the `direnv allow .` fix. `git push --no-verify`, and a checkout without husky installed (a
 # linked worktree), run no hook and write no log.
 if [ -z "${BKIT_PRE_PUSH_LOGGED:-}" ]; then
   PRE_PUSH_LOG=tmp/pre-push.log
@@ -33,7 +35,16 @@ if [ -z "${BKIT_PRE_PUSH_LOGGED:-}" ]; then
   {
     echo "[pre-push] log: $PRE_PUSH_LOG"
     pre_push_rc=0
-    BKIT_PRE_PUSH_LOGGED=1 FORCE_COLOR=1 sh "$0" "$@" 2>&1 || pre_push_rc=$?
+    if [ -f .envrc ] && [ -z "${CI:-}" ] && command -v direnv > /dev/null 2>&1; then
+      if direnv exec . true < /dev/null 2>&1; then
+        BKIT_PRE_PUSH_LOGGED=1 FORCE_COLOR=1 direnv exec . sh "$0" "$@" 2>&1 || pre_push_rc=$?
+      else
+        echo "[pre-push] .envrc is not trusted: run \`direnv allow .\` in this folder, then push again."
+        pre_push_rc=1
+      fi
+    else
+      BKIT_PRE_PUSH_LOGGED=1 FORCE_COLOR=1 sh "$0" "$@" 2>&1 || pre_push_rc=$?
+    fi
     echo "[pre-push] log: $PRE_PUSH_LOG (exit $pre_push_rc)"
     echo "$pre_push_rc" > "$PRE_PUSH_RC_FILE"
   } | tee "$PRE_PUSH_LOG" >&2
diff --git a/dist/checks/tips/catalogue.js b/dist/checks/tips/catalogue.js
index dabefb7ac..6425e4c0b 100644
--- a/dist/checks/tips/catalogue.js
+++ b/dist/checks/tips/catalogue.js
@@ -387,6 +387,21 @@ export const SETUP_TIPS = [
             return ["bkit ci min-push", "--update=", "bkit ci push-gate"].some((part) => !hook.includes(part));
         },
     },
+    {
+        id: "pre-push-direnv",
+        workflows: ["plan", "ship"],
+        title: "Load .envrc when the pre-push hook runs",
+        line: "Your pre-push hook runs the gate without your .envrc variables when the shell that pushed never loaded them.",
+        why: "The newer hook runs its logged inner run through `direnv exec .`, so the gate always sees the repo's variables, and an untrusted .envrc stops the push in seconds with the fix instead of failing deep in the gate.",
+        ask: "Replace the log block of .husky/pre-push (the `BKIT_PRE_PUSH_LOGGED` block) with the one in .bkit/templates/.husky/pre-push.",
+        steps: "`.bkit/templates.md` § Git hooks.",
+        fires: (cwd) => {
+            if (!exists(cwd, ".husky/pre-push") || !exists(cwd, ".envrc"))
+                return false;
+            const hook = fs.readFileSync(path.join(cwd, ".husky/pre-push"), "utf-8");
+            return !hook.includes("direnv exec");
+        },
+    },
     {
         id: "disk-prune",
         workflows: ALL_WORKFLOWS,
