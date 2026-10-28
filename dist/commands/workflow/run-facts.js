// The measured blocks of a workflow run's `outcome` row (`.bkit/core/.bkit/jsonl.md`
// § Shared blocks): lines, steps, ci, plan and build, from git, the run's
// `status.jsonl` rows and its log folder. bkit's unshipped harvest script
// (`scripts/harvest/bkit-harvest.mjs`) computes the same blocks for its `run` rows, with the same rules.
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { foldFrom, } from "../../ledgers/telemetry.js";
import { parseJson, readDirNames, readJsonFile, readTextFile } from "../../shared/json.js";
import { git } from "../lib.js";
import { appendLedgerRows } from "./ledgers.js";
import { readStatusEvents } from "./status.js";
import { parsePlanBlocks } from "./plan-blocks.js";
import { readTestFirst } from "./tests.js";
const msOf = (iso) => (typeof iso === "string" ? Date.parse(iso) : NaN);
/** Minutes to one decimal. */
export const minutesOf = (ms) => Math.round(ms / 6000) / 10;
/** `start` to `end`, unix ms. */
export function timeBlock(start, end) {
    return { start, end, totalMinutes: minutesOf(end - start) };
}
/** Left out of a run's line counts: plans and run logs, and the ledgers. */
const LINES_EXCLUDE = [
    ":(exclude)docs/plans/**",
    ":(exclude,glob)docs/*.jsonl",
    ":(exclude,glob).bkit/*.jsonl",
];
const TEST_PATH = /(^|\/)(__tests__|tests?|spec|e2e)\/|[._-](test|spec)\.[^/]+$|_test\.[^/]+$|(^|\/)test_[^/]+\.py$/i;
const DOCS_PATH = /\.mdx?$|(^|\/)docs\//i;
/** `code`, `tests` or `docs`, from a changed file's path. */
export const lineClass = (file) => TEST_PATH.test(file) ? "tests" : DOCS_PATH.test(file) ? "docs" : "code";
/**
 * Lines changed from `first` to `last`, cut at each merge on the first-parent
 * chain (a dev sync) so merged-in work is not counted, each stretch diffed on its
 * own. Null when git lacks either commit or `first` is not an ancestor of `last`.
 */
export function runLines(cwd, first, last) {
    if (!first || !last)
        return null;
    if (git(cwd, ["merge-base", "--is-ancestor", first, last]) === null)
        return null;
    const chain = git(cwd, [
        "rev-list",
        "--first-parent",
        "--reverse",
        "--parents",
        `${first}..${last}`,
    ]);
    if (chain === null)
        return null;
    const stretches = [];
    let from = first;
    for (const line of chain.split("\n").filter(Boolean)) {
        const [sha, parent, ...merged] = line.split(" ");
        if (merged.length === 0)
            continue;
        stretches.push([from, parent]);
        from = sha;
    }
    stretches.push([from, last]);
    const blank = () => ({ added: 0, deleted: 0, files: 0 });
    const parts = { code: blank(), tests: blank(), docs: blank() };
    for (const [a, b] of stretches) {
        if (a === b)
            continue;
        const stat = git(cwd, ["diff", "--numstat", a, b, "--", ".", ...LINES_EXCLUDE]);
        if (stat === null)
            return null;
        for (const line of stat.split("\n").filter(Boolean)) {
            const [added, deleted, file] = line.split("\t");
            const c = parts[lineClass(file ?? "")];
            c.files++;
            // Binary files: `-` for both counts.
            if (added !== "-") {
                c.added += Number(added);
                c.deleted += Number(deleted);
            }
        }
    }
    const sum = (k) => parts.code[k] + parts.tests[k] + parts.docs[k];
    const added = sum("added");
    const deleted = sum("deleted");
    return {
        total: { added, deleted, changed: added + deleted, files: sum("files") },
        ...parts,
        merges: stretches.length - 1,
    };
}
/** The run's status rows of `workflow` from its start row on, in `at` order. */
export function runStatusRows(events, workflow, startAt) {
    return events
        .filter((e) => e.workflow === workflow && typeof e.at === "string" && e.at >= startAt)
        .sort((a, b) => msOf(a.at) - msOf(b.at));
}
/** Per step: its step-done rows and the minutes since the row before each, `MARK_ROWS` skipped. */
export function stepsBlock(all) {
    const rows = all.filter((r) => !MARK_ROWS.has(r.type));
    const ms = {};
    for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (r.type !== "step-done" || typeof r.step !== "string")
            continue;
        const s = (ms[r.step] ??= { n: 0, ms: 0 });
        s.n++;
        s.ms += Math.max(0, msOf(r.at) - msOf(rows[i - 1].at));
    }
    const byStep = Object.fromEntries(Object.entries(ms).map(([k, v]) => [k, { n: v.n, totalMinutes: minutesOf(v.ms) }]));
    const parts = Object.values(byStep);
    return {
        total: {
            n: parts.reduce((a, p) => a + p.n, 0),
            totalMinutes: Math.round(parts.reduce((a, p) => a + p.totalMinutes, 0) * 10) / 10,
        },
        byStep,
    };
}
/** Every close step's CI dispatch, in order. */
export function ciList(rows) {
    return rows
        .filter((r) => r.type === "step-done" && /-close-workflow$/.test(String(r.step ?? "")))
        .map((r) => r.ciDispatch)
        .filter((d) => d !== undefined && d !== null)
        .map((d) => ciEntry(d));
}
/** One `ciDispatch` value as a `ci` entry. */
export function ciEntry(d) {
    return {
        status: typeof d.outcome === "string" ? d.outcome : null,
        reason: typeof d.reason === "string" ? d.reason : null,
        attempts: typeof d.attempts === "number" ? d.attempts : null,
    };
}
const kbOf = (file) => Math.round(fs.statSync(file).size / 1024);
/**
 * Per task group, per task: its TEST FIRST tests and distinct test files; null when the
 * task has no such field.
 */
export function planTasks(text) {
    return parsePlanBlocks(text).groups.map((g) => readTestFirst(text, g.group).map((s) => s.kind === "test"
        ? { tests: s.tests.length, testFiles: new Set(s.tests.map((t) => t.test)).size }
        : s.kind === "missing"
            ? { tests: null, testFiles: null }
            : { tests: 0, testFiles: 0 }));
}
/** The plan file the run worked from, absolute: `[{FID}-plan.md]`, [] when it does not exist. */
export function planFiles(tree, month, fid) {
    const file = path.join(tree, "docs", "plans", month, `${fid}-plan.md`);
    return fs.existsSync(file) ? [file] : [];
}
/**
 * The plan the run worked from: `{FID}-plan.md`, its tasks per group. `source` is
 * `converted` when the FID's status rows hold a `build-plan-convert` step row, else
 * `file`. Undefined when no plan file exists.
 */
export function planBlock(tree, month, fid, events) {
    const [file] = planFiles(tree, month, fid);
    if (file === undefined)
        return undefined;
    const groups = planTasks(fs.readFileSync(file, "utf-8")).map((tasks) => ({ tasks }));
    const converted = events.some((e) => e.type === "step-done" && e.workflow === "build" && e.step === "build-plan-convert");
    return {
        source: converted ? "converted" : "file",
        total: { tasks: groups.reduce((a, g) => a + g.tasks.length, 0), kb: kbOf(file) },
        groups,
    };
}
const TEST_ORDER_GAP = /—\s*(no-red|late-red|red-mismatch|red-evidence-missing|test-changed)\s*—\s*not fixable/g;
/** A task `bkit challenge merge` appended: its severity field. Planned tasks carry none. */
const APPENDED_SEVERITY = /\*\*Severity:\*\*\s*(CRITICAL|HIGH|MEDIUM|LOW)\b/;
const field = (r, k) => (r[k] === undefined ? null : r[k]);
const num = (v) => (typeof v === "number" ? v : null);
const str = (v) => (typeof v === "string" ? v : null);
/**
 * Build-only facts from the run's step rows and its log folder: every verify and
 * gaps-remediate round, the holistic verify, the challenge and the red-test runs. A
 * verify report counts its test-order gaps only when its verdict and failure count
 * match the round's row. Challenge findings are counted once a `build-challenge` row
 * exists: CRITICAL / HIGH / MEDIUM from the tasks `challenge merge` appended to
 * `plans`, LOW from its `build-challenge` rows among `deferrals` (the run's rows). The
 * challenge block carries the latest `challenge-gate` row's size as `gate`, when one exists.
 */
export function buildBlock(rows, logDir, plans, deferrals) {
    const read = (file) => {
        const f = path.join(logDir, file);
        return fs.existsSync(f) ? fs.readFileSync(f, "utf-8") : null;
    };
    const steps = rows.filter((r) => r.type === "step-done");
    const verify = steps
        .filter((r) => r.step === "build-plan-verify")
        .map((r) => {
        const v = {
            group: field(r, "group"),
            attempt: field(r, "attempt"),
            verdict: field(r, "verdict"),
            failures: field(r, "failures"),
            testOrderGaps: null,
        };
        const text = read(`build-plan-verify-${String(v.group)}-${String(v.attempt)}.md`);
        if (text !== null &&
            /^Verdict:\s*(\w+)/m.exec(text)?.[1] === v.verdict &&
            Number(/^Failures:\s*(\d+)/m.exec(text)?.[1]) === v.failures)
            v.testOrderGaps = [...text.matchAll(TEST_ORDER_GAP)].length;
        return v;
    });
    const gapsRemediate = steps
        .filter((r) => r.step === "build-plan-gaps-remediate")
        .map((r) => ({
        group: field(r, "group"),
        attempt: field(r, "attempt"),
        verdict: field(r, "verdict"),
        strategy: field(r, "strategy"),
    }));
    const lastOf = (step) => steps.filter((r) => r.step === step).at(-1);
    const hol = lastOf("build-plan-verify-holistic");
    const ch = lastOf("build-challenge");
    // `challenge-gate` rows are not fold events: read them as plain status rows.
    const gate = rows
        .filter((r) => r.type === "challenge-gate")
        .at(-1);
    let findings = null;
    if (ch !== undefined) {
        const f = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
        for (const file of plans.filter((p) => fs.existsSync(p)))
            for (const t of parsePlanBlocks(fs.readFileSync(file, "utf-8")).tasks) {
                const sev = APPENDED_SEVERITY.exec(t.text)?.[1];
                if (sev !== undefined && sev !== "LOW")
                    f[sev]++;
            }
        f.LOW = new Set(deferrals
            .filter((r) => r.kind === "deferral" &&
            r.severity === "LOW" &&
            r.by?.step === "build-challenge")
            .map((r) => String(r.key))).size;
        findings = { total: f.CRITICAL + f.HIGH + f.MEDIUM + f.LOW, ...f };
    }
    return {
        verify,
        gapsRemediate,
        holistic: hol ? { verdict: str(hol.verdict), failures: num(hol.failures) } : null,
        challenge: ch
            ? {
                verdict: str(ch.verdict),
                findings,
                ...(gate === undefined
                    ? {}
                    : {
                        gate: {
                            size: str(gate.size),
                            linesChanged: num(gate.linesChanged),
                            filesChanged: num(gate.filesChanged),
                            skipped: gate.skipped === true,
                        },
                    }),
            }
            : null,
        redTests: steps.filter((r) => r.step === "build-task-red").length,
    };
}
/**
 * Claude Code sets `CLAUDE_CODE_SESSION_ID` in the environment of every shell command its
 * session runs, so `bkit workflows close` (run by the workflow's own session) knows whose
 * transcripts hold the run's subagents.
 */
export function claudeTranscripts(env, home) {
    return {
        sessionId: env.CLAUDE_CODE_SESSION_ID,
        claudeDir: env.CLAUDE_CONFIG_DIR || path.join(home, ".claude"),
    };
}
const SESSION_ID = /^[0-9A-Za-z][0-9A-Za-z_-]*$/;
/**
 * The chat a host runs this command in, or undefined when the host names none. Claude Code
 * only: it sets `CLAUDE_CODE_SESSION_ID`; nothing in this repo confirms a variable naming the
 * chat on Codex, opencode, Cursor or Antigravity.
 */
export function hostChat(env) {
    const id = env.CLAUDE_CODE_SESSION_ID;
    return id !== undefined && SESSION_ID.test(id) ? { platform: "claude-code", id } : undefined;
}
/**
 * A chat's fingerprint on `session` status rows: `fp:` + the first 12 hex of
 * sha256(`<platform>:<chat id>`), the same as the harvest's fingerprint of its `chat` row key.
 */
export const chatFingerprint = (platform, id) => `fp:${createHash("sha256").update(`${platform}:${id}`).digest("hex").slice(0, 12)}`;
/** Status rows that mark a moment rather than the end of a piece of work: step minutes skip them. */
export const MARK_ROWS = new Set([
    "session",
    "owner-pause",
    "owner-answer",
    "engine-call",
    "completeness",
]);
/** The `session` fingerprints on the run's status rows, in row order, each once. */
export function runChats(rows) {
    const out = [];
    for (const r of rows)
        if (r.type === "session" && typeof r.session === "string" && !out.includes(r.session))
            out.push(r.session);
    return out;
}
/** One Claude Code subagent transcript's model calls: `[ms, context]` each, or null when unreadable. */
function subagentCalls(file) {
    const read = readTextFile(file);
    if (!read.ok)
        return null;
    const calls = [];
    for (const line of read.text.split("\n")) {
        const parsed = line.trim() === "" ? null : parseJson(line);
        if (parsed === null || !parsed.ok)
            continue;
        const d = parsed.value;
        if (d === null || typeof d !== "object")
            continue;
        const m = d.message;
        // `<synthetic>`: a message Claude Code wrote itself (an API error notice), not a model call.
        if (d.type !== "assistant" || typeof m !== "object" || m === null)
            continue;
        if (m.model === "<synthetic>")
            continue;
        const at = msOf(d.timestamp);
        if (!Number.isFinite(at))
            continue;
        const u = (m.usage ?? {});
        const n = (k) => (typeof u[k] === "number" ? u[k] : 0);
        calls.push([
            at,
            n("input_tokens") + n("cache_creation_input_tokens") + n("cache_read_input_tokens"),
        ]);
    }
    return calls;
}
/**
 * The run's subagents' context peaks per agent type, from every Claude Code chat that ran
 * it: the chat running the close, and each chat whose fingerprint `chats` holds (the run's
 * `session` rows). Transcripts: `<claudeDir>/projects/<project>/<session>/subagents/agent-*.jsonl`,
 * each with its `agent-*.meta.json` naming the agent type (`unknown` without one). Each model
 * call goes by its own timestamp: a subagent counts in `runs` when one of its calls falls in
 * [startMs, endMs], and `peak` is the largest of those calls. Context of one model call =
 * input + cache write + cache read tokens, the same sum the harvest's `contextPeak` takes.
 * Undefined when no chat is known, no transcript is found or no subagent called the model
 * in the run. Never throws: a folder or transcript that cannot be read counts as absent.
 *
 * Claude Code only. The other hosts bkit renders for record nothing here:
 * - Cursor keeps no token counts in its local chats (the harvest reads them and finds none).
 * - Codex (`~/.codex/sessions/.../rollout-*.jsonl`, `token_count` events) and opencode
 *   (`~/.local/share/opencode/opencode.db`) keep token counts, but nothing in this repo
 *   confirms an environment variable naming the running session, so a close cannot tell its
 *   own run's transcripts from another chat's.
 * - Antigravity keeps protobuf in SQLite whose token fields nothing in this repo documents.
 */
export function agentContextBlock(startMs, endMs, src, chats = []) {
    const sid = src.sessionId !== undefined && SESSION_ID.test(src.sessionId) ? src.sessionId : null;
    const wanted = new Set(chats);
    if (sid === null && wanted.size === 0)
        return undefined;
    const projects = path.join(src.claudeDir, "projects");
    const top = readDirNames(projects);
    if (!top.ok)
        return undefined;
    const files = [];
    for (const p of top.names.sort()) {
        const names = readDirNames(path.join(projects, p));
        for (const name of names.ok ? names.names.sort() : []) {
            if (!SESSION_ID.test(name))
                continue;
            if (name !== sid && !wanted.has(chatFingerprint("claude-code", name)))
                continue;
            const dir = path.join(projects, p, name, "subagents");
            const subs = readDirNames(dir);
            for (const f of subs.ok ? subs.names.sort() : [])
                if (f.endsWith(".jsonl"))
                    files.push(path.join(dir, f));
        }
    }
    const byAgent = {};
    for (const file of files) {
        const inRun = (subagentCalls(file) ?? []).filter(([at]) => at >= startMs && at <= endMs);
        if (inRun.length === 0)
            continue;
        const meta = readJsonFile(file.slice(0, -".jsonl".length) + ".meta.json");
        const type = meta.ok ? meta.value?.agentType : undefined;
        const a = (byAgent[typeof type === "string" && type !== "" ? type : "unknown"] ??= {
            peak: 0,
            runs: 0,
        });
        a.runs++;
        a.peak = Math.max(a.peak, ...inRun.map(([, c]) => c));
    }
    return Object.keys(byAgent).length === 0 ? undefined : { host: "claude-code", byAgent };
}
/**
 * After the close's CI dispatch: append the run's `outcome` row again with the
 * dispatch added to `ci`, and `ending` `close-failed` when CI never started
 * (`unresolved`). The run is the last `workflow-done` row of `workflow` in
 * `status`; its `parentSha` names the outcome row. The newer row supersedes the
 * close's under fold. Best-effort: a missing row or a refused append is logged.
 */
export function restateOutcome(tree, status, workflow, dispatch, log) {
    const done = readStatusEvents(status)
        .filter((e) => e.type === "workflow-done" && e.workflow === workflow)
        .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
        .at(-1);
    const sha = done?.parentSha;
    if (typeof sha !== "string") {
        log(`[bkit-telemetry] no ${workflow} workflow-done row with parentSha — outcome not restated`);
        return false;
    }
    const stats = path.join(tree, ".bkit", "stats.jsonl");
    const outcome = fs.existsSync(stats)
        ? [...foldFrom([stats]).state.values()]
            .filter((e) => e.kind === "outcome" && e.by?.workflow === workflow && e.run?.parentSha === sha)
            .at(-1)
        : undefined;
    if (outcome === undefined) {
        log(`[bkit-telemetry] no ${workflow} outcome row for ${sha.slice(0, 12)} — outcome not restated`);
        return false;
    }
    const { schema: _s, ts: _t, bkit: _b, ...draft } = outcome;
    const entry = ciEntry(dispatch);
    const ci = [...(draft.ci ?? []), entry];
    try {
        appendLedgerRows(tree, "stats", [
            { ...draft, ending: entry.status === "unresolved" ? "close-failed" : "done", ci },
        ]);
        return true;
    }
    catch (err) {
        // Telemetry never gates a dispatch: report the refused append and carry on.
        log(`[bkit-telemetry] outcome not restated: ${err.message}`);
        return false;
    }
}
