// bkit-version.ts — Schema for .agents/.bkit-version (P2.T3).
//
// Extension over the plain-text version pin (v0.6.x schema):
//   Old: plain text "0.6.1\n"
//   New: JSON { pinnedVersion: string; tier3Hashes?: Record<string, string> }
//
// Backward-compat: if the file parses as plain text (not JSON), treat it as
// { pinnedVersion: trimmedContent, tier3Hashes: {} } — no fields are required.
// This ensures `bkit uninstall` works on consumers that installed with v0.6.x
// before the schema extension.
//
// `tier3Hashes`: map of consumer-relative path → sha256 hex of the file content
// AT THE TIME of install. Used by `bkit uninstall` to decide whether a Tier-3
// file was modified by the consumer (preserve) or still matches the default
// bkit installed content (safe to delete).
//
// Security note: sha256 used for content identity only, not cryptographic
// authentication. No secrets are stored here.

import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";

// ---------------------------------------------------------------------------
// Schema types
// ---------------------------------------------------------------------------

export interface BkitVersion {
  /** Semver string of the installed bkit version, e.g. "0.7.0". */
  pinnedVersion: string;
  /**
   * sha256 hex digests of Tier-3 files at install time.
   * Key: consumer-relative path (e.g. ".github/workflows/ci.yml")
   * Value: sha256 hex of the file content at install time.
   * Absent means "unknown" → preserve-default policy applies (never delete).
   */
  tier3Hashes: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Parse — backward-compat reader
// ---------------------------------------------------------------------------

/**
 * Parse `.agents/.bkit-version` content into a BkitVersion object.
 * Handles both:
 *   - New JSON format:  { pinnedVersion, tier3Hashes }
 *   - Old plain-text:   "0.6.1\n"  → { pinnedVersion: "0.6.1", tier3Hashes: {} }
 * Returns null if content is empty/whitespace-only (treat as absent).
 */
export function parseBkitVersion(content: string): BkitVersion | null {
  const trimmed = content.trim();
  if (!trimmed) return null;

  // Try JSON first
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as Partial<BkitVersion>;
      const pinnedVersion = typeof parsed.pinnedVersion === "string" ? parsed.pinnedVersion : "";
      const tier3Hashes =
        parsed.tier3Hashes &&
        typeof parsed.tier3Hashes === "object" &&
        !Array.isArray(parsed.tier3Hashes)
          ? (parsed.tier3Hashes as Record<string, string>)
          : {};
      return { pinnedVersion, tier3Hashes };
    } catch {
      // Fall through to plain-text parse
    }
  }

  // Plain-text fallback (v0.6.x format: just a semver string)
  // KN-5 guard: reject NaN-producing inputs
  if (!trimmed) return null;
  return { pinnedVersion: trimmed, tier3Hashes: {} };
}

/**
 * Read and parse `.agents/.bkit-version` from an absolute path.
 * Returns null if the file is absent or content is empty.
 */
export function readBkitVersion(versionFilePath: string): BkitVersion | null {
  if (!fs.existsSync(versionFilePath)) return null;
  const content = fs.readFileSync(versionFilePath, "utf-8");
  return parseBkitVersion(content);
}

// ---------------------------------------------------------------------------
// Write — serialize to JSON
// ---------------------------------------------------------------------------

/**
 * Serialize a BkitVersion to JSON for writing to `.agents/.bkit-version`.
 * Always writes pretty-printed JSON with a trailing newline.
 */
export function serializeBkitVersion(v: BkitVersion): string {
  return JSON.stringify(v, null, 2) + "\n";
}

/**
 * Write a BkitVersion to disk at `versionFilePath`.
 */
export function writeBkitVersion(versionFilePath: string, v: BkitVersion): void {
  fs.mkdirSync(path.dirname(versionFilePath), { recursive: true });
  fs.writeFileSync(versionFilePath, serializeBkitVersion(v), "utf-8");
}

// ---------------------------------------------------------------------------
// sha256 — content hashing for tier3Hashes
// ---------------------------------------------------------------------------

/**
 * Compute the sha256 hex digest of a string or Buffer.
 * Used to record Tier-3 file content at install time.
 */
export function sha256(content: string | Buffer): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Read a file and return its sha256 hex digest. Returns null if absent.
 */
export function hashFile(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath);
  return sha256(content);
}

// ---------------------------------------------------------------------------
// shouldDeleteTier3 — hash-guard decision for uninstall
// ---------------------------------------------------------------------------

/**
 * Decide whether a Tier-3 file is safe to delete during `bkit uninstall`.
 *
 * Returns true (safe to delete) when:
 *   1. `tier3Hashes` has a recorded hash for `relPath`, AND
 *   2. The current on-disk content matches that recorded hash.
 *
 * Returns false (preserve) when:
 *   - `tier3Hashes` has no entry for `relPath` (unknown — preserve by default)
 *   - The on-disk content differs from the recorded hash (consumer modified it)
 *   - The file is absent (nothing to delete)
 *
 * `relPath`: consumer-relative path (e.g. ".github/workflows/ci.yml")
 * `absolutePath`: absolute path to the file on disk
 * `tier3Hashes`: the hashes map from the BkitVersion record
 */
export function shouldDeleteTier3(
  relPath: string,
  absolutePath: string,
  tier3Hashes: Record<string, string>,
): boolean {
  const recorded = tier3Hashes[relPath];
  if (!recorded) return false; // unknown → preserve

  const current = hashFile(absolutePath);
  if (!current) return false; // absent → nothing to delete

  return current === recorded;
}
