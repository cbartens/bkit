import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
// Extract the major version from a node version string.
// Accepts: "22", "22.1.0", "v22", "v22.1.0", ">=20", "^18.0.0", "~16"
// For .nvmrc content, pass the full file contents — blank/comment lines are skipped.
function extractNodeMajor(raw) {
    // Scan line-by-line: skip blank lines and lines starting with '#'.
    // Take the first non-empty/non-comment line as the version source.
    const lines = raw.split("\n");
    let versionLine;
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === "" || trimmed.startsWith("#"))
            continue;
        versionLine = trimmed;
        break;
    }
    if (!versionLine)
        return null;
    const stripped = versionLine.replace(/^[v=^~<>!]+/, "");
    const m = stripped.match(/^(\d+)/);
    return m ? (m[1] ?? null) : null;
}
// Resolve NODE_VERSION: .nvmrc → package.json.engines.node → "22"
function resolveNodeVersion(cwd, pkg) {
    const nvmrcPath = path.join(cwd, ".nvmrc");
    if (fs.existsSync(nvmrcPath)) {
        const raw = fs.readFileSync(nvmrcPath, "utf-8").trim();
        const major = extractNodeMajor(raw);
        if (major)
            return major;
    }
    const engines = pkg["engines"];
    if (engines?.["node"]) {
        const major = extractNodeMajor(engines["node"]);
        if (major)
            return major;
    }
    return "22";
}
// Strip git hook environment variables so child git processes use the repo at
// `cwd` rather than whatever GIT_DIR/GIT_WORK_TREE the hook runner injected.
function gitEnv() {
    const env = { ...process.env };
    delete env["GIT_DIR"];
    delete env["GIT_WORK_TREE"];
    delete env["GIT_INDEX_FILE"];
    delete env["GIT_OBJECT_DIRECTORY"];
    return env;
}
// Resolve DEFAULT_BRANCH: git symbolic-ref refs/remotes/origin/HEAD → "main"
function resolveDefaultBranch(cwd) {
    try {
        const raw = execSync("git symbolic-ref refs/remotes/origin/HEAD", {
            cwd,
            encoding: "utf-8",
            stdio: ["ignore", "pipe", "ignore"],
            env: gitEnv(),
        }).trim();
        // raw is like "refs/remotes/origin/main"
        const parts = raw.split("/");
        const branch = parts[parts.length - 1];
        if (branch)
            return branch;
    }
    catch {
        // not a git repo or no remote HEAD configured — fall back
    }
    return "main";
}
// Resolve REPO_SLUG: parse `owner/repo` from `git remote get-url origin`.
// Handles HTTPS (`https://github.com/owner/repo.git`), SSH scp-form
// (`git@github.com:owner/repo.git`), and ssh:// URLs. Returns "" on failure —
// the Renovate module is origin-gated, so an empty slug only occurs before the
// repo has a remote, and self-heals on the next `--renovate` run.
function resolveRepoSlug(cwd) {
    try {
        const url = execSync("git remote get-url origin", {
            cwd,
            encoding: "utf-8",
            stdio: ["ignore", "pipe", "ignore"],
            env: gitEnv(),
        }).trim();
        // Strip a trailing `.git`, then capture the final `owner/repo` segment after
        // the last `/` or `:` (covers both URL and scp-style remotes).
        const m = url.replace(/\.git$/, "").match(/[/:]([^/:]+\/[^/:]+)$/);
        if (m?.[1])
            return m[1];
    }
    catch {
        // no remote / not a git repo — fall back to empty
    }
    return "";
}
// Read and parse package.json from cwd. Throws if absent.
function readPackageJson(cwd) {
    const pkgPath = path.join(cwd, "package.json");
    if (!fs.existsSync(pkgPath)) {
        throw new Error(`[bkit-tokens] package.json not found at ${pkgPath}`);
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
        throw new Error(`[bkit-tokens] package.json.name is required but missing or empty in ${cwd}`);
    }
    return {
        NODE_VERSION: resolveNodeVersion(cwd, pkg),
        DEFAULT_BRANCH: resolveDefaultBranch(cwd),
        PROJECT_NAME: name.trim(),
        REPO_SLUG: resolveRepoSlug(cwd),
    };
}
// Substitute {{TOKEN}} placeholders in content string.
// Substitution happens at write-time (caller's responsibility), not at template-read time.
// Uses function-form replacers to prevent $& / $1 / $$ substitution patterns from leaking
// through when token values contain dollar signs.
export function applyTokens(content, tokens) {
    const nodeVersion = tokens.NODE_VERSION;
    const defaultBranch = tokens.DEFAULT_BRANCH;
    const projectName = tokens.PROJECT_NAME;
    const repoSlug = tokens.REPO_SLUG;
    return content
        .replace(/\{\{NODE_VERSION\}\}/g, () => nodeVersion)
        .replace(/\{\{DEFAULT_BRANCH\}\}/g, () => defaultBranch)
        .replace(/\{\{PROJECT_NAME\}\}/g, () => projectName)
        .replace(/\{\{REPO_SLUG\}\}/g, () => repoSlug);
}
