// bkit-version.test.ts — P2.T3 — schema tests.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  parseBkitVersion,
  readBkitVersion,
  serializeBkitVersion,
  sha256,
  hashFile,
  isConsumerModified,
  managedVersionMarker,
  readManagedVersion,
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
// parseBkitVersion
// ---------------------------------------------------------------------------

describe("parseBkitVersion", () => {
  it("parses the current JSON format", () => {
    const json = JSON.stringify({
      pinnedVersion: "5.0.0",
      canonicalHashes: { ".bkit/README.md": "abc123" },
      claudeAllowDerived: ["WebFetch(domain:example.com)"],
    });
    const result = parseBkitVersion(json);
    expect(result).toEqual({
      pinnedVersion: "5.0.0",
      canonicalHashes: { ".bkit/README.md": "abc123" },
      claudeAllowDerived: ["WebFetch(domain:example.com)"],
    });
  });

  it("returns null for empty content", () => {
    expect(parseBkitVersion("")).toBeNull();
    expect(parseBkitVersion("   \n  ")).toBeNull();
  });

  it("returns null for content that is not a JSON object", () => {
    expect(parseBkitVersion("0.5.0")).toBeNull();
    expect(parseBkitVersion("{ not json")).toBeNull();
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
    const v: BkitVersion = { pinnedVersion: "0.7.0", canonicalHashes: {}, claudeAllowDerived: [] };
    fs.writeFileSync(versionFile, JSON.stringify(v, null, 2) + "\n", "utf-8");
    const result = readBkitVersion(versionFile);
    expect(result).not.toBeNull();
    expect(result!.pinnedVersion).toBe("0.7.0");
  });
});

// ---------------------------------------------------------------------------
// serializeBkitVersion — JSON serializer
// ---------------------------------------------------------------------------

describe("serializeBkitVersion", () => {
  it("serializes to pretty-printed JSON with trailing newline", () => {
    const v: BkitVersion = { pinnedVersion: "0.7.0", canonicalHashes: {}, claudeAllowDerived: [] };
    const result = serializeBkitVersion(v);
    expect(result.endsWith("\n")).toBe(true);
    expect(JSON.parse(result).pinnedVersion).toBe("0.7.0");
  });

  it("round-trips through parseBkitVersion", () => {
    const original: BkitVersion = {
      pinnedVersion: "0.9.0",
      canonicalHashes: { ".claude/agents/bkit-foo.md": "hash2" },
      claudeAllowDerived: [],
    };
    expect(parseBkitVersion(serializeBkitVersion(original))).toEqual(original);
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
// P4.T4 — canonicalHashes read + isConsumerModified
// ---------------------------------------------------------------------------

describe("P4.T4 — canonicalHashes + isConsumerModified", () => {
  it("parseBkitVersion JSON with canonicalHashes → reads correctly", () => {
    const json = JSON.stringify({
      pinnedVersion: "0.9.0",
      canonicalHashes: { ".claude/agents/bkit-foo.md": "abc123" },
    });
    const result = parseBkitVersion(json);
    expect(result).not.toBeNull();
    expect(result!.canonicalHashes).toEqual({ ".claude/agents/bkit-foo.md": "abc123" });
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

  it("a record without canonicalHashes → isConsumerModified returns true for all files (blocks silent overwrites)", () => {
    const json = JSON.stringify({ pinnedVersion: "0.7.0" });
    const parsed = parseBkitVersion(json);
    expect(parsed).not.toBeNull();
    const filePath = path.join(tmpDir, "ci.yml");
    fs.writeFileSync(filePath, "some content\n", "utf-8");
    // All files appear as "unknown" → upgrade surfaces a conflict for the consumer.
    expect(isConsumerModified(".github/workflows/ci.yml", filePath, parsed!.canonicalHashes)).toBe(
      true,
    );
  });
});

// ---------------------------------------------------------------------------
// Managed-version marker — stampManagedVersion / managedVersionMarker
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

  it("wraps the same marker text in the hash and slash comment forms", () => {
    const html = managedVersionMarker("4.0.0");
    expect(managedVersionMarker("4.0.0", "hash")).toBe(`# ${html}`);
    expect(managedVersionMarker("4.0.0", "slash")).toBe(
      `// ${html.replace(/^<!-- /, "").replace(/ -->$/, "")}`,
    );
  });
});

describe("readManagedVersion", () => {
  it("reads the version from a full-line marker in every form", () => {
    for (const form of ["html", "hash", "slash"] as const) {
      expect(readManagedVersion(`x\n${managedVersionMarker("4.2.0", form)}\ny\n`)).toBe("4.2.0");
    }
  });

  it("ignores a marker quoted mid-line in prose", () => {
    expect(readManagedVersion("Docs stamp a `<!-- bkit:managed vX.Y.Z … -->` marker.\n")).toBe(
      null,
    );
  });

  it("returns the first marker when several are present", () => {
    const content = `${managedVersionMarker("1.0.0")}\n${managedVersionMarker("2.0.0", "slash")}\n`;
    expect(readManagedVersion(content)).toBe("1.0.0");
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

describe("claudeAllowDerived provenance field (T16)", () => {
  it("defaults to [] at the JSON return when the key is absent", () => {
    const v = parseBkitVersion(JSON.stringify({ pinnedVersion: "4.12.0", canonicalHashes: {} }));
    expect(v?.claudeAllowDerived).toEqual([]);
  });

  it("defaults to [] when the key is present but not an array", () => {
    const v = parseBkitVersion(
      JSON.stringify({ pinnedVersion: "4.12.0", claudeAllowDerived: "WebFetch(domain:x.example)" }),
    );
    expect(v?.claudeAllowDerived).toEqual([]);
  });

  it("round-trips a populated record unchanged through parse and serialize", () => {
    const rows = ["WebFetch(domain:models.dev)", "WebFetch(domain:*.models.dev)"];
    const parsed = parseBkitVersion(
      JSON.stringify({
        pinnedVersion: "4.12.0",
        canonicalHashes: {},
        claudeAllowDerived: rows,
      }),
    );
    expect(parsed?.claudeAllowDerived).toEqual(rows);
    expect(parseBkitVersion(serializeBkitVersion(parsed!))?.claudeAllowDerived).toEqual(rows);
  });
});
