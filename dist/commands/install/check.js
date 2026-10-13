// commands/install/check.ts — `bkit check`: the parts only check runs. Check is install in
// dry-run mode (commands/install/install.ts runInstall); this file holds the installed-module
// detection that scopes its drift gate and the drift verdict.
import * as fs from "node:fs";
import * as path from "node:path";
import { describeMissingOwnedHook } from "../../checks/after/managed.js";
import { LOG_PREFIX } from "../../shared/log-prefix.js";
/**
 * Installed-module set, detected by sentinel-file presence. Always core, plus the installed
 * subset of {claude, cursor, opencode, codex}. Two callers:
 *   - `bkit check` — scopes the drift gate, so a `--cursor`-only repo does not
 *     report `.claude/**` as drift.
 *   - `bkit upgrade` — scopes the template walk, so upgrade does NOT force-create files for a
 *     module the consumer never installed.
 *
 * opencode IS gated: the render inputs fall back to the INSTALLED provider/tracker
 * (renderOpencodeProvider + the package.json tracker resolution), so an openrouter/opencode/…
 * consumer is checked against its own config, and the dry-run path is read-only (installFile /
 * writeTier1 / reconcileOpencodeJson honour dryRun; ensureDir is dryRun-gated). The remaining
 * opt-in (cloud) stays out of the gate.
 * Dependency-updater files are not modules: bkit never drift-checks them.
 */
export function detectInstalledModules(cwd) {
    const mods = new Set(["core"]);
    if (fs.existsSync(path.join(cwd, ".claude", "agents")))
        mods.add("claude");
    if (fs.existsSync(path.join(cwd, ".cursor", "agents")))
        mods.add("cursor");
    if (fs.existsSync(path.join(cwd, ".opencode", "agents")))
        mods.add("opencode");
    if (fs.existsSync(path.join(cwd, ".codex", "agents")))
        mods.add("codex");
    if (fs.existsSync(path.join(cwd, ".agents", "plugins", "bkit", "plugin.json")))
        mods.add("antigravity");
    return mods;
}
// Check mode: exit-1 on drift (totalWrites > 0). runInstall emits the banner first.
// Host agent/command mirrors push would-writes into ws.writes (content drift OR
// orphan delete). A stale managed-version marker on any stamped file ALSO surfaces as
// the bkit-managed-stale Phase-3 blocker, which counts as drift here. A missing owned
// hook file (owned-hook-missing) fails check too, by name. Other Phase-3 blockers
// are install-only.
//
// Gate on `severity === "blocker"`, NOT mere id-presence: detectManagedStale is
// branch-scoped (downgraded to `advisory` off main/dev), so on a feature branch the
// finding still surfaces in the checklist but does not exit-1. On main/dev (or a PR
// into them) it stays a blocker and hard-fails.
export function reportCheckDrift(postFindings, totalWrites, missingHooks) {
    const managedStale = postFindings.some((f) => f.id === "bkit-managed-stale" && f.severity === "blocker");
    if (totalWrites > 0 || managedStale || missingHooks.length > 0) {
        if (totalWrites > 0) {
            console.error(`${LOG_PREFIX} check: ${totalWrites} write(s) would occur — DRIFT DETECTED`);
        }
        if (managedStale) {
            console.error(`${LOG_PREFIX} check: bkit-managed files are stale (managed-version marker drift) — ` +
                `see the bkit-managed-stale blocker above. Run \`pnpm bkit upgrade\` (or re-run install) and commit.`);
        }
        for (const hook of missingHooks) {
            console.error(`${LOG_PREFIX} check: ${describeMissingOwnedHook(hook)}`);
        }
        process.exit(1);
    }
}
