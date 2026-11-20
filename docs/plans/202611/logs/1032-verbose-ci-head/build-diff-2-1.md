diff --git a/.bkit/core/engine/audits/templates/ci-scripts.test.ts b/.bkit/core/engine/audits/templates/ci-scripts.test.ts
index d2c004141..d5a14c332 100644
--- a/.bkit/core/engine/audits/templates/ci-scripts.test.ts
+++ b/.bkit/core/engine/audits/templates/ci-scripts.test.ts
@@ -351,25 +351,33 @@ describe("template verbose marker step (manual run)", () => {
   }
 
   /** Run the step against a fixture repo whose head commit has `message`; return the GITHUB_ENV text. */
-  function runStep(script: string, message: string): { status: number | null; env: string } {
+  function runStep(
+    script: string,
+    message: string,
+    globalGitConfig?: string,
+  ): { status: number | null; env: string } {
     const dir = fs.mkdtempSync(path.join(os.tmpdir(), "verbose-marker-"));
     tmpDirs.push(dir);
     const repo = path.join(dir, "repo");
     fs.mkdirSync(repo);
-    const git = (...args: string[]) =>
-      spawnSync("git", args, {
+    const git = (...args: string[]) => {
+      const res = spawnSync("git", args, {
         cwd: repo,
         encoding: "utf-8",
         env: {
           ...process.env,
+          ...(globalGitConfig ? { GIT_CONFIG_GLOBAL: globalGitConfig, HOME: dir } : {}),
           GIT_AUTHOR_NAME: "t",
           GIT_AUTHOR_EMAIL: "t@example.com",
           GIT_COMMITTER_NAME: "t",
           GIT_COMMITTER_EMAIL: "t@example.com",
         },
       });
+      expect(res.status, `git ${args.join(" ")}: ${res.stderr}`).toBe(0);
+      return res;
+    };
     git("init", "-q");
-    git("commit", "-q", "--allow-empty", "-m", message);
+    git("-c", "commit.gpgsign=false", "commit", "-q", "--allow-empty", "-m", message);
     const sha = git("rev-parse", "HEAD").stdout.trim();
     const envFile = path.join(dir, "github_env");
     fs.writeFileSync(envFile, "");
@@ -381,13 +389,22 @@ describe("template verbose marker step (manual run)", () => {
     return { status: res.status, env: fs.readFileSync(envFile, "utf-8") };
   }
 
+  /** The `&& '<value>' ||` on-value of TURBO_LOG_LEVEL in a job's `env:` expression. */
+  function jobEnvTurboOnValue(job: string): string | undefined {
+    const doc = parseYamlText(fs.readFileSync(WORKFLOWS.template, "utf-8")) as {
+      jobs: Record<string, { env?: Record<string, string> }>;
+    };
+    const expr = String(doc.jobs[job]?.env?.TURBO_LOG_LEVEL ?? "");
+    return expr.match(/&&\s*'([^']*)'\s*\|\|/)?.[1];
+  }
+
   it("verbose marker step writes VERBOSE_CI, TURBO_LOG_LEVEL and DEBUG to GITHUB_ENV for a [verbose ci] head commit", () => {
     for (const job of JOBS) {
       const r = runStep(markerScript(job), "fix: something [verbose ci]\n\nbody");
       expect(r.status, job).toBe(0);
       const lines = r.env.split("\n").filter(Boolean);
       expect(lines, job).toContain("VERBOSE_CI=1");
-      expect(lines, job).toContain("TURBO_LOG_LEVEL=debug");
+      expect(lines, job).toContain("TURBO_LOG_LEVEL=full");
       expect(lines, job).toContain("DEBUG=vercel:*,supabase:*");
       expect(
         lines.some((l) => l.startsWith("NODE_OPTIONS")),
@@ -403,4 +420,26 @@ describe("template verbose marker step (manual run)", () => {
       expect(r.env, job).toBe("");
     }
   });
+
+  it("verbose marker step writes the TURBO_LOG_LEVEL value the job-level env sets on a marked push", () => {
+    for (const job of JOBS) {
+      const onValue = jobEnvTurboOnValue(job);
+      expect(onValue, `${job}: no on-value in job env TURBO_LOG_LEVEL`).toBeDefined();
+      const r = runStep(markerScript(job), "fix: something [verbose ci]");
+      expect(r.status, job).toBe(0);
+      expect(r.env.split("\n"), job).toContain(`TURBO_LOG_LEVEL=${onValue}`);
+    }
+  });
+
+  it("verbose marker step fixture commits under a global git config that signs commits", () => {
+    const cfgDir = fs.mkdtempSync(path.join(os.tmpdir(), "verbose-marker-cfg-"));
+    tmpDirs.push(cfgDir);
+    const cfg = path.join(cfgDir, "gitconfig");
+    fs.writeFileSync(cfg, "[commit]\n\tgpgsign = true\n[gpg]\n\tprogram = false\n");
+    for (const job of JOBS) {
+      const r = runStep(markerScript(job), "fix: something [verbose ci]", cfg);
+      expect(r.status, job).toBe(0);
+      expect(r.env.split("\n"), job).toContain("VERBOSE_CI=1");
+    }
+  });
 });
diff --git a/.bkit/core/engine/audits/templates/templates-content.test.ts b/.bkit/core/engine/audits/templates/templates-content.test.ts
index 7fb84948b..736f1d996 100644
--- a/.bkit/core/engine/audits/templates/templates-content.test.ts
+++ b/.bkit/core/engine/audits/templates/templates-content.test.ts
@@ -128,6 +128,20 @@ describe("consumer CI template (.bkit/templates/.github/workflows/bkit-ci.yml)",
       expect(offenders).toEqual([]);
     });
 
+    it("no template doc says markers are inert on a dispatch", () => {
+      const docsDir = path.resolve(".bkit/templates/docs");
+      const offenders = listFilesRecursive(docsDir)
+        .filter((f) => f.endsWith(".md"))
+        .flatMap((f) =>
+          fs
+            .readFileSync(f, "utf-8")
+            .split("\n")
+            .filter((l) => /markers? (are|is) inert on (a )?(`?workflow_)?dispatch/i.test(l))
+            .map((l) => `${path.relative(docsDir, f)}: ${l.slice(0, 80)}`),
+        );
+      expect(offenders).toEqual([]);
+    });
+
     it("every job declaring VERBOSE_CI also declares a marker-gated job-level NODE_OPTIONS", () => {
       // Derived, not hand-listed: the lane set comes from the VERBOSE_CI declarations
       // themselves, so a lane added later is covered without editing this test.
diff --git a/.bkit/templates/.github/workflows/bkit-ci.yml b/.bkit/templates/.github/workflows/bkit-ci.yml
index b80347b8a..38e6b2060 100644
--- a/.bkit/templates/.github/workflows/bkit-ci.yml
+++ b/.bkit/templates/.github/workflows/bkit-ci.yml
@@ -84,7 +84,7 @@ jobs:
             *"[verbose ci]"*)
               {
                 echo "VERBOSE_CI=1"
-                echo "TURBO_LOG_LEVEL=debug"
+                echo "TURBO_LOG_LEVEL=full"
                 echo "DEBUG=vercel:*,supabase:*"
               } >> "$GITHUB_ENV"
               ;;
@@ -354,7 +354,7 @@ jobs:
             *"[verbose ci]"*)
               {
                 echo "VERBOSE_CI=1"
-                echo "TURBO_LOG_LEVEL=debug"
+                echo "TURBO_LOG_LEVEL=full"
                 echo "DEBUG=vercel:*,supabase:*"
               } >> "$GITHUB_ENV"
               ;;
diff --git a/.bkit/templates/docs/deployments.md b/.bkit/templates/docs/deployments.md
index acc7acce0..548d96e61 100644
--- a/.bkit/templates/docs/deployments.md
+++ b/.bkit/templates/docs/deployments.md
@@ -210,7 +210,7 @@ cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}
 
 A newer run cancels the older one on every event except the default branch, which queues. That run promotes the deployment, so cancelling it mid-promote could strand production across two releases (§ Promote before the lanes). A pull request keys on its number, and a push or dispatch keys on the ref, so a PR and a `dev` push still overlap. A `workflow_run` observer sees the latest run on that ref only.
 
-A push diffs against the head of the last successful CI run on that branch, not `github.event.before`. Fall back to `github.event.before` only when there is no such run, or when that run's head is no longer an ancestor. A `workflow_dispatch` has no base commit, so short-circuit the affected step to fully affected. `HEAD~1` is only for the delta gates on a dispatch. Markers are inert on a dispatch, so steer it with inputs (`.bkit/workflows.md` § Commit-message force tags). The planner parses markers once, and every lane reads `plan.markers_present`. The only re-read of the commit or PR text is the workflow-level task-runner cache bust (for example, `TURBO_FORCE`). Validate the plan JSON with `has()` / `!= null`, because jq `//` treats `false` as absent and drops a real `run_live: false`.
+A push diffs against the head of the last successful CI run on that branch, not `github.event.before`. Fall back to `github.event.before` only when there is no such run, or when that run's head is no longer an ancestor. A `workflow_dispatch` has no base commit, so short-circuit the affected step to fully affected. `HEAD~1` is only for the delta gates on a dispatch. Markers act on a dispatch through the head commit, and inputs steer it without a new commit (`.bkit/workflows.md` § Commit-message force tags). The planner parses markers once, and every lane reads `plan.markers_present`. The only re-read of the commit or PR text is the workflow-level task-runner cache bust (for example, `TURBO_FORCE`). Validate the plan JSON with `has()` / `!= null`, because jq `//` treats `false` as absent and drops a real `run_live: false`.
 
 Migration-immutability and slop-delta run on every event against that same base. The starter's copies of those steps are still `pull_request`-only, and that `if:` is the shape from before the planner existed. Point them at the planner base once `bkit-tests-scope` exists. Pre-push on a `dev` push resolves the same base (`bkit-resolve-push-base.mjs --local`, `.bkit/templates.md` § Git hooks) and exports it as `SLOP_BASE_REF`. A repo-owned migration-immutability pre-push check reads that variable too.
 
diff --git a/.github/workflows/bkit-ci.yml b/.github/workflows/bkit-ci.yml
index 799b98456..8ca355221 100644
--- a/.github/workflows/bkit-ci.yml
+++ b/.github/workflows/bkit-ci.yml
@@ -374,7 +374,7 @@ jobs:
             *"[verbose ci]"*)
               {
                 echo "VERBOSE_CI=1"
-                echo "TURBO_LOG_LEVEL=debug"
+                echo "TURBO_LOG_LEVEL=full"
                 echo "DEBUG=vercel:*,supabase:*"
               } >> "$GITHUB_ENV"
               ;;
@@ -617,7 +617,7 @@ jobs:
             *"[verbose ci]"*)
               {
                 echo "VERBOSE_CI=1"
-                echo "TURBO_LOG_LEVEL=debug"
+                echo "TURBO_LOG_LEVEL=full"
                 echo "DEBUG=vercel:*,supabase:*"
               } >> "$GITHUB_ENV"
               ;;
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index f27157be1..13141d79b 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -584,3 +584,4 @@
 {"schema":3,"ts":1795105872015,"firstTs":1795096336121,"updates":2,"kind":"deferral","key":"985-install-settings-merge-challenge-low-bkit-core-engine-install-write-ts-513","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"utility","step":"manual"},"references":["985-install-settings-merge","8359be639","https://github.com/cbartens/bkit/issues/985"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"After a real `bkit install` has already removed a retired grant, the post-install checklist still says \"retired entries bkit removes\" and \"Run bkit upgrade to remove a retired entry\", which describes nothing left to do","description":"Closed by 8359be639: a real bkit install prints that it removed the entry and adds no upgrade advisory; only a dry run (bkit check) asks to run bkit upgrade.","source":".bkit/core/engine/install/write.ts:513","status":"CLOSED"}
 {"schema":3,"ts":1795105872016,"firstTs":1795096336122,"updates":2,"kind":"deferral","key":"985-install-settings-merge-challenge-low-bkit-core-engine-install-write-ts-516","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"utility","step":"manual"},"references":["985-install-settings-merge","8359be639","https://github.com/cbartens/bkit/issues/985"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"`bkit upgrade` and `bkit upgrade --dry-run` take back a permission entry while printing only `upgrade (merge): .claude/settings.json`, so the person gets no record of which grant or rule changed","description":"Closed by 8359be639: bkit upgrade prints one line per removed entry naming the file, the list and the exact value, and a dry run says it would remove it.","source":".bkit/core/engine/install/write.ts:516","status":"CLOSED"}
 {"schema":3,"ts":1795139335734,"firstTs":1795139335734,"updates":1,"kind":"deferral","key":"1032-verbose-ci-head-challenge-low-bkit-core-engine-audits-templates-ci-scripts-test-ts-372","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1032-verbose-ci-head"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"On a contributor machine with commit signing in `~/.gitconfig`, the fixture's empty commit fails unnoticed and both new marker-step tests go red as \"expected 128 to be 0\", which reads like a broken step","description":"LOW build challenge finding at .bkit/core/engine/audits/templates/ci-scripts.test.ts:372: On a contributor machine with commit signing in `~/.gitconfig`, the fixture's empty commit fails unnoticed and both new marker-step tests go red as \"expected 128 to be 0\", which reads like a broken step. Done when: The `git` helper in `runStep` passes `-c commit.gpgsign=false` (the pattern in `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts:38` and eleven other test files), and `runStep` checks the status of `git init`, `git commit` and `git rev-parse` and fails with git's stderr when one is non-zero. The helper spreads `process.env`, so `HOME` and the user's global config reach the fixture commit; `vitest.setup.ts` redirects `XDG_CONFIG_HOME` only. Reproduced under `[commit] gpgsign = true` with `[gpg] program = false`: `git commit` exits 128, `git rev-parse HEAD` prints `HEAD` on stdout, and the step then exits 128 on `git log`.","source":".bkit/core/engine/audits/templates/ci-scripts.test.ts:372","status":"OPEN"}
+{"schema":3,"ts":1795140158325,"firstTs":1795139335734,"updates":2,"kind":"deferral","key":"1032-verbose-ci-head-challenge-low-bkit-core-engine-audits-templates-ci-scripts-test-ts-372","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1032-verbose-ci-head"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"On a contributor machine with commit signing in `~/.gitconfig`, the fixture's empty commit fails unnoticed and both new marker-step tests go red as \"expected 128 to be 0\", which reads like a broken step","description":"LOW build challenge finding at .bkit/core/engine/audits/templates/ci-scripts.test.ts:372: On a contributor machine with commit signing in `~/.gitconfig`, the fixture's empty commit fails unnoticed and both new marker-step tests go red as \"expected 128 to be 0\", which reads like a broken step. Done when: The `git` helper in `runStep` passes `-c commit.gpgsign=false` (the pattern in `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts:38` and eleven other test files), and `runStep` checks the status of `git init`, `git commit` and `git rev-parse` and fails with git's stderr when one is non-zero. The helper spreads `process.env`, so `HOME` and the user's global config reach the fixture commit; `vitest.setup.ts` redirects `XDG_CONFIG_HOME` only. Reproduced under `[commit] gpgsign = true` with `[gpg] program = false`: `git commit` exits 128, `git rev-parse HEAD` prints `HEAD` on stdout, and the step then exits 128 on `git log`.","source":".bkit/core/engine/audits/templates/ci-scripts.test.ts:372","status":"CLOSED"}
