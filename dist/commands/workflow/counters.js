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
import { activeDoneSteps, allRunsDoneSteps, lastDoneStepAllRuns, nextStrategy, runNumber, } from "../../ledgers/status.js";
import { ASK_POINTS, readBkitConfig, } from "../../shared/settings.js";
import { headlessRun } from "./runtime.js";
import { CommandError, EXIT, git, runGit, } from "../lib.js";
import { EXIT_NO_STATUS, FILE_FLAG, GROUP_FLAG, STEP_FLAG, WORKFLOW_FLAG, positiveInt, readRuns, readStatusRows, statusFile, str, } from "./status.js";
/** An ask point by name (`build.verify`); an unknown name is a usage error. */
export function askPoint(name) {
    if (!ASK_POINTS.includes(name))
        throw new CommandError(EXIT.USAGE, `unknown point ${name}; known: ${ASK_POINTS.join(", ")}`);
    return name;
}
/** The checkout `cwd` sits in. */
const checkoutRoot = (cwd) => git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd;
/** `bkit.workflows.<point>` for the checkout `cwd` sits in. */
export function askSetting(cwd, point) {
    return readBkitConfig(checkoutRoot(cwd)).asks[point];
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
const nonNegativeInt = (v, flag) => {
    const s = String(v ?? "");
    if (!/^[0-9]+$/.test(s)) {
        throw new CommandError(EXIT.USAGE, `--${flag} must be a non-negative integer, got "${s}" — refusing to continue`);
    }
    return Number(s);
};
/**
 * `--of=<step>:<position>` over `--file` / `--workflow`: the counter at that position.
 * `--of=<step>,<step>...:count` sums the DONE rows of every listed step. `--all-runs`
 * counts every run of the workflow in the file, not only the active one.
 */
function derivedOf(ctx) {
    const [list, position] = String(ctx.flags.of).split(":");
    const steps = (list ?? "").split(",");
    if (steps.some((s) => s === "") || !["next", "current", "count"].includes(position ?? ""))
        throw new CommandError(EXIT.USAGE, "--of must be <step>[,<step>...]:<next|current|count>");
    if (steps.length > 1 && (position !== "count" || new Set(steps).size !== steps.length))
        throw new CommandError(EXIT.USAGE, "--of with several steps takes distinct steps and :count");
    if (ctx.flags.file === undefined || ctx.flags.workflow === undefined)
        throw new CommandError(EXIT.USAGE, "--of needs --file and --workflow");
    const runs = readRuns(statusFile(ctx));
    const group = positiveInt(ctx.flags.group, "group");
    const doneSteps = ctx.flags.allRuns === true ? allRunsDoneSteps : activeDoneSteps;
    const count = steps.reduce((n, step) => n + doneSteps(runs, String(ctx.flags.workflow), { step, group }).length, 0);
    if (position === "current" && count === 0)
        throw new CommandError(EXIT_NO_OWN_ROW, `${steps[0]}: no DONE row in the active run — the step's own row is missing`);
    return position === "next" ? count + 1 : count;
}
/** `--all-runs`: count every run of the workflow in `--file`, not only the active one. */
const ALL_RUNS_FLAG = {
    name: "all-runs",
    type: "boolean",
    help: "count every run of the workflow in --file, not only the active one",
};
/** Rows of `type` in `workflow`'s active run (since its last workflow-started row). */
function typedRowCount(file, workflow, type) {
    const rows = readStatusRows(file);
    let start = -1;
    rows.forEach((r, i) => {
        if (r.type === "workflow-started" && r.workflow === workflow)
            start = i;
    });
    return rows
        .slice(start + 1)
        .filter((r) => r.type === type && (r.workflow === undefined || r.workflow === workflow)).length;
}
/** `route --rows=<type>:count`: rows of that type in the active run. */
function derivedRows(ctx) {
    const [type, position] = String(ctx.flags.rows).split(":");
    if (!type || position !== "count")
        throw new CommandError(EXIT.USAGE, "--rows must be <row type>:count");
    if (ctx.flags.file === undefined || ctx.flags.workflow === undefined)
        throw new CommandError(EXIT.USAGE, "--rows needs --file and --workflow");
    return typedRowCount(statusFile(ctx), String(ctx.flags.workflow), type);
}
/** The checkout a status.jsonl under `docs/plans/` belongs to; `cwd` when it is elsewhere. */
function checkoutOf(file, cwd) {
    const abs = path.resolve(cwd, file);
    const at = abs.lastIndexOf(`${path.sep}docs${path.sep}plans${path.sep}`);
    return at < 0 ? cwd : abs.slice(0, at);
}
/**
 * The loop's direction from its check rounds: `worse` when the problem count rose,
 * `closing` when it fell and the rounds changed code, `stuck` otherwise.
 */
export function loopTrend(rounds, codeChanged) {
    if (rounds.length < 2)
        return "first-round";
    const first = rounds[0]?.failures;
    const last = rounds.at(-1)?.failures;
    if (first === undefined || last === undefined)
        return "stuck";
    if (last > first)
        return "worse";
    if (last < first && codeChanged !== false)
        return "closing";
    return "stuck";
}
/** A fix loop's progress in the active run: `check` counts problems, `fix` fixes them. */
export function loopProgress(file, cwd, workflow, check, fix, group) {
    const runs = readRuns(file);
    const rounds = activeDoneSteps(runs, workflow, { step: check, group });
    const fixes = activeDoneSteps(runs, workflow, { step: fix, group });
    const first = rounds[0];
    const last = rounds.at(-1);
    let codeChanged = null;
    if (first && last && first !== last && first.parentSha && last.parentSha) {
        const diff = runGit(checkoutOf(file, cwd), [
            "diff",
            "--quiet",
            first.parentSha,
            last.parentSha,
            "--",
            ...SOURCE_PATHS,
        ]);
        // --quiet: exit 0 = no change, 1 = changed; anything else (unknown sha) leaves null.
        if (diff.ok)
            codeChanged = false;
        else if (diff.stderr === "")
            codeChanged = true;
    }
    const ladder = lastDoneStepAllRuns(runs, workflow, { step: fix, group })?.strategy;
    const trend = loopTrend(rounds, codeChanged);
    const span = first && last && rounds.length > 1
        ? (Date.parse(last.at) - Date.parse(first.at)) / 60000 / (rounds.length - 1)
        : null;
    return {
        rounds: rounds.map((r) => ({
            attempt: r.attempt ?? null,
            failures: r.failures ?? null,
            at: r.at,
        })),
        counts: rounds.map((r) => (r.failures === undefined ? "?" : String(r.failures))).join(" → "),
        codeChanged,
        lastStrategy: fixes.at(-1)?.strategy ?? null,
        nextStrategy: nextStrategy(ladder),
        finalSpent: fixes.some((r) => r.strategy === "FINAL") || ladder === "FINAL",
        minutesPerRound: span === null || Number.isNaN(span) ? null : Math.round(span),
        trend,
        recommend: trend === "first-round" ? null : trend === "closing" ? "try-again" : "stop",
    };
}
export const countersCommand = {
    noun: "counters",
    summary: "Attempt counters derived from status.jsonl, and the ask points' limits.",
    verbs: {
        derive: {
            summary: "Count a step's DONE rows in the active run, at one of three positions.",
            use: "workflow",
            flags: [
                FILE_FLAG,
                WORKFLOW_FLAG,
                STEP_FLAG,
                GROUP_FLAG,
                {
                    name: "position",
                    type: "string",
                    required: true,
                    help: "next (step start: count+1) | current (after own row: count, 0 refused) | count (other step: 0 legal)",
                },
                ALL_RUNS_FLAG,
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
                const count = (ctx.flags.allRuns === true ? allRunsDoneSteps : activeDoneSteps)(readRuns(statusFile(ctx)), String(ctx.flags.workflow), { step: String(ctx.flags.step), group: positiveInt(ctx.flags.group, "group") }).length;
                if (position === "current" && count === 0) {
                    ctx.log(`${String(ctx.flags.step)}: no DONE row in the active run — the step's own row is missing`);
                    return EXIT_NO_OWN_ROW;
                }
                ctx.emit({ value: position === "next" ? count + 1 : count, count });
                return EXIT.OK;
            },
        },
        run: {
            summary: "Which run of the workflow this invocation is (1-based; a resume keeps its number).",
            use: "workflow",
            flags: [FILE_FLAG, WORKFLOW_FLAG],
            output: { run: "run number" },
            exitCodes: { [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON" },
            run: (ctx) => {
                ctx.emit({ run: runNumber(readRuns(statusFile(ctx)), String(ctx.flags.workflow)) });
                return EXIT.OK;
            },
        },
        route: {
            summary: "Compare a counter to its max: exit 0 continue, exit 1 exceeded; with --point, also whether to ask.",
            use: "workflow",
            flags: [
                { name: "name", type: "string", required: true, help: "counter name, for the log line" },
                {
                    name: "value",
                    type: "string",
                    help: "counter value (non-negative integer), or derive it with --of / --rows",
                },
                {
                    name: "of",
                    type: "string",
                    help: "<step>:<next|current|count> — derive the value from --file (active run); <step>,<step>...:count sums the listed steps",
                },
                {
                    name: "rows",
                    type: "string",
                    help: "<row type>:count — rows of that type in --file's active run; with --of, added to it",
                },
                { ...FILE_FLAG, required: false, help: "status.jsonl, with --of or --rows" },
                { ...WORKFLOW_FLAG, required: false, help: "workflow, with --of or --rows" },
                { ...GROUP_FLAG, help: "with --of: only rows for this task group" },
                { ...ALL_RUNS_FLAG, help: "with --of: count every run of the workflow in --file" },
                { name: "max", type: "string", help: "max as a number (or use --point)" },
                {
                    name: "point",
                    type: "string",
                    help: `ask point whose limit is the max: ${ASK_POINTS.join(" | ")}`,
                },
                { name: "continue", type: "string", help: "step to go to when value <= max" },
                { name: "exceeded", type: "string", help: "step to go to when value > max" },
            ],
            output: {
                value: "the counter compared",
                exceeded: "true when value > max",
                next: "--continue or --exceeded step, whichever applies (null when not given)",
                max: "the max compared against",
                ask: "with --point: the point's ask setting, false when headless (GITHUB_ACTION); else false",
            },
            exitCodes: {
                [EXIT_NO_STATUS]: "--of / --rows: status.jsonl missing, unreadable, or not valid NDJSON",
                [EXIT_NO_OWN_ROW]: "--of=<step>:current counted 0: the step's own row is missing",
            },
            run: (ctx) => {
                const name = String(ctx.flags.name);
                const derived = ctx.flags.of !== undefined || ctx.flags.rows !== undefined;
                if (derived === (ctx.flags.value !== undefined))
                    throw new CommandError(EXIT.USAGE, "give --value, or --of and/or --rows");
                const value = derived
                    ? (ctx.flags.of !== undefined ? derivedOf(ctx) : 0) +
                        (ctx.flags.rows !== undefined ? derivedRows(ctx) : 0)
                    : nonNegativeInt(ctx.flags.value, "value");
                if ((ctx.flags.max === undefined) === (ctx.flags.point === undefined)) {
                    throw new CommandError(EXIT.USAGE, "give exactly one of --max or --point");
                }
                const point = ctx.flags.point === undefined ? undefined : askPoint(String(ctx.flags.point));
                const setting = point === undefined ? undefined : askSetting(ctx.cwd, point);
                const max = setting === undefined ? nonNegativeInt(ctx.flags.max, "max") : setting.max;
                const exceeded = value > max;
                if (exceeded)
                    ctx.log(`counter ${name} exceeded max=${max} (value=${value})`);
                ctx.emit({
                    value,
                    exceeded,
                    next: (exceeded ? str(ctx.flags.exceeded) : str(ctx.flags.continue)) ?? null,
                    max,
                    ask: setting !== undefined && setting.ask && !headlessRun(ctx.cwd),
                });
                return exceeded ? EXIT.NO : EXIT.OK;
            },
        },
        max: {
            summary: "The ask points' limits and ask settings: one by --point, or all.",
            use: "workflow",
            flags: [{ name: "point", type: "string", help: "ask point, e.g. debug.fix" }],
            output: {
                value: "the point's limit (with --point)",
                ask: "the point's ask setting, false when headless (with --point)",
                points: "every point's {ask, max} as set (without --point)",
            },
            run: (ctx) => {
                const name = str(ctx.flags.point);
                if (name === undefined) {
                    ctx.emit({ points: readBkitConfig(checkoutRoot(ctx.cwd)).asks });
                    return EXIT.OK;
                }
                const setting = askSetting(ctx.cwd, askPoint(name));
                ctx.emit({
                    value: setting.max,
                    ask: setting.ask && !headlessRun(ctx.cwd),
                });
                return EXIT.OK;
            },
        },
        progress: {
            summary: "Progress report for a fix loop in the active run: counts per round, code change, strategy, trend.",
            use: "workflow",
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
                GROUP_FLAG,
            ],
            output: {
                rounds: "the check rounds counted: attempt, failures, at",
                counts: "problem count after each round, e.g. 5 → 2",
                codeChanged: "source changed between the first and last check round (null when git cannot tell)",
                lastStrategy: "strategy of the last fix round (null when none ran)",
                nextStrategy: "strategy the next fix round would use",
                finalSpent: "true when a fix round already ran FINAL",
                minutesPerRound: "average minutes between check rounds (null under two rounds)",
                trend: "first-round | closing | stuck | worse",
                recommend: "try-again when closing, else stop (null on the first round)",
            },
            exitCodes: { [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON" },
            run: (ctx) => {
                ctx.emit({
                    ...loopProgress(statusFile(ctx), ctx.cwd, String(ctx.flags.workflow), String(ctx.flags.check), String(ctx.flags.fix), positiveInt(ctx.flags.group, "group")),
                });
                return EXIT.OK;
            },
        },
        rows: {
            summary: "Count rows of one audit type in the active run (since its workflow-started row).",
            use: "workflow",
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
                const count = typedRowCount(statusFile(ctx), String(ctx.flags.workflow), String(ctx.flags.type));
                ctx.emit({ value: position === "next" ? count + 1 : count, count });
                return EXIT.OK;
            },
        },
    },
};
