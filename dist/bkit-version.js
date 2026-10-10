// bkit-version.ts — Schema for .bkit/version.
//
// Shapes the parser reads:
//   v0.6.x schema: plain text "0.6.1\n"
//   v0.7.x schema: JSON { pinnedVersion: string; tier3Hashes?: Record<string, string> }
//   v0.9.x schema: JSON { pinnedVersion: string; tier3Hashes?: ...; canonicalHashes?: ... }
//   current:       JSON { pinnedVersion, canonicalHashes, claudeAllowDerived }
//
// A file that parses as plain text (not JSON) reads as
// { pinnedVersion: trimmedContent, canonicalHashes: {} } — no fields are required.
//
// `canonicalHashes`: map of consumer-relative path → sha256 hex of the file
// content bkit wrote. Used by `bkit upgrade` to detect consumer drift and by
// `bkit uninstall` to delete an owned file only when it is unchanged since bkit
// wrote it. Absent means "unknown" → treat as consumer-modified (preserve).
//
// `tier3Hashes` (legacy): a second hash map an older bkit wrote. The parser folds
// it into `canonicalHashes` (a canonical entry wins), and the next install or
// upgrade rewrites the file without the field.
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
 *   - current JSON: { pinnedVersion, canonicalHashes, claudeAllowDerived }
 *   - v0.9.x JSON:  { pinnedVersion, tier3Hashes, canonicalHashes } → tier3Hashes folded in
 *   - v0.7.x JSON:  { pinnedVersion, tier3Hashes } → canonicalHashes = tier3Hashes
 *   - v0.6.x text:  "0.6.1\n" → { pinnedVersion: "0.6.1", canonicalHashes: {} }
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
            const hashMap = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : null;
            // tier3Hashes records what bkit wrote, exactly as canonicalHashes does, so it
            // folds in underneath it (a canonical entry wins).
            const tier3Hashes = hashMap(parsed.tier3Hashes);
            // P4.T4: canonicalHashes is additive — absent on old payloads → default {}
            const canonicalHashes = { ...tier3Hashes, ...hashMap(parsed.canonicalHashes) };
            // Additive, same shape of guard as canonicalHashes — absent on old payloads → [].
            // Older payloads carry the same record as `webFetchDerived`.
            const recorded = parsed.claudeAllowDerived ?? parsed.webFetchDerived;
            const claudeAllowDerived = Array.isArray(recorded) ? recorded : [];
            return {
                pinnedVersion,
                canonicalHashes,
                claudeAllowDerived,
                ...("tier3Hashes" in parsed ? { legacyTier3Hashes: true } : {}),
            };
        }
        catch {
            // Fall through to plain-text parse
        }
    }
    // Plain-text fallback (v0.6.x format: just a semver string)
    // KN-5 guard: reject NaN-producing inputs
    if (!trimmed)
        return null;
    return { pinnedVersion: trimmed, canonicalHashes: {}, claudeAllowDerived: [] };
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
 * Always writes pretty-printed JSON with a trailing newline. Writes the schema
 * fields only, so the parser's `legacyTier3Hashes` flag never reaches disk.
 */
export function serializeBkitVersion(v) {
    const { pinnedVersion, canonicalHashes, claudeAllowDerived } = v;
    return JSON.stringify({ pinnedVersion, canonicalHashes, claudeAllowDerived }, null, 2) + "\n";
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
 *   - `canonicalHashes` has no entry for `relPath` (unknown hash state); upgrade then
 *     surfaces a conflict for the consumer to resolve.
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
// sha256 — content hashing for canonicalHashes
// ---------------------------------------------------------------------------
/**
 * Compute the sha256 hex digest of a string or Buffer.
 * Used to record the content of the files bkit writes.
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
// Managed-version marker — single source of truth for the marker shape
// stamped into every rendered agent + command (.claude / .cursor / .opencode).
//
// Each rendered file self-declares the bkit version it was generated from via an
// inert HTML comment placed after the frontmatter fence. `bkit-modules.ts` stamps
// it at render time (stampManagedVersion); the `bkit check` Phase-3 gate in
// `bkit-postinstall.ts` (detectRenderedPromptsStale) reads it back with
// MANAGED_MARKER_VERSION_RE and hard-fails on drift.
//
// Lives here (version domain, node-builtins-only); the renderer and the detector
// import ONE definition. An HTML comment is inert under the agent reader and every
// provider frontmatter parser.
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
 * stamping the same content twice yields identical bytes. With no frontmatter (e.g.
 * cursor/opencode commands whose transforms strip the frontmatter), the marker sinks
 * below the content's first Markdown heading instead, so it never becomes the
 * IDE-visible first line; falls back to a top prepend only when there is no heading
 * either, also followed by a blank line.
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
    // No frontmatter — the cursor/opencode command transforms remove it (applyT1 /
    // applyOpencodeCommand). A marker on line 1 would be the IDE-visible command
    // description, so it sinks below the first heading when there is one.
    const heading = stripped.match(/^#{1,6} .*$/m);
    if (heading?.index !== undefined) {
        const cut = heading.index + heading[0].length;
        const head = stripped.slice(0, cut);
        const rest = stripped.slice(cut).replace(/^\n+/, "");
        return rest ? `${head}\n\n${marker}\n\n${rest}` : `${head}\n\n${marker}\n`;
    }
    return marker + "\n\n" + stripped.replace(/^\n+/, "");
}
