// bkit-package-json.ts — Re-point package.json script values bkit once seeded.
//
// bkit no longer seeds the tool scripts (`.bkit/templates.md` lists them), but an
// existing consumer may still carry a value an older bkit wrote. A value that
// byte-matches a known prior bkit default is provably bkit's own, so it is
// re-pointed at the current one. Anything else is the consumer's and stays.

import * as fs from "node:fs";
import * as path from "node:path";
import {
  LINT_PROSE_SCRIPT,
  LEGACY_LINT_PROSE_SCRIPTS,
  LEGACY_SLOP_DELTA_SCRIPTS,
  SLOP_DELTA_SCRIPT,
} from "./bkit-manifest.js";

/** Script name → [current value, prior bkit defaults it replaces]. */
const LEGACY_SCRIPT_REPOINTS: Readonly<Record<string, readonly [string, readonly string[]]>> = {
  // A superseded lint:prose silently self-disables in worktrees and fresh checkouts.
  "lint:prose": [LINT_PROSE_SCRIPT, LEGACY_LINT_PROSE_SCRIPTS],
  // The retired `.bkit/scripts/bkit-slop-delta.sh` is gone; its callers move to `bkit ci slop`.
  "slop:delta": [SLOP_DELTA_SCRIPT, LEGACY_SLOP_DELTA_SCRIPTS],
};

/**
 * Re-point superseded bkit script values (`lint:prose`, `slop:delta`) at the current
 * ones. Install (runCoreModule) and upgrade (renderManagedOutputs) both run it, since
 * they are separate engines and `bkit upgrade --latest` is the documented consumer path.
 *
 * REPLACE-ONLY — never creates a key.
 *
 * Returns the re-pointed script names (empty when nothing matched). Dry-run reports
 * without writing.
 */
export function repointLegacyScripts(cwd: string, dryRun: boolean): string[] {
  const pkgPath = path.join(cwd, "package.json");
  if (!fs.existsSync(pkgPath)) return [];
  const raw = fs.readFileSync(pkgPath, "utf-8");
  // Parse failure is a REPORTED state, not a swallowed one: install and upgrade must
  // not abort half-finished over an unparseable consumer file (detectMalformedPackageJson
  // is the surface that judges it), but a silent bail would leave the consumer
  // wondering why a superseded script stayed.
  let pkg: Record<string, unknown> | null = null;
  let parseError: string | null = null;
  try {
    pkg = JSON.parse(raw) as Record<string, unknown>;
  } catch (err) {
    parseError = (err as Error).message;
  }
  if (parseError !== null || pkg === null) {
    console.warn(
      `[bkit] script re-point skipped — package.json is not parseable JSON: ${parseError}`,
    );
    return [];
  }
  const scripts = pkg.scripts as Record<string, string> | undefined;
  if (!scripts) return [];

  const repointed: string[] = [];
  for (const [name, [current, legacy]] of Object.entries(LEGACY_SCRIPT_REPOINTS)) {
    if (!Object.prototype.hasOwnProperty.call(scripts, name)) continue;
    if (!legacy.includes(scripts[name])) continue;
    scripts[name] = current;
    repointed.push(name);
  }

  if (repointed.length > 0 && !dryRun) {
    // Preserve indent style and trailing newline (mirrors ensurePackageJsonScripts).
    const indentMatch = raw.match(/\n([ \t]+)"/);
    const indent = indentMatch ? indentMatch[1] : "  ";
    fs.writeFileSync(
      pkgPath,
      JSON.stringify(pkg, null, indent) + (raw.endsWith("\n") ? "\n" : ""),
      "utf-8",
    );
  }
  return repointed;
}
