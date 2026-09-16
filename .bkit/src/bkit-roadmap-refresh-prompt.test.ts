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
const ROADMAP_MD = fs.readFileSync(
  path.join(REPO_ROOT, ".bkit", "workflows", "bkit-roadmap.md"),
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
    // Must explicitly forbid touching the sibling status block / notes.
    expect(PROMPT).toMatch(/roadmap-status.*block/);
    expect(PROMPT).toMatch(/## Notes/);
  });

  it("treats notes and ledger rows as untrusted data, never instructions", () => {
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

  // The grouping seam and the when-not-to-use heuristic must be INLINE: a leaf
  // naming a sibling prompt cannot stand alone, and the agent cannot read it.
  it("inlines the grouping seam and the when-not-to-use heuristic", () => {
    expect(PROMPT).toMatch(/domain and chronological boundaries/);
    expect(PROMPT).toMatch(/single-session → recommend doing directly/);
    expect(PROMPT, "must not reference a sibling prompt by name").not.toMatch(
      /design-organise|plan-complexity-check/,
    );
  });

  it("output format declares a Scan Coverage section with the ROADMAP_SCAN_COVERAGE stamp", () => {
    expect(PROMPT).toMatch(/## Scan Coverage/);
    expect(PROMPT).toMatch(/ROADMAP_SCAN_COVERAGE: <integer >= 0>\/<integer >= 0>/);
  });
});

/**
 * Extract the fenced shell block whose FIRST line contains `startNeedle`,
 * from the real shipped bkit-roadmap.md — never a hand-copied duplicate. This
 * is the pattern bkit-counter-prose-audit.test.ts already relies on for
 * jq-in-prose extraction; row 13 must validate the SHIPPED emitter, not a
 * literal constructed in the test body (a hand-written literal cannot catch
 * a regression in the emitter itself).
 */
function extractFencedBlock(source: string, startNeedle: string, fromIndex = 0): string {
  const idx = source.indexOf(startNeedle, fromIndex);
  expect(idx, `startNeedle not found in bkit-roadmap.md: ${startNeedle}`).toBeGreaterThanOrEqual(0);
  const fenceStart = source.lastIndexOf("```bash", idx);
  const fenceEnd = source.indexOf("```", fenceStart + 6);
  return source.slice(fenceStart + "```bash".length, fenceEnd);
}

describe("row 13: ROADMAP_SCAN_COVERAGE counter row conforms to the jsonl.md counter schema", () => {
  it("the SHIPPED /bkit-roadmap emitter, executed against a real refresh-report fixture, appends a row that validates against bkit-telemetry's codec", () => {
    // Extract (never hand-copy) the real Step 4 shell block from
    // bkit-roadmap.md: the RAW/SCANNED/TOTAL derivation AND the jq append that
    // emits the ROADMAP_SCAN_COVERAGE counter row live in one fence there.
    // Executing it for real against a synthetic refresh-report fixture means a
    // regression in the shipped emitter (dropped counterSource, non-numeric
    // counterValue, wrong counterName) fails THIS test, not just a literal in
    // the test body.
    const coverageBlock = extractFencedBlock(ROADMAP_MD, "RAW=$(grep -oE");

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-roadmap-refresh-prompt-"));
    try {
      fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
      fs.mkdirSync(path.join(tmpDir, "docs"), { recursive: true });
      // The stamp is read straight out of the analysis block the leaf wrote —
      // there is no intermediate report file, so docs/roadmap.md IS the source.
      fs.writeFileSync(
        path.join(tmpDir, "docs", "roadmap.md"),
        [
          "<!-- bkit:roadmap-analysis start -->",
          "## Scan Coverage",
          "",
          "ROADMAP_SCAN_COVERAGE: 7/10",
          "<!-- bkit:roadmap-analysis end -->",
          "",
        ].join("\n"),
      );
      const statsPath = path.join(tmpDir, ".bkit", "stats.jsonl");
      fs.writeFileSync(
        path.join(tmpDir, ".bkit", "version"),
        JSON.stringify({ pinnedVersion: "4.8.0" }),
      );
      // A real git repo with an origin remote: the block derives both
      // REPO_SLUG and PARENT_SHA from git, and an initless tmpdir would leave
      // `repo` empty rather than exercising the shipped derivation.
      const git = (cmd: string) =>
        execSync(`git -C "${tmpDir}" ${cmd}`, { stdio: "ignore", shell: "/bin/bash" });
      git("init -q");
      git("remote add origin https://github.com/cbartens/bkit.git");
      git("-c user.email=t@example.com -c user.name=t commit -q --allow-empty -m seed");

      // Resolve the block-local `REPO_ROOT="{REPO_ROOT}"` assignment the way
      // the orchestrator does — the block self-assigns it under the #440
      // locality rule, so leaving the placeholder would shadow the fixture.
      const script = ["set -eu", coverageBlock.replaceAll("{REPO_ROOT}", tmpDir).trim()].join("\n");

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
      expect(row.workflow).toBe("roadmap");
      expect(row.step).toBe("roadmap-refresh");
      expect(row.repo).toBe("cbartens/bkit");
      expect(row.kind).toBe("counter");
      expect(row.bkitVersion).toBe("4.8.0");

      const result = validate(row);
      expect(result.ok, `expected valid, got: ${JSON.stringify(result)}`).toBe(true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
