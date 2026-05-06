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
// Tier-1 hooks-config overwrite blockers (BAR-141 iter 2)
// ---------------------------------------------------------------------------

/**
 * Detect customised `.claude/settings.json` and `.cursor/hooks.json`.
 *
 * bkit ships these as Tier-1 (full-overwrite). Consumers commonly add Stop
 * hooks, postflight wiring, `failClosed`, `loop_limit`, etc. — full overwrite
 * silently destroys those. Surface as blocker so the consumer chooses to skip
 * the module or back up first; recoverable losses must not be silent.
 *
 * Returns up to two findings (one per file).
 */
export function detectHooksConfigOverwriteRisk(
  cwd: string,
  modules: Set<ModuleFlag>,
): PreflightFinding[] {
  const findings: PreflightFinding[] = [];

  // .claude/settings.json — bkit ships hooks.SessionStart only
  if (modules.has("claude")) {
    const claudePath = path.join(cwd, ".claude", "settings.json");
    if (fs.existsSync(claudePath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(claudePath, "utf-8")) as Record<string, unknown>;
        const hooks = parsed.hooks as Record<string, unknown> | undefined;
        if (hooks && typeof hooks === "object" && !Array.isArray(hooks)) {
          const extraKeys = Object.keys(hooks).filter((k) => k !== "SessionStart");
          if (extraKeys.length > 0) {
            findings.push({
              id: "hooks-config-overwrite-risk-claude",
              severity: "blocker",
              detect: `.claude/settings.json contains hook event(s) beyond SessionStart: [${extraKeys.join(", ")}]. bkit's --claude module fully overwrites this file (Tier-1) and would silently destroy these.`,
              action:
                "Choose one:\n\n" +
                "  (a) Back up .claude/settings.json now, then re-run with --claude. After install, manually merge your custom hook entries (Stop, PostToolUse, etc.) back into the bkit-installed file.\n\n" +
                "  (b) Skip --claude on this run. Use `pnpm bkit install` without --claude to leave .claude/settings.json untouched.\n\n" +
                "Long-term: these hook configs should be Tier-2 (managed-block) so consumer hook entries survive bkit upgrades. Track this need in a separate issue.",
            });
          }
        }
      } catch {
        // Malformed JSON — skip; another detector handles syntax errors
      }
    }
  }

  // .cursor/hooks.json — bkit ships flat array form with sessionStart/sessionStop
  if (modules.has("cursor")) {
    const cursorPath = path.join(cwd, ".cursor", "hooks.json");
    if (fs.existsSync(cursorPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(cursorPath, "utf-8")) as Record<string, unknown>;
        // Cursor v1 schema (`{"version": 1, "hooks": {...}}`) is the documented form
        // but bkit ships the flat-array form. v1 schema → consumer is using docs-form
        // and bkit's overwrite would destroy it.
        const isV1Schema = "version" in parsed;
        // Detect advanced fields bkit's seed never has.
        const raw = JSON.stringify(parsed);
        const advancedFields = ["failClosed", "loop_limit", "preflight.sh", "postflight.sh"].filter(
          (f) => raw.includes(f),
        );
        if (isV1Schema || advancedFields.length > 0) {
          const detected = isV1Schema
            ? "Cursor v1 schema (top-level `version` key)"
            : `advanced fields [${advancedFields.join(", ")}]`;
          findings.push({
            id: "hooks-config-overwrite-risk-cursor",
            severity: "blocker",
            detect: `.cursor/hooks.json contains custom configuration: ${detected}. bkit's --cursor module fully overwrites this file (Tier-1) and would silently destroy these settings.`,
            action:
              "Choose one:\n\n" +
              "  (a) Back up .cursor/hooks.json now, then re-run with --cursor. After install, manually merge your custom hook entries (failClosed, loop_limit, postflight wiring, v1 schema, etc.) back into the bkit-installed file.\n\n" +
              "  (b) Skip --cursor on this run. Use `pnpm bkit install` without --cursor to leave .cursor/hooks.json untouched.\n\n" +
              "Long-term: these hook configs should be Tier-2 (managed-block) so consumer hook entries survive bkit upgrades. Track this need in a separate issue.",
          });
        }
      } catch {
        // Malformed JSON — skip
      }
    }
  }

  return findings;
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

  // Tier-1 hooks-config overwrite blockers (per-module gated)
  for (const f of detectHooksConfigOverwriteRisk(cwd, modules)) blockers.push(f);

  // --- Advisory detectors ---
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
