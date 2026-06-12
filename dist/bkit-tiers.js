import * as fs from "node:fs";
import * as path from "node:path";
import { extractFullManagedBlock, extractManagedBlock, updateManagedBlock, findLineAnchoredMarkers, } from "./bkit-install.js";
import { applyTokens } from "./bkit-tokens.js";
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
        _deepContainsArray(template, consumer, pathPrefix, missing, mismatched);
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
function _deepContainsArray(template, consumer, pathPrefix, missing, mismatched) {
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
    // base-only (consumer) keys. The template is the authority on ordering: this matters for
    // order-significant maps like opencode's last-match-wins `permission.bash`, where a
    // `git push --force-with-lease*: allow` placed last in the template must stay last after an
    // upgrade/reconverge merge. Starting from `{...base}` (consumer order) instead let a stale
    // consumer ordering put the narrower `git push --force*: deny` after it, silently DENYING
    // force-with-lease (which rules.md permits on personal branches). (#255 P2-10)
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
// writeTier2JsonContained — deep-containment JSON helper (BAR-167 Phase 1)
//
// Replaces writeTier2Json. No __bkit__ envelope required.
//
// Contract:
//   - dest absent         → write template as-is (first install)
//   - dest present, valid JSON, template contained → no-op (idempotent)
//   - dest present, valid JSON, containment fails → deepMergeJson(existing, template)
//     (template wins on key collisions; consumer-only keys outside template tree preserved)
//   - dest present, malformed JSON → overwrite with template
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
export function migrateLegacyBkitEnvelope(doc, template) {
    const noOp = {
        stripped: false,
        deepMerged: false,
        schemaFlipped: false,
        outDoc: doc,
    };
    // No envelope — nothing to migrate
    if (!("__bkit__" in doc) || doc["__bkit__"] === undefined) {
        return noOp;
    }
    // Strip __bkit__ from doc
    const stripped = {};
    for (const [k, v] of Object.entries(doc)) {
        if (k !== "__bkit__")
            stripped[k] = v;
    }
    // Check if stripped doc already contains the template
    const containsResult = deepContains(template, stripped);
    if (containsResult.ok) {
        return {
            stripped: true,
            deepMerged: false,
            schemaFlipped: false,
            outDoc: stripped,
        };
    }
    // Deep-merge: stripped base, template override
    const merged = deepMergeJson(stripped, template);
    // Detect schema flip: any path where the type changed from stripped to merged
    const schemaFlipped = _detectSchemaFlip(stripped, merged);
    return {
        stripped: true,
        deepMerged: true,
        schemaFlipped,
        outDoc: merged,
    };
}
/** Detect if any path type-flipped between two objects (shallow first level only for perf). */
function _detectSchemaFlip(before, after) {
    for (const key of Object.keys(after)) {
        const bVal = before[key];
        const aVal = after[key];
        if (bVal === undefined)
            continue; // new key — not a flip
        if (bVal === null && aVal === null)
            continue;
        const bIsArray = Array.isArray(bVal);
        const aIsArray = Array.isArray(aVal);
        if (bIsArray !== aIsArray)
            return true;
        if (!bIsArray && typeof bVal !== typeof aVal)
            return true;
    }
    return false;
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
// fully-managed format — idempotent rewrite of whole file after token substitution
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
// markered-text format — managed-block (bkit owns content between markers; consumer owns rest)
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
