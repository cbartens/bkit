// bkit-preflight.ts — Phase 1: read-only detection BEFORE any writes.
// No imports from bkit-modules.ts — this file is upstream of module dispatch.
//
// Allow-list for cross-module imports (BAR-167 Phase 1+2):
//   readBkitVersion       — from bkit-version.ts (version pin reader)
//   deepContains          — from bkit-tiers.ts (JSON containment primitive)
//   extractManagedBlock   — from bkit-install.ts (marker block extraction)
//   getPkgRoot            — from bkit-paths.ts (package root resolver, no cycle)
//   parseIssueTracker     — from bkit-manifest.ts (pure data, no cycle)

import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import type { ModuleFlag } from "./bkit-cli.js";
import { readBkitVersion } from "./bkit-version.js";
import { deepContains, stripManagedBlock, type JsonValue } from "./bkit-tiers.js";
import { extractManagedBlock, type MarkerStyle } from "./bkit-install.js";
import { getPkgRoot } from "./bkit-paths.js";
import { parseIssueTracker, DEFAULT_ISSUE_TRACKER, type IssueTracker } from "./bkit-manifest.js";

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
 *
 * Uses line-anchored marker detection (via stripManagedBlock from bkit-tiers.ts) to
 * avoid the greedy-regex KN-8 hazard. Applies both marker styles sequentially so that
 * files using either `<!-- bkit:start -->` or `# bkit:start` are stripped correctly.
 */
export function stripBkitBlock(content: string): string {
  // Strip html-comment markers first, then hash-comment markers (line-anchored, KN-8 safe).
  return stripManagedBlock(stripManagedBlock(content, "html-comment"), "hash-comment");
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

// detectHuskyNoMarkers removed in v2.0.4 — husky hooks are Tier 3 (seed-or-print),
// no markers expected. See runGitHooksModule + CHANGELOG 2.0.4 for the migration.

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
      "Add `# bkit:start` / `# bkit:end` markers around the section bkit owns. Without markers, `bkit install` appends its block to EOF — fine for fresh installs but harder to merge cleanly on upgrade.",
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
// (detectHuskyNoMarkers + detectHuskyBlockDuplicates removed in v2.0.4 along
// with the Tier 2 → Tier 3 husky migration — the bkit hook no longer carries
// markers, so neither the "missing markers" advisory nor the "managed block
// duplicates consumer commands" advisory has anything to detect against.)
// ---------------------------------------------------------------------------

/**
 * Detect when a line bkit's .gitignore managed block contributes is already
 * present elsewhere in the file. Benign (git ignores duplicates) but worth
 * surfacing — the bkit-managed block should be the single source of truth.
 */
const BKIT_GITIGNORE_LINES = [
  ".worktrees/",
  "docs/plans/*/logs/**/raw/",
  "docs/plans/*/logs/**/.lock",
  ".husky/_",
  ".agents/advisories.md",
  ".agents/.env",
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
 * Detect when the consumer's installed `.prettierignore` bkit-managed block has
 * paths narrower than the canonical bkit list (BKIT_PRETTIERIGNORE_PATHS), i.e.
 * the new block broadens scope on this install.
 *
 * BKIT_PRETTIERIGNORE_PATHS MUST mirror the canonical block shipped in
 * `.agents/templates/.prettierignore` (between `# bkit:start` and `# bkit:end`).
 * If it drifts broader, this detector fires every install with a phantom
 * "broadening" that never actually happens.
 */
const BKIT_PRETTIERIGNORE_PATHS = [
  "node_modules/",
  "dist/",
  ".agents/skills/",
  ".claude/",
  ".cursor/",
  ".github/",
  ".husky/_/",
  "*.tsbuildinfo",
  "pnpm-lock.yaml",
  ".mcp.json",
  ".envrc",
  ".agents/.env.example",
];

export function detectPrettierignoreScopeBroadening(cwd: string): PreflightFinding | null {
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
    id: "prettierignore-scope-broadening",
    severity: "advisory",
    detect: `.prettierignore bkit-managed block is being broadened on this install: ${broadenings.join("; ")}.`,
    action:
      "bkit's new .prettierignore block uses broader paths. Files that were previously formatted (e.g. .agents/rules.md, .agents/docs.md) will newly be ignored by Prettier. Confirm this is desired — if you want narrower scope, customise .prettierignore outside the bkit-managed block (your customisations survive the install).",
  };
}

// ---------------------------------------------------------------------------
// Phase 1 JSON advisories / blockers (BAR-167)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// [verbose ci] marker advisories (BAR-224)
// ---------------------------------------------------------------------------

/**
 * Advisory: consumer's `.github/workflows/ci.yml` has bkit-managed markers but is
 * missing the `# bkit:start verbose-ci-env` named block that enables the
 * `[verbose ci]` commit/PR-title marker.
 *
 * Without the env block, the marker is a silent no-op — bkit-debug prompts will
 * still recommend `[verbose ci]` on thin-log failures, but the consumer's CI will
 * not escalate log detail. Surfacing this as an advisory directs the consumer to
 * `bkit install` which rewrites the bkit-managed block to include the env.
 *
 * Only fires when the consumer has opted into a bkit-managed ci.yml at all (other
 * bkit markers present). Consumers who own their ci.yml entirely are not nagged.
 */
export function detectCiYmlVerboseCiBlockMissing(cwd: string): PreflightFinding | null {
  const ciPath = path.join(cwd, ".github", "workflows", "ci.yml");
  if (!fs.existsSync(ciPath)) return null;
  const content = fs.readFileSync(ciPath, "utf-8");
  // YAML-aware marker detection: allow leading whitespace, because ci.yml markers are
  // indented inside `jobs:` / `steps:` (unlike the strict `hasBkitMarkers` used for
  // flat-structure files like .gitignore / .prettierignore where indentation is unusual).
  const hasAnyBkitMarker = /^\s*# bkit:start\b/m.test(content);
  if (!hasAnyBkitMarker) return null;
  // Named block marker present? `# bkit:start verbose-ci-env`
  if (/^\s*# bkit:start verbose-ci-env\b/m.test(content)) return null;
  return {
    id: "ci-yml-verbose-ci-block-missing",
    severity: "advisory",
    detect:
      ".github/workflows/ci.yml has bkit-managed markers but is missing the `# bkit:start verbose-ci-env` block. The `[verbose ci]` commit-message / PR-title marker will silently no-op.",
    action:
      "Run `pnpm bkit install` to add the verbose-ci-env block (sets TURBO_LOG_LEVEL=full, NODE_OPTIONS=--trace-warnings, DEBUG=vercel:*,supabase:* under the marker). After install, append `[verbose ci]` to the PR title (for feature-branch pushes — the workflow fires on `pull_request`, not `push`) or to the commit message (for direct pushes to `dev` / `main`).",
  };
}

/**
 * Advisory: consumer's Playwright invocation passes `--reporter=line`, which
 * overrides the configured reporter chain in `playwright.config.ts`. Under
 * `[verbose ci]` with `--trace=on`, this writes trace artifacts that no reporter
 * surfaces — pure cost (artifact upload + storage) with zero diagnostic payoff.
 *
 * "Hostile" gap per the BAR-224 signal-vs-noise classification. Detected in the
 * consumer-owned region of ci.yml (bkit-managed block stripped) so we never fire
 * on a bkit-shipped stub.
 */
export function detectPlaywrightReporterHostile(cwd: string): PreflightFinding | null {
  const ciPath = path.join(cwd, ".github", "workflows", "ci.yml");
  if (!fs.existsSync(ciPath)) return null;
  const content = fs.readFileSync(ciPath, "utf-8");
  // Filter out YAML comment lines (those starting with optional whitespace + `#`) before
  // matching, so we don't fire on bkit-shipped commented stubs or commented-out consumer
  // examples. `stripBkitBlock` is unsuitable here because it uses strict line-anchored
  // marker detection that misses indented YAML markers.
  const activeContent = content
    .split("\n")
    .filter((line) => !/^\s*#/.test(line))
    .join("\n");
  // Match a literal `playwright test` invocation followed (anywhere) by `--reporter=line`.
  // Both substrings must appear in active (non-comment) content. Heuristic but conservative.
  if (!/playwright\s+test/.test(activeContent)) return null;
  if (!/--reporter[= ]line\b/.test(activeContent)) return null;
  return {
    id: "playwright-reporter-line-override-hostile",
    severity: "advisory",
    detect:
      ".github/workflows/ci.yml has a `playwright test` invocation that passes `--reporter=line`. Under `[verbose ci]` with `--trace=on`, trace artifacts are written but no reporter surfaces them — pure cost.",
    action:
      "Drop the `--reporter=line` flag so `playwright.config.ts`'s configured reporter chain runs (typically `[list, html, github, json]`). Verbose-aware pattern: `pnpm test:e2e ${VERBOSE_CI:+-- --trace=on}` — never pass `--reporter`. Note that `--video` and `--screenshot` are NOT Playwright CLI flags (they're `use:` keys in playwright.config.ts); the trace.zip already captures snapshots / network / console / source. Default-mode output stays clean via the config's `list` reporter.",
  };
}

/**
 * Advisory: consumer's `docs/observability.md` has the bkit-managed block (which
 * ships an `<!-- debug-fetch:start --> ... <!-- debug-fetch:end -->` example
 * inside it) but no customised `debug-fetch` marker pair AFTER `<!-- bkit:end -->`.
 *
 * `/bkit-debug`'s runtime sub-fetch only reads the first `debug-fetch` block
 * occurring after `<!-- bkit:end -->` (consumer section) — the example shipped
 * inside the managed block is intentionally skipped. Without consumer-section
 * markers, the runtime-log artifact (`debug-context-runtime-{ATTEMPT}.md`) is
 * silently empty on every debug run.
 *
 * Only fires when the consumer has the bkit-managed block at all. Consumers
 * who fully own `docs/observability.md` (no markers) are not nagged.
 */
export function detectObservabilityDebugFetchMissing(cwd: string): PreflightFinding | null {
  const filePath = path.join(cwd, "docs", "observability.md");
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  // Require the bkit-managed block (line-anchored `<!-- bkit:end -->`).
  const endIdx = content.search(/^<!-- bkit:end -->$/m);
  if (endIdx === -1) return null;
  const afterBkitEnd = content.slice(endIdx);
  // Consumer-section markers must be line-anchored to mirror the workflow's
  // `sed`/`awk` extraction (`.agents/workflows/bkit-debug.md:298`).
  const hasStart = /^<!-- debug-fetch:start -->$/m.test(afterBkitEnd);
  const hasEnd = /^<!-- debug-fetch:end -->$/m.test(afterBkitEnd);
  if (hasStart && hasEnd) return null;
  return {
    id: "observability-debug-fetch-missing",
    severity: "advisory",
    detect:
      "docs/observability.md has the bkit-managed block but no customised `<!-- debug-fetch:start --> ... <!-- debug-fetch:end -->` pair after `<!-- bkit:end -->`. `/bkit-debug`'s runtime-log sub-fetch will silently produce an empty artifact.",
    action:
      "Copy the `<!-- debug-fetch:start --> ... <!-- debug-fetch:end -->` block (with its fenced `bash` query) out of the bkit-managed section and paste it after `<!-- bkit:end -->`, then customise the query for your log backend (`gcloud logging read` / `aws logs filter-log-events` / `datadog logs query` etc.). Keep it idempotent and read-only — the agent customises severity / freshness / limit at run-time.",
  };
}

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
    detect: `${relPath} contains a __bkit__ envelope from bkit <= v1.1.1.`,
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
 * Advisory: detect when a markered-text file's bkit-managed block differs from the
 * template's marker block (Phase 2 — tier2-text-drift advisory, BAR-167).
 *
 * Fires when:
 *   - Consumer file exists AND has bkit markers
 *   - Template file exists AND has a bkit marker block
 *   - The extracted consumer block != extracted template block (byte-equal check)
 *
 * Does NOT fire when markers are absent from consumer (that is the `markers-missing`
 * case, surfaced separately by detectHuskyNoMarkers / future generic detector).
 *
 * Follows `[Context] Message` advisory format.
 */
export function detectTier2TextDrift(
  cwd: string,
  relPath: string,
  pkgRoot: string,
): PreflightFinding | null {
  const absPath = path.join(cwd, relPath);
  const templatePath = path.join(pkgRoot, ".agents", "templates", relPath);
  if (!fs.existsSync(absPath) || !fs.existsSync(templatePath)) return null;

  const consumerContent = fs.readFileSync(absPath, "utf-8");
  const templateContent = fs.readFileSync(templatePath, "utf-8");

  // Detect marker style from the consumer file
  let style: MarkerStyle | null = null;
  if (/^<!-- bkit:start -->$/m.test(consumerContent)) style = "html-comment";
  else if (/^# bkit:start$/m.test(consumerContent)) style = "hash-comment";
  if (!style) return null; // no markers in consumer — not a drift (markers-missing case)

  // Extract the block from both consumer and template
  const consumerBlock = extractManagedBlock(consumerContent, style);
  if (consumerBlock === null) return null; // consumer has markers but they're malformed

  // Template may use the same or different marker style
  let templateBlock = extractManagedBlock(templateContent, style);
  if (templateBlock === null) {
    // Try the other style in case template uses different style
    const altStyle: MarkerStyle = style === "html-comment" ? "hash-comment" : "html-comment";
    templateBlock = extractManagedBlock(templateContent, altStyle);
  }
  if (templateBlock === null) return null; // template has no block to compare against

  if (consumerBlock === templateBlock) return null; // byte-equal — no drift

  return {
    id: "tier2-text-drift",
    severity: "advisory",
    detect: `${relPath} bkit-managed marker block content differs from template.`,
    action:
      `Run \`pnpm bkit install\` to restore the bkit-managed block in ${relPath}. ` +
      "Content outside the bkit:start/bkit:end markers is preserved.",
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
// Advisory: missing MCP server entries in .mcp.json / .cursor/mcp.json
// ---------------------------------------------------------------------------

/**
 * The set of MCP server keys that bkit considers required in any mcpServers object.
 * Exported so tests can reference it without duplication.
 *
 * For tracker-aware checks use `requiredMcpServersForTracker(tracker)` instead.
 */
export const REQUIRED_MCP_SERVERS: readonly string[] = ["linear", "github"];

/**
 * Return the MCP server keys required for a given issue tracker.
 *
 * - `github`  → only `github` MCP server required (Linear gate is a no-op on GitHub tracker).
 * - `linear`  → both `linear` and `github` required (Linear tracker still dispatches via GitHub PR).
 * - `none`    → `github` only (tracker calls are no-ops; GitHub surface still needed for PR ops).
 */
export function requiredMcpServersForTracker(tracker: IssueTracker): readonly string[] {
  if (tracker === "github") return ["github"];
  if (tracker === "linear") return ["linear", "github"];
  return ["github"]; // none — only GitHub for PR surface
}

/**
 * Advisory: one finding per missing required MCP server key in a given mcp.json file.
 *
 * Semantics:
 *   - File absent      → return [] (Tier 3 scaffold will write it on next install)
 *   - File malformed   → return [] (parse-failure is a different advisory class)
 *   - File present, mcpServers missing a required key → one advisory per missing key
 *   - File present, all required keys present → return []
 *
 * Pass `issueTracker` to narrow which MCP servers are required. Defaults to checking
 * `REQUIRED_MCP_SERVERS` (all servers) for backward compatibility.
 *
 * Follows `[context] Message` advisory format.
 */
export function detectMissingMcpServers(
  cwd: string,
  relPath: string,
  issueTracker?: IssueTracker,
): PreflightFinding[] {
  const absPath = path.join(cwd, relPath);
  if (!fs.existsSync(absPath)) return [];

  let doc: Record<string, unknown>;
  try {
    doc = JSON.parse(fs.readFileSync(absPath, "utf-8")) as Record<string, unknown>;
  } catch {
    return []; // malformed JSON — skip silently
  }

  const mcpServers =
    doc.mcpServers !== null && typeof doc.mcpServers === "object" && !Array.isArray(doc.mcpServers)
      ? (doc.mcpServers as Record<string, unknown>)
      : null;

  const requiredServers =
    issueTracker !== undefined ? requiredMcpServersForTracker(issueTracker) : REQUIRED_MCP_SERVERS;

  const findings: PreflightFinding[] = [];
  for (const key of requiredServers) {
    if (mcpServers && Object.prototype.hasOwnProperty.call(mcpServers, key)) continue;
    const urlHint =
      key === "linear"
        ? `"url": "https://mcp.linear.app/mcp"`
        : key === "github"
          ? `"url": "https://api.githubcopilot.com/mcp/"`
          : `"url": "<server-url>"`;
    findings.push({
      id: `mcp-missing-server-${key}-${relPath.replace(/[^a-z0-9]/gi, "-")}`,
      severity: "advisory",
      detect: `${relPath} is missing the ${key} MCP server in mcpServers.`,
      action: `[mcp] ${relPath} is missing the ${key} MCP server. Add it to mcpServers: {"${key}": {${urlHint}}}`,
    });
  }
  return findings;
}

/**
 * Advisory: one finding per bkit-managed MCP server that is present in the file
 * but NOT required by the resolved tracker (the symmetric counterpart to
 * `detectMissingMcpServers`). Catches the stale-leftover case — e.g. a repo
 * switched to `--tracker=github` but still carries the `linear` entry.
 *
 * Only flags servers bkit itself manages (`REQUIRED_MCP_SERVERS`). Consumer-added
 * MCP servers (custom tooling, other providers) are never flagged for removal.
 *
 * Semantics:
 *   - File absent / malformed / no mcpServers → return []
 *   - `issueTracker` undefined → return [] (cannot know what's allowed → no false positives)
 *   - bkit-managed server present but not in `requiredMcpServersForTracker(tracker)` → one advisory
 *
 * Follows `[context] Message` advisory format.
 */
export function detectExtraMcpServers(
  cwd: string,
  relPath: string,
  issueTracker?: IssueTracker,
): PreflightFinding[] {
  if (issueTracker === undefined) return [];

  const absPath = path.join(cwd, relPath);
  if (!fs.existsSync(absPath)) return [];

  let doc: Record<string, unknown>;
  try {
    doc = JSON.parse(fs.readFileSync(absPath, "utf-8")) as Record<string, unknown>;
  } catch {
    return []; // malformed JSON — skip silently
  }

  const mcpServers =
    doc.mcpServers !== null && typeof doc.mcpServers === "object" && !Array.isArray(doc.mcpServers)
      ? (doc.mcpServers as Record<string, unknown>)
      : null;
  if (!mcpServers) return [];

  const allowed = requiredMcpServersForTracker(issueTracker);
  const findings: PreflightFinding[] = [];
  // Only consider servers bkit manages — never flag consumer-added MCP servers.
  for (const key of REQUIRED_MCP_SERVERS) {
    if (allowed.includes(key)) continue;
    if (!Object.prototype.hasOwnProperty.call(mcpServers, key)) continue;
    findings.push({
      id: `mcp-extra-server-${key}-${relPath.replace(/[^a-z0-9]/gi, "-")}`,
      severity: "advisory",
      detect: `${relPath} has the ${key} MCP server but the ${issueTracker} tracker does not use it.`,
      action: `[mcp] ${relPath} carries the ${key} MCP server, which is not used by the ${issueTracker} tracker. Remove the "${key}" entry from mcpServers (it is no longer needed).`,
    });
  }
  return findings;
}

// ---------------------------------------------------------------------------
// [mcp-env] advisories — direnv + .agents/.env setup (BAR-260 follow-up)
// ---------------------------------------------------------------------------

/**
 * Advisory: .agents/.env.example exists but .agents/.env does not.
 * Consumer ran `bkit install` (which seeds .env.example) but has not yet
 * copied it to .agents/.env and filled in their tokens.
 */
// `tracker` controls whether `LINEAR_API_KEY` appears in the token prose — a github/none
// repo never wires Linear, so listing the key is a false ask (issue #138). Defaults to
// `linear` (the superset) so any caller that doesn't pass a tracker still surfaces every
// token; the real Phase-3 caller passes the consumer's resolved `bkit.issueTracker`.
export function detectMissingDotenv(
  cwd: string,
  tracker: IssueTracker = "linear",
): PreflightFinding | null {
  const examplePath = path.join(cwd, ".agents", ".env.example");
  const envPath = path.join(cwd, ".agents", ".env");
  if (!fs.existsSync(examplePath)) return null;
  if (fs.existsSync(envPath)) return null;
  const tokens =
    tracker === "linear" ? "GH_TOKEN, GH_BKIT_TOKEN, LINEAR_API_KEY" : "GH_TOKEN, GH_BKIT_TOKEN";
  return {
    id: "mcp-env-missing-dotenv",
    severity: "advisory",
    detect: `.agents/.env.example exists but .agents/.env does not. MCP servers and agent tooling will not have access to ${tokens}.`,
    action: `[mcp-env] Copy .agents/.env.example to .agents/.env and fill in your tokens (${tokens}). Then run \`direnv allow\` to auto-export them into your shell. .agents/.env is gitignored and safe to commit-skip.`,
  };
}

/**
 * Advisory: .agents/.env exists but one or more required keys are blank or absent.
 * Returns one finding per missing/blank key.
 */
export function detectBlankDotenvKeys(
  cwd: string,
  tracker: IssueTracker = "linear",
): PreflightFinding[] {
  const envPath = path.join(cwd, ".agents", ".env");
  if (!fs.existsSync(envPath)) return [];

  const content = fs.readFileSync(envPath, "utf-8");
  const lines = content.split("\n");

  // Build a map of key → value from the .env file (ignore comments and blank lines)
  const kvMap = new Map<string, string>();
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    kvMap.set(key, value);
  }

  const REQUIRED_KEYS: Array<{ key: string; description: string }> = [
    {
      key: "GH_TOKEN",
      description:
        "fine-grained PAT for the GitHub MCP server and gh CLI (Contents, Pull requests, Issues, Actions, Workflows, Metadata — read/write)",
    },
    {
      key: "GH_BKIT_TOKEN",
      description:
        "classic PAT with read:packages scope for authenticating to the GitHub Packages npm registry (@cbartens/* packages)",
    },
    // LINEAR_API_KEY only matters under the Linear tracker (issue #138) — a github/none
    // repo's MCP stack never uses it, so don't flag it as a blank required key.
    ...(tracker === "linear"
      ? [
          {
            key: "LINEAR_API_KEY",
            description:
              "Linear personal API key for the Linear MCP server and the Linear preflight hook (generate at https://linear.app/settings/api)",
          },
        ]
      : []),
  ];

  const findings: PreflightFinding[] = [];
  for (const { key, description } of REQUIRED_KEYS) {
    const value = kvMap.get(key);
    if (value !== undefined && value !== "") continue;
    const reason =
      value === undefined
        ? `${key} is absent from .agents/.env`
        : `${key} is set but has an empty value in .agents/.env`;
    findings.push({
      id: `mcp-env-blank-key-${key.toLowerCase()}`,
      severity: "advisory",
      detect: `${reason}. The associated service will not authenticate.`,
      action: `[mcp-env] Set ${key} in .agents/.env — ${description}. After editing, run \`direnv allow\` (or re-enter the directory) to reload the env.`,
    });
  }
  return findings;
}

/**
 * Returns true when running in a cloud/CI environment where direnv is not
 * applicable (agent reads env vars from the platform dashboard instead).
 */
function isCloudOrCi(): boolean {
  return !!(process.env.CI || process.env.CLAUDE_CODE_REMOTE || process.env.CURSOR_REMOTE_AGENT);
}

/**
 * Advisory: direnv is not installed.
 * Short-circuits in CI / cloud environments where direnv is irrelevant.
 */
export function detectDirenvMissing(
  cwd: string,
  tracker: IssueTracker = "linear",
): PreflightFinding | null {
  if (isCloudOrCi()) return null;
  // Only meaningful when .envrc exists (seeded by bkit install)
  const envrcPath = path.join(cwd, ".envrc");
  if (!fs.existsSync(envrcPath)) return null;

  const result = spawnSync("which", ["direnv"], { encoding: "utf-8" });
  if (result.status === 0 && result.stdout.trim()) return null;
  // LINEAR_API_KEY only matters under the Linear tracker (issue #138).
  const editKeys =
    tracker === "linear" ? "GH_BKIT_TOKEN, GH_TOKEN, LINEAR_API_KEY" : "GH_BKIT_TOKEN, GH_TOKEN";
  const exportKeys =
    tracker === "linear" ? "GH_BKIT_TOKEN / GH_TOKEN / LINEAR_API_KEY" : "GH_BKIT_TOKEN / GH_TOKEN";
  return {
    id: "mcp-env-direnv-missing",
    severity: "advisory",
    detect:
      ".envrc exists but direnv is not installed. .agents/.env will not be auto-loaded into your shell.",
    action:
      "[mcp-env] direnv auto-loads .agents/.env into your shell on cd, so tokens stay scoped to the repo. Set it up:\n\n" +
      "    # 1. One-time per machine — install direnv\n" +
      "    brew install direnv                                              # macOS\n" +
      "    # Linux / other: https://direnv.net/docs/installation.html\n\n" +
      "    # 2. One-time per machine — add the shell hook, then reload\n" +
      "    echo 'eval \"$(direnv hook zsh)\"' >> ~/.zshrc && source ~/.zshrc\n" +
      "    # bash: echo 'eval \"$(direnv hook bash)\"' >> ~/.bashrc && source ~/.bashrc\n\n" +
      "    # 3. One-time per repo — copy the example, fill in tokens, allow\n" +
      "    cp .agents/.env.example .agents/.env                             # if not already done\n" +
      `    # edit .agents/.env: set ${editKeys}\n` +
      "    direnv allow\n\n" +
      `After step 3, restart Claude Code / Cursor sessions in this repo so the new env reaches their MCP servers. Alternative if you do not want direnv: export ${exportKeys} in ~/.zshrc or ~/.bashrc directly — works but leaks tokens into every shell on this machine.`,
  };
}

/**
 * Advisory: direnv is installed but the .envrc is blocked (not allowed).
 * Short-circuits in CI / cloud environments.
 */
export function detectDirenvNotAllowed(
  cwd: string,
  tracker: IssueTracker = "linear",
): PreflightFinding | null {
  if (isCloudOrCi()) return null;
  // Only meaningful when .envrc exists
  const envrcPath = path.join(cwd, ".envrc");
  if (!fs.existsSync(envrcPath)) return null;

  // Check direnv is installed first
  const whichResult = spawnSync("which", ["direnv"], { encoding: "utf-8" });
  if (whichResult.status !== 0 || !whichResult.stdout.trim()) return null;

  // Run `direnv status` and check whether the .envrc is allowed
  const statusResult = spawnSync("direnv", ["status"], {
    cwd,
    encoding: "utf-8",
    timeout: 5000,
  });
  const statusOutput = (statusResult.stdout ?? "") + (statusResult.stderr ?? "");
  // direnv status reports "Found RC allowed false" or "Found RC path ... Blocked" when not allowed
  if (
    /Found RC\s+allowed\s+false/i.test(statusOutput) ||
    /state:\s*blocked/i.test(statusOutput) ||
    /not allowed/i.test(statusOutput)
  ) {
    return {
      id: "mcp-env-direnv-not-allowed",
      severity: "advisory",
      detect:
        "direnv is installed but the .envrc in this repo is blocked. .agents/.env is not being auto-loaded.",
      action: `[mcp-env] Run \`direnv allow\` in this repo to trust the .envrc and enable auto-load of .agents/.env. direnv will then export ${tracker === "linear" ? "GH_TOKEN, GH_BKIT_TOKEN, and LINEAR_API_KEY" : "GH_TOKEN and GH_BKIT_TOKEN"} into your shell whenever you cd into the repo.`,
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// runPreflight — main Phase 1 entry point
// ---------------------------------------------------------------------------

/**
 * Read `bkit.issueTracker` from the consumer's package.json.
 * Returns the tracker value or the default ("none") when absent / unreadable.
 * Internal helper — not exported; use runPreflight's `issueTracker` param.
 */
function readConsumerIssueTrackerForPreflight(cwd: string): IssueTracker {
  const pkgPath = path.join(cwd, "package.json");
  if (!fs.existsSync(pkgPath)) return DEFAULT_ISSUE_TRACKER;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as Record<string, unknown>;
    const bkitField = pkg.bkit as Record<string, unknown> | undefined;
    const parsed = parseIssueTracker(bkitField?.issueTracker);
    return parsed ?? DEFAULT_ISSUE_TRACKER;
  } catch {
    return DEFAULT_ISSUE_TRACKER;
  }
}

/**
 * Run all Phase 1 (read-only) detectors.
 * Returns deduplicated { blockers, advisories } — intra-phase dedup by id,
 * first occurrence wins.
 *
 * cwd defaults to process.cwd(). Pass explicitly in tests.
 * installingVersion: used by detectBkitVersionMajorDowngrade; defaults to the
 * package's own version read from its package.json at runtime.
 * issueTracker: when provided, narrows tracker-specific checks (e.g. MCP server
 * requirements). When omitted, read from consumer's `bkit.issueTracker` in package.json.
 *
 * GitHub tracker gate: when `issueTracker === "github"`, the Linear preflight
 * gate is a no-op — the GitHub gate is enforced by workflow Step 1 via MCP.
 */
export function runPreflight(
  modules: Set<ModuleFlag>,
  cwd: string = process.cwd(),
  installingVersion?: string,
  issueTracker?: IssueTracker,
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

  // Resolve issueTracker: use provided value or read from consumer package.json.
  // GitHub tracker gate: when issueTracker === "github", Linear preflight is a no-op
  // (the GitHub gate is enforced by workflow Step 1 via MCP — hook is no-op).
  const resolvedTracker = issueTracker ?? readConsumerIssueTrackerForPreflight(cwd);

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

  // Phase 2: markered-text block drift advisory (BAR-167)
  // Check Group B files (partial-ownership) and key Group A files.
  // Husky hooks are Tier 3 (seed-or-print) as of v2.0.4 — their drift is handled
  // by writeTier3's `tier3-merge-suggested-*` advisory in runGitHooksModule, not here.
  const markeredTextPaths = [
    ".github/workflows/ci.yml",
    ".vale.ini",
    "AGENTS.md",
    "CLAUDE.md",
    ".gitignore",
    ".prettierignore",
  ];
  for (const relPath of markeredTextPaths) {
    const textDriftAdvisory = detectTier2TextDrift(cwd, relPath, pkgRoot);
    if (textDriftAdvisory) advisories.push(textDriftAdvisory);
  }

  const gitignoreDup = detectGitignoreBlockDuplicates(cwd);
  if (gitignoreDup) advisories.push(gitignoreDup);

  const prettierBroad = detectPrettierignoreScopeBroadening(cwd);
  if (prettierBroad) advisories.push(prettierBroad);

  const prettierignore = detectPrettierignoreNoMarkers(cwd);
  if (prettierignore) advisories.push(prettierignore);

  const lintProse = detectLintProseF9Vulnerable(cwd);
  if (lintProse) advisories.push(lintProse);

  const versionMajorDowngrade = detectBkitVersionMajorDowngrade(cwd, version);
  if (versionMajorDowngrade) advisories.push(versionMajorDowngrade);

  const versionPinStale = detectBkitVersionPinStale(cwd);
  if (versionPinStale) advisories.push(versionPinStale);

  // BAR-224: [verbose ci] marker advisories
  const verboseCiMissing = detectCiYmlVerboseCiBlockMissing(cwd);
  if (verboseCiMissing) advisories.push(verboseCiMissing);

  const playwrightReporterHostile = detectPlaywrightReporterHostile(cwd);
  if (playwrightReporterHostile) advisories.push(playwrightReporterHostile);

  const observabilityDebugFetch = detectObservabilityDebugFetchMissing(cwd);
  if (observabilityDebugFetch) advisories.push(observabilityDebugFetch);

  // Missing MCP server advisory — one finding per missing required key, per file.
  // Tracker-aware: when issueTracker === "github", only github MCP server is required
  // (Linear gate is a no-op on GitHub tracker — gate moved into workflow Step 1 via MCP).
  // Extra MCP server advisory — one finding per bkit-managed server that the
  // resolved tracker does not use (e.g. a stale `linear` entry under `github`).
  for (const relPath of [".mcp.json", ".cursor/mcp.json"]) {
    advisories.push(...detectMissingMcpServers(cwd, relPath, resolvedTracker));
    advisories.push(...detectExtraMcpServers(cwd, relPath, resolvedTracker));
  }

  // [mcp-env] detectors run in Phase 3 (runPostInstallCheck in bkit-postinstall.ts),
  // not here — Phase 1 cannot see the scaffolds (.agents/.env.example, .envrc) on
  // a first install because writes have not happened yet. Detectors stay exported
  // from this file so the postinstall module can call them.

  return {
    blockers: dedupeById(blockers),
    advisories: dedupeById(advisories),
  };
}
