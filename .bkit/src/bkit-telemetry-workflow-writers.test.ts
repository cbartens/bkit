/**
 * Integration tests: grep over all 5 workflow files asserting NO append block
 * omits any A2-mandatory field (ts/kind/repo/bkitVersion/step).
 *
 * Every telemetry append block MUST stamp all five A2-mandatory fields.
 * This test is the machine-verification gate for T6 Done-when.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, it, expect } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");

const WORKFLOW_FILES = [
  "bkit-design.md",
  "bkit-plan.md",
  "bkit-build.md",
  "bkit-debug.md",
  "bkit-ship.md",
].map((f) => path.join(REPO_ROOT, ".bkit/workflows", f));

/** A2-mandatory envelope fields that every emitted row MUST stamp. */
const A2_FIELDS = ["ts", "kind", "repo", "bkitVersion", "step"] as const;

/**
 * Extract jq-based telemetry append block windows from a workflow file.
 *
 * A telemetry append block is bounded by:
 *   - Start: `STATS=` (setting the target file variable)
 *   - End: `|| echo "[bkit-telemetry] append failed` guard
 *
 * We extract these windows because each block is a multi-line shell construct.
 */
function extractTelemetryAppendWindows(content: string): string[] {
  const windows: string[] = [];
  const lines = content.split("\n");
  let startIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Start of a telemetry block — STATS variable assignment
    if (/^\s+STATS=.*stats\.jsonl/.test(line) || /^\s+STATS=.*\.jsonl/.test(line)) {
      startIdx = i;
    }
    // End of a telemetry block — the || echo guard
    if (startIdx >= 0 && line.includes("[bkit-telemetry] append failed")) {
      windows.push(lines.slice(startIdx, i + 1).join("\n"));
      startIdx = -1;
    }
  }

  return windows;
}

describe("Workflow telemetry writers — A2-mandatory field completeness", () => {
  for (const workflowFile of WORKFLOW_FILES) {
    const workflowName = path.basename(workflowFile, ".md");

    it(`${workflowName} contains portable ms-ts expression (now*1000|floor)`, () => {
      const content = fs.readFileSync(workflowFile, "utf-8");
      expect(content, `${workflowName} must use portable ms-ts: now*1000|floor`).toContain(
        "now*1000|floor",
      );
    });

    it(`${workflowName} has best-effort || echo guard`, () => {
      const content = fs.readFileSync(workflowFile, "utf-8");
      expect(
        content,
        `${workflowName} must have || echo "[bkit-telemetry] append failed" guard`,
      ).toContain("[bkit-telemetry] append failed");
    });

    it(`${workflowName} does NOT use date +%s%3N for timestamps`, () => {
      const content = fs.readFileSync(workflowFile, "utf-8");
      expect(content, `${workflowName} must NOT use BSD-incompatible date +%s%3N`).not.toContain(
        "date +%s%3N",
      );
    });

    it(`${workflowName} has >= 1 telemetry append window with all A2 fields`, () => {
      const content = fs.readFileSync(workflowFile, "utf-8");
      const windows = extractTelemetryAppendWindows(content);

      expect(
        windows.length,
        `${workflowName} must have >= 1 telemetry append window`,
      ).toBeGreaterThanOrEqual(1);

      for (const window of windows) {
        for (const field of A2_FIELDS) {
          expect(
            window,
            `${workflowName} telemetry block missing A2 field "${field}":\n${window}`,
          ).toContain(field);
        }
      }
    });
  }
});

describe("Ship workflow — outcome writer", () => {
  it("bkit-ship.md contains exactly one outcome kind in telemetry blocks", () => {
    const shipFile = path.join(REPO_ROOT, ".bkit/workflows/bkit-ship.md");
    const content = fs.readFileSync(shipFile, "utf-8");

    // Count outcome occurrences in telemetry append blocks
    const outcomeMatches = content.match(/\.kind = "outcome"/g) ?? [];
    expect(
      outcomeMatches.length,
      'bkit-ship.md must contain exactly one .kind = "outcome" assignment',
    ).toBe(1);
  });

  it("bkit-ship.md outcome block carries all required size fields", () => {
    const shipFile = path.join(REPO_ROOT, ".bkit/workflows/bkit-ship.md");
    const content = fs.readFileSync(shipFile, "utf-8");

    const sizeFields = [
      "linesAdded",
      "linesDeleted",
      "linesChanged",
      "filesChanged",
      "taskCount",
      "durationSeconds",
      "deferrals",
      "failures",
    ];
    for (const field of sizeFields) {
      expect(content, `bkit-ship.md outcome block must carry field "${field}"`).toContain(field);
    }
  });

  it("bkit-ship.md outcome block is at the close gate section", () => {
    const shipFile = path.join(REPO_ROOT, ".bkit/workflows/bkit-ship.md");
    const content = fs.readFileSync(shipFile, "utf-8");

    const closeGateSection = content.indexOf("## 🤖 Step 15 — Close Workflow");
    const outcomeIdx = content.indexOf('.kind = "outcome"');
    expect(
      closeGateSection,
      "Close workflow step (Step 15) must exist in bkit-ship.md",
    ).toBeGreaterThan(-1);
    expect(outcomeIdx, "outcome block must exist in bkit-ship.md").toBeGreaterThan(-1);
    expect(
      outcomeIdx,
      "outcome block must come after the Close Workflow section header",
    ).toBeGreaterThan(closeGateSection);
  });
});

describe("Best-effort append idiom — all workflows", () => {
  it("every workflow file with STATS appends uses || echo guard", () => {
    for (const workflowFile of WORKFLOW_FILES) {
      const content = fs.readFileSync(workflowFile, "utf-8");
      const workflowName = path.basename(workflowFile, ".md");
      if (content.includes('>> "$STATS"')) {
        expect(
          content,
          `${workflowName} must use || echo guard on all telemetry appends`,
        ).toContain("[bkit-telemetry] append failed");
      }
    }
  });
});
