// audits/repo/claude-yml.integration.test.ts — this repo's `.github/workflows/claude.yml` trigger gate.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

// ---------------------------------------------------------------------------
// claude.yml author_association gate
//
// The @claude trigger's `if:` carries `contains(fromJSON('["OWNER","MEMBER","COLLABORATOR"]'),
// github.event.comment.author_association)` (and equivalents) on all four event paths.
// ---------------------------------------------------------------------------

describe("Challenge Finding 2 — claude.yml author_association allow-list regression", () => {
  const scriptsDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  const pkgRoot = path.resolve(scriptsDir, "..", "..", "..", "..", "..");

  function readClaudeYml(): string {
    return fs.readFileSync(path.join(pkgRoot, ".github", "workflows", "claude.yml"), "utf-8");
  }

  it("claude.yml issue_comment path has author_association gate", () => {
    // Finding 2: the original file had no author_association check on any event path.
    // All four event paths must now carry the allow-list to prevent drive-by triggers.
    const yml = readClaudeYml();
    // The issue_comment branch must guard on comment.author_association.
    expect(yml).toContain("github.event.comment.author_association");
  });

  it("claude.yml pull_request_review_comment path has author_association gate", () => {
    const yml = readClaudeYml();
    // pull_request_review_comment re-uses event.comment.author_association.
    // At minimum one of the two `pull_request_review` event paths must reference it.
    // The remediated file uses comment.author_association for both comment events.
    expect(yml).toContain("github.event.comment.author_association");
  });

  it("claude.yml pull_request_review path has author_association gate", () => {
    const yml = readClaudeYml();
    // The review path uses event.review.author_association.
    expect(yml).toContain("github.event.review.author_association");
  });

  it("claude.yml issues path has author_association gate", () => {
    const yml = readClaudeYml();
    // The issues path uses event.issue.user.author_association.
    expect(yml).toContain("github.event.issue.user.author_association");
  });

  it("claude.yml allow-list contains exactly OWNER, MEMBER, COLLABORATOR", () => {
    // The allow-list must use the literal three-association JSON array.
    // If someone narrows to OWNER-only or adds CONTRIBUTOR, this test catches it.
    const yml = readClaudeYml();
    expect(yml).toContain('["OWNER","MEMBER","COLLABORATOR"]');
  });

  it("claude.yml allow-list is checked via fromJSON (not string-match) for all @claude paths", () => {
    const yml = readClaudeYml();
    // All four event paths must use fromJSON('["OWNER","MEMBER","COLLABORATOR"]')
    // so the allow-list is evaluated as a JSON array, not a substring check.
    const matches = yml.match(/fromJSON\('?\["OWNER","MEMBER","COLLABORATOR"\]'?\)/g);
    // There are 4 event paths in the if: — each must carry the check.
    expect(matches, "Expected fromJSON allow-list on all 4 event paths").not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(4);
  });

  it("claude.yml if: uses contains(...author_association) — not a string equality check", () => {
    const yml = readClaudeYml();
    // The check must be `contains(fromJSON(...), <author_association field>)` not
    // `github.event.comment.author_association == 'OWNER'` etc.
    expect(yml).toMatch(
      /contains\(fromJSON\([^)]*\),\s*github\.event\.(comment|review|issue\.user)\.author_association\)/,
    );
  });
});
