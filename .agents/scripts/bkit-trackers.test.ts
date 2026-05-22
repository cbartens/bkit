// bkit-trackers.test.ts — parse `.agents/trackers.md` + substitution unit tests.
import { describe, expect, it } from "vitest";
import {
  parseTrackersMd,
  substituteWorkflow,
  loadTrackers,
  type TrackersMap,
} from "./bkit-trackers";
import * as path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..", "..");

// ---------------------------------------------------------------------------
// parseTrackersMd
// ---------------------------------------------------------------------------

describe("parseTrackersMd", () => {
  it("extracts tracker sections and snippet bodies", () => {
    const md = `# Trackers

## Substitution contract

Preamble text (ignored — not a tracker name).

---

## github

### rule-block

> - **Tracker:** github line 1.
> - **Labels:** github line 2.

### issue-read

\`mcp__github__issue_read(...)\` body.

---

## linear

### rule-block

> - **Tracker:** linear line 1.

### issue-read

\`mcp__linear__get_issue(...)\` body.

---

## none

### rule-block

> _Tracker not wired — skip._

### issue-read

_Tracker not wired — skip issue read._
`;
    const trackers = parseTrackersMd(md);

    expect(trackers.size).toBe(3);
    expect(trackers.has("github")).toBe(true);
    expect(trackers.has("linear")).toBe(true);
    expect(trackers.has("none")).toBe(true);
    // Preamble H2s are ignored
    expect(trackers.has("Substitution contract" as never)).toBe(false);

    const github = trackers.get("github");
    expect(github).toBeDefined();
    expect(github!.get("rule-block")).toBe(
      "> - **Tracker:** github line 1.\n> - **Labels:** github line 2.",
    );
    expect(github!.get("issue-read")).toBe("`mcp__github__issue_read(...)` body.");

    expect(trackers.get("none")!.get("rule-block")).toBe("> _Tracker not wired — skip._");
  });

  it("strips trailing `---` separators from snippet bodies", () => {
    const md = `## github

### rule-block

body line one
body line two

---

## linear

### rule-block

linear body
`;
    const trackers = parseTrackersMd(md);
    expect(trackers.get("github")!.get("rule-block")).toBe("body line one\nbody line two");
  });

  it("ignores H3 headings that are not valid snippet IDs (kebab-case-lowercase)", () => {
    const md = `## github

### Rule Block

Not a snippet — heading has spaces / capitals.

### rule-block

Valid snippet body.
`;
    const trackers = parseTrackersMd(md);
    const github = trackers.get("github")!;
    expect(github.has("rule-block")).toBe(true);
    expect(github.has("Rule Block")).toBe(false);
    expect(github.get("rule-block")).toBe("Valid snippet body.");
  });

  it("returns an empty map when no recognised tracker sections are present", () => {
    const md = `# Trackers

## Substitution contract

No tracker H2s here.
`;
    expect(parseTrackersMd(md).size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// substituteWorkflow
// ---------------------------------------------------------------------------

function makeTrackers(): TrackersMap {
  const m: TrackersMap = new Map();
  const github = new Map<string, string>();
  github.set("rule-block", "GH RULE BLOCK BODY");
  github.set("issue-read", "GH ISSUE READ BODY");
  m.set("github", github);

  const none = new Map<string, string>();
  none.set("rule-block", "> _Tracker not wired — skip._");
  none.set("issue-read", "_Tracker not wired — skip issue read._");
  m.set("none", none);

  return m;
}

describe("substituteWorkflow", () => {
  it("replaces marker pair + fallback with snippet body", () => {
    const workflow = `# Workflow

Header line.

<!-- bkit:tracker rule-block start -->
> _Tracker not wired — skip._
<!-- bkit:tracker rule-block end -->

Trailing line.
`;
    const { output, substitutions, missing, orphans } = substituteWorkflow(
      workflow,
      "github",
      makeTrackers(),
    );

    expect(substitutions).toBe(1);
    expect(missing).toEqual([]);
    expect(orphans).toEqual([]);
    expect(output).toContain("GH RULE BLOCK BODY");
    expect(output).not.toContain("bkit:tracker rule-block start");
    expect(output).not.toContain("bkit:tracker rule-block end");
    expect(output).not.toContain("Tracker not wired");
  });

  it("substitutes multiple marker pairs in one workflow", () => {
    const workflow = `Step 1.

<!-- bkit:tracker rule-block start -->
fallback A
<!-- bkit:tracker rule-block end -->

Step 2.

<!-- bkit:tracker issue-read start -->
fallback B
<!-- bkit:tracker issue-read end -->
`;
    const { output, substitutions, missing } = substituteWorkflow(
      workflow,
      "github",
      makeTrackers(),
    );
    expect(substitutions).toBe(2);
    expect(missing).toEqual([]);
    expect(output).toContain("GH RULE BLOCK BODY");
    expect(output).toContain("GH ISSUE READ BODY");
  });

  it("tolerates whitespace variations inside marker tokens", () => {
    const workflow = `<!--    bkit:tracker   rule-block   start   -->
fallback
<!--bkit:tracker rule-block end-->
`;
    const { output, substitutions } = substituteWorkflow(workflow, "github", makeTrackers());
    expect(substitutions).toBe(1);
    expect(output).toContain("GH RULE BLOCK BODY");
  });

  it("reports missing snippets without throwing", () => {
    const workflow = `<!-- bkit:tracker phase-labels start -->
fallback
<!-- bkit:tracker phase-labels end -->
`;
    const { output, substitutions, missing } = substituteWorkflow(
      workflow,
      "github",
      makeTrackers(),
    );
    expect(substitutions).toBe(0);
    expect(missing).toEqual(["phase-labels"]);
    expect(output).toContain("MISSING in tracker 'github'");
  });

  it("detects orphan start marker without matching end", () => {
    const workflow = `<!-- bkit:tracker rule-block start -->
unclosed body
`;
    const { substitutions, orphans } = substituteWorkflow(workflow, "github", makeTrackers());
    expect(substitutions).toBe(0);
    expect(orphans).toContain("start:rule-block");
  });

  it("detects orphan end marker without matching start", () => {
    const workflow = `<!-- bkit:tracker rule-block end -->
`;
    const { substitutions, orphans } = substituteWorkflow(workflow, "github", makeTrackers());
    expect(substitutions).toBe(0);
    expect(orphans).toContain("end:rule-block");
  });

  it("does not match mismatched-id marker pairs", () => {
    const workflow = `<!-- bkit:tracker rule-block start -->
body
<!-- bkit:tracker issue-read end -->
`;
    const { substitutions, orphans } = substituteWorkflow(workflow, "github", makeTrackers());
    expect(substitutions).toBe(0);
    expect(orphans).toEqual(expect.arrayContaining(["start:rule-block", "end:issue-read"]));
  });

  it("throws when tracker name is not present in the parsed map", () => {
    const empty: TrackersMap = new Map();
    expect(() =>
      substituteWorkflow(
        "<!-- bkit:tracker rule-block start -->\n\n<!-- bkit:tracker rule-block end -->\n",
        "github",
        empty,
      ),
    ).toThrow(/Tracker 'github' not found/);
  });

  it("uses 'none' tracker for the no-tracker-wired install path", () => {
    const workflow = `<!-- bkit:tracker rule-block start -->
default fallback
<!-- bkit:tracker rule-block end -->
`;
    const { output, substitutions } = substituteWorkflow(workflow, "none", makeTrackers());
    expect(substitutions).toBe(1);
    expect(output).toContain("> _Tracker not wired — skip._");
  });
});

// ---------------------------------------------------------------------------
// loadTrackers — integration with the real .agents/trackers.md
// ---------------------------------------------------------------------------

describe("loadTrackers (real file)", () => {
  it("parses the shipped .agents/trackers.md and exposes all three trackers", () => {
    const trackers = loadTrackers(REPO_ROOT);
    expect(trackers.has("github")).toBe(true);
    expect(trackers.has("linear")).toBe(true);
    expect(trackers.has("none")).toBe(true);
  });

  it("every tracker defines the full snippet inventory", () => {
    const required = [
      "rule-block",
      "issue-id-extraction",
      "fid-format",
      "issue-read",
      "issue-update-phase",
      "issue-update-review",
      "issue-update-failed",
      "issue-update-debug",
      "issue-update-merged",
      "comment-post-step",
      "comment-on-issue",
      "list-sub-issues",
      "create-sub-issue",
      "set-blocked-by",
      "phase-labels",
      "kill-switch-check",
      "pr-body-metadata",
    ];
    const trackers = loadTrackers(REPO_ROOT);
    for (const tracker of ["github", "linear", "none"] as const) {
      const snippets = trackers.get(tracker);
      expect(snippets, `${tracker} section missing`).toBeDefined();
      for (const id of required) {
        expect(snippets!.has(id), `${tracker} missing snippet '${id}'`).toBe(true);
        const body = snippets!.get(id)!;
        expect(body.length, `${tracker}.${id} body empty`).toBeGreaterThan(0);
      }
    }
  });

  it("`none` snippet bodies are short stubs (sanity check)", () => {
    const trackers = loadTrackers(REPO_ROOT);
    const none = trackers.get("none")!;
    // Most `none` stubs are single-line; allow a small margin for prose
    for (const [id, body] of none.entries()) {
      // Skip snippets that legitimately carry no-tracker prose (more than a single-line stub)
      if (id === "pr-body-metadata" || id === "fid-format" || id === "issue-id-extraction")
        continue;
      expect(body.split("\n").length, `${id} body too long for 'none'`).toBeLessThanOrEqual(3);
    }
  });
});
