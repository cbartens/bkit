// bkit locks acquire|release — the per-feature workflow lock and the dev lock.
//
// workflow  `docs/plans/{month}/logs/{fid}/.lock`: one phase workflow per feature
//           at a time. A lock left behind is reclaimed as soon as its holder is
//           idle: its run is not IN_PROGRESS, or stepped no sooner than 30 minutes
//           ago. The lock file's own age is not checked.
// dev       `.bkit/.dev.lock` in the main checkout: held across every checkout /
//           commit / push of `dev` there. Acquire waits a bounded time; the shell
//           releases it from `trap ... EXIT`.
//
// Both write one line, `{at} {workflow} {fid} {token}`. Release removes only a lock
// this caller owns (same token, else same workflow and feature), so a Failure Path
// that never got the lock cannot delete the holder's.

import { randomBytes } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";

import {
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
  statusRelPath,
  utcMonth,
  type CommandSpec,
  type FlagSpec,
  type RunContext,
} from "../lib.js";
import { TIMEOUTS } from "../../shared/timeouts.js";
import { str } from "./status.js";

/** A workflow lock whose holder shows no sign of life for this long is stale. */
export const WORKFLOW_LOCK_IDLE_S = 1800;
/** Seconds between dev-lock attempts while it is busy. */
export const DEV_LOCK_POLL_S = 5;

/** Exit code: the feature has logs in more than one month bucket. */
export const EXIT_SPLIT_BUCKET = 7;
/** Exit code: the lock belongs to another owner and was left in place. */
export const EXIT_NOT_OWNER = 4;
/** Exit code: the lock file is still there after removing it. */
export const EXIT_REMOVE_FAILED = 5;

const KINDS = ["workflow", "dev"] as const;
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

/**
 * Root the workflow books its logs under: the main checkout, except ship in a
 * runtime that does not push to dev, which books on the branch being shipped.
 */
export function lockRoot(cwd: string, workflow: string, devPushes: boolean): string {
  const root = repoRoot(cwd);
  if (workflow !== "ship" || devPushes) return root;
  return git(cwd, ["rev-parse", "--show-toplevel"]) ?? root;
}

export const workflowLockPath = (bookRoot: string, month: string, fid: string) =>
  path.join(bookRoot, "docs", "plans", month, "logs", fid, ".lock");

export const devLockPath = (root: string) => path.join(root, ".bkit", ".dev.lock");

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
function tryCreate(file: string, line: string): boolean {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const fd = openExclusive(file);
  if (fd === undefined) return false;
  fs.writeSync(fd, `${line}\n`);
  fs.closeSync(fd);
  return true;
}

function openExclusive(file: string): number | undefined {
  try {
    return fs.openSync(file, "wx");
  } catch (err) {
    // EEXIST is the expected "someone holds it" answer; anything else is a real error.
    if ((err as NodeJS.ErrnoException).code === "EEXIST") return undefined;
    throw err;
  }
}

const ageSeconds = (file: string, now: number): number | undefined => {
  const st = fs.statSync(file, { throwIfNoEntry: false });
  return st === undefined ? undefined : Math.floor((now - st.mtimeMs) / 1000);
};

const newToken = () => randomBytes(4).toString("hex");

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
  bookRoot: string,
  month: string,
  fid: string,
  holder: Holder,
  now: number,
): { live: string } | { reason: "finished" | "stale" | "orphaned" } {
  const rel = statusRelPath(month, fid);
  const worktreeCopy = path.join(root, ".worktrees", fid, rel);
  const own = fs.existsSync(worktreeCopy) ? worktreeCopy : path.join(bookRoot, rel);
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
function readRunsLenient(file: string): WorkflowRun[] {
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

export function acquireWorkflowLock(opts: {
  cwd: string;
  workflow: string;
  fid: string;
  month?: string;
  devPushes: boolean;
  log: (m: string) => void;
}): WorkflowLockResult {
  const root = repoRoot(opts.cwd);
  const month = resolveMonth(root, opts.fid, opts.month);
  const bookRoot = lockRoot(opts.cwd, opts.workflow, opts.devPushes);
  const file = workflowLockPath(bookRoot, month, opts.fid);
  const token = newToken();
  const line = lockLine(opts.workflow, opts.fid, token);
  if (tryCreate(file, line)) return { path: file, month, token, reclaimed: null };

  const holder = readHolder(file) ?? { line: "" };
  const verdict = liveReason(root, bookRoot, month, opts.fid, holder, Date.now());
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
// Dev lock
// ---------------------------------------------------------------------------

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function acquireDevLock(opts: {
  cwd: string;
  workflow: string;
  fid: string;
  deadlineS: number;
  log: (m: string) => void;
}): Promise<{ path: string; token: string; reclaimed: string | null; waitedS: number }> {
  const file = devLockPath(repoRoot(opts.cwd));
  const token = newToken();
  const start = Date.now();
  const deadline = start + opts.deadlineS * 1000;
  let reclaimed: string | null = null;
  for (;;) {
    if (tryCreate(file, lockLine(opts.workflow, opts.fid, token))) {
      return { path: file, token, reclaimed, waitedS: Math.round((Date.now() - start) / 1000) };
    }
    const now = Date.now();
    const age = ageSeconds(file, now);
    if (age === undefined) continue; // released between the attempt and the stat
    if (age >= TIMEOUTS.SHIP_DEV_LOCK_STALE_S) {
      reclaimed = readHolder(file)?.line ?? "";
      opts.log(`reclaiming stale dev lock (${age}s old): ${reclaimed}`);
      fs.rmSync(file, { force: true });
      continue;
    }
    if (now >= deadline) {
      throw new CommandError(
        EXIT.NO,
        `dev lock held by: ${readHolder(file)?.line ?? "?"} — serialise this run or use a separate clone`,
      );
    }
    await sleep(Math.min(DEV_LOCK_POLL_S * 1000, deadline - now));
  }
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
  help: "workflow (per-feature .lock) or dev (.bkit/.dev.lock)",
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
const DEV_PUSHES_FLAG: FlagSpec = {
  name: "dev-pushes",
  type: "boolean",
  help: "ship only: this runtime pushes to dev (lock lives in the main checkout)",
};

function kindOf(ctx: RunContext): Kind {
  const kind = String(ctx.flags.kind);
  if (!(KINDS as readonly string[]).includes(kind))
    throw new CommandError(EXIT.USAGE, "--kind must be workflow or dev");
  return kind as Kind;
}

function deadlineOf(ctx: RunContext): number {
  const raw = str(ctx.flags.deadline);
  if (raw === undefined) return TIMEOUTS.SHIP_DEV_LOCK_ACQUIRE_DEADLINE_S;
  if (!/^[0-9]+$/.test(raw))
    throw new CommandError(EXIT.USAGE, `--deadline must be whole seconds, got "${raw}"`);
  return Number(raw);
}

export const locksCommand: CommandSpec = {
  noun: "locks",
  summary: "Acquire and release the per-feature workflow lock and the dev lock.",
  verbs: {
    acquire: {
      summary: "Take a lock: workflow (reclaims a dead holder's) or dev (bounded wait).",
      flags: [
        KIND_FLAG,
        LOCK_WORKFLOW_FLAG,
        FID_FLAG,
        MONTH_FLAG,
        DEV_PUSHES_FLAG,
        {
          name: "deadline",
          type: "string",
          help: `dev kind: seconds to wait for a busy lock (default ${TIMEOUTS.SHIP_DEV_LOCK_ACQUIRE_DEADLINE_S})`,
        },
      ],
      output: {
        kind: "workflow or dev",
        path: "absolute path of the lock file",
        token: "this holder's token; pass it to release",
        month: "workflow kind: the month bucket (null for dev)",
        reclaimed:
          "workflow kind: {holder, reason: finished|stale|orphaned}; dev kind: the stale line; null when none",
        waitedS: "dev kind: seconds spent waiting (null for workflow)",
      },
      exitCodes: {
        [EXIT_SPLIT_BUCKET]: "workflow kind: the feature has logs in more than one month bucket",
      },
      run: async (ctx) => {
        const kind = kindOf(ctx);
        const workflow = String(ctx.flags.workflow);
        const fid = String(ctx.flags.fid);
        if (kind === "workflow") {
          if (ctx.flags.deadline !== undefined)
            throw new CommandError(EXIT.USAGE, "--deadline applies to --kind=dev only");
          const lock = acquireWorkflowLock({
            cwd: ctx.cwd,
            workflow,
            fid,
            month: str(ctx.flags.month),
            devPushes: ctx.flags.devPushes === true,
            log: ctx.log,
          });
          ctx.emit({ kind, ...lock, waitedS: null });
          return EXIT.OK;
        }
        const lock = await acquireDevLock({
          cwd: ctx.cwd,
          workflow,
          fid,
          deadlineS: deadlineOf(ctx),
          log: ctx.log,
        });
        ctx.emit({ kind, ...lock, month: null });
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
        DEV_PUSHES_FLAG,
        {
          name: "token",
          type: "string",
          help: "the token acquire returned (default: match workflow and fid)",
        },
      ],
      output: {
        kind: "workflow or dev",
        path: "absolute path of the lock file",
        existed: "a lock file was there",
        released: "this call removed it",
        heldBy: "the other owner's lock line when it was left in place, else null",
      },
      exitCodes: {
        [EXIT_SPLIT_BUCKET]:
          "workflow kind without --month: the feature has logs in more than one month bucket",
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
        const file =
          kind === "dev"
            ? devLockPath(root)
            : workflowLockPath(
                lockRoot(ctx.cwd, who.workflow, ctx.flags.devPushes === true),
                resolveMonth(root, who.fid, str(ctx.flags.month)),
                who.fid,
              );
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
