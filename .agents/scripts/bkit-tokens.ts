import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

export interface TokenMap {
  NODE_VERSION: string;
  DEFAULT_BRANCH: string;
  PROJECT_NAME: string;
}

// Extract the major version from a node version string.
// Accepts: "22", "22.1.0", "v22", "v22.1.0", ">=20", "^18.0.0", "~16"
// For .nvmrc content, pass the full file contents — blank/comment lines are skipped.
function extractNodeMajor(raw: string): string | null {
  // Scan line-by-line: skip blank lines and lines starting with '#'.
  // Take the first non-empty/non-comment line as the version source.
  const lines = raw.split("\n");
  let versionLine: string | undefined;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;
    versionLine = trimmed;
    break;
  }
  if (!versionLine) return null;
  const stripped = versionLine.replace(/^[v=^~<>!]+/, "");
  const m = stripped.match(/^(\d+)/);
  return m ? (m[1] ?? null) : null;
}

// Resolve NODE_VERSION: .nvmrc → package.json.engines.node → "22"
function resolveNodeVersion(cwd: string, pkg: Record<string, unknown>): string {
  const nvmrcPath = path.join(cwd, ".nvmrc");
  if (fs.existsSync(nvmrcPath)) {
    const raw = fs.readFileSync(nvmrcPath, "utf-8").trim();
    const major = extractNodeMajor(raw);
    if (major) return major;
  }

  const engines = pkg["engines"] as Record<string, string> | undefined;
  if (engines?.["node"]) {
    const major = extractNodeMajor(engines["node"]);
    if (major) return major;
  }

  return "22";
}

// Resolve DEFAULT_BRANCH: git symbolic-ref refs/remotes/origin/HEAD → "main"
function resolveDefaultBranch(cwd: string): string {
  try {
    const raw = execSync("git symbolic-ref refs/remotes/origin/HEAD", {
      cwd,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
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
    throw new Error(`[bkit-tokens] package.json not found at ${pkgPath}`);
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
    throw new Error(`[bkit-tokens] package.json.name is required but missing or empty in ${cwd}`);
  }

  return {
    NODE_VERSION: resolveNodeVersion(cwd, pkg),
    DEFAULT_BRANCH: resolveDefaultBranch(cwd),
    PROJECT_NAME: name.trim(),
  };
}

// Substitute {{TOKEN}} placeholders in content string.
// Substitution happens at write-time (caller's responsibility), not at template-read time.
// Uses function-form replacers to prevent $& / $1 / $$ substitution patterns from leaking
// through when token values contain dollar signs.
export function applyTokens(content: string, tokens: TokenMap): string {
  const nodeVersion = tokens.NODE_VERSION;
  const defaultBranch = tokens.DEFAULT_BRANCH;
  const projectName = tokens.PROJECT_NAME;
  return content
    .replace(/\{\{NODE_VERSION\}\}/g, () => nodeVersion)
    .replace(/\{\{DEFAULT_BRANCH\}\}/g, () => defaultBranch)
    .replace(/\{\{PROJECT_NAME\}\}/g, () => projectName);
}
