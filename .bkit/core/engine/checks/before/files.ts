// checks/before/files.ts — consumer files bkit shares: `.gitignore` block duplicates, a hostile
// Playwright reporter, managed-text and managed-JSON drift.

import * as fs from "node:fs";
import * as path from "node:path";
import { deepContains, type JsonValue } from "../../install/write.js";
import { extractManagedBlock, stripManagedBlock } from "../../install/managed-block.js";
import { readTemplate } from "../../render/parts.js";
import { findTemplateSource, getPkgRoot } from "../../shared/package-roots.js";
import { parseJson } from "../../shared/json.js";
import { ciWorkflowPath } from "../../shared/settings.js";
import type { PreflightFinding } from "./index.js";

/**
 * Strip out content inside bkit-managed block markers (HTML and slash style).
 * Used by detectors that need to inspect only consumer-owned content.
 *
 * Uses line-anchored marker detection (via stripManagedBlock from install/managed-block.ts; KN-8).
 * Applies both marker styles sequentially: `<!-- bkit:start -->` and `// bkit:start`.
 */
export function stripBkitBlock(content: string): string {
  return stripManagedBlock(stripManagedBlock(content, "html-comment"), "slash-comment");
}

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
  ".bkit/core",
  ".bkit/shared",
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

// ---------------------------------------------------------------------------
// Phase 1 JSON advisories / blockers (BAR-167)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// [verbose ci] marker advisories (BAR-224)
// ---------------------------------------------------------------------------

// No presence detector for the bkit-ci.yml verbose-CI `env:`: bkit-ci.yml is the
// consumer's copy of a template, so bkit never checks it.

/**
 * Advisory: consumer's Playwright invocation passes `--reporter=line`, which
 * overrides the configured reporter chain in `playwright.config.ts`. Under
 * `[verbose ci]` with `--trace=on`, this writes trace artifacts that no reporter
 * surfaces — pure cost (artifact upload + storage) with zero diagnostic payoff.
 *
 * "Hostile" gap per the BAR-224 signal-vs-noise classification. Reads the consumer's
 * own CI workflow (`bkit.testing.ciWorkflow`, default `bkit-ci.yml`), active lines only: YAML comment lines are dropped first, so a commented
 * template stub or a commented-out example never fires.
 */
export function detectPlaywrightReporterHostile(cwd: string): PreflightFinding | null {
  const ciRel = ciWorkflowPath(cwd);
  const ciPath = path.join(cwd, ciRel);
  if (!fs.existsSync(ciPath)) return null;
  const content = fs.readFileSync(ciPath, "utf-8");
  // Filter out YAML comment lines (those starting with optional whitespace + `#`) before
  // matching: bkit-shipped commented stubs and commented-out consumer examples never fire.
  // Not `stripBkitBlock`: its strict line-anchored marker detection misses indented YAML
  // markers.
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
    detect: `${ciRel} has a \`playwright test\` invocation that passes \`--reporter=line\`. Under \`[verbose ci]\` with \`--trace=on\`, trace artifacts are written but no reporter surfaces them — pure cost.`,
    action:
      'Drop the `--reporter=line` flag so `playwright.config.ts`\'s configured reporter chain runs (typically `[list, html, github, json]`). Verbose-aware pattern: have `test:e2e` read `VERBOSE_CI` and append `--trace=on` to its own `playwright test` call (e.g. `TRACE=; [ "$VERBOSE_CI" = "1" ] && TRACE=--trace=on; playwright test $TRACE`), then run it plainly as `pnpm test:e2e` — do NOT pass `--trace=on` through a turbo / pnpm `-- --trace=on` passthrough, which appends to the script string and breaks any test:e2e ending in a bash construct (fi / done / esac). Never pass `--reporter`. Note that `--video` and `--screenshot` are NOT Playwright CLI flags (they\'re `use:` keys in playwright.config.ts); the trace.zip already captures snapshots / network / console / source. Default-mode output stays clean via the config\'s `list` reporter.',
  };
}

/**
 * Advisory: detect when a JSON file is missing content the template owns.
 * Runs deepContains(template, consumerFile) — fires when ok=false.
 * Severity: advisory.
 */
export function detectTier2JsonDrift(cwd: string, relPath: string): PreflightFinding | null {
  const absPath = path.join(cwd, relPath);
  const templatePath = findTemplateSource(relPath);
  if (!fs.existsSync(absPath) || templatePath === null || !fs.existsSync(templatePath)) return null;
  // Malformed JSON on either side is handled elsewhere; a parse failure is not drift.
  const consumerParsed = parseJson(fs.readFileSync(absPath, "utf-8"));
  const templateParsed = parseJson(fs.readFileSync(templatePath, "utf-8"));
  if (!consumerParsed.ok || !templateParsed.ok) return null;
  const consumerDoc = consumerParsed.value as JsonValue;
  const templateDoc = templateParsed.value as JsonValue;
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
 * Advisory: detect when a markered-text file's bkit-managed block is missing a line the
 * template's block carries.
 *
 * Fires when the consumer file and the template both carry a bkit-managed block and the
 * consumer block lacks a required template line. A consumer file without markers is
 * consumer-owned and never flagged. Content outside the markers is never compared.
 */
export function detectTier2TextDrift(cwd: string, relPath: string): PreflightFinding | null {
  const absPath = path.join(cwd, relPath);
  const templatePath = findTemplateSource(relPath);
  if (!fs.existsSync(absPath) || templatePath === null || !fs.existsSync(templatePath)) return null;

  const templateBlock = extractManagedBlock(readTemplate(templatePath));
  if (templateBlock === null) return null;
  const consumerBlock = extractManagedBlock(fs.readFileSync(absPath, "utf-8"));
  if (consumerBlock === null) return null;

  // Significant lines = load-bearing block content: non-blank, non-comment, trimmed (indentation
  // is not semantic). Comment lines never trip drift.
  const significantLines = (body: string): string[] =>
    body
      .split("\n")
      .map((l) => l.trim())
      .filter(
        (t) => t !== "" && !t.startsWith("#") && !t.startsWith("//") && !t.startsWith("<!--"),
      );

  // A required line is real bkit content the consumer must retain. A bare YAML mapping key (`env:`)
  // is structural scaffolding. A `{{TOKEN}}` line renders per-consumer, so it can never be matched
  // literally. Neither counts as content for drift. (`${{ … }}` is a GitHub Actions expression,
  // NOT a bkit token — the negative lookbehind keeps those enforced.)
  const isStructural = (line: string): boolean => /^[A-Za-z0-9_.-]+:$/.test(line);
  const hasBkitToken = (line: string): boolean => /(?<!\$)\{\{[^}]+\}\}/.test(line);

  // Subset / presence: the block drifts only if the consumer is MISSING a required bkit line.
  // Extras, reordering, re-indentation and comments are all fine.
  const consumerLines = new Set(significantLines(consumerBlock));
  const dropped = significantLines(templateBlock).filter(
    (l) => !isStructural(l) && !hasBkitToken(l) && !consumerLines.has(l),
  );
  if (dropped.length === 0) return null;

  return {
    id: "tier2-text-drift",
    severity: "advisory",
    detect: `${relPath} has a bkit-managed block missing ${dropped.length} line(s) of the shipped template.`,
    action:
      `Re-sync the bkit-managed block in ${relPath} from ${path.relative(getPkgRoot(), templatePath)} ` +
      "(run `pnpm bkit install`, or copy the block between its `bkit:start`/`bkit:end` markers). " +
      "Content outside the markers is preserved.",
  };
}

/**
 * Consumer files whose bkit-managed blocks `detectTier2TextDrift` compares (partial
 * ownership: bkit's block, the consumer's rest). Templates are the consumer's files and
 * are never compared. Exported so tests can reference it without duplication.
 */
export const MARKERED_TEXT_DRIFT_PATHS: readonly string[] = [
  "AGENTS.md",
  "CLAUDE.md",
  ".gitignore",
];
