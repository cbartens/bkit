// bkit-preflight.ts — Phase 1: read-only detection BEFORE any writes.
// No imports from bkit-modules.ts — this file is upstream of module dispatch.
//
// Allow-list for cross-module imports (BAR-167 Phase 1):
//   readBkitVersion  — from bkit-version.ts (version pin reader)
//   deepContains     — from bkit-tiers.ts (JSON containment primitive)
//   getPkgRoot       — from bkit-paths.ts (package root resolver, no cycle)

import * as fs from "node:fs";
import * as path from "node:path";
import type { ModuleFlag } from "./bkit-cli.js";
import { readBkitVersion } from "./bkit-version.js";
import { deepContains, type JsonValue } from "./bkit-tiers.js";
import { getPkgRoot } from "./bkit-paths.js";

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
 *
 * Uses line-anchored matching (equivalent to `findLineAnchoredMarkers`): a marker
 * is only detected when it occupies its own line (possibly with a comment prefix
 * `# ` or `// `). Backtick-quoted prose mentions like `` `<!-- bkit:start -->` ``
 * in markdown are NOT detected. (BAR-142 §B1)
 */
export function hasBkitMarkers(content: string): boolean {
  // Line-anchored: marker must be preceded only by start-of-line or a recognised
  // comment prefix ("# " / "// "), and followed only by end-of-line.
  const htmlPattern = /^(?:# |\/\/ )?<!-- bkit:start -->$/m;
  const hashPattern = /^(?:# |\/\/ )?# bkit:start$/m;
  return htmlPattern.test(content) || hashPattern.test(content);
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

/**
 * Strip out content inside bkit-managed block markers (both HTML and hash style).
 * Used by detectors that need to inspect only consumer-owned content.
 */
export function stripBkitBlock(content: string): string {
  return content
    .replace(/<!--\s*bkit:start\s*-->[\s\S]*?<!--\s*bkit:end\s*-->/g, "")
    .replace(/#\s*bkit:start[\s\S]*?#\s*bkit:end/g, "");
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
      'Update lint:prose to the guarded form: `bash -c \'if command -v vale >/dev/null 2>&1 && [ -d .vale/styles/write-good ]; then vale $(find . -name "*.md" -not -path "*/node_modules/*"); else echo "[bkit] vale missing or .vale/styles/write-good not synced — skipping (run \\`vale sync\\` to enable)"; fi\'`',
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
  const installedPkgPath = path.join(cwd, "node_modules", "@cbartens", "bkit", "package.json");
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
// Husky/managed-file duplication advisories (BAR-141 iter 2)
// ---------------------------------------------------------------------------

const HUSKY_BKIT_COMMANDS: Record<"pre-commit" | "pre-push", string[]> = {
  "pre-commit": ["lint:prose", "lint:slop"],
  "pre-push": ["typecheck", "test"],
};

/**
 * Detect when bkit's husky managed block will duplicate commands the consumer's
 * existing hook content already invokes (often via `turbo run` or `lint-staged`).
 * Result: every commit/push runs the same checks twice.
 */
export function detectHuskyBlockDuplicates(
  cwd: string,
  hookName: "pre-commit" | "pre-push",
): PreflightFinding | null {
  const hookPath = path.join(cwd, ".husky", hookName);
  if (!fs.existsSync(hookPath)) return null;
  const content = fs.readFileSync(hookPath, "utf-8");

  const userContent = stripBkitBlock(content);
  if (!userContent.trim()) return null; // file only has bkit block — no duplication

  const matched = HUSKY_BKIT_COMMANDS[hookName].filter((cmd) => userContent.includes(cmd));
  if (matched.length === 0) return null;

  const id =
    hookName === "pre-commit"
      ? "husky-block-duplicates-precommit"
      : "husky-block-duplicates-prepush";
  const triggerWord = hookName === "pre-commit" ? "commit" : "push";
  return {
    id,
    severity: "advisory",
    detect: `.husky/${hookName} consumer-owned content already references [${matched.join(", ")}]. bkit's managed block runs them again — double-work on every ${triggerWord}.`,
    action:
      `Decide:\n\n  (a) Keep both for safety (e.g. consumer's ${triggerWord} runs them via turbo/lint-staged but you want bkit's bare invocation as a fallback).\n` +
      `  (b) Delete bkit's managed block (the # bkit:start..# bkit:end region) — your existing hook covers it. Most consumers running ${matched.join("/")} via turbo or another wrapper want option (b).`,
  };
}

/**
 * Detect when a line bkit's .gitignore managed block contributes is already
 * present elsewhere in the file. Benign (git ignores duplicates) but worth
 * surfacing — the bkit-managed block should be the single source of truth.
 */
const BKIT_GITIGNORE_LINES = [
  ".worktrees/",
  "docs/plans/logs/**/raw/",
  "docs/plans/logs/**/.lock",
  ".husky/_",
];

export function detectGitignoreBlockDuplicates(cwd: string): PreflightFinding | null {
  const gitignorePath = path.join(cwd, ".gitignore");
  if (!fs.existsSync(gitignorePath)) return null;
  const content = fs.readFileSync(gitignorePath, "utf-8");

  const outsideBkit = stripBkitBlock(content);
  const outsideLines = outsideBkit
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const dupes = BKIT_GITIGNORE_LINES.filter((bl) => outsideLines.includes(bl));
  if (dupes.length === 0) return null;

  return {
    id: "gitignore-block-duplicates",
    severity: "advisory",
    detect: `.gitignore lists [${dupes.join(", ")}] both inside the bkit-managed block and outside it (consumer-owned region).`,
    action: `Git ignores duplicates harmlessly, but cleaner to remove the consumer-side line(s) so the bkit-managed block is the single source of truth. Affected lines: ${dupes.join(", ")}.`,
  };
}

/**
 * Detect when bkit's installed `.prettierignore` block has narrower paths than
 * the bkit version about to be written, i.e. the new block broadens scope.
 * Example: old shipped `.agents/skills/` + `.agents/templates/`; new ships `.agents/`.
 * Consequence: consumer-owned files like `.agents/rules.md` newly stop being formatted.
 */
const BKIT_PRETTIERIGNORE_PATHS = [
  "node_modules/",
  "dist/",
  ".agents/",
  ".github/",
  ".husky/_/",
  "*.tsbuildinfo",
  "docs/",
  "pnpm-lock.yaml",
];

export function detectPrettierignoreScopeNarrowing(cwd: string): PreflightFinding | null {
  const filePath = path.join(cwd, ".prettierignore");
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");

  const blockMatch = content.match(/#\s*bkit:start([\s\S]*?)#\s*bkit:end/);
  if (!blockMatch) return null;
  const oldPaths = blockMatch[1]!
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  const broadenings: string[] = [];
  for (const oldPath of oldPaths) {
    if (BKIT_PRETTIERIGNORE_PATHS.includes(oldPath)) continue;
    const broaderParent = BKIT_PRETTIERIGNORE_PATHS.find(
      (np) => np !== oldPath && oldPath.startsWith(np.endsWith("/") ? np : np + "/"),
    );
    if (broaderParent) {
      broadenings.push(`${oldPath} → ${broaderParent}`);
    }
  }

  if (broadenings.length === 0) return null;

  return {
    id: "prettierignore-scope-narrowing",
    severity: "advisory",
    detect: `.prettierignore bkit-managed block is being broadened on this install: ${broadenings.join("; ")}.`,
    action:
      "bkit's new .prettierignore block uses broader paths. Files that were previously formatted (e.g. .agents/rules.md, .agents/docs.md) will newly be ignored by Prettier. Confirm this is desired — if you want narrower scope, customise .prettierignore outside the bkit-managed block (your customisations survive the install).",
  };
}

// ---------------------------------------------------------------------------
// Phase 1 JSON advisories / blockers (BAR-167)
// ---------------------------------------------------------------------------

/**
 * Advisory: detect __bkit__ envelope at top-level of a JSON file.
 * Fires when consumer has not yet run `bkit upgrade` to v2.0.0.
 * Action: run `pnpm bkit upgrade`.
 */
export function detectLegacyBkitEnvelope(cwd: string, relPath: string): PreflightFinding | null {
  const absPath = path.join(cwd, relPath);
  if (!fs.existsSync(absPath)) return null;
  let doc: Record<string, unknown>;
  try {
    doc = JSON.parse(fs.readFileSync(absPath, "utf-8")) as Record<string, unknown>;
  } catch {
    return null; // malformed JSON — separate advisory
  }
  if (!("__bkit__" in doc)) return null;
  return {
    id: "legacy-bkit-envelope-detected",
    severity: "advisory",
    detect: `${relPath} contains a __bkit__ envelope from bkit ≤ v1.1.1. Run \`pnpm bkit upgrade\` to migrate.`,
    action:
      "Run `pnpm bkit upgrade` to strip the __bkit__ envelope and migrate to v2.0.0 deep-containment schema. The upgrade is idempotent and preserves all consumer-owned keys.",
  };
}

/**
 * Advisory: detect when a JSON file is missing content the template owns.
 * Runs deepContains(template, consumerFile) — fires when ok=false.
 * Severity: advisory.
 */
export function detectTier2JsonDrift(
  cwd: string,
  relPath: string,
  pkgRoot: string,
): PreflightFinding | null {
  const absPath = path.join(cwd, relPath);
  const templatePath = path.join(pkgRoot, ".agents", "templates", relPath);
  if (!fs.existsSync(absPath) || !fs.existsSync(templatePath)) return null;
  let consumerDoc: JsonValue;
  let templateDoc: JsonValue;
  try {
    consumerDoc = JSON.parse(fs.readFileSync(absPath, "utf-8")) as JsonValue;
    templateDoc = JSON.parse(fs.readFileSync(templatePath, "utf-8")) as JsonValue;
  } catch {
    return null; // malformed JSON — handled elsewhere
  }
  const result = deepContains(templateDoc, consumerDoc);
  if (result.ok) return null;
  const details = [
    ...result.missing.map((p) => `missing: ${p}`),
    ...result.mismatched.map((p) => `mismatched: ${p}`),
  ]
    .slice(0, 5)
    .join("; ");
  return {
    id: `tier2-json-drift`,
    severity: "advisory",
    detect: `${relPath} is missing bkit-owned content: ${details}.`,
    action:
      "Run `pnpm bkit install` to restore the bkit-owned scope. Consumer-only keys outside the template tree will be preserved.",
  };
}

/**
 * Blocker: consumer's .bkit-version pinnedVersion < 0.8.0 AND no __bkit__ envelope.
 * This means the consumer is on a pre-envelope Tier-1 install and must route
 * through bkit v1.x before upgrading directly to v2.0.0.
 */
export function detectPreEnvelopeBkitVersion(cwd: string): PreflightFinding | null {
  const versionFilePath = path.join(cwd, ".agents", ".bkit-version");
  const bkitVer = readBkitVersion(versionFilePath);
  if (!bkitVer?.pinnedVersion) return null;

  const pinnedVersion = bkitVer.pinnedVersion;
  // semverLt: pinnedVersion < 0.8.0
  if (!semverLt(pinnedVersion, "0.8.0")) return null;

  // Check that neither JSON file has __bkit__ (confirms pre-envelope install)
  const jsonFiles = [".claude/settings.json", ".cursor/hooks.json"];
  const hasEnvelope = jsonFiles.some((relPath) => {
    const absPath = path.join(cwd, relPath);
    if (!fs.existsSync(absPath)) return false;
    try {
      const doc = JSON.parse(fs.readFileSync(absPath, "utf-8")) as Record<string, unknown>;
      return "__bkit__" in doc;
    } catch {
      return false;
    }
  });

  if (hasEnvelope) return null; // consumer already has envelope — not a pre-envelope install

  return {
    id: "pre-envelope-bkit-version-detected",
    severity: "blocker",
    detect: `On-disk pinnedVersion (${pinnedVersion}) is < 0.8.0 and no __bkit__ envelope found. Direct upgrade to v2.0.0 is not supported from pre-v0.8.0.`,
    action:
      "Route through bkit v1.x first: bump `@cbartens/bkit` to `^1.1.1`, run `pnpm install && pnpm bkit upgrade`, then bump to `^2.0.0` and run again.",
  };
}

/** Returns true if semver versionA < versionB (basic semver, no pre-release). */
function semverLt(a: string, b: string): boolean {
  const pa = a.replace(/^v/, "").split(".").map(Number);
  const pb = b.replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const av = pa[i] ?? 0;
    const bv = pb[i] ?? 0;
    if (av < bv) return true;
    if (av > bv) return false;
  }
  return false;
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

  // Phase 1: pre-envelope blocker (must upgrade through v1.x first)
  const preEnvelope = detectPreEnvelopeBkitVersion(cwd);
  if (preEnvelope) blockers.push(preEnvelope);

  // --- Advisory detectors ---
  // Phase 1: legacy envelope advisory (fires before JSON drift)
  const pkgRoot = getPkgRoot();
  for (const relPath of [".claude/settings.json", ".cursor/hooks.json"]) {
    const envelopeAdvisory = detectLegacyBkitEnvelope(cwd, relPath);
    if (envelopeAdvisory) advisories.push(envelopeAdvisory);
  }

  // Phase 1: JSON containment drift advisory
  for (const relPath of [".claude/settings.json", ".cursor/hooks.json"]) {
    const driftAdvisory = detectTier2JsonDrift(cwd, relPath, pkgRoot);
    if (driftAdvisory) advisories.push(driftAdvisory);
  }

  const huskyPreCommit = detectHuskyNoMarkers(cwd, "pre-commit");
  if (huskyPreCommit) advisories.push(huskyPreCommit);

  const huskyPrePush = detectHuskyNoMarkers(cwd, "pre-push");
  if (huskyPrePush) advisories.push(huskyPrePush);

  const huskyDupCommit = detectHuskyBlockDuplicates(cwd, "pre-commit");
  if (huskyDupCommit) advisories.push(huskyDupCommit);

  const huskyDupPush = detectHuskyBlockDuplicates(cwd, "pre-push");
  if (huskyDupPush) advisories.push(huskyDupPush);

  const gitignoreDup = detectGitignoreBlockDuplicates(cwd);
  if (gitignoreDup) advisories.push(gitignoreDup);

  const prettierBroad = detectPrettierignoreScopeNarrowing(cwd);
  if (prettierBroad) advisories.push(prettierBroad);

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
