diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index 5d587709b..d334bcf4b 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -1250,8 +1250,8 @@ bkit's `bkit-ci.yml` recognises the tags below. They are case-sensitive and use
 
 - **Direct push to `dev` or the default branch** (no PR): put the tag in the commit message (`github.event.head_commit.message`).
 - **Feature branch with an open PR** (open, synchronize or edit): put the tag in the PR title (`github.event.pull_request.title`). The commit message is not read, because the workflow fires on `pull_request`, not `push`.
-- **Both surfaces** are checked by `contains()` in the env block, and a marker in either one wins for its event. Pick the right one: `[verbose ci]` in a feature-branch commit message has no effect, because only the PR title is read.
-- **`workflow_dispatch`**: neither field is filled, so every marker is inert. The planner sets `MSG=""` for events other than `push` and `pull_request`, and silently drops `[force full]`, `[force build]` and `[verbose ci]`. Steer a dispatch with inputs, never a marker. Inputs are mandatory when the dispatch default is expensive, for example when a dispatch forces the metered native build lanes past their reuse gate and spends build quota on every run. Gate the lookup behind an input that defaults to `false`.
+- **Both surfaces** are checked by `contains()` in the env block, and a marker in either one wins for its event. Pick the right one: `[verbose ci]` in a feature-branch commit message has no effect, because only the PR title is read. On a manual run the "Read Verbose Marker (Manual Run)" step reads the head commit for `[verbose ci]`.
+- **`workflow_dispatch`**: neither field is filled, so the template reads the head commit (`git log -1 --pretty=%B "$GITHUB_SHA"`) and every marker acts on a manual run, and keeps acting on every manual run until a new commit lands. `[verbose ci]` is read by the "Read Verbose Marker (Manual Run)" step of the static and unit jobs. `NODE_OPTIONS` stays off on a manual run, because `$GITHUB_ENV` cannot set it. Steer a dispatch with inputs when the marker would have to change on a commit that already exists. Inputs are mandatory when the dispatch default is expensive, for example when a dispatch forces the metered native build lanes past their reuse gate and spends build quota on every run. Gate the lookup behind an input that defaults to `false`.
 
 <!-- prettier-ignore -->
 | Tag | Effect | Scope |
@@ -1496,7 +1496,7 @@ Conventional Commits — `{type}({FID}): {summary}`.
 
 ### CI / Vercel commit tags
 
-Precedence: `bkit [force build]` wins. bkit's own `bkit-ci.yml` reads markers from the PR title on `pull_request` events and from the head commit on pushes; the consumer template reads the PR title on `pull_request`, else the head commit (`workflow_dispatch` included).
+Precedence: `bkit [force build]` wins. bkit's own `bkit-ci.yml` reads markers from the PR title on `pull_request` events and from the head commit on pushes, and its "Read Verbose Marker (Manual Run)" step also reads `[verbose ci]` from the head commit on a manual run; the consumer template reads the PR title on `pull_request`, else the head commit (`workflow_dispatch` included).
 
 <!-- prettier-ignore -->
 | Tag | Effect |
diff --git a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
index 11e7b26c4..cccff7a80 100644
--- a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
+++ b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
@@ -996,8 +996,16 @@ describe("this repo adopts its own templates", () => {
 
   const OWN_TESTS = new Set([...GRAPHIFY_BRANDED, ...BRANDED_WORKFLOWS]);
   it.each(entriesWith("adopted").filter(([rel]) => !OWN_TESTS.has(rel)))("%s", (rel, entry) => {
-    const { copy } = expectCopyMatchesTemplate(rel, entry);
+    const { template, copy } = expectCopyMatchesTemplate(rel, entry);
     expect(copy.length).toBeGreaterThan(0);
+    // The static and unit jobs of bkit-ci.yml each carry the manual-run verbose marker step, in the template and the copy.
+    const step = "- name: Read Verbose Marker (Manual Run)";
+    const expected: Record<string, number> = {
+      ...Object.fromEntries(entriesWith("adopted").map(([r]) => [r, 0])),
+      ".github/workflows/bkit-ci.yml": 2,
+    };
+    expect(template.split(step).length - 1).toBe(expected[rel]);
+    expect(copy.split(step).length - 1).toBe(expected[rel]);
   });
 
   it("scripts/graphify/bkit-graphify.sh", () => {
diff --git a/.bkit/core/engine/audits/templates/ci-scripts.test.ts b/.bkit/core/engine/audits/templates/ci-scripts.test.ts
index dc7a19530..d2c004141 100644
--- a/.bkit/core/engine/audits/templates/ci-scripts.test.ts
+++ b/.bkit/core/engine/audits/templates/ci-scripts.test.ts
@@ -335,3 +335,72 @@ describe("bkit-check-capstone", () => {
     });
   });
 });
+
+describe("template verbose marker step (manual run)", () => {
+  const STEP_NAME = "Read Verbose Marker (Manual Run)";
+  const JOBS = ["bkit-tests-static", "bkit-tests-unit"];
+
+  /** The `run:` script of the manual-run marker step in one job of the template. */
+  function markerScript(job: string): string {
+    const doc = parseYamlText(fs.readFileSync(WORKFLOWS.template, "utf-8")) as {
+      jobs: Record<string, { steps: Step[] }>;
+    };
+    const step = doc.jobs[job]?.steps.find((s) => s.name === STEP_NAME);
+    expect(step, `${job}: no "${STEP_NAME}" step`).toBeDefined();
+    return step!.run!;
+  }
+
+  /** Run the step against a fixture repo whose head commit has `message`; return the GITHUB_ENV text. */
+  function runStep(script: string, message: string): { status: number | null; env: string } {
+    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "verbose-marker-"));
+    tmpDirs.push(dir);
+    const repo = path.join(dir, "repo");
+    fs.mkdirSync(repo);
+    const git = (...args: string[]) =>
+      spawnSync("git", args, {
+        cwd: repo,
+        encoding: "utf-8",
+        env: {
+          ...process.env,
+          GIT_AUTHOR_NAME: "t",
+          GIT_AUTHOR_EMAIL: "t@example.com",
+          GIT_COMMITTER_NAME: "t",
+          GIT_COMMITTER_EMAIL: "t@example.com",
+        },
+      });
+    git("init", "-q");
+    git("commit", "-q", "--allow-empty", "-m", message);
+    const sha = git("rev-parse", "HEAD").stdout.trim();
+    const envFile = path.join(dir, "github_env");
+    fs.writeFileSync(envFile, "");
+    const res = spawnSync("bash", ["-e", "-c", script], {
+      cwd: repo,
+      env: { PATH: process.env.PATH ?? "", GITHUB_SHA: sha, GITHUB_ENV: envFile },
+      encoding: "utf-8",
+    });
+    return { status: res.status, env: fs.readFileSync(envFile, "utf-8") };
+  }
+
+  it("verbose marker step writes VERBOSE_CI, TURBO_LOG_LEVEL and DEBUG to GITHUB_ENV for a [verbose ci] head commit", () => {
+    for (const job of JOBS) {
+      const r = runStep(markerScript(job), "fix: something [verbose ci]\n\nbody");
+      expect(r.status, job).toBe(0);
+      const lines = r.env.split("\n").filter(Boolean);
+      expect(lines, job).toContain("VERBOSE_CI=1");
+      expect(lines, job).toContain("TURBO_LOG_LEVEL=debug");
+      expect(lines, job).toContain("DEBUG=vercel:*,supabase:*");
+      expect(
+        lines.some((l) => l.startsWith("NODE_OPTIONS")),
+        job,
+      ).toBe(false);
+    }
+  });
+
+  it("verbose marker step writes nothing to GITHUB_ENV for a head commit without the marker", () => {
+    for (const job of JOBS) {
+      const r = runStep(markerScript(job), "fix: something verbose ci without brackets");
+      expect(r.status, job).toBe(0);
+      expect(r.env, job).toBe("");
+    }
+  });
+});
diff --git a/.bkit/core/engine/audits/templates/template-ci-yml.test.ts b/.bkit/core/engine/audits/templates/template-ci-yml.test.ts
index dd5e16898..666c40313 100644
--- a/.bkit/core/engine/audits/templates/template-ci-yml.test.ts
+++ b/.bkit/core/engine/audits/templates/template-ci-yml.test.ts
@@ -81,6 +81,28 @@ describe("template bkit-ci.yml, filled in", () => {
     const file = filledTemplate();
     const r = spawnSync("actionlint", ["-no-color", file], { encoding: "utf-8" });
     expect(r.status, `${r.stdout}${r.stderr}`).toBe(0);
+    // The manual-run marker step is part of what actionlint just checked.
+    expect(fs.readFileSync(file, "utf-8")).toContain("Read Verbose Marker (Manual Run)");
+  });
+
+  it("static and unit jobs each run a manual-run verbose marker step before Configure Verbose CI", () => {
+    const doc = parseYaml(filledTemplate());
+    const jobs = doc.jobs as Record<
+      string,
+      { steps?: { name?: string; if?: string; run?: string }[] }
+    >;
+    for (const id of ["bkit-tests-static", "bkit-tests-unit"]) {
+      const steps = jobs[id]!.steps!;
+      const marker = steps.findIndex((s) => s.name === "Read Verbose Marker (Manual Run)");
+      const configure = steps.findIndex((s) => s.name === "Configure Verbose CI");
+      expect(marker, `${id}: no manual-run verbose marker step`).toBeGreaterThanOrEqual(0);
+      expect(configure, `${id}: no Configure Verbose CI step`).toBeGreaterThanOrEqual(0);
+      expect(marker, `${id}: marker step must come before Configure Verbose CI`).toBeLessThan(
+        configure,
+      );
+      expect(steps[marker]!.if).toBe("github.event_name == 'workflow_dispatch'");
+      expect(steps[marker]!.run).toContain("git log -1 --pretty=%B");
+    }
   });
 });
 
diff --git a/.bkit/core/engine/audits/templates/templates-content.test.ts b/.bkit/core/engine/audits/templates/templates-content.test.ts
index 835fc8991..7fb84948b 100644
--- a/.bkit/core/engine/audits/templates/templates-content.test.ts
+++ b/.bkit/core/engine/audits/templates/templates-content.test.ts
@@ -107,6 +107,25 @@ describe("consumer CI template (.bkit/templates/.github/workflows/bkit-ci.yml)",
     it("never writes NODE_OPTIONS to $GITHUB_ENV", () => {
       const offenders = content.split("\n").filter(writesNodeOptionsToGithubEnv);
       expect(offenders).toEqual([]);
+      // The manual-run marker step is a $GITHUB_ENV writer too: it must exist and never name NODE_OPTIONS.
+      const doc = parseYamlText(content) as {
+        jobs: Record<string, { steps?: { name?: string; run?: string }[] }>;
+      };
+      for (const id of ["bkit-tests-static", "bkit-tests-unit"]) {
+        const step = doc.jobs[id]!.steps!.find(
+          (s) => s.name === "Read Verbose Marker (Manual Run)",
+        );
+        expect(step, `${id}: no manual-run verbose marker step`).toBeDefined();
+        expect(step!.run).toContain("GITHUB_ENV");
+        expect(step!.run).not.toContain("NODE_OPTIONS");
+      }
+    });
+
+    it("no template comment says a marker is inert on workflow_dispatch", () => {
+      const offenders = content
+        .split("\n")
+        .filter((l) => /^\s*#.*inert on `?workflow_dispatch/i.test(l));
+      expect(offenders).toEqual([]);
     });
 
     it("every job declaring VERBOSE_CI also declares a marker-gated job-level NODE_OPTIONS", () => {
diff --git a/.bkit/templates/.github/workflows/bkit-ci.yml b/.bkit/templates/.github/workflows/bkit-ci.yml
index fa147c089..b80347b8a 100644
--- a/.bkit/templates/.github/workflows/bkit-ci.yml
+++ b/.bkit/templates/.github/workflows/bkit-ci.yml
@@ -72,6 +72,24 @@ jobs:
       # Do NOT add `with: version:` here — pnpm/action-setup errors when both are set.
       - uses: pnpm/action-setup@73e46992e05b19abd31f2f3c20e0e7370d762115 # v6.1.1
 
+      # Manual run: a workflow_dispatch event fills neither head_commit nor pull_request, so the
+      # job-level env cannot see the marker. Read the head commit here and turn verbose on. The
+      # message is compared to the fixed marker only, never expanded as code. NODE_OPTIONS is
+      # not written; the runner rejects that write while reporting success.
+      - name: Read Verbose Marker (Manual Run)
+        if: github.event_name == 'workflow_dispatch'
+        run: |
+          msg="$(git log -1 --pretty=%B "$GITHUB_SHA")"
+          case "$msg" in
+            *"[verbose ci]"*)
+              {
+                echo "VERBOSE_CI=1"
+                echo "TURBO_LOG_LEVEL=debug"
+                echo "DEBUG=vercel:*,supabase:*"
+              } >> "$GITHUB_ENV"
+              ;;
+          esac
+
       # Under [verbose ci]: propagate DEBUG to all subsequent steps via $GITHUB_ENV. Note
       # that steps with their own `env:` block override $GITHUB_ENV — those steps must
       # inline it in their env: declaration to stay verbose-aware. NODE_OPTIONS is NOT
@@ -324,6 +342,24 @@ jobs:
 
       - uses: pnpm/action-setup@73e46992e05b19abd31f2f3c20e0e7370d762115 # v6.1.1
 
+      # Manual run: a workflow_dispatch event fills neither head_commit nor pull_request, so the
+      # job-level env cannot see the marker. Read the head commit here and turn verbose on. The
+      # message is compared to the fixed marker only, never expanded as code. NODE_OPTIONS is
+      # not written; the runner rejects that write while reporting success.
+      - name: Read Verbose Marker (Manual Run)
+        if: github.event_name == 'workflow_dispatch'
+        run: |
+          msg="$(git log -1 --pretty=%B "$GITHUB_SHA")"
+          case "$msg" in
+            *"[verbose ci]"*)
+              {
+                echo "VERBOSE_CI=1"
+                echo "TURBO_LOG_LEVEL=debug"
+                echo "DEBUG=vercel:*,supabase:*"
+              } >> "$GITHUB_ENV"
+              ;;
+          esac
+
       # NODE_OPTIONS is a job-level `env:` key above, never a $GITHUB_ENV write — the runner
       # rejects that write and still reports success. See bkit-tests-static's block comment.
       - name: Configure Verbose CI
@@ -923,7 +959,7 @@ jobs:
 # canaries: a change that affects the device app, a native dependency change, or a platform marker
 # runs the build and the device flows, and a red lane reds bkit-tests-check. @live stays push-only.
 # e.g. EAS for the build, Maestro for the flows. A dispatch input (default false) is how a human
-# forces a fresh native build; a marker cannot, because markers are inert on workflow_dispatch.
+# forces a fresh native build; the head-commit markers also act on a dispatch.
 # bkit-stub:bkit-tests-build-ios — needs:[bkit-tests-scope]; if: plan.run_native_ios
 # bkit-stub:bkit-tests-build-android — needs:[bkit-tests-scope]; if: plan.run_native_android
 # bkit-stub:bkit-tests-e2e-ios — needs: [bkit-tests-scope, bkit-tests-migration, bkit-tests-reset, bkit-tests-build-ios, bkit-tests-build-web].
diff --git a/.bkit/version b/.bkit/version
index 18b9ecccc..7775e2984 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -211,7 +211,7 @@
     ".bkit/providers.md": "cd84350a719e69837d96a698fe5597f98c79785d3e4079cb1867fbcf4901430e",
     ".bkit/prompts.md": "194175488cbeed73d3d8a92bc6d2b50efa6ad2c8cda691213056fdbbdcecf4ab",
     ".bkit/trackers.md": "489175623dcfeb76714039dd334024797f1a3a22fd57be1ea2ca7c06f32f9623",
-    ".bkit/workflows.md": "8b0068dbca3a997ca8d03fd3ee2f35d9bcf5e244f10534cca0ecfcfb1b9a0809",
+    ".bkit/workflows.md": "b99a9e352ea2d97c76c8bbab0c10e9595d9cc4b9da631a9957e48bafb47f21c5",
     ".bkit/README.md": "76da76193945362dbf7908c9ede6ffc456f783218c110e6ad98d0e737475d98a",
     ".cursor/rules/bkit-rules.mdc": "36782c0c77a3eabb5a89b82804465d9960ecc7bc4962531fdef9f5c5be07e84d",
     ".claude/hooks/bkit-gateguard.cjs": "ae6358523d8033cf3ccdb6bb306e91f3feaa702effd8b73ecd838c1ace04fa87",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 63992e8d4..fcf66eaaf 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -1250,8 +1250,8 @@ bkit's `bkit-ci.yml` recognises the tags below. They are case-sensitive and use
 
 - **Direct push to `dev` or the default branch** (no PR): put the tag in the commit message (`github.event.head_commit.message`).
 - **Feature branch with an open PR** (open, synchronize or edit): put the tag in the PR title (`github.event.pull_request.title`). The commit message is not read, because the workflow fires on `pull_request`, not `push`.
-- **Both surfaces** are checked by `contains()` in the env block, and a marker in either one wins for its event. Pick the right one: `[verbose ci]` in a feature-branch commit message has no effect, because only the PR title is read.
-- **`workflow_dispatch`**: neither field is filled, so every marker is inert. The planner sets `MSG=""` for events other than `push` and `pull_request`, and silently drops `[force full]`, `[force build]` and `[verbose ci]`. Steer a dispatch with inputs, never a marker. Inputs are mandatory when the dispatch default is expensive, for example when a dispatch forces the metered native build lanes past their reuse gate and spends build quota on every run. Gate the lookup behind an input that defaults to `false`.
+- **Both surfaces** are checked by `contains()` in the env block, and a marker in either one wins for its event. Pick the right one: `[verbose ci]` in a feature-branch commit message has no effect, because only the PR title is read. On a manual run the "Read Verbose Marker (Manual Run)" step reads the head commit for `[verbose ci]`.
+- **`workflow_dispatch`**: neither field is filled, so the template reads the head commit (`git log -1 --pretty=%B "$GITHUB_SHA"`) and every marker acts on a manual run, and keeps acting on every manual run until a new commit lands. `[verbose ci]` is read by the "Read Verbose Marker (Manual Run)" step of the static and unit jobs. `NODE_OPTIONS` stays off on a manual run, because `$GITHUB_ENV` cannot set it. Steer a dispatch with inputs when the marker would have to change on a commit that already exists. Inputs are mandatory when the dispatch default is expensive, for example when a dispatch forces the metered native build lanes past their reuse gate and spends build quota on every run. Gate the lookup behind an input that defaults to `false`.
 
 <!-- prettier-ignore -->
 | Tag | Effect | Scope |
@@ -1496,7 +1496,7 @@ Conventional Commits — `{type}({FID}): {summary}`.
 
 ### CI / Vercel commit tags
 
-Precedence: `bkit [force build]` wins. bkit's own `bkit-ci.yml` reads markers from the PR title on `pull_request` events and from the head commit on pushes; the consumer template reads the PR title on `pull_request`, else the head commit (`workflow_dispatch` included).
+Precedence: `bkit [force build]` wins. bkit's own `bkit-ci.yml` reads markers from the PR title on `pull_request` events and from the head commit on pushes, and its "Read Verbose Marker (Manual Run)" step also reads `[verbose ci]` from the head commit on a manual run; the consumer template reads the PR title on `pull_request`, else the head commit (`workflow_dispatch` included).
 
 <!-- prettier-ignore -->
 | Tag | Effect |
diff --git a/.github/workflows/bkit-ci.yml b/.github/workflows/bkit-ci.yml
index 649fcd762..799b98456 100644
--- a/.github/workflows/bkit-ci.yml
+++ b/.github/workflows/bkit-ci.yml
@@ -362,6 +362,24 @@ jobs:
       # Do NOT add `with: version:` here — pnpm/action-setup errors when both are set.
       - uses: pnpm/action-setup@73e46992e05b19abd31f2f3c20e0e7370d762115 # v6.1.1
 
+      # Manual run: a workflow_dispatch event fills neither head_commit nor pull_request, so the
+      # job-level env cannot see the marker. Read the head commit here and turn verbose on. The
+      # message is compared to the fixed marker only, never expanded as code. NODE_OPTIONS is
+      # not written; the runner rejects that write while reporting success.
+      - name: Read Verbose Marker (Manual Run)
+        if: github.event_name == 'workflow_dispatch'
+        run: |
+          msg="$(git log -1 --pretty=%B "$GITHUB_SHA")"
+          case "$msg" in
+            *"[verbose ci]"*)
+              {
+                echo "VERBOSE_CI=1"
+                echo "TURBO_LOG_LEVEL=debug"
+                echo "DEBUG=vercel:*,supabase:*"
+              } >> "$GITHUB_ENV"
+              ;;
+          esac
+
       # Under [verbose ci]: propagate DEBUG to all subsequent steps via $GITHUB_ENV. Note
       # that steps with their own `env:` block override $GITHUB_ENV — those steps must
       # inline it in their env: declaration to stay verbose-aware. NODE_OPTIONS is NOT
@@ -587,6 +605,24 @@ jobs:
 
       - uses: pnpm/action-setup@73e46992e05b19abd31f2f3c20e0e7370d762115 # v6.1.1
 
+      # Manual run: a workflow_dispatch event fills neither head_commit nor pull_request, so the
+      # job-level env cannot see the marker. Read the head commit here and turn verbose on. The
+      # message is compared to the fixed marker only, never expanded as code. NODE_OPTIONS is
+      # not written; the runner rejects that write while reporting success.
+      - name: Read Verbose Marker (Manual Run)
+        if: github.event_name == 'workflow_dispatch'
+        run: |
+          msg="$(git log -1 --pretty=%B "$GITHUB_SHA")"
+          case "$msg" in
+            *"[verbose ci]"*)
+              {
+                echo "VERBOSE_CI=1"
+                echo "TURBO_LOG_LEVEL=debug"
+                echo "DEBUG=vercel:*,supabase:*"
+              } >> "$GITHUB_ENV"
+              ;;
+          esac
+
       # NODE_OPTIONS is a job-level `env:` key above, never a $GITHUB_ENV write — the runner
       # rejects that write and still reports success. See bkit-tests-static's block comment.
       - name: Configure Verbose CI
diff --git a/docs/deployments.md b/docs/deployments.md
index 801cdb789..086073bee 100644
--- a/docs/deployments.md
+++ b/docs/deployments.md
@@ -101,8 +101,8 @@ bkit's `bkit-ci.yml` recognises the tags below. They are case-sensitive and use
 
 - **Direct push to `dev` or `main`** (no PR): put the tag in the commit message (`github.event.head_commit.message`).
 - **Feature branch with an open PR** (open, synchronize or edit): put the tag in the PR title (`github.event.pull_request.title`). The commit message is not read, because the workflow fires on `pull_request`, not `push`.
-- **Both surfaces** are checked by `contains()` in the env block, and a marker in either one wins for its event. Pick the right one: `[verbose ci]` in a feature-branch commit message has no effect, because only the PR title is read.
-- **`workflow_dispatch`**: neither field is filled, so every marker is inert. The planner sets `MSG=""` for events other than `push` and `pull_request`, and silently drops `[force full]`, `[force build]` and `[verbose ci]`. Steer a dispatch with inputs, never a marker. Inputs are mandatory when the dispatch default is expensive, for example when a dispatch forces the metered native build lanes past their reuse gate and spends build quota on every run. Gate the lookup behind an input that defaults to `false`.
+- **Both surfaces** are checked by `contains()` in the env block, and a marker in either one wins for its event. Pick the right one: `[verbose ci]` in a feature-branch commit message has no effect, because only the PR title is read. On a manual run the "Read Verbose Marker (Manual Run)" step reads the head commit for `[verbose ci]`.
+- **`workflow_dispatch`**: neither field is filled, so the template reads the head commit (`git log -1 --pretty=%B "$GITHUB_SHA"`) and every marker acts on a manual run, and keeps acting on every manual run until a new commit lands. `[verbose ci]` is read by the "Read Verbose Marker (Manual Run)" step of the static and unit jobs. `NODE_OPTIONS` stays off on a manual run, because `$GITHUB_ENV` cannot set it. Steer a dispatch with inputs when the marker would have to change on a commit that already exists. Inputs are mandatory when the dispatch default is expensive, for example when a dispatch forces the metered native build lanes past their reuse gate and spends build quota on every run. Gate the lookup behind an input that defaults to `false`.
 
 <!-- prettier-ignore -->
 | Tag | Effect | Scope |
@@ -175,7 +175,7 @@ cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}
 
 A newer run cancels the older one on every event except the default branch, which queues. That run promotes the deployment, so cancelling it mid-promote could strand production across two releases (§ Promote before the lanes). A pull request keys on its number, and a push or dispatch keys on the ref, so a PR and a `dev` push still overlap. A `workflow_run` observer sees the latest run on that ref only.
 
-A push diffs against the head of the last successful CI run on that branch, not `github.event.before`. Fall back to `github.event.before` only when there is no such run, or when that run's head is no longer an ancestor. A `workflow_dispatch` has no base commit, so short-circuit the affected step to fully affected. `HEAD~1` is only for the delta gates on a dispatch. Markers are inert on a dispatch, so steer it with inputs (§ Commit-message force tags). The planner parses markers once, and every lane reads `plan.markers_present`. The only re-read of the commit or PR text is the workflow-level task-runner cache bust (for example, `TURBO_FORCE`). Validate the plan JSON with `has()` / `!= null`, because jq `//` treats `false` as absent and drops a real `run_live: false`.
+A push diffs against the head of the last successful CI run on that branch, not `github.event.before`. Fall back to `github.event.before` only when there is no such run, or when that run's head is no longer an ancestor. A `workflow_dispatch` has no base commit, so short-circuit the affected step to fully affected. `HEAD~1` is only for the delta gates on a dispatch. Markers act on a dispatch through the head commit, and inputs steer it without a new commit (§ Commit-message force tags). The planner parses markers once, and every lane reads `plan.markers_present`. The only re-read of the commit or PR text is the workflow-level task-runner cache bust (for example, `TURBO_FORCE`). Validate the plan JSON with `has()` / `!= null`, because jq `//` treats `false` as absent and drops a real `run_live: false`.
 
 Migration-immutability and slop-delta run on every event against that same base. The starter's copies of those steps are still `pull_request`-only, and that `if:` is the shape from before the planner existed. Point them at the planner base once `bkit-tests-scope` exists. Pre-push on a `dev` push resolves the same base (`bkit-resolve-push-base.mjs --local`, `.bkit/templates.md` § Git hooks) and exports it as `SLOP_BASE_REF`. A repo-owned migration-immutability pre-push check reads that variable too.
 
