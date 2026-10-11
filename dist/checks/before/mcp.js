// checks/before/mcp.ts — the MCP servers the configured tracker needs: missing and extra.
import * as fs from "node:fs";
import * as path from "node:path";
import { parseJson } from "../../shared/json.js";
// ---------------------------------------------------------------------------
// Advisory: missing MCP server entries in .mcp.json / .cursor/mcp.json
// ---------------------------------------------------------------------------
/** Every MCP server key bkit manages; `requiredMcpServersForTracker` picks the required subset. */
const REQUIRED_MCP_SERVERS = ["linear", "github"];
/**
 * Return the MCP server keys required for a given issue tracker.
 *
 * - `github`  → only `github` MCP server required (Linear gate is a no-op on GitHub tracker).
 * - `linear`  → both `linear` and `github` required (Linear tracker still dispatches via GitHub PR).
 * - `none`    → `github` only (tracker calls are no-ops; GitHub surface still needed for PR ops).
 */
export function requiredMcpServersForTracker(tracker) {
    if (tracker === "github")
        return ["github"];
    if (tracker === "linear")
        return ["linear", "github"];
    return ["github"]; // none — only GitHub for PR surface
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
export function detectMissingMcpServers(cwd, relPath, issueTracker) {
    const absPath = path.join(cwd, relPath);
    if (!fs.existsSync(absPath))
        return [];
    const parsed = parseJson(fs.readFileSync(absPath, "utf-8"));
    if (!parsed.ok || typeof parsed.value !== "object" || parsed.value === null)
        return []; // malformed JSON — skip silently
    const doc = parsed.value;
    const mcpServers = doc.mcpServers !== null && typeof doc.mcpServers === "object" && !Array.isArray(doc.mcpServers)
        ? doc.mcpServers
        : null;
    const requiredServers = requiredMcpServersForTracker(issueTracker);
    const findings = [];
    for (const key of requiredServers) {
        if (mcpServers && Object.prototype.hasOwnProperty.call(mcpServers, key))
            continue;
        const urlHint = key === "linear"
            ? `"url": "https://mcp.linear.app/mcp"`
            : key === "github"
                ? `"url": "https://api.githubcopilot.com/mcp/"`
                : `"url": "<server-url>"`;
        findings.push({
            id: `mcp-missing-server-${key}-${relPath.replace(/[^a-z0-9]/gi, "-")}`,
            severity: "advisory",
            detect: `${relPath} is missing the ${key} MCP server in mcpServers.`,
            action: `[mcp] ${relPath} is missing the ${key} MCP server. Add it to mcpServers: {"${key}": {${urlHint}}}`,
        });
    }
    return findings;
}
/**
 * Advisory: one finding per bkit-managed MCP server that is present in the file
 * but NOT required by the resolved tracker (the symmetric counterpart to
 * `detectMissingMcpServers`). Catches the stale-leftover case — e.g. a repo
 * switched to `--tracker=github` but still carries the `linear` entry.
 *
 * Only flags servers bkit itself manages (`REQUIRED_MCP_SERVERS`). Consumer-added
 * MCP servers (custom tooling, other providers) are never flagged for removal.
 *
 * Semantics:
 *   - File absent / malformed / no mcpServers → return []
 *   - bkit-managed server present but not in `requiredMcpServersForTracker(tracker)` → one advisory
 *
 * Follows `[context] Message` advisory format.
 */
export function detectExtraMcpServers(cwd, relPath, issueTracker) {
    const absPath = path.join(cwd, relPath);
    if (!fs.existsSync(absPath))
        return [];
    const parsed = parseJson(fs.readFileSync(absPath, "utf-8"));
    if (!parsed.ok || typeof parsed.value !== "object" || parsed.value === null)
        return []; // malformed JSON — skip silently
    const doc = parsed.value;
    const mcpServers = doc.mcpServers !== null && typeof doc.mcpServers === "object" && !Array.isArray(doc.mcpServers)
        ? doc.mcpServers
        : null;
    if (!mcpServers)
        return [];
    const allowed = requiredMcpServersForTracker(issueTracker);
    const findings = [];
    // Only consider servers bkit manages — never flag consumer-added MCP servers.
    for (const key of REQUIRED_MCP_SERVERS) {
        if (allowed.includes(key))
            continue;
        if (!Object.prototype.hasOwnProperty.call(mcpServers, key))
            continue;
        findings.push({
            id: `mcp-extra-server-${key}-${relPath.replace(/[^a-z0-9]/gi, "-")}`,
            severity: "advisory",
            detect: `${relPath} has the ${key} MCP server but the ${issueTracker} tracker does not use it.`,
            action: `[mcp] ${relPath} carries the ${key} MCP server, which is not used by the ${issueTracker} tracker. Remove the "${key}" entry from mcpServers.`,
        });
    }
    return findings;
}
