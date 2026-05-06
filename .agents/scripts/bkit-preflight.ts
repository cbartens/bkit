// bkit-preflight.ts — Phase 1: read-only detection BEFORE any writes.
// No imports from bkit-modules.ts — this file is upstream of module dispatch.

import * as fs from "node:fs";
import * as path from "node:path";
import type { ModuleFlag } from "./bkit-cli.js";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface PreflightFinding {
  id: string;
  severity: "blocker" | "advisory";
  detect: string;
  action: string;
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

/**
 * Check whether a file's content contains bkit-managed block markers.
 * Recognises both HTML-comment style (`<!-- bkit:start -->`) and hash-comment
 * style (`# bkit:start`).
 */
export function hasBkitMarkers(content: string): boolean {
  return content.includes("<!-- bkit:start -->") || content.includes("# bkit:start");
}

// Deduplicate an array of findings by `id`, first occurrence wins.
function dedupeById(findings: PreflightFinding[]): PreflightFinding[] {
  const seen = new Set<string>();
  return findings.filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });
}

// ---------------------------------------------------------------------------
// Blocker detectors
// ---------------------------------------------------------------------------

export function detectNoPackageJson(cwd: string): PreflightFinding | null {
  if (fs.existsSync(path.join(cwd, "package.json"))) return null;
  return {
    id: "no-package-json",
    severity: "blocker",
    detect: "package.json not found in the current directory.",
    action:
      "Run `npm init -y` to create a minimal package.json, or copy one from an existing project, then re-run `pnpm bkit install`.",
  };
}

export function detectMalformedPackageJson(cwd: string): PreflightFinding | null {
  const pkgPath = path.join(cwd, "package.json");
  if (!fs.existsSync(pkgPath)) return null;
  try {
    JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    return null;
  } catch {
    return {
      id: "malformed-package-json",
      severity: "blocker",
      detect: "package.json exists but contains invalid JSON.",
      action:
        "Fix the JSON syntax error in package.json (run `node -e \"JSON.parse(require('fs').readFileSync('package.json','utf8'))\"` to locate the error), then re-run `pnpm bkit install`.",
    };
  }
}

export function detectNotGitRepo(cwd: string, modules: Set<ModuleFlag>): PreflightFinding | null {
  if (!modules.has("core")) return null;
  if (fs.existsSync(path.join(cwd, ".git"))) return null;
  return {
    id: "not-git-repo",
    severity: "blocker",
    detect: "--core requested but .git/ directory not found — this is not a git repository.",
    action:
      "Run `git init` to initialise a git repo, then re-run. Or omit `--core` if you don't need bkit's git-hooks module.",
  };
}

// ---------------------------------------------------------------------------
// Advisory detectors
// ---------------------------------------------------------------------------

export function detectHuskyNoMarkers(
  cwd: string,
  hookName: "pre-commit" | "pre-push",
): PreflightFinding | null {
  const hookPath = path.join(cwd, ".husky", hookName);
  if (!fs.existsSync(hookPath)) return null;
  const content = fs.readFileSync(hookPath, "utf-8");
  if (hasBkitMarkers(content)) return null;
  const id = hookName === "pre-commit" ? "husky-no-markers-precommit" : "husky-no-markers-prepush";
  return {
    id,
    severity: "advisory",
    detect: `.husky/${hookName} exists but has no bkit-managed block markers.`,
    action: `bkit will append its managed block to .husky/${hookName}. To keep your custom content and the bkit block in the same file, ensure the file has \`# bkit:start\` / \`# bkit:end\` markers around the bkit section. Run \`pnpm bkit install --git-hooks\` after adding markers.`,
  };
}

export function detectPrettierignoreNoMarkers(cwd: string): PreflightFinding | null {
  const filePath = path.join(cwd, ".prettierignore");
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  if (hasBkitMarkers(content)) return null;
  return {
    id: "prettierignore-no-markers",
    severity: "advisory",
    detect: ".prettierignore exists but has no bkit-managed block markers.",
    action:
      "bkit will append its managed block to .prettierignore. To keep your custom content and the bkit block in the same file, ensure the file has `# bkit:start` / `# bkit:end` markers around the bkit section.",
  };
}

export function detectLintProseF9Vulnerable(cwd: string): PreflightFinding | null {
  const pkgPath = path.join(cwd, "package.json");
  if (!fs.existsSync(pkgPath)) return null;
  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as Record<string, unknown>;
  } catch {
    return null;
  }
  const scripts = pkg.scripts as Record<string, string> | undefined;
  if (!scripts || !scripts["lint:prose"]) return null;
  const scriptVal = scripts["lint:prose"];
  if (scriptVal.includes("[ -d .vale/styles/write-good ]")) return null;
  return {
    id: "lint-prose-f9-vulnerable",
    severity: "advisory",
    detect:
      "package.json#scripts.lint:prose exists but lacks the `[ -d .vale/styles/write-good ]` guard (F9 — BAR-138).",
    action:
      "Update lint:prose to the guarded form: `bash -c 'if command -v vale >/dev/null 2>&1 && [ -d .vale/styles/write-good ]; then vale $(find . -name \"*.md\" -not -path \"*/node_modules/*\"); else echo \"[bkit] vale missing or .vale/styles/write-good not synced — skipping (run \\`vale sync\\` to enable)\"; fi'`",
  };
}

export function detectBkitVersionMajorDowngrade(
  cwd: string,
  installingVersion: string,
): PreflightFinding | null {
  const versionFile = path.join(cwd, ".agents", ".bkit-version");
  if (!fs.existsSync(versionFile)) return null;
  const onDisk = fs.readFileSync(versionFile, "utf-8").trim();
  if (!onDisk) return null; // empty/whitespace file — guard against parseInt("") = NaN
  const onDiskMajor = parseInt(onDisk.split(".")[0] ?? "0", 10);
  const installingMajor = parseInt(installingVersion.split(".")[0] ?? "0", 10);
  if (Number.isNaN(onDiskMajor) || Number.isNaN(installingMajor)) return null; // malformed version strings — no false advisory
  if (onDiskMajor <= installingMajor) return null;
  return {
    id: "bkit-version-major-downgrade",
    severity: "advisory",
    detect: `On-disk .bkit-version major (${onDiskMajor}) is greater than the installing version major (${installingMajor}). This is a major-version downgrade.`,
    action: `If this is intentional, proceed. Otherwise, check your @cbartens/bkit version pin in package.json and ensure you're installing the intended version. Current on-disk: ${onDisk}, installing: ${installingVersion}.`,
  };
}

export function detectBkitVersionPinStale(cwd: string): PreflightFinding | null {
  const installedPkgPath = path.join(
    cwd,
    "node_modules",
    "@cbartens",
    "bkit",
    "package.json",
  );
  const versionFile = path.join(cwd, ".agents", ".bkit-version");

  if (!fs.existsSync(installedPkgPath) || !fs.existsSync(versionFile)) return null;

  let installedVersion: string;
  try {
    const pkg = JSON.parse(fs.readFileSync(installedPkgPath, "utf-8")) as {
      version?: string;
    };
    installedVersion = pkg.version ?? "";
  } catch {
    return null;
  }

  const onDiskVersion = fs.readFileSync(versionFile, "utf-8").trim();

  if (!installedVersion || !onDiskVersion) return null;

  // Compare semver: installed > onDisk → pin is stale
  if (!semverGt(installedVersion, onDiskVersion)) return null;

  return {
    id: "bkit-version-pin-stale",
    severity: "advisory",
    detect: `node_modules/@cbartens/bkit version (${installedVersion}) is newer than .agents/.bkit-version (${onDiskVersion}). Consumer ran \`pnpm add -D @cbartens/bkit@${installedVersion}\` but did not re-run \`pnpm bkit install\`.`,
    action:
      "Run `pnpm bkit install --full` to resync the .agents payload + version pin, then commit the result. `pnpm add` does not run the bkit installer — bkit's payload must be re-synced after every `@cbartens/bkit` version bump.",
  };
}

// ---------------------------------------------------------------------------
// Internal semver comparison helper
// ---------------------------------------------------------------------------

/** Returns true if versionA > versionB (basic semver, no pre-release). */
function semverGt(a: string, b: string): boolean {
  const pa = a.replace(/^v/, "").split(".").map(Number);
  const pb = b.replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const av = pa[i] ?? 0;
    const bv = pb[i] ?? 0;
    if (av > bv) return true;
    if (av < bv) return false;
  }
  return false;
}

// ---------------------------------------------------------------------------
// runPreflight — main Phase 1 entry point
// ---------------------------------------------------------------------------

/**
 * Run all Phase 1 (read-only) detectors.
 * Returns deduplicated { blockers, advisories } — intra-phase dedup by id,
 * first occurrence wins.
 *
 * cwd defaults to process.cwd(). Pass explicitly in tests.
 * installingVersion: used by detectBkitVersionMajorDowngrade; defaults to the
 * package's own version read from its package.json at runtime.
 */
export function runPreflight(
  modules: Set<ModuleFlag>,
  cwd: string = process.cwd(),
  installingVersion?: string,
): { blockers: PreflightFinding[]; advisories: PreflightFinding[] } {
  // Resolve installing version if not provided
  let version = installingVersion;
  if (!version) {
    try {
      // Walk up from this script's location to find the package.json
      const scriptDir = new URL(".", import.meta.url).pathname;
      const pkgJsonPath = path.resolve(scriptDir, "..", "..", "package.json");
      if (fs.existsSync(pkgJsonPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8")) as { version?: string };
        version = pkg.version ?? "0.0.0";
      } else {
        version = "0.0.0";
      }
    } catch {
      version = "0.0.0";
    }
  }

  const blockers: PreflightFinding[] = [];
  const advisories: PreflightFinding[] = [];

  // --- Blocker detectors ---
  const noPackageJson = detectNoPackageJson(cwd);
  if (noPackageJson) blockers.push(noPackageJson);

  const malformedPackageJson = detectMalformedPackageJson(cwd);
  if (malformedPackageJson) blockers.push(malformedPackageJson);

  const notGitRepo = detectNotGitRepo(cwd, modules);
  if (notGitRepo) blockers.push(notGitRepo);

  // --- Advisory detectors ---
  const huskyPreCommit = detectHuskyNoMarkers(cwd, "pre-commit");
  if (huskyPreCommit) advisories.push(huskyPreCommit);

  const huskyPrePush = detectHuskyNoMarkers(cwd, "pre-push");
  if (huskyPrePush) advisories.push(huskyPrePush);

  const prettierignore = detectPrettierignoreNoMarkers(cwd);
  if (prettierignore) advisories.push(prettierignore);

  const lintProse = detectLintProseF9Vulnerable(cwd);
  if (lintProse) advisories.push(lintProse);

  const versionMajorDowngrade = detectBkitVersionMajorDowngrade(cwd, version);
  if (versionMajorDowngrade) advisories.push(versionMajorDowngrade);

  const versionPinStale = detectBkitVersionPinStale(cwd);
  if (versionPinStale) advisories.push(versionPinStale);

  return {
    blockers: dedupeById(blockers),
    advisories: dedupeById(advisories),
  };
}
