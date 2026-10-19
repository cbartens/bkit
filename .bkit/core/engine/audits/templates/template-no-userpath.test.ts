// audits/templates/template-no-userpath.test.ts
//
// The shipped plan template + its repo copies carry no developer-machine absolute path
// (e.g. `/Users/christian/...`).
//
// Narrow: matches `/Users/<name>/...` only. The vendored `/Users/jesse/...` example
// inside `.agents/skills/using-git-worktrees/SKILL.md` (third-party skill placeholder
// prose) is out of scope.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { getPkgRoot } from "../../shared/package-roots.js";

const pkgRoot = getPkgRoot();

// The three files named by D20 as the shipped surface for this bug.
const TARGET_FILES = [
  path.join(pkgRoot, ".bkit", "core", "docs", "templates", "bkit-plan.md"),
  path.join(pkgRoot, "docs", "templates", "bkit-plan.md"),
];

// Matches an absolute macOS/Linux home-directory path for a real user,
// e.g. `/Users/christian/...` or `/home/christian/...`.
const USER_PATH_RE = /\/(?:Users|home)\/[a-zA-Z0-9_.-]+\//;

function auditTemplatePaths(): string[] {
  const names = fs
    .readdirSync(path.join(pkgRoot, ".bkit", "core", "docs", "templates"))
    .filter((name) => name.startsWith("bkit-audit-") && name.endsWith(".md"))
    .sort();
  return names.flatMap((name) => [
    path.join(pkgRoot, ".bkit", "core", "docs", "templates", name),
    path.join(pkgRoot, "docs", "templates", name),
  ]);
}

/** Every leaked host-path match in `content`. */
function leakedPaths(content: string): string[] {
  return content.match(new RegExp(USER_PATH_RE, "g")) ?? [];
}

describe("bkit-template-no-userpath — shipped plan template has no leaked host path (D20)", () => {
  it.each(TARGET_FILES)("%s exists", (filePath) => {
    expect(fs.existsSync(filePath), `Missing: ${filePath}`).toBe(true);
  });

  it.each(TARGET_FILES)("%s contains no leaked /Users|/home absolute path", (filePath) => {
    const content = fs.readFileSync(filePath, "utf-8");
    const matches = leakedPaths(content);
    expect(matches, `Leaked host path(s) in ${filePath}: ${matches.join(", ")}`).toEqual([]);
  });
});

describe("bkit-template-no-userpath — shipped audit templates have no leaked host path", () => {
  const files = auditTemplatePaths();

  it("covers the shipped audit set twice (template + dogfood)", () => {
    expect(files.length).toBeGreaterThan(0);
    expect(files.length % 2).toBe(0);
  });

  it.each(files)("%s contains no leaked /Users|/home absolute path", (filePath) => {
    expect(fs.existsSync(filePath), `Missing: ${filePath}`).toBe(true);
    const content = fs.readFileSync(filePath, "utf-8");
    const matches = leakedPaths(content);
    expect(matches, `Leaked host path(s) in ${filePath}: ${matches.join(", ")}`).toEqual([]);
  });
});
