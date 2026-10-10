// bkit-workflow-book-paths.test.ts — static regression guard for #446.
//
// The bookkeeping stage/commit blocks in .bkit/workflows/*.md go through
// `bkit ledgers commit|union` (its allow-list is covered in
// commands/workflow/ledgers.test.ts). A hand-built `BOOK_PATHS` pathspec with
// unquoted shell word-splitting, or an `ls` glob that ABORTS under zsh when it
// matches nothing (fine under bash, where an unmatched glob passes through
// literally), is a host-shell dependency. These two static shapes must never
// appear in a `.bkit/workflows/*.md` file, since neither is caught by
// `bkit:lint:workflows` (actionlint covers `.github/workflows/` only).

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const WORKFLOWS_DIR = path.resolve(".bkit/workflows");

const workflowFiles = fs
  .readdirSync(WORKFLOWS_DIR)
  .filter((f) => f.endsWith(".md"))
  .map((f) => path.join(WORKFLOWS_DIR, f));

describe("workflow bookkeeping pathspec — no BOOK_PATHS regression (#446)", () => {
  it("at least one workflow file exists to check", () => {
    expect(workflowFiles.length).toBeGreaterThan(0);
  });

  // Acceptance criterion 1: unquoted `$BOOK_PATHS` fed to a `git` command —
  // word-splits under every shell and silently drops paths containing spaces.
  const UNQUOTED_BOOK_PATHS = /^\s*(\|\|\s*)?git .*[^"]\$\{?BOOK_PATHS\}?/;

  it.each(workflowFiles)("%s: no unquoted $BOOK_PATHS passed to git", (file) => {
    const offendingLines = fs
      .readFileSync(file, "utf-8")
      .split("\n")
      .filter((line) => UNQUOTED_BOOK_PATHS.test(line));
    expect(offendingLines).toEqual([]);
  });

  // Acceptance criterion 2: an `ls` glob feeding a `BOOK_PATHS=` assignment —
  // `ls a/*/b/*/*.jsonl` ABORTS under zsh when the glob matches nothing,
  // dropping every ledger in a fresh consumer repo rather than sweeping zero.
  const LS_GLOB_INTO_BOOK_PATHS = /BOOK_PATHS=.*\bls\b[^|]*\*/;

  it.each(workflowFiles)("%s: no ls-glob feeding a BOOK_PATHS= assignment", (file) => {
    const offendingLines = fs
      .readFileSync(file, "utf-8")
      .split("\n")
      .filter((line) => LS_GLOB_INTO_BOOK_PATHS.test(line));
    expect(offendingLines).toEqual([]);
  });

  it.each(workflowFiles)("%s: no BOOK_PATHS variable assignment remains", (file) => {
    const offendingLines = fs
      .readFileSync(file, "utf-8")
      .split("\n")
      .filter((line) => /\bBOOK_PATHS=/.test(line));
    expect(offendingLines).toEqual([]);
  });

  it("bookkeeping commits are wired through bkit ledgers", () => {
    const totalCalls = workflowFiles
      .map((file) => fs.readFileSync(file, "utf-8"))
      .reduce(
        (n, content) =>
          n + (content.match(/"\$BKIT" ledgers (commit|union|only-bookkeeping)\b/g) ?? []).length,
        0,
      );
    // The #446 call sites across bkit-ship.md, bkit-design.md, bkit-plan.md
    // and bkit-build.md (stage / commit shapes plus ship's ledger union).
    expect(totalCalls).toBeGreaterThanOrEqual(8);
  });
});
