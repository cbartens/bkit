// checks/after/index.ts — Phase 3: re-detect AFTER writes; produce the unified output.
// runPostInstallCheck calls the detectors in this folder (one file per group of findings);
// this file also formats the checklist and writes `.bkit/advisories.md`.
import * as fs from "node:fs";
import * as path from "node:path";
import { dedupeById } from "../before/index.js";
import { detectMissingDotenv, detectBlankDotenvKeys, detectDirenvMissing, detectDirenvNotAllowed, } from "../before/env.js";
import { getPkgRoot } from "../../shared/package-roots.js";
import { detectOpencodeYmlProviderDrift } from "../../install/modules/opencode.js";
import { TEMPLATES_POINTER } from "../../install/template-copies.js";
import { detectManagedStale } from "./managed.js";
import { buildCloudDashboardsAdvisory, detectCiRouterSecrets, detectShellGhMcpToken, hasGithubMcpServer, } from "./auth.js";
import { buildCloudSetupAdvisory, buildGithubProjectAdvisory, buildTrackerSetupAdvisory, detectActionsWritePermissions, detectGithubProjectFieldIdFormat, detectMainBranchProtection, readConsumerIssueTracker, } from "./github.js";
import { buildDepUpdaterSetupAdvisory, detectBkitStubs, detectValePackageNotSynced, detectWorkflowLintToolsMissing, } from "./tools.js";
import { detectBkitCloudYmlAlwaysTrueGate, detectCiYmlCapstoneContractDrift, detectCiYmlMissingActionlint, detectCiYmlRunInjection, detectGhaFloatingTags, detectRunLevelsNotComposed, detectTaggedTestsWithoutCiHome, detectTestIntegrationEnv, detectTurboIntegrationInputs, } from "./ci-yml.js";
// ---------------------------------------------------------------------------
// formatChecklist — pure renderer
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Shared advisory text — the console checklist (`formatChecklist`) and the
// `.bkit/advisories.md` artifact (`renderAdvisoriesMarkdown`) render the SAME
// words; only the medium decoration differs (`#` / `**` / `>` in markdown, the
// `===` banner in the console). One source, so the two can never drift.
// ---------------------------------------------------------------------------
/** Title line, shared by both surfaces. */
export const ADVISORIES_TITLE = "bkit advisories";
/** Agent instruction line, shared by both surfaces. */
export const ADVISORIES_AGENT_INSTRUCTIONS = "INSTRUCTIONS FOR AN AI AGENT — copy this file (or specific items) into a coding assistant to apply each item. Each ACTION is self-contained.";
/** `N finding(s) — B blocker, A advisory.` — the summary both surfaces print. */
export function advisoriesSummary(findings) {
    const blockerCount = findings.filter((f) => f.severity === "blocker").length;
    const advisoryCount = findings.filter((f) => f.severity === "advisory").length;
    return `${findings.length} finding(s) — ${blockerCount} blocker, ${advisoryCount} advisory.`;
}
/**
 * The suppressed-advisory lines both surfaces print. One entry per opt-out, so a package
 * that dismissed an advisory is never silently invisible. Returns `[]` when nothing was
 * suppressed — callers then emit no such block.
 */
export function suppressedNoteLines(suppressed) {
    if (suppressed.length === 0)
        return [];
    const n = suppressed.length;
    return [
        `${n} advisor${n === 1 ? "y" : "ies"} suppressed by bkit.ignoreAdvisories:`,
        ...suppressed.map((note) => `- ${note.id} (${note.scope})`),
    ];
}
/**
 * Format a list of findings into the post-install console checklist.
 * Returns `""` when findings AND suppressed are both empty — callers can `if (banner)` to
 * stay silent. No console.log inside — caller logs.
 *
 * Same content as `renderAdvisoriesMarkdown`: title, summary, agent instructions
 * and template pointer are the shared strings; only the separators differ from
 * the markdown form.
 *
 * Format per finding:
 *   --- i/N [severity] id ---
 *   Detect: ...
 *   Action: ...
 *
 * `suppressed` is appended as its own block (see `suppressedNoteLines`) — a dismissed
 * advisory stays visible even when nothing else fired.
 */
export function formatChecklist(findings, suppressed = []) {
    if (findings.length === 0 && suppressed.length === 0)
        return "";
    const banner = "=".repeat(58);
    const total = findings.length;
    const lines = [];
    lines.push("");
    lines.push(banner);
    lines.push(ADVISORIES_TITLE);
    lines.push(banner);
    lines.push("");
    if (findings.length > 0) {
        lines.push(advisoriesSummary(findings));
        lines.push("");
        lines.push(ADVISORIES_AGENT_INSTRUCTIONS);
        lines.push("");
        lines.push(TEMPLATES_POINTER);
        lines.push("");
    }
    for (let i = 0; i < findings.length; i++) {
        const f = findings[i];
        lines.push(`--- ${i + 1}/${total} [${f.severity}] ${f.id} ---`);
        lines.push(`Detect: ${f.detect}`);
        lines.push(`Action: ${f.action}`);
        lines.push("");
    }
    const suppressedLines = suppressedNoteLines(suppressed);
    if (suppressedLines.length > 0) {
        lines.push(...suppressedLines);
        lines.push("");
    }
    lines.push(banner);
    lines.push("");
    return lines.join("\n");
}
/**
 * Render findings as a markdown artifact suitable for `.bkit/advisories.md`.
 * Renders the SAME content as `formatChecklist` (shared title, summary, agent
 * instructions, template pointer and suppressed block) in markdown form, so the file can
 * be referenced and revisited between installs. Overwritten on every run.
 */
export function renderAdvisoriesMarkdown(findings, opts, suppressed = []) {
    const lines = [];
    // This is a generated, gitignored artifact — not authored prose. Advisory
    // strings (and reproduced config snippets like `.vale.ini`'s `write-good.So =
    // NO`) legitimately contain sentence-initial "So" and slop tokens. The shipped
    // `lint:prose` globs on-disk `.agents/*.md`, so without this whole-file Vale
    // skip the husky hooks fail on a file the consumer cannot edit.
    lines.push("<!-- vale off -->");
    lines.push("");
    lines.push(`# ${ADVISORIES_TITLE}`);
    lines.push("");
    lines.push(`_bkit: ${opts.version}_  `);
    lines.push(`_Mode: ${opts.mode}_`);
    lines.push("");
    lines.push("> Auto-generated by `bkit install` / `bkit check` / `bkit doctor`. Overwritten on each run.");
    lines.push("");
    if (findings.length === 0 && suppressed.length === 0) {
        lines.push("**No advisories.** Last run was clean.");
        lines.push("");
        return lines.join("\n");
    }
    if (findings.length > 0) {
        lines.push(advisoriesSummary(findings));
        lines.push("");
        lines.push(`> ${ADVISORIES_AGENT_INSTRUCTIONS}`);
        lines.push("");
        lines.push(`> ${TEMPLATES_POINTER}`);
        lines.push("");
    }
    const total = findings.length;
    for (let i = 0; i < total; i++) {
        const f = findings[i];
        lines.push(`## ${i + 1}/${total} [${f.severity}] ${f.id}`);
        lines.push("");
        lines.push(`**Detect:** ${f.detect}`);
        lines.push("");
        lines.push(`**Action:** ${f.action}`);
        lines.push("");
    }
    const suppressedLines = suppressedNoteLines(suppressed);
    if (suppressedLines.length > 0) {
        lines.push(...suppressedLines);
        lines.push("");
    }
    return lines.join("\n");
}
/**
 * Write `.bkit/advisories.md` in the consumer's cwd. Best-effort:
 * mkdir -p `.agents/`, write the rendered markdown, log a one-line status.
 * Any I/O failure is logged but does not throw — the artifact is informational.
 */
export function writeAdvisoriesArtifact(findings, opts) {
    const dir = path.join(opts.cwd, ".bkit");
    const filePath = path.join(dir, "advisories.md");
    try {
        fs.mkdirSync(dir, { recursive: true });
        const content = renderAdvisoriesMarkdown(findings, {
            mode: opts.mode,
            version: opts.version,
        }, opts.suppressed ?? []);
        fs.writeFileSync(filePath, content);
        const n = findings.length;
        console.log(`${opts.logPrefix} Wrote .bkit/advisories.md (${n} item${n === 1 ? "" : "s"}).`);
    }
    catch (err) {
        console.error(`${opts.logPrefix} Failed to write .bkit/advisories.md: ${err.message}`);
    }
}
// ---------------------------------------------------------------------------
// Changelog version-delta header (A7)
// ---------------------------------------------------------------------------
/**
 * Read the bkit CHANGELOG.md (from the package root) and extract the release
 * delta for `version`: the header line plus the section's lead summary (the
 * prose before the first `###` sub-heading). Returns a formatted string for
 * display in post-install output, or null if CHANGELOG.md is absent or the
 * version is not found.
 *
 * Version header format in CHANGELOG.md: `## [X.Y.Z] — YYYY-MM-DD`
 *
 * Bounded on purpose: an install/check banner must not dump a whole release
 * section. When a section has no lead paragraph the sub-heading names stand in,
 * so the banner is never an empty header.
 */
export function readChangelogVersionDelta(version) {
    try {
        const changelogPath = path.join(getPkgRoot(), "CHANGELOG.md");
        if (!fs.existsSync(changelogPath))
            return null;
        const content = fs.readFileSync(changelogPath, "utf-8");
        const lines = content.split(/\r?\n/);
        // Find the header line for this version.
        const versionEscaped = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const headerRe = new RegExp(`^## \\[${versionEscaped}\\]`);
        const start = lines.findIndex((line) => headerRe.test(line));
        if (start === -1)
            return null;
        // The section runs to the next top-level `## ` header (or EOF).
        let end = lines.length;
        for (let i = start + 1; i < lines.length; i++) {
            if (/^## /.test(lines[i])) {
                end = i;
                break;
            }
        }
        const section = lines.slice(start + 1, end);
        const header = lines[start].replace(/^## /, "");
        // Lead summary: the prose between the header and the first `###` sub-heading.
        const firstSub = section.findIndex((line) => /^### /.test(line));
        const leadEnd = firstSub === -1 ? section.length : firstSub;
        let summary = section.slice(0, leadEnd).join("\n").trim();
        if (!summary) {
            summary = section
                .filter((line) => /^### /.test(line))
                .map((line) => line.replace(/^### /, "").trim())
                .join(", ");
        }
        const headline = `[bkit] What's new in v${version}: ${header}`;
        return summary ? `${headline}\n${summary}` : headline;
    }
    catch {
        return null;
    }
}
// ---------------------------------------------------------------------------
// runPostInstallCheck — main Phase 3 entry point
// ---------------------------------------------------------------------------
/**
 * Re-run credential + bkit-ci.yml + vale-sync detectors after writes.
 *
 * - Intra-phase dedup: Phase 3 findings are deduped by id (first occurrence wins).
 * - Cross-phase dedup: Phase 3 wins on id conflict (re-detection is more accurate).
 *
 * Runs unconditionally for both `bkit install` and `bkit check` — detectors are
 * read-only (env probes, gh/vale CLI version checks, file reads) and produce the
 * same advisory set against the same filesystem state regardless of caller.
 *
 * cwd defaults to process.cwd().
 *
 * Pass `suppressed` to collect the advisories a package opted out of via
 * `bkit.ignoreAdvisories` (one note per id + owning package); the caller renders them with
 * `suppressedNoteLines` so a dismissal stays visible. Omitted by callers that do not render.
 */
export function runPostInstallCheck(preflightAdvisories, cwd = process.cwd(), suppressed) {
    const phase3 = [];
    const onSuppressed = suppressed
        ? (note) => suppressed.push(note)
        : undefined;
    // Managed-version marker gate — in `bkit check`, a blocker on main/dev (or a PR into
    // them) and a non-blocking advisory on feature branches when any stamped file's marker
    // drifts from the installed version. No-op in real install/upgrade (re-stamped Phase 2).
    const managedStale = detectManagedStale(cwd);
    if (managedStale)
        phase3.push(managedStale);
    // BKIT_GH_TOKEN shell env — authenticates the GitHub MCP server
    // (`Authorization: Bearer ${BKIT_GH_TOKEN}` in .mcp.json), which powers the entire
    // tracker + PR + Projects MCP surface. Only flags when a github MCP server is
    // configured, and never in CI.
    if (hasGithubMcpServer(cwd) && !process.env.CI) {
        const ghMcpTokenStatus = detectShellGhMcpToken();
        if (ghMcpTokenStatus === "missing") {
            phase3.push({
                id: "gh-mcp-token-unset-shell",
                severity: "advisory",
                detect: "BKIT_GH_TOKEN is not set in the shell environment (undefined). The GitHub MCP server authenticates with `Authorization: Bearer ${BKIT_GH_TOKEN}` — without it, every tracker, PR, and board MCP call fails to connect.",
                action: "Set BKIT_GH_TOKEN in .bkit/.env (canonical local-secrets file, gitignored), then `direnv allow` and restart your editor so MCP servers pick it up:\n\n    cp .bkit/.env.example .bkit/.env       # if not already done\n    # edit .bkit/.env — set BKIT_GH_TOKEN=<fine-grained PAT>\n    direnv allow\n\nThe PAT needs Contents, Pull requests, Issues, and Actions read & write (plus organization-scoped Projects read & write if you use board sync). Generate at: https://github.com/settings/tokens. In cloud sessions (Claude Code web / Cursor Background Agents) set BKIT_GH_TOKEN in the dashboard env vars instead — repo files are not read for secrets there.",
            });
        }
        else if (ghMcpTokenStatus === "empty") {
            phase3.push({
                id: "gh-mcp-token-empty-shell",
                severity: "advisory",
                detect: 'BKIT_GH_TOKEN is set to an empty string (BKIT_GH_TOKEN=""). The GitHub MCP server sends an empty bearer token and fails to authenticate — distinct from unset, same effect.',
                action: "Set a non-empty BKIT_GH_TOKEN in .bkit/.env (fine-grained PAT with Contents / Pull requests / Issues / Actions read & write), then `direnv allow` and restart your editor so MCP servers reload.",
            });
        }
    }
    // Main branch protection — bkit's PR-base gates (build Step 17, ship Step 2)
    // assert feat/* PRs target dev. Enforcing it at the GitHub layer needs branch
    // protection on main restricting merges to PRs from dev.
    const protectionStatus = detectMainBranchProtection();
    const scriptHint = "\n\nQuick path: run `bkit setup protect-main --dry-run` to preview the policy, then drop `--dry-run` to apply. It requires the CI capstone job named by `package.json` `bkit.capstoneJob` (default `bkit-tests-check`, so the required check means 'validated', not just 'tests job did not fail') and pre-flights that the job exists in the `bkit.ciWorkflow` file before requiring it.";
    if (protectionStatus === "missing") {
        phase3.push({
            id: "main-branch-protection-missing",
            severity: "advisory",
            detect: "main has no branch protection rule.",
            action: "main only ever moves via a release PR (release/* -> main); bkit's build/ship workflows keep all feat/* PRs on dev. Gate main at the GitHub layer:\n\n" +
                "    Settings → Branches → Add rule → Branch name pattern: main\n" +
                "    - Require a pull request before merging\n" +
                "    - Require status checks: bkit-tests-check (the always-on capstone — required-check green then means 'the planned tiers ran', not just 'nothing failed'; do NOT require bkit-tests-scope, it is always green)\n" +
                "    - Do not allow bypassing the above settings (enforce for admins)\n" +
                "    - Require linear history; block force-pushes and deletions\n\n" +
                "enforce-for-admins is load-bearing: agents act with the owner's admin token, so an admin-bypass exemption means the agent is the bypass. Covering admins is the only way protection actually constrains agents. dev is intentionally left unprotected — operators choose direct-push or feat/PR and own that tests ran." +
                scriptHint,
        });
    }
    // Optional post-install decisions (opt-in add-ons):
    //   1. Issue tracker — branch on bkit.issueTracker.
    //   2. Dependency updater — read-only. Suggests an example template. Never writes config.
    //   3. Cloud agents — branch on bkit-cloud.yml presence.
    const trackerSetup = buildTrackerSetupAdvisory(cwd);
    if (trackerSetup)
        phase3.push(trackerSetup);
    // GitHub Projects v2 board-sync prerequisites (config + toolset + PAT scope) —
    // absent any prerequisite, sync silently no-ops.
    const githubProjectSetup = buildGithubProjectAdvisory(cwd);
    if (githubProjectSetup)
        phase3.push(githubProjectSetup);
    // A configured board can still silently no-op if statusFieldId holds the GraphQL
    // node id instead of the numeric field id projects_write requires.
    const githubProjectFieldId = detectGithubProjectFieldIdFormat(cwd);
    if (githubProjectFieldId)
        phase3.push(githubProjectFieldId);
    const depUpdaterSetup = buildDepUpdaterSetupAdvisory(cwd);
    if (depUpdaterSetup)
        phase3.push(depUpdaterSetup);
    const cloudSetup = buildCloudSetupAdvisory(cwd);
    if (cloudSetup)
        phase3.push(cloudSetup);
    // bkit-cloud.yml needs the ANTHROPIC_API_KEY repo secret.
    for (const f of detectCiRouterSecrets(cwd))
        phase3.push(f);
    // bkit-cloud.yml also needs repo Actions write permissions + PR-creation
    // allowance, else `actions/checkout` and `gh pr create` 403. Detectable at the
    // repo level via the Actions API; org-level policy can still override.
    if (fs.existsSync(path.join(cwd, ".github", "workflows", "bkit-cloud.yml"))) {
        if (detectActionsWritePermissions() === "missing") {
            phase3.push({
                id: "actions-write-permissions-missing",
                severity: "advisory",
                detect: "GitHub Actions default workflow permissions on this repo are read-only and/or PR creation by Actions is disabled. `.github/workflows/bkit-cloud.yml` cannot push status commits or open/merge PRs — `actions/checkout` and `gh pr create` will 403.",
                action: "Grant Actions write access at BOTH org and repo level:\n\n    Settings -> Actions -> General -> Workflow permissions\n    - Read and write permissions\n    - Allow GitHub Actions to create and approve pull requests\n\nOr via CLI (repo level):\n\n    gh api -X PUT repos/{owner}/{repo}/actions/permissions/workflow -f default_workflow_permissions=write -F can_approve_pull_request_reviews=true\n\nThe org-level toggle is not readable with a repo-scoped token — if the repo setting looks correct but workflows still 403, check the organization Actions policy (it can override the repo).",
            });
        }
        // "unknown" -> silent skip (gh CLI unavailable / unauthenticated).
    }
    // Cloud / IDE-online dashboards — Cursor Background Agents + Claude Code on the web
    // read env vars from their respective online dashboards, NOT from repo files.
    // The same three secrets that GitHub Actions needs must be mirrored there.
    const cloudDashboardsAdvisory = buildCloudDashboardsAdvisory(cwd);
    if (cloudDashboardsAdvisory)
        phase3.push(cloudDashboardsAdvisory);
    // GHA action SHA pinning (KN-3). Updater configs are consumer-owned examples.
    const gha = detectGhaFloatingTags(cwd);
    if (gha)
        phase3.push(gha);
    // bkit-cloud.yml always-true auto-route gate (block scalar wrapping ${{ }}).
    const cloudGate = detectBkitCloudYmlAlwaysTrueGate(cwd);
    if (cloudGate)
        phase3.push(cloudGate);
    // Self-installed opencode.yml (/oc handler) drifted from the installed opencode provider —
    // it hardcodes a model + secret that `bkit install --opencode=` does not rewrite. Not for
    // claude.yml (its @claude handler is provider-fixed). bkit-cloud.yml self-syncs, so exempt.
    const opencodeYmlDrift = detectOpencodeYmlProviderDrift(cwd);
    if (opencodeYmlDrift)
        phase3.push(opencodeYmlDrift);
    // bkit-ci.yml missing actionlint (GHA-aware lint; yaml.safe_load is not sufficient).
    const ciActionlint = detectCiYmlMissingActionlint(cwd);
    if (ciActionlint)
        phase3.push(ciActionlint);
    // bkit-ci.yml untrusted input inlined into a run: body (GHA script-injection sink). Nothing
    // back-fills the template's env-indirection fix onto a copy adopted before it.
    const ciRunInjection = detectCiYmlRunInjection(cwd);
    if (ciRunInjection)
        phase3.push(ciRunInjection);
    // bkit-ci.yml capstone drifted from canonical contract (warning-only presence checks).
    const capstoneDrift = detectCiYmlCapstoneContractDrift(cwd);
    if (capstoneDrift)
        phase3.push(capstoneDrift);
    // @live/@smoke-tagged tests whose owning package declares no test:live/test:smoke
    // script — "no CI home".
    const taggedNoHome = detectTaggedTestsWithoutCiHome(cwd, onSuppressed);
    if (taggedNoHome)
        phase3.push(taggedNoHome);
    // bkit-stub sentinels in shipped templates — one advisory per still-commented stub.
    for (const stub of detectBkitStubs(cwd))
        phase3.push(stub);
    // turbo.json inputs for cache-replay safety (KN-24).
    for (const f of detectTurboIntegrationInputs(cwd))
        phase3.push(f);
    // test:integration runtime env (KN-23 false-confidence loop).
    const integrationEnv = detectTestIntegrationEnv(cwd, onSuppressed);
    if (integrationEnv)
        phase3.push(integrationEnv);
    // Consumer composed run-levels on bkit primitives (else docs/deployments.md matrix is doc-only).
    const runLevels = detectRunLevelsNotComposed(cwd);
    if (runLevels)
        phase3.push(runLevels);
    // vale not synced
    const vale = detectValePackageNotSynced(cwd);
    if (vale)
        phase3.push(vale);
    // actionlint + shellcheck for local pre-push workflow linting (CI has both)
    const wfLintTools = detectWorkflowLintToolsMissing(cwd);
    if (wfLintTools)
        phase3.push(wfLintTools);
    // [mcp-env] direnv + .bkit/.env advisories.
    // Wired here in Phase 3 — the .bkit/.env.example scaffold only exists after
    // writes, so Phase 1 cannot see it on first install.
    // Pass the consumer's tracker so the mcp-env prose omits BKIT_LINEAR_API_KEY on github/none
    // repos.
    const mcpEnvTracker = readConsumerIssueTracker(cwd);
    const missingDotenv = detectMissingDotenv(cwd, mcpEnvTracker);
    if (missingDotenv)
        phase3.push(missingDotenv);
    phase3.push(...detectBlankDotenvKeys(cwd, mcpEnvTracker));
    const direnvMissing = detectDirenvMissing(cwd, mcpEnvTracker);
    if (direnvMissing)
        phase3.push(direnvMissing);
    const direnvNotAllowed = detectDirenvNotAllowed(cwd, mcpEnvTracker);
    if (direnvNotAllowed)
        phase3.push(direnvNotAllowed);
    // Intra-phase dedup (first occurrence wins)
    const deduped = dedupeById(phase3);
    // Dedupe the incoming preflightAdvisories (ctx.advisories may contain module-emitted
    // duplicates in addition to runPreflight's already-deduped output).
    const dedupedPreflight = dedupeById(preflightAdvisories);
    // Cross-phase dedup: Phase 3 wins on conflict (remove preflight entries whose id
    // appears in Phase 3, then merge Phase 3 at the front for the winning position).
    const phase3Ids = new Set(deduped.map((f) => f.id));
    const filteredPreflight = dedupedPreflight.filter((f) => !phase3Ids.has(f.id));
    // Final order: preflight advisories (that weren't superseded) first, then Phase 3
    return [...filteredPreflight, ...deduped];
}
