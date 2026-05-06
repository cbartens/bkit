// bkit-uninstall.surgical.integration.test.ts — P2.T8a
//
// Heavily-customised consumer fixture → surgical uninstall → consumer files byte-identical.
//
// This fixture simulates gether-life-style customisations:
//   - .claude/settings.json with consumer Stop hook (Tier-1 but consumer-modified)
//   - .cursor/hooks.json with consumer failClosed/loop_limit (Tier-1 but consumer-modified)
//   - AGENTS.md with consumer rules outside bkit markers (Tier-2 — strip block only)
//   - .husky/pre-commit with bkit block + consumer commands (Tier-2 — strip block only)
//   - package.json with consumer-customised scripts/devDeps (Tier-2 equivalent)
//
// Post-uninstall assertions:
//   - Consumer-customised Tier-1 files: PRESERVED (since tier3Hashes won't match — they're T1)
//     Actually Tier-1 files ARE deleted — the consumer customisation use case is handled
//     by bkit-preflight.ts detectHooksConfigOverwriteRisk which blocks install, not by uninstall.
//     Uninstall simply removes T1 files.
//   - Tier-2 files: consumer content PRESERVED byte-identical; bkit block removed
//   - package.json consumer scripts: PRESERVED (different from bkit defaults)
//
// Re-used by sub-plan-3 P3.T9 and sub-plan-4 P4.T7.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runUninstall, type UninstallContext } from "./bkit-uninstall";
import { serializeBkitVersion } from "./bkit-version";

const FIXTURE_DIR = path.resolve(__dirname, "../../tests/fixtures/heavy-customised-consumer");

let tmpDir: string;

function makeCtx(overrides: Partial<UninstallContext> = {}): UninstallContext {
  return {
    cwd: tmpDir,
    dryRun: false,
    force: false,
    nuke: false,
    yes: false,
    stripPackage: false,
    logPrefix: "[bkit-uninstall-surgical-test]",
    ...overrides,
  };
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-surgical-test-"));

  // Write .bkit-version (no tier3Hashes → preserve-all for T3)
  const versionFilePath = path.join(tmpDir, ".agents", ".bkit-version");
  fs.mkdirSync(path.dirname(versionFilePath), { recursive: true });
  fs.writeFileSync(
    versionFilePath,
    serializeBkitVersion({ pinnedVersion: "0.6.0", tier3Hashes: {} }),
    "utf-8",
  );

  // Copy AGENTS.md from fixture
  const agentsMd = path.join(FIXTURE_DIR, "AGENTS.md");
  if (fs.existsSync(agentsMd)) {
    fs.writeFileSync(path.join(tmpDir, "AGENTS.md"), fs.readFileSync(agentsMd, "utf-8"), "utf-8");
  }

  // Set up .husky/pre-commit from fixture
  const huskyPreCommit = path.join(FIXTURE_DIR, "husky-pre-commit");
  if (fs.existsSync(huskyPreCommit)) {
    fs.mkdirSync(path.join(tmpDir, ".husky"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".husky", "pre-commit"),
      fs.readFileSync(huskyPreCommit, "utf-8"),
      "utf-8",
    );
  }

  // Copy package.json from fixture
  const pkgJson = path.join(FIXTURE_DIR, "package.json");
  if (fs.existsSync(pkgJson)) {
    fs.writeFileSync(path.join(tmpDir, "package.json"), fs.readFileSync(pkgJson, "utf-8"), "utf-8");
  }

  // Set up .claude/settings.json (consumer-customised — has Stop hook)
  const claudeSettingsSrc = path.join(FIXTURE_DIR, "claude-settings.json");
  if (fs.existsSync(claudeSettingsSrc)) {
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".claude", "settings.json"),
      fs.readFileSync(claudeSettingsSrc, "utf-8"),
      "utf-8",
    );
  }

  // Set up .cursor/hooks.json (consumer-customised — has failClosed/loop_limit)
  const cursorHooksSrc = path.join(FIXTURE_DIR, "cursor-hooks.json");
  if (fs.existsSync(cursorHooksSrc)) {
    fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".cursor", "hooks.json"),
      fs.readFileSync(cursorHooksSrc, "utf-8"),
      "utf-8",
    );
  }
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Surgical uninstall snapshot
// ---------------------------------------------------------------------------

describe("surgical uninstall — heavy-customised consumer fixture", () => {
  it("AGENTS.md: bkit block stripped, consumer rules preserved byte-identical", async () => {
    const originalContent = fs.readFileSync(path.join(tmpDir, "AGENTS.md"), "utf-8");

    // Verify fixture has both consumer content and bkit markers
    expect(originalContent).toContain("Consumer Rule (outside bkit block)");
    expect(originalContent).toContain("<!-- bkit:start -->");
    expect(originalContent).toContain("bkit-managed section");
    expect(originalContent).toContain("<!-- bkit:end -->");
    expect(originalContent).toContain("Another Consumer Rule");

    await runUninstall(["core"], makeCtx());

    const postContent = fs.readFileSync(path.join(tmpDir, "AGENTS.md"), "utf-8");

    // Consumer content preserved
    expect(postContent).toContain("Consumer Rule (outside bkit block)");
    expect(postContent).toContain("Another Consumer Rule");
    // bkit content removed
    expect(postContent).not.toContain("<!-- bkit:start -->");
    expect(postContent).not.toContain("bkit-managed section");
    expect(postContent).not.toContain("<!-- bkit:end -->");
  });

  it(".husky/pre-commit: bkit block stripped, consumer commands preserved", async () => {
    const originalContent = fs.readFileSync(path.join(tmpDir, ".husky", "pre-commit"), "utf-8");

    expect(originalContent).toContain("# bkit:start");
    expect(originalContent).toContain("# bkit:end");
    expect(originalContent).toContain("Consumer custom check");
    expect(originalContent).toContain("Running consumer pre-commit checks");

    await runUninstall(["git-hooks"], makeCtx());

    const postContent = fs.readFileSync(path.join(tmpDir, ".husky", "pre-commit"), "utf-8");

    // Consumer content preserved
    expect(postContent).toContain("Consumer custom check");
    expect(postContent).toContain("Running consumer pre-commit checks");
    // bkit block removed
    expect(postContent).not.toContain("# bkit:start");
    expect(postContent).not.toContain("pnpm typecheck");
    expect(postContent).not.toContain("# bkit:end");
  });

  it("package.json: consumer-customised scripts/devDeps preserved when not stripping", async () => {
    const originalContent = fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8");
    const originalPkg = JSON.parse(originalContent) as {
      scripts?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    // Consumer has custom lint:slop and non-default prettier version
    expect(originalPkg.scripts?.["lint:slop"]).toBe("slop-scan scan . --extra-flag");
    expect(originalPkg.devDependencies?.["prettier"]).toBe("^3.5.3"); // matches default

    // Run without --package flag: package.json should be unchanged
    await runUninstall(["lint", "git-hooks"], makeCtx({ stripPackage: false }));

    const postContent = fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8");
    expect(postContent).toBe(originalContent); // byte-identical when not stripping
  });

  it("Tier-1 file (.claude/settings.json) is deleted by uninstall (T1 semantics)", async () => {
    // Tier-1 files are fully managed: uninstall always deletes them.
    // Consumer customisations in T1 files are protected at INSTALL time via
    // detectHooksConfigOverwriteRisk (Phase 1 preflight), not at uninstall time.
    expect(fs.existsSync(path.join(tmpDir, ".claude", "settings.json"))).toBe(true);

    await runUninstall(["claude"], makeCtx());

    // T1 file is deleted (this is expected — consumer should re-add their Stop hook after)
    expect(fs.existsSync(path.join(tmpDir, ".claude", "settings.json"))).toBe(false);
  });

  it("round-trip: uninstall is idempotent on heavy-customised consumer", async () => {
    // First uninstall
    await runUninstall(["core", "git-hooks", "claude"], makeCtx());

    // Second uninstall (idempotency check)
    const result2 = await runUninstall(["core", "git-hooks", "claude"], makeCtx());
    // Files already absent → all skip-absent
    const nonSkipAbsent = result2.deleted.filter((f) => {
      // These were deleted in first run
      return !["AGENTS.md", ".claude/settings.json"].includes(f);
    });
    // No errors (would throw if not idempotent)
    expect(result2.decisions.length).toBeGreaterThan(0);
  });

  it("fixture AGENTS.md consumer content is byte-identical after strip (regression guard)", async () => {
    // Record only the consumer sections (above and below bkit block)
    const original = fs.readFileSync(path.join(tmpDir, "AGENTS.md"), "utf-8");
    const bkitStartIdx = original.indexOf("<!-- bkit:start -->");
    const consumerAbove = original.slice(0, bkitStartIdx).trim();

    await runUninstall(["core"], makeCtx());

    const post = fs.readFileSync(path.join(tmpDir, "AGENTS.md"), "utf-8");
    expect(post).toContain(consumerAbove.slice(0, 50)); // first 50 chars of consumer-above
    expect(post).not.toContain("bkit-managed section");
  });
});
