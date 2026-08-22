/**
 * bkit-generated-marker.test.ts — the marker that keeps bkit's own tracker
 * comments out of future workflow inputs, and the ordering fix that makes the
 * `<!-- bkit:ignore-earlier -->` cut mean the same thing on both trackers.
 *
 * Three invariants, each a silent-failure mode if it slips:
 *  1. Every ```comment fence — the template a workflow posts FROM — opens with
 *     `<!-- bkit:generated -->` as the first body line. A template added later
 *     without the marker looks like human input forever; the fence count is
 *     pinned so a new template cannot silently join unstamped.
 *  2. Both filters live at the point of use, not at the fetch: every step that
 *     joins a body and its comments into `ISSUE_TEXT` / `RELATED_ISSUE_TEXT`
 *     drops marker-carrying comments AND applies the `bkit:ignore-earlier` cut,
 *     and no fetch site does either. Splitting them back apart is what the 16
 *     fetch sites make expensive to keep consistent — one of them silently
 *     missing a filter is exactly the pollution the marker exists to close off.
 *  3. Every comment-fetch site normalises order with the same `sort oldest to
 *     newest` step, on both trackers. Worded as a sort rather than a per-tracker
 *     reversal it stays correct whatever order the call returned. A site missing
 *     it feeds the cut a newest-first stream, which inverts "drop everything
 *     above the last marker" into "keep the superseded revision, drop the
 *     current thinking" — and the artifact still looks plausibly trimmed, so
 *     nothing else would ever catch it.
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

const MARKER = "<!-- bkit:generated -->";
const FENCE_RE = /^[ \t]*```comment$/;
const TOTAL_EXPECTED_FENCES = 84;

const read = (rel: string) => fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");

describe("every comment template is stamped bkit:generated", () => {
  it(`carries exactly ${TOTAL_EXPECTED_FENCES} \`\`\`comment fences repo-wide`, () => {
    const total = ALL_FILES.reduce(
      (sum, rel) => sum + (read(rel).match(new RegExp(FENCE_RE, "gm")) ?? []).length,
      0,
    );
    // Pinned count: a new template that skips the fence entirely (rather than
    // shipping unstamped) would otherwise pass every other check in this file.
    expect(total).toBe(TOTAL_EXPECTED_FENCES);
  });

  for (const rel of ALL_FILES) {
    it(`${rel}: every \`\`\`comment fence opens with ${MARKER}`, () => {
      const lines = read(rel).split("\n");
      const fenceLineIdx = lines
        .map((line, i) => ({ line, i }))
        .filter(({ line }) => FENCE_RE.test(line))
        .map(({ i }) => i);
      expect(fenceLineIdx.length, `${rel} carries no comment fences`).toBeGreaterThan(0);
      for (const i of fenceLineIdx) {
        const body = (lines[i + 1] ?? "").trim();
        expect(body, `${rel}:${i + 2} fence body does not open with ${MARKER}`).toBe(MARKER);
      }
    });
  }
});

describe("both filters are applied at the point of use", () => {
  const CUT_MARKER = "<!-- bkit:ignore-earlier -->";

  // The point of use is the step that names the joined stream: `ISSUE_TEXT` for
  // the input artifact, `RELATED_ISSUE_TEXT` per hit in the related-issues
  // sweep. Counted by phrase rather than per line, because the sweep spreads its
  // steps over one bullet each while the issue path keeps them on one line.
  const occurrences = (phrase: string) =>
    WORKFLOW_FILES.reduce((sum, rel) => sum + read(rel).split(phrase).length - 1, 0);

  const EXPECTED = { ISSUE_TEXT: 5, RELATED_ISSUE_TEXT: 6 } as const;

  for (const [variable, count] of Object.entries(EXPECTED)) {
    it(`${variable}: ${count} joins, each dropping ${MARKER} and applying the cut`, () => {
      expect(occurrences(`into \`${variable}\``), "join step count").toBe(count);
      expect(
        occurrences(`drop any comments from \`${variable}\` that contain \`${MARKER}\``),
        "drop step count",
      ).toBe(count);
      expect(
        occurrences(`**If** \`${variable}\` contains marker \`${CUT_MARKER}\``),
        "cut step count",
      ).toBe(count);
    });
  }
});

describe("no comment-fetch call site filters or cuts", () => {
  // Filtering at the fetch is what this change moved away from: every call site
  // is another chance for one to drift, and the wording cannot then be shared with
  // the sweep. A filter reappearing here means the logic has split in two again.
  const CALL_SITE_RE = /method: "get_comments"|mcp__linear__list_comments/;
  const PROSE_LINE_RE = /^\s*>/;

  const callSites = (rel: string) =>
    read(rel)
      .split("\n")
      .filter((line) => CALL_SITE_RE.test(line) && !PROSE_LINE_RE.test(line));

  it("finds exactly 16 real call sites repo-wide (10 issue-comment + 6 related-issues)", () => {
    const total = WORKFLOW_FILES.reduce((sum, rel) => sum + callSites(rel).length, 0);
    expect(total).toBe(16);
  });

  for (const rel of WORKFLOW_FILES) {
    it(`${rel}: no get_comments / list_comments call site mentions ${MARKER}`, () => {
      // Guard against a sweep site that collapses its fetch and join back onto
      // one line: that line legitimately carries the marker, so exclude it here
      // rather than fail — it is covered as a point-of-use step above.
      const fetchOnly = callSites(rel).filter((line) => !line.includes("RELATED_ISSUE_TEXT"));
      for (const line of fetchOnly) {
        expect(
          line,
          `fetch site filters at the wrong layer: ${line.trim().slice(0, 80)}…`,
        ).not.toContain(MARKER);
      }
    });
  }
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

  it("states the step as a sort, never as a tracker-specific reversal", () => {
    // A reversal is only correct for the order the call happens to return today;
    // a sort is correct either way, which is what lets both trackers share it.
    for (const rel of WORKFLOW_FILES) {
      expect(read(rel), `${rel} reverts to reversal wording`).not.toContain("reverse to oldest");
    }
  });
});
