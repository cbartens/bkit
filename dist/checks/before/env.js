// checks/before/env.ts — local env: `.bkit/.env` missing or with blank keys, direnv missing or
// not allowed.
import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
// ---------------------------------------------------------------------------
// [mcp-env] advisories — direnv + .bkit/.env setup (BAR-260)
// ---------------------------------------------------------------------------
/** The token a tracker's MCP server reads from `.bkit/.env`, beside `BKIT_GH_TOKEN`. */
const TRACKER_TOKENS = {
    linear: {
        key: "BKIT_LINEAR_API_KEY",
        description: "Linear personal API key for the Linear MCP server and the Linear preflight hook (generate at https://linear.app/settings/api)",
    },
    jira: {
        key: "BKIT_JIRA_API_KEY",
        description: 'Atlassian API token with scopes for the app "Atlassian MCP V2", sent as Bearer to the Jira MCP server (create at https://id.atlassian.com/manage-profile/security/api-tokens; see .bkit/trackers.md § jira)',
    },
};
/** The token names `tracker` needs, `BKIT_GH_TOKEN` first. */
function tokenKeys(tracker) {
    const own = TRACKER_TOKENS[tracker];
    return own ? ["BKIT_GH_TOKEN", own.key] : ["BKIT_GH_TOKEN"];
}
/**
 * Advisory: .bkit/.env.example exists but .bkit/.env does not.
 * Consumer ran `bkit install` (which seeds .env.example) but has not yet
 * copied it to .bkit/.env and filled in their tokens.
 */
// `tracker` adds its own token to the token prose (`TRACKER_TOKENS`). Defaults to
// `linear`; the real Phase-3 caller passes the consumer's resolved `bkit.tracker.default`.
export function detectMissingDotenv(cwd, tracker = "linear") {
    const examplePath = path.join(cwd, ".bkit", ".env.example");
    const envPath = path.join(cwd, ".bkit", ".env");
    if (!fs.existsSync(examplePath))
        return null;
    if (fs.existsSync(envPath))
        return null;
    const tokens = tokenKeys(tracker).join(", ");
    return {
        id: "mcp-env-missing-dotenv",
        severity: "advisory",
        detect: `.bkit/.env.example exists but .bkit/.env does not. MCP servers and agent tooling will not have access to ${tokens}.`,
        action: `[mcp-env] Copy .bkit/.env.example to .bkit/.env and fill in your tokens (${tokens}) — in a git worktree, copy the main checkout's .bkit/.env instead, or run \`bkit worktrees setup\` to link it. Then run \`direnv allow\` to auto-export them into your shell. .bkit/.env is gitignored and safe to commit-skip.`,
    };
}
/**
 * Advisory: .bkit/.env exists but one or more required keys are blank or absent.
 * Returns one finding per missing/blank key.
 */
export function detectBlankDotenvKeys(cwd, tracker = "linear") {
    const envPath = path.join(cwd, ".bkit", ".env");
    if (!fs.existsSync(envPath))
        return [];
    const content = fs.readFileSync(envPath, "utf-8");
    const lines = content.split("\n");
    // Build a map of key → value from the .env file (ignore comments and blank lines)
    const kvMap = new Map();
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#"))
            continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1)
            continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        kvMap.set(key, value);
    }
    const REQUIRED_KEYS = [
        {
            key: "BKIT_GH_TOKEN",
            description: "fine-grained PAT for the GitHub MCP server (Contents, Pull requests, Issues, Actions, Workflows, Metadata — read/write), or a classic PAT when one token must span owners",
        },
        // A tracker token is required only under its tracker.
        ...(TRACKER_TOKENS[tracker] ? [TRACKER_TOKENS[tracker]] : []),
    ];
    const findings = [];
    for (const { key, description } of REQUIRED_KEYS) {
        const value = kvMap.get(key);
        if (value !== undefined && value !== "")
            continue;
        const reason = value === undefined
            ? `${key} is absent from .bkit/.env`
            : `${key} is set but has an empty value in .bkit/.env`;
        findings.push({
            id: `mcp-env-blank-key-${key.toLowerCase()}`,
            severity: "advisory",
            detect: `${reason}. The associated service will not authenticate.`,
            action: `[mcp-env] Set ${key} in .bkit/.env — ${description}. After editing, run \`direnv allow\` (or re-enter the directory) to reload the env.`,
        });
    }
    return findings;
}
/**
 * Returns true when running in a cloud/CI environment where direnv is not
 * applicable (agent reads env vars from the platform dashboard instead).
 */
export function isCloudOrCi() {
    return !!(process.env.CI || process.env.CLAUDE_CODE_REMOTE || process.env.CURSOR_REMOTE_AGENT);
}
/**
 * Advisory: direnv is not installed.
 * Short-circuits in CI / cloud environments where direnv is irrelevant.
 */
export function detectDirenvMissing(cwd, tracker = "linear") {
    if (isCloudOrCi())
        return null;
    // Only meaningful when .envrc exists (the consumer's copy of bkit's template)
    const envrcPath = path.join(cwd, ".envrc");
    if (!fs.existsSync(envrcPath))
        return null;
    const result = spawnSync("which", ["direnv"], { encoding: "utf-8" });
    if (result.status === 0 && result.stdout.trim())
        return null;
    const editKeys = tokenKeys(tracker).join(", ");
    const exportKeys = tokenKeys(tracker).join(" / ");
    return {
        id: "mcp-env-direnv-missing",
        severity: "advisory",
        detect: ".envrc exists but direnv is not installed. .bkit/.env will not be auto-loaded into your shell.",
        action: "[mcp-env] direnv auto-loads .bkit/.env into your shell on cd, so tokens stay scoped to the repo. Set it up:\n\n" +
            "    # 1. One-time per machine — install direnv\n" +
            "    brew install direnv                                              # macOS\n" +
            "    # Linux / other: https://direnv.net/docs/installation.html\n\n" +
            "    # 2. One-time per machine — add the shell hook, then reload\n" +
            "    echo 'eval \"$(direnv hook zsh)\"' >> ~/.zshrc && source ~/.zshrc\n" +
            "    # bash: echo 'eval \"$(direnv hook bash)\"' >> ~/.bashrc && source ~/.bashrc\n\n" +
            "    # 3. One-time per repo — copy the example, fill in tokens, allow\n" +
            "    cp .bkit/.env.example .bkit/.env                             # if not already done\n" +
            `    # edit .bkit/.env: set ${editKeys}\n` +
            "    direnv allow\n\n" +
            `After step 3, restart Claude Code / Cursor sessions in this repo so the new env reaches their MCP servers. Alternative if you do not want direnv: export ${exportKeys} in ~/.zshrc or ~/.bashrc directly — works but leaks tokens into every shell on this machine.`,
    };
}
/**
 * Advisory: direnv is installed but the .envrc is blocked (not allowed).
 * Short-circuits in CI / cloud environments.
 */
export function detectDirenvNotAllowed(cwd, tracker = "linear") {
    if (isCloudOrCi())
        return null;
    // Only meaningful when .envrc exists
    const envrcPath = path.join(cwd, ".envrc");
    if (!fs.existsSync(envrcPath))
        return null;
    // Check direnv is installed first
    const whichResult = spawnSync("which", ["direnv"], { encoding: "utf-8" });
    if (whichResult.status !== 0 || !whichResult.stdout.trim())
        return null;
    // Run `direnv status` and check whether the .envrc is allowed
    const statusResult = spawnSync("direnv", ["status"], {
        cwd,
        encoding: "utf-8",
        timeout: 5000,
    });
    const statusOutput = (statusResult.stdout ?? "") + (statusResult.stderr ?? "");
    // direnv status reports "Found RC allowed false" or "Found RC path ... Blocked" when not allowed
    if (/Found RC\s+allowed\s+false/i.test(statusOutput) ||
        /state:\s*blocked/i.test(statusOutput) ||
        /not allowed/i.test(statusOutput)) {
        return {
            id: "mcp-env-direnv-not-allowed",
            severity: "advisory",
            detect: "direnv is installed but the .envrc in this repo is blocked. .bkit/.env is not being auto-loaded.",
            action: `[mcp-env] Run \`direnv allow\` in this repo to trust the .envrc and enable auto-load of .bkit/.env. direnv will then export ${tokenKeys(tracker).join(" and ")} into your shell whenever you cd into the repo.`,
        };
    }
    return null;
}
