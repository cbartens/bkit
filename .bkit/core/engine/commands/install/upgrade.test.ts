// commands/install/upgrade.test.ts — Unit tests for the upgrade diff engine (P4.T5 / P4.T6).
//
// Tests: Derived Test Matrix rows
//   "Diff engine: staged content" (P4.T5)
//   "--non-interactive upgrade auto-apply" (P4.T6)

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  diffFile,
  runUpgrade,
  updateCanonicalHashesAfterUpgrade,
  planSelfBump,
  type UpgradeConflict,
  detectInstalledHostModules,
} from "./upgrade";
import {
  sha256,
  writeBkitVersion,
  readBkitVersion,
  type BkitVersion,
} from "../../install/version-file";
import { getCoreRoot } from "../../shared/package-roots";

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
  writeBkitVersion(path.join(tmpDir, ".bkit", "version"), v);
}

function makeVersion(canonicalHashes: Record<string, string> = {}): BkitVersion {
  return { pinnedVersion: "0.8.0", canonicalHashes, claudeAllowDerived: [] };
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

  it('tags a disk-equals-template skip as "in-sync"', () => {
    const content = "bkit content\n";
    const absPath = writeFile(".claude/agents/bkit-foo.md", content);
    const result = diffFile(".claude/agents/bkit-foo.md", absPath, content, {});
    expect(result).toEqual({ action: "skip", reason: "in-sync" });
  });

  it('tags a template-unchanged skip over a consumer-drifted file as "template-unchanged" (#459)', () => {
    const template = "bkit content\n";
    const absPath = writeFile(".claude/agents/bkit-foo.md", "consumer edit\n");
    const result = diffFile(".claude/agents/bkit-foo.md", absPath, template, {
      ".claude/agents/bkit-foo.md": sha256(template),
    });
    expect(result).toEqual({ action: "skip", reason: "template-unchanged" });
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
// Skipped files whose disk content may be recorded as the canonical hash
// ---------------------------------------------------------------------------

describe("runUpgrade — skippedSeedable (#459)", () => {
  const WHOLE = ".bkit/scripts/bkit-foo.sh";

  function upgradeOnce(relPath: string, template: string, format?: "markered-text") {
    const templatePath = writeFile(`.bkit-staging/template/${path.basename(relPath)}`, template);
    return runUpgrade([{ relPath, templatePath, format }], {
      nonInteractive: false,
      dryRun: false,
      cwd: tmpDir,
    });
  }

  it("whole-file skip with disk == template is seedable", () => {
    writeFile(WHOLE, "bkit script\n");
    writeBkitVersionInDir(makeVersion({}));

    const result = upgradeOnce(WHOLE, "bkit script\n");

    expect(result.skipped).toEqual([WHOLE]);
    expect(result.skippedSeedable).toEqual([WHOLE]);
  });

  it("whole-file skip over a consumer-drifted file (template unchanged) is NOT seedable", () => {
    const template = "bkit script\n";
    writeFile(WHOLE, "bkit script\n# consumer edit\n");
    writeBkitVersionInDir(makeVersion({ [WHOLE]: sha256(template) }));

    const result = upgradeOnce(WHOLE, template);

    expect(result.skipped).toEqual([WHOLE]);
    expect(result.skippedSeedable).toEqual([]);
  });

  it("block-merge skip is seedable even though disk carries consumer prose outside the block", () => {
    const template = "<!-- bkit:start -->\nmanaged\n<!-- bkit:end -->\n";
    writeFile("docs/foo.md", `${template}\nconsumer prose\n`);
    writeBkitVersionInDir(makeVersion({}));
    // First pass settles the block-merge layout; the second is the skip under test.
    upgradeOnce("docs/foo.md", template, "markered-text");

    const result = upgradeOnce("docs/foo.md", template, "markered-text");

    expect(fs.readFileSync(path.join(tmpDir, "docs/foo.md"), "utf-8")).toContain("consumer prose");
    expect(result.skipped).toEqual(["docs/foo.md"]);
    expect(result.skippedSeedable).toEqual(["docs/foo.md"]);
  });

  it("a consumer edit survives a no-op upgrade and is a conflict on the next template change", () => {
    const v1 = "bkit script v1\n";
    const edited = `${v1}# consumer edit\n`;
    writeFile(WHOLE, edited);
    writeBkitVersionInDir(makeVersion({ [WHOLE]: sha256(v1) }));

    // Upgrade 1: template unchanged → skip; the recorded hash must stay bkit's.
    const first = upgradeOnce(WHOLE, v1);
    updateCanonicalHashesAfterUpgrade(first, { dryRun: false, cwd: tmpDir });
    const recorded = readBkitVersion(path.join(tmpDir, ".bkit", "version"));
    expect(recorded!.canonicalHashes[WHOLE]).toBe(sha256(v1));

    // Upgrade 2: template changes → conflict, consumer edit untouched.
    const second = upgradeOnce(WHOLE, "bkit script v2\n");
    expect(second.updated).not.toContain(WHOLE);
    expect(second.conflicts.map((c) => c.relPath)).toEqual([WHOLE]);
    expect(fs.readFileSync(path.join(tmpDir, WHOLE), "utf-8")).toBe(edited);
  });
});

// ---------------------------------------------------------------------------
// markered-text marker classification and marker-less append through runUpgrade
// ---------------------------------------------------------------------------

describe("runUpgrade — markered-text (#422)", () => {
  const REL = path.join(".claude", "hooks", "gateguard.cjs");
  const templateContent =
    "#!/usr/bin/env node\n// bkit:start\nfunction bkitGateguard() {}\n// bkit:end\nrest of driver\n";

  it("template with a slash-prefixed HTML marker (// <!-- bkit:start -->) is classified html-comment, not slash-comment (site-9 mis-classification trap)", () => {
    // detectMarkerStyle checks the (possibly prefixed) html-comment marker before the
    // bare slash-comment marker, so this template classifies as html-comment.
    const htmlPrefixedTemplate =
      "// header\n// <!-- bkit:start -->\nbkit html-in-js block\n// <!-- bkit:end -->\nrest\n";
    const templatePath = writeFile(".bkit-staging/template/weird.js", htmlPrefixedTemplate);

    const result = runUpgrade([{ relPath: "weird.js", templatePath, format: "markered-text" }], {
      nonInteractive: false,
      dryRun: false,
      cwd: tmpDir,
    });

    expect(result.updated).toContain("weird.js");
    expect(fs.readFileSync(path.join(tmpDir, "weird.js"), "utf-8")).toContain(
      "bkit html-in-js block",
    );
  });

  it("a marker-less consumer file gets the block appended, its own content kept", () => {
    const consumerContent = "#!/usr/bin/env node\n// consumer content, no markers\n";
    writeFile(REL, consumerContent);
    writeBkitVersionInDir(makeVersion({}));
    const templatePath = writeFile(".bkit-staging/template/gateguard.cjs", templateContent);

    const result = runUpgrade([{ relPath: REL, templatePath, format: "markered-text" }], {
      nonInteractive: false,
      dryRun: false,
      cwd: tmpDir,
    });

    expect(result.updated).toContain(REL);
    const onDisk = fs.readFileSync(path.join(tmpDir, REL), "utf-8");
    expect(onDisk).toContain("consumer content, no markers");
    expect(onDisk).toContain("// bkit:start");
  });

  it("the shipped hook template upgrades to its generated form: shared parts spliced into the block", () => {
    writeFile(REL, "// bkit:start\nold engine\n// bkit:end\n// consumer driver\n");
    writeBkitVersionInDir(makeVersion({}));
    const templatePath = path.join(getCoreRoot(), ".claude", "hooks", "bkit-gateguard.cjs");

    const result = runUpgrade([{ relPath: REL, templatePath, format: "markered-text" }], {
      nonInteractive: false,
      dryRun: false,
      cwd: tmpDir,
    });

    expect(result.updated).toContain(REL);
    const onDisk = fs.readFileSync(path.join(tmpDir, REL), "utf-8");
    expect(onDisk).toContain("function firstTouchAdvice(");
    expect(onDisk).not.toContain("{{BKIT_PART");
    expect(onDisk).not.toContain("old engine");
    expect(onDisk.endsWith("// consumer driver\n")).toBe(true);
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
  it("records the on-disk hash of upgraded files in .bkit-version", () => {
    const newContent = "new template content\n";
    writeBkitVersionInDir(makeVersion({ ".claude/agents/bkit-old.md": sha256("old\n") }));
    // The dest file exists on disk (runUpgrade just wrote/merged it) — the hash is
    // taken from disk, NOT the template, so block/scope-merged files record correctly.
    writeFile(".claude/agents/bkit-foo.md", newContent);

    const result = {
      updated: [".claude/agents/bkit-foo.md"],
      conflicts: [],
      skipped: [],
      skippedSeedable: [],
    };
    updateCanonicalHashesAfterUpgrade(result, { dryRun: false, cwd: tmpDir });

    const updated = readBkitVersion(path.join(tmpDir, ".bkit", "version"));
    expect(updated).not.toBeNull();
    expect(updated!.canonicalHashes[".claude/agents/bkit-foo.md"]).toBe(sha256(newContent));
    // Previous entry retained
    expect(updated!.canonicalHashes[".claude/agents/bkit-old.md"]).toBe(sha256("old\n"));
  });

  it("is a no-op in dry-run mode", () => {
    writeBkitVersionInDir(makeVersion({ ".claude/agents/bkit-foo.md": sha256("old\n") }));
    writeFile(".claude/agents/bkit-foo.md", "new\n");

    const result = {
      updated: [".claude/agents/bkit-foo.md"],
      conflicts: [],
      skipped: [],
      skippedSeedable: [],
    };
    updateCanonicalHashesAfterUpgrade(result, { dryRun: true, cwd: tmpDir });

    const v = readBkitVersion(path.join(tmpDir, ".bkit", "version"));
    // Hash should still be the old one (dry-run didn't update)
    expect(v!.canonicalHashes[".claude/agents/bkit-foo.md"]).toBe(sha256("old\n"));
  });

  it("is a no-op when no files were updated", () => {
    writeBkitVersionInDir(makeVersion({ ".claude/agents/bkit-foo.md": sha256("content\n") }));
    const result = { updated: [], conflicts: [], skipped: [], skippedSeedable: [] };
    // Should not throw
    expect(() =>
      updateCanonicalHashesAfterUpgrade(result, { dryRun: false, cwd: tmpDir }),
    ).not.toThrow();
  });

  it("seeds canonicalHashes for skipped files (disk == template) so future upgrades distinguish drift", () => {
    const content = "stable template content\n";
    // .bkit-version exists but has no entry for the skipped file (pre-DE-12 install).
    writeBkitVersionInDir(makeVersion({}));
    writeFile(".claude/agents/bkit-foo.md", content);

    const result = {
      updated: [],
      conflicts: [],
      skipped: [".claude/agents/bkit-foo.md"],
      skippedSeedable: [".claude/agents/bkit-foo.md"],
    };
    updateCanonicalHashesAfterUpgrade(result, { dryRun: false, cwd: tmpDir });

    const updated = readBkitVersion(path.join(tmpDir, ".bkit", "version"));
    expect(updated).not.toBeNull();
    // Canonical hash now recorded — next upgrade can detect true drift instead of all-conflict.
    expect(updated!.canonicalHashes[".claude/agents/bkit-foo.md"]).toBe(sha256(content));
  });

  it("does NOT re-seed a skipped file outside skippedSeedable — keeps bkit's recorded hash (#459)", () => {
    const bkitContent = "bkit content\n";
    writeBkitVersionInDir(makeVersion({ ".claude/agents/bkit-foo.md": sha256(bkitContent) }));
    writeFile(".claude/agents/bkit-foo.md", "consumer edit\n");

    const result = {
      updated: [],
      conflicts: [],
      skipped: [".claude/agents/bkit-foo.md"],
      skippedSeedable: [],
    };
    updateCanonicalHashesAfterUpgrade(result, { dryRun: false, cwd: tmpDir });

    const v = readBkitVersion(path.join(tmpDir, ".bkit", "version"));
    expect(v!.canonicalHashes[".claude/agents/bkit-foo.md"]).toBe(sha256(bkitContent));
  });

  it("does NOT seed canonicalHashes for conflict files (would re-introduce silent overwrite)", () => {
    writeBkitVersionInDir(makeVersion({}));
    // Even though a consumer-customised file exists on disk, conflicts are never seeded.
    writeFile(".claude/agents/bkit-foo.md", "consumer-customised\n");

    const result = {
      updated: [],
      conflicts: [
        {
          relPath: ".claude/agents/bkit-foo.md",
          templateContent: "new template content\n",
          diskContent: "consumer-customised\n",
        },
      ],
      skipped: [],
      skippedSeedable: [],
    };
    updateCanonicalHashesAfterUpgrade(result, { dryRun: false, cwd: tmpDir });

    const v = readBkitVersion(path.join(tmpDir, ".bkit", "version"));
    expect(v!.canonicalHashes[".claude/agents/bkit-foo.md"]).toBeUndefined();
  });

  it("bumps pinnedVersion to the upgraded-to version, even with no files processed (#129 §3)", () => {
    writeBkitVersionInDir(makeVersion({})); // pinnedVersion "0.8.0"
    const result = { updated: [], conflicts: [], skipped: [], skippedSeedable: [] };

    // A clean upgrade where everything was a no-op skip still bumps the pin.
    updateCanonicalHashesAfterUpgrade(result, {
      dryRun: false,
      cwd: tmpDir,
      pinnedVersion: "2.5.1",
    });

    const v = readBkitVersion(path.join(tmpDir, ".bkit", "version"));
    expect(v!.pinnedVersion).toBe("2.5.1");
  });

  it("does not rewrite .bkit-version when the pin is already current and no files processed", () => {
    writeBkitVersionInDir(makeVersion({ "x.md": sha256("x") }));
    const result = { updated: [], conflicts: [], skipped: [], skippedSeedable: [] };

    updateCanonicalHashesAfterUpgrade(result, {
      dryRun: false,
      cwd: tmpDir,
      pinnedVersion: "0.8.0",
    });

    const v = readBkitVersion(path.join(tmpDir, ".bkit", "version"));
    expect(v!.pinnedVersion).toBe("0.8.0");
    expect(v!.canonicalHashes["x.md"]).toBe(sha256("x")); // untouched
  });
});

// ---------------------------------------------------------------------------
// planSelfBump — `bkit upgrade --to=<v>` / `--latest` decision (atomic bump+render)
// ---------------------------------------------------------------------------

describe("planSelfBump", () => {
  // resolveLatest must NOT be called unless --latest is set; this throws to prove it.
  const neverResolve = (): string => {
    throw new Error("resolveLatest should not be called");
  };

  it("--to a newer version → bump", () => {
    const p = planSelfBump("4.1.4", { toVersion: "4.2.0", latest: false }, neverResolve);
    expect(p).toEqual({ kind: "bump", target: "4.2.0" });
  });

  it("--to the currently-installed version → noop (caller re-renders in place)", () => {
    const p = planSelfBump("4.1.4", { toVersion: "4.1.4", latest: false }, neverResolve);
    expect(p).toEqual({ kind: "noop", target: "4.1.4" });
  });

  it("tolerates a leading v on --to and on the installed version", () => {
    expect(planSelfBump("v4.1.4", { toVersion: "v4.1.4", latest: false }, neverResolve)).toEqual({
      kind: "noop",
      target: "4.1.4",
    });
    expect(planSelfBump("4.1.4", { toVersion: "v4.2.0", latest: false }, neverResolve)).toEqual({
      kind: "bump",
      target: "4.2.0",
    });
  });

  it("accepts a prerelease target", () => {
    const p = planSelfBump("4.1.4", { toVersion: "4.2.0-rc.1", latest: false }, neverResolve);
    expect(p).toEqual({ kind: "bump", target: "4.2.0-rc.1" });
  });

  it("rejects a non-semver --to value as invalid (no resolveLatest call)", () => {
    const p = planSelfBump("4.1.4", { toVersion: "latest", latest: false }, neverResolve);
    expect(p.kind).toBe("invalid");
    if (p.kind === "invalid") expect(p.message).toContain("must be a semver");
  });

  it("--latest resolves via the injected resolver, then bumps", () => {
    const p = planSelfBump("4.1.4", { toVersion: null, latest: true }, () => "4.3.0");
    expect(p).toEqual({ kind: "bump", target: "4.3.0" });
  });

  it("--latest that resolves to the installed version → noop", () => {
    const p = planSelfBump("4.1.4", { toVersion: null, latest: true }, () => "v4.1.4");
    expect(p).toEqual({ kind: "noop", target: "4.1.4" });
  });

  it("--latest that resolves to garbage → invalid (pin explicitly)", () => {
    const p = planSelfBump("4.1.4", { toVersion: null, latest: true }, () => "not-a-version");
    expect(p.kind).toBe("invalid");
    if (p.kind === "invalid") expect(p.message).toContain("--to=<version>");
  });
});

describe("detectInstalledHostModules — host detection for upgrade re-render", () => {
  let cwd: string;
  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-detect-hosts-"));
  });
  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
  });

  it("returns an empty set when no host agents dir exists (never seeds core)", () => {
    expect(detectInstalledHostModules(cwd).size).toBe(0);
  });

  it("detects only the hosts whose agents dir is present", () => {
    fs.mkdirSync(path.join(cwd, ".claude", "agents"), { recursive: true });
    fs.mkdirSync(path.join(cwd, ".opencode", "agents"), { recursive: true });
    expect([...detectInstalledHostModules(cwd)].sort()).toEqual(["claude", "opencode"]);
  });
});
