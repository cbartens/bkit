// bkit-rules-sync.test.ts — WS7-T1 — block-scoped managed-block byte-equality gate.
//
// The canonical agent rules + workflow router live in the root `AGENTS.md`
// managed block. This gate asserts that block byte-equals the same block in the
// shipped template at `.bkit/templates/AGENTS.md`, so a hand edit to one without
// the other cannot ship.
//
// D3 constraint: compare the MANAGED BLOCK ONLY (between `<!-- bkit:start -->`
// and `<!-- bkit:end -->` inclusive). The `### bkit Repo Authoring` section that
// follows the closing marker in the root `AGENTS.md` is bkit-repo-only — it never
// ships to consumers, and is NEVER compared by this test.

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
  const agentsPath = path.join(pkgRoot, "AGENTS.md");
  const templateAgentsPath = path.join(pkgRoot, ".bkit", "templates", "AGENTS.md");

  it("both AGENTS.md and .bkit/templates/AGENTS.md exist", () => {
    expect(fs.existsSync(agentsPath), `Missing: ${agentsPath}`).toBe(true);
    expect(fs.existsSync(templateAgentsPath), `Missing: ${templateAgentsPath}`).toBe(true);
  });

  it("managed bkit:start→bkit:end block is byte-identical between AGENTS.md and the template", () => {
    const agentsContent = fs.readFileSync(agentsPath, "utf-8");
    const templateContent = fs.readFileSync(templateAgentsPath, "utf-8");

    const agentsBlock = extractManagedBlock(agentsPath, agentsContent);
    const templateBlock = extractManagedBlock(templateAgentsPath, templateContent);

    expect(agentsBlock).toBe(templateBlock);
  });

  it("### bkit Repo Authoring section is present ONLY in AGENTS.md, not in the template (D3 exclusion)", () => {
    const agentsContent = fs.readFileSync(agentsPath, "utf-8");
    const templateContent = fs.readFileSync(templateAgentsPath, "utf-8");

    // The section must exist in the bkit-repo file (outside bkit:end)
    expect(
      agentsContent.includes("### bkit Repo Authoring"),
      "AGENTS.md should contain the ### bkit Repo Authoring section",
    ).toBe(true);

    // The section must NOT exist in the template (it is bkit-repo-only)
    expect(
      templateContent.includes("### bkit Repo Authoring"),
      ".bkit/templates/AGENTS.md must NOT contain the bkit-repo-only ### bkit Repo Authoring section",
    ).toBe(false);
  });
});
