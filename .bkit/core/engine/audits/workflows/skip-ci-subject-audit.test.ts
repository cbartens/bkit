// audits/workflows/skip-ci-subject-audit.test.ts — CI-suppression token convention audit.
//
// Two different things:
//
//   1. A `bkit [skip ci]` in a docs-only commit SUBJECT: the CI-minutes convention
//      (`.agents/rules.md` § Docs commits), present on every listed subject. Ship's
//      promotion-lag guard (`bkit branches switch`) stops for a human when a local
//      `dev` commit ahead of `origin/dev` lacks the token; ship's own bookkeeping
//      commit carries it.
//
//   2. A token INHERITED into a squash-merge BODY (`gh pr merge` and the MCP merge
//      tool default the body to the head branch's concatenated commit subjects). The
//      guards are an explicit `--body ""` at every merge call site plus a post-close
//      scan of the landed commit's BODY (subject excluded).
//
// Both halves are asserted here; the ship interaction is pinned in (iv).

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
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
    description: "ship bookkeeping",
    literal: "docs({FID}): ship bookkeeping bkit [skip ci]",
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
  // Ship has no separate abort subject: its Failure Path flushes ONE commit,
  // so the handover rides the `ship FAILED` commit rather than a second
  // `ship aborted` push onto feat/{FID}.
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
        // Bookkeeping commits route through `bkit ledgers commit` / `bkit
        // steps done`, which take the subject as `--message="..."` rather than
        // a literal `git commit -m "..."`; either carrier is a legitimate
        // match for the same invariant.
        const content = readWorkflow(file);
        const carriesLiteral =
          content.includes(`-m "${literal}"`) || content.includes(`--message="${literal}"`);
        expect(carriesLiteral).toBe(true);
      });
    }
  });

  describe("(ii) no PR title ever carries a suppression token", () => {
    // Matches `bkit prs open --title="..."` and `gh pr edit --title "..."` alike.
    const titlesOf = (file: string) =>
      [...readWorkflow(file).matchAll(/--title(?:=|\s+)"([^"]*)"/g)].map((m) => m[1]);

    it("the title scan finds the PR titles (non-vacuous guard)", () => {
      expect(WORKFLOW_FILES.flatMap(titlesOf).length).toBeGreaterThanOrEqual(WORKFLOW_FILES.length);
    });

    for (const file of WORKFLOW_FILES) {
      it(`${file}: every PR --title is token-free`, () => {
        const titles = titlesOf(file);
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

  describe("(iv) ship's promotion-lag guard stays satisfiable", () => {
    // The guard itself (refuse to push local dev commits that would run CI)
    // lives in `bkit branches switch`; commands/workflow/branches.test.ts
    // covers both the all-skip-CI push and the stop-for-a-human case. What
    // stays here is that ship actually goes through it, after writing its
    // bookkeeping commit with the token — (i) pins the subject.
    const shipMd = readWorkflow("bkit-ship.md");

    it("ship switches to dev through bkit branches switch", () => {
      expect(shipMd).toMatch(/"\$BKIT" branches switch --fid=/);
    });
  });
});
