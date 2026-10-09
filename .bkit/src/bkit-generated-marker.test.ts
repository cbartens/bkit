/**
 * bkit-generated-marker.test.ts — the marker that keeps bkit's own tracker
 * comments out of future workflow inputs, and the ordering fix that makes the
 * `###### bkit:ignore-earlier` cut mean the same thing on both trackers.
 *
 * Stamping and filtering both live in `bkit issues` now: every comment body comes
 * from `bkit issues comment` / `bkit workstreams comment`, which open it with
 * `###### bkit:generated` (pinned in commands/workflow/issues.test.ts and
 * workstreams.test.ts), and `bkit issues text` drops marker-carrying comments and
 * applies the cut (pinned in issues.test.ts). What stays here is the wiring that
 * keeps those commands the ONLY place either happens — each a silent-failure mode
 * if it slips:
 *  1. No workflow hand-writes a ```comment template. A hand-written body that
 *     misses the marker looks like human input forever.
 *  2. Every join into `ISSUE_TEXT` / `RELATED_ISSUE_TEXT` goes through
 *     `bkit issues text`, and no workflow names the marker or the cut token at
 *     all — a filter or cut reappearing in prose means the logic has split in two
 *     again, and one copy silently drifting is exactly the pollution the marker
 *     exists to close off.
 *  3. Nothing bkit ships carries a whole-line cut marker, which would arm the next
 *     run's cut on bkit's own output.
 *  4. Every comment-fetch site normalises order with the same `sort oldest to
 *     newest` step, on both trackers. `bkit issues text` re-sorts by timestamp only
 *     when every comment carries one; for any other input the order it is handed
 *     is the order the cut sees, and a newest-first stream inverts "drop
 *     everything above the last marker" into "keep the superseded revision".
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");

const WORKFLOW_FILES = [
  ".bkit/workflows/bkit-auto.md",
  ".bkit/workflows/bkit-build.md",
  ".bkit/workflows/bkit-debug.md",
  ".bkit/workflows/bkit-design.md",
  ".bkit/workflows/bkit-plan.md",
  ".bkit/workflows/bkit-ship.md",
] as const;

const SPEC_FILE = ".bkit/workflows.md";
const ALL_FILES = [...WORKFLOW_FILES, SPEC_FILE] as const;

// Both markers are h6 headings. Detection is the heading form only.
const MARKER = "###### bkit:generated";
const CUT_TOKEN = "bkit:ignore-earlier";
const CUT_MARKER = `###### ${CUT_TOKEN}`;
// A cut marker is a WHOLE LINE of the heading form. That is what makes an inline
// mention of the token prose rather than a live marker, and it is the whole reason
// a prompt or a step may name the mechanism without arming it.
const CUT_MARKER_LINE_RE = new RegExp(`^[ \\t]*${CUT_MARKER}[ \\t]*$`);
const read = (rel: string) => fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");

describe("comment bodies come from bkit commands, never a hand-written template", () => {
  for (const rel of WORKFLOW_FILES) {
    it(`${rel}: carries no \`\`\`comment template`, () => {
      const fences = read(rel).match(/^[ \t]*```comment$/gm) ?? [];
      expect(
        fences,
        `${rel} hand-writes a comment body; build it with bkit issues comment`,
      ).toEqual([]);
    });
  }
});

describe("issue text is joined, filtered and cut only by bkit issues text", () => {
  const ISSUE_JOIN = 'issues text --description-file="{OUTBOX}/issue-description.md"';
  const RELATED_JOIN = 'issues text --description-file="{OUTBOX}/related-description.md"';
  const PHASES = WORKFLOW_FILES.filter((rel) => !rel.endsWith("bkit-auto.md"));
  const SWEEPS = [
    ".bkit/workflows/bkit-debug.md",
    ".bkit/workflows/bkit-design.md",
    ".bkit/workflows/bkit-plan.md",
  ];

  for (const rel of PHASES) {
    it(`${rel}: ISSUE_TEXT is the text bkit issues text prints`, () => {
      const content = read(rel);
      expect(content.split(ISSUE_JOIN).length - 1, "issue-text join").toBe(1);
      // The join's output is what the input artifact carries.
      expect(content).toMatch(/`text` (as|→) `\{?ISSUE_TEXT\}?`|`ISSUE_TEXT` = `text` printed by/);
    });
  }

  for (const rel of SWEEPS) {
    it(`${rel}: each related-issues hit is joined by bkit issues text`, () => {
      const content = read(rel);
      expect(content.split(RELATED_JOIN).length - 1).toBeGreaterThanOrEqual(1);
      expect(content).toContain("RELATED_ISSUE_TEXT");
    });
  }

  for (const rel of WORKFLOW_FILES) {
    it(`${rel}: names neither ${MARKER} nor ${CUT_TOKEN} — filtering is the command's job`, () => {
      const content = read(rel);
      expect(content).not.toContain(MARKER);
      expect(content).not.toContain(CUT_TOKEN);
    });
  }
});

describe("nothing bkit ships can carry a live cut marker", () => {
  // A whole-line cut marker in anything bkit writes lands in a posted comment or an
  // edited issue body, and the NEXT run's cut fires on bkit's own output and deletes
  // the human context above it. The bkit:generated filter is no backstop — it drops
  // comments only, never an issue body, and never a sweep hit inside RELATED_ISSUES.
  //
  // Naming the token INLINE is allowed, and that is the point of whole-line detection:
  // a step, a spec paragraph or a subagent prompt can describe the mechanism without
  // arming it. Emitting the marker on its own line is what stays prohibited.
  const PROMPT_DIR = ".bkit/prompts";
  const PROMPT_FILES = fs
    .readdirSync(path.join(REPO_ROOT, PROMPT_DIR))
    .filter((name) => name.endsWith(".md"))
    .map((name) => `${PROMPT_DIR}/${name}`);

  const markerLines = (rel: string) =>
    read(rel)
      .split("\n")
      .map((line, n) => ({ line, n: n + 1 }))
      .filter(({ line }) => CUT_MARKER_LINE_RE.test(line))
      .map(({ line, n }) => `${rel}:${n}: ${line.trim()}`);

  it(`no shipped workflow, spec or prompt emits a ${CUT_TOKEN} marker line`, () => {
    expect(PROMPT_FILES.length, `${PROMPT_DIR} is empty`).toBeGreaterThan(0);
    const offenders = [...ALL_FILES, ...PROMPT_FILES].flatMap(markerLines);
    expect(offenders, "a shipped cut marker arms the next run's cut").toEqual([]);
  });
});

describe("every comment-fetch site normalises order the same way", () => {
  const SORT_STEP = "sort oldest to newest";
  const CALL_SITE_RE = /method: "get_comments"|mcp__linear__list_comments/;
  const PROSE_LINE_RE = /^\s*>/;

  const callSites = (rel: string) =>
    read(rel)
      .split("\n")
      .filter((line) => CALL_SITE_RE.test(line) && !PROSE_LINE_RE.test(line));

  it(`carries the ${SORT_STEP} step at all 16 call sites, on both trackers`, () => {
    const total = WORKFLOW_FILES.reduce(
      (sum, rel) => sum + callSites(rel).filter((line) => line.includes(SORT_STEP)).length,
      0,
    );
    expect(total).toBe(16);
  });

  for (const rel of WORKFLOW_FILES) {
    it(`${rel}: every comment-fetch site carries the ${SORT_STEP} step`, () => {
      for (const line of callSites(rel)) {
        expect(line, `no sort step on: ${line.trim().slice(0, 80)}…`).toContain(SORT_STEP);
      }
    });
  }

  it("does not fetch GitHub comments via gh api", () => {
    for (const rel of WORKFLOW_FILES) {
      expect(read(rel), `${rel} reverts to a gh api comment read`).not.toContain(
        "/comments?per_page=100",
      );
    }
  });

  it("states the step as a sort, never as a tracker-specific reversal", () => {
    // A reversal is only correct for the order the call happens to return today;
    // a sort is correct either way, which is what lets both trackers share it.
    for (const rel of WORKFLOW_FILES) {
      expect(read(rel), `${rel} reverts to reversal wording`).not.toContain("reverse to oldest");
    }
  });
});
