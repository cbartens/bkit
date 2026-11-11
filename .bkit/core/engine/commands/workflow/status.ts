// bkit status route|resume|meta|path|row — read and annotate a workflow's `status.jsonl`.

import { randomBytes } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";

import { BKIT_DEBUG_GATES } from "../../install/manifest.js";
import { appendFrictionRow, journalEnabled, pauseFrictionRow } from "../../ledgers/journal.js";
import { resolveGitSha } from "../../ledgers/telemetry.js";
import { readBkitConfig } from "../../shared/settings.js";
import {
  activeDoneSteps,
  validateCiSelection,
  ciSelectionIdentity,
  allRunsDoneSteps,
  appendLine,
  type InvocationEvent,
  fold,
  lastDoneStepAllRuns,
  lastRun,
  nextStrategy,
  runNumber,
  runOrStepField,
  statusTimestamp,
  type StatusEvent,
  type StatusRow,
  type WorkflowRun,
} from "../../ledgers/status.js";
import {
  CommandError,
  EXIT,
  git,
  parseJson,
  resolveActiveRun,
  statusLocation,
  worktreeFingerprint,
  writeInvocation,
  type CommandSpec,
  type Invocation,
  type FlagSpec,
  type FlagValue,
  type RunContext,
} from "../lib.js";
import { WORKFLOW_STEPS, isResumable, resumePoint } from "./step-table.js";

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
export const GROUP_FLAG: FlagSpec = {
  name: "group",
  type: "string",
  help: "only rows for this task group (positive integer)",
};

/** Exit code: status.jsonl missing, unreadable, or not valid NDJSON. */
export const EXIT_NO_STATUS = 3;
/** Exit code: the owner-pause friction row was not written; the status row is kept. */
export const EXIT_PAUSE_FRICTION = 4;

/** Every row of status.jsonl, whatever its type; exit 3 when the file is missing or a line is not JSON. */
export function readStatusRows(file: string): StatusRow[] {
  if (!fs.existsSync(file)) throw new CommandError(EXIT_NO_STATUS, `${file} does not exist`);
  return parseStatusRows(fs.readFileSync(file, "utf-8"), file);
}

/**
 * The rows of status.jsonl as committed on `ref`, not as on disk: exit 3 when
 * the ref does not carry the file. `file` need not exist; the repo is the one
 * holding its nearest existing parent directory.
 */
export function readStatusRowsAt(file: string, ref: string): StatusRow[] {
  let dir = path.dirname(file);
  while (!fs.existsSync(dir) && path.dirname(dir) !== dir) dir = path.dirname(dir);
  const top = git(dir, ["rev-parse", "--show-toplevel"]);
  if (top === null) throw new CommandError(EXIT_NO_STATUS, `${file} is not inside a git repo`);
  const rel = path
    .relative(fs.realpathSync(top), path.join(fs.realpathSync(dir), path.relative(dir, file)))
    .split(path.sep)
    .join("/");
  const spec = `${ref}:${rel}`;
  const text = git(top, ["show", spec]);
  if (text === null) throw new CommandError(EXIT_NO_STATUS, `${spec} does not exist`);
  return parseStatusRows(text, spec);
}

/**
 * Step names a row may carry from before a rename, read as the current name so a run
 * in flight across the rename folds, resumes and counts as one (`docs/migrations.md`).
 * The row on disk is history and is not rewritten.
 */
const RENAMED_STEPS: Readonly<Record<string, string>> = {
  "build-plan-execute": "build-plan-tasks",
};

/** Parse NDJSON status text; `label` names it in errors. Malformed is an error, never "no rows". */
function parseStatusRows(text: string, label: string): StatusRow[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "")
    .map((l, i) => {
      const parsed = parseJson(l);
      if (!parsed.ok) throw new CommandError(EXIT_NO_STATUS, `${label} line ${i + 1} is not JSON`);
      if (typeof parsed.value !== "object" || parsed.value === null) {
        throw new CommandError(EXIT_NO_STATUS, `${label} line ${i + 1} is not a JSON object`);
      }
      const row = parsed.value as StatusRow;
      const renamed = typeof row.step === "string" ? RENAMED_STEPS[row.step] : undefined;
      return renamed === undefined ? row : { ...row, step: renamed };
    });
}

/** The rows as the fold reads them; the fold skips types it does not model. */
export const readStatusEvents = (file: string): StatusEvent[] =>
  readStatusRows(file) as StatusEvent[];

export const readRuns = (file: string): WorkflowRun[] => fold(readStatusEvents(file));

/** The runs as committed on `ref` (see readStatusRowsAt). */
export const readRunsAt = (file: string, ref: string): WorkflowRun[] =>
  fold(readStatusRowsAt(file, ref) as StatusEvent[]);

/** `--file`, resolved against the command's working directory. */
export const statusFile = (ctx: RunContext) => path.resolve(ctx.cwd, String(ctx.flags.file));

/** `--field key=value`: value parsed as JSON when it parses, else kept as a string. */
export function extraField(spec: string): [string, unknown] {
  const eq = spec.indexOf("=");
  if (eq <= 0) throw new CommandError(EXIT.USAGE, `--field ${spec}: expected key=value`);
  const key = spec.slice(0, eq);
  const raw = spec.slice(eq + 1);
  if (!/^[a-z][a-zA-Z0-9_]*$/.test(key))
    throw new CommandError(EXIT.USAGE, `--field key ${key} is not camelCase or snake_case`);
  return [key, parseJsonOrString(raw)];
}

/** Not JSON: a plain-text value, kept as written. */
function parseJsonOrString(raw: string): unknown {
  const parsed = parseJson(raw);
  return parsed.ok ? parsed.value : raw;
}

/** A non-negative-integer flag (0 allowed), or undefined when absent. */
export function nonNegativeInt(value: FlagValue, flag: string): number | undefined {
  if (value === undefined) return undefined;
  const s = String(value);
  if (!/^(0|[1-9][0-9]*)$/.test(s))
    throw new CommandError(EXIT.USAGE, `--${flag} must be a non-negative integer, got "${s}"`);
  return Number(s);
}

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

const ROUTE_FIELDS = [
  "verdict",
  "failures",
  "strategy",
  "debugMode",
  "pushMode",
  "publish",
] as const;
type RouteField = (typeof ROUTE_FIELDS)[number];

/** Exit code: a `--require`d field is missing or holds a value outside its set. */
export const EXIT_ROUTE_MISSING = 4;

function route(runs: WorkflowRun[], workflow: string, step: string | undefined, group?: number) {
  const out: Record<string, unknown> = {
    verdict: null,
    failures: null,
    strategy: null,
    nextStrategy: null,
    debugMode: null,
    pushMode: null,
    publish: null,
    publishSource: null,
    debugAttempt: 0,
    parentSha: null,
  };
  const problems: Partial<Record<RouteField, string>> = {};

  if (step !== undefined) {
    const last = activeDoneSteps(runs, workflow, { step, group }).at(-1);
    if (typeof last?.parentSha === "string") out.parentSha = last.parentSha;
    if (!last) {
      problems.verdict = `no DONE ${step} row in the active ${workflow} run`;
      problems.failures = problems.verdict;
    } else if (!VERDICTS.includes(String(last.verdict))) {
      problems.verdict = `${step} verdict "${String(last.verdict ?? "")}" is not PASS|CONCERNS|FAIL`;
      problems.failures = problems.verdict;
    } else {
      out.verdict = last.verdict;
      // An absent count on FAIL is unknown, never 0: a FAIL always has failures.
      const failures = last.failures ?? (last.verdict === "FAIL" ? null : 0);
      if (failures === null) out.failures = null;
      else if (Number.isInteger(failures) && failures >= 0) out.failures = failures;
      else
        problems.failures = `${step} failures "${String(failures)}" is not a non-negative integer`;
    }

    const prior = lastDoneStepAllRuns(runs, workflow, { step, group })?.strategy;
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

  problems.publish = "publish not resolved: needs --workflow=build with --prompt-file";

  const attempt = Number(lastRun(runs, workflow)?.debugAttempt ?? 0);
  out.debugAttempt = Number.isFinite(attempt) ? attempt : 0;
  return { out, problems };
}

/**
 * The debug run's start decisions, from the session prompt and the feature's debug runs.
 * `fixMax` is `bkit.workflows.debug.fix.maxAttempts`: once that many fix rounds ran across
 * every debug run, the run starts in SOAK.
 */
export function debugStart(runs: WorkflowRun[], promptText: string, fixMax: number) {
  const attempt = runNumber(runs, "debug");
  const latest = runs.at(-1);
  // A resume: the newest run is debug's and still open. A finished run's modes never
  // carry into the next run; its fix rounds count against `fixMax`.
  const open = latest?.workflow === "debug" && latest.status === "IN_PROGRESS" ? latest : null;
  const soaking =
    open !== null &&
    (runOrStepField([open], "debug", "debugMode") === "SOAK" ||
      open.steps.some((s) => s.step === "debug-failure-soak" && s.status === "DONE"));
  const fixes = allRunsDoneSteps(runs, "debug", { step: "debug-failure-remediate" }).length;
  const debugMode = promptText.includes("[soak]") || soaking || fixes >= fixMax ? "SOAK" : "NORMAL";
  const selection =
    !promptText.includes("[local]") && validateCiSelection(open?.ciSelection)
      ? open.ciSelection
      : null;
  const ci = selection?.mode === "ci" ? selection : null;
  const ciGeneration = typeof open?.ciGeneration === "number" ? open.ciGeneration : 0;
  const current =
    open?.steps.filter((s) => s.status === "DONE" && s.ciGeneration === ciGeneration) ?? [];
  const defaults = promptText.includes("[live=off]")
    ? BKIT_DEBUG_GATES.filter((g) => !g.endsWith("-live"))
    : [...BKIT_DEBUG_GATES];
  const covering =
    ci && ci.redTiers.length > 0
      ? defaults
          .filter((g) =>
            ci.redTiers.every((tier) => g.slice("bkit:gate:".length).split("-").includes(tier)),
          )
          .reverse()
      : [];
  return {
    debugAttempt: attempt,
    debugMode,
    repro: promptText.includes("[repro]"),
    gates: [...new Set([...covering, ...defaults])],
    ciRun: ci?.runId ?? null,
    ciGeneration,
    redTiers: ci?.redTiers ?? [],
    ciFixDone:
      ci !== null &&
      current.some((s) => ["debug-failure-remediate", "debug-failure-soak"].includes(s.step)),
    ciReproduced:
      ci !== null &&
      current.some((s) => s.step === "debug-failure-reproduce" && s.reproduced === "YES"),
  };
}

const PUBLISH_TOKEN = /(?<![\w-])publish=(true|false)(?![\w-])/;

/**
 * Build's ending, from the session prompt, `bkit.workflows.build.publish` and the runtime.
 * A `publish=true|false` token wins; else LOCAL reads `publish.local` and any other runtime
 * `publish.remote`. A non-LOCAL `false` resolves `true`. No `runtime-resolved` row throws.
 */
export function publishRoute(
  rows: StatusRow[],
  promptText: string,
  config: { remote: boolean; local: boolean },
): { publish: boolean; publishSource: "token" | "local" | "remote" | "coerced" } {
  const row = rows.filter((r) => r.type === "runtime-resolved" && r.workflow === "build").at(-1);
  if (row === undefined)
    throw new CommandError(
      EXIT_ROUTE_MISSING,
      "no runtime-resolved row for build: Step 2 never recorded the runtime",
    );
  const local = row.runtime === "LOCAL";
  const token = PUBLISH_TOKEN.exec(promptText)?.[1];
  const wanted = token !== undefined ? token === "true" : local ? config.local : config.remote;
  if (!local && !wanted) return { publish: true, publishSource: "coerced" };
  return {
    publish: wanted,
    publishSource: token !== undefined ? "token" : local ? "local" : "remote",
  };
}

/** `--file`, else the debug status.jsonl `--fid` and `--month` name. */
function routeFile(ctx: RunContext): string {
  if (ctx.flags.file !== undefined) return statusFile(ctx);
  const fid = str(ctx.flags.fid);
  const month = str(ctx.flags.month);
  if (fid === undefined || month === undefined || ctx.flags.promptFile === undefined)
    throw new CommandError(EXIT.USAGE, "give --file, or --prompt-file with --fid and --month");
  if (!/^[0-9]{6}$/.test(month)) throw new CommandError(EXIT.USAGE, "--month must be YYYYMM");
  return statusLocation({ cwd: ctx.cwd, workflow: "debug", fid, month }).path;
}

// ---------------------------------------------------------------------------
// meta
// ---------------------------------------------------------------------------

const META_FIELDS: Record<string, { key: string; check: (v: string) => unknown }> = {
  "debug-mode": { key: "debugMode", check: (v) => oneOf(v, DEBUG_MODES, "--debug-mode") },
  "push-mode": { key: "pushMode", check: (v) => oneOf(v, PUSH_MODES, "--push-mode") },
  "debug-attempt": { key: "debugAttempt", check: (v) => positiveInt(v, "debug-attempt") },
};

/** Row types the fold reads; each has its own verb (workflows start|fail|close, steps done, status meta). */
const FOLDED_TYPES = new Set([
  "workflow-started",
  "step-done",
  "workflow-meta",
  "workflow-done",
  "workflow-failed",
]);

/** Markers that record a fact, not a value. */
const META_MARKS: Record<string, (at: string) => Record<string, unknown>> = {
  "opened-pr": () => ({ openedPr: true }),
};

const camelFlag = (kebab: string) => kebab.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

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
      use: "by-hand",
      flags: [
        WORKFLOW_FLAG,
        { name: "fid", type: "string", required: true, help: "feature id" },
        { name: "month", type: "string", required: true, help: "month bucket, YYYYMM" },
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
        });
        ctx.emit({ ...loc, exists: fs.existsSync(loc.path) });
        return EXIT.OK;
      },
    },
    route: {
      summary:
        "Routing state: last verdict / failures / strategy of a step, debug and push mode; with --prompt-file, debug's start decisions.",
      use: "workflow",
      flags: [
        { ...FILE_FLAG, required: false, help: `${FILE_FLAG.help}; or --fid and --month` },
        WORKFLOW_FLAG,
        {
          ...STEP_FLAG,
          required: false,
          help: "step whose last DONE row gives verdict, failures, strategy",
        },
        GROUP_FLAG,
        {
          name: "require",
          type: "string",
          repeatable: true,
          help: `fail unless this field is present and valid: ${ROUTE_FIELDS.join(", ")}`,
        },
        {
          name: "expect",
          type: "string",
          repeatable: true,
          help: "field=value — fail (exit 4) unless the field holds this value, e.g. debugMode=NORMAL",
        },
        {
          name: "prompt-file",
          type: "string",
          help: "debug or build: the session prompt; debug: this run's attempt, mode, repro and gates (a missing status.jsonl is a fresh run); build: publish and publishSource",
        },
        { name: "fid", type: "string", help: "with --prompt-file, in place of --file: feature id" },
        { name: "month", type: "string", help: "with --prompt-file, in place of --file: YYYYMM" },
      ],
      output: {
        verdict: "PASS|CONCERNS|FAIL of the step's last DONE row in the active run, or null",
        ciRun: "active saved CI run ID with --prompt-file, or null; explicit [local] clears it",
        ciGeneration: "active saved selection generation with --prompt-file, or 0",
        redTiers:
          "active selected failed tiers with --prompt-file; empty for local or unknown jobs",
        ciFixDone: "whether the active generation has a DONE remediation or soak",
        ciReproduced: "whether the active generation has DONE reproduction with YES",
        failures:
          "its failures (absent on PASS|CONCERNS = 0, absent on FAIL = null: count unknown), or null",
        strategy: "the step's last strategy across ALL runs, or null",
        nextStrategy: "next rung: STANDARD, PIVOT, FINAL (null without --step)",
        debugMode:
          "NORMAL|SOAK of the active run, or null; with --prompt-file, the mode this invocation runs in (SOAK on [soak] in the prompt, an open run already in SOAK, or bkit.workflows.debug.fix.maxAttempts fix rounds already run across every debug run; else NORMAL)",
        pushMode: "PR|LOCAL of the active run, or null",
        debugAttempt:
          "debugAttempt of the active run (0 when unset); with --prompt-file, this invocation's run number (a resume keeps its number)",
        repro: "with --prompt-file: [repro] in the prompt",
        gates:
          "with --prompt-file: the gates to try, deepest first; [live=off] in the prompt drops the live gate",
        publish:
          "with --workflow=build and --prompt-file: whether the build publishes (a publish=true|false token, else publish.local on LOCAL or publish.remote elsewhere; a non-LOCAL false resolves true), else null",
        publishSource:
          "with publish: token | local | remote | coerced (a non-LOCAL false forced to true), else null",
        parentSha:
          "HEAD when the step's last DONE row in the active run was written — a build-group-start row's is the group's start commit, the base for `context diff` — or null",
      },
      exitCodes: {
        [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON",
        [EXIT_ROUTE_MISSING]:
          "a --require'd field is missing or invalid, or an --expect'ed value differs",
      },
      run: (ctx) => {
        const step = str(ctx.flags.step);
        const expected = ((ctx.flags.expect as string[] | undefined) ?? []).map((e) => {
          const eq = e.indexOf("=");
          if (eq <= 0 || !(ROUTE_FIELDS as readonly string[]).includes(e.slice(0, eq)))
            throw new CommandError(
              EXIT.USAGE,
              `--expect ${e}: must be <${ROUTE_FIELDS.join("|")}>=<value>`,
            );
          return [e.slice(0, eq), e.slice(eq + 1)] as const;
        });
        const required = [
          ...new Set([
            ...((ctx.flags.require as string[] | undefined) ?? []),
            ...expected.map(([k]) => k),
          ]),
        ];
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
        const promptFile = str(ctx.flags.promptFile);
        if (promptFile !== undefined && !["debug", "build"].includes(String(ctx.flags.workflow)))
          throw new CommandError(EXIT.USAGE, "--prompt-file is for --workflow=debug or build");
        const file = routeFile(ctx);
        let promptText = "";
        if (promptFile !== undefined) {
          const abs = path.resolve(ctx.cwd, promptFile);
          if (!fs.existsSync(abs))
            throw new CommandError(EXIT.USAGE, `--prompt-file ${abs} does not exist`);
          promptText = fs.readFileSync(abs, "utf-8");
        }
        const runs = promptFile !== undefined && !fs.existsSync(file) ? [] : readRuns(file);
        const { out, problems } = route(
          runs,
          String(ctx.flags.workflow),
          step,
          positiveInt(ctx.flags.group, "group"),
        );
        if (promptFile !== undefined) {
          const root = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
          const config = readBkitConfig(root);
          if (ctx.flags.workflow === "debug") {
            Object.assign(out, debugStart(runs, promptText, config.asks["debug.fix"].max));
            delete problems.debugMode;
          } else {
            const rows = fs.existsSync(file) ? readStatusRows(file) : [];
            Object.assign(out, publishRoute(rows, promptText, config.buildPublish));
            delete problems.publish;
          }
        }
        ctx.emit(out);
        const failed = required.filter((r) => problems[r as RouteField] !== undefined);
        for (const r of failed) ctx.log(problems[r as RouteField]!);
        const differ = expected.filter(
          ([k, v]) =>
            problems[k as RouteField] === undefined &&
            String((out as Record<string, unknown>)[k]) !== v,
        );
        for (const [k, v] of differ)
          ctx.log(`${k} is ${String((out as Record<string, unknown>)[k])}, expected ${v}`);
        return failed.length === 0 && differ.length === 0 ? EXIT.OK : EXIT_ROUTE_MISSING;
      },
    },
    invocation: {
      summary:
        "Issue an engine-bound invocation: a run's step (and agent), or a runless audit or utility call.",
      use: "workflow",
      flags: [
        { ...WORKFLOW_FLAG, required: false, help: "workflow name, with --step and --file" },
        { ...STEP_FLAG, required: false, help: "registered step of the workflow" },
        { ...FILE_FLAG, required: false, help: "the run's status.jsonl, relative to the cwd" },
        { name: "group", type: "string", help: "the task group a group-scoped step runs for" },
        { name: "attempt", type: "string", help: "the attempt of that group or remediation round" },
        { name: "agent", type: "string", help: "the subagent this invocation is for" },
        { name: "host", type: "string", help: "the host running the agent" },
        {
          name: "configured-model",
          type: "string",
          help: "the pin the agent was launched with; kept apart from the observed model",
        },
        {
          name: "observed-model",
          type: "string",
          help: "the model the host reported, or `unavailable`",
        },
        { name: "standalone", type: "string", help: "audit|utility: a call with no run" },
        { name: "name", type: "string", help: "with --standalone: the audit or utility name" },
      ],
      output: {
        invocation: "the id to pass as --invocation to later commands",
        receipt: "the outbox file holding the issued context",
        scope: "run (bound to a status.jsonl) or outbox (runless audit or utility)",
        workflow: "the workflow, or null",
        step: "the registered step, or null",
        number: "the step's registered number, or null",
        title: "the step's registered title, or null",
        run: "the workflow's run number, or null without a run",
        statusPath: "absolute path to the run's status.jsonl, or null",
        bookRoot: "root the run's books live under, or null",
        group: "the task group, or null",
        attempt: "the attempt, or null",
        declaredStep: "audit|utility:<name> for a runless call, or null",
        allowedAgent: "the one agent a runless call may write as, or null",
        agent: "the agent, or null",
        host: "the host, or null",
        configuredModel: "the launch pin, or null",
        observedModel: "the reported model or `unavailable`, or null",
      },
      exitCodes: { [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON" },
      run: (ctx) => {
        const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]);
        if (top === null) throw new CommandError(EXIT.USAGE, "not inside a git repository");
        const standalone = str(ctx.flags.standalone);
        const workflow = str(ctx.flags.workflow);
        const step = str(ctx.flags.step);
        const file = str(ctx.flags.file);
        const agent = str(ctx.flags.agent) ?? null;
        if (agent !== null && !/^[a-z0-9][a-z0-9._-]*$/.test(agent))
          throw new CommandError(EXIT.USAGE, `--agent "${agent}" is not an agent name`);
        const group = str(ctx.flags.group);
        const attempt = str(ctx.flags.attempt);
        for (const [flag, v] of [
          ["group", group],
          ["attempt", attempt],
        ] as const)
          if (v !== undefined && !/^[A-Za-z0-9._-]+$/.test(v))
            throw new CommandError(EXIT.USAGE, `--${flag} "${v}" is not a ${flag} id`);
        const base = {
          group: group ?? null,
          attempt: attempt ?? null,
          agent,
          host: str(ctx.flags.host) ?? null,
          configuredModel: str(ctx.flags.configuredModel) ?? null,
          // An agent whose host reported no model is recorded `unavailable`, so its rows stay writable.
          observedModel: str(ctx.flags.observedModel) ?? (agent !== null ? "unavailable" : null),
        };
        let inv: Omit<Invocation, "id" | "issuedAt" | "version" | "worktree">;
        if (standalone !== undefined) {
          oneOf(standalone, ["audit", "utility"], "--standalone");
          if ([workflow, step, file].some((v) => v !== undefined))
            throw new CommandError(
              EXIT.USAGE,
              "--standalone has no run: drop --workflow, --step and --file",
            );
          const name = str(ctx.flags.name);
          if (name === undefined || name === "")
            throw new CommandError(EXIT.USAGE, "--standalone needs --name");
          if (!/^[a-z0-9][a-z0-9._-]*$/.test(name))
            throw new CommandError(EXIT.USAGE, `--name "${name}" is not an audit or utility name`);
          if (group !== undefined || attempt !== undefined)
            throw new CommandError(EXIT.USAGE, "--standalone has no group or attempt");
          inv = {
            scope: "outbox",
            workflow: null,
            step: null,
            number: null,
            title: null,
            run: null,
            statusPath: null,
            bookRoot: null,
            standalone,
            name,
            declaredStep: `${standalone}:${name}`,
            allowedAgent: agent,
            ...base,
          };
        } else {
          if (workflow === undefined || step === undefined || file === undefined)
            throw new CommandError(
              EXIT.USAGE,
              "give --workflow, --step and --file, or --standalone=audit|utility with --name",
            );
          if (ctx.flags.name !== undefined)
            throw new CommandError(EXIT.USAGE, "--name is for --standalone");
          if (!isResumable(workflow))
            throw new CommandError(
              EXIT.USAGE,
              `--workflow must be ${Object.keys(WORKFLOW_STEPS).join("|")}, got "${workflow}"`,
            );
          const registered = WORKFLOW_STEPS[workflow].find((s) => s.step === step);
          if (registered === undefined)
            throw new CommandError(
              EXIT.USAGE,
              `--step ${step} is not a registered ${workflow} step`,
            );
          const statusPath = path.resolve(ctx.cwd, file);
          const realFile = (() => {
            let dir = path.dirname(statusPath);
            const tail: string[] = [path.basename(statusPath)];
            while (!fs.existsSync(dir) && path.dirname(dir) !== dir) {
              tail.unshift(path.basename(dir));
              dir = path.dirname(dir);
            }
            return path.join(fs.realpathSync(dir), ...tail);
          })();
          const realTop = fs.realpathSync(top);
          // A status file that is itself a symlink resolves wherever it points; the parent
          // directory alone says nothing about where appends land.
          if (fs.lstatSync(statusPath, { throwIfNoEntry: false })?.isSymbolicLink() === true)
            throw new CommandError(
              EXIT.USAGE,
              `--file ${file} is a symbolic link; issue the invocation for the status file itself`,
            );
          // The checkout that owns the file: a worktree nested under this one has its own top
          // folder, so a plain path-prefix test would accept it.
          let ownerDir = path.dirname(realFile);
          while (!fs.existsSync(ownerDir) && path.dirname(ownerDir) !== ownerDir)
            ownerDir = path.dirname(ownerDir);
          const fileTop = git(ownerDir, ["rev-parse", "--show-toplevel"]);
          const ownerTop = fileTop === null ? null : fs.realpathSync(fileTop);
          if (
            (realFile !== realTop && !realFile.startsWith(realTop + path.sep)) ||
            (ownerTop !== null && ownerTop !== realTop)
          )
            throw new CommandError(
              EXIT.USAGE,
              `--file ${file} is outside this checkout (${top}); issue the invocation from the checkout that owns the run`,
            );
          const logs = path.dirname(path.dirname(statusPath));
          if (
            path.basename(statusPath) !== "status.jsonl" ||
            path.basename(logs) !== "logs" ||
            path.basename(path.dirname(path.dirname(logs))) !== "plans"
          )
            throw new CommandError(
              EXIT.USAGE,
              `--file ${file} is not a docs/plans/<month>/logs/<fid>/status.jsonl`,
            );
          inv = {
            scope: "run",
            workflow,
            step,
            number: registered.number,
            title: registered.title,
            run: runNumber(readRuns(statusPath), workflow),
            statusPath,
            bookRoot: path.dirname(path.dirname(path.dirname(path.dirname(logs)))),
            standalone: null,
            name: null,
            declaredStep: null,
            allowedAgent: null,
            ...base,
          };
        }
        const id = `inv-${randomBytes(16).toString("hex")}`;
        const issued: Invocation = {
          id,
          version: 1,
          ...inv,
          worktree: top,
          issuedAt: statusTimestamp(),
        };
        if (issued.scope === "run" && fs.existsSync(issued.statusPath!)) {
          // The run's status log is the authority; the receipt is an index rebuilt from it.
          const event: InvocationEvent = {
            type: "invocation",
            workflow: issued.workflow!,
            at: issued.issuedAt,
            id,
            step: issued.step!,
            number: issued.number!,
            title: issued.title!,
            run: issued.run!,
            statusPath: path.relative(top, issued.statusPath!),
            bookRoot: path.relative(top, issued.bookRoot!) || ".",
            group: issued.group,
            attempt: issued.attempt,
            agent: issued.agent,
            host: issued.host,
            configuredModel: issued.configuredModel,
            observedModel: issued.observedModel,
            worktree: worktreeFingerprint(top),
          };
          fs.appendFileSync(issued.statusPath!, appendLine(event));
        }
        const receipt = writeInvocation(ctx.cwd, issued);
        const {
          id: _id,
          version: _v,
          worktree: _w,
          issuedAt: _at,
          standalone: _s,
          name: _n,
          ...out
        } = issued;
        ctx.emit({ invocation: id, receipt, ...out });
        return EXIT.OK;
      },
    },
    resume: {
      summary:
        "The step a stopped run continues at: after its last DONE step, setup steps and retired rows aside.",
      use: "by-hand",
      flags: [
        { ...FILE_FLAG, help: "path to status.jsonl; a missing file is a run with no rows" },
        { ...WORKFLOW_FLAG, help: `workflow name: ${Object.keys(WORKFLOW_STEPS).join(", ")}` },
      ],
      output: {
        step: "the step's row name, or null for a step that writes no row",
        number: "the step number to continue at (1 when no run is active)",
        title: "the step heading's title",
        after: "the DONE row that placed it, or null",
        group: "that row's task group, or null",
        active: "whether the latest run is this workflow, still IN_PROGRESS",
        challengeRound:
          "build: the round Step 11's challenge runs as (1 up to bkit.workflows.build.challenge.maxAttempts), from the build-challenge rows' round field; null for other workflows",
        challengeDone:
          "build: true once the last allowed challenge round has merged, so Step 11 goes on to Step 12; null for other workflows",
      },
      exitCodes: { [EXIT_NO_STATUS]: "status.jsonl unreadable or not valid NDJSON" },
      run: (ctx) => {
        const workflow = String(ctx.flags.workflow);
        if (!isResumable(workflow))
          throw new CommandError(
            EXIT.USAGE,
            `--workflow must be ${Object.keys(WORKFLOW_STEPS).join("|")}, got "${workflow}"`,
          );
        const file = statusFile(ctx);
        const root = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
        const challengeMax = readBkitConfig(root).asks["build.challenge"].max;
        ctx.emit({
          ...resumePoint(fs.existsSync(file) ? readRuns(file) : [], workflow, challengeMax),
        });
        return EXIT.OK;
      },
    },
    meta: {
      summary: "Append a workflow-meta row (run-level routing state).",
      use: "workflow",
      flags: [
        FILE_FLAG,
        WORKFLOW_FLAG,
        { name: "debug-mode", type: "string", help: "NORMAL|SOAK" },
        { name: "push-mode", type: "string", help: "PR|LOCAL" },
        {
          name: "debug-attempt",
          type: "string",
          help: "positive integer, or run (the active run's number)",
        },
        { name: "opened-pr", type: "boolean", help: "record openedPr: this run opened the PR" },
        {
          name: "ci-selection-file",
          type: "string",
          help: "validated atomic debug CI or local selection JSON",
        },
      ],
      output: { row: "the appended workflow-meta row" },
      exitCodes: { [EXIT_NO_STATUS]: "status.jsonl does not exist (meta never starts a log)" },
      run: (ctx) => {
        const file = statusFile(ctx);
        const at = statusTimestamp();
        const fields: Record<string, unknown> = {};
        if (ctx.flags.ciSelectionFile !== undefined) {
          const parsed = parseJson(
            fs.readFileSync(path.resolve(ctx.cwd, String(ctx.flags.ciSelectionFile)), "utf-8"),
          );
          const selection = parsed.ok ? parsed.value : null;
          if (!validateCiSelection(selection))
            throw new CommandError(EXIT.USAGE, "invalid CI selection");
          const active = readRuns(file).at(-1);
          if (
            ctx.flags.workflow !== "debug" ||
            active?.workflow !== "debug" ||
            active.status !== "IN_PROGRESS"
          )
            throw new CommandError(EXIT.USAGE, "CI selection needs an active debug run");
          const same =
            validateCiSelection(active.ciSelection) &&
            ciSelectionIdentity(active.ciSelection) === ciSelectionIdentity(selection);
          fields.ciSelection =
            selection.mode === "local" ? { mode: "local", reason: selection.reason } : selection;
          fields.ciGeneration = (Number(active.ciGeneration) || 0) + (same ? 0 : 1);
        }
        for (const { key, check } of Object.values(META_FIELDS)) {
          const v = str(ctx.flags[key]);
          // `--debug-attempt=run`: the active run's number, read once the log is known to exist.
          if (v !== undefined) fields[key] = key === "debugAttempt" && v === "run" ? v : check(v);
        }
        for (const [flag, mark] of Object.entries(META_MARKS)) {
          if (ctx.flags[camelFlag(flag)] === true) Object.assign(fields, mark(at));
        }
        if (Object.keys(fields).length === 0) {
          throw new CommandError(
            EXIT.USAGE,
            `give at least one of ${[...Object.keys(META_FIELDS), ...Object.keys(META_MARKS)]
              .map((f) => `--${f}`)
              .join(", ")}`,
          );
        }
        if (!fs.existsSync(file)) throw new CommandError(EXIT_NO_STATUS, `${file} does not exist`);
        if (fields.debugAttempt === "run") {
          fields.debugAttempt = runNumber(readRuns(file), String(ctx.flags.workflow));
        }
        const row = {
          type: "workflow-meta" as const,
          workflow: String(ctx.flags.workflow),
          at,
          ...fields,
        };
        fs.appendFileSync(file, appendLine(row));
        ctx.emit({ row });
        return EXIT.OK;
      },
    },
    row: {
      summary:
        "Append a typed audit row the fold does not model (ship's gate refusals, CI probes, merge CI); an owner-pause row also logs a human-confirm friction row.",
      use: "workflow",
      flags: [
        FILE_FLAG,
        WORKFLOW_FLAG,
        {
          name: "type",
          type: "string",
          required: true,
          help: "row type, kebab-case (the folded types have their own verbs)",
        },
        {
          name: "field",
          type: "string",
          repeatable: true,
          help: "row field key=value (value parsed as JSON when it is JSON)",
        },
      ],
      output: { row: "the appended row" },
      exitCodes: {
        [EXIT_NO_STATUS]: "status.jsonl does not exist (a row never starts a log)",
        [EXIT_PAUSE_FRICTION]:
          "an owner-pause row was appended but its human-confirm friction row was not written",
      },
      run: (ctx) => {
        const type = String(ctx.flags.type);
        if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(type))
          throw new CommandError(EXIT.USAGE, `--type ${type} is not kebab-case`);
        if (FOLDED_TYPES.has(type))
          throw new CommandError(
            EXIT.USAGE,
            `--type ${type} is folded; write it with its own verb`,
          );
        const fields = Object.fromEntries(
          ((ctx.flags.field as string[] | undefined) ?? []).map(extraField),
        );
        const clash = ["type", "workflow", "at"].filter((k) => k in fields);
        if (clash.length > 0)
          throw new CommandError(EXIT.USAGE, `--field cannot set ${clash.join(", ")}`);
        const file = statusFile(ctx);
        if (!fs.existsSync(file)) throw new CommandError(EXIT_NO_STATUS, `${file} does not exist`);
        const row = {
          type,
          workflow: String(ctx.flags.workflow),
          at: statusTimestamp(),
          ...fields,
        };
        const prior = type === "owner-pause" ? fs.readFileSync(file, "utf-8") : "";
        fs.appendFileSync(file, appendLine(row));
        if (type === "owner-pause") recordPause(ctx.cwd, file, row, prior);
        ctx.emit({ row });
        return EXIT.OK;
      },
    },
  },
};

const pauseReason = (row: Record<string, unknown>) =>
  row["reason"] === undefined ? undefined : String(row["reason"]);

/**
 * Log an owner pause as `human-confirm` friction in the active run's books. A
 * follow-up wait writes nothing: `prior` (the status file before this row) holds an
 * `owner-pause` row with the same workflow and reason and no `step-done` row after it.
 * Nothing is written outside an active run or with `BKIT_ENGINE_JOURNAL=off`.
 */
function recordPause(
  cwd: string,
  file: string,
  row: StatusRow & { workflow: string },
  prior: string,
) {
  if (!journalEnabled()) return;
  const reason = pauseReason(row);
  let waiting = false;
  for (const line of prior.split("\n")) {
    const parsed = parseJson(line);
    if (!parsed.ok || parsed.value === null || typeof parsed.value !== "object") continue;
    const r = parsed.value as Record<string, unknown>;
    if (r["type"] === "step-done") waiting = false;
    else if (r["type"] === "owner-pause" && r["workflow"] === row.workflow) {
      waiting ||= pauseReason(r) === reason;
    }
  }
  if (waiting) return;
  const run = resolveActiveRun({ cwd, file });
  if (run === undefined) return;
  const wrote = appendFrictionRow(
    run.bookRoot,
    pauseFrictionRow({
      workflow: row.workflow,
      reason,
      bookRoot: run.bookRoot,
      parentSha: resolveGitSha("HEAD", run.bookRoot),
    }),
  );
  if (!wrote.ok) {
    throw new CommandError(
      EXIT_PAUSE_FRICTION,
      `owner-pause row kept; its friction row was not written: ${wrote.error}`,
    );
  }
}
