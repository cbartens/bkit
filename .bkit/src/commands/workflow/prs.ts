// bkit prs open|probe|guard-checkout|scan-body|cross-check|transport-row — the
// pull-request side of a phase close, and the close audit trail.
//
// `gh` is the only transport `open` and `probe` drive. When it is missing or not
// logged in (`gh` exits 4) they exit 80 instead, and `open` still prints the title
// and body, so the workflow makes the same call through the GitHub MCP tool. Every
// PR `open` creates carries the `bkit:issue` / `bkit:fid` marker: `/bkit-auto`
// reads it first and only guesses from the branch name when it is missing.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

import { parseIssueTracker, type IssueTracker } from "../../bkit-manifest.js";
import { readBkitConfig } from "../shared/config.js";
import { appendLine, statusTimestamp, type StatusRow } from "../../bkit-status.js";
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
import { EXIT_NO_STATUS, FILE_FLAG, readStatusRows, statusFile, str } from "./status.js";

// ---------------------------------------------------------------------------
// gh
// ---------------------------------------------------------------------------

const PR_FIELDS = "number,url,state,baseRefName,headRefName,headRefOid,title,mergeCommit";

interface PrInfo {
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

type Probe =
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
function probePr(
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

function prOutput(pr: PrInfo | undefined) {
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

function openPr(ctx: RunContext): number {
  const tracker = str(ctx.flags.tracker) ?? readBkitConfig(repoRoot(ctx.cwd)).issueTracker;
  if (parseIssueTracker(tracker) === null) {
    throw new CommandError(EXIT.USAGE, "--tracker must be github, linear, or none");
  }
  const issue = str(ctx.flags.issue);
  if (tracker === "none" && issue !== undefined) ctx.log("--issue ignored: no tracker wired");
  const marker = prMarker(tracker as IssueTracker, String(ctx.flags.fid), issue);

  const title = String(ctx.flags.title);
  if (title.trim() === "") throw new CommandError(EXIT.USAGE, "--title must be non-empty");
  const token = SKIP_CI_TOKEN.exec(title);
  if (token) {
    ctx.log(`refusing: PR title carries the CI-suppressing token ${token[0]} — CI would never run`);
    return EXIT_SKIP_CI_TITLE;
  }

  const base = refFlag(ctx.flags.base ?? "dev", "base");
  const head =
    ctx.flags.head === undefined ? currentBranch(ctx.cwd) : refFlag(ctx.flags.head, "head");
  if (head === base || head === "dev" || head === "main") {
    throw new CommandError(EXIT.USAGE, `refusing to open a PR from "${head}" into "${base}"`);
  }

  let plan = str(ctx.flags.plan);
  if (plan !== undefined && !fs.existsSync(path.resolve(ctx.cwd, plan))) {
    ctx.log(`plan ${plan} not present — PR body names no plan`);
    plan = undefined;
  }
  const notes = (ctx.flags.note as string[] | undefined) ?? [];
  const body = prBody(marker, notes, plan);
  const viaMcp = (why: string) => {
    ctx.log(`${why} — create the PR through the GitHub MCP tool with this title and body`);
    ctx.emit({ created: false, useMcp: true, number: null, url: null, base, head, title, body });
    return EXIT.USE_MCP;
  };

  const existing = probePr(ctx.cwd, { head, base, state: "open" });
  if (existing.kind === "unavailable") return viaMcp(existing.message);
  if (existing.kind === "failed") {
    ctx.log(existing.message);
    return EXIT_GH_FAILED;
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
    if (ctx.flags.existing === "reuse") {
      ctx.log(`reusing open PR #${existing.pr.number} on ${head}`);
      ctx.emit(out);
      return EXIT.OK;
    }
    ctx.log(
      `${head} already has open PR #${existing.pr.number} to ${base} — refusing to blind-create (resume via /bkit-debug or close the stale PR)`,
    );
    ctx.emit(out);
    return EXIT_PR_EXISTS;
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
  let created = runGh(ctx.cwd, createArgs);
  if (!created.ok && !ghUnavailable(created)) {
    ctx.log(
      `gh pr create failed (${created.stderr || `exit ${String(created.status)}`}) — retrying once`,
    );
    created = runGh(ctx.cwd, createArgs);
  }
  if (ghUnavailable(created)) return viaMcp("gh unavailable for gh pr create");
  if (!created.ok) {
    ctx.log(`gh pr create failed twice: ${created.stderr || `exit ${String(created.status)}`}`);
    return EXIT_GH_FAILED;
  }

  // gh prints the new PR's URL; reading the PR back is what proves its base.
  const url = created.stdout.split("\n").at(-1) ?? "";
  const back = probePr(ctx.cwd, { number: url, state: "open" });
  if (back.kind !== "ok" || !back.pr) {
    ctx.log(
      `created ${url} but could not read it back: ${back.kind === "ok" ? "empty" : back.message}`,
    );
    return EXIT_GH_FAILED;
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
  ctx.emit(out);
  if (back.pr.baseRefName !== base) {
    ctx.log(`PR #${back.pr.number} targets ${back.pr.baseRefName}, not ${base}`);
    return EXIT_WRONG_BASE;
  }
  return EXIT.OK;
}

// ---------------------------------------------------------------------------
// guard-checkout
// ---------------------------------------------------------------------------

export const EXIT_GUARD_REFUSED = 4;
export const EXIT_DETACHED = 5;
export const EXIT_CHECKOUT_FAILED = 6;
export const EXIT_RUN_FAILED = 7;
export const EXIT_RESTORE_FAILED = 8;

type Row = Record<string, unknown>;

/** The latest row of `type` in the log, or undefined. */
const lastRow = (rows: Row[], type: string) => rows.filter((r) => r.type === type).at(-1);

/** A capability value as the shell compared it: by its string form. */
function capability(v: unknown): boolean | null {
  const s = String(v);
  return s === "true" ? true : s === "false" ? false : null;
}

function guardCheckout(ctx: RunContext): number {
  const target = refFlag(ctx.flags.target, "target");
  const command = String(ctx.flags.run);
  if (command.trim() === "") throw new CommandError(EXIT.USAGE, "--run must be non-empty");

  const rows = readStatusRows(statusFile(ctx));
  const resolved = lastRow(rows, "runtime-resolved");
  const worktrees = capability(resolved?.runtimeWorktrees);
  const devPushes = capability(resolved?.runtimeDevPushes);
  if (worktrees !== true || devPushes !== true) {
    ctx.log(
      `refusing local checkout: runtimeWorktrees=${String(worktrees ?? "unset")} runtimeDevPushes=${String(devPushes ?? "unset")} — both must be true to check out "${target}" locally`,
    );
    return EXIT_GUARD_REFUSED;
  }

  const original = git(ctx.cwd, ["branch", "--show-current"]) ?? "";
  if (original === "") {
    ctx.log(
      `could not resolve the current branch (detached HEAD?) — refusing to check out "${target}"`,
    );
    return EXIT_DETACHED;
  }
  const checkout = runGit(ctx.cwd, ["checkout", target]);
  if (!checkout.ok) {
    ctx.log(`git checkout ${target} failed: ${checkout.stderr}`);
    return EXIT_CHECKOUT_FAILED;
  }

  // The restore runs whatever the command did, so a failed or killed step never
  // strands the session on the shared branch. git gets the name as one argv entry,
  // never through a shell, so a branch named `x'$(…)'y` stays a name.
  let runExitCode: number | null = null;
  let restored = false;
  try {
    const res = spawnSync("sh", ["-c", command], { cwd: ctx.cwd, encoding: "utf-8" });
    runExitCode = res.status;
    for (const line of `${res.stdout ?? ""}${res.stderr ?? ""}`.split("\n")) {
      if (line !== "") ctx.log(line);
    }
  } finally {
    const back = runGit(ctx.cwd, ["checkout", original]);
    restored = back.ok;
    if (!restored) ctx.log(`RESTORE FAILED: git checkout ${original}: ${back.stderr}`);
  }
  ctx.emit({ target, originalBranch: original, restored, runExitCode });
  if (!restored) return EXIT_RESTORE_FAILED;
  return runExitCode === 0 ? EXIT.OK : EXIT_RUN_FAILED;
}

// ---------------------------------------------------------------------------
// scan-body / cross-check / transport-row
// ---------------------------------------------------------------------------

export const EXIT_UNREADABLE_COMMIT = 3;

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
function crossCheck(ctx: RunContext): number {
  const transport = String(ctx.flags.transport);
  if (!TRANSPORTS.includes(transport)) {
    throw new CommandError(EXIT.USAGE, `--transport must be ${TRANSPORTS.join(", ")}`);
  }
  const rows = readStatusRows(statusFile(ctx));
  const runtimeGithubCli = capability(lastRow(rows, "runtime-resolved")?.runtimeGithubCli);
  const fallbackRows = rows.filter((r) => r.type === "transport-fallback").length;
  const violated = runtimeGithubCli === false && transport === "mcp" && fallbackRows === 0;
  if (violated) {
    ctx.log(
      `runtime-resolved logged runtimeGithubCli=false and this close used transport mcp, but no transport-fallback row exists in ${statusFile(ctx)}`,
    );
  }
  ctx.emit({ ok: !violated, runtimeGithubCli, transport, fallbackRows });
  return violated ? EXIT.NO : EXIT.OK;
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
  const file = statusFile(ctx);
  if (!fs.existsSync(file)) throw new CommandError(EXIT_NO_STATUS, `${file} does not exist`);
  fs.appendFileSync(file, appendLine(row));
  ctx.emit({ row });
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
  summary:
    "Open and probe pull requests, guard a local close checkout, and audit the close transport.",
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
        {
          name: "tracker",
          type: "string",
          help: "github | linear | none (default: package.json bkit.issueTracker)",
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
    "guard-checkout": {
      summary: "Check out a shared branch, run one command, restore the original branch.",
      flags: [
        { ...FILE_FLAG, help: "status.jsonl whose runtime-resolved row must allow the checkout" },
        { name: "target", type: "string", required: true, help: "branch to check out, e.g. dev" },
        {
          name: "run",
          type: "string",
          required: true,
          help: "shell command run while --target is checked out",
        },
      ],
      output: {
        target: "branch that was checked out",
        originalBranch: "branch restored afterwards",
        restored: "whether the restore succeeded",
        runExitCode: "exit code of --run",
      },
      exitCodes: {
        [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON",
        [EXIT_GUARD_REFUSED]:
          "runtime-resolved does not record runtimeWorktrees AND runtimeDevPushes true",
        [EXIT_DETACHED]: "detached HEAD: nothing to restore to",
        [EXIT_CHECKOUT_FAILED]: "git checkout --target failed",
        [EXIT_RUN_FAILED]: "--run exited non-zero (branch restored)",
        [EXIT_RESTORE_FAILED]: "the original branch could not be restored",
      },
      run: guardCheckout,
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
        { name: "reason", type: "string", help: "fallback: why, e.g. RUNTIME_GITHUBCLI=false" },
        {
          name: "asserted-by",
          type: "string",
          help: "fallback: how the fallback's effect was re-read",
        },
        { name: "shape", type: "string", help: "close: local | pr | push" },
        { name: "sha", type: "string", help: "close: the landed commit" },
        { name: "scan-result", type: "string", help: "close: clean | skip-token-found" },
      ],
      output: { row: "the appended row" },
      exitCodes: { [EXIT_NO_STATUS]: "status.jsonl does not exist" },
      run: transportRow,
    },
  },
};
