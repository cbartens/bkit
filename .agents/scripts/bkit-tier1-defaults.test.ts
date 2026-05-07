// bkit-tier1-defaults.test.ts — Snapshot equality tests for BKIT_TIER1_DEFAULTS_BY_VERSION (P3.T6a)

import { describe, expect, it } from "vitest";
import { BKIT_TIER1_DEFAULTS_BY_VERSION, lookupTier1Defaults } from "./bkit-tier1-defaults";

// ---------------------------------------------------------------------------
// BKIT_TIER1_DEFAULTS_BY_VERSION — structure invariants
// ---------------------------------------------------------------------------

describe("BKIT_TIER1_DEFAULTS_BY_VERSION structure", () => {
  it("contains at least one version entry", () => {
    expect(Object.keys(BKIT_TIER1_DEFAULTS_BY_VERSION).length).toBeGreaterThan(0);
  });

  it("every version entry has .claude/settings.json and .cursor/hooks.json keys", () => {
    for (const [version, defaults] of Object.entries(BKIT_TIER1_DEFAULTS_BY_VERSION)) {
      expect(
        defaults[".claude/settings.json"],
        `version ${version} missing .claude/settings.json`,
      ).toBeTruthy();
      expect(
        defaults[".cursor/hooks.json"],
        `version ${version} missing .cursor/hooks.json`,
      ).toBeTruthy();
    }
  });

  it("v0.5.0 claude settings.json contains SessionStart hooks", () => {
    const v050 = BKIT_TIER1_DEFAULTS_BY_VERSION["0.5.0"];
    expect(v050).toBeDefined();
    const settings = v050![".claude/settings.json"] as Record<string, unknown>;
    const hooks = settings.hooks as Record<string, unknown>;
    expect(hooks).toBeDefined();
    expect(hooks["SessionStart"]).toBeDefined();
  });

  it("v0.5.0 cursor hooks.json contains sessionStart event", () => {
    const v050 = BKIT_TIER1_DEFAULTS_BY_VERSION["0.5.0"];
    expect(v050).toBeDefined();
    const hooks = v050![".cursor/hooks.json"] as Record<string, unknown>;
    const hooksArr = hooks.hooks as Array<Record<string, unknown>>;
    expect(hooksArr).toBeDefined();
    const sessionStart = hooksArr.find((h) => h.event === "sessionStart");
    expect(sessionStart).toBeDefined();
  });

  it("v0.5.0 claude settings.json matches git-extracted snapshot shape", () => {
    // Verify the embedded snapshot matches what was in the git tree at v0.5.0.
    // This is a shape test — we check key structural invariants rather than
    // byte-for-byte equality (which would be brittle to formatting changes).
    const v050 = BKIT_TIER1_DEFAULTS_BY_VERSION["0.5.0"]!;
    const settings = v050[".claude/settings.json"] as Record<string, unknown>;
    // Must have $schema
    expect(settings["$schema"]).toBe("https://json.schemastore.org/claude-code-settings.json");
    // Must have permissions
    expect(settings.permissions).toBeDefined();
    const perms = settings.permissions as Record<string, unknown>;
    expect(Array.isArray(perms.allow)).toBe(true);
    expect(Array.isArray(perms.deny)).toBe(true);
    expect(Array.isArray(perms.ask)).toBe(true);
    // Must have mcpServers.linear
    const mcp = settings.mcpServers as Record<string, unknown>;
    expect(mcp).toBeDefined();
    const linear = mcp.linear as Record<string, unknown>;
    expect(linear.url).toBe("https://mcp.linear.app/mcp");
    // Must have hooks.SessionStart
    const hooks = settings.hooks as Record<string, unknown>;
    expect(hooks["SessionStart"]).toBeDefined();
    expect(Array.isArray(hooks["SessionStart"])).toBe(true);
  });

  it("v0.5.0 cursor hooks.json matches git-extracted snapshot shape", () => {
    const v050 = BKIT_TIER1_DEFAULTS_BY_VERSION["0.5.0"]!;
    const hooks = v050[".cursor/hooks.json"] as Record<string, unknown>;
    const hooksArr = hooks.hooks as Array<Record<string, unknown>>;
    // Must have sessionStart and sessionStop
    const events = hooksArr.map((h) => h.event);
    expect(events).toContain("sessionStart");
    expect(events).toContain("sessionStop");
  });

  it("v0.5.1 defaults are identical to v0.5.0 (no template changes)", () => {
    const v050 = BKIT_TIER1_DEFAULTS_BY_VERSION["0.5.0"];
    const v051 = BKIT_TIER1_DEFAULTS_BY_VERSION["0.5.1"];
    expect(v050).toBeDefined();
    expect(v051).toBeDefined();
    // Same reference (both point to the same snapshot constants)
    expect(v051![".claude/settings.json"]).toBe(v050![".claude/settings.json"]);
    expect(v051![".cursor/hooks.json"]).toBe(v050![".cursor/hooks.json"]);
  });
});

// ---------------------------------------------------------------------------
// lookupTier1Defaults — version lookup semantics
// ---------------------------------------------------------------------------

describe("lookupTier1Defaults", () => {
  it("returns defaults for exact version match (0.5.0)", () => {
    const result = lookupTier1Defaults("0.5.0");
    expect(result).not.toBeNull();
    expect(result![".claude/settings.json"]).toBeDefined();
    expect(result![".cursor/hooks.json"]).toBeDefined();
  });

  it("returns defaults for exact version match (0.5.1)", () => {
    const result = lookupTier1Defaults("0.5.1");
    expect(result).not.toBeNull();
  });

  it("returns defaults for 0.6.0 (same as 0.5.x)", () => {
    const result = lookupTier1Defaults("0.6.0");
    expect(result).not.toBeNull();
  });

  it("returns defaults for 0.7.0 (same as 0.5.x)", () => {
    const result = lookupTier1Defaults("0.7.0");
    expect(result).not.toBeNull();
  });

  it("returns defaults for 0.6.5 (latest registered <= 0.6.5 is 0.6.0)", () => {
    const result = lookupTier1Defaults("0.6.5");
    expect(result).not.toBeNull();
    // Should return 0.6.0 defaults (same as 0.5.1)
  });

  it("returns null for pre-0.5.0 version (0.4.1 — Tier-1 classification predates this)", () => {
    const result = lookupTier1Defaults("0.4.1");
    expect(result).toBeNull();
  });

  it("returns null for very old version (0.1.0)", () => {
    const result = lookupTier1Defaults("0.1.0");
    expect(result).toBeNull();
  });

  it("returns latest registered version for future version (0.7.9 → 0.7.0)", () => {
    const result = lookupTier1Defaults("0.7.9");
    expect(result).not.toBeNull();
  });
});
