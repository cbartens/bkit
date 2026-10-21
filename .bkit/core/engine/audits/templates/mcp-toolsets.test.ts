// audits/templates/mcp-toolsets.test.ts
//
// Asserts the `github` MCP server's `X-MCP-Toolsets` header includes `actions` (the
// CI/Actions + artifact-download MCP fallback map the gh->MCP fallback lane uses) in
// both the live `.mcp.json` and the shipped `.bkit/shared/.mcp.json`, and that the
// two agree through the real render path (`buildMcpJson`): bkit owns only the tracker
// entry of `.mcp.json`, rendered tracker-filtered, so the live copy omits the `linear`
// block the raw template carries.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { buildMcpJson } from "../../install/modules/claude.js";
import { getPkgRoot } from "../../shared/package-roots.js";

const pkgRoot = getPkgRoot();
const LIVE_MCP_JSON = path.join(pkgRoot, ".mcp.json");
const TEMPLATE_MCP_JSON = path.join(pkgRoot, ".bkit", "shared", ".mcp.json");

/** The comma-separated `X-MCP-Toolsets` entries of the github server in an .mcp.json file. */
function githubToolsets(file: string): string[] {
  const parsed = JSON.parse(fs.readFileSync(file, "utf-8")) as {
    mcpServers: { github?: { headers?: Record<string, string> } };
  };
  return (parsed.mcpServers.github?.headers?.["X-MCP-Toolsets"] ?? "").split(",");
}

describe("bkit-mcp-toolsets — actions toolset (#341 C1)", () => {
  it("both .mcp.json and the template exist", () => {
    expect(fs.existsSync(LIVE_MCP_JSON), `Missing: ${LIVE_MCP_JSON}`).toBe(true);
    expect(fs.existsSync(TEMPLATE_MCP_JSON), `Missing: ${TEMPLATE_MCP_JSON}`).toBe(true);
  });

  it("template's github X-MCP-Toolsets includes actions", () => {
    expect(githubToolsets(TEMPLATE_MCP_JSON)).toContain("actions");
  });

  it("live .mcp.json github X-MCP-Toolsets includes actions", () => {
    expect(githubToolsets(LIVE_MCP_JSON)).toContain("actions");
  });

  // Per server: the live file may also carry consumer-added servers (bkit wires
  // Serena from its copy-and-own template), which the seed never flags.
  it("every server the github-tracker render seeds is identical in live .mcp.json (buildMcpJson)", () => {
    type McpFile = { mcpServers: Record<string, unknown> };
    const rendered = JSON.parse(buildMcpJson(TEMPLATE_MCP_JSON, "github")) as McpFile;
    const live = JSON.parse(fs.readFileSync(LIVE_MCP_JSON, "utf-8")) as McpFile;
    expect(Object.keys(rendered.mcpServers)).not.toHaveLength(0);
    for (const [name, server] of Object.entries(rendered.mcpServers)) {
      expect(live.mcpServers[name], `live .mcp.json server ${name}`).toEqual(server);
    }
  });
});

describe("jira tracker render", () => {
  it("writes only the jira server, Bearer-authenticated, identically for Claude and Cursor", () => {
    const cursor = path.join(pkgRoot, ".bkit", "shared", ".cursor", "mcp.json");
    const expected = {
      mcpServers: {
        jira: {
          type: "http",
          url: "https://mcp.atlassian.com/v2/mcp",
          headers: { Authorization: "Bearer ${BKIT_JIRA_API_TOKEN}" },
        },
      },
    };
    expect(JSON.parse(buildMcpJson(TEMPLATE_MCP_JSON, "jira"))).toEqual(expected);
    expect(JSON.parse(buildMcpJson(cursor, "jira"))).toEqual(expected);
  });
});
