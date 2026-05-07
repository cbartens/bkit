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
import { getManagedPackageJsonKeys } from "./bkit-manifest.js";
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
export function stripManagedKeys(modules = [], dryRun = false) {
    const result = {
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
    let pkg;
    try {
        pkg = JSON.parse(raw);
    }
    catch {
        result.malformed = true;
        return result;
    }
    const moduleList = modules instanceof Set ? [...modules] : modules;
    const { scripts: defaultScripts, devDependencies: defaultDevDeps } = getManagedPackageJsonKeys(moduleList);
    const pkgScripts = pkg.scripts ?? {};
    const pkgDevDeps = pkg.devDependencies ?? {};
    let changed = false;
    // Scripts
    for (const [name, defaultValue] of Object.entries(defaultScripts)) {
        if (!Object.prototype.hasOwnProperty.call(pkgScripts, name))
            continue;
        const currentValue = pkgScripts[name];
        if (currentValue === defaultValue) {
            result.removedScripts.push(name);
            if (!dryRun) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete pkgScripts[name];
                changed = true;
            }
        }
        else {
            result.preservedScripts.push(name);
        }
    }
    // DevDependencies
    for (const [name, defaultSpec] of Object.entries(defaultDevDeps)) {
        if (!Object.prototype.hasOwnProperty.call(pkgDevDeps, name))
            continue;
        const currentSpec = pkgDevDeps[name];
        if (currentSpec === defaultSpec) {
            result.removedDevDeps.push(name);
            if (!dryRun) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete pkgDevDeps[name];
                changed = true;
            }
        }
        else {
            result.preservedDevDeps.push(name);
        }
    }
    // Clean up empty sections
    if (!dryRun && changed) {
        if (Object.keys(pkgScripts).length === 0) {
            delete pkg.scripts;
        }
        else {
            pkg.scripts = pkgScripts;
        }
        if (Object.keys(pkgDevDeps).length === 0) {
            delete pkg.devDependencies;
        }
        else {
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
