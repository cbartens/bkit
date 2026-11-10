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
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { actionKey, activeDoneSteps, allRunsDoneSteps, appendLine, ciRoundMatches, runNumber, runOrStepField, statusTimestamp, } from "../../ledgers/status.js";
import { clampLogPath, readRecords } from "../../ledgers/clamp-log.js";
import { appendFrictionRow, frictionRow, journalEnabled } from "../../ledgers/journal.js";
import { resolveRepoSlug } from "../../ledgers/telemetry.js";
import { getPromptsRoot } from "../../shared/package-roots.js";
import { readTextFile } from "../../shared/json.js";
import { CommandError, EXIT, git, isSharedBranch, parseJson, repoRoot, runGit, } from "../lib.js";
import { activeRunStart, savedPointLimit } from "./counters.js";
import { isResumable, runProgress, WORKFLOW_STEPS } from "./step-table.js";
import { planFiles } from "./run-facts.js";
import { mergeFindings, parseFindings, renderFindingsLog, structuredFindings, } from "./challenge.js";
import { fidProblem, normaliseFid, readIssueTracker } from "./fids.js";
import { auditEntries, auditFindingsLine, auditLedgerRows, auditTotals, buildComment, parseAuditResult, } from "./issues.js";
import { EXIT_FOREIGN_PATH, activeRecord, ownPathCommit, ownSet, } from "./ledgers.js";
import { readHolder, resolveMonth, workflowLockPath } from "./locks.js";
import { EXIT_NO_STATUS, FILE_FLAG, GROUP_FLAG, STEP_FLAG, WORKFLOW_FLAG, extraField, nonNegativeInt, positiveInt, readRuns, readStatusRows, readRunsAt, statusFile, str, } from "./status.js";
import { COMMENT_FILE_OUTPUT, POST_FLAG, TRACKER_OUTPUT, commentFileOf, postForVerb, } from "./tracker.js";
import { parsePlanBlocks } from "./plan-blocks.js";
import { PLAN_TASKS_STEP, readTestFirst, touchedTests } from "./tests.js";
import { addAllButCopied } from "./worktrees.js";
/**
 * An `agent-rework` friction row for a refused planned-test edit: the step reruns, so
 * `bkit stats` counts it. Best effort — a ledger that cannot be written never changes
 * the refusal.
 */
function recordTestLockFriction(top, step, named) {
    if (!journalEnabled())
        return;
    const row = frictionRow({
        workflow: "build",
        step,
        noun: "steps",
        verb: "finish",
        code: EXIT_TESTS_TOUCHED,
        bookRoot: top,
        parentSha: git(top, ["rev-parse", "HEAD"]) ?? undefined,
    });
    row["category"] = "agent-rework";
    row["severity"] = "LOW";
    row["summary"] = "a code step edited a planned test case";
    row["description"] =
        `\`bkit steps finish\` refused ${step} with exit ${EXIT_TESTS_TOUCHED}: ${named} changed after the group's red; the step reruns.`;
    appendFrictionRow(top, row);
}
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
/** finish (build plan-execute / plan-gaps-remediate): a planned test case differs from the lines the group's tests step recorded. */
export const EXIT_TESTS_TOUCHED = 11;
/** finish: a saved artifact holds a later attempt than the one finished. */
export const EXIT_LATER_ATTEMPT = 12;
/** finish: the step's commit would change `bkit.workflows` in package.json. */
export const EXIT_WORKFLOWS_CHANGED = 13;
/** finish (build plan-tests): the tests step's commit changes a file that is not one of the group's planned tests. */
export const EXIT_SOURCE_TOUCHED = 15;
/** The step whose subagent writes the group's TEST FIRST tests, before any task code. */
export const PLAN_TESTS_STEP = "build-plan-tests";
/** The step whose subagent closes the group's verification gaps: a code step, like plan-execute. */
export const PLAN_REMEDIATE_STEP = "build-plan-gaps-remediate";
/** The step whose subagent closes the whole-feature verification gaps, across every group. */
export const PLAN_REMEDIATE_HOLISTIC_STEP = "build-plan-gaps-remediate-holistic";
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
    const stale = fingerprintProblem(file, lines, end, fields);
    if (stale !== null)
        return { ok: false, code: EXIT_INVALID, problem: stale };
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
/** Header field that fingerprints a generated artifact's header and body. */
const FINGERPRINT = "Fingerprint";
/** sha256 of an artifact's header (without its Fingerprint line) and everything below it. */
export function artifactFingerprint(lines, end) {
    const head = lines.slice(0, end).filter((l) => !l.startsWith(`${FINGERPRINT}:`));
    const body = lines.slice(end + 1);
    return createHash("sha256")
        .update(`${head.join("\n")}\n${VERDICT_END}\n${body.join("\n")}`)
        .digest("hex");
}
/** Why a generated artifact no longer matches what the engine rendered, or null (hand-written ones carry no fingerprint). */
function fingerprintProblem(file, lines, end, fields) {
    const given = fields[FINGERPRINT];
    if (given === undefined)
        return null;
    return artifactFingerprint(lines, end) === given
        ? null
        : `${file}: stale; its header or body changed after the engine rendered it (Fingerprint mismatch) — regenerate it from the result file`;
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
    "plan/plan-summary": ["attempt"],
    "build/build-plan-convert": ["attempt"],
    "build/build-plan-current": ["attempt"],
    "build/build-install-skills": ["attempt"],
    "build/build-plan-tests": ["attempt"],
    "build/build-plan-tasks": ["attempt"],
    "build/build-plan-verify": ["attempt"],
    "build/build-group-gate": ["attempt", "scope"],
    "build/build-plan-gaps-remediate": ["attempt", "strategy"],
    "build/build-plan-verify-holistic": ["attempt"],
    "build/build-plan-gaps-remediate-holistic": ["attempt", "strategy"],
    "build/build-challenge": ["attempt"],
    "build/build-decision": ["attempt"],
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
    "group",
    "failures",
    "strategy",
]);
// ---------------------------------------------------------------------------
// Writing the row
// ---------------------------------------------------------------------------
/** The FID a `docs/plans/{month}/logs/{fid}/status.jsonl` path belongs to; undefined for any other file. */
function fidOfStatusFile(file) {
    return /(?:^|\/)docs\/plans\/[0-9]{6}\/logs\/([^/]+)\/status\.jsonl$/.exec(file.split(path.sep).join("/"))?.[1];
}
/** Loop budgets use the same point names as the workflow counter routes. */
function progressPoint(workflow, step, soak) {
    if (workflow === "build") {
        if (["build-plan-verify", "build-group-gate", "build-plan-gaps-remediate"].includes(step))
            return "build.verify";
        if (step === "build-challenge")
            return "build.challenge";
        if (["build-run-tests", "build-failure-diagnose", "build-failure-remediate"].includes(step))
            return "build.tests";
    }
    if (workflow === "debug") {
        if (step === "debug-failure-soak" || soak)
            return "debug.soak";
        if (["debug-run-tests", "debug-failure-diagnose", "debug-failure-remediate"].includes(step))
            return "debug.fix";
    }
    if (workflow === "ship" &&
        ["ship-merge-pr", "ship-failure-diagnose", "ship-failure-remediate"].includes(step))
        return "ship.merge";
    return undefined;
}
/** Prepare output before a completion mutates the log; progress is never persisted. */
function stepProgress(cwd, r, number) {
    if (r.status === "FAILED" || !isResumable(r.workflow))
        return undefined;
    const entry = WORKFLOW_STEPS[r.workflow].find((s) => number === undefined ? s.step === r.step : s.number === number);
    if (entry === undefined) {
        if (number !== undefined)
            throw new CommandError(EXIT.USAGE, "--progress-number is not a workflow step");
        return undefined;
    }
    if (fs.existsSync(r.file) && !readTextFile(r.file).ok)
        throw new CommandError(EXIT_NO_STATUS, `${r.file} is unreadable`);
    const runs = fs.existsSync(r.file) ? readRuns(r.file) : [];
    const run = runs.filter((item) => item.workflow === r.workflow).at(-1);
    const abs = path.resolve(cwd, r.file);
    const canonical = /^(.*)\/docs\/plans\/([0-9]{6})\/logs\/([^/]+)\/status\.jsonl$/.exec(abs.split(path.sep).join("/"));
    let groups = [];
    if (r.workflow === "build" && canonical !== null) {
        const [file] = planFiles(canonical[1], canonical[2], canonical[3]);
        if (file !== undefined) {
            const text = readTextFile(file);
            if (!text.ok)
                throw new CommandError(EXIT.USAGE, `progress plan ${file} is unreadable`);
            const plan = parsePlanBlocks(text.text);
            if (plan.errors.length > 0 || plan.fenceOpen !== undefined)
                throw new CommandError(EXIT.USAGE, `invalid progress plan: ${plan.errors.map((e) => e.message).join("; ") || "unclosed code fence"}`);
            groups = plan.groups.map((g) => g.group);
        }
    }
    const prior = run?.steps.filter((s) => s.status === "DONE") ?? [];
    const same = prior.filter((s) => s.step === r.step && (r.group === undefined || s.group === r.group));
    const soak = runOrStepField(runs, r.workflow, "debugMode") === "SOAK";
    const point = progressPoint(r.workflow, r.step, soak);
    const soakAttempt = Number(r.extras?.soakAttempt ?? runOrStepField(runs, r.workflow, "soakAttempt"));
    const challengeRound = Number(r.extras?.round ?? runOrStepField(runs, r.workflow, "round"));
    const attempt = point === "debug.soak" && Number.isSafeInteger(soakAttempt) && soakAttempt > 0
        ? soakAttempt
        : point === "debug.fix" && r.step === "debug-failure-remediate"
            ? allRunsDoneSteps(runs, r.workflow, { step: r.step }).length + 1
            : point === "build.challenge" && Number.isSafeInteger(challengeRound) && challengeRound > 0
                ? challengeRound
                : (r.attempt ?? same.at(-1)?.attempt);
    return runProgress({
        workflow: r.workflow,
        step: r.step,
        number,
        groups,
        group: r.group,
        attempt,
        max: point === undefined
            ? undefined
            : savedPointLimit(r.file, r.workflow, point, r.group, point === "debug.fix" || point === "debug.soak"),
    }).progressLine;
}
/** Exit code: a debug run on a shared branch has no shared-checkout record, so nothing was written or committed. */
export const EXIT_NO_RECORD = 14;
/**
 * A debug run on `dev` / `main` works in place, so its record must exist before
 * it writes or commits (`git add -A` there would carry work the run does not own).
 * Throws EXIT_NO_RECORD when the checkout is on a shared branch and `rec` is null.
 */
export function requireRecordOnShared(cwd, workflow, rec) {
    if (workflow !== "debug" || rec !== null)
        return;
    const branch = git(cwd, ["branch", "--show-current"]) ?? "";
    if (!isSharedBranch(branch))
        return;
    throw new CommandError(EXIT_NO_RECORD, `no shared-checkout record for this run on ${branch} — nothing written or committed (the record is gone or belongs to another run); a plain commit here would carry work the run does not own`);
}
/** Throws EXIT_COMMIT when git cannot name the index, before anything is written. */
function indexSnapshot(cwd) {
    const res = runGit(cwd, ["rev-parse", "--path-format=absolute", "--git-path", "index"]);
    if (!res.ok || res.stdout === "")
        throw new CommandError(EXIT_COMMIT, `nothing written: git cannot name the index: ${res.stderr}`);
    return {
        file: res.stdout,
        bytes: fs.existsSync(res.stdout) ? fs.readFileSync(res.stdout) : null,
    };
}
/**
 * Put the index back byte-for-byte as `snap` holds it, through git's own `index.lock`, so
 * a git command holding the lock is never overwritten. A refused commit wrote nothing, so
 * every path — staged before the attempt or by it, fully or partly — must read as it did:
 * a row left staged rides the next pathspec-less commit. Returns why it could not, or null.
 */
function restoreIndex(snap) {
    const lock = `${snap.file}.lock`;
    try {
        fs.writeFileSync(lock, snap.bytes ?? "", { flag: "wx" });
    }
    catch (err) {
        if (err.code !== "EEXIST")
            fs.rmSync(lock, { force: true });
        return `${lock} could not be taken: ${err.message}`;
    }
    if (snap.bytes !== null) {
        fs.renameSync(lock, snap.file);
        return null;
    }
    fs.rmSync(snap.file, { force: true });
    fs.rmSync(lock, { force: true });
    return null;
}
/**
 * Append one `step-done` row, then commit (parentSha first, the row, then the
 * commit — the order the fold's de-dup relies on). Returns the row and the new
 * commit; `code` is EXIT_COMMIT when the commit failed, and the appended row is
 * rolled back, so a re-run after the human's fix writes the same attempt once.
 * `code` is EXIT.NEEDS_HUMAN when the commit failed and the row stays in `r.file`
 * (another writer appended after it) or the index could not be put back.
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
        ...(r.group === undefined ? {} : { group: r.group }),
        ...(r.failures === undefined ? {} : { failures: r.failures }),
        ...(r.strategy === undefined ? {} : { strategy: r.strategy }),
        ...(r.extras ?? {}),
    };
    const progressLine = stepProgress(cwd, r);
    // An in-place run on a shared branch commits its own paths only; a refusal
    // comes before the append, so a re-run after the human's fix writes the row once.
    const fid = r.commit === "auto" ? fidOfStatusFile(r.file) : undefined;
    const rec = fid === undefined ? null : activeRecord(cwd, fid);
    if (r.commit === "auto")
        requireRecordOnShared(cwd, r.workflow, rec);
    if (rec !== null) {
        try {
            ownSet(cwd, rec);
        }
        catch (err) {
            if (!(err instanceof CommandError) || err.code !== EXIT_FOREIGN_PATH)
                throw err;
            log(`no row written to ${r.file}: the commit would be refused: ${err.message}`);
            return { row, commit: null, code: EXIT_FOREIGN_PATH };
        }
    }
    // A plain commit stages the whole tree, so the index is kept to be put back on failure.
    const snap = r.commit === "auto" && rec === null ? indexSnapshot(cwd) : null;
    fs.mkdirSync(path.dirname(r.file), { recursive: true });
    const existed = fs.existsSync(r.file);
    const line = appendLine(row);
    fs.appendFileSync(r.file, line);
    // A refused commit takes exactly this attempt's bytes back off `r.file`, so the step's
    // attempt is unchanged and a re-run after the human's fix lands the same attempt once.
    // Returns null once the row is off disk (or the file is gone), else why it stays.
    const rollback = () => {
        if (!fs.existsSync(r.file))
            return null;
        let body;
        try {
            body = fs.readFileSync(r.file);
        }
        catch (err) {
            return `it could not be read back: ${err.message}`;
        }
        const mine = Buffer.from(line);
        const tail = body.subarray(Math.max(0, body.length - mine.length));
        if (!tail.equals(mine))
            return "another writer appended to it after this attempt's row";
        if (!existed && body.length === mine.length)
            fs.rmSync(r.file, { force: true });
        else
            fs.truncateSync(r.file, body.length - mine.length);
        return null;
    };
    // The failure reason first, then the index and the file are put back: exit `code` means
    // nothing written, nothing committed; a row that cannot come off disk needs a human, as a
    // re-run would write it twice.
    const failed = (code, reason) => {
        log(reason);
        const index = snap === null ? null : restoreIndex(snap);
        if (index !== null)
            log(`the index could not be put back as it was: ${index}`);
        const kept = rollback();
        if (kept !== null) {
            log(`the step-done row stays in ${r.file}: ${kept}; nothing committed — remove that row before re-running`);
            return { row, commit: null, code: EXIT.NEEDS_HUMAN };
        }
        log(`no row written to ${r.file}: the row was rolled back`);
        return { row, commit: null, code: index === null ? code : EXIT.NEEDS_HUMAN };
    };
    if (r.commit === "none")
        return {
            row,
            commit: null,
            code: EXIT.OK,
            ...(progressLine === undefined ? {} : { progressLine }),
        };
    if (rec !== null) {
        let own;
        try {
            own = ownPathCommit(cwd, rec, r.message, { allowEmpty: true });
        }
        catch (err) {
            if (!(err instanceof CommandError) || err.code !== EXIT_FOREIGN_PATH)
                throw err;
            return failed(EXIT_FOREIGN_PATH, `the commit was refused: ${err.message}`);
        }
        if (!own.ok)
            return failed(EXIT_COMMIT, `the commit failed: ${own.error}`);
        return {
            row,
            commit: runGit(cwd, ["rev-parse", "HEAD"]).stdout,
            code: EXIT.OK,
            ...(progressLine === undefined ? {} : { progressLine }),
        };
    }
    const add = addAllButCopied(cwd);
    const made = add.ok ? runGit(cwd, ["commit", "--allow-empty", "-m", r.message]) : add;
    if (!made.ok)
        return failed(EXIT_COMMIT, `the commit failed: ${made.stderr || made.stdout}`);
    return {
        row,
        commit: runGit(cwd, ["rev-parse", "HEAD"]).stdout,
        code: EXIT.OK,
        ...(progressLine === undefined ? {} : { progressLine }),
    };
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
        const fid = normaliseFid(o.fid, tracker);
        add(`fid ${fid}`, fidProblem(fid, tracker, o.issue), o.issue === "" && tracker !== "none" ? "issue-less shape" : `${tracker} shape`);
        if (o.token !== undefined) {
            const root = repoRoot(cwd);
            const lock = workflowLockPath(root, resolveMonth(root, o.fid, o.month), o.fid);
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
    else if (o.issue !== undefined) {
        throw new CommandError(EXIT.USAGE, "--issue needs --fid");
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
    const rows = activeDoneSteps(runs, o.workflow, { step: o.step, group: o.group });
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
/**
 * `<step>:<next|current|count>[:all]` → the counter it names, from the active run, or
 * from every run of the workflow with `:all`.
 */
function derivedCounter(file, workflow, spec, group) {
    const [step, position, scope] = spec.split(":");
    if (!step ||
        !POSITIONS.includes(position ?? "") ||
        (scope !== undefined && scope !== "all")) {
        throw new CommandError(EXIT.USAGE, `"${spec}" must be <step>:<next|current|count>[:all]`);
    }
    const count = fs.existsSync(file)
        ? (scope === "all" ? allRunsDoneSteps : activeDoneSteps)(readRuns(file), workflow, {
            step,
            group,
        }).length
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
/**
 * Staged paths the tests step's commit may not carry: a modified or deleted file that is
 * not a TEST FIRST file of the group's open tasks, one of `allowed` (the step's artifacts
 * and the run's logs folder, as given) or a docs ledger; or an added file a CREATE line of
 * the plan names. Stages everything first, as the commit would.
 */
function sourceTouched(cwd, o) {
    const top = git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd;
    const rel = (p) => path.relative(top, path.resolve(cwd, p)).split(path.sep).join("/");
    const planText = fs.existsSync(o.plan) ? fs.readFileSync(o.plan, "utf-8") : "";
    const parsed = parsePlanBlocks(planText);
    const done = new Set(parsed.tasks.filter((t) => t.done).map((t) => t.task));
    const tests = new Set();
    for (const s of readTestFirst(planText, o.group))
        if (s.kind === "test" && !done.has(s.task))
            for (const t of s.tests)
                tests.add(t.test);
    const created = new Set(parsed.tasks.flatMap((t) => t.create.map((c) => c.file)));
    const allowed = o.allowed.map(rel);
    const under = (p) => allowed.some((a) => p === a || p.startsWith(`${a}/`));
    const own = (p) => tests.has(p) || under(p) || DOCS_ONLY.test(p);
    addAllButCopied(cwd);
    const out = runGit(cwd, ["diff", "--cached", "--name-status", "-z"]).stdout.split("\0");
    const source = [];
    for (let i = 0; i < out.length;) {
        const status = out[i] ?? "";
        if (status === "")
            break;
        const two = status.startsWith("R") || status.startsWith("C");
        const [a, b] = [out[i + 1] ?? "", two ? (out[i + 2] ?? "") : ""];
        i += two ? 3 : 2;
        const changed = status.startsWith("A") || status.startsWith("C") ? [] : [a];
        const added = status.startsWith("A") ? [a] : two ? [b] : [];
        for (const p of changed)
            if (!own(p))
                source.push(p);
        for (const p of added)
            if (created.has(p) && !tests.has(p))
                source.push(p);
    }
    return [...new Set(source)].sort();
}
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/**
 * Saved artifacts of a later attempt than `attempt`, for each pattern whose file name
 * holds `<attempt>`, matched with any number there. An artifact already committed at
 * `startSha` (the active run's start) belongs to an earlier run, so it does not count.
 */
function laterAttempts(cwd, patterns, attempt, startSha) {
    const later = [];
    for (const p of patterns) {
        const dir = path.dirname(p);
        const base = path.basename(p);
        if (isUrl(p) || !base.includes(ATTEMPT_TOKEN) || dir.includes(ATTEMPT_TOKEN))
            continue;
        const abs = path.resolve(cwd, dir);
        if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory())
            continue;
        const shape = new RegExp(`^${base.split(ATTEMPT_TOKEN).map(escapeRegex).join("([0-9]+)")}$`);
        for (const name of fs.readdirSync(abs)) {
            const n = (shape.exec(name)?.slice(1) ?? []).map(Number);
            if (n.length === 0 || n.some((x) => x !== n[0]) || n[0] <= attempt)
                continue;
            const rel = path.join(dir, name);
            if (startSha !== undefined && runGit(cwd, ["cat-file", "-e", `${startSha}:./${rel}`]).ok)
                continue;
            if (!later.some((l) => l.rel === rel))
                later.push({ rel, n: n[0] });
        }
    }
    return later.sort((a, b) => a.n - b.n || a.rel.localeCompare(b.rel)).map((l) => l.rel);
}
const isRecord = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
/** Dotted keys whose values differ between two `bkit.workflows` objects, sorted. */
export function changedKeys(a, b, at = "") {
    if (isRecord(a) && isRecord(b))
        return [...new Set([...Object.keys(a), ...Object.keys(b)])]
            .sort()
            .flatMap((k) => changedKeys(a[k], b[k], at === "" ? k : `${at}.${k}`));
    return JSON.stringify(a) === JSON.stringify(b) ? [] : [at === "" ? "bkit.workflows" : at];
}
/**
 * The `bkit.workflows` keys the working tree's package.json changes from HEAD's (`git add -A`
 * commits the working tree). Empty when either side cannot be read as JSON.
 */
/** True when the active shared-checkout record for `fid` holds `rel` as dirty before the run. */
function recordedPath(cwd, fid, rel) {
    const rec = fid === undefined ? null : activeRecord(cwd, fid);
    return rec !== null && rec.paths.some((p) => p.path === rel);
}
function workflowsChange(cwd) {
    const top = git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd;
    const file = path.join(top, "package.json");
    const head = runGit(top, ["cat-file", "-e", "HEAD:package.json"]).ok
        ? parseJson(runGit(top, ["show", "HEAD:package.json"]).stdout)
        : { ok: true, value: {} };
    const work = fs.existsSync(file)
        ? parseJson(fs.readFileSync(file, "utf-8"))
        : { ok: true, value: {} };
    if (!head.ok || !work.ok)
        return [];
    const workflows = (pkg) => (isRecord(pkg) && isRecord(pkg.bkit) ? pkg.bkit.workflows : undefined) ?? {};
    return changedKeys(workflows(head.value), workflows(work.value));
}
/** `soakAttempt` → `Soak Attempt`, for a comment header. */
const titleCase = (key) => key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
/** `<attempt>` filled in, once the attempt is known. */
const fill = (s, attempt) => attempt === undefined ? s : s.split(ATTEMPT_TOKEN).join(String(attempt));
const list = (v) => v ?? [];
async function finish(ctx) {
    const f = ctx.flags;
    const file = statusFile(ctx);
    const workflow = String(f.workflow);
    const step = String(f.step);
    const group = positiveInt(f.group, "group");
    const agents = list(f.agent);
    // Attempt: given, next from the log, or another step's counter.
    if ([f.attempt, f.attemptOf].filter((v) => v !== undefined).length > 1)
        throw new CommandError(EXIT.USAGE, "give --attempt or --attempt-of, not both");
    let attempt;
    let derived = false;
    if (f.attemptOf !== undefined) {
        attempt = derivedCounter(file, workflow, String(f.attemptOf), group);
        derived = true;
    }
    else if (f.attempt === "next") {
        attempt = derivedCounter(file, workflow, `${step}:next`, group);
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
        extras[spec.slice(0, eq)] = derivedCounter(file, workflow, spec.slice(eq + 1), group);
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
                // A `true | false` field is true when any agent sets it: one reviewer's flag is never outvoted.
                else if (v === "true" && fields[k] === "false")
                    fields[k] = v;
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
    if (workflow === "build" && step === "build-challenge") {
        try {
            extras.challengeFindings = mergeFindings(artifacts
                .filter((a) => !isUrl(a))
                .map((a) => parseFindings(fs.readFileSync(path.resolve(ctx.cwd, a), "utf-8"), a, ctx.cwd)), new Set()).findings.map(({ severity, location, title }) => ({ severity, location, title }));
        }
        catch (error) {
            extras.challengeFindings = null;
            ctx.log(`challenge findings unavailable: ${String(error)}; the original verdict remains unresolved until the report is corrected`);
        }
    }
    if (workflow === "debug" && step === "debug-failure-reproduce" && fields.Reproduced !== undefined)
        extras.reproduced = fields.Reproduced;
    const clampLog = str(f.clampLog);
    if (clampLog !== undefined) {
        const [clampStep, clampAttempt] = fill(clampLog, attempt).split(":");
        const fid = path.basename(path.dirname(file));
        extras.clamped = readRecords(clampLogPath(ctx.cwd, fid, clampStep, positiveInt(clampAttempt, "clamp-log attempt")), (l) => ctx.log(`skipping a malformed clamp record: ${l}`));
    }
    if (workflow === "debug" && step === "debug-run-tests") {
        const active = readRuns(file).at(-1);
        const rows = readStatusRows(file);
        const start = rows
            .map((r, i) => (r.type === "workflow-started" && r.workflow === "debug" ? i : -1))
            .filter((i) => i >= 0)
            .at(-1) ?? -1;
        const round = rows
            .slice(start + 1)
            .reverse()
            .find((r) => r.type === "test-run" &&
            r.workflow === workflow &&
            r.step === step &&
            r.attempt === attempt);
        if (extras.source === "ci" || round?.source === "ci") {
            const matching = active?.workflow === "debug" &&
                active.status === "IN_PROGRESS" &&
                round &&
                ciRoundMatches(round, active.ciSelection, active.ciGeneration) &&
                extras.source === "ci" &&
                extras.ciGeneration === active.ciGeneration &&
                verdict === "FAIL" &&
                failures === undefined &&
                extras.scope === round.scope &&
                artifacts.includes(String(round.artifact));
            if (!matching)
                throw new CommandError(EXIT.USAGE, "CI evidence does not match the active selection");
            const text = fs.readFileSync(path.resolve(ctx.cwd, String(round.artifact)), "utf-8");
            const required = [
                "Verdict: FAIL",
                "Source: ci",
                `Scope: ${round.scope}`,
                `Repository: ${round.repo}`,
                `Workflow: ${round.workflowPath} (${round.workflowId})`,
                `Run: ${round.ciRun}`,
                `Run attempt: ${round.runAttempt}`,
                `CI generation: ${round.ciGeneration}`,
                `Commit: ${round.headSha}`,
                `URL: ${round.ciUrl}`,
                "The local gate was not run.",
            ];
            if (!required.every((line) => text.split(/\r?\n/).includes(line)))
                throw new CommandError(EXIT.USAGE, "CI evidence artifact identity mismatch");
            delete extras.clamped;
        }
        else if ((clampLog !== undefined || round !== undefined) &&
            (!Array.isArray(extras.clamped) || extras.clamped.length === 0)) {
            throw new CommandError(EXIT.USAGE, "local test completion needs clamp evidence");
        }
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
    // A code step never edits a planned test case: each one's own lines must still be the
    // lines the group's tests step recorded at its red. Every other edit to the file is
    // ordinary code-step work the verifier reads in the diff. The holistic fix spans every group.
    if (workflow === "build" &&
        (((step === PLAN_TASKS_STEP || step === PLAN_REMEDIATE_STEP) && group !== undefined) ||
            step === PLAN_REMEDIATE_HOLISTIC_STEP)) {
        const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
        const tests = touchedTests(top, file, workflow, group);
        if (tests.length > 0) {
            const touched = [...new Set(tests.map((t) => t.test))];
            const named = tests.map((t) => `\`${t.test}\` "${t.name}"`).join(", ");
            const problem = `${named} differ${tests.length === 1 ? "s" : ""} from what the group's tests step recorded at its red: a code step never edits a planned test case — put ${tests.length === 1 ? "that test" : "those tests"} back as the tests step left ${tests.length === 1 ? "it" : "them"} (other edits to the file stay), or log the task BLOCKED naming the test and what it gets wrong (nothing written)`;
            ctx.log(problem);
            recordTestLockFriction(top, step, named);
            ctx.emit({
                pass: false,
                reask: agents.length ? { agent: agents[0], artifact: artifacts[0] } : null,
                problem,
                touched,
                tests,
            });
            return EXIT_TESTS_TOUCHED;
        }
    }
    // The tests step writes the group's tests: its commit may change those files, its own
    // artifacts and the run's logs only, and add files no CREATE line of the plan names.
    if (workflow === "build" && step === PLAN_TESTS_STEP && commit === "auto") {
        const planArg = str(f.plan);
        if (planArg === undefined)
            throw new CommandError(EXIT.USAGE, `--plan is required to finish ${PLAN_TESTS_STEP}`);
        if (group === undefined)
            throw new CommandError(EXIT.USAGE, `--group is required to finish ${PLAN_TESTS_STEP}`);
        const source = sourceTouched(ctx.cwd, {
            plan: path.resolve(ctx.cwd, planArg),
            group,
            allowed: [...artifacts, path.dirname(file)],
        });
        if (source.length > 0) {
            ctx.log(`the tests step changed ${source.join(", ")}: it writes the group's TEST FIRST files only — put the rest back (nothing written)`);
            ctx.emit({ pass: false, source });
            return EXIT_SOURCE_TOUCHED;
        }
    }
    // The attempt finished is the latest one this run saved artifacts for.
    if (attempt !== undefined) {
        const startSha = activeRunStart(file, workflow)?.parentSha;
        const later = laterAttempts(ctx.cwd, [...list(f.artifact), ...list(f.optionalArtifact)], attempt, typeof startSha === "string" && startSha !== "" ? startSha : undefined);
        if (later.length > 0) {
            ctx.log(`attempt ${attempt} is not the latest: this run saved ${later.join(", ")} after it — finish the latest attempt (nothing written)`);
            ctx.emit({ pass: false, attempt, later });
            return EXIT_LATER_ATTEMPT;
        }
    }
    // A run never changes its own limits: the step commit may not carry a bkit.workflows edit.
    // With a shared-checkout record the commit carries the run's own paths only, so a
    // package.json that was already dirty when the run started stays out of it: a recorded
    // one the run then changed is refused as foreign by the commit itself.
    if (commit === "auto" && !recordedPath(ctx.cwd, fidOfStatusFile(file), "package.json")) {
        const changed = workflowsChange(ctx.cwd);
        if (changed.length > 0) {
            ctx.log(`the step's commit would change bkit.workflows in package.json (${changed.join(", ")}): restore HEAD's values, then finish again (nothing written)`);
            ctx.emit({ pass: false, changed });
            return EXIT_WORKFLOWS_CHANGED;
        }
    }
    if (f.docsOnly === true && commit === "auto") {
        addAllButCopied(ctx.cwd);
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
    // The step's tracker comment: header fields in one fixed order.
    let comment = null;
    const number = str(f.number);
    if (number !== undefined) {
        const title = str(f.title);
        if (title === undefined)
            throw new CommandError(EXIT.USAGE, "--number needs --title");
        const count = str(f.groupCount);
        const header = [
            ...(verdict === undefined ? [] : [["Verdict", verdict]]),
            ...(failures === undefined ? [] : [["Failures", String(failures)]]),
            ...(scope === undefined ? [] : [["Scope", scope]]),
            ...(group === undefined
                ? []
                : [["Group", `${group}${count === undefined ? "" : `/${count}`}`]]),
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
    // --post: post, then record the engine-action row, then the step row and commit
    // carry both. A re-run with the same key and body is deduped, never posted twice.
    let tracker;
    if (f.post === true) {
        if (comment === null)
            throw new CommandError(EXIT.USAGE, "--post needs --number");
        const key = actionKey(workflow, fs.existsSync(file) ? runNumber(readRuns(file), workflow) : 1, step, group, attempt, "comment");
        tracker = await postForVerb(ctx, comment, {
            fid: fidOfStatusFile(file),
            file,
            key,
            purpose: step.endsWith("-decision") || verdict === "FAIL" || verdict === "HANDOVER"
                ? "attention"
                : "routine",
        });
    }
    const written = writeStepRow(ctx.cwd, {
        file,
        workflow,
        step,
        verdict,
        failures,
        attempt,
        group,
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
        group,
        attempt,
        artifacts,
        verdictRequired: false,
        allowed,
        placeholders: [],
    });
    const pass = checks.every((c) => c.ok);
    for (const c of checks.filter((x) => !x.ok))
        ctx.log(`${c.check}: ${c.detail}`);
    ctx.emit({
        verdict: verdict ?? null,
        failures: failures ?? null,
        attempt: attempt ?? null,
        fields,
        row: written.row,
        parentSha: written.row.parentSha,
        commit: written.commit,
        ...(written.progressLine === undefined ? {} : { progressLine: written.progressLine }),
        pass,
        checks,
        comment,
        // Written after the step's commit, so the commit never carries it.
        commentFile: commentFileOf(ctx.cwd, comment, ctx),
        ...(tracker === undefined ? {} : { tracker }),
    });
    if (written.code !== EXIT.OK)
        return written.code;
    return pass ? EXIT.OK : EXIT.NO;
}
// ---------------------------------------------------------------------------
// stub --result-file — an artifact rendered from one structured result
// ---------------------------------------------------------------------------
/**
 * Header fields the engine computes from the findings; every other declared field is a
 * judgment the result must supply (the evidence-dependent ones: Tasks, Redesign, Strategy ...).
 */
const DERIVED_FIELDS = {
    Failures: (f) => String(f.length),
    // `true` when any gap is fixable (the plan-verify header contract), `false` for none.
    Fixable: (f) => String(f.some((x) => x.fixable)),
};
/** The agent whose header is the audit summary (Status / Report / Findings), not a Verdict header. */
const AUDIT_AGENT = "bkit-audit-generate";
const withFingerprint = (head, body) => {
    const unsigned = `${head.join("\n")}\n${VERDICT_END}\n\n${body}`;
    const lines = unsigned.split("\n");
    const fingerprint = artifactFingerprint(lines, head.length);
    return `${head.join("\n")}\n${FINGERPRINT}: ${fingerprint}\n${VERDICT_END}\n\n${body}`;
};
const fingerprintOf = (text) => artifactFingerprint(text.split("\n"), text.split("\n").indexOf(VERDICT_END));
function renderAudit(result) {
    const entries = auditEntries(result);
    const totals = auditTotals(result.findings);
    const head = [
        `Status: ${result.status}`,
        `Report: ${result.report ?? "None"}`,
        `Findings: ${auditFindingsLine(totals)}`,
        `Issue: ${result.issue ?? "None"}`,
        `Parent: ${result.parent ?? "None"}`,
    ];
    const cell = (t) => t.replace(/\|/g, "\\|");
    const list = (items) => (items.length ? items.map((i) => `- ${i}`).join("\n") : "None");
    const body = [
        `# Audit Summary: ${result.slug}`,
        "",
        "## Stopped",
        "",
        result.stopped ?? "None",
        "",
        "## Overview",
        "",
        result.overview ?? "None",
        "",
        "## Suggested Issues",
        "",
        ...(entries.length
            ? [
                "| ID | Severity | Title | Location | Prior key |",
                "| --- | --- | --- | --- | --- |",
                ...entries.map((e) => `| ${e.id} | ${e.severity} | ${cell(e.title)} | \`${e.location}\` | ${e.priorKey ?? "none"} |`),
            ]
            : ["None"]),
        "",
        "## Not Checked",
        "",
        list(result.notChecked),
        "",
        "## Ledger",
        "",
        list(entries.map((e) => `\`${e.key}\` ${e.severity} OPEN`)),
        "",
    ].join("\n");
    const text = withFingerprint(head, body);
    return {
        text,
        fingerprint: fingerprintOf(text),
        extra: {
            ids: entries.map((e) => e.id),
            totals,
            ledgerRows: auditLedgerRows(result),
        },
    };
}
/**
 * The artifact for `agent` rendered from a structured result `{findings, judgments, body,
 * evidenceComplete}`: counts and booleans derived from the findings, judged fields passed
 * through and checked, a Fingerprint over the header and body. Throws a CommandError
 * (EXIT_INVALID) and writes nothing on any disagreement.
 */
export function renderResult(cwd, agent, raw) {
    const bad = (why) => new CommandError(EXIT_INVALID, `result: ${why}`);
    if (agent === AUDIT_AGENT) {
        try {
            return renderAudit(parseAuditResult(raw));
        }
        catch (err) {
            throw err instanceof CommandError ? bad(err.message) : err;
        }
    }
    if (raw === null || typeof raw !== "object" || Array.isArray(raw))
        throw bad("must be a JSON object");
    const r = raw;
    for (const k of Object.keys(r))
        if (!["findings", "judgments", "body", "evidenceComplete"].includes(k))
            throw bad(`unknown field "${k}"`);
    let findings;
    try {
        findings = structuredFindings(r["findings"] ?? [], cwd);
    }
    catch (err) {
        throw err instanceof CommandError ? bad(err.message) : err;
    }
    const judgments = r["judgments"] ?? {};
    if (judgments === null || typeof judgments !== "object" || Array.isArray(judgments))
        throw bad("judgments must be an object");
    const judged = new Map();
    for (const [k, v] of Object.entries(judgments)) {
        if (typeof v !== "string" && typeof v !== "number" && typeof v !== "boolean")
            throw bad(`judgment ${k} must be text, a number or a boolean`);
        judged.set(k, String(v));
    }
    const declared = promptHeader(agent);
    const names = new Set(["Verdict", ...declared.fields.map((f) => f.name)]);
    for (const k of judged.keys()) {
        if (!names.has(k))
            throw bad(`judgment ${k} is not a header field of ${agent}`);
        if (k in DERIVED_FIELDS)
            throw bad(`${k} is derived from the findings and cannot be supplied`);
    }
    const evidenceComplete = r["evidenceComplete"] !== false;
    const arithmetic = findings.length > 0
        ? "FAIL"
        : !evidenceComplete
            ? declared.verdicts.includes("CONCERNS")
                ? "CONCERNS"
                : "FAIL"
            : "PASS";
    const verdict = judged.get("Verdict") ?? arithmetic;
    if (!declared.verdicts.includes(verdict))
        throw bad(`Verdict ${verdict} is not ${declared.verdicts.join("|")}`);
    if (verdict === "PASS" && arithmetic !== "PASS")
        throw bad(findings.length > 0
            ? `Verdict PASS contradicts ${findings.length} finding(s)`
            : "Verdict PASS contradicts incomplete evidence");
    const head = [`Verdict: ${verdict}`];
    for (const f of declared.fields) {
        const value = DERIVED_FIELDS[f.name]?.(findings) ?? judged.get(f.name);
        if (value === undefined)
            throw bad(`${f.name} is a judgment the result must supply`);
        if (f.values && !f.values.includes(value))
            throw bad(`${f.name} ${value} is not ${f.values.join("|")}`);
        if (f.integer && !/^[0-9]+$/.test(value))
            throw bad(`${f.name} ${value} is not a non-negative integer`);
        head.push(`${f.name}: ${value}`);
    }
    const given = r["body"] ?? "";
    if (typeof given !== "string")
        throw bad("body must be text");
    if (given.split("\n").includes(VERDICT_END))
        throw bad(`body holds a ${VERDICT_END} line`);
    const log = findings.length > 0 && !/^## Findings Log\b/m.test(given)
        ? `\n${renderFindingsLog(findings)}\n`
        : "";
    const body = `${given.replace(/\n+$/, "")}\n${log}`;
    const text = withFingerprint(head, body.replace(/^\n+/, ""));
    return { text, fingerprint: fingerprintOf(text), extra: { findings: findings.length } };
}
function readResult(cwd, file) {
    const abs = path.resolve(cwd, file);
    if (!fs.existsSync(abs))
        throw new CommandError(EXIT_INVALID, `result: ${file} does not exist`);
    const parsed = parseJson(fs.readFileSync(abs, "utf-8"));
    if (!parsed.ok)
        throw new CommandError(EXIT_INVALID, `result: ${file} is not JSON`);
    return parsed.value;
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
    {
        name: "commit",
        type: "string",
        help: "auto (default: git add -A, never the worktree.copy entries, + commit) or none",
    },
    { name: "message", type: "string", help: "commit message (required unless --commit=none)" },
];
export const stepsCommand = {
    noun: "steps",
    summary: "Write a step's status row, finish a step in one call, read a verdict header, check a gate, seed an artifact header.",
    verbs: {
        done: {
            summary: "Append a step-done row and commit it (parentSha captured first).",
            use: "workflow",
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
                GROUP_FLAG,
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
                progressLine: "the exact chat progress line after a successful numbered completion",
            },
            textOmit: ["row"],
            exitCodes: {
                [EXIT_NO_STATUS]: "--attempt=next could not read status.jsonl",
                [EXIT_ARTIFACT]: "an --artifact is missing, empty, or outside the working directory",
                [EXIT_COMMIT]: "nothing written, nothing committed: the commit failed and the row was rolled back",
                [EXIT_FOREIGN_PATH]: "nothing written, nothing committed: a path that was dirty before an in-place run changed during it",
                [EXIT_NO_RECORD]: "a debug run on dev/main with no shared-checkout record: nothing written or committed",
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
                const group = positiveInt(f.group, "group");
                const commit = str(f.commit) ?? "auto";
                if (!["auto", "none"].includes(commit))
                    throw new CommandError(EXIT.USAGE, "--commit must be auto or none");
                const artifacts = list(f.artifact);
                const bad = artifacts.map((a) => artifactProblem(ctx.cwd, a)).filter(Boolean);
                if (bad.length > 0)
                    throw new CommandError(EXIT_ARTIFACT, bad.join("; "));
                const attempt = f.attempt === "next"
                    ? derivedCounter(file, workflow, `${step}:next`, group)
                    : nonNegativeInt(f.attempt, "attempt");
                const written = writeStepRow(ctx.cwd, {
                    file,
                    workflow,
                    step,
                    status: status,
                    verdict,
                    failures,
                    attempt,
                    group,
                    strategy,
                    artifacts,
                    extras: Object.fromEntries(list(f.field).map(extraField)),
                    parentSha: str(f.parentSha),
                    commit: commit,
                    message: str(f.message),
                }, ctx.log);
                ctx.emit({
                    row: written.row,
                    commit: written.commit,
                    ...(written.progressLine === undefined ? {} : { progressLine: written.progressLine }),
                });
                return written.code;
            },
        },
        finish: {
            summary: "End a step: read the verdict header(s), derive the attempt, check the gate, write the row, commit, print the tracker comment.",
            use: "workflow",
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
                    name: "count-field",
                    type: "string",
                    repeatable: true,
                    help: "key=<step>:<next|current|count>[:all] — a row field holding another counter; :all counts every run",
                },
                GROUP_FLAG,
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
                {
                    name: "plan",
                    type: "string",
                    help: `${PLAN_TESTS_STEP}: the plan file whose TEST FIRST lines bound the step's commit (required there with --commit=auto)`,
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
                {
                    ...POST_FLAG,
                    help: "post the comment (needs --number) to the issue the status file's FID names, before the row and commit; prints `tracker`",
                },
                { name: "group-count", type: "string", help: "y of the comment's Group x/y" },
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
                parentSha: "the row's parentSha: HEAD before the step's commit",
                commit: "the new commit's sha, or null with --commit=none",
                pass: "every gate check passed",
                progressLine: "the exact chat progress line after a successful numbered completion",
                checks: "[{check, ok, detail}] per gate check",
                comment: "the step's tracker comment body (with --number), else null",
                commentFile: COMMENT_FILE_OUTPUT,
                tracker: TRACKER_OUTPUT,
                reask: "verdict read failed, or a planned test was touched: {agent, artifact} to re-ask (exit 4 / 5 / 6 / 11 only)",
                problem: "why the verdict read failed, or which planned tests the code step touched (exit 4 / 5 / 6 / 11 only)",
                touched: "planned test files of the group that differ from the blob its tests step recorded (exit 11 only)",
                source: "files the tests step's commit would change that are not the group's TEST FIRST files, or add although a CREATE line names them (exit 15 only)",
                later: "artifacts of a later attempt this run saved (exit 12 only)",
                changed: "bkit.workflows keys the commit would change, dotted (exit 13 only)",
            },
            textOmit: ["row", { key: "checks", when: (_checks, out) => out.pass === true }],
            exitCodes: {
                [EXIT_NO_STATUS]: "status.jsonl is not valid NDJSON",
                [EXIT_EMPTY]: "an --agent's artifact is missing or empty (nothing written)",
                [EXIT_PENDING]: "an --agent's header still has a PENDING field — re-ask it (nothing written)",
                [EXIT_INVALID]: "an --agent's header is invalid (no verdict:end, a value outside its set, Failures disagreeing with Verdict) — re-ask it (nothing written)",
                [EXIT_ARTIFACT]: "an --artifact is missing, empty, or outside the working directory (nothing written)",
                [EXIT_COMMIT]: "nothing written, nothing committed: the commit failed and the row was rolled back",
                [EXIT_FOREIGN_PATH]: "nothing written, nothing committed: a path that was dirty before an in-place run changed during it",
                [EXIT_NO_RECORD]: "a debug run on dev/main with no shared-checkout record: nothing written or committed",
                [EXIT_OUTSIDE_DOCS]: "--docs-only and the step staged a file outside the artifact tree (nothing written)",
                [EXIT_TESTS_TOUCHED]: "build plan-execute / plan-gaps-remediate: a planned test case of the group differs from the lines its tests step recorded in status.jsonl (`tests`: [{test, name}]; `touched`: their files) — re-ask `reask.agent` to put that test back or log the task BLOCKED; other edits to the file stay (nothing written; an agent-rework friction row is appended)",
                [EXIT_LATER_ATTEMPT]: "this run saved an artifact of a later attempt (`later`) than the one finished (nothing written)",
                [EXIT_WORKFLOWS_CHANGED]: "the commit would change bkit.workflows in package.json (`changed` names the keys) (nothing written)",
                [EXIT_SOURCE_TOUCHED]: "build plan-tests: the tests step changed a file no TEST FIRST line of the group's open tasks names, or added one a CREATE line of the plan names (`source`) (nothing written)",
            },
            run: finish,
        },
        verdict: {
            summary: "Read an artifact's header down to <!-- verdict:end -->.",
            use: "by-hand",
            flags: [
                { name: "file", type: "string", required: true, help: "the subagent's artifact" },
                ...ALLOWED_FLAGS,
                {
                    name: "field",
                    type: "string",
                    repeatable: true,
                    help: "header field that must be present, e.g. Failures",
                },
                {
                    name: "result-file",
                    type: "string",
                    help: "with --agent: also require the artifact to be the render of this result (a changed result is stale)",
                },
            ],
            output: { verdict: "the Verdict value", fields: "every Key: value header field" },
            exitCodes: {
                [EXIT_EMPTY]: "artifact missing or empty",
                [EXIT_PENDING]: "a header field is still PENDING",
                [EXIT_INVALID]: "no verdict:end line, Verdict outside the allowed set, a required field missing, or a generated artifact whose Fingerprint no longer matches its header and body (stale) — re-prompt the subagent or regenerate it",
            },
            run: (ctx) => {
                const header = readHeader(path.resolve(ctx.cwd, String(ctx.flags.file)), allowedVerdicts(ctx.flags), list(ctx.flags.field));
                if (!header.ok) {
                    ctx.log(header.problem);
                    return header.code;
                }
                if (ctx.flags.resultFile !== undefined) {
                    if (ctx.flags.agent === undefined)
                        throw new CommandError(EXIT.USAGE, "--result-file needs --agent");
                    try {
                        const rendered = renderResult(ctx.cwd, String(ctx.flags.agent), readResult(ctx.cwd, String(ctx.flags.resultFile)));
                        if (header.fields[FINGERPRINT] !== rendered.fingerprint) {
                            ctx.log(`${String(ctx.flags.file)}: stale; it is not the render of ${String(ctx.flags.resultFile)} (Fingerprint mismatch)`);
                            return EXIT_INVALID;
                        }
                    }
                    catch (err) {
                        if (!(err instanceof CommandError) || err.code !== EXIT_INVALID)
                            throw err;
                        ctx.log(err.message);
                        return EXIT_INVALID;
                    }
                }
                ctx.emit({ verdict: header.verdict, fields: header.fields });
                return EXIT.OK;
            },
        },
        gate: {
            summary: "Mechanical gate checks for one step: placeholders, FID, lock, artifacts, verdict, status row (with its attempt / strategy / scope where the step writes them).",
            use: "workflow",
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
                GROUP_FLAG,
                {
                    name: "progress-number",
                    type: "string",
                    help: "render this completed numbered position without writing a status row",
                },
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
                {
                    name: "issue",
                    type: "string",
                    help: 'the run\'s issue id, or "" for a run with no issue (then the FID must be issue-less); needs --fid',
                },
                { name: "month", type: "string", help: "month bucket of the lock (with --token)" },
                {
                    name: "token",
                    type: "string",
                    help: "the workflow lock must be held with this token (needs --fid)",
                },
            ],
            output: {
                pass: "true when every check passed",
                checks: "[{check, ok, detail}] per check",
                progressLine: "with --progress-number: the exact chat progress line after the gate passes",
            },
            exitCodes: {
                [EXIT_NO_STATUS]: "status.jsonl missing (on disk, or on --ref), unreadable, or not valid NDJSON",
            },
            run: (ctx) => {
                const f = ctx.flags;
                const file = str(f.file) === undefined ? undefined : statusFile(ctx);
                const workflow = String(f.workflow);
                const group = positiveInt(f.group, "group");
                const progressNumber = positiveInt(f.progressNumber, "progress-number");
                if (progressNumber !== undefined &&
                    (!isResumable(workflow) ||
                        !WORKFLOW_STEPS[workflow].some((s) => s.number === progressNumber)))
                    throw new CommandError(EXIT.USAGE, "--progress-number is not a workflow step");
                if (progressNumber !== undefined && isResumable(workflow)) {
                    const step = String(f.step);
                    const recordedNumber = WORKFLOW_STEPS[workflow].find((s) => s.step === step)?.number;
                    const gateNumber = workflow === "ship" &&
                        (step === "ship-worktree-setup" || step === "ship-regression-guard")
                        ? 3
                        : workflow === "ship" && step === "ship-bookkeeping-push"
                            ? 9
                            : recordedNumber;
                    if (progressNumber !== recordedNumber && progressNumber !== gateNumber)
                        throw new CommandError(EXIT.USAGE, "--progress-number does not match the gated step");
                    if (file === undefined &&
                        (progressNumber !== 1 ||
                            !str(f.fid) ||
                            !/^[0-9]{6}$/.test(str(f.month) ?? "") ||
                            !str(f.token)))
                        throw new CommandError(EXIT.USAGE, "gate progress needs --file, or Step 1 with --fid, --month and --token");
                }
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
                    ? derivedCounter(file, workflow, String(f.attemptOf), group)
                    : nonNegativeInt(f.attempt, "attempt");
                const checks = gateChecks(ctx.cwd, {
                    file,
                    ref,
                    workflow,
                    step: String(f.step),
                    group,
                    attempt,
                    artifacts: list(f.artifact).map((a) => fill(a, attempt)),
                    verdictRequired: f.verdictRequired === true,
                    allowed: allowedVerdicts(f),
                    fid: str(f.fid),
                    issue: str(f.issue),
                    month: str(f.month),
                    token: str(f.token),
                    placeholders: list(f.placeholder),
                });
                const pass = checks.every((c) => c.ok);
                for (const c of checks.filter((x) => !x.ok))
                    ctx.log(`${c.check}: ${c.detail}`);
                const progressFile = file ??
                    path.resolve(ctx.cwd, "docs", "plans", str(f.month) ?? "", "logs", str(f.fid) ?? "", "status.jsonl");
                const progressLine = pass && progressNumber !== undefined
                    ? stepProgress(ctx.cwd, {
                        file: progressFile,
                        workflow,
                        step: String(f.step),
                        group,
                        attempt,
                        artifacts: [],
                        commit: "none",
                    }, progressNumber)
                    : undefined;
                ctx.emit({ pass, checks, ...(progressLine === undefined ? {} : { progressLine }) });
                return pass ? EXIT.OK : EXIT.NO;
            },
        },
        stub: {
            summary: "Seed a versioned artifact: copy the prior version, then put a PENDING verdict header on top.",
            use: "workflow",
            flags: [
                { name: "from", type: "string", help: "the prior versioned artifact (copy mode)" },
                { name: "to", type: "string", required: true, help: "the artifact to create" },
                {
                    name: "agent",
                    type: "string",
                    help: "with --result-file: the subagent whose header the result renders",
                },
                {
                    name: "result-file",
                    type: "string",
                    help: "render the artifact from this structured result JSON {findings, judgments, body, evidenceComplete} (audit: the audit result) instead of copying --from",
                },
                {
                    name: "strip-header",
                    type: "boolean",
                    help: "drop the prior version's own header (everything down to its <!-- verdict:end -->)",
                },
            ],
            output: {
                file: "the artifact written",
                stripped: "the prior header was dropped (copy mode)",
                fingerprint: "with --result-file: the Fingerprint header value",
                ids: "audit result: the report-local finding IDs, in report order",
                totals: "audit result: findings per severity",
                ledgerRows: "audit result: one failure ledger payload per finding, for `bkit ledgers append`",
                findings: "other results: the finding count",
            },
            exitCodes: {
                [EXIT_EMPTY]: "--from is missing or empty",
                [EXIT_INVALID]: "--result-file is unreadable or invalid, or a judgment contradicts the findings (nothing written)",
            },
            run: (ctx) => {
                if (ctx.flags.resultFile !== undefined) {
                    if (ctx.flags.from !== undefined)
                        throw new CommandError(EXIT.USAGE, "give --from or --result-file, not both");
                    if (ctx.flags.agent === undefined)
                        throw new CommandError(EXIT.USAGE, "--result-file needs --agent");
                    try {
                        const rendered = renderResult(ctx.cwd, String(ctx.flags.agent), readResult(ctx.cwd, String(ctx.flags.resultFile)));
                        const to = path.resolve(ctx.cwd, String(ctx.flags.to));
                        fs.mkdirSync(path.dirname(to), { recursive: true });
                        fs.writeFileSync(to, rendered.text);
                        ctx.emit({
                            file: String(ctx.flags.to),
                            fingerprint: rendered.fingerprint,
                            ...rendered.extra,
                        });
                        return EXIT.OK;
                    }
                    catch (err) {
                        if (!(err instanceof CommandError) || err.code !== EXIT_INVALID)
                            throw err;
                        ctx.log(err.message);
                        return EXIT_INVALID;
                    }
                }
                if (ctx.flags.from === undefined)
                    throw new CommandError(EXIT.USAGE, "give --from (copy) or --result-file");
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
