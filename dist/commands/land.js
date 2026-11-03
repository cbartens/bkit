// The one way bkit lands commits on dev from a throwaway: build them in a
// detached worktree off a fresh origin/dev and push it as dev. The main
// checkout's branch, index and edits are never touched, and local dev commits
// missing from origin/dev are never pushed as they stand — a caller that wants
// some of them replays exactly those. dev moved underneath → rebuild on the new
// dev and push again, with backoff. Used by the design / plan close, the
// build / debug roadmap mirror, ship's close and FAILED record, and the
// own-commit push of a debug run in place on dev, which replays the run's
// commits. The throwaway runs its declared gate explicitly before pushing.
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { CommandError, DEV, EXIT, git, runGit } from "./lib.js";
import { TIMEOUTS } from "../shared/timeouts.js";
import { gitEnv } from "../ledgers/telemetry.js";
import { readBkitConfig } from "../shared/settings.js";
import { readPackageJson } from "../shared/package-json.js";
import { installCommand } from "../shared/package-manager.js";
import { minPushPathspecs } from "./ci/ci.js";
import { requiredPushGate, runPushGate } from "./ci/push-gate.js";
import { changedOutside } from "./workflow/ledgers.js";
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
/** Copy ignored inputs without replacing anything in the built checkout. */
function prepareLandInputs(root, dir, log) {
    const config = readBkitConfig(dir);
    const sourceRoot = fs.realpathSync(root);
    for (const entry of config.worktreeCopy) {
        const relative = path.normalize(entry);
        if (path.isAbsolute(relative) || relative === ".." || relative.startsWith(`..${path.sep}`)) {
            log(`landing input is outside the checkout — skipped: ${entry}`);
            continue;
        }
        const source = path.join(root, relative);
        const destination = path.join(dir, relative);
        const tracked = runGit(dir, ["ls-files", "--", relative]);
        if (!tracked.ok)
            throw new CommandError(EXIT.NO, `cannot inspect landing input: ${entry}`);
        if (tracked.stdout || fs.existsSync(destination))
            continue;
        if (!runGit(dir, ["check-ignore", "-q", "--", relative]).ok)
            continue;
        if (!fs.existsSync(source)) {
            log(`landing input absent in the main checkout: ${entry}`);
            continue;
        }
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.cpSync(source, destination, {
            recursive: true,
            dereference: true,
            filter: (file) => {
                const actual = fs.realpathSync(file);
                if (actual !== sourceRoot && !actual.startsWith(`${sourceRoot}${path.sep}`)) {
                    throw new CommandError(EXIT.NO, `landing input resolves outside the checkout: ${entry}`);
                }
                return true;
            },
        });
    }
    if (config.worktreeInstall) {
        const [command, ...args] = installCommand({ frozen: true });
        if (!fs.existsSync(path.join(dir, "pnpm-workspace.yaml")))
            args.push("--ignore-workspace");
        log("installing frozen dependencies in the throwaway dev checkout");
        const result = spawnSync(command, args, {
            cwd: dir,
            env: gitEnv(),
            encoding: "utf8",
            maxBuffer: 1 << 26,
        });
        if (result.error || result.status !== 0) {
            for (const line of `${result.stdout ?? ""}${result.stderr ?? ""}`
                .trim()
                .split("\n")
                .slice(-20))
                log(line);
            throw new CommandError(EXIT.NO, "landing dependency install failed — nothing pushed");
        }
    }
}
/** Validate the committed landing against the freshly fetched base before sending it. */
function checkLanding(root, dir, base, log) {
    const head = git(dir, ["rev-parse", "HEAD"]);
    const unchanged = () => head !== null &&
        git(dir, ["rev-parse", "HEAD"]) === head &&
        git(dir, ["status", "--porcelain", "--untracked-files=all", "--ignore-submodules=none"]) === "";
    if (!unchanged())
        throw new CommandError(EXIT.NO, "landing checkout is not clean — nothing pushed");
    if (!readPackageJson(dir).ok)
        throw new CommandError(EXIT.NO, "landing package.json is unreadable — nothing pushed");
    const diff = changedOutside(dir, base, head, minPushPathspecs(readBkitConfig(dir)));
    if (!diff.ok)
        throw new CommandError(EXIT.NO, `cannot classify landing: ${diff.stderr}`);
    const gate = diff.outside.length === 0 ? "bkit:gate:min" : requiredPushGate(dir);
    if (!gate)
        throw new CommandError(EXIT.NO, "landing has no declared full gate — nothing pushed");
    prepareLandInputs(root, dir, log);
    if (!unchanged())
        throw new CommandError(EXIT.NO, "landing preparation changed the checkout — nothing pushed");
    const status = runPushGate(dir, gate, log);
    if (status !== 0)
        throw new CommandError(EXIT.NO, `landing ${gate} failed (exit ${status}) — nothing pushed`);
    if (!unchanged())
        throw new CommandError(EXIT.NO, "landing gate changed the checkout — nothing pushed");
}
/**
 * Land on dev what `build` makes: per attempt, fetch dev, add `dir` detached at
 * origin/dev, let `build` make one or more commits there (a bookkeeping commit,
 * or a replay of a run's commits), validate the checkout, then push `HEAD:dev`.
 * Git hooks are off; the minimum or full local gate runs explicitly. `build`
 * throwing stops the landing with that throw. A server refusal runs `refused` on
 * the built commits first, when given. dev moving, or another landing in this
 * clone updating `origin/dev` during the fetch, retries with backoff within
 * LAND_ATTEMPTS. `dir` is removed on every path.
 */
export async function pushToDev(o) {
    o.log("git hooks skipped in the throwaway dev checkout — its declared minimum or full gate runs explicitly");
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
                const base = git(o.dir, ["rev-parse", "HEAD"]);
                if (!base)
                    throw new CommandError(EXIT.NO, "cannot read the fetched landing base");
                o.build(o.dir, attempt);
                checkLanding(o.root, o.dir, base, o.log);
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
