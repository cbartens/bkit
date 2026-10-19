// checks/before/index.ts — Phase 1: read-only detection BEFORE any writes. runPreflight calls
// the detectors in this folder (one file per group of findings) in a fixed order.
// Nothing in checks/before/ imports install/modules/ — preflight is upstream of module dispatch.
//
// Allow-list for cross-module imports (BAR-167 Phase 1+2):
//   readBkitVersion       — from install/version-file.ts (version pin reader)
//   deepContains          — from install/write.ts (JSON containment primitive)
//   extractManagedBlock   — from install/managed-block.ts (marker block extraction)
//   findTemplateSource    — from shared/package-roots.ts (dest → payload source, the dotfile remap)
//   readBkitConfig        — from shared/settings.ts (the consumer's `bkit` settings)
//   readTemplate          — from render/parts.ts (template with its shared parts spliced in)
import * as fs from "node:fs";
import * as path from "node:path";
import { getPkgRoot } from "../../shared/package-roots.js";
import { readBkitConfig } from "../../shared/settings.js";
import { detectBkitNotOnPath, detectMalformedPackageJson, detectNoPackageJson, detectNotGitRepo, } from "./repo.js";
import { MARKERED_TEXT_DRIFT_PATHS, detectGitignoreBlockDuplicates, detectPlaywrightReporterHostile, detectTier2JsonDrift, detectTier2TextDrift, } from "./files.js";
import { detectBkitVersionMajorDowngrade, detectBkitVersionPinStale } from "./version.js";
import { detectContextFetchContextMissing, detectContextFetchMissing, detectContextFetchProvisionMissing, detectContextFetchSourceNotEnabled, } from "./context-fetch.js";
import { detectExtraMcpServers, detectMissingMcpServers } from "./mcp.js";
// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------
// Deduplicate an array of findings by `id`, first occurrence wins.
export function dedupeById(findings) {
    const seen = new Set();
    return findings.filter((f) => {
        if (seen.has(f.id))
            return false;
        seen.add(f.id);
        return true;
    });
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
 * issueTracker: when provided, narrows tracker-specific checks (e.g. MCP server
 * requirements). When omitted, read from consumer's `bkit.issueTracker` in package.json.
 *
 * GitHub tracker gate: when `issueTracker === "github"`, the Linear preflight
 * gate is a no-op — the GitHub gate is enforced by workflow Step 1 via MCP.
 */
export function runPreflight(modules, cwd = process.cwd(), installingVersion, issueTracker) {
    // Resolve installing version if not provided
    let version = installingVersion;
    if (!version) {
        try {
            const pkgJsonPath = path.join(getPkgRoot(), "package.json");
            if (fs.existsSync(pkgJsonPath)) {
                const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
                version = pkg.version ?? "0.0.0";
            }
            else {
                version = "0.0.0";
            }
        }
        catch {
            version = "0.0.0";
        }
    }
    // Resolve issueTracker: use provided value or read from consumer package.json.
    // GitHub tracker gate: when issueTracker === "github", Linear preflight is a no-op
    // (the GitHub gate is enforced by workflow Step 1 via MCP — hook is no-op).
    const resolvedTracker = issueTracker ?? readBkitConfig(cwd).issueTracker;
    const blockers = [];
    const advisories = [];
    // --- Blocker detectors ---
    const noPackageJson = detectNoPackageJson(cwd);
    if (noPackageJson)
        blockers.push(noPackageJson);
    const malformedPackageJson = detectMalformedPackageJson(cwd);
    if (malformedPackageJson)
        blockers.push(malformedPackageJson);
    const notGitRepo = detectNotGitRepo(cwd, modules);
    if (notGitRepo)
        blockers.push(notGitRepo);
    // --- Advisory detectors ---
    // Phase 1: JSON containment drift advisory
    for (const relPath of [".claude/settings.json", ".cursor/hooks.json"]) {
        const driftAdvisory = detectTier2JsonDrift(cwd, relPath);
        if (driftAdvisory)
            advisories.push(driftAdvisory);
    }
    // Phase 2: markered-text block drift advisory (BAR-167)
    for (const relPath of MARKERED_TEXT_DRIFT_PATHS) {
        const textDriftAdvisory = detectTier2TextDrift(cwd, relPath);
        if (textDriftAdvisory)
            advisories.push(textDriftAdvisory);
    }
    const gitignoreDup = detectGitignoreBlockDuplicates(cwd);
    if (gitignoreDup)
        advisories.push(gitignoreDup);
    const versionMajorDowngrade = detectBkitVersionMajorDowngrade(cwd, version);
    if (versionMajorDowngrade)
        advisories.push(versionMajorDowngrade);
    const versionPinStale = detectBkitVersionPinStale(cwd);
    if (versionPinStale)
        advisories.push(versionPinStale);
    // BAR-224: [verbose ci] marker advisories
    const playwrightReporterHostile = detectPlaywrightReporterHostile(cwd);
    if (playwrightReporterHostile)
        advisories.push(playwrightReporterHostile);
    const contextFetch = detectContextFetchMissing(cwd);
    if (contextFetch)
        advisories.push(contextFetch);
    const contextFetchContext = detectContextFetchContextMissing(cwd);
    if (contextFetchContext)
        advisories.push(contextFetchContext);
    const contextFetchSource = detectContextFetchSourceNotEnabled(cwd);
    if (contextFetchSource)
        advisories.push(contextFetchSource);
    const contextFetchProvision = detectContextFetchProvisionMissing(cwd);
    if (contextFetchProvision)
        advisories.push(contextFetchProvision);
    // bkit-not-on-path advisory — suggest the shell alias for local development.
    const bkitNotOnPath = detectBkitNotOnPath();
    if (bkitNotOnPath)
        advisories.push(bkitNotOnPath);
    // Missing MCP server advisory — one finding per missing required key, per file: the
    // resolved tracker's own server (none → nothing required), matching what install writes.
    // Extra MCP server advisory — one finding per bkit-written tracker-only server that the
    // resolved tracker does not use (e.g. a stale `linear` entry under `github`).
    // opencode.json is drift-gated, so only the extra check runs there (map key `mcp`).
    for (const relPath of [".mcp.json", ".cursor/mcp.json"]) {
        advisories.push(...detectMissingMcpServers(cwd, relPath, resolvedTracker));
        advisories.push(...detectExtraMcpServers(cwd, relPath, resolvedTracker));
    }
    advisories.push(...detectExtraMcpServers(cwd, ".opencode/opencode.json", resolvedTracker, "mcp"));
    // [mcp-env] detectors run in Phase 3 (runPostInstallCheck in checks/after/index.ts),
    // not here: the .bkit/.env.example scaffold exists only after writes. Detectors are
    // exported from this file for the postinstall module.
    return {
        blockers: dedupeById(blockers),
        advisories: dedupeById(advisories),
    };
}
