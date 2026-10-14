// checks/after/github.ts — GitHub repo settings and tracker setup: branch protection, Actions
// write permission, tracker choice, the projects toolset and project field ids, and the cloud
// auto-routing workflow.
import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { parseIssueTracker, DEFAULT_ISSUE_TRACKER, parseCloudAgents, DEFAULT_CLOUD_AGENTS, } from "../../install/manifest.js";
/**
 * Detect whether branch protection is configured on `main`.
 * Returns "present" | "missing" | "unknown".
 * "unknown" if gh CLI is unavailable, unauthenticated, or not a GitHub repo;
 * "missing" if the API returns 404 (no protection rule); "present" otherwise.
 */
export function detectMainBranchProtection() {
    try {
        execFileSync("gh", ["api", "repos/{owner}/{repo}/branches/main/protection"], {
            stdio: ["ignore", "pipe", "pipe"],
            timeout: 5000,
        });
        return "present";
    }
    catch (err) {
        const stderr = err.stderr?.toString() ?? "";
        if (stderr.includes("Branch not protected") || stderr.includes("HTTP 404")) {
            return "missing";
        }
        return "unknown";
    }
}
/**
 * Detect whether the repo's default GitHub Actions workflow permissions let the
 * bkit-cloud.yml push status commits and open/merge PRs. Reads
 * `repos/{owner}/{repo}/actions/permissions/workflow`:
 *   - default_workflow_permissions: "read" | "write"
 *   - can_approve_pull_request_reviews: boolean
 * Returns "present" only when permissions are "write" AND PR creation/approval is
 * allowed; "missing" otherwise; "unknown" if gh CLI is unavailable / unauthed.
 * Repo-level only — org-level defaults are not reliably readable with a repo token
 * (an org policy can still override a correct-looking repo setting).
 */
export function detectActionsWritePermissions() {
    try {
        const out = execFileSync("gh", ["api", "repos/{owner}/{repo}/actions/permissions/workflow"], {
            encoding: "utf-8",
            stdio: ["ignore", "pipe", "pipe"],
            timeout: 5000,
        });
        const parsed = JSON.parse(out);
        const canWrite = parsed.default_workflow_permissions === "write";
        const canApprovePrs = parsed.can_approve_pull_request_reviews === true;
        return canWrite && canApprovePrs ? "present" : "missing";
    }
    catch {
        return "unknown";
    }
}
/**
 * Read `bkit.issueTracker` from the consumer's package.json.
 * Returns the tracker value or the default ("none") when absent / unreadable.
 */
export function readConsumerIssueTracker(cwd) {
    const pkgPath = path.join(cwd, "package.json");
    if (!fs.existsSync(pkgPath))
        return DEFAULT_ISSUE_TRACKER;
    try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        const bkitField = pkg.bkit;
        const parsed = parseIssueTracker(bkitField?.issueTracker);
        return parsed ?? DEFAULT_ISSUE_TRACKER;
    }
    catch {
        return DEFAULT_ISSUE_TRACKER;
    }
}
/**
 * Emit a tracker-specific setup advisory.
 *
 * - `github`  → GitHub tracker: the GitHub MCP server authenticates with `BKIT_GH_TOKEN`; `gh` uses `gh auth login`.
 * - `linear`  → existing Linear setup message (BKIT_LINEAR_API_KEY + LINEAR_ISSUE_ID).
 * - `none`    → prompt to run `bkit install --tracker=github` or `--tracker=linear`.
 *
 * Only fires when bkit workflows are installed (.claude/ or .cursor/ present).
 */
export function buildTrackerSetupAdvisory(cwd) {
    const hasClaude = fs.existsSync(path.join(cwd, ".claude"));
    const hasCursor = fs.existsSync(path.join(cwd, ".cursor"));
    if (!hasClaude && !hasCursor)
        return null;
    const tracker = readConsumerIssueTracker(cwd);
    if (tracker === "github") {
        return {
            id: "tracker-setup-github",
            severity: "advisory",
            detect: "bkit tracker is configured as `github`. GitHub Issues + Projects v2 is the active tracker.",
            action: "GitHub tracker: the GitHub MCP server authenticates with `BKIT_GH_TOKEN` (fine-grained PAT for one owner, classic PAT across owners) — set it in `.bkit/.env`, then `direnv allow`. Unset → every tracker and PR MCP call fails. The `gh` CLI signs in separately: run `gh auth login` once. Ensure the `github` MCP server is configured in `.mcp.json` and `.cursor/mcp.json`.",
        };
    }
    if (tracker === "linear") {
        return {
            id: "tracker-setup-linear",
            severity: "advisory",
            detect: "bkit tracker is configured as `linear`. Linear is the active tracker.",
            action: "Linear tracker: set `BKIT_LINEAR_API_KEY` in `.bkit/.env` (generate at https://linear.app/settings/api). `LINEAR_ISSUE_ID` is injected per-session by the Linear integration — do not hardcode. Run `direnv allow` after setting the key so MCP servers and the preflight hook can authenticate.",
        };
    }
    // tracker === "none". Distinguish opt-out (explicit `bkit.issueTracker: "none"`)
    // from undecided (field absent). An explicit `none` silences the nudge, as with the
    // dep-updater advisory.
    if (hasExplicitIssueTrackerField(cwd))
        return null;
    return {
        id: "tracker-setup-none",
        severity: "advisory",
        detect: "bkit tracker is not configured (`bkit.issueTracker` absent). Workflows run but every tracker call is a no-op.",
        action: 'Optional post-install decision. Run `bkit install --tracker=github` (recommended) or `bkit install --tracker=linear` to enable tracker integration. GitHub tracker requires `BKIT_GH_TOKEN` in `.bkit/.env` (fine-grained PAT for one owner, classic PAT across owners). Linear tracker requires `BKIT_LINEAR_API_KEY` in `.bkit/.env`. To opt out and silence this advisory, set `bkit.issueTracker` to `"none"` in package.json.',
    };
}
/** True when package.json has an explicit `bkit.issueTracker` field (any value). */
function hasExplicitIssueTrackerField(cwd) {
    const pkgPath = path.join(cwd, "package.json");
    if (!fs.existsSync(pkgPath))
        return false;
    try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        const bkitField = pkg.bkit;
        return bkitField !== undefined && bkitField.issueTracker !== undefined;
    }
    catch {
        return false;
    }
}
/**
 * Classify the `bkit.githubProject` board-sync config in package.json:
 *   - "configured" → object with at least `owner` + `number` (the lookup keys)
 *   - "opted-out"  → set to `false` ("no board sync" — stay quiet)
 *   - "absent"     → missing, malformed, or unreadable
 */
function readGithubProjectConfig(cwd) {
    const pkgPath = path.join(cwd, "package.json");
    if (!fs.existsSync(pkgPath))
        return "absent";
    try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        const bkitField = pkg.bkit;
        const gp = bkitField?.githubProject;
        if (gp === false)
            return "opted-out";
        if (gp && typeof gp === "object" && !Array.isArray(gp)) {
            const obj = gp;
            if (obj.owner !== undefined && obj.number !== undefined)
                return "configured";
        }
        return "absent";
    }
    catch {
        return "absent";
    }
}
/**
 * Inspect the root `.mcp.json` github server's `X-MCP-Toolsets` header for the
 * `projects` toolset (required for Projects v2 board sync):
 *   - "present" → header lists `projects`
 *   - "missing" → github server has a toolset header that omits `projects`
 *                 (installs predating the toolset addition)
 *   - "unknown" → no `.mcp.json`, no github server, or no header (can't judge)
 *
 * Scoped to root `.mcp.json` only — bkit omits the header from `.cursor/mcp.json`.
 */
export function detectProjectsToolset(cwd) {
    const mcpPath = path.join(cwd, ".mcp.json");
    if (!fs.existsSync(mcpPath))
        return "unknown";
    try {
        const cfg = JSON.parse(fs.readFileSync(mcpPath, "utf-8"));
        const servers = cfg.mcpServers;
        const gh = servers?.github;
        const headers = gh?.headers;
        const toolsets = headers?.["X-MCP-Toolsets"];
        if (typeof toolsets !== "string")
            return "unknown";
        return toolsets
            .split(",")
            .map((s) => s.trim())
            .includes("projects")
            ? "present"
            : "missing";
    }
    catch {
        return "unknown";
    }
}
/**
 * GitHub Projects v2 board-sync prerequisite advisory. Board status sync needs
 * THREE things, none of which install seeds or verifies end-to-end:
 * `bkit.githubProject` config, the `projects` MCP toolset, and an org-scoped
 * Projects R/W PAT. Absent any of the first two (the detectable ones), board
 * sync silently no-ops — `bkit.githubProject` alone is useless if the toolset
 * lacks `projects`, and vice versa. Emits one advisory naming what's missing.
 *
 * Gates: workflows installed (.claude/ or .cursor/) AND tracker === "github".
 * Stays quiet on explicit opt-out (`bkit.githubProject: false`) or when both
 * detectable prerequisites are satisfied (PAT scope can't be checked locally).
 */
export function buildGithubProjectAdvisory(cwd) {
    const hasClaude = fs.existsSync(path.join(cwd, ".claude"));
    const hasCursor = fs.existsSync(path.join(cwd, ".cursor"));
    if (!hasClaude && !hasCursor)
        return null;
    if (readConsumerIssueTracker(cwd) !== "github")
        return null;
    const configState = readGithubProjectConfig(cwd);
    if (configState === "opted-out")
        return null;
    const toolset = detectProjectsToolset(cwd);
    const configOk = configState === "configured";
    const toolsetOk = toolset === "present";
    if (configOk && toolsetOk)
        return null;
    const missing = [];
    if (!configOk)
        missing.push("`bkit.githubProject` is absent from package.json");
    if (toolset === "missing")
        missing.push("the `projects` toolset is missing from `.mcp.json` `X-MCP-Toolsets`");
    const missingPhrase = missing.length > 0 ? `: ${missing.join("; ")}` : "";
    return {
        id: "github-project-board-sync-unconfigured",
        severity: "advisory",
        detect: `GitHub tracker is active but Projects v2 board status sync is not fully configured${missingPhrase}. ` +
            "Board sync silently no-ops — workflows never reflect phase on the project board.",
        action: "Board status sync is optional (workflows never gate on it) but invisible when half-configured. All three prerequisites are required:\n\n" +
            "1. Add `bkit.githubProject` to package.json (org-owned board only — fine-grained PATs cannot reach user-owned projects, nor span orgs; use a classic PAT with `project` to cover more than one owner):\n\n" +
            '       "bkit": {\n' +
            '         "githubProject": {\n' +
            '           "owner": "<org>", "number": <project-number>,\n' +
            '           "statusFieldId": <numeric-field-id>, "progressOptionId": "<option-id>",\n' +
            '           "reviewOptionId": "<option-id>", "doneOptionId": "<option-id>"\n' +
            "         }\n" +
            "       }\n\n" +
            "   Discover the ids: `gh api /orgs/<org>/projectsV2/<number>/fields --jq '.[] | select(.name==\"Status\")'` → the Status field's " +
            "numeric `id` → `statusFieldId` (a JSON number, NOT quoted); each `options[].id` (e.g. `47fc9ee4`) → " +
            "the option ids (quoted strings). `gh project field-list`'s `id` is the GraphQL node id (`PVTSSF_…`) " +
            "and must NOT be used for `statusFieldId` — `projects_write` rejects it with " +
            "`updated_field.id: value must be a number`.\n\n" +
            "2. Ensure the root `.mcp.json` github server enables the `projects` toolset:\n\n" +
            '       "X-MCP-Toolsets": "context,issues,pull_requests,repos,users,projects"\n\n' +
            "3. The `BKIT_GH_TOKEN` PAT needs organization-scoped Projects read & write (repo scope is not enough).\n\n" +
            "To opt out and silence this advisory, set `bkit.githubProject` to `false` in package.json.",
    };
}
/**
 * Static-validate the `statusFieldId` shape on an otherwise-configured board.
 * Projects v2 board sync feeds `statusFieldId` straight into `projects_write`
 * `updated_field.id`, which requires the NUMERIC field id; a GraphQL node id
 * (`PVTSSF_…` — what `gh project field-list` returns) or any non-number value is
 * rejected with `updated_field.id: value must be a number`, and best-effort sync then
 * no-ops silently. Checked at install/check time, no network needed.
 *
 * Gates: workflows installed AND tracker === "github" AND `bkit.githubProject` is
 * an object carrying `owner` + `number` (an otherwise-usable board) AND
 * `statusFieldId` is present but not a JSON number. An absent `statusFieldId` is
 * the setup advisory's job; opt-out (`false`) and absent config never reach here.
 */
export function detectGithubProjectFieldIdFormat(cwd) {
    const hasClaude = fs.existsSync(path.join(cwd, ".claude"));
    const hasCursor = fs.existsSync(path.join(cwd, ".cursor"));
    if (!hasClaude && !hasCursor)
        return null;
    if (readConsumerIssueTracker(cwd) !== "github")
        return null;
    const pkgPath = path.join(cwd, "package.json");
    if (!fs.existsSync(pkgPath))
        return null;
    let gp;
    try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        const bkitField = pkg.bkit;
        const raw = bkitField?.githubProject;
        if (raw && typeof raw === "object" && !Array.isArray(raw))
            gp = raw;
    }
    catch {
        return null;
    }
    // Only judge a board that is otherwise configured (owner + number present) and
    // has a statusFieldId set — absent statusFieldId is handled by the setup advisory.
    if (!gp || gp.owner === undefined || gp.number === undefined)
        return null;
    const sfid = gp.statusFieldId;
    if (sfid === undefined || typeof sfid === "number")
        return null; // absent or already correct
    const looksLikeNodeId = typeof sfid === "string" && /^PVT/.test(sfid);
    const shape = looksLikeNodeId
        ? "a GraphQL node id (`PVTSSF_…`)"
        : `a ${typeof sfid} (\`${String(sfid)}\`)`;
    return {
        id: "github-project-status-field-id-format",
        severity: "advisory",
        detect: `\`bkit.githubProject.statusFieldId\` is ${shape}, but Projects v2 board sync feeds it to ` +
            "`projects_write` `updated_field.id`, which requires the numeric field id and rejects anything " +
            "else (`updated_field.id: value must be a number`). Board sync silently no-ops — the board never reflects phase.",
        action: "Re-derive the numeric Status field id and store it unquoted:\n\n" +
            "       gh api /orgs/<org>/projectsV2/<number>/fields --jq '.[] | select(.name==\"Status\")'\n\n" +
            "The Status field's numeric `id` (e.g. `350038178`) → `statusFieldId` (a JSON number, NOT quoted); " +
            "each `options[].id` (e.g. `47fc9ee4`) → the option ids (quoted strings). `gh project field-list`'s " +
            "`id` is the GraphQL node id (`PVTSSF_…`) and must NOT be used for `statusFieldId`.",
    };
}
/**
 * Read `bkit.cloudAgents` from the consumer's package.json. Returns the value
 * or the default ("none") when absent / unreadable.
 */
export function readConsumerCloudAgents(cwd) {
    const pkgPath = path.join(cwd, "package.json");
    if (!fs.existsSync(pkgPath))
        return DEFAULT_CLOUD_AGENTS;
    try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        const bkitField = pkg.bkit;
        const parsed = parseCloudAgents(bkitField?.cloudAgents);
        return parsed ?? DEFAULT_CLOUD_AGENTS;
    }
    catch {
        return DEFAULT_CLOUD_AGENTS;
    }
}
/** True when package.json has an explicit `bkit.cloudAgents` field (any value). */
function hasExplicitCloudAgentsField(cwd) {
    const pkgPath = path.join(cwd, "package.json");
    if (!fs.existsSync(pkgPath))
        return false;
    try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        const bkitField = pkg.bkit;
        return bkitField !== undefined && bkitField.cloudAgents !== undefined;
    }
    catch {
        return false;
    }
}
/**
 * Emit a cloud-agents setup advisory (parity with the tracker / dep-updater
 * advisories). Post-CI auto-routing (`bkit-cloud.yml`) is opt-in via
 * `bkit install --auto=claude`; it does NOT ship with a default install. This nudges
 * consumers to make the choice post-install.
 *
 * Also performs the cloud=claude config-consistency assertion: when
 * `bkit.cloudAgents === "claude"` but the installed `bkit-cloud.yml` lacks
 * `id-token: write`, it surfaces a consistency warning (exit-1 signal surfaced via
 * the `blocker` severity in the checks/before/index.ts caller).
 *
 * Resolution order (file presence is authoritative, package.json field is the
 * opt-out):
 *   - `.github/workflows/bkit-cloud.yml` present → `cloud-router` (informational; active)
 *   - `bkit.cloudAgents === "none"`                  → null (opt-out — stay quiet)
 *   - otherwise (undecided)                          → `cloud-router-none` (nudge to choose)
 *
 * Only fires when there is a `.github/workflows/` dir (the router wakes on a CI
 * completion event).
 */
export function buildCloudSetupAdvisory(cwd) {
    const routerPath = path.join(cwd, ".github", "workflows", "bkit-cloud.yml");
    if (fs.existsSync(routerPath)) {
        // Config-consistency assertion: cloud=claude requires id-token: write.
        // If the recorded variant is "claude" and the workflow file lacks id-token: write,
        // surface a consistency finding.
        const recordedVariant = readConsumerCloudAgents(cwd);
        if (recordedVariant === "claude") {
            const workflowContent = fs.readFileSync(routerPath, "utf-8");
            if (!workflowContent.includes("id-token: write")) {
                return {
                    id: "cloud-claude-missing-id-token",
                    severity: "blocker",
                    detect: "`bkit.cloudAgents` is `claude` but `.github/workflows/bkit-cloud.yml` lacks `id-token: write`. `claude-code-action@v1` will fail at boot with an OIDC error.",
                    action: "Re-run `pnpm bkit install --auto=claude --tracker=github` to regenerate the workflow with `id-token: write` and the App-auth framing. Also verify the Claude GitHub App is installed (`/install-github-app`). See bkit's `cloud.md` § Post-CI auto-routing.",
                };
            }
        }
        return {
            id: "cloud-router",
            severity: "advisory",
            detect: "Cloud agents: post-CI auto-routing is active (`.github/workflows/bkit-cloud.yml` present). The Claude GitHub App is required — run `/install-github-app` (Claude Code CLI) once if not already done.",
            action: `The workflow requires: the \`ANTHROPIC_API_KEY\` repo secret, the Claude GitHub App (\`/install-github-app\`), and GitHub Actions write permissions (org AND repo). See the \`bkit-auto-setup\` advisory (emitted by \`bkit install --auto=claude\`) and bkit's \`cloud.md\` § Post-CI auto-routing for the full checklist.\n\nbkit's agents comment as you, so every workflow those comments trigger notifies you, even ones that skip. To see only failures: GitHub → Settings → Notifications → System → Actions → "Only notify for failed workflows".`,
        };
    }
    // No router present — distinguish opt-out from undecided.
    if (readConsumerCloudAgents(cwd) === "none" && hasExplicitCloudAgentsField(cwd)) {
        return null; // consumer explicitly chose `none` — stay quiet
    }
    // Only nudge if there's a workflows dir for the router to wake on.
    if (!fs.existsSync(path.join(cwd, ".github", "workflows")))
        return null;
    return {
        id: "cloud-router-none",
        severity: "advisory",
        detect: "Cloud agents: post-CI auto-routing is not configured. `.github/workflows/` exists but no `bkit-cloud.yml` — CI pass/fail does not auto-dispatch bkit-ship / bkit-debug.",
        action: "Optional post-install decision. For a GitHub-tracker repo: `pnpm bkit install --auto=claude --tracker=github`. For a Linear-tracker repo: `pnpm bkit install --auto=cursor --tracker=linear`.\n\n" +
            "Prerequisites for `--auto=claude`: `ANTHROPIC_API_KEY` repo secret + Claude GitHub App (`/install-github-app`) + GitHub Actions write permissions.\n\n" +
            'To opt out and silence this advisory, set `bkit.cloudAgents` to `"none"` in package.json.',
    };
}
