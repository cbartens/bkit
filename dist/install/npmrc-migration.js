// install/npmrc-migration.ts — one-time migration for consumers who installed
// `@cbartens/bkit` from GitHub Packages.
//
// bkit is now published to the public npm registry (`https://registry.npmjs.org`),
// so a consumer `.npmrc` no longer needs the `@cbartens:registry=` mapping to
// `https://npm.pkg.github.com`. Removing the mapping (and any comment block
// describing it) restores default npmjs resolution and drops the install-time auth
// ceremony. A leftover `//npm.pkg.github.com/:_authToken=` line is a stale secret:
// bkit flags it for the user to delete by hand rather than editing a credential.
import * as fs from "node:fs";
import * as path from "node:path";
/** A `.npmrc` line mapping the @cbartens scope to the GitHub Packages registry. */
const GH_PACKAGES_REGISTRY_LINE = /^\s*@cbartens:registry\s*=/;
/** A project-`.npmrc` GitHub Packages auth-token line (a stale secret). */
const GH_PACKAGES_AUTHTOKEN_LINE = /\/\/npm\.pkg\.github\.com\/:_authToken=/;
/**
 * Remove the obsolete `@cbartens:registry=https://npm.pkg.github.com` mapping from
 * the consumer's root `.npmrc`, together with any comment block immediately above it
 * (the lines describing that mapping). Idempotent: an already-clean `.npmrc` (or an
 * absent one) is untouched.
 *
 * Never removes a `//npm.pkg.github.com/:_authToken=` line — a live credential is the
 * user's to delete. Its presence is reported via `hasAuthToken` so the caller can
 * surface an advisory. With `dryRun` the plan is computed without writing.
 */
export function migrateNpmrc(cwd, dryRun) {
    const npmrcPath = path.join(cwd, ".npmrc");
    const result = {
        changed: false,
        removedRegistry: false,
        hasAuthToken: false,
    };
    if (!fs.existsSync(npmrcPath))
        return result;
    const content = fs.readFileSync(npmrcPath, "utf-8");
    const kept = [];
    for (const line of content.split("\n")) {
        if (GH_PACKAGES_REGISTRY_LINE.test(line)) {
            result.removedRegistry = true;
            // Drop the comment block immediately above the mapping, if any: walk back over
            // contiguous comment lines already kept.
            while (kept.length > 0 && /^\s*#/.test(kept[kept.length - 1]))
                kept.pop();
            continue;
        }
        kept.push(line);
    }
    if (result.removedRegistry) {
        const next = kept.join("\n");
        result.hasAuthToken = GH_PACKAGES_AUTHTOKEN_LINE.test(next);
        if (next !== content) {
            result.changed = true;
            if (!dryRun)
                fs.writeFileSync(npmrcPath, next, "utf-8");
        }
    }
    else {
        result.hasAuthToken = GH_PACKAGES_AUTHTOKEN_LINE.test(content);
    }
    return result;
}
/** The advisory raised when a stale GitHub Packages auth-token line remains. */
export function npmrcAuthTokenFinding() {
    return {
        id: "npmrc-github-packages-authtoken",
        severity: "advisory",
        detect: ".npmrc still carries a `//npm.pkg.github.com/:_authToken=…` line. `@cbartens/bkit` is now public on the npm registry, so GitHub Packages auth is obsolete.",
        action: 'Delete the `//npm.pkg.github.com/:_authToken=…` line from .npmrc by hand — bkit never edits live secrets. If the token was also written to pnpm\'s user-level config, clear it with `pnpm config delete "//npm.pkg.github.com/:_authToken"`. See `.bkit/install.md` § Migrating from GitHub Packages.',
    };
}
