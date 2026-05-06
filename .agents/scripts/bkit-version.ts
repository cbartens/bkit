// bkit-version.ts — Schema for .agents/.bkit-version (P2.T3, P4.T4).
//
// Extension history:
//   v0.6.x schema: plain text "0.6.1\n"
//   v0.7.x schema: JSON { pinnedVersion: string; tier3Hashes?: Record<string, string> }
//   v0.9.x schema: JSON { pinnedVersion: string; tier3Hashes?: ...; canonicalHashes?: ... }
//
// Backward-compat: if the file parses as plain text (not JSON), treat it as
// { pinnedVersion: trimmedContent, tier3Hashes: {}, canonicalHashes: {} } —
// no fields are required. This ensures `bkit uninstall` works on consumers
// that installed with v0.6.x before the schema extension.
//
// `tier3Hashes`: map of consumer-relative path → sha256 hex of the file content
// AT THE TIME of install. Used by `bkit uninstall` to decide whether a Tier-3
// file was modified by the consumer (preserve) or still matches the default
// bkit installed content (safe to delete).
//
// `canonicalHashes` (P4.T4 — additive, v0.9.x+):
// Map of consumer-relative path → sha256 hex of the CANONICAL bkit-managed
// file content AT THE TIME of install. Covers Tier-1 and Tier-2 managed files
// (all files bkit writes during install). Used by `bkit upgrade` diff engine
// to detect consumer drift: if on-disk hash differs from canonicalHash, the
// consumer modified the file since install. Absent means "unknown" →
// backward-compat: treat as no recorded hash (preserve-default).
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
  /**
   * sha256 hex digests of ALL bkit-canonical managed files at install time.
   * (P4.T4 — additive field, v0.9.x+)
   *
   * Key: consumer-relative path (e.g. ".claude/agents/bkit-foo.md")
   * Value: sha256 hex of the bkit-written file content at install time.
   *
   * Used by `bkit upgrade` diff engine: if the current on-disk hash for a
   * path differs from its canonicalHash, the consumer modified the file since
   * install → do NOT silently overwrite during upgrade.
   *
   * Absent means "unknown" → backward-compat: treat as no recorded hash.
   * Old payloads that lack this field produce {} on parse — all files appear
   * as "consumer-modified" to the upgrade engine → conservative: no silent
   * overwrites (safe).
   */
  canonicalHashes: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Parse — backward-compat reader
// ---------------------------------------------------------------------------

/**
 * Parse `.agents/.bkit-version` content into a BkitVersion object.
 * Handles all schema versions:
 *   - v0.9.x JSON:  { pinnedVersion, tier3Hashes, canonicalHashes }
 *   - v0.7.x JSON:  { pinnedVersion, tier3Hashes } → canonicalHashes defaults to {}
 *   - v0.6.x text:  "0.6.1\n" → { pinnedVersion: "0.6.1", tier3Hashes: {}, canonicalHashes: {} }
 * Returns null if content is empty/whitespace-only (treat as absent).
 *
 * Backward-compat guarantee: absent `canonicalHashes` defaults to {} (upgrade engine
 * treats all files as "unknown" → no silent overwrites — conservative/safe).
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
      // P4.T4: canonicalHashes is additive — absent on old payloads → default {}
      const canonicalHashes =
        parsed.canonicalHashes &&
        typeof parsed.canonicalHashes === "object" &&
        !Array.isArray(parsed.canonicalHashes)
          ? (parsed.canonicalHashes as Record<string, string>)
          : {};
      return { pinnedVersion, tier3Hashes, canonicalHashes };
    } catch {
      // Fall through to plain-text parse
    }
  }

  // Plain-text fallback (v0.6.x format: just a semver string)
  // KN-5 guard: reject NaN-producing inputs
  if (!trimmed) return null;
  return { pinnedVersion: trimmed, tier3Hashes: {}, canonicalHashes: {} };
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
// canonicalHashes helpers (P4.T4)
// ---------------------------------------------------------------------------

/**
 * Decide whether a managed file has been modified by the consumer since install.
 *
 * Returns true (consumer-modified) when:
 *   - `canonicalHashes` has a recorded hash for `relPath`, AND
 *   - The current on-disk content hash differs from the recorded canonical hash.
 *
 * Returns false (no drift detected — safe to upgrade) when:
 *   - `canonicalHashes` has no entry for `relPath` (unknown hash state → returns false,
 *     treated as unmodified; upgrade will apply template). Errs on the side of applying
 *     upgrades rather than blocking — callers that installed with a version that did not
 *     populate canonicalHashes will always see false here, so upgrades proceed.
 *   - The current on-disk content matches the canonical hash
 *   - The file is absent (nothing to compare)
 *
 * `relPath`: consumer-relative path (e.g. ".claude/agents/bkit-foo.md")
 * `absolutePath`: absolute path to the file on disk
 * `canonicalHashes`: the hashes map from the BkitVersion record
 */
export function isConsumerModified(
  relPath: string,
  absolutePath: string,
  canonicalHashes: Record<string, string>,
): boolean {
  const recorded = canonicalHashes[relPath];
  if (!recorded) return false; // unknown → not detected as drift (conservative)

  const current = hashFile(absolutePath);
  if (!current) return false; // absent → nothing to compare

  return current !== recorded;
}

// ---------------------------------------------------------------------------
// sha256 — content hashing for tier3Hashes / canonicalHashes
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
