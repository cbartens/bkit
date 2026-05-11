// bkit-uninstall.test.ts — P2.T3, P2.T5, P2.T7, P2.T8 — uninstall unit tests.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  buildDecisionTable,
  formatDecisionTable,
  runUninstall,
  type UninstallContext,
  type FileSummary,
} from "./bkit-uninstall";
import { serializeBkitVersion, sha256, type BkitVersion } from "./bkit-version";

let tmpDir: string;

function makeCtx(overrides: Partial<UninstallContext> = {}): UninstallContext {
  return {
    cwd: tmpDir,
    dryRun: false,
    force: false,
    nuke: false,
    yes: false,
    stripPackage: false,
    logPrefix: "[bkit-uninstall-test]",
    ...overrides,
  };
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-uninstall-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function writeFile(relPath: string, content: string): void {
  const absPath = path.join(tmpDir, relPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, content, "utf-8");
}

function fileExists(relPath: string): boolean {
  return fs.existsSync(path.join(tmpDir, relPath));
}

function readFile(relPath: string): string {
  return fs.readFileSync(path.join(tmpDir, relPath), "utf-8");
}

function writeBkitVersionFile(v: BkitVersion): void {
  const versionFilePath = path.join(tmpDir, ".agents", ".bkit-version");
  fs.mkdirSync(path.dirname(versionFilePath), { recursive: true });
  fs.writeFileSync(versionFilePath, serializeBkitVersion(v), "utf-8");
}

// ---------------------------------------------------------------------------
// buildDecisionTable — Tier-1 files
// ---------------------------------------------------------------------------

describe("buildDecisionTable — Tier-1", () => {
  it("Tier-1 file present → decision=delete", () => {
    writeFile(".claude/settings.json", '{"hooks":{}}');
    const table = buildDecisionTable(["claude"], makeCtx());
    const entry = table.find((r) => r.file === ".claude/settings.json");
    expect(entry).toBeDefined();
    expect(entry!.decision).toBe("delete");
    expect(entry!.tier).toBe(1);
  });

  it("Tier-1 file absent → decision=skip-absent", () => {
    const table = buildDecisionTable(["claude"], makeCtx());
    const entry = table.find((r) => r.file === ".claude/settings.json");
    expect(entry).toBeDefined();
    expect(entry!.decision).toBe("skip-absent");
  });
});

// ---------------------------------------------------------------------------
// buildDecisionTable — Tier-2 files
// ---------------------------------------------------------------------------

describe("buildDecisionTable — Tier-2", () => {
  it("Tier-2 file with html-comment markers → decision=strip-block", () => {
    writeFile(
      "AGENTS.md",
      "# Consumer content\n\n<!-- bkit:start -->\nbkit block\n<!-- bkit:end -->\n",
    );
    const table = buildDecisionTable(["core"], makeCtx());
    const entry = table.find((r) => r.file === "AGENTS.md");
    expect(entry).toBeDefined();
    expect(entry!.decision).toBe("strip-block");
    expect(entry!.tier).toBe(2);
  });

  it("Tier-2 file with hash-comment markers → decision=strip-block", () => {
    writeFile(".husky/pre-commit", "#!/bin/sh\n# bkit:start\nbkit-step\n# bkit:end\n");
    const table = buildDecisionTable(["git-hooks"], makeCtx());
    const entry = table.find((r) => r.file === ".husky/pre-commit");
    expect(entry).toBeDefined();
    expect(entry!.decision).toBe("strip-block");
  });

  it("Tier-2 file with no bkit markers → decision=preserve (100% consumer content)", () => {
    writeFile("AGENTS.md", "# Purely consumer content\n");
    const table = buildDecisionTable(["core"], makeCtx());
    const entry = table.find((r) => r.file === "AGENTS.md");
    expect(entry).toBeDefined();
    expect(entry!.decision).toBe("preserve");
  });
});

// ---------------------------------------------------------------------------
// buildDecisionTable — Tier-3 files
// ---------------------------------------------------------------------------

describe("buildDecisionTable — Tier-3 hash guard", () => {
  it("Tier-3 file: unknown hash (no tier3Hashes entry) → skip-tier3-unknown", () => {
    writeFile(".github/workflows/ci.yml", "ci yaml\n");
    // No .bkit-version file → no hash recorded
    const table = buildDecisionTable(["ci"], makeCtx());
    const entry = table.find((r) => r.file === ".github/workflows/ci.yml");
    expect(entry).toBeDefined();
    expect(entry!.decision).toBe("skip-tier3-unknown");
  });

  it("Tier-3 file: hash matches → decision=delete", () => {
    const content = "original ci yaml content\n";
    writeFile(".github/workflows/ci.yml", content);
    writeBkitVersionFile({
      pinnedVersion: "0.7.0",
      tier3Hashes: { ".github/workflows/ci.yml": sha256(content) },
    });
    const table = buildDecisionTable(["ci"], makeCtx());
    const entry = table.find((r) => r.file === ".github/workflows/ci.yml");
    expect(entry).toBeDefined();
    expect(entry!.decision).toBe("delete");
  });

  it("Tier-3 file: hash mismatch (consumer modified) → skip-tier3-modified", () => {
    const originalContent = "original ci yaml\n";
    const modifiedContent = "consumer modified ci yaml\n";
    writeFile(".github/workflows/ci.yml", modifiedContent);
    writeBkitVersionFile({
      pinnedVersion: "0.7.0",
      tier3Hashes: { ".github/workflows/ci.yml": sha256(originalContent) },
    });
    const table = buildDecisionTable(["ci"], makeCtx());
    const entry = table.find((r) => r.file === ".github/workflows/ci.yml");
    expect(entry).toBeDefined();
    expect(entry!.decision).toBe("skip-tier3-modified");
  });

  it("Tier-3 with --force → decision=delete regardless of hash", () => {
    const originalContent = "original ci yaml\n";
    writeFile(".github/workflows/ci.yml", "consumer modified\n");
    writeBkitVersionFile({
      pinnedVersion: "0.7.0",
      tier3Hashes: { ".github/workflows/ci.yml": sha256(originalContent) },
    });
    const table = buildDecisionTable(["ci"], makeCtx({ force: true }));
    const entry = table.find((r) => r.file === ".github/workflows/ci.yml");
    expect(entry).toBeDefined();
    expect(entry!.decision).toBe("delete");
    expect(entry!.reason).toContain("--force");
  });

  it("retro-fit: v0.6.x .bkit-version (plain text, no tier3Hashes) → skip-tier3-unknown", () => {
    writeFile(".github/workflows/ci.yml", "ci content\n");
    // Simulate v0.6.x plain-text .bkit-version
    const versionFilePath = path.join(tmpDir, ".agents", ".bkit-version");
    fs.mkdirSync(path.dirname(versionFilePath), { recursive: true });
    fs.writeFileSync(versionFilePath, "0.6.0\n", "utf-8");

    const table = buildDecisionTable(["ci"], makeCtx());
    const entry = table.find((r) => r.file === ".github/workflows/ci.yml");
    expect(entry).toBeDefined();
    expect(entry!.decision).toBe("skip-tier3-unknown");
  });
});

// ---------------------------------------------------------------------------
// buildDecisionTable — nuke mode
// ---------------------------------------------------------------------------

describe("buildDecisionTable — nuke mode", () => {
  it("--nuke makes all present files decision=delete", () => {
    writeFile(".claude/settings.json", '{"hooks":{}}');
    writeFile("AGENTS.md", "# Consumer\n\n<!-- bkit:start -->\nbkit\n<!-- bkit:end -->\n");
    writeFile(".github/workflows/ci.yml", "consumer modified\n");
    writeBkitVersionFile({
      pinnedVersion: "0.7.0",
      tier3Hashes: { ".github/workflows/ci.yml": sha256("different content\n") },
    });

    const table = buildDecisionTable(["core", "claude", "ci"], makeCtx({ nuke: true }));
    const decisions = table.filter((r) => r.decision !== "skip-absent").map((r) => r.decision);
    expect(decisions.every((d) => d === "delete")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// formatDecisionTable — dry-run output
// ---------------------------------------------------------------------------

describe("formatDecisionTable — P2.T7", () => {
  it("formats a non-empty table with FILE / DECISION / REASON header", () => {
    const table: FileSummary[] = [
      { file: "AGENTS.md", decision: "strip-block", reason: "Tier-2 managed", tier: 2 },
      { file: ".claude/settings.json", decision: "delete", reason: "Tier-1", tier: 1 },
    ];
    const output = formatDecisionTable(table);
    expect(output).toContain("FILE");
    expect(output).toContain("DECISION");
    expect(output).toContain("REASON");
    expect(output).toContain("AGENTS.md");
    expect(output).toContain("strip-block");
    expect(output).toContain(".claude/settings.json");
    expect(output).toContain("delete");
  });

  it("returns informational message for empty table", () => {
    const output = formatDecisionTable([]);
    expect(output).toContain("No files to process");
  });

  it("dry-run snapshot: decision table is printed, nothing deleted", async () => {
    writeFile(".claude/settings.json", '{"hooks":{}}');
    writeFile("AGENTS.md", "# Consumer\n\n<!-- bkit:start -->\nbkit\n<!-- bkit:end -->\n");

    const ctx = makeCtx({ dryRun: true });
    const result = await runUninstall(["claude", "core"], ctx);

    expect(result.dryRun).toBe(true);
    expect(result.decisions.length).toBeGreaterThan(0);
    // Dry-run: nothing actually deleted from disk
    expect(fileExists(".claude/settings.json")).toBe(true);
    expect(fileExists("AGENTS.md")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// runUninstall — round-trip (P2.T5)
// ---------------------------------------------------------------------------

describe("runUninstall — round-trip", () => {
  it("deletes Tier-1 file", async () => {
    writeFile(".claude/settings.json", '{"hooks":{}}');
    await runUninstall(["claude"], makeCtx());
    expect(fileExists(".claude/settings.json")).toBe(false);
  });

  it("strips bkit block from Tier-2 file, preserving consumer content", async () => {
    const consumer = "# Consumer heading\n\nConsumer rules.\n";
    const bkitBlock = "\n<!-- bkit:start -->\nbkit content\n<!-- bkit:end -->\n";
    writeFile("AGENTS.md", consumer + bkitBlock);

    await runUninstall(["core"], makeCtx());

    expect(fileExists("AGENTS.md")).toBe(true);
    const result = readFile("AGENTS.md");
    expect(result).toContain("Consumer heading");
    expect(result).toContain("Consumer rules.");
    expect(result).not.toContain("bkit content");
    expect(result).not.toContain("<!-- bkit:start -->");
  });

  it("deletes Tier-2 file when stripping leaves only whitespace", async () => {
    writeFile("AGENTS.md", "<!-- bkit:start -->\nbkit content\n<!-- bkit:end -->\n");
    await runUninstall(["core"], makeCtx());
    expect(fileExists("AGENTS.md")).toBe(false);
  });

  it("preserves Tier-2 file when no bkit markers present (100% consumer)", async () => {
    const consumerContent = "# Pure consumer content\n";
    writeFile("AGENTS.md", consumerContent);
    await runUninstall(["core"], makeCtx());
    expect(fileExists("AGENTS.md")).toBe(true);
    expect(readFile("AGENTS.md")).toBe(consumerContent);
  });

  it("preserves Tier-3 file when hash unknown (no tier3Hashes)", async () => {
    writeFile(".github/workflows/ci.yml", "ci yaml\n");
    await runUninstall(["ci"], makeCtx());
    expect(fileExists(".github/workflows/ci.yml")).toBe(true);
  });

  it("deletes Tier-3 file when hash matches install-time hash", async () => {
    const content = "original ci yaml\n";
    writeFile(".github/workflows/ci.yml", content);
    writeBkitVersionFile({
      pinnedVersion: "0.7.0",
      tier3Hashes: { ".github/workflows/ci.yml": sha256(content) },
    });
    await runUninstall(["ci"], makeCtx());
    expect(fileExists(".github/workflows/ci.yml")).toBe(false);
  });

  it("preserves Tier-3 file when hash mismatches (consumer modified)", async () => {
    writeFile(".github/workflows/ci.yml", "consumer modified\n");
    writeBkitVersionFile({
      pinnedVersion: "0.7.0",
      tier3Hashes: { ".github/workflows/ci.yml": sha256("original content\n") },
    });
    await runUninstall(["ci"], makeCtx());
    expect(fileExists(".github/workflows/ci.yml")).toBe(true);
    expect(readFile(".github/workflows/ci.yml")).toBe("consumer modified\n");
  });
});

// ---------------------------------------------------------------------------
// runUninstall — idempotency (P2.T8)
// ---------------------------------------------------------------------------

describe("runUninstall — idempotency", () => {
  it("running uninstall twice produces same result (no errors on second run)", async () => {
    writeFile(".claude/settings.json", '{"hooks":{}}');

    await runUninstall(["claude"], makeCtx());
    expect(fileExists(".claude/settings.json")).toBe(false);

    // Second run — file already absent; should not throw
    const result2 = await runUninstall(["claude"], makeCtx());
    expect(result2.deleted).toHaveLength(0); // already gone
  });

  it("strip-block is idempotent: running on already-stripped file no-ops", async () => {
    // File with ONLY consumer content (no bkit markers)
    const consumerContent = "# Consumer heading\n";
    writeFile("AGENTS.md", consumerContent);

    const result1 = await runUninstall(["core"], makeCtx());
    expect(result1.preserved).toContain("AGENTS.md");
    expect(readFile("AGENTS.md")).toBe(consumerContent);

    const result2 = await runUninstall(["core"], makeCtx());
    expect(result2.preserved).toContain("AGENTS.md");
    expect(readFile("AGENTS.md")).toBe(consumerContent);
  });
});

// ---------------------------------------------------------------------------
// runUninstall — --nuke with --yes (P2.T8)
// ---------------------------------------------------------------------------

describe("runUninstall — nuke", () => {
  it("--nuke --yes deletes all present files without interactive prompt", async () => {
    writeFile(".claude/settings.json", '{"hooks":{}}');
    writeFile("AGENTS.md", "# Consumer\n\n<!-- bkit:start -->\nbkit\n<!-- bkit:end -->\n");
    writeFile(".github/workflows/ci.yml", "consumer modified\n");
    writeBkitVersionFile({
      pinnedVersion: "0.7.0",
      tier3Hashes: { ".github/workflows/ci.yml": sha256("different\n") },
    });

    const result = await runUninstall(["core", "claude", "ci"], makeCtx({ nuke: true, yes: true }));

    // All present files should be deleted
    const deletes = result.deleted;
    expect(deletes).toContain(".claude/settings.json");
    expect(fileExists(".claude/settings.json")).toBe(false);
    expect(fileExists(".github/workflows/ci.yml")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// stripTier2JsonScope — pure JSON uninstall helper (BAR-167 Phase 1)
// ---------------------------------------------------------------------------

import { stripTier2JsonScope } from "./bkit-uninstall";
import type { JsonValue } from "./bkit-tiers";

describe("stripTier2JsonScope", () => {
  it("leaf-deletion: removes template-owned leaf when equal to template", () => {
    const template: Record<string, JsonValue> = {
      hooks: { SessionStart: [{ command: "bash preflight.sh" }] },
    };
    const consumer: Record<string, JsonValue> = {
      hooks: { SessionStart: [{ command: "bash preflight.sh" }] },
    };
    const result = stripTier2JsonScope(consumer, template);
    // hooks.SessionStart removed (equal to template); hooks is empty intermediate → pruned
    expect(result.hooks).toBeUndefined();
  });

  it("consumer-only sibling preservation: consumer-only keys untouched", () => {
    const template: Record<string, JsonValue> = {
      hooks: { SessionStart: [{ command: "bash preflight.sh" }] },
    };
    const consumer: Record<string, JsonValue> = {
      hooks: {
        SessionStart: [{ command: "bash preflight.sh" }],
        Stop: [{ command: "echo consumer" }],
      },
      customKey: "keep-me",
    };
    const result = stripTier2JsonScope(consumer, template);
    // SessionStart removed (template-equal); Stop preserved (consumer-only sibling)
    expect((result.hooks as Record<string, JsonValue>).Stop).toBeDefined();
    // customKey preserved (consumer-only top-level)
    expect(result.customKey).toBe("keep-me");
    // SessionStart gone
    expect((result.hooks as Record<string, JsonValue>).SessionStart).toBeUndefined();
  });

  it("empty-intermediate pruning: prunes empty intermediate only where template populated it", () => {
    const template: Record<string, JsonValue> = {
      a: { b: { c: 1 } },
    };
    const consumer: Record<string, JsonValue> = {
      a: { b: { c: 1 } }, // exactly matches template
      other: "x",
    };
    const result = stripTier2JsonScope(consumer, template);
    // a.b.c removed; a.b empty → pruned; a empty → pruned
    expect(result.a).toBeUndefined();
    // other preserved
    expect(result.other).toBe("x");
  });

  it("array preservation: arrays not template-equal are preserved", () => {
    const template: Record<string, JsonValue> = {
      permissions: { allow: ["Skill(*)"] },
    };
    const consumer: Record<string, JsonValue> = {
      permissions: { allow: ["Skill(*)", "Bash(*)"] }, // consumer extended the allow list
    };
    const result = stripTier2JsonScope(consumer, template);
    // Consumer permissions.allow differs from template → preserved
    expect((result.permissions as Record<string, JsonValue>).allow).toBeDefined();
  });

  it("does not mutate consumer", () => {
    const template: Record<string, JsonValue> = { a: 1 };
    const consumer: Record<string, JsonValue> = { a: 1, b: 2 };
    const consumerCopy = JSON.parse(JSON.stringify(consumer)) as Record<string, JsonValue>;
    stripTier2JsonScope(consumer, template);
    expect(consumer).toEqual(consumerCopy);
  });
});
