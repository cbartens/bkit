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
  /** Which tracker issues live in: github, linear or none. */
  issueTracker: IssueTracker;
  /** The GitHub Projects v2 board settings; false = opted out, null = not configured. */
  githubProject: Record<string, unknown> | false | null;
  /** CI lanes whose `skipped` conclusion refuses a ship merge; empty = the capstone's green decides. */
  shipGateRequiredLanes: string[];
  /** The opencode provider recorded on install; null = absent or not a supported provider. */
  opencodeProvider: OpencodeProvider | null;
  /** Every installed opencode provider, supported ones only; empty = none recorded. */
  opencodeProviders: OpencodeProvider[];
  /** The post-CI cloud-agent variant; `none` is both the default and the explicit opt-out. */
  cloudAgents: CloudAgents;
  /** `bkit.depUpdater` is `"none"`: silences the missing-dependency-updater advisory. */
  depUpdaterOptOut: boolean;
  /** `bkit.issueTracker` is present with any value, so `none` is a choice, not an undecided install. */
  issueTrackerExplicit: boolean;
  /** `bkit.cloudAgents` is present with any value, so `none` is a choice, not an undecided install. */
  cloudAgentsExplicit: boolean;
}

export const CONFIG_DEFAULTS: Readonly<BkitConfig> = {
  ciWorkflow: "bkit-ci.yml",
  capstoneJob: "bkit-tests-check",
  worktreeCopy: [".env", ".env.local"],
  worktreeInstall: true,
  diskMinFreeGb: 40,
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

const nonEmptyString = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";

/**
 * Read `package.json` `bkit` from `root` (the main checkout). A missing file,
 * missing key, or wrongly typed value falls back to the default for that key.
 */
export function readBkitConfig(root: string): BkitConfig {
  // A missing or unparseable package.json takes every default; `bkit check` reports the file.
  const read = readPackageJson(root);
  const bkit = ((read.ok ? read.pkg.bkit : undefined) ?? {}) as Record<string, unknown>;
  const worktree = (bkit.worktree ?? {}) as Record<string, unknown>;
  const copy = worktree.copy;
  const minFreeGb = ((bkit.disk ?? {}) as Record<string, unknown>).minFreeGb;
  const project = bkit.githubProject;
  const lanes = bkit.shipGateRequiredLanes;
  const provider = bkit.opencodeProvider;
  const providers = bkit.opencodeProviders;
  return {
    ciWorkflow: nonEmptyString(bkit.ciWorkflow) ? bkit.ciWorkflow : CONFIG_DEFAULTS.ciWorkflow,
    capstoneJob: nonEmptyString(bkit.capstoneJob) ? bkit.capstoneJob : CONFIG_DEFAULTS.capstoneJob,
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
    issueTracker: parseIssueTracker(bkit.issueTracker) ?? CONFIG_DEFAULTS.issueTracker,
    githubProject:
      project === false
        ? false
        : project !== null && typeof project === "object" && !Array.isArray(project)
          ? (project as Record<string, unknown>)
          : null,
    shipGateRequiredLanes: Array.isArray(lanes) ? lanes.filter(nonEmptyString) : [],
    opencodeProvider:
      typeof provider === "string" && isOpencodeProvider(provider) ? provider : null,
    opencodeProviders: Array.isArray(providers)
      ? providers.filter(
          (v): v is OpencodeProvider => typeof v === "string" && isOpencodeProvider(v),
        )
      : [],
    cloudAgents: parseCloudAgents(bkit.cloudAgents) ?? CONFIG_DEFAULTS.cloudAgents,
    depUpdaterOptOut: bkit.depUpdater === "none",
    issueTrackerExplicit: bkit.issueTracker !== undefined,
    cloudAgentsExplicit: bkit.cloudAgents !== undefined,
  };
}
