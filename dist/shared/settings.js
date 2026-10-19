// shared/settings.ts — the consumer's `package.json` `bkit` settings.
//
// One reader, one set of defaults, so no command hard-codes a CI workflow name,
// a check name, or an app folder.
import { DEFAULT_CLOUD_AGENTS, DEFAULT_ISSUE_TRACKER, parseCloudAgents, parseIssueTracker, } from "../install/manifest.js";
import { isOpencodeProvider } from "../render/models.js";
import { readPackageJson } from "./package-json.js";
export const CONFIG_DEFAULTS = {
    ciWorkflow: "bkit-ci.yml",
    capstoneJob: "bkit-tests-check",
    worktreeCopy: [".env", ".env.local"],
    worktreeInstall: true,
    issueTracker: DEFAULT_ISSUE_TRACKER,
    githubProject: null,
    shipGateRequiredLanes: [],
    opencodeProvider: null,
    opencodeProviders: [],
    cloudAgents: DEFAULT_CLOUD_AGENTS,
    depUpdaterOptOut: false,
    issueTrackerExplicit: false,
    cloudAgentsExplicit: false,
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
    const provider = bkit.opencodeProvider;
    const providers = bkit.opencodeProviders;
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
        opencodeProvider: typeof provider === "string" && isOpencodeProvider(provider) ? provider : null,
        opencodeProviders: Array.isArray(providers)
            ? providers.filter((v) => typeof v === "string" && isOpencodeProvider(v))
            : [],
        cloudAgents: parseCloudAgents(bkit.cloudAgents) ?? CONFIG_DEFAULTS.cloudAgents,
        depUpdaterOptOut: bkit.depUpdater === "none",
        issueTrackerExplicit: bkit.issueTracker !== undefined,
        cloudAgentsExplicit: bkit.cloudAgents !== undefined,
    };
}
