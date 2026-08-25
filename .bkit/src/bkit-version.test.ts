// bkit-version.test.ts — P2.T3 — schema + backward-compat tests.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  parseBkitVersion,
  readBkitVersion,
  serializeBkitVersion,
  writeBkitVersion,
  sha256,
  hashFile,
  shouldDeleteTier3,
  isConsumerModified,
  managedVersionMarker,
  stampManagedVersion,
  MANAGED_MARKER_VERSION_RE,
  type BkitVersion,
} from "./bkit-version";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-version-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// parseBkitVersion — backward-compat parser
// ---------------------------------------------------------------------------

describe("parseBkitVersion", () => {
  it("parses new JSON format correctly", () => {
    const json = JSON.stringify({
      pinnedVersion: "0.7.0",
      tier3Hashes: { ".github/workflows/ci.yml": "abc123" },
    });
    const result = parseBkitVersion(json);
    expect(result).not.toBeNull();
    expect(result!.pinnedVersion).toBe("0.7.0");
    expect(result!.tier3Hashes).toEqual({ ".github/workflows/ci.yml": "abc123" });
  });

  it("parses old plain-text format (v0.6.x backward-compat)", () => {
    const result = parseBkitVersion("0.6.1\n");
    expect(result).not.toBeNull();
    expect(result!.pinnedVersion).toBe("0.6.1");
    expect(result!.tier3Hashes).toEqual({});
  });

  it("returns null for empty content", () => {
    expect(parseBkitVersion("")).toBeNull();
    expect(parseBkitVersion("   \n  ")).toBeNull();
  });

  it("handles JSON missing tier3Hashes field (defaults to empty object)", () => {
    const json = JSON.stringify({ pinnedVersion: "0.7.0" });
    const result = parseBkitVersion(json);
    expect(result).not.toBeNull();
    expect(result!.tier3Hashes).toEqual({});
  });

  it("handles JSON with empty tier3Hashes", () => {
    const json = JSON.stringify({ pinnedVersion: "0.7.0", tier3Hashes: {} });
    const result = parseBkitVersion(json);
    expect(result).not.toBeNull();
    expect(result!.tier3Hashes).toEqual({});
  });

  it("handles plain-text without trailing newline", () => {
    const result = parseBkitVersion("0.5.0");
    expect(result).not.toBeNull();
    expect(result!.pinnedVersion).toBe("0.5.0");
    expect(result!.tier3Hashes).toEqual({});
  });

  it("retro-fit fixture: consumer with .bkit-version lacking tier3Hashes -> preserve-default (empty {})", () => {
    // Simulates a consumer that installed with v0.6.x and has a plain-text version file
    const oldFormatContent = "0.6.0\n";
    const result = parseBkitVersion(oldFormatContent);
    expect(result).not.toBeNull();
    // shouldDeleteTier3 returns false when tier3Hashes is empty (unknown → preserve)
    expect(result!.tier3Hashes).toEqual({});
    expect(shouldDeleteTier3(".github/workflows/ci.yml", "/fake/path", result!.tier3Hashes)).toBe(
      false,
    );
  });
});

// ---------------------------------------------------------------------------
// readBkitVersion — fs reader
// ---------------------------------------------------------------------------

describe("readBkitVersion", () => {
  it("returns null when file is absent", () => {
    const result = readBkitVersion(path.join(tmpDir, "nonexistent"));
    expect(result).toBeNull();
  });

  it("reads and parses JSON file", () => {
    const versionFile = path.join(tmpDir, ".bkit-version");
    const v: BkitVersion = { pinnedVersion: "0.7.0", tier3Hashes: {} };
    fs.writeFileSync(versionFile, JSON.stringify(v, null, 2) + "\n", "utf-8");
    const result = readBkitVersion(versionFile);
    expect(result).not.toBeNull();
    expect(result!.pinnedVersion).toBe("0.7.0");
  });

  it("reads and parses plain-text file (backward-compat)", () => {
    const versionFile = path.join(tmpDir, ".bkit-version");
    fs.writeFileSync(versionFile, "0.6.1\n", "utf-8");
    const result = readBkitVersion(versionFile);
    expect(result).not.toBeNull();
    expect(result!.pinnedVersion).toBe("0.6.1");
    expect(result!.tier3Hashes).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// serializeBkitVersion — JSON serializer
// ---------------------------------------------------------------------------

describe("serializeBkitVersion", () => {
  it("serializes to pretty-printed JSON with trailing newline", () => {
    const v: BkitVersion = { pinnedVersion: "0.7.0", tier3Hashes: {} };
    const result = serializeBkitVersion(v);
    expect(result.endsWith("\n")).toBe(true);
    const parsed = JSON.parse(result);
    expect(parsed.pinnedVersion).toBe("0.7.0");
    expect(parsed.tier3Hashes).toEqual({});
  });

  it("round-trips through parseBkitVersion", () => {
    const original: BkitVersion = {
      pinnedVersion: "0.7.1",
      tier3Hashes: { ".github/workflows/ci.yml": "deadbeef" },
    };
    const serialized = serializeBkitVersion(original);
    const parsed = parseBkitVersion(serialized);
    expect(parsed).not.toBeNull();
    expect(parsed!.pinnedVersion).toBe(original.pinnedVersion);
    expect(parsed!.tier3Hashes).toEqual(original.tier3Hashes);
  });
});

// ---------------------------------------------------------------------------
// sha256 + hashFile
// ---------------------------------------------------------------------------

describe("sha256", () => {
  it("returns a 64-char hex string for string input", () => {
    const hash = sha256("hello world");
    expect(hash).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
  });

  it("is deterministic for same input", () => {
    expect(sha256("test content")).toBe(sha256("test content"));
  });

  it("differs for different inputs", () => {
    expect(sha256("a")).not.toBe(sha256("b"));
  });
});

describe("hashFile", () => {
  it("returns null for absent file", () => {
    expect(hashFile(path.join(tmpDir, "nonexistent"))).toBeNull();
  });

  it("returns sha256 hex for existing file", () => {
    const filePath = path.join(tmpDir, "test.txt");
    fs.writeFileSync(filePath, "test content", "utf-8");
    const hash = hashFile(filePath);
    expect(hash).not.toBeNull();
    expect(hash).toHaveLength(64);
    expect(hash).toBe(sha256("test content"));
  });
});

// ---------------------------------------------------------------------------
// shouldDeleteTier3 — hash-guard decision
// ---------------------------------------------------------------------------

describe("shouldDeleteTier3", () => {
  it("returns false when tier3Hashes has no entry for the path (unknown → preserve)", () => {
    expect(shouldDeleteTier3("some/file.yml", path.join(tmpDir, "file.yml"), {})).toBe(false);
  });

  it("returns false when file is absent (nothing to delete)", () => {
    const hashes = { "some/file.yml": sha256("content") };
    const result = shouldDeleteTier3("some/file.yml", path.join(tmpDir, "nonexistent"), hashes);
    expect(result).toBe(false);
  });

  it("returns true when current file content matches recorded hash (safe to delete)", () => {
    const content = "ci yaml content\n";
    const filePath = path.join(tmpDir, "ci.yml");
    fs.writeFileSync(filePath, content, "utf-8");
    const hashes = { ".github/workflows/ci.yml": sha256(content) };
    expect(shouldDeleteTier3(".github/workflows/ci.yml", filePath, hashes)).toBe(true);
  });

  it("returns false when current file content differs from recorded hash (consumer modified — preserve)", () => {
    const originalContent = "original ci yaml\n";
    const modifiedContent = "consumer modified ci yaml\n";
    const filePath = path.join(tmpDir, "ci.yml");
    fs.writeFileSync(filePath, modifiedContent, "utf-8");
    const hashes = { ".github/workflows/ci.yml": sha256(originalContent) };
    expect(shouldDeleteTier3(".github/workflows/ci.yml", filePath, hashes)).toBe(false);
  });

  it("preserve-default for retro-fit consumer (no tier3Hashes → empty obj → preserve all)", () => {
    // A consumer with v0.6.x plain-text .bkit-version has tier3Hashes = {}
    // All shouldDeleteTier3 calls must return false → preserve
    const filePath = path.join(tmpDir, "ci.yml");
    fs.writeFileSync(filePath, "yaml content\n", "utf-8");
    expect(shouldDeleteTier3(".github/workflows/ci.yml", filePath, {})).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Phase 3 — Schema cleanup: tier3Hashes narrowing (BAR-167 sub-plan C Task 25)
// ---------------------------------------------------------------------------

describe("Phase 3 — tier3Hashes narrowing (backward-compat reader)", () => {
  it("parseBkitVersion reads a v2.0.0 .bkit-version JSON missing tier3Hashes → returns tier3Hashes: {} (backward-compat for one minor version)", () => {
    // Simulates a v2.0.0 consumer file that was written by the narrowed writer when
    // no byte-equal-text files were installed yet (sparse map = {}).
    const json = JSON.stringify({ pinnedVersion: "2.0.0", canonicalHashes: {} });
    const result = parseBkitVersion(json);
    expect(result).not.toBeNull();
    expect(result!.pinnedVersion).toBe("2.0.0");
    // Absent tier3Hashes field → default {} (backward-compat)
    expect(result!.tier3Hashes).toEqual({});
    // shouldDeleteTier3 with empty tier3Hashes → preserve-default (false for all paths)
    expect(shouldDeleteTier3(".cursor/Dockerfile", "/fake/path", result!.tier3Hashes)).toBe(false);
  });

  it("writeBkitVersion emits tier3Hashes containing only byte-equal-text entries when explicitly narrowed", () => {
    const versionFile = path.join(tmpDir, ".bkit-version");
    // Only byte-equal-text path in the map (json/markered-text paths excluded).
    const narrowedTier3: Record<string, string> = {
      ".cursor/Dockerfile": sha256("dockerfile content\n"),
    };
    const v: BkitVersion = {
      pinnedVersion: "2.0.0",
      tier3Hashes: narrowedTier3,
      canonicalHashes: {},
    };
    writeBkitVersion(versionFile, v);
    const result = parseBkitVersion(fs.readFileSync(versionFile, "utf-8"));
    expect(result).not.toBeNull();
    // Only Dockerfile hash present — json/markered-text paths (e.g. .cursor/hooks.json) absent
    expect(result!.tier3Hashes).toEqual(narrowedTier3);
    expect(result!.tier3Hashes[".cursor/hooks.json"]).toBeUndefined();
    expect(result!.tier3Hashes[".claude/settings.json"]).toBeUndefined();
    // Dockerfile hash present → shouldDeleteTier3 can return true when on-disk matches
    const dockerfilePath = path.join(tmpDir, "Dockerfile");
    fs.writeFileSync(dockerfilePath, "dockerfile content\n", "utf-8");
    expect(shouldDeleteTier3(".cursor/Dockerfile", dockerfilePath, result!.tier3Hashes)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// P4.T4 — canonicalHashes: backward-compat read + isConsumerModified
// ---------------------------------------------------------------------------

describe("P4.T4 — canonicalHashes backward-compat + isConsumerModified", () => {
  it("parseBkitVersion v0.6.x plain-text → canonicalHashes defaults to empty object", () => {
    const result = parseBkitVersion("0.6.1\n");
    expect(result).not.toBeNull();
    expect(result!.canonicalHashes).toEqual({});
  });

  it("parseBkitVersion v0.7.x JSON (no canonicalHashes) → canonicalHashes defaults to empty object", () => {
    const json = JSON.stringify({ pinnedVersion: "0.7.0", tier3Hashes: {} });
    const result = parseBkitVersion(json);
    expect(result).not.toBeNull();
    expect(result!.canonicalHashes).toEqual({});
  });

  it("parseBkitVersion v0.9.x JSON with canonicalHashes → reads correctly", () => {
    const json = JSON.stringify({
      pinnedVersion: "0.9.0",
      tier3Hashes: {},
      canonicalHashes: { ".claude/agents/bkit-foo.md": "abc123" },
    });
    const result = parseBkitVersion(json);
    expect(result).not.toBeNull();
    expect(result!.canonicalHashes).toEqual({ ".claude/agents/bkit-foo.md": "abc123" });
  });

  it("serializeBkitVersion includes canonicalHashes field", () => {
    const v: BkitVersion = {
      pinnedVersion: "0.9.0",
      tier3Hashes: {},
      canonicalHashes: { ".claude/agents/bkit-test.md": "deadbeef" },
    };
    const serialized = serializeBkitVersion(v);
    const parsed = JSON.parse(serialized);
    expect(parsed.canonicalHashes).toEqual({ ".claude/agents/bkit-test.md": "deadbeef" });
  });

  it("round-trip preserves canonicalHashes", () => {
    const original: BkitVersion = {
      pinnedVersion: "0.9.0",
      tier3Hashes: { ".github/workflows/ci.yml": "hash1" },
      canonicalHashes: { ".claude/agents/bkit-foo.md": "hash2" },
    };
    const serialized = serializeBkitVersion(original);
    const parsed = parseBkitVersion(serialized);
    expect(parsed).not.toBeNull();
    expect(parsed!.canonicalHashes).toEqual(original.canonicalHashes);
    expect(parsed!.tier3Hashes).toEqual(original.tier3Hashes);
  });

  it("isConsumerModified returns true when canonicalHashes has no entry for path (unknown → block silent overwrite)", () => {
    const filePath = path.join(tmpDir, "file.md");
    fs.writeFileSync(filePath, "content", "utf-8");
    expect(isConsumerModified("some/path.md", filePath, {})).toBe(true);
  });

  it("isConsumerModified returns false when file is absent", () => {
    const hashes = { ".claude/agents/bkit-foo.md": sha256("content") };
    expect(
      isConsumerModified(".claude/agents/bkit-foo.md", path.join(tmpDir, "absent.md"), hashes),
    ).toBe(false);
  });

  it("isConsumerModified returns false when file content matches canonical hash (no drift)", () => {
    const content = "bkit-managed content\n";
    const filePath = path.join(tmpDir, "bkit-foo.md");
    fs.writeFileSync(filePath, content, "utf-8");
    const hashes = { ".claude/agents/bkit-foo.md": sha256(content) };
    expect(isConsumerModified(".claude/agents/bkit-foo.md", filePath, hashes)).toBe(false);
  });

  it("isConsumerModified returns true when file content differs from canonical hash (consumer drift)", () => {
    const originalContent = "original bkit content\n";
    const consumerContent = "consumer added extra lines\n";
    const filePath = path.join(tmpDir, "bkit-foo.md");
    fs.writeFileSync(filePath, consumerContent, "utf-8");
    const hashes = { ".claude/agents/bkit-foo.md": sha256(originalContent) };
    expect(isConsumerModified(".claude/agents/bkit-foo.md", filePath, hashes)).toBe(true);
  });

  it("backward-compat: old payload without canonicalHashes → isConsumerModified returns true for all files (blocks silent overwrites)", () => {
    // Simulates a consumer with v0.7.x .bkit-version (no canonicalHashes field).
    const json = JSON.stringify({ pinnedVersion: "0.7.0", tier3Hashes: {} });
    const parsed = parseBkitVersion(json);
    expect(parsed).not.toBeNull();
    const filePath = path.join(tmpDir, "ci.yml");
    fs.writeFileSync(filePath, "some content\n", "utf-8");
    // All files appear as "unknown" → upgrade must surface a conflict for the consumer
    // to resolve rather than silently overwriting potentially-modified content.
    expect(isConsumerModified(".github/workflows/ci.yml", filePath, parsed!.canonicalHashes)).toBe(
      true,
    );
  });
});

// ---------------------------------------------------------------------------
// Managed-version marker (#256) — stampManagedVersion / managedVersionMarker
// ---------------------------------------------------------------------------

describe("managedVersionMarker", () => {
  it("builds an inert HTML comment carrying the version and the NOT-edit warning", () => {
    const m = managedVersionMarker("4.0.0");
    expect(m).toBe("<!-- bkit:managed v4.0.0 — do NOT edit; run `bkit upgrade` to refresh -->");
    expect(m.startsWith("<!--")).toBe(true);
    expect(m.endsWith("-->")).toBe(true);
  });

  it("round-trips through the extraction regex", () => {
    expect(managedVersionMarker("4.0.0").match(MANAGED_MARKER_VERSION_RE)?.[1]).toBe("4.0.0");
    expect(managedVersionMarker("12.34.56").match(MANAGED_MARKER_VERSION_RE)?.[1]).toBe("12.34.56");
  });
});

describe("stampManagedVersion", () => {
  const FM = "---\nname: bkit-foo\nmodel: x\n---\n\n**Role:** hi\n";

  it("inserts the marker immediately after the frontmatter fence", () => {
    const out = stampManagedVersion(FM, "4.0.0");
    const lines = out.split("\n");
    expect(lines[0]).toBe("---");
    expect(lines[3]).toBe("---");
    expect(lines[4]).toBe(managedVersionMarker("4.0.0"));
  });

  it("always leaves exactly one blank line below the marker (frontmatter case)", () => {
    const out = stampManagedVersion(FM, "4.0.0");
    expect(out).toMatch(/-->\n\n\S/);
    // no double blank line
    expect(out).not.toMatch(/-->\n\n\n/);
  });

  it("sinks the marker below the first heading when there is no frontmatter", () => {
    const out = stampManagedVersion("# Ship Feature\n\nbody\n", "4.0.0");
    const lines = out.split("\n");
    expect(lines[0]).toBe("# Ship Feature");
    expect(lines[1]).toBe("");
    expect(lines[2]).toBe(managedVersionMarker("4.0.0"));
    expect(lines[3]).toBe("");
    expect(lines[4]).toBe("body");
  });

  it("sinks below the first heading even when a lead-in block precedes it (cursor/opencode command shape)", () => {
    const src = "Plan Feature — Autonomous plan generation\n\n# Plan Feature\n\nbody\n";
    const out = stampManagedVersion(src, "4.0.0");
    expect(out.split("\n")[0]).toBe("Plan Feature — Autonomous plan generation");
    expect(out).toContain(`# Plan Feature\n\n${managedVersionMarker("4.0.0")}\n\nbody`);
  });

  it("still prepends at top when there is no frontmatter AND no heading", () => {
    const out = stampManagedVersion("**Role:** hi\n", "4.0.0");
    expect(out.split("\n")[0]).toBe(managedVersionMarker("4.0.0"));
  });

  it("is idempotent — stamping the same version twice yields identical bytes", () => {
    const once = stampManagedVersion(FM, "4.0.0");
    expect(stampManagedVersion(once, "4.0.0")).toBe(once);
    const cmd = stampManagedVersion("# H\n\nbody\n", "4.0.0");
    expect(stampManagedVersion(cmd, "4.0.0")).toBe(cmd);
  });

  it("replaces an existing marker on a version bump (never duplicates)", () => {
    const v1 = stampManagedVersion(FM, "4.0.0");
    const v2 = stampManagedVersion(v1, "4.1.0");
    expect((v2.match(/bkit:managed/g) ?? []).length).toBe(1);
    expect(v2.match(MANAGED_MARKER_VERSION_RE)?.[1]).toBe("4.1.0");
  });

  it("does not duplicate blank lines when the body already starts with a blank line", () => {
    const out = stampManagedVersion(FM, "4.0.0");
    // exactly: ---\n<marker>\n\n**Role**  — one blank line, body intact
    expect(out).toContain("---\n" + managedVersionMarker("4.0.0") + "\n\n**Role:** hi");
  });
});
