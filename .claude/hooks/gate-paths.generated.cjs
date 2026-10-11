// gate-paths.generated.cjs — AUTO-GENERATED from .bkit/core/engine/shared/protected-paths.ts
// DO NOT EDIT BY HAND — regenerate via `generateGatePathsCjs()` then commit.
// Drift is detected by .bkit/core/engine/shared/protected-paths.test.ts (Vitest).
"use strict";

/** Prefixes for bkit-managed IDE mirror directories. */
const MIRROR_PATH_PREFIXES = [
  ".claude/agents/",
  ".claude/commands/",
  ".cursor/agents/",
  ".cursor/commands/",
  ".opencode/agents/",
  ".opencode/commands/",
];

/** Returns true if the POSIX path is inside a bkit-managed mirror directory. */
function isMirrorPath(posixPath) {
  return MIRROR_PATH_PREFIXES.some((prefix) => posixPath.startsWith(prefix));
}

/** Basename patterns for quality-gate configs. */
const GATE_CONFIG_PATTERNS = [
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

/** The consumer's template copies — reference copies, not the repo's gate config. */
const TEMPLATE_COPIES_PREFIX = ".bkit/templates/";

/**
 * Returns true if the file basename matches any gate-config pattern. Pass `dogfood` = true
 * in bkit's own repo, where `.bkit/templates/` is the template source and stays guarded.
 */
function isGateConfig(posixPath, dogfood) {
  const inTemplateCopies =
    posixPath.startsWith(TEMPLATE_COPIES_PREFIX) || posixPath.includes("/" + TEMPLATE_COPIES_PREFIX);
  if (inTemplateCopies && !dogfood) return false;
  const base = posixPath.split("/").pop() || posixPath;
  return GATE_CONFIG_PATTERNS.some((re) => re.test(base));
}

module.exports = {
  MIRROR_PATH_PREFIXES,
  isMirrorPath,
  GATE_CONFIG_PATTERNS,
  TEMPLATE_COPIES_PREFIX,
  isGateConfig,
};
