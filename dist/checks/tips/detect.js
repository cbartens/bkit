// checks/tips/detect.ts — local-only probes the setup-tip catalogue keys on: host MCP
// configs, host settings files, lint-staged config forms. No network.
import * as fs from "node:fs";
import * as path from "node:path";
import { parseJson } from "../../shared/json.js";
import { readPackageJson } from "../../shared/package-json.js";
/** True when `rel` exists under `cwd`. */
export const exists = (cwd, rel) => fs.existsSync(path.join(cwd, rel));
/** Parsed JSON object at `rel`, or `null` when absent, unparseable or not an object. */
function readJsonObject(cwd, rel) {
    const p = path.join(cwd, rel);
    if (!fs.existsSync(p))
        return null;
    const parsed = parseJson(fs.readFileSync(p, "utf-8"));
    if (!parsed.ok)
        return null;
    const value = parsed.value;
    return typeof value === "object" && value !== null && !Array.isArray(value)
        ? value
        : null;
}
/** Text of `rel`, or `""` when absent. */
function readText(cwd, rel) {
    const p = path.join(cwd, rel);
    return fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : "";
}
/** Codex `[mcp_servers.<name>]` tables and their `url` keys. */
function codexMcpServers(toml) {
    const out = [];
    let current = null;
    for (const line of toml.split(/\r?\n/)) {
        const header = /^\s*\[([^\]]+)\]\s*$/.exec(line);
        if (header) {
            const m = /^mcp_servers\.("?)([^"]+)\1$/.exec(header[1].trim());
            current = m ? { name: m[2], url: null } : null;
            if (current)
                out.push(current);
            continue;
        }
        const url = /^\s*url\s*=\s*"([^"]*)"/.exec(line);
        if (current && url)
            current.url = url[1];
    }
    return out;
}
/**
 * Every MCP server configured for any host: `.mcp.json` and `.cursor/mcp.json`
 * (`mcpServers`), `.opencode/opencode.json` (`mcp`), `.codex/config.toml`
 * (`[mcp_servers.<name>]`).
 */
export function listMcpServers(cwd) {
    const out = [];
    const fromMap = (file, map) => {
        if (typeof map !== "object" || map === null)
            return;
        for (const [name, entry] of Object.entries(map)) {
            const url = entry?.url;
            out.push({ file, name, url: typeof url === "string" ? url : null });
        }
    };
    fromMap(".mcp.json", readJsonObject(cwd, ".mcp.json")?.mcpServers);
    fromMap(".cursor/mcp.json", readJsonObject(cwd, ".cursor/mcp.json")?.mcpServers);
    fromMap(".opencode/opencode.json", readJsonObject(cwd, ".opencode/opencode.json")?.mcp);
    for (const s of codexMcpServers(readText(cwd, ".codex/config.toml"))) {
        out.push({ file: ".codex/config.toml", ...s });
    }
    return out;
}
/** True when any host config declares an MCP server named `name`. */
export const hasMcpServer = (cwd, name) => listMcpServers(cwd).some((s) => s.name === name);
/**
 * Remote MCP services that accept a URL locked to one account + project, and the test
 * for a locked URL. A locked server hides its ID-lookup tools and defaults every call to
 * that project.
 */
const SCOPABLE_MCP_HOSTS = [
    // https://mcp.sentry.dev/mcp/<org>/<project>
    {
        host: "mcp.sentry.dev",
        locked: (u) => u.pathname.split("/").filter(Boolean).length >= 3,
    },
    // https://mcp.supabase.com/mcp?project_ref=<ref>
    { host: "mcp.supabase.com", locked: (u) => u.searchParams.has("project_ref") },
    // https://mcp.vercel.com/<team>/<project>
    {
        host: "mcp.vercel.com",
        locked: (u) => u.pathname.split("/").filter(Boolean).length >= 2,
    },
];
/** MCP servers on a lockable service whose URL is not locked to one project. */
export function unlockedMcpServers(cwd) {
    return listMcpServers(cwd).filter((s) => {
        if (!s.url || !URL.canParse(s.url))
            return false;
        const url = new URL(s.url);
        const service = SCOPABLE_MCP_HOSTS.find((h) => h.host === url.hostname);
        return service !== undefined && !service.locked(url);
    });
}
/** True when `.claude/settings.json` or `.claude/settings.local.json` sets `key`. */
export function claudeSettingsHas(cwd, key) {
    return [".claude/settings.json", ".claude/settings.local.json"].some((rel) => {
        const settings = readJsonObject(cwd, rel);
        return settings !== null && key in settings;
    });
}
/** True when `.codex/config.toml` sets `key` at top level (above the first table header). */
export function codexTopLevelHas(cwd, key) {
    const topLevel = readText(cwd, ".codex/config.toml").split(/^\s*\[/m)[0] ?? "";
    return new RegExp(`^\\s*${key}\\s*=`, "m").test(topLevel);
}
const LINT_STAGED_CONFIGS = [
    ".lintstagedrc",
    ".lintstagedrc.json",
    ".lintstagedrc.yaml",
    ".lintstagedrc.yml",
    ".lintstagedrc.mjs",
    ".lintstagedrc.cjs",
    ".lintstagedrc.js",
    "lint-staged.config.mjs",
    "lint-staged.config.cjs",
    "lint-staged.config.js",
];
/** True when lint-staged is configured: any of its config files, or `package.json` `lint-staged`. */
export function hasLintStagedConfig(cwd) {
    if (LINT_STAGED_CONFIGS.some((rel) => exists(cwd, rel)))
        return true;
    const pkg = readPackageJson(cwd);
    return pkg.ok && pkg.pkg["lint-staged"] !== undefined;
}
