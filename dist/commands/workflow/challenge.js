// bkit challenge merge — fold the build challenge reports into the plan.
//
// Each reviewer writes its findings as task blocks (`<!-- bkit:task N start -->`) under
// `## Findings Log`, read through `parsePlanBlocks` like the plan's own tasks. The merge
// dedupes them by location, drops the ones an earlier Decision Pause accepted, writes the
// CRITICAL / HIGH / MEDIUM ones into the plan as task blocks in new last groups (at most
// `bkit.workflows.tasks.maxPerGroup` tasks and `maxTestsPerGroup` tests each) and writes each LOW one
// as a deferral row. Task numbers carry on from the highest in the plan, so they stay
// unique. A finding at the location and severity of an earlier task that is still open
// reruns that task (its Round value gains this round) rather than adding a twin; one whose
// earlier task is done from an earlier round is a new task. It then names the route:
// `fix` (run the tasks), `pause` (ask the owner) or `none`. More than `maxChallengeTasks`
// new tasks in one merge writes nothing and pauses. The plan is checked in memory before
// it is written, so a refused merge leaves every file as it was. A re-run with the same
// reports appends nothing.
//
// bkit challenge gate — size the run's diff before the reviewers start. A small change
// (under CHALLENGE_SMALL lines and files, `docs/plans/**` excluded) runs the security
// reviewer alone; a large one runs both. With the default base it fetches origin dev
// first; offline it measures against the local origin/dev. Each pass writes a
// `challenge-gate` status row.
import * as fs from "node:fs";
import * as path from "node:path";
import { appendLine, statusTimestamp } from "../../ledgers/status.js";
import { CommandError, DEV, EXIT, git, runGit } from "../lib.js";
import { DIFF_BASE, EXIT_BASE, diffNumstat } from "./context.js";
import { parseDecisionItems } from "./decisions.js";
import { EXIT_ROW_REFUSED, EXIT_STAGE, appendLedgerRows } from "./ledgers.js";
import { parsePlanBlocks } from "./plan-blocks.js";
import { readBkitConfig } from "../../shared/settings.js";
import { checkPlanText, planCaps, readTestFirst } from "./tests.js";
import { ledgerRows } from "./workflows.js";
/**
 * The most tasks one merge writes: four full groups. More fresh findings than this write
 * nothing and route to the Decision Pause, where the owner picks what to fix.
 */
export const maxChallengeTasks = (caps) => 4 * caps.maxPerGroup;
/** Exit code: a `--report` file does not exist. */
export const EXIT_NO_REPORT = 21;
/** Exit code: a report is not in task-block form. */
export const EXIT_OLD_FORMAT = 22;
/** Exit code: the merged plan fails the plan check; nothing was written. */
export const EXIT_PLAN_CHECK = 23;
/** A diff under both limits is small: the security reviewer (challenge-2) runs alone. */
export const CHALLENGE_SMALL = { lines: 300, files: 10 };
/** Size a diff against `limit`: small when it changes fewer lines and fewer files. */
export function challengeGate(stat, limit = CHALLENGE_SMALL) {
    const small = stat.linesChanged < limit.lines && stat.filesChanged < limit.files;
    return small
        ? { size: "small", skipped: true, agents: ["bkit-build-challenge-2"] }
        : {
            size: "large",
            skipped: false,
            agents: ["bkit-build-challenge-1", "bkit-build-challenge-2"],
        };
}
const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const rank = (s) => SEVERITY_ORDER.indexOf(s);
/** A finding block's line `**Severity:** … · **Class:** … · **Fixable:** … · **Location:** …`. */
const META = /\*\*(Severity|Class|Fixable|Location|Round):\*\*/g;
/** The Severity / Class / Fixable / Location / Round values of a task block's meta line. */
function metaFields(text) {
    const values = new Map();
    for (const line of text.split("\n")) {
        const hits = [...line.matchAll(META)];
        hits.forEach((h, i) => {
            const value = line.slice(h.index + h[0].length, hits[i + 1]?.index);
            values.set(h[1], value.trim().replace(/[\s·]+$/, ""));
        });
    }
    return values;
}
/** A task block's TEST FIRST entries, each the sub-bullet's text as written. */
function testEntries(block) {
    const lines = block.text.split("\n");
    const at = (line) => lines[line - block.line].trim()
        .replace(/^- /, "")
        .replace(/^\*\*TEST FIRST:\*\*\s*/, "");
    const tf = block.testFirst;
    if (tf === undefined)
        return [];
    return [...tf.tests.map((t) => t.line), ...tf.malformed].sort((a, b) => a - b).map(at);
}
/** `path:line` from a location value, the path repo-relative and normalised; null when none. */
export function normalizeLocation(raw, cwd) {
    const m = /`?([^`\s]+?):(\d+)/.exec(raw);
    if (!m)
        return null;
    let p = m[1].replace(/\\/g, "/");
    if (path.isAbsolute(p))
        p = path.relative(cwd, p).split(path.sep).join("/");
    p = path.posix.normalize(p).replace(/^\.\//, "");
    return `${p}:${Number(m[2])}`;
}
/** The header line `{name}: value` above `<!-- verdict:end -->`, or undefined. */
const headerValue = (text, name) => new RegExp(`^${name}:\\s*(\\S+)`, "m").exec(text.split("<!-- verdict:end -->")[0])?.[1];
/** The `## Findings Log` section of a report and its first line's number (1-based); "" when none. */
function findingsLog(text) {
    const lines = text.split("\n");
    const start = lines.findIndex((l) => /^## Findings Log\b/.test(l));
    if (start < 0)
        return { body: "", line: 0 };
    const end = lines.findIndex((l, i) => i > start && /^## /.test(l));
    return { body: lines.slice(start + 1, end < 0 ? undefined : end).join("\n"), line: start + 2 };
}
/** The group wrapper a Findings Log gets when the reviewer wrote task blocks only. */
const WRAP = ["<!-- bkit:group 1 start -->", "### GROUP 1: Findings"];
/**
 * One report's findings: each task block under `## Findings Log` (read through
 * `parsePlanBlocks`; a log with no group marker is read as one group) with its
 * `Severity`, `Fixable` and `Location` line and its DONE WHEN field. Refused (exit 22):
 * a header naming findings with no task block, a block format error (old `**Task N:**`
 * task lines included), or a block missing one of those fields.
 */
export function parseFindings(text, source, cwd) {
    const log = findingsLog(text);
    const wrapped = !/<!--\s*bkit:group\s/.test(log.body);
    const body = wrapped ? [...WRAP, log.body, "<!-- bkit:group 1 end -->"].join("\n") : log.body;
    const blocks = parsePlanBlocks(body);
    const fileLine = (line) => log.line + line - 1 - (wrapped ? WRAP.length : 0);
    const notBlocks = (why) => new CommandError(EXIT_OLD_FORMAT, `${source}: ${why} — the report is not in task-block form; re-run the challenge`);
    const error = blocks.errors[0];
    if (error !== undefined)
        throw notBlocks(`line ${fileLine(error.line)}: ${error.message}`);
    const verdict = headerValue(text, "Verdict");
    const failures = Number(headerValue(text, "Failures") ?? 0);
    if (blocks.tasks.length === 0 && (verdict !== "PASS" || failures > 0))
        throw notBlocks(`verdict ${verdict ?? "missing"} but no task block under ## Findings Log`);
    return blocks.tasks.map((block) => {
        const values = metaFields(block.text);
        const refuse = (why) => new CommandError(EXIT_OLD_FORMAT, `${source}: finding TASK ${block.task} ${why}`);
        const severity = values.get("Severity")?.split(/\s/)[0];
        if (!SEVERITY_ORDER.includes(severity))
            throw refuse("has no **Severity:** CRITICAL|HIGH|MEDIUM|LOW");
        const fixable = values.get("Fixable")?.split(/\s/)[0];
        if (fixable !== "true" && fixable !== "false")
            throw refuse("has no **Fixable:** true|false");
        const location = normalizeLocation(values.get("Location") ?? "", cwd);
        if (location === null)
            throw refuse("has no **Location:** path:line");
        const doneWhen = block.doneWhen ?? "";
        if (doneWhen === "")
            throw refuse("has no **DONE WHEN:**");
        const cls = values.get("Class")?.split(/\s/)[0];
        return {
            severity: severity,
            ...(cls ? { cls } : {}),
            fixable: fixable === "true",
            location,
            title: block.title || `Challenge finding at ${location}`,
            doneWhen,
            tests: testEntries(block),
        };
    });
}
/**
 * The reports' findings as one list, deduped by location: the worse severity's
 * finding wins, and it is not fixable when either says so. Findings at an accepted
 * location are dropped and counted.
 */
export function mergeFindings(reports, accepted) {
    const byLocation = new Map();
    for (const f of reports.flat()) {
        const prior = byLocation.get(f.location);
        if (prior === undefined) {
            byLocation.set(f.location, f);
            continue;
        }
        const worse = rank(f.severity) < rank(prior.severity) ? f : prior;
        byLocation.set(f.location, { ...worse, fixable: prior.fixable && f.fixable });
    }
    const all = [...byLocation.values()];
    const findings = all.filter((f) => !accepted.has(f.location));
    return { findings, dropped: all.length - findings.length };
}
/**
 * Locations named in a `Decision: Accept` item of any `build-decision-*.md` in `logDir`, the
 * decision read by `parseDecisionItems` (so `Decision: A) Accept …` counts). An
 * `Accept (assumed)` counts too, so the next round does not raise it again; the build summary
 * and ship report it as assumed.
 */
export function acceptedLocations(logDir, cwd) {
    const out = new Set();
    const files = fs.existsSync(logDir)
        ? fs.readdirSync(logDir).filter((f) => /^build-decision-.*\.md$/.test(f))
        : [];
    for (const file of files) {
        const items = parseDecisionItems(fs.readFileSync(path.join(logDir, file), "utf-8"));
        for (const item of items) {
            if (!/^Accept\b/.test(item.decision ?? ""))
                continue;
            // `path:line`, the path with or without an extension (`src/a.ts:10`, `Makefile:12`).
            for (const m of item.text.matchAll(/(?<![\w@./-])[\w@./-]*[A-Za-z_][\w@./-]*:\d+/g)) {
                const loc = normalizeLocation(m[0], cwd);
                if (loc !== null)
                    out.add(loc);
            }
        }
    }
    return out;
}
/** One finding's task block. */
const taskBlock = (n, f, round) => [
    `<!-- bkit:task ${n} start -->`,
    `- [ ] **TASK ${n}:** ${f.title}`,
    `  **Severity:** ${f.severity} · ${f.cls ? `**Class:** ${f.cls} · ` : ""}**Fixable:** ${f.fixable} · **Location:** \`${f.location}\` · **Round:** ${round}`,
    `  - **DONE WHEN:** ${f.doneWhen}`,
    "  - **TEST FIRST:**",
    ...f.tests.map((e) => `    - ${e}`),
    `<!-- bkit:task ${n} end -->`,
];
/**
 * The findings as groups of task blocks, numbered from `firstTask` and `firstGroup`: a
 * group closes at `caps.maxPerGroup` tasks, or before a task that would take it past
 * `caps.maxTestsPerGroup` tests.
 */
function findingGroups(findings, firstTask, firstGroup, round, caps) {
    const chunks = [];
    let tests = 0;
    for (const f of findings) {
        const n = f.tests.length;
        const open = chunks.at(-1);
        if (open === undefined ||
            open.length >= caps.maxPerGroup ||
            tests + n > caps.maxTestsPerGroup) {
            chunks.push([f]);
            tests = n;
        }
        else {
            open.push(f);
            tests += n;
        }
    }
    const tasks = findings.map((_, i) => firstTask + i);
    let next = firstTask;
    const lines = chunks.flatMap((chunk, g) => [
        ...(g === 0 ? [] : [""]),
        `<!-- bkit:group ${firstGroup + g} start -->`,
        `### GROUP ${firstGroup + g}: Challenge round ${round} findings`,
        ...chunk.flatMap((f) => taskBlock(next++, f, round)),
        `<!-- bkit:group ${firstGroup + g} end -->`,
    ]);
    return { lines, tasks };
}
/**
 * `plan` with the findings written as new groups after its last group (at the end when
 * it has none), tasks numbered from `firstTask`, grouped within `caps`.
 */
export function appendTasks(plan, findings, round, firstTask, caps) {
    const blocks = parsePlanBlocks(plan);
    const firstGroup = Math.max(0, ...blocks.groups.map((g) => g.group)) + 1;
    const { lines: block, tasks } = findingGroups(findings, firstTask, firstGroup, round, caps);
    const last = blocks.groups.at(-1);
    if (last === undefined) {
        const body = plan.replace(/\n*$/, "");
        const from = body.split("\n").length + 2;
        return {
            text: `${body}\n\n${block.join("\n")}\n`,
            tasks,
            written: { from, to: from + block.length - 1 },
        };
    }
    const lines = plan.split("\n");
    lines.splice(last.end, 0, "", ...block);
    const from = last.end + 2;
    return { text: lines.join("\n"), tasks, written: { from, to: from + block.length - 1 } };
}
/**
 * Why the merged `text` may not be written: a plan-check problem on the lines the merge
 * wrote (a malformed block, a group or task over its cap), or a written task whose
 * TEST FIRST names no test.
 */
function planProblems(text, written, added, caps) {
    const problems = checkPlanText(text, caps)
        .problems.filter((p) => p.line >= written.from && p.line <= written.to)
        .map((p) => `line ${p.line}: ${p.message}`);
    const kinds = readTestFirst(text);
    for (const n of added) {
        const kind = kinds.find((s) => s.task === n)?.kind ?? "missing";
        if (kind !== "test")
            problems.push(`TASK ${n}: its TEST FIRST is ${kind}; every finding names a test`);
    }
    return problems;
}
/** LOW findings as `docs/deferrals.jsonl` rows, keyed by FID and location. */
export function lowDeferrals(fid, findings) {
    return findings
        .filter((f) => f.severity === "LOW")
        .map((f) => ({
        kind: "deferral",
        key: `${fid}-challenge-low-${f.location.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "")}`.toLowerCase(),
        type: "issue",
        category: "correctness",
        severity: "LOW",
        reason: "low-severity",
        summary: f.title,
        description: `LOW build challenge finding at ${f.location}: ${f.title}. Done when: ${f.doneWhen}`,
        source: f.location,
        references: [fid],
        by: { workflow: "build", step: "build-challenge" },
    }));
}
/** The key a finding and an earlier merged task share: location and severity. */
const findingKey = (location, severity) => `${location}|${severity}`;
/** Tasks the merge appended earlier, by `findingKey`, in plan order. */
function mergedTasks(plan, cwd) {
    const out = new Map();
    for (const t of parsePlanBlocks(plan).tasks) {
        const values = metaFields(t.text);
        const loc = normalizeLocation(values.get("Location") ?? "", cwd);
        const sev = values.get("Severity")?.split(/\s/)[0];
        const rounds = (values.get("Round") ?? "")
            .split(/[\s,]+/)
            .filter((r) => /^\d+$/.test(r))
            .map(Number);
        if (loc === null || sev === undefined || rounds.length === 0)
            continue;
        const key = findingKey(loc, sev);
        out.set(key, [
            ...(out.get(key) ?? []),
            { task: t.task, done: t.done, rounds, line: t.line, end: t.end },
        ]);
    }
    return out;
}
/** `plan` with `round` added to the `**Round:**` value of each task in `tasks`. */
function stampRound(plan, tasks, round) {
    const lines = plan.split("\n");
    for (const t of tasks)
        for (let i = t.line - 1; i < t.end; i++)
            lines[i] = lines[i].replace(/(\*\*Round:\*\*\s*)([\d,\s]*\d)/, (_, label) => `${label}${[...t.rounds, round].join(", ")}`);
    return lines.join("\n");
}
/** Write `text` to `file` through a temp file renamed over it. */
function writeAtomic(file, text) {
    const tmp = path.join(path.dirname(file), `.${path.basename(file)}.${process.pid}.tmp`);
    fs.writeFileSync(tmp, text);
    fs.renameSync(tmp, file);
}
export const challengeCommand = {
    noun: "challenge",
    summary: "Size the build challenge (gate) and fold its reports into the plan (merge): findings become plan tasks or LOW deferrals.",
    verbs: {
        gate: {
            summary: "Size the run's diff ({base}...HEAD, docs/plans/** excluded) and name the reviewers: small runs challenge-2 alone, large runs both. Writes a challenge-gate status row.",
            flags: [
                {
                    name: "file",
                    type: "string",
                    required: true,
                    help: "the run's status.jsonl; the challenge-gate row is appended to it",
                },
                {
                    name: "base",
                    type: "string",
                    help: `merge base (default ${DIFF_BASE}, fetched first; a failed fetch is logged, not fatal)`,
                },
            ],
            output: {
                size: `small (under ${CHALLENGE_SMALL.lines} lines and ${CHALLENGE_SMALL.files} files) or large`,
                skipped: "true when challenge-1 is left out",
                agents: "comma-separated reviewers to run",
                linesChanged: "lines added + deleted",
                filesChanged: "files in the diff",
                range: "the range measured ({base}...HEAD)",
            },
            exitCodes: { [EXIT_BASE]: "--base does not name a commit" },
            run: (ctx) => {
                const base = typeof ctx.flags.base === "string" ? ctx.flags.base : DIFF_BASE;
                if (base === DIFF_BASE) {
                    const res = runGit(ctx.cwd, ["fetch", "origin", DEV]);
                    if (!res.ok)
                        ctx.log(`git fetch origin dev failed — measuring against the last fetch: ${res.stderr}`);
                }
                if (git(ctx.cwd, ["rev-parse", "-q", "--verify", `${base}^{commit}`]) === null)
                    throw new CommandError(EXIT_BASE, `--base ${base} does not name a commit (fetch origin)`);
                const range = `${base}...HEAD`;
                const { stat } = diffNumstat(ctx.cwd, range);
                const gate = challengeGate(stat);
                const file = path.resolve(ctx.cwd, String(ctx.flags.file));
                fs.appendFileSync(file, appendLine({
                    type: "challenge-gate",
                    workflow: "build",
                    at: statusTimestamp(),
                    range,
                    linesChanged: stat.linesChanged,
                    filesChanged: stat.filesChanged,
                    size: gate.size,
                    limit: { ...CHALLENGE_SMALL },
                    agents: gate.agents,
                    skipped: gate.skipped,
                }));
                ctx.emit({
                    size: gate.size,
                    skipped: gate.skipped,
                    agents: gate.agents.join(","),
                    linesChanged: stat.linesChanged,
                    filesChanged: stat.filesChanged,
                    range,
                });
                ctx.log(`challenge gate: ${gate.size} — ${stat.linesChanged} lines, ${stat.filesChanged} files; run ${gate.agents.join(", ")}`);
                return EXIT.OK;
            },
        },
        merge: {
            summary: "Merge the challenge reports' findings into the plan as tasks (LOW → deferral rows); prints the route: fix | pause | none.",
            flags: [
                {
                    name: "report",
                    type: "string",
                    required: true,
                    repeatable: true,
                    help: "a challenge report (`build-challenge-{1,2}.md`); findings are task blocks under `## Findings Log`",
                },
                {
                    name: "plan",
                    type: "string",
                    required: true,
                    help: "the plan file (`{FID}-plan.md`) the tasks are appended to",
                },
                {
                    name: "log",
                    type: "string",
                    required: true,
                    help: "the run's log folder `docs/plans/{YYYYMM}/logs/{FID}`; its `build-decision-*.md` accepts drop findings",
                },
                {
                    name: "round",
                    type: "string",
                    required: true,
                    help: "challenge round, 1 up to bkit.workflows.build.challenge.maxAttempts; any task from the last round routes to pause",
                },
            ],
            output: {
                route: "fix (tasks to run), pause (a task is not fixable, the last round left tasks, or more than 4 x `bkit.workflows.tasks.maxPerGroup` new tasks) or none (nothing to run)",
                fixTasks: "comma-separated task numbers in `plan` this round runs: every task reopened, then every task appended; empty when none",
                appended: "how many tasks this run wrote",
                reopened: "comma-separated numbers of open earlier tasks a finding reported again (same location and severity); this round is added to their **Round:** value; empty when none",
                deferred: "`docs/deferrals.jsonl` rows this run wrote (one per LOW finding not already deferred)",
                dropped: "findings at a location a Decision Pause accepted",
                plan: "the plan file the tasks are in (repo-relative as given)",
                round: "the round, as given",
                overflow: `set only when the findings would add more than 4 x \`bkit.workflows.tasks.maxPerGroup\` tasks: how many new CRITICAL / HIGH / MEDIUM findings the Decision Pause must choose from; nothing was written`,
                problems: "on exit 23: why the merged plan failed the plan check",
            },
            exitCodes: {
                [EXIT_STAGE]: "docs/deferrals.jsonl could not be written",
                [EXIT_ROW_REFUSED]: "a LOW deferral row was refused by the ledger check",
                [EXIT_NO_REPORT]: "a --report file does not exist",
                [EXIT_OLD_FORMAT]: "a report is not in task-block form: findings but no task block, a block format error, or a block missing Severity, Fixable, Location or DONE WHEN",
                [EXIT_PLAN_CHECK]: "the merged plan fails the plan check; no file was changed",
            },
            run: (ctx) => {
                const round = String(ctx.flags.round);
                const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
                const maxRounds = readBkitConfig(top).asks["build.challenge"].max;
                if (!/^[1-9][0-9]*$/.test(round) || Number(round) > maxRounds)
                    throw new CommandError(EXIT.USAGE, `--round must be 1 to ${maxRounds} (bkit.workflows.build.challenge.maxAttempts), got "${round}"`);
                const roundN = Number(round);
                const abs = (p) => path.resolve(ctx.cwd, p);
                const rel = (p) => path.relative(ctx.cwd, p).split(path.sep).join("/");
                const planArg = String(ctx.flags.plan);
                const logDir = abs(String(ctx.flags.log));
                const fid = path.basename(logDir);
                const reports = ctx.flags.report.map((r) => {
                    if (!fs.existsSync(abs(r)))
                        throw new CommandError(EXIT_NO_REPORT, `--report ${r} does not exist`);
                    return parseFindings(fs.readFileSync(abs(r), "utf-8"), r, ctx.cwd);
                });
                const { findings, dropped } = mergeFindings(reports, acceptedLocations(logDir, ctx.cwd));
                const tasks = findings
                    .filter((f) => f.severity !== "LOW")
                    .sort((a, b) => rank(a.severity) - rank(b.severity));
                const low = findings.filter((f) => f.severity === "LOW");
                const planAbs = abs(planArg);
                if (!fs.existsSync(planAbs))
                    throw new CommandError(EXIT.USAGE, `--plan ${planArg} does not exist`);
                const before = fs.readFileSync(planAbs, "utf-8");
                // Each finding against the earlier tasks at its location and severity: an open one
                // runs again; a done one from this round is this round's re-run and is left alone;
                // otherwise (none, or every match done in an earlier round: the fix did not hold)
                // the finding is a new task.
                const merged = mergedTasks(before, ctx.cwd);
                const fresh = [];
                const open = [];
                for (const f of tasks) {
                    const earlier = merged.get(findingKey(f.location, f.severity)) ?? [];
                    const at = earlier.find((t) => !t.done);
                    if (at !== undefined)
                        open.push({ f, at });
                    else if (!earlier.some((t) => t.rounds.includes(roundN)))
                        fresh.push(f);
                }
                // More findings than one merge may add: write nothing, the owner picks at the pause.
                const caps = planCaps(ctx.cwd);
                const most = maxChallengeTasks(caps);
                if (fresh.length > most) {
                    ctx.emit({
                        route: "pause",
                        fixTasks: "",
                        appended: 0,
                        reopened: "",
                        deferred: 0,
                        dropped,
                        overflow: fresh.length,
                        plan: rel(planAbs),
                        round: roundN,
                    });
                    ctx.log(`challenge merge: pause — ${fresh.length} task(s) exceed what one merge adds (${most}); nothing written`);
                    return EXIT.OK;
                }
                // Reopened tasks carry this round in their Round value; the plan's lines keep their count.
                const reopened = [...new Map(open.map((x) => [x.at.task, x.at])).values()];
                const stamped = stampRound(before, reopened.filter((t) => !t.rounds.includes(roundN)), roundN);
                let fixTasks = reopened.map((t) => t.task);
                let after = stamped;
                if (fresh.length > 0) {
                    const firstTask = Math.max(0, ...parsePlanBlocks(before).tasks.map((t) => t.task)) + 1;
                    const { text, tasks: added, written, } = appendTasks(stamped, fresh, roundN, firstTask, caps);
                    const problems = planProblems(text, written, added, caps);
                    if (problems.length > 0) {
                        ctx.emit({ plan: rel(planAbs), problems });
                        ctx.log(`challenge merge: plan check failed — ${problems.join("; ")}`);
                        return EXIT_PLAN_CHECK;
                    }
                    after = text;
                    fixTasks = [...fixTasks, ...added];
                }
                // Deferrals before the plan: a refused or failed append changes nothing, and a re-run
                // after a failed plan write skips the rows already appended (same key).
                const known = new Set(ledgerRows(path.join(top, "docs", "deferrals.jsonl")).map((r) => String(r.key)));
                const rows = lowDeferrals(fid, low).filter((r) => !known.has(String(r.key)));
                if (rows.length > 0)
                    appendLedgerRows(top, "deferrals", rows);
                if (after !== before)
                    writeAtomic(planAbs, after);
                const running = [...fresh, ...open.map((x) => x.f)];
                const route = fixTasks.length === 0
                    ? "none"
                    : roundN >= maxRounds || running.some((f) => !f.fixable)
                        ? "pause"
                        : "fix";
                ctx.emit({
                    route,
                    fixTasks: fixTasks.join(","),
                    appended: fresh.length,
                    reopened: reopened.map((t) => t.task).join(","),
                    deferred: rows.length,
                    dropped,
                    plan: rel(planAbs),
                    round: roundN,
                });
                ctx.log(`challenge merge: ${route} — ${fresh.length} task(s) appended to ${rel(planAbs)}, ${reopened.length} open task(s) reported again, ${rows.length} LOW deferral row(s) written, ${dropped} accepted`);
                return EXIT.OK;
            },
        },
    },
};
