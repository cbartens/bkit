// shared/settings.ts — the consumer's `package.json` `bkit` settings.
//
// One reader, one set of defaults, so no command hard-codes a CI workflow name,
// a check name, or an app folder.

import {
  DEFAULT_CLOUD_AGENTS,
  DEFAULT_ISSUE_TRACKER,
  parseCloudAgents,
  parseIssueTracker,
  type CloudAgents,
  type IssueTracker,
} from "../install/manifest.js";
import { isOpencodeProvider } from "../render/models.js";
import type { OpencodeProvider } from "./egress.js";
import { readPackageJson } from "./package-json.js";

/** The issue state a tracker sets when work starts (`progress`) and when it hands off to a human (`review`). */
export interface TrackerStates {
  progress: string;
  review: string;
}

/** `bkit.linear`: the team and project issues live in, and the state each moment moves to. */
export interface LinearConfig extends TrackerStates {
  /** Team key, e.g. `ENG`. null = not configured. */
  team: string | null;
  /** Project name; new issues go into it and related-issue searches stay inside it. null = none. */
  project: string | null;
}

/** A GitHub Projects v2 board, read from its URL. */
export interface GithubBoard {
  /** `org` for `/orgs/<login>/projects/<n>`, `user` for `/users/<login>/projects/<n>`; the MCP `owner_type`. */
  ownerType: "org" | "user";
  owner: string;
  number: number;
}

/** `bkit.github`: the Projects v2 board issues sit on, and the Status option names each moment moves to. */
export interface GithubConfig extends TrackerStates {
  /** Board from the `project` URL. false = board sync off; null = not configured or not a board URL. */
  project: GithubBoard | false | null;
  /** `project` as written when it is a string; null otherwise. */
  projectUrl: string | null;
}

const BOARD_URL =
  /^https:\/\/github\.com\/(orgs|users)\/([^/?#\s]+)\/projects\/([1-9][0-9]*)(?:[/?#].*)?$/;

/** The board a `https://github.com/{orgs|users}/<login>/projects/<n>[/views/…]` URL names; null otherwise. */
export function parseGithubBoardUrl(url: string): GithubBoard | null {
  const m = BOARD_URL.exec(url.trim());
  if (!m) return null;
  return { ownerType: m[1] === "orgs" ? "org" : "user", owner: m[2]!, number: Number(m[3]) };
}

/** `bkit.jira`: the site and project issues live in, and the status names each moment moves to. */
export interface JiraConfig extends TrackerStates {
  /** Site URL, e.g. `https://acme.atlassian.net`; the MCP server's `cloudId`. null = not configured. */
  site: string | null;
  /** Project key, e.g. `MBA`. null = not configured. */
  project: string | null;
}

/** `bkit.workflows.tasks`: the plan caps `tests plan-check` and `challenge merge` enforce. */
export interface TaskCaps {
  /** Tasks in one plan group. */
  maxPerGroup: number;
  /** Planned TEST FIRST tests in one plan group. */
  maxTestsPerGroup: number;
  /** TEST FIRST tests one task names. */
  maxTestsPerTask: number;
  /** Distinct test files one task's TEST FIRST names. */
  maxTestFilesPerTask: number;
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
] as const;
export type AskPoint = (typeof ASK_POINTS)[number];

/** One `bkit.workflows.<workflow>.<point>` block. */
export interface AskSetting {
  /** Stop and ask the owner; false = carry on with the recommendation. Headless never asks. */
  ask: boolean;
  /** The hard limit: `maxTurns` for the grill, `maxAttempts` elsewhere. */
  max: number;
}

/** The limit key a point's block holds. */
export const limitKey = (point: AskPoint): "maxTurns" | "maxAttempts" =>
  point === "design.grill" ? "maxTurns" : "maxAttempts";

export interface BkitConfig {
  /** CI workflow file under `.github/workflows/`. */
  ciWorkflow: string;
  /** The CI job whose check run gates merges. */
  capstoneJob: string;
  /** Files copied from the main checkout into a new worktree. */
  worktreeCopy: string[];
  /** Whether worktree setup installs dependencies in a created or resumed worktree. */
  worktreeInstall: boolean;
  /** Free GB under which worktree setup and `bkit disk prune --auto` run the max cleanup steps. */
  diskMinFreeGb: number;
  /** Which tracker issues live in: github, linear, jira or none. */
  issueTracker: IssueTracker;
  /** `bkit.github`; each moment's state is the name of a board Status option. */
  github: GithubConfig;
  /** `bkit.linear`; each moment's state is a state name, or a state type such as `started`. */
  linear: LinearConfig;
  /** `bkit.jira`. */
  jira: JiraConfig;
  /** CI lanes whose `skipped` conclusion refuses a ship merge; empty = the capstone's green decides. */
  shipGateRequiredLanes: string[];
  /**
   * Globs (`:(glob)` git pathspecs) for paths a push may carry and still run only
   * `bkit:gate:min` in `.husky/pre-push`; empty = every push runs the full hook.
   */
  minPushPaths: string[];
  /** The opencode provider recorded on install; null = absent or not a supported provider. */
  opencodeProvider: OpencodeProvider | null;
  /** Every installed opencode provider, supported ones only; empty = none recorded. */
  opencodeProviders: OpencodeProvider[];
  /** The post-CI cloud-agent variant; `none` is both the default and the explicit opt-out. */
  cloudAgents: CloudAgents;
  /** Per ask point: whether to ask, and its hard limit; each invalid key takes its default. */
  asks: Record<AskPoint, AskSetting>;
  /** Plan caps; each key that is not an integer >= 1 takes its default. */
  tasks: TaskCaps;
  /** `bkit.dependencies.updater` is `"none"`: silences the missing-dependency-updater advisory. */
  depUpdaterOptOut: boolean;
  /** `bkit.tracker.default` is set, so `none` is a choice; absent or `""` (what install seeds) = undecided. */
  issueTrackerExplicit: boolean;
  /** `bkit.cloud.agent` is set, so `none` is a choice; absent or `""` (what install seeds) = undecided. */
  cloudAgentsExplicit: boolean;
}

export const CONFIG_DEFAULTS: Readonly<BkitConfig> = {
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

const nonEmptyString = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";

const record = (v: unknown): Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

const optionalString = (v: unknown): string | null => (nonEmptyString(v) ? v.trim() : null);

/** Each moment's state from `raw`, else the default for that moment. */
function trackerStates(raw: Record<string, unknown>, defaults: TrackerStates): TrackerStates {
  return {
    progress: nonEmptyString(raw.progress) ? raw.progress.trim() : defaults.progress,
    review: nonEmptyString(raw.review) ? raw.review.trim() : defaults.review,
  };
}

const TASK_CAP_KEYS = Object.keys(CONFIG_DEFAULTS.tasks) as (keyof TaskCaps)[];

const validCap = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 1;

/**
 * The keys of a `bkit.workflows.tasks` value that fall back to their default: each set key
 * that is not an integer >= 1, or `["tasks"]` when the value is set but not an object.
 */
export function invalidTaskCaps(raw: unknown): string[] {
  if (raw === undefined) return [];
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return ["tasks"];
  const set = raw as Record<string, unknown>;
  return TASK_CAP_KEYS.filter((k) => set[k] !== undefined && !validCap(set[k]));
}

/** `bkit.workflows.tasks` read key by key; a missing or invalid key takes its default. */
function taskCaps(raw: unknown): TaskCaps {
  const set = record(raw);
  const caps = { ...CONFIG_DEFAULTS.tasks };
  for (const k of TASK_CAP_KEYS) if (validCap(set[k])) caps[k] = set[k];
  return caps;
}

/** The `bkit.workflows.<workflow>.<point>` block `workflows` holds for `point`. */
const askBlock = (workflows: Record<string, unknown>, point: AskPoint): unknown => {
  const [workflow, name] = point.split(".") as [string, string];
  const block = workflows[workflow];
  return block !== null && typeof block === "object" && !Array.isArray(block)
    ? (block as Record<string, unknown>)[name]
    : undefined;
};

/**
 * The dotted keys under `bkit.workflows` that fall back to their default: each set `ask`
 * that is not a boolean, each set limit that is not an integer >= 1, or the point itself
 * when it is set but not an object.
 */
export function invalidAskSettings(workflows: unknown): string[] {
  const set = record(workflows);
  const bad: string[] = [];
  for (const point of ASK_POINTS) {
    const raw = askBlock(set, point);
    if (raw === undefined) continue;
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
      bad.push(point);
      continue;
    }
    const block = raw as Record<string, unknown>;
    if (block.ask !== undefined && typeof block.ask !== "boolean") bad.push(`${point}.ask`);
    const key = limitKey(point);
    if (block[key] !== undefined && !validCap(block[key])) bad.push(`${point}.${key}`);
  }
  return bad;
}

/** Every ask point read from `bkit.workflows`; a missing or invalid key takes its default. */
function askSettings(workflows: Record<string, unknown>): Record<AskPoint, AskSetting> {
  const out = {} as Record<AskPoint, AskSetting>;
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
export function readBkitConfig(root: string): BkitConfig {
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
    worktreeCopy:
      Array.isArray(copy) && copy.every(nonEmptyString)
        ? [...copy]
        : [...CONFIG_DEFAULTS.worktreeCopy],
    worktreeInstall:
      typeof worktree.install === "boolean" ? worktree.install : CONFIG_DEFAULTS.worktreeInstall,
    diskMinFreeGb:
      typeof minFreeGb === "number" && Number.isFinite(minFreeGb) && minFreeGb >= 0
        ? minFreeGb
        : CONFIG_DEFAULTS.diskMinFreeGb,
    issueTracker: parseIssueTracker(tracker.default) ?? CONFIG_DEFAULTS.issueTracker,
    github: {
      project:
        github.project === false ? false : projectUrl ? parseGithubBoardUrl(projectUrl) : null,
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
    opencodeProvider:
      typeof provider === "string" && isOpencodeProvider(provider) ? provider : null,
    opencodeProviders: Array.isArray(providers)
      ? providers.filter(
          (v): v is OpencodeProvider => typeof v === "string" && isOpencodeProvider(v),
        )
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
export function ciWorkflowPath(root: string): string {
  return `.github/workflows/${readBkitConfig(root).ciWorkflow}`;
}

/** Where the wired tracker's issues live, for the workflows' tracker calls. */
export interface TrackerScope {
  /** Linear team key; null under any other tracker or when unset. */
  trackerTeam: string | null;
  /** Linear project name or Jira project key; null under github / none or when unset. */
  trackerProject: string | null;
  /** Jira site URL (the MCP `cloudId`); null under any other tracker or when unset. */
  trackerSite: string | null;
  /** GitHub Projects v2 board; null under any other tracker, when off, or when unset. */
  trackerBoard: GithubBoard | null;
}

export function trackerScope(
  cfg: Pick<BkitConfig, "issueTracker" | "github" | "linear" | "jira">,
): TrackerScope {
  const none = { trackerTeam: null, trackerProject: null, trackerSite: null, trackerBoard: null };
  if (cfg.issueTracker === "github") return { ...none, trackerBoard: cfg.github.project || null };
  if (cfg.issueTracker === "linear")
    return { ...none, trackerTeam: cfg.linear.team, trackerProject: cfg.linear.project };
  if (cfg.issueTracker === "jira")
    return { ...none, trackerProject: cfg.jira.project, trackerSite: cfg.jira.site };
  return none;
}
