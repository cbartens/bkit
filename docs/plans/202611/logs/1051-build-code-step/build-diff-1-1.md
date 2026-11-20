diff --git a/.bkit/cli.md b/.bkit/cli.md
index 83090035b..56d14ec2f 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -359,7 +359,7 @@ Write a step's status row, finish a step in one call, read a verdict header, che

<!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
 | `done` | workflow | **`--file`** **`--workflow`** **`--step`** `--status` `--verdict` `--agent` `--allowed` `--failures` `--attempt` `--group` `--strategy` `--artifact` `--field` `--parent-sha` `--commit` `--message` | Append a step-done row and commit it (parentSha captured first). |
-| `finish` | workflow | **`--file`** **`--workflow`** **`--step`** `--artifact` `--optional-artifact` `--derived-artifact` `--agent` `--verdict` `--allowed` `--failures` `--attempt` `--attempt-of` `--count-field` `--group` `--strategy` `--scope` `--field` `--clamp-log` `--docs-only` `--plan` `--parent-sha` `--commit` `--message` `--done-fallback` `--verbose-ci-local` `--number` `--title` `--post` `--group-count` `--link-ref` `--tree` `--owner-repo` `--comment-body` `--comment-field` | End a step: read the verdict header(s), derive the attempt, check the gate, write the row, commit, print the tracker comment. Exit 11 on a build tests step that changed an earlier task's recorded test no open task of the group names, and on a code step that changed a planned test; for each BLOCKED test a ticked task owns, a code step first adds a takeover task to the plan and its build-takeover row, and prints them under contradicts. |
+| `finish` | workflow | **`--file`** **`--workflow`** **`--step`** `--artifact` `--optional-artifact` `--derived-artifact` `--agent` `--verdict` `--allowed` `--failures` `--attempt` `--attempt-of` `--count-field` `--group` `--strategy` `--scope` `--field` `--clamp-log` `--docs-only` `--plan` `--parent-sha` `--commit` `--message` `--done-fallback` `--verbose-ci-local` `--number` `--title` `--post` `--group-count` `--link-ref` `--tree` `--owner-repo` `--comment-body` `--comment-field` | End a step: read the verdict header(s), derive the attempt, check the gate, write the row, commit, print the tracker comment; a build code step first runs a declared bkit:generate. Exit 11 on a build tests step that changed an earlier task's recorded test no open task of the group names, and on a code step that changed a planned test; for each BLOCKED test a ticked task owns, a code step first adds a takeover task to the plan and its build-takeover row, and prints them under contradicts. |
 | `verdict` | by hand | **`--file`** `--agent` `--allowed` `--field` | Read an artifact's header down to <!-- verdict:end -->. |
 | `gate` | workflow | `--file` `--ref` **`--workflow`** **`--step`** `--group` `--progress-number` `--attempt` `--attempt-of` `--artifact` `--verdict-required` `--agent` `--allowed` `--placeholder` `--fid` `--issue` `--month` `--token` | Mechanical gate checks for one step: placeholders, FID, lock, artifacts, verdict, status row (with its attempt / strategy / scope where the step writes them). |
 | `stub` | workflow | `--from` **`--to`** `--strip-header` | Seed a versioned artifact: copy the prior version, then put a PENDING verdict header on top. |
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index d48f2300e..e13606306 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -359,7 +359,7 @@ Write a step's status row, finish a step in one call, read a verdict header, che

<!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
 | `done` | workflow | **`--file`** **`--workflow`** **`--step`** `--status` `--verdict` `--agent` `--allowed` `--failures` `--attempt` `--group` `--strategy` `--artifact` `--field` `--parent-sha` `--commit` `--message` | Append a step-done row and commit it (parentSha captured first). |
-| `finish` | workflow | **`--file`** **`--workflow`** **`--step`** `--artifact` `--optional-artifact` `--derived-artifact` `--agent` `--verdict` `--allowed` `--failures` `--attempt` `--attempt-of` `--count-field` `--group` `--strategy` `--scope` `--field` `--clamp-log` `--docs-only` `--plan` `--parent-sha` `--commit` `--message` `--done-fallback` `--verbose-ci-local` `--number` `--title` `--post` `--group-count` `--link-ref` `--tree` `--owner-repo` `--comment-body` `--comment-field` | End a step: read the verdict header(s), derive the attempt, check the gate, write the row, commit, print the tracker comment. Exit 11 on a build tests step that changed an earlier task's recorded test no open task of the group names, and on a code step that changed a planned test; for each BLOCKED test a ticked task owns, a code step first adds a takeover task to the plan and its build-takeover row, and prints them under contradicts. |
+| `finish` | workflow | **`--file`** **`--workflow`** **`--step`** `--artifact` `--optional-artifact` `--derived-artifact` `--agent` `--verdict` `--allowed` `--failures` `--attempt` `--attempt-of` `--count-field` `--group` `--strategy` `--scope` `--field` `--clamp-log` `--docs-only` `--plan` `--parent-sha` `--commit` `--message` `--done-fallback` `--verbose-ci-local` `--number` `--title` `--post` `--group-count` `--link-ref` `--tree` `--owner-repo` `--comment-body` `--comment-field` | End a step: read the verdict header(s), derive the attempt, check the gate, write the row, commit, print the tracker comment; a build code step first runs a declared bkit:generate. Exit 11 on a build tests step that changed an earlier task's recorded test no open task of the group names, and on a code step that changed a planned test; for each BLOCKED test a ticked task owns, a code step first adds a takeover task to the plan and its build-takeover row, and prints them under contradicts. |
 | `verdict` | by hand | **`--file`** `--agent` `--allowed` `--field` | Read an artifact's header down to <!-- verdict:end -->. |
 | `gate` | workflow | `--file` `--ref` **`--workflow`** **`--step`** `--group` `--progress-number` `--attempt` `--attempt-of` `--artifact` `--verdict-required` `--agent` `--allowed` `--placeholder` `--fid` `--issue` `--month` `--token` | Mechanical gate checks for one step: placeholders, FID, lock, artifacts, verdict, status row (with its attempt / strategy / scope where the step writes them). |
 | `stub` | workflow | `--from` **`--to`** `--strip-header` | Seed a versioned artifact: copy the prior version, then put a PENDING verdict header on top. |
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index e5603df56..df68c6901 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -1747,7 +1747,7 @@ Dependency inspection: `bkit:deps:outdated` / `bkit:deps:audit` exist so prompts
 `bkit:generate` is not a gate either: it rewrites every generated file and saved baseline (snapshots, coverage lists, generated docs) from the current working tree, in place, so a commit never carries code whose generated output is stale.
 
 - **Contract:** no arguments; idempotent, so a second run changes nothing; exit 0 on success, non-zero on failure.
-- **Callers:** `@bkit-build-plan-tasks` and `@bkit-build-plan-gaps-remediate` run it once after their last change, before the step's commit; `bkit branches sync --merge-docs` (build Step 3), `bkit branches sync --merge` (ship Step 4) and `bkit branches push` run it after they merge `origin/dev`; `bkit branches regenerate` runs it in ship Step 10's regenerate round. Each commits only the paths `bkit:generate` changed, so uncommitted work already in the tree stays out, and refuses when it changed a path that already held uncommitted changes.
+- **Callers:** `@bkit-build-plan-tasks` and `@bkit-build-plan-gaps-remediate` run it once after their last change, before the step's commit, and `bkit steps finish` runs it again before the commit of each build code step (exit 16 when it fails); `bkit branches sync --merge-docs` (build Step 3), `bkit branches sync --merge` (ship Step 4) and `bkit branches push` run it after they merge `origin/dev`; `bkit branches regenerate` runs it in ship Step 10's regenerate round. Each commits only the paths `bkit:generate` changed, so uncommitted work already in the tree stays out, and refuses when it changed a path that already held uncommitted changes.
 - **Undeclared:** every caller skips it.
 
 Not seeded, because which files a stack generates is the stack's business. A regenerated baseline is never a `TEST FIRST` test: regenerating it makes it pass, so it cannot fail first.
diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index dcaab5ad3..099aef413 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -3450,3 +3450,148 @@ describe("bkit steps finish", () => {
     expect(r.json.problem).toBeUndefined();
   });
 });
+
+describe("bkit steps finish — a build code step makes the generated output current first", () => {
+  const STATUS = "logs/status.jsonl";
+  const STALE_HOOK =
+    '#!/bin/sh\nif [ "$(cat built.txt)" != "$(cat source.txt)" ]; then echo stale built output >&2; exit 1; fi\n';
+  const SEED = '{"type":"x","n":1}\n';
+  const OTHER_HOOK = "#!/bin/sh\necho unrelated refusal >&2\nexit 1\n";
+  const codeFinish = (step: string, agent: string, log: string, extra: string[] = []) => [
+    "steps",
+    "finish",
+    `--file=${STATUS}`,
+    "--workflow=build",
+    `--step=${step}`,
+    "--group=1",
+    `--attempt-of=${step}:next`,
+    `--agent=${agent}`,
+    `--artifact=${log}`,
+    `--message=chore(1-x): ${step} group 1`,
+    ...extra,
+  ];
+  const EXECUTE = codeFinish("build-plan-tasks", "bkit-build-plan-tasks", "logs/execute-1-log.md");
+  const REMEDIATE = codeFinish(
+    "build-plan-gaps-remediate",
+    "bkit-build-plan-gaps-remediate",
+    "logs/remediate-1-log.md",
+  );
+  const HOLISTIC = codeFinish(
+    "build-plan-gaps-remediate-holistic",
+    "bkit-build-plan-gaps-remediate",
+    "logs/remediate-1-log.md",
+  ).filter((a) => a !== "--group=1");
+  const SYNC = [
+    "steps",
+    "finish",
+    `--file=${STATUS}`,
+    "--workflow=build",
+    "--step=build-branch-sync",
+    "--artifact=logs/verify-1.md",
+    "--message=m",
+  ];
+
+  /** A repo whose committed built.txt equals source.txt, then source.txt is edited (the agent's last edit), leaving built.txt stale. */
+  function stale(generate: string | undefined, hook = STALE_HOOK) {
+    const cwd = repo();
+    const scripts: Record<string, string> = {};
+    if (generate !== undefined) scripts["bkit:generate"] = generate;
+    write(cwd, "package.json", `${JSON.stringify({ name: "x", scripts }, null, 2)}\n`);
+    write(cwd, "source.txt", "v1\n");
+    write(cwd, "built.txt", "v1\n");
+    write(cwd, STATUS, SEED);
+    git(cwd, "add", "-A");
+    git(cwd, "commit", "-q", "-m", "base");
+    write(
+      cwd,
+      "logs/execute-1-log.md",
+      "Verdict: PASS\n\n<!-- verdict:end -->\n\n# Build Plan\n\nDONE — TASK 1: added\n",
+    );
+    write(
+      cwd,
+      "logs/remediate-1-log.md",
+      "Verdict: PASS\nStrategy: STANDARD\nFixed: 1\n\n<!-- verdict:end -->\n\n# Plan Gaps\n",
+    );
+    write(cwd, "source.txt", "v2\n");
+    fs.mkdirSync(path.join(cwd, ".git/hooks"), { recursive: true });
+    write(cwd, ".git/hooks/pre-commit", hook);
+    fs.chmodSync(path.join(cwd, ".git/hooks/pre-commit"), 0o755);
+    return cwd;
+  }
+  const COPY = "cp source.txt built.txt && echo ran >> generate-ran.txt";
+
+  it("a code step finish builds the declared bkit:generate output first, so a stale-output hook lets the commit through", async () => {
+    const cwd = stale(COPY);
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(0);
+    expect(r.json.generate).toBe("ran");
+    expect(git(cwd, "show", "HEAD:built.txt")).toBe("v2");
+    expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).toContain("built.txt");
+  });
+
+  it("the gaps-remediate and holistic steps build the output too", async () => {
+    const cwd = stale(COPY);
+    const r = await run(cwd, REMEDIATE);
+    expect(r.code).toBe(0);
+    expect(r.json.generate).toBe("ran");
+    expect(git(cwd, "show", "HEAD:built.txt")).toBe("v2");
+    write(cwd, "source.txt", "v3\n");
+    const h = await run(cwd, HOLISTIC);
+    expect(h.code).toBe(0);
+    expect(h.json.generate).toBe("ran");
+    expect(git(cwd, "show", "HEAD:built.txt")).toBe("v3");
+  });
+
+  it("a repo with no bkit:generate script runs nothing and a stale-output hook still exits 8", async () => {
+    const cwd = stale(undefined);
+    const r = await run(cwd, EXECUTE);
+    expect(r.json.generate).toBe("undeclared");
+    expect(r.code).toBe(8);
+    expect(fs.readFileSync(path.join(cwd, "built.txt"), "utf-8")).toBe("v1\n");
+  });
+
+  it("an empty bkit:generate script counts as undeclared", async () => {
+    const cwd = stale("");
+    const r = await run(cwd, EXECUTE);
+    expect(r.json.generate).toBe("undeclared");
+    expect(r.code).toBe(8);
+    expect(fs.existsSync(path.join(cwd, "generate-ran.txt"))).toBe(false);
+  });
+
+  it("a step that is not a code step never runs bkit:generate", async () => {
+    const cwd = stale(COPY, "#!/bin/sh\nexit 0\n");
+    const r = await run(cwd, SYNC);
+    expect(r.code).toBe(0);
+    expect(r.json.generate).toBeNull();
+    expect(fs.existsSync(path.join(cwd, "generate-ran.txt"))).toBe(false);
+    expect(fs.readFileSync(path.join(cwd, "built.txt"), "utf-8")).toBe("v1\n");
+  });
+
+  it("a failing bkit:generate exits 16 with nothing written and nothing committed", async () => {
+    const cwd = stale("echo generate-boom >&2; exit 3");
+    const head = git(cwd, "rev-parse", "HEAD");
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(16);
+    expect(r.err).toContain("generate-boom");
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
+    expect(fs.readFileSync(path.join(cwd, STATUS), "utf-8")).toBe(SEED);
+  });
+
+  it("a hook refusal about something else stays exit 8 after bkit:generate ran", async () => {
+    const cwd = stale(COPY, OTHER_HOOK);
+    const head = git(cwd, "rev-parse", "HEAD");
+    const r = await run(cwd, EXECUTE);
+    expect(r.json.generate).toBe("ran");
+    expect(r.code).toBe(8);
+    expect(r.err).toContain("unrelated refusal");
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
+  });
+
+  it("--commit=none does not run bkit:generate", async () => {
+    const cwd = stale(COPY);
+    const r = await run(cwd, [...EXECUTE, "--commit=none"]);
+    expect(r.code).toBe(0);
+    expect(r.json.generate).toBeNull();
+    expect(fs.existsSync(path.join(cwd, "generate-ran.txt"))).toBe(false);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index 106527c63..887e28565 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -10,6 +10,7 @@
 // headers, derive the attempt, check what the gate checks, write the row, commit,
 // and print the step's tracker comment.
 
+import { spawnSync } from "node:child_process";
 import * as fs from "node:fs";
 import * as path from "node:path";
 
@@ -27,6 +28,7 @@ import {
 import { clampLogPath, readRecords } from "../../ledgers/clamp-log.js";
 import { appendFrictionRow, frictionRow, journalEnabled } from "../../ledgers/journal.js";
 import { resolveRepoSlug } from "../../ledgers/telemetry.js";
+import { scriptCommand } from "../../shared/package-manager.js";
 import { getPromptsRoot } from "../../shared/package-roots.js";
 import { readTextFile } from "../../shared/json.js";
 import {
@@ -87,6 +89,7 @@ import {
   blockedTests,
   PLAN_TASKS_STEP,
   readTestFirst,
+  resolveGate,
   runPlanPath,
   sameTestName,
   touchedTests,
@@ -139,6 +142,8 @@ export const EXIT_LATER_ATTEMPT = 12;
 export const EXIT_WORKFLOWS_CHANGED = 13;
 /** finish (build plan-tests): the tests step's commit changes a file that is not one of the group's planned tests. */
 export const EXIT_SOURCE_TOUCHED = 15;
+/** finish (build code step): the repo's declared `bkit:generate` exited non-zero before the commit. */
+export const EXIT_GENERATE_FAILED = 16;
 
 /** The step whose subagent writes the group's TEST FIRST tests, before any task code. */
 export const PLAN_TESTS_STEP = "build-plan-tests";
@@ -147,6 +152,13 @@ export const PLAN_REMEDIATE_STEP = "build-plan-gaps-remediate";
 /** The step whose subagent closes the whole-feature verification gaps, across every group. */
 export const PLAN_REMEDIATE_HOLISTIC_STEP = "build-plan-gaps-remediate-holistic";
 
+/** The build code steps: each edits sources and its commit carries the repo's generated output. */
+const CODE_STEPS: ReadonlySet<string> = new Set([
+  PLAN_TASKS_STEP,
+  PLAN_REMEDIATE_STEP,
+  PLAN_REMEDIATE_HOLISTIC_STEP,
+]);
+
 /** Where `finish` puts the derived attempt in `--artifact` / `--message` / `--clamp-log`. */
 export const ATTEMPT_TOKEN = "<attempt>";
 /** Where `finish` puts the first `DONE` line's description in `--message`. */
@@ -1408,12 +1420,34 @@ async function finish(ctx: RunContext): Promise<number> {
   // A code step never edits a planned test case: each one's own lines must still be the
   // lines the group's tests step recorded at its red. Every other edit to the file is
   // ordinary code-step work the verifier reads in the diff. The holistic fix spans every group.
-  if (
-    workflow === "build" &&
-    (step === PLAN_TASKS_STEP ||
-      step === PLAN_REMEDIATE_STEP ||
-      step === PLAN_REMEDIATE_HOLISTIC_STEP)
-  ) {
+  // A code step's commit carries the repo's generated output: run the declared `bkit:generate`
+  // first, so the lock, the workflows check and the commit all judge the committed tree.
+  let generate: "ran" | "undeclared" | null = null;
+  if (workflow === "build" && CODE_STEPS.has(step) && commit === "auto") {
+    const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
+    if (resolveGate(top, ["bkit:generate"]) === null) generate = "undeclared";
+    else {
+      const argv = scriptCommand("bkit:generate");
+      const res = spawnSync(argv[0]!, argv.slice(1), {
+        cwd: top,
+        encoding: "utf-8",
+        stdio: ["ignore", "pipe", "pipe"],
+        maxBuffer: 1 << 26,
+      });
+      if (res.status !== 0) {
+        ctx.log(
+          `${argv.join(" ")} exited ${String(res.status ?? res.error?.message)}: fix it, then finish again (nothing written)`,
+        );
+        const out = `${res.stdout ?? ""}${res.stderr ?? ""}`.trim();
+        if (out !== "") for (const line of out.split("\n").slice(-20)) ctx.log(`  ${line}`);
+        ctx.emit({ pass: false, generate: "failed" });
+        return EXIT_GENERATE_FAILED;
+      }
+      generate = "ran";
+    }
+  }
+
+  if (workflow === "build" && CODE_STEPS.has(step)) {
     const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
     const planArg = str(f.plan);
     const planFile =
@@ -1794,6 +1828,7 @@ async function finish(ctx: RunContext): Promise<number> {
     commit: written.commit,
     ...(written.progressLine === undefined ? {} : { progressLine: written.progressLine }),
     pass,
+    generate,
     checks,
     comment,
     // Written after the step's commit, so the commit never carries it.
@@ -1961,7 +1996,7 @@ export const stepsCommand: CommandSpec = {
     },
     finish: {
       summary:
-        "End a step: read the verdict header(s), derive the attempt, check the gate, write the row, commit, print the tracker comment. Exit 11 on a build tests step that changed an earlier task's recorded test no open task of the group names, and on a code step that changed a planned test; for each BLOCKED test a ticked task owns, a code step first adds a takeover task to the plan and its build-takeover row, and prints them under contradicts.",
+        "End a step: read the verdict header(s), derive the attempt, check the gate, write the row, commit, print the tracker comment; a build code step first runs a declared bkit:generate. Exit 11 on a build tests step that changed an earlier task's recorded test no open task of the group names, and on a code step that changed a planned test; for each BLOCKED test a ticked task owns, a code step first adds a takeover task to the plan and its build-takeover row, and prints them under contradicts.",
       use: "workflow",
       flags: [
         { ...FILE_FLAG, help: "path to status.jsonl (created if absent)" },
@@ -2098,6 +2133,8 @@ export const stepsCommand: CommandSpec = {
         row: "the appended step-done row",
         parentSha: "the row's parentSha: HEAD before the step's commit",
         commit: "the new commit's sha, or null with --commit=none",
+        generate:
+          "a build code step's `bkit:generate`: ran, undeclared, failed (exit 16), or null (not a code step, or --commit=none)",
         pass: "every gate check passed",
         progressLine: "the exact chat progress line after a successful numbered completion",
         checks: "[{check, ok, detail}] per gate check",
@@ -2143,6 +2180,8 @@ export const stepsCommand: CommandSpec = {
           "the commit would change bkit.workflows in package.json (`changed` names the keys) (nothing written)",
         [EXIT_SOURCE_TOUCHED]:
           "build plan-tests: the tests step changed a file no TEST FIRST line of the group's open tasks names, or added one a CREATE line of the plan names (`source`) (nothing written)",
+        [EXIT_GENERATE_FAILED]:
+          "build code step: the repo's declared `bkit:generate` exited non-zero (its last 20 lines are logged) (nothing written)",
       },
       run: finish,
     },
diff --git a/.bkit/version b/.bkit/version
index 459f30d67..57e59dacf 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -211,7 +211,7 @@
     ".bkit/providers.md": "cd84350a719e69837d96a698fe5597f98c79785d3e4079cb1867fbcf4901430e",
     ".bkit/prompts.md": "194175488cbeed73d3d8a92bc6d2b50efa6ad2c8cda691213056fdbbdcecf4ab",
     ".bkit/trackers.md": "489175623dcfeb76714039dd334024797f1a3a22fd57be1ea2ca7c06f32f9623",
-    ".bkit/workflows.md": "b827a703769505103079c703bebea95d15ce93278f66126160d10c92e59c77c5",
+    ".bkit/workflows.md": "d0ca6536bd7eaf83286701e395880d8457cf71f6dee733c062eda99c1ea2976c",
     ".bkit/README.md": "76da76193945362dbf7908c9ede6ffc456f783218c110e6ad98d0e737475d98a",
     ".cursor/rules/bkit-rules.mdc": "36782c0c77a3eabb5a89b82804465d9960ecc7bc4962531fdef9f5c5be07e84d",
     ".claude/hooks/bkit-gateguard.cjs": "ae6358523d8033cf3ccdb6bb306e91f3feaa702effd8b73ecd838c1ace04fa87",
@@ -251,7 +251,7 @@
     ".codex/hooks/bkit-rules.cjs": "65d998bd5f0299d1eaf33cd18110894f3c4cb95998698c9ccbfc63baec796df8",
     ".opencode/plugin/bkit-rules.js": "02bc8a76a4d1ec4f3fd23f299047270914c72662570964fa22894a7e0e0b04e8",
     ".bkit/router.md": "77538e88a48383850f5ebe0835bc4b80d3b33117c7fa72e49b98faba079d2ef5",
-    ".bkit/cli.md": "17b3583192967971b13051b4cc95fc72e80e9861df399a6dea95aa206a70d859",
+    ".bkit/cli.md": "3542a8b22156e47214c79f9e034176856d76c7bb6952ab28391b53975ead253a",
     ".claude/agents/bkit-build-plan-tests.md": "e4c22cfb4973eb332139aaa698924f3fc39d938b2fdbe45b848881b9c1699434",
     ".cursor/agents/bkit-build-plan-tests.md": "c1f77dee3a5bfdcf3df077b7ddeb2a6f393ec518c884e99a8db3c177b5549dba",
     ".opencode/agents/bkit-build-plan-tests.md": "de624000ba6c0f9c5b55c498f0680ccf8bff9950b9511b44c3d85171e0309b7b",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index a697a2da9..65356820e 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -1747,7 +1747,7 @@ Dependency inspection: `bkit:deps:outdated` / `bkit:deps:audit` exist so prompts
 `bkit:generate` is not a gate either: it rewrites every generated file and saved baseline (snapshots, coverage lists, generated docs) from the current working tree, in place, so a commit never carries code whose generated output is stale.
 
 - **Contract:** no arguments; idempotent, so a second run changes nothing; exit 0 on success, non-zero on failure.
-- **Callers:** `@bkit-build-plan-tasks` and `@bkit-build-plan-gaps-remediate` run it once after their last change, before the step's commit; `bkit branches sync --merge-docs` (build Step 3), `bkit branches sync --merge` (ship Step 4) and `bkit branches push` run it after they merge `origin/dev`; `bkit branches regenerate` runs it in ship Step 10's regenerate round. Each commits only the paths `bkit:generate` changed, so uncommitted work already in the tree stays out, and refuses when it changed a path that already held uncommitted changes.
+- **Callers:** `@bkit-build-plan-tasks` and `@bkit-build-plan-gaps-remediate` run it once after their last change, before the step's commit, and `bkit steps finish` runs it again before the commit of each build code step (exit 16 when it fails); `bkit branches sync --merge-docs` (build Step 3), `bkit branches sync --merge` (ship Step 4) and `bkit branches push` run it after they merge `origin/dev`; `bkit branches regenerate` runs it in ship Step 10's regenerate round. Each commits only the paths `bkit:generate` changed, so uncommitted work already in the tree stays out, and refuses when it changed a path that already held uncommitted changes.
 - **Undeclared:** every caller skips it.
 
 Not seeded, because which files a stack generates is the stack's business. A regenerated baseline is never a `TEST FIRST` test: regenerating it makes it pass, so it cannot fail first.
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index 8fa50c4a0..d80d416fb 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -9,12 +9,14 @@
 // saying it did. `finish` is the whole step ending in one call: read the verdict
 // headers, derive the attempt, check what the gate checks, write the row, commit,
 // and print the step's tracker comment.
+import { spawnSync } from "node:child_process";
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { actionKey, activeDoneSteps, allRunsDoneSteps, appendLine, ciRoundMatches, runNumber, runOrStepField, statusTimestamp, } from "../../ledgers/status.js";
 import { clampLogPath, readRecords } from "../../ledgers/clamp-log.js";
 import { appendFrictionRow, frictionRow, journalEnabled } from "../../ledgers/journal.js";
 import { resolveRepoSlug } from "../../ledgers/telemetry.js";
+import { scriptCommand } from "../../shared/package-manager.js";
 import { getPromptsRoot } from "../../shared/package-roots.js";
 import { readTextFile } from "../../shared/json.js";
 import { CommandError, EXIT, git, isSharedBranch, parseJson, repoRoot, runGit, } from "../lib.js";
@@ -30,7 +32,7 @@ import { readHolder, resolveMonth, workflowLockPath } from "./locks.js";
 import { EXIT_NO_STATUS, FILE_FLAG, GROUP_FLAG, STEP_FLAG, WORKFLOW_FLAG, extraField, nonNegativeInt, positiveInt, readRuns, readStatusRows, readRunsAt, statusFile, str, } from "./status.js";
 import { COMMENT_FILE_OUTPUT, POST_FLAG, TRACKER_OUTPUT, commentFileOf, postForVerb, } from "./tracker.js";
 import { parsePlanBlocks } from "./plan-blocks.js";
-import { blockedTests, PLAN_TASKS_STEP, readTestFirst, runPlanPath, sameTestName, touchedTests, baselineDiff, } from "./tests.js";
+import { blockedTests, PLAN_TASKS_STEP, readTestFirst, resolveGate, runPlanPath, sameTestName, touchedTests, baselineDiff, } from "./tests.js";
 import { addTakeoverTasks } from "./tasks.js";
 import { addAllButCopied } from "./worktrees.js";
 /**
@@ -76,12 +78,20 @@ export const EXIT_LATER_ATTEMPT = 12;
 export const EXIT_WORKFLOWS_CHANGED = 13;
 /** finish (build plan-tests): the tests step's commit changes a file that is not one of the group's planned tests. */
 export const EXIT_SOURCE_TOUCHED = 15;
+/** finish (build code step): the repo's declared `bkit:generate` exited non-zero before the commit. */
+export const EXIT_GENERATE_FAILED = 16;
 /** The step whose subagent writes the group's TEST FIRST tests, before any task code. */
 export const PLAN_TESTS_STEP = "build-plan-tests";
 /** The step whose subagent closes the group's verification gaps: a code step, like plan-execute. */
 export const PLAN_REMEDIATE_STEP = "build-plan-gaps-remediate";
 /** The step whose subagent closes the whole-feature verification gaps, across every group. */
 export const PLAN_REMEDIATE_HOLISTIC_STEP = "build-plan-gaps-remediate-holistic";
+/** The build code steps: each edits sources and its commit carries the repo's generated output. */
+const CODE_STEPS = new Set([
+    PLAN_TASKS_STEP,
+    PLAN_REMEDIATE_STEP,
+    PLAN_REMEDIATE_HOLISTIC_STEP,
+]);
 /** Where `finish` puts the derived attempt in `--artifact` / `--message` / `--clamp-log`. */
 export const ATTEMPT_TOKEN = "<attempt>";
 /** Where `finish` puts the first `DONE` line's description in `--message`. */
@@ -1136,10 +1146,34 @@ async function finish(ctx) {
     // A code step never edits a planned test case: each one's own lines must still be the
     // lines the group's tests step recorded at its red. Every other edit to the file is
     // ordinary code-step work the verifier reads in the diff. The holistic fix spans every group.
-    if (workflow === "build" &&
-        (step === PLAN_TASKS_STEP ||
-            step === PLAN_REMEDIATE_STEP ||
-            step === PLAN_REMEDIATE_HOLISTIC_STEP)) {
+    // A code step's commit carries the repo's generated output: run the declared `bkit:generate`
+    // first, so the lock, the workflows check and the commit all judge the committed tree.
+    let generate = null;
+    if (workflow === "build" && CODE_STEPS.has(step) && commit === "auto") {
+        const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
+        if (resolveGate(top, ["bkit:generate"]) === null)
+            generate = "undeclared";
+        else {
+            const argv = scriptCommand("bkit:generate");
+            const res = spawnSync(argv[0], argv.slice(1), {
+                cwd: top,
+                encoding: "utf-8",
+                stdio: ["ignore", "pipe", "pipe"],
+                maxBuffer: 1 << 26,
+            });
+            if (res.status !== 0) {
+                ctx.log(`${argv.join(" ")} exited ${String(res.status ?? res.error?.message)}: fix it, then finish again (nothing written)`);
+                const out = `${res.stdout ?? ""}${res.stderr ?? ""}`.trim();
+                if (out !== "")
+                    for (const line of out.split("\n").slice(-20))
+                        ctx.log(`  ${line}`);
+                ctx.emit({ pass: false, generate: "failed" });
+                return EXIT_GENERATE_FAILED;
+            }
+            generate = "ran";
+        }
+    }
+    if (workflow === "build" && CODE_STEPS.has(step)) {
         const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
         const planArg = str(f.plan);
         const planFile = planArg === undefined
@@ -1471,6 +1505,7 @@ async function finish(ctx) {
         commit: written.commit,
         ...(written.progressLine === undefined ? {} : { progressLine: written.progressLine }),
         pass,
+        generate,
         checks,
         comment,
         // Written after the step's commit, so the commit never carries it.
@@ -1622,7 +1657,7 @@ export const stepsCommand = {
             },
         },
         finish: {
-            summary: "End a step: read the verdict header(s), derive the attempt, check the gate, write the row, commit, print the tracker comment. Exit 11 on a build tests step that changed an earlier task's recorded test no open task of the group names, and on a code step that changed a planned test; for each BLOCKED test a ticked task owns, a code step first adds a takeover task to the plan and its build-takeover row, and prints them under contradicts.",
+            summary: "End a step: read the verdict header(s), derive the attempt, check the gate, write the row, commit, print the tracker comment; a build code step first runs a declared bkit:generate. Exit 11 on a build tests step that changed an earlier task's recorded test no open task of the group names, and on a code step that changed a planned test; for each BLOCKED test a ticked task owns, a code step first adds a takeover task to the plan and its build-takeover row, and prints them under contradicts.",
             use: "workflow",
             flags: [
                 { ...FILE_FLAG, help: "path to status.jsonl (created if absent)" },
@@ -1757,6 +1792,7 @@ export const stepsCommand = {
                 row: "the appended step-done row",
                 parentSha: "the row's parentSha: HEAD before the step's commit",
                 commit: "the new commit's sha, or null with --commit=none",
+                generate: "a build code step's `bkit:generate`: ran, undeclared, failed (exit 16), or null (not a code step, or --commit=none)",
                 pass: "every gate check passed",
                 progressLine: "the exact chat progress line after a successful numbered completion",
                 checks: "[{check, ok, detail}] per gate check",
@@ -1786,6 +1822,7 @@ export const stepsCommand = {
                 [EXIT_LATER_ATTEMPT]: "this run saved an artifact of a later attempt (`later`) than the one finished (nothing written)",
                 [EXIT_WORKFLOWS_CHANGED]: "the commit would change bkit.workflows in package.json (`changed` names the keys) (nothing written)",
                 [EXIT_SOURCE_TOUCHED]: "build plan-tests: the tests step changed a file no TEST FIRST line of the group's open tasks names, or added one a CREATE line of the plan names (`source`) (nothing written)",
+                [EXIT_GENERATE_FAILED]: "build code step: the repo's declared `bkit:generate` exited non-zero (its last 20 lines are logged) (nothing written)",
             },
             run: finish,
         },
diff --git a/docs/deployments.md b/docs/deployments.md
index 801cdb789..05e0d748f 100644
--- a/docs/deployments.md
+++ b/docs/deployments.md
@@ -617,6 +617,7 @@ Gate fails locally → fix + re-stage; do not `--no-verify` or amend over failed
 Source-repo only. Any `.bkit/core/engine/**/*.ts` change MUST include `pnpm build && git add dist/` in same commit.
 
 - `pnpm bkit:check:dist` runs `node scripts/gate/bkit-check-dist.mjs`. It compiles the staged tree (the index), or with `--ref=<commit>` that commit's tree, in a scratch folder under `tmp/`, compares each output's mode and content with the `dist/` of the same tree, and fails when they differ or when the compile writes no file under `dist/`. It leaves the working tree's `dist/` alone.
+- A build code step's `bkit steps finish` runs the repo's `bkit:generate` (which starts with `pnpm build`) before the commit, so the pre-commit `pnpm bkit:check:dist` finds `dist/` current; a hand `pnpm build && git add dist/` is for every other commit.
 - Hooks run `typecheck` + the unit and integration tiers, not `pnpm build`, and never commit a freshened `dist/`; run `pnpm build && git add dist/` by hand.
 - Source-repo pre-commit runs `pnpm bkit:check:dist` when the commit adds, changes, deletes or renames a non-test `.bkit/core/engine/**/*.ts` file. Source-repo pre-push runs it on every push except a min push, with `--ref` of the commit pushed to `dev`, else of the checked-out branch's pushed commit; with neither it reads the index.
 - CI `bkit-tests-static` "Assert Dist Freshness" runs `pnpm bkit:check:dist` — `.github/workflows/bkit-ci.yml` only.
diff --git a/docs/testing.md b/docs/testing.md
index 2dd357fd4..daaa1da13 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -945,7 +945,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `commands/lib.test.ts` | Unit (boundary: real temp git repo + linked worktree) | Flag parsing and usage errors (a literal `{UPPER}` placeholder in any flag or positional value refused, exit 2), the `invocation-context/` folder is `0700` whether created or found, dispatch and classic-verb collision (`bkit status`), help rendering, exit-code mapping, UTC month, skip-CI tokens, repo root from a worktree, `status.jsonl` location per workflow kind, the active run a call is journaled under (`--fid` never matches another feature's run, and finds its own run from an earlier month); the tests-lock status file (`readLockStatus`, `classifyLockOutcome`): a give-up or refusal is read from the file and the exit code alone, a reworded script sentence changes nothing, and an absent, empty or other-lock file reads as a gate result. |
 | `commands/workflow/status.test.ts` | Unit | `bkit status path / route / meta / resume` (debug's resume prints Step 3's test round as `counters derive` and `status route` read it, exit 4 past Step 3 with none): location per workflow kind, active-run verdict / failures, the step's last `parentSha` and `source` per group, all-runs strategy, `nextStrategy` / `repeatTests` from repeated failing tests on the fix step's test step, run-level mode over step mode, `--require` failures, `route --expect=field=value` (exit 4 when it differs or is missing), meta append + validation; the fold skips a row it does not model, a line that is not JSON exits 3; `route --workflow=build` publish: the `publish=true\|false` token over `publish.local`, `local` read on LOCAL, `false` coerced to `true` on any other runtime, an unknown token value falling through to config, and `publishSource` (`token` / `local` / `remote` / `coerced`); `route --step` prints no `cleanBase` field; The engine-only row types `decision-counts` and `decision-answer` are refused by `status row`; `status resume` `gateRerun` true (with `rerunFrom` the `From` header, `holistic` included) only for the active run's `OPEN` `Gate: FAIL` pause whose loop question is its only undecided question (the pause may be laid out in two files), false when another question is undecided, the pause is closed or no run is active; a verify, holistic, tests or fix-step pause written before `decisions counts` ran resumes exactly as a run with no file does (Step 8, 10 or 12, or Step 8 after `build-plan-gaps-remediate` and Step 7 after `build-plan-gaps-remediate-holistic`), with `counters derive --step=build-decision --position=next` still on the same decision number. |
 | `commands/workflow/counters.test.ts` | Unit | `bkit counters derive / run / route / max`: the three positions, `current` refusing 0, active-run scoping, group isolation (empty `--group` rejected), `--all-runs`, de-dupe, metacharacter step names, run numbering incl. resume + interleave (a resumed build after an interleaved debug run keeps its run and budget), fail-closed value / max (max 0: value 0 continues, value 1 routes to `exceeded`), `--point` (limit and `ask`, `max --point`), `route --of=<step>:<pos>` deriving the value (group scoped, `current` with no own row → exit 4), `route --of=<step>,<step>:count` summing several steps (off `:count`, repeated or empty entry → exit 2), `--of` plus `--rows` summed; holistic fix rounds counted within the run with no reset after a clean check (`build.holistic`, falling back to the current `package.json` setting when the run's frozen limits lack it); `--since-clean` refused on `route` and `grant` as an unknown flag (exit 2). |
-| `commands/workflow/steps.test.ts` | Unit (boundary: real temp git repo + failing pre-commit hook) | `bkit steps done / verdict / gate`: `parentSha` captured before the commit, `--attempt=next`, `--attempt=0` written, `--commit=none`, extra fields, artifact / verdict / failures / strategy validation, a complexity `verdict` from the agent's own set, a PR URL in `artifacts`, `timeout_s` kept, commit failure exit (8: row rolled back and the index restored byte-for-byte — a pre-staged status.jsonl, a partly staged file, a caller-staged path a bracketed new path glob-matches, a status.jsonl the hook removed; 82: another writer's row appended during the commit stays), header parse + PENDING / missing / invalid exits, allowed values from the prompt's `Verdict:` line, gate pass + each failing check, gate failing a row missing its `attempt` / `strategy` / `scope` (a `build-holistic-gate` row without `scope` refused), `ROW_FIELDS` held to every workflow `steps done` / `steps finish` call (an `--agent` whose prompt declares `Strategy` counts). `bkit steps finish`: header read, each declared count rule checked against the report body (a wrong count or missing verdict is refused and handed back to its writer), attempt derived and `<attempt>` filled, row + commit + comment; PENDING (5) / missing declared field (6) re-ask with nothing written; a row missing a gate field refused before writing; worst verdict + summed failures across agents, a `true \| false` field true when any agent sets it; header `Strategy` on the row; `--count-field`; `<done>` + fallback; `--docs-only` (9). `bkit steps stub` (`--strip-header`, missing source 4). Gate `--placeholder` without a status file, `--fid` shape, `--attempt-of`, `--ref` reading the file as committed on a ref (3 when the ref lacks it). `steps finish` locks a recorded red test only while a `TEST FIRST` line in the run's plan (beside its status file, `runPlanPath`) still names it; a name the plan dropped locks nothing. `steps finish --step=build-decision --field=route=continue` refuses (exit 1, no row) a decision file `decisions skip` would refuse. |
+| `commands/workflow/steps.test.ts` | Unit (boundary: real temp git repo + failing pre-commit hook) | `bkit steps done / verdict / gate`: `parentSha` captured before the commit, `--attempt=next`, `--attempt=0` written, `--commit=none`, extra fields, artifact / verdict / failures / strategy validation, a complexity `verdict` from the agent's own set, a PR URL in `artifacts`, `timeout_s` kept, commit failure exit (8: row rolled back and the index restored byte-for-byte — a pre-staged status.jsonl, a partly staged file, a caller-staged path a bracketed new path glob-matches, a status.jsonl the hook removed; 82: another writer's row appended during the commit stays), header parse + PENDING / missing / invalid exits, allowed values from the prompt's `Verdict:` line, gate pass + each failing check, gate failing a row missing its `attempt` / `strategy` / `scope` (a `build-holistic-gate` row without `scope` refused), `ROW_FIELDS` held to every workflow `steps done` / `steps finish` call (an `--agent` whose prompt declares `Strategy` counts). `bkit steps finish`: header read, each declared count rule checked against the report body (a wrong count or missing verdict is refused and handed back to its writer), attempt derived and `<attempt>` filled, row + commit + comment; PENDING (5) / missing declared field (6) re-ask with nothing written; a row missing a gate field refused before writing; worst verdict + summed failures across agents, a `true \| false` field true when any agent sets it; header `Strategy` on the row; `--count-field`; `<done>` + fallback; `--docs-only` (9). `bkit steps stub` (`--strip-header`, missing source 4). Gate `--placeholder` without a status file, `--fid` shape, `--attempt-of`, `--ref` reading the file as committed on a ref (3 when the ref lacks it). `steps finish` locks a recorded red test only while a `TEST FIRST` line in the run's plan (beside its status file, `runPlanPath`) still names it; a name the plan dropped locks nothing. `steps finish --step=build-decision --field=route=continue` refuses (exit 1, no row) a decision file `decisions skip` would refuse. A build code step's `steps finish` runs the repo's `bkit:generate` before the commit: declared (a stale-output hook lets the commit through), undeclared and empty (nothing runs, the hook still exits 8), not a code step, failing (exit 16, no row, no commit), an unrelated hook refusal (still 8), `--commit=none` (nothing runs). |
 | `commands/workflow/runtime.test.ts` | Unit (fake `gh` on `PATH`) | `bkit runtime detect / row / assert` — see § Runtime detection. |
 | `commands/workflow/repo.test.ts` | Unit (boundary: real temp git repo) | `bkit repo info`: owner / repo from `gh`, else the origin remote; neither → exit 3; detached HEAD → exit 4 unless `--allow-detached`; `behindDev` / `divergedAgo`, null (never a false 0) when `origin/dev` is unknown; `--fetch` failure logged, not fatal; `repoRoot` / `bkit` / `outboxRoot` name the main checkout from a worktree too; `sessionDir` is a new empty `sessions/<utc-time>-<random>/` folder per call, with name-stamped folders older than 7 days pruned; `bkitVersion` / `bkitLatest` / `bkitOutdated` / `bkitAdvisory` from a seeded cache: advisory printed when the pin is older, quiet when current or ahead, null (never an error) on a remembered registry failure or an unpinned repo; `buildPublishRemote` / `buildPublishLocal` printed, with the defaults when `package.json` omits them. |
 | `shared/bkit-latest.test.ts` | Unit (boundary: temp dirs, fake `pnpm` on PATH) | Outdated-bkit check: `compareSemver` numeric order (5.10.0 > 5.9.0) and prerelease order; unpinned and `BKIT_NO_UPDATE_CHECK` skip the registry (`0` does not); one lookup per day, a failed lookup remembered for an hour, corrupt / future-dated cache rewritten, no git dir → no cache; `lookupLatestPublished` null on a pnpm failure, non-version output, or no pnpm. |
