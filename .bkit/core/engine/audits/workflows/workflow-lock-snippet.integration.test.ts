// audits/workflows/workflow-lock-snippet.integration.test.ts — the Resolve FID line in the
// phase workflows' Step 1 (`bkit fids resolve`), plus the guard that every phase
// takes its lock through `bkit locks acquire`. Spawns real bash to execute the extracted
// resolve line against the repo's built dist/.
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
import { parseText } from "../../shared/text";

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
    `docs/plans/${MONTH}/logs/ab1-12-jira-feature`,
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

// Resolve FID: with an issue ID and nothing named, every phase reuses the feature
// already logged for THAT issue, never the newest leftover `.lock` or newest bucket.
const PHASES = ["bkit-build.md", "bkit-debug.md", "bkit-design.md", "bkit-plan.md", "bkit-ship.md"];
const issueLookups = workflowFiles
  .map((file) => ({
    file: path.basename(file),
    line: fs
      .readFileSync(file, "utf-8")
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.startsWith('"{BKIT}" fids resolve --prompt-file=')),
  }))
  .filter((x): x is { file: string; line: string } => x.line !== undefined);

const HAS_ZSH = spawnSync("zsh", ["-c", "true"]).status === 0;

interface Resolved {
  fid: string | null;
  source: string | null;
  fids: string[];
}

function runLookup(
  lookup: { line: string },
  issueId: string,
  repoRoot: string,
  shell = "bash",
  tracker = "github",
): { status: number | null; out: Resolved | null } {
  const session = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-fid-session-"));
  roots.push(session);
  fs.writeFileSync(path.join(session, "prompt.md"), "carry on\n");
  fs.writeFileSync(
    path.join(session, "issue-facts.json"),
    JSON.stringify({ title: "Digital agent MVP" }),
  );
  const script = `${lookup.line
    .replace(/<!--[^>]*-->/g, "")
    .replaceAll("{BKIT}", path.join(repoRoot, "node_modules/.bin/bkit"))
    .replaceAll("{SESSION_DIR}", session)
    .replaceAll("{ISSUE_ID}", issueId)} --tracker=${tracker}`;
  const res = spawnSync(shell, ["-c", script], { cwd: repoRoot, encoding: "utf-8" });
  return {
    status: res.status,
    out: res.stdout.trim() === "" ? null : (parseText(res.stdout) as Resolved | null),
  };
}

describe("Resolve FID — issue lookup reuses only that issue's feature", () => {
  it("every phase workflow carries the lookup", () => {
    expect(issueLookups.map((l) => l.file).sort()).toEqual(PHASES);
  });

  it.each(issueLookups)("$file: names issue 68's feature, not 680's or a locked one", (lookup) => {
    expect(runLookup(lookup, "68", issueRoot)).toEqual({
      status: 0,
      out: expect.objectContaining({ fid: FID, source: "logged", fids: [FID] }),
    });
  });

  it.each(issueLookups)("$file: matches a Linear-style issue ID case-insensitively", (lookup) => {
    expect(runLookup(lookup, "ABC-12", issueRoot, "bash", "linear").out?.fid).toBe(
      "abc-12-linear-feature",
    );
  });

  it.each(issueLookups)("$file: matches a Jira-style issue key case-insensitively", (lookup) => {
    expect(runLookup(lookup, "AB1-12", issueRoot, "bash", "jira").out?.fid).toBe(
      "ab1-12-jira-feature",
    );
  });

  it.each(issueLookups)("$file: lists both features when one issue has two (exit 4)", (lookup) => {
    expect(runLookup(lookup, "68", ambiguousRoot)).toEqual({
      status: 4,
      out: expect.objectContaining({ fid: null, fids: ["68-first-try", "68-second-try"] }),
    });
  });

  it.each(issueLookups)("$file: mints from the title for an issue with no logs", (lookup) => {
    expect(runLookup(lookup, "999", issueRoot)).toEqual({
      status: 0,
      out: expect.objectContaining({ fid: "999-digital-agent-mvp", source: "minted", fids: [] }),
    });
  });

  it.each(issueLookups)("$file: mints when docs/plans does not exist", (lookup) => {
    expect(runLookup(lookup, "68", repoWith([])).out?.source).toBe("minted");
  });

  it.skipIf(!HAS_ZSH).each(issueLookups)("$file: runs the same under zsh", (lookup) => {
    expect(runLookup(lookup, "68", issueRoot, "zsh").out?.fid).toBe(FID);
    expect(runLookup(lookup, "999", issueRoot, "zsh").out?.source).toBe("minted");
  });
});

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

describe("no workflow guesses FID from a leftover lock or the newest bucket", () => {
  it.each(workflowFiles.map((f) => ({ file: path.basename(f), f })))("$file", ({ f }) => {
    const content = fs.readFileSync(f, "utf-8");
    expect(content).not.toMatch(/`FID` hint/);
    expect(content).not.toMatch(/logs\/\*\/\.lock/);
  });
});
