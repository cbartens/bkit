Enforced: true
Red: 6
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/892-template-copies-bkit-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 5 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade writes no root lint-staged config for a consumer that relied on the nested sample" | red | failure: expected true to be false // Object.is equality |
| 5 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade names the missing root lint-staged config with the copy command" | red | failure: expected '[bkit-upgrade] Running upgrade (non-i…' to contain 'bkit upgrade: no root lint-staged con…' |
| 6 | `.bkit/core/engine/checks/tips/detect.test.ts` "hasLintStagedConfig is true for every config name lint-staged 17 reads" | red | failure: lint-staged.config.ts: expected false to be true // Object.is equality |
| 6 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts" | red | failure: expected true to be false // Object.is equality |
| 7 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade prints no missing lint-staged config line when lint-staged is not a dependency" | red | failure: expected true to be false // Object.is equality |
| 7 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path" | red | failure: expected true to be false // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/892-template-copies-bkit
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/install/upgrade.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/892-template-copies-bkit
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/install/upgrade.integration.test.ts

[test-timeout-budget] load average 27.5 on 10 cores: unit limits 18250ms per test, 36500ms per hook (x3.65)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/892-template-copies-bkit

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > does not silently overwrite consumer drift in --non-interactive mode
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > conflict list has relPath and both content versions for AI-actionable diff
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > upgrades non-conflicting file while preserving conflicting consumer file
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > upgrades non-conflicting file while preserving conflicting consumer file
[bkit-upgrade] upgrade: .claude/agents/bkit-test.md

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > .gitignore — consumer secret-protection rules survive; bkit block is updated (the #129 case)
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > .gitattributes — consumer custom attributes outside the block survive
[bkit-upgrade] upgrade (merge): .gitattributes

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > docs/*.md — consumer prose AFTER bkit:end survives even with NO manifest entry (content-detected)
[bkit-upgrade] upgrade (merge): docs/testing.md

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > dest has NO bkit markers — block is appended at EOF, all consumer content preserved
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer keys (json deep-merge) > .claude/settings.json — consumer mcpServers survives; bkit keys merged in (the #129 case)
[bkit-upgrade] upgrade (merge): .claude/settings.json

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade is idempotent for block-merge formats > records the merged on-disk hash and skips on the second run
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade of an owned whole-file candidate > auto-updates when there is no consumer drift
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade of an owned whole-file candidate > honors contentOverride — writes rendered content, never the raw template
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade substitutes template tokens (#129 §2) > seeds an absent byte-equal file with {{DEFAULT_BRANCH}} resolved, not literal
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts (72 tests | 5 failed) 165931ms
   ✓ upgrade integration: consumer customizations (4)
     ✓ detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved) 9ms
     ✓ does not silently overwrite consumer drift in --non-interactive mode 3ms
     ✓ conflict list has relPath and both content versions for AI-actionable diff 3ms
     ✓ upgrades non-conflicting file while preserving conflicting consumer file 6ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (5)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 992ms
     ✓ install --claude does not write Serena or graphify examples 1746ms
     ✓ upgrade does not rewrite a consumer-owned bkit-graphify.sh 956ms
     ✓ does not rewrite a consumer-owned .github/renovate.json5 1003ms
     ✓ preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6) 906ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 13751ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 12364ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 5173ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 4926ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 6155ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 4487ms
     ✓ malformed .mcp.json fails install instead of being overwritten 502ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 6863ms
     ✓ an adopted copy of every template survives upgrade and check 2810ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 2509ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 2494ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 3355ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 13710ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 2583ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (12)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 2432ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 6853ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 2547ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 1251ms
     ✓ slop plugin migration upgrades old bytes, stays idempotent, and preserves customization 2162ms
     ✓ branded script migration is idempotent and dry-run writes nothing 1988ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 1401ms
     ✓ a dry-run hook and CI token migration writes nothing 642ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 1779ms
     ✓ a second check-name migration writes nothing 1630ms
     ✓ a dry-run check-name migration writes and moves nothing 670ms
     ✓ a second Vale migration and a dry run write nothing 1704ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 2533ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 2149ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 3720ms
   ✓ upgrade-preservation (9)
     ✓ upgrade preserves consumer content outside the bkit block (markered-text) (4)
       ✓ .gitignore — consumer secret-protection rules survive; bkit block is updated (the #129 case) 2ms
       ✓ .gitattributes — consumer custom attributes outside the block survive 1ms
       ✓ docs/*.md — consumer prose AFTER bkit:end survives even with NO manifest entry (content-detected) 1ms
       ✓ dest has NO bkit markers — block is appended at EOF, all consumer content preserved 1ms
     ✓ upgrade preserves consumer keys (json deep-merge) (1)
       ✓ .claude/settings.json — consumer mcpServers survives; bkit keys merged in (the #129 case) 1ms
     ✓ upgrade is idempotent for block-merge formats (1)
       ✓ records the merged on-disk hash and skips on the second run 1ms
     ✓ upgrade of an owned whole-file candidate (2)
       ✓ auto-updates when there is no consumer drift 1ms
       ✓ honors contentOverride — writes rendered content, never the raw template 1ms
     ✓ upgrade substitutes template tokens (#129 §2) (1)
       ✓ seeds an absent byte-equal file with {{DEFAULT_BRANCH}} resolved, not literal 1ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 2914ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 1817ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 1805ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 1688ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 2049ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 1700ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 1708ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 1802ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 2282ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 2480ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 2098ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ previews the bump (pnpm add + re-render) and exits 0 without mutating 254ms
     ✓ bumps when --to names the installed version but package.json pins a file: tarball 245ms
     ✓ passes -w when the consumer is a pnpm workspace root 247ms
     ✓ starts the package runner for the install and the re-exec 630ms
     ✓ rejects --to=<version> with --latest (mutually exclusive) at exit 1 225ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 3726ms
   ✓ #892 — upgrade replaces the old sample config names (1)
     ✓ upgrade replaces the old sample config names 3457ms
   ✓ #892 — upgrade copies the lint-staged sample to the root (2)
     ✓ upgrade copies the lint-staged sample to the root when the format gate runs lint-staged with no root config 2417ms
     ✓ upgrade dry run reports the lint-staged config copy without writing it 2086ms
   ❯ #892 — upgrade warns about a missing root lint-staged config instead of writing one (5)
     × upgrade writes no root lint-staged config for a consumer that relied on the nested sample 2076ms
     × upgrade names the missing root lint-staged config with the copy command 1615ms
     × upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts 1641ms
     × upgrade prints no missing lint-staged config line when lint-staged is not a dependency 2097ms
     × upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path 2096ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/install/upgrade.integration.test.ts > #892 — upgrade warns about a missing root lint-staged config instead of writing one > upgrade writes no root lint-staged config for a consumer that relied on the nested sample
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts:2532:68
    2530|     expect(up.status, combinedOutput(up)).toBe(0);
    2531|
    2532|     expect(fs.existsSync(path.join(tmpDir, ".lintstagedrc.json"))).toB…
       |                                                                    ^
    2533|   });
    2534|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

 FAIL  .bkit/core/engine/commands/install/upgrade.integration.test.ts > #892 — upgrade warns about a missing root lint-staged config instead of writing one > upgrade names the missing root lint-staged config with the copy command
AssertionError: expected '[bkit-upgrade] Running upgrade (non-i…' to contain 'bkit upgrade: no root lint-staged con…'

- Expected
+ Received

- bkit upgrade: no root lint-staged config — commits will fail. Fix: cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json
+ [bkit-upgrade] Running upgrade (non-interactive)
+ [bkit-upgrade] lint-staged config copied from the sample: .lintstagedrc.json
+ [bkit-upgrade] Templates updated (2). bkit never applies these; diff them against your own copies and adopt what you want:
+   added:   .bkit/templates/lintstagedrc.example.json
+   removed: .bkit/templates/.lintstagedrc.json
+ Templates (adopt, do not skip): read .bkit/templates.md; bkit never applies templates, so adopt each copy in .bkit/templates/ unless adoption would break existing functionality — state which you did not adopt and why. (If your own gates scan the repo, ignore .bkit/templates/.)
+ [bkit-upgrade] core: package.json scripts added [bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
+ [bkit-upgrade] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
+ [bkit-upgrade] write: .claude/commands/bkit-auto.md
+ [bkit-upgrade] write: .claude/commands/bkit-build.md
+ [bkit-upgrade] write: .claude/commands/bkit-debug.md
+ [bkit-upgrade] write: .claude/commands/bkit-design.md
+ [bkit-upgrade] write: .claude/commands/bkit-plan.md
+ [bkit-upgrade] write: .claude/commands/bkit-ship.md
+ [bkit-upgrade] write: .claude/agents/bkit-audit-generate.md
+ [bkit-upgrade] write: .claude/agents/bkit-utility-update-roadmap.md
+ [bkit-upgrade] write: .claude/agents/bkit-utility-update-tracker.md
+ [bkit-upgrade] upgrade: .claude/bkit-cloud.md (regenerated — gitignored, holds resolved secrets)
+ [bkit-upgrade] Done. updated: 0, skipped: 60, conflicts: 0, re-rendered: 10
+ [bkit-upgrade] Checking advisories (read-only)
+ [bkit-upgrade] [dry-run] Running core payload pass
+ [bkit-upgrade] [dry-run] Running bkit docs pass
+ [bkit-upgrade] [dry-run] Running template copies pass
+ [bkit-upgrade] 0 write(s) would occur.
+ [bkit] What's new in v6.1.1: [6.1.1] — 2026-11-04
+ Fixed, Upgrade Notes
+
+ ==========================================================
+ bkit advisories
+ ==========================================================
+
+ 8 finding(s) — 0 blocker, 8 advisory.
+
+ INSTRUCTIONS FOR AN AI AGENT — copy this file (or specific items) into a coding assistant to apply each item. Each ACTION is self-contained.
+
+ --- 1/8 [advisory] context-fetch-missing ---
+ Detect: `.agents/context.md` has the bkit-managed block but no `<!-- context-fetch:start [name] --> ... <!-- context-fetch:end -->` block after `<!-- bkit:end -->`. `/bkit-debug` runs every block in that consumer section — with none, no runtime-log artifact is produced.
+ Action: Copy the blocks of a provider file in `.bkit/templates/context/` (e.g. `bkit-vercel.md`, `bkit-supabase.md`; index in `.bkit/templates.md` § Context-fetch blocks) and paste them after `<!-- bkit:end -->`, then set its env vars. REQUIRED: set the block's non-secret selector (e.g. `VERCEL_SCOPE` / `SUPABASE_PROJECT_ID`) by uncommenting the assignment line at the top of the copied block — committing it there is what makes the block run in headless cloud agents, which never read `.bkit/.env`. For cloud `/bkit-debug`, also set the secret tokens (`VERCEL_TOKEN` / `SUPABASE_ACCESS_TOKEN`) in your Claude/Cursor dashboard (or GitHub Actions secrets) and authenticate non-interactively (env tokens, never `vercel login`). Each block self-gates (missing CLI / token => a `[context-fetch:<name>] skipped — …` stderr breadcrumb, not an error), so enable only the sources you use; add your own block for any other log backend (`gcloud` / `aws` / `datadog`). Keep blocks read-only and idempotent — the agent customises severity / freshness / limit / target environment (e.g. Vercel preview vs production) at run-time.
+
+ --- 2/8 [advisory] gate-missing-called-scripts ---
+ Detect: The bkit:gate scripts call scripts package.json does not declare: `bkit:lint:prose`, `bkit:slop:delta`, `build`, `format:check`, `lint`, `test`, `typecheck`.
+ Action: Every bkit workflow runs a `bkit:gate*` script, so a missing link fails the whole gate. Add `bkit:lint:prose`, `bkit:slop:delta`, `build`, `format:check`, `lint`, `test`, `typecheck` to package.json (`.bkit/templates.md` lists the tool scripts and the devDeps they need), or edit the `bkit:gate*` scripts to drop what this repo does not have.
+
+ Gate contents (`.bkit/workflows.md` § Local gate scripts): every gate but `bkit:gate:static-unit-integration-e2e` and `bkit:gate:static-unit-integration-e2e-live` runs on a push or inside `/bkit-build`, so it MUST NOT run tests that need a deployed boundary or remote service; local services (a database in Docker) are fine.
+
+ --- 3/8 [advisory] test-file-script-missing ---
+ Detect: package.json does not declare `bkit:test:file`, so `/bkit-build` cannot check that each task's tests fail before its code is written.
+ Action: Add `bkit:test:file` to package.json: it runs the ONE test file bkit appends as its argument (repo-relative path) and writes a JUnit report to the path in `$BKIT_TEST_REPORT`. Vitest example:
+
+     "bkit:test:file": "vitest run --reporter=default --reporter=junit --outputFile.junit=\"$BKIT_TEST_REPORT\""
+
+ Call the runner directly, not through a task runner that caches results or runs dependent packages first. A monorepo routes the path to the package and config that own it.
+
+ --- 4/8 [advisory] gate-changed-script-missing ---
+ Detect: package.json does not declare `bkit:gate:changed`, so `/bkit-build` and `/bkit-debug` agents run a whole gate (`bkit:gate:static` or `bkit:gate:static-unit`) after every change instead of checking only what changed.
+ Action: Add `bkit:gate:changed` to package.json. `bkit tests changed` calls it with the changed files as its arguments (repo-relative paths: uncommitted, untracked and committed since the step began; deleted files left out) and never with none. It runs the tests that import those files, the tests that name their paths, and the static checks (lint, format, typecheck) on those files, exiting 0 when clean. Vitest + ESLint example, with `scripts/gate-changed.sh` holding `vitest related --run "$@" && eslint --max-warnings=0 --no-error-on-unmatched-pattern "$@" && prettier --check --ignore-unknown "$@"`:
+
+     "bkit:gate:changed": "sh scripts/gate-changed.sh"
+
+ `vitest related` finds only importers; also run the tests that read a changed file by its path (a text search of the test files for each path). The orchestrator's group gate, pre-push and CI still run the whole gates. To keep the whole gate on every change, add `gate-changed-script-missing` to `bkit.advisories.ignore` in package.json.
+
+ Gate contents (`.bkit/workflows.md` § Local gate scripts): every gate but `bkit:gate:static-unit-integration-e2e` and `bkit:gate:static-unit-integration-e2e-live` runs on a push or inside `/bkit-build`, so it MUST NOT run tests that need a deployed boundary or remote service; local services (a database in Docker) are fine.
+
+ --- 5/8 [advisory] tracker-setup-none ---
+ Detect: bkit tracker is not configured (`bkit.tracker.default` absent). Workflows run but every tracker call is a no-op.
+ Action: Optional post-install decision. Run `bkit install --tracker=github` (recommended), `--tracker=linear` or `--tracker=jira` to enable tracker integration. GitHub tracker requires `BKIT_GH_TOKEN` in `.bkit/.env` (fine-grained PAT for one owner, classic PAT across owners). Linear tracker requires `BKIT_LINEAR_API_KEY` in `.bkit/.env`. Jira tracker requires `BKIT_JIRA_API_KEY` in `.bkit/.env` and `bkit.tracker.jira` in package.json. To opt out and silence this advisory, set `bkit.tracker.default` to `"none"` in package.json.
+
+ --- 6/8 [advisory] cloud-secrets-three-locations ---
+ Detect: The secrets bkit's cloud integration uses must also be set in each cloud location you use. Bkit cannot verify dashboard state — surface the checklist so you don't ship a half-configured cloud setup.
+ Action: Set each secret in the required locations:
+
+ 1. **Claude Code (web)**: open `https://claude.ai/code` → environment selector → your environment → **Environment variables**. Paste the block from `.claude/bkit-cloud.md` (gitignored), which also carries the setup script and network list. Claude reads both from the dashboard, NOT from the repo, so changes here do not require a commit.
+
+ **Context-fetch (`/bkit-debug` in the cloud):** if you run the debug workflow in these cloud agents, the observability creds your `.agents/context.md` context-fetch blocks use (e.g. `VERCEL_TOKEN`, `SUPABASE_ACCESS_TOKEN`) must ALSO be set in the same dashboards above — non-interactively, since headless agents cannot `vercel login`. These are operator/observability READ creds, not app-runtime secrets. Commit the non-secret selectors (team scope / project ref / `--environment`) in your copied block so they need no dashboard entry. The CLIs those blocks call install automatically in the cloud from each block's `context-fetch:provision` sibling — no manual setup.
+
+ Same VALUE in all places.
+
+ --- 7/8 [advisory] vale-package-not-synced ---
+ Detect: vale is on PATH but the repo has no .vale.ini and .vale/styles/write-good/ is absent — prose linting does not run.
+ Action: Adopt bkit's Vale template first: copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/Bkit/*.yml to .vale/styles/Bkit/. Then run `vale sync` (one-time per repo) to download the write-good package the copied .vale.ini names. `vale sync` reads its package list from .vale.ini, so it cannot fetch write-good before that file exists.
+
+ --- 8/8 [advisory] mcp-env-missing-dotenv ---
+ Detect: .bkit/.env.example exists but .bkit/.env does not. MCP servers and agent tooling will not have access to BKIT_GH_TOKEN.
+ Action: [mcp-env] Copy .bkit/.env.example to .bkit/.env and fill in your tokens (BKIT_GH_TOKEN) — in a git worktree, copy the main checkout's .bkit/.env instead, or run `bkit worktrees setup` to link it. Then run `direnv allow` to auto-export them into your shell. .bkit/.env is gitignored and safe to commit-skip.
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
+ 2. Create bkit's private settings file (bkit-env)
+    bkit's private settings file (.bkit/.env) is missing or has blank entries, so nothing that needs to sign in can. Create it and fill it in.
+    Why: This one file holds the sign-in tokens every bkit tool reads. It's never shared or committed. Most other tips depend on it, so do this one early.
+    Ask your agent: "Copy .bkit/.env.example to .bkit/.env and tell me which values I need to fill in."
+    Agent steps: `.bkit/install.md` § Local env setup.
+
+ 3. Let agents look code up directly (serena)
+    Agents are finding code by searching for words, which is slower, costs more, and misses things. Set up Serena so they can look code up directly.
+    Why: Serena lets agents look up code the way your editor does ("where is this defined, and what uses it?") instead of guessing from text search and reading whole files. That means fewer accidental changes, fewer rounds of you correcting them, and lower running costs because they read less. It can only look things up, never change your files.
+    Ask your agent: "Run `brew install uv` and `uv tool install -p 3.13 serena-agent`, copy .bkit/templates/.serena/project.yml to .serena/project.yml and .bkit/templates/scripts/serena/ to scripts/serena/, then add the `serena` server from scripts/serena/bkit-serena.mcp.json to .mcp.json (details: .bkit/templates.md § Serena)."
+    Agent steps: `.bkit/templates.md` § Serena.
+
+ 4. Automatic checks on every change (ci-workflow)
+    Nothing checks your changes automatically before they're merged, so broken code can land unnoticed. Add bkit's check workflow.
+    Why: This runs your tests and checks on GitHub every time something changes, and bkit's ship step waits for it to pass before merging. Without it, "shipped" only means "merged", not "checked".
+    Ask your agent: "Copy .bkit/templates/.github/workflows/bkit-ci.yml to .github/workflows/<the file package.json `bkit.testing.ciWorkflow` names; default bkit-ci.yml>, replace `main` and `{{NODE_VERSION}}` in it with my default branch and Node major version, and add the `typecheck`, `lint`, `format:check`, `bkit:lint:prose`, `bkit:slop:delta` and `test` scripts to package.json as listed in .bkit/templates.md § Gate tool scripts."
+    Agent steps: `.bkit/templates.md` § CI workflow and § Gate tool scripts.
+
+ 5. Catch problems before they leave your machine (husky)
+    Mistakes are only caught after changes reach GitHub. Add the local checks so they're caught the moment a change is saved to git.
+    Why: These run the same checks on your own computer, in seconds, whenever a change is committed or pushed. Without them you find out minutes later from a failed build, after the agent has moved on and fixing it costs more.
+    Ask your agent: "Run `pnpm add -D husky`, add `"prepare": "husky"` to the package.json scripts, copy .bkit/templates/.husky/pre-commit and .bkit/templates/.husky/pre-push to .husky/, and run `chmod +x .husky/pre-commit .husky/pre-push`."
+    Agent steps: `.bkit/templates.md` § Git hooks.
+
+ 6. Consistent formatting (prettier)
+    There's no shared formatting setup, so reviews fill up with spacing changes that hide the real ones. Add Prettier with bkit's ignore file.
+    Why: Prettier (a code formatter) makes every file follow the same layout. bkit's ignore file stops it reformatting bkit's own files, which would otherwise show up as false changes every time bkit updates.
+    Ask your agent: "Copy .bkit/templates/prettierignore.example to .prettierignore first, then run `pnpm add -D prettier` and add `"format:check": "prettier --check ."` to the package.json scripts."
+    Agent steps: `.bkit/templates.md` § Prettier.
+
+ 7. Catch junk code (slop-scan)
+    Nothing catches the junk code AI tends to write. Add slop-scan so new junk gets flagged before it's merged.
+    Why: Filler and dead code look fine when you skim a change, so they pile up unnoticed until the codebase is hard to trust. slop-scan flags only new problems, so it won't bury you in old ones.
+    Ask your agent: "Run `pnpm add -D slop-scan`, copy .bkit/templates/slop-scan.config.json to slop-scan.config.json and .bkit/templates/scripts/slop/ to scripts/slop/, and add `"lint:slop": "slop-scan scan ."` and `"bkit:slop:delta": "bkit ci slop"` to the package.json scripts."
+    Agent steps: `.bkit/templates.md` § slop-scan.
+
+ 8. Keep written docs tight (vale)
+    Nothing checks the project's written docs, so they slowly fill with vague, padded wording that agents then have to read. Add Vale.
+    Why: Agents read your docs and instructions on every run. Padded writing costs time and money every time it's read, and vague rules get followed vaguely. Vale (a writing checker) flags it.
+    Ask your agent: "Run `brew install vale`, copy .bkit/templates/.vale.ini to .vale.ini and .bkit/templates/.vale/styles/Bkit/ to .vale/styles/Bkit/, then run `vale sync`."
+    Agent steps: `.bkit/templates.md` § Vale.
+
+ 9. Let debugging see real errors (context-fetch)
+    When something breaks, the debug workflow can't see your live error reports or logs, so it has to guess from the code. Connect the services you use.
+    Why: This lets /bkit-debug read the actual errors from your error tracker, hosting and database. Without it the agent works from guesses, and real problems stay hidden because nothing brings in the evidence.
+    Ask your agent: "Copy the blocks for the services this project uses from .bkit/templates/context/ into .agents/context.md, below the `<!-- bkit:end -->` line, then tell me which tokens to add to .bkit/.env."
+    Agent steps: `.bkit/templates.md` § Context-fetch blocks.
+
+ 10. Keep passwords the same everywhere (secrets-sync)
+    Your deployment passwords are updated by hand in each service. Add bkit's sync tool so they're set in one place and copied everywhere.
+    Why: The same password usually lives in several places: your hosting, your database, GitHub. When one falls out of step you get "works for me, broken in production", the slowest kind of bug to find. This keeps them matching and proves it without showing any values.
+    Ask your agent: "Copy .bkit/templates/scripts/secrets/ to scripts/secrets/, fill in scripts/secrets/bkit-secrets.config.mjs for the services this project uses, then run `node scripts/secrets/bkit-secrets.mjs sync --dry-run`."
+    Agent steps: `.bkit/templates.md` § Secrets sync.
+
+ 11. Summarise long sessions earlier (compaction-window)
+    Long sessions only summarise themselves when they're nearly full, so every step re-reads a huge history, and that re-reading is most of what a run costs. Set an earlier summarise point.
+    Why: Each request re-reads the whole session so far. Left at the default, a session grows close to the model's full size before it summarises, and most subagents never summarise at all. An earlier summarise point keeps every request smaller.
+    Caution: Summaries lose some detail. A summarise point set too low can stop agents mid-run. 300,000 tokens is a starting value, not yet checked on a real build.
+    Ask your agent: "Add `"autoCompactWindow": 300000` to .claude/settings.json. For Codex, add `model_auto_compact_token_limit = 300000` at the top of .codex/config.toml, above the first `[section]`."
+    Agent steps: `.bkit/providers.md` § Context compaction. Claude Code: `"autoCompactWindow": 300000` in `.claude/settings.json`. Codex: `model_auto_compact_token_limit = 300000` in `.codex/config.toml`, above the first `[section]` header.
+
+ 12. Stop loading claude.ai connectors in this project (claude-connectors)
+    Claude Code loads every connector on your claude.ai account in this project (for example email, calendar or file storage) and sends their names with every request, even when unused. If agents here don't use them, switch them off for this project.
+    Why: Every connector's tool names are re-sent on every request, which is the largest part of the starting load you can remove. The connectors keep working in ordinary Claude chats (web and desktop app) and in cloud routines; only Claude Code in this project stops loading them.
+    Ask your agent: "Check whether agents in this project use any claude.ai connectors. If none, add `"disableClaudeAiConnectors": true` to .claude/settings.json."
+    Agent steps: `.bkit/providers.md` § claude.ai connectors. Move anything agents use through a connector onto the project's MCP file first, then set `"disableClaudeAiConnectors": true` in `.claude/settings.json`.
+
+ 13. A map of the code (graphify)
+    Optional: add graphify to keep an up-to-date map of how your code fits together.
+    Why: With a map, agents check what already exists before building it again. Without one, agents and reviews work out the structure from scratch each time. That's slower, and it's easy to miss how one change ripples into another part of the code.
+    Ask your agent: "Run `uv tool install "graphifyy[sql]"`, copy .bkit/templates/scripts/graphify/ to scripts/graphify/ and .bkit/templates/.graphifyignore to .graphifyignore, then add the graph scripts to package.json as listed in .bkit/templates.md § graphify."
+    Agent steps: `.bkit/templates.md` § graphify.
+
+ 14. Readable table changes (prettier-tables)
+    Optional: if your docs have tables, add this so editing one cell doesn't show the whole table as changed.
+    Why: Changing one cell normally reformats the whole table, so a one-word edit looks like a page of changes and reviewers can't see what actually moved.
+    Ask your agent: "Copy .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs to scripts/prettier/ and run `node scripts/prettier/bkit-insert-ignore.mjs`."
+    Agent steps: `.bkit/templates.md` § Prettier tables.
+
+ ==========================================================
+
+ [bkit-upgrade] Wrote .bkit/advisories.md (8 items).
+
+

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts:2541:32
    2539|     expect(up.status, combinedOutput(up)).toBe(0);
    2540|
    2541|     expect(combinedOutput(up)).toContain(
       |                                ^
    2542|       `bkit upgrade: no root lint-staged config — commits will fail. F…
    2543|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

 FAIL  .bkit/core/engine/commands/install/upgrade.integration.test.ts > #892 — upgrade warns about a missing root lint-staged config instead of writing one > upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts:2555:68
    2553|     expect(up.status, combinedOutput(up)).toBe(0);
    2554|
    2555|     expect(fs.existsSync(path.join(tmpDir, ".lintstagedrc.json"))).toB…
       |                                                                    ^
    2556|     expect(combinedOutput(up)).not.toContain(COPY_LINE);
    2557|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

 FAIL  .bkit/core/engine/commands/install/upgrade.integration.test.ts > #892 — upgrade warns about a missing root lint-staged config instead of writing one > upgrade prints no missing lint-staged config line when lint-staged is not a dependency
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts:2565:68
    2563|     expect(up.status, combinedOutput(up)).toBe(0);
    2564|
    2565|     expect(fs.existsSync(path.join(tmpDir, ".lintstagedrc.json"))).toB…
       |                                                                    ^
    2566|     expect(combinedOutput(up)).not.toContain(COPY_LINE);
    2567|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

 FAIL  .bkit/core/engine/commands/install/upgrade.integration.test.ts > #892 — upgrade warns about a missing root lint-staged config instead of writing one > upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts:2575:68
    2573|     expect(up.status, combinedOutput(up)).toBe(0);
    2574|
    2575|     expect(fs.existsSync(path.join(tmpDir, ".lintstagedrc.json"))).toB…
       |                                                                    ^
    2576|     expect(combinedOutput(up)).not.toContain(COPY_LINE);
    2577|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯


 Test Files  1 failed (1)
      Tests  5 failed | 67 passed (72)
   Start at  16:52:20
   Duration  166.67s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-wHd87p/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/checks/tips/detect.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/892-template-copies-bkit
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/checks/tips/detect.test.ts

```

## Runner output — `.bkit/core/engine/checks/tips/detect.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/892-template-copies-bkit
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/checks/tips/detect.test.ts

[test-timeout-budget] load average 7.8 on 10 cores: unit limits 8400ms per test, 16800ms per hook (x1.68)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/892-template-copies-bkit

 ❯ .bkit/core/engine/checks/tips/detect.test.ts (36 tests | 1 failed) 30ms
   ✓ listMcpServers (2)
     ✓ reads every host encoding 4ms
     ✓ skips malformed JSON instead of throwing 1ms
   ✓ unlockedMcpServers (3)
     ✓ flags account-wide URLs of lockable services 1ms
     ✓ passes URLs locked to one project 1ms
     ✓ flags an org-only Sentry URL 1ms
   ✓ claudeSettingsHas (2)
     ✓ reads the shared and the personal settings file 1ms
     ✓ counts an explicit false as set 1ms
   ✓ codexTopLevelHas (3)
     ✓ accepts the key above the first table header 1ms
     ✓ rejects the key inside a table, where Codex ignores it 1ms
     ✓ is false with no config file 0ms
   ❯ hasLintStagedConfig (3)
     ✓ accepts a config file or the package.json key 1ms
     ✓ accepts .lintstagedrc.json 0ms
     × hasLintStagedConfig is true for every config name lint-staged 17 reads 4ms
   ✓ hasJsTestRunner (4)
     ✓ accepts vitest under devDependencies 1ms
     ✓ accepts jest under dependencies 0ms
     ✓ accepts vitest under peerDependencies 0ms
     ✓ rejects other dependencies, including names that merely contain a runner's 0ms
   ✓ hasTestLinter (11)
     ✓ is false for a bare repo and for an ESLint config that names no test plugin 1ms
     ✓ accepts the Oxlint config .oxlintrc.json 0ms
     ✓ accepts the Oxlint config oxlint.config.ts 0ms
     ✓ accepts the Oxlint config oxlint.config.mjs 0ms
     ✓ accepts oxlint as a dependency 0ms
     ✓ accepts the ESLint config eslint.config.js naming a test plugin 1ms
     ✓ accepts the ESLint config eslint.config.mjs naming a test plugin 0ms
     ✓ accepts the ESLint config .eslintrc.json naming a test plugin 0ms
     ✓ accepts the ESLint config .eslintrc.cjs naming a test plugin 0ms
     ✓ accepts a package.json eslintConfig naming a test plugin 1ms
     ✓ rejects a package.json eslintConfig naming none 0ms
   ✓ readsBkitText (8)
     ✓ finds .claude/hooks/bkit-cloud-bootstrap.sh reading bkit output without --json 1ms
     ✓ finds scripts/cleanup/bkit-disk-prune.mjs reading bkit output without --json 1ms
     ✓ finds .github/workflows/ci.yml reading bkit output without --json 1ms
     ✓ finds .husky/pre-push reading bkit output without --json 1ms
     ✓ leaves .claude/hooks/bkit-cloud-bootstrap.sh alone 1ms
     ✓ leaves scripts/cleanup/bkit-disk-prune.mjs alone 1ms
     ✓ leaves .husky/pre-push alone 1ms
     ✓ leaves scripts/x/node_modules/y.mjs alone 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/tips/detect.test.ts > hasLintStagedConfig > hasLintStagedConfig is true for every config name lint-staged 17 reads
AssertionError: lint-staged.config.ts: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/checks/tips/detect.test.ts:145:46
    143|       fs.mkdirSync(cwd, { recursive: true });
    144|       write(file, "export default {};\n");
    145|       expect(hasLintStagedConfig(cwd), file).toBe(true);
       |                                              ^
    146|     }
    147|     for (const file of ["package.yaml", "package.yml"]) {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 35 passed (36)
   Start at  16:55:08
   Duration  195ms (tests 32%, setup 29%, import 18%, transform 18%, worker 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-9V2k32/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
