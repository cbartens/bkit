// shared/protected-paths.ts — single protected-path table shared by the compliance
// grader (`commands/comply.ts`) and the committed generated hook
// (`.claude/hooks/gate-paths.generated.cjs`).
//
// RULES:
//   - This file is the ONE source of truth for protected path definitions.
//   - The `.cjs` is generated from this table and committed; a drift test
//     (`shared/protected-paths.test.ts`) fails if the committed file diverges.
//   - The `.cjs` lives in bkit's own repo only; install never writes it. The
//     generation step is a manual bkit-dev tool (`generateGatePathsCjs()`).
//   - Never import install-tier logic from here (keeps grader crash-isolated from
//     the consumer-mutating install path — see DE-34).
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { isDogfood, TEMPLATE_COPIES_DIR } from "./package-roots.js";
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
export const MIRROR_PATH_PREFIXES = [
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
export function isMirrorPath(posixPath) {
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
export const GATE_CONFIG_PATTERNS = [
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
/**
 * POSIX prefix of the consumer's template copies (`shared/package-roots.ts` TEMPLATE_COPIES_DIR).
 * Those are bkit's reference copies, refreshed on every upgrade, not the repo's gate config.
 */
export const TEMPLATE_COPIES_PREFIX = TEMPLATE_COPIES_DIR.split(path.sep).join("/") + "/";
/**
 * Returns true if the file basename matches any gate-config pattern. In a consumer repo a
 * path under `.bkit/templates/` never is one; in bkit's own repo (`dogfood`) that folder is
 * the template source, so it stays guarded.
 */
export function isGateConfig(posixPath, dogfood = isDogfood()) {
    const inTemplateCopies = posixPath.startsWith(TEMPLATE_COPIES_PREFIX) ||
        posixPath.includes("/" + TEMPLATE_COPIES_PREFIX);
    if (inTemplateCopies && !dogfood)
        return false;
    const base = posixPath.split("/").pop() ?? posixPath;
    return GATE_CONFIG_PATTERNS.some((re) => re.test(base));
}
// ---------------------------------------------------------------------------
// Code generator — emits the committed `.cjs` from this table.
// Run manually by a bkit developer:  `ts-node .bkit/core/engine/shared/protected-paths.ts`
// The output must be committed to `.claude/hooks/gate-paths.generated.cjs`.
// ---------------------------------------------------------------------------
/**
 * Generate the content of `.claude/hooks/gate-paths.generated.cjs`.
 * This is the single committed snapshot derived from the tables above.
 */
export function generateGatePathsCjs() {
    const mirrorLines = MIRROR_PATH_PREFIXES.map((p) => `  ${JSON.stringify(p)},`).join("\n");
    const gateLines = GATE_CONFIG_PATTERNS.map((re) => `  ${re.toString()},`).join("\n");
    return `// gate-paths.generated.cjs — AUTO-GENERATED from .bkit/core/engine/shared/protected-paths.ts
// DO NOT EDIT BY HAND — regenerate via \`generateGatePathsCjs()\` then commit.
// Drift is detected by .bkit/core/engine/shared/protected-paths.test.ts (Vitest).
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

/** The consumer's template copies — reference copies, not the repo's gate config. */
const TEMPLATE_COPIES_PREFIX = ${JSON.stringify(TEMPLATE_COPIES_PREFIX)};

/**
 * Returns true if the file basename matches any gate-config pattern. Pass \`dogfood\` = true
 * in bkit's own repo, where \`.bkit/templates/\` is the template source and stays guarded.
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
`;
}
// CLI: `node dist/shared/protected-paths.js` prints the generated content to stdout.
// This file compiles to ESM, so use import.meta.url for main-module detection.
if (process.argv[1]) {
    try {
        if (fs.realpathSync(fileURLToPath(import.meta.url)) === fs.realpathSync(process.argv[1])) {
            process.stdout.write(generateGatePathsCjs());
        }
    }
    catch (_e) {
        void _e; // realpathSync can fail on non-existent paths — skip silently
    }
}
