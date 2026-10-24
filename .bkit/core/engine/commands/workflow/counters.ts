// bkit counters derive|run|route|max — attempt counters derived from status.jsonl.
//
// No counter is stored. Each is counted from the log when needed, at one of three
// positions — read this before picking `--position`:
//   next     at the START of the counted step: count + 1, the attempt the artifact
//            name embeds and the row about to be written records.
//   current  AFTER the step's own row was just written: the count, which can never
//            be 0 there, so 0 is refused (it means the row was dropped).
//   count    routing on a DIFFERENT step, prior or not yet run: the bare count, and
//            0 is a legal answer (that step simply has not run).

import * as path from "node:path";

import {
  activeDoneSteps,
  lastDoneStepAllRuns,
  nextStrategy,
  runNumber,
  type Step,
} from "../../ledgers/status.js";
import { readBkitConfig } from "../../shared/settings.js";
import { LOOP_PAUSE_THRESHOLDS, THRESHOLDS } from "../../shared/thresholds.js";
import {
  CommandError,
  EXIT,
  git,
  runGit,
  type CommandSpec,
  type FlagValue,
  type RunContext,
} from "../lib.js";
import {
  EXIT_NO_STATUS,
  FILE_FLAG,
  STEP_FLAG,
  SUB_PLAN_FLAG,
  WORKFLOW_FLAG,
  positiveInt,
  readRuns,
  readStatusRows,
  statusFile,
  str,
} from "./status.js";

/** One MAX_* threshold by name; an unknown name is a usage error. */
export function threshold(name: string): number {
  const value = (THRESHOLDS as Readonly<Record<string, number>>)[name];
  if (value === undefined) {
    throw new CommandError(
      EXIT.USAGE,
      `unknown threshold ${name}; known: ${Object.keys(THRESHOLDS).join(", ")}`,
    );
  }
  return value;
}

/** Paths a fix round's code change is judged on: everything but plan logs and ledgers. */
const SOURCE_PATHS = [
  ".",
  ":(exclude)docs/plans",
  ":(exclude)docs/*.jsonl",
  ":(exclude).bkit/*.jsonl",
];

/** Exit code: `--position=current` found no row — the step's own row is missing. */
export const EXIT_NO_OWN_ROW = 4;

const nonNegativeInt = (v: FlagValue, flag: string): number => {
  const s = String(v ?? "");
  if (!/^[0-9]+$/.test(s)) {
    throw new CommandError(
      EXIT.USAGE,
      `--${flag} must be a non-negative integer, got "${s}" — refusing to continue`,
    );
  }
  return Number(s);
};

/**
 * `--of=<step>:<position>` over `--file` / `--workflow`: the counter at that position.
 * `--of=<step>,<step>...:count` sums the DONE rows of every listed step.
 */
function derivedOf(ctx: RunContext): number {
  const [list, position] = String(ctx.flags.of).split(":");
  const steps = (list ?? "").split(",");
  if (steps.some((s) => s === "") || !["next", "current", "count"].includes(position ?? ""))
    throw new CommandError(EXIT.USAGE, "--of must be <step>[,<step>...]:<next|current|count>");
  if (steps.length > 1 && (position !== "count" || new Set(steps).size !== steps.length))
    throw new CommandError(EXIT.USAGE, "--of with several steps takes distinct steps and :count");
  if (ctx.flags.file === undefined || ctx.flags.workflow === undefined)
    throw new CommandError(EXIT.USAGE, "--of needs --file and --workflow");
  const runs = readRuns(statusFile(ctx));
  const subPlan = positiveInt(ctx.flags.subPlan, "sub-plan");
  const count = steps.reduce(
    (n, step) =>
      n +
      activeDoneSteps(runs, String(ctx.flags.workflow), { step, subPlan }, str(ctx.flags.since))
        .length,
    0,
  );
  if (position === "current" && count === 0)
    throw new CommandError(
      EXIT_NO_OWN_ROW,
      `${steps[0]}: no DONE row in the active run — the step's own row is missing`,
    );
  return position === "next" ? count + 1 : count;
}

/** Rows of `type` in `workflow`'s active run (since its last workflow-started row). */
function typedRowCount(file: string, workflow: string, type: string): number {
  const rows = readStatusRows(file);
  let start = -1;
  rows.forEach((r, i) => {
    if (r.type === "workflow-started" && r.workflow === workflow) start = i;
  });
  return rows
    .slice(start + 1)
    .filter((r) => r.type === type && (r.workflow === undefined || r.workflow === workflow)).length;
}

/** `route --rows=<type>:<next|count>`: the value from typed rows of the active run. */
function derivedRows(ctx: RunContext): number {
  const [type, position] = String(ctx.flags.rows).split(":");
  if (!type || !["next", "count"].includes(position ?? ""))
    throw new CommandError(EXIT.USAGE, "--rows must be <row type>:<next|count>");
  if (ctx.flags.file === undefined || ctx.flags.workflow === undefined)
    throw new CommandError(EXIT.USAGE, "--rows needs --file and --workflow");
  const count = typedRowCount(statusFile(ctx), String(ctx.flags.workflow), type);
  return position === "next" ? count + 1 : count;
}

/** Whether `bkit.loopPause` is on for the checkout `cwd` sits in. */
function loopPauseOn(cwd: string): boolean {
  return readBkitConfig(git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd).loopPause;
}

/** The checkout a status.jsonl under `docs/plans/` belongs to; `cwd` when it is elsewhere. */
function checkoutOf(file: string, cwd: string): string {
  const abs = path.resolve(cwd, file);
  const at = abs.lastIndexOf(`${path.sep}docs${path.sep}plans${path.sep}`);
  return at < 0 ? cwd : abs.slice(0, at);
}

export type LoopTrend = "first-round" | "closing" | "stuck" | "worse";

/**
 * The loop's direction from its check rounds: `worse` when the problem count rose,
 * `closing` when it fell and the rounds changed code, `stuck` otherwise.
 */
export function loopTrend(rounds: Step[], codeChanged: boolean | null): LoopTrend {
  if (rounds.length < 2) return "first-round";
  const first = rounds[0]?.failures;
  const last = rounds.at(-1)?.failures;
  if (first === undefined || last === undefined) return "stuck";
  if (last > first) return "worse";
  if (last < first && codeChanged !== false) return "closing";
  return "stuck";
}

export const countersCommand: CommandSpec = {
  noun: "counters",
  summary: "Attempt counters derived from status.jsonl, and the MAX_* thresholds.",
  verbs: {
    derive: {
      summary: "Count a step's DONE rows in the active run, at one of three positions.",
      flags: [
        FILE_FLAG,
        WORKFLOW_FLAG,
        STEP_FLAG,
        SUB_PLAN_FLAG,
        {
          name: "position",
          type: "string",
          required: true,
          help: "next (step start: count+1) | current (after own row: count, 0 refused) | count (other step: 0 legal)",
        },
        {
          name: "since",
          type: "string",
          help: "run field holding a timestamp; only rows after it count (soakEntryAt)",
        },
      ],
      output: { value: "the counter at that position", count: "DONE rows counted" },
      exitCodes: {
        [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON",
        [EXIT_NO_OWN_ROW]: "--position=current counted 0: the step's own row is missing",
      },
      run: (ctx) => {
        const position = String(ctx.flags.position);
        if (!["next", "current", "count"].includes(position)) {
          throw new CommandError(EXIT.USAGE, "--position must be next, current, or count");
        }
        const count = activeDoneSteps(
          readRuns(statusFile(ctx)),
          String(ctx.flags.workflow),
          { step: String(ctx.flags.step), subPlan: positiveInt(ctx.flags.subPlan, "sub-plan") },
          str(ctx.flags.since),
        ).length;
        if (position === "current" && count === 0) {
          ctx.log(
            `${String(ctx.flags.step)}: no DONE row in the active run — the step's own row is missing`,
          );
          return EXIT_NO_OWN_ROW;
        }
        ctx.emit({ value: position === "next" ? count + 1 : count, count });
        return EXIT.OK;
      },
    },
    run: {
      summary: "Which run of the workflow this invocation is (1-based; a resume keeps its number).",
      flags: [FILE_FLAG, WORKFLOW_FLAG],
      output: { run: "run number" },
      exitCodes: { [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON" },
      run: (ctx) => {
        ctx.emit({ run: runNumber(readRuns(statusFile(ctx)), String(ctx.flags.workflow)) });
        return EXIT.OK;
      },
    },
    route: {
      summary: "Compare a counter to its max: exit 0 continue, exit 1 exceeded.",
      flags: [
        { name: "name", type: "string", required: true, help: "counter name, for the log line" },
        {
          name: "value",
          type: "string",
          help: "counter value (non-negative integer), or derive it with --of",
        },
        {
          name: "of",
          type: "string",
          help: "<step>:<next|current|count> — derive the value from --file (active run); <step>,<step>...:count sums the listed steps",
        },
        {
          name: "rows",
          type: "string",
          help: "<row type>:<next|count> — derive the value from rows of that type in --file's active run",
        },
        { ...FILE_FLAG, required: false, help: "status.jsonl, with --of or --rows" },
        { ...WORKFLOW_FLAG, required: false, help: "workflow, with --of or --rows" },
        { ...SUB_PLAN_FLAG, help: "with --of: only rows for this sub-plan" },
        {
          name: "since",
          type: "string",
          help: "with --of: run field holding a timestamp; only rows after it count (soakEntryAt)",
        },
        { name: "max", type: "string", help: "max as a number (or use --limit)" },
        { name: "limit", type: "string", help: "max as a threshold name, e.g. MAX_VERIFY_ATTEMPT" },
        { name: "continue", type: "string", help: "step to go to when value <= max" },
        { name: "exceeded", type: "string", help: "step to go to when value > max" },
        {
          name: "exceeded-paused",
          type: "string",
          help: "step to go to when value > max and bkit.loopPause lowered --limit to one round",
        },
      ],
      output: {
        value: "the counter compared",
        exceeded: "true when value > max",
        next: "--continue, --exceeded or --exceeded-paused step, whichever applies (null when not given)",
        max: "the max compared against",
        paused: "true when bkit.loopPause lowered --limit to one round",
      },
      exitCodes: {
        [EXIT_NO_STATUS]: "--of / --rows: status.jsonl missing, unreadable, or not valid NDJSON",
        [EXIT_NO_OWN_ROW]: "--of=<step>:current counted 0: the step's own row is missing",
      },
      run: (ctx) => {
        const name = String(ctx.flags.name);
        const sources = [ctx.flags.value, ctx.flags.of, ctx.flags.rows].filter(
          (v) => v !== undefined,
        ).length;
        if (sources !== 1)
          throw new CommandError(EXIT.USAGE, "give exactly one of --value, --of or --rows");
        const value =
          ctx.flags.of !== undefined
            ? derivedOf(ctx)
            : ctx.flags.rows !== undefined
              ? derivedRows(ctx)
              : nonNegativeInt(ctx.flags.value, "value");
        if ((ctx.flags.max === undefined) === (ctx.flags.limit === undefined)) {
          throw new CommandError(EXIT.USAGE, "give exactly one of --max or --limit");
        }
        const limit = str(ctx.flags.limit);
        const paused =
          limit !== undefined && limit in LOOP_PAUSE_THRESHOLDS && loopPauseOn(ctx.cwd);
        const max =
          limit === undefined
            ? nonNegativeInt(ctx.flags.max, "max")
            : paused
              ? (LOOP_PAUSE_THRESHOLDS[limit] ?? threshold(limit))
              : threshold(limit);
        const exceeded = value > max;
        if (exceeded) ctx.log(`counter ${name} exceeded max=${max} (value=${value})`);
        const exceededTo = paused
          ? (str(ctx.flags.exceededPaused) ?? str(ctx.flags.exceeded))
          : str(ctx.flags.exceeded);
        ctx.emit({
          value,
          exceeded,
          next: (exceeded ? exceededTo : str(ctx.flags.continue)) ?? null,
          max,
          paused,
        });
        return exceeded ? EXIT.NO : EXIT.OK;
      },
    },
    max: {
      summary: "The MAX_* thresholds: one by --name, or all.",
      flags: [
        { name: "name", type: "string", help: "threshold name, e.g. MAX_DEV_DISPATCH_ATTEMPTS" },
      ],
      output: {
        value: "the named threshold (with --name)",
        thresholds: "every threshold (without --name)",
        loopPauseThresholds: "the caps bkit.loopPause lowers to one round (without --name)",
      },
      run: (ctx) => {
        const name = str(ctx.flags.name);
        ctx.emit(
          name === undefined
            ? { thresholds: THRESHOLDS, loopPauseThresholds: LOOP_PAUSE_THRESHOLDS }
            : { value: threshold(name) },
        );
        return EXIT.OK;
      },
    },
    progress: {
      summary:
        "Progress report for a fix loop since a run field's timestamp: counts per round, code change, strategy, trend.",
      flags: [
        FILE_FLAG,
        WORKFLOW_FLAG,
        {
          name: "check",
          type: "string",
          required: true,
          help: "the step that counts problems, e.g. build-plan-verify",
        },
        {
          name: "fix",
          type: "string",
          required: true,
          help: "the step that fixes them, e.g. build-plan-gaps-remediate",
        },
        SUB_PLAN_FLAG,
        {
          name: "since",
          type: "string",
          help: "run field holding a timestamp; only rows after it count (decisionAt)",
        },
      ],
      output: {
        rounds: "the check rounds counted: attempt, failures, at",
        counts: "problem count after each round, e.g. 5 → 2",
        codeChanged:
          "source changed between the first and last check round (null when git cannot tell)",
        lastStrategy: "strategy of the last fix round (null when none ran)",
        nextStrategy: "strategy the next fix round would use",
        finalSpent: "true when a fix round already ran FINAL",
        minutesPerRound: "average minutes between check rounds (null under two rounds)",
        trend: "first-round | closing | stuck | worse",
        recommend: "try-again when closing, else stop (null on the first round)",
      },
      exitCodes: { [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON" },
      run: (ctx) => {
        const file = statusFile(ctx);
        const runs = readRuns(file);
        const workflow = String(ctx.flags.workflow);
        const subPlan = positiveInt(ctx.flags.subPlan, "sub-plan");
        const since = str(ctx.flags.since);
        const check = String(ctx.flags.check);
        const fix = String(ctx.flags.fix);
        const rounds = activeDoneSteps(runs, workflow, { step: check, subPlan }, since);
        const fixes = activeDoneSteps(runs, workflow, { step: fix, subPlan }, since);
        const first = rounds[0];
        const last = rounds.at(-1);
        let codeChanged: boolean | null = null;
        if (first && last && first !== last && first.parentSha && last.parentSha) {
          const diff = runGit(checkoutOf(file, ctx.cwd), [
            "diff",
            "--quiet",
            first.parentSha,
            last.parentSha,
            "--",
            ...SOURCE_PATHS,
          ]);
          // --quiet: exit 0 = no change, 1 = changed; anything else (unknown sha) leaves null.
          if (diff.ok) codeChanged = false;
          else if (diff.stderr === "") codeChanged = true;
        }
        const lastStrategy = fixes.at(-1)?.strategy ?? null;
        const ladder = lastDoneStepAllRuns(runs, workflow, { step: fix, subPlan })?.strategy;
        const trend = loopTrend(rounds, codeChanged);
        const span =
          first && last && rounds.length > 1
            ? (Date.parse(last.at) - Date.parse(first.at)) / 60000 / (rounds.length - 1)
            : null;
        ctx.emit({
          rounds: rounds.map((r) => ({
            attempt: r.attempt ?? null,
            failures: r.failures ?? null,
            at: r.at,
          })),
          counts: rounds
            .map((r) => (r.failures === undefined ? "?" : String(r.failures)))
            .join(" → "),
          codeChanged,
          lastStrategy,
          nextStrategy: nextStrategy(ladder),
          finalSpent: fixes.some((r) => r.strategy === "FINAL") || ladder === "FINAL",
          minutesPerRound: span === null || Number.isNaN(span) ? null : Math.round(span),
          trend,
          recommend: trend === "first-round" ? null : trend === "closing" ? "try-again" : "stop",
        });
        return EXIT.OK;
      },
    },
    rows: {
      summary: "Count rows of one audit type in the active run (since its workflow-started row).",
      flags: [
        FILE_FLAG,
        WORKFLOW_FLAG,
        {
          name: "type",
          type: "string",
          required: true,
          help: "row type, e.g. ship-revalidate-dispatch",
        },
        {
          name: "position",
          type: "string",
          required: true,
          help: "next (count+1, the attempt about to start) | count",
        },
      ],
      output: { value: "the counter at that position", count: "rows counted" },
      exitCodes: { [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON" },
      run: (ctx) => {
        const position = String(ctx.flags.position);
        if (!["next", "count"].includes(position))
          throw new CommandError(EXIT.USAGE, "--position must be next or count");
        const count = typedRowCount(
          statusFile(ctx),
          String(ctx.flags.workflow),
          String(ctx.flags.type),
        );
        ctx.emit({ value: position === "next" ? count + 1 : count, count });
        return EXIT.OK;
      },
    },
  },
};
