// The commit a feature's own work starts after, and the diff range measured from it.
// Kept apart from context.ts and status.ts so both can import it without an import cycle.
import { git } from "../lib.js";
const ORIGIN_DEV = "origin/dev";
/**
 * The commit the feature's own work starts after: the later of HEAD's meeting points with
 * `origin/dev` and with local `dev`. Neither later than the other (origin/dev was merged
 * into a branch cut from local dev) → a commit of the two merged, with both as parents;
 * a conflict there → the `origin/dev` meeting point, logged once. No `origin/dev` meeting
 * point → the name `origin/dev`.
 */
export function featureBase(cwd, log = () => undefined) {
    const o = git(cwd, ["merge-base", "HEAD", ORIGIN_DEV]);
    if (o === null || o === "")
        return ORIGIN_DEV;
    const l = git(cwd, ["merge-base", "HEAD", "refs/heads/dev"]);
    if (l === null || l === "" || l === o)
        return o;
    // Local dev already contains HEAD: its meeting point is HEAD itself, an empty range.
    if (l === git(cwd, ["rev-parse", "HEAD"]))
        return o;
    const isAncestor = (a, b) => git(cwd, ["merge-base", "--is-ancestor", a, b]) !== null;
    if (isAncestor(o, l))
        return l;
    if (isAncestor(l, o))
        return o;
    const tree = git(cwd, ["merge-tree", "--write-tree", l, o])?.split("\n")[0];
    const combined = tree === undefined || tree === ""
        ? null
        : git(cwd, [
            "-c",
            "user.name=bkit",
            "-c",
            "user.email=bkit@localhost",
            "commit-tree",
            tree,
            "-p",
            l,
            "-p",
            o,
            "-m",
            "feature base",
        ]);
    if (combined === null || combined === "") {
        log(`feature base: local dev and ${ORIGIN_DEV} do not merge cleanly — measuring from the ${ORIGIN_DEV} meeting point ${o}`);
        return o;
    }
    return combined;
}
/**
 * The base and range a diff reader measures when `--base` is absent. A feature base that is
 * the `origin/dev` meeting point is named `origin/dev` (`origin/dev...HEAD`); any other is a
 * commit read straight to HEAD (`{sha}..HEAD`), because the combined commit is not an ancestor.
 */
export function defaultRange(cwd, log = () => undefined) {
    const sha = featureBase(cwd, log);
    if (sha === ORIGIN_DEV || sha === git(cwd, ["merge-base", "HEAD", ORIGIN_DEV]))
        return { base: ORIGIN_DEV, range: `${ORIGIN_DEV}...HEAD` };
    return { base: sha, range: `${sha}..HEAD` };
}
