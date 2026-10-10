// bkit fids check|parse — feature-id format per tracker, and recovering a FID
// from a branch name or a PR-body marker.
//
// A FID names the branch (`feat/{FID}`), the log folder and every artifact, so
// it is checked before first use. Its shape follows the tracker that minted it:
//   github  {N}-{slug}           ^[0-9]+-[a-z0-9-]+$
//   linear  {team}-{N}-{slug}    ^[a-z]+-[0-9]+-[a-z0-9-]+$  (issue id lowercased first)
//   none    any slug             ^[a-z0-9][a-z0-9-]*$        (no tracker shape; still path-safe)
//   any     github or linear     ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$  (auto's CI_DEV allowlist)
import * as path from "node:path";
import { parseIssueTracker } from "../../install/manifest.js";
import { CommandError, EXIT, git } from "../lib.js";
import { readBkitConfig } from "../../shared/settings.js";
import { str } from "./status.js";
export const FID_PATTERNS = {
    github: /^[0-9]+-[a-z0-9-]+$/,
    linear: /^[a-z]+-[0-9]+-[a-z0-9-]+$/,
    none: /^[a-z0-9][a-z0-9-]*$/,
    any: /^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$/,
};
/** The slug every recovered FID must pass before it touches a path (auto's branch fallback). */
const SLUG = FID_PATTERNS.none;
/** Exit code: no FID could be recovered from the marker or the branch. */
export const EXIT_NO_FID = 3;
/** `package.json` `bkit.issueTracker` at the main checkout (cwd outside git); default `none`. */
export function readIssueTracker(cwd) {
    const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
    return readBkitConfig(common ? path.dirname(common) : cwd).issueTracker;
}
function trackerFlag(value, cwd, allowAny) {
    if (value === undefined)
        return readIssueTracker(cwd);
    if (value === "any" && allowAny)
        return "any";
    const t = parseIssueTracker(value);
    if (!t) {
        throw new CommandError(EXIT.USAGE, `--tracker must be github, linear, none${allowAny ? ", any" : ""}; got "${value}"`);
    }
    return t;
}
/** Linear issue ids arrive uppercase (`ABC-123`); the FID carries them lowercased. */
export const normaliseFid = (fid, tracker) => tracker === "linear" ? fid.toLowerCase() : fid;
/**
 * The tracker issue id a FID embeds, or null when it embeds none:
 * github the leading numeric segment, linear the first two segments uppercased.
 */
export function issueIdOf(fid, tracker) {
    const [first = "", second = ""] = fid.split("-");
    if (tracker === "github")
        return /^[0-9]+$/.test(first) ? first : null;
    if (tracker === "linear") {
        const id = `${first}-${second}`.toUpperCase();
        return /^[A-Z]+-[0-9]+$/.test(id) ? id : null;
    }
    if (tracker === "any") {
        const m = /^([0-9]+|[a-z]+-[0-9]+)(?=-)/.exec(fid);
        return m ? m[1].toUpperCase() : null;
    }
    return null;
}
/** The PR-body marker build and ship write, per tracker. Group 1 = issue id (absent for none), last = FID. */
const MARKERS = {
    github: /<!-- bkit:issue=#([0-9]+) bkit:fid=(\S+) -->/,
    linear: /<!-- bkit:issue=([A-Za-z]+-[0-9]+) bkit:fid=(\S+) -->/,
    none: /<!-- bkit:fid=(\S+) -->/,
};
/** FID from the marker, when present and well-formed for the tracker. */
export function fromMarker(text, tracker) {
    const m = MARKERS[tracker].exec(text);
    if (!m)
        return null;
    const fid = normaliseFid(m[m.length - 1], tracker);
    if (!FID_PATTERNS[tracker].test(fid))
        return null;
    const issueId = tracker === "none" ? null : tracker === "linear" ? m[1].toUpperCase() : m[1];
    return { fid, issueId, source: "marker" };
}
/** FID from `feat/{FID}`; the slug check, then the issue id the tracker needs. */
export function fromBranch(branch, tracker) {
    if (!branch.startsWith("feat/"))
        return { ok: false, why: `branch "${branch}" is not feat/{FID}` };
    const fid = branch.slice("feat/".length);
    if (!SLUG.test(fid))
        return { ok: false, why: `"${fid}" is not a slug (${SLUG.source})` };
    const issueId = issueIdOf(fid, tracker);
    if (tracker !== "none" && issueId === null) {
        return { ok: false, why: `"${fid}" embeds no ${tracker} issue id` };
    }
    return { ok: true, parsed: { fid, issueId, source: "branch" } };
}
const TRACKER_FLAG = {
    name: "tracker",
    type: "string",
    help: "github | linear | none (default: package.json bkit.issueTracker, else none)",
};
export const fidsCommand = {
    noun: "fids",
    summary: "Feature-id format per tracker, and FID recovery from a branch or PR-body marker.",
    verbs: {
        check: {
            summary: "Validate a FID for the tracker: exit 0 valid, exit 1 not.",
            flags: [
                { name: "fid", type: "string", required: true, help: "feature id to check" },
                { ...TRACKER_FLAG, help: `${TRACKER_FLAG.help}; any = github or linear shape (CI_DEV)` },
            ],
            output: {
                fid: "the FID as checked (linear: lowercased)",
                tracker: "tracker the shape came from",
                valid: "true when the FID matches",
                pattern: "the regex checked",
                issueId: "issue id the FID embeds (null under none, or when invalid)",
            },
            run: (ctx) => {
                const tracker = trackerFlag(str(ctx.flags.tracker), ctx.cwd, true);
                const fid = normaliseFid(String(ctx.flags.fid), tracker);
                const pattern = FID_PATTERNS[tracker];
                const valid = pattern.test(fid);
                if (!valid)
                    ctx.log(`FID "${fid}" does not match the ${tracker} shape ${pattern.source}`);
                ctx.emit({
                    fid,
                    tracker,
                    valid,
                    pattern: pattern.source,
                    issueId: valid ? issueIdOf(fid, tracker) : null,
                });
                return valid ? EXIT.OK : EXIT.NO;
            },
        },
        parse: {
            summary: "Recover FID and issue id: the PR-body marker first, then a feat/{FID} branch.",
            flags: [
                {
                    name: "marker",
                    type: "string",
                    help: "text holding the bkit:fid marker (e.g. the PR body)",
                },
                { name: "branch", type: "string", help: "branch name, feat/{FID}" },
                TRACKER_FLAG,
            ],
            output: {
                fid: "the recovered FID",
                issueId: "tracker issue id (null under none)",
                source: "marker | branch",
                tracker: "tracker the shapes came from",
            },
            exitCodes: { [EXIT_NO_FID]: "neither the marker nor the branch yielded a valid FID" },
            run: (ctx) => {
                const marker = str(ctx.flags.marker);
                const branch = str(ctx.flags.branch);
                if (marker === undefined && branch === undefined) {
                    throw new CommandError(EXIT.USAGE, "give --marker, --branch, or both");
                }
                const tracker = trackerFlag(str(ctx.flags.tracker), ctx.cwd, false);
                const viaMarker = marker === undefined ? null : fromMarker(marker, tracker);
                if (viaMarker) {
                    ctx.emit({ ...viaMarker, tracker });
                    return EXIT.OK;
                }
                if (marker !== undefined)
                    ctx.log(`no well-formed ${tracker} bkit:fid marker — trying the branch`);
                if (branch === undefined)
                    return EXIT_NO_FID;
                const viaBranch = fromBranch(branch, tracker);
                if (!viaBranch.ok) {
                    ctx.log(viaBranch.why);
                    return EXIT_NO_FID;
                }
                ctx.emit({ ...viaBranch.parsed, tracker });
                return EXIT.OK;
            },
        },
    },
};
