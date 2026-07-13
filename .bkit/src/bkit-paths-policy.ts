// bkit-paths-policy.ts — single protected-path table shared by the compliance
// grader (`bkit-comply.ts`) and the committed generated hook
// (`.claude/hooks/gate-paths.generated.cjs`).
//
// RULES:
//   - This file is the ONE source of truth for protected path definitions.
//   - The `.cjs` is generated from this table and committed; a drift test
//     (`bkit-paths-policy.test.ts`) fails if the committed file diverges.
//   - Install stays a byte-equal Tier-1 copy of the `.cjs` — NOT install-time
//     codegen; the generation step is a manual bkit-dev tool
//     (`generateGatePathsCjs()`).
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

// ---------------------------------------------------------------------------
// Gate-config basename patterns (quality-gate configs)
// ---------------------------------------------------------------------------

/**
 * Basename patterns for quality-gate configs (lint / format / types / test / slop).
 * Mirrors `GATE_CONFIG_PATTERNS` in `gateguard.cjs` — kept in sync via the
 * generated `.cjs` drift test.  Editing these configs to silence a gate is the
 * "weaken-the-gate" anti-pattern; prefer targeted per-file opt-outs.
 */
export const GATE_CONFIG_PATTERNS: readonly RegExp[] = [
  /^tsconfig(\..+)?\.json$/,
  /^vitest\.config\.[mc]?[jt]s$/,
  /^vite\.config\.[mc]?[jt]s$/,
  /^eslint\.config\.[mc]?[jt]s$/,
  /^\.eslintrc(\.(json|js|cjs|ya?ml))?$/,
  /^\.prettierrc(\.(json|js|cjs|mjs|ya?ml|toml))?$/,
  /^prettier\.config\.[mc]?js$/,
  /^\.prettierignore$/,
  /^biome\.jsonc?$/,
  /^\.vale\.ini$/,
  /^slop-scan\.config\.json$/,
  /^\.lintstagedrc(\.(json|js|cjs|mjs|ya?ml))?$/,
  /^lint-staged\.config\.[mc]?js$/,
];

/** Returns true if the file basename matches any gate-config pattern. */
export function isGateConfig(posixPath: string): boolean {
  const base = posixPath.split("/").pop() ?? posixPath;
  return GATE_CONFIG_PATTERNS.some((re) => re.test(base));
}

// ---------------------------------------------------------------------------
// Code generator — emits the committed `.cjs` from this table.
// Run manually by a bkit developer:  `ts-node .bkit/src/bkit-paths-policy.ts`
// The output must be committed to `.claude/hooks/gate-paths.generated.cjs`.
// ---------------------------------------------------------------------------

/**
 * Generate the content of `.claude/hooks/gate-paths.generated.cjs`.
 * This is the single committed snapshot derived from the tables above.
 */
export function generateGatePathsCjs(): string {
  const mirrorLines = MIRROR_PATH_PREFIXES.map((p) => `  ${JSON.stringify(p)},`).join("\n");
  const gateLines = GATE_CONFIG_PATTERNS.map((re) => `  ${re.toString()},`).join("\n");

  return `// gate-paths.generated.cjs — AUTO-GENERATED from .bkit/src/bkit-paths-policy.ts
// DO NOT EDIT BY HAND — regenerate via \`generateGatePathsCjs()\` then commit.
// Drift is detected by bkit-paths-policy.test.ts (Vitest).
"use strict";

/** Prefixes for bkit-managed IDE mirror directories. */
const MIRROR_PATH_PREFIXES = [
${mirrorLines}
];

/** Returns true if the POSIX path is inside a bkit-managed mirror directory. */
function isMirrorPath(posixPath) {
  return MIRROR_PATH_PREFIXES.some((prefix) => posixPath.startsWith(prefix));
}

/** Basename patterns for quality-gate configs. */
const GATE_CONFIG_PATTERNS = [
${gateLines}
];

/** Returns true if the file basename matches any gate-config pattern. */
function isGateConfig(posixPath) {
  const base = posixPath.split("/").pop() || posixPath;
  return GATE_CONFIG_PATTERNS.some((re) => re.test(base));
}

module.exports = { MIRROR_PATH_PREFIXES, isMirrorPath, GATE_CONFIG_PATTERNS, isGateConfig };
`;
}

// CLI: `node dist/bkit-paths-policy.js` prints the generated content to stdout.
// This file compiles to ESM, so use import.meta.url for main-module detection.
import { fileURLToPath } from "node:url";
import * as fs from "node:fs";
if (process.argv[1]) {
  try {
    if (fs.realpathSync(fileURLToPath(import.meta.url)) === fs.realpathSync(process.argv[1])) {
      process.stdout.write(generateGatePathsCjs());
    }
  } catch (_e) {
    void _e; // realpathSync can fail on non-existent paths — skip silently
  }
}
