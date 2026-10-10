// bkit workflows start|fail|handover|close|promote|links — a phase workflow's
// lifecycle state.
//
// start     takes the feature lock (or checks the one Step 1 took) and opens a run
//           with a `workflow-started` row, unless this is a resume of the same
//           workflow's IN_PROGRESS run.
// fail      the Failure Path's state and payloads: `workflow-failed` row, abort an
//           in-progress rebase, release the lock, clear the sentinels, say whether
//           a handover is due, and print the `bkit:failed` label set and the
//           failure comment. The tracker calls stay in the workflow.
// handover  after the handover subagent: commit and abort-push it (`--push`), or
//           ship's one-commit flush (`--flush`), and print the handover comment.
// close     grade compliance, then the `workflow-done` row, the run's counter and
//           outcome rows in `.bkit/stats.jsonl`, this workflow's telemetry report
//           and the artifact links. `--flush` is ship's close: under the dev lock,
//           on dev or a detached origin/dev worktree, commit and land it.
// promote   design / plan close: the highest versioned draft becomes the
//           canonical doc (anchor stamped, a superseded canonical archived).
// links     the feature docs and this workflow's logs on a ref, as markdown links.

import * as fs from "node:fs";
import * as path from "node:path";

import {
  appendLine,
  fold,
  runNumber,
  runOrStepField,
  statusTimestamp,
  type StatusEvent,
} from "../../ledgers/status.js";
import {
  appendLine as telemetryLine,
  foldFrom,
  resolveRepoSlug,
  validate,
  workflowTelemetry,
  type CoverageStats,
} from "../../ledgers/telemetry.js";
import { readBkitVersion } from "../../install/version-file.js";
import { TIMEOUTS } from "../../shared/timeouts.js";
import { gradeCompliance } from "../comply.js";
import {
  CommandError,
  EXIT,
  git,
  parseJson,
  repoRoot,
  runGh,
  runGit,
  statusLocation,
  statusRelPath,
  type CommandSpec,
  type FlagSpec,
  type FlagValue,
  type RunContext,
} from "../lib.js";
import { pushBranch, readAnchor, stampAnchor } from "./branches.js";
import {
  AUTO_LABEL,
  AUTO_ROUTE_SUFFIX,
  buildComment,
  linearState,
  transitionLabels,
} from "./issues.js";
import { commitBookkeeping, unionLedgers } from "./ledgers.js";
import {
  EXIT_REMOVE_FAILED,
  EXIT_SPLIT_BUCKET,
  acquireDevLock,
  acquireWorkflowLock,
  lockRoot,
  owns,
  readHolder,
  releaseLock,
  resolveMonth,
  workflowLockPath,
} from "./locks.js";
import { mergePr, probePr } from "./prs.js";
import { FEATURE_STATUS } from "./roadmap.js";
import {
  EXIT_NO_STATUS,
  WORKFLOW_FLAG,
  positiveInt,
  readRuns,
  readStatusEvents,
  readStatusRows,
  str,
} from "./status.js";
import { writeStepRow } from "./steps.js";

/** Sentinels a workflow leaves in its logs folder; either one existing means a handover is due. */
export const SENTINELS = [".rebase-failed", ".deferred-blocked"] as const;

/** Exit code (start --lock-held): the lock is missing or belongs to another owner. */
export const EXIT_LOCK_NOT_HELD = 6;
/** Exit code (handover --push): the handover artifact is missing or empty. */
export const EXIT_HANDOVER_MISSING = 8;
/** Exit code (handover --push): the branch has an open PR, so nothing was pushed. */
export const EXIT_OPEN_PR_KEPT = 9;
/** Exit code (handover, close --flush): a push failed. */
export const EXIT_PUSH_FAILED = 10;
/** Exit code (handover --flush, close --flush): a dev checkout, commit or worktree step failed. */
export const EXIT_FLUSH_FAILED = 11;
/** Exit code (promote): no versioned draft to promote. */
export const EXIT_NO_VERSION = 12;

// ---------------------------------------------------------------------------
// Where things live
// ---------------------------------------------------------------------------

interface Where {
  root: string;
  month: string;
  /** Tree the run works in: ship's book root, else the current worktree's top. */
  tree: string;
  status: string;
}

function workflowName(workflow: string): string {
  if (!Object.hasOwn(FEATURE_STATUS, workflow))
    throw new CommandError(
      EXIT.USAGE,
      `--workflow must be ${Object.keys(FEATURE_STATUS).join(", ")}`,
    );
  return workflow;
}

/**
 * start and close work in the current tree (ship: its book root), the root
 * `git rev-parse --show-toplevel` reports.
 */
function whereInTree(
  cwd: string,
  o: { workflow: string; fid: string; month?: string; devPushes: boolean; file?: string },
): Where {
  const root = repoRoot(cwd);
  const month = resolveMonth(root, o.fid, o.month);
  const tree =
    o.workflow === "ship"
      ? lockRoot(cwd, o.workflow, o.devPushes)
      : (git(cwd, ["rev-parse", "--show-toplevel"]) ?? root);
  const status = o.file ? path.resolve(cwd, o.file) : path.join(tree, statusRelPath(month, o.fid));
  return { root, month, tree, status };
}

const headSha = (cwd: string) => git(cwd, ["rev-parse", "HEAD"]) ?? "";
const logDirRel = (month: string, fid: string) => path.join("docs", "plans", month, "logs", fid);
const list = (v: FlagValue) => (v as string[] | undefined) ?? [];

// ---------------------------------------------------------------------------
// start
// ---------------------------------------------------------------------------

function checkHeldLock(file: string, who: { workflow: string; fid: string; token?: string }) {
  const holder = readHolder(file);
  if (holder === undefined) throw new CommandError(EXIT_LOCK_NOT_HELD, `no lock at ${file}`);
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
function abortRebase(tree: string, log: (m: string) => void): boolean {
  const inProgress = ["rebase-merge", "rebase-apply"].some((name) => {
    const p = git(tree, ["rev-parse", "--path-format=absolute", "--git-path", name]);
    return p !== null && fs.existsSync(p);
  });
  if (!inProgress) return false;
  const res = runGit(tree, ["rebase", "--abort"]);
  if (!res.ok) log(`git rebase --abort failed in ${tree}: ${res.stderr}`);
  return res.ok;
}

/** The workflow-failed state: row, rebase abort, lock release, sentinels. */
function failState(ctx: RunContext, workflow: string, fid: string) {
  const devPushes = ctx.flags.devPushes === true;
  const root = repoRoot(ctx.cwd);
  const month = resolveMonth(root, fid, str(ctx.flags.month) || undefined);
  const file = str(ctx.flags.file) || undefined;
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

  let row: Record<string, unknown> | null = null;
  let soak = false;
  if (fs.existsSync(status)) {
    soak =
      workflow === "debug" && runOrStepField(readRuns(status), "debug", "debugMode") === "SOAK";
    row = { type: "workflow-failed", workflow, at: statusTimestamp() };
    fs.appendFileSync(status, appendLine(row as StatusEvent));
  } else {
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
  if (removeFailed) ctx.log(`lock removal failed: ${lockFile}`);

  // Each sentinel is cleared where it was created: `.rebase-failed` in the run's
  // tree, `.deferred-blocked` beside status.jsonl (ship: the book root).
  const logDirs = new Set([path.join(tree, logDirRel(month, fid)), path.dirname(status)]);
  const sentinels: Array<{ name: string; path: string }> = [];
  for (const dir of logDirs) {
    for (const name of SENTINELS) {
      const p = path.join(dir, name);
      if (!fs.existsSync(p)) continue;
      sentinels.push({ name, path: p });
      fs.rmSync(p, { force: true });
    }
  }
  return { row, rebaseAborted, lock, sentinels, removeFailed, soak };
}

function failVerb(ctx: RunContext): number {
  const workflow = workflowName(String(ctx.flags.workflow));
  // An empty value is a placeholder not held yet (the failure came before it was set).
  const fid = str(ctx.flags.fid) || undefined;
  const token = str(ctx.flags.token) || undefined;
  if (token !== undefined && fid === undefined)
    throw new CommandError(EXIT.USAGE, "--token needs --fid");

  // State only for a run that took the lock: without the token the failure came
  // before Step 1 locked, and nothing here is this run's to change.
  const state =
    token === undefined || fid === undefined
      ? {
          row: null,
          rebaseAborted: false,
          lock: null,
          sentinels: [],
          removeFailed: false,
          soak: false,
        }
      : failState(ctx, workflow, fid);

  // Labels: bkit:failed added; a ship whose PR already merged also moves to bkit:merged.
  const pr = str(ctx.flags.pr) || undefined;
  let prState: string | null = null;
  if (pr !== undefined && pr !== "") {
    const probed = probePr(ctx.cwd, { number: pr, state: "open" });
    prState = probed.kind === "ok" ? (probed.pr?.state ?? null) : null;
  }
  const merged = prState === "MERGED";
  const transition = merged ? { phase: "merged" } : { failed: true };
  const labels = transitionLabels(list(ctx.flags.label), transition).labels;
  if (merged && !labels.includes("bkit:failed")) labels.push("bkit:failed");

  // The failure comment, when the step is named.
  let comment: string | null = null;
  const stepNumber = str(ctx.flags.stepNumber);
  if (stepNumber !== undefined) {
    const errorFile = str(ctx.flags.errorFile);
    const error =
      errorFile === undefined ? (str(ctx.flags.error) ?? "") : readText(ctx.cwd, errorFile);
    comment = buildComment(ctx.cwd, {
      kind: "failure",
      stepNumber,
      stepTitle: str(ctx.flags.stepTitle),
      subStep: str(ctx.flags.subStep),
      error: state.removeFailed ? `${error}; Lock removal failed` : error,
      stderrFile: str(ctx.flags.stderrFile) || undefined,
    });
  }

  ctx.emit({
    row: state.row,
    rebaseAborted: state.rebaseAborted,
    lock: state.lock,
    sentinels: state.sentinels,
    handoverNeeded:
      token !== undefined &&
      (ctx.flags.maxExceeded === true || state.sentinels.length > 0 || state.soak),
    labels,
    linearState: linearState(transition, undefined),
    prState,
    comment,
  });
  return state.removeFailed ? EXIT_REMOVE_FAILED : EXIT.OK;
}

/** A text file's content, trailing newlines dropped; a missing file is a usage error. */
function readText(cwd: string, rel: string): string {
  const abs = path.resolve(cwd, rel);
  if (!fs.existsSync(abs)) throw new CommandError(EXIT.USAGE, `${rel} does not exist`);
  return fs.readFileSync(abs, "utf-8").replace(/\n+$/, "");
}

// ---------------------------------------------------------------------------
// handover
// ---------------------------------------------------------------------------

/**
 * Ship's Failure Path flush: copy branch-side logs and ledger rows into the book
 * root, then ONE `chore({fid}): ship FAILED bkit [skip ci]` commit and ONE push —
 * to dev under the dev lock when this runtime pushes dev, else the current branch.
 */
async function shipFlush(
  ctx: RunContext,
  o: { fid: string; month: string; devPushes: boolean; worktree?: string },
): Promise<{ code: number; pushed: boolean; ref: string | null; skipped: string | null }> {
  const root = repoRoot(ctx.cwd);
  const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? root;
  const bookRoot = o.devPushes ? root : top;
  const rel = logDirRel(o.month, o.fid);
  const src = o.worktree ?? path.join(root, ".worktrees", o.fid);
  if (fs.existsSync(path.join(src, rel)) && path.resolve(src) !== path.resolve(bookRoot)) {
    fs.mkdirSync(path.join(bookRoot, rel), { recursive: true });
    for (const f of fs.readdirSync(path.join(src, rel)).filter((n) => n.endsWith(".md"))) {
      const to = path.join(bookRoot, rel, f);
      if (!fs.existsSync(to)) fs.copyFileSync(path.join(src, rel, f), to);
    }
    unionLedgers(src, bookRoot);
  }

  let wt = bookRoot;
  let target = "";
  let release: (() => void) | undefined;
  if (o.devPushes) {
    let lock: { path: string; token: string };
    try {
      lock = await acquireDevLock({
        cwd: root,
        workflow: "ship",
        fid: o.fid,
        deadlineS: 60,
        log: ctx.log,
      });
    } catch {
      // Busy: the FAILED record rides along on the next dev commit; never a second failure.
      ctx.log(`dev lock busy — ship FAILED bookkeeping left uncommitted in ${bookRoot}`);
      return { code: EXIT.OK, pushed: false, ref: null, skipped: "dev-lock-busy" };
    }
    release = () => releaseLock(lock.path, { workflow: "ship", fid: o.fid, token: lock.token });
    runGit(root, ["checkout", "dev"]);
    if (git(root, ["branch", "--show-current"]) !== "dev") {
      release();
      ctx.log(`not on dev after checkout — FAILED bookkeeping left uncommitted in ${bookRoot}`);
      return { code: EXIT_FLUSH_FAILED, pushed: false, ref: null, skipped: null };
    }
    runGit(root, ["pull", "--ff-only", "origin", "dev"]);
    wt = root;
    target = "dev";
  } else {
    ctx.log("RUNTIME_DEVPUSHES=false — the FAILED record commits on the current branch");
    target = git(wt, ["branch", "--show-current"]) ?? "";
  }
  try {
    if (target === "") {
      ctx.log(`push target empty (detached HEAD?) — bookkeeping left uncommitted in ${wt}`);
      return { code: EXIT_FLUSH_FAILED, pushed: false, ref: null, skipped: null };
    }
    const before = headSha(wt);
    try {
      commitBookkeeping(
        {
          root: wt,
          month: o.month,
          fid: o.fid,
          scope: "full",
          mode: "commit",
          message: `chore(${o.fid}): ship FAILED bkit [skip ci]`,
        },
        ctx.log,
      );
    } catch (err) {
      ctx.log(
        `bookkeeping commit failed — FAILED bookkeeping left uncommitted in ${wt}: ${(err as Error).message}`,
      );
      return { code: EXIT_FLUSH_FAILED, pushed: false, ref: null, skipped: null };
    }
    if (headSha(wt) === before) {
      ctx.log("no bookkeeping delta to record — nothing committed, nothing pushed");
      return { code: EXIT.OK, pushed: false, ref: null, skipped: "nothing-to-commit" };
    }
    const push = runGit(wt, ["push", "origin", target]);
    if (!push.ok) {
      ctx.log(`git push origin ${target} failed: ${push.stderr}`);
      return { code: EXIT_PUSH_FAILED, pushed: false, ref: null, skipped: null };
    }
    return { code: EXIT.OK, pushed: true, ref: target, skipped: null };
  } finally {
    release?.();
  }
}

async function handoverVerb(ctx: RunContext): Promise<number> {
  const workflow = workflowName(String(ctx.flags.workflow));
  const fid = String(ctx.flags.fid);
  const month = resolveMonth(repoRoot(ctx.cwd), fid, str(ctx.flags.month));
  const push = ctx.flags.push === true;
  const flush = ctx.flags.flush === true;
  if (push && flush) throw new CommandError(EXIT.USAGE, "give --push or --flush, not both");
  if (flush && workflow !== "ship") throw new CommandError(EXIT.USAGE, "--flush is ship only");
  const worktree = str(ctx.flags.worktree);
  const base = worktree === undefined ? ctx.cwd : path.resolve(ctx.cwd, worktree);
  const artifact = path.join(logDirRel(month, fid), `${workflow}-handover.md`);
  const abs = path.join(base, artifact);
  const present = fs.existsSync(abs) && fs.statSync(abs).size > 0;

  let code: number = EXIT.OK;
  let ref = str(ctx.flags.ref) ?? null;
  let pushed = false;
  let skipped: string | null = null;
  if (push) {
    if (!present) {
      ctx.log(`${artifact} is missing or empty — nothing to hand over`);
      return EXIT_HANDOVER_MISSING;
    }
    runGit(ctx.cwd, ["add", "-A"]);
    const made = runGit(ctx.cwd, [
      "commit",
      "-m",
      `docs(${fid}): ${workflow} aborted bkit [skip ci]`,
    ]);
    if (!made.ok) ctx.log(`abort commit: ${made.stderr || made.stdout}`);
    const r = pushBranch(ctx.cwd, { mode: "abort", openPr: str(ctx.flags.openPr) }, ctx.log);
    if (r.code === EXIT.USE_MCP) return r.code;
    pushed = r.out.pushed;
    ref = r.out.ref;
    skipped = r.out.skipped;
    code =
      r.code === EXIT.OK
        ? EXIT.OK
        : r.out.skipped === "open-pr"
          ? EXIT_OPEN_PR_KEPT
          : EXIT_PUSH_FAILED;
  } else if (flush) {
    const r = await shipFlush(ctx, {
      fid,
      month,
      devPushes: ctx.flags.devPushes === true,
      worktree: worktree === undefined ? undefined : base,
    });
    code = r.code;
    pushed = r.pushed;
    ref = r.ref;
    skipped = r.skipped;
  }

  const linkable = ref !== null && (pushed || (!push && !flush));
  const comment = present
    ? buildComment(base, {
        kind: "handover",
        ownerRepo: linkable ? (str(ctx.flags.ownerRepo) ?? resolveRepoSlug(base)) : undefined,
        ref: linkable ? ref! : undefined,
        artifacts: linkable ? [artifact] : [],
        bodyFile: artifact,
      })
    : null;
  ctx.emit({
    handover: present ? artifact : null,
    pushed,
    ref: pushed ? ref : null,
    skipped,
    comment,
  });
  return code;
}

// ---------------------------------------------------------------------------
// close
// ---------------------------------------------------------------------------

interface Ledgers {
  frictionAdded?: number;
  deferralsAdded?: number;
  failuresAdded?: number;
  deferrals: number;
  failures: number;
}

/** Rows of a JSONL ledger; malformed lines are skipped, a missing file is empty. */
function ledgerRows(file: string): Array<Record<string, unknown>> {
  if (!fs.existsSync(file)) return [];
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
function jsonOrUndefined(text: string): unknown {
  const parsed = parseJson(text);
  return parsed.ok ? parsed.value : undefined;
}

function parseObject(line: string): Record<string, unknown> | undefined {
  const v = jsonOrUndefined(line);
  return v !== null && typeof v === "object" ? (v as Record<string, unknown>) : undefined;
}

const distinctKeys = (rows: Array<Record<string, unknown>>) =>
  new Set(rows.filter((r) => r.key !== undefined).map((r) => String(r.key))).size;

/**
 * Cumulative distinct deferrals / failures, and how many keys THIS run added to
 * each instinct ledger (rows of this workflow at or after the run's start). With
 * no start time the per-run counts are unknown, so they are omitted rather than
 * counting the ledger's whole history as this run's.
 */
function ledgerCounts(tree: string, workflow: string, startMs: number | undefined): Ledgers {
  const deferrals = ledgerRows(path.join(tree, "docs", "deferrals.jsonl"));
  const failures = ledgerRows(path.join(tree, "docs", "failures.jsonl"));
  const friction = ledgerRows(path.join(tree, ".bkit", "friction.jsonl"));
  const added = (rows: Array<Record<string, unknown>>) =>
    distinctKeys(rows.filter((r) => r.workflow === workflow && Number(r.ts) >= startMs!));
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
export function diffStat(cwd: string, range: string) {
  const out = runGit(cwd, ["diff", "--shortstat", range]).stdout;
  const num = (re: RegExp) => Number(re.exec(out)?.[1] ?? 0);
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
function taskCount(tree: string, month: string, fid: string): number {
  const dir = path.join(tree, "docs", "plans", month);
  if (!fs.existsSync(dir)) return 0;
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(`${fid}-plan`) && f.endsWith(".md"))
    .flatMap((f) => fs.readFileSync(path.join(dir, f), "utf-8").split("\n"))
    .filter((l) => l.startsWith("- [")).length;
}

/** Per-tier coverage from `coverage/{tier}/coverage-summary.json`; undefined when none. */
function coverage(tree: string): Record<string, CoverageStats> | undefined {
  const out: Record<string, CoverageStats> = {};
  for (const tier of ["unit", "integration", "e2e"]) {
    const file = path.join(tree, "coverage", tier, "coverage-summary.json");
    if (!fs.existsSync(file)) continue;
    const total = parseObject(fs.readFileSync(file, "utf-8"))?.total as
      Record<string, { pct?: unknown }> | undefined;
    if (typeof total?.lines?.pct !== "number") continue;
    const stats: CoverageStats = {};
    for (const k of ["lines", "branches", "functions", "statements"] as const) {
      const pct = total[k]?.pct;
      if (typeof pct === "number") stats[k] = pct;
    }
    out[tier] = stats;
  }
  return Object.keys(out).length ? out : undefined;
}

/** Last row of `type` for `workflow`, in `at` order (a union merge may interleave lines). */
function lastOfType(events: StatusEvent[], type: string, workflow: string) {
  return events
    .filter((e) => e.type === type && e.workflow === workflow)
    .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
    .at(-1) as (StatusEvent & Record<string, unknown>) | undefined;
}

/** Append telemetry rows; best-effort, so a bad path is logged and never fails the close. */
function appendStats(file: string, rows: Array<Record<string, unknown>>, log: (m: string) => void) {
  const valid = rows.filter((r) => {
    const v = validate(r);
    if (!v.ok) log(`[bkit-telemetry] ${String(r.kind)} row invalid, not written: ${v.reason}`);
    return v.ok;
  });
  if (valid.length === 0) return false;
  try {
    fs.appendFileSync(file, valid.map((r) => `${telemetryLine(r as never)}\n`).join(""));
    return true;
  } catch (err) {
    // Telemetry never gates a close: report the failed append and carry on.
    log(`[bkit-telemetry] append failed: ${file} — ${(err as Error).message}`);
    return false;
  }
}

/** Markdown link per feature doc and per log of this workflow, as on `ref`. */
export function artifactLinks(
  root: string,
  ref: string,
  month: string,
  fid: string,
  workflow: string,
  ownerRepo: string,
): Array<{ name: string; path: string; url: string }> {
  const list = (dir: string) =>
    (git(root, ["ls-tree", "-r", "--name-only", ref, "--", dir]) ?? "").split("\n").filter(Boolean);
  const docs = list(`docs/plans/${month}/`).filter(
    (f) =>
      path.posix.dirname(f) === `docs/plans/${month}` &&
      path.posix.basename(f).startsWith(`${fid}-`),
  );
  const logs = list(`docs/plans/${month}/logs/${fid}/`).filter((f) =>
    path.posix.basename(f).startsWith(`${workflow}-`),
  );
  // The URL names the branch, never the remote-tracking ref it was read from.
  const urlRef = ref.replace(/^origin\//, "");
  return [...docs, ...logs].map((f) => ({
    name: path.posix.basename(f),
    path: f,
    url: `https://github.com/${ownerRepo}/blob/${urlRef}/${f}`,
  }));
}

const linkLines = (artifacts: Array<{ name: string; url: string }>) =>
  artifacts.map((a) => `- [${a.name}](${a.url})`).join("\n");

const ARTIFACTS_FILE = "close-artifacts.md";
const TELEMETRY_FILE = "close-telemetry.md";

/** The close comment: optional tree link, then the Artifacts and Telemetry sections from the outbox. */
function closeComment(
  cwd: string,
  outbox: string,
  o: { number: string; title: string; tree?: string; ownerRepo?: string },
): string {
  const sections = [ARTIFACTS_FILE, TELEMETRY_FILE]
    .filter((f) => fs.existsSync(path.join(outbox, f)))
    .map((f) => `${f === ARTIFACTS_FILE ? "Artifacts" : "Telemetry"}=${path.join(outbox, f)}`);
  return buildComment(cwd, {
    stepNumber: o.number,
    stepTitle: o.title,
    ownerRepo: o.tree === undefined ? undefined : (o.ownerRepo ?? resolveRepoSlug(cwd)),
    tree: o.tree,
    sections,
  });
}

export interface CloseInput {
  workflow: string;
  fid: string;
  month?: string;
  devPushes: boolean;
  file?: string;
  prNumber?: number;
  squashSha?: string;
  ref?: string;
  ownerRepo?: string;
  outbox?: string;
  recordStep?: boolean;
  message?: string;
  labels?: string[];
  verboseCiLocal?: boolean;
  number?: string;
  title?: string;
  tree?: string;
}

/**
 * Grade compliance, append the workflow-done row (and, with `recordStep`, the
 * close step's row first), the counter and outcome telemetry rows, and build the
 * report and artifact links; with `outbox`, write them for the close comment; with
 * `message`, commit everything (`git add -A`) in the tree.
 */
export function closeWorkflow(
  cwd: string,
  o: CloseInput,
  log: (m: string) => void,
): Record<string, unknown> {
  const workflow = workflowName(o.workflow);
  const where = whereInTree(cwd, o);
  const events = readStatusEvents(where.status);
  if (o.squashSha !== undefined && !/^[0-9a-f]{7,40}$/.test(o.squashSha))
    throw new CommandError(EXIT.USAGE, `--squash-sha "${o.squashSha}" is not a commit sha`);

  // Graded first, so the report below carries this run's grade.
  const violations = gradeCompliance(where.tree, workflow, log);

  const step = `${workflow}-close-workflow`;
  if (o.recordStep === true) {
    writeStepRow(
      where.tree,
      { file: where.status, workflow, step, artifacts: [], commit: "none" },
      log,
    );
  }
  const row = { type: "workflow-done" as const, workflow, at: statusTimestamp() };
  fs.appendFileSync(where.status, appendLine(row));

  const repo = resolveRepoSlug(where.root) || "unknown/repo";
  const bkitVersion =
    readBkitVersion(path.join(where.root, ".bkit", "version"))?.pinnedVersion || "unknown";
  const parentSha = headSha(where.tree);
  const started = lastOfType(events, "workflow-started", workflow);
  const startAt = started?.at;
  const startMs = startAt ? Date.parse(startAt) : NaN;
  const startKnown = Number.isFinite(startMs) ? startMs : undefined;
  const planSource = events
    .filter(
      (e) =>
        e.type === "workflow-meta" &&
        e.workflow === workflow &&
        (startAt === undefined || e.at >= startAt) &&
        (e as Record<string, unknown>).planSource,
    )
    .at(-1) as Record<string, unknown> | undefined;
  const base = typeof started?.parentSha === "string" ? started.parentSha : "";
  const range = o.squashSha
    ? `${o.squashSha}^..${o.squashSha}`
    : base
      ? `${base}..HEAD`
      : "origin/dev...HEAD";
  const durationSeconds =
    startKnown === undefined ? 0 : Math.max(0, Math.floor((Date.now() - startKnown) / 1000));
  const startedRows = new Set(
    events.filter((e) => e.type === "workflow-started" && e.workflow === workflow).map((e) => e.at),
  ).size;
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
    ...(o.prNumber === undefined ? {} : { prNumber: o.prNumber }),
    ...diffStat(where.tree, range),
    taskCount: taskCount(where.tree, where.month, o.fid),
    durationSeconds,
    ...ledgerCounts(where.tree, workflow, startKnown),
    ...(planSource?.planSource ? { planSource: planSource.planSource } : {}),
    ...(cov ? { coverage: cov } : {}),
  };
  const stats = path.join(where.tree, ".bkit", "stats.jsonl");
  const telemetryWritten = appendStats(stats, [counterRow, outcomeRow], log);

  const report = fs.existsSync(stats)
    ? workflowTelemetry(foldFrom([stats]), workflow).lines
    : ["[bkit-telemetry] stats.jsonl not found — no telemetry rows yet"];
  const ref =
    o.ref ??
    (["design", "plan", "ship"].includes(workflow)
      ? "dev"
      : (git(cwd, ["branch", "--show-current"]) ?? "HEAD"));
  const artifacts = artifactLinks(
    where.root,
    ref,
    where.month,
    o.fid,
    workflow,
    o.ownerRepo ?? repo,
  );

  let comment: string | null = null;
  if (o.outbox !== undefined) {
    const outbox = path.resolve(cwd, o.outbox);
    fs.mkdirSync(outbox, { recursive: true });
    fs.writeFileSync(path.join(outbox, ARTIFACTS_FILE), `${linkLines(artifacts)}\n`);
    fs.writeFileSync(path.join(outbox, TELEMETRY_FILE), `${report.join("\n")}\n`);
    if (o.number !== undefined) {
      if (o.title === undefined) throw new CommandError(EXIT.USAGE, "--number needs --title");
      comment = closeComment(where.tree, outbox, {
        number: o.number,
        title: o.title,
        tree: o.tree,
        ownerRepo: o.ownerRepo,
      });
    }
  } else if (o.number !== undefined) {
    throw new CommandError(
      EXIT.USAGE,
      "--number needs --outbox (the comment's sections live there)",
    );
  }

  let commit: string | null = null;
  if (o.message !== undefined) {
    let message = o.message;
    if (
      o.verboseCiLocal === true &&
      runOrStepField(readRuns(where.status), workflow, "pushMode") === "LOCAL"
    )
      message += " bkit [verbose ci]";
    if ((o.labels ?? []).includes(AUTO_LABEL)) message += AUTO_ROUTE_SUFFIX;
    const add = runGit(where.tree, ["add", "-A"]);
    const made = add.ok ? runGit(where.tree, ["commit", "--allow-empty", "-m", message]) : add;
    if (!made.ok)
      throw new CommandError(EXIT.NO, `close commit failed: ${made.stderr || made.stdout}`);
    commit = headSha(where.tree);
  }

  return {
    row,
    counterRow: validate(counterRow).ok ? counterRow : null,
    outcomeRow: validate(outcomeRow).ok ? outcomeRow : null,
    telemetryWritten,
    compliance: violations === null ? null : violations.length,
    report,
    artifacts,
    artifactLinks: linkLines(artifacts),
    parentSha,
    commit,
    comment,
    roadmapFoldNeeded: true,
    featureStatus: FEATURE_STATUS[workflow],
  };
}

/**
 * Ship's close: under the dev lock, on dev (this runtime pushes it) or on a
 * detached `origin/dev` worktree in the outbox (it does not), run the close, commit
 * `docs({fid}): ship DONE bkit [skip ci]`, release the workflow lock, then land the
 * commit — push dev, push `HEAD:dev`, or, when that is refused, a `ship-close/{fid}`
 * PR merged with an empty body.
 */
async function shipClose(ctx: RunContext, o: CloseInput, token: string | undefined) {
  const root = repoRoot(ctx.cwd);
  const outbox = o.outbox === undefined ? undefined : path.resolve(ctx.cwd, o.outbox);
  if (outbox === undefined) throw new CommandError(EXIT.USAGE, "--flush needs --outbox");
  const month = resolveMonth(root, o.fid, o.month);
  const lock = await acquireDevLock({
    cwd: root,
    workflow: "ship",
    fid: o.fid,
    deadlineS: TIMEOUTS.SHIP_DEV_LOCK_ACQUIRE_DEADLINE_S,
    log: ctx.log,
  });
  const fail = (why: string) => {
    ctx.log(why);
    return { code: EXIT_FLUSH_FAILED, out: null as Record<string, unknown> | null };
  };
  let closeRoot = "";
  let landed: { ref: string; via: string } | null = null;
  let out: Record<string, unknown> = {};
  try {
    let wt: string;
    if (o.devPushes) {
      runGit(root, ["checkout", "dev"]);
      if (git(root, ["branch", "--show-current"]) !== "dev")
        return fail("not on dev after checkout — aborting dev ops");
      wt = root;
    } else {
      ctx.log(
        "RUNTIME_DEVPUSHES=false — the close commit lands through a detached origin/dev worktree",
      );
      wt = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? root;
    }
    out = closeWorkflow(wt, { ...o, recordStep: true, message: undefined }, ctx.log);
    if (o.devPushes) {
      closeRoot = wt;
    } else {
      if (!runGit(wt, ["fetch", "origin", "dev"]).ok)
        return fail(`fetch origin dev failed — close bookkeeping left uncommitted in ${wt}`);
      closeRoot = path.join(outbox, "close");
      if (fs.existsSync(closeRoot)) runGit(wt, ["worktree", "remove", "--force", closeRoot]);
      runGit(wt, ["worktree", "prune"]);
      if (!runGit(wt, ["worktree", "add", "--detach", closeRoot, "origin/dev"]).ok)
        return fail(`close worktree add failed — close bookkeeping left uncommitted in ${wt}`);
      unionLedgers(wt, closeRoot);
    }
    commitBookkeeping(
      {
        root: closeRoot,
        month,
        fid: o.fid,
        scope: "full",
        mode: "commit-allow-empty",
        message: `docs(${o.fid}): ship DONE bkit [skip ci]`,
      },
      ctx.log,
    );
    const released = releaseLock(
      workflowLockPath(lockRoot(ctx.cwd, "ship", o.devPushes), month, o.fid),
      { workflow: "ship", fid: o.fid, token },
    );
    if (released.removeFailed) return fail("Lock removal failed");
    if (o.devPushes) {
      if (!runGit(closeRoot, ["push", "origin", "dev"]).ok) {
        ctx.log("dev push failed");
        return { code: EXIT_PUSH_FAILED, out };
      }
      landed = { ref: "dev", via: "dev-push" };
    }
  } finally {
    releaseLock(lock.path, { workflow: "ship", fid: o.fid, token: lock.token });
  }

  if (!o.devPushes) {
    if (runGit(closeRoot, ["push", "origin", "HEAD:dev"]).ok) {
      landed = { ref: "dev", via: "head-push" };
    } else {
      // dev refused the push: publish the close commit through its own PR.
      const branch = `ship-close/${o.fid}`;
      const head = headSha(closeRoot);
      if (!runGit(closeRoot, ["push", "origin", `HEAD:refs/heads/${branch}`]).ok)
        return fail(`close branch push failed — close bookkeeping left in ${closeRoot}`);
      const created = runGh(closeRoot, [
        "pr",
        "create",
        "--base",
        "dev",
        "--head",
        branch,
        "--title",
        `docs(${o.fid}): ship DONE`,
        "--body",
        "",
      ]);
      if (!created.ok) return fail(`gh pr create failed: ${created.stderr}`);
      const pr = probePr(closeRoot, { head: branch, base: "dev", state: "open" });
      const number = pr.kind === "ok" ? pr.pr?.number : undefined;
      if (number === undefined) return fail(`close PR not found for ${branch}`);
      const merged = mergePr(
        closeRoot,
        {
          number: String(number),
          subject: `docs(${o.fid}): ship DONE bkit [skip ci]`,
          matchHead: head,
          deleteBranch: true,
        },
        ctx.log,
      );
      if (!merged.out.merged)
        ctx.log(`close PR #${number} opened but not merged — merge it by hand`);
      landed = { ref: branch, via: merged.out.merged ? "close-pr" : "close-pr-open" };
    }
    const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? root;
    runGit(top, ["worktree", "remove", "--force", closeRoot]);
    runGit(top, ["worktree", "prune"]);
  }
  return { code: EXIT.OK, out: { ...out, closeRoot, landed } };
}

// ---------------------------------------------------------------------------
// promote
// ---------------------------------------------------------------------------

/** The highest `{workflow}-v{N}-*.md` draft (sub-plan children `-v{N}-{k}.md` excluded), or null. */
export function highestVersion(dir: string, workflow: string): { file: string; n: number } | null {
  if (!fs.existsSync(dir)) return null;
  const re = new RegExp(`^${workflow}-v([0-9]+)-(.+)\\.md$`);
  let best: { file: string; n: number } | null = null;
  for (const f of fs.readdirSync(dir).sort()) {
    const m = re.exec(f);
    if (!m || /^[0-9]+$/.test(m[2]!)) continue;
    const n = Number(m[1]);
    if (best === null || n > best.n) best = { file: f, n };
  }
  return best;
}

/** Stamp `file`'s anchor when a base commit is known (plan: with its design's own anchor). */
function stamp(cwd: string, file: string, baseSha: string, design?: string): void {
  if (baseSha === "") return;
  const abs = path.resolve(cwd, file);
  const designAbs = design === undefined ? undefined : path.resolve(cwd, design);
  const d =
    design !== undefined && designAbs !== undefined && fs.existsSync(designAbs)
      ? { path: design, baseSha: readAnchor(fs.readFileSync(designAbs, "utf-8")).baseSha ?? "" }
      : undefined;
  const tmp = `${abs}.bkit-anchor.tmp`;
  fs.writeFileSync(tmp, stampAnchor(fs.readFileSync(abs, "utf-8"), baseSha, d));
  fs.renameSync(tmp, abs);
}

function promoteVerb(ctx: RunContext): number {
  const workflow = String(ctx.flags.workflow);
  if (!["design", "plan"].includes(workflow))
    throw new CommandError(EXIT.USAGE, "--workflow must be design or plan");
  const fid = String(ctx.flags.fid);
  const month = resolveMonth(repoRoot(ctx.cwd), fid, str(ctx.flags.month));
  const logs = logDirRel(month, fid);
  const best = highestVersion(path.resolve(ctx.cwd, logs), workflow);
  if (best === null) {
    ctx.log(`no ${workflow}-v*.md under ${logs}`);
    return EXIT_NO_VERSION;
  }
  const final = path.join(logs, best.file);
  if (ctx.flags.resolve === true) {
    ctx.emit({ final, canonical: null, archived: [], subPlans: [], baseSha: null });
    return EXIT.OK;
  }

  // The base commit Step 2 recorded on the runtime-resolved row.
  const statusRel = str(ctx.flags.file) ?? path.join(logs, "status.jsonl");
  const statusAbs = path.resolve(ctx.cwd, statusRel);
  const runtime = fs.existsSync(statusAbs)
    ? readStatusRows(statusAbs)
        .filter((r) => r.type === "runtime-resolved")
        .at(-1)
    : undefined;
  const baseSha = typeof runtime?.baseSha === "string" ? runtime.baseSha : "";
  if (runtime === undefined)
    ctx.log("no runtime-resolved row — the canonical doc carries no anchor");
  const design =
    workflow === "plan" ? path.join("docs", "plans", month, `${fid}-design.md`) : undefined;

  const bucket = path.join("docs", "plans", month);
  const canonical = path.join(bucket, `${fid}-${workflow}.md`);
  stamp(ctx.cwd, final, baseSha, design);
  const children =
    workflow === "plan"
      ? fs
          .readdirSync(path.resolve(ctx.cwd, logs))
          .filter((f) => new RegExp(`^plan-v${best.n}-[0-9]+\\.md$`).test(f))
          .sort()
      : [];

  // A changed canonical moves to archive/ first — plan moves the whole set under one timestamp.
  const archived: string[] = [];
  const canonicalAbs = path.resolve(ctx.cwd, canonical);
  if (
    fs.existsSync(canonicalAbs) &&
    !fs.readFileSync(canonicalAbs).equals(fs.readFileSync(path.resolve(ctx.cwd, final)))
  ) {
    const ts = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d+Z$/, "Z");
    const archive = path.join(bucket, "archive");
    fs.mkdirSync(path.resolve(ctx.cwd, archive), { recursive: true });
    const set = fs
      .readdirSync(path.resolve(ctx.cwd, bucket))
      .filter((f) =>
        workflow === "plan"
          ? f === `${fid}-plan.md` || new RegExp(`^${fid}-plan-[0-9]+\\.md$`).test(f)
          : f === `${fid}-design.md`,
      );
    for (const f of set) {
      const to = path.join(archive, `${ts}-${f}`);
      fs.renameSync(path.resolve(ctx.cwd, bucket, f), path.resolve(ctx.cwd, to));
      archived.push(to);
    }
  }
  fs.mkdirSync(path.resolve(ctx.cwd, bucket), { recursive: true });
  fs.copyFileSync(path.resolve(ctx.cwd, final), canonicalAbs);
  const subPlans: string[] = [];
  for (const child of children) {
    const k = /-([0-9]+)\.md$/.exec(child)![1]!;
    stamp(ctx.cwd, path.join(logs, child), baseSha, design);
    const to = path.join(bucket, `${fid}-plan-${k}.md`);
    fs.copyFileSync(path.resolve(ctx.cwd, logs, child), path.resolve(ctx.cwd, to));
    subPlans.push(to);
  }
  if (workflow === "plan") {
    // Working names in the copies become the canonical names.
    for (const f of [canonical, ...subPlans]) {
      const abs = path.resolve(ctx.cwd, f);
      fs.writeFileSync(
        abs,
        fs
          .readFileSync(abs, "utf-8")
          .replace(/plan-v[0-9]+-split\.md/g, `${fid}-plan.md`)
          .replace(/plan-v[0-9]+-([0-9]+)\.md/g, `${fid}-plan-$1.md`),
      );
    }
  }
  if (fs.statSync(canonicalAbs).size === 0) {
    ctx.log(`canonical empty: ${canonical}`);
    return EXIT_NO_VERSION;
  }
  ctx.emit({ final, canonical, archived, subPlans, baseSha: baseSha || null });
  return EXIT.OK;
}

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

const FID_FLAG: FlagSpec = { name: "fid", type: "string", required: true, help: "feature id" };
const MONTH_FLAG: FlagSpec = {
  name: "month",
  type: "string",
  help: "month bucket YYYYMM (default: the feature's bucket, else this UTC month)",
};
const DEV_PUSHES_FLAG: FlagSpec = {
  name: "dev-pushes",
  type: "boolean",
  help: "ship only: this runtime pushes to dev (logs book in the main checkout)",
};
const STATUS_FILE_FLAG: FlagSpec = {
  name: "file",
  type: "string",
  help: "path to status.jsonl (default: derived from --workflow, --fid, --month)",
};
const TOKEN_FLAG: FlagSpec = {
  name: "token",
  type: "string",
  help: "the lock token `bkit locks acquire` returned (default: match workflow and fid)",
};
const OWNER_REPO_FLAG: FlagSpec = {
  name: "owner-repo",
  type: "string",
  help: "owner/repo for links (default: from the origin remote)",
};
const COMMENT_FLAGS: FlagSpec[] = [
  { name: "number", type: "string", help: "step number: print the close comment (needs --outbox)" },
  { name: "title", type: "string", help: "step title of the close comment" },
];

export const workflowsCommand: CommandSpec = {
  noun: "workflows",
  summary: "Start, fail, hand over and close a phase workflow run; promote and link its documents.",
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
        const workflow = workflowName(String(ctx.flags.workflow));
        const fid = String(ctx.flags.fid);
        const devPushes = ctx.flags.devPushes === true;
        const token = str(ctx.flags.token);
        if (token !== undefined && ctx.flags.lockHeld !== true)
          throw new CommandError(EXIT.USAGE, "--token applies with --lock-held only");
        const where = whereInTree(ctx.cwd, {
          workflow,
          fid,
          month: str(ctx.flags.month),
          devPushes,
          file: str(ctx.flags.file),
        });

        let lock: Record<string, unknown>;
        if (ctx.flags.lockHeld === true) {
          const file = workflowLockPath(lockRoot(ctx.cwd, workflow, devPushes), where.month, fid);
          checkHeldLock(file, { workflow, fid, token });
          lock = { path: file };
        } else {
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
        if (!fs.existsSync(file)) fs.writeFileSync(file, "");

        const latest = fold(readStatusEvents(file)).at(-1);
        const resumed = latest?.workflow === workflow && latest.status === "IN_PROGRESS";
        let row: Record<string, unknown> | null = null;
        if (!resumed) {
          row = {
            type: "workflow-started",
            workflow,
            at: statusTimestamp(),
            parentSha: headSha(path.dirname(file)),
          };
          fs.appendFileSync(file, appendLine(row as StatusEvent));
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
      summary:
        "Failure Path: workflow-failed row, abort rebase, release lock, clear sentinels (with --token); the bkit:failed labels and the failure comment.",
      flags: [
        WORKFLOW_FLAG,
        { ...FID_FLAG, required: false, help: "feature id (needed with --token)" },
        MONTH_FLAG,
        DEV_PUSHES_FLAG,
        STATUS_FILE_FLAG,
        {
          ...TOKEN_FLAG,
          help: "the lock token Step 1 took; without it nothing is written or released (the run never locked)",
        },
        {
          name: "max-exceeded",
          type: "boolean",
          help: "the failure is a MAX_* attempt limit being exceeded (a handover is due)",
        },
        {
          name: "label",
          type: "string",
          repeatable: true,
          help: "a label the issue carries now (labels: those plus bkit:failed)",
        },
        {
          name: "pr",
          type: "string",
          help: "ship: the PR number; a MERGED PR moves the issue to bkit:merged as well",
        },
        {
          name: "step-number",
          type: "string",
          help: "the failed step's number: print the failure comment",
        },
        { name: "step-title", type: "string", help: "the failed step's title" },
        { name: "sub-step", type: "string", help: "the failed sub-step" },
        {
          name: "error-file",
          type: "string",
          help: "file holding the error message / tool response for the comment",
        },
        { name: "error", type: "string", help: "the error text, when there is no --error-file" },
        {
          name: "stderr-file",
          type: "string",
          help: "the failed shell command's stderr (last 20 lines kept)",
        },
      ],
      output: {
        row: "the appended workflow-failed row, or null (no --token, or no status.jsonl)",
        rebaseAborted: "an in-progress rebase was found and aborted",
        lock: "{path, existed, released, heldBy}: heldBy is another owner's lock line, left in place; null without --token",
        sentinels: "[{name, path}] sentinels that existed before this call removed them",
        handoverNeeded:
          "--max-exceeded, a sentinel existed, or a debug run in SOAK mode: write the abort handover",
        labels:
          "the label set to write: the current labels plus bkit:failed (and bkit:merged for a merged ship PR)",
        linearState: "the Linear state for the failed issue",
        prState: "the --pr PR's state, or null",
        comment: "the failure comment body (with --step-number), else null",
      },
      exitCodes: {
        [EXIT_SPLIT_BUCKET]: "no --month and the feature has logs in more than one month bucket",
        [EXIT_REMOVE_FAILED]:
          "the lock file is still there after removing it (everything else was done; the comment says so)",
      },
      run: failVerb,
    },
    handover: {
      summary:
        "After the handover subagent: commit and abort-push it (--push), or ship's one-commit flush (--flush); print the handover comment.",
      flags: [
        WORKFLOW_FLAG,
        FID_FLAG,
        MONTH_FLAG,
        {
          name: "push",
          type: "boolean",
          help: "git add -A, commit `docs({fid}): {workflow} aborted bkit [skip ci]`, push --mode=abort",
        },
        {
          name: "flush",
          type: "boolean",
          help: "ship: copy the worktree's logs and ledgers into the book root, ONE FAILED commit, ONE push",
        },
        {
          name: "open-pr",
          type: "string",
          help: "--push: the open-PR answer from MCP (a number, or none) instead of asking gh",
        },
        { name: "ref", type: "string", help: "link the handover at this ref (no push / flush)" },
        DEV_PUSHES_FLAG,
        {
          name: "worktree",
          type: "string",
          help: "ship: the worktree holding the handover and the branch-side logs (default: cwd / .worktrees/{fid})",
        },
        OWNER_REPO_FLAG,
      ],
      output: {
        handover: "the handover artifact, or null when absent",
        pushed: "the push (or flush push) ran and succeeded",
        ref: "where the handover now lives, or null when nothing was pushed",
        skipped:
          "why nothing was pushed: open-pr | skip-ci | dev-lock-busy | nothing-to-commit (null otherwise)",
        comment:
          "the handover comment body (null when there is no handover); links only when pushed",
      },
      exitCodes: {
        [EXIT_SPLIT_BUCKET]: "no --month and the feature has logs in more than one month bucket",
        [EXIT_HANDOVER_MISSING]:
          "--push: the handover artifact is missing or empty (nothing committed)",
        [EXIT_OPEN_PR_KEPT]:
          "--push: the branch has an open PR, nothing pushed (the comment has no link)",
        [EXIT_PUSH_FAILED]: "the push failed (the comment has no link)",
        [EXIT_FLUSH_FAILED]:
          "--flush: not on dev after checkout, detached HEAD, or the FAILED commit failed",
      },
      run: handoverVerb,
    },
    close: {
      summary:
        "Grade compliance, workflow-done row, counter + outcome telemetry, report, artifact links; --flush lands ship's close on dev.",
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
        OWNER_REPO_FLAG,
        {
          name: "outbox",
          type: "string",
          help: "write close-artifacts.md and close-telemetry.md here, for the close comment",
        },
        {
          name: "record-step",
          type: "boolean",
          help: "append the {workflow}-close-workflow step-done row first",
        },
        {
          name: "message",
          type: "string",
          help: "then git add -A and commit with this message in the tree",
        },
        {
          name: "label",
          type: "string",
          repeatable: true,
          help: "a label the issue carries now: bkit:auto appends ` bkit [auto route]` to --message",
        },
        {
          name: "verbose-ci-local",
          type: "boolean",
          help: "append ` bkit [verbose ci]` to --message when the run's pushMode is LOCAL",
        },
        ...COMMENT_FLAGS,
        { name: "tree", type: "string", help: "the close comment links the tree of this ref" },
        {
          name: "flush",
          type: "boolean",
          help: "ship: under the dev lock, close on dev (or a detached origin/dev worktree), commit `ship DONE`, release the lock (--token), push",
        },
        { ...TOKEN_FLAG, help: "--flush: the workflow lock token to release" },
      ],
      output: {
        row: "the appended workflow-done row",
        counterRow:
          "the {WORKFLOW}_ATTEMPT counter row written to .bkit/stats.jsonl, or null if invalid",
        outcomeRow: "the outcome row written to .bkit/stats.jsonl, or null if invalid",
        telemetryWritten:
          "the stats rows were appended (false: append failed, logged, close continues)",
        compliance:
          "compliance violations graded before the report (null: the grader was unavailable)",
        report: "this workflow's telemetry report lines, for the close comment",
        artifacts: "[{name, path, url}] feature docs and this workflow's logs on --ref",
        artifactLinks: "the same as markdown `- [name](url)` lines",
        parentSha: "HEAD before the --message commit (the close step's parentSha)",
        commit: "the --message commit, or null",
        comment: "the close comment (--number with --outbox), else null",
        roadmapFoldNeeded:
          "always true: append the feature row and re-render the board (not run here)",
        featureStatus: "roadmap status this close moves the feature to",
        closeRoot: "--flush: the checkout the close commit was made in",
        landed: "--flush: {ref, via: dev-push | head-push | close-pr | close-pr-open}",
      },
      exitCodes: {
        [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON (nothing written)",
        [EXIT_SPLIT_BUCKET]: "no --month and the feature has logs in more than one month bucket",
        [EXIT_PUSH_FAILED]: "--flush: the dev push failed",
        [EXIT_FLUSH_FAILED]:
          "--flush: not on dev after checkout, the dev fetch / close worktree failed, the lock stayed, or the close PR could not be opened",
      },
      run: async (ctx) => {
        const f = ctx.flags;
        const input: CloseInput = {
          workflow: String(f.workflow),
          fid: String(f.fid),
          month: str(f.month),
          devPushes: f.devPushes === true,
          file: str(f.file),
          prNumber: positiveInt(f.prNumber, "pr-number"),
          squashSha: str(f.squashSha),
          ref: str(f.ref),
          ownerRepo: str(f.ownerRepo),
          outbox: str(f.outbox),
          recordStep: f.recordStep === true,
          message: str(f.message),
          labels: list(f.label),
          verboseCiLocal: f.verboseCiLocal === true,
          number: str(f.number),
          title: str(f.title),
          tree: str(f.tree),
        };
        if (f.flush === true) {
          if (input.workflow !== "ship") throw new CommandError(EXIT.USAGE, "--flush is ship only");
          const r = await shipClose(ctx, input, str(f.token));
          if (r.out) ctx.emit(r.out);
          return r.code;
        }
        ctx.emit(closeWorkflow(ctx.cwd, input, ctx.log));
        return EXIT.OK;
      },
    },
    promote: {
      summary:
        "Design / plan close: the highest versioned draft becomes the canonical doc (anchor stamped, a changed canonical archived, plan sub-plans copied).",
      flags: [
        { ...WORKFLOW_FLAG, help: "design | plan" },
        FID_FLAG,
        MONTH_FLAG,
        {
          name: "file",
          type: "string",
          help: "status.jsonl whose runtime-resolved row holds the base commit (default: in the logs folder)",
        },
        {
          name: "resolve",
          type: "boolean",
          help: "only print the highest draft (final); copy nothing",
        },
      ],
      output: {
        final:
          "the highest versioned draft, e.g. docs/plans/202610/logs/12-x/design-v3-organised.md",
        canonical: "the canonical doc written, or null with --resolve",
        archived: "superseded canonical docs moved to archive/",
        subPlans: "plan: the canonical sub-plans written",
        baseSha: "the base commit stamped into the anchor, or null when none was recorded",
      },
      exitCodes: {
        [EXIT_SPLIT_BUCKET]: "no --month and the feature has logs in more than one month bucket",
        [EXIT_NO_VERSION]: "no versioned draft to promote, or the canonical came out empty",
      },
      run: promoteVerb,
    },
    links: {
      summary:
        "The feature's docs and this workflow's logs on a ref as markdown links; optionally the close comment.",
      flags: [
        WORKFLOW_FLAG,
        FID_FLAG,
        MONTH_FLAG,
        {
          name: "ref",
          type: "string",
          help: "ref to list (default dev; origin/dev lists the remote copy, links still name dev)",
        },
        OWNER_REPO_FLAG,
        {
          name: "outbox",
          type: "string",
          help: "write close-artifacts.md here (beside close's close-telemetry.md)",
        },
        ...COMMENT_FLAGS,
      ],
      output: {
        artifacts: "[{name, path, url}]",
        artifactLinks: "the same as markdown `- [name](url)` lines",
        comment:
          "the close comment (--number with --outbox): Artifacts and Telemetry sections, else null",
      },
      exitCodes: {
        [EXIT_SPLIT_BUCKET]: "no --month and the feature has logs in more than one month bucket",
      },
      run: (ctx) => {
        const workflow = workflowName(String(ctx.flags.workflow));
        const fid = String(ctx.flags.fid);
        const root = repoRoot(ctx.cwd);
        const month = resolveMonth(root, fid, str(ctx.flags.month));
        const artifacts = artifactLinks(
          root,
          str(ctx.flags.ref) ?? "dev",
          month,
          fid,
          workflow,
          str(ctx.flags.ownerRepo) ?? (resolveRepoSlug(root) || "unknown/repo"),
        );
        let comment: string | null = null;
        const outbox = str(ctx.flags.outbox);
        if (outbox !== undefined) {
          const dir = path.resolve(ctx.cwd, outbox);
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, ARTIFACTS_FILE), `${linkLines(artifacts)}\n`);
          const number = str(ctx.flags.number);
          if (number !== undefined) {
            const title = str(ctx.flags.title);
            if (title === undefined) throw new CommandError(EXIT.USAGE, "--number needs --title");
            comment = closeComment(root, dir, { number, title });
          }
        } else if (ctx.flags.number !== undefined) {
          throw new CommandError(EXIT.USAGE, "--number needs --outbox");
        }
        ctx.emit({ artifacts, artifactLinks: linkLines(artifacts), comment });
        return EXIT.OK;
      },
    },
  },
};
