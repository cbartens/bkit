// bkit-rules-sync.test.ts — WS7-T1 — block-scoped managed-block byte-equality gate.
//
// Asserts that the `bkit:start`→`bkit:end` managed block in bkit's own
// `.agents/rules.md` byte-equals the same block in the canonical template at
// `.bkit/templates/.agents/rules.md`.
//
// D3 constraint: compare the MANAGED BLOCK ONLY (between `<!-- bkit:start -->`
// and `<!-- bkit:end -->` inclusive). The `### bkit Repo Authoring` section
// that follows the closing marker in `.agents/rules.md` is bkit-repo-only —
// it never ships to consumers, and is NEVER compared by this test.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { getPkgRoot } from "./bkit-paths.js";

// ---------------------------------------------------------------------------
// extractManagedBlock — extract `<!-- bkit:start -->` … `<!-- bkit:end -->`
// (inclusive) from a file's content. Throws if either marker is absent.
// ---------------------------------------------------------------------------
function extractManagedBlock(filePath: string, content: string): string {
  const startMarker = "<!-- bkit:start -->";
  const endMarker = "<!-- bkit:end -->";
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);
  if (startIdx === -1) {
    throw new Error(`[bkit-rules-sync] Missing "${startMarker}" in ${filePath}`);
  }
  if (endIdx === -1) {
    throw new Error(`[bkit-rules-sync] Missing "${endMarker}" in ${filePath}`);
  }
  if (endIdx < startIdx) {
    throw new Error(
      `[bkit-rules-sync] "${endMarker}" appears before "${startMarker}" in ${filePath}`,
    );
  }
  // Include the end marker itself (endIdx + endMarker.length)
  return content.slice(startIdx, endIdx + endMarker.length);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("bkit-rules-sync — managed block byte-equality gate (WS7-T1, D3)", () => {
  const pkgRoot = getPkgRoot();
  const agentsRulesPath = path.join(pkgRoot, ".agents", "rules.md");
  const templateRulesPath = path.join(pkgRoot, ".bkit", "templates", ".agents", "rules.md");

  it("both .agents/rules.md and .bkit/templates/.agents/rules.md exist", () => {
    expect(fs.existsSync(agentsRulesPath), `Missing: ${agentsRulesPath}`).toBe(true);
    expect(fs.existsSync(templateRulesPath), `Missing: ${templateRulesPath}`).toBe(true);
  });

  it("managed bkit:start→bkit:end block is byte-identical between .agents/rules.md and the template", () => {
    const agentsContent = fs.readFileSync(agentsRulesPath, "utf-8");
    const templateContent = fs.readFileSync(templateRulesPath, "utf-8");

    const agentsBlock = extractManagedBlock(agentsRulesPath, agentsContent);
    const templateBlock = extractManagedBlock(templateRulesPath, templateContent);

    expect(agentsBlock).toBe(templateBlock);
  });

  it("### bkit Repo Authoring section is present ONLY in .agents/rules.md, not in the template (D3 exclusion)", () => {
    const agentsContent = fs.readFileSync(agentsRulesPath, "utf-8");
    const templateContent = fs.readFileSync(templateRulesPath, "utf-8");

    // The section must exist in the bkit-repo file (outside bkit:end)
    expect(
      agentsContent.includes("### bkit Repo Authoring"),
      ".agents/rules.md should contain the ### bkit Repo Authoring section",
    ).toBe(true);

    // The section must NOT exist in the template (it is bkit-repo-only)
    expect(
      templateContent.includes("### bkit Repo Authoring"),
      ".bkit/templates/.agents/rules.md must NOT contain the bkit-repo-only ### bkit Repo Authoring section",
    ).toBe(false);
  });
});
