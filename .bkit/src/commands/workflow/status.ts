// bkit status fold|route|meta|path — read and annotate a workflow's `status.jsonl`.

import * as fs from "node:fs";
import * as path from "node:path";

import {
  activeDoneSteps,
  appendLine,
  fold,
  lastDoneStepAllRuns,
  lastRun,
  nextStrategy,
  runOrStepField,
  statusTimestamp,
  type StatusEvent,
  type WorkflowRun,
} from "../../bkit-status.js";
import {
  CommandError,
  EXIT,
  statusLocation,
  type CommandSpec,
  type FlagSpec,
  type FlagValue,
  type RunContext,
} from "../lib.js";

// ---------------------------------------------------------------------------
// Shared with counters / steps
// ---------------------------------------------------------------------------

export const FILE_FLAG: FlagSpec = {
  name: "file",
  type: "string",
  required: true,
  help: "path to status.jsonl (from `bkit status path`)",
};
export const WORKFLOW_FLAG: FlagSpec = {
  name: "workflow",
  type: "string",
  required: true,
  help: "workflow name: design, plan, build, debug, ship",
};
export const STEP_FLAG: FlagSpec = {
  name: "step",
  type: "string",
  required: true,
  help: "step name",
};
export const SUB_PLAN_FLAG: FlagSpec = {
  name: "sub-plan",
  type: "string",
  help: "only rows for this sub-plan (positive integer)",
};

/** Exit code: status.jsonl missing, unreadable, or not valid NDJSON. */
export const EXIT_NO_STATUS = 3;

/** Parse every line of `status.jsonl`. Missing, unreadable or malformed is an error, never "no rows". */
export function readStatusEvents(file: string): StatusEvent[] {
  if (!fs.existsSync(file)) throw new CommandError(EXIT_NO_STATUS, `${file} does not exist`);
  return fs
    .readFileSync(file, "utf-8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "")
    .map((l, i) => {
      const parsed = parseJsonLine(l);
      if (!parsed.ok) throw new CommandError(EXIT_NO_STATUS, `${file} line ${i + 1} is not JSON`);
      return parsed.value as StatusEvent;
    });
}

function parseJsonLine(line: string): { ok: true; value: unknown } | { ok: false } {
  try {
    const value: unknown = JSON.parse(line);
    return { ok: true, value };
  } catch {
    // Malformed line: the caller reports it with its line number.
    return { ok: false };
  }
}

export const readRuns = (file: string): WorkflowRun[] => fold(readStatusEvents(file));

/** `--file`, resolved against the command's working directory. */
export const statusFile = (ctx: RunContext) => path.resolve(ctx.cwd, String(ctx.flags.file));

/** A positive-integer flag, or undefined when absent. */
export function positiveInt(value: FlagValue, flag: string): number | undefined {
  if (value === undefined) return undefined;
  const s = String(value);
  if (!/^[1-9][0-9]*$/.test(s))
    throw new CommandError(EXIT.USAGE, `--${flag} must be a positive integer, got "${s}"`);
  return Number(s);
}

export const str = (v: FlagValue) => (v === undefined ? undefined : String(v));

// ---------------------------------------------------------------------------
// route
// ---------------------------------------------------------------------------

const VERDICTS = ["PASS", "CONCERNS", "FAIL"];
const DEBUG_MODES = ["NORMAL", "SOAK"];
const PUSH_MODES = ["PR", "LOCAL"];
const STRATEGIES = ["STANDARD", "PIVOT", "FINAL"];

const ROUTE_FIELDS = ["verdict", "failures", "strategy", "debugMode", "pushMode"] as const;
type RouteField = (typeof ROUTE_FIELDS)[number];

/** Exit code: a `--require`d field is missing or holds a value outside its set. */
export const EXIT_ROUTE_MISSING = 4;

function route(runs: WorkflowRun[], workflow: string, step: string | undefined, subPlan?: number) {
  const out: Record<string, unknown> = {
    verdict: null,
    failures: null,
    strategy: null,
    nextStrategy: null,
    debugMode: null,
    pushMode: null,
    debugAttempt: 0,
  };
  const problems: Partial<Record<RouteField, string>> = {};

  if (step !== undefined) {
    const last = activeDoneSteps(runs, workflow, { step, subPlan }).at(-1);
    if (!last) {
      problems.verdict = `no DONE ${step} row in the active ${workflow} run`;
      problems.failures = problems.verdict;
    } else if (!VERDICTS.includes(String(last.verdict))) {
      problems.verdict = `${step} verdict "${String(last.verdict ?? "")}" is not PASS|CONCERNS|FAIL`;
      problems.failures = problems.verdict;
    } else {
      out.verdict = last.verdict;
      const failures = last.failures ?? 0;
      if (Number.isInteger(failures) && failures >= 0) out.failures = failures;
      else
        problems.failures = `${step} failures "${String(failures)}" is not a non-negative integer`;
    }

    const prior = lastDoneStepAllRuns(runs, workflow, { step, subPlan })?.strategy;
    if (prior === undefined || STRATEGIES.includes(prior)) {
      out.strategy = prior ?? null;
      out.nextStrategy = nextStrategy(prior);
    } else {
      problems.strategy = `${step} strategy "${String(prior)}" is not STANDARD|PIVOT|FINAL`;
    }
  }

  for (const [field, allowed] of [
    ["debugMode", DEBUG_MODES],
    ["pushMode", PUSH_MODES],
  ] as const) {
    const value = runOrStepField(runs, workflow, field);
    if (allowed.includes(value)) out[field] = value;
    else
      problems[field] =
        value === "" ? `${field} not recorded` : `${field} "${value}" is not ${allowed.join("|")}`;
  }

  const attempt = Number(lastRun(runs, workflow)?.debugAttempt ?? 0);
  out.debugAttempt = Number.isFinite(attempt) ? attempt : 0;
  return { out, problems };
}

// ---------------------------------------------------------------------------
// meta
// ---------------------------------------------------------------------------

const META_FIELDS: Record<string, { key: string; check: (v: string) => unknown }> = {
  "debug-mode": { key: "debugMode", check: (v) => oneOf(v, DEBUG_MODES, "--debug-mode") },
  "push-mode": { key: "pushMode", check: (v) => oneOf(v, PUSH_MODES, "--push-mode") },
  "debug-attempt": { key: "debugAttempt", check: (v) => positiveInt(v, "debug-attempt") },
};

function oneOf(v: string, allowed: string[], flag: string): string {
  if (!allowed.includes(v))
    throw new CommandError(EXIT.USAGE, `${flag} must be ${allowed.join("|")}`);
  return v;
}

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

export const statusCommand: CommandSpec = {
  noun: "status",
  summary: "Read and annotate a workflow's status.jsonl.",
  verbs: {
    path: {
      summary: "Where this workflow's status.jsonl lives.",
      flags: [
        WORKFLOW_FLAG,
        { name: "fid", type: "string", required: true, help: "feature id" },
        { name: "month", type: "string", required: true, help: "month bucket, YYYYMM" },
        {
          name: "dev-pushes",
          type: "boolean",
          help: "ship only: this runtime pushes to dev (RUNTIME_DEVPUSHES=true)",
        },
      ],
      output: {
        path: "absolute path to status.jsonl",
        bookRoot: "root the workflow books its logs under",
        exists: "whether the file exists yet",
      },
      run: (ctx) => {
        const month = String(ctx.flags.month);
        if (!/^[0-9]{6}$/.test(month)) throw new CommandError(EXIT.USAGE, "--month must be YYYYMM");
        const loc = statusLocation({
          cwd: ctx.cwd,
          workflow: String(ctx.flags.workflow),
          fid: String(ctx.flags.fid),
          month,
          devPushes: ctx.flags.devPushes === true,
        });
        ctx.emit({ ...loc, exists: fs.existsSync(loc.path) });
        return EXIT.OK;
      },
    },
    fold: {
      summary: "Fold status.jsonl into runs; a missing file folds to no runs.",
      flags: [
        { ...FILE_FLAG, help: "path to status.jsonl; absent file = no runs" },
        {
          ...WORKFLOW_FLAG,
          required: false,
          help: "also return this workflow's latest run as `last`",
        },
      ],
      output: {
        runs: "every run, oldest first",
        latest: "the latest run of any workflow, or null",
        last: "the latest run of --workflow, or null",
      },
      exitCodes: { [EXIT_NO_STATUS]: "status.jsonl unreadable or not valid NDJSON" },
      run: (ctx) => {
        const file = statusFile(ctx);
        const runs = fs.existsSync(file) ? readRuns(file) : [];
        const workflow = str(ctx.flags.workflow);
        ctx.emit({
          runs,
          latest: runs.at(-1) ?? null,
          last: workflow === undefined ? null : (lastRun(runs, workflow) ?? null),
        });
        return EXIT.OK;
      },
    },
    route: {
      summary: "Routing state: last verdict / failures / strategy of a step, debug and push mode.",
      flags: [
        FILE_FLAG,
        WORKFLOW_FLAG,
        {
          ...STEP_FLAG,
          required: false,
          help: "step whose last DONE row gives verdict, failures, strategy",
        },
        SUB_PLAN_FLAG,
        {
          name: "require",
          type: "string",
          repeatable: true,
          help: `fail unless this field is present and valid: ${ROUTE_FIELDS.join(", ")}`,
        },
      ],
      output: {
        verdict: "PASS|CONCERNS|FAIL of the step's last DONE row in the active run, or null",
        failures: "its failures (absent with a verdict = 0), or null",
        strategy: "the step's last strategy across ALL runs, or null",
        nextStrategy: "next rung: STANDARD, PIVOT, FINAL (null without --step)",
        debugMode: "NORMAL|SOAK of the active run, or null",
        pushMode: "PR|LOCAL of the active run, or null",
        debugAttempt: "debugAttempt of the active run (0 when unset)",
      },
      exitCodes: {
        [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON",
        [EXIT_ROUTE_MISSING]: "a --require'd field is missing or invalid",
      },
      run: (ctx) => {
        const step = str(ctx.flags.step);
        const required = (ctx.flags.require as string[] | undefined) ?? [];
        for (const r of required) {
          if (!(ROUTE_FIELDS as readonly string[]).includes(r)) {
            throw new CommandError(
              EXIT.USAGE,
              `--require ${r}: not one of ${ROUTE_FIELDS.join(", ")}`,
            );
          }
          if (step === undefined && ["verdict", "failures", "strategy"].includes(r)) {
            throw new CommandError(EXIT.USAGE, `--require ${r} needs --step`);
          }
        }
        const runs = readRuns(statusFile(ctx));
        const { out, problems } = route(
          runs,
          String(ctx.flags.workflow),
          step,
          positiveInt(ctx.flags.subPlan, "sub-plan"),
        );
        ctx.emit(out);
        const failed = required.filter((r) => problems[r as RouteField] !== undefined);
        for (const r of failed) ctx.log(problems[r as RouteField]!);
        return failed.length === 0 ? EXIT.OK : EXIT_ROUTE_MISSING;
      },
    },
    meta: {
      summary: "Append a workflow-meta row (run-level routing state).",
      flags: [
        FILE_FLAG,
        WORKFLOW_FLAG,
        { name: "debug-mode", type: "string", help: "NORMAL|SOAK" },
        { name: "push-mode", type: "string", help: "PR|LOCAL" },
        { name: "debug-attempt", type: "string", help: "positive integer" },
      ],
      output: { row: "the appended workflow-meta row" },
      exitCodes: { [EXIT_NO_STATUS]: "status.jsonl does not exist (meta never starts a log)" },
      run: (ctx) => {
        const file = statusFile(ctx);
        const fields: Record<string, unknown> = {};
        for (const { key, check } of Object.values(META_FIELDS)) {
          const v = str(ctx.flags[key]);
          if (v !== undefined) fields[key] = check(v);
        }
        if (Object.keys(fields).length === 0) {
          throw new CommandError(
            EXIT.USAGE,
            `give at least one of ${Object.keys(META_FIELDS)
              .map((f) => `--${f}`)
              .join(", ")}`,
          );
        }
        if (!fs.existsSync(file)) throw new CommandError(EXIT_NO_STATUS, `${file} does not exist`);
        const row = {
          type: "workflow-meta" as const,
          workflow: String(ctx.flags.workflow),
          at: statusTimestamp(),
          ...fields,
        };
        fs.appendFileSync(file, appendLine(row));
        ctx.emit({ row });
        return EXIT.OK;
      },
    },
  },
};
