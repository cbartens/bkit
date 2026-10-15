// install/version-file.ts — Schema for .bkit/version.
//
// Shape: JSON { pinnedVersion, canonicalHashes, claudeAllowDerived }. Content that is
// empty or not a JSON object reads as absent (null).
//
// `canonicalHashes`: map of consumer-relative path → sha256 hex of the file
// content bkit wrote. Used by `bkit upgrade` to detect consumer drift and by
// `bkit uninstall` to delete an owned file only when it is unchanged since bkit
// wrote it. Absent means "unknown" → treat as consumer-modified (preserve).
//
// Security note: sha256 used for content identity only, not cryptographic
// authentication. No secrets are stored here.
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { parseJson } from "../shared/json.js";
import { getTemplatesRoot, templateRelPath } from "../shared/package-roots.js";
// ---------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------
/**
 * Parse `.bkit/version` content into a BkitVersion object. Returns null when the
 * content is empty or is not a JSON object (treat as absent). A missing
 * `canonicalHashes` reads as {} (every file "unknown" → no silent overwrites) and a
 * missing `claudeAllowDerived` as [] (bkit prunes nothing).
 */
export function parseBkitVersion(content) {
    const trimmed = content.trim();
    if (!trimmed.startsWith("{"))
        return null;
    const json = parseJson(trimmed);
    if (!json.ok || typeof json.value !== "object" || json.value === null)
        return null;
    const parsed = json.value;
    const pinnedVersion = typeof parsed.pinnedVersion === "string" ? parsed.pinnedVersion : "";
    const hashes = parsed.canonicalHashes;
    const canonicalHashes = hashes && typeof hashes === "object" && !Array.isArray(hashes) ? { ...hashes } : {};
    const claudeAllowDerived = Array.isArray(parsed.claudeAllowDerived)
        ? parsed.claudeAllowDerived
        : [];
    return { pinnedVersion, canonicalHashes, claudeAllowDerived };
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
 * Always writes pretty-printed JSON with a trailing newline, schema fields only.
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
/**
 * The merge both writers share (install's postDispatch and
 * `updateCanonicalHashesAfterUpgrade`): fresh entries overwrite, and entries whose
 * path is no longer on disk — or that belong to the copy-and-own template set —
 * are dropped.
 *
 * A recorded hash is only ever consulted for a file that exists — drift detection
 * reads the file, uninstall deletes it — so an entry for an absent path is dead
 * bookkeeping, and a file recreated at that path later would be misclassified as
 * bkit-owned. A template-set path is never a file bkit owns: install copies it
 * byte-for-byte into `.bkit/templates/` and never writes the consumer's own copy,
 * so it must carry no ownership hash. Retired and renamed managed files leave such
 * entries behind, and a pure merge would preserve them forever (the
 * `.bkit/scripts/…` entry a #507 move left and the `scripts/graphify/**` +
 * `scripts/serena/bkit-serena-mcp.sh` entries a #489 move left are the observed
 * cases; the latter survive the absent-path prune because the adopted copy stays on
 * disk).
 *
 * `removing` lists paths (or directories) a dry run would delete: they count as absent, so a
 * dry run prunes the same entries the real run does.
 *
 * `pruned` counts the dropped entries so callers can treat a prune-only merge as a
 * change that is still worth writing.
 */
export function mergeCanonicalHashes(cwd, existing, fresh, removing = []) {
    const canonicalHashes = {};
    const isRemoving = (relPath) => removing.some((r) => {
        const dir = r.replace(/[\\/]+$/, "");
        return relPath === dir || relPath.startsWith(`${dir}/`);
    });
    let pruned = 0;
    for (const [relPath, hash] of Object.entries(existing)) {
        if (!fs.existsSync(path.join(cwd, relPath)) ||
            isRemoving(relPath) ||
            isTemplateSetPath(relPath)) {
            pruned++;
            continue;
        }
        canonicalHashes[relPath] = hash;
    }
    return { canonicalHashes: { ...canonicalHashes, ...fresh }, pruned };
}
/** True when `dest` is a member of the package's copy-and-own template set. */
function isTemplateSetPath(dest) {
    return fs.existsSync(path.join(getTemplatesRoot(), templateRelPath(dest)));
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
// Matches a stamped marker line in any form (anchored at a line start) including its
// trailing newline, so re-stamping replaces rather than appends (idempotent). Inline
// prose that quotes the marker never starts a line with it, so it never matches.
export const MANAGED_MARKER_LINE_RE = /^(?:<!-- |# <!-- |\/\/ )bkit:managed v[^\n]*\n?/m;
// Extracts the stamped version. `\S+` stops at the space before the em-dash.
export const MANAGED_MARKER_VERSION_RE = /bkit:managed v(\S+)/;
/** Build the managed-version marker for a given version, in the given comment syntax. */
export function managedVersionMarker(version, form = "html") {
    const text = `bkit:managed v${version} — do not edit; run \`bkit upgrade\` to refresh`;
    if (form === "slash")
        return `// ${text}`;
    return form === "hash" ? `# <!-- ${text} -->` : `<!-- ${text} -->`;
}
/** Version of the first full-line managed-version marker in `content`, or null when none. */
export function readManagedVersion(content) {
    const line = content.match(MANAGED_MARKER_LINE_RE)?.[0];
    return line?.match(MANAGED_MARKER_VERSION_RE)?.[1] ?? null;
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
