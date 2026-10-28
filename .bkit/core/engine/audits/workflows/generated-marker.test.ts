/**
 * audits/workflows/generated-marker.test.ts — the marker that keeps bkit's own tracker
 * comments out of future workflow inputs, and the ordering fix that makes the
 * `###### bkit:ignore-earlier` cut mean the same thing on both trackers.
 *
 * Stamping and filtering both live in the engine: every comment body comes from
 * `bkit issues comment` / `bkit workstreams comment`, which open it with
 * `###### bkit:generated` (pinned in commands/workflow/issues.test.ts and
 * workstreams.test.ts), and the issue text joined by `bkit workflows input` and
 * `bkit issues related` drops marker-carrying comments and applies the cut (pinned in
 * issues.test.ts and workflows.test.ts). What stays here is the wiring that keeps
 * those commands the ONLY place either happens:
 *  1. No workflow hand-writes a ```comment template.
 *  2. Every phase joins its issue text through `bkit workflows input`, every sweep its
 *     related issues through `bkit issues related`, and no workflow names the marker or
 *     the cut token at all.
 *  3. Nothing bkit ships carries a whole-line cut marker, which would arm the next
 *     run's cut on bkit's own output.
 *  4. Comments are read by the engine; a workflow never calls a tracker's comment
 *     read itself, and every MCP fallback that writes the comments file writes them
 *     oldest first. The join re-sorts by timestamp only when every comment carries
 *     one; for any other input the order it is handed is the order the cut sees.
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");

const WORKFLOW_FILES = [
  ".bkit/core/workflows/bkit-auto.md",
  ".bkit/core/workflows/bkit-build.md",
  ".bkit/core/workflows/bkit-debug.md",
  ".bkit/core/workflows/bkit-design.md",
  ".bkit/core/workflows/bkit-plan.md",
  ".bkit/core/workflows/bkit-ship.md",
] as const;

const SPEC_FILE = ".bkit/core/.bkit/workflows.md";
const ALL_FILES = [...WORKFLOW_FILES, SPEC_FILE] as const;

// Both markers are h6 headings. Detection is the heading form only.
const MARKER = "###### bkit:generated";
const CUT_TOKEN = "bkit:ignore-earlier";
const CUT_MARKER = `###### ${CUT_TOKEN}`;
// A cut marker is a WHOLE LINE of the heading form; an inline mention of the token is
// prose, not a live marker.
const CUT_MARKER_LINE_RE = new RegExp(`^[ \\t]*${CUT_MARKER}[ \\t]*$`);
const read = (rel: string) => fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");

/** Every ```comment fence line in `text`. */
function commentTemplateFences(text: string): string[] {
  return text.match(/^[ \t]*```comment$/gm) ?? [];
}

describe("comment bodies come from bkit commands, never a hand-written template", () => {
  for (const rel of WORKFLOW_FILES) {
    it(`${rel}: carries no \`\`\`comment template`, () => {
      const fences = commentTemplateFences(read(rel));
      expect(
        fences,
        `${rel} hand-writes a comment body; build it with bkit issues comment`,
      ).toEqual([]);
    });
  }
});

describe("issue text is joined, filtered and cut only by the engine", () => {
  const ISSUE_JOIN =
    '--description-file="{SESSION_DIR}/issue-description.md" --comments-file="{SESSION_DIR}/issue-comments.json"';
  const RELATED_JOIN = '"{BKIT}" issues related --hits-file=';
  const PHASES = WORKFLOW_FILES.filter((rel) => !rel.endsWith("bkit-auto.md"));
  const SWEEPS = [
    ".bkit/core/workflows/bkit-debug.md",
    ".bkit/core/workflows/bkit-design.md",
    ".bkit/core/workflows/bkit-plan.md",
  ];

  for (const rel of PHASES) {
    it(`${rel}: the input artifact's issue text is joined by bkit workflows input`, () => {
      const content = read(rel);
      const inputs = content.split("\n").filter((l) => l.includes('"{BKIT}" workflows input '));
      expect(inputs, "one workflows input call").toHaveLength(1);
      expect(inputs[0], "issue-text join").toContain(ISSUE_JOIN);
      expect(content).not.toContain("issues text");
      expect(content).not.toContain("ISSUE_TEXT");
    });
  }

  for (const rel of SWEEPS) {
    it(`${rel}: each related-issues hit is joined by bkit issues related`, () => {
      const content = read(rel);
      expect(content.split(RELATED_JOIN).length - 1).toBe(1);
      expect(content).not.toContain("RELATED_ISSUE_TEXT");
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
  const PROMPT_DIR = ".bkit/core/prompts";
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

describe("comments are read by the engine, oldest first", () => {
  const CALL_SITE_RE = /method: "get_comments"|mcp__linear__list_comments|listJiraIssueComments/;

  const FALLBACK = "the comments oldest first as JSON to `{SESSION_DIR}/issue-comments.json`";
  const PHASES = WORKFLOW_FILES.filter((rel) => !rel.endsWith("bkit-auto.md"));

  /** Step lines (the header blocks, up to the `---` after front matter, excluded) that call a tracker's comment read. */
  const callSites = (rel: string) => {
    const lines = read(rel).split("\n");
    const headerEnd = lines.indexOf("---", lines.indexOf("---", 1) + 1);
    return lines.slice(headerEnd + 1).filter((line) => CALL_SITE_RE.test(line));
  };

  it("no workflow step calls a tracker's comment read itself", () => {
    for (const rel of WORKFLOW_FILES) {
      expect(callSites(rel), `${rel} reads comments outside the engine`).toEqual([]);
    }
  });

  for (const rel of PHASES) {
    it(`${rel}: every write of the comments file is oldest first`, () => {
      const content = read(rel);
      expect(content.split(FALLBACK).length - 1, "exit-80 fallback").toBe(1);
      expect(content.split("issue-comments.json").length - 1).toBe(2);
    });
  }

  it("does not fetch GitHub comments via gh api", () => {
    for (const rel of WORKFLOW_FILES) {
      expect(read(rel), `${rel} reverts to a gh api comment read`).not.toContain(
        "/comments?per_page=100",
      );
    }
  });

  it("states the order as a sort, never as a tracker-specific reversal", () => {
    // A reversal is only correct for the order the call happens to return today;
    // a sort is correct either way, which is what lets every tracker share it.
    for (const rel of WORKFLOW_FILES) {
      expect(read(rel), `${rel} reverts to reversal wording`).not.toContain("reverse to oldest");
    }
  });
});
