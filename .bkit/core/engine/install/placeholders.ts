import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import { getPkgRoot } from "../shared/package-roots.js";
import { managedVersionMarker } from "./version-file.js";
import { gitEnv, resolveRepoSlug } from "../ledgers/telemetry.js";

export interface TokenMap {
  DEFAULT_BRANCH: string;
  PROJECT_NAME: string;
  // `owner/repo` slug parsed from the `origin` remote, substituted for
  // `{{REPO_SLUG}}`. Empty string when origin is absent/unparseable.
  REPO_SLUG: string;
  // INSTALLING bkit version, stamped by the `{{BKIT_MANAGED_MARKER}}` token. Optional
  // so the many TokenMap literals (tests, the resolveTokens-failure fallback) need
  // not set it — applyTokens reads the package version on demand when the token is
  // present.
  BKIT_VERSION?: string;
}

// Read the INSTALLING bkit version from the package root (NOT the consumer's
// package.json — that is a different version). Mirrors readInstallingVersion
// (install/modules/index.ts) / readPkgVersion (checks/after/index.ts); kept local to avoid a
// tokens → modules import cycle. "0.0.0" on any read failure.
function readInstallingBkitVersion(): string {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(getPkgRoot(), "package.json"), "utf-8")) as {
      version?: string;
    };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

// Resolve DEFAULT_BRANCH: git symbolic-ref refs/remotes/origin/HEAD → "main"
function resolveDefaultBranch(cwd: string): string {
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
    if (branch) return branch;
  } catch {
    // not a git repo or no remote HEAD configured — fall back
  }
  return "main";
}

// Read and parse package.json from cwd. Throws if absent.
function readPackageJson(cwd: string): Record<string, unknown> {
  const pkgPath = path.join(cwd, "package.json");
  if (!fs.existsSync(pkgPath)) {
    throw new Error(`[bkit-placeholders] package.json not found at ${pkgPath}`);
  }
  const raw = fs.readFileSync(pkgPath, "utf-8");
  return JSON.parse(raw) as Record<string, unknown>;
}

// Resolve all tokens in a single read-once pass at install-start.
// Hard-fails (throws) if package.json.name is absent.
export async function resolveTokens(cwd: string): Promise<TokenMap> {
  const pkg = readPackageJson(cwd);

  const name = pkg["name"];
  if (typeof name !== "string" || name.trim() === "") {
    throw new Error(
      `[bkit-placeholders] package.json.name is required but missing or empty in ${cwd}`,
    );
  }

  return {
    DEFAULT_BRANCH: resolveDefaultBranch(cwd),
    PROJECT_NAME: name.trim(),
    REPO_SLUG: resolveRepoSlug(cwd),
    BKIT_VERSION: readInstallingBkitVersion(),
  };
}

// Substitute {{TOKEN}} placeholders in content string.
// Substitution happens at write-time (caller's responsibility), not at template-read time.
// Uses function-form replacers to prevent $& / $1 / $$ substitution patterns from leaking
// through when token values contain dollar signs.
export function applyTokens(content: string, tokens: TokenMap): string {
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
    const version = tokens.BKIT_VERSION ?? readInstallingBkitVersion();
    out = out
      .replace(/^\/\/ \{\{BKIT_MANAGED_MARKER\}\}/gm, () => managedVersionMarker(version, "slash"))
      .replace(/\{\{BKIT_MANAGED_MARKER\}\}/g, () => managedVersionMarker(version));
  }
  return out;
}
