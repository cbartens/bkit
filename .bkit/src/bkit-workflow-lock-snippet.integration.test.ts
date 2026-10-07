// bkit-workflow-lock-snippet.integration.test.ts — Behavioural regression for the
// YYYYMM bucket-extraction snippet embedded in the Step 1 lock-acquisition blocks
// of the workflow files. Spawns real bash to execute the extracted snippet.
//
// Root cause (consumer friction, 2026-05-24): the snippet derives the month
// bucket from a glob with a TRAILING SLASH:
//
//   ls -d .../[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/ | awk -F/ '{print $(NF-N)}'
//
// `ls -d` preserves the glob's trailing `/`, so awk (`-F/`) emits an empty
// final field and every index shifts by one:
//
//   field:  ...  NF-3      NF-2    NF-1     NF
//   value:  ...  202605    logs    {FID}    "" (empty)
//
// The original snippet used `$(NF-2)` and silently extracted `logs`, producing
// a bogus `docs/plans/logs/logs/{FID}/` lock + logs tree. The fix is `$(NF-3)`.
//
// These tests extract the ACTUAL command from each workflow file and execute it
// against a fabricated directory tree — pinning behaviour, not just the literal
// `NF-3` string, so the off-by-one class of bug cannot regress unnoticed.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const WORKFLOWS_DIR = path.resolve(".bkit/workflows");
const MONTH = "202605";
const FID = "68-digital-agent-mvp";

// Fabricate a canonical plan tree: <root>/docs/plans/<MONTH>/logs/<FID>/
let root: string;
// A tree where the SAME FID has logs in two month buckets — the split state the
// multi-bucket guard exists to refuse rather than silently pick a side of.
let splitRoot: string;
const OTHER_MONTH = "202608";
// Issue 68's feature beside a longer issue number sharing its digits (680) and a
// newer feature holding a leftover `.lock` — neither may be returned for 68.
let issueRoot: string;
// Two features logged for the same issue — the lookup must list both.
let ambiguousRoot: string;

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-lock-snippet-"));
  fs.mkdirSync(path.join(root, "docs", "plans", MONTH, "logs", FID), { recursive: true });

  splitRoot = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-lock-split-"));
  for (const m of [MONTH, OTHER_MONTH]) {
    fs.mkdirSync(path.join(splitRoot, "docs", "plans", m, "logs", FID), { recursive: true });
  }

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
  for (const dir of [root, splitRoot, issueRoot, ambiguousRoot]) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// Run an extracted bash snippet with REPO_ROOT set and cwd at the fabricated
// root (covers both the absolute `"$REPO_ROOT"/docs/...` and the relative
// `docs/...` forms of the snippet). `{FID}` is the literal template token the
// agent substitutes at render time — we substitute the test FID here.
function runSnippet(commandLine: string): string {
  const cmd = commandLine.replaceAll("{FID}", FID);
  const script = `cd "$REPO_ROOT"\n${cmd}\nprintf '%s' "$YYYYMM"`;
  return execFileSync("bash", ["-c", script], {
    env: { ...process.env, REPO_ROOT: root },
    encoding: "utf-8",
  });
}

const workflowFiles = fs
  .readdirSync(WORKFLOWS_DIR)
  .filter((f) => f.endsWith(".md"))
  .map((f) => path.join(WORKFLOWS_DIR, f));

// Every `YYYYMM=$(ls -d ...)` assignment line, paired with its source file.
const yyyymmLines: Array<{ file: string; line: string }> = [];
for (const file of workflowFiles) {
  const content = fs.readFileSync(file, "utf-8");
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("YYYYMM=$(ls -d")) {
      yyyymmLines.push({ file: path.basename(file), line });
    }
  }
}

describe("workflow lock-snippet YYYYMM extraction", () => {
  it("at least one workflow carries the YYYYMM extraction snippet", () => {
    // Guard against the discovery regex silently matching nothing (which would
    // make every per-line test below vacuously pass).
    expect(yyyymmLines.length).toBeGreaterThan(0);
  });

  it.each(yyyymmLines)("$file: extracts the month bucket ($MONTH), not 'logs'", ({ line }) => {
    const out = runSnippet(line).trim();
    expect(out).toBe(MONTH);
    expect(out).not.toBe("logs");
  });

  it.each(yyyymmLines)("$file: uses $(NF-3), never the off-by-one $(NF-2)", ({ line }) => {
    expect(line).toContain("$(NF-3)");
    expect(line).not.toContain("$(NF-2)");
  });
});

describe("trailing-slash mechanic (characterisation — why NF-3, not NF-2)", () => {
  // Pins the root cause: against the same fabricated tree, the original NF-2
  // form returns 'logs'. If someone "simplifies" back to NF-2 thinking it is
  // equivalent, the per-file tests above fail — this documents the mechanic.
  it("NF-2 on a trailing-slash path yields 'logs' (the original bug)", () => {
    const buggy = `YYYYMM=$(ls -d "$REPO_ROOT"/docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-2)}')`;
    expect(runSnippet(buggy).trim()).toBe("logs");
  });

  it("NF-3 on a trailing-slash path yields the month bucket", () => {
    const fixed = `YYYYMM=$(ls -d "$REPO_ROOT"/docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/ 2>/dev/null | head -1 | awk -F/ '{print $(NF-3)}')`;
    expect(runSnippet(fixed).trim()).toBe(MONTH);
  });
});

// Every multi-bucket guard: the BUCKET_COUNT assignment plus the `-gt 1` bail-out
// that follows it, extracted as a pair so the test runs the guard as shipped.
const guardBlocks: Array<{ file: string; block: string }> = [];
for (const file of workflowFiles) {
  const lines = fs
    .readFileSync(file, "utf-8")
    .split("\n")
    .map((l) => l.trim());
  for (let i = 0; i < lines.length; i++) {
    if (
      lines[i].startsWith("BUCKET_COUNT=$(ls -d") &&
      lines[i + 1]?.startsWith('[ "$BUCKET_COUNT" -gt 1 ]')
    ) {
      guardBlocks.push({ file: path.basename(file), block: `${lines[i]}\n${lines[i + 1]}` });
    }
  }
}

// Exit status of a guard block against a given tree. The trailing `exit 0` is
// only reached when the guard does NOT fire — when it fires it exits first.
function runGuard(block: string, repoRoot: string): number {
  const script = `cd "$REPO_ROOT"\n${block.replaceAll("{FID}", FID)}\nexit 0`;
  try {
    execFileSync("bash", ["-c", script], {
      env: { ...process.env, REPO_ROOT: repoRoot },
      encoding: "utf-8",
      stdio: "pipe",
    });
    return 0;
  } catch (err) {
    return (err as { status?: number }).status ?? 1;
  }
}

describe("multi-bucket guard refuses a FID split across month buckets", () => {
  it("every YYYYMM extraction is preceded by a guard", () => {
    // A workflow that resolves the bucket WITHOUT the guard silently picks a
    // side of a split: oldest keeps the plan and build history but reads a
    // superseded design; newest reads the current design but makes an already
    // planned-and-built feature look brand new.
    expect(guardBlocks.length).toBe(yyyymmLines.length);
  });

  it.each(guardBlocks)("$file: passes when the FID has exactly one bucket", ({ block }) => {
    expect(runGuard(block, root)).toBe(0);
  });

  it.each(guardBlocks)("$file: exits non-zero when the FID has two buckets", ({ block }) => {
    expect(runGuard(block, splitRoot)).not.toBe(0);
  });
});

// Resolve FID, rule 3: with an issue ID, every phase reuses the feature already
// logged for THAT issue. It replaced a hint that took the newest leftover
// `.lock` or newest bucket — which latched a fresh run onto an unrelated feature.
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
