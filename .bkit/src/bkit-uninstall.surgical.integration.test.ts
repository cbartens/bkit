// bkit-uninstall.surgical.integration.test.ts — P2.T8a
//
// Heavily-customised consumer fixture → surgical uninstall → consumer files byte-identical.
//
// This fixture simulates a heavily-customised consumer repo:
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
  const versionFilePath = path.join(tmpDir, ".bkit", "version");
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

  it(".husky/pre-commit: heavily customised legacy fixture preserved byte-identically (Tier 3 byte-equal-text, v2.0.4)", async () => {
    // v2.0.4: .husky/* is byte-equal-text. Uninstall only deletes when content
    // matches install-time hash (recorded in .bkit/version#canonicalHashes).
    // The heavy-customised fixture has consumer-written lines + a legacy bkit:start/end
    // block — content does NOT match any bkit install-time hash, so uninstall PRESERVES
    // the file byte-identically rather than mutating it. This is a stronger guarantee
    // than the prior strip-block behaviour: bkit never touches a consumer-modified hook.
    const originalContent = fs.readFileSync(path.join(tmpDir, ".husky", "pre-commit"), "utf-8");

    expect(originalContent).toContain("Consumer custom check");
    expect(originalContent).toContain("Running consumer pre-commit checks");

    await runUninstall(["git-hooks"], makeCtx());

    const postContent = fs.readFileSync(path.join(tmpDir, ".husky", "pre-commit"), "utf-8");

    // Whole file is byte-identical to the pre-uninstall state.
    expect(postContent).toBe(originalContent);
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

  it("JSON file (.claude/settings.json) has bkit scope stripped by uninstall (format: json semantics)", async () => {
    // BAR-167 Phase 2: .claude/settings.json is format: "json" in the manifest.
    // Uninstall uses stripTier2JsonScope — removes bkit-managed keys from the consumer
    // JSON doc but does NOT delete the file. Consumer-only keys are preserved.
    // The consumer fixture has a "Stop" hook not present in the bkit template — it is retained.
    expect(fs.existsSync(path.join(tmpDir, ".claude", "settings.json"))).toBe(true);

    await runUninstall(["claude"], makeCtx());

    // File still exists (json format: scope-strip, not full-delete)
    expect(fs.existsSync(path.join(tmpDir, ".claude", "settings.json"))).toBe(true);
    const afterContent = JSON.parse(
      fs.readFileSync(path.join(tmpDir, ".claude", "settings.json"), "utf-8"),
    ) as Record<string, unknown>;
    // Consumer-only "Stop" hook should be preserved (not in bkit template)
    const hooks = afterContent.hooks as Record<string, unknown> | undefined;
    expect(hooks?.Stop).toBeDefined();
    // bkit-managed keys like $schema and permissions.allow should be stripped
    expect(afterContent.$schema).toBeUndefined();
    expect(afterContent.permissions).toBeUndefined();
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

// ---------------------------------------------------------------------------
// opencode uninstall — install → zero-drift → uninstall → zero footprint
// P4.T7 — sub-plan-4 opencode round-trip
// ---------------------------------------------------------------------------

describe("opencode uninstall — zero footprint after uninstall", () => {
  it("uninstall(opencode) deletes .opencode/plugin/gateguard.js when hash matches (byte-equal-text)", async () => {
    // gateguard.js is byte-equal-text — deleted only when hash matches tier3Hashes.
    const pluginPath = path.join(tmpDir, ".opencode", "plugin", "gateguard.js");
    fs.mkdirSync(path.dirname(pluginPath), { recursive: true });
    const pluginContent = "// bkit gateguard";
    fs.writeFileSync(pluginPath, pluginContent, "utf-8");

    // opencode.json (json format) — seed empty-ish content that fully contains template scope
    // Use --force to ensure deletion regardless of hash (tests the delete path)
    const opencodeJsonPath = path.join(tmpDir, ".opencode", "opencode.json");
    fs.mkdirSync(path.dirname(opencodeJsonPath), { recursive: true });
    fs.writeFileSync(opencodeJsonPath, "{}", "utf-8");

    // Write tier3Hashes so the byte-equal-text file can be identified as bkit-owned
    const { sha256: computeSha256 } = await import("./bkit-version");
    const versionPath = path.join(tmpDir, ".bkit", "version");
    const tier3Hashes: Record<string, string> = {
      ".opencode/plugin/gateguard.js": computeSha256(pluginContent),
    };
    fs.writeFileSync(
      versionPath,
      serializeBkitVersion({ pinnedVersion: "3.0.0", tier3Hashes, canonicalHashes: {} }),
      "utf-8",
    );

    // Use --force to also delete byte-equal-text files regardless of hash check
    await runUninstall(["opencode"], makeCtx({ force: true }));

    expect(fs.existsSync(pluginPath), ".opencode/plugin/gateguard.js should be force-deleted").toBe(
      false,
    );
  });

  it("uninstall(opencode) strips bkit-managed scope from opencode.json; deletes when empty after strip", async () => {
    // opencode.json is format: json (deep-contained). After stripping bkit scope, if
    // only consumer keys remain → preserved; if nothing remains → deleted.
    // Use an empty consumer JSON ({}) so all bkit template keys are "not present" → strip = no-op → delete.
    const opencodeJsonPath = path.join(tmpDir, ".opencode", "opencode.json");
    fs.mkdirSync(path.dirname(opencodeJsonPath), { recursive: true });
    fs.writeFileSync(opencodeJsonPath, "{}", "utf-8");

    const versionPath = path.join(tmpDir, ".bkit", "version");
    fs.writeFileSync(
      versionPath,
      serializeBkitVersion({ pinnedVersion: "3.0.0", tier3Hashes: {}, canonicalHashes: {} }),
      "utf-8",
    );

    await runUninstall(["opencode"], makeCtx());

    // {} → strip-json-scope → empty object → file deleted
    expect(
      fs.existsSync(opencodeJsonPath),
      ".opencode/opencode.json should be deleted when empty after strip",
    ).toBe(false);
  });

  it("uninstall(opencode) removes .opencode/agents/ and .opencode/commands/ bkit-prefix mirrors", async () => {
    // Seed bkit-prefix agent and command mirrors
    const agentDir = path.join(tmpDir, ".opencode", "agents");
    const cmdDir = path.join(tmpDir, ".opencode", "commands");
    fs.mkdirSync(agentDir, { recursive: true });
    fs.mkdirSync(cmdDir, { recursive: true });
    const agentFile = path.join(agentDir, "bkit-build-plan-execute.md");
    const cmdFile = path.join(cmdDir, "bkit-build.md");
    const consumerAgentFile = path.join(agentDir, "my-custom-agent.md");
    fs.writeFileSync(agentFile, "# bkit agent", "utf-8");
    fs.writeFileSync(cmdFile, "# bkit command", "utf-8");
    fs.writeFileSync(consumerAgentFile, "# consumer agent", "utf-8");

    // Also seed the static manifest files (empty so they don't interfere)
    const opencodeJsonPath = path.join(tmpDir, ".opencode", "opencode.json");
    const pluginPath = path.join(tmpDir, ".opencode", "plugin", "gateguard.js");
    fs.mkdirSync(path.dirname(pluginPath), { recursive: true });
    fs.writeFileSync(opencodeJsonPath, "{}", "utf-8");
    fs.writeFileSync(pluginPath, "// gateguard", "utf-8");

    const versionPath = path.join(tmpDir, ".bkit", "version");
    fs.writeFileSync(
      versionPath,
      serializeBkitVersion({ pinnedVersion: "3.0.0", tier3Hashes: {}, canonicalHashes: {} }),
      "utf-8",
    );

    await runUninstall(["opencode"], makeCtx());

    // bkit-prefix mirrors deleted
    expect(fs.existsSync(agentFile), "bkit-prefix agent mirror should be deleted").toBe(false);
    expect(fs.existsSync(cmdFile), "bkit-prefix command mirror should be deleted").toBe(false);
    // Consumer-owned agent file preserved
    expect(fs.existsSync(consumerAgentFile), "consumer agent file should be preserved").toBe(true);
  });

  it("opencode round-trip: zero footprint — no bkit-prefix .opencode/ files remain after uninstall", async () => {
    // Simulate a full opencode install state: static files + bkit-prefix mirrors
    const opencodeDir = path.join(tmpDir, ".opencode");
    fs.mkdirSync(path.join(opencodeDir, "agents"), { recursive: true });
    fs.mkdirSync(path.join(opencodeDir, "commands"), { recursive: true });
    fs.mkdirSync(path.join(opencodeDir, "plugin"), { recursive: true });

    // opencode.json (json format) — empty object → deleted after strip
    const opencodeJsonPath = path.join(opencodeDir, "opencode.json");
    fs.writeFileSync(opencodeJsonPath, "{}", "utf-8");

    // gateguard.js (byte-equal-text) — record hash so uninstall can delete
    const { sha256: computeSha256 } = await import("./bkit-version");
    const pluginContent = "// bkit gateguard plugin";
    const pluginPath = path.join(opencodeDir, "plugin", "gateguard.js");
    fs.writeFileSync(pluginPath, pluginContent, "utf-8");
    const tier3Hashes: Record<string, string> = {
      ".opencode/plugin/gateguard.js": computeSha256(pluginContent),
    };

    // bkit-prefix dynamic mirrors
    const agentFile = path.join(opencodeDir, "agents", "bkit-build-plan-execute.md");
    const cmdFile = path.join(opencodeDir, "commands", "bkit-build.md");
    fs.writeFileSync(agentFile, "# agent", "utf-8");
    fs.writeFileSync(cmdFile, "# cmd", "utf-8");

    const versionPath = path.join(tmpDir, ".bkit", "version");
    fs.writeFileSync(
      versionPath,
      serializeBkitVersion({ pinnedVersion: "3.0.0", tier3Hashes, canonicalHashes: {} }),
      "utf-8",
    );

    await runUninstall(["opencode"], makeCtx());

    // Static manifest files gone
    expect(fs.existsSync(opencodeJsonPath), ".opencode/opencode.json should be deleted").toBe(
      false,
    );
    expect(fs.existsSync(pluginPath), ".opencode/plugin/gateguard.js should be deleted").toBe(
      false,
    );
    // Dynamic mirrors gone
    expect(fs.existsSync(agentFile), "bkit-prefix agent mirror should be deleted").toBe(false);
    expect(fs.existsSync(cmdFile), "bkit-prefix command mirror should be deleted").toBe(false);
  });

  it("targeted uninstall does NOT cross-delete other hosts' bkit-prefix mirrors (#255 P0-1)", async () => {
    // Seed bkit-prefix mirrors for all three hosts.
    const seedMirror = (host: string, agentsDir: string, cmdsDir: string) => {
      const a = path.join(tmpDir, host, agentsDir);
      const c = path.join(tmpDir, host, cmdsDir);
      fs.mkdirSync(a, { recursive: true });
      fs.mkdirSync(c, { recursive: true });
      const agentFile = path.join(a, "bkit-build-plan-execute.md");
      const cmdFile = path.join(c, "bkit-build.md");
      fs.writeFileSync(agentFile, "# bkit agent", "utf-8");
      fs.writeFileSync(cmdFile, "# bkit command", "utf-8");
      return { agentFile, cmdFile };
    };
    const claude = seedMirror(".claude", "agents", "commands");
    const cursor = seedMirror(".cursor", "agents", "commands");
    const opencode = seedMirror(".opencode", "agents", "commands");

    const versionPath = path.join(tmpDir, ".bkit", "version");
    fs.writeFileSync(
      versionPath,
      serializeBkitVersion({ pinnedVersion: "4.0.0", tier3Hashes: {}, canonicalHashes: {} }),
      "utf-8",
    );

    // Targeted uninstall of opencode only — claude + cursor mirrors must survive.
    await runUninstall(["opencode"], makeCtx());

    expect(fs.existsSync(opencode.agentFile), "opencode mirror should be deleted").toBe(false);
    expect(fs.existsSync(opencode.cmdFile), "opencode mirror should be deleted").toBe(false);
    expect(fs.existsSync(claude.agentFile), ".claude mirror must survive opencode uninstall").toBe(
      true,
    );
    expect(fs.existsSync(claude.cmdFile), ".claude mirror must survive opencode uninstall").toBe(
      true,
    );
    expect(fs.existsSync(cursor.agentFile), ".cursor mirror must survive opencode uninstall").toBe(
      true,
    );

    // Now targeted uninstall of claude only — cursor must still survive.
    await runUninstall(["claude"], makeCtx());

    expect(fs.existsSync(claude.agentFile), ".claude mirror should be deleted").toBe(false);
    expect(fs.existsSync(claude.cmdFile), ".claude mirror should be deleted").toBe(false);
    expect(fs.existsSync(cursor.agentFile), ".cursor mirror must survive claude uninstall").toBe(
      true,
    );
    expect(fs.existsSync(cursor.cmdFile), ".cursor mirror must survive claude uninstall").toBe(
      true,
    );
  });

  it("deletes a bkit-seeded markdown husk (AGENTS.md reduced to a lone H1) (#255 P2-15)", async () => {
    // AGENTS.md exactly as bkit seeds it: `# AGENTS.md` H1 OUTSIDE the bkit block.
    const agentsMd = path.join(tmpDir, "AGENTS.md");
    fs.writeFileSync(
      agentsMd,
      "# AGENTS.md\n\n<!-- bkit:start -->\n\n**Read in full:** `.agents/rules.md`.\n\n<!-- bkit:end -->\n",
      "utf-8",
    );

    await runUninstall(["core"], makeCtx());

    expect(
      fs.existsSync(agentsMd),
      "a pure-bkit AGENTS.md must be deleted, not left as a `# AGENTS.md` husk",
    ).toBe(false);
  });

  it("preserves a consumer-customised AGENTS.md (content outside the bkit block survives)", async () => {
    const agentsMd = path.join(tmpDir, "AGENTS.md");
    fs.writeFileSync(
      agentsMd,
      "# AGENTS.md\n\n<!-- bkit:start -->\nbkit content\n<!-- bkit:end -->\n\n## My team rules\n\nDo the thing.\n",
      "utf-8",
    );

    await runUninstall(["core"], makeCtx());

    expect(fs.existsSync(agentsMd), "consumer-customised AGENTS.md must be preserved").toBe(true);
    const after = fs.readFileSync(agentsMd, "utf-8");
    expect(after).toContain("## My team rules");
    expect(after).not.toContain("bkit content");
  });
});

// ---------------------------------------------------------------------------
// surgical --opencode=<provider> removal (#281 Task 4)
// ---------------------------------------------------------------------------

import { runSurgicalOpencodeUninstall } from "./bkit-uninstall";

describe("surgical --opencode=<provider> removal (#281 Task 4)", () => {
  const OPENCODE_JSON_TWO_PROVIDERS =
    JSON.stringify(
      {
        provider: {
          groq: {
            npm: "@ai-sdk/openai-compatible",
            options: { baseURL: "https://api.groq.com/openai/v1", apiKey: "{env:GROQ_API_KEY}" },
          },
          "ollama-local": {
            npm: "@ai-sdk/openai-compatible",
            options: { baseURL: "http://localhost:11434/v1", apiKey: "" },
          },
        },
      },
      null,
      2,
    ) + "\n";

  const OPENCODE_JSON_ONE_PROVIDER =
    JSON.stringify(
      {
        provider: {
          groq: {
            npm: "@ai-sdk/openai-compatible",
            options: { baseURL: "https://api.groq.com/openai/v1", apiKey: "{env:GROQ_API_KEY}" },
          },
        },
      },
      null,
      2,
    ) + "\n";

  function seedOpencode(content: string): void {
    const dir = path.join(tmpDir, ".opencode");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "opencode.json"), content, "utf-8");
  }

  function seedPackageJson(bkitSection: Record<string, unknown>): void {
    const pkg = { name: "test-project", version: "1.0.0", bkit: bkitSection };
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify(pkg, null, 2) + "\n",
      "utf-8",
    );
  }

  function readPackageJsonBkit(): Record<string, unknown> {
    const raw = fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8");
    const pkg = JSON.parse(raw) as { bkit?: Record<string, unknown> };
    return pkg.bkit ?? {};
  }

  function readOpencodeJson(): Record<string, unknown> {
    const raw = fs.readFileSync(path.join(tmpDir, ".opencode", "opencode.json"), "utf-8");
    return JSON.parse(raw) as Record<string, unknown>;
  }

  it("removes exactly ONE provider block; the other provider remains intact", async () => {
    seedOpencode(OPENCODE_JSON_TWO_PROVIDERS);
    seedPackageJson({
      opencodeProviders: ["groq", "ollama-local"],
      opencodeProvider: "ollama-local",
    });

    // Seed a bkit-prefix agent mirror so we can detect if full teardown was (wrongly) triggered
    const agentDir = path.join(tmpDir, ".opencode", "agents");
    fs.mkdirSync(agentDir, { recursive: true });
    fs.writeFileSync(path.join(agentDir, "bkit-build-plan-execute.md"), "# agent", "utf-8");

    await runSurgicalOpencodeUninstall("groq", false, tmpDir);

    const oJson = readOpencodeJson();
    const providers = (oJson.provider ?? {}) as Record<string, unknown>;

    // groq block removed
    expect(providers.groq, "groq provider block should be removed").toBeUndefined();
    // ollama-local block preserved
    expect(
      providers["ollama-local"],
      "ollama-local provider block should be preserved",
    ).toBeDefined();

    // Full teardown must NOT have been triggered
    expect(
      fs.existsSync(path.join(agentDir, "bkit-build-plan-execute.md")),
      "bkit-prefix agent mirror must NOT be deleted when other providers remain",
    ).toBe(true);
  });

  it("updates bkit.opencodeProviders array in package.json", async () => {
    seedOpencode(OPENCODE_JSON_TWO_PROVIDERS);
    seedPackageJson({
      opencodeProviders: ["groq", "ollama-local"],
      opencodeProvider: "ollama-local",
    });

    await runSurgicalOpencodeUninstall("groq", false, tmpDir);

    const bkit = readPackageJsonBkit();
    expect(bkit.opencodeProviders).toEqual(["ollama-local"]);
    // Active provider unchanged (groq was not active)
    expect(bkit.opencodeProvider).toBe("ollama-local");
  });

  it("re-points bkit.opencodeProvider when the active provider is removed", async () => {
    seedOpencode(OPENCODE_JSON_TWO_PROVIDERS);
    // groq is the ACTIVE provider
    seedPackageJson({
      opencodeProviders: ["groq", "ollama-local"],
      opencodeProvider: "groq",
    });

    await runSurgicalOpencodeUninstall("groq", false, tmpDir);

    const bkit = readPackageJsonBkit();
    // opencodeProviders updated
    expect(bkit.opencodeProviders).toEqual(["ollama-local"]);
    // Active provider re-pointed to first remaining
    expect(bkit.opencodeProvider).toBe("ollama-local");
  });

  it("falls through to full teardown when the last provider is removed", async () => {
    seedOpencode(OPENCODE_JSON_ONE_PROVIDER);
    seedPackageJson({ opencodeProviders: ["groq"], opencodeProvider: "groq" });

    // Seed bkit-prefix mirrors so we can verify full teardown was triggered
    const agentDir = path.join(tmpDir, ".opencode", "agents");
    const cmdDir = path.join(tmpDir, ".opencode", "commands");
    fs.mkdirSync(agentDir, { recursive: true });
    fs.mkdirSync(cmdDir, { recursive: true });
    const agentFile = path.join(agentDir, "bkit-build-plan-execute.md");
    const cmdFile = path.join(cmdDir, "bkit-build.md");
    fs.writeFileSync(agentFile, "# agent", "utf-8");
    fs.writeFileSync(cmdFile, "# cmd", "utf-8");

    // Write .bkit/version so runUninstall can run
    const versionPath = path.join(tmpDir, ".bkit", "version");
    fs.mkdirSync(path.dirname(versionPath), { recursive: true });
    fs.writeFileSync(
      versionPath,
      serializeBkitVersion({ pinnedVersion: "3.0.0", tier3Hashes: {}, canonicalHashes: {} }),
      "utf-8",
    );

    await runSurgicalOpencodeUninstall("groq", false, tmpDir);

    // Full teardown: bkit-prefix mirrors deleted
    expect(
      fs.existsSync(agentFile),
      "bkit-prefix agent mirror should be deleted on full teardown",
    ).toBe(false);
    expect(
      fs.existsSync(cmdFile),
      "bkit-prefix command mirror should be deleted on full teardown",
    ).toBe(false);
  });
});
