/**
 * Integration test — boundary: git check-attr (real resolver, not string-presence).
 *
 * Asserts:
 * 1. Each of the four bkit-repo telemetry data files resolves merge=union via git check-attr.
 * 2. docs/knowledge.jsonl and docs/decisions.jsonl resolve merge=union (consumer-inherited, WS5-T1).
 * 3. An arbitrary unlisted .bkit/foo.jsonl does NOT resolve merge=union.
 * 4. An arbitrary unlisted docs/foo.jsonl does NOT resolve merge=union.
 * 5. Every strictly append-only ledger's merge=union rule sits INSIDE the managed block,
 *    so consumers inherit it from `bkit install` (structural check via byte-offset grep).
 * 6. The drained ledger (.bkit/friction.jsonl) is a local opt-in BELOW the marker, never shipped.
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

// Resolve repo root relative to this test file (.bkit/core/engine/audits/templates/ -> repo root)
const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..", "..", "..", "..");

function gitCheckAttr(filePath: string): string {
  const result = execSync(`git -C "${REPO_ROOT}" check-attr merge -- "${filePath}"`, {
    encoding: "utf-8",
  }).trim();
  // Output format: "<path>: merge: <value>" or "<path>: merge: unspecified"
  const parts = result.split(": merge: ");
  return parts[1] ?? "unspecified";
}

describe("gitattributes — telemetry data files merge=union (boundary: git check-attr)", () => {
  // Resolution is what matters here regardless of which side of the marker the
  // rule lives on — friction resolves via this repo's local opt-in.
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

// .bkit/issues.jsonl is the canonical feature ledger; docs/roadmap.md is
// the generated projection. Both merge=union.
describe("gitattributes — .bkit/issues.jsonl + docs/roadmap.md (#380)", () => {
  const ROADMAP_FILES = [".bkit/issues.jsonl", "docs/roadmap.md"];

  for (const filePath of ROADMAP_FILES) {
    it(`${filePath} resolves merge=union`, () => {
      const attr = gitCheckAttr(filePath);
      expect(attr, `${filePath} should have merge=union`).toBe("union");
    });
  }

  it("root + template .gitattributes do not name docs/completed.md", () => {
    for (const p of [".gitattributes", ".bkit/shared/.gitattributes"]) {
      const content = fs.readFileSync(path.join(REPO_ROOT, p), "utf-8");
      expect(content, `${p} must not reference docs/completed.md`).not.toContain(
        "docs/completed.md",
      );
    }
  });
});

/**
 * Structural half — WHICH SIDE of `# <!-- bkit:end -->` each rule sits on, which is
 * what decides whether a consumer inherits it from `bkit install` or has to add it
 * by hand.
 *
 * Every strictly append-only ledger is shipped inside the block; only the drained
 * one stays local.
 */
describe("gitattributes structural check — append-only ledgers ship, drained one is local", () => {
  const gitattributes = (): string =>
    fs.readFileSync(path.join(REPO_ROOT, ".gitattributes"), "utf-8");

  /**
   * Byte offset of the actual `<path> merge=union` RULE, not the first mention of
   * the path — `.bkit/friction.jsonl` is also named in the managed block's comment.
   */
  const ruleIndex = (content: string, filePath: string): number => {
    const escaped = filePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return content.search(new RegExp(`^${escaped}\\s+merge=union$`, "m"));
  };

  const markers = (content: string): { start: number; end: number } => {
    const start = content.indexOf("# <!-- bkit:start -->");
    const end = content.indexOf("# <!-- bkit:end -->");
    expect(start, "# <!-- bkit:start --> marker must exist").toBeGreaterThan(-1);
    expect(end, "# <!-- bkit:end --> marker must exist").toBeGreaterThan(start);
    return { start, end };
  };

  const SHIPPED = [
    "docs/knowledge.jsonl",
    "docs/decisions.jsonl",
    "docs/deferrals.jsonl",
    "docs/failures.jsonl",
    // .bkit/issues.jsonl is the canonical feature ledger and docs/roadmap.md is
    // its generated projection.
    ".bkit/issues.jsonl",
    "docs/roadmap.md",
    ".bkit/stats.jsonl",
  ];

  for (const filePath of SHIPPED) {
    it(`${filePath} merge=union sits INSIDE the managed block (consumer-inherited)`, () => {
      const content = gitattributes();
      const { start, end } = markers(content);
      const idx = ruleIndex(content, filePath);
      expect(idx, `${filePath} merge=union rule must exist in .gitattributes`).toBeGreaterThan(-1);
      expect(idx, `${filePath} must be inside the managed block`).toBeGreaterThan(start);
      expect(idx, `${filePath} must be before bkit:end`).toBeLessThan(end);
    });
  }

  it(".bkit/friction.jsonl merge=union is a LOCAL opt-in below bkit:end, never shipped", () => {
    // The drained ledger: the shipped template carries no union rule for it; this repo
    // does.
    const content = gitattributes();
    const { end } = markers(content);
    const idx = ruleIndex(content, ".bkit/friction.jsonl");
    expect(idx, "friction merge=union rule must exist in this repo").toBeGreaterThan(-1);
    expect(idx, "friction merge=union must sit BELOW bkit:end (not shipped)").toBeGreaterThan(end);
  });
});
