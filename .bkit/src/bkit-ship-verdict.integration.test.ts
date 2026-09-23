/**
 * bkit-ship-verdict.integration.test.ts — #380 Sub-plan 1 Task 5, matrix row 10.
 *
 * Boundary: real jq + real fs (no mocks). Runs the EXACT `DOCS_VERDICT`
 * derivation shipped in `.bkit/workflows/bkit-ship.md` Step 10 against a
 * fixture `.bkit/issues.jsonl`, so a drift between this test and the shipped
 * shell can never pass silently.
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..");
const SHIP_MD = path.join(REPO_ROOT, ".bkit", "workflows", "bkit-ship.md");

/** Extract the fenced `SHIPPED_HIT=...` derivation verbatim from bkit-ship.md. */
function extractVerdictSnippet(): string {
  const content = fs.readFileSync(SHIP_MD, "utf-8");
  const idx = content.indexOf("SHIPPED_HIT=");
  expect(idx, "bkit-ship.md must define SHIPPED_HIT=...").toBeGreaterThan(-1);
  const end = content.indexOf("```", idx);
  return content.slice(idx, end);
}

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ship-verdict-test-"));
  fs.mkdirSync(path.join(tmpDir, "docs"), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function runVerdict(fid: string, jsonlContent: string): string {
  fs.writeFileSync(path.join(tmpDir, ".bkit", "issues.jsonl"), jsonlContent, "utf-8");
  const snippet = extractVerdictSnippet();
  // BOOK_ROOT resolves to a DIFFERENT directory than CWD (a bare relative
  // `.bkit/issues.jsonl` read would miss the fixture entirely) — proves the
  // shipped reader actually resolves via $BOOK_ROOT, not the working dir.
  const otherDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ship-verdict-cwd-"));
  const script = `cd "${otherDir}" && BOOK_ROOT="${tmpDir}" FID="${fid}" ${snippet.replace(/\{FID\}/g, "$FID")}\necho "$DOCS_VERDICT"`;
  try {
    return execSync(script, { shell: "/bin/bash", encoding: "utf-8" }).trim();
  } finally {
    fs.rmSync(otherDir, { recursive: true, force: true });
  }
}

describe("DOCS_VERDICT — .bkit/issues.jsonl SHIPPED-row assertion (#380, matrix row 10)", () => {
  it("PASS when a SHIPPED row exists for the FID", () => {
    const jsonl = `${JSON.stringify({
      kind: "feature",
      key: "412-export-csv",
      status: "SHIPPED",
    })}\n`;
    expect(runVerdict("412-export-csv", jsonl)).toBe("PASS");
  });

  it("FAIL when the FID is absent from .bkit/issues.jsonl", () => {
    const jsonl = `${JSON.stringify({ kind: "feature", key: "other-fid", status: "SHIPPED" })}\n`;
    expect(runVerdict("412-export-csv", jsonl)).toBe("FAIL");
  });

  it("FAIL when only a BUILT row exists for the FID (green-with-omission guard)", () => {
    const jsonl = `${JSON.stringify({
      kind: "feature",
      key: "412-export-csv",
      status: "BUILT",
    })}\n`;
    expect(runVerdict("412-export-csv", jsonl)).toBe("FAIL");
  });

  it("PASS when a later SHIPPED row follows an earlier BUILT row for the same FID", () => {
    const jsonl =
      `${JSON.stringify({ kind: "feature", key: "412-export-csv", status: "BUILT" })}\n` +
      `${JSON.stringify({ kind: "feature", key: "412-export-csv", status: "SHIPPED" })}\n`;
    expect(runVerdict("412-export-csv", jsonl)).toBe("PASS");
  });

  it("FAIL when .bkit/issues.jsonl is absent entirely (fresh/unmigrated repo)", () => {
    const snippet = extractVerdictSnippet();
    const script = `cd "${tmpDir}" && BOOK_ROOT="${tmpDir}" FID="412-export-csv" ${snippet.replace(/\{FID\}/g, "$FID")}\necho "$DOCS_VERDICT"`;
    const out = execSync(script, { shell: "/bin/bash", encoding: "utf-8" }).trim();
    expect(out).toBe("FAIL");
  });
});
