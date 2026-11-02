diff --git a/.bkit/cli.md b/.bkit/cli.md
index 8ea6d16c5..3d8e25d8c 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -154,7 +154,7 @@ Attempt counters derived from status.jsonl, and the ask points' limits.
 | `run` | workflow | **`--file`** **`--workflow`** | Which run of the workflow this invocation is (1-based; a resume keeps its number). |
 | `route` | workflow | **`--name`** `--value` `--of` `--rows` `--file` `--workflow` `--group` `--all-runs` `--max` `--point` `--continue` `--exceeded` | Compare a counter to its max: exit 0 continue, exit 1 exceeded; with --point, also whether to ask. |
 | `grant` | workflow | **`--name`** `--value` `--of` `--rows` `--file` `--workflow` `--group` `--all-runs` **`--point`** | Give one loop one more full allowance after the owner chose to continue at its used-up limit: exit 0 granted, exit 1 not (below the limit, ask off or headless). |
-| `max` | workflow | `--point` `--file` `--workflow` | The ask points' limits and ask settings: one by --point, or all. |
+| `max` | workflow | `--point` `--file` `--workflow` `--group` | The ask points' limits and ask settings: one by --point, or all. |
 | `progress` | workflow | **`--file`** **`--workflow`** **`--check`** **`--fix`** `--group` | Progress report for a fix loop in the active run: counts per round, code change, strategy, trend. |
 | `rows` | workflow | **`--file`** **`--workflow`** **`--type`** **`--position`** | Count rows of one audit type in the active run (since its workflow-started row). |
 
@@ -346,7 +346,7 @@ Write a step's status row, finish a step in one call, read a verdict header, che
 | `done` | workflow | **`--file`** **`--workflow`** **`--step`** `--status` `--verdict` `--agent` `--allowed` `--failures` `--attempt` `--group` `--strategy` `--artifact` `--field` `--parent-sha` `--commit` `--message` | Append a step-done row and commit it (parentSha captured first). |
 | `finish` | workflow | **`--file`** **`--workflow`** **`--step`** `--artifact` `--optional-artifact` `--agent` `--verdict` `--allowed` `--failures` `--attempt` `--attempt-of` `--count-field` `--group` `--strategy` `--scope` `--field` `--clamp-log` `--docs-only` `--plan` `--parent-sha` `--commit` `--message` `--done-fallback` `--verbose-ci-local` `--number` `--title` `--post` `--group-count` `--link-ref` `--tree` `--owner-repo` `--comment-body` `--comment-field` | End a step: read the verdict header(s), derive the attempt, check the gate, write the row, commit, print the tracker comment. |
 | `verdict` | by hand | **`--file`** `--agent` `--allowed` `--field` | Read an artifact's header down to <!-- verdict:end -->. |
-| `gate` | workflow | `--file` `--ref` **`--workflow`** **`--step`** `--group` `--attempt` `--attempt-of` `--artifact` `--verdict-required` `--agent` `--allowed` `--placeholder` `--fid` `--issue` `--month` `--token` | Mechanical gate checks for one step: placeholders, FID, lock, artifacts, verdict, status row (with its attempt / strategy / scope where the step writes them). |
+| `gate` | workflow | `--file` `--ref` **`--workflow`** **`--step`** `--group` `--progress-number` `--attempt` `--attempt-of` `--artifact` `--verdict-required` `--agent` `--allowed` `--placeholder` `--fid` `--issue` `--month` `--token` | Mechanical gate checks for one step: placeholders, FID, lock, artifacts, verdict, status row (with its attempt / strategy / scope where the step writes them). |
 | `stub` | workflow | **`--from`** **`--to`** `--strip-header` | Seed a versioned artifact: copy the prior version, then put a PENDING verdict header on top. |
 
 ### `tasks`
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 657b2f4b8..cd4d622dd 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -154,7 +154,7 @@ Attempt counters derived from status.jsonl, and the ask points' limits.
 | `run` | workflow | **`--file`** **`--workflow`** | Which run of the workflow this invocation is (1-based; a resume keeps its number). |
 | `route` | workflow | **`--name`** `--value` `--of` `--rows` `--file` `--workflow` `--group` `--all-runs` `--max` `--point` `--continue` `--exceeded` | Compare a counter to its max: exit 0 continue, exit 1 exceeded; with --point, also whether to ask. |
 | `grant` | workflow | **`--name`** `--value` `--of` `--rows` `--file` `--workflow` `--group` `--all-runs` **`--point`** | Give one loop one more full allowance after the owner chose to continue at its used-up limit: exit 0 granted, exit 1 not (below the limit, ask off or headless). |
-| `max` | workflow | `--point` `--file` `--workflow` | The ask points' limits and ask settings: one by --point, or all. |
+| `max` | workflow | `--point` `--file` `--workflow` `--group` | The ask points' limits and ask settings: one by --point, or all. |
 | `progress` | workflow | **`--file`** **`--workflow`** **`--check`** **`--fix`** `--group` | Progress report for a fix loop in the active run: counts per round, code change, strategy, trend. |
 | `rows` | workflow | **`--file`** **`--workflow`** **`--type`** **`--position`** | Count rows of one audit type in the active run (since its workflow-started row). |
 
@@ -346,7 +346,7 @@ Write a step's status row, finish a step in one call, read a verdict header, che
 | `done` | workflow | **`--file`** **`--workflow`** **`--step`** `--status` `--verdict` `--agent` `--allowed` `--failures` `--attempt` `--group` `--strategy` `--artifact` `--field` `--parent-sha` `--commit` `--message` | Append a step-done row and commit it (parentSha captured first). |
 | `finish` | workflow | **`--file`** **`--workflow`** **`--step`** `--artifact` `--optional-artifact` `--agent` `--verdict` `--allowed` `--failures` `--attempt` `--attempt-of` `--count-field` `--group` `--strategy` `--scope` `--field` `--clamp-log` `--docs-only` `--plan` `--parent-sha` `--commit` `--message` `--done-fallback` `--verbose-ci-local` `--number` `--title` `--post` `--group-count` `--link-ref` `--tree` `--owner-repo` `--comment-body` `--comment-field` | End a step: read the verdict header(s), derive the attempt, check the gate, write the row, commit, print the tracker comment. |
 | `verdict` | by hand | **`--file`** `--agent` `--allowed` `--field` | Read an artifact's header down to <!-- verdict:end -->. |
-| `gate` | workflow | `--file` `--ref` **`--workflow`** **`--step`** `--group` `--attempt` `--attempt-of` `--artifact` `--verdict-required` `--agent` `--allowed` `--placeholder` `--fid` `--issue` `--month` `--token` | Mechanical gate checks for one step: placeholders, FID, lock, artifacts, verdict, status row (with its attempt / strategy / scope where the step writes them). |
+| `gate` | workflow | `--file` `--ref` **`--workflow`** **`--step`** `--group` `--progress-number` `--attempt` `--attempt-of` `--artifact` `--verdict-required` `--agent` `--allowed` `--placeholder` `--fid` `--issue` `--month` `--token` | Mechanical gate checks for one step: placeholders, FID, lock, artifacts, verdict, status row (with its attempt / strategy / scope where the step writes them). |
 | `stub` | workflow | **`--from`** **`--to`** `--strip-header` | Seed a versioned artifact: copy the prior version, then put a PENDING verdict header on top. |
 
 ### `tasks`
diff --git a/.bkit/core/engine/commands/workflow/context.ts b/.bkit/core/engine/commands/workflow/context.ts
index 549f49821..9ec698e27 100644
--- a/.bkit/core/engine/commands/workflow/context.ts
+++ b/.bkit/core/engine/commands/workflow/context.ts
@@ -1801,6 +1801,8 @@ export const contextCommand: CommandSpec = {
           "those records totalled per context: artifacts written, lines and bytes fetched -> kept, and how many were written as a table vs raw",
         row: "--record: the step-done row written, else null",
         commit: "--record: the new commit's sha, else null",
+        progressLine:
+          "--record: the exact chat progress line after a successful numbered completion",
         comment:
           "the step comment (with --number): verdict, contexts, artifact links, a NOT CONFIGURED line per context with no block; else null",
         commentFile: COMMENT_FILE_OUTPUT,
@@ -1833,7 +1835,7 @@ export const contextCommand: CommandSpec = {
         );
         const clampSummary = summariseRecords(clamped);
         const verdict = artifacts.length > 0 ? "PASS" : "FAIL";
-        let written: { row: Record<string, unknown>; commit: string | null; code: number } = {
+        let written: ReturnType<typeof writeStepRow> = {
           row: {},
           commit: null,
           code: EXIT.OK,
@@ -1888,6 +1890,7 @@ export const contextCommand: CommandSpec = {
           clampSummary,
           row: record ? written.row : null,
           commit: written.commit,
+          ...(written.progressLine === undefined ? {} : { progressLine: written.progressLine }),
           comment,
           commentFile: commentFileOf(ctx.cwd, comment),
         });
diff --git a/.bkit/core/engine/commands/workflow/counters.ts b/.bkit/core/engine/commands/workflow/counters.ts
index fb751070f..8b25147c7 100644
--- a/.bkit/core/engine/commands/workflow/counters.ts
+++ b/.bkit/core/engine/commands/workflow/counters.ts
@@ -194,6 +194,19 @@ export function grantCount(
     ).length;
 }
 
+/** A loop's frozen allowance, including the owner's saved grants; absent for legacy runs. */
+export function savedPointLimit(
+  file: string,
+  workflow: string,
+  point: AskPoint,
+  group?: number,
+): number | undefined {
+  const setting = frozenAskSetting(file, workflow, point);
+  return setting === undefined
+    ? undefined
+    : setting.max * (1 + grantCount(file, workflow, point, group, false));
+}
+
 /** `route --rows=<type>:count`: rows of that type in the active run. */
 function derivedRows(ctx: RunContext): number {
   const [type, position] = String(ctx.flags.rows).split(":");
@@ -541,6 +554,7 @@ export const countersCommand: CommandSpec = {
           help: "status.jsonl: with --point and --workflow, the limit as the active run's workflow-started row froze it",
         },
         { ...WORKFLOW_FLAG, required: false, help: "workflow, with --file" },
+        GROUP_FLAG,
       ],
       output: {
         value: "the point's limit (with --point)",
diff --git a/.bkit/core/engine/commands/workflow/progress.integration.test.ts b/.bkit/core/engine/commands/workflow/progress.integration.test.ts
new file mode 100644
index 000000000..a5bca3628
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/progress.integration.test.ts
@@ -0,0 +1,583 @@
+import { spawnSync } from "node:child_process";
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+
+import { afterEach, describe, expect, it, vi } from "vitest";
+
+import { runCommand } from "../lib";
+import { COMMANDS } from "../registry";
+
+vi.setConfig({ testTimeout: 30_000 });
+
+const FID = "825-progress";
+const MONTH = "202611";
+const LOG = `docs/plans/${MONTH}/logs/${FID}`;
+const STATUS = `${LOG}/status.jsonl`;
+const PLAN = `docs/plans/${MONTH}/${FID}-plan.md`;
+const dirs: string[] = [];
+let tick = 0;
+const at = () => new Date(Date.UTC(2026, 10, 1, 0, 0, tick++)).toISOString();
+const jsonl = (rows: object[]) => rows.map((row) => `${JSON.stringify(row)}\n`).join("");
+const git = (cwd: string, ...args: string[]) => {
+  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
+  if (result.error || result.status !== 0) throw new Error(result.error?.message ?? result.stderr);
+  return result.stdout.trim();
+};
+const write = (cwd: string, file: string, body: string) => {
+  fs.mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true });
+  fs.writeFileSync(path.join(cwd, file), body);
+};
+const rowsOf = (cwd: string): Record<string, unknown>[] =>
+  fs
+    .readFileSync(path.join(cwd, STATUS), "utf8")
+    .split("\n")
+    .filter(Boolean)
+    .map((line) => JSON.parse(line));
+const domainRows = (cwd: string) => rowsOf(cwd).filter((row) => row.type !== "engine-call");
+const started = (workflow: string, limits: Record<string, { ask: boolean; max: number }> = {}) => ({
+  type: "workflow-started",
+  workflow,
+  at: at(),
+  limits,
+});
+const completed = (cwd: string, workflow: string, step: string, extra: object = {}) => ({
+  type: "step-done",
+  workflow,
+  step,
+  status: "DONE",
+  at: at(),
+  parentSha: git(cwd, "rev-parse", "HEAD"),
+  artifacts: [],
+  ...extra,
+});
+
+function repo(workflow = "build", limits: Record<string, { ask: boolean; max: number }> = {}) {
+  const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-progress-")));
+  dirs.push(cwd);
+  git(cwd, "init", "-q", "-b", `feat/${FID}`);
+  git(cwd, "config", "user.email", "test@example.invalid");
+  git(cwd, "config", "user.name", "test");
+  git(cwd, "commit", "-q", "--allow-empty", "-m", "init");
+  write(
+    cwd,
+    "package.json",
+    JSON.stringify({
+      name: "progress-fixture",
+      private: true,
+      bkit: { tracker: { default: "none" } },
+    }),
+  );
+  write(cwd, ".bkit/version", JSON.stringify({ pinnedVersion: "6.0.0" }));
+  write(cwd, STATUS, jsonl([started(workflow, limits)]));
+  return cwd;
+}
+
+function plan(cwd: string, groups: number[]) {
+  write(
+    cwd,
+    PLAN,
+    groups
+      .map((group, index) =>
+        [
+          `<!-- bkit:group ${group} start -->`,
+          `### TASK GROUP ${group}: Group ${group}`,
+          `<!-- bkit:task ${index + 1} start -->`,
+          `- [ ] **TASK ${index + 1}:** Implement behavior`,
+          "  - **UPDATE:** `source.ts`: behavior.",
+          "  - **DONE WHEN:** The behavior exists.",
+          "  - **TEST FIRST:** n/a — documentation only.",
+          `<!-- bkit:task ${index + 1} end -->`,
+          `<!-- bkit:group ${group} end -->`,
+        ].join("\n"),
+      )
+      .join("\n\n"),
+  );
+}
+
+async function run(cwd: string, args: string[]) {
+  const out: string[] = [];
+  const err: string[] = [];
+  const code = await runCommand([...args, "--json"], COMMANDS, {
+    cwd,
+    classicVerbs: new Set(),
+    io: { stdout: (text) => out.push(text), stderr: (text) => err.push(text) },
+  });
+  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, out, err: err.join("") };
+}
+
+const doneArgs = (workflow: string, step: string, ...extra: string[]) => [
+  "steps",
+  "done",
+  `--file=${STATUS}`,
+  `--workflow=${workflow}`,
+  `--step=${step}`,
+  "--commit=none",
+  ...extra,
+];
+
+function loopGroup(group?: number) {
+  return group === undefined
+    ? { flags: [], fields: {}, suffix: "" }
+    : { flags: [`--group=${group}`], fields: { group }, suffix: " · Group 1 of 1" };
+}
+
+function shipping() {
+  const cwd = repo("ship");
+  git(cwd, "branch", "-m", "dev");
+  write(cwd, ".gitignore", ".worktrees/\ntmp/\n");
+  git(cwd, "add", "-A");
+  git(cwd, "commit", "-qm", "fixture");
+  const remote = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-progress-remote-")));
+  dirs.push(remote);
+  git(remote, "init", "-q", "--bare");
+  git(cwd, "remote", "add", "origin", remote);
+  git(cwd, "push", "-q", "origin", "dev");
+  const worktree = path.join(cwd, ".worktrees", FID);
+  git(cwd, "worktree", "add", "-q", worktree, "-b", `feat/${FID}`);
+  const outbox = path.join(cwd, ".git", "bkit-outbox", FID);
+  write(cwd, path.relative(cwd, path.join(outbox, ".worktree-owned")), "");
+  return { cwd, remote, worktree, outbox };
+}
+
+function invalidInput(kind: string) {
+  const cwd = repo();
+  const file = path.join(cwd, STATUS);
+  if (kind === "malformed-plan")
+    write(cwd, PLAN, "<!-- bkit:group 1 start -->\n<!-- bkit:task 1 start -->\n");
+  if (kind === "unreadable-plan") fs.mkdirSync(path.join(cwd, PLAN), { recursive: true });
+  if (kind === "malformed-status") fs.appendFileSync(file, "not-json\n");
+  if (kind === "unreadable-status") {
+    fs.rmSync(file);
+    fs.mkdirSync(file);
+    return {
+      cwd,
+      snapshot: () => fs.statSync(file).isDirectory(),
+      journals: () => 0,
+      expectedJournals: 0,
+    };
+  }
+  return {
+    cwd,
+    snapshot: () =>
+      fs
+        .readFileSync(file, "utf8")
+        .split("\n")
+        .filter((line) => !line.includes('"engine-call"'))
+        .join("\n"),
+    journals: () =>
+      fs
+        .readFileSync(file, "utf8")
+        .split("\n")
+        .filter((line) => line.includes('"engine-call"')).length,
+    expectedJournals: kind === "malformed-status" ? 0 : 1,
+  };
+}
+
+afterEach(() => {
+  vi.unstubAllEnvs();
+  for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
+});
+
+describe("workflow progress command wiring", () => {
+  it("progress reads fresh plan groups", async () => {
+    const cwd = repo();
+    plan(cwd, [1, 5]);
+    const first = await run(
+      cwd,
+      doneArgs("build", "build-plan-verify", "--group=5", "--attempt=1"),
+    );
+    expect(first.code).toBe(0);
+    expect(first.json.progressLine).toBe(
+      "Progress: ██████░░░░ 58% · Step 8/16 Plan Verify · Group 2 of 2",
+    );
+    plan(cwd, [1, 5, 9]);
+    const second = await run(
+      cwd,
+      doneArgs("build", "build-plan-verify", "--group=5", "--attempt=1"),
+    );
+    expect(second.code).toBe(0);
+    expect(second.json.progressLine).toBe(
+      "Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Group 2 of 3",
+    );
+    expect(domainRows(cwd).filter((row) => row.type === "step-done")).toHaveLength(2);
+    expect(domainRows(cwd).some((row) => "progressLine" in row)).toBe(false);
+  });
+
+  it("progress resumes from saved run", async () => {
+    const cwd = repo("build", { "build.verify": { ask: true, max: 3 } });
+    plan(cwd, [1, 2, 3]);
+    const saved = jsonl([
+      started("build", { "build.verify": { ask: true, max: 99 } }),
+      completed(cwd, "build", "build-plan-verify", { attempt: 17, group: 2 }),
+      { type: "workflow-done", workflow: "build", at: at() },
+      started("build", { "build.verify": { ask: true, max: 3 } }),
+      completed(cwd, "build", "build-plan-verify", { attempt: 1, group: 2 }),
+    ]);
+    write(cwd, STATUS, saved);
+    const args = doneArgs("build", "build-plan-verify", "--group=2", "--attempt=next");
+    const first = await run(cwd, args);
+    expect(first.code).toBe(0);
+    expect(first.json.progressLine).toBe(
+      "Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Group 2 of 3 · Attempt 2 of 3",
+    );
+    write(cwd, STATUS, saved);
+    write(
+      cwd,
+      "package.json",
+      JSON.stringify({
+        bkit: { workflows: { build: { verify: { ask: true, maxAttempts: 99 } } } },
+      }),
+    );
+    const resumed = await run(cwd, args);
+    expect(resumed.code).toBe(0);
+    expect(resumed.json.progressLine).toBe(first.json.progressLine);
+    expect(resumed.json.row.attempt).toBe(2);
+  });
+
+  it("progress loop attempts and grants", async () => {
+    const cases = [
+      {
+        workflow: "debug",
+        step: "debug-failure-remediate",
+        point: "debug.fix",
+        title: "Failure Remediate",
+        number: 7,
+        total: 11,
+        percent: 64,
+        bar: "██████░░░░",
+      },
+      {
+        workflow: "debug",
+        step: "debug-failure-soak",
+        point: "debug.soak",
+        title: "Failure Remediate Soak",
+        number: 8,
+        total: 11,
+        percent: 73,
+        bar: "███████░░░",
+      },
+      {
+        workflow: "ship",
+        step: "ship-merge-pr",
+        point: "ship.merge",
+        title: "Merge Gate + Merge PR",
+        number: 10,
+        total: 14,
+        percent: 71,
+        bar: "███████░░░",
+      },
+      {
+        workflow: "build",
+        step: "build-plan-verify",
+        point: "build.verify",
+        title: "Plan Verify",
+        number: 8,
+        total: 16,
+        percent: 50,
+        bar: "█████░░░░░",
+        group: 1,
+      },
+      {
+        workflow: "build",
+        step: "build-run-tests",
+        point: "build.tests",
+        title: "Run Tests",
+        number: 12,
+        total: 16,
+        percent: 75,
+        bar: "████████░░",
+      },
+      {
+        workflow: "build",
+        step: "build-challenge",
+        point: "build.challenge",
+        title: "Build Challenge",
+        number: 11,
+        total: 16,
+        percent: 69,
+        bar: "███████░░░",
+      },
+    ];
+    for (const item of cases) {
+      const cwd = repo(item.workflow, { [item.point]: { ask: true, max: 3 } });
+      const group = loopGroup(item.group);
+      fs.appendFileSync(
+        path.join(cwd, STATUS),
+        jsonl([
+          completed(cwd, item.workflow, item.step, { attempt: 1, ...group.fields }),
+          {
+            type: "allowance-granted",
+            workflow: item.workflow,
+            point: item.point,
+            at: at(),
+            ...group.fields,
+          },
+        ]),
+      );
+      const result = await run(
+        cwd,
+        doneArgs(item.workflow, item.step, "--attempt=next", ...group.flags),
+      );
+      expect(result.code, item.step).toBe(0);
+      expect(result.json.progressLine, item.step).toBe(
+        `Progress: ${item.bar} ${item.percent}% · Step ${item.number}/${item.total} ${item.title}${group.suffix} · Attempt 2 of 6`,
+      );
+      const max = await run(cwd, [
+        "counters",
+        "max",
+        `--file=${STATUS}`,
+        `--workflow=${item.workflow}`,
+        `--point=${item.point}`,
+        ...group.flags,
+      ]);
+      expect(max.code).toBe(0);
+      expect(max.json.value).toBe(6);
+    }
+  });
+
+  it("progress specialized completion producers", async () => {
+    const contextCwd = repo("debug");
+    write(contextCwd, ".agents/context.md", "# Context\n<!-- bkit:end -->\n");
+    write(contextCwd, `${LOG}/context-related-1.md`, "No related issues.\n");
+    const context = await run(contextCwd, [
+      "context",
+      "finalise",
+      `--fid=${FID}`,
+      `--month=${MONTH}`,
+      "--attempt=1",
+      `--file=${STATUS}`,
+      "--record",
+      "--message=chore(825-progress): context",
+    ]);
+    expect(context.code).toBe(0);
+    expect
+      .soft(context.json.progressLine)
+      .toBe("Progress: ████░░░░░░ 36% · Step 4/11 Fetch Context");
+    expect(context.out).toHaveLength(1);
+    expect(domainRows(contextCwd).filter((row) => row.step === "context-fetch")).toHaveLength(1);
+
+    const dispatchCwd = repo();
+    const dispatch = await run(dispatchCwd, [
+      "runs",
+      "dispatch",
+      `--fid=${FID}`,
+      "--pr=7",
+      `--file=${STATUS}`,
+      "--workflow=build",
+      "--step=build-close-workflow",
+      "--poll-result=err",
+      "--attempts=6",
+      "--all-errored",
+    ]);
+    expect(dispatch.json.row).toMatchObject({ step: "build-close-workflow", status: "DONE" });
+    expect
+      .soft(dispatch.json.progressLine)
+      .toBe("Progress: ██████████ 100% · Step 16/16 Close Workflow & Create PR");
+    expect(dispatch.out).toHaveLength(1);
+    expect(
+      domainRows(dispatchCwd).filter((row) => row.step === "build-close-workflow"),
+    ).toHaveLength(1);
+
+    const closeCwd = repo("design");
+    const close = await run(closeCwd, [
+      "workflows",
+      "close",
+      "--workflow=design",
+      `--fid=${FID}`,
+      `--month=${MONTH}`,
+      `--file=${STATUS}`,
+      "--record-step",
+    ]);
+    expect(close.code).toBe(0);
+    expect
+      .soft(close.json.progressLine)
+      .toBe("Progress: ██████████ 100% · Step 12/12 Close Workflow");
+    expect(close.out).toHaveLength(1);
+    expect(domainRows(closeCwd).filter((row) => row.step === "design-close-workflow")).toHaveLength(
+      1,
+    );
+    expect(domainRows(closeCwd).at(-1)).toMatchObject({
+      type: "workflow-done",
+      workflow: "design",
+    });
+
+    const ship = shipping();
+    const flushed = await run(ship.worktree, [
+      "workflows",
+      "close",
+      "--workflow=ship",
+      `--fid=${FID}`,
+      `--month=${MONTH}`,
+      `--file=${STATUS}`,
+      "--record-step",
+      "--flush",
+      "--pr-number=7",
+      `--squash-sha=${git(ship.worktree, "rev-parse", "HEAD")}`,
+      `--outbox=${ship.outbox}`,
+      `--branch=feat/${FID}`,
+    ]);
+    expect(flushed.code).toBe(0);
+    expect
+      .soft(flushed.json.progressLine)
+      .toBe("Progress: ██████████ 100% · Step 14/14 Close Workflow");
+    expect(flushed.out).toHaveLength(1);
+    expect(fs.existsSync(ship.worktree)).toBe(false);
+    const landed = git(ship.remote, "show", `dev:${STATUS}`)
+      .split("\n")
+      .map((line) => JSON.parse(line) as Record<string, unknown>);
+    expect(landed.filter((row) => row.step === "ship-close-workflow")).toHaveLength(1);
+  });
+
+  it("progress gate only completions", async () => {
+    vi.stubEnv("BKIT_ENGINE_JOURNAL", "on");
+    vi.stubEnv("GIT_EXEC_PATH", "");
+    const cwd = repo("ship");
+    const setup = completed(cwd, "ship", "ship-worktree-setup");
+    const book = completed(cwd, "ship", "ship-bookkeeping-push");
+    fs.appendFileSync(path.join(cwd, STATUS), jsonl([setup, book]));
+    const before = domainRows(cwd);
+    for (const [step, number, expected] of [
+      ["ship-worktree-setup", "3", "Progress: ██░░░░░░░░ 21% · Step 3/14 Base Check"],
+      ["ship-bookkeeping-push", "9", "Progress: ██████░░░░ 64% · Step 9/14 Re-validate"],
+    ]) {
+      const result = await run(cwd, [
+        "steps",
+        "gate",
+        "--workflow=ship",
+        `--file=${STATUS}`,
+        `--step=${step}`,
+        `--progress-number=${number}`,
+      ]);
+      expect.soft(result.code).toBe(0);
+      expect.soft(result.json?.progressLine).toBe(expected);
+      expect(domainRows(cwd)).toEqual(before);
+    }
+    expect(
+      rowsOf(cwd)
+        .filter((row) => row.type === "engine-call")
+        .filter((row) => row.verb === "gate"),
+    ).toHaveLength(2);
+
+    const firstCwd = repo();
+    const lock = await run(firstCwd, [
+      "locks",
+      "acquire",
+      "--kind=workflow",
+      "--workflow=build",
+      `--fid=${FID}`,
+      `--month=${MONTH}`,
+    ]);
+    expect(lock.code).toBe(0);
+    const startBefore = domainRows(firstCwd);
+    const first = await run(firstCwd, [
+      "steps",
+      "gate",
+      "--workflow=build",
+      "--step=build-start-workflow",
+      `--fid=${FID}`,
+      `--month=${MONTH}`,
+      `--token=${lock.json.token}`,
+      "--issue=825",
+      "--progress-number=1",
+    ]);
+    expect.soft(first.code).toBe(0);
+    expect
+      .soft(first.json?.progressLine)
+      .toBe("Progress: █░░░░░░░░░ 6% · Step 1/16 Start Workflow");
+    expect(domainRows(firstCwd)).toEqual(startBefore);
+    const released = await run(firstCwd, [
+      "locks",
+      "release",
+      "--kind=workflow",
+      "--workflow=build",
+      `--fid=${FID}`,
+      `--month=${MONTH}`,
+      `--token=${lock.json.token}`,
+    ]);
+    expect(released.code).toBe(0);
+  });
+
+  it("progress excludes noncompletions", async () => {
+    vi.stubEnv("BKIT_ENGINE_JOURNAL", "on");
+    vi.stubEnv("GIT_EXEC_PATH", "");
+    const cwd = repo();
+    for (const step of ["build-decision", "build-tests-red", "unrecognized-bookkeeping"]) {
+      const result = await run(cwd, doneArgs("build", step, "--attempt=1"));
+      expect(result.code).toBe(0);
+      expect(result.json.progressLine).toBeUndefined();
+    }
+    const pause = await run(cwd, [
+      "status",
+      "row",
+      "--workflow=build",
+      `--file=${STATUS}`,
+      "--type=owner-pause",
+      "--field=reason=decision",
+    ]);
+    expect(pause.code).toBe(0);
+    expect(pause.json?.progressLine).toBeUndefined();
+    const gate = await run(cwd, [
+      "steps",
+      "gate",
+      "--workflow=build",
+      "--step=build-decision",
+      `--file=${STATUS}`,
+      "--attempt=1",
+    ]);
+    expect(gate.code).toBe(0);
+    expect(gate.json.progressLine).toBeUndefined();
+    const failed = await run(
+      cwd,
+      doneArgs("build", "build-plan-verify", "--status=FAILED", "--group=1"),
+    );
+    expect(failed.code).toBe(0);
+    expect(failed.json.progressLine).toBeUndefined();
+
+    for (const bad of [
+      "malformed-plan",
+      "unreadable-plan",
+      "malformed-status",
+      "unreadable-status",
+    ]) {
+      const invalid = invalidInput(bad);
+      const broken = invalid.cwd;
+      const head = git(broken, "rev-parse", "HEAD");
+      const before = invalid.snapshot();
+      const result = await run(broken, [
+        "steps",
+        "done",
+        "--workflow=build",
+        "--step=build-plan-verify",
+        `--file=${STATUS}`,
+        "--group=1",
+        "--message=chore(825-progress): verify",
+      ]);
+      expect(result.code, bad).not.toBe(0);
+      expect(result.json?.progressLine, bad).toBeUndefined();
+      expect(git(broken, "rev-parse", "HEAD"), bad).toBe(head);
+      expect(invalid.snapshot(), bad).toEqual(before);
+      expect(invalid.journals(), bad).toBe(invalid.expectedJournals);
+    }
+
+    const refused = repo();
+    write(refused, ".git/hooks/pre-commit", "#!/bin/sh\nexit 1\n");
+    fs.chmodSync(path.join(refused, ".git/hooks/pre-commit"), 0o755);
+    const head = git(refused, "rev-parse", "HEAD");
+    const before = domainRows(refused);
+    const refusal = await run(refused, [
+      "steps",
+      "done",
+      "--workflow=build",
+      "--step=build-plan-verify",
+      `--file=${STATUS}`,
+      "--group=1",
+      "--message=chore(825-progress): verify",
+    ]);
+    expect(refusal.code).not.toBe(0);
+    expect(refusal.json?.progressLine).toBeUndefined();
+    expect(domainRows(refused)).toEqual(before);
+    expect(git(refused, "rev-parse", "HEAD")).toBe(head);
+    expect(rowsOf(refused).some((row) => row.type === "engine-call")).toBe(true);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/runs.ts b/.bkit/core/engine/commands/workflow/runs.ts
index e057c6392..9ca30e375 100644
--- a/.bkit/core/engine/commands/workflow/runs.ts
+++ b/.bkit/core/engine/commands/workflow/runs.ts
@@ -1432,11 +1432,12 @@ async function runDispatch(ctx: RunContext): Promise<number> {
   if ((file === undefined) !== (step === undefined))
     throw new CommandError(EXIT.USAGE, "--file and --step go together");
   let row: Record<string, unknown> | null = null;
+  let progressLine: string | undefined;
   let transport: Record<string, unknown> | null = null;
   const code = dispatchCode(r, pr, scanResult, ctx.log);
   if (file !== undefined && r.ciDispatch !== null) {
     const status = path.resolve(ctx.cwd, file);
-    row = writeStepRow(
+    const written = writeStepRow(
       ctx.cwd,
       {
         file: status,
@@ -1450,7 +1451,9 @@ async function runDispatch(ctx: RunContext): Promise<number> {
         commit: "none",
       },
       ctx.log,
-    ).row;
+    );
+    row = written.row;
+    progressLine = written.progressLine;
     if (/-close-workflow$/.test(step!)) {
       const tree = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
       restateOutcome(tree, status, String(f.workflow ?? "build"), { ...r.ciDispatch }, ctx.log);
@@ -1470,6 +1473,7 @@ async function runDispatch(ctx: RunContext): Promise<number> {
           ciWorkflow: r.ciWorkflow,
           row,
           transport,
+          ...(progressLine === undefined ? {} : { progressLine }),
         });
         return EXIT.NO;
       }
@@ -1491,6 +1495,7 @@ async function runDispatch(ctx: RunContext): Promise<number> {
     ciWorkflow: r.ciWorkflow,
     row,
     transport,
+    ...(progressLine === undefined ? {} : { progressLine }),
   });
   return code;
 }
@@ -2164,6 +2169,8 @@ export const runsCommand: CommandSpec = {
         ciWorkflow: "the CI workflow file the no-ci check looked for",
         row: "--file: the step-done row written (null on a hand-off)",
         transport: "--file: the close-transport row written for a passed verdict, else null",
+        progressLine:
+          "--file: the exact chat progress line after a numbered completion is recorded",
       },
       exitCodes: {
         [EXIT_SKIP_TOKEN]: "the pushed head's body carries a CI-suppression token",
diff --git a/.bkit/core/engine/commands/workflow/step-table.test.ts b/.bkit/core/engine/commands/workflow/step-table.test.ts
index 94501039d..d88a6b4be 100644
--- a/.bkit/core/engine/commands/workflow/step-table.test.ts
+++ b/.bkit/core/engine/commands/workflow/step-table.test.ts
@@ -6,7 +6,7 @@ import { afterEach, describe, expect, it } from "vitest";
 
 import { runCommand } from "../lib";
 import { COMMANDS } from "../registry";
-import { WORKFLOW_STEPS, type ResumableWorkflow } from "./step-table";
+import { WORKFLOW_STEPS, runProgress, type ResumableWorkflow } from "./step-table";
 
 const dirs: string[] = [];
 afterEach(() => {
@@ -57,6 +57,127 @@ const setUp = (workflow: ResumableWorkflow) => [
   ...WORKFLOW_STEPS[workflow].filter((s) => s.setup).map((s) => done(workflow, s.step!)),
 ];
 
+describe("workflow progress", () => {
+  it("runProgress flat workflow", () => {
+    expect(runProgress({ workflow: "ship", step: "ship-merge-pr" })).toMatchObject({
+      percent: 71,
+      progressLine: "Progress: ███████░░░ 71% · Step 10/14 Merge Gate + Merge PR",
+    });
+  });
+
+  it("runProgress build groups", () => {
+    expect(
+      runProgress({ workflow: "build", step: "build-plan-verify", groups: [1, 2, 3], group: 2 })
+        .progressLine,
+    ).toBe("Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Group 2 of 3");
+    expect(
+      runProgress({ workflow: "build", step: "build-plan-verify", groups: [1, 5], group: 5 })
+        .progressLine,
+    ).toBe("Progress: ██████░░░░ 58% · Step 8/16 Plan Verify · Group 2 of 2");
+  });
+
+  it("runProgress groups added", () => {
+    const before = runProgress({ workflow: "build", step: "build-challenge", groups: [1] });
+    const after = runProgress({ workflow: "build", step: "build-challenge", groups: [1, 2, 3] });
+    expect(before.percent).toBe(69);
+    expect(after.percent).toBe(77);
+    expect(after.progressLine).toBe("Progress: ████████░░ 77% · Step 11/16 Build Challenge");
+  });
+
+  it("runProgress loop back", () => {
+    const before = runProgress({
+      workflow: "build",
+      step: "build-plan-gaps-remediate",
+      groups: [1, 2],
+      group: 1,
+    });
+    const after = runProgress({
+      workflow: "build",
+      step: "build-plan-verify",
+      groups: [1, 2],
+      group: 1,
+      attempt: 2,
+      max: 3,
+    });
+    expect(after.percent).toBeLessThan(before.percent);
+    expect(after.progressLine).toBe(
+      "Progress: ████░░░░░░ 42% · Step 8/16 Plan Verify · Group 1 of 2 · Attempt 2 of 3",
+    );
+  });
+
+  it("runProgress bar width", () => {
+    for (const workflow of Object.keys(WORKFLOW_STEPS) as ResumableWorkflow[]) {
+      for (const position of WORKFLOW_STEPS[workflow]) {
+        const { progressLine } = runProgress({ workflow, number: position.number });
+        const prefix = progressLine.split(" · ")[0]!;
+        expect(prefix).toMatch(/^Progress: [█░]{10} \d{1,3}%$/);
+        expect(prefix.length).toBeLessThanOrEqual(25);
+      }
+    }
+  });
+
+  it("runProgress all workflow numbers", () => {
+    const totals = { design: 12, plan: 8, build: 16, debug: 11, ship: 14 };
+    for (const workflow of Object.keys(totals) as ResumableWorkflow[]) {
+      for (const position of WORKFLOW_STEPS[workflow]) {
+        const result = runProgress({ workflow, number: position.number });
+        expect(result.percent).toBe(Math.round((100 * position.number) / totals[workflow]));
+        expect(result.progressLine).toContain(
+          `Step ${position.number}/${totals[workflow]} ${position.title}`,
+        );
+      }
+    }
+    expect(runProgress({ workflow: "ship", number: 3 }).progressLine).toBe(
+      "Progress: ██░░░░░░░░ 21% · Step 3/14 Base Check",
+    );
+    expect(runProgress({ workflow: "ship", number: 9 }).progressLine).toBe(
+      "Progress: ██████░░░░ 64% · Step 9/14 Re-validate",
+    );
+    expect(runProgress({ workflow: "build", step: "build-plan-tests" }).percent).toBe(
+      runProgress({ workflow: "build", step: "build-plan-tasks" }).percent,
+    );
+  });
+
+  it("runProgress missing plan fallback", () => {
+    const missing = runProgress({ workflow: "build", step: "build-plan-verify", group: 1 });
+    const empty = runProgress({
+      workflow: "build",
+      step: "build-plan-verify",
+      groups: [],
+      group: 1,
+    });
+    expect(missing.progressLine).toBe(
+      "Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Group 1 of 1",
+    );
+    expect(empty).toEqual(missing);
+  });
+
+  it("runProgress attempt suffix", () => {
+    expect(
+      runProgress({ workflow: "ship", step: "ship-merge-pr", attempt: 1, max: 3 }).progressLine,
+    ).toBe("Progress: ███████░░░ 71% · Step 10/14 Merge Gate + Merge PR");
+    expect(
+      runProgress({ workflow: "ship", step: "ship-merge-pr", attempt: 2, max: 3 }).progressLine,
+    ).toBe("Progress: ███████░░░ 71% · Step 10/14 Merge Gate + Merge PR · Attempt 2 of 3");
+    expect(runProgress({ workflow: "ship", step: "ship-merge-pr", attempt: 2 }).progressLine).toBe(
+      "Progress: ███████░░░ 71% · Step 10/14 Merge Gate + Merge PR · Attempt 2",
+    );
+  });
+
+  it("runProgress final completion only", () => {
+    const groups = Array.from({ length: 1000 }, (_, index) => index + 1);
+    const nonfinal = runProgress({ workflow: "build", step: "build-summary", groups });
+    expect(nonfinal.percent).toBe(99);
+    expect(nonfinal.progressLine).not.toContain("100%");
+    for (const workflow of Object.keys(WORKFLOW_STEPS) as ResumableWorkflow[]) {
+      const final = WORKFLOW_STEPS[workflow].at(-1)!;
+      expect(runProgress({ workflow, number: final.number, groups }).progressLine).toBe(
+        `Progress: ██████████ 100% · Step ${final.number}/${final.number} ${final.title}`,
+      );
+    }
+  });
+});
+
 describe("bkit status resume", () => {
   it("a build stopped after build-challenge resumes at the challenge merge (Step 11)", async () => {
     const file = log([
diff --git a/.bkit/core/engine/commands/workflow/step-table.ts b/.bkit/core/engine/commands/workflow/step-table.ts
index acec17ede..47bf1ca37 100644
--- a/.bkit/core/engine/commands/workflow/step-table.ts
+++ b/.bkit/core/engine/commands/workflow/step-table.ts
@@ -228,6 +228,41 @@ export const DECISION_ROUTES: Readonly<
 
 export const isResumable = (w: string): w is ResumableWorkflow => w in WORKFLOW_STEPS;
 
+/** A completed numbered position, with build groups expanded in plan order. */
+export function runProgress(input: {
+  workflow: ResumableWorkflow;
+  step?: string;
+  number?: number;
+  groups?: number[];
+  group?: number;
+  attempt?: number;
+  max?: number;
+}): { percent: number; progressLine: string } {
+  const table = WORKFLOW_STEPS[input.workflow];
+  const entry = table.find((s) =>
+    input.number === undefined ? s.step === input.step : s.number === input.number,
+  );
+  if (entry === undefined) throw new Error("unknown workflow progress position");
+  const steps = new Set(table.map((s) => s.number)).size;
+  const groups = input.groups?.length ? input.groups : [1];
+  const ordinal = Math.max(1, groups.indexOf(input.group ?? groups[0]!) + 1);
+  const grouped = input.workflow === "build" && entry.number >= 7 && entry.number <= 9;
+  const total = input.workflow === "build" ? 13 + 3 * groups.length : steps;
+  const position =
+    input.workflow !== "build" || entry.number < 7
+      ? entry.number
+      : grouped
+        ? 6 + 3 * (ordinal - 1) + entry.number - 6
+        : 6 + 3 * groups.length + entry.number - 9;
+  const percent = entry.number === steps ? 100 : Math.min(99, Math.round((100 * position) / total));
+  const filled = Math.min(10, Math.max(0, Math.round(percent / 10)));
+  let progressLine = `Progress: ${"█".repeat(filled)}${"░".repeat(10 - filled)} ${percent}% · Step ${entry.number}/${steps} ${entry.title}`;
+  if (grouped) progressLine += ` · Group ${ordinal} of ${groups.length}`;
+  if (input.attempt !== undefined && input.attempt > 1)
+    progressLine += ` · Attempt ${input.attempt}${input.max === undefined ? "" : ` of ${input.max}`}`;
+  return { percent, progressLine };
+}
+
 export interface ResumePoint {
   /** The step to continue at: its row name (null for a step that writes no row), number and title. */
   step: string | null;
diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index 25c4f51a6..a4ba52269 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -79,6 +79,88 @@ const doneArgs = (...extra: string[]) => [
   ...extra,
 ];
 
+describe("progress command output", () => {
+  it("finish prints progressLine", async () => {
+    const cwd = repo();
+    const r = await run(cwd, [
+      "steps",
+      "finish",
+      ...STEP,
+      "--group=1",
+      "--attempt=1",
+      "--verdict=FAIL",
+      "--failures=2",
+      "--artifact=logs/verify-1.md",
+      "--commit=none",
+    ]);
+    expect(r.code).toBe(0);
+    expect(r.json.progressLine).toBe(
+      "Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Group 1 of 1",
+    );
+    expect(r.json.row).not.toHaveProperty("progressLine");
+    expect(fs.readFileSync(path.join(cwd, "logs/status.jsonl"), "utf8")).not.toContain(
+      "progressLine",
+    );
+  });
+
+  it("done prints progressLine", async () => {
+    const cwd = repo();
+    const r = await run(cwd, ["steps", "done", ...STEP, "--group=1", "--commit=none"]);
+    expect(r.code).toBe(0);
+    expect(r.json.progressLine).toBe(
+      "Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Group 1 of 1",
+    );
+    const out: string[] = [];
+    const code = await runCommand(
+      ["steps", "done", ...STEP, "--group=1", "--commit=none"],
+      COMMANDS,
+      {
+        classicVerbs: new Set(),
+        cwd,
+        io: { stdout: (text) => out.push(text), stderr: () => undefined },
+      },
+    );
+    expect(code).toBe(0);
+    expect(out.join("")).toContain(`progressLine: ${r.json.progressLine}`);
+    expect(r.json.row).not.toHaveProperty("progressLine");
+  });
+
+  it("progress output metadata", () => {
+    for (const [noun, verbs] of [
+      ["steps", ["done", "finish", "gate"]],
+      ["context", ["finalise"]],
+      ["runs", ["dispatch"]],
+      ["workflows", ["close"]],
+    ] as const) {
+      const spec = COMMANDS.find((entry) => entry.noun === noun)!;
+      for (const verb of verbs)
+        expect(spec.verbs[verb]!.output, `${noun} ${verb}`).toHaveProperty("progressLine");
+    }
+    expect(stepsCommand.verbs.gate!.flags?.some((flag) => flag.name === "progress-number")).toBe(
+      true,
+    );
+  });
+
+  it("gate progress number validation", async () => {
+    const cwd = repo();
+    await run(cwd, ["steps", "done", ...STEP, "--group=1", "--attempt=1", "--commit=none"]);
+    const args = ["steps", "gate", ...STEP, "--group=1", "--attempt=1"];
+    for (const value of ["0", "17", "1.5", "not-a-number"]) {
+      const result = await run(cwd, [...args, `--progress-number=${value}`]);
+      expect(result.code, value).not.toBe(0);
+      expect(result.json?.progressLine).toBeUndefined();
+    }
+    const good = await run(cwd, [...args, "--progress-number=8"]);
+    expect(good.code).toBe(0);
+    expect(good.json.progressLine).toBe(
+      "Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Group 1 of 1",
+    );
+    const badGate = await run(cwd, [...args, "--artifact=logs/missing.md", "--progress-number=8"]);
+    expect(badGate.code).not.toBe(0);
+    expect(badGate.json?.progressLine).toBeUndefined();
+  });
+});
+
 describe("bkit steps done", () => {
   it("captures parentSha first, writes the row, then commits on top of it", async () => {
     const cwd = repo();
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index 7e6c8b77a..7b8b58fa8 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -27,6 +27,7 @@ import { clampLogPath, readRecords } from "../../ledgers/clamp-log.js";
 import { appendFrictionRow, frictionRow, journalEnabled } from "../../ledgers/journal.js";
 import { resolveRepoSlug } from "../../ledgers/telemetry.js";
 import { getPromptsRoot } from "../../shared/package-roots.js";
+import { readTextFile } from "../../shared/json.js";
 import {
   CommandError,
   EXIT,
@@ -40,7 +41,10 @@ import {
   type FlagValue,
   type RunContext,
 } from "../lib.js";
-import { activeRunStart } from "./counters.js";
+import { activeRunStart, savedPointLimit } from "./counters.js";
+import type { AskPoint } from "../../shared/settings.js";
+import { isResumable, runProgress, WORKFLOW_STEPS } from "./step-table.js";
+import { planFiles } from "./run-facts.js";
 import { fidProblem, normaliseFid, readIssueTracker } from "./fids.js";
 import { buildComment } from "./issues.js";
 import {
@@ -412,6 +416,81 @@ function fidOfStatusFile(file: string): string | undefined {
   )?.[1];
 }
 
+/** Loop budgets use the same point names as the workflow counter routes. */
+function progressPoint(workflow: string, step: string, soak: boolean): AskPoint | undefined {
+  if (workflow === "build") {
+    if (["build-plan-verify", "build-group-gate", "build-plan-gaps-remediate"].includes(step))
+      return "build.verify";
+    if (step === "build-challenge") return "build.challenge";
+    if (["build-run-tests", "build-failure-diagnose", "build-failure-remediate"].includes(step))
+      return "build.tests";
+  }
+  if (workflow === "debug") {
+    if (step === "debug-failure-soak" || soak) return "debug.soak";
+    if (["debug-run-tests", "debug-failure-diagnose", "debug-failure-remediate"].includes(step))
+      return "debug.fix";
+  }
+  if (
+    workflow === "ship" &&
+    ["ship-merge-pr", "ship-failure-diagnose", "ship-failure-remediate"].includes(step)
+  )
+    return "ship.merge";
+  return undefined;
+}
+
+/** Prepare output before a completion mutates the log; progress is never persisted. */
+function stepProgress(cwd: string, r: StepRow, number?: number): string | undefined {
+  if (r.status === "FAILED" || !isResumable(r.workflow)) return undefined;
+  const entry = WORKFLOW_STEPS[r.workflow].find((s) =>
+    number === undefined ? s.step === r.step : s.number === number,
+  );
+  if (entry === undefined) {
+    if (number !== undefined)
+      throw new CommandError(EXIT.USAGE, "--progress-number is not a workflow step");
+    return undefined;
+  }
+  if (fs.existsSync(r.file) && !readTextFile(r.file).ok)
+    throw new CommandError(EXIT_NO_STATUS, `${r.file} is unreadable`);
+  const runs = fs.existsSync(r.file) ? readRuns(r.file) : [];
+  const run = runs.filter((item) => item.workflow === r.workflow).at(-1);
+  const abs = path.resolve(cwd, r.file);
+  const canonical = /^(.*)\/docs\/plans\/([0-9]{6})\/logs\/([^/]+)\/status\.jsonl$/.exec(
+    abs.split(path.sep).join("/"),
+  );
+  let groups: number[] = [];
+  if (r.workflow === "build" && canonical !== null) {
+    const [file] = planFiles(canonical[1]!, canonical[2]!, canonical[3]!);
+    if (file !== undefined) {
+      const text = readTextFile(file);
+      if (!text.ok) throw new CommandError(EXIT.USAGE, `progress plan ${file} is unreadable`);
+      const plan = parsePlanBlocks(text.text);
+      if (plan.errors.length > 0 || plan.fenceOpen !== undefined)
+        throw new CommandError(
+          EXIT.USAGE,
+          `invalid progress plan: ${plan.errors.map((e) => e.message).join("; ") || "unclosed code fence"}`,
+        );
+      groups = plan.groups.map((g) => g.group);
+    }
+  }
+  const prior = run?.steps.filter((s) => s.status === "DONE") ?? [];
+  const same = prior.filter(
+    (s) => s.step === r.step && (r.group === undefined || s.group === r.group),
+  );
+  const soak = runOrStepField(runs, r.workflow, "debugMode") === "SOAK";
+  const point = progressPoint(r.workflow, r.step, soak);
+  const attempt =
+    r.attempt ?? (typeof r.extras?.round === "number" ? r.extras.round : same.at(-1)?.attempt);
+  return runProgress({
+    workflow: r.workflow,
+    step: r.step,
+    number,
+    groups,
+    group: r.group,
+    attempt,
+    max: point === undefined ? undefined : savedPointLimit(r.file, r.workflow, point, r.group),
+  }).progressLine;
+}
+
 export interface StepRow {
   file: string;
   workflow: string;
@@ -508,7 +587,7 @@ export function writeStepRow(
   cwd: string,
   r: StepRow,
   log: (m: string) => void,
-): { row: Record<string, unknown>; commit: string | null; code: number } {
+): { row: Record<string, unknown>; commit: string | null; code: number; progressLine?: string } {
   const clash = Object.keys(r.extras ?? {}).filter((k) => CORE_ROW_KEYS.has(k));
   if (clash.length > 0)
     throw new CommandError(EXIT.USAGE, `--field cannot set ${clash.join(", ")}; use its own flag`);
@@ -533,6 +612,7 @@ export function writeStepRow(
     ...(r.strategy === undefined ? {} : { strategy: r.strategy as Step["strategy"] }),
     ...(r.extras ?? {}),
   };
+  const progressLine = stepProgress(cwd, r);
   // An in-place run on a shared branch commits its own paths only; a refusal
   // comes before the append, so a re-run after the human's fix writes the row once.
   const fid = r.commit === "auto" ? fidOfStatusFile(r.file) : undefined;
@@ -589,7 +669,13 @@ export function writeStepRow(
     return { row, commit: null, code: index === null ? code : EXIT.NEEDS_HUMAN };
   };
 
-  if (r.commit === "none") return { row, commit: null, code: EXIT.OK };
+  if (r.commit === "none")
+    return {
+      row,
+      commit: null,
+      code: EXIT.OK,
+      ...(progressLine === undefined ? {} : { progressLine }),
+    };
   if (rec !== null) {
     let own: OwnCommit;
     try {
@@ -599,12 +685,22 @@ export function writeStepRow(
       return failed(EXIT_FOREIGN_PATH, `the commit was refused: ${err.message}`);
     }
     if (!own.ok) return failed(EXIT_COMMIT, `the commit failed: ${own.error}`);
-    return { row, commit: runGit(cwd, ["rev-parse", "HEAD"]).stdout, code: EXIT.OK };
+    return {
+      row,
+      commit: runGit(cwd, ["rev-parse", "HEAD"]).stdout,
+      code: EXIT.OK,
+      ...(progressLine === undefined ? {} : { progressLine }),
+    };
   }
   const add = addAllButCopied(cwd);
   const made = add.ok ? runGit(cwd, ["commit", "--allow-empty", "-m", r.message!]) : add;
   if (!made.ok) return failed(EXIT_COMMIT, `the commit failed: ${made.stderr || made.stdout}`);
-  return { row, commit: runGit(cwd, ["rev-parse", "HEAD"]).stdout, code: EXIT.OK };
+  return {
+    row,
+    commit: runGit(cwd, ["rev-parse", "HEAD"]).stdout,
+    code: EXIT.OK,
+    ...(progressLine === undefined ? {} : { progressLine }),
+  };
 }
 
 // ---------------------------------------------------------------------------
@@ -1265,6 +1361,7 @@ async function finish(ctx: RunContext): Promise<number> {
     row: written.row,
     parentSha: written.row.parentSha,
     commit: written.commit,
+    ...(written.progressLine === undefined ? {} : { progressLine: written.progressLine }),
     pass,
     checks,
     comment,
@@ -1356,6 +1453,7 @@ export const stepsCommand: CommandSpec = {
       output: {
         row: "the appended step-done row",
         commit: "the new commit's sha, or null with --commit=none",
+        progressLine: "the exact chat progress line after a successful numbered completion",
       },
       textOmit: ["row"],
       exitCodes: {
@@ -1422,7 +1520,11 @@ export const stepsCommand: CommandSpec = {
           },
           ctx.log,
         );
-        ctx.emit({ row: written.row, commit: written.commit });
+        ctx.emit({
+          row: written.row,
+          commit: written.commit,
+          ...(written.progressLine === undefined ? {} : { progressLine: written.progressLine }),
+        });
         return written.code;
       },
     },
@@ -1560,6 +1662,7 @@ export const stepsCommand: CommandSpec = {
         parentSha: "the row's parentSha: HEAD before the step's commit",
         commit: "the new commit's sha, or null with --commit=none",
         pass: "every gate check passed",
+        progressLine: "the exact chat progress line after a successful numbered completion",
         checks: "[{check, ok, detail}] per gate check",
         comment: "the step's tracker comment body (with --number), else null",
         commentFile: COMMENT_FILE_OUTPUT,
@@ -1656,6 +1759,11 @@ export const stepsCommand: CommandSpec = {
         WORKFLOW_FLAG,
         STEP_FLAG,
         GROUP_FLAG,
+        {
+          name: "progress-number",
+          type: "string",
+          help: "render this completed numbered position without writing a status row",
+        },
         {
           name: "attempt",
           type: "string",
@@ -1697,7 +1805,11 @@ export const stepsCommand: CommandSpec = {
           help: "the workflow lock must be held with this token (needs --fid)",
         },
       ],
-      output: { pass: "true when every check passed", checks: "[{check, ok, detail}] per check" },
+      output: {
+        pass: "true when every check passed",
+        checks: "[{check, ok, detail}] per check",
+        progressLine: "with --progress-number: the exact chat progress line after the gate passes",
+      },
       exitCodes: {
         [EXIT_NO_STATUS]:
           "status.jsonl missing (on disk, or on --ref), unreadable, or not valid NDJSON",
@@ -1707,6 +1819,13 @@ export const stepsCommand: CommandSpec = {
         const file = str(f.file) === undefined ? undefined : statusFile(ctx);
         const workflow = String(f.workflow);
         const group = positiveInt(f.group, "group");
+        const progressNumber = positiveInt(f.progressNumber, "progress-number");
+        if (
+          progressNumber !== undefined &&
+          (!isResumable(workflow) ||
+            !WORKFLOW_STEPS[workflow].some((s) => s.number === progressNumber))
+        )
+          throw new CommandError(EXIT.USAGE, "--progress-number is not a workflow step");
         if (f.attempt !== undefined && f.attemptOf !== undefined)
           throw new CommandError(EXIT.USAGE, "give --attempt or --attempt-of, not both");
         if (f.attemptOf !== undefined && file === undefined)
@@ -1741,7 +1860,34 @@ export const stepsCommand: CommandSpec = {
         });
         const pass = checks.every((c) => c.ok);
         for (const c of checks.filter((x) => !x.ok)) ctx.log(`${c.check}: ${c.detail}`);
-        ctx.emit({ pass, checks });
+        const progressFile =
+          file ??
+          path.resolve(
+            ctx.cwd,
+            "docs",
+            "plans",
+            str(f.month) ?? "",
+            "logs",
+            str(f.fid) ?? "",
+            "status.jsonl",
+          );
+        const progressLine =
+          pass && progressNumber !== undefined
+            ? stepProgress(
+                ctx.cwd,
+                {
+                  file: progressFile,
+                  workflow,
+                  step: String(f.step),
+                  group,
+                  attempt,
+                  artifacts: [],
+                  commit: "none",
+                },
+                progressNumber,
+              )
+            : undefined;
+        ctx.emit({ pass, checks, ...(progressLine === undefined ? {} : { progressLine }) });
         return pass ? EXIT.OK : EXIT.NO;
       },
     },
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index 09b0e3113..3cbd9cbcd 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -1262,12 +1262,14 @@ export function closeWorkflow(
   // Graded first, so the report below carries this run's grade.
   const violations = gradeCompliance(where.tree, workflow, log, o.squashSha, { parentSha, step });
 
+  let progressLine: string | undefined;
   if (o.recordStep === true) {
-    writeStepRow(
+    const written = writeStepRow(
       where.tree,
       { file: where.status, workflow, step, artifacts: [], commit: "none" },
       log,
     );
+    progressLine = written.progressLine;
   }
   writeCompletenessRow(where.status, workflow, parentSha, log);
   const endAt = statusTimestamp();
@@ -1428,6 +1430,7 @@ export function closeWorkflow(
     comment,
     roadmapFoldNeeded: true,
     featureStatus: FEATURE_STATUS[workflow],
+    ...(progressLine === undefined ? {} : { progressLine }),
   };
 }
 
@@ -2437,6 +2440,8 @@ export const workflowsCommand: CommandSpec = {
         roadmapFoldNeeded:
           "always true: append the feature row and re-render the board (not run here)",
         featureStatus: "roadmap status this close moves the feature to",
+        progressLine:
+          "--record-step: the exact chat progress line after a numbered completion is recorded",
         landed: "--flush: {ref, via: head-push | close-pr | close-pr-open}",
         worktree:
           "--flush: the `bkit worktrees remove` result once the close is on dev; null while the close PR is unmerged or the removal failed",
diff --git a/.bkit/version b/.bkit/version
index 60da96959..62e7394f5 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -264,7 +264,7 @@
     ".codex/hooks/bkit-rules.cjs": "37b3c590ada277b78a246908dadddbb31c64798ca5d300e57b193e314620da67",
     ".opencode/plugin/bkit-rules.js": "6769eacc40fc2856faa9265c5665d5e4426b23c21e3df1e4f177ed6422221824",
     ".bkit/router.md": "86d116ff31947df4b7f52b76b3e3928bc3ac5bfad54ddf7c4a9ae53d2b0cf18a",
-    ".bkit/cli.md": "fbcf361fb9f1496b5844c91ac7afa9cff78c67ad2dff7d06f1ccecce0affb77c",
+    ".bkit/cli.md": "41c0710dfcaf06f930f7f0cbbb4cadb0fb1938923984cf5393be7d60a051100c",
     ".claude/agents/bkit-build-plan-tests.md": "eda75f0bbc0c1ddc3e69a2cdaef8c3b00a8fff7153b968eb7db24ae5dd98b58f",
     ".cursor/agents/bkit-build-plan-tests.md": "50a613fa58a0c00db0c3f79f5e908c955515234b5ec0676c1348a3bfe188b37a",
     ".opencode/agents/bkit-build-plan-tests.md": "9e654f6a332ec5659059158a0dee0853e487a4bd55f9063c86e82aa5791a03ee",
diff --git a/README.md b/README.md
index da886380e..9286cf7f4 100644
--- a/README.md
+++ b/README.md
@@ -354,7 +354,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 6af3da0add44a098ea842cdeaa98d4623f9f7c8e — do not edit
+  %% Generated by bkit-graphify-rollup.py from d8b627fcb7b2f278a8ac2d7ddb9987b43a145851 — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
diff --git a/dist/commands/workflow/context.js b/dist/commands/workflow/context.js
index 82e26413e..0325cda93 100644
--- a/dist/commands/workflow/context.js
+++ b/dist/commands/workflow/context.js
@@ -1520,6 +1520,7 @@ export const contextCommand = {
                 clampSummary: "those records totalled per context: artifacts written, lines and bytes fetched -> kept, and how many were written as a table vs raw",
                 row: "--record: the step-done row written, else null",
                 commit: "--record: the new commit's sha, else null",
+                progressLine: "--record: the exact chat progress line after a successful numbered completion",
                 comment: "the step comment (with --number): verdict, contexts, artifact links, a NOT CONFIGURED line per context with no block; else null",
                 commentFile: COMMENT_FILE_OUTPUT,
             },
@@ -1595,6 +1596,7 @@ export const contextCommand = {
                     clampSummary,
                     row: record ? written.row : null,
                     commit: written.commit,
+                    ...(written.progressLine === undefined ? {} : { progressLine: written.progressLine }),
                     comment,
                     commentFile: commentFileOf(ctx.cwd, comment),
                 });
diff --git a/dist/commands/workflow/counters.js b/dist/commands/workflow/counters.js
index 8c2371afc..0a96c5954 100644
--- a/dist/commands/workflow/counters.js
+++ b/dist/commands/workflow/counters.js
@@ -128,6 +128,13 @@ export function grantCount(file, workflow, point, group, allRuns) {
         r.point === point &&
         (group === undefined || r.group === group)).length;
 }
+/** A loop's frozen allowance, including the owner's saved grants; absent for legacy runs. */
+export function savedPointLimit(file, workflow, point, group) {
+    const setting = frozenAskSetting(file, workflow, point);
+    return setting === undefined
+        ? undefined
+        : setting.max * (1 + grantCount(file, workflow, point, group, false));
+}
 /** `route --rows=<type>:count`: rows of that type in the active run. */
 function derivedRows(ctx) {
     const [type, position] = String(ctx.flags.rows).split(":");
@@ -435,6 +442,7 @@ export const countersCommand = {
                     help: "status.jsonl: with --point and --workflow, the limit as the active run's workflow-started row froze it",
                 },
                 { ...WORKFLOW_FLAG, required: false, help: "workflow, with --file" },
+                GROUP_FLAG,
             ],
             output: {
                 value: "the point's limit (with --point)",
diff --git a/dist/commands/workflow/runs.js b/dist/commands/workflow/runs.js
index 7804590b1..0672acf06 100644
--- a/dist/commands/workflow/runs.js
+++ b/dist/commands/workflow/runs.js
@@ -1037,11 +1037,12 @@ async function runDispatch(ctx) {
     if ((file === undefined) !== (step === undefined))
         throw new CommandError(EXIT.USAGE, "--file and --step go together");
     let row = null;
+    let progressLine;
     let transport = null;
     const code = dispatchCode(r, pr, scanResult, ctx.log);
     if (file !== undefined && r.ciDispatch !== null) {
         const status = path.resolve(ctx.cwd, file);
-        row = writeStepRow(ctx.cwd, {
+        const written = writeStepRow(ctx.cwd, {
             file: status,
             workflow: String(f.workflow ?? "build"),
             step: step,
@@ -1051,7 +1052,9 @@ async function runDispatch(ctx) {
                 ciDispatch: r.ciDispatch,
             },
             commit: "none",
-        }, ctx.log).row;
+        }, ctx.log);
+        row = written.row;
+        progressLine = written.progressLine;
         if (/-close-workflow$/.test(step)) {
             const tree = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
             restateOutcome(tree, status, String(f.workflow ?? "build"), { ...r.ciDispatch }, ctx.log);
@@ -1071,6 +1074,7 @@ async function runDispatch(ctx) {
                     ciWorkflow: r.ciWorkflow,
                     row,
                     transport,
+                    ...(progressLine === undefined ? {} : { progressLine }),
                 });
                 return EXIT.NO;
             }
@@ -1092,6 +1096,7 @@ async function runDispatch(ctx) {
         ciWorkflow: r.ciWorkflow,
         row,
         transport,
+        ...(progressLine === undefined ? {} : { progressLine }),
     });
     return code;
 }
@@ -1705,6 +1710,7 @@ export const runsCommand = {
                 ciWorkflow: "the CI workflow file the no-ci check looked for",
                 row: "--file: the step-done row written (null on a hand-off)",
                 transport: "--file: the close-transport row written for a passed verdict, else null",
+                progressLine: "--file: the exact chat progress line after a numbered completion is recorded",
             },
             exitCodes: {
                 [EXIT_SKIP_TOKEN]: "the pushed head's body carries a CI-suppression token",
diff --git a/dist/commands/workflow/step-table.js b/dist/commands/workflow/step-table.js
index 22e3743dd..aee0c7a52 100644
--- a/dist/commands/workflow/step-table.js
+++ b/dist/commands/workflow/step-table.js
@@ -197,6 +197,31 @@ export const DECISION_ROUTES = {
     },
 };
 export const isResumable = (w) => w in WORKFLOW_STEPS;
+/** A completed numbered position, with build groups expanded in plan order. */
+export function runProgress(input) {
+    const table = WORKFLOW_STEPS[input.workflow];
+    const entry = table.find((s) => input.number === undefined ? s.step === input.step : s.number === input.number);
+    if (entry === undefined)
+        throw new Error("unknown workflow progress position");
+    const steps = new Set(table.map((s) => s.number)).size;
+    const groups = input.groups?.length ? input.groups : [1];
+    const ordinal = Math.max(1, groups.indexOf(input.group ?? groups[0]) + 1);
+    const grouped = input.workflow === "build" && entry.number >= 7 && entry.number <= 9;
+    const total = input.workflow === "build" ? 13 + 3 * groups.length : steps;
+    const position = input.workflow !== "build" || entry.number < 7
+        ? entry.number
+        : grouped
+            ? 6 + 3 * (ordinal - 1) + entry.number - 6
+            : 6 + 3 * groups.length + entry.number - 9;
+    const percent = entry.number === steps ? 100 : Math.min(99, Math.round((100 * position) / total));
+    const filled = Math.min(10, Math.max(0, Math.round(percent / 10)));
+    let progressLine = `Progress: ${"█".repeat(filled)}${"░".repeat(10 - filled)} ${percent}% · Step ${entry.number}/${steps} ${entry.title}`;
+    if (grouped)
+        progressLine += ` · Group ${ordinal} of ${groups.length}`;
+    if (input.attempt !== undefined && input.attempt > 1)
+        progressLine += ` · Attempt ${input.attempt}${input.max === undefined ? "" : ` of ${input.max}`}`;
+    return { percent, progressLine };
+}
 const CHALLENGE_ROUTES = new Set(["build-plan-tasks", "build-decision", "build-run-tests"]);
 const roundOf = (s) => {
     const round = Number(s.round);
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index 283fafb5f..aee766be2 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -16,8 +16,11 @@ import { clampLogPath, readRecords } from "../../ledgers/clamp-log.js";
 import { appendFrictionRow, frictionRow, journalEnabled } from "../../ledgers/journal.js";
 import { resolveRepoSlug } from "../../ledgers/telemetry.js";
 import { getPromptsRoot } from "../../shared/package-roots.js";
+import { readTextFile } from "../../shared/json.js";
 import { CommandError, EXIT, git, isSharedBranch, parseJson, repoRoot, runGit, } from "../lib.js";
-import { activeRunStart } from "./counters.js";
+import { activeRunStart, savedPointLimit } from "./counters.js";
+import { isResumable, runProgress, WORKFLOW_STEPS } from "./step-table.js";
+import { planFiles } from "./run-facts.js";
 import { fidProblem, normaliseFid, readIssueTracker } from "./fids.js";
 import { buildComment } from "./issues.js";
 import { EXIT_FOREIGN_PATH, activeRecord, ownPathCommit, ownSet, } from "./ledgers.js";
@@ -317,6 +320,71 @@ const CORE_ROW_KEYS = new Set([
 function fidOfStatusFile(file) {
     return /(?:^|\/)docs\/plans\/[0-9]{6}\/logs\/([^/]+)\/status\.jsonl$/.exec(file.split(path.sep).join("/"))?.[1];
 }
+/** Loop budgets use the same point names as the workflow counter routes. */
+function progressPoint(workflow, step, soak) {
+    if (workflow === "build") {
+        if (["build-plan-verify", "build-group-gate", "build-plan-gaps-remediate"].includes(step))
+            return "build.verify";
+        if (step === "build-challenge")
+            return "build.challenge";
+        if (["build-run-tests", "build-failure-diagnose", "build-failure-remediate"].includes(step))
+            return "build.tests";
+    }
+    if (workflow === "debug") {
+        if (step === "debug-failure-soak" || soak)
+            return "debug.soak";
+        if (["debug-run-tests", "debug-failure-diagnose", "debug-failure-remediate"].includes(step))
+            return "debug.fix";
+    }
+    if (workflow === "ship" &&
+        ["ship-merge-pr", "ship-failure-diagnose", "ship-failure-remediate"].includes(step))
+        return "ship.merge";
+    return undefined;
+}
+/** Prepare output before a completion mutates the log; progress is never persisted. */
+function stepProgress(cwd, r, number) {
+    if (r.status === "FAILED" || !isResumable(r.workflow))
+        return undefined;
+    const entry = WORKFLOW_STEPS[r.workflow].find((s) => number === undefined ? s.step === r.step : s.number === number);
+    if (entry === undefined) {
+        if (number !== undefined)
+            throw new CommandError(EXIT.USAGE, "--progress-number is not a workflow step");
+        return undefined;
+    }
+    if (fs.existsSync(r.file) && !readTextFile(r.file).ok)
+        throw new CommandError(EXIT_NO_STATUS, `${r.file} is unreadable`);
+    const runs = fs.existsSync(r.file) ? readRuns(r.file) : [];
+    const run = runs.filter((item) => item.workflow === r.workflow).at(-1);
+    const abs = path.resolve(cwd, r.file);
+    const canonical = /^(.*)\/docs\/plans\/([0-9]{6})\/logs\/([^/]+)\/status\.jsonl$/.exec(abs.split(path.sep).join("/"));
+    let groups = [];
+    if (r.workflow === "build" && canonical !== null) {
+        const [file] = planFiles(canonical[1], canonical[2], canonical[3]);
+        if (file !== undefined) {
+            const text = readTextFile(file);
+            if (!text.ok)
+                throw new CommandError(EXIT.USAGE, `progress plan ${file} is unreadable`);
+            const plan = parsePlanBlocks(text.text);
+            if (plan.errors.length > 0 || plan.fenceOpen !== undefined)
+                throw new CommandError(EXIT.USAGE, `invalid progress plan: ${plan.errors.map((e) => e.message).join("; ") || "unclosed code fence"}`);
+            groups = plan.groups.map((g) => g.group);
+        }
+    }
+    const prior = run?.steps.filter((s) => s.status === "DONE") ?? [];
+    const same = prior.filter((s) => s.step === r.step && (r.group === undefined || s.group === r.group));
+    const soak = runOrStepField(runs, r.workflow, "debugMode") === "SOAK";
+    const point = progressPoint(r.workflow, r.step, soak);
+    const attempt = r.attempt ?? (typeof r.extras?.round === "number" ? r.extras.round : same.at(-1)?.attempt);
+    return runProgress({
+        workflow: r.workflow,
+        step: r.step,
+        number,
+        groups,
+        group: r.group,
+        attempt,
+        max: point === undefined ? undefined : savedPointLimit(r.file, r.workflow, point, r.group),
+    }).progressLine;
+}
 /** Exit code: a debug run on a shared branch has no shared-checkout record, so nothing was written or committed. */
 export const EXIT_NO_RECORD = 14;
 /**
@@ -398,6 +466,7 @@ export function writeStepRow(cwd, r, log) {
         ...(r.strategy === undefined ? {} : { strategy: r.strategy }),
         ...(r.extras ?? {}),
     };
+    const progressLine = stepProgress(cwd, r);
     // An in-place run on a shared branch commits its own paths only; a refusal
     // comes before the append, so a re-run after the human's fix writes the row once.
     const fid = r.commit === "auto" ? fidOfStatusFile(r.file) : undefined;
@@ -461,7 +530,12 @@ export function writeStepRow(cwd, r, log) {
         return { row, commit: null, code: index === null ? code : EXIT.NEEDS_HUMAN };
     };
     if (r.commit === "none")
-        return { row, commit: null, code: EXIT.OK };
+        return {
+            row,
+            commit: null,
+            code: EXIT.OK,
+            ...(progressLine === undefined ? {} : { progressLine }),
+        };
     if (rec !== null) {
         let own;
         try {
@@ -474,13 +548,23 @@ export function writeStepRow(cwd, r, log) {
         }
         if (!own.ok)
             return failed(EXIT_COMMIT, `the commit failed: ${own.error}`);
-        return { row, commit: runGit(cwd, ["rev-parse", "HEAD"]).stdout, code: EXIT.OK };
+        return {
+            row,
+            commit: runGit(cwd, ["rev-parse", "HEAD"]).stdout,
+            code: EXIT.OK,
+            ...(progressLine === undefined ? {} : { progressLine }),
+        };
     }
     const add = addAllButCopied(cwd);
     const made = add.ok ? runGit(cwd, ["commit", "--allow-empty", "-m", r.message]) : add;
     if (!made.ok)
         return failed(EXIT_COMMIT, `the commit failed: ${made.stderr || made.stdout}`);
-    return { row, commit: runGit(cwd, ["rev-parse", "HEAD"]).stdout, code: EXIT.OK };
+    return {
+        row,
+        commit: runGit(cwd, ["rev-parse", "HEAD"]).stdout,
+        code: EXIT.OK,
+        ...(progressLine === undefined ? {} : { progressLine }),
+    };
 }
 /** Every mechanical gate check for one step; `ok` false names the first problem per check. */
 function gateChecks(cwd, o) {
@@ -1029,6 +1113,7 @@ async function finish(ctx) {
         row: written.row,
         parentSha: written.row.parentSha,
         commit: written.commit,
+        ...(written.progressLine === undefined ? {} : { progressLine: written.progressLine }),
         pass,
         checks,
         comment,
@@ -1114,6 +1199,7 @@ export const stepsCommand = {
             output: {
                 row: "the appended step-done row",
                 commit: "the new commit's sha, or null with --commit=none",
+                progressLine: "the exact chat progress line after a successful numbered completion",
             },
             textOmit: ["row"],
             exitCodes: {
@@ -1171,7 +1257,11 @@ export const stepsCommand = {
                     commit: commit,
                     message: str(f.message),
                 }, ctx.log);
-                ctx.emit({ row: written.row, commit: written.commit });
+                ctx.emit({
+                    row: written.row,
+                    commit: written.commit,
+                    ...(written.progressLine === undefined ? {} : { progressLine: written.progressLine }),
+                });
                 return written.code;
             },
         },
@@ -1306,6 +1396,7 @@ export const stepsCommand = {
                 parentSha: "the row's parentSha: HEAD before the step's commit",
                 commit: "the new commit's sha, or null with --commit=none",
                 pass: "every gate check passed",
+                progressLine: "the exact chat progress line after a successful numbered completion",
                 checks: "[{check, ok, detail}] per gate check",
                 comment: "the step's tracker comment body (with --number), else null",
                 commentFile: COMMENT_FILE_OUTPUT,
@@ -1381,6 +1472,11 @@ export const stepsCommand = {
                 WORKFLOW_FLAG,
                 STEP_FLAG,
                 GROUP_FLAG,
+                {
+                    name: "progress-number",
+                    type: "string",
+                    help: "render this completed numbered position without writing a status row",
+                },
                 {
                     name: "attempt",
                     type: "string",
@@ -1422,7 +1518,11 @@ export const stepsCommand = {
                     help: "the workflow lock must be held with this token (needs --fid)",
                 },
             ],
-            output: { pass: "true when every check passed", checks: "[{check, ok, detail}] per check" },
+            output: {
+                pass: "true when every check passed",
+                checks: "[{check, ok, detail}] per check",
+                progressLine: "with --progress-number: the exact chat progress line after the gate passes",
+            },
             exitCodes: {
                 [EXIT_NO_STATUS]: "status.jsonl missing (on disk, or on --ref), unreadable, or not valid NDJSON",
             },
@@ -1431,6 +1531,11 @@ export const stepsCommand = {
                 const file = str(f.file) === undefined ? undefined : statusFile(ctx);
                 const workflow = String(f.workflow);
                 const group = positiveInt(f.group, "group");
+                const progressNumber = positiveInt(f.progressNumber, "progress-number");
+                if (progressNumber !== undefined &&
+                    (!isResumable(workflow) ||
+                        !WORKFLOW_STEPS[workflow].some((s) => s.number === progressNumber)))
+                    throw new CommandError(EXIT.USAGE, "--progress-number is not a workflow step");
                 if (f.attempt !== undefined && f.attemptOf !== undefined)
                     throw new CommandError(EXIT.USAGE, "give --attempt or --attempt-of, not both");
                 if (f.attemptOf !== undefined && file === undefined)
@@ -1462,7 +1567,20 @@ export const stepsCommand = {
                 const pass = checks.every((c) => c.ok);
                 for (const c of checks.filter((x) => !x.ok))
                     ctx.log(`${c.check}: ${c.detail}`);
-                ctx.emit({ pass, checks });
+                const progressFile = file ??
+                    path.resolve(ctx.cwd, "docs", "plans", str(f.month) ?? "", "logs", str(f.fid) ?? "", "status.jsonl");
+                const progressLine = pass && progressNumber !== undefined
+                    ? stepProgress(ctx.cwd, {
+                        file: progressFile,
+                        workflow,
+                        step: String(f.step),
+                        group,
+                        attempt,
+                        artifacts: [],
+                        commit: "none",
+                    }, progressNumber)
+                    : undefined;
+                ctx.emit({ pass, checks, ...(progressLine === undefined ? {} : { progressLine }) });
                 return pass ? EXIT.OK : EXIT.NO;
             },
         },
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index 75450d3b1..742a793e0 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -971,8 +971,10 @@ export function closeWorkflow(cwd, o, log) {
     const parentSha = headSha(where.tree);
     // Graded first, so the report below carries this run's grade.
     const violations = gradeCompliance(where.tree, workflow, log, o.squashSha, { parentSha, step });
+    let progressLine;
     if (o.recordStep === true) {
-        writeStepRow(where.tree, { file: where.status, workflow, step, artifacts: [], commit: "none" }, log);
+        const written = writeStepRow(where.tree, { file: where.status, workflow, step, artifacts: [], commit: "none" }, log);
+        progressLine = written.progressLine;
     }
     writeCompletenessRow(where.status, workflow, parentSha, log);
     const endAt = statusTimestamp();
@@ -1109,6 +1111,7 @@ export function closeWorkflow(cwd, o, log) {
         comment,
         roadmapFoldNeeded: true,
         featureStatus: FEATURE_STATUS[workflow],
+        ...(progressLine === undefined ? {} : { progressLine }),
     };
 }
 /**
@@ -2037,6 +2040,7 @@ export const workflowsCommand = {
                 tracker: TRACKER_OUTPUT,
                 roadmapFoldNeeded: "always true: append the feature row and re-render the board (not run here)",
                 featureStatus: "roadmap status this close moves the feature to",
+                progressLine: "--record-step: the exact chat progress line after a numbered completion is recorded",
                 landed: "--flush: {ref, via: head-push | close-pr | close-pr-open}",
                 worktree: "--flush: the `bkit worktrees remove` result once the close is on dev; null while the close PR is unmerged or the removal failed",
                 sessionRemoved: SESSION_REMOVED_OUTPUT,
diff --git a/docs/capabilities.md b/docs/capabilities.md
index df6dbcde9..5e666a309 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -30,7 +30,7 @@
 > - `budgeted` = solid amber border + a faint amber box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.
 > - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.
 > - A fetched URL is a STRING, never an edge, because the reachability scan (§ Unreachable API calls) is the only check that sees it.
-> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `6af3da0ad`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
+> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `d8b627fcb`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
 > - Detail-level module graph → `pnpm graph`. This doc is the altitude above that: capabilities, not files.
 
 ## Status Vocabulary
@@ -84,10 +84,10 @@ Not scanned; run the rollup with `--reachability`.
 <!-- prettier-ignore -->
 | File | Evaluates at import | Downstream files | of which tests |
 | --- | --- | --- | --- |
-| `.bkit/core/engine/shared/text.ts` | `Symbol` | 190 | 113 |
-| `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 177 | 106 |
-| `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 177 | 106 |
-| `.bkit/core/engine/commands/workflow/workflows.ts` | `Error` | 177 | 106 |
+| `.bkit/core/engine/shared/text.ts` | `Symbol` | 191 | 114 |
+| `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 178 | 107 |
+| `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 178 | 107 |
+| `.bkit/core/engine/commands/workflow/workflows.ts` | `Error` | 178 | 107 |
 
 1 further file nothing imports, though an entrypoint is supposed to do work when it loads. In the JSON report only.
 
@@ -159,7 +159,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 6af3da0add44a098ea842cdeaa98d4623f9f7c8e — do not edit
+  %% Generated by bkit-graphify-rollup.py from d8b627fcb7b2f278a8ac2d7ddb9987b43a145851 — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
@@ -248,7 +248,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 6af3da0add44a098ea842cdeaa98d4623f9f7c8e — do not edit
+  %% Generated by bkit-graphify-rollup.py from d8b627fcb7b2f278a8ac2d7ddb9987b43a145851 — do not edit
   subgraph gncustom_health_checks["Health checks"]
     n_bkit_core_engine_checks_after_index[".bkit/core/engine/checks/after/index<br/>11 symbols · 1 files"]
     n_bkit_core_engine_checks_before_index[".bkit/core/engine/checks/before/index<br/>4 symbols · 1 files"]
