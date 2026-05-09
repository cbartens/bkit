// bar-155-regression.test.ts — Regression tests for BAR-155 workflow friction
// optimisation. Each test targets a specific finding from the build challenge:
//
//   HIGH-1: bkit-ship.md sentinel mkdir-p must precede touch in rebase-failed branch
//   HIGH-2: bkit-build-plan-verify.md ## Gaps Identified must be the last ## section
//           (so EOF echo-append lands there, not in ## Notes)
//   HIGH-3: bkit-build.md gate-checkbox step references must match actual step headers
//   MEDIUM-4: bkit-build.md long-branch advisory uses explicit mb variable (not inline
//             subshell), so empty merge-base yields "unknown" not HEAD age
//   MEDIUM-7: bkit-ship.md sentinel cleanup — rm -f .rebase-failed must appear in
//             both the worktree-resume path AND the Failure Path step 1
//   SC-4: bkit-ship.md bare "exit 1" on rebase gone; sentinel pattern is canonical
//   SC-5: bkit-build.md long-branch advisory line present
//   BLOCK/WARN guard: challenge/reconcile prompts must not contain BLOCK or WARN
//   Parallel-pair guard: bkit-build-challenge-1/2 must contain "Parallel:" guard

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

// ---------------------------------------------------------------------------
// Paths (resolved relative to repo root, matching templates.test.ts convention)
// ---------------------------------------------------------------------------

const REPO_ROOT = path.resolve(__dirname, "../..");

const BKIT_SHIP = path.join(REPO_ROOT, ".agents/workflows/bkit-ship.md");
const BKIT_BUILD = path.join(REPO_ROOT, ".agents/workflows/bkit-build.md");
const PLAN_VERIFY = path.join(REPO_ROOT, ".agents/prompts/bkit-build-plan-verify.md");
const CHALLENGE_1 = path.join(REPO_ROOT, ".agents/prompts/bkit-build-challenge-1.md");
const CHALLENGE_2 = path.join(REPO_ROOT, ".agents/prompts/bkit-build-challenge-2.md");
const CHALLENGE_RECONCILE = path.join(
  REPO_ROOT,
  ".agents/prompts/bkit-build-challenge-reconcile.md",
);

// ---------------------------------------------------------------------------
// HIGH-1 — sentinel mkdir-p must precede touch in rebase-failure branch
// ---------------------------------------------------------------------------

describe("bkit-ship.md — HIGH-1: mkdir-p precedes touch .rebase-failed (BAR-155)", () => {
  let content: string;
  content = fs.readFileSync(BKIT_SHIP, "utf-8");
  const lines = content.split("\n");

  it("mkdir -p .../logs/{FID}/ appears before touch .rebase-failed in rebase-failure branch", () => {
    // Both lines must be present
    const mkdirLine = lines.findIndex(
      (l) => l.includes("mkdir -p") && l.includes("docs/plans/logs/{FID}") && l.includes("/"),
    );
    const touchLine = lines.findIndex((l) => l.includes("touch") && l.includes(".rebase-failed"));
    expect(mkdirLine, "mkdir -p line not found in bkit-ship.md").toBeGreaterThan(-1);
    expect(touchLine, "touch .rebase-failed line not found in bkit-ship.md").toBeGreaterThan(-1);
    // mkdir must come BEFORE touch — this is the regression guard
    expect(mkdirLine).toBeLessThan(touchLine);
  });

  it("mkdir -p and touch are in the rebase-failure branch (mkdir is the line immediately before touch)", () => {
    // The fix landed mkdir -p and touch as consecutive lines inside the rebase-failure if-block.
    // Find the touch line, then assert the line immediately before it (or very close) contains mkdir -p.
    const touchIdx = lines.findIndex((l) => l.includes("touch") && l.includes(".rebase-failed"));
    expect(touchIdx).toBeGreaterThan(-1);
    // Check lines within 2 lines before touch for the mkdir -p
    const nearbyLines = lines.slice(Math.max(0, touchIdx - 3), touchIdx);
    const hasMkdir = nearbyLines.some(
      (l) => l.includes("mkdir -p") && l.includes("docs/plans/logs/{FID}"),
    );
    expect(hasMkdir).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// HIGH-2 — ## Gaps Identified must be the LAST ## section in plan-verify output
// ---------------------------------------------------------------------------

describe("bkit-build-plan-verify.md — HIGH-2: ## Gaps Identified is last section (BAR-155)", () => {
  let content: string;
  content = fs.readFileSync(PLAN_VERIFY, "utf-8");

  it("## Gaps Identified section exists in the Output format block", () => {
    expect(content).toContain("## Gaps Identified");
  });

  it("## Gaps Identified appears AFTER ## Notes in the Output format", () => {
    const lines = content.split("\n");
    // Find the last occurrence of each section header (they appear in the Output format block)
    const notesIdx =
      lines
        .map((l, i) => ({ l, i }))
        .filter(({ l }) => l.trim() === "## Notes")
        .map(({ i }) => i)
        .pop() ?? -1;
    const gapsIdx =
      lines
        .map((l, i) => ({ l, i }))
        .filter(({ l }) => l.trim() === "## Gaps Identified")
        .map(({ i }) => i)
        .pop() ?? -1;

    expect(notesIdx, "## Notes not found in bkit-build-plan-verify.md").toBeGreaterThan(-1);
    expect(gapsIdx, "## Gaps Identified not found in bkit-build-plan-verify.md").toBeGreaterThan(
      -1,
    );
    // Regression guard: ## Gaps Identified must come AFTER ## Notes
    // (so EOF echo-append lands in Gaps Identified, not Notes)
    expect(gapsIdx).toBeGreaterThan(notesIdx);
  });

  it("no ## section header appears after ## Gaps Identified in the Output format block", () => {
    const lines = content.split("\n");
    // Find the last ## Gaps Identified
    const gapsIdx =
      lines
        .map((l, i) => ({ l, i }))
        .filter(({ l }) => l.trim() === "## Gaps Identified")
        .map(({ i }) => i)
        .pop() ?? -1;
    expect(gapsIdx).toBeGreaterThan(-1);

    // After the last ## Gaps Identified there must be no other ## section header
    // (only the closing ``` and stop directive follow)
    const remainingLines = lines.slice(gapsIdx + 1);
    const laterSections = remainingLines.filter(
      (l) => /^## [A-Z]/.test(l.trim()) && !l.trim().startsWith("##\n"),
    );
    expect(laterSections).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// HIGH-3 — gate-checkbox "Issue comment attempted" references must match step headers
// ---------------------------------------------------------------------------

describe("bkit-build.md — HIGH-3: gate checkpoint step refs match step headers (BAR-155)", () => {
  let content: string;
  content = fs.readFileSync(BKIT_BUILD, "utf-8");

  it("Gate 14 Issue-comment checkpoint references Step 14 (not Step 13)", () => {
    // Find the Gate 14 block
    expect(content).toContain("Gate 14");
    // The issue-comment checkpoint inside Gate 14 must say "Step 14"
    // Approach: extract substring around Gate 14 and check
    const gate14Start = content.indexOf("Gate 14");
    const gate14End = content.indexOf("---", gate14Start);
    const gate14Block = content.slice(gate14Start, gate14End);
    expect(gate14Block).toContain("Step 14");
    expect(gate14Block).not.toContain("Step 13` section");
  });

  it("Gate 15 Issue-comment checkpoint references Step 15 (not Step 14)", () => {
    const gate15Start = content.indexOf("Gate 15");
    const gate15End = content.indexOf("---", gate15Start);
    const gate15Block = content.slice(gate15Start, gate15End);
    expect(gate15Block).toContain("Step 15");
    expect(gate15Block).not.toContain("Step 14` section");
  });

  it("Gate 16 Issue-comment checkpoint references Step 16 (not Step 15)", () => {
    const gate16Start = content.indexOf("Gate 16");
    const gate16End = content.indexOf("---", gate16Start);
    const gate16Block = content.slice(gate16Start, gate16End);
    expect(gate16Block).toContain("Step 16");
    expect(gate16Block).not.toContain("Step 15` section");
  });

  it("Gate 17 Issue-comment checkpoint references Step 17 (not Step 16)", () => {
    const gate17Start = content.indexOf("Gate 17");
    const gate17End = content.indexOf("---", gate17Start);
    const gate17Block = content.slice(gate17Start, gate17End);
    expect(gate17Block).toContain("Step 17");
    expect(gate17Block).not.toContain("Step 16` section");
  });

  it("step inventory is monotonic 1..18 (all 18 step headers present)", () => {
    // Verify Steps 1 through 18 all have a top-level ## Step N header
    for (let n = 1; n <= 18; n++) {
      expect(content, `Step ${n} header missing`).toMatch(new RegExp(`## [^#]*Step ${n} —`));
    }
  });

  it("no ## Step N header exists for N > 18 (no phantom renumber)", () => {
    // No Step 19 or higher
    expect(content).not.toMatch(/## [^#]*Step 19 —/);
    expect(content).not.toMatch(/## [^#]*Step 20 —/);
  });
});

// ---------------------------------------------------------------------------
// MEDIUM-4 — long-branch advisory uses explicit mb variable (not inline subshell)
// ---------------------------------------------------------------------------

describe("bkit-build.md — MEDIUM-4: long-branch advisory explicit mb variable (BAR-155)", () => {
  let content: string;
  content = fs.readFileSync(BKIT_BUILD, "utf-8");

  it("contains the explicit mb=$(git merge-base …) variable capture pattern", () => {
    // The fix replaced inline `$(git merge-base ...)` inside age=$(...) with an explicit mb= var
    expect(content).toMatch(/mb=\$\(git merge-base HEAD origin\/dev/);
  });

  it("age= assignment references the mb variable (not inline merge-base subshell)", () => {
    // After the fix, age= must use "$mb" (explicit var) not a new git merge-base subshell
    // Pattern: age=$([ -n "$mb" ] && ... "$mb" ...)
    expect(content).toMatch(/age=\$\(.*"\$mb"/);
  });

  it("long-branch advisory echo line is present with correct format", () => {
    expect(content).toContain(
      'echo "[bkit-build] feature branch is ${behind} commits behind dev / ${age} since divergence"',
    );
  });

  it("behind= uses git rev-list --count HEAD..origin/dev", () => {
    expect(content).toMatch(/behind=\$\(git rev-list --count HEAD\.\.origin\/dev/);
  });
});

// ---------------------------------------------------------------------------
// MEDIUM-7 — sentinel cleanup: rm -f .rebase-failed in both resume path and Failure Path
// ---------------------------------------------------------------------------

describe("bkit-ship.md — MEDIUM-7: sentinel cleanup in resume and Failure Path (BAR-155)", () => {
  let content: string;
  content = fs.readFileSync(BKIT_SHIP, "utf-8");

  it("rm -f .rebase-failed appears at least twice (resume path + Failure Path)", () => {
    const occurrences = (content.match(/rm -f.*\.rebase-failed/g) ?? []).length;
    expect(occurrences).toBeGreaterThanOrEqual(2);
  });

  it("rm -f .rebase-failed appears in the worktree-resume path (before touch)", () => {
    const lines = content.split("\n");
    const rmLine = lines.findIndex((l) => l.includes("rm -f") && l.includes(".rebase-failed"));
    const touchLine = lines.findIndex((l) => l.includes("touch") && l.includes(".rebase-failed"));
    // The cleanup rm must appear BEFORE the touch (clears stale sentinel before writing new one)
    expect(rmLine).toBeGreaterThan(-1);
    expect(touchLine).toBeGreaterThan(-1);
    expect(rmLine).toBeLessThan(touchLine);
  });

  it("rm -f .rebase-failed appears in the Failure Path step 1 bash block", () => {
    // The Failure Path begins with "## 🤖 Failure Path"
    const failurePathStart = content.indexOf("Failure Path");
    expect(failurePathStart).toBeGreaterThan(-1);
    const failurePathContent = content.slice(failurePathStart);
    expect(failurePathContent).toMatch(/rm -f.*\.rebase-failed/);
  });
});

// ---------------------------------------------------------------------------
// SC-4 — bare "exit 1" on rebase gone; REBASE_FAILED env-var pattern gone
// ---------------------------------------------------------------------------

describe("bkit-ship.md — SC-4: bare exit 1 on rebase removed (BAR-155)", () => {
  let content: string;
  content = fs.readFileSync(BKIT_SHIP, "utf-8");

  it("does NOT contain the old bare rebase-failure exit pattern", () => {
    expect(content).not.toContain("Rebase conflict — resolve manually");
  });

  it("does NOT contain REBASE_FAILED env-var pattern (sentinel file is canonical)", () => {
    expect(content).not.toContain("REBASE_FAILED");
  });

  it("sentinel file .rebase-failed appears at least twice (touch + check)", () => {
    const hits = (content.match(/\.rebase-failed/g) ?? []).length;
    expect(hits).toBeGreaterThanOrEqual(2);
  });

  it("sentinel touch is inside an if ! git rebase block (not bare)", () => {
    // The new pattern: if ! git rebase origin/dev; then ... touch .rebase-failed
    expect(content).toMatch(/if ! git rebase origin\/dev/);
  });

  it("Failure Path step 4 prose references the rebase sentinel for handover routing", () => {
    // The Failure Path step 4 prose must reference the rebase-failed sentinel.
    // The implementation uses prose "rebase failure sentinel" (not a bash [ -e ] check).
    expect(content).toMatch(/rebase failure sentinel/);
  });
});

// ---------------------------------------------------------------------------
// SC-5 — long-branch advisory present in Step 1
// ---------------------------------------------------------------------------

describe("bkit-build.md — SC-5: long-branch advisory present (BAR-155)", () => {
  let content: string;
  content = fs.readFileSync(BKIT_BUILD, "utf-8");

  it("long-branch advisory echo line exists in the file", () => {
    expect(content).toContain("[bkit-build] feature branch is");
  });

  it("long-branch advisory is in Step 1 (not a later step)", () => {
    const step1Start = content.indexOf("## 🤖 Step 1 — Start Workflow");
    const step2Start = content.indexOf("## 🤖 Step 2 — Worktree Setup");
    expect(step1Start).toBeGreaterThan(-1);
    expect(step2Start).toBeGreaterThan(step1Start);

    const step1Block = content.slice(step1Start, step2Start);
    expect(step1Block).toContain("[bkit-build] feature branch is");
  });
});

// ---------------------------------------------------------------------------
// BLOCK/WARN terminology guard — challenge prompts must not contain BLOCK or WARN
// ---------------------------------------------------------------------------

describe("bkit-build-challenge-*.md — no BLOCK/WARN terminology (BAR-155)", () => {
  it("bkit-build-challenge-1.md contains no BLOCK or WARN severity terms", () => {
    const content = fs.readFileSync(CHALLENGE_1, "utf-8");
    // Strip frontmatter (between first --- delimiters) before checking
    const bodyStart = content.indexOf("---", 3);
    const body = content.slice(bodyStart);
    // Must not contain BLOCK or WARN as severity keywords
    expect(body).not.toMatch(/\bBLOCK\b/);
    expect(body).not.toMatch(/\bWARN\b/);
  });

  it("bkit-build-challenge-2.md contains no BLOCK or WARN severity terms", () => {
    const content = fs.readFileSync(CHALLENGE_2, "utf-8");
    const bodyStart = content.indexOf("---", 3);
    const body = content.slice(bodyStart);
    expect(body).not.toMatch(/\bBLOCK\b/);
    expect(body).not.toMatch(/\bWARN\b/);
  });

  it("bkit-build-challenge-reconcile.md contains no BLOCK or WARN severity terms", () => {
    const content = fs.readFileSync(CHALLENGE_RECONCILE, "utf-8");
    const bodyStart = content.indexOf("---", 3);
    const body = content.slice(bodyStart);
    expect(body).not.toMatch(/\bBLOCK\b/);
    expect(body).not.toMatch(/\bWARN\b/);
  });

  it("bkit-build-challenge-1.md uses canonical CRITICAL/HIGH/MEDIUM/LOW severity ladder", () => {
    const content = fs.readFileSync(CHALLENGE_1, "utf-8");
    expect(content).toContain("CRITICAL/HIGH/MEDIUM/LOW");
  });

  it("bkit-build-challenge-reconcile.md uses canonical PASS/CONCERNS/FAIL verdict ladder", () => {
    const content = fs.readFileSync(CHALLENGE_RECONCILE, "utf-8");
    expect(content).toContain("PASS");
    expect(content).toContain("CONCERNS");
    expect(content).toContain("FAIL");
  });
});

// ---------------------------------------------------------------------------
// Parallel-pair guard — bkit-build-challenge-1 and -2 must contain "Parallel:" guard
// ---------------------------------------------------------------------------

describe("bkit-build-challenge-*.md — parallel-pair circular-reasoning guard (BAR-155)", () => {
  it("bkit-build-challenge-1.md contains Parallel: guard in Contract block", () => {
    const content = fs.readFileSync(CHALLENGE_1, "utf-8");
    expect(content).toContain("Parallel:");
  });

  it("bkit-build-challenge-2.md contains Parallel: guard in Contract block", () => {
    const content = fs.readFileSync(CHALLENGE_2, "utf-8");
    expect(content).toContain("Parallel:");
  });

  it("bkit-build-challenge-1.md frontmatter has effort: high and model: claude-opus-4-7", () => {
    const content = fs.readFileSync(CHALLENGE_1, "utf-8");
    const frontmatterEnd = content.indexOf("---", 3);
    const frontmatter = content.slice(0, frontmatterEnd);
    expect(frontmatter).toContain("effort: high");
    expect(frontmatter).toContain("model: claude-opus-4-7");
  });

  it("bkit-build-challenge-2.md frontmatter has effort: medium and model: claude-sonnet-4-6", () => {
    const content = fs.readFileSync(CHALLENGE_2, "utf-8");
    const frontmatterEnd = content.indexOf("---", 3);
    const frontmatter = content.slice(0, frontmatterEnd);
    expect(frontmatter).toContain("effort: medium");
    expect(frontmatter).toContain("model: claude-sonnet-4-6");
  });

  it("bkit-build-challenge-1.md and -2.md bodies are identical (only frontmatter differs)", () => {
    const content1 = fs.readFileSync(CHALLENGE_1, "utf-8");
    const content2 = fs.readFileSync(CHALLENGE_2, "utf-8");
    // Extract body (after closing --- of frontmatter)
    const body1 = content1.slice(content1.indexOf("---", 3) + 3).trim();
    const body2 = content2.slice(content2.indexOf("---", 3) + 3).trim();
    expect(body1).toBe(body2);
  });
});

// ---------------------------------------------------------------------------
// Deleted file guard — bkit-build-challenge.md (no suffix) must NOT exist
// ---------------------------------------------------------------------------

describe("bkit-build-challenge.md (no suffix) — must be deleted (BAR-155)", () => {
  it("the legacy single-reviewer bkit-build-challenge.md file does not exist", () => {
    const legacyPath = path.join(REPO_ROOT, ".agents/prompts/bkit-build-challenge.md");
    expect(fs.existsSync(legacyPath)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Fix 1b — freeform stub-first directive in challenge-1/-2 and plan-verify
// ---------------------------------------------------------------------------

describe("Fix 1b — echo >> stub-first directive present (BAR-155)", () => {
  it("bkit-build-challenge-1.md Process step contains echo {finding} >> {output} directive", () => {
    const content = fs.readFileSync(CHALLENGE_1, "utf-8");
    expect(content).toContain("echo {finding} >> {output}");
  });

  it("bkit-build-challenge-2.md Process step contains echo {finding} >> {output} directive", () => {
    const content = fs.readFileSync(CHALLENGE_2, "utf-8");
    expect(content).toContain("echo {finding} >> {output}");
  });

  it("bkit-build-plan-verify.md Process step contains echo {finding} >> {output} directive", () => {
    const content = fs.readFileSync(PLAN_VERIFY, "utf-8");
    expect(content).toContain("echo {finding} >> {output}");
  });
});
