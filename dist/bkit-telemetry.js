// Contract + codec for the bkit unified JSONL telemetry ledgers.
//
// Generalises the per-FID `status.jsonl` machine into a family of append-only
// NDJSON ledgers governed by ONE canonical TypeScript reducer:
//
//   .bkit/stats.jsonl     — compliance, outcome, counter rows
//   .bkit/friction.jsonl  — friction entries
//   docs/deferrals.jsonl  — deferred work
//   docs/failures.jsonl   — discovered bugs
//
// LOAD-BEARING DIVERGENCES FROM bkit-status.ts (NOT inherited — each pinned by test):
//   (a) Tolerant `parse`: per-line try/catch + skip + malformedLineCount.
//       `parseStatus` does a bare JSON.parse(l) and THROWS on malformed lines.
//   (b) `validate` REJECTS unknown `kind` before write. No reject path in status.ts.
//   (c) ms `ts` via now*1000|floor, NOT ISO `at`.
//
// Archive shard path: .bkit/archive/{basename}.{YYYYMM}.jsonl
// `foldFrom(paths[])` reads hot + archive shards so the P4 rollup cannot break readers.
//
// Version provenance: every row records the emitting `bkitVersion`. Readers ingest
// ALL well-formed rows (no version gating) and report row counts per `bkitVersion`
// so an unexpected version surfaces for triage.
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export const MAX_ROWS_BEFORE_ROLLUP = 5000;
/** Template for archive shards: replace {basename} and {YYYYMM}. */
export const ARCHIVE_SHARD_TEMPLATE = ".bkit/archive/{basename}.{YYYYMM}.jsonl";
// ---------------------------------------------------------------------------
// repo — the owner/repo slug, resolved ONE way
//
// `repo` is part of identity() for EVERY kind, so a respelled repo FORKS the
// entity — the same failure the spec warns about for `key`, except `repo` is not
// authored by anyone: it is derived. It therefore must be derived identically
// everywhere, from the only authoritative source: the git remote.
//
// NOT package.json `name` — that is an npm package name, not a slug
// (`@cbartens/bkit` vs `cbartens/bkit`). NOT the filesystem path — that makes the
// "owner" a folder on whoever's laptop ran the tool (`GitHub/app-gether-life`,
// or `code/app-gether-life` after they reorganise).
// ---------------------------------------------------------------------------
/**
 * Parse `owner/repo` out of a git remote URL. Pure — the fiddly half, kept
 * testable without a git repo.
 *
 * Handles HTTPS (`https://github.com/owner/repo.git`), SSH scp-form
 * (`git@github.com:owner/repo.git`) and `ssh://` URLs. Returns "" when the URL
 * yields no `owner/repo` pair rather than guessing.
 */
export function parseRemoteUrlToSlug(url) {
    const m = url
        .trim()
        .replace(/\.git$/, "")
        .match(/[/:]([^/:]+\/[^/:]+)$/);
    return m?.[1] ?? "";
}
/** git env with hook vars scrubbed — see resolveRepoSlug for why this is load-bearing. */
export function gitEnv() {
    const env = { ...process.env };
    delete env["GIT_DIR"];
    delete env["GIT_WORK_TREE"];
    delete env["GIT_INDEX_FILE"];
    delete env["GIT_OBJECT_DIRECTORY"];
    return env;
}
/**
 * Resolve a rev (`HEAD~1`, a branch, a tag) to a full hex SHA. "" if it does not
 * resolve — e.g. `HEAD~1` in a repo with one commit.
 *
 * `parentSha` MUST be resolved before it reaches a row. It is part of identity()
 * for compliance and counter, so an unresolved literal like "HEAD~1" is the SAME
 * identity on every run and successive runs fold into each other. It is also what
 * the grader diffs against, and the diff guard rejects anything non-hex — silently
 * grading an empty diff, which passes every diff-based rule vacuously.
 */
export function resolveGitSha(rev, cwd) {
    const res = spawnSync("git", ["rev-parse", "--verify", "--quiet", `${rev}^{commit}`], {
        cwd,
        encoding: "utf-8",
        env: gitEnv(),
        stdio: ["ignore", "pipe", "ignore"],
    });
    if (res.status !== 0 || typeof res.stdout !== "string")
        return "";
    const sha = res.stdout.trim();
    return /^[0-9a-f]{7,40}$/.test(sha) ? sha : "";
}
/**
 * Resolve a repo's `owner/repo` slug from its git remote. "" when there is no
 * remote or no git repo — callers decide the fallback, loudly.
 *
 * The env scrub is load-bearing, not hygiene: git hooks export GIT_DIR /
 * GIT_WORK_TREE / GIT_INDEX_FILE, and leaving them set makes `git -C <path>`
 * silently answer for the HOOK's repo instead of <path> — so a harvest run from
 * a hook would stamp every consumer's rows with bkit's own slug.
 *
 * spawnSync, not execSync-in-a-try: a non-zero exit is an expected answer here
 * ("no remote"), not an exception to swallow.
 */
export function resolveRepoSlug(cwd) {
    const res = spawnSync("git", ["remote", "get-url", "origin"], {
        cwd,
        encoding: "utf-8",
        env: gitEnv(),
        stdio: ["ignore", "pipe", "ignore"],
    });
    if (res.status !== 0 || typeof res.stdout !== "string")
        return "";
    return parseRemoteUrlToSlug(res.stdout);
}
export const VALID_KINDS = new Set([
    "compliance",
    "outcome",
    "counter",
    "friction",
    "deferral",
    "failure",
    "knowledge",
    "decision",
    "feature",
]);
export const VALID_SEVERITIES = new Set(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);
/**
 * Kinds that carry `severity` — and, identically, the kinds that carry the
 * OPEN/TRIAGED/CLOSED ladder. Both express the same property: these three are
 * the author-written kinds that describe OPEN WORK someone triages. Keep in
 * sync with the payload interfaces below.
 */
export const SEVERITY_KINDS = new Set(["friction", "deferral", "failure"]);
export const TRIAGE_STATUSES = new Set(["OPEN", "TRIAGED", "CLOSED"]);
/** The `ACTIVE` / `SUPERSEDED` lifecycle shared by `decision` and `knowledge`. */
export const DECISION_STATUSES = new Set(["ACTIVE", "SUPERSEDED"]);
export const FEATURE_STATUSES = new Set([
    "DESIGNED",
    "PLANNED",
    "BUILT",
    "DEBUGGED",
    "SHIPPED",
    "ABANDONED",
]);
export const DEFERRAL_REASONS = new Set([
    "scope-declared",
    "hard-blocked",
    "needs-decision",
    "own-cycle",
    "unjustified",
]);
/**
 * The adjudication verdict: this was in-scope work that should have been finished.
 * Written ONLY by a reviewer judging someone else's deferral — never self-assigned
 * at write time, where the four justifications are the whole legal vocabulary.
 *
 * Set via same-`key` append like any other update, and NEVER rewritten afterwards:
 * a later row that closes the entry carries `unjustified` through verbatim, because
 * the rate it feeds (`computeDeferralDiscipline` in `bkit-analysis.ts`) measures how
 * often an agent deferred work it should have done — not whether someone later
 * cleaned up after it.
 */
export const UNJUSTIFIED_REASON = "unjustified";
/**
 * The subagents sanctioned to write a `deferral` row (`.bkit/jsonl.md`
 * § Ledgers & Writers). EXHAUSTIVE: a subagent absent from this set does not
 * write the kind at all.
 *
 * The list is data, not prose, because the prose alone did not hold. Both
 * `@bkit-build-plan-execute` and `@bkit-build-plan-gaps-remediate` carry an
 * explicit "NO out-of-scope deferral" contract line, and the executor still
 * wrote rows — a blocked plan task is unfinished in-scope work, and routing it
 * to the ledger converts it into something the build loop treats as settled.
 * Its `BLOCKED` log line is the record; the next verify pass reads it.
 *
 * Orchestrator-written rows carry no `subagent` and are outside this check.
 */
export const DEFERRAL_WRITERS = new Set([
    "bkit-design-generate",
    "bkit-plan-generate",
    "bkit-plan-update",
    "bkit-build-challenge-remediate",
    "bkit-debug-abort-handover",
    "bkit-ship-deferred-sweep",
    "bkit-utility-update-deferrals",
]);
// ---------------------------------------------------------------------------
// Identity — per-kind composite tuple for dedup (NOT bare ts)
// Mirrors bkit-status.ts's tuple dedupe approach.
// ---------------------------------------------------------------------------
export function identity(event) {
    switch (event.kind) {
        case "compliance":
            return `compliance ${event.repo} ${event.workflow} ${event.parentSha} ${event.rule}`;
        case "outcome": {
            // One run row per workflow run: keyed by (repo, workflow, parentSha).
            // Back-compat: pre-generalization ship rows carry no parentSha, so fall
            // back to prNumber (then ts) — old ship rows stay uniquely keyed per PR.
            const anchor = event.parentSha ?? (event.prNumber !== undefined ? `pr${event.prNumber}` : `ts${event.ts}`);
            return `outcome ${event.repo} ${event.workflow} ${anchor}`;
        }
        case "counter":
            return `counter ${event.repo} ${event.workflow} ${event.parentSha} ${event.counterName}`;
        case "friction":
        case "deferral":
        case "failure":
        case "knowledge":
        case "decision":
        case "feature":
            // instinct-loop kinds (+ feature): identity = kind + key
            return `${event.kind} ${event.repo} ${event.key ?? event.ts}`;
    }
}
// ---------------------------------------------------------------------------
// Validate — reject malformed + unknown kind before write
// ---------------------------------------------------------------------------
export function validate(event) {
    if (!event || typeof event !== "object") {
        return { ok: false, reason: "event must be an object" };
    }
    const e = event;
    // A2-mandatory envelope fields
    const mandatory = ["ts", "kind", "repo", "bkitVersion", "step"];
    for (const field of mandatory) {
        if (e[field] === undefined || e[field] === null) {
            return { ok: false, reason: `missing mandatory field: ${field}` };
        }
    }
    if (typeof e["ts"] !== "number") {
        return { ok: false, reason: "ts must be a number (ms unix)" };
    }
    if (typeof e["kind"] !== "string") {
        return { ok: false, reason: "kind must be a string" };
    }
    if (!VALID_KINDS.has(e["kind"])) {
        return { ok: false, reason: `unknown kind: ${e["kind"]}` };
    }
    if (typeof e["repo"] !== "string" || e["repo"] === "") {
        return { ok: false, reason: "repo must be a non-empty string" };
    }
    if (typeof e["bkitVersion"] !== "string" || e["bkitVersion"] === "") {
        return { ok: false, reason: "bkitVersion must be a non-empty string" };
    }
    if (typeof e["step"] !== "string" || e["step"] === "") {
        return { ok: false, reason: "step must be a non-empty string" };
    }
    // kind-specific payload validation (minimal — structural check)
    const kind = e["kind"];
    // severity — required on the triaged author-written kinds, rejected elsewhere.
    // Enforced on write only; `parse` stays tolerant so pre-severity rows still read.
    if (SEVERITY_KINDS.has(kind)) {
        if (e["severity"] === undefined || e["severity"] === null) {
            return { ok: false, reason: `${kind} row missing required field: severity` };
        }
        if (!VALID_SEVERITIES.has(e["severity"])) {
            return {
                ok: false,
                reason: `${kind} severity must be one of CRITICAL|HIGH|MEDIUM|LOW (got: ${String(e["severity"])})`,
            };
        }
    }
    else if (e["severity"] !== undefined) {
        return { ok: false, reason: `${kind} rows do not carry severity` };
    }
    // status — triage ladder on the SEVERITY_KINDS trio, ACTIVE/SUPERSEDED lifecycle on
    // decision and knowledge, absent elsewhere. Optional: absent = ACTIVE on that lifecycle.
    // Enforced on write only; `parse` stays tolerant so legacy free-text statuses still read.
    if (SEVERITY_KINDS.has(kind)) {
        if (e["status"] !== undefined && !TRIAGE_STATUSES.has(e["status"])) {
            return {
                ok: false,
                reason: `${kind} status must be one of OPEN|TRIAGED|CLOSED (got: ${String(e["status"])})`,
            };
        }
    }
    else if (kind === "decision" || kind === "knowledge") {
        if (e["status"] !== undefined && !DECISION_STATUSES.has(e["status"])) {
            return {
                ok: false,
                reason: `${kind} status must be one of ACTIVE|SUPERSEDED (got: ${String(e["status"])})`,
            };
        }
    }
    else if (kind === "feature") {
        // status is REQUIRED on feature (unlike the optional triage ladder) — the
        // roadmap projection has no phase to render without it.
        if (e["status"] === undefined || !FEATURE_STATUSES.has(e["status"])) {
            return {
                ok: false,
                reason: `feature status must be one of DESIGNED|PLANNED|BUILT|DEBUGGED|SHIPPED|ABANDONED (got: ${String(e["status"])})`,
            };
        }
    }
    else if (e["status"] !== undefined) {
        return { ok: false, reason: `${kind} rows do not carry status` };
    }
    // reason — the deferral justification (see DeferralReason). Required on write:
    // an unjustifiable deferral is unfinished work, and the whole point of the field
    // is that it cannot be skipped. Enforced on write only; `parse` stays tolerant so
    // rows appended before the field existed still read.
    if (kind === "deferral") {
        if (e["reason"] === undefined || e["reason"] === null) {
            return { ok: false, reason: "deferral row missing required field: reason" };
        }
        if (!DEFERRAL_REASONS.has(e["reason"])) {
            return {
                ok: false,
                reason: `deferral reason must be one of ${[...DEFERRAL_REASONS].join("|")} (got: ${String(e["reason"])})`,
            };
        }
    }
    else if (e["reason"] !== undefined) {
        return { ok: false, reason: `${kind} rows do not carry reason` };
    }
    if (kind === "compliance") {
        if (!e["rule"] || !e["result"] || !e["phase"] || !e["parentSha"]) {
            return { ok: false, reason: "compliance row missing required payload fields" };
        }
    }
    if (kind === "outcome") {
        // Every workflow run carries these; `prNumber` is ship-only (see below).
        const numFields = [
            "linesAdded",
            "linesDeleted",
            "linesChanged",
            "filesChanged",
            "taskCount",
            "durationSeconds",
            "deferrals",
            "failures",
        ];
        for (const f of numFields) {
            if (typeof e[f] !== "number") {
                return { ok: false, reason: `outcome missing or invalid numeric field: ${f}` };
            }
        }
        // prNumber — ship-only, optional; validate only when present.
        if (e["prNumber"] !== undefined && typeof e["prNumber"] !== "number") {
            return { ok: false, reason: "outcome prNumber must be a number when present" };
        }
        // parentSha — the run's identity anchor; optional (absent on legacy ship rows).
        if (e["parentSha"] !== undefined && typeof e["parentSha"] !== "string") {
            return { ok: false, reason: "outcome parentSha must be a string when present" };
        }
        // Optional per-run numeric metrics: validate type only when present.
        for (const f of [
            "frictionAdded",
            "deferralsAdded",
            "failuresAdded",
            "correctiveCommits",
            "reviewIterations",
            "ciTrySuccess",
        ]) {
            if (e[f] !== undefined && typeof e[f] !== "number") {
                return { ok: false, reason: `outcome ${f} must be a number when present` };
            }
        }
        if (e["planSource"] !== undefined && e["planSource"] !== "brief") {
            return { ok: false, reason: 'outcome planSource must be "brief" when present' };
        }
        // coverage is optional + per-tier; validate structure only when present.
        if (e["coverage"] !== undefined) {
            const cov = e["coverage"];
            if (typeof cov !== "object" || cov === null) {
                return { ok: false, reason: "outcome coverage must be an object" };
            }
            for (const tier of ["unit", "integration", "e2e"]) {
                const t = cov[tier];
                if (t === undefined)
                    continue;
                if (typeof t !== "object" || t === null) {
                    return { ok: false, reason: `outcome coverage.${tier} must be an object` };
                }
                for (const m of ["lines", "branches", "functions", "statements"]) {
                    const v = t[m];
                    if (v !== undefined && typeof v !== "number") {
                        return { ok: false, reason: `outcome coverage.${tier}.${m} must be a number` };
                    }
                }
            }
        }
    }
    if (kind === "counter") {
        if (!e["counterName"] || typeof e["counterValue"] !== "number" || !e["parentSha"]) {
            return { ok: false, reason: "counter row missing required payload fields" };
        }
        if (e["counterSource"] !== "model-self-report" && e["counterSource"] !== "shell-bus") {
            return { ok: false, reason: "counter counterSource must be model-self-report or shell-bus" };
        }
    }
    if (kind === "feature") {
        if (!e["key"] || typeof e["key"] !== "string") {
            return { ok: false, reason: "feature row missing required field: key (the FID)" };
        }
        if (!e["category"] || typeof e["category"] !== "string") {
            return { ok: false, reason: "feature row missing required payload field: category" };
        }
        if (!e["description"] || typeof e["description"] !== "string") {
            return { ok: false, reason: "feature row missing required payload field: description" };
        }
    }
    return { ok: true };
}
/**
 * Tolerant parse — per-line try/catch, skips + counts unparseable lines.
 * NEVER throws. NEW behaviour vs parseStatus which throws on malformed lines.
 *
 * No version gating — ALL well-formed rows are kept regardless of `bkitVersion`.
 */
export function parse(raw) {
    const result = {
        events: [],
        malformedLineCount: 0,
    };
    const lines = raw.split("\n");
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === "")
            continue;
        try {
            const obj = JSON.parse(trimmed);
            result.events.push(obj);
        }
        catch {
            result.malformedLineCount++;
        }
    }
    return result;
}
/**
 * `ts` as a sortable number. Legacy rows carry an ISO-string `ts` or none at all;
 * `a.ts - b.ts` on those is NaN, which voids the whole sort and makes every fold
 * winner depend on file order. ISO strings parse; anything else sorts oldest.
 */
function tsOrder(ts) {
    if (typeof ts === "number" && Number.isFinite(ts))
        return ts;
    if (typeof ts === "string") {
        const ms = Date.parse(ts);
        if (Number.isFinite(ms))
            return ms;
    }
    return Number.NEGATIVE_INFINITY;
}
/** Ascending `ts` comparator that stays consistent on legacy rows. Ties keep input order. */
export function compareTs(a, b) {
    const x = tsOrder(a.ts);
    const y = tsOrder(b.ts);
    return x < y ? -1 : x > y ? 1 : 0;
}
/**
 * Fold events into a Map keyed by per-kind composite identity.
 * Later rows (higher ts) win for the same key — last-write-wins fold.
 * Mirrors bkit-status.ts's dedupe approach but with per-kind composite tuples.
 */
export function fold(events) {
    // Sort by ts ascending so later rows overwrite earlier ones
    const sorted = [...events].sort(compareTs);
    const state = new Map();
    for (const event of sorted) {
        const key = identity(event);
        state.set(key, event);
    }
    return state;
}
/**
 * Reads the hot file at `hotPath` plus any archive shards matching the
 * ARCHIVE_SHARD_TEMPLATE, folds all events together.
 *
 * Archive shard template: .bkit/archive/{basename}.{YYYYMM}.jsonl
 * e.g. .bkit/archive/stats.202606.jsonl
 */
export function foldFrom(paths) {
    let allEvents = [];
    let totalMalformed = 0;
    for (const p of paths) {
        if (!fs.existsSync(p))
            continue;
        const raw = fs.readFileSync(p, "utf-8");
        const parsed = parse(raw);
        allEvents = allEvents.concat(parsed.events);
        totalMalformed += parsed.malformedLineCount;
    }
    const versionCounts = {};
    for (const e of allEvents) {
        const v = typeof e.bkitVersion === "string" && e.bkitVersion !== "" ? e.bkitVersion : "unknown";
        versionCounts[v] = (versionCounts[v] ?? 0) + 1;
    }
    const rowCount = allEvents.length;
    const maxRowsWarning = rowCount > MAX_ROWS_BEFORE_ROLLUP;
    if (maxRowsWarning) {
        console.warn(`[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: ${rowCount} rows > ${MAX_ROWS_BEFORE_ROLLUP}. Consider archiving to ${ARCHIVE_SHARD_TEMPLATE}.`);
    }
    return {
        state: fold(allEvents),
        rowCount,
        malformedLineCount: totalMalformed,
        versionCounts,
        maxRowsWarning,
    };
}
/**
 * Compute archive shard paths for a hot file.
 * Returns all existing archive shards matching the template pattern.
 */
export function archiveShardPaths(hotPath) {
    const basename = path.basename(hotPath, ".jsonl");
    const archiveDir = path.join(path.dirname(hotPath), "..", ".bkit", "archive");
    const altArchiveDir = path.join(path.dirname(hotPath), "archive");
    const candidates = [];
    for (const dir of [archiveDir, altArchiveDir]) {
        if (!fs.existsSync(dir))
            continue;
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
            if (entry.startsWith(`${basename}.`) && entry.endsWith(".jsonl")) {
                candidates.push(path.join(dir, entry));
            }
        }
    }
    return candidates;
}
// ---------------------------------------------------------------------------
// AppendLine — serialize one event to its NDJSON line
// ---------------------------------------------------------------------------
export function appendLine(event) {
    const v = validate(event);
    if (!v.ok)
        throw new Error(`[bkit-telemetry] appendLine: invalid event — ${v.reason}`);
    return JSON.stringify(event);
}
// Per-metric baseline: compare THIS run to the previous N runs of the SAME workflow.
/** Rolling-baseline window (median over the previous N same-workflow runs). */
export const RUN_BASELINE_WINDOW = 5;
/** Below this many prior runs the median is noise — show `n/a` instead. */
const RUN_BASELINE_MIN = 3;
/** Seconds → compact human duration: `45s` · `33m` · `2h11m`. */
export function humanizeDuration(sec) {
    if (!Number.isFinite(sec) || sec < 0)
        return `${sec}s`;
    if (sec < 60)
        return `${Math.round(sec)}s`;
    if (sec < 3600)
        return `${Math.round(sec / 60)}m`;
    const h = Math.floor(sec / 3600);
    const m = Math.round((sec % 3600) / 60);
    return m > 0 ? `${h}h${m}m` : `${h}h`;
}
/** Median (lower-middle for even counts, matching computeElapsedStats). null if empty. */
function median(nums) {
    if (nums.length === 0)
        return null;
    const s = [...nums].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)] ?? null;
}
function versionSpread(versionCounts) {
    return (Object.entries(versionCounts)
        .map(([v, n]) => `${v}=${n}`)
        .join(", ") || "none");
}
/**
 * Ledger-health readout — the parse-integrity line kept as a footer, with the
 * `rows` / `malformed:` / `versions:` tokens.
 */
function ledgerLine(result) {
    return `[bkit-telemetry] ledger: ${result.rowCount} rows · malformed: ${result.malformedLineCount} · versions: ${versionSpread(result.versionCounts)}`;
}
/**
 * THE per-workflow telemetry report, emitted at each workflow's close step and
 * injected into the tracker close comment (`bkit telemetry summary --phase=<w>`).
 *
 * Scoped STRICTLY to the one workflow — never the design→…→ship chain. For the
 * given workflow it shows THIS run's `outcome` (run) row against
 * `med·N` = the median of that workflow's previous N runs (rolling, outlier-robust
 * because durations are right-skewed), a secondary compliance line, and the ledger
 * footer. Fields absent on the run row are omitted — a metric shows only when the
 * workflow actually produced it.
 *
 * Without a workflow it degrades to the ledger-health line alone.
 */
export function workflowTelemetry(result, workflow) {
    const events = [...result.state.values()];
    // Folded ENTITY count per workflow (not raw lines) — an updated row folds to one.
    const workflowCounts = {};
    for (const ev of events) {
        const w = ev.workflow || "unknown";
        workflowCounts[w] = (workflowCounts[w] ?? 0) + 1;
    }
    const base = {
        rowCount: result.rowCount,
        malformedLineCount: result.malformedLineCount,
        versionCounts: result.versionCounts,
        maxRowsWarning: result.maxRowsWarning,
        workflowCounts,
        workflow,
    };
    const maxRowsLines = result.maxRowsWarning
        ? [
            `[bkit-telemetry] WARNING: MAX_ROWS_BEFORE_ROLLUP (${MAX_ROWS_BEFORE_ROLLUP}) exceeded — ${result.rowCount} rows in stats.jsonl; consider archiving.`,
        ]
        : [];
    // No workflow → ledger-health readout only.
    if (!workflow) {
        return { ...base, lines: [ledgerLine(result), ...maxRowsLines] };
    }
    // This workflow's run rows (generalized outcome), oldest → newest.
    const runs = events
        .filter((e) => e.kind === "outcome" && e.workflow === workflow)
        .sort(compareTs);
    const cur = runs.at(-1);
    // Baseline only against runs of the same plan source — a brief run (no plan)
    // has no tasks and a different shape, so mixing them skews every median.
    const prev = runs
        .slice(0, -1)
        .filter((r) => r.planSource === cur?.planSource)
        .slice(-RUN_BASELINE_WINDOW);
    const repo = cur?.repo ?? events[0]?.repo ?? "unknown/repo";
    // Rendered as a Markdown table so it drops straight into the tracker comment
    // (no code fence needed) — GitHub/Linear render it natively.
    const lines = [`**${workflow} close** · ${repo}`, ""];
    const tableRows = [];
    const row = (label, self, med) => {
        tableRows.push(`| ${label} | ${self} | ${med} |`);
    };
    if (cur) {
        // med·N: median of the previous runs that carry the field, `—` until there are
        // at least RUN_BASELINE_MIN of them (1–2 samples is noise, not a baseline).
        const medCell = (key, fmt = String) => {
            const vals = prev.map((r) => r[key]).filter((v) => typeof v === "number");
            if (vals.length < RUN_BASELINE_MIN)
                return "—";
            const m = median(vals);
            return m === null ? "—" : fmt(m);
        };
        // Core metrics — always shown.
        row("durationSeconds", `${cur.durationSeconds} (${humanizeDuration(cur.durationSeconds)})`, medCell("durationSeconds", (n) => `${n} (${humanizeDuration(n)})`));
        row("linesChanged", `${cur.linesChanged} (+${cur.linesAdded}/-${cur.linesDeleted})`, medCell("linesChanged"));
        row("filesChanged", `${cur.filesChanged}`, medCell("filesChanged"));
        // Conditional metrics — shown only when this run carries them.
        if (cur.planSource)
            row("planSource", cur.planSource, "—");
        if (cur.taskCount > 0)
            row("taskCount", `${cur.taskCount}`, medCell("taskCount"));
        if (typeof cur.reviewIterations === "number")
            row("reviewIterations", `${cur.reviewIterations}`, medCell("reviewIterations"));
        if (typeof cur.correctiveCommits === "number")
            row("correctiveCommits", `${cur.correctiveCommits}`, medCell("correctiveCommits"));
        if (typeof cur.ciTrySuccess === "number")
            row("ciTrySuccess", `${cur.ciTrySuccess}${cur.ciTrySuccess === 1 ? " (first-try)" : ""}`, medCell("ciTrySuccess"));
        // Instinct-loop deltas — frictionAdded is the featured signal (shown even at 0).
        if (typeof cur.frictionAdded === "number")
            row("frictionAdded", `${cur.frictionAdded}`, medCell("frictionAdded"));
        if (typeof cur.deferralsAdded === "number")
            row("deferralsAdded", `${cur.deferralsAdded}`, medCell("deferralsAdded"));
        if (typeof cur.failuresAdded === "number")
            row("failuresAdded", `${cur.failuresAdded}`, medCell("failuresAdded"));
    }
    // Compliance — this run's rows. The `outcome` and `compliance` rows are written
    // at different points in a close (different HEADs → different parentSha), so we
    // DON'T match on the run row's parentSha: we take the newest same-workflow
    // compliance group (its parentSha) as "this run".
    const complianceRows = events.filter((e) => e.kind === "compliance" && e.workflow === workflow);
    const compSha = complianceRows.slice().sort((a, b) => compareTs(b, a))[0]?.parentSha;
    if (compSha) {
        const comp = complianceRows.filter((c) => c.parentSha === compSha);
        const pass = comp.filter((c) => c.result === "pass").length;
        const fail = comp.filter((c) => c.result === "fail").length;
        const na = comp.filter((c) => c.result === "n/a").length;
        const denom = pass + fail + na;
        const rate = denom > 0 ? Math.round((pass / denom) * 100) : 0;
        row("compliance", `${pass} pass · ${fail} fail · ${na} n/a (${rate}%)`, "—");
    }
    // Attempts — the newest same-workflow *_ATTEMPT counter (this run).
    const attempt = events
        .filter((e) => e.kind === "counter" && e.workflow === workflow && /_ATTEMPT$/.test(e.counterName))
        .sort((a, b) => compareTs(b, a))[0];
    if (attempt)
        row("attempts", `${attempt.counterName} ${attempt.counterValue}`, "—");
    if (tableRows.length > 0) {
        lines.push(`| metric | this run | med·${RUN_BASELINE_WINDOW} |`, "| --- | --- | --- |", ...tableRows, "");
    }
    lines.push(`\`med·${RUN_BASELINE_WINDOW}\` = median of the previous ${RUN_BASELINE_WINDOW} ${workflow}${cur?.planSource ? ` ${cur.planSource}` : ""} runs (— if < ${RUN_BASELINE_MIN}) · ledger ${result.rowCount} rows, ${result.malformedLineCount} malformed`);
    lines.push(...maxRowsLines);
    return { ...base, lines };
}
// Re-export readline for potential streaming use (optional)
export { readline };
