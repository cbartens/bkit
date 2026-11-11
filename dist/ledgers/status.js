// Contract + reducer for the bkit workflow status log.
//
// State is an append-only NDJSON event log (`status.jsonl`): one JSON event per
// line, prior lines NEVER mutated. `merge=union` (see `.gitattributes`) lets git
// auto-concatenate both branches' appended lines server-side, so a per-FID status
// log can never block a PR merge. Union may interleave or duplicate lines, so the
// reader (`fold`) de-dupes by identity and orders by `at` before reconstructing
// the run array.
//
// This module is the CANONICAL reference reducer. The bkit workflows execute an
// inline jq filter that mirrors `fold` exactly; this TS is the unit-tested source
// of truth for the fold semantics.
//
// `parentSha` is captured at step START via `git rev-parse HEAD`, BEFORE the
// step's own commit (if any). Forensic only — points to the commit that preceded
// this step's work, not the commit that resulted from it.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { parseJson } from "../shared/json.js";
export const CI_TIERS = ["static", "unit", "integration", "e2e", "live", "migration"];
/** Validate the whole saved selection before any reader treats it as evidence. */
export function validateCiSelection(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value))
        return false;
    const v = value;
    if (v.mode === "local")
        return typeof v.reason === "string" && v.reason.trim().length > 0;
    const stringField = (key) => (typeof v[key] === "string" ? v[key] : "");
    const repo = stringField("repo");
    const runId = stringField("runId");
    const branch = stringField("headBranch");
    return (v.mode === "ci" &&
        v.provider === "github" &&
        /^[A-Za-z0-9][A-Za-z0-9_.-]*\/[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(repo) &&
        /^[1-9][0-9]*$/.test(runId) &&
        Number.isSafeInteger(v.runAttempt) &&
        Number(v.runAttempt) > 0 &&
        stringField("runUrl") ===
            `https://github.com/${repo}/actions/runs/${runId}/attempts/${v.runAttempt}` &&
        /^[1-9][0-9]*$/.test(stringField("workflowId")) &&
        /^\.github\/workflows\/[^/]+\.ya?ml$/.test(stringField("workflowPath")) &&
        !stringField("workflowPath").includes("..") &&
        branch.length > 0 &&
        !branch.startsWith("-") &&
        !branch.startsWith("/") &&
        !branch.endsWith("/") &&
        !/[\s~^:?*\[\\\u0000-\u001f\u007f]/.test(branch) &&
        !branch.includes("..") &&
        !branch.includes("//") &&
        !branch.includes("@{") &&
        !branch.endsWith(".") &&
        branch.split("/").every((part) => !part.startsWith(".") && !part.endsWith(".lock")) &&
        /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(stringField("headSha")) &&
        ["failure", "timed_out", "startup_failure"].includes(stringField("conclusion")) &&
        Array.isArray(v.redTiers) &&
        v.redTiers.every((tier) => CI_TIERS.some((known) => known === tier)) &&
        typeof v.via === "string" &&
        v.via.trim().length > 0);
}
/** Transport and wording changes preserve the identity of the evidence. */
export function ciSelectionIdentity(selection) {
    return JSON.stringify(selection.mode === "local"
        ? ["local"]
        : [
            selection.provider,
            selection.repo.toLowerCase(),
            selection.workflowId,
            selection.workflowPath,
            selection.runId,
            selection.runAttempt,
            selection.headSha,
        ]);
}
export const CI_HANDOFF_RESULTS = [
    "none",
    "pending",
    "success",
    "failure",
    "provider-error",
];
export const CI_RETRIGGER_STATES = [
    "intended",
    "commit-created",
    "push-completed",
    "receipt-completed",
];
const SHA_RE = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;
const REPO_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]*\/[A-Za-z0-9][A-Za-z0-9_.-]*$/;
const isRecord = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isCount = (v) => Number.isSafeInteger(v) && Number(v) >= 0;
const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;
function validHandoffTarget(value) {
    if (!isRecord(value))
        return false;
    return (value.provider === "github" &&
        typeof value.repo === "string" &&
        REPO_RE.test(value.repo) &&
        (value.pr === null || (typeof value.pr === "string" && /^[1-9][0-9]*$/.test(value.pr))) &&
        typeof value.head === "string" &&
        SHA_RE.test(value.head) &&
        nonEmpty(value.branch));
}
function validRetrigger(value) {
    if (!isRecord(value))
        return false;
    const state = CI_RETRIGGER_STATES.find((s) => s === value.state);
    if (state === undefined)
        return false;
    if (typeof value.original !== "string" || !SHA_RE.test(value.original))
        return false;
    const sha = (k) => typeof value[k] === "string" && SHA_RE.test(value[k]);
    if (value.copy !== undefined && !sha("copy"))
        return false;
    if (state === "intended")
        return true;
    if (!sha("commit"))
        return false;
    if (state === "commit-created")
        return true;
    if (!nonEmpty(value.ref) || !sha("remote"))
        return false;
    if (state === "push-completed")
        return true;
    return nonEmpty(value.receipt);
}
/** Validate one `ci-handoff` row before any reader treats it as evidence. */
export function validateCiHandoffEvent(value) {
    if (!isRecord(value) || value.type !== "ci-handoff")
        return false;
    if (!nonEmpty(value.workflow) || !nonEmpty(value.at))
        return false;
    if (value.phase !== "poll" && value.phase !== "repoll")
        return false;
    if (!validHandoffTarget(value.target))
        return false;
    const o = value.observation;
    if (!isRecord(o))
        return false;
    if (!CI_HANDOFF_RESULTS.some((r) => r === o.result))
        return false;
    if (!isCount(o.attempts) || !isCount(o.errors) || o.errors > o.attempts)
        return false;
    if (value.retrigger !== undefined && !validRetrigger(value.retrigger))
        return false;
    return value.phase !== "repoll" || value.retrigger !== undefined;
}
/** Wording and transport do not change which target a handoff row is about. */
export function ciHandoffIdentity(target) {
    return JSON.stringify([
        target.provider,
        target.repo.toLowerCase(),
        target.pr,
        target.head,
        target.branch,
    ]);
}
/**
 * The cumulative handoff state of one target: de-dupes, orders by `at`, counts rows for other
 * targets as `stale` and rows whose cumulative counts go backwards as `invalid`.
 */
export function foldCiHandoff(rows, target) {
    const seen = new Set();
    const events = [];
    for (const row of rows) {
        if (!validateCiHandoffEvent(row))
            continue;
        const key = JSON.stringify(row);
        if (seen.has(key))
            continue;
        seen.add(key);
        events.push(row);
    }
    const ordered = events
        .map((e, i) => ({ e, i }))
        .sort((a, b) => (a.e.at < b.e.at ? -1 : a.e.at > b.e.at ? 1 : a.i - b.i))
        .map((x) => x.e);
    const want = ciHandoffIdentity(target);
    const state = {
        phase: "poll",
        attempts: 0,
        errors: 0,
        last: null,
        retrigger: null,
        retriggerBase: null,
        stale: 0,
        invalid: 0,
    };
    for (const e of ordered) {
        if (ciHandoffIdentity(e.target) !== want) {
            state.stale += 1;
            continue;
        }
        if (e.observation.attempts < state.attempts || e.observation.errors < state.errors) {
            state.invalid += 1;
            continue;
        }
        state.attempts = e.observation.attempts;
        state.errors = e.observation.errors;
        state.phase = e.phase;
        state.last = { result: e.observation.result, at: e.at };
        if (e.retrigger !== undefined) {
            state.retriggerBase ??= { attempts: e.observation.attempts, errors: e.observation.errors };
            state.retrigger = e.retrigger;
        }
    }
    return state;
}
/** Validate the bounded CI evidence variant without relaxing local exit codes. */
export function testRunProblem(value) {
    if (!value || typeof value !== "object")
        return "test-run must be an object";
    const r = value;
    const positive = (v) => Number.isSafeInteger(v) && Number(v) > 0;
    if (r.source === "ci") {
        if (r.workflow !== "debug" ||
            r.step !== "debug-run-tests" ||
            r.verdict !== "FAIL" ||
            r.exitCode !== null ||
            r.failures !== null ||
            r.gate !== null ||
            !positive(r.ciGeneration) ||
            !positive(r.runAttempt) ||
            typeof r.ciRun !== "string" ||
            !/^[1-9][0-9]*$/.test(r.ciRun) ||
            r.scope !== `ci:${r.ciRun}` ||
            typeof r.artifact !== "string" ||
            !r.artifact ||
            typeof r.repo !== "string" ||
            !/^[\w.-]+\/[\w.-]+$/.test(r.repo) ||
            r.ciUrl !== `https://github.com/${r.repo}/actions/runs/${r.ciRun}/attempts/${r.runAttempt}` ||
            typeof r.workflowId !== "string" ||
            !/^[1-9][0-9]*$/.test(r.workflowId) ||
            typeof r.workflowPath !== "string" ||
            !/^\.github\/workflows\/[^/]+\.ya?ml$/.test(r.workflowPath) ||
            typeof r.headSha !== "string" ||
            !/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(r.headSha))
            return "invalid CI evidence round";
        return null;
    }
    if (r.source !== undefined && r.source !== "local")
        return "invalid test source";
    if (!Number.isSafeInteger(r.exitCode) || Number(r.exitCode) < 0)
        return "local exitCode must be a non-negative integer";
    if (r.failures !== null && (!Number.isSafeInteger(r.failures) || Number(r.failures) < 0))
        return "invalid failure count";
    return null;
}
/** A round belongs to exactly one saved evidence generation. */
export function ciRoundMatches(row, selection, generation) {
    return (validateCiSelection(selection) &&
        selection.mode === "ci" &&
        testRunProblem(row) === null &&
        row.source === "ci" &&
        row.ciGeneration === generation &&
        row.ciRun === selection.runId &&
        row.runAttempt === selection.runAttempt &&
        row.ciUrl === selection.runUrl &&
        row.repo === selection.repo &&
        row.workflowId === selection.workflowId &&
        row.workflowPath === selection.workflowPath &&
        row.headSha === selection.headSha);
}
// Identity for de-dup under union merge. `step-done` is unique per
// (workflow, step, parentSha, at); workflow-level events per (type, workflow, at).
function identity(e) {
    if (e.type === "step-done")
        return `S\u0000${e.workflow}\u0000${e.step}\u0000${e.parentSha}\u0000${e.at}${e.ciGeneration === undefined ? "" : `\u0000${e.status}\u0000${e.ciGeneration}`}`;
    if (e.type === "workflow-meta" && e.ciSelection !== undefined)
        return `M\u0000${e.workflow}\u0000${e.at}\u0000${e.ciGeneration}\u0000${JSON.stringify(e.ciSelection)}`;
    return `W\u0000${e.type}\u0000${e.workflow}\u0000${e.at}`;
}
// Index of the most-recent run matching `workflow`, or -1.
function lastIndexOfWorkflow(runs, workflow) {
    for (let i = runs.length - 1; i >= 0; i--)
        if (runs[i].workflow === workflow)
            return i;
    return -1;
}
// Strip routing fields to recover the bare `Step`.
function toStep(e) {
    const { type: _t, workflow: _w, ...step } = e;
    return step;
}
// Fold the event log into the run array. De-dupes
// (keeping first occurrence), then orders by `at` (stable), then reduces.
export function fold(events) {
    const seen = new Set();
    const deduped = events.filter((e) => {
        const k = identity(e);
        if (seen.has(k))
            return false;
        seen.add(k);
        return true;
    });
    // Stable sort by `at` (Array.prototype.sort is stable in modern engines).
    const ordered = deduped
        .map((e, i) => ({ e, i }))
        .sort((a, b) => (a.e.at < b.e.at ? -1 : a.e.at > b.e.at ? 1 : a.i - b.i))
        .map((x) => x.e);
    const runs = [];
    for (const e of ordered) {
        if (e.type === "workflow-started") {
            runs.push({ workflow: e.workflow, startedAt: e.at, status: "IN_PROGRESS", steps: [] });
        }
        else if (e.type === "step-done") {
            const i = lastIndexOfWorkflow(runs, e.workflow);
            if (i < 0) {
                runs.push({
                    workflow: e.workflow,
                    startedAt: e.at,
                    status: "IN_PROGRESS",
                    steps: [toStep(e)],
                });
            }
            else {
                runs[i].steps.push(toStep(e));
            }
        }
        else if (e.type === "workflow-meta") {
            const i = lastIndexOfWorkflow(runs, e.workflow);
            if (i >= 0) {
                const { type: _t, workflow: _w, at: _a, ...meta } = e;
                Object.assign(runs[i], meta);
            }
        }
        else if (e.type === "workflow-done" || e.type === "workflow-failed") {
            const i = lastIndexOfWorkflow(runs, e.workflow);
            if (i >= 0)
                runs[i].status = e.type === "workflow-done" ? "DONE" : "FAILED";
        }
    }
    return runs;
}
/** True for a parsed `status.jsonl` row that is a complete `invocation` event. */
export function isInvocationEvent(value) {
    if (value === null || typeof value !== "object")
        return false;
    const v = value;
    return (v["type"] === "invocation" &&
        typeof v["id"] === "string" &&
        typeof v["workflow"] === "string" &&
        typeof v["step"] === "string" &&
        typeof v["number"] === "number" &&
        typeof v["title"] === "string" &&
        typeof v["run"] === "number" &&
        typeof v["statusPath"] === "string" &&
        typeof v["bookRoot"] === "string" &&
        typeof v["worktree"] === "string");
}
// Serialize one event to the NDJSON line appended to `status.jsonl`, newline included.
export function appendLine(event) {
    return `${JSON.stringify(event)}\n`;
}
// ---------------------------------------------------------------------------
// Queries — the reads routing and counters make. Two opposite scopings: attempt
// counts and verdict/failures/mode reads look at the ACTIVE
// run only, so a resumed run never inherits a finished run's spent budget;
// strategy reads ALL runs, so a resumed run keeps its place on the
// STANDARD -> PIVOT -> FINAL ladder instead of restarting it.
// ---------------------------------------------------------------------------
/** `status.jsonl` timestamp: UTC, whole seconds (`date -u +%FT%TZ`). */
export const statusTimestamp = (now = new Date()) => now.toISOString().replace(/\.\d{3}Z$/, "Z");
/** The latest run of `workflow` — the active one. */
export function lastRun(runs, workflow) {
    const i = lastIndexOfWorkflow(runs, workflow);
    return i < 0 ? undefined : runs[i];
}
const matches = (s, f) => s.step === f.step &&
    s.status === "DONE" &&
    (f.group === undefined || (s.group ?? s.subPlan) === f.group);
/** DONE rows for the step in the active run of `workflow`. */
export function activeDoneSteps(runs, workflow, f) {
    const run = lastRun(runs, workflow);
    if (!run)
        return [];
    return run.steps.filter((s) => matches(s, f));
}
/** A check round that found no problems: verdict PASS, or CONCERNS with 0 failures. */
export const cleanRound = (s) => s.status === "DONE" && (s.verdict === "PASS" || (s.verdict === "CONCERNS" && s.failures === 0));
/** The active run's last clean round of `step` (`cleanRound`); undefined when none ran. */
export function lastCleanRound(runs, workflow, step) {
    return lastRun(runs, workflow)
        ?.steps.filter((s) => s.step === step && cleanRound(s))
        .at(-1);
}
/** `activeDoneSteps` after `clean`'s last clean round: the rounds of the loop still open. */
export function activeDoneStepsSinceClean(runs, workflow, f, clean) {
    const run = lastRun(runs, workflow);
    if (!run)
        return [];
    const last = lastCleanRound(runs, workflow, clean);
    return run.steps
        .slice(last === undefined ? 0 : run.steps.indexOf(last) + 1)
        .filter((s) => matches(s, f));
}
/** DONE rows for the step across ALL runs of `workflow`: debug's limits span every run. */
export function allRunsDoneSteps(runs, workflow, f) {
    return runs
        .filter((r) => r.workflow === workflow)
        .flatMap((r) => r.steps.filter((s) => matches(s, f)));
}
/** The last DONE row for the step across ALL runs of `workflow`. */
export function lastDoneStepAllRuns(runs, workflow, f) {
    return runs
        .filter((r) => r.workflow === workflow)
        .flatMap((r) => r.steps)
        .filter((s) => matches(s, f))
        .at(-1);
}
/**
 * Which run of `workflow` this invocation is (1-based): the count of its runs,
 * plus one unless the latest of them is still IN_PROGRESS — a resume, even after
 * another workflow's run. Same answer before and after the run's `workflow-started` row lands.
 */
export function runNumber(runs, workflow) {
    const n = runs.filter((r) => r.workflow === workflow).length;
    return lastRun(runs, workflow)?.status === "IN_PROGRESS" ? n : n + 1;
}
/**
 * A run-level field of the active run (merged from `workflow-meta`) when set,
 * else the last step that carries it. "" when neither does.
 */
export function runOrStepField(runs, workflow, field) {
    const run = lastRun(runs, workflow);
    if (!run)
        return "";
    const own = run[field];
    if (typeof own === "string" && own !== "")
        return own;
    const fromStep = run.steps
        .map((s) => s[field])
        .filter((v) => v !== undefined && v !== null && v !== "")
        .at(-1);
    return fromStep === undefined ? "" : String(fromStep);
}
// ---------------------------------------------------------------------------
// engine-action rows — an engine action unsafe to repeat (a tracker comment, a
// marker commit, a CI re-trigger, a PR open) records itself here and is checked
// first, so a re-run of the same block does not do it twice. Actions safe to
// repeat (a label already set) record nothing. The fold and every status reader
// skip the type.
// ---------------------------------------------------------------------------
export const ENGINE_ACTION = "engine-action";
/** The `key` of an engine-action row: its parts joined by `/`, an absent part as `-`. */
export const actionKey = (...parts) => parts.map((p) => (p === undefined || p === null || p === "" ? "-" : String(p))).join("/");
/** sha256 hex of an action's body or payload. */
export const actionHash = (payload) => createHash("sha256").update(payload).digest("hex");
/** The engine-action rows of `file`; a missing file or a malformed line reads as none. */
function engineActions(file) {
    if (!fs.existsSync(file))
        return [];
    const out = [];
    for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
        if (line.trim() === "")
            continue;
        const parsed = parseJson(line);
        if (!parsed.ok)
            continue;
        const r = parsed.value;
        if (r?.type === ENGINE_ACTION && typeof r.key === "string" && typeof r.hash === "string")
            out.push(r);
    }
    return out;
}
/**
 * The row recording this action already done (same key, same hash), or undefined.
 * Same key with a different hash is a deliberate edit: act again.
 */
export function alreadyDone(file, key, hash) {
    return engineActions(file)
        .filter((r) => r.key === key && r.hash === hash)
        .at(-1);
}
/** Append the engine-action row for an action just done; returns the row. */
export function recordAction(file, a) {
    const row = { type: ENGINE_ACTION, ...a, at: statusTimestamp() };
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, appendLine(row));
    return row;
}
// ---------------------------------------------------------------------------
// Ledger operations — a bookkeeping write that must survive a lost response. One
// operation id names one request (its hash): the same id and hash replays the
// original receipt, the same id with another hash is refused, and a new id on the
// same ledger key is a deliberate later update. This is stricter than the generic
// action policy above, where the same key with a changed hash acts again.
// ---------------------------------------------------------------------------
/**
 * The operations store of one book root: `<git common dir>/bkit-outbox/ledger-operations/<root hash>.jsonl`.
 * It holds prepared row bytes, so it stays private (0700 dirs, 0600 file) and outside every committed
 * or unioned path. One file per book root keeps a linked worktree's offsets apart from the main
 * checkout's. Null outside a git repository.
 */
export function ledgerOperationsFile(root, prepare = false) {
    // Not `commands/lib.ts`: that module imports this one.
    const res = spawnSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
        cwd: root,
        encoding: "utf-8",
    });
    const common = res.status === 0 ? res.stdout.trim() : "";
    if (common === "")
        return null;
    const outbox = path.join(common, "bkit-outbox");
    const id = createHash("sha256").update(fs.realpathSync(root)).digest("hex").slice(0, 16);
    const file = path.join(outbox, "ledger-operations", `${id}.jsonl`);
    if (prepare)
        privateDir(file);
    return file;
}
/** Create the private directory chain of `file`'s parent (0700). */
function privateDir(file) {
    fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
}
/** Intents on `target` of this root with no receipt; none when there is no store. */
export function pendingLedgerIntentsFor(root, target) {
    const ops = ledgerOperationsFile(root);
    return ops === null ? [] : pendingLedgerIntents(ops, target);
}
const ledgerOpKey = (operation) => actionKey("ledger-op", operation);
/** The status rows of one bounded correction: a guaranteed no-write rejection, a corrected retry, its success. */
export const CORRECTION_REJECTED_ROW = "correction-rejected";
export const CORRECTION_CANDIDATE_ROW = "correction-candidate";
export const CORRECTION_SUCCEEDED_ROW = "correction-succeeded";
/**
 * The stable scope one rejected sub-step's corrected retries share: derived from the run, step,
 * task group and attempt, the ledger and the sub-step, never from an invocation or operation id,
 * so a new tool call, helper or resume spends from the same budget.
 */
export function correctionScope(o) {
    return [
        "ledgers-append",
        o.ledger,
        o.substep,
        o.workflow,
        `run${o.run ?? 0}`,
        o.step,
        ...(o.group === null ? [] : [`group${o.group}`]),
        ...(o.attempt === null ? [] : [`attempt${o.attempt}`]),
    ].join(":");
}
/** Where `operation` stands in `file`: unseen, done with this request, or used for another. */
export function ledgerOperation(file, operation, hash) {
    const known = engineActions(file)
        .filter((r) => r.key === ledgerOpKey(operation))
        .at(0);
    if (known === undefined)
        return { state: "new" };
    return { state: known.hash === hash ? "replay" : "conflict", row: known };
}
/**
 * Record the receipt of a finished ledger operation. A known operation with the same
 * hash returns its original row unchanged; one with another hash throws and writes nothing.
 * `detail` rides on the row so a replay can return the original effect.
 */
export function recordLedgerOperation(file, a) {
    const known = ledgerOperation(file, a.operation, a.hash);
    if (known.state === "conflict")
        throw new Error(`ledger operation ${a.operation} was already used for a different request`);
    if (known.state === "replay")
        return known.row;
    const row = {
        ...recordRow({
            action: "ledger-append",
            key: ledgerOpKey(a.operation),
            hash: a.hash,
            ref: a.ref,
        }),
        ...(a.detail === undefined ? {} : { detail: a.detail }),
    };
    privateDir(file);
    fs.appendFileSync(file, appendLine(row), { mode: 0o600 });
    return row;
}
const recordRow = (a) => ({ type: ENGINE_ACTION, ...a, at: statusTimestamp() });
function intentRows(file) {
    if (!fs.existsSync(file))
        return [];
    const out = [];
    for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
        if (line.trim() === "")
            continue;
        const parsed = parseJson(line);
        if (!parsed.ok)
            continue;
        const r = parsed.value;
        if (r?.type === "ledger-intent" && typeof r.operation === "string")
            out.push(r);
    }
    return out;
}
/** Record the prepared bytes of an operation before writing them. */
export function recordLedgerIntent(file, intent) {
    privateDir(file);
    const row = { type: "ledger-intent", ...intent, at: statusTimestamp() };
    fs.appendFileSync(file, `${JSON.stringify(row)}\n`, { mode: 0o600 });
}
/** The latest prepared intent of `operation`, or undefined. */
export function ledgerIntent(file, operation) {
    return intentRows(file)
        .filter((i) => i.operation === operation)
        .at(-1);
}
/** Intents on `target` (relative path) whose operation has no receipt: effects not yet confirmed. */
export function pendingLedgerIntents(file, target) {
    const receipted = new Set(engineActions(file).map((r) => r.key));
    const latest = new Map();
    for (const i of intentRows(file))
        latest.set(i.operation, i);
    return [...latest.values()].filter((i) => i.file === target && !receipted.has(ledgerOpKey(i.operation)));
}
/** Create `file` holding `content` only if absent; false when it exists. Other errors throw. */
export function createExclusive(file, content) {
    let fd;
    try {
        fd = fs.openSync(file, "wx");
    }
    catch (err) {
        // EEXIST is the expected "someone holds it" answer; anything else is a real error.
        if (err.code === "EEXIST")
            return false;
        throw err;
    }
    try {
        fs.writeSync(fd, content);
    }
    finally {
        fs.closeSync(fd);
    }
    return true;
}
const sleepSync = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
/** How long a writer waits for another writer's lock on a ledger before refusing. */
export const TARGET_LOCK_WAIT_MS = 10_000;
/**
 * Run `fn` holding the exclusive lock on `target` (`<target>.bkit-lock`). A holder that
 * does not release in time is never reclaimed: the call throws, naming the lock file.
 */
export function withTargetLock(target, fn, waitMs = TARGET_LOCK_WAIT_MS) {
    const lock = `${target}.bkit-lock`;
    const token = `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    fs.mkdirSync(path.dirname(lock), { recursive: true });
    const body = JSON.stringify({ pid: process.pid, at: statusTimestamp(), token });
    const deadline = Date.now() + waitMs;
    while (!createExclusive(lock, body)) {
        if (Date.now() >= deadline) {
            const holder = fs.existsSync(lock) ? fs.readFileSync(lock, "utf-8").trim() : "unknown";
            throw new Error(`ledger target ${target} is locked by another writer (${holder}); if that process is gone, remove ${lock}`);
        }
        sleepSync(20);
    }
    try {
        return fn();
    }
    finally {
        const held = fs.existsSync(lock) ? fs.readFileSync(lock, "utf-8") : "";
        if (held === body)
            fs.rmSync(lock, { force: true });
    }
}
/** Append `block` to `target` at exactly `offset`, flush it and read it back; throws on any mismatch. */
export function writePrepared(target, block, offset) {
    const size = fs.existsSync(target) ? fs.statSync(target).size : 0;
    if (size !== offset)
        throw new Error(`ledger ${target} changed since the append was prepared (${size} != ${offset})`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const fd = fs.openSync(target, "a");
    try {
        fs.writeSync(fd, block);
        fs.fsyncSync(fd);
    }
    finally {
        fs.closeSync(fd);
    }
    const bytes = Buffer.byteLength(block);
    const back = Buffer.alloc(bytes);
    const rd = fs.openSync(target, "r");
    try {
        fs.readSync(rd, back, 0, bytes, offset);
    }
    finally {
        fs.closeSync(rd);
    }
    if (back.toString("utf-8") !== block)
        throw new Error(`ledger ${target} read-back disagrees with the bytes just written`);
}
/**
 * The one lock-and-confirm append: under the target lock, read the current text, let
 * `prepare` build the rows to add, write them (a missing final newline is closed first)
 * and flush and read them back. Returns where the bytes landed.
 */
export function appendLocked(target, prepare, hooks = {}) {
    return withTargetLock(target, () => appendHeld(target, prepare, hooks));
}
/** {@link appendLocked} for a caller that already holds the target lock. */
export function appendHeld(target, prepare, hooks = {}) {
    {
        const current = fs.existsSync(target) ? fs.readFileSync(target, "utf-8") : "";
        const body = prepare(current);
        const block = `${current !== "" && !current.endsWith("\n") ? "\n" : ""}${body}`;
        const offset = Buffer.byteLength(current);
        hooks.prepared?.({ offset, block });
        hooks.checkpoint?.("prepared");
        writePrepared(target, block, offset);
        const bytes = Buffer.byteLength(block);
        hooks.checkpoint?.("written");
        hooks.written?.({ offset, bytes, block });
        hooks.checkpoint?.("receipted");
        return { offset, bytes, block };
    }
}
/** Next rung: none -> STANDARD -> PIVOT -> FINAL, and FINAL stays FINAL. */
export function nextStrategy(prior) {
    if (prior === undefined)
        return "STANDARD";
    return prior === "STANDARD" ? "PIVOT" : "FINAL";
}
