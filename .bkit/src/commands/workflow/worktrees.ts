// bkit worktrees setup|remove — the feature worktree's lifecycle.
//
// `setup` is Step 2 of every phase workflow: mint or resume `.worktrees/{fid}`,
// or adopt the current branch in place when the runtime cannot mint (no
// `--worktrees`). A command cannot change its caller's directory, so it reports
// `worktreePath` for the workflow to `cd` into. A resume rebase that stops on a
// conflict is left in progress for `bkit branches rebase`; this command only
// reports it. `remove` is the close / cleanup half: `--owned-only` keeps it to
// worktrees a workflow created, marked in the git common dir's outbox so the
// marker outlives the worktree it describes.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

import { gitEnv } from "../../bkit-telemetry.js";
import { readBkitConfig } from "../shared/config.js";
import { COULD_NOT_RUN_EXIT_CODES, installCommand } from "../shared/package-manager.js";
import { CommandError, EXIT, git, repoRoot, runGit, type CommandSpec } from "../lib.js";
import { WORKFLOW_FLAG } from "./status.js";

const WORKFLOWS = ["design", "plan", "build", "debug", "ship"];
/** Design and plan run no project code, so their worktrees get no dependencies. */
const INSTALLS = new Set(["build", "debug", "ship"]);
const DEV = "dev";
const ORIGIN_DEV = `origin/${DEV}`;

export const EXIT_REBASE_CONFLICT = 3;
export const EXIT_FETCH = 4;
export const EXIT_INSTALL = 5;
export const EXIT_INSTALL_COULD_NOT_RUN = 6;
export const EXIT_REFUSED = 7;
export const EXIT_WORKTREE_ADD = 8;
export const EXIT_REBASE_NOT_STARTED = 9;
export const EXIT_NOT_A_WORKTREE = 10;
export const EXIT_REMOVE = 11;

const FID_FLAG = { name: "fid", type: "string", required: true, help: "feature id" } as const;

function fidOf(value: unknown): string {
  const fid = String(value);
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(fid) || fid.includes("..")) {
    throw new CommandError(EXIT.USAGE, `--fid "${fid}" is not a feature id`);
  }
  return fid;
}

export const worktreeDir = (root: string, fid: string) => path.join(root, ".worktrees", fid);

/** `.worktree-owned` in the git common dir's outbox: shared by every worktree, survives removal. */
export function ownershipMarker(root: string, fid: string): string {
  const common = git(root, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
  if (!common) throw new CommandError(EXIT.USAGE, `not inside a git repository: ${root}`);
  return path.join(common, "bkit-outbox", fid, ".worktree-owned");
}

const logDirOf = (top: string, month: string, fid: string) =>
  path.join(top, "docs", "plans", month, "logs", fid);

const real = (p: string) => (fs.existsSync(p) ? fs.realpathSync(p) : path.resolve(p));

// ---------------------------------------------------------------------------
// Branches
// ---------------------------------------------------------------------------

const hasLocal = (cwd: string, branch: string) =>
  runGit(cwd, ["show-ref", "--verify", "--quiet", `refs/heads/${branch}`]).ok;

/**
 * Whether `origin` has `branch`. `ls-remote --exit-code` exits 2 for "no such
 * ref", so a network or auth failure is told apart from absence: a failed probe
 * must not be read as "absent" and mint a second branch beside the real one.
 */
function remoteHas(cwd: string, branch: string): "yes" | "no" | "error" {
  const res = spawnSync("git", ["ls-remote", "--exit-code", "--heads", "origin", branch], {
    cwd,
    encoding: "utf-8",
    env: gitEnv(),
  });
  if (res.status === 0) return "yes";
  return res.status === 2 ? "no" : "error";
}

/**
 * Fetch `branch` into its remote-tracking ref. The explicit refspec matters: a
 * bare `git fetch origin dev` writes only FETCH_HEAD when the clone's fetch
 * refspec does not cover `dev`, leaving `origin/dev` stale, and a branch cut
 * from it silently builds against superseded work.
 */
function fetchBranch(cwd: string, branch: string): void {
  const res = runGit(cwd, [
    "fetch",
    "origin",
    `+refs/heads/${branch}:refs/remotes/origin/${branch}`,
  ]);
  if (!res.ok) {
    throw new CommandError(EXIT_FETCH, `could not fetch origin ${branch}: ${res.stderr}`);
  }
}

/** Ship's branch: the one the prompt names, else `feat/{fid}` when it exists, else the session's. */
function shipBranch(root: string, fid: string, named: string | undefined, session: string) {
  if (named) return named;
  const feat = `feat/${fid}`;
  if (hasLocal(root, feat) || remoteHas(root, feat) === "yes") return feat;
  return session === DEV || session === "main" || session === "" ? feat : session;
}

/**
 * `git worktree add` for `branch`: the local branch, else a tracking branch off
 * `origin`, else (when `mayCreate`) a new branch off a freshly fetched
 * `origin/dev`. Returns false when there was nothing to add and `mayCreate` is off.
 */
function addWorktree(root: string, wt: string, branch: string, mayCreate: boolean): boolean {
  let args: string[];
  if (hasLocal(root, branch)) {
    args = [wt, branch];
  } else {
    const remote = remoteHas(root, branch);
    if (remote === "error") {
      throw new CommandError(EXIT_FETCH, `could not ask origin whether ${branch} exists`);
    }
    if (remote === "yes") {
      fetchBranch(root, branch);
      args = [wt, "--track", "-b", branch, `origin/${branch}`];
    } else if (mayCreate) {
      fetchBranch(root, DEV);
      args = [wt, "-b", branch, ORIGIN_DEV];
    } else {
      return false;
    }
  }
  const res = runGit(root, ["worktree", "add", ...args]);
  if (!res.ok) throw new CommandError(EXIT_WORKTREE_ADD, `git worktree add failed: ${res.stderr}`);
  return true;
}

function rebaseInProgress(wt: string): boolean {
  return ["rebase-merge", "rebase-apply"].some((p) => {
    const dir = git(wt, ["rev-parse", "--path-format=absolute", "--git-path", p]);
    return dir !== null && fs.existsSync(dir);
  });
}

// ---------------------------------------------------------------------------
// Copy and install
// ---------------------------------------------------------------------------

/** Copy each `worktreeCopy` entry from the main checkout; a missing one is narrated, never fatal. */
function copyListed(root: string, wt: string, entries: string[], log: (m: string) => void) {
  const copied: string[] = [];
  const copyMissing: string[] = [];
  for (const entry of entries) {
    const rel = path.normalize(entry);
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      log(`worktree copy: ${entry} is outside the main checkout — skipped`);
      continue;
    }
    const src = path.join(root, rel);
    if (!fs.existsSync(src)) {
      log(`worktree copy: ${rel} is not in the main checkout — skipped`);
      copyMissing.push(rel);
      continue;
    }
    const dest = path.join(wt, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.cpSync(src, dest, { recursive: true });
    copied.push(rel);
  }
  return { copied, copyMissing };
}

/** Run the frozen install in `wt`; the exit status, with a spawn failure read as "could not run". */
function install(wt: string, log: (m: string) => void): number {
  const [cmd, ...args] = installCommand({ frozen: true });
  const res = spawnSync(cmd!, args, { cwd: wt, encoding: "utf-8", maxBuffer: 1 << 26 });
  const status = res.error ? 127 : (res.status ?? 1);
  if (status !== 0) {
    const tail = `${res.stdout ?? ""}${res.stderr ?? ""}`.trim().split("\n").slice(-20);
    for (const line of tail) log(line);
  }
  return status;
}

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

export const worktreesCommand: CommandSpec = {
  noun: "worktrees",
  summary: "Set up and remove the per-feature worktrees under .worktrees/.",
  verbs: {
    setup: {
      summary: "Create, resume or adopt the feature's worktree (Step 2 — Worktree Setup).",
      flags: [
        WORKFLOW_FLAG,
        FID_FLAG,
        { name: "month", type: "string", required: true, help: "month bucket, YYYYMM" },
        {
          name: "worktrees",
          type: "boolean",
          help: "this runtime mints worktrees (runtimeWorktrees=true); absent = adopt the current branch in place",
        },
        {
          name: "branch",
          type: "string",
          help: "ship only: the branch the session prompt names (default: feat/{fid} when it exists, else the session branch)",
        },
      ],
      output: {
        worktreePath: "directory the workflow must cd into",
        repoRoot: "the main checkout",
        branch: "branch checked out at worktreePath",
        mode: "created | resumed | adopted",
        owned: "the .worktree-owned marker is present (a workflow created this worktree)",
        rebaseConflict:
          "a resume rebase onto origin/dev stopped on a conflict and is left in progress",
        sentinel: "the .rebase-failed sentinel written on a failed rebase, else null",
        logDir: "docs/plans/{month}/logs/{fid} under worktreePath (created)",
        baseSha: "git merge-base origin/dev HEAD at worktreePath, or null",
        copied: "worktree copy entries copied from the main checkout",
        copyMissing: "worktree copy entries absent from the main checkout",
        installed: "dependencies were installed",
      },
      exitCodes: {
        [EXIT_REBASE_CONFLICT]:
          "resume rebase stopped on a conflict, left in progress — run `bkit branches rebase`, then re-run setup; on its failure, Failure Path",
        [EXIT_FETCH]: "could not fetch from origin",
        [EXIT_INSTALL]: "dependency install failed",
        [EXIT_INSTALL_COULD_NOT_RUN]: "the package manager could not run (exit 126 / 127)",
        [EXIT_REFUSED]:
          "refused: dev / main as the working branch, detached HEAD, or ship could not switch to its branch",
        [EXIT_WORKTREE_ADD]: "git worktree add failed",
        [EXIT_REBASE_NOT_STARTED]: "resume rebase could not start (e.g. uncommitted changes)",
        [EXIT_NOT_A_WORKTREE]: ".worktrees/{fid} exists but is not a registered git worktree",
      },
      run: (ctx) => {
        const f = ctx.flags;
        const workflow = String(f.workflow);
        if (!WORKFLOWS.includes(workflow)) {
          throw new CommandError(EXIT.USAGE, `--workflow must be ${WORKFLOWS.join("|")}`);
        }
        const fid = fidOf(f.fid);
        const month = String(f.month);
        if (!/^[0-9]{6}$/.test(month)) throw new CommandError(EXIT.USAGE, "--month must be YYYYMM");
        const named = f.branch === undefined ? undefined : String(f.branch);
        if (named !== undefined && workflow !== "ship") {
          throw new CommandError(EXIT.USAGE, "--branch is ship only");
        }
        if (named !== undefined && !runGit(ctx.cwd, ["check-ref-format", "--branch", named]).ok) {
          throw new CommandError(EXIT.USAGE, `--branch "${named}" is not a valid branch name`);
        }

        const root = repoRoot(ctx.cwd);
        const config = readBkitConfig(root);
        const session = git(ctx.cwd, ["branch", "--show-current"]) ?? "";
        if (workflow === "debug" && session === "") {
          throw new CommandError(
            EXIT_REFUSED,
            "detached HEAD — check out a branch before debugging",
          );
        }
        const target = workflow === "ship" ? shipBranch(root, fid, named, session) : `feat/${fid}`;
        if (target === DEV || target === "main") {
          throw new CommandError(EXIT_REFUSED, `refusing to ship ${target} as a feature branch`);
        }

        // Ship mints only when the session is not already on the branch it ships:
        // that branch cannot be checked out in two places.
        const mint = f.worktrees === true && !(workflow === "ship" && session === target);
        const wtDir = worktreeDir(root, fid);
        let mode: "created" | "resumed" | "adopted" = "adopted";
        if (mint) {
          runGit(root, ["worktree", "prune"]);
          if (fs.existsSync(wtDir)) {
            // A plain directory there would resolve to the main checkout's repo,
            // and the rebase below would rewrite the main checkout's branch.
            if (real(git(wtDir, ["rev-parse", "--show-toplevel"]) ?? "") !== real(wtDir)) {
              throw new CommandError(
                EXIT_NOT_A_WORKTREE,
                `${wtDir} is not a registered git worktree`,
              );
            }
            mode = "resumed";
          } else if (workflow !== "debug" || session !== target) {
            // Debug adopts an existing feat/{fid}; it never mints a branch of its own.
            if (addWorktree(root, wtDir, target, workflow !== "debug")) mode = "created";
          }
        }
        const wt = mode === "adopted" ? root : wtDir;
        const logDir = logDirOf(wt, month, fid);
        const marker = ownershipMarker(root, fid);

        if (mode === "adopted") {
          if (workflow === "ship" && git(root, ["branch", "--show-current"]) !== target) {
            const sw = runGit(root, ["switch", target]);
            if (!sw.ok) {
              throw new CommandError(
                EXIT_REFUSED,
                `adopt mode: cannot switch to ${target} — commit or stash local changes, then re-run (${sw.stderr})`,
              );
            }
          }
          const here = git(root, ["branch", "--show-current"]) ?? "";
          const refused = workflow === "debug" ? "main" : DEV;
          if (here === "" || here === refused) {
            throw new CommandError(
              EXIT_REFUSED,
              here === ""
                ? "adopt mode: detached HEAD — check out the feature branch"
                : `adopt mode: current branch is ${here} — refusing to work in place on ${here}`,
            );
          }
        }

        let rebaseConflict = false;
        let sentinel: string | null = null;
        const sentinelPath = path.join(logDir, ".rebase-failed");
        if (mode === "resumed" && workflow !== "ship") {
          // Cleared before every attempt: a sentinel left by an earlier run would
          // send this one to the Failure Path after a clean rebase.
          fs.rmSync(sentinelPath, { force: true });
          let failure: { conflict: boolean; detail: string } | undefined;
          if (rebaseInProgress(wt)) {
            failure = { conflict: true, detail: "a rebase is already in progress" };
          } else {
            fetchBranch(wt, DEV);
            const rb = runGit(wt, ["rebase", "--rebase-merges", ORIGIN_DEV]);
            if (!rb.ok) {
              failure = {
                conflict: rebaseInProgress(wt),
                detail: [rb.stdout, rb.stderr].filter(Boolean).join("\n"),
              };
            }
          }
          if (failure) {
            fs.mkdirSync(logDir, { recursive: true });
            fs.appendFileSync(
              path.join(logDir, "rebase-resolve-log.md"),
              `[bkit-worktrees] ${new Date().toISOString()} rebase onto ${ORIGIN_DEV} stopped\n${failure.detail}\n`,
            );
            fs.writeFileSync(sentinelPath, "");
            ctx.log(`rebase onto ${ORIGIN_DEV} failed in ${wt}: ${failure.detail.split("\n")[0]}`);
            rebaseConflict = failure.conflict;
            sentinel = sentinelPath;
          }
        }

        fs.mkdirSync(logDir, { recursive: true });
        if (mode === "created") {
          fs.mkdirSync(path.dirname(marker), { recursive: true });
          fs.writeFileSync(marker, "");
        }
        const done = sentinel === null && mode !== "adopted";
        const { copied, copyMissing } = done
          ? copyListed(root, wt, config.worktreeCopy, ctx.log)
          : { copied: [], copyMissing: [] };
        const wantInstall = done && config.worktreeInstall && INSTALLS.has(workflow);
        const installStatus = wantInstall ? install(wt, ctx.log) : 0;

        ctx.emit({
          worktreePath: wt,
          repoRoot: root,
          branch: git(wt, ["branch", "--show-current"]) ?? "",
          mode,
          owned: fs.existsSync(marker),
          rebaseConflict,
          sentinel,
          logDir,
          baseSha: git(wt, ["merge-base", ORIGIN_DEV, "HEAD"]),
          copied,
          copyMissing,
          installed: wantInstall && installStatus === 0,
        });
        if (sentinel !== null)
          return rebaseConflict ? EXIT_REBASE_CONFLICT : EXIT_REBASE_NOT_STARTED;
        if (COULD_NOT_RUN_EXIT_CODES.has(installStatus)) {
          ctx.log(
            `the package manager could not run (exit ${installStatus}) — dependencies not installed`,
          );
          return EXIT_INSTALL_COULD_NOT_RUN;
        }
        if (installStatus !== 0) {
          ctx.log(`dependency install failed (exit ${installStatus})`);
          return EXIT_INSTALL;
        }
        return EXIT.OK;
      },
    },
    remove: {
      summary: "Remove .worktrees/{fid} and prune stale worktree entries.",
      flags: [
        FID_FLAG,
        {
          name: "owned-only",
          type: "boolean",
          help: "remove only a worktree carrying the .worktree-owned marker (one a workflow created)",
        },
      ],
      output: {
        removed: "the worktree was removed",
        reason: "why it was not: absent | not-owned; null when removed",
        worktreePath: "the worktree's path",
        repoRoot: "the main checkout — cd here if the shell was inside the removed worktree",
      },
      exitCodes: { [EXIT_REMOVE]: "git worktree remove failed" },
      run: (ctx) => {
        const fid = fidOf(ctx.flags.fid);
        const root = repoRoot(ctx.cwd);
        const wt = worktreeDir(root, fid);
        const marker = ownershipMarker(root, fid);
        const result = (removed: boolean, reason: string | null) => {
          ctx.emit({ removed, reason, worktreePath: wt, repoRoot: root });
          return EXIT.OK;
        };
        if (!fs.existsSync(wt)) {
          runGit(root, ["worktree", "prune"]);
          return result(false, "absent");
        }
        if (ctx.flags.ownedOnly === true && !fs.existsSync(marker)) {
          ctx.log(`${wt} exists but has no ownership marker (${marker}) — not ours, left in place`);
          return result(false, "not-owned");
        }
        const inside = !path.relative(real(wt), real(ctx.cwd)).startsWith("..");
        const res = runGit(root, ["worktree", "remove", "--force", wt]);
        if (!res.ok)
          throw new CommandError(EXIT_REMOVE, `git worktree remove failed: ${res.stderr}`);
        runGit(root, ["worktree", "prune"]);
        fs.rmSync(marker, { force: true });
        if (inside) ctx.log(`the working directory was inside ${wt} — cd to ${root}`);
        return result(true, null);
      },
    },
  },
};
