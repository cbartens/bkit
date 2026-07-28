// bkit-mcp-toolsets.test.ts — #341 T4 (C1).
//
// Asserts the `github` MCP server's `X-MCP-Toolsets` header includes `actions`
// (enables the CI/Actions + artifact-download MCP fallback map consumed by
// the gh->MCP fallback lane, Sub-Plan 5) in both the live `.mcp.json` and the
// shipped `.bkit/templates/.mcp.json`, and that the two stay in sync via the
// real render path (`buildMcpJson`) rather than a naive byte-equal check —
// `.mcp.json` is a Tier-3 seed-or-print file, tracker-filtered at install
// time (`buildMcpJson`), so the live copy legitimately omits the `linear`
// block the raw template carries. Validate with the real resolver, not a
// string-presence assumption.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { buildMcpJson } from "./bkit-modules.js";
import { getPkgRoot } from "./bkit-paths.js";

const pkgRoot = getPkgRoot();
const LIVE_MCP_JSON = path.join(pkgRoot, ".mcp.json");
const TEMPLATE_MCP_JSON = path.join(pkgRoot, ".bkit", "templates", ".mcp.json");

describe("bkit-mcp-toolsets — actions toolset (#341 C1)", () => {
  it("both .mcp.json and the template exist", () => {
    expect(fs.existsSync(LIVE_MCP_JSON), `Missing: ${LIVE_MCP_JSON}`).toBe(true);
    expect(fs.existsSync(TEMPLATE_MCP_JSON), `Missing: ${TEMPLATE_MCP_JSON}`).toBe(true);
  });

  it("template's github X-MCP-Toolsets includes actions", () => {
    const template = JSON.parse(fs.readFileSync(TEMPLATE_MCP_JSON, "utf-8")) as {
      mcpServers: { github?: { headers?: Record<string, string> } };
    };
    const toolsets = template.mcpServers.github?.headers?.["X-MCP-Toolsets"] ?? "";
    expect(toolsets.split(",")).toContain("actions");
  });

  it("live .mcp.json github X-MCP-Toolsets includes actions", () => {
    const live = JSON.parse(fs.readFileSync(LIVE_MCP_JSON, "utf-8")) as {
      mcpServers: { github?: { headers?: Record<string, string> } };
    };
    const toolsets = live.mcpServers.github?.headers?.["X-MCP-Toolsets"] ?? "";
    expect(toolsets.split(",")).toContain("actions");
  });

  it("live .mcp.json equals the real github-tracker render of the template (buildMcpJson)", () => {
    const rendered = buildMcpJson(TEMPLATE_MCP_JSON, "github");
    const live = fs.readFileSync(LIVE_MCP_JSON, "utf-8");
    expect(live).toBe(rendered);
  });
});
