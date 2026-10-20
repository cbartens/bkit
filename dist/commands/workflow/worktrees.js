// bkit worktrees setup|remove — the feature worktree's lifecycle.
//
// `setup` is Step 2 of every phase workflow: mint or resume `.worktrees/{fid}`,
// or adopt the current branch in place when the runtime cannot mint (no
// `--worktrees`). A command cannot change its caller's directory, so it reports
// `worktreePath` for the workflow to `cd` into. A resume rebase that stops on a
// conflict is left in progress for `bkit branches rebase`; this command only
// reports it. `remove` is the close / cleanup half: it removes only a worktree a
// workflow created, marked in the git common dir's outbox so the marker outlives
// the worktree it describes, and with `--branch` deletes the feature branch
// unless another worktree still holds it.
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { gitEnv } from "../../ledgers/telemetry.js";
import { readBkitConfig } from "../../shared/settings.js";
import { COULD_NOT_RUN_EXIT_CODES, installCommand } from "../../shared/package-manager.js";
import { CommandError, DEV, EXIT, git, isSharedBranch, repoRoot, runGit, } from "../lib.js";
import { ensureDiskSpace } from "./disk.js";
import { detect } from "./runtime.js";
import { WORKFLOW_FLAG } from "./status.js";
const WORKFLOWS = ["design", "plan", "build", "debug", "ship"];
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
export const EXIT_DISK_FULL = 12;
const FID_FLAG = { name: "fid", type: "string", required: true, help: "feature id" };
function fidOf(value) {
    const fid = String(value);
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(fid) || fid.includes("..")) {
        throw new CommandError(EXIT.USAGE, `--fid "${fid}" is not a feature id`);
    }
    return fid;
}
export const worktreeDir = (root, fid) => path.join(root, ".worktrees", fid);
/** `.worktree-owned` in the git common dir's outbox: shared by every worktree, survives removal. */
export function ownershipMarker(root, fid) {
    const common = git(root, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
    if (!common)
        throw new CommandError(EXIT.USAGE, `not inside a git repository: ${root}`);
    return path.join(common, "bkit-outbox", fid, ".worktree-owned");
}
const logDirOf = (top, month, fid) => path.join(top, "docs", "plans", month, "logs", fid);
const real = (p) => (fs.existsSync(p) ? fs.realpathSync(p) : path.resolve(p));
// ---------------------------------------------------------------------------
// Branches
// ---------------------------------------------------------------------------
const hasLocal = (cwd, branch) => runGit(cwd, ["show-ref", "--verify", "--quiet", `refs/heads/${branch}`]).ok;
/**
 * Whether `origin` has `branch`. `ls-remote --exit-code` exits 2 for "no such
 * ref", so a network or auth failure is told apart from absence: a failed probe
 * must not be read as "absent" and mint a second branch beside the real one.
 */
function remoteHas(cwd, branch) {
    const res = spawnSync("git", ["ls-remote", "--exit-code", "--heads", "origin", branch], {
        cwd,
        encoding: "utf-8",
        env: gitEnv(),
    });
    if (res.status === 0)
        return "yes";
    return res.status === 2 ? "no" : "error";
}
/**
 * Fetch `branch` into its remote-tracking ref. The explicit refspec matters: a
 * bare `git fetch origin dev` writes only FETCH_HEAD when the clone's fetch
 * refspec does not cover `dev`, leaving `origin/dev` stale, and a branch cut
 * from it silently builds against superseded work.
 */
function fetchBranch(cwd, branch) {
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
function shipBranch(root, fid, named, session) {
    if (named)
        return named;
    const feat = `feat/${fid}`;
    if (hasLocal(root, feat) || remoteHas(root, feat) === "yes")
        return feat;
    return isSharedBranch(session) || session === "" ? feat : session;
}
/**
 * `git worktree add` for `branch`: the local branch, else a tracking branch off
 * `origin`, else (when `mayCreate`) a new branch off a freshly fetched
 * `origin/dev`. Returns false when there was nothing to add and `mayCreate` is off.
 */
function addWorktree(root, wt, branch, mayCreate) {
    let args;
    if (hasLocal(root, branch)) {
        args = [wt, branch];
    }
    else {
        const remote = remoteHas(root, branch);
        if (remote === "error") {
            throw new CommandError(EXIT_FETCH, `could not ask origin whether ${branch} exists`);
        }
        if (remote === "yes") {
            fetchBranch(root, branch);
            args = [wt, "--track", "-b", branch, `origin/${branch}`];
        }
        else if (mayCreate) {
            fetchBranch(root, DEV);
            args = [wt, "-b", branch, ORIGIN_DEV];
        }
        else {
            return false;
        }
    }
    const res = runGit(root, ["worktree", "add", ...args]);
    if (!res.ok)
        throw new CommandError(EXIT_WORKTREE_ADD, `git worktree add failed: ${res.stderr}`);
    return true;
}
function rebaseInProgress(wt) {
    return ["rebase-merge", "rebase-apply"].some((p) => {
        const dir = git(wt, ["rev-parse", "--path-format=absolute", "--git-path", p]);
        return dir !== null && fs.existsSync(dir);
    });
}
// ---------------------------------------------------------------------------
// Copy and install
// ---------------------------------------------------------------------------
/** Copy each `worktreeCopy` entry from the main checkout; a missing one is narrated, never fatal. */
function copyListed(root, wt, entries, log) {
    const copied = [];
    const copyMissing = [];
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
function install(wt, log) {
    const [cmd, ...args] = installCommand({ frozen: true });
    const res = spawnSync(cmd, args, { cwd: wt, encoding: "utf-8", maxBuffer: 1 << 26 });
    const status = res.error ? 127 : (res.status ?? 1);
    if (status !== 0) {
        const tail = `${res.stdout ?? ""}${res.stderr ?? ""}`.trim().split("\n").slice(-20);
        for (const line of tail)
            log(line);
    }
    return status;
}
// ---------------------------------------------------------------------------
// Branch cleanup
// ---------------------------------------------------------------------------
/** The worktree (main checkout included) with `branch` checked out, else null. */
export function worktreeHolding(root, branch) {
    const list = git(root, ["worktree", "list", "--porcelain"]) ?? "";
    let current = null;
    for (const line of list.split("\n")) {
        if (line.startsWith("worktree "))
            current = line.slice("worktree ".length);
        else if (line === `branch refs/heads/${branch}` && current !== null)
            return current;
    }
    return null;
}
/**
 * Delete `branch` locally and on origin. A worktree still holding it blocks
 * both deletes: the local one would fail, and the remote one would strand that
 * worktree's branch without its upstream.
 */
function deleteBranch(root, branch, log) {
    const holder = worktreeHolding(root, branch);
    if (holder !== null) {
        log(`${branch} is checked out in ${holder} (not a workflow worktree) — local and remote branch left in place`);
        return { branchDeleted: false, remoteDeleted: false, branchBlockedBy: holder };
    }
    if (hasLocal(root, branch)) {
        const del = runGit(root, ["branch", "-D", branch]);
        if (!del.ok)
            log(`git branch -D ${branch} failed: ${del.stderr}`);
    }
    const remote = runGit(root, ["push", "origin", "--delete", branch]);
    if (!remote.ok)
        log(`git push origin --delete ${branch} failed or it was already gone`);
    runGit(root, ["fetch", "--prune", "origin"]);
    return {
        branchDeleted: !hasLocal(root, branch),
        remoteDeleted: remote.ok,
        branchBlockedBy: null,
    };
}
/**
 * Remove `.worktrees/{fid}` when a workflow created it (the ownership marker),
 * prune stale entries, then delete `branch` locally and on origin unless another
 * worktree holds it. Throws EXIT_REMOVE when `git worktree remove` fails.
 */
export function removeWorktree(cwd, fid, branch, log) {
    if (branch !== undefined && isSharedBranch(branch)) {
        throw new CommandError(EXIT.USAGE, `refusing to delete branch ${branch}`);
    }
    const root = repoRoot(cwd);
    const wt = worktreeDir(root, fid);
    const marker = ownershipMarker(root, fid);
    const result = (removed, reason) => {
        const cleanup = branch === undefined ? null : deleteBranch(root, branch, log);
        return {
            removed,
            reason,
            worktreePath: wt,
            repoRoot: root,
            branchDeleted: cleanup?.branchDeleted ?? null,
            remoteDeleted: cleanup?.remoteDeleted ?? null,
            branchBlockedBy: cleanup?.branchBlockedBy ?? null,
        };
    };
    if (!fs.existsSync(wt)) {
        runGit(root, ["worktree", "prune"]);
        return result(false, "absent");
    }
    if (!fs.existsSync(marker)) {
        log(`${wt} exists but has no ownership marker (${marker}) — not ours, left in place`);
        return result(false, "not-owned");
    }
    const inside = !path.relative(real(wt), real(cwd)).startsWith("..");
    const res = runGit(root, ["worktree", "remove", "--force", wt]);
    if (!res.ok)
        throw new CommandError(EXIT_REMOVE, `git worktree remove failed: ${res.stderr}`);
    runGit(root, ["worktree", "prune"]);
    fs.rmSync(marker, { force: true });
    if (inside)
        log(`the working directory was inside ${wt} — cd to ${root}`);
    return result(true, null);
}
// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------
export const worktreesCommand = {
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
                    name: "detect",
                    type: "boolean",
                    help: "detect runtimeWorktrees here (`bkit runtime detect`) instead of passing --worktrees",
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
                rebaseConflict: "a resume rebase onto origin/dev stopped on a conflict and is left in progress",
                sentinel: "the .rebase-failed sentinel written on a failed rebase, else null",
                logDir: "docs/plans/{month}/logs/{fid} under worktreePath (created)",
                baseSha: "git merge-base origin/dev HEAD at worktreePath, or null",
                copied: "worktree copy entries copied from the main checkout",
                copyMissing: "worktree copy entries absent from the main checkout",
                installed: "dependencies were installed",
            },
            exitCodes: {
                [EXIT_REBASE_CONFLICT]: "resume rebase stopped on a conflict, left in progress — run `bkit branches rebase`, then re-run setup; on its failure, Failure Path",
                [EXIT_FETCH]: "could not fetch from origin",
                [EXIT_INSTALL]: "dependency install failed",
                [EXIT_INSTALL_COULD_NOT_RUN]: "the package manager could not run (exit 126 / 127)",
                [EXIT_REFUSED]: "refused: dev / main as the working branch, detached HEAD, or ship could not switch to its branch",
                [EXIT_WORKTREE_ADD]: "git worktree add failed",
                [EXIT_REBASE_NOT_STARTED]: "resume rebase could not start (e.g. uncommitted changes)",
                [EXIT_NOT_A_WORKTREE]: ".worktrees/{fid} exists but is not a registered git worktree",
                [EXIT_DISK_FULL]: "free disk under bkit.disk.minFreeGb even after your max cleanup steps (`bkit disk prune`); nothing created",
            },
            run: async (ctx) => {
                const f = ctx.flags;
                const workflow = String(f.workflow);
                if (!WORKFLOWS.includes(workflow)) {
                    throw new CommandError(EXIT.USAGE, `--workflow must be ${WORKFLOWS.join("|")}`);
                }
                const fid = fidOf(f.fid);
                const month = String(f.month);
                if (!/^[0-9]{6}$/.test(month))
                    throw new CommandError(EXIT.USAGE, "--month must be YYYYMM");
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
                    throw new CommandError(EXIT_REFUSED, "detached HEAD — check out a branch before debugging");
                }
                const target = workflow === "ship" ? shipBranch(root, fid, named, session) : `feat/${fid}`;
                if (isSharedBranch(target)) {
                    throw new CommandError(EXIT_REFUSED, `refusing to ship ${target} as a feature branch`);
                }
                // Ship mints only when the session is not already on the branch it ships:
                // that branch cannot be checked out in two places.
                if (f.worktrees === true && f.detect === true)
                    throw new CommandError(EXIT.USAGE, "give --worktrees or --detect, not both");
                const worktrees = f.detect === true
                    ? detect(ctx.cwd, root, ctx.log).runtimeWorktrees
                    : f.worktrees === true;
                const mint = worktrees && !(workflow === "ship" && session === target);
                const wtDir = worktreeDir(root, fid);
                let mode = "adopted";
                if (mint) {
                    const full = await ensureDiskSpace({
                        cwd: root,
                        minFreeGb: config.diskMinFreeGb,
                        log: ctx.log,
                    });
                    if (full !== null)
                        throw new CommandError(EXIT_DISK_FULL, full);
                    runGit(root, ["worktree", "prune"]);
                    if (fs.existsSync(wtDir)) {
                        // A plain directory there would resolve to the main checkout's repo,
                        // and the rebase below would rewrite the main checkout's branch.
                        if (real(git(wtDir, ["rev-parse", "--show-toplevel"]) ?? "") !== real(wtDir)) {
                            throw new CommandError(EXIT_NOT_A_WORKTREE, `${wtDir} is not a registered git worktree`);
                        }
                        mode = "resumed";
                    }
                    else if (workflow !== "debug" || session !== target) {
                        // Debug adopts an existing feat/{fid}; it never mints a branch of its own.
                        if (addWorktree(root, wtDir, target, workflow !== "debug"))
                            mode = "created";
                    }
                }
                const wt = mode === "adopted" ? root : wtDir;
                const logDir = logDirOf(wt, month, fid);
                const marker = ownershipMarker(root, fid);
                if (mode === "adopted") {
                    if (workflow === "ship" && git(root, ["branch", "--show-current"]) !== target) {
                        const sw = runGit(root, ["switch", target]);
                        if (!sw.ok) {
                            throw new CommandError(EXIT_REFUSED, `adopt mode: cannot switch to ${target} — commit or stash local changes, then re-run (${sw.stderr})`);
                        }
                    }
                    const here = git(root, ["branch", "--show-current"]) ?? "";
                    const refused = workflow === "debug" ? "main" : DEV;
                    if (here === "" || here === refused) {
                        throw new CommandError(EXIT_REFUSED, here === ""
                            ? "adopt mode: detached HEAD — check out the feature branch"
                            : `adopt mode: current branch is ${here} — refusing to work in place on ${here}`);
                    }
                }
                let rebaseConflict = false;
                let sentinel = null;
                const sentinelPath = path.join(logDir, ".rebase-failed");
                if (mode === "resumed" && workflow !== "ship") {
                    // Cleared before every attempt: a sentinel left by an earlier run would
                    // send this one to the Failure Path after a clean rebase.
                    fs.rmSync(sentinelPath, { force: true });
                    let failure;
                    if (rebaseInProgress(wt)) {
                        failure = { conflict: true, detail: "a rebase is already in progress" };
                    }
                    else {
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
                        fs.appendFileSync(path.join(logDir, "rebase-resolve-log.md"), `[bkit-worktrees] ${new Date().toISOString()} rebase onto ${ORIGIN_DEV} stopped\n${failure.detail}\n`);
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
                const wantInstall = done && config.worktreeInstall;
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
                    ctx.log(`the package manager could not run (exit ${installStatus}) — dependencies not installed`);
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
            summary: "Remove .worktrees/{fid} when a workflow created it, prune stale entries, and delete the feature branch.",
            flags: [
                FID_FLAG,
                {
                    name: "branch",
                    type: "string",
                    help: "feature branch to delete locally and on origin once the worktree is gone; skipped when another worktree still holds it",
                },
            ],
            output: {
                removed: "the worktree was removed",
                reason: "why it was not: absent | not-owned (no .worktree-owned marker); null when removed",
                worktreePath: "the worktree's path",
                repoRoot: "the main checkout — cd here if the shell was inside the removed worktree",
                branchDeleted: "--branch: the local branch is gone (deleted or already absent); null without --branch",
                remoteDeleted: "--branch: git push origin --delete succeeded; false when it failed or was already gone; null without --branch",
                branchBlockedBy: "--branch: the worktree still holding the branch, so neither the local nor the remote branch was deleted; null when none",
            },
            exitCodes: { [EXIT_REMOVE]: "git worktree remove failed" },
            run: (ctx) => {
                const branch = ctx.flags.branch === undefined ? undefined : String(ctx.flags.branch);
                ctx.emit({ ...removeWorktree(ctx.cwd, fidOf(ctx.flags.fid), branch, ctx.log) });
                return EXIT.OK;
            },
        },
    },
};
