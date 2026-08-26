// bkit-manifest.test.ts — P2.T1 — snapshot + contract tests.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getInstallManifest,
  getModuleManifest,
  getManagedPackageJsonKeys,
  LINT_SCRIPT,
  CLOUD_MANIFEST_CLAUDE,
  CLOUD_MANIFEST_CURSOR,
  CLOUD_MANIFEST_OPENCODE,
  OPENCODE_MANIFEST,
  parseCloudAgents,
  parseRenovateRunner,
  RENOVATE_RUNNERS,
  DEFAULT_RENOVATE_RUNNER,
  LINT_PROSE_SCRIPT,
  LEGACY_LINT_PROSE_SCRIPTS,
  DEFAULT_ROADMAP_BUILD_CYCLES,
  DEFAULT_ROADMAP_STALENESS_DAYS,
  resolveRoadmapCadence,
  type ManifestEntry,
  type ModuleName,
} from "./bkit-manifest";

// ---------------------------------------------------------------------------
// CLAUDE.md ownership move core → claude (#252)
// ---------------------------------------------------------------------------

describe("CLAUDE.md ownership (#252: moved core → claude)", () => {
  it("CLAUDE.md is owned by the claude module (markered-text)", () => {
    const entry = getInstallManifest().find((e) => e.path === "CLAUDE.md");
    expect(entry).toBeDefined();
    expect(entry!.module).toBe("claude");
    expect(entry!.format).toBe("markered-text");
  });

  it("getModuleManifest('claude') includes CLAUDE.md", () => {
    expect(getModuleManifest("claude").some((e) => e.path === "CLAUDE.md")).toBe(true);
  });

  it("getModuleManifest('core') does NOT include CLAUDE.md (but keeps AGENTS.md)", () => {
    const core = getModuleManifest("core");
    expect(core.some((e) => e.path === "CLAUDE.md")).toBe(false);
    expect(core.some((e) => e.path === "AGENTS.md")).toBe(true);
  });
});

describe(".claude/hooks/gateguard.cjs ownership (markered-text: consumer owns the driver)", () => {
  it("is owned by the claude module as markered-text, not seed-or-print", () => {
    const entry = getInstallManifest().find((e) => e.path === ".claude/hooks/gateguard.cjs");
    expect(entry).toBeDefined();
    expect(entry!.module).toBe("claude");
    expect(entry!.format).toBe("markered-text");
    expect(entry!.seedOrPrint ?? false).toBe(false);
    // opts in to the no-marker migration policy (pre-markers consumer installs)
    expect(entry!.noMarkerMigration).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// CLOUD_MANIFEST_CLAUDE / CLOUD_MANIFEST_CURSOR — variant-split (T1.5 / DECISION-D)
// Derived Test Matrix row 14: each manifest entry tagged with / gated by its owning variant.
// ---------------------------------------------------------------------------

describe("CLOUD_MANIFEST_CLAUDE — cloud=claude variant owns bkit-cloud.yml + cloud-bootstrap.sh", () => {
  it("contains bkit-cloud.yml as byte-equal-text", () => {
    const entry = CLOUD_MANIFEST_CLAUDE.find((e) => e.path === ".github/workflows/bkit-cloud.yml");
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("byte-equal-text");
    expect(entry!.module).toBe("cloud");
  });

  it("contains cloud-bootstrap.sh as markered-text", () => {
    const entry = CLOUD_MANIFEST_CLAUDE.find((e) => e.path === ".claude/hooks/cloud-bootstrap.sh");
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("markered-text");
    expect(entry!.module).toBe("cloud");
  });

  it("does NOT contain .cursor/Dockerfile or .cursor/environment.json (cursor variant only)", () => {
    expect(CLOUD_MANIFEST_CLAUDE.find((e) => e.path === ".cursor/Dockerfile")).toBeUndefined();
    expect(
      CLOUD_MANIFEST_CLAUDE.find((e) => e.path === ".cursor/environment.json"),
    ).toBeUndefined();
  });

  it("contains exactly 2 entries (bkit-cloud.yml + cloud-bootstrap.sh)", () => {
    expect(CLOUD_MANIFEST_CLAUDE.length).toBe(2);
  });
});

describe("CLOUD_MANIFEST_CURSOR — cloud=cursor variant owns .cursor/Dockerfile + environment.json", () => {
  it("contains .cursor/Dockerfile as markered-text", () => {
    const entry = CLOUD_MANIFEST_CURSOR.find((e) => e.path === ".cursor/Dockerfile");
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("markered-text");
    expect(entry!.module).toBe("cloud");
  });

  it("contains .cursor/environment.json as byte-equal-text with seedOrPrint=true", () => {
    const entry = CLOUD_MANIFEST_CURSOR.find((e) => e.path === ".cursor/environment.json");
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("byte-equal-text");
    expect(entry!.seedOrPrint).toBe(true);
    expect(entry!.module).toBe("cloud");
  });

  it("does NOT contain bkit-cloud.yml or cloud-bootstrap.sh (claude/opencode variant only)", () => {
    expect(
      CLOUD_MANIFEST_CURSOR.find((e) => e.path === ".github/workflows/bkit-cloud.yml"),
    ).toBeUndefined();
    expect(
      CLOUD_MANIFEST_CURSOR.find((e) => e.path === ".claude/hooks/cloud-bootstrap.sh"),
    ).toBeUndefined();
  });

  it("contains exactly 2 entries (Dockerfile + environment.json)", () => {
    expect(CLOUD_MANIFEST_CURSOR.length).toBe(2);
  });
});

describe("CLOUD_MANIFEST_OPENCODE — cloud=opencode variant owns bkit-cloud.yml (same file as claude)", () => {
  it("contains bkit-cloud.yml as byte-equal-text", () => {
    const entry = CLOUD_MANIFEST_OPENCODE.find(
      (e) => e.path === ".github/workflows/bkit-cloud.yml",
    );
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("byte-equal-text");
    expect(entry!.module).toBe("cloud");
  });

  it("does NOT contain cloud-bootstrap.sh (claude only) or cursor files", () => {
    expect(
      CLOUD_MANIFEST_OPENCODE.find((e) => e.path === ".claude/hooks/cloud-bootstrap.sh"),
    ).toBeUndefined();
    expect(CLOUD_MANIFEST_OPENCODE.find((e) => e.path === ".cursor/Dockerfile")).toBeUndefined();
  });

  it("contains exactly 1 entry (bkit-cloud.yml only)", () => {
    expect(CLOUD_MANIFEST_OPENCODE.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// parseCloudAgents — value-space + back-compat (DECISION-C AMENDED: single field)
// ---------------------------------------------------------------------------

describe("parseCloudAgents — value space and back-compat", () => {
  it("parses 'claude' → 'claude'", () => {
    expect(parseCloudAgents("claude")).toBe("claude");
  });

  it("parses 'cursor' → 'cursor'", () => {
    expect(parseCloudAgents("cursor")).toBe("cursor");
  });

  it("parses 'opencode' → 'opencode'", () => {
    expect(parseCloudAgents("opencode")).toBe("opencode");
  });

  it("parses 'none' → 'none'", () => {
    expect(parseCloudAgents("none")).toBe("none");
  });

  it("back-compat: legacy 'enabled' → 'claude' (DECISION-C AMENDED)", () => {
    expect(parseCloudAgents("enabled")).toBe("claude");
  });

  it("returns null for unknown values", () => {
    expect(parseCloudAgents("linear")).toBeNull();
    expect(parseCloudAgents("github")).toBeNull();
    expect(parseCloudAgents("")).toBeNull();
    expect(parseCloudAgents(null)).toBeNull();
    expect(parseCloudAgents(undefined)).toBeNull();
    expect(parseCloudAgents(42)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getInstallManifest — snapshot / structural contract
// ---------------------------------------------------------------------------

describe("getInstallManifest", () => {
  it("returns entries for all modules when called with empty array", () => {
    const entries = getInstallManifest([]);
    expect(entries.length).toBeGreaterThan(0);
    // Every entry has required fields
    for (const e of entries) {
      expect(e.path).toBeTruthy();
      expect(["json", "markered-text", "byte-equal-text"]).toContain(e.format);
      expect(e.module).toBeTruthy();
    }
  });

  it("returns only entries for specified modules", () => {
    const entries = getInstallManifest(["lint"]);
    for (const e of entries) {
      expect(e.module).toBe("lint");
    }
  });

  it("accepts a Set<string> as modules parameter", () => {
    const entries = getInstallManifest(new Set(["ci", "lint"]));
    const modules = new Set(entries.map((e) => e.module));
    expect(modules.has("ci")).toBe(true);
    expect(modules.has("lint")).toBe(true);
    expect(modules.has("core")).toBe(false);
  });

  it("core manifest includes .bkit/version as byte-equal-text", () => {
    const entries = getInstallManifest(["core"]);
    const versionEntry = entries.find((e) => e.path.includes(".bkit/version"));
    expect(versionEntry).toBeDefined();
    expect(versionEntry!.format).toBe("byte-equal-text");
  });

  it("core manifest includes the canonical .bkit docs, non-seed (#218; prompts.md markered #245)", () => {
    const entries = getInstallManifest(["core"]);
    // prompts.md is markered-text (carries the consumer-owned `## Model Overrides`
    // section below `bkit:end`); the rest are whole-file byte-equal.
    const byteEqualDocs = [
      "cloud.md",
      "jsonl.md",
      "providers.md",
      "trackers.md",
      "workflows.md",
      "README.md",
    ];
    for (const doc of byteEqualDocs) {
      const entry = entries.find((e) => e.path === `.bkit/${doc}`);
      expect(entry, `core manifest must list .bkit/${doc}`).toBeDefined();
      expect(entry!.format).toBe("byte-equal-text");
      expect(entry!.seedOrPrint ?? false).toBe(false);
    }
    const promptsEntry = entries.find((e) => e.path === ".bkit/prompts.md");
    expect(promptsEntry, "core manifest must list .bkit/prompts.md").toBeDefined();
    expect(promptsEntry!.format).toBe("markered-text");
    expect(promptsEntry!.seedOrPrint ?? false).toBe(false);
  });

  it("ci manifest includes ci.yml as byte-equal-text", () => {
    const entries = getInstallManifest(["ci"]);
    const ciEntry = entries.find((e) => e.path.includes("ci.yml"));
    expect(ciEntry).toBeDefined();
    expect(ciEntry!.format).toBe("byte-equal-text");
  });

  it("ci manifest includes .vale.ini as byte-equal-text (vale is stack-agnostic, #265)", () => {
    const entries = getInstallManifest(["ci"]);
    const valeEntry = entries.find((e) => e.path === ".vale.ini");
    expect(valeEntry).toBeDefined();
    expect(valeEntry!.format).toBe("byte-equal-text");
  });

  it("lint manifest includes .prettierignore as markered-text", () => {
    const entries = getInstallManifest(["lint"]);
    const prettierEntry = entries.find((e) => e.path === ".prettierignore");
    expect(prettierEntry).toBeDefined();
    expect(prettierEntry!.format).toBe("markered-text");
  });

  // #255 P1-7 — files install writes that no uninstall path previously reclaimed.
  it("lint manifest includes .lintstagedrc.json (seed-or-print) so uninstall reclaims it (#255)", () => {
    const entry = getInstallManifest(["lint"]).find((e) => e.path === ".lintstagedrc.json");
    expect(entry, ".lintstagedrc.json must be in the manifest").toBeDefined();
    expect(entry!.format).toBe("byte-equal-text");
    expect(entry!.seedOrPrint).toBe(true);
  });

  it("ci manifest enumerates every .vale/styles/House/*.yml file in the template (#255/#265)", () => {
    const houseDir = path.resolve(".bkit/templates/.vale/styles/House");
    const templateFiles = fs
      .readdirSync(houseDir)
      .filter((f) => f.endsWith(".yml"))
      .map((f) => `.vale/styles/House/${f}`)
      .sort();
    expect(templateFiles.length).toBeGreaterThan(0);
    const manifestHouse = getInstallManifest(["ci"])
      .filter((e) => e.path.startsWith(".vale/styles/House/"))
      .map((e) => e.path)
      .sort();
    // Exact parity: a House rule added to the template without a manifest entry would
    // otherwise silently survive uninstall again. Vale moved lint→ci in #265.
    expect(manifestHouse).toEqual(templateFiles);
    for (const e of getInstallManifest(["ci"]).filter((x) =>
      x.path.startsWith(".vale/styles/House/"),
    )) {
      expect(e.format).toBe("byte-equal-text");
    }
  });

  it("renovate manifest includes consumer-owned renovate-local.json5 so uninstall reclaims it (#255)", () => {
    const entry = getInstallManifest(["renovate"]).find(
      (e) => e.path === ".github/renovate-local.json5",
    );
    expect(entry, "renovate-local.json5 must be in the manifest").toBeDefined();
    expect(entry!.format).toBe("byte-equal-text");
    expect(entry!.seedOrPrint).toBe(true);
  });

  it("git-hooks manifest includes .husky files as byte-equal-text (Tier 3 seed-or-print, v2.0.4)", () => {
    const entries = getInstallManifest(["git-hooks"]);
    const preCommit = entries.find((e) => e.path === ".husky/pre-commit");
    const prePush = entries.find((e) => e.path === ".husky/pre-push");
    expect(preCommit).toBeDefined();
    expect(preCommit!.format).toBe("byte-equal-text");
    expect(prePush).toBeDefined();
    expect(prePush!.format).toBe("byte-equal-text");
  });

  it("cursor manifest includes hooks.json as json", () => {
    const entries = getInstallManifest(["cursor"]);
    const hooksEntry = entries.find((e) => e.path === ".cursor/hooks.json");
    expect(hooksEntry).toBeDefined();
    expect(hooksEntry!.format).toBe("json");
  });

  it("cursor manifest includes guardrails.cjs as markered-text (consumer owns the driver)", () => {
    const entries = getInstallManifest(["cursor"]);
    const entry = entries.find((e) => e.path === ".cursor/hooks/guardrails.cjs");
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("markered-text");
    expect(entry!.seedOrPrint ?? false).toBe(false);
    // opts in to the no-marker migration policy (pre-markers consumer installs)
    expect(entry!.noMarkerMigration).toBeTruthy();
  });

  it("claude manifest includes settings.json as json", () => {
    const entries = getInstallManifest(["claude"]);
    const settingsEntry = entries.find((e) => e.path === ".claude/settings.json");
    expect(settingsEntry).toBeDefined();
    expect(settingsEntry!.format).toBe("json");
  });

  it("lint manifest includes slop-scan.config.json as byte-equal-text", () => {
    const entries = getInstallManifest(["lint"]);
    const slopEntry = entries.find((e) => e.path === "slop-scan.config.json");
    expect(slopEntry).toBeDefined();
    expect(slopEntry!.format).toBe("byte-equal-text");
  });

  it("cloud manifest includes environment.json as byte-equal-text (moved out of cursor — #119)", () => {
    const entries = getInstallManifest(["cloud"]);
    const envEntry = entries.find((e) => e.path === ".cursor/environment.json");
    expect(envEntry).toBeDefined();
    expect(envEntry!.format).toBe("byte-equal-text");
    expect(envEntry!.seedOrPrint).toBe(true);
    // Not in the default cursor module — it ships only via --cloud.
    expect(
      getInstallManifest(["cursor"]).find((e) => e.path === ".cursor/environment.json"),
    ).toBeUndefined();
  });

  it("cloud manifest includes Dockerfile as markered-text (moved out of cursor — #119)", () => {
    const entries = getInstallManifest(["cloud"]);
    const dockerEntry = entries.find((e) => e.path === ".cursor/Dockerfile");
    expect(dockerEntry).toBeDefined();
    expect(dockerEntry!.format).toBe("markered-text");
    expect(
      getInstallManifest(["cursor"]).find((e) => e.path === ".cursor/Dockerfile"),
    ).toBeUndefined();
  });

  it("cloud manifest includes cloud-bootstrap.sh as markered-text (moved out of claude — #119)", () => {
    const entries = getInstallManifest(["cloud"]);
    const bootstrapEntry = entries.find((e) => e.path === ".claude/hooks/cloud-bootstrap.sh");
    expect(bootstrapEntry).toBeDefined();
    expect(bootstrapEntry!.format).toBe("markered-text");
    expect(
      getInstallManifest(["claude"]).find((e) => e.path === ".claude/hooks/cloud-bootstrap.sh"),
    ).toBeUndefined();
  });

  it("cloud manifest includes the phase-routed bkit-cloud.yml workflow (renamed from bkit-auto.yml — #245)", () => {
    const entries = getInstallManifest(["cloud"]);
    const wf = entries.find((e) => e.path === ".github/workflows/bkit-cloud.yml");
    expect(wf).toBeDefined();
    expect(wf!.format).toBe("byte-equal-text");
    expect(entries.find((e) => e.path === ".github/workflows/bkit-auto.yml")).toBeUndefined();
    expect(entries.find((e) => e.path === ".github/workflows/bkit-ci-router.yml")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getModuleManifest — single-module accessor
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// parseRenovateRunner + RENOVATE_MANIFEST — self-hosted runner axis (#325)
// ---------------------------------------------------------------------------

describe("parseRenovateRunner — value space", () => {
  it("accepts mend and self", () => {
    expect(parseRenovateRunner("mend")).toBe("mend");
    expect(parseRenovateRunner("self")).toBe("self");
  });
  it("rejects unknown / empty / non-string", () => {
    expect(parseRenovateRunner("fly")).toBeNull();
    expect(parseRenovateRunner("")).toBeNull();
    expect(parseRenovateRunner(null)).toBeNull();
    expect(parseRenovateRunner(undefined)).toBeNull();
    expect(parseRenovateRunner(42)).toBeNull();
  });
  it("default runner is mend", () => {
    expect(DEFAULT_RENOVATE_RUNNER).toBe("mend");
    expect(RENOVATE_RUNNERS).toContain("mend");
    expect(RENOVATE_RUNNERS).toContain("self");
  });
});

describe("RENOVATE_MANIFEST — self-hosted workflow entry", () => {
  it("ships .github/workflows/renovate.yml as a Tier-1 byte-equal renovate file", () => {
    const entries = getModuleManifest("renovate");
    const wf = entries.find((e) => e.path === ".github/workflows/renovate.yml");
    expect(wf).toBeDefined();
    expect(wf!.format).toBe("byte-equal-text");
    expect(wf!.module).toBe("renovate");
    // Canonical (auto-overwritten), NOT a seed-or-print consumer-owned file.
    expect(wf!.seedOrPrint ?? false).toBe(false);
  });
  it("still owns renovate.json5 (canonical) and renovate-local.json5 (seed-or-print)", () => {
    const entries = getModuleManifest("renovate");
    const canonical = entries.find((e) => e.path === ".github/renovate.json5");
    const local = entries.find((e) => e.path === ".github/renovate-local.json5");
    expect(canonical?.seedOrPrint ?? false).toBe(false);
    expect(local?.seedOrPrint).toBe(true);
  });
});

describe("getModuleManifest", () => {
  const ALL_MODULES: ModuleName[] = ["core", "claude", "cursor", "ci", "lint", "git-hooks"];

  it("every module has at least one entry", () => {
    for (const m of ALL_MODULES) {
      const entries = getModuleManifest(m);
      expect(entries.length).toBeGreaterThan(0);
    }
  });

  it("all entries have correct module field", () => {
    for (const m of ALL_MODULES) {
      const entries = getModuleManifest(m);
      for (const e of entries) {
        expect(e.module).toBe(m);
      }
    }
  });

  it("all entries have valid format field", () => {
    for (const m of ALL_MODULES) {
      const entries = getModuleManifest(m);
      for (const e of entries) {
        expect(["json", "markered-text", "byte-equal-text"]).toContain(e.format);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// getManagedPackageJsonKeys — aggregate scripts + devDependencies
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// OPENCODE_MANIFEST — round-trip + format contracts (Task 2.1 "Done when")
// ---------------------------------------------------------------------------

describe("OPENCODE_MANIFEST — round-trip and format contracts", () => {
  it("contains .opencode/opencode.json as json (Tier-2 deep-contained)", () => {
    const entry = OPENCODE_MANIFEST.find((e) => e.path === ".opencode/opencode.json");
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("json");
    expect(entry!.module).toBe("opencode");
    // opencode.json is ownership-mixed — must NOT be seed-or-print (KN-17: reconverged on upgrade)
    expect(entry!.seedOrPrint ?? false).toBe(false);
  });

  it("contains .opencode/plugin/gateguard.js as markered-text (consumer owns the driver)", () => {
    const entry = OPENCODE_MANIFEST.find((e) => e.path === ".opencode/plugin/gateguard.js");
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("markered-text");
    expect(entry!.module).toBe("opencode");
    // gateguard.js is not seed-or-print — bkit reconverges its block on every upgrade
    expect(entry!.seedOrPrint ?? false).toBe(false);
    // opts in to the no-marker migration policy (pre-markers consumer installs)
    expect(entry!.noMarkerMigration).toBeTruthy();
  });

  it("all OPENCODE_MANIFEST entries have module=opencode", () => {
    for (const entry of OPENCODE_MANIFEST) {
      expect(entry.module).toBe("opencode");
    }
  });

  it("all OPENCODE_MANIFEST format values are valid ManifestEntry formats", () => {
    const VALID_FORMATS = ["json", "markered-text", "byte-equal-text"];
    for (const entry of OPENCODE_MANIFEST) {
      expect(VALID_FORMATS).toContain(entry.format);
    }
  });

  it("getInstallManifest(['opencode']) returns OPENCODE_MANIFEST entries", () => {
    const entries = getInstallManifest(["opencode"]);
    const opencodeJsonEntry = entries.find((e) => e.path === ".opencode/opencode.json");
    const gateguardEntry = entries.find((e) => e.path === ".opencode/plugin/gateguard.js");
    expect(opencodeJsonEntry).toBeDefined();
    expect(gateguardEntry).toBeDefined();
  });

  it("getModuleManifest('opencode') returns at least 2 entries", () => {
    const entries = getModuleManifest("opencode");
    expect(entries.length).toBeGreaterThanOrEqual(2);
    for (const e of entries) {
      expect(e.module).toBe("opencode");
    }
  });

  it("opencode manifest is NOT included in getInstallManifest(['cursor']) (additive opt-in)", () => {
    const cursorEntries = getInstallManifest(["cursor"]);
    const opencodeEntry = cursorEntries.find((e) => e.path.startsWith(".opencode/"));
    expect(opencodeEntry).toBeUndefined();
  });

  it("opencode manifest is NOT included in getInstallManifest(['claude']) (additive opt-in)", () => {
    const claudeEntries = getInstallManifest(["claude"]);
    const opencodeEntry = claudeEntries.find((e) => e.path.startsWith(".opencode/"));
    expect(opencodeEntry).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// KN-19-for-opencode — writeTier2JsonContained throws on malformed destination
// Tests the shared helper's throw-on-malformed-destination contract as it
// applies to .opencode/opencode.json (Tier-2 json, committed default per plan).
// ---------------------------------------------------------------------------

describe("KN-19-for-opencode — writeTier2JsonContained throws on malformed .opencode/opencode.json", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-manifest-kn19-"));
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("writeTier2JsonContained throws on malformed destination JSON (KN-19)", async () => {
    // Dynamic import to keep bkit-tiers fs side-effects out of module scope
    const { writeTier2JsonContained } = await import("./bkit-tiers");

    // Prepare a valid template (srcPath)
    const srcPath = path.join(tmpDir, "template.json");
    fs.writeFileSync(srcPath, JSON.stringify({ key: "value" }), "utf-8");

    // Prepare a malformed destination (dstPath) — simulates consumer-corrupted file
    const dstPath = path.join(tmpDir, "opencode.json");
    fs.writeFileSync(dstPath, "this is not valid { json", "utf-8");

    const ws: import("./bkit-tiers").WriteSet = { writes: [] };

    // Must throw — refusing to overwrite malformed consumer JSON (KN-19)
    expect(() => writeTier2JsonContained(srcPath, dstPath, false, ws)).toThrow(/malformed JSON/);
  });

  it("writeTier2JsonContained does NOT throw on valid destination JSON (normal path)", async () => {
    const { writeTier2JsonContained } = await import("./bkit-tiers");

    const srcPath = path.join(tmpDir, "template.json");
    fs.writeFileSync(srcPath, JSON.stringify({ key: "value" }), "utf-8");

    const dstPath = path.join(tmpDir, "opencode.json");
    fs.writeFileSync(dstPath, JSON.stringify({ existingKey: "preserved" }), "utf-8");

    const ws: import("./bkit-tiers").WriteSet = { writes: [] };
    expect(() => writeTier2JsonContained(srcPath, dstPath, false, ws)).not.toThrow();
  });
});

describe("seeded lint script (dogfood parity)", () => {
  it("is byte-identical to the `lint` script bkit runs on itself", () => {
    // The shipped default exists because `bkit:gate:static` chains `pnpm lint` and bkit
    // ships no linter: with no `lint` script, pnpm falls through to whatever `lint`
    // binary is on PATH and the gate goes green through the wrong program. Pinning it to
    // this repo's own script keeps the default one bkit actually exercises every run,
    // rather than a second version that only consumers ever execute.
    const pkg = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf-8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts.lint).toBe(LINT_SCRIPT);
  });

  it("never resolves to a bare `lint` invocation", () => {
    // The failure mode this guards: any default that shells out to `lint` (rather than a
    // named linter) reintroduces the PATH fall-through it was written to prevent.
    expect(LINT_SCRIPT).not.toMatch(/(^|[;&|]\s*)lint\b/);
  });
});

describe("getManagedPackageJsonKeys", () => {
  it("aggregates scripts from lint module: format:check, lint:prose, lint:slop", () => {
    const { scripts } = getManagedPackageJsonKeys(["lint"]);
    expect(Object.keys(scripts)).toContain("format:check");
    expect(Object.keys(scripts)).toContain("lint:prose");
    expect(Object.keys(scripts)).toContain("lint:slop");
  });

  it("aggregates devDependencies from lint module: prettier, slop-scan, lint-staged", () => {
    const { devDependencies } = getManagedPackageJsonKeys(["lint"]);
    expect(Object.keys(devDependencies)).toContain("prettier");
    expect(Object.keys(devDependencies)).toContain("slop-scan");
    // lint-staged is injected by runLintModule; it must be manifest-declared so the
    // uninstall stripper reclaims a default-only lint-staged devDep (regression #265).
    expect(Object.keys(devDependencies)).toContain("lint-staged");
  });

  it("aggregates prepare script from git-hooks module", () => {
    const { scripts } = getManagedPackageJsonKeys(["git-hooks"]);
    expect(Object.keys(scripts)).toContain("prepare");
  });

  it("aggregates devDependencies from git-hooks module: husky", () => {
    const { devDependencies } = getManagedPackageJsonKeys(["git-hooks"]);
    expect(Object.keys(devDependencies)).toContain("husky");
  });

  it("aggregates typecheck from lint module (moved ci→lint, #265)", () => {
    const { scripts } = getManagedPackageJsonKeys(["lint"]);
    expect(Object.keys(scripts)).toContain("typecheck");
  });

  it("ci module has NO package.json footprint (stack-agnostic, #265)", () => {
    const { scripts, devDependencies } = getManagedPackageJsonKeys(["ci"]);
    expect(scripts).toEqual({});
    expect(devDependencies).toEqual({});
  });

  it("returns empty objects when no packageJsonKeys entries present", () => {
    const { scripts, devDependencies } = getManagedPackageJsonKeys(["core"]);
    // core has no packageJsonKeys in its manifest entries
    expect(scripts).toEqual({});
    expect(devDependencies).toEqual({});
  });

  it("aggregates across all modules when called with empty array", () => {
    const { scripts, devDependencies } = getManagedPackageJsonKeys([]);
    expect(Object.keys(scripts).length).toBeGreaterThan(0);
    expect(Object.keys(devDependencies).length).toBeGreaterThan(0);
  });

  it("manifest snapshot: all expected managed scripts present across full install", () => {
    const { scripts } = getManagedPackageJsonKeys([]);
    const expected = ["typecheck", "format:check", "lint:prose", "lint:slop", "prepare"];
    for (const s of expected) {
      expect(Object.keys(scripts)).toContain(s);
    }
  });
});

// ---------------------------------------------------------------------------
// LINT_PROSE_SCRIPT — shipped prose-gate contract
//
// This script runs in every consumer's pre-commit hook, so a quoting slip or a
// dropped guard degrades the gate silently rather than loudly. These assert the
// invariants that make it safe to embed and safe to trust.
// ---------------------------------------------------------------------------

describe("LINT_PROSE_SCRIPT", () => {
  const body = LINT_PROSE_SCRIPT.replace(/^bash -c '/, "").replace(/'$/, "");

  it("is wrapped in bash -c with no single quotes in the body", () => {
    // An inner single quote would terminate the `bash -c '...'` wrapper early and
    // mangle the rest of the script into stray shell words.
    expect(LINT_PROSE_SCRIPT.startsWith("bash -c '")).toBe(true);
    expect(LINT_PROSE_SCRIPT.endsWith("'")).toBe(true);
    expect(body).not.toContain("'");
  });

  it("contains no backticks", () => {
    // The old default put `vale sync` in backticks inside a DOUBLE-quoted echo,
    // where a backtick command-substitutes instead of printing.
    expect(body).not.toContain("`");
  });

  it("carries the F9 guard substring that bkit-preflight.ts greps for", () => {
    // detectLintProseF9Vulnerable does a literal substring match; losing this
    // exact form would make bkit advise consumers to "fix" the correct script.
    expect(LINT_PROSE_SCRIPT).toContain("[ -d .vale/styles/write-good ]");
  });

  it("soft-skips instead of failing when the vale binary is absent", () => {
    expect(body).toContain("command -v vale");
    expect(body).toContain("vale not installed");
  });

  it("self-heals a missing write-good from the main worktree before falling back to sync", () => {
    // The worktree hole: .vale/styles/write-good is gitignored, so it is absent in
    // every fresh checkout and every `git worktree add`. --git-common-dir resolves
    // the main worktree from inside a linked one, making this a zero-network copy.
    expect(body).toContain("git rev-parse --git-common-dir");
    expect(body).toContain("cp -R");
    expect(body).toContain("vale sync");
    expect(body.indexOf("git rev-parse --git-common-dir")).toBeLessThan(body.indexOf("vale sync"));
  });

  it("announces loudly on stderr when vale is present but self-heal failed", () => {
    // The whole point of the change: this case used to emit one quiet line and
    // exit 0, so a worktree commit bypassed prose linting and still looked green.
    expect(body).toContain("PROSE LINT SKIPPED");
    expect(body).toContain(">&2");
  });

  it("is not itself listed as a legacy value", () => {
    expect(LEGACY_LINT_PROSE_SCRIPTS).not.toContain(LINT_PROSE_SCRIPT);
  });

  it("lists the previous shipped default as legacy so existing installs get re-pointed", () => {
    expect(LEGACY_LINT_PROSE_SCRIPTS.length).toBeGreaterThan(0);
    // The pre-fix default, verbatim — the value on every consumer that installed
    // before this change. Must byte-match or those installs are never corrected.
    expect(LEGACY_LINT_PROSE_SCRIPTS).toContain(
      'bash -c \'if command -v vale >/dev/null 2>&1 && [ -d .vale/styles/write-good ]; then vale $(find . -name "*.md" -not -path "*/node_modules/*"); else echo "[bkit] vale missing or .vale/styles/write-good not synced — skipping (run \\`vale sync\\` to enable)"; fi\'',
    );
  });

  it("is the exact value the lint module seeds into package.json", () => {
    const { scripts } = getManagedPackageJsonKeys(["lint"]);
    expect(scripts["lint:prose"]).toBe(LINT_PROSE_SCRIPT);
  });
});

// ---------------------------------------------------------------------------
// Telemetry data files — MUST be absent from manifest format entries (#234 WS1-T3)
// These are git-tracked runtime ledgers, NOT install-engine payload.
// ---------------------------------------------------------------------------

describe("telemetry data files — absent from manifest format entries", () => {
  const DATA_FILES = [
    ".bkit/stats.jsonl",
    ".bkit/friction.jsonl",
    "docs/deferrals.jsonl",
    "docs/failures.jsonl",
  ];

  it("none of the four telemetry data files appear as manifest format entries", () => {
    const manifest = getInstallManifest();
    for (const dataFile of DATA_FILES) {
      const entry = manifest.find((e) => e.path === dataFile);
      expect(entry, `${dataFile} must NOT be a manifest format entry`).toBeUndefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Roadmap cadence — #380 bkit.roadmap.{buildCycles,stalenessDays} defaults
// ---------------------------------------------------------------------------

describe("resolveRoadmapCadence — bkit.roadmap.{buildCycles,stalenessDays} (#380)", () => {
  it("resolves both defaults when bkit.roadmap is absent", () => {
    const cadence = resolveRoadmapCadence({});
    expect(cadence.buildCycles).toBe(DEFAULT_ROADMAP_BUILD_CYCLES);
    expect(cadence.stalenessDays).toBe(DEFAULT_ROADMAP_STALENESS_DAYS);
  });

  it("resolves both defaults when bkit is present but bkit.roadmap is absent", () => {
    const cadence = resolveRoadmapCadence({ bkit: { issueTracker: "github" } });
    expect(cadence.buildCycles).toBe(DEFAULT_ROADMAP_BUILD_CYCLES);
    expect(cadence.stalenessDays).toBe(DEFAULT_ROADMAP_STALENESS_DAYS);
  });

  it("reads both values when set", () => {
    const cadence = resolveRoadmapCadence({
      bkit: { roadmap: { buildCycles: 5, stalenessDays: 14 } },
    });
    expect(cadence).toEqual({ buildCycles: 5, stalenessDays: 14 });
  });

  it("defaults ONLY the invalid field — a valid buildCycles survives an invalid stalenessDays", () => {
    const cadence = resolveRoadmapCadence({
      bkit: { roadmap: { buildCycles: 3, stalenessDays: -1 } },
    });
    expect(cadence.buildCycles).toBe(3);
    expect(cadence.stalenessDays).toBe(DEFAULT_ROADMAP_STALENESS_DAYS);
  });

  it.each([0, -5, 1.5, "10", null, NaN, Infinity])("rejects invalid buildCycles %j", (bad) => {
    const cadence = resolveRoadmapCadence({ bkit: { roadmap: { buildCycles: bad } } });
    expect(cadence.buildCycles).toBe(DEFAULT_ROADMAP_BUILD_CYCLES);
  });
});
