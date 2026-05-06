// bkit-bkitignore.test.ts — P2.T11 — pure parser tests (per-file + per-key).
import { afterEach, describe, expect, it } from "vitest";
import {
  parseBkitIgnore,
  parseDottedKey,
  isFileIgnored,
  isKeyIgnored,
  type BkitIgnoreRule,
} from "./bkit-bkitignore";

// ---------------------------------------------------------------------------
// parseBkitIgnore — comment and blank-line handling
// ---------------------------------------------------------------------------

describe("parseBkitIgnore — comment and blank-line handling", () => {
  it("ignores lines starting with #", () => {
    const content = "# This is a comment\n.claude/settings.json\n";
    const rules = parseBkitIgnore(content);
    expect(rules).toHaveLength(1);
    expect(rules[0]!.glob).toBe(".claude/settings.json");
  });

  it("ignores blank lines", () => {
    const content = "\n\n.claude/settings.json\n\n";
    const rules = parseBkitIgnore(content);
    expect(rules).toHaveLength(1);
  });

  it("ignores multiple consecutive comment lines", () => {
    const content = "# comment 1\n# comment 2\n.github/workflows/ci.yml\n";
    const rules = parseBkitIgnore(content);
    expect(rules).toHaveLength(1);
    expect(rules[0]!.glob).toBe(".github/workflows/ci.yml");
  });

  it("empty content returns no rules", () => {
    expect(parseBkitIgnore("")).toHaveLength(0);
    expect(parseBkitIgnore("   \n  \n")).toHaveLength(0);
  });

  it("comment-only file returns no rules", () => {
    const content = "# .bkitignore\n# Lines starting with # are comments\n";
    expect(parseBkitIgnore(content)).toHaveLength(0);
  });

  it("trims whitespace from lines", () => {
    const content = "  .claude/settings.json  \n";
    const rules = parseBkitIgnore(content);
    expect(rules).toHaveLength(1);
    expect(rules[0]!.glob).toBe(".claude/settings.json");
  });
});

// ---------------------------------------------------------------------------
// parseBkitIgnore — per-file glob patterns
// ---------------------------------------------------------------------------

describe("parseBkitIgnore — per-file glob patterns", () => {
  it("parses simple file path as glob", () => {
    const rules = parseBkitIgnore(".github/workflows/ci.yml");
    expect(rules).toHaveLength(1);
    expect(rules[0]!.glob).toBe(".github/workflows/ci.yml");
    expect(rules[0]!.keyPath).toBeNull();
  });

  it("parses glob wildcard patterns", () => {
    const rules = parseBkitIgnore(".github/**/*.yml");
    expect(rules).toHaveLength(1);
    expect(rules[0]!.glob).toBe(".github/**/*.yml");
  });

  it("parses multiple rules", () => {
    const content = ".claude/settings.json\n.cursor/hooks.json\n.github/workflows/ci.yml\n";
    const rules = parseBkitIgnore(content);
    expect(rules).toHaveLength(3);
    expect(rules.map((r) => r.glob)).toEqual([
      ".claude/settings.json",
      ".cursor/hooks.json",
      ".github/workflows/ci.yml",
    ]);
  });
});

// ---------------------------------------------------------------------------
// parseBkitIgnore — per-key (`:dotted.key` syntax)
// ---------------------------------------------------------------------------

describe("parseBkitIgnore — per-key syntax (perKeyEnabled=false)", () => {
  it("strips :key suffix from glob when perKeyEnabled=false", () => {
    const rules = parseBkitIgnore(".claude/settings.json:hooks.Stop", false);
    expect(rules).toHaveLength(1);
    expect(rules[0]!.glob).toBe(".claude/settings.json");
    expect(rules[0]!.keyPath).toBeNull(); // NOT populated when perKeyEnabled=false
  });

  it("per-file matching still works when line has :key suffix", () => {
    const rules = parseBkitIgnore(".claude/settings.json:hooks.Stop", false);
    expect(isFileIgnored(".claude/settings.json", rules)).toBe(true);
  });
});

describe("parseBkitIgnore — per-key syntax (perKeyEnabled=true)", () => {
  it("parses :key suffix into keyPath when perKeyEnabled=true", () => {
    const rules = parseBkitIgnore(".claude/settings.json:hooks.Stop", true);
    expect(rules).toHaveLength(1);
    expect(rules[0]!.glob).toBe(".claude/settings.json");
    expect(rules[0]!.keyPath).toEqual(["hooks", "Stop"]);
  });

  it("parses single-segment key path", () => {
    const rules = parseBkitIgnore(".claude/settings.json:singleKey", true);
    expect(rules[0]!.keyPath).toEqual(["singleKey"]);
  });

  it("parses escaped dot in key (\\. → literal .)", () => {
    const rules = parseBkitIgnore(".claude/settings.json:a\\.b.c", true);
    expect(rules[0]!.keyPath).toEqual(["a.b", "c"]);
  });

  it("parses deep nested key path", () => {
    const rules = parseBkitIgnore(".cursor/hooks.json:hooks.Stop.command", true);
    expect(rules[0]!.keyPath).toEqual(["hooks", "Stop", "command"]);
  });
});

// ---------------------------------------------------------------------------
// parseDottedKey — standalone unit tests
// ---------------------------------------------------------------------------

describe("parseDottedKey", () => {
  it("splits on dot delimiter", () => {
    expect(parseDottedKey("hooks.Stop")).toEqual(["hooks", "Stop"]);
  });

  it("handles escaped dot (\\. → literal .)", () => {
    expect(parseDottedKey("a\\.b.c")).toEqual(["a.b", "c"]);
  });

  it("handles single segment", () => {
    expect(parseDottedKey("singleKey")).toEqual(["singleKey"]);
  });

  it("handles three levels", () => {
    expect(parseDottedKey("a.b.c")).toEqual(["a", "b", "c"]);
  });

  it("filters empty parts", () => {
    expect(parseDottedKey("a..b")).toEqual(["a", "b"]);
  });
});

// ---------------------------------------------------------------------------
// isFileIgnored — per-file matcher
// ---------------------------------------------------------------------------

describe("isFileIgnored — per-file glob matching", () => {
  it("matches exact file path", () => {
    const rules = parseBkitIgnore(".claude/settings.json");
    expect(isFileIgnored(".claude/settings.json", rules)).toBe(true);
  });

  it("does not match a different file", () => {
    const rules = parseBkitIgnore(".claude/settings.json");
    expect(isFileIgnored(".cursor/hooks.json", rules)).toBe(false);
  });

  it("matches glob wildcard pattern", () => {
    const rules = parseBkitIgnore(".github/**/*.yml");
    expect(isFileIgnored(".github/workflows/ci.yml", rules)).toBe(true);
    expect(isFileIgnored(".github/other/release.yml", rules)).toBe(true);
    expect(isFileIgnored(".github/readme.md", rules)).toBe(false);
  });

  it("matches against multiple rules (OR semantics)", () => {
    const content = ".claude/settings.json\n.cursor/hooks.json\n";
    const rules = parseBkitIgnore(content);
    expect(isFileIgnored(".claude/settings.json", rules)).toBe(true);
    expect(isFileIgnored(".cursor/hooks.json", rules)).toBe(true);
    expect(isFileIgnored(".github/workflows/ci.yml", rules)).toBe(false);
  });

  it("returns false for empty rules list", () => {
    expect(isFileIgnored(".claude/settings.json", [])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isKeyIgnored — per-key matcher (env-gated)
// ---------------------------------------------------------------------------

describe("isKeyIgnored — per-key matching", () => {
  it("matches when both file glob and key path match", () => {
    const rules = parseBkitIgnore(".claude/settings.json:hooks.Stop", true);
    expect(isKeyIgnored(".claude/settings.json", ["hooks", "Stop"], rules)).toBe(true);
  });

  it("does not match when file matches but key differs", () => {
    const rules = parseBkitIgnore(".claude/settings.json:hooks.Stop", true);
    expect(isKeyIgnored(".claude/settings.json", ["hooks", "SessionStart"], rules)).toBe(false);
  });

  it("does not match when file does not match", () => {
    const rules = parseBkitIgnore(".claude/settings.json:hooks.Stop", true);
    expect(isKeyIgnored(".cursor/hooks.json", ["hooks", "Stop"], rules)).toBe(false);
  });

  it("does not match file-level rules (no keyPath) for per-key query", () => {
    const rules = parseBkitIgnore(".claude/settings.json", true);
    // No keyPath in rule → isKeyIgnored skips it
    expect(isKeyIgnored(".claude/settings.json", ["hooks", "Stop"], rules)).toBe(false);
  });

  it("returns false for empty rules list", () => {
    expect(isKeyIgnored(".claude/settings.json", ["hooks", "Stop"], [])).toBe(false);
  });

  it("key path length mismatch → no match", () => {
    const rules = parseBkitIgnore(".claude/settings.json:hooks.Stop", true);
    // Rule has 2-part key; query has 3-part key
    expect(isKeyIgnored(".claude/settings.json", ["hooks", "Stop", "extra"], rules)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Env-var gating: per-key rules are structurally parsed but keyPath=null when off
// ---------------------------------------------------------------------------

describe("parseBkitIgnore — env-var gating semantics", () => {
  it("keyPath is null when perKeyEnabled=false (env off)", () => {
    const rules = parseBkitIgnore(".claude/settings.json:hooks.Stop", false);
    expect(rules[0]!.keyPath).toBeNull();
  });

  it("file-level match still works even when line has :key suffix and perKeyEnabled=false", () => {
    const rules = parseBkitIgnore(".claude/settings.json:hooks.Stop", false);
    expect(isFileIgnored(".claude/settings.json", rules)).toBe(true);
    // But per-key query returns false (no keyPath rules)
    expect(isKeyIgnored(".claude/settings.json", ["hooks", "Stop"], rules)).toBe(false);
  });
});
