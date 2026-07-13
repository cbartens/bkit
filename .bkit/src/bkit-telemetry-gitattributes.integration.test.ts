/**
 * Integration test — boundary: git check-attr (real resolver, not string-presence).
 *
 * Asserts:
 * 1. Each of the four bkit-repo telemetry data files resolves merge=union via git check-attr.
 * 2. docs/knowledge.jsonl and docs/decisions.jsonl resolve merge=union (consumer-inherited, WS5-T1).
 * 3. An arbitrary unlisted .bkit/foo.jsonl does NOT resolve merge=union.
 * 4. An arbitrary unlisted docs/foo.jsonl does NOT resolve merge=union.
 * 5. The four bkit-repo merge=union lines sit BELOW the `# <!-- bkit:end -->` marker in root .gitattributes
 *    (structural check via byte-offset grep — NOT inside the managed block).
 * 6. The two consumer-inherited .jsonl lines (knowledge/decisions) sit INSIDE the managed block.
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

// Resolve repo root relative to this test file (.bkit/src/ -> repo root)
const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..");

function gitCheckAttr(filePath: string): string {
  const result = execSync(`git -C "${REPO_ROOT}" check-attr merge -- "${filePath}"`, {
    encoding: "utf-8",
  }).trim();
  // Output format: "<path>: merge: <value>" or "<path>: merge: unspecified"
  const parts = result.split(": merge: ");
  return parts[1] ?? "unspecified";
}

describe("gitattributes — telemetry data files merge=union (boundary: git check-attr)", () => {
  const DATA_FILES = [
    ".bkit/stats.jsonl",
    ".bkit/friction.jsonl",
    "docs/deferrals.jsonl",
    "docs/failures.jsonl",
  ];

  for (const filePath of DATA_FILES) {
    it(`${filePath} resolves merge=union`, () => {
      const attr = gitCheckAttr(filePath);
      expect(attr, `${filePath} should have merge=union`).toBe("union");
    });
  }

  it("unlisted .bkit/foo.jsonl does NOT resolve merge=union (no blanket glob)", () => {
    const attr = gitCheckAttr(".bkit/foo.jsonl");
    expect(attr, ".bkit/foo.jsonl must NOT have merge=union (no blanket glob)").not.toBe("union");
  });

  it("unlisted docs/foo.jsonl does NOT resolve merge=union (no blanket glob)", () => {
    const attr = gitCheckAttr("docs/foo.jsonl");
    expect(attr, "docs/foo.jsonl must NOT have merge=union (no blanket glob)").not.toBe("union");
  });
});

describe("gitattributes — consumer-inherited ledger JSONL files merge=union (WS5-T1)", () => {
  const CONSUMER_JSONL_FILES = ["docs/knowledge.jsonl", "docs/decisions.jsonl"];

  for (const filePath of CONSUMER_JSONL_FILES) {
    it(`${filePath} resolves merge=union`, () => {
      const attr = gitCheckAttr(filePath);
      expect(attr, `${filePath} should have merge=union`).toBe("union");
    });
  }
});

describe("gitattributes structural check — telemetry lines below bkit:end marker", () => {
  it("four bkit-repo merge=union lines sit BELOW # <!-- bkit:end --> in root .gitattributes", () => {
    const gitattributesPath = path.join(REPO_ROOT, ".gitattributes");
    const content = fs.readFileSync(gitattributesPath, "utf-8");

    const endMarkerIdx = content.indexOf("# <!-- bkit:end -->");
    expect(endMarkerIdx, "# <!-- bkit:end --> marker must exist").toBeGreaterThan(-1);

    const DATA_LINES = [
      ".bkit/stats.jsonl",
      ".bkit/friction.jsonl",
      "docs/deferrals.jsonl",
      "docs/failures.jsonl",
    ];

    for (const filePath of DATA_LINES) {
      const lineIdx = content.indexOf(filePath);
      expect(lineIdx, `${filePath} merge=union line must exist in .gitattributes`).toBeGreaterThan(
        -1,
      );
      expect(
        lineIdx,
        `${filePath} merge=union line must be BELOW # <!-- bkit:end --> (not inside managed block)`,
      ).toBeGreaterThan(endMarkerIdx);
    }
  });

  it("docs/knowledge.jsonl + docs/decisions.jsonl merge=union lines sit INSIDE the managed block", () => {
    const gitattributesPath = path.join(REPO_ROOT, ".gitattributes");
    const content = fs.readFileSync(gitattributesPath, "utf-8");

    const startMarkerIdx = content.indexOf("# <!-- bkit:start -->");
    const endMarkerIdx = content.indexOf("# <!-- bkit:end -->");
    expect(startMarkerIdx, "# <!-- bkit:start --> marker must exist").toBeGreaterThan(-1);
    expect(endMarkerIdx, "# <!-- bkit:end --> marker must exist").toBeGreaterThan(startMarkerIdx);

    const CONSUMER_JSONL_LINES = ["docs/knowledge.jsonl", "docs/decisions.jsonl"];

    for (const filePath of CONSUMER_JSONL_LINES) {
      const lineIdx = content.indexOf(filePath);
      expect(lineIdx, `${filePath} merge=union line must exist in .gitattributes`).toBeGreaterThan(
        -1,
      );
      expect(
        lineIdx,
        `${filePath} merge=union line must be INSIDE the managed block (consumer-inherited)`,
      ).toBeGreaterThan(startMarkerIdx);
      expect(
        lineIdx,
        `${filePath} merge=union line must be INSIDE the managed block (before bkit:end)`,
      ).toBeLessThan(endMarkerIdx);
    }
  });
});
