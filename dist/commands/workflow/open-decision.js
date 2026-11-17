// Read a build Decision Pause file: its header, its items, the run's open pause, and the two
// rules read from them — whether a resume re-runs a red gate (`gateRerun`) and whether a
// pause may route `continue` (`skipProblem`). `decisions.ts` writes these files; this module
// only reads them and imports nothing from the command modules, so `status.ts`, `steps.ts`
// and `workflows.ts` read it without an import cycle.
import * as fs from "node:fs";
import * as path from "node:path";
/** Splits a decision file before each `**Q{n} — ` item line. */
export const ITEM_SPLIT = /^(?=\*\*Q\d+ — )/m;
const lineOf = (text, key) => new RegExp(`^${key}:[ \\t]*(.+?)[ \\t]*$`, "m").exec(text)?.[1] ?? null;
/** `A`, `B`, … for option index `i`. */
export const letterAt = (i) => String.fromCharCode(65 + i);
/** An option entry's leading letter (`A) `) dropped, so a parsed name stays bare. */
const bareName = (s) => s.replace(/^[A-Z]\)[ \t]*/, "");
/** A reply opening on an option letter: `B`, `B)`, `B — …`, `B) {option} …`, `B {option} …`. */
const LETTER_REPLY = /^([A-Za-z])(?:\)|(?=[ \t—:,.-]|$))[ \t]*(?:[—:,.-][ \t]*)?/;
/**
 * An answer read as the option it names. A leading letter of `options` (either case, with or
 * without `)`) becomes the option it labels: `B`, `B) Reject` and `B — too risky` read as
 * `Reject`, `Reject` and `Reject — too risky`. Any other answer is returned unchanged; with
 * no options known, only a leading `A) ` is dropped.
 */
export function optionAnswer(answer, options) {
    if (options.length === 0)
        return bareName(answer);
    const m = LETTER_REPLY.exec(answer);
    const name = m === null ? undefined : options[m[1].toUpperCase().charCodeAt(0) - 65];
    if (m === null || name === undefined)
        return answer;
    const rest = answer.slice(m[0].length);
    if (rest.toLowerCase().startsWith(name.toLowerCase()))
        return name + rest.slice(name.length);
    if (rest === "")
        return name;
    return /[)—:,.-]/.test(m[0]) ? `${name} — ${rest}` : answer;
}
/** A `Fix task:` value as a positive integer, else null. */
const fixTaskOf = (v) => v !== null && /^[1-9][0-9]*$/.test(v) ? Number(v) : null;
/** The `Key: value` lines before the file's first blank line. */
export function decisionHeader(text) {
    const out = {};
    for (const line of text.split("\n")) {
        if (line.trim() === "" || line.startsWith("**Q"))
            break;
        const m = /^([A-Za-z][\w ]*):[ \t]*(.*?)[ \t]*$/.exec(line);
        if (m !== null && !(m[1] in out))
            out[m[1]] = m[2];
    }
    return out;
}
/** The items of a decision file's text, in file order. */
export function parseDecisionItems(text) {
    return text
        .split(ITEM_SPLIT)
        .slice(1)
        .map((part) => {
        const head = /^\*\*Q(\d+) — (.+?):\*\*/.exec(part);
        const rec = lineOf(part, "Recommended");
        const [option, ...why] = (rec ?? "").split(" — ");
        const none = /^No recommendation\b/m.test(part) || /^none$/i.test((option ?? "").trim());
        const perLine = [...part.matchAll(/^[A-Z]\)[ \t]+(.+?)[ \t]*$/gm)].map((m) => (m[1] ?? "").split(" — ")[0].trim());
        const options = perLine.length > 0
            ? perLine.filter(Boolean)
            : (lineOf(part, "Options") ?? "")
                .split(" / ")
                .map((o) => bareName(o.trim()))
                .filter(Boolean);
        const answer = lineOf(part, "Decision");
        const decision = answer === null ? null : optionAnswer(answer, options);
        return {
            n: Number(head?.[1] ?? 0),
            title: head?.[2] ?? "",
            text: part.trimEnd(),
            options,
            recommended: none || rec === null ? null : bareName((option ?? "").trim()),
            reason: why.join(" — ").trim(),
            decision,
            fixTask: fixTaskOf(lineOf(part, "Fix task")),
            assumed: decision !== null && /^Accept \(assumed\)/.test(decision),
            rejected: lineOf(part, "Rejected") !== null,
            deferred: lineOf(part, "Deferred") !== null,
        };
    });
}
/**
 * Whether Q1 is the loop question (the text before the first item holds a `## Progress`
 * block), and the questions besides it that nobody answered, rejected or deferred.
 */
export function undecidedBesidesLoop(text) {
    const hasLoop = /^## Progress$/m.test(text.split(ITEM_SPLIT, 1)[0] ?? "");
    const undecided = parseDecisionItems(text)
        .filter((i) => (hasLoop ? i.n !== 1 : true) && i.decision === null && !i.rejected && !i.deferred)
        .map((i) => `Q${i.n}`);
    return { hasLoop, undecided };
}
/** The checks a red-gate pause re-runs, by the decision file's `From` header. */
export const RERUN_FROM = ["verify", "holistic", "tests"];
/**
 * Whether a resume re-runs the pause's gate instead of asking it again: its `Gate` header is
 * `FAIL`, its `Status` is `OPEN`, the loop question is its only undecided question, and its
 * `From` names a check that re-runs. `rerunFrom` is that check, null when `gateRerun` is false.
 */
export function gateRerun(open, text) {
    const from = RERUN_FROM.find((f) => f === open?.from);
    const { hasLoop, undecided } = undecidedBesidesLoop(text);
    const rerun = open?.gate === "FAIL" &&
        open.status === "OPEN" &&
        from !== undefined &&
        hasLoop &&
        undecided.length === 0;
    return { gateRerun: rerun, rerunFrom: rerun ? from : null };
}
/** An item answer that accepts the item: `Accept` or `Accept (assumed)`, with or without words. */
const ACCEPTED = /^Accept(?: \(assumed\))?(?:$|[ \t]+—)/;
/**
 * The first fact that stops a settled pause from routing `continue`, or null when all five
 * hold: `From` is `verify` or `holistic`; every item is `Accept` or `Accept (assumed)`; the
 * loop question, when asked, is `Decide`; no `Gate: FAIL` header; and a `Source changed`
 * header that reads `false`. Headers count only in the header block, so a line inside an item
 * never stands in for one. A missing fact refuses; it is never guessed.
 */
export function skipProblem(text) {
    const header = decisionHeader(text);
    const from = header.From;
    if (from === undefined)
        return "no From header";
    if (from !== "verify" && from !== "holistic")
        return `From is "${from}", not verify or holistic`;
    const { hasLoop } = undecidedBesidesLoop(text);
    const items = parseDecisionItems(text);
    for (const it of items) {
        if (hasLoop && it.n === 1)
            continue;
        if (it.rejected)
            return `Q${it.n} is rejected, not Accept`;
        if (it.decision === null || !ACCEPTED.test(it.decision))
            return `Q${it.n} is ${it.decision === null ? "undecided" : `"${it.decision}"`}, not Accept`;
    }
    const loop = hasLoop ? items.find((i) => i.n === 1) : undefined;
    if (loop !== undefined && !/^Decide\b/.test(loop.decision ?? ""))
        return `the loop question Q1 is ${loop.decision === null ? "undecided" : `"${loop.decision}"`}, not Decide`;
    if (/^FAIL\b/.test(header.Gate ?? ""))
        return "Gate: FAIL header: the gate is red";
    const changed = header["Source changed"];
    if (changed === undefined)
        return "no Source changed header";
    if (changed !== "false")
        return `Source changed is "${changed}", not false`;
    return null;
}
/**
 * The highest-numbered `{workflow}-decision-{run}-{N}.md` in `logDir` whose header holds
 * `Status: OPEN`, or a `DECIDED` / `ASSUMED` file that none of the run's `{workflow}-decision`
 * rows names (a pause stopped after its answers were written, before the step finished), or
 * null. Only the given run's files count, so an earlier run's pause never resurfaces.
 * `file` is relative to `tree`; `finished` lists the paths the run's decision rows name.
 */
export function openDecision(logDir, tree, workflow, run, finished = []) {
    if (!fs.existsSync(logDir))
        return null;
    const name = new RegExp(`^${workflow}-decision-${run}-([0-9]+)\\.md$`);
    const found = fs
        .readdirSync(logDir)
        .map((f) => ({ f, m: name.exec(f) }))
        .filter((x) => x.m !== null)
        .map(({ f, m }) => ({ f, n: Number(m[1]) }))
        .sort((a, b) => b.n - a.n);
    for (const { f, n } of found) {
        const text = fs.readFileSync(path.join(logDir, f), "utf-8");
        const field = (key) => new RegExp(`^${key}:[ \\t]*(.+?)[ \\t]*$`, "m").exec(text)?.[1] ?? null;
        const status = field("Status");
        const rel = path.relative(tree, path.join(logDir, f));
        const unfinished = (status === "DECIDED" || status === "ASSUMED") && !finished.includes(rel);
        if (status !== "OPEN" && !unfinished)
            continue;
        // `Gate:` counts only in the header block (the lines before the first blank line).
        const header = text.split(/\r?\n[ \t]*\r?\n/, 1)[0] ?? "";
        const gate = /^Gate:[ \t]*(.+?)[ \t]*$/m.exec(header)?.[1] ?? null;
        const num = (key) => {
            const v = field(key);
            return v !== null && /^[0-9]+$/.test(v) ? Number(v) : null;
        };
        return {
            file: rel,
            decision: n,
            question: field("Question"),
            from: field("From"),
            pauseStep: num("Pause step"),
            group: num("Group"),
            verifyAttempt: num("Verify attempt"),
            testAttempt: num("Test attempt"),
            plan: field("Plan"),
            gate,
            sourceChanged: field("Source changed"),
            status: status ?? "OPEN",
        };
    }
    return null;
}
