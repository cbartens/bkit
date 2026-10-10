// bkit-retire.ts — delete files an older bkit wrote that bkit does not ship.
//
// Install and upgrade overwrite what bkit owns, but never delete a file bkit does
// not ship. This deletes each retired file when it still matches the hash bkit
// recorded when it last wrote it (`.bkit/version` `canonicalHashes`). A file the
// consumer edited stays, and an advisory names what does its job. Consumer files
// that still call a retired path (CI workflows, package.json scripts) get one
// advisory per line, because nothing else would tell them the call fails.
import * as fs from "node:fs";
import * as path from "node:path";
import { isConsumerModified, readBkitVersion, writeBkitVersion } from "./bkit-version.js";
/**
 * Owned files an older bkit wrote that bkit does not ship. Append when bkit stops
 * shipping one; never remove an entry.
 */
export const RETIRED_OWNED_FILES = [
    {
        path: ".bkit/scripts/bkit-book-commit.sh",
        replacement: "bkit ledgers commit|union|only-bookkeeping",
    },
    { path: ".bkit/scripts/bkit-context-clamp.sh", replacement: "bkit context clamp|clamp-log" },
    { path: ".bkit/scripts/bkit-counter-bus.sh", replacement: "bkit counters derive|run|route|max" },
    { path: ".bkit/scripts/bkit-protect-main.sh", replacement: "bkit setup protect-main" },
    { path: ".bkit/scripts/bkit-rebase-resolve.sh", replacement: "bkit branches rebase" },
    { path: ".bkit/scripts/bkit-roadmap-fold.sh", replacement: "bkit roadmap fold" },
    {
        path: ".bkit/scripts/bkit-runtime.sh",
        replacement: "bkit runtime, runs, prs, branches and tests commands",
    },
    { path: ".bkit/scripts/bkit-ship-gate.sh", replacement: "bkit runs gate" },
    {
        path: ".bkit/scripts/bkit-ship-timeouts.sh",
        replacement: "the timeouts built into bkit runs and bkit locks",
    },
    { path: ".bkit/scripts/bkit-slop-delta.sh", replacement: "bkit ci slop" },
    { path: ".bkit/scripts/bkit-status-fold.sh", replacement: "bkit status fold" },
    { path: ".bkit/scripts/bkit-status-route.sh", replacement: "bkit status route" },
    { path: ".bkit/scripts/bkit-workflow-telemetry.sh", replacement: "bkit workflows close" },
    {
        path: ".bkit/scripts/bkit-counter-bus-config.sh",
        replacement: "bkit counters max (bkit-cloud.yml sets MAX_DEV_DISPATCH_ATTEMPTS as a workflow env)",
    },
    { path: ".bkit/scripts/bkit-mirror-push-run.sh", replacement: "bkit runs mirror" },
];
export const isRetiredOwned = (relPath, list = RETIRED_OWNED_FILES) => list.some((r) => r.path === relPath);
/**
 * Paths an older bkit wrote that bkit ships only as templates. The consumer's file
 * stays; only its `.bkit/version` hash goes, so a stale key cannot exempt it from
 * checks. Never list these in RETIRED_OWNED_FILES: that list deletes unedited copies.
 */
export const RETIRED_MANAGED_PATHS = new Set([
    ".github/renovate.json5",
    ".github/renovate-local.json5",
    ".github/workflows/renovate.yml",
    ".github/dependabot.yml",
    ".bkit/scripts/bkit-set-dependabot.sh",
    ".github/workflows/ci.yml",
    ".github/workflows/bkit-cloud.yml",
    ".husky/pre-commit",
    ".husky/pre-push",
    ".vale.ini",
    ".vale/styles/House/Filler.yml",
    ".vale/styles/House/Hedging.yml",
    ".vale/styles/House/LLMSlop.yml",
    ".vale/styles/House/Verbose.yml",
    ".lintstagedrc.json",
    "slop-scan.config.json",
    ".prettierignore",
    ".envrc",
    ".cursor/settings.json",
    ".cursor/environment.json",
    ".cursor/Dockerfile",
]);
/** A `.bkit/version` hash key bkit does not keep: a retired owned file or a retired managed path. */
export const isRetiredHashKey = (relPath) => RETIRED_MANAGED_PATHS.has(relPath) || isRetiredOwned(relPath);
/** `hashes` without the keys bkit does not keep. */
export function withoutRetiredHashes(hashes) {
    return Object.fromEntries(Object.entries(hashes).filter(([p]) => !isRetiredHashKey(p)));
}
/**
 * Delete each retired file that is unchanged since bkit wrote it, and drop every
 * retired path's hash from `.bkit/version`. Dry-run reports without touching disk.
 */
export function retireOwnedFiles(cwd, opts, list = RETIRED_OWNED_FILES) {
    const result = { deleted: [], kept: [] };
    const versionFile = path.join(cwd, ".bkit", "version");
    const version = readBkitVersion(versionFile);
    const hashes = version?.canonicalHashes ?? {};
    const tag = opts.dryRun ? "[dry-run] " : "";
    for (const r of list) {
        const abs = path.join(cwd, r.path);
        if (!fs.existsSync(abs))
            continue;
        if (isConsumerModified(r.path, abs, hashes)) {
            result.kept.push(r.path);
            opts.log(`${tag}retire: kept ${r.path} — edited since bkit wrote it (use ${r.replacement})`);
            continue;
        }
        result.deleted.push(r.path);
        opts.log(`${tag}retire: delete ${r.path} (use ${r.replacement})`);
        if (!opts.dryRun)
            fs.rmSync(abs);
    }
    const stale = Object.keys(hashes).filter((p) => isRetiredOwned(p, list));
    if (version && stale.length > 0 && !opts.dryRun) {
        const canonicalHashes = { ...hashes };
        for (const p of stale)
            delete canonicalHashes[p];
        writeBkitVersion(versionFile, { ...version, canonicalHashes });
    }
    return result;
}
/** Lines in the consumer's CI workflows and package.json that still name a retired path. */
export function findRetiredCallers(cwd, list = RETIRED_OWNED_FILES) {
    if (list.length === 0)
        return [];
    const files = [];
    const workflows = path.join(".github", "workflows");
    if (fs.existsSync(path.join(cwd, workflows))) {
        for (const f of fs.readdirSync(path.join(cwd, workflows)).sort()) {
            if (/\.ya?ml$/.test(f))
                files.push(path.join(workflows, f));
        }
    }
    if (fs.existsSync(path.join(cwd, "package.json")))
        files.push("package.json");
    const callers = [];
    for (const file of files) {
        const lines = fs.readFileSync(path.join(cwd, file), "utf-8").split("\n");
        lines.forEach((text, i) => {
            for (const retired of list) {
                if (text.includes(retired.path))
                    callers.push({ file, line: i + 1, retired });
            }
        });
    }
    return callers;
}
/** Advisories for retired files left on disk and for consumer lines that still call one. */
export function detectRetiredOwnedFiles(cwd, list = RETIRED_OWNED_FILES) {
    const findings = [];
    const hashes = readBkitVersion(path.join(cwd, ".bkit", "version"))?.canonicalHashes ?? {};
    for (const r of list) {
        const abs = path.join(cwd, r.path);
        // An unedited copy is retireOwnedFiles' to delete, not the consumer's to act on.
        if (!fs.existsSync(abs) || !isConsumerModified(r.path, abs, hashes))
            continue;
        findings.push({
            id: `retired-file-kept:${r.path}`,
            severity: "advisory",
            detect: `${r.path} is not shipped by bkit. It was edited after bkit wrote it, so bkit left it in place.`,
            action: `Move any change you still need to ${r.replacement}, then delete it: rm ${r.path}`,
        });
    }
    for (const c of findRetiredCallers(cwd, list)) {
        findings.push({
            id: `retired-file-caller:${c.file}:${c.line}`,
            severity: "advisory",
            detect: `${c.file}:${c.line} calls ${c.retired.path}, which bkit does not ship — that line fails on its next run.`,
            action: `In ${c.file} line ${c.line}, replace the call to ${c.retired.path} with ${c.retired.replacement}.`,
        });
    }
    return findings;
}
