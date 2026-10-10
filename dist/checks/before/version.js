// checks/before/version.ts — the `.bkit/version` pin against the installing version.
import * as fs from "node:fs";
import * as path from "node:path";
import { readBkitVersion } from "../../install/version-file.js";
// ---------------------------------------------------------------------------
// Advisory detectors
// ---------------------------------------------------------------------------
export function detectBkitVersionMajorDowngrade(cwd, installingVersion) {
    const onDisk = readBkitVersion(path.join(cwd, ".bkit", "version"))?.pinnedVersion ?? "";
    if (!onDisk)
        return null; // absent / unparseable / no pin — guard against parseInt("") = NaN
    const onDiskMajor = parseInt(onDisk.split(".")[0] ?? "0", 10);
    const installingMajor = parseInt(installingVersion.split(".")[0] ?? "0", 10);
    if (Number.isNaN(onDiskMajor) || Number.isNaN(installingMajor))
        return null; // malformed version strings — no false advisory
    if (onDiskMajor <= installingMajor)
        return null;
    return {
        id: "bkit-version-major-downgrade",
        severity: "advisory",
        detect: `On-disk .bkit/version major (${onDiskMajor}) is greater than the installing version major (${installingMajor}). This is a major-version downgrade.`,
        action: `If this is intentional, proceed. Otherwise, check your @cbartens/bkit version pin in package.json and ensure you're installing the intended version. Current on-disk: ${onDisk}, installing: ${installingVersion}.`,
    };
}
export function detectBkitVersionPinStale(cwd) {
    const installedPkgPath = path.join(cwd, "node_modules", "@cbartens", "bkit", "package.json");
    const versionFile = path.join(cwd, ".bkit", "version");
    if (!fs.existsSync(installedPkgPath))
        return null;
    let installedVersion;
    try {
        const pkg = JSON.parse(fs.readFileSync(installedPkgPath, "utf-8"));
        installedVersion = pkg.version ?? "";
    }
    catch {
        return null;
    }
    const onDiskVersion = readBkitVersion(versionFile)?.pinnedVersion ?? "";
    if (!installedVersion || !onDiskVersion)
        return null;
    // Compare semver: installed > onDisk → pin is stale
    if (!semverGt(installedVersion, onDiskVersion))
        return null;
    return {
        id: "bkit-version-pin-stale",
        severity: "advisory",
        detect: `node_modules/@cbartens/bkit version (${installedVersion}) is newer than .bkit/version (${onDiskVersion}). Consumer ran \`pnpm add -D @cbartens/bkit@${installedVersion}\` but did not re-run the bkit installer.`,
        action: "Run `pnpm bkit upgrade` to resync the .agents payload + version pin across everything you have installed, then commit the result. `pnpm add` does not run the bkit installer — bkit's payload must be re-synced after every `@cbartens/bkit` version bump.",
    };
}
// ---------------------------------------------------------------------------
// Internal semver comparison helper
// ---------------------------------------------------------------------------
/** Returns true if versionA > versionB (basic semver, no pre-release). */
function semverGt(a, b) {
    const pa = a.replace(/^v/, "").split(".").map(Number);
    const pb = b.replace(/^v/, "").split(".").map(Number);
    for (let i = 0; i < 3; i++) {
        const av = pa[i] ?? 0;
        const bv = pb[i] ?? 0;
        if (av > bv)
            return true;
        if (av < bv)
            return false;
    }
    return false;
}
