// audits/workflows/runtime-prose-audit.test.ts
//
// Narrow: PRESENCE, not BEHAVIOUR (whether prose rules honour the detected
// capabilities needs a real live-mode run).
//
//   (i)  every `runtime*` capability key has >=1 reader somewhere in
//        `.bkit/workflows/*.md`, and every phase workflow emits the
//        `runtime-resolved` row those readers depend on, through `bkit runtime row`.
//   (ii) no workflow sleeps in the foreground. Every wait lives in a command:
//        CI waits in `bkit runs wait|dispatch` (which hands a blocked sleep to
//        the agent's turn loop with exit 81, pinned in
//        commands/workflow/runs.test.ts) and the dev-lock poll in
//        `bkit locks acquire --kind=dev`. No raw `sleep N` in a workflow.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { getWorkflowsRoot } from "../../shared/package-roots";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
const WORKFLOWS_DIR = getWorkflowsRoot();

const WORKFLOW_FILES = [
  "bkit-auto.md",
  "bkit-design.md",
  "bkit-plan.md",
  "bkit-build.md",
  "bkit-debug.md",
  "bkit-ship.md",
] as const;

function readWorkflow(name: string): string {
  return fs.readFileSync(path.join(WORKFLOWS_DIR, name), "utf-8");
}

function readAllWorkflows(): string {
  return WORKFLOW_FILES.map(readWorkflow).join("\n");
}

// (i) every runtime capability key of the `runtime-resolved` row must have >=1
// reader across the workflow corpus, spelled as the row spells it. Whether the
// runtime can sleep is measured inside `bkit runs wait|dispatch`, not predicted
// by a capability row.
const RUNTIME_FLAGS = ["runtimeWorktrees", "runtimeDevPushes", "runtimeGithubCli"] as const;

describe("bkit-runtime-prose-audit (presence, NOT behaviour)", () => {
  describe("(i) every runtime capability key has >=1 reader in .bkit/workflows/", () => {
    const corpus = readAllWorkflows();

    for (const flag of RUNTIME_FLAGS) {
      it(`${flag} is read at least once`, () => {
        // A "reader" = any reference to the flag name outside its own
        // definition site (`bkit runtime detect`, commands/workflow/runtime.ts,
        // NOT under .bkit/workflows/ — so any occurrence here is necessarily a
        // consumer: a conditional, an interpolation, or explanatory prose
        // naming the flag a reader depends on).
        const occurrences = (corpus.match(new RegExp(flag, "g")) ?? []).length;
        expect(occurrences).toBeGreaterThanOrEqual(1);
      });
    }

    it("CAN_SLEEP is absent (deleted — measured by bkit runs, not a capability row)", () => {
      expect(corpus).not.toContain("CAN_SLEEP");
    });

    it("no workflow names runtimeGithubCli by an upper-case spelling the row never carries", () => {
      expect(corpus).not.toMatch(/RUNTIME_GITHUBCLI/);
    });

    it("auto has no gh MCP fallback: its one gh read (`runs context`) routes exit 80 to the Failure Path", () => {
      const auto = readWorkflow("bkit-auto.md");
      expect(auto).not.toContain("**gh MCP fallback:**");
      expect(auto).toMatch(/^> - \*\*External tools:\*\* [^\n]*exit 80\) → \*\*Failure Path\*\*/m);
    });

    it("every phase workflow carries the same gh MCP fallback line, and its transport-row call passes --file", () => {
      const phases = WORKFLOW_FILES.filter((f) => f !== "bkit-auto.md");
      const lines = phases.map((f) =>
        readWorkflow(f)
          .split("\n")
          .filter((l) => l.startsWith("> - **gh MCP fallback:**")),
      );
      for (const [i, found] of lines.entries()) {
        expect(found, `${phases[i]} carries exactly one gh MCP fallback line`).toHaveLength(1);
      }
      expect(new Set(lines.map((l) => l[0])).size, "gh MCP fallback lines differ").toBe(1);
      // `bkit prs transport-row` requires --file (commands/workflow/status.ts FILE_FLAG).
      expect(lines[0]![0]).toMatch(/`bkit prs transport-row --file=\{STATUS\} --kind=fallback /);
    });

    it("runtimeGithubCli's reader chain includes the runtime-resolved row it is durably read back from", () => {
      // runtimeGithubCli: BOTH halves present — the reader (the gh->MCP fallback rule,
      // close-guard) and the emission call site, which runs before the first
      // `bkit runtime assert` that reads the row back.
      expect(corpus).toContain("runtime-resolved");
      for (const workflow of ["design", "plan", "build", "debug", "ship"] as const) {
        const content = readWorkflow(`bkit-${workflow}.md`);
        const row = content.indexOf(`"{BKIT}" runtime row --workflow=${workflow} `);
        expect(row, `bkit-${workflow}.md emits the runtime-resolved row`).toBeGreaterThan(-1);
        expect(row).toBeLessThan(content.indexOf("runtime assert"));
      }
    });
  });

  describe("(ii) no workflow sleeps in the foreground — waits live in bkit commands", () => {
    for (const file of WORKFLOW_FILES) {
      it(`${file} carries no raw \`sleep N\``, () => {
        const sleeps = readWorkflow(file).match(/\bsleep\s+\d+/g) ?? [];
        expect(
          sleeps,
          `raw sleep in ${file} — wait through bkit runs wait|dispatch or bkit locks acquire`,
        ).toEqual([]);
      });
    }
  });
});
