// install/modules/cloud.ts — the cloud module (`--auto=<variant>`): records the
// variant and prints the post-CI auto-routing setup advisories. It writes no files:
// every cloud file (the workflow, bkit-cloud-bootstrap.sh, the Cursor Dockerfile /
// environment) ships as a copy-and-own template.
import * as fs from "node:fs";
import * as path from "node:path";
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/**
 * Persist a `bkit.<field>` value into the consumer's package.json so the
 * post-install advisory can tell "deliberately none" from "undecided". Mirrors
 * the `bkit.issueTracker` persist logic in commands/install/install.ts. Used for the opt-in
 * decisions recorded by their owning modules (`cloudAgents`). No-op
 * on dry-run or when package.json is absent/unparseable (non-fatal — the config
 * file presence is still the primary signal).
 */
function setConsumerBkitField(field, value, dryRun) {
    if (dryRun)
        return;
    const pkgPath = path.join(process.cwd(), "package.json");
    if (!fs.existsSync(pkgPath))
        return;
    try {
        const raw = fs.readFileSync(pkgPath, "utf-8");
        const pkg = JSON.parse(raw);
        const bkit = (pkg.bkit ?? {});
        if (bkit[field] === value)
            return; // already set — avoid a no-op rewrite
        bkit[field] = value;
        pkg.bkit = bkit;
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
// claude and opencode setup advisories.
const CLOUD_WORKFLOW_ADOPT_STEP = "  - Copy `.bkit/templates/.github/workflows/bkit-cloud.yml` to `.github/workflows/bkit-cloud.yml` and own it: bkit never writes or overwrites that file. Replace the `{{CLOUD_RUNNER}}` placeholder in both jobs' `runs-on` with a runner label (e.g. `ubuntu-latest`). `.bkit/templates.md` lists every placeholder; on each `bkit upgrade`, diff the refreshed template against your copy.\n";
// ---------------------------------------------------------------------------
// runCloudModule — opt-in cloud-agent integration
// ---------------------------------------------------------------------------
//
// NOT shipped by a default install — opt-in via `bkit install --auto=<variant>`,
// so a default install ships ZERO cloud footprint. Every variant records
// `bkit.cloudAgents` and prints its setup advisories; none writes a file. The cloud
// workflow (bkit-cloud.yml), bkit-cloud-bootstrap.sh and the Cursor Background Agent
// files (.cursor/Dockerfile, .cursor/environment.json) are templates the advisories
// point at.
//
// Variant constraints are enforced in commands/install/install.ts before dispatch (tracker mismatch
// = hard error). The context's cloudVariant carries the chosen variant.
export function runCloudModule(ctx) {
    const { dryRun, advisories } = ctx;
    // Default to "claude" (the Claude/GitHub path) when cloudVariant is not set.
    // Callers should always pass cloudVariant.
    const variant = ctx.cloudVariant ?? "claude";
    if (variant === "claude") {
        // --- cloud=claude: GitHub-tracker path ---
        // Record the variant so the post-install advisory and `bkit check` stay consistent.
        setConsumerBkitField("cloudAgents", "claude", dryRun);
        // Advisory — cloud=claude setup checklist (App required; id-token: write).
        advisories.push({
            id: "bkit-cloud-setup",
            severity: "advisory",
            detect: "Cloud agents (claude) need the unified cloud workflow (claude + opencode jobs, runtime-gated by secret presence), which ships as a template at `.bkit/templates/.github/workflows/bkit-cloud.yml`. The Claude GitHub App is required for `claude-code-action@v1` to authenticate via OIDC.",
            action: "Full recipe in bkit's `cloud.md` § Post-CI auto-routing.\n\n" +
                "REQUIRED ONE-TIME SETUP:\n" +
                CLOUD_WORKFLOW_ADOPT_STEP +
                "  - Run `/install-github-app` (Claude Code CLI) to install the Claude GitHub App on your repo. This is required — `claude-code-action@v1` authenticates as the App via OIDC (`id-token: write`); without the App it fails at boot with an OIDC error.\n" +
                "  - GitHub Actions permissions — flip BOTH org AND repo: Settings → Actions → General → Workflow permissions = **Read and write permissions** + tick **Allow GitHub Actions to create and approve pull requests**.\n" +
                "  - Add `ANTHROPIC_API_KEY` to repo secrets (Settings → Secrets and variables → Actions). Used by `claude-code-action@v1` (job env keeps this vendor name; local `.bkit/.env` stores it as `BKIT_ANTHROPIC_API_KEY`).\n" +
                "  - Label the issue `bkit:auto` before pushing the build commit — without the label the CI auto-route exits no-op.\n\n" +
                "OPTIONAL (manual phase launch): after `/install-github-app`, comment `@claude /bkit-plan` (or any phase) on a GitHub issue/PR to launch it from the tracker UI. The App's generated `claude.yml` triggers on mention events; `bkit-cloud.yml` triggers on CI completion + `workflow_dispatch` — the two coexist.\n\n" +
                "Both the CI-driven path and the `@claude` mention path invoke the same `/bkit-auto` orchestrator (mirrored to `.claude/commands/bkit-auto.md` on each `pnpm bkit install`).",
        });
        // Advisory — cloud env scaffolding (Claude half).
        advisories.push({
            id: "cloud-env-customize",
            severity: "advisory",
            detect: "Cloud env config splits across the repo (`.claude/hooks/bkit-cloud-bootstrap.sh`, a copy-and-own template you adopt) and the Claude app dashboard (setup script + env vars + auth tokens, manual).",
            action: "Two locations to touch — full recipe in bkit's `cloud.md`.\n\n" +
                "IN REPO (copy-and-own; bkit never writes it):\n" +
                "  - Adopt `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` as `.claude/hooks/bkit-cloud-bootstrap.sh` and edit it freely — the baseline runs `pnpm install` / `vale sync` and the gh login on each cloud session; add your own repo-specific steps (Supabase start, turbo prebuild, etc. — examples inlined). The `.claude/settings.json` SessionStart entry runs it only when present (`test -f … || true`).\n\n" +
                "IN CLAUDE APP (claude.ai/code → environment selector → + Add environment):\n" +
                "  - Name: the repo name (e.g. `acme-web`) — one environment per repo, since secrets are per-repo.\n" +
                "  - Setup script: paste from bkit's `cloud.md` § Setup script (installs vale + gh + corepack-pinned pnpm — exact versions live in cloud.md, not duplicated here).\n" +
                "  - Environment variables: `BKIT_GH_TOKEN` (fine-grained for one owner, classic across owners — GitHub MCP), `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70`.\n" +
                "  - Tracker env vars (GitHub): No tracker PAT needed. Run `gh auth login` once for CLI surface. MCP auth is browser OAuth (automatic on first tool call). Set `BKIT_GH_TOKEN` (fine-grained for one owner, classic across owners — GitHub MCP server).\n" +
                "  - Network access: `Trusted` (default). One environment per repo (secrets differ per repo); the setup script + variable *names* are identical across repos, only the values change. See cloud.md § Sharing across repos → Claude.",
        });
    }
    else if (variant === "opencode") {
        // --- cloud=opencode: GitHub-tracker path (same bkit-cloud.yml template, no OIDC) ---
        // Record the variant.
        setConsumerBkitField("cloudAgents", "opencode", dryRun);
        // Advisory — cloud=opencode setup checklist.
        advisories.push({
            id: "bkit-cloud-setup",
            severity: "advisory",
            detect: "Cloud agents (opencode) need the unified cloud workflow (claude + opencode jobs, runtime-gated by secret presence), which ships as a template at `.bkit/templates/.github/workflows/bkit-cloud.yml`. The opencode job runs when `OPENCODE_PROVIDER_KEY` is set.",
            action: "Full recipe in bkit's `cloud.md` § Post-CI auto-routing.\n\n" +
                "REQUIRED ONE-TIME SETUP:\n" +
                CLOUD_WORKFLOW_ADOPT_STEP +
                "  - Install the local opencode host first: `bkit install --opencode=<provider>` (e.g. `--opencode=opencode`). The cloud opencode job runs against the committed `.opencode/` config — provider and model pins come from there, not from this YAML.\n" +
                "  - Add `OPENCODE_PROVIDER_KEY` to repo secrets (Settings → Secrets and variables → Actions). Set it to your configured provider's API key. The workflow fans this one secret out to every supported provider env var name (`BKIT_OPENROUTER_API_KEY`/`BKIT_OLLAMA_API_KEY`/`BKIT_OPENCODE_API_KEY`) so the `.opencode/opencode.json` `{env:VAR}` reference resolves whichever provider you installed.\n" +
                "  - GitHub Actions permissions — flip BOTH org AND repo: Settings → Actions → General → Workflow permissions = **Read and write permissions** + tick **Allow GitHub Actions to create and approve pull requests**.\n" +
                "  - The opencode job does NOT use a Claude API key — it runs the opencode runner with your chosen provider key only. If you also install the claude job (separate secret), both jobs coexist on the same event.\n" +
                "  - Label the issue `bkit:auto` before pushing the build commit — without the label the CI auto-route exits no-op.\n\n" +
                "REACTIVE HANDLER (separate, consumer self-installed): the stock `/oc` comment handler (`opencode github install`) is NOT managed by bkit — install it once per repo independently. It mirrors the `@claude`/`claude.yml` stance. `bkit-cloud.yml` handles the CI-driven + `workflow_dispatch` path only.",
        });
    }
    else {
        // --- cloud=cursor: Linear-tracker path ---
        // Record the variant.
        setConsumerBkitField("cloudAgents", "cursor", dryRun);
        // Advisory — cloud=cursor setup checklist.
        advisories.push({
            id: "bkit-cloud-setup",
            severity: "advisory",
            detect: "Cloud agents (cursor) need the Cursor Background Agent scaffolding, which ships as templates at `.bkit/templates/.cursor/Dockerfile` and `.bkit/templates/.cursor/environment.json`. The Cursor Background Agent trigger is configured in the Cursor cloud agents dashboard — bkit cannot automate that step.",
            action: "Full recipe in bkit's `cloud.md` § Post-CI auto-routing.\n\n" +
                "IN CURSOR DASHBOARD:\n" +
                "  - Cursor → Cloud Agents dashboard → Triggers → + Add trigger.\n" +
                "  - Event: CI workflow completion. Branch filter: `feat/**`.\n" +
                "  - Prompt (paste literally, no edits): `/bkit-auto $CI_STATUS $PR_NUMBER`.\n" +
                "  - Allowed concurrency: latest-supersedes.\n" +
                "  - Set `BKIT_LINEAR_API_KEY` as a **Runtime Secret** in the Cloud Agents dashboard (https://cursor.com/dashboard/cloud-agents) → your environment → Secrets tab.\n" +
                "  - Label the issue `bkit:auto` in Linear before pushing the build commit.\n\n" +
                "IN REPO (copy each template and own it; bkit never writes or overwrites these files — see `.bkit/templates.md`):\n" +
                "  - `.bkit/templates/.cursor/Dockerfile` → `.cursor/Dockerfile`: change Node major if `engines.node` differs from 20; add Playwright / Supabase CLI / extra apt deps.\n" +
                "  - `.bkit/templates/.cursor/environment.json` → `.cursor/environment.json`: set `install` / `start` / `terminals[]` / `env` for your stack.",
        });
        // Advisory — cloud env scaffolding (Cursor half).
        advisories.push({
            id: "cloud-env-customize",
            severity: "advisory",
            detect: "Cloud env config splits across the repo (`.cursor/Dockerfile` + `.cursor/environment.json`, copied from `.bkit/templates/.cursor/`) and the Cursor Cloud Agents dashboard (secrets, manual).",
            action: "Copy-paste-ready values (resolved from your `.envrc`) are written to `.cursor/bkit-cloud.md` (gitignored) on every install.\n\n" +
                "IN THE CLOUD AGENTS DASHBOARD (https://cursor.com/dashboard/cloud-agents → your environment → Secrets tab) — add each as a **Runtime Secret** (loaded as an env var, redacted from the agent's transcript):\n" +
                "  - `BKIT_GH_TOKEN`.\n" +
                "  - Tracker secret (Linear): `BKIT_LINEAR_API_KEY` (generate at https://linear.app/settings/api). `LINEAR_ISSUE_ID` is injected per-session — don't hardcode.\n" +
                "  - First session after Dockerfile changes rebuilds the image; subsequent sessions reuse cached layers.\n\n" +
                "Full recipe in bkit's `cloud.md`; the paste-ready block is in `.cursor/bkit-cloud.md`.",
        });
    }
}
