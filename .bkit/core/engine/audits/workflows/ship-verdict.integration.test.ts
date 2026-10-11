/**
 * audits/workflows/ship-verdict.integration.test.ts
 *
 * Boundary: real bash + real fs + the built `bkit roadmap feature` (dist/, no
 * mocks for the happy path). Runs the EXACT Step 6 `roadmap feature --strict`
 * line shipped in `.bkit/core/workflows/bkit-ship.md` — the SHIPPED row append, and
 * the exit that stops the step when the row did not land.
 */

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..", "..", "..", "..");
const SHIP_MD = path.join(REPO_ROOT, ".bkit", "core", "workflows", "bkit-ship.md");
const BKIT_BIN = path.join(REPO_ROOT, "dist", "cli.js");
const FID = "412-export-csv";

/** The Step 6 `roadmap feature` line (the step's row writes need a status log and are not run). */
function extractStep6Line(): string {
  const content = fs.readFileSync(SHIP_MD, "utf-8");
  const start = content.search(/^## .*Step 6 —/m);
  expect(start, "bkit-ship.md Step 6 heading not found").toBeGreaterThan(-1);
  const step6 = content.slice(start, content.indexOf("### ", start));
  const line = step6
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith('"{BKIT}" roadmap feature '));
  expect(line, "Step 6 bkit roadmap feature line not found").toBeDefined();
  return line!;
}

let tmpDir: string;
let worktree: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ship-verdict-test-"));
  worktree = path.join(tmpDir, "wt");
  fs.mkdirSync(path.join(worktree, "docs"), { recursive: true });
  fs.mkdirSync(path.join(worktree, ".bkit"), { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

/** Run the shipped line with `{BKIT}` = `bkit` (a path to an executable), from an unrelated cwd; its exit code. */
function runStep6(bkit: string): number {
  const snippet = extractStep6Line()
    .replaceAll("{BKIT}", bkit)
    .replaceAll("{WORKTREE_PATH}", worktree)
    .replaceAll("{FID}", FID);
  const otherDir = fs.mkdtempSync(path.join(tmpDir, "cwd-"));
  const res = spawnSync("bash", ["-c", `cd "${otherDir}"\n${snippet}`], { encoding: "utf-8" });
  return res.status ?? -1;
}

/** An executable `bkit` stand-in that prints `stdout` and exits `code`. */
function stub(stdout: string, code = 0): string {
  const file = path.join(tmpDir, `bkit-stub-${Math.random().toString(36).slice(2)}`);
  fs.writeFileSync(file, `#!/bin/bash\ncat <<'EOF'\n${stdout}\nEOF\nexit ${code}\n`, {
    mode: 0o755,
  });
  return file;
}

function realBkit(): string {
  const file = path.join(tmpDir, "bkit");
  fs.writeFileSync(file, `#!/bin/bash\nexec node "${BKIT_BIN}" "$@"\n`, { mode: 0o755 });
  return file;
}

describe("Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10)", () => {
  it("exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd)", () => {
    expect(fs.existsSync(BKIT_BIN), "dist/cli.js missing — run the build").toBe(true);
    expect(runStep6(realBkit())).toBe(0);
    const rows = fs
      .readFileSync(path.join(worktree, ".bkit", "issues.jsonl"), "utf-8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      kind: "feature",
      workflow: "ship",
      key: FID,
      step: "ship-update-docs",
      status: "SHIPPED",
    });
  });

  it("stops the step when the ledger could not be written (fail-open append, appended=false)", () => {
    fs.mkdirSync(path.join(worktree, ".bkit", "issues.jsonl"));
    expect(runStep6(realBkit())).not.toBe(0);
  });

  it("stops the step when the command crashed or was misused", () => {
    expect(runStep6(stub("", 2))).not.toBe(0);
    expect(runStep6(stub("not json", 1))).not.toBe(0);
  });
});
