// bkit-bkitignore.ts — Pure .bkitignore parser + matcher. (P2.T11)
//
// Spec:
//   - Lines starting with `#` are comments (ignored)
//   - Blank lines are ignored
//   - All other lines are glob patterns (via picomatch)
//   - Optional `:dotted.key` suffix: `some/path.json:section.key`
//     - `.` is the key delimiter; `\.` is a literal dot escape
//     - Per-key matching is opt-in: requires BKIT_BKITIGNORE_PER_KEY=1 env var
//     - When per-key is off, the `:dotted.key` suffix is stripped and the file-level
//       match is used instead (per-file always on)
//   - Glob library: picomatch (no shell-out, no regex injection)
//   - Security: user input is treated as untrusted; picomatch is pure-regex
//
// Usage:
//   const rules = parseBkitIgnore(content);
//   const ignored = isFileIgnored("some/path.json", rules);
//   const keyIgnored = isKeyIgnored("some/path.json", "section.key", rules);

import picomatch from "picomatch";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BkitIgnoreRule {
  /** Raw line from .bkitignore (without leading/trailing whitespace). */
  raw: string;
  /** Glob pattern (path part, without :key suffix). */
  glob: string;
  /**
   * Optional dotted-key path suffix (parsed from `:key.path` suffix).
   * Present only when the line has a `:` suffix and per-key mode is enabled.
   * Key parts split on `.` (unescaped); `\.` → literal `.`.
   */
  keyPath: string[] | null;
}

// ---------------------------------------------------------------------------
// parseBkitIgnore — pure parser
// ---------------------------------------------------------------------------

/**
 * Parse the content of a `.bkitignore` file into an array of rules.
 * Empty lines and `#` comment lines are ignored.
 *
 * Per-key parsing (`:dotted.key` suffix) is always structurally parsed,
 * but the keyPath field is only populated when `perKeyEnabled` is true.
 * This allows callers to check feature availability without re-parsing.
 *
 * `perKeyEnabled`: if true, parse `:dotted.key` suffix into `keyPath`.
 *   Defaults to `false` — always override from BKIT_BKITIGNORE_PER_KEY env.
 */
export function parseBkitIgnore(content: string, perKeyEnabled = false): BkitIgnoreRule[] {
  const rules: BkitIgnoreRule[] = [];

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();

    // Skip comments and blank lines
    if (!line || line.startsWith("#")) continue;

    // Detect optional `:dotted.key` suffix.
    // The colon before a key path must not be a drive letter (e.g. `C:`) — we
    // only consider a colon that is preceded by a non-empty glob and followed by
    // at least one character that is valid in a dotted key (letter, digit, _, .).
    const colonIdx = findKeySufixColon(line);

    let glob: string;
    let keyPath: string[] | null = null;

    if (colonIdx !== -1) {
      glob = line.slice(0, colonIdx);
      const rawKey = line.slice(colonIdx + 1);
      if (perKeyEnabled && rawKey) {
        keyPath = parseDottedKey(rawKey);
      }
    } else {
      glob = line;
    }

    if (!glob) continue; // empty glob after stripping key suffix → skip

    rules.push({ raw: line, glob, keyPath });
  }

  return rules;
}

/**
 * Find the index of the `:` that separates a glob from a dotted-key suffix.
 * Returns -1 if no such colon exists.
 *
 * Heuristic: the colon must be preceded by at least one non-whitespace char
 * (the glob), and followed by at least one word-char (the key). We exclude
 * colons inside glob special chars like `[...]` and `{...}`.
 */
function findKeySufixColon(line: string): number {
  let inBracket = 0;
  let inBrace = 0;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "[") inBracket++;
    else if (ch === "]") inBracket = Math.max(0, inBracket - 1);
    else if (ch === "{") inBrace++;
    else if (ch === "}") inBrace = Math.max(0, inBrace - 1);
    else if (ch === ":" && inBracket === 0 && inBrace === 0) {
      // Must have a non-empty glob before the colon
      if (i === 0) continue;
      // Must have at least one valid key char after the colon
      const after = line[i + 1];
      if (!after || !/[\w.]/.test(after)) continue;
      return i;
    }
  }
  return -1;
}

/**
 * Parse a dotted-key string into a string array.
 * Splits on unescaped `.`; `\.` → literal `.`.
 *
 * Examples:
 *   "hooks.Stop"     → ["hooks", "Stop"]
 *   "a\.b.c"         → ["a.b", "c"]
 *   "singleKey"      → ["singleKey"]
 */
export function parseDottedKey(raw: string): string[] {
  const parts: string[] = [];
  let current = "";
  let i = 0;

  while (i < raw.length) {
    const ch = raw[i];
    if (ch === "\\" && raw[i + 1] === ".") {
      current += ".";
      i += 2;
    } else if (ch === ".") {
      parts.push(current);
      current = "";
      i++;
    } else {
      current += ch;
      i++;
    }
  }

  if (current) parts.push(current);
  return parts.filter((p) => p.length > 0);
}

// ---------------------------------------------------------------------------
// isFileIgnored — pure matcher
// ---------------------------------------------------------------------------

/**
 * Check whether a file path matches any rule in the .bkitignore rules list.
 * Returns true if any glob pattern matches the file path.
 *
 * `filePath`: consumer-relative path (e.g. ".claude/settings.json")
 * `rules`: parsed rules from parseBkitIgnore()
 */
export function isFileIgnored(filePath: string, rules: BkitIgnoreRule[]): boolean {
  for (const rule of rules) {
    if (picomatch(rule.glob)(filePath)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// isKeyIgnored — per-key matcher
// ---------------------------------------------------------------------------

/**
 * Check whether a specific JSON key path in a file is ignored.
 * Returns true if any rule matches both:
 *   1. The file path (via glob), AND
 *   2. The key path (via exact array match)
 *
 * Per-key matching requires `BKIT_BKITIGNORE_PER_KEY=1` env var — this
 * function assumes the caller has already gated the call appropriately.
 *
 * `filePath`: consumer-relative path (e.g. ".claude/settings.json")
 * `keyPath`: dotted-key array (e.g. ["hooks", "Stop"])
 * `rules`: parsed rules from parseBkitIgnore() WITH perKeyEnabled=true
 */
export function isKeyIgnored(
  filePath: string,
  keyPath: string[],
  rules: BkitIgnoreRule[],
): boolean {
  for (const rule of rules) {
    if (!rule.keyPath) continue; // file-level rule only — skip for per-key check
    if (!picomatch(rule.glob)(filePath)) continue; // file doesn't match — skip
    // Check key path match (exact array element equality)
    if (keyPathMatches(rule.keyPath, keyPath)) return true;
  }
  return false;
}

/**
 * Check whether two key path arrays are equal.
 * Exact match: same length and each element equal.
 */
function keyPathMatches(ruleKey: string[], fileKey: string[]): boolean {
  if (ruleKey.length !== fileKey.length) return false;
  return ruleKey.every((part, i) => part === fileKey[i]);
}

// ---------------------------------------------------------------------------
// readBkitIgnoreFile — fs reader (used by integration test)
// ---------------------------------------------------------------------------

import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Read and parse a `.bkitignore` file from the given consumer root.
 * Returns an empty array if the file doesn't exist.
 *
 * Respects `BKIT_BKITIGNORE_PER_KEY=1` env var for per-key parsing.
 */
export function readBkitIgnoreFile(cwd: string): BkitIgnoreRule[] {
  const bkitignorePath = path.join(cwd, ".bkitignore");
  if (!fs.existsSync(bkitignorePath)) return [];

  const content = fs.readFileSync(bkitignorePath, "utf-8");
  const perKeyEnabled = process.env.BKIT_BKITIGNORE_PER_KEY === "1";
  return parseBkitIgnore(content, perKeyEnabled);
}
