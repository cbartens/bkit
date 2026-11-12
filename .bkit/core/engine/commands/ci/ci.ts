// bkit ci — the gates CI and the git hooks run.
//
// `slop` — the enforcing slop gate (`bkit:slop:delta`). `lint:slop` (`slop-scan scan`) only
// reports. This gate checks the base ref out as a detached worktree, runs
// `slop-scan delta` against the working tree, and fails when the change makes the repo
// worse on NET: more findings, or a higher score. It gates on the net figures, not on
// "added": slop-scan's delta is keyed by position, so editing above a pre-existing
// finding reports it as resolved at the old line and added at the new one, netting to
// zero. The pre-existing baseline is never the change's to fix. On failure it names each
// net-new or worsened finding (`path:line`, rule, message), with line shifts dropped.
//
// `prose` — the prose gate (`bkit:lint:prose`): Vale over tracked and unignored markdown,
// or explicit globs. Restores the gitignored write-good package from the main worktree (else
// `vale sync`) when it is missing, and fails when vale or write-good is unavailable.
//
// `skip-token` — whether a commit message carries a GitHub skip-CI token
// (`SKIP_CI_TOKEN`), for the `.husky/pre-push` CI-suppressor guard.
//
// `min-push` — whether every file a push changes is one bkit's workflows write (ship's bookkeeping
// allow-list, the plans tree) or one `bkit.testing.minPushPaths` / `ciSkipPaths` adds, so
// `.husky/pre-push` runs `bkit:gate:min`. Files decide, never `[skip ci]` (a typed label
// GitHub reads off the last commit only).
//
// `bookkeeping-push` — whether a feature-branch push adds bookkeeping only on top of the
// head the remote holds (ship's `--scope=pr` allow-list, the one `bkit ledgers
// only-bookkeeping` and the merge gate's carry-forward read). The `.husky/pre-push`
// CI-suppressor guard lets a `[skip ci]` head through to an open PR on exit 0: the PR's
// checks at the remote head still cover every line of code.
//
// `pins` — downloads each `*_VERSION` + `*_SHA256` pinned tool the files name and checks
// the hash, so a version-only Renovate bump goes red in its own PR (`pins.ts`).

import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { gitEnv } from "../../ledgers/telemetry.js";
import { readBkitConfig, type BkitConfig } from "../../shared/settings.js";
import {
  CommandError,
  commitMessage,
  EXIT,
  OUTPUT_LIMIT,
  git,
  parseJson,
  runGit,
  SKIP_CI_TOKEN,
  type CommandSpec,
  type RunContext,
} from "../lib.js";
import {
  bookPathspecs,
  changedOutside,
  checkOnlyBookkeeping,
  globPathspecs,
} from "../workflow/ledgers.js";
import { pins } from "./pins.js";
import { hasVerifiedIncrement, runPushGate } from "./push-gate.js";

/** Exit code: slop-scan could not be started (not installed, not executable). */
export const EXIT_SLOP_UNAVAILABLE = 3;
/** Exit code: slop-scan ran but failed, or its JSON lacks the fields the gate reads. */
export const EXIT_SLOP_FAILED = 4;
/** Exit code: the base ref could not be checked out as a worktree. */
export const EXIT_NO_WORKTREE = 5;
/** Exit code: vale could not run, or ended with a runtime error (its exit 2). */
export const EXIT_VALE_FAILED = 6;
/** Exit code: a pushed commit, its base, or its `git diff` could not be read. */
export const EXIT_RANGE_UNKNOWN = 7;

/** Branches whose merge-base with HEAD is the default base, in order. */
const BASE_CANDIDATES = ["origin/dev", "origin/main"];

/** A net score at or below this is float noise, not worsening. */
const SCORE_EPSILON = 0.001;

/**
 * Printed on failure: names the fixes to avoid (deleting files, rewiring callers,
 * casting to any). The casts are named in words; spelled as code, this string would
 * itself be a type-suppression finding.
 */
export const FAIL_GUIDANCE = [
  "FAIL — change adds/worsens slop on net.",
  "- ONLY fix net-new, NEVER the baseline. New lines matching existing patterns are consistent, NOT slop.",
  "- Type-suppression (any casts, double casts through unknown, @ts-* directives): Assert real type, else Record<string, unknown>, NEVER any; suppress only with written reason.",
  "- Structure/defensive (over-fragmentation, pass-through-wrapper, empty-catch, ...): Fix in place; NEVER delete/move/merge files or rewire callers to satisfy — refactors are separate decisions, NOT lint side effects.",
  "Inspect: slop-scan delta --base <base-worktree> --head .",
];

/** The `summary` fields the gate reads; each must be present. */
const SUMMARY_FIELDS = [
  "addedCount",
  "resolvedCount",
  "worsenedCount",
  "netFindingCount",
  "netRepoScore",
] as const;
type Summary = Record<(typeof SUMMARY_FIELDS)[number], number>;

const CLEANUP_SIGNALS: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];

/** First of `--base`, `$SLOP_BASE_REF`, merge-base with origin/dev or origin/main, `HEAD~1`, HEAD. */
export function resolveBaseRef(cwd: string, given: string | undefined): string {
  if (given) return given;
  for (const cand of BASE_CANDIDATES) {
    if (!runGit(cwd, ["rev-parse", "--verify", "--quiet", cand]).ok) continue;
    const mb = runGit(cwd, ["merge-base", "HEAD", cand]);
    if (mb.ok && mb.stdout) return mb.stdout;
  }
  const parent = runGit(cwd, ["rev-parse", "--verify", "--quiet", "HEAD~1"]);
  return parent.ok ? parent.stdout : runGit(cwd, ["rev-parse", "HEAD"]).stdout;
}

/**
 * `slop-scan` from PATH (a package script puts `node_modules/.bin` there), else the
 * locally installed package through npx; `--no-install` never reaches the network.
 */
export function slopScanArgv(env: NodeJS.ProcessEnv = process.env): string[] {
  return onPath("slop-scan", env) ? ["slop-scan"] : ["npx", "--no-install", "slop-scan"];
}

/** Whether `bin` resolves on PATH (`command -v`). */
function onPath(bin: string, env: NodeJS.ProcessEnv = process.env): boolean {
  return spawnSync("/bin/sh", ["-c", `command -v ${bin}`], { env }).status === 0;
}

/** The gate's figures from `slop-scan delta --json`, or the first field it lacks. */
export function readSummary(raw: string): Summary | { missing: string } {
  const parsed = parseJson(raw);
  // Not JSON at all: reported as the whole summary missing, same exit as a dropped field.
  if (!parsed.ok) return { missing: "summary (output is not JSON)" };
  const summary = (parsed.value as { summary?: unknown } | null)?.summary;
  if (typeof summary !== "object" || summary === null) return { missing: "summary" };
  const s = summary as Record<string, unknown>;
  const out = {} as Summary;
  for (const field of SUMMARY_FIELDS) {
    if (typeof s[field] !== "number") return { missing: `summary.${field}` };
    out[field] = s[field];
  }
  return out;
}

export const gateFails = (s: Summary): boolean =>
  s.netFindingCount > 0 || s.netRepoScore > SCORE_EPSILON;

/** A net-new or worsened finding, named for the log and the JSON output. */
export interface SlopFinding {
  status: "added" | "worsened";
  path: string | null;
  line: number | null;
  ruleId: string;
  message: string;
}

/** The fields of a `slop-scan delta --json` change the gate reads; any may be absent. */
interface DeltaChange {
  status?: unknown;
  path?: unknown;
  ruleId?: unknown;
  base?: DeltaSnapshot | null;
  head?: DeltaSnapshot | null;
}
interface DeltaSnapshot {
  message?: unknown;
  primaryLocation?: { line?: unknown } | null;
  locations?: { line?: unknown }[];
}

const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function toFinding(status: SlopFinding["status"], c: DeltaChange): SlopFinding {
  const loc = c.head?.primaryLocation ?? c.head?.locations?.[0];
  return {
    status,
    path: typeof c.path === "string" ? c.path : null,
    line: typeof loc?.line === "number" ? loc.line : null,
    ruleId: String(c.ruleId),
    message: typeof c.head?.message === "string" ? c.head.message : "",
  };
}

/**
 * The net-new and worsened findings in a `slop-scan delta --json` report. Grouped by file
 * and rule: a group that resolves as many as it adds is a line shift and is dropped; in a
 * group that adds more, each resolved finding cancels one added finding with the same
 * message, and the rest are listed. Empty when the report carries no change lists.
 */
export function netNewFindings(raw: string): SlopFinding[] {
  const parsed = parseJson(raw);
  if (!parsed.ok) return [];
  const report = parsed.value as { paths?: unknown; repoChanges?: unknown } | null;
  const changes = [
    ...asArray(report?.paths).flatMap((p) => asArray((p as { changes?: unknown })?.changes)),
    ...asArray(report?.repoChanges),
  ] as DeltaChange[];

  const groups = new Map<string, { added: DeltaChange[]; resolved: DeltaChange[] }>();
  const findings: SlopFinding[] = [];
  for (const c of changes) {
    if (c.status === "worsened") findings.push(toFinding("worsened", c));
    if (c.status !== "added" && c.status !== "resolved") continue;
    const key = `${String(c.path)}\0${String(c.ruleId)}`;
    const group = groups.get(key) ?? { added: [], resolved: [] };
    groups.set(key, group);
    group[c.status].push(c);
  }
  for (const { added, resolved } of groups.values()) {
    if (added.length <= resolved.length) continue;
    const left = [...added];
    for (const r of resolved) {
      const i = left.findIndex((a) => a.head?.message === r.base?.message);
      if (i >= 0) left.splice(i, 1);
    }
    findings.push(...left.map((c) => toFinding("added", c)));
  }
  return findings;
}

/** One log line per finding: status, `path:line`, rule, message. */
export function formatFindings(findings: SlopFinding[]): string[] {
  if (findings.length === 0) {
    return ["slop-scan's report names no single net-new finding; the rise is spread across files."];
  }
  return [
    "Net-new / worsened findings:",
    ...findings.map((f) => {
      const where = `${f.path ?? "(repo)"}${f.line === null ? "" : `:${f.line}`}`;
      return `  ${f.status.padEnd(8)}  ${where}  ${f.ruleId}  ${f.message}`.trimEnd();
    }),
  ];
}

/** Whether a failed slop-scan run means it never started, rather than that it failed. */
function couldNotRun(res: ReturnType<typeof spawnSync>, viaNpx: boolean): boolean {
  if ((res.error as NodeJS.ErrnoException | undefined)?.code === "ENOENT") return true;
  if (res.status === 126 || res.status === 127) return true;
  // npx exits 1 with this message when the package is not installed locally.
  return viaNpx && /could not determine executable/i.test(String(res.stderr ?? ""));
}

/** The last 20 lines of `text`. */
const tail = (text: string) => text.trim().split("\n").slice(-20).join("\n");

/**
 * Run `body`, then `cleanup` even if SIGINT / SIGTERM arrives meanwhile, then terminate as
 * the signal would. Without the listeners Node dies on the signal and leaves the base
 * worktree registered in the repo.
 */
export async function withCleanup<T>(body: () => T, cleanup: () => void): Promise<T> {
  const received: NodeJS.Signals[] = [];
  const onSignal = (sig: NodeJS.Signals) => received.push(sig);
  for (const sig of CLEANUP_SIGNALS) process.on(sig, onSignal);
  try {
    return body();
  } finally {
    cleanup();
    // A signal that arrived during a blocking spawn is dispatched on a later loop turn, and
    // one turn is not always enough: on Node 20 the first `setImmediate` runs before the
    // listener is called, so the signal looks absent and the process would run to completion
    // (reproduced on node:20). Give the loop a bounded number of turns to deliver a pending
    // signal before deciding.
    for (let turn = 0; turn < 10 && received.length === 0; turn++) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    for (const sig of CLEANUP_SIGNALS) process.off(sig, onSignal);
    if (received[0]) {
      // Exit with the conventional 128+signo rather than re-raising: Node keeps the libuv
      // signal watcher installed after the last listener is removed, so `process.kill(self,
      // sig)` is swallowed and the process runs to completion. A shell reads the same 143.
      process.exit(128 + (os.constants.signals[received[0]] ?? 0));
    }
  }
}

function slop(ctx: RunContext): Promise<number> | number {
  const top = runGit(ctx.cwd, ["rev-parse", "--show-toplevel"]);
  if (!top.ok) throw new CommandError(EXIT.USAGE, `not inside a git repository: ${ctx.cwd}`);
  const given = typeof ctx.flags.base === "string" ? ctx.flags.base : undefined;
  const baseRef = resolveBaseRef(ctx.cwd, given || process.env.SLOP_BASE_REF || undefined);
  const empty = {
    added: 0,
    resolved: 0,
    worsened: 0,
    netFindingCount: 0,
    netScore: 0,
    findings: [],
  };

  const sha = runGit(ctx.cwd, ["rev-parse", "--verify", "--quiet", `${baseRef}^{commit}`]);
  if (!sha.ok) {
    ctx.log(
      `base ref '${baseRef}' not found locally — fetch it (CI needs fetch-depth: 0). Skipping.`,
    );
    ctx.emit({ passed: true, skipped: "base-not-found", baseRef, base: null, ...empty });
    return EXIT.OK;
  }
  const base = sha.stdout;
  if (base === runGit(ctx.cwd, ["rev-parse", "HEAD"]).stdout) {
    ctx.log("base resolves to HEAD — no committed delta to check; skipping.");
    ctx.emit({ passed: true, skipped: "base-is-head", baseRef, base, ...empty });
    return EXIT.OK;
  }

  const wt = fs.mkdtempSync(path.join(os.tmpdir(), "slop-delta."));
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "slop-delta-out."));
  const outFile = path.join(outDir, "delta.json");
  const removeWorktree = () => {
    runGit(ctx.cwd, ["worktree", "remove", "--force", wt]);
    fs.rmSync(wt, { recursive: true, force: true });
    fs.rmSync(outDir, { recursive: true, force: true });
  };

  return withCleanup(() => {
    const added = runGit(ctx.cwd, ["worktree", "add", "-q", "--detach", wt, base]);
    if (!added.ok) {
      ctx.log(`could not check out base ${base} as a worktree: ${added.stderr}`);
      return EXIT_NO_WORKTREE;
    }
    ctx.log(`base ${base} (${baseRef}) vs working tree`);

    const argv = slopScanArgv();
    const viaNpx = argv[0] === "npx";
    // slop-scan calls process.exit right after writing its JSON. Into a pipe that
    // drops whatever is still buffered (about 64 KB survives); into a file the
    // write is synchronous, so the whole report lands.
    const outFd = fs.openSync(outFile, "w");
    let res: SpawnSyncReturns<string>;
    try {
      res = spawnSync(
        argv[0]!,
        [...argv.slice(1), "delta", "--base", wt, "--head", ".", "--json"],
        {
          cwd: top.stdout,
          encoding: "utf-8",
          stdio: ["ignore", outFd, "pipe"],
          maxBuffer: 1 << 28,
        },
      );
    } finally {
      fs.closeSync(outFd);
    }
    const stdout = fs.readFileSync(outFile, "utf-8");
    if (res.status !== 0) {
      if (couldNotRun(res, viaNpx)) {
        ctx.log(
          `slop-scan could not run (${argv.join(" ")}): install it as a dev dependency, or put it on PATH`,
        );
        return EXIT_SLOP_UNAVAILABLE;
      }
      ctx.log(
        `slop-scan delta failed (exit ${res.status ?? res.signal}):\n${tail(res.stderr ?? "")}`,
      );
      return EXIT_SLOP_FAILED;
    }
    const s = readSummary(stdout);
    if ("missing" in s) {
      ctx.log(
        `slop-scan delta --json has no ${s.missing} — its output format changed; refusing to pass a gate that would check nothing`,
      );
      return EXIT_SLOP_FAILED;
    }

    ctx.log(
      `added ${s.addedCount}, resolved ${s.resolvedCount}, worsened ${s.worsenedCount}; ` +
        `net findings ${s.netFindingCount}, net score ${s.netRepoScore.toFixed(2)}`,
    );
    const failed = gateFails(s);
    const findings = netNewFindings(stdout);
    for (const line of failed
      ? [...formatFindings(findings), ...FAIL_GUIDANCE]
      : ["OK — no net-new or worsened findings (baseline line-shifts ignored)."]) {
      ctx.log(line);
    }
    ctx.emit({
      passed: !failed,
      skipped: null,
      baseRef,
      base,
      added: s.addedCount,
      resolved: s.resolvedCount,
      worsened: s.worsenedCount,
      netFindingCount: s.netFindingCount,
      netScore: s.netRepoScore,
      findings,
    });
    return failed ? EXIT.NO : EXIT.OK;
  }, removeWorktree);
}

// ---------------------------------------------------------------------------
// prose
// ---------------------------------------------------------------------------

/** What `bkit ci prose` lints when no `--glob` is given. */
export const DEFAULT_PROSE_GLOBS = ["**/*.md"];

/** Folders the file walk never enters. */
const WALK_SKIP = new Set(["node_modules", ".git"]);

/** Vale's write-good package: gitignored, so absent in every fresh checkout and worktree. */
const WRITE_GOOD = path.join(".vale", "styles", "write-good");

/** A `/`-separated glob (`*`, `**`, `?`) as an anchored regex over `/`-separated paths. */
export function globToRegExp(glob: string): RegExp {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i]!;
    if (c === "*" && glob[i + 1] === "*") {
      const slash = glob[i + 2] === "/";
      re += slash ? "(?:.*/)?" : ".*";
      i += slash ? 2 : 1;
    } else if (c === "*") re += "[^/]*";
    else if (c === "?") re += "[^/]";
    else re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${re}$`);
}

/**
 * Where a glob's walk starts — its literal leading folders, `.` when it starts with a
 * wildcard — and how many levels below that it can match (unbounded with `**`).
 */
function globWalk(glob: string): { root: string; depth: number } {
  const parts = glob.split("/");
  const literal: string[] = [];
  for (const part of parts.slice(0, -1)) {
    if (/[*?]/.test(part)) break;
    literal.push(part);
  }
  return {
    root: literal.length > 0 ? literal.join("/") : ".",
    depth: glob.includes("**") ? Infinity : parts.length - literal.length,
  };
}

/**
 * Every file under `root` down to `depth` levels (relative to `cwd`, `/`-separated).
 * Skips WALK_SKIP folders and never follows a symlinked folder.
 */
function walkFiles(cwd: string, root: string, depth: number, skipCheckouts = false): string[] {
  const out: string[] = [];
  const visit = (rel: string, level: number) => {
    const abs = path.join(cwd, rel);
    if (!fs.lstatSync(abs, { throwIfNoEntry: false })) return;
    if (
      skipCheckouts &&
      rel !== "." &&
      fs.lstatSync(path.join(abs, ".git"), { throwIfNoEntry: false })
    )
      return;
    for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
      const child = rel === "." ? ent.name : `${rel}/${ent.name}`;
      if (ent.isDirectory()) {
        if (level < depth && !WALK_SKIP.has(ent.name)) visit(child, level + 1);
      } else if (ent.isFile() || ent.isSymbolicLink()) {
        out.push(child);
      }
    }
  };
  visit(root, 1);
  return out;
}

/** Default prose uses tracked and unignored files; explicit globs select directly from disk. */
export function proseFiles(cwd: string, globs?: readonly string[]): string[] {
  if (!globs) {
    let ancestor = path.resolve(cwd);
    while (!fs.lstatSync(path.join(ancestor, ".git"), { throwIfNoEntry: false })) {
      const parent = path.dirname(ancestor);
      if (parent === ancestor) {
        return walkFiles(cwd, ".", Infinity, true)
          .filter((rel) => rel.endsWith(".md"))
          .sort();
      }
      ancestor = parent;
    }
    const listed = spawnSync(
      "git",
      ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
      {
        cwd,
        encoding: "utf-8",
        env: gitEnv(),
        maxBuffer: OUTPUT_LIMIT,
      },
    );
    if (listed.error || listed.status !== 0) {
      throw new Error(`cannot list prose sources: ${listed.error?.message ?? listed.stderr}`);
    }
    return [...new Set(listed.stdout.split("\0"))]
      .filter((rel) => {
        if (!rel.endsWith(".md") || rel.split("/").some((part) => WALK_SKIP.has(part)))
          return false;
        for (let parent = path.dirname(rel); parent !== "."; parent = path.dirname(parent)) {
          const dir = fs.lstatSync(path.join(cwd, parent), { throwIfNoEntry: false });
          if (!dir?.isDirectory()) return false;
          if (fs.lstatSync(path.join(cwd, parent, ".git"), { throwIfNoEntry: false })) return false;
        }
        const stat = fs.lstatSync(path.join(cwd, rel), { throwIfNoEntry: false });
        return stat?.isFile() === true || stat?.isSymbolicLink() === true;
      })
      .sort();
  }
  const files = new Set<string>();
  for (const given of globs) {
    const glob = given.replace(/^\.\//, "");
    const re = globToRegExp(glob);
    const { root, depth } = globWalk(glob);
    for (const rel of walkFiles(cwd, root, depth)) {
      if (re.test(rel)) files.add(rel);
    }
  }
  return [...files].sort();
}

/**
 * Put write-good back when it is missing: copy it from the main worktree (no network),
 * else `vale sync`. True when it is present afterwards.
 */
function restoreWriteGood(ctx: RunContext): boolean {
  const target = path.join(ctx.cwd, WRITE_GOOD);
  if (fs.existsSync(target)) return true;
  ctx.log(".vale/styles/write-good absent (fresh checkout or worktree) - restoring");
  const common = git(ctx.cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
  const main = common ? path.join(path.dirname(common), WRITE_GOOD) : null;
  if (main && path.resolve(main) !== path.resolve(target) && fs.existsSync(main)) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.cpSync(main, target, { recursive: true });
    return true;
  }
  // vale's own report goes to stderr: stdout carries this command's one JSON object.
  spawnSync("vale", ["sync"], { cwd: ctx.cwd, stdio: ["ignore", 2, 2] });
  return fs.existsSync(target);
}

function prose(ctx: RunContext): number {
  const given = ctx.flags.glob;
  const globs = Array.isArray(given) && given.length > 0 ? given : DEFAULT_PROSE_GLOBS;
  const skip = (skipped: string, message: string) => {
    ctx.log(message);
    ctx.emit({ passed: true, skipped, files: 0 });
    return EXIT.OK;
  };
  const unavailable = (skipped: string, message: string) => {
    ctx.log(message);
    ctx.emit({ passed: false, skipped, files: 0 });
    return EXIT_VALE_FAILED;
  };
  if (!onPath("vale")) {
    return unavailable(
      "vale-missing",
      "vale not installed - prose lint unavailable (install vale, then run vale sync)",
    );
  }
  if (!restoreWriteGood(ctx)) {
    return unavailable(
      "write-good-missing",
      "PROSE LINT UNAVAILABLE: vale is installed but .vale/styles/write-good could not be restored (main-worktree copy and vale sync both failed). Run: vale sync",
    );
  }
  let files: string[];
  try {
    files = proseFiles(ctx.cwd, globs === DEFAULT_PROSE_GLOBS ? undefined : globs);
    for (const rel of files) fs.accessSync(path.join(ctx.cwd, rel), fs.constants.R_OK);
  } catch (error) {
    return unavailable("source-unavailable", `PROSE LINT UNAVAILABLE: ${String(error)}`);
  }
  if (files.length === 0) {
    return skip("no-files", `no files match ${globs.join(" ")} - nothing to lint`);
  }
  const res = spawnSync("vale", files, { cwd: ctx.cwd, stdio: ["ignore", 2, 2] });
  if (res.error || (res.status !== 0 && res.status !== 1)) {
    ctx.log(`vale failed (${res.error?.message ?? `exit ${res.status ?? res.signal}`})`);
    return EXIT_VALE_FAILED;
  }
  const passed = res.status === 0;
  ctx.emit({ passed, skipped: null, files: files.length });
  return passed ? EXIT.OK : EXIT.NO;
}

// ---------------------------------------------------------------------------
// skip-token
// ---------------------------------------------------------------------------

function skipToken(ctx: RunContext): number {
  const ref = typeof ctx.flags.ref === "string" && ctx.flags.ref !== "" ? ctx.flags.ref : "HEAD";
  const sha = git(ctx.cwd, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
  const message = sha ? commitMessage(ctx.cwd, sha) : null;
  if (!sha || message === null) {
    throw new CommandError(EXIT.USAGE, `cannot read commit '${ref}' in ${ctx.cwd}`);
  }
  const token = SKIP_CI_TOKEN.exec(message)?.[0] ?? null;
  ctx.emit({ ref, sha, token });
  return token === null ? EXIT.NO : EXIT.OK;
}

// ---------------------------------------------------------------------------
// min-push
// ---------------------------------------------------------------------------

/**
 * The min-push pathspecs: ship's `pr` bookkeeping allow-list for every month and feature
 * (the same list `bkit ci bookkeeping-push` and the ship gate accept untested, including
 * `bkit.testing.ciSkipPaths`), the plans tree bkit's workflows write, and whatever the repo
 * adds in `bkit.testing.minPushPaths` (`:(glob)` unless an entry carries its own magic).
 * The engine hardcodes no consumer file: the floor is what bkit itself writes.
 */
export function minPushPathspecs(cfg: Pick<BkitConfig, "minPushPaths" | "ciSkipPaths">): string[] {
  return [
    ...bookPathspecs("*", "*", "pr", cfg.ciSkipPaths),
    ...globPathspecs(["docs/plans/**", ...cfg.minPushPaths]),
  ];
}

/** Where a pushed commit's range starts: its merge-base with origin/dev, else origin/main. */
export function pushBase(cwd: string, sha: string): string | null {
  for (const cand of BASE_CANDIDATES) {
    if (!runGit(cwd, ["rev-parse", "--verify", "--quiet", cand]).ok) continue;
    const mb = runGit(cwd, ["merge-base", sha, cand]);
    if (mb.ok && mb.stdout) return mb.stdout;
  }
  return null;
}

function minPush(ctx: RunContext): number {
  const top = runGit(ctx.cwd, ["rev-parse", "--show-toplevel"]);
  if (!top.ok) throw new CommandError(EXIT.USAGE, `not inside a git repository: ${ctx.cwd}`);
  const given = ctx.flags.ref;
  const refs = Array.isArray(given) && given.length > 0 ? given.map(String) : ["HEAD"];
  const baseFlag = typeof ctx.flags.base === "string" && ctx.flags.base ? ctx.flags.base : null;
  const paths = minPushPathspecs(readBkitConfig(top.stdout));
  const updates = ctx.flags.update;
  if (Array.isArray(updates) && updates.length > 0) {
    if ((Array.isArray(given) && given.length > 0) || baseFlag) {
      throw new CommandError(EXIT.USAGE, "--update cannot be combined with --ref or --base");
    }
    return minPushUpdates(ctx, top.stdout, updates.map(String), paths);
  }

  const changed = new Set<string>();
  const outside = new Set<string>();
  for (const ref of refs) {
    const sha = git(ctx.cwd, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
    const base = sha ? (baseFlag ?? pushBase(ctx.cwd, sha)) : null;
    const diff = sha && base ? changedOutside(top.stdout, base, sha, paths) : null;
    if (!diff?.ok) {
      const why = !sha
        ? `cannot read commit '${ref}'`
        : !base
          ? `no base for ${ref} (neither origin/dev nor origin/main resolves)`
          : `'git diff' failed for ${base}..${ref}: ${diff && !diff.ok ? diff.stderr : ""}`;
      ctx.log(`${why} — not proven a min push`);
      ctx.emit({ minPush: false, reason: "unknown", changed: 0, outside: [], paths });
      return EXIT_RANGE_UNKNOWN;
    }
    for (const p of diff.changed) changed.add(p);
    for (const p of diff.outside) outside.add(p);
  }

  const result = (reason: string | null, code: number, message: string) => {
    ctx.log(message);
    ctx.emit({
      minPush: reason === null,
      reason,
      changed: changed.size,
      outside: [...outside].sort(),
      paths,
    });
    return code;
  };
  if (changed.size === 0) {
    return result("no-changes", EXIT.NO, "the push changes no files — not proven a min push");
  }
  if (outside.size > 0) {
    const first = [...outside].sort()[0];
    return result(
      "outside",
      EXIT.NO,
      `${outside.size} of ${changed.size} changed files match no min-push path (first: ${first})`,
    );
  }
  return result(null, EXIT.OK, `all ${changed.size} changed files match min-push paths`);
}

function minPushUpdates(ctx: RunContext, cwd: string, updates: string[], paths: string[]): number {
  const changed = new Set<string>();
  const outside = new Set<string>();
  let unknown = false;
  let failed = false;
  for (const update of updates) {
    const pair = /^([0-9a-f]{40}|[0-9a-f]{64}):([0-9a-f]{40}|[0-9a-f]{64})$/.exec(update);
    if (!pair) throw new CommandError(EXIT.USAGE, "--update requires <old-sha>:<new-sha>");
    const oldSha = pair[1]!;
    const newSha = pair[2]!;
    const isNew = /^0+$/.test(oldSha);
    if (!isNew && !runGit(cwd, ["merge-base", "--is-ancestor", oldSha, newSha]).ok) {
      failed = true;
      unknown = true;
      continue;
    }
    const increment = isNew ? null : changedOutside(cwd, oldSha, newSha, paths);
    const base = pushBase(cwd, newSha);
    const whole = base ? changedOutside(cwd, base, newSha, paths) : null;
    if (hasVerifiedIncrement(cwd, oldSha, newSha, paths)) {
      if (increment?.ok) for (const file of increment.changed) changed.add(file);
      ctx.log(`${oldSha}..${newSha}: covered by a successful full push gate`);
      continue;
    }
    if (whole?.ok) {
      for (const file of whole.changed) changed.add(file);
      for (const file of whole.outside) outside.add(file);
      if (
        whole.changed.length > 0 &&
        whole.outside.length === 0 &&
        (isNew || (increment?.ok && increment.changed.length > 0))
      )
        continue;
    } else unknown = true;
    failed = true;
  }
  const reason = !failed ? null : unknown ? "unknown" : outside.size ? "outside" : "no-changes";
  ctx.emit({
    minPush: !failed,
    reason,
    changed: changed.size,
    outside: [...outside].sort(),
    paths,
  });
  ctx.log(
    failed
      ? "push is not covered by minimum paths or verified full-gate proof"
      : "every update qualifies for the minimum push gate",
  );
  return !failed ? EXIT.OK : unknown ? EXIT_RANGE_UNKNOWN : EXIT.NO;
}

// ---------------------------------------------------------------------------
// bookkeeping-push
// ---------------------------------------------------------------------------

/** A feature branch, as the workflows name one; the FID is the slug after `feat/`. */
const FEAT_BRANCH = /^feat\/([a-z0-9][a-z0-9-]*)$/;

function bookkeepingPush(ctx: RunContext): number {
  const top = runGit(ctx.cwd, ["rev-parse", "--show-toplevel"]);
  if (!top.ok) throw new CommandError(EXIT.USAGE, `not inside a git repository: ${ctx.cwd}`);
  const from = String(ctx.flags.from);
  const toRef = typeof ctx.flags.to === "string" && ctx.flags.to !== "" ? ctx.flags.to : "HEAD";
  const branch =
    typeof ctx.flags.branch === "string" && ctx.flags.branch !== ""
      ? ctx.flags.branch
      : (git(ctx.cwd, ["rev-parse", "--abbrev-ref", "HEAD"]) ?? "");
  const result = (reason: string | null, code: number, outside: string[], message: string) => {
    ctx.log(message);
    ctx.emit({ bookkeepingPush: reason === null, reason, branch, from, to: toRef, outside });
    return code;
  };
  const fid = FEAT_BRANCH.exec(branch)?.[1];
  if (fid === undefined) {
    return result(
      "not-a-feature-branch",
      EXIT.NO,
      [],
      `'${branch}' is not a feat/{FID} branch — not a bookkeeping push`,
    );
  }
  if (/^0+$/.test(from)) {
    return result(
      "no-remote-head",
      EXIT.NO,
      [],
      "the remote holds no head for this branch — nothing to carry CI forward from",
    );
  }
  // Every plan month: the hook knows the branch, not the run's `{YYYYMM}`.
  const check = checkOnlyBookkeeping(top.stdout, { month: "*", fid, from, to: toRef });
  switch (check.kind) {
    case "ok":
      return result(null, EXIT.OK, [], `every file changed in ${from}..${toRef} is bookkeeping`);
    case "not-ancestor":
      return result(
        "not-ancestor",
        EXIT.NO,
        [],
        `${from} is not an ancestor of ${toRef} — the push rewrites the PR head`,
      );
    case "outside":
      return result(
        "outside",
        EXIT.NO,
        check.outside,
        `${check.outside.length} changed file(s) outside the bookkeeping allow-list (first: ${check.outside[0]})`,
      );
    case "unknown-commit":
      throw new CommandError(EXIT_RANGE_UNKNOWN, `cannot read commit '${check.ref}'`);
    case "diff-failed":
      throw new CommandError(
        EXIT_RANGE_UNKNOWN,
        `'git diff' failed for ${from}..${toRef}: ${check.stderr}`,
      );
  }
}

export const ciCommand: CommandSpec = {
  noun: "ci",
  summary: "Gates CI and the git hooks run.",
  verbs: {
    slop: {
      summary: "Fail when the working tree adds or worsens slop on net against a base ref.",
      use: "by-hand",
      flags: [
        {
          name: "base",
          type: "string",
          positional: true,
          help: "base ref (default: $SLOP_BASE_REF, else merge-base with origin/dev or origin/main, else HEAD~1)",
        },
      ],
      output: {
        passed: "false when the change adds or worsens slop on net",
        skipped: "base-not-found | base-is-head when there was nothing to compare, else null",
        baseRef: "the ref compared against, as resolved",
        base: "its commit SHA (null when not found)",
        added: "findings added (raw; a line-shift counts here)",
        resolved: "findings resolved (raw)",
        worsened: "findings worsened",
        netFindingCount: "net change in finding count — gated on",
        netScore: "net change in slop score — gated on",
        findings:
          "net-new and worsened findings ({status, path, line, ruleId, message}); line shifts dropped",
      },
      exitCodes: {
        [EXIT_SLOP_UNAVAILABLE]: "slop-scan could not run (not installed or not executable)",
        [EXIT_SLOP_FAILED]: "slop-scan failed, or its JSON lacks the fields the gate reads",
        [EXIT_NO_WORKTREE]: "the base ref could not be checked out as a worktree",
      },
      run: slop,
    },
    prose: {
      summary:
        "Run Vale over tracked and unignored Markdown, or explicit globs; fail when sources, Vale or required styles are unavailable.",
      use: "by-hand",
      flags: [
        {
          name: "glob",
          type: "string",
          repeatable: true,
          help: "files to lint, relative to the working directory (`*`, `**`, `?`; node_modules skipped; default `**/*.md`)",
        },
      ],
      output: {
        passed: "false when vale reported alerts or required tooling is unavailable",
        skipped: "vale-missing | write-good-missing | no-files when nothing was linted, else null",
        files: "how many files vale linted",
      },
      exitCodes: {
        [EXIT_VALE_FAILED]: "vale could not run, or ended with a runtime error",
      },
      run: prose,
    },
    "skip-token": {
      summary: "Whether a commit message carries a GitHub skip-CI token ([skip ci] and kin).",
      use: "by-hand",
      flags: [{ name: "ref", type: "string", help: "commit to read (default HEAD)" }],
      output: {
        ref: "the ref read",
        sha: "its commit SHA",
        token: "the first skip-CI token in the message, else null",
      },
      run: skipToken,
    },
    "min-push": {
      summary:
        "Exit 0 when every file a push changes is one bkit writes or bkit.testing.minPushPaths / ciSkipPaths adds (the pre-push light gate).",
      use: "by-hand",
      flags: [
        {
          name: "ref",
          type: "string",
          repeatable: true,
          help: "a pushed commit (default HEAD); its range starts at its merge-base with origin/dev, else origin/main",
        },
        { name: "base", type: "string", help: "start every range here instead" },
        {
          name: "update",
          type: "string",
          repeatable: true,
          help: "actual <old-sha>:<new-sha> push update; permits verified bookkeeping increments; excludes --ref and --base",
        },
      ],
      output: {
        minPush: "true when every changed file matches a min-push path",
        reason: "null when a min push; else no-changes | outside | unknown",
        changed: "files the push changes, across every ref",
        outside: "the changed files no min-push path matches",
        paths:
          "the min-push pathspecs in force: ship's pr bookkeeping allow-list (with bkit.testing.ciSkipPaths), docs/plans/**, bkit.testing.minPushPaths",
      },
      exitCodes: {
        [EXIT_RANGE_UNKNOWN]: "a pushed commit, its base, or its git diff could not be read",
      },
      run: minPush,
    },
    "push-gate": {
      summary:
        "Run a consumer push gate and record successful full-gate proof for the exact clean commit.",
      use: "by-hand",
      flags: [
        {
          name: "gate",
          type: "string",
          required: true,
          help: "consumer package script to execute",
        },
      ],
      output: { gate: "the script executed", passed: "whether it exited zero" },
      run: (ctx) => {
        const gate = String(ctx.flags.gate);
        const status = runPushGate(ctx.cwd, gate, ctx.log);
        ctx.emit({ gate, passed: status === 0 });
        return status;
      },
    },
    "bookkeeping-push": {
      summary:
        "Exit 0 when a feature-branch push adds bookkeeping only on top of the remote head (ship's --scope=pr allow-list).",
      use: "by-hand",
      flags: [
        {
          name: "from",
          type: "string",
          required: true,
          help: "the head the remote holds (git's remote sha on the hook's stdin)",
        },
        { name: "to", type: "string", help: "the head being pushed (default HEAD)" },
        {
          name: "branch",
          type: "string",
          help: "the feat/{FID} branch (default the current branch); the FID picks the plan log dir",
        },
      ],
      output: {
        bookkeepingPush: "true when every file changed in from..to is bookkeeping",
        reason:
          "null when bookkeeping only; else not-a-feature-branch | no-remote-head | not-ancestor | outside",
        branch: "the branch read",
        from: "the remote head as given",
        to: "the pushed head as given",
        outside: "the changed files outside the allow-list",
      },
      exitCodes: {
        [EXIT_RANGE_UNKNOWN]: "a commit or the git diff could not be read",
      },
      run: bookkeepingPush,
    },
    pins: {
      summary:
        "Download each *_VERSION + *_SHA256 pinned tool in the files and fail when a hash differs.",
      use: "by-hand",
      flags: [
        {
          name: "file",
          type: "string",
          repeatable: true,
          help: "a file holding pins (shell `X=v`, `export X=v`, Dockerfile `ARG X=v`)",
        },
      ],
      output: {
        passed: "false when any pin failed",
        pins: "one row per pin ({file, tool, version, url, status, expected, actual, error}); status ok | skipped (no download) | mismatch | unreachable | missing-sha256 | missing-version | unresolved-url | ambiguous-url",
      },
      run: (ctx) => pins(ctx),
    },
  },
};
