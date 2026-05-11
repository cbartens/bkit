// lint-no-tier-terms.ts — Phase 3 regression guard (BAR-167 sub-plan C Task 28)
//
// Searches docs/ and .agents/scripts/*.ts for "Tier [123]" / "Tier-[123]" strings.
// Exits 0 when no non-excluded matches found. Exits 1 with a diagnostic when any
// non-excluded match is found.
//
// Exclusions are encoded as { file, sectionRegex } tuples. When a line is inside
// an excluded section (between the sectionRegex header and the next ## header),
// it is skipped. This prevents the exclusion from being file-level (which would
// let regressions hide in NEW locations inside excluded files).
//
// Excluded historical entries (retain superseded context):
//   docs/decisions.md   — DE-5, DE-7, DE-8 sections
//   docs/knowledge.md   — KN-8, KN-13 sections
//   docs/completed.md   — entire file (historical ship summaries describe past design)
//   docs/plans/         — entire subtree (plan/archive artifacts, immutable post-ship)
//
// Usage: npx tsx .agents/scripts/lint-no-tier-terms.ts
// Or via package.json: pnpm lint:no-tier-terms
import * as fs from "node:fs";
import * as path from "node:path";
// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const TIER_PATTERN = /Tier[ -][123]/;
const ROOT = path.resolve(import.meta.dirname ?? __dirname, "../..");
const SECTION_EXCLUSIONS = [
    {
        file: path.join(ROOT, "docs/decisions.md"),
        sectionRegex: /^## DE-(5|7|8)\b/,
    },
    {
        file: path.join(ROOT, "docs/knowledge.md"),
        sectionRegex: /^## KN-(8|13)\b/,
    },
];
const FILE_EXCLUSIONS = [
    { file: path.join(ROOT, "docs/completed.md"), entireFile: true },
];
// ---------------------------------------------------------------------------
// Target paths to scan
// ---------------------------------------------------------------------------
// Scope: docs/ only (source file Tier-terminology is internal implementation
// comments not within the Phase 3 sweep scope — see DE-16 / bkit-tiers.ts doc-block).
const SCAN_DIRS = [path.join(ROOT, "docs")];
const SCAN_EXTENSIONS = new Set([".md"]);
// Exclude plans subtree (immutable archive artifacts)
const EXCLUDE_DIR_PREFIXES = [path.join(ROOT, "docs/plans")];
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function collectFiles(dir) {
    const results = [];
    if (!fs.existsSync(dir))
        return results;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!EXCLUDE_DIR_PREFIXES.some((prefix) => fullPath.startsWith(prefix))) {
                results.push(...collectFiles(fullPath));
            }
        }
        else if (entry.isFile() && SCAN_EXTENSIONS.has(path.extname(entry.name))) {
            results.push(fullPath);
        }
    }
    return results;
}
/**
 * Returns true if the line at lineIndex in `lines` is inside an excluded section.
 * An excluded section starts when a line matches sectionRegex and ends at the
 * next `## ` heading (exclusive).
 */
function isInExcludedSection(lines, lineIndex, exclusion) {
    // Walk backwards to find the nearest section heading at or before lineIndex.
    let sectionStart = -1;
    for (let i = lineIndex; i >= 0; i--) {
        if (/^## /.test(lines[i])) {
            sectionStart = i;
            break;
        }
    }
    if (sectionStart === -1)
        return false;
    return exclusion.sectionRegex.test(lines[sectionStart]);
}
// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const files = SCAN_DIRS.flatMap(collectFiles);
let failCount = 0;
const failLines = [];
for (const filePath of files) {
    // Check file-level exclusions
    const fileExcluded = FILE_EXCLUSIONS.some((ex) => ex.file === filePath);
    if (fileExcluded)
        continue;
    // Determine applicable section exclusions for this file
    const sectionExclusions = SECTION_EXCLUSIONS.filter((ex) => ex.file === filePath);
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!TIER_PATTERN.test(line))
            continue;
        // Check section exclusions
        const excluded = sectionExclusions.some((ex) => isInExcludedSection(lines, i, ex));
        if (excluded)
            continue;
        const rel = path.relative(ROOT, filePath);
        failLines.push(`  ${rel}:${i + 1}: ${line.trim()}`);
        failCount++;
    }
}
if (failCount > 0) {
    console.error(`[lint:no-tier-terms] Tier 1/2/3 terminology found — Phase 3 cleanup regression (${failCount} match${failCount === 1 ? "" : "es"}):`);
    for (const line of failLines) {
        console.error(line);
    }
    process.exit(1);
}
else {
    console.log("[lint:no-tier-terms] OK — no Tier 1/2/3 terminology outside excluded historical entries.");
    process.exit(0);
}
