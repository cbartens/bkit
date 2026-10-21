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
    diskMinFreeGb: 40,
    issueTracker: DEFAULT_ISSUE_TRACKER,
    // `started` is a state type every Linear team has; In Review is a name a default team lacks.
    linear: { team: null, project: null, progress: "started", review: "In Review" },
    jira: { site: null, project: null, progress: "In Progress", review: "In Review" },
    githubProject: null,
    shipGateRequiredLanes: [],
    // What bkit's workflows write: plan / design / build logs and the ledgers. Never
    // `docs/**`: a project doc can be a test's input, so a docs edit can red a test.
    minPushPaths: ["docs/plans/**", "docs/*.jsonl", ".bkit/*.jsonl"],
    opencodeProvider: null,
    opencodeProviders: [],
    cloudAgents: DEFAULT_CLOUD_AGENTS,
    depUpdaterOptOut: false,
    issueTrackerExplicit: false,
    cloudAgentsExplicit: false,
};
const nonEmptyString = (v) => typeof v === "string" && v.trim() !== "";
const record = (v) => v !== null && typeof v === "object" && !Array.isArray(v) ? v : {};
const optionalString = (v) => (nonEmptyString(v) ? v.trim() : null);
/** Each moment's state from `raw`, else the default for that moment. */
function trackerStates(raw, defaults) {
    return {
        progress: nonEmptyString(raw.progress) ? raw.progress.trim() : defaults.progress,
        review: nonEmptyString(raw.review) ? raw.review.trim() : defaults.review,
    };
}
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
    const minFreeGb = (bkit.disk ?? {}).minFreeGb;
    const project = bkit.githubProject;
    const lanes = bkit.shipGateRequiredLanes;
    const book = bkit.minPushPaths;
    const provider = bkit.opencodeProvider;
    const providers = bkit.opencodeProviders;
    const linear = record(bkit.linear);
    const jira = record(bkit.jira);
    return {
        ciWorkflow: nonEmptyString(bkit.ciWorkflow) ? bkit.ciWorkflow : CONFIG_DEFAULTS.ciWorkflow,
        capstoneJob: nonEmptyString(bkit.capstoneJob) ? bkit.capstoneJob : CONFIG_DEFAULTS.capstoneJob,
        worktreeCopy: Array.isArray(copy) && copy.every(nonEmptyString)
            ? [...copy]
            : [...CONFIG_DEFAULTS.worktreeCopy],
        worktreeInstall: typeof worktree.install === "boolean" ? worktree.install : CONFIG_DEFAULTS.worktreeInstall,
        diskMinFreeGb: typeof minFreeGb === "number" && Number.isFinite(minFreeGb) && minFreeGb >= 0
            ? minFreeGb
            : CONFIG_DEFAULTS.diskMinFreeGb,
        issueTracker: parseIssueTracker(bkit.issueTracker) ?? CONFIG_DEFAULTS.issueTracker,
        linear: {
            team: optionalString(linear.team),
            project: optionalString(linear.project),
            ...trackerStates(linear, CONFIG_DEFAULTS.linear),
        },
        jira: {
            site: nonEmptyString(jira.site) ? jira.site.trim().replace(/\/+$/, "") : null,
            project: optionalString(jira.project),
            ...trackerStates(jira, CONFIG_DEFAULTS.jira),
        },
        githubProject: project === false
            ? false
            : project !== null && typeof project === "object" && !Array.isArray(project)
                ? project
                : null,
        shipGateRequiredLanes: Array.isArray(lanes) ? lanes.filter(nonEmptyString) : [],
        // An explicit [] is kept: it switches the min push off.
        minPushPaths: Array.isArray(book)
            ? book.filter(nonEmptyString)
            : [...CONFIG_DEFAULTS.minPushPaths],
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
