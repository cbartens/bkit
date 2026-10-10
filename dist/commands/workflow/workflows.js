// bkit workflows start|fail|close — a phase workflow's lifecycle state.
//
// start  takes the feature lock (or checks the one Step 1 took) and opens a run
//        with a `workflow-started` row, unless this is a resume of the same
//        workflow's IN_PROGRESS run.
// fail   the state half of every Failure Path: `workflow-failed` row, abort an
//        in-progress rebase, release the lock, clear the sentinels, and say
//        whether a handover is due. Tracker comments and the abort commit stay in
//        the workflow.
// close  `workflow-done` row, the run's counter and outcome rows in
//        `.bkit/stats.jsonl`, this workflow's telemetry report, and the artifact
//        link list for the close comment. The compliance grader and the roadmap
//        fold are separate commands; the output says both are due.
import * as fs from "node:fs";
import * as path from "node:path";
import { appendLine, fold, runNumber, statusTimestamp, } from "../../ledgers/status.js";
import { appendLine as telemetryLine, foldFrom, resolveRepoSlug, validate, workflowTelemetry, } from "../../ledgers/telemetry.js";
import { readBkitVersion } from "../../install/version-file.js";
import { CommandError, EXIT, git, parseJson, repoRoot, runGit, statusLocation, statusRelPath, } from "../lib.js";
import { EXIT_REMOVE_FAILED, EXIT_SPLIT_BUCKET, acquireWorkflowLock, lockRoot, owns, readHolder, releaseLock, resolveMonth, workflowLockPath, } from "./locks.js";
import { FEATURE_STATUS } from "./roadmap.js";
import { EXIT_NO_STATUS, WORKFLOW_FLAG, positiveInt, readStatusEvents, str } from "./status.js";
/** Sentinels a workflow leaves in its logs folder; either one existing means a handover is due. */
export const SENTINELS = [".rebase-failed", ".deferred-blocked"];
/** Exit code (start --lock-held): the lock is missing or belongs to another owner. */
export const EXIT_LOCK_NOT_HELD = 6;
function workflowName(ctx) {
    const workflow = String(ctx.flags.workflow);
    if (!Object.hasOwn(FEATURE_STATUS, workflow))
        throw new CommandError(EXIT.USAGE, `--workflow must be ${Object.keys(FEATURE_STATUS).join(", ")}`);
    return workflow;
}
/**
 * start and close work in the current tree (ship: its book root), the root
 * `git rev-parse --show-toplevel` reports.
 */
function whereInTree(ctx, workflow, fid) {
    const root = repoRoot(ctx.cwd);
    const month = resolveMonth(root, fid, str(ctx.flags.month));
    const devPushes = ctx.flags.devPushes === true;
    const tree = workflow === "ship"
        ? lockRoot(ctx.cwd, workflow, devPushes)
        : (git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? root);
    const file = str(ctx.flags.file);
    const status = file ? path.resolve(ctx.cwd, file) : path.join(tree, statusRelPath(month, fid));
    return { root, month, tree, status };
}
const headSha = (cwd) => git(cwd, ["rev-parse", "HEAD"]) ?? "";
// ---------------------------------------------------------------------------
// start
// ---------------------------------------------------------------------------
function checkHeldLock(file, who) {
    const holder = readHolder(file);
    if (holder === undefined)
        throw new CommandError(EXIT_LOCK_NOT_HELD, `no lock at ${file}`);
    if (!owns(holder, who))
        throw new CommandError(EXIT_LOCK_NOT_HELD, `${file} is held by another owner: ${holder.line}`);
}
// ---------------------------------------------------------------------------
// fail
// ---------------------------------------------------------------------------
/**
 * Abort a rebase left in progress in `tree`. `git rev-parse --git-path X` always
 * exits 0 (it only computes the path), so the directory's existence is the test.
 */
function abortRebase(tree, log) {
    const inProgress = ["rebase-merge", "rebase-apply"].some((name) => {
        const p = git(tree, ["rev-parse", "--path-format=absolute", "--git-path", name]);
        return p !== null && fs.existsSync(p);
    });
    if (!inProgress)
        return false;
    const res = runGit(tree, ["rebase", "--abort"]);
    if (!res.ok)
        log(`git rebase --abort failed in ${tree}: ${res.stderr}`);
    return res.ok;
}
/** Rows of a JSONL ledger; malformed lines are skipped, a missing file is empty. */
function ledgerRows(file) {
    if (!fs.existsSync(file))
        return [];
    return fs
        .readFileSync(file, "utf-8")
        .split("\n")
        .filter((l) => l.trim() !== "")
        .flatMap((l) => {
        const row = parseObject(l);
        return row === undefined ? [] : [row];
    });
}
/** Not JSON reads as undefined: callers treat that as "no value" and say what it means for them. */
function jsonOrUndefined(text) {
    const parsed = parseJson(text);
    return parsed.ok ? parsed.value : undefined;
}
function parseObject(line) {
    const v = jsonOrUndefined(line);
    return v !== null && typeof v === "object" ? v : undefined;
}
const distinctKeys = (rows) => new Set(rows.filter((r) => r.key !== undefined).map((r) => String(r.key))).size;
/**
 * Cumulative distinct deferrals / failures, and how many keys THIS run added to
 * each instinct ledger (rows of this workflow at or after the run's start). With
 * no start time the per-run counts are unknown, so they are omitted rather than
 * counting the ledger's whole history as this run's.
 */
function ledgerCounts(tree, workflow, startMs) {
    const deferrals = ledgerRows(path.join(tree, "docs", "deferrals.jsonl"));
    const failures = ledgerRows(path.join(tree, "docs", "failures.jsonl"));
    const friction = ledgerRows(path.join(tree, ".bkit", "friction.jsonl"));
    const added = (rows) => distinctKeys(rows.filter((r) => r.workflow === workflow && Number(r.ts) >= startMs));
    return {
        deferrals: distinctKeys(deferrals.filter((r) => r.kind === "deferral")),
        failures: distinctKeys(failures.filter((r) => r.kind === "failure")),
        ...(startMs === undefined
            ? {}
            : {
                frictionAdded: added(friction),
                deferralsAdded: added(deferrals),
                failuresAdded: added(failures),
            }),
    };
}
/** `git diff --shortstat` numbers; 0 for anything absent or a range git rejects. */
export function diffStat(cwd, range) {
    const out = runGit(cwd, ["diff", "--shortstat", range]).stdout;
    const num = (re) => Number(re.exec(out)?.[1] ?? 0);
    const linesAdded = num(/(\d+) insertions?\(/);
    const linesDeleted = num(/(\d+) deletions?\(/);
    return {
        linesAdded,
        linesDeleted,
        linesChanged: linesAdded + linesDeleted,
        filesChanged: num(/(\d+) files? changed/),
    };
}
/** Checklist items (`- [`) across the feature's plan and sub-plans. */
function taskCount(tree, month, fid) {
    const dir = path.join(tree, "docs", "plans", month);
    if (!fs.existsSync(dir))
        return 0;
    return fs
        .readdirSync(dir)
        .filter((f) => f.startsWith(`${fid}-plan`) && f.endsWith(".md"))
        .flatMap((f) => fs.readFileSync(path.join(dir, f), "utf-8").split("\n"))
        .filter((l) => l.startsWith("- [")).length;
}
/** Per-tier coverage from `coverage/{tier}/coverage-summary.json`; undefined when none. */
function coverage(tree) {
    const out = {};
    for (const tier of ["unit", "integration", "e2e"]) {
        const file = path.join(tree, "coverage", tier, "coverage-summary.json");
        if (!fs.existsSync(file))
            continue;
        const total = parseObject(fs.readFileSync(file, "utf-8"))?.total;
        if (typeof total?.lines?.pct !== "number")
            continue;
        const stats = {};
        for (const k of ["lines", "branches", "functions", "statements"]) {
            const pct = total[k]?.pct;
            if (typeof pct === "number")
                stats[k] = pct;
        }
        out[tier] = stats;
    }
    return Object.keys(out).length ? out : undefined;
}
/** Last row of `type` for `workflow`, in `at` order (a union merge may interleave lines). */
function lastOfType(events, type, workflow) {
    return events
        .filter((e) => e.type === type && e.workflow === workflow)
        .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
        .at(-1);
}
/** Append telemetry rows; best-effort, so a bad path is logged and never fails the close. */
function appendStats(file, rows, log) {
    const valid = rows.filter((r) => {
        const v = validate(r);
        if (!v.ok)
            log(`[bkit-telemetry] ${String(r.kind)} row invalid, not written: ${v.reason}`);
        return v.ok;
    });
    if (valid.length === 0)
        return false;
    try {
        fs.appendFileSync(file, valid.map((r) => `${telemetryLine(r)}\n`).join(""));
        return true;
    }
    catch (err) {
        // Telemetry never gates a close: report the failed append and carry on.
        log(`[bkit-telemetry] append failed: ${file} — ${err.message}`);
        return false;
    }
}
/** Markdown link per feature doc and per log of this workflow, as on `ref`. */
export function artifactLinks(root, ref, month, fid, workflow, ownerRepo) {
    const list = (dir) => (git(root, ["ls-tree", "-r", "--name-only", ref, "--", dir]) ?? "").split("\n").filter(Boolean);
    const docs = list(`docs/plans/${month}/`).filter((f) => path.posix.dirname(f) === `docs/plans/${month}` &&
        path.posix.basename(f).startsWith(`${fid}-`));
    const logs = list(`docs/plans/${month}/logs/${fid}/`).filter((f) => path.posix.basename(f).startsWith(`${workflow}-`));
    return [...docs, ...logs].map((f) => ({
        name: path.posix.basename(f),
        path: f,
        url: `https://github.com/${ownerRepo}/blob/${ref}/${f}`,
    }));
}
// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------
const FID_FLAG = { name: "fid", type: "string", required: true, help: "feature id" };
const MONTH_FLAG = {
    name: "month",
    type: "string",
    help: "month bucket YYYYMM (default: the feature's bucket, else this UTC month)",
};
const DEV_PUSHES_FLAG = {
    name: "dev-pushes",
    type: "boolean",
    help: "ship only: this runtime pushes to dev (logs book in the main checkout)",
};
const STATUS_FILE_FLAG = {
    name: "file",
    type: "string",
    help: "path to status.jsonl (default: derived from --workflow, --fid, --month)",
};
const TOKEN_FLAG = {
    name: "token",
    type: "string",
    help: "the lock token `bkit locks acquire` returned (default: match workflow and fid)",
};
export const workflowsCommand = {
    noun: "workflows",
    summary: "Start, fail and close a phase workflow run.",
    verbs: {
        start: {
            summary: "Take the feature lock and open a run (workflow-started unless resuming).",
            flags: [
                WORKFLOW_FLAG,
                FID_FLAG,
                MONTH_FLAG,
                DEV_PUSHES_FLAG,
                STATUS_FILE_FLAG,
                {
                    name: "lock-held",
                    type: "boolean",
                    help: "Step 1 already took the lock: check it is ours instead of acquiring",
                },
                TOKEN_FLAG,
            ],
            output: {
                lock: "{path, month, token, reclaimed} of the lock taken, or {path} with --lock-held",
                file: "absolute path to status.jsonl",
                resumed: "the latest run was this workflow, IN_PROGRESS: no new row",
                row: "the appended workflow-started row, or null when resuming",
                run: "which run of the workflow this is (1-based)",
            },
            exitCodes: {
                [EXIT_NO_STATUS]: "status.jsonl is not valid",
                [EXIT_SPLIT_BUCKET]: "the feature has logs in more than one month bucket",
                [EXIT_LOCK_NOT_HELD]: "--lock-held: the lock is missing or belongs to another owner",
            },
            run: (ctx) => {
                const workflow = workflowName(ctx);
                const fid = String(ctx.flags.fid);
                const devPushes = ctx.flags.devPushes === true;
                const token = str(ctx.flags.token);
                if (token !== undefined && ctx.flags.lockHeld !== true)
                    throw new CommandError(EXIT.USAGE, "--token applies with --lock-held only");
                const where = whereInTree(ctx, workflow, fid);
                let lock;
                if (ctx.flags.lockHeld === true) {
                    const file = workflowLockPath(lockRoot(ctx.cwd, workflow, devPushes), where.month, fid);
                    checkHeldLock(file, { workflow, fid, token });
                    lock = { path: file };
                }
                else {
                    lock = {
                        ...acquireWorkflowLock({
                            cwd: ctx.cwd,
                            workflow,
                            fid,
                            month: where.month,
                            devPushes,
                            log: ctx.log,
                        }),
                    };
                }
                const file = where.status;
                fs.mkdirSync(path.dirname(file), { recursive: true });
                if (!fs.existsSync(file))
                    fs.writeFileSync(file, "");
                const latest = fold(readStatusEvents(file)).at(-1);
                const resumed = latest?.workflow === workflow && latest.status === "IN_PROGRESS";
                let row = null;
                if (!resumed) {
                    row = {
                        type: "workflow-started",
                        workflow,
                        at: statusTimestamp(),
                        parentSha: headSha(path.dirname(file)),
                    };
                    fs.appendFileSync(file, appendLine(row));
                }
                ctx.emit({
                    lock,
                    file,
                    resumed,
                    row,
                    run: runNumber(fold(readStatusEvents(file)), workflow),
                });
                return EXIT.OK;
            },
        },
        fail: {
            summary: "Failure Path state: workflow-failed row, abort rebase, release lock, clear sentinels.",
            flags: [
                WORKFLOW_FLAG,
                FID_FLAG,
                MONTH_FLAG,
                DEV_PUSHES_FLAG,
                STATUS_FILE_FLAG,
                TOKEN_FLAG,
                {
                    name: "max-exceeded",
                    type: "boolean",
                    help: "the failure is a MAX_* attempt limit being exceeded (a handover is due)",
                },
            ],
            output: {
                row: "the appended workflow-failed row, or null when status.jsonl does not exist",
                rebaseAborted: "an in-progress rebase was found and aborted",
                lock: "{path, existed, released, heldBy}: heldBy is another owner's lock line, left in place",
                sentinels: "[{name, path}] sentinels that existed before this call removed them",
                handoverNeeded: "--max-exceeded, or a sentinel existed: write the abort handover",
            },
            exitCodes: {
                [EXIT_SPLIT_BUCKET]: "no --month and the feature has logs in more than one month bucket",
                [EXIT_REMOVE_FAILED]: "the lock file is still there after removing it (everything else was done)",
            },
            run: (ctx) => {
                const workflow = workflowName(ctx);
                const fid = String(ctx.flags.fid);
                const devPushes = ctx.flags.devPushes === true;
                const root = repoRoot(ctx.cwd);
                const month = resolveMonth(root, fid, str(ctx.flags.month));
                const file = str(ctx.flags.file);
                const status = file
                    ? path.resolve(ctx.cwd, file)
                    : statusLocation({ cwd: ctx.cwd, workflow, fid, month, devPushes }).path;
                // The run's own tree: the feature worktree when there is one, else this checkout.
                // Never the main checkout behind a worktree, where a rebase would be a human's.
                const worktree = path.join(root, ".worktrees", fid);
                const tree = fs.existsSync(worktree)
                    ? worktree
                    : (git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? root);
                // Abort first: the abort resets the tree, which would drop a row appended to a
                // tracked status.jsonl before it.
                const rebaseAborted = abortRebase(tree, ctx.log);
                let row = null;
                if (fs.existsSync(status)) {
                    row = { type: "workflow-failed", workflow, at: statusTimestamp() };
                    fs.appendFileSync(status, appendLine(row));
                }
                else {
                    ctx.log(`${status} does not exist — no workflow-failed row written`);
                }
                const lockFile = workflowLockPath(lockRoot(ctx.cwd, workflow, devPushes), month, fid);
                const { removeFailed, ...lock } = releaseLock(lockFile, {
                    workflow,
                    fid,
                    token: str(ctx.flags.token),
                });
                if (lock.heldBy !== null)
                    ctx.log(`${lockFile} belongs to another owner, left in place: ${lock.heldBy}`);
                if (removeFailed)
                    ctx.log(`lock removal failed: ${lockFile}`);
                // Each sentinel is cleared where it was created: `.rebase-failed` in the run's
                // tree, `.deferred-blocked` beside status.jsonl (ship: the book root).
                const logDirs = new Set([
                    path.join(tree, "docs", "plans", month, "logs", fid),
                    path.dirname(status),
                ]);
                const sentinels = [];
                for (const dir of logDirs) {
                    for (const name of SENTINELS) {
                        const p = path.join(dir, name);
                        if (!fs.existsSync(p))
                            continue;
                        sentinels.push({ name, path: p });
                        fs.rmSync(p, { force: true });
                    }
                }
                ctx.emit({
                    row,
                    rebaseAborted,
                    lock,
                    sentinels,
                    handoverNeeded: ctx.flags.maxExceeded === true || sentinels.length > 0,
                });
                return removeFailed ? EXIT_REMOVE_FAILED : EXIT.OK;
            },
        },
        close: {
            summary: "workflow-done row, counter + outcome telemetry rows, report, artifact links.",
            flags: [
                WORKFLOW_FLAG,
                FID_FLAG,
                MONTH_FLAG,
                DEV_PUSHES_FLAG,
                STATUS_FILE_FLAG,
                {
                    name: "pr-number",
                    type: "string",
                    help: "ship: the merged PR number (outcome row prNumber)",
                },
                {
                    name: "squash-sha",
                    type: "string",
                    help: "ship: the PR's squash commit; size is measured over it (default: run start..HEAD)",
                },
                {
                    name: "ref",
                    type: "string",
                    help: "branch the artifact links point at (default: dev for design / plan / ship, else the current branch)",
                },
                {
                    name: "owner-repo",
                    type: "string",
                    help: "owner/repo for links (default: from the origin remote)",
                },
            ],
            output: {
                row: "the appended workflow-done row",
                counterRow: "the {WORKFLOW}_ATTEMPT counter row written to .bkit/stats.jsonl, or null if invalid",
                outcomeRow: "the outcome row written to .bkit/stats.jsonl, or null if invalid",
                telemetryWritten: "the stats rows were appended (false: append failed, logged, close continues)",
                report: "this workflow's telemetry report lines, for the close comment",
                artifacts: "[{name, path, url}] feature docs and this workflow's logs on --ref",
                artifactLinks: "the same as markdown `- [name](url)` lines",
                complyNeeded: "always true: `bkit comply --phase=<workflow>` runs BEFORE this close, so `report` carries this run's grade (not run here)",
                roadmapFoldNeeded: "always true: append the feature row and run `bkit roadmap fold` (not run here)",
                featureStatus: "roadmap status this close moves the feature to",
            },
            exitCodes: {
                [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON (nothing written)",
                [EXIT_SPLIT_BUCKET]: "no --month and the feature has logs in more than one month bucket",
            },
            run: (ctx) => {
                const workflow = workflowName(ctx);
                const fid = String(ctx.flags.fid);
                const where = whereInTree(ctx, workflow, fid);
                const events = readStatusEvents(where.status);
                const prNumber = positiveInt(ctx.flags.prNumber, "pr-number");
                const squash = str(ctx.flags.squashSha);
                if (squash !== undefined && !/^[0-9a-f]{7,40}$/.test(squash))
                    throw new CommandError(EXIT.USAGE, `--squash-sha "${squash}" is not a commit sha`);
                const row = { type: "workflow-done", workflow, at: statusTimestamp() };
                fs.appendFileSync(where.status, appendLine(row));
                const repo = resolveRepoSlug(where.root) || "unknown/repo";
                const bkitVersion = readBkitVersion(path.join(where.root, ".bkit", "version"))?.pinnedVersion || "unknown";
                const parentSha = headSha(where.tree);
                const step = `${workflow}-close-workflow`;
                const started = lastOfType(events, "workflow-started", workflow);
                const startAt = started?.at;
                const startMs = startAt ? Date.parse(startAt) : NaN;
                const startKnown = Number.isFinite(startMs) ? startMs : undefined;
                const planSource = events
                    .filter((e) => e.type === "workflow-meta" &&
                    e.workflow === workflow &&
                    (startAt === undefined || e.at >= startAt) &&
                    e.planSource)
                    .at(-1);
                const base = typeof started?.parentSha === "string" ? started.parentSha : "";
                const range = squash
                    ? `${squash}^..${squash}`
                    : base
                        ? `${base}..HEAD`
                        : "origin/dev...HEAD";
                const durationSeconds = startKnown === undefined ? 0 : Math.max(0, Math.floor((Date.now() - startKnown) / 1000));
                const startedRows = new Set(events
                    .filter((e) => e.type === "workflow-started" && e.workflow === workflow)
                    .map((e) => e.at)).size;
                const ts = Date.now();
                const counterRow = {
                    ts,
                    kind: "counter",
                    workflow,
                    repo,
                    bkitVersion,
                    step,
                    counterName: `${workflow.toUpperCase()}_ATTEMPT`,
                    counterValue: Math.max(1, startedRows),
                    counterSource: "shell-bus",
                    parentSha,
                };
                const cov = workflow === "ship" ? coverage(where.tree) : undefined;
                const outcomeRow = {
                    ts: ts + 1,
                    kind: "outcome",
                    workflow,
                    repo,
                    bkitVersion,
                    step,
                    parentSha,
                    ...(prNumber === undefined ? {} : { prNumber }),
                    ...diffStat(where.tree, range),
                    taskCount: taskCount(where.tree, where.month, fid),
                    durationSeconds,
                    ...ledgerCounts(where.tree, workflow, startKnown),
                    ...(planSource?.planSource ? { planSource: planSource.planSource } : {}),
                    ...(cov ? { coverage: cov } : {}),
                };
                const stats = path.join(where.tree, ".bkit", "stats.jsonl");
                const telemetryWritten = appendStats(stats, [counterRow, outcomeRow], ctx.log);
                const report = fs.existsSync(stats)
                    ? workflowTelemetry(foldFrom([stats]), workflow).lines
                    : ["[bkit-telemetry] stats.jsonl not found — no telemetry rows yet"];
                const ref = str(ctx.flags.ref) ??
                    (["design", "plan", "ship"].includes(workflow)
                        ? "dev"
                        : (git(ctx.cwd, ["branch", "--show-current"]) ?? "HEAD"));
                const artifacts = artifactLinks(where.root, ref, where.month, fid, workflow, str(ctx.flags.ownerRepo) ?? repo);
                ctx.emit({
                    row,
                    counterRow: validate(counterRow).ok ? counterRow : null,
                    outcomeRow: validate(outcomeRow).ok ? outcomeRow : null,
                    telemetryWritten,
                    report,
                    artifacts,
                    artifactLinks: artifacts.map((a) => `- [${a.name}](${a.url})`).join("\n"),
                    complyNeeded: true,
                    roadmapFoldNeeded: true,
                    featureStatus: FEATURE_STATUS[workflow],
                });
                return EXIT.OK;
            },
        },
    },
};
