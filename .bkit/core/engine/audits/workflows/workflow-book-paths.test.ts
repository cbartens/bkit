// audits/workflows/workflow-book-paths.test.ts — static guard on workflow bookkeeping shell.
//
// The bookkeeping stage/commit blocks in .bkit/workflows/*.md go through
// `bkit ledgers commit|union` (its allow-list is covered in
// commands/workflow/ledgers.test.ts). A hand-built `BOOK_PATHS` pathspec with
// unquoted shell word-splitting, or an `ls` glob that ABORTS under zsh when it
// matches nothing (fine under bash, where an unmatched glob passes through
// literally), is a host-shell dependency. These two static shapes never appear in a
// `.bkit/workflows/*.md` file (`bkit:lint:workflows` / actionlint covers
// `.github/workflows/` only).

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { getWorkflowsRoot } from "../../shared/package-roots";

const WORKFLOWS_DIR = getWorkflowsRoot();

const workflowFiles = fs
  .readdirSync(WORKFLOWS_DIR)
  .filter((f) => f.endsWith(".md"))
  .map((f) => path.join(WORKFLOWS_DIR, f));

describe("workflow bookkeeping pathspec — no BOOK_PATHS regression (#446)", () => {
  it("at least one workflow file exists to check", () => {
    expect(workflowFiles.length).toBeGreaterThan(0);
  });

  // Unquoted `$BOOK_PATHS` fed to a `git` command (word-splits under every shell).
  const UNQUOTED_BOOK_PATHS = /^\s*(\|\|\s*)?git .*[^"]\$\{?BOOK_PATHS\}?/;

  it.each(workflowFiles)("%s: no unquoted $BOOK_PATHS passed to git", (file) => {
    const offendingLines = fs
      .readFileSync(file, "utf-8")
      .split("\n")
      .filter((line) => UNQUOTED_BOOK_PATHS.test(line));
    expect(offendingLines).toEqual([]);
  });

  // An `ls` glob feeding a `BOOK_PATHS=` assignment (`ls a/*/b/*/*.jsonl` ABORTS under
  // zsh when the glob matches nothing).
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
          n + (content.match(/"\{BKIT\}" ledgers (commit|union|only-bookkeeping)\b/g) ?? []).length,
        0,
      );
    // The bookkeeping call sites left in the markdown: the three pre-worktree
    // commits (design, plan, build) and ship's B2 stage and bookkeeping commit.
    // The land, close, flush and re-validate bookkeeping runs inside commands.
    expect(totalCalls).toBeGreaterThanOrEqual(5);
  });
});
