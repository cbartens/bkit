// bkit-version.ts — Schema for .bkit/version (P2.T3, P4.T4).
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
// Parse — backward-compat reader
// ---------------------------------------------------------------------------
/**
 * Parse `.bkit/version` content into a BkitVersion object.
 * Handles all schema versions:
 *   - v0.9.x JSON:  { pinnedVersion, tier3Hashes, canonicalHashes }
 *   - v0.7.x JSON:  { pinnedVersion, tier3Hashes } → canonicalHashes defaults to {}
 *   - v0.6.x text:  "0.6.1\n" → { pinnedVersion: "0.6.1", tier3Hashes: {}, canonicalHashes: {} }
 * Returns null if content is empty/whitespace-only (treat as absent).
 *
 * Backward-compat guarantee: absent `canonicalHashes` defaults to {} (upgrade engine
 * treats all files as "unknown" → no silent overwrites — conservative/safe).
 */
export function parseBkitVersion(content) {
    const trimmed = content.trim();
    if (!trimmed)
        return null;
    // Try JSON first
    if (trimmed.startsWith("{")) {
        try {
            const parsed = JSON.parse(trimmed);
            const pinnedVersion = typeof parsed.pinnedVersion === "string" ? parsed.pinnedVersion : "";
            const tier3Hashes = parsed.tier3Hashes &&
                typeof parsed.tier3Hashes === "object" &&
                !Array.isArray(parsed.tier3Hashes)
                ? parsed.tier3Hashes
                : {};
            // P4.T4: canonicalHashes is additive — absent on old payloads → default {}
            const canonicalHashes = parsed.canonicalHashes &&
                typeof parsed.canonicalHashes === "object" &&
                !Array.isArray(parsed.canonicalHashes)
                ? parsed.canonicalHashes
                : {};
            return { pinnedVersion, tier3Hashes, canonicalHashes };
        }
        catch {
            // Fall through to plain-text parse
        }
    }
    // Plain-text fallback (v0.6.x format: just a semver string)
    // KN-5 guard: reject NaN-producing inputs
    if (!trimmed)
        return null;
    return { pinnedVersion: trimmed, tier3Hashes: {}, canonicalHashes: {} };
}
/**
 * Read and parse `.bkit/version` from an absolute path.
 * Returns null if the file is absent or content is empty.
 */
export function readBkitVersion(versionFilePath) {
    if (!fs.existsSync(versionFilePath))
        return null;
    const content = fs.readFileSync(versionFilePath, "utf-8");
    return parseBkitVersion(content);
}
// ---------------------------------------------------------------------------
// Write — serialize to JSON
// ---------------------------------------------------------------------------
/**
 * Serialize a BkitVersion to JSON for writing to `.bkit/version`.
 * Always writes pretty-printed JSON with a trailing newline.
 */
export function serializeBkitVersion(v) {
    return JSON.stringify(v, null, 2) + "\n";
}
/**
 * Write a BkitVersion to disk at `versionFilePath`.
 */
export function writeBkitVersion(versionFilePath, v) {
    fs.mkdirSync(path.dirname(versionFilePath), { recursive: true });
    fs.writeFileSync(versionFilePath, serializeBkitVersion(v), "utf-8");
}
// ---------------------------------------------------------------------------
// canonicalHashes helpers (P4.T4)
// ---------------------------------------------------------------------------
/**
 * Decide whether a managed file has been modified by the consumer since install.
 *
 * Returns true (treat as consumer-modified — block silent overwrite) when:
 *   - `canonicalHashes` has a recorded hash for `relPath` and the current on-disk
 *     content hash differs from it (true drift), OR
 *   - `canonicalHashes` has no entry for `relPath` (unknown hash state — could be a
 *     pre-v0.9.x install where hashes were never recorded, or a file installed before
 *     hash-tracking applied). Defaulting to true forces upgrades to surface a conflict
 *     for the consumer to resolve, rather than silently overwriting content.
 *
 * Returns false (no drift — safe to upgrade) only when:
 *   - The current on-disk content matches the recorded canonical hash, OR
 *   - The file is absent (nothing to compare).
 *
 * `relPath`: consumer-relative path (e.g. ".claude/agents/bkit-foo.md")
 * `absolutePath`: absolute path to the file on disk
 * `canonicalHashes`: the hashes map from the BkitVersion record
 */
export function isConsumerModified(relPath, absolutePath, canonicalHashes) {
    const current = hashFile(absolutePath);
    if (!current)
        return false; // absent → nothing to compare
    const recorded = canonicalHashes[relPath];
    if (!recorded)
        return true; // unknown → treat as modified to prevent silent overwrites
    return current !== recorded;
}
// ---------------------------------------------------------------------------
// sha256 — content hashing for tier3Hashes / canonicalHashes
// ---------------------------------------------------------------------------
/**
 * Compute the sha256 hex digest of a string or Buffer.
 * Used to record Tier-3 file content at install time.
 */
export function sha256(content) {
    return crypto.createHash("sha256").update(content).digest("hex");
}
/**
 * Read a file and return its sha256 hex digest. Returns null if absent.
 */
export function hashFile(filePath) {
    if (!fs.existsSync(filePath))
        return null;
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
export function shouldDeleteTier3(relPath, absolutePath, tier3Hashes) {
    const recorded = tier3Hashes[relPath];
    if (!recorded)
        return false; // unknown → preserve
    const current = hashFile(absolutePath);
    if (!current)
        return false; // absent → nothing to delete
    return current === recorded;
}
// ---------------------------------------------------------------------------
// Managed-version marker (#256) — single source of truth for the marker shape
// stamped into every rendered agent + command (.claude / .cursor / .opencode).
//
// Each rendered file self-declares the bkit version it was generated from via an
// inert HTML comment placed after the frontmatter fence. `bkit-modules.ts` stamps
// it at render time (stampManagedVersion); the `bkit check` Phase-3 gate in
// `bkit-postinstall.ts` (detectRenderedPromptsStale) reads it back with
// MANAGED_MARKER_VERSION_RE and hard-fails on drift, so consumers can never
// silently run prompts/workflows from an older bkit.
//
// Lives here (version domain, node-builtins-only) so both the renderer and the
// detector import ONE definition — the marker shape can never drift between the
// side that writes it and the side that reads it. An HTML comment is inert under
// the agent reader and every provider frontmatter parser, so it never breaks a
// rendered template.
// ---------------------------------------------------------------------------
const MANAGED_MARKER_TOKEN = "bkit:managed v";
// Matches a previously-stamped marker line (anchored at any line start) including
// its trailing newline, so re-stamping replaces rather than appends (idempotent).
export const MANAGED_MARKER_LINE_RE = /^<!-- bkit:managed v[^\n]*-->\n?/m;
// Extracts the stamped version. `\S+` stops at the space before the em-dash,
// capturing just the semver — used by the detector to compare against the
// installing version.
export const MANAGED_MARKER_VERSION_RE = /<!-- bkit:managed v(\S+)/;
/** Build the managed-version marker comment for a given version. */
export function managedVersionMarker(version) {
    return `<!-- ${MANAGED_MARKER_TOKEN}${version} — do NOT edit; run \`bkit upgrade\` to refresh -->`;
}
/**
 * Insert (or replace) the managed-version marker immediately after the rendered
 * file's frontmatter fence, always followed by exactly one blank line. Idempotent:
 * any existing marker is stripped first and leading body blanks are collapsed, so
 * stamping the same content twice yields identical bytes. Falls back to a top
 * prepend when the content has no frontmatter (e.g. cursor/opencode commands whose
 * transforms strip the frontmatter) — there too the marker is followed by a blank
 * line so the body never butts up against it.
 */
export function stampManagedVersion(content, version) {
    const stripped = content.replace(MANAGED_MARKER_LINE_RE, "");
    const marker = managedVersionMarker(version);
    const fm = stripped.match(/^---\n[\s\S]*?\n---\n/);
    if (fm) {
        const cut = fm[0].length;
        const body = stripped.slice(cut).replace(/^\n+/, "");
        return stripped.slice(0, cut) + marker + "\n\n" + body;
    }
    return marker + "\n\n" + stripped.replace(/^\n+/, "");
}
