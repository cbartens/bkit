// The one way bkit lands commits on dev from a throwaway: build them in a
// detached worktree off a fresh origin/dev and push it as dev. The main
// checkout's branch, index and edits are never touched, and local dev commits
// missing from origin/dev are never pushed as they stand — a caller that wants
// some of them replays exactly those. dev moved underneath → rebuild on the new
// dev and push again, with backoff. Used by the design / plan close, the
// build / debug roadmap mirror, ship's close and FAILED record, and the
// own-commit push of a debug run in place on dev, which replays the run's
// commits. The throwaway runs no git hooks: it lands bookkeeping (docs, logs,
// ledgers, `[skip ci]`) or the commits a debug run on dev made.
import * as fs from "node:fs";
import * as path from "node:path";
import { CommandError, DEV, EXIT, git, runGit } from "./lib.js";
import { TIMEOUTS } from "../shared/timeouts.js";
const REMOTE = "origin";
const UPSTREAM = `${REMOTE}/${DEV}`;
/** dev moved before git sent anything: git compared the remote's dev and stopped. */
const MOVED_BEFORE = /\[rejected\][^\n]*\((?:fetch first|non-fast-forward)\)/;
/** dev moved while the push was in flight: the server's ref update lost the race. */
const MOVED_DURING = /\[remote rejected\][^\n]*\((?:incorrect old value provided|cannot lock ref[^\n]*)\)/;
/** The server turned the push away: branch protection, a ruleset, an HTTP 403. */
const REFUSED = /\[remote rejected\]|returned error: 403|\bGH0\d\d\b/;
/**
 * The refspec every dev fetch uses. A bare `git fetch origin dev` writes only
 * FETCH_HEAD when the clone's fetch refspec does not cover `dev` (a single-branch
 * clone), leaving `origin/dev` stale; a landing built on it is rejected on every push.
 */
export const DEV_REFSPEC = `+refs/heads/${DEV}:refs/remotes/${UPSTREAM}`;
/** Fetch origin's dev into `origin/dev`, whatever the clone's fetch refspec covers. */
export const fetchDev = (cwd) => runGit(cwd, ["fetch", REMOTE, DEV_REFSPEC]);
/**
 * A dev fetch that failed only because another git process in this clone (a
 * second landing's fetch or push) updated or held `origin/dev` while it ran.
 */
const DEV_REF_RACE = new RegExp(`cannot lock ref 'refs/remotes/${UPSTREAM}'`);
export const devRefRace = (stderr) => DEV_REF_RACE.test(stderr);
/** A dev push rejected only because dev moved: rebuild on the new dev, push again. */
export const devMoved = (stderr) => MOVED_BEFORE.test(stderr) || MOVED_DURING.test(stderr);
/** A dev push the server refused for a reason other than dev moving. */
export const devRefused = (stderr) => !devMoved(stderr) && REFUSED.test(stderr);
/**
 * Milliseconds to wait before retry `retry` (1-based) of a landing: `startS`
 * doubling per retry, capped at `capS`, then jittered down by up to half so two
 * landings that collided once do not retry in step.
 */
export function landBackoffMs(retry, random = Math.random, startS = TIMEOUTS.LAND_BACKOFF_START_S, capS = TIMEOUTS.LAND_BACKOFF_CAP_S) {
    const s = Math.min(startS * 2 ** (retry - 1), capS);
    return Math.round(s * 1000 * (0.5 + random() / 2));
}
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/** A FID names one folder: no separators, no `..`. */
const SAFE_FID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
/** The throwaway checkout a landing is built in, beside the feature worktrees. */
export function landDir(root, fid) {
    if (!SAFE_FID.test(fid) || fid.includes(".."))
        throw new CommandError(EXIT.USAGE, `--fid "${fid}" is not a feature id`);
    return path.join(root, ".worktrees", `_land-${fid}`);
}
/**
 * Remove a throwaway checkout. A landing killed inside `worktree add` leaves it
 * locked ("initializing"), which a single `--force` and `prune` both skip, so it
 * is unlocked first; a folder git no longer lists is the landing's own scratch.
 */
export function dropLandTree(root, dir) {
    runGit(root, ["worktree", "unlock", dir]);
    if (fs.existsSync(dir))
        runGit(root, ["worktree", "remove", "--force", "--force", dir]);
    runGit(root, ["worktree", "prune"]);
    if (fs.existsSync(dir))
        fs.rmSync(dir, { recursive: true, force: true });
}
/** `core.hooksPath` pointing nowhere, so no hook runs. */
const NO_HOOKS = process.platform === "win32" ? "NUL" : "/dev/null";
/**
 * Run `fn` with git hooks off for every git child it starts: one more
 * `GIT_CONFIG_*` entry (git >= 2.31) setting `core.hooksPath`, restored after.
 */
export async function withoutHooks(fn) {
    const saved = process.env.GIT_CONFIG_COUNT;
    const n = Number(saved ?? 0) || 0;
    const key = `GIT_CONFIG_KEY_${n}`;
    const value = `GIT_CONFIG_VALUE_${n}`;
    process.env.GIT_CONFIG_COUNT = String(n + 1);
    process.env[key] = "core.hooksPath";
    process.env[value] = NO_HOOKS;
    try {
        return await fn();
    }
    finally {
        if (saved === undefined)
            delete process.env.GIT_CONFIG_COUNT;
        else
            process.env.GIT_CONFIG_COUNT = saved;
        delete process.env[key];
        delete process.env[value];
    }
}
/**
 * Land on dev what `build` makes: per attempt, fetch dev, add `dir` detached at
 * origin/dev, let `build` make one or more commits there (a bookkeeping commit,
 * or a replay of a run's commits), push `HEAD:dev` — git hooks off. `build`
 * throwing stops the landing with that throw. A server refusal runs `refused` on
 * the built commits first, when given. dev moving, or another landing in this
 * clone updating `origin/dev` during the fetch, retries with backoff within
 * LAND_ATTEMPTS. `dir` is removed on every path.
 */
export async function pushToDev(o) {
    o.log("git hooks skipped in the throwaway dev checkout — it lands bookkeeping, or the commits a debug run on dev made");
    for (let attempt = 1;; attempt++) {
        let wait = 0;
        dropLandTree(o.root, o.dir);
        try {
            const outcome = await withoutHooks(async () => {
                const fetched = fetchDev(o.root);
                if (!fetched.ok) {
                    if (devRefRace(fetched.stderr) && attempt < TIMEOUTS.LAND_ATTEMPTS)
                        return "raced";
                    return { kind: "fetch-failed", stderr: fetched.stderr };
                }
                const added = runGit(o.root, ["worktree", "add", "--detach", o.dir, UPSTREAM]);
                if (!added.ok)
                    return { kind: "setup-failed", stderr: added.stderr };
                o.build(o.dir, attempt);
                const pushed = runGit(o.dir, ["push", REMOTE, `HEAD:${DEV}`]);
                if (pushed.ok) {
                    return {
                        kind: "landed",
                        sha: git(o.dir, ["rev-parse", "HEAD"]) ?? "",
                        attempts: attempt,
                    };
                }
                if (devRefused(pushed.stderr)) {
                    await o.refused?.(o.dir, pushed.stderr);
                    return { kind: "refused", stderr: pushed.stderr };
                }
                if (!devMoved(pushed.stderr))
                    return { kind: "push-failed", stderr: pushed.stderr };
                return "moved";
            });
            if (typeof outcome !== "string")
                return outcome;
            if (attempt >= TIMEOUTS.LAND_ATTEMPTS)
                return { kind: "exhausted", attempts: attempt };
            wait = landBackoffMs(attempt);
            const s = (wait / 1000).toFixed(1);
            o.log(outcome === "moved"
                ? `dev moved before push ${attempt} of ${TIMEOUTS.LAND_ATTEMPTS} — rebuilding on the new dev in ${s}s`
                : `another git process updated ${UPSTREAM} during the fetch of try ${attempt} of ${TIMEOUTS.LAND_ATTEMPTS} — fetching again in ${s}s`);
        }
        finally {
            dropLandTree(o.root, o.dir);
        }
        await sleep(wait);
    }
}
