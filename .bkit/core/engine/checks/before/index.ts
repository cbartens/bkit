// checks/before/index.ts — Phase 1: read-only detection BEFORE any writes. runPreflight calls
// the detectors in this folder (one file per group of findings) in a fixed order.
// Nothing in checks/before/ imports install/modules/ — preflight is upstream of module dispatch.
//
// Allow-list for cross-module imports (BAR-167 Phase 1+2):
//   readBkitVersion       — from install/version-file.ts (version pin reader)
//   deepContains          — from install/write.ts (JSON containment primitive)
//   extractManagedBlock   — from install/managed-block.ts (marker block extraction)
//   getTemplatesRoot      — from shared/package-roots.ts (templates root resolver, no cycle)
//   templateRelPath       — from shared/package-roots.ts (dest → template path, the dotfile remap)
//   parseIssueTracker     — from install/manifest.ts (pure data, no cycle)
//   readTemplate          — from render/parts.ts (template with its shared parts spliced in)

import * as fs from "node:fs";
import * as path from "node:path";
import type { ModuleFlag } from "../../cli.js";
import { getPkgRoot } from "../../shared/package-roots.js";
import {
  parseIssueTracker,
  DEFAULT_ISSUE_TRACKER,
  type IssueTracker,
} from "../../install/manifest.js";
import {
  detectBkitNotOnPath,
  detectMalformedPackageJson,
  detectNoPackageJson,
  detectNotGitRepo,
} from "./repo.js";
import {
  MARKERED_TEXT_DRIFT_PATHS,
  detectGitignoreBlockDuplicates,
  detectPlaywrightReporterHostile,
  detectTier2JsonDrift,
  detectTier2TextDrift,
} from "./files.js";
import { detectBkitVersionMajorDowngrade, detectBkitVersionPinStale } from "./version.js";
import {
  detectContextFetchContextMissing,
  detectContextFetchMissing,
  detectContextFetchProvisionMissing,
  detectContextFetchSourceNotEnabled,
} from "./context-fetch.js";
import { detectExtraMcpServers, detectMissingMcpServers } from "./mcp.js";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface PreflightFinding {
  id: string;
  severity: "blocker" | "advisory";
  detect: string;
  action: string;
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

// Deduplicate an array of findings by `id`, first occurrence wins.
export function dedupeById(findings: PreflightFinding[]): PreflightFinding[] {
  const seen = new Set<string>();
  return findings.filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });
}

// ---------------------------------------------------------------------------
// runPreflight — main Phase 1 entry point
// ---------------------------------------------------------------------------

/**
 * Read `bkit.issueTracker` from the consumer's package.json.
 * Returns the tracker value or the default ("none") when absent / unreadable.
 * Internal helper — not exported; use runPreflight's `issueTracker` param.
 */
function readConsumerIssueTrackerForPreflight(cwd: string): IssueTracker {
  const pkgPath = path.join(cwd, "package.json");
  if (!fs.existsSync(pkgPath)) return DEFAULT_ISSUE_TRACKER;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as Record<string, unknown>;
    const bkitField = pkg.bkit as Record<string, unknown> | undefined;
    const parsed = parseIssueTracker(bkitField?.issueTracker);
    return parsed ?? DEFAULT_ISSUE_TRACKER;
  } catch {
    return DEFAULT_ISSUE_TRACKER;
  }
}

/**
 * Run all Phase 1 (read-only) detectors.
 * Returns deduplicated { blockers, advisories } — intra-phase dedup by id,
 * first occurrence wins.
 *
 * cwd defaults to process.cwd(). Pass explicitly in tests.
 * installingVersion: used by detectBkitVersionMajorDowngrade; defaults to the
 * package's own version read from its package.json at runtime.
 * issueTracker: when provided, narrows tracker-specific checks (e.g. MCP server
 * requirements). When omitted, read from consumer's `bkit.issueTracker` in package.json.
 *
 * GitHub tracker gate: when `issueTracker === "github"`, the Linear preflight
 * gate is a no-op — the GitHub gate is enforced by workflow Step 1 via MCP.
 */
export function runPreflight(
  modules: Set<ModuleFlag>,
  cwd: string = process.cwd(),
  installingVersion?: string,
  issueTracker?: IssueTracker,
): { blockers: PreflightFinding[]; advisories: PreflightFinding[] } {
  // Resolve installing version if not provided
  let version = installingVersion;
  if (!version) {
    try {
      const pkgJsonPath = path.join(getPkgRoot(), "package.json");
      if (fs.existsSync(pkgJsonPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8")) as { version?: string };
        version = pkg.version ?? "0.0.0";
      } else {
        version = "0.0.0";
      }
    } catch {
      version = "0.0.0";
    }
  }

  // Resolve issueTracker: use provided value or read from consumer package.json.
  // GitHub tracker gate: when issueTracker === "github", Linear preflight is a no-op
  // (the GitHub gate is enforced by workflow Step 1 via MCP — hook is no-op).
  const resolvedTracker = issueTracker ?? readConsumerIssueTrackerForPreflight(cwd);

  const blockers: PreflightFinding[] = [];
  const advisories: PreflightFinding[] = [];

  // --- Blocker detectors ---
  const noPackageJson = detectNoPackageJson(cwd);
  if (noPackageJson) blockers.push(noPackageJson);

  const malformedPackageJson = detectMalformedPackageJson(cwd);
  if (malformedPackageJson) blockers.push(malformedPackageJson);

  const notGitRepo = detectNotGitRepo(cwd, modules);
  if (notGitRepo) blockers.push(notGitRepo);

  // --- Advisory detectors ---
  // Phase 1: JSON containment drift advisory
  for (const relPath of [".claude/settings.json", ".cursor/hooks.json"]) {
    const driftAdvisory = detectTier2JsonDrift(cwd, relPath);
    if (driftAdvisory) advisories.push(driftAdvisory);
  }

  // Phase 2: markered-text block drift advisory (BAR-167)
  for (const relPath of MARKERED_TEXT_DRIFT_PATHS) {
    const textDriftAdvisory = detectTier2TextDrift(cwd, relPath);
    if (textDriftAdvisory) advisories.push(textDriftAdvisory);
  }

  const gitignoreDup = detectGitignoreBlockDuplicates(cwd);
  if (gitignoreDup) advisories.push(gitignoreDup);

  const versionMajorDowngrade = detectBkitVersionMajorDowngrade(cwd, version);
  if (versionMajorDowngrade) advisories.push(versionMajorDowngrade);

  const versionPinStale = detectBkitVersionPinStale(cwd);
  if (versionPinStale) advisories.push(versionPinStale);

  // BAR-224: [verbose ci] marker advisories

  const playwrightReporterHostile = detectPlaywrightReporterHostile(cwd);
  if (playwrightReporterHostile) advisories.push(playwrightReporterHostile);

  const contextFetch = detectContextFetchMissing(cwd);
  if (contextFetch) advisories.push(contextFetch);

  const contextFetchContext = detectContextFetchContextMissing(cwd);
  if (contextFetchContext) advisories.push(contextFetchContext);

  const contextFetchSource = detectContextFetchSourceNotEnabled(cwd);
  if (contextFetchSource) advisories.push(contextFetchSource);

  const contextFetchProvision = detectContextFetchProvisionMissing(cwd);
  if (contextFetchProvision) advisories.push(contextFetchProvision);

  // bkit-not-on-path advisory — suggest the shell alias for local development.
  const bkitNotOnPath = detectBkitNotOnPath();
  if (bkitNotOnPath) advisories.push(bkitNotOnPath);

  // Missing MCP server advisory — one finding per missing required key, per file.
  // Tracker-aware: when issueTracker === "github", only github MCP server is required
  // (the Linear gate is a no-op on the GitHub tracker; the gate runs in workflow Step 1 via MCP).
  // Extra MCP server advisory — one finding per bkit-managed server that the
  // resolved tracker does not use (e.g. a stale `linear` entry under `github`).
  for (const relPath of [".mcp.json", ".cursor/mcp.json"]) {
    advisories.push(...detectMissingMcpServers(cwd, relPath, resolvedTracker));
    advisories.push(...detectExtraMcpServers(cwd, relPath, resolvedTracker));
  }

  // [mcp-env] detectors run in Phase 3 (runPostInstallCheck in checks/after/index.ts),
  // not here: the .bkit/.env.example scaffold exists only after writes. Detectors are
  // exported from this file for the postinstall module.

  return {
    blockers: dedupeById(blockers),
    advisories: dedupeById(advisories),
  };
}
