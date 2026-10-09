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
import { activeDoneSteps, runNumber } from "../../bkit-status.js";
import { CommandError, EXIT } from "../lib.js";
import { EXIT_NO_STATUS, FILE_FLAG, STEP_FLAG, SUB_PLAN_FLAG, WORKFLOW_FLAG, positiveInt, readRuns, statusFile, str, } from "./status.js";
/** Every MAX_* threshold the workflows route on. */
export const THRESHOLDS = {
    // build
    MAX_VERIFY_ATTEMPT: 3,
    MAX_TEST_ATTEMPT: 3,
    MAX_CHALLENGE_REMEDIATE_ATTEMPT: 1,
    // debug — mode-matched pairs
    MAX_DEBUG_ATTEMPT: 3,
    MAX_NORMAL_ATTEMPT: 3,
    MAX_SOAK_ATTEMPT: 3,
    // ship
    MAX_MERGE_ATTEMPT: 3,
    /** gate-refusal (10/11/14) poll-only re-entries into the sweep step */
    MAX_REVALIDATE_ATTEMPT: 3,
    // bkit-cloud.yml
    /** distinct failed dev CI SHAs per FID that may each dispatch a debug run */
    MAX_DEV_DISPATCH_ATTEMPTS: 3,
};
/** Exit code: `--position=current` found no row — the step's own row is missing. */
export const EXIT_NO_OWN_ROW = 4;
const nonNegativeInt = (v, flag) => {
    const s = String(v ?? "");
    if (!/^[0-9]+$/.test(s)) {
        throw new CommandError(EXIT.USAGE, `--${flag} must be a non-negative integer, got "${s}" — refusing to continue`);
    }
    return Number(s);
};
function threshold(name) {
    const value = THRESHOLDS[name];
    if (value === undefined) {
        throw new CommandError(EXIT.USAGE, `unknown threshold ${name}; known: ${Object.keys(THRESHOLDS).join(", ")}`);
    }
    return value;
}
export const countersCommand = {
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
                const count = activeDoneSteps(readRuns(statusFile(ctx)), String(ctx.flags.workflow), { step: String(ctx.flags.step), subPlan: positiveInt(ctx.flags.subPlan, "sub-plan") }, str(ctx.flags.since)).length;
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
                    required: true,
                    help: "counter value (non-negative integer)",
                },
                { name: "max", type: "string", help: "max as a number (or use --limit)" },
                { name: "limit", type: "string", help: "max as a threshold name, e.g. MAX_VERIFY_ATTEMPT" },
                { name: "continue", type: "string", help: "step to go to when value <= max" },
                { name: "exceeded", type: "string", help: "step to go to when value > max" },
            ],
            output: {
                exceeded: "true when value > max",
                next: "--continue or --exceeded step, whichever applies (null when not given)",
                max: "the max compared against",
            },
            run: (ctx) => {
                const name = String(ctx.flags.name);
                const value = nonNegativeInt(ctx.flags.value, "value");
                if ((ctx.flags.max === undefined) === (ctx.flags.limit === undefined)) {
                    throw new CommandError(EXIT.USAGE, "give exactly one of --max or --limit");
                }
                const max = ctx.flags.limit !== undefined
                    ? threshold(String(ctx.flags.limit))
                    : nonNegativeInt(ctx.flags.max, "max");
                const exceeded = value > max;
                if (exceeded)
                    ctx.log(`counter ${name} exceeded max=${max} (value=${value})`);
                ctx.emit({
                    exceeded,
                    next: str(exceeded ? ctx.flags.exceeded : ctx.flags.continue) ?? null,
                    max,
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
            },
            run: (ctx) => {
                const name = str(ctx.flags.name);
                ctx.emit(name === undefined ? { thresholds: THRESHOLDS } : { value: threshold(name) });
                return EXIT.OK;
            },
        },
    },
};
