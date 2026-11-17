// install/modules/cloud.ts — the cloud module (`--auto=<variant>`): records the
// variant and prints the post-CI auto-routing setup advisories. It writes no files:
// every cloud file (the workflow, bkit-cloud-bootstrap.sh, the Cursor Dockerfile /
// environment) ships as a copy-and-own template.
import * as fs from "node:fs";
import * as path from "node:path";
import { parseJson } from "../../shared/json.js";
import { isOpencodeProvider } from "../../render/models.js";
import { OPENCODE_PROVIDER_DEFAULTS } from "../../shared/egress.js";
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/**
 * Persist a `bkit.<field>` value into the consumer's package.json so the
 * post-install advisory can tell "deliberately none" from "undecided". `field` is a
 * dotted path (`cloud.agent`); each missing section on the way is created. Mirrors
 * the `bkit.tracker.default` persist logic in commands/install/install.ts. Used for the opt-in
 * decisions recorded by their owning modules (`cloud.agent`). No-op
 * on dry-run, when package.json is absent/unparseable, or when a section on the path
 * holds a non-object (non-fatal — the config file presence is still the primary signal).
 */
function setConsumerBkitField(field, value, dryRun) {
    if (dryRun)
        return;
    const pkgPath = path.join(process.cwd(), "package.json");
    if (!fs.existsSync(pkgPath))
        return;
    try {
        const raw = fs.readFileSync(pkgPath, "utf-8");
        const parsed = parseJson(raw);
        if (!parsed.ok)
            return;
        const pkg = parsed.value;
        const keys = ["bkit", ...field.split(".")];
        const leaf = keys.pop();
        let parent = pkg;
        for (const k of keys) {
            parent[k] ??= {};
            const next = parent[k];
            if (next === null || typeof next !== "object" || Array.isArray(next))
                return;
            parent = next;
        }
        if (parent[leaf] === value)
            return; // already set — avoid a no-op rewrite
        parent[leaf] = value;
        const indentMatch = raw.match(/\n([ \t]+)"/);
        const indent = indentMatch ? indentMatch[1] : "  ";
        const trailingNewline = raw.endsWith("\n") ? "\n" : "";
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, indent) + trailingNewline, "utf-8");
    }
    catch {
        // non-fatal — file presence is the primary signal
    }
}
// The cloud workflow is a template (`.bkit/templates.md`). Shared first step of the
// router-backed setup advisories.
const CLOUD_WORKFLOW_ADOPT_STEP = "  - Copy `.bkit/templates/.github/workflows/bkit-cloud.yml` to `.github/workflows/bkit-cloud.yml` and own it: bkit never writes or overwrites that file after you copy it. The one exception is a brand migration: `bkit upgrade` rewrites exact shipped old names in it and leaves any edited line. Replace `{{CLOUD_RUNNER}}` with your runner label and `{{NODE_VERSION}}` with your Node major. `.bkit/templates.md` lists every placeholder; on each `bkit upgrade`, diff the refreshed template against your copy.\n";
function trackerAdvisoryLines(tracker, variant) {
    const credentials = {
        github: "  - Tracker credential (GitHub): set `BKIT_GH_TOKEN` for the cloud environment.\n",
        linear: "  - Tracker credential (Linear): set `BKIT_LINEAR_API_KEY` in the cloud environment and as a repo Actions secret for the router. Generate it at https://linear.app/settings/api.\n",
        jira: "  - Tracker credential (Jira): set `BKIT_JIRA_API_KEY` in the cloud environment and as a repo Actions secret for the router. Use an Atlassian MCP V2 scoped token; `.bkit/trackers.md` § jira lists its permissions.\n",
        none: "  - Wire a tracker with `bkit install --tracker=<github|linear|jira>`.\n",
    };
    const cursorTriggers = {
        github: "  - Optional native launch: mention `@cursor` on a GitHub issue or pull request.\n",
        linear: "  - Optional native launch: use Cursor's Linear integration.\n",
        jira: "  - Launch Cursor manually or through its own GitHub triggers for a Jira issue.\n",
        none: "",
    };
    return (credentials[tracker] +
        "  - Label the issue `bkit:auto` in the configured tracker before pushing the build commit.\n" +
        (variant === "cursor" ? cursorTriggers[tracker] : ""));
}
// ---------------------------------------------------------------------------
// runCloudModule — opt-in cloud-agent integration
// ---------------------------------------------------------------------------
//
// NOT shipped by a default install — opt-in via `bkit install --auto=<variant>`,
// so a default install ships ZERO cloud footprint. Every variant records
// `bkit.cloud.agent` and prints its setup advisories; none writes a file. The cloud
// workflow (bkit-cloud.yml), bkit-cloud-bootstrap.sh and the Cursor Background Agent
// files (.cursor/Dockerfile, .cursor/environment.json) are templates the advisories
// point at.
//
// Variant constraints are enforced in commands/install/install.ts before dispatch (tracker mismatch
// = hard error). The context's cloudVariant carries the chosen variant.
export function runCloudModule(ctx) {
    const { dryRun, advisories } = ctx;
    const variant = ctx.cloudVariant ?? "claude";
    const trackerLines = trackerAdvisoryLines(ctx.issueTracker, variant);
    const providerKey = ctx.opencodeProvider && isOpencodeProvider(ctx.opencodeProvider)
        ? OPENCODE_PROVIDER_DEFAULTS[ctx.opencodeProvider].envVar
        : "your configured provider's BKIT_ key";
    const routerSetup = "Full recipe in bkit's `cloud.md` § Post-CI auto-routing.\n\n" +
        "REQUIRED ONE-TIME SETUP:\n" +
        CLOUD_WORKFLOW_ADOPT_STEP +
        "  - GitHub Actions permissions — set org and repo Workflow permissions to **Read and write permissions** and tick **Allow GitHub Actions to create and approve pull requests**.\n";
    const variants = {
        claude: {
            detect: "Cloud agents (claude) use the unified cloud workflow. It selects the recorded cloud agent and requires the Claude GitHub App for OIDC authentication.",
            action: routerSetup +
                "  - Run `/install-github-app` (Claude Code CLI) to install the Claude GitHub App. The action needs `id-token: write` for OIDC.\n" +
                "  - Set the `BKIT_ANTHROPIC_API_KEY` repo secret, or configure keyless workload identity federation with the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables (optional `ANTHROPIC_SERVICE_ACCOUNT_ID` / `ANTHROPIC_WORKSPACE_ID`). Leave the API key unset to use federation.\n" +
                trackerLines +
                "\nOPTIONAL: after installing the App, mention `@claude /bkit-plan` on a GitHub issue or pull request. Vendor-native handlers are installed separately; bkit does not install them.",
        },
        opencode: {
            detect: "Cloud agents (opencode) use the unified cloud workflow and the provider configured in the committed .opencode/ host.",
            action: routerSetup +
                "  - Install the local host: `bkit install --opencode=<provider>` (e.g. `--opencode=openrouter`). Commit its provider and model configuration.\n" +
                `  - Add \`${providerKey}\` to repo Actions secrets for the configured provider.\n` +
                trackerLines +
                "\nThe stock `/oc` comment handler (`opencode github install`) is a separate vendor-native installation; bkit does not install it.",
        },
        codex: {
            detect: "Cloud agents (codex) use the unified cloud workflow and openai/codex-action with the installed Codex host.",
            action: routerSetup +
                "  - Install the Codex host first: `bkit install --codex`. Copy the environment setup from `.codex/bkit-cloud.md` (gitignored).\n" +
                "  - Add `BKIT_OPENAI_API_KEY` to repo Actions secrets. The router starts the codex job only when codex is the recorded agent and its credential is set.\n" +
                trackerLines +
                "\nVendor-native `@Codex` mentions and Codex for Linear are configured separately; bkit documents them and does not install them.",
        },
        cursor: {
            detect: "Cloud agents (cursor) use the Cursor Cloud Agents dashboard triggers and the .cursor/ scaffolding templates.",
            action: "Full recipe in bkit's `cloud.md` § Post-CI auto-routing.\n\n" +
                "IN CURSOR DASHBOARD:\n" +
                "  - Cursor → Cloud Agents dashboard → Triggers → + Add trigger.\n" +
                "  - Event: CI workflow completion. Branch filter: `feat/**`.\n" +
                "  - Prompt: `/bkit-auto $CI_STATUS $PR_NUMBER`. Allowed concurrency: latest-supersedes.\n" +
                trackerLines +
                "\nIN REPO (copy each template and own it):\n" +
                "  - `.bkit/templates/.cursor/Dockerfile` → `.cursor/Dockerfile`: match your Node major and add your stack's tools.\n" +
                "  - `.bkit/templates/.cursor/environment.json` → `.cursor/environment.json`: configure install, start and terminal commands.",
        },
    };
    setConsumerBkitField("cloud.agent", variant, dryRun);
    advisories.push({ id: "bkit-cloud-setup", severity: "advisory", ...variants[variant] });
    if (variant === "claude" || variant === "cursor") {
        const environment = variant === "claude"
            ? "Adopt `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` as `.claude/hooks/bkit-cloud-bootstrap.sh`. Configure the setup script and environment in the Claude app dashboard."
            : "Configure the copied .cursor/Dockerfile and .cursor/environment.json, then add each token as a **Runtime Secret** in the Cursor Cloud Agents dashboard.";
        advisories.push({
            id: "cloud-env-customize",
            severity: "advisory",
            detect: `Cloud environment setup combines the repo templates and the ${variant} dashboard.`,
            action: environment +
                ` Copy-paste-ready values resolved from your .envrc are in .${variant}/bkit-cloud.md (gitignored).\n` +
                trackerLines,
        });
    }
}
