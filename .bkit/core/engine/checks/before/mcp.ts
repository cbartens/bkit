// checks/before/mcp.ts — the MCP servers the configured tracker needs: missing and extra.

import * as fs from "node:fs";
import * as path from "node:path";
import { parseJson } from "../../shared/json.js";
import type { IssueTracker } from "../../install/manifest.js";
import type { PreflightFinding } from "./index.js";

/** Every MCP server key bkit writes; `requiredMcpServersForTracker` picks the required subset. */
const BKIT_MCP_SERVERS: readonly string[] = ["linear", "github"];

/**
 * bkit-written servers a workflow step calls under every tracker, so never flagged as extra:
 * the workflows' gh MCP fallback (PR / CI / merge when `gh` is unavailable) calls `github`.
 */
const TRACKER_INDEPENDENT_MCP_SERVERS: readonly string[] = ["github"];

/** The key holding the server map: `mcpServers` in `.mcp.json` / `.cursor/mcp.json`, `mcp` in `.opencode/opencode.json`. */
export type McpServerMapKey = "mcpServers" | "mcp";

/**
 * Return the MCP server keys required for a given issue tracker — exactly the entry the
 * install renderers write: the tracker's own server (`none` → none).
 */
export function requiredMcpServersForTracker(tracker: IssueTracker): readonly string[] {
  return tracker === "none" ? [] : [tracker];
}

/**
 * Read the server map under `mapKey` of the JSON file at `relPath`.
 * `undefined` → file absent or malformed (callers skip); `null` → file present, no map.
 */
function readMcpServerMap(
  cwd: string,
  relPath: string,
  mapKey: McpServerMapKey,
): Record<string, unknown> | null | undefined {
  const absPath = path.join(cwd, relPath);
  if (!fs.existsSync(absPath)) return undefined;
  const parsed = parseJson(fs.readFileSync(absPath, "utf-8"));
  if (!parsed.ok || typeof parsed.value !== "object" || parsed.value === null) return undefined;
  const map = (parsed.value as Record<string, unknown>)[mapKey];
  return map !== null && typeof map === "object" && !Array.isArray(map)
    ? (map as Record<string, unknown>)
    : null;
}

function advisoryPathSlug(relPath: string): string {
  return relPath.replace(/[^a-z0-9]/gi, "-");
}

/**
 * Advisory: one finding per missing required MCP server key in a given mcp.json file.
 *
 * Semantics:
 *   - File absent      → return [] (the next install writes it)
 *   - File malformed   → return [] (parse-failure is a different advisory class)
 *   - File present, mcpServers missing a required key → one advisory per missing key
 *   - File present, all required keys present → return []
 *
 * `issueTracker` selects which MCP servers are required.
 *
 * Follows `[context] Message` advisory format.
 */
export function detectMissingMcpServers(
  cwd: string,
  relPath: string,
  issueTracker: IssueTracker,
): PreflightFinding[] {
  const mcpServers = readMcpServerMap(cwd, relPath, "mcpServers");
  if (mcpServers === undefined) return [];

  const findings: PreflightFinding[] = [];
  for (const key of requiredMcpServersForTracker(issueTracker)) {
    if (mcpServers && Object.prototype.hasOwnProperty.call(mcpServers, key)) continue;
    const urlHint =
      key === "linear"
        ? `"url": "https://mcp.linear.app/mcp"`
        : key === "github"
          ? `"url": "https://api.githubcopilot.com/mcp/"`
          : `"url": "<server-url>"`;
    findings.push({
      id: `mcp-missing-server-${key}-${advisoryPathSlug(relPath)}`,
      severity: "advisory",
      detect: `${relPath} is missing the ${key} MCP server in mcpServers.`,
      action: `[mcp] ${relPath} is missing the ${key} MCP server. Add it to mcpServers: {"${key}": {${urlHint}}}`,
    });
  }
  return findings;
}

/**
 * The bkit-written MCP servers `tracker` has no use for: `BKIT_MCP_SERVERS` minus the
 * tracker's own server and `TRACKER_INDEPENDENT_MCP_SERVERS`. What `detectExtraMcpServers`
 * flags, and what a tracker switch removes while the entry still equals bkit's template.
 */
export function unusedTrackerMcpServers(tracker: IssueTracker): readonly string[] {
  const allowed = requiredMcpServersForTracker(tracker);
  return BKIT_MCP_SERVERS.filter(
    (key) => !allowed.includes(key) && !TRACKER_INDEPENDENT_MCP_SERVERS.includes(key),
  );
}

/**
 * Advisory: one finding per bkit-written MCP server that is present in the file but NOT
 * required by the resolved tracker (the symmetric counterpart to `detectMissingMcpServers`).
 * Catches a leftover a tracker switch kept because the consumer edited it — e.g. a repo
 * switched to `--tracker=github` still carrying a customised `linear` entry.
 *
 * Only flags `unusedTrackerMcpServers(tracker)`. Consumer-added MCP servers (custom tooling,
 * other providers) are never flagged for removal.
 *
 * `mapKey` names the server map: `mcpServers` (`.mcp.json`, `.cursor/mcp.json`) or `mcp`
 * (`.opencode/opencode.json`).
 *
 * Semantics:
 *   - File absent / malformed / no server map → return []
 *   - tracker-only server present but not in `requiredMcpServersForTracker(tracker)` → one advisory
 *
 * Follows `[context] Message` advisory format.
 */
export function detectExtraMcpServers(
  cwd: string,
  relPath: string,
  issueTracker: IssueTracker,
  mapKey: McpServerMapKey = "mcpServers",
): PreflightFinding[] {
  const servers = readMcpServerMap(cwd, relPath, mapKey);
  if (!servers) return [];

  const findings: PreflightFinding[] = [];
  for (const key of unusedTrackerMcpServers(issueTracker)) {
    if (!Object.prototype.hasOwnProperty.call(servers, key)) continue;
    findings.push({
      id: `mcp-extra-server-${key}-${advisoryPathSlug(relPath)}`,
      severity: "advisory",
      detect: `${relPath} has the ${key} MCP server but the ${issueTracker} tracker does not use it.`,
      action: `[mcp] ${relPath} carries the ${key} MCP server, which is not used by the ${issueTracker} tracker. Remove the "${key}" entry from ${mapKey}.`,
    });
  }
  return findings;
}
