// bkit-upgrade.test.ts — Unit tests for the upgrade diff engine (P4.T5 / P4.T6).
//
// Tests: Derived Test Matrix rows
//   "Diff engine: staged content" (P4.T5)
//   "--non-interactive upgrade auto-apply" (P4.T6)

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  diffFile,
  runUpgrade,
  updateCanonicalHashesAfterUpgrade,
  LOG_PREFIX,
  type UpgradeConflict,
} from "./bkit-upgrade";
import { sha256, writeBkitVersion, readBkitVersion, type BkitVersion } from "./bkit-version";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-upgrade-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function writeFile(relPath: string, content: string): string {
  const abs = path.join(tmpDir, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf-8");
  return abs;
}

function writeBkitVersionInDir(v: BkitVersion): void {
  fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
  writeBkitVersion(path.join(tmpDir, ".agents", ".bkit-version"), v);
}

function makeVersion(
  canonicalHashes: Record<string, string> = {},
  tier3Hashes: Record<string, string> = {},
): BkitVersion {
  return { pinnedVersion: "0.8.0", tier3Hashes, canonicalHashes };
}

// ---------------------------------------------------------------------------
// P4.T5 — diffFile
// ---------------------------------------------------------------------------

describe("P4.T5 — diffFile", () => {
  it('returns "new" when file does not exist on disk', () => {
    const result = diffFile(
      ".claude/agents/bkit-foo.md",
      path.join(tmpDir, ".claude", "agents", "bkit-foo.md"),
      "template content\n",
      {},
    );
    expect(result.action).toBe("new");
    if (result.action === "new") {
      expect(result.templateContent).toBe("template content\n");
    }
  });

  it('returns "skip" when template content matches canonical hash (no change)', () => {
    const content = "bkit managed content\n";
    writeFile(".claude/agents/bkit-foo.md", content);
    const canonicalHashes = { ".claude/agents/bkit-foo.md": sha256(content) };
    // Template is the same content as what's recorded in canonicalHashes
    const result = diffFile(
      ".claude/agents/bkit-foo.md",
      path.join(tmpDir, ".claude", "agents", "bkit-foo.md"),
      content,
      canonicalHashes,
    );
    expect(result.action).toBe("skip");
  });

  it('returns "update" when template changed + disk matches canonical hash (no consumer drift)', () => {
    const oldContent = "old bkit content\n";
    const newTemplateContent = "new bkit content\n";
    const absPath = writeFile(".claude/agents/bkit-foo.md", oldContent);
    // canonicalHash records the OLD content (matching disk — no consumer drift)
    const canonicalHashes = { ".claude/agents/bkit-foo.md": sha256(oldContent) };
    const result = diffFile(
      ".claude/agents/bkit-foo.md",
      absPath,
      newTemplateContent,
      canonicalHashes,
    );
    expect(result.action).toBe("update");
    if (result.action === "update") {
      expect(result.templateContent).toBe(newTemplateContent);
    }
  });

  it('returns "conflict" when template changed + disk differs from canonical hash (consumer drift)', () => {
    const originalBkitContent = "original bkit content\n";
    const consumerModifiedContent = "consumer added extra line\n";
    const newTemplateContent = "updated bkit content\n";
    const absPath = writeFile(".claude/agents/bkit-foo.md", consumerModifiedContent);
    // canonicalHash records the original bkit content; disk has consumer modification
    const canonicalHashes = { ".claude/agents/bkit-foo.md": sha256(originalBkitContent) };
    const result = diffFile(
      ".claude/agents/bkit-foo.md",
      absPath,
      newTemplateContent,
      canonicalHashes,
    );
    expect(result.action).toBe("conflict");
    if (result.action === "conflict") {
      expect(result.templateContent).toBe(newTemplateContent);
      expect(result.diskContent).toBe(consumerModifiedContent);
    }
  });

  it('returns "skip" when disk content already equals template (idempotent)', () => {
    const content = "bkit content\n";
    const absPath = writeFile(".claude/agents/bkit-foo.md", content);
    // No canonicalHash recorded — unknown
    const result = diffFile(".claude/agents/bkit-foo.md", absPath, content, {});
    expect(result.action).toBe("skip");
  });

  it('returns "conflict" when no canonicalHash recorded and template differs from disk (safe default: block silent overwrite)', () => {
    const diskContent = "old content on disk\n";
    const newTemplateContent = "new template content\n";
    const absPath = writeFile(".claude/agents/bkit-foo.md", diskContent);
    // No canonicalHash for this file — isConsumerModified returns true (treats as modified)
    const result = diffFile(".claude/agents/bkit-foo.md", absPath, newTemplateContent, {});
    expect(result.action).toBe("conflict");
  });
});

// ---------------------------------------------------------------------------
// P4.T5 — runUpgrade (diff engine + apply)
// ---------------------------------------------------------------------------

describe("P4.T5 — runUpgrade diff engine", () => {
  it("upgrades a file with no consumer drift (update action)", () => {
    const oldContent = "old bkit content\n";
    const newContent = "new bkit content\n";
    writeFile(".claude/agents/bkit-foo.md", oldContent);

    // bkit-version: canonicalHash records old content
    writeBkitVersionInDir(makeVersion({ ".claude/agents/bkit-foo.md": sha256(oldContent) }));

    // Template file at pkg root
    const templatePath = writeFile(".bkit-staging/template/bkit-foo.md", newContent);

    const result = runUpgrade([{ relPath: ".claude/agents/bkit-foo.md", templatePath }], {
      nonInteractive: false,
      dryRun: false,
      cwd: tmpDir,
    });

    expect(result.updated).toContain(".claude/agents/bkit-foo.md");
    expect(result.conflicts).toHaveLength(0);
    expect(fs.readFileSync(path.join(tmpDir, ".claude", "agents", "bkit-foo.md"), "utf-8")).toBe(
      newContent,
    );
  });

  it("reports conflict when consumer drift detected (does NOT overwrite)", () => {
    const originalContent = "original bkit content\n";
    const consumerContent = "consumer modified\n";
    const newTemplateContent = "updated template\n";

    writeFile(".claude/agents/bkit-foo.md", consumerContent);
    writeBkitVersionInDir(makeVersion({ ".claude/agents/bkit-foo.md": sha256(originalContent) }));
    const templatePath = writeFile(".bkit-staging/template/bkit-foo.md", newTemplateContent);

    const result = runUpgrade([{ relPath: ".claude/agents/bkit-foo.md", templatePath }], {
      nonInteractive: false,
      dryRun: false,
      cwd: tmpDir,
    });

    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0]!.relPath).toBe(".claude/agents/bkit-foo.md");
    expect(result.updated).not.toContain(".claude/agents/bkit-foo.md");

    // Consumer file NOT overwritten
    expect(fs.readFileSync(path.join(tmpDir, ".claude", "agents", "bkit-foo.md"), "utf-8")).toBe(
      consumerContent,
    );
  });

  it("skips file when template unchanged (disk matches canonical hash)", () => {
    const content = "unchanged bkit content\n";
    writeFile(".claude/agents/bkit-foo.md", content);
    writeBkitVersionInDir(makeVersion({ ".claude/agents/bkit-foo.md": sha256(content) }));
    const templatePath = writeFile(".bkit-staging/template/bkit-foo.md", content);

    const result = runUpgrade([{ relPath: ".claude/agents/bkit-foo.md", templatePath }], {
      nonInteractive: false,
      dryRun: false,
      cwd: tmpDir,
    });

    expect(result.skipped).toContain(".claude/agents/bkit-foo.md");
    expect(result.updated).toHaveLength(0);
    expect(result.conflicts).toHaveLength(0);
  });

  it("creates new files that do not yet exist on disk", () => {
    const newContent = "new agent\n";
    const templatePath = writeFile(".bkit-staging/template/bkit-new.md", newContent);

    const result = runUpgrade([{ relPath: ".claude/agents/bkit-new.md", templatePath }], {
      nonInteractive: false,
      dryRun: false,
      cwd: tmpDir,
    });

    expect(result.updated).toContain(".claude/agents/bkit-new.md");
    expect(fs.readFileSync(path.join(tmpDir, ".claude", "agents", "bkit-new.md"), "utf-8")).toBe(
      newContent,
    );
  });

  it("dry-run does not write files but reports what would change", () => {
    const oldContent = "old content\n";
    const newContent = "new content\n";
    writeFile(".claude/agents/bkit-foo.md", oldContent);
    writeBkitVersionInDir(makeVersion({ ".claude/agents/bkit-foo.md": sha256(oldContent) }));
    const templatePath = writeFile(".bkit-staging/template/bkit-foo.md", newContent);

    const result = runUpgrade([{ relPath: ".claude/agents/bkit-foo.md", templatePath }], {
      nonInteractive: false,
      dryRun: true,
      cwd: tmpDir,
    });

    expect(result.updated).toContain(".claude/agents/bkit-foo.md");
    // File NOT written (dry-run)
    expect(fs.readFileSync(path.join(tmpDir, ".claude", "agents", "bkit-foo.md"), "utf-8")).toBe(
      oldContent,
    );
  });

  it("multiple candidates: mixed update/conflict/skip", () => {
    const oldBkit = "old bkit\n";
    const newTemplate = "new template\n";
    const consumerMod = "consumer modified\n";
    const unchanged = "unchanged\n";

    writeFile(".claude/agents/bkit-update.md", oldBkit);
    writeFile(".claude/agents/bkit-conflict.md", consumerMod);
    writeFile(".claude/agents/bkit-skip.md", unchanged);

    writeBkitVersionInDir(
      makeVersion({
        ".claude/agents/bkit-update.md": sha256(oldBkit),
        ".claude/agents/bkit-conflict.md": sha256(oldBkit), // original bkit content
        ".claude/agents/bkit-skip.md": sha256(unchanged),
      }),
    );

    const tUpdate = writeFile(".bkit-staging/t/update.md", newTemplate);
    const tConflict = writeFile(".bkit-staging/t/conflict.md", newTemplate);
    const tSkip = writeFile(".bkit-staging/t/skip.md", unchanged);

    const result = runUpgrade(
      [
        { relPath: ".claude/agents/bkit-update.md", templatePath: tUpdate },
        { relPath: ".claude/agents/bkit-conflict.md", templatePath: tConflict },
        { relPath: ".claude/agents/bkit-skip.md", templatePath: tSkip },
      ],
      { nonInteractive: false, dryRun: false, cwd: tmpDir },
    );

    expect(result.updated).toContain(".claude/agents/bkit-update.md");
    expect(result.conflicts.map((c) => c.relPath)).toContain(".claude/agents/bkit-conflict.md");
    expect(result.skipped).toContain(".claude/agents/bkit-skip.md");
  });

  it("skips missing template files without throwing", () => {
    const result = runUpgrade(
      [
        {
          relPath: ".claude/agents/bkit-foo.md",
          templatePath: path.join(tmpDir, "nonexistent.md"),
        },
      ],
      { nonInteractive: false, dryRun: false, cwd: tmpDir },
    );
    expect(result.updated).toHaveLength(0);
    expect(result.conflicts).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// P4.T6 — --non-interactive mode
// ---------------------------------------------------------------------------

describe("P4.T6 — --non-interactive upgrade auto-apply", () => {
  it("non-interactive: auto-applies non-conflicting changes", () => {
    const oldContent = "old bkit\n";
    const newContent = "new bkit\n";
    writeFile(".claude/agents/bkit-foo.md", oldContent);
    writeBkitVersionInDir(makeVersion({ ".claude/agents/bkit-foo.md": sha256(oldContent) }));
    const templatePath = writeFile(".bkit-staging/t/foo.md", newContent);

    const result = runUpgrade([{ relPath: ".claude/agents/bkit-foo.md", templatePath }], {
      nonInteractive: true,
      dryRun: false,
      cwd: tmpDir,
    });

    expect(result.updated).toContain(".claude/agents/bkit-foo.md");
    expect(result.conflicts).toHaveLength(0);
    expect(fs.readFileSync(path.join(tmpDir, ".claude", "agents", "bkit-foo.md"), "utf-8")).toBe(
      newContent,
    );
  });

  it("non-interactive: does NOT overwrite consumer drift (conflict preserved)", () => {
    const originalContent = "original bkit content\n";
    const consumerContent = "consumer modified\n";
    const newTemplateContent = "new bkit\n";

    writeFile(".claude/agents/bkit-foo.md", consumerContent);
    writeBkitVersionInDir(makeVersion({ ".claude/agents/bkit-foo.md": sha256(originalContent) }));
    const templatePath = writeFile(".bkit-staging/t/foo.md", newTemplateContent);

    const result = runUpgrade([{ relPath: ".claude/agents/bkit-foo.md", templatePath }], {
      nonInteractive: true,
      dryRun: false,
      cwd: tmpDir,
    });

    expect(result.conflicts).toHaveLength(1);
    // Consumer file NOT overwritten
    expect(fs.readFileSync(path.join(tmpDir, ".claude", "agents", "bkit-foo.md"), "utf-8")).toBe(
      consumerContent,
    );
  });

  it("non-interactive: returns conflicts list with relPath and content", () => {
    const originalContent = "bkit original\n";
    const consumerContent = "consumer drift\n";
    const newTemplateContent = "new template\n";

    writeFile(".claude/agents/bkit-test.md", consumerContent);
    writeBkitVersionInDir(makeVersion({ ".claude/agents/bkit-test.md": sha256(originalContent) }));
    const templatePath = writeFile(".bkit-staging/t/test.md", newTemplateContent);

    const result = runUpgrade([{ relPath: ".claude/agents/bkit-test.md", templatePath }], {
      nonInteractive: true,
      dryRun: false,
      cwd: tmpDir,
    });

    expect(result.conflicts).toHaveLength(1);
    const conflict = result.conflicts[0] as UpgradeConflict;
    expect(conflict.relPath).toBe(".claude/agents/bkit-test.md");
    expect(conflict.templateContent).toBe(newTemplateContent);
    expect(conflict.diskContent).toBe(consumerContent);
  });
});

// ---------------------------------------------------------------------------
// P4.T5 — updateCanonicalHashesAfterUpgrade
// ---------------------------------------------------------------------------

describe("P4.T5 — updateCanonicalHashesAfterUpgrade", () => {
  it("updates canonicalHashes for upgraded files in .bkit-version", () => {
    const newContent = "new template content\n";
    writeBkitVersionInDir(makeVersion({ ".claude/agents/bkit-old.md": sha256("old\n") }));
    const templatePath = writeFile(".bkit-staging/t/foo.md", newContent);

    const result = { updated: [".claude/agents/bkit-foo.md"], conflicts: [], skipped: [] };
    const candidates = [{ relPath: ".claude/agents/bkit-foo.md", templatePath }];

    updateCanonicalHashesAfterUpgrade(result, candidates, { dryRun: false, cwd: tmpDir });

    const updated = readBkitVersion(path.join(tmpDir, ".agents", ".bkit-version"));
    expect(updated).not.toBeNull();
    expect(updated!.canonicalHashes[".claude/agents/bkit-foo.md"]).toBe(sha256(newContent));
    // Previous entry retained
    expect(updated!.canonicalHashes[".claude/agents/bkit-old.md"]).toBe(sha256("old\n"));
  });

  it("is a no-op in dry-run mode", () => {
    const newContent = "new\n";
    writeBkitVersionInDir(makeVersion({ ".claude/agents/bkit-foo.md": sha256("old\n") }));
    const templatePath = writeFile(".bkit-staging/t/foo.md", newContent);

    const result = { updated: [".claude/agents/bkit-foo.md"], conflicts: [], skipped: [] };
    updateCanonicalHashesAfterUpgrade(
      result,
      [{ relPath: ".claude/agents/bkit-foo.md", templatePath }],
      { dryRun: true, cwd: tmpDir },
    );

    const v = readBkitVersion(path.join(tmpDir, ".agents", ".bkit-version"));
    // Hash should still be the old one (dry-run didn't update)
    expect(v!.canonicalHashes[".claude/agents/bkit-foo.md"]).toBe(sha256("old\n"));
  });

  it("is a no-op when no files were updated", () => {
    writeBkitVersionInDir(makeVersion({ ".claude/agents/bkit-foo.md": sha256("content\n") }));
    const result = { updated: [], conflicts: [], skipped: [] };
    // Should not throw
    expect(() =>
      updateCanonicalHashesAfterUpgrade(result, [], { dryRun: false, cwd: tmpDir }),
    ).not.toThrow();
  });

  it("seeds canonicalHashes for skipped files (disk == template) so future upgrades distinguish drift", () => {
    const content = "stable template content\n";
    // .bkit-version exists but has no entry for the skipped file (pre-DE-12 install).
    writeBkitVersionInDir(makeVersion({}));
    const templatePath = writeFile(".bkit-staging/t/foo.md", content);

    // diffFile would classify this as "skip" because diskHash === templateHash.
    const result = { updated: [], conflicts: [], skipped: [".claude/agents/bkit-foo.md"] };
    const candidates = [{ relPath: ".claude/agents/bkit-foo.md", templatePath }];

    updateCanonicalHashesAfterUpgrade(result, candidates, { dryRun: false, cwd: tmpDir });

    const updated = readBkitVersion(path.join(tmpDir, ".agents", ".bkit-version"));
    expect(updated).not.toBeNull();
    // Canonical hash now recorded — next upgrade can detect true drift instead of all-conflict.
    expect(updated!.canonicalHashes[".claude/agents/bkit-foo.md"]).toBe(sha256(content));
  });

  it("does NOT seed canonicalHashes for conflict files (would re-introduce silent overwrite)", () => {
    const templateContent = "new template content\n";
    writeBkitVersionInDir(makeVersion({}));
    const templatePath = writeFile(".bkit-staging/t/foo.md", templateContent);

    // Conflict means consumer drift was detected — we MUST NOT record a hash for these.
    const result = {
      updated: [],
      conflicts: [
        {
          relPath: ".claude/agents/bkit-foo.md",
          templateContent,
          diskContent: "consumer-customised\n",
        },
      ],
      skipped: [],
    };
    const candidates = [{ relPath: ".claude/agents/bkit-foo.md", templatePath }];

    updateCanonicalHashesAfterUpgrade(result, candidates, { dryRun: false, cwd: tmpDir });

    const v = readBkitVersion(path.join(tmpDir, ".agents", ".bkit-version"));
    expect(v!.canonicalHashes[".claude/agents/bkit-foo.md"]).toBeUndefined();
  });
});
