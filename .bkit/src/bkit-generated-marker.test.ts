/**
 * bkit-generated-marker.test.ts — the marker that keeps bkit's own tracker
 * comments out of future workflow inputs, and the ordering fix that makes the
 * `<!-- bkit:ignore-earlier -->` cut mean the same thing on both trackers.
 *
 * Four invariants, each a silent-failure mode if it slips:
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
 *  4. No GitHub text read goes through `mcp__github__issue_read`. That tool
 *     sanitises bodies before returning them: HTML comments are deleted outright,
 *     so BOTH markers vanish from the text the filters run on, and angle-bracket
 *     spans are eaten too. Backticks do not save a marker — the sanitiser works on
 *     the raw markdown, so a code-spanned marker comes back as empty backticks.
 *     That made invariants 1-3 assert the right words over input that could never
 *     contain them; this guard is what stops the read path silently reverting.
 *     Structured-field reads (`state`, `labels`, `milestone`) are unaffected and
 *     stay on the MCP.
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

// Markers are h6 headings, not HTML comments: mcp__github__issue_read deletes every
// HTML comment from a body, so an HTML-comment marker cannot survive a read at all.
// The legacy syntax stays READABLE so markers already written into an issue keep
// working; only the heading form is ever emitted.
const MARKER = "###### bkit:generated";
const LEGACY_MARKER = "<!-- bkit:generated -->";
const CUT_TOKEN = "bkit:ignore-earlier";
const CUT_MARKER = `###### ${CUT_TOKEN}`;
const LEGACY_CUT_MARKER = `<!-- ${CUT_TOKEN} -->`;
// A marker is a WHOLE LINE in either syntax. That is what makes an inline mention of
// the token prose rather than a live marker, and it is the whole reason a prompt or a
// step may now name the mechanism without arming it.
const CUT_MARKER_LINE_RE = new RegExp(`^[ \\t]*(${CUT_MARKER}|${LEGACY_CUT_MARKER})[ \\t]*$`);
const FENCE_RE = /^[ \t]*```comment$/;
const TOTAL_EXPECTED_FENCES = 84;

// The cut steps are the ONLY sanctioned place the cut token may appear: one per
// join into each named stream. Shared by the point-of-use check and the
// no-self-cut check so the two cannot disagree about how many are legitimate.
const CUT_STEPS = { ISSUE_TEXT: 5, RELATED_ISSUE_TEXT: 6 } as const;

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
  // The point of use is the step that names the joined stream: `ISSUE_TEXT` for
  // the input artifact, `RELATED_ISSUE_TEXT` per hit in the related-issues
  // sweep. Counted by phrase rather than per line, because the sweep spreads its
  // steps over one bullet each while the issue path keeps them on one line.
  const occurrences = (phrase: string) =>
    WORKFLOW_FILES.reduce((sum, rel) => sum + read(rel).split(phrase).length - 1, 0);

  for (const [variable, count] of Object.entries(CUT_STEPS)) {
    it(`${variable}: ${count} joins, each dropping ${MARKER} and applying the cut`, () => {
      expect(occurrences(`into \`${variable}\``), "join step count").toBe(count);
      expect(
        occurrences(
          `drop any comments from \`${variable}\` whose first line is \`${MARKER}\` or \`${LEGACY_MARKER}\``,
        ),
        "drop step count",
      ).toBe(count);
      expect(
        occurrences(
          `**If** \`${variable}\` contains whole-line marker \`${CUT_MARKER}\` or \`${LEGACY_CUT_MARKER}\``,
        ),
        "cut step count",
      ).toBe(count);
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

describe("no comment-fetch call site filters or cuts", () => {
  // Filtering at the fetch is what this change moved away from: every call site
  // is another chance for one to drift, and the wording cannot then be shared with
  // the sweep. A filter reappearing here means the logic has split in two again.
  const CALL_SITE_RE = /\/comments\?per_page=100|mcp__linear__list_comments/;
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
  const CALL_SITE_RE = /\/comments\?per_page=100|mcp__linear__list_comments/;
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

  it("reads GitHub comments raw, never through the sanitising MCP", () => {
    for (const rel of WORKFLOW_FILES) {
      expect(read(rel), `${rel} reverts to the MCP comment read`).not.toContain(
        'method: "get_comments"',
      );
    }
  });

  it("no surviving mcp__github__issue_read call extracts body text", () => {
    // The remaining MCP reads are structured-only (blocker `state`, `milestone`).
    // `({` matches an actual call; the prohibition sentence at the gh api sites
    // names the tool without invoking it, so it is not a call site.
    const CALL_RE = /mcp__github__issue_read\(\{/;
    for (const rel of WORKFLOW_FILES) {
      const calls = read(rel)
        .split("\n")
        .filter((line) => CALL_RE.test(line) && !PROSE_LINE_RE.test(line));
      for (const line of calls) {
        expect(
          line,
          `MCP read extracts sanitised text: ${line.trim().slice(0, 80)}…`,
        ).not.toContain("`body`");
      }
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
