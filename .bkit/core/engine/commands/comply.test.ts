// commands/comply.test.ts — unit tests for the compliance grader pure functions.
//
// Done-when contract (WS2-T3):
//   - `(parentSha, phase) -> Violation[]` is deterministic.
//   - Unit test asserts each rule's pass/fail.
//   - Every emitted `kind:"compliance"` row carries `by` and `run.parentSha`.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ruleNoMirrorEdit,
  ruleSkipCiNotHead,
  runGrader,
  buildComplianceRows,
  appendComplianceRows,
  formatComplianceSummary,
  gradeCompliance,
  type GraderInput,
  type GitAdapter,
  type ComplianceRowDraft,
} from "./comply.js";
import { validate } from "../ledgers/telemetry.js";

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
    expect(ruleNoMirrorEdit([".claude/hooks/bkit-gateguard.cjs"])).toBeNull();
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
  const input = { workflow: "ship", parentSha: "abc1234", step: "ship-close-workflow" };

  it("emits one row per rule (no-mirror-edit + skip-ci-not-head = 2)", () => {
    const rows = buildComplianceRows({ violations: [], ...input });
    expect(rows).toHaveLength(2);
  });

  it("every row carries kind:'compliance'", () => {
    const rows = buildComplianceRows({ violations: [], ...input });
    for (const row of rows) {
      expect(row.kind).toBe("compliance");
    }
  });

  it("rows leave the top section ledgers append fills (schema, ts, repo, bkit) unset", () => {
    const rows = buildComplianceRows({ violations: [], ...input });
    for (const row of rows) {
      for (const k of ["schema", "ts", "repo", "bkit"]) expect(Object.hasOwn(row, k)).toBe(false);
    }
  });

  it("failing violation produces verdict:'fail' row for that rule", () => {
    const rows = buildComplianceRows({
      violations: [
        {
          ruleId: "no-mirror-edit",
          description: "mirror edit found",
          evidence: ".claude/agents/bkit-design.md",
          result: "fail",
        },
      ],
      ...input,
    });
    const mirrorRow = rows.find((r) => r.rule.id === "no-mirror-edit");
    expect(mirrorRow?.rule.verdict).toBe("fail");
    expect(mirrorRow?.rule.evidence).toBe(".claude/agents/bkit-design.md");
  });

  it("passing rule produces verdict:'pass' row with no evidence", () => {
    const rows = buildComplianceRows({ violations: [], ...input, workflow: "build" });
    for (const row of rows) {
      expect(row.rule.verdict).toBe("pass");
      expect(Object.hasOwn(row.rule, "evidence")).toBe(false);
    }
  });

  it("rows carry the workflow and step in by", () => {
    const rows = buildComplianceRows({
      violations: [],
      workflow: "design",
      parentSha: "abc1234",
      step: "close-gate",
    });
    for (const row of rows) {
      expect(row.by).toEqual({ workflow: "design", step: "close-gate" });
    }
  });

  it("rows carry run.parentSha", () => {
    const rows = buildComplianceRows({ violations: [], ...input, parentSha: "cafebabe" });
    for (const row of rows) {
      expect(row.run).toEqual({ parentSha: "cafebabe" });
    }
  });

  it("JSON.stringify of each row is valid NDJSON line (no newlines inside)", () => {
    const rows = buildComplianceRows({ violations: [], ...input });
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

// ---------------------------------------------------------------------------
// appendComplianceRows — best-effort ledger append
// ---------------------------------------------------------------------------

describe("appendComplianceRows", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-comply-test-"));
    fs.mkdirSync(path.join(tmpDir, ".bkit"));
    fs.writeFileSync(
      path.join(tmpDir, ".bkit", "version"),
      JSON.stringify({ pinnedVersion: "4.1.4", canonicalHashes: {} }),
    );
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const statsPath = () => path.join(tmpDir, ".bkit", "stats.jsonl");
  const read = () =>
    fs
      .readFileSync(statsPath(), "utf8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l) as Record<string, unknown>);

  function makeRow(rule: "no-mirror-edit" | "skip-ci-not-head"): ComplianceRowDraft {
    return {
      kind: "compliance",
      by: { workflow: "ship", step: "close-gate" },
      run: { parentSha: "abc1234" },
      rule: { id: rule, verdict: "pass" },
    };
  }

  it("appends one NDJSON line per row to .bkit/stats.jsonl, with the top section filled", () => {
    expect(
      appendComplianceRows([makeRow("no-mirror-edit"), makeRow("skip-ci-not-head")], tmpDir),
    ).toBe(true);

    const rows = read();
    expect(rows.map((r) => (r.rule as { id: string }).id)).toEqual([
      "no-mirror-edit",
      "skip-ci-not-head",
    ]);
    for (const r of rows) {
      expect(r.schema).toBe(3);
      expect(typeof r.ts).toBe("number");
      expect(r.bkit).toEqual({ version: "4.1.4" });
      expect(typeof r.repo).toBe("string");
      expect(validate(r)).toEqual({ ok: true });
    }
    expect(rows[1]!.ts as number).toBeGreaterThan(rows[0]!.ts as number);
  });

  it("appends to an existing file rather than truncating it", () => {
    fs.writeFileSync(statsPath(), JSON.stringify({ kind: "outcome", ts: 0 }) + "\n", "utf8");

    appendComplianceRows([makeRow("no-mirror-edit")], tmpDir);

    const rows = read();
    expect(rows).toHaveLength(2);
    expect(rows[0]!.kind).toBe("outcome");
  });

  it("writes nothing and returns false when rows is empty", () => {
    expect(appendComplianceRows([], tmpDir)).toBe(false);
    expect(fs.existsSync(statsPath())).toBe(false);
  });

  it("fails open: logs and does not throw when the write target is invalid", () => {
    // `.bkit` as a file makes the append fail.
    fs.rmSync(path.join(tmpDir, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".bkit"), "");
    const log: string[] = [];

    expect(appendComplianceRows([makeRow("no-mirror-edit")], tmpDir, (m) => log.push(m))).toBe(
      false,
    );
    expect(log.join("\n")).toContain("[bkit-comply] append failed:");
  });

  it("fails open on a row ledgers append refuses, writing nothing", () => {
    const log: string[] = [];
    const bad = { ...makeRow("no-mirror-edit"), by: { workflow: "audit", step: "close-gate" } };
    expect(appendComplianceRows([bad], tmpDir, (m) => log.push(m))).toBe(false);
    expect(log.join("\n")).toContain("[bkit-comply] append failed:");
    expect(fs.existsSync(statsPath())).toBe(false);
  });
});

describe("gradeCompliance — the grade bkit workflows close runs before its report", () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
  });
  const git = (cwd: string, ...args: string[]) =>
    spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
      cwd,
      encoding: "utf-8",
    });
  function repo(...subjects: string[]) {
    const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-grade-")));
    dirs.push(d);
    git(d, "init", "-q");
    for (const s of subjects) git(d, "commit", "-q", "--allow-empty", "-m", s);
    fs.mkdirSync(path.join(d, ".bkit"));
    return d;
  }
  const statsRows = (d: string) =>
    fs
      .readFileSync(path.join(d, ".bkit", "stats.jsonl"), "utf-8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l) as Record<string, unknown>);

  it("appends one compliance row per rule and returns the violations", () => {
    const d = repo("base", "docs(1-x): ship DONE bkit [skip ci]");
    const log: string[] = [];
    const v = gradeCompliance(d, "ship", (m) => log.push(m));
    expect(v?.map((x) => x.ruleId)).toEqual(["skip-ci-not-head"]);
    const rows = statsRows(d);
    expect(rows.map((r) => r.kind)).toEqual(["compliance", "compliance"]);
    expect(
      rows.find((r) => (r.rule as { id: string }).id === "skip-ci-not-head")?.rule,
    ).toMatchObject({ verdict: "fail" });
    expect(log.join("\n")).toContain("Compliance violations found");
  });

  it("stamps HEAD as run.parentSha and close-gate as by.step by default", () => {
    const d = repo("base", "feat(1-x): work");
    gradeCompliance(d, "build", () => undefined);
    const head = git(d, "rev-parse", "HEAD").stdout.trim();
    for (const r of statsRows(d)) {
      expect(r.run).toEqual({ parentSha: head });
      expect(r.by).toEqual({ workflow: "build", step: "close-gate" });
    }
  });

  it("stamps the given run's parentSha and step, so the rows join the close's other rows", () => {
    const d = repo("base", "feat(1-x): work");
    gradeCompliance(d, "build", () => undefined, undefined, {
      parentSha: "0123456789abcdef",
      step: "build-close-workflow",
    });
    for (const r of statsRows(d)) {
      expect(r.run).toEqual({ parentSha: "0123456789abcdef" });
      expect(r.by).toEqual({ workflow: "build", step: "build-close-workflow" });
    }
  });

  it("with a squash sha, grades from the squash's parent so earlier feature commits count", () => {
    const d = repo("base");
    git(d, "checkout", "-q", "-b", "feat");
    fs.mkdirSync(path.join(d, ".claude", "agents"), { recursive: true });
    fs.writeFileSync(path.join(d, ".claude", "agents", "x.md"), "edited\n");
    git(d, "add", "-A");
    git(d, "commit", "-qm", "feat(1-x): hand edit");
    git(d, "commit", "-q", "--allow-empty", "-m", "feat(1-x): last");
    git(d, "checkout", "-q", "-");
    git(d, "merge", "-q", "--squash", "feat");
    git(d, "commit", "-qm", "feat(1-x): squash");
    const squash = git(d, "rev-parse", "HEAD").stdout.trim();
    git(d, "checkout", "-q", "feat");
    expect(gradeCompliance(d, "ship", () => undefined)).toEqual([]);
    expect(gradeCompliance(d, "ship", () => undefined, squash)?.map((x) => x.ruleId)).toEqual([
      "no-mirror-edit",
    ]);
  });

  it("with a squash sha, reads the squash's subject, not the worktree HEAD's", () => {
    const d = repo("base");
    git(d, "checkout", "-q", "-b", "feat");
    git(d, "commit", "-q", "--allow-empty", "-m", "feat(1-x): work");
    git(d, "checkout", "-q", "-");
    git(d, "merge", "-q", "--squash", "feat");
    git(d, "commit", "-q", "--allow-empty", "-m", "feat(1-x): squash");
    const squash = git(d, "rev-parse", "HEAD").stdout.trim();
    git(d, "checkout", "-q", "feat");
    git(d, "commit", "-q", "--allow-empty", "-m", "docs(1-x): ship log [skip ci]");
    expect(gradeCompliance(d, "ship", () => undefined)?.map((x) => x.ruleId)).toEqual([
      "skip-ci-not-head",
    ]);
    expect(gradeCompliance(d, "ship", () => undefined, squash)).toEqual([]);
  });

  it("passes every rule on a clean head", () => {
    const d = repo("base", "feat(1-x): work");
    expect(gradeCompliance(d, "build", () => undefined)).toEqual([]);
    expect(statsRows(d).every((r) => (r.rule as { verdict: string }).verdict === "pass")).toBe(
      true,
    );
  });

  it("is fail-open: no commits returns null; an unwritable stats file is reported, never thrown", () => {
    expect(gradeCompliance(repo(), "build", () => undefined)).toBeNull();
    const d = repo("base", "x");
    fs.rmSync(path.join(d, ".bkit"), { recursive: true });
    fs.writeFileSync(path.join(d, ".bkit"), "");
    const log: string[] = [];
    expect(gradeCompliance(d, "build", (m) => log.push(m))).toEqual([]);
    expect(log.join("\n")).toContain("[bkit-comply] append failed");
  });
});
