// bkit-version.ts — Schema for .bkit/version.
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

// ---------------------------------------------------------------------------
// Schema types
// ---------------------------------------------------------------------------

export interface BkitVersion {
  /** Semver string of the installed bkit version, e.g. "0.7.0". */
  pinnedVersion: string;
  /**
   * sha256 hex digests of ALL bkit-canonical managed files at install time.
   *
   * Key: consumer-relative path (e.g. ".claude/agents/bkit-foo.md")
   * Value: sha256 hex of the bkit-written file content at install time.
   *
   * Used by `bkit upgrade` diff engine: if the current on-disk hash for a
   * path differs from its canonicalHash, the consumer modified the file since
   * install → do NOT silently overwrite during upgrade.
   *
   * Absent means "unknown": parses to {}, and every file reads as
   * "consumer-modified" to the upgrade engine (no silent overwrites).
   */
  canonicalHashes: Record<string, string>;
  /**
   * The `permissions.allow` rows bkit itself derived and wrote into
   * `.claude/settings.json` at install time (`WebFetch(domain:…)` from
   * `allowed-domains`, `mcp__…` from `mcp-servers`) — the provenance record that lets
   * a later run prune a row it added without touching one the consumer added by hand.
   *
   * Absent means "unknown" → defaults to `[]`, i.e. bkit claims authorship of nothing
   * and prunes nothing. That is the conservative direction: the cost is a stale row
   * surviving, never a consumer's own row being deleted.
   */
  claudeAllowDerived: string[];
}

// ---------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------

/**
 * Parse `.bkit/version` content into a BkitVersion object. Returns null when the
 * content is empty or is not a JSON object (treat as absent). A missing
 * `canonicalHashes` reads as {} (every file "unknown" → no silent overwrites) and a
 * missing `claudeAllowDerived` as [] (bkit prunes nothing).
 */
export function parseBkitVersion(content: string): BkitVersion | null {
  const trimmed = content.trim();
  if (!trimmed.startsWith("{")) return null;
  let parsed: Partial<BkitVersion>;
  try {
    parsed = JSON.parse(trimmed) as Partial<BkitVersion>;
  } catch {
    return null;
  }
  const pinnedVersion = typeof parsed.pinnedVersion === "string" ? parsed.pinnedVersion : "";
  const hashes = parsed.canonicalHashes;
  const canonicalHashes =
    hashes && typeof hashes === "object" && !Array.isArray(hashes) ? { ...hashes } : {};
  const claudeAllowDerived = Array.isArray(parsed.claudeAllowDerived)
    ? parsed.claudeAllowDerived
    : [];
  return { pinnedVersion, canonicalHashes, claudeAllowDerived };
}

/**
 * Read and parse `.bkit/version` from an absolute path.
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
 * Serialize a BkitVersion to JSON for writing to `.bkit/version`.
 * Always writes pretty-printed JSON with a trailing newline, schema fields only.
 */
export function serializeBkitVersion(v: BkitVersion): string {
  const { pinnedVersion, canonicalHashes, claudeAllowDerived } = v;
  return JSON.stringify({ pinnedVersion, canonicalHashes, claudeAllowDerived }, null, 2) + "\n";
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
export function isConsumerModified(
  relPath: string,
  absolutePath: string,
  canonicalHashes: Record<string, string>,
): boolean {
  const current = hashFile(absolutePath);
  if (!current) return false; // absent → nothing to compare

  const recorded = canonicalHashes[relPath];
  if (!recorded) return true; // unknown → treat as modified to prevent silent overwrites

  return current !== recorded;
}

// ---------------------------------------------------------------------------
// sha256 — content hashing for canonicalHashes
// ---------------------------------------------------------------------------

/**
 * Compute the sha256 hex digest of a string or Buffer.
 * Used to record the content of the files bkit writes.
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
// Managed-version marker — single source of truth for the marker every file bkit
// writes or refreshes carries (JSON files excepted: JSON has no comments).
//
// One marker text, wrapped in the file's comment syntax:
//   html   `<!-- bkit:managed vX.Y.Z — … -->`    markdown, `.mdc`
//   hash   `# <!-- bkit:managed vX.Y.Z — … -->`  shell, `.gitignore`, `.env.example`, TOML
//   slash  `// bkit:managed vX.Y.Z — …`          JS (`.cjs` / `.js` / `.mjs`)
//
// Rendered agents / commands / skills are stamped at render (stampManagedVersion);
// every other file carries the `{{BKIT_MANAGED_MARKER}}` token in its source, which
// applyTokens (bkit-tokens.ts) resolves to the form its comment prefix selects. The
// `bkit check` gate (detectManagedStale, bkit-postinstall.ts) reads the stamp back
// with readManagedVersion.
// ---------------------------------------------------------------------------

/** Comment syntax a managed-version marker is written in. */
export type ManagedMarkerForm = "html" | "hash" | "slash";

// Matches a stamped marker line in any form (anchored at a line start) including its
// trailing newline, so re-stamping replaces rather than appends (idempotent). Inline
// prose that quotes the marker never starts a line with it, so it never matches.
export const MANAGED_MARKER_LINE_RE = /^(?:<!-- |# <!-- |\/\/ )bkit:managed v[^\n]*\n?/m;
// Extracts the stamped version. `\S+` stops at the space before the em-dash.
export const MANAGED_MARKER_VERSION_RE = /bkit:managed v(\S+)/;

/** Build the managed-version marker for a given version, in the given comment syntax. */
export function managedVersionMarker(version: string, form: ManagedMarkerForm = "html"): string {
  const text = `bkit:managed v${version} — do NOT edit; run \`bkit upgrade\` to refresh`;
  if (form === "slash") return `// ${text}`;
  return form === "hash" ? `# <!-- ${text} -->` : `<!-- ${text} -->`;
}

/** Version of the first full-line managed-version marker in `content`, or null when none. */
export function readManagedVersion(content: string): string | null {
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
export function stampManagedVersion(content: string, version: string): string {
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
