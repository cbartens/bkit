diff --git a/.bkit/core/engine/audits/repo/check-dist.integration.test.ts b/.bkit/core/engine/audits/repo/check-dist.integration.test.ts
index 3f7f226cd..8e41491bf 100644
--- a/.bkit/core/engine/audits/repo/check-dist.integration.test.ts
+++ b/.bkit/core/engine/audits/repo/check-dist.integration.test.ts
@@ -15,6 +15,7 @@ const ROOT = process.cwd();
 const SCRIPT = path.join(ROOT, "scripts/gate/bkit-check-dist.mjs");
 const TSC = path.join(ROOT, "node_modules/.bin/tsc");
 const STALE_MESSAGE = "[bkit] dist/ is stale — run pnpm build and commit the result";
+const REF_MESSAGE = "[bkit] --ref value is not a commit";
 const EMPTY_MESSAGE =
   "[bkit] the staged tree compiles to no file under dist/ — check tsconfig.json outDir and noEmit";
 
@@ -64,8 +65,8 @@ function scratchRepo(): string {
   return dir;
 }
 
-function check(cwd: string) {
-  return spawnSync("node", [SCRIPT], { cwd, encoding: "utf-8" });
+function check(cwd: string, ...args: string[]) {
+  return spawnSync("node", [SCRIPT, ...args], { cwd, encoding: "utf-8" });
 }
 
 function readDist(cwd: string): Record<string, string> {
@@ -180,4 +181,62 @@ describe("bkit-check-dist", () => {
       expect(result.stderr + result.stdout).toContain(EMPTY_MESSAGE);
     },
   );
+
+  it(
+    "--ref of a commit with a stale dist fails as stale while the fix is only staged",
+    { timeout: localLimit(120_000) },
+    () => {
+      const dir = scratchRepo();
+      write(dir, A, "export const a: number = 2;\n");
+      git(dir, "add", A);
+      git(dir, "commit", "-q", "-m", "a changed, dist not rebuilt");
+      const head = git(dir, "rev-parse", "HEAD").trim();
+      build(dir);
+      git(dir, "add", "dist");
+      const result = check(dir, `--ref=${head}`);
+      expect(result.status).toBe(1);
+      expect(result.stderr + result.stdout).toContain(STALE_MESSAGE);
+    },
+  );
+
+  it(
+    "--ref of a correct commit passes while an unrelated engine edit is staged",
+    { timeout: localLimit(120_000) },
+    () => {
+      const dir = scratchRepo();
+      const head = git(dir, "rev-parse", "HEAD").trim();
+      write(dir, B, "export const b: number = 2;\n");
+      git(dir, "add", B);
+      const result = check(dir, `--ref=${head}`);
+      expect(result.stderr + result.stdout).not.toContain("dist/ is stale");
+      expect(result.status).toBe(0);
+    },
+  );
+
+  it(
+    "--ref values starting with a dash, empty or not a commit are refused with no scratch folder left",
+    { timeout: localLimit(120_000) },
+    () => {
+      const dir = scratchRepo();
+      for (const value of ["-x", "--output=x", "", "no-such-commit"]) {
+        const result = check(dir, `--ref=${value}`);
+        expect(result.status, `--ref=${value}`).toBe(1);
+        expect(result.stderr + result.stdout, `--ref=${value}`).toContain(REF_MESSAGE);
+        expect(scratchLeftovers(dir)).toEqual([]);
+      }
+    },
+  );
+
+  it(
+    "without --ref the check still reads the index and not the commit",
+    { timeout: localLimit(120_000) },
+    () => {
+      const dir = scratchRepo();
+      write(dir, A, "export const a: number = 3;\n");
+      git(dir, "add", A);
+      const result = check(dir);
+      expect(result.status).toBe(1);
+      expect(result.stderr + result.stdout).toContain(STALE_MESSAGE);
+    },
+  );
 });
diff --git a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
index c1914d5fa..97c882ccd 100644
--- a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
@@ -1260,10 +1260,37 @@ describe(".husky/pre-push min push", () => {
   });
 
   it(".husky/pre-push: a code push still runs them", () => {
-    const r = push(".husky/pre-push", commitFiles({ "src/a.ts": "b\n" }, "feat(1): a"));
-    expect(r.calls).toContain("bkit:check:dist");
+    const sha = commitFiles({ "src/a.ts": "b\n" }, "feat(1): a");
+    const r = push(".husky/pre-push", sha);
+    expect(r.calls).toContain(`bkit:check:dist --ref=${sha}`);
+    expect(r.calls).not.toContain("bkit:check:dist");
     expect(r.calls).toContain("bkit:lint:workflows");
   });
+
+  it(".husky/pre-push: a push to dev checks the commit pushed to dev, which wins over the branch commit", () => {
+    const devSha = commitFiles({ "src/a.ts": "b\n" }, "feat(1): a");
+    const branchSha = commitFiles({ "src/a.ts": "c\n" }, "feat(1): b");
+    const r = push(
+      ".husky/pre-push",
+      devSha,
+      "refs/heads/dev",
+      ZERO,
+      `refs/heads/feat/1-x ${branchSha} refs/heads/feat/1-x ${ZERO}\n`,
+    );
+    expect(r.calls).toContain(`bkit:check:dist --ref=${devSha}`);
+    expect(r.calls).not.toContain(`bkit:check:dist --ref=${branchSha}`);
+    expect(r.calls).not.toContain("bkit:check:dist");
+  });
+
+  it(".husky/pre-push: a push with no dev or branch commit runs the dist check with no argument", () => {
+    const r = push(
+      ".husky/pre-push",
+      commitFiles({ "src/a.ts": "b\n" }, "feat(1): a"),
+      "refs/heads/other",
+    );
+    expect(r.calls).toContain("bkit:check:dist");
+    expect(r.calls.some((c) => c.startsWith("bkit:check:dist --ref"))).toBe(false);
+  });
 });
 
 // ---------------------------------------------------------------------------
diff --git a/.husky/pre-push b/.husky/pre-push
index 229af83ca..a98ff2117 100755
--- a/.husky/pre-push
+++ b/.husky/pre-push
@@ -388,11 +388,21 @@ if [ -n "$PUSH_DEV_SHA" ] && [ -f scripts/ci/lanes/bkit-resolve-push-base.mjs ];
   fi
 fi
 
-# bkit repo only: the staged `dist/` must equal the `tsc` output of the staged tree (the
-# index), and actionlint over `.github/workflows/*` (skips when actionlint is absent). A min
-# push skips both: it changes no code.
+# bkit repo only: `dist/` must equal the `tsc` output of the same tree, and actionlint over
+# `.github/workflows/*` (skips when actionlint is absent). The dist check judges the commit pushed
+# to `dev`, else the commit pushed to the checked-out branch; with neither (a tag push, a delete, a
+# branch that is not checked out) it reads the index. A min push skips both: it changes no code.
 if [ "$MIN_PUSH" != "1" ]; then
-  pnpm bkit:check:dist < /dev/null
+  DIST_REF="${PUSH_DEV_SHA:-$PUSH_BRANCH_SHA}"
+  case "$DIST_REF" in
+    *[!0]*) ;;
+    *) DIST_REF="" ;;
+  esac
+  if [ -n "$DIST_REF" ]; then
+    pnpm bkit:check:dist --ref="$DIST_REF" < /dev/null
+  else
+    pnpm bkit:check:dist < /dev/null
+  fi
   pnpm bkit:lint:workflows < /dev/null
 fi
 
diff --git a/docs/deployments.md b/docs/deployments.md
index 40f2c4957..7c98e6906 100644
--- a/docs/deployments.md
+++ b/docs/deployments.md
@@ -614,9 +614,9 @@ Gate fails locally → fix + re-stage; do not `--no-verify` or amend over failed
 
 Source-repo only. Any `.bkit/core/engine/**/*.ts` change MUST include `pnpm build && git add dist/` in same commit.
 
-- `pnpm bkit:check:dist` runs `node scripts/gate/bkit-check-dist.mjs`. It compiles the staged tree (the index) in a scratch folder under `tmp/`, compares each output's mode and content with the staged `dist/`, and fails when they differ or when the compile writes no file under `dist/`. It leaves the working tree's `dist/` alone.
+- `pnpm bkit:check:dist` runs `node scripts/gate/bkit-check-dist.mjs`. It compiles the staged tree (the index), or with `--ref=<commit>` that commit's tree, in a scratch folder under `tmp/`, compares each output's mode and content with the `dist/` of the same tree, and fails when they differ or when the compile writes no file under `dist/`. It leaves the working tree's `dist/` alone.
 - Hooks run `typecheck` + the unit and integration tiers, not `pnpm build`, and never commit a freshened `dist/`; run `pnpm build && git add dist/` by hand.
-- Source-repo pre-commit runs `pnpm bkit:check:dist` when the commit adds, changes, deletes or renames a non-test `.bkit/core/engine/**/*.ts` file. Source-repo pre-push runs it on every push except a min push.
+- Source-repo pre-commit runs `pnpm bkit:check:dist` when the commit adds, changes, deletes or renames a non-test `.bkit/core/engine/**/*.ts` file. Source-repo pre-push runs it on every push except a min push, with `--ref` of the commit pushed to `dev`, else of the checked-out branch's pushed commit; with neither it reads the index.
 - CI `bkit-tests-static` "Assert Dist Freshness" runs `pnpm bkit:check:dist` — `.github/workflows/bkit-ci.yml` only.
 - Consumer template `.bkit/templates/.github/workflows/bkit-ci.yml` omits freshness (tarball install, no recompile). Do not add there.
 
diff --git a/docs/testing.md b/docs/testing.md
index bc980c4c2..f077f2d2b 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -921,7 +921,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `.bkit/core/engine/audits/templates/branding.test.ts` | Unit | Branding guard: template script names that run bkit code start `bkit:`, template file names, workflow and job display names and the shipped Vale style start `bkit-` / `Bkit`; each rule runs on a seeded negative. |
 | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | Unit | Every template has an entry; each repo-root copy equals the template after its listed edits (placeholder / adapt / bkit-only), else the test fails. Change a copy → list the edit there. |
 | `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts` | Integration | bkit's own `bkit:test:file` (`scripts/ci/bkit-test-file.mjs`) on a `.bats`, a `node:test` `.mjs` and a Vitest file: the JUnit report at `$BKIT_TEST_REPORT` holds the named test passed (read with the audit's `parseJunit` / `judgeGreen`); unset report path leaves the test file untouched; files of two runners → exit 2; a `node:test` file whose test awaits a never-exiting child exits 1 within the limit, reported as a failure. `bkit:lint:file` exits 0 on each kind. |
-| `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` | Integration | `scripts/gate/bkit-check-dist.mjs` in a scratch git repo: a staged edit with a matching staged `dist/` passes beside an unstaged engine edit; a stale staged `dist/` exits 1 with `[bkit] dist/ is stale`; the working tree's `dist/` bytes and `tmp/` stay untouched; a staged `dist/` file shadowed by a tab-named twin exits 1 as stale; a staged `dist/` that matches the build only through a `.gitattributes` filter exits 1 as stale; a staged `tsconfig.json` with `noEmit` and no staged `dist/` exits 1 with `[bkit] the staged tree compiles to no file under dist/`. |
+| `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` | Integration | `scripts/gate/bkit-check-dist.mjs` in a scratch git repo: a staged edit with a matching staged `dist/` passes beside an unstaged engine edit; a stale staged `dist/` exits 1 with `[bkit] dist/ is stale`; the working tree's `dist/` bytes and `tmp/` stay untouched; a staged `dist/` file shadowed by a tab-named twin exits 1 as stale; a staged `dist/` that matches the build only through a `.gitattributes` filter exits 1 as stale; a staged `tsconfig.json` with `noEmit` and no staged `dist/` exits 1 with `[bkit] the staged tree compiles to no file under dist/`; `--ref=<commit>` judges that commit: a stale commit fails while the fix is staged, a correct commit passes beside an unrelated staged engine edit, a `--ref` value that is empty, starts with `-` or is not a commit exits 1 with `[bkit] --ref value is not a commit` and leaves no scratch folder; without `--ref` the index is read. |
 | `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` | Integration | `tests/shell/setup_suite.bash` under a linked worktree's `GIT_DIR`: clears every `GIT_*` variable, fails and undoes a test's identity or `core.bare` write; a hanging bats test fails with `timeout after` under `CI=true`. |
 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | Integration | Cursor destructive-op / secret-exposure hook (`.cursor/hooks/bkit-guardrails.cjs`, spawned): the tiers judge the commands that run, not quoted text (a quoted commit message, `echo`, `grep` and `gh` body allowed; a force push inside `$(…)`, `bash -c` (also `bash -c -- '…'`), `eval`, `env -S`, `find -exec`, `function f { …; }`, a heredoc fed to `bash`, literal `echo` / `printf` / `cat <<` text piped into a shell, an `echo` in `<(…)` given to `bash` or `source`, or behind `timeout` / `env -u` / `nice` / `setsid` refused; `echo … \| grep` and `echo … \| cat` allowed; a command over 256 KiB cut on a character boundary); `rm -rf` of a root or home (also `//`, `/.`, behind `doas` or `busybox`) refused and of a project path allowed, a world-writable `chmod -R` of `/` (`777`, `0777`, `a+rwx`), `sudo` and `doas` as program or wrapper, `bkit tests jump` (refused on Codex only), `cat .env` and `cat < .env`; the deny part spliced once into the Claude, Codex, Cursor and Antigravity hooks; curl-wget host allowlist read from the parsed curl / wget words only (a URL in a quoted `echo` is not a fetch; one after `--` or behind `timeout` / `env -u` is), private-key and `.env` reads, managed-block boundary. Shell-edit advice from the known-writers table: each writer names its target (`perl -lpi` and `-0777pi` too), a variable target (also `find -exec sed -i … {} +`) warns without a name, `git -C sub apply` warns, `node` / `python3` script runs, `prettier --check` and `git checkout -b` are silent; the analysis bounds and the output budget; `guardrails-shell.js` is at most 1433 lines; live visibility on any host stays unverified. |
 | `.bkit/core/engine/audits/hooks/guardrails-parity.integration.test.ts` | Integration | The five hosts' guardrails hooks as install renders them: `composeAdvice` gives Codex, Cursor and Antigravity one advice text for deny, ask, secret, fetch and edit apart from the host name, and a long fetch command is cut inside the 2000-byte budget; the Claude hook prints a deny JSON and exits 0 for an `env -u FOO` force push and no deny for a quoted one; the OpenCode plugin, run in process on 1.x and 2.0 payloads, throws for that force push, returns for `git status` and returns when it errors; one command table gets the same refuse-or-allow verdict on all five hosts, with ask only on Cursor and Antigravity and the Codex-only `bkit tests jump` deny; private-key shell commands: Codex denies each command that prints a key's content or sends it off the machine (`git show`, `dd`, `openssl` encoders, `@file` uploads, `scp` to a host, globs that can match a key) and does not deny one that uses, writes, edits in place or names a key file, Cursor and Antigravity ask on every command that names a key file (`id_ed25519`, `*.key` and key globs included), and Claude Code and OpenCode allow; `classifyShell`, loaded from the rendered Cursor block, gives `deny` for `codex` and `secret` for `cursor` and `antigravity` from the host argument alone; an argv-array command (`["bash", "-lc", "git push -f origin dev"]`) is refused on Claude, Codex and Antigravity and a quoted array element is not. No test starts a host session. |
diff --git a/scripts/gate/bkit-check-dist.mjs b/scripts/gate/bkit-check-dist.mjs
index d29a60ac0..eadea1afc 100644
--- a/scripts/gate/bkit-check-dist.mjs
+++ b/scripts/gate/bkit-check-dist.mjs
@@ -1,8 +1,9 @@
 #!/usr/bin/env node
-// Checks the staged `dist/` against a compile of the staged tree (the index), never the working
-// tree. Exports the staged engine sources into `tmp/check-dist-*`, compiles them there and
-// compares each output's mode and blob hash with `git ls-files -s dist/`. A compile that writes
-// no file under `dist/` fails. Leaves the working tree's `dist/` alone.
+// Checks `dist/` against a compile of the same tree, never the working tree. With no argument the
+// tree is the index (the staged tree). With `--ref=<commit>` the tree is that commit's. Exports the
+// engine sources into `tmp/check-dist-*`, compiles them there and compares each output's mode and
+// blob hash with `git ls-files -s dist/` of the same tree. A compile that writes no file under
+// `dist/` fails. Leaves the working tree's `dist/` alone.
 
 import { spawnSync } from "node:child_process";
 import * as fs from "node:fs";
@@ -34,20 +35,49 @@ function walk(root, rel = "") {
   return files;
 }
 
-function run() {
+const REF_ERROR = "[bkit] --ref value is not a commit";
+
+/** Returns the full commit hash of `--ref=<value>`, null with no `--ref`; throws on a bad value. */
+function parseRef(argv) {
+  let ref = null;
+  for (const arg of argv) {
+    if (!arg.startsWith("--ref=")) throw new Error(`[bkit] unknown argument: ${arg}`);
+    ref = arg.slice("--ref=".length);
+  }
+  if (ref === null) return null;
+  if (ref === "" || ref.startsWith("-")) throw new Error(REF_ERROR);
+  const resolved = spawnSync(
+    "git",
+    ["rev-parse", "--verify", "--end-of-options", `${ref}^{commit}`],
+    { encoding: "utf-8" },
+  );
+  const hash = resolved.stdout.trim();
+  if (resolved.status !== 0 || !/^[0-9a-f]{40,64}$/.test(hash)) throw new Error(REF_ERROR);
+  return hash;
+}
+
+function run(ref) {
   const repo = git(["rev-parse", "--show-toplevel"]).trim();
   const tmpRoot = path.join(repo, "tmp");
   fs.mkdirSync(tmpRoot, { recursive: true });
   const scratch = fs.mkdtempSync(path.join(tmpRoot, "check-dist-"));
+  const indexFile = `${scratch}.index`;
   try {
+    // With a ref, a temporary index holds that commit's tree; every index read below uses it.
+    let env = process.env;
+    if (ref) {
+      env = { ...process.env, GIT_INDEX_FILE: indexFile };
+      git(["read-tree", ref], { cwd: repo, env });
+    }
     const staged = git(
       ["ls-files", "-z", "--", ".bkit/core/engine", "tsconfig.json", "package.json"],
-      { cwd: repo },
+      { cwd: repo, env },
     )
       .split("\0")
       .filter(Boolean);
     const exported = spawnSync("git", ["checkout-index", "-z", "--stdin", `--prefix=${scratch}/`], {
       cwd: repo,
+      env,
       input: staged.join("\0") + "\0",
       encoding: "utf-8",
     });
@@ -69,7 +99,7 @@ function run() {
     if (fs.existsSync(cli)) fs.chmodSync(cli, 0o755);
 
     const expected = new Map();
-    for (const line of git(["ls-files", "-s", "-z", "--", "dist/"], { cwd: repo })
+    for (const line of git(["ls-files", "-s", "-z", "--", "dist/"], { cwd: repo, env })
       .split("\0")
       .filter(Boolean)) {
       const tab = line.indexOf("\t");
@@ -108,11 +138,12 @@ function run() {
     return 0;
   } finally {
     fs.rmSync(scratch, { recursive: true, force: true });
+    fs.rmSync(indexFile, { force: true });
   }
 }
 
 try {
-  process.exitCode = run();
+  process.exitCode = run(parseRef(process.argv.slice(2)));
 } catch (error) {
   console.error(error instanceof Error ? error.message : String(error));
   process.exitCode = 1;
