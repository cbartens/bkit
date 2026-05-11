// bkit-paths.ts — Shared path utilities.
// Lifted from bkit-modules.ts to break the bkit-preflight ↔ bkit-modules import cycle.
// Imports allowed: node:path, node:url, node:fs only.

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// getPkgRoot — resolve the bkit package root at runtime
//
// Strategy: walk up from this script's location.
//   - When running from dist/  : scriptDir = <pkgRoot>/dist → pkgRoot = scriptDir/..
//   - When running from .agents/scripts/ : scriptDir = <pkgRoot>/.agents/scripts → pkgRoot = scriptDir/../..
// ---------------------------------------------------------------------------

export function getPkgRoot(): string {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  return scriptDir.endsWith(`${path.sep}.agents${path.sep}scripts`)
    ? path.resolve(scriptDir, "..", "..")
    : path.resolve(scriptDir, "..");
}
