diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index a0f1b2603..4548d7666 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -290,7 +290,7 @@ A `context` job resolves the phase and argument once. Then three runner jobs fol
 
 `pre-commit` runs `bkit:gate:format`. `pre-push` runs `bkit check` first, so a drifted install fails in seconds. Then it runs `bkit:gate:static-unit-integration` when package.json declares it, else `bkit:gate:static-unit` (`bkit:gate:static` on revert branches / commits; `bkit:gate:min` on a min push). It also runs the CI-suppressing-token guards, the dependency audit (§ Dependency audit) and the `tmp/` prune (§ tmp/ prune). Each hook ends by starting the disk prune (§ Disk prune).
 
-Pre-push re-runs itself once with all its output copied to `tmp/pre-push.log`, which is rewritten on each push. It prints that path first and last, with the exit code. `--no-verify` and a checkout without husky (a linked worktree) write no log. When the repo has an `.envrc`, `direnv` is on `PATH` and `CI` is unset, the inner run goes through `direnv exec .`, so the gate loads `.envrc` itself. An untrusted `.envrc` blocks in seconds with the `direnv allow .` fix, before `bkit check`. A repo whose hook copy lacks this gets the `pre-push-direnv` tip.
+Pre-push re-runs itself once with all its output copied to `tmp/pre-push.log`, which is rewritten on each push. It prints that path first and last, with the exit code. `--no-verify` and a checkout without husky (a linked worktree) write no log. When the repo has an `.envrc`, `direnv` is on `PATH` and `CI` is unset, the inner run goes through `direnv exec .`, so the gate loads `.envrc` itself, minus the keys `.bkit/.env` holds (`BKIT_GH_TOKEN` and the other tooling secrets are unset for the gate). An untrusted `.envrc` blocks in seconds with the `direnv allow .` fix, before `bkit check`. A repo whose hook copy lacks this gets the `pre-push-direnv` tip.
 
 Workflows care because they commit and push without `--no-verify`, so a failing hook stops a workflow. The throwaway `.worktrees/_land-{FID}` checkout runs its selected gate explicitly before pushing, with hooks disabled (§ One landing routine in `.bkit/workflows.md`). Reference: https://typicode.github.io/husky/.
 
diff --git a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
index 62979dedc..b1c92a60e 100644
--- a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
@@ -1418,4 +1418,38 @@ describe(".husky/pre-push direnv", () => {
       expect(r.stderr, hook).toContain("delete-only push");
     }
   });
+
+  it("trusted .envrc → .bkit/.env tooling keys do not reach the gate", () => {
+    for (const hook of HOOKS) {
+      fs.rmSync(path.join(tmp, "calls.log"), { force: true });
+      fs.rmSync(path.join(tmp, "direnv.log"), { force: true });
+      fs.mkdirSync(path.join(tmp, ".bkit"), { recursive: true });
+      fs.writeFileSync(
+        path.join(tmp, ".bkit", ".env"),
+        "BKIT_GH_TOKEN=dummy-write-pat\nBKIT_OTHER_KEY=dummy-other\n",
+      );
+      // direnv stub: like `dotenv_if_exists .bkit/.env` in the .envrc, export the file's keys
+      // and the .envrc's own variable, then run the command after `exec .`.
+      fs.writeFileSync(
+        path.join(tmp, "bin", "direnv"),
+        `#!/bin/sh\necho "$*" >> "${tmp}/direnv.log"\nshift 2\nset -a\n. ./.bkit/.env\nGATE_VAR=from-envrc\nset +a\nexec "$@"\n`,
+        { mode: 0o755 },
+      );
+      fs.writeFileSync(
+        path.join(tmp, "bin", "pnpm"),
+        `#!/bin/sh\ncase "$*" in *skip-token*|*"ci min-push"*) exit 1 ;; esac\necho "pnpm: $* GATE_VAR=\${GATE_VAR:-unset} BKIT_GH_TOKEN=\${BKIT_GH_TOKEN:-unset} BKIT_OTHER_KEY=\${BKIT_OTHER_KEY:-unset}" >> "${tmp}/calls.log"\nexit 0\n`,
+        { mode: 0o755 },
+      );
+      const r = runHook(hook, UPDATE);
+      expect(r.status, hook).toBe(0);
+      const gate = r.calls.filter((c) => c.includes("push-gate"));
+      expect(gate.length, hook).toBeGreaterThan(0);
+      for (const g of gate) {
+        expect(g, hook).toContain("GATE_VAR=from-envrc");
+        expect(g, hook).toContain("BKIT_GH_TOKEN=unset");
+        expect(g, hook).toContain("BKIT_OTHER_KEY=unset");
+      }
+      expect(r.stderr, hook).not.toContain("dummy-write-pat");
+    }
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts b/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
index 3df37d1b0..942238f9c 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
@@ -426,6 +426,20 @@ describe("bkit worktrees setup — mint (create)", () => {
     expect(again.err).toContain("direnv allow failed (exit 1)");
   });
 
+  it("setup with an .envrc differing from the main checkout's reports that the push will block", async () => {
+    const f = fixture();
+    fs.writeFileSync(path.join(f.seed, ".envrc"), "export A=1\n");
+    git(f.seed, "add", ".envrc");
+    git(f.seed, "commit", "-q", "-m", "envrc");
+    git(f.seed, "push", "-q", "origin", "HEAD:dev");
+    // The main checkout's dev is behind, so its .envrc differs (it has none).
+    const r = await setup(f.repo, "build", "--worktrees");
+    expect(r.json.direnvAllowed).toBe(false);
+    expect(direnvCalls()).toBe("");
+    expect(r.err).toContain("push will block");
+    expect(r.err).toContain("direnv allow");
+  });
+
   it("copies the configured list, narrates each missing entry, and nothing outside it", async () => {
     const f = fixture();
     fs.mkdirSync(path.join(f.repo, "apps/web"), { recursive: true });
diff --git a/.bkit/core/engine/commands/workflow/worktrees.ts b/.bkit/core/engine/commands/workflow/worktrees.ts
index 6b0aec27e..d88a7eec6 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.ts
@@ -639,7 +639,8 @@ function linkBkitEnv(
  * `direnv allow` the worktree's `.envrc` when it matches the main checkout's
  * byte for byte, so the worktree inherits the trust given there and nothing
  * more; a differing file is left for a human to read. No `.envrc`, direnv
- * missing or failing → false, narrated, never fatal.
+ * missing or failing → false, narrated (a differing or failed one says the push will
+ * block, since the pre-push hook refuses an untrusted `.envrc`), never fatal.
  */
 function allowDirenv(root: string, wt: string, log: (m: string) => void): boolean {
   const envrc = path.join(wt, ".envrc");
@@ -647,7 +648,7 @@ function allowDirenv(root: string, wt: string, log: (m: string) => void): boolea
   const main = path.join(root, ".envrc");
   if (!fs.existsSync(main) || !fs.readFileSync(main).equals(fs.readFileSync(envrc))) {
     log(
-      `direnv: ${envrc} differs from the main checkout's — not allowed; read it, then run direnv allow`,
+      `direnv: ${envrc} differs from the main checkout's — not allowed, so the pre-push hook will block the first push (the push will block until you read it and run direnv allow .)`,
     );
     return false;
   }
@@ -657,7 +658,9 @@ function allowDirenv(root: string, wt: string, log: (m: string) => void): boolea
     return false;
   }
   if (res.status !== 0) {
-    log(`direnv allow failed (exit ${res.status}): ${(res.stderr ?? "").trim()}`);
+    log(
+      `direnv allow failed (exit ${res.status}): ${(res.stderr ?? "").trim()} — the push will block until you run direnv allow . in the worktree`,
+    );
     return false;
   }
   return true;
diff --git a/.bkit/templates/.husky/pre-push b/.bkit/templates/.husky/pre-push
index fa389cb57..b4521b26d 100755
--- a/.bkit/templates/.husky/pre-push
+++ b/.bkit/templates/.husky/pre-push
@@ -26,7 +26,7 @@ set -e
 # and the hook exits with the inner run's code. Output goes to stderr, where git sends a
 # hook's output anyway. When the repo has an `.envrc`, `direnv` is on PATH and CI is unset, the
 # inner run goes through `direnv exec .`, so the gate sees the repo's variables whatever shell
-# pushed; an untrusted `.envrc` blocks first with the `direnv allow .` fix. `git push --no-verify`, and a checkout without husky installed (a
+# pushed; an untrusted `.envrc` blocks first with the `direnv allow .` fix. The keys in `.bkit/.env` are unset for the gate. `git push --no-verify`, and a checkout without husky installed (a
 # linked worktree), run no hook and write no log.
 if [ -z "${BKIT_PRE_PUSH_LOGGED:-}" ]; then
   PRE_PUSH_LOG=tmp/pre-push.log
@@ -53,6 +53,14 @@ if [ -z "${BKIT_PRE_PUSH_LOGGED:-}" ]; then
   exit "$pre_push_rc"
 fi
 
+# The tooling keys `.bkit/.env` holds (BKIT_GH_TOKEN, ...) are unset for the gate: its tests, lint
+# plugins and dependency code never need them, and their output lands in the agent-readable log.
+if [ -f .bkit/.env ]; then
+  for gate_key in $(sed -n 's/^[[:space:]]*\(export[[:space:]][[:space:]]*\)\{0,1\}\([A-Za-z_][A-Za-z0-9_]*\)=.*/\2/p' .bkit/.env); do
+    unset "$gate_key"
+  done
+fi
+
 # Git exports GIT_DIR to a hook and everything it starts (from a linked worktree:
 # <main>/.git/worktrees/<name>). It beats a child's cwd and -C, so a test's `git -C "$tmp" init`
 # re-initialises this repo (core.bare=true in the shared .git/config) and a fixture's
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 4b35559dc..2a6ff6641 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -1181,7 +1181,7 @@ Then, for `created` / `resumed` worktrees only:
 
 - **Copy:** each `package.json` `bkit.workflows.worktree.copy` entry (default `.env`, `.env.local`; files or folders) from the main checkout; `copied` / `copyMissing` list them and every missing entry is narrated. No app path is hard-coded. An entry pointing outside the main checkout is skipped. Beside them, bkit links its own `.bkit/.env` (gitignored, so a fresh checkout has none) to the main checkout's copy — one source of truth across a token rotation — copying it where a symlink is refused (a copy bkit made is refreshed on the next setup); `bkitEnv` reports `linked` / `unchanged` / `copied` / `differs` (a differing file is left to read) / `none` (the main checkout holds none) / `failed` (neither link nor copy could be written, narrated). Never committed: `.bkit/.env` is excluded from every bkit `git add -A` beside the configured entries.
 - **Install:** every workflow (`bkit.workflows.worktree.install`, default true), frozen lockfile through the package manager. It is required because per-package `node_modules` symlinks are not inherited by worktrees, and without the install there is no `.husky/_`, so commits and pushes in the worktree skip the hooks. Install failure → exit 5; a package manager that could not run → exit 6; both → **Failure Path** in every workflow.
-- **direnv:** a worktree `.envrc` byte-identical to the main checkout's gets `direnv allow` (`direnvAllowed`), so the worktree carries the trust given there and nothing more. A differing `.envrc`, direnv missing or failing → narrated, never fatal; a human reads it and runs `direnv allow`. No git hook can do it: `core.hooksPath` (`.husky/_`) exists only after the install.
+- **direnv:** a worktree `.envrc` byte-identical to the main checkout's gets `direnv allow` (`direnvAllowed`), so the worktree carries the trust given there and nothing more. A differing `.envrc` or a failed `direnv allow` → narrated, never fatal, with a warning that the pre-push hook blocks the first push until a human reads the file and runs `direnv allow .`. direnv missing → narrated; the hook then loads no `.envrc`. No git hook can do it: `core.hooksPath` (`.husky/_`) exists only after the install.
 - `logDir` created; `baseRef` = the base above; `baseSha` = `git merge-base {baseRef} HEAD` (design / plan anchor).
 
 Refused (exit 7): `dev` / `main` as the working branch (debug: `main` only), a detached HEAD, or ship unable to switch to its branch.
diff --git a/.husky/pre-push b/.husky/pre-push
index 717afd8a3..91cd07af0 100755
--- a/.husky/pre-push
+++ b/.husky/pre-push
@@ -26,7 +26,7 @@ set -e
 # and the hook exits with the inner run's code. Output goes to stderr, where git sends a
 # hook's output anyway. When the repo has an `.envrc`, `direnv` is on PATH and CI is unset, the
 # inner run goes through `direnv exec .`, so the gate sees the repo's variables whatever shell
-# pushed; an untrusted `.envrc` blocks first with the `direnv allow .` fix. `git push --no-verify`, and a checkout without husky installed (a
+# pushed; an untrusted `.envrc` blocks first with the `direnv allow .` fix. The keys in `.bkit/.env` are unset for the gate. `git push --no-verify`, and a checkout without husky installed (a
 # linked worktree), run no hook and write no log.
 if [ -z "${BKIT_PRE_PUSH_LOGGED:-}" ]; then
   PRE_PUSH_LOG=tmp/pre-push.log
@@ -53,6 +53,14 @@ if [ -z "${BKIT_PRE_PUSH_LOGGED:-}" ]; then
   exit "$pre_push_rc"
 fi
 
+# The tooling keys `.bkit/.env` holds (BKIT_GH_TOKEN, ...) are unset for the gate: its tests, lint
+# plugins and dependency code never need them, and their output lands in the agent-readable log.
+if [ -f .bkit/.env ]; then
+  for gate_key in $(sed -n 's/^[[:space:]]*\(export[[:space:]][[:space:]]*\)\{0,1\}\([A-Za-z_][A-Za-z0-9_]*\)=.*/\2/p' .bkit/.env); do
+    unset "$gate_key"
+  done
+fi
+
 # Git exports GIT_DIR to a hook and everything it starts (from a linked worktree:
 # <main>/.git/worktrees/<name>). It beats a child's cwd and -C, so a test's `git -C "$tmp" init`
 # re-initialises this repo (core.bare=true in the shared .git/config) and a fixture's
diff --git a/dist/commands/workflow/worktrees.js b/dist/commands/workflow/worktrees.js
index 8692529e8..b430fcd24 100644
--- a/dist/commands/workflow/worktrees.js
+++ b/dist/commands/workflow/worktrees.js
@@ -525,7 +525,8 @@ function linkBkitEnv(root, wt, fid, log) {
  * `direnv allow` the worktree's `.envrc` when it matches the main checkout's
  * byte for byte, so the worktree inherits the trust given there and nothing
  * more; a differing file is left for a human to read. No `.envrc`, direnv
- * missing or failing → false, narrated, never fatal.
+ * missing or failing → false, narrated (a differing or failed one says the push will
+ * block, since the pre-push hook refuses an untrusted `.envrc`), never fatal.
  */
 function allowDirenv(root, wt, log) {
     const envrc = path.join(wt, ".envrc");
@@ -533,7 +534,7 @@ function allowDirenv(root, wt, log) {
         return false;
     const main = path.join(root, ".envrc");
     if (!fs.existsSync(main) || !fs.readFileSync(main).equals(fs.readFileSync(envrc))) {
-        log(`direnv: ${envrc} differs from the main checkout's — not allowed; read it, then run direnv allow`);
+        log(`direnv: ${envrc} differs from the main checkout's — not allowed, so the pre-push hook will block the first push (the push will block until you read it and run direnv allow .)`);
         return false;
     }
     const res = spawnSync("direnv", ["allow", wt], { cwd: wt, encoding: "utf-8" });
@@ -542,7 +543,7 @@ function allowDirenv(root, wt, log) {
         return false;
     }
     if (res.status !== 0) {
-        log(`direnv allow failed (exit ${res.status}): ${(res.stderr ?? "").trim()}`);
+        log(`direnv allow failed (exit ${res.status}): ${(res.stderr ?? "").trim()} — the push will block until you run direnv allow . in the worktree`);
         return false;
     }
     return true;
diff --git a/docs/decisions.jsonl b/docs/decisions.jsonl
index 1ec43a4ac..ba5840932 100644
--- a/docs/decisions.jsonl
+++ b/docs/decisions.jsonl
@@ -798,3 +798,4 @@
 {"schema":3,"ts":1794363410348,"firstTs":1794363410348,"updates":1,"kind":"decision","key":"915-min-push-audit-template-project-section","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-generate","subagent":"bkit-plan-generate","model":"claude-opus-5-5"},"references":["915","https://github.com/cbartens/bkit/issues/915",".bkit/core/engine/commands/ci/ci.ts (minPushOutside)",".bkit/core/engine/commands/ci/push-gate.ts (hasVerifiedIncrement)",".bkit/core/engine/commands/land.ts (checkLanding)",".bkit/core/engine/install/managed-block.ts (managedHead)","min-push-floor-is-ship-allow-list","docs/plans/202611/915-min-push-ignores-plan.md"],"summary":"bkit ci min-push accepts a docs/templates/bkit-audit-*.md change when its text through the single <!-- bkit:end --> line is byte-identical at the base and the pushed commit; one classifier, minPushOutside in ci.ts, serves --ref, --update, the receipt path and the landing routine","description":"minPushOutside(root, from, to, paths) wraps changedOutside and drops from outside each top-level docs/templates/bkit-audit-*.md whose blob exists at both commits and whose managedHead (install/managed-block.ts: the text from the first byte through the end of the bkit:end line, null unless the file has exactly one line-anchored bkit:start and one bkit:end in that order) is non-null and equal at both. A new, deleted or renamed template, an unreadable blob, an extra marker line, or any change at or above bkit:end leaves the file outside, so the decision fails closed to the full gate. Blobs are read with gitRaw (untrimmed). hasVerifiedIncrement in push-gate.ts takes the classifier as a callback instead of a pathspec list, so the receipt path agrees with the whole-range path without push-gate.ts importing ci.ts. checkLanding in land.ts uses the same classifier. Each accepted template is logged by name. Other templates (bkit-plan.md, which plan-check reads) keep blocking.","rationale":"Every audit run edits the consumer-owned Project Instructions section below bkit:end, which bkit install never overwrites. The only code that reads that section is the advisory detectManagedDuplicate, which never changes bkit check's exit code and runs on every push anyway; the minimum gate's own prettier, Vale and slop steps read it on the min push itself.","alternatives":"Parse git diff -U0 hunk ranges against the marker's line number: breaks on hunks that straddle the marker and on marker lines added below. Exempt the whole audit template: lets a change to the bkit-managed block skip the full gate. Put the exception into changedOutside: widens ship's bookkeeping check and only-bookkeeping, which the owner did not ask for. Have push-gate.ts import the classifier from ci.ts: an import cycle, since ci.ts imports push-gate.ts."}
 {"schema":3,"ts":1794364660560,"firstTs":1794363410348,"updates":2,"kind":"decision","key":"915-min-push-audit-template-project-section","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-apply-review","subagent":"bkit-plan-update","model":"claude-opus-5-5"},"references":["915","https://github.com/cbartens/bkit/issues/915",".bkit/core/engine/commands/ci/ci.ts (minPushOutside)",".bkit/core/engine/commands/ci/push-gate.ts (hasVerifiedIncrement)",".bkit/core/engine/commands/land.ts (checkLanding)",".bkit/core/engine/install/managed-block.ts (managedHead)","min-push-floor-is-ship-allow-list","docs/plans/202611/915-min-push-ignores-plan.md","package.json (bkit:gate:min)",".bkit/core/engine/audits/templates/templates.test.ts",".bkit/core/engine/audits/templates/template-no-userpath.test.ts"],"summary":"bkit ci min-push accepts a docs/templates/bkit-audit-*.md change when its text through the single <!-- bkit:end --> line is byte-identical at the base and the pushed commit; one classifier, minPushOutside in ci.ts, serves --ref, --update, the receipt path and the landing routine","description":"minPushOutside(root, from, to, paths) wraps changedOutside and drops from outside each top-level docs/templates/bkit-audit-*.md whose blob exists at both commits and whose managedHead (install/managed-block.ts: the text from the first byte through the end of the bkit:end line, null unless the file has exactly one line-anchored bkit:start and one bkit:end in that order) is non-null and equal at both. A new, deleted or renamed template, an unreadable blob, an extra marker line, or any change at or above bkit:end leaves the file outside, so the decision fails closed to the full gate. Blobs are read with gitRaw (untrimmed). hasVerifiedIncrement in push-gate.ts takes the classifier as a callback instead of a pathspec list, so the receipt path agrees with the whole-range path without push-gate.ts importing ci.ts. checkLanding in land.ts uses the same classifier. Each accepted template is logged by name. Other templates (bkit-plan.md, which plan-check reads) keep blocking. In the bkit repo, bkit's own bkit:gate:min also runs templates.test.ts and template-no-userpath.test.ts, the two unit tests that read the installed audit templates below bkit:end (pending the owner's answer on #915).","alternatives":"Parse git diff -U0 hunk ranges against the marker's line number: breaks on hunks that straddle the marker and on marker lines added below. Exempt the whole audit template: lets a change to the bkit-managed block skip the full gate. Put the exception into changedOutside: widens ship's bookkeeping check and only-bookkeeping, which the owner did not ask for. Have push-gate.ts import the classifier from ci.ts: an import cycle, since ci.ts imports push-gate.ts. Narrow the two bkit-repo tests to the managed block: drops the leaked-home-path check on the project section, which is the failure that test exists to catch.","rationale":"Every audit run edits the consumer-owned Project Instructions section below bkit:end, which bkit install never overwrites. Four readers read that section: the advisory detectManagedDuplicate, which never changes bkit check's exit code and runs on every push anyway; the minimum gate's own prettier, Vale and slop steps, which run on the min push itself; and, in the bkit repo only, templates.test.ts (asserts the text after bkit:end starts with ## Project Instructions) and template-no-userpath.test.ts (fails on an absolute home path anywhere in an installed audit template). bkit's own bkit:gate:min ran neither test, so a [skip ci] push to dev could leave either one red with nothing run; adding both to bkit's own bkit:gate:min applies the existing guidance that a test reading a min-push file goes into bkit:gate:min. The seeded consumer bkit:gate:min does not change."}
 {"schema":3,"ts":1794365411132,"firstTs":1794363410348,"updates":3,"kind":"decision","key":"915-min-push-audit-template-project-section","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-close-workflow"},"references":["915","https://github.com/cbartens/bkit/issues/915",".bkit/core/engine/commands/ci/ci.ts (minPushOutside)",".bkit/core/engine/commands/ci/push-gate.ts (hasVerifiedIncrement)",".bkit/core/engine/commands/land.ts (checkLanding)",".bkit/core/engine/install/managed-block.ts (managedHead)","min-push-floor-is-ship-allow-list","docs/plans/202611/915-min-push-ignores-plan.md","package.json (bkit:gate:min)",".bkit/core/engine/audits/templates/templates.test.ts",".bkit/core/engine/audits/templates/template-no-userpath.test.ts"],"summary":"bkit ci min-push accepts a docs/templates/bkit-audit-*.md change when its text through the single <!-- bkit:end --> line is byte-identical at the base and the pushed commit; one classifier, minPushOutside in ci.ts, serves --ref, --update, the receipt path and the landing routine","alternatives":"Parse git diff -U0 hunk ranges against the marker's line number: breaks on hunks that straddle the marker and on marker lines added below. Exempt the whole audit template: lets a change to the bkit-managed block skip the full gate. Put the exception into changedOutside: widens ship's bookkeeping check and only-bookkeeping, which the owner did not ask for. Have push-gate.ts import the classifier from ci.ts: an import cycle, since ci.ts imports push-gate.ts. Narrow the two bkit-repo tests to the managed block: drops the leaked-home-path check on the project section, which is the failure that test exists to catch.","description":"minPushOutside(root, from, to, paths) wraps changedOutside and drops from outside each top-level docs/templates/bkit-audit-*.md whose blob exists at both commits and whose managedHead (install/managed-block.ts: the text from the first byte through the end of the bkit:end line, null unless the file has exactly one line-anchored bkit:start and one bkit:end in that order) is non-null and equal at both. A new, deleted or renamed template, an unreadable blob, an extra marker line, or any change at or above bkit:end leaves the file outside, so the decision fails closed to the full gate. Blobs are read with gitRaw (untrimmed). hasVerifiedIncrement in push-gate.ts takes the classifier as a callback instead of a pathspec list, so the receipt path agrees with the whole-range path without push-gate.ts importing ci.ts. checkLanding in land.ts uses the same classifier. Each accepted template is logged by name. Other templates (bkit-plan.md, which plan-check reads) keep blocking. In the bkit repo, bkit's own bkit:gate:min also runs templates.test.ts and template-no-userpath.test.ts, the two unit tests that read the installed audit templates below bkit:end.","rationale":"answered by owner: A) Add both to gate:min (Recommended) — proceed with the audit-template project-section exception, and add templates.test.ts and template-no-userpath.test.ts to bkit's own bkit:gate:min in package.json beside ledger-integrity.test.ts, so the two bkit-repo tests that read below bkit:end run on every min push. The seeded consumer bkit:gate:min does not change."}
+{"schema":3,"ts":1794437893959,"firstTs":1794437893959,"updates":1,"kind":"decision","key":"922-pre-push-gate-env-unsets-bkit-env-keys","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["922",".bkit/templates/.husky/pre-push",".husky/pre-push","docs/security.md"],"summary":"The pre-push inner run loads the repo .envrc through direnv exec, then unsets every key named in .bkit/.env, so BKIT_GH_TOKEN and the other tooling secrets never reach the gate.","alternatives":"Accept the full .envrc reaching the gate (documented risk); load a dedicated gate env file.","description":"The hook reads the key names from .bkit/.env and runs the gate as direnv exec . env -u KEY ... sh. App env files and other .envrc variables still load.","rationale":"Owner chose fix now at the build challenge: docs/security.md says tooling secrets are for tooling and each job gets the narrowest token; gate output lands in the agent-readable tmp/pre-push.log."}
