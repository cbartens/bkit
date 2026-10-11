// shared/protected-paths.test.ts — drift test: the committed gate-paths.generated.cjs
// must exactly match the output of generateGatePathsCjs() from the TS table.
//
// Done-when contract (WS2-T2):
//   - This test FAILS if the committed .cjs is hand-edited to diverge.
//   - This test PASSES when the committed .cjs matches the TS table exactly.
//   - The grader + generated file import/derive from the one table.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import {
  generateGatePathsCjs,
  isMirrorPath,
  isGateConfig,
  MIRROR_PATH_PREFIXES,
  GATE_CONFIG_PATTERNS,
} from "./protected-paths.js";

// ---------------------------------------------------------------------------
// Locate the committed generated file relative to this test file.
// ---------------------------------------------------------------------------

// This file lives in .bkit/core/engine/; the generated .cjs is in .claude/hooks/
// (two levels up from .bkit/core/engine/).
const COMMITTED_CJS_PATH = path.resolve(
  __dirname,
  "../../../../.claude/hooks/gate-paths.generated.cjs",
);

// ---------------------------------------------------------------------------
// Drift test — the core WS2-T2 gate
// ---------------------------------------------------------------------------

describe("gate-paths.generated.cjs drift test", () => {
  it("committed .cjs matches generateGatePathsCjs() output exactly", () => {
    const committed = fs.readFileSync(COMMITTED_CJS_PATH, "utf8");
    const regenerated = generateGatePathsCjs();
    expect(committed).toBe(regenerated);
  });

  it("committed .cjs file exists at the expected path", () => {
    expect(fs.existsSync(COMMITTED_CJS_PATH)).toBe(true);
  });
});

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
// Gate-config table correctness
// ---------------------------------------------------------------------------

describe("isGateConfig", () => {
  it("flags tsconfig.json", () => {
    expect(isGateConfig("tsconfig.json")).toBe(true);
  });

  it("flags tsconfig.build.json (variant)", () => {
    expect(isGateConfig("path/to/tsconfig.build.json")).toBe(true);
  });

  it("flags vitest.config.ts", () => {
    expect(isGateConfig("vitest.config.ts")).toBe(true);
  });

  it("flags .prettierrc.json", () => {
    expect(isGateConfig(".prettierrc.json")).toBe(true);
  });

  it("flags slop-scan.config.json", () => {
    expect(isGateConfig("slop-scan.config.json")).toBe(true);
  });

  it("flags .vale.ini", () => {
    expect(isGateConfig(".vale.ini")).toBe(true);
  });

  it("does NOT flag README.md", () => {
    expect(isGateConfig("README.md")).toBe(false);
  });

  it("does NOT flag src/index.ts", () => {
    expect(isGateConfig("src/index.ts")).toBe(false);
  });

  it("does NOT flag package.json", () => {
    expect(isGateConfig("package.json")).toBe(false);
  });

  it("GATE_CONFIG_PATTERNS is non-empty", () => {
    expect(GATE_CONFIG_PATTERNS.length).toBeGreaterThan(0);
  });

  it("does NOT flag a consumer's template copies under .bkit/templates/", () => {
    for (const p of [
      ".bkit/templates/.vale.ini",
      ".bkit/templates/slop-scan.config.json",
      ".bkit/templates/.prettierignore",
      "/abs/repo/.bkit/templates/.lintstagedrc.json",
    ]) {
      expect(isGateConfig(p, false), p).toBe(false);
    }
  });

  it("still flags the consumer's adopted copy at the repo root", () => {
    expect(isGateConfig(".vale.ini", false)).toBe(true);
    expect(isGateConfig("/abs/repo/slop-scan.config.json", false)).toBe(true);
  });

  it("flags .bkit/templates/ gate configs in bkit's own repo, where that folder is the source", () => {
    expect(isGateConfig(".bkit/templates/.vale.ini", true)).toBe(true);
    expect(isGateConfig("/abs/bkit/.bkit/templates/slop-scan.config.json", true)).toBe(true);
  });

  it("does not skip a folder that merely ends in .bkit/templates", () => {
    expect(isGateConfig("x.bkit/templates/.vale.ini", false)).toBe(true);
  });

  it("defaults the dogfood flag from isDogfood() (this test runs inside bkit's repo)", () => {
    expect(isGateConfig(".bkit/templates/.vale.ini")).toBe(true);
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

  it("GATE_CONFIG_PATTERNS are all RegExp instances", () => {
    for (const re of GATE_CONFIG_PATTERNS) {
      expect(re).toBeInstanceOf(RegExp);
    }
  });
});
