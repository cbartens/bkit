// install/hosts.ts — which host modules a consumer has installed.
import * as fs from "node:fs";
import * as path from "node:path";
/**
 * The Antigravity plugin's bkit-written paths (install/modules/antigravity.ts). Any one
 * present marks the host installed, so deleting a single file (the manifest included) still
 * leaves the host detected and its missing files reported as drift.
 */
const ANTIGRAVITY_SENTINELS = ["plugin.json", "hooks.json", "agents", "skills", "hooks"].map((p) => path.join(".agents", "plugins", "bkit", p));
/**
 * Detect which host modules a consumer has installed: each host's source-rendered agents
 * directory, or for Antigravity any of its plugin files. `bkit upgrade` re-renders only these
 * hosts — never force-creating an opencode/cursor tree — and setup tips key host-specific
 * advice on them.
 */
export function detectInstalledHostModules(cwd) {
    const mods = new Set();
    if (fs.existsSync(path.join(cwd, ".claude", "agents")))
        mods.add("claude");
    if (fs.existsSync(path.join(cwd, ".cursor", "agents")))
        mods.add("cursor");
    if (fs.existsSync(path.join(cwd, ".opencode", "agents")))
        mods.add("opencode");
    if (fs.existsSync(path.join(cwd, ".codex", "agents")))
        mods.add("codex");
    if (ANTIGRAVITY_SENTINELS.some((rel) => fs.existsSync(path.join(cwd, rel))))
        mods.add("antigravity");
    return mods;
}
