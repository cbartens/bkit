// shared/settings.ts — the consumer's `package.json` `bkit` settings.
//
// One reader, one set of defaults, so no command hard-codes a CI workflow name,
// a check name, or an app folder.
import { DEFAULT_CLOUD_AGENTS, DEFAULT_ISSUE_TRACKER, parseCloudAgents, parseIssueTracker, } from "../install/manifest.js";
import { isOpencodeProvider } from "../render/models.js";
import { readPackageJson } from "./package-json.js";
const BOARD_URL = /^https:\/\/github\.com\/(orgs|users)\/([^/?#\s]+)\/projects\/([1-9][0-9]*)(?:[/?#].*)?$/;
/** The board a `https://github.com/{orgs|users}/<login>/projects/<n>[/views/…]` URL names; null otherwise. */
export function parseGithubBoardUrl(url) {
    const m = BOARD_URL.exec(url.trim());
    if (!m)
        return null;
    return { ownerType: m[1] === "orgs" ? "org" : "user", owner: m[2], number: Number(m[3]) };
}
export const CONFIG_DEFAULTS = {
    ciWorkflow: "bkit-ci.yml",
    capstoneJob: "bkit-tests-check",
    worktreeCopy: [".env", ".env.local"],
    worktreeInstall: true,
    diskMinFreeGb: 40,
    issueTracker: DEFAULT_ISSUE_TRACKER,
    // The Status options of GitHub's Kanban and Team planning board templates.
    github: { project: null, projectUrl: null, progress: "In progress", review: "In review" },
    // `started` is a state type every Linear team has; In Review is a name a default team lacks.
    linear: { team: null, project: null, progress: "started", review: "In Review" },
    jira: { site: null, project: null, progress: "In Progress", review: "In Review" },
    shipGateRequiredLanes: [],
    // What bkit's workflows write: plan / design / build logs and the ledgers. Never
    // `docs/**`: a project doc can be a test's input, so a docs edit can red a test.
    minPushPaths: ["docs/plans/**", "docs/*.jsonl", ".bkit/*.jsonl"],
    opencodeProvider: null,
    opencodeProviders: [],
    cloudAgents: DEFAULT_CLOUD_AGENTS,
    loopPause: true,
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
    const lanes = bkit.shipGateRequiredLanes;
    const book = bkit.minPushPaths;
    const provider = bkit.opencodeProvider;
    const providers = bkit.opencodeProviders;
    const github = record(bkit.github);
    const linear = record(bkit.linear);
    const jira = record(bkit.jira);
    const projectUrl = optionalString(github.project);
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
        github: {
            project: github.project === false ? false : projectUrl ? parseGithubBoardUrl(projectUrl) : null,
            projectUrl,
            ...trackerStates(github, CONFIG_DEFAULTS.github),
        },
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
        loopPause: typeof bkit.loopPause === "boolean" ? bkit.loopPause : CONFIG_DEFAULTS.loopPause,
        depUpdaterOptOut: bkit.depUpdater === "none",
        issueTrackerExplicit: bkit.issueTracker !== undefined && bkit.issueTracker !== "",
        cloudAgentsExplicit: bkit.cloudAgents !== undefined && bkit.cloudAgents !== "",
    };
}
export function trackerScope(cfg) {
    const none = { trackerTeam: null, trackerProject: null, trackerSite: null, trackerBoard: null };
    if (cfg.issueTracker === "github")
        return { ...none, trackerBoard: cfg.github.project || null };
    if (cfg.issueTracker === "linear")
        return { ...none, trackerTeam: cfg.linear.team, trackerProject: cfg.linear.project };
    if (cfg.issueTracker === "jira")
        return { ...none, trackerProject: cfg.jira.project, trackerSite: cfg.jira.site };
    return none;
}
