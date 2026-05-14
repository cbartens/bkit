// bkit-bkitignore.integration.test.ts — P2.T11 — fs-touching matcher tests.
// Tests readBkitIgnoreFile() which touches the filesystem and respects
// the BKIT_BKITIGNORE_PER_KEY env var.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readBkitIgnoreFile, isFileIgnored, isKeyIgnored } from "./bkit-bkitignore";
import { filterBkitIgnored } from "./bkit-postinstall";
import type { PreflightFinding } from "./bkit-preflight";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-bkitignore-it-"));
  // Ensure BKIT_BKITIGNORE_PER_KEY is clean between tests
  delete process.env.BKIT_BKITIGNORE_PER_KEY;
});

afterEach(() => {
  delete process.env.BKIT_BKITIGNORE_PER_KEY;
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeBkitIgnore(content: string): void {
  fs.writeFileSync(path.join(tmpDir, ".bkitignore"), content, "utf-8");
}

// ---------------------------------------------------------------------------
// readBkitIgnoreFile — absent file
// ---------------------------------------------------------------------------

describe("readBkitIgnoreFile — absent file", () => {
  it("returns empty array when .bkitignore does not exist", () => {
    const rules = readBkitIgnoreFile(tmpDir);
    expect(rules).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// readBkitIgnoreFile — per-file (env off)
// ---------------------------------------------------------------------------

describe("readBkitIgnoreFile — per-file (BKIT_BKITIGNORE_PER_KEY not set)", () => {
  it("reads file and returns parsed rules", () => {
    writeBkitIgnore(".github/workflows/ci.yml\n.claude/settings.json\n");
    const rules = readBkitIgnoreFile(tmpDir);
    expect(rules).toHaveLength(2);
    expect(rules.map((r) => r.glob)).toContain(".github/workflows/ci.yml");
    expect(rules.map((r) => r.glob)).toContain(".claude/settings.json");
  });

  it("ignores comments and blank lines", () => {
    writeBkitIgnore("# comment\n\n.claude/settings.json\n");
    const rules = readBkitIgnoreFile(tmpDir);
    expect(rules).toHaveLength(1);
    expect(rules[0]!.glob).toBe(".claude/settings.json");
  });

  it("per-file glob matching works end-to-end", () => {
    writeBkitIgnore(".github/**/*.yml\n");
    const rules = readBkitIgnoreFile(tmpDir);
    expect(isFileIgnored(".github/workflows/ci.yml", rules)).toBe(true);
    expect(isFileIgnored(".github/workflows/release.yml", rules)).toBe(true);
    expect(isFileIgnored(".claude/settings.json", rules)).toBe(false);
  });

  it("per-key suffix is stripped from glob when env is off", () => {
    writeBkitIgnore(".claude/settings.json:hooks.Stop\n");
    const rules = readBkitIgnoreFile(tmpDir);
    expect(rules[0]!.keyPath).toBeNull();
    // File-level match still works
    expect(isFileIgnored(".claude/settings.json", rules)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// readBkitIgnoreFile — per-key (env on)
// ---------------------------------------------------------------------------

describe("readBkitIgnoreFile — per-key (BKIT_BKITIGNORE_PER_KEY=1)", () => {
  it("populates keyPath when env var is set", () => {
    process.env.BKIT_BKITIGNORE_PER_KEY = "1";
    writeBkitIgnore(".claude/settings.json:hooks.Stop\n");
    const rules = readBkitIgnoreFile(tmpDir);
    expect(rules[0]!.keyPath).toEqual(["hooks", "Stop"]);
  });

  it("per-key matching works end-to-end with env=1", () => {
    process.env.BKIT_BKITIGNORE_PER_KEY = "1";
    writeBkitIgnore(".claude/settings.json:hooks.Stop\n");
    const rules = readBkitIgnoreFile(tmpDir);
    expect(isKeyIgnored(".claude/settings.json", ["hooks", "Stop"], rules)).toBe(true);
    expect(isKeyIgnored(".claude/settings.json", ["hooks", "SessionStart"], rules)).toBe(false);
    expect(isKeyIgnored(".cursor/hooks.json", ["hooks", "Stop"], rules)).toBe(false);
  });

  it("per-key does NOT match without env var (off by default)", () => {
    // Do NOT set BKIT_BKITIGNORE_PER_KEY
    writeBkitIgnore(".claude/settings.json:hooks.Stop\n");
    const rules = readBkitIgnoreFile(tmpDir);
    expect(rules[0]!.keyPath).toBeNull();
    expect(isKeyIgnored(".claude/settings.json", ["hooks", "Stop"], rules)).toBe(false);
  });

  it("env cleanup works — per-key rules absent after env unset (afterEach cleans up)", () => {
    // This test runs AFTER afterEach cleans BKIT_BKITIGNORE_PER_KEY
    // The env var is NOT set here (afterEach ran delete above before each new test)
    expect(process.env.BKIT_BKITIGNORE_PER_KEY).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// filterBkitIgnored — .bkitignore wired into postinstall (P2.T11 success criterion)
// ---------------------------------------------------------------------------

describe("filterBkitIgnored — Tier-3 drift suppressed when file is in .bkitignore", () => {
  it("removes Tier-3 drift finding when file path is matched by .bkitignore", () => {
    // Write a .bkitignore that ignores ci.yml
    fs.writeFileSync(path.join(tmpDir, ".bkitignore"), ".github/workflows/ci.yml\n", "utf-8");

    const tier3Finding: PreflightFinding = {
      id: "tier3-merge-suggested-ci.yml",
      severity: "advisory",
      detect: ".github/workflows/ci.yml exists and differs from the bkit reference.",
      action: "Manual merge required.",
    };

    const result = filterBkitIgnored([tier3Finding], tmpDir);
    expect(result).toHaveLength(0);
  });

  it("keeps Tier-3 drift finding when file path is NOT in .bkitignore", () => {
    fs.writeFileSync(path.join(tmpDir, ".bkitignore"), ".github/workflows/release.yml\n", "utf-8");

    const tier3Finding: PreflightFinding = {
      id: "tier3-merge-suggested-ci.yml",
      severity: "advisory",
      detect: ".github/workflows/ci.yml exists and differs from the bkit reference.",
      action: "Manual merge required.",
    };

    const result = filterBkitIgnored([tier3Finding], tmpDir);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("tier3-merge-suggested-ci.yml");
  });

  it("keeps non-Tier-3 findings regardless of .bkitignore content", () => {
    fs.writeFileSync(path.join(tmpDir, ".bkitignore"), "**/*.yml\n", "utf-8");

    const nonTier3: PreflightFinding = {
      id: "gh-bkit-token-unset-shell",
      severity: "advisory",
      detect: "GH_BKIT_TOKEN is not set in the shell environment (undefined).",
      action: "Export GH_BKIT_TOKEN.",
    };

    const result = filterBkitIgnored([nonTier3], tmpDir);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("gh-bkit-token-unset-shell");
  });

  it("no-op when .bkitignore is absent", () => {
    // No .bkitignore written in tmpDir
    const tier3Finding: PreflightFinding = {
      id: "tier3-merge-suggested-ci.yml",
      severity: "advisory",
      detect: ".github/workflows/ci.yml exists and differs from the bkit reference.",
      action: "Manual merge required.",
    };

    const result = filterBkitIgnored([tier3Finding], tmpDir);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("tier3-merge-suggested-ci.yml");
  });

  it("glob pattern in .bkitignore matches Tier-3 file", () => {
    fs.writeFileSync(path.join(tmpDir, ".bkitignore"), ".github/**/*.yml\n", "utf-8");

    const tier3Finding: PreflightFinding = {
      id: "tier3-merge-suggested-ci.yml",
      severity: "advisory",
      detect: ".github/workflows/ci.yml exists and differs from the bkit reference.",
      action: "Manual merge required.",
    };

    const result = filterBkitIgnored([tier3Finding], tmpDir);
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// bkit check consults .bkitignore (integration wiring)
// ---------------------------------------------------------------------------

describe("readBkitIgnoreFile — real .bkitignore file patterns", () => {
  it("handles mixed content: comments, blank lines, file-level, per-key", () => {
    process.env.BKIT_BKITIGNORE_PER_KEY = "1";
    const content = [
      "# Ignore ci.yml drift entirely",
      ".github/workflows/ci.yml",
      "",
      "# Ignore custom Stop hook in settings.json",
      ".claude/settings.json:hooks.Stop",
      "",
      "# Glob pattern",
      ".vale/**",
    ].join("\n");
    writeBkitIgnore(content);
    const rules = readBkitIgnoreFile(tmpDir);

    expect(rules).toHaveLength(3);
    expect(isFileIgnored(".github/workflows/ci.yml", rules)).toBe(true);
    expect(isFileIgnored(".claude/settings.json", rules)).toBe(true); // file-level match
    expect(isKeyIgnored(".claude/settings.json", ["hooks", "Stop"], rules)).toBe(true);
    expect(isKeyIgnored(".claude/settings.json", ["hooks", "SessionStart"], rules)).toBe(false);
    expect(isFileIgnored(".vale/styles/House/Terminology.yml", rules)).toBe(true);
    expect(isFileIgnored(".cursor/hooks.json", rules)).toBe(false);
  });
});
