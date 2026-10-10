// bkit-workflow-lock-snippet.integration.test.ts — Behavioural regression for
// the Resolve FID issue lookup in the phase workflows' Step 1, plus the guard
// that every phase takes its lock through `bkit locks acquire`. Spawns real
// bash to execute the extracted lookup.
//
// The month-bucket derivation and the refusal of a feature split across two
// buckets live in `bkit locks acquire --kind=workflow`; their cases live in
// commands/workflow/locks.test.ts ("month bucket").

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const WORKFLOWS_DIR = path.resolve(".bkit/workflows");
const MONTH = "202605";
const OTHER_MONTH = "202608";
const FID = "68-digital-agent-mvp";

// Issue 68's feature beside a longer issue number sharing its digits (680) and a
// newer feature holding a leftover `.lock` — neither may be returned for 68.
let issueRoot: string;
// Two features logged for the same issue — the lookup must list both.
let ambiguousRoot: string;

beforeAll(() => {
  issueRoot = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-fid-issue-"));
  fs.mkdirSync(path.join(issueRoot, "docs", "plans", MONTH, "logs", FID), { recursive: true });
  fs.mkdirSync(path.join(issueRoot, "docs", "plans", OTHER_MONTH, "logs", "680-longer-issue"), {
    recursive: true,
  });
  const lockedDir = path.join(
    issueRoot,
    "docs",
    "plans",
    OTHER_MONTH,
    "logs",
    "70-some-other-feature",
  );
  fs.mkdirSync(lockedDir, { recursive: true });
  fs.writeFileSync(path.join(lockedDir, ".lock"), "2026-08-01T00:00:00Z design\n");

  ambiguousRoot = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-fid-ambiguous-"));
  for (const fid of ["68-first-try", "68-second-try"]) {
    fs.mkdirSync(path.join(ambiguousRoot, "docs", "plans", MONTH, "logs", fid), {
      recursive: true,
    });
  }
});

afterAll(() => {
  for (const dir of [issueRoot, ambiguousRoot]) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

const workflowFiles = fs
  .readdirSync(WORKFLOWS_DIR)
  .filter((f) => f.endsWith(".md"))
  .map((f) => path.join(WORKFLOWS_DIR, f));

// Resolve FID, rule 3: with an issue ID, every phase reuses the feature already
// logged for THAT issue. Taking the newest leftover `.lock` or newest bucket
// would latch a fresh run onto an unrelated feature.
const PHASES = ["bkit-build.md", "bkit-debug.md", "bkit-design.md", "bkit-plan.md", "bkit-ship.md"];
const issueLookups = workflowFiles
  .map((file) => ({ file: path.basename(file), lines: fs.readFileSync(file, "utf-8").split("\n") }))
  .map(({ file, lines }) => {
    const key = lines.map((l) => l.trim()).find((l) => l.startsWith("ISSUE_KEY=$("));
    const ls = lines
      .map((l) => l.trim())
      .find((l) => l.startsWith("ls -d") && l.includes('"$ISSUE_KEY"-*/'));
    return key && ls ? { file, key, ls } : null;
  })
  .filter((x): x is { file: string; key: string; ls: string } => x !== null);

function runLookup(lookup: { key: string; ls: string }, issueId: string, repoRoot: string): string {
  const script = `${lookup.key.replaceAll("{ISSUE_ID}", issueId)}\n${lookup.ls}`;
  return execFileSync("bash", ["-c", script], {
    env: { ...process.env, REPO_ROOT: repoRoot },
    encoding: "utf-8",
  }).trim();
}

describe("every phase takes its feature lock through bkit locks acquire", () => {
  // The command owns the month bucket and the split-bucket refusal; a phase
  // that stopped calling it would be back to deriving the bucket by hand.
  it.each(PHASES)("%s", (file) => {
    const phase = file.replace(/^bkit-|\.md$/g, "");
    const content = fs.readFileSync(path.join(WORKFLOWS_DIR, file), "utf-8");
    expect(content).toMatch(
      new RegExp(`"\\$BKIT" locks acquire --kind=workflow --workflow=${phase} --fid=`),
    );
  });
});

describe("Resolve FID — issue lookup reuses only that issue's feature", () => {
  it("every phase workflow carries the lookup", () => {
    expect(issueLookups.map((l) => l.file).sort()).toEqual(PHASES);
  });

  it.each(issueLookups)("$file: names issue 68's feature, not 680's or a locked one", (lookup) => {
    expect(runLookup(lookup, "68", issueRoot)).toBe(FID);
  });

  it.each(issueLookups)("$file: lowercases a Linear-style issue ID", (lookup) => {
    const script = `${lookup.key.replaceAll("{ISSUE_ID}", "ABC-12")}\nprintf '%s' "$ISSUE_KEY"`;
    expect(execFileSync("bash", ["-c", script], { encoding: "utf-8" })).toBe("abc-12");
  });

  it.each(issueLookups)("$file: lists both features when one issue has two", (lookup) => {
    expect(runLookup(lookup, "68", ambiguousRoot).split("\n")).toEqual([
      "68-first-try",
      "68-second-try",
    ]);
  });

  it.each(issueLookups)("$file: prints nothing for an issue with no logs", (lookup) => {
    expect(runLookup(lookup, "999", issueRoot)).toBe("");
  });
});

describe("no workflow guesses FID from a leftover lock or the newest bucket", () => {
  it.each(workflowFiles.map((f) => ({ file: path.basename(f), f })))("$file", ({ f }) => {
    const content = fs.readFileSync(f, "utf-8");
    expect(content).not.toMatch(/`FID` hint/);
    expect(content).not.toMatch(/logs\/\*\/\.lock/);
  });
});
