Enforced: true
Red: 14
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 1

Plan: `docs/plans/202611/803-close-codex-opencode-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 7 | `.bkit/core/engine/install/network-allowlist.test.ts` "records the fingerprint of its own domains list" | red | failure: .toMatch() expects to receive a string, but got undefined |
| 7 | `.bkit/core/engine/install/network-allowlist.test.ts` "moves the fingerprint when allowed-domains changes" | red | failure: .toMatch() expects to receive a string, but got undefined |
| 7 | `.bkit/core/engine/install/cloud-env.test.ts` "renderCloudNetworkAllowlist names the .bkit/allowlist.json fingerprint and the BKIT_CLOUD_ALLOWLIST_FINGERPRINT step" | red | failure: expected 'Set to **Custom** and tick **Also inc…' to contain 'Allowlist fingerprint `03496757`' |
| 8 | `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: warns with the refresh steps and exits 0 when BKIT_CLOUD_ALLOWLIST_FINGERPRINT is unset" | red | failure |
| 8 | `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: warns naming both fingerprints when they differ, and continues" | red | failure |
| 8 | `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: reports a match as operator-asserted with the deployed allowlist unverified" | red | failure |
| 8 | `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent" | red | failure |
| 8 | `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: rejects a value that is not 8 hex characters without echoing it" | red | failure |
| 8 | `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: warns and continues when .bkit/allowlist.json is not valid JSON" | red | failure |
| 9 | `.bkit/core/engine/checks/before/files.test.ts` "reports an adopted bootstrap that never reads BKIT_CLOUD_ALLOWLIST_FINGERPRINT" | red | failure: detectCloudBootstrapFingerprintMissing is not a function |
| 9 | `.bkit/core/engine/checks/before/files.test.ts` "accepts a customised bootstrap that reads the variable" | red | failure: detectCloudBootstrapFingerprintMissing is not a function |
| 9 | `.bkit/core/engine/checks/before/files.test.ts` "stays silent when no bootstrap is adopted" | red | failure: detectCloudBootstrapFingerprintMissing is not a function |
| 9 | `.bkit/core/engine/commands/install/check.integration.test.ts` "bkit check reports a stale adopted cloud bootstrap with the template block to copy" | red | failure: [bkit-check] Running in check (dry-run) mode [bkit-check] [dry-run] Running core payload pass [bkit-check] [dry-run] core: .agents/context.md [bkit-check] [dry-run] core: .agents/docs.md [bkit-check] [dry-run] core: .agents/rules.md [bkit-check] [dry-run] core: .agents/skills.md [bkit-check] [dry-run] core: AGENTS.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-accessibility.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-adoption.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-agents.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-aio-seo.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-analytics.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-annotations.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-app-performance.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-app-store.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-architecture.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-ci-performance.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-config.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-cost.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-coverage.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-database.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-dead-code.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-deferrals.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-dependencies.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-issues.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-llm.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-logs.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-models.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-privacy.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-prompts.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-red-team.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-reliability.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-repo.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-security.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-slop.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-testing.md [bkit-check] [dry-run] core: docs/templates/bkit-audit-usability.md [bkit-check] [dry-run] core: docs/templates/bkit-plan.md [bkit-check] [dry-run] core: .gitignore [bkit-check] [dry-run] core: .gitattributes [bkit-check] [dry-run] Running bkit docs pass [bkit-check] [dry-run] core: .bkit/authoring.md [bkit-check] [dry-run] core: .bkit/cloud.md [bkit-check] [dry-run] core: .bkit/cli.md [bkit-check] [dry-run] core: .bkit/comparison.md [bkit-check] [dry-run] core: .bkit/install.md [bkit-check] [dry-run] core: .bkit/jsonl.md [bkit-check] [dry-run] core: .bkit/LICENSE.md [bkit-check] [dry-run] core: .bkit/pipeline.md [bkit-check] [dry-run] core: .bkit/providers.md [bkit-check] [dry-run] core: .bkit/prompts.md [bkit-check] [dry-run] core: .bkit/router.md [bkit-check] [dry-run] core: .bkit/templates.md [bkit-check] [dry-run] core: .bkit/trackers.md [bkit-check] [dry-run] core: .bkit/workflows.md [bkit-check] [dry-run] core: .bkit/README.md [bkit-check] [dry-run] Running template copies pass [bkit-check] [dry-run] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh [bkit-check] [dry-run] template added: .bkit/templates/.cursor/Dockerfile [bkit-check] [dry-run] template added: .bkit/templates/.cursor/environment.json [bkit-check] [dry-run] template added: .bkit/templates/.cursor/settings.json [bkit-check] [dry-run] template added: .bkit/templates/.envrc [bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml [bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml [bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml [bkit-check] [dry-run] template added: .bkit/templates/.github/dependabot.yml [bkit-check] [dry-run] template added: .bkit/templates/.github/renovate.json5 [bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-ci.yml [bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-cloud.yml [bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-health.yml [bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-renovate.yml [bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-trivy.yml [bkit-check] [dry-run] template added: .bkit/templates/.graphifyignore [bkit-check] [dry-run] template added: .bkit/templates/.husky/pre-commit [bkit-check] [dry-run] template added: .bkit/templates/.husky/pre-push [bkit-check] [dry-run] template added: .bkit/templates/.oxlintrc.json [bkit-check] [dry-run] template added: .bkit/templates/.serena/project.yml [bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml [bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml [bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml [bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml [bkit-check] [dry-run] template added: .bkit/templates/.vale.ini [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-cloudrun.md [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-expo.md [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-github.md [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-inngest.md [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-maestro.md [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-playwright.md [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-resend.md [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-sentry.md [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-serena.md [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-stripe.md [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-supabase.md [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-tavily.md [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-vercel.md [bkit-check] [dry-run] template added: .bkit/templates/docs/architecture.md [bkit-check] [dry-run] template added: .bkit/templates/docs/capabilities.md [bkit-check] [dry-run] template added: .bkit/templates/docs/components.md [bkit-check] [dry-run] template added: .bkit/templates/docs/data-schema.md [bkit-check] [dry-run] template added: .bkit/templates/docs/deployments.md [bkit-check] [dry-run] template added: .bkit/templates/docs/design.md [bkit-check] [dry-run] template added: .bkit/templates/docs/noise.md [bkit-check] [dry-run] template added: .bkit/templates/docs/observability.md [bkit-check] [dry-run] template added: .bkit/templates/docs/security.md [bkit-check] [dry-run] template added: .bkit/templates/docs/setup.md [bkit-check] [dry-run] template added: .bkit/templates/docs/technology.md [bkit-check] [dry-run] template added: .bkit/templates/docs/testing.md [bkit-check] [dry-run] template added: .bkit/templates/lintstagedrc.example.json [bkit-check] [dry-run] template added: .bkit/templates/prettierignore.example [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs [bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs [bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs [bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh [bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh [bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example [bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist [bkit-check] [dry-run] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs [bkit-check] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs [bkit-check] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs [bkit-check] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh [bkit-check] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json [bkit-check] [dry-run] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs [bkit-check] [dry-run] template added: .bkit/templates/slop-scan.config.json [bkit-check] [dry-run] payload link: .bkit/core [bkit-check] [dry-run] payload link: .bkit/shared [bkit-check] [dry-run] core: .bkit/allowlist.json [bkit-check] [dry-run] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts [bkit-check] [dry-run] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json [bkit-check] [dry-run] write version pin: .bkit/version (6.1.1) [bkit-check] 153 write(s) would occur. [bkit] What's new in v6.1.1: [6.1.1] — 2026-11-04 Fixed, Upgrade Notes ========================================================== bkit advisories ========================================================== 9 finding(s) — 0 blocker, 9 advisory. INSTRUCTIONS FOR AN AI AGENT — copy this file (or specific items) into a coding assistant to apply each item. Each ACTION is self-contained. --- 1/9 [advisory] gate-missing-called-scripts --- Detect: The bkit:gate scripts call scripts package.json does not declare: `bkit:lint:prose`, `bkit:slop:delta`, `build`, `format:check`, `lint`, `test`, `typecheck`. Action: Every bkit workflow runs a `bkit:gate*` script, so a missing link fails the whole gate. Add `bkit:lint:prose`, `bkit:slop:delta`, `build`, `format:check`, `lint`, `test`, `typecheck` to package.json (`.bkit/templates.md` lists the tool scripts and the devDeps they need), or edit the `bkit:gate*` scripts to drop what this repo does not have. Gate contents (`.bkit/workflows.md` § Local gate scripts): every gate but `bkit:gate:static-unit-integration-e2e` and `bkit:gate:static-unit-integration-e2e-live` runs on a push or inside `/bkit-build`, so it MUST NOT run tests that need a deployed boundary or remote service; local services (a database in Docker) are fine. --- 2/9 [advisory] test-file-script-missing --- Detect: package.json does not declare `bkit:test:file`, so `/bkit-build` cannot check that each task's tests fail before its code is written. Action: Add `bkit:test:file` to package.json: it runs the ONE test file bkit appends as its argument (repo-relative path) and writes a JUnit report to the path in `$BKIT_TEST_REPORT`. Vitest example: "bkit:test:file": "vitest run --reporter=default --reporter=junit --outputFile.junit=\"$BKIT_TEST_REPORT\"" jest reads a bare path as a regex, so a folder such as `(tabs)` matches no file: pass `--runTestsByPath`. Call the runner directly, not through a task runner that caches results or runs dependent packages first. A monorepo routes the path to the package and config that own it. --- 3/9 [advisory] gate-changed-script-missing --- Detect: package.json does not declare `bkit:gate:changed`, so `/bkit-build` and `/bkit-debug` agents run a whole gate (`bkit:gate:static` or `bkit:gate:static-unit`) after every change instead of checking only what changed. Action: Add `bkit:gate:changed` to package.json. `bkit tests changed` calls it with the changed files as its arguments (repo-relative paths: uncommitted, untracked and committed since the step began; deleted files left out) and never with none. It runs the tests that import those files, the tests that name their paths, and the static checks (lint, format, typecheck) on those files, exiting 0 when clean. Vitest + ESLint example, with `scripts/gate-changed.sh` holding `vitest related --run "$@" && eslint --max-warnings=0 --no-error-on-unmatched-pattern "$@" && prettier --check --ignore-unknown "$@"`: "bkit:gate:changed": "sh scripts/gate-changed.sh" `vitest related` finds only importers; also run the tests that read a changed file by its path (a text search of the test files for each path). The orchestrator's group gate, pre-push and CI still run the whole gates. To keep the whole gate on every change, add `gate-changed-script-missing` to `bkit.advisories.ignore` in package.json. Gate contents (`.bkit/workflows.md` § Local gate scripts): every gate but `bkit:gate:static-unit-integration-e2e` and `bkit:gate:static-unit-integration-e2e-live` runs on a push or inside `/bkit-build`, so it MUST NOT run tests that need a deployed boundary or remote service; local services (a database in Docker) are fine. --- 4/9 [advisory] first-install-postinstall-steps --- Detect: First install detected (.bkit/version was absent). Action: Post-install steps: 1. Run `pnpm install` to refresh the lockfile, then commit. 2. See `.bkit/install.md` for consumer setup and `.bkit/README.md` for ongoing ops. Note: bkit seeded the bkit:gate:* / bkit:deps:* package.json scripts every workflow runs (existing values are never touched). The tool scripts they chain (typecheck, lint, format:check, bkit:lint:prose, bkit:slop:delta) and the devDeps those need are yours to add: see .bkit/templates.md. --- 5/9 [advisory] tracker-setup-none --- Detect: bkit tracker is not configured (`bkit.tracker.default` absent). Workflows run but every tracker call is a no-op. Action: Optional post-install decision. Run `bkit install --tracker=github` (recommended), `--tracker=linear` or `--tracker=jira` to enable tracker integration. GitHub tracker requires `BKIT_GH_TOKEN` in `.bkit/.env` (fine-grained PAT for one owner, classic PAT across owners). Linear tracker requires `BKIT_LINEAR_API_KEY` in `.bkit/.env`. Jira tracker requires `BKIT_JIRA_API_KEY` in `.bkit/.env` and `bkit.tracker.jira` in package.json. To opt out and silence this advisory, set `bkit.tracker.default` to `"none"` in package.json. --- 6/9 [advisory] cloud-secrets-three-locations --- Detect: The secrets bkit's cloud integration uses must also be set in each cloud location you use. Bkit cannot verify dashboard state — surface the checklist so you don't ship a half-configured cloud setup. Action: Set each secret in the required locations: 1. **Claude Code (web)**: open `https://claude.ai/code` → environment selector → your environment → **Environment variables**. Paste the block from `.claude/bkit-cloud.md` (gitignored), which also carries the setup script and network list. Claude reads both from the dashboard, NOT from the repo, so changes here do not require a commit. **Context-fetch (`/bkit-debug` in the cloud):** if you run the debug workflow in these cloud agents, the observability creds your `.agents/context.md` context-fetch blocks use (e.g. `VERCEL_TOKEN`, `SUPABASE_ACCESS_TOKEN`) must ALSO be set in the same dashboards above — non-interactively, since headless agents cannot `vercel login`. These are operator/observability READ creds, not app-runtime secrets. Commit the non-secret selectors (team scope / project ref / `--environment`) in your copied block so they need no dashboard entry. The CLIs those blocks call install automatically in the cloud from each block's `context-fetch:provision` sibling — no manual setup. Same VALUE in all places. --- 7/9 [advisory] project-docs-index-missing --- Detect: .agents/docs.md is absent, so agents have no list of the project's own documents to consult. Action: Run `bkit install` to write .agents/docs.md, then add a row under `## Project Documents` for each project document you keep. Until then agents warn and fall back to repository evidence. --- 8/9 [advisory] project-docs-missing --- Detect: No project document covers: docs/architecture.md, docs/technology.md, docs/security.md, docs/data-schema.md, docs/testing.md, docs/deployments.md, docs/observability.md, docs/design.md, docs/noise.md, docs/setup.md. Action: Copy the starter for each topic you want from `.bkit/templates/docs/` into `docs/`, fill it in from the repository, and add its row to `## Project Documents` in .agents/docs.md. A document you already keep elsewhere counts: index it with `Equivalent to <recommended path>` in its Scope cell. Skip topics that do not apply. --- 9/9 [advisory] vale-package-not-synced --- Detect: vale is on PATH but the repo has no .vale.ini and .vale/styles/write-good/ is absent — prose linting does not run. Action: Adopt bkit's Vale template first: copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/Bkit/*.yml to .vale/styles/Bkit/. Then run `vale sync` (one-time per repo) to download the write-good package the copied .vale.ini names. `vale sync` reads its package list from .vale.ini, so it cannot fetch write-good before that file exists. --- Setup tips --- Things not set up yet, most useful first. For the person: each tip says what goes wrong today and a sentence to ask your agent. For an AI agent: follow each tip's Agent steps unless the person declines it. Silence a tip by adding its id to `bkit.advisories.ignore` in package.json; `bkit-upgrade` cannot be silenced. Full template catalogue: .bkit/templates.md. 1. Connect an issue tracker (tracker) bkit isn't connected to an issue tracker, so it can't read the task it's working on or record what it did. Connect GitHub, Linear or Jira, or switch this tip off if you don't want one. Why: Every workflow starts by reading the issue it's working on and reports progress back to it as it goes. Without a tracker, you have to paste in what the agent should look at each time, and nothing records what changed or why. Ask your agent: "Connect bkit to GitHub Issues: re-run `bkit install` with the tool flags I use plus `--tracker=github` (it records `bkit.tracker.default` in package.json and adds the tracker server to .mcp.json). If I don't want a tracker, set `"issueTracker": "none"` under `bkit` in package.json instead." Agent steps: `.bkit/install.md` § Optional post-install decisions. Opt out: `"bkit": { "tracker": { "default": "none" } }` in `package.json`. 2. Let agents look code up directly (serena) Agents are finding code by searching for words, which is slower, costs more, and misses things. Set up Serena so they can look code up directly. Why: Serena lets agents look up code the way your editor does ("where is this defined, and what uses it?") instead of guessing from text search and reading whole files. That means fewer accidental changes, fewer rounds of you correcting them, and lower running costs because they read less. It can only look things up, never change your files. Ask your agent: "Run `brew install uv` and `uv tool install -p 3.13 serena-agent`, copy .bkit/templates/.serena/project.yml to .serena/project.yml and .bkit/templates/scripts/serena/ to scripts/serena/, then add the `serena` server from scripts/serena/bkit-serena.mcp.json to .mcp.json (details: .bkit/templates.md § Serena)." Agent steps: `.bkit/templates.md` § Serena. 3. Automatic checks on every change (ci-workflow) Nothing checks your changes automatically before they're merged, so broken code can land unnoticed. Add bkit's check workflow. Why: This runs your tests and checks on GitHub every time something changes, and bkit's ship step waits for it to pass before merging. Without it, "shipped" only means "merged", not "checked". Ask your agent: "Copy .bkit/templates/.github/workflows/bkit-ci.yml to .github/workflows/<the file package.json `bkit.testing.ciWorkflow` names; default bkit-ci.yml>, replace `main` and `{{NODE_VERSION}}` in it with my default branch and Node major version, and add the `typecheck`, `lint`, `format:check`, `bkit:lint:prose`, `bkit:slop:delta` and `test` scripts to package.json as listed in .bkit/templates.md § Gate tool scripts." Agent steps: `.bkit/templates.md` § CI workflow and § Gate tool scripts. 4. Catch problems before they leave your machine (husky) Mistakes are only caught after changes reach GitHub. Add the local checks so they're caught the moment a change is saved to git. Why: These run the same checks on your own computer, in seconds, whenever a change is committed or pushed. Without them you find out minutes later from a failed build, after the agent has moved on and fixing it costs more. Ask your agent: "Run `pnpm add -D husky`, add `"prepare": "husky"` to the package.json scripts, copy .bkit/templates/.husky/pre-commit and .bkit/templates/.husky/pre-push to .husky/, and run `chmod +x .husky/pre-commit .husky/pre-push`." Agent steps: `.bkit/templates.md` § Git hooks. 5. Consistent formatting (prettier) There's no shared formatting setup, so reviews fill up with spacing changes that hide the real ones. Add Prettier with bkit's ignore file. Why: Prettier (a code formatter) makes every file follow the same layout. bkit's ignore file stops it reformatting bkit's own files, which would otherwise show up as false changes every time bkit updates. Ask your agent: "Copy .bkit/templates/prettierignore.example to .prettierignore first, then run `pnpm add -D prettier` and add `"format:check": "prettier --check ."` to the package.json scripts." Agent steps: `.bkit/templates.md` § Prettier. 6. Catch junk code (slop-scan) Nothing catches the junk code AI tends to write. Add slop-scan so new junk gets flagged before it's merged. Why: Filler and dead code look fine when you skim a change, so they pile up unnoticed until the codebase is hard to trust. slop-scan flags only new problems, so it won't bury you in old ones. Ask your agent: "Run `pnpm add -D slop-scan`, copy .bkit/templates/slop-scan.config.json to slop-scan.config.json and .bkit/templates/scripts/slop/ to scripts/slop/, and add `"lint:slop": "slop-scan scan ."` and `"bkit:slop:delta": "bkit ci slop"` to the package.json scripts." Agent steps: `.bkit/templates.md` § slop-scan. 7. Keep written docs tight (vale) Nothing checks the project's written docs, so they slowly fill with vague, padded wording that agents then have to read. Add Vale. Why: Agents read your docs and instructions on every run. Padded writing costs time and money every time it's read, and vague rules get followed vaguely. Vale (a writing checker) flags it. Ask your agent: "Run `brew install vale`, copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/Bkit/ to .vale/styles/Bkit/, then run `vale sync`." Agent steps: `.bkit/templates.md` § Vale. 8. Quick tidy-up on commit (lint-staged) The commit check has nothing to run. Add lint-staged so it tidies just the files you're committing. Why: It formats only the handful of files in each change, in about a second. Without it the commit check either does nothing or is slow enough that people start skipping it. Ask your agent: "Run `pnpm add -D lint-staged prettier` and copy .bkit/templates/lintstagedrc.example.json to .lintstagedrc.json." Agent steps: `.bkit/templates.md` § lint-staged. 9. Keep passwords the same everywhere (secrets-sync) Your deployment passwords are updated by hand in each service. Add bkit's sync tool so they're set in one place and copied everywhere. Why: The same password usually lives in several places: your hosting, your database, GitHub. When one falls out of step you get "works for me, broken in production", the slowest kind of bug to find. This keeps them matching and proves it without showing any values. Ask your agent: "Copy .bkit/templates/scripts/secrets/ to scripts/secrets/, fill in scripts/secrets/bkit-secrets.config.mjs for the services this project uses, then run `node scripts/secrets/bkit-secrets.mjs sync --dry-run`." Agent steps: `.bkit/templates.md` § Secrets sync. 10. A map of the code (graphify) Optional: add graphify to keep an up-to-date map of how your code fits together. Why: With a map, agents check what already exists before building it again. Without one, agents and reviews work out the structure from scratch each time. That's slower, and it's easy to miss how one change ripples into another part of the code. Ask your agent: "Run `uv tool install "graphifyy[sql]"`, copy .bkit/templates/scripts/graphify/ to scripts/graphify/ and .bkit/templates/.graphifyignore to .graphifyignore, then add the graph scripts to package.json as listed in .bkit/templates.md § graphify." Agent steps: `.bkit/templates.md` § graphify. 11. Readable table changes (prettier-tables) Optional: if your docs have tables, add this so editing one cell doesn't show the whole table as changed. Why: Changing one cell normally reformats the whole table, so a one-word edit looks like a page of changes and reviewers can't see what actually moved. Ask your agent: "Copy .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs to scripts/prettier/ and run `node scripts/prettier/bkit-insert-ignore.mjs`." Agent steps: `.bkit/templates.md` § Prettier tables. ========================================================== [bkit-check] Wrote .bkit/advisories.md (9 items). [bkit-check] check: 153 write(s) would occur — DRIFT DETECTED : expected '[bkit-check] Running in check (dry-ru…' to contain 'cloud-bootstrap-fingerprint-missing' |
| 9 | `.bkit/core/engine/commands/install/doctor.integration.test.ts` "bkit doctor lists a stale adopted cloud bootstrap" | red | failure: [bkit-doctor] Running advisory scan (no managed-file writes) [bkit-doctor] Payload roots: core=/Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode/.bkit/core shared=/Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode/.bkit/shared templates=/Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode/.bkit/templates ========================================================== bkit advisories ========================================================== 5 finding(s) — 0 blocker, 5 advisory. INSTRUCTIONS FOR AN AI AGENT — copy this file (or specific items) into a coding assistant to apply each item. Each ACTION is self-contained. --- 1/5 [advisory] tracker-setup-none --- Detect: bkit tracker is not configured (`bkit.tracker.default` absent). Workflows run but every tracker call is a no-op. Action: Optional post-install decision. Run `bkit install --tracker=github` (recommended), `--tracker=linear` or `--tracker=jira` to enable tracker integration. GitHub tracker requires `BKIT_GH_TOKEN` in `.bkit/.env` (fine-grained PAT for one owner, classic PAT across owners). Linear tracker requires `BKIT_LINEAR_API_KEY` in `.bkit/.env`. Jira tracker requires `BKIT_JIRA_API_KEY` in `.bkit/.env` and `bkit.tracker.jira` in package.json. To opt out and silence this advisory, set `bkit.tracker.default` to `"none"` in package.json. --- 2/5 [advisory] cloud-secrets-three-locations --- Detect: The secrets bkit's cloud integration uses must also be set in each cloud location you use. Bkit cannot verify dashboard state — surface the checklist so you don't ship a half-configured cloud setup. Action: Set each secret in the required locations: 1. **Claude Code (web)**: open `https://claude.ai/code` → environment selector → your environment → **Environment variables**. Paste the block from `.claude/bkit-cloud.md` (gitignored), which also carries the setup script and network list. Claude reads both from the dashboard, NOT from the repo, so changes here do not require a commit. **Context-fetch (`/bkit-debug` in the cloud):** if you run the debug workflow in these cloud agents, the observability creds your `.agents/context.md` context-fetch blocks use (e.g. `VERCEL_TOKEN`, `SUPABASE_ACCESS_TOKEN`) must ALSO be set in the same dashboards above — non-interactively, since headless agents cannot `vercel login`. These are operator/observability READ creds, not app-runtime secrets. Commit the non-secret selectors (team scope / project ref / `--environment`) in your copied block so they need no dashboard entry. The CLIs those blocks call install automatically in the cloud from each block's `context-fetch:provision` sibling — no manual setup. Same VALUE in all places. --- 3/5 [advisory] project-docs-index-missing --- Detect: .agents/docs.md is absent, so agents have no list of the project's own documents to consult. Action: Run `bkit install` to write .agents/docs.md, then add a row under `## Project Documents` for each project document you keep. Until then agents warn and fall back to repository evidence. --- 4/5 [advisory] project-docs-missing --- Detect: No project document covers: docs/architecture.md, docs/technology.md, docs/security.md, docs/data-schema.md, docs/testing.md, docs/deployments.md, docs/observability.md, docs/design.md, docs/noise.md, docs/setup.md. Action: Copy the starter for each topic you want from `.bkit/templates/docs/` into `docs/`, fill it in from the repository, and add its row to `## Project Documents` in .agents/docs.md. A document you already keep elsewhere counts: index it with `Equivalent to <recommended path>` in its Scope cell. Skip topics that do not apply. --- 5/5 [advisory] vale-package-not-synced --- Detect: vale is on PATH but the repo has no .vale.ini and .vale/styles/write-good/ is absent — prose linting does not run. Action: Adopt bkit's Vale template first: copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/Bkit/*.yml to .vale/styles/Bkit/. Then run `vale sync` (one-time per repo) to download the write-good package the copied .vale.ini names. `vale sync` reads its package list from .vale.ini, so it cannot fetch write-good before that file exists. --- Setup tips --- Things not set up yet, most useful first. For the person: each tip says what goes wrong today and a sentence to ask your agent. For an AI agent: follow each tip's Agent steps unless the person declines it. Silence a tip by adding its id to `bkit.advisories.ignore` in package.json; `bkit-upgrade` cannot be silenced. Full template catalogue: .bkit/templates.md. 1. Connect an issue tracker (tracker) bkit isn't connected to an issue tracker, so it can't read the task it's working on or record what it did. Connect GitHub, Linear or Jira, or switch this tip off if you don't want one. Why: Every workflow starts by reading the issue it's working on and reports progress back to it as it goes. Without a tracker, you have to paste in what the agent should look at each time, and nothing records what changed or why. Ask your agent: "Connect bkit to GitHub Issues: re-run `bkit install` with the tool flags I use plus `--tracker=github` (it records `bkit.tracker.default` in package.json and adds the tracker server to .mcp.json). If I don't want a tracker, set `"issueTracker": "none"` under `bkit` in package.json instead." Agent steps: `.bkit/install.md` § Optional post-install decisions. Opt out: `"bkit": { "tracker": { "default": "none" } }` in `package.json`. 2. Let agents look code up directly (serena) Agents are finding code by searching for words, which is slower, costs more, and misses things. Set up Serena so they can look code up directly. Why: Serena lets agents look up code the way your editor does ("where is this defined, and what uses it?") instead of guessing from text search and reading whole files. That means fewer accidental changes, fewer rounds of you correcting them, and lower running costs because they read less. It can only look things up, never change your files. Ask your agent: "Run `brew install uv` and `uv tool install -p 3.13 serena-agent`, copy .bkit/templates/.serena/project.yml to .serena/project.yml and .bkit/templates/scripts/serena/ to scripts/serena/, then add the `serena` server from scripts/serena/bkit-serena.mcp.json to .mcp.json (details: .bkit/templates.md § Serena)." Agent steps: `.bkit/templates.md` § Serena. 3. Automatic checks on every change (ci-workflow) Nothing checks your changes automatically before they're merged, so broken code can land unnoticed. Add bkit's check workflow. Why: This runs your tests and checks on GitHub every time something changes, and bkit's ship step waits for it to pass before merging. Without it, "shipped" only means "merged", not "checked". Ask your agent: "Copy .bkit/templates/.github/workflows/bkit-ci.yml to .github/workflows/<the file package.json `bkit.testing.ciWorkflow` names; default bkit-ci.yml>, replace `main` and `{{NODE_VERSION}}` in it with my default branch and Node major version, and add the `typecheck`, `lint`, `format:check`, `bkit:lint:prose`, `bkit:slop:delta` and `test` scripts to package.json as listed in .bkit/templates.md § Gate tool scripts." Agent steps: `.bkit/templates.md` § CI workflow and § Gate tool scripts. 4. Catch problems before they leave your machine (husky) Mistakes are only caught after changes reach GitHub. Add the local checks so they're caught the moment a change is saved to git. Why: These run the same checks on your own computer, in seconds, whenever a change is committed or pushed. Without them you find out minutes later from a failed build, after the agent has moved on and fixing it costs more. Ask your agent: "Run `pnpm add -D husky`, add `"prepare": "husky"` to the package.json scripts, copy .bkit/templates/.husky/pre-commit and .bkit/templates/.husky/pre-push to .husky/, and run `chmod +x .husky/pre-commit .husky/pre-push`." Agent steps: `.bkit/templates.md` § Git hooks. 5. Consistent formatting (prettier) There's no shared formatting setup, so reviews fill up with spacing changes that hide the real ones. Add Prettier with bkit's ignore file. Why: Prettier (a code formatter) makes every file follow the same layout. bkit's ignore file stops it reformatting bkit's own files, which would otherwise show up as false changes every time bkit updates. Ask your agent: "Copy .bkit/templates/prettierignore.example to .prettierignore first, then run `pnpm add -D prettier` and add `"format:check": "prettier --check ."` to the package.json scripts." Agent steps: `.bkit/templates.md` § Prettier. 6. Catch junk code (slop-scan) Nothing catches the junk code AI tends to write. Add slop-scan so new junk gets flagged before it's merged. Why: Filler and dead code look fine when you skim a change, so they pile up unnoticed until the codebase is hard to trust. slop-scan flags only new problems, so it won't bury you in old ones. Ask your agent: "Run `pnpm add -D slop-scan`, copy .bkit/templates/slop-scan.config.json to slop-scan.config.json and .bkit/templates/scripts/slop/ to scripts/slop/, and add `"lint:slop": "slop-scan scan ."` and `"bkit:slop:delta": "bkit ci slop"` to the package.json scripts." Agent steps: `.bkit/templates.md` § slop-scan. 7. Keep written docs tight (vale) Nothing checks the project's written docs, so they slowly fill with vague, padded wording that agents then have to read. Add Vale. Why: Agents read your docs and instructions on every run. Padded writing costs time and money every time it's read, and vague rules get followed vaguely. Vale (a writing checker) flags it. Ask your agent: "Run `brew install vale`, copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/Bkit/ to .vale/styles/Bkit/, then run `vale sync`." Agent steps: `.bkit/templates.md` § Vale. 8. Quick tidy-up on commit (lint-staged) The commit check has nothing to run. Add lint-staged so it tidies just the files you're committing. Why: It formats only the handful of files in each change, in about a second. Without it the commit check either does nothing or is slow enough that people start skipping it. Ask your agent: "Run `pnpm add -D lint-staged prettier` and copy .bkit/templates/lintstagedrc.example.json to .lintstagedrc.json." Agent steps: `.bkit/templates.md` § lint-staged. 9. Keep passwords the same everywhere (secrets-sync) Your deployment passwords are updated by hand in each service. Add bkit's sync tool so they're set in one place and copied everywhere. Why: The same password usually lives in several places: your hosting, your database, GitHub. When one falls out of step you get "works for me, broken in production", the slowest kind of bug to find. This keeps them matching and proves it without showing any values. Ask your agent: "Copy .bkit/templates/scripts/secrets/ to scripts/secrets/, fill in scripts/secrets/bkit-secrets.config.mjs for the services this project uses, then run `node scripts/secrets/bkit-secrets.mjs sync --dry-run`." Agent steps: `.bkit/templates.md` § Secrets sync. 10. A map of the code (graphify) Optional: add graphify to keep an up-to-date map of how your code fits together. Why: With a map, agents check what already exists before building it again. Without one, agents and reviews work out the structure from scratch each time. That's slower, and it's easy to miss how one change ripples into another part of the code. Ask your agent: "Run `uv tool install "graphifyy[sql]"`, copy .bkit/templates/scripts/graphify/ to scripts/graphify/ and .bkit/templates/.graphifyignore to .graphifyignore, then add the graph scripts to package.json as listed in .bkit/templates.md § graphify." Agent steps: `.bkit/templates.md` § graphify. 11. Readable table changes (prettier-tables) Optional: if your docs have tables, add this so editing one cell doesn't show the whole table as changed. Why: Changing one cell normally reformats the whole table, so a one-word edit looks like a page of changes and reviewers can't see what actually moved. Ask your agent: "Copy .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs to scripts/prettier/ and run `node scripts/prettier/bkit-insert-ignore.mjs`." Agent steps: `.bkit/templates.md` § Prettier tables. ========================================================== [bkit-doctor] Wrote .bkit/advisories.md (5 items). : expected '[bkit-doctor] Running advisory scan (…' to contain 'cloud-bootstrap-fingerprint-missing' |

## Gaps

None.

## Lint output — `.bkit/core/engine/install/network-allowlist.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/install/network-allowlist.test.ts

```

## Runner output — `.bkit/core/engine/install/network-allowlist.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/install/network-allowlist.test.ts

[test-timeout-budget] load average 21.0 on 10 cores: unit limits 15000ms per test, 30000ms per hook (x3.00)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > writes the file when absent and records the write
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > is idempotent — a second run changes nothing
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > dry-run writes nothing but records the same write set (the `bkit check` drift signal)
[test] [dry-run] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > regenerates a hand-edited file whole
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > picks up consumer allowed-domains from .agents/context.md
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > records the fingerprint of its own domains list
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > moves the fingerprint when allowed-domains changes
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > removes the retired copy bkit recorded and records the removal
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > dry-run keeps the retired copy but reports the removal
[test] [dry-run] core: .bkit/allowlist.json
[test] [dry-run] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > leaves a .cursor/allowlist.json bkit never recorded alone
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > is idempotent — a second run finds nothing to migrate
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ❯ .bkit/core/engine/install/network-allowlist.test.ts (11 tests | 2 failed) 58ms
   ❯ writeNetworkAllowlist — .bkit/allowlist.json (7)
     ✓ writes the file when absent and records the write 6ms
     ✓ is idempotent — a second run changes nothing 12ms
     ✓ dry-run writes nothing but records the same write set (the `bkit check` drift signal) 2ms
     ✓ regenerates a hand-edited file whole 2ms
     ✓ picks up consumer allowed-domains from .agents/context.md 4ms
     × records the fingerprint of its own domains list 7ms
     × moves the fingerprint when allowed-domains changes 3ms
   ✓ writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) (4)
     ✓ removes the retired copy bkit recorded and records the removal 4ms
     ✓ dry-run keeps the retired copy but reports the removal 2ms
     ✓ leaves a .cursor/allowlist.json bkit never recorded alone 13ms
     ✓ is idempotent — a second run finds nothing to migrate 3ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > records the fingerprint of its own domains list
TypeError: .toMatch() expects to receive a string, but got undefined
 ❯ .bkit/core/engine/install/network-allowlist.test.ts:91:29
     89|     run(false);
     90|     const doc = JSON.parse(fs.readFileSync(path.join(tmpDir, NETWORK_A…
     91|     expect(doc.fingerprint).toMatch(/^[0-9a-f]{8}$/);
       |                             ^
     92|     expect(doc.fingerprint).toBe(egressFingerprint(doc.domains));
     93|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > moves the fingerprint when allowed-domains changes
TypeError: .toMatch() expects to receive a string, but got undefined
 ❯ .bkit/core/engine/install/network-allowlist.test.ts:101:20
     99|     run(false);
    100|     const before = stamp();
    101|     expect(before).toMatch(/^[0-9a-f]{8}$/);
       |                    ^
    102|     write(
    103|       ".agents/context.md",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 9 passed (11)
   Start at  18:38:25
   Duration  1.30s (setup 38%, transform 34%, import 17%, tests 10%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-3N0fAr/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/install/cloud-env.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/install/cloud-env.test.ts

```

## Runner output — `.bkit/core/engine/install/cloud-env.test.ts`

````

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/install/cloud-env.test.ts

[test-timeout-budget] load average 21.9 on 10 cores: unit limits 15450ms per test, 30900ms per hook (x3.09)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode

 ❯ .bkit/core/engine/install/cloud-env.test.ts (102 tests | 1 failed) 342ms
   ✓ parseEnvrc (1)
     ✓ extracts dotenv targets in order, unsets (single + multi), and exports 5ms
   ✓ parseDotenv (1)
     ✓ parses KEY=value, honours quotes, export prefix, and '=' inside value 2ms
   ✓ resolveConsumerPnpm / renderCorepackLine (2)
     ✓ parses the full pnpm version from packageManager 2ms
     ✓ degrades to bare corepack enable when packageManager is absent 2ms
   ✓ resolveCloudEnvVars (7)
     ✓ follows .envrc: last-source wins, honours unsets, drops hijack + empty, flags placeholders 7ms
     ✓ drops exactly the three documented session-hijack keys (docs/security.md) 4ms
     ✓ never lets ANTHROPIC_API_KEY into the paste block 8ms
     ✓ never lets BKIT_ANTHROPIC_API_KEY into the paste block 8ms
     ✓ never lets ANTHROPIC_AUTH_TOKEN into the paste block 5ms
     ✓ never lets BKIT_OPENAI_API_KEY into the paste block 6ms
     ✓ returns an empty resolution (the sole baseline placeholder) when no .envrc exists 2ms
   ✓ renderCloudEnvBlock (2)
     ✓ emits only the resolved lines when every baseline token resolved 4ms
     ✓ emits a placeholder line for an absent baseline token 13ms
   ✓ renderCloudEnvNotes (2)
     ✓ summarises dropped/unset/empty/placeholder categories 4ms
     ✓ emits a no-.envrc message when none exists 2ms
   ✓ template generation sentinels (8)
     ✓ template carries the generation sentinels the module substitutes 1ms
     ✓ trust + user-settings sentinels sit AFTER the jq install (both regions need jq) 1ms
     ✓ cache-bust sentinel sits at the top of the setup script (after the shebang) 0ms
     ✓ installs the pinned Node onto PATH before corepack runs 6ms
     ✓ pins a Node major that satisfies package.json engines.node 2ms
     ✓ pairs every download *_VERSION with a *_SHA256 2ms
     ✓ shares every version + sha256 pin with the Cursor Dockerfile template 3ms
     ✓ puts a renovate comment directly above every *_VERSION pin 2ms
   ✓ extractContextFetchProvisionRecipes / renderCloudContextFetchProvision (5)
     ✓ returns [] when .agents/context.md is absent 1ms
     ✓ ignores provision blocks inside the managed block (only consumer-section counts) 3ms
     ✓ extracts the bash body of each consumer-section provision block 4ms
     ✓ names an unnamed provision block by its position 2ms
     ✓ does not treat a fetch (context-fetch:start) block as a provision recipe 4ms
   ✓ renderCloudCacheBust (4)
     ✓ starts the counter at 1 when no prior doc exists 1ms
     ✓ increments the counter when the prior doc has today's date 3ms
     ✓ resets the counter to 1 when the prior doc is from an earlier date 2ms
     ✓ starts at 1 when the prior doc has no cache-bust line (pre-feature doc) 3ms
   ✓ writeClaudeCloudDoc — end-to-end render (real template) (4)
     ✓ emits a cache-bust line and leaves NO unreplaced @@CLOUD_ sentinels 7ms
     ✓ advances the counter on a same-day regeneration 4ms
     ✓ renders the always-Custom block with shipped hosts when no allowed-domains are declared 3ms
     ✓ renders the Custom allowlist when allowed-domains are declared 4ms
   ❯ extractAllowedDomains / expandAllowedDomains / renderCloudNetworkAllowlist (10)
     ✓ returns [] when context.md is absent or has no allowed-domains block 3ms
     ✓ extracts declared domains, ignoring comments/blank/marker lines 2ms
     ✓ only reads blocks BELOW bkit:end (managed-section examples ignored) 1ms
     ✓ expands each domain to apex + wildcard, normalising a leading *., deduped/sorted 1ms
     ✓ networkAllowlistBases collapses wildcards to apex, dedupes, and sorts 1ms
     ✓ networkAllowlistBases drops empty/whitespace entries and trims 2ms
     ✓ networkAllowlistBases returns [] for an empty input 1ms
     ✓ renders the always-Custom block (with pointer) when nothing is declared 1ms
     × renderCloudNetworkAllowlist names the .bkit/allowlist.json fingerprint and the BKIT_CLOUD_ALLOWLIST_FINGERPRINT step 18ms
     ✓ resolveNetworkAllowlist stays stack-agnostic until consumer declares domains 2ms
   ✓ cloudRepoPath / renderCloudWorkspaceTrust (3)
     ✓ bakes the container clone path from the repo directory name 1ms
     ✓ merges the trust key rather than clobbering an existing .claude.json 1ms
     ✓ honours CLAUDE_CONFIG_DIR, falling back to $HOME 1ms
   ✓ cloudAutoModeEnvironment / renderCloudUserSettings (5)
     ✓ ALWAYS emits $defaults first — omitting it discards every built-in trust slot 3ms
     ✓ names the sandbox in a Host containment entry (default assumes an open-internet dev box) 1ms
     ✓ lists every allowlist host exactly once, from the same resolver the other consumers use 3ms
     ✓ seeds with //= so a consumer's own autoMode.environment is never overwritten 1ms
     ✓ embeds the environment list as valid JSON inside single quotes 1ms
   ✓ cloud setup scripts — the closing line names failed provision recipes (2)
     ✓ .claude: closes with $BKIT_UNAVAILABLE, after the recipes run 5ms
     ✓ .codex: closes with $BKIT_UNAVAILABLE, after the recipes run 5ms
   ✓ cloud docs — the env block never depends on the tracker (6)
     ✓ .claude: every tracker renders the same block for the same .envrc 14ms
     ✓ .cursor: every tracker renders the same block for the same .envrc 11ms
     ✓ .codex: every tracker renders the same block for the same .envrc 13ms
     ✓ .claude: no tracker key gets a placeholder; only BKIT_GH_TOKEN does 4ms
     ✓ .cursor: no tracker key gets a placeholder; only BKIT_GH_TOKEN does 3ms
     ✓ .codex: no tracker key gets a placeholder; only BKIT_GH_TOKEN does 5ms
   ✓ renderCursorContextFetchProvision (2)
     ✓ returns '' when no consumer provision blocks are declared 2ms
     ✓ surfaces the same recipes as the Claude path, pointed at environment.json install 3ms
   ✓ renderCursorNetworkAllowlist (3)
     ✓ no allowed-domains → still emits a fence carrying the shipped hosts (T13) 1ms
     ✓ declared domains → each as the domain and a *. wildcard, so its subdomains are reachable 2ms
     ✓ a declared shared hosting platform is widened too, with a note that it reaches every tenant 2ms
   ✓ cursor template generation sentinels (2)
     ✓ carries the sentinels writeCursorCloudDoc substitutes, and NO Claude-only ones 1ms
     ✓ directs secrets to the Runtime Secret / Secrets-tab path, not the Environment Variables pane 1ms
   ✓ writeCursorCloudDoc — end-to-end render (real template) (1)
     ✓ writes a sentinel-free, chmod-600 doc naming the repo 4ms
   ✓ extractCloudToolchainScript (1)
     ✓ returns the pinned Node/vale/gh/jq installs from the Claude template, markers stripped 2ms
   ✓ renderCodexNetworkAllowlist (2)
     ✓ lists the same entries as the Cursor doc under the Codex internet-access toggles 3ms
     ✓ marks the *. entries untested on Codex and names the way around a blocked host 1ms
   ✓ network allowlist count note (6)
     ✓ claude: a declared entry bkit already ships is counted once, and the numbers add up 3ms
     ✓ cursor: a declared entry bkit already ships is counted once, and the numbers add up 3ms
     ✓ codex: a declared entry bkit already ships is counted once, and the numbers add up 3ms
     ✓ claude: no overlap note when every declared entry is new 2ms
     ✓ cursor: no overlap note when every declared entry is new 2ms
     ✓ codex: no overlap note when every declared entry is new 2ms
   ✓ codex template generation sentinels (2)
     ✓ carries the sentinels writeCodexCloudDoc substitutes, and no Claude-only ones 1ms
     ✓ states the Codex mechanics: env vars vs network secrets, Personal vault, unproven hooks 1ms
   ✓ writeCodexCloudDoc — end-to-end render (real template) (4)
     ✓ writes a sentinel-free, chmod-600 doc with the resolved env block 5ms
     ✓ inlines the Claude template's toolchain pins and the consumer's corepack pnpm 7ms
     ✓ bakes the consumer's context-fetch provision recipes into the install script 4ms
     ✓ records the repo root before any toolchain step can leave it, and returns there 5ms
   ✓ extractMcpServers / resolveClaudeDerivedAllows (4)
     ✓ returns [] when context.md is absent or declares no mcp-servers block 4ms
     ✓ extracts names verbatim below bkit:end, deduped, comments and examples ignored 3ms
     ✓ an mcp-servers block does not leak into allowed-domains, nor the reverse 2ms
     ✓ derives WebFetch grants, then both Claude MCP tool-id forms per server 6ms
   ✓ writeCursorCliPermissionsArtifact — .cursor/cli.json writer (4)
     ✓ writes one Mcp(<server>:*) allow per declared server 3ms
     ✓ writes an empty allow list when no servers are declared 2ms
     ✓ regenerates over a hand edit, and is a no-op once current 3ms
     ✓ dry-run reports the pending write without touching disk 1ms
   ✓ egress registry — completeness, invariants and the anti-widening gate (9)
     ✓ T1: one opencode-provider row per provider key, ids unique, rows well-formed 1ms
     ✓ T1: every issue tracker but the 'none' sentinel has an mcp row, and 'none' was the only skip 2ms
     ✓ T2: provider rows match their baseURL host, and every host is covered by a base 2ms
     ✓ T3: no base collapses into a public suffix, a shared-tenant apex, or a single label 5ms
     ✓ T3: the gate rejects a fixture row whose base is a shared-tenant apex 1ms
     ✓ T3: every shipped base on a .dev / .app / .run TLD is on the accepted-warn list 2ms
     ✓ T5: deriveEgressEntries is pure over injected rows, sorted and deduped 1ms
     ✓ T5: the shipped exports are a strict superset of the ten hand-typed bases 2ms
     ✓ T7: unallowlistable URLs contribute nothing and none of them throws 3ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/install/cloud-env.test.ts > extractAllowedDomains / expandAllowedDomains / renderCloudNetworkAllowlist > renderCloudNetworkAllowlist names the .bkit/allowlist.json fingerprint and the BKIT_CLOUD_ALLOWLIST_FINGERPRINT step
AssertionError: expected 'Set to **Custom** and tick **Also inc…' to contain 'Allowlist fingerprint `03496757`'

- Expected
+ Received

- Allowlist fingerprint `03496757`
+ Set to **Custom** and tick **Also include default list of common package
+ managers** — this EXTENDS the trusted defaults (package registries, GitHub,
+ cloud SDKs), it does not replace them. Paste into the **Allowed domains** field
+ (one per line):
+
+ ```text
+ 12factor.net
+ *.12factor.net
+ anthropic.com
+ *.anthropic.com
+ atlassian.com
+ *.atlassian.com
+ c4model.com
+ *.c4model.com
+ cabforum.org
+ *.cabforum.org
+ claude.com
+ *.claude.com
+ cursor.com
+ *.cursor.com
+ diataxis.fr
+ *.diataxis.fr
+ dora.dev
+ *.dora.dev
+ endoflife.date
+ *.endoflife.date
+ etsi.org
+ *.etsi.org
+ europa.eu
+ *.europa.eu
+ example.invalid
+ *.example.invalid
+ finops.org
+ *.finops.org
+ github.com
+ *.github.com
+ githubcopilot.com
+ *.githubcopilot.com
+ githubusercontent.com
+ *.githubusercontent.com
+ google.dev
+ *.google.dev
+ ico.org.uk
+ *.ico.org.uk
+ ietf.org
+ *.ietf.org
+ iso.org
+ *.iso.org
+ kanbanguides.org
+ *.kanbanguides.org
+ linear.app
+ *.linear.app
+ mitre.org
+ *.mitre.org
+ modelcontextprotocol.io
+ *.modelcontextprotocol.io
+ models.dev
+ *.models.dev
+ mozilla.org
+ *.mozilla.org
+ nist.gov
+ *.nist.gov
+ nngroup.com
+ *.nngroup.com
+ npmjs.com
+ *.npmjs.com
+ npmjs.org
+ *.npmjs.org
+ ollama.com
+ *.ollama.com
+ openai.com
+ *.openai.com
+ opencode.ai
+ *.opencode.ai
+ openrouter.ai
+ *.openrouter.ai
+ openssf.org
+ *.openssf.org
+ opentelemetry.io
+ *.opentelemetry.io
+ owasp.org
+ *.owasp.org
+ rfc-editor.org
+ *.rfc-editor.org
+ schema.org
+ *.schema.org
+ scrumguides.org
+ *.scrumguides.org
+ skills.sh
+ *.skills.sh
+ slsa.dev
+ *.slsa.dev
+ spdx.org
+ *.spdx.org
+ sre.google
+ *.sre.google
+ tavily.com
+ *.tavily.com
+ w3.org
+ *.w3.org
+ ```
+
+ _94 entries (47 domains, each as apex + `*.` wildcard): 46 from bkit's shipped egress registry and 1 more from `allowed-domains` in `.agents/context.md`. Derived set fingerprint `03496757`._
+
+ Under **Trusted**, your app domains and most observability / API hosts are
+ unreachable, so cloud `/bkit-debug` gets no runtime logs and e2e can't hit your
+ deployment. **Full** works too but opens all egress.

 ❯ .bkit/core/engine/install/cloud-env.test.ts:581:17
    579|     const stamp = egressFingerprint(resolveNetworkAllowlist(tmpDir));
    580|     const out = renderCloudNetworkAllowlist(tmpDir);
    581|     expect(out).toContain("Allowlist fingerprint `" + stamp + "`");
       |                 ^
    582|     expect(out).toContain("BKIT_CLOUD_ALLOWLIST_FINGERPRINT");
    583|     expect(out).toContain("operator");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 101 passed (102)
   Start at  18:38:32
   Duration  1.12s (tests 40%, transform 37%, setup 13%, import 10%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Of15qo/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
````

## Lint output — `tests/shell/bkit-cloud-bootstrap-preflight.bats`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern tests/shell/bkit-cloud-bootstrap-preflight.bats

```

## Runner output — `tests/shell/bkit-cloud-bootstrap-preflight.bats`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs tests/shell/bkit-cloud-bootstrap-preflight.bats

1..22
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 794 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 1195 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 1236 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 898 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 956 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 1206 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 353 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 1361 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 1272 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 1338 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 1420 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 948 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 1033 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 1100 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 4194 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 3710 ms
not ok 17 fingerprint: warns with the refresh steps and exits 0 when BKIT_CLOUD_ALLOWLIST_FINGERPRINT is unset # in 1577 ms
# (in test file tests/shell/bkit-cloud-bootstrap-preflight.bats, line 229)
#   `[[ "$output" == *"WARNING"* ]]' failed
not ok 18 fingerprint: warns naming both fingerprints when they differ, and continues # in 1612 ms
# (in test file tests/shell/bkit-cloud-bootstrap-preflight.bats, line 239)
#   `[[ "$output" == *"WARNING"* ]]' failed
not ok 19 fingerprint: reports a match as operator-asserted with the deployed allowlist unverified # in 1412 ms
# (in test file tests/shell/bkit-cloud-bootstrap-preflight.bats, line 250)
#   `[[ "$output" == *"operator-asserted"* ]]' failed
not ok 20 fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent # in 1322 ms
# (in test file tests/shell/bkit-cloud-bootstrap-preflight.bats, line 259)
#   `[[ "$output" == *"WARNING"* ]]' failed
not ok 21 fingerprint: rejects a value that is not 8 hex characters without echoing it # in 765 ms
# (in test file tests/shell/bkit-cloud-bootstrap-preflight.bats, line 277)
#   `[[ "$output" == *"not an 8-hex fingerprint"* ]]' failed
not ok 22 fingerprint: warns and continues when .bkit/allowlist.json is not valid JSON # in 1027 ms
# (in test file tests/shell/bkit-cloud-bootstrap-preflight.bats, line 286)
#   `[[ "$output" == *"WARNING"* ]]' failed
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/checks/before/files.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/checks/before/files.test.ts

```

## Runner output — `.bkit/core/engine/checks/before/files.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/checks/before/files.test.ts

[test-timeout-budget] load average 22.3 on 10 cores: unit limits 15650ms per test, 31300ms per hook (x3.13)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode

 ❯ .bkit/core/engine/checks/before/files.test.ts (25 tests | 3 failed) 228ms
   ✓ stripBkitBlock (3)
     ✓ removes HTML-comment-style bkit block content 4ms
     ✓ removes slash-comment-style bkit block content 2ms
     ✓ returns content unchanged when no markers present 1ms
   ✓ templates are never drift-checked (2)
     ✓ MARKERED_TEXT_DRIFT_PATHS holds no template path 3ms
     ✓ an adopted .prettierignore, .vale.ini or bkit-ci.yml raises no drift or marker advisory 71ms
   ✓ detectTier2TextDrift — .gitignore (3)
     ✓ flags a .gitignore whose bkit block dropped a template line (the template is named gitignore) 5ms
     ✓ stays quiet on a .gitignore carrying the whole block, with consumer lines outside it 6ms
     ✓ runPreflight reports the drifted .gitignore 86ms
   ✓ detectGitignoreBlockDuplicates (3)
     ✓ flags when .worktrees/ appears outside the bkit block 2ms
     ✓ does NOT flag when bkit lines appear only inside the block 1ms
     ✓ returns null when .gitignore does not exist 8ms
   ✓ detectPlaywrightReporterHostile (7)
     ✓ flags when consumer step runs `playwright test --reporter=line` 4ms
     ✓ does NOT flag when `playwright test` runs without --reporter 2ms
     ✓ does NOT flag when --reporter is set but not to `line` 2ms
     ✓ does NOT flag when --reporter=line is only inside the bkit-managed stub region 1ms
     ✓ returns null when bkit-ci.yml does not exist 1ms
     ✓ does NOT flag when --reporter=line appears without a playwright test invocation 1ms
     ✓ reads the workflow named by bkit.testing.ciWorkflow and names its path 3ms
   ✓ detectOpencodeSubstringFetchGrants (4)
     ✓ reports each substring curl and wget allow with its removal action 3ms
     ✓ ignores webfetch, non-allow and unrelated consumer entries 2ms
     ✓ redacts URL credentials and query strings in a reported key 2ms
     ✓ reports nothing and writes nothing for an absent, unparseable or map-less file 3ms
   ❯ detectCloudBootstrapFingerprintMissing (3)
     × reports an adopted bootstrap that never reads BKIT_CLOUD_ALLOWLIST_FINGERPRINT 7ms
     × accepts a customised bootstrap that reads the variable 5ms
     × stays silent when no bootstrap is adopted 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/before/files.test.ts > detectCloudBootstrapFingerprintMissing > reports an adopted bootstrap that never reads BKIT_CLOUD_ALLOWLIST_FINGERPRINT
TypeError: detectCloudBootstrapFingerprintMissing is not a function
 ❯ .bkit/core/engine/checks/before/files.test.ts:344:15
    342|         "pnpm install --frozen-lockfile\n",
    343|     );
    344|     const f = detectCloudBootstrapFingerprintMissing(tmpDir);
       |               ^
    345|     expect(f).not.toBeNull();
    346|     expect(f?.id).toBe("cloud-bootstrap-fingerprint-missing");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/checks/before/files.test.ts > detectCloudBootstrapFingerprintMissing > accepts a customised bootstrap that reads the variable
TypeError: detectCloudBootstrapFingerprintMissing is not a function
 ❯ .bkit/core/engine/checks/before/files.test.ts:358:12
    356|         'if [ "${BKIT_CLOUD_ALLOWLIST_FINGERPRINT:-}" = "$(my_stamp)" …
    357|     );
    358|     expect(detectCloudBootstrapFingerprintMissing(tmpDir)).toBeNull();
       |            ^
    359|   });
    360|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/checks/before/files.test.ts > detectCloudBootstrapFingerprintMissing > stays silent when no bootstrap is adopted
TypeError: detectCloudBootstrapFingerprintMissing is not a function
 ❯ .bkit/core/engine/checks/before/files.test.ts:363:12
    361|   it("stays silent when no bootstrap is adopted", () => {
    362|     expect(fs.existsSync(path.join(tmpDir, BOOTSTRAP_REL))).toBe(false…
    363|     expect(detectCloudBootstrapFingerprintMissing(tmpDir)).toBeNull();
       |            ^
    364|   });
    365| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 22 passed (25)
   Start at  18:39:16
   Duration  1.09s (transform 36%, tests 32%, setup 22%, import 9%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-tDEG3m/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/install/check.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/install/check.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/install/check.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/install/check.integration.test.ts

[test-timeout-budget] load average 23.2 on 10 cores: unit limits 16101ms per test, 32201ms per hook (x3.22)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode

stdout | .bkit/core/engine/commands/install/check.integration.test.ts > dry-run-parity > check ≡ install writeset parity — claude (cross-module parity, v4-3) > check --claude writeset ≡ install --claude writeset
[bkit-check] [dry-run] Running core payload pass
[bkit-check] [dry-run] core: .agents/context.md
[bkit-check] [dry-run] core: .agents/docs.md
[bkit-check] [dry-run] core: .agents/rules.md
[bkit-check] [dry-run] core: .agents/skills.md
[bkit-check] [dry-run] core: AGENTS.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-accessibility.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-adoption.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-agents.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-aio-seo.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-analytics.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-annotations.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-app-performance.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-app-store.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-architecture.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-ci-performance.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-config.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-cost.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-coverage.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-database.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-dead-code.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-deferrals.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-dependencies.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-issues.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-llm.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-logs.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-models.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-privacy.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-prompts.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-red-team.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-reliability.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-repo.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-security.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-slop.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-testing.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-usability.md
[bkit-check] [dry-run] core: docs/templates/bkit-plan.md
[bkit-check] [dry-run] core: .gitignore
[bkit-check] [dry-run] core: .gitattributes
[bkit-check] [dry-run] Running bkit docs pass
[bkit-check] [dry-run] core: .bkit/authoring.md
[bkit-check] [dry-run] core: .bkit/cloud.md
[bkit-check] [dry-run] core: .bkit/cli.md
[bkit-check] [dry-run] core: .bkit/comparison.md
[bkit-check] [dry-run] core: .bkit/install.md
[bkit-check] [dry-run] core: .bkit/jsonl.md
[bkit-check] [dry-run] core: .bkit/LICENSE.md
[bkit-check] [dry-run] core: .bkit/pipeline.md
[bkit-check] [dry-run] core: .bkit/providers.md
[bkit-check] [dry-run] core: .bkit/prompts.md
[bkit-check] [dry-run] core: .bkit/router.md
[bkit-check] [dry-run] core: .bkit/templates.md
[bkit-check] [dry-run] core: .bkit/trackers.md
[bkit-check] [dry-run] core: .bkit/workflows.md
[bkit-check] [dry-run] core: .bkit/README.md
[bkit-check] [dry-run] Running template copies pass
[bkit-check] [dry-run] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/Dockerfile
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/environment.json
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/settings.json
[bkit-check] [dry-run] template added: .bkit/templates/.envrc
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/dependabot.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/renovate.json5
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-check] [dry-run] template added: .bkit/templates/.graphifyignore
[bkit-check] [dry-run] template added: .bkit/templates/.husky/pre-commit
[bkit-check] [dry-run] template added: .bkit/templates/.husky/pre-push
[bkit-check] [dry-run] template added: .bkit/templates/.oxlintrc.json
[bkit-check] [dry-run] template added: .bkit/templates/.serena/project.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale.ini
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-expo.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-github.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-inngest.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-maestro.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-playwright.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-resend.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-sentry.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-serena.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-stripe.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-supabase.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-tavily.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-vercel.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/architecture.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/capabilities.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/components.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/data-schema.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/deployments.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/design.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/noise.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/observability.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/security.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/setup.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/technology.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/testing.md
[bkit-check] [dry-run] template added: .bkit/templates/lintstagedrc.example.json
[bkit-check] [dry-run] template added: .bkit/templates/prettierignore.example
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-check] [dry-run] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-check] [dry-run] template added: .bkit/templates/slop-scan.config.json
[bkit-check] [dry-run] payload link: .bkit/core
[bkit-check] [dry-run] payload link: .bkit/shared
[bkit-check] [dry-run] core: .bkit/allowlist.json
[bkit-check] [dry-run] write: .claude/commands/bkit-auto.md
[bkit-check] [dry-run] write: .claude/commands/bkit-build.md
[bkit-check] [dry-run] write: .claude/commands/bkit-debug.md
[bkit-check] [dry-run] write: .claude/commands/bkit-design.md
[bkit-check] [dry-run] write: .claude/commands/bkit-plan.md
[bkit-check] [dry-run] write: .claude/commands/bkit-ship.md
[bkit-check] [dry-run] write: .claude/agents/bkit-audit-generate.md
[bkit-check] [dry-run] write: .claude/agents/bkit-build-challenge-1.md
[bkit-check] [dry-run] write: .claude/agents/bkit-build-challenge-2.md
[bkit-check] [dry-run] write: .claude/agents/bkit-build-install-skills.md
[bkit-check] [dry-run] write: .claude/agents/bkit-build-plan-convert.md
[bkit-check] [dry-run] write: .claude/agents/bkit-build-plan-current.md
[bkit-check] [dry-run] write: .claude/agents/bkit-build-plan-gaps-remediate.md
[bkit-check] [dry-run] write: .claude/agents/bkit-build-plan-tasks.md
[bkit-check] [dry-run] write: .claude/agents/bkit-build-plan-tests.md
[bkit-check] [dry-run] write: .claude/agents/bkit-build-plan-verify.md
[bkit-check] [dry-run] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-check] [dry-run] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-check] [dry-run] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-check] [dry-run] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-check] [dry-run] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-check] [dry-run] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-check] [dry-run] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
[bkit-check] [dry-run] write: .claude/agents/bkit-design-brainstorm-ideate-3.md
[bkit-check] [dry-run] write: .claude/agents/bkit-design-generate.md
[bkit-check] [dry-run] write: .claude/agents/bkit-design-organise.md
[bkit-check] [dry-run] write: .claude/agents/bkit-design-review-1.md
[bkit-check] [dry-run] write: .claude/agents/bkit-design-review-2.md
[bkit-check] [dry-run] write: .claude/agents/bkit-design-spike.md
[bkit-check] [dry-run] write: .claude/agents/bkit-design-update.md
[bkit-check] [dry-run] write: .claude/agents/bkit-plan-generate.md
[bkit-check] [dry-run] write: .claude/agents/bkit-plan-review-1.md
[bkit-check] [dry-run] write: .claude/agents/bkit-plan-review-2.md
[bkit-check] [dry-run] write: .claude/agents/bkit-plan-scope-check.md
[bkit-check] [dry-run] write: .claude/agents/bkit-plan-update.md
[bkit-check] [dry-run] write: .claude/agents/bkit-ship-conflict-resolve.md
[bkit-check] [dry-run] write: .claude/agents/bkit-ship-deferred-sweep.md
[bkit-check] [dry-run] write: .claude/agents/bkit-ship-update-docs.md
[bkit-check] [dry-run] write: .claude/agents/bkit-utility-compress-markdown.md
[bkit-check] [dry-run] write: .claude/agents/bkit-utility-update-decisions.md
[bkit-check] [dry-run] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-check] [dry-run] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-check] [dry-run] write: .claude/agents/bkit-utility-update-failures.md
[bkit-check] [dry-run] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-check] [dry-run] write: .claude/agents/bkit-utility-update-roadmap.md
[bkit-check] [dry-run] write: .claude/agents/bkit-utility-update-tracker.md
[bkit-check] [dry-run] claude: CLAUDE.md
[bkit-check] [dry-run] claude: .claude/settings.json
[bkit-check] [dry-run] claude: .claude/hooks/bkit-preflight.sh
[bkit-check] [dry-run] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-check] [dry-run] claude: .claude/hooks/bkit-readguard.cjs
[bkit-check] [dry-run] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-check] [dry-run] claude: .mcp.json
[bkit-check] [dry-run] claude: .bkit/.env.example
[bkit-check] [dry-run] write version pin: .bkit/version (6.1.1)
[bkit-install] Running core payload pass
[bkit-install] core: .agents/context.md
[bkit-install] core: .agents/docs.md
[bkit-install] core: .agents/rules.md
[bkit-install] core: .agents/skills.md
[bkit-install] core: AGENTS.md
[bkit-install] core: docs/templates/bkit-audit-accessibility.md
[bkit-install] core: docs/templates/bkit-audit-adoption.md
[bkit-install] core: docs/templates/bkit-audit-agents.md
[bkit-install] core: docs/templates/bkit-audit-aio-seo.md
[bkit-install] core: docs/templates/bkit-audit-analytics.md
[bkit-install] core: docs/templates/bkit-audit-annotations.md
[bkit-install] core: docs/templates/bkit-audit-app-performance.md
[bkit-install] core: docs/templates/bkit-audit-app-store.md
[bkit-install] core: docs/templates/bkit-audit-architecture.md
[bkit-install] core: docs/templates/bkit-audit-ci-performance.md
[bkit-install] core: docs/templates/bkit-audit-config.md
[bkit-install] core: docs/templates/bkit-audit-cost.md
[bkit-install] core: docs/templates/bkit-audit-coverage.md
[bkit-install] core: docs/templates/bkit-audit-database.md
[bkit-install] core: docs/templates/bkit-audit-dead-code.md
[bkit-install] core: docs/templates/bkit-audit-deferrals.md
[bkit-install] core: docs/templates/bkit-audit-dependencies.md
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
[bkit-install] core: docs/templates/bkit-audit-issues.md
[bkit-install] core: docs/templates/bkit-audit-llm.md
[bkit-install] core: docs/templates/bkit-audit-logs.md
[bkit-install] core: docs/templates/bkit-audit-models.md
[bkit-install] core: docs/templates/bkit-audit-privacy.md
[bkit-install] core: docs/templates/bkit-audit-prompts.md
[bkit-install] core: docs/templates/bkit-audit-red-team.md
[bkit-install] core: docs/templates/bkit-audit-reliability.md
[bkit-install] core: docs/templates/bkit-audit-repo.md
[bkit-install] core: docs/templates/bkit-audit-security.md
[bkit-install] core: docs/templates/bkit-audit-slop.md
[bkit-install] core: docs/templates/bkit-audit-testing.md
[bkit-install] core: docs/templates/bkit-audit-usability.md
[bkit-install] core: docs/templates/bkit-plan.md
[bkit-install] core: .gitignore
[bkit-install] core: .gitattributes
[bkit-install] Running bkit docs pass
[bkit-install] core: .bkit/authoring.md
[bkit-install] core: .bkit/cloud.md
[bkit-install] core: .bkit/cli.md
[bkit-install] core: .bkit/comparison.md
[bkit-install] core: .bkit/install.md
[bkit-install] core: .bkit/jsonl.md
[bkit-install] core: .bkit/LICENSE.md
[bkit-install] core: .bkit/pipeline.md
[bkit-install] core: .bkit/providers.md
[bkit-install] core: .bkit/prompts.md
[bkit-install] core: .bkit/router.md
[bkit-install] core: .bkit/templates.md
[bkit-install] core: .bkit/trackers.md
[bkit-install] core: .bkit/workflows.md
[bkit-install] core: .bkit/README.md
[bkit-install] Running template copies pass
[bkit-install] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-install] template added: .bkit/templates/.cursor/Dockerfile
[bkit-install] template added: .bkit/templates/.cursor/environment.json
[bkit-install] template added: .bkit/templates/.cursor/settings.json
[bkit-install] template added: .bkit/templates/.envrc
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-install] template added: .bkit/templates/.github/dependabot.yml
[bkit-install] template added: .bkit/templates/.github/renovate.json5
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-install] template added: .bkit/templates/.graphifyignore
[bkit-install] template added: .bkit/templates/.husky/pre-commit
[bkit-install] template added: .bkit/templates/.husky/pre-push
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.serena/project.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-install] template added: .bkit/templates/.vale.ini
[bkit-install] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-install] template added: .bkit/templates/context/bkit-expo.md
[bkit-install] template added: .bkit/templates/context/bkit-github.md
[bkit-install] template added: .bkit/templates/context/bkit-inngest.md
[bkit-install] template added: .bkit/templates/context/bkit-maestro.md
[bkit-install] template added: .bkit/templates/context/bkit-playwright.md
[bkit-install] template added: .bkit/templates/context/bkit-resend.md
[bkit-install] template added: .bkit/templates/context/bkit-sentry.md
[bkit-install] template added: .bkit/templates/context/bkit-serena.md
[bkit-install] template added: .bkit/templates/context/bkit-stripe.md
[bkit-install] template added: .bkit/templates/context/bkit-supabase.md
[bkit-install] template added: .bkit/templates/context/bkit-tavily.md
[bkit-install] template added: .bkit/templates/context/bkit-vercel.md
[bkit-install] template added: .bkit/templates/docs/architecture.md
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/docs/components.md
[bkit-install] template added: .bkit/templates/docs/data-schema.md
[bkit-install] template added: .bkit/templates/docs/deployments.md
[bkit-install] template added: .bkit/templates/docs/design.md
[bkit-install] template added: .bkit/templates/docs/noise.md
[bkit-install] template added: .bkit/templates/docs/observability.md
[bkit-install] template added: .bkit/templates/docs/security.md
[bkit-install] template added: .bkit/templates/docs/setup.md
[bkit-install] template added: .bkit/templates/docs/technology.md
[bkit-install] template added: .bkit/templates/docs/testing.md
[bkit-install] template added: .bkit/templates/lintstagedrc.example.json
[bkit-install] template added: .bkit/templates/prettierignore.example
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-install] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-install] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-install] template added: .bkit/templates/slop-scan.config.json
[bkit-install] payload link: .bkit/core
[bkit-install] payload link: .bkit/shared
[bkit-install] core: .bkit/allowlist.json
[bkit-install] write: .claude/commands/bkit-auto.md
[bkit-install] write: .claude/commands/bkit-build.md
[bkit-install] write: .claude/commands/bkit-debug.md
[bkit-install] write: .claude/commands/bkit-design.md
[bkit-install] write: .claude/commands/bkit-plan.md
[bkit-install] write: .claude/commands/bkit-ship.md
[bkit-install] write: .claude/agents/bkit-audit-generate.md
[bkit-install] write: .claude/agents/bkit-build-challenge-1.md
[bkit-install] write: .claude/agents/bkit-build-challenge-2.md
[bkit-install] write: .claude/agents/bkit-build-install-skills.md
[bkit-install] write: .claude/agents/bkit-build-plan-convert.md
[bkit-install] write: .claude/agents/bkit-build-plan-current.md
[bkit-install] write: .claude/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .claude/agents/bkit-build-plan-tasks.md
[bkit-install] write: .claude/agents/bkit-build-plan-tests.md
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .claude/agents/bkit-design-generate.md
[bkit-install] write: .claude/agents/bkit-design-organise.md
[bkit-install] write: .claude/agents/bkit-design-review-1.md
[bkit-install] write: .claude/agents/bkit-design-review-2.md
[bkit-install] write: .claude/agents/bkit-design-spike.md
[bkit-install] write: .claude/agents/bkit-design-update.md
[bkit-install] write: .claude/agents/bkit-plan-generate.md
[bkit-install] write: .claude/agents/bkit-plan-review-1.md
[bkit-install] write: .claude/agents/bkit-plan-review-2.md
[bkit-install] write: .claude/agents/bkit-plan-scope-check.md
[bkit-install] write: .claude/agents/bkit-plan-update.md
[bkit-install] write: .claude/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .claude/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .claude/agents/bkit-ship-update-docs.md
[bkit-install] write: .claude/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .claude/agents/bkit-utility-update-decisions.md
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .claude/agents/bkit-utility-update-tracker.md
[bkit-install] claude: CLAUDE.md
[bkit-install] claude: .claude/settings.json
[bkit-install] claude: .claude/hooks/bkit-preflight.sh
[bkit-install] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-install] claude: .claude/hooks/bkit-readguard.cjs
[bkit-install] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-install] claude: .mcp.json
[bkit-install] claude: .bkit/.env.example
[bkit-install] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write version pin: .bkit/version (6.1.1)

stdout | .bkit/core/engine/commands/install/check.integration.test.ts > dry-run-parity > check ≡ install writeset parity — core (cross-module parity, v4-3) > check --core writeset ≡ install --core writeset
[bkit-check] [dry-run] Running core payload pass
[bkit-check] [dry-run] core: .agents/context.md
[bkit-check] [dry-run] core: .agents/docs.md
[bkit-check] [dry-run] core: .agents/rules.md
[bkit-check] [dry-run] core: .agents/skills.md
[bkit-check] [dry-run] core: AGENTS.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-accessibility.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-adoption.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-agents.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-aio-seo.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-analytics.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-annotations.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-app-performance.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-app-store.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-architecture.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-ci-performance.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-config.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-cost.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-coverage.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-database.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-dead-code.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-deferrals.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-dependencies.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-issues.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-llm.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-logs.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-models.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-privacy.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-prompts.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-red-team.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-reliability.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-repo.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-security.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-slop.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-testing.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-usability.md
[bkit-check] [dry-run] core: docs/templates/bkit-plan.md
[bkit-check] [dry-run] core: .gitignore
[bkit-check] [dry-run] core: .gitattributes
[bkit-check] [dry-run] Running bkit docs pass
[bkit-check] [dry-run] core: .bkit/authoring.md
[bkit-check] [dry-run] core: .bkit/cloud.md
[bkit-check] [dry-run] core: .bkit/cli.md
[bkit-check] [dry-run] core: .bkit/comparison.md
[bkit-check] [dry-run] core: .bkit/install.md
[bkit-check] [dry-run] core: .bkit/jsonl.md
[bkit-check] [dry-run] core: .bkit/LICENSE.md
[bkit-check] [dry-run] core: .bkit/pipeline.md
[bkit-check] [dry-run] core: .bkit/providers.md
[bkit-check] [dry-run] core: .bkit/prompts.md
[bkit-check] [dry-run] core: .bkit/router.md
[bkit-check] [dry-run] core: .bkit/templates.md
[bkit-check] [dry-run] core: .bkit/trackers.md
[bkit-check] [dry-run] core: .bkit/workflows.md
[bkit-check] [dry-run] core: .bkit/README.md
[bkit-check] [dry-run] Running template copies pass
[bkit-check] [dry-run] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/Dockerfile
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/environment.json
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/settings.json
[bkit-check] [dry-run] template added: .bkit/templates/.envrc
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/dependabot.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/renovate.json5
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-check] [dry-run] template added: .bkit/templates/.graphifyignore
[bkit-check] [dry-run] template added: .bkit/templates/.husky/pre-commit
[bkit-check] [dry-run] template added: .bkit/templates/.husky/pre-push
[bkit-check] [dry-run] template added: .bkit/templates/.oxlintrc.json
[bkit-check] [dry-run] template added: .bkit/templates/.serena/project.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale.ini
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-expo.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-github.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-inngest.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-maestro.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-playwright.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-resend.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-sentry.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-serena.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-stripe.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-supabase.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-tavily.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-vercel.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/architecture.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/capabilities.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/components.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/data-schema.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/deployments.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/design.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/noise.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/observability.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/security.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/setup.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/technology.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/testing.md
[bkit-check] [dry-run] template added: .bkit/templates/lintstagedrc.example.json
[bkit-check] [dry-run] template added: .bkit/templates/prettierignore.example
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-check] [dry-run] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-check] [dry-run] template added: .bkit/templates/slop-scan.config.json
[bkit-check] [dry-run] payload link: .bkit/core
[bkit-check] [dry-run] payload link: .bkit/shared
[bkit-check] [dry-run] core: .bkit/allowlist.json
[bkit-check] [dry-run] write version pin: .bkit/version (6.1.1)
[bkit-install] Running core payload pass
[bkit-install] core: .agents/context.md
[bkit-install] core: .agents/docs.md
[bkit-install] core: .agents/rules.md
[bkit-install] core: .agents/skills.md
[bkit-install] core: AGENTS.md
[bkit-install] core: docs/templates/bkit-audit-accessibility.md
[bkit-install] core: docs/templates/bkit-audit-adoption.md
[bkit-install] core: docs/templates/bkit-audit-agents.md
[bkit-install] core: docs/templates/bkit-audit-aio-seo.md
[bkit-install] core: docs/templates/bkit-audit-analytics.md
[bkit-install] core: docs/templates/bkit-audit-annotations.md
[bkit-install] core: docs/templates/bkit-audit-app-performance.md
[bkit-install] core: docs/templates/bkit-audit-app-store.md
[bkit-install] core: docs/templates/bkit-audit-architecture.md
[bkit-install] core: docs/templates/bkit-audit-ci-performance.md
[bkit-install] core: docs/templates/bkit-audit-config.md
[bkit-install] core: docs/templates/bkit-audit-cost.md
[bkit-install] core: docs/templates/bkit-audit-coverage.md
[bkit-install] core: docs/templates/bkit-audit-database.md
[bkit-install] core: docs/templates/bkit-audit-dead-code.md
[bkit-install] core: docs/templates/bkit-audit-deferrals.md
[bkit-install] core: docs/templates/bkit-audit-dependencies.md
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
[bkit-install] core: docs/templates/bkit-audit-issues.md
[bkit-install] core: docs/templates/bkit-audit-llm.md
[bkit-install] core: docs/templates/bkit-audit-logs.md
[bkit-install] core: docs/templates/bkit-audit-models.md
[bkit-install] core: docs/templates/bkit-audit-privacy.md
[bkit-install] core: docs/templates/bkit-audit-prompts.md
[bkit-install] core: docs/templates/bkit-audit-red-team.md
[bkit-install] core: docs/templates/bkit-audit-reliability.md
[bkit-install] core: docs/templates/bkit-audit-repo.md
[bkit-install] core: docs/templates/bkit-audit-security.md
[bkit-install] core: docs/templates/bkit-audit-slop.md
[bkit-install] core: docs/templates/bkit-audit-testing.md
[bkit-install] core: docs/templates/bkit-audit-usability.md
[bkit-install] core: docs/templates/bkit-plan.md
[bkit-install] core: .gitignore
[bkit-install] core: .gitattributes
[bkit-install] Running bkit docs pass
[bkit-install] core: .bkit/authoring.md
[bkit-install] core: .bkit/cloud.md
[bkit-install] core: .bkit/cli.md
[bkit-install] core: .bkit/comparison.md
[bkit-install] core: .bkit/install.md
[bkit-install] core: .bkit/jsonl.md
[bkit-install] core: .bkit/LICENSE.md
[bkit-install] core: .bkit/pipeline.md
[bkit-install] core: .bkit/providers.md
[bkit-install] core: .bkit/prompts.md
[bkit-install] core: .bkit/router.md
[bkit-install] core: .bkit/templates.md
[bkit-install] core: .bkit/trackers.md
[bkit-install] core: .bkit/workflows.md
[bkit-install] core: .bkit/README.md
[bkit-install] Running template copies pass
[bkit-install] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-install] template added: .bkit/templates/.cursor/Dockerfile
[bkit-install] template added: .bkit/templates/.cursor/environment.json
[bkit-install] template added: .bkit/templates/.cursor/settings.json
[bkit-install] template added: .bkit/templates/.envrc
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-install] template added: .bkit/templates/.github/dependabot.yml
[bkit-install] template added: .bkit/templates/.github/renovate.json5
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-install] template added: .bkit/templates/.graphifyignore
[bkit-install] template added: .bkit/templates/.husky/pre-commit
[bkit-install] template added: .bkit/templates/.husky/pre-push
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.serena/project.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-install] template added: .bkit/templates/.vale.ini
[bkit-install] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-install] template added: .bkit/templates/context/bkit-expo.md
[bkit-install] template added: .bkit/templates/context/bkit-github.md
[bkit-install] template added: .bkit/templates/context/bkit-inngest.md
[bkit-install] template added: .bkit/templates/context/bkit-maestro.md
[bkit-install] template added: .bkit/templates/context/bkit-playwright.md
[bkit-install] template added: .bkit/templates/context/bkit-resend.md
[bkit-install] template added: .bkit/templates/context/bkit-sentry.md
[bkit-install] template added: .bkit/templates/context/bkit-serena.md
[bkit-install] template added: .bkit/templates/context/bkit-stripe.md
[bkit-install] template added: .bkit/templates/context/bkit-supabase.md
[bkit-install] template added: .bkit/templates/context/bkit-tavily.md
[bkit-install] template added: .bkit/templates/context/bkit-vercel.md
[bkit-install] template added: .bkit/templates/docs/architecture.md
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/docs/components.md
[bkit-install] template added: .bkit/templates/docs/data-schema.md
[bkit-install] template added: .bkit/templates/docs/deployments.md
[bkit-install] template added: .bkit/templates/docs/design.md
[bkit-install] template added: .bkit/templates/docs/noise.md
[bkit-install] template added: .bkit/templates/docs/observability.md
[bkit-install] template added: .bkit/templates/docs/security.md
[bkit-install] template added: .bkit/templates/docs/setup.md
[bkit-install] template added: .bkit/templates/docs/technology.md
[bkit-install] template added: .bkit/templates/docs/testing.md
[bkit-install] template added: .bkit/templates/lintstagedrc.example.json
[bkit-install] template added: .bkit/templates/prettierignore.example
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-install] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-install] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-install] template added: .bkit/templates/slop-scan.config.json
[bkit-install] payload link: .bkit/core
[bkit-install] payload link: .bkit/shared
[bkit-install] core: .bkit/allowlist.json
[bkit-install] write version pin: .bkit/version (6.1.1)

stdout | .bkit/core/engine/commands/install/check.integration.test.ts > dry-run-parity > check ≡ install writeset parity — cloud=claude (dry-run parity, T1.10) > check --cloud=claude writeset ≡ install --cloud=claude writeset
[bkit-check] [dry-run] Running core payload pass
[bkit-check] [dry-run] core: .agents/context.md
[bkit-check] [dry-run] core: .agents/docs.md
[bkit-check] [dry-run] core: .agents/rules.md
[bkit-check] [dry-run] core: .agents/skills.md
[bkit-check] [dry-run] core: AGENTS.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-accessibility.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-adoption.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-agents.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-aio-seo.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-analytics.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-annotations.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-app-performance.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-app-store.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-architecture.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-ci-performance.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-config.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-cost.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-coverage.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-database.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-dead-code.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-deferrals.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-dependencies.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-issues.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-llm.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-logs.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-models.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-privacy.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-prompts.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-red-team.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-reliability.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-repo.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-security.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-slop.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-testing.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-usability.md
[bkit-check] [dry-run] core: docs/templates/bkit-plan.md
[bkit-check] [dry-run] core: .gitignore
[bkit-check] [dry-run] core: .gitattributes
[bkit-check] [dry-run] Running bkit docs pass
[bkit-check] [dry-run] core: .bkit/authoring.md
[bkit-check] [dry-run] core: .bkit/cloud.md
[bkit-check] [dry-run] core: .bkit/cli.md
[bkit-check] [dry-run] core: .bkit/comparison.md
[bkit-check] [dry-run] core: .bkit/install.md
[bkit-check] [dry-run] core: .bkit/jsonl.md
[bkit-check] [dry-run] core: .bkit/LICENSE.md
[bkit-check] [dry-run] core: .bkit/pipeline.md
[bkit-check] [dry-run] core: .bkit/providers.md
[bkit-check] [dry-run] core: .bkit/prompts.md
[bkit-check] [dry-run] core: .bkit/router.md
[bkit-check] [dry-run] core: .bkit/templates.md
[bkit-check] [dry-run] core: .bkit/trackers.md
[bkit-check] [dry-run] core: .bkit/workflows.md
[bkit-check] [dry-run] core: .bkit/README.md
[bkit-check] [dry-run] Running template copies pass
[bkit-check] [dry-run] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/Dockerfile
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/environment.json
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/settings.json
[bkit-check] [dry-run] template added: .bkit/templates/.envrc
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/dependabot.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/renovate.json5
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-check] [dry-run] template added: .bkit/templates/.graphifyignore
[bkit-check] [dry-run] template added: .bkit/templates/.husky/pre-commit
[bkit-check] [dry-run] template added: .bkit/templates/.husky/pre-push
[bkit-check] [dry-run] template added: .bkit/templates/.oxlintrc.json
[bkit-check] [dry-run] template added: .bkit/templates/.serena/project.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale.ini
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-expo.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-github.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-inngest.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-maestro.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-playwright.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-resend.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-sentry.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-serena.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-stripe.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-supabase.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-tavily.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-vercel.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/architecture.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/capabilities.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/components.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/data-schema.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/deployments.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/design.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/noise.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/observability.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/security.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/setup.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/technology.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/testing.md
[bkit-check] [dry-run] template added: .bkit/templates/lintstagedrc.example.json
[bkit-check] [dry-run] template added: .bkit/templates/prettierignore.example
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-check] [dry-run] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-check] [dry-run] template added: .bkit/templates/slop-scan.config.json
[bkit-check] [dry-run] payload link: .bkit/core
[bkit-check] [dry-run] payload link: .bkit/shared
[bkit-check] [dry-run] core: .bkit/allowlist.json
[bkit-check] [dry-run] write version pin: .bkit/version (6.1.1)
[bkit-install] Running core payload pass
[bkit-install] core: .agents/context.md
[bkit-install] core: .agents/docs.md
[bkit-install] core: .agents/rules.md
[bkit-install] core: .agents/skills.md
[bkit-install] core: AGENTS.md
[bkit-install] core: docs/templates/bkit-audit-accessibility.md
[bkit-install] core: docs/templates/bkit-audit-adoption.md
[bkit-install] core: docs/templates/bkit-audit-agents.md
[bkit-install] core: docs/templates/bkit-audit-aio-seo.md
[bkit-install] core: docs/templates/bkit-audit-analytics.md
[bkit-install] core: docs/templates/bkit-audit-annotations.md
[bkit-install] core: docs/templates/bkit-audit-app-performance.md
[bkit-install] core: docs/templates/bkit-audit-app-store.md
[bkit-install] core: docs/templates/bkit-audit-architecture.md
[bkit-install] core: docs/templates/bkit-audit-ci-performance.md
[bkit-install] core: docs/templates/bkit-audit-config.md
[bkit-install] core: docs/templates/bkit-audit-cost.md
[bkit-install] core: docs/templates/bkit-audit-coverage.md
[bkit-install] core: docs/templates/bkit-audit-database.md
[bkit-install] core: docs/templates/bkit-audit-dead-code.md
[bkit-install] core: docs/templates/bkit-audit-deferrals.md
[bkit-install] core: docs/templates/bkit-audit-dependencies.md
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
[bkit-install] core: docs/templates/bkit-audit-issues.md
[bkit-install] core: docs/templates/bkit-audit-llm.md
[bkit-install] core: docs/templates/bkit-audit-logs.md
[bkit-install] core: docs/templates/bkit-audit-models.md
[bkit-install] core: docs/templates/bkit-audit-privacy.md
[bkit-install] core: docs/templates/bkit-audit-prompts.md
[bkit-install] core: docs/templates/bkit-audit-red-team.md
[bkit-install] core: docs/templates/bkit-audit-reliability.md
[bkit-install] core: docs/templates/bkit-audit-repo.md
[bkit-install] core: docs/templates/bkit-audit-security.md
[bkit-install] core: docs/templates/bkit-audit-slop.md
[bkit-install] core: docs/templates/bkit-audit-testing.md
[bkit-install] core: docs/templates/bkit-audit-usability.md
[bkit-install] core: docs/templates/bkit-plan.md
[bkit-install] core: .gitignore
[bkit-install] core: .gitattributes
[bkit-install] Running bkit docs pass
[bkit-install] core: .bkit/authoring.md
[bkit-install] core: .bkit/cloud.md
[bkit-install] core: .bkit/cli.md
[bkit-install] core: .bkit/comparison.md
[bkit-install] core: .bkit/install.md
[bkit-install] core: .bkit/jsonl.md
[bkit-install] core: .bkit/LICENSE.md
[bkit-install] core: .bkit/pipeline.md
[bkit-install] core: .bkit/providers.md
[bkit-install] core: .bkit/prompts.md
[bkit-install] core: .bkit/router.md
[bkit-install] core: .bkit/templates.md
[bkit-install] core: .bkit/trackers.md
[bkit-install] core: .bkit/workflows.md
[bkit-install] core: .bkit/README.md
[bkit-install] Running template copies pass
[bkit-install] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-install] template added: .bkit/templates/.cursor/Dockerfile
[bkit-install] template added: .bkit/templates/.cursor/environment.json
[bkit-install] template added: .bkit/templates/.cursor/settings.json
[bkit-install] template added: .bkit/templates/.envrc
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-install] template added: .bkit/templates/.github/dependabot.yml
[bkit-install] template added: .bkit/templates/.github/renovate.json5
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-install] template added: .bkit/templates/.graphifyignore
[bkit-install] template added: .bkit/templates/.husky/pre-commit
[bkit-install] template added: .bkit/templates/.husky/pre-push
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.serena/project.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-install] template added: .bkit/templates/.vale.ini
[bkit-install] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-install] template added: .bkit/templates/context/bkit-expo.md
[bkit-install] template added: .bkit/templates/context/bkit-github.md
[bkit-install] template added: .bkit/templates/context/bkit-inngest.md
[bkit-install] template added: .bkit/templates/context/bkit-maestro.md
[bkit-install] template added: .bkit/templates/context/bkit-playwright.md
[bkit-install] template added: .bkit/templates/context/bkit-resend.md
[bkit-install] template added: .bkit/templates/context/bkit-sentry.md
[bkit-install] template added: .bkit/templates/context/bkit-serena.md
[bkit-install] template added: .bkit/templates/context/bkit-stripe.md
[bkit-install] template added: .bkit/templates/context/bkit-supabase.md
[bkit-install] template added: .bkit/templates/context/bkit-tavily.md
[bkit-install] template added: .bkit/templates/context/bkit-vercel.md
[bkit-install] template added: .bkit/templates/docs/architecture.md
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/docs/components.md
[bkit-install] template added: .bkit/templates/docs/data-schema.md
[bkit-install] template added: .bkit/templates/docs/deployments.md
[bkit-install] template added: .bkit/templates/docs/design.md
[bkit-install] template added: .bkit/templates/docs/noise.md
[bkit-install] template added: .bkit/templates/docs/observability.md
[bkit-install] template added: .bkit/templates/docs/security.md
[bkit-install] template added: .bkit/templates/docs/setup.md
[bkit-install] template added: .bkit/templates/docs/technology.md
[bkit-install] template added: .bkit/templates/docs/testing.md
[bkit-install] template added: .bkit/templates/lintstagedrc.example.json
[bkit-install] template added: .bkit/templates/prettierignore.example
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-install] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-install] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-install] template added: .bkit/templates/slop-scan.config.json
[bkit-install] payload link: .bkit/core
[bkit-install] payload link: .bkit/shared
[bkit-install] core: .bkit/allowlist.json
[bkit-install] write version pin: .bkit/version (6.1.1)

stdout | .bkit/core/engine/commands/install/check.integration.test.ts > dry-run-parity > check ≡ install writeset parity — cloud=cursor (dry-run parity, T1.10) > check --cloud=cursor writeset ≡ install --cloud=cursor writeset
[bkit-check] [dry-run] Running core payload pass
[bkit-check] [dry-run] core: .agents/context.md
[bkit-check] [dry-run] core: .agents/docs.md
[bkit-check] [dry-run] core: .agents/rules.md
[bkit-check] [dry-run] core: .agents/skills.md
[bkit-check] [dry-run] core: AGENTS.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-accessibility.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-adoption.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-agents.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-aio-seo.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-analytics.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-annotations.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-app-performance.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-app-store.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-architecture.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-ci-performance.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-config.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-cost.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-coverage.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-database.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-dead-code.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-deferrals.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-dependencies.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-issues.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-llm.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-logs.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-models.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-privacy.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-prompts.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-red-team.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-reliability.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-repo.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-security.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-slop.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-testing.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-usability.md
[bkit-check] [dry-run] core: docs/templates/bkit-plan.md
[bkit-check] [dry-run] core: .gitignore
[bkit-check] [dry-run] core: .gitattributes
[bkit-check] [dry-run] Running bkit docs pass
[bkit-check] [dry-run] core: .bkit/authoring.md
[bkit-check] [dry-run] core: .bkit/cloud.md
[bkit-check] [dry-run] core: .bkit/cli.md
[bkit-check] [dry-run] core: .bkit/comparison.md
[bkit-check] [dry-run] core: .bkit/install.md
[bkit-check] [dry-run] core: .bkit/jsonl.md
[bkit-check] [dry-run] core: .bkit/LICENSE.md
[bkit-check] [dry-run] core: .bkit/pipeline.md
[bkit-check] [dry-run] core: .bkit/providers.md
[bkit-check] [dry-run] core: .bkit/prompts.md
[bkit-check] [dry-run] core: .bkit/router.md
[bkit-check] [dry-run] core: .bkit/templates.md
[bkit-check] [dry-run] core: .bkit/trackers.md
[bkit-check] [dry-run] core: .bkit/workflows.md
[bkit-check] [dry-run] core: .bkit/README.md
[bkit-check] [dry-run] Running template copies pass
[bkit-check] [dry-run] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/Dockerfile
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/environment.json
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/settings.json
[bkit-check] [dry-run] template added: .bkit/templates/.envrc
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/dependabot.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/renovate.json5
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-check] [dry-run] template added: .bkit/templates/.graphifyignore
[bkit-check] [dry-run] template added: .bkit/templates/.husky/pre-commit
[bkit-check] [dry-run] template added: .bkit/templates/.husky/pre-push
[bkit-check] [dry-run] template added: .bkit/templates/.oxlintrc.json
[bkit-check] [dry-run] template added: .bkit/templates/.serena/project.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale.ini
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-expo.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-github.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-inngest.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-maestro.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-playwright.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-resend.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-sentry.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-serena.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-stripe.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-supabase.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-tavily.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-vercel.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/architecture.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/capabilities.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/components.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/data-schema.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/deployments.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/design.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/noise.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/observability.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/security.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/setup.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/technology.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/testing.md
[bkit-check] [dry-run] template added: .bkit/templates/lintstagedrc.example.json
[bkit-check] [dry-run] template added: .bkit/templates/prettierignore.example
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-check] [dry-run] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-check] [dry-run] template added: .bkit/templates/slop-scan.config.json
[bkit-check] [dry-run] payload link: .bkit/core
[bkit-check] [dry-run] payload link: .bkit/shared
[bkit-check] [dry-run] core: .bkit/allowlist.json
[bkit-check] [dry-run] write version pin: .bkit/version (6.1.1)
[bkit-install] Running core payload pass
[bkit-install] core: .agents/context.md
[bkit-install] core: .agents/docs.md
[bkit-install] core: .agents/rules.md
[bkit-install] core: .agents/skills.md
[bkit-install] core: AGENTS.md
[bkit-install] core: docs/templates/bkit-audit-accessibility.md
[bkit-install] core: docs/templates/bkit-audit-adoption.md
[bkit-install] core: docs/templates/bkit-audit-agents.md
[bkit-install] core: docs/templates/bkit-audit-aio-seo.md
[bkit-install] core: docs/templates/bkit-audit-analytics.md
[bkit-install] core: docs/templates/bkit-audit-annotations.md
[bkit-install] core: docs/templates/bkit-audit-app-performance.md
[bkit-install] core: docs/templates/bkit-audit-app-store.md
[bkit-install] core: docs/templates/bkit-audit-architecture.md
[bkit-install] core: docs/templates/bkit-audit-ci-performance.md
[bkit-install] core: docs/templates/bkit-audit-config.md
[bkit-install] core: docs/templates/bkit-audit-cost.md
[bkit-install] core: docs/templates/bkit-audit-coverage.md
[bkit-install] core: docs/templates/bkit-audit-database.md
[bkit-install] core: docs/templates/bkit-audit-dead-code.md
[bkit-install] core: docs/templates/bkit-audit-deferrals.md
[bkit-install] core: docs/templates/bkit-audit-dependencies.md
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
[bkit-install] core: docs/templates/bkit-audit-issues.md
[bkit-install] core: docs/templates/bkit-audit-llm.md
[bkit-install] core: docs/templates/bkit-audit-logs.md
[bkit-install] core: docs/templates/bkit-audit-models.md
[bkit-install] core: docs/templates/bkit-audit-privacy.md
[bkit-install] core: docs/templates/bkit-audit-prompts.md
[bkit-install] core: docs/templates/bkit-audit-red-team.md
[bkit-install] core: docs/templates/bkit-audit-reliability.md
[bkit-install] core: docs/templates/bkit-audit-repo.md
[bkit-install] core: docs/templates/bkit-audit-security.md
[bkit-install] core: docs/templates/bkit-audit-slop.md
[bkit-install] core: docs/templates/bkit-audit-testing.md
[bkit-install] core: docs/templates/bkit-audit-usability.md
[bkit-install] core: docs/templates/bkit-plan.md
[bkit-install] core: .gitignore
[bkit-install] core: .gitattributes
[bkit-install] Running bkit docs pass
[bkit-install] core: .bkit/authoring.md
[bkit-install] core: .bkit/cloud.md
[bkit-install] core: .bkit/cli.md
[bkit-install] core: .bkit/comparison.md
[bkit-install] core: .bkit/install.md
[bkit-install] core: .bkit/jsonl.md
[bkit-install] core: .bkit/LICENSE.md
[bkit-install] core: .bkit/pipeline.md
[bkit-install] core: .bkit/providers.md
[bkit-install] core: .bkit/prompts.md
[bkit-install] core: .bkit/router.md
[bkit-install] core: .bkit/templates.md
[bkit-install] core: .bkit/trackers.md
[bkit-install] core: .bkit/workflows.md
[bkit-install] core: .bkit/README.md
[bkit-install] Running template copies pass
[bkit-install] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-install] template added: .bkit/templates/.cursor/Dockerfile
[bkit-install] template added: .bkit/templates/.cursor/environment.json
[bkit-install] template added: .bkit/templates/.cursor/settings.json
[bkit-install] template added: .bkit/templates/.envrc
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-install] template added: .bkit/templates/.github/dependabot.yml
[bkit-install] template added: .bkit/templates/.github/renovate.json5
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-install] template added: .bkit/templates/.graphifyignore
[bkit-install] template added: .bkit/templates/.husky/pre-commit
[bkit-install] template added: .bkit/templates/.husky/pre-push
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.serena/project.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-install] template added: .bkit/templates/.vale.ini
[bkit-install] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-install] template added: .bkit/templates/context/bkit-expo.md
[bkit-install] template added: .bkit/templates/context/bkit-github.md
[bkit-install] template added: .bkit/templates/context/bkit-inngest.md
[bkit-install] template added: .bkit/templates/context/bkit-maestro.md
[bkit-install] template added: .bkit/templates/context/bkit-playwright.md
[bkit-install] template added: .bkit/templates/context/bkit-resend.md
[bkit-install] template added: .bkit/templates/context/bkit-sentry.md
[bkit-install] template added: .bkit/templates/context/bkit-serena.md
[bkit-install] template added: .bkit/templates/context/bkit-stripe.md
[bkit-install] template added: .bkit/templates/context/bkit-supabase.md
[bkit-install] template added: .bkit/templates/context/bkit-tavily.md
[bkit-install] template added: .bkit/templates/context/bkit-vercel.md
[bkit-install] template added: .bkit/templates/docs/architecture.md
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/docs/components.md
[bkit-install] template added: .bkit/templates/docs/data-schema.md
[bkit-install] template added: .bkit/templates/docs/deployments.md
[bkit-install] template added: .bkit/templates/docs/design.md
[bkit-install] template added: .bkit/templates/docs/noise.md
[bkit-install] template added: .bkit/templates/docs/observability.md
[bkit-install] template added: .bkit/templates/docs/security.md
[bkit-install] template added: .bkit/templates/docs/setup.md
[bkit-install] template added: .bkit/templates/docs/technology.md
[bkit-install] template added: .bkit/templates/docs/testing.md
[bkit-install] template added: .bkit/templates/lintstagedrc.example.json
[bkit-install] template added: .bkit/templates/prettierignore.example
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-install] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-install] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-install] template added: .bkit/templates/slop-scan.config.json
[bkit-install] payload link: .bkit/core
[bkit-install] payload link: .bkit/shared
[bkit-install] core: .bkit/allowlist.json
[bkit-install] write version pin: .bkit/version (6.1.1)

stdout | .bkit/core/engine/commands/install/check.integration.test.ts > dry-run-parity > check ≡ install writeset parity — cloud=opencode (dry-run parity, #245) > check --cloud=opencode writeset ≡ install --cloud=opencode writeset
[bkit-check] [dry-run] Running core payload pass
[bkit-check] [dry-run] core: .agents/context.md
[bkit-check] [dry-run] core: .agents/docs.md
[bkit-check] [dry-run] core: .agents/rules.md
[bkit-check] [dry-run] core: .agents/skills.md
[bkit-check] [dry-run] core: AGENTS.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-accessibility.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-adoption.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-agents.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-aio-seo.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-analytics.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-annotations.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-app-performance.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-app-store.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-architecture.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-ci-performance.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-config.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-cost.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-coverage.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-database.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-dead-code.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-deferrals.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-dependencies.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-issues.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-llm.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-logs.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-models.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-privacy.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-prompts.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-red-team.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-reliability.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-repo.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-security.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-slop.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-testing.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-usability.md
[bkit-check] [dry-run] core: docs/templates/bkit-plan.md
[bkit-check] [dry-run] core: .gitignore
[bkit-check] [dry-run] core: .gitattributes
[bkit-check] [dry-run] Running bkit docs pass
[bkit-check] [dry-run] core: .bkit/authoring.md
[bkit-check] [dry-run] core: .bkit/cloud.md
[bkit-check] [dry-run] core: .bkit/cli.md
[bkit-check] [dry-run] core: .bkit/comparison.md
[bkit-check] [dry-run] core: .bkit/install.md
[bkit-check] [dry-run] core: .bkit/jsonl.md
[bkit-check] [dry-run] core: .bkit/LICENSE.md
[bkit-check] [dry-run] core: .bkit/pipeline.md
[bkit-check] [dry-run] core: .bkit/providers.md
[bkit-check] [dry-run] core: .bkit/prompts.md
[bkit-check] [dry-run] core: .bkit/router.md
[bkit-check] [dry-run] core: .bkit/templates.md
[bkit-check] [dry-run] core: .bkit/trackers.md
[bkit-check] [dry-run] core: .bkit/workflows.md
[bkit-check] [dry-run] core: .bkit/README.md
[bkit-check] [dry-run] Running template copies pass
[bkit-check] [dry-run] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/Dockerfile
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/environment.json
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/settings.json
[bkit-check] [dry-run] template added: .bkit/templates/.envrc
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/dependabot.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/renovate.json5
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-check] [dry-run] template added: .bkit/templates/.graphifyignore
[bkit-check] [dry-run] template added: .bkit/templates/.husky/pre-commit
[bkit-check] [dry-run] template added: .bkit/templates/.husky/pre-push
[bkit-check] [dry-run] template added: .bkit/templates/.oxlintrc.json
[bkit-check] [dry-run] template added: .bkit/templates/.serena/project.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale.ini
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-expo.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-github.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-inngest.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-maestro.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-playwright.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-resend.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-sentry.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-serena.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-stripe.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-supabase.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-tavily.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-vercel.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/architecture.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/capabilities.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/components.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/data-schema.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/deployments.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/design.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/noise.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/observability.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/security.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/setup.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/technology.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/testing.md
[bkit-check] [dry-run] template added: .bkit/templates/lintstagedrc.example.json
[bkit-check] [dry-run] template added: .bkit/templates/prettierignore.example
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-check] [dry-run] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-check] [dry-run] template added: .bkit/templates/slop-scan.config.json
[bkit-check] [dry-run] payload link: .bkit/core
[bkit-check] [dry-run] payload link: .bkit/shared
[bkit-check] [dry-run] core: .bkit/allowlist.json
[bkit-check] [dry-run] write version pin: .bkit/version (6.1.1)
[bkit-install] Running core payload pass
[bkit-install] core: .agents/context.md
[bkit-install] core: .agents/docs.md
[bkit-install] core: .agents/rules.md
[bkit-install] core: .agents/skills.md
[bkit-install] core: AGENTS.md
[bkit-install] core: docs/templates/bkit-audit-accessibility.md
[bkit-install] core: docs/templates/bkit-audit-adoption.md
[bkit-install] core: docs/templates/bkit-audit-agents.md
[bkit-install] core: docs/templates/bkit-audit-aio-seo.md
[bkit-install] core: docs/templates/bkit-audit-analytics.md
[bkit-install] core: docs/templates/bkit-audit-annotations.md
[bkit-install] core: docs/templates/bkit-audit-app-performance.md
[bkit-install] core: docs/templates/bkit-audit-app-store.md
[bkit-install] core: docs/templates/bkit-audit-architecture.md
[bkit-install] core: docs/templates/bkit-audit-ci-performance.md
[bkit-install] core: docs/templates/bkit-audit-config.md
[bkit-install] core: docs/templates/bkit-audit-cost.md
[bkit-install] core: docs/templates/bkit-audit-coverage.md
[bkit-install] core: docs/templates/bkit-audit-database.md
[bkit-install] core: docs/templates/bkit-audit-dead-code.md
[bkit-install] core: docs/templates/bkit-audit-deferrals.md
[bkit-install] core: docs/templates/bkit-audit-dependencies.md
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
[bkit-install] core: docs/templates/bkit-audit-issues.md
[bkit-install] core: docs/templates/bkit-audit-llm.md
[bkit-install] core: docs/templates/bkit-audit-logs.md
[bkit-install] core: docs/templates/bkit-audit-models.md
[bkit-install] core: docs/templates/bkit-audit-privacy.md
[bkit-install] core: docs/templates/bkit-audit-prompts.md
[bkit-install] core: docs/templates/bkit-audit-red-team.md
[bkit-install] core: docs/templates/bkit-audit-reliability.md
[bkit-install] core: docs/templates/bkit-audit-repo.md
[bkit-install] core: docs/templates/bkit-audit-security.md
[bkit-install] core: docs/templates/bkit-audit-slop.md
[bkit-install] core: docs/templates/bkit-audit-testing.md
[bkit-install] core: docs/templates/bkit-audit-usability.md
[bkit-install] core: docs/templates/bkit-plan.md
[bkit-install] core: .gitignore
[bkit-install] core: .gitattributes
[bkit-install] Running bkit docs pass
[bkit-install] core: .bkit/authoring.md
[bkit-install] core: .bkit/cloud.md
[bkit-install] core: .bkit/cli.md
[bkit-install] core: .bkit/comparison.md
[bkit-install] core: .bkit/install.md
[bkit-install] core: .bkit/jsonl.md
[bkit-install] core: .bkit/LICENSE.md
[bkit-install] core: .bkit/pipeline.md
[bkit-install] core: .bkit/providers.md
[bkit-install] core: .bkit/prompts.md
[bkit-install] core: .bkit/router.md
[bkit-install] core: .bkit/templates.md
[bkit-install] core: .bkit/trackers.md
[bkit-install] core: .bkit/workflows.md
[bkit-install] core: .bkit/README.md
[bkit-install] Running template copies pass
[bkit-install] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-install] template added: .bkit/templates/.cursor/Dockerfile
[bkit-install] template added: .bkit/templates/.cursor/environment.json
[bkit-install] template added: .bkit/templates/.cursor/settings.json
[bkit-install] template added: .bkit/templates/.envrc
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-install] template added: .bkit/templates/.github/dependabot.yml
[bkit-install] template added: .bkit/templates/.github/renovate.json5
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-install] template added: .bkit/templates/.graphifyignore
[bkit-install] template added: .bkit/templates/.husky/pre-commit
[bkit-install] template added: .bkit/templates/.husky/pre-push
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.serena/project.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-install] template added: .bkit/templates/.vale.ini
[bkit-install] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-install] template added: .bkit/templates/context/bkit-expo.md
[bkit-install] template added: .bkit/templates/context/bkit-github.md
[bkit-install] template added: .bkit/templates/context/bkit-inngest.md
[bkit-install] template added: .bkit/templates/context/bkit-maestro.md
[bkit-install] template added: .bkit/templates/context/bkit-playwright.md
[bkit-install] template added: .bkit/templates/context/bkit-resend.md
[bkit-install] template added: .bkit/templates/context/bkit-sentry.md
[bkit-install] template added: .bkit/templates/context/bkit-serena.md
[bkit-install] template added: .bkit/templates/context/bkit-stripe.md
[bkit-install] template added: .bkit/templates/context/bkit-supabase.md
[bkit-install] template added: .bkit/templates/context/bkit-tavily.md
[bkit-install] template added: .bkit/templates/context/bkit-vercel.md
[bkit-install] template added: .bkit/templates/docs/architecture.md
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/docs/components.md
[bkit-install] template added: .bkit/templates/docs/data-schema.md
[bkit-install] template added: .bkit/templates/docs/deployments.md
[bkit-install] template added: .bkit/templates/docs/design.md
[bkit-install] template added: .bkit/templates/docs/noise.md
[bkit-install] template added: .bkit/templates/docs/observability.md
[bkit-install] template added: .bkit/templates/docs/security.md
[bkit-install] template added: .bkit/templates/docs/setup.md
[bkit-install] template added: .bkit/templates/docs/technology.md
[bkit-install] template added: .bkit/templates/docs/testing.md
[bkit-install] template added: .bkit/templates/lintstagedrc.example.json
[bkit-install] template added: .bkit/templates/prettierignore.example
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-install] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-install] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-install] template added: .bkit/templates/slop-scan.config.json
[bkit-install] payload link: .bkit/core
[bkit-install] payload link: .bkit/shared
[bkit-install] core: .bkit/allowlist.json
[bkit-install] write version pin: .bkit/version (6.1.1)

stdout | .bkit/core/engine/commands/install/check.integration.test.ts > dry-run-parity > check ≡ install writeset parity — --opencode=opencode-go (Task 2.2) > check --opencode writeset ≡ install --opencode writeset (tier-writer path-set equality)
[bkit-check] [dry-run] write: .opencode/agents/bkit-audit-generate.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-build-challenge-1.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-build-challenge-2.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-build-install-skills.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-build-plan-convert.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-build-plan-current.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-build-plan-gaps-remediate.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-build-plan-tasks.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-build-plan-tests.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-brainstorm-ideate-3.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-generate.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-organise.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-review-1.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-review-2.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-spike.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-update.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-plan-generate.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-plan-review-1.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-plan-review-2.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-plan-scope-check.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-plan-update.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-ship-conflict-resolve.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-ship-deferred-sweep.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-ship-update-docs.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-compress-markdown.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-decisions.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-roadmap.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-tracker.md
[bkit-check] [dry-run] write: .opencode/commands/bkit-auto.md
[bkit-check] [dry-run] write: .opencode/commands/bkit-build.md
[bkit-check] [dry-run] write: .opencode/commands/bkit-debug.md
[bkit-check] [dry-run] write: .opencode/commands/bkit-design.md
[bkit-check] [dry-run] write: .opencode/commands/bkit-plan.md
[bkit-check] [dry-run] write: .opencode/commands/bkit-ship.md
[bkit-check] [dry-run] opencode: .opencode/opencode.json
[bkit-check] [dry-run] opencode: .opencode/plugin/bkit-gateguard.js
[bkit-check] [dry-run] opencode: .opencode/plugin/bkit-readguard.js
[bkit-check] [dry-run] opencode: .opencode/plugin/bkit-rules.js
[bkit-install] write: .opencode/agents/bkit-audit-generate.md
[bkit-install] write: .opencode/agents/bkit-build-challenge-1.md
[bkit-install] write: .opencode/agents/bkit-build-challenge-2.md
[bkit-install] write: .opencode/agents/bkit-build-install-skills.md
[bkit-install] write: .opencode/agents/bkit-build-plan-convert.md
[bkit-install] write: .opencode/agents/bkit-build-plan-current.md
[bkit-install] write: .opencode/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .opencode/agents/bkit-build-plan-tasks.md
[bkit-install] write: .opencode/agents/bkit-build-plan-tests.md
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .opencode/agents/bkit-design-generate.md
[bkit-install] write: .opencode/agents/bkit-design-organise.md
[bkit-install] write: .opencode/agents/bkit-design-review-1.md
[bkit-install] write: .opencode/agents/bkit-design-review-2.md
[bkit-install] write: .opencode/agents/bkit-design-spike.md
[bkit-install] write: .opencode/agents/bkit-design-update.md
[bkit-install] write: .opencode/agents/bkit-plan-generate.md
[bkit-install] write: .opencode/agents/bkit-plan-review-1.md
[bkit-install] write: .opencode/agents/bkit-plan-review-2.md
[bkit-install] write: .opencode/agents/bkit-plan-scope-check.md
[bkit-install] write: .opencode/agents/bkit-plan-update.md
[bkit-install] write: .opencode/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .opencode/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .opencode/agents/bkit-ship-update-docs.md
[bkit-install] write: .opencode/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .opencode/agents/bkit-utility-update-decisions.md
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .opencode/agents/bkit-utility-update-tracker.md
[bkit-install] write: .opencode/commands/bkit-auto.md
[bkit-install] write: .opencode/commands/bkit-build.md
[bkit-install] write: .opencode/commands/bkit-debug.md
[bkit-install] write: .opencode/commands/bkit-design.md
[bkit-install] write: .opencode/commands/bkit-plan.md
[bkit-install] write: .opencode/commands/bkit-ship.md
[bkit-install] opencode: .opencode/opencode.json
[bkit-install] opencode: .opencode/plugin/bkit-gateguard.js
[bkit-install] opencode: .opencode/plugin/bkit-readguard.js
[bkit-install] opencode: .opencode/plugin/bkit-rules.js

 ❯ .bkit/core/engine/commands/install/check.integration.test.ts (34 tests | 1 failed) 45944ms
   ✓ #255 #8 — bkit check gates opencode drift (no false positives) (12)
     ✓ clean install (openrouter + github) → check exits 0, zero would-write drift 5677ms
     ✓ clean install (openrouter + linear) → check exits 0, zero would-write drift 3994ms
     ✓ clean install (openrouter + jira) → check exits 0, zero would-write drift 4418ms
     ✓ clean install (opencode-go gateway, opencode-go block keyed by provider) → check exits 0, no false drift 3778ms
     ✓ clean install (ollama, no tracker) → check exits 0, no false drift 2392ms
     ✓ dropped permission block in opencode.json → check exits 1 (drift detected) 1610ms
     ✓ tampered gateguard.js INSIDE the managed block → check exits 1 (drift detected) 1449ms
     ✓ tampered gateguard.js OUTSIDE the managed block → check exits 0 (consumer-owned) 1641ms
     ✓ tampered agent mirror content → check exits 1 (writeset drift) 1695ms
     ✓ consumer-added extra key in opencode.json → check exits 0 (deep-contain, not drift) 1578ms
     ✓ opencode installed but no provider recorded → check exits 1 and names the fix 1344ms
     ✓ a consumer with no opencode host at all is not failed for a missing provider 2175ms
   ✓ bkit check — antigravity detected from any plugin file (1)
     ✓ deleted plugin.json + neutered guardrails command + deleted guardrails hook → check exits 1 naming each 3602ms
   ✓ check-owned-hooks (11)
     ✓ findMissingOwnedHooks (5)
       ✓ requires the hook files of each installed host, and only those 4ms
       ✓ a host that is not installed is not required 2ms
       ✓ present files are not reported 3ms
       ✓ never requires bkit-cloud-bootstrap.sh — it is a copy-and-own template 3ms
       ✓ detectOwnedHookMissing is a blocker naming every missing file, null when none 2ms
     ✓ bkit check — exit code on a missing owned hook (6)
       ✓ clean install → check exits 0 874ms
       ✓ missing .claude/hooks/bkit-guardrails.cjs → check exits 1 and names it 855ms
       ✓ missing .cursor/hooks/bkit-gateguard.cjs → check exits 1 and names it 901ms
       ✓ missing .codex/hooks/bkit-guardrails.cjs → check exits 1 and names it 870ms
       ✓ missing .opencode/plugin/bkit-gateguard.js → check exits 1 and names it 864ms
       ✓ claude host without the cloud module → no bkit-cloud-bootstrap.sh required 1633ms
   ✓ dry-run-parity (6)
     ✓ check ≡ install writeset parity — claude (cross-module parity, v4-3) (1)
       ✓ check --claude writeset ≡ install --claude writeset 249ms
     ✓ check ≡ install writeset parity — core (cross-module parity, v4-3) (1)
       ✓ check --core writeset ≡ install --core writeset 137ms
     ✓ check ≡ install writeset parity — cloud=claude (dry-run parity, T1.10) (1)
       ✓ check --cloud=claude writeset ≡ install --cloud=claude writeset 153ms
     ✓ check ≡ install writeset parity — cloud=cursor (dry-run parity, T1.10) (1)
       ✓ check --cloud=cursor writeset ≡ install --cloud=cursor writeset 162ms
     ✓ check ≡ install writeset parity — cloud=opencode (dry-run parity, #245) (1)
       ✓ check --cloud=opencode writeset ≡ install --cloud=opencode writeset 171ms
     ✓ check ≡ install writeset parity — --opencode=opencode-go (Task 2.2) (1)
       ✓ check --opencode writeset ≡ install --opencode writeset (tier-writer path-set equality) 83ms
   ✓ Scenario 4 — stale consumer prompts.md tolerated on upgrade (1)
     ✓ bkit check with stale consumer prompts.md does not emit Missing model lookup 650ms
   ✓ Scenario: bkit check stale-marker gate is branch-scoped (#256) (2)
     ✓ on main: hard-fails (exit 1) and names the bkit-managed-stale BLOCKER 735ms
     ✓ on a feature branch: surfaces a non-blocking ADVISORY, no marker-drift hard-fail line 631ms
   ❯ cloud bootstrap fingerprint compare — adoption signal (1)
     × bkit check reports a stale adopted cloud bootstrap with the template block to copy 594ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/install/check.integration.test.ts > cloud bootstrap fingerprint compare — adoption signal > bkit check reports a stale adopted cloud bootstrap with the template block to copy
AssertionError: [bkit-check] Running in check (dry-run) mode
[bkit-check] [dry-run] Running core payload pass
[bkit-check] [dry-run] core: .agents/context.md
[bkit-check] [dry-run] core: .agents/docs.md
[bkit-check] [dry-run] core: .agents/rules.md
[bkit-check] [dry-run] core: .agents/skills.md
[bkit-check] [dry-run] core: AGENTS.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-accessibility.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-adoption.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-agents.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-aio-seo.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-analytics.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-annotations.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-app-performance.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-app-store.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-architecture.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-ci-performance.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-config.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-cost.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-coverage.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-database.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-dead-code.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-deferrals.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-dependencies.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-issues.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-llm.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-logs.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-models.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-privacy.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-prompts.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-red-team.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-reliability.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-repo.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-security.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-slop.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-testing.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-usability.md
[bkit-check] [dry-run] core: docs/templates/bkit-plan.md
[bkit-check] [dry-run] core: .gitignore
[bkit-check] [dry-run] core: .gitattributes
[bkit-check] [dry-run] Running bkit docs pass
[bkit-check] [dry-run] core: .bkit/authoring.md
[bkit-check] [dry-run] core: .bkit/cloud.md
[bkit-check] [dry-run] core: .bkit/cli.md
[bkit-check] [dry-run] core: .bkit/comparison.md
[bkit-check] [dry-run] core: .bkit/install.md
[bkit-check] [dry-run] core: .bkit/jsonl.md
[bkit-check] [dry-run] core: .bkit/LICENSE.md
[bkit-check] [dry-run] core: .bkit/pipeline.md
[bkit-check] [dry-run] core: .bkit/providers.md
[bkit-check] [dry-run] core: .bkit/prompts.md
[bkit-check] [dry-run] core: .bkit/router.md
[bkit-check] [dry-run] core: .bkit/templates.md
[bkit-check] [dry-run] core: .bkit/trackers.md
[bkit-check] [dry-run] core: .bkit/workflows.md
[bkit-check] [dry-run] core: .bkit/README.md
[bkit-check] [dry-run] Running template copies pass
[bkit-check] [dry-run] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/Dockerfile
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/environment.json
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/settings.json
[bkit-check] [dry-run] template added: .bkit/templates/.envrc
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/dependabot.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/renovate.json5
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-check] [dry-run] template added: .bkit/templates/.graphifyignore
[bkit-check] [dry-run] template added: .bkit/templates/.husky/pre-commit
[bkit-check] [dry-run] template added: .bkit/templates/.husky/pre-push
[bkit-check] [dry-run] template added: .bkit/templates/.oxlintrc.json
[bkit-check] [dry-run] template added: .bkit/templates/.serena/project.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale.ini
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-expo.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-github.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-inngest.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-maestro.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-playwright.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-resend.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-sentry.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-serena.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-stripe.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-supabase.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-tavily.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-vercel.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/architecture.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/capabilities.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/components.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/data-schema.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/deployments.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/design.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/noise.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/observability.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/security.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/setup.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/technology.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/testing.md
[bkit-check] [dry-run] template added: .bkit/templates/lintstagedrc.example.json
[bkit-check] [dry-run] template added: .bkit/templates/prettierignore.example
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-check] [dry-run] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-check] [dry-run] template added: .bkit/templates/slop-scan.config.json
[bkit-check] [dry-run] payload link: .bkit/core
[bkit-check] [dry-run] payload link: .bkit/shared
[bkit-check] [dry-run] core: .bkit/allowlist.json
[bkit-check] [dry-run] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-check] [dry-run] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-check] [dry-run] write version pin: .bkit/version (6.1.1)
[bkit-check] 153 write(s) would occur.
[bkit] What's new in v6.1.1: [6.1.1] — 2026-11-04
Fixed, Upgrade Notes

==========================================================
bkit advisories
==========================================================

9 finding(s) — 0 blocker, 9 advisory.

INSTRUCTIONS FOR AN AI AGENT — copy this file (or specific items) into a coding assistant to apply each item. Each ACTION is self-contained.

--- 1/9 [advisory] gate-missing-called-scripts ---
Detect: The bkit:gate scripts call scripts package.json does not declare: `bkit:lint:prose`, `bkit:slop:delta`, `build`, `format:check`, `lint`, `test`, `typecheck`.
Action: Every bkit workflow runs a `bkit:gate*` script, so a missing link fails the whole gate. Add `bkit:lint:prose`, `bkit:slop:delta`, `build`, `format:check`, `lint`, `test`, `typecheck` to package.json (`.bkit/templates.md` lists the tool scripts and the devDeps they need), or edit the `bkit:gate*` scripts to drop what this repo does not have.

Gate contents (`.bkit/workflows.md` § Local gate scripts): every gate but `bkit:gate:static-unit-integration-e2e` and `bkit:gate:static-unit-integration-e2e-live` runs on a push or inside `/bkit-build`, so it MUST NOT run tests that need a deployed boundary or remote service; local services (a database in Docker) are fine.

--- 2/9 [advisory] test-file-script-missing ---
Detect: package.json does not declare `bkit:test:file`, so `/bkit-build` cannot check that each task's tests fail before its code is written.
Action: Add `bkit:test:file` to package.json: it runs the ONE test file bkit appends as its argument (repo-relative path) and writes a JUnit report to the path in `$BKIT_TEST_REPORT`. Vitest example:

    "bkit:test:file": "vitest run --reporter=default --reporter=junit --outputFile.junit=\"$BKIT_TEST_REPORT\""

jest reads a bare path as a regex, so a folder such as `(tabs)` matches no file: pass `--runTestsByPath`. Call the runner directly, not through a task runner that caches results or runs dependent packages first. A monorepo routes the path to the package and config that own it.

--- 3/9 [advisory] gate-changed-script-missing ---
Detect: package.json does not declare `bkit:gate:changed`, so `/bkit-build` and `/bkit-debug` agents run a whole gate (`bkit:gate:static` or `bkit:gate:static-unit`) after every change instead of checking only what changed.
Action: Add `bkit:gate:changed` to package.json. `bkit tests changed` calls it with the changed files as its arguments (repo-relative paths: uncommitted, untracked and committed since the step began; deleted files left out) and never with none. It runs the tests that import those files, the tests that name their paths, and the static checks (lint, format, typecheck) on those files, exiting 0 when clean. Vitest + ESLint example, with `scripts/gate-changed.sh` holding `vitest related --run "$@" && eslint --max-warnings=0 --no-error-on-unmatched-pattern "$@" && prettier --check --ignore-unknown "$@"`:

    "bkit:gate:changed": "sh scripts/gate-changed.sh"

`vitest related` finds only importers; also run the tests that read a changed file by its path (a text search of the test files for each path). The orchestrator's group gate, pre-push and CI still run the whole gates. To keep the whole gate on every change, add `gate-changed-script-missing` to `bkit.advisories.ignore` in package.json.

Gate contents (`.bkit/workflows.md` § Local gate scripts): every gate but `bkit:gate:static-unit-integration-e2e` and `bkit:gate:static-unit-integration-e2e-live` runs on a push or inside `/bkit-build`, so it MUST NOT run tests that need a deployed boundary or remote service; local services (a database in Docker) are fine.

--- 4/9 [advisory] first-install-postinstall-steps ---
Detect: First install detected (.bkit/version was absent).
Action: Post-install steps:

1. Run `pnpm install` to refresh the lockfile, then commit.

2. See `.bkit/install.md` for consumer setup and `.bkit/README.md` for ongoing ops.

Note: bkit seeded the bkit:gate:* / bkit:deps:* package.json scripts every workflow
runs (existing values are never touched). The tool scripts they chain (typecheck,
lint, format:check, bkit:lint:prose, bkit:slop:delta) and the devDeps those need are yours to
add: see .bkit/templates.md.

--- 5/9 [advisory] tracker-setup-none ---
Detect: bkit tracker is not configured (`bkit.tracker.default` absent). Workflows run but every tracker call is a no-op.
Action: Optional post-install decision. Run `bkit install --tracker=github` (recommended), `--tracker=linear` or `--tracker=jira` to enable tracker integration. GitHub tracker requires `BKIT_GH_TOKEN` in `.bkit/.env` (fine-grained PAT for one owner, classic PAT across owners). Linear tracker requires `BKIT_LINEAR_API_KEY` in `.bkit/.env`. Jira tracker requires `BKIT_JIRA_API_KEY` in `.bkit/.env` and `bkit.tracker.jira` in package.json. To opt out and silence this advisory, set `bkit.tracker.default` to `"none"` in package.json.

--- 6/9 [advisory] cloud-secrets-three-locations ---
Detect: The secrets bkit's cloud integration uses must also be set in each cloud location you use. Bkit cannot verify dashboard state — surface the checklist so you don't ship a half-configured cloud setup.
Action: Set each secret in the required locations:

1. **Claude Code (web)**: open `https://claude.ai/code` → environment selector → your environment → **Environment variables**. Paste the block from `.claude/bkit-cloud.md` (gitignored), which also carries the setup script and network list. Claude reads both from the dashboard, NOT from the repo, so changes here do not require a commit.

**Context-fetch (`/bkit-debug` in the cloud):** if you run the debug workflow in these cloud agents, the observability creds your `.agents/context.md` context-fetch blocks use (e.g. `VERCEL_TOKEN`, `SUPABASE_ACCESS_TOKEN`) must ALSO be set in the same dashboards above — non-interactively, since headless agents cannot `vercel login`. These are operator/observability READ creds, not app-runtime secrets. Commit the non-secret selectors (team scope / project ref / `--environment`) in your copied block so they need no dashboard entry. The CLIs those blocks call install automatically in the cloud from each block's `context-fetch:provision` sibling — no manual setup.

Same VALUE in all places.

--- 7/9 [advisory] project-docs-index-missing ---
Detect: .agents/docs.md is absent, so agents have no list of the project's own documents to consult.
Action: Run `bkit install` to write .agents/docs.md, then add a row under `## Project Documents` for each project document you keep. Until then agents warn and fall back to repository evidence.

--- 8/9 [advisory] project-docs-missing ---
Detect: No project document covers: docs/architecture.md, docs/technology.md, docs/security.md, docs/data-schema.md, docs/testing.md, docs/deployments.md, docs/observability.md, docs/design.md, docs/noise.md, docs/setup.md.
Action: Copy the starter for each topic you want from `.bkit/templates/docs/` into `docs/`, fill it in from the repository, and add its row to `## Project Documents` in .agents/docs.md. A document you already keep elsewhere counts: index it with `Equivalent to <recommended path>` in its Scope cell. Skip topics that do not apply.

--- 9/9 [advisory] vale-package-not-synced ---
Detect: vale is on PATH but the repo has no .vale.ini and .vale/styles/write-good/ is absent — prose linting does not run.
Action: Adopt bkit's Vale template first: copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/Bkit/*.yml to .vale/styles/Bkit/. Then run `vale sync` (one-time per repo) to download the write-good package the copied .vale.ini names. `vale sync` reads its package list from .vale.ini, so it cannot fetch write-good before that file exists.

--- Setup tips ---
Things not set up yet, most useful first. For the person: each tip says what goes wrong today and a sentence to ask your agent. For an AI agent: follow each tip's Agent steps unless the person declines it. Silence a tip by adding its id to `bkit.advisories.ignore` in package.json; `bkit-upgrade` cannot be silenced. Full template catalogue: .bkit/templates.md.

1. Connect an issue tracker (tracker)
   bkit isn't connected to an issue tracker, so it can't read the task it's working on or record what it did. Connect GitHub, Linear or Jira, or switch this tip off if you don't want one.
   Why: Every workflow starts by reading the issue it's working on and reports progress back to it as it goes. Without a tracker, you have to paste in what the agent should look at each time, and nothing records what changed or why.
   Ask your agent: "Connect bkit to GitHub Issues: re-run `bkit install` with the tool flags I use plus `--tracker=github` (it records `bkit.tracker.default` in package.json and adds the tracker server to .mcp.json). If I don't want a tracker, set `"issueTracker": "none"` under `bkit` in package.json instead."
   Agent steps: `.bkit/install.md` § Optional post-install decisions. Opt out: `"bkit": { "tracker": { "default": "none" } }` in `package.json`.

2. Let agents look code up directly (serena)
   Agents are finding code by searching for words, which is slower, costs more, and misses things. Set up Serena so they can look code up directly.
   Why: Serena lets agents look up code the way your editor does ("where is this defined, and what uses it?") instead of guessing from text search and reading whole files. That means fewer accidental changes, fewer rounds of you correcting them, and lower running costs because they read less. It can only look things up, never change your files.
   Ask your agent: "Run `brew install uv` and `uv tool install -p 3.13 serena-agent`, copy .bkit/templates/.serena/project.yml to .serena/project.yml and .bkit/templates/scripts/serena/ to scripts/serena/, then add the `serena` server from scripts/serena/bkit-serena.mcp.json to .mcp.json (details: .bkit/templates.md § Serena)."
   Agent steps: `.bkit/templates.md` § Serena.

3. Automatic checks on every change (ci-workflow)
   Nothing checks your changes automatically before they're merged, so broken code can land unnoticed. Add bkit's check workflow.
   Why: This runs your tests and checks on GitHub every time something changes, and bkit's ship step waits for it to pass before merging. Without it, "shipped" only means "merged", not "checked".
   Ask your agent: "Copy .bkit/templates/.github/workflows/bkit-ci.yml to .github/workflows/<the file package.json `bkit.testing.ciWorkflow` names; default bkit-ci.yml>, replace `main` and `{{NODE_VERSION}}` in it with my default branch and Node major version, and add the `typecheck`, `lint`, `format:check`, `bkit:lint:prose`, `bkit:slop:delta` and `test` scripts to package.json as listed in .bkit/templates.md § Gate tool scripts."
   Agent steps: `.bkit/templates.md` § CI workflow and § Gate tool scripts.

4. Catch problems before they leave your machine (husky)
   Mistakes are only caught after changes reach GitHub. Add the local checks so they're caught the moment a change is saved to git.
   Why: These run the same checks on your own computer, in seconds, whenever a change is committed or pushed. Without them you find out minutes later from a failed build, after the agent has moved on and fixing it costs more.
   Ask your agent: "Run `pnpm add -D husky`, add `"prepare": "husky"` to the package.json scripts, copy .bkit/templates/.husky/pre-commit and .bkit/templates/.husky/pre-push to .husky/, and run `chmod +x .husky/pre-commit .husky/pre-push`."
   Agent steps: `.bkit/templates.md` § Git hooks.

5. Consistent formatting (prettier)
   There's no shared formatting setup, so reviews fill up with spacing changes that hide the real ones. Add Prettier with bkit's ignore file.
   Why: Prettier (a code formatter) makes every file follow the same layout. bkit's ignore file stops it reformatting bkit's own files, which would otherwise show up as false changes every time bkit updates.
   Ask your agent: "Copy .bkit/templates/prettierignore.example to .prettierignore first, then run `pnpm add -D prettier` and add `"format:check": "prettier --check ."` to the package.json scripts."
   Agent steps: `.bkit/templates.md` § Prettier.

6. Catch junk code (slop-scan)
   Nothing catches the junk code AI tends to write. Add slop-scan so new junk gets flagged before it's merged.
   Why: Filler and dead code look fine when you skim a change, so they pile up unnoticed until the codebase is hard to trust. slop-scan flags only new problems, so it won't bury you in old ones.
   Ask your agent: "Run `pnpm add -D slop-scan`, copy .bkit/templates/slop-scan.config.json to slop-scan.config.json and .bkit/templates/scripts/slop/ to scripts/slop/, and add `"lint:slop": "slop-scan scan ."` and `"bkit:slop:delta": "bkit ci slop"` to the package.json scripts."
   Agent steps: `.bkit/templates.md` § slop-scan.

7. Keep written docs tight (vale)
   Nothing checks the project's written docs, so they slowly fill with vague, padded wording that agents then have to read. Add Vale.
   Why: Agents read your docs and instructions on every run. Padded writing costs time and money every time it's read, and vague rules get followed vaguely. Vale (a writing checker) flags it.
   Ask your agent: "Run `brew install vale`, copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/Bkit/ to .vale/styles/Bkit/, then run `vale sync`."
   Agent steps: `.bkit/templates.md` § Vale.

8. Quick tidy-up on commit (lint-staged)
   The commit check has nothing to run. Add lint-staged so it tidies just the files you're committing.
   Why: It formats only the handful of files in each change, in about a second. Without it the commit check either does nothing or is slow enough that people start skipping it.
   Ask your agent: "Run `pnpm add -D lint-staged prettier` and copy .bkit/templates/lintstagedrc.example.json to .lintstagedrc.json."
   Agent steps: `.bkit/templates.md` § lint-staged.

9. Keep passwords the same everywhere (secrets-sync)
   Your deployment passwords are updated by hand in each service. Add bkit's sync tool so they're set in one place and copied everywhere.
   Why: The same password usually lives in several places: your hosting, your database, GitHub. When one falls out of step you get "works for me, broken in production", the slowest kind of bug to find. This keeps them matching and proves it without showing any values.
   Ask your agent: "Copy .bkit/templates/scripts/secrets/ to scripts/secrets/, fill in scripts/secrets/bkit-secrets.config.mjs for the services this project uses, then run `node scripts/secrets/bkit-secrets.mjs sync --dry-run`."
   Agent steps: `.bkit/templates.md` § Secrets sync.

10. A map of the code (graphify)
   Optional: add graphify to keep an up-to-date map of how your code fits together.
   Why: With a map, agents check what already exists before building it again. Without one, agents and reviews work out the structure from scratch each time. That's slower, and it's easy to miss how one change ripples into another part of the code.
   Ask your agent: "Run `uv tool install "graphifyy[sql]"`, copy .bkit/templates/scripts/graphify/ to scripts/graphify/ and .bkit/templates/.graphifyignore to .graphifyignore, then add the graph scripts to package.json as listed in .bkit/templates.md § graphify."
   Agent steps: `.bkit/templates.md` § graphify.

11. Readable table changes (prettier-tables)
   Optional: if your docs have tables, add this so editing one cell doesn't show the whole table as changed.
   Why: Changing one cell normally reformats the whole table, so a one-word edit looks like a page of changes and reviewers can't see what actually moved.
   Ask your agent: "Copy .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs to scripts/prettier/ and run `node scripts/prettier/bkit-insert-ignore.mjs`."
   Agent steps: `.bkit/templates.md` § Prettier tables.

==========================================================

[bkit-check] Wrote .bkit/advisories.md (9 items).

[bkit-check] check: 153 write(s) would occur — DRIFT DETECTED
: expected '[bkit-check] Running in check (dry-ru…' to contain 'cloud-bootstrap-fingerprint-missing'

- Expected
+ Received

- cloud-bootstrap-fingerprint-missing
+ [bkit-check] Running in check (dry-run) mode
+ [bkit-check] [dry-run] Running core payload pass
+ [bkit-check] [dry-run] core: .agents/context.md
+ [bkit-check] [dry-run] core: .agents/docs.md
+ [bkit-check] [dry-run] core: .agents/rules.md
+ [bkit-check] [dry-run] core: .agents/skills.md
+ [bkit-check] [dry-run] core: AGENTS.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-accessibility.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-adoption.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-agents.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-aio-seo.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-analytics.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-annotations.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-app-performance.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-app-store.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-architecture.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-ci-performance.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-config.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-cost.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-coverage.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-database.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-dead-code.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-deferrals.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-dependencies.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-issues.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-llm.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-logs.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-models.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-privacy.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-prompts.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-red-team.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-reliability.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-repo.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-security.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-slop.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-testing.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-audit-usability.md
+ [bkit-check] [dry-run] core: docs/templates/bkit-plan.md
+ [bkit-check] [dry-run] core: .gitignore
+ [bkit-check] [dry-run] core: .gitattributes
+ [bkit-check] [dry-run] Running bkit docs pass
+ [bkit-check] [dry-run] core: .bkit/authoring.md
+ [bkit-check] [dry-run] core: .bkit/cloud.md
+ [bkit-check] [dry-run] core: .bkit/cli.md
+ [bkit-check] [dry-run] core: .bkit/comparison.md
+ [bkit-check] [dry-run] core: .bkit/install.md
+ [bkit-check] [dry-run] core: .bkit/jsonl.md
+ [bkit-check] [dry-run] core: .bkit/LICENSE.md
+ [bkit-check] [dry-run] core: .bkit/pipeline.md
+ [bkit-check] [dry-run] core: .bkit/providers.md
+ [bkit-check] [dry-run] core: .bkit/prompts.md
+ [bkit-check] [dry-run] core: .bkit/router.md
+ [bkit-check] [dry-run] core: .bkit/templates.md
+ [bkit-check] [dry-run] core: .bkit/trackers.md
+ [bkit-check] [dry-run] core: .bkit/workflows.md
+ [bkit-check] [dry-run] core: .bkit/README.md
+ [bkit-check] [dry-run] Running template copies pass
+ [bkit-check] [dry-run] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
+ [bkit-check] [dry-run] template added: .bkit/templates/.cursor/Dockerfile
+ [bkit-check] [dry-run] template added: .bkit/templates/.cursor/environment.json
+ [bkit-check] [dry-run] template added: .bkit/templates/.cursor/settings.json
+ [bkit-check] [dry-run] template added: .bkit/templates/.envrc
+ [bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
+ [bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
+ [bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
+ [bkit-check] [dry-run] template added: .bkit/templates/.github/dependabot.yml
+ [bkit-check] [dry-run] template added: .bkit/templates/.github/renovate.json5
+ [bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-ci.yml
+ [bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
+ [bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-health.yml
+ [bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
+ [bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
+ [bkit-check] [dry-run] template added: .bkit/templates/.graphifyignore
+ [bkit-check] [dry-run] template added: .bkit/templates/.husky/pre-commit
+ [bkit-check] [dry-run] template added: .bkit/templates/.husky/pre-push
+ [bkit-check] [dry-run] template added: .bkit/templates/.oxlintrc.json
+ [bkit-check] [dry-run] template added: .bkit/templates/.serena/project.yml
+ [bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
+ [bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
+ [bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
+ [bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
+ [bkit-check] [dry-run] template added: .bkit/templates/.vale.ini
+ [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-cloudrun.md
+ [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-expo.md
+ [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-github.md
+ [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-inngest.md
+ [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-maestro.md
+ [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-playwright.md
+ [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-resend.md
+ [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-sentry.md
+ [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-serena.md
+ [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-stripe.md
+ [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-supabase.md
+ [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-tavily.md
+ [bkit-check] [dry-run] template added: .bkit/templates/context/bkit-vercel.md
+ [bkit-check] [dry-run] template added: .bkit/templates/docs/architecture.md
+ [bkit-check] [dry-run] template added: .bkit/templates/docs/capabilities.md
+ [bkit-check] [dry-run] template added: .bkit/templates/docs/components.md
+ [bkit-check] [dry-run] template added: .bkit/templates/docs/data-schema.md
+ [bkit-check] [dry-run] template added: .bkit/templates/docs/deployments.md
+ [bkit-check] [dry-run] template added: .bkit/templates/docs/design.md
+ [bkit-check] [dry-run] template added: .bkit/templates/docs/noise.md
+ [bkit-check] [dry-run] template added: .bkit/templates/docs/observability.md
+ [bkit-check] [dry-run] template added: .bkit/templates/docs/security.md
+ [bkit-check] [dry-run] template added: .bkit/templates/docs/setup.md
+ [bkit-check] [dry-run] template added: .bkit/templates/docs/technology.md
+ [bkit-check] [dry-run] template added: .bkit/templates/docs/testing.md
+ [bkit-check] [dry-run] template added: .bkit/templates/lintstagedrc.example.json
+ [bkit-check] [dry-run] template added: .bkit/templates/prettierignore.example
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
+ [bkit-check] [dry-run] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
+ [bkit-check] [dry-run] template added: .bkit/templates/slop-scan.config.json
+ [bkit-check] [dry-run] payload link: .bkit/core
+ [bkit-check] [dry-run] payload link: .bkit/shared
+ [bkit-check] [dry-run] core: .bkit/allowlist.json
+ [bkit-check] [dry-run] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
+ [bkit-check] [dry-run] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
+ [bkit-check] [dry-run] write version pin: .bkit/version (6.1.1)
+ [bkit-check] 153 write(s) would occur.
+ [bkit] What's new in v6.1.1: [6.1.1] — 2026-11-04
+ Fixed, Upgrade Notes
+
+ ==========================================================
+ bkit advisories
+ ==========================================================
+
+ 9 finding(s) — 0 blocker, 9 advisory.
+
+ INSTRUCTIONS FOR AN AI AGENT — copy this file (or specific items) into a coding assistant to apply each item. Each ACTION is self-contained.
+
+ --- 1/9 [advisory] gate-missing-called-scripts ---
+ Detect: The bkit:gate scripts call scripts package.json does not declare: `bkit:lint:prose`, `bkit:slop:delta`, `build`, `format:check`, `lint`, `test`, `typecheck`.
+ Action: Every bkit workflow runs a `bkit:gate*` script, so a missing link fails the whole gate. Add `bkit:lint:prose`, `bkit:slop:delta`, `build`, `format:check`, `lint`, `test`, `typecheck` to package.json (`.bkit/templates.md` lists the tool scripts and the devDeps they need), or edit the `bkit:gate*` scripts to drop what this repo does not have.
+
+ Gate contents (`.bkit/workflows.md` § Local gate scripts): every gate but `bkit:gate:static-unit-integration-e2e` and `bkit:gate:static-unit-integration-e2e-live` runs on a push or inside `/bkit-build`, so it MUST NOT run tests that need a deployed boundary or remote service; local services (a database in Docker) are fine.
+
+ --- 2/9 [advisory] test-file-script-missing ---
+ Detect: package.json does not declare `bkit:test:file`, so `/bkit-build` cannot check that each task's tests fail before its code is written.
+ Action: Add `bkit:test:file` to package.json: it runs the ONE test file bkit appends as its argument (repo-relative path) and writes a JUnit report to the path in `$BKIT_TEST_REPORT`. Vitest example:
+
+     "bkit:test:file": "vitest run --reporter=default --reporter=junit --outputFile.junit=\"$BKIT_TEST_REPORT\""
+
+ jest reads a bare path as a regex, so a folder such as `(tabs)` matches no file: pass `--runTestsByPath`. Call the runner directly, not through a task runner that caches results or runs dependent packages first. A monorepo routes the path to the package and config that own it.
+
+ --- 3/9 [advisory] gate-changed-script-missing ---
+ Detect: package.json does not declare `bkit:gate:changed`, so `/bkit-build` and `/bkit-debug` agents run a whole gate (`bkit:gate:static` or `bkit:gate:static-unit`) after every change instead of checking only what changed.
+ Action: Add `bkit:gate:changed` to package.json. `bkit tests changed` calls it with the changed files as its arguments (repo-relative paths: uncommitted, untracked and committed since the step began; deleted files left out) and never with none. It runs the tests that import those files, the tests that name their paths, and the static checks (lint, format, typecheck) on those files, exiting 0 when clean. Vitest + ESLint example, with `scripts/gate-changed.sh` holding `vitest related --run "$@" && eslint --max-warnings=0 --no-error-on-unmatched-pattern "$@" && prettier --check --ignore-unknown "$@"`:
+
+     "bkit:gate:changed": "sh scripts/gate-changed.sh"
+
+ `vitest related` finds only importers; also run the tests that read a changed file by its path (a text search of the test files for each path). The orchestrator's group gate, pre-push and CI still run the whole gates. To keep the whole gate on every change, add `gate-changed-script-missing` to `bkit.advisories.ignore` in package.json.
+
+ Gate contents (`.bkit/workflows.md` § Local gate scripts): every gate but `bkit:gate:static-unit-integration-e2e` and `bkit:gate:static-unit-integration-e2e-live` runs on a push or inside `/bkit-build`, so it MUST NOT run tests that need a deployed boundary or remote service; local services (a database in Docker) are fine.
+
+ --- 4/9 [advisory] first-install-postinstall-steps ---
+ Detect: First install detected (.bkit/version was absent).
+ Action: Post-install steps:
+
+ 1. Run `pnpm install` to refresh the lockfile, then commit.
+
+ 2. See `.bkit/install.md` for consumer setup and `.bkit/README.md` for ongoing ops.
+
+ Note: bkit seeded the bkit:gate:* / bkit:deps:* package.json scripts every workflow
+ runs (existing values are never touched). The tool scripts they chain (typecheck,
+ lint, format:check, bkit:lint:prose, bkit:slop:delta) and the devDeps those need are yours to
+ add: see .bkit/templates.md.
+
+ --- 5/9 [advisory] tracker-setup-none ---
+ Detect: bkit tracker is not configured (`bkit.tracker.default` absent). Workflows run but every tracker call is a no-op.
+ Action: Optional post-install decision. Run `bkit install --tracker=github` (recommended), `--tracker=linear` or `--tracker=jira` to enable tracker integration. GitHub tracker requires `BKIT_GH_TOKEN` in `.bkit/.env` (fine-grained PAT for one owner, classic PAT across owners). Linear tracker requires `BKIT_LINEAR_API_KEY` in `.bkit/.env`. Jira tracker requires `BKIT_JIRA_API_KEY` in `.bkit/.env` and `bkit.tracker.jira` in package.json. To opt out and silence this advisory, set `bkit.tracker.default` to `"none"` in package.json.
+
+ --- 6/9 [advisory] cloud-secrets-three-locations ---
+ Detect: The secrets bkit's cloud integration uses must also be set in each cloud location you use. Bkit cannot verify dashboard state — surface the checklist so you don't ship a half-configured cloud setup.
+ Action: Set each secret in the required locations:
+
+ 1. **Claude Code (web)**: open `https://claude.ai/code` → environment selector → your environment → **Environment variables**. Paste the block from `.claude/bkit-cloud.md` (gitignored), which also carries the setup script and network list. Claude reads both from the dashboard, NOT from the repo, so changes here do not require a commit.
+
+ **Context-fetch (`/bkit-debug` in the cloud):** if you run the debug workflow in these cloud agents, the observability creds your `.agents/context.md` context-fetch blocks use (e.g. `VERCEL_TOKEN`, `SUPABASE_ACCESS_TOKEN`) must ALSO be set in the same dashboards above — non-interactively, since headless agents cannot `vercel login`. These are operator/observability READ creds, not app-runtime secrets. Commit the non-secret selectors (team scope / project ref / `--environment`) in your copied block so they need no dashboard entry. The CLIs those blocks call install automatically in the cloud from each block's `context-fetch:provision` sibling — no manual setup.
+
+ Same VALUE in all places.
+
+ --- 7/9 [advisory] project-docs-index-missing ---
+ Detect: .agents/docs.md is absent, so agents have no list of the project's own documents to consult.
+ Action: Run `bkit install` to write .agents/docs.md, then add a row under `## Project Documents` for each project document you keep. Until then agents warn and fall back to repository evidence.
+
+ --- 8/9 [advisory] project-docs-missing ---
+ Detect: No project document covers: docs/architecture.md, docs/technology.md, docs/security.md, docs/data-schema.md, docs/testing.md, docs/deployments.md, docs/observability.md, docs/design.md, docs/noise.md, docs/setup.md.
+ Action: Copy the starter for each topic you want from `.bkit/templates/docs/` into `docs/`, fill it in from the repository, and add its row to `## Project Documents` in .agents/docs.md. A document you already keep elsewhere counts: index it with `Equivalent to <recommended path>` in its Scope cell. Skip topics that do not apply.
+
+ --- 9/9 [advisory] vale-package-not-synced ---
+ Detect: vale is on PATH but the repo has no .vale.ini and .vale/styles/write-good/ is absent — prose linting does not run.
+ Action: Adopt bkit's Vale template first: copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/Bkit/*.yml to .vale/styles/Bkit/. Then run `vale sync` (one-time per repo) to download the write-good package the copied .vale.ini names. `vale sync` reads its package list from .vale.ini, so it cannot fetch write-good before that file exists.
+
+ --- Setup tips ---
+ Things not set up yet, most useful first. For the person: each tip says what goes wrong today and a sentence to ask your agent. For an AI agent: follow each tip's Agent steps unless the person declines it. Silence a tip by adding its id to `bkit.advisories.ignore` in package.json; `bkit-upgrade` cannot be silenced. Full template catalogue: .bkit/templates.md.
+
+ 1. Connect an issue tracker (tracker)
+    bkit isn't connected to an issue tracker, so it can't read the task it's working on or record what it did. Connect GitHub, Linear or Jira, or switch this tip off if you don't want one.
+    Why: Every workflow starts by reading the issue it's working on and reports progress back to it as it goes. Without a tracker, you have to paste in what the agent should look at each time, and nothing records what changed or why.
+    Ask your agent: "Connect bkit to GitHub Issues: re-run `bkit install` with the tool flags I use plus `--tracker=github` (it records `bkit.tracker.default` in package.json and adds the tracker server to .mcp.json). If I don't want a tracker, set `"issueTracker": "none"` under `bkit` in package.json instead."
+    Agent steps: `.bkit/install.md` § Optional post-install decisions. Opt out: `"bkit": { "tracker": { "default": "none" } }` in `package.json`.
+
+ 2. Let agents look code up directly (serena)
+    Agents are finding code by searching for words, which is slower, costs more, and misses things. Set up Serena so they can look code up directly.
+    Why: Serena lets agents look up code the way your editor does ("where is this defined, and what uses it?") instead of guessing from text search and reading whole files. That means fewer accidental changes, fewer rounds of you correcting them, and lower running costs because they read less. It can only look things up, never change your files.
+    Ask your agent: "Run `brew install uv` and `uv tool install -p 3.13 serena-agent`, copy .bkit/templates/.serena/project.yml to .serena/project.yml and .bkit/templates/scripts/serena/ to scripts/serena/, then add the `serena` server from scripts/serena/bkit-serena.mcp.json to .mcp.json (details: .bkit/templates.md § Serena)."
+    Agent steps: `.bkit/templates.md` § Serena.
+
+ 3. Automatic checks on every change (ci-workflow)
+    Nothing checks your changes automatically before they're merged, so broken code can land unnoticed. Add bkit's check workflow.
+    Why: This runs your tests and checks on GitHub every time something changes, and bkit's ship step waits for it to pass before merging. Without it, "shipped" only means "merged", not "checked".
+    Ask your agent: "Copy .bkit/templates/.github/workflows/bkit-ci.yml to .github/workflows/<the file package.json `bkit.testing.ciWorkflow` names; default bkit-ci.yml>, replace `main` and `{{NODE_VERSION}}` in it with my default branch and Node major version, and add the `typecheck`, `lint`, `format:check`, `bkit:lint:prose`, `bkit:slop:delta` and `test` scripts to package.json as listed in .bkit/templates.md § Gate tool scripts."
+    Agent steps: `.bkit/templates.md` § CI workflow and § Gate tool scripts.
+
+ 4. Catch problems before they leave your machine (husky)
+    Mistakes are only caught after changes reach GitHub. Add the local checks so they're caught the moment a change is saved to git.
+    Why: These run the same checks on your own computer, in seconds, whenever a change is committed or pushed. Without them you find out minutes later from a failed build, after the agent has moved on and fixing it costs more.
+    Ask your agent: "Run `pnpm add -D husky`, add `"prepare": "husky"` to the package.json scripts, copy .bkit/templates/.husky/pre-commit and .bkit/templates/.husky/pre-push to .husky/, and run `chmod +x .husky/pre-commit .husky/pre-push`."
+    Agent steps: `.bkit/templates.md` § Git hooks.
+
+ 5. Consistent formatting (prettier)
+    There's no shared formatting setup, so reviews fill up with spacing changes that hide the real ones. Add Prettier with bkit's ignore file.
+    Why: Prettier (a code formatter) makes every file follow the same layout. bkit's ignore file stops it reformatting bkit's own files, which would otherwise show up as false changes every time bkit updates.
+    Ask your agent: "Copy .bkit/templates/prettierignore.example to .prettierignore first, then run `pnpm add -D prettier` and add `"format:check": "prettier --check ."` to the package.json scripts."
+    Agent steps: `.bkit/templates.md` § Prettier.
+
+ 6. Catch junk code (slop-scan)
+    Nothing catches the junk code AI tends to write. Add slop-scan so new junk gets flagged before it's merged.
+    Why: Filler and dead code look fine when you skim a change, so they pile up unnoticed until the codebase is hard to trust. slop-scan flags only new problems, so it won't bury you in old ones.
+    Ask your agent: "Run `pnpm add -D slop-scan`, copy .bkit/templates/slop-scan.config.json to slop-scan.config.json and .bkit/templates/scripts/slop/ to scripts/slop/, and add `"lint:slop": "slop-scan scan ."` and `"bkit:slop:delta": "bkit ci slop"` to the package.json scripts."
+    Agent steps: `.bkit/templates.md` § slop-scan.
+
+ 7. Keep written docs tight (vale)
+    Nothing checks the project's written docs, so they slowly fill with vague, padded wording that agents then have to read. Add Vale.
+    Why: Agents read your docs and instructions on every run. Padded writing costs time and money every time it's read, and vague rules get followed vaguely. Vale (a writing checker) flags it.
+    Ask your agent: "Run `brew install vale`, copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/Bkit/ to .vale/styles/Bkit/, then run `vale sync`."
+    Agent steps: `.bkit/templates.md` § Vale.
+
+ 8. Quick tidy-up on commit (lint-staged)
+    The commit check has nothing to run. Add lint-staged so it tidies just the files you're committing.
+    Why: It formats only the handful of files in each change, in about a second. Without it the commit check either does nothing or is slow enough that people start skipping it.
+    Ask your agent: "Run `pnpm add -D lint-staged prettier` and copy .bkit/templates/lintstagedrc.example.json to .lintstagedrc.json."
+    Agent steps: `.bkit/templates.md` § lint-staged.
+
+ 9. Keep passwords the same everywhere (secrets-sync)
+    Your deployment passwords are updated by hand in each service. Add bkit's sync tool so they're set in one place and copied everywhere.
+    Why: The same password usually lives in several places: your hosting, your database, GitHub. When one falls out of step you get "works for me, broken in production", the slowest kind of bug to find. This keeps them matching and proves it without showing any values.
+    Ask your agent: "Copy .bkit/templates/scripts/secrets/ to scripts/secrets/, fill in scripts/secrets/bkit-secrets.config.mjs for the services this project uses, then run `node scripts/secrets/bkit-secrets.mjs sync --dry-run`."
+    Agent steps: `.bkit/templates.md` § Secrets sync.
+
+ 10. A map of the code (graphify)
+    Optional: add graphify to keep an up-to-date map of how your code fits together.
+    Why: With a map, agents check what already exists before building it again. Without one, agents and reviews work out the structure from scratch each time. That's slower, and it's easy to miss how one change ripples into another part of the code.
+    Ask your agent: "Run `uv tool install "graphifyy[sql]"`, copy .bkit/templates/scripts/graphify/ to scripts/graphify/ and .bkit/templates/.graphifyignore to .graphifyignore, then add the graph scripts to package.json as listed in .bkit/templates.md § graphify."
+    Agent steps: `.bkit/templates.md` § graphify.
+
+ 11. Readable table changes (prettier-tables)
+    Optional: if your docs have tables, add this so editing one cell doesn't show the whole table as changed.
+    Why: Changing one cell normally reformats the whole table, so a one-word edit looks like a page of changes and reviewers can't see what actually moved.
+    Ask your agent: "Copy .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs to scripts/prettier/ and run `node scripts/prettier/bkit-insert-ignore.mjs`."
+    Agent steps: `.bkit/templates.md` § Prettier tables.
+
+ ==========================================================
+
+ [bkit-check] Wrote .bkit/advisories.md (9 items).
+
+ [bkit-check] check: 153 write(s) would occur — DRIFT DETECTED
+

 ❯ .bkit/core/engine/commands/install/check.integration.test.ts:791:22
    789|     const r = runBkit(["check"]);
    790|     const out = combinedOutput(r);
    791|     expect(out, out).toContain("cloud-bootstrap-fingerprint-missing");
       |                      ^
    792|     expect(out).toContain(".claude/hooks/bkit-cloud-bootstrap.sh");
    793|     expect(out).toContain(".bkit/templates/.claude/hooks/bkit-cloud-bo…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 33 passed (34)
   Start at  18:39:23
   Duration  46.93s (tests 99%, setup 1%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-EXgPye/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/install/doctor.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/install/doctor.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/install/doctor.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/install/doctor.integration.test.ts

[test-timeout-budget] load average 18.7 on 10 cores: unit limits 13850ms per test, 27700ms per hook (x2.77)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode

 ❯ .bkit/core/engine/commands/install/doctor.integration.test.ts (26 tests | 1 failed) 7649ms
   ❯ bkit doctor — integration (8)
     ✓ requires a provider only for installed OpenCode agents: false 483ms
     ✓ requires a provider only for installed OpenCode agents: true 488ms
     ✓ exits 0 on a minimal consumer (no crash) 520ms
     ✓ prints [bkit-doctor] log prefix 526ms
     ✓ prints Payload roots line (WS5-T1) 509ms
     ✓ emits bkit-version-pin-stale advisory when installed version > on-disk version 459ms
     × bkit doctor lists a stale adopted cloud bootstrap 490ms
     ✓ writes only the .bkit/advisories.md artifact (no other side effects) 457ms
   ✓ bkit status — integration (4)
     ✓ exits 0 and prints [bkit-status] prefix 337ms
     ✓ writes zero files (purely read-only — write-set assertion) 329ms
     ✓ reports installed hosts (at minimum claude and cursor on a fresh consumer) 337ms
     ✓ reports opencode as absent when .opencode/ does not exist 304ms
   ✓ bkit doctor — BAR-167 Phase 1 advisory surface (2)
     ✓ tier2-json-drift surfaces through runPreflight 8ms
     ✓ no drift advisory when consumer is fully contained 7ms
   ✓ bkit doctor — [mcp-env] advisory surface (8)
     ✓ mcp-env-missing-dotenv surfaces through runPostInstallCheck when .env.example exists but .env absent 123ms
     ✓ github tracker: mcp-env-blank-key flags BKIT_GH_TOKEN and only that tracker's own token 102ms
     ✓ linear tracker: mcp-env-blank-key flags BKIT_GH_TOKEN and only that tracker's own token 102ms
     ✓ jira tracker: mcp-env-blank-key flags BKIT_GH_TOKEN and only that tracker's own token 109ms
     ✓ no mcp-env advisories when .bkit/.env has all keys populated and no .envrc 104ms
     ✓ direnv-not-allowed skips in CI environment 1ms
     ✓ direnv-missing skips in CI environment 1ms
     ✓ doctor subprocess surfaces mcp-env advisory in output when .env.example present without .env 429ms
   ✓ bkit status — multi-provider (Task 5 / #281) (2)
     ✓ shows both providers with (active) marker on the active one 276ms
     ✓ keeps singular provider: format when only one provider installed 308ms
   ✓ bkit doctor — multi-provider cred check (Task 5 / #281) (2)
     ✓ checks credentials for ALL installed providers 422ms
     ✓ marks the active provider with (active) label in doctor output 417ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/install/doctor.integration.test.ts > bkit doctor — integration > bkit doctor lists a stale adopted cloud bootstrap
AssertionError: [bkit-doctor] Running advisory scan (no managed-file writes)
[bkit-doctor] Payload roots: core=/Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode/.bkit/core shared=/Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode/.bkit/shared templates=/Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode/.bkit/templates

==========================================================
bkit advisories
==========================================================

5 finding(s) — 0 blocker, 5 advisory.

INSTRUCTIONS FOR AN AI AGENT — copy this file (or specific items) into a coding assistant to apply each item. Each ACTION is self-contained.

--- 1/5 [advisory] tracker-setup-none ---
Detect: bkit tracker is not configured (`bkit.tracker.default` absent). Workflows run but every tracker call is a no-op.
Action: Optional post-install decision. Run `bkit install --tracker=github` (recommended), `--tracker=linear` or `--tracker=jira` to enable tracker integration. GitHub tracker requires `BKIT_GH_TOKEN` in `.bkit/.env` (fine-grained PAT for one owner, classic PAT across owners). Linear tracker requires `BKIT_LINEAR_API_KEY` in `.bkit/.env`. Jira tracker requires `BKIT_JIRA_API_KEY` in `.bkit/.env` and `bkit.tracker.jira` in package.json. To opt out and silence this advisory, set `bkit.tracker.default` to `"none"` in package.json.

--- 2/5 [advisory] cloud-secrets-three-locations ---
Detect: The secrets bkit's cloud integration uses must also be set in each cloud location you use. Bkit cannot verify dashboard state — surface the checklist so you don't ship a half-configured cloud setup.
Action: Set each secret in the required locations:

1. **Claude Code (web)**: open `https://claude.ai/code` → environment selector → your environment → **Environment variables**. Paste the block from `.claude/bkit-cloud.md` (gitignored), which also carries the setup script and network list. Claude reads both from the dashboard, NOT from the repo, so changes here do not require a commit.

**Context-fetch (`/bkit-debug` in the cloud):** if you run the debug workflow in these cloud agents, the observability creds your `.agents/context.md` context-fetch blocks use (e.g. `VERCEL_TOKEN`, `SUPABASE_ACCESS_TOKEN`) must ALSO be set in the same dashboards above — non-interactively, since headless agents cannot `vercel login`. These are operator/observability READ creds, not app-runtime secrets. Commit the non-secret selectors (team scope / project ref / `--environment`) in your copied block so they need no dashboard entry. The CLIs those blocks call install automatically in the cloud from each block's `context-fetch:provision` sibling — no manual setup.

Same VALUE in all places.

--- 3/5 [advisory] project-docs-index-missing ---
Detect: .agents/docs.md is absent, so agents have no list of the project's own documents to consult.
Action: Run `bkit install` to write .agents/docs.md, then add a row under `## Project Documents` for each project document you keep. Until then agents warn and fall back to repository evidence.

--- 4/5 [advisory] project-docs-missing ---
Detect: No project document covers: docs/architecture.md, docs/technology.md, docs/security.md, docs/data-schema.md, docs/testing.md, docs/deployments.md, docs/observability.md, docs/design.md, docs/noise.md, docs/setup.md.
Action: Copy the starter for each topic you want from `.bkit/templates/docs/` into `docs/`, fill it in from the repository, and add its row to `## Project Documents` in .agents/docs.md. A document you already keep elsewhere counts: index it with `Equivalent to <recommended path>` in its Scope cell. Skip topics that do not apply.

--- 5/5 [advisory] vale-package-not-synced ---
Detect: vale is on PATH but the repo has no .vale.ini and .vale/styles/write-good/ is absent — prose linting does not run.
Action: Adopt bkit's Vale template first: copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/Bkit/*.yml to .vale/styles/Bkit/. Then run `vale sync` (one-time per repo) to download the write-good package the copied .vale.ini names. `vale sync` reads its package list from .vale.ini, so it cannot fetch write-good before that file exists.

--- Setup tips ---
Things not set up yet, most useful first. For the person: each tip says what goes wrong today and a sentence to ask your agent. For an AI agent: follow each tip's Agent steps unless the person declines it. Silence a tip by adding its id to `bkit.advisories.ignore` in package.json; `bkit-upgrade` cannot be silenced. Full template catalogue: .bkit/templates.md.

1. Connect an issue tracker (tracker)
   bkit isn't connected to an issue tracker, so it can't read the task it's working on or record what it did. Connect GitHub, Linear or Jira, or switch this tip off if you don't want one.
   Why: Every workflow starts by reading the issue it's working on and reports progress back to it as it goes. Without a tracker, you have to paste in what the agent should look at each time, and nothing records what changed or why.
   Ask your agent: "Connect bkit to GitHub Issues: re-run `bkit install` with the tool flags I use plus `--tracker=github` (it records `bkit.tracker.default` in package.json and adds the tracker server to .mcp.json). If I don't want a tracker, set `"issueTracker": "none"` under `bkit` in package.json instead."
   Agent steps: `.bkit/install.md` § Optional post-install decisions. Opt out: `"bkit": { "tracker": { "default": "none" } }` in `package.json`.

2. Let agents look code up directly (serena)
   Agents are finding code by searching for words, which is slower, costs more, and misses things. Set up Serena so they can look code up directly.
   Why: Serena lets agents look up code the way your editor does ("where is this defined, and what uses it?") instead of guessing from text search and reading whole files. That means fewer accidental changes, fewer rounds of you correcting them, and lower running costs because they read less. It can only look things up, never change your files.
   Ask your agent: "Run `brew install uv` and `uv tool install -p 3.13 serena-agent`, copy .bkit/templates/.serena/project.yml to .serena/project.yml and .bkit/templates/scripts/serena/ to scripts/serena/, then add the `serena` server from scripts/serena/bkit-serena.mcp.json to .mcp.json (details: .bkit/templates.md § Serena)."
   Agent steps: `.bkit/templates.md` § Serena.

3. Automatic checks on every change (ci-workflow)
   Nothing checks your changes automatically before they're merged, so broken code can land unnoticed. Add bkit's check workflow.
   Why: This runs your tests and checks on GitHub every time something changes, and bkit's ship step waits for it to pass before merging. Without it, "shipped" only means "merged", not "checked".
   Ask your agent: "Copy .bkit/templates/.github/workflows/bkit-ci.yml to .github/workflows/<the file package.json `bkit.testing.ciWorkflow` names; default bkit-ci.yml>, replace `main` and `{{NODE_VERSION}}` in it with my default branch and Node major version, and add the `typecheck`, `lint`, `format:check`, `bkit:lint:prose`, `bkit:slop:delta` and `test` scripts to package.json as listed in .bkit/templates.md § Gate tool scripts."
   Agent steps: `.bkit/templates.md` § CI workflow and § Gate tool scripts.

4. Catch problems before they leave your machine (husky)
   Mistakes are only caught after changes reach GitHub. Add the local checks so they're caught the moment a change is saved to git.
   Why: These run the same checks on your own computer, in seconds, whenever a change is committed or pushed. Without them you find out minutes later from a failed build, after the agent has moved on and fixing it costs more.
   Ask your agent: "Run `pnpm add -D husky`, add `"prepare": "husky"` to the package.json scripts, copy .bkit/templates/.husky/pre-commit and .bkit/templates/.husky/pre-push to .husky/, and run `chmod +x .husky/pre-commit .husky/pre-push`."
   Agent steps: `.bkit/templates.md` § Git hooks.

5. Consistent formatting (prettier)
   There's no shared formatting setup, so reviews fill up with spacing changes that hide the real ones. Add Prettier with bkit's ignore file.
   Why: Prettier (a code formatter) makes every file follow the same layout. bkit's ignore file stops it reformatting bkit's own files, which would otherwise show up as false changes every time bkit updates.
   Ask your agent: "Copy .bkit/templates/prettierignore.example to .prettierignore first, then run `pnpm add -D prettier` and add `"format:check": "prettier --check ."` to the package.json scripts."
   Agent steps: `.bkit/templates.md` § Prettier.

6. Catch junk code (slop-scan)
   Nothing catches the junk code AI tends to write. Add slop-scan so new junk gets flagged before it's merged.
   Why: Filler and dead code look fine when you skim a change, so they pile up unnoticed until the codebase is hard to trust. slop-scan flags only new problems, so it won't bury you in old ones.
   Ask your agent: "Run `pnpm add -D slop-scan`, copy .bkit/templates/slop-scan.config.json to slop-scan.config.json and .bkit/templates/scripts/slop/ to scripts/slop/, and add `"lint:slop": "slop-scan scan ."` and `"bkit:slop:delta": "bkit ci slop"` to the package.json scripts."
   Agent steps: `.bkit/templates.md` § slop-scan.

7. Keep written docs tight (vale)
   Nothing checks the project's written docs, so they slowly fill with vague, padded wording that agents then have to read. Add Vale.
   Why: Agents read your docs and instructions on every run. Padded writing costs time and money every time it's read, and vague rules get followed vaguely. Vale (a writing checker) flags it.
   Ask your agent: "Run `brew install vale`, copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/Bkit/ to .vale/styles/Bkit/, then run `vale sync`."
   Agent steps: `.bkit/templates.md` § Vale.

8. Quick tidy-up on commit (lint-staged)
   The commit check has nothing to run. Add lint-staged so it tidies just the files you're committing.
   Why: It formats only the handful of files in each change, in about a second. Without it the commit check either does nothing or is slow enough that people start skipping it.
   Ask your agent: "Run `pnpm add -D lint-staged prettier` and copy .bkit/templates/lintstagedrc.example.json to .lintstagedrc.json."
   Agent steps: `.bkit/templates.md` § lint-staged.

9. Keep passwords the same everywhere (secrets-sync)
   Your deployment passwords are updated by hand in each service. Add bkit's sync tool so they're set in one place and copied everywhere.
   Why: The same password usually lives in several places: your hosting, your database, GitHub. When one falls out of step you get "works for me, broken in production", the slowest kind of bug to find. This keeps them matching and proves it without showing any values.
   Ask your agent: "Copy .bkit/templates/scripts/secrets/ to scripts/secrets/, fill in scripts/secrets/bkit-secrets.config.mjs for the services this project uses, then run `node scripts/secrets/bkit-secrets.mjs sync --dry-run`."
   Agent steps: `.bkit/templates.md` § Secrets sync.

10. A map of the code (graphify)
   Optional: add graphify to keep an up-to-date map of how your code fits together.
   Why: With a map, agents check what already exists before building it again. Without one, agents and reviews work out the structure from scratch each time. That's slower, and it's easy to miss how one change ripples into another part of the code.
   Ask your agent: "Run `uv tool install "graphifyy[sql]"`, copy .bkit/templates/scripts/graphify/ to scripts/graphify/ and .bkit/templates/.graphifyignore to .graphifyignore, then add the graph scripts to package.json as listed in .bkit/templates.md § graphify."
   Agent steps: `.bkit/templates.md` § graphify.

11. Readable table changes (prettier-tables)
   Optional: if your docs have tables, add this so editing one cell doesn't show the whole table as changed.
   Why: Changing one cell normally reformats the whole table, so a one-word edit looks like a page of changes and reviewers can't see what actually moved.
   Ask your agent: "Copy .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs to scripts/prettier/ and run `node scripts/prettier/bkit-insert-ignore.mjs`."
   Agent steps: `.bkit/templates.md` § Prettier tables.

==========================================================

[bkit-doctor] Wrote .bkit/advisories.md (5 items).
: expected '[bkit-doctor] Running advisory scan (…' to contain 'cloud-bootstrap-fingerprint-missing'

- Expected
+ Received

- cloud-bootstrap-fingerprint-missing
+ [bkit-doctor] Running advisory scan (no managed-file writes)
+ [bkit-doctor] Payload roots: core=/Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode/.bkit/core shared=/Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode/.bkit/shared templates=/Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode/.bkit/templates
+
+ ==========================================================
+ bkit advisories
+ ==========================================================
+
+ 5 finding(s) — 0 blocker, 5 advisory.
+
+ INSTRUCTIONS FOR AN AI AGENT — copy this file (or specific items) into a coding assistant to apply each item. Each ACTION is self-contained.
+
+ --- 1/5 [advisory] tracker-setup-none ---
+ Detect: bkit tracker is not configured (`bkit.tracker.default` absent). Workflows run but every tracker call is a no-op.
+ Action: Optional post-install decision. Run `bkit install --tracker=github` (recommended), `--tracker=linear` or `--tracker=jira` to enable tracker integration. GitHub tracker requires `BKIT_GH_TOKEN` in `.bkit/.env` (fine-grained PAT for one owner, classic PAT across owners). Linear tracker requires `BKIT_LINEAR_API_KEY` in `.bkit/.env`. Jira tracker requires `BKIT_JIRA_API_KEY` in `.bkit/.env` and `bkit.tracker.jira` in package.json. To opt out and silence this advisory, set `bkit.tracker.default` to `"none"` in package.json.
+
+ --- 2/5 [advisory] cloud-secrets-three-locations ---
+ Detect: The secrets bkit's cloud integration uses must also be set in each cloud location you use. Bkit cannot verify dashboard state — surface the checklist so you don't ship a half-configured cloud setup.
+ Action: Set each secret in the required locations:
+
+ 1. **Claude Code (web)**: open `https://claude.ai/code` → environment selector → your environment → **Environment variables**. Paste the block from `.claude/bkit-cloud.md` (gitignored), which also carries the setup script and network list. Claude reads both from the dashboard, NOT from the repo, so changes here do not require a commit.
+
+ **Context-fetch (`/bkit-debug` in the cloud):** if you run the debug workflow in these cloud agents, the observability creds your `.agents/context.md` context-fetch blocks use (e.g. `VERCEL_TOKEN`, `SUPABASE_ACCESS_TOKEN`) must ALSO be set in the same dashboards above — non-interactively, since headless agents cannot `vercel login`. These are operator/observability READ creds, not app-runtime secrets. Commit the non-secret selectors (team scope / project ref / `--environment`) in your copied block so they need no dashboard entry. The CLIs those blocks call install automatically in the cloud from each block's `context-fetch:provision` sibling — no manual setup.
+
+ Same VALUE in all places.
+
+ --- 3/5 [advisory] project-docs-index-missing ---
+ Detect: .agents/docs.md is absent, so agents have no list of the project's own documents to consult.
+ Action: Run `bkit install` to write .agents/docs.md, then add a row under `## Project Documents` for each project document you keep. Until then agents warn and fall back to repository evidence.
+
+ --- 4/5 [advisory] project-docs-missing ---
+ Detect: No project document covers: docs/architecture.md, docs/technology.md, docs/security.md, docs/data-schema.md, docs/testing.md, docs/deployments.md, docs/observability.md, docs/design.md, docs/noise.md, docs/setup.md.
+ Action: Copy the starter for each topic you want from `.bkit/templates/docs/` into `docs/`, fill it in from the repository, and add its row to `## Project Documents` in .agents/docs.md. A document you already keep elsewhere counts: index it with `Equivalent to <recommended path>` in its Scope cell. Skip topics that do not apply.
+
+ --- 5/5 [advisory] vale-package-not-synced ---
+ Detect: vale is on PATH but the repo has no .vale.ini and .vale/styles/write-good/ is absent — prose linting does not run.
+ Action: Adopt bkit's Vale template first: copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/Bkit/*.yml to .vale/styles/Bkit/. Then run `vale sync` (one-time per repo) to download the write-good package the copied .vale.ini names. `vale sync` reads its package list from .vale.ini, so it cannot fetch write-good before that file exists.
+
+ --- Setup tips ---
+ Things not set up yet, most useful first. For the person: each tip says what goes wrong today and a sentence to ask your agent. For an AI agent: follow each tip's Agent steps unless the person declines it. Silence a tip by adding its id to `bkit.advisories.ignore` in package.json; `bkit-upgrade` cannot be silenced. Full template catalogue: .bkit/templates.md.
+
+ 1. Connect an issue tracker (tracker)
+    bkit isn't connected to an issue tracker, so it can't read the task it's working on or record what it did. Connect GitHub, Linear or Jira, or switch this tip off if you don't want one.
+    Why: Every workflow starts by reading the issue it's working on and reports progress back to it as it goes. Without a tracker, you have to paste in what the agent should look at each time, and nothing records what changed or why.
+    Ask your agent: "Connect bkit to GitHub Issues: re-run `bkit install` with the tool flags I use plus `--tracker=github` (it records `bkit.tracker.default` in package.json and adds the tracker server to .mcp.json). If I don't want a tracker, set `"issueTracker": "none"` under `bkit` in package.json instead."
+    Agent steps: `.bkit/install.md` § Optional post-install decisions. Opt out: `"bkit": { "tracker": { "default": "none" } }` in `package.json`.
+
+ 2. Let agents look code up directly (serena)
+    Agents are finding code by searching for words, which is slower, costs more, and misses things. Set up Serena so they can look code up directly.
+    Why: Serena lets agents look up code the way your editor does ("where is this defined, and what uses it?") instead of guessing from text search and reading whole files. That means fewer accidental changes, fewer rounds of you correcting them, and lower running costs because they read less. It can only look things up, never change your files.
+    Ask your agent: "Run `brew install uv` and `uv tool install -p 3.13 serena-agent`, copy .bkit/templates/.serena/project.yml to .serena/project.yml and .bkit/templates/scripts/serena/ to scripts/serena/, then add the `serena` server from scripts/serena/bkit-serena.mcp.json to .mcp.json (details: .bkit/templates.md § Serena)."
+    Agent steps: `.bkit/templates.md` § Serena.
+
+ 3. Automatic checks on every change (ci-workflow)
+    Nothing checks your changes automatically before they're merged, so broken code can land unnoticed. Add bkit's check workflow.
+    Why: This runs your tests and checks on GitHub every time something changes, and bkit's ship step waits for it to pass before merging. Without it, "shipped" only means "merged", not "checked".
+    Ask your agent: "Copy .bkit/templates/.github/workflows/bkit-ci.yml to .github/workflows/<the file package.json `bkit.testing.ciWorkflow` names; default bkit-ci.yml>, replace `main` and `{{NODE_VERSION}}` in it with my default branch and Node major version, and add the `typecheck`, `lint`, `format:check`, `bkit:lint:prose`, `bkit:slop:delta` and `test` scripts to package.json as listed in .bkit/templates.md § Gate tool scripts."
+    Agent steps: `.bkit/templates.md` § CI workflow and § Gate tool scripts.
+
+ 4. Catch problems before they leave your machine (husky)
+    Mistakes are only caught after changes reach GitHub. Add the local checks so they're caught the moment a change is saved to git.
+    Why: These run the same checks on your own computer, in seconds, whenever a change is committed or pushed. Without them you find out minutes later from a failed build, after the agent has moved on and fixing it costs more.
+    Ask your agent: "Run `pnpm add -D husky`, add `"prepare": "husky"` to the package.json scripts, copy .bkit/templates/.husky/pre-commit and .bkit/templates/.husky/pre-push to .husky/, and run `chmod +x .husky/pre-commit .husky/pre-push`."
+    Agent steps: `.bkit/templates.md` § Git hooks.
+
+ 5. Consistent formatting (prettier)
+    There's no shared formatting setup, so reviews fill up with spacing changes that hide the real ones. Add Prettier with bkit's ignore file.
+    Why: Prettier (a code formatter) makes every file follow the same layout. bkit's ignore file stops it reformatting bkit's own files, which would otherwise show up as false changes every time bkit updates.
+    Ask your agent: "Copy .bkit/templates/prettierignore.example to .prettierignore first, then run `pnpm add -D prettier` and add `"format:check": "prettier --check ."` to the package.json scripts."
+    Agent steps: `.bkit/templates.md` § Prettier.
+
+ 6. Catch junk code (slop-scan)
+    Nothing catches the junk code AI tends to write. Add slop-scan so new junk gets flagged before it's merged.
+    Why: Filler and dead code look fine when you skim a change, so they pile up unnoticed until the codebase is hard to trust. slop-scan flags only new problems, so it won't bury you in old ones.
+    Ask your agent: "Run `pnpm add -D slop-scan`, copy .bkit/templates/slop-scan.config.json to slop-scan.config.json and .bkit/templates/scripts/slop/ to scripts/slop/, and add `"lint:slop": "slop-scan scan ."` and `"bkit:slop:delta": "bkit ci slop"` to the package.json scripts."
+    Agent steps: `.bkit/templates.md` § slop-scan.
+
+ 7. Keep written docs tight (vale)
+    Nothing checks the project's written docs, so they slowly fill with vague, padded wording that agents then have to read. Add Vale.
+    Why: Agents read your docs and instructions on every run. Padded writing costs time and money every time it's read, and vague rules get followed vaguely. Vale (a writing checker) flags it.
+    Ask your agent: "Run `brew install vale`, copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/Bkit/ to .vale/styles/Bkit/, then run `vale sync`."
+    Agent steps: `.bkit/templates.md` § Vale.
+
+ 8. Quick tidy-up on commit (lint-staged)
+    The commit check has nothing to run. Add lint-staged so it tidies just the files you're committing.
+    Why: It formats only the handful of files in each change, in about a second. Without it the commit check either does nothing or is slow enough that people start skipping it.
+    Ask your agent: "Run `pnpm add -D lint-staged prettier` and copy .bkit/templates/lintstagedrc.example.json to .lintstagedrc.json."
+    Agent steps: `.bkit/templates.md` § lint-staged.
+
+ 9. Keep passwords the same everywhere (secrets-sync)
+    Your deployment passwords are updated by hand in each service. Add bkit's sync tool so they're set in one place and copied everywhere.
+    Why: The same password usually lives in several places: your hosting, your database, GitHub. When one falls out of step you get "works for me, broken in production", the slowest kind of bug to find. This keeps them matching and proves it without showing any values.
+    Ask your agent: "Copy .bkit/templates/scripts/secrets/ to scripts/secrets/, fill in scripts/secrets/bkit-secrets.config.mjs for the services this project uses, then run `node scripts/secrets/bkit-secrets.mjs sync --dry-run`."
+    Agent steps: `.bkit/templates.md` § Secrets sync.
+
+ 10. A map of the code (graphify)
+    Optional: add graphify to keep an up-to-date map of how your code fits together.
+    Why: With a map, agents check what already exists before building it again. Without one, agents and reviews work out the structure from scratch each time. That's slower, and it's easy to miss how one change ripples into another part of the code.
+    Ask your agent: "Run `uv tool install "graphifyy[sql]"`, copy .bkit/templates/scripts/graphify/ to scripts/graphify/ and .bkit/templates/.graphifyignore to .graphifyignore, then add the graph scripts to package.json as listed in .bkit/templates.md § graphify."
+    Agent steps: `.bkit/templates.md` § graphify.
+
+ 11. Readable table changes (prettier-tables)
+    Optional: if your docs have tables, add this so editing one cell doesn't show the whole table as changed.
+    Why: Changing one cell normally reformats the whole table, so a one-word edit looks like a page of changes and reviewers can't see what actually moved.
+    Ask your agent: "Copy .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs to scripts/prettier/ and run `node scripts/prettier/bkit-insert-ignore.mjs`."
+    Agent steps: `.bkit/templates.md` § Prettier tables.
+
+ ==========================================================
+
+ [bkit-doctor] Wrote .bkit/advisories.md (5 items).
+

 ❯ .bkit/core/engine/commands/install/doctor.integration.test.ts:170:22
    168|     expect(result.status, `doctor crashed:\n${result.stdout}\n${result…
    169|     const out = result.stdout + result.stderr;
    170|     expect(out, out).toContain("cloud-bootstrap-fingerprint-missing");
       |                      ^
    171|     expect(out).toContain(".bkit/templates/.claude/hooks/bkit-cloud-bo…
    172|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 25 passed (26)
   Start at  18:40:12
   Duration  8.04s (tests 97%, transform 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-korX6M/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
