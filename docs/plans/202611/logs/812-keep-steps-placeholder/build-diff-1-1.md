diff --git a/.agents/plugins/bkit/skills/bkit-plan/SKILL.md b/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
index a8751b34f..ed31f2056 100644
--- a/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
@@ -274,7 +274,7 @@ Before generating, ask the engine for this step's invocation id and keep the pri
    ```
 4. Finish:
    ```bash
-   "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-fetch-context --attempt=1 --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/related-issues.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-failures.md --clamp-log=plan-fetch-context --message="chore({FID}): fetch-context" --number=4 --post --title="Fetch Context" --link-ref=dev
+   "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-fetch-context --attempt=1 --derived-artifact=docs/plans/{YYYYMM}/logs/{FID}/related-issues.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-failures.md --clamp-log=plan-fetch-context --message="chore({FID}): fetch-context" --number=4 --post --title="Fetch Context" --link-ref=dev
    ```
 
 ### 🔒 Gate 4 — Fetch Context
diff --git a/.agents/skills/bkit-plan/SKILL.md b/.agents/skills/bkit-plan/SKILL.md
index b2f15f500..170a9d16e 100644
--- a/.agents/skills/bkit-plan/SKILL.md
+++ b/.agents/skills/bkit-plan/SKILL.md
@@ -274,7 +274,7 @@ Before generating, ask the engine for this step's invocation id and keep the pri
    ```
 4. Finish:
    ```bash
-   "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-fetch-context --attempt=1 --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/related-issues.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-failures.md --clamp-log=plan-fetch-context --message="chore({FID}): fetch-context" --number=4 --post --title="Fetch Context" --link-ref=dev
+   "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-fetch-context --attempt=1 --derived-artifact=docs/plans/{YYYYMM}/logs/{FID}/related-issues.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-failures.md --clamp-log=plan-fetch-context --message="chore({FID}): fetch-context" --number=4 --post --title="Fetch Context" --link-ref=dev
    ```
 
 ### 🔒 Gate 4 — Fetch Context
diff --git a/.bkit/cli.md b/.bkit/cli.md
index 1bd84666a..0878b0123 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -356,7 +356,7 @@ Write a step's status row, finish a step in one call, read a verdict header, che

<!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
 | `done` | workflow | **`--file`** **`--workflow`** **`--step`** `--status` `--verdict` `--agent` `--allowed` `--failures` `--attempt` `--group` `--strategy` `--artifact` `--field` `--parent-sha` `--commit` `--message` | Append a step-done row and commit it (parentSha captured first). |
-| `finish` | workflow | **`--file`** **`--workflow`** **`--step`** `--artifact` `--optional-artifact` `--agent` `--verdict` `--allowed` `--failures` `--attempt` `--attempt-of` `--count-field` `--group` `--strategy` `--scope` `--field` `--clamp-log` `--docs-only` `--plan` `--parent-sha` `--commit` `--message` `--done-fallback` `--verbose-ci-local` `--number` `--title` `--post` `--group-count` `--link-ref` `--tree` `--owner-repo` `--comment-body` `--comment-field` | End a step: read the verdict header(s), derive the attempt, check the gate, write the row, commit, print the tracker comment. Exit 11 on a build tests step that changed an earlier task's recorded test no open task of the group names, and on a code step that changed a planned test; for each BLOCKED test a ticked task owns, a code step first adds a takeover task to the plan and its build-takeover row, and prints them under contradicts. |
+| `finish` | workflow | **`--file`** **`--workflow`** **`--step`** `--artifact` `--optional-artifact` `--derived-artifact` `--agent` `--verdict` `--allowed` `--failures` `--attempt` `--attempt-of` `--count-field` `--group` `--strategy` `--scope` `--field` `--clamp-log` `--docs-only` `--plan` `--parent-sha` `--commit` `--message` `--done-fallback` `--verbose-ci-local` `--number` `--title` `--post` `--group-count` `--link-ref` `--tree` `--owner-repo` `--comment-body` `--comment-field` | End a step: read the verdict header(s), derive the attempt, check the gate, write the row, commit, print the tracker comment. Exit 11 on a build tests step that changed an earlier task's recorded test no open task of the group names, and on a code step that changed a planned test; for each BLOCKED test a ticked task owns, a code step first adds a takeover task to the plan and its build-takeover row, and prints them under contradicts. |
 | `verdict` | by hand | **`--file`** `--agent` `--allowed` `--field` `--result-file` | Read an artifact's header down to <!-- verdict:end -->. |
 | `gate` | workflow | `--file` `--ref` **`--workflow`** **`--step`** `--group` `--progress-number` `--attempt` `--attempt-of` `--artifact` `--verdict-required` `--agent` `--allowed` `--placeholder` `--fid` `--issue` `--month` `--token` | Mechanical gate checks for one step: placeholders, FID, lock, artifacts, verdict, status row (with its attempt / strategy / scope where the step writes them). |
 | `stub` | workflow | `--from` **`--to`** `--agent` `--result-file` `--invocation` `--strip-header` | Seed a versioned artifact: copy the prior version, then put a PENDING verdict header on top. |
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 404ab117d..2aeea5874 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -356,7 +356,7 @@ Write a step's status row, finish a step in one call, read a verdict header, che

<!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
 | `done` | workflow | **`--file`** **`--workflow`** **`--step`** `--status` `--verdict` `--agent` `--allowed` `--failures` `--attempt` `--group` `--strategy` `--artifact` `--field` `--parent-sha` `--commit` `--message` | Append a step-done row and commit it (parentSha captured first). |
-| `finish` | workflow | **`--file`** **`--workflow`** **`--step`** `--artifact` `--optional-artifact` `--agent` `--verdict` `--allowed` `--failures` `--attempt` `--attempt-of` `--count-field` `--group` `--strategy` `--scope` `--field` `--clamp-log` `--docs-only` `--plan` `--parent-sha` `--commit` `--message` `--done-fallback` `--verbose-ci-local` `--number` `--title` `--post` `--group-count` `--link-ref` `--tree` `--owner-repo` `--comment-body` `--comment-field` | End a step: read the verdict header(s), derive the attempt, check the gate, write the row, commit, print the tracker comment. Exit 11 on a build tests step that changed an earlier task's recorded test no open task of the group names, and on a code step that changed a planned test; for each BLOCKED test a ticked task owns, a code step first adds a takeover task to the plan and its build-takeover row, and prints them under contradicts. |
+| `finish` | workflow | **`--file`** **`--workflow`** **`--step`** `--artifact` `--optional-artifact` `--derived-artifact` `--agent` `--verdict` `--allowed` `--failures` `--attempt` `--attempt-of` `--count-field` `--group` `--strategy` `--scope` `--field` `--clamp-log` `--docs-only` `--plan` `--parent-sha` `--commit` `--message` `--done-fallback` `--verbose-ci-local` `--number` `--title` `--post` `--group-count` `--link-ref` `--tree` `--owner-repo` `--comment-body` `--comment-field` | End a step: read the verdict header(s), derive the attempt, check the gate, write the row, commit, print the tracker comment. Exit 11 on a build tests step that changed an earlier task's recorded test no open task of the group names, and on a code step that changed a planned test; for each BLOCKED test a ticked task owns, a code step first adds a takeover task to the plan and its build-takeover row, and prints them under contradicts. |
 | `verdict` | by hand | **`--file`** `--agent` `--allowed` `--field` `--result-file` | Read an artifact's header down to <!-- verdict:end -->. |
 | `gate` | workflow | `--file` `--ref` **`--workflow`** **`--step`** `--group` `--progress-number` `--attempt` `--attempt-of` `--artifact` `--verdict-required` `--agent` `--allowed` `--placeholder` `--fid` `--issue` `--month` `--token` | Mechanical gate checks for one step: placeholders, FID, lock, artifacts, verdict, status row (with its attempt / strategy / scope where the step writes them). |
 | `stub` | workflow | `--from` **`--to`** `--agent` `--result-file` `--invocation` `--strip-header` | Seed a versioned artifact: copy the prior version, then put a PENDING verdict header on top. |
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index d9d90de69..4837ba471 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -425,7 +425,7 @@ Reading does not remove the log, so a retried status block re-emits the same arr
 - Never assign one in prose (`Init counters:` / `Increment X + 1` are prohibited), and never do prose arithmetic.
 - A display-only block (tracker comment, narration) may use a value a command printed earlier in the same step.
 - Take limits by ask point only, through `bkit counters max --point=` or `bkit counters route --point=`, never as a literal (§ Ask points).
-- `steps finish` refuses an attempt below one the run has already saved: an `--artifact` / `--optional-artifact` pattern holding `<attempt>` with a higher-numbered file on disk → exit 12, nothing written, `later` names the files. A file already committed at the run's `workflow-started` `parentSha` belongs to an earlier run and does not count.
+- `steps finish` refuses an attempt below one the run has already saved: an `--artifact` / `--optional-artifact` / `--derived-artifact` pattern holding `<attempt>` with a higher-numbered file on disk → exit 12, nothing written, `later` names the files. A file already committed at the run's `workflow-started` `parentSha` belongs to an earlier run and does not count.
 
 Gate: `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts`.
 
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 482ed49b8..40b8bf298 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -1584,6 +1584,14 @@ describe("plan", () => {
     expect(plan).not.toContain("--brief");
   });
 
+  it("Fetch Context passes related-issues.md as a derived artifact", () => {
+    const finish4 = commandLines(section(plan, /Step 4 — Fetch Context/), "steps finish");
+    expect(finish4).toHaveLength(1);
+    expect(finish4[0]).toContain(`--derived-artifact=${LOG}/related-issues.md`);
+    expect(finish4[0]).not.toContain(`--optional-artifact=${LOG}/related-issues.md`);
+    expect(finish4[0]).not.toContain(`--artifact=${LOG}/related-issues.md`);
+  });
+
   it("carries draft formatting findings through review and update, with a strict final check", () => {
     const generate = section(plan, /Step 3 — Generate Plan/);
     const review = section(plan, /Step 5 — Review Plan/);
diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index 6254771ed..3909ec5bc 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -1131,6 +1131,55 @@ describe("bkit steps finish", () => {
     expect(fs.existsSync(path.join(cwd, "logs/status.jsonl"))).toBe(false);
   });
 
+  describe("--derived-artifact", () => {
+    const DERIVED = ["--step=build-create-pr", "--commit=none"];
+
+    it("a --derived-artifact holding a whole-line PENDING passes and is recorded", async () => {
+      const cwd = repo();
+      write(cwd, "logs/related.md", "Quoted from another issue:\nPENDING\nStatus: PENDING\n");
+      const r = await run(cwd, [...FINISH, ...DERIVED, "--derived-artifact=logs/related.md"]);
+      expect(r.code).toBe(0);
+      expect(r.json.row.artifacts).toContain("logs/related.md");
+    });
+
+    it("a PENDING in --artifact still refuses while a --derived-artifact is passed", async () => {
+      const cwd = repo();
+      write(cwd, "logs/related.md", "PENDING\n");
+      write(cwd, "logs/own.md", "# Own\n\nPENDING\n");
+      const r = await run(cwd, [
+        ...FINISH,
+        ...DERIVED,
+        "--artifact=logs/own.md",
+        "--derived-artifact=logs/related.md",
+      ]);
+      expect(r.code).not.toBe(0);
+      expect(r.err).toContain("placeholders logs/own.md");
+      expect(r.err).not.toContain("placeholders logs/related.md");
+    });
+
+    it("a PENDING in --optional-artifact still refuses while a --derived-artifact is passed", async () => {
+      const cwd = repo();
+      write(cwd, "logs/related.md", "PENDING\n");
+      write(cwd, "logs/opt.md", "# Opt\n\nPENDING\n");
+      const r = await run(cwd, [
+        ...FINISH,
+        ...DERIVED,
+        "--optional-artifact=logs/opt.md",
+        "--derived-artifact=logs/related.md",
+      ]);
+      expect(r.code).not.toBe(0);
+      expect(r.err).toContain("placeholders logs/opt.md");
+      expect(r.err).not.toContain("placeholders logs/related.md");
+    });
+
+    it("a missing --derived-artifact is skipped and not recorded", async () => {
+      const cwd = repo();
+      const r = await run(cwd, [...FINISH, ...DERIVED, "--derived-artifact=logs/absent.md"]);
+      expect(r.code).toBe(0);
+      expect(r.json.row.artifacts).not.toContain("logs/absent.md");
+    });
+  });
+
   it("re-asks (exit 6) when a field the prompt declares is missing", async () => {
     const cwd = repo();
     write(cwd, "logs/verify-1.md", "Verdict: PASS\n<!-- verdict:end -->\n");
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index 569b2cd01..431dbcf88 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -807,6 +807,8 @@ interface GateOptions {
   group?: number;
   attempt?: number;
   artifacts: string[];
+  /** Artifacts of copied external text: checked present, never scanned for PENDING. */
+  derivedArtifacts?: string[];
   verdictRequired: boolean;
   allowed: string[];
   fid?: string;
@@ -866,6 +868,7 @@ function gateChecks(cwd: string, o: GateOptions): Check[] {
     const problem = artifactProblem(cwd, a);
     add(`artifact ${a}`, problem, "present and non-empty");
     if (problem) continue;
+    if (o.derivedArtifacts?.includes(a)) continue;
     const left = placeholderLines(path.resolve(cwd, a));
     add(
       `placeholders ${a}`,
@@ -1147,11 +1150,15 @@ async function finish(ctx: RunContext): Promise<number> {
   }
   const scope = str(f.scope);
   if (scope !== undefined) extras.scope = scope;
+  const derivedArtifacts = list(f.derivedArtifact)
+    .map((a) => fill(a, attempt))
+    .filter((a) => fs.existsSync(path.resolve(ctx.cwd, a)));
   const artifacts = [
     ...list(f.artifact).map((a) => fill(a, attempt)),
     ...list(f.optionalArtifact)
       .map((a) => fill(a, attempt))
       .filter((a) => fs.existsSync(path.resolve(ctx.cwd, a))),
+    ...derivedArtifacts,
   ];
 
   // Artifacts first: every one present, non-empty, inside the working directory.
@@ -1307,6 +1314,7 @@ async function finish(ctx: RunContext): Promise<number> {
     workflow,
     step,
     artifacts,
+    derivedArtifacts,
     verdictRequired: false,
     allowed,
     placeholders: [],
@@ -1550,7 +1558,7 @@ async function finish(ctx: RunContext): Promise<number> {
     const startSha = activeRunStart(file, workflow)?.parentSha;
     const later = laterAttempts(
       ctx.cwd,
-      [...list(f.artifact), ...list(f.optionalArtifact)],
+      [...list(f.artifact), ...list(f.optionalArtifact), ...list(f.derivedArtifact)],
       attempt,
       typeof startSha === "string" && startSha !== "" ? startSha : undefined,
     );
@@ -1701,6 +1709,7 @@ async function finish(ctx: RunContext): Promise<number> {
     group,
     attempt,
     artifacts,
+    derivedArtifacts,
     verdictRequired: false,
     allowed,
     placeholders: [],
@@ -2115,6 +2124,12 @@ export const stepsCommand: CommandSpec = {
           repeatable: true,
           help: "an artifact recorded (and checked) only when the file exists",
         },
+        {
+          name: "derived-artifact",
+          type: "string",
+          repeatable: true,
+          help: "copied external text: may be missing, recorded when present, not scanned for PENDING",
+        },
         {
           name: "agent",
           type: "string",
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
index 0514977df..e555c8d1c 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
@@ -232,7 +232,7 @@ Before generating, ask the engine for this step's invocation id and keep the pri
    ```
 4. Finish:
    ```bash
-   "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-fetch-context --attempt=1 --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/related-issues.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-failures.md --clamp-log=plan-fetch-context --message="chore({FID}): fetch-context" --number=4 --post --title="Fetch Context" --link-ref=dev
+   "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-fetch-context --attempt=1 --derived-artifact=docs/plans/{YYYYMM}/logs/{FID}/related-issues.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-failures.md --clamp-log=plan-fetch-context --message="chore({FID}): fetch-context" --number=4 --post --title="Fetch Context" --link-ref=dev
    ```
 
 ### 🔒 Gate 4 — Fetch Context
diff --git a/.bkit/core/workflows/bkit-plan.md b/.bkit/core/workflows/bkit-plan.md
index 13fb2b7a2..77c303f07 100644
--- a/.bkit/core/workflows/bkit-plan.md
+++ b/.bkit/core/workflows/bkit-plan.md
@@ -328,7 +328,7 @@ Before generating, ask the engine for this step's invocation id and keep the pri
    ```
 4. Finish:
    ```bash
-   "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-fetch-context --attempt=1 --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/related-issues.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-failures.md --clamp-log=plan-fetch-context --message="chore({FID}): fetch-context" --number=4 --post --title="Fetch Context" --link-ref=dev
+   "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-fetch-context --attempt=1 --derived-artifact=docs/plans/{YYYYMM}/logs/{FID}/related-issues.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-failures.md --clamp-log=plan-fetch-context --message="chore({FID}): fetch-context" --number=4 --post --title="Fetch Context" --link-ref=dev
    ```
 
 ### 🔒 Gate 4 — Fetch Context
diff --git a/.bkit/version b/.bkit/version
index f2bf5fcce..b68ade42b 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -18,7 +18,7 @@
     ".claude/commands/bkit-build.md": "707c6dd3678881bcb9dc7e6e8c0e6c195e72bafd78d968a2eba494278cb38221",
     ".claude/commands/bkit-debug.md": "6b58fad4ef1d72a6b951d326bab931c2e27119a3d4d0f83d4d7ff8766b9eb0f6",
     ".claude/commands/bkit-design.md": "dae2b4e44305a5cbe85c19357e4fcf5381485c093e6948ea00280628c000e843",
-    ".claude/commands/bkit-plan.md": "85c7b7cb3b9f0873761fdbc62fdbbe5c1cc494a272173947ad2bea4d907c9a39",
+    ".claude/commands/bkit-plan.md": "803e55dfef9e1315bb425ec31126d562c6765e123f8bc84bd909e4ed80b4e447",
     ".claude/commands/bkit-ship.md": "ac597a53b09235918ffc3ca73ca59fe946d767fca0db55de8f3effbff0342b75",
     ".claude/agents/bkit-build-challenge-1.md": "27b112ecab10c311a195ab8cca36187708722554344f402a9a51c402d8c87c9b",
     ".claude/agents/bkit-build-challenge-2.md": "b83d1d00da3d86b93c6ab33379ac48cade1a3f182b9890d54e847a46b1e430bf",
@@ -50,7 +50,7 @@
     ".cursor/commands/bkit-build.md": "8227067d999bf9fd11dbef444010e79a20f7d75a491ba174dcc1661f1c7c2bd7",
     ".cursor/commands/bkit-debug.md": "f76b79801538fa4bae3f2613b8e8a572365db3665c123749a9ec6299fce25c43",
     ".cursor/commands/bkit-design.md": "cafad1a3acc6788e3c2356694efb51681477e425b81a98f3e4e5ce00c9454a02",
-    ".cursor/commands/bkit-plan.md": "7b9298fa053dba33814fbb657968584c1a87d181229a087058bfdb559f4b0cd1",
+    ".cursor/commands/bkit-plan.md": "de1591fbc07c7f4d645f8295c3b56fd3f0d493e18d08007547364e41830c6488",
     ".cursor/commands/bkit-ship.md": "18846ae5cce57a4d29f51271fe337a50a8ea4373c182fbbb77e51a51bc78dfb0",
     ".cursor/agents/bkit-build-challenge-1.md": "e8736c4d2e1c56397ee64f0efd867677c3dad3b09c1809bc57385c4880f1a832",
     ".cursor/agents/bkit-build-challenge-2.md": "41a0ac26cdd42bc02c1399eee02fc956e56f15a2a44243988cc68d4126840dc8",
@@ -108,7 +108,7 @@
     ".opencode/commands/bkit-build.md": "a92edad6562020f7c4c048924282674040253ed85c06c84ee9cbfee0084ad783",
     ".opencode/commands/bkit-debug.md": "e4ef9e278efb5cd6ef5f9702463e967f42972c1d50a6e7a02127d2b7e7b4aa90",
     ".opencode/commands/bkit-design.md": "599a393c2309e2ff50f53f54d8383a854763f1f98074904886b4b9f4ea394312",
-    ".opencode/commands/bkit-plan.md": "8b8b40b4a5286bba48f1108eace3c350c769884d74ff5edf8674d23338aca2e1",
+    ".opencode/commands/bkit-plan.md": "69e4af9bb3edf47709941ebb5c930a2f977f29a1a1014f320511377e2375b0c0",
     ".opencode/commands/bkit-ship.md": "7bf3cdc1f819e400ec7abf75f88133ca75d6250dc724787f462e2206da965ff1",
     ".claude/agents/bkit-design-spike.md": "1628fe87f44714001e6bb4056de5ffe94c3ba8784ad347f548022ea8bdea3649",
     ".cursor/agents/bkit-design-spike.md": "16b114cf2d43dee7f4c4e4703480056e6b94467a096f21654c69b655d078a3ec",
@@ -214,7 +214,7 @@
     ".bkit/providers.md": "cd84350a719e69837d96a698fe5597f98c79785d3e4079cb1867fbcf4901430e",
     ".bkit/prompts.md": "2ac9bdc011d81372cbebcdb914815f02140c91d82dfb79a1bdbb72875d48d852",
     ".bkit/trackers.md": "85913cc84a994cd14a6c0948a8f6b63611a776b1be80cf9a902e5cb994add0c2",
-    ".bkit/workflows.md": "334a629caff42c973a338852d5a8198f21e33036fc3aac87aaff8be282f6a410",
+    ".bkit/workflows.md": "c6c5d9f80e50ea102abb19f8065fde3ee82b3e685daf9d9e172fc170afd77703",
     ".bkit/README.md": "76da76193945362dbf7908c9ede6ffc456f783218c110e6ad98d0e737475d98a",
     ".cursor/rules/bkit-rules.mdc": "36782c0c77a3eabb5a89b82804465d9960ecc7bc4962531fdef9f5c5be07e84d",
     ".claude/hooks/bkit-gateguard.cjs": "ae6358523d8033cf3ccdb6bb306e91f3feaa702effd8b73ecd838c1ace04fa87",
@@ -254,7 +254,7 @@
     ".codex/hooks/bkit-rules.cjs": "65d998bd5f0299d1eaf33cd18110894f3c4cb95998698c9ccbfc63baec796df8",
     ".opencode/plugin/bkit-rules.js": "02bc8a76a4d1ec4f3fd23f299047270914c72662570964fa22894a7e0e0b04e8",
     ".bkit/router.md": "77538e88a48383850f5ebe0835bc4b80d3b33117c7fa72e49b98faba079d2ef5",
-    ".bkit/cli.md": "5b4e078089ffd669da8e37dad628d71b780440b5a290223a50782451ca4d057d",
+    ".bkit/cli.md": "af388cd07a23a97499ea17fe31af94df5d55d96e27eacc3dfd66be6318a9f924",
     ".claude/agents/bkit-build-plan-tests.md": "e4c22cfb4973eb332139aaa698924f3fc39d938b2fdbe45b848881b9c1699434",
     ".cursor/agents/bkit-build-plan-tests.md": "c1f77dee3a5bfdcf3df077b7ddeb2a6f393ec518c884e99a8db3c177b5549dba",
     ".opencode/agents/bkit-build-plan-tests.md": "de624000ba6c0f9c5b55c498f0680ccf8bff9950b9511b44c3d85171e0309b7b",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 62eb9d57d..09be9f7b0 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -425,7 +425,7 @@ Reading does not remove the log, so a retried status block re-emits the same arr
 - Never assign one in prose (`Init counters:` / `Increment X + 1` are prohibited), and never do prose arithmetic.
 - A display-only block (tracker comment, narration) may use a value a command printed earlier in the same step.
 - Take limits by ask point only, through `bkit counters max --point=` or `bkit counters route --point=`, never as a literal (§ Ask points).
-- `steps finish` refuses an attempt below one the run has already saved: an `--artifact` / `--optional-artifact` pattern holding `<attempt>` with a higher-numbered file on disk → exit 12, nothing written, `later` names the files. A file already committed at the run's `workflow-started` `parentSha` belongs to an earlier run and does not count.
+- `steps finish` refuses an attempt below one the run has already saved: an `--artifact` / `--optional-artifact` / `--derived-artifact` pattern holding `<attempt>` with a higher-numbered file on disk → exit 12, nothing written, `later` names the files. A file already committed at the run's `workflow-started` `parentSha` belongs to an earlier run and does not count.
 
 Gate: `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts`.
 
diff --git a/.claude/commands/bkit-plan.md b/.claude/commands/bkit-plan.md
index 6da84313e..492b0ee72 100644
--- a/.claude/commands/bkit-plan.md
+++ b/.claude/commands/bkit-plan.md
@@ -273,7 +273,7 @@ Before generating, ask the engine for this step's invocation id and keep the pri
    ```
 4. Finish:
    ```bash
-   "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-fetch-context --attempt=1 --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/related-issues.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-failures.md --clamp-log=plan-fetch-context --message="chore({FID}): fetch-context" --number=4 --post --title="Fetch Context" --link-ref=dev
+   "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-fetch-context --attempt=1 --derived-artifact=docs/plans/{YYYYMM}/logs/{FID}/related-issues.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-failures.md --clamp-log=plan-fetch-context --message="chore({FID}): fetch-context" --number=4 --post --title="Fetch Context" --link-ref=dev
    ```
 
 ### 🔒 Gate 4 — Fetch Context
diff --git a/.cursor/commands/bkit-plan.md b/.cursor/commands/bkit-plan.md
index 0a3a046d3..ccb5caf95 100644
--- a/.cursor/commands/bkit-plan.md
+++ b/.cursor/commands/bkit-plan.md
@@ -272,7 +272,7 @@ Before generating, ask the engine for this step's invocation id and keep the pri
    ```
 4. Finish:
    ```bash
-   "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-fetch-context --attempt=1 --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/related-issues.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-failures.md --clamp-log=plan-fetch-context --message="chore({FID}): fetch-context" --number=4 --post --title="Fetch Context" --link-ref=dev
+   "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-fetch-context --attempt=1 --derived-artifact=docs/plans/{YYYYMM}/logs/{FID}/related-issues.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-failures.md --clamp-log=plan-fetch-context --message="chore({FID}): fetch-context" --number=4 --post --title="Fetch Context" --link-ref=dev
    ```
 
 ### 🔒 Gate 4 — Fetch Context
diff --git a/.opencode/commands/bkit-plan.md b/.opencode/commands/bkit-plan.md
index 40d812caf..5b5f5628f 100644
--- a/.opencode/commands/bkit-plan.md
+++ b/.opencode/commands/bkit-plan.md
@@ -276,7 +276,7 @@ Before generating, ask the engine for this step's invocation id and keep the pri
    ```
 4. Finish:
    ```bash
-   "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-fetch-context --attempt=1 --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/related-issues.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-failures.md --clamp-log=plan-fetch-context --message="chore({FID}): fetch-context" --number=4 --post --title="Fetch Context" --link-ref=dev
+   "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-fetch-context --attempt=1 --derived-artifact=docs/plans/{YYYYMM}/logs/{FID}/related-issues.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-failures.md --clamp-log=plan-fetch-context --message="chore({FID}): fetch-context" --number=4 --post --title="Fetch Context" --link-ref=dev
    ```
 
 ### 🔒 Gate 4 — Fetch Context
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index fdf775a9e..0a1681e22 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -648,6 +648,8 @@ function gateChecks(cwd, o) {
         add(`artifact ${a}`, problem, "present and non-empty");
         if (problem)
             continue;
+        if (o.derivedArtifacts?.includes(a))
+            continue;
         const left = placeholderLines(path.resolve(cwd, a));
         add(`placeholders ${a}`, left.length ? `PENDING left on line(s) ${left.join(", ")}` : undefined, "none left");
     }
@@ -898,11 +900,15 @@ async function finish(ctx) {
     const scope = str(f.scope);
     if (scope !== undefined)
         extras.scope = scope;
+    const derivedArtifacts = list(f.derivedArtifact)
+        .map((a) => fill(a, attempt))
+        .filter((a) => fs.existsSync(path.resolve(ctx.cwd, a)));
     const artifacts = [
         ...list(f.artifact).map((a) => fill(a, attempt)),
         ...list(f.optionalArtifact)
             .map((a) => fill(a, attempt))
             .filter((a) => fs.existsSync(path.resolve(ctx.cwd, a))),
+        ...derivedArtifacts,
     ];
     // Artifacts first: every one present, non-empty, inside the working directory.
     const bad = artifacts.map((a) => artifactProblem(ctx.cwd, a)).filter(Boolean);
@@ -1038,6 +1044,7 @@ async function finish(ctx) {
         workflow,
         step,
         artifacts,
+        derivedArtifacts,
         verdictRequired: false,
         allowed,
         placeholders: [],
@@ -1254,7 +1261,7 @@ async function finish(ctx) {
     // The attempt finished is the latest one this run saved artifacts for.
     if (attempt !== undefined) {
         const startSha = activeRunStart(file, workflow)?.parentSha;
-        const later = laterAttempts(ctx.cwd, [...list(f.artifact), ...list(f.optionalArtifact)], attempt, typeof startSha === "string" && startSha !== "" ? startSha : undefined);
+        const later = laterAttempts(ctx.cwd, [...list(f.artifact), ...list(f.optionalArtifact), ...list(f.derivedArtifact)], attempt, typeof startSha === "string" && startSha !== "" ? startSha : undefined);
         if (later.length > 0) {
             ctx.log(`attempt ${attempt} is not the latest: this run saved ${later.join(", ")} after it — finish the latest attempt (nothing written)`);
             ctx.emit({ pass: false, attempt, later });
@@ -1380,6 +1387,7 @@ async function finish(ctx) {
         group,
         attempt,
         artifacts,
+        derivedArtifacts,
         verdictRequired: false,
         allowed,
         placeholders: [],
@@ -1769,6 +1777,12 @@ export const stepsCommand = {
                     repeatable: true,
                     help: "an artifact recorded (and checked) only when the file exists",
                 },
+                {
+                    name: "derived-artifact",
+                    type: "string",
+                    repeatable: true,
+                    help: "copied external text: may be missing, recorded when present, not scanned for PENDING",
+                },
                 {
                     name: "agent",
                     type: "string",
