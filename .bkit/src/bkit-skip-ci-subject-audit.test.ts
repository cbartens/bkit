// bkit-skip-ci-subject-audit.test.ts — CI-suppression token convention audit.
//
// Two DIFFERENT things get conflated, and conflating them breaks things in
// both directions:
//
//   1. A deliberate `bkit [skip ci]` in a docs-only commit SUBJECT. This is
//      the CI-minutes convention (`.agents/rules.md` § Docs-only commits) and
//      it must STAY. Stripping it makes every phase close fire a full CI run
//      on `dev` for a docs-only change — and breaks `bkit-ship.md`'s
//      `AHEAD_NON_SKIP` promotion-lag guard, which hard-exits the ship when a
//      commit ahead of `origin/dev` lacks the token. Ship's own Step 2
//      pre-flight creates exactly such a commit.
//
//   2. A token INHERITED into a squash-merge BODY. `gh pr merge` and the MCP
//      merge tool default the body to the head branch's concatenated commit
//      subjects, so one intermediate `[skip ci]` silently suppresses CI on a
//      shared branch. That is the real defect; the guards are an explicit
//      `--body ""` at every merge call site plus a post-close scan of the
//      landed commit's BODY (subject excluded).
//
// Both halves are asserted here, and the ship interaction is pinned in (iv)
// so the convention cannot be swept away again without a red test.

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

// Docs-only / intermediate commit subjects that MUST carry the token. Each
// entry is the exact `-m "..."` literal the workflow issues.
const SKIP_CI_SUBJECTS: Array<{
  file: (typeof WORKFLOW_FILES)[number];
  description: string;
  literal: string;
}> = [
  {
    file: "bkit-design.md",
    description: "design phase-close",
    literal: "docs({FID}): design DONE bkit [skip ci]",
  },
  {
    file: "bkit-design.md",
    description: "design summary",
    literal: "chore({FID}): summary bkit [skip ci]",
  },
  {
    file: "bkit-plan.md",
    description: "plan phase-close",
    literal: "docs({FID}): plan DONE bkit [skip ci]",
  },
  {
    file: "bkit-plan.md",
    description: "plan summary",
    literal: "chore({FID}): summary bkit [skip ci]",
  },
  {
    file: "bkit-build.md",
    description: "build worktree-setup",
    literal: "chore({FID}): worktree-setup bkit [skip ci]",
  },
  {
    file: "bkit-ship.md",
    description: "ship phase-close",
    literal: "docs({FID}): ship DONE bkit [skip ci]",
  },
  {
    file: "bkit-ship.md",
    description: "ship pre-worktree dirty-tree commit",
    literal: "chore({FID}): pre-worktree uncommitted changes bkit [skip ci]",
  },
  {
    file: "bkit-design.md",
    description: "design pre-worktree dirty-tree commit",
    literal: "chore({FID}): pre-worktree uncommitted changes bkit [skip ci]",
  },
  {
    file: "bkit-plan.md",
    description: "plan pre-worktree dirty-tree commit",
    literal: "chore({FID}): pre-worktree uncommitted changes bkit [skip ci]",
  },
  {
    file: "bkit-build.md",
    description: "build pre-worktree dirty-tree commit",
    literal: "chore({FID}): pre-worktree uncommitted changes bkit [skip ci]",
  },
  {
    file: "bkit-ship.md",
    description: "ship pre-merge dirty-dev commit",
    literal: "chore: pre-merge uncommitted dev changes bkit [skip ci]",
  },
  // Failure Path aborts.
  {
    file: "bkit-build.md",
    description: "build abort",
    literal: "docs({FID}): build aborted bkit [skip ci]",
  },
  {
    file: "bkit-debug.md",
    description: "debug abort",
    literal: "docs({FID}): debug aborted bkit [skip ci]",
  },
  {
    file: "bkit-ship.md",
    description: "ship abort",
    literal: "docs({FID}): ship aborted bkit [skip ci]",
  },
  {
    file: "bkit-ship.md",
    description: "ship FAILED",
    literal: "chore({FID}): ship FAILED bkit [skip ci]",
  },
];

const SKIP_TOKEN_RE = /\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]/i;

describe("skip-ci subject convention", () => {
  describe("(i) docs-only and intermediate commit subjects keep the token", () => {
    for (const { file, description, literal } of SKIP_CI_SUBJECTS) {
      it(`${file}: ${description} carries bkit [skip ci]`, () => {
        expect(readWorkflow(file)).toContain(`-m "${literal}"`);
      });
    }
  });

  describe("(ii) no PR title ever carries a suppression token", () => {
    for (const file of WORKFLOW_FILES) {
      it(`${file}: every gh pr create --title is token-free`, () => {
        const titles = [...readWorkflow(file).matchAll(/--title\s+"([^"]*)"/g)].map((m) => m[1]);
        for (const t of titles) {
          expect(SKIP_TOKEN_RE.test(t), `PR title must not suppress CI: ${t}`).toBe(false);
        }
      });
    }
  });

  describe("(iii) every squash merge passes an explicit empty body", () => {
    // Only real invocations inside ```bash fences — the gh→MCP header prose
    // names `gh pr merge` as a mapping key, which is not a call site.
    function bashMergeInvocations(content: string): string[] {
      const fences = [...content.matchAll(/```bash\n([\s\S]*?)```/g)].map((m) => m[1]);
      return fences
        .map((f) => f.replace(/\\\n\s*/g, " "))
        .flatMap((f) => [...f.matchAll(/^\s*gh pr merge[^\n]*/gm)].map((m) => m[0]));
    }

    for (const file of WORKFLOW_FILES) {
      it(`${file}: no gh pr merge relies on the default concatenated body`, () => {
        for (const m of bashMergeInvocations(readWorkflow(file))) {
          expect(m, `gh pr merge must pass an explicit --body: ${m}`).toMatch(/--body\s+""/);
        }
      });
    }
  });

  describe("(iv) ship's AHEAD_NON_SKIP guard stays satisfiable", () => {
    const shipMd = readWorkflow("bkit-ship.md");

    it("the promotion-lag guard is present", () => {
      expect(shipMd).toContain("AHEAD_NON_SKIP");
    });

    // Regression pin: Step 2 commits on local `dev` without pushing, and
    // Step 9 hard-exits when a commit ahead of origin/dev lacks the token.
    // Drop the token from that subject and every ship with a dirty `dev`
    // aborts. These two sites must agree.
    it("the pre-merge dirty-dev commit it must tolerate carries the token", () => {
      expect(shipMd).toContain('-m "chore: pre-merge uncommitted dev changes bkit [skip ci]"');
    });

    it("the guard greps for the same token the commit carries", () => {
      expect(shipMd).toContain("git log --format=%s origin/dev..dev | grep -cv '\\[skip ci\\]'");
    });
  });

  describe("(v) the post-close scan reads the body, not the subject", () => {
    const sh = fs.readFileSync(path.resolve(REPO_ROOT, ".bkit/scripts/bkit-runtime.sh"), "utf-8");

    it("bkit_close_guard_scan_body strips the subject line before scanning", () => {
      expect(sh).toContain("tail -n +2");
    });
  });
});
