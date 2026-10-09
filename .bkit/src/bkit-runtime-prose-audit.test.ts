// bkit-runtime-prose-audit.test.ts — #341 T16, Derived Test Matrix row 15.
//
// The design's own honest limit (D3): tests can prove `bkit runtime detect`
// DETECTS capabilities correctly, never that prose rules HONOUR them — that
// consumption guarantee rests on a real live-mode run. This audit is
// deliberately narrow: PRESENCE, not BEHAVIOUR.
//
//   (i)  every `RUNTIME_*` capability flag has >=1 reader somewhere in
//        `.bkit/workflows/*.md` — a flag set but never read anywhere is a
//        dead flag, exactly the class of gap #341 T14/T15 discovered
//        (docs/failures.jsonl key `runtime-resolved-row-never-emitted-step1`)
//        — and every phase workflow emits the `runtime-resolved` row those
//        readers depend on, through `bkit runtime row`.
//   (ii) no workflow sleeps in the foreground. Every wait lives in a command:
//        CI waits in `bkit runs wait|dispatch` (which hands a blocked sleep to
//        the agent's turn loop with exit 81, pinned in
//        commands/workflow/runs.test.ts) and the dev-lock poll in
//        `bkit locks acquire --kind=dev`. A raw `sleep N` reappearing in a
//        workflow is a wait that bypasses both.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const WORKFLOWS_DIR = path.resolve(REPO_ROOT, ".bkit/workflows");

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

// (i) every RUNTIME_* capability flag must have >=1 reader across the workflow corpus.
// CAN_SLEEP was deleted (#341 follow-up): whether the runtime can sleep is
// measured inside `bkit runs wait|dispatch`, not predicted by a capability row.
const RUNTIME_FLAGS = ["RUNTIME_WORKTREES", "RUNTIME_DEVPUSHES", "RUNTIME_GITHUBCLI"] as const;

describe("bkit-runtime-prose-audit (presence, NOT behaviour)", () => {
  describe("(i) every RUNTIME_* flag has >=1 reader in .bkit/workflows/", () => {
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

    it("RUNTIME_GITHUBCLI's reader chain includes the runtime-resolved row it is durably read back from", () => {
      // The row-15 audit's own reason to exist: #341 T14/T15 discovered
      // RUNTIME_GITHUBCLI had readers (the gh->MCP fallback rule, D25 close-guard) but
      // no writer ever durably emitted the row those readers depend on
      // (docs/failures.jsonl key runtime-resolved-row-never-emitted-step1,
      // fixed in this same sub-plan). Assert BOTH halves are present now:
      // the reader and the emission call site, which runs before the first
      // `bkit runtime assert` that reads the row back.
      expect(corpus).toContain("runtime-resolved");
      for (const workflow of ["design", "plan", "build", "debug", "ship"] as const) {
        const content = readWorkflow(`bkit-${workflow}.md`);
        const row = content.indexOf(`"$BKIT" runtime row --workflow=${workflow} `);
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
