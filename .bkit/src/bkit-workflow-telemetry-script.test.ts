// bkit-workflow-telemetry.sh — verifies the extracted per-workflow close script writes
// a schema-valid `outcome` run row (duration / size / frictionAdded) against a git
// fixture. The `pnpm bkit comply` / `bkit telemetry summary` sub-calls fail-open in
// the fixture (no bkit installed there); the row-writing logic is what this pins.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { validate } from "./bkit-telemetry";

const SCRIPT = path.resolve(__dirname, "../scripts/bkit-workflow-telemetry.sh");
const hasTools =
  spawnSync("git", ["--version"]).status === 0 && spawnSync("jq", ["--version"]).status === 0;

function git(cwd: string, ...args: string[]): void {
  spawnSync("git", args, { cwd, encoding: "utf8" });
}

describe.skipIf(!hasTools)("bkit-workflow-telemetry.sh — per-workflow run row", () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-wfclose-"));
    git(dir, "init", "-q");
    git(dir, "config", "user.email", "t@t.co");
    git(dir, "config", "user.name", "t");
    git(dir, "remote", "add", "origin", "https://github.com/cbartens/bkit.git");
    fs.mkdirSync(path.join(dir, ".bkit"), { recursive: true });
    fs.mkdirSync(path.join(dir, "docs/plans/202607/logs/fid"), { recursive: true });
    fs.writeFileSync(path.join(dir, ".bkit/version"), JSON.stringify({ pinnedVersion: "4.6.3" }));
    fs.writeFileSync(path.join(dir, "a.txt"), "base\n");
    git(dir, "add", "-A");
    git(dir, "commit", "-qm", "base");
    const base = spawnSync("git", ["rev-parse", "HEAD"], {
      cwd: dir,
      encoding: "utf8",
    }).stdout.trim();
    // workflow-started carries the base SHA + a fixed past start time.
    fs.writeFileSync(
      path.join(dir, "docs/plans/202607/logs/fid/status.jsonl"),
      JSON.stringify({
        type: "workflow-started",
        workflow: "build",
        at: "2020-01-01T00:00:00Z",
        parentSha: base,
      }) + "\n",
    );
    // one friction row raised "this run" (ts after the start).
    fs.writeFileSync(
      path.join(dir, ".bkit/friction.jsonl"),
      JSON.stringify({
        ts: 1577836801000,
        kind: "friction",
        repo: "cbartens/bkit",
        bkitVersion: "4.6.3",
        workflow: "build",
        step: "x",
        key: "fr1",
        category: "agent-rework",
        scope: "bkit-repo",
        severity: "MEDIUM",
        description: "d",
      }) + "\n",
    );
    // a code change so the diff is non-empty.
    fs.writeFileSync(path.join(dir, "a.txt"), "base\nline1\n");
    fs.writeFileSync(path.join(dir, "b.txt"), "new\n");
    git(dir, "add", "-A");
    git(dir, "commit", "-qm", "work");
  });

  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

  it("appends a schema-valid outcome row (duration / size / frictionAdded), no prNumber", () => {
    spawnSync("bash", [SCRIPT, "build", "202607", "fid"], { cwd: dir, encoding: "utf8" });
    const stats = fs.readFileSync(path.join(dir, ".bkit/stats.jsonl"), "utf8").trim().split("\n");
    const row = JSON.parse(stats[stats.length - 1]);
    expect(validate(row).ok).toBe(true);
    expect(row.kind).toBe("outcome");
    expect(row.workflow).toBe("build");
    expect(row.step).toBe("build-close-workflow");
    expect(row.linesChanged).toBeGreaterThan(0);
    expect(row.filesChanged).toBeGreaterThan(0);
    expect(row.frictionAdded).toBe(1); // one friction row raised after start
    expect(typeof row.durationSeconds).toBe("number");
    expect(row.prNumber).toBeUndefined(); // non-ship run rows carry no PR number
  });

  it("never leaves a malformed row even when ledgers are absent", () => {
    fs.rmSync(path.join(dir, ".bkit/friction.jsonl"));
    spawnSync("bash", [SCRIPT, "design", "202607", "fid"], { cwd: dir, encoding: "utf8" });
    const stats = fs.readFileSync(path.join(dir, ".bkit/stats.jsonl"), "utf8").trim().split("\n");
    const row = JSON.parse(stats[stats.length - 1]);
    expect(validate(row).ok).toBe(true);
    expect(row.frictionAdded).toBe(0);
    expect(row.deferralsAdded).toBe(0);
  });
});
