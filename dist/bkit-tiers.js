import * as fs from "node:fs";
import * as path from "node:path";
import { extractFullManagedBlock, extractManagedBlock, updateManagedBlock, } from "./bkit-install.js";
import { applyTokens } from "./bkit-tokens.js";
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
