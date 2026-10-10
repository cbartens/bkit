// shared/package-roots.ts — resolves the bkit package root and the roots under it
// (templates, workflows, prompts, the `.bkit/` docs) from wherever the engine runs.
// Imports allowed: node:path, node:url, node:fs only.
import * as path from "node:path";
import { fileURLToPath } from "node:url";
// ---------------------------------------------------------------------------
// ENGINE_SUBPATH — the package-relative sub-path that contains bkit's engine
// source files. All three run-contexts derive their suffix check from this
// constant so a single edit flips every resolver.
// ---------------------------------------------------------------------------
export const ENGINE_SUBPATH = path.join(".bkit", "core", "engine");
// ---------------------------------------------------------------------------
// getPkgRoot — resolve the bkit package root at runtime
//
// This file sits in the engine's `shared/` folder, so engineDir is its parent.
// Three run-contexts (walk-up strategy):
//
//  1. dist/ (compiled, consumers run this):
//     engineDir = <pkgRoot>/dist
//     → pkgRoot = engineDir/..
//
//  2. tsx-from-source (bkit repo dev / integration tests):
//     engineDir = <pkgRoot>/.bkit/core/engine
//     → pkgRoot = engineDir/../../..
//
//  3. packed-tarball install (node_modules layout):
//     engineDir = <consumerRoot>/node_modules/@cbartens/bkit/dist
//     → pkgRoot = engineDir/..  (same as arm 1 — dist/ arm covers both)
//
// Arms 1 and 3 are identical (both resolve via the dist/ suffix check); the
// distinction matters only when asserting getPkgRoot() under each context in
// the shared/package-roots.test.ts unit test.
// ---------------------------------------------------------------------------
export function getPkgRoot() {
    const engineDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    return engineDir.endsWith(ENGINE_SUBPATH)
        ? path.resolve(engineDir, "..", "..", "..")
        : path.resolve(engineDir, "..");
}
// ---------------------------------------------------------------------------
// getTemplatesRoot — canonical templates root resolver.
// The ONLY place in the codebase that encodes the templates sub-path literal.
// Resolves to <pkgRoot>/.bkit/templates.
//
// The consumer keeps its copies of the template set at the same relative path,
// TEMPLATE_COPIES_DIR (install/modules/index.ts syncTemplateCopies). In dogfood the two are
// the same folder.
// ---------------------------------------------------------------------------
export const TEMPLATE_COPIES_DIR = path.join(".bkit", "templates");
export function getTemplatesRoot() {
    return path.join(getPkgRoot(), TEMPLATE_COPIES_DIR);
}
// npm hard-excludes files literally named `.gitignore` and `.npmignore` from
// packed tarballs (by basename, anywhere in the tree), regardless of the `files`
// field. Those — and ONLY those — are stored without the leading dot in
// `.bkit/templates/` and remapped to their dotted dest at install/upgrade time.
//
// Any OTHER dotfile (`.gitattributes`, `.prettierignore`, `.mcp.json`, …) packs
// fine with its dot, so it is stored dotted in the template tree and needs NO
// remap. Do not add such names here — store the template with its real name.
//
// Template basename → dest basename. The single source of truth for the dotfile
// remap: remapTemplateDest (commands/install/install.ts) reads it forward, templateRelPath
// below reads it backward.
export const NPM_STRIP_REMAP = {
    gitignore: ".gitignore",
    npmignore: ".npmignore",
};
/** The template path, relative to the templates root, a consumer-relative dest is written from. */
export function templateRelPath(dest) {
    const base = path.basename(dest);
    const src = Object.keys(NPM_STRIP_REMAP).find((k) => NPM_STRIP_REMAP[k] === base);
    if (src === undefined)
        return dest;
    const dir = path.dirname(dest);
    return dir === "." ? src : path.join(dir, src);
}
// ---------------------------------------------------------------------------
// Mirror-source roots. `.bkit/workflows` and `.bkit/prompts` are the canonical
// SOURCE for the `.claude/*` and `.cursor/*` mirrors. They live only in the bkit
// package — never copied into a consumer — so the install engine resolves them
// package-relative (via getPkgRoot()), not from the consumer's cwd. In dogfood
// (getPkgRoot() === cwd) these resolve to the in-repo source, so mirror
// regeneration works unchanged.
// ---------------------------------------------------------------------------
export function getWorkflowsRoot() {
    return path.join(getPkgRoot(), ".bkit", "workflows");
}
export function getPromptsRoot() {
    return path.join(getPkgRoot(), ".bkit", "prompts");
}
// `.bkit/` root holds bkit-authoring reference docs + engine data (e.g.
// prompts.md's Cursor model-lookup table) alongside core/engine/, workflows/, prompts/,
// templates/. This is the runtime read root (package-side). The reference docs
// (cloud/IDEs/prompts/trackers/workflows/README.md) are ALSO force-overwritten
// into the consumer's own `.bkit/` on install — a readable mirror — by
// runBkitDocs (install/modules/index.ts); engine data and core/engine/ stay package-only.
export function getBkitDocsRoot() {
    return path.join(getPkgRoot(), ".bkit");
}
// ---------------------------------------------------------------------------
// isDogfood — true when bkit is running inside its own repo (in-repo install).
// In this case the source tree IS the consumer's .agents/ directory, so any
// payload copy would overwrite the source with itself.
// ---------------------------------------------------------------------------
export function isDogfood() {
    return getPkgRoot() === process.cwd();
}
