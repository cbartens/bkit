// audits/workflows/workflow-lock-snippet.integration.test.ts — the Resolve FID issue lookup in
// the phase workflows' Step 1 (`bkit fids find --issue`), plus the guard that every phase
// takes its lock through `bkit locks acquire`. Spawns real bash to execute the extracted
// lookup line against the repo's built dist/.
//
// The month-bucket derivation and the refusal of a feature split across two
// buckets live in `bkit locks acquire --kind=workflow`; their cases live in
// commands/workflow/locks.test.ts ("month bucket").

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getWorkflowsRoot } from "../../shared/package-roots";

const WORKFLOWS_DIR = getWorkflowsRoot();
const BKIT_BIN = path.resolve("dist/cli.js");
const MONTH = "202605";
const OTHER_MONTH = "202608";
const FID = "68-digital-agent-mvp";

const roots: string[] = [];

/** A git repo with `node_modules/.bin/bkit` linked to the built CLI and the given log dirs. */
function repoWith(logDirs: string[]): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-fid-issue-"));
  roots.push(dir);
  execFileSync("git", ["init", "-q"], { cwd: dir });
  fs.mkdirSync(path.join(dir, "node_modules/.bin"), { recursive: true });
  fs.symlinkSync(BKIT_BIN, path.join(dir, "node_modules/.bin/bkit"));
  for (const rel of logDirs) fs.mkdirSync(path.join(dir, rel), { recursive: true });
  return dir;
}

// Issue 68's feature beside a longer issue number sharing its digits (680) and a
// newer feature holding a leftover `.lock` — neither may be returned for 68.
let issueRoot: string;
// Two features logged for the same issue — the lookup must list both.
let ambiguousRoot: string;

beforeAll(() => {
  issueRoot = repoWith([
    `docs/plans/${MONTH}/logs/${FID}`,
    `docs/plans/${OTHER_MONTH}/logs/680-longer-issue`,
    `docs/plans/${OTHER_MONTH}/logs/70-some-other-feature`,
    `docs/plans/${MONTH}/logs/abc-12-linear-feature`,
  ]);
  fs.writeFileSync(
    path.join(issueRoot, `docs/plans/${OTHER_MONTH}/logs/70-some-other-feature/.lock`),
    "2026-08-01T00:00:00Z design\n",
  );
  ambiguousRoot = repoWith([
    `docs/plans/${MONTH}/logs/68-first-try`,
    `docs/plans/${MONTH}/logs/68-second-try`,
  ]);
});

afterAll(() => {
  for (const dir of roots.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

const workflowFiles = fs
  .readdirSync(WORKFLOWS_DIR)
  .filter((f) => f.endsWith(".md"))
  .map((f) => path.join(WORKFLOWS_DIR, f));

// Resolve FID, rule 3: with an issue ID, every phase reuses the feature already
// logged for THAT issue, never the newest leftover `.lock` or newest bucket.
const PHASES = ["bkit-build.md", "bkit-debug.md", "bkit-design.md", "bkit-plan.md", "bkit-ship.md"];
const issueLookups = workflowFiles
  .map((file) => ({
    file: path.basename(file),
    line: fs
      .readFileSync(file, "utf-8")
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.startsWith('"{BKIT}" fids find --issue=')),
  }))
  .filter((x): x is { file: string; line: string } => x.line !== undefined);

const HAS_ZSH = spawnSync("zsh", ["-c", "true"]).status === 0;

function runLookup(
  lookup: { line: string },
  issueId: string,
  repoRoot: string,
  shell = "bash",
): { status: number | null; json: { fid: string | null; fids: string[] } | null } {
  const script = lookup.line
    .replaceAll("{BKIT}", path.join(repoRoot, "node_modules/.bin/bkit"))
    .replaceAll("{ISSUE_ID}", issueId);
  const res = spawnSync(shell, ["-c", script], { cwd: repoRoot, encoding: "utf-8" });
  return {
    status: res.status,
    json:
      res.stdout.trim() === ""
        ? null
        : (JSON.parse(res.stdout) as { fid: string | null; fids: string[] }),
  };
}

describe("every phase takes its feature lock through bkit locks acquire", () => {
  // The command owns the month bucket and the split-bucket refusal.
  it.each(PHASES)("%s", (file) => {
    const phase = file.replace(/^bkit-|\.md$/g, "");
    const content = fs.readFileSync(path.join(WORKFLOWS_DIR, file), "utf-8");
    expect(content).toMatch(
      new RegExp(`"\\{BKIT\\}" locks acquire --kind=workflow --workflow=${phase} --fid=`),
    );
  });
});

describe("Resolve FID — issue lookup reuses only that issue's feature", () => {
  it("every phase workflow carries the lookup", () => {
    expect(issueLookups.map((l) => l.file).sort()).toEqual(PHASES);
  });

  it.each(issueLookups)("$file: names issue 68's feature, not 680's or a locked one", (lookup) => {
    expect(runLookup(lookup, "68", issueRoot)).toEqual({
      status: 0,
      json: { fid: FID, fids: [FID] },
    });
  });

  it.each(issueLookups)("$file: matches a Linear-style issue ID case-insensitively", (lookup) => {
    expect(runLookup(lookup, "ABC-12", issueRoot).json?.fid).toBe("abc-12-linear-feature");
  });

  it.each(issueLookups)("$file: lists both features when one issue has two (exit 4)", (lookup) => {
    expect(runLookup(lookup, "68", ambiguousRoot)).toEqual({
      status: 4,
      json: { fid: null, fids: ["68-first-try", "68-second-try"] },
    });
  });

  it.each(issueLookups)("$file: finds nothing for an issue with no logs (exit 1)", (lookup) => {
    expect(runLookup(lookup, "999", issueRoot)).toEqual({
      status: 1,
      json: { fid: null, fids: [] },
    });
  });

  it.each(issueLookups)("$file: finds nothing when docs/plans does not exist", (lookup) => {
    expect(runLookup(lookup, "68", repoWith([])).status).toBe(1);
  });

  it.skipIf(!HAS_ZSH).each(issueLookups)("$file: runs the same under zsh", (lookup) => {
    expect(runLookup(lookup, "68", issueRoot, "zsh").json?.fid).toBe(FID);
    expect(runLookup(lookup, "999", issueRoot, "zsh").status).toBe(1);
  });
});

describe("no workflow guesses FID from a leftover lock or the newest bucket", () => {
  it.each(workflowFiles.map((f) => ({ file: path.basename(f), f })))("$file", ({ f }) => {
    const content = fs.readFileSync(f, "utf-8");
    expect(content).not.toMatch(/`FID` hint/);
    expect(content).not.toMatch(/logs\/\*\/\.lock/);
  });
});
