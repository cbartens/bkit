// bkit workflows start|fail|handover|close|promote|links — a phase workflow's
// lifecycle state.
//
// start     takes the feature lock (or checks the one Step 1 took) and opens a run
//           with a `workflow-started` row, unless this is a resume of the same
//           workflow's IN_PROGRESS run.
// fail      the Failure Path's state and payloads: `workflow-failed` row, abort an
//           in-progress rebase, release the lock, clear the sentinels, say whether
//           a handover is due, and print the `bkit:failed` label set and the
//           failure comment; `--post` sends both to the issue.
// handover  after the handover subagent: commit and abort-push it (`--push`), or
//           ship's one-commit flush (`--flush`), and print the handover comment.
// close     grade compliance, then the `workflow-done` row, the run's counter and
//           outcome rows in `.bkit/stats.jsonl`, this workflow's telemetry report
//           and the artifact links. `--flush` is ship's close: land it on dev
//           through a throwaway origin/dev checkout, then remove the worktree.
// promote   design / plan close: the highest versioned draft becomes the
//           canonical doc (anchor stamped, a superseded canonical archived).
// links     the feature docs and this workflow's logs on a ref, as markdown links.

import * as fs from "node:fs";
import * as path from "node:path";

import {
  appendLine,
  fold,
  lastRun,
  runNumber,
  runOrStepField,
  statusTimestamp,
  type StatusEvent,
} from "../../ledgers/status.js";
import {
  foldFrom,
  normalize,
  resolveRepoSlug,
  workflowTelemetry,
  type CoverageStats,
  type OutcomePayload,
} from "../../ledgers/telemetry.js";
import { readBkitConfig } from "../../shared/settings.js";
import { gradeCompliance } from "../comply.js";
import { landDir, pushToDev, type DevPush } from "../land.js";
import {
  CommandError,
  DEV,
  EXIT,
  git,
  isSharedBranch,
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
import { anchorBkitStatus, pushBranch, readAnchor, stampAnchor } from "./branches.js";
import {
  AUTO_LABEL,
  AUTO_ROUTE_SUFFIX,
  buildComment,
  issueText,
  parseComments,
  sortOldestFirst,
  trackerState,
  transitionLabels,
  type IssueComment,
} from "./issues.js";
import {
  EXIT_EMPTY,
  activeRecord,
  commitBookkeeping,
  ownPathCommit,
  ownSet,
  removeRecord,
  appendLedgerRows,
  runRows,
  unionLedgers,
} from "./ledgers.js";
import {
  buildBlock,
  ciList,
  planBlock,
  runLines,
  runStatusRows,
  stepsBlock,
  timeBlock,
} from "./run-facts.js";
import {
  EXIT_REMOVE_FAILED,
  EXIT_SPLIT_BUCKET,
  acquireWorkflowLock,
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
import {
  COMMENT_FILE_OUTPUT,
  POST_FLAG,
  TRACKER_OUTPUT,
  attempt,
  commentFileOf,
  postForVerb,
  issueRef,
  readLabels,
  endedRunActionKey,
  skipOf,
  trackerTarget,
  writeLabels,
  type TrackerOutcome,
} from "./tracker.js";
import type { TipsContext } from "../../cli.js";
import { tipsText } from "../tips.js";
import { EXIT_NO_RECORD, requireRecordOnShared, writeStepRow } from "./steps.js";
import { addAllButCopied, removeWorktree, type RemoveResult } from "./worktrees.js";

/** Sentinels a workflow leaves in its logs folder; either one existing means a handover is due. */
export const SENTINELS = [".rebase-failed", ".deferred-blocked"] as const;

/** Exit code (start --lock-held): the lock is missing or belongs to another owner. */
export const EXIT_LOCK_NOT_HELD = 6;
/** Exit code (handover --push): the branch has an open PR, so nothing was pushed. */
export const EXIT_OPEN_PR_KEPT = 9;
/** Exit code (handover, close --flush): a push failed. */
export const EXIT_PUSH_FAILED = 10;
/** Exit code (handover --flush, close --flush): a dev checkout, commit or worktree step failed. */
export const EXIT_FLUSH_FAILED = 11;
/** Exit code (promote): no versioned draft to promote. */
export const EXIT_NO_VERSION = 12;
/** Exit code (input): a named input file is missing or not in the expected shape. */
export const EXIT_NO_INPUT = 13;
/** Exit code (start --branch): the checkout is not on the named branch. */
export const EXIT_WRONG_BRANCH = 15;

// ---------------------------------------------------------------------------
// Where things live
// ---------------------------------------------------------------------------

interface Where {
  root: string;
  month: string;
  /** Tree the run works in: the current worktree's top. */
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

/** start and close work in the current tree, the root `git rev-parse --show-toplevel` reports. */
function whereInTree(
  cwd: string,
  o: { workflow: string; fid: string; month?: string; file?: string },
): Where {
  const root = repoRoot(cwd);
  const month = resolveMonth(root, o.fid, o.month);
  const tree = git(cwd, ["rev-parse", "--show-toplevel"]) ?? root;
  const status = o.file ? path.resolve(cwd, o.file) : path.join(tree, statusRelPath(month, o.fid));
  return { root, month, tree, status };
}

const headSha = (cwd: string) => git(cwd, ["rev-parse", "HEAD"]) ?? "";

/** An OPEN Decision Pause file of the current run, as `workflows start` prints it. */
export interface OpenDecision {
  file: string;
  decision: number;
  question: string | null;
  from: string | null;
  pauseStep: number | null;
  subPlan: number | null;
  verifyAttempt: number | null;
  testAttempt: number | null;
  plan: string | null;
}

/**
 * The highest-numbered `{workflow}-decision-{run}-{N}.md` in `logDir` whose header holds
 * `Status: OPEN`, or null. Only the given run's files count, so an earlier run's pause
 * never resurfaces. `file` is relative to `tree`.
 */
export function openDecision(
  logDir: string,
  tree: string,
  workflow: string,
  run: number,
): OpenDecision | null {
  if (!fs.existsSync(logDir)) return null;
  const name = new RegExp(`^${workflow}-decision-${run}-([0-9]+)\\.md$`);
  const found = fs
    .readdirSync(logDir)
    .map((f) => ({ f, m: name.exec(f) }))
    .filter((x): x is { f: string; m: RegExpExecArray } => x.m !== null)
    .map(({ f, m }) => ({ f, n: Number(m[1]) }))
    .sort((a, b) => b.n - a.n);
  for (const { f, n } of found) {
    const text = fs.readFileSync(path.join(logDir, f), "utf-8");
    const field = (key: string) =>
      new RegExp(`^${key}:[ \\t]*(.+?)[ \\t]*$`, "m").exec(text)?.[1] ?? null;
    if (field("Status") !== "OPEN") continue;
    const num = (key: string) => {
      const v = field(key);
      return v !== null && /^[0-9]+$/.test(v) ? Number(v) : null;
    };
    return {
      file: path.relative(tree, path.join(logDir, f)),
      decision: n,
      question: field("Question"),
      from: field("From"),
      pauseStep: num("Pause step"),
      subPlan: num("Sub-plan"),
      verifyAttempt: num("Verify attempt"),
      testAttempt: num("Test attempt"),
      plan: field("Plan"),
    };
  }
  return null;
}
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
  const root = repoRoot(ctx.cwd);
  const month = resolveMonth(root, fid, str(ctx.flags.month) || undefined);
  const file = str(ctx.flags.file) || undefined;
  const status = file
    ? path.resolve(ctx.cwd, file)
    : statusLocation({ cwd: ctx.cwd, workflow, fid, month }).path;

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

  const lockFile = workflowLockPath(root, month, fid);
  const { removeFailed, ...lock } = releaseLock(lockFile, {
    workflow,
    fid,
    token: str(ctx.flags.token),
  });
  if (lock.heldBy !== null)
    ctx.log(`${lockFile} belongs to another owner, left in place: ${lock.heldBy}`);
  if (removeFailed) ctx.log(`lock removal failed: ${lockFile}`);

  // Each sentinel is cleared where it was created: `.rebase-failed` in the run's
  // tree, `.deferred-blocked` beside status.jsonl.
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
  return { row, rebaseAborted, lock, sentinels, removeFailed, soak, status };
}

async function failVerb(ctx: RunContext): Promise<number> {
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
          status: undefined,
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
  const failedSet = (current: string[]) => {
    const labels = transitionLabels(current, transition).labels;
    if (merged && !labels.includes("bkit:failed")) labels.push("bkit:failed");
    return labels;
  };
  const current = list(ctx.flags.label);
  const labels = failedSet(current);
  const add = labels.filter((l) => !current.includes(l));
  const failedState = trackerState(transition, undefined, readBkitConfig(repoRoot(ctx.cwd)));

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
  if (ctx.flags.post === true && comment === null)
    throw new CommandError(EXIT.USAGE, "--post needs --step-number");
  // Once per run and step: an engine-action row where the run's status.jsonl exists.
  const key = endedRunActionKey(
    state.status,
    workflow,
    "failure",
    stepNumber,
    str(ctx.flags.subStep) || undefined,
  );
  const tracker =
    ctx.flags.post === true && comment !== null
      ? await postForVerb(ctx, comment, {
          fid,
          issue: str(ctx.flags.issue),
          ...(key === undefined ? {} : { file: state.status, key }),
        })
      : undefined;
  const labelsWrite =
    ctx.flags.post === true ? await writeFailedLabels(ctx, fid, failedSet, failedState) : undefined;

  ctx.emit({
    row: state.row,
    rebaseAborted: state.rebaseAborted,
    lock: state.lock,
    sentinels: state.sentinels,
    handoverNeeded:
      token !== undefined &&
      (ctx.flags.maxExceeded === true || state.sentinels.length > 0 || state.soak),
    add,
    labels,
    trackerState: failedState,
    prState,
    comment,
    commentFile: commentFileOf(ctx.cwd, comment),
    ...(tracker === undefined ? {} : { tracker }),
    ...(labelsWrite === undefined ? {} : { labelsWrite }),
    ...sessionRemoval(ctx),
  });
  return state.removeFailed ? EXIT_REMOVE_FAILED : EXIT.OK;
}

/**
 * `fail --post`: read the issue's labels, write the failed set and the review state.
 * The set comes from the labels read, not `--label`, so a label added since Step 1 stays.
 */
async function writeFailedLabels(
  ctx: RunContext,
  fid: string | undefined,
  failedSet: (current: string[]) => string[],
  state: string | null,
): Promise<TrackerOutcome> {
  const t = trackerTarget(ctx.cwd, { fid, issue: str(ctx.flags.issue) });
  const skip = skipOf(t);
  if (skip) return skip;
  return attempt("labels", ctx.log, async () => {
    const current = await readLabels(t);
    const labels = failedSet(current);
    await writeLabels(t, {
      add: labels.filter((l) => !current.includes(l)),
      remove: current.filter((l) => !labels.includes(l)),
      labels,
      state,
    });
  });
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

/** Non-empty lines; a final newline ends the last line rather than starting an empty one. */
const textLines = (text: string) => text.split("\n").filter((l) => l.trim() !== "");

/** `rel` in `tree` differs from its HEAD copy, or is untracked: the run wrote it. */
const ownWrite = (tree: string, rel: string) =>
  (git(tree, ["status", "--porcelain", "--untracked-files=all", "--", rel]) ?? "") !== "";

/** Copy each `.md` log in the run's log folder that dev lacks, or that the run rewrote. */
function carryLogs(src: string, dst: string, rel: string): string[] {
  if (!fs.existsSync(path.join(src, rel))) return [];
  fs.mkdirSync(path.join(dst, rel), { recursive: true });
  const copied: string[] = [];
  for (const f of fs.readdirSync(path.join(src, rel)).filter((n) => n.endsWith(".md"))) {
    const from = path.join(src, rel, f);
    const to = path.join(dst, rel, f);
    const same = fs.existsSync(to) && fs.readFileSync(to).equals(fs.readFileSync(from));
    if (same || (fs.existsSync(to) && !ownWrite(src, path.join(rel, f)))) continue;
    fs.copyFileSync(from, to);
    copied.push(path.join(rel, f));
  }
  return copied;
}

/**
 * Carry a run's book (its feature worktree) into a dev checkout: its `.md` logs,
 * and its ledger rows unioned line-wise (both hold rows the other does not).
 */
function carryBook(src: string, dst: string, month: string, fid: string): void {
  carryLogs(src, dst, logDirRel(month, fid));
  unionLedgers(src, dst);
}

/** What a landing carried out of a shared checkout: whole `.md` logs, and ledger lines per file. */
interface Carried {
  files: string[];
  lines: Map<string, string[]>;
}

/** Shared ledgers a run may append to, outside its own log folder. */
const SHARED_LEDGERS = [
  ":(glob)docs/*.jsonl",
  ":(glob).bkit/*.jsonl",
  ":(exclude).bkit/issues.jsonl",
];

/**
 * Kinds no workflow run writes: bkit's harvest script writes them to `harvest/`, and a
 * `run` row names any feature's workflow (`.bkit/jsonl.md` § Ledgers & Writers).
 */
const NOT_A_RUNS_OWN_KIND = new Set(["chat", "run"]);

/** HEAD and every `parentSha` the run's status rows of `workflow` carry: the shas its `run.parentSha` can name. */
function runShas(src: string, status: string, workflow: string): Set<string> {
  const shas = new Set<string>([headSha(src)]);
  for (const e of fs.existsSync(status) ? readStatusEvents(status) : []) {
    const sha = (e as Record<string, unknown>).parentSha;
    if (e.workflow === workflow && typeof sha === "string") shas.add(sha);
  }
  shas.delete("");
  return shas;
}

/** A feature id in `references`: a bare number or `{N}-{slug}`. */
const FEATURE_REF = /^\d+(-[a-z0-9-]+)?$/;

/**
 * A shared-ledger row (normalized) of THIS run: a row of `workflow` at or after its
 * start, never a kind no run writes. A row with `run.parentSha` (compliance, counter,
 * outcome) must name one of the run's shas; any other row must not point at a
 * different feature in its `references`.
 */
function isRunsOwnRow(
  row: Record<string, unknown>,
  o: { fid: string; workflow: string; startMs: number | undefined },
  shas: Set<string>,
): boolean {
  if (byWorkflow(row) !== o.workflow || !(Number(row.ts) >= o.startMs!)) return false;
  if (NOT_A_RUNS_OWN_KIND.has(String(row.kind))) return false;
  const sha = (row.run as Record<string, unknown> | undefined)?.parentSha;
  if (sha !== undefined) return typeof sha === "string" && shas.has(sha);
  const features = (Array.isArray(row.references) ? row.references : [])
    .map(String)
    .filter((r) => FEATURE_REF.test(r));
  const n = /^(\d+)-/.exec(o.fid)?.[1];
  return features.length === 0 || features.some((r) => r === o.fid || r === n);
}

/**
 * Carry ONLY the run's own record out of a dev / main / detached checkout, which
 * other sessions and local-only commits share: the `.md` logs it wrote in its log
 * folder; the lines of that folder's `.jsonl` files its HEAD lacks; and, from the
 * shared ledgers, lines its HEAD lacks that are this run's rows ({@link isRunsOwnRow}).
 * No start known → no shared-ledger row is carried.
 */
function carryOwnBook(
  src: string,
  dst: string,
  o: { month: string; fid: string; workflow: string; startMs: number | undefined },
  log: (line: string) => void,
): Carried {
  const rel = logDirRel(o.month, o.fid);
  const carried: Carried = { files: carryLogs(src, dst, rel), lines: new Map() };
  // Rows the run appended; on a shared checkout, recorded foreign rows are never carried.
  const rec = activeRecord(src, o.fid);
  const uncommitted = (file: string) => runRows(src, file, rec);
  const add = (file: string, lines: string[]) => {
    const to = path.join(dst, file);
    const existing = fs.existsSync(to) ? fs.readFileSync(to, "utf-8") : "";
    const have = new Set(textLines(existing).map((l) => l.trim()));
    const fresh = lines.filter((l) => !have.has(l.trim()));
    if (fresh.length === 0) return;
    fs.mkdirSync(path.dirname(to), { recursive: true });
    const sep = existing !== "" && !existing.endsWith("\n") ? "\n" : "";
    fs.appendFileSync(to, `${sep}${fresh.join("\n")}\n`);
    carried.lines.set(file, fresh);
  };
  const listed = (specs: string[]) =>
    (git(src, ["ls-files", "--cached", "--others", "--exclude-standard", "--", ...specs]) ?? "")
      .split("\n")
      .filter((f) => f !== "" && fs.existsSync(path.join(src, f)));

  for (const file of listed([`:(glob)${rel}/*.jsonl`])) add(file, uncommitted(file));
  if (o.startMs === undefined) {
    log(`no ${o.workflow} start row for ${o.fid} — no shared-ledger row carried`);
    return carried;
  }
  const shas = runShas(src, path.join(src, statusRelPath(o.month, o.fid)), o.workflow);
  for (const file of listed(SHARED_LEDGERS)) {
    const own = uncommitted(file).filter((l) => {
      const row = parseObject(l);
      return row !== undefined && isRunsOwnRow(normalize(row), o, shas);
    });
    if (own.length > 0) add(file, own);
  }
  return carried;
}

/**
 * After a landing from a dev / main / detached checkout: hand back what was
 * carried, so a later fast-forward of dev does not stop on it. A carried `.md`
 * log identical to the landed copy is removed when untracked, or returns to HEAD
 * when tracked. A carried ledger loses exactly the carried lines; it returns to
 * HEAD when that leaves it equal, and an untracked one left empty is removed.
 * Anything staged, or a log changed since it landed, stays and is named. A path
 * the shared-checkout record lists is never reset or removed.
 */
function handBack(
  tree: string,
  sha: string,
  carried: Carried,
  log: (line: string) => void,
  recorded: ReadonlySet<string> = new Set(),
): void {
  const back: string[] = [];
  const kept: string[] = [];
  const staged = (rel: string) => !runGit(tree, ["diff", "--cached", "--quiet", "--", rel]).ok;
  const tracked = (rel: string) => runGit(tree, ["ls-files", "--error-unmatch", "--", rel]).ok;
  for (const rel of carried.files) {
    // A path that was dirty before the run started is not the run's to reset.
    if (recorded.has(rel)) continue;
    const abs = path.join(tree, rel);
    const landed = runGit(tree, ["show", `${sha}:${rel}`]);
    const same =
      landed.ok && fs.existsSync(abs) && fs.readFileSync(abs, "utf-8").trim() === landed.stdout;
    if (!same || staged(rel)) kept.push(rel);
    else if (!tracked(rel)) {
      fs.rmSync(abs);
      back.push(rel);
    } else if (runGit(tree, ["restore", "--source=HEAD", "--worktree", "--", rel]).ok)
      back.push(rel);
    else kept.push(rel);
  }
  for (const [rel, lines] of carried.lines) {
    const abs = path.join(tree, rel);
    if (!fs.existsSync(abs) || staged(rel)) {
      kept.push(rel);
      continue;
    }
    const drop = new Map<string, number>();
    for (const l of lines) drop.set(l.trim(), (drop.get(l.trim()) ?? 0) + 1);
    const left = fs
      .readFileSync(abs, "utf-8")
      .split("\n")
      .filter((l) => {
        const n = drop.get(l.trim()) ?? 0;
        if (n === 0) return true;
        drop.set(l.trim(), n - 1);
        return false;
      })
      .join("\n");
    const head = runGit(tree, ["show", `HEAD:${rel}`]);
    if (head.ok && left.trim() === head.stdout.trim()) {
      if (!runGit(tree, ["restore", "--source=HEAD", "--worktree", "--", rel]).ok) {
        kept.push(rel);
        continue;
      }
    } else if (!tracked(rel) && left.trim() === "") fs.rmSync(abs);
    else fs.writeFileSync(abs, left.endsWith("\n") || left === "" ? left : `${left}\n`);
    back.push(rel);
  }
  if (back.length > 0) log(`handed back ${back.length} file(s) now on dev: ${back.join(", ")}`);
  if (kept.length > 0) log(`kept in ${tree}, not all on dev: ${kept.join(", ")}`);
}

/** Thrown by a landing's build when the book adds nothing to dev. */
const NOTHING_TO_LAND = new Error("no bookkeeping delta");

/**
 * Land a failed run's record on dev: carry its book (the run's tree) into a
 * throwaway origin/dev checkout, commit it as ONE
 * `chore({fid}): {workflow} FAILED bkit [skip ci]` and push it. Ship's Failure
 * Path always lands here; the other workflows land here only from a `dev` /
 * `main` / detached checkout, where a commit in the checkout would publish code.
 * `shared` (the book is such a checkout) → only the run's own record is carried
 * (`carryOwnBook`), and `carried` says what, for the hand-back.
 * Not landed → the record stays in the book, and the next run carries it.
 */
async function landFailedRecord(
  ctx: RunContext,
  o: { workflow: string; fid: string; month: string; book: string; shared: boolean },
): Promise<{
  code: number;
  pushed: boolean;
  ref: string | null;
  skipped: string | null;
  sha?: string;
  carried?: Carried;
}> {
  const root = repoRoot(ctx.cwd);
  const { book } = o;
  const kept = `${o.workflow} FAILED record kept in ${book} — the next ${o.workflow} of ${o.fid} carries it`;
  const stop = (code: number, why: string) => {
    ctx.log(`${why} — ${kept}`);
    return { code, pushed: false, ref: null, skipped: null };
  };
  // Read leniently: an unreadable row only leaves the run's start unknown.
  const statusAbs = path.join(book, statusRelPath(o.month, o.fid));
  const starts = (fs.existsSync(statusAbs) ? textLines(fs.readFileSync(statusAbs, "utf-8")) : [])
    .map((l) => parseObject(l))
    .filter((e) => e?.type === "workflow-started" && e.workflow === o.workflow)
    .map((e) => Date.parse(String(e?.at)))
    .filter((ms) => Number.isFinite(ms));
  const startMs = starts.length > 0 ? Math.max(...starts) : NaN;
  let carried: Carried | undefined;
  let res: DevPush;
  try {
    res = await pushToDev({
      root,
      dir: landDir(root, o.fid),
      build: (dir) => {
        if (o.shared)
          carried = carryOwnBook(
            book,
            dir,
            {
              month: o.month,
              fid: o.fid,
              workflow: o.workflow,
              startMs: Number.isFinite(startMs) ? startMs : undefined,
            },
            ctx.log,
          );
        else carryBook(book, dir, o.month, o.fid);
        const before = headSha(dir);
        try {
          commitBookkeeping(
            {
              root: dir,
              month: o.month,
              fid: o.fid,
              scope: "full",
              mode: "commit",
              message: `chore(${o.fid}): ${o.workflow} FAILED bkit [skip ci]`,
            },
            ctx.log,
          );
        } catch (err) {
          throw err instanceof CommandError && err.code === EXIT_EMPTY ? NOTHING_TO_LAND : err;
        }
        if (headSha(dir) === before) throw NOTHING_TO_LAND;
      },
      log: ctx.log,
    });
  } catch (err) {
    if (err === NOTHING_TO_LAND) {
      ctx.log("no bookkeeping delta to record — nothing committed, nothing pushed");
      return { code: EXIT.OK, pushed: false, ref: null, skipped: "nothing-to-commit" };
    }
    return stop(EXIT_FLUSH_FAILED, `bookkeeping commit failed: ${(err as Error).message}`);
  }
  switch (res.kind) {
    case "landed":
      return { code: EXIT.OK, pushed: true, ref: DEV, skipped: null, sha: res.sha, carried };
    case "refused":
      return stop(EXIT_PUSH_FAILED, `dev refused the push: ${res.stderr}`);
    case "push-failed":
      return stop(EXIT_PUSH_FAILED, `dev push failed without a server answer: ${res.stderr}`);
    case "exhausted":
      return stop(EXIT_PUSH_FAILED, `dev moved before each of ${res.attempts} pushes`);
    case "fetch-failed":
      return stop(EXIT_FLUSH_FAILED, `fetch of dev failed: ${res.stderr}`);
    case "setup-failed":
      return stop(EXIT_FLUSH_FAILED, `throwaway checkout failed: ${res.stderr}`);
  }
}

/**
 * What `handover --push` would sweep into the abort commit besides the run's own
 * logs: tracked files with changes, and untracked files (each one listed, not its folder).
 */
function strayPaths(tree: string, logDir: string): { modified: string[]; untracked: string[] } {
  const outside = (out: string | null) =>
    (out ?? "").split("\0").filter((p) => p !== "" && p !== logDir && !p.startsWith(`${logDir}/`));
  return {
    // Staged and unstaged changes alike, against HEAD.
    modified: outside(git(tree, ["diff", "--name-only", "-z", "--no-renames", "HEAD"])),
    untracked: outside(git(tree, ["ls-files", "-z", "--others", "--exclude-standard"])),
  };
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
  const tree =
    worktree === undefined ? (git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? base) : base;
  const branch = git(tree, ["branch", "--show-current"]) ?? "";
  // A dev / main / detached checkout is shared: only the run's own record leaves it.
  const shared = branch === "" || isSharedBranch(branch);
  if (ctx.flags.listStray === true) {
    if (push || flush || ctx.flags.post === true)
      throw new CommandError(
        EXIT.USAGE,
        "--list-stray only lists: drop --push, --flush and --post",
      );
    ctx.emit({ shared, ...strayPaths(tree, logDirRel(month, fid)) });
    return EXIT.OK;
  }
  let handed: { sha: string; carried: Carried } | undefined;
  const rec = shared && (push || flush) ? activeRecord(tree, fid) : null;
  if (push && shared) {
    const r = await landFailedRecord(ctx, { workflow, fid, month, book: tree, shared });
    if (r.sha !== undefined && r.carried !== undefined) handed = { sha: r.sha, carried: r.carried };
    code = r.code;
    pushed = r.pushed;
    ref = r.ref;
    skipped = r.skipped;
  } else if (push) {
    addAllButCopied(tree);
    const made = runGit(tree, ["commit", "-m", `docs(${fid}): ${workflow} aborted bkit [skip ci]`]);
    if (!made.ok) ctx.log(`abort commit: ${made.stderr || made.stdout}`);
    const r = await pushBranch(tree, { mode: "abort", openPr: str(ctx.flags.openPr) }, ctx.log);
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
    const r = await landFailedRecord(ctx, { workflow, fid, month, book: tree, shared });
    if (r.sha !== undefined && r.carried !== undefined) handed = { sha: r.sha, carried: r.carried };
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
  if (handed !== undefined) {
    handBack(tree, handed.sha, handed.carried, ctx.log, new Set(rec?.paths.map((p) => p.path)));
  }
  // The run is over once its record is handed back: the next run starts a fresh one.
  if (rec !== null) removeRecord(tree, fid);
  const tracker =
    ctx.flags.post === true && comment !== null
      ? await postForVerb(ctx, comment, { fid })
      : undefined;
  ctx.emit({
    handover: present ? artifact : null,
    pushed,
    ref: pushed ? ref : null,
    skipped,
    comment,
    commentFile: commentFileOf(ctx.cwd, comment),
    ...(tracker === undefined ? {} : { tracker }),
  });
  return code;
}

// ---------------------------------------------------------------------------
// close
// ---------------------------------------------------------------------------

type Ledgers = OutcomePayload["ledgers"];

/** The row's `by.workflow`, on a row already normalized. */
const byWorkflow = (r: Record<string, unknown>) =>
  (r.by as Record<string, unknown> | undefined)?.workflow;

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
  const read = (file: string) => ledgerRows(file).map((r) => normalize(r));
  const deferrals = read(path.join(tree, "docs", "deferrals.jsonl"));
  const failures = read(path.join(tree, "docs", "failures.jsonl"));
  const friction = read(path.join(tree, ".bkit", "friction.jsonl"));
  const added = (rows: Array<Record<string, unknown>>) =>
    startMs === undefined
      ? {}
      : {
          added: distinctKeys(
            rows.filter((r) => byWorkflow(r) === workflow && Number(r.ts) >= startMs),
          ),
        };
  return {
    deferrals: {
      repo: distinctKeys(deferrals.filter((r) => r.kind === "deferral")),
      ...added(deferrals),
    },
    failures: {
      repo: distinctKeys(failures.filter((r) => r.kind === "failure")),
      ...added(failures),
    },
    friction: added(friction),
  };
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

/** Append the close's stats rows; best-effort, so a refused row or a bad path is logged and never fails the close. */
function appendStats(tree: string, rows: Array<Record<string, unknown>>, log: (m: string) => void) {
  try {
    appendLedgerRows(tree, "stats", rows);
    return true;
  } catch (err) {
    // Telemetry never gates a close: report the refused append and carry on.
    log(`[bkit-telemetry] stats rows not written: ${(err as Error).message}`);
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
 * `message`, commit everything (`git add -A`, minus the `bkit.worktree.copy` entries) in the tree, or, in an in-place run
 * on a shared branch, only the run's own paths.
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

  // An in-place run on a shared branch commits its own paths only; a refusal
  // comes before any row is appended, so the re-run after the human's fix writes each row once.
  const rec = o.message === undefined ? null : activeRecord(where.tree, o.fid);
  if (o.message !== undefined) requireRecordOnShared(where.tree, workflow, rec);
  if (rec !== null) ownSet(where.tree, rec);

  const step = `${workflow}-close-workflow`;
  // The run's join key: every row of this run carries HEAD at close as `run.parentSha`.
  const parentSha = headSha(where.tree);
  // Graded first, so the report below carries this run's grade.
  const violations = gradeCompliance(where.tree, workflow, log, o.squashSha, { parentSha, step });

  if (o.recordStep === true) {
    writeStepRow(
      where.tree,
      { file: where.status, workflow, step, artifacts: [], commit: "none" },
      log,
    );
  }
  const endAt = statusTimestamp();
  const row = { type: "workflow-done" as const, workflow, at: endAt, parentSha };
  fs.appendFileSync(where.status, appendLine(row));

  const repo = resolveRepoSlug(where.root) || "unknown/repo";
  const started = lastOfType(events, "workflow-started", workflow);
  const startAt = started?.at;
  const startMs = startAt ? Date.parse(startAt) : NaN;
  const startKnown = Number.isFinite(startMs) ? startMs : undefined;
  const runRowsOf =
    startAt === undefined ? [] : runStatusRows(readStatusEvents(where.status), workflow, startAt);
  const planSource = runRowsOf
    .filter((e) => e.type === "workflow-meta" && typeof e.planSource === "string")
    .at(-1)?.planSource as string | undefined;
  const base = typeof started?.parentSha === "string" ? started.parentSha : "";
  const lines = o.squashSha
    ? runLines(where.tree, `${o.squashSha}^`, o.squashSha)
    : runLines(where.tree, base, parentSha);
  const startedRows = new Set(
    events.filter((e) => e.type === "workflow-started" && e.workflow === workflow).map((e) => e.at),
  ).size;
  const logDir = path.join(where.tree, logDirRel(where.month, o.fid));
  const by = { workflow, step };

  const counterRow = {
    kind: "counter",
    by,
    run: { parentSha },
    counter: {
      name: `${workflow.toUpperCase()}_ATTEMPT`,
      value: Math.max(1, startedRows),
      source: "shell-bus",
    },
  };
  const cov = workflow === "ship" ? coverage(where.tree) : undefined;
  const ci = ciList(runRowsOf);
  const plan = ["plan", "build", "ship"].includes(workflow)
    ? planBlock(where.tree, where.month, o.fid, logDir, planSource)
    : undefined;
  const endMs = Date.parse(endAt);
  const outcomeRow = {
    kind: "outcome",
    by,
    run: { parentSha, ...(o.prNumber === undefined ? {} : { pr: o.prNumber }) },
    time: startKnown === undefined ? null : timeBlock(startKnown, Math.max(startKnown, endMs)),
    ending: "done",
    lines,
    ...(runRowsOf.length > 0 ? { steps: stepsBlock(runRowsOf) } : {}),
    ...(ci.length > 0 ? { ci } : {}),
    ledgers: ledgerCounts(where.tree, workflow, startKnown),
    ...(plan === undefined ? {} : { plan }),
    ...(workflow === "build" ? { build: buildBlock(runRowsOf, logDir) } : {}),
    ...(cov ? { ship: { coverage: cov } } : {}),
  };
  const stats = path.join(where.tree, ".bkit", "stats.jsonl");
  const telemetryWritten = appendStats(where.tree, [counterRow, outcomeRow], log);

  const report = fs.existsSync(stats)
    ? workflowTelemetry(foldFrom([stats]), workflow).lines
    : ["[bkit-telemetry] stats.jsonl not found — no telemetry rows yet"];
  const ref =
    o.ref ??
    (["design", "plan", "ship"].includes(workflow)
      ? DEV
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
    if (rec !== null) {
      const made = ownPathCommit(where.tree, rec, message, { allowEmpty: true });
      if (!made.ok) throw new CommandError(EXIT.NO, `close commit failed: ${made.error}`);
    } else {
      const add = addAllButCopied(where.tree);
      const made = add.ok ? runGit(where.tree, ["commit", "--allow-empty", "-m", message]) : add;
      if (!made.ok)
        throw new CommandError(EXIT.NO, `close commit failed: ${made.stderr || made.stdout}`);
    }
    commit = headSha(where.tree);
  }

  return {
    row,
    // The rows as drafted; the ledger copies add the top section `ledgers append` fills.
    counterRow: telemetryWritten ? counterRow : null,
    outcomeRow: telemetryWritten ? outcomeRow : null,
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
 * Publish a close commit dev refused through its own `ship-close/{fid}` PR,
 * merged with an empty body. Returns where it landed, or why it did not.
 */
function closePr(
  ctx: RunContext,
  dir: string,
  fid: string,
  subject: string,
): { ref: string; via: string } | { failed: string } {
  const branch = `ship-close/${fid}`;
  const head = headSha(dir);
  if (!runGit(dir, ["push", "origin", `HEAD:refs/heads/${branch}`]).ok)
    return { failed: `close branch push failed` };
  const created = runGh(dir, [
    "pr",
    "create",
    "--base",
    DEV,
    "--head",
    branch,
    "--title",
    `docs(${fid}): ship DONE`,
    "--body",
    "",
  ]);
  if (!created.ok) return { failed: `gh pr create failed: ${created.stderr}` };
  const pr = probePr(dir, { head: branch, base: DEV, state: "open" });
  const number = pr.kind === "ok" ? pr.pr?.number : undefined;
  if (number === undefined) return { failed: `close PR not found for ${branch}` };
  const merged = mergePr(
    dir,
    { number: String(number), subject, matchHead: head, deleteBranch: true },
    ctx.log,
  );
  if (!merged.out.merged) ctx.log(`close PR #${number} opened but not merged — merge it by hand`);
  return { ref: branch, via: merged.out.merged ? "close-pr" : "close-pr-open" };
}

/**
 * Ship's close, in the run's tree (the feature worktree, or the adopted
 * checkout): the close rows there, then ONE `docs({fid}): ship DONE bkit [skip ci]`
 * commit built in a throwaway origin/dev checkout carrying the run's book and
 * landed on dev — a refused push publishes it through a `ship-close/{fid}` PR.
 * Only a close that landed (or opened its PR) releases the workflow lock; once
 * the close is on dev, the feature worktree and `branch` are removed. A close
 * that did not land keeps the lock for the Failure Path.
 */
async function shipClose(
  ctx: RunContext,
  o: CloseInput & { branch?: string },
  token: string | undefined,
) {
  const root = repoRoot(ctx.cwd);
  if (o.outbox === undefined) throw new CommandError(EXIT.USAGE, "--flush needs --outbox");
  const month = resolveMonth(root, o.fid, o.month);
  const book = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? root;
  const subject = `docs(${o.fid}): ship DONE bkit [skip ci]`;
  const kept = `close bookkeeping kept in ${book}`;
  const out = closeWorkflow(book, { ...o, recordStep: true, message: undefined }, ctx.log);

  let viaPr: { ref: string; via: string } | { failed: string } | null = null;
  let res: DevPush;
  try {
    res = await pushToDev({
      root,
      dir: landDir(root, o.fid),
      build: (dir) => {
        carryBook(book, dir, month, o.fid);
        commitBookkeeping(
          {
            root: dir,
            month,
            fid: o.fid,
            scope: "full",
            mode: "commit-allow-empty",
            message: subject,
          },
          ctx.log,
        );
      },
      refused: async (dir, stderr) => {
        ctx.log(`dev refused the close push — publishing it through a PR: ${stderr}`);
        viaPr = closePr(ctx, dir, o.fid, subject);
      },
      log: ctx.log,
    });
  } catch (err) {
    ctx.log(`close commit failed: ${(err as Error).message} — ${kept}`);
    return { code: EXIT_FLUSH_FAILED, out: null };
  }

  // A close that did not land keeps the lock: the Failure Path releases it.
  let landed: { ref: string; via: string } | null = null;
  switch (res.kind) {
    case "landed":
      landed = { ref: DEV, via: "head-push" };
      break;
    case "refused": {
      const pr = viaPr as { ref: string; via: string } | { failed: string } | null;
      if (pr === null || "failed" in pr) {
        ctx.log(`${pr === null ? "close PR not attempted" : pr.failed} — ${kept}`);
        return { code: EXIT_FLUSH_FAILED, out: null };
      }
      landed = pr;
      break;
    }
    case "push-failed":
      ctx.log(`dev push failed without a server answer: ${res.stderr} — ${kept}`);
      return { code: EXIT_PUSH_FAILED, out };
    case "exhausted":
      ctx.log(`dev moved before each of ${res.attempts} pushes — ${kept}`);
      return { code: EXIT_PUSH_FAILED, out };
    case "fetch-failed":
      ctx.log(`fetch of dev failed: ${res.stderr} — ${kept}`);
      return { code: EXIT_FLUSH_FAILED, out: null };
    case "setup-failed":
      ctx.log(`throwaway checkout failed: ${res.stderr} — ${kept}`);
      return { code: EXIT_FLUSH_FAILED, out: null };
  }

  const released = releaseLock(workflowLockPath(root, month, o.fid), {
    workflow: "ship",
    fid: o.fid,
    token,
  });
  if (released.removeFailed) {
    ctx.log("Lock removal failed");
    return { code: EXIT_FLUSH_FAILED, out: null };
  }

  // The book is on dev only once the close landed or its PR merged.
  let worktree: RemoveResult | null = null;
  if (landed.via === "close-pr-open") {
    ctx.log(`close PR not merged — ${kept} until it is`);
  } else {
    if (landed.via === "close-pr" && !runGit(root, ["fetch", "origin", DEV]).ok)
      ctx.log(
        `fetch of dev after the close PR failed — origin/${DEV} is stale until the next fetch`,
      );
    try {
      worktree = removeWorktree(root, o.fid, o.branch, ctx.log);
    } catch (err) {
      ctx.log(`${(err as Error).message} — remove ${book} by hand`);
    }
  }
  return { code: EXIT.OK, out: { ...out, landed, worktree } };
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

/** Stamp `file`'s anchor when a base commit is known (plan: with its design's own anchor; both: the bkit release). */
function stamp(cwd: string, file: string, baseSha: string, design?: string): void {
  if (baseSha === "") return;
  const abs = path.resolve(cwd, file);
  const designAbs = design === undefined ? undefined : path.resolve(cwd, design);
  const d =
    design !== undefined && designAbs !== undefined && fs.existsSync(designAbs)
      ? { path: design, baseSha: readAnchor(fs.readFileSync(designAbs, "utf-8")).baseSha ?? "" }
      : undefined;
  const tmp = `${abs}.bkit-anchor.tmp`;
  const text = fs.readFileSync(abs, "utf-8");
  fs.writeFileSync(tmp, stampAnchor(text, baseSha, d, undefined, anchorBkitStatus(cwd)));
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
  {
    ...POST_FLAG,
    help: "post the close comment (needs --number) to the FID's issue unless one of its latest comments carries the same marker hash; prints `tracker`",
  },
];

const SESSION_DIR_FLAG: FlagSpec = {
  name: "session-dir",
  type: "string",
  help: "the run's session folder (`repo info` sessionDir): deleted once this run ends",
};
const SESSION_REMOVED_OUTPUT =
  "with --session-dir: the folder was deleted (false: not under <git common dir>/bkit-outbox/sessions/, kept)";

/**
 * `--session-dir`: delete the run's session folder. Only a folder directly under
 * `<git common dir>/bkit-outbox/sessions/` is deleted; any other path is kept and logged.
 */
function sessionRemoval(ctx: RunContext): { sessionRemoved?: boolean } {
  const given = str(ctx.flags.sessionDir);
  if (!given) return {};
  const common = git(ctx.cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
  const real = (p: string) => (fs.existsSync(p) ? fs.realpathSync(p) : p);
  const sessions = common === null ? null : real(path.join(common, "bkit-outbox", "sessions"));
  const abs = path.resolve(ctx.cwd, given);
  if (sessions === null || real(path.dirname(abs)) !== sessions) {
    ctx.log(
      `--session-dir ${given} is not a session folder under ${sessions ?? "the outbox"}; kept`,
    );
    return { sessionRemoved: false };
  }
  fs.rmSync(abs, { recursive: true, force: true });
  return { sessionRemoved: true };
}

const PLAIN_ENGLISH_REPLY =
  "Would you like me to explain any of this in plain English? Then write 'yes, explain in plain english'.";

/**
 * `--final-return`: the run's last message, read up front (the close may remove the tree
 * holding the summary, and `--session-dir` the issue facts). Tips are added at print time.
 */
function finalReturnParts(ctx: RunContext, fid: string): string[] | null {
  if (ctx.flags.finalReturn !== true) return null;
  const summaryFile = str(ctx.flags.summaryFile);
  const summary = str(ctx.flags.summary);
  if (summaryFile !== undefined && summary !== undefined)
    throw new CommandError(EXIT.USAGE, "give --summary-file or --summary, not both");
  if (!summaryFile && !summary)
    throw new CommandError(EXIT.USAGE, "--final-return needs --summary-file or --summary");
  const parts: string[] = [];
  const warning = str(ctx.flags.warning);
  if (warning) parts.push(warning);
  parts.push(
    summary ? summaryOrMissing(ctx, summary) : inputText(ctx.cwd, summaryFile!, "summary-file"),
  );
  parts.push(...list(ctx.flags.line));
  const session = str(ctx.flags.sessionDir);
  const factsFile = session ? path.resolve(ctx.cwd, session, "issue-facts.json") : "";
  if (factsFile && fs.existsSync(factsFile)) {
    const parsed = parseJson(fs.readFileSync(factsFile, "utf-8"));
    const facts = (parsed.ok ? parsed.value : {}) as { title?: unknown; url?: unknown };
    const t = trackerTarget(ctx.cwd, { fid });
    const title = typeof facts.title === "string" ? facts.title : "";
    const label = [issueRef(t.issue, t.tracker), title].filter(Boolean).join(" ");
    if (typeof facts.url === "string" && facts.url) parts.push(`[${label}](${facts.url})`);
  }
  parts.push("## Suggested Replies", ...list(ctx.flags.suggest), PLAIN_ENGLISH_REPLY);
  return parts;
}

/**
 * `--summary`: the summary file's text, or the `--summary-missing` line when the
 * file is absent; with `--outbox`, the text is also kept there under the file's
 * name, outside the tree the close may remove.
 */
function summaryOrMissing(ctx: RunContext, rel: string): string {
  const missing = str(ctx.flags.summaryMissing);
  if (!missing) throw new CommandError(EXIT.USAGE, "--summary needs --summary-missing");
  const abs = path.resolve(ctx.cwd, rel);
  const text = fs.existsSync(abs) ? fs.readFileSync(abs, "utf-8").replace(/\s+$/, "") : missing;
  const outbox = str(ctx.flags.outbox);
  if (outbox) {
    const dir = path.resolve(ctx.cwd, outbox);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, path.basename(abs)), `${text}\n`);
  }
  return text;
}

function finalReturnText(
  ctx: RunContext,
  workflow: string,
  parts: string[] | null,
): {
  finalReturn?: string;
} {
  if (parts === null) return {};
  const tips = tipsText(false, workflow as TipsContext, ctx.cwd);
  return { finalReturn: [...parts, ...(tips ? ["## bkit Tips", tips] : [])].join("\n\n") };
}

// ---------------------------------------------------------------------------
// input
// ---------------------------------------------------------------------------

/** A required input file's text, trailing newlines dropped; missing exits EXIT_NO_INPUT. */
function inputText(cwd: string, rel: string, flag: string): string {
  const abs = path.resolve(cwd, rel);
  if (!fs.existsSync(abs)) throw new CommandError(EXIT_NO_INPUT, `--${flag} ${rel} does not exist`);
  return fs.readFileSync(abs, "utf-8").replace(/\s+$/, "");
}

/** The run's issue text from `issues fetch`'s files, or "" for a run with no issue. */
function inputIssueText(ctx: RunContext): string {
  const descFile = str(ctx.flags.descriptionFile);
  const commentsFile = str(ctx.flags.commentsFile);
  const description = descFile ? inputText(ctx.cwd, descFile, "description-file") : "";
  let comments: IssueComment[] = [];
  if (commentsFile) {
    const parsed = parseJson(inputText(ctx.cwd, commentsFile, "comments-file"));
    const list = parsed.ok ? parseComments(parsed.value) : null;
    if (list === null)
      throw new CommandError(
        EXIT_NO_INPUT,
        `--comments-file ${commentsFile} is not a list of comments`,
      );
    comments = sortOldestFirst(list).comments;
  }
  return issueText(description, comments).text;
}

function inputVerb(ctx: RunContext): number {
  const workflow = workflowName(String(ctx.flags.workflow));
  const fid = String(ctx.flags.fid);
  const run = positiveInt(ctx.flags.run, "run")!;
  const file = str(ctx.flags.file);
  const status = file
    ? path.resolve(ctx.cwd, file)
    : statusLocation({
        cwd: ctx.cwd,
        workflow,
        fid,
        month: resolveMonth(repoRoot(ctx.cwd), fid, str(ctx.flags.month) || undefined),
      }).path;
  const sections: Array<[string, string]> = [
    ["Session Prompt", inputText(ctx.cwd, String(ctx.flags.promptFile), "prompt-file")],
  ];
  const issue = inputIssueText(ctx);
  if (issue !== "") sections.push(["Issue", issue]);
  const plan = str(ctx.flags.plan);
  if (plan && fs.existsSync(path.resolve(ctx.cwd, plan)))
    sections.push([`Plan — ${plan}`, inputText(ctx.cwd, plan, "plan")]);
  const design = str(ctx.flags.design);
  if (design) sections.push([`Design — ${design}`, inputText(ctx.cwd, design, "design")]);
  for (const audit of list(ctx.flags.audit))
    sections.push([`Audit Report — ${audit}`, inputText(ctx.cwd, audit, "audit")]);
  const body = sections.map(([h, text]) => `## ${h}\n\n${text}\n`).join("\n");
  const abs = path.join(path.dirname(status), `${workflow}-input-${run}.md`);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, body);
  ctx.emit({ path: path.relative(ctx.cwd, abs), bytes: Buffer.byteLength(body) });
  return EXIT.OK;
}

/**
 * Close / links output gains `commentFile`; with `--post`, the close comment once,
 * deduped by marker hash against the issue's latest comments (the close commit is
 * already made, so no engine-action row can land in it).
 */
async function postClose(
  ctx: RunContext,
  fid: string,
  out: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const comment = typeof out.comment === "string" ? out.comment : null;
  const withFile = { ...out, commentFile: commentFileOf(ctx.cwd, comment) };
  if (ctx.flags.post !== true) return withFile;
  if (comment === null) throw new CommandError(EXIT.USAGE, "--post needs --number");
  return { ...withFile, tracker: await postForVerb(ctx, comment, { fid }) };
}

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
        STATUS_FILE_FLAG,
        {
          name: "lock-held",
          type: "boolean",
          help: "Step 1 already took the lock: check it is ours instead of acquiring",
        },
        TOKEN_FLAG,
        {
          name: "branch",
          type: "string",
          help: "the branch the checkout must be on; refuse (15) before anything is written when it is not",
        },
      ],
      output: {
        lock: "{path, month, token, reclaimed} of the lock taken, or {path} with --lock-held",
        file: "absolute path to status.jsonl",
        resumed: "the latest run was this workflow, IN_PROGRESS: no new row",
        row: "the appended workflow-started row, or null when resuming",
        run: "which run of the workflow this is (1-based)",
        lastDoneStep: "the current run's last DONE step: resume after it (null on a new run)",
        openDecision:
          "{file, decision, question, from, pauseStep, subPlan, verifyAttempt, testAttempt, plan} of the current run's highest {workflow}-decision-{run}-{N}.md holding Status: OPEN, else null",
      },
      textOmit: ["row"],
      exitCodes: {
        [EXIT_NO_STATUS]: "status.jsonl is not valid",
        [EXIT_SPLIT_BUCKET]: "the feature has logs in more than one month bucket",
        [EXIT_LOCK_NOT_HELD]: "--lock-held: the lock is missing or belongs to another owner",
        [EXIT_WRONG_BRANCH]: "--branch: the checkout is on another branch",
      },
      run: (ctx) => {
        const workflow = workflowName(String(ctx.flags.workflow));
        const fid = String(ctx.flags.fid);
        const token = str(ctx.flags.token);
        if (token !== undefined && ctx.flags.lockHeld !== true)
          throw new CommandError(EXIT.USAGE, "--token applies with --lock-held only");
        const branch = str(ctx.flags.branch);
        if (branch !== undefined) {
          const on = git(ctx.cwd, ["branch", "--show-current"]) ?? "";
          if (on !== branch) {
            ctx.log(`[bkit-${workflow}] not on ${branch} in ${ctx.cwd} (on '${on}')`);
            return EXIT_WRONG_BRANCH;
          }
        }
        const where = whereInTree(ctx.cwd, {
          workflow,
          fid,
          month: str(ctx.flags.month),
          file: str(ctx.flags.file),
        });

        let lock: Record<string, unknown>;
        if (ctx.flags.lockHeld === true) {
          const file = workflowLockPath(where.root, where.month, fid);
          checkHeldLock(file, { workflow, fid, token });
          lock = { path: file };
        } else {
          lock = {
            ...acquireWorkflowLock({
              cwd: ctx.cwd,
              workflow,
              fid,
              month: where.month,
              log: ctx.log,
            }),
          };
        }

        const file = where.status;
        fs.mkdirSync(path.dirname(file), { recursive: true });
        if (!fs.existsSync(file)) fs.writeFileSync(file, "");
        // A ship decides its handover afresh: a sentinel an earlier run left is stale.
        if (workflow === "ship") {
          for (const name of SENTINELS) {
            const p = path.join(path.dirname(file), name);
            if (!fs.existsSync(p)) continue;
            fs.rmSync(p, { force: true });
            ctx.log(`cleared stale ${name}`);
          }
        }

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
        const runs = fold(readStatusEvents(file));
        const run = runNumber(runs, workflow);
        const current = resumed ? lastRun(runs, workflow) : undefined;
        ctx.emit({
          lock,
          file,
          resumed,
          row,
          run,
          lastDoneStep: current?.steps.filter((s) => s.status === "DONE").at(-1)?.step ?? null,
          openDecision: resumed
            ? openDecision(path.dirname(file), where.tree, workflow, run)
            : null,
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
        {
          ...POST_FLAG,
          help: "post the failure comment (needs --step-number) to the --fid / --issue issue and write its failed labels; prints `tracker` and `labelsWrite`",
        },
        {
          name: "issue",
          type: "string",
          help: "with --post: the issue id when there is no --fid yet",
        },
        SESSION_DIR_FLAG,
      ],
      output: {
        row: "the appended workflow-failed row, or null (no --token, or no status.jsonl)",
        rebaseAborted: "an in-progress rebase was found and aborted",
        lock: "{path, existed, released, heldBy}: heldBy is another owner's lock line, left in place; null without --token",
        sentinels: "[{name, path}] sentinels that existed before this call removed them",
        handoverNeeded:
          "--max-exceeded, a sentinel existed, or a debug run in SOAK mode: write the abort handover",
        add: "labels in the set that the issue does not carry yet",
        labels:
          "the label set to write: the current labels plus bkit:failed (and bkit:merged for a merged ship PR)",
        trackerState: "the Linear or Jira state for the failed issue (null under github, none)",
        prState: "the --pr PR's state, or null",
        comment: "the failure comment body (with --step-number), else null",
        commentFile: COMMENT_FILE_OUTPUT,
        tracker: TRACKER_OUTPUT,
        labelsWrite:
          "with --post: the label and state write, read fresh from the issue: {done: true, action: labels} | {done: false, action, reason} (write `labels` / `trackerState` via the tracker MCP) | {skipped}",
        sessionRemoved: SESSION_REMOVED_OUTPUT,
      },
      textOmit: ["row"],
      exitCodes: {
        [EXIT_SPLIT_BUCKET]: "no --month and the feature has logs in more than one month bucket",
        [EXIT_REMOVE_FAILED]:
          "the lock file is still there after removing it (everything else was done; the comment says so)",
      },
      run: failVerb,
    },
    handover: {
      summary:
        "Keep a failed run's record: commit and push it on the feature branch, or land its logs and ledgers on dev (--push from dev / main, ship's --flush); print the handover comment.",
      flags: [
        WORKFLOW_FLAG,
        FID_FLAG,
        MONTH_FLAG,
        {
          name: "push",
          type: "boolean",
          help: "feature branch: git add -A (minus bkit.worktree.copy entries), commit `docs({fid}): {workflow} aborted bkit [skip ci]`, push --mode=abort; dev / main / detached: lands like --flush, the checkout untouched",
        },
        {
          name: "flush",
          type: "boolean",
          help: "ship: carry the run's logs and ledgers into a throwaway origin/dev checkout, ONE `chore({fid}): {workflow} FAILED bkit [skip ci]` commit, landed on dev",
        },
        {
          name: "open-pr",
          type: "string",
          help: "--push: the open-PR answer from MCP (a number, or none) instead of asking gh",
        },
        { name: "ref", type: "string", help: "link the handover at this ref (no push / flush)" },
        {
          name: "list-stray",
          type: "boolean",
          help: "only list what --push would sweep in besides the run's logs (modified, untracked) and whether the checkout is shared; writes nothing",
        },
        {
          name: "worktree",
          type: "string",
          help: "the run's tree: holds the handover and the logs, and is where --push commits (default: cwd's checkout)",
        },
        OWNER_REPO_FLAG,
        { ...POST_FLAG, help: "post the handover comment to the FID's issue; prints `tracker`" },
      ],
      output: {
        handover: "the handover artifact, or null when absent",
        pushed: "the push (or flush push) ran and succeeded",
        ref: "where the handover now lives, or null when nothing was pushed",
        skipped: "why nothing was pushed: open-pr | skip-ci | nothing-to-commit (null otherwise)",
        comment:
          "the handover comment body (null when there is no handover); links only when pushed",
        commentFile: COMMENT_FILE_OUTPUT,
        tracker: `${TRACKER_OUTPUT}; absent when there is no handover`,
        shared: "--list-stray: the checkout is dev / main / detached (remove nothing)",
        modified: "--list-stray: tracked paths with changes, outside the run's logs",
        untracked: "--list-stray: untracked paths, outside the run's logs",
      },
      exitCodes: {
        [EXIT_SPLIT_BUCKET]: "no --month and the feature has logs in more than one month bucket",
        [EXIT_OPEN_PR_KEPT]:
          "--push: the branch has an open PR, nothing pushed (the comment has no link)",
        [EXIT_PUSH_FAILED]:
          "the push failed, or dev refused / kept moving under the FAILED landing (the comment has no link)",
        [EXIT_FLUSH_FAILED]:
          "the dev fetch, the throwaway checkout or the FAILED commit failed; the record stays in the run's tree",
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
          help: "then git add -A (minus bkit.worktree.copy entries) and commit with this message in the tree",
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
          help: "ship: commit `ship DONE` in a throwaway origin/dev checkout carrying the run's book, land it on dev (refused: a ship-close PR), release the lock (--token), remove the worktree",
        },
        { ...TOKEN_FLAG, help: "--flush: the workflow lock token to release" },
        {
          name: "branch",
          type: "string",
          help: "--flush: the shipped branch, deleted locally and on origin with the worktree once the close is on dev",
        },
        SESSION_DIR_FLAG,
        {
          name: "final-return",
          type: "boolean",
          help: "print finalReturn: the run's last message to the person (needs --summary-file)",
        },
        {
          name: "summary-file",
          type: "string",
          help: "--final-return: the summary shown verbatim (read before the close runs)",
        },
        {
          name: "summary",
          type: "string",
          help: "--final-return: like --summary-file, but a missing file shows --summary-missing; a copy is kept in --outbox",
        },
        {
          name: "summary-missing",
          type: "string",
          help: "--summary: the line shown when the summary file does not exist",
        },
        { name: "warning", type: "string", help: "--final-return: line 1, before the summary" },
        {
          name: "line",
          type: "string",
          repeatable: true,
          help: "--final-return: a line after the summary, before the issue link",
        },
        {
          name: "suggest",
          type: "string",
          repeatable: true,
          help: "--final-return: a suggested reply, before the plain-English offer",
        },
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
        commentFile: COMMENT_FILE_OUTPUT,
        tracker: TRACKER_OUTPUT,
        roadmapFoldNeeded:
          "always true: append the feature row and re-render the board (not run here)",
        featureStatus: "roadmap status this close moves the feature to",
        landed: "--flush: {ref, via: head-push | close-pr | close-pr-open}",
        worktree:
          "--flush: the `bkit worktrees remove` result once the close is on dev; null while the close PR is unmerged or the removal failed",
        sessionRemoved: SESSION_REMOVED_OUTPUT,
        finalReturn:
          "--final-return: the warning, the summary verbatim, the issue link from {session-dir}/issue-facts.json, `## Suggested Replies` (each --suggest, then the plain-English offer) and `## bkit Tips` (what `bkit tips --workflow` prints, when anything)",
      },
      textOmit: ["row", "counterRow", "outcomeRow"],
      exitCodes: {
        [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON (nothing written)",
        [EXIT_NO_INPUT]: "--final-return: --summary-file does not exist (nothing written)",
        [EXIT_SPLIT_BUCKET]: "no --month and the feature has logs in more than one month bucket",
        [EXIT_PUSH_FAILED]:
          "--flush: dev moved before every push, or the push failed without a server answer; the lock is kept. Without --flush, --message in an in-place run: a path that was dirty before the run changed during it (EXIT_FOREIGN_PATH) — no row written, nothing committed",
        [EXIT_FLUSH_FAILED]:
          "--flush: the dev fetch, the throwaway checkout or the close commit failed, the close PR could not be opened (the lock is kept), or the lock could not be removed",
        [EXIT_NO_RECORD]:
          "--message in a debug run on dev/main with no shared-checkout record: no row written, nothing committed",
      },
      run: async (ctx) => {
        const f = ctx.flags;
        const input: CloseInput = {
          workflow: String(f.workflow),
          fid: String(f.fid),
          month: str(f.month),
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
        const finalParts = finalReturnParts(ctx, input.fid);
        if (f.flush === true) {
          if (input.workflow !== "ship") throw new CommandError(EXIT.USAGE, "--flush is ship only");
          const r = await shipClose(ctx, { ...input, branch: str(f.branch) }, str(f.token));
          if (r.out) {
            const out = r.out as Record<string, unknown>;
            const posted =
              typeof out.comment === "string"
                ? await postClose(ctx, input.fid, out)
                : { ...out, commentFile: null };
            const final = finalReturnText(ctx, input.workflow, finalParts);
            ctx.emit({ ...posted, ...final, ...sessionRemoval(ctx) });
          }
          return r.code;
        }
        const out = await postClose(ctx, input.fid, { ...closeWorkflow(ctx.cwd, input, ctx.log) });
        const final = finalReturnText(ctx, input.workflow, finalParts);
        ctx.emit({ ...out, ...final, ...sessionRemoval(ctx) });
        return EXIT.OK;
      },
    },
    input: {
      summary:
        "Write logs/{FID}/{workflow}-input-{run}.md: the session prompt, the issue text, then the plan, design and audit reports.",
      flags: [
        WORKFLOW_FLAG,
        FID_FLAG,
        MONTH_FLAG,
        {
          ...STATUS_FILE_FLAG,
          help: "status.jsonl: the input file goes beside it (default: derived)",
        },
        { name: "run", type: "string", required: true, help: "the run number ({RUN})" },
        {
          name: "prompt-file",
          type: "string",
          required: true,
          help: "the session prompt ({SESSION_DIR}/prompt.md)",
        },
        {
          name: "description-file",
          type: "string",
          help: "issue-description.md from `issues fetch` (omit for a run with no issue)",
        },
        {
          name: "comments-file",
          type: "string",
          help: "issue-comments.json from `issues fetch`: bkit:generated comments dropped, the ignore-earlier cut applied",
        },
        { name: "plan", type: "string", help: "appended under `## Plan — <path>` when it exists" },
        { name: "design", type: "string", help: "plan: the parent design, appended (must exist)" },
        {
          name: "audit",
          type: "string",
          repeatable: true,
          help: "plan: an audit report, appended in flag order (must exist)",
        },
      ],
      output: {
        path: "the input file written, relative to cwd",
        bytes: "its size in bytes",
      },
      exitCodes: {
        [EXIT_SPLIT_BUCKET]: "no --month and the feature has logs in more than one month bucket",
        [EXIT_NO_INPUT]:
          "the prompt, description, comments, design or an audit file is missing, or the comments are not a list",
      },
      run: inputVerb,
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
        commentFile: COMMENT_FILE_OUTPUT,
        tracker: TRACKER_OUTPUT,
      },
      exitCodes: {
        [EXIT_SPLIT_BUCKET]: "no --month and the feature has logs in more than one month bucket",
      },
      run: async (ctx) => {
        const workflow = workflowName(String(ctx.flags.workflow));
        const fid = String(ctx.flags.fid);
        const root = repoRoot(ctx.cwd);
        const month = resolveMonth(root, fid, str(ctx.flags.month));
        const artifacts = artifactLinks(
          root,
          str(ctx.flags.ref) ?? DEV,
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
        ctx.emit(
          await postClose(ctx, fid, { artifacts, artifactLinks: linkLines(artifacts), comment }),
        );
        return EXIT.OK;
      },
    },
  },
};
