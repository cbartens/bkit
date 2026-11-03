diff --git a/.bkit/core/engine/commands/registry.ts b/.bkit/core/engine/commands/registry.ts
index 0fba69708..d7757e05c 100644
--- a/.bkit/core/engine/commands/registry.ts
+++ b/.bkit/core/engine/commands/registry.ts
@@ -26,6 +26,7 @@ import { runtimeCommand } from "./workflow/runtime.js";
 import { skillsCommand } from "./workflow/skills.js";
 import { statusCommand } from "./workflow/status.js";
 import { stepsCommand } from "./workflow/steps.js";
+import { tasksCommand } from "./workflow/tasks.js";
 import { testsCommand } from "./workflow/tests.js";
 import { workflowsCommand } from "./workflow/workflows.js";
 import { workstreamsCommand } from "./workflow/workstreams.js";
@@ -35,6 +36,7 @@ export const COMMANDS: readonly CommandSpec[] = [
   statusCommand,
   countersCommand,
   stepsCommand,
+  tasksCommand,
   runtimeCommand,
   repoCommand,
   fidsCommand,
diff --git a/.bkit/core/engine/commands/workflow/tasks.test.ts b/.bkit/core/engine/commands/workflow/tasks.test.ts
new file mode 100644
index 000000000..9bd6ae0ab
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -0,0 +1,233 @@
+/**
+ * commands/workflow/tasks.test.ts — `bkit tasks`: the plan tick and the group's open set.
+ *
+ * Each test writes a plan and (for `open`) an execute log in a temp folder and reads
+ * the command's one output object; the plan file's other lines are compared byte for
+ * byte, because the tick rewrites one heading line and nothing else.
+ */
+
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+
+import { afterEach, describe, expect, it } from "vitest";
+
+import { runCommand } from "../lib";
+import { tasksCommand } from "./tasks";
+
+const dirs: string[] = [];
+const tmp = () => {
+  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tasks-")));
+  dirs.push(d);
+  return d;
+};
+afterEach(() => {
+  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
+  cwd = "";
+});
+
+const task = (n: number, tick = " ") => [
+  `<!-- bkit:task ${n} start -->`,
+  `- [${tick}] **TASK ${n}:** Task ${n} title.`,
+  "  - **DONE WHEN:** done",
+  "  - **TEST FIRST:** n/a — docs only",
+  `<!-- bkit:task ${n} end -->`,
+];
+const group = (n: number, ...tasks: string[][]) => [
+  `<!-- bkit:group ${n} start -->`,
+  `### GROUP ${n}: Group ${n} title`,
+  "",
+  ...tasks.flatMap((t) => [...t, ""]),
+  `<!-- bkit:group ${n} end -->`,
+];
+/** A plan with the given groups and prose after them, so an untouched trailing line is real. */
+const planText = (...groups: string[][]) =>
+  [
+    "# Plan",
+    "",
+    "## The work",
+    "",
+    ...groups.flatMap((g) => [...g, ""]),
+    "## Tail",
+    "",
+    "| left | right |",
+    "| --- | --- |",
+    "| a | b |",
+    "",
+  ].join("\n");
+
+let cwd = "";
+/** The test's temp folder, created on first use. */
+const dir = () => {
+  if (cwd === "") cwd = tmp();
+  return cwd;
+};
+const write = (name: string, text: string) => {
+  const file = path.join(dir(), name);
+  fs.mkdirSync(path.dirname(file), { recursive: true });
+  fs.writeFileSync(file, text);
+  return file;
+};
+const read = (file: string) => fs.readFileSync(file, "utf-8");
+
+async function run(argv: string[]) {
+  const out: string[] = [];
+  const err: string[] = [];
+  const code = await runCommand(["tasks", ...argv, "--json"], [tasksCommand], {
+    classicVerbs: new Set(),
+    cwd,
+    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
+  });
+  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
+}
+
+/** The heading line of task `n` in `text`: the line a tick rewrites. */
+const headOf = (text: string, n: number) =>
+  text.split("\n").find((l) => l.includes(`**TASK ${n}:**`))!;
+const tickOf = (text: string, n: number) => /^- \[([ x])\]/.exec(headOf(text, n))![1];
+
+describe("bkit tasks tick", () => {
+  it("tick marks only the named tasks", async () => {
+    const plan = write("plan.md", planText(group(1, task(1), task(2), task(3))));
+    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=2"]);
+    expect(r.code).toBe(0);
+    expect(r.json.ticked).toEqual([2]);
+    expect([tickOf(read(plan), 1), tickOf(read(plan), 2), tickOf(read(plan), 3)]).toEqual([
+      " ",
+      "x",
+      " ",
+    ]);
+  });
+
+  it("tick refuses a task in another group", async () => {
+    const text = planText(group(1, task(1)), group(2, task(2)));
+    const plan = write("other-group.md", text);
+    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=2"]);
+    expect(r.code).toBe(2);
+    expect(r.err).toContain("TASK 2");
+    expect(r.err).toContain("group 2");
+    expect(read(plan)).toBe(text);
+  });
+
+  it("tick refuses a plan with no task blocks", async () => {
+    const plan = write("no-blocks.md", "# Plan\n\nNo task blocks here.\n");
+    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=1"]);
+    expect(r.code).toBe(1);
+    expect(r.err).toMatch(/no task markers/);
+  });
+
+  it("tick narrows the group's gap-free tasks by --tasks", async () => {
+    const plan = write("gapped.md", planText(group(1, task(1), task(2))));
+    const green = write(
+      "green.md",
+      [
+        "Enforced: true",
+        "Verdict: CONCERNS",
+        "Gaps: 1",
+        "",
+        "<!-- verdict:end -->",
+        "",
+        "## Gaps",
+        "",
+        "- Task 2 `not-green` — `.bkit/x.test.ts` `b` does not exist — Fixable: true — log: TASK 2: not-green",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=1,2", `--green=${green}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.ticked).toEqual([1]);
+    expect(tickOf(read(plan), 2)).toBe(" ");
+  });
+
+  it("tick is idempotent on an already-ticked task", async () => {
+    const plan = write("idempotent.md", planText(group(1, task(1), task(2))));
+    const first = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=1,2"]);
+    expect(first.code).toBe(0);
+    const once = read(plan);
+    const second = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=1,2"]);
+    expect(second.code).toBe(0);
+    expect(second.json.ticked).toEqual([]);
+    expect(read(plan)).toBe(once);
+  });
+
+  it("tick refuses a --tasks value that is not a task number", async () => {
+    const text = planText(group(1, task(1)));
+    const plan = write("bad-number.md", text);
+    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=one"]);
+    expect(r.code).toBe(2);
+    expect(r.err).toContain("--tasks");
+    expect(read(plan)).toBe(text);
+  });
+
+  it("tick refuses a --plan that is no file", async () => {
+    dir();
+    const r = await run(["tick", "--plan=no-such-plan.md", "--group=1", "--tasks=1"]);
+    expect(r.code).toBe(2);
+    expect(r.err).toContain("no-such-plan.md");
+  });
+
+  it("tick leaves every other plan line byte-identical", async () => {
+    const text = planText(group(1, task(1), task(2)), group(2, task(3)));
+    const plan = write("bytes.md", text);
+    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=2"]);
+    expect(r.code).toBe(0);
+    const after = read(plan).split("\n");
+    const before = text.split("\n");
+    expect(after).toHaveLength(before.length);
+    expect(after.filter((l, i) => l !== before[i])).toEqual(["- [x] **TASK 2:** Task 2 title."]);
+  });
+
+  it("tick refuses a call with no --group or with neither selector", async () => {
+    const text = planText(group(1, task(1)));
+    const plan = write("no-group.md", text);
+    const noGroup = await run(["tick", `--plan=${plan}`, "--tasks=1"]);
+    expect(noGroup.code).toBe(2);
+    expect(noGroup.err).toContain("--group");
+    const noSelector = await run(["tick", `--plan=${plan}`, "--group=1"]);
+    expect(noSelector.code).toBe(2);
+    expect(noSelector.err).toMatch(/--tasks|--green/);
+    expect(read(plan)).toBe(text);
+  });
+});
+
+describe("bkit tasks open", () => {
+  it("open lists tasks with no done line", async () => {
+    const plan = write("open.md", planText(group(1, task(1), task(2), task(3))));
+    const log = write(
+      "open-log.md",
+      [
+        "DONE — TASK 1: First — implemented (a.ts)",
+        "BLOCKED — TASK 2: Second — the migration is missing",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([3]);
+    expect(r.json.handover).toBe(true);
+  });
+
+  it("open sets handover only when a task is open", async () => {
+    const plan = write("open-all.md", planText(group(1, task(1), task(2))));
+    const log = write(
+      "open-all-log.md",
+      [
+        "DONE — TASK 1: First — implemented (a.ts)",
+        "BLOCKED — TASK 2: Second — the migration is missing",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([]);
+    expect(r.json.handover).toBe(false);
+  });
+
+  it("open refuses a plan with no task blocks", async () => {
+    const plan = write("open-plain.md", "# Plan\n\nNo task blocks here.\n");
+    const log = write("open-plain-log.md", "");
+    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
+    expect(r.code).toBe(1);
+    expect(r.err).toMatch(/no task markers/);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/tasks.ts b/.bkit/core/engine/commands/workflow/tasks.ts
new file mode 100644
index 000000000..e57d9754b
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/tasks.ts
@@ -0,0 +1,236 @@
+// commands/workflow/tasks.ts — the plan's task boxes as a command.
+//
+// The tick a verified group hands over: `tick` addresses each task by the heading line
+// inside the block `parsePlanBlocks` returns (`line`..`end`), rewrites only that line's
+// box `[ ]` -> `[x]` and leaves every other byte of the plan as it was. Idempotent: a
+// task already ticked is not rewritten and never repeated in `ticked`. `--green` reads a
+// `bkit tests green` report and drops every task it gaps, so a group's gap-free tasks
+// tick without the caller re-reading the report.
+
+import * as fs from "node:fs";
+import * as path from "node:path";
+
+import { parseJson } from "../../shared/json.js";
+import { CommandError, EXIT, type CommandSpec } from "../lib.js";
+import { parsePlanBlocks, type PlanGroup, type PlanTaskBlock } from "./plan-blocks.js";
+import { positiveInt, str } from "./status.js";
+import { NO_MARKERS_REASON, doneTasks } from "./tests.js";
+
+/** A task's heading line: the box and the number the tick addresses. */
+const TASK_BOX = /^(\s*)- \[([ xX])\] \*\*TASK (\d+):\*\*/;
+
+/** A `tests green` report's gap line: `- Task {N} \`{kind}\` — …`. */
+const REPORT_GAP = /^-\s+Task\s+(\d+)\s+`/gm;
+
+interface Plan {
+  file: string;
+  /** The plan as written: every line the tick does not rewrite stays byte-identical. */
+  text: string;
+  groups: PlanGroup[];
+  tasks: PlanTaskBlock[];
+}
+
+/** The plan at `arg`, its blocks parsed: exit 2 for no such file or a block that does not parse, 1 for no task blocks. */
+function readPlan(cwd: string, arg: string): Plan {
+  const file = path.resolve(cwd, arg);
+  if (fs.statSync(file, { throwIfNoEntry: false })?.isFile() !== true)
+    throw new CommandError(EXIT.USAGE, `${arg} does not exist`);
+  const text = fs.readFileSync(file, "utf-8");
+  const blocks = parsePlanBlocks(text);
+  const error = blocks.errors[0];
+  if (error !== undefined)
+    throw new CommandError(
+      EXIT.USAGE,
+      `${arg}:${error.line}: ${error.message} — run \`bkit tests plan-check\``,
+    );
+  if (blocks.tasks.length === 0) throw new CommandError(EXIT.NO, `${arg}: ${NO_MARKERS_REASON}`);
+  return { file, text, groups: blocks.groups, tasks: blocks.tasks };
+}
+
+/** The tasks of `group`: exit 2 when the plan has no such group. */
+function groupTasks(plan: Plan, arg: string, group: number): PlanTaskBlock[] {
+  if (!plan.groups.some((g) => g.group === group))
+    throw new CommandError(EXIT.USAGE, `${arg} has no GROUP ${group}`);
+  return plan.tasks.filter((t) => t.group === group);
+}
+
+/** The task numbers a repeated value names: comma- or space-separated, each a positive integer. */
+function taskNumbers(values: readonly string[], flag: string): number[] {
+  const numbers: number[] = [];
+  for (const value of values)
+    for (const token of value.split(/[\s,]+/).filter((t) => t !== "")) {
+      if (!/^[1-9][0-9]*$/.test(token))
+        throw new CommandError(
+          EXIT.USAGE,
+          `--${flag} must name positive task numbers, got "${token}"`,
+        );
+      const n = Number(token);
+      if (!numbers.includes(n)) numbers.push(n);
+    }
+  if (numbers.length === 0) throw new CommandError(EXIT.USAGE, `--${flag} names no task`);
+  return numbers;
+}
+
+/**
+ * The task numbers a `bkit tests green` report gaps: the `- Task {N} \`{kind}\`` lines of
+ * its `## Gaps` section, or the `gaps` array of its `--json` payload.
+ */
+export function gappedTasks(text: string): number[] {
+  const json = parseJson(text);
+  if (json.ok && typeof json.value === "object" && json.value !== null) {
+    const gaps = (json.value as { gaps?: unknown }).gaps;
+    if (Array.isArray(gaps))
+      return gaps
+        .map((g) => (typeof g === "object" && g !== null ? (g as { task?: unknown }).task : null))
+        .filter((t): t is number => typeof t === "number");
+  }
+  return [...text.matchAll(REPORT_GAP)].map((m) => Number(m[1]));
+}
+
+/** `task`'s heading line inside its block: its box and number, or null when the block holds none. */
+function headBox(lines: string[], task: PlanTaskBlock): { index: number; ticked: boolean } | null {
+  for (let i = task.line - 1; i < task.end; i++) {
+    const box = TASK_BOX.exec(lines[i]!);
+    if (box !== null && Number(box[3]) === task.task) return { index: i, ticked: box[2] !== " " };
+  }
+  return null;
+}
+
+export const tasksCommand: CommandSpec = {
+  noun: "tasks",
+  summary: "Tick a plan's task boxes, from the tasks a verify judged satisfied.",
+  verbs: {
+    tick: {
+      summary:
+        "Tick the named tasks of one plan group, less those a `tests green` report gaps; exit 0 ticked (including none), 1 a plan with no task blocks, 2 a bad flag value or plan.",
+      flags: [
+        {
+          name: "plan",
+          type: "string",
+          required: true,
+          help: "plan file holding the task blocks",
+        },
+        {
+          name: "group",
+          type: "string",
+          required: true,
+          help: "the plan group whose tasks are candidates (positive integer)",
+        },
+        {
+          name: "tasks",
+          type: "string",
+          repeatable: true,
+          help: "the task numbers to tick, comma-separated or once per number (one of --tasks / --green)",
+        },
+        {
+          name: "green",
+          type: "string",
+          help: "a `bkit tests green` report: every task it gaps stays unticked (one of --tasks / --green)",
+        },
+      ],
+      output: {
+        plan: "the plan file ticked, as given",
+        group: "the group whose tasks were candidates",
+        ticked: "[task numbers] ticked by this call; a task already ticked is not repeated",
+      },
+      run: (ctx) => {
+        const planArg = String(ctx.flags.plan);
+        const group = positiveInt(ctx.flags.group, "group");
+        if (group === undefined)
+          throw new CommandError(EXIT.USAGE, "missing required flag --group");
+        const tasksFlag = ctx.flags.tasks as string[] | undefined;
+        const greenArg = str(ctx.flags.green);
+        if (greenArg === "") throw new CommandError(EXIT.USAGE, "--green must be non-empty");
+        if (tasksFlag === undefined && greenArg === undefined)
+          throw new CommandError(EXIT.USAGE, "give one of --tasks and --green");
+        const plan = readPlan(ctx.cwd, planArg);
+        const candidates = groupTasks(plan, planArg, group);
+        const named = tasksFlag === undefined ? undefined : taskNumbers(tasksFlag, "tasks");
+        for (const n of named ?? []) {
+          const task = plan.tasks.find((t) => t.task === n);
+          if (task === undefined) throw new CommandError(EXIT.USAGE, `${planArg} has no TASK ${n}`);
+          if (task.group !== group)
+            throw new CommandError(
+              EXIT.USAGE,
+              `TASK ${n} is in group ${task.group}, not group ${group}`,
+            );
+        }
+        const gapped = new Set<number>();
+        if (greenArg !== undefined) {
+          const greenFile = path.resolve(ctx.cwd, greenArg);
+          if (fs.statSync(greenFile, { throwIfNoEntry: false })?.isFile() !== true)
+            throw new CommandError(EXIT.USAGE, `--green ${greenArg} does not exist`);
+          for (const n of gappedTasks(fs.readFileSync(greenFile, "utf-8"))) gapped.add(n);
+        }
+        const wanted = named ?? candidates.map((t) => t.task);
+        const lines = plan.text.split(/\r?\n/);
+        const eol = plan.text.includes("\r\n") ? "\r\n" : "\n";
+        const ticked: number[] = [];
+        for (const n of wanted) {
+          if (gapped.has(n)) continue;
+          const task = candidates.find((t) => t.task === n);
+          if (task === undefined) continue;
+          const head = headBox(lines, task);
+          if (head === null || head.ticked) continue;
+          lines[head.index] = lines[head.index]!.replace(/^(\s*)- \[ \] /, "$1- [x] ");
+          ticked.push(n);
+        }
+        if (ticked.length > 0) fs.writeFileSync(plan.file, lines.join(eol));
+        for (const n of ticked) ctx.log(`ticked TASK ${n}`);
+        ctx.emit({
+          plan: planArg,
+          group,
+          ticked,
+        });
+        return EXIT.OK;
+      },
+    },
+    open: {
+      summary:
+        "Print the group's tasks holding neither a `DONE` nor a `BLOCKED` line in the plan-execute log, and whether any is open; exit 0 (including none), 1 a plan with no task blocks, 2 a missing file or group.",
+      flags: [
+        {
+          name: "plan",
+          type: "string",
+          required: true,
+          help: "plan file holding the task blocks",
+        },
+        {
+          name: "group",
+          type: "string",
+          required: true,
+          help: "the plan group whose tasks are read (positive integer)",
+        },
+        {
+          name: "log",
+          type: "string",
+          required: true,
+          help: "the plan-execute log holding its `DONE` / `BLOCKED — TASK {N}` lines",
+        },
+      ],
+      output: {
+        plan: "the plan file read, as given",
+        group: "the group whose tasks were read",
+        tasks: "[task numbers] the group's tasks with neither a `DONE` nor a `BLOCKED` line",
+        handover: "true when at least one task is open, else false",
+      },
+      run: (ctx) => {
+        const planArg = String(ctx.flags.plan);
+        const group = positiveInt(ctx.flags.group, "group");
+        if (group === undefined)
+          throw new CommandError(EXIT.USAGE, "missing required flag --group");
+        const logArg = String(ctx.flags.log);
+        const logFile = path.resolve(ctx.cwd, logArg);
+        if (fs.statSync(logFile, { throwIfNoEntry: false })?.isFile() !== true)
+          throw new CommandError(EXIT.USAGE, `--log ${logArg} does not exist`);
+        const plan = readPlan(ctx.cwd, planArg);
+        const candidates = groupTasks(plan, planArg, group);
+        const closed = new Set(doneTasks(fs.readFileSync(logFile, "utf-8"), ["DONE", "BLOCKED"]));
+        const open = candidates.filter((t) => !t.done && !closed.has(t.task)).map((t) => t.task);
+        for (const n of open) ctx.log(`TASK ${n} is open`);
+        ctx.emit({ plan: planArg, group, tasks: open, handover: open.length > 0 });
+        return EXIT.OK;
+      },
+    },
+  },
+};
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index e27f29212..30052ae25 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -773,9 +773,16 @@ function taskCodeCommits(
   return commits;
 }
 
-/** The task numbers a plan-execute log records `DONE — TASK N` for, in log order. */
-export function doneTasks(log: string): number[] {
-  return [...log.matchAll(/^DONE\s*[—–-]+\s*TASK\s+(\d+)\b/gim)].map((m) => Number(m[1]));
+/**
+ * The task numbers a plan-execute log records `DONE — TASK N` for, in log order. `verbs`
+ * widens the reader to the log's other closing lines (`BLOCKED`), so one parser serves
+ * every caller; the default reads `DONE` only, which is what "the task is done" means.
+ */
+export function doneTasks(log: string, verbs: readonly string[] = ["DONE"]): number[] {
+  const closing = verbs.map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
+  return [...log.matchAll(new RegExp(`^(?:${closing})\\s*[—–-]+\\s*TASK\\s+(\\d+)\\b`, "gim"))].map(
+    (m) => Number(m[1]),
+  );
 }
 
 /**
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index 949fb7a3d..90e4fb46a 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -388,8 +388,12 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>" --number=6 --post --title="Plan Execute"
    ```
    Hold `verdict` as `EXECUTE_VERDICT`.
-5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 7 ticks tasks:
-   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
+5. Route — the engine reads the group's open tasks:
+   ```bash
+   "{BKIT}" tasks open --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md"
+   ```
+   Hold `handover` as `EXECUTE_HANDOVER`.
+   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** `EXECUTE_HANDOVER` = true) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
    - **Else** → Step 7.
 
 ### 🔒 Gate 6 — Plan Execute
@@ -424,33 +428,36 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 4. **Subagent:** Invoke `@bkit-build-plan-verify` using `Agent` tool:
    Context: You are a subagent in the Build phase. Group verification. Group `{GROUP}`, attempt `{VERIFY_ATTEMPT}`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
    Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-*.md`.
-   Update: `docs/plans/{YYYYMM}/{FID}-plan.md` (tick only group `{GROUP}`'s tasks).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`.
 5. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>" --number=7 --post --title="Plan Verify"
    ```
-   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`.
-6. Route:
+   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`, `fields.Tasks` as `{VERIFIED_TASKS}`.
+6. Tick the plan with the satisfied task numbers; a task the test-first report gaps stays open:
+   ```bash
+   "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --tasks="{VERIFIED_TASKS}" --green="docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md"
+   ```
+7. Route:
    - **If** `VERIFY_VERDICT` = PASS → list the plan's groups:
      ```bash
      "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="{OUTBOX}/build-plan-check-{GROUP}.md"
      ```
-     **If** exit non-zero → **Failure Path**. **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 7. **Else** → `GATE_VERDICT` = SKIPPED → sub-step 9.
-   - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 9.
-7. Run the group gate; it writes the trimmed log to the artifact:
+     **If** exit non-zero → **Failure Path**. **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8. **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
+   - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
+8. Run the group gate; it writes the trimmed log to the artifact:
    ```bash
    "{BKIT}" tests run --gate=bkit:gate:static-unit-integration --gate=bkit:gate:static-unit --log="{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md" --fid={FID} --step=build-group-gate-{GROUP} --attempt={VERIFY_ATTEMPT}
    ```
    Route:
-   - **If** exit 0 **or** 1 → hold `verdict` as `{GATE_VERDICT}`, `scope` as `{TEST_SCOPE}` → sub-step 8.
+   - **If** exit 0 **or** 1 → hold `verdict` as `{GATE_VERDICT}`, `scope` as `{TEST_SCOPE}` → sub-step 9.
    - **Else** → **Failure Path**.
-8. Finish:
+9. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>" --number=7 --post --title="Group Gate"
    ```
-9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
-10. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
+10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
+11. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
     ```bash
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
@@ -463,7 +470,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
     - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_LOOP` → **Decision Pause**.
     - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** (no round left: decide the open gaps).
     - **Else** → **Failure Path**.
-11. **Else** → **Failure Path**.
+12. **Else** → **Failure Path**.
 
 ### 🔒 Gate 7 — Plan Verify
 
@@ -479,7 +486,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ### 🧠 Step 8 — Plan Gaps Remediate
 
-**Run only if** Step 7 sub-step 10 or the **Decision Pause** routed here.
+**Run only if** Step 7 sub-step 12 or the **Decision Pause** routed here.
 
 1. Read status.jsonl and derive next `STRATEGY`:
    ```bash
@@ -548,7 +555,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --message="chore({FID}): plan-verify-holistic" --number=9 --post --title="Plan Verify Holistic"
    ```
-4. Route:
+   Hold `fields.Tasks` as `{VERIFIED_TASKS}`.
+4. Tick each group's satisfied tasks — one call per plan group, `{GROUP}` that group and `{VERIFIED_TASKS}` the numbers `Tasks:` names for it:
+   ```bash
+   "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --tasks="{VERIFIED_TASKS}"
+   ```
+5. Route:
    - **If** `verdict` = PASS or CONCERNS → Step 10.
    - **Else** → **Failure Path**.
 
diff --git a/.bkit/core/prompts/bkit-build-plan-verify.md b/.bkit/core/prompts/bkit-build-plan-verify.md
index 36a72ce20..af365c451 100644
--- a/.bkit/core/prompts/bkit-build-plan-verify.md
+++ b/.bkit/core/prompts/bkit-build-plan-verify.md
@@ -28,7 +28,7 @@ autoCompactWindow: 300000
 **Contract:** The terms between this agent and whoever runs it.
 
 - **Read / Update / Create:** Use any appended Read / Update / Create as exact I/O paths.
-- **Mandate:** Verify plan implementation; change plan only to mark tasks done; do not build, install, or write code.
+- **Mandate:** Verify plan implementation and pass the task numbers you judged satisfied on the header's `Tasks` line; never edit the plan; do not build, install, or write code.
 - **No commits:** Do not run `git commit` / `git add` / `git push` (caller does).
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Runbook tasks:** The runbook is groups of task blocks in build order (schema, then API, then UI). A group is `<!-- bkit:group N start -->`, `### GROUP N: {title}`, its task blocks and `<!-- bkit:group N end -->`, holding tasks and `TEST FIRST` tests within the per-group plan caps your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all); bigger → split the group. A task is `<!-- bkit:task N start -->`, `- [ ] **TASK N:** {title}`, one sub-bullet per field and `<!-- bkit:task N end -->`, its number unique across the plan. Fields, uppercase: `**CREATE:**` / `**READ:**` / `**UPDATE:**` / `**DELETE:**` (`` `{symbol}` in `{file}`: {what} `` or `` `{file}`: {what} ``, one line per reference), `**DEPENDS ON:**` (task numbers, same or earlier group), `**DONE WHEN:**`, `**TEST FIRST:**`, `**TEST EXCEPTION:**`; `bkit tests plan-check` refuses task-like text outside every block. `DONE WHEN` is short, testable and checkable in the codebase (a file exists, a signature matches, a test passes, a behaviour shows). A task that adds or changes logic names its own tests and fixes the tests it breaks; no task leaves its tests to a later one. Behaviour tests come only from `Derived Test Matrix` rows, and a task crossing a boundary (DB, API, model, network, migration) pairs them with non-mock tests. An audit plan has one task per in-scope finding id; tasks group findings only on one shared root cause and still name every id.
@@ -62,8 +62,8 @@ autoCompactWindow: 300000
 3. Read `.agents/docs.md` → load docs for workflow / step / task; skip missing.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available. Per gap — append log at EOF via Bash `echo {log entry} >> {output}`; heredoc for multi-line; `{log entry}` is the gap's report `logLine` with your decided `Fixable: true` / `Fixable: false` in place of the engine's `Fixable: null`; each entry ends `— Fixable: true` or `— Fixable: false` (by gap-remediate). **If** any gap `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
 5. Determine `Mode` from input Context (`Group` or `Holistic`).
-6. **If** `Group` → the supplied briefs' task blocks are the work; judge them against the supplied group diff (the changes since the group started), not the whole branch; a brief's `Deviations` section holds the owner's run instructions → judge the tasks it names as it directs. Every task field and gate maps to real codebase changes. Find missing components, skipped steps, unimplemented edge cases. Cross-reference the tasks vs the execute log's `DONE — TASK {N}` lines; a `DONE` line is a claim to check, never proof.
-7. **If** `Holistic` → same task / gate / `DONE` log cross-reference across every group of the plan, plus integration: groups' components work together? API contracts match? Shared state consistent? Cross-domain boundaries respected? Run `pnpm bkit:gate:static-unit`.
+6. **If** `Group` → the supplied briefs' task blocks are the work; judge them against the supplied group diff (the changes since the group started), not the whole branch; a brief's `Deviations` section holds the owner's run instructions → judge the tasks it names as it directs. Every task field and gate maps to real codebase changes. Find missing components, skipped steps, unimplemented edge cases.
+7. **If** `Holistic` → the same task and gate check across every group of the plan, plus integration: groups' components work together? API contracts match? Shared state consistent? Cross-domain boundaries respected? Run `pnpm bkit:gate:static-unit`.
 8. **If** test-first audit report supplied (`Enforced` / `Verdict` / `Gaps` header) → decide each gap: its `fixable` stands unless `null`, and a `null` one you decide from the diff it names:
    - `delete-still-referenced` → read each hit; a different thing with the same name → no gap; else `Fixable: true`.
    - `test-changed` → read its diff; only formatting → no gap; weakened, removed or rewritten assertions → `Fixable: false`.
@@ -73,7 +73,7 @@ autoCompactWindow: 300000
    - `Enforced: false` → reason in `Notes`; no gap.
    - `Late-red check` section → each task not checked in `Notes`; no gap.
    - A gap you leave `Fixable: false` is a `FAIL`.
-9. Per task → assert codebase satisfies `DONE WHEN` (file exists, signature matches, test passes, observable behaviour) and has no test-first audit gap; `BLOCKED` log lines, `docs/deferrals.jsonl` rows, and out-of-scope notes never satisfy it; gaps a supplied decision record accepts (`Decision: Accept`, or `Decision: Accept (assumed)`) are no gap (name the record in `Notes`; an assumed accept is taken without the owner, so add `assumed, not the owner's acceptance`). **If** satisfied → tick its `- [ ] **TASK {N}:**` line `[x]` in the plan file; tick nothing else. **If** not satisfied or missing → leave `[ ]`, append log; **If** the gap is `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
+9. Per task → assert codebase satisfies `DONE WHEN` (file exists, signature matches, test passes, observable behaviour) and has no test-first audit gap; `BLOCKED` log lines, `docs/deferrals.jsonl` rows, and out-of-scope notes never satisfy it; gaps a supplied decision record accepts (`Decision: Accept`, or `Decision: Accept (assumed)`) are no gap (name the record in `Notes`; an assumed accept is taken without the owner, so add `assumed, not the owner's acceptance`). **If** satisfied → name its number on the header's `Tasks` line; the workflow ticks the plan. **If** not satisfied or missing → leave it off that line, append log; **If** the gap is `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
 10. Update **Create** — set `Failures` via `Edit` = count of unresolved gaps; set `Fixable` via `Edit` = `true` when any of those is `Fixable: true`, else `false`; set `Verdict` via `Edit` = the roll-up over the `Fixable` you decided: any `false` → `FAIL`, **Else** any `true` → `CONCERNS`, **Else** → `PASS`; never the report's `null`.
 
 **Output format:**
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 74185a93f..421bb7ae6 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -471,8 +471,12 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>" --number=6 --post --title="Plan Execute"
    ```
    Hold `verdict` as `EXECUTE_VERDICT`.
-5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 7 ticks tasks:
-   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
+5. Route — the engine reads the group's open tasks:
+   ```bash
+   "{BKIT}" tasks open --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md"
+   ```
+   Hold `handover` as `EXECUTE_HANDOVER`.
+   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** `EXECUTE_HANDOVER` = true) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
    - **Else** → Step 7.
 
 ### 🔒 Gate 6 — Plan Execute
@@ -507,33 +511,36 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 4. **Subagent:** Invoke `@bkit-build-plan-verify` using `Agent` tool:
    Context: You are a subagent in the Build phase. Group verification. Group `{GROUP}`, attempt `{VERIFY_ATTEMPT}`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
    Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-*.md`.
-   Update: `docs/plans/{YYYYMM}/{FID}-plan.md` (tick only group `{GROUP}`'s tasks).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`.
 5. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>" --number=7 --post --title="Plan Verify"
    ```
-   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`.
-6. Route:
+   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`, `fields.Tasks` as `{VERIFIED_TASKS}`.
+6. Tick the plan with the satisfied task numbers; a task the test-first report gaps stays open:
+   ```bash
+   "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --tasks="{VERIFIED_TASKS}" --green="docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md"
+   ```
+7. Route:
    - **If** `VERIFY_VERDICT` = PASS → list the plan's groups:
      ```bash
      "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="{OUTBOX}/build-plan-check-{GROUP}.md"
      ```
-     **If** exit non-zero → **Failure Path**. **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 7. **Else** → `GATE_VERDICT` = SKIPPED → sub-step 9.
-   - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 9.
-7. Run the group gate; it writes the trimmed log to the artifact:
+     **If** exit non-zero → **Failure Path**. **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8. **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
+   - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
+8. Run the group gate; it writes the trimmed log to the artifact:
    ```bash
    "{BKIT}" tests run --gate=bkit:gate:static-unit-integration --gate=bkit:gate:static-unit --log="{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md" --fid={FID} --step=build-group-gate-{GROUP} --attempt={VERIFY_ATTEMPT}
    ```
    Route:
-   - **If** exit 0 **or** 1 → hold `verdict` as `{GATE_VERDICT}`, `scope` as `{TEST_SCOPE}` → sub-step 8.
+   - **If** exit 0 **or** 1 → hold `verdict` as `{GATE_VERDICT}`, `scope` as `{TEST_SCOPE}` → sub-step 9.
    - **Else** → **Failure Path**.
-8. Finish:
+9. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>" --number=7 --post --title="Group Gate"
    ```
-9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
-10. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
+10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
+11. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
     ```bash
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
@@ -546,7 +553,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
     - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_LOOP` → **Decision Pause**.
     - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** (no round left: decide the open gaps).
     - **Else** → **Failure Path**.
-11. **Else** → **Failure Path**.
+12. **Else** → **Failure Path**.
 
 ### 🔒 Gate 7 — Plan Verify
 
@@ -562,7 +569,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ### 🧠 Step 8 — Plan Gaps Remediate
 
-**Run only if** Step 7 sub-step 10 or the **Decision Pause** routed here.
+**Run only if** Step 7 sub-step 12 or the **Decision Pause** routed here.
 
 1. Read status.jsonl and derive next `STRATEGY`:
    ```bash
@@ -631,7 +638,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --message="chore({FID}): plan-verify-holistic" --number=9 --post --title="Plan Verify Holistic"
    ```
-4. Route:
+   Hold `fields.Tasks` as `{VERIFIED_TASKS}`.
+4. Tick each group's satisfied tasks — one call per plan group, `{GROUP}` that group and `{VERIFIED_TASKS}` the numbers `Tasks:` names for it:
+   ```bash
+   "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --tasks="{VERIFIED_TASKS}"
+   ```
+5. Route:
    - **If** `verdict` = PASS or CONCERNS → Step 10.
    - **Else** → **Failure Path**.
 
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 513c6f83f..93cac8d19 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -7110,8 +7110,8 @@ Once per run: **If** the session prompt (`{SESSION_DIR}/prompt.md`) carries run
 Hold `artifact` as `{BRIEF}`, `group` as `{GROUP}`, `tasks` as `{GROUP_TASKS}`. **If** `group` = null → Step 9.
 Record the group's start commit, once per group:
 **If** `parentSha` = null →
-Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 7 ticks tasks:
-**If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
+Route — the engine reads the group's open tasks:
+**If** (`EXECUTE_VERDICT` = HANDOVER **or** `EXECUTE_HANDOVER` = true) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
 Group briefed (`context brief`), start commit recorded
 Source files implemented
 Derive the attempt the verify artifact is named for:
@@ -7119,11 +7119,12 @@ Derive the attempt the verify artifact is named for:
 **If** exit >= 2 → **Failure Path**.
 Cut the group's own diff, from the commit it started at:
 Hold `parentSha` as `{GROUP_BASE}`; null → **Failure Path**.
+Tick the plan with the satisfied task numbers; a task the test-first report gaps stays open:
 **If** `VERIFY_VERDICT` = PASS → list the plan's groups:
-**If** exit non-zero → **Failure Path**. **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 7. **Else** → `GATE_VERDICT` = SKIPPED → sub-step 9.
-**Else** → `GATE_VERDICT` = SKIPPED → sub-step 9.
+**If** exit non-zero → **Failure Path**. **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8. **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
+**Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
 Run the group gate; it writes the trimmed log to the artifact:
-**If** exit 0 **or** 1 → hold `verdict` as `{GATE_VERDICT}`, `scope` as `{TEST_SCOPE}` → sub-step 8.
+**If** exit 0 **or** 1 → hold `verdict` as `{GATE_VERDICT}`, `scope` as `{TEST_SCOPE}` → sub-step 9.
 **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
 **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
 **If** exit 1 → **Failure Path** (`build.verify.maxAttempts` used up).
@@ -7145,6 +7146,7 @@ Strategy computed before invocation
 No-progress attempt routed
 Check whether it already ran in this run:
 **If** `verdict` non-null → Step 10.
+Tick each group's satisfied tasks — one call per plan group, `{GROUP}` that group and `{VERIFIED_TASKS}` the numbers `Tasks:` names for it:
 [fit `workflow-summary-route` 0.80; keep: routes on the printed `verdict`, not `SUMMARY_VERDICT`] **If** `verdict` = PASS or CONCERNS → Step 10.
 Subagent invoked (`@bkit-build-plan-verify`, holistic, no inline work)
 Set the challenge round. **If** `CHALLENGE_DONE` = true → Step 11. **If** `CHALLENGE_ROUND` is held → keep it. **Else** → read it from status.jsonl:
@@ -7707,8 +7709,8 @@ A gap you leave `Fixable: false` is a `FAIL`.
 `Late-red check` section → each task not checked in `Notes`; no gap.
 Update **Create** — set `Failures` via `Edit` = count of unresolved gaps; set `Fixable` via `Edit` = `true` when any of those is `Fixable: true`, else `false`; set `Verdict` via `Edit` = the roll-up over the `Fixable` you decided: any `false` → `FAIL`, **Else** any `true` → `CONCERNS`, **Else** → `PASS`; never the report's `null`.
 Determine `Mode` from input Context (`Group` or `Holistic`).
-**If** `Group` → the supplied briefs' task blocks are the work; judge them against the supplied group diff (the changes since the group started), not the whole branch; a brief's `Deviations` section holds the owner's run instructions → judge the tasks it names as it directs. Every task field and gate maps to real codebase changes. Find missing components, skipped steps, unimplemented edge cases. Cross-reference the tasks vs the execute log's `DONE — TASK {N}` lines; a `DONE` line is a claim to check, never proof.
-[R78] **If** `Holistic` → same task / gate / `DONE` log cross-reference across every group of the plan, plus integration: groups' components work together? API contracts match? Shared state consistent? Cross-domain boundaries respected? Run `pnpm bkit:gate:static-unit`.
+**If** `Group` → the supplied briefs' task blocks are the work; judge them against the supplied group diff (the changes since the group started), not the whole branch; a brief's `Deviations` section holds the owner's run instructions → judge the tasks it names as it directs. Every task field and gate maps to real codebase changes. Find missing components, skipped steps, unimplemented edge cases.
+[R78] **If** `Holistic` → the same task and gate check across every group of the plan, plus integration: groups' components work together? API contracts match? Shared state consistent? Cross-domain boundaries respected? Run `pnpm bkit:gate:static-unit`.
 `delete-still-referenced` → read each hit; a different thing with the same name → no gap; else `Fixable: true`.
 `no-red` on a task the plan-currency report classifies `Broken` with work already landed **and** the execute log records `DONE — TASK {N}: already landed` → no gap, overriding the gap's `Fixable: false`.
 ```
diff --git a/dist/commands/registry.js b/dist/commands/registry.js
index c89ab12b4..83b6299fa 100644
--- a/dist/commands/registry.js
+++ b/dist/commands/registry.js
@@ -24,6 +24,7 @@ import { runtimeCommand } from "./workflow/runtime.js";
 import { skillsCommand } from "./workflow/skills.js";
 import { statusCommand } from "./workflow/status.js";
 import { stepsCommand } from "./workflow/steps.js";
+import { tasksCommand } from "./workflow/tasks.js";
 import { testsCommand } from "./workflow/tests.js";
 import { workflowsCommand } from "./workflow/workflows.js";
 import { workstreamsCommand } from "./workflow/workstreams.js";
@@ -32,6 +33,7 @@ export const COMMANDS = [
     statusCommand,
     countersCommand,
     stepsCommand,
+    tasksCommand,
     runtimeCommand,
     repoCommand,
     fidsCommand,
diff --git a/dist/commands/workflow/tasks.js b/dist/commands/workflow/tasks.js
new file mode 100644
index 000000000..bb884c9d8
--- /dev/null
+++ b/dist/commands/workflow/tasks.js
@@ -0,0 +1,220 @@
+// commands/workflow/tasks.ts — the plan's task boxes as a command.
+//
+// The tick a verified group hands over: `tick` addresses each task by the heading line
+// inside the block `parsePlanBlocks` returns (`line`..`end`), rewrites only that line's
+// box `[ ]` -> `[x]` and leaves every other byte of the plan as it was. Idempotent: a
+// task already ticked is not rewritten and never repeated in `ticked`. `--green` reads a
+// `bkit tests green` report and drops every task it gaps, so a group's gap-free tasks
+// tick without the caller re-reading the report.
+import * as fs from "node:fs";
+import * as path from "node:path";
+import { parseJson } from "../../shared/json.js";
+import { CommandError, EXIT } from "../lib.js";
+import { parsePlanBlocks } from "./plan-blocks.js";
+import { positiveInt, str } from "./status.js";
+import { NO_MARKERS_REASON, doneTasks } from "./tests.js";
+/** A task's heading line: the box and the number the tick addresses. */
+const TASK_BOX = /^(\s*)- \[([ xX])\] \*\*TASK (\d+):\*\*/;
+/** A `tests green` report's gap line: `- Task {N} \`{kind}\` — …`. */
+const REPORT_GAP = /^-\s+Task\s+(\d+)\s+`/gm;
+/** The plan at `arg`, its blocks parsed: exit 2 for no such file or a block that does not parse, 1 for no task blocks. */
+function readPlan(cwd, arg) {
+    const file = path.resolve(cwd, arg);
+    if (fs.statSync(file, { throwIfNoEntry: false })?.isFile() !== true)
+        throw new CommandError(EXIT.USAGE, `${arg} does not exist`);
+    const text = fs.readFileSync(file, "utf-8");
+    const blocks = parsePlanBlocks(text);
+    const error = blocks.errors[0];
+    if (error !== undefined)
+        throw new CommandError(EXIT.USAGE, `${arg}:${error.line}: ${error.message} — run \`bkit tests plan-check\``);
+    if (blocks.tasks.length === 0)
+        throw new CommandError(EXIT.NO, `${arg}: ${NO_MARKERS_REASON}`);
+    return { file, text, groups: blocks.groups, tasks: blocks.tasks };
+}
+/** The tasks of `group`: exit 2 when the plan has no such group. */
+function groupTasks(plan, arg, group) {
+    if (!plan.groups.some((g) => g.group === group))
+        throw new CommandError(EXIT.USAGE, `${arg} has no GROUP ${group}`);
+    return plan.tasks.filter((t) => t.group === group);
+}
+/** The task numbers a repeated value names: comma- or space-separated, each a positive integer. */
+function taskNumbers(values, flag) {
+    const numbers = [];
+    for (const value of values)
+        for (const token of value.split(/[\s,]+/).filter((t) => t !== "")) {
+            if (!/^[1-9][0-9]*$/.test(token))
+                throw new CommandError(EXIT.USAGE, `--${flag} must name positive task numbers, got "${token}"`);
+            const n = Number(token);
+            if (!numbers.includes(n))
+                numbers.push(n);
+        }
+    if (numbers.length === 0)
+        throw new CommandError(EXIT.USAGE, `--${flag} names no task`);
+    return numbers;
+}
+/**
+ * The task numbers a `bkit tests green` report gaps: the `- Task {N} \`{kind}\`` lines of
+ * its `## Gaps` section, or the `gaps` array of its `--json` payload.
+ */
+export function gappedTasks(text) {
+    const json = parseJson(text);
+    if (json.ok && typeof json.value === "object" && json.value !== null) {
+        const gaps = json.value.gaps;
+        if (Array.isArray(gaps))
+            return gaps
+                .map((g) => (typeof g === "object" && g !== null ? g.task : null))
+                .filter((t) => typeof t === "number");
+    }
+    return [...text.matchAll(REPORT_GAP)].map((m) => Number(m[1]));
+}
+/** `task`'s heading line inside its block: its box and number, or null when the block holds none. */
+function headBox(lines, task) {
+    for (let i = task.line - 1; i < task.end; i++) {
+        const box = TASK_BOX.exec(lines[i]);
+        if (box !== null && Number(box[3]) === task.task)
+            return { index: i, ticked: box[2] !== " " };
+    }
+    return null;
+}
+export const tasksCommand = {
+    noun: "tasks",
+    summary: "Tick a plan's task boxes, from the tasks a verify judged satisfied.",
+    verbs: {
+        tick: {
+            summary: "Tick the named tasks of one plan group, less those a `tests green` report gaps; exit 0 ticked (including none), 1 a plan with no task blocks, 2 a bad flag value or plan.",
+            flags: [
+                {
+                    name: "plan",
+                    type: "string",
+                    required: true,
+                    help: "plan file holding the task blocks",
+                },
+                {
+                    name: "group",
+                    type: "string",
+                    required: true,
+                    help: "the plan group whose tasks are candidates (positive integer)",
+                },
+                {
+                    name: "tasks",
+                    type: "string",
+                    repeatable: true,
+                    help: "the task numbers to tick, comma-separated or once per number (one of --tasks / --green)",
+                },
+                {
+                    name: "green",
+                    type: "string",
+                    help: "a `bkit tests green` report: every task it gaps stays unticked (one of --tasks / --green)",
+                },
+            ],
+            output: {
+                plan: "the plan file ticked, as given",
+                group: "the group whose tasks were candidates",
+                ticked: "[task numbers] ticked by this call; a task already ticked is not repeated",
+            },
+            run: (ctx) => {
+                const planArg = String(ctx.flags.plan);
+                const group = positiveInt(ctx.flags.group, "group");
+                if (group === undefined)
+                    throw new CommandError(EXIT.USAGE, "missing required flag --group");
+                const tasksFlag = ctx.flags.tasks;
+                const greenArg = str(ctx.flags.green);
+                if (greenArg === "")
+                    throw new CommandError(EXIT.USAGE, "--green must be non-empty");
+                if (tasksFlag === undefined && greenArg === undefined)
+                    throw new CommandError(EXIT.USAGE, "give one of --tasks and --green");
+                const plan = readPlan(ctx.cwd, planArg);
+                const candidates = groupTasks(plan, planArg, group);
+                const named = tasksFlag === undefined ? undefined : taskNumbers(tasksFlag, "tasks");
+                for (const n of named ?? []) {
+                    const task = plan.tasks.find((t) => t.task === n);
+                    if (task === undefined)
+                        throw new CommandError(EXIT.USAGE, `${planArg} has no TASK ${n}`);
+                    if (task.group !== group)
+                        throw new CommandError(EXIT.USAGE, `TASK ${n} is in group ${task.group}, not group ${group}`);
+                }
+                const gapped = new Set();
+                if (greenArg !== undefined) {
+                    const greenFile = path.resolve(ctx.cwd, greenArg);
+                    if (fs.statSync(greenFile, { throwIfNoEntry: false })?.isFile() !== true)
+                        throw new CommandError(EXIT.USAGE, `--green ${greenArg} does not exist`);
+                    for (const n of gappedTasks(fs.readFileSync(greenFile, "utf-8")))
+                        gapped.add(n);
+                }
+                const wanted = named ?? candidates.map((t) => t.task);
+                const lines = plan.text.split(/\r?\n/);
+                const eol = plan.text.includes("\r\n") ? "\r\n" : "\n";
+                const ticked = [];
+                for (const n of wanted) {
+                    if (gapped.has(n))
+                        continue;
+                    const task = candidates.find((t) => t.task === n);
+                    if (task === undefined)
+                        continue;
+                    const head = headBox(lines, task);
+                    if (head === null || head.ticked)
+                        continue;
+                    lines[head.index] = lines[head.index].replace(/^(\s*)- \[ \] /, "$1- [x] ");
+                    ticked.push(n);
+                }
+                if (ticked.length > 0)
+                    fs.writeFileSync(plan.file, lines.join(eol));
+                for (const n of ticked)
+                    ctx.log(`ticked TASK ${n}`);
+                ctx.emit({
+                    plan: planArg,
+                    group,
+                    ticked,
+                });
+                return EXIT.OK;
+            },
+        },
+        open: {
+            summary: "Print the group's tasks holding neither a `DONE` nor a `BLOCKED` line in the plan-execute log, and whether any is open; exit 0 (including none), 1 a plan with no task blocks, 2 a missing file or group.",
+            flags: [
+                {
+                    name: "plan",
+                    type: "string",
+                    required: true,
+                    help: "plan file holding the task blocks",
+                },
+                {
+                    name: "group",
+                    type: "string",
+                    required: true,
+                    help: "the plan group whose tasks are read (positive integer)",
+                },
+                {
+                    name: "log",
+                    type: "string",
+                    required: true,
+                    help: "the plan-execute log holding its `DONE` / `BLOCKED — TASK {N}` lines",
+                },
+            ],
+            output: {
+                plan: "the plan file read, as given",
+                group: "the group whose tasks were read",
+                tasks: "[task numbers] the group's tasks with neither a `DONE` nor a `BLOCKED` line",
+                handover: "true when at least one task is open, else false",
+            },
+            run: (ctx) => {
+                const planArg = String(ctx.flags.plan);
+                const group = positiveInt(ctx.flags.group, "group");
+                if (group === undefined)
+                    throw new CommandError(EXIT.USAGE, "missing required flag --group");
+                const logArg = String(ctx.flags.log);
+                const logFile = path.resolve(ctx.cwd, logArg);
+                if (fs.statSync(logFile, { throwIfNoEntry: false })?.isFile() !== true)
+                    throw new CommandError(EXIT.USAGE, `--log ${logArg} does not exist`);
+                const plan = readPlan(ctx.cwd, planArg);
+                const candidates = groupTasks(plan, planArg, group);
+                const closed = new Set(doneTasks(fs.readFileSync(logFile, "utf-8"), ["DONE", "BLOCKED"]));
+                const open = candidates.filter((t) => !t.done && !closed.has(t.task)).map((t) => t.task);
+                for (const n of open)
+                    ctx.log(`TASK ${n} is open`);
+                ctx.emit({ plan: planArg, group, tasks: open, handover: open.length > 0 });
+                return EXIT.OK;
+            },
+        },
+    },
+};
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index 1ce80ba9c..f770a1d18 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -591,9 +591,14 @@ function taskCodeCommits(top, cwd, file, workflow) {
     }
     return commits;
 }
-/** The task numbers a plan-execute log records `DONE — TASK N` for, in log order. */
-export function doneTasks(log) {
-    return [...log.matchAll(/^DONE\s*[—–-]+\s*TASK\s+(\d+)\b/gim)].map((m) => Number(m[1]));
+/**
+ * The task numbers a plan-execute log records `DONE — TASK N` for, in log order. `verbs`
+ * widens the reader to the log's other closing lines (`BLOCKED`), so one parser serves
+ * every caller; the default reads `DONE` only, which is what "the task is done" means.
+ */
+export function doneTasks(log, verbs = ["DONE"]) {
+    const closing = verbs.map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
+    return [...log.matchAll(new RegExp(`^(?:${closing})\\s*[—–-]+\\s*TASK\\s+(\\d+)\\b`, "gim"))].map((m) => Number(m[1]));
 }
 /**
  * Why a task's `TEST EXCEPTION` lines do not count, or null when they do: every
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index 09a3101db..e87a684f3 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -317,3 +317,4 @@
 {"schema":3,"ts":1793004573756,"kind":"knowledge","key":"bkit-tests-red-snapshot-accepts-added-lines-only","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/commands/workflow/tests.ts",".bkit/core/engine/audits/workflows/question-option-format.test.ts"],"summary":"`bkit tests green` reads a test file as unchanged only when it keeps every snapshot line in order, so a fix to a rule after its recorded red must be pure addition","description":"- **Category:** tooling\n- **Symptom:** `bkit tests green` reports `changed: yes` and a `test-changed` gap for a test that passed its recorded red, with a `Diff since red` block, after the rule under test was corrected.\n- **Root cause:** `bkit tests red` copies the test file beside its log as `<log>.snapshot` and stores its blob; the green audit compares that snapshot with the current file through `onlyAddsLines`, which walks the snapshot's non-blank, whitespace-stripped lines as a subsequence of the current file. Inserted lines anywhere pass (`added lines only`); any modified or removed line fails. A red cannot simply be re-recorded, because `bkit tests red` refuses `passed` for a named test that now succeeds.\n- **Fix or rule:** correct a red-flagged rule by adding lines — a normalisation pass appended inside the existing function, for instance — never by editing the lines the red validated; add the new behaviour as a separate pass over the existing output and leave the old lines in order. A `TEST EXCEPTION` committed by a human is the only other way past a test-order gap.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"`onlyAddsLines` is a subsequence test over the snapshot's normalised lines, so the red evidence pins the exact byte order of the old lines: an edit breaks it, an insertion does not. `bkit tests red` will not re-record a red for a named test that now passes.","remediation":"After a red, extend the rule with inserted lines (an extra pass over the existing function's result) and keep every old line intact; verify the gap stays clear with `bkit tests green --group=<n>`.","status":"ACTIVE"}
 {"schema":3,"ts":1793005661580,"kind":"knowledge","key":"dogfood-template-mirrors-need-install-after-a-core-template-or-core-bkit-doc-edit","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/audits/templates/templates.test.ts",".bkit/core/docs/templates/bkit-plan.md","docs/templates/bkit-plan.md",".bkit/core/.bkit/workflows.md",".bkit/workflows.md",".bkit/install.md"],"summary":"Editing a core template or a core `.bkit/` doc reds the unit gate on the dogfood-parity test until the repo's own `bkit install` re-renders the mirrors","description":"The unit tier holds the repo's own installed copies byte-equal to their sources: `.bkit/core/engine/audits/templates/templates.test.ts` asserts `docs/templates/bkit-plan.md` and every `docs/templates/bkit-audit-*.md` equal their `.bkit/core/docs/templates/*` source but for the managed-version stamp, and `bkit check`'s core pass writes the `.bkit/core/.bkit/*.md` sources into the root `.bkit/*.md` mirrors. So an edit to a `.bkit/core/docs/templates/*.md` or `.bkit/core/.bkit/*.md` file leaves the gate red until the mirrors move, and the same edit makes `bkit check` report N write(s) of drift. A bare `bkit install` is not the fix: it errors because at least one module flag is required.","rootCause":"`docs/templates/bkit-*.md` and the root `.bkit/*.md` reference docs are install OUTPUTS, not hand-kept files, but only the host mirrors (`.claude/`, `.cursor/`, `.codex/`, `.opencode/`, `.agents/skills/`, `.agents/plugins/bkit/`) are conventionally thought of as rendered; the dogfood template and reference-doc copies look like ordinary tracked markdown, so a source edit there reads as complete while its mirror is still stale.","remediation":"After editing any `.bkit/core/docs/templates/*.md` or `.bkit/core/.bkit/*.md` file, re-render the mirrors with the repo's own install — `pnpm bkit install --claude --cursor --codex --antigravity --opencode=<provider>` (every installed host; a bare `bkit install` errors) — then confirm `node dist/cli.js check` reports 0 write(s). NEVER hand-edit `docs/templates/bkit-*.md` or the root `.bkit/*.md` mirrors; the install owns them and would revert the edit. `.bkit/version` re-pins the re-rendered files' hashes in the same run, so commit it too.","status":"ACTIVE"}
 {"schema":3,"ts":1793100920719,"kind":"knowledge","key":"prettier-write-after-a-red-breaks-the-test-first-audit","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/commands/workflow/tests.ts",".bkit/core/prompts/bkit-build-plan-verify.md"],"summary":"Format a test file before recording its red; a later `prettier --write` moves a line and the green audit then reports `test-changed` with `changed: yes`","description":"- **Category:** tooling\n- **Symptom:** `bkit tests green` reports one `test-changed` gap per planned test in a file whose reds were all recorded, with `Changed since red` = `yes` and a diff that removes a single line (a wrapped `expect(…)` joined into one line) and adds the task's new tests.\n- **Root cause:** `onlyAddsLines` walks the red snapshot's whitespace-stripped, non-blank lines as a subsequence of the current file, so a prettier pass that joins a wrapped call, or splits a long one, removes a line the snapshot holds and turns the row from `added lines only` into `yes`. `bkit tests red` cannot re-record the red once the named test passes.\n- **Fix or rule:** run `prettier --write` on the test file before recording its reds, and after every later test edit check the row with `bkit tests green`: an additions-only diff keeps the row at `added lines only`, whose prompt rule clears added lines outside every planned test.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"Red evidence pins the snapshot's line sequence; the formatter is the usual second writer of a test file after its red, and the red cannot be re-recorded once the test passes.","remediation":"`prettier --write` the test file before `bkit tests red`, and keep every post-red edit a pure insertion.","status":"ACTIVE"}
+{"schema":3,"ts":1793103134789,"kind":"knowledge","key":"workflow-reads-artifact-header-fields-after-steps-finish","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/audits/workflows/workflow-shape.test.ts",".bkit/core/engine/commands/workflow/steps.ts",".bkit/core/workflows/bkit-build.md"],"summary":"A workflow reads an artifact header's fields from `steps finish`'s `fields` output, so a verb that needs one runs in the sub-step after the finish, never before it","description":"- **Category:** tooling\n- **Symptom:** a workflow step that needs a subagent artifact's header field before the step's commit makes `workflow-shape.test.ts` fail with `<workflow> never reads a verdict outside `steps finish``.\n- **Root cause:** `bkit steps verdict` is barred from workflow files, and `steps finish` prints `fields` only once it has written the row and committed; a sub-step placed before the finish has no way to hold a declared field such as the verify artifact's task numbers.\n- **Fix or rule:** read the field from `steps finish`'s output and run the verb that consumes it in the sub-step after the finish; the edit it makes rides the next step's commit.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** low\n- **Scope:** bkit-repo\n- **Source:** agent"}
