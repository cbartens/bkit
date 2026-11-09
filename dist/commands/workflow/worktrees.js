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
// unless another worktree still holds it. A new branch, and a resume rebase,
// use local `dev` when it is a fast-forward of `origin/dev`: dev pushes wait for
// a human, so local dev is routinely ahead, and a worktree without those commits
// builds against superseded work.
// Debug preserves the adopted branch's history for CI evidence ancestry checks.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { actionHash, actionKey, lastRun, recordAction } from "../../ledgers/status.js";
import { APPEND_LEDGERS, gitEnv } from "../../ledgers/telemetry.js";
import { parseJson } from "../../shared/json.js";
import { readBkitConfig } from "../../shared/settings.js";
import { COULD_NOT_RUN_EXIT_CODES, installCommand } from "../../shared/package-manager.js";
import { CommandError, DEV, EXIT, git, isIgnoredPath, isSharedBranch, MAIN, mainCheckoutRoot, repoRoot, runGit, } from "../lib.js";
import { ensureDiskSpace } from "./disk.js";
import { listRecords, newRecord, readRecord, removeRecord, withSetupGuard, writeRecord, } from "./ledgers.js";
import { workflowLockFresh, workflowLockLive } from "./locks.js";
import { detect } from "./runtime.js";
import { WORKFLOW_FLAG, readRuns } from "./status.js";
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
export const EXIT_SHARED_BUSY = 13;
const FID_FLAG = { name: "fid", type: "string", required: true, help: "feature id" };
function fidOf(value) {
    const fid = String(value);
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(fid) || fid.includes("..")) {
        throw new CommandError(EXIT.USAGE, `--fid "${fid}" is not a feature id`);
    }
    return fid;
}
export const worktreeDir = (root, fid) => path.join(root, ".worktrees", fid);
/** `.worktree-owned` is shared across worktrees; session invocation state stays separate. */
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
/**
 * The shared-checkout record for an in-place run on `dev`. Another feature's
 * record with a live workflow lock means that run owns the checkout; one
 * without is left over and removed. The same feature with an open run in
 * `{logDir}/status.jsonl` is a resume and keeps its record; a new run rewrites it.
 */
function openSharedRecord(root, fid, workflow, logDir) {
    const busy = (other) => new CommandError(EXIT_SHARED_BUSY, `${other} is running in this checkout (workflow lock held) — wait for it to finish, then re-run`);
    const guarded = withSetupGuard(root, () => {
        for (const other of listRecords(root)) {
            if (other.fid === fid)
                continue;
            // A closed run that has not released its lock still pushes and waits for CI.
            if (workflowLockLive(root, other.fid) || workflowLockFresh(root, other.fid)) {
                throw busy(other.fid);
            }
            removeRecord(root, other.fid);
        }
        const existing = readRecord(root, fid);
        const statusFile = path.join(logDir, "status.jsonl");
        const open = fs.existsSync(statusFile) &&
            lastRun(readRuns(statusFile), workflow)?.status === "IN_PROGRESS";
        if (existing !== null && existing.branch === DEV && open)
            return existing;
        const fresh = newRecord(root, fid, DEV);
        writeRecord(root, fresh);
        return fresh;
    });
    if (guarded === null)
        throw busy("another run");
    return guarded.value;
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
 * The ref a feature branch starts from and rebases onto: local `dev` when it is
 * strictly ahead of `origin/dev` (a fast-forward of it), else `origin/dev`. With
 * `log`, says why when the two differ. Fetch first for a current answer.
 */
export function devBase(cwd, log) {
    const local = git(cwd, ["rev-parse", "-q", "--verify", `refs/heads/${DEV}`]);
    const remote = git(cwd, ["rev-parse", "-q", "--verify", `refs/remotes/${ORIGIN_DEV}`]);
    if (local === null || remote === null || local === remote)
        return ORIGIN_DEV;
    const count = (range) => git(cwd, ["rev-list", "--count", range]) ?? "?";
    if (runGit(cwd, ["merge-base", "--is-ancestor", remote, local]).ok) {
        log?.(`local ${DEV} is ${count(`${remote}..${local}`)} commit(s) ahead of ${ORIGIN_DEV} — basing on local ${DEV}; push ${DEV} before the feature PR`);
        return DEV;
    }
    if (!runGit(cwd, ["merge-base", "--is-ancestor", local, remote]).ok) {
        log?.(`local ${DEV} and ${ORIGIN_DEV} have diverged — basing on ${ORIGIN_DEV}; local ${DEV}'s ${count(`${remote}..${local}`)} commit(s) are not in this worktree`);
    }
    return ORIGIN_DEV;
}
/** Workflows whose close lands docs and ledgers only: their branch may carry no unpushed dev work. */
const DOCS_ONLY_WORKFLOWS = ["design", "plan"];
/**
 * The ref a feature branch starts from and rebases onto. A docs-only workflow
 * (design, plan) always starts from `origin/dev`: its close lands docs and
 * ledgers on `origin/dev` and may carry nothing else, so a branch holding
 * unpushed `dev` commits could never land (issue #639). Every other workflow
 * keeps `devBase`'s choice — local `dev` while it is a fast-forward of `origin/dev`.
 */
export function worktreeBase(cwd, workflow, log) {
    if (!DOCS_ONLY_WORKFLOWS.includes(workflow))
        return devBase(cwd, log);
    const local = git(cwd, ["rev-parse", "-q", "--verify", `refs/heads/${DEV}`]);
    const remote = git(cwd, ["rev-parse", "-q", "--verify", `refs/remotes/${ORIGIN_DEV}`]);
    if (local !== null &&
        remote !== null &&
        local !== remote &&
        runGit(cwd, ["merge-base", "--is-ancestor", remote, local]).ok) {
        const count = git(cwd, ["rev-list", "--count", `${remote}..${local}`]) ?? "?";
        log?.(`local ${DEV} is ${count} commit(s) ahead of ${ORIGIN_DEV} — basing this ${workflow} branch on ${ORIGIN_DEV}: its close lands docs and ledgers only`);
    }
    return ORIGIN_DEV;
}
/**
 * The commits `branch` carries that local `dev` holds and `origin/dev` does not:
 * work inherited from unpushed `dev`. A docs-only close lands on `origin/dev` and
 * may bring docs and ledgers only, so such a branch can never land.
 */
function inheritedDevCommits(root, branch) {
    if (!hasLocal(root, DEV))
        return [];
    const read = (args) => {
        const result = runGit(root, args);
        if (!result.ok)
            throw new CommandError(EXIT_REFUSED, `cannot inspect unpublished ${DEV} work for ${branch}: ${result.stderr}`);
        return result.stdout.trim();
    };
    const unpushed = new Set(read(["rev-list", `${ORIGIN_DEV}..${DEV}`])
        .split("\n")
        .filter(Boolean));
    if (unpushed.size === 0)
        return [];
    return read(["rev-list", branch, "--not", ORIGIN_DEV])
        .split("\n")
        .filter((c) => unpushed.has(c));
}
/** Refuse a publication candidate that imports unpublished local dev ancestry. */
export function assertShipEligible(root, candidate) {
    if (git(root, ["rev-parse", "--verify", "--quiet", `${candidate}^{commit}`]) === null)
        throw new CommandError(EXIT_REFUSED, `cannot inspect ship candidate ${candidate}`);
    const inherited = inheritedDevCommits(root, candidate);
    if (inherited.length === 0)
        return;
    const commits = inherited
        .map((sha) => git(root, ["show", "-s", "--format=%h %s", sha]) ?? sha)
        .join("; ");
    throw new CommandError(EXIT_REFUSED, `${candidate} carries unpublished ${DEV} work: ${commits}. Publish ${DEV} separately (git push origin ${DEV}), then re-run ship; these commits must not be squashed into the feature.`);
}
/** Why a docs-only branch carrying unpushed `dev` cannot land, and what unblocks it. */
function inheritedDevRefusal(root, target, workflow, count) {
    const ahead = git(root, ["rev-list", "--count", `${ORIGIN_DEV}..${DEV}`]) ?? "?";
    const tip = git(root, ["rev-parse", "--short", DEV]) ?? DEV;
    return `${target} carries ${count} commit(s) of unpushed ${DEV} (tip ${tip}, ${ahead} commit(s) ahead of ${ORIGIN_DEV}), and a ${workflow} close lands docs and ledgers only — this branch cannot land. Publish ${DEV} (git push origin ${DEV}), then re-run.`;
}
/**
 * `git worktree add` for `branch`: the local branch, else a tracking branch off
 * `origin`, else (when `mayCreate`) a new branch off `worktreeBase` after a fresh
 * fetch. Returns false when there was nothing to add and `mayCreate` is off.
 */
function addWorktree(root, wt, branch, mayCreate, workflow, log) {
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
            args = [wt, "-b", branch, worktreeBase(root, workflow, log)];
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
/**
 * An engine-action row for a rebase that rewrote the branch, keyed on the tip it
 * replaced, so the run's record shows the rewrite. Nothing when HEAD did not move.
 */
export function recordRebase(statusFile, before, after) {
    if (before === null || after === null || before === after)
        return;
    recordAction(statusFile, {
        action: "rebase",
        key: actionKey("rebase", before),
        hash: actionHash(`${before}..${after}`),
        ref: after,
    });
}
function rebaseInProgress(wt) {
    return ["rebase-merge", "rebase-apply"].some((p) => {
        const dir = git(wt, ["rev-parse", "--path-format=absolute", "--git-path", p]);
        return dir !== null && fs.existsSync(dir);
    });
}
/**
 * Where setup holds its "rebase stopped" note while it leaves a rebase in progress:
 * inside the worktree's git dir, never in the tree. `--continue` refuses while a
 * tracked file has unstaged changes, and the run's rebase log is tracked once a run
 * committed it. `branches rebase` writes the note ahead of its own log lines.
 */
export function rebaseNoteFile(wt) {
    return git(wt, ["rev-parse", "--path-format=absolute", "--git-path", "bkit-rebase-note.md"]);
}
/**
 * bkit's own worktree copy entry, excluded from every bkit commit beside
 * `bkit.workflows.worktree.copy`: it holds the sign-in tokens, and a consumer whose
 * `.gitignore` lost bkit's `.bkit/.env` line would otherwise commit a link to them.
 */
export const BKIT_OWN_COPY = [".bkit/.env"];
/** A normalized copy entry inside the checkout: neither absolute nor climbing out with `..`. */
const insideCheckout = (rel) => !path.isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${path.sep}`);
/**
 * Every `bkit.workflows.worktree.copy` entry setup may have copied into `tree`: the
 * tree's own `package.json` list and the main checkout's, which setup copies by and
 * which an uncommitted edit or the feature branch can make differ.
 */
function worktreeCopyLists(tree) {
    const main = mainCheckoutRoot(tree) ?? tree;
    return [...new Set([...readBkitConfig(tree).worktreeCopy, ...readBkitConfig(main).worktreeCopy])];
}
/**
 * `:(exclude)` pathspecs for the entries setup copies into `tree` (`copied`, default
 * every list that may name one) and `BKIT_OWN_COPY`. An entry outside the tree is left
 * out: git refuses it as a pathspec (exit 128) and setup never copies it. So is one git
 * already ignores: naming it in a `:(exclude)` pathspec trips git's ignored-paths guard
 * and fails the whole `add`, and `git add -A` skips an ignored file anyway.
 */
export function copyExcludes(tree, copied = worktreeCopyLists(tree)) {
    return [...copied, ...BKIT_OWN_COPY]
        .map((e) => path.normalize(e))
        .filter((e) => insideCheckout(e) && !isIgnoredPath(tree, e))
        .map((e) => `:(exclude)${e}`);
}
/**
 * `git add -A` in `tree`, leaving out the entries setup copies in from the main
 * checkout (`.env` and the like) and `BKIT_OWN_COPY` (`copyExcludes`): no bkit commit
 * may carry them, gitignored or not.
 */
export function addAllButCopied(tree, copied) {
    return runGit(tree, ["add", "-A", "--", ".", ...copyExcludes(tree, copied)]);
}
/** Whether `wt` holds changes beyond the entries setup copies in (`copyExcludes`). */
export const hasLeftovers = (wt) => (git(wt, ["status", "--porcelain", "--untracked-files=all", "--", ".", ...copyExcludes(wt)]) ??
    "") !== "";
/**
 * The rows the dispatch seam appended after the last commit, by tracked path, when they
 * are the only changes in `wt`: `engine-call` rows at the end of `statusFile`, and
 * `friction` rows at the end of `.bkit/friction.jsonl` (a hook-launched command's
 * unexpected exit). Null when anything else changed.
 */
function journalRowsAppended(wt, statusFile) {
    const allowed = new Map([
        [path.relative(wt, statusFile), (row) => row["type"] === "engine-call"],
        [APPEND_LEDGERS.friction.file, (row) => row["kind"] === "friction"],
    ]);
    const changed = (git(wt, ["status", "--porcelain", "--untracked-files=all", "--", ".", ...copyExcludes(wt)]) ??
        "")
        .split("\n")
        .filter((l) => l !== "");
    if (changed.length === 0)
        return null;
    const out = new Map();
    for (const line of changed) {
        const rel = [...allowed.keys()].find((r) => line.endsWith(` ${r}`));
        const appended = rel === undefined ? null : appendedRows(wt, rel, allowed.get(rel));
        if (rel === undefined || appended === null)
            return null;
        out.set(rel, appended);
    }
    return out;
}
/** `rel` as its committed text plus one or more appended rows `accepts` takes; null otherwise. */
function appendedRows(wt, rel, accepts) {
    const committed = git(wt, ["cat-file", "blob", `HEAD:${rel}`]);
    const file = path.join(wt, rel);
    if (committed === null || !fs.existsSync(file))
        return null;
    const text = fs.readFileSync(file, "utf-8");
    if (!text.startsWith(committed))
        return null;
    // `git` trims its output: the committed text's own last newline comes back with it.
    const rest = text.slice(committed.length);
    const lead = rest.startsWith("\n") ? "\n" : "";
    const rows = rest.slice(lead.length);
    const added = rows.split("\n").filter((l) => l.trim() !== "");
    const ok = added.length > 0 &&
        added.every((l) => {
            const parsed = parseJson(l);
            return (parsed.ok &&
                parsed.value !== null &&
                typeof parsed.value === "object" &&
                !Array.isArray(parsed.value) &&
                accepts(parsed.value));
        });
    return ok ? { committed: text.slice(0, committed.length) + lead, rows } : null;
}
/**
 * Appends the rows `journalRowsAppended` set aside back onto their files and returns "".
 * A rebase that stopped part-way cannot continue past unstaged rows, so then nothing is
 * appended and the rows come back as text for the rebase log.
 */
function putJournalRowsBack(wt, journal) {
    if (rebaseInProgress(wt)) {
        return [...journal]
            .map(([rel, a]) => `rows set aside from ${rel}; append them once the rebase finishes:\n${a.rows}`)
            .join("");
    }
    for (const [rel, a] of journal) {
        const file = path.join(wt, rel);
        const text = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
        fs.appendFileSync(file, `${text !== "" && !text.endsWith("\n") ? "\n" : ""}${a.rows}`);
    }
    return "";
}
/**
 * Commit what an earlier run left uncommitted in a resumed worktree, so the
 * resume rebase can start: a failed ship's flush lands its record on dev and
 * leaves the worktree as it was, for whatever runs next. An untracked file in a
 * log folder of this feature that `onto` already holds is dropped first: dev's
 * copy, landed by that flush, wins, and a second copy would stop the rebase. One
 * whose content differs from `onto`'s is moved to the feature's outbox folder
 * (`dropped-logs/{time}/`), never deleted. The entries setup copies in are never
 * committed and alone do not count as leftovers. No leftovers → null; a failed
 * commit is narrated and leaves the tree for the rebase to refuse.
 */
function carryLeftovers(wt, o, log) {
    if (!hasLeftovers(wt))
        return null;
    const logs = new RegExp(`^docs/plans/[^/]+/logs/${o.fid.replace(/\./g, "\\.")}/`);
    const dropped = (git(wt, ["ls-files", "--others", "--exclude-standard"]) ?? "")
        .split("\n")
        .filter((f) => logs.test(f) && runGit(wt, ["cat-file", "-e", `${o.onto}:${f}`]).ok);
    const keepDir = path.join(path.dirname(ownershipMarker(wt, o.fid)), "dropped-logs", new Date().toISOString().replace(/[:.]/g, "-"));
    for (const f of dropped) {
        const file = path.join(wt, f);
        if (git(wt, ["hash-object", "--", f]) !== git(wt, ["rev-parse", `${o.onto}:${f}`])) {
            const kept = path.join(keepDir, f);
            fs.mkdirSync(path.dirname(kept), { recursive: true });
            fs.cpSync(file, kept);
            log(`moved ${f} to ${kept}: it differs from ${o.onto}'s copy, which wins in the worktree`);
        }
        fs.rmSync(file);
    }
    if (dropped.length > 0)
        log(`dropped ${dropped.length} untracked log(s) ${o.onto} already holds: ${dropped.join(", ")}`);
    if (!hasLeftovers(wt))
        return { sha: null, dropped };
    const prior = fs.existsSync(o.statusFile) ? readRuns(o.statusFile).at(-1) : undefined;
    const what = prior === undefined
        ? "uncommitted work left in the worktree"
        : `the ${prior.status === "FAILED" ? "failed " : ""}${prior.workflow} record left uncommitted`;
    addAllButCopied(wt);
    const made = runGit(wt, ["commit", "-m", `chore(${o.fid}): carry ${what} bkit`]);
    if (!made.ok) {
        log(`could not commit what an earlier run left in ${wt}: ${made.stderr || made.stdout}`);
        return { sha: null, dropped };
    }
    log(`committed ${what} before the resume rebase`);
    return { sha: git(wt, ["rev-parse", "HEAD"]), dropped };
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
        // bkit's own env is managed by linkBkitEnv, including on resume.
        if (BKIT_OWN_COPY.some((owned) => path.normalize(owned) === rel))
            continue;
        if (!insideCheckout(rel)) {
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
const sha256 = (content) => createHash("sha256").update(content).digest("hex");
/**
 * bkit's own token file, `.bkit/.env`, in a worktree. `copyListed` covers the app env
 * files a repo configures; this one is bkit's, and it is gitignored — so a fresh
 * checkout has none, `.envrc`'s `dotenv_if_exists .bkit/.env` loads nothing and says
 * nothing, and every sign-in here fails with nothing looking wrong.
 *
 * Link to the main checkout's copy: one source of truth, so rotating a token needs no
 * second edit and no copy goes stale. Fall back to a copy where the filesystem refuses
 * a symlink, recording its hash in the feature's outbox folder (`.bkit-env-copy`): a
 * copy bkit made is replaced on the next setup, so a rotated token reaches it too. Any
 * other regular file that differs from the main checkout's is left for a human to read,
 * like a differing `.envrc`; `none` means the main checkout holds no `.bkit/.env` to
 * bring in, which the tip and the advisory then report; `failed` means neither the link
 * nor the copy could be written, narrated.
 */
function linkBkitEnv(root, wt, fid, log) {
    const main = path.join(root, ".bkit", ".env");
    if (!fs.existsSync(main))
        return "none";
    const dest = path.join(wt, ".bkit", ".env");
    const record = path.join(path.dirname(ownershipMarker(root, fid)), ".bkit-env-copy");
    // lstat, so a dangling link is seen (and replaced) rather than followed and missed.
    const stat = fs.lstatSync(dest, { throwIfNoEntry: false });
    if (stat?.isSymbolicLink() && fs.existsSync(dest))
        return "unchanged";
    if (stat?.isFile()) {
        const here = fs.readFileSync(dest);
        const bkitMade = fs.existsSync(record) && fs.readFileSync(record, "utf-8") === sha256(here);
        if (!bkitMade && !here.equals(fs.readFileSync(main))) {
            log(`bkit-env: ${dest} differs from the main checkout's — left as it is; delete it to link the main checkout's copy`);
            return "differs";
        }
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.rmSync(dest, { recursive: true, force: true });
    try {
        fs.symlinkSync(main, dest);
        fs.rmSync(record, { force: true });
        return "linked";
    }
    catch (err) {
        try {
            fs.cpSync(main, dest);
        }
        catch (copyErr) {
            log(`bkit-env: could not link or copy the main checkout's .bkit/.env to ${dest} (${err.message}; ${copyErr.message}) — sign-ins in this worktree fail until it is there`);
            return "failed";
        }
        fs.mkdirSync(path.dirname(record), { recursive: true });
        fs.writeFileSync(record, sha256(fs.readFileSync(dest)));
        log(`bkit-env: symlink failed (${err.message}) — copied the main checkout's .bkit/.env`);
        return "copied";
    }
}
/**
 * `direnv allow` the worktree's `.envrc` when it matches the main checkout's
 * byte for byte, so the worktree inherits the trust given there and nothing
 * more; a differing file is left for a human to read. No `.envrc`, direnv
 * missing or failing → false, narrated, never fatal.
 */
function allowDirenv(root, wt, log) {
    const envrc = path.join(wt, ".envrc");
    if (!fs.existsSync(envrc))
        return false;
    const main = path.join(root, ".envrc");
    if (!fs.existsSync(main) || !fs.readFileSync(main).equals(fs.readFileSync(envrc))) {
        log(`direnv: ${envrc} differs from the main checkout's — not allowed; read it, then run direnv allow`);
        return false;
    }
    const res = spawnSync("direnv", ["allow", wt], { cwd: wt, encoding: "utf-8" });
    if (res.error || res.status === 127) {
        log("direnv: not installed — run direnv allow in the worktree once it is");
        return false;
    }
    if (res.status !== 0) {
        log(`direnv allow failed (exit ${res.status}): ${(res.stderr ?? "").trim()}`);
        return false;
    }
    return true;
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
/** Preserve NUL-delimited paths and the status columns that runGit trims. */
function cleanupRead(root, args) {
    const result = spawnSync("git", args, {
        cwd: root,
        encoding: "utf-8",
        env: gitEnv(),
        maxBuffer: 1 << 26,
    });
    return {
        ok: !result.error && result.status === 0,
        stdout: result.stdout ?? "",
        stderr: result.error?.message ?? result.stderr ?? "",
    };
}
function treeEntry(root, rev, file) {
    const result = cleanupRead(root, ["ls-tree", "-z", rev, "--", file]);
    if (!result.ok)
        throw new Error(`cannot inspect ${rev}:${file}: ${result.stderr}`);
    return result.stdout === "" ? null : result.stdout.slice(0, result.stdout.indexOf("\t"));
}
function committedLines(root, rev, file) {
    if (treeEntry(root, rev, file) === null)
        return [];
    const result = cleanupRead(root, ["show", `${rev}:${file}`]);
    if (!result.ok)
        throw new Error(`cannot read ${rev}:${file}: ${result.stderr}`);
    return result.stdout.split("\n").filter(Boolean);
}
/** Branch changes absent from dev, including deletions and tree-entry mode/type. */
export function notOnDev(root, branch) {
    const base = git(root, ["merge-base", ORIGIN_DEV, branch]);
    if (base === null)
        return [`${branch}: no common history with ${ORIGIN_DEV}`];
    const changed = cleanupRead(root, ["diff", "--name-only", "-z", "--no-renames", base, branch]);
    if (!changed.ok)
        return [`cannot inspect ${branch}: ${changed.stderr}`];
    try {
        return changed.stdout
            .split("\0")
            .filter((file) => file !== "" && file !== "docs/roadmap.md")
            .filter((file) => {
            const feature = treeEntry(root, branch, file);
            const dev = treeEntry(root, ORIGIN_DEV, file);
            if (feature === dev)
                return false;
            if (feature === null ||
                dev === null ||
                !file.endsWith(".jsonl") ||
                !/^100(?:644|755) blob /.test(feature) ||
                feature.split(" ").slice(0, 2).join(" ") !== dev.split(" ").slice(0, 2).join(" "))
                return true;
            const before = new Set(committedLines(root, base, file));
            const onDev = new Set(committedLines(root, ORIGIN_DEV, file));
            return committedLines(root, branch, file).some((line) => !before.has(line) && !onDev.has(line));
        });
    }
    catch (error) {
        return [error.message];
    }
}
/** Uncommitted files whose index or working contents are not already safely on dev. */
function dirtyWork(root, wt, landed) {
    const status = cleanupRead(wt, [
        "status",
        "--porcelain=v1",
        "-z",
        "--untracked-files=all",
        "--",
        ".",
        ...copyExcludes(wt),
    ]);
    if (!status.ok)
        return [`cannot inspect dirty work: ${status.stderr}`];
    const entries = status.stdout.split("\0").filter(Boolean);
    const paths = [];
    const staged = new Set();
    for (let i = 0; i < entries.length; i++) {
        const row = entries[i];
        const changed = [row.slice(3)];
        if (/[RC]/.test(row.slice(0, 2)))
            changed.push(entries[++i]);
        paths.push(...changed);
        if (row[0] !== " " && row[0] !== "?") {
            for (const file of changed)
                staged.add(file);
        }
    }
    if (!landed)
        return paths;
    return paths.filter((file) => {
        try {
            if (staged.has(file) &&
                !cleanupRead(wt, ["diff", "--cached", "--quiet", ORIGIN_DEV, "--", file]).ok)
                return true;
            const entry = treeEntry(root, ORIGIN_DEV, file);
            const full = path.join(wt, file);
            const stat = fs.lstatSync(full, { throwIfNoEntry: false });
            if (stat === undefined)
                return entry !== null;
            if (entry === null || (!stat.isFile() && !stat.isSymbolicLink()))
                return true;
            const mode = stat.isSymbolicLink()
                ? "120000"
                : (stat.mode & 0o111) !== 0
                    ? "100755"
                    : "100644";
            if (!entry.startsWith(`${mode} blob `))
                return true;
            const bytes = stat.isSymbolicLink()
                ? Buffer.from(fs.readlinkSync(full))
                : fs.readFileSync(full);
            const hash = spawnSync("git", ["hash-object", "--stdin"], {
                cwd: root,
                input: bytes,
                encoding: "utf-8",
                env: gitEnv(),
            });
            if (hash.status !== 0)
                return true;
            if (entry.endsWith(` ${hash.stdout.trim()}`))
                return false;
            if (!file.endsWith(".jsonl"))
                return true;
            const onDev = new Set(committedLines(root, ORIGIN_DEV, file));
            return bytes
                .toString("utf-8")
                .split("\n")
                .filter(Boolean)
                .some((line) => !onDev.has(line));
        }
        catch {
            return true;
        }
    });
}
/** The worktree (main checkout included) with `branch` checked out, else null. */
export function worktreeHolding(root, branch) {
    const result = cleanupRead(root, ["worktree", "list", "--porcelain"]);
    if (!result.ok)
        throw new CommandError(EXIT_REMOVE, `cannot inspect worktrees holding ${branch}: ${result.stderr}`);
    const list = result.stdout;
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
 * Delete the proved local tip atomically. A worktree still holding it blocks
 * deletion; the remote branch is retained because its deletion cannot be conditional.
 */
function deleteBranch(root, branch, log, expected) {
    const holder = worktreeHolding(root, branch);
    if (holder !== null) {
        log(`${branch} is checked out in ${holder} (not a workflow worktree) — local and remote branch left in place`);
        return { branchDeleted: false, remoteDeleted: false, branchBlockedBy: holder };
    }
    const del = runGit(root, ["update-ref", "-d", `refs/heads/${branch}`, expected]);
    if (!del.ok)
        log(`local ${branch} changed after its cleanup proof — preserved: ${del.stderr}`);
    log(`remote origin/${branch} retained: conditional deletion is unavailable under the no-force-push policy`);
    return {
        branchDeleted: del.ok,
        remoteDeleted: false,
        branchBlockedBy: del.ok ? null : "changed-after-proof",
    };
}
/**
 * Remove `.worktrees/{fid}` when a workflow created it (the ownership marker),
 * preserve unlanded or dirty work, then delete the proved local branch tip unless
 * another worktree holds it. Remote branches are retained. Throws EXIT_REMOVE
 * when `git worktree remove` fails.
 */
export function removeWorktree(cwd, fid, branch, log, options = {}) {
    if (branch !== undefined && isSharedBranch(branch)) {
        throw new CommandError(EXIT.USAGE, `refusing to delete branch ${branch}`);
    }
    const root = repoRoot(cwd);
    const wt = worktreeDir(root, fid);
    const marker = ownershipMarker(root, fid);
    let expected = null;
    const result = (removed, reason, removeBranch = false) => {
        const cleanup = branch === undefined || !removeBranch || expected === null
            ? null
            : deleteBranch(root, branch, log, expected);
        return {
            removed,
            reason,
            worktreePath: wt,
            repoRoot: root,
            branchDeleted: cleanup?.branchDeleted ?? (branch === undefined ? null : false),
            remoteDeleted: cleanup?.remoteDeleted ?? (branch === undefined ? null : false),
            branchBlockedBy: cleanup?.branchBlockedBy ?? (branch === undefined ? null : worktreeHolding(root, branch)),
        };
    };
    if (fs.existsSync(wt) && !fs.existsSync(marker)) {
        log(`${wt} exists but has no ownership marker (${marker}) — not ours, left in place`);
        if (branch !== undefined)
            log(`${branch} is checked out in ${worktreeHolding(root, branch) ?? wt} — local and remote branch left in place`);
        return result(false, "not-owned");
    }
    if (branch !== undefined) {
        const holder = worktreeHolding(root, branch);
        if (holder !== null && real(holder) !== real(wt)) {
            log(`${branch} is checked out in ${holder} — local and remote branch left in place`);
            return result(false, fs.existsSync(wt) ? "held-elsewhere" : "absent");
        }
        try {
            fetchBranch(root, DEV);
            expected = git(root, ["rev-parse", "--verify", "--quiet", `refs/heads/${branch}^{commit}`]);
            if (expected === null) {
                log(`cannot read local ${branch}; cleanup evidence unavailable — preserved`);
                return result(false, "unavailable");
            }
            const missing = notOnDev(root, expected);
            if (missing.length > 0) {
                log(`${branch} carries work ${ORIGIN_DEV} does not — preserved: ${missing.join(", ")}`);
                return result(false, "not-landed");
            }
            const remote = remoteHas(root, branch);
            if (remote === "error") {
                log(`cannot read remote origin/${branch}; cleanup evidence unavailable — preserved`);
                return result(false, "unavailable");
            }
            if (remote === "yes") {
                fetchBranch(root, branch);
                const remoteMissing = notOnDev(root, `refs/remotes/origin/${branch}`);
                if (remoteMissing.length > 0) {
                    log(`remote origin/${branch} holds unlanded work — local worktree and remote branch preserved: ${remoteMissing.join(", ")}`);
                    return result(false, "remote-not-landed");
                }
            }
        }
        catch (error) {
            log(`cleanup evidence unavailable — preserved: ${error.message}`);
            return result(false, "unavailable");
        }
    }
    if (fs.existsSync(wt)) {
        const dirty = dirtyWork(root, wt, options.landed === true);
        if (dirty.length > 0) {
            log(`${wt} holds uncommitted work — preserved: ${dirty.join(", ")}`);
            return result(false, "uncommitted");
        }
    }
    if (!fs.existsSync(wt)) {
        runGit(root, ["worktree", "prune"]);
        return result(false, "absent", true);
    }
    const inside = !path.relative(real(wt), real(cwd)).startsWith("..");
    const res = runGit(root, ["worktree", "remove", "--force", wt]);
    if (!res.ok)
        throw new CommandError(EXIT_REMOVE, `git worktree remove failed: ${res.stderr}`);
    runGit(root, ["worktree", "prune"]);
    fs.rmSync(marker, { force: true });
    if (inside)
        log(`the working directory was inside ${wt} — cd to ${root}`);
    return result(true, null, true);
}
// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------
/**
 * The warning ship prints when the branch it ships names neither the FID nor the
 * issue (case-insensitive); null when it names one. A hand-made branch still ships.
 */
export function shipBranchWarning(branch, fid, issue) {
    const b = branch.toLowerCase();
    const id = (issue ?? "").replace(/^#/, "").toLowerCase();
    if (b.includes(fid.toLowerCase()) || (id !== "" && b.includes(id)))
        return null;
    return `[bkit-ship] WARNING branch ${branch} not named for ${fid} — shipping it as named`;
}
export const worktreesCommand = {
    noun: "worktrees",
    summary: "Set up and remove the per-feature worktrees under .worktrees/.",
    verbs: {
        setup: {
            summary: "Create, resume or adopt the feature's worktree (Step 2 — Worktree Setup).",
            use: "workflow",
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
                    help: "ship or debug: an existing branch the session prompt names; debug refuses a conflicting checkout",
                },
                {
                    name: "issue",
                    type: "string",
                    help: "ship only: the issue id; a branch naming it (or the FID) prints no branchWarning",
                },
            ],
            output: {
                worktreePath: "directory the workflow must cd into",
                repoRoot: "the main checkout",
                branch: "branch checked out at worktreePath",
                mode: "created | resumed | adopted",
                branchWarning: "ship: the warning printed when the branch names neither the FID nor --issue, else null",
                owned: "the .worktree-owned marker is present (a workflow created this worktree)",
                rebaseConflict: "a resume rebase onto baseRef stopped on a conflict and is left in progress",
                sentinel: "the .rebase-failed sentinel written on a failed rebase, else null",
                logDir: "docs/plans/{month}/logs/{fid} under worktreePath (created)",
                baseRef: "dev when local dev is a fast-forward of origin/dev (unpushed commits), else origin/dev",
                baseSha: "git merge-base baseRef HEAD at worktreePath, or null",
                carriedSha: "resume: the commit holding what an earlier run left uncommitted (a failed ship's record), made before the rebase; else null",
                carriedDropped: "resume: untracked logs of this feature dropped because baseRef already holds them (dev's copy wins); one whose content differs is first moved to the feature's outbox folder (dropped-logs/), named in the log",
                copied: "worktree copy entries copied from the main checkout",
                copyMissing: "worktree copy entries absent from the main checkout",
                bkitEnv: "bkit's own .bkit/.env: linked to the main checkout's copy, or copied where a symlink is refused (a copy bkit made is refreshed on the next setup); unchanged when already linked, differs when a differing file was left to read, none when the main checkout holds none, failed when neither the link nor the copy could be written, null in adopt mode",
                direnvAllowed: "direnv allow ran on the worktree's .envrc (present and identical to the main checkout's)",
                installed: "dependencies were installed",
                startSha: "in place on dev (debug): HEAD when the run started, recorded in the shared-checkout record; absent otherwise",
                aheadAtStart: "in place on dev (debug): commits local dev held beyond origin/dev when the run started; absent otherwise",
            },
            exitCodes: {
                [EXIT_REBASE_CONFLICT]: "resume rebase stopped on a conflict, left in progress — run `bkit branches rebase`, then re-run setup; on its failure, Failure Path",
                [EXIT_FETCH]: "could not fetch from origin",
                [EXIT_INSTALL]: "dependency install failed",
                [EXIT_INSTALL_COULD_NOT_RUN]: "the package manager could not run (exit 126 / 127)",
                [EXIT_REFUSED]: "refused: main as the working branch (dev too, except debug in place), ship of dev / main, detached HEAD, ship could not switch to its branch (a missing feat/{fid} is named), or a design / plan branch carrying unpushed dev commits (publish dev, then re-run)",
                [EXIT_WORKTREE_ADD]: "git worktree add failed",
                [EXIT_REBASE_NOT_STARTED]: "resume rebase could not start, even after committing what an earlier run left (e.g. a commit hook refused that commit)",
                [EXIT_NOT_A_WORKTREE]: ".worktrees/{fid} exists but is not a registered git worktree",
                [EXIT_SHARED_BUSY]: "in place on dev: another feature's run holds this checkout (its shared-checkout record has a live workflow lock); nothing written",
                [EXIT_DISK_FULL]: "free disk under bkit.workflows.minFreeGb even after your max cleanup steps (`bkit disk prune`); nothing created",
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
                if (named !== undefined && workflow !== "ship" && workflow !== "debug") {
                    throw new CommandError(EXIT.USAGE, "--branch is ship or debug only");
                }
                if (f.issue !== undefined && workflow !== "ship") {
                    throw new CommandError(EXIT.USAGE, "--issue is ship only");
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
                const target = workflow === "ship"
                    ? shipBranch(root, fid, named, session)
                    : workflow === "debug" && named
                        ? named
                        : `feat/${fid}`;
                if (isSharedBranch(target) && !(workflow === "debug" && target === DEV)) {
                    throw new CommandError(EXIT_REFUSED, workflow === "ship"
                        ? `refusing to ship ${target}: /bkit-ship ships a feature branch into ${DEV} only; it never opens a PR from ${DEV} into ${MAIN} or merges into ${MAIN}, releases stay manual. Name the feature branch to ship.`
                        : `refusing to ship ${target} as a feature branch`);
                }
                if (workflow === "ship" && git(root, ["remote", "get-url", "origin"]) !== null) {
                    fetchBranch(root, DEV);
                    const remote = remoteHas(root, target);
                    if (remote === "error")
                        throw new CommandError(EXIT_FETCH, `cannot fetch origin ${target}: remote branch evidence unavailable`);
                    if (remote === "yes") {
                        fetchBranch(root, target);
                        assertShipEligible(root, `refs/remotes/origin/${target}`);
                    }
                    if (hasLocal(root, target))
                        assertShipEligible(root, `refs/heads/${target}`);
                }
                if (workflow === "debug" &&
                    named &&
                    !hasLocal(root, target) &&
                    !runGit(root, ["show-ref", "--verify", "--quiet", `refs/remotes/origin/${target}`]).ok) {
                    throw new CommandError(EXIT_REFUSED, `${target} does not exist — debug adopts an existing branch`);
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
                        if (workflow === "debug" &&
                            named &&
                            git(wtDir, ["branch", "--show-current"]) !== target) {
                            throw new CommandError(EXIT_REFUSED, `${wtDir} is on another branch; requested ${target} — leave its work intact and use the matching checkout`);
                        }
                        mode = "resumed";
                    }
                    else if (workflow !== "debug" || session !== target) {
                        // Debug adopts an existing feat/{fid}; it never mints a branch of its own.
                        if (addWorktree(root, wtDir, target, workflow !== "debug", workflow, ctx.log))
                            mode = "created";
                    }
                }
                const wt = mode === "adopted" ? root : wtDir;
                const logDir = logDirOf(wt, month, fid);
                const marker = ownershipMarker(root, fid);
                if (mode === "adopted") {
                    if (workflow === "debug" && named && git(root, ["branch", "--show-current"]) !== target) {
                        throw new CommandError(EXIT_REFUSED, `adopt mode: checkout does not hold requested ${target}; use its existing checkout or enable worktrees`);
                    }
                    if (workflow === "ship" && git(root, ["branch", "--show-current"]) !== target) {
                        const sw = runGit(root, hasLocal(root, target)
                            ? ["switch", target]
                            : ["switch", "--no-track", "-c", target, `refs/remotes/origin/${target}`]);
                        if (!sw.ok) {
                            if (!hasLocal(root, target) && remoteHas(root, target) !== "yes") {
                                throw new CommandError(EXIT_REFUSED, `${target} does not exist — name the feature branch to ship`);
                            }
                            throw new CommandError(EXIT_REFUSED, `adopt mode: cannot switch to ${target} — commit or stash local changes, then re-run (${sw.stderr})`);
                        }
                    }
                    const here = git(root, ["branch", "--show-current"]) ?? "";
                    // Debug may work in place on dev (its shared-checkout path); nothing works in place on main.
                    if (here === "" || here === MAIN || (here === DEV && workflow !== "debug")) {
                        throw new CommandError(EXIT_REFUSED, here === ""
                            ? "adopt mode: detached HEAD — check out the feature branch"
                            : `adopt mode: current branch is ${here} — refusing to work in place on ${here}`);
                    }
                }
                // An in-place run on a shared branch records what was dirty before it, so its
                // commits and push take only its own work.
                const shared = mode === "adopted" && isSharedBranch(git(root, ["branch", "--show-current"]) ?? "")
                    ? openSharedRecord(root, fid, workflow, logDir)
                    : undefined;
                let rebaseConflict = false;
                let sentinel = null;
                let carried = null;
                const sentinelPath = path.join(logDir, ".rebase-failed");
                // A docs-only branch cannot land while it carries unpushed dev work: refuse
                // now, not after the whole phase. Checked before the resume rebase, which
                // replays such commits under new SHAs this commit-by-commit check no longer
                // knows; the close itself names them then.
                if (DOCS_ONLY_WORKFLOWS.includes(workflow) && mode !== "adopted") {
                    const inherited = inheritedDevCommits(root, target);
                    if (inherited.length > 0) {
                        throw new CommandError(EXIT_REFUSED, inheritedDevRefusal(root, target, workflow, inherited.length));
                    }
                }
                if (mode === "resumed" && workflow !== "ship") {
                    // Cleared before every attempt: a sentinel left by an earlier run would
                    // send this one to the Failure Path after a clean rebase.
                    fs.rmSync(sentinelPath, { force: true });
                    let failure;
                    if (rebaseInProgress(wt)) {
                        failure = {
                            conflict: true,
                            detail: "a rebase is already in progress",
                            onto: worktreeBase(wt, workflow),
                        };
                    }
                    else if (workflow === "debug") {
                        ctx.log("debug resume: preserving branch history for CI evidence; no rebase");
                    }
                    else {
                        fetchBranch(wt, DEV);
                        const onto = worktreeBase(wt, workflow, ctx.log);
                        const statusFile = path.join(logDir, "status.jsonl");
                        carried = carryLeftovers(wt, { fid, onto, statusFile }, ctx.log);
                        // Journal rows a hook appended after the carry commit go aside by hand and
                        // back after the rebase, never through `--autostash`: a dev that appended to
                        // the same file makes the autostash pop conflict, and git still exits 0.
                        const journal = hasLeftovers(wt) ? journalRowsAppended(wt, statusFile) : null;
                        for (const [rel, a] of journal ?? [])
                            fs.writeFileSync(path.join(wt, rel), a.committed);
                        // A tracked copy entry setup copied over (a committed placeholder `.env`) is
                        // never committed, so the rebase sets it aside and puts it back. Only when
                        // nothing else is left: a refused carry commit still stops the rebase.
                        const aside = hasLeftovers(wt) ? [] : ["--autostash"];
                        const before = git(wt, ["rev-parse", "HEAD"]);
                        const rb = runGit(wt, ["rebase", "--rebase-merges", ...aside, onto]);
                        const unput = journal === null ? "" : putJournalRowsBack(wt, journal);
                        // The rebase replays the carry commit on top: report the replayed one.
                        if (rb.ok && carried?.sha)
                            carried.sha = git(wt, ["rev-parse", "HEAD"]);
                        if (rb.ok)
                            recordRebase(path.join(logDir, "status.jsonl"), before, git(wt, ["rev-parse", "HEAD"]));
                        if (!rb.ok) {
                            failure = {
                                conflict: rebaseInProgress(wt),
                                detail: [rb.stdout, rb.stderr, unput].filter(Boolean).join("\n"),
                                onto,
                            };
                        }
                    }
                    if (failure) {
                        const note = `[bkit-worktrees] ${new Date().toISOString()} rebase onto ${failure.onto} stopped\n${failure.detail}\n`;
                        const held = rebaseInProgress(wt) ? rebaseNoteFile(wt) : null;
                        if (held !== null)
                            fs.appendFileSync(held, note);
                        else {
                            fs.mkdirSync(logDir, { recursive: true });
                            fs.appendFileSync(path.join(logDir, "rebase-resolve-log.md"), note);
                        }
                        fs.writeFileSync(sentinelPath, "");
                        ctx.log(`rebase onto ${failure.onto} failed in ${wt}: ${failure.detail.split("\n")[0]}`);
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
                const bkitEnv = done ? linkBkitEnv(root, wt, fid, ctx.log) : null;
                const direnvAllowed = done && allowDirenv(root, wt, ctx.log);
                const wantInstall = done && config.worktreeInstall && fs.existsSync(path.join(wt, "package.json"));
                const installStatus = wantInstall ? install(wt, ctx.log) : 0;
                const baseRef = worktreeBase(wt, workflow);
                const branch = git(wt, ["branch", "--show-current"]) ?? "";
                const branchWarning = workflow === "ship"
                    ? shipBranchWarning(branch, fid, f.issue === undefined ? undefined : String(f.issue))
                    : null;
                if (branchWarning !== null)
                    ctx.log(branchWarning);
                ctx.emit({
                    worktreePath: wt,
                    repoRoot: root,
                    branch,
                    mode,
                    branchWarning,
                    owned: fs.existsSync(marker),
                    rebaseConflict,
                    sentinel,
                    logDir,
                    baseRef,
                    baseSha: git(wt, ["merge-base", baseRef, "HEAD"]),
                    carriedSha: carried?.sha ?? null,
                    carriedDropped: carried?.dropped ?? [],
                    copied,
                    copyMissing,
                    bkitEnv,
                    direnvAllowed,
                    installed: wantInstall && installStatus === 0,
                    ...(shared === undefined
                        ? {}
                        : { startSha: shared.startSha, aheadAtStart: shared.aheadAtStart }),
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
            summary: "Remove a workflow-owned worktree when its work is safely on dev; conditionally delete its local branch and retain the remote branch.",
            use: "workflow",
            flags: [
                FID_FLAG,
                {
                    name: "branch",
                    type: "string",
                    help: "feature branch to delete locally only at its proved landed tip; preserve unlanded/uncertain work and retain the remote branch",
                },
            ],
            output: {
                removed: "the worktree was removed",
                reason: "why it was not removed: absent | not-owned | held-elsewhere | uncommitted | not-landed | remote-not-landed | unavailable; null when removed",
                worktreePath: "the worktree's path",
                repoRoot: "the main checkout — cd here if the shell was inside the removed worktree",
                branchDeleted: "--branch: the proved local tip was atomically deleted; false when preserved or unavailable, null without --branch",
                remoteDeleted: "--branch: false because the remote branch is retained under the no-force-push policy; null without --branch",
                branchBlockedBy: "--branch: the worktree still holding the branch or changed-after-proof; null when none",
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
