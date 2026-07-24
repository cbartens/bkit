// bkit-skip-ci-subject-audit.test.ts — §6d skip-ci subject-convention audit
// (#341 T12, Derived Test Matrix row 12).
//
// D5(a) (the chosen shape-A mode-3 transport) closes design/plan via a PR
// merge. A phase-close (or intermediate status-commit) subject that still
// carried `[skip ci]` would surface as the PR title/merge subject and be
// rejected by the pre-existing PR-title CI-suppression assertion (the same
// assertion build/ship already enforce) — so §6d drops the token from every
// phase-close AND intermediate status-commit subject across all five phase
// workflows, not just design/plan (a docs-only close now fires full CI on
// `dev` — a knowing, human-gated cost reversal, OQ-D).
//
// This test asserts the convention landed coherently:
//   (i)   no phase-close or intermediate status-commit subject in
//         `.bkit/workflows/*.md` carries `[skip ci]` (Failure Path ABORT
//         commits are explicitly exempt — out of §6d's scope, their subject
//         never becomes a PR title).
//   (ii)  no `.bkit/workflows/*.md` prose still claims a docs-close is
//         "pushed with 'bkit [skip ci]'" (the stale pre-D5(a) description).
//   (iii) the `bkit-ship.md` HEAD-skip-ci gate + `AHEAD_NON_SKIP`
//         promotion-lag counter are re-audited to hold their intended
//         meaning under the new subject convention — present, and their
//         surrounding prose does not contradict the new convention.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const WORKFLOWS_DIR = path.resolve(REPO_ROOT, ".bkit/workflows");

const WORKFLOW_FILES = [
  "bkit-design.md",
  "bkit-plan.md",
  "bkit-build.md",
  "bkit-debug.md",
  "bkit-ship.md",
] as const;

function readWorkflow(name: string): string {
  return fs.readFileSync(path.join(WORKFLOWS_DIR, name), "utf-8");
}

// Named, non-Failure-Path commit subjects that §6d requires to be skip-token
// free (T12 body: phase-close subjects + the six named intermediate
// status-commit subjects). Each entry is [file, description, forbidden
// literal that MUST NOT appear anymore].
const RECONCILED_SUBJECTS: Array<{
  file: (typeof WORKFLOW_FILES)[number];
  description: string;
  stale: string;
}> = [
  {
    file: "bkit-design.md",
    description: "design phase-close subject",
    stale: "design DONE bkit [skip ci]",
  },
  {
    file: "bkit-design.md",
    description: "design summary intermediate commit",
    stale: "summary bkit [skip ci]",
  },
  {
    file: "bkit-plan.md",
    description: "plan phase-close subject",
    stale: "plan DONE bkit [skip ci]",
  },
  {
    file: "bkit-plan.md",
    description: "plan summary intermediate commit",
    stale: "summary bkit [skip ci]",
  },
  {
    file: "bkit-build.md",
    description: "build worktree-setup intermediate commit",
    stale: "worktree-setup bkit [skip ci]",
  },
  {
    file: "bkit-ship.md",
    description: "ship phase-close subject",
    stale: "ship DONE bkit [skip ci]",
  },
  {
    file: "bkit-ship.md",
    description: "ship pre-worktree intermediate commit",
    stale: "pre-worktree uncommitted changes bkit [skip ci]",
  },
  {
    file: "bkit-ship.md",
    description: "ship pre-merge intermediate commit",
    stale: "pre-merge uncommitted dev changes bkit [skip ci]",
  },
];

// Failure Path ABORT commit subjects are explicitly OUT of §6d's scope (a
// terminated run's abort commit never becomes a PR title) — asserted here
// as a living exemption list, not silently ignored.
const FAILURE_PATH_EXEMPT_SUBJECTS: Array<{
  file: (typeof WORKFLOW_FILES)[number];
  literal: string;
}> = [
  { file: "bkit-build.md", literal: "build aborted bkit [skip ci]" },
  { file: "bkit-debug.md", literal: "debug aborted bkit [skip ci]" },
  { file: "bkit-ship.md", literal: "ship aborted bkit [skip ci]" },
  { file: "bkit-ship.md", literal: "ship FAILED bkit [skip ci]" },
];

describe("bkit-skip-ci-subject-audit (#341 T12, row 12)", () => {
  describe("(i) no phase-close / intermediate status-commit subject carries [skip ci]", () => {
    for (const { file, description, stale } of RECONCILED_SUBJECTS) {
      it(`${file}: ${description} no longer carries [skip ci]`, () => {
        const content = readWorkflow(file);
        expect(content.includes(stale)).toBe(false);
      });
    }
  });

  it("Failure Path ABORT commits are still explicitly skip-ci (out of §6d's scope) — exemption list stays accurate", () => {
    for (const { file, literal } of FAILURE_PATH_EXEMPT_SUBJECTS) {
      const content = readWorkflow(file);
      expect(content.includes(literal)).toBe(true);
    }
  });

  describe("(ii) no prose still claims a docs-close is \"pushed with 'bkit [skip ci]'\"", () => {
    const STALE_CLAIM_RE = /pushed with `?bkit \[skip ci\]`?/i;
    for (const file of WORKFLOW_FILES) {
      it(`${file}: no stale "pushed with bkit [skip ci]" claim`, () => {
        const content = readWorkflow(file);
        expect(STALE_CLAIM_RE.test(content)).toBe(false);
      });
    }
  });

  describe("(iii) bkit-ship.md HEAD-skip-ci gate + AHEAD_NON_SKIP counter re-audited coherent", () => {
    const shipMd = readWorkflow("bkit-ship.md");

    it("the PR-title CI-suppression assertion (Merge PR gate) is still present", () => {
      expect(shipMd).toContain("HEAD on remote does NOT contain");
      expect(shipMd).toMatch(/PR-title assertion FAILED/);
    });

    it("the AHEAD_NON_SKIP promotion-lag counter is still present and documented", () => {
      expect(shipMd).toContain("AHEAD_NON_SKIP");
      // Documents (not silently drops) that under the new convention every
      // ahead commit now counts as non-skip — the warning simplifies to
      // "any ahead commits trigger it", which is coherent, not broken: the
      // counter's job (flag unreconciled local-ahead-of-origin drift before
      // the phase-close push) still holds under the new subject convention.
      expect(shipMd).toContain("no `[skip ci]`");
    });

    it("the ship close-workflow Gate 13 checklist item reflects the new convention (no bare 'pushed with bkit [skip ci]')", () => {
      expect(shipMd).toMatch(/Changes pushed to `dev` \(no `\[skip ci\]`/);
    });
  });

  it("design + plan phase-close subject prose documents the CI-cost reversal (OQ-D) at the status-branch declaration", () => {
    for (const file of ["bkit-design.md", "bkit-plan.md"] as const) {
      const content = readWorkflow(file);
      expect(content).toMatch(/knowing CI-cost reversal/);
      expect(content).toMatch(/§6d\/OQ-D/);
    }
  });
});
