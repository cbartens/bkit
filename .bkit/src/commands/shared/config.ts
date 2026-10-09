// commands/shared/config.ts — the consumer's `package.json` `bkit` settings.
//
// One reader, one set of defaults, so no command hard-codes a CI workflow name,
// a check name, or an app folder.

import {
  DEFAULT_ISSUE_TRACKER,
  parseIssueTracker,
  type IssueTracker,
} from "../../bkit-manifest.js";
import { readPackageJson } from "./package-json.js";

export interface BkitConfig {
  /** CI workflow file under `.github/workflows/`. */
  ciWorkflow: string;
  /** The CI job whose check run gates merges. */
  capstoneJob: string;
  /** Files copied from the main checkout into a new worktree. */
  worktreeCopy: string[];
  /** Whether worktree setup installs dependencies (design and plan never do: they run no project code). */
  worktreeInstall: boolean;
  /** Which tracker issues live in: github, linear or none. */
  issueTracker: IssueTracker;
  /** The GitHub Projects v2 board settings; false = opted out, null = not configured. */
  githubProject: Record<string, unknown> | false | null;
  /** CI lanes whose `skipped` conclusion refuses a ship merge; empty = the capstone's green decides. */
  shipGateRequiredLanes: string[];
}

export const CONFIG_DEFAULTS: Readonly<BkitConfig> = {
  ciWorkflow: "ci.yml",
  capstoneJob: "bkit-tests-check",
  worktreeCopy: [".env", ".env.local"],
  worktreeInstall: true,
  issueTracker: DEFAULT_ISSUE_TRACKER,
  githubProject: null,
  shipGateRequiredLanes: [],
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
  const project = bkit.githubProject;
  const lanes = bkit.shipGateRequiredLanes;
  return {
    ciWorkflow: nonEmptyString(bkit.ciWorkflow) ? bkit.ciWorkflow : CONFIG_DEFAULTS.ciWorkflow,
    capstoneJob: nonEmptyString(bkit.capstoneJob) ? bkit.capstoneJob : CONFIG_DEFAULTS.capstoneJob,
    worktreeCopy:
      Array.isArray(copy) && copy.every(nonEmptyString)
        ? [...copy]
        : [...CONFIG_DEFAULTS.worktreeCopy],
    worktreeInstall:
      typeof worktree.install === "boolean" ? worktree.install : CONFIG_DEFAULTS.worktreeInstall,
    issueTracker: parseIssueTracker(bkit.issueTracker) ?? CONFIG_DEFAULTS.issueTracker,
    githubProject:
      project === false
        ? false
        : project !== null && typeof project === "object" && !Array.isArray(project)
          ? (project as Record<string, unknown>)
          : null,
    shipGateRequiredLanes: Array.isArray(lanes) ? lanes.filter(nonEmptyString) : [],
  };
}
