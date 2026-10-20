// bkit steps done|finish|verdict|gate|stub — write a step's status row, read a
// subagent's verdict header, check the step left everything the gate requires,
// and seed a versioned artifact's header.
//
// `done` captures `parentSha` before committing, writes the row, then commits,
// in that fixed order: the fold's de-dup key includes `parentSha`, so attempt
// counts stay right only if it moves forward after every step. The gate checks
// what `done` wrote, so a step cannot hand-type its own row and then tick a box
// saying it did. `finish` is the whole step ending in one call: read the verdict
// headers, derive the attempt, check what the gate checks, write the row, commit,
// and print the step's tracker comment.
import * as fs from "node:fs";
import * as path from "node:path";
import { activeDoneSteps, appendLine, runOrStepField, statusTimestamp, } from "../../ledgers/status.js";
import { clampLogPath, readRecords } from "../../ledgers/clamp-log.js";
import { resolveRepoSlug } from "../../ledgers/telemetry.js";
import { getPromptsRoot } from "../../shared/package-roots.js";
import { CommandError, EXIT, repoRoot, runGit, } from "../lib.js";
import { FID_PATTERNS, readIssueTracker } from "./fids.js";
import { buildComment } from "./issues.js";
import { lockRoot, readHolder, resolveMonth, workflowLockPath } from "./locks.js";
import { EXIT_NO_STATUS, FILE_FLAG, STEP_FLAG, SUB_PLAN_FLAG, WORKFLOW_FLAG, extraField, nonNegativeInt, positiveInt, readRuns, readRunsAt, statusFile, str, } from "./status.js";
const VERDICT_END = "<!-- verdict:end -->";
const DEFAULT_VERDICTS = ["PASS", "CONCERNS", "FAIL"];
const STRATEGIES = ["STANDARD", "PIVOT", "FINAL"];
/** Exit codes shared by verdict, done and finish. */
export const EXIT_EMPTY = 4;
export const EXIT_PENDING = 5;
export const EXIT_INVALID = 6;
export const EXIT_ARTIFACT = 7;
export const EXIT_COMMIT = 8;
/** finish --docs-only: the step staged a file outside the artifact tree. */
export const EXIT_OUTSIDE_DOCS = 9;
/** Where `finish` puts the derived attempt in `--artifact` / `--message` / `--clamp-log`. */
export const ATTEMPT_TOKEN = "<attempt>";
/** Where `finish` puts the first `DONE` line's description in `--message`. */
export const DONE_TOKEN = "<done>";
/**
 * The header a prompt's output template declares: its `Verdict: A | B | C` line
 * and every `Key: …` line under it down to `<!-- verdict:end -->`.
 */
export function promptHeader(agent) {
    const file = path.join(getPromptsRoot(), `${agent}.md`);
    if (!fs.existsSync(file))
        throw new CommandError(EXIT.USAGE, `no prompt ${agent} at ${file}`);
    const lines = fs.readFileSync(file, "utf-8").split("\n");
    const start = lines.findIndex((l) => l.startsWith("Verdict: "));
    if (start === -1)
        throw new CommandError(EXIT.USAGE, `${agent} declares no Verdict: line`);
    const values = (raw) => raw
        .replace(/\[.*\]/, "")
        .split("|")
        .map((v) => v.trim())
        .filter(Boolean);
    const verdicts = values(lines[start].slice("Verdict: ".length));
    const fields = [];
    for (const line of lines.slice(start + 1)) {
        if (line.trim() === VERDICT_END || line.startsWith("```"))
            break;
        const m = /^([A-Z][A-Za-z ]*):\s*(.*)$/.exec(line);
        if (!m)
            continue;
        const raw = m[2].replace(/\[.*\]/, "").trim();
        if (/^<integer/.test(raw))
            fields.push({ name: m[1], integer: true });
        else if (raw.includes("|"))
            fields.push({ name: m[1], values: values(raw) });
        else
            fields.push({ name: m[1] });
    }
    return { verdicts, fields };
}
/** Allowed verdicts from a prompt's own `Verdict: A | B | C [note]` output line. */
export const promptVerdicts = (agent) => promptHeader(agent).verdicts;
const PLACEHOLDER = /^(?:\[?PENDING\]?|.*:\s*\[?PENDING\]?\.?)$/;
/**
 * Read an artifact's header — every line above `<!-- verdict:end -->` — as
 * `Key: value` fields. `require` names fields that must be present; `declared`
 * fields must be present and hold one of their allowed values.
 */
export function readHeader(file, allowed, require = [], declared = []) {
    if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
        return { ok: false, code: EXIT_EMPTY, problem: `${file} is missing or empty` };
    }
    const lines = fs.readFileSync(file, "utf-8").split("\n");
    const end = lines.indexOf(VERDICT_END);
    if (end === -1)
        return { ok: false, code: EXIT_INVALID, problem: `${file} has no ${VERDICT_END} line` };
    const fields = {};
    for (const line of lines.slice(0, end)) {
        const m = /^([A-Z][A-Za-z ]*):\s*(.*)$/.exec(line.trim());
        if (m && !(m[1] in fields))
            fields[m[1]] = m[2].trim();
    }
    const pending = Object.entries(fields).filter(([, v]) => /\bPENDING\b/.test(v));
    if (pending.length > 0) {
        return {
            ok: false,
            code: EXIT_PENDING,
            problem: `${file}: ${pending.map(([k]) => k).join(", ")} still PENDING`,
        };
    }
    const verdict = fields.Verdict;
    if (verdict === undefined || !allowed.includes(verdict)) {
        return {
            ok: false,
            code: EXIT_INVALID,
            problem: `${file}: Verdict "${verdict ?? ""}" is not ${allowed.join("|")}`,
        };
    }
    const missing = [...require, ...declared.map((d) => d.name)].filter((f) => fields[f] === undefined || fields[f] === "");
    if (missing.length > 0)
        return { ok: false, code: EXIT_INVALID, problem: `${file}: missing ${missing.join(", ")}` };
    if (fields.Failures !== undefined && !/^[0-9]+$/.test(fields.Failures)) {
        return {
            ok: false,
            code: EXIT_INVALID,
            problem: `${file}: Failures "${fields.Failures}" is not a non-negative integer`,
        };
    }
    for (const d of declared) {
        const v = fields[d.name];
        if (d.values && !d.values.includes(v)) {
            return {
                ok: false,
                code: EXIT_INVALID,
                problem: `${file}: ${d.name} "${v}" is not ${d.values.join("|")}`,
            };
        }
        if (d.integer && !/^[0-9]+$/.test(v)) {
            return {
                ok: false,
                code: EXIT_INVALID,
                problem: `${file}: ${d.name} "${v}" is not a non-negative integer`,
            };
        }
    }
    return { ok: true, verdict, fields };
}
/** Lines left as a stub placeholder: a bare `PENDING`, or a field whose whole value is `PENDING`. */
export function placeholderLines(file) {
    return fs
        .readFileSync(file, "utf-8")
        .split("\n")
        .flatMap((l, i) => (PLACEHOLDER.test(l.trim()) ? [i + 1] : []));
}
const ALLOWED_FLAGS = [
    {
        name: "agent",
        type: "string",
        help: "subagent name; its prompt's Verdict: line gives the allowed values",
    },
    {
        name: "allowed",
        type: "string",
        help: "allowed verdicts, comma-separated (default PASS,CONCERNS,FAIL)",
    },
];
function allowedVerdicts(flags) {
    if (flags.agent !== undefined && flags.allowed !== undefined) {
        throw new CommandError(EXIT.USAGE, "give --agent or --allowed, not both");
    }
    if (flags.agent !== undefined)
        return promptVerdicts(String(flags.agent));
    if (flags.allowed !== undefined)
        return String(flags.allowed)
            .split(",")
            .map((v) => v.trim());
    return DEFAULT_VERDICTS;
}
/** The worst verdict, by position in the allowed list (later = worse: PASS < CONCERNS < FAIL). */
export function worstVerdict(verdicts, allowed) {
    return verdicts.reduce((worst, v) => (allowed.indexOf(v) > allowed.indexOf(worst) ? v : worst));
}
// ---------------------------------------------------------------------------
// Artifacts and row rules
// ---------------------------------------------------------------------------
/** An `https://` artifact (a PR URL) is recorded as given; it is not a file. */
const isUrl = (artifact) => /^https:\/\//.test(artifact);
/** Problems with an artifact path: missing, empty, or outside the working directory. */
function artifactProblem(cwd, rel) {
    if (isUrl(rel))
        return undefined;
    const abs = path.resolve(cwd, rel);
    const inside = path.relative(cwd, abs);
    if (inside.startsWith("..") || path.isAbsolute(inside))
        return `${rel} is outside ${cwd}`;
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile())
        return `${rel} does not exist`;
    if (fs.statSync(abs).size === 0)
        return `${rel} is empty`;
    return undefined;
}
/** `failures` agrees with `verdict`: PASS => 0, FAIL => > 0, CONCERNS => >= 0. */
export function failuresProblem(verdict, failures) {
    if (failures === undefined || verdict === undefined)
        return undefined;
    if (verdict === "PASS" && failures !== 0)
        return `PASS needs failures=0, got ${failures}`;
    if (verdict === "FAIL" && failures <= 0)
        return `FAIL needs failures>0, got ${failures}`;
    return undefined;
}
/**
 * The steps whose row carries `attempt`, `strategy` or `scope`, keyed
 * `workflow/step`. `steps gate` and `steps finish` fail a row missing one;
 * `steps.test.ts` holds this table to the workflows' `steps done` / `steps finish`
 * calls (a finish call's `--agent` writes `strategy` when its prompt declares one).
 */
export const ROW_FIELDS = {
    "design/design-grill": ["attempt"],
    "design/design-brainstorm-ideate": ["attempt"],
    "design/design-generate": ["attempt"],
    "design/design-review": ["attempt"],
    "design/design-spike": ["attempt"],
    "design/design-apply-review": ["attempt"],
    "design/design-organise": ["attempt"],
    "design/design-summary": ["attempt"],
    "plan/plan-generate": ["attempt"],
    "plan/plan-fetch-context": ["attempt"],
    "plan/plan-review": ["attempt"],
    "plan/plan-apply-review": ["attempt"],
    "plan/plan-scope-check": ["attempt"],
    "plan/plan-apply-scope": ["attempt"],
    "plan/plan-complexity-check": ["attempt"],
    "plan/plan-complexity-split": ["attempt"],
    "plan/plan-summary": ["attempt"],
    "build/build-plan-current": ["attempt"],
    "build/build-install-skills": ["attempt"],
    "build/build-plan-execute": ["attempt"],
    "build/build-plan-verify": ["attempt"],
    "build/build-subplan-gate": ["attempt", "scope"],
    "build/build-plan-gaps-remediate": ["attempt", "strategy"],
    "build/build-plan-verify-holistic": ["attempt"],
    "build/build-challenge": ["attempt"],
    "build/build-challenge-reconcile": ["attempt"],
    "build/build-challenge-remediate": ["attempt"],
    "build/build-challenge-tests": ["attempt"],
    "build/build-run-tests": ["attempt", "scope"],
    "build/build-failure-diagnose": ["attempt", "strategy"],
    "build/build-failure-remediate": ["attempt", "strategy"],
    "build/build-summary": ["attempt"],
    "debug/debug-run-tests": ["attempt", "scope"],
    "debug/context-fetch": ["attempt"],
    "debug/debug-failure-reproduce": ["attempt"],
    "debug/debug-failure-diagnose": ["attempt", "strategy"],
    "debug/debug-failure-remediate": ["attempt", "strategy"],
    "debug/debug-failure-soak": ["attempt"],
    "debug/debug-push-remediation": ["attempt"],
    "debug/debug-summary": ["attempt"],
    "ship/ship-summary": ["attempt"],
    "ship/ship-merge-pr": ["attempt"],
    "ship/ship-failure-diagnose": ["attempt"],
    "ship/ship-failure-remediate": ["attempt", "strategy"],
};
/** The required fields missing (absent or empty) from a row. */
export function missingRowFields(workflow, step, row) {
    return (ROW_FIELDS[`${workflow}/${step}`] ?? []).filter((k) => row[k] === undefined || row[k] === null || row[k] === "");
}
const CORE_ROW_KEYS = new Set([
    "type",
    "workflow",
    "step",
    "status",
    "at",
    "parentSha",
    "artifacts",
    "verdict",
    "attempt",
    "subPlan",
    "failures",
    "strategy",
]);
/**
 * Append one `step-done` row, then commit (parentSha first, the row, then the
 * commit — the order the fold's de-dup relies on). Returns the row and the new
 * commit; `code` is EXIT_COMMIT when the row landed but the commit failed.
 */
export function writeStepRow(cwd, r, log) {
    const clash = Object.keys(r.extras ?? {}).filter((k) => CORE_ROW_KEYS.has(k));
    if (clash.length > 0)
        throw new CommandError(EXIT.USAGE, `--field cannot set ${clash.join(", ")}; use its own flag`);
    const parentSha = r.parentSha ?? runGit(cwd, ["rev-parse", "HEAD"]).stdout;
    if (!/^[0-9a-f]{40}$/.test(parentSha))
        throw new CommandError(EXIT.USAGE, `parentSha "${parentSha}" is not a commit sha`);
    if (r.commit === "auto" && !r.message)
        throw new CommandError(EXIT.USAGE, "--message is required unless --commit=none");
    const row = {
        type: "step-done",
        workflow: r.workflow,
        step: r.step,
        status: (r.status ?? "DONE"),
        at: statusTimestamp(),
        parentSha,
        artifacts: r.artifacts,
        ...(r.verdict === undefined ? {} : { verdict: r.verdict }),
        ...(r.attempt === undefined ? {} : { attempt: r.attempt }),
        ...(r.subPlan === undefined ? {} : { subPlan: r.subPlan }),
        ...(r.failures === undefined ? {} : { failures: r.failures }),
        ...(r.strategy === undefined ? {} : { strategy: r.strategy }),
        ...(r.extras ?? {}),
    };
    fs.mkdirSync(path.dirname(r.file), { recursive: true });
    fs.appendFileSync(r.file, appendLine(row));
    if (r.commit === "none")
        return { row, commit: null, code: EXIT.OK };
    const add = runGit(cwd, ["add", "-A"]);
    const made = add.ok ? runGit(cwd, ["commit", "--allow-empty", "-m", r.message]) : add;
    if (!made.ok) {
        log(`row written to ${r.file} but the commit failed: ${made.stderr || made.stdout}`);
        return { row, commit: null, code: EXIT_COMMIT };
    }
    return { row, commit: runGit(cwd, ["rev-parse", "HEAD"]).stdout, code: EXIT.OK };
}
/** Every mechanical gate check for one step; `ok` false names the first problem per check. */
function gateChecks(cwd, o) {
    const checks = [];
    const add = (check, problem, okDetail) => checks.push({ check, ok: problem === undefined, detail: problem ?? okDetail });
    for (const p of o.placeholders) {
        const eq = p.indexOf("=");
        if (eq <= 0)
            throw new CommandError(EXIT.USAGE, `--placeholder "${p}" must be NAME=value`);
        add(`placeholder ${p.slice(0, eq)}`, p.slice(eq + 1).trim() === "" ? "empty" : undefined, "non-empty");
    }
    if (o.fid !== undefined) {
        const tracker = readIssueTracker(cwd);
        const fid = tracker === "linear" ? o.fid.toLowerCase() : o.fid;
        add(`fid ${fid}`, FID_PATTERNS[tracker].test(fid)
            ? undefined
            : `does not match the ${tracker} shape ${FID_PATTERNS[tracker].source}`, `${tracker} shape`);
        if (o.token !== undefined) {
            const lock = workflowLockPath(lockRoot(cwd, o.workflow, o.devPushes === true), resolveMonth(repoRoot(cwd), o.fid, o.month), o.fid);
            const holder = readHolder(lock);
            add("workflow lock", holder === undefined
                ? `no lock at ${lock}`
                : holder.token === o.token
                    ? undefined
                    : `${lock} is held by another owner: ${holder.line}`, `held at ${lock}`);
        }
    }
    else if (o.token !== undefined) {
        throw new CommandError(EXIT.USAGE, "--token needs --fid");
    }
    for (const a of o.artifacts) {
        if (isUrl(a))
            continue;
        const problem = artifactProblem(cwd, a);
        add(`artifact ${a}`, problem, "present and non-empty");
        if (problem)
            continue;
        const left = placeholderLines(path.resolve(cwd, a));
        add(`placeholders ${a}`, left.length ? `PENDING left on line(s) ${left.join(", ")}` : undefined, "none left");
    }
    let headerVerdict;
    if (o.verdictRequired) {
        const verdictFile = o.artifacts[0];
        if (verdictFile === undefined) {
            add("verdict", "--verdict-required needs an --artifact to read it from", "");
        }
        else {
            const header = readHeader(path.resolve(cwd, verdictFile), o.allowed);
            headerVerdict = header.ok ? header.verdict : undefined;
            add(`verdict ${verdictFile}`, header.ok ? undefined : header.problem, `Verdict: ${header.ok ? header.verdict : ""}`);
        }
    }
    if (o.file === undefined)
        return checks;
    const runs = o.ref === undefined ? readRuns(o.file) : readRunsAt(o.file, o.ref);
    const rows = activeDoneSteps(runs, o.workflow, { step: o.step, subPlan: o.subPlan });
    const row = rows.filter((r) => o.attempt === undefined || r.attempt === o.attempt).at(-1);
    const rowProblems = [];
    if (!row) {
        rowProblems.push(`no DONE ${o.step} row in the active run${o.attempt === undefined ? "" : ` with attempt ${o.attempt}`}`);
    }
    else {
        if (!/^[0-9a-f]{40}$/.test(row.parentSha ?? ""))
            rowProblems.push(`parentSha "${row.parentSha ?? ""}" is not a sha`);
        const recorded = new Set((row.artifacts ?? []).map((a) => path.normalize(a)));
        for (const a of o.artifacts)
            if (!recorded.has(path.normalize(a)))
                rowProblems.push(`row does not list ${a}`);
        const mismatch = failuresProblem(row.verdict, row.failures);
        if (mismatch)
            rowProblems.push(mismatch);
        const missing = missingRowFields(o.workflow, o.step, row);
        if (missing.length)
            rowProblems.push(`row is missing ${missing.join(", ")}`);
        if (o.verdictRequired && !o.allowed.includes(String(row.verdict))) {
            rowProblems.push(`row verdict "${String(row.verdict ?? "")}" is not ${o.allowed.join("|")}`);
        }
        if (o.verdictRequired && headerVerdict !== undefined && row.verdict !== headerVerdict) {
            rowProblems.push(`row verdict ${String(row.verdict)} differs from the artifact's ${headerVerdict}`);
        }
    }
    add("status row", rowProblems.length ? rowProblems.join("; ") : undefined, `at ${row?.at ?? ""}`);
    return checks;
}
// ---------------------------------------------------------------------------
// finish
// ---------------------------------------------------------------------------
const POSITIONS = ["next", "current", "count"];
/** `<step>:<next|current|count>[:<since>]` → the counter it names, from the active run. */
function derivedCounter(file, workflow, spec, subPlan, since) {
    const [step, position, specSince] = spec.split(":");
    if (!step || !POSITIONS.includes(position ?? "")) {
        throw new CommandError(EXIT.USAGE, `"${spec}" must be <step>:<next|current|count>[:<since>]`);
    }
    const count = fs.existsSync(file)
        ? activeDoneSteps(readRuns(file), workflow, { step, subPlan }, specSince ?? since).length
        : 0;
    if (position === "current" && count === 0) {
        throw new CommandError(EXIT.NO, `${step}: no DONE row in the active run — the step's own row is missing`);
    }
    return position === "next" ? count + 1 : count;
}
/** The first `DONE …: description — …` line of a log, as a commit-subject fragment. */
export function doneDescription(file) {
    if (!fs.existsSync(file))
        return "";
    const line = fs
        .readFileSync(file, "utf-8")
        .split("\n")
        .find((l) => l.startsWith("DONE"));
    if (line === undefined)
        return "";
    return line
        .replace(/^DONE[^:]*: /, "")
        .replace(/ — .*$/, "")
        .replace(/[\r\n`"\\]/g, "")
        .replace(/\s+$/, "")
        .slice(0, 72);
}
/** Staged paths a docs-only step may not touch: anything outside the artifact tree and its ledgers. */
const DOCS_ONLY = /^docs\/plans\/|^docs\/(deferrals|decisions|failures)\.jsonl$|^\.bkit\/(friction|stats)\.jsonl$/;
/** `soakAttempt` → `Soak Attempt`, for a comment header. */
const titleCase = (key) => key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
/** `<attempt>` filled in, once the attempt is known. */
const fill = (s, attempt) => attempt === undefined ? s : s.split(ATTEMPT_TOKEN).join(String(attempt));
const list = (v) => v ?? [];
function finish(ctx) {
    const f = ctx.flags;
    const file = statusFile(ctx);
    const workflow = String(f.workflow);
    const step = String(f.step);
    const subPlan = positiveInt(f.subPlan, "sub-plan");
    const since = str(f.since);
    const agents = list(f.agent);
    // Attempt: given, next from the log, or another step's counter.
    if ([f.attempt, f.attemptOf].filter((v) => v !== undefined).length > 1)
        throw new CommandError(EXIT.USAGE, "give --attempt or --attempt-of, not both");
    let attempt;
    let derived = false;
    if (f.attemptOf !== undefined) {
        attempt = derivedCounter(file, workflow, String(f.attemptOf), subPlan, since);
        derived = true;
    }
    else if (f.attempt === "next") {
        attempt = derivedCounter(file, workflow, `${step}:next`, subPlan, since);
        derived = true;
    }
    else {
        attempt = nonNegativeInt(f.attempt, "attempt");
    }
    const extras = Object.fromEntries(list(f.field).map(extraField));
    for (const spec of list(f.countField)) {
        const eq = spec.indexOf("=");
        if (eq <= 0)
            throw new CommandError(EXIT.USAGE, `--count-field "${spec}" must be key=<counter>`);
        extras[spec.slice(0, eq)] = derivedCounter(file, workflow, spec.slice(eq + 1), subPlan, since);
    }
    const scope = str(f.scope);
    if (scope !== undefined)
        extras.scope = scope;
    const artifacts = [
        ...list(f.artifact).map((a) => fill(a, attempt)),
        ...list(f.optionalArtifact)
            .map((a) => fill(a, attempt))
            .filter((a) => fs.existsSync(path.resolve(ctx.cwd, a))),
    ];
    // Artifacts first: every one present, non-empty, inside the working directory.
    const bad = artifacts.map((a) => artifactProblem(ctx.cwd, a)).filter(Boolean);
    if (bad.length > 0) {
        ctx.log(bad.join("; "));
        return EXIT_ARTIFACT;
    }
    // Verdict: the agents' headers (worst wins, Failures summed), or given.
    if (agents.length > 0 && (f.verdict !== undefined || f.failures !== undefined))
        throw new CommandError(EXIT.USAGE, "--agent reads the verdict; drop --verdict / --failures");
    if (agents.length > artifacts.filter((a) => !isUrl(a)).length)
        throw new CommandError(EXIT.USAGE, "each --agent reads the --artifact in the same position");
    let verdict = str(f.verdict);
    let failures = f.failures === undefined ? undefined : nonNegativeInt(f.failures, "failures");
    let allowed = f.allowed === undefined ? DEFAULT_VERDICTS : allowedVerdicts({ allowed: f.allowed });
    const fields = {};
    if (agents.length > 0) {
        const verdicts = [];
        for (const [i, agent] of agents.entries()) {
            const header = promptHeader(agent);
            if (i === 0)
                allowed = header.verdicts;
            const read = readHeader(path.resolve(ctx.cwd, artifacts[i]), header.verdicts, [], header.fields);
            if (!read.ok) {
                ctx.log(read.problem);
                ctx.emit({ reask: { agent, artifact: artifacts[i] }, problem: read.problem });
                return read.code;
            }
            verdicts.push(read.verdict);
            for (const [k, v] of Object.entries(read.fields)) {
                if (k === "Verdict")
                    continue;
                if (k === "Failures")
                    failures = (failures ?? 0) + Number(v);
                else if (!(k in fields))
                    fields[k] = v;
            }
        }
        verdict = worstVerdict(verdicts, allowed);
    }
    else if (verdict !== undefined && !allowed.includes(verdict)) {
        throw new CommandError(EXIT.USAGE, `--verdict must be ${allowed.join("|")}`);
    }
    const mismatch = failuresProblem(verdict, failures);
    if (mismatch) {
        ctx.log(mismatch);
        ctx.emit({
            reask: agents.length ? { agent: agents[0], artifact: artifacts[0] } : null,
            problem: mismatch,
        });
        return agents.length ? EXIT_INVALID : EXIT.USAGE;
    }
    const strategy = str(f.strategy) ?? fields.Strategy;
    if (strategy !== undefined && !STRATEGIES.includes(strategy))
        throw new CommandError(EXIT.USAGE, "--strategy must be STANDARD|PIVOT|FINAL");
    delete fields.Strategy;
    const clampLog = str(f.clampLog);
    if (clampLog !== undefined) {
        const [clampStep, clampAttempt] = fill(clampLog, attempt).split(":");
        const fid = path.basename(path.dirname(file));
        extras.clamped = readRecords(clampLogPath(ctx.cwd, fid, clampStep, positiveInt(clampAttempt, "clamp-log attempt")), (l) => ctx.log(`skipping a malformed clamp record: ${l}`));
    }
    // What the gate would refuse, refused before anything is written.
    const pre = gateChecks(ctx.cwd, {
        workflow,
        step,
        artifacts,
        verdictRequired: false,
        allowed,
        placeholders: [],
    });
    const missing = missingRowFields(workflow, step, {
        attempt,
        strategy,
        ...extras,
    });
    if (missing.length)
        pre.push({ check: "status row", ok: false, detail: `row would miss ${missing.join(", ")}` });
    if (pre.some((c) => !c.ok)) {
        for (const c of pre.filter((x) => !x.ok))
            ctx.log(`${c.check}: ${c.detail}`);
        ctx.emit({ pass: false, checks: pre });
        return EXIT.NO;
    }
    const commit = str(f.commit) ?? "auto";
    if (!["auto", "none"].includes(commit))
        throw new CommandError(EXIT.USAGE, "--commit must be auto or none");
    if (f.docsOnly === true && commit === "auto") {
        runGit(ctx.cwd, ["add", "-A"]);
        const outside = runGit(ctx.cwd, ["diff", "--cached", "--name-only"])
            .stdout.split("\n")
            .filter((p) => p !== "" && !DOCS_ONLY.test(p));
        if (outside.length) {
            ctx.log(`the step wrote outside docs/plans/: ${outside.join(", ")}`);
            ctx.emit({ pass: false, outside });
            return EXIT_OUTSIDE_DOCS;
        }
    }
    let message = str(f.message);
    if (message !== undefined) {
        message = fill(message, attempt);
        if (message.includes(DONE_TOKEN)) {
            const done = doneDescription(path.resolve(ctx.cwd, artifacts[0] ?? ""));
            message = message.split(DONE_TOKEN).join(done || fill(str(f.doneFallback) ?? "", attempt));
        }
        if (f.verboseCiLocal === true &&
            runOrStepField(readRuns(file), workflow, "pushMode") === "LOCAL")
            message += " bkit [verbose ci]";
    }
    const written = writeStepRow(ctx.cwd, {
        file,
        workflow,
        step,
        verdict,
        failures,
        attempt,
        subPlan,
        strategy,
        artifacts,
        extras,
        parentSha: str(f.parentSha),
        commit: commit,
        message,
    }, ctx.log);
    const checks = gateChecks(ctx.cwd, {
        file,
        workflow,
        step,
        subPlan,
        attempt,
        artifacts,
        verdictRequired: false,
        allowed,
        placeholders: [],
    });
    // The step's tracker comment: header fields in one fixed order.
    let comment = null;
    const number = str(f.number);
    if (number !== undefined) {
        const title = str(f.title);
        if (title === undefined)
            throw new CommandError(EXIT.USAGE, "--number needs --title");
        const count = str(f.subPlanCount);
        const header = [
            ...(verdict === undefined ? [] : [["Verdict", verdict]]),
            ...(failures === undefined ? [] : [["Failures", String(failures)]]),
            ...(scope === undefined ? [] : [["Scope", scope]]),
            ...(subPlan === undefined
                ? []
                : [
                    ["Sub-plan", `${subPlan}${count === undefined ? "" : `/${count}`}`],
                ]),
            ...(derived && attempt !== undefined
                ? [["Attempt", String(attempt)]]
                : []),
            ...(strategy === undefined ? [] : [["Strategy", strategy]]),
            ...list(f.countField).map((c) => {
                const key = c.slice(0, c.indexOf("="));
                return [titleCase(key), String(extras[key])];
            }),
            ...Object.entries(fields),
            ...list(f.commentField).map((c) => {
                const eq = c.indexOf("=");
                if (eq <= 0)
                    throw new CommandError(EXIT.USAGE, `--comment-field "${c}" must be Name=value`);
                return [c.slice(0, eq), fill(c.slice(eq + 1), attempt)];
            }),
        ];
        const linkRef = str(f.linkRef);
        const tree = str(f.tree);
        const fileArtifacts = artifacts.filter((a) => !isUrl(a));
        comment = buildComment(ctx.cwd, {
            stepNumber: number,
            stepTitle: title,
            fields: header,
            ownerRepo: linkRef === undefined && tree === undefined
                ? undefined
                : (str(f.ownerRepo) ?? resolveRepoSlug(ctx.cwd)),
            tree,
            artifacts: linkRef === undefined ? [] : fileArtifacts,
            ref: linkRef,
            bodyFile: f.commentBody === true ? fileArtifacts[0] : undefined,
        });
    }
    const pass = checks.every((c) => c.ok);
    for (const c of checks.filter((x) => !x.ok))
        ctx.log(`${c.check}: ${c.detail}`);
    ctx.emit({
        verdict: verdict ?? null,
        failures: failures ?? null,
        attempt: attempt ?? null,
        fields,
        row: written.row,
        commit: written.commit,
        pass,
        checks,
        comment,
    });
    if (written.code !== EXIT.OK)
        return written.code;
    return pass ? EXIT.OK : EXIT.NO;
}
// ---------------------------------------------------------------------------
// stub
// ---------------------------------------------------------------------------
/** The header a fresh versioned artifact starts with; the subagent fills it in last. */
export const STUB_HEADER = `Verdict: PENDING\n${VERDICT_END}\n\n`;
/** `text` without everything up to and including its first `<!-- verdict:end -->` line. */
export function stripHeader(text) {
    const lines = text.split("\n");
    const end = lines.indexOf(VERDICT_END);
    return end === -1 ? text : lines.slice(end + 1).join("\n");
}
// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------
const COMMIT_FLAGS = [
    {
        name: "parent-sha",
        type: "string",
        help: "commit the step started from (default: HEAD now, before this commit)",
    },
    { name: "commit", type: "string", help: "auto (default: git add -A + commit) or none" },
    { name: "message", type: "string", help: "commit message (required unless --commit=none)" },
];
export const stepsCommand = {
    noun: "steps",
    summary: "Write a step's status row, finish a step in one call, read a verdict header, check a gate, seed an artifact header.",
    verbs: {
        done: {
            summary: "Append a step-done row and commit it (parentSha captured first).",
            flags: [
                { ...FILE_FLAG, help: "path to status.jsonl (created if absent)" },
                WORKFLOW_FLAG,
                STEP_FLAG,
                { name: "status", type: "string", help: "DONE (default) or FAILED" },
                {
                    name: "verdict",
                    type: "string",
                    help: "PASS|CONCERNS|FAIL, or the set --agent / --allowed gives",
                },
                ...ALLOWED_FLAGS,
                {
                    name: "failures",
                    type: "string",
                    help: "non-negative integer; must agree with --verdict",
                },
                {
                    name: "attempt",
                    type: "string",
                    help: "non-negative integer (0 included), or `next` to derive it from the log",
                },
                SUB_PLAN_FLAG,
                { name: "strategy", type: "string", help: "STANDARD|PIVOT|FINAL" },
                {
                    name: "artifact",
                    type: "string",
                    repeatable: true,
                    help: "file the step produced, relative to the working directory, or an https:// URL (a PR)",
                },
                {
                    name: "field",
                    type: "string",
                    repeatable: true,
                    help: "extra row field key=value (value parsed as JSON when it is JSON)",
                },
                ...COMMIT_FLAGS,
            ],
            output: {
                row: "the appended step-done row",
                commit: "the new commit's sha, or null with --commit=none",
            },
            exitCodes: {
                [EXIT_NO_STATUS]: "--attempt=next could not read status.jsonl",
                [EXIT_ARTIFACT]: "an --artifact is missing, empty, or outside the working directory",
                [EXIT_COMMIT]: "the row was written but the commit failed",
            },
            run: (ctx) => {
                const f = ctx.flags;
                const file = statusFile(ctx);
                const workflow = String(f.workflow);
                const step = String(f.step);
                const status = str(f.status) ?? "DONE";
                if (!["DONE", "FAILED"].includes(status))
                    throw new CommandError(EXIT.USAGE, "--status must be DONE or FAILED");
                const verdict = str(f.verdict);
                const allowed = allowedVerdicts(f);
                if (verdict !== undefined && !allowed.includes(verdict)) {
                    throw new CommandError(EXIT.USAGE, `--verdict must be ${allowed.join("|")}`);
                }
                const failures = nonNegativeInt(f.failures, "failures");
                const mismatch = failuresProblem(verdict, failures);
                if (mismatch)
                    throw new CommandError(EXIT.USAGE, mismatch);
                const strategy = str(f.strategy);
                if (strategy !== undefined && !STRATEGIES.includes(strategy)) {
                    throw new CommandError(EXIT.USAGE, "--strategy must be STANDARD|PIVOT|FINAL");
                }
                const subPlan = positiveInt(f.subPlan, "sub-plan");
                const commit = str(f.commit) ?? "auto";
                if (!["auto", "none"].includes(commit))
                    throw new CommandError(EXIT.USAGE, "--commit must be auto or none");
                const artifacts = list(f.artifact);
                const bad = artifacts.map((a) => artifactProblem(ctx.cwd, a)).filter(Boolean);
                if (bad.length > 0)
                    throw new CommandError(EXIT_ARTIFACT, bad.join("; "));
                const attempt = f.attempt === "next"
                    ? derivedCounter(file, workflow, `${step}:next`, subPlan, undefined)
                    : nonNegativeInt(f.attempt, "attempt");
                const written = writeStepRow(ctx.cwd, {
                    file,
                    workflow,
                    step,
                    status: status,
                    verdict,
                    failures,
                    attempt,
                    subPlan,
                    strategy,
                    artifacts,
                    extras: Object.fromEntries(list(f.field).map(extraField)),
                    parentSha: str(f.parentSha),
                    commit: commit,
                    message: str(f.message),
                }, ctx.log);
                ctx.emit({ row: written.row, commit: written.commit });
                return written.code;
            },
        },
        finish: {
            summary: "End a step: read the verdict header(s), derive the attempt, check the gate, write the row, commit, print the tracker comment.",
            flags: [
                { ...FILE_FLAG, help: "path to status.jsonl (created if absent)" },
                WORKFLOW_FLAG,
                STEP_FLAG,
                {
                    name: "artifact",
                    type: "string",
                    repeatable: true,
                    help: `file the step produced (or an https:// URL); ${ATTEMPT_TOKEN} becomes the attempt`,
                },
                {
                    name: "optional-artifact",
                    type: "string",
                    repeatable: true,
                    help: "an artifact recorded (and checked) only when the file exists",
                },
                {
                    name: "agent",
                    type: "string",
                    repeatable: true,
                    help: "subagent whose prompt declares the header of the --artifact in the same position; verdicts worst-of, Failures summed",
                },
                {
                    name: "verdict",
                    type: "string",
                    help: "the verdict, when no --agent reads it (checked against --allowed)",
                },
                { name: "allowed", type: "string", help: "allowed --verdict values, comma-separated" },
                { name: "failures", type: "string", help: "failure count, when no --agent reads it" },
                {
                    name: "attempt",
                    type: "string",
                    help: "non-negative integer, or `next` (this step's count + 1)",
                },
                {
                    name: "attempt-of",
                    type: "string",
                    help: "<step>:<next|current|count> — the attempt is that step's counter in the active run",
                },
                {
                    name: "since",
                    type: "string",
                    help: "run field holding a timestamp (soakEntryAt); only rows after it count",
                },
                {
                    name: "count-field",
                    type: "string",
                    repeatable: true,
                    help: "key=<step>:<next|current|count>[:<since>] — a row field holding another counter",
                },
                SUB_PLAN_FLAG,
                {
                    name: "strategy",
                    type: "string",
                    help: "STANDARD|PIVOT|FINAL (default: the agent header's Strategy)",
                },
                { name: "scope", type: "string", help: "test scope: row field scope, comment Scope" },
                {
                    name: "field",
                    type: "string",
                    repeatable: true,
                    help: "extra row field key=value (value parsed as JSON when it is JSON)",
                },
                {
                    name: "clamp-log",
                    type: "string",
                    help: `<step>[:<attempt>] — read that clamp log into the row's clamped (${ATTEMPT_TOKEN} allowed)`,
                },
                {
                    name: "docs-only",
                    type: "boolean",
                    help: "refuse (exit 9) when the step staged anything outside docs/plans/ and the docs ledgers",
                },
                ...COMMIT_FLAGS.map((c) => c.name === "message"
                    ? {
                        ...c,
                        help: `commit message; ${ATTEMPT_TOKEN} becomes the attempt, ${DONE_TOKEN} the first artifact's first DONE line`,
                    }
                    : c),
                {
                    name: "done-fallback",
                    type: "string",
                    help: `${DONE_TOKEN} when the artifact has no DONE line`,
                },
                {
                    name: "verbose-ci-local",
                    type: "boolean",
                    help: "append ` bkit [verbose ci]` to the message when the run's pushMode is LOCAL",
                },
                { name: "number", type: "string", help: "step number: print the step's tracker comment" },
                { name: "title", type: "string", help: "step title for the comment heading" },
                { name: "sub-plan-count", type: "string", help: "y of the comment's Sub-plan x/y" },
                {
                    name: "link-ref",
                    type: "string",
                    help: "link the file artifacts at this ref in the comment",
                },
                { name: "tree", type: "string", help: "link the tree of this ref in the comment" },
                {
                    name: "owner-repo",
                    type: "string",
                    help: "owner/repo for the links (default: the origin remote)",
                },
                {
                    name: "comment-body",
                    type: "boolean",
                    help: "append the first artifact verbatim to the comment (summaries)",
                },
                {
                    name: "comment-field",
                    type: "string",
                    repeatable: true,
                    help: "extra comment header field Name=value",
                },
            ],
            output: {
                verdict: "the verdict recorded (worst of the agents' headers), or null",
                failures: "failures recorded (summed over the agents' headers), or null",
                attempt: "the attempt recorded, or null",
                fields: "the other header fields the agents' prompts declare (Spike, Mode, Affected)",
                row: "the appended step-done row",
                commit: "the new commit's sha, or null with --commit=none",
                pass: "every gate check passed",
                checks: "[{check, ok, detail}] per gate check",
                comment: "the step's tracker comment body (with --number), else null",
                reask: "verdict read failed: {agent, artifact} to re-ask (exit 4 / 5 / 6 only)",
                problem: "why the verdict read failed (exit 4 / 5 / 6 only)",
            },
            exitCodes: {
                [EXIT_NO_STATUS]: "status.jsonl is not valid NDJSON",
                [EXIT_EMPTY]: "an --agent's artifact is missing or empty (nothing written)",
                [EXIT_PENDING]: "an --agent's header still has a PENDING field — re-ask it (nothing written)",
                [EXIT_INVALID]: "an --agent's header is invalid (no verdict:end, a value outside its set, Failures disagreeing with Verdict) — re-ask it (nothing written)",
                [EXIT_ARTIFACT]: "an --artifact is missing, empty, or outside the working directory (nothing written)",
                [EXIT_COMMIT]: "the row was written but the commit failed",
                [EXIT_OUTSIDE_DOCS]: "--docs-only and the step staged a file outside the artifact tree (nothing written)",
            },
            run: finish,
        },
        verdict: {
            summary: "Read an artifact's header down to <!-- verdict:end -->.",
            flags: [
                { name: "file", type: "string", required: true, help: "the subagent's artifact" },
                ...ALLOWED_FLAGS,
                {
                    name: "field",
                    type: "string",
                    repeatable: true,
                    help: "header field that must be present, e.g. Failures",
                },
            ],
            output: { verdict: "the Verdict value", fields: "every Key: value header field" },
            exitCodes: {
                [EXIT_EMPTY]: "artifact missing or empty",
                [EXIT_PENDING]: "a header field is still PENDING",
                [EXIT_INVALID]: "no verdict:end line, Verdict outside the allowed set, or a required field missing — re-prompt the subagent",
            },
            run: (ctx) => {
                const header = readHeader(path.resolve(ctx.cwd, String(ctx.flags.file)), allowedVerdicts(ctx.flags), list(ctx.flags.field));
                if (!header.ok) {
                    ctx.log(header.problem);
                    return header.code;
                }
                ctx.emit({ verdict: header.verdict, fields: header.fields });
                return EXIT.OK;
            },
        },
        gate: {
            summary: "Mechanical gate checks for one step: placeholders, FID, lock, artifacts, verdict, status row (with its attempt / strategy / scope where the step writes them).",
            flags: [
                {
                    ...FILE_FLAG,
                    required: false,
                    help: "path to status.jsonl; without it the status row is not checked (Step 1)",
                },
                {
                    name: "ref",
                    type: "string",
                    help: "read --file as committed on this ref (e.g. origin/dev), not from disk",
                },
                WORKFLOW_FLAG,
                STEP_FLAG,
                SUB_PLAN_FLAG,
                {
                    name: "attempt",
                    type: "string",
                    help: "the row must carry this attempt (non-negative integer)",
                },
                {
                    name: "attempt-of",
                    type: "string",
                    help: "<step>:<next|current|count> — the row must carry that counter as its attempt",
                },
                {
                    name: "artifact",
                    type: "string",
                    repeatable: true,
                    help: `artifact the step must have produced (${ATTEMPT_TOKEN} becomes the attempt)`,
                },
                {
                    name: "verdict-required",
                    type: "boolean",
                    help: "the artifact header and the row must carry a valid verdict",
                },
                ...ALLOWED_FLAGS,
                {
                    name: "placeholder",
                    type: "string",
                    repeatable: true,
                    help: "NAME=value — the held placeholder must be non-empty",
                },
                { name: "fid", type: "string", help: "the FID must match the wired tracker's shape" },
                { name: "month", type: "string", help: "month bucket of the lock (with --token)" },
                {
                    name: "token",
                    type: "string",
                    help: "the workflow lock must be held with this token (needs --fid)",
                },
                {
                    name: "dev-pushes",
                    type: "boolean",
                    help: "ship only: the lock lives in the main checkout",
                },
            ],
            output: { pass: "true when every check passed", checks: "[{check, ok, detail}] per check" },
            exitCodes: {
                [EXIT_NO_STATUS]: "status.jsonl missing (on disk, or on --ref), unreadable, or not valid NDJSON",
            },
            run: (ctx) => {
                const f = ctx.flags;
                const file = str(f.file) === undefined ? undefined : statusFile(ctx);
                const workflow = String(f.workflow);
                const subPlan = positiveInt(f.subPlan, "sub-plan");
                if (f.attempt !== undefined && f.attemptOf !== undefined)
                    throw new CommandError(EXIT.USAGE, "give --attempt or --attempt-of, not both");
                if (f.attemptOf !== undefined && file === undefined)
                    throw new CommandError(EXIT.USAGE, "--attempt-of needs --file");
                const ref = str(f.ref);
                if (ref !== undefined && file === undefined)
                    throw new CommandError(EXIT.USAGE, "--ref needs --file");
                if (ref !== undefined && f.attemptOf !== undefined)
                    throw new CommandError(EXIT.USAGE, "--attempt-of reads the file on disk; give --attempt with --ref");
                const attempt = f.attemptOf !== undefined
                    ? derivedCounter(file, workflow, String(f.attemptOf), subPlan, undefined)
                    : nonNegativeInt(f.attempt, "attempt");
                const checks = gateChecks(ctx.cwd, {
                    file,
                    ref,
                    workflow,
                    step: String(f.step),
                    subPlan,
                    attempt,
                    artifacts: list(f.artifact).map((a) => fill(a, attempt)),
                    verdictRequired: f.verdictRequired === true,
                    allowed: allowedVerdicts(f),
                    fid: str(f.fid),
                    month: str(f.month),
                    token: str(f.token),
                    devPushes: f.devPushes === true,
                    placeholders: list(f.placeholder),
                });
                const pass = checks.every((c) => c.ok);
                for (const c of checks.filter((x) => !x.ok))
                    ctx.log(`${c.check}: ${c.detail}`);
                ctx.emit({ pass, checks });
                return pass ? EXIT.OK : EXIT.NO;
            },
        },
        stub: {
            summary: "Seed a versioned artifact: copy the prior version, then put a PENDING verdict header on top.",
            flags: [
                { name: "from", type: "string", required: true, help: "the prior versioned artifact" },
                { name: "to", type: "string", required: true, help: "the artifact to create" },
                {
                    name: "strip-header",
                    type: "boolean",
                    help: "drop the prior version's own header (everything down to its <!-- verdict:end -->)",
                },
            ],
            output: { file: "the artifact written", stripped: "the prior header was dropped" },
            exitCodes: { [EXIT_EMPTY]: "--from is missing or empty" },
            run: (ctx) => {
                const from = path.resolve(ctx.cwd, String(ctx.flags.from));
                if (!fs.existsSync(from) || fs.statSync(from).size === 0) {
                    ctx.log(`${String(ctx.flags.from)} is missing or empty`);
                    return EXIT_EMPTY;
                }
                const body = fs.readFileSync(from, "utf-8");
                const stripped = ctx.flags.stripHeader === true;
                const to = path.resolve(ctx.cwd, String(ctx.flags.to));
                fs.mkdirSync(path.dirname(to), { recursive: true });
                fs.writeFileSync(to, STUB_HEADER + (stripped ? stripHeader(body) : body));
                ctx.emit({ file: String(ctx.flags.to), stripped });
                return EXIT.OK;
            },
        },
    },
};
