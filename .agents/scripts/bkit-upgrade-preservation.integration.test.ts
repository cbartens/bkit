// bkit-upgrade-preservation.integration.test.ts
//
// Regression coverage for the 2.5.0 `bkit upgrade` data-loss regression (issue #129):
// the upgrade engine whole-file-overwrote markered-text / json files, destroying
// consumer content OUTSIDE the bkit-managed block (e.g. secret-protection rules in
// `.gitignore`, the consumer's `mcpServers` in `.claude/settings.json`).
//
// The fix routes those formats through the SAME tier-aware writers the install path
// uses: markered-text → block-merge (writeTier2), json → deep-merge
// (writeTier2JsonContained). Both preserve every byte outside the managed region.
// These tests pin that property: fake consumer content outside the markers must
// survive an upgrade, while the bkit block is still updated to the new template.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  runUpgrade,
  updateCanonicalHashesAfterUpgrade,
  migrateStrayGitattributes,
  type UpgradeCandidate,
} from "./bkit-upgrade";
import { sha256, writeBkitVersion, readBkitVersion, type BkitVersion } from "./bkit-version";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-upgrade-preserve-"));
  fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeAbs(rel: string, content: string): string {
  const abs = path.join(tmpDir, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf-8");
  return abs;
}

function writeTemplate(name: string, content: string): string {
  const abs = path.join(tmpDir, ".templates", name);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf-8");
  return abs;
}

function seedVersion(canonicalHashes: Record<string, string> = {}): void {
  const v: BkitVersion = { pinnedVersion: "2.4.0", tier3Hashes: {}, canonicalHashes };
  writeBkitVersion(path.join(tmpDir, ".agents", ".bkit-version"), v);
}

function upgrade(candidates: UpgradeCandidate[]) {
  return runUpgrade(candidates, { nonInteractive: true, dryRun: false, cwd: tmpDir });
}

// ---------------------------------------------------------------------------
// markered-text — consumer content OUTSIDE the block must never be clobbered
// ---------------------------------------------------------------------------

describe("upgrade preserves consumer content outside the bkit block (markered-text)", () => {
  it(".gitignore — consumer secret-protection rules survive; bkit block is updated (the #129 case)", () => {
    // Consumer installed cleanly under 2.4.0 then never hand-edited the file, so its
    // on-disk content equals the recorded canonical hash — the exact state that made
    // 2.5.0 silently whole-file-overwrite it.
    const consumer =
      "# Consumer secrets — MUST survive\n" +
      ".env*.local\n" +
      "service-account-*.json\n" +
      "*.csv\n" +
      "\n" +
      "# <!-- bkit:start -->\n" +
      "node_modules/\n" +
      "STALE-bkit-entry/\n" +
      "# <!-- bkit:end -->\n";
    writeAbs(".gitignore", consumer);
    seedVersion({ ".gitignore": sha256(consumer) });

    const templatePath = writeTemplate(
      "gitignore",
      "# <!-- bkit:start -->\nnode_modules/\n.agents/advisories.md\n# <!-- bkit:end -->\n",
    );

    const result = upgrade([{ relPath: ".gitignore", templatePath, format: "markered-text" }]);

    const after = fs.readFileSync(path.join(tmpDir, ".gitignore"), "utf-8");
    // Consumer content outside the block is intact.
    expect(after).toContain("service-account-*.json");
    expect(after).toContain(".env*.local");
    expect(after).toContain("*.csv");
    // bkit block updated to the new template content.
    expect(after).toContain(".agents/advisories.md");
    expect(after).not.toContain("STALE-bkit-entry/");
    // Classified as an applied update, never a conflict/skip.
    expect(result.updated).toContain(".gitignore");
    expect(result.conflicts).toHaveLength(0);
  });

  it(".prettierignore — hash-comment markers; consumer ignores survive", () => {
    const consumer =
      "# Consumer prettier ignores — MUST survive\ncoverage/\nplaywright-report/\n*.generated.ts\n\n# bkit:start\nnode_modules/\nSTALE/\n# bkit:end\n";
    writeAbs(".prettierignore", consumer);
    seedVersion({ ".prettierignore": sha256(consumer) });

    const templatePath = writeTemplate(
      "prettierignore",
      "# bkit:start\nnode_modules/\ndist/\n# bkit:end\n",
    );

    upgrade([{ relPath: ".prettierignore", templatePath, format: "markered-text" }]);

    const after = fs.readFileSync(path.join(tmpDir, ".prettierignore"), "utf-8");
    expect(after).toContain("coverage/");
    expect(after).toContain("playwright-report/");
    expect(after).toContain("*.generated.ts");
    expect(after).toContain("dist/"); // new block content applied
    expect(after).not.toContain("STALE/");
  });

  it(".gitattributes — consumer custom attributes outside the block survive", () => {
    const consumer =
      "# Consumer attrs — MUST survive\n*.png binary\n*.lockb -diff\n\n# <!-- bkit:start -->\ndocs/pending.md merge=union\n# <!-- bkit:end -->\n";
    writeAbs(".gitattributes", consumer);
    seedVersion({ ".gitattributes": sha256(consumer) });

    const templatePath = writeTemplate(
      ".gitattributes",
      "# <!-- bkit:start -->\ndocs/pending.md     merge=union\ndocs/knowledge.md   merge=union\n# <!-- bkit:end -->\n",
    );

    upgrade([{ relPath: ".gitattributes", templatePath, format: "markered-text" }]);

    const after = fs.readFileSync(path.join(tmpDir, ".gitattributes"), "utf-8");
    expect(after).toContain("*.png binary");
    expect(after).toContain("*.lockb -diff");
    expect(after).toContain("docs/knowledge.md"); // new block content applied
  });

  it("docs/*.md — consumer prose AFTER bkit:end survives even with NO manifest entry (content-detected)", () => {
    // docs/*.md are markered but managed as a directory, so they have NO manifest
    // `format`. This is the case the reporter's #6 worried about: the consumer's
    // project prose lives after `bkit:end`, and a whole-file overwrite would eat it.
    // `format` is intentionally OMITTED here — block-merge must kick in from the
    // template's markers alone.
    const consumer =
      "<!-- bkit:start -->\n# Testing\n\n> bkit canonical guidance (OLD).\n<!-- bkit:end -->\n\n" +
      "## Our project testing notes — MUST survive\n\n" +
      "- We use Vitest + Playwright against a seeded Supabase branch.\n" +
      "- Nightly smoke suite tagged @smoke.\n";
    writeAbs("docs/testing.md", consumer);
    seedVersion({ "docs/testing.md": sha256(consumer) });

    const templatePath = writeTemplate(
      "testing.md",
      "<!-- bkit:start -->\n# Testing\n\n> bkit canonical guidance (NEW — slimmed).\n<!-- bkit:end -->\n",
    );

    const result = upgrade([{ relPath: "docs/testing.md", templatePath }]); // no format

    const after = fs.readFileSync(path.join(tmpDir, "docs/testing.md"), "utf-8");
    // Consumer prose after the end marker is intact.
    expect(after).toContain("## Our project testing notes — MUST survive");
    expect(after).toContain("seeded Supabase branch");
    expect(after).toContain("@smoke");
    // bkit block updated to the new (slimmed) guidance.
    expect(after).toContain("NEW — slimmed");
    expect(after).not.toContain("OLD");
    // Treated as a block-merge, never a whole-file conflict/overwrite.
    expect(result.conflicts).toHaveLength(0);
    expect(result.updated).toContain("docs/testing.md");
  });

  it("dest has NO bkit markers — block is appended at EOF, all consumer content preserved", () => {
    const consumer = "# Pre-existing consumer file, no bkit block\nlogs/\n.env\n";
    writeAbs(".gitignore", consumer);
    seedVersion();

    const templatePath = writeTemplate(
      "gitignore",
      "# <!-- bkit:start -->\nnode_modules/\n# <!-- bkit:end -->\n",
    );

    upgrade([{ relPath: ".gitignore", templatePath, format: "markered-text" }]);

    const after = fs.readFileSync(path.join(tmpDir, ".gitignore"), "utf-8");
    expect(after.startsWith(consumer)).toBe(true); // every original byte kept
    expect(after).toContain("<!-- bkit:start -->");
    expect(after).toContain("node_modules/");
  });
});

// ---------------------------------------------------------------------------
// json — consumer-owned keys must survive the deep-merge
// ---------------------------------------------------------------------------

describe("upgrade preserves consumer keys (json deep-merge)", () => {
  it(".claude/settings.json — consumer mcpServers survives; bkit keys merged in (the #129 case)", () => {
    const consumer = JSON.stringify(
      {
        mcpServers: { linear: { command: "npx", args: ["-y", "linear-mcp"] } },
        permissions: { allow: ["Read"] },
      },
      null,
      2,
    );
    writeAbs(".claude/settings.json", consumer + "\n");
    seedVersion({ ".claude/settings.json": sha256(consumer + "\n") });

    const templatePath = writeTemplate(
      "settings.json",
      JSON.stringify({ permissions: { allow: ["Bash"] }, bkitManaged: true }, null, 2) + "\n",
    );

    upgrade([{ relPath: ".claude/settings.json", templatePath, format: "json" }]);

    const after = JSON.parse(fs.readFileSync(path.join(tmpDir, ".claude/settings.json"), "utf-8"));
    // The consumer's Linear MCP server definition is NOT dropped.
    expect(after.mcpServers?.linear?.command).toBe("npx");
    // bkit-managed key merged in.
    expect(after.bkitManaged).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// canonical hash + idempotency — the merged on-disk content is recorded, so a
// second upgrade is a clean skip (never re-clobbers, never re-flags as drift).
// ---------------------------------------------------------------------------

describe("upgrade is idempotent for block-merge formats", () => {
  it("records the merged on-disk hash and skips on the second run", () => {
    const consumer =
      "# Consumer — keep\n*.csv\n\n# <!-- bkit:start -->\nnode_modules/\n# <!-- bkit:end -->\n";
    writeAbs(".gitignore", consumer);
    seedVersion({ ".gitignore": sha256(consumer) });

    const templatePath = writeTemplate(
      "gitignore",
      "# <!-- bkit:start -->\nnode_modules/\n.agents/advisories.md\n# <!-- bkit:end -->\n",
    );
    const candidate: UpgradeCandidate = {
      relPath: ".gitignore",
      templatePath,
      format: "markered-text",
    };

    const first = upgrade([candidate]);
    expect(first.updated).toContain(".gitignore");
    updateCanonicalHashesAfterUpgrade(first, { dryRun: false, cwd: tmpDir });

    const merged = fs.readFileSync(path.join(tmpDir, ".gitignore"), "utf-8");
    const recorded = readBkitVersion(path.join(tmpDir, ".agents", ".bkit-version"));
    // Hash recorded is of the MERGED disk content, not the template.
    expect(recorded!.canonicalHashes[".gitignore"]).toBe(sha256(merged));

    // Second run: block already current → no write, classified skipped, file untouched.
    const second = upgrade([candidate]);
    expect(second.updated).not.toContain(".gitignore");
    expect(second.skipped).toContain(".gitignore");
    expect(fs.readFileSync(path.join(tmpDir, ".gitignore"), "utf-8")).toBe(merged);
  });
});

// ---------------------------------------------------------------------------
// migrateStrayGitattributes — repair the 2.5.0 no-dot gitattributes regression
// ---------------------------------------------------------------------------

describe("migrateStrayGitattributes", () => {
  it("renames a stray dot-less `gitattributes` to `.gitattributes` and drops the bogus hash key", () => {
    writeAbs("gitattributes", "docs/pending.md merge=union\n");
    seedVersion({ gitattributes: sha256("docs/pending.md merge=union\n") });

    migrateStrayGitattributes(tmpDir, false);

    expect(fs.existsSync(path.join(tmpDir, ".gitattributes"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, "gitattributes"))).toBe(false);
    expect(fs.readFileSync(path.join(tmpDir, ".gitattributes"), "utf-8")).toBe(
      "docs/pending.md merge=union\n",
    );
    const v = readBkitVersion(path.join(tmpDir, ".agents", ".bkit-version"));
    expect(v!.canonicalHashes.gitattributes).toBeUndefined();
  });

  it("does NOT clobber an existing `.gitattributes` (leaves the stray for manual removal)", () => {
    writeAbs("gitattributes", "stray\n");
    writeAbs(".gitattributes", "real consumer content\n");
    seedVersion();

    migrateStrayGitattributes(tmpDir, false);

    expect(fs.readFileSync(path.join(tmpDir, ".gitattributes"), "utf-8")).toBe(
      "real consumer content\n",
    );
  });

  it("dry-run does not move the file", () => {
    writeAbs("gitattributes", "x\n");
    seedVersion();

    migrateStrayGitattributes(tmpDir, true);

    expect(fs.existsSync(path.join(tmpDir, "gitattributes"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".gitattributes"))).toBe(false);
  });

  it("is a no-op when there is no stray file", () => {
    seedVersion();
    expect(() => migrateStrayGitattributes(tmpDir, false)).not.toThrow();
    expect(fs.existsSync(path.join(tmpDir, ".gitattributes"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// seed-or-print (Tier 3 byte-equal) — consumer owns it after seeding; upgrade
// must never overwrite a present one, even when there is no whole-file drift.
// ---------------------------------------------------------------------------

describe("upgrade never overwrites a present seed-or-print file (#129 §1)", () => {
  it(".husky/pre-commit — consumer steps preserved even when current == canonical", () => {
    // Consumer's pre-commit: their steps + an old bkit block. At a prior install bkit
    // recorded THIS as canonical (their customisation IS the baseline) → no whole-file
    // drift, which previously licensed a silent overwrite.
    const consumer =
      "#!/usr/bin/env sh\n" +
      "pnpm lint-staged\n" +
      "pnpm run test:placeholders   # consumer step — MUST survive\n" +
      "# bkit:start\npnpm lint:prose && pnpm lint:slop\n# bkit:end\n";
    writeAbs(".husky/pre-commit", consumer);
    seedVersion({ ".husky/pre-commit": sha256(consumer) }); // current == canonical

    const templatePath = writeTemplate(
      "pre-commit",
      "#!/usr/bin/env sh\npnpm lint-staged && pnpm lint:prose && pnpm lint:slop\n",
    );

    const result = upgrade([
      { relPath: ".husky/pre-commit", templatePath, format: "byte-equal-text", seedOrPrint: true },
    ]);

    // File untouched — every consumer byte preserved.
    expect(fs.readFileSync(path.join(tmpDir, ".husky/pre-commit"), "utf-8")).toBe(consumer);
    // Surfaced as a conflict (for the consumer to review), never a silent update.
    expect(result.conflicts.map((c) => c.relPath)).toContain(".husky/pre-commit");
    expect(result.updated).not.toContain(".husky/pre-commit");
  });

  it("present seed-or-print already matching the template → skip (no spurious conflict)", () => {
    const content = "#!/usr/bin/env sh\npnpm lint-staged\n";
    writeAbs(".husky/pre-commit", content);
    seedVersion({ ".husky/pre-commit": sha256(content) });
    const templatePath = writeTemplate("pre-commit", content); // identical

    const result = upgrade([
      { relPath: ".husky/pre-commit", templatePath, format: "byte-equal-text", seedOrPrint: true },
    ]);

    expect(result.skipped).toContain(".husky/pre-commit");
    expect(result.conflicts).toHaveLength(0);
  });

  it("canonical byte-equal (NOT seed-or-print) still auto-updates when no consumer drift", () => {
    const old = "router v1\n";
    writeAbs(".github/workflows/bkit-cloud.yml", old);
    seedVersion({ ".github/workflows/bkit-cloud.yml": sha256(old) }); // current == canonical
    const templatePath = writeTemplate("bkit-cloud.yml", "router v2\n");

    const result = upgrade([
      // no seedOrPrint → canonical, bkit owns it end-to-end
      { relPath: ".github/workflows/bkit-cloud.yml", templatePath, format: "byte-equal-text" },
    ]);

    expect(result.updated).toContain(".github/workflows/bkit-cloud.yml");
    expect(fs.readFileSync(path.join(tmpDir, ".github/workflows/bkit-cloud.yml"), "utf-8")).toBe(
      "router v2\n",
    );
  });

  it("honors contentOverride — writes rendered content, never the raw sentinel template (issue #138)", () => {
    const old = "rendered v1\n";
    writeAbs(".github/workflows/bkit-cloud.yml", old);
    seedVersion({ ".github/workflows/bkit-cloud.yml": sha256(old) });
    // Raw template carries an unresolved sentinel that must NEVER reach the consumer.
    const templatePath = writeTemplate(
      "bkit-cloud.yml",
      "@@CLOUD_TRACKER_SECRET_ENV@@\nraw v2 with mcp__linear__*\n",
    );

    const result = upgrade([
      {
        relPath: ".github/workflows/bkit-cloud.yml",
        templatePath,
        format: "byte-equal-text",
        // What renderCloudWorkflow(tracker) produced — install + upgrade share this.
        contentOverride: "rendered v2 (github, no linear)\n",
      },
    ]);

    expect(result.updated).toContain(".github/workflows/bkit-cloud.yml");
    const written = fs.readFileSync(path.join(tmpDir, ".github/workflows/bkit-cloud.yml"), "utf-8");
    expect(written).toBe("rendered v2 (github, no linear)\n");
    expect(written).not.toContain("@@CLOUD_TRACKER"); // raw sentinel never written
    expect(written).not.toContain("mcp__linear__*"); // raw template's Linear bits never written
  });
});

// ---------------------------------------------------------------------------
// token substitution on upgrade (#129 §2) — upgrade must substitute {{TOKENS}}
// like install (writeTier1/writeTier3), not write the literal placeholder.
// ---------------------------------------------------------------------------

describe("upgrade substitutes template tokens (#129 §2)", () => {
  it("seeds an absent byte-equal file with {{DEFAULT_BRANCH}} resolved, not literal", () => {
    seedVersion();
    const templatePath = writeTemplate(
      "pre-commit",
      "#!/usr/bin/env sh\n# guard: dev|{{DEFAULT_BRANCH}}\npnpm lint-staged\n",
    );

    const result = runUpgrade(
      [
        {
          relPath: ".husky/pre-commit",
          templatePath,
          format: "byte-equal-text",
          seedOrPrint: true,
        },
      ],
      {
        nonInteractive: true,
        dryRun: false,
        cwd: tmpDir,
        tokens: { NODE_VERSION: "22", DEFAULT_BRANCH: "main", PROJECT_NAME: "x" },
      },
    );

    const after = fs.readFileSync(path.join(tmpDir, ".husky/pre-commit"), "utf-8");
    expect(after).toContain("dev|main");
    expect(after).not.toContain("{{DEFAULT_BRANCH}}");
    expect(result.updated).toContain(".husky/pre-commit"); // seeded (new)
  });
});
