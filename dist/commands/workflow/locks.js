// bkit locks acquire|release — the per-feature workflow lock.
//
// `docs/plans/{month}/logs/{fid}/.lock` in the main checkout: one phase workflow
// per feature at a time. A lock left behind is reclaimed as soon as its holder is
// idle: its run is not IN_PROGRESS, or stepped no sooner than 30 minutes ago. The
// lock file's own age is not checked.
//
// The lock holds one line, `{at} {workflow} {fid} {token}`. Release removes only a
// lock this caller owns (same token, else same workflow and feature), so a Failure
// Path that never got the lock cannot delete the holder's.
import { randomBytes } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { fold, lastRun, statusTimestamp, } from "../../ledgers/status.js";
import { CommandError, EXIT, parseJson, repoRoot, statusRelPath, utcMonth, } from "../lib.js";
import { str } from "./status.js";
/** A workflow lock whose holder shows no sign of life for this long is stale. */
export const WORKFLOW_LOCK_IDLE_S = 1800;
/** Exit code: the feature has logs in more than one month bucket. */
export const EXIT_SPLIT_BUCKET = 7;
/** Exit code: the lock belongs to another owner and was left in place. */
export const EXIT_NOT_OWNER = 4;
/** Exit code: the lock file is still there after removing it. */
export const EXIT_REMOVE_FAILED = 5;
const KINDS = ["workflow"];
// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const MONTH_DIR = /^[0-9]{6}$/;
/** Month buckets under `docs/plans/` that hold logs for `fid`, oldest first. */
export function monthBuckets(root, fid) {
    const plans = path.join(root, "docs", "plans");
    if (!fs.existsSync(plans))
        return [];
    return fs
        .readdirSync(plans)
        .filter((m) => MONTH_DIR.test(m) &&
        fs.statSync(path.join(plans, m, "logs", fid), { throwIfNoEntry: false })?.isDirectory())
        .sort();
}
/**
 * The feature's month bucket: `--month` when given, else the one bucket its logs
 * are already in, else this UTC month. A feature split across buckets is refused.
 */
export function resolveMonth(root, fid, month) {
    if (month !== undefined) {
        if (!MONTH_DIR.test(month))
            throw new CommandError(EXIT.USAGE, "--month must be YYYYMM");
        return month;
    }
    const buckets = monthBuckets(root, fid);
    if (buckets.length > 1) {
        throw new CommandError(EXIT_SPLIT_BUCKET, `${fid} has logs in more than one month bucket (${buckets.join(", ")}) — consolidate into a single bucket, then re-run`);
    }
    return buckets[0] ?? utcMonth();
}
/** The feature's workflow lock, in the main checkout `root` (gitignored). */
export const workflowLockPath = (root, month, fid) => path.join(root, "docs", "plans", month, "logs", fid, ".lock");
export function readHolder(file) {
    if (!fs.existsSync(file))
        return undefined;
    const line = fs.readFileSync(file, "utf-8").trim();
    const [at, workflow, fid, token] = line.split(/\s+/);
    return { line, at, workflow, fid, token };
}
/** Create `file` only if absent (`set -C`); false when someone else holds it. */
export function tryCreate(file, line) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const fd = openExclusive(file);
    if (fd === undefined)
        return false;
    fs.writeSync(fd, `${line}\n`);
    fs.closeSync(fd);
    return true;
}
function openExclusive(file) {
    try {
        return fs.openSync(file, "wx");
    }
    catch (err) {
        // EEXIST is the expected "someone holds it" answer; anything else is a real error.
        if (err.code === "EEXIST")
            return undefined;
        throw err;
    }
}
const newToken = () => randomBytes(4).toString("hex");
const lockLine = (workflow, fid, token) => `${statusTimestamp()} ${workflow} ${fid} ${token}`;
/** The caller owns the lock: same token when it gave one, else same workflow and feature. */
export function owns(holder, who) {
    if (who.token !== undefined)
        return holder.token === who.token;
    return holder.workflow === who.workflow && (holder.fid === undefined || holder.fid === who.fid);
}
/** Why a held workflow lock is still live, or why it may be reclaimed. */
function liveReason(root, month, fid, holder, now) {
    const rel = statusRelPath(month, fid);
    const worktreeCopy = path.join(root, ".worktrees", fid, rel);
    const own = fs.existsSync(worktreeCopy) ? worktreeCopy : path.join(root, rel);
    const run = holder.workflow === undefined ? undefined : lastRun(readRunsLenient(own), holder.workflow);
    const lastAt = run?.steps.at(-1)?.at;
    if (run?.status === "IN_PROGRESS" && lastAt) {
        const idle = Math.floor((now - Date.parse(lastAt)) / 1000);
        if (idle < WORKFLOW_LOCK_IDLE_S)
            return { live: `idle ${idle}s` };
    }
    if (run === undefined)
        return { reason: "orphaned" };
    return { reason: run.status === "IN_PROGRESS" ? "stale" : "finished" };
}
/**
 * Fold a status log for the lock cross-check. A missing or malformed log shows no
 * run: there is no evidence the holder is alive, so the lock is reclaimed.
 */
function readRunsLenient(file) {
    if (!fs.existsSync(file))
        return [];
    const raw = fs.readFileSync(file, "utf-8").trim();
    const events = [];
    for (const line of raw.split("\n").map((l) => l.trim())) {
        if (line === "")
            continue;
        const parsed = parseJson(line);
        if (!parsed.ok)
            return [];
        events.push(parsed.value);
    }
    return fold(events);
}
export function acquireWorkflowLock(opts) {
    const root = repoRoot(opts.cwd);
    const month = resolveMonth(root, opts.fid, opts.month);
    const file = workflowLockPath(root, month, opts.fid);
    const token = newToken();
    const line = lockLine(opts.workflow, opts.fid, token);
    if (tryCreate(file, line))
        return { path: file, month, token, reclaimed: null };
    const holder = readHolder(file) ?? { line: "" };
    const verdict = liveReason(root, month, opts.fid, holder, Date.now());
    if ("live" in verdict) {
        throw new CommandError(EXIT.NO, `workflow already running for ${opts.fid} (workflow=${holder.workflow ?? "?"}, ${verdict.live})`);
    }
    opts.log(`reclaiming ${verdict.reason} lock for ${opts.fid}: ${holder.line}`);
    fs.rmSync(file, { force: true });
    if (!tryCreate(file, line))
        throw new CommandError(EXIT.NO, `lock contended for ${opts.fid}`);
    return { path: file, month, token, reclaimed: { holder: holder.line, reason: verdict.reason } };
}
/**
 * Remove a lock this caller owns. Missing is fine (already released); another
 * owner's lock is left in place and reported.
 */
export function releaseLock(file, who) {
    const holder = readHolder(file);
    const result = { path: file, existed: false, released: false, heldBy: null, removeFailed: false };
    if (holder === undefined)
        return result;
    if (!owns(holder, who))
        return { ...result, existed: true, heldBy: holder.line };
    fs.rmSync(file, { force: true });
    const left = fs.existsSync(file);
    return { ...result, existed: true, released: !left, removeFailed: left };
}
// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------
const KIND_FLAG = {
    name: "kind",
    type: "string",
    required: true,
    help: "workflow (the per-feature .lock)",
};
const LOCK_WORKFLOW_FLAG = {
    name: "workflow",
    type: "string",
    required: true,
    help: "workflow name: design, plan, build, debug, ship (written into the lock)",
};
const FID_FLAG = { name: "fid", type: "string", required: true, help: "feature id" };
const MONTH_FLAG = {
    name: "month",
    type: "string",
    help: "workflow kind: month bucket YYYYMM (default: the feature's bucket, else this UTC month)",
};
function kindOf(ctx) {
    const kind = String(ctx.flags.kind);
    if (!KINDS.includes(kind))
        throw new CommandError(EXIT.USAGE, "--kind must be workflow");
    return kind;
}
export const locksCommand = {
    noun: "locks",
    summary: "Acquire and release the per-feature workflow lock.",
    verbs: {
        acquire: {
            summary: "Take the workflow lock, reclaiming a dead holder's.",
            flags: [KIND_FLAG, LOCK_WORKFLOW_FLAG, FID_FLAG, MONTH_FLAG],
            output: {
                kind: "workflow",
                path: "absolute path of the lock file",
                token: "this holder's token; pass it to release",
                month: "the month bucket",
                reclaimed: "{holder, reason: finished|stale|orphaned}; null when none",
            },
            exitCodes: {
                [EXIT_SPLIT_BUCKET]: "the feature has logs in more than one month bucket",
            },
            run: (ctx) => {
                const kind = kindOf(ctx);
                const lock = acquireWorkflowLock({
                    cwd: ctx.cwd,
                    workflow: String(ctx.flags.workflow),
                    fid: String(ctx.flags.fid),
                    month: str(ctx.flags.month),
                    log: ctx.log,
                });
                ctx.emit({ kind, ...lock });
                return EXIT.OK;
            },
        },
        release: {
            summary: "Remove a lock this caller owns; another owner's lock is left in place.",
            flags: [
                KIND_FLAG,
                LOCK_WORKFLOW_FLAG,
                FID_FLAG,
                MONTH_FLAG,
                {
                    name: "token",
                    type: "string",
                    help: "the token acquire returned (default: match workflow and fid)",
                },
            ],
            output: {
                kind: "workflow",
                path: "absolute path of the lock file",
                existed: "a lock file was there",
                released: "this call removed it",
                heldBy: "the other owner's lock line when it was left in place, else null",
            },
            exitCodes: {
                [EXIT_SPLIT_BUCKET]: "no --month and the feature has logs in more than one month bucket",
                [EXIT_NOT_OWNER]: "the lock belongs to another owner and was left in place",
                [EXIT_REMOVE_FAILED]: "the lock file is still there after removing it",
            },
            run: (ctx) => {
                const kind = kindOf(ctx);
                const who = {
                    workflow: String(ctx.flags.workflow),
                    fid: String(ctx.flags.fid),
                    token: str(ctx.flags.token),
                };
                const root = repoRoot(ctx.cwd);
                const file = workflowLockPath(root, resolveMonth(root, who.fid, str(ctx.flags.month)), who.fid);
                const { removeFailed, ...result } = releaseLock(file, who);
                ctx.emit({ kind, ...result });
                if (removeFailed) {
                    ctx.log(`lock removal failed: ${file}`);
                    return EXIT_REMOVE_FAILED;
                }
                if (result.heldBy !== null) {
                    ctx.log(`${file} belongs to another owner, left in place: ${result.heldBy}`);
                    return EXIT_NOT_OWNER;
                }
                return EXIT.OK;
            },
        },
    },
};
