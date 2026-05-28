// bkit-paths.ts — Shared path utilities.
// Lifted from bkit-modules.ts to break the bkit-preflight ↔ bkit-modules import cycle.
// Imports allowed: node:path, node:url, node:fs only.
import * as path from "node:path";
import { fileURLToPath } from "node:url";
// ---------------------------------------------------------------------------
// BKIT_SRC_SUBPATH — the package-relative sub-path that contains bkit's engine
// source files. All three run-contexts derive their suffix check from this
// constant so a single edit flips every resolver.
//
// Value (WS-1 pre-move, OLD form):  ".agents/scripts"
// Value (WS-3 post-move, NEW form): ".bkit/src"
// ---------------------------------------------------------------------------
export const BKIT_SRC_SUBPATH = `.bkit${path.sep}src`;
// ---------------------------------------------------------------------------
// getPkgRoot — resolve the bkit package root at runtime
//
// Three run-contexts (walk-up strategy):
//
//  1. dist/ (compiled, consumers run this):
//     __dirname = <pkgRoot>/dist
//     → pkgRoot = __dirname/..
//
//  2. tsx-from-source (bkit repo dev / integration tests):
//     __dirname = <pkgRoot>/.bkit/src
//     → pkgRoot = __dirname/../..
//
//  3. packed-tarball install (node_modules layout):
//     __dirname = <consumerRoot>/node_modules/@cbartens/bkit/dist
//     → pkgRoot = __dirname/..  (same as arm 1 — dist/ arm covers both)
//
// Arms 1 and 3 are identical (both resolve via the dist/ suffix check); the
// distinction matters only when asserting getPkgRoot() under each context in
// the bkit-paths.test.ts unit test.
// ---------------------------------------------------------------------------
export function getPkgRoot() {
    const scriptDir = path.dirname(fileURLToPath(import.meta.url));
    return scriptDir.endsWith(BKIT_SRC_SUBPATH)
        ? path.resolve(scriptDir, "..", "..")
        : path.resolve(scriptDir, "..");
}
// ---------------------------------------------------------------------------
// getTemplatesRoot — canonical templates root resolver.
// The ONLY place in the codebase that encodes the templates sub-path literal.
//
// WS-1 (pre-move): resolves to <pkgRoot>/.agents/templates
// WS-3 (post-move): resolves to <pkgRoot>/.bkit/templates
// ---------------------------------------------------------------------------
export function getTemplatesRoot() {
    return path.join(getPkgRoot(), ".bkit", "templates");
}
// ---------------------------------------------------------------------------
// isDogfood — true when bkit is running inside its own repo (in-repo install).
// In this case the source tree IS the consumer's .agents/ directory, so any
// payload copy would overwrite the source with itself — a no-op at best and a
// self-overwrite hazard at worst.
// ---------------------------------------------------------------------------
export function isDogfood() {
    return getPkgRoot() === process.cwd();
}
