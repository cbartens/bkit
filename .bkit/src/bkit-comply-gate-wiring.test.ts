// bkit-comply-gate-wiring.test.ts — close-gate wiring audit.
//
// Done-when contract (WS2-T6):
//   - Every wired close gate contains the PINNED fail-open idiom:
//     `pnpm bkit comply --phase {phase} || echo "[bkit-comply] grader unavailable, skipping"`
//   - No invocation sits on its own line under a bare `set -e` block that would
//     defeat the `|| echo` guard.
//   - Rollout: every workflow close is wired. design/plan/build/debug grade via
//     the shared `.bkit/scripts/bkit-workflow-telemetry.sh` at their close step;
//     ship inline at its close gate — each feeding the per-workflow telemetry report.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readWorkflow(name: string): string {
  const p = path.resolve(__dirname, "../../.bkit/workflows", name);
  return fs.readFileSync(p, "utf8");
}

/**
 * Return all occurrences of `pnpm bkit comply` in the file, with surrounding
 * context (the line + 2 lines of context).
 */
function findComplyInvocations(content: string): string[] {
  const lines = content.split("\n");
  const occurrences: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("pnpm bkit comply")) {
      // Collect the invocation line plus up to 2 lines of context.
      const ctx = lines.slice(Math.max(0, i - 1), i + 3).join("\n");
      occurrences.push(ctx);
    }
  }
  return occurrences;
}

/**
 * Check that EVERY `pnpm bkit comply` invocation in a file has `|| echo` on
 * the same line or joined via shell continuation (line ending with `\`).
 * This ensures no invocation is an unguarded bare call.
 */
function allInvocationsAreGuarded(content: string): boolean {
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes("pnpm bkit comply")) continue;

    // The guard must appear on the SAME line as the invocation.
    const hasGuardSameLine = line.includes("|| echo");
    if (!hasGuardSameLine) return false;
  }
  return true;
}

/**
 * Check that no wired `pnpm bkit comply` invocation is a STANDALONE line
 * immediately following a bare `set -e` with no guard.
 *
 * A "standalone" invocation is one where:
 *   - the comply line does NOT contain `||` (the guard is on a separate line)
 *   - AND there is a `set -e` block active (no `set +e` or `|| true` wrapping)
 *
 * Since we enforce same-line guard in `allInvocationsAreGuarded`, this check is
 * belt-and-suspenders: it scans for multi-line patterns like:
 *
 *   set -e
 *   ...
 *   pnpm bkit comply ...  # without || on same line
 */
function noUnguardedComplyUnderSetE(content: string): { ok: boolean; violation?: string } {
  const lines = content.split("\n");
  let inSetEBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect `set -e` activation (bare set -e or combined flags containing e).
    if (/^set\s+-[a-z]*e[a-z]*\s*$/.test(line) || line === "set -e") {
      inSetEBlock = true;
    }
    // Detect `set +e` (disables set -e).
    if (line === "set +e") {
      inSetEBlock = false;
    }

    // If we find a comply line without a same-line `||` guard AND we are inside
    // a known `set -e` block, that is a potential guard-defeat.
    if (line.includes("pnpm bkit comply") && !line.includes("||") && inSetEBlock) {
      return {
        ok: false,
        violation: `Line ${i + 1}: unguarded comply under set -e: ${lines[i]}`,
      };
    }
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Ship workflow — the wired phase (rollout: ship-only)
// ---------------------------------------------------------------------------

describe("bkit-ship.md — comply gate wiring (ship-only rollout)", () => {
  const content = readWorkflow("bkit-ship.md");

  it("contains at least one pnpm bkit comply --phase ship invocation", () => {
    expect(content).toContain("pnpm bkit comply --phase ship");
  });

  it("every comply invocation carries the || echo fail-open guard on the same line", () => {
    const invocations = findComplyInvocations(content);
    expect(invocations.length).toBeGreaterThan(0);
    expect(allInvocationsAreGuarded(content)).toBe(true);
  });

  it("the || echo guard uses the [bkit-comply] prefix for grep-ability", () => {
    const invocations = findComplyInvocations(content);
    for (const ctx of invocations) {
      expect(ctx).toContain("[bkit-comply]");
    }
  });

  it("no comply invocation sits under a bare set -e block without || guard", () => {
    const result = noUnguardedComplyUnderSetE(content);
    expect(result.ok).toBe(true);
  });

  it("the comply invocation specifies --phase ship", () => {
    expect(content).toContain("--phase ship");
  });
});

// ---------------------------------------------------------------------------
// Non-ship workflows — comply runs from the shared close script
// (.bkit/scripts/bkit-workflow-telemetry.sh), invoked at each workflow's close.
// ---------------------------------------------------------------------------

const NON_SHIP_PHASES = ["design", "plan", "build", "debug"] as const;

function readScript(name: string): string {
  return fs.readFileSync(path.resolve(__dirname, "../scripts", name), "utf8");
}

describe("bkit-workflow-telemetry.sh — comply grader wiring", () => {
  const script = readScript("bkit-workflow-telemetry.sh");

  it("invokes pnpm bkit comply --phase for the passed workflow", () => {
    expect(script).toContain('pnpm bkit comply --phase "$WF"');
  });

  it("guards the comply invocation with || echo on the same line", () => {
    expect(findComplyInvocations(script).length).toBeGreaterThan(0);
    expect(allInvocationsAreGuarded(script)).toBe(true);
  });

  it("comply guard uses the [bkit-comply] prefix", () => {
    for (const ctx of findComplyInvocations(script)) expect(ctx).toContain("[bkit-comply]");
  });

  it("has no unguarded comply under a bare set -e", () => {
    expect(noUnguardedComplyUnderSetE(script).ok).toBe(true);
  });
});

describe("non-ship workflows — invoke the close script, no inline comply", () => {
  for (const phase of NON_SHIP_PHASES) {
    const content = readWorkflow(`bkit-${phase}.md`);

    it(`bkit-${phase}.md invokes bkit-workflow-telemetry.sh ${phase} at close`, () => {
      expect(content).toContain(`bkit-workflow-telemetry.sh" ${phase} `);
    });

    it(`bkit-${phase}.md has no inline pnpm bkit comply (delegated to the script)`, () => {
      expect(content).not.toContain("pnpm bkit comply");
    });
  }
});
