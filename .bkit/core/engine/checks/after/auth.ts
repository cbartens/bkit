// checks/after/auth.ts — credentials: the GitHub-MCP token, GitHub repo secrets (incl.
// the cloud router's), and the cloud-dashboard secrets checklist.

import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import type { PreflightFinding } from "../before/index.js";
import { readJsonFile } from "../../shared/json.js";
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
    // Malformed config — ignore; a JSON-drift advisory covers that separately.
    const cfg = readJsonFile(p);
    if (!cfg.ok || typeof cfg.value !== "object" || cfg.value === null) continue;
    const servers = (cfg.value as Record<string, unknown>).mcpServers as
      Record<string, unknown> | undefined;
    if (servers?.github) return true;
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
 * Names of the consumer repo's GitHub Actions secrets or variables (repo level only).
 * `null` if gh CLI unavailable, unauthenticated, or not a GitHub repo.
 */
function listGhNames(kind: "secret" | "variable"): string[] | null {
  const res = spawnSync("gh", [kind, "list", "--json", "name", "-q", ".[].name"], {
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "ignore"],
    timeout: 5000,
  });
  if (res.status !== 0 || typeof res.stdout !== "string") return null;
  return res.stdout
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Detect whether a named secret is set on the consumer's GitHub repo.
 * Returns "present" | "missing" | "unknown".
 * "unknown" if gh CLI unavailable, unauthenticated, or not a GitHub repo.
 */
export function detectGhSecret(secretName: string): TokenPresence {
  const names = listGhNames("secret");
  if (names === null) return "unknown";
  return names.includes(secretName) ? "present" : "missing";
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

  // cloud=claude path (bkit-cloud.yml): GitHub-tracker only, ANTHROPIC_API_KEY or federation.
  // cloud=cursor path (.cursor/): BKIT_LINEAR_API_KEY for Cursor dashboard.
  // Distinguish by recorded variant; fall back to presence-based detection.
  const recordedVariant = readBkitConfig(cwd).cloudAgents;
  const isCursorCloud = recordedVariant === "cursor" || (!hasRouter && hasCursor);

  const secretList = isCursorCloud ? "`BKIT_LINEAR_API_KEY`" : "`ANTHROPIC_API_KEY`";
  const ghSetLines = isCursorCloud
    ? "       gh secret set BKIT_LINEAR_API_KEY    --body='<value>'\n\n" +
      "       Verify: `gh secret list | grep -E 'BKIT_LINEAR_API_KEY'`\n\n"
    : "       gh secret set ANTHROPIC_API_KEY --body='<value>'\n\n" +
      "       Verify: `gh secret list | grep -E 'ANTHROPIC_API_KEY'`\n\n" +
      "       Keyless alternative for bkit-cloud.yml (workload identity federation): leave the secret unset and set the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables (`gh variable set`) from a Claude Console federation rule.\n\n";
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

/** Repo variables that, both set, switch bkit-cloud.yml's claude job to workload identity federation. */
const FEDERATION_VARIABLES = ["ANTHROPIC_FEDERATION_RULE_ID", "ANTHROPIC_ORGANIZATION_ID"];

/**
 * Detect whether `bkit-cloud.yml`'s claude job has a credential. Only fires when
 * `.github/workflows/bkit-cloud.yml` exists. The claude job (claude-code-action) takes the
 * `ANTHROPIC_API_KEY` repo secret OR workload identity federation (both
 * `FEDERATION_VARIABLES` repo variables). The workflow is GitHub-tracker only — no
 * `BKIT_LINEAR_API_KEY` dependency. Silent when gh cannot list secrets or variables.
 */
export function detectCiRouterSecrets(cwd: string): PreflightFinding[] {
  const routerPath = path.join(cwd, ".github", "workflows", "bkit-cloud.yml");
  if (!fs.existsSync(routerPath)) return [];
  const key = detectGhSecret("ANTHROPIC_API_KEY");
  const variables = listGhNames("variable");
  if (key === "unknown" || variables === null) return [];
  const federated = FEDERATION_VARIABLES.every((v) => variables.includes(v));

  if (key === "present" && federated) {
    return [
      {
        id: "anthropic-api-key-shadows-federation",
        severity: "advisory",
        detect:
          "The `ANTHROPIC_API_KEY` repo secret and the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables are all set. claude-code-action uses the key and skips workload identity federation.",
        action:
          "To run keyless, delete the secret: `gh secret delete ANTHROPIC_API_KEY`. To stay on the key, delete the variables: `gh variable delete ANTHROPIC_FEDERATION_RULE_ID` and `gh variable delete ANTHROPIC_ORGANIZATION_ID`.",
      },
    ];
  }
  if (key === "present") return [];

  if (federated) {
    if (fs.readFileSync(routerPath, "utf-8").includes("anthropic_federation_rule_id:")) return [];
    return [
      {
        id: "anthropic-federation-template-stale",
        severity: "advisory",
        detect:
          "The `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables are set, but `.github/workflows/bkit-cloud.yml` does not pass `anthropic_federation_rule_id` to claude-code-action — the claude job exits no-op.",
        action:
          "Re-copy the template: `cp .bkit/templates/.github/workflows/bkit-cloud.yml .github/workflows/bkit-cloud.yml`, then re-apply your own edits (the `runs-on` runner at minimum).",
      },
    ];
  }

  return [
    {
      id: "anthropic-api-key-secret-missing",
      severity: "advisory",
      detect:
        "gh confirms neither the `ANTHROPIC_API_KEY` repo secret nor both `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables are set on this GitHub repo.",
      action:
        "`.github/workflows/bkit-cloud.yml`'s claude job needs one claude credential; without it, the job exits no-op. Set ONE of:\n\n" +
        "- API key:\n\n    gh secret set ANTHROPIC_API_KEY --body='<paste-value-here>'\n\n" +
        "- Workload identity federation (keyless): Claude Console → Settings → Workload identity → Connect workload → GitHub Actions creates the issuer, service account and federation rule. Then:\n\n" +
        "    gh variable set ANTHROPIC_FEDERATION_RULE_ID --body='fdrl_...'\n" +
        "    gh variable set ANTHROPIC_ORGANIZATION_ID --body='<organization-uuid>'\n\n" +
        "  Optional: `ANTHROPIC_SERVICE_ACCOUNT_ID` (`svac_...`) and `ANTHROPIC_WORKSPACE_ID` (`wrkspc_...`, needed when the rule covers more than one workspace).\n\n" +
        "Then verify: `gh secret list` / `gh variable list`. The workflow itself does not need redeploying — both are read at run time.",
    },
  ];
}
