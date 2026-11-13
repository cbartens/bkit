diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index 4548d7666..573564acc 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -290,7 +290,7 @@ A `context` job resolves the phase and argument once. Then three runner jobs fol
 
 `pre-commit` runs `bkit:gate:format`. `pre-push` runs `bkit check` first, so a drifted install fails in seconds. Then it runs `bkit:gate:static-unit-integration` when package.json declares it, else `bkit:gate:static-unit` (`bkit:gate:static` on revert branches / commits; `bkit:gate:min` on a min push). It also runs the CI-suppressing-token guards, the dependency audit (§ Dependency audit) and the `tmp/` prune (§ tmp/ prune). Each hook ends by starting the disk prune (§ Disk prune).
 
-Pre-push re-runs itself once with all its output copied to `tmp/pre-push.log`, which is rewritten on each push. It prints that path first and last, with the exit code. `--no-verify` and a checkout without husky (a linked worktree) write no log. When the repo has an `.envrc`, `direnv` is on `PATH` and `CI` is unset, the inner run goes through `direnv exec .`, so the gate loads `.envrc` itself, minus the keys `.bkit/.env` holds (`BKIT_GH_TOKEN` and the other tooling secrets are unset for the gate). An untrusted `.envrc` blocks in seconds with the `direnv allow .` fix, before `bkit check`. A repo whose hook copy lacks this gets the `pre-push-direnv` tip.
+Pre-push re-runs itself once with all its output copied to `tmp/pre-push.log`, which is rewritten on each push. It prints that path first and last, with the exit code. `--no-verify` and a checkout without husky (a linked worktree) write no log. When the repo has an `.envrc`, `direnv` is on `PATH` and `CI` is unset, the inner run goes through `direnv exec .`, so the gate loads `.envrc` itself. On every path, with or without direnv, the gate unsets the bkit tooling keys (`BKIT_GH_TOKEN`, `BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY`, `BKIT_ANTHROPIC_API_KEY`, `BKIT_CURSOR_API_KEY`, `BKIT_OPENCODE_API_KEY`, `BKIT_OPENROUTER_API_KEY`, `BKIT_OLLAMA_API_KEY`, `BKIT_OPENAI_API_KEY`) however they were loaded, plus every key `.bkit/.env` names. An untrusted `.envrc` blocks in seconds with the `direnv allow .` fix, before `bkit check`. A repo whose hook copy lacks this gets the `pre-push-direnv` tip.
 
 Workflows care because they commit and push without `--no-verify`, so a failing hook stops a workflow. The throwaway `.worktrees/_land-{FID}` checkout runs its selected gate explicitly before pushing, with hooks disabled (§ One landing routine in `.bkit/workflows.md`). Reference: https://typicode.github.io/husky/.
 
diff --git a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
index b1c92a60e..6e701d8dc 100644
--- a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
@@ -1294,9 +1294,15 @@ describe(".husky/pre-push direnv", () => {
   const runHook = (
     hook: string,
     stdin: string,
-    opts: { envrc?: boolean; untrusted?: boolean; ci?: boolean; noDirenv?: boolean } = {},
+    opts: {
+      envrc?: boolean;
+      untrusted?: boolean;
+      ci?: boolean;
+      noDirenv?: boolean;
+      extraEnv?: Record<string, string>;
+    } = {},
   ) => {
-    const { envrc = true, untrusted = false, ci = false, noDirenv = false } = opts;
+    const { envrc = true, untrusted = false, ci = false, noDirenv = false, extraEnv = {} } = opts;
     if (envrc) fs.writeFileSync(path.join(tmp, ".envrc"), "export GATE_VAR=from-envrc\n");
     if (untrusted) fs.writeFileSync(path.join(tmp, "untrusted"), "");
     const env = { ...process.env };
@@ -1316,7 +1322,7 @@ describe(".husky/pre-push direnv", () => {
       input: stdin,
       encoding: "utf-8",
       timeout: 20_000,
-      env: { ...env, PATH: pathVar },
+      env: { ...env, ...extraEnv, PATH: pathVar },
     });
     return {
       status: result.status,
@@ -1452,4 +1458,85 @@ describe(".husky/pre-push direnv", () => {
       expect(r.stderr, hook).not.toContain("dummy-write-pat");
     }
   });
+
+  it("trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate", () => {
+    for (const hook of HOOKS) {
+      fs.rmSync(path.join(tmp, "calls.log"), { force: true });
+      fs.mkdirSync(path.join(tmp, ".bkit"), { recursive: true });
+      fs.writeFileSync(
+        path.join(tmp, ".bkit", ".env"),
+        "BKIT_GH_TOKEN = dummy-write-pat\nBKIT_OTHER_KEY: dummy-other\nexport BKIT_THIRD_KEY=dummy-third\n",
+      );
+      // direnv's dotenv grammar exports spaced, colon and `export` lines; the stub does the same.
+      fs.writeFileSync(
+        path.join(tmp, "bin", "direnv"),
+        `#!/bin/sh\necho "$*" >> "${tmp}/direnv.log"\nshift 2\nBKIT_GH_TOKEN=dummy-write-pat BKIT_OTHER_KEY=dummy-other BKIT_THIRD_KEY=dummy-third GATE_VAR=from-envrc exec "$@"\n`,
+        { mode: 0o755 },
+      );
+      fs.writeFileSync(
+        path.join(tmp, "bin", "pnpm"),
+        `#!/bin/sh\ncase "$*" in *skip-token*|*"ci min-push"*) exit 1 ;; esac\necho "pnpm: $* GATE_VAR=\${GATE_VAR:-unset} BKIT_GH_TOKEN=\${BKIT_GH_TOKEN:-unset} BKIT_OTHER_KEY=\${BKIT_OTHER_KEY:-unset} BKIT_THIRD_KEY=\${BKIT_THIRD_KEY:-unset}" >> "${tmp}/calls.log"\nexit 0\n`,
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
+        expect(g, hook).toContain("BKIT_THIRD_KEY=unset");
+      }
+      expect(r.stderr, hook).not.toContain("dummy-write-pat");
+    }
+  });
+
+  it("no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it", () => {
+    for (const hook of HOOKS) {
+      fs.rmSync(path.join(tmp, "calls.log"), { force: true });
+      fs.rmSync(path.join(tmp, "bin-pnpm"), { recursive: true, force: true });
+      fs.rmSync(path.join(tmp, "nodirenv"), { recursive: true, force: true });
+      fs.writeFileSync(
+        path.join(tmp, "bin", "pnpm"),
+        `#!/bin/sh\ncase "$*" in *skip-token*|*"ci min-push"*) exit 1 ;; esac\necho "pnpm: $* BKIT_GH_TOKEN=\${BKIT_GH_TOKEN:-unset}" >> "${tmp}/calls.log"\nexit 0\n`,
+        { mode: 0o755 },
+      );
+      const r = runHook(hook, UPDATE, {
+        envrc: false,
+        noDirenv: true,
+        extraEnv: { BKIT_GH_TOKEN: "dummy-write-pat" },
+      });
+      expect(r.status, hook).toBe(0);
+      expect(fs.existsSync(path.join(tmp, ".bkit", ".env")), hook).toBe(false);
+      const gate = r.calls.filter((c) => c.includes("push-gate"));
+      expect(gate.length, hook).toBeGreaterThan(0);
+      for (const g of gate) expect(g, hook).toContain("BKIT_GH_TOKEN=unset");
+      expect(r.stderr, hook).not.toContain("dummy-write-pat");
+    }
+  });
+});
+
+describe("the gate's vitest run", () => {
+  it("the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED", () => {
+    const env = { ...process.env, BKIT_PRE_PUSH_LOGGED: "1" };
+    delete env.CI;
+    delete env.GITHUB_ACTIONS;
+    const result = spawnSync(
+      "pnpm",
+      [
+        "exec",
+        "vitest",
+        "run",
+        "-c",
+        "vitest.unit.config.ts",
+        ".bkit/core/engine/checks/tips/catalogue.test.ts",
+        "-t",
+        "inside the pre-push hook",
+      ],
+      { cwd: process.cwd(), encoding: "utf-8", timeout: 120_000, env },
+    );
+    expect(`${result.stdout}\n${result.stderr}`, "vitest output").toContain("1 passed");
+    expect(result.status).toBe(0);
+  }, 150_000);
 });
diff --git a/.bkit/core/engine/checks/tips/catalogue.ts b/.bkit/core/engine/checks/tips/catalogue.ts
index d509550ee..7bb343554 100644
--- a/.bkit/core/engine/checks/tips/catalogue.ts
+++ b/.bkit/core/engine/checks/tips/catalogue.ts
@@ -473,7 +473,7 @@ export const SETUP_TIPS: readonly SetupTip[] = [
     workflows: ["plan", "ship"],
     title: "Load .envrc when the pre-push hook runs",
     line: "Your pre-push hook runs the gate without your .envrc variables when the shell that pushed never loaded them.",
-    why: "The newer hook runs its logged inner run through `direnv exec .`, so the gate always sees the repo's variables, and an untrusted .envrc stops the push in seconds with the fix instead of failing deep in the gate. The `.bkit/.env` unset loop right after that block keeps the tooling keys (BKIT_GH_TOKEN, ...) out of the gate and its log.",
+    why: "The newer hook runs its logged inner run through `direnv exec .`, so the gate always sees the repo's variables, and an untrusted .envrc stops the push in seconds with the fix instead of failing deep in the gate. The unset loops right after that block keep the fixed list of bkit tooling keys (BKIT_GH_TOKEN, ...), and every key `.bkit/.env` names, out of the gate and its log, however they were loaded.",
     ask: "Replace the log block of .husky/pre-push (the `BKIT_PRE_PUSH_LOGGED` block) and the `.bkit/.env` unset block that follows it with the ones in .bkit/templates/.husky/pre-push.",
     steps: "`.bkit/templates.md` § Git hooks.",
     fires: (cwd) => {
diff --git a/.bkit/templates.md b/.bkit/templates.md
index 22b1cd096..3b7dbb836 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -290,7 +290,7 @@ A `context` job resolves the phase and argument once. Then three runner jobs fol
 
 `pre-commit` runs `bkit:gate:format`. `pre-push` runs `bkit check` first, so a drifted install fails in seconds. Then it runs `bkit:gate:static-unit-integration` when package.json declares it, else `bkit:gate:static-unit` (`bkit:gate:static` on revert branches / commits; `bkit:gate:min` on a min push). It also runs the CI-suppressing-token guards, the dependency audit (§ Dependency audit) and the `tmp/` prune (§ tmp/ prune). Each hook ends by starting the disk prune (§ Disk prune).
 
-Pre-push re-runs itself once with all its output copied to `tmp/pre-push.log`, which is rewritten on each push. It prints that path first and last, with the exit code. `--no-verify` and a checkout without husky (a linked worktree) write no log. When the repo has an `.envrc`, `direnv` is on `PATH` and `CI` is unset, the inner run goes through `direnv exec .`, so the gate loads `.envrc` itself, minus the keys `.bkit/.env` holds (`BKIT_GH_TOKEN` and the other tooling secrets are unset for the gate). An untrusted `.envrc` blocks in seconds with the `direnv allow .` fix, before `bkit check`. A repo whose hook copy lacks this gets the `pre-push-direnv` tip.
+Pre-push re-runs itself once with all its output copied to `tmp/pre-push.log`, which is rewritten on each push. It prints that path first and last, with the exit code. `--no-verify` and a checkout without husky (a linked worktree) write no log. When the repo has an `.envrc`, `direnv` is on `PATH` and `CI` is unset, the inner run goes through `direnv exec .`, so the gate loads `.envrc` itself. On every path, with or without direnv, the gate unsets the bkit tooling keys (`BKIT_GH_TOKEN`, `BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY`, `BKIT_ANTHROPIC_API_KEY`, `BKIT_CURSOR_API_KEY`, `BKIT_OPENCODE_API_KEY`, `BKIT_OPENROUTER_API_KEY`, `BKIT_OLLAMA_API_KEY`, `BKIT_OPENAI_API_KEY`) however they were loaded, plus every key `.bkit/.env` names. An untrusted `.envrc` blocks in seconds with the `direnv allow .` fix, before `bkit check`. A repo whose hook copy lacks this gets the `pre-push-direnv` tip.
 
 Workflows care because they commit and push without `--no-verify`, so a failing hook stops a workflow. The throwaway `.worktrees/_land-{FID}` checkout runs its selected gate explicitly before pushing, with hooks disabled (§ One landing routine in `.bkit/workflows.md`). Reference: https://typicode.github.io/husky/.
 
diff --git a/.bkit/templates/.husky/pre-push b/.bkit/templates/.husky/pre-push
index b4521b26d..21135fb6e 100755
--- a/.bkit/templates/.husky/pre-push
+++ b/.bkit/templates/.husky/pre-push
@@ -53,10 +53,18 @@ if [ -z "${BKIT_PRE_PUSH_LOGGED:-}" ]; then
   exit "$pre_push_rc"
 fi
 
-# The tooling keys `.bkit/.env` holds (BKIT_GH_TOKEN, ...) are unset for the gate: its tests, lint
-# plugins and dependency code never need them, and their output lands in the agent-readable log.
+# The bkit tooling keys are unset for the gate: its tests, lint plugins and dependency code never
+# need them, and their output lands in the agent-readable log. Two sources: the fixed list
+# (docs/security.md § `.bkit/.env` scope), whichever path loaded them (cloud dashboard env, an app
+# env file, ~/.zshrc, launchd), and every key `.bkit/.env` names, in direnv's dotenv grammar
+# (`KEY=v`, `KEY = v`, `KEY: v`, optional `export `).
+for gate_key in BKIT_GH_TOKEN BKIT_LINEAR_API_KEY BKIT_JIRA_API_KEY BKIT_ANTHROPIC_API_KEY \
+  BKIT_CURSOR_API_KEY BKIT_OPENCODE_API_KEY BKIT_OPENROUTER_API_KEY BKIT_OLLAMA_API_KEY \
+  BKIT_OPENAI_API_KEY; do
+  unset "$gate_key"
+done
 if [ -f .bkit/.env ]; then
-  for gate_key in $(sed -n 's/^[[:space:]]*\(export[[:space:]][[:space:]]*\)\{0,1\}\([A-Za-z_][A-Za-z0-9_]*\)=.*/\2/p' .bkit/.env); do
+  for gate_key in $(sed -n 's/^[[:space:]]*\(export[[:space:]][[:space:]]*\)\{0,1\}\([A-Za-z_][A-Za-z0-9_]*\)[[:space:]]*[=:].*/\2/p' .bkit/.env); do
     unset "$gate_key"
   done
 fi
diff --git a/.bkit/version b/.bkit/version
index e56121bb2..3e49d1d1b 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -215,7 +215,7 @@
     ".cursor/agents/bkit-utility-update-roadmap.md": "55509636caed7293659d97f6939af8bb4e36a35bd4c82b9f79e7613f887ffccc",
     "docs/templates/bkit-audit-agents.md": "19cbbfd8479e5279bfb8ff1dae9beb5c6a790d68f95bb512318e38ce2da391f4",
     "docs/templates/bkit-audit-prompts.md": "74f1b59249dc4278506a0b6c9d21f8cef6fa8cb403ea8fbc558995357fc360da",
-    ".bkit/templates.md": "4ebd10101c5882d3cd502043697e24a95124ef9cff37be34346626716380cbda",
+    ".bkit/templates.md": "eca9ce35cd4966e6eedf480a32d56e53e91a4166c0d824ee2bb6e8f3a6db0000",
     "docs/templates/bkit-audit-adoption.md": "c4ddbc8e486e117fdac63395cd93c3b9d418e8d12e637fb2e5afdba9532fc42f",
     ".bkit/cloud.md": "4b3fbcae7dcfdf991aa78774f4c487d3aff343b90fc27bbdf3f4aa492320dd4c",
     ".bkit/comparison.md": "48845a4c08abe236dcb5af4947db755a10aad06996a87c5d5b1bed07528514de",
diff --git a/.husky/pre-push b/.husky/pre-push
index 91cd07af0..0f19d5c2f 100755
--- a/.husky/pre-push
+++ b/.husky/pre-push
@@ -53,10 +53,18 @@ if [ -z "${BKIT_PRE_PUSH_LOGGED:-}" ]; then
   exit "$pre_push_rc"
 fi
 
-# The tooling keys `.bkit/.env` holds (BKIT_GH_TOKEN, ...) are unset for the gate: its tests, lint
-# plugins and dependency code never need them, and their output lands in the agent-readable log.
+# The bkit tooling keys are unset for the gate: its tests, lint plugins and dependency code never
+# need them, and their output lands in the agent-readable log. Two sources: the fixed list
+# (docs/security.md § `.bkit/.env` scope), whichever path loaded them (cloud dashboard env, an app
+# env file, ~/.zshrc, launchd), and every key `.bkit/.env` names, in direnv's dotenv grammar
+# (`KEY=v`, `KEY = v`, `KEY: v`, optional `export `).
+for gate_key in BKIT_GH_TOKEN BKIT_LINEAR_API_KEY BKIT_JIRA_API_KEY BKIT_ANTHROPIC_API_KEY \
+  BKIT_CURSOR_API_KEY BKIT_OPENCODE_API_KEY BKIT_OPENROUTER_API_KEY BKIT_OLLAMA_API_KEY \
+  BKIT_OPENAI_API_KEY; do
+  unset "$gate_key"
+done
 if [ -f .bkit/.env ]; then
-  for gate_key in $(sed -n 's/^[[:space:]]*\(export[[:space:]][[:space:]]*\)\{0,1\}\([A-Za-z_][A-Za-z0-9_]*\)=.*/\2/p' .bkit/.env); do
+  for gate_key in $(sed -n 's/^[[:space:]]*\(export[[:space:]][[:space:]]*\)\{0,1\}\([A-Za-z_][A-Za-z0-9_]*\)[[:space:]]*[=:].*/\2/p' .bkit/.env); do
     unset "$gate_key"
   done
 fi
diff --git a/dist/checks/tips/catalogue.js b/dist/checks/tips/catalogue.js
index 99f040401..7c5df7f9f 100644
--- a/dist/checks/tips/catalogue.js
+++ b/dist/checks/tips/catalogue.js
@@ -394,7 +394,7 @@ export const SETUP_TIPS = [
         workflows: ["plan", "ship"],
         title: "Load .envrc when the pre-push hook runs",
         line: "Your pre-push hook runs the gate without your .envrc variables when the shell that pushed never loaded them.",
-        why: "The newer hook runs its logged inner run through `direnv exec .`, so the gate always sees the repo's variables, and an untrusted .envrc stops the push in seconds with the fix instead of failing deep in the gate. The `.bkit/.env` unset loop right after that block keeps the tooling keys (BKIT_GH_TOKEN, ...) out of the gate and its log.",
+        why: "The newer hook runs its logged inner run through `direnv exec .`, so the gate always sees the repo's variables, and an untrusted .envrc stops the push in seconds with the fix instead of failing deep in the gate. The unset loops right after that block keep the fixed list of bkit tooling keys (BKIT_GH_TOKEN, ...), and every key `.bkit/.env` names, out of the gate and its log, however they were loaded.",
         ask: "Replace the log block of .husky/pre-push (the `BKIT_PRE_PUSH_LOGGED` block) and the `.bkit/.env` unset block that follows it with the ones in .bkit/templates/.husky/pre-push.",
         steps: "`.bkit/templates.md` § Git hooks.",
         fires: (cwd) => {
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 25f5dfc94..c71eb07ef 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -284,3 +284,5 @@
 {"schema":3,"ts":1794384383935,"firstTs":1794384383935,"updates":1,"kind":"deferral","key":"922-pre-push-load-challenge-low-bkit-core-engine-checks-tips-catalogue-ts-475","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["922-pre-push-load"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A repo whose hook copy predates the log block entirely (no `BKIT_PRE_PUSH_LOGGED`) gets the `pre-push-direnv` tip asking it to \"replace the log block\", a block its hook does not have, so the agent following the ask has nothing to replace","description":"LOW build challenge finding at .bkit/core/engine/checks/tips/catalogue.ts:475: A repo whose hook copy predates the log block entirely (no `BKIT_PRE_PUSH_LOGGED`) gets the `pre-push-direnv` tip asking it to \"replace the log block\", a block its hook does not have, so the agent following the ask has nothing to replace. Done when: Either `fires` requires `BKIT_PRE_PUSH_LOGGED` in the hook, or the `ask` says to add the template's log block below `set -e` when the hook has none, or replace it when it has one; `dist/checks/tips/catalogue.js` rebuilt to match.","source":".bkit/core/engine/checks/tips/catalogue.ts:475"}
 {"schema":3,"ts":1794384383936,"firstTs":1794384383936,"updates":1,"kind":"deferral","key":"922-pre-push-load-challenge-low-bkit-core-engine-audits-templates-husky-pre-push-integration-test-ts-1282","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["922-pre-push-load"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"The `direnv not on PATH` test errors instead of testing when `PATH` holds a file entry or an unreadable directory, because `fs.readdirSync(d)` sits outside the `try` and `fs.existsSync` passes non-directories","description":"LOW build challenge finding at .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1282: The `direnv not on PATH` test errors instead of testing when `PATH` holds a file entry or an unreadable directory, because `fs.readdirSync(d)` sits outside the `try` and `fs.existsSync` passes non-directories. Done when: `pathWithoutDirenv` skips PATH entries that are not readable directories (`statSync(d).isDirectory()` guard, or `readdirSync` inside a `try`), so the test runs on any developer PATH.","source":".bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1282"}
 {"schema":3,"ts":1794384383937,"firstTs":1794384383937,"updates":1,"kind":"deferral","key":"922-pre-push-load-challenge-low-skills-lock-json-29","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["922-pre-push-load"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"The install-skills commit wipes the integrity hash of the universal `find-skills` skill (`computedHash: \"\"`), so a tampered `find-skills` body (a skill that tells agents to run `npx skills add`) no longer differs from the lock, and the lock fails `.agents/skills.md` § Install / Update step 2","description":"LOW build challenge finding at skills-lock.json:29: The install-skills commit wipes the integrity hash of the universal `find-skills` skill (`computedHash: \"\"`), so a tampered `find-skills` body (a skill that tells agents to run `npx skills add`) no longer differs from the lock, and the lock fails `.agents/skills.md` § Install / Update step 2. Done when: `skills-lock.json` `skills[\"find-skills\"].computedHash` is nonempty again: restored to the `main` value, or regenerated by the skills CLI for the unchanged `.agents/skills/find-skills` content. Every entry in the lock then has a nonempty `computedHash`.","source":"skills-lock.json:29"}
+{"schema":3,"ts":1794458052290,"firstTs":1794458052290,"updates":1,"kind":"deferral","key":"922-pre-push-load-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-651","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["922-pre-push-load"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"On a machine without direnv (most cloud agents) or with `CI` set, worktree setup still narrates that \"the pre-push hook will block the first push\" for a differing `.envrc`, although the hook skips direnv there and the push goes through, so an unattended agent following `.bkit/workflows.md` § Worktree Setup stops for a human it does not need","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/worktrees.ts:651: On a machine without direnv (most cloud agents) or with `CI` set, worktree setup still narrates that \"the pre-push hook will block the first push\" for a differing `.envrc`, although the hook skips direnv there and the push goes through, so an unattended agent following `.bkit/workflows.md` § Worktree Setup stops for a human it does not need. Done when: `allowDirenv` in `.bkit/core/engine/commands/workflow/worktrees.ts` (and the rebuilt `dist/commands/workflow/worktrees.js`) adds the \"push will block\" warning to the differing-`.envrc` narration only when direnv is on `PATH` and `CI` is unset, matching the hook's own condition; otherwise it narrates the differing file without the block claim. `.bkit/core/.bkit/workflows.md` § Worktree Setup says the same, and `bkit upgrade` re-renders `.bkit/workflows.md`.","source":".bkit/core/engine/commands/workflow/worktrees.ts:651"}
+{"schema":3,"ts":1794458052291,"firstTs":1794458052291,"updates":1,"kind":"deferral","key":"922-pre-push-load-challenge-low-bkit-core-engine-checks-after-github-ts-358","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["922-pre-push-load"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"On every push, `bkit check` runs after the hook has unset `BKIT_GH_TOKEN`, so `ghAsEngine` falls back to the shell's `GH_TOKEN` or the `gh` keyring and `buildGithubProjectTokenScopeAdvisory` probes the wrong token: a `GH_TOKEN` without the `project` scope prints \"Give `BKIT_GH_TOKEN` Projects read & write\" into `tmp/pre-push.log` although the PAT is fine, and an agent reading the log rotates a working token. Only the `gh-mcp` advisory got the `BKIT_PRE_PUSH_LOGGED` skip","description":"LOW build challenge finding at .bkit/core/engine/checks/after/github.ts:358: On every push, `bkit check` runs after the hook has unset `BKIT_GH_TOKEN`, so `ghAsEngine` falls back to the shell's `GH_TOKEN` or the `gh` keyring and `buildGithubProjectTokenScopeAdvisory` probes the wrong token: a `GH_TOKEN` without the `project` scope prints \"Give `BKIT_GH_TOKEN` Projects read & write\" into `tmp/pre-push.log` although the PAT is fine, and an agent reading the log rotates a working token. Only the `gh-mcp` advisory got the `BKIT_PRE_PUSH_LOGGED` skip. Done when: `buildGithubProjectTokenScopeAdvisory` returns `null` when `BKIT_PRE_PUSH_LOGGED` is set (beside its `isCloudOrCi()` short-circuit), the same as `detectGhMcpToken`'s call site in `runPostInstallCheck`, and `dist/checks/after/github.js` is rebuilt; no other `bkit check` advisory names `BKIT_GH_TOKEN` while that token is unset on purpose.","source":".bkit/core/engine/checks/after/github.ts:358"}
diff --git a/vitest.setup.ts b/vitest.setup.ts
index da4feabcf..6c89b3bde 100644
--- a/vitest.setup.ts
+++ b/vitest.setup.ts
@@ -108,6 +108,7 @@ for (const key of [
   "CURSOR_REMOTE_AGENT",
   "GITHUB_ACTIONS",
   "CI",
+  "BKIT_PRE_PUSH_LOGGED",
 ]) {
   delete process.env[key];
 }
