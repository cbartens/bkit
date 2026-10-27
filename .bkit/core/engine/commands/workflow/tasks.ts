// commands/workflow/tasks.ts — the plan's task boxes as a command.
//
// The tick a verified group hands over: `tick` addresses each task by the heading line
// inside the block `parsePlanBlocks` returns (`line`..`end`), rewrites only that line's
// box `[ ]` -> `[x]` and leaves every other byte of the plan as it was. Idempotent: a
// task already ticked is not rewritten and never repeated in `ticked`. `--green` reads a
// `bkit tests green` report and drops every task it gaps, so a group's gap-free tasks
// tick without the caller re-reading the report.

import * as fs from "node:fs";
import * as path from "node:path";

import { parseJson } from "../../shared/json.js";
import { CommandError, EXIT, type CommandSpec } from "../lib.js";
import { parsePlanBlocks, type PlanGroup, type PlanTaskBlock } from "./plan-blocks.js";
import { positiveInt, str } from "./status.js";
import { NO_MARKERS_REASON, doneTasks } from "./tests.js";

/** A task's heading line: the box and the number the tick addresses. */
const TASK_BOX = /^(\s*)- \[([ xX])\] \*\*TASK (\d+):\*\*/;

/** A `tests green` report's gap line: `- Task {N} \`{kind}\` — …`. */
const REPORT_GAP = /^-\s+Task\s+(\d+)\s+`/gm;

interface Plan {
  file: string;
  /** The plan as written: every line the tick does not rewrite stays byte-identical. */
  text: string;
  groups: PlanGroup[];
  tasks: PlanTaskBlock[];
}

/** The plan at `arg`, its blocks parsed: exit 2 for no such file or a block that does not parse, 1 for no task blocks. */
function readPlan(cwd: string, arg: string): Plan {
  const file = path.resolve(cwd, arg);
  if (fs.statSync(file, { throwIfNoEntry: false })?.isFile() !== true)
    throw new CommandError(EXIT.USAGE, `${arg} does not exist`);
  const text = fs.readFileSync(file, "utf-8");
  const blocks = parsePlanBlocks(text);
  const error = blocks.errors[0];
  if (error !== undefined)
    throw new CommandError(
      EXIT.USAGE,
      `${arg}:${error.line}: ${error.message} — run \`bkit tests plan-check\``,
    );
  if (blocks.tasks.length === 0) throw new CommandError(EXIT.NO, `${arg}: ${NO_MARKERS_REASON}`);
  return { file, text, groups: blocks.groups, tasks: blocks.tasks };
}

/** The tasks of `group`: exit 2 when the plan has no such group. */
function groupTasks(plan: Plan, arg: string, group: number): PlanTaskBlock[] {
  if (!plan.groups.some((g) => g.group === group))
    throw new CommandError(EXIT.USAGE, `${arg} has no GROUP ${group}`);
  return plan.tasks.filter((t) => t.group === group);
}

/** The task numbers a repeated value names: comma- or space-separated, each a positive integer. */
function taskNumbers(values: readonly string[], flag: string): number[] {
  const numbers: number[] = [];
  for (const value of values)
    for (const token of value.split(/[\s,]+/).filter((t) => t !== "")) {
      if (!/^[1-9][0-9]*$/.test(token))
        throw new CommandError(
          EXIT.USAGE,
          `--${flag} must name positive task numbers, got "${token}"`,
        );
      const n = Number(token);
      if (!numbers.includes(n)) numbers.push(n);
    }
  if (numbers.length === 0) throw new CommandError(EXIT.USAGE, `--${flag} names no task`);
  return numbers;
}

/**
 * The task numbers a `bkit tests green` report gaps: the `- Task {N} \`{kind}\`` lines of
 * its `## Gaps` section, or the `gaps` array of its `--json` payload.
 */
export function gappedTasks(text: string): number[] {
  const json = parseJson(text);
  if (json.ok && typeof json.value === "object" && json.value !== null) {
    const gaps = (json.value as { gaps?: unknown }).gaps;
    if (Array.isArray(gaps))
      return gaps
        .map((g) => (typeof g === "object" && g !== null ? (g as { task?: unknown }).task : null))
        .filter((t): t is number => typeof t === "number");
  }
  return [...text.matchAll(REPORT_GAP)].map((m) => Number(m[1]));
}

/** `task`'s heading line inside its block: its box and number, or null when the block holds none. */
function headBox(lines: string[], task: PlanTaskBlock): { index: number; ticked: boolean } | null {
  for (let i = task.line - 1; i < task.end; i++) {
    const box = TASK_BOX.exec(lines[i]!);
    if (box !== null && Number(box[3]) === task.task) return { index: i, ticked: box[2] !== " " };
  }
  return null;
}

export const tasksCommand: CommandSpec = {
  noun: "tasks",
  summary: "Tick a plan's task boxes, from the tasks a verify judged satisfied.",
  verbs: {
    tick: {
      summary:
        "Tick the named tasks of one plan group, less those a `tests green` report gaps; exit 0 ticked (including none), 1 a plan with no task blocks, 2 a bad flag value or plan.",
      flags: [
        {
          name: "plan",
          type: "string",
          required: true,
          help: "plan file holding the task blocks",
        },
        {
          name: "group",
          type: "string",
          required: true,
          help: "the plan group whose tasks are candidates (positive integer)",
        },
        {
          name: "tasks",
          type: "string",
          repeatable: true,
          help: "the task numbers to tick, comma-separated or once per number (one of --tasks / --green)",
        },
        {
          name: "green",
          type: "string",
          help: "a `bkit tests green` report: every task it gaps stays unticked (one of --tasks / --green)",
        },
      ],
      output: {
        plan: "the plan file ticked, as given",
        group: "the group whose tasks were candidates",
        ticked: "[task numbers] ticked by this call; a task already ticked is not repeated",
      },
      run: (ctx) => {
        const planArg = String(ctx.flags.plan);
        const group = positiveInt(ctx.flags.group, "group");
        if (group === undefined)
          throw new CommandError(EXIT.USAGE, "missing required flag --group");
        const tasksFlag = ctx.flags.tasks as string[] | undefined;
        const greenArg = str(ctx.flags.green);
        if (greenArg === "") throw new CommandError(EXIT.USAGE, "--green must be non-empty");
        if (tasksFlag === undefined && greenArg === undefined)
          throw new CommandError(EXIT.USAGE, "give one of --tasks and --green");
        const plan = readPlan(ctx.cwd, planArg);
        const candidates = groupTasks(plan, planArg, group);
        const named = tasksFlag === undefined ? undefined : taskNumbers(tasksFlag, "tasks");
        for (const n of named ?? []) {
          const task = plan.tasks.find((t) => t.task === n);
          if (task === undefined) throw new CommandError(EXIT.USAGE, `${planArg} has no TASK ${n}`);
          if (task.group !== group)
            throw new CommandError(
              EXIT.USAGE,
              `TASK ${n} is in group ${task.group}, not group ${group}`,
            );
        }
        const gapped = new Set<number>();
        if (greenArg !== undefined) {
          const greenFile = path.resolve(ctx.cwd, greenArg);
          if (fs.statSync(greenFile, { throwIfNoEntry: false })?.isFile() !== true)
            throw new CommandError(EXIT.USAGE, `--green ${greenArg} does not exist`);
          for (const n of gappedTasks(fs.readFileSync(greenFile, "utf-8"))) gapped.add(n);
        }
        const wanted = named ?? candidates.map((t) => t.task);
        const lines = plan.text.split(/\r?\n/);
        const eol = plan.text.includes("\r\n") ? "\r\n" : "\n";
        const ticked: number[] = [];
        for (const n of wanted) {
          if (gapped.has(n)) continue;
          const task = candidates.find((t) => t.task === n);
          if (task === undefined) continue;
          const head = headBox(lines, task);
          if (head === null || head.ticked) continue;
          lines[head.index] = lines[head.index]!.replace(/^(\s*)- \[ \] /, "$1- [x] ");
          ticked.push(n);
        }
        if (ticked.length > 0) fs.writeFileSync(plan.file, lines.join(eol));
        for (const n of ticked) ctx.log(`ticked TASK ${n}`);
        ctx.emit({
          plan: planArg,
          group,
          ticked,
        });
        return EXIT.OK;
      },
    },
    open: {
      summary:
        "Print the group's tasks holding neither a `DONE` nor a `BLOCKED` line in the plan-execute log, and whether any is open; exit 0 (including none), 1 a plan with no task blocks, 2 a missing file or group.",
      flags: [
        {
          name: "plan",
          type: "string",
          required: true,
          help: "plan file holding the task blocks",
        },
        {
          name: "group",
          type: "string",
          required: true,
          help: "the plan group whose tasks are read (positive integer)",
        },
        {
          name: "log",
          type: "string",
          required: true,
          help: "the plan-execute log holding its `DONE` / `BLOCKED — TASK {N}` lines",
        },
      ],
      output: {
        plan: "the plan file read, as given",
        group: "the group whose tasks were read",
        tasks: "[task numbers] the group's tasks with neither a `DONE` nor a `BLOCKED` line",
        handover: "true when at least one task is open, else false",
      },
      run: (ctx) => {
        const planArg = String(ctx.flags.plan);
        const group = positiveInt(ctx.flags.group, "group");
        if (group === undefined)
          throw new CommandError(EXIT.USAGE, "missing required flag --group");
        const logArg = String(ctx.flags.log);
        const logFile = path.resolve(ctx.cwd, logArg);
        if (fs.statSync(logFile, { throwIfNoEntry: false })?.isFile() !== true)
          throw new CommandError(EXIT.USAGE, `--log ${logArg} does not exist`);
        const plan = readPlan(ctx.cwd, planArg);
        const candidates = groupTasks(plan, planArg, group);
        const closed = new Set(doneTasks(fs.readFileSync(logFile, "utf-8"), ["DONE", "BLOCKED"]));
        const open = candidates.filter((t) => !t.done && !closed.has(t.task)).map((t) => t.task);
        for (const n of open) ctx.log(`TASK ${n} is open`);
        ctx.emit({ plan: planArg, group, tasks: open, handover: open.length > 0 });
        return EXIT.OK;
      },
    },
  },
};
