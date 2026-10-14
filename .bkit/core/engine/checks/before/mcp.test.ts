// checks/before/mcp.test.ts — Unit tests for the Phase 1 MCP-server detectors.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectMissingMcpServers, detectExtraMcpServers } from "./mcp";
import { runPreflight } from "./index";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

let originalCwd: string;

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-preflight-test-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function makeModules(...flags: string[]): Set<import("../../cli").ModuleFlag> {
  return new Set(flags) as Set<import("../../cli").ModuleFlag>;
}

// ---------------------------------------------------------------------------
// process.env snapshot and restore around each test
// ---------------------------------------------------------------------------

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalEnv = { ...process.env };
});

afterEach(() => {
  process.env = originalEnv;
});

// ---------------------------------------------------------------------------
// detectMissingMcpServers — advisory detector for .mcp.json / .cursor/mcp.json
// ---------------------------------------------------------------------------

describe("detectMissingMcpServers", () => {
  it("returns empty array when file does not exist (the next install writes it)", () => {
    expect(detectMissingMcpServers(tmpDir, ".mcp.json", "linear")).toEqual([]);
    expect(detectMissingMcpServers(tmpDir, ".cursor/mcp.json", "linear")).toEqual([]);
  });

  it("returns empty array when file is malformed JSON (skip silently)", () => {
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), "not valid json{{{", "utf-8");
    expect(detectMissingMcpServers(tmpDir, ".mcp.json", "linear")).toEqual([]);
  });

  it("returns advisory when .mcp.json exists but is missing the github server", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({ mcpServers: { linear: { url: "https://mcp.linear.app/mcp" } } }),
      "utf-8",
    );
    const findings = detectMissingMcpServers(tmpDir, ".mcp.json", "linear");
    expect(findings).toHaveLength(1);
    expect(findings[0]!.severity).toBe("advisory");
    expect(findings[0]!.id).toContain("github");
    expect(findings[0]!.action).toContain("[mcp]");
    expect(findings[0]!.action).toContain(".mcp.json");
    expect(findings[0]!.action).toContain("github");
    // Must not reference Linear ticket IDs
    expect(findings[0]!.action).not.toMatch(/BAR-\d+/);
  });

  it("returns advisory when .mcp.json exists but is missing the linear server", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({ mcpServers: { github: { url: "https://api.githubcopilot.com/mcp/" } } }),
      "utf-8",
    );
    const findings = detectMissingMcpServers(tmpDir, ".mcp.json", "linear");
    expect(findings).toHaveLength(1);
    expect(findings[0]!.id).toContain("linear");
    expect(findings[0]!.action).toContain("linear");
  });

  it("returns two advisories when .mcp.json exists but mcpServers is empty", () => {
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), JSON.stringify({ mcpServers: {} }), "utf-8");
    const findings = detectMissingMcpServers(tmpDir, ".mcp.json", "linear");
    expect(findings).toHaveLength(2);
  });

  it("returns two advisories when .mcp.json exists but mcpServers key is absent", () => {
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), JSON.stringify({ otherKey: {} }), "utf-8");
    const findings = detectMissingMcpServers(tmpDir, ".mcp.json", "linear");
    expect(findings).toHaveLength(2);
  });

  it("returns empty array when both required servers are present", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          linear: { url: "https://mcp.linear.app/mcp" },
          github: { url: "https://api.githubcopilot.com/mcp/" },
        },
      }),
      "utf-8",
    );
    expect(detectMissingMcpServers(tmpDir, ".mcp.json", "linear")).toEqual([]);
  });

  it("returns empty array when both required servers are present plus extra consumer servers", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          linear: { url: "https://mcp.linear.app/mcp" },
          github: { url: "https://api.githubcopilot.com/mcp/" },
          "my-custom-server": { url: "https://example.com/mcp" },
        },
      }),
      "utf-8",
    );
    expect(detectMissingMcpServers(tmpDir, ".mcp.json", "linear")).toEqual([]);
  });

  it("works identically for .cursor/mcp.json path", () => {
    fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".cursor", "mcp.json"),
      JSON.stringify({ mcpServers: { linear: { url: "https://mcp.linear.app/mcp" } } }),
      "utf-8",
    );
    const findings = detectMissingMcpServers(tmpDir, ".cursor/mcp.json", "linear");
    expect(findings).toHaveLength(1);
    expect(findings[0]!.action).toContain(".cursor/mcp.json");
  });

  it("advisory action text contains no BAR-XXX Linear ticket references", () => {
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), JSON.stringify({ mcpServers: {} }), "utf-8");
    const findings = detectMissingMcpServers(tmpDir, ".mcp.json", "linear");
    for (const f of findings) {
      expect(f.action).not.toMatch(/BAR-\d+/);
      expect(f.detect).not.toMatch(/BAR-\d+/);
    }
  });

  it("runPreflight includes mcp-missing-server advisories when .mcp.json is missing github", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "test" }), "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({ mcpServers: { linear: { url: "https://mcp.linear.app/mcp" } } }),
      "utf-8",
    );
    const { advisories } = runPreflight(makeModules("core"), tmpDir);
    expect(advisories.some((f) => f.id.includes("mcp-missing-server-github"))).toBe(true);
  });

  it("runPreflight does NOT emit mcp advisory when .mcp.json is absent", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "test" }), "utf-8");
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    const { advisories } = runPreflight(makeModules("core"), tmpDir);
    expect(advisories.some((f) => f.id.includes("mcp-missing-server"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// detectExtraMcpServers — symmetric "no longer needed" advisory
// ---------------------------------------------------------------------------

describe("detectExtraMcpServers", () => {
  it("returns empty array when file does not exist", () => {
    expect(detectExtraMcpServers(tmpDir, ".mcp.json", "github")).toEqual([]);
  });

  it("returns empty array when file is malformed JSON (skip silently)", () => {
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), "not valid json{{{", "utf-8");
    expect(detectExtraMcpServers(tmpDir, ".mcp.json", "github")).toEqual([]);
  });

  it("github tracker: flags a stale linear server with a remove advisory", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          linear: { url: "https://mcp.linear.app/mcp" },
          github: { url: "https://api.githubcopilot.com/mcp/" },
        },
      }),
      "utf-8",
    );
    const findings = detectExtraMcpServers(tmpDir, ".mcp.json", "github");
    expect(findings).toHaveLength(1);
    expect(findings[0]!.severity).toBe("advisory");
    expect(findings[0]!.id).toContain("mcp-extra-server-linear");
    expect(findings[0]!.action).toContain("[mcp]");
    expect(findings[0]!.action).toContain("Remove");
    expect(findings[0]!.action).toContain("linear");
    expect(findings[0]!.action).not.toMatch(/BAR-\d+/);
  });

  it("none tracker: flags a stale linear server (only github is needed for PR ops)", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          linear: { url: "https://mcp.linear.app/mcp" },
          github: { url: "https://api.githubcopilot.com/mcp/" },
        },
      }),
      "utf-8",
    );
    const findings = detectExtraMcpServers(tmpDir, ".mcp.json", "none");
    expect(findings).toHaveLength(1);
    expect(findings[0]!.id).toContain("mcp-extra-server-linear");
  });

  it("linear tracker: github + linear are both allowed → no advisory", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          linear: { url: "https://mcp.linear.app/mcp" },
          github: { url: "https://api.githubcopilot.com/mcp/" },
        },
      }),
      "utf-8",
    );
    expect(detectExtraMcpServers(tmpDir, ".mcp.json", "linear")).toEqual([]);
  });

  it("never flags consumer-added (non-bkit-managed) MCP servers for removal", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          github: { url: "https://api.githubcopilot.com/mcp/" },
          "my-custom-server": { url: "https://example.com/mcp" },
        },
      }),
      "utf-8",
    );
    expect(detectExtraMcpServers(tmpDir, ".mcp.json", "github")).toEqual([]);
  });

  it("works identically for .cursor/mcp.json path", () => {
    fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".cursor", "mcp.json"),
      JSON.stringify({
        mcpServers: {
          linear: { url: "https://mcp.linear.app/mcp" },
          github: { url: "https://api.githubcopilot.com/mcp/" },
        },
      }),
      "utf-8",
    );
    const findings = detectExtraMcpServers(tmpDir, ".cursor/mcp.json", "github");
    expect(findings).toHaveLength(1);
    expect(findings[0]!.action).toContain(".cursor/mcp.json");
  });

  it("runPreflight emits mcp-extra-server advisory for stale linear under github tracker", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "test", bkit: { issueTracker: "github" } }),
      "utf-8",
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          linear: { url: "https://mcp.linear.app/mcp" },
          github: { url: "https://api.githubcopilot.com/mcp/" },
        },
      }),
      "utf-8",
    );
    const { advisories } = runPreflight(makeModules("core"), tmpDir);
    expect(advisories.some((f) => f.id.includes("mcp-extra-server-linear"))).toBe(true);
  });
});
