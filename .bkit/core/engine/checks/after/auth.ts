// checks/after/auth.ts — credentials: the GitHub-MCP token, GitHub repo secrets (incl.
// the cloud router's), and the cloud-dashboard secrets checklist.

import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import type { PreflightFinding } from "../before/index.js";
import { readBkitConfig } from "../../shared/settings.js";

// ---------------------------------------------------------------------------
// Token-surface detectors
// ---------------------------------------------------------------------------

export type TokenPresence = "present" | "missing" | "empty" | "unknown";

/**
 * Detect whether BKIT_GH_TOKEN is set in the shell environment. Distinguishes
 * empty from unset so action text can guide the user precisely. Never reads the
 * token value beyond truthiness. BKIT_GH_TOKEN authenticates the GitHub MCP
 * server (`Authorization: Bearer ${BKIT_GH_TOKEN}` in .mcp.json), which powers
 * the entire tracker + PR + Projects MCP surface.
 */
export function detectShellGhMcpToken(): TokenPresence {
  if (process.env.BKIT_GH_TOKEN === undefined) return "missing";
  if (process.env.BKIT_GH_TOKEN === "") return "empty";
  return "present";
}

/**
 * True when a `github` MCP server is configured in `.mcp.json` or
 * `.cursor/mcp.json` — i.e. BKIT_GH_TOKEN is actually consumed for MCP auth. Used to
 * gate the BKIT_GH_TOKEN shell advisory so it never fires in repos that use bkit for
 * CI only (no agent workflows / MCP servers).
 */
export function hasGithubMcpServer(cwd: string): boolean {
  for (const rel of [".mcp.json", path.join(".cursor", "mcp.json")]) {
    const p = path.join(cwd, rel);
    if (!fs.existsSync(p)) continue;
    try {
      const cfg = JSON.parse(fs.readFileSync(p, "utf-8")) as Record<string, unknown>;
      const servers = cfg.mcpServers as Record<string, unknown> | undefined;
      if (servers?.github) return true;
    } catch {
      // Malformed config — ignore; a JSON-drift advisory covers that separately.
    }
  }
  return false;
}

/**
 * BKIT_GH_TOKEN unset or empty in the shell while a `github` MCP server is configured.
 * Never in CI. The GitHub MCP server authenticates with `Authorization: Bearer
 * ${BKIT_GH_TOKEN}` in .mcp.json, which powers the entire tracker + PR + Projects MCP
 * surface.
 */
export function detectGhMcpToken(cwd: string): PreflightFinding | null {
  if (!hasGithubMcpServer(cwd) || process.env.CI) return null;
  const status = detectShellGhMcpToken();
  if (status === "missing") {
    return {
      id: "gh-mcp-token-unset-shell",
      severity: "advisory",
      detect:
        "BKIT_GH_TOKEN is not set in the shell environment (undefined). The GitHub MCP server authenticates with `Authorization: Bearer ${BKIT_GH_TOKEN}` — without it, every tracker, PR, and board MCP call fails to connect.",
      action:
        "Set BKIT_GH_TOKEN in .bkit/.env (canonical local-secrets file, gitignored), then `direnv allow` and restart your editor so MCP servers pick it up:\n\n    cp .bkit/.env.example .bkit/.env       # if not already done\n    # edit .bkit/.env — set BKIT_GH_TOKEN=<PAT>\n    direnv allow\n\nUse a fine-grained PAT when every target repo sits under one owner (Contents, Pull requests, Issues, and Actions read & write, plus organization-scoped Projects read & write if you use board sync); use a classic PAT when one token must span owners (scopes repo / workflow / read:org / project / security_events). Generate at: https://github.com/settings/personal-access-tokens (fine-grained) or https://github.com/settings/tokens (classic). In cloud sessions (Claude Code web / Cursor Background Agents) set BKIT_GH_TOKEN in the dashboard env vars instead — repo files are not read for secrets there.",
    };
  }
  if (status === "empty") {
    return {
      id: "gh-mcp-token-empty-shell",
      severity: "advisory",
      detect:
        'BKIT_GH_TOKEN is set to an empty string (BKIT_GH_TOKEN=""). The GitHub MCP server sends an empty bearer token and fails to authenticate — distinct from unset, same effect.',
      action:
        "Set a non-empty BKIT_GH_TOKEN in .bkit/.env (fine-grained PAT for one owner, or classic across owners; Contents / Pull requests / Issues / Actions read & write), then `direnv allow` and restart your editor so MCP servers reload.",
    };
  }
  return null;
}

/**
 * Detect whether a named secret is set on the consumer's GitHub repo.
 * Returns "present" | "missing" | "unknown".
 * "unknown" if gh CLI unavailable, unauthenticated, or not a GitHub repo.
 */
export function detectGhSecret(secretName: string): TokenPresence {
  try {
    const out = execSync(`gh secret list --json name -q '.[].name'`, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 5000,
    });
    const names = out
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    return names.includes(secretName) ? "present" : "missing";
  } catch {
    return "unknown";
  }
}

/**
 * Build the consolidated "three locations to sync secrets" advisory. Fires when
 * the consumer's repo has bkit-cloud.yml installed OR a
 * .claude/ or .cursor/ install present — both indicate cloud-side agent use,
 * which means the same three secrets need to be set in three places (GitHub
 * Actions, Cursor Settings online, Claude app web).
 *
 * Returns null when none of the three trigger paths exist.
 */
export function buildCloudDashboardsAdvisory(cwd: string): PreflightFinding | null {
  const hasRouter = fs.existsSync(path.join(cwd, ".github", "workflows", "bkit-cloud.yml"));
  const hasClaude = fs.existsSync(path.join(cwd, ".claude"));
  const hasCursor = fs.existsSync(path.join(cwd, ".cursor"));
  if (!hasRouter && !hasClaude && !hasCursor) return null;

  // cloud=claude path (bkit-cloud.yml): GitHub-tracker only, ANTHROPIC_API_KEY only.
  // cloud=cursor path (.cursor/): BKIT_LINEAR_API_KEY for Cursor dashboard.
  // Distinguish by recorded variant; fall back to presence-based detection.
  const recordedVariant = readBkitConfig(cwd).cloudAgents;
  const isCursorCloud = recordedVariant === "cursor" || (!hasRouter && hasCursor);

  const secretList = isCursorCloud ? "`BKIT_LINEAR_API_KEY`" : "`ANTHROPIC_API_KEY`";
  const ghSetLines = isCursorCloud
    ? "       gh secret set BKIT_LINEAR_API_KEY    --body='<value>'\n\n" +
      "       Verify: `gh secret list | grep -E 'BKIT_LINEAR_API_KEY'`\n\n"
    : "       gh secret set ANTHROPIC_API_KEY --body='<value>'\n\n" +
      "       Verify: `gh secret list | grep -E 'ANTHROPIC_API_KEY'`\n\n";
  const vendorNote = isCursorCloud
    ? "BKIT_LINEAR_API_KEY is read from the Linear dashboard (https://linear.app/settings/api)."
    : "ANTHROPIC_API_KEY is read from the Anthropic dashboard (https://console.anthropic.com/settings/keys); `.bkit/.env` holds the same value as BKIT_ANTHROPIC_API_KEY. The Claude GitHub App (`/install-github-app`) is also required for `cloud=claude`.";
  return {
    id: "cloud-secrets-three-locations",
    severity: "advisory",
    detect: `The secrets used by bkit's cloud integration (${secretList}) must also be set in the relevant cloud dashboards. Bkit cannot verify dashboard state — surface the checklist so you don't ship a half-configured cloud setup.`,
    action:
      "Set each secret in the required locations:\n\n" +
      "1. **GitHub Actions** (used by bkit-cloud.yml and your own workflows):\n" +
      ghSetLines +
      "2. **Cursor Cloud Agents** (used by Cursor's cloud agent runner): open `https://cursor.com/dashboard/cloud-agents` → your environment → **Secrets** tab. Add each secret as a **Runtime Secret** (loaded as an env var, redacted from the agent's transcript). Cursor reads `.cursor/Dockerfile` + `.cursor/environment.json` from the repo but secrets come from this dashboard only; the resolved paste-ready values are in `.cursor/bkit-cloud.md` (gitignored).\n\n" +
      "3. **Claude Code (web)** (used by Claude.ai's cloud agent runner): open `https://claude.ai/code` → Settings → Setup → Environment Variables. Add each secret. Claude reads its setup script from the dashboard, NOT from the repo, so changes here do not require a commit.\n\n" +
      "**Context-fetch (`/bkit-debug` in the cloud):** if you run the debug workflow in these cloud agents, the observability creds your `.agents/context.md` context-fetch blocks use (e.g. `VERCEL_TOKEN`, `SUPABASE_ACCESS_TOKEN`) must ALSO be set in the same dashboards above — non-interactively, since headless agents cannot `vercel login`. These are operator/observability READ creds, not app-runtime secrets. Commit the non-secret selectors (team scope / project ref / `--environment`) in your copied block so they need no dashboard entry. The CLIs those blocks call install automatically in the cloud from each block's `context-fetch:provision` sibling — no manual setup.\n\n" +
      "Same VALUE in all places. " +
      vendorNote,
  };
}

/**
 * Detect whether the GitHub Actions secrets `bkit-cloud.yml` needs are set.
 * Only fires when `.github/workflows/bkit-cloud.yml` exists. `ANTHROPIC_API_KEY` is
 * always required (claude-code-action) for the cloud=claude path. The workflow is
 * GitHub-tracker only — no `BKIT_LINEAR_API_KEY` dependency. Returns one finding per
 * missing secret.
 */
export function detectCiRouterSecrets(cwd: string): PreflightFinding[] {
  const findings: PreflightFinding[] = [];
  const routerPath = path.join(cwd, ".github", "workflows", "bkit-cloud.yml");
  if (!fs.existsSync(routerPath)) return findings;
  // bkit-cloud.yml is cloud=claude / GitHub-tracker only — ANTHROPIC_API_KEY (GHA secret
  // name claude-code-action reads). Local `.bkit/.env` stores the same value as
  // BKIT_ANTHROPIC_API_KEY. No BKIT_LINEAR_API_KEY dependency.
  const required = ["ANTHROPIC_API_KEY"];
  for (const name of required) {
    const status = detectGhSecret(name);
    if (status === "missing") {
      findings.push({
        id: `${name.toLowerCase().replace(/_/g, "-")}-secret-missing`,
        severity: "advisory",
        detect: `gh secret list confirms ${name} secret is NOT set on this GitHub repo.`,
        action:
          `\`.github/workflows/bkit-cloud.yml\` requires ${name} to invoke its Claude Code action. Without it, the workflow exits no-op.\n\nSet the secret:\n\n` +
          `    gh secret set ${name} --body='<paste-value-here>'\n\n` +
          `Then verify: \`gh secret list | grep ${name}\`. The workflow itself does not need redeploying — secrets are read at run time.`,
      });
    }
    // "unknown" → silent skip (CLI absent / unauthenticated).
  }
  return findings;
}
