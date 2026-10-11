// checks/after/suppression.ts — per-package advisory opt-out (`package.json`
// `bkit.ignoreAdvisories`).
//
// A detector can be right in general and still fire on a package where the condition is
// deliberately not applicable (a rule-linter whose test titles mention `@live`, an
// integration lane mocked by design). package.json is comment-free, so the opt-out is a
// JSON key, not a comment.
//
// Each detector reads the OWNING package's list and drops only that package — never the
// whole advisory, which would hide a real finding in a sibling package (detector findings
// aggregate every affected package into one entry). Advisory-only: a blocker is never
// suppressible whatever the manifest says.
import { readPackageJson } from "../../shared/package-json.js";
/**
 * Advisory ids `dir/package.json` opts out of. A missing manifest, a `bkit` key that is
 * absent or not an object, and an `ignoreAdvisories` that is absent or not an array all
 * yield no ids — never a throw.
 */
export function ignoredAdvisoryIds(dir) {
    const read = readPackageJson(dir);
    if (!read.ok)
        return new Set();
    const bkit = read.pkg.bkit;
    if (typeof bkit !== "object" || bkit === null || Array.isArray(bkit))
        return new Set();
    const list = bkit.ignoreAdvisories;
    if (!Array.isArray(list))
        return new Set();
    return new Set(list.filter((id) => typeof id === "string"));
}
/**
 * True when `dir/package.json` opts out of `id` AND the finding resolved to advisory
 * severity. `blocker` returns false unconditionally — a blocker is not suppressible.
 */
export function isAdvisorySuppressed(dir, id, severity) {
    if (severity !== "advisory")
        return false;
    return ignoredAdvisoryIds(dir).has(id);
}
