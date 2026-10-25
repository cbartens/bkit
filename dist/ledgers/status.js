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
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { parseJson } from "../shared/json.js";
// Identity for de-dup under union merge. `step-done` is unique per
// (workflow, step, parentSha, at); workflow-level events per (type, workflow, at).
function identity(e) {
    if (e.type === "step-done")
        return `S\u0000${e.workflow}\u0000${e.step}\u0000${e.parentSha}\u0000${e.at}`;
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
 * plus one unless the latest run overall is one of them still IN_PROGRESS — a
 * resume. Same answer before and after the run's `workflow-started` row lands.
 */
export function runNumber(runs, workflow) {
    const n = runs.filter((r) => r.workflow === workflow).length;
    const latest = runs.at(-1);
    return latest?.workflow === workflow && latest.status === "IN_PROGRESS" ? n : n + 1;
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
/** Next rung: none -> STANDARD -> PIVOT -> FINAL, and FINAL stays FINAL. */
export function nextStrategy(prior) {
    if (prior === undefined)
        return "STANDARD";
    return prior === "STANDARD" ? "PIVOT" : "FINAL";
}
