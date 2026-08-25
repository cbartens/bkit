// bkit-package-json.ts — Strip managed package.json keys during uninstall.
// Key list is DRIVEN FROM the P2.T1 manifest (NOT hand-listed here).
// Consumer-customised values are preserved; only default-value keys are removed.
//
// Semantics:
//   - A managed key is safe to remove only if its current value in package.json
//     exactly matches the bkit-default value declared in the manifest.
//   - If the consumer has a custom value for that key, it is preserved unchanged.
//   - devDependencies entries are only removed if the version spec matches the
//     bkit-default AND the dep is not required by any other non-bkit scripts.
//
// "Consumer value wins" principle (DE-4): we never remove a key whose value
// the consumer has modified from the bkit default.

import * as fs from "node:fs";
import * as path from "node:path";
import {
  getManagedPackageJsonKeys,
  LINT_PROSE_SCRIPT,
  LEGACY_LINT_PROSE_SCRIPTS,
  TYPECHECK_NO_TSCONFIG_SCRIPT,
  type ModuleName,
} from "./bkit-manifest.js";

/**
 * Re-point a superseded bkit `lint:prose` at the current default.
 *
 * Install does this via runLintModule's `ensurePackageJsonScripts` legacyValues
 * map, but install and upgrade are SEPARATE engines: upgrade is a manifest-driven
 * template render that never touches package.json scripts. `bkit upgrade --latest`
 * is the documented consumer path, so without this the corrected script would
 * reach only consumers who happened to re-run `bkit install --tooling`.
 * (Same both-engines requirement as the debug-fetch migration, #334.)
 *
 * REPLACE-ONLY — never creates the key. Upgrade must not force-create a script
 * for a module the consumer never installed.
 *
 * Returns a log line when it acted, else null. Dry-run reports without writing.
 */
export function repointLegacyLintProse(cwd: string, dryRun: boolean): string | null {
  const pkgPath = path.join(cwd, "package.json");
  if (!fs.existsSync(pkgPath)) return null;
  const raw = fs.readFileSync(pkgPath, "utf-8");
  // Parse failure is a REPORTED state, not a swallowed one: upgrade must not
  // abort half-finished over an unparseable consumer file (detectMalformedPackageJson
  // is the surface that judges it), but a silent bail would leave the consumer
  // wondering why the prose gate stayed on the superseded script.
  let pkg: Record<string, unknown> | null = null;
  let parseError: string | null = null;
  try {
    pkg = JSON.parse(raw) as Record<string, unknown>;
  } catch (err) {
    parseError = (err as Error).message;
  }
  if (parseError !== null || pkg === null) {
    console.warn(
      `[bkit] lint:prose re-point skipped — package.json is not parseable JSON: ${parseError}`,
    );
    return null;
  }
  const scripts = pkg.scripts as Record<string, string> | undefined;
  if (!scripts || !Object.prototype.hasOwnProperty.call(scripts, "lint:prose")) return null;
  if (!LEGACY_LINT_PROSE_SCRIPTS.includes(scripts["lint:prose"])) return null;

  if (!dryRun) {
    scripts["lint:prose"] = LINT_PROSE_SCRIPT;
    // Preserve indent style and trailing newline (mirrors ensurePackageJsonScripts).
    const indentMatch = raw.match(/\n([ \t]+)"/);
    const indent = indentMatch ? indentMatch[1] : "  ";
    fs.writeFileSync(
      pkgPath,
      JSON.stringify(pkg, null, indent) + (raw.endsWith("\n") ? "\n" : ""),
      "utf-8",
    );
  }
  return "upgrade: lint:prose re-pointed from a superseded bkit default (prose gate no longer self-disables in worktrees/fresh checkouts)";
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StripResult {
  /** Scripts keys removed (default value, not consumer-customised). */
  removedScripts: string[];
  /** Scripts keys preserved because consumer has a custom value. */
  preservedScripts: string[];
  /** devDependency keys removed (default spec, not consumer-customised). */
  removedDevDeps: string[];
  /** devDependency keys preserved because consumer has a custom value. */
  preservedDevDeps: string[];
  /** True if package.json was not found. */
  missingPkg: boolean;
  /** True if package.json failed to parse. */
  malformed: boolean;
}

// ---------------------------------------------------------------------------
// stripManagedKeys — main entry point
// ---------------------------------------------------------------------------

/**
 * Strip bkit-default package.json scripts and devDependencies keys.
 *
 * Only removes keys whose current value exactly matches the bkit-default
 * declared in the manifest. Consumer-customised values are always preserved.
 *
 * `modules`: which modules' defaults to consult. Defaults to all modules.
 * `dryRun`: if true, computes what would be removed but does not write to disk.
 */
export function stripManagedKeys(
  modules: ModuleName[] | Set<string> = [],
  dryRun = false,
): StripResult {
  const result: StripResult = {
    removedScripts: [],
    preservedScripts: [],
    removedDevDeps: [],
    preservedDevDeps: [],
    missingPkg: false,
    malformed: false,
  };

  const pkgPath = "package.json";
  if (!fs.existsSync(pkgPath)) {
    result.missingPkg = true;
    return result;
  }

  const raw = fs.readFileSync(pkgPath, "utf-8");
  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    result.malformed = true;
    return result;
  }

  const moduleList =
    modules instanceof Set ? ([...modules] as ModuleName[]) : (modules as ModuleName[]);

  const { scripts: defaultScripts, devDependencies: defaultDevDeps } =
    getManagedPackageJsonKeys(moduleList);

  const pkgScripts = (pkg.scripts as Record<string, string> | undefined) ?? {};
  const pkgDevDeps = (pkg.devDependencies as Record<string, string> | undefined) ?? {};

  let changed = false;

  // A superseded bkit default is still bkit's own script, so uninstall must
  // reclaim it. Without this, a consumer who installed before the default
  // changed and never re-ran install would keep an orphaned script after
  // uninstall, because the byte-compare below only knew the CURRENT default.
  //
  // `typecheck` is here for a different reason: it has TWO current defaults, not a
  // superseded one. runLintModule seeds `tsc --noEmit` in a repo with a tsconfig.json
  // and the skip-noop in a repo without, so which value is bkit's own depends on the
  // repo. Matching only the manifest string orphaned the script every time bkit had
  // seeded the noop.
  const legacyScriptValues: Record<string, readonly string[]> = {
    "lint:prose": LEGACY_LINT_PROSE_SCRIPTS,
    typecheck: [TYPECHECK_NO_TSCONFIG_SCRIPT],
  };

  // Scripts
  for (const [name, defaultValue] of Object.entries(defaultScripts)) {
    if (!Object.prototype.hasOwnProperty.call(pkgScripts, name)) continue;
    const currentValue = pkgScripts[name];
    if (currentValue === defaultValue || (legacyScriptValues[name] ?? []).includes(currentValue)) {
      result.removedScripts.push(name);
      if (!dryRun) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete pkgScripts[name];
        changed = true;
      }
    } else {
      result.preservedScripts.push(name);
    }
  }

  // DevDependencies
  for (const [name, defaultSpec] of Object.entries(defaultDevDeps)) {
    if (!Object.prototype.hasOwnProperty.call(pkgDevDeps, name)) continue;
    const currentSpec = pkgDevDeps[name];
    if (currentSpec === defaultSpec) {
      result.removedDevDeps.push(name);
      if (!dryRun) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete pkgDevDeps[name];
        changed = true;
      }
    } else {
      result.preservedDevDeps.push(name);
    }
  }

  // Clean up empty sections
  if (!dryRun && changed) {
    if (Object.keys(pkgScripts).length === 0) {
      delete pkg.scripts;
    } else {
      pkg.scripts = pkgScripts;
    }
    if (Object.keys(pkgDevDeps).length === 0) {
      delete pkg.devDependencies;
    } else {
      pkg.devDependencies = pkgDevDeps;
    }

    // Preserve indent style and trailing newline of original file
    const indentMatch = raw.match(/\n([ \t]+)"/);
    const indent = indentMatch ? indentMatch[1] : "  ";
    const trailingNewline = raw.endsWith("\n") ? "\n" : "";
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, indent) + trailingNewline, "utf-8");
  }

  return result;
}
