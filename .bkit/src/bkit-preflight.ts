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
import { extractNamedBlocks } from "./bkit-install.js";
import { getPkgRoot, getTemplatesRoot } from "./bkit-paths.js";
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
    detect: "core install requested but .git/ directory not found — this is not a git repository.",
    action:
      "Run `git init` to initialise a git repo, then re-run. bkit installs into a git repository — its git-hooks module and managed .gitignore/.gitattributes blocks require one (core is implicit; there is no --core flag to omit).",
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
  const versionFile = path.join(cwd, ".bkit", "version");
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
  const versionFile = path.join(cwd, ".bkit", "version");

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
    detect: `node_modules/@cbartens/bkit version (${installedVersion}) is newer than .bkit/version (${onDiskVersion}). Consumer ran \`pnpm add -D @cbartens/bkit@${installedVersion}\` but did not re-run the bkit installer.`,
    action:
      "Run `pnpm bkit upgrade` to resync the .agents payload + version pin across everything you have installed, then commit the result. `pnpm add` does not run the bkit installer — bkit's payload must be re-synced after every `@cbartens/bkit` version bump.",
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
  ".bkit/advisories.md",
  ".bkit/.env",
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
 * `.bkit/templates/.prettierignore` (between `# bkit:start` and `# bkit:end`).
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
  ".bkit/.env.example",
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

// NOTE: detectCiYmlVerboseCiBlockMissing was retired once detectTier2TextDrift became
// named-block-aware. The template's `verbose-ci-env` is a named bkit-managed block, so a
// consumer missing it (or having drifted it) is now surfaced generically by the tier2-text-drift
// advisory over `.github/workflows/ci.yml` — no per-block detector needed. New bkit-owned
// fragments follow the same path: wrap them in `# bkit:start <name>` in the template and the
// generic drift advisory covers them. Per-block presence detectors are no longer added.

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
      'Drop the `--reporter=line` flag so `playwright.config.ts`\'s configured reporter chain runs (typically `[list, html, github, json]`). Verbose-aware pattern: have `test:e2e` read `VERBOSE_CI` and append `--trace=on` to its own `playwright test` call (e.g. `TRACE=; [ "$VERBOSE_CI" = "1" ] && TRACE=--trace=on; playwright test $TRACE`), then run it plainly as `pnpm test:e2e` — do NOT pass `--trace=on` through a turbo / pnpm `-- --trace=on` passthrough, which appends to the script string and breaks any test:e2e ending in a bash construct (fi / done / esac). Never pass `--reporter`. Note that `--video` and `--screenshot` are NOT Playwright CLI flags (they\'re `use:` keys in playwright.config.ts); the trace.zip already captures snapshots / network / console / source. Default-mode output stays clean via the config\'s `list` reporter.',
  };
}

/**
 * Line-anchored consumer opt-out marker for the debug-fetch advisories. A repo
 * that legitimately enables no runtime-log source places this below
 * `<!-- bkit:end -->` to dismiss both `observability-debug-fetch-missing` and
 * `observability-debug-fetch-source-not-enabled`.
 */
const DEBUG_FETCH_NONE_RE = /^<!-- debug-fetch:none(?: [^>]*)? -->$/m;

/**
 * Map of debug-fetch source name -> predicate proving THIS repo actually runs
 * that backend. Evidence-gates `observability-debug-fetch-source-not-enabled`
 * so a single-backend consumer (e.g. Vercel-only) is never nagged about a
 * backend it does not use (e.g. Supabase). A shipped example whose name has no
 * entry here is never flagged (cannot prove use => stay quiet).
 */
const DEBUG_FETCH_BACKEND_EVIDENCE: Record<string, (cwd: string) => boolean> = {
  supabase: (cwd) =>
    fs.existsSync(path.join(cwd, "supabase", "config.toml")) ||
    readDependencyNames(cwd).some((d) => d.startsWith("@supabase/")),
  vercel: (cwd) =>
    fs.existsSync(path.join(cwd, "vercel.json")) ||
    fs.existsSync(path.join(cwd, ".vercel")) ||
    readDependencyNames(cwd).includes("vercel"),
};

/** Every dependency name across the four package.json dependency fields. */
function readDependencyNames(cwd: string): string[] {
  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf-8")) as Record<
      string,
      unknown
    >;
  } catch {
    return [];
  }
  const names: string[] = [];
  for (const field of [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies",
  ]) {
    const deps = pkg[field];
    if (deps && typeof deps === "object") {
      names.push(...Object.keys(deps as Record<string, unknown>));
    }
  }
  return names;
}

/**
 * Advisory: consumer's `.agents/config.md` has the bkit-managed block (which
 * ships inert `<!-- debug-fetch:start <name> --> ... <!-- debug-fetch:end -->`
 * examples inside it) but no `debug-fetch` block AFTER `<!-- bkit:end -->`.
 *
 * `/bkit-debug`'s runtime sub-fetch runs every `debug-fetch` block occurring
 * after `<!-- bkit:end -->` (consumer section) — the examples shipped inside the
 * managed block are intentionally skipped. With no consumer-section block, no
 * runtime-log artifact (`debug-context-runtime-<name>-{ATTEMPT}.md`) is produced
 * on any debug run.
 *
 * Markers may be named (`debug-fetch:start vercel`) or unnamed (legacy). Only
 * fires when the consumer has the bkit-managed block at all; consumers who fully
 * own `.agents/config.md` (no markers) are not nagged. Dismissable with a
 * `<!-- debug-fetch:none ... -->` marker below `<!-- bkit:end -->`.
 */
export function detectObservabilityDebugFetchMissing(cwd: string): PreflightFinding | null {
  const filePath = path.join(cwd, ".agents", "config.md");
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  // Require the bkit-managed block (line-anchored `<!-- bkit:end -->`).
  const endIdx = content.search(/^<!-- bkit:end -->$/m);
  if (endIdx === -1) return null;
  const afterBkitEnd = content.slice(endIdx);
  // Consumer opt-out: dismiss when a `<!-- debug-fetch:none ... -->` marker is
  // present below `<!-- bkit:end -->` (repo legitimately enables no source).
  if (DEBUG_FETCH_NONE_RE.test(afterBkitEnd)) return null;
  // Consumer-section markers must be line-anchored to mirror the workflow's
  // `sed`/`awk` extraction (`.bkit/workflows/bkit-debug.md` Step 5). The start
  // marker carries an optional block name (`debug-fetch:start vercel`).
  const hasStart = /^<!-- debug-fetch:start(?: [\w.-]+)? -->$/m.test(afterBkitEnd);
  const hasEnd = /^<!-- debug-fetch:end -->$/m.test(afterBkitEnd);
  if (hasStart && hasEnd) return null;
  return {
    id: "observability-debug-fetch-missing",
    severity: "advisory",
    detect:
      "`.agents/config.md` has the bkit-managed block but no `<!-- debug-fetch:start [name] --> ... <!-- debug-fetch:end -->` block after `<!-- bkit:end -->`. `/bkit-debug` runs every block in that consumer section — with none, no runtime-log artifact is produced.",
    action:
      "Copy one of the named `<!-- debug-fetch:start <name> --> ... <!-- debug-fetch:end -->` example blocks (e.g. `vercel`, `supabase`) out of the bkit-managed section and paste it after `<!-- bkit:end -->`, then set its env vars. REQUIRED: set the block's non-secret selector (e.g. `VERCEL_SCOPE` / `SUPABASE_PROJECT_ID`) by uncommenting the assignment line at the top of the copied block — committing it there is what makes the block run in headless cloud agents, which never read `.bkit/.env`. For cloud `/bkit-debug`, also set the secret tokens (`VERCEL_TOKEN` / `SUPABASE_ACCESS_TOKEN`) in your Claude/Cursor dashboard (or GitHub Actions secrets) and authenticate non-interactively (env tokens, never `vercel login`). Each block self-gates (missing CLI / token => a `[debug-fetch:<name>] skipped — …` stderr breadcrumb, not an error), so enable only the sources you use; add your own block for any other log backend (`gcloud` / `aws` / `datadog`). Keep blocks read-only and idempotent — the agent customises severity / freshness / limit / target environment (e.g. Vercel preview vs production) at run-time.",
  };
}

/**
 * Advisory: `.agents/config.md` ships a NAMED debug-fetch example (e.g.
 * `supabase`) in the bkit-managed region, this repo demonstrably runs that
 * backend, yet the consumer section after `<!-- bkit:end -->` enables no block
 * for it — so `/bkit-debug` fetches no runtime logs for a source the repo uses.
 *
 * Distinct from `observability-debug-fetch-missing` (consumer section has NO
 * block at all): this targets PARTIAL enablement — the post-upgrade footgun
 * where an upgrade ships a fresh `supabase` example while the consumer section
 * still holds only a legacy `vercel` block. The two are mutually exclusive: this
 * one only runs once the consumer section already has at least one block.
 *
 * Evidence-gated to avoid nagging single-backend consumers: a source is flagged
 * only when `DEBUG_FETCH_BACKEND_EVIDENCE[name]` proves the repo runs it. A
 * source counts as enabled when its name appears anywhere in the consumer
 * section — a named marker (`debug-fetch:start supabase`) OR an unnamed block
 * body (`vercel logs`, `api.supabase.com`) — so a legacy unnamed block is not a
 * false positive. Dismissable via `<!-- debug-fetch:none ... -->` below
 * `<!-- bkit:end -->`.
 */
export function detectObservabilityDebugFetchSourceNotEnabled(
  cwd: string,
): PreflightFinding | null {
  const filePath = path.join(cwd, ".agents", "config.md");
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  const endIdx = content.search(/^<!-- bkit:end -->$/m);
  if (endIdx === -1) return null;
  const managed = content.slice(0, endIdx);
  const consumer = content.slice(endIdx);
  // Consumer opt-out marker dismisses the advisory.
  if (DEBUG_FETCH_NONE_RE.test(consumer)) return null;
  // Only PARTIAL enablement: when the consumer section has no block at all,
  // `observability-debug-fetch-missing` owns that case (avoid double-firing).
  const hasStart = /^<!-- debug-fetch:start(?: [\w.-]+)? -->$/m.test(consumer);
  const hasEnd = /^<!-- debug-fetch:end -->$/m.test(consumer);
  if (!(hasStart && hasEnd)) return null;
  // Named example sources shipped in the bkit-managed region.
  const shipped = new Set<string>();
  for (const m of managed.matchAll(/^<!-- debug-fetch:start ([\w.-]+) -->$/gm)) {
    shipped.add(m[1]!);
  }
  if (shipped.size === 0) return null;
  const consumerLower = consumer.toLowerCase();
  const missing = [...shipped].filter((name) => {
    const evidence = DEBUG_FETCH_BACKEND_EVIDENCE[name];
    if (!evidence || !evidence(cwd)) return false; // no proof the repo runs it
    return !consumerLower.includes(name.toLowerCase()); // name absent below bkit:end
  });
  if (missing.length === 0) return null;
  const names = missing.join(", ");
  const slash = missing.join("/");
  const plural = missing.length > 1;
  return {
    id: "observability-debug-fetch-source-not-enabled",
    severity: "advisory",
    detect: `\`.agents/config.md\` ships ${plural ? "" : "a "}debug-fetch example${plural ? "s" : ""} for ${names} in the bkit-managed region and this repo uses ${plural ? "those backends" : "that backend"}, but no ${slash} block is enabled after \`<!-- bkit:end -->\`. \`/bkit-debug\` will fetch no ${slash} runtime logs.`,
    action: `Copy the \`<!-- debug-fetch:start ${missing[0]} --> ... <!-- debug-fetch:end -->\` block${plural ? "s" : ""} (${names}) out of the bkit-managed section to after \`<!-- bkit:end -->\`, then set each block's env vars — including committing each block's non-secret selector (e.g. \`VERCEL_SCOPE\` / \`SUPABASE_PROJECT_ID\`) by uncommenting the assignment line at the top of the block, so it runs in headless cloud agents too (they never read \`.bkit/.env\`). Each block self-gates (missing CLI / token => a \`[debug-fetch:<name>] skipped — …\` stderr breadcrumb, not an error). If you do not use ${slash} for runtime logs, add \`<!-- debug-fetch:none intentional -->\` below \`<!-- bkit:end -->\` to dismiss. Do not edit above \`<!-- bkit:end -->\` (drift-gated).`,
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
  const templatePath = path.join(getTemplatesRoot(), relPath);
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
  void pkgRoot; // signature kept for call-site compatibility; templates resolve via getTemplatesRoot
  const absPath = path.join(cwd, relPath);
  const templatePath = path.join(getTemplatesRoot(), relPath);
  if (!fs.existsSync(absPath) || !fs.existsSync(templatePath)) return null;

  const consumerContent = fs.readFileSync(absPath, "utf-8");
  const templateContent = fs.readFileSync(templatePath, "utf-8");

  // Every named (and the default unnamed) bkit-managed block in the TEMPLATE is the
  // authoritative scope. Compare each against the consumer's same-named block:
  //   - consumer lacks it  → "missing"  (unless the template marks the block `optional`)
  //   - consumer has it but content differs → "drifted"
  // Content OUTSIDE bkit:start/bkit:end is consumer-owned and never compared, so a
  // freely-edited Tier-3 file only trips on its bkit-owned regions — no false positives.
  const templateBlocks = extractNamedBlocks(templateContent);
  if (templateBlocks.size === 0) return null; // template owns no marked region in this file

  const consumerBlocks = extractNamedBlocks(consumerContent);
  // Consumer carries no bkit markers at all → fully consumer-owned (markers-missing case),
  // or has only the bare wrapper of a different file shape. Never flag a file the consumer
  // wrote without bkit markers (this also keeps bkit's own marker-free ci.yml out of scope).
  if (consumerBlocks.size === 0) return null;

  const missing: string[] = [];
  const drifted: string[] = [];
  for (const [name, tBlock] of templateBlocks) {
    const label = name || "(default block)";
    const cBlock = consumerBlocks.get(name);
    if (!cBlock) {
      if (!tBlock.optional) missing.push(label);
      continue;
    }
    if (cBlock.body !== tBlock.body) drifted.push(label);
  }

  if (missing.length === 0 && drifted.length === 0) return null;

  const parts = [...missing.map((n) => `missing: ${n}`), ...drifted.map((n) => `drifted: ${n}`)];
  const details = parts.slice(0, 6).join("; ");
  const more = parts.length > 6 ? ` (+${parts.length - 6} more)` : "";
  return {
    id: "tier2-text-drift",
    severity: "advisory",
    detect: `${relPath} has bkit-managed block(s) that differ from the shipped template — ${details}${more}.`,
    action:
      `Re-sync the bkit-managed block(s) in ${relPath} from .bkit/templates/${relPath} ` +
      "(run `pnpm bkit install`, or copy the block between its `bkit:start`/`bkit:end` markers). " +
      "Content outside the markers is preserved. A block marked `bkit:start <name> optional` may be " +
      "deleted (markers included) without this warning.",
  };
}

/**
 * Blocker: consumer's .bkit-version pinnedVersion < 0.8.0 AND no __bkit__ envelope.
 * This means the consumer is on a pre-envelope Tier-1 install and must route
 * through bkit v1.x before upgrading directly to v2.0.0.
 */
export function detectPreEnvelopeBkitVersion(cwd: string): PreflightFinding | null {
  const versionFilePath = path.join(cwd, ".bkit", "version");
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
// [mcp-env] advisories — direnv + .bkit/.env setup (BAR-260 follow-up)
// ---------------------------------------------------------------------------

/**
 * Advisory: .bkit/.env.example exists but .bkit/.env does not.
 * Consumer ran `bkit install` (which seeds .env.example) but has not yet
 * copied it to .bkit/.env and filled in their tokens.
 */
// `tracker` controls whether `LINEAR_API_KEY` appears in the token prose — a github/none
// repo never wires Linear, so listing the key is a false ask (issue #138). Defaults to
// `linear` (the superset) so any caller that doesn't pass a tracker still surfaces every
// token; the real Phase-3 caller passes the consumer's resolved `bkit.issueTracker`.
export function detectMissingDotenv(
  cwd: string,
  tracker: IssueTracker = "linear",
): PreflightFinding | null {
  const examplePath = path.join(cwd, ".bkit", ".env.example");
  const envPath = path.join(cwd, ".bkit", ".env");
  if (!fs.existsSync(examplePath)) return null;
  if (fs.existsSync(envPath)) return null;
  const tokens =
    tracker === "linear"
      ? "GH_BKIT_TOKEN, GH_BKIT_TOKEN_INSTALL, LINEAR_API_KEY"
      : "GH_BKIT_TOKEN, GH_BKIT_TOKEN_INSTALL";
  return {
    id: "mcp-env-missing-dotenv",
    severity: "advisory",
    detect: `.bkit/.env.example exists but .bkit/.env does not. MCP servers and agent tooling will not have access to ${tokens}.`,
    action: `[mcp-env] Copy .bkit/.env.example to .bkit/.env and fill in your tokens (${tokens}). Then run \`direnv allow\` to auto-export them into your shell. .bkit/.env is gitignored and safe to commit-skip.`,
  };
}

/**
 * Advisory: .bkit/.env exists but one or more required keys are blank or absent.
 * Returns one finding per missing/blank key.
 */
export function detectBlankDotenvKeys(
  cwd: string,
  tracker: IssueTracker = "linear",
): PreflightFinding[] {
  const envPath = path.join(cwd, ".bkit", ".env");
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
      key: "GH_BKIT_TOKEN",
      description:
        "fine-grained PAT for the GitHub MCP server (Contents, Pull requests, Issues, Actions, Workflows, Metadata — read/write)",
    },
    {
      key: "GH_BKIT_TOKEN_INSTALL",
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
        ? `${key} is absent from .bkit/.env`
        : `${key} is set but has an empty value in .bkit/.env`;
    findings.push({
      id: `mcp-env-blank-key-${key.toLowerCase()}`,
      severity: "advisory",
      detect: `${reason}. The associated service will not authenticate.`,
      action: `[mcp-env] Set ${key} in .bkit/.env — ${description}. After editing, run \`direnv allow\` (or re-enter the directory) to reload the env.`,
    });
  }
  return findings;
}

/**
 * Advisory: `bkit` is not on PATH.
 * bkit is a devDependency — without a shell alias, every invocation requires
 * `pnpm bkit <verb>` or `pnpm exec bkit <verb>`. Suggest the one-line alias.
 * Short-circuits in CI / cloud environments where the alias is irrelevant.
 */
export function detectBkitNotOnPath(): PreflightFinding | null {
  if (isCloudOrCi()) return null;
  const result = spawnSync("which", ["bkit"], { encoding: "utf-8" });
  if (result.status === 0 && result.stdout.trim()) return null;
  return {
    id: "bkit-not-on-path",
    severity: "advisory",
    detect:
      "`bkit` is not on PATH — commands must be run as `pnpm bkit <verb>` or `pnpm exec bkit <verb>`.",
    action:
      "[bkit] Add a shell alias so you can type `bkit <verb>` directly. Add to ~/.zshrc (or ~/.bashrc), then reload:\n\n" +
      "    alias bkit='pnpm bkit'\n" +
      "    source ~/.zshrc\n\n" +
      "For `bkit cursor` / `bkit opencode` (GUI app launchers), run from the repo root in\n" +
      "an external terminal (Terminal.app / iTerm2) — not from inside the running app.",
  };
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
    tracker === "linear"
      ? "GH_BKIT_TOKEN_INSTALL, GH_BKIT_TOKEN, LINEAR_API_KEY"
      : "GH_BKIT_TOKEN_INSTALL, GH_BKIT_TOKEN";
  const exportKeys =
    tracker === "linear"
      ? "GH_BKIT_TOKEN_INSTALL / GH_BKIT_TOKEN / LINEAR_API_KEY"
      : "GH_BKIT_TOKEN_INSTALL / GH_BKIT_TOKEN";
  return {
    id: "mcp-env-direnv-missing",
    severity: "advisory",
    detect:
      ".envrc exists but direnv is not installed. .bkit/.env will not be auto-loaded into your shell.",
    action:
      "[mcp-env] direnv auto-loads .bkit/.env into your shell on cd, so tokens stay scoped to the repo. Set it up:\n\n" +
      "    # 1. One-time per machine — install direnv\n" +
      "    brew install direnv                                              # macOS\n" +
      "    # Linux / other: https://direnv.net/docs/installation.html\n\n" +
      "    # 2. One-time per machine — add the shell hook, then reload\n" +
      "    echo 'eval \"$(direnv hook zsh)\"' >> ~/.zshrc && source ~/.zshrc\n" +
      "    # bash: echo 'eval \"$(direnv hook bash)\"' >> ~/.bashrc && source ~/.bashrc\n\n" +
      "    # 3. One-time per repo — copy the example, fill in tokens, allow\n" +
      "    cp .bkit/.env.example .bkit/.env                             # if not already done\n" +
      `    # edit .bkit/.env: set ${editKeys}\n` +
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
        "direnv is installed but the .envrc in this repo is blocked. .bkit/.env is not being auto-loaded.",
      action: `[mcp-env] Run \`direnv allow\` in this repo to trust the .envrc and enable auto-load of .bkit/.env. direnv will then export ${tracker === "linear" ? "GH_BKIT_TOKEN, GH_BKIT_TOKEN_INSTALL, and LINEAR_API_KEY" : "GH_BKIT_TOKEN and GH_BKIT_TOKEN_INSTALL"} into your shell whenever you cd into the repo.`,
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

  const playwrightReporterHostile = detectPlaywrightReporterHostile(cwd);
  if (playwrightReporterHostile) advisories.push(playwrightReporterHostile);

  const observabilityDebugFetch = detectObservabilityDebugFetchMissing(cwd);
  if (observabilityDebugFetch) advisories.push(observabilityDebugFetch);

  const observabilityDebugFetchSource = detectObservabilityDebugFetchSourceNotEnabled(cwd);
  if (observabilityDebugFetchSource) advisories.push(observabilityDebugFetchSource);

  // bkit-not-on-path advisory — suggest the shell alias for local development.
  const bkitNotOnPath = detectBkitNotOnPath();
  if (bkitNotOnPath) advisories.push(bkitNotOnPath);

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
  // not here — Phase 1 cannot see the scaffolds (.bkit/.env.example, .envrc) on
  // a first install because writes have not happened yet. Detectors stay exported
  // from this file so the postinstall module can call them.

  return {
    blockers: dedupeById(blockers),
    advisories: dedupeById(advisories),
  };
}
