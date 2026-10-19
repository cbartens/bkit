// commands/install/doctor.ts — `bkit doctor` (advisory scan, no managed-file writes) and
// `bkit status` (read-only host/provider status).
import * as fs from "node:fs";
import * as path from "node:path";
import { detectOpencodeProvider, detectOpencodeProviders } from "./install.js";
import { OPENCODE_PROVIDERS } from "../../shared/egress.js";
import { readJsonFile } from "../../shared/json.js";
import { LOG_PREFIX, setLogPrefix } from "../../shared/log-prefix.js";
import { readInstallingVersion } from "../../shared/package-json.js";
import { getCoreRoot, getSharedRoot, getTemplatesRoot } from "../../shared/package-roots.js";
import { runPreflight } from "../../checks/before/index.js";
import { runPostInstallCheck, formatChecklist, writeAdvisoriesArtifact, } from "../../checks/after/index.js";
import { collectTips } from "../../checks/tips/index.js";
import { parseDotenv } from "../../install/cloud-env.js";
import { detectInstalledHostModules } from "../../install/hosts.js";
import { parseFrontmatter } from "../../render/hosts.js";
/**
 * The `model:` pins in the frontmatter of `.opencode/agents/*.md` — where bkit renders the
 * opencode per-agent pins — grouped by model, most-used first (ties by model id). `[]` when
 * the directory is absent or no agent carries a pin.
 */
export function readOpencodeModelPins(cwd) {
    const agentsDir = path.join(cwd, ".opencode", "agents");
    if (!fs.existsSync(agentsDir))
        return [];
    const counts = new Map();
    for (const name of fs.readdirSync(agentsDir)) {
        if (!name.endsWith(".md"))
            continue;
        const content = fs.readFileSync(path.join(agentsDir, name), "utf-8");
        const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        const model = fm ? parseFrontmatter(fm[1]).get("model")?.trim() : undefined;
        if (model)
            counts.set(model, (counts.get(model) ?? 0) + 1);
    }
    return [...counts]
        .map(([model, agents]) => ({ model, agents }))
        .sort((a, b) => b.agents - a.agents || a.model.localeCompare(b.model));
}
/** `model: <id>` for one distinct pin, else `models: <id> (N agents), …`. */
export function formatOpencodeModelPins(pins) {
    if (pins.length === 0)
        return "model: none pinned in .opencode/agents/";
    if (pins.length === 1)
        return `model: ${pins[0].model}`;
    const list = pins.map((p) => `${p.model} (${p.agents} agent${p.agents === 1 ? "" : "s"})`);
    return `models: ${list.join(", ")}`;
}
/**
 * `bkit status` — read-only host/provider status.
 * Reports current host+provider sampled from .claude/, .cursor/, package.json and the
 * opencode agent model pins in .opencode/agents/. Writes nothing.
 */
export function runStatus(cwd, logPrefix) {
    console.log(`${logPrefix} Host/provider status (read-only — no writes)`);
    console.log(`${logPrefix} Working directory: ${cwd}`);
    // --- claude host ---
    const claudeDir = path.join(cwd, ".claude");
    const claudePresent = fs.existsSync(claudeDir);
    const claudeSettingsPath = path.join(claudeDir, "settings.json");
    let claudeModel = "claude (default)";
    if (claudePresent && fs.existsSync(claudeSettingsPath)) {
        // Best-effort: an unreadable settings file keeps the default label.
        const read = readJsonFile(claudeSettingsPath);
        if (read.ok && typeof read.value === "object" && read.value !== null) {
            const settings = read.value;
            if (settings.model)
                claudeModel = settings.model;
        }
    }
    console.log(`${logPrefix} claude:  ${claudePresent ? "INSTALLED" : "absent"}  (provider: anthropic / ${claudeModel})`);
    // --- cursor host ---
    const cursorDir = path.join(cwd, ".cursor");
    const cursorPresent = fs.existsSync(cursorDir);
    console.log(`${logPrefix} cursor:  ${cursorPresent ? "INSTALLED" : "absent"}`);
    // --- opencode host ---
    const opencodeDir = path.join(cwd, ".opencode");
    const opencodePresent = fs.existsSync(opencodeDir);
    // Resolve active provider (manifest-first; covers managed-auth gateways like opencode).
    const activeOpencodeProvider = detectOpencodeProvider(cwd);
    // All installed providers.
    const allOpencodeProviders = detectOpencodeProviders(cwd);
    // bkit pins models per agent in .opencode/agents/*.md frontmatter; opencode.json carries
    // only the consumer's optional top-level default `model`.
    let opencodeModel = formatOpencodeModelPins(readOpencodeModelPins(cwd));
    const opencodeJsonPath = path.join(opencodeDir, "opencode.json");
    if (opencodePresent && fs.existsSync(opencodeJsonPath)) {
        const read = readJsonFile(opencodeJsonPath);
        if (!read.ok || read.value === null || typeof read.value !== "object") {
            opencodeModel += "; opencode.json: parse-error";
        }
        else {
            const cfg = read.value;
            if (typeof cfg.model === "string" && cfg.model) {
                opencodeModel += `; default model: ${cfg.model}`;
            }
        }
    }
    let opencodeProviderDisplay;
    let providerLabel;
    if (allOpencodeProviders.length > 1) {
        // Multi-provider: list all, mark active
        const activeKey = activeOpencodeProvider ?? allOpencodeProviders[0];
        opencodeProviderDisplay = allOpencodeProviders
            .map((p) => (p === activeKey ? `${p} (active)` : p))
            .join(", ");
        providerLabel = "providers";
    }
    else {
        // Single provider: use singular label
        opencodeProviderDisplay = activeOpencodeProvider ?? allOpencodeProviders[0] ?? "unknown";
        providerLabel = "provider";
    }
    // --- codex host ---
    const codexDir = path.join(cwd, ".codex");
    const codexPresent = fs.existsSync(codexDir);
    // --- antigravity host ---
    const antigravityPresent = detectInstalledHostModules(cwd).has("antigravity");
    const opencodeStatus = opencodePresent
        ? `INSTALLED  (${providerLabel}: ${opencodeProviderDisplay} / ${opencodeModel})`
        : "absent (run: bkit install --opencode=<provider>)";
    console.log(`${logPrefix} opencode: ${opencodeStatus}`);
    console.log(`${logPrefix} codex:   ${codexPresent ? "INSTALLED  (provider: openai)" : "absent (run: bkit install --codex)"}`);
    console.log(`${logPrefix} antigravity: ${antigravityPresent ? "INSTALLED  (provider: google)" : "absent (run: bkit install --antigravity)"}`);
    // --- summary ---
    const installedHosts = [
        claudePresent ? "claude" : null,
        cursorPresent ? "cursor" : null,
        opencodePresent ? "opencode" : null,
        codexPresent ? "codex" : null,
        antigravityPresent ? "antigravity" : null,
    ].filter(Boolean);
    console.log(`${logPrefix} Installed hosts: ${installedHosts.length > 0 ? installedHosts.join(", ") : "none"}`);
}
export async function runDoctor(modules, opencodeProvider) {
    setLogPrefix("[bkit-doctor]");
    console.log(`${LOG_PREFIX} Running advisory scan (no managed-file writes)`);
    console.log(`${LOG_PREFIX} Payload roots: core=${getCoreRoot()} shared=${getSharedRoot()} templates=${getTemplatesRoot()}`);
    const { blockers, advisories: preflightAdvisories } = runPreflight(modules, process.cwd());
    const suppressed = [];
    const allFindings = runPostInstallCheck([...preflightAdvisories, ...blockers], process.cwd(), suppressed);
    // Broken install: the opencode host is on disk but neither provider signal survives.
    // `bkit check` and `bkit upgrade` exit 1 with the fix; doctor reports it here and does
    // not enforce.
    if (fs.existsSync(path.join(process.cwd(), ".opencode"))) {
        if (detectOpencodeProvider(process.cwd()) === null) {
            allFindings.push({
                id: "opencode-provider-missing",
                severity: "blocker",
                detect: "`.opencode/` is present but no provider is recorded — neither package.json `bkit.opencodeProvider` nor an `opencode.json` provider block.",
                action: `Re-run \`bkit install --opencode=<provider>\` (${OPENCODE_PROVIDERS.join(", ")}). Until then \`bkit check\` and \`bkit upgrade\` exit 1 rather than render every agent pin against a substitute provider.`,
            });
        }
    }
    const { tips, suppressed: suppressedTips } = collectTips(process.cwd());
    suppressed.push(...suppressedTips);
    const banner = formatChecklist(allFindings, suppressed, tips);
    if (banner) {
        console.log(banner);
    }
    else {
        console.log(`${LOG_PREFIX} No advisories found.`);
    }
    writeAdvisoriesArtifact(allFindings, {
        cwd: process.cwd(),
        mode: "doctor",
        version: readInstallingVersion(),
        logPrefix: LOG_PREFIX,
        suppressed,
        tips,
    });
    // opencode host diagnostics: report required tools and cred presence per provider.
    // Never echoes key values — only reports present/absent.
    const opencodeDir = path.join(process.cwd(), ".opencode");
    if (fs.existsSync(opencodeDir) || modules.has("opencode")) {
        console.log(`${LOG_PREFIX} --- opencode host diagnostics ---`);
        // Check opencode binary
        const { spawnSync: spawnSyncLocal } = await import("node:child_process");
        const whichResult = spawnSyncLocal("which", ["opencode"], { encoding: "utf-8" });
        const opencodeInstalled = whichResult.status === 0 && whichResult.stdout.trim().length > 0;
        console.log(`${LOG_PREFIX} opencode binary: ${opencodeInstalled ? "FOUND (" + whichResult.stdout.trim() + ")" : "NOT FOUND (install opencode first)"}`);
        // Resolve provider: manifest-first (detectOpencodeProvider) so managed-auth gateways
        // (opencode — no provider block beyond the minimal apiKey entry) are still detected;
        // the `--opencode=` flag, if given this run, overrides.
        let detectedProvider = detectOpencodeProvider(process.cwd());
        if (opencodeProvider)
            detectedProvider = opencodeProvider;
        // Multi-provider: all installed providers. bkit.opencodeProviders when populated,
        // else the single detected provider.
        const allProviders = detectOpencodeProviders(process.cwd());
        const activeProvider = detectedProvider ?? allProviders[0] ?? null;
        const providersToCheck = allProviders.length > 0 ? allProviders : activeProvider ? [activeProvider] : [];
        // Per-provider cred check (present/absent only — no value echoed).
        // Every provider names one API key. Any provider absent here falls back to
        // `BKIT_${PROVIDER}_API_KEY` (see below).
        const PROVIDER_KEYS = {
            openrouter: ["BKIT_OPENROUTER_API_KEY"],
            ollama: ["BKIT_OLLAMA_API_KEY"], // Ollama cloud endpoint (ollama.com)
            "opencode-zen": ["BKIT_OPENCODE_API_KEY"], // opencode-native gateway (Zen; https://opencode.ai/zen/v1)
            "opencode-go": ["BKIT_OPENCODE_API_KEY"], // opencode-native gateway (Go; https://opencode.ai/zen/go/v1)
        };
        if (providersToCheck.length === 0) {
            console.log(`${LOG_PREFIX} Provider not detected — run \`bkit install --opencode=<provider>\` first`);
        }
        else {
            for (const provider of providersToCheck) {
                const roleLabel = provider === activeProvider ? "(active)" : "(installed)";
                console.log(`${LOG_PREFIX} --- ${provider} ${roleLabel} ---`);
                const keys = PROVIDER_KEYS[provider] ?? [`BKIT_${provider.toUpperCase()}_API_KEY`];
                for (const key of keys) {
                    const present = Boolean(process.env[key] && process.env[key].trim().length > 0);
                    console.log(`${LOG_PREFIX} ${key}: ${present ? "PRESENT" : "ABSENT (required for provider " + provider + ")"}`);
                }
            }
        }
    }
    // GUI-isolation check: flag any .bkit/.env keys that are set (non-empty) in the
    // file but absent or empty in process.env. This happens when the app was launched
    // via Dock/Finder (launchd) rather than from a direnv-active terminal — the env
    // vars never make it into the process. The finding points at `bkit cursor` /
    // `bkit opencode`.
    const bkitEnvPath = path.join(process.cwd(), ".bkit", ".env");
    if (fs.existsSync(bkitEnvPath)) {
        const fileVars = new Map(parseDotenv(fs.readFileSync(bkitEnvPath, "utf-8")));
        const guiMissing = [];
        for (const [key, value] of fileVars) {
            if (!value || value.trim() === "")
                continue; // skip blank placeholders
            const inProcess = process.env[key] && process.env[key].trim().length > 0;
            if (!inProcess)
                guiMissing.push(key);
        }
        if (guiMissing.length > 0) {
            console.log(`${LOG_PREFIX} --- GUI-isolation advisory ---\n` +
                `${LOG_PREFIX} The following keys are set in .bkit/.env but are NOT present in this\n` +
                `${LOG_PREFIX} process environment (GUI apps launched from Dock/Finder do not\n` +
                `${LOG_PREFIX} inherit the login shell / direnv env):\n` +
                guiMissing.map((k) => `${LOG_PREFIX}   ${k}`).join("\n") +
                "\n" +
                `${LOG_PREFIX} Fix: launch the app via \`bkit cursor\` or \`bkit opencode\` — these\n` +
                `${LOG_PREFIX} verbs exec the binary directly with .bkit/.env merged in.`);
        }
        else {
            const nonBlankCount = [...fileVars.values()].filter((v) => v.trim() !== "").length;
            if (nonBlankCount > 0) {
                console.log(`${LOG_PREFIX} GUI-isolation: all .bkit/.env keys are present in this process env (OK)`);
            }
        }
    }
}
