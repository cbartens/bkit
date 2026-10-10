// bkit runs wait|dispatch|gate|mirror|declared — CI runs on GitHub Actions.
//
// Three questions, answered against `gh`, never against prose:
//   wait      has a CI run appeared (or finished) yet? Bounded poll; a runtime
//             that cannot wait hands the poll back to the agent's turn loop.
//   dispatch  after build / debug's last push, did CI start on the pushed head?
//             The CI-Dispatch Gate: poll, one clean re-trigger, a named verdict.
//   gate      may ship merge? The capstone job must be present and green at the
//             head — one exit code per refusal reason, never collapsed.
// `mirror` is `gate` in a loop, for a release PR that copies the dev push run's
// verdict; `declared` says whether the repo has a CI workflow file at all.
//
// The CI workflow file and the capstone job come from `package.json` `bkit`
// (`shared/config.ts`). The "did CI dispatch" probe matches the capstone's lane
// namespace (`bkit-tests-check` -> any check containing `bkit-tests`), not one lane
// name and not "any check".

import * as fs from "node:fs";
import * as path from "node:path";

import { statusTimestamp } from "../../ledgers/status.js";
import {
  bodySkipToken,
  commitMessage,
  CommandError,
  EXIT,
  git,
  parseJson,
  runGh,
  runGit,
  SKIP_CI_TOKEN,
  type CommandSpec,
  type FlagSpec,
  type FlagValue,
  type GhResult,
  type RunContext,
} from "../lib.js";
import { readBkitConfig } from "../../shared/settings.js";
import { TIMEOUTS } from "../../shared/timeouts.js";
import { checkOnlyBookkeeping } from "./ledgers.js";
import { str } from "./status.js";

// ---------------------------------------------------------------------------
// gh
// ---------------------------------------------------------------------------

export type Gh = (args: string[]) => GhResult;

const GH_MISSING = "gh is not on PATH — use the mapped GitHub MCP tool instead";

/** Not JSON reads as undefined: every caller treats that as an API error, distinct from an empty answer. */
function jsonOrUndefined(raw: string): unknown {
  const parsed = parseJson(raw);
  return parsed.ok ? parsed.value : undefined;
}

const obj = (v: unknown): Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const text = (v: unknown): string => (typeof v === "string" ? v : "");

/** Keeps `/` readable (GitHub accepts it raw in a query value) and escapes the rest. */
const queryValue = (v: string) => encodeURIComponent(v).replace(/%2F/gi, "/");

// ---------------------------------------------------------------------------
// Config and repo facts
// ---------------------------------------------------------------------------

/** The checkout to read `package.json` and `.github/workflows/` from: the worktree top, or cwd outside git. */
const checkoutRoot = (cwd: string) => git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd;

/** The lane namespace the dispatch probe matches: the capstone minus its last `-segment`. */
export function checkNamespace(capstoneJob: string): string {
  const i = capstoneJob.lastIndexOf("-");
  return i > 0 ? capstoneJob.slice(0, i) : capstoneJob;
}

/** Whether `.github/workflows/<bkit.ciWorkflow>` exists — the only honest ground for a `no-ci` pass. */
export function ciDeclared(root: string): { declared: boolean; ciWorkflow: string; path: string } {
  const { ciWorkflow } = readBkitConfig(root);
  const rel = path.join(".github", "workflows", ciWorkflow);
  return { declared: fs.existsSync(path.join(root, rel)), ciWorkflow, path: rel };
}

/** Skip-token scan of a landed commit's body (see `bodySkipToken`). */
export function scanBody(cwd: string, sha: string): "clean" | "skip-token-found" | "error" {
  const token = bodySkipToken(cwd, sha);
  return token === undefined ? "error" : token ? "skip-token-found" : "clean";
}

// ---------------------------------------------------------------------------
// Polling
// ---------------------------------------------------------------------------

export type WaitKind = "pr-present" | "pr-completed" | "run-present" | "run-completed";

export interface WaitTarget {
  kind: WaitKind;
  pr?: string;
  head?: string;
  branch?: string;
  ciWorkflow: string;
  namespace: string;
}

export interface PollOutcome {
  state: "found" | "none" | "err" | "missing";
  conclusion?: string | null;
  checks?: number;
}

/** One poll of `target`. PR targets read the PR's check rollup; run targets read the CI workflow's runs at a head. */
export function pollOnce(target: WaitTarget, gh: Gh): PollOutcome {
  if (target.kind === "pr-present" || target.kind === "pr-completed") {
    const res = gh(["pr", "view", String(target.pr), "--json", "statusCheckRollup"]);
    if (res.missing) return { state: "missing" };
    const data = res.ok ? jsonOrUndefined(res.stdout) : undefined;
    if (data === undefined) return { state: "err" };
    const checks = arr(obj(data).statusCheckRollup).map(obj);
    if (target.kind === "pr-present") {
      const ns = target.namespace.toLowerCase();
      const hits = checks.filter((c) =>
        text(c.name || c.context)
          .toLowerCase()
          .includes(ns),
      );
      return { state: hits.length > 0 ? "found" : "none", checks: checks.length };
    }
    // A check is open while its run has not completed, or its commit status is pending.
    const open = checks.filter(
      (c) => (text(c.status) || "COMPLETED") !== "COMPLETED" || text(c.state) === "PENDING",
    );
    return { state: open.length === 0 ? "found" : "none", checks: checks.length };
  }
  const res = gh([
    "run",
    "list",
    "--branch",
    String(target.branch),
    "--workflow",
    target.ciWorkflow,
    "--limit",
    "20",
    "--json",
    "status,conclusion,headSha",
  ]);
  if (res.missing) return { state: "missing" };
  const data = res.ok ? jsonOrUndefined(res.stdout) : undefined;
  if (!Array.isArray(data)) return { state: "err" };
  // Head-anchored: without it a completed run from a superseded head would pass.
  const atHead = data.map(obj).filter((r) => r.headSha === target.head);
  if (target.kind === "run-present") return { state: atHead.length > 0 ? "found" : "none" };
  const latest = atHead[0];
  return latest && latest.status === "completed"
    ? { state: "found", conclusion: text(latest.conclusion) || null }
    : { state: "none" };
}

export interface WaitResult {
  result: "found" | "none" | "err";
  attempts: number;
  elapsedS: number;
  allErrored: boolean;
  /** A sleep overran its window: this runtime cannot wait in a command — hand the poll to the agent. */
  blocked: boolean;
  ghMissing: boolean;
  conclusion: string | null;
  checks: number | null;
}

export type Sleep = (ms: number) => Promise<number>;

/** Sleeps `ms` and returns how long it really took. */
export const realSleep: Sleep = (ms) =>
  new Promise((resolve) => {
    const t0 = Date.now();
    setTimeout(() => resolve(Date.now() - t0), ms);
  });

/** Slack before a sleep counts as blocked (the shell wrapped each sleep in `timeout interval+5`). */
const SLEEP_SLACK_MS = 5000;

/**
 * Poll until found or the budget is spent: `ceil(budget / interval)` attempts,
 * no sleep after the last one. `once` polls a single time, for an agent turn loop.
 */
export async function waitLoop(
  opts: { budgetS: number; intervalS: number; once: boolean },
  poll: () => PollOutcome,
  sleep: Sleep,
  log: (m: string) => void,
): Promise<WaitResult> {
  const out: WaitResult = {
    result: "none",
    attempts: 0,
    elapsedS: 0,
    allErrored: true,
    blocked: false,
    ghMissing: false,
    conclusion: null,
    checks: null,
  };
  const max = opts.once ? 1 : Math.max(1, Math.ceil(opts.budgetS / opts.intervalS));
  while (out.attempts < max) {
    out.attempts++;
    const p = poll();
    if (p.state === "missing") {
      out.ghMissing = true;
      out.result = "err";
      return out;
    }
    if (p.state !== "err") out.allErrored = false;
    if (p.checks !== undefined) out.checks = p.checks;
    log(`attempt ${out.attempts}: ${p.state} (elapsed ${out.elapsedS}s)`);
    if (p.state === "found") {
      out.result = "found";
      out.conclusion = p.conclusion ?? null;
      return out;
    }
    if (out.attempts >= max) break;
    const slept = await sleep(opts.intervalS * 1000);
    if (slept > opts.intervalS * 1000 + SLEEP_SLACK_MS) {
      log(
        `sleep did not return within ${opts.intervalS + 5}s — this runtime cannot wait here; resolve the poll in the agent turn loop`,
      );
      out.blocked = true;
      out.result = "err";
      return out;
    }
    out.elapsedS += opts.intervalS;
  }
  out.result = out.allErrored ? "err" : "none";
  return out;
}

/** The open PR from the current branch into dev, or null. */
function currentPr(cwd: string, gh: Gh): { pr: string | null; missing: boolean } {
  const branch = git(cwd, ["branch", "--show-current"]);
  if (!branch) return { pr: null, missing: false };
  const res = gh(["pr", "list", "--head", branch, "--base", "dev", "--json", "number"]);
  if (res.missing) return { pr: null, missing: true };
  const n = obj(arr(res.ok ? jsonOrUndefined(res.stdout) : undefined)[0]).number;
  return { pr: typeof n === "number" ? String(n) : null, missing: false };
}

// ---------------------------------------------------------------------------
// CI-Dispatch Gate
// ---------------------------------------------------------------------------

export type DispatchOutcome = "dispatched" | "self-healed" | "no-ci" | "unresolved";
export type DispatchReason =
  "timeout-dirty" | "retrigger-suppressed" | "gh-error" | "ci-declared-no-run";

/** The `ciDispatch` field of the step-done row. `reason` only on `unresolved`. */
export interface CiDispatch {
  outcome: DispatchOutcome;
  head: string;
  attempts: number;
  retrigger: boolean;
  reason?: DispatchReason;
}

export interface SuppliedPoll {
  pollResult: "found" | "none" | "err";
  attempts: number;
  allErrored: boolean;
}

export interface DispatchOptions {
  cwd: string;
  pr: string | null;
  fid: string;
  autoRouteSuffix: string;
  budgetS: number;
  intervalS: number;
  /** The poll result an agent turn loop resolved after a hand-off. */
  supplied?: SuppliedPoll;
  /** The re-trigger commit is already pushed (re-entry after a hand-off in the re-poll). */
  retriggered: boolean;
}

export interface DispatchResult {
  /** `done`, or which poll was handed to the agent: `poll` (first) or `repoll` (after the re-trigger). */
  phase: "done" | "poll" | "repoll";
  /** 0 when done; EXIT.AGENT_WAIT / EXIT.USE_MCP on a hand-off; EXIT_RETRIGGER_FAILED when the push failed. */
  handoff: number;
  ciDispatch: CiDispatch | null;
  head: string;
  attempts: number;
  retrigger: boolean;
  ciWorkflow: string;
}

/** Exit code: the re-trigger commit or its push failed. */
export const EXIT_RETRIGGER_FAILED = 6;

function pushCurrentBranch(cwd: string): boolean {
  const branch = git(cwd, ["branch", "--show-current"]);
  if (!branch) return false;
  // Shared branches never force; a feature branch is rewritten only by this run.
  const args =
    branch === "dev" || branch === "main"
      ? ["push", "origin", branch]
      : ["push", "--force-with-lease", "origin", branch];
  return runGit(cwd, args).ok;
}

/**
 * The CI-Dispatch Gate after build / debug's last push. Never pushes after the
 * verdict: a later commit would move the PR head away from the run it proved.
 */
export async function ciDispatchGate(
  o: DispatchOptions,
  deps: { gh: Gh; sleep: Sleep; log: (m: string) => void },
): Promise<DispatchResult> {
  const root = checkoutRoot(o.cwd);
  const { capstoneJob } = readBkitConfig(root);
  const declared = ciDeclared(root);
  const head = () => git(o.cwd, ["rev-parse", "HEAD"]) ?? "";
  const res: DispatchResult = {
    phase: "done",
    handoff: 0,
    ciDispatch: null,
    head: head(),
    attempts: 0,
    retrigger: o.retriggered,
    ciWorkflow: declared.ciWorkflow,
  };
  const target: WaitTarget = {
    kind: "pr-present",
    pr: o.pr ?? undefined,
    ciWorkflow: declared.ciWorkflow,
    namespace: checkNamespace(capstoneJob),
  };
  const poll = async (phase: "poll" | "repoll"): Promise<SuppliedPoll | null> => {
    // A supplied result answers only the poll that was handed off; later polls run fresh.
    if (o.supplied && (phase === "repoll") === o.retriggered) {
      deps.log(
        `poll result supplied by the agent turn loop: ${o.supplied.pollResult} (attempts ${o.supplied.attempts})`,
      );
      return o.supplied;
    }
    // No PR to read is the shell's empty-PR poll: zero attempts, all errored.
    if (o.pr === null) return { pollResult: "err", attempts: 0, allErrored: true };
    deps.log(
      `polling for a ${target.namespace} check on PR #${o.pr} (budget ${o.budgetS}s, interval ${o.intervalS}s)`,
    );
    const w = await waitLoop(
      { budgetS: o.budgetS, intervalS: o.intervalS, once: false },
      () => pollOnce(target, deps.gh),
      deps.sleep,
      deps.log,
    );
    if (w.blocked || w.ghMissing) {
      res.phase = phase;
      res.handoff = w.ghMissing ? EXIT.USE_MCP : EXIT.AGENT_WAIT;
      res.attempts += w.attempts;
      return null;
    }
    return { pollResult: w.result, attempts: w.attempts, allErrored: w.allErrored };
  };
  const verdict = (outcome: DispatchOutcome, reason?: DispatchReason): DispatchResult => {
    res.ciDispatch = {
      outcome,
      head: res.head,
      attempts: res.attempts,
      retrigger: res.retrigger,
      ...(reason ? { reason } : {}),
    };
    deps.log(
      `verdict: ${outcome}${reason ? `(${reason})` : ""} head=${res.head} attempts=${res.attempts} retrigger=${res.retrigger}`,
    );
    return res;
  };

  if (!o.retriggered) {
    const first = await poll("poll");
    if (first === null) return res;
    res.attempts = first.attempts;
    if (first.pollResult === "found") return verdict("dispatched");
    if (first.allErrored) {
      deps.log("unresolved(gh-error): every poll errored — gh unavailable or unauthenticated");
      return verdict("unresolved", "gh-error");
    }
    if (SKIP_CI_TOKEN.test(commitMessage(o.cwd, res.head) ?? "")) {
      deps.log(
        "unresolved(timeout-dirty): no run and the pushed head carries a CI suppressor — not re-triggering a dirty head",
      );
      return verdict("unresolved", "timeout-dirty");
    }
    const committed = runGit(o.cwd, [
      "commit",
      "--allow-empty",
      "-m",
      `chore(${o.fid}): re-trigger${o.autoRouteSuffix}`,
    ]).ok;
    if (!committed || !pushCurrentBranch(o.cwd)) {
      deps.log("re-trigger commit or push failed — no verdict; route to the Failure Path");
      res.phase = "repoll";
      res.handoff = EXIT_RETRIGGER_FAILED;
      return res;
    }
    res.retrigger = true;
    res.head = head();
    deps.log("re-trigger pushed; re-polling");
  }

  const prior = res.attempts;
  const second = await poll("repoll");
  if (second === null) return res;
  // A supplied re-poll carries the running total; a fresh one adds to the first poll.
  res.attempts = o.retriggered && o.supplied ? second.attempts : prior + second.attempts;
  res.head = head();
  if (SKIP_CI_TOKEN.test(commitMessage(o.cwd, res.head) ?? "")) {
    deps.log(
      "unresolved(retrigger-suppressed): the re-trigger head carries a suppressor — cannot tell no-ci from suppression",
    );
    return verdict("unresolved", "retrigger-suppressed");
  }
  if (second.pollResult === "found") return verdict("self-healed");
  if (second.allErrored) {
    deps.log(
      "unresolved(gh-error): every re-poll errored — silence after the re-trigger proves nothing",
    );
    return verdict("unresolved", "gh-error");
  }
  if (declared.declared) {
    deps.log(
      `unresolved(ci-declared-no-run): ${declared.path} exists but a clean re-trigger dispatched no check — look for a startup failure: gh run list --commit ${res.head}`,
    );
    return verdict("unresolved", "ci-declared-no-run");
  }
  deps.log(
    `no-ci: a clean re-trigger dispatched nothing and ${declared.path} is absent — the repo has no CI workflow (logged pass)`,
  );
  return verdict("no-ci");
}

// ---------------------------------------------------------------------------
// Ship merge gate
// ---------------------------------------------------------------------------

/** One exit code per refusal reason — callers route on them, so they never collapse. */
export const GATE = {
  /** No run of the CI workflow at the head. */
  NO_RUN: 10,
  /** Runs at the head, none completed — poll. */
  IN_PROGRESS: 11,
  /** The selected run, or its capstone, did not conclude success. */
  FAILED: 12,
  /** The selected run has no capstone job — never a vacuous pass. */
  NO_CAPSTONE: 13,
  /** No run at the head, but the branch's latest green is at a superseded head (needs --branch). */
  SUPERSEDED: 14,
  /** The selected run was cancelled. */
  CANCELLED: 15,
  /** A lane named in bkit.shipGateRequiredLanes concluded skipped. */
  LANE_SKIPPED: 16,
  /** --validated is not an ancestor of the head plus bookkeeping-only commits. */
  NOT_BOOKKEEPING: 17,
  /** API error, rate limit, or auth — distinct from "no run". */
  API_ERROR: 20,
} as const;

/** Whether `to` is `from` plus bookkeeping-only commits. `outside` lists the other changed paths. */
export function onlyBookkeeping(
  root: string,
  o: { month: string; fid: string; from: string; to: string },
): { ok: boolean; outside: string[]; reason: string } {
  const check = checkOnlyBookkeeping(root, o);
  switch (check.kind) {
    case "ok":
      return { ok: true, outside: [], reason: "" };
    case "unknown-commit":
      return { ok: false, outside: [], reason: `unknown commit: ${check.ref}` };
    case "not-ancestor":
      return { ok: false, outside: [], reason: `${o.from} is not an ancestor of ${o.to}` };
    case "diff-failed":
      return { ok: false, outside: [], reason: `git diff failed for ${o.from}..${o.to}` };
    case "outside":
      return {
        ok: false,
        outside: check.outside,
        reason: `non-bookkeeping paths changed in ${o.from}..${o.to}`,
      };
  }
}

export interface GateOptions {
  /** Checkout holding both commits (for --validated) and `package.json`. */
  root: string;
  head: string;
  validated?: string;
  month?: string;
  fid?: string;
  capstone?: string;
  ciWorkflow?: string;
  repo?: string;
  branch?: string;
  event?: string;
  /** BKIT_SHIP_GATE_OVERRIDE: honoured only when it equals the refused head. */
  override?: string;
  /** status.jsonl for the override audit row. */
  statusFile?: string;
}

export interface GateResult {
  code: number;
  passed: boolean;
  overridden: boolean;
  /** The head CI is checked at: --head, or --validated when the carry-forward applied. */
  head: string;
  /** The head the caller merges (--head). */
  mergeHead: string;
  /** The head the selected run tested, when it differs (superseded). */
  testedHead: string | null;
  runId: number | null;
  runUrl: string | null;
  conclusion: string | null;
  capstone: string;
  ciWorkflow: string;
  repo: string | null;
  skippedLanes: string[];
  nonBookkeepingPaths: string[];
  reason: string;
}

interface Run {
  id: number | null;
  head_sha: string;
  status: string;
  conclusion: string;
  event: string;
  html_url: string;
  updated_at: string;
}

const toRun = (v: unknown): Run => {
  const r = obj(v);
  return {
    id: typeof r.id === "number" ? r.id : null,
    head_sha: text(r.head_sha),
    status: text(r.status),
    conclusion: text(r.conclusion),
    event: text(r.event),
    html_url: text(r.html_url),
    updated_at: text(r.updated_at),
  };
};

/** Latest by `updated_at`; ties keep list order, as jq's stable `sort_by | last` does. */
const latest = (runs: Run[]): Run | undefined =>
  runs.reduce<Run | undefined>(
    (best, r) => (!best || r.updated_at >= best.updated_at ? r : best),
    undefined,
  );

/**
 * Assert the capstone is present and green at the head. Returns the code; the
 * caller exits with it. Diagnostics go through `log`.
 */
export function shipGate(o: GateOptions, gh: Gh, log: (m: string) => void): GateResult {
  const cfg = readBkitConfig(o.root);
  const r: GateResult = {
    code: 0,
    passed: false,
    overridden: false,
    head: o.head,
    mergeHead: o.head,
    testedHead: null,
    runId: null,
    runUrl: null,
    conclusion: null,
    capstone: o.capstone || cfg.capstoneJob,
    ciWorkflow: o.ciWorkflow || cfg.ciWorkflow,
    repo: o.repo || null,
    skippedLanes: [],
    nonBookkeepingPaths: [],
    reason: "",
  };
  const requiredLanes = cfg.shipGateRequiredLanes;

  const refuse = (code: number, reason: string, runUrl?: string): GateResult => {
    log(reason);
    log(`required head:  ${r.head}`);
    if (r.mergeHead !== r.head) {
      log(`merge head:     ${r.mergeHead}  (bookkeeping-only commits on top of the required head)`);
    }
    if (r.testedHead && r.testedHead !== r.head)
      log(`head tested:    ${r.testedHead}  (SUPERSEDED)`);
    if (runUrl) log(`run:            ${runUrl}`);
    r.code = code;
    r.reason = reason;
    if (o.override && o.override === r.head) return overrideRefusal();
    return r;
  };

  const overrideRefusal = (): GateResult => {
    const row = JSON.stringify({
      type: "ship-gate-override",
      at: statusTimestamp(),
      head: r.head,
      assertedBy: "bkit runs gate",
    });
    let landed = false;
    if (o.statusFile) {
      try {
        fs.appendFileSync(o.statusFile, `${row}\n`);
        landed = true;
      } catch {
        // Unwritable status file: the row goes to stderr below, so the override is never invisible.
        landed = false;
      }
    }
    if (!landed) {
      log(
        `override audit row (status file unset/unwritable: '${o.statusFile ?? "<unset>"}'), emitting to stderr:`,
      );
      log(row);
    }
    log(`override honoured for head ${r.head} (BKIT_SHIP_GATE_OVERRIDE matches refused head)`);
    r.overridden = true;
    r.passed = true;
    r.code = EXIT.OK;
    return r;
  };

  const apiError = (what: string, runUrl?: string): GateResult => {
    const rate = gh(["api", "rate_limit"]);
    const rl = rate.ok ? obj(obj(jsonOrUndefined(rate.stdout)).rate) : undefined;
    let detail: string;
    if (!rl) {
      detail =
        "API error — rate_limit query also failed; auth / network / unknown API blip (distinct from 'no run')";
    } else if (rl.remaining === 0) {
      detail = `rate limit exhausted (remaining=0, reset at ${String(rl.reset ?? "")}) — dispatch, do not push`;
    } else {
      detail = `API error (rate remaining=${String(rl.remaining ?? "")}) — auth / network / unknown; distinct from 'no run'`;
    }
    log(what);
    return refuse(GATE.API_ERROR, detail, runUrl);
  };

  const ghMissing = (): GateResult => {
    r.code = EXIT.USE_MCP;
    r.reason = GH_MISSING;
    log(GH_MISSING);
    return r;
  };

  if (!r.repo) {
    const view = gh(["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]);
    if (view.missing) return ghMissing();
    r.repo = view.ok ? view.stdout.trim() || null : null;
    if (!r.repo) {
      return refuse(
        GATE.API_ERROR,
        "could not resolve repo (pass --repo <o/r> or run inside a gh-authenticated checkout)",
      );
    }
  }

  // 0. Validated-head carry-forward: ship's own [skip ci] bookkeeping commits ride
  // on a head CI already passed, so CI is checked at the validated sha instead.
  if (o.validated && o.validated !== o.head) {
    if (!o.month || !o.fid) {
      throw new CommandError(
        EXIT.USAGE,
        "--validated needs --month and --fid (the bookkeeping allow-list is FID-scoped)",
      );
    }
    const book = onlyBookkeeping(o.root, {
      month: o.month,
      fid: o.fid,
      from: o.validated,
      to: o.head,
    });
    if (!book.ok) {
      r.nonBookkeepingPaths = book.outside;
      for (const p of book.outside) log(`  ${p}`);
      return refuse(
        GATE.NOT_BOOKKEEPING,
        `head ${o.head} is not ${o.validated} plus bookkeeping only (${book.reason}) — re-validate at head`,
      );
    }
    log(
      `head ${o.head} = validated ${o.validated} + bookkeeping only — checking CI at the validated sha`,
    );
    r.head = o.validated;
  }

  // 1. Workflow-scoped, head-keyed run list. --event narrows it in the query AND
  // here, so an API that ignores the parameter still cannot hand back another event's run.
  const base = `/repos/${r.repo}/actions/workflows/${r.ciWorkflow}/runs`;
  const eventQuery = o.event ? `&event=${queryValue(o.event)}` : "";
  const eventLabel = o.event ? ` (event=${o.event})` : "";
  const keepEvent = (runs: Run[]) => (o.event ? runs.filter((x) => x.event === o.event) : runs);

  const listed = gh(["api", `${base}?head_sha=${queryValue(r.head)}${eventQuery}`]);
  if (listed.missing) return ghMissing();
  if (!listed.ok) {
    return apiError(`workflow runs query failed for ${r.repo}/${r.ciWorkflow} at head ${r.head}`);
  }
  const listedJson = jsonOrUndefined(listed.stdout);
  if (listedJson === undefined) {
    log(`workflow runs response for ${r.repo}/${r.ciWorkflow} at head ${r.head} is not valid JSON`);
    return refuse(GATE.API_ERROR, "workflow runs response is not valid JSON");
  }
  const runs = keepEvent(arr(obj(listedJson).workflow_runs).map(toRun));
  const total = o.event ? runs.length : Number(obj(listedJson).total_count ?? 0) || 0;

  if (total === 0) {
    // The head query is filtered server-side, so a superseded head looks exactly
    // like one never validated; only a branch-scoped query tells them apart.
    if (o.branch) {
      const recent = gh([
        "api",
        `${base}?branch=${queryValue(o.branch)}&status=success&per_page=1${eventQuery}`,
      ]);
      const stale = recent.ok
        ? latest(keepEvent(arr(obj(jsonOrUndefined(recent.stdout)).workflow_runs).map(toRun)))
        : undefined;
      if (stale) {
        r.testedHead = stale.head_sha || null;
        return refuse(
          GATE.SUPERSEDED,
          `no run at head ${r.head}; latest green on ${o.branch} is at a SUPERSEDED head (${stale.head_sha}) — re-validate`,
          stale.html_url,
        );
      }
    }
    return refuse(
      GATE.NO_RUN,
      `no run of ${r.ciWorkflow}${eventLabel} exists at head ${r.head} (total_count=0)`,
    );
  }

  // 2. The most recent COMPLETED run at the head: a re-dispatch still in flight
  // is newer, and must not mask a run that has in fact completed here.
  const selected = latest(runs.filter((x) => x.head_sha === r.head && x.status === "completed"));
  if (!selected) {
    const inFlight = latest(runs);
    return refuse(
      GATE.IN_PROGRESS,
      `runs exist at head ${r.head} but none completed (status=${inFlight?.status || "unknown"}) — caller may poll`,
      inFlight?.html_url,
    );
  }
  r.runId = selected.id;
  r.runUrl = selected.html_url || null;
  r.conclusion = selected.conclusion || null;
  r.testedHead = selected.head_sha || null;
  const url = selected.html_url;

  if (selected.conclusion === "failure") {
    return refuse(GATE.FAILED, `selected run concluded FAILURE at head ${r.head}`, url);
  }
  if (selected.conclusion === "cancelled") {
    return refuse(
      GATE.CANCELLED,
      `selected run was CANCELLED at head ${r.head} — dispatch, do not push`,
      url,
    );
  }
  if (selected.conclusion !== "success") {
    return refuse(
      GATE.FAILED,
      `selected run concluded '${selected.conclusion}' at head ${r.head} — not validated`,
      url,
    );
  }

  // 3. Capstone. `--slurp` turns --paginate's one-document-per-page stream into one
  // array; without it a run with more than 100 jobs hides every page but the first.
  const jobsRes = gh([
    "api",
    `/repos/${r.repo}/actions/runs/${selected.id}/jobs`,
    "--paginate",
    "--slurp",
  ]);
  if (jobsRes.missing) return ghMissing();
  if (!jobsRes.ok) {
    return apiError(
      `jobs query failed for run ${selected.id} — API error (distinct from 'no capstone')`,
      url,
    );
  }
  const jobsJson = jsonOrUndefined(jobsRes.stdout);
  if (jobsJson === undefined) {
    return refuse(GATE.API_ERROR, `jobs response for run ${selected.id} is not valid JSON`, url);
  }
  const pages = Array.isArray(jobsJson) ? jobsJson : [jobsJson];
  const jobs = pages.flatMap((p) => arr(obj(p).jobs).map(obj));
  const capstone = jobs.find((j) => j.name === r.capstone);
  if (!capstone) {
    return refuse(
      GATE.NO_CAPSTONE,
      `capstone job '${r.capstone}' ABSENT from run ${selected.id} at head ${r.head} — never vacuous pass`,
      url,
    );
  }
  if (capstone.conclusion !== "success") {
    return refuse(
      GATE.FAILED,
      `capstone '${r.capstone}' concluded '${text(capstone.conclusion)}' (not success) at head ${r.head}`,
      url,
    );
  }

  // 4. Skipped lanes. The jobs API gives no reason for a skip; the capstone takes
  // every lane result as input and owns planned-vs-vacuous, so a skip is reported,
  // and refuses only for a lane the consumer declared required.
  r.skippedLanes = jobs
    .filter((j) => j.name !== r.capstone && j.conclusion === "skipped")
    .map((j) => text(j.name) || "<unnamed>");
  if (r.skippedLanes.length) {
    log(
      `note: ${r.skippedLanes.length} lane(s) concluded 'skipped' at head ${r.head}: ${r.skippedLanes.join(", ")}`,
    );
    log(
      `note: capstone '${r.capstone}' is green and owns the planned-vs-vacuous judgement for those lanes`,
    );
    const required = r.skippedLanes.filter((l) => requiredLanes.includes(l));
    if (required.length) {
      log(`declared in bkit.shipGateRequiredLanes: ${requiredLanes.join(",")}`);
      return refuse(
        GATE.LANE_SKIPPED,
        `required lane(s) concluded 'skipped' at head ${r.head} — vacuous green: ${required.join(", ")}`,
        url,
      );
    }
  }

  r.passed = true;
  r.reason = `capstone ${r.capstone}=success at head ${r.head} (run ${selected.id}, ${url})`;
  log(r.reason);
  return r;
}

// ---------------------------------------------------------------------------
// Release-PR mirror
// ---------------------------------------------------------------------------

/** Exit codes of `mirror`. */
export const MIRROR = {
  /** No push run at the head after --absent-minutes. */
  ABSENT: 3,
  /** Still in progress at --max-minutes. */
  TIMED_OUT: 4,
  /** Three API errors in a row. */
  API_ERRORS: 20,
} as const;

export interface MirrorOptions {
  head: string;
  branch: string;
  absentMinutes: number;
  maxMinutes: number;
  intervalS: number;
}

export interface MirrorResult {
  code: number;
  passed: boolean;
  gateCode: number;
  polls: number;
  elapsedMinutes: number;
}

/**
 * Wait for the branch's push run at the head and copy its capstone verdict. The
 * gate owns run selection and its codes; this owns waiting. The override never
 * reaches the gate: it is a per-head escape for ship, never a way to green a required check.
 */
export async function mirrorPushRun(
  o: MirrorOptions,
  deps: {
    gate: () => GateResult;
    sleep: Sleep;
    now: () => number;
    log: (m: string) => void;
  },
): Promise<MirrorResult> {
  const start = deps.now();
  const out: MirrorResult = {
    code: EXIT.NO,
    passed: false,
    gateCode: -1,
    polls: 0,
    elapsedMinutes: 0,
  };
  let apiErrors = 0;
  let lastState = "";
  for (;;) {
    const g = deps.gate();
    out.polls++;
    out.gateCode = g.code;
    out.elapsedMinutes = Math.floor((deps.now() - start) / 60000);
    const elapsed = out.elapsedMinutes;
    if (g.code === EXIT.OK) {
      deps.log(`${o.branch} push run at ${o.head} passed its capstone — release PR mirrors green.`);
      out.code = EXIT.OK;
      out.passed = true;
      return out;
    }
    if (g.code === GATE.IN_PROGRESS) {
      apiErrors = 0;
      if (lastState !== "running") {
        deps.log(
          `${o.branch} push run at ${o.head} is in progress — waiting (up to ${o.maxMinutes}m).`,
        );
      }
      lastState = "running";
    } else if (g.code === GATE.NO_RUN || g.code === GATE.SUPERSEDED) {
      apiErrors = 0;
      if (elapsed >= o.absentMinutes) {
        deps.log(g.reason);
        deps.log(
          `no ${o.branch} push run exists at ${o.head} after ${elapsed}m. A [skip ci] commit at the ${o.branch} tip dispatches none: push a commit without it to ${o.branch}, then re-run this check.`,
        );
        out.code = MIRROR.ABSENT;
        return out;
      }
      if (lastState !== "absent") {
        deps.log(
          `no ${o.branch} push run at ${o.head} yet — waiting up to ${o.absentMinutes}m for one to appear.`,
        );
      }
      lastState = "absent";
    } else if (g.code === GATE.API_ERROR) {
      apiErrors++;
      if (apiErrors >= 3) {
        deps.log(g.reason);
        deps.log(
          `GitHub API failed ${apiErrors} times in a row — cannot read the ${o.branch} push run.`,
        );
        out.code = MIRROR.API_ERRORS;
        return out;
      }
      deps.log(`GitHub API error (${apiErrors}/3) — retrying.`);
    } else {
      deps.log(g.reason);
      deps.log(
        `${o.branch} push run at ${o.head} is not green (gate exit ${g.code}) — fix ${o.branch}, or re-run the failed push run, then re-run this check.`,
      );
      out.code = EXIT.NO;
      return out;
    }
    if (elapsed >= o.maxMinutes) {
      deps.log(
        `${o.branch} push run at ${o.head} still not finished after ${elapsed}m (limit ${o.maxMinutes}m).`,
      );
      out.code = MIRROR.TIMED_OUT;
      return out;
    }
    await deps.sleep(o.intervalS * 1000);
  }
}

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

/** Exit code: `wait --dispatch-if-absent` found no run and `gh workflow run` failed. */
export const EXIT_TRIGGER_FAILED = 5;
/** Exit code: the dispatch verdict passed, but the pushed head's body carries a skip token. */
export const EXIT_SKIP_TOKEN = 4;
/** Exit code: the pushed head's commit message could not be read for the body scan. */
export const EXIT_SCAN_ERROR = 5;

const wholeNumber = (v: FlagValue, flag: string, fallback: number, min = 0): number => {
  if (v === undefined) return fallback;
  const s = String(v);
  if (!/^[0-9]+$/.test(s) || Number(s) < min) {
    throw new CommandError(EXIT.USAGE, `--${flag} takes a whole number >= ${min} (got "${s}")`);
  }
  return Number(s);
};

const HEAD_FLAG: FlagSpec = { name: "head", type: "string", help: "commit SHA" };
const REPO_FLAG: FlagSpec = {
  name: "repo",
  type: "string",
  help: "owner/repo (default: gh repo view)",
};
const CI_WORKFLOW_FLAG: FlagSpec = {
  name: "ci-workflow",
  type: "string",
  help: "CI workflow file (default: package.json bkit.ciWorkflow)",
};
const CAPSTONE_FLAG: FlagSpec = {
  name: "capstone",
  type: "string",
  help: "capstone job name (default: package.json bkit.capstoneJob)",
};
const BUDGET_FLAG: FlagSpec = { name: "budget-s", type: "string", help: "poll budget in seconds" };
const INTERVAL_FLAG: FlagSpec = {
  name: "interval-s",
  type: "string",
  help: "seconds between polls (>= 1)",
};

const deps = (ctx: RunContext) => ({
  gh: (args: string[]) => runGh(ctx.cwd, args),
  sleep: realSleep,
  log: ctx.log,
});

/** Defaults per wait target: the dispatch probe's 60/10, ship's probe and CI-completion budgets. */
const WAIT_DEFAULTS: Record<WaitKind, { budgetS: number; intervalS: number }> = {
  "pr-present": { budgetS: 60, intervalS: 10 },
  "pr-completed": {
    budgetS: TIMEOUTS.SHIP_CI_WAIT_TIMEOUT_S,
    intervalS: TIMEOUTS.SHIP_POLL_INTERVAL_S,
  },
  "run-present": {
    budgetS: TIMEOUTS.SHIP_PROBE_ATTEMPTS * TIMEOUTS.SHIP_PROBE_INTERVAL_S,
    intervalS: TIMEOUTS.SHIP_PROBE_INTERVAL_S,
  },
  "run-completed": {
    budgetS: TIMEOUTS.SHIP_CI_WAIT_TIMEOUT_S,
    intervalS: TIMEOUTS.SHIP_POLL_INTERVAL_S,
  },
};

async function runWait(ctx: RunContext): Promise<number> {
  const f = ctx.flags;
  const pr = str(f.pr);
  const head = str(f.head);
  const branch = str(f.branch);
  if (pr === "" || head === "")
    throw new CommandError(EXIT.USAGE, "--pr / --head must not be empty");
  if ((pr === undefined) === (head === undefined)) {
    throw new CommandError(EXIT.USAGE, "give exactly one of --pr or --head");
  }
  if (head !== undefined && !branch) throw new CommandError(EXIT.USAGE, "--head needs --branch");
  const until = str(f.until) ?? "present";
  if (until !== "present" && until !== "completed") {
    throw new CommandError(EXIT.USAGE, "--until must be present or completed");
  }
  const kind = `${pr !== undefined ? "pr" : "run"}-${until}` as WaitKind;
  if (f.dispatchIfAbsent && (kind !== "run-present" || f.once === true)) {
    // One turn-loop poll is not a probe: dispatching on it would duplicate a run still registering.
    throw new CommandError(
      EXIT.USAGE,
      "--dispatch-if-absent needs --head --branch --until=present, without --once",
    );
  }
  const cfg = readBkitConfig(checkoutRoot(ctx.cwd));
  const ciWorkflow = cfg.ciWorkflow;
  const target: WaitTarget = {
    kind,
    pr,
    head,
    branch,
    ciWorkflow,
    namespace: checkNamespace(cfg.capstoneJob),
  };
  const budgetS = wholeNumber(f.budgetS, "budget-s", WAIT_DEFAULTS[kind].budgetS);
  const intervalS = wholeNumber(f.intervalS, "interval-s", WAIT_DEFAULTS[kind].intervalS, 1);
  const d = deps(ctx);
  const w = await waitLoop(
    { budgetS, intervalS, once: f.once === true },
    () => pollOnce(target, d.gh),
    d.sleep,
    ctx.log,
  );
  let dispatched = false;
  if (f.dispatchIfAbsent && w.result !== "found" && !w.blocked && !w.ghMissing) {
    ctx.log(
      `no run at ${head} after ${w.attempts} probes (probe=${w.result}) — dispatching ${ciWorkflow} on ${branch}`,
    );
    const run = d.gh(["workflow", "run", ciWorkflow, "--ref", String(branch)]);
    if (run.missing) w.ghMissing = true;
    else if (!run.ok) {
      ctx.log(`gh workflow run failed (403 = actions:write scope): ${run.stderr.trim()}`);
      ctx.emit({ ...waitOutput(w, kind), dispatched });
      return EXIT_TRIGGER_FAILED;
    } else dispatched = true;
  }
  ctx.emit({ ...waitOutput(w, kind), dispatched });
  if (w.ghMissing) {
    ctx.log(GH_MISSING);
    return EXIT.USE_MCP;
  }
  if (w.result === "found" || dispatched) return EXIT.OK;
  if (w.blocked || f.once === true) return EXIT.AGENT_WAIT;
  return EXIT.NO;
}

const waitOutput = (w: WaitResult, kind: WaitKind) => ({
  result: w.result,
  target: kind,
  attempts: w.attempts,
  elapsedS: w.elapsedS,
  allErrored: w.allErrored,
  blocked: w.blocked,
  conclusion: w.conclusion,
  checks: w.checks,
});

async function runDispatch(ctx: RunContext): Promise<number> {
  const f = ctx.flags;
  const d = deps(ctx);
  // An empty --pr is the workflow's unresolved PR_NUMBER: derive it, as if omitted.
  let pr = str(f.pr) || null;
  if (pr === null) {
    const found = currentPr(ctx.cwd, d.gh);
    if (found.missing) {
      ctx.log(GH_MISSING);
      return EXIT.USE_MCP;
    }
    pr = found.pr;
  }
  const pollResult = str(f.pollResult);
  if (pollResult !== undefined && !["found", "none", "err"].includes(pollResult)) {
    throw new CommandError(EXIT.USAGE, "--poll-result must be found, none, or err");
  }
  if (pollResult === undefined && (f.attempts !== undefined || f.allErrored === true)) {
    throw new CommandError(EXIT.USAGE, "--attempts / --all-errored go with --poll-result");
  }
  const r = await ciDispatchGate(
    {
      cwd: ctx.cwd,
      pr,
      fid: String(f.fid),
      autoRouteSuffix: str(f.autoRouteSuffix) ?? "",
      budgetS: wholeNumber(f.budgetS, "budget-s", 60),
      intervalS: wholeNumber(f.intervalS, "interval-s", 10, 1),
      supplied:
        pollResult === undefined
          ? undefined
          : {
              pollResult: pollResult as SuppliedPoll["pollResult"],
              attempts: wholeNumber(f.attempts, "attempts", 0),
              allErrored: f.allErrored === true,
            },
      retriggered: f.retriggered === true,
    },
    d,
  );
  const scanResult =
    r.ciDispatch && r.ciDispatch.outcome !== "unresolved" ? scanBody(ctx.cwd, r.head) : null;
  ctx.emit({
    ciDispatch: r.ciDispatch,
    phase: r.phase,
    pr,
    head: r.head,
    attempts: r.attempts,
    retrigger: r.retrigger,
    scanResult,
    ciWorkflow: r.ciWorkflow,
  });
  if (r.handoff === EXIT.AGENT_WAIT || r.handoff === EXIT.USE_MCP) {
    const again = r.phase === "repoll" ? " --retriggered" : "";
    ctx.log(
      `${r.handoff === EXIT.USE_MCP ? GH_MISSING : "this runtime cannot wait"}: resolve the ${r.phase} each turn with \`bkit runs wait --pr=${pr ?? "<n>"} --once\`, then re-run with --poll-result=<found|none|err> --attempts=<total>${again}`,
    );
    return r.handoff;
  }
  if (r.handoff !== 0) return r.handoff;
  if (r.ciDispatch?.outcome === "unresolved") {
    ctx.log("unresolved verdict — record it, then route to the Failure Path");
    return EXIT.NO;
  }
  if (scanResult === "error") {
    ctx.log(`post-close body scan could not read ${r.head}`);
    return EXIT_SCAN_ERROR;
  }
  if (scanResult === "skip-token-found") {
    ctx.log(`landed commit ${r.head} inherited a CI-suppression token in its body`);
    return EXIT_SKIP_TOKEN;
  }
  return EXIT.OK;
}

function runGate(ctx: RunContext): number {
  const f = ctx.flags;
  const r = shipGate(
    {
      root: checkoutRoot(ctx.cwd),
      head: String(f.head),
      validated: str(f.validated),
      month: str(f.month),
      fid: str(f.fid),
      repo: str(f.repo),
      branch: str(f.branch),
      event: str(f.event),
      override: process.env.BKIT_SHIP_GATE_OVERRIDE || undefined,
      statusFile: f.file === undefined ? undefined : path.resolve(ctx.cwd, String(f.file)),
    },
    (args) => runGh(ctx.cwd, args),
    ctx.log,
  );
  ctx.emit({ ...r });
  return r.code;
}

async function runMirror(ctx: RunContext): Promise<number> {
  const f = ctx.flags;
  const head = String(f.head);
  const branch = str(f.branch) ?? "dev";
  if (!branch) throw new CommandError(EXIT.USAGE, "--branch must not be empty");
  const o: MirrorOptions = {
    head,
    branch,
    absentMinutes: wholeNumber(f.absentMinutes, "absent-minutes", 10),
    maxMinutes: wholeNumber(f.maxMinutes, "max-minutes", 170),
    intervalS: wholeNumber(f.intervalS, "interval-s", 30),
  };
  const root = checkoutRoot(ctx.cwd);
  const repo = str(f.repo) ?? (process.env.GITHUB_REPOSITORY || undefined);
  const gh: Gh = (args) => runGh(ctx.cwd, args);
  const r = await mirrorPushRun(o, {
    // Each poll's diagnostics are dropped; the mirror logs the gate's reason when it stops on it.
    gate: () =>
      shipGate(
        {
          root,
          head,
          branch,
          event: "push",
          repo,
          ciWorkflow: str(f.ciWorkflow),
          capstone: str(f.capstone),
        },
        gh,
        () => undefined,
      ),
    sleep: realSleep,
    now: Date.now,
    log: ctx.log,
  });
  ctx.emit({ ...r });
  return r.code;
}

export const runsCommand: CommandSpec = {
  noun: "runs",
  summary: "CI runs: wait for one, prove one was dispatched, gate a merge on one.",
  verbs: {
    wait: {
      summary:
        "Bounded poll for a CI check on a PR (--pr) or a CI run at a head (--head --branch), present or completed.",
      flags: [
        { name: "pr", type: "string", help: "PR number: read its check rollup" },
        { ...HEAD_FLAG, help: "commit SHA: read the CI workflow's runs at it (with --branch)" },
        { name: "branch", type: "string", help: "branch the runs are on (with --head)" },
        {
          name: "until",
          type: "string",
          help: "present (a check / run exists, default) | completed (PR: no open checks; run: completed)",
        },
        BUDGET_FLAG,
        INTERVAL_FLAG,
        {
          name: "once",
          type: "boolean",
          help: "poll once, for an agent turn loop; not found exits 81 (end the turn, call again)",
        },
        {
          name: "dispatch-if-absent",
          type: "boolean",
          help: "with --head --until=present: no run after the budget -> gh workflow run <ciWorkflow> --ref <branch>",
        },
      ],
      output: {
        result: "found | none | err (err: every poll errored, gh absent, or the sleep was blocked)",
        target: "pr-present | pr-completed | run-present | run-completed",
        attempts: "polls run",
        elapsedS: "seconds slept",
        allErrored: "every poll errored",
        blocked: "a sleep overran its window: resolve the poll in the agent turn loop",
        conclusion: "the run's conclusion (run-completed when found), else null",
        checks: "checks in the PR rollup (PR targets), else null",
        dispatched: "--dispatch-if-absent ran gh workflow run",
      },
      exitCodes: { [EXIT_TRIGGER_FAILED]: "--dispatch-if-absent: gh workflow run failed" },
      run: runWait,
    },
    dispatch: {
      summary:
        "CI-Dispatch Gate after the last push: poll, one clean re-trigger, the ciDispatch verdict, and the body scan.",
      flags: [
        {
          name: "pr",
          type: "string",
          help: "PR number (default: the open PR from this branch into dev)",
        },
        {
          name: "fid",
          type: "string",
          required: true,
          help: "feature id, for the re-trigger commit subject",
        },
        {
          name: "auto-route-suffix",
          type: "string",
          help: 'suffix the issue\'s bkit:auto label gives (" bkit [auto route]" or empty): `autoRouteSuffix` of `bkit issues labels`',
        },
        { ...BUDGET_FLAG, help: "poll budget in seconds (default 60)" },
        { ...INTERVAL_FLAG, help: "seconds between polls (default 10)" },
        {
          name: "poll-result",
          type: "string",
          help: "re-entry after a hand-off: found | none | err, as the agent turn loop resolved it",
        },
        {
          name: "attempts",
          type: "string",
          help: "re-entry: total poll attempts so far (hand-off attempts + turns)",
        },
        { name: "all-errored", type: "boolean", help: "re-entry: every turn-loop poll errored" },
        {
          name: "retriggered",
          type: "boolean",
          help: "re-entry: the hand-off was in the re-poll (re-trigger already pushed)",
        },
      ],
      output: {
        ciDispatch:
          "{outcome, head, attempts, retrigger, reason?} — record with `bkit steps done --field ciDispatch=…` (local only, never pushed); null on a hand-off",
        phase: "done | poll | repoll (which poll was handed to the agent)",
        pr: "PR number polled (null when none was found)",
        head: "the pushed head (the re-trigger commit after a re-trigger)",
        attempts: "poll attempts so far",
        retrigger: "a re-trigger commit was pushed",
        scanResult:
          "clean | skip-token-found | error — the pushed head's BODY scan; null when unresolved",
        ciWorkflow: "the CI workflow file the no-ci check looked for",
      },
      exitCodes: {
        [EXIT_SKIP_TOKEN]: "the pushed head's body carries a CI-suppression token",
        [EXIT_SCAN_ERROR]: "the pushed head's commit message could not be read",
        [EXIT_RETRIGGER_FAILED]: "the re-trigger commit or push failed (no verdict)",
      },
      run: runDispatch,
    },
    gate: {
      summary:
        "Ship merge gate: the capstone job present and green at the head (exit 0), or why not.",
      flags: [
        { ...HEAD_FLAG, required: true, help: "the PR head to merge" },
        {
          name: "validated",
          type: "string",
          help: "an ancestor CI passed at; checked instead when only bookkeeping changed since (needs --month --fid)",
        },
        { name: "month", type: "string", help: "YYYYMM, for the bookkeeping allow-list" },
        { name: "fid", type: "string", help: "feature id, for the bookkeeping allow-list" },
        REPO_FLAG,
        {
          name: "branch",
          type: "string",
          help: "PR branch: tells a superseded head (14) from no run (10)",
        },
        {
          name: "event",
          type: "string",
          help: "count only runs fired by this event (push, pull_request)",
        },
        {
          name: "file",
          type: "string",
          help: "status.jsonl for the BKIT_SHIP_GATE_OVERRIDE audit row (stderr when absent or unwritable)",
        },
      ],
      output: {
        code: "the exit code",
        passed: "merge may proceed (green, or override honoured)",
        overridden: "BKIT_SHIP_GATE_OVERRIDE equalled the refused head",
        head: "head CI was checked at (--validated when the carry-forward applied)",
        mergeHead: "--head",
        testedHead: "head the selected (or superseded) run tested",
        runId: "selected run id",
        runUrl: "selected run URL",
        conclusion: "selected run conclusion",
        capstone: "capstone job name",
        ciWorkflow: "CI workflow file",
        repo: "owner/repo",
        skippedLanes: "lanes that concluded skipped (reported, refuse only when required)",
        nonBookkeepingPaths: "paths past --validated outside the allow-list (code 17)",
        reason: "why — the refusal or pass line",
      },
      exitCodes: {
        [GATE.NO_RUN]: "no run of the CI workflow at the head",
        [GATE.IN_PROGRESS]: "runs at the head, none completed (poll)",
        [GATE.FAILED]: "selected run or its capstone did not conclude success",
        [GATE.NO_CAPSTONE]: "selected run has no capstone job",
        [GATE.SUPERSEDED]: "green run only at a superseded head (needs --branch)",
        [GATE.CANCELLED]: "selected run was cancelled",
        [GATE.LANE_SKIPPED]: "a required lane concluded skipped",
        [GATE.NOT_BOOKKEEPING]: "non-bookkeeping change past --validated, or not its descendant",
        [GATE.API_ERROR]: "API error / rate limit / auth",
      },
      run: runGate,
    },
    mirror: {
      summary:
        "Release PR: wait for the branch's push run at the head and copy its capstone verdict.",
      flags: [
        { ...HEAD_FLAG, required: true, help: "the PR head (same SHA the push run tests)" },
        { name: "branch", type: "string", help: "branch whose push run to mirror (default dev)" },
        { ...REPO_FLAG, help: "owner/repo (default: $GITHUB_REPOSITORY, then gh repo view)" },
        CI_WORKFLOW_FLAG,
        CAPSTONE_FLAG,
        {
          name: "absent-minutes",
          type: "string",
          help: "how long no push run may exist (default 10)",
        },
        {
          name: "max-minutes",
          type: "string",
          help: "how long to wait in total (default 170; keep below the job's timeout-minutes)",
        },
        { name: "interval-s", type: "string", help: "seconds between polls (default 30)" },
      ],
      output: {
        code: "the exit code",
        passed: "the push run's capstone passed",
        gateCode: "the last gate code",
        polls: "gate calls made",
        elapsedMinutes: "minutes waited",
      },
      exitCodes: {
        [MIRROR.ABSENT]: "no push run at the head after --absent-minutes ([skip ci] at the tip?)",
        [MIRROR.TIMED_OUT]: "push run still in progress at --max-minutes",
        [MIRROR.API_ERRORS]: "three GitHub API errors in a row",
      },
      run: runMirror,
    },
    declared: {
      summary:
        "Whether the repo declares a CI workflow: .github/workflows/<bkit.ciWorkflow> exists (exit 0) or not (exit 1).",
      flags: [],
      output: {
        declared: "the workflow file exists",
        ciWorkflow: "the workflow file name checked",
        path: "its path relative to the checkout",
      },
      run: (ctx) => {
        const d = ciDeclared(checkoutRoot(ctx.cwd));
        ctx.emit({ ...d });
        return d.declared ? EXIT.OK : EXIT.NO;
      },
    },
  },
};
