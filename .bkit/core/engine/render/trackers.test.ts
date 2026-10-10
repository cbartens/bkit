// render/trackers.test.ts — inline tracker-block resolution unit tests (true/false model).
import { describe, expect, it } from "vitest";
import { substituteWorkflow } from "./trackers";
import * as fs from "node:fs";
import * as path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..");

function pair(gh: string, ln: string): string {
  return [
    `<!-- bkit:tracker github start -->\n${gh}\n<!-- bkit:tracker github end -->`,
    `<!-- bkit:tracker linear start -->\n${ln}\n<!-- bkit:tracker linear end -->`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// github/linear pairs
// ---------------------------------------------------------------------------

describe("substituteWorkflow — github/linear pairs", () => {
  it("keeps the chosen tracker's block; none collapses to the generic skip message", () => {
    const wf = `Step.\n${pair("GH BODY", "LN BODY")}\nTail.\n`;

    const gh = substituteWorkflow(wf, "github");
    expect(gh.pairs).toBe(1);
    expect(gh.orphans).toEqual([]);
    expect(gh.output).toContain("GH BODY");
    expect(gh.output).not.toContain("LN BODY");
    expect(gh.output).not.toContain("bkit:tracker");

    expect(substituteWorkflow(wf, "linear").output).toContain("LN BODY");

    const no = substituteWorkflow(wf, "none");
    expect(no.output).toContain("_No tracker connected, skip step._");
    expect(no.output).not.toContain("GH BODY");
    expect(no.output).not.toContain("LN BODY");
  });

  it("preserves a list-number prefix on the resolved pair", () => {
    const wf = `3. ${pair("gh-call", "ln-call")}\n4. Next.\n`;
    expect(substituteWorkflow(wf, "github").output).toContain("3. gh-call");
    expect(substituteWorkflow(wf, "none").output).toContain(
      "3. _No tracker connected, skip step._",
    );
  });

  it("uses a pair's trailing false block under none instead of the generic stub", () => {
    const wf = `1. ${pair("gh", "ln")}
<!-- bkit:tracker false start -->
ISSUE_ID="" — derive FID from branch.
<!-- bkit:tracker false end -->
`;
    const no = substituteWorkflow(wf, "none");
    expect(no.output).toContain('ISSUE_ID="" — derive FID from branch.');
    expect(no.output).not.toContain("_No tracker connected, skip step._");
    // wired ignores the trailing false block
    expect(substituteWorkflow(wf, "github").output).toContain("1. gh");
    expect(substituteWorkflow(wf, "github").output).not.toContain("derive FID from branch");
  });

  it("resolves multiple pairs", () => {
    const wf = `${pair("g1", "l1")}\n\n${pair("g2", "l2")}\n`;
    const r = substituteWorkflow(wf, "github");
    expect(r.pairs).toBe(2);
    expect(r.output).toContain("g1");
    expect(r.output).toContain("g2");
  });

  it("does not jam content that follows a pair with no trailing false block", () => {
    // The optional trailing-false `\s*` sits inside the optional group, so the newline
    // after a pair survives (no `…COMMENTS.→ EXISTING map…`).
    const wf = `2. ${pair("read call", "read call ln")}\n   → trailing derived line.\n`;

    const gh = substituteWorkflow(wf, "github").output;
    expect(gh).toContain("read call\n   → trailing derived line.");
    expect(gh).not.toContain("read call→ trailing derived line.");

    const no = substituteWorkflow(wf, "none").output;
    expect(no).toContain("_No tracker connected, skip step._\n   → trailing derived line.");
  });

  it("flags a lone github block (no linear) as an orphan", () => {
    const wf = `<!-- bkit:tracker github start -->\nbody\n<!-- bkit:tracker github end -->\n`;
    const r = substituteWorkflow(wf, "github");
    expect(r.pairs).toBe(0);
    expect(r.orphans).toContain("github");
  });
});

// ---------------------------------------------------------------------------
// true / false conditional blocks
// ---------------------------------------------------------------------------

describe("substituteWorkflow — true/false conditionals", () => {
  it("`true` keeps content when wired, removes it entirely under none (no stub)", () => {
    const wf = `3. Step.
   <!-- bkit:tracker true start -->
   \`{BODY}\` = fenced block below:
   kept line
   <!-- bkit:tracker true end -->
4. Next.
`;
    const gh = substituteWorkflow(wf, "github");
    expect(gh.conditionals).toBe(1);
    expect(gh.orphans).toEqual([]);
    expect(gh.output).toContain(
      "3. Step.\n   `{BODY}` = fenced block below:\n   kept line\n4. Next.",
    );

    const no = substituteWorkflow(wf, "none");
    // removed entirely — no stub, no blank gap
    expect(no.output).toContain("3. Step.\n4. Next.");
    expect(no.output).not.toContain("kept line");
    expect(no.output).not.toContain("bkit:tracker");
  });

  it("`false` keeps content only under none, removes it when wired", () => {
    const wf = `x
   <!-- bkit:tracker false start -->
   none-only note
   <!-- bkit:tracker false end -->
y
`;
    expect(substituteWorkflow(wf, "none").output).toContain("none-only note");
    const gh = substituteWorkflow(wf, "github");
    expect(gh.output).not.toContain("none-only note");
    expect(gh.output).toContain("x\ny");
  });

  it("resolves a pair nested inside a `true` block", () => {
    const wf = `   <!-- bkit:tracker true start -->
   ${pair("GH", "LN")}
   Set VAR. If empty -> Failure Path.
   <!-- bkit:tracker true end -->
`;
    const gh = substituteWorkflow(wf, "github");
    expect(gh.pairs).toBe(1);
    expect(gh.conditionals).toBe(1);
    expect(gh.orphans).toEqual([]);
    expect(gh.output).toContain("GH");
    expect(gh.output).toContain("Set VAR. If empty -> Failure Path.");
    expect(gh.output).not.toContain("bkit:tracker");

    const no = substituteWorkflow(wf, "none");
    expect(no.output).not.toContain("Failure Path");
    expect(no.output).not.toContain("GH");
    expect(no.output).not.toContain("bkit:tracker");
  });

  it("flags an unbalanced true marker as an orphan", () => {
    expect(substituteWorkflow("<!-- bkit:tracker true start -->\nb\n", "github").orphans).toContain(
      "true",
    );
  });
});

// ---------------------------------------------------------------------------
// Real workflow sources — resolve cleanly for every tracker
// ---------------------------------------------------------------------------

describe("real workflow sources", () => {
  const workflows = [
    "bkit-build",
    "bkit-ship",
    "bkit-debug",
    "bkit-design",
    "bkit-plan",
    "bkit-auto",
  ];

  for (const wf of workflows) {
    for (const tracker of ["github", "linear", "none"] as const) {
      it(`${wf} resolves cleanly for ${tracker}`, () => {
        const src = fs.readFileSync(
          path.join(REPO_ROOT, ".bkit", "core", "workflows", `${wf}.md`),
          "utf-8",
        );
        const r = substituteWorkflow(src, tracker);
        expect(r.orphans, `orphans in ${wf}/${tracker}`).toEqual([]);
        expect(r.output, `leftover markers in ${wf}/${tracker}`).not.toMatch(
          /<!--\s*bkit:tracker\b/,
        );
        expect(r.pairs, `${wf} should have github/linear pairs`).toBeGreaterThan(0);
      });
    }
  }

  it("every github block has a matching linear block; no legacy none markers remain", () => {
    for (const wf of workflows) {
      const src = fs.readFileSync(
        path.join(REPO_ROOT, ".bkit", "core", "workflows", `${wf}.md`),
        "utf-8",
      );
      const count = (re: RegExp) => (src.match(re) ?? []).length;
      const gh = count(/<!--\s*bkit:tracker\s+github\s+start\s*-->/g);
      const ln = count(/<!--\s*bkit:tracker\s+linear\s+start\s*-->/g);
      // No-tracker content uses `false`, never a `none` marker.
      const legacyNone = count(/<!--\s*bkit:tracker\s+none\s+(?:start|end)\s*-->/g);
      expect(gh, `${wf} unbalanced github/linear`).toBe(ln);
      expect(legacyNone, `${wf} has retired bkit:tracker none markers`).toBe(0);
    }
  });

  // Tracker-only operations and their internal data placeholders NEVER survive into the
  // `none` render — they live only inside github/linear pairs (collapse to a stub under
  // none) or `true` blocks (removed under none). Excluded: ISSUE_ID, STATE,
  // LABELS, DESCRIPTION, COMMENTS — these legitimately appear in the none path
  // (FID derivation, and the `false` stub that sets them empty).
  const TRACKER_ONLY_TOKENS = [
    "mcp__github__", // any GitHub tracker tool call
    "mcp__linear__", // any Linear tracker tool call
    "TARGET_ISSUE_ID",
    "WORKSTREAM_ISSUE_ID",
    "SUB_ISSUE_NUMBER",
    "SUB_ISSUE_NODE_ID",
    "BLOCKED_BY_LIST",
    "CURRENT_BODY",
    "NEW_BODY",
    "ITEM_ID",
    "LINEAR_TEAM",
    "githubProject", // Projects v2 board config (bkit.githubProject.*)
    "progressOptionId",
  ];

  for (const wf of workflows) {
    it(`${wf} leaks no tracker-only token into the none render (#202 guard)`, () => {
      const src = fs.readFileSync(
        path.join(REPO_ROOT, ".bkit", "core", "workflows", `${wf}.md`),
        "utf-8",
      );
      const out = substituteWorkflow(src, "none").output;
      const leaked = TRACKER_ONLY_TOKENS.filter((t) => out.includes(t));
      expect(leaked, `${wf} none render leaks tracker-only tokens: ${leaked.join(", ")}`).toEqual(
        [],
      );
    });
  }

  // A github/linear pair is for content whose CALL genuinely differs. If the two
  // bodies are byte-identical, the pair is redundant duplication — it must be a
  // single `bkit:tracker true` block (kept for any wired tracker, removed under
  // none) instead.
  const PAIR_RE =
    /<!--\s*bkit:tracker\s+github\s+start\s*-->([\s\S]*?)<!--\s*bkit:tracker\s+github\s+end\s*-->\s*<!--\s*bkit:tracker\s+linear\s+start\s*-->([\s\S]*?)<!--\s*bkit:tracker\s+linear\s+end\s*-->/g;
  for (const wf of workflows) {
    it(`${wf} has no identical github/linear pair (should be a true block)`, () => {
      const src = fs.readFileSync(
        path.join(REPO_ROOT, ".bkit", "core", "workflows", `${wf}.md`),
        "utf-8",
      );
      const identical: string[] = [];
      let m: RegExpExecArray | null;
      PAIR_RE.lastIndex = 0;
      while ((m = PAIR_RE.exec(src)) !== null) {
        if (m[1].trim() === m[2].trim()) identical.push(m[1].trim().slice(0, 60));
      }
      expect(
        identical,
        `${wf} has byte-identical github/linear pair(s) — use \`true\`: ${identical.join(" | ")}`,
      ).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// real prompt sources — agents get the same resolution as workflows
// ---------------------------------------------------------------------------

describe("real prompt sources", () => {
  const PROMPTS_DIR = path.join(REPO_ROOT, ".bkit", "core", "prompts");
  const prompts = fs.readdirSync(PROMPTS_DIR).filter((f) => f.endsWith(".md"));

  for (const tracker of ["github", "linear", "none"] as const) {
    it(`every prompt resolves cleanly for ${tracker}`, () => {
      for (const f of prompts) {
        const r = substituteWorkflow(fs.readFileSync(path.join(PROMPTS_DIR, f), "utf-8"), tracker);
        expect(r.orphans, `orphans in ${f}/${tracker}`).toEqual([]);
        expect(r.output, `leftover markers in ${f}/${tracker}`).not.toMatch(
          /<!--\s*bkit:tracker\b/,
        );
      }
    });
  }

  it("source frontmatter carries no bare HTML-comment line (invalid YAML)", () => {
    for (const f of prompts) {
      const fm = fs.readFileSync(path.join(PROMPTS_DIR, f), "utf-8").split(/^---$/m)[1] ?? "";
      expect(fm, `bare <!-- line in ${f} frontmatter`).not.toMatch(/^[ \t]*<!--/m);
    }
  });

  const roadmapTools = (tracker: "github" | "linear" | "none"): string[] => {
    const src = fs.readFileSync(path.join(PROMPTS_DIR, "bkit-utility-update-roadmap.md"), "utf-8");
    const fm = substituteWorkflow(src, tracker).output.split(/^---$/m)[1];
    const block = fm.match(/^tools:\n((?:.*\n)*?)(?=^\S)/m)?.[1] ?? "";
    for (const line of block.split("\n").filter(Boolean)) {
      expect(line, `non-list line in ${tracker} tools block`).toMatch(/^ {2}- [\w*]+$/);
    }
    return block
      .split("\n")
      .filter(Boolean)
      .map((l) => l.replace(/^ {2}- /, ""));
  };

  it("roadmap agent gets only the chosen tracker's read tools", () => {
    const base = ["Read", "Grep", "Glob", "mcp__serena__*", "Write", "Edit", "Bash"];
    expect(roadmapTools("github")).toEqual([
      ...base,
      "mcp__github__list_issues",
      "mcp__github__issue_read",
    ]);
    expect(roadmapTools("linear")).toEqual([
      ...base,
      "mcp__linear__list_issues",
      "mcp__linear__get_issue",
    ]);
    expect(roadmapTools("none")).toEqual(base);
  });
});

// ---------------------------------------------------------------------------
// issue-scan call sites — bounded related-issue scan wired into
// design/plan/debug entry; advisory, capped, degrades to a no-op under none.
// ---------------------------------------------------------------------------

describe("issue-scan call sites (#135)", () => {
  const scanned = ["bkit-design", "bkit-plan", "bkit-debug"];
  const read = (wf: string) =>
    fs.readFileSync(path.join(REPO_ROOT, ".bkit", "core", "workflows", `${wf}.md`), "utf-8");

  for (const wf of scanned) {
    it(`${wf} wires a github scan that fetches each hit's comments`, () => {
      const out = substituteWorkflow(read(wf), "github").output;
      expect(out).toContain("mcp__github__search_issues");
      expect(out).toContain('method: "get_comments"');
      expect(out).toContain('method: "get"');
      expect(out).not.toContain(
        'gh api "repos/{OWNER}/{REPO}/issues/{number}/comments?per_page=100"',
      );
    });

    it(`${wf} wires the linear scan with per-hit comment fetch`, () => {
      const out = substituteWorkflow(read(wf), "linear").output;
      expect(out).toContain("mcp__linear__list_issues");
      expect(out).toContain("mcp__linear__list_comments");
    });

    it(`${wf} omits the scan entirely under none (no tracker call)`, () => {
      const out = substituteWorkflow(read(wf), "none").output;
      expect(out).not.toContain("mcp__github__search_issues");
      expect(out).not.toContain("mcp__linear__list_issues");
    });
  }
});
