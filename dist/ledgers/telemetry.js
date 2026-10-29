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
// LOAD-BEARING DIVERGENCES FROM ledgers/status.ts (NOT inherited — each pinned by test):
//   (a) Tolerant `parse`: per-line try/catch + skip + malformedLineCount.
//   (b) `validate` REJECTS unknown `kind` before write. No reject path in status.ts.
//   (c) ms `ts` via now*1000|floor, NOT ISO `at`.
//
// Version provenance: every row records the emitting `bkit.version`. Readers ingest
// ALL well-formed rows (no version gating) and report row counts per `bkit.version`
// so an unexpected version surfaces for triage.
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import { parseJson } from "../shared/json.js";
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export const MAX_ROWS_BEFORE_ROLLUP = 5000;
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
// "owner" a folder on whoever's laptop ran the tool (`GitHub/my-app`, or
// `code/my-app` after they reorganise).
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
/** git env with hook vars scrubbed — see resolveRepoSlug. */
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
 * `parentSha` MUST be resolved before it reaches a row: it is part of identity()
 * for compliance and counter, and the grader's diff guard accepts only hex.
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
 * Scrubs GIT_DIR / GIT_WORK_TREE / GIT_INDEX_FILE (exported by git hooks) so
 * `git -C <path>` answers for <path>, not the hook's repo.
 *
 * spawnSync: a non-zero exit ("no remote") is an expected answer, not an exception.
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
// ---------------------------------------------------------------------------
// Shared envelope (A2-mandatory fields on EVERY row, every kind)
// ---------------------------------------------------------------------------
/**
 * Row format version. Rows written without `schema` are read through {@link normalize}.
 * A schema-2 row differs only in its outcome `plan` block ({@link StoredPlanBlock}).
 */
export const SCHEMA = 3;
/** The schema {@link normalize} stamps on a row written without one: the shape it builds. */
const NORMALIZED_SCHEMA = 2;
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
    "chat",
    "run",
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
/**
 * The kinds whose rows carry `firstTs` + `updates` (`.bkit/jsonl.md` § Compaction):
 * the keyed kinds of the ledgers `bkit ledgers compact` rewrites to their fold winners.
 */
export const AGED_KINDS = new Set([
    "deferral",
    "failure",
    "knowledge",
    "decision",
    "feature",
]);
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
    "low-severity",
    "unjustified",
]);
/**
 * The adjudication verdict: this was in-scope work that should have been finished.
 * Written ONLY by a reviewer judging someone else's deferral — never self-assigned
 * at write time, where the four justifications are the whole legal vocabulary.
 *
 * Set via same-`key` append like any other update, and NEVER rewritten afterwards:
 * a later row that closes the entry carries `unjustified` through verbatim. Feeds
 * `computeDeferralDiscipline` in `commands/analysis.ts`.
 */
export const UNJUSTIFIED_REASON = "unjustified";
/**
 * The subagents sanctioned to write a `deferral` row (`.bkit/jsonl.md`
 * § Ledgers & Writers). EXHAUSTIVE: a subagent absent from this set does not
 * write the kind at all.
 *
 * `@bkit-build-plan-execute` and `@bkit-build-plan-gaps-remediate` are not in it: a
 * blocked plan task's record is its `BLOCKED` log line, which the next verify pass reads.
 *
 * Orchestrator-written rows carry no `subagent` and are outside this check.
 */
export const DEFERRAL_WRITERS = new Set([
    "bkit-design-generate",
    "bkit-plan-generate",
    "bkit-plan-update",
    "bkit-debug-abort-handover",
    "bkit-ship-deferred-sweep",
    "bkit-utility-update-deferrals",
]);
/** A writer list that admits every name (`.bkit/jsonl.md` § Ledgers & Writers: "any agent"). */
export const ANY_WRITER = "any";
/**
 * The ledgers `bkit ledgers append` lands rows in, and the kinds each takes.
 * `feature` rows go through `bkit roadmap feature` (it re-renders the board);
 * `chat` / `run` rows are written by bkit's harvest script, to `harvest/stats.jsonl`.
 */
export const APPEND_LEDGERS = {
    decisions: { file: "docs/decisions.jsonl", kinds: ["decision"] },
    deferrals: { file: "docs/deferrals.jsonl", kinds: ["deferral"] },
    failures: { file: "docs/failures.jsonl", kinds: ["failure"] },
    knowledge: { file: "docs/knowledge.jsonl", kinds: ["knowledge"] },
    friction: { file: ".bkit/friction.jsonl", kinds: ["friction"] },
    stats: { file: ".bkit/stats.jsonl", kinds: ["compliance", "counter", "outcome"] },
};
/** The workflows whose close writes `.bkit/stats.jsonl` rows (`bkit workflows close`, `bkit comply`). */
const CLOSING_WORKFLOWS = new Set(["design", "plan", "build", "debug", "ship"]);
/**
 * `.bkit/jsonl.md` § Ledgers & Writers as code, for the kinds in
 * {@link APPEND_LEDGERS}. EXHAUSTIVE: a name absent from a set does not write the
 * kind. `telemetry.test.ts` holds this to the doc table.
 */
export const KIND_WRITERS = {
    decision: {
        subagents: new Set([
            "bkit-debug-failure-remediate",
            "bkit-plan-generate",
            "bkit-plan-update",
            "bkit-utility-update-decisions",
        ]),
        // Build: Decision Pause accept; plan: an open question answered after close; design: an
        // open question answered by the owner at close (the human decides, the orchestrator
        // records); ship: an assumed accept the owner confirms (`bkit decisions apply --by=owner`);
        // utility: a direct chat outside any workflow (`by.step` `manual`), the owner deciding in it.
        // All ONLY after explicit human approval.
        orchestrators: new Set(["design", "build", "plan", "ship", "utility"]),
    },
    // Build: `bkit challenge merge` writes each LOW challenge finding (`low-severity`). Ship:
    // `bkit decisions pending --defer` writes each assumed accept nobody confirmed (`needs-decision`).
    deferral: { subagents: DEFERRAL_WRITERS, orchestrators: new Set(["build", "ship"]) },
    failure: { subagents: ANY_WRITER, orchestrators: ANY_WRITER },
    knowledge: {
        subagents: new Set([
            "bkit-build-plan-execute",
            "bkit-build-plan-gaps-remediate",
            "bkit-debug-failure-remediate",
            "bkit-utility-update-knowledge",
        ]),
        orchestrators: new Set(),
    },
    friction: {
        subagents: new Set(),
        orchestrators: new Set(["design", "plan", "build", "debug", "ship", "auto"]),
    },
    compliance: { subagents: new Set(), orchestrators: CLOSING_WORKFLOWS },
    counter: { subagents: new Set(), orchestrators: CLOSING_WORKFLOWS },
    outcome: { subagents: new Set(), orchestrators: CLOSING_WORKFLOWS },
};
const writerList = (w) => w === ANY_WRITER ? "any" : w.size === 0 ? "none" : [...w].join(", ");
/** A row's `by` block, or an empty one when it has none. */
const byOf = (row) => row["by"] !== null && typeof row["by"] === "object" ? row["by"] : {};
/**
 * Why `row` may not be written by its author, or undefined when it may. The author
 * is `by.subagent` when set (with its `by.model`), else the orchestrator in
 * `by.workflow` (`.bkit/jsonl.md` § Who Wrote It).
 */
export function writerProblem(row) {
    const kind = row["kind"];
    const writers = KIND_WRITERS[kind];
    if (writers === undefined)
        return `${String(kind)} rows have no append writers`;
    const by = byOf(row);
    const subagent = by["subagent"];
    if (subagent !== undefined) {
        if (typeof subagent !== "string" || subagent === "") {
            return "by.subagent must be a non-empty string";
        }
        if (typeof by["model"] !== "string" || by["model"] === "") {
            return `subagent ${subagent} row missing by.model (its prompt's frontmatter model:)`;
        }
        if (writers.subagents === ANY_WRITER || writers.subagents.has(subagent))
            return undefined;
        return `subagent ${subagent} does not write ${kind} rows (subagents: ${writerList(writers.subagents)})`;
    }
    if (by["model"] !== undefined)
        return "by.model is set only on subagent rows";
    if (writers.orchestrators === ANY_WRITER)
        return undefined;
    const workflow = by["workflow"];
    if (typeof workflow === "string" && writers.orchestrators.has(workflow))
        return undefined;
    return `the ${typeof workflow === "string" ? workflow : "(no workflow)"} orchestrator does not write ${kind} rows (orchestrators: ${writerList(writers.orchestrators)})`;
}
/**
 * A `ts` minted now: `Date.now()`, or `after + 1` when the clock has not passed
 * `after`, moved 1 ms off a whole second. The live-ledger gate fails whole-second
 * values as hand-typed (`audits/repo/ledger-integrity.test.ts`), and a real mint
 * must never trip it.
 */
export function mintTs(after) {
    let ts = Date.now();
    if (after !== undefined && ts <= after)
        ts = after + 1;
    return ts % 1000 === 0 ? ts + 1 : ts;
}
/**
 * The context one subagent may fill before it hands over (the plan template's "about 160k
 * tokens" per build group). Rows store peaks only; readers judge them against this.
 */
export const AGENT_CONTEXT_CAP = 160_000;
export const OUTCOME_ENDINGS = new Set(["done", "close-failed"]);
export const RUN_ENDINGS = new Set([
    "done",
    "close-failed",
    "failed",
    "decision-pause",
    "stopped",
]);
// ---------------------------------------------------------------------------
// Identity — per-kind composite tuple for dedup (NOT bare ts)
// Mirrors ledgers/status.ts's tuple dedupe approach.
// ---------------------------------------------------------------------------
export function identity(event) {
    const workflow = event.by?.workflow;
    switch (event.kind) {
        case "compliance":
            return `compliance ${event.repo} ${workflow} ${event.run?.parentSha} ${event.rule?.id}`;
        case "outcome": {
            // One run row per workflow run: keyed by (repo, workflow, run.parentSha).
            // A ship row with no parentSha falls back to run.pr (then ts), so it stays
            // uniquely keyed per PR.
            const anchor = event.run?.parentSha ??
                (event.run?.pr !== undefined ? `pr${event.run.pr}` : `ts${event.ts}`);
            return `outcome ${event.repo} ${workflow} ${anchor}`;
        }
        case "counter":
            return `counter ${event.repo} ${workflow} ${event.run?.parentSha} ${event.counter?.name}`;
        case "friction":
        case "deferral":
        case "failure":
        case "knowledge":
        case "decision":
        case "feature":
        case "chat":
        case "run":
            // keyed kinds: identity = kind + key
            return `${event.kind} ${event.repo} ${event.key ?? event.ts}`;
    }
}
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
/** `o` without its undefined fields, so an absent value stays absent. */
const defined = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
const tenthOf = (n) => Math.round(n * 10) / 10;
/** Fields of a row written without `schema` that the current shape moves or drops, per kind. */
const MOVED = {
    compliance: ["rule", "result", "evidence", "phase"],
    counter: ["counterName", "counterValue", "counterSource", "phase"],
    outcome: [
        "phase",
        "prNumber",
        "linesAdded",
        "linesDeleted",
        "linesChanged",
        "filesChanged",
        "taskCount",
        "durationSeconds",
        "ciTrySuccess",
        "correctiveCommits",
        "reviewIterations",
        "deferrals",
        "failures",
        "frictionAdded",
        "deferralsAdded",
        "failuresAdded",
        "planSource",
        "coverage",
        "redTests",
    ],
};
const TOP_MOVED = ["schema", "bkitVersion", "workflow", "step", "subagent", "model", "parentSha"];
/**
 * A row in a `schema` shape. A row that carries `schema` is returned as it is; a
 * row written without one is stamped `schema: 2` and has its top section (`bkitVersion` -> `bkit.version`,
 * `workflow` / `step` / `subagent` / `model` -> `by.*`) and the stats kinds' run
 * fields moved into their blocks as far as the row holds them. Fields with no
 * place in the schema-2 shape are dropped, and any kind's `parentSha` moves to
 * `run.parentSha`. `bkit install` / `bkit upgrade` rewrite old rows through it
 * (`./migrate.ts`); readers still call it, as a union merge can bring an old line back.
 */
export function normalize(raw) {
    if (!isObj(raw))
        return {};
    if (raw["schema"] !== undefined)
        return raw;
    const kind = String(raw["kind"]);
    const moved = new Set([...TOP_MOVED, ...(MOVED[kind] ?? [])]);
    const rest = Object.fromEntries(Object.entries(raw).filter(([k]) => !moved.has(k)));
    const { ts, kind: _kind, key, repo, references, ...payload } = rest;
    const out = defined({
        schema: NORMALIZED_SCHEMA,
        ts,
        kind: raw["kind"],
        key,
        repo,
        // "none": the harvest script found no bkit version for the row.
        bkit: {
            version: raw["bkitVersion"] === undefined || raw["bkitVersion"] === "none"
                ? null
                : raw["bkitVersion"],
        },
        // An old row's null or empty `workflow` / `subagent` / `model` meant "none": left out.
        by: Object.fromEntries(["workflow", "step", "subagent", "model"]
            .map((f) => [f, raw[f]])
            .filter(([, v]) => v !== undefined && v !== null && v !== "")),
        references,
    });
    const num = (f) => typeof raw[f] === "number" ? raw[f] : undefined;
    switch (kind) {
        case "compliance":
            out["run"] = { parentSha: raw["parentSha"] };
            out["rule"] = defined({ id: raw["rule"], verdict: raw["result"], evidence: raw["evidence"] });
            break;
        case "counter":
            out["run"] = { parentSha: raw["parentSha"] };
            out["counter"] = {
                name: raw["counterName"],
                value: raw["counterValue"],
                source: raw["counterSource"],
            };
            break;
        case "outcome": {
            out["run"] = defined({ parentSha: raw["parentSha"], pr: raw["prNumber"] });
            const seconds = num("durationSeconds");
            if (seconds !== undefined)
                out["time"] = { totalMinutes: tenthOf(seconds / 60) };
            const added = num("linesAdded");
            const deleted = num("linesDeleted");
            if (added !== undefined && deleted !== undefined) {
                out["lines"] = {
                    total: { added, deleted, changed: added + deleted, files: num("filesChanged") ?? 0 },
                };
            }
            out["ledgers"] = {
                deferrals: defined({ repo: num("deferrals"), added: num("deferralsAdded") }),
                failures: defined({ repo: num("failures"), added: num("failuresAdded") }),
                friction: defined({ added: num("frictionAdded") }),
            };
            if (raw["planSource"] === "brief")
                out["plan"] = { source: "brief" };
            if (isObj(raw["coverage"]))
                out["ship"] = { coverage: raw["coverage"] };
            if (num("redTests") !== undefined)
                out["build"] = { redTests: num("redTests") };
            break;
        }
        case "chat":
            return { ...out, ...oldChat(raw) };
        case "run":
            return {
                ...out,
                by: defined({ workflow: raw["workflow"], step: raw["step"] ?? "scan" }),
                ...oldRun(raw),
            };
    }
    const run = out["run"] ?? (raw["parentSha"] !== undefined ? { parentSha: raw["parentSha"] } : undefined);
    return { ...out, ...payload, ...defined({ run }) };
}
// The harvest script's own kinds, mapped in full: every schema-1 field has a
// place in the current shape or is dropped. `scripts/harvest/bkit-harvest.mjs`
// `normalize` maps them the same way.
const objOf = (v) => (isObj(v) ? v : {});
const numOr = (v, or = 0) => typeof v === "number" ? v : or;
const arrOf = (v) => (Array.isArray(v) ? v : []);
const TOKENS = ["input", "cacheWrite", "cacheRead", "output", "outputEst", "read"];
const oldTokens = (t) => Object.fromEntries(TOKENS.map((k) => [k, numOr(objOf(t)[k])]));
const oldMix = (m) => {
    if (!isObj(m))
        return undefined;
    return {
        read: numOr(m["read"]),
        edit: numOr(m["edit"]),
        grep: numOr(m["grep"]),
        shellRead: numOr(m["sedCat"]),
        shellList: numOr(m["findLs"]),
        tests: numOr(m["tests"]),
        serena: numOr(m["serena"]),
    };
};
const sumNums = (xs) => xs.reduce((a, x) => a + (typeof x === "number" ? x : 0), 0);
/** Shell tools by host: the tool a schema-1 chat row's per-chat shell categories move under. */
const OLD_SHELL_TOOLS = [
    "Bash",
    "bash",
    "Shell",
    "shell",
    "shell_command",
    "local_shell",
    "exec_command",
    "run_command",
    "run_terminal_cmd",
];
function oldChat(r) {
    const byAgent = {};
    for (const [type, av] of Object.entries(objOf(r["agents"]))) {
        const a = objOf(av);
        const peaks = arrOf(a["ctxPeaks"]).filter((p) => typeof p === "number");
        const n = numOr(a["n"], peaks.length);
        byAgent[type] = defined({
            n,
            errors: numOr(a["errors"]),
            // Per-instance turns were stored only as a sum: known when the type ran once.
            instances: peaks.map((p) => ({
                turns: n === 1 ? numOr(a["turns"], null) : null,
                contextPeak: p,
            })),
            usage: {
                turns: numOr(a["turns"]),
                tokens: oldTokens(a),
                context: { peak: numOr(a["ctxPeakMax"], Math.max(0, ...peaks)) },
                compactions: numOr(a["compactions"]),
            },
            mix: oldMix(a["mix"]),
        });
    }
    const byTool = {};
    for (const [k, tv] of Object.entries(objOf(r["tools"]))) {
        const t = objOf(tv);
        byTool[k] = { calls: numOr(t["calls"]), errors: numOr(t["errors"]) };
    }
    const shellTool = OLD_SHELL_TOOLS.find((k) => byTool[k] !== undefined);
    const bash = objOf(r["bash"]);
    if (shellTool !== undefined && Object.keys(bash).length > 0)
        byTool[shellTool]["byCategory"] = { ...bash };
    const byModel = Object.fromEntries(Object.entries(objOf(r["models"])).map(([k, m]) => [
        k,
        { turns: numOr(objOf(m)["turns"]), tokens: oldTokens(m) },
    ]));
    const m = objOf(r["main"]);
    const tokens = objOf(r["tokens"]);
    const byVerb = objOf(r["bkitCli"]);
    const agents = Object.values(byAgent).map(objOf);
    const tools = Object.values(byTool);
    const start = r["start"];
    const end = r["end"];
    return {
        by: defined({ workflow: r["workflow"] ?? "chat-stats", step: r["step"] ?? "scan" }),
        bkit: {
            version: r["bkitVersion"] === undefined || r["bkitVersion"] === "none" ? null : r["bkitVersion"],
            versionSource: r["bkitVersionSource"] ?? "none",
            via: arrOf(r["bkitVia"]),
            workflows: arrOf(r["bkitWorkflows"]),
            prompts: arrOf(r["bkitKinds"]),
            cli: { total: sumNums(Object.values(byVerb)), byVerb },
        },
        session: {
            platform: r["platform"] ?? "claude-code",
            id: r["sessionId"] ?? null,
            hostVersion: r["hostVersion"] ?? null,
            entrypoint: r["entrypoint"] ?? null,
            prompts: numOr(r["userPrompts"]),
        },
        time: defined({
            start: start ?? null,
            end: end ?? null,
            totalMinutes: typeof r["minutes"] === "number"
                ? r["minutes"]
                : typeof start === "number" && typeof end === "number"
                    ? tenthOf((end - start) / 60000)
                    : null,
            activeMinutes: numOr(r["activeMinutes"], null),
            spans: arrOf(r["active"]),
            lastActivity: r["lastActivityAt"],
        }),
        issue: {
            id: r["issue"] ?? null,
            all: arrOf(r["issues"]),
            mentioned: arrOf(r["mentioned"]),
            source: r["issueSource"] ?? "none",
        },
        run: { parentShas: arrOf(r["parentShas"]) },
        effort: objOf(r["effort"]),
        usage: {
            total: {
                turns: numOr(r["turns"]),
                // Summed from the models, as a fresh scan writes it: the old row's own total
                // estimated output once over the whole chat, so it can differ from its parts.
                tokens: Object.keys(byModel).length > 0
                    ? Object.fromEntries(TOKENS.map((k) => [k, sumNums(Object.values(byModel).map((x) => x.tokens[k]))]))
                    : oldTokens(tokens),
                context: { start: numOr(tokens["ctxStart"]), peak: numOr(tokens["ctxPeak"]) },
                compactions: numOr(r["compactions"]),
            },
            main: defined({
                turns: numOr(m["turns"]),
                tokens: oldTokens(m),
                context: { peak: numOr(m["ctxPeak"]) },
                compactions: numOr(m["compactions"]),
                mix: oldMix(m["mix"]),
            }),
            byModel,
        },
        agents: {
            total: {
                n: numOr(r["subagents"], sumNums(agents.map((a) => a["n"]))),
                errors: sumNums(agents.map((a) => a["errors"])),
            },
            byAgent,
        },
        tools: {
            total: {
                calls: sumNums(tools.map((t) => t["calls"])),
                errors: sumNums(tools.map((t) => t["errors"])),
            },
            byTool,
            filesRead: numOr(r["filesRead"]),
        },
        scan: defined({
            files: r["sourceFiles"],
            bytes: r["sourceBytes"],
            settled: r["settled"],
            tokensRecorded: r["tokensRecorded"],
        }),
    };
}
/** A schema-1 run row's plan: its per-task lists, grouped when unsplit. */
function oldPlan(p) {
    const n = numOr(p["subPlans"], 1);
    const tests = arrOf(p["testsPerTask"]);
    const files = arrOf(p["testFilesPerTask"]);
    const tasks = numOr(p["tasks"], tests.length);
    const kb = numOr(p["kb"]);
    const out = { source: "file", total: { tasks, kb } };
    out["subPlans"] =
        n === 1
            ? [
                {
                    kb,
                    tasks: Array.from({ length: tasks }, (_, i) => ({
                        tests: numOr(tests[i], null),
                        testFiles: numOr(files[i], null),
                    })),
                },
            ]
            : // A split plan's per-task lists were stored flat: which sub-plan each task was in is not known.
                Array.from({ length: n }, () => ({ kb: null, tasks: null }));
    if (isObj(p["complexity"]))
        out["complexity"] = p["complexity"];
    return out;
}
function oldRun(r) {
    const steps = Object.entries(objOf(r["steps"])).map(([k, v]) => [k, objOf(v)]);
    const byStep = Object.fromEntries(steps.map(([k, st]) => [
        k,
        {
            n: numOr(st["n"]),
            totalMinutes: numOr(st["minutes"]),
            activeMinutes: numOr(st["active"], null),
        },
    ]));
    const parts = steps.map(([, st]) => st);
    const isBuild = r["workflow"] === "build" ||
        ["verify", "gapsRemediate", "holistic", "challenge", "redTests"].some((k) => k in r);
    const ch = isObj(r["challenge"]) ? r["challenge"] : undefined;
    const f = isObj(ch?.["findings"]) ? ch["findings"] : undefined;
    const lines = objOf(r["lines"]);
    const lineParts = ["code", "tests", "docs"].map((k) => objOf(lines[k]));
    const linesOut = isObj(r["lines"]) && isObj(lines["code"])
        ? (() => {
            const added = sumNums(lineParts.map((p) => p["added"]));
            const deleted = sumNums(lineParts.map((p) => p["deleted"]));
            return {
                total: {
                    added,
                    deleted,
                    changed: added + deleted,
                    files: sumNums(lineParts.map((p) => p["files"])),
                },
                code: lines["code"],
                tests: lines["tests"],
                docs: lines["docs"],
                merges: lines["merges"],
            };
        })()
        : r["lines"];
    return defined({
        run: {
            fid: r["fid"] ?? null,
            issue: r["issue"] ?? null,
            n: numOr(r["run"], null),
            parentSha: r["parentSha"] ?? null,
            parentShas: arrOf(r["parentShas"]),
        },
        time: defined({
            start: r["start"] ?? null,
            end: r["end"] ?? null,
            totalMinutes: numOr(r["minutes"], null),
            activeMinutes: numOr(r["activeMinutes"], null),
            activeFrom: r["activeFrom"] ?? null,
            lastActivity: r["lastActivityAt"],
        }),
        ending: r["ending"],
        ci: arrOf(r["closeCi"]).map((cv) => {
            const c = objOf(cv);
            return defined({
                status: c["outcome"] ?? null,
                reason: c["reason"] ?? undefined,
                attempts: numOr(c["attempts"], null),
            });
        }),
        steps: {
            total: {
                n: sumNums(parts.map((st) => st["n"])),
                totalMinutes: tenthOf(sumNums(parts.map((st) => st["minutes"]))),
                activeMinutes: parts.some((st) => typeof st["active"] !== "number")
                    ? null
                    : tenthOf(sumNums(parts.map((st) => st["active"]))),
            },
            byStep,
        },
        lines: linesOut,
        plan: isObj(r["plan"]) ? oldPlan(r["plan"]) : r["plan"],
        build: isBuild
            ? defined({
                verify: arrOf(r["verify"]),
                gapsRemediate: arrOf(r["gapsRemediate"]),
                holistic: r["holistic"] ?? undefined,
                challenge: ch
                    ? {
                        verdict: ch["verdict"] ?? null,
                        findings: f ? { total: sumNums(Object.values(f)), ...f } : null,
                    }
                    : undefined,
                redTests: numOr(r["redTests"]),
            })
            : undefined,
        scan: defined({ rows: r["sourceRows"], afterEnd: r["afterEnd"], settled: r["settled"] }),
    });
}
/** `normalize` typed for readers: every row a fold or report sees. */
export const normalizeEvent = (raw) => normalize(raw);
// ---------------------------------------------------------------------------
// Totals — every total beside its parts must equal them
// ---------------------------------------------------------------------------
const sumOf = (xs) => xs.reduce((a, x) => a + (typeof x === "number" ? x : 0), 0);
const field = (o, ...pathTo) => pathTo.reduce((v, k) => (isObj(v) ? v[k] : undefined), o);
const TOKEN_FIELDS = ["input", "cacheWrite", "cacheRead", "output", "outputEst", "read"];
/**
 * The first total on `row` that does not equal its parts, or undefined. Only blocks
 * the row carries are checked. Minute totals are summed from unrounded values, so
 * each part may be off by its rounding: +-0.1 per part.
 */
export function totalsProblem(row) {
    const eq = (what, total, parts, tol = 0) => typeof total === "number" && Math.abs(total - parts) <= tol + 1e-9
        ? undefined
        : `${what} is ${String(total)}, its parts sum to ${tenthOf(parts)}`;
    const checks = [];
    const lines = row["lines"];
    if (isObj(lines) && isObj(lines["total"])) {
        const t = lines["total"];
        checks.push(() => eq("lines.total.changed", t["changed"], sumOf([t["added"], t["deleted"]])));
        if (["code", "tests", "docs"].some((p) => isObj(lines[p]))) {
            for (const f of ["added", "deleted", "files"]) {
                checks.push(() => eq(`lines.total.${f}`, t[f], sumOf(["code", "tests", "docs"].map((p) => field(lines, p, f)))));
            }
        }
    }
    const time = row["time"];
    if (isObj(time) && typeof time["start"] === "number" && typeof time["end"] === "number") {
        checks.push(() => eq("time.totalMinutes", time["totalMinutes"], (time["end"] - time["start"]) / 60000, 0.1));
        const spans = time["spans"];
        if (row["kind"] === "chat" &&
            Array.isArray(spans) &&
            typeof time["activeMinutes"] === "number") {
            const ms = sumOf(spans.map((s) => (Array.isArray(s) ? Number(s[1]) - Number(s[0]) : 0)));
            checks.push(() => eq("time.activeMinutes", time["activeMinutes"], ms / 60000, 0.1));
        }
    }
    const steps = row["steps"];
    if (isObj(steps) && isObj(steps["byStep"]) && isObj(steps["total"])) {
        const parts = Object.values(steps["byStep"]);
        for (const f of ["n", "totalMinutes", "activeMinutes"]) {
            const total = steps["total"][f];
            if (total === undefined || total === null)
                continue;
            const tol = f === "n" ? 0 : 0.1 * Math.max(1, parts.length);
            checks.push(() => eq(`steps.total.${f}`, total, sumOf(parts.map((p) => field(p, f))), tol));
        }
    }
    const plan = row["plan"];
    if (isObj(plan) && isObj(plan["total"]) && Array.isArray(plan["groups"])) {
        const groups = plan["groups"];
        const total = plan["total"];
        checks.push(() => eq("plan.total.tasks", total["tasks"], sumOf(groups.map((g) => arrOf(field(g, "tasks")).length))));
    }
    const build = row["build"];
    if (isObj(build)) {
        const findings = field(build, "challenge", "findings");
        if (isObj(findings)) {
            checks.push(() => eq("build.challenge.findings.total", findings["total"], sumOf(["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((s) => findings[s]))));
        }
        if (typeof build["redTests"] === "number" && isObj(field(steps, "byStep"))) {
            checks.push(() => eq("build.redTests", build["redTests"], Number(field(steps, "byStep", "build-task-red", "n") ?? 0)));
        }
    }
    const usage = row["usage"];
    const agents = row["agents"];
    const byAgent = isObj(agents) && isObj(agents["byAgent"]) ? Object.values(agents["byAgent"]) : [];
    if (isObj(usage)) {
        const blocks = [
            ["usage.total", usage["total"]],
            ["usage.main", usage["main"]],
            ...Object.entries(isObj(usage["byModel"]) ? usage["byModel"] : {}).map(([m, u]) => [`usage.byModel.${m}`, u]),
            ...Object.entries(isObj(agents) && isObj(agents["byAgent"]) ? agents["byAgent"] : {}).map(([a, v]) => [`agents.byAgent.${a}.usage`, field(v, "usage")]),
        ];
        for (const [name, u] of blocks) {
            const tokens = field(u, "tokens");
            if (!isObj(tokens) || tokens["read"] === undefined)
                continue;
            checks.push(() => eq(`${name}.tokens.read`, tokens["read"], sumOf([tokens["input"], tokens["cacheWrite"], tokens["cacheRead"]])));
        }
        const total = usage["total"];
        const models = isObj(usage["byModel"]) ? Object.values(usage["byModel"]) : [];
        if (isObj(total) && models.length > 0) {
            checks.push(() => eq("usage.total.turns", total["turns"], sumOf(models.map((m) => field(m, "turns")))));
            for (const f of TOKEN_FIELDS) {
                if (field(total, "tokens", f) === undefined)
                    continue;
                checks.push(() => eq(`usage.total.tokens.${f}`, field(total, "tokens", f), sumOf(models.map((m) => field(m, "tokens", f)))));
            }
        }
        if (isObj(total) && total["compactions"] !== undefined) {
            checks.push(() => eq("usage.total.compactions", total["compactions"], sumOf([
                field(usage, "main", "compactions"),
                ...byAgent.map((a) => field(a, "usage", "compactions")),
            ])));
        }
        const peak = field(total, "context", "peak");
        if (typeof peak === "number") {
            const peaks = [
                field(usage, "main", "context", "peak"),
                ...byAgent.flatMap((a) => Array.isArray(field(a, "instances"))
                    ? field(a, "instances").map((i) => field(i, "contextPeak"))
                    : []),
            ].filter((v) => typeof v === "number");
            if (peaks.length > 0)
                checks.push(() => eq("usage.total.context.peak", peak, Math.max(...peaks)));
        }
    }
    if (isObj(agents) && isObj(agents["total"]) && isObj(agents["byAgent"])) {
        const total = agents["total"];
        for (const f of ["n", "errors"]) {
            checks.push(() => eq(`agents.total.${f}`, total[f], sumOf(byAgent.map((a) => field(a, f)))));
        }
        for (const [name, a] of Object.entries(agents["byAgent"])) {
            const instances = field(a, "instances");
            if (Array.isArray(instances)) {
                checks.push(() => eq(`agents.byAgent.${name}.n`, field(a, "n"), instances.length));
            }
        }
    }
    const tools = row["tools"];
    if (isObj(tools) && isObj(tools["total"]) && isObj(tools["byTool"])) {
        const parts = Object.values(tools["byTool"]);
        for (const f of ["calls", "errors"]) {
            checks.push(() => eq(`tools.total.${f}`, field(tools, "total", f), sumOf(parts.map((p) => field(p, f)))));
        }
    }
    const cli = field(row, "bkit", "cli");
    if (isObj(cli) && isObj(cli["byVerb"])) {
        checks.push(() => eq("bkit.cli.total", cli["total"], sumOf(Object.values(cli["byVerb"]))));
    }
    for (const check of checks) {
        const problem = check();
        if (problem !== undefined)
            return problem;
    }
    return undefined;
}
// ---------------------------------------------------------------------------
// Validate — reject malformed + unknown kind before write
// ---------------------------------------------------------------------------
export function validate(event) {
    if (!event || typeof event !== "object") {
        return { ok: false, reason: "event must be an object" };
    }
    const e = event;
    if (e["schema"] !== SCHEMA) {
        return { ok: false, reason: `schema must be ${SCHEMA} (got: ${String(e["schema"])})` };
    }
    for (const field of ["ts", "kind", "repo", "bkit", "by"]) {
        if (e[field] === undefined || e[field] === null) {
            return { ok: false, reason: `missing mandatory field: ${field}` };
        }
    }
    for (const flat of ["bkitVersion", "workflow", "step", "subagent", "model"]) {
        if (e[flat] !== undefined) {
            return { ok: false, reason: `${flat} is not a top-level field (bkit.version, by.*)` };
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
    const bkit = e["bkit"];
    // null on chat / run rows: the script found no bkit version in the repo's history at that time.
    const unknownVersion = bkit !== undefined &&
        isObj(bkit) &&
        bkit["version"] === null &&
        (e["kind"] === "chat" || e["kind"] === "run");
    if (!isObj(bkit) ||
        ((typeof bkit["version"] !== "string" || bkit["version"] === "") && !unknownVersion)) {
        return {
            ok: false,
            reason: "bkit.version must be a non-empty string (null on chat / run rows)",
        };
    }
    const by = e["by"];
    if (!isObj(by))
        return { ok: false, reason: "by must be an object" };
    if (typeof by["step"] !== "string" || by["step"] === "") {
        return { ok: false, reason: "by.step must be a non-empty string" };
    }
    for (const f of ["workflow", "subagent", "model"]) {
        if (by[f] !== undefined && (typeof by[f] !== "string" || by[f] === "")) {
            return { ok: false, reason: `by.${f} must be a non-empty string when present` };
        }
    }
    if (by["model"] !== undefined && by["subagent"] === undefined) {
        return { ok: false, reason: "by.model is set only on subagent rows" };
    }
    if (e["references"] !== undefined && !Array.isArray(e["references"])) {
        return { ok: false, reason: "references must be an array when present" };
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
    // Enforced on write only; `parse` stays tolerant so a free-text status row still reads.
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
    // firstTs / updates — the entry's age and row count, set by the writer (withLineage).
    if (AGED_KINDS.has(kind)) {
        const first = e["firstTs"];
        if (first !== undefined && (typeof first !== "number" || !(first <= e["ts"]))) {
            return { ok: false, reason: "firstTs must be a number no later than ts" };
        }
        const updates = e["updates"];
        if (updates !== undefined && (!Number.isInteger(updates) || updates < 1)) {
            return { ok: false, reason: "updates must be a positive integer" };
        }
    }
    else {
        for (const f of ["firstTs", "updates"]) {
            if (e[f] !== undefined)
                return { ok: false, reason: `${kind} rows do not carry ${f}` };
        }
    }
    const run = isObj(e["run"]) ? e["run"] : undefined;
    if (kind === "compliance" || kind === "counter") {
        if (typeof run?.["parentSha"] !== "string" || run["parentSha"] === "") {
            return { ok: false, reason: `${kind} row missing run.parentSha` };
        }
    }
    if (kind === "compliance") {
        const rule = e["rule"];
        if (!isObj(rule) || typeof rule["id"] !== "string" || rule["id"] === "") {
            return { ok: false, reason: "compliance row missing rule.id" };
        }
        if (!["pass", "fail", "n/a"].includes(rule["verdict"])) {
            return {
                ok: false,
                reason: `compliance rule.verdict must be pass|fail|n/a (got: ${String(rule["verdict"])})`,
            };
        }
    }
    if (kind === "counter") {
        const c = e["counter"];
        if (!isObj(c) ||
            typeof c["name"] !== "string" ||
            c["name"] === "" ||
            typeof c["value"] !== "number") {
            return { ok: false, reason: "counter row needs counter.name and a numeric counter.value" };
        }
        if (c["source"] !== "model-self-report" && c["source"] !== "shell-bus") {
            return { ok: false, reason: "counter.source must be model-self-report or shell-bus" };
        }
    }
    if (kind === "outcome") {
        if (run === undefined)
            return { ok: false, reason: "outcome row missing run" };
        if (run["parentSha"] !== undefined && typeof run["parentSha"] !== "string") {
            return { ok: false, reason: "outcome run.parentSha must be a string when present" };
        }
        if (run["pr"] !== undefined && typeof run["pr"] !== "number") {
            return { ok: false, reason: "outcome run.pr must be a number when present" };
        }
        const time = e["time"];
        // null: the run's start row is missing, so its time could not be measured.
        if (time !== null &&
            (!isObj(time) || ["start", "end", "totalMinutes"].some((f) => typeof time[f] !== "number"))) {
            return {
                ok: false,
                reason: "outcome row needs time.start, time.end and time.totalMinutes, or time: null",
            };
        }
        if (!OUTCOME_ENDINGS.has(e["ending"])) {
            return {
                ok: false,
                reason: `outcome ending must be done|close-failed (got: ${String(e["ending"])})`,
            };
        }
        const ledgers = e["ledgers"];
        if (typeof field(ledgers, "deferrals", "repo") !== "number" ||
            typeof field(ledgers, "failures", "repo") !== "number") {
            return {
                ok: false,
                reason: "outcome row needs ledgers.deferrals.repo and ledgers.failures.repo",
            };
        }
        for (const l of ["deferrals", "failures", "friction"]) {
            const added = field(ledgers, l, "added");
            if (added !== undefined && typeof added !== "number") {
                return { ok: false, reason: `outcome ledgers.${l}.added must be a number when present` };
            }
        }
        const source = field(e["plan"], "source");
        if (e["plan"] !== undefined && source !== "file" && source !== "converted") {
            return {
                ok: false,
                reason: `outcome plan.source must be file|converted (got: ${String(source)})`,
            };
        }
        const context = e["context"];
        if (context !== undefined) {
            const byAgent = field(context, "byAgent");
            if (!isObj(context) || typeof context["host"] !== "string" || !isObj(byAgent)) {
                return { ok: false, reason: "outcome context needs host and a byAgent object" };
            }
            for (const [agent, a] of Object.entries(byAgent)) {
                if (typeof field(a, "peak") !== "number" || typeof field(a, "runs") !== "number") {
                    return {
                        ok: false,
                        reason: `outcome context.byAgent.${agent} needs numeric peak and runs`,
                    };
                }
            }
        }
        const cov = field(e["ship"], "coverage");
        if (cov !== undefined) {
            if (!isObj(cov))
                return { ok: false, reason: "outcome ship.coverage must be an object" };
            for (const tier of ["unit", "integration", "e2e"]) {
                const t = cov[tier];
                if (t === undefined)
                    continue;
                if (!isObj(t))
                    return { ok: false, reason: `outcome ship.coverage.${tier} must be an object` };
                for (const m of ["lines", "branches", "functions", "statements"]) {
                    if (t[m] !== undefined && typeof t[m] !== "number") {
                        return { ok: false, reason: `outcome ship.coverage.${tier}.${m} must be a number` };
                    }
                }
            }
        }
    }
    if (kind === "chat") {
        if (!e["key"] || typeof e["key"] !== "string") {
            return { ok: false, reason: "chat row missing required field: key (<platform>:<sessionId>)" };
        }
        if (typeof field(e, "time", "start") !== "number" ||
            typeof field(e, "time", "end") !== "number") {
            return { ok: false, reason: "chat row needs time.start and time.end" };
        }
        if (typeof field(e, "scan", "bytes") !== "number") {
            return { ok: false, reason: "chat row needs scan.bytes" };
        }
        if (!Array.isArray(field(e, "run", "parentShas")) || !Array.isArray(field(e, "issue", "all"))) {
            return {
                ok: false,
                reason: "chat row needs run.parentShas and issue.all arrays (the join keys)",
            };
        }
    }
    if (kind === "run") {
        if (!e["key"] || typeof e["key"] !== "string") {
            return {
                ok: false,
                reason: "run row missing required field: key (<fid fp>:<workflow>:<start>)",
            };
        }
        if (typeof run?.["fid"] !== "string" || run["fid"] === "") {
            return { ok: false, reason: "run row missing required field: run.fid" };
        }
        if (typeof field(e, "time", "start") !== "number" ||
            typeof field(e, "time", "end") !== "number") {
            return { ok: false, reason: "run row needs time.start and time.end" };
        }
        if (typeof field(e, "scan", "rows") !== "number") {
            return { ok: false, reason: "run row needs scan.rows" };
        }
        if (!RUN_ENDINGS.has(e["ending"])) {
            return {
                ok: false,
                reason: `run ending must be one of ${[...RUN_ENDINGS].join("|")} (got: ${String(e["ending"])})`,
            };
        }
        if (run["parentSha"] !== null && typeof run["parentSha"] !== "string") {
            return { ok: false, reason: "run run.parentSha must be a string or null" };
        }
        if (!Array.isArray(run["parentShas"])) {
            return { ok: false, reason: "run row needs a run.parentShas array (the join keys)" };
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
    const totals = totalsProblem(e);
    if (totals !== undefined)
        return { ok: false, reason: `totals: ${totals}` };
    return { ok: true };
}
/**
 * Tolerant parse — per-line try/catch, skips + counts unparseable lines.
 * NEVER throws.
 *
 * No version gating — ALL well-formed rows are kept as written, `schema` or not;
 * {@link fold} reads each through {@link normalize}.
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
        const obj = parseJson(trimmed);
        if (obj.ok) {
            result.events.push(obj.value);
        }
        else {
            result.malformedLineCount++;
        }
    }
    return result;
}
/**
 * `ts` as a sortable number. A row may carry an ISO-string `ts` or none at all:
 * ISO strings parse; anything else sorts oldest.
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
/** Ascending `ts` comparator that stays consistent on string-`ts` and `ts`-less rows. Ties keep input order. */
export function compareTs(a, b) {
    const x = tsOrder(a.ts);
    const y = tsOrder(b.ts);
    return x < y ? -1 : x > y ? 1 : 0;
}
/**
 * Fold events into a Map keyed by per-kind composite identity, each row in the
 * current shape ({@link normalize}). Later rows (higher ts) win for the same key —
 * last-write-wins fold.
 */
export function fold(events) {
    // Sort by ts ascending so later rows overwrite earlier ones
    const sorted = events.map(normalizeEvent).sort(compareTs);
    const state = new Map();
    for (const event of sorted) {
        const key = identity(event);
        state.set(key, event);
    }
    return state;
}
const positiveInt = (v) => Number.isInteger(v) && v > 0 ? v : undefined;
/**
 * `firstTs` + `updates` of one entry from all of its rows, in any order. A row
 * carrying `updates` stands for that many rows, so the count survives compaction;
 * each later row adds one. Rows sharing a numeric `ts` are one write: a compacted
 * winner beside the pre-compaction copy a union merge brought back.
 */
export function lineage(rows) {
    let firstTs;
    let updates = 0;
    let prev;
    for (const r of [...rows].sort((a, b) => compareTs({ ts: a.ts }, { ts: b.ts }))) {
        for (const t of [r.firstTs, r.ts]) {
            if (typeof t === "number" && Number.isFinite(t) && (firstTs === undefined || t < firstTs)) {
                firstTs = t;
            }
        }
        const own = positiveInt(r.updates);
        const at = tsOrder(r.ts);
        updates =
            at === prev && Number.isFinite(at)
                ? Math.max(updates, own ?? updates)
                : Math.max(own ?? 0, updates + 1);
        prev = at;
    }
    return firstTs === undefined ? { updates } : { firstTs, updates };
}
/** `row` with `firstTs` + `updates` set to `l`, placed right after `ts` (at the end when it has none). */
export function placeLineage(row, l) {
    const fields = l.firstTs === undefined ? {} : { firstTs: l.firstTs };
    fields["updates"] = l.updates;
    const out = {};
    for (const [k, v] of Object.entries(row)) {
        if (k === "firstTs" || k === "updates")
            continue;
        out[k] = v;
        if (k === "ts")
            Object.assign(out, fields);
    }
    return "ts" in row ? out : { ...out, ...fields };
}
/** True for a row `bkit ledgers compact` folds: an {@link AGED_KINDS} kind with a non-empty string `key`. */
export const isAgedRow = (row) => AGED_KINDS.has(String(row["kind"])) && typeof row["key"] === "string" && row["key"] !== "";
/**
 * `row` about to be appended, with `firstTs` + `updates` carried forward from
 * `prior` (rows already in its ledger) and any supplied values replaced. A row
 * {@link isAgedRow} rejects is returned unchanged.
 */
export function withLineage(prior, row) {
    if (!isAgedRow(row))
        return row;
    const id = identity(normalizeEvent(row));
    const same = prior
        .map(normalizeEvent)
        .filter((p) => isAgedRow(p) && identity(p) === id);
    const { firstTs: _first, updates: _updates, ...fresh } = row;
    return placeLineage(row, lineage([...same, fresh]));
}
/** Reads every existing file in `paths` and folds all events together. */
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
    for (const e of allEvents.map(normalizeEvent)) {
        const version = e.bkit?.version;
        const v = typeof version === "string" && version !== "" ? version : "unknown";
        versionCounts[v] = (versionCounts[v] ?? 0) + 1;
    }
    const rowCount = allEvents.length;
    const maxRowsWarning = rowCount > MAX_ROWS_BEFORE_ROLLUP;
    if (maxRowsWarning) {
        console.warn(`[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: ${rowCount} rows > ${MAX_ROWS_BEFORE_ROLLUP}.`);
    }
    return {
        state: fold(allEvents),
        rowCount,
        malformedLineCount: totalMalformed,
        versionCounts,
        maxRowsWarning,
    };
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
 * `med·N` = the median of that workflow's previous N runs (rolling), a secondary
 * compliance line, and the ledger
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
        const w = ev.by?.workflow || "unknown";
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
        .filter((e) => e.kind === "outcome" && e.by?.workflow === workflow)
        .sort(compareTs);
    const cur = runs.at(-1);
    // Baseline only against runs of the same plan source — a converted run's plan was
    // written by the build from its input, so mixing it with file runs skews every median.
    // An old `brief` row (no plan file) counts as converted.
    const oldBrief = (r) => r?.plan?.source === "brief";
    const converted = (r) => r?.plan?.source === "converted" || oldBrief(r);
    const prev = runs
        .slice(0, -1)
        .filter((r) => converted(r) === converted(cur))
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
        const medCell = (get, fmt = String) => {
            const vals = prev.map(get).filter((v) => typeof v === "number");
            if (vals.length < RUN_BASELINE_MIN)
                return "—";
            const m = median(vals);
            return m === null ? "—" : fmt(m);
        };
        const mins = (n) => `${n} (${humanizeDuration(n * 60)})`;
        const show = (label, get, fmt) => {
            const v = get(cur);
            if (typeof v === "number")
                row(label, fmt ? fmt(v) : String(v), medCell(get, fmt));
        };
        show("time.totalMinutes", (r) => r.time?.totalMinutes, mins);
        const total = cur.lines?.total;
        if (total) {
            row("lines.total.changed", `${total.changed} (+${total.added}/-${total.deleted})`, medCell((r) => r.lines?.total?.changed));
            show("lines.total.files", (r) => r.lines?.total?.files);
        }
        show("plan.total.tasks", (r) => r.plan?.total?.tasks);
        if (cur.ending === "close-failed")
            row("ending", "close-failed", "—");
        // Instinct-loop deltas — friction is the featured signal (shown even at 0).
        show("ledgers.friction.added", (r) => r.ledgers?.friction?.added);
        show("ledgers.deferrals.added", (r) => r.ledgers?.deferrals?.added);
        show("ledgers.failures.added", (r) => r.ledgers?.failures?.added);
    }
    // Compliance — this run's rows: the run row's run.parentSha, else the newest
    // same-workflow compliance group.
    const complianceRows = events.filter((e) => e.kind === "compliance" && e.by?.workflow === workflow);
    const newestSha = complianceRows.slice().sort((a, b) => compareTs(b, a))[0]?.run?.parentSha;
    const curSha = cur?.run?.parentSha;
    const compSha = complianceRows.some((c) => c.run?.parentSha === curSha) ? curSha : newestSha;
    if (compSha) {
        const comp = complianceRows.filter((c) => c.run?.parentSha === compSha);
        const pass = comp.filter((c) => c.rule?.verdict === "pass").length;
        const fail = comp.filter((c) => c.rule?.verdict === "fail").length;
        const na = comp.filter((c) => c.rule?.verdict === "n/a").length;
        const denom = pass + fail + na;
        const rate = denom > 0 ? Math.round((pass / denom) * 100) : 0;
        row("compliance", `${pass} pass · ${fail} fail · ${na} n/a (${rate}%)`, "—");
    }
    // Attempts — this run's *_ATTEMPT counter, else the newest same-workflow one.
    const attempts = events
        .filter((e) => e.kind === "counter" &&
        e.by?.workflow === workflow &&
        /_ATTEMPT$/.test(e.counter?.name ?? ""))
        .sort((a, b) => compareTs(b, a));
    const attempt = attempts.find((c) => c.run?.parentSha === curSha) ?? attempts[0];
    if (attempt)
        row("attempts", `${attempt.counter.name} ${attempt.counter.value}`, "—");
    if (tableRows.length > 0) {
        lines.push(`| metric | this run | med·${RUN_BASELINE_WINDOW} |`, "| --- | --- | --- |", ...tableRows, "");
    }
    lines.push(`\`med·${RUN_BASELINE_WINDOW}\` = median of the previous ${RUN_BASELINE_WINDOW} ${workflow}${converted(cur) ? " converted" : ""} runs (— if < ${RUN_BASELINE_MIN}) · ledger ${result.rowCount} rows, ${result.malformedLineCount} malformed`);
    if ([cur, ...prev].some(oldBrief))
        lines.push("Old `plan.source: brief` rows count as `converted`.");
    lines.push(...maxRowsLines);
    return { ...base, lines };
}
