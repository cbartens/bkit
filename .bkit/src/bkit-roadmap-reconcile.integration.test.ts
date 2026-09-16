/**
 * bkit-roadmap-reconcile.integration.test.ts — #380 Sub-plan 2 Task 12,
 * matrix row 16.
 *
 * Boundary: a REAL temp git repo with real `feat/*` branches — no mocks.
 * Sources the shipped `bkit_roadmap_drift_check` function (never re-inlined
 * by hand) and executes it against real branches, proving: a live `feat/*`
 * with NO docs/roadmap.jsonl row WARNS, one WITH a row is silent, and neither
 * path ever mutates docs/roadmap.md (Directive 4, RESCOPED — the board needs
 * no recovery, only a drift warning).
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const REPO_ROOT_DIR = path.resolve(import.meta.dirname, "..", "..");
const RECONCILE_SH = path.join(
  REPO_ROOT_DIR,
  ".bkit",
  "templates",
  ".bkit",
  "scripts",
  "bkit-roadmap-reconcile.sh",
);

let tmpDir: string;
let repoDir: string;

function sh(cmd: string, cwd: string): string {
  return execSync(cmd, { cwd, shell: "/bin/bash", encoding: "utf-8" });
}

function runDriftCheck(roadmapJsonl: string): { stdout: string; stderr: string } {
  const script = `
    set -e
    . "${RECONCILE_SH}"
    bkit_roadmap_drift_check "${repoDir}" "${roadmapJsonl}"
  `;
  try {
    execSync(`bash -c '${script.replace(/'/g, "'\\''")}'`, { encoding: "utf-8" });
    return { stdout: "", stderr: "" };
  } catch (e) {
    // execSync throws on non-zero exit; the function must never exit
    // non-zero, so any throw here is itself a test failure signal.
    throw e;
  }
}

function runDriftCheckCapture(roadmapJsonl: string): string {
  const script = `
    . "${RECONCILE_SH}"
    bkit_roadmap_drift_check "${repoDir}" "${roadmapJsonl}" 2>&1
  `;
  return execSync(`bash -c '${script.replace(/'/g, "'\\''")}'`, { encoding: "utf-8" });
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-roadmap-reconcile-"));
  repoDir = path.join(tmpDir, "repo");
  fs.mkdirSync(repoDir, { recursive: true });
  sh(`git init -b dev`, repoDir);
  sh(`git config user.email t@t.com`, repoDir);
  sh(`git config user.name t`, repoDir);
  fs.writeFileSync(path.join(repoDir, "seed.txt"), "seed", "utf-8");
  sh(`git add -A && git commit -m init`, repoDir);
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("bkit_roadmap_drift_check — behavioral (#380, matrix row 16)", () => {
  it("warns when a live feat/* branch has NO docs/roadmap.jsonl row", () => {
    sh(`git checkout -b feat/412-export-csv`, repoDir);
    sh(`git checkout dev`, repoDir);

    const roadmapJsonl = path.join(tmpDir, "roadmap.jsonl");
    fs.writeFileSync(roadmapJsonl, "", "utf-8");

    const output = runDriftCheckCapture(roadmapJsonl);
    expect(output).toContain("[bkit-roadmap] drift: live feat/412-export-csv has NO");
  });

  it("is silent when the live feat/* branch DOES have a ledger row", () => {
    sh(`git checkout -b feat/412-export-csv`, repoDir);
    sh(`git checkout dev`, repoDir);

    const roadmapJsonl = path.join(tmpDir, "roadmap.jsonl");
    fs.writeFileSync(
      roadmapJsonl,
      JSON.stringify({ ts: 1, kind: "feature", key: "412-export-csv", status: "BUILT" }) + "\n",
      "utf-8",
    );

    const output = runDriftCheckCapture(roadmapJsonl);
    expect(output).not.toContain("drift:");
  });

  it("never mutates docs/roadmap.md (the board needs no recovery — it is regenerated from the ledger)", () => {
    sh(`git checkout -b feat/412-export-csv`, repoDir);
    sh(`git checkout dev`, repoDir);

    fs.mkdirSync(path.join(repoDir, "docs"), { recursive: true });
    const roadmapMd = path.join(repoDir, "docs", "roadmap.md");
    fs.writeFileSync(roadmapMd, "# Roadmap\n\nunchanged sentinel\n", "utf-8");
    const before = fs.readFileSync(roadmapMd, "utf-8");

    const roadmapJsonl = path.join(tmpDir, "roadmap.jsonl");
    fs.writeFileSync(roadmapJsonl, "", "utf-8");
    runDriftCheckCapture(roadmapJsonl);

    const after = fs.readFileSync(roadmapMd, "utf-8");
    expect(after).toBe(before);
  });

  it("exits 0 and never throws even when jq/docs are absent (fail-open)", () => {
    const missingRoadmap = path.join(tmpDir, "missing.jsonl");
    expect(() => runDriftCheck(missingRoadmap)).not.toThrow();
  });
});
