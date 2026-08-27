/**
 * bkit-roadmap-devwrite.integration.test.ts — #380 Sub-plan 1 Task 7,
 * matrix row 21.
 *
 * Boundary: a REAL temp git repo (bare "origin" + a working clone) — no
 * mocks. Extracts the dev-lock ledger mirror block VERBATIM out of
 * `bkit-build.md`'s close step (never re-inlined by hand) and executes it,
 * so a drift between this test and the shipped shell can never pass
 * silently. The busy-lock `DEADLINE`/`sleep` values are the only two
 * substitutions applied — for test speed only — and each substitution
 * asserts it matched at least once, so a silent no-op (i.e. drift in the
 * shipped source) fails loudly instead of just running slow.
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const REPO_ROOT_DIR = path.resolve(import.meta.dirname, "..", "..");
const BUILD_MD = path.join(REPO_ROOT_DIR, ".bkit", "workflows", "bkit-build.md");

const START_MARKER = 'DEVLOCK="$REPO_ROOT/.bkit/.dev.lock"';
const END_MARKER = 'git -C "$REPO_ROOT" checkout "$CUR_BRANCH" 2>/dev/null || true';

/** Extract the dev-lock ledger mirror block verbatim from bkit-build.md's close step. */
function extractDevLockMirror(): string {
  const content = fs.readFileSync(BUILD_MD, "utf-8");
  const start = content.indexOf(START_MARKER);
  expect(start, `bkit-build.md must define ${START_MARKER}`).toBeGreaterThan(-1);
  const endIdx = content.indexOf(END_MARKER, start);
  expect(endIdx, `bkit-build.md must define ${END_MARKER}`).toBeGreaterThan(-1);
  return content.slice(start, endIdx + END_MARKER.length);
}

/**
 * Speed up the busy-lock DEADLINE/poll interval for the test only — both
 * substitutions assert they matched, so drift in the shipped source (which
 * would make the substitution a no-op) fails the test instead of just
 * running slow.
 */
function forTestSpeed(snippet: string): string {
  const withDeadline = snippet.replace(
    "DEADLINE=$(( $(date +%s) + 60 ))",
    "DEADLINE=$(( $(date +%s) + 2 ))",
  );
  expect(withDeadline, "DEADLINE substitution must match shipped source").not.toBe(snippet);
  const withSleep = withDeadline.replace("sleep 5", "sleep 1");
  expect(withSleep, "sleep substitution must match shipped source").not.toBe(withDeadline);
  return withSleep;
}

/** Build the executable dev-lock mirror script for a given FID, extracted then parameterised. */
function devLockMirrorScript(fid: string): string {
  const extracted = forTestSpeed(extractDevLockMirror());
  const withFid = extracted.replace(/\{FID\}/g, fid);
  expect(withFid, "{FID} substitution must match shipped source").not.toBe(extracted);
  return `REPO_ROOT="$1"\nROADMAP_LINE="$2"\n${withFid}`;
}

let tmpDir: string;
let originDir: string;
let repoDir: string;

function sh(cmd: string, cwd: string): string {
  return execSync(cmd, { cwd, shell: "/bin/bash", encoding: "utf-8" });
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-roadmap-devwrite-"));
  originDir = path.join(tmpDir, "origin.git");
  repoDir = path.join(tmpDir, "repo");
  sh(`git init --bare -b dev "${originDir}"`, tmpDir);
  sh(`git clone "${originDir}" "${repoDir}"`, tmpDir);
  sh(`git -c user.email=t@t.com -c user.name=t checkout -b dev`, repoDir);
  fs.mkdirSync(path.join(repoDir, "docs"), { recursive: true });
  fs.mkdirSync(path.join(repoDir, ".bkit", "scripts"), { recursive: true });
  fs.writeFileSync(path.join(repoDir, "docs", "roadmap.jsonl"), "", "utf-8");
  fs.copyFileSync(
    path.resolve(
      import.meta.dirname,
      "..",
      "templates",
      ".bkit",
      "scripts",
      "bkit-roadmap-fold.sh",
    ),
    path.join(repoDir, ".bkit", "scripts", "bkit-roadmap-fold.sh"),
  );
  fs.copyFileSync(
    path.resolve(import.meta.dirname, "..", "templates", ".bkit", "scripts", "bkit-status-fold.sh"),
    path.join(repoDir, ".bkit", "scripts", "bkit-status-fold.sh"),
  );
  // Set the identity BEFORE the first commit, not after: a runner with no
  // global git identity fails `git commit` outright, so every commit in this
  // fixture — the seed below as well as the extracted snippet's dev-side one
  // (bkit-build.md relies on the workflow's ambient global identity) — has to
  // be covered.
  sh(`git config user.email t@t.com`, repoDir);
  sh(`git config user.name t`, repoDir);
  sh(`git add -A && git commit -m init`, repoDir);
  sh(`git push origin dev`, repoDir);
  sh(`git checkout -b feat/412-export-csv`, repoDir);
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("dev-lock ledger mirror — behavioral (#380, matrix row 21)", () => {
  it("returns the worktree to feat/*, lands the BUILT row on dev", () => {
    const line = JSON.stringify({
      ts: 1,
      kind: "feature",
      repo: "x/y",
      bkitVersion: "1",
      workflow: "build",
      step: "build-close-workflow",
      key: "412-export-csv",
      category: "agentic",
      description: "d",
      status: "BUILT",
    });
    const script = devLockMirrorScript("412-export-csv");
    execSync(`bash -c '${script.replace(/'/g, "'\\''")}' _ "${repoDir}" '${line}'`, {
      encoding: "utf-8",
    });

    const branch = sh("git branch --show-current", repoDir).trim();
    expect(branch).toBe("feat/412-export-csv");

    const devRoadmap = sh("git show dev:docs/roadmap.jsonl", repoDir);
    expect(devRoadmap).toContain("412-export-csv");
    expect(devRoadmap).toContain("BUILT");
  });

  it(
    "a held lock is fail-open: exit 0, close never gated, worktree unaffected",
    { timeout: 15000 },
    () => {
      const lockPath = path.join(repoDir, ".bkit", ".dev.lock");
      fs.writeFileSync(lockPath, "held-by-someone-else\n", "utf-8");

      const line = JSON.stringify({ kind: "feature", key: "412-export-csv", status: "BUILT" });
      const script = devLockMirrorScript("412-export-csv");
      const result = execSync(
        `bash -c '${script.replace(/'/g, "'\\''")}' _ "${repoDir}" '${line}' 2>&1; echo "EXIT:$?"`,
        { encoding: "utf-8" },
      );
      expect(result).toContain("EXIT:0");
      expect(result).toContain("[bkit-roadmap] dev lock busy");

      const branch = sh("git branch --show-current", repoDir).trim();
      expect(branch).toBe("feat/412-export-csv");
    },
  );
});
