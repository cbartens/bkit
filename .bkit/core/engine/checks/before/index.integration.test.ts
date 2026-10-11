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

const bkitInstallPath = path.resolve(__dirname, "../../cli.ts");
const tsxBin = path.resolve(__dirname, "../../../../../node_modules/.bin/tsx");

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
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);

    seedLinearConsumer(tmpDir);
    const output = runCheckWithTrackerSwitch(tmpDir);

    // Graded against the installed "github", not the on-disk "linear".
    expect(
      output,
      `extra-server advisory missing — preflight graded the stale on-disk tracker:\n${output}`,
    ).toContain("mcp-extra-server-linear--mcp-json");
  });

  it("names the tracker being installed in the advisory text", () => {
    expect(fs.existsSync(tsxBin), `tsx not found at ${tsxBin}; run pnpm install`).toBe(true);

    seedLinearConsumer(tmpDir);
    const output = runCheckWithTrackerSwitch(tmpDir);

    // Guards the sibling symptom: the advisory rendered but named the pre-install tracker.
    expect(output).toContain("the github tracker does not use it");
    expect(output).not.toContain("the linear tracker does not use it");
    expect(output).not.toContain("the none tracker does not use it");
  });
});
