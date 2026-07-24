// bkit-runtime-prose-audit.test.ts — #341 T16, Derived Test Matrix row 15.
//
// The design's own honest limit (D3): bats/vitest can prove the shim
// DETECTS capabilities correctly, never that prose rules HONOUR them — that
// consumption guarantee rests entirely on Sub-Plan 6's real live-mode-3 run
// (row 14). This audit is deliberately narrow: PRESENCE, not BEHAVIOUR.
//
//   (i)  every `CAN_*` capability flag has >=1 reader somewhere in
//        `.bkit/workflows/*.md` — a flag set but never read anywhere is a
//        dead flag, exactly the class of gap #341 T14/T15 discovered
//        (docs/failures.jsonl key `runtime-resolved-row-never-emitted-step1`).
//   (ii) every foreground **CI-wait** `sleep` sits inside the CI-Dispatch
//        Gate shared kernel (i.e. is `bkit_wait_ci`'s own `timeout`-wrapped
//        `sleep`, D22 — never a raw `sleep` duplicated at a call site);
//        every OTHER raw `sleep` literal in `.bkit/workflows/*.md` MUST be
//        an explicitly-catalogued retry/backoff sleep (the `dev`-lock
//        acquisition poll) — exempted BY NAME, never silently allowed, so a
//        new un-catalogued raw sleep fails loud instead of passing quietly.

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
  "bkit-worktree-prune.md",
  "bkit-worktree-sync.md",
] as const;

function readWorkflow(name: string): string {
  return fs.readFileSync(path.join(WORKFLOWS_DIR, name), "utf-8");
}

function readAllWorkflows(): string {
  return WORKFLOW_FILES.map(readWorkflow).join("\n");
}

// (i) every CAN_* flag must have >=1 reader across the workflow corpus.
const CAN_FLAGS = ["CAN_WORKTREE", "CAN_PUSH_DEV", "CAN_SLEEP", "GH_OK"] as const;

// (ii) the CI-Dispatch Gate shared kernel — the ONLY sanctioned place a
// CI-wait sleep may live (inside `bkit_wait_ci`, never a raw `sleep` at the
// call site). Marker comments bound each kernel block in bkit-build.md /
// bkit-debug.md (three occurrences: build close-workflow, debug PR-mode
// close-workflow, debug LOCAL-mode create-pr).
const KERNEL_START = "# --- CI-Dispatch Gate shared kernel ---";
const KERNEL_END = "# --- end CI-Dispatch Gate shared kernel ---";

// Every raw `sleep N` literal in `.bkit/workflows/*.md` OUTSIDE the kernel
// blocks MUST be one of these explicitly-catalogued retry/backoff sleeps —
// the `dev`-lock acquisition poll (never a CI-wait; #341 D16/Risk 8's
// serialise-concurrent-ship-runs mechanism, unrelated to D22/CAN_SLEEP).
// A new, un-catalogued raw sleep must be added HERE deliberately, or the
// audit fails — never silently passed.
const EXEMPT_RAW_SLEEPS: Array<{
  file: (typeof WORKFLOW_FILES)[number];
  literal: string;
  context: string;
}> = [
  { file: "bkit-ship.md", literal: "sleep 5", context: "DEVLOCK" },
  { file: "bkit-ship.md", literal: "sleep 10", context: "DEVLOCK" },
];

describe("bkit-runtime-prose-audit (#341 T16, row 15 — presence, NOT behaviour)", () => {
  describe("(i) every CAN_* flag has >=1 reader in .bkit/workflows/", () => {
    const corpus = readAllWorkflows();

    for (const flag of CAN_FLAGS) {
      it(`${flag} is read at least once`, () => {
        // A "reader" = any reference to the flag name outside its own
        // definition site (the shim source lives in
        // .bkit/templates/.bkit/scripts/bkit-runtime.sh, NOT under
        // .bkit/workflows/ — so any occurrence here is necessarily a
        // consumer: a conditional, an interpolation, or explanatory prose
        // naming the flag a reader depends on).
        const occurrences = (corpus.match(new RegExp(flag, "g")) ?? []).length;
        expect(occurrences).toBeGreaterThanOrEqual(1);
      });
    }

    it("GH_OK's reader chain includes the runtime-resolved row it is durably read back from (D21)", () => {
      // The row-15 audit's own reason to exist: #341 T14/T15 discovered
      // GH_OK had readers (the gh->MCP fallback rule, D25 close-guard) but
      // no writer ever durably emitted the row those readers depend on
      // (docs/failures.jsonl key runtime-resolved-row-never-emitted-step1,
      // fixed in this same sub-plan). Assert BOTH halves are present now:
      // the reader (already existed) and the emission call site (T16 fix).
      expect(corpus).toContain("runtime-resolved");
      for (const workflow of ["design", "plan", "build", "debug", "ship"] as const) {
        const content = readWorkflow(`bkit-${workflow}.md`);
        expect(content).toContain(`bkit_runtime_row ${workflow} `);
      }
    });
  });

  describe("(ii) every foreground CI-wait sleep sits under the CI-wait rule; retry/backoff sleeps are explicitly exempted", () => {
    it("the CI-Dispatch Gate shared kernel blocks call bkit_wait_ci, never a raw `sleep`", () => {
      for (const file of ["bkit-build.md", "bkit-debug.md"] as const) {
        const content = readWorkflow(file);
        const blocks: string[] = [];
        let cursor = 0;
        for (;;) {
          const startIdx = content.indexOf(KERNEL_START, cursor);
          if (startIdx === -1) break;
          const endIdx = content.indexOf(KERNEL_END, startIdx);
          expect(endIdx).toBeGreaterThan(startIdx); // every start has a matching end
          blocks.push(content.slice(startIdx, endIdx));
          cursor = endIdx + KERNEL_END.length;
        }
        expect(blocks.length).toBeGreaterThanOrEqual(1);
        for (const block of blocks) {
          expect(block).toContain("bkit_wait_ci");
          expect(block).not.toMatch(/(?<!bkit_wait_ci\()\bsleep\s+\d/);
        }
      }
    });

    it("every raw `sleep N` literal outside a kernel block is an explicitly-catalogued retry/backoff sleep", () => {
      const RAW_SLEEP_RE = /\bsleep\s+\d+\b/g;
      const found: Array<{ file: string; literal: string }> = [];

      for (const file of WORKFLOW_FILES) {
        const content = readWorkflow(file);
        // Strip kernel-block content — those `sleep`s (inside bkit_wait_ci's
        // own doc comments, if any) are governed by the assertion above,
        // not this one.
        let stripped = content;
        for (;;) {
          const startIdx = stripped.indexOf(KERNEL_START);
          if (startIdx === -1) break;
          const endIdx = stripped.indexOf(KERNEL_END, startIdx);
          if (endIdx === -1) break;
          stripped = stripped.slice(0, startIdx) + stripped.slice(endIdx + KERNEL_END.length);
        }
        for (const match of stripped.matchAll(RAW_SLEEP_RE)) {
          found.push({ file, literal: match[0] });
        }
      }

      // Every found raw sleep must appear in the exemption catalogue for
      // its file (by literal `sleep N` text) — a new, un-catalogued sleep
      // fails this assertion instead of silently passing.
      for (const { file, literal } of found) {
        const isExempt = EXEMPT_RAW_SLEEPS.some((e) => e.file === file && e.literal === literal);
        expect(
          isExempt,
          `un-catalogued raw sleep "${literal}" in ${file} — add to EXEMPT_RAW_SLEEPS or route through bkit_wait_ci`,
        ).toBe(true);
      }

      // And the catalogue itself stays accurate — no stale exemption for a
      // sleep that no longer exists in the corpus.
      for (const exempt of EXEMPT_RAW_SLEEPS) {
        const stillPresent = found.some(
          (f) => f.file === exempt.file && f.literal === exempt.literal,
        );
        expect(
          stillPresent,
          `catalogued exemption "${exempt.literal}" in ${exempt.file} no longer found in the corpus — remove the stale entry`,
        ).toBe(true);
      }
    });

    it("every catalogued exemption is a dev-lock retry/backoff sleep, not a CI-wait duplicate", () => {
      for (const { file, literal, context } of EXEMPT_RAW_SLEEPS) {
        const content = readWorkflow(file);
        const idx = content.indexOf(literal);
        expect(idx).toBeGreaterThanOrEqual(0);
        // The exemption's declared context (DEVLOCK) must appear in the
        // surrounding ~400 chars — proves it is the dev-lock poll, not an
        // unrelated CI-wait sleep smuggled past the kernel-block check.
        const windowStart = Math.max(0, idx - 400);
        const window = content.slice(windowStart, idx);
        expect(window).toContain(context);
      }
    });
  });
});
