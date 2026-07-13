/**
 * bkit-counter-prose-audit.test.ts — WS3-T3 (#58 / #234)
 *
 * Audits workflow files to confirm:
 *   A. No bare `*_ATTEMPT`/`MAX_*` comparisons remain in non-fenced prose
 *      (i.e., the #58 prose→shell migration is complete).
 *   B. All `MAX_*` numeric constant definitions live only in bkit-counter-bus-config.sh,
 *      not inlined as literals in workflow prose.
 *
 * "Non-fenced prose" = lines that are NOT inside a triple-backtick code block.
 * The test strips fenced blocks before grepping, so counter-bus shell blocks
 * (which ARE fenced) do not false-trip.
 *
 * The comparison patterns that must NOT appear in prose (only in fenced shell):
 *   - ATTEMPT <= MAX_   (e.g. VERIFY_ATTEMPT <= MAX_VERIFY_ATTEMPT)
 *   - ATTEMPT > MAX_    (e.g. TEST_ATTEMPT > MAX_TEST_ATTEMPT)
 *   - ATTEMPT >= MAX_   (e.g. DEBUG_ATTEMPT >= MAX_DEBUG_ATTEMPT)
 *   - ATTEMPT < MAX_    (e.g. SOAK_ATTEMPT < MAX_SOAK_ATTEMPT)
 *
 * MAX_* inline literal assignments that must NOT appear in workflow prose:
 *   - MAX_*_ATTEMPT = N  (where N is a numeric literal)
 *   These must only appear in bkit-counter-bus-config.sh.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const REPO_ROOT = path.resolve(__dirname, "../..");

/** Strip all fenced code blocks (``` ... ```) from a markdown string. */
function stripFencedBlocks(content: string): string {
  // Remove triple-backtick blocks (including language tag and indented blocks).
  // Handles ```bash, ```sh, ```comment, ``` etc.
  return content.replace(/^[ \t]*```[\w]*\n[\s\S]*?^[ \t]*```/gm, "");
}

/** Read a file relative to REPO_ROOT; return empty string if missing. */
function readWorkflow(rel: string): string {
  const p = path.join(REPO_ROOT, rel);
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf-8");
}

/**
 * Extract lines (with line numbers) from prose (fenced blocks stripped)
 * that match a given pattern.
 */
function findProseMismatches(
  filePath: string,
  content: string,
  pattern: RegExp,
): Array<{ line: number; text: string }> {
  // Strip fenced blocks first
  const prose = stripFencedBlocks(content);
  const lines = prose.split("\n");
  const hits: Array<{ line: number; text: string }> = [];
  // We need line numbers relative to original file for diagnostics.
  // Since we stripped blocks we work with the stripped version.
  lines.forEach((l, i) => {
    if (pattern.test(l)) {
      hits.push({ line: i + 1, text: l.trim() });
    }
  });
  return hits;
}

// ---------------------------------------------------------------------------
// Workflow files to audit
// ---------------------------------------------------------------------------

const WORKFLOW_FILES = [
  ".bkit/workflows/bkit-build.md",
  ".bkit/workflows/bkit-debug.md",
  ".bkit/workflows/bkit-plan.md",
  ".bkit/workflows/bkit-design.md",
  ".bkit/workflows/bkit-ship.md",
];

// ---------------------------------------------------------------------------
// Patterns that must NOT appear in non-fenced prose
// ---------------------------------------------------------------------------

/** Matches bare comparison prose: ATTEMPT <= MAX_, ATTEMPT > MAX_, etc. */
const ATTEMPT_COMPARISON_PATTERN =
  /\bATTEMPT\b.*(?:<=|>=|<|>)\s*(?:`?)MAX_|MAX_\w+\s*(?:<=|>=|<|>)\s*\d/;

/**
 * Matches inline MAX_* = N literal definition in prose (not a config file).
 * Excludes lines that are clearly headings referencing config paths.
 * Pattern: MAX_SOMETHING = <digit> or MAX_SOMETHING` = <digit>
 */
const MAX_LITERAL_DEFINITION_PATTERN = /\bMAX_\w+`?\s*=\s*\d/;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("WS3-T3: Counter prose audit — no bare *_ATTEMPT/MAX_* comparisons in workflow prose", () => {
  for (const wfFile of WORKFLOW_FILES) {
    it(`${wfFile}: no ATTEMPT vs MAX_* comparison in non-fenced prose`, () => {
      const content = readWorkflow(wfFile);
      if (!content) {
        // File not found — not a failure here, missing files are caught by other tests.
        return;
      }
      const hits = findProseMismatches(wfFile, content, ATTEMPT_COMPARISON_PATTERN);
      if (hits.length > 0) {
        const lines = hits.map((h) => `  line ~${h.line}: ${h.text.slice(0, 120)}`).join("\n");
        expect.fail(
          `[bkit-counter-prose-audit] ${wfFile} has bare *_ATTEMPT/MAX_* comparisons in prose:\n${lines}\n` +
            `→ Move these into fenced shell blocks using bkit-counter-bus.sh (WS3-T3).`,
        );
      }
      expect(hits.length).toBe(0);
    });
  }
});

describe("WS3-T3: MAX_* numeric constants — defined only in bkit-counter-bus-config.sh, not inlined in workflow prose", () => {
  for (const wfFile of WORKFLOW_FILES) {
    it(`${wfFile}: no MAX_*_ATTEMPT = N literal in non-fenced prose`, () => {
      const content = readWorkflow(wfFile);
      if (!content) return;
      const hits = findProseMismatches(wfFile, content, MAX_LITERAL_DEFINITION_PATTERN);
      if (hits.length > 0) {
        const lines = hits.map((h) => `  line ~${h.line}: ${h.text.slice(0, 120)}`).join("\n");
        expect.fail(
          `[bkit-counter-prose-audit] ${wfFile} has MAX_*_ATTEMPT = N literal in prose:\n${lines}\n` +
            `→ All MAX_* values must live in .bkit/scripts/bkit-counter-bus-config.sh only (WS3-T3).`,
        );
      }
      expect(hits.length).toBe(0);
    });
  }
});

describe("WS3-T3: bkit-counter-bus-config.sh — all MAX_* constants are defined", () => {
  const configPath = path.join(REPO_ROOT, ".bkit/scripts/bkit-counter-bus-config.sh");
  const EXPECTED_CONSTANTS = [
    "MAX_VERIFY_ATTEMPT",
    "MAX_TEST_ATTEMPT",
    "MAX_DEBUG_ATTEMPT",
    "MAX_NORMAL_ATTEMPT",
    "MAX_SOAK_ATTEMPT",
    "MAX_MERGE_ATTEMPT",
  ];

  it("bkit-counter-bus-config.sh exists", () => {
    expect(fs.existsSync(configPath)).toBe(true);
  });

  for (const constant of EXPECTED_CONSTANTS) {
    it(`bkit-counter-bus-config.sh defines ${constant}`, () => {
      const content = fs.existsSync(configPath) ? fs.readFileSync(configPath, "utf-8") : "";
      expect(content).toMatch(new RegExp(`^${constant}=\\d`, "m"));
    });
  }
});

describe("WS3-T3: bkit-counter-bus.sh — all required helper functions are defined", () => {
  const busPath = path.join(REPO_ROOT, ".bkit/scripts/bkit-counter-bus.sh");
  const EXPECTED_FUNCTIONS = [
    "counter_init",
    "counter_inc",
    "counter_get",
    "counter_reset",
    "check_max",
    "decide_next",
  ];

  it("bkit-counter-bus.sh exists", () => {
    expect(fs.existsSync(busPath)).toBe(true);
  });

  for (const fn of EXPECTED_FUNCTIONS) {
    it(`bkit-counter-bus.sh defines function ${fn}`, () => {
      const content = fs.existsSync(busPath) ? fs.readFileSync(busPath, "utf-8") : "";
      expect(content).toMatch(new RegExp(`^${fn}\\(\\)`, "m"));
    });
  }
});
