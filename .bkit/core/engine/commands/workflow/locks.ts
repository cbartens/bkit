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

import { createHash, randomBytes } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import {
  createExclusive,
  fold,
  lastRun,
  statusTimestamp,
  type StatusEvent,
  type WorkflowRun,
} from "../../ledgers/status.js";
import {
  CommandError,
  EXIT,
  git,
  parseJson,
  repoRoot,
  runTool,
  statusRelPath,
  utcMonth,
  type CommandSpec,
  type FlagSpec,
  type RunContext,
} from "../lib.js";
import { removeRecord } from "./ledgers.js";
import { str } from "./status.js";

/** A workflow lock whose holder shows no sign of life for this long is stale. */
export const WORKFLOW_LOCK_IDLE_S = 1800;

/** Exit code: the feature has logs in more than one month bucket. */
export const EXIT_SPLIT_BUCKET = 7;
/** Exit code: the lock belongs to another owner and was left in place. */
export const EXIT_NOT_OWNER = 4;
/** Exit code: the lock file is still there after removing it. */
export const EXIT_REMOVE_FAILED = 5;

const KINDS = ["workflow"] as const;
type Kind = (typeof KINDS)[number];

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const MONTH_DIR = /^[0-9]{6}$/;

/** Month buckets under `docs/plans/` that hold logs for `fid`, oldest first. */
export function monthBuckets(root: string, fid: string): string[] {
  const plans = path.join(root, "docs", "plans");
  if (!fs.existsSync(plans)) return [];
  return fs
    .readdirSync(plans)
    .filter(
      (m) =>
        MONTH_DIR.test(m) &&
        fs.statSync(path.join(plans, m, "logs", fid), { throwIfNoEntry: false })?.isDirectory(),
    )
    .sort();
}

/**
 * The feature's month bucket: `--month` when given, else the one bucket its logs
 * are already in, else this UTC month. A feature split across buckets is refused.
 */
export function resolveMonth(root: string, fid: string, month: string | undefined): string {
  if (month !== undefined) {
    if (!MONTH_DIR.test(month)) throw new CommandError(EXIT.USAGE, "--month must be YYYYMM");
    return month;
  }
  const buckets = monthBuckets(root, fid);
  if (buckets.length > 1) {
    throw new CommandError(
      EXIT_SPLIT_BUCKET,
      `${fid} has logs in more than one month bucket (${buckets.join(", ")}) — consolidate into a single bucket, then re-run`,
    );
  }
  return buckets[0] ?? utcMonth();
}

/** The feature's workflow lock, in the main checkout `root` (gitignored). */
export const workflowLockPath = (root: string, month: string, fid: string) =>
  path.join(root, "docs", "plans", month, "logs", fid, ".lock");

// ---------------------------------------------------------------------------
// Lock file
// ---------------------------------------------------------------------------

export interface Holder {
  line: string;
  at?: string;
  workflow?: string;
  fid?: string;
  token?: string;
}

export function readHolder(file: string): Holder | undefined {
  if (!fs.existsSync(file)) return undefined;
  const line = fs.readFileSync(file, "utf-8").trim();
  const [at, workflow, fid, token] = line.split(/\s+/);
  return { line, at, workflow, fid, token };
}

/** Create `file` only if absent (`set -C`); false when someone else holds it. */
export function tryCreate(file: string, line: string): boolean {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  return createExclusive(file, `${line}\n`);
}

const newToken = () => randomBytes(4).toString("hex");

export interface PublicationLock {
  path: string;
  token: string;
  owner: { host: string; pid: number; startTime: string };
}

/** The OS start identity distinguishes a live reused PID from a recorded owner. */
function processStart(pid: number, timeoutMs = 1000): string | null {
  const result = runTool("ps", ["-p", String(pid), "-o", "lstart="], process.cwd(), {
    timeoutMs: Math.max(50, Math.min(1000, timeoutMs)),
  });
  return result.found && result.status === 0 && result.stdout.trim() !== ""
    ? result.stdout.trim()
    : null;
}

function publicationHolder(file: string): PublicationLock | null {
  const parsed = parseJson(fs.readFileSync(file, "utf8"));
  if (!parsed.ok || typeof parsed.value !== "object" || parsed.value === null) return null;
  const raw = parsed.value as Partial<PublicationLock>;
  return typeof raw.token === "string" &&
    /^[a-f0-9]{32}$/.test(raw.token) &&
    typeof raw.path === "string" &&
    typeof raw.owner?.host === "string" &&
    Number.isInteger(raw.owner.pid) &&
    raw.owner.pid > 0 &&
    typeof raw.owner.startTime === "string" &&
    Number.isFinite(Date.parse(raw.owner.startTime))
    ? { path: file, token: raw.token, owner: raw.owner }
    : null;
}

/** A separate best-effort lock for one issue and invocation; age never establishes death. */
export async function acquirePublicationLock(
  cwd: string,
  options: { target: string; invocation: string; timeoutMs?: number },
): Promise<PublicationLock | null> {
  try {
    const end = performance.now() + Math.min(30_000, Math.max(0, options.timeoutMs ?? 30_000));
    const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
    const startTime = processStart(process.pid, end - performance.now());
    if (!common || !startTime || !options.target || !options.invocation) return null;
    const digest = createHash("sha256")
      .update(`${options.target}\0${options.invocation}`)
      .digest("hex");
    const file = path.join(common, "bkit-outbox", "publication-locks", `${digest}.lock`);
    const lock: PublicationLock = {
      path: file,
      token: randomBytes(16).toString("hex"),
      owner: { host: os.hostname(), pid: process.pid, startTime },
    };
    fs.mkdirSync(path.dirname(file), { recursive: true });
    do {
      if (tryCreate(file, JSON.stringify(lock))) return lock;
      const holder = publicationHolder(file);
      if (!holder || holder.owner.host !== lock.owner.host) return null;
      let dead = false;
      try {
        process.kill(holder.owner.pid, 0);
      } catch (error) {
        dead = (error as NodeJS.ErrnoException).code === "ESRCH";
      }
      if (dead) {
        if (publicationHolder(file)?.token !== holder.token) return null;
        fs.unlinkSync(file);
        if (tryCreate(file, JSON.stringify(lock))) return lock;
        continue;
      }
      if (processStart(holder.owner.pid, end - performance.now()) !== holder.owner.startTime)
        return null;
      const remaining = end - performance.now();
      if (remaining <= 0) return null;
      await new Promise((resolve) => setTimeout(resolve, Math.min(20, remaining)));
    } while (performance.now() <= end);
    return null;
  } catch {
    // Lock failures select standalone publication rather than fail substantive work.
    return null;
  }
}

/** Remove only this publication token; filesystem errors leave append unavailable. */
export async function releasePublicationLock(lock: PublicationLock): Promise<boolean> {
  try {
    if (publicationHolder(lock.path)?.token !== lock.token) return false;
    fs.unlinkSync(lock.path);
    return true;
  } catch {
    return false;
  }
}

const lockLine = (workflow: string, fid: string, token: string) =>
  `${statusTimestamp()} ${workflow} ${fid} ${token}`;

/** The caller owns the lock: same token when it gave one, else same workflow and feature. */
export function owns(holder: Holder, who: { workflow: string; fid: string; token?: string }) {
  if (who.token !== undefined) return holder.token === who.token;
  return holder.workflow === who.workflow && (holder.fid === undefined || holder.fid === who.fid);
}

// ---------------------------------------------------------------------------
// Workflow lock
// ---------------------------------------------------------------------------

export interface WorkflowLockResult {
  path: string;
  month: string;
  token: string;
  /** A left-behind lock this acquire removed, and why; null when there was none. */
  reclaimed: { holder: string; reason: "finished" | "stale" | "orphaned" } | null;
}

/** Why a held workflow lock is still live, or why it may be reclaimed. */
function liveReason(
  root: string,
  month: string,
  fid: string,
  holder: Holder,
  now: number,
): { live: string } | { reason: "finished" | "stale" | "orphaned" } {
  const rel = statusRelPath(month, fid);
  const worktreeCopy = path.join(root, ".worktrees", fid, rel);
  const own = fs.existsSync(worktreeCopy) ? worktreeCopy : path.join(root, rel);
  const run =
    holder.workflow === undefined ? undefined : lastRun(readRunsLenient(own), holder.workflow);
  const lastAt = run?.steps.at(-1)?.at;
  if (run?.status === "IN_PROGRESS" && lastAt) {
    const idle = Math.floor((now - Date.parse(lastAt)) / 1000);
    if (idle < WORKFLOW_LOCK_IDLE_S) return { live: `idle ${idle}s` };
  }
  if (run === undefined) return { reason: "orphaned" };
  return { reason: run.status === "IN_PROGRESS" ? "stale" : "finished" };
}

/**
 * Fold a status log for the lock cross-check. A missing or malformed log shows no
 * run: there is no evidence the holder is alive, so the lock is reclaimed.
 */
export function readRunsLenient(file: string): WorkflowRun[] {
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, "utf-8").trim();
  const events: StatusEvent[] = [];
  for (const line of raw.split("\n").map((l) => l.trim())) {
    if (line === "") continue;
    const parsed = parseJson(line);
    if (!parsed.ok) return [];
    events.push(parsed.value as StatusEvent);
  }
  return fold(events);
}

/** Whether `fid` holds a workflow lock whose holder is still stepping (not reclaimable). */
export function workflowLockLive(root: string, fid: string): boolean {
  return monthBuckets(root, fid).some((month) => {
    const holder = readHolder(workflowLockPath(root, month, fid));
    return holder !== undefined && "live" in liveReason(root, month, fid, holder, Date.now());
  });
}

/**
 * Whether `fid` has a workflow lock file younger than the idle limit, whatever
 * its run's state: a run that has closed but not yet released its lock (it still
 * pushes and waits for CI) still owns its checkout.
 */
export function workflowLockFresh(root: string, fid: string): boolean {
  return monthBuckets(root, fid).some((month) => {
    const stat = fs.statSync(workflowLockPath(root, month, fid), { throwIfNoEntry: false });
    return stat !== undefined && (Date.now() - stat.mtimeMs) / 1000 < WORKFLOW_LOCK_IDLE_S;
  });
}

export function acquireWorkflowLock(opts: {
  cwd: string;
  workflow: string;
  fid: string;
  month?: string;
  log: (m: string) => void;
}): WorkflowLockResult {
  const root = repoRoot(opts.cwd);
  const month = resolveMonth(root, opts.fid, opts.month);
  const file = workflowLockPath(root, month, opts.fid);
  const token = newToken();
  const line = lockLine(opts.workflow, opts.fid, token);
  if (tryCreate(file, line)) return { path: file, month, token, reclaimed: null };

  const holder = readHolder(file) ?? { line: "" };
  const verdict = liveReason(root, month, opts.fid, holder, Date.now());
  if ("live" in verdict) {
    throw new CommandError(
      EXIT.NO,
      `workflow already running for ${opts.fid} (workflow=${holder.workflow ?? "?"}, ${verdict.live})`,
    );
  }
  opts.log(`reclaiming ${verdict.reason} lock for ${opts.fid}: ${holder.line}`);
  fs.rmSync(file, { force: true });
  if (!tryCreate(file, line)) throw new CommandError(EXIT.NO, `lock contended for ${opts.fid}`);
  return { path: file, month, token, reclaimed: { holder: holder.line, reason: verdict.reason } };
}

// ---------------------------------------------------------------------------
// Release
// ---------------------------------------------------------------------------

export interface ReleaseResult {
  path: string;
  existed: boolean;
  released: boolean;
  /** The lock line left in place because another owner holds it; null otherwise. */
  heldBy: string | null;
  /** The caller's lock is still there after removing it. */
  removeFailed: boolean;
}

/**
 * Remove a lock this caller owns. Missing is fine (already released); another
 * owner's lock is left in place and reported.
 */
export function releaseLock(
  file: string,
  who: { workflow: string; fid: string; token?: string },
): ReleaseResult {
  const holder = readHolder(file);
  const result = { path: file, existed: false, released: false, heldBy: null, removeFailed: false };
  if (holder === undefined) return result;
  if (!owns(holder, who)) return { ...result, existed: true, heldBy: holder.line };
  fs.rmSync(file, { force: true });
  const left = fs.existsSync(file);
  return { ...result, existed: true, released: !left, removeFailed: left };
}

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

const KIND_FLAG: FlagSpec = {
  name: "kind",
  type: "string",
  required: true,
  help: "workflow (the per-feature .lock)",
};
const LOCK_WORKFLOW_FLAG: FlagSpec = {
  name: "workflow",
  type: "string",
  required: true,
  help: "workflow name: design, plan, build, debug, ship (written into the lock)",
};
const FID_FLAG: FlagSpec = { name: "fid", type: "string", required: true, help: "feature id" };
const MONTH_FLAG: FlagSpec = {
  name: "month",
  type: "string",
  help: "workflow kind: month bucket YYYYMM (default: the feature's bucket, else this UTC month)",
};

function kindOf(ctx: RunContext): Kind {
  const kind = String(ctx.flags.kind);
  if (!(KINDS as readonly string[]).includes(kind))
    throw new CommandError(EXIT.USAGE, "--kind must be workflow");
  return kind as Kind;
}

export const locksCommand: CommandSpec = {
  noun: "locks",
  summary: "Acquire and release the per-feature workflow lock.",
  verbs: {
    acquire: {
      summary: "Take the workflow lock, reclaiming a dead holder's.",
      use: "workflow",
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
      summary:
        "Remove a lock this caller owns (and the feature's shared-checkout record); another owner's lock is left in place.",
      use: "workflow",
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
        const file = workflowLockPath(
          root,
          resolveMonth(root, who.fid, str(ctx.flags.month)),
          who.fid,
        );
        const { removeFailed, ...result } = releaseLock(file, who);
        // The run is over once its lock is released: so is its shared-checkout record.
        if (!removeFailed && result.heldBy === null) removeRecord(root, who.fid);
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
