// bkit prs open|probe|merge|update-branch|checks|verbose-ci|scan-body|cross-check|transport-row —
// the pull-request side of a phase close, and the close audit trail.
//
// `gh` is the only transport `open` and `probe` drive. When it is missing or not
// logged in (`gh` exits 4) they exit 80 instead, and `open` still prints the title
// and body, so the workflow makes the same call through the GitHub MCP tool. Every
// PR `open` creates carries the `bkit:issue` / `bkit:fid` marker: `/bkit-auto`
// reads it first and only guesses from the branch name when it is missing.

import * as fs from "node:fs";
import * as path from "node:path";

import type { IssueTracker } from "../../install/manifest.js";
import { readBkitConfig } from "../../shared/settings.js";
import { appendLine, statusTimestamp, type StatusRow } from "../../ledgers/status.js";
import {
  bodySkipToken,
  CommandError,
  EXIT,
  ghUnavailable,
  git,
  parseJson,
  repoRoot,
  runGh,
  runGit,
  SKIP_CI_TOKEN,
  type CommandSpec,
  type FlagSpec,
  type FlagValue,
  type GhResult,
  type RunContext,
} from "../lib.js";
import { AUTO_LABEL, AUTO_ROUTE_SUFFIX } from "./issues.js";
import { EXIT_NO_STATUS, FILE_FLAG, readStatusRows, statusFile, str } from "./status.js";

// ---------------------------------------------------------------------------
// gh
// ---------------------------------------------------------------------------

const PR_FIELDS = "number,url,state,baseRefName,headRefName,headRefOid,title,mergeCommit";

export interface PrInfo {
  number: number;
  url: string;
  state: string;
  baseRefName: string;
  headRefName: string;
  headRefOid: string;
  title: string;
  mergeCommit: { oid?: string } | null;
  mergeable?: string;
}

export type Probe =
  | { kind: "ok"; pr: PrInfo | undefined }
  | { kind: "unavailable"; message: string }
  | { kind: "failed"; message: string };

function ghFailure(res: GhResult, what: string): Probe {
  const detail = res.stderr.split("\n").at(-1) || `exit ${String(res.status)}`;
  return ghUnavailable(res)
    ? { kind: "unavailable", message: `gh unavailable for ${what}: ${detail}` }
    : { kind: "failed", message: `${what} failed: ${detail}` };
}

/**
 * The PR for a head branch, or one PR by number. With `state: "all"` an OPEN PR
 * wins over a MERGED one and a CLOSED one is never picked — ship resumes from a
 * merged PR but must not adopt an abandoned one.
 */
export function probePr(
  cwd: string,
  opts: { head?: string; base?: string; state: "open" | "all"; number?: string },
): Probe {
  if (opts.number !== undefined) {
    const res = runGh(cwd, ["pr", "view", opts.number, "--json", `${PR_FIELDS},mergeable`]);
    if (!res.ok) return ghFailure(res, `gh pr view ${opts.number}`);
    const parsed = parseJson(res.stdout);
    if (!parsed.ok) return { kind: "failed", message: "gh pr view printed no JSON" };
    return { kind: "ok", pr: parsed.value as PrInfo };
  }
  const args = ["pr", "list", "--head", opts.head!, "--state", opts.state, "--json", PR_FIELDS];
  if (opts.base !== undefined) args.push("--base", opts.base);
  const res = runGh(cwd, args);
  if (!res.ok) return ghFailure(res, `gh pr list --head ${opts.head!}`);
  const parsed = parseJson(res.stdout);
  if (!parsed.ok || !Array.isArray(parsed.value)) {
    return { kind: "failed", message: "gh pr list printed no JSON array" };
  }
  const prs = parsed.value as PrInfo[];
  const pr =
    opts.state === "open"
      ? prs[0]
      : (prs.find((p) => p.state === "OPEN") ?? prs.find((p) => p.state === "MERGED"));
  return { kind: "ok", pr };
}

export function prOutput(pr: PrInfo | undefined) {
  return {
    found: pr !== undefined,
    number: pr?.number ?? null,
    url: pr?.url ?? null,
    state: pr?.state ?? null,
    baseRefName: pr?.baseRefName ?? null,
    headRefName: pr?.headRefName ?? null,
    headRefOid: pr?.headRefOid ?? null,
    title: pr?.title ?? null,
    titleSkipToken: (pr?.title !== undefined && SKIP_CI_TOKEN.exec(pr.title)?.[0]) || null,
    mergeCommitOid: pr?.mergeCommit?.oid ?? null,
    mergeable: pr?.mergeable ?? null,
  };
}

const PR_OUTPUT_KEYS: Record<string, string> = {
  found: "whether a PR was found",
  number: "PR number, or null",
  url: "PR URL, or null",
  state: "OPEN | MERGED | CLOSED, or null",
  baseRefName: "base branch, or null",
  headRefName: "head branch, or null",
  headRefOid: "head commit, or null",
  title: "PR title, or null",
  titleSkipToken:
    "the CI-suppressing token in the title, or null (a merge of this title would skip CI on dev)",
  mergeCommitOid: "squash/merge commit once merged, or null",
  mergeable: "MERGEABLE | CONFLICTING | UNKNOWN (with --number only), or null",
};

function currentBranch(cwd: string): string {
  const branch = git(cwd, ["branch", "--show-current"]) ?? "";
  if (branch === "") throw new CommandError(EXIT.USAGE, "detached HEAD — pass --head explicitly");
  return branch;
}

/** A git ref given on the command line; a leading `-` would be read as an option. */
function refFlag(value: FlagValue, flag: string): string {
  const s = String(value ?? "");
  if (s === "" || s.startsWith("-")) {
    throw new CommandError(EXIT.USAGE, `--${flag} must be a non-empty ref not starting with "-"`);
  }
  return s;
}

// ---------------------------------------------------------------------------
// open
// ---------------------------------------------------------------------------

/** FID allowlists per tracker — the same ones `/bkit-auto` asserts when it reads the marker back. */
const FID_FORMAT: Record<IssueTracker, RegExp> = {
  github: /^[0-9]+-[a-z0-9-]+$/,
  linear: /^[a-z]+-[0-9]+-[a-z0-9-]+$/,
  none: /^[a-z0-9][a-z0-9-]*$/,
};
const ISSUE_FORMAT: Record<Exclude<IssueTracker, "none">, RegExp> = {
  github: /^[0-9]+$/,
  linear: /^[A-Z]+-[0-9]+$/,
};

/** The PR-body marker line for this tracker (`.bkit/trackers.md` `pr-body-marker`). */
export function prMarker(tracker: IssueTracker, fid: string, issue: string | undefined): string {
  if (!FID_FORMAT[tracker].test(fid)) {
    throw new CommandError(EXIT.USAGE, `--fid "${fid}" is not a ${tracker} FID slug`);
  }
  if (tracker === "none") return `<!-- bkit:fid=${fid} -->`;
  const id = (issue ?? "").replace(/^#/, "");
  if (!ISSUE_FORMAT[tracker].test(id)) {
    throw new CommandError(EXIT.USAGE, `--issue "${issue ?? ""}" is not a ${tracker} issue id`);
  }
  return tracker === "github"
    ? `<!-- bkit:issue=#${id} bkit:fid=${fid} -->`
    : `<!-- bkit:issue=${id} bkit:fid=${fid} -->`;
}

/** Marker line, then a `bkit:start` / `bkit:end` block with the notes and the plan path. */
export function prBody(marker: string, notes: string[], plan: string | undefined): string {
  const block = [...notes, ...(plan === undefined ? [] : [plan])];
  return [marker, ...(block.length ? ["<!-- bkit:start -->", ...block, "<!-- bkit:end -->"] : [])]
    .join("\n")
    .concat("\n");
}

export const EXIT_PR_EXISTS = 3;
export const EXIT_SKIP_CI_TITLE = 4;
export const EXIT_GH_FAILED = 5;
export const EXIT_WRONG_BASE = 6;

export interface OpenInput {
  fid: string;
  title: string;
  issue?: string;
  base?: string;
  head?: string;
  plan?: string;
  notes?: string[];
  existing?: "fail" | "reuse";
}

export interface OpenResult {
  code: number;
  out: {
    created: boolean;
    useMcp: boolean;
    number: number | null;
    url: string | null;
    base: string;
    head: string;
    title: string;
    body: string;
  } | null;
}

/** Open (or, with `existing: "reuse"`, reuse) the PR for `head`; `code` is the verb's exit code. */
export function openPrFor(cwd: string, o: OpenInput, log: (m: string) => void): OpenResult {
  const tracker = readBkitConfig(repoRoot(cwd)).issueTracker;
  if (tracker === "none" && o.issue !== undefined) log("--issue ignored: no tracker wired");
  const marker = prMarker(tracker, o.fid, o.issue);

  const title = o.title;
  if (title.trim() === "") throw new CommandError(EXIT.USAGE, "--title must be non-empty");
  const token = SKIP_CI_TOKEN.exec(title);
  if (token) {
    log(`refusing: PR title carries the CI-suppressing token ${token[0]} — CI would never run`);
    return { code: EXIT_SKIP_CI_TITLE, out: null };
  }

  const base = refFlag(o.base ?? "dev", "base");
  const head = o.head === undefined ? currentBranch(cwd) : refFlag(o.head, "head");
  if (head === base || head === "dev" || head === "main") {
    throw new CommandError(EXIT.USAGE, `refusing to open a PR from "${head}" into "${base}"`);
  }

  let plan = o.plan;
  if (plan !== undefined && !fs.existsSync(path.resolve(cwd, plan))) {
    log(`plan ${plan} not present — PR body names no plan`);
    plan = undefined;
  }
  const body = prBody(marker, o.notes ?? [], plan);
  const viaMcp = (why: string): OpenResult => {
    log(`${why} — create the PR through the GitHub MCP tool with this title and body`);
    return {
      code: EXIT.USE_MCP,
      out: { created: false, useMcp: true, number: null, url: null, base, head, title, body },
    };
  };

  const existing = probePr(cwd, { head, base, state: "open" });
  if (existing.kind === "unavailable") return viaMcp(existing.message);
  if (existing.kind === "failed") {
    log(existing.message);
    return { code: EXIT_GH_FAILED, out: null };
  }
  if (existing.pr) {
    const out = {
      created: false,
      useMcp: false,
      number: existing.pr.number,
      url: existing.pr.url,
      base,
      head,
      title: existing.pr.title,
      body,
    };
    if (o.existing === "reuse") {
      log(`reusing open PR #${existing.pr.number} on ${head}`);
      return { code: EXIT.OK, out };
    }
    log(
      `${head} already has open PR #${existing.pr.number} to ${base} — refusing to blind-create (resume via /bkit-debug or close the stale PR)`,
    );
    return { code: EXIT_PR_EXISTS, out };
  }

  const createArgs = [
    "pr",
    "create",
    "--base",
    base,
    "--head",
    head,
    "--title",
    title,
    "--body",
    body,
  ];
  let created = runGh(cwd, createArgs);
  if (!created.ok && !ghUnavailable(created)) {
    log(
      `gh pr create failed (${created.stderr || `exit ${String(created.status)}`}) — retrying once`,
    );
    created = runGh(cwd, createArgs);
  }
  if (ghUnavailable(created)) return viaMcp("gh unavailable for gh pr create");
  if (!created.ok) {
    log(`gh pr create failed twice: ${created.stderr || `exit ${String(created.status)}`}`);
    return { code: EXIT_GH_FAILED, out: null };
  }

  // gh prints the new PR's URL; reading the PR back is what proves its base.
  const url = created.stdout.split("\n").at(-1) ?? "";
  const back = probePr(cwd, { number: url, state: "open" });
  if (back.kind !== "ok" || !back.pr) {
    log(
      `created ${url} but could not read it back: ${back.kind === "ok" ? "empty" : back.message}`,
    );
    return { code: EXIT_GH_FAILED, out: null };
  }
  const out = {
    created: true,
    useMcp: false,
    number: back.pr.number,
    url: back.pr.url,
    base: back.pr.baseRefName,
    head,
    title: back.pr.title,
    body,
  };
  if (back.pr.baseRefName !== base) {
    log(`PR #${back.pr.number} targets ${back.pr.baseRefName}, not ${base}`);
    return { code: EXIT_WRONG_BASE, out };
  }
  return { code: EXIT.OK, out };
}

function openPr(ctx: RunContext): number {
  const r = openPrFor(
    ctx.cwd,
    {
      fid: String(ctx.flags.fid),
      title: String(ctx.flags.title),
      issue: str(ctx.flags.issue),
      base: str(ctx.flags.base),
      head: str(ctx.flags.head),
      plan: str(ctx.flags.plan),
      notes: (ctx.flags.note as string[] | undefined) ?? [],
      existing: str(ctx.flags.existing) as OpenInput["existing"],
    },
    ctx.log,
  );
  if (r.out) ctx.emit(r.out);
  return r.code;
}

// ---------------------------------------------------------------------------
// merge
// ---------------------------------------------------------------------------

/** Exit code (merge --expect-merged): the PR did not reach MERGED. */
export const EXIT_NOT_MERGED = 7;

export interface MergeInput {
  number: string;
  subject: string;
  /** `--match-head-commit`: the server refuses when the head moved. */
  matchHead?: string;
  deleteBranch?: boolean;
}

export interface MergeResult {
  code: number;
  out: {
    merged: boolean;
    alreadyMerged: boolean;
    state: string | null;
    mergeCommitOid: string | null;
    subject: string;
    verdict: "PASS" | "FAIL";
    failures: number;
  };
}

/**
 * Squash-merge a PR with an explicit empty body (never the default concatenated
 * subjects), unless it is already MERGED, then read the state back. gh missing →
 * EXIT.USE_MCP (merge through `merge_pull_request` with `subject`).
 */
export function mergePr(cwd: string, o: MergeInput, log: (m: string) => void): MergeResult {
  const read = () => probePr(cwd, { number: o.number, state: "open" });
  const result = (code: number, pr: PrInfo | undefined, already: boolean): MergeResult => {
    const merged = pr?.state === "MERGED";
    return {
      code,
      out: {
        merged,
        alreadyMerged: already,
        state: pr?.state ?? null,
        mergeCommitOid: pr?.mergeCommit?.oid ?? null,
        subject: o.subject,
        verdict: merged ? "PASS" : "FAIL",
        failures: merged ? 0 : 1,
      },
    };
  };
  const before = read();
  if (before.kind === "unavailable") {
    log(`${before.message} — merge through merge_pull_request with this subject and an empty body`);
    return result(EXIT.USE_MCP, undefined, false);
  }
  if (before.kind === "failed") {
    log(before.message);
    return result(EXIT_GH_FAILED, undefined, false);
  }
  if (before.pr?.state === "MERGED") return result(EXIT.OK, before.pr, true);
  const args = ["pr", "merge", o.number, "--squash", "--subject", o.subject, "--body", ""];
  if (o.deleteBranch === true) args.push("--delete-branch");
  if (o.matchHead !== undefined) args.push("--match-head-commit", o.matchHead);
  const merged = runGh(cwd, args);
  if (ghUnavailable(merged)) {
    log(
      "gh unavailable for gh pr merge — merge through merge_pull_request with this subject and an empty body",
    );
    return result(EXIT.USE_MCP, before.pr, false);
  }
  if (!merged.ok)
    log(`gh pr merge ${o.number} failed: ${merged.stderr || `exit ${String(merged.status)}`}`);
  const after = read();
  if (after.kind !== "ok") {
    log(after.message);
    return result(EXIT_GH_FAILED, undefined, false);
  }
  return result(EXIT.OK, after.pr, false);
}

// ---------------------------------------------------------------------------
// update-branch
// ---------------------------------------------------------------------------

export interface UpdateBranchResult {
  code: number;
  out: { number: string; updated: boolean } | null;
}

/**
 * Request a server-side base-into-head refresh (ship Step 4 B1). GitHub authors
 * the merge commit, so bkit cannot set its message and there is no local head to
 * read back — ship's Step 9 poll observes the new head. gh missing →
 * EXIT.USE_MCP (route through `update_pull_request_branch`).
 */
export function updateBranch(
  cwd: string,
  number: string,
  log: (m: string) => void,
): UpdateBranchResult {
  const res = runGh(cwd, ["pr", "update-branch", number]);
  if (ghUnavailable(res)) {
    log(
      "gh unavailable for gh pr update-branch — update the branch through update_pull_request_branch",
    );
    return { code: EXIT.USE_MCP, out: null };
  }
  if (!res.ok) {
    const detail = res.stderr.split("\n").at(-1) || `exit ${String(res.status)}`;
    log(
      `gh pr update-branch ${number} failed: ${detail} (403 = actions:write scope, network, branch protection) — PR head NOT integrated`,
    );
    return { code: EXIT_GH_FAILED, out: null };
  }
  return { code: EXIT.OK, out: { number, updated: true } };
}

// ---------------------------------------------------------------------------
// checks
// ---------------------------------------------------------------------------

/** Exit code (checks): the PR's check rollup could not be read. */
export const EXIT_CHECKS_UNREADABLE = 4;

export interface ChecksOut {
  number: string;
  total: number;
  passing: number;
  failed: number;
  pending: number;
  green: boolean;
  failing: string[];
}

/** Conclusions / states a finished check may carry and still count as passing. */
const PASS_STATES = new Set(["SUCCESS", "NEUTRAL", "SKIPPED"]);

/**
 * The PR's check rollup, classified (ship Step 2's post-open assert). `green` only
 * when at least one check exists and none is failed or pending. A check run is
 * open until `status` = `COMPLETED`; a commit status is open while its `state` is
 * `PENDING` / `EXPECTED`. gh missing → EXIT.USE_MCP (read the rollup through
 * `pull_request_read` `get_status`).
 */
export function checksFor(
  cwd: string,
  number: string,
  log: (m: string) => void,
): { code: number; out: ChecksOut | null } {
  const res = runGh(cwd, ["pr", "view", number, "--json", "statusCheckRollup"]);
  if (ghUnavailable(res)) {
    log(
      "gh unavailable for gh pr view --json statusCheckRollup — read the rollup through pull_request_read (get_status)",
    );
    return { code: EXIT.USE_MCP, out: null };
  }
  if (!res.ok) {
    log(
      `gh pr view ${number} failed: ${res.stderr.split("\n").at(-1) || `exit ${String(res.status)}`}`,
    );
    return { code: EXIT_CHECKS_UNREADABLE, out: null };
  }
  const parsed = parseJson(res.stdout);
  if (!parsed.ok) {
    log("gh pr view printed no JSON");
    return { code: EXIT_CHECKS_UNREADABLE, out: null };
  }
  const rawRollup = (parsed.value as { statusCheckRollup?: unknown }).statusCheckRollup;
  const checks = (Array.isArray(rawRollup) ? rawRollup : []) as Array<Record<string, unknown>>;
  let passing = 0;
  let failed = 0;
  let pending = 0;
  const failing: string[] = [];
  for (const c of checks) {
    const name = String(c.name ?? c.context ?? "").trim();
    const status = String(c.status ?? "").toUpperCase();
    const state = String(c.state ?? "").toUpperCase();
    const conclusion = String(c.conclusion ?? "").toUpperCase();
    // A check run carries `status`; a commit status carries `state`.
    const open =
      status !== "" ? status !== "COMPLETED" : state === "PENDING" || state === "EXPECTED";
    if (open) {
      pending++;
    } else if (PASS_STATES.has(conclusion || state)) {
      passing++;
    } else {
      failed++;
      if (name) failing.push(name);
    }
  }
  const green = checks.length > 0 && failed === 0 && pending === 0;
  const out: ChecksOut = {
    number,
    total: checks.length,
    passing,
    failed,
    pending,
    green,
    failing,
  };
  if (!green)
    log(
      `PR ${number} is not green: ${String(failed)} failed, ${String(pending)} pending, ${String(checks.length)} total`,
    );
  return { code: green ? EXIT.OK : EXIT.NO, out };
}

// ---------------------------------------------------------------------------
// scan-body / cross-check / transport-row
// ---------------------------------------------------------------------------

type Row = Record<string, unknown>;

/** The latest row of `type` in the log, or undefined. */
const lastRow = (rows: Row[], type: string) => rows.filter((r) => r.type === type).at(-1);

/** A capability value as the shell compared it: by its string form. */
function capability(v: unknown): boolean | null {
  const s = String(v);
  return s === "true" ? true : s === "false" ? false : null;
}

export const EXIT_UNREADABLE_COMMIT = 3;
/** Exit code (transport-row --scan): the landed commit's message could not be read. */
export const EXIT_SCAN_UNREADABLE = 8;

/**
 * Scan a landed commit's BODY for a CI-suppressing token. The subject is skipped on
 * purpose: a docs-only close carries `bkit [skip ci]` there by convention. The
 * defect is a squash body that concatenates branch commit subjects and so inherits
 * a token nobody meant to put on the shared branch.
 */
function scanBody(ctx: RunContext): number {
  const sha = refFlag(ctx.flags.sha, "sha");
  const remote = str(ctx.flags.remoteRef);
  if (remote !== undefined) {
    const fetched = runGit(ctx.cwd, ["fetch", "origin", refFlag(remote, "remote-ref")]);
    if (!fetched.ok) ctx.log(`git fetch origin ${remote} failed — scanning what is local`);
  }
  const token = bodySkipToken(ctx.cwd, sha);
  if (token === undefined) {
    ctx.log(`could not read the commit message for ${sha}`);
    return EXIT_UNREADABLE_COMMIT;
  }
  if (token) ctx.log(`landed commit ${sha} body inherited a CI-suppression token ${token}`);
  ctx.emit({ sha, scanResult: token ? "skip-token-found" : "clean", token });
  return token ? EXIT.NO : EXIT.OK;
}

const TRANSPORTS = ["git", "gh", "mcp"];

/**
 * A close that went through a mapped MCP tool while Step 1 recorded `gh` as
 * unavailable must have written a `transport-fallback` row. Only `mcp` is checked:
 * a `git` close needs no `gh`, so a laptop that never ran `gh auth login` closes fine.
 */
export function crossCheckFile(
  file: string,
  transport: string,
  log: (m: string) => void,
): { ok: boolean; runtimeGithubCli: boolean | null; transport: string; fallbackRows: number } {
  if (!TRANSPORTS.includes(transport)) {
    throw new CommandError(EXIT.USAGE, `--transport must be ${TRANSPORTS.join(", ")}`);
  }
  const rows = readStatusRows(file);
  const runtimeGithubCli = capability(lastRow(rows, "runtime-resolved")?.runtimeGithubCli);
  const fallbackRows = rows.filter((r) => r.type === "transport-fallback").length;
  const violated = runtimeGithubCli === false && transport === "mcp" && fallbackRows === 0;
  if (violated) {
    log(
      `runtime-resolved logged runtimeGithubCli=false and this close used transport mcp, but no transport-fallback row exists in ${file}`,
    );
  }
  return { ok: !violated, runtimeGithubCli, transport, fallbackRows };
}

function crossCheck(ctx: RunContext): number {
  const r = crossCheckFile(statusFile(ctx), String(ctx.flags.transport), ctx.log);
  ctx.emit({ ...r });
  return r.ok ? EXIT.OK : EXIT.NO;
}

/** Append a `close-transport` row: which close shape landed which commit, and its body scan. */
export function closeTransportRow(
  file: string,
  o: { shape: string; sha: string; scanResult: string },
): StatusRow {
  if (!SHAPES.includes(o.shape))
    throw new CommandError(EXIT.USAGE, `--shape must be ${SHAPES.join(", ")}`);
  if (!SCAN_RESULTS.includes(o.scanResult))
    throw new CommandError(EXIT.USAGE, `--scan-result must be ${SCAN_RESULTS.join(", ")}`);
  if (o.sha === "") throw new CommandError(EXIT.USAGE, "--kind=close needs a non-empty --sha");
  if (!fs.existsSync(file)) throw new CommandError(EXIT_NO_STATUS, `${file} does not exist`);
  const row: StatusRow = {
    type: "close-transport",
    shape: o.shape,
    sha: o.sha,
    scanResult: o.scanResult,
    at: statusTimestamp(),
  };
  fs.appendFileSync(file, appendLine(row));
  return row;
}

const SHAPES = ["local", "pr", "push"];
const SCAN_RESULTS = ["clean", "skip-token-found"];

function nonEmpty(ctx: RunContext, flag: string, key: string, allowed?: string[]): string {
  const v = str(ctx.flags[key]);
  if (v === undefined || v === "") {
    throw new CommandError(
      EXIT.USAGE,
      `--kind=${String(ctx.flags.kind)} needs a non-empty --${flag}`,
    );
  }
  if (allowed && !allowed.includes(v)) {
    throw new CommandError(EXIT.USAGE, `--${flag} must be ${allowed.join(", ")}`);
  }
  return v;
}

function transportRow(ctx: RunContext): number {
  const kind = String(ctx.flags.kind);
  const file = statusFile(ctx);
  if (kind === "close" && (ctx.flags.scan === true || ctx.flags.crossCheck !== undefined)) {
    return auditedClose(ctx, file);
  }
  let row: StatusRow;
  if (kind === "fallback") {
    row = {
      type: "transport-fallback",
      from: nonEmpty(ctx, "from", "from"),
      to: nonEmpty(ctx, "to", "to"),
      reason: nonEmpty(ctx, "reason", "reason"),
      assertedBy: nonEmpty(ctx, "asserted-by", "assertedBy"),
      at: statusTimestamp(),
    };
  } else if (kind === "close") {
    row = {
      type: "close-transport",
      shape: nonEmpty(ctx, "shape", "shape", SHAPES),
      sha: nonEmpty(ctx, "sha", "sha"),
      scanResult: nonEmpty(ctx, "scan-result", "scanResult", SCAN_RESULTS),
      at: statusTimestamp(),
    };
  } else {
    throw new CommandError(EXIT.USAGE, "--kind must be fallback or close");
  }
  if (!fs.existsSync(file)) throw new CommandError(EXIT_NO_STATUS, `${file} does not exist`);
  fs.appendFileSync(file, appendLine(row));
  ctx.emit({ row });
  return EXIT.OK;
}

/**
 * The whole close audit in one call: scan the landed commit's body (`--scan`),
 * cross-check the transport (`--cross-check`), write the close-transport row, and
 * refuse (exit 1) a landed body carrying a skip token — after recording it.
 */
function auditedClose(ctx: RunContext, file: string): number {
  const sha = refFlag(ctx.flags.sha, "sha");
  const shape = nonEmpty(ctx, "shape", "shape", SHAPES);
  let scanResult = str(ctx.flags.scanResult);
  if (ctx.flags.scan === true) {
    const remote = str(ctx.flags.remoteRef);
    if (
      remote !== undefined &&
      !runGit(ctx.cwd, ["fetch", "origin", refFlag(remote, "remote-ref")]).ok
    )
      ctx.log(`git fetch origin ${remote} failed — scanning what is local`);
    const token = bodySkipToken(ctx.cwd, sha);
    if (token === undefined) {
      ctx.log(`post-close body scan could not read ${sha}`);
      return EXIT_SCAN_UNREADABLE;
    }
    scanResult = token ? "skip-token-found" : "clean";
  }
  if (scanResult === undefined) throw new CommandError(EXIT.USAGE, "give --scan or --scan-result");
  const transport = str(ctx.flags.crossCheck);
  if (transport !== undefined) {
    const check = crossCheckFile(file, transport, ctx.log);
    if (!check.ok) {
      ctx.log("close transport cross-check failed");
      return EXIT.NO;
    }
  }
  const row = closeTransportRow(file, { shape, sha, scanResult });
  ctx.emit({ row });
  if (scanResult !== "clean") {
    ctx.log(`landed commit ${sha} inherited a CI-suppression token in its body`);
    return EXIT.NO;
  }
  return EXIT.OK;
}

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

const HEAD_FLAG: FlagSpec = {
  name: "head",
  type: "string",
  help: "head branch (default: the current branch)",
};
const BASE_FLAG: FlagSpec = { name: "base", type: "string", help: "base branch (default dev)" };

export const prsCommand: CommandSpec = {
  noun: "prs",
  summary: "Open and probe pull requests, and audit the close transport.",
  verbs: {
    open: {
      summary: "Open a PR whose body carries the bkit:issue / bkit:fid marker (exit 80: use MCP).",
      flags: [
        { name: "fid", type: "string", required: true, help: "feature id" },
        { name: "title", type: "string", required: true, help: "PR title (no skip-CI token)" },
        {
          name: "issue",
          type: "string",
          help: "issue id for the marker (github: 123 or #123; linear: ABC-123)",
        },
        BASE_FLAG,
        HEAD_FLAG,
        { name: "plan", type: "string", help: "plan path named in the body, when the file exists" },
        {
          name: "note",
          type: "string",
          repeatable: true,
          help: "line placed above the plan path in the bkit block",
        },
        {
          name: "existing",
          type: "string",
          help: "an open PR already on --head: fail (default, exit 3) | reuse",
        },
      ],
      output: {
        created: "true when this run created the PR",
        useMcp: "true when gh is unavailable: create it through MCP with title/body/base/head",
        number: "PR number, or null",
        url: "PR URL, or null",
        base: "base branch (read back from the PR when created)",
        head: "head branch",
        title: "PR title",
        body: "PR body, marker first",
      },
      exitCodes: {
        [EXIT_PR_EXISTS]: "--head already has an open PR (with --existing=fail)",
        [EXIT_SKIP_CI_TITLE]: "the title carries a CI-suppressing token",
        [EXIT_GH_FAILED]: "gh errored (probe, create after one retry, or read-back)",
        [EXIT_WRONG_BASE]: "the created PR's base is not --base",
      },
      run: (ctx) => {
        const existing = str(ctx.flags.existing);
        if (existing !== undefined && !["fail", "reuse"].includes(existing)) {
          throw new CommandError(EXIT.USAGE, "--existing must be fail or reuse");
        }
        return openPr(ctx);
      },
    },
    probe: {
      summary: "The open (or open-then-merged) PR for a branch, or one PR by number.",
      flags: [
        HEAD_FLAG,
        { name: "base", type: "string", help: "only PRs into this base (default: any base)" },
        { name: "state", type: "string", help: "open (default) | all: OPEN wins, then MERGED" },
        { name: "number", type: "string", help: "read this PR instead of listing by --head" },
      ],
      output: PR_OUTPUT_KEYS,
      exitCodes: { 4: "gh errored — the probe could not answer" },
      run: (ctx) => {
        const state = str(ctx.flags.state) ?? "open";
        if (state !== "open" && state !== "all") {
          throw new CommandError(EXIT.USAGE, "--state must be open or all");
        }
        const number = str(ctx.flags.number);
        if (number !== undefined && !/^[1-9][0-9]*$/.test(number)) {
          throw new CommandError(EXIT.USAGE, "--number must be a PR number");
        }
        const res = probePr(ctx.cwd, {
          number,
          state,
          head:
            number !== undefined
              ? undefined
              : ctx.flags.head === undefined
                ? currentBranch(ctx.cwd)
                : refFlag(ctx.flags.head, "head"),
          base: ctx.flags.base === undefined ? undefined : refFlag(ctx.flags.base, "base"),
        });
        if (res.kind !== "ok") {
          ctx.log(res.message);
          return res.kind === "unavailable" ? EXIT.USE_MCP : 4;
        }
        ctx.emit(prOutput(res.pr));
        return res.pr ? EXIT.OK : EXIT.NO;
      },
    },
    merge: {
      summary:
        "Squash-merge a PR with an empty body (skipped when already MERGED) and read its state back.",
      flags: [
        { name: "number", type: "string", required: true, help: "the PR number" },
        {
          name: "subject",
          type: "string",
          help: "squash subject (default: the PR title + ` (#N)`)",
        },
        {
          name: "match-head",
          type: "string",
          help: "--match-head-commit SHA: GitHub refuses the merge when the head moved",
        },
        { name: "delete-branch", type: "boolean", help: "delete the head branch after the merge" },
        {
          name: "label",
          type: "string",
          repeatable: true,
          help: "a label the issue carries now: bkit:auto appends ` bkit [auto route]` to the subject",
        },
        {
          name: "expect-merged",
          type: "boolean",
          help: "exit 7 when the PR did not reach MERGED (default: report it, exit 0)",
        },
      ],
      output: {
        merged: "the PR is MERGED",
        alreadyMerged: "it was MERGED before this call (no merge ran)",
        state: "OPEN | MERGED | CLOSED, or null when unread",
        mergeCommitOid: "the squash commit, or null",
        subject: "the squash subject used",
        verdict: "PASS when merged, else FAIL",
        failures: "0 when merged, else 1",
      },
      exitCodes: {
        [EXIT_GH_FAILED]: "gh could not read the PR",
        [EXIT_NOT_MERGED]: "--expect-merged and the PR did not reach MERGED",
      },
      run: (ctx) => {
        const number = String(ctx.flags.number);
        if (!/^[1-9][0-9]*$/.test(number))
          throw new CommandError(EXIT.USAGE, "--number must be a PR number");
        let subject = str(ctx.flags.subject);
        if (subject === undefined) {
          const pr = probePr(ctx.cwd, { number, state: "open" });
          if (pr.kind === "unavailable") {
            ctx.log(`${pr.message} — merge through merge_pull_request`);
            return EXIT.USE_MCP;
          }
          if (pr.kind === "failed" || !pr.pr) {
            ctx.log(pr.kind === "failed" ? pr.message : `PR #${number} not found`);
            return EXIT_GH_FAILED;
          }
          subject = `${pr.pr.title} (#${number})`;
        }
        if (((ctx.flags.label as string[] | undefined) ?? []).includes(AUTO_LABEL))
          subject += AUTO_ROUTE_SUFFIX;
        const r = mergePr(
          ctx.cwd,
          {
            number,
            subject,
            matchHead: str(ctx.flags.matchHead),
            deleteBranch: ctx.flags.deleteBranch === true,
          },
          ctx.log,
        );
        ctx.emit(r.out);
        if (r.code !== EXIT.OK) return r.code;
        return ctx.flags.expectMerged === true && !r.out.merged ? EXIT_NOT_MERGED : EXIT.OK;
      },
    },
    "update-branch": {
      summary:
        "Refresh a PR's head from its base server-side (exit 80: use update_pull_request_branch).",
      flags: [{ name: "number", type: "string", required: true, help: "the PR number" }],
      output: {
        number: "the PR number",
        updated: "the update request succeeded (true even when already up to date)",
      },
      exitCodes: {
        [EXIT_GH_FAILED]: "gh could not update the branch (403 = actions:write scope)",
      },
      run: (ctx) => {
        const number = String(ctx.flags.number);
        if (!/^[1-9][0-9]*$/.test(number))
          throw new CommandError(EXIT.USAGE, "--number must be a PR number");
        const r = updateBranch(ctx.cwd, number, ctx.log);
        if (r.out) ctx.emit(r.out);
        return r.code;
      },
    },
    checks: {
      summary:
        "A PR's check rollup, classified: green when present and none failed or pending (exit 80: use MCP).",
      flags: [{ name: "number", type: "string", required: true, help: "the PR number" }],
      output: {
        number: "the PR number",
        total: "checks in the rollup",
        passing: "checks that finished successfully (SUCCESS | NEUTRAL | SKIPPED)",
        failed: "checks that finished unsuccessfully",
        pending: "checks not yet finished",
        green: "total > 0 and no check failed or pending",
        failing: "names of the failed checks",
      },
      exitCodes: {
        [EXIT_CHECKS_UNREADABLE]: "gh could not read the PR's check rollup",
      },
      run: (ctx) => {
        const number = String(ctx.flags.number);
        if (!/^[1-9][0-9]*$/.test(number))
          throw new CommandError(EXIT.USAGE, "--number must be a PR number");
        const r = checksFor(ctx.cwd, number, ctx.log);
        if (r.out) ctx.emit({ ...r.out });
        return r.code;
      },
    },
    "verbose-ci": {
      summary:
        "Add ` bkit [verbose ci]` to a PR title, or strip it (with an optional `bkit ` prefix); a no-op when already so.",
      flags: [
        { name: "number", type: "string", required: true, help: "the PR number" },
        { name: "state", type: "string", required: true, help: "on | off" },
      ],
      output: {
        title: "the PR title now",
        changed: "the title was edited",
      },
      exitCodes: { [EXIT_GH_FAILED]: "gh could not read or edit the PR" },
      run: (ctx) => {
        const number = String(ctx.flags.number);
        if (!/^[1-9][0-9]*$/.test(number))
          throw new CommandError(EXIT.USAGE, "--number must be a PR number");
        const state = String(ctx.flags.state);
        if (!["on", "off"].includes(state))
          throw new CommandError(EXIT.USAGE, "--state must be on or off");
        const pr = probePr(ctx.cwd, { number, state: "open" });
        if (pr.kind === "unavailable") {
          ctx.log(`${pr.message} — edit the title through update_pull_request`);
          return EXIT.USE_MCP;
        }
        if (pr.kind === "failed" || !pr.pr) {
          ctx.log(pr.kind === "failed" ? pr.message : `PR #${number} not found`);
          return EXIT_GH_FAILED;
        }
        const title = pr.pr.title;
        const has = title.includes("[verbose ci]");
        const next =
          state === "on"
            ? has
              ? title
              : `${title} bkit [verbose ci]`
            : title.replace(/ ?(bkit )?\[verbose ci\]/, "");
        if (next === title) {
          ctx.emit({ title, changed: false });
          return EXIT.OK;
        }
        const edit = runGh(ctx.cwd, ["pr", "edit", number, "--title", next]);
        if (ghUnavailable(edit)) {
          ctx.log("gh unavailable for gh pr edit — edit the title through update_pull_request");
          return EXIT.USE_MCP;
        }
        if (!edit.ok) {
          ctx.log(`gh pr edit ${number} failed: ${edit.stderr}`);
          return EXIT_GH_FAILED;
        }
        ctx.emit({ title: next, changed: true });
        return EXIT.OK;
      },
    },
    "scan-body": {
      summary: "Check a landed commit's body (not its subject) for a CI-suppressing token.",
      flags: [
        { name: "sha", type: "string", required: true, help: "the landed commit" },
        {
          name: "remote-ref",
          type: "string",
          help: "fetch origin <ref> first (the close merged server-side), e.g. dev",
        },
      ],
      output: {
        sha: "the commit scanned",
        scanResult: "clean | skip-token-found",
        token: "the token found, or null",
      },
      exitCodes: { [EXIT_UNREADABLE_COMMIT]: "the commit message could not be read" },
      run: scanBody,
    },
    "cross-check": {
      summary: "An mcp close with gh recorded unavailable must have a transport-fallback row.",
      flags: [
        FILE_FLAG,
        {
          name: "transport",
          type: "string",
          required: true,
          help: "how the close landed: git | gh | mcp",
        },
      ],
      output: {
        ok: "false when the fallback row is missing",
        runtimeGithubCli: "runtimeGithubCli of the latest runtime-resolved row, or null",
        transport: "the transport checked",
        fallbackRows: "transport-fallback rows in the log",
      },
      exitCodes: { [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON" },
      run: crossCheck,
    },
    "transport-row": {
      summary: "Append a transport-fallback or close-transport audit row to status.jsonl.",
      flags: [
        FILE_FLAG,
        { name: "kind", type: "string", required: true, help: "fallback | close" },
        { name: "from", type: "string", help: "fallback: the gh command that was unavailable" },
        { name: "to", type: "string", help: "fallback: the MCP tool used instead" },
        { name: "reason", type: "string", help: "fallback: why, e.g. runtimeGithubCli=false" },
        {
          name: "asserted-by",
          type: "string",
          help: "fallback: how the fallback's effect was re-read",
        },
        { name: "shape", type: "string", help: "close: local | pr | push" },
        { name: "sha", type: "string", help: "close: the landed commit" },
        { name: "scan-result", type: "string", help: "close: clean | skip-token-found" },
        {
          name: "scan",
          type: "boolean",
          help: "close: scan --sha's body for a skip token instead of --scan-result; a token found is recorded, then exit 1",
        },
        { name: "remote-ref", type: "string", help: "close --scan: fetch origin <ref> first" },
        {
          name: "cross-check",
          type: "string",
          help: "close: first cross-check this transport (git | gh | mcp) against the runtime row; failing it exits 1 unrecorded",
        },
      ],
      output: { row: "the appended row" },
      exitCodes: {
        [EXIT_NO_STATUS]: "status.jsonl does not exist",
        [EXIT_SCAN_UNREADABLE]: "--scan: the commit message could not be read",
      },
      run: transportRow,
    },
  },
};
