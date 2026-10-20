import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { readInstallingVersion } from "../shared/package-json.js";
import { managedVersionMarker } from "./version-file.js";
import { gitEnv, resolveRepoSlug } from "../ledgers/telemetry.js";
// Resolve DEFAULT_BRANCH, the production branch: refs/remotes/origin/HEAD, else "main".
// `dev` is bkit's integration branch, never production, so a remote whose default is `dev`
// also gets "main" — and renders the same bytes as a checkout with no origin/HEAD.
function resolveDefaultBranch(cwd) {
    const res = spawnSync("git", ["symbolic-ref", "refs/remotes/origin/HEAD"], {
        cwd,
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
        env: gitEnv(),
    });
    // stdout is like "refs/remotes/origin/main"; empty when not a git repo or no remote HEAD.
    const branch = res.status === 0 ? res.stdout.trim().replace(/^refs\/remotes\/origin\//, "") : "";
    return branch === "" || branch === "dev" ? "main" : branch;
}
// Read and parse package.json from cwd. Throws if absent.
function readPackageJson(cwd) {
    const pkgPath = path.join(cwd, "package.json");
    if (!fs.existsSync(pkgPath)) {
        throw new Error(`[bkit-placeholders] package.json not found at ${pkgPath}`);
    }
    const raw = fs.readFileSync(pkgPath, "utf-8");
    return JSON.parse(raw);
}
// Resolve all tokens in a single read-once pass at install-start.
// Hard-fails (throws) if package.json.name is absent.
export async function resolveTokens(cwd) {
    const pkg = readPackageJson(cwd);
    const name = pkg["name"];
    if (typeof name !== "string" || name.trim() === "") {
        throw new Error(`[bkit-placeholders] package.json.name is required but missing or empty in ${cwd}`);
    }
    return {
        DEFAULT_BRANCH: resolveDefaultBranch(cwd),
        PROJECT_NAME: name.trim(),
        REPO_SLUG: resolveRepoSlug(cwd),
        BKIT_VERSION: readInstallingVersion(),
    };
}
// Substitute {{TOKEN}} placeholders in content string.
// Substitution happens at write-time (caller's responsibility), not at template-read time.
// Uses function-form replacers to prevent $& / $1 / $$ substitution patterns from leaking
// through when token values contain dollar signs.
export function applyTokens(content, tokens) {
    const defaultBranch = tokens.DEFAULT_BRANCH;
    const projectName = tokens.PROJECT_NAME;
    const repoSlug = tokens.REPO_SLUG;
    let out = content
        .replace(/\{\{DEFAULT_BRANCH\}\}/g, () => defaultBranch)
        .replace(/\{\{PROJECT_NAME\}\}/g, () => projectName)
        .replace(/\{\{REPO_SLUG\}\}/g, () => repoSlug);
    // {{BKIT_MANAGED_MARKER}} → the managed-version marker. A token after `// ` at a line
    // start resolves to the slash form (JS); every other occurrence to the HTML comment,
    // so `# {{BKIT_MANAGED_MARKER}}` yields the hash form. The version is read from the
    // package only when the token is present and the TokenMap omits BKIT_VERSION.
    if (out.includes("{{BKIT_MANAGED_MARKER}}")) {
        const version = tokens.BKIT_VERSION ?? readInstallingVersion();
        out = out
            .replace(/^\/\/ \{\{BKIT_MANAGED_MARKER\}\}/gm, () => managedVersionMarker(version, "slash"))
            .replace(/\{\{BKIT_MANAGED_MARKER\}\}/g, () => managedVersionMarker(version, "html"));
    }
    return out;
}
