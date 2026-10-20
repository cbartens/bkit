// bkit status route|meta|path|row — read and annotate a workflow's `status.jsonl`.
import * as fs from "node:fs";
import * as path from "node:path";
import { activeDoneSteps, appendLine, fold, lastDoneStepAllRuns, lastRun, nextStrategy, runOrStepField, statusTimestamp, } from "../../ledgers/status.js";
import { CommandError, EXIT, git, parseJson, statusLocation, } from "../lib.js";
// ---------------------------------------------------------------------------
// Shared with counters / steps
// ---------------------------------------------------------------------------
export const FILE_FLAG = {
    name: "file",
    type: "string",
    required: true,
    help: "path to status.jsonl (from `bkit status path`)",
};
export const WORKFLOW_FLAG = {
    name: "workflow",
    type: "string",
    required: true,
    help: "workflow name: design, plan, build, debug, ship",
};
export const STEP_FLAG = {
    name: "step",
    type: "string",
    required: true,
    help: "step name",
};
export const SUB_PLAN_FLAG = {
    name: "sub-plan",
    type: "string",
    help: "only rows for this sub-plan (positive integer)",
};
/** Exit code: status.jsonl missing, unreadable, or not valid NDJSON. */
export const EXIT_NO_STATUS = 3;
/** Every row of status.jsonl, whatever its type; exit 3 when the file is missing or a line is not JSON. */
export function readStatusRows(file) {
    if (!fs.existsSync(file))
        throw new CommandError(EXIT_NO_STATUS, `${file} does not exist`);
    return parseStatusRows(fs.readFileSync(file, "utf-8"), file);
}
/**
 * The rows of status.jsonl as committed on `ref`, not as on disk: exit 3 when
 * the ref does not carry the file. `file` need not exist; the repo is the one
 * holding its nearest existing parent directory.
 */
export function readStatusRowsAt(file, ref) {
    let dir = path.dirname(file);
    while (!fs.existsSync(dir) && path.dirname(dir) !== dir)
        dir = path.dirname(dir);
    const top = git(dir, ["rev-parse", "--show-toplevel"]);
    if (top === null)
        throw new CommandError(EXIT_NO_STATUS, `${file} is not inside a git repo`);
    const rel = path
        .relative(fs.realpathSync(top), path.join(fs.realpathSync(dir), path.relative(dir, file)))
        .split(path.sep)
        .join("/");
    const spec = `${ref}:${rel}`;
    const text = git(top, ["show", spec]);
    if (text === null)
        throw new CommandError(EXIT_NO_STATUS, `${spec} does not exist`);
    return parseStatusRows(text, spec);
}
/** Parse NDJSON status text; `label` names it in errors. Malformed is an error, never "no rows". */
function parseStatusRows(text, label) {
    return text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l !== "")
        .map((l, i) => {
        const parsed = parseJson(l);
        if (!parsed.ok)
            throw new CommandError(EXIT_NO_STATUS, `${label} line ${i + 1} is not JSON`);
        if (typeof parsed.value !== "object" || parsed.value === null) {
            throw new CommandError(EXIT_NO_STATUS, `${label} line ${i + 1} is not a JSON object`);
        }
        return parsed.value;
    });
}
/** The rows as the fold reads them; the fold skips types it does not model. */
export const readStatusEvents = (file) => readStatusRows(file);
export const readRuns = (file) => fold(readStatusEvents(file));
/** The runs as committed on `ref` (see readStatusRowsAt). */
export const readRunsAt = (file, ref) => fold(readStatusRowsAt(file, ref));
/** `--file`, resolved against the command's working directory. */
export const statusFile = (ctx) => path.resolve(ctx.cwd, String(ctx.flags.file));
/** `--field key=value`: value parsed as JSON when it parses, else kept as a string. */
export function extraField(spec) {
    const eq = spec.indexOf("=");
    if (eq <= 0)
        throw new CommandError(EXIT.USAGE, `--field ${spec}: expected key=value`);
    const key = spec.slice(0, eq);
    const raw = spec.slice(eq + 1);
    if (!/^[a-z][a-zA-Z0-9_]*$/.test(key))
        throw new CommandError(EXIT.USAGE, `--field key ${key} is not camelCase or snake_case`);
    return [key, parseJsonOrString(raw)];
}
/** Not JSON: a plain-text value, kept as written. */
function parseJsonOrString(raw) {
    const parsed = parseJson(raw);
    return parsed.ok ? parsed.value : raw;
}
/** A non-negative-integer flag (0 allowed), or undefined when absent. */
export function nonNegativeInt(value, flag) {
    if (value === undefined)
        return undefined;
    const s = String(value);
    if (!/^(0|[1-9][0-9]*)$/.test(s))
        throw new CommandError(EXIT.USAGE, `--${flag} must be a non-negative integer, got "${s}"`);
    return Number(s);
}
/** A positive-integer flag, or undefined when absent. */
export function positiveInt(value, flag) {
    if (value === undefined)
        return undefined;
    const s = String(value);
    if (!/^[1-9][0-9]*$/.test(s))
        throw new CommandError(EXIT.USAGE, `--${flag} must be a positive integer, got "${s}"`);
    return Number(s);
}
export const str = (v) => (v === undefined ? undefined : String(v));
// ---------------------------------------------------------------------------
// route
// ---------------------------------------------------------------------------
const VERDICTS = ["PASS", "CONCERNS", "FAIL"];
const DEBUG_MODES = ["NORMAL", "SOAK"];
const PUSH_MODES = ["PR", "LOCAL"];
const STRATEGIES = ["STANDARD", "PIVOT", "FINAL"];
const ROUTE_FIELDS = ["verdict", "failures", "strategy", "debugMode", "pushMode"];
/** Exit code: a `--require`d field is missing or holds a value outside its set. */
export const EXIT_ROUTE_MISSING = 4;
function route(runs, workflow, step, subPlan) {
    const out = {
        verdict: null,
        failures: null,
        strategy: null,
        nextStrategy: null,
        debugMode: null,
        pushMode: null,
        debugAttempt: 0,
    };
    const problems = {};
    if (step !== undefined) {
        const last = activeDoneSteps(runs, workflow, { step, subPlan }).at(-1);
        if (!last) {
            problems.verdict = `no DONE ${step} row in the active ${workflow} run`;
            problems.failures = problems.verdict;
        }
        else if (!VERDICTS.includes(String(last.verdict))) {
            problems.verdict = `${step} verdict "${String(last.verdict ?? "")}" is not PASS|CONCERNS|FAIL`;
            problems.failures = problems.verdict;
        }
        else {
            out.verdict = last.verdict;
            const failures = last.failures ?? 0;
            if (Number.isInteger(failures) && failures >= 0)
                out.failures = failures;
            else
                problems.failures = `${step} failures "${String(failures)}" is not a non-negative integer`;
        }
        const prior = lastDoneStepAllRuns(runs, workflow, { step, subPlan })?.strategy;
        if (prior === undefined || STRATEGIES.includes(prior)) {
            out.strategy = prior ?? null;
            out.nextStrategy = nextStrategy(prior);
        }
        else {
            problems.strategy = `${step} strategy "${String(prior)}" is not STANDARD|PIVOT|FINAL`;
        }
    }
    for (const [field, allowed] of [
        ["debugMode", DEBUG_MODES],
        ["pushMode", PUSH_MODES],
    ]) {
        const value = runOrStepField(runs, workflow, field);
        if (allowed.includes(value))
            out[field] = value;
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
const META_FIELDS = {
    "debug-mode": { key: "debugMode", check: (v) => oneOf(v, DEBUG_MODES, "--debug-mode") },
    "push-mode": { key: "pushMode", check: (v) => oneOf(v, PUSH_MODES, "--push-mode") },
    "debug-attempt": { key: "debugAttempt", check: (v) => positiveInt(v, "debug-attempt") },
    "plan-source": { key: "planSource", check: (v) => oneOf(v, PLAN_SOURCES, "--plan-source") },
};
/** Row types the fold reads; each has its own verb (workflows start|fail|close, steps done, status meta). */
const FOLDED_TYPES = new Set([
    "workflow-started",
    "step-done",
    "workflow-meta",
    "workflow-done",
    "workflow-failed",
]);
/** Markers that record the row's own time or a fact, not a value. */
const META_MARKS = {
    "soak-entry": (at) => ({ soakEntryAt: at }),
    "opened-pr": () => ({ openedPr: true }),
};
/** `brief` = the run had no plan file and works from its input file. */
const PLAN_SOURCES = ["brief", "plan"];
const camelFlag = (kebab) => kebab.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
function oneOf(v, allowed, flag) {
    if (!allowed.includes(v))
        throw new CommandError(EXIT.USAGE, `${flag} must be ${allowed.join("|")}`);
    return v;
}
// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------
export const statusCommand = {
    noun: "status",
    summary: "Read and annotate a workflow's status.jsonl.",
    verbs: {
        path: {
            summary: "Where this workflow's status.jsonl lives.",
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
                if (!/^[0-9]{6}$/.test(month))
                    throw new CommandError(EXIT.USAGE, "--month must be YYYYMM");
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
                {
                    name: "expect",
                    type: "string",
                    repeatable: true,
                    help: "field=value — fail (exit 4) unless the field holds this value, e.g. debugMode=NORMAL",
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
                [EXIT_ROUTE_MISSING]: "a --require'd field is missing or invalid, or an --expect'ed value differs",
            },
            run: (ctx) => {
                const step = str(ctx.flags.step);
                const expected = (ctx.flags.expect ?? []).map((e) => {
                    const eq = e.indexOf("=");
                    if (eq <= 0 || !ROUTE_FIELDS.includes(e.slice(0, eq)))
                        throw new CommandError(EXIT.USAGE, `--expect ${e}: must be <${ROUTE_FIELDS.join("|")}>=<value>`);
                    return [e.slice(0, eq), e.slice(eq + 1)];
                });
                const required = [
                    ...new Set([
                        ...(ctx.flags.require ?? []),
                        ...expected.map(([k]) => k),
                    ]),
                ];
                for (const r of required) {
                    if (!ROUTE_FIELDS.includes(r)) {
                        throw new CommandError(EXIT.USAGE, `--require ${r}: not one of ${ROUTE_FIELDS.join(", ")}`);
                    }
                    if (step === undefined && ["verdict", "failures", "strategy"].includes(r)) {
                        throw new CommandError(EXIT.USAGE, `--require ${r} needs --step`);
                    }
                }
                const runs = readRuns(statusFile(ctx));
                const { out, problems } = route(runs, String(ctx.flags.workflow), step, positiveInt(ctx.flags.subPlan, "sub-plan"));
                ctx.emit(out);
                const failed = required.filter((r) => problems[r] !== undefined);
                for (const r of failed)
                    ctx.log(problems[r]);
                const differ = expected.filter(([k, v]) => problems[k] === undefined &&
                    String(out[k]) !== v);
                for (const [k, v] of differ)
                    ctx.log(`${k} is ${String(out[k])}, expected ${v}`);
                return failed.length === 0 && differ.length === 0 ? EXIT.OK : EXIT_ROUTE_MISSING;
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
                { name: "plan-source", type: "string", help: "brief|plan" },
                {
                    name: "soak-entry",
                    type: "boolean",
                    help: "record soakEntryAt (the soak budget counts from here)",
                },
                { name: "opened-pr", type: "boolean", help: "record openedPr: this run opened the PR" },
            ],
            output: { row: "the appended workflow-meta row" },
            exitCodes: { [EXIT_NO_STATUS]: "status.jsonl does not exist (meta never starts a log)" },
            run: (ctx) => {
                const file = statusFile(ctx);
                const at = statusTimestamp();
                const fields = {};
                for (const { key, check } of Object.values(META_FIELDS)) {
                    const v = str(ctx.flags[key]);
                    if (v !== undefined)
                        fields[key] = check(v);
                }
                for (const [flag, mark] of Object.entries(META_MARKS)) {
                    if (ctx.flags[camelFlag(flag)] === true)
                        Object.assign(fields, mark(at));
                }
                if (Object.keys(fields).length === 0) {
                    throw new CommandError(EXIT.USAGE, `give at least one of ${[...Object.keys(META_FIELDS), ...Object.keys(META_MARKS)]
                        .map((f) => `--${f}`)
                        .join(", ")}`);
                }
                if (!fs.existsSync(file))
                    throw new CommandError(EXIT_NO_STATUS, `${file} does not exist`);
                const row = {
                    type: "workflow-meta",
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
            summary: "Append a typed audit row the fold does not model (ship's gate refusals, CI probes, merge CI).",
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
            exitCodes: { [EXIT_NO_STATUS]: "status.jsonl does not exist (a row never starts a log)" },
            run: (ctx) => {
                const type = String(ctx.flags.type);
                if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(type))
                    throw new CommandError(EXIT.USAGE, `--type ${type} is not kebab-case`);
                if (FOLDED_TYPES.has(type))
                    throw new CommandError(EXIT.USAGE, `--type ${type} is folded; write it with its own verb`);
                const fields = Object.fromEntries((ctx.flags.field ?? []).map(extraField));
                const clash = ["type", "workflow", "at"].filter((k) => k in fields);
                if (clash.length > 0)
                    throw new CommandError(EXIT.USAGE, `--field cannot set ${clash.join(", ")}`);
                const file = statusFile(ctx);
                if (!fs.existsSync(file))
                    throw new CommandError(EXIT_NO_STATUS, `${file} does not exist`);
                const row = {
                    type,
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
