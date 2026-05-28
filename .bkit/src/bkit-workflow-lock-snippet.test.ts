// bkit-workflow-lock-snippet.test.ts — Behavioural regression for the YYYYMM
// bucket-extraction snippet embedded in the Step 1 lock-acquisition blocks of
// the workflow files.
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

const WORKFLOWS_DIR = path.resolve(".agents/workflows");
const MONTH = "202605";
const FID = "68-digital-agent-mvp";

// Fabricate a canonical plan tree: <root>/docs/plans/<MONTH>/logs/<FID>/
let root: string;

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-lock-snippet-"));
  fs.mkdirSync(path.join(root, "docs", "plans", MONTH, "logs", FID), { recursive: true });
});

afterAll(() => {
  fs.rmSync(root, { recursive: true, force: true });
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

describe("FID-hint snippet (NF-1) stays correct", () => {
  // The interrupted-run FID hint uses a `*/` glob and `$(NF-1)`. It relies on
  // the SAME trailing-slash empty field (NF-1 = FID) and is correct as-is — this
  // locks that in so a future "fix" doesn't shift it in step with the YYYYMM line.
  const hintFiles = workflowFiles
    .map((file) => ({ file, content: fs.readFileSync(file, "utf-8") }))
    .map(({ file, content }) => {
      const m = content.match(/`(ls -d [^`]*\/logs\/\*\/[^`]*NF-1[^`]*)`/);
      return m ? { file: path.basename(file), cmd: m[1] } : null;
    })
    .filter((x): x is { file: string; cmd: string } => x !== null);

  it("at least one workflow carries the FID-hint snippet", () => {
    expect(hintFiles.length).toBeGreaterThan(0);
  });

  it.each(hintFiles)("$file: FID hint extracts the FID", ({ cmd }) => {
    const script = `cd "$REPO_ROOT"\nprintf '%s' "$(${cmd})"`;
    const out = execFileSync("bash", ["-c", script], {
      env: { ...process.env, REPO_ROOT: root },
      encoding: "utf-8",
    }).trim();
    expect(out).toBe(FID);
  });
});
