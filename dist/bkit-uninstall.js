// bkit-uninstall.ts — Single owner of all uninstall logic. (P2.T5-P2.T8)
//
// runUninstall(modules, ctx) orchestrates:
//   1. For each installed file:
//      - Tier 1: delete if present (fully bkit-owned)
//      - Tier 2: stripManagedBlock, remove file if empty remainder
//      - Tier 3: shouldDeleteTier3 — delete only if hash matches install-time hash
//   2. package.json: stripManagedKeys for scripts/devDeps
//   3. .agents/ mirror files (bkit-prefix .md files in .claude/ .cursor/)
//
// Flags:
//   --dry-run       print decision table (FILE / DECISION / REASON) without writes
//   --force         override tier-3 hash guard (force-delete even if consumer modified)
//   --nuke          confirm prompt then wipe ALL bkit-written files (Tier 1+2+3)
//   --yes           skip interactive confirm for --nuke
//   --package       also strip managed package.json keys
//   --keep-npmrc    skip .npmrc removal (default: skip anyway — .npmrc is not bkit-managed)
//   --keep-tooling  skip vale/husky/prettier devDep removal
//
// Observability: console.error("[bkit-uninstall] …") for all error paths.
import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
import { stripManagedBlock } from "./bkit-tiers.js";
import { getInstallManifest } from "./bkit-manifest.js";
import { readBkitVersion, shouldDeleteTier3 } from "./bkit-version.js";
import { stripManagedKeys } from "./bkit-package-json.js";
// ---------------------------------------------------------------------------
// Tier-2 file strip helper
// ---------------------------------------------------------------------------
/**
 * Detect the marker style used in a file (html-comment or hash-comment).
 * Returns null if neither style is present.
 */
function detectMarkerStyle(content) {
    if (/^<!-- bkit:start -->$/m.test(content))
        return "html-comment";
    if (/^# bkit:start$/m.test(content))
        return "hash-comment";
    return null;
}
// ---------------------------------------------------------------------------
// Decision table builder (for --dry-run output and UninstallResult)
// ---------------------------------------------------------------------------
/**
 * Build a decision table for all files that would be affected by uninstall.
 * Does NOT perform any writes.
 */
export function buildDecisionTable(modules, ctx) {
    const moduleList = modules instanceof Set
        ? [...modules].filter((m) => ["core", "claude", "cursor", "ci", "lint", "git-hooks"].includes(m))
        : modules;
    const entries = getInstallManifest(moduleList);
    // Read tier3Hashes from .bkit-version
    const versionFilePath = path.join(ctx.cwd, ".agents", ".bkit-version");
    const bkitVer = readBkitVersion(versionFilePath);
    const tier3Hashes = bkitVer?.tier3Hashes ?? {};
    const table = [];
    const seen = new Set();
    for (const entry of entries) {
        const absPath = path.join(ctx.cwd, entry.path);
        const key = entry.path;
        if (seen.has(key))
            continue; // deduplicate (e.g. package.json appears in multiple modules)
        seen.add(key);
        if (!fs.existsSync(absPath)) {
            table.push({
                file: entry.path,
                decision: "skip-absent",
                reason: "file not found — nothing to do",
                tier: entry.tier,
            });
            continue;
        }
        if (ctx.nuke) {
            // Nuke: delete everything regardless of tier
            table.push({
                file: entry.path,
                decision: "delete",
                reason: "--nuke: forcibly remove",
                tier: entry.tier,
            });
            continue;
        }
        switch (entry.tier) {
            case 1: {
                table.push({
                    file: entry.path,
                    decision: "delete",
                    reason: "Tier-1 (fully bkit-managed) — safe to delete",
                    tier: 1,
                });
                break;
            }
            case 2: {
                const content = fs.readFileSync(absPath, "utf-8");
                const style = detectMarkerStyle(content);
                if (!style) {
                    table.push({
                        file: entry.path,
                        decision: "preserve",
                        reason: "Tier-2 but no bkit markers found — 100% consumer content",
                        tier: 2,
                    });
                }
                else {
                    table.push({
                        file: entry.path,
                        decision: "strip-block",
                        reason: "Tier-2 (managed-block) — strip bkit block, preserve consumer content",
                        tier: 2,
                    });
                }
                break;
            }
            case 3: {
                if (ctx.force) {
                    table.push({
                        file: entry.path,
                        decision: "delete",
                        reason: "--force: delete Tier-3 regardless of hash",
                        tier: 3,
                    });
                    break;
                }
                const safe = shouldDeleteTier3(entry.path, absPath, tier3Hashes);
                if (tier3Hashes[entry.path] === undefined) {
                    table.push({
                        file: entry.path,
                        decision: "skip-tier3-unknown",
                        reason: "Tier-3: no recorded hash (install pre-dates v0.7.x) — preserve",
                        tier: 3,
                    });
                }
                else if (safe) {
                    table.push({
                        file: entry.path,
                        decision: "delete",
                        reason: "Tier-3: content matches install-time hash — safe to delete",
                        tier: 3,
                    });
                }
                else {
                    table.push({
                        file: entry.path,
                        decision: "skip-tier3-modified",
                        reason: "Tier-3: content differs from install-time hash — consumer modified, preserve",
                        tier: 3,
                    });
                }
                break;
            }
        }
    }
    return table;
}
// ---------------------------------------------------------------------------
// Format dry-run decision table
// ---------------------------------------------------------------------------
/**
 * Format a decision table as a human-readable string.
 * Format: FILE | DECISION | REASON
 */
export function formatDecisionTable(table) {
    if (table.length === 0)
        return "[bkit-uninstall] No files to process.\n";
    const COL_FILE = 48;
    const COL_DEC = 22;
    const header = `${"FILE".padEnd(COL_FILE)} | ${"DECISION".padEnd(COL_DEC)} | REASON\n` +
        `${"-".repeat(COL_FILE)}-+-${"-".repeat(COL_DEC)}-+-${"-".repeat(40)}\n`;
    const rows = table
        .map((r) => `${r.file.padEnd(COL_FILE)} | ${r.decision.padEnd(COL_DEC)} | ${r.reason}`)
        .join("\n");
    return header + rows + "\n";
}
// ---------------------------------------------------------------------------
// Prompt helper (--nuke confirmation)
// ---------------------------------------------------------------------------
async function confirmNuke() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question("[bkit-uninstall] --nuke will delete ALL bkit-managed files. Type 'yes' to confirm: ", (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase() === "yes");
        });
    });
}
// ---------------------------------------------------------------------------
// runUninstall — main orchestrator
// ---------------------------------------------------------------------------
/**
 * Perform the uninstall operation for the given modules.
 * Returns an UninstallResult describing what was done.
 */
export async function runUninstall(modules, ctx) {
    const result = {
        deleted: [],
        stripped: [],
        preserved: [],
        decisions: [],
        dryRun: ctx.dryRun,
    };
    const moduleList = modules instanceof Set
        ? [...modules].filter((m) => ["core", "claude", "cursor", "ci", "lint", "git-hooks"].includes(m))
        : modules;
    // Nuke confirmation
    if (ctx.nuke && !ctx.yes && !ctx.dryRun) {
        const confirmed = await confirmNuke();
        if (!confirmed) {
            console.log(`${ctx.logPrefix} --nuke cancelled.`);
            return result;
        }
    }
    const table = buildDecisionTable(moduleList, ctx);
    result.decisions = table;
    if (ctx.dryRun) {
        console.log(`${ctx.logPrefix} [dry-run] Decision table:`);
        console.log(formatDecisionTable(table));
    }
    // Read tier3Hashes for actual deletions
    const versionFilePath = path.join(ctx.cwd, ".agents", ".bkit-version");
    const bkitVer = readBkitVersion(versionFilePath);
    const tier3Hashes = bkitVer?.tier3Hashes ?? {};
    const seen = new Set();
    for (const summary of table) {
        if (seen.has(summary.file))
            continue;
        seen.add(summary.file);
        const absPath = path.join(ctx.cwd, summary.file);
        switch (summary.decision) {
            case "skip-absent":
            case "skip-tier3-modified":
            case "skip-tier3-unknown":
            case "preserve": {
                result.preserved.push(summary.file);
                if (!ctx.dryRun) {
                    console.log(`${ctx.logPrefix} preserve: ${summary.file} (${summary.reason})`);
                }
                break;
            }
            case "delete": {
                result.deleted.push(summary.file);
                if (!ctx.dryRun) {
                    try {
                        fs.rmSync(absPath, { force: true });
                        console.log(`${ctx.logPrefix} delete: ${summary.file}`);
                    }
                    catch (err) {
                        console.error(`${ctx.logPrefix} error deleting ${summary.file}: ${err.message}`);
                    }
                }
                break;
            }
            case "strip-block": {
                if (!ctx.dryRun) {
                    try {
                        const content = fs.readFileSync(absPath, "utf-8");
                        const style = detectMarkerStyle(content) ?? "html-comment";
                        const stripped = stripManagedBlock(content, style);
                        if (stripped.trim().length === 0) {
                            // File is now empty → delete it
                            fs.rmSync(absPath, { force: true });
                            result.deleted.push(summary.file);
                            console.log(`${ctx.logPrefix} delete (empty after strip): ${summary.file}`);
                        }
                        else {
                            fs.writeFileSync(absPath, stripped, "utf-8");
                            result.stripped.push(summary.file);
                            console.log(`${ctx.logPrefix} strip-block: ${summary.file}`);
                        }
                    }
                    catch (err) {
                        console.error(`${ctx.logPrefix} error stripping block from ${summary.file}: ${err.message}`);
                    }
                }
                else {
                    result.stripped.push(summary.file);
                }
                break;
            }
        }
    }
    // Package.json managed key stripping
    if (ctx.stripPackage && !ctx.dryRun) {
        try {
            const originalCwd = process.cwd();
            process.chdir(ctx.cwd);
            const pkgResult = stripManagedKeys(moduleList, false);
            process.chdir(originalCwd);
            if (pkgResult.removedScripts.length > 0) {
                console.log(`${ctx.logPrefix} package.json: removed scripts [${pkgResult.removedScripts.join(", ")}]`);
            }
            if (pkgResult.removedDevDeps.length > 0) {
                console.log(`${ctx.logPrefix} package.json: removed devDependencies [${pkgResult.removedDevDeps.join(", ")}]`);
            }
        }
        catch (err) {
            console.error(`${ctx.logPrefix} error stripping package.json keys: ${err.message}`);
        }
    }
    // Clean up .agents/ bkit-prefix mirror files
    // (.claude/commands/bkit-*.md, .claude/agents/bkit-*.md, etc.)
    if (!ctx.dryRun) {
        const mirrorDirs = [".claude/commands", ".claude/agents", ".cursor/commands", ".cursor/agents"];
        for (const dir of mirrorDirs) {
            const absDir = path.join(ctx.cwd, dir);
            if (!fs.existsSync(absDir))
                continue;
            try {
                for (const f of fs.readdirSync(absDir)) {
                    if (!f.startsWith("bkit-") || !f.endsWith(".md"))
                        continue;
                    const absFile = path.join(absDir, f);
                    fs.rmSync(absFile, { force: true });
                    result.deleted.push(path.join(dir, f));
                    console.log(`${ctx.logPrefix} delete mirror: ${path.join(dir, f)}`);
                }
            }
            catch (err) {
                console.error(`${ctx.logPrefix} error cleaning up ${dir}: ${err.message}`);
            }
        }
    }
    return result;
}
