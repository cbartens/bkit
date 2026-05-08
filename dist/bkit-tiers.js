import * as fs from "node:fs";
import * as path from "node:path";
import { extractFullManagedBlock, extractManagedBlock, updateManagedBlock, findLineAnchoredMarkers, } from "./bkit-install.js";
import { applyTokens } from "./bkit-tokens.js";
import { lookupTier1Defaults } from "./bkit-tier1-defaults.js";
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
    // Both are plain objects — recursive merge
    const result = { ...base };
    for (const [key, val] of Object.entries(override)) {
        if (key in result &&
            result[key] !== null &&
            typeof result[key] === "object" &&
            !Array.isArray(result[key]) &&
            val !== null &&
            typeof val === "object" &&
            !Array.isArray(val)) {
            result[key] = deepMergeJson(result[key], val);
        }
        else {
            result[key] = val;
        }
    }
    return result;
}
// ---------------------------------------------------------------------------
// extractBkitNamespace — return the __bkit__ envelope from a parsed JSON doc (P3.T2)
//
// Returns null when the envelope is absent (consumer file pre-dates __bkit__ contract).
// ---------------------------------------------------------------------------
export function extractBkitNamespace(doc) {
    const envelope = doc["__bkit__"];
    if (envelope === undefined || envelope === null)
        return null;
    if (typeof envelope !== "object" || Array.isArray(envelope))
        return null;
    return envelope;
}
// ---------------------------------------------------------------------------
// applyBkitNamespace — set (or replace) __bkit__ envelope in a consumer doc (P3.T2)
//
// Returns a new object: { ...consumer, __bkit__: bkitPayload }
// Does NOT mutate consumer.
// ---------------------------------------------------------------------------
export function applyBkitNamespace(consumer, bkitPayload) {
    return { ...consumer, __bkit__: bkitPayload };
}
// ---------------------------------------------------------------------------
// writeTier2Json — deep-merge JSON helper (P3.T3)
//
// Contract (DE-8):
//   - template must contain a __bkit__ envelope — THROWS if absent (rollback safety)
//   - dest absent → write template as-is (first install: consumer has no custom keys yet)
//   - dest present → deep-merge: consumer top-level keys preserved; __bkit__ from template wins
//   - idempotent: writing identical content produces no-op (no WriteSet entry)
//
// "Deep-merge" semantics: { ...existingConsumerDoc, __bkit__: template.__bkit__ }
// Consumer keys outside __bkit__ survive unchanged.
// ---------------------------------------------------------------------------
export function writeTier2Json(srcPath, dstPath, dryRun, ws) {
    const srcRaw = fs.readFileSync(srcPath, "utf-8");
    let template;
    try {
        template = JSON.parse(srcRaw);
    }
    catch {
        throw new Error(`writeTier2Json: template at ${srcPath} is not valid JSON`);
    }
    // Guard: template MUST have __bkit__ envelope
    const bkitPayload = extractBkitNamespace(template);
    if (bkitPayload === null) {
        throw new Error(`writeTier2Json: template at ${srcPath} is missing the __bkit__ envelope. ` +
            `This indicates a rollback to a pre-v0.8.0 template. ` +
            `Restore the __bkit__ key in the template before running bkit install.`);
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
    // dest exists — deep-merge
    const dstRaw = fs.readFileSync(dstPath, "utf-8");
    let existing;
    try {
        existing = JSON.parse(dstRaw);
    }
    catch {
        // Malformed destination — treat as absent and overwrite
        ensureDir(path.dirname(dstPath));
        if (!dryRun) {
            fs.writeFileSync(dstPath, JSON.stringify(template, null, 2) + "\n", "utf-8");
            const srcMode = fs.statSync(srcPath).mode;
            fs.chmodSync(dstPath, srcMode);
        }
        ws.writes.push({ path: dstPath, action: "write" });
        return;
    }
    // Merge: consumer top-level keys survive; __bkit__ from template wins
    const merged = applyBkitNamespace(existing, bkitPayload);
    // Remove __bkit__ from consumer's own non-envelope keys if they had one (keep only from template)
    // applyBkitNamespace already sets __bkit__ = bkitPayload, which handles this.
    const mergedStr = JSON.stringify(merged, null, 2) + "\n";
    if (mergedStr === dstRaw)
        return; // idempotent — no change
    if (!dryRun) {
        fs.writeFileSync(dstPath, mergedStr, "utf-8");
    }
    ws.writes.push({ path: dstPath, action: "update" });
}
// ---------------------------------------------------------------------------
// migrateTier1JsonToTier2 — lift old Tier-1 shape into __bkit__ envelope (P3.T6)
//
// Purpose: Auto-migration for consumers upgrading from a pre-v0.8.0 install.
// When a consumer has an existing .claude/settings.json or .cursor/hooks.json
// that was written by bkit as Tier-1 (full-overwrite, no __bkit__ envelope),
// this function:
//   1. Reads the on-disk file.
//   2. Consults BKIT_TIER1_DEFAULTS_BY_VERSION for the consumer's installed version.
//   3. Identifies which top-level keys match the bkit-shipped defaults (bkit-owned).
//   4. Moves bkit-owned content under __bkit__; consumer-added keys remain at top level.
//   5. Writes back if changed (idempotent: re-run on already-migrated file is a no-op).
//
// Called by runClaudeModule/runCursorModule BEFORE writeTier2Json on upgrade paths.
// onDiskBkitVersion: the version string from .agents/.bkit-version (read at install time).
// fileKey: which file is being migrated (".claude/settings.json" or ".cursor/hooks.json").
// ---------------------------------------------------------------------------
export function migrateTier1JsonToTier2(filePath, fileKey, onDiskBkitVersion) {
    if (!fs.existsSync(filePath))
        return false; // nothing to migrate
    const raw = fs.readFileSync(filePath, "utf-8");
    let doc;
    try {
        doc = JSON.parse(raw);
    }
    catch {
        return false; // malformed JSON — skip, writeTier2Json will handle
    }
    // Already has __bkit__ envelope → idempotent, no-op
    if (extractBkitNamespace(doc) !== null)
        return false;
    // Look up defaults for this consumer's installed version
    const defaults = lookupTier1Defaults(onDiskBkitVersion);
    if (defaults === null) {
        // Version pre-dates Tier-1 classification (< 0.5.0) — can't auto-migrate safely.
        // writeTier2Json will write the template as-is on first Tier-2 install.
        return false;
    }
    const bkitDefaults = defaults[fileKey];
    // Build __bkit__ envelope and consumer doc using a two-pass strategy:
    //
    // For each top-level key in the on-disk doc:
    //   - If key NOT in bkit defaults → it's consumer-owned, keep at top level
    //   - If key IS in bkit defaults AND both values are plain objects →
    //       put the bkit-default sub-keys under __bkit__.<key>;
    //       keep consumer-only sub-keys at top level <key>
    //   - If key IS in bkit defaults AND NOT both plain objects →
    //       put on-disk value entirely under __bkit__.<key>
    //
    // This handles .claude/settings.json where `hooks` has both bkit-owned SessionStart
    // and consumer-owned Stop: SessionStart goes under __bkit__.hooks, Stop stays at hooks.Stop.
    const bkitEnvelope = {};
    const consumerDoc = {};
    for (const [key, onDiskValue] of Object.entries(doc)) {
        const defaultValue = bkitDefaults[key];
        if (defaultValue === undefined) {
            // Not in bkit defaults → purely consumer-owned
            consumerDoc[key] = onDiskValue;
            continue;
        }
        // Key is in bkit defaults
        const defaultIsObject = defaultValue !== null && typeof defaultValue === "object" && !Array.isArray(defaultValue);
        const onDiskIsObject = onDiskValue !== null && typeof onDiskValue === "object" && !Array.isArray(onDiskValue);
        if (defaultIsObject && onDiskIsObject) {
            // Both plain objects — split at sub-key level
            const defaultKeys = new Set(Object.keys(defaultValue));
            const bkitSubDoc = {};
            const consumerSubDoc = {};
            for (const [subKey, subValue] of Object.entries(onDiskValue)) {
                if (defaultKeys.has(subKey)) {
                    bkitSubDoc[subKey] = subValue;
                }
                else {
                    consumerSubDoc[subKey] = subValue;
                }
            }
            if (Object.keys(bkitSubDoc).length > 0) {
                bkitEnvelope[key] = bkitSubDoc;
            }
            if (Object.keys(consumerSubDoc).length > 0) {
                consumerDoc[key] = consumerSubDoc;
            }
        }
        else {
            // Primitive, array, or null — the whole value goes to __bkit__
            bkitEnvelope[key] = onDiskValue;
        }
    }
    // Build migrated doc: __bkit__ envelope first, then consumer keys
    const migrated = {
        __bkit__: bkitEnvelope,
        ...consumerDoc,
    };
    const migratedStr = JSON.stringify(migrated, null, 2) + "\n";
    if (migratedStr === raw)
        return false; // already in final form
    fs.writeFileSync(filePath, migratedStr, "utf-8");
    return true;
}
// ---------------------------------------------------------------------------
// stripManagedBlock — pure-string transform (P2.T2)
//
// Remove the bkit-managed block (including marker lines) from a string,
// preserving all consumer-owned content outside the block.
//
// Semantics:
//   - Markers absent  → returns content unchanged (idempotent, safe for re-run)
//   - Duplicated/inverted markers → returns content unchanged (error-safe)
//   - Marker lines and surrounding blank lines are removed along with the block
//
// Uses the line-anchored marker detection from BAR-138 (KN-8 lesson: greedy
// whitespace regexes are unsafe — use the anchored parser instead).
// ---------------------------------------------------------------------------
export function stripManagedBlock(content, markerStyle = "html-comment") {
    const startMarker = markerStyle === "hash-comment" ? "# bkit:start" : "<!-- bkit:start -->";
    const endMarker = markerStyle === "hash-comment" ? "# bkit:end" : "<!-- bkit:end -->";
    const starts = findLineAnchoredMarkers(content, startMarker);
    const ends = findLineAnchoredMarkers(content, endMarker);
    // Safety guards: absent, duplicated, or inverted → no-op
    if (starts.length === 0 || ends.length === 0)
        return content;
    if (starts.length > 1 || ends.length > 1)
        return content;
    const startIdx = starts[0];
    const endIdx = ends[0];
    if (startIdx >= endIdx)
        return content;
    // Find start-of-line for the start marker
    let startLineStart = startIdx;
    while (startLineStart > 0 && content[startLineStart - 1] !== "\n")
        startLineStart--;
    // Find end-of-line for the end marker (include trailing newline)
    const endMarkerEnd = endIdx + endMarker.length;
    let blockEnd = endMarkerEnd;
    if (blockEnd < content.length && content[blockEnd] === "\n")
        blockEnd++;
    const before = content.slice(0, startLineStart);
    const after = content.slice(blockEnd);
    // Trim one leading blank line from `after` to avoid double-blank after strip
    const afterTrimmed = after.replace(/^\n/, "");
    // Trim one trailing blank line from `before` to avoid double-blank before strip
    const beforeTrimmed = before.replace(/\n\n$/, "\n");
    return beforeTrimmed + afterTrimmed;
}
// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}
// ---------------------------------------------------------------------------
// Tier 1 — Fully managed (idempotent rewrite of whole file after token substitution)
//
// Semantics: always writes the src content (with tokens applied) to dst.
// If dst exists with identical content, no-op (no double-count in WriteSet).
// ---------------------------------------------------------------------------
export function writeTier1(srcPath, dstPath, tokens, dryRun, ws) {
    const srcRaw = fs.readFileSync(srcPath, "utf-8");
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
// Tier 2 — Managed-block (bkit owns content between markers; consumer owns rest)
//
// Semantics:
//   - dest absent            → write whole file (with token substitution)
//   - dest has markers       → update only the bkit block (tokens applied to new block content)
//   - dest present, no marks → append full block at EOF; preserve consumer content above
//
// markerStyle: "html-comment" for markdown/.gitignore; "hash-comment" for YAML/INI/shell.
// ---------------------------------------------------------------------------
export function writeTier2(srcPath, dstPath, tokens, markerStyle, dryRun, ws) {
    const srcRaw = fs.readFileSync(srcPath, "utf-8");
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
        // dest has no markers → append full block at EOF (with tokens applied)
        const appliedBlock = applyTokens(fullBlock, tokens);
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
/**
 * `aiMessage`: when the destination already exists and content differs,
 * push a structured advisory to `advisories` instead of the default current-vs-suggested
 * dump. The message should be a self-contained instruction that any AI
 * agent (or human) can copy-paste into a coding assistant to apply the
 * required merge. Use {{TEMPLATE_CONTENT}} as a placeholder for the
 * suggested template content — it will be substituted automatically.
 *
 * `tokens`: optional. When provided, apply token substitution to BOTH the
 * file written on the absent path AND the {{TEMPLATE_CONTENT}} embedded in
 * the AI message. Used by callers whose templates contain {{TOKEN}}
 * placeholders (e.g. ci.yml).
 */
export function writeTier3(srcPath, dstPath, dryRun, advisories, ws, aiMessage, tokens) {
    const srcRaw = fs.readFileSync(srcPath, "utf-8");
    const srcContent = tokens ? applyTokens(srcRaw, tokens) : srcRaw;
    const dstBasename = path.basename(dstPath);
    if (fs.existsSync(dstPath)) {
        // Present → suggest diff, don't write
        const dstContent = fs.readFileSync(dstPath, "utf-8");
        if (srcContent !== dstContent) {
            if (aiMessage) {
                advisories.push({
                    id: `tier3-merge-suggested-${dstBasename}`,
                    severity: "advisory",
                    detect: `${dstPath} exists and differs from the bkit reference. Manual merge required.`,
                    action: aiMessage.replace(/\{\{TEMPLATE_CONTENT\}\}/g, () => srcContent.trimEnd()),
                });
            }
            else {
                advisories.push({
                    id: `tier3-merge-suggested-${dstBasename}`,
                    severity: "advisory",
                    detect: `${dstPath} exists and differs from the bkit reference.`,
                    action: `File already exists. bkit suggests the following content:\n` +
                        `--- current ---\n${dstContent}\n--- suggested ---\n${srcContent}`,
                });
            }
        }
        return { wrote: false, suggested: srcContent !== dstContent };
    }
    // Absent → write (or record in dry-run)
    ensureDir(path.dirname(dstPath));
    if (!dryRun) {
        fs.writeFileSync(dstPath, srcContent, "utf-8");
        const srcMode = fs.statSync(srcPath).mode;
        fs.chmodSync(dstPath, srcMode);
    }
    ws.writes.push({ path: dstPath, action: "write" });
    return { wrote: !dryRun, suggested: false };
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
// One WriteSet entry per call when any script was added. Drift (missing keys)
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
// ---------------------------------------------------------------------------
// Managed package.json devDependencies — add-if-missing with consumer ownership
//
// Mirrors ensurePackageJsonScripts. Closes the bootstrap-half-done gap where
// bkit installs configs + scripts but doesn't ensure the tools those scripts
// invoke are installed (e.g. `prepare: husky install` script gets added but
// husky devDep doesn't, so `pnpm install` fails).
//
// Semantics:
//   - File absent           → no-op, returns missingPkg: true
//   - File malformed JSON   → no-op, returns malformed: true
//   - dep key absent        → add with default version-spec
//   - dep key exists        → preserve consumer value (never overwrite the pin)
//
// Note: this only ensures the entry in package.json. Actually fetching the
// package requires the consumer to run `pnpm install` after bkit install —
// runLintModule/runGitHooksModule print a hint when new devDeps are added.
// ---------------------------------------------------------------------------
export function ensurePackageJsonDevDeps(deps, dryRun, ws) {
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
    let pkgDevDeps = pkg.devDependencies ?? undefined;
    const added = [];
    const preserved = [];
    for (const [name, version] of Object.entries(deps)) {
        // Also treat presence in `dependencies` as preserved (consumer chose runtime
        // dep instead of devDep — don't double-add).
        const alreadyInDeps = pkg.dependencies && Object.prototype.hasOwnProperty.call(pkg.dependencies, name);
        if (alreadyInDeps || (pkgDevDeps && Object.prototype.hasOwnProperty.call(pkgDevDeps, name))) {
            preserved.push(name);
        }
        else {
            if (!pkgDevDeps) {
                pkgDevDeps = {};
                pkg.devDependencies = pkgDevDeps;
            }
            pkgDevDeps[name] = version;
            added.push(name);
        }
    }
    if (added.length > 0) {
        ws.writes.push({ path: pkgPath, action: "update" });
        if (!dryRun) {
            const indentMatch = raw.match(/\n([ \t]+)"/);
            const indent = indentMatch ? indentMatch[1] : "  ";
            const trailingNewline = raw.endsWith("\n") ? "\n" : "";
            fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, indent) + trailingNewline, "utf-8");
        }
    }
    return { added, preserved, missingPkg: false, malformed: false };
}
