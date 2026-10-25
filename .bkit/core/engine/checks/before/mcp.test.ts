// checks/before/mcp.test.ts — Unit tests for the Phase 1 MCP-server detectors.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectMissingMcpServers, detectExtraMcpServers, unusedTrackerMcpServers } from "./mcp";
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

/** Each tracker's MCP server URL, as install writes it under the tracker's key. */
const TRACKER_URLS = {
  github: "https://api.githubcopilot.com/mcp/",
  linear: "https://mcp.linear.app/mcp",
  jira: "https://mcp.atlassian.com/v2/mcp",
} as const;

/** The tracker-only servers (never `github`, which every tracker keeps). */
const TRACKER_ONLY_SERVERS = ["linear", "jira"] as const;

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

  it("returns advisory when .mcp.json exists but is missing the github server (github tracker)", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({ mcpServers: { linear: { url: "https://mcp.linear.app/mcp" } } }),
      "utf-8",
    );
    const findings = detectMissingMcpServers(tmpDir, ".mcp.json", "github");
    expect(findings).toHaveLength(1);
    expect(findings[0]!.severity).toBe("advisory");
    expect(findings[0]!.id).toContain("github");
    expect(findings[0]!.action).toContain("[mcp]");
    expect(findings[0]!.action).toContain(".mcp.json");
    expect(findings[0]!.action).toContain("github");
    expect(findings[0]!.action).toContain(`"url": "${TRACKER_URLS.github}"`);
    // Must not reference Linear ticket IDs
    expect(findings[0]!.action).not.toMatch(/BAR-\d+/);
  });

  it.each(TRACKER_ONLY_SERVERS)(
    "returns advisory when .mcp.json exists but is missing the %s server",
    (tracker) => {
      fs.writeFileSync(
        path.join(tmpDir, ".mcp.json"),
        JSON.stringify({ mcpServers: { github: { url: TRACKER_URLS.github } } }),
        "utf-8",
      );
      const findings = detectMissingMcpServers(tmpDir, ".mcp.json", tracker);
      expect(findings).toHaveLength(1);
      expect(findings[0]!.id).toContain(tracker);
      expect(findings[0]!.action).toContain(tracker);
      expect(findings[0]!.action).toContain(`"url": "${TRACKER_URLS[tracker]}"`);
    },
  );

  it.each(["github", ...TRACKER_ONLY_SERVERS] as const)(
    "%s tracker: requires only its own server — empty mcpServers → one advisory",
    (tracker) => {
      fs.writeFileSync(path.join(tmpDir, ".mcp.json"), JSON.stringify({ mcpServers: {} }), "utf-8");
      const findings = detectMissingMcpServers(tmpDir, ".mcp.json", tracker);
      expect(findings.map((f) => f.id)).toEqual([`mcp-missing-server-${tracker}--mcp-json`]);
    },
  );

  it.each(["github", ...TRACKER_ONLY_SERVERS] as const)(
    "%s tracker: mcpServers key absent → one advisory",
    (tracker) => {
      fs.writeFileSync(path.join(tmpDir, ".mcp.json"), JSON.stringify({ otherKey: {} }), "utf-8");
      const findings = detectMissingMcpServers(tmpDir, ".mcp.json", tracker);
      expect(findings.map((f) => f.id)).toEqual([`mcp-missing-server-${tracker}--mcp-json`]);
    },
  );

  it.each(["github", ...TRACKER_ONLY_SERVERS] as const)(
    "%s tracker: a file holding only its server (what install writes) → no advisory",
    (tracker) => {
      fs.writeFileSync(
        path.join(tmpDir, ".mcp.json"),
        JSON.stringify({ mcpServers: { [tracker]: { url: TRACKER_URLS[tracker] } } }),
        "utf-8",
      );
      expect(detectMissingMcpServers(tmpDir, ".mcp.json", tracker)).toEqual([]);
    },
  );

  it("none tracker: requires no server — an empty mcpServers (what install writes) → no advisory", () => {
    fs.writeFileSync(path.join(tmpDir, ".mcp.json"), JSON.stringify({ mcpServers: {} }), "utf-8");
    expect(detectMissingMcpServers(tmpDir, ".mcp.json", "none")).toEqual([]);
  });

  it("returns empty array when the required server is present plus extra consumer servers", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          linear: { url: "https://mcp.linear.app/mcp" },
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
    const findings = detectMissingMcpServers(tmpDir, ".cursor/mcp.json", "github");
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

  it.each([
    ["github", "linear"],
    ["linear", "github"],
    ["jira", "github"],
  ] as const)(
    "runPreflight includes mcp-missing-server advisories when a %s tracker's .mcp.json holds only %s",
    (tracker, other) => {
      fs.writeFileSync(
        path.join(tmpDir, "package.json"),
        JSON.stringify({ name: "test", bkit: { tracker: { default: tracker } } }),
        "utf-8",
      );
      fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, ".mcp.json"),
        JSON.stringify({ mcpServers: { [other]: { url: TRACKER_URLS[other] } } }),
        "utf-8",
      );
      const { advisories } = runPreflight(makeModules("core"), tmpDir);
      expect(advisories.some((f) => f.id.includes(`mcp-missing-server-${tracker}`))).toBe(true);
    },
  );

  it.each([
    ["linear", { linear: { type: "http", url: "https://mcp.linear.app/mcp" } }],
    ["jira", { jira: { type: "http", url: "https://mcp.atlassian.com/v2/mcp" } }],
    ["none", {}],
  ] as const)(
    "runPreflight: a fresh %s install's MCP files raise no mcp advisory",
    (tracker, servers) => {
      fs.writeFileSync(
        path.join(tmpDir, "package.json"),
        JSON.stringify({ name: "test", bkit: { tracker: { default: tracker } } }),
        "utf-8",
      );
      fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
      fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
      const doc = JSON.stringify({ mcpServers: servers });
      fs.writeFileSync(path.join(tmpDir, ".mcp.json"), doc, "utf-8");
      fs.writeFileSync(path.join(tmpDir, ".cursor", "mcp.json"), doc, "utf-8");
      const { advisories } = runPreflight(makeModules("core"), tmpDir);
      expect(advisories.filter((f) => f.id.startsWith("mcp-"))).toEqual([]);
    },
  );

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

  it.each(TRACKER_ONLY_SERVERS)(
    "github tracker: flags a stale %s server with a remove advisory",
    (stale) => {
      fs.writeFileSync(
        path.join(tmpDir, ".mcp.json"),
        JSON.stringify({
          mcpServers: {
            [stale]: { url: TRACKER_URLS[stale] },
            github: { url: TRACKER_URLS.github },
          },
        }),
        "utf-8",
      );
      const findings = detectExtraMcpServers(tmpDir, ".mcp.json", "github");
      expect(findings).toHaveLength(1);
      expect(findings[0]!.severity).toBe("advisory");
      expect(findings[0]!.id).toContain(`mcp-extra-server-${stale}`);
      expect(findings[0]!.action).toContain("[mcp]");
      expect(findings[0]!.action).toContain("Remove");
      expect(findings[0]!.action).toContain(stale);
      expect(findings[0]!.action).not.toMatch(/BAR-\d+/);
    },
  );

  it.each(TRACKER_ONLY_SERVERS)("none tracker: flags a stale %s server", (stale) => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          [stale]: { url: TRACKER_URLS[stale] },
          github: { url: TRACKER_URLS.github },
        },
      }),
      "utf-8",
    );
    const findings = detectExtraMcpServers(tmpDir, ".mcp.json", "none");
    expect(findings).toHaveLength(1);
    expect(findings[0]!.id).toContain(`mcp-extra-server-${stale}`);
  });

  it.each([
    ["linear", "jira"],
    ["jira", "linear"],
  ] as const)("%s tracker: flags the other tracker's stale %s server", (tracker, stale) => {
    fs.writeFileSync(
      path.join(tmpDir, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          [tracker]: { url: TRACKER_URLS[tracker] },
          [stale]: { url: TRACKER_URLS[stale] },
          github: { url: TRACKER_URLS.github },
        },
      }),
      "utf-8",
    );
    const findings = detectExtraMcpServers(tmpDir, ".mcp.json", tracker);
    expect(findings.map((f) => f.id)).toEqual([`mcp-extra-server-${stale}--mcp-json`]);
    expect(findings[0]!.detect).toContain(`the ${tracker} tracker does not use it`);
  });

  it.each([
    ["linear", { linear: { url: "https://mcp.linear.app/mcp" } }],
    ["jira", { jira: { url: "https://mcp.atlassian.com/v2/mcp" } }],
    ["none", {}],
  ] as const)(
    "%s tracker: never flags github — the gh MCP fallback calls it under every tracker",
    (tracker, trackerServer) => {
      fs.writeFileSync(
        path.join(tmpDir, ".mcp.json"),
        JSON.stringify({
          mcpServers: {
            ...trackerServer,
            github: { url: "https://api.githubcopilot.com/mcp/" },
          },
        }),
        "utf-8",
      );
      expect(detectExtraMcpServers(tmpDir, ".mcp.json", tracker)).toEqual([]);
    },
  );

  it.each(TRACKER_ONLY_SERVERS)(
    ".opencode/opencode.json: flags a stale %s entry under its mcp key",
    (stale) => {
      fs.mkdirSync(path.join(tmpDir, ".opencode"), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, ".opencode", "opencode.json"),
        JSON.stringify({
          mcp: {
            [stale]: { type: "remote", url: TRACKER_URLS[stale] },
            github: { type: "remote", url: TRACKER_URLS.github },
          },
        }),
        "utf-8",
      );
      const findings = detectExtraMcpServers(tmpDir, ".opencode/opencode.json", "github", "mcp");
      expect(findings.map((f) => f.id)).toEqual([
        `mcp-extra-server-${stale}--opencode-opencode-json`,
      ]);
      expect(findings[0]!.action).toContain(`Remove the "${stale}" entry from mcp.`);
    },
  );

  it(".opencode/opencode.json: reads only the mcp key, not mcpServers", () => {
    fs.mkdirSync(path.join(tmpDir, ".opencode"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".opencode", "opencode.json"),
      JSON.stringify({ mcpServers: { linear: { url: "https://mcp.linear.app/mcp" } } }),
      "utf-8",
    );
    expect(detectExtraMcpServers(tmpDir, ".opencode/opencode.json", "github", "mcp")).toEqual([]);
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

  it.each([
    ["github", "linear"],
    ["github", "jira"],
    ["linear", "jira"],
    ["jira", "linear"],
  ] as const)(
    "runPreflight emits mcp-extra-server advisory under the %s tracker for a stale %s server",
    (tracker, stale) => {
      fs.writeFileSync(
        path.join(tmpDir, "package.json"),
        JSON.stringify({ name: "test", bkit: { tracker: { default: tracker } } }),
        "utf-8",
      );
      fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, ".mcp.json"),
        JSON.stringify({
          mcpServers: {
            [tracker]: { url: TRACKER_URLS[tracker] },
            [stale]: { url: TRACKER_URLS[stale] },
          },
        }),
        "utf-8",
      );
      const { advisories } = runPreflight(makeModules("core"), tmpDir);
      expect(advisories.some((f) => f.id.includes(`mcp-extra-server-${stale}`))).toBe(true);
    },
  );

  it.each(TRACKER_ONLY_SERVERS)(
    "runPreflight emits mcp-extra-server advisory for a stale %s entry in .opencode/opencode.json",
    (stale) => {
      fs.writeFileSync(
        path.join(tmpDir, "package.json"),
        JSON.stringify({ name: "test", bkit: { tracker: { default: "github" } } }),
        "utf-8",
      );
      fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
      fs.mkdirSync(path.join(tmpDir, ".opencode"), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, ".opencode", "opencode.json"),
        JSON.stringify({ mcp: { [stale]: { type: "remote", url: TRACKER_URLS[stale] } } }),
        "utf-8",
      );
      const { advisories } = runPreflight(makeModules("core"), tmpDir);
      expect(advisories.map((f) => f.id)).toContain(
        `mcp-extra-server-${stale}--opencode-opencode-json`,
      );
    },
  );
});

describe("unusedTrackerMcpServers", () => {
  it("github and none trackers have no use for linear or jira; github is never unused", () => {
    expect(unusedTrackerMcpServers("github")).toEqual(["linear", "jira"]);
    expect(unusedTrackerMcpServers("none")).toEqual(["linear", "jira"]);
  });

  it("linear and jira each leave only the other unused (github stays for the workflow fallback)", () => {
    expect(unusedTrackerMcpServers("linear")).toEqual(["jira"]);
    expect(unusedTrackerMcpServers("jira")).toEqual(["linear"]);
  });
});
