// bkit decisions compose|apply|pending — the build's decision files, from question to ship.
//
// A decision file (`docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{N}.md`) holds header
// lines, an optional progress block, then one item per question:
//
//   **Q{n} — {title}:** {question}
//   Options: {A} / {B}
//   Recommended: {A} — {reason}          (a hard blocker: `No recommendation — {why}`)
//   Decision: {answer} — {words}         (once decided)
//
// `apply --by=headless` takes each recommendation when nobody can or should be asked: an
// `Accept` is written `Accept (assumed)` and the file says `Status: ASSUMED`. It never writes a
// `docs/decisions.jsonl` row or a `TEST EXCEPTION`: only the owner's words do. Ship lists the
// assumed items with `pending`; the owner confirms each (`apply --by=owner --confirm`, which
// writes the real acceptance) or rejects it, and `pending --defer` writes one `needs-decision`
// deferral per item nobody confirmed.
import * as fs from "node:fs";
import * as path from "node:path";
import { readJsonFile } from "../../shared/json.js";
import { CommandError, EXIT, git } from "../lib.js";
import { loopProgress } from "./counters.js";
import { appendLedgerRows } from "./ledgers.js";
import { classifyAt } from "./runtime.js";
import { positiveInt, str } from "./status.js";
/** Exit code: `apply --by=headless` left hard blockers (no recommendation) for the owner. */
export const EXIT_HARD_BLOCKERS = 4;
const ITEM_SPLIT = /^(?=\*\*Q\d+ — )/m;
const lineOf = (text, key) => new RegExp(`^${key}:[ \\t]*(.+?)[ \\t]*$`, "m").exec(text)?.[1] ?? null;
/** The items of a decision file's text, in file order. */
export function parseDecisionItems(text) {
    return text
        .split(ITEM_SPLIT)
        .slice(1)
        .map((part) => {
        const head = /^\*\*Q(\d+) — (.+?):\*\*/.exec(part);
        const rec = lineOf(part, "Recommended");
        const none = /^No recommendation\b/m.test(part);
        const [option, ...why] = (rec ?? "").split(" — ");
        const decision = lineOf(part, "Decision");
        return {
            n: Number(head?.[1] ?? 0),
            title: head?.[2] ?? "",
            text: part.trimEnd(),
            options: (lineOf(part, "Options") ?? "")
                .split(" / ")
                .map((o) => o.trim())
                .filter(Boolean),
            recommended: none || rec === null ? null : (option ?? "").trim(),
            reason: why.join(" — ").trim(),
            decision,
            assumed: decision !== null && /^Accept \(assumed\)/.test(decision),
            rejected: lineOf(part, "Rejected") !== null,
            deferred: lineOf(part, "Deferred") !== null,
        };
    });
}
/** `Status:` set to `status`. */
const withStatus = (text, status) => /^Status:.*$/m.test(text)
    ? text.replace(/^Status:.*$/m, `Status: ${status}`)
    : `Status: ${status}\n${text}`;
/** `extra` lines added under item `n`'s last line. */
function addUnder(text, n, extra, replace) {
    const parts = text.split(ITEM_SPLIT);
    const i = parts.findIndex((p) => p.startsWith(`**Q${n} — `));
    if (i < 0)
        throw new CommandError(EXIT.USAGE, `no Q${n} in the decision file`);
    const body = parts[i].trimEnd().split("\n");
    const kept = replace === undefined ? body : body.filter((l) => !replace.test(l));
    const trail = parts[i].slice(parts[i].trimEnd().length) || "\n\n";
    parts[i] = [...kept, ...extra].join("\n") + trail;
    return parts.join("");
}
/** The status a file's items leave it in. */
function statusOf(items) {
    if (items.some((i) => i.decision === null))
        return "OPEN";
    return items.some((i) => i.assumed && !i.deferred) ? "ASSUMED" : "DECIDED";
}
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
const LOOPS = {
    verify: {
        title: "Verify",
        check: "build-plan-verify",
        fix: "build-plan-gaps-remediate",
        point: "verify",
    },
    tests: {
        title: "Tests",
        check: "build-run-tests",
        fix: "build-failure-diagnose",
        point: "tests",
    },
};
function composeItems(raw) {
    if (!Array.isArray(raw))
        throw new CommandError(EXIT.USAGE, "--items must hold a JSON array");
    return raw.map((r, i) => {
        const o = (r ?? {});
        const s = (k) => (typeof o[k] === "string" ? o[k].trim() : "");
        const options = Array.isArray(o.options) ? o.options.filter((x) => typeof x === "string") : [];
        if (s("title") === "" || s("question") === "" || options.length === 0)
            throw new CommandError(EXIT.USAGE, `item ${i + 1}: needs title, question and options`);
        if (s("noRecommendation") === "" && !options.includes(s("recommended")))
            throw new CommandError(EXIT.USAGE, `item ${i + 1}: recommended must be one of its options, or set noRecommendation`);
        return {
            title: s("title"),
            question: s("question"),
            options: options,
            recommended: s("recommended"),
            reason: s("reason"),
            noRecommendation: s("noRecommendation"),
        };
    });
}
const itemLines = (n, it) => [
    `**Q${n} — ${it.title}:** ${it.question}`,
    `Options: ${it.options.join(" / ")}`,
    it.noRecommendation
        ? `No recommendation — ${it.noRecommendation}`
        : `Recommended: ${it.recommended} — ${it.reason || "the orchestrator's call"}`,
];
// ---------------------------------------------------------------------------
// apply
// ---------------------------------------------------------------------------
/** Each undecided item's recommendation written in; hard blockers left for the owner. */
export function applyRecommendations(text, runtime, why) {
    const items = parseDecisionItems(text);
    const loopItem = items.find((i) => i.options.includes("Try again"));
    const loop = loopItem?.decision?.split(" — ")[0] ?? loopItem?.recommended ?? null;
    const applied = [];
    const hardBlockers = [];
    let out = text;
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
        const line = it.recommended === "Accept"
            ? `Decision: Accept (assumed) — ${it.reason} (${why}, ${runtime}, ${today()})`
            : `Decision: ${it.recommended} — recommended; applied without asking (${runtime})`;
        out = addUnder(out, it.n, [line]);
        applied.push(it.n);
    }
    out = withStatus(out, statusOf(parseDecisionItems(out)));
    return { text: out, applied, hardBlockers, loop };
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
        description: `Decision needed: accept or fix "${it.title}". Options: ${it.options.join(" / ")}. ${it.rejected ? "The owner rejected the assumed accept at ship." : "Nobody confirmed the assumed accept before the merge."} Item: ${it.text.split("\n")[0]}`,
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
    summary: "Build decision files: write questions, apply recommendations, list assumed items.",
    verbs: {
        compose: {
            summary: "Write a decision file in the one question layout, with loop progress when asked.",
            flags: [
                { name: "out", type: "string", required: true, help: "the decision file to write" },
                {
                    name: "header",
                    type: "string",
                    repeatable: true,
                    help: "Key=Value header line (Status: OPEN is written first)",
                },
                {
                    name: "items",
                    type: "string",
                    help: "JSON file: [{title, question, options, recommended, reason} | {…, noRecommendation}]",
                },
                {
                    name: "loop",
                    type: "string",
                    help: "verify | tests: add the progress block and the loop question as Q1",
                },
                { name: "file", type: "string", help: "status.jsonl, with --loop" },
                { name: "group", type: "string", help: "with --loop=verify: the plan group" },
                { name: "attempt", type: "string", help: "with --loop: the attempt just failed" },
                { name: "max", type: "string", help: "with --loop: the point's maxAttempts" },
            ],
            output: {
                file: "the decision file written",
                questions: "number of questions",
                loopRecommended: "Try again | Decide (with --loop), else null",
            },
            run: (ctx) => {
                const out = path.resolve(ctx.cwd, String(ctx.flags.out));
                const headers = (ctx.flags.header ?? []).map((h) => {
                    const eq = h.indexOf("=");
                    if (eq <= 0)
                        throw new CommandError(EXIT.USAGE, `--header ${h}: must be Key=Value`);
                    return `${h.slice(0, eq)}: ${h.slice(eq + 1)}`;
                });
                let items = [];
                if (ctx.flags.items !== undefined) {
                    const read = readJsonFile(path.resolve(ctx.cwd, String(ctx.flags.items)));
                    if (!read.ok)
                        throw new CommandError(EXIT.USAGE, "--items is missing or not JSON");
                    items = composeItems(read.value);
                }
                const lines = ["Status: OPEN", ...headers.filter((h) => !h.startsWith("Status:")), ""];
                let loopRecommended = null;
                const loopName = str(ctx.flags.loop);
                if (loopName !== undefined) {
                    const loop = LOOPS[loopName];
                    if (loop === undefined)
                        throw new CommandError(EXIT.USAGE, "--loop must be verify or tests");
                    if (ctx.flags.file === undefined)
                        throw new CommandError(EXIT.USAGE, "--loop needs --file");
                    const p = loopProgress(path.resolve(ctx.cwd, String(ctx.flags.file)), ctx.cwd, "build", loop.check, loop.fix, positiveInt(ctx.flags.group, "group"));
                    const attempt = str(ctx.flags.attempt) ?? String(p.rounds.length);
                    const max = str(ctx.flags.max) ?? "?";
                    const changed = p.codeChanged === null ? "unknown" : p.codeChanged ? "yes" : "no";
                    const trendLine = {
                        "first-round": "This was the first round, so there is no trend yet.",
                        closing: "Fewer problems after each round, and the code changed.",
                        stuck: "No fewer problems, or the code did not change.",
                        worse: "More problems than the first round.",
                    }[p.trend];
                    loopRecommended = p.recommend === "stop" ? "Decide" : "Try again";
                    lines.push(`build ${loop.point}: attempt ${attempt} of ${max}`, "", "## Progress", "", `Problems after each round: ${p.counts || "none recorded"}`, `Code changed: ${changed}`, `Strategy: ${p.lastStrategy ?? "none"} → next ${p.nextStrategy}${p.finalSpent ? " (FINAL already used)" : ""}`, `Minutes per round: ${p.minutesPerRound ?? "unknown"}`, `Trend: ${p.trend}`, "", ...itemLines(1, {
                        title: loop.title,
                        question: loopRecommended === "Try again"
                            ? `another fix round? ${trendLine}`
                            : `decide the items below instead of another round? ${trendLine}`,
                        options: items.length > 0 ? ["Try again", "Decide"] : ["Try again", "Stop"],
                        recommended: items.length > 0 || loopRecommended === "Try again" ? loopRecommended : "Stop",
                        reason: loopRecommended === "Try again"
                            ? "the last round made progress"
                            : "another round is unlikely to close the remaining items",
                    }), "");
                    if (items.length === 0 && loopRecommended === "Decide")
                        loopRecommended = "Stop";
                }
                const first = loopName === undefined ? 1 : 2;
                items.forEach((it, i) => lines.push(...itemLines(first + i, it), ""));
                lines.push('Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.', "");
                fs.mkdirSync(path.dirname(out), { recursive: true });
                fs.writeFileSync(out, lines.join("\n"), "utf-8");
                ctx.emit({
                    file: path.relative(ctx.cwd, out),
                    questions: items.length + (loopName === undefined ? 0 : 1),
                    loopRecommended,
                });
                return EXIT.OK;
            },
        },
        apply: {
            summary: "Settle a decision file's items: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item.",
            flags: [
                { name: "file", type: "string", required: true, help: "the decision file" },
                { name: "by", type: "string", required: true, help: "headless | owner" },
                { name: "q", type: "string", help: "--by=owner: the question number" },
                { name: "confirm", type: "boolean", help: "--by=owner: confirm the assumed Accept" },
                { name: "reject", type: "boolean", help: "--by=owner: reject the assumed Accept" },
                { name: "reason", type: "string", help: "--by=owner: the owner's words" },
                {
                    name: "root",
                    type: "string",
                    help: "--by=owner: the checkout the ledgers live in (default: the repo top)",
                },
            ],
            output: {
                status: "the file's Status after the call: OPEN | ASSUMED | DECIDED",
                applied: "--by=headless: question numbers settled on their recommendation",
                hardBlockers: "--by=headless: question numbers with no recommendation, left for the owner",
                loop: "--by=headless: the loop answer (Try again | Decide | Stop), or null",
                fixNow: "--by=headless: question numbers settled as Fix now",
                decisionKey: "--by=owner --confirm: key of the decision row written",
            },
            exitCodes: {
                [EXIT_HARD_BLOCKERS]: "--by=headless: hard blockers remain (headless → Failure Path; a session asks them)",
            },
            run: (ctx) => {
                const file = path.resolve(ctx.cwd, String(ctx.flags.file));
                const text = readText(file);
                const by = String(ctx.flags.by);
                if (by === "headless") {
                    const runtime = classifyAt(ctx.cwd);
                    const r = applyRecommendations(text, runtime, runtime === "GITHUB_ACTION" ? "headless" : "ask:false");
                    fs.writeFileSync(file, r.text, "utf-8");
                    const after = parseDecisionItems(r.text);
                    ctx.emit({
                        status: /^Status:[ \t]*(\S+)/m.exec(r.text)?.[1] ?? "OPEN",
                        applied: r.applied,
                        hardBlockers: r.hardBlockers,
                        loop: r.loop,
                        fixNow: after.filter((i) => i.decision?.startsWith("Fix now")).map((i) => i.n),
                    });
                    if (r.hardBlockers.length > 0)
                        ctx.log(`hard blockers need the owner: Q${r.hardBlockers.join(", Q")}`);
                    return r.hardBlockers.length > 0 ? EXIT_HARD_BLOCKERS : EXIT.OK;
                }
                if (by !== "owner")
                    throw new CommandError(EXIT.USAGE, "--by must be headless or owner");
                const n = positiveInt(ctx.flags.q, "q");
                const reason = str(ctx.flags.reason);
                if (n === undefined ||
                    reason === undefined ||
                    (ctx.flags.confirm === true) === (ctx.flags.reject === true))
                    throw new CommandError(EXIT.USAGE, "--by=owner needs --q, --reason and one of --confirm / --reject");
                const it = parseDecisionItems(text).find((i) => i.n === n);
                if (it === undefined || !it.assumed)
                    throw new CommandError(EXIT.USAGE, `Q${n} is not an assumed Accept in ${path.basename(file)}`);
                let out;
                let decisionKey = null;
                if (ctx.flags.confirm === true) {
                    const row = decisionRow(path.relative(root(ctx.cwd, ctx.flags.root), file), it, reason);
                    appendLedgerRows(root(ctx.cwd, ctx.flags.root), "decisions", [row]);
                    decisionKey = String(row.key);
                    out = addUnder(text, n, [`Decision: Accept — ${reason} (owner, confirmed at ship, ${today()})`], /^(Decision|Rejected):/);
                }
                else {
                    out = addUnder(text, n, [`Rejected: ${reason} (owner, ${today()})`], /^Rejected:/);
                }
                out = withStatus(out, statusOf(parseDecisionItems(out)));
                fs.writeFileSync(file, out, "utf-8");
                ctx.emit({ status: /^Status:[ \t]*(\S+)/m.exec(out)?.[1] ?? "OPEN", decisionKey });
                return EXIT.OK;
            },
        },
        pending: {
            summary: "List the feature's assumed Accepts nobody confirmed; --defer writes one needs-decision deferral per item.",
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
            run: (ctx) => {
                const top = root(ctx.cwd, ctx.flags.root);
                const month = String(ctx.flags.month);
                if (!/^[0-9]{6}$/.test(month))
                    throw new CommandError(EXIT.USAGE, "--month must be YYYYMM");
                const logDir = path.join(top, "docs", "plans", month, "logs", String(ctx.flags.fid));
                const items = [];
                const rows = [];
                for (const abs of decisionFiles(logDir)) {
                    const rel = path.relative(top, abs);
                    let text = fs.readFileSync(abs, "utf-8");
                    for (const it of parseDecisionItems(text)) {
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
                            text = addUnder(text, it.n, [`Deferred: needs-decision (${today()})`]);
                        }
                    }
                    if (ctx.flags.defer === true) {
                        text = withStatus(text, statusOf(parseDecisionItems(text)));
                        fs.writeFileSync(abs, text, "utf-8");
                    }
                }
                const deferred = rows.length > 0 ? appendLedgerRows(top, "deferrals", rows).keys : [];
                ctx.emit({ items, count: items.length, deferred });
                return EXIT.OK;
            },
        },
    },
};
