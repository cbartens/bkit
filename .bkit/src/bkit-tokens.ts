import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import { getPkgRoot } from "./bkit-paths.js";
import { managedVersionMarker } from "./bkit-version.js";
import { DEFAULT_RUNNER, parseRunnerLabel } from "./bkit-manifest.js";

export interface TokenMap {
  NODE_VERSION: string;
  DEFAULT_BRANCH: string;
  PROJECT_NAME: string;
  // `owner/repo` slug parsed from the `origin` remote. Consumed by the Renovate
  // module's `extends: ["local>{{REPO_SLUG}}//..."]` line (Renovate's local-preset
  // syntax requires the slug — there is no slug-free self-reference). Empty string
  // when origin is absent/unparseable; the Renovate flow is origin-gated, so the
  // line self-heals on the re-run that follows pushing to a remote.
  REPO_SLUG: string;
  // Full `<!-- bkit:managed vX.Y.Z … -->` marker line for the INSTALLING bkit
  // version (#256 extended to managed docs). Substituted into the first line of
  // each managed doc's `bkit:start` block so `bkit check` can flag a consumer
  // running stale doctrine (`detectManagedDocsStale`). Optional so the many
  // TokenMap literals (tests, the resolveTokens-failure fallback) need not set it
  // — applyTokens computes the marker on demand when the placeholder is present.
  BKIT_MANAGED_MARKER?: string;
  // Configurable `runs-on` label for the bkit-managed cloud workflow (#362).
  // CLOUD_RUNNER → `.github/workflows/bkit-cloud.yml` (both jobs share one label).
  // Resolved from `bkit.runners` (per-workflow key → `runners.default` → `ubuntu-latest`).
  // Optional so bare TokenMap literals need not set it — applyTokens falls back to
  // DEFAULT_RUNNER.
  CLOUD_RUNNER?: string;
}

// Read the INSTALLING bkit version from the package root (NOT the consumer's
// package.json — that is a different version). Mirrors readInstallingVersion
// (bkit-modules) / readPkgVersion (bkit-postinstall); kept local to avoid a
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

// Strip git hook environment variables so child git processes use the repo at
// `cwd` rather than whatever GIT_DIR/GIT_WORK_TREE the hook runner injected.
function gitEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env["GIT_DIR"];
  delete env["GIT_WORK_TREE"];
  delete env["GIT_INDEX_FILE"];
  delete env["GIT_OBJECT_DIRECTORY"];
  return env;
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

// Resolve REPO_SLUG: parse `owner/repo` from `git remote get-url origin`.
// Handles HTTPS (`https://github.com/owner/repo.git`), SSH scp-form
// (`git@github.com:owner/repo.git`), and ssh:// URLs. Returns "" on failure —
// An empty slug only occurs before the repo has a remote.
function resolveRepoSlug(cwd: string): string {
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
    if (m?.[1]) return m[1];
  } catch {
    // no remote / not a git repo — fall back to empty
  }
  return "";
}

// Resolve a bkit-managed workflow's `runs-on` label from `bkit.runners` config (#362).
// Precedence: the per-workflow key (e.g. `runners.bkitCloud`) → `runners.default` →
// literal `ubuntu-latest`. Invalid/blank labels are ignored (parseRunnerLabel returns
// null) so a typo falls back rather than emitting broken YAML. Accepts the already-parsed
// package.json so resolveTokens avoids a second read.
export function resolveRunnerLabel(pkg: Record<string, unknown>, workflowKey: string): string {
  const bkit = pkg["bkit"];
  if (bkit && typeof bkit === "object") {
    const runners = (bkit as Record<string, unknown>)["runners"];
    if (runners && typeof runners === "object") {
      const table = runners as Record<string, unknown>;
      const specific = parseRunnerLabel(table[workflowKey]);
      if (specific) return specific;
      const fallback = parseRunnerLabel(table["default"]);
      if (fallback) return fallback;
    }
  }
  return DEFAULT_RUNNER;
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
    REPO_SLUG: resolveRepoSlug(cwd),
    BKIT_MANAGED_MARKER: managedVersionMarker(readInstallingBkitVersion()),
    CLOUD_RUNNER: resolveRunnerLabel(pkg, "bkitCloud"),
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
  const repoSlug = tokens.REPO_SLUG;
  // Runner label defaults to ubuntu-latest when the TokenMap omits it (bare
  // literals in tests / non-resolveTokens callers).
  const cloudRunner = tokens.CLOUD_RUNNER ?? DEFAULT_RUNNER;
  let out = content
    .replace(/\{\{NODE_VERSION\}\}/g, () => nodeVersion)
    .replace(/\{\{DEFAULT_BRANCH\}\}/g, () => defaultBranch)
    .replace(/\{\{PROJECT_NAME\}\}/g, () => projectName)
    .replace(/\{\{REPO_SLUG\}\}/g, () => repoSlug)
    .replace(/\{\{CLOUD_RUNNER\}\}/g, () => cloudRunner);
  // BKIT_MANAGED_MARKER is resolved lazily: only touch the filesystem when the
  // placeholder is actually present AND the caller's TokenMap omitted the value
  // (resolveTokens always sets it; bare literals in tests / the install fallback
  // do not). Keeps applyTokens IO-free for the overwhelmingly common case.
  if (out.includes("{{BKIT_MANAGED_MARKER}}")) {
    const marker = tokens.BKIT_MANAGED_MARKER ?? managedVersionMarker(readInstallingBkitVersion());
    out = out.replace(/\{\{BKIT_MANAGED_MARKER\}\}/g, () => marker);
  }
  return out;
}
