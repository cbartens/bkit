// shared/settings.ts — the consumer's `package.json` `bkit` settings.
//
// One reader, one set of defaults, so no command hard-codes a CI workflow name,
// a check name, or an app folder.
import { DEFAULT_ISSUE_TRACKER, parseIssueTracker, } from "../install/manifest.js";
import { readPackageJson } from "./package-json.js";
export const CONFIG_DEFAULTS = {
    ciWorkflow: "ci.yml",
    capstoneJob: "bkit-tests-check",
    worktreeCopy: [".env", ".env.local"],
    worktreeInstall: true,
    issueTracker: DEFAULT_ISSUE_TRACKER,
    githubProject: null,
    shipGateRequiredLanes: [],
};
const nonEmptyString = (v) => typeof v === "string" && v.trim() !== "";
/**
 * Read `package.json` `bkit` from `root` (the main checkout). A missing file,
 * missing key, or wrongly typed value falls back to the default for that key.
 */
export function readBkitConfig(root) {
    // A missing or unparseable package.json takes every default; `bkit check` reports the file.
    const read = readPackageJson(root);
    const bkit = ((read.ok ? read.pkg.bkit : undefined) ?? {});
    const worktree = (bkit.worktree ?? {});
    const copy = worktree.copy;
    const project = bkit.githubProject;
    const lanes = bkit.shipGateRequiredLanes;
    return {
        ciWorkflow: nonEmptyString(bkit.ciWorkflow) ? bkit.ciWorkflow : CONFIG_DEFAULTS.ciWorkflow,
        capstoneJob: nonEmptyString(bkit.capstoneJob) ? bkit.capstoneJob : CONFIG_DEFAULTS.capstoneJob,
        worktreeCopy: Array.isArray(copy) && copy.every(nonEmptyString)
            ? [...copy]
            : [...CONFIG_DEFAULTS.worktreeCopy],
        worktreeInstall: typeof worktree.install === "boolean" ? worktree.install : CONFIG_DEFAULTS.worktreeInstall,
        issueTracker: parseIssueTracker(bkit.issueTracker) ?? CONFIG_DEFAULTS.issueTracker,
        githubProject: project === false
            ? false
            : project !== null && typeof project === "object" && !Array.isArray(project)
                ? project
                : null,
        shipGateRequiredLanes: Array.isArray(lanes) ? lanes.filter(nonEmptyString) : [],
    };
}
