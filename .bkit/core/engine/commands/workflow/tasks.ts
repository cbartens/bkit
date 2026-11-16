// commands/workflow/tasks.ts — the plan's task boxes as a command.
//
// The tick a verified group hands over: `tick` addresses each task by the heading line
// inside the block `parsePlanBlocks` returns (`line`..`end`), rewrites only that line's
// box `[ ]` -> `[x]` and leaves every other byte of the plan as it was. Idempotent: a
// task already ticked is not rewritten and never repeated in `ticked`. `--green` reads a
// `bkit tests green` report and drops every task it gaps, so a group's gap-free tasks
// tick without the caller re-reading the report.
//
// `open` reads the execute log for the group's `DONE` / `BLOCKED` lines; `currency`
// matches each task's `CREATE` / `READ` / `UPDATE` / `DELETE` paths and symbols against
// `{base}...{against}` and prints the matched paths, needles and diff hunks — the
// mechanical half of the plan-currency judgement, which stays with the agent.

import * as fs from "node:fs";
import * as path from "node:path";

import { parseJson } from "../../shared/json.js";
import { CommandError, EXIT, type CommandSpec, git, runGit } from "../lib.js";
import { EXIT_DIFF_FAILED, fetchRemoteRef } from "./branches.js";
import { decisionHeader, parseDecisionItems } from "./open-decision.js";
const DIFF_BASE = "origin/dev";
import {
  NO_MARKERS_REASON,
  parsePlanBlocks,
  type PlanGroup,
  type PlanRef,
  type PlanTaskBlock,
} from "./plan-blocks.js";
import { positiveInt, str } from "./status.js";
import { doneTasks } from "./tests.js";

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

/**
 * The task numbers a repeated value names: comma- or space-separated, each a positive
 * integer. The token `none` names nothing to tick, so the verify header's empty form
 * (`Tasks: none`) passes straight through as `ticked: []`.
 */
function taskNumbers(values: readonly string[], flag: string): number[] {
  const numbers: number[] = [];
  let none = false;
  for (const value of values)
    for (const token of value.split(/[\s,]+/).filter((t) => t !== "")) {
      if (token.toLowerCase() === "none") {
        none = true;
        continue;
      }
      if (!/^[1-9][0-9]*$/.test(token))
        throw new CommandError(
          EXIT.USAGE,
          `--${flag} must name positive task numbers, got "${token}"`,
        );
      const n = Number(token);
      if (!numbers.includes(n)) numbers.push(n);
    }
  if (numbers.length === 0 && !none) throw new CommandError(EXIT.USAGE, `--${flag} names no task`);
  return numbers;
}

/**
 * The task numbers a `bkit tests green` report gaps: the `- Task {N} \`{kind}\`` lines of
 * its `## Gaps` section, or the `gaps` array of its `--json` payload. Null when the report
 * holds neither: a report with no Gaps section says nothing about which tasks are green.
 */
export function gappedTasks(text: string): number[] | null {
  const json = jsonGaps(text);
  if (json !== null)
    return json
      .map((g) => (typeof g === "object" && g !== null ? (g as { task?: unknown }).task : null))
      .filter((t): t is number => typeof t === "number");
  const section = gapsSection(text);
  return section === null ? null : [...section.matchAll(REPORT_GAP)].map((m) => Number(m[1]));
}

/** The `gaps` array of a `--json` report, else null. */
function jsonGaps(text: string): unknown[] | null {
  const json = parseJson(text);
  if (!json.ok || typeof json.value !== "object" || json.value === null) return null;
  const gaps = (json.value as { gaps?: unknown }).gaps;
  return Array.isArray(gaps) ? gaps : null;
}

/** A text report's `## Gaps` section, up to the next `## ` heading; null when it has none. */
function gapsSection(text: string): string | null {
  const start = text.search(/^## Gaps\b/m);
  if (start < 0) return null;
  const rest = text.slice(start).replace(/^## Gaps[^\n]*\n?/, "");
  const end = rest.search(/^## /m);
  return end < 0 ? rest : rest.slice(0, end);
}

/**
 * Why a text report's Gaps section cannot be trusted: its header's `Gaps: N` counts more gap
 * lines (`- Task {N}` or `- Plan`) than the section holds, so a line inside a gap's detail
 * cut the section short. Null when the counts agree, or for a JSON report or one with no
 * `Gaps:` header.
 */
export function gapsShortfall(text: string): string | null {
  if (jsonGaps(text) !== null) return null;
  const header = text.split(/\r?\n[ \t]*\r?\n/, 1)[0] ?? "";
  const want = /^Gaps:[ \t]*([0-9]+)[ \t]*$/m.exec(header)?.[1];
  const section = gapsSection(text);
  if (want === undefined || section === null) return null;
  const read = [...section.matchAll(/^-\s+(?:Task\s+\d+|Plan)\s+`/gm)].length;
  return read < Number(want)
    ? `the header says Gaps: ${want} but the Gaps section holds ${read} gap line${read === 1 ? "" : "s"}`
    : null;
}

/**
 * The first header fact that stops `--decision` from ticking, or null: `From` is `verify` or
 * `holistic`, no `Gate: FAIL` header, and a verify file's `Group` is `group`. Headers count
 * only in the header block (`decisionHeader`).
 */
function decisionProblem(text: string, group: number | undefined): string | null {
  const header = decisionHeader(text);
  const from = header.From;
  if (from === undefined) return "no From header";
  if (from !== "verify" && from !== "holistic") return `From is "${from}", not verify or holistic`;
  if (/^FAIL\b/.test(header.Gate ?? "")) return "Gate: FAIL header: the gate is red";
  if (from === "holistic") return null;
  if (header.Group === undefined) return "no Group header";
  if (group === undefined) return "missing required flag --group for a From: verify file";
  if (header.Group !== String(group)) return `Group is "${header.Group}", not group ${group}`;
  return null;
}

/** `task`'s heading line inside its block: its box and number, or null when the block holds none. */
function headBox(lines: string[], task: PlanTaskBlock): { index: number; ticked: boolean } | null {
  for (let i = task.line - 1; i < task.end; i++) {
    const box = TASK_BOX.exec(lines[i]!);
    if (box !== null && Number(box[3]) === task.task) return { index: i, ticked: box[2] !== " " };
  }
  return null;
}

/** The refs a task names: its four path-and-symbol fields. */
const taskRefs = (task: PlanTaskBlock): PlanRef[] => [
  ...task.create,
  ...task.read,
  ...task.update,
  ...task.delete,
];

/**
 * A plan symbol as a `git diff -S` needle: a Markdown section's heading text, a flag,
 * or the leading identifier of an applied symbol (`doneTasks(log, verbs)` -> `doneTasks`).
 */
export function needleOf(symbol: string): string | undefined {
  const s = symbol.trim();
  if (s === "") return undefined;
  const heading = /^§\s*(.+)$/.exec(s);
  if (heading) return heading[1]!.trim();
  const token = /^(--?[\w-]+|[A-Za-z_$][\w$]*)/.exec(s)?.[0];
  if (token === undefined) return s;
  return /^[A-Za-z_$][\w$]*\s*[(\[]/.test(s) || token === s ? token : s;
}

/** `paths` as git printed them, split on NUL; empty output is no path. */
const splitPaths = (stdout: string): string[] => stdout.split("\0").filter(Boolean);

/** A workflow run log: another feature's record, never code a plan task reads or changes. */
const RUN_LOG = /^docs\/plans\/[^/]+\/logs\//;

export const tasksCommand: CommandSpec = {
  noun: "tasks",
  summary: "Tick a plan's task boxes, from the tasks a verify judged satisfied.",
  verbs: {
    tick: {
      summary:
        "Tick the named tasks of one task group, less those a `tests green` report gaps; exit 0 ticked (including none), 1 a plan with no task blocks, 2 a bad flag value or plan, a `--green` report with no Gaps section or fewer gap lines than its `Gaps:` header, or a `--decision` file that is not a verify or holistic pause of this group with a green gate.",
      use: "workflow",
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
          help: "the task group whose tasks are candidates (positive integer); required, except with a `From: holistic` --decision alone, whose accepted tasks are ticked in their own groups",
        },
        {
          name: "tasks",
          type: "string",
          repeatable: true,
          help: "the task numbers to tick, comma-separated or once per number; `none` ticks nothing (one of --tasks / --green / --decision)",
        },
        {
          name: "decision",
          type: "string",
          help: "a decision file with a `From: verify` (whose `Group` is --group) or `From: holistic` header and no `Gate: FAIL` header: the task each item answered `Accept` or `Accept (assumed)` names at the start of its title (`Task {N}`) is ticked; `Fix now` and undecided items tick nothing (one of --tasks / --green / --decision)",
        },
        {
          name: "green",
          type: "string",
          help: "a `bkit tests green` report: every task it gaps stays unticked (one of --tasks / --green / --decision)",
        },
      ],
      output: {
        plan: "the plan file ticked, as given",
        group:
          "the group whose tasks were candidates; null for a holistic --decision without --group",
        ticked: "[task numbers] ticked by this call; a task already ticked is not repeated",
      },
      run: (ctx) => {
        const planArg = String(ctx.flags.plan);
        const group = positiveInt(ctx.flags.group, "group");
        const tasksFlag = ctx.flags.tasks as string[] | undefined;
        const greenArg = str(ctx.flags.green);
        if (greenArg === "") throw new CommandError(EXIT.USAGE, "--green must be non-empty");
        const decisionArg = str(ctx.flags.decision);
        if (decisionArg === "") throw new CommandError(EXIT.USAGE, "--decision must be non-empty");
        if (tasksFlag === undefined && greenArg === undefined && decisionArg === undefined)
          throw new CommandError(EXIT.USAGE, "give one of --tasks, --green and --decision");
        let decisionText: string | undefined;
        if (decisionArg !== undefined) {
          const decisionFile = path.resolve(ctx.cwd, decisionArg);
          if (fs.statSync(decisionFile, { throwIfNoEntry: false })?.isFile() !== true)
            throw new CommandError(EXIT.USAGE, `--decision ${decisionArg} does not exist`);
          decisionText = fs.readFileSync(decisionFile, "utf-8");
        }
        // Only a holistic decision alone may leave out --group: its accepted tasks span groups.
        const holisticOnly =
          decisionText !== undefined &&
          decisionHeader(decisionText).From === "holistic" &&
          tasksFlag === undefined &&
          greenArg === undefined;
        if (group === undefined && !holisticOnly)
          throw new CommandError(EXIT.USAGE, "missing required flag --group");
        const plan = readPlan(ctx.cwd, planArg);
        const candidates = group === undefined ? plan.tasks : groupTasks(plan, planArg, group);
        let named = tasksFlag === undefined ? undefined : taskNumbers(tasksFlag, "tasks");
        for (const n of named ?? []) {
          const task = plan.tasks.find((t) => t.task === n);
          if (task === undefined) throw new CommandError(EXIT.USAGE, `${planArg} has no TASK ${n}`);
          if (task.group !== group)
            throw new CommandError(
              EXIT.USAGE,
              `TASK ${n} is in group ${task.group}, not group ${group}`,
            );
        }
        if (decisionText !== undefined) {
          const problem = decisionProblem(decisionText, group);
          if (problem !== null)
            throw new CommandError(
              EXIT.USAGE,
              `--decision ${decisionArg}: ${problem}, so nothing is ticked`,
            );
          // A title names its task only at its start (`Task {N}`): a gap that mentions a task elsewhere ticks nothing.
          const accepted = parseDecisionItems(decisionText)
            .filter((it) => it.decision !== null && /^Accept\b/.test(it.decision))
            .map((it) => /^task\s+(\d+)\b/i.exec(it.title.trim()))
            .filter((m): m is RegExpExecArray => m !== null)
            .map((m) => Number(m[1]));
          named = [
            ...(named ?? []),
            ...accepted.filter((n) => candidates.some((t) => t.task === n)),
          ];
        }
        const gapped = new Set<number>();
        if (greenArg !== undefined) {
          const greenFile = path.resolve(ctx.cwd, greenArg);
          if (fs.statSync(greenFile, { throwIfNoEntry: false })?.isFile() !== true)
            throw new CommandError(EXIT.USAGE, `--green ${greenArg} does not exist`);
          const greenText = fs.readFileSync(greenFile, "utf-8");
          const gaps = gappedTasks(greenText);
          if (gaps === null)
            throw new CommandError(
              EXIT.USAGE,
              `--green ${greenArg}: report has no Gaps section, so nothing is ticked`,
            );
          const shortfall = gapsShortfall(greenText);
          if (shortfall !== null)
            throw new CommandError(
              EXIT.USAGE,
              `--green ${greenArg}: ${shortfall}, so nothing is ticked`,
            );
          for (const n of gaps) gapped.add(n);
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
          group: group ?? null,
          ticked,
        });
        return EXIT.OK;
      },
    },
    open: {
      summary:
        "Print the group's tasks holding neither a `DONE` nor a `BLOCKED` line in the plan-execute log, and whether any is open; exit 0 (including none), 1 a plan with no task blocks, 2 a missing file or group.",
      use: "by-hand",
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
          help: "the task group whose tasks are read (positive integer)",
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
        // The log decides, not the box: a ticked task with no log line is still open.
        const open = candidates.filter((t) => !closed.has(t.task)).map((t) => t.task);
        for (const n of open) ctx.log(`TASK ${n} is open`);
        ctx.emit({ plan: planArg, group, tasks: open, handover: open.length > 0 });
        return EXIT.OK;
      },
    },
    currency: {
      summary:
        "Print each task whose CREATE / READ / UPDATE / DELETE paths or symbols moved between --base and --against, with its matched paths, needles and diff hunks (run logs under docs/plans/*/logs/ are left out); exit 0 (including no match), 1 a plan with no task blocks, 2 a bad plan.",
      use: "by-hand",
      flags: [
        {
          name: "plan",
          type: "string",
          required: true,
          help: "plan file holding the task blocks",
        },
        {
          name: "base",
          type: "string",
          help: "the commit the plan was written against (default origin/dev)",
        },
        {
          name: "against",
          type: "string",
          help: "the commit landed changes are judged on (default origin/dev)",
        },
      ],
      output: {
        plan: "the plan file read, as given",
        base: "the commit the plan was written against",
        against: "the commit landed changes were judged on",
        tasks:
          "each matched task ({task, group, paths, needles, hunks}): the changed paths and the needles that moved, and the diff over those paths only",
      },
      exitCodes: {
        [EXIT_DIFF_FAILED]: "--base or --against does not resolve, or git diff failed",
      },
      run: (ctx) => {
        const planArg = String(ctx.flags.plan);
        const base = str(ctx.flags.base) ?? DIFF_BASE;
        const against = str(ctx.flags.against) ?? DIFF_BASE;
        if (base === "") throw new CommandError(EXIT.USAGE, "--base must be non-empty");
        if (against === "") throw new CommandError(EXIT.USAGE, "--against must be non-empty");
        const plan = readPlan(ctx.cwd, planArg);
        const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]);
        if (top === null)
          throw new CommandError(EXIT.USAGE, `not inside a git work tree: ${ctx.cwd}`);
        for (const ref of [base, against]) {
          const fetched = fetchRemoteRef(top, ref);
          if (fetched !== null && !fetched.ok)
            ctx.log(
              `git fetch for ${ref} failed — judging against the last fetch: ${fetched.stderr}`,
            );
          if (git(top, ["rev-parse", "-q", "--verify", `${ref}^{commit}`]) === null)
            throw new CommandError(EXIT_DIFF_FAILED, `${ref} does not resolve to a commit`);
        }
        const range = `${base}...${against}`;
        const changed = runGit(top, ["diff", "--name-only", "-z", "--no-renames", range]);
        if (!changed.ok)
          throw new CommandError(EXIT_DIFF_FAILED, `git diff ${range} failed: ${changed.stderr}`);
        const changedPaths = splitPaths(changed.stdout).filter((p) => !RUN_LOG.test(p));
        const needleCache = new Map<string, string[]>();
        /** The paths `needle` moved in, read once per needle. */
        const needleMoves = (needle: string): string[] => {
          const cached = needleCache.get(needle);
          if (cached !== undefined) return cached;
          const diff = runGit(top, [
            "diff",
            "--no-renames",
            "-S",
            needle,
            "--name-only",
            "-z",
            range,
          ]);
          if (!diff.ok)
            throw new CommandError(
              EXIT_DIFF_FAILED,
              `git diff ${range} -S${needle} failed: ${diff.stderr}`,
            );
          const paths = splitPaths(diff.stdout).filter((p) => !RUN_LOG.test(p));
          needleCache.set(needle, paths);
          return paths;
        };
        const tasks: Array<{
          task: number;
          group: number;
          paths: string[];
          needles: string[];
          hunks: string[];
        }> = [];
        for (const task of plan.tasks) {
          const refs = taskRefs(task);
          const files = [...new Set(refs.map((r) => r.file.trim()).filter((f) => f !== ""))];
          const paths = changedPaths.filter((p) =>
            files.some((f) => p === f || p.startsWith(`${f}/`)),
          );
          const needles: string[] = [];
          for (const ref of refs) {
            if (ref.symbol === undefined) continue;
            const needle = needleOf(ref.symbol);
            if (needle === undefined || needles.includes(needle)) continue;
            if (needleMoves(needle).length > 0) needles.push(needle);
          }
          const matched =
            paths.length > 0
              ? paths
              : [...new Set(needles.flatMap((needle) => needleMoves(needle)))].sort();
          if (matched.length === 0) continue;
          const diff = runGit(top, ["diff", "--no-renames", range, "--", ...matched]);
          if (!diff.ok)
            throw new CommandError(EXIT_DIFF_FAILED, `git diff ${range} failed: ${diff.stderr}`);
          tasks.push({
            task: task.task,
            group: task.group,
            paths: matched,
            needles,
            hunks: diff.stdout === "" ? [] : diff.stdout.split("\n"),
          });
        }
        for (const t of tasks) ctx.log(`TASK ${t.task}: ${t.paths.join(", ")}`);
        ctx.emit({ plan: planArg, base, against, tasks });
        return EXIT.OK;
      },
    },
  },
};
