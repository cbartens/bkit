// shared/protected-paths.test.ts — the mirror-path table the compliance grader checks.
// The gate-config list is asserted against the real hook in
// audits/hooks/gateguard-parity.integration.test.ts.

import { describe, expect, it } from "vitest";
import { isMirrorPath, MIRROR_PATH_PREFIXES } from "./protected-paths.js";

// ---------------------------------------------------------------------------
// Mirror-path table correctness
// ---------------------------------------------------------------------------

describe("isMirrorPath", () => {
  it("flags .claude/agents/ paths as mirror paths", () => {
    expect(isMirrorPath(".claude/agents/bkit-design.md")).toBe(true);
  });

  it("flags .claude/commands/ paths as mirror paths", () => {
    expect(isMirrorPath(".claude/commands/bkit-design.md")).toBe(true);
  });

  it("flags .cursor/agents/ paths as mirror paths", () => {
    expect(isMirrorPath(".cursor/agents/bkit-plan.md")).toBe(true);
  });

  it("flags .cursor/commands/ paths as mirror paths", () => {
    expect(isMirrorPath(".cursor/commands/bkit-build.md")).toBe(true);
  });

  it("flags .opencode/agents/ paths as mirror paths", () => {
    expect(isMirrorPath(".opencode/agents/bkit-ship.md")).toBe(true);
  });

  it("flags .opencode/commands/ paths as mirror paths", () => {
    expect(isMirrorPath(".opencode/commands/bkit-debug.md")).toBe(true);
  });

  it("does NOT flag .bkit/workflows/ paths", () => {
    expect(isMirrorPath(".bkit/workflows/bkit-design.md")).toBe(false);
  });

  it("does NOT flag .agents/rules.md", () => {
    expect(isMirrorPath(".agents/rules.md")).toBe(false);
  });

  it("does NOT flag .claude/settings.json (non-mirror hooks dir)", () => {
    expect(isMirrorPath(".claude/settings.json")).toBe(false);
  });

  it("does NOT flag .claude/hooks/bkit-gateguard.cjs (hooks dir, not agents/commands)", () => {
    expect(isMirrorPath(".claude/hooks/bkit-gateguard.cjs")).toBe(false);
  });

  it("MIRROR_PATH_PREFIXES has exactly 6 entries", () => {
    expect(MIRROR_PATH_PREFIXES).toHaveLength(6);
  });
});

// ---------------------------------------------------------------------------
// Consistency: grader imports from the same table, not a separate copy
// ---------------------------------------------------------------------------

describe("protected-paths shared-table contract", () => {
  it("MIRROR_PATH_PREFIXES are all strings ending with /", () => {
    for (const prefix of MIRROR_PATH_PREFIXES) {
      expect(typeof prefix).toBe("string");
      expect(prefix.endsWith("/")).toBe(true);
    }
  });
});
