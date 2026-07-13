// bkit-comply.test.ts — unit tests for the compliance grader pure functions.
//
// Done-when contract (WS2-T3):
//   - `(parentSha, phase, planPath) -> Violation[]` is deterministic.
//   - Unit test asserts each rule's pass/fail.
//   - Every emitted `kind:"compliance"` row carries `bkitVersion`.

import { describe, expect, it } from "vitest";
import {
  ruleNoMirrorEdit,
  ruleSkipCiNotHead,
  runGrader,
  buildComplianceRows,
  formatComplianceSummary,
  type GraderInput,
  type GitAdapter,
} from "./bkit-comply.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Stub adapter that returns fixed values. */
function makeAdapter(opts: { diffPaths?: string[]; headSubject?: string }): GitAdapter {
  return {
    diffPaths: () => opts.diffPaths ?? [],
    headSubject: () => opts.headSubject ?? "chore: some commit",
  };
}

function makeInput(overrides: Partial<GraderInput> = {}): GraderInput {
  return {
    parentSha: "abc1234",
    phase: "ship",
    gitAdapter: makeAdapter({}),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// ruleNoMirrorEdit
// ---------------------------------------------------------------------------

describe("ruleNoMirrorEdit", () => {
  it("returns null when no mirror paths are in the diff", () => {
    const result = ruleNoMirrorEdit([
      ".bkit/workflows/bkit-ship.md",
      "src/index.ts",
      ".agents/rules.md",
    ]);
    expect(result).toBeNull();
  });

  it("flags a .claude/agents/ edit", () => {
    const v = ruleNoMirrorEdit([".claude/agents/bkit-design.md"]);
    expect(v).not.toBeNull();
    expect(v!.ruleId).toBe("no-mirror-edit");
    expect(v!.result).toBe("fail");
    expect(v!.evidence).toContain(".claude/agents/bkit-design.md");
  });

  it("flags a .cursor/commands/ edit", () => {
    const v = ruleNoMirrorEdit([".cursor/commands/bkit-plan.md"]);
    expect(v).not.toBeNull();
    expect(v!.ruleId).toBe("no-mirror-edit");
    expect(v!.evidence).toContain(".cursor/commands/bkit-plan.md");
  });

  it("flags a .opencode/agents/ edit", () => {
    const v = ruleNoMirrorEdit([".opencode/agents/bkit-build.md"]);
    expect(v).not.toBeNull();
  });

  it("does NOT flag .claude/hooks/ (not a mirror dir)", () => {
    expect(ruleNoMirrorEdit([".claude/hooks/gateguard.cjs"])).toBeNull();
  });

  it("does NOT flag .claude/settings.json", () => {
    expect(ruleNoMirrorEdit([".claude/settings.json"])).toBeNull();
  });

  it("returns null on empty diff", () => {
    expect(ruleNoMirrorEdit([])).toBeNull();
  });

  it("is deterministic — same inputs yield same output", () => {
    const paths = [".claude/agents/bkit-debug.md", "docs/testing.md"];
    expect(ruleNoMirrorEdit(paths)).toEqual(ruleNoMirrorEdit(paths));
  });

  it("includes ALL mirrored paths in evidence", () => {
    const paths = [".claude/agents/bkit-design.md", ".cursor/commands/bkit-plan.md"];
    const v = ruleNoMirrorEdit(paths);
    expect(v!.evidence).toContain(".claude/agents/bkit-design.md");
    expect(v!.evidence).toContain(".cursor/commands/bkit-plan.md");
  });
});

// ---------------------------------------------------------------------------
// ruleSkipCiNotHead
// ---------------------------------------------------------------------------

describe("ruleSkipCiNotHead", () => {
  it("returns null for non-ship phases (design)", () => {
    expect(ruleSkipCiNotHead("chore: close [skip ci]", "design")).toBeNull();
  });

  it("returns null for non-ship phases (build)", () => {
    expect(ruleSkipCiNotHead("something [skip ci] here", "build")).toBeNull();
  });

  it("returns null for ship phase when HEAD has no [skip ci]", () => {
    expect(ruleSkipCiNotHead("feat: close workflow", "ship")).toBeNull();
  });

  it("flags ship phase when HEAD carries [skip ci]", () => {
    const v = ruleSkipCiNotHead("chore: close [skip ci]", "ship");
    expect(v).not.toBeNull();
    expect(v!.ruleId).toBe("skip-ci-not-head");
    expect(v!.result).toBe("fail");
    expect(v!.evidence).toContain("chore: close [skip ci]");
  });

  it("is deterministic — same inputs yield same output", () => {
    const a = ruleSkipCiNotHead("[skip ci] test", "ship");
    const b = ruleSkipCiNotHead("[skip ci] test", "ship");
    expect(a).toEqual(b);
  });
});

// ---------------------------------------------------------------------------
// runGrader — integration of rules
// ---------------------------------------------------------------------------

describe("runGrader", () => {
  it("returns empty violations when all rules pass", () => {
    const violations = runGrader(
      makeInput({
        phase: "ship",
        gitAdapter: makeAdapter({
          diffPaths: ["src/index.ts"],
          headSubject: "feat: ship clean",
        }),
      }),
    );
    expect(violations).toHaveLength(0);
  });

  it("flags no-mirror-edit when a mirror path is in the diff", () => {
    const violations = runGrader(
      makeInput({
        phase: "build",
        gitAdapter: makeAdapter({
          diffPaths: [".claude/agents/bkit-build.md"],
          headSubject: "feat: build step",
        }),
      }),
    );
    expect(violations.some((v) => v.ruleId === "no-mirror-edit")).toBe(true);
  });

  it("flags skip-ci-not-head for ship phase with [skip ci] HEAD", () => {
    const violations = runGrader(
      makeInput({
        phase: "ship",
        gitAdapter: makeAdapter({
          diffPaths: [],
          headSubject: "chore: close [skip ci]",
        }),
      }),
    );
    expect(violations.some((v) => v.ruleId === "skip-ci-not-head")).toBe(true);
  });

  it("can return multiple violations in one run", () => {
    const violations = runGrader(
      makeInput({
        phase: "ship",
        gitAdapter: makeAdapter({
          diffPaths: [".claude/agents/bkit-ship.md"],
          headSubject: "chore: close [skip ci]",
        }),
      }),
    );
    expect(violations.length).toBeGreaterThanOrEqual(2);
  });

  it("is deterministic — same inputs always yield same violations", () => {
    const input = makeInput({
      phase: "ship",
      gitAdapter: makeAdapter({
        diffPaths: [".claude/agents/bkit-design.md"],
        headSubject: "feat: x",
      }),
    });
    const a = runGrader(input);
    const b = runGrader(input);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("returns empty array on grader internal error (fail-open)", () => {
    const throwingAdapter: GitAdapter = {
      diffPaths: () => {
        throw new Error("git not found");
      },
      headSubject: () => "",
    };
    const violations = runGrader(makeInput({ gitAdapter: throwingAdapter }));
    expect(violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// buildComplianceRows — telemetry row shape
// ---------------------------------------------------------------------------

describe("buildComplianceRows", () => {
  it("emits one row per rule (no-mirror-edit + skip-ci-not-head = 2)", () => {
    const rows = buildComplianceRows({
      violations: [],
      phase: "ship",
      parentSha: "abc1234",
      repo: "cbartens/bkit",
      bkitVersion: "4.1.4",
    });
    expect(rows).toHaveLength(2);
  });

  it("every row carries kind:'compliance'", () => {
    const rows = buildComplianceRows({
      violations: [],
      phase: "ship",
      parentSha: "abc1234",
      repo: "cbartens/bkit",
      bkitVersion: "4.1.4",
    });
    for (const row of rows) {
      expect(row.kind).toBe("compliance");
    }
  });

  it("every row carries bkitVersion", () => {
    const rows = buildComplianceRows({
      violations: [],
      phase: "ship",
      parentSha: "abc1234",
      repo: "cbartens/bkit",
      bkitVersion: "4.1.4",
    });
    for (const row of rows) {
      expect(row.bkitVersion).toBe("4.1.4");
    }
  });

  it("failing violation produces result:'fail' row for that rule", () => {
    const rows = buildComplianceRows({
      violations: [
        {
          ruleId: "no-mirror-edit",
          description: "mirror edit found",
          evidence: ".claude/agents/bkit-design.md",
          result: "fail",
        },
      ],
      phase: "ship",
      parentSha: "abc1234",
      repo: "cbartens/bkit",
      bkitVersion: "4.1.4",
    });
    const mirrorRow = rows.find((r) => r.rule === "no-mirror-edit");
    expect(mirrorRow?.result).toBe("fail");
    expect(mirrorRow?.evidence).toBe(".claude/agents/bkit-design.md");
  });

  it("passing rule produces result:'pass' row", () => {
    const rows = buildComplianceRows({
      violations: [],
      phase: "build",
      parentSha: "abc1234",
      repo: "cbartens/bkit",
      bkitVersion: "4.1.4",
    });
    for (const row of rows) {
      expect(row.result).toBe("pass");
    }
  });

  it("rows have a numeric ts field", () => {
    const rows = buildComplianceRows({
      violations: [],
      phase: "ship",
      parentSha: "abc1234",
      repo: "cbartens/bkit",
      bkitVersion: "4.1.4",
    });
    for (const row of rows) {
      expect(typeof row.ts).toBe("number");
      expect(row.ts).toBeGreaterThan(0);
    }
  });

  it("rows carry the phase in workflow field", () => {
    const rows = buildComplianceRows({
      violations: [],
      phase: "design",
      parentSha: "abc1234",
      repo: "cbartens/bkit",
      bkitVersion: "4.1.4",
    });
    for (const row of rows) {
      expect(row.workflow).toBe("design");
    }
  });

  it("rows carry parentSha", () => {
    const rows = buildComplianceRows({
      violations: [],
      phase: "ship",
      parentSha: "cafebabe",
      repo: "cbartens/bkit",
      bkitVersion: "4.1.4",
    });
    for (const row of rows) {
      expect(row.parentSha).toBe("cafebabe");
    }
  });

  it("extra envelope fields are merged into rows", () => {
    const rows = buildComplianceRows({
      violations: [],
      phase: "ship",
      parentSha: "abc1234",
      repo: "cbartens/bkit",
      bkitVersion: "4.1.4",
      extra: { subagent: "bkit-ship-summary" },
    });
    for (const row of rows) {
      expect(row.subagent).toBe("bkit-ship-summary");
    }
  });

  it("JSON.stringify of each row is valid NDJSON line (no newlines inside)", () => {
    const rows = buildComplianceRows({
      violations: [],
      phase: "ship",
      parentSha: "abc1234",
      repo: "cbartens/bkit",
      bkitVersion: "4.1.4",
    });
    for (const row of rows) {
      const line = JSON.stringify(row);
      expect(line.includes("\n")).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// formatComplianceSummary
// ---------------------------------------------------------------------------

describe("formatComplianceSummary", () => {
  it("returns empty string when no violations", () => {
    expect(formatComplianceSummary([])).toBe("");
  });

  it("contains rule ID in the summary text", () => {
    const summary = formatComplianceSummary([
      {
        ruleId: "no-mirror-edit",
        description: "mirror edit found",
        evidence: ".claude/agents/x.md",
        result: "fail",
      },
    ]);
    expect(summary).toContain("no-mirror-edit");
    expect(summary).toContain(".claude/agents/x.md");
  });

  it("marks the summary as advisory (never blocks)", () => {
    const summary = formatComplianceSummary([
      {
        ruleId: "skip-ci-not-head",
        description: "skip ci at head",
        evidence: "HEAD: [skip ci]",
        result: "fail",
      },
    ]);
    expect(summary.toLowerCase()).toContain("advisory");
  });

  it("contains Compliance Violations header", () => {
    const summary = formatComplianceSummary([
      {
        ruleId: "no-mirror-edit",
        description: "d",
        evidence: "e",
        result: "fail",
      },
    ]);
    expect(summary).toContain("Compliance Violations");
  });
});
