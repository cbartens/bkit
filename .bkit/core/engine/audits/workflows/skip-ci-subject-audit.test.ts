// audits/workflows/skip-ci-subject-audit.test.ts — CI-suppression token convention audit.
//
// Two different things:
//
//   1. A `bkit [skip ci]` in a docs-only commit SUBJECT: the CI-minutes convention
//      (`.agents/rules.md` § Docs commits), present on every listed subject. Ship
//      never pushes local `dev` (`bkit branches sync-dev` only fast-forwards it),
//      so a local commit's token never decides whether CI runs.
//
//   2. A token INHERITED into a squash-merge BODY (`bkit prs merge` and the MCP merge
//      tool default the body to the head branch's concatenated commit subjects). The
//      guards are an explicit `--body ""` at every merge call site plus a post-close
//      scan of the landed commit's BODY (subject excluded).
//
// Both halves are asserted here; the ship interaction is pinned in (iv).

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { getWorkflowsRoot } from "../../shared/package-roots";

const WORKFLOWS_DIR = getWorkflowsRoot();

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
    description: "design summary",
    literal: "chore({FID}): summary bkit [skip ci]",
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
];

// Subjects a command writes itself — the close / land / abort / flush commits —
// pinned in the command's source, keyed by file. `${...}` is the template slot.
const COMMAND_SUBJECTS: Array<{ source: string; description: string; literal: string }> = [
  {
    source: "commands/workflow/branches.ts",
    description: "design / plan phase-close (branches land)",
    literal: "docs(${o.fid}): ${o.workflow} DONE bkit [skip ci]",
  },
  {
    source: "commands/workflow/workflows.ts",
    description: "ship phase-close (workflows close --flush)",
    literal: "docs(${o.fid}): ship DONE bkit [skip ci]",
  },
  {
    source: "commands/workflow/workflows.ts",
    description: "build / debug abort (workflows handover --push)",
    literal: "docs(${fid}): ${workflow} aborted bkit [skip ci]",
  },
  {
    source: "commands/workflow/workflows.ts",
    description: "FAILED record landed on dev (workflows handover --flush / --push from dev)",
    literal: "chore(${o.fid}): ${o.workflow} FAILED bkit [skip ci]",
  },
];

const SKIP_TOKEN_RE = /\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]/i;

/** True when the workflow passes `literal` as a `-m` or `--message=` subject. */
function carriesSubject(content: string, literal: string): boolean {
  return content.includes(`-m "${literal}"`) || content.includes(`--message="${literal}"`);
}

describe("skip-ci subject convention", () => {
  describe("(i) docs-only and intermediate commit subjects keep the token", () => {
    for (const { file, description, literal } of SKIP_CI_SUBJECTS) {
      it(`${file}: ${description} carries bkit [skip ci]`, () => {
        // Bookkeeping commits route through `bkit ledgers commit` / `bkit
        // steps done`, which take the subject as `--message="..."` rather than
        // a literal `git commit -m "..."`; either carrier is a legitimate
        // match for the same invariant.
        const content = readWorkflow(file);
        expect(carriesSubject(content, literal)).toBe(true);
      });
    }
  });

  describe("(i-b) subjects the commands write keep the token", () => {
    for (const { source, description, literal } of COMMAND_SUBJECTS) {
      it(`${source}: ${description} carries bkit [skip ci]`, () => {
        const text = fs.readFileSync(path.resolve(__dirname, "../..", source), "utf-8");
        expect(text).toContain(literal);
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

  describe("(iii) every squash merge goes through bkit prs merge (explicit empty body)", () => {
    // `bkit prs merge` always passes `--body ""` and a token-free subject
    // (commands/workflow/prs.test.ts); no workflow merges with raw gh.
    for (const file of WORKFLOW_FILES) {
      it(`${file}: no raw gh pr merge in a fence`, () => {
        const fences = [...readWorkflow(file).matchAll(/```bash\n([\s\S]*?)```/g)].map(
          (m) => m[1]!,
        );
        expect(fences.filter((f) => /^\s*gh pr merge\b/m.test(f))).toEqual([]);
      });
    }
  });

  describe("(iv) ship never publishes local dev commits", () => {
    // `bkit branches sync-dev` lists local-only dev commits and pushes none of
    // them (commands/workflow/branches.test.ts); ship's own dev commits are
    // built off origin/dev and carry the token — (i) pins the subjects.
    const shipMd = readWorkflow("bkit-ship.md");

    it("ship brings local dev level through bkit branches sync-dev", () => {
      expect(shipMd).toMatch(/"\{BKIT\}" branches sync-dev\b/);
    });
  });
});
