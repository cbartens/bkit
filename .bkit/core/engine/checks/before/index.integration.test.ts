// checks/before/index.integration.test.ts
// Preflight grades the tracker the run INSTALLS (including the `--tracker=` override), not
// the one on disk. A run switching linear -> github reports mcp-extra-server-linear.
//
// These tests drive the real CLI (the install wiring), not the detectors directly.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { requireTsx } from "../../../../../vitest.tsx-bin";

const bkitInstallPath = path.resolve(__dirname, "../../cli.ts");
let tmpDir: string;
let originalCwd: string;

/** The URL install writes for each tracker-only MCP server. */
const TRACKER_URLS = {
  linear: "https://mcp.linear.app/mcp",
  jira: "https://mcp.atlassian.com/v2/mcp",
} as const;

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tracker-order-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

/** A consumer already recorded on `tracker`, carrying only that tracker's MCP server. */
function seedConsumer(dir: string, tracker: keyof typeof TRACKER_URLS): void {
  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({ name: "test-consumer", bkit: { tracker: { default: tracker } } }),
    "utf-8",
  );
  fs.writeFileSync(
    path.join(dir, ".mcp.json"),
    JSON.stringify({ mcpServers: { [tracker]: { type: "http", url: TRACKER_URLS[tracker] } } }),
    "utf-8",
  );
  fs.mkdirSync(path.join(dir, ".git"), { recursive: true });
}

function runCheckWithTrackerSwitch(dir: string, tracker: string): string {
  const result = spawnSync(requireTsx(), [bkitInstallPath, "check", `--tracker=${tracker}`], {
    cwd: dir,
    encoding: "utf-8",
    timeout: 60_000,
    env: { ...process.env },
  });
  return `${result.stdout ?? ""}${result.stderr ?? ""}`;
}

describe.each([
  ["linear", "github"],
  ["linear", "jira"],
  ["jira", "github"],
  ["jira", "linear"],
] as const)("preflight tracker resolution order (%s -> %s) — integration", (onDisk, installed) => {
  it(`grades --tracker=${installed}, not the ${onDisk} value still on disk`, () => {
    seedConsumer(tmpDir, onDisk);
    const output = runCheckWithTrackerSwitch(tmpDir, installed);

    // Graded against the installed tracker, not the on-disk one.
    expect(
      output,
      `extra-server advisory missing — preflight graded the stale on-disk tracker:\n${output}`,
    ).toContain(`mcp-extra-server-${onDisk}--mcp-json`);
  });

  it("names the tracker being installed in the advisory text", () => {
    seedConsumer(tmpDir, onDisk);
    const output = runCheckWithTrackerSwitch(tmpDir, installed);

    // Guards the sibling symptom: the advisory rendered but named the pre-install tracker.
    expect(output).toContain(`the ${installed} tracker does not use it`);
    expect(output).not.toContain(`the ${onDisk} tracker does not use it`);
    expect(output).not.toContain("the none tracker does not use it");
  });
});
