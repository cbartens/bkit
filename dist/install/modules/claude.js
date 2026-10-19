// install/modules/claude.ts — the claude host module: `.claude/` agents and commands, settings
// allows, and the tracker entry in the MCP config files (`.mcp.json`, `.cursor/mcp.json`).
import * as fs from "node:fs";
import * as path from "node:path";
import { writeTier1, writeTier2, writeTier2JsonContained, ensureDir, mergeTrackerEntry, trackerEntryInSync, } from "../write.js";
import { readBkitVersion, stampManagedVersion } from "../version-file.js";
import { readJsonFile } from "../../shared/json.js";
import { applyEffortRemap } from "../../render/hosts.js";
import { getCoreRoot, getSharedRoot, getWorkflowsRoot, getPromptsRoot, } from "../../shared/package-roots.js";
import { DEFAULT_ISSUE_TRACKER } from "../manifest.js";
import { substituteWorkflow } from "../../render/trackers.js";
import { writeClaudeCloudDoc, resolveClaudeDerivedAllows } from "../cloud-env.js";
import { readInstallingVersion } from "../../shared/package-json.js";
import { BKIT_PREFIX, installFile, listMdFiles, removeOrphans, trackMirrorWrite } from "./core.js";
export function renderClaudeAgentsCommands(ctx) {
    const { dryRun, logPrefix, effortMap } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;
    const version = ctx.version ?? readInstallingVersion();
    const written = [];
    const pairs = [
        [getWorkflowsRoot(), ".claude/commands"],
        [getPromptsRoot(), ".claude/agents"],
    ];
    for (const [src, dest] of pairs) {
        ensureDir(dest);
        const files = listMdFiles(src, BKIT_PREFIX);
        const sourceSet = new Set(files);
        for (const f of files) {
            // Resolve tracker blocks for both; agents also remap effort via prompts.md
            // Claude column. Managed-version marker stamped LAST.
            const transform = (c) => {
                const resolved = substituteWorkflow(c, issueTracker).output;
                const body = dest === ".claude/commands" ? resolved : applyEffortRemap(resolved, effortMap, "claude");
                return stampManagedVersion(body, version);
            };
            if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
                const rel = path.join(dest, f);
                console.log(`${logPrefix} ${tag}write: ${rel}`);
                trackMirrorWrite(ctx, rel, written);
            }
        }
        for (const f of removeOrphans(dest, sourceSet, dryRun, BKIT_PREFIX)) {
            const rel = path.join(dest, f);
            console.log(`${logPrefix} ${tag}delete orphan: ${rel}`);
            trackMirrorWrite(ctx, rel, written);
        }
    }
    return written;
}
export function runClaudeModule(ctx) {
    const { dryRun, tokens, advisories, ws, logPrefix } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;
    // Source-rendered agents/commands (.claude/agents from .bkit/prompts, .claude/commands
    // from .bkit/workflows). Shared with `bkit upgrade` via renderClaudeAgentsCommands so it
    // re-renders them identically — bkit-owned output, force-overwritten.
    renderClaudeAgentsCommands(ctx);
    // Root CLAUDE.md — Claude-Code redirect to .agents/rules.md.
    // It is a ROOT file (not under .claude/), so the .claude/ template walk does not cover it
    // and core does not emit it — the claude module writes it here. Tier-2 markered-text
    // (writeTier2 html-comment). The matching canonicalHashes entry is recorded by core's
    // postDispatch from ws (which aggregates every module's writes).
    {
        const src = path.join(getSharedRoot(), "CLAUDE.md");
        const dst = "CLAUDE.md";
        if (fs.existsSync(src)) {
            const prevLen = ws.writes.length;
            writeTier2(src, dst, tokens, "html-comment", dryRun, ws);
            if (ws.writes.length > prevLen) {
                console.log(`${logPrefix} ${tag}claude: ${dst}`);
            }
        }
    }
    const claudeShared = path.join(getSharedRoot(), ".claude");
    const claudeHooks = path.join(getCoreRoot(), ".claude", "hooks");
    // Tier 2 JSON (contained) — deep-containment: settings.json
    const settingsSrc = path.join(claudeShared, "settings.json");
    const settingsDst = ".claude/settings.json";
    if (fs.existsSync(settingsSrc)) {
        const prevLen = ws.writes.length;
        writeTier2JsonContained(settingsSrc, settingsDst, dryRun, ws);
        ctx.claudeAllowRecorded = enrichClaudeSettingsAllows(settingsDst, process.cwd(), dryRun, ws, advisories);
        if (ws.writes.length > prevLen) {
            console.log(`${logPrefix} ${tag}claude: ${settingsDst}`);
        }
    }
    // Markered-text — manifest format: "markered-text" — preflight hook.
    // Uses writeTier2 (html-comment markers: # <!-- bkit:start --> / # <!-- bkit:end -->)
    // to update only the bkit-managed block, preserving any consumer content outside markers.
    // Changed from writeTier1 to align install dispatch with manifest format classification.
    {
        const src = path.join(claudeHooks, "bkit-preflight.sh");
        const dst = ".claude/hooks/bkit-preflight.sh";
        if (fs.existsSync(src)) {
            const prevLen = ws.writes.length;
            writeTier2(src, dst, tokens, "html-comment", dryRun, ws);
            if (ws.writes.length > prevLen) {
                console.log(`${logPrefix} ${tag}claude: ${dst}`);
            }
        }
    }
    // markered-text (slash-comment) — GateGuard and ReadGuard advisory hooks. bkit owns
    // only the advisory engine between the markers; consumers own the stdin/stdout
    // driver from first install onward (env vars BKIT_GATEGUARD / BKIT_ALLOW_CONFIG_EDIT /
    // BKIT_READGUARD still tune behaviour).
    for (const hook of ["bkit-gateguard.cjs", "bkit-readguard.cjs"]) {
        const src = path.join(claudeHooks, hook);
        const dst = `.claude/hooks/${hook}`;
        if (fs.existsSync(src)) {
            const prevLen = ws.writes.length;
            writeTier2(src, dst, tokens, "slash-comment", dryRun, ws);
            if (ws.writes.length > prevLen) {
                console.log(`${logPrefix} ${tag}claude: ${dst}`);
            }
        }
    }
    // markered-text (slash-comment) — shell advisories (PreToolUse matcher `Bash`).
    // Covers what the permission table cannot express: URL hosts and shell-as-edit-channel.
    {
        const src = path.join(claudeHooks, "bkit-guardrails.cjs");
        const dst = ".claude/hooks/bkit-guardrails.cjs";
        if (fs.existsSync(src)) {
            const prevLen = ws.writes.length;
            writeTier2(src, dst, tokens, "slash-comment", dryRun, ws);
            if (ws.writes.length > prevLen) {
                console.log(`${logPrefix} ${tag}claude: ${dst}`);
            }
        }
    }
    // bkit-cloud-bootstrap.sh ships as a copy-and-own template; an install without `--auto=`
    // ships zero cloud footprint. The SessionStart hook entry in .claude/settings.json
    // is guarded (`test -f … || true`) so it no-ops when the consumer has not adopted
    // the script. The `cloud-env-customize` advisory lives in the cloud module.
    // .mcp.json — bkit owns only its tracker entry under `mcpServers`; every other key
    // (the consumer's own servers) is kept as-is.
    {
        const mcpSrc = path.join(getSharedRoot(), ".mcp.json");
        const mcpDst = ".mcp.json";
        if (fs.existsSync(mcpSrc)) {
            const prevLen = ws.writes.length;
            reconcileMcpJson(mcpSrc, mcpDst, issueTracker, dryRun, ws);
            if (ws.writes.length > prevLen) {
                console.log(`${logPrefix} ${tag}claude: ${mcpDst}`);
            }
        }
    }
    // .bkit/.env.example — owned (Tier 1): the token-placeholder reference, overwritten on
    // every install. Real values go in `.bkit/.env`. Not claude-specific, but the claude
    // module is the default-runs-everywhere module.
    {
        const envExampleSrc = path.join(getSharedRoot(), ".bkit", ".env.example");
        const envExampleDst = path.join(".bkit", ".env.example");
        if (fs.existsSync(envExampleSrc)) {
            const prevLen = ws.writes.length;
            writeTier1(envExampleSrc, envExampleDst, tokens, dryRun, ws);
            if (ws.writes.length > prevLen) {
                console.log(`${logPrefix} ${tag}claude: ${envExampleDst}`);
            }
        }
    }
    // Generated copy-paste-ready Claude-on-web setup doc — `.claude/bkit-cloud.md`.
    // UNTRACKED + gitignored (see the shared payload's gitignore): writeClaudeCloudDoc
    // inlines REAL secret values resolved from the consumer's `.envrc` (dotenv
    // sources minus its unsets minus session-hijack keys, per install/cloud-env.ts), so
    // it is never committed and does NOT enter ws.writes / canonicalHashes / `bkit check`
    // drift (values are machine-local). Skipped on dry-run (`bkit check`), which never
    // writes secrets. Upgrade regenerates it via the same helper (see runUpgrade caller).
    if (!dryRun && writeClaudeCloudDoc(process.cwd(), tokens)) {
        console.log(`${logPrefix} ${tag}claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)`);
    }
}
/**
 * Ensure Claude `permissions.allow` covers {@link resolveClaudeDerivedAllows} —
 * `WebFetch(domain:…)` per network-allowlist host and `mcp__…` per declared MCP server.
 * Claude rules match a command prefix, not a URL host, so curl cannot be excepted
 * by domain — network allowlisting for Claude is WebFetch-only; shell curl runs under
 * Bash(*), gated by `deny` and the auto-mode classifier (no ask row).
 * Called from install (`runClaudeModule`) and upgrade (mirror — upgrade does not
 * dispatch modules).
 *
 * Adds AND prunes, but only ever removes a grant bkit itself recorded writing. The
 * record is `claudeAllowDerived` in `.bkit/version`: a grant in that list and no longer
 * in the derived set is bkit's to remove; a grant the consumer added by hand was
 * never recorded, so it is never touched. An absent or empty record means bkit claims
 * authorship of nothing and prunes nothing — old consumers converge by addition only.
 *
 * Returns the set to record for next time, or `null` when nothing was determined and
 * the caller must leave the prior record alone: no settings file, unparseable JSON,
 * a non-array `allow`, or a dry run. `null` is a statement about PROVENANCE, never
 * about the write set — the `ws.writes` push below still fires under `dryRun`, because
 * it is the entire `bkit check` drift signal for `.claude/settings.json`.
 */
export function enrichClaudeSettingsAllows(settingsDst, cwd, dryRun, ws, advisories) {
    if (!fs.existsSync(settingsDst))
        return null;
    const settings = readJsonFile(settingsDst);
    if (!settings.ok)
        return null;
    const doc = settings.value;
    const allow = doc.permissions?.allow;
    if (!Array.isArray(allow))
        return null;
    const needed = resolveClaudeDerivedAllows(cwd);
    const recorded = readBkitVersion(path.join(cwd, ".bkit", "version"))?.claudeAllowDerived ?? [];
    const add = needed.filter((r) => !allow.includes(r));
    // Only what bkit recorded writing AND the derived set no longer wants.
    const remove = recorded.filter((r) => !needed.includes(r) && allow.includes(r));
    if (add.length > 0 || remove.length > 0) {
        if (!dryRun) {
            doc.permissions.allow = [...allow.filter((r) => !remove.includes(r)), ...add];
            fs.writeFileSync(settingsDst, JSON.stringify(doc, null, 2) + "\n", "utf-8");
        }
        // Outside the dryRun guard — see the provenance note above.
        if (!ws.writes.some((w) => w.path === settingsDst)) {
            ws.writes.push({ path: settingsDst, action: "write" });
        }
        if (remove.length > 0 && advisories) {
            advisories.push({
                id: "derived-grants-pruned",
                severity: "advisory",
                detect: `bkit removed ${remove.length} permissions.allow grant(s) it had previously added and no longer derives: ${remove.join(", ")}.`,
                action: "Nothing to do — a grant bkit added for a host or MCP server it no longer derives (dropped from .agents/context.md allowed-domains / mcp-servers, or no longer shipped) was withdrawn. To keep one, add it back to permissions.allow in .claude/settings.json by hand and bkit will leave it alone from then on.",
            });
        }
    }
    return dryRun ? null : needed;
}
// ---------------------------------------------------------------------------
// MCP config — `.mcp.json` (claude) and `.cursor/mcp.json` (cursor). bkit owns only
// its tracker entry under `mcpServers`; the rest of the file is the consumer's.
// ---------------------------------------------------------------------------
/**
 * Render the tracker-filtered `.mcp.json` / `.cursor/mcp.json` content: keep only the selected
 * tracker's `mcpServers` entry (none → empty map). Token-free. This is what a fresh install
 * writes, and its one entry is what `reconcileMcpJson` owns in an existing file.
 */
export function buildMcpJson(templatePath, tracker) {
    const template = JSON.parse(fs.readFileSync(templatePath, "utf-8"));
    const all = template.mcpServers ?? {};
    const filtered = {};
    if (tracker !== "none" && Object.prototype.hasOwnProperty.call(all, tracker)) {
        filtered[tracker] = all[tracker];
    }
    return JSON.stringify({ mcpServers: filtered }, null, 2) + "\n";
}
/**
 * Reconcile bkit's tracker entry into a consumer's `.mcp.json` / `.cursor/mcp.json`. bkit
 * owns exactly one key, `mcpServers[<tracker>]`, and within it only what the template sets
 * (`mergeTrackerEntry`: extra keys, headers and toolsets stay the consumer's); every
 * other key and the existing key order stay the consumer's. Absent file → write the
 * `buildMcpJson` render. Malformed JSON → throw (refuse to merge; the consumer fixes it).
 * Tracker `none` owns no entry, so a present file is left alone. Writes only on change, so
 * dry-run and live compute the identical WriteSet. Another tracker's entry is not touched
 * here: a `--tracker` switch removes an unedited one first (`removeUnusedTrackerMcpEntries`),
 * and `detectExtraMcpServers` advises on an edited one.
 */
export function reconcileMcpJson(templatePath, relDst, tracker, dryRun, ws) {
    const rendered = buildMcpJson(templatePath, tracker);
    if (!fs.existsSync(relDst)) {
        if (!dryRun) {
            ensureDir(path.dirname(relDst));
            fs.writeFileSync(relDst, rendered, "utf-8");
        }
        ws.writes.push({ path: relDst, action: "write" });
        return;
    }
    const read = readJsonFile(relDst);
    const existing = read.ok ? read.value : null;
    if (existing === null || typeof existing !== "object" || Array.isArray(existing)) {
        throw new Error(`[bkit] ${relDst} is malformed JSON — fix manually before running bkit install`);
    }
    const owned = JSON.parse(rendered).mcpServers;
    const servers = existing.mcpServers;
    const serversObj = servers !== null && typeof servers === "object" && !Array.isArray(servers) ? servers : {};
    const inSync = Object.entries(owned).every(([k, v]) => trackerEntryInSync(serversObj[k], v));
    if (inSync)
        return;
    const merged = Object.fromEntries(Object.entries(owned).map(([k, v]) => [k, mergeTrackerEntry(serversObj[k], v)]));
    const next = { ...existing, mcpServers: { ...serversObj, ...merged } };
    if (!dryRun)
        fs.writeFileSync(relDst, JSON.stringify(next, null, 2) + "\n", "utf-8");
    ws.writes.push({ path: relDst, action: "update" });
}
