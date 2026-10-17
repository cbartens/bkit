// bkit-latest — is the bkit this repo rendered its workflows and audit templates
// from behind the newest published release?
//
// `bkit repo info` (every phase workflow's Step 1) and the anchor stamp on every
// audit report, design and plan report it, so a run on outdated workflow /
// template text says so. Advisory only: no registry answer means `latest`
// is null and nothing is printed, never an error. The registry answer is kept in
// the git common dir (shared by every worktree, never committed) so parallel runs
// ask npm at most once a day.
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { readBkitVersion } from "../install/version-file.js";
import { parseJson } from "./json.js";
import { PACKAGE_RUNNER } from "./package-manager.js";
import { TIMEOUTS } from "./timeouts.js";
export const BKIT_PACKAGE = "@cbartens/bkit";
/** Cache file name inside the git common dir. */
export const BKIT_LATEST_CACHE = "bkit-latest-version.json";
/** Set to anything but `0` / empty to skip the registry lookup (air-gapped machines, CI). */
export const NO_UPDATE_CHECK_ENV = "BKIT_NO_UPDATE_CHECK";
const SEMVER_RE = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;
/** Order of two prerelease identifier lists per semver §11: numeric < alphanumeric, shorter < longer. */
function comparePrerelease(a, b) {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const x = a[i];
        const y = b[i];
        if (x === undefined)
            return -1;
        if (y === undefined)
            return 1;
        const xn = /^\d+$/.test(x);
        const yn = /^\d+$/.test(y);
        if (xn && yn) {
            if (Number(x) !== Number(y))
                return Number(x) < Number(y) ? -1 : 1;
        }
        else if (xn !== yn) {
            return xn ? -1 : 1;
        }
        else if (x !== y) {
            return x < y ? -1 : 1;
        }
    }
    return 0;
}
/**
 * -1 / 0 / 1 for `a` older / equal / newer than `b`, compared as numbers (so 5.10.0
 * is newer than 5.9.0) and with a prerelease older than its release. null when
 * either is not a semver.
 */
export function compareSemver(a, b) {
    const ma = SEMVER_RE.exec(a.trim());
    const mb = SEMVER_RE.exec(b.trim());
    if (!ma || !mb)
        return null;
    for (let i = 1; i <= 3; i++) {
        const x = Number(ma[i]);
        const y = Number(mb[i]);
        if (x !== y)
            return x < y ? -1 : 1;
    }
    const pa = ma[4];
    const pb = mb[4];
    if (pa === undefined && pb === undefined)
        return 0;
    if (pa === undefined)
        return 1;
    if (pb === undefined)
        return -1;
    const c = comparePrerelease(pa.split("."), pb.split("."));
    return c === 0 ? 0 : c < 0 ? -1 : 1;
}
/** The newest published bkit per the registry, or null on any failure (offline, timeout, no pnpm). */
export function lookupLatestPublished(cwd, timeoutS = TIMEOUTS.BKIT_LATEST_LOOKUP_TIMEOUT_S) {
    const res = spawnSync(PACKAGE_RUNNER, ["view", BKIT_PACKAGE, "version"], {
        cwd,
        encoding: "utf-8",
        ...(timeoutS === null ? {} : { timeout: timeoutS * 1000 }),
    });
    if (res.error || res.status !== 0)
        return null;
    const version = (res.stdout ?? "").trim().replace(/^v/, "");
    return SEMVER_RE.test(version) ? version : null;
}
/** The cached registry answer when still fresh: a version, or null for a remembered failure. */
function readCache(file, now) {
    if (!fs.existsSync(file))
        return undefined;
    const parsed = parseJson(fs.readFileSync(file, "utf-8"));
    if (!parsed.ok || typeof parsed.value !== "object" || parsed.value === null)
        return undefined;
    const { latest, checkedAt } = parsed.value;
    if (typeof checkedAt !== "number")
        return undefined;
    const value = typeof latest === "string" && SEMVER_RE.test(latest) ? latest : null;
    const ttl = value === null ? TIMEOUTS.BKIT_LATEST_RETRY_S : TIMEOUTS.BKIT_LATEST_CACHE_S;
    return now - checkedAt < ttl * 1000 && now >= checkedAt ? { latest: value } : undefined;
}
/** Remember the registry answer; a cache that cannot be written only costs a lookup next run. */
function writeCache(file, latest, now) {
    const tmp = `${file}.${process.pid}.tmp`;
    try {
        fs.writeFileSync(tmp, `${JSON.stringify({ latest, checkedAt: now })}\n`);
        fs.renameSync(tmp, file);
    }
    catch {
        // Read-only git dir: the next run asks the registry again, nothing else changes.
        fs.rmSync(tmp, { force: true });
    }
}
/**
 * Whether this repo's bkit is behind the newest release. `gitCommonDir` holds the
 * once-a-day cache; null (not a git repo) skips the cache, not the check.
 */
export function bkitVersionStatus(root, gitCommonDir, deps = {}) {
    const version = readBkitVersion(path.join(root, ".bkit", "version"))?.pinnedVersion || null;
    const unknown = { version, latest: null, outdated: null, advisory: null };
    if (version === null)
        return unknown;
    const optOut = process.env[NO_UPDATE_CHECK_ENV];
    if (optOut !== undefined && optOut !== "" && optOut !== "0")
        return unknown;
    const now = (deps.now ?? Date.now)();
    const cacheFile = gitCommonDir === null ? null : path.join(gitCommonDir, BKIT_LATEST_CACHE);
    let latest;
    const cached = cacheFile === null ? undefined : readCache(cacheFile, now);
    if (cached !== undefined) {
        latest = cached.latest;
    }
    else {
        latest = (deps.lookup ?? lookupLatestPublished)(root);
        if (cacheFile !== null)
            writeCache(cacheFile, latest, now);
    }
    if (latest === null)
        return unknown;
    const order = compareSemver(version, latest);
    if (order === null)
        return { version, latest, outdated: null, advisory: null };
    const outdated = order < 0;
    return {
        version,
        latest,
        outdated,
        advisory: outdated
            ? `running bkit ${version}; ${latest} is out. Upgrade: ${PACKAGE_RUNNER} bkit upgrade --latest`
            : null,
    };
}
