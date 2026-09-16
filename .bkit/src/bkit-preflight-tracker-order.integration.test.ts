// bkit-preflight-tracker-order.integration.test.ts
// Regression: preflight must grade the tracker the run INSTALLS, not the one on disk.
//
// The install path resolved `issueTracker` (including the `--tracker=` override) ~70 lines
// AFTER it called runPreflight, so preflight silently fell back to reading the pre-install
// package.json. On the run that switched linear -> github the tracker-dependent detectors
// graded "linear": mcp-extra-server-linear was suppressed (linear allows linear) while
// mcp-missing-server-github still fired (linear requires github too) — so the switching run
// told the consumer to ADD github and never told them to drop the now-unused linear server.
//
// The detectors were correct in isolation; only the install wiring was wrong. These tests
// therefore drive the real CLI rather than calling the detectors directly.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const bkitInstallPath = path.resolve(__dirname, "bkit-install.ts");
const tsxBin = path.resolve(__dirname, "../../node_modules/.bin/tsx");

let tmpDir: string;
let originalCwd: string;

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tracker-order-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

/** A consumer already recorded on `linear`, carrying only the linear MCP server. */
function seedLinearConsumer(dir: string): void {
  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({ name: "test-consumer", bkit: { issueTracker: "linear" } }),
    "utf-8",
  );
  fs.writeFileSync(
    path.join(dir, ".mcp.json"),
    JSON.stringify({ mcpServers: { linear: { type: "http", url: "https://mcp.linear.app/mcp" } } }),
    "utf-8",
  );
  fs.mkdirSync(path.join(dir, ".git"), { recursive: true });
}

function runCheckWithTrackerSwitch(dir: string): string {
  const result = spawnSync(tsxBin, [bkitInstallPath, "check", "--tracker=github"], {
    cwd: dir,
    encoding: "utf-8",
    timeout: 60_000,
    env: { ...process.env, BKIT_GH_TOKEN_INSTALL: "test-token" },
  });
  return `${result.stdout ?? ""}${result.stderr ?? ""}`;
}

describe("preflight tracker resolution order — integration", () => {
  it("grades --tracker=github, not the linear value still on disk", () => {
    if (!fs.existsSync(tsxBin)) return; // skip if tsx not available (CI without devDeps)

    seedLinearConsumer(tmpDir);
    const output = runCheckWithTrackerSwitch(tmpDir);

    // The regression: this advisory was suppressed because preflight graded the stale "linear".
    expect(
      output,
      `extra-server advisory missing — preflight graded the stale on-disk tracker:\n${output}`,
    ).toContain("mcp-extra-server-linear--mcp-json");
  });

  it("names the tracker being installed in the advisory text", () => {
    if (!fs.existsSync(tsxBin)) return;

    seedLinearConsumer(tmpDir);
    const output = runCheckWithTrackerSwitch(tmpDir);

    // Guards the sibling symptom: the advisory rendered but named the pre-install tracker.
    expect(output).toContain("the github tracker does not use it");
    expect(output).not.toContain("the linear tracker does not use it");
    expect(output).not.toContain("the none tracker does not use it");
  });
});
