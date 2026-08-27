/**
 * bkit-roadmap-refresh-prompt.test.ts — #380 Sub-plan 2 Task 8, matrix rows
 * 12 + 13.
 *
 * Boundary: the real shipped prompt source (structural assertions on
 * frontmatter + prose — prompts are markdown consumed by an LLM runtime, not
 * directly executable, so asserting shipped content is the established
 * pattern; see bkit-roadmap-staging.integration.test.ts).
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { validate } from "./bkit-telemetry.js";

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..");
const PROMPT_PATH = path.join(REPO_ROOT, ".bkit", "prompts", "bkit-roadmap-refresh.md");
const PROMPT = fs.readFileSync(PROMPT_PATH, "utf-8");
const SHIP_MD = fs.readFileSync(
  path.join(REPO_ROOT, ".bkit", "workflows", "bkit-ship.md"),
  "utf-8",
);

function frontmatter(content: string): Record<string, unknown> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  expect(match, "prompt must open with a --- frontmatter block").toBeTruthy();
  const lines = match![1].split("\n");
  const fm: Record<string, unknown> = {};
  for (const line of lines) {
    const kv = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2];
  }
  return fm;
}

describe("row 12: @bkit-roadmap-refresh writes ONLY roadmap-analysis, no hardcoded model IDs / IDE names", () => {
  it("frontmatter names an opus model and the expected leaf shape", () => {
    const fm = frontmatter(PROMPT);
    expect(fm["name"]).toBe("bkit-roadmap-refresh");
    expect(fm["model"]).toBe("claude-opus-5");
    expect(fm["effort"]).toBe("high");
  });

  it("mandate restricts writes to the roadmap-analysis marker block only", () => {
    expect(PROMPT).toMatch(/roadmap-analysis.*marker block only/);
    expect(PROMPT).toContain("<!-- bkit:roadmap-analysis start -->");
    expect(PROMPT).toContain("<!-- bkit:roadmap-analysis end -->");
    // Must explicitly forbid touching the sibling status block / Backlog region.
    expect(PROMPT).toMatch(/roadmap-status.*block/);
    expect(PROMPT).toMatch(/Backlog \/ Ideas/);
  });

  it("treats the Backlog region and ledger rows as untrusted data, never instructions", () => {
    expect(PROMPT).toMatch(/untrusted (data|input)/i);
    expect(PROMPT).toMatch(/never execute(d)?/i);
  });

  it("contains no hardcoded model-ID literal in the BODY (frontmatter model: field excepted)", () => {
    const body = PROMPT.replace(/^---\n[\s\S]*?\n---/, "");
    // Known vendor model-ID shapes this repo has used historically — none may
    // appear as a literal in the leaf's instructions/body.
    const modelIdPatterns = [
      /claude-opus-4-\d/i,
      /claude-sonnet-4-\d/i,
      /claude-haiku-4-\d/i,
      /claude-opus-5\b/i,
      /claude-sonnet-5\b/i,
      /claude-haiku-5\b/i,
      /gpt-5(\.\d)?/i,
      /gemini-\d/i,
    ];
    for (const pattern of modelIdPatterns) {
      expect(body, `body must not hardcode a model ID matching ${pattern}`).not.toMatch(pattern);
    }
  });

  it("contains no hardcoded IDE product-name literal in the BODY", () => {
    const body = PROMPT.replace(/^---\n[\s\S]*?\n---/, "");
    const ideNamePatterns = [
      /\bVS ?Code\b/i,
      /\bCursor\b(?! IDE)/,
      /\bJetBrains\b/i,
      /\bWebstorm\b/i,
      /\bClaude Code\b/,
      /\bopencode\b/i,
    ];
    for (const pattern of ideNamePatterns) {
      expect(body, `body must not hardcode an IDE name matching ${pattern}`).not.toMatch(pattern);
    }
    expect(body).toMatch(/installed IDE/);
  });

  it("reuses the design-organise grouping seam and plan-complexity-check when-not-to-use heuristic", () => {
    expect(PROMPT).toMatch(/design-organise/);
    expect(PROMPT).toMatch(/plan-complexity-check/);
  });

  it("output format declares a Scan Coverage section with the ROADMAP_SCAN_COVERAGE stamp", () => {
    expect(PROMPT).toMatch(/## Scan Coverage/);
    expect(PROMPT).toMatch(/ROADMAP_SCAN_COVERAGE: \[scanned\]\/\[total\]/);
  });
});

/**
 * Extract the fenced shell block whose FIRST line contains `startNeedle`,
 * from the real shipped bkit-ship.md — never a hand-copied duplicate. This
 * is the pattern bkit-counter-prose-audit.test.ts already relies on for
 * jq-in-prose extraction; row 13 must validate the SHIPPED emitter, not a
 * literal constructed in the test body (a hand-written literal cannot catch
 * a regression in the emitter itself).
 */
function extractFencedBlock(source: string, startNeedle: string, fromIndex = 0): string {
  const idx = source.indexOf(startNeedle, fromIndex);
  expect(idx, `startNeedle not found in bkit-ship.md: ${startNeedle}`).toBeGreaterThanOrEqual(0);
  const fenceStart = source.lastIndexOf("```bash", idx);
  const fenceEnd = source.indexOf("```", fenceStart + 6);
  return source.slice(fenceStart + "```bash".length, fenceEnd);
}

describe("row 13: ROADMAP_SCAN_COVERAGE counter row conforms to the jsonl.md counter schema", () => {
  it("the SHIPPED bkit-ship.md emitter, executed against a real roadmap-refresh.md fixture, appends a row that validates against bkit-telemetry's codec", () => {
    // Extract (never hand-copy) the two real shell fragments from bkit-ship.md
    // Step 10 items 6 + 7: the RAW/SCANNED/TOTAL derivation, and the jq append
    // that emits the ROADMAP_SCAN_COVERAGE counter row. Executing them for
    // real against a synthetic roadmap-refresh.md fixture means a regression
    // in the shipped emitter (dropped counterSource, non-numeric counterValue,
    // wrong counterName) fails THIS test, not just a literal in the test body.
    const deriveNeedleIdx = SHIP_MD.indexOf("RAW=$(grep -oE");
    expect(deriveNeedleIdx, "RAW=$(grep -oE not found in bkit-ship.md").toBeGreaterThanOrEqual(0);
    const deriveBlock = extractFencedBlock(SHIP_MD, "RAW=$(grep -oE");
    // The item-7 STATUS=... block appears many times across bkit-ship.md's
    // steps — anchor the search to the occurrence immediately AFTER the
    // roadmap-refresh-specific derive block above (Step 10 item 7).
    const appendBlock = extractFencedBlock(
      SHIP_MD,
      'STATUS="$BOOK_ROOT/docs/plans',
      deriveNeedleIdx,
    );
    // Isolate the BKIT_VER resolution + final jq call (ROADMAP_SCAN_COVERAGE)
    // from the append block — the other three jq calls in that block need
    // STATUS-only variables we don't set up here.
    const scanCoverageJqStart = appendBlock.indexOf("BKIT_VER=$(jq -r");
    expect(
      scanCoverageJqStart,
      "ROADMAP_SCAN_COVERAGE emitter not found in item-7 block",
    ).toBeGreaterThanOrEqual(0);
    const scanCoverageJq = appendBlock.slice(scanCoverageJqStart).trim();

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-roadmap-refresh-prompt-"));
    try {
      const artifactPath = path.join(tmpDir, "roadmap-refresh.md");
      fs.writeFileSync(
        artifactPath,
        ["## Scan Coverage", "", "ROADMAP_SCAN_COVERAGE: 7/10", ""].join("\n"),
      );
      const statsPath = path.join(tmpDir, "stats.jsonl");
      fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, ".bkit", "version"),
        JSON.stringify({ pinnedVersion: "4.8.0" }),
      );

      const script = [
        "set -eu",
        `BOOK_ROOT="${tmpDir}"`,
        `STATS_JSONL="${statsPath}"`,
        `PARENT_SHA="${"a".repeat(40)}"`,
        // Substitute the workflow's {YYYYMM}/{FID} template placeholder into
        // the literal fixture path so the shipped grep line resolves it, and
        // resolve the block-local `BOOK_ROOT="{BOOK_ROOT}"` assignment the way
        // the orchestrator does — the block self-assigns it under the #440
        // locality rule, so leaving the placeholder would shadow the fixture.
        deriveBlock
          .replace("$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/roadmap-refresh.md", artifactPath)
          .replaceAll("{BOOK_ROOT}", tmpDir)
          .trim(),
        scanCoverageJq.replace('"{OWNER_REPO}"', '"cbartens/bkit"'),
      ].join("\n");

      execSync(script, { shell: "/bin/bash" });

      const lines = fs
        .readFileSync(statsPath, "utf-8")
        .split("\n")
        .filter((l) => l.trim().length > 0);
      expect(lines.length).toBe(1);
      const row = JSON.parse(lines[0]);
      expect(row.counterName).toBe("ROADMAP_SCAN_COVERAGE");
      expect(row.counterValue).toBe(70); // 7/10 * 100
      expect(row.counterSource).toBe("shell-bus");
      expect(row.step).toBe("ship-roadmap-refresh");
      expect(row.kind).toBe("counter");
      expect(row.bkitVersion).toBe("4.8.0");

      const result = validate(row);
      expect(result.ok, `expected valid, got: ${JSON.stringify(result)}`).toBe(true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
