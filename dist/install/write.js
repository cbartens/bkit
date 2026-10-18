import * as fs from "node:fs";
import * as path from "node:path";
import { updateManagedBlock, extractFullManagedBlock, extractManagedBlock, findLineAnchoredMarkers, findUnmarkedCopy, selectMarkers, } from "./managed-block.js";
import { readTemplate } from "../render/parts.js";
import { applyTokens } from "./placeholders.js";
import { sha256 } from "./version-file.js";
export function deepContains(template, consumer, pathPrefix = "") {
    const missing = [];
    const mismatched = [];
    // null template: owns nothing → ok
    if (template === null) {
        return { ok: true, missing, mismatched };
    }
    // non-null template, null consumer → missing
    if (consumer === null) {
        missing.push(pathPrefix || "<root>");
        return { ok: false, missing, mismatched };
    }
    // Both are arrays
    if (Array.isArray(template) && Array.isArray(consumer)) {
        _deepContainsArray(template, consumer, pathPrefix, missing);
        return { ok: missing.length === 0 && mismatched.length === 0, missing, mismatched };
    }
    // Type mismatch (one is array, other is not, or different primitive types)
    if (Array.isArray(template) !== Array.isArray(consumer)) {
        mismatched.push(pathPrefix || "<root>");
        return { ok: false, missing, mismatched };
    }
    // Both are plain objects
    if (typeof template === "object" && typeof consumer === "object") {
        const tObj = template;
        const cObj = consumer;
        for (const key of Object.keys(tObj)) {
            const childPath = pathPrefix ? `${pathPrefix}.${key}` : key;
            const tVal = tObj[key];
            const cVal = cObj[key];
            if (cVal === undefined) {
                // If template has null for this key, still ok
                if (tVal === null)
                    continue;
                missing.push(childPath);
            }
            else {
                const sub = deepContains(tVal, cVal, childPath);
                missing.push(...sub.missing);
                mismatched.push(...sub.mismatched);
            }
        }
        return { ok: missing.length === 0 && mismatched.length === 0, missing, mismatched };
    }
    // Both are primitives — exact equality
    if (template !== consumer) {
        mismatched.push(pathPrefix || "<root>");
        return { ok: false, missing, mismatched };
    }
    return { ok: true, missing, mismatched };
}
function _deepContainsArray(template, consumer, pathPrefix, missing) {
    // Classify template elements as primitive or object
    for (let i = 0; i < template.length; i++) {
        const tEl = template[i];
        const elPath = pathPrefix ? `${pathPrefix}[${i}]` : `[${i}]`;
        if (tEl === null || typeof tEl !== "object") {
            // Primitive — subset: consumer must contain this value
            if (!consumer.includes(tEl)) {
                missing.push(elPath);
            }
        }
        else if (Array.isArray(tEl)) {
            // Nested array element — must find an equal consumer element
            const found = consumer.some((cEl) => Array.isArray(cEl) && deepContains(tEl, cEl, "").ok);
            if (!found) {
                missing.push(elPath);
            }
        }
        else {
            // Object element — order-insensitive deep-equal containment
            const found = consumer.some((cEl) => cEl !== null &&
                typeof cEl === "object" &&
                !Array.isArray(cEl) &&
                deepContains(tEl, cEl, "").ok);
            if (!found) {
                missing.push(elPath);
            }
        }
    }
}
// ---------------------------------------------------------------------------
// deepMergeJson — recursive JSON merge primitive (P3.T1)
//
// Semantics (from DE-8 contract spec):
//   - Objects: merge recursively (override keys win; base keys retained if absent from override)
//   - Arrays: override replaces base (no concat — arrays are treated as atomic values)
//   - Primitives / null: override replaces base
// ---------------------------------------------------------------------------
export function deepMergeJson(base, override) {
    if (override === null || typeof override !== "object" || Array.isArray(override)) {
        return override;
    }
    if (base === null || typeof base !== "object" || Array.isArray(base)) {
        // base is not a plain object — override wins wholesale
        return override;
    }
    // Both are plain objects — recursive merge.
    //
    // Key ORDER follows `override` (the bkit template) for keys it defines, then appends
    // base-only (consumer) keys. Order-significant maps like opencode's last-match-wins
    // `permission.bash` keep the template's order (`git push --force-with-lease*: allow`
    // stays after `git push --force*: deny`).
    const baseObj = base;
    const overrideObj = override;
    const result = {};
    // 1. Template keys first, in template order (recurse where both sides are plain objects).
    for (const [key, val] of Object.entries(overrideObj)) {
        const baseVal = baseObj[key];
        if (key in baseObj &&
            baseVal !== null &&
            typeof baseVal === "object" &&
            !Array.isArray(baseVal) &&
            val !== null &&
            typeof val === "object" &&
            !Array.isArray(val)) {
            result[key] = deepMergeJson(baseVal, val);
        }
        else {
            result[key] = val;
        }
    }
    // 2. Consumer-only keys preserved, appended after the template's keys.
    for (const [key, val] of Object.entries(baseObj)) {
        if (!(key in result)) {
            result[key] = val;
        }
    }
    return result;
}
// ---------------------------------------------------------------------------
// MCP tracker entry — bkit owns the template's parts of the entry, not the whole entry (#613)
//
//   - every key the template sets is reset to the template's value
//   - `headers["X-MCP-Toolsets"]` keeps the consumer's list and appends any template toolset
//     it lacks, so a consumer can enable extra toolsets and a toolset bkit adds still lands
//   - every other consumer key, header and toolset is kept
// ---------------------------------------------------------------------------
export const MCP_TOOLSETS_HEADER = "X-MCP-Toolsets";
/** Split an `X-MCP-Toolsets` value into toolset names (trimmed, empties dropped). */
export function parseToolsets(value) {
    return value
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");
}
/** True for a JSON object (not null, not an array). */
export function isJsonObject(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v);
}
/** Merge bkit's tracker entry `owned` into the consumer's `existing` entry (rules above). */
export function mergeTrackerEntry(existing, owned) {
    if (!isJsonObject(existing) || !isJsonObject(owned))
        return owned;
    const merged = deepMergeJson(existing, owned);
    const ownedHeaders = owned.headers;
    const existingHeaders = existing.headers;
    if (isJsonObject(ownedHeaders) && isJsonObject(existingHeaders)) {
        const ownedSets = ownedHeaders[MCP_TOOLSETS_HEADER];
        const existingSets = existingHeaders[MCP_TOOLSETS_HEADER];
        if (typeof ownedSets === "string" && typeof existingSets === "string") {
            const have = parseToolsets(existingSets);
            const missing = parseToolsets(ownedSets).filter((t) => !have.includes(t));
            merged.headers[MCP_TOOLSETS_HEADER] =
                missing.length === 0 ? existingSets : [...have, ...missing].join(",");
        }
    }
    return merged;
}
/** True when `existing` already holds everything `mergeTrackerEntry` would write. */
export function trackerEntryInSync(existing, owned) {
    if (existing === undefined)
        return false;
    return deepContains(mergeTrackerEntry(existing, owned), existing).ok;
}
// ---------------------------------------------------------------------------
// writeTier2JsonContained — deep-containment JSON helper (BAR-167 Phase 1)
//
// Contract:
//   - dest absent         → write template as-is (first install)
//   - dest present, valid JSON, template contained → no-op (idempotent)
//   - dest present, valid JSON, containment fails → deepMergeJson(existing, template)
//     (template wins on key collisions; consumer-only keys outside template tree preserved)
//   - dest present, malformed JSON → throw; the consumer fixes it by hand
//   - schemaFlipped: true when a path value changed type during deep-merge
// ---------------------------------------------------------------------------
export function writeTier2JsonContained(srcPath, dstPath, dryRun, ws) {
    const srcRaw = fs.readFileSync(srcPath, "utf-8");
    let template;
    try {
        template = JSON.parse(srcRaw);
    }
    catch {
        throw new Error(`writeTier2JsonContained: template at ${srcPath} is not valid JSON`);
    }
    if (!fs.existsSync(dstPath)) {
        // First install — write template as-is
        ensureDir(path.dirname(dstPath));
        if (!dryRun) {
            fs.writeFileSync(dstPath, JSON.stringify(template, null, 2) + "\n", "utf-8");
            const srcMode = fs.statSync(srcPath).mode;
            fs.chmodSync(dstPath, srcMode);
        }
        ws.writes.push({ path: dstPath, action: "write" });
        return;
    }
    // dest exists — read and check containment
    const dstRaw = fs.readFileSync(dstPath, "utf-8");
    let existing;
    try {
        existing = JSON.parse(dstRaw);
    }
    catch {
        // Malformed destination — refuse to overwrite; require manual fix (matches malformed-package-json blocker discipline)
        throw new Error(`[bkit] ${dstPath} is malformed JSON — fix manually before running bkit install`);
    }
    // Check if existing already contains the template
    const containsResult = deepContains(template, existing);
    if (containsResult.ok) {
        return; // idempotent — no change needed
    }
    // Deep-merge: existing base, template override (template wins on conflicts)
    const merged = deepMergeJson(existing, template);
    const mergedStr = JSON.stringify(merged, null, 2) + "\n";
    if (mergedStr === dstRaw)
        return; // idempotent guard
    if (!dryRun) {
        fs.writeFileSync(dstPath, mergedStr, "utf-8");
    }
    ws.writes.push({ path: dstPath, action: "update" });
}
// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
export function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}
// ---------------------------------------------------------------------------
// fully-managed format — idempotent rewrite of whole file after token substitution
//
// Semantics: always writes the src content (with tokens applied) to dst.
// If dst exists with identical content, no-op (no double-count in WriteSet).
// ---------------------------------------------------------------------------
export function writeTier1(srcPath, dstPath, tokens, dryRun, ws) {
    const srcRaw = readTemplate(srcPath);
    const srcContent = applyTokens(srcRaw, tokens);
    if (fs.existsSync(dstPath)) {
        const existing = fs.readFileSync(dstPath, "utf-8");
        if (existing === srcContent)
            return; // identical — no-op
    }
    ensureDir(path.dirname(dstPath));
    if (!dryRun) {
        fs.writeFileSync(dstPath, srcContent, "utf-8");
        // Preserve executable bit from src
        const srcMode = fs.statSync(srcPath).mode;
        fs.chmodSync(dstPath, srcMode);
    }
    ws.writes.push({ path: dstPath, action: "write" });
}
// ---------------------------------------------------------------------------
// markered-text format — managed-block (bkit owns content between markers; consumer owns rest)
//
// Semantics:
//   - dest absent            → write whole file (with token substitution)
//   - dest has markers       → update only the bkit block (tokens applied to new block content)
//   - dest present, no marks → append full block at EOF; preserve consumer content above
//   - no marks, markdown dest already holds an unmarked copy of the block (findUnmarkedCopy)
//                            → warn + skip; appending would leave a frozen duplicate above it
//
// markerStyle: "html-comment" for markdown, shell and `.gitignore` (`# ` prefix allowed);
// "slash-comment" for JS.
// ---------------------------------------------------------------------------
/**
 * sha256 of the driver (everything outside the managed block) of hook files a bkit
 * release shipped with a host contract the host does not accept, keyed by consumer path.
 * Register: docs/migrations.md.
 */
export const RETIRED_DRIVER_HASHES = {
    // 5.1.0: Claude-shaped `hookSpecificOutput`; Antigravity reads `{ decision, reason }`.
    ".agents/plugins/bkit/hooks/bkit-gateguard.cjs": [
        "544dbcc2bab81875789563a2925bb5dc7b5dbbcf185f216fb3281cfa01ec030d",
    ],
    ".agents/plugins/bkit/hooks/bkit-guardrails.cjs": [
        "8e5d75f7e1a4527889dafa6a250ae370e2acf1b5fc7d58929dfc759489746e14",
    ],
};
/** The text outside a file's single managed block, or null without exactly one block. */
export function driverText(content, markerStyle) {
    const [startMarker, endMarker] = selectMarkers(markerStyle);
    const starts = findLineAnchoredMarkers(content, startMarker);
    const ends = findLineAnchoredMarkers(content, endMarker);
    if (starts.length !== 1 || ends.length !== 1 || ends[0] < starts[0])
        return null;
    return content.slice(0, starts[0]) + content.slice(ends[0]);
}
/**
 * True when `dstPath` still carries a retired bkit driver the consumer never edited. An
 * edited driver still on the retired output shape is kept and gets a printed fix.
 */
function hasRetiredDriver(dstPath, content, markerStyle) {
    const posix = dstPath.replace(/\\/g, "/");
    const key = Object.keys(RETIRED_DRIVER_HASHES).find((rel) => posix === rel || posix.endsWith(`/${rel}`));
    if (key === undefined)
        return false;
    const driver = driverText(content, markerStyle);
    if (driver === null)
        return false;
    if (RETIRED_DRIVER_HASHES[key].includes(sha256(driver)))
        return true;
    if (driver.includes("hookSpecificOutput")) {
        console.warn(`[bkit] ${dstPath}: your driver below \`// bkit:end\` writes Claude-shaped \`hookSpecificOutput\`, which Antigravity ignores — the hook never takes effect. Emit the managed block's result as Antigravity's \`{ "decision": "allow" | "deny" | "ask", "reason": "…" }\` (only a deny's reason reaches the model), or delete the file and re-run \`bkit install --antigravity\` to get bkit's driver.`);
    }
    return false;
}
export function writeTier2(srcPath, dstPath, tokens, markerStyle, dryRun, ws) {
    const srcRaw = readTemplate(srcPath);
    // A retired, unedited bkit driver is bkit's code, not the consumer's: replace the
    // whole file so the new driver ships with the new block.
    if (fs.existsSync(dstPath) &&
        hasRetiredDriver(dstPath, fs.readFileSync(dstPath, "utf-8"), markerStyle)) {
        if (!dryRun)
            fs.writeFileSync(dstPath, applyTokens(srcRaw, tokens), "utf-8");
        ws.writes.push({ path: dstPath, action: "write" });
        return;
    }
    if (!fs.existsSync(dstPath)) {
        // dest missing → write whole template (with tokens applied)
        const content = applyTokens(srcRaw, tokens);
        ensureDir(path.dirname(dstPath));
        if (!dryRun) {
            fs.writeFileSync(dstPath, content, "utf-8");
            const srcMode = fs.statSync(srcPath).mode;
            fs.chmodSync(dstPath, srcMode);
        }
        ws.writes.push({ path: dstPath, action: "write" });
        return;
    }
    const destContent = fs.readFileSync(dstPath, "utf-8");
    const fullBlock = extractFullManagedBlock(srcRaw, markerStyle);
    if (fullBlock === null) {
        // Template has no block for this marker style — nothing to manage
        return;
    }
    // Check if dest already has markers
    const blockContent = extractManagedBlock(destContent, markerStyle);
    if (blockContent === null) {
        // extractManagedBlock returns null for BOTH "no markers" and "ambiguous markers"
        // (duplicates / inverted). Only the former should append — appending on the latter
        // compounds corruption (dogfood docs grew a second stamped block every install).
        const [startMarker, endMarker] = selectMarkers(markerStyle);
        const starts = findLineAnchoredMarkers(destContent, startMarker);
        const ends = findLineAnchoredMarkers(destContent, endMarker);
        if (starts.length > 0 || ends.length > 0) {
            console.warn(`[bkit] Managed block markers present but unparseable in ${dstPath} — skipping (expected exactly one start/end)`);
            return;
        }
        // dest has no markers → append full block at EOF (with tokens applied)
        const appliedBlock = applyTokens(fullBlock, tokens);
        const copyTitle = dstPath.endsWith(".md") ? findUnmarkedCopy(destContent, appliedBlock) : null;
        if (copyTitle !== null) {
            console.warn(`[bkit] ${dstPath} has no managed-block markers but already holds an older bkit copy (\`${copyTitle}\`) — skipping, so it is not duplicated. Delete the file and re-run install; then re-add any lines you wrote yourself below \`<!-- bkit:end -->\`.`);
            return;
        }
        const sep = destContent.length === 0
            ? ""
            : destContent.endsWith("\n\n")
                ? ""
                : destContent.endsWith("\n")
                    ? "\n"
                    : "\n\n";
        const tail = appliedBlock.endsWith("\n") ? "" : "\n";
        if (!dryRun) {
            fs.writeFileSync(dstPath, destContent + sep + appliedBlock + tail, "utf-8");
        }
        ws.writes.push({ path: dstPath, action: "append" });
        return;
    }
    // dest has markers → update managed block with new content (tokens applied)
    const newBlockContent = extractManagedBlock(srcRaw, markerStyle);
    if (newBlockContent === null)
        return;
    const appliedNewContent = applyTokens(newBlockContent, tokens);
    if (updateManagedBlock(dstPath, appliedNewContent, dryRun, markerStyle)) {
        ws.writes.push({ path: dstPath, action: "update" });
    }
}
// ---------------------------------------------------------------------------
// Managed package.json scripts — add-if-missing with consumer ownership
//
// Semantics:
//   - File absent           → no-op, returns missingPkg: true
//   - File malformed JSON   → no-op, returns malformed: true
//   - script key absent     → add with default value (recorded as one update)
//   - script key exists     → preserve consumer value (never overwrite)
//
// One WriteSet entry per call when any script was added. Drift
// surfaces in `bkit check` because `dryRun=true` still pushes to ws.writes.
// ---------------------------------------------------------------------------
export function ensurePackageJsonScripts(scripts, dryRun, ws) {
    const pkgPath = "package.json";
    if (!fs.existsSync(pkgPath)) {
        return { added: [], preserved: [], missingPkg: true, malformed: false };
    }
    const raw = fs.readFileSync(pkgPath, "utf-8");
    let pkg;
    try {
        pkg = JSON.parse(raw);
    }
    catch {
        return { added: [], preserved: [], missingPkg: false, malformed: true };
    }
    let pkgScripts = pkg.scripts ?? undefined;
    const added = [];
    const preserved = [];
    for (const [name, value] of Object.entries(scripts)) {
        if (pkgScripts && Object.prototype.hasOwnProperty.call(pkgScripts, name)) {
            preserved.push(name);
        }
        else {
            if (!pkgScripts) {
                pkgScripts = {};
                pkg.scripts = pkgScripts;
            }
            pkgScripts[name] = value;
            added.push(name);
        }
    }
    if (added.length > 0) {
        ws.writes.push({ path: pkgPath, action: "update" });
        if (!dryRun) {
            // Preserve indent style and trailing newline of the original file.
            const indentMatch = raw.match(/\n([ \t]+)"/);
            const indent = indentMatch ? indentMatch[1] : "  ";
            const trailingNewline = raw.endsWith("\n") ? "\n" : "";
            fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, indent) + trailingNewline, "utf-8");
        }
    }
    return { added, preserved, missingPkg: false, malformed: false };
}
