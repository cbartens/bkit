// bkit decisions check|counts|apply|answers|skip|pending — the build's decision files, from question to ship.
// `open-decision.ts` reads them; `skip` applies its `skipProblem` rule.
//
// A pause is the orchestrator's decision file (`build-decision-{RUN}-{N}.md`: its header and its
// questions) and the engine's rows in the `status.jsonl` beside it: `decision-counts` (written by
// `counts`: `Source changed`, `Gate`, the loop question Q1) and one `decision-answer` row per
// answer. `decisionItems` folds the rows over the file's questions. The engine never edits the
// orchestrator's file, and `Status` is read from the folded items.
//
// A decision file (`docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{N}.md`) holds header
// lines, an optional progress block, then one item per question:
//
//   **Q{n} — {title}:** {question}
//   A) {name} — {what happens if it is picked}
//   B) {name} — {what happens if it is picked}
//   Recommended: A) {name} — {reason}    (a hard blocker: `Recommended: none — {why}`)
//   Default if unanswered: {what happens}
//   Decision: {answer} — {words}         (once decided)
//   Fix task: {N}                        (a `Fix now` item: the plan task that carries its fix)
//
// The old layout is still read: one `Options: A) {A} / B) {B}` line in place of the option lines,
// and `No recommendation — {why}` in place of `Recommended: none — {why}`.
//
// `apply --by=headless` takes each recommendation when nobody can or should be asked: an
// `Accept` is written `Accept (assumed)` and the pause reads `ASSUMED`. It never writes a
// `docs/decisions.jsonl` row or a `TEST EXCEPTION`: only the owner's words do. Ship lists the
// assumed items with `pending`; the owner confirms each (`apply --by=owner --confirm`, which
// writes the real acceptance) or rejects it, and `pending --defer` writes one `needs-decision`
// deferral per item nobody confirmed.
import * as fs from "node:fs";
import * as path from "node:path";
import { appendLine, statusTimestamp } from "../../ledgers/status.js";
import { readJsonFile, readTextFile } from "../../shared/json.js";
import { CommandError, EXIT, git } from "../lib.js";
import { loopProgress } from "./counters.js";
import { appendLedgerRows, EXIT_ROW_REFUSED, monthAndFid } from "./ledgers.js";
import { LOOPS, loopGateStep } from "./loops.js";
import { checkProblem, decisionFileHeader, decisionItems, decisionRows, EXIT_NO_STATUS, letterAt, loopItemOf, pauseProblem, pauseStatus, parseDecisionItems, skipProblem, undecidedBesidesLoop, } from "./open-decision.js";
import { classifyAt } from "./runtime.js";
import { positiveInt, str } from "./status.js";
/** Exit code: `apply --by=headless` left hard blockers (no recommendation) for the owner. */
export const EXIT_HARD_BLOCKERS = 4;
/** The option list as it is written: `A) {A} / B) {B}`. */
const letteredOptions = (options) => options.map((o, i) => `${letterAt(i)}) ${o}`).join(" / ");
const today = () => new Date().toISOString().slice(0, 10);
const readText = (file) => {
    if (!fs.existsSync(file))
        throw new CommandError(EXIT.USAGE, `${file} does not exist`);
    return fs.readFileSync(file, "utf-8");
};
/** `FID` and run/decision numbers from a `.../logs/{FID}/build-decision-{RUN}-{N}.md` path. */
function fileRef(file) {
    const fid = path.basename(path.dirname(file));
    const m = /build-decision-(\d+)-(\d+)\.md$/.exec(file);
    return { fid, ref: m ? `run ${m[1]} decision ${m[2]}` : path.basename(file) };
}
const slug = (s) => s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
/** The `bkit tests base` output, checked field by field; a bad file is a usage error naming it. */
function readBaseCheck(file) {
    const read = readJsonFile(file);
    if (!read.ok)
        throw new CommandError(EXIT.USAGE, `--base-check ${file} is missing or not JSON`);
    const o = read.value;
    const bad = (field, want) => new CommandError(EXIT.USAGE, `--base-check ${file}: field "${field}" ${want}`);
    if (typeof o !== "object" || o === null || Array.isArray(o))
        throw new CommandError(EXIT.USAGE, `--base-check ${file} must hold a JSON object`);
    const verdict = o.verdict;
    if (verdict !== "all" && verdict !== "some" && verdict !== "none" && verdict !== "unknown")
        throw bad("verdict", "must be all, some, none or unknown");
    const { failing, baseRed, adopt } = o;
    const count = (k, fallback) => {
        const v = o[k];
        if (v === undefined)
            return fallback;
        if (typeof v !== "number" || !Number.isFinite(v))
            throw bad(k, "must be a number");
        return v;
    };
    if (typeof failing !== "number" || !Number.isFinite(failing))
        throw bad("failing", "must be a number");
    if (typeof baseRed !== "number" || !Number.isFinite(baseRed))
        throw bad("baseRed", "must be a number");
    if (typeof adopt !== "boolean")
        throw bad("adopt", "must be true or false");
    const text = (k) => {
        const v = o[k];
        if (v === null)
            return null;
        if (typeof v !== "string")
            throw bad(k, "must be a string or null");
        return v;
    };
    return {
        verdict,
        reason: text("reason"),
        base: text("base"),
        source: text("source"),
        failing,
        baseRed,
        branch: count("branch", failing - baseRed),
        undetermined: count("undetermined", 0),
        adopt,
    };
}
/** Exit code: `check` refused the orchestrator's decision file. */
export const EXIT_BAD_DECISION = 6;
/** A decision file's text, or null when the path is missing. */
const readIf = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : null;
/** The effect a bare fixed option name gets. */
const FIXED_EFFECTS = {
    "Try again": "one more fix round runs",
    Decide: "the questions below are asked instead of another round",
    Stop: "the run ends here with a handover; the next run resumes here",
};
/** The loop question `Q1` the engine writes, in the one question layout. */
function loopQuestionLines(o) {
    const letter = letterAt(o.options.indexOf(o.recommended));
    return [
        `**Q1 — ${o.title}:** ${o.question}`,
        ...o.options.map((name, i) => `${letterAt(i)}) ${name} — ${FIXED_EFFECTS[name]}`),
        `Recommended: ${letter}) ${o.recommended} — ${o.reason}`,
        `Default if unanswered: the run waits for you; taken as ${letter} when nobody can be asked`,
    ];
}
// ---------------------------------------------------------------------------
// apply
// ---------------------------------------------------------------------------
/** The decision file's folded items. */
function pauseOf(file) {
    return { text: readText(file), items: decisionItems(readIf, file) };
}
/** Appends one engine row to the `status.jsonl` beside the decision file; exit 3 when it is missing. */
function appendRow(file, cwd, row) {
    const status = path.join(path.dirname(file), "status.jsonl");
    if (!fs.existsSync(status))
        throw new CommandError(EXIT_NO_STATUS, `${status} does not exist`);
    const top = git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd;
    fs.appendFileSync(status, appendLine({
        workflow: "build",
        at: statusTimestamp(),
        file: path.relative(top, file),
        ...row,
    }));
}
/** One `decision-answer` row for question `q` of the decision file. */
const answerRow = (file, cwd, q, answer, by, extra = {}) => appendRow(file, cwd, { type: "decision-answer", q, answer, by, ...extra });
/**
 * Each undecided item's recommendation as a `decision-answer` row; hard blockers left for the
 * owner. The loop question is `loopItemOf(items, hasLoop)`, the rule the pause's Status uses.
 */
export function applyRecommendations(items, hasLoop, runtime, why) {
    const loopItem = loopItemOf(items, hasLoop);
    const loop = loopItem?.decision?.split(" — ")[0] ?? loopItem?.recommended ?? null;
    const rows = [];
    const hardBlockers = [];
    for (const it of items) {
        if (it.decision !== null)
            continue;
        // `Try again` settles the loop alone; the items wait for the next round.
        if (it !== loopItem && loop === "Try again")
            continue;
        if (it.recommended === null) {
            hardBlockers.push(it.n);
            continue;
        }
        const assumed = it.recommended === "Accept";
        rows.push({
            type: "decision-answer",
            q: it.n,
            answer: assumed
                ? `Accept (assumed) — ${it.reason} (${why}, ${runtime}, ${today()})`
                : `${it.recommended} — recommended; applied without asking (${runtime})`,
            by: "headless",
            assumed,
            runtime,
        });
    }
    return { rows, applied: rows.map((r) => r.q), hardBlockers, loop };
}
/** A `--fix-task=Q{n}={task}` value as its question and task numbers; a usage error otherwise. */
function fixTaskFlag(f) {
    const m = /^Q([1-9][0-9]*)=([1-9][0-9]*)$/.exec(f);
    if (m === null)
        throw new CommandError(EXIT.USAGE, `--fix-task=${f} is not Q{n}={task number}, a positive whole number`);
    return [Number(m[1]), Number(m[2])];
}
/** The `decision` row an owner's confirmation writes. */
function decisionRow(file, it, reason) {
    const { fid, ref } = fileRef(file);
    return {
        kind: "decision",
        key: `${slug(fid)}-accepted-${slug(it.title)}`,
        by: { workflow: "ship", step: "ship-confirm-decisions" },
        references: [fid, file],
        summary: `${fid}: ${it.title} accepted (${ref}, confirmed at ship)`,
        rationale: `accepted by owner: ${reason}`,
        status: "ACTIVE",
    };
}
/** The `deferral` row an unconfirmed assumed item becomes. */
function deferralRow(file, it) {
    const { fid, ref } = fileRef(file);
    const severity = /\b(CRITICAL|HIGH|MEDIUM|LOW)\b/.exec(it.text)?.[1] ?? "MEDIUM";
    return {
        kind: "deferral",
        key: `${slug(fid)}-assumed-${slug(it.title)}`,
        by: { workflow: "ship", step: "ship-confirm-decisions" },
        references: [fid, file],
        type: "issue",
        category: "other",
        severity,
        reason: "needs-decision",
        summary: `${fid}: ${it.title} accepted without the owner (${ref})`,
        description: `Decision needed: accept or fix "${it.title}". Options: ${letteredOptions(it.options)}. ${it.rejected ? "The owner rejected the assumed accept at ship." : "Nobody confirmed the assumed accept before the merge."} Item: ${it.text.split("\n")[0]}`,
        status: "OPEN",
    };
}
/** Every `build-decision-*.md` under `logDir`, in name order. */
function decisionFiles(logDir) {
    return fs.existsSync(logDir)
        ? fs
            .readdirSync(logDir)
            .filter((f) => /^build-decision-\d+-\d+\.md$/.test(f))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
            .map((f) => path.join(logDir, f))
        : [];
}
const root = (cwd, flag) => path.resolve(cwd, str(flag) ?? git(cwd, ["rev-parse", "--show-toplevel"]) ?? ".");
// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------
export const decisionsCommand = {
    noun: "decisions",
    summary: "Build decision files: check the orchestrator's questions, write the engine's counts, apply recommendations, list assumed items.",
    verbs: {
        check: {
            summary: "Check the orchestrator's decision file: a decision-counts row names it, lettered options with effects, a Recommended and a Default if unanswered line per question, no repeated number, no Q1 beside the engine's loop question.",
            use: "workflow",
            flags: [{ name: "file", type: "string", required: true, help: "the decision file" }],
            output: {
                file: "the decision file checked",
                questions: "number of questions in it",
                problem: "null, or the first rule it breaks, naming the question",
            },
            exitCodes: {
                [EXIT_NO_STATUS]: "the status.jsonl beside the decision file has a malformed line",
                [EXIT_BAD_DECISION]: "no decision-counts row names the file, or it breaks an item rule: fix it as `problem` says, then check again",
            },
            run: (ctx) => {
                const file = path.resolve(ctx.cwd, String(ctx.flags.file));
                const text = readText(file);
                const problem = checkProblem(readIf, file);
                ctx.emit({
                    file: path.relative(ctx.cwd, file),
                    questions: parseDecisionItems(text).length,
                    problem,
                });
                if (problem !== null)
                    ctx.log(`${path.basename(file)}: ${problem}`);
                return problem === null ? EXIT.OK : EXIT_BAD_DECISION;
            },
        },
        counts: {
            summary: "Append the engine's pause counts as a decision-counts row to the status.jsonl beside the decision file (Source changed, Gate, with --loop the loop question Q1; with no count flag a bare row) and print the lines the owner is shown.",
            use: "workflow",
            flags: [
                {
                    name: "decision",
                    type: "string",
                    required: true,
                    help: "the orchestrator's decision file",
                },
                {
                    name: "source-changed",
                    type: "string",
                    help: "true | false: whether the last fix round changed source",
                },
                {
                    name: "loop",
                    type: "string",
                    help: "verify | holistic | tests: add the progress block and the loop question as Q1",
                },
                { name: "file", type: "string", help: "status.jsonl, with --loop" },
                { name: "group", type: "string", help: "with --loop=verify: the task group" },
                {
                    name: "attempt",
                    type: "string",
                    help: "with --loop: the attempt just failed; one above --max (the round the limit refused) prints as --max",
                },
                { name: "max", type: "string", help: "with --loop: the point's maxAttempts" },
                {
                    name: "base-check",
                    type: "string",
                    help: "the `bkit tests base` output JSON; writes `Gate: FAIL`, and with --loop the base-commit line and a steered recommendation",
                },
            ],
            output: {
                file: "the decision file the row names",
                questions: "number of questions in the decision file, the loop question not counted",
                loopRecommended: "Try again | Decide | Stop (with --loop), else null",
                show: "the attempt, progress, base-check and loop question lines the owner is shown",
            },
            exitCodes: {
                [EXIT_NO_STATUS]: "the status.jsonl beside the decision file is missing or has a malformed line; nothing written",
            },
            run: (ctx) => {
                const decision = path.resolve(ctx.cwd, String(ctx.flags.decision));
                const own = parseDecisionItems(readText(decision)).length;
                const sourceChanged = str(ctx.flags.sourceChanged);
                if (sourceChanged !== undefined && sourceChanged !== "true" && sourceChanged !== "false")
                    throw new CommandError(EXIT.USAGE, "--source-changed must be true or false");
                const baseFlag = str(ctx.flags.baseCheck);
                const baseCheck = baseFlag === undefined ? undefined : readBaseCheck(path.resolve(ctx.cwd, baseFlag));
                const loopName = str(ctx.flags.loop);
                const lines = [];
                let loopRow;
                let loopRecommended = null;
                if (loopName !== undefined) {
                    const loop = LOOPS[loopName];
                    if (loop === undefined)
                        throw new CommandError(EXIT.USAGE, "--loop must be verify, holistic or tests");
                    if (ctx.flags.file === undefined)
                        throw new CommandError(EXIT.USAGE, "--loop needs --file");
                    const group = positiveInt(ctx.flags.group, "group");
                    // A grouped gate counts only for a named group.
                    const gate = loopGateStep(loop, group) === undefined ? undefined : loop.gate;
                    const p = loopProgress(path.resolve(ctx.cwd, String(ctx.flags.file)), ctx.cwd, "build", loop.check, loop.fix, group, loop.sinceClean === true, gate);
                    const max = str(ctx.flags.max) ?? "?";
                    const changed = p.codeChanged === null ? "unknown" : p.codeChanged ? "yes" : "no";
                    loopRecommended = p.recommend === "stop" ? "Decide" : "Try again";
                    const given = str(ctx.flags.attempt) ?? String(p.rounds.length);
                    const attemptNum = Number(given);
                    const maxNum = Number(max);
                    const limitUsed = Number.isFinite(attemptNum) && Number.isFinite(maxNum) && attemptNum >= maxNum;
                    // An attempt above max is the round the limit refused (`counters route ... :next`
                    // exits 1 with max + 1), so the rounds run are max.
                    const attempt = limitUsed && attemptNum > maxNum ? max : given;
                    const trendReason = p.trend === "unknown"
                        ? limitUsed
                            ? `the limit is used up and the counts cannot show whether the rounds helped (${p.trendLine})`
                            : `the counts cannot show whether the rounds helped (${p.trendLine})`
                        : loopRecommended === "Try again"
                            ? "the last round made progress"
                            : "another round is unlikely to close the remaining items";
                    let reason = trendReason;
                    let baseLine = [];
                    if (baseCheck !== undefined) {
                        const b = baseCheck;
                        const at = b.base ?? "unknown";
                        baseLine = [
                            b.verdict === "unknown"
                                ? `Also red on base ${at}: can't tell (${b.reason ?? "no reason given"})`
                                : `Also red on base ${at}: ${b.baseRed} of ${b.failing} (${b.source ?? "unknown"} run)`,
                        ];
                        if (b.verdict === "all") {
                            loopRecommended = own > 0 ? "Decide" : "Stop";
                            reason = `all ${b.failing} failing tests fail on \`dev\` too, so no round here can fix them. Fix \`dev\`, then resume. If the gate is still red after \`dev\` is fixed and the run resumed, the rest comes from this branch, and the gate re-run on resume shows it.${b.adopt ? " This run has no worktrees: merge \`dev\` into the branch before resuming." : ""}`;
                        }
                        else if (b.verdict === "some") {
                            const unchecked = b.undetermined > 0
                                ? ` ${b.undetermined} could not be checked: ${b.reason ?? "no reason given"}.`
                                : "";
                            reason = `a round can fix ${b.branch} of ${b.failing}; the build will still stop on the ${b.baseRed} from \`dev\`.${unchecked} ${trendReason}`;
                        }
                        else if (b.verdict === "none") {
                            reason = `the failures come from this branch, so a round can fix them. ${trendReason}`;
                        }
                        else {
                            reason = `cause unknown: ${b.reason ?? "no reason given"}. ${trendReason}`;
                        }
                    }
                    const loopOptions = own > 0 ? ["Try again", "Decide"] : ["Try again", "Stop"];
                    const loopPick = own > 0 || loopRecommended === "Try again" ? loopRecommended : "Stop";
                    const loopQuestion = loopRecommended === "Try again"
                        ? `another fix round? ${p.trendLine}`
                        : `decide the items below instead of another round? ${p.trendLine}`;
                    loopRow = {
                        title: loop.title,
                        question: loopQuestion,
                        options: loopOptions,
                        recommended: loopPick,
                        reason,
                        attempt,
                        max,
                        progress: {
                            problems: p.counts,
                            ...(p.gateCounts === undefined ? {} : { gateFailures: p.gateCounts }),
                            codeChanged: p.codeChanged,
                            lastStrategy: p.lastStrategy,
                            nextStrategy: p.nextStrategy,
                            finalSpent: p.finalSpent,
                            minutesPerRound: p.minutesPerRound,
                            trend: p.trend,
                        },
                    };
                    lines.push(`build ${loop.point}: attempt ${attempt} of ${max}`, "", "## Progress", "", `Problems after each round: ${p.counts || "none recorded"}`, ...(p.gateCounts === undefined
                        ? []
                        : [`${loop.gateTitle ?? "Gate"} failures after each round: ${p.gateCounts}`]), `Code changed: ${changed}`, `Strategy: ${p.lastStrategy ?? "none"} → next ${p.nextStrategy}${p.finalSpent ? " (FINAL already used)" : ""}`, `Minutes per round: ${p.minutesPerRound ?? "unknown"}`, `Trend: ${p.trend}`, ...baseLine, "", ...loopQuestionLines({
                        title: loop.title,
                        question: loopQuestion,
                        options: loopOptions,
                        recommended: loopPick,
                        reason,
                    }));
                    if (own === 0 && loopRecommended === "Decide")
                        loopRecommended = "Stop";
                }
                appendRow(decision, ctx.cwd, {
                    type: "decision-counts",
                    ...(sourceChanged === undefined ? {} : { sourceChanged: sourceChanged === "true" }),
                    ...(baseCheck === undefined ? {} : { gate: "FAIL", baseCheck }),
                    ...(loopRow === undefined ? {} : { loop: loopRow }),
                });
                const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
                ctx.emit({
                    file: path.relative(top, decision),
                    questions: own,
                    loopRecommended,
                    show: lines,
                });
                return EXIT.OK;
            },
        },
        apply: {
            summary: "Settle a pause's questions, appending decision-answer rows to the status.jsonl beside the decision file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, answers questions, or adds the fix task to a recorded Fix now; --by=rerun answers the loop question Try again.",
            use: "workflow",
            flags: [
                { name: "file", type: "string", required: true, help: "the decision file" },
                { name: "by", type: "string", required: true, help: "headless | owner | rerun" },
                { name: "q", type: "string", help: "--by=owner --confirm / --reject: the question number" },
                { name: "confirm", type: "boolean", help: "--by=owner: confirm the assumed Accept" },
                { name: "reject", type: "boolean", help: "--by=owner: reject the assumed Accept" },
                {
                    name: "answer",
                    type: "string",
                    repeatable: true,
                    help: "--by=owner: one answer, Q{n}={option letter}, e.g. Q2=B; repeat for each question",
                },
                {
                    name: "fix-task",
                    type: "string",
                    repeatable: true,
                    help: "--by=owner: Q{n}={task number} for a question answered Fix now in the same call; alone, for a Fix now already recorded, keeping who answered it",
                },
                {
                    name: "reason-file",
                    type: "string",
                    help: "--by=owner --confirm / --reject: a file holding the owner's words, read as plain text",
                },
                {
                    name: "root",
                    type: "string",
                    help: "--by=owner: the checkout the ledgers live in (default: the repo top)",
                },
            ],
            output: {
                status: "the pause's Status after the call: OPEN | ASSUMED | DECIDED",
                applied: "--by=headless: question numbers settled on their recommendation",
                hardBlockers: "--by=headless: question numbers with no recommendation, left for the owner",
                loop: "--by=headless: the loop answer (Try again | Decide | Stop), or null",
                fixNow: "--by=headless: question numbers settled as Fix now",
                decisionKey: "--by=owner --confirm: key of the decision row written",
                problem: "why nothing was applied: the `decisions check` problem (no decision-counts row, no readable question, or a broken item rule); --by=owner and --by=rerun pass an old file, read as written",
            },
            exitCodes: {
                [EXIT_NO_STATUS]: "the status.jsonl beside the decision file is missing or has a malformed line; nothing written",
                [EXIT_HARD_BLOCKERS]: "--by=headless: hard blockers remain (headless → Failure Path; a session asks them); --by=owner --confirm: the decisions.jsonl append failed",
                [EXIT_BAD_DECISION]: "nothing applied, as `problem` says: the file fails `decisions check`; no row written",
                [EXIT_ROW_REFUSED]: "--by=owner --confirm: decisions.jsonl refused the decision row",
            },
            run: (ctx) => {
                const file = path.resolve(ctx.cwd, String(ctx.flags.file));
                const pause = pauseOf(file);
                const by = String(ctx.flags.by);
                const statusNow = () => pauseStatus(readIf, file);
                if (by === "headless") {
                    const refused = checkProblem(readIf, file);
                    if (refused !== null) {
                        ctx.emit({
                            status: "OPEN",
                            applied: [],
                            hardBlockers: [],
                            loop: null,
                            fixNow: [],
                            problem: refused,
                        });
                        ctx.log(`${path.basename(file)}: ${refused}`);
                        return EXIT_BAD_DECISION;
                    }
                    const runtime = classifyAt(ctx.cwd);
                    const r = applyRecommendations(pause.items, undecidedBesidesLoop(readIf, file).hasLoop, runtime, runtime === "GITHUB_ACTION" ? "headless" : "ask:false");
                    for (const row of r.rows)
                        appendRow(file, ctx.cwd, row);
                    const after = decisionItems(readIf, file);
                    ctx.emit({
                        status: statusNow(),
                        applied: r.applied,
                        hardBlockers: r.hardBlockers,
                        loop: r.loop,
                        fixNow: after.filter((i) => i.decision?.startsWith("Fix now")).map((i) => i.n),
                    });
                    if (r.hardBlockers.length > 0)
                        ctx.log(`hard blockers need the owner: Q${r.hardBlockers.join(", Q")}`);
                    return r.hardBlockers.length > 0 ? EXIT_HARD_BLOCKERS : EXIT.OK;
                }
                if (by !== "owner" && by !== "rerun")
                    throw new CommandError(EXIT.USAGE, "--by must be headless, owner or rerun");
                // The full check the fold applies, so a row is written exactly when it counts. An old
                // file passes.
                const refused = pauseProblem(readIf, file);
                if (refused !== null) {
                    ctx.emit({ status: statusNow(), problem: refused });
                    ctx.log(`${path.basename(file)}: ${refused}`);
                    return EXIT_BAD_DECISION;
                }
                if (by === "rerun") {
                    const name = path.basename(file);
                    const header = decisionFileHeader(readIf, file);
                    if (!/^FAIL\b/.test(header.Gate ?? ""))
                        throw new CommandError(EXIT.USAGE, `${name} has no Gate: FAIL header`);
                    const status = statusNow();
                    if (status !== "OPEN")
                        throw new CommandError(EXIT.USAGE, `${name} is Status: ${status}, not OPEN`);
                    const { hasLoop, undecided } = undecidedBesidesLoop(readIf, file);
                    if (!hasLoop)
                        throw new CommandError(EXIT.USAGE, `${name}: Q1 is not the loop question (no decision-counts loop), so a re-run cannot answer it; undecided: ${undecided.join(", ") || "none"}`);
                    if (undecided.length > 0)
                        throw new CommandError(EXIT.USAGE, `${name} has undecided questions besides the loop question: ${undecided.join(", ")}`);
                    answerRow(file, ctx.cwd, 1, `Try again — the owner resumed the run, so the gate runs again first (${today()})`, "rerun");
                    ctx.emit({ status: statusNow() });
                    return EXIT.OK;
                }
                const answers = ctx.flags.answer ?? [];
                const fixTasks = ctx.flags.fixTask ?? [];
                const reasonFile = str(ctx.flags.reasonFile);
                if (answers.length > 0) {
                    if (ctx.flags.confirm === true ||
                        ctx.flags.reject === true ||
                        ctx.flags.q !== undefined ||
                        reasonFile !== undefined)
                        throw new CommandError(EXIT.USAGE, "--answer stands alone: --confirm, --reject, --q and --reason-file go with a confirmation, not an answer");
                    const picked = new Map();
                    for (const a of answers) {
                        const m = /^Q([1-9][0-9]*)=([A-Z])$/.exec(a);
                        if (m === null)
                            throw new CommandError(EXIT.USAGE, `--answer=${a} is not Q{n}={option letter}, e.g. Q2=B`);
                        const q = Number(m[1]);
                        const it = pause.items.find((i) => i.n === q);
                        const option = it?.options[m[2].charCodeAt(0) - 65];
                        if (option === undefined)
                            throw new CommandError(EXIT.USAGE, `Q${q} has no option ${m[2]} in ${path.basename(file)}`);
                        if (picked.has(q))
                            throw new CommandError(EXIT.USAGE, `Q${q} is answered twice`);
                        picked.set(q, option);
                    }
                    const tasks = new Map();
                    for (const f of fixTasks) {
                        const [q, task] = fixTaskFlag(f);
                        if (picked.get(q) !== "Fix now")
                            throw new CommandError(EXIT.USAGE, `--fix-task=${f}: Q${q} is not answered Fix now in this call`);
                        tasks.set(q, task);
                    }
                    for (const [q, option] of picked)
                        answerRow(file, ctx.cwd, q, `${option} \u2014 the owner's choice (owner, ${today()})`, "owner", {
                            ...(tasks.has(q) ? { fixTask: tasks.get(q) } : {}),
                        });
                    ctx.emit({ status: statusNow(), decisionKey: null });
                    return EXIT.OK;
                }
                if (fixTasks.length > 0) {
                    if (ctx.flags.confirm === true ||
                        ctx.flags.reject === true ||
                        ctx.flags.q !== undefined ||
                        reasonFile !== undefined)
                        throw new CommandError(EXIT.USAGE, "--fix-task goes with an --answer of Fix now, or alone for a Fix now already recorded");
                    // A Fix now already recorded keeps its writer and words; the row adds only the task.
                    const recorded = [];
                    for (const f of fixTasks) {
                        const [q, task] = fixTaskFlag(f);
                        const it = pause.items.find((i) => i.n === q);
                        if (it === undefined || it.by === null || !/^Fix now\b/.test(it.decision ?? ""))
                            throw new CommandError(EXIT.USAGE, `--fix-task=${f}: Q${q} has no recorded Fix now answer; pass --answer=Q${q}={letter} with it`);
                        recorded.push({ it, task });
                    }
                    const answers = decisionRows(readIf, file).filter((r) => r.type === "decision-answer");
                    for (const { it, task } of recorded) {
                        const last = answers.filter((r) => Number(r.q) === it.n).at(-1);
                        // A fresh `at`; every other field of the recorded answer is kept.
                        const { at: _at, ...copy } = last;
                        appendRow(file, ctx.cwd, { ...copy, type: "decision-answer", fixTask: task });
                    }
                    ctx.emit({ status: statusNow(), decisionKey: null });
                    return EXIT.OK;
                }
                const n = positiveInt(ctx.flags.q, "q");
                if (n === undefined ||
                    reasonFile === undefined ||
                    [ctx.flags.confirm === true, ctx.flags.reject === true].filter(Boolean).length !== 1)
                    throw new CommandError(EXIT.USAGE, "--by=owner needs --answer=Q{n}={letter}, or --q, --reason-file and one of --confirm / --reject");
                const reasonPath = path.resolve(ctx.cwd, reasonFile);
                if (!fs.existsSync(reasonPath))
                    throw new CommandError(EXIT.USAGE, `--reason-file ${reasonFile} does not exist`);
                const reason = fs.readFileSync(reasonPath, "utf-8").trim();
                const it = pause.items.find((i) => i.n === n);
                if (it === undefined || !it.assumed)
                    throw new CommandError(EXIT.USAGE, `Q${n} is not an assumed Accept in ${path.basename(file)}`);
                let decisionKey = null;
                if (ctx.flags.confirm === true) {
                    const row = decisionRow(path.relative(root(ctx.cwd, ctx.flags.root), file), it, reason);
                    appendLedgerRows(root(ctx.cwd, ctx.flags.root), "decisions", [row]);
                    decisionKey = String(row.key);
                    answerRow(file, ctx.cwd, n, `Accept \u2014 confirmed by the owner at ship (owner, ${today()})`, "owner", { workflow: "ship" });
                }
                else {
                    const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
                    answerRow(file, ctx.cwd, n, it.decision ?? "Accept (assumed)", "owner", {
                        workflow: "ship",
                        assumed: true,
                        rejected: true,
                        reasonFile: path.relative(top, reasonPath),
                    });
                }
                ctx.emit({ status: statusNow(), decisionKey });
                return EXIT.OK;
            },
        },
        answers: {
            summary: "Print a decision file's folded answers: the answer last appended for each question, who gave it and its flags. Writes nothing.",
            use: "workflow",
            flags: [{ name: "file", type: "string", required: true, help: "the decision file" }],
            output: {
                file: "the decision file read",
                status: "the pause's Status: OPEN | ASSUMED | DECIDED",
                items: "[{q, title, answer, by, assumed, rejected, deferred, fixTask}], answer null while unanswered",
            },
            exitCodes: {
                [EXIT_NO_STATUS]: "the status.jsonl beside the decision file has a malformed line",
            },
            run: (ctx) => {
                const file = path.resolve(ctx.cwd, String(ctx.flags.file));
                const items = pauseOf(file).items;
                ctx.emit({
                    file: path.relative(ctx.cwd, file),
                    status: pauseStatus(readIf, file),
                    items: items.map((i) => ({
                        q: i.n,
                        title: i.title,
                        answer: i.decision,
                        by: i.by,
                        assumed: i.assumed,
                        rejected: i.rejected,
                        deferred: i.deferred,
                        fixTask: i.fixTask,
                    })),
                });
                return EXIT.OK;
            },
        },
        skip: {
            summary: "Whether a settled verify or holistic pause may route continue: exit 0 and route=continue when all five conditions hold, else exit 1 naming the first fact that fails.",
            use: "workflow",
            flags: [{ name: "file", type: "string", required: true, help: "the decision file" }],
            output: {
                route: "continue when every condition holds, else null",
                problem: "null, or the first fact that fails: From not verify or holistic, an item not Accept or Accept (assumed), the loop question not Decide, a Gate: FAIL header, or a Source changed header missing or not false",
            },
            exitCodes: {
                [EXIT_NO_STATUS]: "the status.jsonl beside the decision file has a malformed line; not a re-run, so the workflow takes the Failure Path",
            },
            run: (ctx) => {
                const file = path.resolve(ctx.cwd, String(ctx.flags.file));
                const read = readTextFile(file);
                if (!read.ok)
                    throw new CommandError(EXIT.USAGE, `${file} is missing or unreadable`);
                const problem = skipProblem(readIf, file);
                if (problem !== null)
                    ctx.log(`${path.basename(file)}: ${problem}`);
                ctx.emit({ route: problem === null ? "continue" : null, problem });
                return problem === null ? EXIT.OK : EXIT.NO;
            },
        },
        pending: {
            summary: "List the feature's assumed Accepts nobody confirmed; --defer writes one needs-decision deferral per item.",
            use: "workflow",
            flags: [
                { name: "fid", type: "string", required: true, help: "feature id" },
                { name: "month", type: "string", required: true, help: "YYYYMM of the feature's logs" },
                {
                    name: "root",
                    type: "string",
                    help: "the checkout the plans and ledgers live in (default: the repo top)",
                },
                {
                    name: "defer",
                    type: "boolean",
                    help: "write a deferral row per listed item and mark it Deferred",
                },
            ],
            output: {
                items: "[{file, q, title, reason, state: pending|rejected}]",
                count: "items listed",
                deferred: "--defer: deferral keys written",
            },
            exitCodes: { [EXIT_NO_STATUS]: "a status.jsonl beside a decision file has a malformed line" },
            run: (ctx) => {
                const top = root(ctx.cwd, ctx.flags.root);
                const { month, fid } = monthAndFid(ctx);
                const logDir = path.join(top, "docs", "plans", month, "logs", fid);
                const items = [];
                const rows = [];
                for (const abs of decisionFiles(logDir)) {
                    const rel = path.relative(top, abs);
                    const merged = decisionItems(readIf, abs);
                    for (const it of merged) {
                        if (!it.assumed || it.deferred)
                            continue;
                        items.push({
                            file: rel,
                            q: it.n,
                            title: it.title,
                            reason: it.reason,
                            state: it.rejected ? "rejected" : "pending",
                        });
                        if (ctx.flags.defer === true) {
                            rows.push(deferralRow(rel, it));
                            answerRow(abs, ctx.cwd, it.n, it.decision ?? "Accept (assumed)", "ship", {
                                workflow: "ship",
                                assumed: true,
                                rejected: it.rejected,
                                deferred: "needs-decision",
                            });
                        }
                    }
                }
                const deferred = rows.length > 0 ? appendLedgerRows(top, "deferrals", rows).keys : [];
                ctx.emit({ items, count: items.length, deferred });
                return EXIT.OK;
            },
        },
    },
};
