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
/** Every point a workflow can stop and ask the owner at, as `<workflow>.<point>`. */
export const ASK_POINTS = [
    "design.grill",
    "build.verify",
    "build.challenge",
    "build.tests",
    "debug.fix",
    "debug.soak",
    "ship.merge",
];
/** The limit key a point's block holds. */
export const limitKey = (point) => point === "design.grill" ? "maxTurns" : "maxAttempts";
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
    // `.bkit/workflows.md` § Ask points.
    asks: {
        "design.grill": { ask: true, max: 6 },
        "build.verify": { ask: true, max: 2 },
        "build.challenge": { ask: true, max: 2 },
        "build.tests": { ask: true, max: 2 },
        "debug.fix": { ask: true, max: 2 },
        "debug.soak": { ask: true, max: 2 },
        "ship.merge": { ask: true, max: 2 },
    },
    // Plan caps, `.bkit/workflows.md` § Test-first.
    tasks: { maxPerGroup: 3, maxTestsPerGroup: 15, maxTestsPerTask: 10, maxTestFilesPerTask: 3 },
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
const TASK_CAP_KEYS = Object.keys(CONFIG_DEFAULTS.tasks);
const validCap = (v) => Number.isInteger(v) && v >= 1;
/**
 * The keys of a `bkit.workflows.tasks` value that fall back to their default: each set key
 * that is not an integer >= 1, or `["tasks"]` when the value is set but not an object.
 */
export function invalidTaskCaps(raw) {
    if (raw === undefined)
        return [];
    if (raw === null || typeof raw !== "object" || Array.isArray(raw))
        return ["tasks"];
    const set = raw;
    return TASK_CAP_KEYS.filter((k) => set[k] !== undefined && !validCap(set[k]));
}
/** `bkit.workflows.tasks` read key by key; a missing or invalid key takes its default. */
function taskCaps(raw) {
    const set = record(raw);
    const caps = { ...CONFIG_DEFAULTS.tasks };
    for (const k of TASK_CAP_KEYS)
        if (validCap(set[k]))
            caps[k] = set[k];
    return caps;
}
/** The `bkit.workflows.<workflow>.<point>` block `workflows` holds for `point`. */
const askBlock = (workflows, point) => {
    const [workflow, name] = point.split(".");
    const block = workflows[workflow];
    return block !== null && typeof block === "object" && !Array.isArray(block)
        ? block[name]
        : undefined;
};
/**
 * The dotted keys under `bkit.workflows` that fall back to their default: each set `ask`
 * that is not a boolean, each set limit that is not an integer >= 1, or the point itself
 * when it is set but not an object.
 */
export function invalidAskSettings(workflows) {
    const set = record(workflows);
    const bad = [];
    for (const point of ASK_POINTS) {
        const raw = askBlock(set, point);
        if (raw === undefined)
            continue;
        if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
            bad.push(point);
            continue;
        }
        const block = raw;
        if (block.ask !== undefined && typeof block.ask !== "boolean")
            bad.push(`${point}.ask`);
        const key = limitKey(point);
        if (block[key] !== undefined && !validCap(block[key]))
            bad.push(`${point}.${key}`);
    }
    return bad;
}
/** Every ask point read from `bkit.workflows`; a missing or invalid key takes its default. */
function askSettings(workflows) {
    const out = {};
    for (const point of ASK_POINTS) {
        const block = record(askBlock(workflows, point));
        const limit = block[limitKey(point)];
        out[point] = {
            ask: typeof block.ask === "boolean" ? block.ask : CONFIG_DEFAULTS.asks[point].ask,
            max: validCap(limit) ? limit : CONFIG_DEFAULTS.asks[point].max,
        };
    }
    return out;
}
/**
 * Read `package.json` `bkit` from `root` (the main checkout). A missing file,
 * missing key, or wrongly typed value falls back to the default for that key.
 */
export function readBkitConfig(root) {
    // A missing or unparseable package.json takes every default; `bkit check` reports the file.
    const read = readPackageJson(root);
    const bkit = record(read.ok ? read.pkg.bkit : undefined);
    const tracker = record(bkit.tracker);
    const cloud = record(bkit.cloud);
    const opencode = record(record(bkit.providers).opencode);
    const testing = record(bkit.testing);
    const workflows = record(bkit.workflows);
    const worktree = record(workflows.worktree);
    const copy = worktree.copy;
    const minFreeGb = workflows.minFreeGb;
    const lanes = testing.shipGate;
    const book = testing.minPushPaths;
    const provider = opencode.default;
    const providers = opencode.installed;
    const github = record(tracker.github);
    const linear = record(tracker.linear);
    const jira = record(tracker.jira);
    const projectUrl = optionalString(github.project);
    return {
        ciWorkflow: nonEmptyString(testing.ciWorkflow)
            ? testing.ciWorkflow
            : CONFIG_DEFAULTS.ciWorkflow,
        capstoneJob: nonEmptyString(testing.ciCapstone)
            ? testing.ciCapstone
            : CONFIG_DEFAULTS.capstoneJob,
        worktreeCopy: Array.isArray(copy) && copy.every(nonEmptyString)
            ? [...copy]
            : [...CONFIG_DEFAULTS.worktreeCopy],
        worktreeInstall: typeof worktree.install === "boolean" ? worktree.install : CONFIG_DEFAULTS.worktreeInstall,
        diskMinFreeGb: typeof minFreeGb === "number" && Number.isFinite(minFreeGb) && minFreeGb >= 0
            ? minFreeGb
            : CONFIG_DEFAULTS.diskMinFreeGb,
        issueTracker: parseIssueTracker(tracker.default) ?? CONFIG_DEFAULTS.issueTracker,
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
        cloudAgents: parseCloudAgents(cloud.agent) ?? CONFIG_DEFAULTS.cloudAgents,
        asks: askSettings(workflows),
        tasks: taskCaps(workflows.tasks),
        depUpdaterOptOut: record(bkit.dependencies).updater === "none",
        issueTrackerExplicit: tracker.default !== undefined && tracker.default !== "",
        cloudAgentsExplicit: cloud.agent !== undefined && cloud.agent !== "",
    };
}
/** The CI workflow file `bkit.testing.ciWorkflow` names, as `.github/workflows/<file>` relative to `root`. */
export function ciWorkflowPath(root) {
    return `.github/workflows/${readBkitConfig(root).ciWorkflow}`;
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
