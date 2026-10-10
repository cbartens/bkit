// shared/package-roots.ts — resolves the bkit package root and the roots under it
// (core, shared, templates) from wherever the engine runs.
// Imports allowed: node:path, node:url, node:fs only.

import * as fs from "node:fs";
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

export function getPkgRoot(): string {
  const engineDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  return engineDir.endsWith(ENGINE_SUBPATH)
    ? path.resolve(engineDir, "..", "..", "..")
    : path.resolve(engineDir, "..");
}

// ---------------------------------------------------------------------------
// The three payload roots. Each folder carries one licence and one install
// behaviour; a file's path inside its folder is where it lands in the consumer
// repo.
//
//   core/       PolyForm. Written and kept current. engine/, workflows/,
//               prompts/, .bkit/, hooks/ and every LICENSE.md are skipped
//               by install; the rest is copied at its folder-relative path.
//   shared/     MIT-0. Written and kept current: bkit's blocks and keys inside
//               files the consumer also edits, plus small whole files.
//   templates/  MIT-0. Copy-and-own only: never applied to the repo, copied raw
//               into the consumer's `.bkit/templates/` by syncTemplateCopies.
// ---------------------------------------------------------------------------

export function getCoreRoot(): string {
  return path.join(getPkgRoot(), ".bkit", "core");
}

export function getSharedRoot(): string {
  return path.join(getPkgRoot(), ".bkit", "shared");
}

// ---------------------------------------------------------------------------
// getTemplatesRoot — the copy-and-own templates root.
//
// The consumer keeps its copies of the template set at the same relative path,
// TEMPLATE_COPIES_DIR (install/template-copies.ts syncTemplateCopies). In
// dogfood the two are the same folder.
// ---------------------------------------------------------------------------

export const TEMPLATE_COPIES_DIR = path.join(".bkit", "templates");

export function getTemplatesRoot(): string {
  return path.join(getPkgRoot(), TEMPLATE_COPIES_DIR);
}

// npm hard-excludes files literally named `.gitignore` and `.npmignore` from
// packed tarballs (by basename, anywhere in the tree), regardless of the `files`
// field. Those — and ONLY those — are stored without the leading dot in
// `.bkit/shared/` and remapped to their dotted dest at install/upgrade time.
//
// Any OTHER dotfile (`.gitattributes`, `.prettierignore`, `.mcp.json`, …) packs
// fine with its dot, so it is stored dotted in the payload tree and needs NO
// remap. Do not add such names here — store the file with its real name.
//
// Source basename → dest basename. The single source of truth for the dotfile
// remap: remapTemplateDest (install/template-copies.ts) reads it forward,
// templateRelPath below reads it backward.
export const NPM_STRIP_REMAP: Readonly<Record<string, string>> = {
  gitignore: ".gitignore",
  npmignore: ".npmignore",
};

/** The payload path, relative to its root, a consumer-relative dest is written from. */
export function templateRelPath(dest: string): string {
  const base = path.basename(dest);
  const src = Object.keys(NPM_STRIP_REMAP).find((k) => NPM_STRIP_REMAP[k] === base);
  if (src === undefined) return dest;
  const dir = path.dirname(dest);
  return dir === "." ? src : path.join(dir, src);
}

/**
 * The absolute source path backing a consumer-relative dest, or `null` when no
 * payload root carries it. Checks `shared/` then `core/`, applying the dotfile
 * remap. Root-level `LICENSE.md` files are never install sources.
 */
export function findTemplateSource(relPath: string): string | null {
  if (path.basename(relPath) === "LICENSE.md") return null;
  const rel = templateRelPath(relPath);
  for (const root of [getSharedRoot(), getCoreRoot()]) {
    const p = path.join(root, rel);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Mirror-source roots. `core/workflows` and `core/prompts` are the canonical
// SOURCE for the `.claude/*` and `.cursor/*` mirrors. They live only in the bkit
// package — never copied into a consumer — so the install engine resolves them
// package-relative (via getPkgRoot()), not from the consumer's cwd. In dogfood
// (getPkgRoot() === cwd) these resolve to the in-repo source, so mirror
// regeneration works unchanged.
// ---------------------------------------------------------------------------

export function getWorkflowsRoot(): string {
  return path.join(getCoreRoot(), "workflows");
}

export function getPromptsRoot(): string {
  return path.join(getCoreRoot(), "prompts");
}

// `core/.bkit/` holds bkit-authoring reference docs (e.g. prompts.md's Cursor
// model-lookup table). This is the runtime read root (package-side). The
// reference docs are ALSO force-overwritten into the consumer's own `.bkit/` on
// install — a readable mirror — by runBkitDocs (install/modules/core.ts).
// Shared hook code spliced into each host's hook template at render time
// (render/parts.ts). Package-only: never copied into a consumer.
export function getHooksRoot(): string {
  return path.join(getPkgRoot(), ".bkit", "core", "hooks");
}

export function getBkitDocsRoot(): string {
  return path.join(getCoreRoot(), ".bkit");
}

// ---------------------------------------------------------------------------
// isDogfood — true when bkit is running inside its own repo (in-repo install).
// In this case the source tree IS the consumer's .agents/ directory, so any
// payload copy would overwrite the source with itself.
// ---------------------------------------------------------------------------

export function isDogfood(): boolean {
  return getPkgRoot() === process.cwd();
}
