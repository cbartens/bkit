// shared/protected-paths.ts — the table of bkit-managed IDE mirror directories, used by the
// compliance grader (`commands/comply.ts`).
//
// RULES:
//   - This file is the ONE source of truth for mirror path definitions.
//   - The gate-config list (quality-gate config basenames) lives only in
//     `.bkit/core/hooks/gateguard-engine.js`, which every host's `bkit-gateguard` hook inlines.
//   - Never import install-tier logic from here (keeps grader crash-isolated from
//     the consumer-mutating install path — see DE-34).

// ---------------------------------------------------------------------------
// Mirror-path patterns (bkit-managed IDE mirrors)
// ---------------------------------------------------------------------------

/**
 * Glob prefixes for IDE mirror directories.  Any path whose POSIX representation
 * starts with one of these strings is a bkit-managed mirror that must NOT be
 * hand-edited (edits belong in the canonical `.bkit/` source and are regenerated
 * by `bkit install` / `bkit upgrade`).
 *
 * The compliance grader's `no-mirror-edit` rule checks every path in
 * `git diff parentSha..HEAD` against this list.
 */
export const MIRROR_PATH_PREFIXES: readonly string[] = [
  ".claude/agents/",
  ".claude/commands/",
  ".cursor/agents/",
  ".cursor/commands/",
  ".opencode/agents/",
  ".opencode/commands/",
];

/**
 * Returns true if the given POSIX file path is inside a bkit-managed mirror
 * directory and should not be hand-edited.
 */
export function isMirrorPath(posixPath: string): boolean {
  return MIRROR_PATH_PREFIXES.some((prefix) => posixPath.startsWith(prefix));
}
